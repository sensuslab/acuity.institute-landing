import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hydrateLibraryImports} from '../scripts/fetch-library-imports.mjs';

function fixture(t, overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'acuity-import-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const bytes = Buffer.from('%PDF-1.4\nreviewed presentation');
  const entry = {path:'public/library/books/Presentations/NotebookLM/reviewed-deck.pdf',
    sourceUrl:'https://example.test/reviewed.pdf', bytes:bytes.length,
    sha256:createHash('sha256').update(bytes).digest('hex'), ...overrides};
  fs.mkdirSync(path.join(root, 'content'));
  fs.writeFileSync(path.join(root, 'content/library-imports.json'), JSON.stringify({version:1, files:[entry]}));
  return {root, bytes, entry, options:{root, requestIntervalMs:0, retryBaseMs:0, log:() => {}}};
}

test('Imported PDFs use verified local copies and repair a changed cache', async t => {
  const {root, bytes, entry, options} = fixture(t);
  let calls = 0;
  const fetchImpl = async () => {calls++; return new Response(bytes);};
  assert.deepEqual(await hydrateLibraryImports({...options, fetchImpl}), {downloaded:1,cached:0});
  assert.deepEqual(fs.readFileSync(path.join(root,entry.path)), bytes);
  assert.deepEqual(await hydrateLibraryImports({...options, fetchImpl}), {downloaded:0,cached:1});
  assert.equal(calls,1);
  fs.writeFileSync(path.join(root,entry.path), Buffer.alloc(bytes.length));
  assert.deepEqual(await hydrateLibraryImports({...options, fetchImpl}), {downloaded:1,cached:0});
  assert.equal(calls,2);
});

test('Changed or unavailable Dropbox sources stop publication and leave no partial PDF', async t => {
  const {root, entry, options} = fixture(t);
  for (const fetchImpl of [async () => new Response('changed'), async () => new Response('no file',{status:404})]) {
    await assert.rejects(hydrateLibraryImports({...options, fetchImpl, attempts:2}), /Library import failed/);
    assert.equal(fs.existsSync(path.join(root,entry.path)),false);
    assert.deepEqual(fs.readdirSync(path.dirname(path.join(root,entry.path))),[]);
  }
});

test('Import retries transient errors and rejects unsafe destination paths', async t => {
  const {bytes, options} = fixture(t);
  let calls = 0;
  await hydrateLibraryImports({...options, fetchImpl:async () => {
    if (++calls === 1) throw new Error('temporary outage');
    return new Response(bytes);
  }});
  assert.equal(calls,2);
  const unsafe = fixture(t,{path:'public/library/books/../outside.pdf'});
  await assert.rejects(hydrateLibraryImports({...unsafe.options, fetchImpl:async()=>{throw new Error('must not fetch');}}), /Invalid or duplicate/);
});

test('Every imported deck has a distinct PDF-only presentation record with its reviewed identity', () => {
  const imports = JSON.parse(fs.readFileSync('content/library-imports.json','utf8')).files
    .filter(entry => entry.path.startsWith('public/library/books/Presentations/NotebookLM/'));
  const books = JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
  assert.equal(imports.length,97);
  const importedBooks = books.filter(book => book.categoryKey === 'Presentations/NotebookLM');
  assert.equal(importedBooks.length,imports.length);
  for (const entry of imports) {
    const url = '/' + entry.path.slice('public/'.length).split('/').map(encodeURIComponent).join('/');
    const book = importedBooks.find(book => book.pdf === url);
    assert.ok(book,entry.originalFilename);
    assert.equal(book.originalFilename,entry.originalFilename);
    assert.deepEqual(book.capabilities,{pdf:true,ebook:false,present:true});
    assert.equal(book.epub,undefined);
    assert.equal(book.kind,'presentation');
    assert.ok(book.pages > 0);
    assert.equal(book.assets[0].sha256,entry.sha256);
    assert.equal(book.assets[0].bytes,entry.bytes);
  }
});


test('A temporary HTTP 200 HTML page is retried without relaxing the PDF checksum', async t => {
  const {root, bytes, entry, options} = fixture(t);
  let calls = 0;
  const waits = [];
  await hydrateLibraryImports({...options, retryBaseMs:25, wait:async ms => {waits.push(ms);}, fetchImpl:async () => {
    if (++calls === 1) return new Response('<html>Try again later</html>', {headers:{'content-type':'text/html'}});
    return new Response(bytes);
  }});
  assert.equal(calls,2);
  assert.deepEqual(waits,[25]);
  assert.deepEqual(fs.readFileSync(path.join(root,entry.path)),bytes);
});

test('Rate limit retries respect Retry-After and pace subsequent requests', async t => {
  const {bytes, options} = fixture(t);
  let calls = 0;
  const waits = [];
  await hydrateLibraryImports({...options, requestIntervalMs:100, wait:async ms => {waits.push(ms);}, fetchImpl:async () => {
    if (++calls === 1) return new Response('Try later', {status:429,headers:{'retry-after':'2'}});
    return new Response(bytes);
  }});
  assert.equal(calls,2);
  assert.equal(waits[0],2000);
  assert.ok(waits[1] > 0 && waits[1] <= 100);
});

test('Imported curator ebooks pin both a PDF and an EPUB and enable the e-reader', () => {
  const imports = JSON.parse(fs.readFileSync('content/library-imports.json','utf8')).files
    .filter(entry => entry.path.startsWith('public/library/books/') && !entry.path.startsWith('public/library/books/Presentations/'));
  const books = JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
  const stems = new Set(imports.map(entry => entry.path.replace(/\.(pdf|epub)$/,'')));
  assert.equal(imports.length, stems.size * 2);
  for (const stem of stems) {
    const url = '/' + stem.slice('public/'.length).split('/').map(encodeURIComponent).join('/');
    const book = books.find(book => book.pdf === url + '.pdf');
    assert.ok(book, stem);
    assert.equal(book.epub, url + '.epub');
    assert.deepEqual(book.capabilities, {pdf:true,ebook:true,present:true});
  }
});

test('Imported EPUB paths are accepted alongside PDFs', async t => {
  const bytes = Buffer.from('PK\u0003\u0004epub');
  const {root, entry, options} = fixture(t, {path:'public/library/books/Scripture/Test/book.epub', bytes:bytes.length,
    sha256:createHash('sha256').update(bytes).digest('hex')});
  assert.deepEqual(await hydrateLibraryImports({...options, fetchImpl:async () => new Response(bytes)}), {downloaded:1,cached:0});
  assert.deepEqual(fs.readFileSync(path.join(root, entry.path)), bytes);
});
