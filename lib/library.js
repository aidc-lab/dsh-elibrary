/**
 * Host-side library storage for dsh-elibrary.
 *
 * Books and reading positions must survive more than one browser session, so
 * they live in a small, human-readable directory under the DSH home instead of
 * browser storage. The layout is:
 *
 *   <root>/library.json          book summaries, ordered for the shelf
 *   <root>/progress.json         per-book reading positions
 *   <root>/meta/<id>.json        full parsed book structure (spine, chapters)
 *   <root>/files/<id>.<epub|txt>
 *
 * Every JSON write is atomic (temp file + rename) and serialized through one
 * chain, and the API never exposes a caller-supplied path.
 */

import { createReadStream, promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  MAX_BOOK_BYTES,
  MAX_CHAPTERS,
  MAX_COVER_CHARS,
  MAX_SPINE_ITEMS,
} from './config.js'

const LIBRARY_VERSION = 1
const PROGRESS_VERSION = 1

/**
 * A request-shaped failure the router can render directly.
 */
export class LibraryError extends Error {
  /**
   * @param {string} code stable machine code
   * @param {string} message human-readable detail
   * @param {number} [status] HTTP status
   */
  constructor(code, message, status = 500) {
    super(message)
    this.name = 'LibraryError'
    this.code = code
    this.status = status
  }
}

/**
 * Resolve the persistent library directory.
 *
 * `DSH_ELIBRARY_DATA_DIR` exists for tests; normal installs use
 * `$DSH_HOME/elibrary` (usually `~/.dsh/elibrary`).
 *
 * @returns {string}
 */
export function resolveDataDir() {
  const override = process.env.DSH_ELIBRARY_DATA_DIR
  if (typeof override === 'string' && override.trim()) return path.resolve(override.trim())
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'elibrary')
}

/**
 * One durable library rooted at a directory. Construct once per plugin row.
 */
export class LibraryStore {
  /**
   * @param {string} [root]
   */
  constructor(root = resolveDataDir()) {
    this.root = root
    this.libraryPath = path.join(root, 'library.json')
    this.progressPath = path.join(root, 'progress.json')
    this.metaDir = path.join(root, 'meta')
    this.filesDir = path.join(root, 'files')
    this.library = { version: LIBRARY_VERSION, books: [] }
    this.progress = { version: PROGRESS_VERSION, items: {} }
    this.loaded = null
    this.chain = Promise.resolve()
  }

  /**
   * Load state once. A failed load is retried on the next request instead of
   * bricking the route for the rest of the session.
   *
   * @returns {Promise<void>}
   */
  async ready() {
    if (this.loaded) return this.loaded
    this.loaded = this.load().catch(error => {
      this.loaded = null
      throw error
    })
    return this.loaded
  }

  async load() {
    await fs.mkdir(this.root, { recursive: true, mode: 0o700 })
    await fs.mkdir(this.metaDir, { recursive: true, mode: 0o700 })
    await fs.mkdir(this.filesDir, { recursive: true, mode: 0o700 })
    this.library = await readJsonSafe(this.libraryPath, {
      version: LIBRARY_VERSION,
      books: [],
    })
    this.progress = await readJsonSafe(this.progressPath, {
      version: PROGRESS_VERSION,
      items: {},
    })
    if (!Array.isArray(this.library.books)) this.library.books = []
    if (!this.progress.items || typeof this.progress.items !== 'object') {
      this.progress.items = {}
    }
    this.library.version = LIBRARY_VERSION
    this.progress.version = PROGRESS_VERSION
  }

  /**
   * @param {() => Promise<any>} work
   * @returns {Promise<any>}
   */
  enqueue(work) {
    const run = this.chain.then(work, work)
    this.chain = run.catch(() => {})
    return run
  }

  /**
   * Shelf view: summaries plus every reading position.
   *
   * @returns {Promise<{ books: object[], progress: Record<string, object> }>}
   */
  async list() {
    await this.ready()
    const books = [...this.library.books].sort((a, b) => {
      const left = Number(a.lastOpenedAt || a.addedAt || 0)
      const right = Number(b.lastOpenedAt || b.addedAt || 0)
      return right - left
    })
    return { books, progress: { ...this.progress.items } }
  }

