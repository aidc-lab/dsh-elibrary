/**
 * Douban book provider for dsh-elibrary.
 *
 * All upstream traffic stays on the Host. The browser only ever calls the
 * same-origin `/elibrary/api` route, which avoids CORS and lets covers be
 * fetched with the Referer Douban expects.
 *
 * The endpoints used here are Douban's mobile "rexxar" JSON endpoints plus the
 * public search-suggestion endpoint. They are unofficial and can change; the
 * normalizers keep the public contract stable if individual fields move.
 */

import {
  ALL_CATEGORY,
  ANNUAL_YEARS,
  FEATURED_RANKING_IDS,
  FEATURED_TYPE_RANKING_IDS,
  MAX_CATEGORY_CHARS,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_URL_CHARS,
  MAX_SEARCH_CHARS,
  RANKINGS,
  RECOMMEND_PAGE_SIZE,
  SORT_OPTIONS,
} from './config.js'
import { discardBody, readBodyWithLimit } from './http.js'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const BOOK_REFERER = 'https://book.douban.com/'
const MOBILE_REFERER = 'https://m.douban.com/'

const SEARCH_TTL_MS = 5 * 60 * 1000
const RECOMMEND_TTL_MS = 3 * 60 * 1000
const DETAIL_TTL_MS = 30 * 60 * 1000
const RANK_META_TTL_MS = 6 * 60 * 60 * 1000
const RANK_ITEMS_TTL_MS = 10 * 60 * 1000
const RANK_LANDING_TTL_MS = 3 * 60 * 1000
const ANNUAL_TTL_MS = 12 * 60 * 60 * 1000

const IMAGE_TIMEOUT_MS = 15000
const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

/** Public error type; the router maps `status` and `code` onto the wire. */
export class LibraryError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} [status]
   */
  constructor(code, message, status = 502) {
    super(message)
    this.name = 'LibraryError'
    this.code = code
    this.status = status
  }
}

/** A small promise-aware TTL cache with a bounded entry count. */
class TtlCache {
  constructor(limit = 300) {
    this.limit = limit
    this.entries = new Map()
  }

  get(key) {
    return this.entries.get(key)
  }

  set(key, entry) {
    if (this.entries.size >= this.limit && !this.entries.has(key)) {
      const oldest = this.entries.keys().next()
      if (!oldest.done) this.entries.delete(oldest.value)
    }
    this.entries.set(key, entry)
  }

  delete(key) {
    this.entries.delete(key)
  }
}

const cache = new TtlCache(300)

/**
 * Coalesce concurrent/duplicate upstream calls for a short while.
 *
 * @template T
 * @param {string} key
 * @param {number} ttlMs
 * @param {() => Promise<T>} load
 * @returns {Promise<T>}
 */
function cached(key, ttlMs, load) {
  const now = Date.now()
  const hit = cache.get(key)
  if (hit) {
    if (!hit.settled || hit.expires > now) return hit.promise
    cache.delete(key)
  }
  const entry = { promise: null, settled: false, expires: Infinity }
  entry.promise = load()
  cache.set(key, entry)
  entry.promise.then(
    () => {
      entry.settled = true
      entry.expires = Date.now() + ttlMs
    },
    () => {
      cache.delete(key)
    },
  )
  return entry.promise
}

/**
 * One GET against Douban with a browser-like identity and a hard timeout.
 *
 * @param {string} url
 * @param {{ referer: string, timeoutMs: number, accept?: string }} options
 * @returns {Promise<Response>}
 */
async function doubanFetch(url, options) {
  let response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'user-agent': USER_AGENT,
        accept: options.accept || 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.7',
        referer: options.referer,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(options.timeoutMs),
    })
  } catch (error) {
    throw networkError(error)
  }
  if (!response.ok) {
    discardBody(response)
    throw new LibraryError(
      'upstream_error',
      `Douban responded with HTTP ${response.status}.`,
    )
  }
  return response
}

/**
 * @param {string} url
 * @param {{ referer: string, timeoutMs: number }} options
 * @returns {Promise<unknown>}
 */
