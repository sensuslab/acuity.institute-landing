import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createAssetRegistry} from '../scripts/library-asset-registry.mjs';
import {compileLibrary} from '../scripts/library-catalogue.mjs';
const hash='a'.repeat(64);
const asset={format:'pdf',sha256:hash,bytes:123,key:`library/assets/${hash}.pdf`,url:`https://assets.acuity.institute/library/assets/${hash}.pdf`,legacyUrl:'/library/books/Source/source.pdf',visibility:'private',status:'verified',verifiedAt:'2026-10-27T10:00:00Z'};
test('Registry rejects incomplete transfers, path collisions and altered identities',()=>{
 const load=a=>createAssetRegistry({version:1,assets:a});
 for(const change of [{status:'pending'},{bytes:0},{key:'library/assets/wrong.pdf'},{url:'https://untrusted.example/file.pdf'}])assert.throws(()=>load([{...asset,...change}]));
 assert.throws(()=>load([asset,asset]),/Duplicate/);
 assert.throws(()=>load([asset]).get(asset.legacyUrl,{...asset,sha256:'b'.repeat(64)}),/not verified/);
});
test('Metadata compiler works with no source binaries and keeps true format capabilities',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'acuity-remote-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'Source'));fs.writeFileSync(path.join(root,'Source/source.json'),JSON.stringify({id:'source',title:'Source',author:'Author',rights:'Private',epub:'/stale.epub',capabilities:{ebook:true}}));
 const result=await compileLibrary({booksDir:root,assetRegistry:createAssetRegistry({version:1,assets:[asset]})});
 assert.equal(result.books[0].pdf,asset.url);assert.equal(result.books[0].epub,undefined);assert.equal(result.books[0].capabilities.ebook,false);assert.equal(result.books[0].assets[0].sha256,hash);
});