  /**
   * Full parsed book, including its spine.
   *
   * @param {string} id
   * @returns {Promise<object>}
   */
  async get(id) {
    await this.ready()
    const bookId = requireId(id)
    const summary = this.library.books.find(book => book.id === bookId)
    if (!summary) throw new LibraryError('not_found', 'This book is not on the shelf.', 404)
    try {
      const raw = await fs.readFile(this.metaPath(bookId), 'utf8')
      const book = JSON.parse(raw)
      return { ...book, id: bookId, ...summary }
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        throw new LibraryError('not_found', 'This book file is missing.', 404)
      }
      throw new LibraryError('library_unavailable', 'The book metadata could not be read.', 500)
    }
  }

  /**
   * Path and metadata for streaming a book file.
   *
   * @param {string} id
   * @returns {Promise<{ filePath: string, fileName: string, format: string, size: number }>}
   */
  async file(id) {
    await this.ready()
    const bookId = requireId(id)
    const summary = this.library.books.find(book => book.id === bookId)
    if (!summary) throw new LibraryError('not_found', 'This book is not on the shelf.', 404)
    const filePath = this.filePath(bookId, summary.format)
    try {
      const stat = await fs.stat(filePath)
      return {
        filePath,
        fileName: summary.fileName || `${summary.title}.${summary.format}`,
        format: summary.format,
        size: stat.size,
      }
    } catch {
      throw new LibraryError('not_found', 'This book file is missing.', 404)
    }
  }

  /**
   * Stream a book file into the response.
   *
   * @param {string} id
   * @param {import('node:http').ServerResponse} res
   * @param {import('node:http').IncomingMessage} req
   */
  async stream(id, req, res) {
    const info = await this.file(id)
    const contentType = info.format === 'epub'
      ? 'application/epub+zip'
      : 'text/plain; charset=utf-8'
    if (!res || res.writableEnded || res.destroyed) return
    res.writeHead(200, {
      'content-type': contentType,
      'content-length': String(info.size),
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': `inline; filename*=UTF-8''${encodeRFC5987(info.fileName)}`,
    })
    if ((req.method || '').toUpperCase() === 'HEAD') {
      res.end()
      return
    }
    const stream = createReadStream(info.filePath)
    stream.on('error', () => {
      try {
        res.destroy()
      } catch {
        /* client is already gone */
      }
    })
    stream.pipe(res)
  }

  /**
   * Add a parsed book. `book` is the client-side parse result; `data` is the
   * original file bytes.
   *
   * @param {object} book
   * @param {Buffer} data
   * @returns {Promise<object>} shelf summary
   */
  async add(book, data) {
    await this.ready()
    if (!Buffer.isBuffer(data) || data.byteLength === 0) {
      throw new LibraryError('invalid_book', 'The book file is empty.', 400)
    }
    if (data.byteLength > MAX_BOOK_BYTES) {
      throw new LibraryError('book_too_large', 'The book file is too large.', 413)
    }
    const clean = sanitizeBook(book, data.byteLength)
    const id = crypto.randomUUID()
    const now = Date.now()
    const full = { ...clean, id, addedAt: now, lastOpenedAt: null }
    const summary = summarize(full)
    const filePath = this.filePath(id, clean.format)
    const metaPath = this.metaPath(id)
    try {
      await fs.writeFile(filePath, data, { mode: 0o600 })
      await fs.writeFile(metaPath, JSON.stringify(full), { mode: 0o600 })
    } catch {
      await Promise.allSettled([
        fs.rm(filePath, { force: true }),
        fs.rm(metaPath, { force: true }),
      ])
      throw new LibraryError('library_unavailable', 'The book could not be saved.', 500)
    }
    this.library.books.unshift(summary)
    try {
      await this.persistLibrary()
    } catch (error) {
      await Promise.allSettled([
        fs.rm(filePath, { force: true }),
        fs.rm(metaPath, { force: true }),
      ])
      this.library.books = this.library.books.filter(item => item.id !== id)
      throw error
    }
    return summary
  }

  /**
   * Delete a book, its metadata and its position.
   *
   * @param {string} id
   * @returns {Promise<void>}
   */
  async remove(id) {
    await this.ready()
    const bookId = requireId(id)
    const index = this.library.books.findIndex(book => book.id === bookId)
    if (index < 0) throw new LibraryError('not_found', 'This book is not on the shelf.', 404)
    const summary = this.library.books[index]
    this.library.books.splice(index, 1)
    delete this.progress.items[bookId]
    await this.persistLibrary()
    await this.persistProgress()
    await Promise.allSettled([
      fs.rm(this.filePath(bookId, summary.format), { force: true }),
      fs.rm(this.metaPath(bookId), { force: true }),
    ])
  }

  /**
   * Record that a book was just opened, so the shelf can put it first.
   *
   * @param {string} id
   * @returns {Promise<object>}
   */
  async touch(id) {
    await this.ready()
    const bookId = requireId(id)
    const summary = this.library.books.find(book => book.id === bookId)
    if (!summary) throw new LibraryError('not_found', 'This book is not on the shelf.', 404)
    summary.lastOpenedAt = Date.now()
    await this.persistLibrary()
    return summary
  }

  /**
   * Save a reading position.
   *
   * @param {{ bookId: string, chapterIndex: number, scrollRatio: number }} input
   * @returns {Promise<object>}
   */
  async saveProgress(input) {
    await this.ready()
    const source = input && typeof input === 'object' ? input : {}
    const bookId = requireId(source.bookId)
    const summary = this.library.books.find(book => book.id === bookId)
    if (!summary) throw new LibraryError('not_found', 'This book is not on the shelf.', 404)
    const chapterIndex = toInteger(source.chapterIndex, 0, 0, MAX_CHAPTERS - 1)
    const scrollRatio = clampNumber(Number(source.scrollRatio), 0, 1)
    const progress = {
      bookId,
      chapterIndex,
      scrollRatio,
      updatedAt: Date.now(),
    }
    this.progress.items[bookId] = progress
    await this.persistProgress()
    return progress
  }

  persistLibrary() {
    const json = JSON.stringify(this.library)
    return this.enqueue(() => atomicWrite(this.libraryPath, json))
  }

  persistProgress() {
    const json = JSON.stringify(this.progress)
    return this.enqueue(() => atomicWrite(this.progressPath, json))
  }

  filePath(id, format) {
    return path.join(this.filesDir, `${id}.${format === 'txt' ? 'txt' : 'epub'}`)
  }

  metaPath(id) {
    return path.join(this.metaDir, `${id}.json`)
  }
}

