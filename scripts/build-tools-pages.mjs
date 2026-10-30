import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const cachedRenderer = path.join(root, 'node_modules/.cache/acuity-tools-render.mjs');
await build({
  entryPoints: [path.join(root, 'scripts/render-tool-pages.tsx')],
  outfile: cachedRenderer, bundle: true, platform: 'node', format: 'esm',
  packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' },
});
const { pages, renderPage } = await import(pathToFileURL(cachedRenderer).href);
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

for (const page of pages) {
  const title = escape(page.title + ' — Acuity.Institute');
  const description = escape(page.description);
  const canonical = 'https://acuity.institute' + page.path;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, '<title>' + title + '</title>')
    .replace(/(<meta name="description" content=")[^"]*(")/, '$1' + description + '$2')
    .replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + canonical + '$2')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  for (const [key, value] of Object.entries({ 'og:title': title, 'og:description': description, 'og:url': canonical, 'twitter:title': title, 'twitter:description': description })) {
    html = html.replace(new RegExp('(<meta (?:property|name)="' + key + '" content=")[^"]*(")'), '$1' + value + '$2');
  }
  const structured = { '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url: canonical, isPartOf: { '@type': 'WebSite', name: 'Acuity.Institute', url: 'https://acuity.institute/' } };
  html = html.replace('</head>', '<script type="application/ld+json">' + JSON.stringify(structured).replaceAll('<', '\\u003c') + '</script>\n</head>');
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, () => '<div id="root">' + renderPage(page) + '</div>');
  const directory = path.join(dist, page.path);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), html);
}
const sitemapPath = path.join(dist, 'sitemap.xml');
let sitemap = await fs.readFile(sitemapPath, 'utf8');
sitemap = sitemap.replace('</urlset>', pages.map(page => '<url><loc>https://acuity.institute' + page.path + '</loc></url>').join('\n') + '\n</urlset>');
await fs.writeFile(sitemapPath, sitemap);
console.log('Rendered ' + pages.length + ' tool routes with full content, individual metadata and canonical URLs.');
