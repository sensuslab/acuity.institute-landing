import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {compileSacredTexts,indexLibraryCategories,mergeSacredTexts} from './library-sacred-texts.mjs';
import { createAssetRegistry } from './library-asset-registry.mjs';
import { compileLibrary } from './library-catalogue.mjs';
import { hydrateLibraryImports } from './fetch-library-imports.mjs';
import { attachLibraryOverviews } from './library-overviews.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(root,'content/library-r2-registry.json');
const localAssets = process.env.LIBRARY_ASSET_MODE === 'local';
if (!localAssets && !fs.existsSync(registryPath)) throw new Error('Missing verified R2 registry; restore it or explicitly use LIBRARY_ASSET_MODE=local for an offline import audit.');
const assetRegistry = !localAssets && fs.existsSync(registryPath) ? createAssetRegistry(JSON.parse(fs.readFileSync(registryPath,'utf8'))) : undefined;
if (!assetRegistry) await hydrateLibraryImports({root});
const read = (file,fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : fallback;
const catalogue = path.join(root,'src/data/libraryCatalogue.json');
const manifestPath = path.join(root,'public/library/provenance.json');
const redirectsPath = path.join(root,'public/library/redirects.json');
const previous = read(catalogue,[]);
const editorialRegistry = assetRegistry ? {...assetRegistry,assets:assetRegistry.assets.filter(a=>!a.recordIds.some(id=>id.startsWith('atlas-')))} : undefined;
const result = await compileLibrary({assetRegistry:editorialRegistry, booksDir:path.join(root,'public/library/books'), categoryLabels:read(path.join(root,'public/library/categories.json'),{}),previousManifest:read(manifestPath,[])});
result.books = await attachLibraryOverviews({assetRegistry, books:result.books, publicDir:path.join(root,'public'),
  manifest:read(path.join(root,'content/library-overviews.json'),{version:1,overviews:[]})});
if(assetRegistry && fs.existsSync(path.join(root,'data/sources/ancient-wisdom-atlas.json'))) {
  mergeSacredTexts(result.books,compileSacredTexts(read(path.join(root,'data/sources/ancient-wisdom-atlas.json')),assetRegistry));
  result.categories=indexLibraryCategories(result.books);
}
const redirects = read(redirectsPath,{});
if (assetRegistry) for (const asset of assetRegistry.assets) redirects[asset.legacyUrl] = asset.url;
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


if (assetRegistry) {
  const registry = read(registryPath,{});
  fs.writeFileSync(path.join(root,'public/library/release.json'),JSON.stringify({version:1,release:registry.release,sourceCommit:registry.sourceCommit,assetCount:assetRegistry.assets.length,catalogueUrl:`https://assets.acuity.institute/library/catalogues/public-${registry.release}.json`},null,2)+'\n');
}