async function doubanJson(url, options) {
  const response = await doubanFetch(url, {
    ...options,
    accept: 'application/json, text/plain, */*',
  })
  let text
  try {
    text = await response.text()
  } catch (error) {
    throw networkError(error)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new LibraryError('upstream_error', 'Douban returned an unreadable response.')
  }
}

/**
 * @param {unknown} error
 * @returns {LibraryError}
 */
function networkError(error) {
  const name = error && typeof error === 'object' ? error.name : ''
  if (name === 'TimeoutError' || name === 'AbortError') {
    return new LibraryError('timeout', 'Douban took too long to respond.', 504)
  }
  return new LibraryError('upstream_error', 'Could not reach Douban. Check your network.')
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function stringList(value) {
  if (!Array.isArray(value)) return []
  return value
    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function ratingValue(value) {
  if (!value || typeof value !== 'object') return null
  const rating = Number(value.value)
  return Number.isFinite(rating) && rating > 0 ? Math.round(rating * 10) / 10 : null
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function ratingCount(value) {
  if (!value || typeof value !== 'object') return 0
  const count = Number(value.count ?? value.rating_count)
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
}

/**
 * Split Douban's `card_subtitle` ("[美] Author / 2019 / Publisher").
 *
 * @param {unknown} value
 * @returns {{ author: string, year: string, publisher: string }}
 */
function splitCardSubtitle(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return { author: '', year: '', publisher: '' }
  }
  const parts = value.split(' / ').map(part => part.trim()).filter(Boolean)
  const author = parts[0] || ''
  const year = parts.find(part => /^\d{4}(?:[-/.]\d{1,2})?/.test(part)) || ''
  const publisher = parts.length >= 3 ? parts[parts.length - 1] : ''
  return { author, year, publisher }
}

/**
 * @param {unknown} value
 * @returns {{ title: string, rank: number }[]}
 */
function honorList(value) {
  if (!Array.isArray(value)) return []
  const honors = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const title = typeof entry.title === 'string' ? entry.title.trim() : ''
    const rank = Number(entry.rank)
    if (!title || !Number.isFinite(rank) || rank <= 0) continue
    honors.push({ title, rank: Math.floor(rank) })
  }
  return honors
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function tagList(value) {
  if (!Array.isArray(value)) return []
  const tags = []
  const seen = new Set()
  for (const entry of value) {
    const name =
      typeof entry === 'string'
        ? entry.trim()
        : entry && typeof entry === 'object' && typeof entry.name === 'string'
          ? entry.name.trim()
          : ''
    if (!name || seen.has(name)) continue
    if (/还有其他\d+个版本/.test(name) || /Top\s*250/i.test(name)) continue
    seen.add(name)
    tags.push(name)
    if (tags.length >= 8) break
  }
  return tags
}

/**
 * Find a DOM-ish value by key across the common nested shapes.
 *
 * @param {Record<string, any>} object
 * @param {string} key
 * @returns {unknown}
 */
function first(object, key) {
  if (!object || typeof object !== 'object') return undefined
  if (object[key] !== undefined && object[key] !== null) return object[key]
  for (const value of Object.values(object)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const found = first(value, key)
      if (found !== undefined) return found
    }
  }
  return undefined
}

/**
 * Normalize one recommendation / chart row.
 *
 * @param {Record<string, any>} raw
 * @returns {Record<string, any>}
 */
function normalizeCard(raw) {
  const card = raw && typeof raw === 'object' ? raw : {}
  const subtitle = typeof card.card_subtitle === 'string' ? card.card_subtitle : ''
  const parts = splitCardSubtitle(subtitle)
  const id = card.id === undefined || card.id === null ? '' : String(card.id)
  const pic = card.pic && typeof card.pic === 'object' ? card.pic : {}
  const cover =
    (typeof pic.large === 'string' && pic.large) ||
    (typeof pic.normal === 'string' && pic.normal) ||
    (typeof card.cover_url === 'string' && card.cover_url) ||
    ''
  const intro =
    (typeof card.intro === 'string' && card.intro.trim()) ||
    (Array.isArray(card.cards)
      ? card.cards
        .filter(entry => entry && entry.kind === 'desc' && typeof entry.content === 'string')
        .map(entry => entry.content)
        .join('\n\n')
      : '') ||
    ''
  return {
    id,
    title: typeof card.title === 'string' ? card.title.trim() : '',
    author: parts.author,
    year: parts.year || (typeof card.year === 'string' ? card.year : ''),
    publisher: parts.publisher,
    subtitle,
    cover,
    intro: intro.slice(0, 1200),
    rating: ratingValue(card.rating),
    ratingCount: ratingCount(card.rating),
    tags: tagList(card.tags),
    honors: honorList(card.honor_infos),
    url:
      (typeof card.url === 'string' && card.url) ||
      (id ? `https://book.douban.com/subject/${id}/` : ''),
    hasEbook: card.has_ebook === true,
  }
}

/**
 * @param {unknown} raw
 * @returns {{ key: string, label: string, options: { value: string, label: string }[] }[]}
 */
function normalizeCategories(raw) {
  if (!Array.isArray(raw)) return []
  const groups = []
  for (const group of raw) {
    if (!group || typeof group !== 'object') continue
    const key = typeof group.type === 'string' ? group.type.trim() : ''
    if (!key) continue
    const options = []
    const seen = new Set()
    for (const entry of Array.isArray(group.data) ? group.data : []) {
      const value =
        typeof entry === 'string'
          ? entry.trim()
          : entry && typeof entry === 'object' && typeof entry.text === 'string'
            ? entry.text.trim()
            : ''
      if (!value || seen.has(value)) continue
      seen.add(value)
      options.push({ value, label: value })
    }
    if (!options.length) continue
    if (!seen.has(ALL_CATEGORY)) options.unshift({ value: ALL_CATEGORY, label: ALL_CATEGORY })
    groups.push({ key, label: key, options })
  }
  return groups
}

/**
 * @param {unknown} raw
 * @returns {{ value: string, label: string }[]}
 */
function normalizeSorts(raw) {
  const found = new Map()
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object') continue
      if (typeof entry.name === 'string' && typeof entry.text === 'string') {
        found.set(entry.name, entry.text.trim())
      }
    }
  }
  const sorts = SORT_OPTIONS.map(option => ({
    value: option.value,
    label: found.get(option.value) || option.label,
  }))
  for (const [value, label] of found) {
    if (!sorts.some(sort => sort.value === value)) sorts.push({ value, label })
  }
  return sorts
}

