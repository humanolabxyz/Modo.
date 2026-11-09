// Vegetación y nubes del paisaje (Fase 5c, arte 3D). Todo es decorativo: no entra en el mundo guardado ni en la simulación y nunca recibe clics.
// Los árboles se reparten con un generador determinista (semilla del terreno): el mismo mundo siempre tiene el mismo bosque. Se apartan de las piezas y de las parcelas.
import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {CanvasTexture, Color, InstancedMesh, Object3D, SRGBColorSpace} from 'three';
import {hash2} from '../terrain/noise.ts';
import {sampleHeight, slopeDegrees} from '../terrain/heightfield.ts';
import {valueNoise} from '../terrain/noise.ts';
import {riverInfo, roadDist, roadPoints} from '../terrain/landmarks.ts';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {WorldSession} from '../world/session.ts';

type Tree = {x: number; y: number; z: number; s: number; kind: 0 | 1 | 2; hue: number; yaw: number};
const GREENS = ['#2f7d32', '#3f9142', '#27682d', '#4b9b3a', '#5aa642'], PINES = ['#1f5a35', '#2a6a3c', '#17492c'], BLOSSOM = ['#f0a6c4', '#f4d46a', '#f7e7b0'];

/** Árboles repartidos por el paisaje, sin pisar piezas ni parcelas. `sig` cambia solo al mover o poner piezas o al editar el terreno. */
function scatter(session: WorldSession): Tree[] {
  const hf = session.terrain.hf, seed = hf.seed, out: Tree[] = [];
  const keep = session.entities.map(e => { const def = itemById(e.type); const [w, , d] = def ? sizeOf(def, e.params) : [2, 0, 2]; return {x: e.pose.position[0], z: e.pose.position[2], r: e.type === 'parcela' ? Math.hypot(w, d) / 2 + 5 : 7}; });
  const half = Math.min(hf.sizeX, hf.sizeZ) / 2 - 20, road = roadPoints(seed, half + 20);
  const place = (n: number, range: number, near: number) => {
    for (let k = 0; k < n; k++) {
      const x = (hash2(seed + 101, k, 1) * 2 - 1) * range, z = (hash2(seed + 202, k, 2) * 2 - 1) * range; if (Math.abs(x) > half || Math.abs(z) > half) continue;
      const d = Math.hypot(x, z); if (d < near) continue;
      const y = sampleHeight(hf, x, z); if (y > 125 || slopeDegrees(hf, x, z) > 32) continue;
      const wood = valueNoise(seed + 83, x / 150, z / 150), grove = valueNoise(seed + 29, x / 60, z / 60);
      if (hash2(seed + 303, k, 3) > Math.min(1, 0.08 + Math.max(0, wood - 0.42) * 1.9 + Math.max(0, grove - 0.62) * 1.2)) continue;
      if (keep.some(p => Math.hypot(p.x - x, p.z - z) < p.r)) continue;
      const ri = riverInfo(seed, x, z); if (ri.dist < ri.half + 6 || roadDist(seed, half + 20, x, z, road) < 6) continue;
      const kind: 0 | 1 | 2 = y > 55 || hash2(seed + 404, k, 4) < 0.28 ? 1 : hash2(seed + 505, k, 5) < 0.05 ? 2 : 0;
      out.push({x, y, z, s: 0.7 + hash2(seed + 606, k, 6) * 0.9, kind, hue: hash2(seed + 707, k, 7), yaw: hash2(seed + 808, k, 8) * Math.PI * 2});
    }
  };
  place(1500, half, 38);      // pradera y bosques, lejos de la zona de la finca
  place(260, 120, 34);        // algunos árboles sueltos cerca de la finca
  return out;
}

export function Vegetation({session}: {session: WorldSession}) {
  const {invalidate} = useThree();
  const sig = session.entities.map(e => `${e.type}:${e.pose.position[0].toFixed(1)}:${e.pose.position[2].toFixed(1)}`).join('|') + `#${session.terrain.edits.length}`;
  const trees = useMemo(() => scatter(session), [sig, session.terrain]); // eslint-disable-line react-hooks/exhaustive-deps
  const groups = useMemo(() => [0, 1, 2].map(k => trees.filter(t => t.kind === k)), [trees]);
  const refs = [useRef<InstancedMesh>(null), useRef<InstancedMesh>(null), useRef<InstancedMesh>(null)], trunks = [useRef<InstancedMesh>(null), useRef<InstancedMesh>(null), useRef<InstancedMesh>(null)];
  useLayoutEffect(() => {
    const o = new Object3D(), c = new Color();
    groups.forEach((list, k) => {
      const crown = refs[k].current, trunk = trunks[k].current; if (!crown || !trunk) return;
      list.forEach((t, i) => {
        o.position.set(t.x, t.y, t.z); o.rotation.set(0, t.yaw, 0); o.scale.setScalar(t.kind === 2 ? t.s * 0.75 : t.s); o.updateMatrix(); crown.setMatrixAt(i, o.matrix); trunk.setMatrixAt(i, o.matrix);
        const pal = k === 1 ? PINES : GREENS; crown.setColorAt(i, c.set(k === 2 ? BLOSSOM[Math.floor(t.hue * BLOSSOM.length) % BLOSSOM.length] : pal[Math.floor(t.hue * pal.length) % pal.length]));
      });
      crown.count = list.length; trunk.count = list.length; crown.instanceMatrix.needsUpdate = true; trunk.instanceMatrix.needsUpdate = true; if (crown.instanceColor) crown.instanceColor.needsUpdate = true;
      crown.computeBoundingSphere(); trunk.computeBoundingSphere();
    });
    invalidate();
  }, [groups, invalidate]); // eslint-disable-line react-hooks/exhaustive-deps
  const cap = (k: number) => Math.max(1, groups[k].length);
  const none = () => null;
  return <group name="vegetacion">
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
export function Clouds() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d')!;
    const puff = (x: number, y: number, r: number) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); };
    puff(70, 74, 46); puff(120, 58, 54); puff(176, 72, 46); puff(130, 82, 40);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  const items = useMemo(() => Array.from({length: 14}, (_, i) => ({x: Math.cos(i * 2.4) * (500 + (i % 5) * 260), z: Math.sin(i * 2.4) * (500 + (i % 4) * 300), y: 380 + (i % 3) * 70, s: 380 + (i % 4) * 140})), []);
  return <group name="nubes">{items.map((c, i) => <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s / 2, 1]} raycast={() => null} renderOrder={-1}><spriteMaterial map={tex} transparent depthWrite={false} fog={false} opacity={0.9} /></sprite>)}</group>;
}
