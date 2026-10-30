# Sacred Texts — Ancient Wisdom Atlas import

The complete-source collection imports **323** Markdown transcriptions from [Ancient Wisdom Atlas](https://github.com/ilaydabdogan/ancient-wisdom-atlas), created and edited by **İlayda Büyükdoğan** (2026), pinned at `07b52ea814bd96b0d6322ec684eeb555fe9dd10f`.

The Atlas original notes, templates and taxonomy are CC0 unless otherwise noted. Source editions retain their own rights status and jurisdiction. Every imported original follows `templates/full-text.md`, including `rights`, separate `trademark`, `provenance` and `transcription` fields. Those fields are retained unchanged in the canonical Markdown and source registry. This import records the upstream rights declarations; it does not invent a new license for translations.

## Contents and duplicate handling

- 323 complete source transcriptions, across the traditions represented in the Atlas.
- 322 generated EPUB reading editions. The matching Gutenberg 216 Legge Tao Te Ching reuses Acuity's existing PDF/EPUB, stable record ID and overview, with its Atlas Markdown attached; it is filed under Sacred Texts.
- 607 total catalogue records: 510 source editions and 97 standalone presentations.
- 15 upstream selections/incomplete transcriptions and 12 modern framework summaries are excluded, with their exact paths and reasons in `content/sacred-texts-import-report.json`.
- Canonical byte hashes and normalized source-body hashes prevent exact duplicates within the import. Exact Gutenberg edition IDs detect the known existing edition. Different translations, editions and source units remain distinct.

The new category is `Sacred Texts`, with tradition subcategories. Source metadata is in `data/sources/ancient-wisdom-atlas.json`; interpretation remains in `patterns/`, motif definitions in `taxonomy/`. The checksum-pinned R2 context archive includes all upstream templates, pattern essays, motif definition files, source registries, the import index, original license and citation.

## Reader and source access

The existing reader is EPUB.js and does not render raw Markdown. The import therefore preserves each original `.md` byte-for-byte in R2 and produces a separate EPUB3 derivative with a contents navigation and edition/license/trademark colophon. There is no PDF requirement for a canonical Markdown + EPUB pair. The old PDF + EPUB rule continues for scan-based records. Source interpretations are not inserted into the source text body.

The library can fetch `https://assets.acuity.institute/library/catalogues/public-latest.json`, verify the downloaded catalogue's SHA-256 and byte size, then update the visible books/categories. It retains the built catalogue when the network or verification fails. Immutable asset URLs are validated before use. Thus a published catalogue refresh does not require downloading the corpus during a website build.

## Reproduction and maintenance

1. Retrieve the pinned upstream trees without relying on a truncated repository-wide recursive tree. Keep source texts and their front matter unchanged.
2. Run `python scripts/import-sacred-texts.py --source-dir <snapshot> --output-dir <working-output> --commit <sha>` (requires PyYAML and Pandoc).
3. Inspect the complete-source exclusions and edition matches. Upload the expected SHA-256 identities to the private R2 bucket using an authenticated Cloudflare API path. No public upload endpoint is needed.
4. Verify the uploaded payload SHA-256 and independently compare the R2 byte count and full-object checksum before marking it verified in `content/library-r2-registry.json`.
5. Build/test the registry and source index, publish immutable private/public catalogue versions, then advance the public pointer and allowlist. Retain the old versions for rollback. Keep internal provenance authenticated.
6. Run `python scripts/restore-sacred-texts.py --directory <target>` to restore all canonical `texts/` paths from R2. Every restoration download is byte-count and SHA-256 checked.

`templates/full-text.md` is the unchanged upstream template. The public Markdown assets and EPUBs remain content-addressed under `library/assets/`; their original hierarchical paths are preserved in the source index. The portable context archive is under `library/corpora/ancient-wisdom-atlas/<commit>/`.

## Deployment boundary

The R2-backed application is connected to Railway's **2.0** environment (`acuity-landing-20.up.railway.app`) from `ejfsensus/acuity.institute-landing`, branch `codex/library-r2-source`. The main `acuity.institute` hostname uses a different production source (`sensuslab/acuity.institute-landing`, `main`). This import does not replace the production homepage or switch the production repository. Production rollout must preserve that distinction.
