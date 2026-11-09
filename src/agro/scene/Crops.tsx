// Plantas del cultivo en hileras sobre la parcela (Fase 5c, arte 3D): cada planta es una instancia, con tamaño según el avance del ciclo y color según su salud.
// Es solo la imagen del estado de la simulación (`viewOf`): no guarda nada.
import {useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, Object3D} from 'three';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {Entity} from '../model/types.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import {viewOf} from '../sim/soil.ts';
import type {WorldSession} from '../world/session.ts';

const MAX_PLANTS = 3200;
const mixHex = (a: string, b: string, t: number): string => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * t).toString(16).padStart(2, '0')).join(''); };

// Cada planta usa dos niveles de hojas en una sola geometría que comparten todas las instancias.
function tomatoFoliage() {
  const positions: number[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3, s = Math.sin(angle), c = Math.cos(angle);
    const y = i % 2 ? 0.3 : 0.53, length = i % 2 ? 0.52 : 0.36;
    const point = (along: number, across: number, h: number) => [s * along + c * across, h, c * along - s * across];
    const a = point(0, 0, y - 0.13), b = point(length * 0.46, -0.14, y), d = point(length * 0.46, 0.14, y);
    const ridge = point(length * 0.5, 0, y + 0.08), tip = point(length, 0, y + 0.025);
    positions.push(...a, ...b, ...ridge, ...b, ...tip, ...ridge, ...tip, ...d, ...ridge, ...d, ...a, ...ridge);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}
const TOMATO_FOLIAGE = tomatoFoliage();

export function CropRows({entity, session}: {entity: Entity; session: WorldSession}) {
  const {invalidate} = useThree(), v = viewOf(entity.state), ref = useRef<InstancedMesh>(null), fruit = useRef<InstancedMesh>(null);
  const [w, , d] = sizeOf(itemById('parcela')!, entity.params), yaw = entity.pose.rotation[1], [px, , pz] = entity.pose.position;
  const cycle = v.crop ? Math.min(1, v.gdd / v.crop.stages[v.crop.stages.length - 1].from) : 0, q = Math.round(cycle * 50) / 50, ks = Math.round(v.ks * 10) / 10;
  const plants = useMemo(() => {
    const hf = session.terrain.hf, rowGap = Math.max(1.2, Math.sqrt((w * d) / MAX_PLANTS) * 1.5), plantGap = Math.max(0.8, (w * d) / MAX_PLANTS / rowGap), cos = Math.cos(yaw), sin = Math.sin(yaw), out: {x: number; y: number; z: number; r: number}[] = [];
    for (let lx = -w / 2 + rowGap / 2; lx < w / 2; lx += rowGap) for (let lz = -d / 2 + plantGap / 2; lz < d / 2; lz += plantGap) {
      const x = px + lx * cos + lz * sin, z = pz - lx * sin + lz * cos; out.push({x, y: sampleHeight(hf, x, z), z, r: ((Math.round(lx * 37 + lz * 91) % 17) + 17) % 17 / 17});
    }
    return out;
  }, [session.terrain.edits.length, w, d, yaw, px, pz]); // eslint-disable-line react-hooks/exhaustive-deps
  const show = !!v.crop;
  useLayoutEffect(() => {
    const m = ref.current, f = fruit.current; if (!m || !f) return;
    const o = new Object3D(), c = new Color(), base = !v.alive ? '#6b4f2a' : mixHex('#c9b23a', '#2f9e44', Math.min(1, Math.max(0, (ks - 0.2) / 0.8)));
    const size = v.crop ? 0.12 + 0.88 * Math.pow(q, 0.7) : 0.1;
    plants.forEach((p, i) => {
      const s = size * (0.85 + 0.3 * p.r); o.position.set(p.x, p.y, p.z); o.rotation.set(0, p.r * 6.28, 0); o.scale.set(s, s, s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(base).offsetHSL(0, 0, (p.r - 0.5) * 0.06));
      const showFruit = v.alive && q > 0.55; o.scale.setScalar(showFruit ? s * (v.ready ? 1 : 0.55) : 0.0001); o.updateMatrix(); f.setMatrixAt(i, o.matrix); f.setColorAt(i, c.set(v.ready ? '#e0402a' : '#9ccc4a'));
    });
    m.count = plants.length; f.count = plants.length; m.instanceMatrix.needsUpdate = true; f.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; if (f.instanceColor) f.instanceColor.needsUpdate = true;
    m.computeBoundingSphere(); f.computeBoundingSphere(); invalidate();
  }, [plants, q, ks, v.alive, v.ready, show, invalidate]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!show) return null;
  const none = () => null;
  return <group>
    <instancedMesh key={`p${plants.length}`} ref={ref} args={[TOMATO_FOLIAGE, undefined, plants.length]} raycast={none} frustumCulled={false}>
      <meshStandardMaterial color="#ffffff" roughness={0.88} side={DoubleSide} flatShading />
    </instancedMesh>
    <instancedMesh key={`f${plants.length}`} ref={fruit} args={[undefined, undefined, plants.length]} raycast={none} frustumCulled={false} position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.105, 6, 4]} /><meshStandardMaterial color="#ffffff" roughness={0.6} />
    </instancedMesh>
  </group>;
}
