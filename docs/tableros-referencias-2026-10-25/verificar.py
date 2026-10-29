"""Check artifact integrity and cross references, not electrical compliance."""
from pathlib import Path
import hashlib,json,csv,fitz
from PIL import Image

ROOT=Path(__file__).resolve().parent
sources=json.loads((ROOT/'fuentes.json').read_text(encoding='utf-8'))
data=json.loads((ROOT/'investigacion.json').read_text(encoding='utf-8'))
by_id={s['id']:s for s in sources}
checks=[]
def check(name,condition):
 checks.append({'check':name,'pass':bool(condition)})
 if not condition:raise AssertionError(name)

check('13 fuentes disponibles',len(sources)==13 and all(s['status']=='downloaded' for s in sources))
for s in sources:
 p=ROOT/s['path'];b=p.read_bytes()
 check(s['id']+' integridad SHA-256 y tamaño',len(b)==s['bytes'] and hashlib.sha256(b).hexdigest()==s['sha256'])
 if s['type']=='manual':
  with fitz.open(p) as doc:check(s['id']+' páginas e idioma registrado',len(doc)==s['pages'] and bool(s.get('language')))
 else:
  with Image.open(p) as im:check(s['id']+' dimensiones',list(im.size)==s['dimensions'])

check('12 referencias visuales con IDs únicos',len(data['visuals'])==len({v['id'] for v in data['visuals']})==12)
for v in data['visuals']:
 s=by_id[v['source']]
 check(v['id']+' imagen y fuente', (ROOT/v['image']).exists())
 if v['pdf_page']:check(v['id']+' página válida',1<=v['pdf_page']<=s['pages'])
check('8 etapas de aprendizaje',len(data['workflow'])==8)
check('16 casos con IDs únicos',len(data['faults'])==len({f['id'] for f in data['faults']})==16)
ids=set(by_id)|{s['id'] for s in data['support_sources']}
for f in data['faults']:
 check(f['id']+' fuentes y campos completos',set(f['sources'])<=ids and all(f[k] for k in ['symptom','hypothesis','virtual_check','simulated_correction','acceptance','evidence_kind']))
 for sid,pp in f['source_pages'].items():check(f['id']+' referencia de página '+sid,sid in f['sources'] and all(1<=n<=by_id[sid]['pages'] for n in pp))
with (ROOT/'matriz-fallas.csv').open(encoding='utf-8-sig',newline='')as f:rows=list(csv.DictReader(f,delimiter=';'))
check('CSV corresponde a los 16 casos',[(f['id'],f['symptom'])for f in rows]==[(f['id'],f['symptom'])for f in data['faults']])

pdf=ROOT.parent.parent/'output'/'pdf'/'Investigacion_tableros_modo_2026-10-25.pdf'
doc=fitz.open(pdf);texts=[p.get_text()for p in doc]
check('PDF de 18 páginas',len(doc)==18)
check('PDF con texto extraíble y sin reemplazos Unicode',all(len(t)>250 and '\ufffd' not in t for t in texts))
check('PDF incluye todos los casos',all(f['id']+'  /' in ''.join(texts)or f['id']+' /' in ''.join(texts) for f in data['faults']))
links=sum(len(p.get_links())for p in doc)
check('PDF con enlaces de fuentes',links>=26)
check('18 páginas renderizadas con Poppler',len(list((ROOT/'qa').glob('atlas-*.png')))==18)
report={'date':'2026-10-25','scope':'Integridad documental y referencias; no certificación eléctrica ni prueba funcional del taller propuesto.',
 'pdf':str(pdf),'pdf_pages':len(doc),'pdf_bytes':pdf.stat().st_size,'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
 'source_files':len(sources),'manuals':7,'visual_cards':12,'fault_cases':16,'workflow_stages':8,'pdf_links':links,
 'visual_review':{'all_pages':'Hojas de contacto de las 18 páginas revisadas.','full_size_examples':[2,13,17],'result':'Sin recortes de texto, superposiciones ni defectos visibles en el render final.'},
 'checks':checks,'result':'pass','application_changes':'Ninguna modificación funcional ni publicación de la aplicación como parte de esta investigación.'}
(ROOT/'qa'/'verificacion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(checks)} comprobaciones correctas; {len(doc)} páginas; {links} enlaces; {pdf.stat().st_size} bytes.')
