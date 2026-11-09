# Sacred Texts update — release 2026-10-27-r2-v3

The current public release contains 1,262 corpus assets and 607 library records, including 323 Sacred Texts. The context archive is published separately. Canonical Markdown and generated EPUB editions retain per-source rights and separate trademark metadata. See [LIBRARY-SACRED-TEXTS.md](LIBRARY-SACRED-TEXTS.md). The sections below document the earlier 617-file migration.

# Shared library storage

## EPUB reader XML compatibility (9 November 2026)

The live Kitab-i-Iqan reader failure (`PCDATA invalid Char value 12` on
Safari; `Invalid character U+000C` on Chromium) comes from form-feed characters
inside the EPUB's XHTML. Other editions contain HTML named entities, bare
ampersands or crossed emphasis tags. R2 returns the pinned original bytes:
checksums and production CORS passed for the 14 sampled editions. This is a
reading-edition markup compatibility problem, rather than a damaged transfer.

`src/components/ebookXml.ts` prepares the downloaded archive **before** EPUB.js
parses it. XML-forbidden characters become safe separators. XHTML that still
fails strict XML parsing is recovered with the inert HTML parser and serialized
back to valid XHTML, preserving EPUB namespaces, text and internal link targets.
Already valid XHTML and archives remain untouched. Repairs exist only in reader
memory; original downloads, canonical asset URLs and provenance hashes are retained.
The existing non-scripted iframe sandbox and content filtering still apply.
Any remaining XML parser error is rejected before rendering so the reader can
show its retry/download/PDF options instead of embedding a partial error page.

Validation used the real R2 bytes for 14 titles, including Kitab-i-Iqan,
Gleanings, The Hidden Words, A Quantum Coherence Corpus, The Stone Watchers,
Meditations, Tao Te Ching and The Kybalion. All EPUB.js spine sections loaded
after repair; an independent strict XML check of 202 XML/XHTML documents went
from 35 invalid documents to zero. Regression tests include the real EPUB.js
archive/spine pipeline, Unicode, internal anchors, namespaces, entity handling,
resource preservation and unchanged original bytes. No bucket or gateway
configuration change is needed for this application patch.

The `acuity` R2 bucket is the canonical binary store. Dropbox remains intake and backup. Editorial metadata lives in the source JSON sidecars and overview manifest in this repository. Published consumers use one versioned R2 catalogue.

## Components

- `cloudflare/library/worker.mjs`: read-only asset/catalogue gateway at `assets.acuity.institute`; private R2 binding; public allowlist and bearer-authenticated private access.
- `cloudflare/library/ingest.mjs`: separately authenticated, manifest-scoped import endpoint. The migration deployment is temporary and removed after verification.
- Private R2 catalogue/control inventory: frozen source snapshot, original filenames/URLs, stable IDs, roles, immutable keys and initial access policy. Export it only into a private local workspace for migration; do not duplicate access-bearing provenance into a new Git registry.
- `content/library-r2-registry.json`: completed, independently verified identities without Dropbox access URLs or copied provenance. Normal builds require this file and do not download library binaries. `LIBRARY_ASSET_MODE=local` explicitly selects the older full-hydration audit path.
- `scripts/migrate-library-r2.py`: bounded, resumable transfer; R2 checks the pinned checksum during streaming; the runner downloads every R2 object and independently checks byte count and SHA-256.
- `scripts/library-asset-registry.mjs`: rejects unverified records, altered canonical URLs, duplicate aliases and invalid identities during metadata compilation.

Original source PDFs, EPUBs, TXT, standalone presentations and companion PDF/PPTX assets retain separate identities and roles. Existing source IDs, overview links, descriptions and capabilities remain unchanged. A PDF-only source never gains an EPUB reader.

## Access policy

The R2 bucket has no public domain and its r2.dev endpoint remains disabled. The gateway only releases explicitly listed public keys. An unpublished object is private even when its hash is known. GET, HEAD and range requests all apply authentication first.

All 617 unique approved corpus files are public following the user's explicit confirmation on 27 October 2026, including the 391 files initially flagged by generic rights metadata. The flags were migration heuristics, not completed rights determinations. Rights wording and original provenance are retained unchanged; access is controlled by the reviewed registry, not inferred from free-text rights notes. Distinct formats, editions and content variants are retained. No identical SHA-256 file duplicates were found.

The complete provenance catalogue remains authenticated; a separate sanitized public catalogue contains reader metadata and public asset identities without Dropbox access URLs. No access token belongs in browser code, a Vite environment variable, URLs, Git or this document. The earlier publication-policy decision is resolved; website deployment remains a separate application rollout.

