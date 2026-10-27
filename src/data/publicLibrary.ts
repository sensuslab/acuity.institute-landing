import type {LibraryBook,LibraryCategory} from './library';
const origin='https://assets.acuity.institute';
export async function fetchPublicLibrary(signal:AbortSignal):Promise<{books:LibraryBook[];categories:LibraryCategory[]}> {
  const pointerResponse=await fetch(origin+'/library/catalogues/public-latest.json',{signal,cache:'no-cache'});
  if(!pointerResponse.ok)throw new Error('Library pointer unavailable');
  const pointer=await pointerResponse.json();
  const url=new URL(pointer.url||pointer.catalogueUrl||pointer.path,origin+'/');
  if(url.origin!==origin||!/^\/library\/catalogues\/public-[a-z0-9.-]+\.json$/.test(url.pathname)||!/^[a-f0-9]{64}$/.test(pointer.sha256||''))throw new Error('Invalid library release pointer');
  const response=await fetch(url,{signal});if(!response.ok)throw new Error('Library release unavailable');
  const bytes=await response.arrayBuffer();
  if(pointer.bytes!==bytes.byteLength)throw new Error('Library release size mismatch');
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(hash!==pointer.sha256)throw new Error('Library release checksum mismatch');
  return validatePublicLibrary(JSON.parse(new TextDecoder().decode(bytes)));
}
export function validatePublicLibrary(catalogue:unknown):{books:LibraryBook[];categories:LibraryCategory[]} {
  const input=catalogue as {version?:number;books?:LibraryBook[]};
  if(input?.version!==1||!Array.isArray(input.books)||!input.books.length)throw new Error('Invalid public library');
  const ids=new Set<string>(),categories=new Map<string,LibraryCategory>();
  const books=input.books.map(b=>{
    if(!/^[a-z0-9-]+$/.test(b.id)||ids.has(b.id)||typeof b.title!=='string'||!Array.isArray(b.tags)||!Array.isArray(b.assets)||!Array.isArray(b.categoryPath)||typeof b.categoryKey!=='string')throw new Error('Invalid public book');
    ids.add(b.id);
    const assets=b.assets.map(a=>{
      const ext=a.format==='text'?'txt':a.format==='markdown'?'md':a.format;
      if(!['pdf','epub','pptx','text','markdown'].includes(a.format)||!/^[a-f0-9]{64}$/.test(a.sha256)||a.url!==`${origin}/library/assets/${a.sha256}.${ext}`||!Number.isSafeInteger(a.bytes)||a.bytes<1)throw new Error('Invalid public asset');
      return a;
    });
    const metadata={...b};
    delete metadata.pdf;delete metadata.epub;delete metadata.pptx;delete metadata.text;delete metadata.markdown;
    const formats=Object.fromEntries(assets.map(a=>[a.format,a.url]));
    const book={...metadata,...formats,assets,direction:b.direction==='rtl'?'rtl' as const:'ltr' as const,capabilities:{pdf:!!formats.pdf,ebook:!!(formats.epub&&(formats.pdf||formats.markdown)),present:!!formats.pdf}};
    // Overview URLs are validated under the same immutable asset contract.
    for(const overview of book.overviews||[])for(const a of overview.assets){const ext=a.format;if(!['pdf','pptx'].includes(ext)||!/^([a-f0-9]{64})$/.test(a.sha256)||a.url!==`${origin}/library/assets/${a.sha256}.${ext}`||overview[ext as 'pdf'|'pptx']!==a.url)throw new Error('Invalid public overview');}
    for(let depth=1;depth<=b.categoryPath.length;depth++){
      const key=b.categoryKey.split('/').slice(0,depth).join('/');const c=categories.get(key)||{key,label:b.categoryPath[depth-1],path:b.categoryPath.slice(0,depth),depth:depth-1,count:0};c.count++;categories.set(key,c);
    }
    return book;
  });
  return {books,categories:[...categories.values()].sort((a,b)=>a.key.localeCompare(b.key))};
}
