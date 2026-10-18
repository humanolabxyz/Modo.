from pathlib import Path
import json, hashlib, re, zipfile
from pypdf import PdfReader
from docx import Document
from pptx import Presentation
from openpyxl import load_workbook
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'fuentes'
TEXT = ROOT / 'texto'
VIS = ROOT / 'revision-visual'
TEXT.mkdir(exist_ok=True)
VIS.mkdir(exist_ok=True)
inventory = []

for i, source in enumerate(sorted(p for p in SOURCE.rglob('*') if p.is_file()), 1):
    relative = source.relative_to(SOURCE).as_posix()
    record = {'id': f'F{i:02}', 'path': relative, 'bytes': source.stat().st_size, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'pages': []}
    ext = source.suffix.lower()
    if ext == '.pdf':
        reader = PdfReader(source)
        for n, page in enumerate(reader.pages, 1):
            txt = page.extract_text() or ''
            record['pages'].append({'page': n, 'text': txt, 'chars': len(txt), 'images': len(page.images)})
        record['page_count'] = len(reader.pages)
        content = '\n\n'.join(f'--- PÁGINA {p["page"]} ---\n{p["text"]}' for p in record['pages'])
    elif ext == '.docx':
        doc = Document(source)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        tables = [[' | '.join(c.text for c in row.cells) for row in t.rows] for t in doc.tables]
        record.update(paragraphs=paragraphs, tables=tables)
        content = '\n'.join(paragraphs) + '\n\n' + '\n\n'.join('\n'.join(t) for t in tables)
    elif ext == '.pptx':
        prs = Presentation(source)
        for n, slide in enumerate(prs.slides, 1):
            texts = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    texts.extend(p.text for p in shape.text_frame.paragraphs)
                if shape.has_table:
                    texts.extend(' | '.join(c.text for c in row.cells) for row in shape.table.rows)
            notes = slide.notes_slide.notes_text_frame.text if slide.has_notes_slide else ''
            record['pages'].append({'page': n, 'text': '\n'.join(texts), 'notes': notes})
        record['page_count'] = len(prs.slides)
        content = '\n\n'.join(f'--- DIAPOSITIVA {p["page"]} ---\n{p["text"]}\nNOTAS: {p["notes"]}' for p in record['pages'])
    elif ext == '.xlsx':
        wb = load_workbook(source, data_only=False)
        vals = load_workbook(source, data_only=True)
        record['sheets'] = []
        for sheet in wb:
            rows = []
            for row in sheet:
                cells = [{'cell': c.coordinate, 'value': c.value, 'cached': vals[sheet.title][c.coordinate].value} for c in row if c.value is not None]
                if cells: rows.append(cells)
            record['sheets'].append({'name': sheet.title, 'rows': rows, 'merged': [str(r) for r in sheet.merged_cells.ranges]})
        content = json.dumps(record['sheets'], ensure_ascii=False, indent=2, default=str)
    elif ext == '.txt':
        raw = source.read_bytes()
        try: content = raw.decode('utf-8-sig')
        except UnicodeDecodeError: content = raw.decode('cp1252')
    elif ext == '.png':
        img = Image.open(source).convert('RGB')
        record['dimensions'] = list(img.size)
        # Capturas largas: segmentos contiguos y sin omitir altura.
        for part, top in enumerate(range(0, img.height, 1500), 1):
            piece = img.crop((0, top, img.width, min(img.height, top+1500)))
            piece.save(VIS / f'{record["id"]}-captura-{part:02}.png')
        content = f'Captura {img.width} x {img.height}. Revisar segmentos {record["id"]}-captura-*.png.'
    else:
        content = 'Formato sin procesar'
    dest = TEXT / f'{record["id"]}.txt'
    dest.write_text(f'{relative}\n\n{content}', encoding='utf-8')
    record['text_file'] = dest.relative_to(ROOT).as_posix()
    inventory.append(record)

(ROOT / 'inventario.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2, default=str), encoding='utf-8')
index = '\n'.join(f'{r["id"]} | {r["path"]} | {r.get("page_count", "")} páginas/diapositivas | {sum(p.get("chars",0) for p in r["pages"])} caracteres PDF' for r in inventory)
(ROOT / 'INDICE_FUENTES.txt').write_text(index, encoding='utf-8')
print(index)
print('TOTAL PDF PAGES', sum(r.get('page_count',0) for r in inventory if r['path'].endswith('.pdf')))
