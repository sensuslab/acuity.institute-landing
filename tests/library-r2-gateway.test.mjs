import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto,timingSafeEqual} from 'node:crypto';
import {serve,byteRange,authenticated} from '../cloudflare/library/worker.mjs';
Object.defineProperty(globalThis,'crypto',{value:{subtle:{digest:webcrypto.subtle.digest.bind(webcrypto.subtle),timingSafeEqual}},configurable:true});
const key='library/assets/'+'a'.repeat(64)+'.pdf';
const publicKeys=[key];
const object={size:100,etag:'etag',httpEtag:'"etag"',uploaded:new Date('2026-10-27T10:00:00Z'),writeHttpMetadata(h){h.set('Content-Type','application/pdf');}};
function env(published=true) {return {READ_TOKEN:'private-test-key',ALLOWED_ORIGINS:'https://acuity.institute',LIBRARY:{async head(){return object;},async get(k,options){if(k==='library/control/published-policy.json')return {async json(){return {publicKeys:published ? publicKeys : []};}};return {...object,body:new Uint8Array(options?.range?.length || 100)};}}};}
const request=(headers={},method='GET')=>new Request('https://assets.acuity.institute/'+key,{method,headers});
test('Gateway ranges and conditional requests preserve PDF semantics',async()=>{
 for(const [range,length,contentRange] of [['bytes=0-31',32,'bytes 0-31/100'],['bytes=-32',32,'bytes 68-99/100'],['bytes=32-',68,'bytes 32-99/100']]){
  const r=await serve(request({Range:range}),env());assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),contentRange);assert.equal((await r.arrayBuffer()).byteLength,length);
 }
 for(const value of ['bytes=-0','bytes=100-','bytes=1-0','bytes=','bytes=0-1,3-4'])assert.equal(byteRange(value,100),null);
 const invalid=await serve(request({Range:'bytes=100-'}),env());assert.equal(invalid.status,416);assert.equal(invalid.headers.get('Content-Range'),'bytes */100');
 assert.equal((await serve(request({'If-None-Match':'W/"etag"'}),env())).status,304);
 const head=await serve(request({Range:'bytes=0-2'},'HEAD'),env());assert.equal(head.status,200);assert.equal(head.headers.get('Content-Length'),'100');assert.equal(await head.text(),'');
 assert.equal((await serve(request({Range:'bytes=0-2','If-Range':'"old"'}),env())).status,200);
});
test('Private files require authentication before all bytes or metadata access',async()=>{
 for(const method of ['GET','HEAD'])for(const headers of [{},{Range:'bytes=0-1'},{Authorization:'Bearer wrong'}])assert.equal((await serve(request(headers,method),env(false))).status,401);
 const r=await serve(request({Authorization:'Bearer private-test-key'}),env(false));assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'private, no-store');
 assert.equal(await authenticated(request({Authorization:'Bearer private-test-key'}),'private-test-key'),true);
 assert.equal((await serve(request({},'PUT'),env())).status,405);
});
test('CORS allows declared reader origins and never acts as authentication',async()=>{
 const r=await serve(request({Origin:'https://acuity.institute',Range:'bytes=0-1'}),env());assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://acuity.institute');assert.match(r.headers.get('Access-Control-Expose-Headers'),/ETag/);
 const denied=await serve(request({Origin:'https://untrusted.example'}),env());assert.equal(denied.headers.get('Access-Control-Allow-Origin'),null);
 const options=await serve(request({Origin:'https://acuity.institute'},'OPTIONS'),env(false));assert.equal(options.status,204);
 assert.equal((await serve(new Request('https://assets.acuity.institute/library/control/ingest-inventory.json',{headers:{Authorization:'Bearer private-test-key'}}),env())).status,404);
});
