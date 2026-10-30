import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, Hexagon, Search, X } from 'lucide-react';
import { books as bundledBooks, categories as bundledCategories, canReadEbook, filterBooks, type LibraryBook, type LibraryOverview } from '../data/library';
import './library.css';
import {fetchPublicLibrary} from '../data/publicLibrary';
import BookActions, {type ReaderMode} from './BookActions';
import LibraryOverviews from './LibraryOverviews';
const PdfReader = lazy(() => import('./PdfReader'));
const EbookReader = lazy(() => import('./EbookReader'));

function selectedFromUrl(books:LibraryBook[]=bundledBooks) {
  return books.find(book => book.id === new URLSearchParams(window.location.search).get('book'));
}
function readingFromUrl(): {mode:ReaderMode; overviewId?:string} | undefined {
  const params = new URLSearchParams(window.location.search);
  const overview = selectedFromUrl()?.overviews?.find(item => item.id === params.get('overview'));
  return overview ? {mode:params.get('view') === 'present' ? 'present' : 'pdf', overviewId:overview.id} : undefined;
}
function clearOverviewUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('overview'); url.searchParams.delete('view');
  window.history.replaceState({}, '', url);
}
export default function LibraryPage() {
  const [{books,categories},setCatalogue]=useState({books:bundledBooks,categories:bundledCategories});
  useEffect(()=>{const controller=new AbortController();void fetchPublicLibrary(controller.signal).then(setCatalogue).catch(()=>{/* The verified build-time catalogue remains available offline. */});return()=>controller.abort();},[]);
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [collection, setCollection] = useState('All collections');
  const [format, setFormat] = useState('all');
  const [sort, setSort] = useState('curated');
  const [selected, setSelected] = useState<LibraryBook | undefined>(()=>selectedFromUrl());
  useEffect(()=>{setSelected(selectedFromUrl(books));},[books]);
  const [reading, setReading] = useState<{mode:ReaderMode; overviewId?:string} | undefined>(readingFromUrl);
  const [category, setCategory] = useState('all');
  const closeReader = useCallback(() => {clearOverviewUrl(); setReading(undefined);}, []);
  const readPdf = useCallback(() => setReading({mode:'pdf'}), []);
  const openOverview = (overview:LibraryOverview, present:boolean) => {
    const url = new URL(window.location.href);
    url.searchParams.set('overview',overview.id);url.searchParams.set('view',present?'present':'pdf');
    window.history.pushState({}, '', url);
    setReading({mode:present?'present':'pdf',overviewId:overview.id});
  };
  const readSource = () => {clearOverviewUrl();setReading({mode:selected && canReadEbook(selected)?'ebook':'pdf'});};
  const activeOverview = selected?.overviews?.find(item => item.id === reading?.overviewId);
  const pdfDocument = activeOverview ? {
    title:activeOverview.title, pdf:activeOverview.pdf, author:'Acuity Institute · Visual overview', sourceUrl:'',
  } : selected;
  useEffect(() => {
    const onPop = () => { setSelected(selectedFromUrl(books)); setReading(readingFromUrl()); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [books]);
  const choose = (book: LibraryBook) => {
    setSelected(book);
    const url = new URL(window.location.href); url.searchParams.set('book', book.id);url.searchParams.delete('overview');url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };
  const closeDetails = () => {
    setSelected(undefined);
    const url = new URL(window.location.href); url.searchParams.delete('book');url.searchParams.delete('overview');url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };
  const filtered = filterBooks(query, collection, format, category, books);
  if (sort === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  const reset = () => { setQuery(''); setCollection('All collections'); setFormat('all'); setCategory('all'); };
  return <div className="library-shell">
    <a className="library-skip" href="#catalogue">Skip to catalogue</a>
    <header className="library-nav">
      <a className="library-brand" href="/"><Hexagon size={22} strokeWidth={1.2} /><span>ACUITY <small>INSTITUTE</small></span></a>
      <nav aria-label="Library navigation"><a href="/#manifesto">Our philosophy</a><a href="/#contact">Get in touch</a><a className="library-home" href="/"><ArrowLeft size={15} /> Back to Acuity</a></nav>
    </header>
    <main>
      <section className="library-intro">
        <div className="library-orbit" aria-hidden="true"><span>✧</span></div>
        <div className="library-eyebrow">THE ARCHIVE <span /> OPEN READING COLLECTION</div>
        <h1>A library for<br /><em>the enquiring mind.</em></h1>
        <p>Ancient wisdom. Enduring questions. Explore texts across philosophy and esoteric traditions, with room to form your own understanding.</p>
        <div className="library-intro-meta"><span><BookOpen size={15} /> {books.length} texts & presentations</span><span>Free to read & download</span><span>No account needed</span></div>
      </section>
      <section id="catalogue" className="library-catalogue" aria-label="Browse the library">
        <div className="library-toolbar">
          <label className="library-search"><Search size={19} /><span className="sr-only">Search titles, authors or subjects</span><input type="search" placeholder="Find a text, author or idea…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={18} /></button>}</label>
          <label className="library-select"><span>Format</span><select value={format} onChange={event => setFormat(event.target.value)}><option value="all">All formats</option><option value="pdf">PDF</option><option value="epub">EPUB</option><option value="ebook">E-Book reader</option><option value="pptx">PowerPoint</option></select></label>
          <label className="library-select"><span>Order</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="curated">Curated order</option><option value="title">Title A–Z</option></select></label>
        </div>
        <div className="library-category-row"><div className="library-collections" aria-label="Filter by category"><button aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All categories</button>{categories.filter(item => item.depth === 0).map(item => <button key={item.key} aria-pressed={category === item.key || category.startsWith(item.key + '/')} onClick={() => setCategory(item.key)}>{item.label} <span>{item.count}</span></button>)}</div><label className="library-select category-select"><span>Category</span><select aria-label="Category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item => <option key={item.key} value={item.key}>{'— '.repeat(item.depth)}{item.label} ({item.count})</option>)}</select></label></div>
        <div className="library-results"><h2>{category === 'all' ? 'The collection' : categories.find(item => item.key === category)?.path.join(' / ')}</h2><span role="status">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span></div>
        {filtered.length ? <div className="library-grid">{filtered.map((book, index) => <article key={book.id} className="library-card">
          <button className={`library-cover cover-${book.accent}`} onClick={() => choose(book)} aria-label={`View ${book.title}`}>
            <span className="cover-top">{book.kind === 'presentation' ? 'ACUITY PRESENTATIONS' : 'ACUITY READING EDITIONS'} <span>{String(index + 1).padStart(2, '0')}</span></span>
            <span className="cover-symbol" aria-hidden="true"><span />✧</span>
            <span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span><span className="cover-bottom">{book.period}<ArrowUpRight size={16} /></span>
          </button>
          <div className="library-card-body"><span className="library-eyebrow">{book.categoryLabel}</span><h3><button onClick={() => choose(book)}>{book.title}</button></h3><p className="library-byline">{book.translator ? `Translated by ${book.translator}` : book.author}</p><p>{book.shortDescription || book.description}</p>{!!book.overviews?.length && <button className="library-overview-badge" onClick={() => choose(book)}>Visual overview available</button>}<div className="library-card-meta"><span>{book.language}{book.pages ? ` · ${book.pages} ${book.kind === 'presentation' ? 'slides' : 'pages'}` : ''}</span><span>{[book.pdf && 'PDF', book.epub && 'EPUB', book.pptx && 'PPTX', book.markdown && 'Markdown'].filter(Boolean).join(' / ')}</span></div><button className="library-read-link" onClick={() => { choose(book); if(book.pdf) setReading({mode:'pdf'}); }}>{book.pdf ? 'Open PDF' : 'View edition'}<ArrowUpRight size={17} /></button>{canReadEbook(book) && <button className="library-read-link ebook-launch" onClick={() => { choose(book); setReading({mode:'ebook'}); }}>Read E-Book <BookOpen size={17}/></button>}</div>
        </article>)}</div> : <div className="library-empty"><BookOpen size={32} /><h3>No items found.</h3><p>Try another title, author or subject, or browse the whole collection.</p><button className="library-primary" onClick={reset}>Clear filters</button></div>}
      </section>
      <section className="library-next"><span className="library-eyebrow">A FOUNDATION FOR DEEPER INQUIRY</span><h2>Begin with the source.</h2><p>This is the first chapter of the Acuity Library. Our next step is a workspace for asking questions across texts, comparing passages and tracing answers back to their sources.</p><span className="library-planned">AI-assisted inquiry · In development</span><a href="/#contact">Suggest a text or share an idea <ArrowUpRight size={16} /></a></section>
    </main>
    <footer className="library-footer"><span>© 2026 Acuity Institute</span><p>Historical texts invite interpretation, not unquestioning acceptance.</p><a href="/about/">About Acuity</a></footer>
    {selected && !reading && <BookDetails book={selected} onClose={closeDetails} onRead={mode => setReading({mode})} onOverview={openOverview} />}
    {selected && reading && <Suspense fallback={<div className="library-loading" role="status">Opening the reading room… <button onClick={closeReader}>Cancel</button></div>}>{reading.mode === 'ebook' && canReadEbook(selected) ? <EbookReader key={selected.id} book={selected} onClose={closeReader} onReadPdf={readPdf}/> : pdfDocument && <PdfReader key={activeOverview?.id || selected.id} book={pdfDocument} onClose={closeReader} initialPresentation={reading.mode === 'present'} documentLabel={activeOverview ? 'Visual overview · Companion slides' : undefined} onReadSource={activeOverview ? readSource : undefined}/>}</Suspense>}
  </div>;
}

function BookDetails({ book, onClose, onRead, onOverview }: {book: LibraryBook; onClose: () => void; onRead: (mode: ReaderMode) => void; onOverview:(overview:LibraryOverview,present:boolean)=>void}) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  useEffect(() => { dialog?.showModal(); return () => dialog?.close(); }, [dialog]);
  return <dialog ref={setDialog} className="library-details" onCancel={event => { event.preventDefault(); onClose(); }} aria-labelledby="book-title">
    <button className="library-close" onClick={onClose} aria-label="Close book details" autoFocus><X /></button>
    <div className="library-eyebrow">{book.categoryLabel}{book.period && ` / ${book.period}`}</div><h2 id="book-title">{book.title}</h2><p className="library-byline">{book.author}{book.translator && ` · Translation by ${book.translator}`}</p><p>{book.description}</p>
    <BookActions book={book} onRead={onRead}/>
    <LibraryOverviews overviews={book.overviews || []} onOpen={onOverview}/>
    <div className="library-edition"><h3>About this edition</h3><p>{book.editionNote}</p><p>{book.rights}</p>{book.sourceUrl && <a href={book.sourceUrl} target="_blank" rel="noreferrer">{book.sourceId ? 'View source at Project Gutenberg' : 'View edition source'} <ArrowUpRight size={14} /></a>}{book.markdown && <a href={book.markdown} download>Download Markdown source <ArrowUpRight size={14}/></a>}{book.trademark && <><h3>Trademark metadata</h3><p>{book.trademark.marks.join(', ') || book.trademark.status}. {book.trademark.use_rules}</p></>}{book.text && <a href={book.text} target="_blank" rel="noreferrer">Read accessible plain text <ArrowUpRight size={14} /></a>}</div>
  </dialog>;
}

