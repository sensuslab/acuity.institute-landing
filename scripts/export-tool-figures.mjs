import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const outfile = path.resolve('node_modules/.cache/export-tool-figures.mjs');
await build({ entryPoints: ['scripts/export-tool-figures.tsx'], outfile, bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic' });
const { figures, renderFigure } = await import(pathToFileURL(outfile).href);
const destination = path.resolve('public/tools/figures');
await fs.mkdir(destination, { recursive: true });
for (const figure of figures) {
  await fs.writeFile(path.join(destination, figure.file + '.svg'), renderFigure(figure.kind));
  console.log('Exported ' + figure.title);
}
