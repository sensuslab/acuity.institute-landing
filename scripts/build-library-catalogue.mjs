import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileLibrary } from './library-catalogue.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file,fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : fallback;
const catalogue = path.join(root,'src/data/libraryCatalogue.json');
const manifestPath = path.join(root,'public/library/provenance.json');
const redirectsPath = path.join(root,'public/library/redirects.json');
const previous = read(catalogue,[]);
const result = await compileLibrary({booksDir:path.join(root,'public/library/books'), categoryLabels:read(path.join(root,'public/library/categories.json'),{}),previousManifest:read(manifestPath,[])});
const redirects = read(redirectsPath,{});
for (const old of previous) {
  const current = result.books.find(book=>book.id === old.id);
  if (!current) continue;
  for (const format of ['pdf','epub','text','pptx']) if (old[format] && current[format] && old[format] !== current[format]) redirects[old[format]] = current[format];
}
// Collapse moves so saved source/download links keep working across repeated reorganisations.
for (const source of Object.keys(redirects)) {
  let target=redirects[source];const seen=new Set([source]);
  while (redirects[target] && !seen.has(target)) {seen.add(target);target=redirects[target];}
  if (seen.has(target) || source===target) delete redirects[source]; else redirects[source]=target;
}
for (const [file,data] of [[catalogue,result.books],[path.join(root,'src/data/libraryCategories.json'),result.categories],[manifestPath,result.manifest],[redirectsPath,redirects]]) fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
console.log(`Indexed ${result.books.length} curated records across ${result.categories.length} categories. Ebook launchers: ${result.books.filter(b=>b.capabilities.ebook).length}.`);
