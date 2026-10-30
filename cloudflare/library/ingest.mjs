import {authenticated} from './worker.mjs';
export default {async fetch(request,env) {
  if (!await authenticated(request,env.INGEST_TOKEN)) return new Response('Unauthorized',{status:401});
  try {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/publish/')) {
      const key = url.pathname.slice('/publish/'.length);
      if (request.method !== 'PUT' || !/^(library\/catalogues\/[a-z0-9.-]+\.json|library\/control\/(published-policy|policy-[a-z0-9.-]+)\.json)$/.test(key)) return new Response('Invalid publication target',{status:400});
      const hash = request.headers.get('X-Content-SHA256');
      if (!/^[a-f0-9]{64}$/.test(hash || '') || Number(request.headers.get('Content-Length')) > 5000000) return new Response('Invalid publication identity',{status:400});
      const mutable = key.endsWith('/latest.json') || key.endsWith('/public-latest.json') || key.endsWith('/published-policy.json');
      if (!mutable) {
        const existing = await env.LIBRARY.head(key);
        if (existing) {
          const stored = existing.checksums.sha256 && [...new Uint8Array(existing.checksums.sha256)].map(n=>n.toString(16).padStart(2,'0')).join('');
          return stored === hash ? Response.json({key,bytes:existing.size,sha256:hash,resumed:true}) : new Response('Immutable release differs',{status:409});
        }
      }
      const result = await env.LIBRARY.put(key,request.body,{sha256:hash,onlyIf:mutable ? undefined : {etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{sha256:hash}});
      return result ? Response.json({key,bytes:result.size,sha256:hash}) : new Response('Immutable release already exists',{status:409});
    }
    const digest = url.pathname.slice(1);
    if (!/^[a-f0-9]{64}$/.test(digest)) return new Response('Invalid asset',{status:400});
    const registry = await (await env.LIBRARY.get('library/control/ingest-inventory.json')).json();
    const asset = registry.assets.find(item=>item.sha256===digest);
    if (!asset) return new Response('Unknown asset',{status:404});
    if (request.method === 'GET' || request.method === 'HEAD') {
      const object = await env.LIBRARY.get(asset.key);
      if (!object) return new Response('Not found',{status:404});
      return new Response(request.method === 'HEAD' ? null : object.body,{headers:{'Content-Type':asset.mime,'Content-Length':String(object.size),'Cache-Control':'no-store'}});
    }
    if (!['POST','PUT'].includes(request.method)) return new Response('Method not allowed',{status:405});
    const existing = await env.LIBRARY.head(asset.key);
    if (existing) {
      const hash = existing.checksums.sha256 && [...new Uint8Array(existing.checksums.sha256)].map(n=>n.toString(16).padStart(2,'0')).join('');
      if (existing.size !== asset.bytes || hash !== digest) return new Response('Existing object failed identity check',{status:409});
      return Response.json({key:asset.key,bytes:existing.size,sha256:hash,resumed:true});
    }
    let body = request.body;
    if (request.method === 'POST') {
      const source = new URL(asset.sourceUrl);
      if (source.protocol !== 'https:' || !['www.dropbox.com','dl.dropboxusercontent.com','archive.org'].includes(source.hostname)) return new Response('Source not permitted',{status:400});
      const upstream = await fetch(source,{signal:AbortSignal.timeout(240000)});
      if (!upstream.ok || !upstream.body) return new Response(`Source status ${upstream.status}`,{status:502});
      body = upstream.body;
    }
    if (!body) return new Response('Missing body',{status:400});
    // R2 validates the expected SHA-256 while streaming and rejects a mismatch.
    const object = await env.LIBRARY.put(asset.key,body,{sha256:digest,onlyIf:{etagDoesNotMatch:'*'},
      httpMetadata:{contentType:asset.mime,contentDisposition:`inline; filename*=UTF-8''${encodeURIComponent(asset.originalFilename).replace(/'/g,'%27')}`},
      customMetadata:{sha256:digest,role:asset.role,visibility:asset.visibility}});
    if (!object) return new Response('Concurrent upload; retry',{status:409});
    if (object.size !== asset.bytes) return new Response('Size mismatch',{status:409});
    return Response.json({key:asset.key,bytes:object.size,sha256:digest});
  } catch (error) {
    console.error(JSON.stringify({event:'library_ingest_error',message:String(error).slice(0,250)}));
    return new Response('Transfer failed; object not verified',{status:502});
  }
}};
