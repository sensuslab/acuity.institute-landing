import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

const outfile = path.resolve('node_modules/.cache/metadata-navigation-test.mjs');
await build({ entryPoints: ['tests/fixtures/metadata-navigation.tsx'], outfile, bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic' });
const metadataBundle = await build({ entryPoints: ['src/lib/pageMetadata.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { metadataForPath, applyPageMetadata } = await import('data:text/javascript;base64,' + Buffer.from(metadataBundle.outputFiles[0].text).toString('base64'));

test('Direct tool arrival followed by Home, Library and browser back uses destination metadata', async () => {
  const { window, document } = parseHTML(fs.readFileSync('dist/tools/codex/index.html', 'utf8'));
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const previousAct = Object.getOwnPropertyDescriptor(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: window });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });
  let harness;
  try {
    const { mountMetadataNavigation } = await import(pathToFileURL(outfile).href);
    harness = await mountMetadataNavigation(document.getElementById('root'), '/tools/codex/');
    const check = (title, canonical) => {
      assert.equal(document.title, title);
      assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), canonical);
      assert.equal(document.querySelector('meta[property="og:url"]').content, canonical);
      assert.equal(document.querySelector('meta[property="og:title"]').content, title);
      assert.equal(document.querySelector('meta[name="twitter:title"]').content, title);
      const product = canonical.includes('/library') ? 'library' : canonical.match(/\/tools\/(agent|codex|search)\//)?.[1];
      assert.equal(document.querySelector('link[rel="icon"]').getAttribute('href'), product ? '/tools/icons/' + product + '/favicon.ico' : '/favicon.ico');
      const graphs = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
      assert.equal(graphs.length, 1);
      assert.equal(graphs[0].url, canonical);
    };
    check('Acuity.Codex — Acuity.Institute', 'https://acuity.institute/tools/codex/');
    await harness.go('/');
    check('Acuity Institute | Pathways to Wisdom', 'https://acuity.institute/');
    await harness.go('/library?format=pdf');
    check('Open Library | Ancient Wisdom & Philosophy | Acuity Institute', 'https://acuity.institute/library/');
    await harness.go('/tools/search/');
    check('Acuity.Search — Acuity.Institute', 'https://acuity.institute/tools/search/');
    await harness.go(-1);
    check('Open Library | Ancient Wisdom & Philosophy | Acuity Institute', 'https://acuity.institute/library/');
    await harness.go(-1);
    check('Acuity Institute | Pathways to Wisdom', 'https://acuity.institute/');
  } finally {
    if (harness) await harness.close();
    for (const [key, descriptor] of [['window', previousWindow], ['document', previousDocument], ['IS_REACT_ACT_ENVIRONMENT', previousAct]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test('Initial Library metadata retains its rich catalogue and query strings are not canonical', () => {
  const { document } = parseHTML(fs.readFileSync('dist/library/index.html', 'utf8'));
  const before = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => node.textContent);
  applyPageMetadata(document, metadataForPath('/library/?book=meditations#catalogue'));
  const after = [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => node.textContent);
  assert.deepEqual(after, before);
  assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), 'https://acuity.institute/library/');
  assert.equal(metadataForPath('/tools/codex').path, '/tools/codex/');
  assert.equal(metadataForPath('/tools/not-a-tool/'), undefined);
  assert.equal(metadataForPath('/?q=tao', 'library.acuity.institute').path, '/library/');
  assert.equal(metadataForPath('/', 'acuity.institute').path, '/');
});

test('Every tool tab, disclosure and skip link points to an existing destination', () => {
  for (const route of ['tools', 'tools/agent', 'tools/codex', 'tools/library', 'tools/search', 'tools/wisdomvault']) {
    const { document } = parseHTML(fs.readFileSync('dist/' + route + '/index.html', 'utf8'));
    for (const control of document.querySelectorAll('[aria-controls],[aria-labelledby]')) {
      for (const attribute of ['aria-controls', 'aria-labelledby']) {
        for (const id of (control.getAttribute(attribute) || '').split(/\s+/).filter(Boolean)) {
          assert.ok(document.getElementById(id), route + ': missing ' + attribute + ' destination ' + id);
        }
      }
    }
    assert.ok(document.querySelector('a[href="#main"]'));
    assert.equal(document.getElementById('main').tabIndex, -1);
    const panels = [...document.querySelectorAll('[role=tabpanel]')];
    if (panels.length) {
      assert.equal(panels.filter(panel => !panel.hasAttribute('hidden')).length, 1);
      assert.equal(document.querySelectorAll('[role=tab]').length, panels.length);
    }
  }
});
