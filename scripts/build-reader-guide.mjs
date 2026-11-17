import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const guideStyle = `
body { color: #211b15; line-height: 1.5; font-family: Georgia, serif; }
.practice-page { max-width: 34em; margin: 0 auto; }
header { border-bottom: 1px solid #b29358; padding: .35em 0; }
header small { color: #6f5427; font: bold .65em/1.4 sans-serif; letter-spacing: .1em; }
h1 { margin: .45em 0; font-size: 1.7em; line-height: 1.1; }
p { margin: .55em 0; }
figure { margin: .55em auto; max-width: 420px; break-inside: avoid; }
figure img { display: block; width: 100%; height: auto; }
`;

const toolbarIcons = [
  'M-6 -4H6 M-6 0H6 M-6 4H6',
  'M0 -7V-4 M0 4V7 M-7 0H-4 M4 0H7 M-5 -5L-3 -3 M3 3L5 5 M-5 5L-3 3 M3 -3L5 -5 M4 0A4 4 0 1 0 -4 0A4 4 0 1 0 4 0',
  'M0 -6V3 M-4 -1L0 3L4 -1 M-6 5H6',
  'M-2 -6H-6V-2 M2 -6H6V-2 M-6 2V6H-2 M2 6H6V2',
  'M-5 -5L5 5 M5 -5L-5 5',
];

function toolbar(active = []) {
  return `<rect x="15" y="15" width="390" height="36" rx="5" fill="#30271d"/>
  <path d="M30 26l6-3 6 3v8l-6 3-6-3z" fill="none" stroke="#e8c77e"/>
  <text x="49" y="34" font-size="12" letter-spacing="1">ACUITY / E-BOOK</text>
  ${toolbarIcons.map((icon, i) => `<g transform="translate(${279 + i * 24} 33)">
    ${active.includes(i) ? '<rect x="-11" y="-11" width="22" height="22" rx="4" fill="#694c27" stroke="#e8c77e"/>' : ''}
    <path d="${icon}" fill="none" stroke="#f1e5cc" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g>`).join('')}`;
}

const arrow = (d) => `<path d="${d}" stroke="#e8c77e" stroke-width="2" fill="none" marker-end="url(#tip)"/>`;
const label = (x, y, text, align = 'start') => `<text x="${x}" y="${y}" text-anchor="${align}" fill="#f2d79c" font-size="14" font-weight="bold">${text}</text>`;

const diagrams = {
  pages: () => `${toolbar()}
    <rect x="57" y="57" width="306" height="88" rx="4" fill="#ede0c8"/>
    <path d="M117 77h124m-124 13h182m-182 13h144m-144 13h181" stroke="#ac9777" stroke-width="3" stroke-linecap="round"/>
    <rect x="20" y="80" width="29" height="41" rx="5" fill="#694c27" stroke="#e8c77e"/>
    <rect x="371" y="80" width="29" height="41" rx="5" fill="#694c27" stroke="#e8c77e"/>
    <path d="M37 93l-7 7 7 7m348-14l7 7-7 7" fill="none" stroke="#f2d79c" stroke-width="2"/>
    ${arrow('M35 150V126')}${arrow('M385 150V126')}${label(35, 170, 'Previous', 'middle')}${label(385, 170, 'Next', 'middle')}`,
  contents: () => `${toolbar([0])}
    ${arrow('M175 77H279V49')}${label(43, 83, 'Open Contents')}
    <rect x="203" y="88" width="196" height="72" rx="6" fill="#3a2d1f" stroke="#78613f"/>
    <text x="215" y="105" font-size="12">CHAPTER</text>
    <rect x="214" y="114" width="174" height="31" rx="4" fill="#694c27"/>
    <text x="223" y="134" font-size="12">Make the page your own</text>`,
  settings: () => `${toolbar([1, 3])}
    ${arrow('M192 79H303V49')}${label(52, 84, 'Open Settings')}
    ${arrow('M351 111V49')}${label(351, 130, 'Fullscreen', 'middle')}
    <text x="53" y="107" font-size="13">Text font · Text size · Page colour</text>`,
  remember: () => `${toolbar([1])}
    ${arrow('M303 51V63')}${label(37, 93, 'In Settings')}
    <rect x="147" y="67" width="252" height="93" rx="6" fill="#3a2d1f" stroke="#78613f"/>
    <text x="161" y="92" font-size="13">Page colour</text>
    <rect x="159" y="105" width="229" height="34" rx="4" fill="#694c27" stroke="#e8c77e"/>
    <rect x="169" y="115" width="13" height="13" rx="2" fill="#e8c77e"/>
    <path d="M172 121l3 3 5-6" fill="none" stroke="#322615" stroke-width="1.4"/>
    <text x="188" y="126" font-size="12">Remember my place on this device</text>
    ${arrow('M112 122H151')}`,
};

