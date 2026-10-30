export type EbookLink = {kind:'internal';href:string}|{kind:'external';href:string}|{kind:'invalid'};
const archiveOrigin='https://epub.invalid';
const pathKey=(url:URL)=>decodeURIComponent(url.pathname);

// Spine hrefs are relative to the OPF; links inside a section are relative to
// that section. Resolve in the archive, never against the library page URL.
export function resolveEbookLink(raw:string,currentHref:string,sectionHrefs:string[],packageDirectory='/',documentBase=''):EbookLink {
  const href=raw.trim();
  if(!href)return {kind:'invalid'};
  if(href.startsWith('epubcfi(')&&href.endsWith(')'))return {kind:'internal',href};
  try {
    const root=new URL(packageDirectory.replace(/\/?$/,'/'),archiveOrigin+'/');
    const current=new URL(currentHref,root);
    const sections=sectionHrefs.map(section=>({href:section,url:new URL(section,root)}));
    const absolute=/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('//');
    const destination=new URL(href,current);
    if(absolute){
      if(!['http:','https:','mailto:','tel:'].includes(destination.protocol))return {kind:'invalid'};
      // EPUB.js can inject an absolute website base for archived documents.
      // Only treat it as internal when both its origin and archive path match.
      const base=documentBase?new URL(documentBase):undefined;
      const section=base&&destination.origin===base.origin
        ? sections.find(item=>pathKey(item.url)===pathKey(destination)) : undefined;
      return section?{kind:'internal',href:section.href+destination.hash}:{kind:'external',href:destination.href};
    }
    const section=sections.find(item=>pathKey(item.url)===pathKey(destination));
    if(section)return {kind:'internal',href:section.href+destination.hash};
    // Accommodate editions whose links already use OPF-relative paths.
    const packaged=new URL(href.replace(/^\//,''),root);
    const fallback=sections.find(item=>pathKey(item.url)===pathKey(packaged));
    return fallback?{kind:'internal',href:fallback.href+packaged.hash}:{kind:'invalid'};
  }catch{return {kind:'invalid'};}
}

export function bindEbookLinks(doc:Document,options:{currentHref:string;sectionHrefs:string[];packageDirectory:string;
  navigate:(href:string)=>void;external:(href:string)=>void;invalid:()=>void}) {
  // Capture before EPUB.js's onclick handler and native iframe navigation. This
  // also handles keyboard activation and nested elements inside an anchor.
  const click=(event:Event)=>{
    if('button' in event&&Number(event.button)>1)return;
    const anchor=(event.target as Element|null)?.closest?.('a[href],area[href]');
    if(!anchor)return;
    event.preventDefault();event.stopImmediatePropagation();
    const link=resolveEbookLink(anchor.getAttribute('href')||'',options.currentHref,options.sectionHrefs,options.packageDirectory,doc.baseURI);
    if(link.kind==='internal')options.navigate(link.href);
    else if(link.kind==='external')options.external(link.href);
    else options.invalid();
  };
  const capture={capture:true};
  doc.addEventListener('click',click,capture);
  doc.addEventListener('auxclick',click,capture);
  return()=>{doc.removeEventListener('click',click,capture);doc.removeEventListener('auxclick',click,capture);};
}
