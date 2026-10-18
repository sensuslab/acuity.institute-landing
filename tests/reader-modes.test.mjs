import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const books=JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
async function module(entry){const result=await build({entryPoints:[entry],bundle:true,write:false,format:'esm',platform:'node'});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}
test('Ebook launcher is absent for PDF-only or EPUB-only records, even with stale flags',async()=>{
 // Bundle the action component using this project's React instance to allow server rendering.
 const result=await build({entryPoints:['src/components/BookActions.tsx'],bundle:true,write:false,format:'cjs',platform:'node',external:['react','react/jsx-runtime'],jsx:'automatic'});
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const output={exports:{}};
 new Function('require','module','exports',result.outputFiles[0].text)(require,output,output.exports);
 const Actions=output.exports.default;
 const render=book=>renderToStaticMarkup(React.createElement(Actions,{book,onRead:()=>{}}));
 assert.match(render(books[0]),/Read E-Book/);
 const imageOnly={...books[0],epub:undefined,capabilities:{pdf:true,present:true,ebook:true}};
 assert.doesNotMatch(render(imageOnly),/Read E-Book/);assert.match(render(imageOnly),/Read PDF/);assert.match(render(imageOnly),/Present/);
 assert.doesNotMatch(render({...books[0],pdf:undefined}),/Read E-Book/);
});
test('Category parents include descendants but not similarly named neighbours',async()=>{
 const {inCategory}=await module('src/data/library.ts');
 assert.ok(inCategory({categoryKey:'Scripture/Buddhism'},'Scripture'));
 assert.ok(!inCategory({categoryKey:'Scriptures/Buddhism'},'Scripture'));
 assert.ok(inCategory({categoryKey:''},'_uncategorised'));
});
test('Optional ebook preferences validate stored data and version positions by EPUB hash',async()=>{
 const {parseEbookPreferences,ebookPreferenceKey}=await module('src/components/ebookPreferences.ts');
 assert.equal(parseEbookPreferences('{bad'),undefined);
 assert.equal(parseEbookPreferences('{"fontSize":"large"}'),undefined);
 assert.deepEqual(parseEbookPreferences('{"fontSize":99,"cfi":"epubcfi(/6/2)"}'),{fontSize:32,cfi:'epubcfi(/6/2)'});
 assert.equal(parseEbookPreferences('{"fontSize":20,"cfi":"javascript:bad"}').cfi,undefined);
 assert.notEqual(ebookPreferenceKey('book','old'),ebookPreferenceKey('book','new'));
});