/**
 * @param {Record<string, any>} target
 * @returns {Record<string, any>}
 */
function normalizeSearchRich(target) {
  const raw = target && typeof target === 'object' ? target : {}
  const id = raw.id === undefined || raw.id === null ? '' : String(raw.id)
  const parts = splitCardSubtitle(raw.card_subtitle)
  const rating = ratingValue(raw.rating)
  return {
    id,
    title: typeof raw.title === 'string' ? raw.title.trim() : '',
    author: parts.author,
    year: parts.year,
    publisher: parts.publisher,
    cover: typeof raw.cover_url === 'string' ? raw.cover_url : '',
    rating,
    ratingCount: ratingCount(raw.rating),
    intro: typeof raw.intro === 'string' ? raw.intro.slice(0, 1200) : '',
    url:
      (typeof raw.url === 'string' && raw.url) ||
      (id ? `https://book.douban.com/subject/${id}/` : ''),
  }
}

/**
 * Search Douban with the suggestion endpoint (up to 10 rows) enriched by the
 * mobile search endpoint (up to 5 subjects with ratings). Either endpoint may
 * fail independently; a partial answer is better than an empty one.
 *
 * @param {string} rawQuery
 * @param {{ requestTimeoutMs: number }} settings
 * @returns {Promise<Record<string, any>>}
 */
