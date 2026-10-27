#!/usr/bin/env python3
"""Restore approved canonical Markdown paths from the checksum-pinned R2 index."""
import argparse,concurrent.futures,hashlib,json,pathlib,urllib.request
p=argparse.ArgumentParser();p.add_argument('--index',default='data/sources/ancient-wisdom-atlas.json');p.add_argument('--directory',default='.');a=p.parse_args();index=json.loads(pathlib.Path(a.index).read_text());root=pathlib.Path(a.directory).resolve()
def restore(book):
 relative=pathlib.PurePosixPath(book['sourcePath']);dest=root.joinpath(*relative.parts).resolve()
 if not relative.parts or relative.parts[0]!='texts' or '..' in relative.parts or not dest.is_relative_to(root):raise ValueError('Unsafe source path')
 asset=next(x for x in book['assets'] if x['format']=='markdown');url=asset['url']
 if url!='https://assets.acuity.institute/library/assets/'+asset['sha256']+'.md':raise ValueError('Invalid canonical URL')
 if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()==asset['sha256']:return
 data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Acuity-Sacred-Texts-Restore/1.0'}),timeout=120).read()
 if len(data)!=asset['bytes'] or hashlib.sha256(data).hexdigest()!=asset['sha256']:raise ValueError('Source identity mismatch')
 dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(restore,index['books']))
print('Restored',len(index['books']),'canonical source texts with SHA-256 verification.')
