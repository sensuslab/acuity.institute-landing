#!/usr/bin/env python3
"""Resumable R2 ingestion and independent read-back SHA-256 verification.
Secrets are read from local files, never command arguments or logs.
"""
import argparse, concurrent.futures, datetime, hashlib, json, pathlib, threading, time, urllib.request, urllib.error
p=argparse.ArgumentParser();p.add_argument('--inventory',default='../migration-private/library-r2-inventory.json');p.add_argument('--ledger',default='../migration-private/verification.jsonl');p.add_argument('--token-file',default='../migration-private/ingest-token');p.add_argument('--endpoint',default='https://library-ingest.acuity.institute');p.add_argument('--pilot',action='store_true');p.add_argument('--workers',type=int,default=3)
args=p.parse_args();registry=json.loads(pathlib.Path(args.inventory).read_text());token=pathlib.Path(args.token_file).read_text().strip();ledger=pathlib.Path(args.ledger);ledger.parent.mkdir(parents=True,exist_ok=True);lock=threading.Lock()
verified={}
if ledger.exists():
 for line in ledger.read_text().splitlines():
  row=json.loads(line)
  if row.get('status')=='verified':verified[row['sha256']]=row
assets=registry['assets']
if args.pilot:
 ids=['tao-te-ching-legge','pene-yitsak-hebrew-1886-izmir-imprint','overview-tao-te-ching-legge']
 assets=[a for a in assets if any(i in a['recordIds'] for i in ids)]+[max(assets,key=lambda a:a['bytes'])]
 assets=list({a['sha256']:a for a in assets}.values())

def transfer(a):
 digest=a['sha256'];url=args.endpoint+'/'+digest
 if digest in verified and verified[digest]['bytes']==a['bytes']:return True
 error=''
 for attempt in range(4):
  try:
   method='POST' if a['sourceUrl'] else 'PUT'
   data=b'' if method=='POST' else pathlib.Path(a['path']).read_bytes()
   if method=='PUT' and (len(data)!=a['bytes'] or hashlib.sha256(data).hexdigest()!=digest):raise ValueError('Local source identity mismatch')
   request=urllib.request.Request(url,data=data,method=method,headers={'User-Agent':'Acuity-Library-Migration/1.0','Authorization':'Bearer '+token,'Content-Type':'application/octet-stream'})
   with urllib.request.urlopen(request,timeout=300) as response:upload=json.load(response)
   h=hashlib.sha256();size=0
   request=urllib.request.Request(url,headers={'User-Agent':'Acuity-Library-Migration/1.0','Authorization':'Bearer '+token})
   with urllib.request.urlopen(request,timeout=300) as response:
    while chunk:=response.read(1024*1024):h.update(chunk);size+=len(chunk)
   if size!=a['bytes'] or h.hexdigest()!=digest:raise ValueError('Read-back identity mismatch')
   row={'sha256':digest,'key':a['key'],'bytes':size,'status':'verified','verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verification':'independent GET byte count and SHA-256','etag':upload.get('etag')}
   with lock:
    with ledger.open('a') as f:f.write(json.dumps(row)+'\n')
    verified[digest]=row
    print(json.dumps({'verified':len(verified),'total':len(registry['assets']),'file':a['originalFilename'],'bytes':size}),flush=True)
   return True
  except Exception as e:
   error=type(e).__name__+': '+str(e)
   if isinstance(e,urllib.error.HTTPError):error+=' '+e.read(300).decode(errors='replace')
   time.sleep(min(2**attempt,8))
 with lock:
  with ledger.open('a') as f:f.write(json.dumps({'sha256':digest,'status':'failed','error':error})+'\n')
  print(json.dumps({'failed':a['originalFilename'],'error':error}),flush=True)
 return False
with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:results=list(pool.map(transfer,assets))
print(json.dumps({'completed':sum(results),'requested':len(results),'verifiedTotal':len(verified)}),flush=True)
raise SystemExit(0 if all(results) else 1)
