# Library hostname — verified configuration and activation

Verified 31 October 2026. No live DNS, R2, Worker or Railway settings were changed.

## What is used today

| Item | Confirmed use |
| --- | --- |
| `assets.acuity.institute` | Active custom domain of the `acuity-library-assets` Worker. Its `LIBRARY` binding reads the `acuity` bucket directly. |
| `library.acuity.institute` | Separate enabled R2 custom domain of `acuity`; Cloudflare manages its read-only CNAME to `public.r2.dev`. |
| Bucket `r2.dev` development URL | Disabled. |
| Website catalogue and file resolver | Uses `https://assets.acuity.institute`, not the Library hostname. |

The verified registry has 1,262 file identities, all under `assets.acuity.institute`.
`src/data/publicLibrary.ts`, the immutable asset validator, release pointer and
Worker configuration use that same host. The only previous reference to
`library.acuity.institute` in this branch was this routing proposal.

Live checks fetched the public release pointer and immutable 607-record catalogue,
verified its SHA-256 and read one byte of a PDF with a valid HTTP 206 range response.
The configured website retrieval pipeline does not depend on the R2 Library custom
domain. This check does not inventory external users' bookmarks or third-party clients.

## Routing prepared in this branch

- Requests to `/` with Host `library.acuity.institute` serve the existing Library
  HTML; the client router also opens Library at that root. Queries remain intact.
- `/library/` remains available on both hosts. Canonical metadata continues to
  point at `https://acuity.institute/library/`, avoiding competing catalogue URLs.
- Institute/philosophy/contact links in the reader point back to the Institute.
- The Worker CORS source configuration includes the proposed Library origin.
- Book bytes and release URLs remain on `assets.acuity.institute`.

These changes are draft source only. They must be deployed to the chosen website
and the asset Worker's origin configuration before using the new browser origin.

## Activation sequence

1. **Free the hostname in Cloudflare:** R2 Object Storage → `acuity` → Settings →
   Custom Domains → `library.acuity.institute` → **Remove domain**. This removes
   the R2-managed CNAME. Use the bucket setting, rather than trying to edit the
   read-only DNS record. Keep the bucket and `assets.acuity.institute` intact.
2. **Publish the prepared routing** to the intended website environment and
   publish the asset Worker's CORS configuration for the new Library origin.
   Deployment is separate from this undeployed branch.
3. **Attach to Railway:** project `acuity-institute` → service `acuity-landing` →
   intended environment → Settings → Networking → Custom Domain →
   `library.acuity.institute`, target port **8080**.
4. **Copy Railway's exact DNS instructions** into the `acuity.institute` zone.
   Add its CNAME for `library` and ownership TXT record. Use DNS-only initially
   while verifying the hostname/certificate. Railway generates the target and
   verification value when the custom domain is attached; do not copy another
   hostname's verification token or guess the CNAME target.
5. Verify root/search/book URLs, PDF ranges, EPUB reading, downloads, metadata
   and links back to the Institute. Test on iPhone/iPad as well as desktop.

Observed Railway contexts: production uses `sensuslab/acuity.institute-landing`
`main` and serves `acuity.institute`; environment `2.0` serves
`acuity-landing-20.up.railway.app` from `ejfsensus/acuity.institute-landing`
`codex/library-r2-source`. The tools branch is not deployed to either environment.

If only a short entry URL is needed, a Cloudflare redirect to
`https://acuity.institute/library/` is an alternative, but that changes the
address shown in the browser.

References:
- https://developers.cloudflare.com/r2/buckets/public-buckets/#remove-domain
- https://docs.railway.com/networking/domains/working-with-domains
