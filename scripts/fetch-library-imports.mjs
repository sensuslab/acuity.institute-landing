import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {Readable, Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';

async function matches(file, entry) {
  try {
    if (fs.statSync(file).size !== entry.bytes) return false;
    const hash = createHash('sha256');
    for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
    return hash.digest('hex') === entry.sha256;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

// Imported binaries are pinned to reviewed bytes, then served locally by the app.
// No Dropbox requests, credentials or temporary download links reach the reader.
export async function hydrateLibraryImports({root, manifestPath = path.join(root, 'content/library-imports.json'),
  fetchImpl = globalThis.fetch, concurrency = 4, attempts = 3, timeoutMs = 120_000, log = console.log} = {}) {
  if (!fs.existsSync(manifestPath)) return {downloaded: 0, cached: 0};
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.files)) throw new Error('Unsupported library import manifest');
  const seen = new Set();
  const jobs = manifest.files.map(entry => {
    if (!/^public\/library\/books\/.+\.pdf$/.test(entry.path || '') || entry.path.includes('\\') ||
      entry.path.split('/').some(part => !part || part === '.' || part === '..') || seen.has(entry.path.toLowerCase())) {
      throw new Error(`Invalid or duplicate imported PDF path: ${entry.path}`);
    }
    seen.add(entry.path.toLowerCase());
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes < 5 || !/^[a-f0-9]{64}$/.test(entry.sha256 || '') ||
      new URL(entry.sourceUrl).protocol !== 'https:') throw new Error(`Invalid import identity: ${entry.path}`);
    return {...entry, target: path.join(root, entry.path)};
  });
  const result = {downloaded: 0, cached: 0};
  let next = 0;
  const errors = [];
  async function worker() {
    while (next < jobs.length && !errors.length) {
      const entry = jobs[next++];
      try {
        if (await matches(entry.target, entry)) {result.cached++; continue;}
        fs.mkdirSync(path.dirname(entry.target), {recursive: true});
        for (let attempt = 1; attempt <= attempts; attempt++) {
          const temporary = entry.target + '.' + randomUUID() + '.part';
          try {
            const response = await fetchImpl(entry.sourceUrl, {signal: AbortSignal.timeout(timeoutMs)});
            if (response.status !== 200 || !response.body) {
              await response.body?.cancel();
              throw new Error(`Download returned HTTP ${response.status}`);
            }
            let bytes = 0;
            const limit = new Transform({transform(chunk, encoding, done) {
              bytes += chunk.length;
              done(bytes > entry.bytes ? new Error('Source exceeds pinned file size') : null, chunk);
            }});
            await pipeline(Readable.fromWeb(response.body), limit, fs.createWriteStream(temporary, {flags: 'wx'}));
            if (!(await matches(temporary, entry))) throw new Error('Source size or SHA-256 differs from reviewed PDF');
            fs.renameSync(temporary, entry.target);
            result.downloaded++;
            log(`Fetched ${result.downloaded + result.cached}/${jobs.length}: ${path.basename(entry.path)}`);
            break;
          } catch (error) {
            if (attempt === attempts) throw new Error(`${entry.path}: ${error.message}`);
          } finally {
            fs.rmSync(temporary, {force: true});
          }
        }
      } catch (error) {errors.push(error);}
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, jobs.length)}, worker));
  if (errors.length) throw new AggregateError(errors, 'Library import failed; catalogue build stopped');
  if (jobs.length) log(`Verified ${jobs.length} imported PDFs (${result.downloaded} fetched, ${result.cached} cached).`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await hydrateLibraryImports({root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')});
}
