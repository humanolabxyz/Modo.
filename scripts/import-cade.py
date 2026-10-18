"""Import the supplied CADe text drawing, retaining IDs, labels and coordinates.
Only the observed file layout is supported; this is not a general CADe converter.
"""
from pathlib import Path
import re,json,hashlib,collections
root=Path(__file__).resolve().parents[1]
p=root/'public/diagrams/PERFECTO.cad';raw=p.read_bytes();text=raw.decode('latin1')
if not text.startswith('CADe_SIMU*'):raise ValueError('Not a CADe drawing')
objects=[]
for m in re.finditer(r'\*(\d+)\*(\d+)#([^*]*)\*([^#]*)',text.split('$$$')[0]):
 id_,type_,labels,values=m.groups();n=[float(x) for x in values.split('*') if x.strip()]
 if len(n)<16:raise ValueError('Incomplete record '+id_)
 labels=labels.split('#');objects.append(dict(id=int(id_),type=int(type_),reference=labels[0],labels=labels[2:],x=n[8],y=n[9],x2=n[10],y2=n[11],bounds=n[12:16],rawNumbers=n))
wiretypes={4000,4009,4010};known={1001,2001,3000,3001,3002,3004,4000,4001,4009,4010,6007,6009,6010,7000,7001,8000,8001,8018,9000,9008,20000}
seen=collections.defaultdict(list)
for o in objects:seen[(o['type'],o['reference'],o['x'],o['y'],o['x2'],o['y2'])].append(o['id'])
model=dict(name='PERFECTO',source='PERFECTO.cad',sha256=hashlib.sha256(raw).hexdigest(),objects=objects)
(root/'src/data/cadePerfecto.json').write_text(json.dumps(model,ensure_ascii=False,indent=2),encoding='utf-8')
report=dict(sourceBytes=len(raw),sha256=model['sha256'],objects=len(objects),wires=sum(o['type'] in wiretypes for o in objects),junctions=sum(o['type']==4001 for o in objects),symbols=sum(o['type'] not in wiretypes|{4001,20000} for o in objects),types=dict(collections.Counter(str(o['type']) for o in objects)),unknownTypes=sorted({o['type'] for o in objects}-known),coincidentRecords=[ids for ids in seen.values() if len(ids)>1],note='IDs, labels and coordinates read directly. Symbol artwork is reconstructed; not a native CADe export. Coincident records retained.')
(root/'qa/cade/import-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
