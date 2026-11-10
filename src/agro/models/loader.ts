// Cargador de modelos glTF/GLB de la biblioteca (Etapa 6). Normaliza escala y pivote, armoniza materiales y cachea.
// Si un modelo falla (archivo ausente, GLB dañado, sin mallas) devuelve null y avisa una sola vez: quien lo usa conserva su representación de respaldo.
import {Box3, Color, DoubleSide, Matrix4, Mesh, MeshStandardMaterial, type BufferGeometry} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {normalizeBounds} from './normalize.ts';
import type {ModelEntry} from './types.ts';

export type ModelPart = {geometry: BufferGeometry; material: MeshStandardMaterial; name: string};
export type LoadedModel = {id: string; parts: ModelPart[]; size: readonly [number, number, number]; tris: number};

const loader = new GLTFLoader();

/** Interruptor para equipos lentos o para comparar: `localStorage['modo-agro-modelos'] = 'off'` o `?modelos=off` devuelve la imagen procedural de siempre. */
export function modelsDisabled(): boolean {
  try { return localStorage.getItem('modo-agro-modelos') === 'off' || new URLSearchParams(location.search).get('modelos') === 'off'; } catch { return false; }
}
const cache = new Map<string, Promise<LoadedModel | null>>();
const done = new Map<string, LoadedModel | null>();
const warned = new Set<string>();

const harmonize = (source: MeshStandardMaterial, entry: ModelEntry): MeshStandardMaterial => {
  const color = new Color().copy(source.color), forced = entry.palette?.[source.name];
  if (forced) color.set(forced);
  else if (entry.tone) {
    const hsl = {h: 0, s: 0, l: 0};
    color.getHSL(hsl);
    color.setHSL(hsl.h, Math.min(1, hsl.s * entry.tone.sat), Math.min(0.95, hsl.l * entry.tone.light));
  }
  const planty = entry.family === 'arboles-vegetacion' || entry.family === 'cultivos';
  return new MeshStandardMaterial({name: source.name, color, roughness: Math.max(0.78, source.roughness ?? 0.9), metalness: 0, flatShading: true, side: planty ? DoubleSide : source.side});
};

async function build(entry: ModelEntry): Promise<LoadedModel | null> {
  if (!entry.file || modelsDisabled()) return null;
  const gltf = await loader.loadAsync(entry.file);
  gltf.scene.updateMatrixWorld(true);
  const yaw = new Matrix4().makeRotationY(entry.yaw ?? 0), raw: {geometry: BufferGeometry; material: MeshStandardMaterial}[] = [], box = new Box3();
  gltf.scene.traverse(o => {
    const mesh = o as Mesh;
    if (!mesh.isMesh || (mesh as unknown as {isSkinnedMesh?: boolean}).isSkinnedMesh) return;
    const geometry = mesh.geometry.clone().applyMatrix4(new Matrix4().multiplyMatrices(yaw, mesh.matrixWorld));
    geometry.computeBoundingBox();
    box.union(geometry.boundingBox!);
    const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial;
    raw.push({geometry, material});
  });
  if (!raw.length || box.isEmpty()) throw new Error('sin mallas');
  const n = normalizeBounds(box.min.toArray() as [number, number, number], box.max.toArray() as [number, number, number], entry.fit);
  const place = new Matrix4().makeTranslation(...n.offset).multiply(new Matrix4().makeScale(n.scale, n.scale, n.scale));
  const mats = new Map<MeshStandardMaterial, MeshStandardMaterial>();
  let tris = 0;
  // Una sola malla por material: menos llamadas de dibujo (un granero de 14 piezas pasa a 4) sin perder ningún triángulo.
  const groups = new Map<MeshStandardMaterial, BufferGeometry[]>();
  for (const {geometry, material} of raw) {
    geometry.applyMatrix4(place);
    geometry.deleteAttribute('uv'); // la biblioteca no usa texturas: el UV no se necesita
    for (const name of Object.keys(geometry.attributes)) if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name);
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    if (!mats.has(material)) mats.set(material, harmonize(material, entry));
    (groups.get(material) ?? groups.set(material, []).get(material)!).push(geometry.index ? geometry.toNonIndexed() : geometry);
  }
  const parts: ModelPart[] = [...groups].flatMap(([material, list]) => {
    const merged = list.length > 1 ? mergeGeometries(list, false) : list[0];
    const geometries = merged ? [merged] : list; // si no se pueden fusionar, se conservan separadas (nunca se pierde geometría)
    return geometries.map(geometry => { geometry.computeBoundingSphere(); tris += geometry.attributes.position.count / 3; return {geometry, material: mats.get(material)!, name: material.name}; });
  });
  return {id: entry.id, parts, size: n.size, tris};
}

/** Carga (una vez) un modelo de la biblioteca. Nunca lanza: ante cualquier fallo devuelve null y avisa por consola una sola vez. */
export function loadModel(entry: ModelEntry): Promise<LoadedModel | null> {
  let p = cache.get(entry.id);
  if (!p) {
    p = build(entry)
      .catch(error => {
        if (!warned.has(entry.id)) { warned.add(entry.id); console.warn(`[agro] modelo «${entry.id}» no disponible; se usa la representación de respaldo:`, error instanceof Error ? error.message : error); }
        return null;
      })
      .then(model => { done.set(entry.id, model); return model; });
    cache.set(entry.id, p);
  }
  return p;
}

/** Estado síncrono: undefined = todavía no se pidió o está cargando · null = falló · modelo = listo. */
export const peekModel = (id: string): LoadedModel | null | undefined => done.get(id);
export function resetModelCache() { cache.clear(); done.clear(); warned.clear(); }
