import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import http from 'node:http';
const books = JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
const port = 18000 + Math.floor(Math.random()*10000);
const origin = `http://127.0.0.1:${port}`;
let server;
const shorts = fs.mkdtempSync(path.join(os.tmpdir(), 'acuity-shorts-'));
before(async () => {
  fs.writeFileSync(path.join(shorts, 'sample.mp4'), '0123456789');
  server = spawn(process.execPath, ['server.mjs'], {env:{...process.env, PORT:String(port), SHORTS_DIR:shorts}, stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Server did not start')),5000);
    server.stdout.on('data',()=>{clearTimeout(timeout);resolve();});
    server.once('error',reject);
    server.once('exit',code=>{if(code)reject(new Error('Server failed '+code));});
  });
});
after(()=>{server?.kill();fs.rmSync(shorts,{recursive:true,force:true});});
test('Catalogue assets retain verified R2 identities and usable format pairs',()=>{
  const registry=JSON.parse(fs.readFileSync('content/library-r2-registry.json','utf8'));
  const byHash=new Map(registry.assets.map(asset=>[asset.sha256,asset]));
  assert.equal(byHash.size,registry.assets.length);assert.equal(registry.assets.filter(a=>a.format==='markdown').length,323);assert.equal(new Set(books.map(b=>b.id)).size,books.length);
  for(const book of books){
    assert.ok(book.pdf || book.epub);assert.match(book.sourceUrl,/^https:\/\//);
    assert.equal(book.capabilities.ebook,!!(book.epub&&(book.pdf||book.markdown)));
    for(const item of [book,...book.overviews])for(const asset of item.assets){
      const verified=byHash.get(asset.sha256);assert.ok(verified);assert.equal(verified.status,'verified');
      assert.equal(asset.url,verified.url);assert.equal(asset.bytes,verified.bytes);
    }
  }
});
test('Library has crawlable book content, its own canonical and valid JSON-LD',async()=>{
  const res=await fetch(origin+'/library/');assert.equal(res.status,200);
  const html=await res.text();
  assert.match(html,/<title>Open Library/);
  assert.match(html,/rel="canonical" href="https:\/\/acuity.institute\/library\/"/);
  for(const b of books){assert.ok(html.includes(b.title));if(b.pdf)assert.ok(html.includes(b.pdf));}
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  const redirect=await fetch(origin+'/library?book=meditations',{redirect:'manual'});
  assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'/library/?book=meditations');
  assert.equal((await fetch(origin+'/about/')).status,200);
});
test('Legacy source and overview download URLs redirect to canonical R2 identities',async()=>{
  const registry=JSON.parse(fs.readFileSync('content/library-r2-registry.json','utf8'));
  for(const format of ['pdf','epub','pptx','text']){
    const asset=registry.assets.find(item=>item.format===format);
    const res=await fetch(origin+asset.legacyUrl,{redirect:'manual'});
    assert.equal(res.status,308);assert.equal(res.headers.get('location'),asset.url);
  }
});
test('Missing files are 404, invalid URL encoding is 400, POST is 405',async()=>{
  for(const url of ['/library/books/missing.pdf','/missing-page','/assets/no.js'])assert.equal((await fetch(origin+url)).status,404);
  const privacy=await fetch(origin+'/privacy/');assert.equal(privacy.status,200);assert.match(await privacy.text(),/noindex/);
  assert.equal((await fetch(origin+'/library/',{method:'POST'})).status,405);
  for(const url of ['/bad%ZZ','/library/%00','/shorts/%2e%2e%2fsecret']){
    const status=await new Promise((resolve,reject)=>{http.get(origin+url,res=>{res.resume();resolve(res.statusCode);}).on('error',reject);});
    assert.equal(status,400);
  }
});
test('Existing health and video range serving still work',async()=>{
  assert.equal(await (await fetch(origin+'/health')).text(),'ok');
  const res=await fetch(origin+'/shorts/sample.mp4',{headers:{Range:'bytes=2-4'}});
  assert.equal(res.status,206);assert.equal(await res.text(),'234');assert.equal(res.headers.get('content-type'),'video/mp4');
});
test('Sitemap only lists implemented canonical pages',async()=>{
  const res=await fetch(origin+'/sitemap.xml');assert.match(res.headers.get('content-type'),/xml/);
  const xml=await res.text();assert.ok(xml.includes('https://acuity.institute/library/'));assert.ok(!xml.includes('/privacy/'));
  const robots=await fetch(origin+'/robots.txt');assert.match(robots.headers.get('content-type'),/text\/plain/);assert.match(await robots.text(),/Sitemap: https:\/\/acuity.institute\/sitemap.xml/);
});
test('Metadata search combines words, collection and format filters',async()=>{
  const {build}=await import('esbuild');
  const result=await build({entryPoints:['src/data/library.ts'],bundle:true,write:false,format:'esm',platform:'node'});
  const {filterBooks}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
  assert.equal(filterBooks('  LEGGE  tao ', 'All collections','pdf')[0].id,'tao-te-ching-legge');
  assert.equal(filterBooks('stoicism', 'All collections','epub')[0].id,'meditations');
  assert.equal(filterBooks('tao', 'Esoteric traditions','all').length,0);
  assert.equal(filterBooks('not-a-real-book', 'All collections','all').length,0);
  assert.equal(filterBooks('', 'All collections','all').length,books.length);
  assert.ok(filterBooks('thunderous silence', 'All collections','all').some(book=>book.id==='the-teaching-of-vimalakirti-toh-176-thurman-trans'));
});

test('Companion links appear in crawlable HTML with canonical R2 PDF/PPTX URLs',async()=>{
 const html=await (await fetch(origin+'/library/')).text();
 const source=books.find(book=>book.id==='tao-te-ching-legge');
 const overview=source.overviews[0];
 assert.ok(html.includes(`overview=${overview.id}`));
 for(const format of ['pdf','pptx']) {
  const asset=overview.assets.find(item=>item.format===format);assert.ok(asset);
  assert.equal(overview[format],asset.url);assert.match(asset.url,/^https:\/\/assets\.acuity\.institute\/library\/assets\/[a-f0-9]{64}\./);
 }
 const graphs=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
 const collection=graphs.find(graph=>graph['@type']==='CollectionPage');
 const item=collection.mainEntity.itemListElement.find(row=>row.item.name==='Tao Te Ching').item;
 assert.equal(item.description,source.description);assert.equal(item.hasPart[0].name,overview.title);
});

test('Old download links redirect to the same categorised edition',async()=>{
 const res=await fetch(origin+'/library/books/meditations.pdf',{redirect:'manual'});
 assert.equal(res.status,308);assert.equal(res.headers.get('location'),books.find(b=>b.id==='meditations').pdf);
});

