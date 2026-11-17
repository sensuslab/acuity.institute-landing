// Crawlable, server-rendered Library pages: one page per record, collection hubs,
// a linked index, sitemap entries and an llms.txt section. Metadata is taken only
// from the compiled catalogue; nothing here invents bibliographic facts.
export const ORIGIN = 'https://acuity.institute';
export const ORG_ID = ORIGIN + '/#organization';
export const WEBSITE_ID = ORIGIN + '/#website';
export const LIBRARY_ID = ORIGIN + '/library/#collection';
export const DEFAULT_OG_IMAGE = ORIGIN + '/og.png';
// Bump when the generated page templates change so sitemap lastmod stays truthful.
export const TEMPLATE_DATE = '2026-11-11';
// Paths already used under /library/ by assets, data files and hubs.
export const RESERVED_SLUGS = new Set(['books', 'overviews', 'collections', 'assets', 'catalogues', 'pdfjs', 'index.html', 'provenance.json', 'redirects.json', 'categories.json', 'release.json']);

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsonLd = data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** Access-bearing or private-intake URLs (e.g. Dropbox shared links) are never published. */
export function isPublicSourceUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    if (/(^|\.)dropbox\.com$|(^|\.)dropboxusercontent\.com$/i.test(u.hostname)) return false;
    return ![...u.searchParams.keys()].some(k => /token|signature|secret|^(rlkey|api_key|key|sig|auth)$/i.test(k));
  } catch { return false; }
}

export const bookPath = book => `/library/${book.id}/`;
export const slugSegment = s => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const categoryPath = key => '/library/collections/' + key.split('/').map(slugSegment).join('/') + '/';

/** Separates curated attribution strings into real people/organisations, traditions and translators. */
export function attribution(book) {
  let author = String(book.author || '').trim();
  let translator = book.translator ? String(book.translator).trim() : '';
  let tradition = '';
  const trad = /^Traditional\s*·\s*(.+)$/.exec(author);
  if (trad) { tradition = trad[1]; author = ''; }
  const transOnly = /^(.+?)\s*\(trans\.?\)$/i.exec(author);
  const authorTrans = /^(.+?)\s*\((.+?)\s+trans\.?\)$/i.exec(author);
  if (transOnly) { translator = translator || transOnly[1]; author = ''; }
  else if (authorTrans) { author = authorTrans[1]; translator = translator || authorTrans[2]; }
  if (/^(unknown|anonymous|various)$/i.test(author)) author = '';
  return { author, translator, tradition, display: String(book.author || '').trim() };
}

const ORG_AUTHORS = new Set(['Acuity Institute', 'Three Initiates']);
function agent(name) {
  if (name === 'Acuity Institute') return {'@id': ORG_ID};
  return {'@type': ORG_AUTHORS.has(name) ? 'Organization' : 'Person', name};
}
const LANGUAGE_CODES = {English:'en', Latin:'la', Italian:'it', German:'de', Hebrew:'he', French:'fr', Chinese:'zh', Sanskrit:'sa', 'Ancient Greek':'grc', Arabic:'ar', Persian:'fa'};
export function languageCodes(language) {
  const parts = String(language || '').split(/\s+and\s+|,\s*/).map(s => s.trim()).filter(Boolean);
  if (!parts.length || parts.some(p => !LANGUAGE_CODES[p])) return language && language !== 'Unspecified' ? language : undefined;
  const codes = parts.map(p => LANGUAGE_CODES[p]);
  return codes.length === 1 ? codes[0] : codes;
}

export function truncate(text, max) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).replace(/[\s,;:.–—-]+$/, '') + '…';
}

