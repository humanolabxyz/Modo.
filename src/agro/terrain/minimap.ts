// Minimapa: relieve sombreado a baja resolución, calculado desde la malla de alturas. Puro (devuelve píxeles RGBA).
import {heightRange, sampleHeight, type Heightfield} from './heightfield.ts';
import {surfaceColor} from './surface.ts';

/** `size`×`size` píxeles; el norte (z mínimo) queda arriba. Luz desde el noroeste. */
export function renderMinimap(hf: Heightfield, size = 160): Uint8ClampedArray {
  const out = new Uint8ClampedArray(size * size * 4), {min, max} = heightRange(hf), span = Math.max(1, max - min);
  const step = hf.sizeX / size;
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const x = hf.originX + (px + 0.5) * step, z = hf.originZ + (py + 0.5) * (hf.sizeZ / size), h = sampleHeight(hf, x, z);
    const gx = sampleHeight(hf, x + step, z) - sampleHeight(hf, x - step, z), gz = sampleHeight(hf, x, z + step) - sampleHeight(hf, x, z - step);
    const shade = Math.max(0.45, Math.min(1.35, 1 + (-gx - gz) * 0.035)), t = (h - min) / span;
    const ny = 1 / Math.hypot(1, gx / (2 * step), gz / (2 * step));
    const [r, g, b] = surfaceColor(hf, x, z, h, ny), light = 255 * shade * (0.9 + t * 0.23);
    const i = (py * size + px) * 4;
    out[i] = r * light; out[i + 1] = g * light; out[i + 2] = b * light; out[i + 3] = 255;
  }
  return out;
}
