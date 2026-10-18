from pathlib import Path
import json, fitz
from PIL import Image, ImageDraw, ImageOps

root = Path(__file__).resolve().parent
items = json.loads((root/'inventario.json').read_text(encoding='utf-8'))
out = root/'revision-visual'
for item in items:
    if not item['path'].endswith('.pdf'):
        continue
    doc = fitz.open(root/item['path'])
    thumbs = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.4,1.4), alpha=False)
        image = Image.frombytes('RGB', (pix.width,pix.height), pix.samples)
        image.save(out/f'{item["id"]}-p{i+1:02}.png')
        thumb = ImageOps.contain(image,(470,620))
        canvas = Image.new('RGB',(490,650),'#e5e5e5')
        canvas.paste(thumb,((490-thumb.width)//2,24))
        ImageDraw.Draw(canvas).text((10,5),f'{item["id"]} / pagina {i+1}',fill='black')
        thumbs.append(canvas)
    for start in range(0,len(thumbs),12):
        batch=thumbs[start:start+12]
        sheet=Image.new('RGB',(1960,650*((len(batch)+3)//4)),'white')
        for i,image in enumerate(batch):sheet.paste(image,((i%4)*490,(i//4)*650))
        sheet.save(out/f'{item["id"]}-hoja-{start//12+1}.jpg',quality=90)
    print(item['id'],len(doc))
