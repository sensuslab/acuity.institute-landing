import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import JSZip from 'jszip';
import {JSDOM} from 'jsdom';

const {window}=new JSDOM('',{url:'https://reader.test/'});
Object.assign(globalThis,{window,document:window.document,DOMParser:window.DOMParser,XMLSerializer:window.XMLSerializer});
const ePub=createRequire(import.meta.url)('epubjs').default;

const result=await build({entryPoints:['src/components/ebookXml.ts'],bundle:true,write:false,format:'cjs',platform:'node',external:['jszip']});
const output={exports:{}};
new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),output,output.exports);
const {sanitizeEpubXml,normalizeEpubXhtml,prepareEpubForReader,assertReadableEpubDocument}=output.exports;
const xhtml=body=>`<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Reading</title></head><body>${body}</body></html>`;
async function epub(section){
  const zip=new JSZip();
  zip.file('mimetype','application/epub+zip',{compression:'STORE'});
  zip.file('META-INF/container.xml','<container/>',{createFolders:false});
  zip.file('EPUB/chapter.xhtml',section,{createFolders:false});
  zip.file('EPUB/styles.css','p { color: black; }',{createFolders:false});
  zip.file('EPUB/image.png',new Uint8Array([0,12,255,1]),{createFolders:false});
  return zip.generateAsync({type:'arraybuffer',compression:'DEFLATE'});
}

test('Form-feed page breaks from PDF-derived text become XML-safe separators',()=>{
  const source=xhtml('<h1 id="kitab-i-iqan">Title</h1><p>Foreword</p>\n<p>\fPart One</p><p>word\fword</p>');
  const repaired=sanitizeEpubXml(source);
  assert.equal(repaired,source.replaceAll('\f','\n'));
  assert.ok(repaired.includes('<p>\nPart One</p>'));
  assert.equal(sanitizeEpubXml(repaired),repaired);
});

test('All XML 1.0 forbidden characters and references are repaired without joining words',()=>{
  for(const codePoint of [...Array.from({length:32},(_,i)=>i).filter(i=>![9,10,13].includes(i)),0xd800,0xdfff,0xfffe,0xffff]){
    const separator=[11,12].includes(codePoint)?'\n':' ';
    for(const value of [String.fromCharCode(codePoint),`&#${codePoint};`,`&#x${codePoint.toString(16)};`]){
      assert.equal(sanitizeEpubXml(`before${value}after`),`before${separator}after`);
    }
  }
  for(const value of ['&#x110000;','&#1114112;','&#999999999999999999999999;'])assert.equal(sanitizeEpubXml(value),' ');
});

test('Valid Unicode, lineation, entities, links and edition notices remain unchanged',()=>{
  const source=xhtml('<p id="part-1">Bahá’u’lláh · 道德經 · العربية · 😀 𝄞\tverse\nnext\rline &amp; &#9; &#10; &#13; &#x20; &#x1F600; &#x10FFFF;</p><a href="#part-1">Return</a><p>Copyright and licence</p><pre><![CDATA[&#12;]]></pre><!-- &#xC; --><?example &#12; ?>');
  assert.equal(sanitizeEpubXml(source),source);
});

test('XHTML recovery keeps HTML entities, bare ampersands, text and internal links readable',()=>{
  const source=xhtml('<h1>Breath & Coherence</h1><p id="breath">Category 02 &middot; Foundational&nbsp;practice</p><a href="#breath">Return</a>');
  const parser=new DOMParser();
  assert.throws(()=>assertReadableEpubDocument(parser.parseFromString(source,'application/xhtml+xml')));
  const repaired=normalizeEpubXhtml(source);
  const document=parser.parseFromString(repaired,'application/xhtml+xml');
  assert.doesNotThrow(()=>assertReadableEpubDocument(document));
  assert.equal(document.querySelector('h1').textContent,'Breath & Coherence');
  assert.equal(document.getElementById('breath').textContent,'Category 02 · Foundational\u00a0practice');
  assert.equal(document.querySelector('a').getAttribute('href'),'#breath');
});

test('Crossed emphasis tags recover without discarding text after the XML error',()=>{
  const source=xhtml('<p>Before <strong><em>Collapse</strong></em> after.</p><p id="later">Later passage</p>');
  const document=new DOMParser().parseFromString(normalizeEpubXhtml(source),'application/xhtml+xml');
  assert.doesNotThrow(()=>assertReadableEpubDocument(document));
  assert.equal(document.querySelector('body').textContent,'Before Collapse after.Later passage');
  assert.equal(document.getElementById('later').textContent,'Later passage');
});

