/**
 * dsh-elibrary Host configuration and request bounds.
 *
 * Plain ESM with no dependencies so the plugin stays a single package that the
 * DSH profile can load directly from disk.
 */

export const API_PREFIX = '/elibrary/api'
export const VERSION = '0.2.0'

export const DEFAULT_REQUEST_TIMEOUT_MS = 10000
export const MIN_REQUEST_TIMEOUT_MS = 2000
export const MAX_REQUEST_TIMEOUT_MS = 30000

export const MAX_SEARCH_CHARS = 80
export const MAX_CATEGORY_CHARS = 24
export const MAX_IMAGE_URL_CHARS = 2048
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

/** Imported books are parsed in the browser, so the Host only moves bytes. */
export const MAX_BOOK_BYTES = 80 * 1024 * 1024
export const MAX_BOOK_META_BYTES = 4 * 1024 * 1024
export const MAX_COVER_CHARS = 900000
export const MAX_SPINE_ITEMS = 6000
export const MAX_CHAPTERS = 4000
export const MAX_PROGRESS_BODY_BYTES = 4096

export const RECOMMEND_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 30
export const MAX_START = 5000

export const SORT_OPTIONS = Object.freeze([
  Object.freeze({ value: 'T', label: '综合排序' }),
  Object.freeze({ value: 'U', label: '近期热度' }),
  Object.freeze({ value: 'R', label: '出版时间' }),
  Object.freeze({ value: 'S', label: '高分优先' }),
])

export const RANKINGS = Object.freeze({
  book_hot_monthly: Object.freeze({
    id: 'book_hot_monthly',
    title: '每月热门图书榜',
    description: '每月读者关注度最高的新书。',
    pageSize: 20,
  }),
  book_top250: Object.freeze({
    id: 'book_top250',
    title: '豆瓣图书 Top250',
    description: '豆瓣读者共同选出的 250 本好书。',
    pageSize: 20,
  }),
  ECY45E4YA: Object.freeze({
    id: 'ECY45E4YA',
    title: '豆瓣外国小说 Top100',
    description: '外国小说里最受豆瓣读者欢迎的一百本。',
    pageSize: 20,
  }),
  ECLA5GW3A: Object.freeze({
    id: 'ECLA5GW3A',
    title: '豆瓣中国文学（非虚构）Top100',
    description: '中国非虚构写作的一百本代表作。',
    pageSize: 20,
  }),
  ECT45OM5A: Object.freeze({
    id: 'ECT45OM5A',
    title: '豆瓣推理小说 Top100',
    description: '从本格到社会派，推理迷的百本清单。',
    pageSize: 20,
  }),
  ECPU5ODVQ: Object.freeze({
    id: 'ECPU5ODVQ',
    title: '豆瓣科幻小说 Top100',
    description: '从黄金时代到当代科幻的百本精选。',
    pageSize: 20,
  }),
  ECYA5J45Q: Object.freeze({
    id: 'ECYA5J45Q',
    title: '豆瓣历史类图书 Top100',
    description: '理解过去与当下的一百本历史书。',
    pageSize: 20,
  }),
  ECYQ5U4II: Object.freeze({
    id: 'ECYQ5U4II',
    title: '豆瓣科普类图书 Top100',
    description: '把复杂世界讲清楚的科普好书。',
    pageSize: 20,
  }),
  ECEI5P75I: Object.freeze({
    id: 'ECEI5P75I',
    title: '豆瓣传记类图书 Top100',
    description: '一百种真实人生的切面。',
    pageSize: 20,
  }),
  ECXA5LZLI: Object.freeze({
    id: 'ECXA5LZLI',
    title: '豆瓣戏剧作品 Top100',
    description: '舞台与文本之间的一百部戏剧。',
    pageSize: 20,
  }),
  ECW45Q5OY: Object.freeze({
    id: 'ECW45Q5OY',
    title: '豆瓣电影类图书 Top100',
    description: '关于电影、导演与影像的书。',
    pageSize: 20,
  }),
})

export const FEATURED_RANKING_IDS = Object.freeze([
  'book_hot_monthly',
  'book_top250',
  'ECY45E4YA',
  'ECLA5GW3A',
  'ECT45OM5A',
  'ECPU5ODVQ',
  'ECYA5J45Q',
  'ECYQ5U4II',
  'ECEI5P75I',
  'ECXA5LZLI',
  'ECW45Q5OY',
])

export const FEATURED_TYPE_RANKING_IDS = Object.freeze([
  'ECY45E4YA',
  'ECLA5GW3A',
  'ECT45OM5A',
  'ECPU5ODVQ',
  'ECYA5J45Q',
  'ECYQ5U4II',
  'ECEI5P75I',
  'ECXA5LZLI',
  'ECW45Q5OY',
])

export const ANNUAL_YEARS = Object.freeze({
  2025: Object.freeze({ pageId: 34, title: '豆瓣2025年度读书榜单' }),
  2024: Object.freeze({ pageId: 28, title: '豆瓣2024年度读书榜单' }),
  2023: Object.freeze({ pageId: 21, title: '豆瓣2023年度读书榜单' }),
})

export const ALL_CATEGORY = '全部'

/**
 * Resolve the plugin row config into a frozen settings object.
 *
 * @param {unknown} config
 * @returns {{ requestTimeoutMs: number }}
 */
export function normalizeSettings(config) {
  const source = config && typeof config === 'object' ? config : {}
  const raw = Number(source.requestTimeoutMs)
  const requestTimeoutMs = Number.isFinite(raw)
    ? Math.min(MAX_REQUEST_TIMEOUT_MS, Math.max(MIN_REQUEST_TIMEOUT_MS, Math.floor(raw)))
    : DEFAULT_REQUEST_TIMEOUT_MS
  return Object.freeze({ requestTimeoutMs })
}

/**
 * Parse a bounded integer query parameter.
 *
 * @param {URLSearchParams} params
 * @param {string} name
 * @param {number} fallback
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function readIntParam(params, name, fallback, min, max) {
  const raw = params.get(name)
  if (raw === null || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.floor(value)))
}
