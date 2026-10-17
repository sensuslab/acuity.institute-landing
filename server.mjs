import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const DIST = path.join(__dirname, 'dist');
const SHORTS_DIR = process.env.SHORTS_DIR || '/data/shorts';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
  '.epub': 'application/epub+zip', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.wasm': 'application/wasm',
};
function safeJoin(root, decoded) {
  const joined = path.resolve(root, '.' + '/' + decoded.replace(/^\/+/, ''));
  return joined === path.resolve(root) || joined.startsWith(path.resolve(root) + path.sep) ? joined : null;
}
function sendFile(req, res, filePath, { immutable = false } = {}) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const total = stat.size;
    const headers = {
      'Content-Type': type, 'Accept-Ranges': 'bytes',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
      'X-Content-Type-Options': 'nosniff',
    };
    let start = 0, end = total - 1, status = 200;
    // RFC 9110: Range applies to GET, not HEAD. One range is sufficient for PDF.js and video.
    if (req.headers.range && req.method === 'GET') {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, {...headers, 'Content-Range': `bytes */${total}`}).end(); return; }
      if (!match[1]) { start = Math.max(0, total - Number(match[2])); }
      else { start = Number(match[1]); if (match[2]) end = Math.min(Number(match[2]), total - 1); }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= total) {
        res.writeHead(416, {...headers, 'Content-Range': `bytes */${total}`}).end(); return;
      }
      status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
    }
    res.writeHead(status, {...headers, 'Content-Length': Math.max(0, end - start + 1)});
    if (req.method === 'HEAD' || total === 0) { res.end(); return; }
    const stream = fs.createReadStream(filePath, {start, end});
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}
const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').includes('..')) throw new Error('Invalid path');
  } catch { res.writeHead(400).end('Bad request'); return; }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,HEAD,OPTIONS', 'Access-Control-Allow-Headers':'Range'}).end(); return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD, OPTIONS'}).end(); return; }
  if (pathname === '/health') { res.writeHead(200, {'Content-Type':'text/plain'}).end(req.method === 'HEAD' ? undefined : 'ok'); return; }
  if (pathname.startsWith('/shorts/')) {
    const file = safeJoin(SHORTS_DIR, pathname.slice('/shorts/'.length));
    if (!file) { res.writeHead(400).end('Bad request'); return; }
    sendFile(req, res, file, {immutable: true}); return;
  }
  const diskPath = safeJoin(DIST, pathname);
  if (!diskPath) { res.writeHead(400).end('Bad request'); return; }
  fs.stat(diskPath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      if (!pathname.endsWith('/')) {
        const query = new URL(req.url || '/', 'http://localhost').search;
        res.writeHead(308, {Location: pathname + '/' + query}).end(); return;
      }
      sendFile(req, res, path.join(diskPath, 'index.html')); return;
    }
    if (!err && stat.isFile()) { sendFile(req, res, diskPath); return; }
    // Never return the SPA's HTML with status 200 for missing books, metadata or unknown pages.
    res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}).end(req.method === 'HEAD' ? undefined : '<!doctype html><title>Not found | Acuity Institute</title><h1>Page not found</h1><p><a href="/library/">Browse the Acuity Library</a></p>');
  });
});
server.listen(PORT, '0.0.0.0', () => console.log(`acuity-landing listening on ${PORT}; shorts from ${SHORTS_DIR}`));