export async function searchBooks(rawQuery, settings) {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : ''
  if (!query) {
    throw new LibraryError('invalid_request', 'Enter a book title, author, or keyword.', 400)
  }
  if (query.length > MAX_SEARCH_CHARS) {
    throw new LibraryError('invalid_request', 'The search query is too long.', 400)
  }

  return cached(`search:${query}`, SEARCH_TTL_MS, async () => {
    const suggestUrl = `https://book.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}`
    const richUrl = `https://m.douban.com/rexxar/api/v2/search?q=${encodeURIComponent(query)}&start=0&count=20`

    const [suggestResult, richResult] = await Promise.allSettled([
      doubanJson(suggestUrl, {
        referer: BOOK_REFERER,
        timeoutMs: settings.requestTimeoutMs,
      }),
      doubanJson(richUrl, {
        referer: MOBILE_REFERER,
        timeoutMs: settings.requestTimeoutMs,
      }),
    ])

    let suggestItems = []
    if (suggestResult.status === 'fulfilled' && Array.isArray(suggestResult.value)) {
      suggestItems = suggestResult.value
        .filter(entry => entry && typeof entry === 'object')
        .filter(entry => !entry.type || entry.type === 'b')
        .map(entry => {
          const id = entry.id === undefined || entry.id === null ? '' : String(entry.id)
          return {
            id,
            title: typeof entry.title === 'string' ? entry.title.trim() : '',
            author: typeof entry.author_name === 'string' ? entry.author_name.trim() : '',
            year: typeof entry.year === 'string' ? entry.year : '',
            publisher: '',
            cover: typeof entry.pic === 'string' ? entry.pic : '',
            rating: null,
            ratingCount: 0,
            intro: '',
            url:
              (typeof entry.url === 'string' && entry.url) ||
              (id ? `https://book.douban.com/subject/${id}/` : ''),
          }
        })
        .filter(entry => entry.id && entry.title)
    }

    let richItems = []
    if (richResult.status === 'fulfilled') {
      const data = richResult.value
      const subjects =
        data && typeof data === 'object' && data.subjects && Array.isArray(data.subjects.items)
          ? data.subjects.items
          : []
      richItems = subjects
        .filter(entry => entry && entry.target_type === 'book' && entry.target)
        .map(entry => normalizeSearchRich(entry.target))
        .filter(entry => entry.id && entry.title)
    }

    if (suggestResult.status === 'rejected' && richResult.status === 'rejected') {
      const error = richResult.reason
      throw error instanceof LibraryError
        ? error
        : new LibraryError('upstream_error', 'Douban search failed. Try again later.')
    }

    /** @type {Map<string, Record<string, any>>} */
    const merged = new Map()
    for (const item of suggestItems) merged.set(item.id, { ...item })
    for (const item of richItems) {
      const previous = merged.get(item.id)
      if (!previous) {
        merged.set(item.id, { ...item })
        continue
      }
      merged.set(item.id, {
        ...previous,
        author: item.author || previous.author,
        year: item.year || previous.year,
        publisher: item.publisher || previous.publisher,
        cover: item.cover || previous.cover,
        rating: item.rating ?? previous.rating,
        ratingCount: item.ratingCount || previous.ratingCount,
        intro: item.intro || previous.intro,
        url: item.url || previous.url,
      })
    }

    const items = Array.from(merged.values())
    return {
      query,
      items,
      total: items.length,
      partial: suggestResult.status === 'rejected' || richResult.status === 'rejected',
      source: 'douban',
      moreUrl: `https://search.douban.com/book/subject_search?search_text=${encodeURIComponent(query)}&cat=1001`,
    }
  })
}

/**
 * Browse Douban's recommendation feed with theme / region / sort filters.
 *
 * @param {{ theme: string, region: string, sort: string, start: number, count: number }} options
 * @param {{ requestTimeoutMs: number }} settings
 * @returns {Promise<Record<string, any>>}
 */
