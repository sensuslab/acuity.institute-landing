# Curating and running the Acuity Library

The library now has three viewing modes in one portal:

- **Read PDF** for any PDF, including image-only and Coptic scans.
- **Present** for any PDF: fit the whole page to the screen, edge/keyboard navigation, a quiet transition and optional browser fullscreen.
- **Read E-Book** only when the same record has both a PDF and an EPUB. The e-reader uses white paper, black Times New Roman/serif text, adjustable font size, contents, edge navigation and optional on-device saved position. It does not OCR or reconstruct a PDF.

## No separate database is required

This is a curated, repository-managed collection. `public/library/books/` and the per-record metadata files are the authoritative content. A build-time scanner generates the JSON index used by the UI. It records actual formats, file sizes/checksums, viewer capabilities and nested categories. This provides the availability information that a database table would otherwise hold, without a database service or account system.

Every production build runs the scanner **before** compiling React. Deleting an EPUB removes the ebook launcher at the next build; an outdated metadata flag cannot enable it. New files must be committed and deployed to appear. The scanner does not watch an unrelated Railway volume or files uploaded after a build.

If curator uploads, multi-user editing or frequent live changes become necessary, the same record/capability fields can move into a database and object storage later.

## Folder and filename convention

Use one common basename per record, in one category folder:

```text
public/library/books/Scripture/Buddhism/dhammapada.pdf
public/library/books/Scripture/Buddhism/dhammapada.epub
public/library/books/Scripture/Buddhism/dhammapada.json
public/library/books/Scripture/Coptic/scan-only.pdf
public/library/books/Scripture/Coptic/scan-only.json
public/library/books/Presentations/introductory-deck.pptx
public/library/books/Presentations/introductory-deck.pdf
public/library/books/Presentations/introductory-deck.json
```

The first becomes **Scripture → Buddhism**, and the second **Scripture → Coptic**. Selecting Scripture includes all descendant categories. `Presentations/` marks records as presentations. `Bible/` displays as **Bibles** through the label override in `public/library/categories.json`; additional aliases can be added using full category paths as keys.

Names can contain spaces and Unicode; the index URL-encodes path segments. Prefer consistent spelling/case. Duplicate formats for the same basename and duplicate record IDs are rejected. Do not use symlinks. The stable metadata `id` preserves book links when you reorganise folders.

At least one PDF, EPUB or PPTX and a matching `.json` are required. Files without metadata fail the build so they cannot be published by accident. Optional `.txt` files support accessible full-text downloads. Each scanned PDF must be valid, and EPUB/PPTX ZIP containers are checked.

## Curated metadata

A minimal companion `dhammapada.json`:

```json
{
  "id": "dhammapada-edition",
  "title": "The Dhammapada",
  "author": "Traditional",
  "translator": "Name of this edition's translator",
  "language": "English",
  "period": "Historical Buddhist text",
  "description": "A short, accurate description of this specific edition.",
  "editionNote": "Edition, translation and OCR preparation details, where relevant.",
  "rights": "The actual permission or public-domain basis for this edition.",
  "sourceUrl": "https://example.org/source-edition",
  "tags": ["Buddhism", "scripture"],
  "accent": "sage",
  "order": 100
}
```

`id`, `title`, `author` and `rights` are required. Keep IDs as unique lowercase slugs. Other fields are optional. `sourceId` is only for a Gutenberg source. Optional `direction: "rtl"` configures right-to-left EPUB reading. `pages` can be supplied for a PDF's card label. `order` controls curated ordering, then titles sort alphabetically. Source links are not assumed to be Gutenberg links.

**Do not manually set file paths or availability flags.** The scanner derives `pdf`, `epub`, `pptx`, `text`, `assets`, `categoryPath`, `categoryKey`, `kind` and `capabilities` from the files. Metadata cannot substitute a missing asset.

## Curation workflow

### Imported research slide decks

The curator-provided **NotebookLM – Web Library** Dropbox folder supplies 97 PDF-only decks (snapshot: 20 October 2026; deck 027 "The Divine Codex" was withdrawn on 21 October 2026) under `Presentations/NotebookLM/`. Each variant is a separate record, even where multiple decks share a numbered source topic. The original filename, page count, download size and source link are retained. These are modern research presentations, not editions of the ancient works they discuss; the collection attribution is Acuity Institute, separate from the authors of the historical works discussed.

The imported PDF binaries are deliberately excluded from Git history. `content/library-imports.json` pins each reviewed file's destination, original filename, byte size and SHA-256. `npm run library:fetch` downloads missing or changed local copies. Catalogue sync, development and production builds run this step automatically before scanning, so deployed readers and downloads still use Acuity-hosted files rather than a Dropbox iframe or temporary link. No new database, storage account or secrets are required. Download requests are paced across workers; temporary responses are retried with exponential backoff and Retry-After handling. Every final file must still match its pinned size and SHA-256 before publication.

