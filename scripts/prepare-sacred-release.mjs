// Emit an auditable Cloudflare MCP execute program after independent read-back.
// The program reads previous private provenance inside Cloudflare; it never
// prints it or embeds credentials in the generated payload.
import fs from 'node:fs';
import zlib from 'node:zlib';
const directory=process.argv[2];if(!directory)throw new Error('Provide the private import working directory');
const registry=JSON.parse(fs.readFileSync('content/library-r2-registry.json','utf8'));
const source=JSON.parse(fs.readFileSync('data/sources/ancient-wisdom-atlas.json','utf8'));
const context=JSON.parse(fs.readFileSync(directory+'/context-asset.json','utf8'));
const rows=fs.readFileSync(directory+'/readback.jsonl','utf8').trim().split('\n').map(JSON.parse);
const verified=new Map(rows.filter(x=>x.status==='verified').map(x=>[x.sha256,x]));
const incoming=registry.assets.filter(a=>a.recordIds.some(id=>id.startsWith('atlas-')));
if(incoming.length!==645||!verified.has(context.sha256)||incoming.some(a=>!verified.has(a.sha256)))throw new Error('Every new asset and context archive must pass independent R2 size and checksum verification');
for(const a of incoming)Object.assign(a,verified.get(a.sha256));
const pack=zlib.gzipSync(JSON.stringify({registry,source,context:{sha256:context.sha256,bytes:context.bytes,key:context.key,url:context.url}})).toString('base64');
const pure=file=>fs.readFileSync(file,'utf8').replace(/^import .*;\n/gm,'').replace(/^export /gm,'').split("if(process.argv[1]")[0];
const helpers=[pure('scripts/library-asset-registry.mjs'),pure('scripts/library-sacred-texts.mjs'),pure('scripts/library-public-catalogue.mjs')].join('\n');
process.stdout.write(`async()=>{
${helpers}
const zipped=Uint8Array.from(atob(${JSON.stringify(pack)}),c=>c.charCodeAt(0));
const payload=JSON.parse(await new Response(new Blob([zipped]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
const base='/accounts/de2545c9ecc96b244815562f08e0a521/r2/buckets/acuity/objects/';
const get=async key=>{const r=await cloudflare.request({method:'GET',path:base+key});if(!r.success)throw new Error('Cannot read '+key);return r.result;};
const put=async(key,body)=>{JSON.parse(body);const r=await cloudflare.request({method:'PUT',path:base+key,body,contentType:'application/json',rawBody:true});if(!r.success||Number(r.result.size)!==new TextEncoder().encode(body).length)throw new Error('Cannot publish '+key);};
const sha=async body=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const [previous,policy,oldLatest,oldPublicLatest]=await Promise.all(['library/catalogues/2026-10-27-r2-v2.json','library/control/published-policy.json','library/catalogues/latest.json','library/catalogues/public-latest.json'].map(get));
if(policy.release!=='2026-10-27-r2-v2'||oldPublicLatest.release!=='2026-10-27-r2-v2')throw new Error('Release changed; inspect before publishing');
const {registry,source,context}=payload;const release=registry.release;
const full={...previous,release,sourceCommit:registry.sourceCommit,createdAt:new Date().toISOString()};
full.books=mergeSacredTexts(full.books,compileSacredTexts(source,createAssetRegistry(registry)));
const oldAssets=new Map(previous.assets.map(a=>[a.sha256,a]));full.assets=registry.assets.map(a=>({...oldAssets.get(a.sha256),...a}));
full.corpora=[{id:'ancient-wisdom-atlas',credit:source.credit,upstream:source.upstream,commit:source.commit,sourceTexts:source.books.length,context}];
full.publication={...previous.publication,sacredTexts:{source:source.upstream,commit:source.commit,scope:'Complete source texts with upstream full-text rights declarations and separate trademark metadata',requestedAt:full.createdAt}};
const publicCatalogue=publicLibraryCatalogue(full);
if(full.books.length!==607||full.assets.length!==1262||publicCatalogue.assets.length!==1262)throw new Error('Unexpected release counts');
const internalKey='library/catalogues/'+release+'.json',publicKey='library/catalogues/public-'+release+'.json';
const internalBody=JSON.stringify(full)+'\\n',publicBody=JSON.stringify(publicCatalogue)+'\\n';
const pointer=async(key,body)=>({version:1,release,catalogueUrl:'https://assets.acuity.institute/'+key,sha256:await sha(body),bytes:new TextEncoder().encode(body).length,assetCount:full.assets.length,recordCount:full.books.length});
const internalPointer=await pointer(internalKey,internalBody),publicPointer=await pointer(publicKey,publicBody);
const publicKeys=[...new Set([...policy.publicKeys,...full.assets.filter(a=>a.visibility==='public').map(a=>a.key),context.key,publicKey,'library/catalogues/public-latest.json'])];
const newPolicy={...policy,release,corpusAuthorization:full.publication.sacredTexts,publicKeys};
// Save rollback pointers, then immutable snapshots, before advancing publication.
await put('library/control/pre-v3-pointers.json',JSON.stringify({internal:oldLatest,public:oldPublicLatest})+'\\n');
await put(internalKey,internalBody);await put(publicKey,publicBody);
await put('library/control/policy-'+release+'.json',JSON.stringify(newPolicy)+'\\n');
await put('library/catalogues/latest.json',JSON.stringify(internalPointer)+'\\n');
await put('library/control/published-policy.json',JSON.stringify(newPolicy)+'\\n');
await put('library/catalogues/public-latest.json',JSON.stringify(publicPointer)+'\\n');
return {release,internalPointer,publicPointer,sourceTexts:source.books.length,records:full.books.length,assets:full.assets.length,context};
}`);