export async function recommendBooks(options, settings) {
  const theme = normalizeCategory(options.theme)
  const region = normalizeCategory(options.region)
  const sort = /^[TURS]$/.test(options.sort) ? options.sort : 'T'
  const start = options.start
  const count = Math.min(30, Math.max(1, options.count || RECOMMEND_PAGE_SIZE))

  const selected = {}
  if (theme && theme !== ALL_CATEGORY) selected['主题'] = theme
  if (region && region !== ALL_CATEGORY) selected['地区'] = region

  const key = `recommend:${theme}|${region}|${sort}|${start}|${count}`
  return cached(key, RECOMMEND_TTL_MS, async () => {
    const params = new URLSearchParams({
      refresh: '0',
      start: String(start),
      count: String(count),
      selected_categories: JSON.stringify(selected),
      uncollect: 'false',
      sort,
    })
    const url = `https://m.douban.com/rexxar/api/v2/book/recommend?${params.toString()}`
    const data = await doubanJson(url, {
      referer: MOBILE_REFERER,
      timeoutMs: settings.requestTimeoutMs,
    })
    if (!data || typeof data !== 'object') {
      throw new LibraryError('upstream_error', 'Douban returned an unreadable recommendation list.')
    }
    const rawItems = Array.isArray(data.items) ? data.items : []
    const total = Number.isFinite(Number(data.total)) ? Math.max(0, Math.floor(Number(data.total))) : rawItems.length
    const items = rawItems
      .slice(0, count)
      .map(normalizeCard)
      .filter(item => item.id && item.title)
    const categories = normalizeCategories(data.recommend_categories)
    return {
      items,
      start,
      count: items.length,
      total,
      hasMore: items.length > 0 && start + items.length < total,
      selected: { theme: theme || ALL_CATEGORY, region: region || ALL_CATEGORY, sort },
      categories,
      sorts: normalizeSorts(data.sorts),
      recommendTags: stringList(data.recommend_tags),
      source: 'douban',
    }
  })
}

/**
 * @param {string} rawTheme
 * @returns {string}
 */
function normalizeCategory(rawTheme) {
  if (typeof rawTheme !== 'string') return ALL_CATEGORY
  const value = rawTheme.trim().replace(/[\u0000-\u001f]/g, '')
  if (!value || value.length > MAX_CATEGORY_CHARS) return ALL_CATEGORY
  return value
}

/**
 * Full Douban subject detail for one book.
 *
 * @param {string} rawId
 * @param {{ requestTimeoutMs: number }} settings
 * @returns {Promise<Record<string, any>>}
 */
export async function bookDetail(rawId, settings) {
  const id = typeof rawId === 'string' ? rawId.trim() : ''
  if (!/^\d{1,12}$/.test(id)) {
    throw new LibraryError('invalid_request', 'Invalid Douban book id.', 400)
  }
  return cached(`detail:${id}`, DETAIL_TTL_MS, async () => {
    const url = `https://m.douban.com/rexxar/api/v2/book/${id}?for_mobile=1`
    const data = await doubanJson(url, {
      referer: MOBILE_REFERER,
      timeoutMs: settings.requestTimeoutMs,
    })
    if (!data || typeof data !== 'object' || !data.id) {
      throw new LibraryError('not_found', 'This book was not found on Douban.', 404)
    }
    const pic = data.pic && typeof data.pic === 'object' ? data.pic : {}
    const cover =
      (typeof data.cover_url === 'string' && data.cover_url) ||
      (typeof pic.large === 'string' && pic.large) ||
      (typeof pic.normal === 'string' && pic.normal) ||
      ''
    const authors = stringList(data.author)
    const translators = stringList(data.translator)
    const subtitles = stringList(data.subtitle)
    const series =
      data.book_series && typeof data.book_series === 'object'
        ? {
          title: typeof data.book_series.title === 'string' ? data.book_series.title : '',
          url: typeof data.book_series.url === 'string' ? data.book_series.url : '',
        }
        : null
    return {
      id: String(data.id),
      title: typeof data.title === 'string' ? data.title : '',
      subtitle: subtitles.join(' / '),
      author: authors,
      translator: translators,
      publisher: stringList(data.press).join(' / '),
      pubdate: stringList(data.pubdate).join(' / '),
      pages: stringList(data.pages).join(' / '),
      price: stringList(data.price).join(' / '),
      rating: ratingValue(data.rating),
      ratingCount: ratingCount(data.rating),
      ratingStars: data.rating && Number.isFinite(Number(data.rating.star_count)) ? Number(data.rating.star_count) : null,
      intro: typeof data.intro === 'string' ? data.intro.trim() : '',
      authorIntro: typeof data.author_intro === 'string' ? data.author_intro.trim() : '',
      catalog: typeof data.catalog === 'string' ? data.catalog.replace(/\r\n?/g, '\n').trim() : '',
      cover,
      url:
        (typeof data.url === 'string' && data.url) ||
        `https://book.douban.com/subject/${id}/`,
      tags: tagList(data.tags),
      honors: honorList(data.honor_infos),
      series,
      hasEbook: data.has_ebook === true,
      source: 'douban',
    }
  })
}