The first clean build needs internet access, disk space for the source files and build output, and continuing download access to the shared Dropbox folder. Later builds reuse a valid local cache when available. A missing, changed or unavailable source stops the build instead of publishing a partial collection. To replace a deck, review the new PDF and update its pinned size/hash and metadata together. To remove a deck, remove its manifest entry, companion JSON and local PDF together. Moving a deck also requires updating the manifest destination and `.gitignore` pattern. All these records expose PDF reading, presentation and PDF download; none exposes an E-Book launcher.

### Curator ebook collection

The curator's organised ebook collection (63 records, snapshot: 21 October 2026) is published with both a PDF and an EPUB per record, so each exposes Read PDF, Present and Read E-Book. Binaries come from the curator's **Ebooks** Dropbox folder (`EPUB/` and `PDF/` subfolders) and are pinned in the same `content/library-imports.json` manifest as the decks; the importer accepts `.pdf` and `.epub` destinations. They live under their categories (e.g. `Scripture/Bahai/`, `Esoteric/Occult/`, `Original Works/Ethan James Farrell/`); the matching `.gitignore` patterns keep the binaries out of Git while the companion JSON is committed. Rights statements record the known basis only; records marked "rights to be confirmed" must be cleared before public release. Scanned works note that their EPUB is OCR-derived. The Tao Te Ching record keeps its `tao-te-ching-legge` id and path but now uses the collection's edition.

1. Complete OCR, textual formatting and any EPUB preparation before publication. Do not invent an EPUB for a document that cannot be faithfully prepared.
2. Put the source PDF and, where available, its reviewed EPUB beside the metadata file. For untranscribed image-only material, publish the PDF alone.
3. Run `npm run catalogue:sync` and review `src/data/libraryCatalogue.json`, `src/data/libraryCategories.json` and `public/library/provenance.json`.
4. Run the verification commands below and review both original and ebook modes where applicable.
5. Commit the files and deploy the branch. The web service needs no new secrets or database.

Old starter-book download URLs redirect to the categorised locations. Subsequent moves are tracked in `public/library/redirects.json` when you regenerate the index from the previous catalogue. Keep the generated catalogue and redirect file in version control during moves.

## PowerPoint preparation

The browser presents the PDF alongside a PPTX. It retains the original PowerPoint download. PowerPoint animations, builds and embedded video are not reproduced by a static PDF; Acuity supplies the transition between its pages.

On a curator machine with LibreOffice:

```sh
npm run library:convert -- --dry-run
npm run library:convert
npm run catalogue:sync
```

The converter scans recursively, skips existing PDFs and uses a temporary LibreOffice profile with a 180-second per-file timeout. Use `--force` only to replace existing generated PDFs. Set `LIBREOFFICE_BIN` if `soffice` is not on the path. `--root /path/to/books` supports preparing an external staging folder. The converter records its version and source checksum in the companion metadata. Visually review exported slides before publication. LibreOffice is only needed for this preparation command, not for Railway's build or web server.

PPTX-only records can be downloaded but gain presentation controls only when their matching PDF is present. No automatic conversion runs during a visitor's request.

## Run and verify

Node 22.13+ (`.nvmrc` selects 22):

```sh
npm ci
npm run catalogue:sync
npm run typecheck
npm run build
npm test
npm start
```

Railway keeps `npm run build` / `npm start`, `PORT`, and the existing `SHORTS_DIR` video volume. Book assets are included in the build; the default server port is 8080. The development command scans once before Vite starts; run catalogue sync again after adding/removing files during development.

## Reader behaviour and privacy

- PDF original view preserves the page and graphics. A missing/broken text layer does not stop page rendering. The previous page remains visible until the next finishes painting; the scrollbar viewport stays stable.
- Present mode fits width and height without cropping, supports arrows/Page Up/Page Down/Home/End, and respects reduced-motion preferences. Browser fullscreen is optional; the reader fills the browser window even where that API is unavailable.
- EPUB text reflows at 16–32 px. Times New Roman is used when installed, with Times/Liberation Serif/serif fallbacks. The EPUB's logical location is preserved while changing text size.
- 'Remember my place on this device' is optional and off by default. If enabled, it stores the logical EPUB location and font size in this browser's local storage. Unchecking removes the saved entry. Positions are keyed to the EPUB checksum so a replaced edition cannot silently reuse an obsolete location. Reading still works if storage is blocked.
- No reader preference or reading position is sent to a server. EPUB publication scripts are disabled. The curated files, PDF.js worker/decoders and EPUB renderer are hosted locally.
- The privacy-policy draft must reflect the optional local storage before it is published. The existing draft still has other unconfirmed hosting/retention details.

## Future source-grounded inquiry

Retain stable IDs, original files, source provenance and reviewed text editions. Add separate extraction/section anchors for retrieval later. This release provides viewing and curated availability; it does not offer LLM answers or automatically OCR uploaded sources.
