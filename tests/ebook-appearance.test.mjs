import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result=await build({entryPoints:['src/components/ebookAppearance.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {ebookPageTones,ebookReadingTheme,parseEbookPageTone}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
test('Page colour can be restored independently of a saved reading position',()=>{
 for(const tone of Object.keys(ebookPageTones))assert.equal(parseEbookPageTone(JSON.stringify({pageTone:tone})),tone);
 for(const value of [null,'{bad','{"pageTone":"toString"}','{"pageTone":"dark"}','{"fontSize":20}','null'])assert.equal(parseEbookPageTone(value),'white');
});
test('All page colours keep dark text, serif typography and high contrast',()=>{
 const luminance=hex=>{const channels=hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};
 for(const [tone,{background}] of Object.entries(ebookPageTones)){
  const theme=ebookReadingTheme(tone);
  assert.equal(theme['html, body'].background,background+' !important');
  assert.equal(theme['html, body'].color,'#111111 !important');
  assert.match(theme.body['font-family'],/Times New Roman/);
  assert.ok((luminance(background)+0.05)/(luminance('#111111')+0.05)>12);
 }
});
