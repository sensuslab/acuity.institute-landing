import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import {compileLibrary} from '../scripts/library-catalogue.mjs';

const metadata=id=>({id,title:id,author:'Curated author',rights:'Authorised edition',capabilities:{ebook:true},epub:'/missing.epub'});
async function epub(){const archive=new JSZip();archive.file('mimetype','application/epub+zip');archive.file('META-INF/container.xml','<container/>');return archive.generateAsync({type:'nodebuffer'});}
function setup(){return fs.mkdtempSync(path.join(os.tmpdir(),'acuity-catalogue-'));}
function record(root,stem,id){fs.mkdirSync(path.dirname(path.join(root,stem)),{recursive:true});fs.writeFileSync(path.join(root,stem+'.json'),JSON.stringify(metadata(id)));fs.writeFileSync(path.join(root,stem+'.pdf'),'%PDF-1.7\nfixture');}

test('Nested folders categorise records; only real paired assets enable ebook mode',async()=>{
 const root=setup();try{
  record(root,'Scripture/Buddhism/shared-title','buddhist-text');
  record(root,'Scripture/Coptic/shared-title','coptic-scan');
  record(root,'Bible/Old Testament','old-testament');
  record(root,'Presentations/my-deck','my-deck');
  fs.writeFileSync(path.join(root,'Scripture/Buddhism/shared-title.epub'),await epub());
  let result=await compileLibrary({booksDir:root,categoryLabels:{Bible:'Bibles'}});
  const buddhist=result.books.find(b=>b.id==='buddhist-text');const coptic=result.books.find(b=>b.id==='coptic-scan');
  assert.equal(buddhist.capabilities.ebook,true);assert.equal(coptic.capabilities.ebook,false);
  assert.equal(coptic.epub,undefined);assert.equal(coptic.capabilities.present,true);assert.equal(coptic.capabilities.pdf,true);
  assert.deepEqual(buddhist.categoryPath,['Scripture','Buddhism']);
  assert.equal(result.categories.find(c=>c.key==='Scripture').count,2);
  assert.equal(result.categories.find(c=>c.key==='Scripture/Buddhism').depth,1);
  assert.equal(result.categories.find(c=>c.key==='Bible').label,'Bibles');
  assert.ok(result.books.find(b=>b.id==='old-testament').pdf.includes('Old%20Testament.pdf'));
  assert.equal(result.books.find(b=>b.id==='my-deck').kind,'presentation');
  fs.unlinkSync(path.join(root,'Scripture/Buddhism/shared-title.epub'));
  result=await compileLibrary({booksDir:root});
  assert.equal(result.books.find(b=>b.id==='buddhist-text').capabilities.ebook,false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('Curated scanner rejects unpaired metadata, duplicates and invalid EPUB archives',async()=>{
 const root=setup();try{
  record(root,'text','text');fs.writeFileSync(path.join(root,'text.epub'),'not an EPUB');
  await assert.rejects(compileLibrary({booksDir:root}));
  fs.unlinkSync(path.join(root,'text.epub'));record(root,'another','text');
  await assert.rejects(compileLibrary({booksDir:root}),/Duplicate record id/);
  fs.unlinkSync(path.join(root,'another.json'));
  await assert.rejects(compileLibrary({booksDir:root}),/matching .json/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
