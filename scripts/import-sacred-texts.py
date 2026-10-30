#!/usr/bin/env python3
"""Import a pinned Atlas snapshot, retaining canonical Markdown and generating EPUBs.
Requires Python PyYAML and pandoc. No network or publication occurs in this script.
"""
import argparse, concurrent.futures, hashlib, html, json, pathlib, re, subprocess, tempfile, unicodedata, zipfile
import yaml
p=argparse.ArgumentParser();p.add_argument('--source-dir',required=True);p.add_argument('--output-dir',required=True);p.add_argument('--commit',required=True);p.add_argument('--repo-dir',default='.')
a=p.parse_args();src=pathlib.Path(a.source_dir);out=pathlib.Path(a.output_dir);repo=pathlib.Path(a.repo_dir);out.mkdir(parents=True,exist_ok=True)
base='https://github.com/ilaydabdogan/ancient-wisdom-atlas';records=[];excluded=[];seen={};bodies={};assets=[]
def slug(s):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def string(v):return '' if v is None else ', '.join(map(str,v)) if isinstance(v,list) else str(v)
def asset(path,fmt,record,legacy,role='source-text'):
 data=path.read_bytes();sha=hashlib.sha256(data).hexdigest();ext={'markdown':'md','text':'txt'}.get(fmt,fmt)
 return dict(sha256=sha,bytes=len(data),format=fmt,key=f'library/assets/{sha}.{ext}',url=f'https://assets.acuity.institute/library/assets/{sha}.{ext}',path=str(path.resolve()),sourceUrl='',mime={'markdown':'text/markdown; charset=utf-8','epub':'application/epub+zip','text':'text/plain; charset=utf-8'}.get(fmt,'application/octet-stream'),originalFilename=path.name,legacyUrl=legacy,visibility='public',role=role,recordIds=[record])
required=yaml.safe_load((src/'templates/full-text.md').read_text().split('---',2)[1])
for path in sorted((src/'texts').rglob('*.md')):
 raw=path.read_text();rel=path.relative_to(src).as_posix()
 if not raw.startswith('---\n'):continue
 m=yaml.safe_load(raw.split('---',2)[1]);body=raw.split('---',2)[2]
 reason=None
 if not rel.startswith(('texts/public-domain/','texts/open-license/','texts/permissioned/')):reason='Interpretive framework summary, not a complete source text'
 elif m.get('text_status')!='complete' or m.get('transcription',{}).get('complete') is not True:reason='Upstream marks this as a selection or incomplete transcription'
 elif m.get('rights',{}).get('full_text')!='allowed':reason='Upstream does not permit full-text hosting'
 elif m.get('rights',{}).get('status') not in ['public_domain','cc0','cc_by','cc_by_sa']:reason='No reusable full-text rights status'
 elif any(k not in m for k in required):reason='Missing full-text template fields'
 elif any(k not in m.get(group,{}) for group in ['rights','trademark','provenance','transcription'] for k in required[group]):reason='Missing nested rights, trademark, provenance or transcription fields'
 if reason:excluded.append({'path':rel,'title':m.get('title'),'reason':reason,'textStatus':m.get('text_status')});continue
 sha=hashlib.sha256(path.read_bytes()).hexdigest();bodyhash=hashlib.sha256(re.sub(r'\s+',' ',body).strip().encode()).hexdigest()
 if sha in seen or bodyhash in bodies:excluded.append({'path':rel,'title':m['title'],'reason':'Duplicate canonical bytes or normalized source body','duplicateOf':seen.get(sha) or bodies.get(bodyhash)});continue
 seen[sha]=rel;bodies[bodyhash]=rel
 rid='atlas-'+slug(m['id']);prov=m['provenance'];trad=string(m['tradition']);edition=string(prov.get('edition'));translator=string(prov.get('translator')) or None
 records.append({'id':rid,'title':m['title'],'subtitle':'Ancient Wisdom Atlas edition','author':string(prov.get('author')) or string(m.get('author')) or ('Traditional · '+trad.replace('_',' ').title()),'translator':translator,'collection':'Sacred Texts','period':string(m.get('date_range')),'language':string(m['text_language']),'description':f"{m['title']} from the {trad.replace('_',' ')} tradition. "+(f"This edition: {edition}. " if edition else '')+'Complete transcription supplied by Ancient Wisdom Atlas, with source and edition metadata.','editionNote':f"Ancient Wisdom Atlas, edited by İlayda Büyükdoğan; pinned revision {a.commit[:12]}. "+edition,'rights':string(m['rights'].get('notes')) or string(m['rights']['status']),'rightsMetadata':m['rights'],'trademark':m['trademark'],'sourceMetadata':m,'sourceUrl':base+'/blob/'+a.commit+'/'+rel,'sourcePath':rel,'upstreamCommit':a.commit,'sourceBodySha256':bodyhash,'categoryKey':'Sacred-Texts/'+slug(trad),'categoryPath':['Sacred Texts',trad.replace('_',' ').title()],'categoryLabel':'Sacred Texts / '+trad.replace('_',' ').title(),'kind':'book','accent':'gold','tags':list(dict.fromkeys(['sacred texts',trad.replace('_',' ')]+[string(t) for t in m.get('tags',[])])),'_path':str(path),'_body':body})
