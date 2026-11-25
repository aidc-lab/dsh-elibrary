# E-Library

A quiet reading corner and a window onto good books.

## Bookshelf

- **Import** `.epub` and `.txt` files, several at a time. The local DSH Host stores the files under `~/.dsh/elibrary`; nothing is uploaded.
- **Read** EPUB books with their table of contents, chapters and illustrations, in a layout made for long reading sessions. TXT books are decoded (UTF-8 / GB18030) and split into chapters automatically.
- **Remember your place** on every scroll and chapter change. Reading progress is kept by the Host, so reopening a book returns to exactly where you stopped, even after a restart.
- **Organize** by recently read, recently imported or title, and search by title or author. Deleting a book removes its local file and reading position.

The reader supports a chapter list, previous/next chapter, font size, line height and a serif typeface.

## Discover

- **Search Douban** by title, author or keyword.
- **Recommendations** from Douban, adjusting theme, region and sort in one compact row.
- **Filter** by theme and region, and switch between overall, recent, new and high-rated ordering.
- **Book details**: click any book for its rating, synopsis, table of contents, publication details and Douban link.
## Rankings

- **Overall**: Douban's monthly hot books and the Top 250, with the top three shown on each card.
- **Annual**: Douban's 2025 / 2024 / 2023 reading lists, by year and category.
- **By genre**: foreign fiction, Chinese non-fiction, mystery, science fiction, history, popular science, biography, drama and film books, each a Top 100.
- **Full lists**: open any ranking for ranks, ratings and publication details, then open a book for its Douban page.

## Notes

- Every Douban request is forwarded by the DSH Host through a same-origin local route; the browser never calls Douban cross-origin.
- Covers are proxied locally so they display correctly.
- Books and progress live in `~/.dsh/elibrary` on this machine. Set `DSH_ELIBRARY_DATA_DIR` to use another directory.
- The Douban endpoints are unofficial and may change without notice. Retry later if loading fails.
