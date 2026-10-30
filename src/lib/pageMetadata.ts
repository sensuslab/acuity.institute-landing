import metadata from '../data/pageMetadata.json';

export type PageMetadata = { path: string; name: string; title: string; description: string };
const origin = 'https://acuity.institute';
const pages: Record<string, PageMetadata> = metadata;

export function metadataForPath(pathname: string): PageMetadata | undefined {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '') + '/';
  return pages[path];
}

function containsPage(value: unknown, canonical: string): boolean {
  if (!value || typeof value !== 'object') return false;
  const graph = value as Record<string, unknown>;
  if (Array.isArray(graph['@graph'])) return graph['@graph'].some(node => containsPage(node, canonical));
  return ['WebPage', 'CollectionPage'].includes(String(graph['@type'])) && graph.url === canonical;
}

/** Apply the destination's metadata; never restore the page originally loaded. */
export function applyPageMetadata(document: Document, page: PageMetadata) {
  const canonical = origin + page.path;
  document.title = page.title;
  const fields = [
    ['meta[name="description"]', page.description],
    ['meta[property="og:title"]', page.title],
    ['meta[property="og:description"]', page.description],
    ['meta[property="og:url"]', canonical],
    ['meta[name="twitter:title"]', page.title],
    ['meta[name="twitter:description"]', page.description],
  ];
  for (const [selector, content] of fields) {
    const element = document.querySelector<HTMLMetaElement>(selector);
    if (element) element.content = content;
  }
  const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link) link.href = canonical;

  const scripts = [...document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')];
  const current = scripts.some(script => {
    try { return containsPage(JSON.parse(script.textContent || ''), canonical); }
    catch { return false; }
  });
  // Keep rich metadata on an initial Library visit. Replace stale graphs on SPA navigation.
  if (!current) {
    scripts.forEach(script => script.remove());
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: page.name, description: page.description, url: canonical,
      isPartOf: { '@type': 'WebSite', name: 'Acuity.Institute', url: origin + '/' },
    });
    document.head.append(script);
  }
}
