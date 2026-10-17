# SEO review — 17 October 2026

## Observed live site and repository

The live root HTML used a Vite favicon, a short metadata set and an empty React root. The www host redirected to https://acuity.institute/. The matching accessible repository was `ejfsensus/acuity.institute-landing`; the supplied `sensuslab/acuity.institute-landing` URL was inaccessible. Its source matched the live landing content and asset structure. Library navigation pointed to `#`; all three pillar cards displayed Coming Soon. Webinars and shorts were implemented as modals.

## Attached pack: disposition

| Item | Assessment and treatment |
| --- | --- |
| Favicon, touch icons and 1200×630 OG artwork | Suitable; adopted from the supplied archive. |
| Canonical, Open Graph, Twitter metadata and language | Suitable; adopted and expanded for `/library/`. |
| Organization/WebSite JSON-LD | Adopted with claims reduced to supported essentials; no invented SearchAction or education accreditation. |
| Static fallback text | Useful for no-JS access; revised to match available versus planned functionality. It is not a substitute for maintaining visible rendered content. |
| Extra footer outside the React root | Not copied; it would duplicate the application's existing footer. Links were integrated into the real component. |
| About page | Adopted with concise Institute/founder context. Long personal biography claims were not necessary for this feature and were not republished. |
| Privacy page | **Not publication-ready.** Contains explicit `[CONFIRM]` placeholders for regions, providers, transfers, retention and browser storage. Retained in `docs/privacy-policy-draft.html`, excluded from public output and sitemap. |
| robots.txt | Adopted; XML/text MIME types are now served correctly. |
| sitemap.xml | Generated for implemented root, library and About routes. No fabricated last-modified dates. |
| llms.txt | Updated to distinguish the available reading library from future AI functionality. This is informational and does not guarantee indexing or ranking. |

## Server issues corrected

The prior server only served direct files, so `/about/` and `/privacy/` directory paths would fall through to the home SPA. Missing files also returned the home page with status 200. The revised server resolves directory indexes, redirects the library to its slash canonical, returns real 404s, sets PDF/EPUB/XML/text MIME types and supports byte-range PDF delivery and HEAD requests. Existing shorts and health routes are covered by regression checks.

## Remaining owner actions

- Complete the factual privacy draft against actual hosting, automation, enquiry retention and third-party behaviour, then publish and link it. This change does not assert that the site's existing privacy arrangements are compliant.
- Verify the domain in Search Console (DNS or the real verification token), then submit `/sitemap.xml` after deployment. No token was invented or inserted.
- Review social previews and mobile interactions on the deployed preview.
- Keep webinars discoverable through separate, descriptive pages if webinar search visibility becomes a priority; modal-only videos are less straightforward to share/index as distinct resources.
- Later add distinct edition pages if the catalogue grows beyond this initial collection. Current book queries canonicalise to the library; there is no per-book page SEO claim.

## Technical sources

- [PDF.js official examples](https://mozilla.github.io/pdf.js/examples/)
- Source editions linked in `LIBRARY.md` and each catalogue record.
