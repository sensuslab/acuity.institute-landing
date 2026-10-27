# Library descriptions and visual overviews

## Current inventory — checked 27 October 2026

The catalogue contains 188 source-text records and 97 standalone presentations.
There are 97 linked visual overviews; 47 also offer PowerPoint downloads.
Companion formats do not create extra source-text cards.

The `eso-slides` Dropbox folder contains 138 items: 101 PDFs, 36 PPTX files and
one JSON manifest. Three PDFs are alternate versions of already linked works;
Essene Gospel of Peace has no corresponding source text. After accounting for
these, 97 PDF overview titles are linked. The adjacent `acuity-nblm-decks` folder
supplies 11 additional PPTX companions; its PDFs duplicate existing titles and
are not reimported as duplicate records. ZIP exports are not separately ingested.

The refresh adds 15 linked overviews and 25 PPTX assets, including the newly
matched Secret Teachings of All Ages. It also adds three source texts:

- The Secret Teachings of All Ages — PDF and EPUB
- Pene Yitsak, Hebrew 1886 Izmir imprint — PDF only
- Dialoghi d'Amore, Italian 1565 imprint — PDF only

The latter two scans are in Ebooks/New Sourced. No EPUB has been fabricated.
Their ebook-reader buttons remain disabled under the existing PDF + EPUB rule.

## Description source

The current curator-supplied `Ebooks/Library Index.csv` contains 184 descriptions.
Its supplied copy replaces 183 earlier descriptions and provides the new Secret
Teachings description. Two additional descriptions introduce the PDF-only works
from their titles, language and sourcing manifest. The original Meditations and
Kybalion introductions remain. Existing standalone presentation descriptions
are unchanged; new descriptions are for source texts only.

Longer descriptions have a compact catalogue excerpt; full supplied copy remains in the detail view and search.

Descriptions live in JSON sidecars beside source texts under
`public/library/books/`. They appear in catalogue cards, details, search,
crawlable HTML and structured metadata. `content/library-sync-report.json`
records the index timestamp/hash, folder counts, additions and unresolved items.

## Asset preparation and relationships

`content/library-overviews.json` defines each overview and its source-book IDs.
`scripts/library-overviews.mjs` verifies these relationships and file identities
before attaching overviews to catalogue entries. Assets live separately under
`public/library/overviews/`, preventing companion PPTX files from changing source
classification or replacing primary PDF/EPUB files.

`content/library-imports.json` pins every imported asset to its size and SHA-256.
New imports also retain Dropbox revision information when supplied. Bytes are
hydrated at build time, checked, and served locally; temporary download links do
not reach the client. Existing files were compared against the current Dropbox
sizes and rehydrated from their pinned sources for verification.

For The Secret Teachings of All Ages, Dropbox refused a temporary link for the
source PDF despite downloadable metadata. The public Internet Archive source
named in the curator index was used instead. Its PDF was verified against the
Archive's published size and SHA-1, then pinned with SHA-256 for library builds.
Its supplied EPUB remains a distinct source asset, separate from the overview.

The overview matching basis remains title, author and edition metadata. This is
an inventory and editorial refresh, not a new scholarly review of every deck.
PDF headers, actual page counts, widescreen layout and PPTX container integrity
were checked for new companion assets.

## Pending files

- **Essene Gospel of Peace.pdf:** no source ebook in the supplied text folders.
- **027 - The Divine Codex Cube and Quantum Crucifixion - THE DIVINE CODEX.pdf:**
  damaged cross-reference data. Poppler could not render a page and MuPDF rendered
  corrupted artwork. It is recorded as pending rather than published.

Dropbox originals are unchanged. The three alternate PDF versions remain in
Dropbox; established primary editions are retained.

## Reader and maintenance

Text details expose View overview, Present overview, Overview PDF and available
Overview PPTX actions. Closing the overview returns to source details; Read source
text opens the original ebook. Image-only slides are labelled and no full OCR
transcript is claimed.

Shareable links use `/library/?book=SOURCE_ID&overview=OVERVIEW_ID`; append
`&view=present` for presentation mode. PDF rendering is loaded on demand.

Run `npm ci`, `npm run build`, `npm test`, `npm run typecheck` and `npm run lint`.
`npm run catalogue:sync` regenerates the catalogue and derived indexes. Update
sidecars and manifests instead of editing generated catalogues by hand. Failed
or changed downloads stop the build; cached bytes are checked again.
