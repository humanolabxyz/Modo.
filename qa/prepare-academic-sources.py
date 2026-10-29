"""Publish unchanged classroom originals locally; stable IDs keep duplicate titles distinct."""
import json, shutil, hashlib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
analysis = root / 'analisis-materias-2026-10-17'
target = root / 'public/estudio/fuentes'
target.mkdir(parents=True, exist_ok=True)
sources = []
for inventory, base, group in [
    (analysis/'inventario.json', analysis/'fuentes', 'F'),
    (analysis/'instrumentacion/inventario.json', analysis/'instrumentacion', 'I'),
]:
    for item in json.loads(inventory.read_text(encoding='utf-8-sig')):
        original = base / item['path']
        name = item['id'] + original.suffix.lower()
        shutil.copy2(original, target/name)
        digest = hashlib.sha256((target/name).read_bytes()).hexdigest()
        assert digest == item['sha256'], item['id']
        folder = original.parent.name
        course = 's2-3' if group == 'I' or folder == 'intrumetacion' else {'electricidad':'s2-1', 'maquinas rotativas':'s2-2','matrices':'s2-5','redes industriales':'s2-4'}[folder]
        sources.append(dict(id=item['id'], title=original.name, courseId=course, url='/estudio/fuentes/'+name, pages=item.get('page_count'), format=original.suffix[1:].lower(), sha256=digest))
(root/'src/study/content/academic-sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
protected = ['src/components/App.tsx','src/components/Board.tsx','src/data/panel.ts','src/data/wiring.ts','src/data/simulation.ts','src/lab/model.ts','src/lab/dc.ts','src/lab/useLaboratory.ts','src/study/model.ts']
out = root/'qa/estudio-ampliacion'
out.mkdir(exist_ok=True)
baseline = out/'before-hashes.json'
if not baseline.exists():
    baseline.write_text(json.dumps({p: hashlib.sha256((root/p).read_bytes()).hexdigest() for p in protected},indent=2))
print(f'{len(sources)} originals copied and hashes verified')