/** Unique <title> and meta description for every record. */
export function pageTexts(books) {
  const base = new Map();
  for (const book of books) {
    const a = attribution(book);
    const presentation = book.kind === 'presentation';
    const by = presentation ? '' : a.author ? ` by ${a.author}` : a.translator ? `, translated by ${a.translator}` : a.tradition ? ` (${a.tradition} tradition)` : '';
    let name = presentation && book.subtitle ? `${book.title}: ${book.subtitle}` : book.title;
    if (presentation && name.length > 75) name = book.title;
    base.set(book.id, name + by);
  }
  const counts = new Map();
  for (const v of base.values()) counts.set(v, (counts.get(v) || 0) + 1);
  const titles = new Map(), seen = new Set();
  for (const book of books) {
    let t = base.get(book.id);
    if (counts.get(t) > 1 || seen.has(t)) {
      const a = attribution(book);
      const extra = [a.translator && !t.includes(a.translator) ? `trans. ${a.translator}` : '', book.categoryPath.at(-1), book.subtitle].filter(Boolean);
      for (const e of extra) { const c = `${t} (${e})`; if (!seen.has(c)) { t = c; break; } }
      if (seen.has(t)) t = `${t} [${book.id}]`;
    }
    seen.add(t); titles.set(book.id, t.length > 62 ? t : `${t} | Acuity Library`);
  }
  const descriptions = new Map(), seenD = new Set();
  for (const book of books) {
    let d = truncate(book.description || book.shortDescription || '', 155);
    if (d.length < 80) d = truncate(`${d} Free to read and download in the Acuity Open Library.`.trim(), 158);
    if (seenD.has(d)) d = truncate(`${book.subtitle || book.categoryPath.at(-1) || book.title}: ${book.description}`, 155);
    if (seenD.has(d)) d = truncate(`${titles.get(book.id)}. ${book.description}`, 155);
    seenD.add(d); descriptions.set(book.id, d);
  }
  return {titles, descriptions};
}

/** Category hubs: every top-level collection, plus sub-collections holding at least two records. */
export function categoryHubs(books, categories) {
  const hubs = categories.filter(c => c.key !== '_uncategorised' && (c.depth === 0 || c.count >= 2)).map(c => ({...c, path: categoryPath(c.key)}));
  const paths = new Set();
  for (const h of hubs) { if (paths.has(h.path)) throw new Error(`Duplicate collection slug ${h.path}`); paths.add(h.path); }
  const byKey = new Map(hubs.map(h => [h.key, h]));
  for (const h of hubs) h.books = books.filter(b => b.categoryKey === h.key || b.categoryKey.startsWith(h.key + '/'));
  return {hubs, byKey};
}

export function validateSlugs(books) {
  const ids = new Set();
  for (const b of books) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(b.id)) throw new Error(`Unsafe library slug: ${b.id}`);
    if (RESERVED_SLUGS.has(b.id)) throw new Error(`Library slug collides with a reserved path: ${b.id}`);
    if (ids.has(b.id)) throw new Error(`Duplicate library slug: ${b.id}`);
    ids.add(b.id);
  }
}

function breadcrumbs(items) {
  return {'@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({'@type': 'ListItem', position: i + 1, name: item.name, item: ORIGIN + item.path}))};
}
function crumbTrail(book, byKey) {
  const trail = [{name: 'Acuity Institute', path: '/'}, {name: 'Library', path: '/library/'}];
  const segments = book.categoryKey ? book.categoryKey.split('/') : [];
  for (let i = 1; i <= segments.length; i++) {
    const hub = byKey.get(segments.slice(0, i).join('/'));
    if (hub) trail.push({name: hub.label, path: hub.path});
  }
  return trail;
}
const crumbHtml = trail => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map((c, i) => i === trail.length - 1 ? `<li aria-current="page">${escapeHtml(c.name)}</li>` : `<li><a href="${c.path}">${escapeHtml(c.name)}</a></li>`).join('')}</ol></nav>`;

const STYLE = `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#09090f;color:#e8e4da;font:300 17px/1.7 Inter,system-ui,sans-serif;-webkit-tap-highlight-color:transparent}a{color:#f3d38a}a:hover{color:#fff}.wrap{max-width:860px;margin:0 auto;padding:max(24px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) 64px max(20px,env(safe-area-inset-left))}header.site{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid #d4a94a33;padding-bottom:16px;margin-bottom:24px}header.site a{text-decoration:none;letter-spacing:.18em;font-size:13px}.crumbs ol{list-style:none;padding:0;margin:0 0 20px;display:flex;flex-wrap:wrap;gap:6px;font-size:14px;color:#a9a39a}.crumbs li+li:before{content:"›";margin-right:6px;color:#d4a94a}h1,h2,h3{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;color:#f3d38a;line-height:1.2}h1{font-size:clamp(32px,6vw,48px);margin:.2em 0}h2{font-size:28px;margin-top:2em}.subtitle{font-size:20px;color:#cfc8ba;margin-top:0}dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;margin:24px 0;padding:18px;border:1px solid #d4a94a33;border-radius:12px}dt{color:#a9a39a}dd{margin:0}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:24px 0}.actions a{display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border:1px solid #d4a94a88;border-radius:999px;text-decoration:none}.actions a.primary{background:#d4a94a;color:#09090f;font-weight:500}ul.books{list-style:none;padding:0}ul.books li{padding:12px 0;border-bottom:1px solid #ffffff14}ul.books li p{margin:4px 0 0;color:#bdb6aa;font-size:15px}.tags{color:#a9a39a;font-size:14px}footer{margin-top:48px;padding-top:16px;border-top:1px solid #d4a94a33;font-size:14px;color:#a9a39a}@media (hover:hover) and (pointer:fine){.actions a:hover{border-color:#f3d38a}}`;