def convert(r):
 path=pathlib.Path(r['_path']);dest=out/(r['id']+'.epub');m=r['sourceMetadata'];body=r['_body']
 # The canonical source remains byte-for-byte unchanged. The derivative appends a
 # separate edition colophon; it never injects interpretation into source passages.
 colophon='\n\n# Edition and source metadata\n\n'
 for label,value in [('Source',r['sourceUrl']),('Atlas credit','İlayda Büyükdoğan, Ancient Wisdom Atlas (2026)'),('Copyright and license',yaml.safe_dump(m['rights'],allow_unicode=True,sort_keys=False)),('Trademark (separate from copyright)',yaml.safe_dump(m['trademark'],allow_unicode=True,sort_keys=False)),('Transcription',yaml.safe_dump(m['transcription'],allow_unicode=True,sort_keys=False))]:
  colophon+='## '+label+'\n\n'+('```yaml\n'+value+'```\n' if '\n' in value else value+'\n')
 with tempfile.TemporaryDirectory() as td:
  td=pathlib.Path(td);md=td/'reading.md';md.write_text(body+colophon)
  meta=td/'metadata.yml';meta.write_text(yaml.safe_dump({'title':r['title'],'author':[r['author']],'lang':'en' if r['language'].lower()=='english' else 'und','identifier':r['id'],'rights':r['rights'],'date':'2026-10-27'},allow_unicode=True))
  subprocess.run(['pandoc',str(md),'--from=markdown-raw_html-raw_tex','--to=epub3','--metadata-file',str(meta),'--epub-chapter-level=2','--resource-path='+str(td),'--output',str(dest)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 # Strip reproducibility noise (ZIP timestamps and modified timestamp).
 with zipfile.ZipFile(dest) as z:entries=[(x.filename,z.read(x)) for x in z.infolist()]
 with zipfile.ZipFile(dest,'w') as z:
  for name,data in entries:
   if name.endswith('.opf'):data=re.sub(rb'(<meta property="dcterms:modified">)[^<]+',rb'\g<1>2026-10-27T00:00:00Z',data)
   info=zipfile.ZipInfo(name,(2026,10,27,0,0,0));info.compress_type=zipfile.ZIP_STORED if name=='mimetype' else zipfile.ZIP_DEFLATED;z.writestr(info,data)
 legacy='/library/books/Sacred-Texts/'+slug(string(m['tradition']))+'/'+r['id']
 r['assets']=[asset(path,'markdown',r['id'],legacy+'.md'),asset(dest,'epub',r['id'],legacy+'.epub','reading-edition')]
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,r in enumerate(pool.map(convert,records),1):
  assets.extend(r['assets']);r.pop('_path');r.pop('_body')
  if i%30==0:print('Converted',i,'/',len(records),flush=True)
# Reuse exact Gutenberg edition identities already curated by Acuity.
existing_path=repo/'src/data/libraryCatalogue.json'
existing=json.loads(existing_path.read_text()) if existing_path.exists() else []
old_registry_path=repo/'content/library-r2-registry.json'
old_assets=json.loads(old_registry_path.read_text())['assets'] if old_registry_path.exists() else []
reused=set()
for record in records:
 url=record['sourceMetadata']['provenance'].get('source_url','')
 match=re.search(r'gutenberg.org/(?:ebooks|files)/(\d+)',url)
 matches=[book for book in existing if not book['id'].startswith('atlas-') and match and str(book.get('sourceId'))==match[1]]
 record['relatedEditionIds']=[book['id'] for book in matches]
 if len(matches)==1:
  book=matches[0];epub=next((x for x in book['assets'] if x['format']=='epub'),None)
  canonical=next((x for x in old_assets if epub and x['sha256']==epub['sha256']),None)
  if canonical:
   record['mergeIntoId']=book['id'];reused.update(x['sha256'] for x in record['assets'] if x['format']=='epub')
   record['assets']=[x for x in record['assets'] if x['format']=='markdown']+[canonical]
assets=[x for x in assets if x['sha256'] not in reused]
# Canonical index: originals retain paths; interpretation and taxonomy stay separate.
context=[]
for folder in ['templates','patterns','taxonomy','data/sources']:
 for path in sorted((src/folder).rglob('*')):
  if path.is_file() and not path.name.startswith('.'):
   context.append({'path':path.relative_to(src).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'upstreamUrl':base+'/blob/'+a.commit+'/'+path.relative_to(src).as_posix()})
report={'version':1,'upstream':base,'commit':a.commit,'included':len(records),'excluded':excluded,'uniqueBodyHashes':len(bodies),'markdownBytes':sum(x['bytes'] for x in assets if x['format']=='markdown'),'epubBytes':sum(x['bytes'] for x in assets if x['format']=='epub'),'contextFiles':context}
(out/'inventory.json').write_text(json.dumps({'version':1,'assets':assets},ensure_ascii=False,indent=2)+'\n')
(repo/'data/sources/ancient-wisdom-atlas.json').write_text(json.dumps({'version':1,'upstream':base,'commit':a.commit,'credit':'İlayda Büyükdoğan, Ancient Wisdom Atlas (2026)','books':[{**r,'assets':[{k:v for k,v in x.items() if k not in ['path','sourceUrl','originalFilename','mime']} for x in r['assets']]} for r in records]},ensure_ascii=False,indent=2)+'\n')
(repo/'content/sacred-texts-import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['contextFiles','excluded']},ensure_ascii=False));print('Excluded',len(excluded),flush=True)
