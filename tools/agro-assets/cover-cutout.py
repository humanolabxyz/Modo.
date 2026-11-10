# Recorta la escena de la ilustración de portada de Agro (quita el fondo verde liso del icono) y limpia el halo oscuro/blanco de Industria.
# Uso: python cover-cutout.py agro <entrada.webp> <salida.webp>   |   python cover-cutout.py industry <entrada.webp> <salida.webp>
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

kind, src, dst = sys.argv[1:4]
im = Image.open(src).convert('RGBA'); a = np.asarray(im).astype(np.float32); H, W = a.shape[:2]; rgb = a[..., :3]

def finish(mask, soft=1.4, fill=True):
    m = ndi.binary_opening(mask, iterations=1); lab, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab, range(1, n + 1)); m = lab == (1 + int(np.argmax(sizes)))
    if fill: m = ndi.binary_fill_holes(m)
    al = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(soft))
    out = np.asarray(im).copy(); out[..., 3] = np.minimum(np.asarray(al), out[..., 3] if kind == 'industry' else 255)
    ys, xs = np.where(m); box = (max(xs.min() - 6, 0), max(ys.min() - 6, 0), min(xs.max() + 7, W), min(ys.max() + 7, H))
    Image.fromarray(out).crop(box).save(dst, quality=92, method=6); print('guardado', dst, 'caja', box)

if kind == 'agro':
    yy, xx = np.mgrid[0:H, 0:W]
    # modelo suave del fondo verde (cuadrática por canal) ajustado fuera de la escena y dentro del cuadrado redondeado
    inside = (xx > 0.20 * W) & (xx < 0.82 * W) & (yy > 0.09 * H) & (yy < 0.90 * H)
    scene = (xx > 0.25 * W) & (xx < 0.77 * W) & (yy > 0.26 * H) & (yy < 0.84 * H)
    green = (rgb[..., 1] > rgb[..., 0] + 25) & (rgb[..., 1] > rgb[..., 2] + 10) & (rgb[..., 1] < 150) & (rgb[..., 0] < 90)
    fit = inside & ~scene & green
    X = np.stack([np.ones(H * W), xx.ravel() / W, yy.ravel() / H, (xx.ravel() / W) ** 2, (yy.ravel() / H) ** 2, (xx.ravel() * yy.ravel()) / (W * H)], 1)
    bg = np.zeros((H * W, 3))
    for c in range(3):
        coef, *_ = np.linalg.lstsq(X[fit.ravel()], rgb[..., c].ravel()[fit.ravel()], rcond=None); bg[:, c] = X @ coef
    dist = np.linalg.norm(rgb.reshape(-1, 3) - bg, axis=1).reshape(H, W)
    mask = (dist > 22) & scene
    finish(mask)
else:
    lum = rgb.mean(-1); sat = rgb.max(-1) - rgb.min(-1)
    dark = (lum < 62) & (sat < 60); white = (lum > 238) & (sat < 14)
    bgm = (dark | white | (a[..., 3] < 20))
    lab, n = ndi.label(bgm); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(edge))
    # el halo difuso: oscuro y semitransparente alrededor del objeto
    mask = ~ndi.binary_dilation(outside, iterations=2)
    mask &= a[..., 3] > 90
    # parches oscuros del fondo que quedan encerrados entre barandas y tuberías (se respeta el interior del gabinete, a la derecha)
    patch = (lum < 52) & (sat < 50) & mask; pl, pn = ndi.label(patch)
    for i in range(1, pn + 1):
        ys, xs = np.where(pl == i)
        if len(ys) > 120 and not (xs.mean() > 0.70 * W and 0.25 < ys.mean() / H < 0.70): mask[pl == i] = False
    finish(mask, soft=1.2, fill=False)