function shell({title, description, canonical, graph, body, ogType = 'website'}) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${canonical}" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<meta name="theme-color" content="#09090f" />
<meta property="og:site_name" content="Acuity Institute" />
<meta property="og:type" content="${ogType}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:locale" content="en_GB" />
<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Acuity Institute: Pathways to wisdom." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
<meta name="twitter:image:alt" content="Acuity Institute: Pathways to wisdom." />
${jsonLd({'@context': 'https://schema.org', '@graph': graph})}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Cormorant+Garamond:wght@400;500&display=swap" rel="stylesheet" />
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
<header class="site"><a href="/">ACUITY INSTITUTE</a><a href="/library/">THE LIBRARY</a></header>
<main id="main">
${body}
</main>
<footer><p>The Acuity Open Library: free to read and download, no account needed. <a href="/library/">Browse all texts</a> · <a href="/">Acuity Institute</a> · <a href="/privacy/">Privacy</a></p></footer>
</div>
</body>
</html>
`;
}

const ORG_NODE = {'@type': ['Organization', 'EducationalOrganization'], '@id': ORG_ID, name: 'Acuity Institute', url: ORIGIN + '/', logo: ORIGIN + '/icon-512.png'};
const WEBSITE_NODE = {'@type': 'WebSite', '@id': WEBSITE_ID, name: 'Acuity Institute', url: ORIGIN + '/', publisher: {'@id': ORG_ID}};
const LIBRARY_NODE = {'@type': 'CollectionPage', '@id': LIBRARY_ID, name: 'Acuity Open Library', url: ORIGIN + '/library/', isPartOf: {'@id': WEBSITE_ID}, publisher: {'@id': ORG_ID}};

const MIME = {pdf: 'application/pdf', epub: 'application/epub+zip', markdown: 'text/markdown', text: 'text/plain', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
const FORMAT_LABEL = {pdf: 'PDF', epub: 'EPUB', markdown: 'Markdown', text: 'Plain text', pptx: 'PowerPoint'};

const GENERIC_TAGS = new Set(['sacred texts', 'presentation', 'slide deck', 'notebooklm', 'wisdom', 'philosophy', 'ancient wisdom atlas']);
export function relatedBooks(book, books, limit = 6) {
  const tags = new Set((book.tags || []).map(t => t.toLowerCase()).filter(t => !GENERIC_TAGS.has(t) && !/^\d+$/.test(t)));
  const top = book.categoryKey.split('/')[0];
  const explicit = new Set(book.relatedEditionIds || []);
  const score = b => (explicit.has(b.id) ? 100 : 0) + (b.categoryKey === book.categoryKey ? 20 : 0) + (b.author === book.author && !/^(Acuity Institute|Unknown)$/.test(b.author) ? 8 : 0) +
    (b.title.toLowerCase() === book.title.toLowerCase() ? 15 : 0) + (b.tags || []).filter(t => tags.has(t.toLowerCase())).length * 3 + (b.categoryKey.split('/')[0] === top ? 1 : 0) + (b.kind === book.kind ? 1 : 0);
  return books.filter(b => b.id !== book.id).map(b => [b, score(b)]).filter(([, s]) => s > 2)
    .sort((x, y) => y[1] - x[1] || (x[0].order ?? 1000) - (y[0].order ?? 1000) || x[0].title.localeCompare(y[0].title)).slice(0, limit).map(([b]) => b);
}
export function relatedWithFallback(book, books, limit = 6) {
  const out = relatedBooks(book, books, limit);
  const top = book.categoryKey.split('/')[0];
  for (const b of books) { if (out.length >= Math.min(3, limit)) break; if (b.id !== book.id && !out.includes(b) && b.categoryKey.split('/')[0] === top) out.push(b); }
  return out;
}

const listItem = (b, texts) => `<li><a href="${bookPath(b)}">${escapeHtml(b.title)}</a>${b.subtitle ? ` <span class="tags">— ${escapeHtml(b.subtitle)}</span>` : ''}<p>${escapeHtml(b.author)}${b.translator ? ` · trans. ${escapeHtml(b.translator)}` : ''} · ${escapeHtml(b.categoryLabel)}</p>${texts ? `<p>${escapeHtml(texts.descriptions.get(b.id))}</p>` : ''}</li>`;

export function renderBookPage(book, {books, texts, byKey, lastmod}) {
  const canonical = ORIGIN + bookPath(book);
  const a = attribution(book);
  const title = texts.titles.get(book.id);
  const description = texts.descriptions.get(book.id);
  const trail = [...crumbTrail(book, byKey), {name: book.title, path: bookPath(book)}];
  const formats = (book.assets || []).filter(x => MIME[x.format]);
  const source = isPublicSourceUrl(book.sourceUrl) ? book.sourceUrl : '';
  const isPresentation = book.kind === 'presentation';
  const work = {
    '@type': isPresentation ? 'PresentationDigitalDocument' : 'Book',
    '@id': canonical + '#work', name: book.title, url: canonical, mainEntityOfPage: {'@id': canonical},
    alternativeHeadline: book.subtitle || undefined,
    author: a.author ? agent(a.author) : undefined,
    translator: a.translator ? {'@type': 'Person', name: a.translator} : undefined,
    inLanguage: languageCodes(book.language), description: book.description || undefined,
    genre: book.categoryPath.length ? book.categoryPath.join(' / ') : undefined,
    keywords: book.tags?.length ? book.tags.join(', ') : undefined,
    bookFormat: !isPresentation ? 'https://schema.org/EBook' : undefined,
    numberOfPages: Number.isSafeInteger(book.pages) ? book.pages : undefined,
    isAccessibleForFree: true, isPartOf: {'@id': LIBRARY_ID}, provider: {'@id': ORG_ID},
    isBasedOn: source || undefined,
    image: DEFAULT_OG_IMAGE,
    encoding: formats.map(x => ({'@type': 'MediaObject', encodingFormat: MIME[x.format], contentUrl: x.url, contentSize: x.bytes ? `${x.bytes} B` : undefined})),
    hasPart: (book.overviews || []).map(o => ({'@type': 'PresentationDigitalDocument', name: o.title, inLanguage: languageCodes(o.language), url: `${ORIGIN}/library/?book=${book.id}&overview=${o.id}`})),
  };
  const page = {'@type': 'ItemPage', '@id': canonical, url: canonical, name: title, description, isPartOf: {'@id': WEBSITE_ID}, mainEntity: {'@id': canonical + '#work'}, breadcrumb: {'@id': canonical + '#breadcrumb'}, dateModified: lastmod, primaryImageOfPage: {'@type': 'ImageObject', url: DEFAULT_OG_IMAGE}};
  const graph = [ORG_NODE, WEBSITE_NODE, LIBRARY_NODE, page, work, {...breadcrumbs(trail), '@id': canonical + '#breadcrumb'}];
  const facts = [
    a.author && ['Author', a.author], !a.author && a.display && ['Attribution', a.display],
    a.translator && ['Translator', a.translator], a.tradition && ['Tradition', a.tradition],
    book.categoryPath.length && ['Collection', book.categoryPath.join(' / ')],
    book.period && ['Period', book.period], book.language && book.language !== 'Unspecified' && ['Language', book.language],
    Number.isSafeInteger(book.pages) && [isPresentation ? 'Slides' : 'Pages', String(book.pages)],
    formats.length && ['Formats', formats.map(x => FORMAT_LABEL[x.format]).join(', ')],
  ].filter(Boolean);
  const related = relatedWithFallback(book, books);
  const hub = [...trail].reverse().find(c => c.path.startsWith('/library/collections/'));
  const body = `${crumbHtml(trail)}