test('Recovery retains EPUB namespaces and attributes, while valid XHTML stays byte-for-byte unchanged',()=>{
  const source=xhtml('<section epub:type="chapter" id="one"><h1>One & Two</h1></section>').replace('<html xmlns=', '<html xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xmlns=');
  const repaired=normalizeEpubXhtml(source);
  const document=new DOMParser().parseFromString(repaired,'application/xhtml+xml');
  assert.doesNotThrow(()=>assertReadableEpubDocument(document));
  assert.equal(document.documentElement.getAttribute('lang'),'en');
  assert.equal(document.querySelector('section').getAttributeNS('http://www.idpf.org/2007/ops','type'),'chapter');
  assert.equal(normalizeEpubXhtml(repaired),repaired);
  const valid=xhtml('<p>Bahá’u’lláh · 道德經 · 😀 &amp; &#x1F600;</p>');
  assert.equal(normalizeEpubXhtml(valid),valid);
});

test('Reader preparation repairs XML before parsing while retaining archive resources and original bytes',async()=>{
  const source=xhtml('<p id="part-1">before\fafter</p>');
  const bytes=await epub(source),original=new Uint8Array(bytes).slice();
  const prepared=await prepareEpubForReader(bytes);
  const zip=await JSZip.loadAsync(prepared,{checkCRC32:true});
  assert.deepEqual(Object.keys(zip.files),Object.keys((await JSZip.loadAsync(bytes)).files));
  assert.equal(await zip.file('EPUB/chapter.xhtml').async('string'),sanitizeEpubXml(source));
  assert.equal(await zip.file('mimetype').async('string'),'application/epub+zip');
  assert.equal(await zip.file('EPUB/styles.css').async('string'),'p { color: black; }');
  assert.deepEqual(await zip.file('EPUB/image.png').async('uint8array'),new Uint8Array([0,12,255,1]));
  assert.deepEqual(new Uint8Array(bytes),original);
  const document=new DOMParser().parseFromString(await zip.file('EPUB/chapter.xhtml').async('string'),'application/xhtml+xml');
  assert.doesNotThrow(()=>assertReadableEpubDocument(document));
  assert.equal(document.getElementsByTagName('p')[0].textContent,'before\nafter');
  assert.equal(document.getElementsByTagName('p')[0].getAttribute('id'),'part-1');
});

test('Container, package, navigation, uppercase extensions and SVG get the same repair',async()=>{
  const zip=await JSZip.loadAsync(await epub(xhtml('<p>Valid</p>')));
  const paths=['META-INF/container.xml','EPUB/content.opf','EPUB/toc.ncx','EPUB/nav.XHTML','EPUB/image.svg'];
  for(const path of paths)zip.file(path,'<root>before&#xC;after</root>');
  const prepared=await JSZip.loadAsync(await prepareEpubForReader(await zip.generateAsync({type:'arraybuffer'})));
  for(const path of paths)assert.equal(await prepared.file(path).async('string'),'<root>before\nafter</root>');
});

test('Valid archives are returned untouched and invalid archives reject',async()=>{
  const bytes=await epub(xhtml('<p>Valid</p>'));
  assert.equal(await prepareEpubForReader(bytes),bytes);
  await assert.rejects(prepareEpubForReader(new Uint8Array([1,2,3]).buffer));
});

test('EPUB.js renders the complete repaired chapter through its real archive and spine pipeline',async()=>{
  const zip=await JSZip.loadAsync(await epub(xhtml('<h1>Breath & Coherence</h1><p>Before\fAfter &middot; practice</p><p><strong><em>Crossed</strong></em> tags</p><p id="last">Full later passage</p>')));
  zip.file('META-INF/container.xml','<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  zip.file('EPUB/content.opf','<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">staging-test-xml</dc:identifier><dc:title>STAGING TEST XML</dc:title><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest><spine><itemref idref="chapter"/></spine></package>');
  zip.file('EPUB/nav.xhtml',xhtml('<nav epub:type="toc"><ol><li><a href="chapter.xhtml">Chapter</a></li></ol></nav>').replace('<html xmlns=','<html xmlns:epub="http://www.idpf.org/2007/ops" xmlns='));
  const publication=ePub(await prepareEpubForReader(await zip.generateAsync({type:'arraybuffer'})),{replacements:'none'});
  try{
    await publication.ready;
    publication.spine.hooks.content.register(assertReadableEpubDocument);
    const section=publication.spine.get(0);
    const markup=await section.render(publication.load.bind(publication));
    assert.equal(section.document.querySelector('h1').textContent,'Breath & Coherence');
    assert.equal(section.document.getElementById('last').textContent,'Full later passage');
    assert.ok(markup.includes('After · practice'));
    assert.ok(markup.includes('Full later passage'));
    assert.doesNotMatch(markup,/<parsererror/);
    assert.equal(publication.navigation.toc[0].href,'chapter.xhtml');
  }finally{publication.destroy();}
});

test('Remaining native XML parser errors are surfaced instead of displayed as book content',()=>{
  for(const xml of ['<parsererror xmlns="http://www.mozilla.org/newlayout/xml/parsererror.xml">Invalid XML</parsererror>',xhtml('<parsererror>Invalid XML</parsererror>')]){
    const document=new DOMParser().parseFromString(xml,'application/xhtml+xml');
    assert.throws(()=>assertReadableEpubDocument(document),/malformed XML/);
  }
});