Set `READ_TOKEN` as a Worker secret. Trusted backend consumers send `Authorization: Bearer <read-only-secret>` over HTTPS. `INGEST_TOKEN` is a different secret bound only to the temporary ingestor. The read-only gateway never accepts uploads. Use Cloudflare account access to rotate secrets; distribute service credentials only through the consumer's secret manager.

CORS permits the declared library origins in Wrangler configuration. Add each actual staging origin explicitly; an Origin header never grants access. Direct server clients do not require CORS permission. Send a descriptive `User-Agent` from backend clients, as the transfer runner does: live requests using the default Python urllib agent received an upstream 403, while the application agent passed. Review a hostname-specific Cloudflare rule if a future client cannot set this header; do not weaken security settings for the whole zone.

## Consumer contract

- `GET https://assets.acuity.institute/library/catalogues/public-latest.json` anonymously returns the public release pointer.
- `GET https://assets.acuity.institute/library/catalogues/latest.json` remains authenticated and points to the complete internal provenance release.
- Fetch its immutable catalogue URL and verify the published SHA-256.
- Keep the release ID when indexing, and resolve assets by full SHA-256/key, not title or filename.
- Asset URLs support GET, HEAD, byte ranges, ETag revalidation and safe download filenames.
- Private responses are `private, no-store`; public immutable assets have a long browser cache lifetime. Partial responses are streamed without relying on a custom edge-cache implementation.
- Existing website asset paths redirect to the canonical URLs. Source provenance URLs remain historical evidence and are not the active storage locations.

R2 storage does not supply OCR, embeddings or automatic integration into external tools. Each service must connect to the catalogue and retain source hashes and page/chapter locators in its derived index. Keep visual overviews labelled as companions.

## Refresh procedure

1. Add/edit source JSON sidecars, overview relationships and pinned inventory entries; validate new file structure during intake.
2. Use an authenticated temporary ingestion deployment with a private local inventory limited to the intended files. The runner accepts `--inventory PATH`; its default is outside the repository.
3. Run the transfer runner with a private local token file. A verified ledger entry permits safe resume; changed bytes receive a new hash/key.
4. Build the verified registry from independently downloaded copies. Do not mark an asset verified from an ETag alone.
5. Compile metadata from the registry and run build, typecheck, lint and tests.
6. Upload the immutable catalogue release, then update the `latest.json` pointer and public policy last. Incomplete transfers must not update the pointer.
7. Verify representative public/private reader and download routes. Disable/remove the temporary ingestion endpoint when finished.

Cloudflare configuration is represented in the two Wrangler JSONC files. Worker deployment requires Cloudflare account access and R2 binding permissions; do not add account-wide keys to the application. `npx wrangler types --config cloudflare/library/wrangler.jsonc` generates runtime/binding types locally.

## Rollback and retention

Keep the previous immutable catalogue and its policy snapshot. Restore the prior latest pointer/policy together to roll back a release; switching the app back to the previous Git commit also restores the previous asset resolver. A rollback never requires deleting objects. Dropbox originals remain intact.

Do not automatically delete superseded assets. Check references across retained catalogue releases before a separately reviewed cleanup. Monitor R2 account storage and Worker/R2 request usage in Cloudflare: the 10 GB-month Standard allowance is shared across the account and is not a hard capacity cap. The initial corpus is about 7.81 GB; derivatives and retained replacements consume the remaining allowance.

## Initial migration and current publication

The `2026-10-27-r2-v1` release contains 617 independently verified files (7,810,492,169 bytes), 285 catalogue records, 97 linked overviews and 47 PPTX companions. The initial v1 policy exposed 226 assets and required authentication for 391. After explicit confirmation, v2 exposes all 617 files; there are no authenticated-only corpus assets. The complete provenance catalogue is authenticated. Browser UI verification could not run because the Chromium download failed; live HTTP range/CORS/access checks and repository tests are recorded in the migration report.

## Generated files and provenance

The application catalogue, category index, provenance index and redirects are regenerated during build/test from the existing repository sidecars plus the verified R2 identity registry. The migration PR leaves the existing generated snapshots unchanged in Git; normal builds resolve their asset URLs to R2. The registry contains no Dropbox URLs or copied access-bearing provenance. Full transfer provenance is retained in the authenticated R2 release.

## Confirmed public release

Current release: `2026-10-27-r2-v2`. Public catalogue: [public-latest.json](https://assets.acuity.institute/library/catalogues/public-latest.json). It covers 188 source texts, 97 standalone presentations, 97 linked overviews and 47 PPTX companions. The two same-title Celestial Codex presentations cover different subjects and are retained. Source-service access parameters, internal provenance and upload controls remain private. New public catalogues are produced by `scripts/library-public-catalogue.mjs`; tests cover access-URL removal and private-resource exclusion for future releases.
