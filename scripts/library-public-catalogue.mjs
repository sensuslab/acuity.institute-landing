import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const fields=['id','title','subtitle','author','translator','collection','period','language','description','shortDescription','editionNote','tags','accent','order','categoryKey','categoryPath','categoryLabel','kind','capabilities','pages','pdfBytes','direction','rights','rightsMetadata','trademark','sourceMetadata','sourcePath','upstreamCommit','sourceBodySha256','relatedEditionIds','atlasSourceId'];
function clean(value) {
  if(typeof value==='string')return value.replace(/https?:\/\/[^\s"'<>]+/gi,url=>{
    try {const u=new URL(url);if(/(^|\.)dropbox\.com$|(^|\.)dropboxusercontent\.com$/.test(u.hostname)||[...u.searchParams.keys()].some(k=>/token|signature|secret|^(rlkey|api_key|key|sig|auth)$/i.test(k)))return '[provenance retained privately]';}catch { /* Ordinary text is retained. */ }
    return url;
  });
  if(Array.isArray(value))return value.map(clean);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clean(v)]));
  return value;
}
export function publicLibraryCatalogue(full) {
  if(full?.version!==1||!Array.isArray(full.assets)||!Array.isArray(full.books))throw new Error('Invalid catalogue');
  const all=new Map();
  for(const a of full.assets){
    const ext=a.format==='text'?'txt':a.format==='markdown'?'md':a.format;
    if(!/^[a-f0-9]{64}$/.test(a.sha256||'')||!['pdf','epub','pptx','text','markdown'].includes(a.format)||a.key!==`library/assets/${a.sha256}.${ext}`||all.has(a.sha256))throw new Error('Invalid or duplicate asset identity');
    all.set(a.sha256,a);
  }
  const visible=new Map([...all].filter(([,a])=>a.visibility==='public'));
  const view=a=>{const c=visible.get(a.sha256);if(!c||c.format!==a.format||c.bytes!==a.bytes)throw new Error('Invalid public relationship');return{format:a.format,url:`https://assets.acuity.institute/${c.key}`,bytes:a.bytes,sha256:a.sha256,visibility:'public'};};
  const books=full.books.flatMap(b=>{
    const assets=(b.assets||[]).filter(a=>visible.has(a.sha256)).map(view);if(!assets.length)return [];
    const out=clean(Object.fromEntries(fields.filter(k=>k in b).map(k=>[k,b[k]])));out.sourceUrl='';out.assets=assets;
    for(const a of assets)out[a.format]=a.url;
    out.capabilities={pdf:!!out.pdf,ebook:!!(out.epub&&(out.pdf||out.markdown)),present:!!out.pdf};
    out.overviews=(b.overviews||[]).flatMap(o=>{
      const oa=(o.assets||[]).filter(a=>visible.has(a.sha256)).map(view);if(!oa.some(a=>a.format==='pdf'))return [];
      const v=clean({id:o.id,title:o.title,sourceBookIds:o.sourceBookIds,language:o.language,pages:o.pages,imageOnly:o.imageOnly,pdfBytes:o.pdfBytes});v.assets=oa;
      for(const a of oa)v[a.format]=a.url;return [v];
    });return [out];
  });
  const assets=[...visible.values()].map(a=>({format:a.format,url:`https://assets.acuity.institute/${a.key}`,key:a.key,bytes:a.bytes,sha256:a.sha256,visibility:'public',role:a.role,recordIds:a.recordIds}));
  const result={version:1,release:full.release,createdAt:full.createdAt,books,assets};
  if(full.corpora)result.corpora=clean(full.corpora);
  if(/dropbox\.com|dropboxusercontent\.com|[?&](rlkey|token|access_token|api_key|signature|secret)=/i.test(JSON.stringify(result)))throw new Error('Access-bearing provenance in public catalogue');
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  process.stdout.write(JSON.stringify(publicLibraryCatalogue(JSON.parse(fs.readFileSync(0,'utf8'))))+'\n');
}
