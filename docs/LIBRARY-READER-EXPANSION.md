# Acuity reader expansion proposal

Status: the PDF presentation mode, paired PDF/EPUB reader, folder-based catalogue and curator PowerPoint conversion command are implemented, 18 October 2026. Raw-PDF OCR/reconstruction remains outside the application: curators supply completed editions. The existing library portal, catalogue, source editions, themes and download links remain the foundation.

## Original design and delivery rationale

One edition in the library, with viewing modes suited to its assets:

- **Read original**: the present PDF reader, preserving the source page and artwork.
- **Present**: one PDF page/slide at a time, fitted to the screen, with quiet transitions and optional browser fullscreen.
- **Read as ebook**: a reflowable EPUB edition with black Times New Roman text on a white page, adjustable text size and edge page-turn controls.

Show only the modes that are actually ready for that edition. Keep source details and downloads reachable in every mode. Reuse the existing book detail dialog; add an explicit mode chooser there instead of changing the public catalogue into a separate application.

## What each source format can support

| Source | Original page view | Slide presentation | Adjustable ebook text |
| --- | --- | --- | --- |
| Normal PDF | Yes, PDF.js | Yes, one page per slide | Requires a separately prepared reflowable edition; zooming the PDF cannot change its typesetting |
| Scanned/image PDF | Yes | Yes, including full-page artwork | OCR, reading-order reconstruction and editorial checking first |
| Graphic-heavy PDF deck | Yes | Preferred presentation input | Usually keep fixed layout; extracting its text will not preserve the designed composition |
| Reflowable EPUB | Via ebook mode | No need to force it into a slide format | Yes: size, line spacing and margins can be changed |
| Fixed-layout EPUB | Needs explicit fixed-layout support | Possible later | Does not automatically become reflowable; offer original layout or a prepared text derivative |
| PPTX | Retain/download original | Convert to a PDF derivative, then use the same presentation viewer | Only a separately edited text edition; slide content is not an ebook automatically |
| Plain text | Current full-text link | Not a priority | Can be prepared as structured EPUB/HTML; headings, paragraphs and references should be reviewed |

The three opening books already have EPUB files, so the first ebook rollout needs no raw-PDF conversion. Their PDF editions remain the references for original page numbers.

## 1. PDF presentation mode

Build `PdfPresentation` on the same PDF.js asset and loading conventions as `PdfReader`, sharing document loading/render cleanup rather than duplicating them.

### Experience

- Fit the complete page inside available width **and height**, preserving aspect ratio. Letterbox on a charcoal background; never crop artwork to fill the viewport.
- Hide the library navigation and document toolbar while presenting. Offer a small, accessible control strip on focus/pointer activity: previous, next, slide count, fullscreen and exit.
- Arrow keys, Page Up/Down, Home/End and explicit buttons; left/right edge tap zones on touch. Do not intercept keys while an input or menu is focused.
- Optional 120–160 ms crossfade after the next page finishes rendering. Honour reduced-motion preferences with immediate replacement. Avoid a white blank frame between pages.
- Use the browser Fullscreen API only in response to the visitor's fullscreen button. Retain a viewport-filling mode when fullscreen is unsupported. Test mobile Safari rather than assuming identical platform behaviour.
- First Escape exits browser fullscreen; a subsequent Escape closes presentation mode. Keep the PDF reader/dialog focus restoration coherent.
- Preserve presentation position when changing view within the session. Original page count is stable; if notes or hidden slides are ever exported, document the export policy.

### Performance

Render the current slide and, within a bounded memory budget, the next/previous slide. Bound pixel dimensions for large graphic decks, cancel obsolete renders, release unused canvases and atomically replace finished pages. Do not render every slide into memory. Use the stable viewport measurement introduced by the flashing fix.

### Acceptance

A portrait PDF and a 16:9 graphic deck both fit without cropping; no blank flashing on page changes; next/previous and fullscreen work with keyboard/touch; reduced-motion works; rapid navigation and a failed page render do not leave the reader stuck.

## 2. E-reader mode

Use a lazy-loaded, locally bundled EPUB reader; EPUB.js is a candidate because it exposes paginated navigation and theme/font-size controls. Pin and validate a release against the actual books before adopting it. The frontend remains React and uses the same edition IDs and library shell.

### Reading design

- White paper (`#fff`) and near-black text (`#111`). Default `font-family: "Times New Roman", Times, "Liberation Serif", serif` for the requested appearance.
- Times New Roman availability varies by device. To guarantee identical typography, either obtain the appropriate webfont rights or ship a suitably licensed serif alternative; do not assume a system-font name guarantees that font is installed.
- Font size, for example 16–32 px; configurable line height and margins, with sensible defaults. Re-paginate on any change while preserving the reader's logical location.
- One page on narrow screens; optional two-page spread on sufficiently wide screens. Keep the centre reading area clear.
- Left/right edge controls, visible on hover/focus, plus keyboard arrows and accessible Previous/Next buttons. Make edge zones distinct from links and text selection. A simple slide/fade is sufficient; a simulated 3D paper curl adds little to the first release.
- Contents/chapter navigation, progress, and a return-to-library control. Save preferences and optional last location locally with a versioned key and a reset control; no account is required. Update the privacy wording when local storage is introduced.
- Store an EPUB logical location/CFI or equivalent stable anchor, not just a rendered page number. Rendered page counts change with font size, margins and device width.
- Keep images and figures in the reading flow. An 'original page' action returns to the PDF where a reviewed source mapping exists; never imply a precise page mapping if there is none.

### EPUB handling

