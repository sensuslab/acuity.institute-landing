import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const port = 29000 + Math.floor(Math.random() * 6000);
const origin = 'http://127.0.0.1:' + port;
const shorts = fs.mkdtempSync(path.join(os.tmpdir(), 'acuity-tools-'));
let server;
before(async () => {
  server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port), SHORTS_DIR: shorts }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Tool route server did not start')), 5000);
    server.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    server.once('error', reject);
  });
});
after(() => { server?.kill(); fs.rmSync(shorts, { recursive: true, force: true }); });

test('Direct tool-page requests serve full branded content with their own metadata', async () => {
  for (const [slug, name, content] of [
    ['', 'The Tools', 'Many ways in.'], ['agent/', 'Acuity.Agent', 'Many traditions.'],
    ['codex/', 'Acuity.Codex', 'Context Spheres'], ['library/', 'The Library', 'Virtual e-reader'],
    ['search/', 'Acuity.Search', 'Discover freely.'], ['wisdomvault/', 'WisdomVault', 'Under development'],
  ]) {
    const route = '/tools/' + slug;
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.ok(html.includes('<title>' + name + ' — Acuity.Institute</title>'), route);
    assert.ok(html.includes('href="https://acuity.institute' + route + '"'), route);
    assert.ok(html.includes(content), route + ' must contain rendered content before JavaScript');
    assert.ok(html.includes('Coming soon') || html.includes('coming soon'), route);
    assert.ok(!html.includes('20,000'), 'Unrelated homepage structured data must not leak into tools');
    const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    assert.equal(graphs.length, 1);
    assert.equal(graphs[0].url, 'https://acuity.institute' + route);
    assert.equal((await fetch(origin + route, { method: 'HEAD' })).status, 200);
  }
});
test('Tool canonical redirects retain query strings; unknown pages remain 404', async () => {
  const response = await fetch(origin + '/tools/codex?from=library', { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get('location'), '/tools/codex/?from=library');
  assert.equal((await fetch(origin + '/tools/not-a-tool/')).status, 404);
  assert.equal((await fetch(origin + '/tools/search/', { method: 'POST' })).status, 405);
});
test('Every new sitemap tool URL resolves to an implemented route', async () => {
  const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>(https:\/\/acuity\.institute\/tools\/[^<]*)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 6);
  for (const url of urls) assert.equal((await fetch(origin + new URL(url).pathname)).status, 200, url);
});
