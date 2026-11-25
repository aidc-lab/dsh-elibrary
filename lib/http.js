/**
 * Small HTTP plumbing for the dsh-elibrary Host route.
 *
 * DSH's web server hands route owners a plain Node request/response pair.
 * These helpers keep the JSON contract, byte caps and socket handling in one
 * place.
 */

import { MAX_IMAGE_BYTES } from './config.js'

/**
 * @param {import('node:http').IncomingMessage} req
 * @returns {string} upper-case method, `GET` when absent
 */
export function readMethod(req) {
  return req && typeof req.method === 'string' && req.method
    ? req.method.toUpperCase()
    : 'GET'
}

/**
 * Parse the request target without trusting the Host header.
 *
 * @param {import('node:http').IncomingMessage} req
 * @returns {{ pathname: string, searchParams: URLSearchParams } | null}
 */
export function parseRequestUrl(req) {
  const target = req && typeof req.url === 'string' && req.url ? req.url : '/'
  try {
    const url = new URL(target, 'http://elibrary.local')
    return { pathname: url.pathname, searchParams: url.searchParams }
  } catch {
    return null
  }
}

/**
 * Send a JSON response. Same-origin only: no CORS grant is attached.
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {object} payload
 * @param {Record<string, string>} [extraHeaders]
 */
export function sendJson(req, res, statusCode, payload, extraHeaders) {
  let body
  try {
    body = JSON.stringify(payload)
  } catch {
    statusCode = 500
    body = '{"ok":false,"code":"internal_error","message":"Failed to serialize the response."}'
  }
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(Buffer.byteLength(body)),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...(extraHeaders || {}),
  }
  writeResponse(res, statusCode, headers, readMethod(req) === 'HEAD' ? null : body)
}

/**
 * Read a request body while enforcing a byte cap.
 *
 * Unlike {@link readBodyWithLimit} this reads an IncomingMessage; the Host's
 * `/books` import route uses it for the framed upload body.
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {number} limit
 * @returns {Promise<Buffer>}
 */
export function readRequestBody(req, limit) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers && req.headers['content-length'])
    if (Number.isFinite(declared) && declared > limit) {
      req.resume()
      reject(new BodyTooLargeError())
      return
    }
    const chunks = []
    let total = 0
    let settled = false
    const cleanup = () => {
      req.removeListener('data', onData)
      req.removeListener('end', onEnd)
      req.removeListener('error', onError)
      req.removeListener('aborted', onAborted)
    }
    const fail = error => {
      if (settled) return
      settled = true
      cleanup()
      req.resume()
      reject(error)
    }
    const onData = chunk => {
      if (settled) return
      total += chunk.length
      if (total > limit) {
        fail(new BodyTooLargeError())
        return
      }
      chunks.push(chunk)
    }
    const onEnd = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve(Buffer.concat(chunks, total))
    }
    const onError = error => fail(error)
    const onAborted = () => fail(new Error('The request body was aborted.'))
    req.on('data', onData)
    req.on('end', onEnd)
    req.on('error', onError)
    req.on('aborted', onAborted)
  })
}

/**
 * Read and parse a JSON request body.
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {number} limit
 * @returns {Promise<any>}
 */
export async function readJsonRequestBody(req, limit) {
  const body = await readRequestBody(req, limit)
  if (!body.byteLength) return {}
  try {
    return JSON.parse(body.toString('utf8'))
  } catch {
    const error = new SyntaxError('The request body is not valid JSON.')
    error.code = 'invalid_json'
    throw error
  }
}

/**
 * Send a binary body (the cover proxy).
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {Buffer} body
 * @param {Record<string, string>} headers
 */
export function sendBinary(req, res, statusCode, body, headers) {
  const finalHeaders = {
    'cache-control': 'public, max-age=86400',
    'x-content-type-options': 'nosniff',
    'content-length': String(body.byteLength),
    ...headers,
  }
  writeResponse(res, statusCode, finalHeaders, readMethod(req) === 'HEAD' ? null : body)
}

/**
 * Write a response, tolerating a missing / destroyed / already-closed socket.
 * This is the only place that touches `res.writeHead` / `res.end`.
 *
 * @param {import('node:http').ServerResponse} res
 * @param {number} statusCode
 * @param {Record<string, string>} headers
 * @param {string | Buffer | null} body
 */
export function writeResponse(res, statusCode, headers, body) {
  if (!res || res.writableEnded || res.destroyed) return
  try {
    res.writeHead(statusCode, headers)
    res.end(body === null ? undefined : body)
  } catch {
    try {
      res.destroy()
    } catch {
      /* already gone */
    }
  }
}

/**
 * Read an upstream response body while enforcing a byte cap.
 *
 * @param {Response} response
 * @param {number} limit
 * @returns {Promise<Buffer>}
 */
export async function readBodyWithLimit(response, limit = MAX_IMAGE_BYTES) {
  const stream = response.body
  if (!stream || typeof stream.getReader !== 'function') {
    const fallback = Buffer.from(await response.arrayBuffer())
    if (fallback.byteLength > limit) throw new BodyTooLargeError()
    return fallback
  }
  const reader = stream.getReader()
  const chunks = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value || !value.byteLength) continue
      total += value.byteLength
      if (total > limit) throw new BodyTooLargeError()
      chunks.push(Buffer.from(value))
    }
  } catch (error) {
    try {
      await reader.cancel()
    } catch {
      /* body already gone */
    }
    throw error
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* already released */
    }
  }
  return Buffer.concat(chunks, total)
}

/** Internal marker for an image body over the size cap. */
export class BodyTooLargeError extends Error {
  constructor() {
    super('The response is larger than the allowed limit.')
    this.name = 'BodyTooLargeError'
  }
}

/**
 * Drop an upstream body when a response is rejected before reading it.
 *
 * @param {Response} response
 */
export function discardBody(response) {
  try {
    if (response.body && typeof response.body.cancel === 'function') {
      const pending = response.body.cancel()
      if (pending && typeof pending.catch === 'function') pending.catch(() => {})
    }
  } catch {
    /* irrelevant */
  }
}
