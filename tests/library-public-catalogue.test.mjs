import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicLibraryCatalogue} from '../scripts/library-public-catalogue.mjs';
function fixture(){
 const make=(n,format,visibility='public')=>({sha256:n.repeat(64),format,bytes:100,key:`library/assets/${n.repeat(64)}.${format}`,visibility,role:'source',recordIds:['source'],sourceUrl:'https://www.dropbox.com/file?rlkey=PRIVATE',provenance:{secret:'PRIVATE'}});
 const assets=[make('a','pdf'),make('b','epub'),make('c','pdf','private')];
 const source={id:'source',title:'Source',description:'Text https://www.dropbox.com/shared?rlkey=PRIVATE',sourceUrl:'https://www.dropbox.com/shared?rlkey=PRIVATE',originalFilename:'PRIVATE',kind:'book',assets:assets.slice(0,2),overviews:[{id:'overview-source',sourceBookIds:['source'],title:'Overview',assets:[assets[2]]}]};
 return {version:1,release:'test',createdAt:'2026-10-27',assets,books:[source,{id:'private',title:'PRIVATE TITLE',assets:[assets[2]]}]};
}
test('Public catalogue retains paired formats and excludes private files and access-bearing provenance',()=>{
 const out=publicLibraryCatalogue(fixture());assert.equal(out.books.length,1);assert.equal(out.assets.length,2);assert.equal(out.books[0].capabilities.ebook,true);assert.equal(out.books[0].overviews.length,0);assert.equal(out.books[0].sourceUrl,'');
 assert.doesNotMatch(JSON.stringify(out),/PRIVATE|dropbox\.com|rlkey|"provenance":|originalFilename/);assert.match(out.books[0].pdf,/^https:\/\/assets.acuity.institute\//);
});
test('Same-title distinct content is preserved; identical identities are rejected',()=>{
 const full=fixture();full.books[1].title=full.books[0].title;full.assets[2].visibility='public';const out=publicLibraryCatalogue(full);assert.equal(out.books.length,2);assert.equal(out.books[0].overviews.length,1);
 assert.throws(()=>publicLibraryCatalogue({...full,assets:[...full.assets,full.assets[0]]}),/duplicate asset/);
});
test('A missing private EPUB cannot leave an ebook launcher enabled',()=>{
 const full=fixture();full.assets[1].visibility='private';const out=publicLibraryCatalogue(full);assert.equal(out.books[0].capabilities.ebook,false);assert.equal(out.books[0].epub,undefined);
 full.assets[0].key='library/assets/wrong.pdf';assert.throws(()=>publicLibraryCatalogue(full),/Invalid/);
});
