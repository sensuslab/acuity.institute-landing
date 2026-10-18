import catalogue from './libraryCatalogue.json';
import categoryIndex from './libraryCategories.json';
export type LibraryBook = {
  id: string; title: string; subtitle: string; author: string; translator: string | null;
  collection: string; period: string; language: string; description: string;
  editionNote: string; tags: string[]; sourceUrl: string; sourceId?: number; rights: string;
  pdf?: string; epub?: string; text?: string; pptx?: string; accent: string; pages?: number; pdfBytes?: number;
  categoryKey: string; categoryPath: string[]; categoryLabel: string; kind: string;
  capabilities: {pdf:boolean; ebook:boolean; present:boolean};
  assets: {format:string;url:string;bytes:number;sha256:string}[];
  direction?: 'ltr' | 'rtl';
};
export type LibraryCategory = {key:string;label:string;path:string[];depth:number;count:number};
export const books: LibraryBook[] = catalogue;
export const categories: LibraryCategory[] = categoryIndex;
export const collections = [...new Set(books.map(book => book.collection))];
// Both assets are required by the curated library's ebook policy, even for direct launches.
export const canReadEbook = (book: Pick<LibraryBook, 'pdf' | 'epub'>) => !!(book.pdf && book.epub);
export function inCategory(book: Pick<LibraryBook,'categoryKey'>, category: string) {
  return category === 'all' || (category === '_uncategorised' ? !book.categoryKey : book.categoryKey === category || book.categoryKey.startsWith(category + '/'));
}
export function filterBooks(query: string, collection: string, format: string, category = 'all') {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return books.filter(book => {
    const searchable = [book.title, book.subtitle, book.author, book.translator, book.collection, book.categoryLabel, ...book.tags].join(' ').toLocaleLowerCase();
    const hasFormat = format === 'all' || (format === 'ebook' ? canReadEbook(book) : format === 'pdf' ? !!book.pdf : format === 'pptx' ? !!book.pptx : !!book.epub);
    return terms.every(term => searchable.includes(term)) &&
      (collection === 'All collections' || book.collection === collection) && hasFormat && inCategory(book,category);
  });
}
