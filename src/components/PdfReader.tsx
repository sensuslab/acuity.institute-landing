import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ChevronLeft, ChevronRight, Maximize, Minimize, Presentation, X } from 'lucide-react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { LibraryBook } from '../data/library';
import { observeReaderViewport } from './readerViewport';
import { useReaderDialog } from './useReaderDialog';
GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfReader({ book, onClose, initialPresentation = false }: { book: LibraryBook; onClose: () => void; initialPresentation?: boolean }) {
  const {dialog,fullscreen,fullscreenError,toggleFullscreen,cancel} = useReaderDialog(onClose);
  const surface = useRef<HTMLDivElement>(null);
  const scrollViewport = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(1);
  const [presentation, setPresentation] = useState(initialPresentation);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [text, setText] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  useEffect(() => {setPageInput(String(page));},[page]);
  useEffect(() => {
    const el = scrollViewport.current; if (!el) return;
    const stopWidth = observeReaderViewport(el,setWidth);
    // In presentation mode height is part of the fit calculation. Observe the
    // fixed viewport rather than the page surface so painting cannot resize it.
    let frame: number | undefined;
    const measure = () => {frame=undefined;setHeight(Math.round(el.clientHeight));};
    const observer = new ResizeObserver(()=>{if(frame === undefined) frame=requestAnimationFrame(measure);});
    observer.observe(el);measure();
    return () => {stopWidth();observer.disconnect();if(frame !== undefined)cancelAnimationFrame(frame);};
  },[]);
  useEffect(() => {
    if (!book.pdf) {setError('A PDF edition is not available for this record.');setBusy(false);return;}
    let cancelled = false;
    const task = getDocument({url:book.pdf,standardFontDataUrl:'/pdfjs/standard_fonts/',cMapUrl:'/pdfjs/cmaps/',cMapPacked:true,wasmUrl:'/pdfjs/wasm/'});
    task.promise.then(document => {if(!cancelled)setPdf(document);}).catch(()=>{
      if(!cancelled){setError('This PDF could not be loaded. You can download it or open the source below.');setBusy(false);}
    });
    return () => {cancelled=true;void task.destroy();};
  },[book.pdf]);
  useEffect(() => {
    if(!pdf || !surface.current)return;
    let cancelled=false;let task: RenderTask | undefined;
    const container=surface.current;
    setBusy(true);setError('');
    const render=async()=>{
      try {
        const pdfPage=await pdf.getPage(page);if(cancelled)return;
        const base=pdfPage.getViewport({scale:1});
        const scale=presentation
          ? Math.min(Math.max(1,width-32)/base.width,Math.max(1,height-32)/base.height)
          : Math.min(Math.max(width-32,240),860)/base.width*zoom;
        const viewport=pdfPage.getViewport({scale});
        // A bounded offscreen canvas keeps graphic-heavy pages within a memory
        // budget and preserves the visible page until the new render completes.
        const ratio=Math.min(window.devicePixelRatio || 1,2,4096/Math.max(viewport.width,viewport.height),Math.sqrt(16000000/(viewport.width*viewport.height)));
        const canvas=document.createElement('canvas');
        canvas.width=Math.ceil(viewport.width*ratio);canvas.height=Math.ceil(viewport.height*ratio);
        canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;
        canvas.setAttribute('aria-hidden','true');
        if(presentation)canvas.className='presentation-page';
        task=pdfPage.render({canvas,viewport,transform:[ratio,0,0,ratio,0,0]});await task.promise;
        if(cancelled)return;
        container.replaceChildren(canvas);setBusy(false);
        if(presentation){setText('');return;}
        // A damaged/missing text layer must never prevent image-only PDFs from displaying.
        try {
          const content=await pdfPage.getTextContent();if(cancelled)return;
          setText(content.items.map(item=>'str' in item ? item.str+(item.hasEOL?'\n':' ') : '').join(''));
        } catch {if(!cancelled)setText('');}
      } catch(reason) {
        if(!cancelled && !(reason instanceof Error && reason.name==='RenderingCancelledException')){
          setError('This page could not be displayed. Try another page or download the PDF.');setBusy(false);
        }
      }
    };
    void render();return()=>{cancelled=true;task?.cancel();};
  },[pdf,page,zoom,width,height,presentation]);
  const go=(value:number)=>{if(pdf){const target=Math.max(1,Math.min(pdf.numPages,Math.trunc(value)||1));setPage(target);setPageInput(String(target));}};
  const turnKey=(event:React.KeyboardEvent)=>{
    if(!presentation || (event.target instanceof HTMLElement && event.target.closest('input,select,textarea,[contenteditable=true]')))return;
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key===' '&&event.target instanceof HTMLElement&&event.target.closest('button,a'))return;
    const target=event.key==='ArrowRight'||event.key==='PageDown'||event.key===' ' ? page+1 : event.key==='ArrowLeft'||event.key==='PageUp' ? page-1 : event.key==='Home'?1:event.key==='End'?pdf?.numPages:undefined;
    if(target !== undefined){event.preventDefault();go(target);}
  };
  return <dialog ref={dialog} className={`library-reader ${presentation?'reader-presenting':''}`} aria-labelledby="reader-title" onCancel={cancel} onKeyDown={turnKey}><div className="reader-application">
    <header className="reader-heading"><div><span className="library-eyebrow">ACUITY / {presentation?'PRESENTATION':'READING ROOM'}</span><h2 id="reader-title">{book.title}</h2></div><div className="reader-actions"><a href={book.pdf} download aria-label="Download PDF"><ArrowDownToLine size={20}/></a><button onClick={()=>void toggleFullscreen()} aria-label={fullscreen?'Exit fullscreen':'Enter fullscreen'}>{fullscreen?<Minimize size={20}/>:<Maximize size={20}/>}</button><button autoFocus onClick={onClose} aria-label="Close PDF reader"><X size={23}/></button></div></header>
    <div className="reader-toolbar"><div className="reader-pagination"><button disabled={!pdf||page===1} aria-label="Previous page" onClick={()=>go(page-1)}><ChevronLeft size={19}/></button><label>Page <input type="number" aria-label="Page number" min={1} max={pdf?.numPages||1} value={pageInput} onChange={event=>setPageInput(event.target.value)} onBlur={()=>go(Number(pageInput))} onKeyDown={event=>{if(event.key==='Enter'){go(Number(pageInput));event.currentTarget.blur();}}}/></label><span>of {pdf?.numPages||'…'}</span><button disabled={!pdf||page===pdf.numPages} aria-label="Next page" onClick={()=>go(page+1)}><ChevronRight size={19}/></button></div>
      <div className="reader-options">{!presentation&&<><label><span className="sr-only">Zoom</span><select value={zoom} onChange={event=>setZoom(Number(event.target.value))}><option value={1}>Fit width</option><option value={1.25}>125%</option><option value={1.5}>150%</option><option value={2}>200%</option></select></label><button aria-pressed={textMode} onClick={()=>setTextMode(!textMode)}>{textMode?'Page view':'Text view'}</button></>}<button aria-pressed={presentation} onClick={()=>{setPresentation(!presentation);setTextMode(false);}}><Presentation size={16}/>{presentation?'Reading view':'Present'}</button></div></div>
    <div className="reader-status" role="status">{fullscreenError || (busy?`Loading page ${page}…`:`Page ${page} of ${pdf?.numPages||'…'}`)}</div>
    {error&&<div className="reader-error" role="alert">{error} {book.pdf&&<a href={book.pdf}>Open PDF directly</a>}{book.sourceUrl&&<> · <a href={book.sourceUrl} target="_blank" rel="noreferrer">Original source</a></>}</div>}
    <div ref={scrollViewport} className="reader-scroll"><div ref={surface} className={`reader-surface ${textMode?'reader-canvas-hidden':''}`}/>{!presentation&&<div className={textMode?'reader-text':'sr-only'} aria-label={`Text of page ${page}`} aria-busy={busy}>{busy?'':text || (textMode?'This page has no selectable text. Use Page view to see the original.':'')}</div>}
      {presentation&&<><button className="presentation-edge edge-left" aria-label="Previous slide" disabled={!pdf||page===1} onClick={()=>go(page-1)}><ChevronLeft/></button><button className="presentation-edge edge-right" aria-label="Next slide" disabled={!pdf||page===pdf.numPages} onClick={()=>go(page+1)}><ChevronRight/></button></>}
    </div>
    <footer className="reader-footer"><span>{book.author} · {presentation?'Use arrow keys or the screen edges':'Original PDF edition'}</span>{book.epub&&<a href={book.epub} download>Download EPUB</a>}{book.text&&<a href={book.text}>Full plain text</a>}</footer>
  </div></dialog>;
}