/**
 * One official Douban subject collection (currently the book Top 250).
 *
 * @param {string} rawRankingId
 * @param {{ start: number, count: number }} options
 * @param {{ requestTimeoutMs: number }} settings
 * @returns {Promise<Record<string, any>>}
 */
export async function bookRanking(rawRankingId, options, settings) {
  const rankingId = typeof rawRankingId === 'string' ? rawRankingId.trim() : ''
  const ranking = RANKINGS[rankingId]
  if (!ranking) {
    throw new LibraryError('not_found', 'This Douban chart is not available.', 404)
  }
  const start = options.start
  const count = Math.min(30, Math.max(1, options.count || ranking.pageSize))
  return cached(`rank:${rankingId}:${start}:${count}`, RANK_ITEMS_TTL_MS, async () => {
    const base = 'https://m.douban.com/rexxar/api/v2/subject_collection'
    const [meta, list] = await Promise.all([
      cached(`rank-meta:${rankingId}`, RANK_META_TTL_MS, () =>
        doubanJson(`${base}/${rankingId}?for_mobile=1`, {
          referer: MOBILE_REFERER,
          timeoutMs: settings.requestTimeoutMs,
        })),
      doubanJson(`${base}/${rankingId}/items?start=${start}&count=${count}&for_mobile=1`, {
        referer: MOBILE_REFERER,
        timeoutMs: settings.requestTimeoutMs,
      }),
    ])
    if (!list || typeof list !== 'object') {
      throw new LibraryError('upstream_error', 'Douban returned an unreadable chart.')
    }
    const rawItems = Array.isArray(list.subject_collection_items)
      ? list.subject_collection_items
      : []
    const items = rawItems.map((item, index) => ({
      ...normalizeCard(item),
      rank: start + index + 1,
    })).filter(item => item.id && item.title)
    const metaObject = meta && typeof meta === 'object' ? meta : {}
    const total = Number.isFinite(Number(list.total))
      ? Math.max(0, Math.floor(Number(list.total)))
      : Number.isFinite(Number(metaObject.total))
        ? Math.max(0, Math.floor(Number(metaObject.total)))
        : 250
    const cover =
      (typeof metaObject.cover_url === 'string' && metaObject.cover_url) ||
      (metaObject.pic && typeof metaObject.pic === 'object' && typeof metaObject.pic.large === 'string'
        ? metaObject.pic.large
        : '')
    return {
      id: rankingId,
      title:
        (typeof metaObject.title === 'string' && metaObject.title.trim()) || ranking.title,
      description:
        (typeof metaObject.description === 'string' && metaObject.description.trim()) ||
        ranking.description,
      cover,
      total,
      start,
      count: items.length,
      hasMore: items.length > 0 && start + items.length < total,
      items,
      source: 'douban',
    }
  })
}

/**
 * Normalize one section of a Douban annual reading list.
 *
 * @param {any} widget
 * @param {number} index
 * @returns {{ id: string, title: string, items: any[] } | null}
 */
function normalizeAnnualSection(widget, index) {
  if (!widget || typeof widget !== 'object') return null
  const source = widget.source_data && typeof widget.source_data === 'object'
    ? widget.source_data
    : {}
  const rawItems = Array.isArray(source.subject_collection_items)
    ? source.subject_collection_items
    : []
  if (!rawItems.length) return null
  const collection = source.subject_collection && typeof source.subject_collection === 'object'
    ? source.subject_collection
    : {}
  const items = rawItems.map((raw, itemIndex) => {
    const rating = raw && raw.rating && typeof raw.rating === 'object' ? raw.rating : {}
    return {
      ...normalizeCard({
        ...raw,
        rating: { value: rating.value, count: rating.rating_count },
      }),
      rank: itemIndex + 1,
    }
  }).filter(item => item.id && item.title)
  if (!items.length) return null
  return {
    id: String(collection.id || `annual-section-${index}`),
    title:
      (typeof collection.title === 'string' && collection.title.trim()) ||
      (typeof widget.title === 'string' && widget.title.trim()) ||
      `年度榜单 ${index + 1}`,
    items,
  }
}

