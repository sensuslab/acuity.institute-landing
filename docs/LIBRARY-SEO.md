# Library pages for search and AI discovery

`npm run build` now emits crawlable, server-rendered HTML for the whole Library from the
verified build-time catalogue (`src/data/libraryCatalogue.json`, compiled from the repository
sidecars plus the R2 identity registry). Assets stay on R2 (`assets.acuity.institute`).

| URL | What it is |
|---|---|
| `/library/` | Crawlable index (static fallback for the SPA) with a plain link to every record and collection |
| `/library/<id>/` | One page per record. `<id>` is the record's stable catalogue id |
| `/library/collections/<collection>/[<sub>/]` | Collection hubs: every top-level collection, plus sub-collections with 2+ records |

Each record page has a unique title and description, a self-canonical, OG/Twitter tags
(default `og.png`, since records have no cover images), JSON-LD (`Organization`, `WebSite`,
`ItemPage`, `Book` or `PresentationDigitalDocument`, `BreadcrumbList`), the full description,
edition note, rights, direct R2 downloads, an "Open in the Acuity reader" link and related records.

Rules:
- Only catalogue metadata is used. "Traditional · X" and "Unknown" are never emitted as a
  schema.org `author`; "Name (trans)" is treated as a translator.
- Record ids are validated as unique, lowercase slugs that don't collide with reserved paths
  (`books`, `collections`, `overviews`, ...). Changing an id changes a public URL: add a redirect.
- Access-bearing intake links (Dropbox shared links, token query strings) are removed from the
  compiled catalogue, provenance JSON and generated pages, and editorial JSON sidecars are not
  copied to `dist/`. The build fails if any reach the Library output.
- `sitemap.xml` lists every record and hub with `lastmod` (latest of the asset verification
  date and `TEMPLATE_DATE` in `scripts/library-seo.mjs`; bump it when the page templates change).
- `llms.txt` gets a generated Library section with collection hubs.

## IndexNow

The key file is `public/<key>.txt`. After a deploy that adds or changes Library URLs, run
`node scripts/indexnow-submit.mjs` (add `--dry-run` to only count URLs). It submits every
sitemap URL to `api.indexnow.org` (shared with Bing, Yandex, Seznam, Naver and others).
