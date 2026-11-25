window.__ModuleLoader__.load({
  id: 'dsh-elibrary',
  factory(require) {
    'use strict'

    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React

    const NS = 'elibrary'
    const PANEL_ID = 'elibrary'
    const API_BASE = '/elibrary/api'
    const SETTINGS_KEY = 'dsh-elibrary.reader-settings'
    const MAX_EPUB_BYTES = 80 * 1024 * 1024
    const MAX_TXT_BYTES = 30 * 1024 * 1024
    const MAX_COVER_BYTES = 6 * 1024 * 1024
    const MAX_CHAPTER_BYTES = 12 * 1024 * 1024
    const MAX_EMBED_IMAGE_BYTES = 12 * 1024 * 1024
    const MAX_EMBED_IMAGES = 40
    const DEFAULT_READER_SETTINGS = { fontSize: 18, lineHeight: 1.8, serif: true }

    const ZH = {
      'panel': '电子图书馆',
      'title': '电子图书馆',
      'subtitle': '把书读慢一点',
      'tabs.shelf': '书架',
      'tabs.discover': '发现',
      'tabs.rankings': '榜单',
      'time.justNow': '刚刚',
      'time.minutesAgo': '{count} 分钟前',
      'time.hoursAgo': '{count} 小时前',
      'time.daysAgo': '{count} 天前',
      'shelf.import': '导入电子书',
      'shelf.importing': '正在导入…',
      'shelf.search': '搜索书名或作者',
      'shelf.sort.recent': '最近阅读',
      'shelf.sort.added': '最近导入',
      'shelf.sort.title': '书名',
      'shelf.emptyTitle': '书架还是空的',
      'shelf.emptyHint': '导入一本 EPUB 或 TXT，从一个安静的夜晚开始。',
      'shelf.emptyAction': '导入第一本书',
      'shelf.emptySearch': '没有找到匹配的书',
      'shelf.count': '{count} 本',
      'shelf.progress': '已读 {percent}%',
      'shelf.unread': '尚未开始',
      'shelf.finished': '已读完',
      'shelf.readNow': '继续阅读',
      'shelf.imported': '已导入 {count} 本',
      'shelf.importSkipped': '{count} 本已在书架里',
      'shelf.importFailed': '导入失败：{name}',
      'shelf.importUnsupported': '仅支持 EPUB 和 TXT 文件',
      'shelf.importTooLarge': '文件过大，最大 {size} MB',
      'shelf.importEmpty': '这个文件没有可阅读的内容',
      'shelf.importBadFile': '文件已损坏，无法读取',
      'shelf.delete': '从书架移除',
      'shelf.deleteConfirmTitle': '移除《{title}》？',
      'shelf.deleteConfirmText': '本地文件和阅读进度会一起删除。',
      'shelf.deleteConfirm': '移除',
      'shelf.deleted': '已从书架移除',
      'shelf.cancel': '取消',
      'shelf.openFailed': '打开失败：{message}',
      'shelf.formatEpub': 'EPUB',
      'shelf.formatTxt': 'TXT',
      'shelf.chapterCount': '{count} 章',
      'shelf.filterAll': '全部',
      'shelf.unknownAuthor': '未知作者',
      'reader.back': '书架',
      'reader.toc': '目录',
      'reader.tocTitle': '目录',
      'reader.tocEmpty': '这本书没有目录',
      'reader.settings': '阅读设置',
      'reader.fontSize': '字号',
      'reader.lineHeight': '行距',
      'reader.serif': '衬线体',
      'reader.serifOn': '宋体',
      'reader.serifOff': '黑体',
      'reader.prev': '上一章',
      'reader.next': '下一章',
      'reader.chapterIndex': '第 {current} / {total} 章',
      'reader.percent': '{percent}%',
      'reader.loading': '正在打开…',
      'reader.rendering': '正在排版…',
      'reader.empty': '这一章没有内容',
      'reader.chapterFailed': '章节加载失败',
      'reader.retry': '重试',
      'reader.part': '第 {n} 部分',
      'reader.untitled': '无标题章节',
      'shelf.untitled': '未命名',
      'reader.finishedBook': '全书读完',
      'reader.keyboardHint': '← → 翻章',
      'reader.imageFailed': '图片未能载入',
      'reader.chapter': '第 {n} 章',
      'reader.noMorePrev': '已经是第一章',
      'reader.noMoreNext': '已经是最后一章',
      'discover.searchPlaceholder': '搜索豆瓣图书、作者',
      'discover.search': '搜索',
      'discover.searchAria': '搜索豆瓣图书',
      'discover.searching': '正在搜索…',
      'discover.searchResults': '“{query}” 的搜索结果',
      'discover.searchEmpty': '豆瓣没有找到相关图书',
      'discover.searchError': '搜索失败，请稍后再试',
      'discover.searchMore': '在豆瓣搜索更多',
      'discover.feedStale': '更新失败，当前显示上一次结果',
      'discover.recommend': '推荐',
      'discover.filter': '筛选',
      'discover.rank': '榜单',
      'discover.forYou': '豆瓣推荐',
      'discover.recommendSub': '豆瓣读者正在读的书',
      'discover.refresh': '换一批',
      'discover.filters': '筛选条件',
      'discover.theme': '主题',
      'discover.region': '地区',
      'discover.sort': '排序',
      'discover.apply': '应用筛选',
      'discover.reset': '重置',
      'discover.total': '共 {count} 本',
      'discover.loadMore': '加载更多',
      'discover.loading': '正在加载…',
      'discover.empty': '暂时没有可展示的书',
      'discover.retry': '重试',
      'discover.error': '加载失败',
      'discover.rankTitle': '豆瓣榜单',
      'discover.rankSub': '豆瓣读书 Top250',
      'discover.rankMore': '继续浏览',
      'discover.rankCount': '{count} 本',
      'discover.detail': '图书详情',
      'discover.back': '返回',
      'discover.backToDiscover': '返回发现',
      'discover.ratingCount': '{count} 人评价',
      'discover.noRating': '暂无评分',
      'discover.author': '作者',
      'discover.translator': '译者',
      'discover.publisher': '出版社',
      'discover.pubdate': '出版年',
      'discover.pages': '页数',
      'discover.price': '定价',
      'discover.series': '丛书',
      'discover.tags': '标签',
      'discover.intro': '内容简介',
      'discover.catalog': '目录',
      'discover.authorIntro': '作者简介',
      'discover.openDouban': '在豆瓣查看',
      'discover.loadingDetail': '正在加载详情…',
      'discover.detailError': '详情加载失败',
      'discover.rankBadge': 'Top250 · No.{rank}',
      'discover.ebook': '有电子书',
      'discover.errorUpstream': '豆瓣暂时没有响应，请稍后再试。',
      'discover.errorTimeout': '豆瓣响应超时，请稍后再试。',
      'discover.errorInvalid': '请求无效，请调整后重试。',
      'discover.errorNotFound': '没有找到这本书。',
      'discover.errorNetwork': '网络连接失败，请稍后再试。',
      'discover.errorUnauthorized': '登录状态已失效，请刷新后重试。',
      'discover.errorUnknown': '出了点问题，请稍后再试。',
      'discover.sort.T': '综合排序',
      'discover.sort.U': '近期热度',
      'discover.sort.R': '出版时间',
      'discover.sort.S': '高分优先',
      'common.close': '关闭',
      'common.retry': '重试',
      'common.all': '全部',
      'rankings.overall': '总榜',
      'rankings.overallHint': '豆瓣读者当下在读，以及长期口碑最好的书。',
      'rankings.annual': '年度榜',
      'rankings.annualHint': '豆瓣年度读书榜单，按年份回看。',
      'rankings.types': '类型榜',
      'rankings.typesHint': '按类型浏览一百本好书。',
      'rankings.books': '{count} 本',
      'rankings.back': '返回榜单',
      'rankings.loading': '正在加载榜单…',
      'rankings.error': '榜单加载失败',
      'rankings.retry': '重试',
      'rankings.empty': '这个榜单暂时没有内容',
      'rankings.loadMore': '加载更多',
      'rankings.showing': '已显示 {count} / {total}',
      'rankings.annualSection': '年度榜单',
      'common.douban': '豆瓣'
    }

    const EN = {
      'panel': 'E-Library',
      'title': 'E-Library',
      'subtitle': 'A quieter place to read',
      'tabs.shelf': 'Shelf',
      'tabs.discover': 'Discover',
      'tabs.rankings': 'Rankings',
      'time.justNow': 'Just now',
      'time.minutesAgo': '{count} min ago',
      'time.hoursAgo': '{count} hr ago',
      'time.daysAgo': '{count} days ago',
      'shelf.import': 'Import book',
      'shelf.importing': 'Importing…',
      'shelf.search': 'Search title or author',
      'shelf.sort.recent': 'Recently read',
      'shelf.sort.added': 'Recently added',
      'shelf.sort.title': 'Title',
      'shelf.emptyTitle': 'Your shelf is empty',
      'shelf.emptyHint': 'Add an EPUB or TXT and settle in for a quiet evening.',
      'shelf.emptyAction': 'Import your first book',
      'shelf.emptySearch': 'No matching books',
      'shelf.count': '{count} books',
      'shelf.progress': '{percent}% read',
      'shelf.unread': 'Not started',
      'shelf.finished': 'Finished',
      'shelf.readNow': 'Continue reading',
      'shelf.imported': 'Imported {count} book(s)',
      'shelf.importSkipped': '{count} already on your shelf',
      'shelf.importFailed': 'Could not import {name}',
      'shelf.importUnsupported': 'Only EPUB and TXT files are supported',
      'shelf.importTooLarge': 'File is too large (max {size} MB)',
      'shelf.importEmpty': 'This file has no readable content',
      'shelf.importBadFile': 'This file is damaged and could not be read',
      'shelf.delete': 'Remove from shelf',
      'shelf.deleteConfirmTitle': 'Remove “{title}”?',
      'shelf.deleteConfirmText': 'The local file and reading progress will be deleted.',
      'shelf.deleteConfirm': 'Remove',
      'shelf.deleted': 'Removed from your shelf',
      'shelf.cancel': 'Cancel',
      'shelf.openFailed': 'Could not open: {message}',
      'shelf.formatEpub': 'EPUB',
      'shelf.formatTxt': 'TXT',
      'shelf.chapterCount': '{count} chapters',
      'shelf.filterAll': 'All',
      'shelf.unknownAuthor': 'Unknown author',
      'reader.back': 'Shelf',
      'reader.toc': 'Contents',
      'reader.tocTitle': 'Contents',
      'reader.tocEmpty': 'This book has no contents',
      'reader.settings': 'Reading settings',
      'reader.fontSize': 'Text size',
      'reader.lineHeight': 'Line height',
      'reader.serif': 'Serif',
      'reader.serifOn': 'Serif',
      'reader.serifOff': 'Sans',
      'reader.prev': 'Previous chapter',
      'reader.next': 'Next chapter',
      'reader.chapterIndex': 'Chapter {current} of {total}',
      'reader.percent': '{percent}%',
      'reader.loading': 'Opening…',
      'reader.rendering': 'Typesetting…',
      'reader.empty': 'This chapter is empty',
      'reader.chapterFailed': 'Could not load this chapter',
      'reader.retry': 'Retry',
      'reader.part': 'Part {n}',
      'reader.untitled': 'Untitled chapter',
      'shelf.untitled': 'Untitled',
      'reader.finishedBook': 'You reached the end',
      'reader.keyboardHint': '← → to turn chapters',
      'reader.imageFailed': 'Image could not be loaded',
      'reader.chapter': 'Chapter {n}',
      'reader.noMorePrev': 'This is the first chapter',
      'reader.noMoreNext': 'This is the last chapter',
      'discover.searchPlaceholder': 'Search Douban books and authors',
      'discover.search': 'Search',
      'discover.searchAria': 'Search Douban books',
      'discover.searching': 'Searching…',
      'discover.searchResults': 'Results for “{query}”',
      'discover.searchEmpty': 'Douban has no matching books',
      'discover.searchError': 'Search failed. Please try again.',
      'discover.searchMore': 'Search more on Douban',
      'discover.feedStale': 'Could not update; showing the previous results',
      'discover.recommend': 'For you',
      'discover.filter': 'Browse',
      'discover.rank': 'Charts',
      'discover.forYou': 'Douban picks',
      'discover.recommendSub': 'What Douban readers are reading',
      'discover.refresh': 'Shuffle',
      'discover.filters': 'Filters',
      'discover.theme': 'Theme',
      'discover.region': 'Region',
      'discover.sort': 'Sort',
      'discover.apply': 'Apply filters',
      'discover.reset': 'Reset',
      'discover.total': '{count} books',
      'discover.loadMore': 'Load more',
      'discover.loading': 'Loading…',
      'discover.empty': 'Nothing to show yet',
      'discover.retry': 'Retry',
      'discover.error': 'Could not load',
      'discover.rankTitle': 'Douban charts',
      'discover.rankSub': 'Douban Books Top 250',
      'discover.rankMore': 'Keep browsing',
      'discover.rankCount': '{count} books',
      'discover.detail': 'Book details',
      'discover.back': 'Back',
      'discover.backToDiscover': 'Back to Discover',
      'discover.ratingCount': '{count} ratings',
      'discover.noRating': 'No rating yet',
      'discover.author': 'Author',
      'discover.translator': 'Translator',
      'discover.publisher': 'Publisher',
      'discover.pubdate': 'Published',
      'discover.pages': 'Pages',
      'discover.price': 'Price',
      'discover.series': 'Series',
      'discover.tags': 'Tags',
      'discover.intro': 'About this book',
      'discover.catalog': 'Contents',
      'discover.authorIntro': 'About the author',
      'discover.openDouban': 'View on Douban',
      'discover.loadingDetail': 'Loading details…',
      'discover.detailError': 'Could not load details',
      'discover.rankBadge': 'Top 250 · No.{rank}',
      'discover.ebook': 'E-book available',
      'discover.errorUpstream': 'Douban is not responding right now. Please try later.',
      'discover.errorTimeout': 'Douban took too long to respond. Please try later.',
      'discover.errorInvalid': 'That request was not valid. Please adjust and try again.',
      'discover.errorNotFound': 'That book could not be found.',
      'discover.errorNetwork': 'Network connection failed. Please try again.',
      'discover.errorUnauthorized': 'Your session expired. Refresh the page and try again.',
      'discover.errorUnknown': 'Something went wrong. Please try again.',
      'discover.sort.T': 'Overall',
      'discover.sort.U': 'Trending',
      'discover.sort.R': 'Newest',
      'discover.sort.S': 'Top rated',
      'common.close': 'Close',
      'common.retry': 'Retry',
      'common.all': 'All',
      'rankings.overall': 'Overall',
      'rankings.overallHint': 'What Douban readers are reading now, and the books that endure.',
      'rankings.annual': 'Annual',
      'rankings.annualHint': 'Douban’s year-by-year reading lists.',
      'rankings.types': 'By genre',
      'rankings.typesHint': 'Browse one hundred books in each genre.',
      'rankings.books': '{count} books',
      'rankings.back': 'Back to rankings',
      'rankings.loading': 'Loading rankings…',
      'rankings.error': 'Could not load rankings',
      'rankings.retry': 'Retry',
      'rankings.empty': 'This list is empty for now',
      'rankings.loadMore': 'Load more',
      'rankings.showing': 'Showing {count} of {total}',
      'rankings.annualSection': 'Annual list',
      'common.douban': 'Douban'
    }

    function PanelIcon(props) {
      const size = props && Number.isFinite(props.size) ? props.size : 20
      const active = Boolean(props && props.active)
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block', flex: 'none', opacity: active ? 1 : 0.92 },
      },
        h('rect', { x: 3.1, y: 4.8, width: 4.6, height: 14.4, rx: 1.2, fill: 'currentColor', opacity: 0.55 }),
        h('rect', { x: 9.2, y: 3.2, width: 5, height: 16, rx: 1.2, fill: 'currentColor' }),
        h('path', { d: 'M16.4 6.6l4.2 1.1-3.1 13.1-4.2-1.1z', fill: 'currentColor', opacity: 0.78 }),
        h('path', { d: 'M2.4 20.2h19.2', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' })
      )
    }

    function Svg(props, children) {
      const size = props && Number.isFinite(props.size) ? props.size : 18
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: props && props.strokeWidth ? props.strokeWidth : 1.75,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block', flex: 'none' },
      }, children)
    }

    function IconSearch(props) {
      return Svg(props || {}, [
        h('circle', { key: 'c', cx: 11, cy: 11, r: 7 }),
        h('path', { key: 'l', d: 'M16.5 16.5L21 21' }),
      ])
    }

    function IconImport(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M12 3v11' }),
        h('path', { key: 'b', d: 'M7.5 9.5L12 14l4.5-4.5' }),
        h('path', { key: 'c', d: 'M4 20h16' }),
      ])
    }

    function IconTrash(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M4 7h16' }),
        h('path', { key: 'b', d: 'M9 7V4.5h6V7' }),
        h('path', { key: 'c', d: 'M6.5 7l1 13h9l1-13' }),
        h('path', { key: 'd', d: 'M10 11v5M14 11v5' }),
      ])
    }

    function IconArrowLeft(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M19 12H5' }),
        h('path', { key: 'b', d: 'M11 18l-6-6 6-6' }),
      ])
    }

    function IconList(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M8 6h13M8 12h13M8 18h13' }),
        h('path', { key: 'b', d: 'M3.5 6h.01M3.5 12h.01M3.5 18h.01', strokeWidth: 2.5 }),
      ])
    }

    function IconType(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M5.5 19L12 5l6.5 14' }),
        h('path', { key: 'b', d: 'M8.4 13.5h7.2' }),
      ])
    }

    function IconChevronLeft(props) {
      return Svg(props || {}, [h('path', { key: 'a', d: 'M15 18l-6-6 6-6' })])
    }

    function IconChevronRight(props) {
      return Svg(props || {}, [h('path', { key: 'a', d: 'M9 18l6-6-6-6' })])
    }

    function IconClose(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M6 6l12 12' }),
        h('path', { key: 'b', d: 'M18 6L6 18' }),
      ])
    }

    function IconRefresh(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
        h('path', { key: 'b', d: 'M20 4v7h-7' }),
      ])
    }

    function IconExternal(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M14 4h6v6' }),
        h('path', { key: 'b', d: 'M20 4l-9 9' }),
        h('path', { key: 'c', d: 'M19 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 18.5v-13A1.5 1.5 0 0 1 4.5 4H9' }),
      ])
    }

    function IconCompass(props) {
      return Svg(props || {}, [
        h('circle', { key: 'a', cx: 12, cy: 12, r: 9 }),
        h('path', { key: 'b', d: 'M15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5z' }),
      ])
    }

    function IconTrophy(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M8 4h8v5a4 4 0 0 1-8 0z' }),
        h('path', { key: 'b', d: 'M8 5H5v2a3 3 0 0 0 3 3' }),
        h('path', { key: 'c', d: 'M16 5h3v2a3 3 0 0 1-3 3' }),
        h('path', { key: 'd', d: 'M12 13v4' }),
        h('path', { key: 'e', d: 'M8.5 20h7' }),
        h('path', { key: 'f', d: 'M10 17h4v3h-4z' }),
      ])
    }

    function IconShelf(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
        h('path', { key: 'b', d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }),
      ])
    }

    function IconBookOpen(props) {
      return Svg(props || {}, [
        h('path', { key: 'a', d: 'M12 6.5C10.5 5.2 8.5 4.5 6 4.5H3v15h3c2.5 0 4.5.7 6 2 1.5-1.3 3.5-2 6-2h3v-15h-3c-2.5 0-4.5.7-6 2z' }),
        h('path', { key: 'b', d: 'M12 6.5v15' }),
      ])
    }

    function IconStar(props) {
      const size = props && Number.isFinite(props.size) ? props.size : 14
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block', flex: 'none' },
      }, h('path', {
        d: 'M12 3.2l2.7 5.46 6.03.88-4.36 4.25 1.03 6L12 16.97 6.6 19.79l1.03-6L3.27 9.54l6.03-.88z',
      }))
    }

    function IconImage(props) {
      return Svg(props || {}, [
        h('rect', { key: 'a', x: 3, y: 4, width: 18, height: 16, rx: 2 }),
        h('circle', { key: 'b', cx: 8.5, cy: 9, r: 1.4 }),
        h('path', { key: 'c', d: 'M4 17l4.5-4.5 3.5 3.5 2.5-2.5L20 18' }),
      ])
    }

    function interpolate(template, vars) {
      if (!vars) return template
      return String(template).replace(/\{(\w+)\}/g, (_, key) =>
        vars[key] === undefined || vars[key] === null ? '' : String(vars[key]))
    }

    function makeTranslator(rawT, locale) {
      const dict = locale === 'en' ? EN : ZH
      return function translate(key, vars) {
        let value
        try {
          value = rawT ? rawT(key) : undefined
        } catch {
          value = undefined
        }
        if (typeof value !== 'string' || value === key) value = dict[key]
        if (typeof value !== 'string') value = ZH[key] || key
        return interpolate(value, vars)
      }
    }

    function currentLocale() {
      try {
        const snapshot = window.__DSH_LOCALE__ && window.__DSH_LOCALE__.getSnapshot
          ? window.__DSH_LOCALE__.getSnapshot()
          : null
        if (snapshot && typeof snapshot.active === 'string') return snapshot.active
      } catch {
        /* fall through */
      }
      const lang = typeof navigator !== 'undefined' ? navigator.language || '' : ''
      return /^en/i.test(lang) ? 'en' : 'zh'
    }

    function isEnglish() {
      return /^en/i.test(currentLocale())
    }

    function formatNumber(value, english) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '0'
      try {
        return new Intl.NumberFormat(english ? 'en-US' : 'zh-CN').format(number)
      } catch {
        return String(Math.round(number))
      }
    }

    function formatCount(value) {
      const number = Number(value)
      if (!Number.isFinite(number) || number < 0) return '0'
      if (number < 10000) return formatNumber(number, isEnglish())
      const k = number / 10000
      return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}万`
    }

    function relativeTime(ts, t) {
      const value = Number(ts)
      if (!Number.isFinite(value) || value <= 0) return ''
      const diff = Math.max(0, Date.now() - value)
      if (diff < 60 * 1000) return t('time.justNow')
      if (diff < 60 * 60 * 1000) return t('time.minutesAgo', { count: Math.floor(diff / 60000) })
      if (diff < 24 * 60 * 60 * 1000) return t('time.hoursAgo', { count: Math.floor(diff / 3600000) })
      if (diff < 7 * 24 * 60 * 60 * 1000) return t('time.daysAgo', { count: Math.floor(diff / 86400000) })
      try {
        return new Date(value).toLocaleDateString(isEnglish() ? 'en-US' : 'zh-CN', {
          month: 'short',
          day: 'numeric',
          year: new Date(value).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        })
      } catch {
        return ''
      }
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
    }

    function coverTone(seed) {
      const text = String(seed || 'library')
      let hash = 0
      for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) % 360
      }
      const hue = hash
      return {
        background: `linear-gradient(145deg, hsl(${hue} 36% 43%), hsl(${(hue + 38) % 360} 32% 30%))`,
      }
    }

    function bookInitial(title) {
      const text = String(title || '').trim()
      if (!text) return '书'
      const first = Array.from(text)[0]
      return /[a-z]/i.test(first) ? first.toUpperCase() : first
    }

    function coverSource(url) {
      if (typeof url !== 'string' || !url) return ''
      if (/^data:image\//i.test(url)) return url
      if (/^(?:https?:)?\/\//i.test(url) || url.startsWith('/')) {
        return `${API_BASE}/image?url=${encodeURIComponent(url)}`
      }
      return ''
    }

    function progressPercent(progress, chapterCount) {
      if (!progress) return 0
      const count = Math.max(1, Number(chapterCount) || 1)
      const chapter = clamp(Number(progress.chapterIndex) || 0, 0, count - 1)
      const ratio = clamp(Number(progress.scrollRatio) || 0, 0, 1)
      return clamp(Math.round(((chapter + ratio) / count) * 100), 0, 100)
    }

    function isFinished(progress, chapterCount) {
      if (!progress) return false
      const count = Math.max(1, Number(chapterCount) || 1)
      return (Number(progress.chapterIndex) || 0) >= count - 1 && (Number(progress.scrollRatio) || 0) >= 0.995
    }

    class UiError extends Error {
      constructor(code, message) {
        super(message || code)
        this.name = 'UiError'
        this.code = code || 'network'
      }
    }

    class ImportError extends Error {
      constructor(code, detail) {
        super(detail || code)
        this.name = 'ImportError'
        this.code = code
      }
    }

    async function apiJson(path, init) {
      let response
      try {
        response = await fetch(`${API_BASE}${path}`, init)
      } catch (error) {
        if (error && error.name === 'AbortError') throw new UiError('aborted', 'The request was cancelled.')
        throw new UiError('network', 'The e-library service could not be reached.')
      }
      let body = null
      try {
        body = await response.json()
      } catch {
        body = null
      }
      if (!response.ok || !body || body.ok !== true) {
        const code = body && typeof body.code === 'string'
          ? body.code
          : response.status === 401 || response.status === 403
            ? 'unauthorized'
            : 'network'
        throw new UiError(code, body && typeof body.message === 'string' ? body.message : '')
      }
      return body
    }

    function listLibrary() {
      return apiJson('/library', { cache: 'no-store' })
    }

    function getBook(id) {
      return apiJson(`/books/${encodeURIComponent(id)}`, { cache: 'no-store' })
    }

    async function fetchBookFile(id) {
      let response
      try {
        response = await fetch(`${API_BASE}/books/${encodeURIComponent(id)}/file`, {
          cache: 'no-store',
        })
      } catch {
        throw new UiError('network', 'The book file could not be downloaded.')
      }
      if (!response.ok) {
        let code = 'not_found'
        try {
          const body = await response.json()
          if (body && typeof body.code === 'string') code = body.code
        } catch {
          /* keep the fallback */
        }
        throw new UiError(code, 'The book file could not be downloaded.')
      }
      return response.blob()
    }

    function uploadBook(book, file) {
      const meta = new TextEncoder().encode(JSON.stringify(book))
      const header = new ArrayBuffer(4)
      new DataView(header).setUint32(0, meta.byteLength, false)
      const body = new Blob([header, meta, file], { type: 'application/octet-stream' })
      return apiJson('/books', {
        method: 'POST',
        headers: { 'content-type': 'application/octet-stream' },
        body,
      })
    }

    function touchBook(id) {
      return apiJson(`/books/${encodeURIComponent(id)}/touch`, { method: 'POST' })
    }

    function deleteBook(id) {
      return apiJson(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' })
    }

    function saveBookProgress(payload) {
      return apiJson('/progress', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
    }

    function errorText(t, error) {
      const code = error && typeof error === 'object' && typeof error.code === 'string'
        ? error.code
        : 'unknown'
      switch (code) {
        case 'aborted':
          return ''
        case 'upstream_error':
          return t('discover.errorUpstream')
        case 'timeout':
          return t('discover.errorTimeout')
        case 'invalid_request':
          return t('discover.errorInvalid')
        case 'not_found':
          return t('discover.errorNotFound')
        case 'unauthorized':
          return t('discover.errorUnauthorized')
        case 'network':
          return t('discover.errorNetwork')
        default:
          return t('discover.errorUnknown')
      }
    }

    function resetPanelScroll(node) {
      if (!node || typeof node.closest !== 'function') return
      const scroller = node.closest('.el-body')
      if (scroller) scroller.scrollTop = 0
    }

    // ---------------------------------------------------------------------
    // ZIP + EPUB parsing. EPUBs are ZIP archives; chapters are XHTML strings.
    // The parser only extracts what the reader needs, entirely in the page.
    // ---------------------------------------------------------------------

    function normalizeArchivePath(value) {
      const parts = []
      for (const part of String(value || '').replace(/\\/g, '/').split('/')) {
        if (!part || part === '.') continue
        if (part === '..') parts.pop()
        else parts.push(part)
      }
      return parts.join('/')
    }

    function safeDecodePath(value) {
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }

    function splitHref(href) {
      const text = String(href || '').trim()
      const marker = text.indexOf('#')
      if (marker < 0) return { path: text, hash: '' }
      return { path: text.slice(0, marker), hash: safeDecodePath(text.slice(marker + 1)) }
    }

    function resolveArchivePath(baseFile, href) {
      const { path: rawPath, hash } = splitHref(href)
      if (!rawPath) return { path: normalizeArchivePath(baseFile), hash, external: false }
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(rawPath)) {
        return { path: rawPath, hash, external: true }
      }
      const decoded = safeDecodePath(rawPath)
      const baseDirParts = normalizeArchivePath(baseFile).split('/').slice(0, -1)
      const resolved = normalizeArchivePath(
        (decoded.startsWith('/') ? [] : baseDirParts).concat(decoded.replace(/^\/+/, '').split('/')).join('/')
      )
      return { path: resolved, hash, external: false }
    }

    function baseName(value) {
      const path = String(value || '')
      return path.slice(path.lastIndexOf('/') + 1)
    }

    function extensionOf(value) {
      const name = String(value || '')
      const dot = name.lastIndexOf('.')
      return dot < 0 ? '' : name.slice(dot + 1).toLowerCase()
    }

    function mimeForPath(value) {
      switch (extensionOf(value)) {
        case 'jpg':
        case 'jpeg': return 'image/jpeg'
        case 'png': return 'image/png'
        case 'gif': return 'image/gif'
        case 'webp': return 'image/webp'
        case 'svg': return 'image/svg+xml'
        case 'avif': return 'image/avif'
        case 'css': return 'text/css'
        case 'xhtml': return 'application/xhtml+xml'
        case 'html': return 'text/html'
        case 'opf': return 'application/oebps-package+xml'
        case 'ncx': return 'application/x-dtbncx+xml'
        default: return 'application/octet-stream'
      }
    }

    class ZipArchive {
      constructor(buffer) {
        this.buffer = buffer
        this.bytes = new Uint8Array(buffer)
        this.view = new DataView(buffer)
        this.entries = new Map()
        this.lowerEntries = new Map()
        this.readDirectory()
      }

      readDirectory() {
        const length = this.bytes.byteLength
        if (length < 22) throw new ImportError('bad_file', 'The ZIP archive is too small.')
        const minimum = Math.max(0, length - 22 - 0xffff)
        let eocd = -1
        for (let offset = length - 22; offset >= minimum; offset -= 1) {
          if (this.view.getUint32(offset, true) === 0x06054b50) {
            eocd = offset
            break
          }
        }
        if (eocd < 0) throw new ImportError('bad_file', 'The ZIP end record is missing.')
        const count = this.view.getUint16(eocd + 10, true)
        const directorySize = this.view.getUint32(eocd + 12, true)
        const directoryOffset = this.view.getUint32(eocd + 16, true)
        if (count === 0xffff || directoryOffset === 0xffffffff) {
          throw new ImportError('bad_file', 'ZIP64 archives are not supported.')
        }
        let cursor = directoryOffset
        if (cursor + 4 > length || this.view.getUint32(cursor, true) !== 0x02014b50) {
          cursor = eocd - directorySize
        }
        for (let index = 0; index < count; index += 1) {
          if (cursor + 46 > length || this.view.getUint32(cursor, true) !== 0x02014b50) {
            throw new ImportError('bad_file', 'The ZIP directory is damaged.')
          }
          const flags = this.view.getUint16(cursor + 8, true)
          const method = this.view.getUint16(cursor + 10, true)
          const compressedSize = this.view.getUint32(cursor + 20, true)
          const uncompressedSize = this.view.getUint32(cursor + 24, true)
          const nameLength = this.view.getUint16(cursor + 28, true)
          const extraLength = this.view.getUint16(cursor + 30, true)
          const commentLength = this.view.getUint16(cursor + 32, true)
          const localOffset = this.view.getUint32(cursor + 42, true)
          if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localOffset === 0xffffffff) {
            throw new ImportError('bad_file', 'ZIP64 archives are not supported.')
          }
          const name = new TextDecoder('utf-8').decode(
            this.bytes.subarray(cursor + 46, cursor + 46 + nameLength)
          ).replace(/\\/g, '/')
          const normalized = normalizeArchivePath(name)
          if (normalized && !normalized.endsWith('/')) {
            const entry = {
              name: normalized,
              flags,
              method,
              compressedSize,
              uncompressedSize,
              localOffset,
            }
            this.entries.set(normalized, entry)
            if (!this.lowerEntries.has(normalized.toLowerCase())) {
              this.lowerEntries.set(normalized.toLowerCase(), entry)
            }
          }
          cursor += 46 + nameLength + extraLength + commentLength
        }
      }

      has(name) {
        return this.entries.has(normalizeArchivePath(name)) ||
          this.lowerEntries.has(normalizeArchivePath(name).toLowerCase())
      }

      entry(name) {
        const normalized = normalizeArchivePath(name)
        return this.entries.get(normalized) || this.lowerEntries.get(normalized.toLowerCase()) || null
      }

      async read(name) {
        const entry = this.entry(name)
        if (!entry) throw new ImportError('bad_file', `The EPUB is missing ${name}.`)
        if (entry.flags & 1) throw new ImportError('bad_file', 'Encrypted EPUBs are not supported.')
        if (entry.uncompressedSize > MAX_CHAPTER_BYTES) {
          throw new ImportError('bad_file', 'An EPUB entry is too large to open.')
        }
        const offset = entry.localOffset
        if (offset + 30 > this.bytes.byteLength || this.view.getUint32(offset, true) !== 0x04034b50) {
          throw new ImportError('bad_file', 'The EPUB archive entry is damaged.')
        }
        const nameLength = this.view.getUint16(offset + 26, true)
        const extraLength = this.view.getUint16(offset + 28, true)
        const start = offset + 30 + nameLength + extraLength
        const end = start + entry.compressedSize
        if (end > this.bytes.byteLength) throw new ImportError('bad_file', 'The EPUB archive is truncated.')
        const compressed = this.bytes.subarray(start, end)
        if (entry.method === 0) return compressed.slice()
        if (entry.method !== 8) {
          throw new ImportError('bad_file', 'This EPUB uses an unsupported compression method.')
        }
        if (typeof DecompressionStream !== 'function') {
          throw new ImportError('bad_file', 'This browser cannot decompress EPUB files.')
        }
        try {
          const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
          const output = await new Response(stream).arrayBuffer()
          return new Uint8Array(output)
        } catch {
          throw new ImportError('bad_file', 'The EPUB archive could not be decompressed.')
        }
      }

      async text(name) {
        return new TextDecoder('utf-8').decode(await this.read(name))
      }
    }

    function parseMarkupDocument(text, type) {
      if (typeof DOMParser !== 'function') {
        throw new ImportError('bad_file', 'This browser cannot parse EPUB documents.')
      }
      const doc = new DOMParser().parseFromString(text, type || 'application/xml')
      if (doc.getElementsByTagName('parsererror').length) {
        const fallback = new DOMParser().parseFromString(text, 'text/html')
        if (!fallback || !fallback.documentElement) {
          throw new ImportError('bad_file', 'The EPUB contains unreadable markup.')
        }
        return fallback
      }
      return doc
    }

    function descendants(root, localName) {
      if (!root || typeof root.getElementsByTagName !== 'function') return []
      return Array.from(root.getElementsByTagName('*')).filter(node => node.localName === localName)
    }

    function childElements(root, localName) {
      if (!root || !root.children) return []
      return Array.from(root.children).filter(node => node.localName === localName)
    }

    function firstDescendant(root, localName) {
      return descendants(root, localName)[0] || null
    }

    function elementText(root) {
      return root && typeof root.textContent === 'string' ? root.textContent : ''
    }

    function squashText(value) {
      return String(value || '').replace(/\s+/g, ' ').trim()
    }

    function stripMarkup(value) {
      return squashText(String(value || '')
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, '\n')
        .replace(/<[^>]*>/g, ''))
    }

    function metadataValue(metadata, localName) {
      const nodes = descendants(metadata, localName)
      return nodes.length ? squashText(elementText(nodes[0])) : ''
    }

    function metadataValues(metadata, localName) {
      return descendants(metadata, localName).map(node => squashText(elementText(node))).filter(Boolean)
    }

    function readManifest(opf, opfPath) {
      const manifest = new Map()
      const metadata = firstDescendant(opf, 'metadata') || opf
      const node = firstDescendant(opf, 'manifest') || opf
      for (const item of descendants(node, 'item')) {
        const id = item.getAttribute('id') || ''
        const rawHref = item.getAttribute('href') || ''
        if (!id || !rawHref) continue
        const resolved = resolveArchivePath(opfPath, rawHref)
        manifest.set(id, {
          id,
          href: resolved.path,
          mediaType: (item.getAttribute('media-type') || mimeForPath(resolved.path)).toLowerCase(),
          properties: (item.getAttribute('properties') || '').split(/\s+/).filter(Boolean),
        })
      }
      return { manifest, metadata }
    }

    function readTocLabels(zip, manifest, opf) {
      return (async () => {
        const labels = new Map()
        let navItem = Array.from(manifest.values()).find(item => item.properties.includes('nav'))
        if (!navItem) {
          navItem = Array.from(manifest.values()).find(item =>
            /(?:^|\/)nav\.(?:xhtml|html)$/i.test(item.href) ||
            /(?:^|\/)toc\.(?:xhtml|html)$/i.test(item.href))
        }
        if (navItem) {
          try {
            const navDoc = parseMarkupDocument(await zip.text(navItem.href), 'application/xhtml+xml')
            const navs = descendants(navDoc, 'nav')
            const tocNav = navs.find(nav => {
              const type = nav.getAttribute('epub:type') || nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type')
              return type === 'toc'
            }) || navs[0]
            for (const link of descendants(tocNav || navDoc, 'a')) {
              const label = squashText(elementText(link))
              const href = link.getAttribute('href') || ''
              if (!label || !href) continue
              const target = resolveArchivePath(navItem.href, href)
              if (!target.external && target.path && !labels.has(target.path)) {
                labels.set(target.path, label)
              }
            }
          } catch {
            /* a missing nav document is not fatal; the spine still reads */
          }
        }
        const ncxItem = Array.from(manifest.values()).find(item =>
          item.mediaType === 'application/x-dtbncx+xml' || extensionOf(item.href) === 'ncx')
        if (ncxItem) {
          try {
            const ncx = parseMarkupDocument(await zip.text(ncxItem.href), 'application/xml')
            for (const point of descendants(ncx, 'navPoint')) {
              const label = firstDescendant(point, 'navLabel')
              const text = label ? firstDescendant(label, 'text') : null
              const content = firstDescendant(point, 'content')
              const src = content ? content.getAttribute('src') || '' : ''
              const title = squashText(elementText(text))
              if (!title || !src) continue
              const target = resolveArchivePath(ncxItem.href, src)
              if (!target.external && target.path && !labels.has(target.path)) {
                labels.set(target.path, title)
              }
            }
          } catch {
            /* as above */
          }
        }
        return labels
      })()
    }

    async function imageFileToCoverData(bytes, mediaType) {
      const type = String(mediaType || '').toLowerCase()
      if (!/^image\/(?:jpeg|png|webp|gif)$/.test(type)) return ''
      if (!bytes || bytes.byteLength > MAX_COVER_BYTES) return ''
      const blob = new Blob([bytes], { type })
      let objectUrl = ''
      try {
        objectUrl = URL.createObjectURL(blob)
        const image = await new Promise((resolve, reject) => {
          const element = new Image()
          element.onload = () => resolve(element)
          element.onerror = () => reject(new Error('image decode failed'))
          element.src = objectUrl
        })
        const naturalWidth = image.naturalWidth || 320
        const naturalHeight = image.naturalHeight || 480
        const width = Math.min(360, naturalWidth)
        const height = Math.max(1, Math.round((naturalHeight / naturalWidth) * width))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) return ''
        context.drawImage(image, 0, 0, width, height)
        let data = canvas.toDataURL('image/jpeg', 0.82)
        if (data.length > MAX_COVER_CHARS) data = canvas.toDataURL('image/jpeg', 0.68)
        if (data.length > MAX_COVER_CHARS) {
          const smaller = document.createElement('canvas')
          smaller.width = Math.round(width * 0.7)
          smaller.height = Math.round(height * 0.7)
          const smallerContext = smaller.getContext('2d')
          if (smallerContext) {
            smallerContext.drawImage(image, 0, 0, smaller.width, smaller.height)
            data = smaller.toDataURL('image/jpeg', 0.68)
          }
        }
        return data.length <= MAX_COVER_CHARS ? data : ''
      } catch {
        if (bytes.byteLength <= 320 * 1024 && /^image\/(?:jpeg|png|gif)$/.test(type)) {
          return `data:${type};base64,${base64FromBytes(bytes)}`
        }
        return ''
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
      }
    }

    function base64FromBytes(bytes) {
      const chunks = []
      const step = 0x8000
      for (let offset = 0; offset < bytes.byteLength; offset += step) {
        chunks.push(String.fromCharCode.apply(
          null,
          Array.from(bytes.subarray(offset, Math.min(bytes.byteLength, offset + step)))
        ))
      }
      return btoa(chunks.join(''))
    }

    async function readEpubCover(zip, opf, manifest) {
      let coverId = ''
      for (const meta of descendants(opf, 'meta')) {
        if ((meta.getAttribute('name') || '').toLowerCase() === 'cover') {
          coverId = meta.getAttribute('content') || ''
        }
      }
      const candidates = []
      if (coverId && manifest.has(coverId)) candidates.push(manifest.get(coverId))
      const all = Array.from(manifest.values())
      const coverImage = all.find(item => item.properties.includes('cover-image'))
      if (coverImage) candidates.push(coverImage)
      const byId = all.find(item => /^cover/i.test(item.id) && /^image\//.test(item.mediaType))
      if (byId) candidates.push(byId)
      const byName = all.find(item => /cover/i.test(item.href) && /^image\//.test(item.mediaType))
      if (byName) candidates.push(byName)
      for (const item of candidates) {
        try {
          const bytes = await zip.read(item.href)
          const data = await imageFileToCoverData(bytes, item.mediaType || mimeForPath(item.href))
          if (data) return data
        } catch {
          /* try the next candidate */
        }
      }
      return ''
    }

    async function parseEpubBook(file) {
      if (file.size > MAX_EPUB_BYTES) {
        throw new ImportError('too_large', 'The EPUB is larger than the supported limit.')
      }
      let zip
      try {
        zip = new ZipArchive(await file.arrayBuffer())
      } catch (error) {
        if (error instanceof ImportError) throw error
        throw new ImportError('bad_file', 'The EPUB could not be opened.')
      }
      const container = zip.has('META-INF/container.xml')
        ? parseMarkupDocument(await zip.text('META-INF/container.xml'), 'application/xml')
        : null
      const rootfile = container ? firstDescendant(container, 'rootfile') : null
      let opfPath = rootfile ? rootfile.getAttribute('full-path') || '' : ''
      if (!opfPath) {
        const fallback = Array.from(zip.entries.values()).find(entry => /\.opf$/i.test(entry.name))
        opfPath = fallback ? fallback.name : ''
      }
      if (!opfPath) throw new ImportError('bad_file', 'The EPUB package document is missing.')
      opfPath = normalizeArchivePath(opfPath)
      if (!zip.has(opfPath)) throw new ImportError('bad_file', 'The EPUB package document is missing.')
      const opf = parseMarkupDocument(await zip.text(opfPath), 'application/xml')
      const { manifest, metadata } = readManifest(opf, opfPath)
      const title = metadataValue(metadata, 'title') ||
        squashText(file.name.replace(/\.[^.]+$/, '')) ||
        'Untitled'
      const author = metadataValues(metadata, 'creator').join(' / ').slice(0, 300)
      const description = stripMarkup(metadataValue(metadata, 'description')).slice(0, 4000)
      const publisher = metadataValue(metadata, 'publisher').slice(0, 200)
      const language = metadataValue(metadata, 'language').slice(0, 40)
      const identifier = metadataValue(metadata, 'identifier').slice(0, 200)
      const date = metadataValue(metadata, 'date').slice(0, 40)

      const labels = await readTocLabels(zip, manifest, opf)
      const spineNode = firstDescendant(opf, 'spine')
      const refs = spineNode ? descendants(spineNode, 'itemref') : []
      const candidates = []
      for (const ref of refs) {
        const linear = (ref.getAttribute('linear') || 'yes').toLowerCase()
        const item = manifest.get(ref.getAttribute('idref') || '')
        if (!item || !item.href) continue
        if (linear === 'no' && refs.some(other => (other.getAttribute('linear') || 'yes').toLowerCase() !== 'no')) {
          continue
        }
        if (!/^(?:application\/xhtml\+xml|text\/html|application\/xml)$/.test(item.mediaType) &&
            !/\.(?:xhtml|html|htm)$/i.test(item.href)) {
          continue
        }
        candidates.push(item)
      }
      let spine = candidates
      if (spine.length > 1) {
        const withoutNav = spine.filter(item => !item.properties.includes('nav'))
        if (withoutNav.length) spine = withoutNav
      }
      if (!spine.length) {
        spine = Array.from(manifest.values()).filter(item =>
          !item.properties.includes('nav') &&
          (/^(?:application\/xhtml\+xml|text\/html)$/.test(item.mediaType) ||
            /\.(?:xhtml|html|htm)$/i.test(item.href)))
      }
      if (!spine.length) throw new ImportError('empty', 'This EPUB has no readable chapters.')
      const cover = await readEpubCover(zip, opf, manifest)
      const chapters = spine.map(item => ({
        href: item.href,
        label: squashText(labels.get(item.href) || '').slice(0, 300),
        mediaType: item.mediaType,
      }))
      return {
        title: squashText(title).slice(0, 300),
        author: squashText(author).slice(0, 300),
        format: 'epub',
        fileName: file.name,
        size: file.size,
        chapterCount: chapters.length,
        cover,
        description,
        publisher,
        language,
        identifier,
        date,
        spine: chapters,
        toc: chapters
          .map((chapter, index) => ({ label: chapter.label, index }))
          .filter(entry => entry.label),
        encoding: 'utf-8',
        textLength: 0,
      }
    }

    function decodeTextFile(buffer) {
      const bytes = new Uint8Array(buffer)
      if (bytes.byteLength >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'utf-8' }
      }
      if (bytes.byteLength >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'utf-16le' }
      }
      if (bytes.byteLength >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'utf-16be' }
      }
      try {
        return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'utf-8' }
      } catch {
        for (const encoding of ['gb18030', 'gbk']) {
          try {
            return { text: new TextDecoder(encoding).decode(bytes), encoding }
          } catch {
            /* try the next decoder */
          }
        }
        return { text: new TextDecoder('utf-8').decode(bytes), encoding: 'utf-8' }
      }
    }

    function splitTxtChapters(text) {
      const chapterPattern = /^[ \t\u3000]*(?:第[0-9零〇一二三四五六七八九十百千万两]+[章节回卷部篇](?:[ \t:：、.．-]+.{0,48})?|(?:Chapter|CHAPTER|Part|PART)\s+[0-9IVXLCDMivxlcdm]+(?:[ \t:.、-]+.{0,48})?)[ \t]*$/
      const matches = []
      let offset = 0
      for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (trimmed && trimmed.length <= 60 && chapterPattern.test(trimmed)) {
          matches.push({ offset, label: trimmed.slice(0, 80) })
        }
        offset += line.length + 1
      }
      const chapters = []
      const looksLikeChapters = matches.length > 0 &&
        (matches.length >= 3 || matches[0].offset < text.length * 0.5)
      if (looksLikeChapters) {
        if (matches[0].offset > 0) {
          chapters.push({ label: '', start: 0, end: matches[0].offset })
        }
        matches.forEach((match, index) => {
          const end = index + 1 < matches.length ? matches[index + 1].offset : text.length
          if (end > match.offset) {
            chapters.push({ label: match.label, start: match.offset, end })
          }
        })
      } else {
        const target = 6000
        let start = 0
        while (start < text.length) {
          let end = Math.min(text.length, start + target)
          if (end < text.length) {
            const newline = text.indexOf('\n', end)
            if (newline >= 0 && newline - end < 2500) end = newline + 1
          }
          chapters.push({ label: '', start, end })
          start = end
        }
      }
      return chapters.filter(chapter => text.slice(chapter.start, chapter.end).trim().length > 0)
    }

    async function parseTxtBook(file) {
      if (file.size > MAX_TXT_BYTES) {
        throw new ImportError('too_large', 'The TXT file is larger than the supported limit.')
      }
      const decoded = decodeTextFile(await file.arrayBuffer())
      const text = decoded.text.replace(/\r\n?/g, '\n')
      if (!text.trim()) throw new ImportError('empty', 'This TXT file is empty.')
      const chapters = splitTxtChapters(text)
      if (!chapters.length) throw new ImportError('empty', 'This TXT file has no readable text.')
      return {
        title: squashText(file.name.replace(/\.[^.]+$/, '')) || 'Untitled',
        author: '',
        format: 'txt',
        fileName: file.name,
        size: file.size,
        chapterCount: chapters.length,
        cover: '',
        description: '',
        publisher: '',
        language: '',
        identifier: '',
        date: '',
        spine: [],
        toc: [],
        chapters,
        encoding: decoded.encoding,
        textLength: text.length,
      }
    }

    async function parseBookFile(file) {
      const extension = extensionOf(file.name)
      if (extension === 'epub') return parseEpubBook(file)
      if (extension === 'txt') return parseTxtBook(file)
      throw new ImportError('unsupported', 'Only EPUB and TXT files are supported.')
    }

    const CSS = [
      '.el-page{position:relative;display:flex;flex-direction:column;flex:1 1 auto;height:100%;min-height:0;width:100%;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:14px;line-height:1.55;}',
      '.el-page *{box-sizing:border-box;}',
      '.el-page button,.el-page input,.el-page select{font:inherit;color:inherit;}',
      '.el-page button{appearance:none;}',
      '.el-page :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}',
      '.el-head{flex:none;padding:calc(18px + var(--dsh-frame-top-clearance,0px)) clamp(18px,2.8vw,36px) 0;background:var(--dsw-alias-bg-base);}',
      '.el-head button,.el-head input,.el-head select,.el-head a,.el-head [role="button"]{-webkit-app-region:no-drag;}',
      '.el-head-row{display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;width:100%;max-width:1080px;margin:0 auto;}',
      '.el-heading{flex:1;min-width:0;}',
      '.el-title{margin:0;font-size:21px;line-height:29px;font-weight:600;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-subtitle{margin:3px 0 0;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-secondary);}',
      '.el-head-actions{display:flex;align-items:center;gap:8px;flex:none;padding-top:1px;margin-left:auto;}',
      '.el-tabs-row{display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap;}',
      '.el-tabs{display:inline-flex;align-items:center;gap:2px;padding:3px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);}',
      '.el-tab{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:500;line-height:18px;padding:6px 15px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:background .14s ease,color .14s ease;}',
      '.el-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.el-tab[data-active="true"]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.08),0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-body{flex:1 1 auto;min-height:0;overflow:auto;padding:18px clamp(18px,2.8vw,36px) 36px;scrollbar-gutter:stable;}',
      '.el-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:32px;padding:0 13px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:1;cursor:pointer;white-space:nowrap;transition:background .14s ease,border-color .14s ease,opacity .14s ease;}',
      '.el-btn:hover{background:var(--dsw-alias-bg-layer-2);}',
      '.el-btn:disabled{opacity:.55;cursor:default;}',
      '.el-btn[data-variant="primary"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff;}',
      '.el-btn[data-variant="primary"]:hover{background:var(--dsw-alias-brand-primary);filter:brightness(1.08);}',
      '.el-btn[data-variant="ghost"]{border-color:transparent;background:transparent;color:var(--dsw-alias-label-secondary);}',
      '.el-btn[data-variant="ghost"]:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-btn[data-variant="danger"]{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:#fff;}',
      '.el-icon-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;flex:none;padding:0;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .14s ease,color .14s ease;}',
      '.el-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-icon-btn[data-active="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-input,.el-select{height:34px;width:100%;min-width:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:13px;padding:0 10px;outline:none;transition:border-color .14s ease,box-shadow .14s ease;}',
      '.el-input::placeholder{color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-input:focus,.el-select:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);}',
      '.el-select{appearance:none;padding-right:28px;cursor:pointer;background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);background-position:calc(100% - 15px) 14px,calc(100% - 10px) 14px;background-size:5px 5px;background-repeat:no-repeat;}',
      '.el-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}',
      '.el-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px;}',
      '.el-search{position:relative;flex:1 1 220px;max-width:380px;min-width:170px;}',
      '.el-search .el-input{padding-left:33px;}',
      '.el-search-glyph{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));pointer-events:none;display:flex;}',
      '.el-toolbar-meta{margin-left:auto;font-size:12.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;}',
      '.el-shelf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(142px,1fr));gap:24px 18px;}',
      '.el-book{position:relative;display:flex;flex-direction:column;gap:9px;min-width:0;border-radius:10px;cursor:pointer;outline:none;padding:0;}',
      '.el-book:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:4px;}',
      '.el-book-cover{position:relative;aspect-ratio:2/3;border-radius:7px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);box-shadow:0 5px 16px rgba(0,0,0,.12),0 0 0 .5px var(--dsw-alias-border-l1);transition:transform .16s ease,box-shadow .16s ease;}',
      '.el-book:hover .el-book-cover{transform:translateY(-2px);box-shadow:0 9px 22px rgba(0,0,0,.16),0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-book-cover img{width:100%;height:100%;display:block;object-fit:cover;}',
      '.el-book-tone{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px;text-align:center;color:#fff;}',
      '.el-book-initial{font-size:30px;line-height:1;font-weight:600;letter-spacing:.02em;opacity:.97;}',
      '.el-book-tone-label{font-size:10.5px;line-height:14px;letter-spacing:.08em;text-transform:uppercase;opacity:.72;max-height:28px;overflow:hidden;}',
      '.el-book-format{position:absolute;left:7px;top:7px;padding:2px 5px;border-radius:4px;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);color:#fff;font-size:9px;font-weight:600;letter-spacing:.06em;line-height:12px;}',
      '.el-book-remove{position:absolute;right:5px;top:5px;width:25px;height:25px;border-radius:7px;border:0;background:rgba(0,0,0,.52);backdrop-filter:blur(4px);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(-2px);transition:opacity .14s ease,transform .14s ease;}',
      '.el-book:hover .el-book-remove,.el-book:focus-within .el-book-remove{opacity:1;transform:none;}',
      '.el-book-remove:hover{background:rgba(160,44,44,.88);}',
      '.el-book-body{display:flex;flex-direction:column;gap:3px;min-width:0;}',
      '.el-book-title{font-size:13px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;}',
      '.el-book-author{font-size:11.5px;line-height:15px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-book-progress{display:flex;align-items:center;gap:7px;margin-top:2px;}',
      '.el-progress-track{position:relative;flex:1;height:3px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;}',
      '.el-progress-fill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:var(--dsw-alias-brand-primary);}',
      '.el-book-state{font-size:10.5px;line-height:13px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;}',
      '.el-book-state[data-finished="true"]{color:var(--dsw-alias-state-success-primary);}',
      '.el-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:300px;padding:40px 20px;color:var(--dsw-alias-label-secondary);}',
      '.el-empty-icon{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));margin-bottom:15px;}',
      '.el-empty-title{margin:0;font-size:15px;line-height:22px;font-weight:600;color:var(--dsw-alias-label-primary);}',
      '.el-empty-text{margin:5px 0 0;max-width:360px;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-empty .el-btn{margin-top:16px;}',
      '.el-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:220px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));font-size:12.5px;text-align:center;padding:28px;}',
      '.el-spinner{width:19px;height:19px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:el-spin .8s linear infinite;}',
      '@keyframes el-spin{to{transform:rotate(360deg);}}',
      '.el-modal-backdrop{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:24px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 46%,transparent);-webkit-app-region:no-drag;animation:el-fade .14s ease;}',
      '.el-modal{width:min(420px,100%);border-radius:14px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);box-shadow:0 20px 60px color-mix(in srgb,var(--dsw-alias-bg-overlay) 34%,transparent);padding:22px 22px 18px;}',
      '.el-modal-title{margin:0;font-size:15px;line-height:22px;font-weight:600;}',
      '.el-modal-text{margin:7px 0 0;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-secondary);}',
      '.el-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;}',
      '.el-toast{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);z-index:80;max-width:min(520px,calc(100% - 32px));padding:9px 14px;border-radius:9px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);box-shadow:0 10px 30px color-mix(in srgb,var(--dsw-alias-bg-overlay) 26%,transparent);font-size:12.5px;line-height:18px;color:var(--dsw-alias-label-primary);animation:el-rise .18s ease;}',
      '.el-toast[data-kind="error"]{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 42%,var(--dsw-alias-border-l1));}',
      '@keyframes el-fade{from{opacity:0;}to{opacity:1;}}',
      '@keyframes el-rise{from{opacity:0;transform:translate(-50%,8px);}to{opacity:1;transform:translate(-50%,0);}}',
      '.el-discover{display:flex;flex-direction:column;gap:14px;width:100%;max-width:1080px;margin:0 auto;}',
      '.el-shelf{width:100%;max-width:1080px;margin:0 auto;}',
      '.el-search-row{display:flex;align-items:center;gap:8px;}',
      '.el-search-row .el-search{max-width:none;flex:1;}',
      '.el-search-row .el-btn{height:34px;}',
      '.el-filter-row{display:flex;align-items:center;gap:8px 15px;flex-wrap:wrap;}',
      '.el-filter-item{display:flex;align-items:center;gap:6px;min-width:0;}',
      '.el-filter-name{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap;}',
      '.el-filter-select{height:32px;width:auto;min-width:92px;font-size:12px;padding:0 27px 0 9px;background-color:transparent;}',
      '.el-filter-select:hover{background-color:var(--dsw-alias-bg-layer-1);}',
      '.el-filter-reset{appearance:none;border:0;background:transparent;color:var(--dsw-alias-brand-primary);font-size:12px;line-height:18px;padding:4px 2px;cursor:pointer;}',
      '.el-filter-reset:hover{text-decoration:underline;}',
      '.el-filter-actions{display:flex;align-items:center;gap:10px;margin-left:auto;min-width:0;}',
      '.el-filter-actions:empty{display:none;}',
      '.el-filter-status{display:inline-flex;align-items:center;color:var(--dsw-alias-label-secondary);}',
      '.el-filter-count{font-size:11.5px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap;}',
      '.el-inline-error{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 11px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 38%,var(--dsw-alias-border-l1));border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 7%,var(--dsw-alias-bg-base));font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);}',
      '.el-inline-error .el-filter-reset{flex:none;color:var(--dsw-alias-state-warn-primary);}',
      '.el-result-note{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:20px;font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.el-inline-link{display:inline-flex;align-items:center;gap:4px;color:var(--dsw-alias-brand-primary);font-size:12px;text-decoration:none;white-space:nowrap;}',
      '.el-inline-link:hover{text-decoration:underline;}',
      '.el-dtabs-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between;}',
      '.el-dtabs{display:inline-flex;gap:2px;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);}',
      '.el-dtab{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12.5px;font-weight:500;padding:5px 13px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;}',
      '.el-dtab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.el-dtab[data-active="true"]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.07),0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-section-head{display:flex;align-items:flex-end;gap:12px;min-width:0;}',
      '.el-section-title{margin:0;font-size:15px;line-height:22px;font-weight:600;}',
      '.el-section-sub{margin:2px 0 0;font-size:11.5px;line-height:16px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-section-count{margin-left:auto;font-size:11.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;}',
      '.el-search-summary{display:flex;align-items:center;gap:10px;min-width:0;}',
      '.el-search-summary .el-section-title{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-filter-panel{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:11px;background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l1);}',
      '.el-filter-group{display:flex;align-items:flex-start;gap:10px;min-width:0;}',
      '.el-filter-label{flex:none;width:32px;font-size:12px;line-height:22px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-chip-row{display:flex;flex-wrap:wrap;gap:6px;min-width:0;}',
      '.el-chip{appearance:none;display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;cursor:pointer;transition:background .13s ease,color .13s ease,border-color .13s ease;}',
      '.el-chip:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-chip[data-active="true"]{background:var(--dsw-alias-label-primary);border-color:transparent;color:var(--dsw-alias-bg-base);}',
      '.el-sort-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:11px;border-top:.5px solid var(--dsw-alias-border-l1);}',
      '.el-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(144px,1fr));gap:22px 17px;}',
      '.el-grid{transition:opacity .16s ease;}',
      '.el-grid[data-loading="true"]{opacity:.48;}',
      '.el-dcard{appearance:none;border:0;background:transparent;padding:0;min-width:0;display:flex;flex-direction:column;gap:8px;text-align:left;cursor:pointer;border-radius:8px;}',
      '.el-dcard:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:4px;}',
      '.el-dcover{position:relative;aspect-ratio:2/3;border-radius:7px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);box-shadow:0 5px 16px rgba(0,0,0,.11),0 0 0 .5px var(--dsw-alias-border-l1);transition:transform .16s ease,box-shadow .16s ease;}',
      '.el-dcard:hover .el-dcover{transform:translateY(-2px);box-shadow:0 9px 22px rgba(0,0,0,.16),0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-dcover img{width:100%;height:100%;display:block;object-fit:cover;}',
      '.el-dcover-tone{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;color:#fff;font-size:28px;font-weight:600;}',
      '.el-drating{position:absolute;right:6px;top:6px;display:inline-flex;align-items:center;gap:2px;padding:2px 5px;border-radius:4px;background:rgba(0,0,0,.58);backdrop-filter:blur(4px);color:#fff;font-size:10px;font-weight:600;line-height:13px;}',
      '.el-drating svg{color:#f0b83c;}',
      '.el-dtitle{font-size:12.5px;line-height:17px;font-weight:600;color:var(--dsw-alias-label-primary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;}',
      '.el-dsub{font-size:10.5px;line-height:14px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-rankings{display:flex;flex-direction:column;gap:26px;width:100%;max-width:1080px;margin:0 auto;}',
      '.el-rank-section{display:flex;flex-direction:column;gap:12px;}',
      '.el-rank-section-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;}',
      '.el-rank-section-title{margin:0;font-size:16px;line-height:22px;font-weight:600;}',
      '.el-rank-section-hint{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);}',
      '.el-feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;}',
      '.el-feature{position:relative;min-height:184px;border:0;border-radius:14px;overflow:hidden;padding:0;text-align:left;cursor:pointer;color:#fff;background:#232630;box-shadow:0 8px 24px rgba(0,0,0,.14),0 0 0 .5px var(--dsw-alias-border-l1);isolation:isolate;}',
      '.el-feature:hover .el-feature-bg{transform:scale(1.12);}',
      '.el-feature-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(3px) saturate(.8);transform:scale(1.08);opacity:.62;transition:transform .4s ease;}',
      '.el-feature-shade{position:absolute;inset:0;background:linear-gradient(108deg,rgba(17,19,26,.94) 0%,rgba(17,19,26,.72) 58%,rgba(17,19,26,.32) 100%);}',
      '.el-feature-body{position:relative;z-index:1;display:flex;flex-direction:column;gap:3px;min-height:184px;padding:15px 17px;}',
      '.el-feature-kicker{font-size:10px;line-height:14px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.56);}',
      '.el-feature-title{font-size:17px;line-height:23px;font-weight:600;letter-spacing:.01em;}',
      '.el-feature-desc{font-size:11px;line-height:16px;color:rgba(255,255,255,.62);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
      '.el-feature-list{margin-top:auto;display:flex;flex-direction:column;gap:2px;padding-top:9px;}',
      '.el-feature-row{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:17px;color:rgba(255,255,255,.8);min-width:0;}',
      '.el-feature-rank{flex:none;width:14px;color:rgba(255,255,255,.48);font-variant-numeric:tabular-nums;}',
      '.el-feature-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-feature-score{flex:none;color:#f0b83c;font-weight:600;font-variant-numeric:tabular-nums;}',
      '.el-year-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}',
      '.el-year{appearance:none;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px;padding:3px 10px;border-radius:999px;cursor:pointer;}',
      '.el-year:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-year[data-active="true"]{background:var(--dsw-alias-label-primary);border-color:transparent;color:var(--dsw-alias-bg-base);}',
      '.el-type-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:10px;}',
      '.el-type-card{position:relative;min-height:108px;border:0;border-radius:12px;overflow:hidden;padding:0;text-align:left;cursor:pointer;color:#fff;background:#252832;box-shadow:0 0 0 .5px var(--dsw-alias-border-l1);isolation:isolate;}',
      '.el-type-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(1px) saturate(.75);opacity:.55;transition:transform .35s ease;}',
      '.el-type-card:hover .el-type-bg{transform:scale(1.07);}',
      '.el-type-shade{position:absolute;inset:0;background:linear-gradient(145deg,rgba(17,19,26,.86),rgba(17,19,26,.46));}',
      '.el-type-content{position:relative;z-index:1;display:flex;flex-direction:column;gap:3px;min-height:108px;padding:12px 13px;justify-content:flex-end;}',
      '.el-type-kicker{font-size:9.5px;line-height:13px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);}',
      '.el-type-title{font-size:13px;line-height:18px;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;}',
      '.el-type-meta{font-size:10.5px;line-height:14px;color:rgba(255,255,255,.6);}',
      '.el-rank-empty{font-size:12.5px;color:var(--dsw-alias-label-secondary);padding:24px 0;text-align:center;}',
      '.el-rank-detail{display:flex;flex-direction:column;gap:12px;width:100%;max-width:1080px;margin:0 auto;}',
      '.el-rank-detail-head{display:flex;align-items:center;gap:8px;min-width:0;}',
      '.el-rank-detail-title{flex:1;min-width:0;font-size:15px;line-height:22px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-rank-detail-count{flex:none;font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;}',
      '.el-rank-detail-body{min-width:0;}',
      '.el-rank-tone{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:600;}',
      '.el-rank-list{display:flex;flex-direction:column;border:.5px solid var(--dsw-alias-border-l1);border-radius:11px;overflow:hidden;background:var(--dsw-alias-bg-layer-1);}',
      '.el-rank-row{appearance:none;border:0;background:transparent;display:flex;align-items:center;gap:13px;padding:11px 14px;text-align:left;cursor:pointer;border-bottom:.5px solid var(--dsw-alias-border-l1);min-width:0;}',
      '.el-rank-row:last-child{border-bottom:0;}',
      '.el-rank-row:hover{background:var(--dsw-alias-bg-layer-2);}',
      '.el-rank-number{flex:none;width:28px;font-size:15px;font-weight:600;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));text-align:right;font-variant-numeric:tabular-nums;}',
      '.el-rank-row:nth-child(-n+3) .el-rank-number{color:var(--dsw-alias-brand-primary);}',
      '.el-rank-cover{position:relative;flex:none;width:42px;height:60px;border-radius:4px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);box-shadow:0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-rank-cover img{width:100%;height:100%;display:block;object-fit:cover;}',
      '.el-rank-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}',
      '.el-rank-title{font-size:13px;line-height:18px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-rank-sub{font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-rank-rating{flex:none;display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);}',
      '.el-rank-rating svg{color:#f0b83c;}',
      '.el-feed-sentinel{display:flex;align-items:center;justify-content:center;min-height:26px;}',
      '.el-feed-loading{display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);}',
      '.el-load-more{display:flex;justify-content:center;padding:8px 0 2px;}',
      '.el-tag-row{display:flex;flex-wrap:wrap;gap:6px;}',
      '.el-tag{padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);}',
      '.el-detail{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);-webkit-app-region:no-drag;animation:el-fade .14s ease;}',
      '.el-detail-head{flex:none;display:flex;align-items:center;gap:10px;padding:calc(12px + var(--dsh-frame-top-clearance,0px)) clamp(16px,2.6vw,30px) 12px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);}',
      '.el-detail-head-title{flex:1;min-width:0;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-detail-scroll{flex:1;min-height:0;overflow:auto;padding:24px clamp(16px,2.6vw,30px) 40px;}',
      '.el-detail-inner{max-width:880px;margin:0 auto;}',
      '.el-detail-hero{display:flex;align-items:flex-start;gap:26px;}',
      '.el-detail-cover{flex:none;width:clamp(120px,17vw,168px);aspect-ratio:2/3;border-radius:8px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);box-shadow:0 10px 30px rgba(0,0,0,.18),0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-detail-cover img{width:100%;height:100%;display:block;object-fit:cover;}',
      '.el-detail-main{flex:1;min-width:0;padding-top:2px;}',
      '.el-detail-title{margin:0;font-size:23px;line-height:31px;font-weight:600;letter-spacing:.01em;word-break:break-word;}',
      '.el-detail-sub{margin:5px 0 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);}',
      '.el-detail-byline{margin:9px 0 0;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-rating-line{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;}',
      '.el-rating-value{font-size:24px;line-height:28px;font-weight:600;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;}',
      '.el-stars{display:inline-flex;gap:1px;color:#f0b83c;}',
      '.el-rating-count{font-size:11.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-detail-actions{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;}',
      '.el-detail-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px 18px;margin-top:20px;padding-top:16px;border-top:.5px solid var(--dsw-alias-border-l1);}',
      '.el-meta-row{display:flex;gap:8px;min-width:0;font-size:12px;line-height:18px;}',
      '.el-meta-label{flex:none;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-meta-value{color:var(--dsw-alias-label-secondary);word-break:break-word;}',
      '.el-detail-section{margin-top:26px;}',
      '.el-detail-section h3{margin:0 0 9px;font-size:14px;line-height:20px;font-weight:600;}',
      '.el-prose{margin:0;font-size:13px;line-height:1.8;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word;}',
      '.el-catalog{display:flex;flex-direction:column;gap:3px;font-size:12.5px;line-height:19px;color:var(--dsw-alias-label-secondary);}',
      '.el-catalog-line{padding:1px 0;border-bottom:.5px dashed color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);}',
      '.el-honor-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}',
      '.el-honor{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:5px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 14%,transparent);color:var(--dsw-alias-state-warn-primary);font-size:10.5px;line-height:16px;font-weight:500;}',
      '@media (max-width:680px){.el-feature-grid{grid-template-columns:1fr;}.el-type-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.el-feature{min-height:172px;}.el-feature-body{min-height:172px;}}',
      '.el-reader{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);-webkit-app-region:no-drag;animation:el-fade .14s ease;}',
      '.el-reader-bar{flex:none;display:flex;align-items:center;gap:8px;padding:calc(10px + var(--dsh-frame-top-clearance,0px)) clamp(12px,2vw,22px) 8px;border-bottom:.5px solid transparent;background:var(--dsw-alias-bg-base);}',
      '.el-reader-bar button,.el-reader-bar a,.el-reader-bar input{-webkit-app-region:no-drag;}',
      '.el-reader-bar-title{flex:1;min-width:0;text-align:center;}',
      '.el-reader-book{font-size:12px;line-height:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-primary);}',
      '.el-reader-chapter{font-size:10.5px;line-height:14px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.el-reader-bar-side{display:flex;align-items:center;gap:2px;flex:none;min-width:74px;}',
      '.el-reader-bar-side[data-align="end"]{justify-content:flex-end;}',
      '.el-reader-progress{flex:none;height:2px;margin:0 clamp(12px,2vw,22px);background:var(--dsw-alias-bg-layer-2);border-radius:1px;overflow:hidden;}',
      '.el-reader-progress-fill{height:100%;background:var(--dsw-alias-brand-primary);transition:width .2s ease;}',
      '.el-reader-scroll{flex:1;min-height:0;overflow:auto;padding:0 clamp(14px,3vw,30px) 70px;scroll-behavior:auto;}',
      '.el-reader-sheet{max-width:760px;margin:0 auto;padding:26px 0 30px;}',
      '.el-reader-kicker{font-size:10.5px;line-height:15px;letter-spacing:.12em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));margin-bottom:10px;text-align:center;}',
      '.el-reader-heading{margin:0 0 26px;text-align:center;font-size:22px;line-height:31px;font-weight:600;letter-spacing:.01em;}',
      '.el-reader-byline{margin:-18px 0 28px;text-align:center;font-size:11.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));}',
      '.el-chapter{font-size:var(--reader-font-size,18px);line-height:var(--reader-line-height,1.8);font-family:var(--reader-font-family,Georgia,"Songti SC","STSong",serif);color:var(--dsw-alias-label-primary);word-wrap:break-word;overflow-wrap:break-word;}',
      '.el-chapter p{margin:0 0 .95em;text-indent:2em;}',
      '.el-chapter p:last-child{margin-bottom:0;}',
      '.el-chapter p.el-no-indent{text-indent:0;}',
      '.el-chapter h1,.el-chapter h2,.el-chapter h3,.el-chapter h4,.el-chapter h5,.el-chapter h6{margin:1.5em 0 .65em;line-height:1.35;font-family:inherit;font-weight:600;letter-spacing:.01em;text-indent:0;}',
      '.el-chapter h1{font-size:1.45em;}.el-chapter h2{font-size:1.28em;}.el-chapter h3{font-size:1.14em;}.el-chapter h4,.el-chapter h5,.el-chapter h6{font-size:1.02em;}',
      '.el-chapter img{max-width:100%;height:auto;display:block;margin:1.25em auto;border-radius:4px;}',
      '.el-chapter svg{max-width:100%;height:auto;}',
      '.el-chapter table{max-width:100%;border-collapse:collapse;margin:1.2em auto;font-size:.9em;}',
      '.el-chapter td,.el-chapter th{border:1px solid var(--dsw-alias-border-l1);padding:5px 8px;vertical-align:top;}',
      '.el-chapter blockquote{margin:1.2em 0;padding:.1em 0 .1em 1em;border-left:2px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);}',
      '.el-chapter blockquote p{text-indent:0;}',
      '.el-chapter a{color:var(--dsw-alias-brand-primary);text-decoration:none;}',
      '.el-chapter a:hover{text-decoration:underline;}',
      '.el-chapter hr{border:0;border-top:1px solid var(--dsw-alias-border-l1);margin:2em 0;}',
      '.el-chapter pre{white-space:pre-wrap;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.82em;background:var(--dsw-alias-bg-layer-2);padding:12px;border-radius:8px;}',
      '.el-chapter ul,.el-chapter ol{margin:0 0 1em;padding-left:1.6em;}',
      '.el-chapter li{margin:.2em 0;}',
      '.el-reader-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:760px;margin:40px auto 0;padding-top:20px;border-top:.5px solid var(--dsw-alias-border-l1);}',
      '.el-reader-foot .el-btn{height:34px;}',
      '.el-reader-hint{font-size:10.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));letter-spacing:.02em;}',
      '.el-reader-overlay{position:absolute;inset:0;z-index:50;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 42%,transparent);-webkit-app-region:no-drag;animation:el-fade .14s ease;}',
      '.el-reader-panel{position:absolute;right:0;top:0;bottom:0;z-index:51;width:min(380px,88%);display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1);border-left:.5px solid var(--dsw-alias-border-l1);box-shadow:-16px 0 50px color-mix(in srgb,var(--dsw-alias-bg-overlay) 24%,transparent);animation:el-slide .18s ease;}',
      '.el-reader-panel[data-kind="settings"]{top:calc(50px + var(--dsh-frame-top-clearance,0px));bottom:auto;right:clamp(12px,2vw,22px);width:min(330px,calc(100% - 24px));border:.5px solid var(--dsw-alias-border-l1);border-radius:12px;box-shadow:0 16px 48px color-mix(in srgb,var(--dsw-alias-bg-overlay) 30%,transparent);animation:el-rise .16s ease;}',
      '@keyframes el-slide{from{transform:translateX(14px);opacity:.6;}to{transform:none;opacity:1;}}',
      '.el-reader-panel-head{flex:none;display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:.5px solid var(--dsw-alias-border-l1);}',
      '.el-reader-panel-head h2{margin:0;flex:1;font-size:13px;line-height:18px;font-weight:600;}',
      '.el-toc-list{flex:1;min-height:0;overflow:auto;padding:7px;}',
      '.el-toc-item{appearance:none;width:100%;border:0;background:transparent;display:flex;align-items:baseline;gap:9px;padding:8px 9px;border-radius:7px;text-align:left;cursor:pointer;color:var(--dsw-alias-label-secondary);}',
      '.el-toc-item:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-toc-item[data-active="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:600;}',
      '.el-toc-index{flex:none;width:24px;font-size:10.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));font-variant-numeric:tabular-nums;text-align:right;}',
      '.el-toc-label{flex:1;min-width:0;font-size:12.5px;line-height:18px;word-break:break-word;}',
      '.el-settings-body{display:flex;flex-direction:column;gap:4px;padding:8px 16px 16px;}',
      '.el-settings-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:.5px solid var(--dsw-alias-border-l1);}',
      '.el-settings-row:last-child{border-bottom:0;}',
      '.el-settings-label{font-size:12.5px;color:var(--dsw-alias-label-primary);}',
      '.el-settings-value{font-size:11.5px;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));min-width:34px;text-align:right;font-variant-numeric:tabular-nums;}',
      '.el-stepper{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);}',
      '.el-stepper button{width:27px;height:26px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;line-height:1;}',
      '.el-stepper button:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.el-seg{display:inline-flex;padding:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1);}',
      '.el-seg button{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:16px;padding:4px 10px;cursor:pointer;}',
      '.el-seg button[data-active="true"]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.07),0 0 0 .5px var(--dsw-alias-border-l1);}',
      '.el-reader-message{display:flex;flex-direction:column;align-items:center;gap:12px;padding:80px 20px;text-align:center;color:var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary));font-size:12.5px;}',
      '@media (hover:none){',
      '  .el-book-remove{opacity:1;transform:none;}',
      '}',
      '@media (max-width:680px){',
      '  .el-head{padding-left:14px;padding-right:14px;}',
      '  .el-body{padding:14px 14px 28px;}',
      '  .el-title{font-size:19px;}',
      '  .el-head-actions .el-btn span{display:none;}',
      '  .el-tab span{display:none;}',
      '  .el-shelf-grid{grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:19px 13px;}',
      '  .el-grid{grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:18px 13px;}',
      '  .el-filter-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 8px;align-items:end;}',
      '  .el-filter-item{flex-direction:column;align-items:stretch;gap:4px;}',
      '  .el-filter-select{width:100%;min-width:0;}',
      '  .el-filter-actions{grid-column:1 / -1;justify-self:end;margin-left:0;}',
      '  .el-detail-hero{gap:16px;}',
      '  .el-detail-cover{width:112px;}',
      '  .el-detail-title{font-size:19px;line-height:26px;}',
      '  .el-detail-scroll{padding:18px 14px 32px;}',
      '  .el-reader-sheet{padding-top:18px;}',
      '  .el-reader-heading{font-size:19px;line-height:27px;}',
      '  .el-chapter{font-size:17px;}',
      '  .el-reader-bar-side{min-width:auto;}',
      '}',
    ].join('\n')

    function Spinner() {
      return h('span', { className: 'el-spinner', 'aria-hidden': 'true' })
    }

    function StateBlock({ children, error, onRetry, t }) {
      return h('div', { className: 'el-state' },
        error ? h(IconRefresh, { size: 20 }) : h(Spinner),
        h('div', null, children || (error ? error : t('discover.loading'))),
        error && onRetry ? h('button', { type: 'button', className: 'el-btn', onClick: onRetry }, t('discover.retry')) : null)
    }

    function BookCover({ book, className, showFormat, children }) {
      const [failed, setFailed] = useState(false)
      const title = book && book.title ? book.title : ''
      const author = book && book.author ? book.author : ''
      const cover = book && book.cover ? coverSource(book.cover) : ''
      const tone = coverTone(title)
      return h('div', { className: className || 'el-book-cover' },
        cover && !failed
          ? h('img', { src: cover, alt: '', loading: 'lazy', onError: () => setFailed(true) })
          : h('div', { className: 'el-book-tone', style: tone },
            h('span', { className: 'el-book-initial' }, bookInitial(title)),
            author ? h('span', { className: 'el-book-tone-label' }, author) : null),
        showFormat && book && book.format
          ? h('span', { className: 'el-book-format' }, book.format === 'epub' ? 'EPUB' : 'TXT')
          : null,
        children || null)
    }

    function EmptyState({ icon, title, text, action }) {
      return h('div', { className: 'el-empty' },
        h('div', { className: 'el-empty-icon' }, icon || h(IconShelf, { size: 24 })),
        h('p', { className: 'el-empty-title' }, title),
        text ? h('p', { className: 'el-empty-text' }, text) : null,
        action || null)
    }

    function ConfirmDialog({ title, text, confirmLabel, cancelLabel, onConfirm, onCancel }) {
      const dialogRef = useRef(null)
      useEffect(() => {
        if (dialogRef.current) dialogRef.current.focus()
      }, [])
      return h('div', { className: 'el-modal-backdrop', role: 'presentation', onClick: onCancel },
        h('div', {
          className: 'el-modal',
          ref: dialogRef,
          tabIndex: -1,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'el-confirm-title',
          onClick: event => event.stopPropagation(),
          onKeyDown: event => {
            if (event.key === 'Escape') onCancel()
          },
        },
        h('h2', { className: 'el-modal-title', id: 'el-confirm-title' }, title),
        text ? h('p', { className: 'el-modal-text' }, text) : null,
        h('div', { className: 'el-modal-actions' },
          h('button', { type: 'button', className: 'el-btn', onClick: onCancel }, cancelLabel),
          h('button', { type: 'button', className: 'el-btn', 'data-variant': 'danger', onClick: onConfirm }, confirmLabel))))
    }

    function Toast({ message, kind }) {
      return h('div', { className: 'el-toast', 'data-kind': kind || 'info', role: 'status' }, message)
    }

    function readStoredReaderSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return { ...DEFAULT_READER_SETTINGS }
        const value = JSON.parse(raw)
        if (!value || typeof value !== 'object') return { ...DEFAULT_READER_SETTINGS }
        return {
          fontSize: clamp(Math.round(Number(value.fontSize) || DEFAULT_READER_SETTINGS.fontSize), 14, 26),
          lineHeight: clamp(Number(value.lineHeight) || DEFAULT_READER_SETTINGS.lineHeight, 1.4, 2.2),
          serif: value.serif !== false,
        }
      } catch {
        return { ...DEFAULT_READER_SETTINGS }
      }
    }

    function persistReaderSettings(settings) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      } catch {
        /* private mode can reject storage */
      }
    }

    async function bytesToDisplayDataUrl(bytes, mime, maxWidth) {
      const type = String(mime || '').toLowerCase()
      if (!bytes || !bytes.byteLength) return ''
      if (type === 'image/svg+xml') {
        return `data:image/svg+xml;base64,${base64FromBytes(bytes)}`
      }
      if (!/^image\/(?:jpeg|png|gif|webp|avif)$/.test(type)) return ''
      if (bytes.byteLength <= 900 * 1024 && type !== 'image/avif') {
        return `data:${type};base64,${base64FromBytes(bytes)}`
      }
      let objectUrl = ''
      try {
        objectUrl = URL.createObjectURL(new Blob([bytes], { type }))
        const image = await new Promise((resolve, reject) => {
          const element = new Image()
          element.onload = () => resolve(element)
          element.onerror = () => reject(new Error('image decode failed'))
          element.src = objectUrl
        })
        const naturalWidth = image.naturalWidth || 800
        const naturalHeight = image.naturalHeight || 1200
        const width = Math.min(maxWidth || 1400, naturalWidth)
        const height = Math.max(1, Math.round((naturalHeight / naturalWidth) * width))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('canvas unavailable')
        context.drawImage(image, 0, 0, width, height)
        return canvas.toDataURL('image/jpeg', 0.82)
      } catch {
        if (bytes.byteLength <= 4 * 1024 * 1024) {
          return `data:${type};base64,${base64FromBytes(bytes)}`
        }
        return ''
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
      }
    }

    function findElementById(container, id) {
      if (!container || !id) return null
      try {
        if (window.CSS && typeof window.CSS.escape === 'function') {
          return container.querySelector(`#${window.CSS.escape(id)}`)
        }
      } catch {
        /* fall back to a manual lookup */
      }
      const nodes = container.querySelectorAll('[id]')
      for (const node of nodes) {
        if (node.getAttribute('id') === id) return node
      }
      return null
    }

    function chapterHtmlTitle(fragment) {
      const heading = fragment.querySelector('h1, h2, h3, h4')
      const value = heading ? squashText(heading.textContent || '') : ''
      return value.slice(0, 160)
    }

    async function buildEpubChapter(source, book, index) {
      const item = book.spine[index]
      if (!item || !source || !source.zip) throw new Error('The chapter is unavailable.')
      const raw = await source.zip.text(item.href)
      const doc = parseMarkupDocument(raw, 'application/xhtml+xml')
      const body = doc.body || doc.documentElement
      const fragment = document.createElement('div')
      fragment.innerHTML = body ? body.innerHTML : ''
      for (const node of Array.from(fragment.querySelectorAll(
        'script, style, link, iframe, frame, frameset, object, embed, video, audio, source, track, form, input, button, select, textarea, base, meta, noscript'))) {
        node.remove()
      }
      for (const node of Array.from(fragment.querySelectorAll('*'))) {
        for (const attribute of Array.from(node.attributes)) {
          const name = attribute.name.toLowerCase()
          if (name.startsWith('on')) node.removeAttribute(attribute.name)
          else if (name === 'style' || name === 'bgcolor' || name === 'background' ||
                   name === 'color' || name === 'link' || name === 'vlink' || name === 'alink' ||
                   name === 'contenteditable' || name === 'srcset' || name === 'sizes') {
            node.removeAttribute(attribute.name)
          }
        }
      }
      for (const link of Array.from(fragment.querySelectorAll('a[href]'))) {
        const rawHref = link.getAttribute('href') || ''
        if (/^\s*javascript:/i.test(rawHref)) {
          link.removeAttribute('href')
          continue
        }
        const target = resolveArchivePath(item.href, rawHref)
        if (target.external) {
          link.setAttribute('href', target.path)
          link.setAttribute('target', '_blank')
          link.setAttribute('rel', 'noopener noreferrer')
          continue
        }
        let targetIndex = book.spine.findIndex(entry => entry.href === target.path)
        if (targetIndex < 0) {
          const lower = String(target.path || '').toLowerCase()
          targetIndex = book.spine.findIndex(entry => entry.href.toLowerCase() === lower)
        }
        if (targetIndex < 0) {
          link.removeAttribute('href')
          continue
        }
        link.setAttribute('href', `#el-chapter-${targetIndex}`)
        link.setAttribute('data-el-chapter', String(targetIndex))
        if (target.hash) link.setAttribute('data-el-anchor', target.hash)
      }
      let images = 0
      for (const node of Array.from(fragment.querySelectorAll('img, image'))) {
        if (images >= MAX_EMBED_IMAGES) {
          node.remove()
          continue
        }
        const isSvgImage = node.localName === 'image'
        const rawSrc = isSvgImage
          ? node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || node.getAttribute('xlink:href') || ''
          : node.getAttribute('src') || ''
        if (!rawSrc || /^data:/i.test(rawSrc)) continue
        if (/^(?:https?:)?\/\//i.test(rawSrc)) {
          if (!isSvgImage) {
            node.setAttribute('loading', 'lazy')
            node.setAttribute('referrerpolicy', 'no-referrer')
          }
          continue
        }
        const target = resolveArchivePath(item.href, rawSrc)
        if (target.external || !source.zip.has(target.path)) {
          node.remove()
          continue
        }
        try {
          const bytes = await source.zip.read(target.path)
          if (bytes.byteLength > MAX_EMBED_IMAGE_BYTES) {
            node.remove()
            continue
          }
          const data = await bytesToDisplayDataUrl(bytes, mimeForPath(target.path), 1400)
          if (!data) {
            node.remove()
            continue
          }
          if (isSvgImage) {
            node.setAttribute('href', data)
            node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', data)
          } else {
            node.setAttribute('src', data)
            node.removeAttribute('width')
            node.removeAttribute('height')
          }
          images += 1
        } catch {
          node.remove()
        }
      }
      return {
        kind: 'epub',
        html: fragment.innerHTML,
        title: chapterHtmlTitle(fragment) || squashText(item.label || ''),
      }
    }

    function buildTxtChapter(source, book, index) {
      const chapter = book.chapters[index]
      if (!chapter || !source || typeof source.text !== 'string') {
        throw new Error('The chapter is unavailable.')
      }
      const raw = source.text.slice(chapter.start, chapter.end)
      const paragraphs = raw
        .split('\n')
        .map(line => line.replace(/^[\t \u3000]+/, '').replace(/[\t ]+$/, ''))
      const title = squashText(chapter.label || '')
      while (paragraphs.length && !paragraphs[0].trim()) paragraphs.shift()
      while (paragraphs.length && !paragraphs[paragraphs.length - 1].trim()) paragraphs.pop()
      if (title && paragraphs.length && paragraphs[0].trim() === title) paragraphs.shift()
      while (paragraphs.length && !paragraphs[0].trim()) paragraphs.shift()
      return {
        kind: 'txt',
        paragraphs: paragraphs.filter((line, position) => line.trim() || position > 0),
        title,
      }
    }

    async function openReaderSource(book) {
      const blob = await fetchBookFile(book.id)
      if (book.format === 'epub') {
        return { kind: 'epub', zip: new ZipArchive(await blob.arrayBuffer()) }
      }
      const decoded = decodeTextFile(await blob.arrayBuffer())
      return { kind: 'txt', text: decoded.text.replace(/\r\n?/g, '\n') }
    }

    function readReaderChapter(source, book, index) {
      if (source.kind === 'epub') return buildEpubChapter(source, book, index)
      return Promise.resolve(buildTxtChapter(source, book, index))
    }

    function chapterLabel(book, index, t) {
      const entry = book && Array.isArray(book.spine) ? book.spine[index] : null
      const label = entry && entry.label ? squashText(entry.label) : ''
      return label || t('reader.chapter', { n: index + 1 })
    }

    function Reader({ book, initialChapter, initialScroll, t, onClose, onProgress }) {
      const total = Math.max(1, Number(book.chapterCount) || 1)
      const startChapter = clamp(Math.round(Number(initialChapter) || 0), 0, total - 1)
      const startRatio = clamp(Number(initialScroll) || 0, 0, 1)
      const [index, setIndex] = useState(startChapter)
      const [sourceReady, setSourceReady] = useState(false)
      const [reloadToken, setReloadToken] = useState(0)
      const [content, setContent] = useState(null)
      const [phase, setPhase] = useState('loading')
      const [error, setError] = useState('')
      const [displayRatio, setDisplayRatio] = useState(startRatio)
      const [tocOpen, setTocOpen] = useState(false)
      const [settingsOpen, setSettingsOpen] = useState(false)
      const [settings, setSettings] = useState(readStoredReaderSettings)
      const sourceRef = useRef(null)
      const scrollRef = useRef(null)
      const contentRef = useRef(null)
      const timerRef = useRef(0)
      const pendingRef = useRef({ chapter: startChapter, ratio: startRatio, anchor: '' })
      const latestRef = useRef({ index: startChapter, ratio: startRatio })
      const rafRef = useRef(0)

      useEffect(() => {
        persistReaderSettings(settings)
      }, [settings])

      useEffect(() => {
        latestRef.current.index = index
      }, [index])

      useEffect(() => {
        let alive = true
        setSourceReady(false)
        setPhase('loading')
        setError('')
        sourceRef.current = null
        openReaderSource(book).then(source => {
          if (!alive) return
          sourceRef.current = source
          setSourceReady(true)
        }).catch(reason => {
          if (!alive) return
          setPhase('error')
          setError(reason && reason.message ? reason.message : t('reader.chapterFailed'))
        })
        return () => {
          alive = false
        }
      }, [book.id, reloadToken])

      useEffect(() => {
        if (!sourceReady || !sourceRef.current) return undefined
        let alive = true
        setPhase('loading')
        setError('')
        setContent(null)
        readReaderChapter(sourceRef.current, book, index).then(result => {
          if (!alive) return
          setContent(result)
          setPhase('ready')
        }).catch(reason => {
          if (!alive) return
          setPhase('error')
          setError(reason && reason.message ? reason.message : t('reader.chapterFailed'))
        })
        return () => {
          alive = false
        }
      }, [sourceReady, index, book, reloadToken])

      const currentRatio = useCallback(() => {
        const element = scrollRef.current
        if (!element) return latestRef.current.ratio
        const maximum = element.scrollHeight - element.clientHeight
        return maximum > 0 ? clamp(element.scrollTop / maximum, 0, 1) : 0
      }, [])

      const commitProgress = useCallback(() => {
        const ratio = currentRatio()
        latestRef.current.ratio = ratio
        onProgress({
          bookId: book.id,
          chapterIndex: latestRef.current.index,
          scrollRatio: ratio,
        })
      }, [book.id, currentRatio, onProgress])

      const flushProgress = useCallback(() => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = 0
        }
        commitProgress()
      }, [commitProgress])

      useEffect(() => {
        const element = scrollRef.current
        if (!element) return undefined
        const onScroll = () => {
          latestRef.current.ratio = currentRatio()
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = 0
              setDisplayRatio(currentRatio())
            })
          }
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            timerRef.current = 0
            commitProgress()
          }, 1100)
        }
        element.addEventListener('scroll', onScroll, { passive: true })
        return () => {
          element.removeEventListener('scroll', onScroll)
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = 0
          }
          if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = 0
          }
        }
      }, [currentRatio, commitProgress])

      useEffect(() => {
        const onHidden = () => {
          if (document.visibilityState === 'hidden') flushProgress()
        }
        const onPageHide = () => flushProgress()
        document.addEventListener('visibilitychange', onHidden)
        window.addEventListener('pagehide', onPageHide)
        return () => {
          document.removeEventListener('visibilitychange', onHidden)
          window.removeEventListener('pagehide', onPageHide)
          flushProgress()
        }
      }, [flushProgress])

      useEffect(() => {
        if (phase !== 'ready') return undefined
        const element = scrollRef.current
        if (!element) return undefined
        const pending = pendingRef.current
        const frame = requestAnimationFrame(() => {
          const container = contentRef.current
          if (pending.anchor && pending.chapter === index && container) {
            const target = findElementById(container, pending.anchor)
            if (target) {
              const containerBox = element.getBoundingClientRect()
              const targetBox = target.getBoundingClientRect()
              element.scrollTop += targetBox.top - containerBox.top - 18
              latestRef.current.ratio = currentRatio()
              setDisplayRatio(latestRef.current.ratio)
              pendingRef.current = { chapter: -1, ratio: 0, anchor: '' }
              return
            }
          }
          if (pending.chapter === index) {
            const maximum = element.scrollHeight - element.clientHeight
            element.scrollTop = maximum > 0 ? pending.ratio * maximum : 0
          } else {
            element.scrollTop = 0
          }
          latestRef.current.ratio = currentRatio()
          setDisplayRatio(latestRef.current.ratio)
          pendingRef.current = { chapter: -1, ratio: 0, anchor: '' }
        })
        return () => cancelAnimationFrame(frame)
      }, [phase, index, content, currentRatio])

      const scrollToAnchor = useCallback(anchor => {
        const element = scrollRef.current
        const container = contentRef.current
        if (!element || !container || !anchor) return
        const target = findElementById(container, anchor)
        if (!target) return
        const containerBox = element.getBoundingClientRect()
        const targetBox = target.getBoundingClientRect()
        element.scrollTop += targetBox.top - containerBox.top - 18
        latestRef.current.ratio = currentRatio()
      }, [currentRatio])

      const goToChapter = useCallback((next, anchor) => {
        const target = clamp(Math.round(Number(next) || 0), 0, total - 1)
        if (target === index) {
          if (anchor) scrollToAnchor(anchor)
          return
        }
        flushProgress()
        pendingRef.current = { chapter: target, ratio: 0, anchor: anchor || '' }
        latestRef.current = { index: target, ratio: 0 }
        setDisplayRatio(0)
        setTocOpen(false)
        setSettingsOpen(false)
        setIndex(target)
      }, [flushProgress, index, scrollToAnchor, total])

      const closeReader = useCallback(() => {
        flushProgress()
        onClose()
      }, [flushProgress, onClose])

      useEffect(() => {
        const onKeyDown = event => {
          const tag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : ''
          if (tag === 'input' || tag === 'textarea' || tag === 'select') return
          if (event.key === 'Escape') {
            if (tocOpen) setTocOpen(false)
            else if (settingsOpen) setSettingsOpen(false)
            else closeReader()
            return
          }
          if (tocOpen || settingsOpen) return
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            goToChapter(index - 1)
          } else if (event.key === 'ArrowRight') {
            event.preventDefault()
            goToChapter(index + 1)
          }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [closeReader, goToChapter, index, settingsOpen, tocOpen])

      const onChapterClick = event => {
        const anchor = event.target && typeof event.target.closest === 'function'
          ? event.target.closest('a[data-el-chapter]')
          : null
        if (!anchor) return
        event.preventDefault()
        const next = Number(anchor.getAttribute('data-el-chapter'))
        goToChapter(next, anchor.getAttribute('data-el-anchor') || '')
      }

      const percent = clamp(Math.round(((index + displayRatio) / total) * 100), 0, 100)
      const heading = content && content.title ? content.title : chapterLabel(book, index, t)
      const fontFamily = settings.serif
        ? 'Georgia, "Songti SC", "STSong", "Noto Serif CJK SC", serif'
        : 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'
      const showToc = tocOpen
      const showSettings = settingsOpen
      const atStart = index <= 0
      const atEnd = index >= total - 1

      return h('div', { className: 'el-reader' },
        h('div', { className: 'el-reader-bar', 'data-window-drag': '' },
          h('div', { className: 'el-reader-bar-side' },
            h('button', {
              type: 'button',
              className: 'el-btn',
              'data-variant': 'ghost',
              onClick: closeReader,
              title: t('reader.back'),
            }, h(IconArrowLeft, { size: 16 }), h('span', null, t('reader.back')))),
          h('div', { className: 'el-reader-bar-title' },
            h('div', { className: 'el-reader-book' }, book.title),
            h('div', { className: 'el-reader-chapter' }, `${heading} · ${t('reader.chapterIndex', { current: index + 1, total })}`)),
          h('div', { className: 'el-reader-bar-side', 'data-align': 'end' },
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              onClick: () => goToChapter(index - 1),
              disabled: atStart,
              title: t('reader.prev'),
              'aria-label': t('reader.prev'),
            }, h(IconChevronLeft, { size: 18 })),
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              onClick: () => goToChapter(index + 1),
              disabled: atEnd,
              title: t('reader.next'),
              'aria-label': t('reader.next'),
            }, h(IconChevronRight, { size: 18 })),
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              'data-active': showToc ? 'true' : 'false',
              onClick: () => {
                setSettingsOpen(false)
                setTocOpen(value => !value)
              },
              title: t('reader.toc'),
              'aria-label': t('reader.toc'),
            }, h(IconList, { size: 17 })),
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              'data-active': showSettings ? 'true' : 'false',
              onClick: () => {
                setTocOpen(false)
                setSettingsOpen(value => !value)
              },
              title: t('reader.settings'),
              'aria-label': t('reader.settings'),
            }, h(IconType, { size: 17 })),
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              onClick: closeReader,
              title: t('common.close'),
              'aria-label': t('common.close'),
            }, h(IconClose, { size: 17 })))),
        h('div', { className: 'el-reader-progress' },
          h('div', { className: 'el-reader-progress-fill', style: { width: `${percent}%` } })),
        h('div', { className: 'el-reader-scroll', ref: scrollRef },
          h('div', { className: 'el-reader-sheet' },
            phase === 'error'
              ? h('div', { className: 'el-reader-message' },
                h(IconBookOpen, { size: 26 }),
                h('div', null, error || t('reader.chapterFailed')),
                h('button', {
                  type: 'button',
                  className: 'el-btn',
                  onClick: () => setReloadToken(value => value + 1),
                }, t('reader.retry')))
              : phase !== 'ready'
                ? h('div', { className: 'el-reader-message' }, h(Spinner), h('div', null, t('reader.rendering')))
                : content && content.kind === 'txt'
                  ? h(React.Fragment, null,
                    heading ? h('h1', { className: 'el-reader-heading' }, heading) : null,
                    h('div', {
                      className: 'el-chapter',
                      style: {
                        '--reader-font-size': `${settings.fontSize}px`,
                        '--reader-line-height': String(settings.lineHeight),
                        '--reader-font-family': fontFamily,
                      },
                    },
                    (content.paragraphs || []).map((line, position) =>
                      line.trim()
                        ? h('p', { key: position }, line.trim())
                        : h('div', { key: position, className: 'el-chapter-gap', style: { height: '0.7em' } }))))
                  : h('div', {
                    className: 'el-chapter',
                    ref: contentRef,
                    onClick: onChapterClick,
                    style: {
                      '--reader-font-size': `${settings.fontSize}px`,
                      '--reader-line-height': String(settings.lineHeight),
                      '--reader-font-family': fontFamily,
                    },
                    dangerouslySetInnerHTML: { __html: content ? content.html : '' },
                  }),
            h('div', { className: 'el-reader-foot' },
              h('button', {
                type: 'button',
                className: 'el-btn',
                disabled: atStart,
                onClick: () => goToChapter(index - 1),
              }, h(IconChevronLeft, { size: 15 }), h('span', null, t('reader.prev'))),
              h('span', { className: 'el-reader-hint' }, t('reader.keyboardHint')),
              h('button', {
                type: 'button',
                className: 'el-btn',
                disabled: atEnd,
                onClick: () => goToChapter(index + 1),
              }, h('span', null, t('reader.next')), h(IconChevronRight, { size: 15 }))))),
        showToc ? h('div', { className: 'el-reader-overlay', onClick: () => setTocOpen(false) },
          h('aside', {
            className: 'el-reader-panel',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('reader.tocTitle'),
            onClick: event => event.stopPropagation(),
          },
          h('div', { className: 'el-reader-panel-head' },
            h('h2', null, t('reader.tocTitle')),
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              onClick: () => setTocOpen(false),
              title: t('common.close'),
              'aria-label': t('common.close'),
            }, h(IconClose, { size: 16 }))),
          h('div', { className: 'el-toc-list' },
            Array.from({ length: total }, (_, position) =>
              h('button', {
                key: position,
                type: 'button',
                className: 'el-toc-item',
                'data-active': position === index ? 'true' : 'false',
                onClick: () => goToChapter(position),
              },
              h('span', { className: 'el-toc-index' }, String(position + 1)),
              h('span', { className: 'el-toc-label' }, chapterLabel(book, position, t))))))
        ) : null,
        showSettings ? h('div', { className: 'el-reader-overlay', onClick: () => setSettingsOpen(false) },
          h('aside', {
            className: 'el-reader-panel',
            'data-kind': 'settings',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('reader.settings'),
            onClick: event => event.stopPropagation(),
          },
          h('div', { className: 'el-reader-panel-head' },
            h('h2', null, t('reader.settings')),
            h('button', {
              type: 'button',
              className: 'el-icon-btn',
              onClick: () => setSettingsOpen(false),
              title: t('common.close'),
              'aria-label': t('common.close'),
            }, h(IconClose, { size: 16 }))),
          h('div', { className: 'el-settings-body' },
            h('div', { className: 'el-settings-row' },
              h('span', { className: 'el-settings-label' }, t('reader.fontSize')),
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                h('div', { className: 'el-stepper' },
                  h('button', {
                    type: 'button',
                    onClick: () => setSettings(value => ({ ...value, fontSize: clamp(value.fontSize - 1, 14, 26) })),
                    'aria-label': '-',
                  }, '−'),
                  h('button', {
                    type: 'button',
                    onClick: () => setSettings(value => ({ ...value, fontSize: clamp(value.fontSize + 1, 14, 26) })),
                    'aria-label': '+',
                  }, '+')),
                h('span', { className: 'el-settings-value' }, `${settings.fontSize}px`))),
            h('div', { className: 'el-settings-row' },
              h('span', { className: 'el-settings-label' }, t('reader.lineHeight')),
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                h('div', { className: 'el-stepper' },
                  h('button', {
                    type: 'button',
                    onClick: () => setSettings(value => ({ ...value, lineHeight: clamp(Number((value.lineHeight - 0.1).toFixed(1)), 1.4, 2.2) })),
                    'aria-label': '-',
                  }, '−'),
                  h('button', {
                    type: 'button',
                    onClick: () => setSettings(value => ({ ...value, lineHeight: clamp(Number((value.lineHeight + 0.1).toFixed(1)), 1.4, 2.2) })),
                    'aria-label': '+',
                  }, '+')),
                h('span', { className: 'el-settings-value' }, settings.lineHeight.toFixed(1)))),
            h('div', { className: 'el-settings-row' },
              h('span', { className: 'el-settings-label' }, t('reader.serif')),
              h('div', { className: 'el-seg' },
                h('button', {
                  type: 'button',
                  'data-active': settings.serif ? 'true' : 'false',
                  onClick: () => setSettings(value => ({ ...value, serif: true })),
                }, t('reader.serifOn')),
                h('button', {
                  type: 'button',
                  'data-active': settings.serif ? 'false' : 'true',
                  onClick: () => setSettings(value => ({ ...value, serif: false })),
                }, t('reader.serifOff'))))))
        ) : null)
    }

    function Shelf({ books, progress, loading, error, importing, onRefresh, onOpen, onDelete, onImport, t, locale }) {
      const [query, setQuery] = useState('')
      const [sort, setSort] = useState('recent')
      const [confirming, setConfirming] = useState(null)
      const inputRef = useRef(null)
      const english = locale === 'en'

      const visible = useMemo(() => {
        const needle = query.trim().toLowerCase()
        const filtered = books.filter(book => {
          if (!needle) return true
          return `${book.title || ''} ${book.author || ''} ${book.fileName || ''}`.toLowerCase().includes(needle)
        })
        return filtered.slice().sort((left, right) => {
          if (sort === 'title') {
            return String(left.title || '').localeCompare(String(right.title || ''), english ? 'en' : 'zh-CN')
          }
          const leftTime = Number(sort === 'added' ? left.addedAt : (left.lastOpenedAt || left.addedAt)) || 0
          const rightTime = Number(sort === 'added' ? right.addedAt : (right.lastOpenedAt || right.addedAt)) || 0
          return rightTime - leftTime
        })
      }, [books, query, sort, english])

      const chooseFiles = () => {
        if (inputRef.current) {
          inputRef.current.value = ''
          inputRef.current.click()
        }
      }

      const importButton = (className, label) =>
        h('button', {
          type: 'button',
          className: className || 'el-btn',
          'data-variant': className ? undefined : 'primary',
          disabled: importing,
          onClick: chooseFiles,
        },
        importing ? h(Spinner) : h(IconImport, { size: 16 }),
        h('span', null, importing ? t('shelf.importing') : (label || t('shelf.import'))))

      const card = book => {
        const entry = progress[book.id] || null
        const percent = progressPercent(entry, book.chapterCount)
        const finished = isFinished(entry, book.chapterCount)
        const stateText = finished
          ? t('shelf.finished')
          : entry && (Number(entry.chapterIndex) > 0 || Number(entry.scrollRatio) > 0)
            ? t('shelf.progress', { percent })
            : t('shelf.unread')
        return h('div', {
          key: book.id,
          className: 'el-book',
          role: 'button',
          tabIndex: 0,
          'aria-label': `${book.title}${book.author ? `, ${book.author}` : ''}`,
          title: finished ? t('shelf.finished') : t('shelf.readNow'),
          onClick: () => onOpen(book),
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen(book)
            }
          },
        },
        h(BookCover, { book, showFormat: true },
          h('button', {
            type: 'button',
            className: 'el-book-remove',
            title: t('shelf.delete'),
            'aria-label': t('shelf.delete'),
            onClick: event => {
              event.stopPropagation()
              setConfirming(book)
            },
            onKeyDown: event => {
              if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
            },
          }, h(IconTrash, { size: 13 }))),
        h('div', { className: 'el-book-body' },
          h('div', { className: 'el-book-title' }, book.title || t('shelf.untitled')),
          h('div', { className: 'el-book-author' }, book.author || t('shelf.unknownAuthor')),
          h('div', { className: 'el-book-progress' },
            h('div', { className: 'el-progress-track' },
              h('div', { className: 'el-progress-fill', style: { width: `${percent}%` } })),
            h('span', { className: 'el-book-state', 'data-finished': finished ? 'true' : 'false' }, stateText))))
      }

      return h(React.Fragment, null,
        h('div', { className: 'el-toolbar' },
          h('div', { className: 'el-search' },
            h('span', { className: 'el-search-glyph' }, h(IconSearch, { size: 15 })),
            h('input', {
              className: 'el-input',
              type: 'search',
              value: query,
              placeholder: t('shelf.search'),
              'aria-label': t('shelf.search'),
              spellCheck: false,
              autoComplete: 'off',
              onChange: event => setQuery(event.target.value),
            })),
          h('div', { style: { width: '132px', flex: 'none' } },
            h('label', { className: 'el-sr', htmlFor: 'el-shelf-sort' }, t('discover.sort')),
            h('select', {
              id: 'el-shelf-sort',
              className: 'el-select',
              value: sort,
              onChange: event => setSort(event.target.value),
            },
            h('option', { value: 'recent' }, t('shelf.sort.recent')),
            h('option', { value: 'added' }, t('shelf.sort.added')),
            h('option', { value: 'title' }, t('shelf.sort.title')))),
          h('span', { className: 'el-toolbar-meta' }, t('shelf.count', {
            count: formatNumber(visible.length, english),
          })),
          h('input', {
            ref: inputRef,
            className: 'el-sr',
            type: 'file',
            accept: '.epub,.txt,application/epub+zip,text/plain',
            multiple: true,
            tabIndex: -1,
            'aria-hidden': 'true',
            onChange: event => {
              const files = Array.from(event.target.files || [])
              event.target.value = ''
              if (files.length) onImport(files)
            },
          }),
          importButton('el-btn')),
        loading && !books.length
          ? h(StateBlock, { t })
          : error && !books.length
            ? h(StateBlock, { t, error: errorText(t, error), onRetry: onRefresh })
            : !books.length
              ? h(EmptyState, {
                icon: h(IconShelf, { size: 24 }),
                title: t('shelf.emptyTitle'),
                text: t('shelf.emptyHint'),
                action: h('button', {
                  type: 'button',
                  className: 'el-btn',
                  'data-variant': 'primary',
                  disabled: importing,
                  onClick: chooseFiles,
                }, h(IconImport, { size: 16 }), h('span', null, t('shelf.emptyAction'))),
              })
              : !visible.length
                ? h(EmptyState, {
                  icon: h(IconSearch, { size: 24 }),
                  title: t('shelf.emptySearch'),
                  text: query,
                })
                : h('div', { className: 'el-shelf-grid' }, visible.map(card)),
        confirming ? h(ConfirmDialog, {
          title: t('shelf.deleteConfirmTitle', { title: confirming.title }),
          text: t('shelf.deleteConfirmText'),
          confirmLabel: t('shelf.deleteConfirm'),
          cancelLabel: t('shelf.cancel'),
          onCancel: () => setConfirming(null),
          onConfirm: () => {
            const target = confirming
            setConfirming(null)
            onDelete(target)
          },
        }) : null)
    }

    function sortText(t, value, fallback) {
      const key = `discover.sort.${value}`
      const label = t(key)
      return label === key ? (fallback || value) : label
    }

    function importErrorText(t, error, file) {
      const code = error && typeof error === 'object' ? error.code : ''
      if (code === 'unsupported') return t('shelf.importUnsupported')
      if (code === 'too_large' || code === 'book_too_large' || code === 'body_too_large') {
        const limit = extensionOf(file && file.name) === 'txt' ? 30 : 80
        return t('shelf.importTooLarge', { size: limit })
      }
      if (code === 'invalid_book') return t('shelf.importBadFile')
      if (code === 'empty') return t('shelf.importEmpty')
      if (code === 'bad_file') return t('shelf.importBadFile')
      return t('shelf.importFailed', { name: file && file.name ? file.name : t('shelf.unknownAuthor') })
    }

    function DoubanCard({ item, t, onOpen }) {
      const [failed, setFailed] = useState(false)
      const cover = item.cover ? coverSource(item.cover) : ''
      return h('button', {
        type: 'button',
        className: 'el-dcard',
        title: item.title,
        onClick: () => onOpen(item.id),
      },
      h('div', { className: 'el-dcover' },
        cover && !failed
          ? h('img', { src: cover, alt: '', loading: 'lazy', onError: () => setFailed(true) })
          : h('div', { className: 'el-dcover-tone', style: coverTone(item.title) }, bookInitial(item.title)),
        item.rating ? h('span', { className: 'el-drating' },
          h(IconStar, { size: 10 }),
          h('span', null, Number(item.rating).toFixed(1))) : null),
      h('div', { className: 'el-dtitle' }, item.title),
      h('div', { className: 'el-dsub' }, [item.author, item.year].filter(Boolean).join(' · ') || t('common.douban')))
    }

    const DISCOVER_THEMES = ['全部', '心理', '科普', '女性', '法律', '科技', '政治', '经济', '文学', '历史', '哲学', '艺术', '美食', '爱情', '推理', '科幻', '成长', '建筑', '摄影']
    const DISCOVER_REGIONS = ['全部', '中国大陆', '日本', '美国', '法国', '英国', '拉美', '德国', '苏联', '俄国', '波兰', '土耳其', '意大利', '西班牙', '韩国', '中东']
    const DISCOVER_SORTS = ['T', 'U', 'R', 'S']
    const ALL = '全部'
    const CATEGORY_LABELS_EN = {
      '心理': 'Psychology',
      '科普': 'Popular science',
      '女性': 'Women',
      '法律': 'Law',
      '科技': 'Technology',
      '政治': 'Politics',
      '经济': 'Economics',
      '文学': 'Literature',
      '历史': 'History',
      '哲学': 'Philosophy',
      '艺术': 'Art',
      '美食': 'Food',
      '爱情': 'Romance',
      '推理': 'Mystery',
      '科幻': 'Science fiction',
      '成长': 'Coming of age',
      '建筑': 'Architecture',
      '摄影': 'Photography',
      '中国大陆': 'Mainland China',
      '日本': 'Japan',
      '美国': 'United States',
      '法国': 'France',
      '英国': 'United Kingdom',
      '拉美': 'Latin America',
      '德国': 'Germany',
      '苏联': 'Soviet Union',
      '俄国': 'Russia',
      '波兰': 'Poland',
      '土耳其': 'Turkey',
      '意大利': 'Italy',
      '西班牙': 'Spain',
      '韩国': 'South Korea',
      '中东': 'Middle East',
    }

    function Discover({ t, locale, onOpenDetail }) {
      const english = locale === 'en'
      const [query, setQuery] = useState('')
      const [submitted, setSubmitted] = useState('')
      const [filters, setFilters] = useState({ theme: ALL, region: ALL, sort: 'T' })
      const [feed, setFeed] = useState({ data: null, loading: false, more: false, error: null })
      const [search, setSearch] = useState({ data: null, loading: false, error: null })
      const seq = useRef({ feed: 0, search: 0 })
      const sentinelRef = useRef(null)

      const loadFeed = useCallback(async (next, append, start) => {
        const token = ++seq.current.feed
        setFeed(prev => ({ ...prev, loading: !append, more: append, error: null }))
        try {
          const params = new URLSearchParams({
            theme: next.theme || ALL,
            region: next.region || ALL,
            sort: next.sort || 'T',
            start: String(start),
            count: '12',
          })
          const body = await apiJson('/recommend?' + params.toString())
          if (token !== seq.current.feed) return
          setFeed(prev => {
            const data = append && prev.data
              ? { ...body, items: prev.data.items.concat(body.items), start: prev.data.start }
              : body
            return { data, loading: false, more: false, error: null }
          })
        } catch (error) {
          if (token !== seq.current.feed) return
          setFeed(prev => ({ ...prev, loading: false, more: false, error }))
        }
      }, [])

      useEffect(() => {
        loadFeed({ theme: ALL, region: ALL, sort: 'T' }, false, 0)
      }, [loadFeed])

      useEffect(() => {
        const node = sentinelRef.current
        if (submitted || !node || !feed.data || !feed.data.hasMore) return undefined
        if (feed.loading || feed.more || feed.error) return undefined
        if (typeof IntersectionObserver !== 'function') return undefined
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return
          observer.disconnect()
          loadFeed(filters, true, feed.data.items.length)
        }, {
          root: node.closest('.el-body') || null,
          rootMargin: '0px 0px 320px 0px',
          threshold: 0,
        })
        observer.observe(node)
        return () => observer.disconnect()
      }, [submitted, feed.data, feed.loading, feed.more, feed.error, filters, loadFeed])

      const runSearch = useCallback(async term => {
        const value = String(term || '').trim()
        if (!value) return
        const token = ++seq.current.search
        setQuery(value)
        setSubmitted(value)
        setSearch({ data: null, loading: true, error: null })
        try {
          const body = await apiJson('/search?q=' + encodeURIComponent(value))
          if (token !== seq.current.search) return
          setSearch({ data: body, loading: false, error: null })
        } catch (error) {
          if (token !== seq.current.search) return
          setSearch({ data: null, loading: false, error })
        }
      }, [])

      const clearSearch = () => {
        seq.current.search += 1
        setSubmitted('')
        setSearch({ data: null, loading: false, error: null })
      }

      const chooseFilter = (key, value) => {
        const next = { ...filters, [key]: value }
        setFilters(next)
        seq.current.search += 1
        setSubmitted('')
        setSearch({ data: null, loading: false, error: null })
        loadFeed(next, false, 0)
      }

      const resetFilters = () => {
        const next = { theme: ALL, region: ALL, sort: 'T' }
        setFilters(next)
        seq.current.search += 1
        setSubmitted('')
        setSearch({ data: null, loading: false, error: null })
        loadFeed(next, false, 0)
      }

      const categoryOptions = key => {
        const groups = (feed.data && feed.data.categories) || []
        const group = groups.find(entry => entry.key === key)
        if (group && group.options && group.options.length) {
          return group.options.map(option => typeof option === 'string' ? { value: option } : option)
        }
        return (key === '主题' ? DISCOVER_THEMES : DISCOVER_REGIONS).map(value => ({ value }))
      }

      const sortOptions = () => {
        const list = (feed.data && feed.data.sorts) || []
        if (list.length) return list
        return DISCOVER_SORTS.map(value => ({ value }))
      }

      const categoryText = option => {
        if (option.value === ALL) return t('common.all')
        if (english) return CATEGORY_LABELS_EN[option.value] || option.label || option.value
        return option.label || option.value
      }
      const filterActive = filters.theme !== ALL || filters.region !== ALL || filters.sort !== 'T'
      const narrowed = filters.theme !== ALL || filters.region !== ALL

      const filterSelect = (key, label, options, labelFor) => h('label', { className: 'el-filter-item' },
        h('span', { className: 'el-filter-name' }, label),
        h('select', {
          className: 'el-select el-filter-select',
          value: filters[key],
          'aria-label': label,
          onChange: event => chooseFilter(key, event.target.value),
        }, options.map(option => h('option', { key: option.value, value: option.value },
          labelFor(option)))))

      const renderSearch = () => {
        if (search.loading) return h(StateBlock, { t })
        if (search.error) {
          return h(StateBlock, {
            t,
            error: errorText(t, search.error) || t('discover.searchError'),
            onRetry: () => runSearch(submitted),
          })
        }
        const items = search.data && Array.isArray(search.data.items) ? search.data.items : []
        const moreUrl = (search.data && search.data.moreUrl) ||
          ('https://search.douban.com/book/subject_search?search_text=' + encodeURIComponent(submitted) + '&cat=1001')
        return h(React.Fragment, null,
          h('div', { className: 'el-result-note' },
            h('span', null, t('discover.total', { count: formatNumber(items.length, english) })),
            h('a', {
              className: 'el-inline-link',
              href: moreUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
            }, h(IconExternal, { size: 13 }), h('span', null, t('discover.searchMore')))),
          items.length
            ? h('div', { className: 'el-grid' }, items.map(item => h(DoubanCard, {
              key: item.id,
              item,
              t,
              onOpen: onOpenDetail,
            })))
            : h(EmptyState, {
              icon: h(IconSearch, { size: 24 }),
              title: t('discover.searchEmpty'),
              text: submitted,
            }))
      }

      const renderFeed = () => {
        const data = feed.data
        if (!data) {
          return h(StateBlock, {
            t,
            error: feed.error ? errorText(t, feed.error) : null,
            onRetry: () => loadFeed(filters, false, 0),
          })
        }
        const errorBar = feed.error
          ? h('div', { className: 'el-inline-error', role: 'alert' },
            h('span', null, t('discover.feedStale')),
            h('button', {
              type: 'button',
              className: 'el-filter-reset',
              onClick: () => loadFeed(filters, false, 0),
            }, t('discover.retry')))
          : null
        if (!data.items.length) {
          return h(React.Fragment, null, errorBar,
            h(EmptyState, { icon: h(IconCompass, { size: 24 }), title: t('discover.empty') }))
        }
        return h(React.Fragment, null,
          errorBar,
          h('div', {
            className: 'el-grid',
            'data-loading': feed.loading ? 'true' : 'false',
            'aria-busy': feed.loading ? 'true' : 'false',
          }, data.items.map(item => h(DoubanCard, {
            key: item.id,
            item,
            t,
            onOpen: onOpenDetail,
          }))),
          data.hasMore
            ? h('div', { ref: sentinelRef, className: 'el-feed-sentinel' },
              feed.more
                ? h('div', { className: 'el-feed-loading', role: 'status' },
                  h(Spinner),
                  h('span', { className: 'el-sr' }, t('discover.loading')))
                : null)
            : null)
      }

      return h('div', { className: 'el-discover' },
        h('form', {
          className: 'el-search-row',
          onSubmit: event => {
            event.preventDefault()
            runSearch(query)
          },
        },
        h('div', { className: 'el-search' },
          h('span', { className: 'el-search-glyph' }, h(IconSearch, { size: 15 })),
          h('input', {
            className: 'el-input',
            type: 'search',
            value: query,
            placeholder: t('discover.searchPlaceholder'),
            'aria-label': t('discover.searchAria'),
            spellCheck: false,
            autoComplete: 'off',
            onChange: event => setQuery(event.target.value),
          })),
        submitted
          ? h('button', {
            type: 'button',
            className: 'el-icon-btn',
            title: t('common.close'),
            'aria-label': t('common.close'),
            onClick: clearSearch,
          }, h(IconClose, { size: 16 }))
          : null,
        h('button', {
          type: 'submit',
          className: 'el-btn',
          'data-variant': 'primary',
        }, h(IconSearch, { size: 15 }), h('span', null, t('discover.search')))),
        submitted
          ? renderSearch()
          : h(React.Fragment, null,
            h('div', { className: 'el-filter-row' },
              filterSelect('theme', t('discover.theme'), categoryOptions('主题'), categoryText),
              filterSelect('region', t('discover.region'), categoryOptions('地区'), categoryText),
              filterSelect('sort', t('discover.sort'), sortOptions(), option => sortText(t, option.value, option.label)),
              h('div', { className: 'el-filter-actions' },
                feed.loading && feed.data
                  ? h('span', { className: 'el-filter-status' }, h(Spinner), h('span', { className: 'el-sr' }, t('discover.loading')))
                  : null,
                filterActive && narrowed && !feed.loading && !feed.error && feed.data
                  ? h('span', { className: 'el-filter-count' }, t('discover.total', { count: formatNumber(feed.data.total || 0, english) }))
                  : null,
                filterActive
                  ? h('button', {
                    type: 'button',
                    className: 'el-filter-reset',
                    onClick: resetFilters,
                  }, t('discover.reset'))
                  : null)),
            renderFeed()))
    }

    function RankingRow({ item, t, onOpen }) {
      const [failed, setFailed] = useState(false)
      const cover = item.cover ? coverSource(item.cover) : ''
      const byline = [item.author, item.year].filter(Boolean).join(' · ')
      return h('button', {
        type: 'button',
        className: 'el-rank-row',
        onClick: () => onOpen(item.id),
      },
      h('span', { className: 'el-rank-number' }, String(item.rank || '')),
      h('div', { className: 'el-rank-cover' },
        cover && !failed
          ? h('img', { src: cover, alt: '', loading: 'lazy', onError: () => setFailed(true) })
          : h('div', { className: 'el-rank-tone', style: coverTone(item.title) }, bookInitial(item.title))),
      h('div', { className: 'el-rank-body' },
        h('div', { className: 'el-rank-title' }, item.title),
        h('div', { className: 'el-rank-sub' }, byline || t('common.douban'))),
      item.rating
        ? h('span', { className: 'el-rank-rating' }, h(IconStar, { size: 12 }), h('span', null, Number(item.rating).toFixed(1)))
        : null)
    }

    function RankingFeature({ chart, t, onOpen }) {
      const cover = chart.cover ? coverSource(chart.cover) : ''
      const items = Array.isArray(chart.items) ? chart.items : []
      return h('button', {
        type: 'button',
        className: 'el-feature',
        onClick: () => onOpen({ mode: 'rank', id: chart.id, title: chart.title }),
      },
      cover ? h('div', { className: 'el-feature-bg', style: { backgroundImage: `url("${cover}")` } }) : null,
      h('div', { className: 'el-feature-shade' }),
      h('div', { className: 'el-feature-body' },
        h('div', { className: 'el-feature-kicker' }, t('rankings.overall')),
        h('div', { className: 'el-feature-title' }, chart.title),
        chart.description ? h('div', { className: 'el-feature-desc' }, chart.description) : null,
        items.length
          ? h('div', { className: 'el-feature-list' }, items.map(item => h('div', { className: 'el-feature-row', key: item.id || item.rank },
            h('span', { className: 'el-feature-rank' }, String(item.rank || '')),
            h('span', { className: 'el-feature-name' }, item.title),
            item.rating ? h('span', { className: 'el-feature-score' }, Number(item.rating).toFixed(1)) : null)))
          : null))
    }

    function RankingTile({ card, t, onOpen, annual }) {
      const cover = card.cover ? coverSource(card.cover) : ''
      return h('button', {
        type: 'button',
        className: 'el-type-card',
        onClick: () => onOpen(card),
      },
      cover ? h('div', { className: 'el-type-bg', style: { backgroundImage: `url("${cover}")` } }) : null,
      h('div', { className: 'el-type-shade' }),
      h('div', { className: 'el-type-content' },
        h('div', { className: 'el-type-kicker' }, annual ? t('rankings.annualSection') : t('rankings.types')),
        h('div', { className: 'el-type-title' }, card.title),
        h('div', { className: 'el-type-meta' }, t('rankings.books', { count: annual ? card.count : card.total }))))
    }

    function RankingDetail({ spec, t, locale, onBack, onOpenDetail }) {
      const english = locale === 'en'
      const [state, setState] = useState({ items: [], total: 0, hasMore: false, loading: true, error: null })
      const [nonce, setNonce] = useState(0)
      const seq = useRef(0)
      const rootRef = useRef(null)
      const backRef = useRef(null)

      useLayoutEffect(() => {
        resetPanelScroll(rootRef.current)
      }, [])

      useEffect(() => {
        if (backRef.current && typeof backRef.current.focus === 'function') {
          try {
            backRef.current.focus({ preventScroll: true })
          } catch {
            backRef.current.focus()
          }
        }
      }, [])

      useEffect(() => {
        const onKeyDown = event => {
          if (event.key === 'Escape') onBack()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
      }, [onBack])

      const load = useCallback(async (start, append) => {
        const token = ++seq.current
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
          items: append ? prev.items : [],
        }))
        try {
          if (spec.mode === 'annual') {
            const payload = await apiJson(`/annual?year=${encodeURIComponent(spec.year)}`)
            if (token !== seq.current) return
            const annual = payload && payload.annual
            const section = annual && Array.isArray(annual.sections)
              ? annual.sections.find(entry => entry.id === spec.sectionId)
              : null
            const items = section && Array.isArray(section.items) ? section.items : []
            setState({ items, total: items.length, hasMore: false, loading: false, error: null })
          } else {
            const payload = await apiJson(`/rank?id=${encodeURIComponent(spec.id)}&start=${start}&count=20`)
            if (token !== seq.current) return
            const ranking = payload && payload.ranking
            const incoming = ranking && Array.isArray(ranking.items) ? ranking.items : []
            setState(prev => ({
              items: append ? prev.items.concat(incoming) : incoming,
              total: Number(ranking && ranking.total) || incoming.length,
              hasMore: Boolean(ranking && ranking.hasMore),
              loading: false,
              error: null,
            }))
          }
        } catch (error) {
          if (token === seq.current) {
            setState(prev => ({ ...prev, loading: false, error }))
          }
        }
      }, [spec, nonce])

      useEffect(() => {
        setState({ items: [], total: 0, hasMore: false, loading: true, error: null })
        load(0, false)
      }, [load])

      const head = h('div', { className: 'el-rank-detail-head' },
        h('button', {
          ref: backRef,
          type: 'button',
          className: 'el-icon-btn',
          title: t('rankings.back'),
          'aria-label': t('rankings.back'),
          onClick: onBack,
        }, h(IconArrowLeft, { size: 18 })),
        h('div', { className: 'el-rank-detail-title' }, spec.title),
        state.total
          ? h('div', { className: 'el-rank-detail-count' }, t('rankings.books', { count: formatNumber(state.total, english) }))
          : null)

      let body
      if (state.loading && !state.items.length) {
        body = h('div', { className: 'el-state' }, h(Spinner), h('span', null, t('rankings.loading')))
      } else if (state.error && !state.items.length) {
        body = h(StateBlock, {
          t,
          error: errorText(t, state.error) || t('rankings.error'),
          onRetry: () => setNonce(value => value + 1),
        })
      } else if (!state.items.length) {
        body = h(EmptyState, { icon: h(IconTrophy, { size: 22 }), title: t('rankings.empty'), text: '' })
      } else {
        body = h('div', { className: 'el-rank-list' }, state.items.map(item => h(RankingRow, {
          key: item.id || `${item.rank}-${item.title}`,
          item,
          t,
          onOpen: onOpenDetail,
        })))
      }

      const inlineError = state.error && state.items.length
        ? h('div', { className: 'el-inline-error', role: 'alert' },
          h('span', null, errorText(t, state.error) || t('rankings.error')),
          h('button', {
            type: 'button',
            className: 'el-filter-reset',
            onClick: () => setNonce(value => value + 1),
          }, t('discover.retry')))
        : null

      return h('div', { ref: rootRef, className: 'el-rank-detail' },
        head,
        inlineError,
        h('div', { className: 'el-rank-detail-body' }, body),
        !state.loading && state.hasMore
          ? h('div', { className: 'el-load-more' },
            h('button', {
              type: 'button',
              className: 'el-btn',
              onClick: () => load(state.items.length, true),
            }, t('rankings.loadMore')))
          : null)
    }

    function RankingPage({ t, locale, onOpenDetail }) {
      const english = locale === 'en'
      const [landing, setLanding] = useState({ data: null, loading: true, error: null })
      const [nonce, setNonce] = useState(0)
      const [view, setView] = useState(null)
      const [year, setYear] = useState(2025)
      const rootRef = useRef(null)

      useLayoutEffect(() => {
        if (!view) resetPanelScroll(rootRef.current)
      }, [view])

      useEffect(() => {
        let cancelled = false
        setLanding({ data: null, loading: true, error: null })
        apiJson('/rankings')
          .then(payload => {
            if (!cancelled) setLanding({ data: payload, loading: false, error: null })
          })
          .catch(error => {
            if (!cancelled) setLanding({ data: null, loading: false, error })
          })
        return () => { cancelled = true }
      }, [nonce])

      useEffect(() => {
        if (!landing.data || !Array.isArray(landing.data.annual) || !landing.data.annual.length) return
        if (!landing.data.annual.some(entry => entry.year === year)) {
          setYear(landing.data.annual[0].year)
        }
      }, [landing.data, year])

      if (view) {
        return h(RankingDetail, {
          spec: view,
          t,
          locale,
          onBack: () => setView(null),
          onOpenDetail,
        })
      }

      if (landing.loading && !landing.data) {
        return h('div', { className: 'el-rankings' }, h('div', { className: 'el-state' }, h(Spinner), h('span', null, t('rankings.loading'))))
      }

      if (landing.error && !landing.data) {
        return h('div', { className: 'el-rankings' },
          h(StateBlock, {
            t,
            error: errorText(t, landing.error) || t('rankings.error'),
            onRetry: () => setNonce(value => value + 1),
          }))
      }

      const data = landing.data || {}
      const charts = Array.isArray(data.charts) ? data.charts : []
      const annual = Array.isArray(data.annual) ? data.annual : []
      const types = Array.isArray(data.types) ? data.types : []
      const activeYear = annual.find(entry => entry.year === year) || annual[0]
      const sectionHead = (title, hint) => h('div', { className: 'el-rank-section-head' },
        h('h2', { className: 'el-rank-section-title' }, title),
        h('p', { className: 'el-rank-section-hint' }, hint))

      return h('div', { ref: rootRef, className: 'el-rankings' },
        h('section', { className: 'el-rank-section' },
          sectionHead(t('rankings.overall'), t('rankings.overallHint')),
          charts.length
            ? h('div', { className: 'el-feature-grid' }, charts.map(chart => h(RankingFeature, {
              key: chart.id,
              chart,
              t,
              onOpen: setView,
            })))
            : h('div', { className: 'el-rank-empty' }, t('rankings.empty'))),
        h('section', { className: 'el-rank-section' },
          sectionHead(t('rankings.annual'), t('rankings.annualHint')),
          annual.length
            ? h(React.Fragment, null,
              h('div', { className: 'el-year-row' }, annual.map(entry => h('button', {
                key: entry.year,
                type: 'button',
                className: 'el-year',
                'data-active': activeYear && activeYear.year === entry.year ? 'true' : 'false',
                'aria-pressed': activeYear && activeYear.year === entry.year ? 'true' : 'false',
                onClick: () => setYear(entry.year),
              }, String(entry.year)))),
              activeYear
                ? h('div', { className: 'el-type-grid' }, (activeYear.sections || []).map((section, index) => h(RankingTile, {
                  key: section.id || `${activeYear.year}-${index}`,
                  card: { ...section, year: activeYear.year, sectionId: section.id },
                  t,
                  annual: true,
                  onOpen: card => setView({
                    mode: 'annual',
                    year: activeYear.year,
                    sectionId: card.sectionId,
                    title: card.title,
                  }),
                })))
                : h('div', { className: 'el-rank-empty' }, t('rankings.empty')))
            : h('div', { className: 'el-rank-empty' }, t('rankings.empty'))),
        h('section', { className: 'el-rank-section' },
          sectionHead(t('rankings.types'), t('rankings.typesHint')),
          types.length
            ? h('div', { className: 'el-type-grid' }, types.map(card => h(RankingTile, {
              key: card.id,
              card,
              t,
              annual: false,
              onOpen: chart => setView({ mode: 'rank', id: chart.id, title: chart.title }),
            })))
            : h('div', { className: 'el-rank-empty' }, t('rankings.empty'))))
    }

    function BookDetail({ id, t, locale, onClose }) {
      const english = locale === 'en'
      const [state, setState] = useState({ data: null, loading: true, error: null })
      const [nonce, setNonce] = useState(0)

      useEffect(() => {
        let cancelled = false
        setState({ data: null, loading: true, error: null })
        apiJson(`/detail?id=${encodeURIComponent(id)}`)
          .then(payload => {
            if (cancelled) return
            const book = payload && payload.book
            setState({
              data: book || null,
              loading: false,
              error: book ? null : new UiError('bad_response', 'Book detail payload was empty.'),
            })
          })
          .catch(error => {
            if (!cancelled) setState({ data: null, loading: false, error })
          })
        return () => { cancelled = true }
      }, [id, nonce])

      const detail = state.data
      const head = h('div', { className: 'el-detail-head' },
        h('button', {
          type: 'button',
          className: 'el-icon-btn',
          title: t('discover.backToDiscover'),
          'aria-label': t('discover.backToDiscover'),
          onClick: onClose,
        }, h(IconArrowLeft, { size: 18 })),
        h('div', { className: 'el-detail-head-title' }, detail && detail.title ? detail.title : t('discover.detail')))

      if (!detail) {
        return h('div', { className: 'el-detail' },
          head,
          h('div', { className: 'el-detail-scroll' },
            h(StateBlock, {
              t,
              error: state.error ? errorText(t, state.error) : null,
              onRetry: () => setNonce(value => value + 1),
            })))
      }

      const meta = [
        [t('discover.author'), (detail.author || []).join(' / ')],
        [t('discover.translator'), (detail.translator || []).join(' / ')],
        [t('discover.publisher'), detail.publisher],
        [t('discover.pubdate'), detail.pubdate],
        [t('discover.pages'), detail.pages],
        [t('discover.price'), detail.price],
        [t('discover.series'), detail.series && detail.series.title],
        [t('discover.tags'), (detail.tags || []).join(' · ')],
      ].filter(entry => entry[1])
      const stars = detail.rating ? clamp(Math.round(Number(detail.rating) / 2), 0, 5) : 0
      const catalogLines = detail.catalog ? detail.catalog.split('\n').filter(line => line.trim()) : []

      return h('div', { className: 'el-detail' },
        head,
        h('div', { className: 'el-detail-scroll' },
          h('div', { className: 'el-detail-inner' },
            h('div', { className: 'el-detail-hero' },
              h('div', { className: 'el-detail-cover' },
                detail.cover
                  ? h('img', { src: coverSource(detail.cover), alt: '', onError: event => { event.currentTarget.style.display = 'none' } })
                  : h('div', { className: 'el-dcover-tone', style: coverTone(detail.title) }, bookInitial(detail.title))),
              h('div', { className: 'el-detail-main' },
                h('h1', { className: 'el-detail-title' }, detail.title),
                detail.subtitle ? h('p', { className: 'el-detail-sub' }, detail.subtitle) : null,
                h('p', { className: 'el-detail-byline' },
                  [(detail.author || []).join(' / '), detail.publisher, detail.pubdate].filter(Boolean).join(' · ')),
                h('div', { className: 'el-rating-line' },
                  detail.rating
                    ? h(React.Fragment, null,
                      h('span', { className: 'el-rating-value' }, Number(detail.rating).toFixed(1)),
                      h('span', { className: 'el-stars' }, Array.from({ length: 5 }, (_, index) =>
                        h('span', { key: index, style: { opacity: index < stars ? 1 : 0.2 } }, h(IconStar, { size: 12 })))),
                      detail.ratingCount
                        ? h('span', { className: 'el-rating-count' }, t('discover.ratingCount', { count: formatNumber(detail.ratingCount, english) }))
                        : null)
                    : h('span', { className: 'el-rating-count' }, t('discover.noRating'))),
                detail.hasEbook ? h('div', { className: 'el-honor-row' },
                  h('span', { className: 'el-honor' }, t('discover.ebook'))) : null,
                h('div', { className: 'el-detail-actions' },
                  detail.url
                    ? h('a', {
                      className: 'el-btn',
                      'data-variant': 'primary',
                      href: detail.url,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }, h(IconExternal, { size: 14 }), h('span', null, t('discover.openDouban')))
                    : null)),
              null),
            detail.honors && detail.honors.length
              ? h('div', { className: 'el-honor-row' }, detail.honors.map(honor => h('span', {
                key: `${honor.rank}-${honor.title}`,
                className: 'el-honor',
              }, h(IconStar, { size: 10 }), h('span', null, `${honor.title} · No.${honor.rank}`))))
              : null,
            meta.length
              ? h('div', { className: 'el-detail-meta' }, meta.map(entry => h('div', { className: 'el-meta-row', key: entry[0] },
                h('span', { className: 'el-meta-label' }, entry[0]),
                h('span', { className: 'el-meta-value' }, entry[1]))))
              : null,
            detail.intro
              ? h('section', { className: 'el-detail-section' },
                h('h3', null, t('discover.intro')),
                h('p', { className: 'el-prose' }, detail.intro))
              : null,
            catalogLines.length
              ? h('section', { className: 'el-detail-section' },
                h('h3', null, t('discover.catalog')),
                h('div', { className: 'el-catalog' }, catalogLines.map((line, index) => h('div', {
                  key: `${index}-${line.slice(0, 12)}`,
                  className: 'el-catalog-line',
                }, line))))
              : null,
            detail.authorIntro
              ? h('section', { className: 'el-detail-section' },
                h('h3', null, t('discover.authorIntro')),
                h('p', { className: 'el-prose' }, detail.authorIntro))
              : null)))
    }

    function App({ t, getLocale }) {
      const locale = typeof getLocale === 'function' ? getLocale() : currentLocale()
      const english = locale === 'en'
      const [tab, setTab] = useState('shelf')
      const [books, setBooks] = useState([])
      const [progress, setProgress] = useState({})
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState(null)
      const [importing, setImporting] = useState(false)
      const [reader, setReader] = useState(null)
      const [detailId, setDetailId] = useState('')
      const [discoverMounted, setDiscoverMounted] = useState(false)
      const [rankingsMounted, setRankingsMounted] = useState(false)
      const [toast, setToast] = useState(null)
      const toastTimer = useRef(null)

      const notify = useCallback((message, kind) => {
        if (!message) return
        setToast({ message, kind: kind || 'info' })
        clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 3400)
      }, [])

      useEffect(() => () => clearTimeout(toastTimer.current), [])

      const loadLibrary = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
          const body = await listLibrary()
          setBooks(Array.isArray(body.books) ? body.books : [])
          setProgress(body.progress && typeof body.progress === 'object' ? body.progress : {})
        } catch (loadError) {
          setError(loadError)
        } finally {
          setLoading(false)
        }
      }, [])

      useEffect(() => { loadLibrary() }, [loadLibrary])

      const showTab = next => {
        setTab(next)
        if (next === 'discover') setDiscoverMounted(true)
        if (next === 'rankings') setRankingsMounted(true)
      }

      const importFiles = async files => {
        setImporting(true)
        let imported = 0
        let skipped = 0
        let failure = null
        const known = new Set(books.map(book => `${book.fileName}|${book.size}`))
        for (const file of files) {
          try {
            const parsed = await parseBookFile(file)
            const signature = `${file.name}|${file.size}`
            if (known.has(signature)) {
              skipped += 1
              continue
            }
            await uploadBook(parsed, file)
            known.add(signature)
            imported += 1
          } catch (importError) {
            failure = { error: importError, file }
          }
        }
        await loadLibrary()
        setImporting(false)
        const parts = []
        if (imported) parts.push(t('shelf.imported', { count: imported }))
        if (skipped) parts.push(t('shelf.importSkipped', { count: skipped }))
        if (failure) parts.push(importErrorText(t, failure.error, failure.file))
        notify(parts.join(' · '), failure ? 'error' : 'info')
      }

      const openBook = async summary => {
        try {
          const body = await getBook(summary.id)
          const full = body.book
          if (!full) throw new UiError('not_found', '')
          const saved = progress[summary.id]
          setReader({
            book: full,
            chapter: saved ? Number(saved.chapterIndex) || 0 : 0,
            scroll: saved ? Number(saved.scrollRatio) || 0 : 0,
          })
          const now = Date.now()
          setBooks(prev => prev.map(book => book.id === summary.id ? { ...book, lastOpenedAt: now } : book))
          touchBook(summary.id).catch(() => {})
        } catch (openError) {
          notify(t('shelf.openFailed', {
            message: errorText(t, openError) || t('discover.errorUnknown'),
          }), 'error')
        }
      }

      const removeBook = async book => {
        try {
          await deleteBook(book.id)
          setBooks(prev => prev.filter(entry => entry.id !== book.id))
          setProgress(prev => {
            const next = { ...prev }
            delete next[book.id]
            return next
          })
          notify(t('shelf.deleted'))
        } catch (deleteError) {
          notify(errorText(t, deleteError) || t('discover.errorUnknown'), 'error')
        }
      }

      const saveProgress = useCallback(async payload => {
        setProgress(prev => ({
          ...prev,
          [payload.bookId]: {
            ...prev[payload.bookId],
            bookId: payload.bookId,
            chapterIndex: payload.chapterIndex,
            scrollRatio: payload.scrollRatio,
            updatedAt: Date.now(),
          },
        }))
        try {
          await saveBookProgress(payload)
        } catch {
          /* the local position stays authoritative for this session */
        }
      }, [])

      return h('div', { className: 'el-page' },
        h('style', null, CSS),
        h('header', { className: 'el-head', 'data-window-drag': '' },
          h('div', { className: 'el-head-row' },
            h('div', { className: 'el-heading' },
              h('h1', { className: 'el-title' }, t('title')),
              h('p', { className: 'el-subtitle' }, t('subtitle'))),
            h('div', { className: 'el-head-actions' },
              h('div', { className: 'el-tabs' },
                h('button', {
                  type: 'button',
                  className: 'el-tab',
                  title: t('tabs.shelf'),
                  'aria-label': t('tabs.shelf'),
                  'data-active': tab === 'shelf' ? 'true' : 'false',
                  onClick: () => showTab('shelf'),
                }, h(IconShelf, { size: 14 }), h('span', null, t('tabs.shelf'))),
                h('button', {
                  type: 'button',
                  className: 'el-tab',
                  title: t('tabs.discover'),
                  'aria-label': t('tabs.discover'),
                  'data-active': tab === 'discover' ? 'true' : 'false',
                  onClick: () => showTab('discover'),
                }, h(IconCompass, { size: 14 }), h('span', null, t('tabs.discover'))),
                h('button', {
                  type: 'button',
                  className: 'el-tab',
                  title: t('tabs.rankings'),
                  'aria-label': t('tabs.rankings'),
                  'data-active': tab === 'rankings' ? 'true' : 'false',
                  onClick: () => showTab('rankings'),
                }, h(IconTrophy, { size: 14 }), h('span', null, t('tabs.rankings'))))))),
        h('div', { className: 'el-body' },
          h('div', { className: 'el-shelf', style: { display: tab === 'shelf' ? 'block' : 'none' } },
            h(Shelf, {
              books,
              progress,
              loading,
              error,
              importing,
              onRefresh: loadLibrary,
              onOpen: openBook,
              onDelete: removeBook,
              onImport: importFiles,
              t,
              locale,
            })),
          h('div', { style: { display: tab === 'discover' ? 'block' : 'none' } },
            discoverMounted
              ? h(Discover, {
                t,
                locale,
                onOpenDetail: setDetailId,
              })
              : null),
          h('div', { style: { display: tab === 'rankings' ? 'block' : 'none' } },
            rankingsMounted
              ? h(RankingPage, {
                t,
                locale,
                onOpenDetail: setDetailId,
              })
              : null)),
        detailId
          ? h(BookDetail, {
            id: detailId,
            t,
            locale,
            onClose: () => setDetailId(''),
          })
          : null,
        reader
          ? h(Reader, {
            book: reader.book,
            initialChapter: reader.chapter,
            initialScroll: reader.scroll,
            t,
            onClose: () => setReader(null),
            onProgress: saveProgress,
          })
          : null,
        toast ? h(Toast, { message: toast.message, kind: toast.kind }) : null)
    }

    function apply(ctx) {
      ctx.effect(() => {
        const disposers = []
        const keep = disposer => { if (typeof disposer === 'function') disposers.push(disposer) }
        keep(ctx.locale.register(NS, 'zh', ZH))
        keep(ctx.locale.register(NS, 'en', EN))
        const t = ctx.locale.bind(NS)
        const getLocale = () => ctx.locale.getSnapshot().active
        keep(ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 24,
          locale: NS,
          label: () => t('panel'),
        }, PanelIcon)))
        keep(ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({ t, getLocale }),
        }, App)))
        return () => {
          for (let index = disposers.length - 1; index >= 0; index -= 1) {
            try {
              disposers[index]()
            } catch {
              /* one failing disposer must not block the others */
            }
          }
        }
      }, 'dsh-elibrary: panel and page')
    }

    return { inject: ['slots', 'locale'], apply }
  }
})
