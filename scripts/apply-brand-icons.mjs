import fs from 'node:fs';
const brands = JSON.parse(fs.readFileSync(new URL('../src/data/brandIcons.json', import.meta.url), 'utf8'));

export function withBrandIcons(html, brand) {
  const links = brands[brand];
  if (!links) return html;
  return html.replace(/<link\b[^>]*\brel="(?:icon|apple-touch-icon|manifest)"[^>]*>\s*/g, '')
    .replace('</head>', links.map(attributes => '<link ' + Object.entries(attributes).map(([key, value]) => key + '="' + value + '"').join(' ') + ' />').join('\n') + '\n</head>');
}
