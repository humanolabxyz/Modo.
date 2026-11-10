import {DataTexture, LinearFilter, LinearMipmapLinearFilter, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, type Texture} from 'three';
import {hash2} from '../terrain/noise.ts';

/** Detalle orgánico neutro: conserva la paleta de cada territorio y sus superficies pintadas. */
export function groundTexture(onLoad?: () => void) {
  const size = 256, data = new Uint8Array(size * size * 4);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const periodic = (x: number, z: number, n: number) => {
    const u = x * n / size, v = z * n / size, i = Math.floor(u), j = Math.floor(v);
    const a = hash2(n, i, j), b = hash2(n, (i + 1) % n, j);
    const c = hash2(n, i, (j + 1) % n), d = hash2(n, (i + 1) % n, (j + 1) % n);
    const f = smooth(u - i), g = smooth(v - j);
    return (a + (b - a) * f) * (1 - g) + (c + (d - c) * f) * g;
  };
  for (let z = 0; z < size; z++) for (let x = 0; x < size; x++) {
    // Manchas suaves, fibras y pequeños granos, sin introducir un color fijo en arena o roca.
    const patch = periodic(x, z, 9), detail = periodic(x, z, 39);
    const fleck = hash2(811, x, z);
    const value = Math.round(170 + patch * 28 + detail * 35 + fleck * 20);
    data.set([value, value, value, 255], (z * size + x) * 4);
  }
  const texture = new DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  // Textura local CC0: detalle fotográfico neutro para conservar la paleta de cada territorio.
  // Si el archivo no carga, el detalle procedural anterior sigue siendo utilizable.
  const photo = new Image();
  photo.onload = () => {
    const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
    const context = canvas.getContext('2d', {willReadFrequently: true}); if (!context) return;
    context.drawImage(photo, 0, 0, size, size);
    data.set(context.getImageData(0, 0, size, size).data);
    texture.needsUpdate = true; onLoad?.();
  };
  photo.src = '/agro/textures/ground-detail-polyhaven.jpg';
  return texture;
}

export function groundUV(positions: Float32Array) {
  const uv = new Float32Array(positions.length / 3 * 2);
  for (let i = 0, k = 0; i < positions.length; i += 3, k += 2) {
    uv[k] = positions[i] / 4;
    uv[k + 1] = positions[i + 2] / 4;
  }
  return uv;
}

export type GroundPhotos = {grass:Texture; dirt:Texture};

/** Material común al terreno y al exterior: fotografías reales mezcladas por cobertura, no manchas planas. */
export function groundMaterial(grain:Texture, photos:GroundPhotos|null, arid:boolean) {
  const material = new MeshStandardMaterial({map:grain,vertexColors:true,roughness:1,metalness:0});
  if (!photos) return material;
  material.onBeforeCompile = shader => {
    shader.uniforms.grassPhoto = {value:photos.grass}; shader.uniforms.dirtPhoto = {value:photos.dirt};
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      uniform sampler2D grassPhoto;
      uniform sampler2D dirtPhoto;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 terrainUV = vMapUv * 2.0;
      vec3 soilPhoto = texture2D(dirtPhoto, terrainUV).rgb;
      vec3 plantPhoto = texture2D(grassPhoto, terrainUV).rgb;
      float cover = ${arid ? '0.0' : 'smoothstep(0.005, 0.065, vColor.g - vColor.r)'};
      vec3 naturalPhoto = mix(soilPhoto, plantPhoto, cover);
      diffuseColor.rgb = mix(diffuseColor.rgb, naturalPhoto * 1.5, ${arid ? '0.32' : '0.66'});`);
  };
  material.customProgramCacheKey=()=>`ground-photos-${arid?'arid':'green'}`;
  return material;
}
