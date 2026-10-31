import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const outfile = path.resolve('node_modules/.cache/ecosystem-interaction-test.mjs');
await build({ entryPoints: ['tests/fixtures/ecosystem-interaction.tsx'], outfile, bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' } });

test('Ecosystem hover, touch-sized selection and service destinations remain usable', async () => {
  const { window, document } = parseHTML('<html><body><div id="root"></div></body></html>');
  const keys = ['window', 'document', 'ResizeObserver', 'Event', 'IS_REACT_ACT_ENVIRONMENT'];
  const before = keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  let narrow = false;
  window.matchMedia = query => ({ matches: query.includes('max-width') ? narrow : query.includes('min-width') ? !narrow : true });
  window.HTMLElement.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 200, height: 100 });
  let detailScrolls = 0;
  window.HTMLElement.prototype.scrollIntoView = () => { detailScrolls++; };
  const observer = class { observe() {} disconnect() {} };
  for (const [key, value] of Object.entries({ window, document, ResizeObserver: observer, Event: window.Event, IS_REACT_ACT_ENVIRONMENT: true })) Object.defineProperty(globalThis, key, { configurable: true, value });
  let harness;
  try {
    const { mountEcosystem } = await import(pathToFileURL(outfile).href);
    harness = await mountEcosystem(document.getElementById('root'));
    const selected = () => document.querySelector('.eco-detail h3').textContent;
    assert.equal(selected(), 'Acuity.Codex');
    await harness.hover('library');
    assert.equal(selected(), 'The Library', 'A pointer can preview an instrument without navigation');
    assert.equal(document.querySelectorAll('.eco-node-select[aria-pressed=true]').length, 1);
    assert.equal(document.querySelector('.eco-node-search a').getAttribute('href'), '/tools/search');
    assert.equal(document.querySelector('.eco-node-media a').getAttribute('href'), '/?media=webinars');
    assert.equal(document.querySelector('.eco-node-lumennous a').getAttribute('href'), 'https://lumennous.acuity.institute');
    assert.equal(document.querySelector('.eco-node-wisdomvault a'), null, 'The future connection has no active destination');
    narrow = true;
    await harness.select('The Library');
    assert.equal(detailScrolls, 1, 'A narrow-screen selection brings its details into view');
    await harness.hover('myaeon');
    assert.equal(selected(), 'The Library', 'Scrolling past another card cannot overwrite the chosen mobile detail');
    await harness.select('Acuity.Search');
    assert.equal(selected(), 'Acuity.Search');
    assert.equal(document.querySelector('.eco-detail-heading a').getAttribute('href'), '/tools/search');
  } finally {
    if (harness) await harness.close();
    for (const [key, descriptor] of before) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
