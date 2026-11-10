// Vegetación y nubes del paisaje (Fase 5c, arte 3D). Todo es decorativo: no entra en el mundo guardado ni en la simulación y nunca recibe clics.
// Los árboles se reparten con un generador determinista (semilla del terreno): el mismo mundo siempre tiene el mismo bosque. Se apartan de las piezas y de las parcelas.
import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {CanvasTexture, Color, InstancedMesh, Object3D, SRGBColorSpace} from 'three';
import {hash2} from '../terrain/noise.ts';
import {sampleHeight, slopeDegrees} from '../terrain/heightfield.ts';
import {valueNoise} from '../terrain/noise.ts';
import {roadDist, roadPoints} from '../terrain/landmarks.ts';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {WorldSession} from '../world/session.ts';
import {sceneryHeight} from '../terrain/exterior.ts';
import {decorativeFeatures, greenCover, waterSection} from '../terrain/surface.ts';
import {TERRITORIES} from '../terrain/presets.ts';
import {VEGETATION_SETS} from '../models/library.ts';
import {ecosystemModelIds, ecosystemPlacements} from './ecosystems.ts';
import {pickVariant} from '../models/normalize.ts';
import {GlbInstances, useReadyModels, type GlbItem} from './GlbModels.tsx';

type Tree = {x: number; y: number; z: number; s: number; kind: 0 | 1 | 2; hue: number; yaw: number};
/** Radio alrededor del sitio (m) dentro del cual la vegetación usa los modelos de la biblioteca. */
const NEAR_MODEL_M = 170;
const GREENS = ['#3c6232', '#466f36', '#345834', '#638042', '#748645'], PINES = ['#325c44', '#426749', '#2b5340'], SHRUBS = ['#6c7440', '#7a824c', '#555f38'];

/** Árboles repartidos por el paisaje, sin pisar piezas ni parcelas. `sig` cambia solo al mover o poner piezas o al editar el terreno. */
function scatter(session: WorldSession): Tree[] {
  const hf = session.terrain.hf, seed = hf.seed, out: Tree[] = [];
  const keep = session.entities.map(e => { const def = itemById(e.type); const [w, , d] = def ? sizeOf(def, e.params) : [2, 0, 2]; return {x: e.pose.position[0], z: e.pose.position[2], r: Math.hypot(w, d) / 2 + 5}; });
  const half = Math.min(hf.sizeX, hf.sizeZ) / 2, road = roadPoints(seed, half), features = decorativeFeatures(hf);
  const density = hf.params?.vegetation ?? TERRITORIES[hf.presetId].params.vegetation;
  if (density === 0) return out;
  const [siteX, siteZ] = session.site, arid = TERRITORIES[hf.presetId].landscape.dust;
  const count = Math.min(4800, Math.round(1100 + hf.sizeX * hf.sizeZ / 660));
  for (let k = 0; k < count + 1700; k++) {
    const outside = k >= count, span = outside ? 455 : 0;
    const x = (hash2(seed + 101, k, 1) * 2 - 1) * (hf.sizeX / 2 + span);
    const z = (hash2(seed + 202, k, 2) * 2 - 1) * (hf.sizeZ / 2 + span);
    if (outside && Math.abs(x) < hf.sizeX / 2 && Math.abs(z) < hf.sizeZ / 2) continue;
    if (Math.hypot(x - siteX, z - siteZ) < 39 || !outside && keep.some(p => Math.hypot(p.x - x, p.z - z) < p.r)) continue;
    const y = outside ? sceneryHeight(hf, x, z) : sampleHeight(hf, x, z);
    const slope = outside
      ? Math.atan(Math.hypot(sceneryHeight(hf, x + 5, z) - y, sceneryHeight(hf, x, z + 5) - y) / 5) * 180 / Math.PI
      : slopeDegrees(hf, x, z);
    if (slope > 37) continue;
    const green = greenCover(hf, x, z, Math.cos(slope * Math.PI / 180));
    const grove = valueNoise(seed + 29, x / 53, z / 53);
    const probability = density * (arid ? 0.025 + green * 1.6 : 0.19 + green * 1.2) * (0.38 + grove * 0.9);
    if (hash2(seed + 303, k, 3) > probability) continue;
    if (features.water) { const river = waterSection(hf, z); if (Math.abs(x - river.x) < river.half + 2) continue; }
    if (!outside && features.road && roadDist(seed, half, x, z, road) < 5) continue;
    const pick = hash2(seed + 404, k, 4);
    const kind: 0 | 1 | 2 = pick < (arid ? 0.58 : 0.17) ? 2 : !arid && (slope > 17 || pick > 0.73) ? 1 : 0;
    out.push({x, y, z, s: 0.7 + hash2(seed + 606, k, 6) * 0.95, kind, hue: hash2(seed + 707, k, 7), yaw: hash2(seed + 808, k, 8) * Math.PI * 2});
  }
  return out;
}

