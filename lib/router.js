/**
 * Route dispatch for the dsh-elibrary Host API.
 *
 * The wire contract is deliberately small and same-origin:
 *
 *   GET    /elibrary/api/status
 *   GET    /elibrary/api/search?q=
 *   GET    /elibrary/api/recommend?theme=&region=&sort=&start=&count=
 *   GET    /elibrary/api/detail?id=
 *   GET    /elibrary/api/rank?id=book_top250&start=&count=
 *   GET    /elibrary/api/rankings
 *   GET    /elibrary/api/annual?year=2025
 *   GET    /elibrary/api/image?url=
 *   GET    /elibrary/api/library
 *   POST   /elibrary/api/books                (framed: u32 meta length, JSON, file)
 *   GET    /elibrary/api/books/:id
 *   GET    /elibrary/api/books/:id/file
 *   POST   /elibrary/api/books/:id/touch
 *   DELETE /elibrary/api/books/:id
 *   PUT    /elibrary/api/progress
 *
 * Successful answers are `{ ok: true, ... }`; failures are
 * `{ ok: false, code, message }` with a matching HTTP status.
 */

import {
  ALL_CATEGORY,
  API_PREFIX,
  MAX_BOOK_BYTES,
  MAX_BOOK_META_BYTES,
  MAX_PAGE_SIZE,
  MAX_PROGRESS_BODY_BYTES,
  MAX_START,
  RANKINGS,
  RECOMMEND_PAGE_SIZE,
  readIntParam,
  VERSION,
} from './config.js'
import {
  annualRanking,
  bookDetail,
  bookRanking,
  LibraryError as DoubanError,
  proxyCover,
  rankLanding,
  recommendBooks,
  searchBooks,
} from './douban.js'
import {
  BodyTooLargeError,
  parseRequestUrl,
  readJsonRequestBody,
  readMethod,
  readRequestBody,
  sendBinary,
  sendJson,
} from './http.js'
import { LibraryError as StorageError } from './library.js'

const JSON_METHODS = new Set(['GET', 'HEAD'])
const ALLOWED_READ = 'GET, HEAD'

/**
 * @param {{ requestTimeoutMs: number }} settings
 * @param {import('./library.js').LibraryStore} library
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void>}
 */
