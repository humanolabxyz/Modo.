// Accidentes y construcciones decorativas del paisaje (Fase 5d, arte 3D): río, molino, granero, cercas, rocas y flores. Solo imagen: nada de esto entra en el mundo guardado ni en la simulación, y nada recibe clics.
// Las construcciones y las flores se apartan de las piezas del jugador.
import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, Object3D} from 'three';
import {hash2, valueNoise} from '../terrain/noise.ts';
import {sampleHeight, slopeDegrees} from '../terrain/heightfield.ts';
import type {WorldSession} from '../world/session.ts';
import {itemById, sizeOf} from '../catalog/items.ts';
import {decorativeFeatures, greenCover, waterSection} from '../terrain/surface.ts';
import {TERRITORIES} from '../terrain/presets.ts';
import {sceneryHeight} from '../terrain/exterior.ts';
import {VEGETATION_SETS} from '../models/library.ts';
import {pickVariant} from '../models/normalize.ts';
import {GlbInstances, useReadyModels, type GlbItem} from './GlbModels.tsx';

const none = () => null;

/** Cinta de agua del río: sigue el eje del río con la altura mínima de cada sección (superficie plana a lo ancho) y brilla un poco. */
function River({session}: {session: WorldSession}) {
  const {invalidate} = useThree(), rev = session.terrain.edits.length;
  const geometry = useMemo(() => {
    const hf = session.terrain.hf, pos: number[] = [], idx: number[] = [];
    let previous = -1;
    for (let z = hf.originZ; z <= hf.originZ + hf.sizeZ; z += 3) {
      const {x, half: w} = waterSection(hf, z);
      if (x - w < hf.originX || x + w > hf.originX + hf.sizeX) { previous = -1; continue; }
      const n = pos.length / 3;
      const center = sampleHeight(hf, x, z);
      for (const t of [-1, -0.5, 0, 0.5, 1]) {
        const px = x + w * t, y = hf.generatorVersion === 1 ? sampleHeight(hf, px, z) : Math.min(sampleHeight(hf, px, z), center + 0.55);
        pos.push(px, y + 0.075, z);
      }
      if (previous >= 0) for (let i = 0; i < 4; i++) idx.push(previous + i, n + i, previous + i + 1, previous + i + 1, n + i, n + i + 1);
      previous = n;
    }
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }, [session.terrain.hf, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { invalidate(); }, [geometry, invalidate]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} raycast={none} renderOrder={1}><meshStandardMaterial color="#497884" transparent opacity={0.85} roughness={0.32} metalness={0.06} side={DoubleSide} depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></mesh>;
}

/** Rocas y flores sueltas (instancias). */
function Scatter({session, keep}: {session: WorldSession; keep: {x: number; z: number; r: number}[]}) {
  const {invalidate} = useThree(), rocks = useRef<InstancedMesh>(null), flowers = useRef<InstancedMesh>(null), rev = session.terrain.edits.length;
  const list = useMemo(() => {
    const hf = session.terrain.hf, seed = hf.seed, preset = TERRITORIES[hf.presetId], params = hf.params ?? preset.params;
    const [sx, sz] = session.site, features = decorativeFeatures(hf);
    const R: {x: number; y: number; z: number; s: number; r: number}[] = [], F: typeof R = [];
    const clear = (x: number, z: number) => {
      if (features.water) { const river = waterSection(hf, z); if (Math.abs(x - river.x) < river.half + 2) return false; }
      return !keep.some(p => Math.hypot(p.x - x, p.z - z) < p.r);
    };
    for (let k = 0; params.rocks > 0 && k < 1250 && R.length < 420; k++) {
      const x = (hash2(seed + 41, k, 1) - 0.5) * (hf.sizeX - 10), z = (hash2(seed + 42, k, 2) - 0.5) * (hf.sizeZ - 10), steep = slopeDegrees(hf, x, z);
      const gravel = valueNoise(seed + 63, x / 45, z / 60);
      if (hash2(seed + 43, k, 3) > params.rocks * (0.08 + Math.min(0.85, steep / 28) + gravel * 0.28)) continue;
      if (Math.hypot(x - sx, z - sz) < 39 || !clear(x, z)) continue;
      R.push({x, y: sampleHeight(hf, x, z), z, s: 0.55 + hash2(seed + 44, k, 4) * (preset.landscape.dust ? 2.7 : 1.8), r: hash2(seed + 45, k, 5)});
    }
    for (let k = 0; params.rocks > 0 && k < 460; k++) {
      const x = (hash2(seed + 76, k, 1) - 0.5) * (hf.sizeX + 640), z = (hash2(seed + 78, k, 2) - 0.5) * (hf.sizeZ + 640);
      if (Math.abs(x) < hf.sizeX / 2 && Math.abs(z) < hf.sizeZ / 2 || !clear(x, z)) continue;
      const patch = valueNoise(seed + 63, x / 60, z / 70);
      if (hash2(seed + 79, k, 3) > params.rocks * patch * 0.65) continue;
      R.push({x, y: sceneryHeight(hf, x, z), z, s: 1.2 + patch * 3, r: hash2(seed + 81, k, 4)});
    }
    for (let k = 0; params.vegetation > 0 && k < 470; k++) {
      const x = sx + (hash2(seed + 51, k, 1) - 0.5) * 210, z = sz + (hash2(seed + 52, k, 2) - 0.5) * 210;
      if (Math.hypot(x - sx, z - sz) < 16 || !clear(x, z) || slopeDegrees(hf, x, z) > 14 ||
        hash2(seed + 58, k, 8) > params.vegetation * greenCover(hf, x, z, 0.98)) continue;
      F.push({x, y: sampleHeight(hf, x, z), z, s: 0.5 + hash2(seed + 53, k, 3) * 0.7, r: hash2(seed + 54, k, 4)});
    }
    return {R, F};
  }, [session.terrain.hf, rev, keep]); // eslint-disable-line react-hooks/exhaustive-deps
  // Etapa 6: las rocas cercanas al sitio usan los modelos de la biblioteca (si el territorio los tiene y cargaron); el resto conserva las rocas procedurales.
  const rockSet = VEGETATION_SETS[session.terrain.presetId]?.rocks, rockReady = useReadyModels(rockSet ?? []);
  const rockSplit = useMemo(() => {
    const pool = (rockSet ?? []).filter(id => rockReady.has(id)), placed: Record<string, GlbItem[]> = {}, far: typeof list.R = [], [sx, sz] = session.site;
    for (const p of list.R) {
      if (!pool.length || Math.hypot(p.x - sx, p.z - sz) > 170) { far.push(p); continue; }
      (placed[pickVariant(pool, p.r)] ??= []).push({x: p.x, y: p.y - 0.04 * p.s, z: p.z, yaw: p.r * 6.28, s: p.s * 0.95});
    }
    return {far, placed};
  }, [list, rockSet, rockReady, session.site]);
  useLayoutEffect(() => {
    const o = new Object3D(), c = new Color(), rm = rocks.current, fm = flowers.current; if (!rm || !fm) return;
    const arid = TERRITORIES[session.terrain.presetId].landscape.dust;
    rockSplit.far.forEach((p, i) => { o.position.set(p.x, p.y + p.s * 0.25, p.z); o.rotation.set(p.r * 3, p.r * 6, p.r * 2); o.scale.set(p.s * 1.2, p.s * 0.8, p.s); o.updateMatrix(); rm.setMatrixAt(i, o.matrix); rm.setColorAt(i, c.setHSL(0.08, arid ? 0.25 : 0.05, 0.38 + p.r * 0.2)); });
    const FLOWER = ['#f4e04a', '#ffffff', '#c58fe0', '#f08aa8'];
    list.F.forEach((p, i) => { o.position.set(p.x, p.y + 0.12, p.z); o.rotation.set(0, p.r * 6, 0); o.scale.setScalar(p.s); o.updateMatrix(); fm.setMatrixAt(i, o.matrix); fm.setColorAt(i, c.set(FLOWER[Math.floor(p.r * 4) % 4])); });
    rm.count = rockSplit.far.length; fm.count = list.F.length; for (const m of [rm, fm]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.computeBoundingSphere(); }
    invalidate();
  }, [list, rockSplit, invalidate, session.terrain.presetId]);
  return <group>
    {Object.entries(rockSplit.placed).map(([id, items]) => <GlbInstances key={id} id={id} items={items} />)}
    <instancedMesh key={`r${rockSplit.far.length}`} ref={rocks} args={[undefined, undefined, Math.max(1, rockSplit.far.length)]} raycast={none} frustumCulled={false}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#ffffff" roughness={1} flatShading /></instancedMesh>
    <instancedMesh key={`f${list.F.length}`} ref={flowers} args={[undefined, undefined, Math.max(1, list.F.length)]} raycast={none} frustumCulled={false}><octahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color="#ffffff" roughness={0.8} /></instancedMesh>
  </group>;
}

/** Todo el paisaje decorativo: río, rocas y flores. Las construcciones (granero, molino, cerca, invernadero) son piezas del catálogo que construye el jugador. */
export function Landscape({session}: {session: WorldSession}) {
  const sig = session.entities.map(e => `${e.type}:${e.pose.position[0]}:${e.pose.position[2]}:${JSON.stringify(e.params)}`).join('|');
  const keep = useMemo(() => session.entities.map(e => {
    const def = itemById(e.type), [w, , d] = def ? sizeOf(def, e.params) : [2, 0, 2];
    return {x: e.pose.position[0], z: e.pose.position[2], r: Math.hypot(w, d) / 2 + 4};
  }), [sig, session]); // eslint-disable-line react-hooks/exhaustive-deps
  return <group name="paisaje">
    {decorativeFeatures(session.terrain.hf).water && <River session={session} />}
    <Scatter session={session} keep={keep} />
  </group>;
}
