import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

test('PDF viewport ignores content-height changes and coalesces real width changes',async()=>{
  const result=await build({entryPoints:['src/components/readerViewport.ts'],bundle:true,write:false,format:'esm',platform:'node'});
  const {observeReaderViewport}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
  const saved={ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
  let notify;let disconnected=false;let frameId=0;const frames=new Map();
  globalThis.ResizeObserver=class {constructor(callback){notify=callback;}observe(element){assert.equal(element,viewport);}disconnect(){disconnected=true;}};
  globalThis.requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  const flush=()=>{const pending=[...frames.values()];frames.clear();for(const f of pending)f();};
  const viewport={clientWidth:1000};const widths=[];
  try {
    const dispose=observeReaderViewport(viewport,w=>widths.push(w));
    assert.deepEqual(widths,[1000]);
    // Canvas insertions, text-view changes and PDF page heights all notify RO;
    // unchanged viewport width must not start a fresh render.
    for(let i=0;i<30;i++){notify();flush();}
    assert.deepEqual(widths,[1000]);
    viewport.clientWidth=1000.1;notify();flush();assert.deepEqual(widths,[1000]);
    viewport.clientWidth=800;notify();viewport.clientWidth=640;notify();notify();
    assert.equal(frames.size,1);flush();assert.deepEqual(widths,[1000,640]);
    viewport.clientWidth=0;notify();flush();assert.deepEqual(widths,[1000,640]);
    viewport.clientWidth=700;notify();dispose();flush();
    assert.ok(disconnected);assert.equal(frames.size,0);assert.deepEqual(widths,[1000,640]);
  } finally {Object.assign(globalThis,saved);}
});
