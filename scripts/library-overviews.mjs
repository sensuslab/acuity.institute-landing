import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import JSZip from 'jszip';

// Overview assets live outside books/: a companion PPTX must never change a
// source text's kind, primary PDF or ebook capabilities.
export async function attachLibraryOverviews({books, manifest = {version:1, overviews:[]}, publicDir, assetRegistry}) {
  if (manifest.version !== 1 || !Array.isArray(manifest.overviews)) throw new Error('Unsupported overview manifest');
  const sourceById = new Map(books.map(book => [book.id, book]));
  const linked = new Map();
  const ids = new Set();
  for (const item of manifest.overviews) {
    if (!/^overview-[a-z0-9-]+$/.test(item.id || '') || ids.has(item.id)) throw new Error('Invalid or duplicate overview id');
    ids.add(item.id);
    if (item.resourceRole !== 'visual-overview' || !item.title?.trim() || !item.language?.trim() ||
      !Number.isSafeInteger(item.pages) || item.pages < 1) throw new Error(`${item.id}: incomplete overview metadata`);
    if (!Array.isArray(item.sourceBookIds) || !item.sourceBookIds.length || new Set(item.sourceBookIds).size !== item.sourceBookIds.length) {
      throw new Error(`${item.id}: sourceBookIds must be unique and nonempty`);
    }
    for (const id of item.sourceBookIds) {
      if (!sourceById.has(id) || sourceById.get(id).kind === 'presentation') throw new Error(`${item.id}: unknown source text ${id}`);
    }
    if (!Array.isArray(item.assets)) throw new Error(`${item.id}: missing assets`);
    const overview = {id:item.id, title:item.title, sourceBookIds:item.sourceBookIds,
      language:item.language, pages:item.pages, imageOnly:!!item.imageOnly, assets:[]};
    const formats = new Set();
    for (const asset of item.assets) {
      if (!['pdf','pptx'].includes(asset.format) || formats.has(asset.format) ||
        !/^\/library\/overviews\/[a-z0-9-]+\/[a-f0-9]{12}\.(pdf|pptx)$/.test(asset.url || '') ||
        !asset.url.endsWith('.'+asset.format) || !/^[a-f0-9]{64}$/.test(asset.sha256 || '') ||
        !Number.isSafeInteger(asset.bytes) || asset.bytes < 5) throw new Error(`${item.id}: invalid overview asset`);
      formats.add(asset.format);
      const remote = assetRegistry?.get(asset.url,asset);
      if (!remote) {
        const file = path.join(publicDir, asset.url);
        const bytes = fs.readFileSync(file);
        if (bytes.length !== asset.bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
          throw new Error(`${item.id}: overview bytes differ from reviewed identity`);
        }
        if (asset.format === 'pdf' && bytes.subarray(0,5).toString() !== '%PDF-') throw new Error(`${item.id}: invalid overview PDF`);
        if (asset.format === 'pptx') {
          const archive = await JSZip.loadAsync(bytes, {checkCRC32:true});
          if (!archive.file('[Content_Types].xml') || !archive.file('ppt/presentation.xml')) throw new Error(`${item.id}: invalid overview PPTX`);
        }
      }
      overview[asset.format] = remote ? remote.url : asset.url;
      if (asset.format === 'pdf') overview.pdfBytes = asset.bytes;
      overview.assets.push({...asset,url:remote ? remote.url : asset.url});
    }
    if (!overview.pdf) throw new Error(`${item.id}: a PDF is required for the overview viewer`);
    for (const id of item.sourceBookIds) linked.set(id, [...(linked.get(id) || []), overview]);
  }
  return books.map(book => ({...book, overviews:linked.get(book.id) || []}));
}

