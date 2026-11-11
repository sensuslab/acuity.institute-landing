// Notify IndexNow (Bing, Yandex, Seznam, Naver and others share submissions) about site URLs.
// Usage after a deploy: node scripts/indexnow-submit.mjs [--sitemap https://acuity.institute/sitemap.xml] [--dry-run]
// The key is public by design: it is verified via https://acuity.institute/<key>.txt.
import fs from 'node:fs';
const host = 'acuity.institute';
const keyFile = fs.readdirSync('public').find(f => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file in public/');
const key = fs.readFileSync(`public/${keyFile}`, 'utf8').trim();
const args = process.argv.slice(2);
const sitemap = args.includes('--sitemap') ? args[args.indexOf('--sitemap') + 1] : `https://${host}/sitemap.xml`;
const xml = await (await fetch(sitemap, {headers: {'User-Agent': 'acuity-indexnow/1.0'}})).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => new URL(u).hostname === host);
if (!urlList.length) throw new Error('Sitemap had no URLs');
console.log(`Submitting ${urlList.length} URLs with key file ${keyFile}`);
if (args.includes('--dry-run')) process.exit(0);
for (let i = 0; i < urlList.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {method: 'POST', headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify({host, key, keyLocation: `https://${host}/${keyFile}`, urlList: urlList.slice(i, i + 10000)})});
  console.log(`IndexNow responded ${res.status} ${res.statusText} ${await res.text()}`);
}