Treat EPUB HTML/CSS as document content, not application code. Disable publication scripts, sanitize or isolate content, and constrain external resources/navigation. Validate the archive before release. Preserve attribution and licence material. Check old Gutenberg EPUB styling with forced black-on-white themes, because publication CSS can override reader preferences.

### Acceptance

All three starter EPUBs load; changing size/margins preserves the passage; edge turns do not consume text selection or link clicks; contents and images work; black text remains readable on white; logical position survives reopen if the visitor chooses local progress saving; fixed-layout EPUBs receive a clear supported-mode decision.

## 3. PPTX ingestion

Keep the original PPTX downloadable and create a PDF derivative for presentation. For the present small catalogue, perform this conversion before publication in the content preparation workflow. It avoids adding an office conversion runtime to every web request.

Use LibreOffice Impress headless export in a dedicated conversion environment, for example:

```sh
soffice --headless --convert-to pdf:impress_pdf_Export --outdir /output /input/deck.pptx
```

Use a unique temporary profile per job; install the expected fonts; bound runtime/memory and isolate conversion from the public web service. Cache by original checksum, conversion version and options. If the library later receives frequent uploads, move conversion to a separate Railway worker and durable object storage; do not make a visitor wait for conversion during a page request.

Review the resulting PDF visually, particularly typography, transparency, diagrams, embedded media and uncommon fonts. PDF export preserves static slides, not PowerPoint builds/animations or interactive/video behaviour. The user's requested simple transition is provided by Acuity between exported slides. If native PowerPoint fidelity becomes essential, evaluate a separate hosted office renderer as an explicit product choice.

This introduces no automatic upload UI in the current repair. A future curator upload interface would need ingestion status, validation, permission controls and a preview/approve step.

## 4. Raw PDF to ebook preparation

Offer this as a curation pipeline, not a font-size toggle over the canvas:

1. Preserve the original PDF and record its checksum and rights/provenance.
2. Detect embedded text, scanned pages, columns, tables, footnotes and illustrations. Some PDFs require OCR only on selected pages.
3. Extract text/layout. Apply OCR to image-only content and reconstruct paragraphs, chapter headings, reading order, captions and footnotes.
4. Remove running headers/footers and repair line-wrap hyphenation without silently changing the author's words. Review low-confidence OCR and non-Latin characters.
5. Produce a structured EPUB or HTML reading derivative; retain source-page/section anchors and conversion metadata.
6. Review representative and difficult pages against the original, then mark the derivative ready. Where the source has complex visual composition, keep the original fixed-layout view as the primary mode.

PDF.js text extraction is useful input, but it does not by itself reconstruct a reliable semantic ebook. A scan has no usable text until OCR is performed. The source text and prepared EPUB should remain separately versioned so future LLM answers can cite the correct edition and source passage.

## Catalogue and stored data

Keep current IDs and `pdf`, `epub`, `text` fields compatible. Extend each entry gradually with an `assets` list and capabilities. A proposed record:

```json
{
  "id": "example-deck",
  "kind": "presentation",
  "availableModes": ["pdf", "present"],
  "assets": [
    {
      "id": "original-pptx",
      "role": "original",
      "format": "pptx",
      "url": "/library/books/example-deck.pptx",
      "sha256": "<verified-original-checksum>"
    },
    {
      "id": "presentation-pdf",
      "role": "presentation",
      "format": "pdf",
      "url": "/library/books/example-deck.pdf",
      "derivedFrom": "original-pptx",
      "status": "ready",
      "conversion": {"tool": "LibreOffice", "version": "<recorded-version>"}
    }
  ]
}
```

For a book, add an `ebook` derivative linked to the original source plus optional source-location mapping. Record media type, bytes, checksum, source/rights, preparation status (`pending`, `processing`, `review`, `ready`, `failed`) and conversion version for every derivative. Update the existing provenance manifest rather than adding an unrelated storage model. The current catalogue can remain JSON; a database/CMS is only needed when curator workflow and scale justify it.

Serve PPTX downloads with `application/vnd.openxmlformats-officedocument.presentationml.presentation`. Preserve PDF byte-range delivery. Extend catalogue filters to Books/Presentations and to formats without making a second portal. Expose modes only when their referenced assets are ready.

## Delivery sequence

1. **Repair:** stable PDF viewport measurement, no canvas clearing between renders, regression test. Implemented on the existing branch.
2. **Present PDFs:** fullscreen/viewport presentation, aspect-fit, keyboard/touch controls and reduced-motion fade. Test with a supplied graphic deck.
3. **Read EPUBs:** build the requested white-paper, Times-style adjustable reader using the existing three EPUBs. Add contents and stable location tracking.
4. **Prepare PPTX:** deterministic offline/worker conversion and catalogue integration; review the first real deck.
5. **Prepare PDF ebooks:** introduce extraction/OCR and review using one text PDF, one scanned text and one complex layout. Publish only approved derivatives.

Each phase can ship independently through the same staging environment. AI querying can later consume the reviewed text and source mappings without changing how visitors browse the library.

## Source references

- [PDF.js official API and text extraction](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html)
- [EPUB.js API: rendition, navigation and themes](https://github.com/futurepress/epub.js/blob/master/documentation/md/API.md)
- [EPUB.js project and scripted-content guidance](https://github.com/futurepress/epub.js)
- [W3C EPUB 3.4: reflowable and fixed-layout publications](https://www.w3.org/TR/epub-34/)
- [LibreOffice command-line parameters](https://help.libreoffice.org/latest/en-GB/text/shared/guide/start_parameters.html)
- [LibreOffice PDF export options](https://help.libreoffice.org/latest/en-US/text/shared/guide/pdf_params.html)
- [MDN Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