function figureSvg(cue) {
  if (!Object.hasOwn(diagrams, cue)) throw new Error(`Unknown practice cue: ${cue}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="184" viewBox="0 0 420 184">
  <defs><marker id="tip" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="#e8c77e"/></marker></defs>
  <rect x="1" y="1" width="418" height="182" rx="10" fill="#211a14" stroke="#8b7046"/>
  <g font-family="Arial, sans-serif" fill="#f1e5cc">${diagrams[cue]()}</g>
  </svg>`;
}

export async function buildReaderGuide(root) {
  const guide = JSON.parse(await fs.readFile(path.join(root, 'src/data/readerGuide.json'), 'utf8'));
  const { id, title, chapters } = guide;
  const zip = new JSZip();
  const document = (heading, content, attributes = '') =>
    `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" ${attributes} xml:lang="en"><head><title>${escape(heading)}</title><link rel="stylesheet" type="text/css" href="guide.css"/></head><body>${content}</body></html>`;
  const pages = chapters.map((chapter, index) => ({
    ...chapter, id: `chapter-${index + 1}`, href: `chapter-${index + 1}.xhtml`, art: `controls-${chapter.cue}.svg`,
  }));

  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  zip.file('EPUB/book.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="guide-id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="guide-id">https://acuity.institute/library/${id}.epub</dc:identifier><dc:title>${escape(title)}</dc:title><dc:creator>Acuity Institute</dc:creator><dc:language>en</dc:language><meta property="dcterms:modified">2026-11-17T00:00:00Z</meta></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="style" href="guide.css" media-type="text/css"/>${pages.map(page => `<item id="${page.id}" href="${page.href}" media-type="application/xhtml+xml"/><item id="art-${page.cue}" href="${page.art}" media-type="image/svg+xml"/>`).join('')}</manifest>
<spine>${pages.map(page => `<itemref idref="${page.id}"/>`).join('')}</spine></package>`);
  zip.file('EPUB/guide.css', guideStyle);
  zip.file('EPUB/nav.xhtml', document('Contents', `<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${pages.map(page => `<li><a href="${page.href}">${escape(page.title)}</a></li>`).join('')}</ol></nav>`, 'xmlns:epub="http://www.idpf.org/2007/ops"'));
  for (const page of pages) {
    zip.file(`EPUB/${page.art}`, figureSvg(page.cue));
    const content = `<section class="practice-page" aria-labelledby="practice-title"><header><small>ACUITY INSTITUTE · READER PRACTICE</small></header><h1 id="practice-title">${escape(page.title)}</h1>
<figure><img src="${page.art}" alt="${escape(page.diagramAlt)}"/></figure>${page.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</section>`;
    zip.file(`EPUB/${page.href}`, document(page.title, content));
  }
  const markdown = [`# ${title}`, ...chapters.flatMap(chapter => [`## ${chapter.title}`, ...chapter.paragraphs])].join('\n\n') + '\n';
  const directory = path.join(root, 'public/library');
  await Promise.all([
    fs.writeFile(path.join(directory, id + '.epub'), await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })),
    fs.writeFile(path.join(directory, id + '.md'), markdown),
  ]);
}
