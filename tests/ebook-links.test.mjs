import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['src/components/ebookLinks.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {resolveEbookLink,bindEbookLinks}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const sections=['Text/chapter-1.xhtml','Text/chapter 2.xhtml','Notes/footnotes.xhtml'];
const resolve=href=>resolveEbookLink(href,sections[0],sections,'/OEBPS/');
test('Chapter, footnote and return links resolve from the current EPUB section',()=>{
 assert.deepEqual(resolve('#passage'),{kind:'internal',href:sections[0]+'#passage'});
 assert.deepEqual(resolve('../Notes/footnotes.xhtml#note-1'),{kind:'internal',href:sections[2]+'#note-1'});
 assert.deepEqual(resolve('chapter%202.xhtml#part%202'),{kind:'internal',href:sections[1]+'#part%202'});
 assert.deepEqual(resolveEbookLink('../Text/chapter-1.xhtml#ref-1',sections[2],sections,'/OEBPS'),{kind:'internal',href:sections[0]+'#ref-1'});
 assert.deepEqual(resolve('/OEBPS/Text/chapter-1.xhtml#part'),{kind:'internal',href:sections[0]+'#part'});
 assert.deepEqual(resolve('Notes/footnotes.xhtml#note'),{kind:'internal',href:sections[2]+'#note'});
});
test('Synthetic absolute EPUB paths stay internal while website links stay external',()=>{
 assert.deepEqual(resolveEbookLink('https://reader.test/OEBPS/Text/chapter-1.xhtml#part',sections[0],sections,'/OEBPS/','https://reader.test/OEBPS/Text/chapter-1.xhtml'),{kind:'internal',href:sections[0]+'#part'});
 assert.deepEqual(resolve('https://source.test/Text/chapter-1.xhtml'),{kind:'external',href:'https://source.test/Text/chapter-1.xhtml'});
 assert.deepEqual(resolve('//source.test/about'),{kind:'external',href:'https://source.test/about'});
 assert.deepEqual(resolve('mailto:editor@example.test'),{kind:'external',href:'mailto:editor@example.test'});
});
test('Missing archive targets and executable URLs cannot navigate the reader iframe',()=>{
 for(const href of ['missing.xhtml#part','javascript:alert(1)','data:text/html,unsafe','file:///tmp/book','blob:https://reader.test/id','%ZZ.xhtml',''])assert.deepEqual(resolve(href),{kind:'invalid'},href);
});
test('Delegated link clicks route once through application navigation and clean up',()=>{
 const doc=new EventTarget();doc.baseURI='https://reader.test/OEBPS/Text/chapter-1.xhtml';
 let href='../Notes/footnotes.xhtml#n';const calls=[];
 const remove=bindEbookLinks(doc,{currentHref:sections[0],sectionHrefs:sections,packageDirectory:'/OEBPS/',navigate:target=>calls.push(['internal',target]),external:target=>calls.push(['external',target]),invalid:()=>calls.push(['invalid'])});
 const click=()=>{const event=new Event('click',{cancelable:true});Object.defineProperty(event,'target',{value:{closest:()=>({getAttribute:()=>href})}});doc.dispatchEvent(event);return event;};
 assert.equal(click().defaultPrevented,true);assert.deepEqual(calls,[['internal',sections[2]+'#n']]);
 href='https://source.test/';click();assert.deepEqual(calls.at(-1),['external',href]);
 href='javascript:bad';click();assert.deepEqual(calls.at(-1),['invalid']);
 remove();assert.equal(click().defaultPrevented,false);assert.equal(calls.length,3);
});
