import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const outfile = path.resolve('node_modules/.cache/scroll-film-test.mjs');
await build({ entryPoints: ['tests/fixtures/scroll-film.tsx'], outfile, bundle: true, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' } });

test('The films appear at the requested editorial boundaries and preserve the overview timestamp', async () => {
  for (const [route, film, nextSection] of [['tools', 'tools', '#ecosystem'], ['tools/agent', 'agent', '#capabilities'], ['tools/codex', 'codex', '#product-views'], ['tools/search', 'search', '#product-views']]) {
    const { document } = parseHTML(fs.readFileSync('dist/' + route + '/index.html', 'utf8'));
    const figure = document.querySelector('[data-film="' + film + '"]');
    assert.ok(figure, route);
    assert.equal(figure.nextElementSibling, document.querySelector(nextSection), route + ': film precedes the requested section');
    assert.equal(figure.querySelector('iframe'), null, 'No player is requested during initial render');
    assert.ok(figure.querySelector('a[href^="https://www.youtube.com/watch?"]'));
  }
  const { renderPhilosophy } = await import(pathToFileURL(outfile).href);
  const { document } = parseHTML(renderPhilosophy());
  const film = document.querySelector('[data-film="philosophy"]');
  assert.match(film.parentElement.previousElementSibling.textContent, /Enlightening pathways of understanding/);
  assert.match(film.querySelector('a').getAttribute('href'), /v=Dv4jUE_RDSw&t=159s$/);
});

test('Scroll films mute before playing, obey visibility and motion, coordinate playback and clean up', async () => {
  const { window, document } = parseHTML('<html><head></head><body><div id="root"></div></body></html>');
  const keys = ['window', 'document', 'IntersectionObserver', 'IS_REACT_ACT_ENVIRONMENT'];
  const saved = keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  const observers = [];
  const players = [];
  const changes = new Set();
  const motion = { matches: false, addEventListener: (_, callback) => changes.add(callback), removeEventListener: (_, callback) => changes.delete(callback) };
  window.matchMedia = () => motion;
  window.location = { origin: 'https://acuity.institute' };
  Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
  const Observer = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.disconnected = true; }
  };
  const Player = class {
    constructor(element, options) {
      this.options = options; this.calls = []; this.playing = false;
      this.iframe = document.createElement('iframe'); element.replaceWith(this.iframe); players.push(this);
    }
    getIframe() { return this.iframe; }
    mute() { this.calls.push('mute'); }
    setVolume(volume) { this.calls.push('volume:' + volume); }
    playVideo() { this.calls.push('play'); if (!this.playing) { this.playing = true; this.options.events.onStateChange({ data: 1, target: this }); } }
    pauseVideo() { this.calls.push('pause'); if (this.playing) { this.playing = false; this.options.events.onStateChange({ data: 2, target: this }); } }
    seekTo(seconds) { this.calls.push('seek:' + seconds); }
    destroy() { this.destroyed = true; this.iframe.remove(); }
    ready() { this.options.events.onReady({ target: this }); }
  };
  window.YT = { Player };
  for (const [key, value] of Object.entries({ window, document, IntersectionObserver: Observer, IS_REACT_ACT_ENVIRONMENT: true })) Object.defineProperty(globalThis, key, { configurable: true, value });
  const observe = (film, near, ratio) => {
    for (const observer of observers.filter(observer => !observer.disconnected)) {
      const target = observer.targets.find(target => target.closest('[data-film]')?.getAttribute('data-film') === film);
      if (target && Boolean(observer.options.rootMargin) === near) observer.callback([{ target, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
    }
  };
  let harness;
  try {
    const { mountFilms, setFilmOverlayActive } = await import(pathToFileURL(outfile).href);
    harness = await mountFilms(document.getElementById('root'));
    await harness.step(() => observe('codex', true, 0.1));
    const codex = players.at(-1);
    assert.equal(codex.options.host, 'https://www.youtube-nocookie.com');
    assert.equal(codex.options.playerVars.controls, 0);
    assert.equal(codex.options.playerVars.autoplay, 0, 'Initial loading must not play an off-screen film');
    assert.equal(codex.options.playerVars.playsinline, 1);
    assert.equal(codex.getIframe().getAttribute('allow'), 'autoplay; encrypted-media; picture-in-picture');
    await harness.step(() => codex.ready());
    assert.equal(codex.playing, false);
    await harness.step(() => observe('codex', false, 0.5));
    assert.equal(codex.playing, false, 'More than half must be visible');
    await harness.step(() => observe('codex', false, 0.6));
    const firstPlay = codex.calls.indexOf('play');
    assert.deepEqual(codex.calls.slice(firstPlay - 2, firstPlay + 1), ['mute', 'volume:0', 'play']);
    assert.equal(codex.playing, true);
    await harness.step(() => codex.options.events.onStateChange({ data: 3, target: codex }));
    assert.match(document.querySelector('[data-film="codex"] button').getAttribute('aria-label'), /^Pause/, 'Buffering can still be paused');
    await harness.click();
    await harness.step(() => codex.options.events.onStateChange({ data: 3, target: codex }));
    assert.equal(document.querySelector('[data-film="codex"]').getAttribute('data-playback'), 'paused', 'A late buffering event cannot undo a deliberate pause');
    await harness.step(() => { observe('codex', false, 0); observe('codex', false, 0.8); });
    assert.equal(codex.playing, false, 'A deliberate pause persists across scrolling');
    await harness.click();
    await harness.step(() => { document.hidden = true; document.dispatchEvent(new window.Event('visibilitychange')); });
    assert.equal(codex.playing, false);
    await harness.step(() => { document.hidden = false; document.dispatchEvent(new window.Event('visibilitychange')); });
    assert.equal(codex.playing, true);
    await harness.step(() => setFilmOverlayActive(true));
    assert.equal(codex.playing, false, 'Webinars and Shorts suspend the background film');
    await harness.step(() => setFilmOverlayActive(false));
    assert.equal(codex.playing, true);
    await harness.step(() => codex.options.events.onAutoplayBlocked());
    await harness.step(() => { observe('codex', false, 0); observe('codex', false, 0.8); });
    assert.match(document.querySelector('[role=status]').textContent, /Select Play/);
    await harness.click();
    assert.equal(codex.playing, true, 'A user gesture retries blocked autoplay');

    await harness.render(['codex', 'search']);
    await harness.step(() => { observe('search', true, 1); observe('search', false, 0.8); });
    const search = players.at(-1);
    await harness.step(() => search.ready());
    assert.equal(search.playing, true);
    assert.equal(codex.playing, false, 'Only one film can autoplay at a time');
    await harness.step(() => { motion.matches = true; changes.forEach(callback => callback()); });
    assert.equal(search.playing, false, 'Switching to reduced motion stops playback');
    await harness.render(['philosophy']);
    const before = players.length;
    await harness.step(() => { observe('philosophy', true, 1); observe('philosophy', false, 1); });
    assert.equal(players.length, before, 'Reduced motion leaves a poster until requested');
    await harness.click('philosophy');
    const overview = players.at(-1);
    assert.equal(overview.options.playerVars.start, 159);
    await harness.step(() => overview.ready());
    assert.equal(overview.playing, true);
    await harness.step(() => overview.options.events.onError());
    assert.match(document.querySelector('[role=status]').textContent, /could not load/);
    assert.equal(overview.destroyed, true);
    await harness.click('philosophy');
    assert.notEqual(players.at(-1), overview, 'A failed player can be retried');
    await harness.close(); harness = undefined;
    assert.ok(players.every(player => player.destroyed));
    assert.ok(observers.every(observer => observer.disconnected), 'StrictMode and unmount release all observers');
    assert.equal(changes.size, 0);

    // The shared API may finish loading after navigation; it must not mount a stale player.
    window.YT = undefined;
    motion.matches = false;
    harness = await mountFilms(document.getElementById('root'), ['agent']);
    await harness.step(() => observe('agent', true, 1));
    assert.equal(document.querySelectorAll('script[src="https://www.youtube.com/iframe_api"]').length, 1);
    const playerCount = players.length;
    await harness.close(); harness = undefined;
    window.YT = { Player };
    window.onYouTubeIframeAPIReady();
    await Promise.resolve();
    assert.equal(players.length, playerCount);
  } finally {
    if (harness) await harness.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
