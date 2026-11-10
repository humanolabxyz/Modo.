import {DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace} from 'three';
import {hash2} from '../terrain/noise.ts';

/** Detalle de grano neutro. Se aplica en metros y continúa del terreno al exterior. */
export function groundTexture() {
  const size = 128, data = new Uint8Array(size * size * 4);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const periodic = (x: number, z: number, n: number) => {
    const u = x * n / size, v = z * n / size, i = Math.floor(u), j = Math.floor(v);
    const a = hash2(n, i, j), b = hash2(n, (i + 1) % n, j);
    const c = hash2(n, i, (j + 1) % n), d = hash2(n, (i + 1) % n, (j + 1) % n);
    const f = smooth(u - i), g = smooth(v - j);
    return (a + (b - a) * f) * (1 - g) + (c + (d - c) * f) * g;
  };
  for (let z = 0; z < size; z++) for (let x = 0; x < size; x++) {
    const value = Math.round(220 + periodic(x, z, 7) * 15 + periodic(x, z, 21) * 12 + hash2(811, x, z) * 8);
    data.set([value, value, value, 255], (z * size + x) * 4);
  }
  const texture = new DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function groundUV(positions: Float32Array) {
  const uv = new Float32Array(positions.length / 3 * 2);
  for (let i = 0, k = 0; i < positions.length; i += 3, k += 2) {
    uv[k] = positions[i] / 47;
    uv[k + 1] = positions[i + 2] / 47;
  }
  return uv;
}
