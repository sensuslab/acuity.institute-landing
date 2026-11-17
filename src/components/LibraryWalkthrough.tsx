import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Bookmark, BookOpen, ChevronLeft, ChevronRight, Search, Settings, X } from 'lucide-react';
import { books, filterBooks } from '../data/library';
import { ebookPageTones, type EbookPageTone } from './ebookAppearance';
import './libraryWalkthrough.css';

const steps = [
  {
    label: 'Browse',
    title: 'Find a text',
    description: 'Search by title, author or subject. Filter by category or format and switch between grid and list views.',
    tip: 'Open an entry for edition notes, downloads and any visual overview.',
  },
  {
    label: 'Read',
    title: 'Make the page your own',
    description: 'Read E-Book opens an adjustable edition. Open PDF shows the original page layout.',
    tip: 'In the e-book reader, use Contents to jump to a chapter, the arrows to turn a page and Settings to change the font, size or page colour.',
  },
  {
    label: 'Save',
    title: 'Return to your reading',
    description: 'Bookmark any entry to find it again in your Reading list.',
    tip: 'To reopen an e-book at the same passage, turn on “Remember my place on this device” in the reader’s Settings. Bookmarks and reading positions stay in this browser.',
  },
] as const;

type WalkthroughProps = {
  onClose: () => void;
  onPractice: () => void;
};

