import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export async function buildReaderGuide(root) {
  const guide = JSON.parse(await fs.readFile(path.join(root, 'src/data/readerGuide.json'), 'utf8'));
  const { id, title, chapters } = guide;
  const zip = new JSZip();
  const document = (heading, content, attributes = '') =>
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" ${attributes} xml:lang="en"><head><title>${escape(heading)}</title></head><body>${content}</body></html>`;
  const pages = chapters.map((chapter, index) => ({ ...chapter, id: `chapter-${index + 1}`, href: `chapter-${index + 1}.xhtml` }));

  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  zip.file('EPUB/book.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="guide-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="guide-id">https://acuity.institute/library/${id}.epub</dc:identifier><dc:title>${escape(title)}</dc:title><dc:creator>Acuity Institute</dc:creator><dc:language>en</dc:language><meta property="dcterms:modified">2026-11-12T00:00:00Z</meta></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>${pages.map(page => `<item id="${page.id}" href="${page.href}" media-type="application/xhtml+xml"/>`).join('')}</manifest>
<spine>${pages.map(page => `<itemref idref="${page.id}"/>`).join('')}</spine></package>`);
  zip.file('EPUB/nav.xhtml', document('Contents', `<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${pages.map(page => `<li><a href="${page.href}">${escape(page.title)}</a></li>`).join('')}</ol></nav>`, 'xmlns:epub="http://www.idpf.org/2007/ops"'));
  for (const page of pages) {
    zip.file(`EPUB/${page.href}`, document(page.title, `<h1>${escape(page.title)}</h1>${page.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}`));
  }
  const markdown = [`# ${title}`, ...chapters.flatMap(chapter => [`## ${chapter.title}`, ...chapter.paragraphs])].join('\n\n') + '\n';
  const directory = path.join(root, 'public/library');
  await Promise.all([
    fs.writeFile(path.join(directory, id + '.epub'), await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })),
    fs.writeFile(path.join(directory, id + '.md'), markdown),
  ]);
}
