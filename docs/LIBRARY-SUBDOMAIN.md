# Library subdomain — proposed routing

`library.acuity.institute` can be an additional entry to the existing Library.
No separate catalogue or duplicate deployment is required. No live domain,
DNS record, hosting setting or redirect was changed in this draft.

## Two supported approaches

1. **A short address:** redirect `https://library.acuity.institute/` to
   `https://acuity.institute/library/`, preserving search queries. This is the
   smallest change and retains the current canonical URL, readers and assets.
2. **A dedicated Library address:** attach the subdomain to the existing service
   and make its root serve the Library. This also needs host-aware application
   routing: mapping `/` to Library HTML at the server alone would still let
   the client router render the homepage. Keep asset/API paths available,
   make Institute navigation absolute, and choose one canonical address for
   the catalogue and its book pages. Redirect alternate catalogue addresses
   consistently, retaining query parameters and fragments on client links.

The second approach is preferable if the Library should keep its own address
in the browser. The first is sufficient for an easy-to-share entry point.

## Domain activation

For a domain attached directly to the existing Railway service, add the custom
domain first, then use the exact CNAME and ownership TXT records returned by
Railway. Wait for verification and certificate issuance. Do not invent or
reuse another service's target or verification token.

Current reference: https://docs.railway.com/networking/domains/working-with-domains

Before activation, check the root and direct book URLs, searches, PDF/EPUB
reading, downloads, canonical metadata, browser back, and cross-site navigation.
This is a routing proposal; activation is separate from the undeployed tools
branch.