/**
 * Validate and normalize the client parse result into a stored book.
 *
 * @param {any} value
 * @param {number} size
 * @returns {object}
 */
function sanitizeBook(value, size) {
  const source = value && typeof value === 'object' ? value : {}
  const format = source.format === 'txt' ? 'txt' : source.format === 'epub' ? 'epub' : ''
  if (!format) throw new LibraryError('invalid_book', 'Only EPUB and TXT books are supported.', 400)
  const title = clipText(source.title, 300) || 'Untitled'
  const author = clipText(source.author, 300)
  const fileName = clipText(source.fileName, 300) || `${title}.${format}`
  const chapterCount = toInteger(source.chapterCount, 0, 0, MAX_CHAPTERS)
  if (format === 'epub') {
    const spine = Array.isArray(source.spine)
      ? source.spine.slice(0, MAX_SPINE_ITEMS).map(item => ({
          href: clipText(item && item.href, 2000),
          label: clipText(item && item.label, 300),
          mediaType: clipText(item && item.mediaType, 100),
        })).filter(item => item.href)
      : []
    if (!spine.length) throw new LibraryError('invalid_book', 'This EPUB has no readable chapters.', 400)
    const toc = Array.isArray(source.toc)
      ? source.toc.slice(0, MAX_SPINE_ITEMS).map(item => ({
          label: clipText(item && item.label, 300),
          index: toInteger(item && item.index, 0, 0, spine.length - 1),
        }))
      : []
    return {
      title,
      author,
      format,
      fileName,
      size,
      chapterCount: spine.length,
      cover: readCover(source.cover),
      description: clipText(source.description, 4000),
      publisher: clipText(source.publisher, 200),
      language: clipText(source.language, 40),
      identifier: clipText(source.identifier, 200),
      date: clipText(source.date, 40),
      spine,
      toc,
      encoding: clipText(source.encoding, 40),
      textLength: toInteger(source.textLength, 0, 0, 1e9),
    }
  }
  const chapters = Array.isArray(source.chapters)
    ? source.chapters.slice(0, MAX_CHAPTERS).map(item => ({
        label: clipText(item && item.label, 300),
        start: toInteger(item && item.start, 0, 0, 1e9),
        end: toInteger(item && item.end, 0, 0, 1e9),
      })).filter(item => item.end > item.start)
    : []
  if (!chapters.length) throw new LibraryError('invalid_book', 'This TXT has no readable text.', 400)
  return {
    title,
    author,
    format,
    fileName,
    size,
    chapterCount: chapters.length,
    cover: readCover(source.cover),
    description: '',
    publisher: '',
    language: '',
    identifier: '',
    date: '',
    spine: [],
    toc: [],
    chapters,
    encoding: clipText(source.encoding, 40),
    textLength: toInteger(source.textLength, 0, 0, 1e9),
  }
}

/**
 * @param {object} book
 * @returns {object}
 */
function summarize(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    format: book.format,
    fileName: book.fileName,
    size: book.size,
    chapterCount: book.chapterCount,
    cover: book.cover,
    description: book.description,
    addedAt: book.addedAt,
    lastOpenedAt: book.lastOpenedAt,
  }
}

function readCover(value) {
  if (typeof value !== 'string') return ''
  if (!/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(value)) return ''
  return value.length <= MAX_COVER_CHARS ? value : ''
}

function requireId(value) {
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/i.test(value)) {
    throw new LibraryError('invalid_book', 'That book id is not valid.', 400)
  }
  return value
}

function clipText(value, limit) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, limit)
}

function toInteger(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.floor(number)))
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function encodeRFC5987(value) {
  return encodeURIComponent(value).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16)}`)
}

async function readJsonSafe(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return fallback
    return parsed
  } catch (error) {
    if (error && error.code === 'ENOENT') return fallback
    const backup = `${filePath}.bad-${Date.now()}`
    try {
      await fs.rename(filePath, backup)
    } catch {
      /* leave the original in place if it cannot be moved */
    }
    return fallback
  }
}

async function atomicWrite(filePath, content) {
  const temp = `${filePath}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`
  await fs.writeFile(temp, content, { mode: 0o600 })
  await fs.rename(temp, filePath)
}
