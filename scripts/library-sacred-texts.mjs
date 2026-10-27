export function compileSacredTexts(index,registry) {
  if(index?.version!==1||!Array.isArray(index.books)||!/^[a-f0-9]{40}$/.test(index.commit||''))throw new Error('Invalid sacred text source index');
  const ids=new Set(),bodies=new Set();
  return index.books.map(source=>{
    if(!/^atlas-[a-z0-9-]+$/.test(source.id)||ids.has(source.id)||bodies.has(source.sourceBodySha256))throw new Error('Duplicate sacred text');
    ids.add(source.id);bodies.add(source.sourceBodySha256);
    const m=source.sourceMetadata;
    if(!/^[a-f0-9]{64}$/.test(source.sourceBodySha256||'')||!/^texts\/(public-domain|open-license|permissioned)\//.test(source.sourcePath||'')||!['public_domain','cc0','cc_by','cc_by_sa'].includes(m?.rights?.status)||m?.text_status!=='complete'||m.transcription?.complete!==true||m.rights?.full_text!=='allowed'||!m.trademark||!m.provenance||source.upstreamCommit!==index.commit)throw new Error('Sacred text lacks complete source, rights or trademark metadata');
    const assets=source.assets.map(a=>{
      const verified=registry.get(a.legacyUrl,a);
      if(!verified.recordIds.some(id=>id===source.id||id===source.mergeIntoId)||verified.visibility!=='public')throw new Error('Sacred text asset is not public');
      return {format:verified.format,url:verified.url,bytes:verified.bytes,sha256:verified.sha256};
    });
    const markdown=assets.find(a=>a.format==='markdown')?.url,epub=assets.find(a=>a.format==='epub')?.url;
    if(!markdown||!epub)throw new Error('Sacred text requires canonical Markdown and reading EPUB');
    return {...source,overviews:[],assets,markdown,epub,capabilities:{pdf:false,ebook:true,present:false}};
  });
}
export function indexLibraryCategories(books) {
  const map=new Map();
  for(const b of books) for(let depth=1;depth<=b.categoryPath.length;depth++){
    const key=b.categoryKey.split('/').slice(0,depth).join('/');
    const c=map.get(key)||{key,label:b.categoryPath[depth-1],path:b.categoryPath.slice(0,depth),depth:depth-1,count:0};c.count++;map.set(key,c);
  }
  return [...map.values()].sort((a,b)=>a.key.localeCompare(b.key));
}
export function mergeSacredTexts(existing,incoming) {
  for(const source of incoming){
    const original=source.mergeIntoId && existing.find(b=>b.id===source.mergeIntoId);
    if(source.mergeIntoId&&!original)throw new Error('Matching edition is missing');
    if(original)Object.assign(original,{markdown:source.markdown,sourceMetadata:source.sourceMetadata,rightsMetadata:source.rightsMetadata,trademark:source.trademark,sourcePath:source.sourcePath,sourceBodySha256:source.sourceBodySha256,upstreamCommit:source.upstreamCommit,atlasSourceId:source.id,editionNote:original.editionNote+' Canonical Markdown supplied by Ancient Wisdom Atlas, edited by İlayda Büyükdoğan (2026).',categoryKey:source.categoryKey,categoryPath:source.categoryPath,categoryLabel:source.categoryLabel,collection:source.collection,assets:[...original.assets,...source.assets.filter(a=>a.format==='markdown')]});
    else {if(existing.some(b=>b.id===source.id))throw new Error('Duplicate library record');existing.push(source);}
  }
  return existing;
}
