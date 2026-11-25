# dsh-elibrary

A DeepSeek Harness plugin that adds **电子图书馆 / E-Library** to the left sidebar.

- **书架** — import EPUB/TXT books, read them in a focused reader, and continue exactly where you left off.
- **发现** — Douban search, recommendations browsable by theme and region, and book details.
- **榜单** — Douban overall, annual and genre rankings, with full lists and book details.

## Layout

- `index.js` — Host plugin: registers the same-origin `/elibrary/api` route and its admission guard.
- `lib/router.js` — API router: library CRUD, reading progress, Douban endpoints, cover proxy.
- `lib/library.js` — durable on-disk library (book files, parsed metadata, reading progress).
- `lib/douban.js` — Douban search / recommendation / detail / ranking provider and image proxy.
- `lib/access.js` — connection admission for the local API route.
- `lib/http.js` — small HTTP helpers (JSON, binary, request parsing, bounded bodies).
- `lib/config.js` — API prefix, defaults and bounds.
- `client.js` — the browser half: sidebar entry, panel, bookshelf, reader, discovery UI, and the EPUB/TXT parsers.
- `locale/` — plugin manager metadata.
- `docs/` — plugin detail documents.

The client bundle is a plain classic script loaded by DSH's `__ModuleLoader__`; it has no build step and no third-party dependencies.

## Install

Install the package directory through DSH's plugin manager (or add it as a bundle in your profile). It registers one Host row (`dsh-elibrary`) and one browser entry.

## Notes

- Books are stored by the local DSH Host under `~/.dsh/elibrary` (override with `DSH_ELIBRARY_DATA_DIR`). They are never uploaded.
- Douban requests go through the Host so the browser never makes cross-origin requests; covers use the local image proxy.
- Reading position is saved on the Host, so it survives browser restarts and page reloads.
- Supported formats: `.epub`, `.txt`.
