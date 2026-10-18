import sys,pathlib,shutil,json
sys.path.insert(0,'qa/font-tools')
from fontTools import subset
from fontTools.ttLib import TTFont
root=pathlib.Path('.')
text=''.join(p.read_text(encoding='utf-8') for p in (root/'src').rglob('*') if p.is_file() and p.suffix in ('.ts','.tsx','.astro','.css'))
unicodes=set(range(0x180))|set(map(ord,text))
records=[]
for file in (root/'public/fonts').glob('*.woff2'):
    saved=root/'qa/performance-opening/before-source'/file
    saved.parent.mkdir(parents=True,exist_ok=True)
    if not saved.exists(): shutil.copy2(file,saved)
    original=TTFont(saved);coverage=set(original.getBestCmap());original.close()
    options=subset.Options();options.flavor='woff2';options.layout_features=['*'];options.name_IDs=['*']
    font=subset.load_font(str(saved),options)
    worker=subset.Subsetter(options=options);worker.populate(unicodes=unicodes);worker.subset(font);subset.save_font(font,str(file),options)
    current=TTFont(file);assert (coverage&unicodes)<=set(current.getBestCmap()),file;current.close()
    records.append({'file':str(file),'beforeBytes':saved.stat().st_size,'afterBytes':file.stat().st_size})
pathlib.Path('qa/performance-opening/fonts.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records))

