# Library descriptions and visual overviews

The library retains its 185 text records and 97 presentation records. This update
replaces 182 placeholder text descriptions using the title, author and edition
details. The existing three curated introductions and all presentation
descriptions are unchanged. These descriptions are editorial discovery copy,
not a newly commissioned full-text or scholarly review.

Descriptions are authored in the JSON sidecar beside each source text under
`public/library/books/`. They appear in the catalogue, detail dialog, description
search, crawlable HTML and structured metadata. Run `npm run catalogue:sync` to
regenerate `src/data/libraryCatalogue.json`; do not maintain that file manually.

## Companion decks

`content/library-overviews.json` defines 82 visual overview resources and their
relationships to source texts. Each has a PDF; 22 also have a PowerPoint download.
The records are associated using title, author and edition details. The original
Adam Kadmon EPUB and two sample decks were inspected during planning. The whole
set has not been subjected to a fresh scholarly content review.

The companion files live separately under `public/library/overviews/` and are
hydrated from `content/library-imports.json` using pinned sizes and SHA-256 hashes.
This prevents a companion PPTX from classifying its source ebook as a presentation,
or a slide PDF from replacing the source text's PDF. They do not create duplicate
book cards or change category counts.

`scripts/library-overviews.mjs` verifies assets and source IDs during catalogue
generation, then attaches the resulting overview records to their source texts.
Links are available in source details through **View overview**, **Present
overview**, **Overview PDF** and, where present, **Overview PPTX**. Closing the
viewer returns to source details; **Read source text** opens the original ebook.

Shareable overview links use `/library/?book=SOURCE_ID&overview=OVERVIEW_ID`;
`&view=present` opens presentation mode. PDF rendering is loaded on demand.
Image-only slides are labelled; the original source remains the accessible
reading alternative. No EPUB or full OCR transcript is manufactured for a deck.

The folder inventory on 25 October included seven PDFs added after the proposal.
Six matched source texts and are included. Two titles remain unlinked because
their source ebooks are not in this catalogue:

- Essene Gospel of Peace
- The Secret Teachings of All Ages — Manly P. Hall

Three alternate PDF files were left out of the import set in favour of the names
matching the source editions: the duplicate Manichaean Scriptures, the `[Ebooks]`
Johannesbuch copy, and the unpunctuated Palamas collected-works copy. Their Dropbox
originals are unchanged. No additional standalone texts have been invented.

## Verification

Run `npm ci`, `npm run build`, `npm test`, `npm run typecheck` and `npm run lint`.
The full build hydrates source files when absent and requires network access to
the existing shared Dropbox sources. Each cached asset is rechecked against its
identity; failed downloads or changed bytes stop the build.

Tests cover source/companion separation, relationship failures, checksum changes,
PowerPoint import paths, description search, structured metadata and local PDF/PPTX
range responses. Keep the original PDF + EPUB requirement for the ebook reader.
