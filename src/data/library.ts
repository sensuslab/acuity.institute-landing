import catalogue from './libraryCatalogue.json';
import categoryIndex from './libraryCategories.json';
export type LibraryOverview = {
  id:string; title:string; sourceBookIds:string[]; language:string; pages:number;
  imageOnly:boolean; pdf?:string; pptx?:string; pdfBytes?:number;
  assets:{format:string;url:string;bytes:number;sha256:string}[];
};
export type LibraryBook = {
  id: string; title: string; subtitle: string; author: string; translator: string | null;
  collection: string; period: string; language: string; description: string;
  shortDescription?: string;
  editionNote: string; tags: string[]; sourceUrl: string; sourceId?: number; rights: string;
  markdown?: string; rightsMetadata?:Record<string,unknown>; trademark?:{status:string;marks:string[];use_rules:string}; sourceMetadata?:Record<string,unknown>; pdf?: string; epub?: string; text?: string; pptx?: string; accent: string; pages?: number; pdfBytes?: number;
  categoryKey: string; categoryPath: string[]; categoryLabel: string; kind: string;
  capabilities: {pdf:boolean; ebook:boolean; present:boolean};
  assets: {format:string;url:string;bytes:number;sha256:string}[];
  direction?: 'ltr' | 'rtl';
  overviews?: LibraryOverview[];
};
export type LibraryCategory = {key:string;label:string;path:string[];depth:number;count:number};
export const books: LibraryBook[] = catalogue.map(book => ({
  ...book,
  direction: book.direction === 'rtl' ? 'rtl' : 'ltr',
}));
export const categories: LibraryCategory[] = categoryIndex;
export const collections = [...new Set(books.map(book => book.collection))];
// Curated scans require PDF + EPUB; Atlas texts pair canonical Markdown + EPUB.
export const canReadEbook = (book: Pick<LibraryBook, 'pdf' | 'epub' | 'markdown'>) => !!(book.epub && (book.pdf || book.markdown));
export function inCategory(book: Pick<LibraryBook,'categoryKey'>, category: string) {
  return category === 'all' || (category === '_uncategorised' ? !book.categoryKey : book.categoryKey === category || book.categoryKey.startsWith(category + '/'));
}
export function filterBooks(query: string, collection: string, format: string, category = 'all', catalogue:LibraryBook[] = books) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return catalogue.filter(book => {
    const searchable = [book.title, book.subtitle, book.author, book.translator, book.collection, book.categoryLabel, book.description, ...book.tags].join(' ').toLocaleLowerCase();
    const hasFormat = format === 'all' || (format === 'ebook' ? canReadEbook(book) : format === 'pdf' ? !!book.pdf : format === 'pptx' ? !!book.pptx : !!book.epub);
    return terms.every(term => searchable.includes(term)) &&
      (collection === 'All collections' || book.collection === collection) && hasFormat && inCategory(book,category);
  });
}

