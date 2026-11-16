import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'library-homepage-counts',
      transformIndexHtml(html) {
        const books: { kind: string }[] = JSON.parse(
          readFileSync(new URL('./src/data/libraryCatalogue.json', import.meta.url), 'utf8'),
        );
        const presentations = books.filter(book => book.kind === 'presentation').length;
        return html
          .replaceAll('{{LIBRARY_RECORDS}}', String(books.length))
          .replaceAll('{{LIBRARY_TEXTS}}', String(books.length - presentations))
          .replaceAll('{{LIBRARY_PRESENTATIONS}}', String(presentations));
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