/**
 * One year of Douban's annual book rankings.
 *
 * Douban's annual page is a small client-rendered app; the page config endpoint
 * contains every section and every book, so no browser is needed.
 *
 * @param {number|string} rawYear
 * @param {{ requestTimeoutMs: number }} settings
 * @returns {Promise<Record<string, any>>}
 */
export async function annualRanking(rawYear, settings) {
  const year = Number(rawYear)
  const meta = ANNUAL_YEARS[year]
  if (!meta) {
    throw new LibraryError('not_found', 'This annual list is not available.', 404)
  }
  return cached(`annual:${year}`, ANNUAL_TTL_MS, async () => {
    const data = await doubanJson(
      `https://book.douban.com/j/neu/page/${meta.pageId}/`,
      {
        referer: `https://book.douban.com/annual/${year}/`,
        timeoutMs: settings.requestTimeoutMs,
      },
    )
    if (!data || typeof data !== 'object' || !Array.isArray(data.widgets)) {
      throw new LibraryError('upstream_error', 'Douban returned an unreadable annual list.')
    }
    const sections = data.widgets
      .map((widget, index) => normalizeAnnualSection(widget, index))
      .filter(Boolean)
    if (!sections.length) {
      throw new LibraryError('upstream_error', 'This annual list has no sections.')
    }
    return {
      year,
      title:
        (typeof data.title === 'string' && data.title.trim()) || meta.title,
      sections,
      source: 'douban',
    }
  })
}

/**
 * Landing data for the rankings page: featured charts, type charts and the
 * available annual lists with their section titles.
 *
 * @param {{ requestTimeoutMs: number }} settings
 * @returns {Promise<Record<string, any>>}
 */
export async function rankLanding(settings) {
  return cached('rank-landing', RANK_LANDING_TTL_MS, async () => {
    const base = 'https://m.douban.com/rexxar/api/v2/subject_collection'
    const [listResult, ...metaResults] = await Promise.allSettled([
      doubanJson('https://m.douban.com/rexxar/api/v2/book/rank_list?start=0&count=20', {
        referer: MOBILE_REFERER,
        timeoutMs: settings.requestTimeoutMs,
      }),
      ...FEATURED_TYPE_RANKING_IDS.map(id =>
        doubanJson(`${base}/${id}?for_mobile=1`, {
          referer: MOBILE_REFERER,
          timeoutMs: settings.requestTimeoutMs,
        })),
    ])
    const listData = listResult.status === 'fulfilled' && listResult.value && typeof listResult.value === 'object'
      ? listResult.value
      : {}
    const collections = Array.isArray(listData.selected_collections)
      ? listData.selected_collections
      : []
    const byId = new Map()
    for (const collection of collections) {
      if (!collection || typeof collection !== 'object') continue
      const id = String(collection.id || '')
      if (!id) continue
      byId.set(id, collection)
    }
    const charts = FEATURED_RANKING_IDS
      .filter(id => id === 'book_hot_monthly' || id === 'book_top250')
      .map(id => {
        const collection = byId.get(id)
        const ranking = RANKINGS[id]
        if (!collection && !ranking) return null
        const items = Array.isArray(collection && collection.items) ? collection.items : []
        return {
          id,
          title: (collection && collection.name) || ranking.title,
          description: (collection && collection.description) || ranking.description,
          cover: (collection && collection.cover_url) || '',
          total: Number(collection && collection.total) || 0,
          items: items.slice(0, 3).map((item, index) => ({
            ...normalizeCard(item),
            rank: index + 1,
          })).filter(item => item.id && item.title),
          mode: 'rank',
        }
      })
      .filter(Boolean)
    const types = FEATURED_TYPE_RANKING_IDS.map((id, index) => {
      const result = metaResults[index]
      const meta = result && result.status === 'fulfilled' && result.value && typeof result.value === 'object'
        ? result.value
        : {}
      const fallback = RANKINGS[id]
      if (!fallback) return null
      return {
        id,
        title: (typeof meta.title === 'string' && meta.title.trim()) || fallback.title,
        description: (typeof meta.description === 'string' && meta.description.trim()) || fallback.description,
        cover:
          (typeof meta.cover_url === 'string' && meta.cover_url) ||
          (meta.pic && typeof meta.pic === 'object' && typeof meta.pic.large === 'string' ? meta.pic.large : ''),
        total: Number(meta.total) || 100,
        mode: 'rank',
      }
    }).filter(Boolean)
    const years = Object.keys(ANNUAL_YEARS).map(Number).sort((a, b) => b - a)
    const annualResults = await Promise.allSettled(years.map(year => annualRanking(year, settings)))
    const annual = years.map((year, index) => {
      const result = annualResults[index]
      const data = result && result.status === 'fulfilled' ? result.value : null
      if (!data) {
        return { year, title: ANNUAL_YEARS[year].title, sections: [] }
      }
      return {
        year,
        title: data.title,
        sections: data.sections.map(section => ({
          id: section.id,
          title: section.title,
          count: section.items.length,
          cover: section.items[0] ? section.items[0].cover : '',
        })),
      }
    })
    return { charts, types, annual, source: 'douban' }
  })
}

