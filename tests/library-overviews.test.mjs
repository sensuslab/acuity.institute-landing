import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {attachLibraryOverviews} from '../scripts/library-overviews.mjs';
import {hydrateLibraryImports} from '../scripts/fetch-library-imports.mjs';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'acuity-overviews-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const bytes = Buffer.from('%PDF-1.7\ncompanion deck');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const url = `/library/overviews/source/${sha256.slice(0,12)}.pdf`;
  const file = path.join(root,url);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
  const book = {id:'source',title:'Source text',kind:'book',pdf:'/source.pdf',epub:'/source.epub',capabilities:{pdf:true,ebook:true,present:true}};
  const overview = {id:'overview-source',title:'Source visual overview',resourceRole:'visual-overview',sourceBookIds:['source'],language:'English',pages:12,imageOnly:true,
    assets:[{format:'pdf',url,bytes:bytes.length,sha256}]};
  return {root,file,book,overview,manifest:{version:1,overviews:[overview]}};
}

test('Verified companions preserve the source assets, kind and ebook capability',async t => {
  const {root,book,manifest,overview} = fixture(t);
  const result = await attachLibraryOverviews({books:[book],manifest,publicDir:root});
  assert.equal(result[0].pdf,book.pdf);assert.equal(result[0].epub,book.epub);
  assert.equal(result[0].kind,'book');assert.deepEqual(result[0].capabilities,book.capabilities);
  assert.equal(result[0].overviews[0].pdf,overview.assets[0].url);
  assert.equal(result[0].overviews[0].epub,undefined);
  assert.equal(book.overviews,undefined);
});

test('Broken relationships, duplicate IDs and changed companion bytes stop the build',async t => {
  const {root,book,manifest,overview,file} = fixture(t);
  const attach = value => attachLibraryOverviews({books:[book],manifest:value,publicDir:root});
  await assert.rejects(attach({version:1,overviews:[{...overview,sourceBookIds:['missing']}]}),/unknown source text/);
  await assert.rejects(attach({version:1,overviews:[overview,overview]}),/duplicate overview id/);
  await assert.rejects(attach({version:1,overviews:[{...overview,assets:[{...overview.assets[0],url:'/library/overviews/../secret.pdf'}]}]}),/invalid overview asset/);
  await assert.rejects(attach({version:1,overviews:[{...overview,assets:[]}]}),/PDF is required/);
  fs.writeFileSync(file,'changed');await assert.rejects(attach(manifest),/differ from reviewed identity/);
});

test('PPTX overview downloads pass through the pinned import cache',async t => {
  const {root} = fixture(t);
  const bytes=Buffer.from('PK\u0003\u0004test-presentation');
  const entry={path:'public/library/overviews/source/123456789abc.pptx',sourceUrl:'https://example.test/slides.pptx',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  const manifestPath=path.join(root,'imports.json');fs.writeFileSync(manifestPath,JSON.stringify({version:1,files:[entry]}));
  assert.deepEqual(await hydrateLibraryImports({root,manifestPath,fetchImpl:async()=>new Response(bytes),log:()=>{}}),{downloaded:1,cached:0});
  assert.deepEqual(fs.readFileSync(path.join(root,entry.path)),bytes);
});

test('Every linked overview has a real source and preserves the library collection',() => {
  const books=JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
  const manifest=JSON.parse(fs.readFileSync('content/library-overviews.json','utf8'));
  assert.equal(manifest.overviews.length,82);
  assert.equal(books.filter(book=>book.kind==='presentation').length,97);
  assert.equal(books.filter(book=>book.kind==='book').length,185);
  for(const item of manifest.overviews) for(const id of item.sourceBookIds) {
    const source=books.find(book=>book.id===id);
    assert.equal(source.kind,'book');assert.ok(source.pdf && source.epub);
    assert.ok(source.overviews.some(overview=>overview.id===item.id));
  }
  assert.equal(manifest.overviews.filter(item=>item.assets.some(asset=>asset.format==='pptx')).length,22);
});

test('Overview actions expose only available formats and do not create ebook controls',async()=>{
  const result=await build({entryPoints:['src/components/LibraryOverviews.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],jsx:'automatic'});
  const require=createRequire(import.meta.url);const output={exports:{}};
  new Function('require','module','exports',result.outputFiles[0].text)(require,output,output.exports);
  const Component=output.exports.default;
  const books=JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
  const overview=books.find(book=>book.id==='tao-te-ching-legge').overviews[0];
  const render=item=>renderToStaticMarkup(React.createElement(Component,{overviews:[item],onOpen:()=>{}}));
  const html=render(overview);
  assert.match(html,/View overview/);assert.match(html,/Present overview/);assert.match(html,/Overview PDF/);assert.match(html,/Overview PPTX/);
  assert.doesNotMatch(html,/EPUB|Read E-Book/);
  assert.doesNotMatch(render({...overview,pptx:undefined}),/Overview PPTX/);
  assert.equal(renderToStaticMarkup(React.createElement(Component,{overviews:[],onOpen:()=>{}})),'');
});
