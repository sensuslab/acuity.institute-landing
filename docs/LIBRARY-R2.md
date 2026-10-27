# Shared library storage

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

The initial policy keeps assets private where existing parent rights metadata says `private collection`, `to be confirmed` or `not been confirmed`. An overview inherits the parent policy. Other approved library assets are public through the gateway after the release is complete. This is a conservative initial publication policy, not a legal determination. Rights wording and original provenance are retained unchanged.

Private assets are for authenticated service use. Do not merge/deploy this PR as a public-reader cutover until the private-reader authentication or publication policy has been resolved. No access token belongs in browser code, a Vite environment variable, URLs, Git or this document.

Set `READ_TOKEN` as a Worker secret. Trusted backend consumers send `Authorization: Bearer <read-only-secret>` over HTTPS. `INGEST_TOKEN` is a different secret bound only to the temporary ingestor. The read-only gateway never accepts uploads. Use Cloudflare account access to rotate secrets; distribute service credentials only through the consumer's secret manager.

CORS permits the declared library origins in Wrangler configuration. Add each actual staging origin explicitly; an Origin header never grants access. Direct server clients do not require CORS permission. Send a descriptive `User-Agent` from backend clients, as the transfer runner does: live requests using the default Python urllib agent received an upstream 403, while the application agent passed. Review a hostname-specific Cloudflare rule if a future client cannot set this header; do not weaken security settings for the whole zone.

## Consumer contract

- `GET https://assets.acuity.institute/library/catalogues/latest.json` returns the approved release pointer.
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

## Initial release verification

The `2026-10-27-r2-v1` release contains 617 independently verified files (7,810,492,169 bytes), 285 catalogue records, 97 linked overviews and 47 PPTX companions. The gateway exposes 226 assets publicly and requires authenticated service access for 391. The complete provenance catalogue is authenticated. Browser UI verification could not run because the Chromium download failed; live HTTP range/CORS/access checks and repository tests are recorded in the migration report.

## Generated files and provenance

The application catalogue, category index, provenance index and redirects are regenerated during build/test from the existing repository sidecars plus the verified R2 identity registry. The migration PR leaves the existing generated snapshots unchanged in Git; normal builds resolve their asset URLs to R2. The registry contains no Dropbox URLs or copied access-bearing provenance. Full transfer provenance is retained in the authenticated R2 release.
