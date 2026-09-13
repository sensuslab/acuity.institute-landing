import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const DIST = path.join(__dirname, 'dist');
const SHORTS_DIR = process.env.SHORTS_DIR || '/data/shorts';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split('?')[0]);
  const joined = path.normalize(path.join(root, decoded));
  if (!joined.startsWith(path.normalize(root + path.sep)) && joined !== path.normalize(root)) {
    return null;
  }
  return joined;
}

function sendFile(req, res, filePath, { immutable = false } = {}) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }

    const type = contentType(filePath);
    const total = stat.size;
    const range = req.headers.range;

    const cache =
      type.startsWith('video/') || immutable
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=300';

    if (range && type.startsWith('video/')) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` }).end();
        return;
      }
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : total - 1;
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` }).end();
        return;
      }
      const chunkEnd = Math.min(end, total - 1);
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${chunkEnd}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkEnd - start + 1,
        'Content-Type': type,
        'Cache-Control': cache,
        'Access-Control-Allow-Origin': '*',
      });
      fs.createReadStream(filePath, { start, end: chunkEnd }).pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Cache-Control': cache,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length',
    }).end();
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    return;
  }

  if (pathname.startsWith('/shorts/')) {
    const rel = pathname.slice('/shorts/'.length);
    if (!rel || rel.includes('..')) {
      res.writeHead(400).end('Bad request');
      return;
    }
    const filePath = safeJoin(SHORTS_DIR, rel);
    if (!filePath) {
      res.writeHead(400).end('Bad request');
      return;
    }
    sendFile(req, res, filePath, { immutable: true });
    return;
  }

  // Static SPA assets from Vite build
  const assetPath = pathname === '/' ? '/index.html' : pathname;
  const diskPath = safeJoin(DIST, assetPath);
  if (diskPath && fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
    sendFile(req, res, diskPath);
    return;
  }

  // Client-side routing fallback
  sendFile(req, res, path.join(DIST, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`acuity-landing listening on ${PORT}; shorts from ${SHORTS_DIR}`);
});
