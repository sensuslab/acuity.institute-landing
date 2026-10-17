"""Convert downloaded Gutenberg text without removing its notices or licence.
Usage: python scripts/prepare-reading-editions.py /path/to/source-downloads
Source folder contains {sourceId}.txt and {sourceId}.epub. Requires reportlab, pypdf.
"""
import sys, json, pathlib, re, shutil, hashlib
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
root=pathlib.Path(__file__).resolve().parent.parent
source=pathlib.Path(sys.argv[1])
font='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
pdfmetrics.registerFont(TTFont('Reading',font))
body=ParagraphStyle('Body',fontName='Reading',fontSize=10.5,leading=16,spaceAfter=0)
heading=ParagraphStyle('Heading',parent=body,fontSize=16,leading=23,spaceBefore=14,spaceAfter=14)
cover=ParagraphStyle('Cover',parent=body,fontSize=32,leading=40,spaceAfter=24,textColor=HexColor('#59411d'))
small=ParagraphStyle('Small',parent=body,fontSize=9,leading=14)
books=json.loads((root/'src/data/libraryCatalogue.json').read_text())
manifest=[]
for b in books:
 text=(source/f'{b["sourceId"]}.txt').read_text(encoding='utf-8-sig')
 assert '*** START OF THE PROJECT GUTENBERG' in text and '*** END OF THE PROJECT GUTENBERG' in text
 out=root/'public'/b['pdf'].lstrip('/')
 out.parent.mkdir(parents=True,exist_ok=True)
 story=[Spacer(1,75),Paragraph('ACUITY INSTITUTE / THE OPEN LIBRARY',small),Spacer(1,48),Paragraph(escape(b['title']),cover),Paragraph(escape(b['author']),heading),Paragraph(escape(b['editionNote']),body),Spacer(1,30),Paragraph('Source: '+escape(b['sourceUrl']),small),Paragraph('Reading edition prepared 17 October 2026. Source wording, credits and Project Gutenberg licence are retained below. Line wrapping and pagination have changed. This edition is not endorsed by Project Gutenberg.',small),PageBreak()]
 for para in re.split(r'\n\s*\n',text):
  para=para.strip()
  if not para:continue
  is_heading=len(para)<90 and para.isupper()
  # Preserve source lineation (including verse); do not silently rewrite the text.
  if is_heading:
   story.append(Paragraph(escape(' '.join(para.splitlines())), heading))
  else:
   for line in para.splitlines():
    story.append(Paragraph(escape(line), body))
  story.append(Spacer(1,10))
 def footer(c,doc):
  c.setFont('Reading',8);c.setFillColor(HexColor('#70675d'))
  c.drawString(48,29,'ACUITY / '+b['title']);c.drawRightString(547,29,str(doc.page))
 SimpleDocTemplate(str(out),pagesize=(595,842),leftMargin=48,rightMargin=48,topMargin=48,bottomMargin=52,title=b['title'],author=b['author']).build(story,onFirstPage=footer,onLaterPages=footer)
 for ext in ['epub','txt']:shutil.copyfile(source/f'{b["sourceId"]}.{ext}',root/'public'/b['text' if ext == 'txt' else ext].lstrip('/'))
 b['pages']=len(PdfReader(out).pages)
 b['pdfBytes']=out.stat().st_size
 for fmt in ['pdf','epub','text']:
  f=root/'public'/b[fmt].lstrip('/')
  manifest.append({'bookId':b['id'],'format':fmt,'path':b[fmt],'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'source':b['sourceUrl'],'retrieved':'2026-10-17'})
 print(b['title'],b['pages'],'pages')
(root/'src/data/libraryCatalogue.json').write_text(json.dumps(books,indent=2,ensure_ascii=False)+'\n')
(root/'public/library/provenance.json').write_text(json.dumps(manifest,indent=2)+'\n')
