from pathlib import Path
import json, hashlib, shutil, logging
from pypdf import PdfReader

logging.getLogger('pypdf').setLevel(logging.ERROR)
root=Path(__file__).resolve().parent
for d in ['fuentes','texto','revision-visual']: (root/d).mkdir(parents=True,exist_ok=True)
names=['Presentación de la Asignatura (1).pdf','Conf. 1 (1).pdf','Conf. 2 (2).pdf','Conf. 3 Medidas de caudal.pdf','Conf. 4 Medidas de Presión.pdf','Conf. 5 Medidas de nivel.pdf','Conf. 6 Medidas de temperatura.pdf','Conf. 2 (3).pdf']
records=[]
for i,name in enumerate(names,1):
 src=Path('C:/Users/HUMANO LAB/Downloads')/name
 dest=root/'fuentes'/name
 shutil.copy2(src,dest)
 rd=PdfReader(dest)
 pages=[{'page':j+1,'text':p.extract_text() or ''} for j,p in enumerate(rd.pages)]
 rec={'id':f'I{i:02}','name':name,'original':str(src),'path':'fuentes/'+name,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'page_count':len(pages),'pages':pages,'attachments':list(rd.attachments.keys())}
 records.append(rec)
 (root/'texto'/f'I{i:02}.txt').write_text(name+'\n\n'+'\n\n'.join(f'--- PAGINA {p["page"]} ---\n{p["text"]}' for p in pages),encoding='utf-8')
 print(rec['id'],len(pages),name)
(root/'inventario.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL',sum(x['page_count'] for x in records),'paginas')
