import sys
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path
import json,hashlib,zipfile,xml.etree.ElementTree as ET
from pypdf import PdfReader
out=Path('output/revision-guias-2026-10-26');meta=[]
paths=[Path(r'C:\Users\HUMANO LAB\Downloads\Guía práctica laboratorio N°2 (2).docx'),Path(r'C:\Users\HUMANO LAB\Downloads\Actividad 2 Unidad 2 (1).pdf')]
paths += list(Path(r'C:\Users\HUMANO LAB\Downloads').glob('Actividad 2*.pdf'))
paths += list(Path(r'C:\Users\HUMANO LAB\Downloads').glob('Guía práctica laboratorio N°2*.docx'))
paths += [Path('public/estudio/fuentes')/n for n in ['F10.pdf','F11.pdf','F12.pdf']]
seen=set()
for i,p in enumerate(paths):
 if str(p.resolve()) in seen:continue
 seen.add(str(p.resolve()));sha=hashlib.sha256(p.read_bytes()).hexdigest();key=f'{i:02d}-{p.stem}'
 rec={'path':str(p.resolve()),'sha256':sha,'key':key}
 if p.suffix=='.pdf':
  r=PdfReader(p);parts=[f'PÁGINA {j+1}\n'+(pg.extract_text() or '') for j,pg in enumerate(r.pages)];rec['pages']=len(r.pages);rec['text']='\n\n'.join(parts)
 else:
  with zipfile.ZipFile(p) as z:
   rt=ET.fromstring(z.read('word/document.xml'));ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
   rec['text']='\n'.join(' | '.join(''.join(x.itertext()) for x in el.findall('.//w:t',ns)) for el in rt.findall('.//w:body/*',ns))
   rec['media']=[n for n in z.namelist() if n.startswith('word/media/')]
   if i==0:
    d=out/'docx-imagenes';d.mkdir(exist_ok=True)
    for n in rec['media']:(d/Path(n).name).write_bytes(z.read(n))
 (out/(key+'.txt')).write_text(rec['text'],encoding='utf-8')
 rec['excerpt']=rec.pop('text')[:1600];meta.append(rec)
 print(json.dumps(rec,ensure_ascii=False))
(out/'inventario.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')

