// Accidentes y construcciones decorativas del paisaje (Fase 5d, arte 3D): río, molino, granero, cercas, rocas y flores. Solo imagen: nada de esto entra en el mundo guardado ni en la simulación, y nada recibe clics.
// Las construcciones y las flores se apartan de las piezas del jugador.
import {useLayoutEffect, useMemo, useRef, type ReactNode} from 'react';
import {useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, Object3D} from 'three';
import {hash2} from '../terrain/noise.ts';
import {riverPoints, riverWidth} from '../terrain/landmarks.ts';
import {sampleHeight, slopeDegrees} from '../terrain/heightfield.ts';
import type {WorldSession} from '../world/session.ts';

const none = () => null;
function M({children, ...p}: {children?: ReactNode} & Record<string, unknown>) { return <mesh raycast={none} {...p}>{children}</mesh>; }

/** Cinta de agua del río: sigue el eje del río con la altura mínima de cada sección (superficie plana a lo ancho) y brilla un poco. */
function River({session}: {session: WorldSession}) {
  const {invalidate} = useThree(), rev = session.terrain.edits.length;
  const geometry = useMemo(() => {
    const hf = session.terrain.hf, half = Math.min(hf.sizeX, hf.sizeZ) / 2 - 5, pts = riverPoints(hf.seed, -half, half).filter(p => Math.abs(p.x) < half), pos: number[] = [], idx: number[] = [];
    let n = 0;
    for (const p of pts) {
      const w = riverWidth(hf.seed, p.z) / 2, y = Math.min(sampleHeight(hf, p.x - w, p.z), sampleHeight(hf, p.x, p.z), sampleHeight(hf, p.x + w, p.z)) + 0.1;
      pos.push(p.x - w, y, p.z, p.x + w, y, p.z); if (n > 0) idx.push(2 * (n - 1), 2 * (n - 1) + 1, 2 * n, 2 * n, 2 * (n - 1) + 1, 2 * n + 1); n++;
    }
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }, [session.terrain.hf, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { invalidate(); }, [geometry, invalidate]);
  return <mesh geometry={geometry} raycast={none} renderOrder={1}><meshStandardMaterial color="#3d93d6" transparent opacity={0.8} roughness={0.12} metalness={0.15} side={DoubleSide} depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></mesh>;
}

/** Rocas y flores sueltas (instancias). */
function Scatter({session, keep}: {session: WorldSession; keep: {x: number; z: number; r: number}[]}) {
  const {invalidate} = useThree(), rocks = useRef<InstancedMesh>(null), flowers = useRef<InstancedMesh>(null), rev = session.terrain.edits.length;
  const list = useMemo(() => {
    const hf = session.terrain.hf, seed = hf.seed, half = Math.min(hf.sizeX, hf.sizeZ) / 2 - 15, R: {x: number; y: number; z: number; s: number; r: number}[] = [], F: {x: number; y: number; z: number; s: number; r: number}[] = [];
    for (let k = 0; k < 900 && R.length < 260; k++) {
      const x = (hash2(seed + 41, k, 1) * 2 - 1) * half, z = (hash2(seed + 42, k, 2) * 2 - 1) * half, steep = slopeDegrees(hf, x, z);
      if (hash2(seed + 43, k, 3) > 0.1 + Math.min(0.9, steep / 30)) continue; if (keep.some(p => Math.hypot(p.x - x, p.z - z) < p.r)) continue;
      R.push({x, y: sampleHeight(hf, x, z), z, s: 0.5 + hash2(seed + 44, k, 4) * 1.6, r: hash2(seed + 45, k, 5)});
    }
    for (let k = 0; k < 1600; k++) {
      const x = (hash2(seed + 51, k, 1) * 2 - 1) * 110, z = (hash2(seed + 52, k, 2) * 2 - 1) * 110; if (Math.hypot(x, z) < 14 || keep.some(p => Math.hypot(p.x - x, p.z - z) < p.r) || slopeDegrees(hf, x, z) > 14) continue;
      F.push({x, y: sampleHeight(hf, x, z), z, s: 0.5 + hash2(seed + 53, k, 3) * 0.7, r: hash2(seed + 54, k, 4)});
    }
    return {R, F};
  }, [session.terrain.hf, rev, keep]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const o = new Object3D(), c = new Color(), rm = rocks.current, fm = flowers.current; if (!rm || !fm) return;
    list.R.forEach((p, i) => { o.position.set(p.x, p.y + p.s * 0.25, p.z); o.rotation.set(p.r * 3, p.r * 6, p.r * 2); o.scale.set(p.s * 1.2, p.s * 0.8, p.s); o.updateMatrix(); rm.setMatrixAt(i, o.matrix); rm.setColorAt(i, c.setHSL(0.08, 0.05, 0.38 + p.r * 0.2)); });
    const FLOWER = ['#f4e04a', '#ffffff', '#c58fe0', '#f08aa8'];
    list.F.forEach((p, i) => { o.position.set(p.x, p.y + 0.12, p.z); o.rotation.set(0, p.r * 6, 0); o.scale.setScalar(p.s); o.updateMatrix(); fm.setMatrixAt(i, o.matrix); fm.setColorAt(i, c.set(FLOWER[Math.floor(p.r * 4) % 4])); });
    rm.count = list.R.length; fm.count = list.F.length; for (const m of [rm, fm]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.computeBoundingSphere(); }
    invalidate();
  }, [list, invalidate]);
  return <group>
    <instancedMesh key={`r${list.R.length}`} ref={rocks} args={[undefined, undefined, Math.max(1, list.R.length)]} raycast={none} frustumCulled={false}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#ffffff" roughness={1} flatShading /></instancedMesh>
    <instancedMesh key={`f${list.F.length}`} ref={flowers} args={[undefined, undefined, Math.max(1, list.F.length)]} raycast={none} frustumCulled={false}><octahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color="#ffffff" roughness={0.8} /></instancedMesh>
  </group>;
}

/** Todo el paisaje decorativo: río, rocas y flores. Las construcciones (granero, molino, cerca, invernadero) son piezas del catálogo que construye el jugador. */
export function Landscape({session}: {session: WorldSession}) {
  const sig = session.entities.map(e => `${e.pose.position[0].toFixed(0)}:${e.pose.position[2].toFixed(0)}`).join('|');
  const keep = useMemo(() => session.entities.map(e => ({x: e.pose.position[0], z: e.pose.position[2], r: e.type === 'parcela' ? 22 : 5})), [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  return <group name="paisaje">
    <River session={session} />
    <Scatter session={session} keep={keep} />
  </group>;
}
