import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {compileSacredTexts} from '../scripts/library-sacred-texts.mjs';
import {createAssetRegistry} from '../scripts/library-asset-registry.mjs';
const index=JSON.parse(fs.readFileSync('data/sources/ancient-wisdom-atlas.json','utf8'));
const registry=createAssetRegistry(JSON.parse(fs.readFileSync('content/library-r2-registry.json','utf8')));
async function reader(){const r=await build({entryPoints:['src/data/publicLibrary.ts'],bundle:true,write:false,platform:'node',format:'esm'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}
test('Complete Atlas sources retain separate license and trademark metadata and canonical Markdown',()=>{
 const books=compileSacredTexts(index,registry);assert.equal(books.length,323);
 for(const b of books){assert.ok(b.markdown&&b.epub);assert.equal(b.capabilities.ebook,true);assert.equal(b.sourceMetadata.text_status,'complete');assert.deepEqual(b.rightsMetadata,b.sourceMetadata.rights);assert.deepEqual(b.trademark,b.sourceMetadata.trademark);}
 const broken=structuredClone(index);delete broken.books[0].sourceMetadata.trademark;assert.throws(()=>compileSacredTexts(broken,registry),/metadata/);
});
test('Matching Gutenberg edition reuses its stable ID, PDF, EPUB and visual overview',()=>{
 const books=JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
 const match=index.books.find(b=>b.mergeIntoId);assert.equal(match.mergeIntoId,'tao-te-ching-legge');
 assert.equal(books.some(b=>b.id===match.id),false);
 const book=books.find(b=>b.id===match.mergeIntoId);assert.ok(book.pdf&&book.epub&&book.markdown&&book.overviews.length);assert.equal(book.categoryPath[0],'Sacred Texts');
 assert.equal(books.filter(b=>b.categoryPath[0]==='Sacred Texts').length,323);
});
test('Public refresh validates immutable URLs, duplicate IDs and Markdown reader capability',async()=>{
 const {validatePublicLibrary}=await reader();const books=JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json','utf8'));
 const source=books.find(b=>b.id.startsWith('atlas-'));const fixture={version:1,books:[source]};
 assert.equal(validatePublicLibrary(fixture).books[0].capabilities.ebook,true);
 assert.throws(()=>validatePublicLibrary({...fixture,books:[source,source]}),/book/);
 const bad=structuredClone(fixture);bad.books[0].assets[0].url='https://example.com/file.md';assert.throws(()=>validatePublicLibrary(bad),/asset/);
 const missing=structuredClone(fixture);missing.books[0].assets=missing.books[0].assets.filter(a=>a.format!=='markdown');assert.equal(validatePublicLibrary(missing).books[0].capabilities.ebook,false);
});
test('Public release download rejects checksum mismatch',async()=>{
 const {fetchPublicLibrary}=await reader();const saved=globalThis.fetch;
 globalThis.fetch=async url=>String(url).endsWith('public-latest.json')?Response.json({catalogueUrl:'https://assets.acuity.institute/library/catalogues/public-test.json',sha256:'a'.repeat(64),bytes:2}):new Response('{}');
 try{await assert.rejects(()=>fetchPublicLibrary(new AbortController().signal),/checksum/);}finally{globalThis.fetch=saved;}
});
