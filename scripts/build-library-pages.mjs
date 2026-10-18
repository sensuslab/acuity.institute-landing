import fs from 'node:fs';
const books = JSON.parse(fs.readFileSync('src/data/libraryCatalogue.json', 'utf8'));
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const title = 'Open Library | Ancient Wisdom & Philosophy | Acuity Institute';
const description = 'Read and download PDF and EPUB editions of ancient wisdom, philosophy and esoteric traditions. Explore source editions in the Acuity open library.';
let html = fs.readFileSync('dist/index.html', 'utf8');
html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
  .replace(/(<link rel="canonical" href=")[^"]*/, '$1https://acuity.institute/library/')
  .replace(/(<meta property="og:url" content=")[^"]*/, '$1https://acuity.institute/library/')
  .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, `$1${title}`)
  .replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]*/g, `$1${description}`);
const list = books.map(book => `<article><h2>${escape(book.title)}</h2><p>${escape(book.author)}${book.translator ? ' — '+escape(book.translator) : ''}</p><p>${escape(book.description)}</p><p>${escape(book.editionNote)}</p><p>${escape(book.categoryLabel)}</p>${book.pdf ? `<a href="${escape(book.pdf)}">Read or download PDF</a>` : ''} ${book.epub ? `<a href="${escape(book.epub)}" download>Download EPUB</a>` : ''}${book.sourceUrl ? `<p><a href="${escape(book.sourceUrl)}">Edition source</a></p>` : ''}</article>`).join('\n');
html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root"><main><h1>The Acuity Open Library</h1><p>${description}</p>${list}<p><a href="/">Back to Acuity Institute</a></p></main></div>`);
const structured = {'@context':'https://schema.org','@type':'CollectionPage', '@id':'https://acuity.institute/library/#collection', url:'https://acuity.institute/library/', name:'Acuity Open Library', description, isPartOf:{'@id':'https://acuity.institute/#website'}, mainEntity:{'@type':'ItemList',itemListElement:books.map((book,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Book',name:book.title,author:{'@type':book.author === 'Three Initiates' ? 'Organization' : 'Person',name:book.author},inLanguage:book.language,url:`https://acuity.institute/library/?book=${book.id}`,isBasedOn:book.sourceUrl || undefined,encoding:[book.pdf && {'@type':'MediaObject',encodingFormat:'application/pdf',contentUrl:'https://acuity.institute'+book.pdf},book.epub && {'@type':'MediaObject',encodingFormat:'application/epub+zip',contentUrl:'https://acuity.institute'+book.epub}].filter(Boolean)}}))}};
html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script></head>`);
fs.mkdirSync('dist/library', {recursive:true}); fs.writeFileSync('dist/library/index.html',html);
const urls = ['/', '/library/', '/about/'];
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>https://acuity.institute${url}</loc></url>`).join('')}</urlset>\n`);
console.log(`Generated library HTML, metadata and sitemap for ${books.length} books.`);

// Serve the matching decoder/font assets locally, including support for future scanned editions.
for (const dir of ['standard_fonts', 'cmaps', 'wasm']) {
  fs.cpSync(`node_modules/pdfjs-dist/${dir}`, `dist/pdfjs/${dir}`, {recursive:true});
}
fs.copyFileSync('node_modules/pdfjs-dist/LICENSE','dist/pdfjs/LICENSE');
