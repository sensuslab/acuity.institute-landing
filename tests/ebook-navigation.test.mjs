import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {build} from 'esbuild';
const code=await build({entryPoints:['src/components/ebookNavigation.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {settleEbookNavigation}=await import('data:text/javascript;base64,'+Buffer.from(code.outputFiles[0].text).toString('base64'));
test('EPUB controls remain locked after display resolves until the location event arrives',async()=>{
 const events=new EventEmitter();let done=false;
 const wait=settleEbookNavigation(events,async()=>{}).then(()=>{done=true;});
 await new Promise(resolve=>setImmediate(resolve));assert.equal(done,false);
 assert.equal(events.listenerCount('relocated'),1);
 events.emit('relocated');await wait;assert.equal(done,true);assert.equal(events.listenerCount('relocated'),0);
});
test('EPUB location wait cleans up on errors and missing location notifications',async()=>{
 const events=new EventEmitter();
 await assert.rejects(settleEbookNavigation(events,async()=>{throw new Error('broken chapter');}),/broken chapter/);
 assert.equal(events.listenerCount('relocated'),0);
 await settleEbookNavigation(events,async()=>{},5);assert.equal(events.listenerCount('relocated'),0);
});