/**
 * Proxy one Douban cover. Only allowlisted Douban hosts are fetched.
 *
 * @param {string} rawUrl
 * @returns {Promise<{ body: Buffer, contentType: string }>}
 */
export async function proxyCover(rawUrl) {
  const raw = typeof rawUrl === 'string' ? rawUrl.trim() : ''
  if (!raw || raw.length > MAX_IMAGE_URL_CHARS) {
    throw new LibraryError('invalid_request', 'Invalid image URL.', 400)
  }
  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    throw new LibraryError('invalid_request', 'Invalid image URL.', 400)
  }
  if (!isDoubanHost(parsed.hostname)) {
    throw new LibraryError('invalid_request', 'Only Douban image hosts are proxied.', 400)
  }
  parsed.protocol = 'https:'
  parsed.hash = ''

  let response
  try {
    response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: {
        'user-agent': USER_AGENT,
        accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.7',
        referer: BOOK_REFERER,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
    })
  } catch (error) {
    throw networkError(error)
  }

  if (!response.ok) {
    discardBody(response)
    throw new LibraryError(
      'upstream_error',
      `Douban image responded with HTTP ${response.status}.`,
    )
  }

  let finalHost = ''
  try {
    finalHost = new URL(response.url).hostname
  } catch {
    finalHost = parsed.hostname
  }
  if (!isDoubanHost(finalHost)) {
    discardBody(response)
    throw new LibraryError('upstream_error', 'The image was redirected to an unapproved host.')
  }

  const rawType = (response.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase()
  if (!IMAGE_TYPES.has(rawType)) {
    discardBody(response)
    throw new LibraryError('upstream_error', 'The upstream resource is not a supported image.')
  }
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_IMAGE_BYTES) {
    discardBody(response)
    throw new LibraryError('upstream_error', 'The image is larger than the size limit.')
  }

  let body
  try {
    body = await readBodyWithLimit(response, MAX_IMAGE_BYTES)
  } catch (error) {
    if (error && error.name === 'BodyTooLargeError') {
      throw new LibraryError('upstream_error', 'The image is larger than the size limit.')
    }
    throw networkError(error)
  }
  if (!body.byteLength) {
    throw new LibraryError('upstream_error', 'The image was empty.')
  }
  return { body, contentType: rawType }
}

/**
 * @param {string} hostname
 * @returns {boolean}
 */
function isDoubanHost(hostname) {
  const host = String(hostname || '').toLowerCase()
  return (
    host === 'douban.com' ||
    host.endsWith('.douban.com') ||
    host === 'doubanio.com' ||
    host.endsWith('.doubanio.com')
  )
}

/**
 * Expose the small helpers for the Host route tests.
 */
export const testing = {
  splitCardSubtitle,
  normalizeCard,
  normalizeCategories,
  normalizeSorts,
  tagList,
  first,
  isDoubanHost,
}
