from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import json

folder = Path(__file__).resolve().parent
root = folder.parent
font_path = Path('C:/Windows/Fonts/segoeui.ttf')
font = ImageFont.truetype(str(font_path), 23)
small = ImageFont.truetype(str(font_path), 18)

def contained(path, width, height):
    return ImageOps.contain(Image.open(path).convert('RGB'), (width, height), Image.Resampling.LANCZOS)

canvas = Image.new('RGB', (1440, 1800), '#f6f7f8')
draw = ImageDraw.Draw(canvas)
draw.text((30, 20), 'PanelLab INACAP | comparación de escritorio', font=font, fill='#202a30')
for index, (name, label) in enumerate([('antes-desktop.png', 'Prototipo aprobado conservado'), ('despues-desktop.png', 'v1.1 para revisión visual')]):
    draw.text((30 + index*710, 68), label, font=small, fill='#4b5d65')
    pic = contained(folder/name, 680, 1670)
    canvas.paste(pic, (30 + index*710, 105))
canvas.crop((0, 0, 1440, 105+max(contained(folder/n,680,1670).height for n in ['antes-desktop.png','despues-desktop.png'])+30)).save(folder/'comparacion-desktop.jpg', quality=93)

canvas = Image.new('RGB', (850, 2390), '#f6f7f8')
draw = ImageDraw.Draw(canvas)
for index,(name,label) in enumerate([('antes-mobile.png','Anterior · 390 px'),('despues-mobile.png','v1.1 · 390 px')]):
    draw.text((25 + index*420,20), label, font=font, fill='#202a30')
    pic=contained(folder/name,390,2300)
    canvas.paste(pic,(25 + index*420,65))
canvas.save(folder/'comparacion-mobile.jpg',quality=93)

modules=json.loads((root/'public/panel-model.json').read_text(encoding='utf-8'))['modules']
canvas=Image.new('RGB',(1800,7*465+100),'#f6f7f8')
draw=ImageDraw.Draw(canvas)
for col, label in enumerate(['Fotografía real del laboratorio','Prototipo aprobado','v1.1 para revisión']):
    draw.text((25+col*600,20),label,font=font,fill='#202a30')
for row,m in enumerate(modules):
    y=80+row*465
    draw.text((25,y),m['title']+(' '+m['id'][-1] if m['category']=='temporizadores' else ''),font=small,fill='#374b55')
    paths=[root/'public'/m['image'].lstrip('/'),folder/('anterior-'+m['id'].lower()+'.png'),folder/('actual-'+m['id'].lower()+'.png')]
    for col,p in enumerate(paths):
        pic=contained(p,550,400)
        canvas.paste(pic,(25+col*600+(550-pic.width)//2,y+35+(400-pic.height)//2))
    draw.line((20,y+450,1780,y+450),fill='#dce3e5',width=2)
canvas.save(folder/'comparacion-modulos.jpg',quality=94)
print('Created desktop, mobile and 7-module photo/before/after comparisons.')
