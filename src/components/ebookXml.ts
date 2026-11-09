import JSZip from 'jszip';

function xmlCharacter(codePoint:number){
  return codePoint===0x9||codePoint===0xa||codePoint===0xd||
    (codePoint>=0x20&&codePoint<=0xd7ff)||(codePoint>=0xe000&&codePoint<=0xfffd)||
    (codePoint>=0x10000&&codePoint<=0x10ffff);
}
const separator=(codePoint:number)=>codePoint===0xb||codePoint===0xc?'\n':' ';

// PDF-derived EPUBs can contain form feeds and other characters forbidden by
// XML 1.0. Repair only those characters; keep wording, Unicode and markup intact.
export function sanitizeEpubXml(source:string):string{
  // The Unicode flag preserves valid surrogate pairs (including emoji).
  // eslint-disable-next-line no-control-regex -- These are the invalid XML characters being repaired.
  return source.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu,
    character=>separator(character.codePointAt(0)!))
    .replace(/(<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>)|&#(?:x([0-9a-f]+)|([0-9]+));/gi,(reference:string,literal:string|undefined,hex:string|undefined,decimal:string|undefined)=>{
      if(literal)return literal;
      const codePoint=Number.parseInt(hex??decimal!,hex===undefined?10:16);
      return xmlCharacter(codePoint)?reference:separator(codePoint);
    });
}

function hasXmlError(document:Document){return document.getElementsByTagName('parsererror').length>0;}

export function normalizeEpubXhtml(source:string):string{
  const parser=new DOMParser();
  if(!hasXmlError(parser.parseFromString(source,'application/xhtml+xml')))return source;
  // Some reading editions contain HTML named entities, bare ampersands or
  // crossed tags. The inert HTML parser recovers their full text and structure;
  // serializing it produces XML-safe XHTML for EPUB.js. Valid XHTML is untouched.
  const document=parser.parseFromString(source,'text/html');
  // HTML parsing leaves xmlns attributes outside the XMLNS namespace. Bind
  // them correctly so XMLSerializer does not emit duplicate declarations.
  document.querySelectorAll('*').forEach(element=>{
    for(const attribute of Array.from(element.attributes)){
      if(attribute.name==='xmlns'||attribute.name.startsWith('xmlns:')){
        element.removeAttribute(attribute.name);
        element.setAttributeNS('http://www.w3.org/2000/xmlns/',attribute.name,attribute.value);
      }
    }
  });
  const repaired=new XMLSerializer().serializeToString(document);
  assertReadableEpubDocument(parser.parseFromString(repaired,'application/xhtml+xml'));
  return repaired;
}

export async function prepareEpubForReader(bytes:ArrayBuffer):Promise<ArrayBuffer>{
  const archive=await JSZip.loadAsync(bytes);
  let changed=false;
  for(const entry of Object.values(archive.files)){
    if(entry.dir||!/\.(?:xhtml|html?|xml|opf|ncx|svg)$/i.test(entry.name))continue;
    const source=await entry.async('string');
    const sanitized=sanitizeEpubXml(source);
    const repaired=/\.(?:xhtml|html?)$/i.test(entry.name)?normalizeEpubXhtml(sanitized):sanitized;
    if(source!==repaired){archive.file(entry.name,repaired,{createFolders:false});changed=true;}
  }
  // Preserve the original bytes for well-formed editions. Repaired editions
  // exist only in reader memory; downloads and canonical R2 hashes stay intact.
  if(!changed)return bytes;
  const mimetype=archive.file('mimetype');
  if(mimetype)archive.file('mimetype',await mimetype.async('uint8array'),{compression:'STORE'});
  return archive.generateAsync({type:'arraybuffer',compression:'DEFLATE'});
}

export function assertReadableEpubDocument(document:Document):void{
  if(hasXmlError(document)){
    throw new Error('This EPUB section contains malformed XML.');
  }
}
