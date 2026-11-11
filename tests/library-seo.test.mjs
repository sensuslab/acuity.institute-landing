import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { attribution, categoryHubs, isPublicSourceUrl, pageTexts, validateSlugs } from '../scripts/library-seo.mjs';

const books = JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('src/data/libraryCategories.json', 'utf8'));
const port = 31000 + Math.floor(Math.random() * 6000);
const origin = `http://127.0.0.1:${port}`;
const shorts = fs.mkdtempSync(path.join(os.tmpdir(), 'acuity-seo-'));
let server;
before(async () => {
  server = spawn(process.execPath, ['server.mjs'], {env: {...process.env, PORT: String(port), SHORTS_DIR: shorts}, stdio: ['ignore', 'pipe', 'pipe']});
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server did not start')), 5000);
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    server.once('error', reject);
  });
});
after(() => { server?.kill(); fs.rmSync(shorts, {recursive: true, force: true}); });
const graphOf = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => { const d = JSON.parse(m[1]); return d['@graph'] || [d]; });

test('Slugs are stable record ids, unique and clear of reserved Library paths', () => {
  validateSlugs(books);
  assert.throws(() => validateSlugs([{id: 'books'}]), /reserved/);
  assert.throws(() => validateSlugs([{id: 'a'}, {id: 'a'}]), /Duplicate/);
});

test('Every record has a unique title and meta description', () => {
  const {titles, descriptions} = pageTexts(books);
  assert.equal(new Set(titles.values()).size, books.length);
  assert.equal(new Set(descriptions.values()).size, books.length);
  for (const d of descriptions.values()) assert.ok(d.length >= 50 && d.length <= 160, d);
});

test('Attribution never presents a tradition or "Unknown" as an author', () => {
  assert.deepEqual(attribution({author: 'Traditional · Hindu', translator: 'Swami Paramananda'}), {author: '', translator: 'Swami Paramananda', tradition: 'Hindu', display: 'Traditional · Hindu'});
  assert.equal(attribution({author: 'Unknown'}).author, '');
  assert.deepEqual(attribution({author: 'Proclus (Taylor trans)'}).translator, 'Taylor');
  assert.equal(attribution({author: 'R. H. Charles (trans)'}).author, '');
});

test('Access-bearing intake URLs are never treated as public sources', () => {
  assert.equal(isPublicSourceUrl('https://www.dropbox.com/scl/fo/x?rlkey=abc'), false);
  assert.equal(isPublicSourceUrl('https://example.org/file?token=abc'), false);
  assert.equal(isPublicSourceUrl('https://www.gutenberg.org/ebooks/216'), true);
});

test('Each record page is server-rendered with canonical, OG image, Book JSON-LD and breadcrumbs', async () => {
  const sample = [books[0], books.find(b => b.kind === 'presentation'), books.find(b => b.author.startsWith('Traditional')), books.at(-1)];
  for (const book of sample) {
    const res = await fetch(`${origin}/library/${book.id}/`);
    assert.equal(res.status, 200, book.id);
    const html = await res.text();
    const canonical = `https://acuity.institute/library/${book.id}/`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}" />`));
    assert.ok(html.includes(`<meta property="og:url" content="${canonical}" />`));
    assert.match(html, /<meta property="og:image" content="https:\/\/acuity\.institute\/og\.png" \/>/);
    assert.ok(html.includes('<h1>'));
    assert.ok(html.includes('href="/library/"'));
    const graph = graphOf(html);
    const work = graph.find(n => n['@id'] === canonical + '#work');
    assert.equal(work['@type'], book.kind === 'presentation' ? 'PresentationDigitalDocument' : 'Book');
    assert.equal(work.name, book.title);
    assert.equal(work.isPartOf['@id'], 'https://acuity.institute/library/#collection');
    assert.ok(work.inLanguage);
    assert.ok(graph.some(n => n['@type'] === 'BreadcrumbList' && n.itemListElement.at(-1).item === canonical));
    assert.ok(graph.some(n => n['@id'] === 'https://acuity.institute/#organization'));
    assert.doesNotMatch(html, /dropbox|rlkey/i);
  }
  assert.equal((await fetch(`${origin}/library/not-a-real-book/`)).status, 404);
  const redirect = await fetch(`${origin}/library/${books[0].id}`, {redirect: 'manual'});
  assert.equal(redirect.status, 308);
});

test('Collection hubs and the sitemap list every record page', async () => {
  const {hubs} = categoryHubs(books, categories);
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
  for (const book of books) assert.ok(sitemap.includes(`<loc>https://acuity.institute/library/${book.id}/</loc><lastmod>`), book.id);
  for (const hub of hubs) {
    assert.ok(sitemap.includes(`<loc>https://acuity.institute${hub.path}</loc>`));
    assert.ok(fs.existsSync(`dist${hub.path}index.html`));
  }
  const top = hubs.find(h => h.depth === 0);
  const html = await (await fetch(origin + top.path)).text();
  for (const book of top.books) assert.ok(html.includes(`href="/library/${book.id}/"`));
  assert.ok(graphOf(html).some(n => n['@type'] === 'CollectionPage' && n.mainEntity?.numberOfItems === top.books.length));
  assert.equal(new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])).size, [...sitemap.matchAll(/<loc>/g)].length);
});

test('Published site copy and llms.txt match the real catalogue size', () => {
  const texts = books.filter(b => b.kind !== 'presentation').length;
  const presentations = books.length - texts;
  for (const file of ['index.html', 'src/data/faq.json', 'public/llms.txt']) {
    const copy = fs.readFileSync(file, 'utf8');
    for (const [, n] of copy.matchAll(/(\d{3}) (?:texts and presentations|records)/g)) assert.equal(Number(n), books.length, file);
    for (const [, n] of copy.matchAll(/(\d{3}) (?:sacred, philosophical|wisdom) texts/g)) assert.equal(Number(n), texts, file);
  }
  const llms = fs.readFileSync('dist/llms.txt', 'utf8');
  assert.ok(llms.includes(`${books.length} records: ${texts} texts and ${presentations} research presentations`));
  assert.ok(llms.includes('## Library'));
  assert.ok(llms.trim().endsWith('Sitemap: https://acuity.institute/sitemap.xml'));
});

test('No public build output carries Dropbox intake links', () => {
  for (const file of fs.readdirSync('dist', {recursive: true})) {
    if (!/\.(html|json|js|txt|xml)$/.test(file)) continue;
    assert.doesNotMatch(fs.readFileSync(path.join('dist', file), 'utf8'), /dropbox\.com|rlkey=/i, file);
  }
});
