import { ArrowDownToLine, Bookmark, BookOpen, FileText, Presentation, Share2 } from 'lucide-react';
import { canReadEbook, type LibraryBook } from '../data/library';
import type { ReaderMode } from './BookActions';
import { libraryArticleUrl, showArticleShare } from './libraryShare';
import './libraryShare.css';

export function BookmarkButton({ book, saved, onToggle, showLabel = false }: {
  book: LibraryBook;
  saved: boolean;
  onToggle: () => void;
  showLabel?: boolean;
}) {
  const label = saved ? 'Remove from reading list' : 'Save to reading list';
  return <button
    className={showLabel ? 'library-secondary library-bookmark' : 'library-icon-action library-bookmark'}
    aria-label={`Bookmark ${book.title}`}
    aria-pressed={saved}
    title={label}
    onClick={onToggle}
  >
    <Bookmark size={17} aria-hidden="true" />
    {showLabel && (saved ? 'In reading list' : label)}
  </button>;
}

export function ShareArticleButton({ book, showLabel = false }: {
  book: Pick<LibraryBook, 'id' | 'title' | 'kind'>;
  showLabel?: boolean;
}) {
  if (book.kind === 'guide') return null;
  return (
    <button
      type="button"
      className={showLabel ? 'library-secondary' : 'library-icon-action'}
      aria-label={`Share ${book.title}`}
      aria-haspopup="dialog"
      title="Share this entry"
      onClick={event => showArticleShare(event.currentTarget, libraryArticleUrl(book.id), book.title)}
    >
      <Share2 size={17} aria-hidden="true" />
      {showLabel && 'Share'}
    </button>
  );
}

export function LibraryFormatActions({ book, onOpen, onOverview }: {
  book: LibraryBook;
  onOpen: (mode: ReaderMode) => void;
  onOverview: () => void;
}) {
  const downloads = [
    { label: 'EPUB', url: book.epub },
    { label: 'PDF', url: book.pdf },
    { label: 'PowerPoint', url: book.pptx },
    { label: 'Markdown', url: book.markdown },
  ].filter(file => file.url);

  return <>
    {canReadEbook(book) && <button className="library-icon-action" aria-label={`Read ${book.title} as an e-book`} title="Read E-Book" onClick={() => onOpen('ebook')}><BookOpen size={17} aria-hidden="true" /></button>}
    {!!book.overviews?.length && <button className="library-icon-action" aria-label={`Visual overview of ${book.title}`} title="Visual overview available" onClick={onOverview}><Presentation size={17} aria-hidden="true" /></button>}
    {book.pdf && <button className="library-icon-action" aria-label={`Read ${book.title} as a PDF`} title="Read PDF" onClick={() => onOpen('pdf')}><FileText size={17} aria-hidden="true" /></button>}
    {!!downloads.length && <details className="library-download-menu">
      <summary className="library-icon-action" aria-label={`Download formats for ${book.title}`} title="Download formats"><ArrowDownToLine size={17} aria-hidden="true" /></summary>
      <ul>{downloads.map(({ label, url }) => <li key={label}><a href={url} download>Download {label}</a></li>)}</ul>
    </details>}
  </>;
}
