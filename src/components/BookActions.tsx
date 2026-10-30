import { ArrowDownToLine, BookOpen, Presentation } from 'lucide-react';
import { canReadEbook, type LibraryBook } from '../data/library';
export type ReaderMode='pdf'|'ebook'|'present';
export default function BookActions({book,onRead}:{book:LibraryBook;onRead:(mode:ReaderMode)=>void}){
  return <div className="library-downloads">
    {book.pdf&&<button className="library-primary" onClick={()=>onRead('pdf')}><BookOpen size={17}/> Read PDF</button>}
    {canReadEbook(book)&&<button className="library-primary" onClick={()=>onRead('ebook')}><BookOpen size={17}/> Read E-Book</button>}
    {book.pdf&&<button className="library-secondary" onClick={()=>onRead('present')}><Presentation size={17}/> Present</button>}
    {book.pdf&&<a className="library-secondary" href={book.pdf} download><ArrowDownToLine size={16}/> PDF{book.pdfBytes?` · ${(book.pdfBytes/1024/1024).toFixed(1)} MB`:''}</a>}
    {book.epub&&<a className="library-secondary" href={book.epub} download><ArrowDownToLine size={16}/> EPUB</a>}
    {book.pptx&&<a className="library-secondary" href={book.pptx} download><ArrowDownToLine size={16}/> PPTX</a>}
  </div>;
}