export default function LibraryWalkthrough({ onClose, onPractice }: WalkthroughProps) {
  const [step, setStep] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pointerStartedOutside = useRef(false);
  const current = steps[step];
  const isLastStep = step === steps.length - 1;

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    return () => element.close();
  }, []);

  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = 0;
    title.current?.focus({ preventScroll: true });
  }, [step]);

  return (
    <dialog
      ref={dialog}
      id="library-guide"
      className="library-walkthrough"
      aria-labelledby="walkthrough-title"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onPointerDown={event => { pointerStartedOutside.current = event.target === event.currentTarget; }}
      onClick={event => {
        if (event.target === event.currentTarget && pointerStartedOutside.current) onClose();
      }}
    >
      <div className="walkthrough-layout">
        <header className="walkthrough-header">
          <div><BookOpen size={19} aria-hidden="true" /><h2 id="walkthrough-title">How to use the Library</h2></div>
          <button className="walkthrough-icon" type="button" aria-label="Close walkthrough" onClick={onClose}><X size={20} /></button>
        </header>

        <nav className="walkthrough-steps" aria-label="Walkthrough steps">
          <ol>
            {steps.map(({ label }, index) => (
              <li key={label}>
                <button type="button" aria-current={index === step ? 'step' : undefined} onClick={() => setStep(index)}>
                  <span aria-hidden="true">{index + 1}</span>{label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="walkthrough-body" ref={content}>
          <section className="walkthrough-copy" aria-labelledby="walkthrough-step-title">
            <h3 id="walkthrough-step-title" ref={title} tabIndex={-1}>{current.title}</h3>
            <p>{current.description}</p>
            <p>{current.tip}</p>
            {step === 1 && <button type="button" className="walkthrough-practice" onClick={onPractice}>Open the practice e-book <ArrowRight size={17} aria-hidden="true" /></button>}
          </section>

          <div className="walkthrough-stage">
            {step === 0 && <BrowsePreview />}
            {step === 1 && <ReaderPreview />}
            {step === 2 && <BookmarkPreview />}
          </div>
        </div>

        <footer className="walkthrough-footer">
          {step > 0 ? <button className="walkthrough-back" type="button" onClick={() => setStep(step - 1)}><ChevronLeft size={18} aria-hidden="true" /> Back</button>
            : <button className="walkthrough-back" type="button" onClick={onClose}>Skip walkthrough</button>}
          <button className="walkthrough-next" type="button" onClick={() => isLastStep ? onClose() : setStep(step + 1)}>
            {isLastStep ? 'Explore the Library' : 'Next'} <ArrowRight size={17} aria-hidden="true" />
          </button>
        </footer>
      </div>
    </dialog>
  );
}

const sampleIds = new Set([
  'gitanjali-tagore-1913',
  'hymn-of-jesus-mead-1907',
  'practical-mysticism-evelyn-underhill',
]);
const browseSample = books.filter(book => sampleIds.has(book.id));

function BrowsePreview() {
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('all');
  const results = filterBooks(query, 'All collections', format, 'all', browseSample);
  return (
    <div className="walkthrough-preview">
      <div className="walkthrough-preview-heading"><Search size={17} aria-hidden="true" /> Try a sample search</div>
      <div className="walkthrough-search">
        <input type="search" aria-label="Search sample texts" placeholder="Try Tagore" value={query} onChange={event => setQuery(event.target.value)} />
        <select aria-label="Sample format" value={format} onChange={event => setFormat(event.target.value)}>
          <option value="all">All formats</option>
          <option value="ebook">E-Book reader</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      <ul className="walkthrough-results" aria-label="Sample results">
        {results.map(book => (
          <li key={book.id}><span>{book.title}<small>{book.translator || book.author}</small></span><span>{[book.pdf && 'PDF', book.epub && 'EPUB'].filter(Boolean).join(' / ')}</span></li>
        ))}
      </ul>
      <p className="walkthrough-status" role="status">{results.length === 0 ? 'No sample texts match.' : `${results.length} sample ${results.length === 1 ? 'match' : 'matches'}`}</p>
    </div>
  );
}

const practicePages = [
  { title: 'Turn a page', text: 'Use the arrows to move forward and back. On a keyboard, try the Left and Right Arrow keys in the full reader.' },
  { title: 'Read comfortably', text: 'Open Settings to try a warmer page or a larger text size. You can also change the font in the full reader.' },
] as const;

function ReaderPreview() {
  const [page, setPage] = useState(0);
  const [tone, setTone] = useState<EbookPageTone>('soft');
  const [largeText, setLargeText] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const currentPage = practicePages[page];
  return (
    <div className="walkthrough-preview walkthrough-reader-preview">
      <div className="walkthrough-reader-toolbar">
        <span><BookOpen size={17} aria-hidden="true" /> Reader preview</span>
        <button className="walkthrough-icon" type="button" aria-label="Preview settings" aria-expanded={showSettings} aria-controls="walkthrough-preview-settings" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="walkthrough-reader-settings" id="walkthrough-preview-settings" hidden={!showSettings}>
        <label>Page colour
          <select aria-label="Preview page colour" value={tone} onChange={event => setTone(event.target.value as EbookPageTone)}>
            {Object.entries(ebookPageTones).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}
          </select>
        </label>
        <button type="button" aria-pressed={largeText} onClick={() => setLargeText(!largeText)}>Larger text</button>
      </div>
      <div className={`walkthrough-paper${largeText ? ' walkthrough-paper-large' : ''}`} style={{ backgroundColor: ebookPageTones[tone].background }} aria-live="polite">
        <h4>{currentPage.title}</h4>
        <p>{currentPage.text}</p>
      </div>
      <div className="walkthrough-pagination">
        <button className="walkthrough-icon" type="button" aria-label="Previous sample page" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={20} aria-hidden="true" /></button>
        <span>Page {page + 1} of {practicePages.length}</span>
        <button className="walkthrough-icon" type="button" aria-label="Next sample page" disabled={page === practicePages.length - 1} onClick={() => setPage(page + 1)}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>
    </div>
  );
}

function BookmarkPreview() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="walkthrough-preview walkthrough-bookmark-preview">
      <div className="walkthrough-preview-heading"><Bookmark size={17} aria-hidden="true" /> Try a sample bookmark</div>
      <div className="walkthrough-bookmark-card">
        <div><strong>Gitanjali (Song Offerings)</strong><small>Rabindranath Tagore</small></div>
        <button className="walkthrough-icon" type="button" aria-label="Bookmark sample text" aria-pressed={saved} onClick={() => setSaved(!saved)}>
          <Bookmark fill={saved ? 'currentColor' : 'none'} size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="walkthrough-reading-list">
        <h4>Sample reading list</h4>
        <p role="status">{saved ? 'Gitanjali (Song Offerings) is saved.' : 'No sample bookmarks yet.'}</p>
      </div>
    </div>
  );
}
