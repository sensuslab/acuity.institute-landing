# The Tools — editorial detail pages

Draft work on gitbot/tools-editorial-pages, based on tools-pages-v2 at
184495251f173fc18442422e89dba54f10ca3831. No deployment or merge is part of this change.

## Pages and availability

| Route | Purpose | Public availability shown |
| --- | --- | --- |
| /tools/ | Connected-tool directory and the Institute's purpose | Acuity.One coming soon; Library live |
| /tools/agent/ | Conversational inquiry, passages, comparison and sources | Coming soon |
| /tools/codex/ | Archive, Context Spheres, Lens, myVault and Studio | Coming soon |
| /tools/library/ | Collection guide, reading options and open-access entry | Live now |
| /tools/search/ | General, Literature, Collections, evidence and research continuity | Coming soon |
| /tools/wisdomvault/ | Retained placeholder for connecting the knowledge library | Under development; disabled in navigation |

Service addresses are identified as coming soon. These pages do not offer
product sign-in, collect waitlist data or make pricing/subscription claims.

## Feature evidence

Copy was checked against the named service branches, with an emphasis on
what a person can do rather than the underlying implementation.

| Service | Reviewed revision | Main evidence |
| --- | --- | --- |
| Agent | 4ec7b610cccce08aecaa2f4c574e978cc68ba64d | README.md, packages/agent/src/prompts/chat.ts, packages/agent/src/tools/sacred-text.ts |
| Codex | f4a5b5932553d3de747d146884db7659204f31a4 | Workspace.tsx, KnowledgeBases.tsx, Archive.tsx, Narration.tsx, open_notebook/acuity/service.py |
| Search | a8fae7be8a761c3e079a3beb1f345a277411da8a | Search workspace, evidence drawer, collection drawer, share/export modal and research handoff |
| WisdomVault | f7d74fcc127b481c1ad68190cdf59bed079c51c9 | Knowledge Library README.md |
| Library | Starting branch, with its existing catalogue build | Reader components, catalogue/compiler, LIBRARY-SACRED-TEXTS.md, LIBRARY-READER-EXPANSION.md |

The public Library builds to 607 records: 510 source editions and 97 standalone
presentations. Counts displayed on its detail page come from the generated
category index. The Agent's 281-text Atlas selection is described separately;
the pages do not imply that Agent and the public Library have identical holdings.
Original texts and Acuity study overviews remain distinct.

Codex's personal **myVault** is explicitly distinguished from **WisdomVault**.
The latter remains a separate connection service in development.

## Artwork and motion

- Original SVG eye, lens, books and vault/portal illustrations extend the home
  page's near-black, gold-line, sacred-geometry identity.
- Existing Agent product artwork is retained and labelled conceptual.
- The supplied acuity-codex_master1.mp4 (123.47 seconds) and
  acuity-gateway-v2_share.mp4 (632.27 seconds) were reviewed as five-second
  frame sequences. The films and available narration informed the positioning,
  typography, cryptex, luminous threads, sources and constellation motifs.
  Historical counts in the narration were not reused as current counts.
- Four compressed WebP stills from the supplied Codex film are in public/tools:
  cryptex at 58 seconds, discovery at 22, synthesis at 65 and connections at 98.
  Together they are approximately 230 KiB. No full video is bundled.
- Motion uses CSS transforms and opacity: slow orbits, floating artwork,
  threads, waveform and progressive entrances. Reduced-motion preferences
  disable these effects.

## Interactive explanations

The examples are labelled illustrative and make no research requests:

- Agent: three example inquiry routes, linked to actual Library searches.
- Codex: selectable example spheres and keyboard-accessible instrument tabs.
- Library: EPUB/PDF/presentation previews; page tone, text size, page turning and
  slide controls. Sample prose is original explanatory copy, not a source quote.
- Search: keyboard-accessible modes and selectable evidence-coverage examples.

## Integration and direct visits

- Desktop and phone navigation includes disabled WisdomVault, outside-click and
  Escape dismissal, active links and 44px navigation targets.
- Webinars and Shorts open their existing modals from the tool pages.
- Cross-page philosophy/contact links resolve to home-page sections.
- Route changes reset reading position. Titles, descriptions, social metadata
  and canonical links update with navigation.
- build-tools-pages.mjs renders full initial HTML, individual metadata and
  structured data for each route, then adds those routes to the sitemap.
  server.mjs deliberately returns 404 for unknown paths; development-server SPA
  fallback alone would conceal missing production pages.
- Library PDF preview links can initialise the real catalogue's format filter
  from a validated query parameter.
- The router dependency was declared in the starting branch but absent from its
  lockfile; the lockfile is now synchronised for a clean install.

## Validation

Run from a clean checkout:

    npm ci
    npm run typecheck
    npm run lint
    npm run build
    npm test

Build precedes the server-route tests because they exercise dist.
The full suite contains 55 checks, including direct tool-page requests, rendered
content, canonical redirects, query preservation, HEAD requests, sitemap URLs,
and 404/405 handling. Existing Library tests are retained.

Browser review covers all four detail pages at 320, 390, 768 and 1024px frame
widths, plus a desktop viewport. It checks horizontal fit and representative
controls, mobile navigation, availability states and Webinars.
This is viewport testing in Chromium; real iPhone/iPad Safari testing remains
a separate device check.

## Continued production review

- A direct visit to a rendered tool page followed by client navigation to Home
  could restore that tool's original metadata. Destination metadata now comes
  from one shared route registry for browser navigation and rendered tool pages.
  Home, Library and history navigation update titles, descriptions, social tags,
  canonical URLs and stale structured data. Initial rich Library metadata is
  preserved.
- A React/DOM regression test starts from actual built Codex HTML and exercises
  Home, Library, Search and browser back. The DOM test dependency is development
  only and is not bundled in the site.
- All instrument panels and navigation disclosure targets remain in the DOM
  with inactive content hidden. Tab/control labels always resolve to existing
  destinations; hidden controls stay outside keyboard navigation.
- A focus-visible skip link leads directly to the focusable main content.
