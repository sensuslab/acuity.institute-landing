import { useCallback, useEffect, useRef, useState } from 'react';
import ePub, {type Book, type Contents, type Location, type NavItem, type Rendition} from 'epubjs';
import { ArrowDownToLine, ChevronLeft, ChevronRight, Maximize, Minimize, X } from 'lucide-react';
import { canReadEbook, type LibraryBook } from '../data/library';
import { useReaderDialog } from './useReaderDialog';
import { ebookPreferenceKey, parseEbookPreferences } from './ebookPreferences';

type Chapter={label:string;href:string;depth:number};
function flatten(items:NavItem[],depth=0):Chapter[]{
  return items.flatMap(item=>[{label:item.label.trim(),href:item.href,depth},...flatten(item.subitems||[],depth+1)]);
}
function stored(key:string){try{return parseEbookPreferences(localStorage.getItem(key));}catch{return;}}

export default function EbookReader({book,onClose,onReadPdf}:{book:LibraryBook;onClose:()=>void;onReadPdf:()=>void}){
  const {dialog,fullscreen,fullscreenError,toggleFullscreen,cancel}=useReaderDialog(onClose);
  const stage=useRef<HTMLDivElement>(null);
  const engine=useRef<Rendition>();
  const epubBook=useRef<Book>();
  const version=book.assets.find(asset=>asset.format==='epub')?.sha256.slice(0,12)||'original';
  const storageKey=ebookPreferenceKey(book.id,version);
  const [saved]=useState(()=>stored(storageKey));
  const [fontSize,setFontSize]=useState(saved?.fontSize||20);
  const fontRef=useRef(fontSize);fontRef.current=fontSize;
  const [remember,setRemember]=useState(!!saved);
  const rememberRef=useRef(remember);rememberRef.current=remember;
  const locationRef=useRef<string|undefined>(saved?.cfi);
  const [chapters,setChapters]=useState<Chapter[]>([]);
  const [activeChapter,setActiveChapter]=useState('');
  const [position,setPosition]=useState('Opening book…');
  const [atStart,setAtStart]=useState(true);
  const [atEnd,setAtEnd]=useState(false);
  const [busy,setBusy]=useState(true);
  const busyRef=useRef(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  const turnRef=useRef<(direction:'next'|'prev')=>void>(()=>{});
  const persist=useCallback(()=>{
    if(!rememberRef.current)return;
    try{localStorage.setItem(storageKey,JSON.stringify({fontSize:fontRef.current,cfi:locationRef.current}));}catch{/* Reading works with storage disabled. */}
  },[storageKey]);
  const navigate=useCallback(async(target:'next'|'prev'|{href:string})=>{
    const rendition=engine.current;if(!rendition||busyRef.current)return;
    busyRef.current=true;setBusy(true);setError('');
    try{
      if(typeof target==='object')await rendition.display(target.href);
      else if(target==='next')await rendition.next();else await rendition.prev();
    }catch{setError('That page could not be opened. Try another chapter or use the PDF edition.');}
    finally{busyRef.current=false;setBusy(false);}
  },[]);
  turnRef.current=direction=>{void navigate(direction);};
  useEffect(()=>{
    if(!canReadEbook(book)||!book.epub){setError('This record has no paired PDF and EPUB edition.');setBusy(false);return;}
    const element=stage.current;if(!element)return;
    let cancelled=false;let rendition:Rendition|undefined;let publication:Book|undefined;
    let resize:ResizeObserver|undefined;let resizeFrame:number|undefined;
    const controller=new AbortController();
    busyRef.current=true;setBusy(true);setError('');
    const keyDown=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(target?.closest('input,select,textarea,[contenteditable=true]'))return;
      if(event.altKey||event.ctrlKey||event.metaKey)return;
      const forward=book.direction==='rtl'?'ArrowLeft':'ArrowRight';
      const back=book.direction==='rtl'?'ArrowRight':'ArrowLeft';
      if(event.key===forward||event.key==='PageDown'){event.preventDefault();turnRef.current('next');}
      else if(event.key===back||event.key==='PageUp'){event.preventDefault();turnRef.current('prev');}
      else if(event.key==='Escape'){
        event.preventDefault();
        if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else onClose();
      }
    };
    const open=async()=>{
      try{
        const response=await fetch(book.epub!,{signal:controller.signal});if(!response.ok)throw new Error('EPUB unavailable');
        const bytes=await response.arrayBuffer();if(cancelled)return;
        publication=ePub(bytes,{replacements:'blobUrl'});epubBook.current=publication;
        await publication.ready;if(cancelled)return;
        rendition=publication.renderTo(element,{width:element.clientWidth,height:element.clientHeight,flow:'paginated',spread:'none',allowScriptedContent:false});
        engine.current=rendition;
        if(book.direction)rendition.direction(book.direction);
        rendition.themes.default({
          'html, body':{'background':'#ffffff !important','color':'#111111 !important'},
          'body':{'font-family':'"Times New Roman", Times, "Liberation Serif", serif !important','line-height':'1.65 !important','padding':'0 28px !important'},
          'p, li, div, blockquote, span, td':{'color':'#111111 !important','font-family':'"Times New Roman", Times, "Liberation Serif", serif !important','background':'transparent !important'},
          'p, li, blockquote':{'font-size':'1em !important'},
          'h1, h2, h3, h4, h5, h6':{'font-family':'"Times New Roman", Times, serif !important','color':'#111111 !important'},
          'img, svg':{'max-width':'100% !important','object-fit':'contain'},
          'a':{'color':'#274e75 !important'}
        });
        rendition.themes.override('font-size',`${fontRef.current}px`,true);
        rendition.hooks.content.register((contents:Contents)=>{
          // Publications run in EPUB.js's non-scripted sandbox. Keep the document
          // view free of executable/embedded content and provide an accessible title.
          const doc=contents.document;
          doc.querySelectorAll('script,iframe,object,embed,form').forEach(node=>node.remove());
          doc.querySelectorAll('*').forEach(node=>{
            for(const attr of Array.from(node.attributes))if(/^on/i.test(attr.name))node.removeAttribute(attr.name);
          });
          doc.documentElement.lang=doc.documentElement.lang||'en';
          if(!doc.title)doc.title=book.title;
          doc.addEventListener('keydown',keyDown);
        });
        const toc=flatten(publication.navigation.toc);setChapters(toc);
        rendition.on('relocated',(location:Location)=>{
          if(cancelled)return;
          locationRef.current=location.start.cfi;setAtStart(location.atStart);setAtEnd(location.atEnd);
          const current=location.start.href.split('#')[0];
          const chapter=toc.find(item=>item.href.split('#')[0]===current||item.href.split('#')[0].endsWith('/'+current));
          setActiveChapter(chapter?.href||'');
          setPosition(`${chapter?.label||'Reading'} · page ${location.start.displayed.page} of ${location.start.displayed.total} in section`);
          persist();
        });
        try {await rendition.display(locationRef.current);}
        catch {if(!locationRef.current)throw new Error('Cannot display EPUB');locationRef.current=undefined;await rendition.display();}
        if(cancelled)return;
        let previousWidth=element.clientWidth,previousHeight=element.clientHeight;
        resize=new ResizeObserver(()=>{
          if(resizeFrame!==undefined)return;
          resizeFrame=requestAnimationFrame(()=>{
            resizeFrame=undefined;if(cancelled||!rendition)return;
            const width=element.clientWidth,height=element.clientHeight;
            if(width>0&&height>0&&(width!==previousWidth||height!==previousHeight)){
              previousWidth=width;previousHeight=height;rendition.resize(width,height);
            }
          });
        });resize.observe(element);
        busyRef.current=false;setBusy(false);
      }catch(reason){
        if(!cancelled&&!(reason instanceof Error&&reason.name==='AbortError')){setError('This EPUB could not be opened. You can retry, download it or read the PDF edition.');busyRef.current=false;setBusy(false);}
      }
    };
    void open();
    return()=>{
      cancelled=true;controller.abort();resize?.disconnect();if(resizeFrame!==undefined)cancelAnimationFrame(resizeFrame);
      engine.current=undefined;epubBook.current=undefined;
      publication?.destroy();
      element.replaceChildren();
    };
  },[book, retry, onClose, persist]);
  useEffect(()=>{
    const rendition=engine.current;if(!rendition)return;
    const anchor=locationRef.current;
    rendition.themes.override('font-size',`${fontSize}px`,true);persist();
    const frame=requestAnimationFrame(()=>{if(anchor)void rendition.display(anchor).catch(()=>{});});
    return()=>cancelAnimationFrame(frame);
  },[fontSize,persist]);
  const rememberChange=(enabled:boolean)=>{
    rememberRef.current=enabled;setRemember(enabled);
    if(enabled)persist();else try{localStorage.removeItem(storageKey);}catch{/* Optional storage. */}
  };
  const keyboard=(event:React.KeyboardEvent)=>{
    if(event.target instanceof HTMLElement&&event.target.closest('input,select,textarea,[contenteditable=true]'))return;
    if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();turnRef.current(book.direction==='rtl'?'prev':'next');}
    else if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();turnRef.current(book.direction==='rtl'?'next':'prev');}
  };
  return <dialog ref={dialog} className="library-reader ebook-reader" aria-labelledby="ebook-title" onCancel={cancel} onKeyDown={keyboard}>
    <header className="reader-heading"><div><span className="library-eyebrow">ACUITY / E-BOOK</span><h2 id="ebook-title">{book.title}</h2></div><div className="reader-actions"><a href={book.epub} download aria-label="Download EPUB"><ArrowDownToLine size={19}/></a><button onClick={()=>void toggleFullscreen()} aria-label={fullscreen?'Exit fullscreen':'Enter fullscreen'}>{fullscreen?<Minimize size={20}/>:<Maximize size={20}/>}</button><button autoFocus aria-label="Close ebook reader" onClick={onClose}><X size={23}/></button></div></header>
    <div className="ebook-toolbar"><label className="ebook-chapters"><span className="sr-only">Contents</span><select aria-label="Contents" value={activeChapter} disabled={busy||!chapters.length} onChange={event=>void navigate({href:event.target.value})}><option value="" disabled>Contents</option>{chapters.map((chapter,index)=><option key={`${chapter.href}-${index}`} value={chapter.href}>{'— '.repeat(chapter.depth)}{chapter.label}</option>)}</select></label><div className="ebook-font"><button aria-label="Decrease font size" disabled={fontSize<=16} onClick={()=>setFontSize(size=>Math.max(16,size-2))}>A−</button><label><span className="sr-only">Text size</span><input aria-label="Text size" type="range" min={16} max={32} step={2} value={fontSize} onChange={event=>setFontSize(Number(event.target.value))}/></label><button aria-label="Increase font size" disabled={fontSize>=32} onClick={()=>setFontSize(size=>Math.min(32,size+2))}>A+</button><span>{fontSize}px</span></div><label className="ebook-remember"><input type="checkbox" checked={remember} onChange={event=>rememberChange(event.target.checked)}/> Remember my place on this device</label></div>
    <div className="reader-status" role="status">{fullscreenError|| (busy?'Preparing your page…':position)}</div>
    {error&&<div className="ebook-error" role="alert"><p>{error}</p><button onClick={()=>setRetry(value=>value+1)}>Retry EPUB</button><button onClick={onReadPdf}>Read PDF instead</button><a href={book.epub} download>Download EPUB</a></div>}
    <div className="ebook-paper" aria-busy={busy}><button className="ebook-edge edge-left" aria-label="Previous ebook page" disabled={busy||atStart} onClick={()=>void navigate('prev')}><ChevronLeft/></button><div ref={stage} className="ebook-stage"/><button className="ebook-edge edge-right" aria-label="Next ebook page" disabled={busy||atEnd} onClick={()=>void navigate('next')}><ChevronRight/></button></div>
    <footer className="reader-footer ebook-footer"><button disabled={busy||atStart} onClick={()=>void navigate('prev')}><ChevronLeft size={16}/> Previous</button><span>{book.author} · {remember?'Position saved on this device':'Session reading'}</span><button disabled={busy||atEnd} onClick={()=>void navigate('next')}>Next <ChevronRight size={16}/></button></footer>
  </dialog>;
}
