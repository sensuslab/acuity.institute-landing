import catalogue from './libraryCatalogue.json';
export type LibraryBook = {
  id: string; title: string; subtitle: string; author: string; translator: string | null;
  collection: string; period: string; language: string; description: string;
  editionNote: string; tags: string[]; sourceUrl: string; sourceId?: number; rights: string;
  pdf?: string; epub?: string; text?: string; accent: string; pages?: number; pdfBytes?: number;
};
export const books: LibraryBook[] = catalogue;
export const collections = [...new Set(books.map(book => book.collection))];
export function filterBooks(query: string, collection: string, format: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return books.filter(book => {
    const searchable = [book.title, book.subtitle, book.author, book.translator, book.collection, ...book.tags].join(' ').toLocaleLowerCase();
    return terms.every(term => searchable.includes(term)) &&
      (collection === 'All collections' || book.collection === collection) &&
      (format === 'all' || (format === 'pdf' ? !!book.pdf : !!book.epub));
  });
}