export function Vegetation({session}: {session: WorldSession}) {
  const {invalidate} = useThree();
  const sig = session.entities.map(e => `${e.type}:${e.pose.position[0].toFixed(1)}:${e.pose.position[2].toFixed(1)}`).join('|') + `#${session.terrain.edits.length}`;
  const trees = useMemo(() => scatter(session), [sig, session.terrain]); // eslint-disable-line react-hooks/exhaustive-deps
  // Etapa 6: en los territorios con biblioteca (hoy Oasis nortino y desierto) la vegetación cercana al sitio usa modelos reales; lo lejano, y todo lo que
  // no tenga modelo cargado, conserva la vegetación procedural de antes.
  const set = VEGETATION_SETS[session.terrain.presetId], ids = useMemo(() => (set ? [...set.trees, ...set.shrubs] : []), [set]), ready = useReadyModels(ids);
  // Ecosistemas con intención (palmares, huertos, matorral, pinares, cactales) según humedad y pendiente; en todos los territorios.
  const ecoIds = useMemo(() => ecosystemModelIds(session.terrain.presetId), [session.terrain.presetId]), ecoReady = useReadyModels(ecoIds);
  const ecosystems = useMemo(() => ecosystemPlacements(session, ecoReady, session.entities.map(e => { const def = itemById(e.type); const [w, , d] = def ? sizeOf(def, e.params) : [2, 0, 2]; return {x: e.pose.position[0], z: e.pose.position[2], r: Math.hypot(w, d) / 2 + 5}; })), [sig, session.terrain, ecoReady]); // eslint-disable-line react-hooks/exhaustive-deps
  const {procedural, placed} = useMemo(() => {
    const placed: Record<string, GlbItem[]> = {}, procedural: Tree[] = [];
    const [sx, sz] = session.site;
    for (const t of trees) {
      const pool = (t.kind === 2 ? set?.shrubs : t.kind === 0 ? set?.trees : undefined)?.filter(id => ready.has(id));
      if (!pool?.length || Math.hypot(t.x - sx, t.z - sz) > NEAR_MODEL_M) { procedural.push(t); continue; }
      (placed[pickVariant(pool, t.hue)] ??= []).push({x: t.x, y: t.y, z: t.z, yaw: t.yaw, s: 0.85 + (t.s - 0.7) / 0.95 * 0.4});
    }
    for (const [id, items] of Object.entries(ecosystems)) (placed[id] ??= []).push(...items);
    return {procedural, placed};
  }, [trees, set, ready, session.site, ecosystems]);
  const groups = useMemo(() => [0, 1, 2].map(k => procedural.filter(t => t.kind === k)), [procedural]);
  const refs = [useRef<InstancedMesh>(null), useRef<InstancedMesh>(null), useRef<InstancedMesh>(null)], trunks = [useRef<InstancedMesh>(null), useRef<InstancedMesh>(null), useRef<InstancedMesh>(null)];
  useLayoutEffect(() => {
    const o = new Object3D(), c = new Color();
    groups.forEach((list, k) => {
      const crown = refs[k].current, trunk = trunks[k].current; if (!crown || !trunk) return;
      list.forEach((t, i) => {
        o.rotation.set(0, t.yaw, 0); o.scale.setScalar(k === 2 ? t.s * 0.48 : t.s);
        o.position.set(t.x, t.y + t.s * (k === 2 ? 0.2 : 0.9), t.z); o.updateMatrix(); trunk.setMatrixAt(i, o.matrix);
        o.position.y = t.y + t.s * (k === 2 ? 0.64 : k === 1 ? 3.25 : 2.45); o.updateMatrix(); crown.setMatrixAt(i, o.matrix);
        const pal = k === 1 ? PINES : k === 2 ? SHRUBS : GREENS;
        crown.setColorAt(i, c.set(pal[Math.floor(t.hue * pal.length) % pal.length]));
      });
      crown.count = list.length; trunk.count = list.length; crown.instanceMatrix.needsUpdate = true; trunk.instanceMatrix.needsUpdate = true; if (crown.instanceColor) crown.instanceColor.needsUpdate = true;
      crown.computeBoundingSphere(); trunk.computeBoundingSphere();
    });
    invalidate();
  }, [groups, invalidate]); // eslint-disable-line react-hooks/exhaustive-deps
  const cap = (k: number) => Math.max(1, groups[k].length);
  const none = () => null;
  return <group name="vegetacion">
    {Object.entries(placed).map(([id, items]) => <GlbInstances key={id} id={id} items={items} />)}
    {[0, 1, 2].map(k => <group key={k}>
      <instancedMesh key={`t${k}-${cap(k)}`} ref={trunks[k]} args={[undefined, undefined, cap(k)]} raycast={none} frustumCulled={false}>
        <cylinderGeometry args={[0.16, 0.28, k === 1 ? 2.8 : 2.2, 5]} /><meshStandardMaterial color="#6b4a2b" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh key={`c${k}-${cap(k)}`} ref={refs[k]} args={[undefined, undefined, cap(k)]} raycast={none} frustumCulled={false}>
        {k === 1 ? <coneGeometry args={[1.5, 5.2, 7]} /> : <icosahedronGeometry args={[1.9, 0]} />}<meshStandardMaterial color="#ffffff" roughness={0.95} flatShading />
      </instancedMesh>
    </group>)}
  </group>;
}

/** Nubes: sprites suaves a gran altura, de textura dibujada (sin recursos externos). */
export function Clouds({seed, cover}: {seed: number; cover: number}) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d')!;
    const puff = (x: number, y: number, r: number) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); };
    puff(70, 74, 46); puff(120, 58, 54); puff(176, 72, 46); puff(130, 82, 40);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const items = useMemo(() => Array.from({length: Math.round(cover * 16)}, (_, i) => ({
    x: (hash2(seed + 901, i, 0) - 0.5) * 8800,
    z: (hash2(seed + 902, i, 1) - 0.5) * 8800,
    y: 1550 + hash2(seed + 903, i, 2) * 840,
    s: 760 + hash2(seed + 904, i, 3) * 1050,
  })).filter(c => Math.hypot(c.x, c.z) > 1250), [seed, cover]);
  return <group name="nubes">{items.map((c, i) => <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.34, 1]} raycast={() => null}><spriteMaterial map={tex} transparent depthWrite={false} opacity={0.53} /></sprite>)}</group>;
}
