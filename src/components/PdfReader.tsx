import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { LibraryBook } from '../data/library';
GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfReader({ book, onClose }: { book: LibraryBook; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy>();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [text, setText] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    const current = dialog.current; current?.showModal();
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    return () => { current?.close(); window.document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    const el = surface.current; if (!el) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(el); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!book.pdf) return;
    let cancelled = false;
    const task = getDocument({ url: book.pdf, standardFontDataUrl: '/pdfjs/standard_fonts/', cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, wasmUrl: '/pdfjs/wasm/' });
    task.promise.then(pdf => { if (!cancelled) setDocument(pdf); }).catch(() => {
      if (!cancelled) { setError('This PDF could not be loaded. You can download it or open the source below.'); setBusy(false); }
    });
    return () => { cancelled = true; void task.destroy(); };
  }, [book.pdf]);
  useEffect(() => {
    if (!document || !surface.current) return;
    let cancelled = false; let task: RenderTask | undefined;
    const container = surface.current;
    setBusy(true); setError(''); setText(''); container.replaceChildren();
    const render = async () => {
      try {
        const pdfPage = await document.getPage(page);
        if (cancelled) return;
        const base = pdfPage.getViewport({scale:1});
        const scale = Math.min(Math.max(width - 32, 240), 860) / base.width * zoom;
        const viewport = pdfPage.getViewport({scale});
        // Each render owns a canvas, so quick page/zoom changes cannot share an active render.
        const canvas = window.document.createElement('canvas');
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * ratio); canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
        canvas.setAttribute('aria-hidden', 'true');
        task = pdfPage.render({canvas, viewport, transform:[ratio,0,0,ratio,0,0]});
        await task.promise;
        const content = await pdfPage.getTextContent();
        if (cancelled) return;
        setText(content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join(''));
        container.replaceChildren(canvas); setBusy(false);
      } catch (reason) {
        if (!cancelled && !(reason instanceof Error && reason.name === 'RenderingCancelledException')) {
          setError('This page could not be displayed. Try another page or download the PDF.'); setBusy(false);
        }
      }
    };
    void render();
    return () => { cancelled = true; task?.cancel(); };
  }, [document, page, zoom, width]);
  const go = (value: number) => { if (document) setPage(Math.max(1, Math.min(document.numPages, Math.trunc(value) || 1))); };
  return <dialog ref={dialog} className="library-reader" aria-labelledby="reader-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="reader-heading"><div><span className="library-eyebrow">ACUITY / READING ROOM</span><h2 id="reader-title">{book.title}</h2></div><div className="reader-actions"><a href={book.pdf} download aria-label="Download PDF"><ArrowDownToLine size={20} /></a><button autoFocus onClick={onClose} aria-label="Close PDF reader"><X size={23} /></button></div></header>
    <div className="reader-toolbar">
      <div className="reader-pagination"><button disabled={!document || page === 1} aria-label="Previous page" onClick={() => go(page - 1)}><ChevronLeft size={19} /></button><label>Page <input type="number" aria-label="Page number" min={1} max={document?.numPages || 1} value={page} onChange={event => go(Number(event.target.value))} /></label><span>of {document?.numPages || '…'}</span><button disabled={!document || page === document.numPages} aria-label="Next page" onClick={() => go(page + 1)}><ChevronRight size={19} /></button></div>
      <div className="reader-options"><label><span className="sr-only">Zoom</span><select value={zoom} onChange={event => setZoom(Number(event.target.value))}><option value={1}>Fit width</option><option value={1.25}>125%</option><option value={1.5}>150%</option><option value={2}>200%</option></select></label><button aria-pressed={textMode} onClick={() => setTextMode(!textMode)}>{textMode ? 'Page view' : 'Text view'}</button></div>
    </div>
    <div className="reader-status" role="status">{busy ? `Loading page ${page}…` : `Page ${page} of ${document?.numPages || '…'}`}</div>
    {error && <div className="reader-error" role="alert">{error} <a href={book.pdf}>Open PDF directly</a> · <a href={book.sourceUrl} target="_blank" rel="noreferrer">Original source</a></div>}
    <div className="reader-scroll"><div ref={surface} className={`reader-surface ${textMode ? 'reader-canvas-hidden' : ''}`} /><div className={textMode ? 'reader-text' : 'sr-only'} aria-label={`Text of page ${page}`} aria-busy={busy}>{text}</div></div>
    <footer className="reader-footer"><span>{book.author} · Acuity reading edition</span>{book.epub && <a href={book.epub} download>Download EPUB</a>}{book.text && <a href={book.text}>Full plain text</a>}</footer>
  </dialog>;
}
