import fs from 'node:fs';
import { withBrandIcons } from './apply-brand-icons.mjs';
import { ORIGIN, TEMPLATE_DATE, bookPath, categoryHubs, isPublicSourceUrl, lastmodFor, llmsSection, pageTexts, renderBookPage, renderHubPage, renderIndexBody, validateSlugs } from './library-seo.mjs';
const books = JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('src/data/libraryCategories.json', 'utf8'));
const registry = fs.existsSync('content/library-r2-registry.json') ? JSON.parse(fs.readFileSync('content/library-r2-registry.json', 'utf8')) : {assets: []};
const verifiedAt = new Map(registry.assets.map(asset => [asset.sha256, asset.verifiedAt]));
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const title = 'Open Library | Ancient Wisdom & Philosophy | Acuity Institute';
const description = 'Read and download PDF and EPUB editions of ancient wisdom, philosophy and esoteric traditions. Explore source editions in the Acuity open library.';
validateSlugs(books);
const {hubs, byKey} = categoryHubs(books, categories);
const texts = pageTexts(books);

let html = fs.readFileSync('dist/index.html', 'utf8');
// The homepage graph includes FAQ and Acuity.Agent entities that do not belong on the library page.
const homeGraph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1].replace(/<\\\//g, '</'));
const baseGraph = {'@context':'https://schema.org','@graph':homeGraph['@graph'].filter(node => node['@id'] === 'https://acuity.institute/#organization' || node['@id'] === 'https://acuity.institute/#website')};
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(baseGraph).replace(/</g,'\\u003c')}</script>`)
  .replace(/https:\/\/acuity\.institute\/og-agent\.jpg/g, 'https://acuity.institute/og.png')
  .replace(/(<meta property="og:image:type" content=")[^"]*/, '$1image/png')
  .replace(/(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]*/g, '$1Acuity Institute: Pathways to wisdom.');
html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
  .replace(/(<link rel="canonical" href=")[^"]*/, '$1https://acuity.institute/library/')
  .replace(/(<meta property="og:url" content=")[^"]*/, '$1https://acuity.institute/library/')
  .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, `$1${title}`)
  .replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g, `$1${description}`);
// Crawlable index: plain links to every record page and collection hub. React replaces it on mount.
html = html.replace(/<div id="root">[\s\S]*?<\/div>/, () => `<div id="root">${renderIndexBody(books, {hubs, description})}</div>`);
const structured = {'@context':'https://schema.org','@type':'CollectionPage','@id':'https://acuity.institute/library/#collection',url:'https://acuity.institute/library/',name:'Acuity Open Library',description,
  isPartOf:{'@id':'https://acuity.institute/#website'},publisher:{'@id':'https://acuity.institute/#organization'},
  hasPart:hubs.filter(h=>h.depth===0).map(h=>({'@type':'CollectionPage',name:h.label,url:ORIGIN+h.path})),
  mainEntity:{'@type':'ItemList',numberOfItems:books.length,itemListElement:books.map((book,i)=>({'@type':'ListItem',position:i+1,url:ORIGIN+bookPath(book),name:book.title}))}};
html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script></head>`);
fs.mkdirSync('dist/library', {recursive:true}); fs.writeFileSync('dist/library/index.html',withBrandIcons(html, 'library'));

// One server-rendered page per record, plus collection hubs.
const sitemapEntries = [];
for (const book of books) {
  const lastmod = lastmodFor(book, verifiedAt);
  fs.mkdirSync(`dist${bookPath(book)}`, {recursive:true});
  fs.writeFileSync(`dist${bookPath(book)}index.html`, withBrandIcons(renderBookPage(book, {books, texts, byKey, lastmod}), 'library'));
  sitemapEntries.push({path: bookPath(book), lastmod});
}
for (const hub of hubs) {
  fs.mkdirSync(`dist${hub.path}`, {recursive:true});
  fs.writeFileSync(`dist${hub.path}index.html`, withBrandIcons(renderHubPage(hub, {hubs, texts, byKey, books}), 'library'));
  sitemapEntries.push({path: hub.path, lastmod: [TEMPLATE_DATE, ...hub.books.map(b => lastmodFor(b, verifiedAt))].sort().at(-1)});
}
// Editorial JSON sidecars are build inputs (compiled into the catalogue above); some carry
// private intake provenance, so they are not published alongside the site.
if (fs.existsSync('dist/library/books')) for (const file of fs.readdirSync('dist/library/books', {recursive:true})) if (String(file).endsWith('.json')) fs.rmSync(`dist/library/books/${file}`);
const leaked = [...fs.readdirSync('dist/library', {recursive:true})].filter(f => /\.(html|json)$/.test(f)).some(f => /dropbox\.com|rlkey=/i.test(fs.readFileSync(`dist/library/${f}`, 'utf8')));
if (leaked || books.some(b => b.sourceUrl && !isPublicSourceUrl(b.sourceUrl))) throw new Error('Access-bearing source URL reached generated Library pages');

const urls = [{path:'/'}, {path:'/library/', lastmod: TEMPLATE_DATE}, {path:'/about/'}, {path:'/privacy/'}, ...sitemapEntries];
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${ORIGIN}${escape(u.path)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`);
if (fs.existsSync('dist/llms.txt')) {
  const llms = fs.readFileSync('dist/llms.txt', 'utf8');
  fs.writeFileSync('dist/llms.txt', llms.includes('\nSitemap:') ? llms.replace('\nSitemap:', llmsSection(books, hubs) + '\nSitemap:') : llms + llmsSection(books, hubs));
}
console.log(`Generated library index, ${books.length} record pages, ${hubs.length} collection hubs and a sitemap of ${urls.length} URLs.`);

// Serve the matching decoder/font assets locally, including support for future scanned editions.
for (const dir of ['standard_fonts', 'cmaps', 'wasm']) {
  fs.cpSync(`node_modules/pdfjs-dist/${dir}`, `dist/pdfjs/${dir}`, {recursive:true});
}
fs.copyFileSync('node_modules/pdfjs-dist/LICENSE','dist/pdfjs/LICENSE');