export function createHandler(settings, library) {
  return async function handle(req, res) {
    try {
      const target = parseRequestUrl(req)
      if (!target || !target.pathname.startsWith(API_PREFIX)) {
        sendJson(req, res, 404, {
          ok: false,
          code: 'not_found',
          message: 'Unknown e-library endpoint.',
        })
        return
      }
      const method = readMethod(req)
      const path = normalizePath(target.pathname.slice(API_PREFIX.length))
      const params = target.searchParams

      if (path === '/' || path === '/status') {
        if (!JSON_METHODS.has(method)) return methodNotAllowed(req, res, ALLOWED_READ)
        sendJson(req, res, 200, {
          ok: true,
          name: 'dsh-elibrary',
          version: VERSION,
          endpoints: ['search', 'recommend', 'detail', 'rank', 'rankings', 'annual', 'image', 'library', 'books', 'progress'],
          rankings: Object.values(RANKINGS).map(ranking => ({
            id: ranking.id,
            title: ranking.title,
            pageSize: ranking.pageSize,
          })),
          sorts: ['T', 'U', 'R', 'S'],
        })
        return
      }

      if (path === '/library') {
        if (!JSON_METHODS.has(method)) return methodNotAllowed(req, res, ALLOWED_READ)
        const result = await library.list()
        sendJson(req, res, 200, { ok: true, ...result })
        return
      }

      if (path === '/books') {
        if (method !== 'POST') return methodNotAllowed(req, res, 'POST')
        const limit = MAX_BOOK_META_BYTES + MAX_BOOK_BYTES + 4
        const body = await readRequestBody(req, limit)
        if (body.byteLength < 5) {
          throw new StorageError('invalid_book', 'The upload body is incomplete.', 400)
        }
        const metaLength = body.readUInt32BE(0)
        if (metaLength <= 0 || metaLength > MAX_BOOK_META_BYTES || metaLength + 4 > body.byteLength) {
          throw new StorageError('invalid_book', 'The upload metadata is invalid.', 400)
        }
        let parsed
        try {
          parsed = JSON.parse(body.subarray(4, 4 + metaLength).toString('utf8'))
        } catch {
          throw new StorageError('invalid_book', 'The upload metadata is not valid JSON.', 400)
        }
        const data = body.subarray(4 + metaLength)
        const summary = await library.add(parsed, data)
        sendJson(req, res, 201, { ok: true, book: summary })
        return
      }

      if (path === '/progress') {
        if (method !== 'PUT' && method !== 'POST') return methodNotAllowed(req, res, 'PUT, POST')
        const body = await readJsonRequestBody(req, MAX_PROGRESS_BODY_BYTES)
        const progress = await library.saveProgress(body)
        sendJson(req, res, 200, { ok: true, progress })
        return
      }

      if (path.startsWith('/books/')) {
        const segments = path.slice('/books/'.length).split('/').filter(Boolean)
        if (!segments.length || segments.length > 2) {
          sendJson(req, res, 404, {
            ok: false,
            code: 'not_found',
            message: 'Unknown e-library endpoint.',
          })
          return
        }
        const id = decodeURIComponent(segments[0])
        const suffix = segments[1]
        if (suffix === 'file') {
          if (!JSON_METHODS.has(method)) return methodNotAllowed(req, res, ALLOWED_READ)
          await library.stream(id, req, res)
          return
        }
        if (suffix === 'touch') {
          if (method !== 'POST') return methodNotAllowed(req, res, 'POST')
          const summary = await library.touch(id)
          sendJson(req, res, 200, { ok: true, book: summary })
          return
        }
        if (suffix) {
          sendJson(req, res, 404, {
            ok: false,
            code: 'not_found',
            message: 'Unknown e-library endpoint.',
          })
          return
        }
        if (method === 'DELETE') {
          await library.remove(id)
          sendJson(req, res, 200, { ok: true })
          return
        }
        if (!JSON_METHODS.has(method)) return methodNotAllowed(req, res, 'GET, HEAD, DELETE')
        const book = await library.get(id)
        sendJson(req, res, 200, { ok: true, book })
        return
      }

      if (!JSON_METHODS.has(method)) {
        return methodNotAllowed(req, res, ALLOWED_READ)
      }

      if (path === '/search') {
        const result = await searchBooks(params.get('q') || '', settings)
        sendJson(req, res, 200, { ok: true, ...result })
        return
      }

      if (path === '/recommend') {
        const result = await recommendBooks({
          theme: params.get('theme') || ALL_CATEGORY,
          region: params.get('region') || ALL_CATEGORY,
          sort: params.get('sort') || 'T',
          start: readIntParam(params, 'start', 0, 0, MAX_START),
          count: readIntParam(params, 'count', RECOMMEND_PAGE_SIZE, 1, MAX_PAGE_SIZE),
        }, settings)
        sendJson(req, res, 200, { ok: true, ...result })
        return
      }

      if (path === '/detail') {
        const result = await bookDetail(params.get('id') || '', settings)
        sendJson(req, res, 200, { ok: true, book: result })
        return
      }

      if (path === '/rankings') {
        if (!JSON_METHODS.has(method)) return methodNotAllowed(req, res, ALLOWED_READ)
        const result = await rankLanding(settings)
        sendJson(req, res, 200, { ok: true, ...result })
        return
      }

      if (path === '/annual') {
        if (!JSON_METHODS.has(method)) return methodNotAllowed(req, res, ALLOWED_READ)
        const result = await annualRanking(params.get('year') || '2025', settings)
        sendJson(req, res, 200, { ok: true, annual: result })
        return
      }

      if (path === '/rank') {
        const rankingId = params.get('id') || 'book_top250'
        const result = await bookRanking(rankingId, {
          start: readIntParam(params, 'start', 0, 0, MAX_START),
          count: readIntParam(params, 'count', 20, 1, MAX_PAGE_SIZE),
        }, settings)
        sendJson(req, res, 200, { ok: true, ranking: result })
        return
      }

      if (path === '/image') {
        const image = await proxyCover(params.get('url') || '')
        sendBinary(req, res, 200, image.body, {
          'content-type': image.contentType,
        })
        return
      }

      sendJson(req, res, 404, {
        ok: false,
        code: 'not_found',
        message: 'Unknown e-library endpoint.',
      })
    } catch (error) {
      const failure = toFailure(error)
      sendJson(req, res, failure.status, {
        ok: false,
        code: failure.code,
        message: failure.message,
      })
    }
  }
}

function normalizePath(value) {
  if (!value || value === '/') return '/'
  const trimmed = value.replace(/\/+$/, '')
  return trimmed || '/'
}

function methodNotAllowed(req, res, allow) {
  sendJson(req, res, 405, {
    ok: false,
    code: 'method_not_allowed',
    message: `Only ${allow} is supported here.`,
  }, { allow })
}

/**
 * @param {unknown} error
 * @returns {{ status: number, code: string, message: string }}
 */
function toFailure(error) {
  if (error instanceof DoubanError || error instanceof StorageError) {
    return { status: error.status, code: error.code, message: error.message }
  }
  if (error instanceof BodyTooLargeError) {
    return {
      status: 413,
      code: 'body_too_large',
      message: 'The request body is larger than the allowed limit.',
    }
  }
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      code: 'invalid_request',
      message: error.message || 'The request could not be parsed.',
    }
  }
  const name = error && typeof error === 'object' ? error.name : ''
  if (name === 'TimeoutError' || name === 'AbortError') {
    return {
      status: 504,
      code: 'timeout',
      message: 'The upstream request timed out.',
    }
  }
  return {
    status: 500,
    code: 'internal_error',
    message: 'The e-library request failed unexpectedly.',
  }
}
