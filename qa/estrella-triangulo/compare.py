"""Compara la foto rectificada con el dibujo transcrito: [foto | dibujo | superposición] y mide la coincidencia.
Uso: python qa/estrella-triangulo/compare.py  (tras render-compare.cjs)"""
import numpy as np,json,sys
from PIL import Image,ImageEnhance,ImageFilter,ImageOps,ImageDraw
from scipy import ndimage
im=Image.open(r"C:\Users\HUMANO LAB\.claude\uploads\5865ab81-612a-4036-8ffc-e9e670cf4a10\96a37367-image.jpg").convert('L')
dh=np.array([1125,54.0]);dh/=np.linalg.norm(dh);dv=np.array([50,393.0]);dv/=np.linalg.norm(dv)
s=2.28;A=np.column_stack([dh*s,dv*s]);T=np.array([139.0,274.0])-A@np.array([63.0,24.0])
crops=json.load(open('qa/estrella-triangulo/crops.json'))
rectm=Image.open('qa/estrella-triangulo/rect-mando-2x.png').convert('L')
def photo(c):
    x,y,w,h=c['vb'];W,H=c['w'],c['h'];R=W/w
    if c.get('src')=='mando':
        px0=(x-339)*9.4+696;py0=(y-36)*9.4
        return rectm.crop((int(px0),int(py0),int(px0)+W,int(py0)+H)).resize((W,H))
    u0,v0=x-1,y   # el dibujo está desplazado +1 respecto a lo medido
    M=A/R;b=A@np.array([u0,v0])+T
    out=im.transform((W,H),Image.AFFINE,(M[0,0],M[0,1],b[0],M[1,0],M[1,1],b[1]),resample=Image.BICUBIC)
    return ImageEnhance.Contrast(out).enhance(1.7).filter(ImageFilter.UnsharpMask(radius=3,percent=120,threshold=2))
def score(a,b,tol):
    """a=líneas de la foto, b=líneas del dibujo (bool). Devuelve (% de la foto cubierta por el dibujo, % del dibujo cubierto por la foto)."""
    da=ndimage.binary_dilation(a,iterations=tol);db=ndimage.binary_dilation(b,iterations=tol)
    return 100*(a&db).sum()/max(1,a.sum()),100*(b&da).sum()/max(1,b.sum())
def lines_photo(a):
    # umbral adaptativo: píxeles claramente más oscuros que su entorno (independiente del brillo de la foto)
    arr=np.array(a,dtype=float);bg=ndimage.gaussian_filter(arr,12);return (bg-arr)>22  # adaptive
for name,c in crops.items():
    a=photo(c);b=Image.open(f'qa/estrella-triangulo/cmp-{name}-mine.png').convert('L').resize(a.size)
    ab=lines_photo(a);bb=np.array(b)<150
    pa,pb=score(ab,bb,max(2,int(c['w']/c['vb'][2]*0.45)))
    side=Image.new('RGB',(a.width*3+20,a.height),'white');side.paste(a.convert('RGB'),(0,0));side.paste(b.convert('RGB'),(a.width+10,0))
    ov=Image.merge('RGB',(Image.fromarray(np.where(ab,0,255).astype('uint8')),Image.fromarray(np.where(bb,0,255).astype('uint8')),Image.fromarray(np.where(bb,0,255).astype('uint8'))));side.paste(ov,(2*a.width+20,0))
    side.save(f'qa/estrella-triangulo/cmp-{name}.png');print(f'{name:8s} foto cubierta {pa:5.1f}%   dibujo respaldado por la foto {pb:5.1f}%')