<article itemscope>
<p class="tags">${escapeHtml(isPresentation ? 'Research presentation' : 'Text')} · Acuity Open Library</p>
<h1>${escapeHtml(book.title)}</h1>
${book.subtitle ? `<p class="subtitle">${escapeHtml(book.subtitle)}</p>` : ''}
<dl class="facts">${facts.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('')}</dl>
<div class="actions"><a class="primary" href="/library/?book=${escapeHtml(book.id)}">Open in the Acuity reader</a>${formats.filter(x => x.format !== 'markdown').map(x => `<a href="${escapeHtml(x.url)}"${x.format === 'pdf' || x.format === 'text' ? '' : ' download'}>${x.format === 'pdf' ? 'Read or download PDF' : `Download ${FORMAT_LABEL[x.format]}`}</a>`).join('')}</div>
<h2>About this ${isPresentation ? 'presentation' : 'text'}</h2>
${String(book.description || '').split(/\n{2,}/).map(p => `<p>${escapeHtml(p)}</p>`).join('\n')}
${book.editionNote ? `<h2>About this edition</h2><p>${escapeHtml(book.editionNote)}</p>` : ''}
${book.rights ? `<h3>Rights</h3><p>${escapeHtml(book.rights)}</p>` : ''}
${source ? `<p><a href="${escapeHtml(source)}" rel="noopener">View the edition source</a></p>` : ''}
${(book.overviews || []).length ? `<h3>Visual overviews</h3><ul>${book.overviews.map(o => `<li><a href="/library/?book=${escapeHtml(book.id)}&amp;overview=${escapeHtml(o.id)}">${escapeHtml(o.title)}</a> · ${o.pages} slides</li>`).join('')}</ul>` : ''}
${book.tags?.length ? `<p class="tags">Topics: ${book.tags.map(escapeHtml).join(' · ')}</p>` : ''}
</article>
${related.length ? `<section><h2>Related in the Library</h2><ul class="books">${related.map(b => listItem(b)).join('')}</ul></section>` : ''}
<p>${hub ? `<a href="${hub.path}">More from ${escapeHtml(hub.name)}</a> · ` : ''}<a href="/library/">All ${books.length} texts and presentations</a></p>`;
  return shell({title, description, canonical, graph, body, ogType: isPresentation ? 'article' : 'book'});
}

export function renderHubPage(hub, {hubs, texts, byKey, books}) {
  const canonical = ORIGIN + hub.path;
  const label = hub.label;
  const parentLabel = hub.depth > 0 ? hub.key.split('/').slice(0, -1).map((_, i, arr) => byKey.get(hub.key.split('/').slice(0, i + 1).join('/'))?.label).filter(Boolean).join(' / ') : '';
  const full = parentLabel ? `${parentLabel} / ${label}` : label;
  const n = hub.books.length;
  const title = `${full}: ${n} free ${n === 1 ? 'text' : 'texts'} | Acuity Library`;
  const sample = hub.books.slice(0, 3).map(b => b.title).join(', ');
  const description = truncate(`Read ${n} ${full} ${n === 1 ? 'work' : 'works'} free online or download as PDF and EPUB from the Acuity Open Library, including ${sample}.`, 158);
  const trail = [{name: 'Acuity Institute', path: '/'}, {name: 'Library', path: '/library/'}];
  const segs = hub.key.split('/');
  for (let i = 1; i <= segs.length; i++) { const h = byKey.get(segs.slice(0, i).join('/')); if (h) trail.push({name: h.label, path: h.path}); }
  const children = hubs.filter(h => h.depth === hub.depth + 1 && h.key.startsWith(hub.key + '/'));
  const graph = [ORG_NODE, WEBSITE_NODE, LIBRARY_NODE,
    {'@type': 'CollectionPage', '@id': canonical, url: canonical, name: title, description, isPartOf: {'@id': LIBRARY_ID}, breadcrumb: {'@id': canonical + '#breadcrumb'},
      mainEntity: {'@type': 'ItemList', numberOfItems: n, itemListElement: hub.books.map((b, i) => ({'@type': 'ListItem', position: i + 1, url: ORIGIN + bookPath(b), name: b.title}))}},
    {...breadcrumbs(trail), '@id': canonical + '#breadcrumb'}];
  const body = `${crumbHtml(trail)}
