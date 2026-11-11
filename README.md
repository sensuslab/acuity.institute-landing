# Acuity Institute

React/Vite landing page with webinars, shorts and the Acuity Open Library.

Use Node 22.13+ (`nvm use`). The build indexes curated files and nested categories before compiling the app.

```sh
npm ci
npm run typecheck
npm run build
npm test
npm start
```

- [Library operation, content management and future AI integration](docs/LIBRARY.md)
- [Review of the supplied SEO fixes](docs/SEO-REVIEW.md)
- [Library pages for search and AI discovery](docs/LIBRARY-SEO.md)
- [Third-party notices](docs/THIRD-PARTY.md)

The server uses `PORT` (default 8080). Existing short videos use `SHORTS_DIR` (default `/data/shorts`). Library editions are included in the build. Paired PDF/EPUB records enable the ebook reader; PDFs also support slide presentation. AI querying is planned, not implemented in this phase.
