import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import JSZip from 'jszip';

const extensions = {'.pdf':'pdf','.epub':'epub','.txt':'text','.pptx':'pptx'};
const urlFor = relative => '/library/books/' + relative.split(path.sep).map(encodeURIComponent).join('/');
export const fileForUrl = (publicDir, url) => path.join(publicDir, decodeURIComponent(url));
const label = name => name.replace(/[-_]/g, ' ');

export async function compileLibrary({ booksDir, categoryLabels = {}, previousManifest = [] }) {
  const groups = new Map();
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not supported in the curated library: ${entry.name}`);
      if (entry.name.startsWith('.')) continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {walk(full);continue;}
      const ext = path.extname(entry.name).toLowerCase();
      if (!(ext in extensions) && ext !== '.json') continue;
      const relative = path.relative(booksDir, full);
      const stem = relative.slice(0,-ext.length);
      const key = stem.toLocaleLowerCase();
      const group = groups.get(key) || {stem, files:{}};
      const format = ext === '.json' ? 'metadata' : extensions[ext];
      if (group.files[format]) throw new Error(`Duplicate ${format} file for ${stem}`);
      group.files[format] = {full, relative}; groups.set(key, group);
    }
  }
  walk(booksDir);
  const books = []; const manifest = []; const ids = new Set();
  for (const {stem,files} of groups.values()) {
    if (!files.pdf && !files.epub && !files.pptx) {
      throw new Error(`${stem}: metadata/text has no matching PDF, EPUB or PPTX`);
    }
    if (!files.metadata) throw new Error(`${stem}: add a matching .json file with curated metadata`);
    const metadata = JSON.parse(fs.readFileSync(files.metadata.full,'utf8'));
    for (const field of ['id','title','author','rights']) {
      if (typeof metadata[field] !== 'string' || !metadata[field].trim()) throw new Error(`${stem}: ${field} is required`);
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(metadata.id)) throw new Error(`${stem}: id must be a stable lowercase slug`);
    if (ids.has(metadata.id)) throw new Error(`Duplicate record id: ${metadata.id}`);
    ids.add(metadata.id);
    if (metadata.sourceUrl && !/^https?:\/\//.test(metadata.sourceUrl)) throw new Error(`${stem}: sourceUrl must be an HTTP(S) URL`);
    const directory = path.dirname(stem);
    const categorySegments = directory === '.' ? [] : directory.split(path.sep);
    const categoryKey = categorySegments.join('/');
    const categoryPath = categorySegments.map((segment,i) => categoryLabels[categorySegments.slice(0,i+1).join('/')] || label(segment));
    // File paths and capability flags are derived here; stale metadata cannot enable a viewer.
    const {pdf: _pdf, epub: _epub, text: _text, pptx: _pptx, capabilities: _caps, assets: _assets, ...curated} = metadata;
    const book = {...curated, subtitle:metadata.subtitle || '',translator:metadata.translator || null,
      collection:metadata.collection || categoryPath.at(-1) || 'Uncategorised', period:metadata.period || '',
      language:metadata.language || 'Unspecified', description:metadata.description || '',editionNote:metadata.editionNote || '',
      sourceUrl:metadata.sourceUrl || '',tags:Array.isArray(metadata.tags) ? metadata.tags.map(String) : [],
      accent:['sage','gold','violet'].includes(metadata.accent) ? metadata.accent : 'gold',
      categoryKey,categoryPath,categoryLabel:categoryPath.join(' / ') || 'Uncategorised', assets:[]};
    for (const format of ['pdf','epub','text','pptx']) {
      if (!files[format]) continue;
      const bytes = fs.readFileSync(files[format].full);
      if (format === 'pdf' && bytes.subarray(0,5).toString() !== '%PDF-') throw new Error(`${stem}: invalid PDF header`);
      if (format === 'epub' || format === 'pptx') {
        const archive = await JSZip.loadAsync(bytes, {checkCRC32:true});
        if (format === 'epub') {
          if (!archive.file('mimetype') || (await archive.file('mimetype').async('string')).trim() !== 'application/epub+zip' || !archive.file('META-INF/container.xml')) {
            throw new Error(`${stem}: not a valid EPUB container`);
          }
        } else if (!archive.file('[Content_Types].xml') || !archive.file('ppt/presentation.xml')) {
          throw new Error(`${stem}: not a valid PowerPoint archive`);
        }
      }
      const url = urlFor(files[format].relative);
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      book[format] = url;
      if (format === 'pdf') book.pdfBytes = bytes.length;
      book.assets.push({format,url,bytes:bytes.length,sha256});
      const previous = previousManifest.find(r => r.bookId === book.id && r.format === format && r.sha256 === sha256);
      const {path:_oldPath, verifiedAt:_verified, ...original} = previous || {};
      manifest.push({...original,bookId:book.id,format,path:url,bytes:bytes.length,sha256,source:book.sourceUrl});
    }
    book.capabilities = {pdf:!!book.pdf, ebook:!!(book.pdf && book.epub), present:!!book.pdf};
    book.kind = categorySegments[0]?.toLowerCase() === 'presentations' || !!book.pptx ? 'presentation' : 'book';
    books.push(book);
  }
  books.sort((a,b)=>(a.order ?? 1000)-(b.order ?? 1000) || a.title.localeCompare(b.title));
  const categoryMap = new Map();
  for (const book of books) {
    for (let depth=1;depth<=book.categoryPath.length;depth++) {
      const key = book.categoryKey.split('/').slice(0,depth).join('/');
      const category = categoryMap.get(key) || {key,label:book.categoryPath[depth-1],path:book.categoryPath.slice(0,depth),depth:depth-1,count:0};
      category.count++;categoryMap.set(key,category);
    }
    if (!book.categoryPath.length) {
      const category = categoryMap.get('_uncategorised') || {key:'_uncategorised',label:'Uncategorised',path:['Uncategorised'],depth:0,count:0};
      category.count++;categoryMap.set('_uncategorised',category);
    }
  }
  const categories = [...categoryMap.values()].sort((a,b)=>a.key.localeCompare(b.key));
  return {books, categories, manifest};
}