<h1>${escapeHtml(full)}</h1>
<p>${n} ${n === 1 ? 'work' : 'works'} in the ${escapeHtml(full)} collection of the Acuity Open Library. Every text is free to read online and to download, with no account needed.</p>
${children.length ? `<h2>Sub-collections</h2><ul>${children.map(c => `<li><a href="${c.path}">${escapeHtml(c.label)}</a> (${c.books.length})</li>`).join('')}</ul>` : ''}
<h2>Texts in this collection</h2>
<ul class="books">${hub.books.map(b => listItem(b, texts)).join('')}</ul>
<p><a href="/library/">Browse all ${books.length} texts and presentations</a></p>`;
  return shell({title, description, canonical, graph, body});
}

export function renderIndexBody(books, {hubs, description}) {
  const tops = hubs.filter(h => h.depth === 0);
  const uncategorised = books.filter(b => !b.categoryKey);
  return `<main><h1>The Acuity Open Library</h1><p>${escapeHtml(description)}</p>
<p>${books.length} records: ${books.filter(b => b.kind !== 'presentation').length} texts and ${books.filter(b => b.kind === 'presentation').length} research presentations, all free to read and download.</p>
<nav aria-label="Collections"><h2>Collections</h2><ul>${tops.map(h => `<li><a href="${h.path}">${escapeHtml(h.label)}</a> (${h.books.length})</li>`).join('')}</ul></nav>
${tops.map(h => `<section><h2><a href="${h.path}">${escapeHtml(h.label)}</a></h2><ul>${h.books.map(b => `<li><a href="${bookPath(b)}">${escapeHtml(b.title)}</a> — ${escapeHtml(b.author)}${b.translator ? `, trans. ${escapeHtml(b.translator)}` : ''}</li>`).join('')}</ul></section>`).join('\n')}
${uncategorised.length ? `<section><h2>Other texts</h2><ul>${uncategorised.map(b => `<li><a href="${bookPath(b)}">${escapeHtml(b.title)}</a></li>`).join('')}</ul></section>` : ''}
<p><a href="/">Back to Acuity Institute</a> · <a href="/privacy/">Privacy</a></p></main>`;
}

export function lastmodFor(book, verifiedAt = new Map()) {
  const dates = (book.assets || []).map(a => a.verifiedAt || verifiedAt.get(a.sha256)).filter(Boolean).map(d => d.slice(0, 10));
  return [TEMPLATE_DATE, ...dates].sort().at(-1);
}

export function llmsSection(books, hubs) {
  const tops = hubs.filter(h => h.depth === 0);
  return `\n## Library\n\nThe Acuity Open Library has ${books.length} records: ${books.filter(b => b.kind !== 'presentation').length} texts and ${books.filter(b => b.kind === 'presentation').length} research presentations. Each has its own page at https://acuity.institute/library/<id>/ with author, translator, tradition, period, language, edition notes, rights and direct PDF/EPUB links. All library URLs are listed in https://acuity.institute/sitemap.xml.\n\n${tops.map(h => `- [${h.label}](${ORIGIN}${h.path}): ${h.books.length} records`).join('\n')}\n`;
}
