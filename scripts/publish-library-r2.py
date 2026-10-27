#!/usr/bin/env python3
"""Publish a complete, validated release; update the latest pointer last."""
import argparse,hashlib,json,pathlib,urllib.request,datetime,subprocess
p=argparse.ArgumentParser();p.add_argument('--release',required=True);p.add_argument('--inventory',default='../migration-private/library-r2-inventory.json');p.add_argument('--ledger',default='../migration-private/verification.jsonl');p.add_argument('--prepare-only',action='store_true');args=p.parse_args()
root=pathlib.Path('.');inventory=json.loads(pathlib.Path(args.inventory).read_text());verified={}
for line in pathlib.Path(args.ledger).read_text().splitlines():
 row=json.loads(line)
 if row['status']=='verified':verified[row['sha256']]=row
missing=[a['sha256'] for a in inventory['assets'] if a['sha256'] not in verified or verified[a['sha256']]['bytes']!=a['bytes']]
if missing:raise SystemExit(f'Publication blocked: {len(missing)} assets are not independently verified')
full_assets=[{**a,'status':'verified','verifiedAt':verified[a['sha256']]['verifiedAt'],'verification':verified[a['sha256']]['verification']} for a in inventory['assets']]
fields=['format','sha256','bytes','key','url','legacyUrl','visibility','role','recordIds','status','verifiedAt','verification']
registry={**inventory,'release':args.release,'assets':[{k:a[k] for k in fields} for a in full_assets]}
(root/'content/library-r2-registry.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
print('Prepared verified registry:',len(registry['assets']))
if args.prepare_only:raise SystemExit(0)
books=json.loads((root/'src/data/libraryCatalogue.json').read_text());known={a['sha256']:a for a in registry['assets']};used=set()
for book in books:
 for item in [book]+book.get('overviews',[]):
  for asset in item['assets']:
   record=known[asset['sha256']]
   if any(asset[k]!=record[k] for k in ['format','bytes','url']):raise SystemExit('Build not compiled from current verified registry')
   used.add(asset['sha256'])
if used!=set(known):raise SystemExit('Catalogue does not cover the complete verified inventory')
release={'version':1,'release':args.release,'sourceCommit':inventory['sourceCommit'],'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'books':books,'assets':full_assets}
data=(json.dumps(release,ensure_ascii=False,separators=(',',':'))+'\n').encode();key=f'library/catalogues/{args.release}.json';digest=hashlib.sha256(data).hexdigest()
# Catalogues include the curator's complete provenance and remain authenticated.
public_data=subprocess.run(['node','scripts/library-public-catalogue.mjs'],input=data,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
public_key=f'library/catalogues/public-{args.release}.json'
public_body=json.loads(public_data)
public_pointer={'version':1,'release':args.release,'catalogueUrl':inventory['baseUrl']+'/'+public_key,'sha256':hashlib.sha256(public_data).hexdigest(),'bytes':len(public_data),'assetCount':len(public_body['assets']),'recordCount':len(public_body['books'])}
public_pointer_data=(json.dumps(public_pointer,indent=2)+'\n').encode()
policy={'version':1,'release':args.release,'publicKeys':[a['key'] for a in registry['assets'] if a['visibility']=='public']+[public_key,'library/catalogues/public-latest.json']}
policy_data=(json.dumps(policy,separators=(',',':'))+'\n').encode()
pointer={'version':1,'release':args.release,'catalogueUrl':inventory['baseUrl']+'/'+key,'sha256':digest,'bytes':len(data),'assetCount':len(known),'recordCount':len(books)}
pointer_data=(json.dumps(pointer,indent=2)+'\n').encode()
token=pathlib.Path('../migration-private/ingest-token').read_text().strip()
def put(object_key,body):
 request=urllib.request.Request('https://library-ingest.acuity.institute/publish/'+object_key,data=body,method='PUT',headers={'User-Agent':'Acuity-Library-Migration/1.0','Authorization':'Bearer '+token,'Content-Type':'application/json','X-Content-SHA256':hashlib.sha256(body).hexdigest()})
 with urllib.request.urlopen(request,timeout=120) as response:result=json.load(response)
 if int(result['bytes'])!=len(body):raise SystemExit('Publication size mismatch')
 print('Published',object_key,len(body))
put(key,data)
put(public_key,public_data)
put('library/catalogues/public-latest.json',public_pointer_data)
put(f'library/control/policy-{args.release}.json',policy_data)
put('library/control/published-policy.json',policy_data)
put('library/catalogues/latest.json',pointer_data)
report={'version':1,'release':args.release,'verifiedFiles':len(known),'verifiedBytes':sum(a['bytes'] for a in registry['assets']),'publicFiles':sum(a['visibility']=='public' for a in registry['assets']),'authenticatedFiles':sum(a['visibility']=='private' for a in registry['assets']),'catalogue':pointer,'publicCatalogue':public_pointer,'verification':'Independent GET of every R2 object; byte count and SHA-256 compared with reviewed inventory','dropboxOriginals':'retained','sourceCommit':inventory['sourceCommit']}
(root/'content/library-r2-migration-report.json').write_text(json.dumps(report,indent=2)+'\n')
private=pathlib.Path('../migration-private');(private/'published-release.json').write_bytes(data);(private/'published-policy.json').write_bytes(policy_data);(private/'latest.json').write_bytes(pointer_data)
print(json.dumps(report,indent=2))
