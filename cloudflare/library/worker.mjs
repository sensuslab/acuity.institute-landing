const ASSET = /^library\/assets\/[a-f0-9]{64}\.(pdf|epub|pptx|txt|md)$/;
const encoder = new TextEncoder();
/** @param {Request} request @param {string | undefined} secret */
export async function authenticated(request, secret) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  if (!secret || !token) return false;
  const [actual, expected] = await Promise.all([token, secret].map(value => crypto.subtle.digest('SHA-256', encoder.encode(value))));
  return crypto.subtle.timingSafeEqual(actual, expected);
}
/** @param {string | null} value @param {number} size */
export function byteRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value || '');
  if (!match || (!match[1] && !match[2])) return null;
  let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  let end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if ((!match[1] && Number(match[2]) === 0) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) return null;
  return {offset:start, length:end-start+1};
}
/** @param {Request} request @param {Env} env */
function cors(request, env) {
  const headers = new Headers({'Vary':'Origin', 'X-Content-Type-Options':'nosniff'});
  const origin = request.headers.get('Origin');
  if ((env.ALLOWED_ORIGINS || '').split(',').includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range, If-None-Match, If-Modified-Since, If-Range, Authorization');
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified, Content-Disposition');
    headers.set('Access-Control-Max-Age', '3600');
  }
  return headers;
}
/** @param {Request} request @param {Env} env */
export async function serve(request, env) {
  const headers = cors(request, env);
  const reply = (text, status) => new Response(request.method === 'HEAD' ? null : text, {status, headers});
  if (request.method === 'OPTIONS') return reply(null, 204);
  if (!['GET','HEAD'].includes(request.method)) {headers.set('Allow','GET, HEAD, OPTIONS');return reply('Method not allowed',405);}
  const url = new URL(request.url);
  if (url.pathname === '/health') return reply('ok',200);
  let key;
  try {key = decodeURIComponent(url.pathname.slice(1));} catch {return reply('Bad path',400);}
  if (!ASSET.test(key) && !/^library\/corpora\/ancient-wisdom-atlas\/[a-f0-9]{40}\/context-[a-f0-9]{64}\.zip$/.test(key) && !/^library\/catalogues\/[a-z0-9.-]+\.json$/.test(key)) return reply('Not found',404);
  const trusted = await authenticated(request, env.READ_TOKEN);
  // The published policy is written last, after every object has passed read-back verification.
  const policyObject = await env.LIBRARY.get('library/control/published-policy.json');
  const policy = policyObject ? await policyObject.json() : {publicKeys:[]};
  const publicObject = policy.publicKeys.includes(key);
  if (!publicObject && !trusted) {headers.set('Cache-Control','private, no-store');return reply('Authentication required',401);}
  const object = await env.LIBRARY.head(key);
  if (!object) return reply('Not found',404);
  object.writeHttpMetadata(headers);
  if (ASSET.test(key)) headers.set('Content-Disposition',(headers.get('Content-Disposition') || 'attachment').replace(/^inline/, 'attachment'));
  headers.set('ETag',object.httpEtag);
  headers.set('Last-Modified',object.uploaded.toUTCString());
  headers.set('Accept-Ranges','bytes');
  headers.set('Cache-Control',publicObject && ASSET.test(key) ? 'public, max-age=31536000, immutable' : publicObject ? 'public, max-age=60, must-revalidate' : 'private, no-store');
  const inm = request.headers.get('If-None-Match');
  if (inm && (inm === '*' || inm.split(',').some(tag => tag.trim().replace(/^W\//,'') === object.httpEtag))) return reply(null,304);
  const modified = request.headers.get('If-Modified-Since');
  if (!inm && modified && Math.floor(object.uploaded.getTime()/1000) <= Math.floor(Date.parse(modified)/1000)) return reply(null,304);
  let range;
  const ifRange = request.headers.get('If-Range');
  const useRange = !ifRange || ifRange === object.httpEtag || (Date.parse(ifRange) >= Math.floor(object.uploaded.getTime()/1000)*1000);
  if (request.method === 'GET' && request.headers.has('Range') && useRange) {
    range = byteRange(request.headers.get('Range'), object.size);
    if (!range) {headers.set('Content-Range',`bytes */${object.size}`);return reply(null,416);}
    headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${object.size}`);
  }
  headers.set('Content-Length',String(range ? range.length : object.size));
  if (request.method === 'HEAD') return reply(null,200);
  const data = await env.LIBRARY.get(key,{range,onlyIf:{etagMatches:object.etag}});
  if (!data || !('body' in data)) {headers.delete('Content-Length');headers.delete('Content-Range');return reply('Object changed; retry',503);}
  return new Response(data.body,{status:range ? 206 : 200,headers});
}
export default {async fetch(request,env) {
  try {return await serve(request,env);} catch {console.error(JSON.stringify({event:'library_gateway_error',path:new URL(request.url).pathname}));return new Response('Library temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
}};
