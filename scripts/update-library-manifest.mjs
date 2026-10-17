import fs from 'node:fs';
import { createHash } from 'node:crypto';
const cataloguePath = 'src/data/libraryCatalogue.json';
const manifestPath = 'public/library/provenance.json';
const books = JSON.parse(fs.readFileSync(cataloguePath,'utf8'));
const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath,'utf8')) : [];
const manifest = [];
for(const book of books){
  if (!book.pdf && !book.epub) throw new Error(`${book.id}: at least one format is required`);
  for(const format of ['pdf','epub','text']){
    if(!book[format])continue;
    if (!/^\/library\/books\/[a-z0-9._-]+$/.test(book[format])) throw new Error(`${book.id}: use a local file in /library/books/`);
    const bytes=fs.readFileSync('public'+book[format]);
    if(format==='pdf')book.pdfBytes=bytes.length;
    const sha256=createHash('sha256').update(bytes).digest('hex');
    const old=previous.find(r=>r.bookId===book.id && r.format===format && r.sha256===sha256);
    manifest.push({...old, bookId:book.id,format,path:book[format],bytes:bytes.length,sha256,source:book.sourceUrl,verifiedAt:new Date().toISOString()});
  }
}
fs.writeFileSync(cataloguePath,JSON.stringify(books,null,2)+'\n');
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(`Recorded ${manifest.length} files for ${books.length} books.`);
