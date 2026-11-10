import {useMemo} from 'react';
import {Line} from '@react-three/drei';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {Entity, Vec3} from '../model/types.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import {cablePoints} from '../world/connections.ts';
import type {ImpactReport} from '../world/impact.ts';
import {footprint, portWorld} from '../world/placement.ts';
import type {WorldSession} from '../world/session.ts';
import {Outline} from './EntityMesh.tsx';

export type ReviewFocus = {kind: 'entity' | 'connection'; id: string};
export type ReviewTarget = {point: Vec3; distance: number};
type Installation = {id: string; entity: Entity; target: ReviewTarget; footprint?: Vec3[]};
type Link = {id: string; points: Vec3[]; target: ReviewTarget};

/** Geometría de referencia para inspeccionar el trazo. Se deriva de las poses y puertos actuales. */
export function terrainReviewScene(session: WorldSession, report: ImpactReport) {
  const entities = new Map(session.entities.map(e => [e.id, e]));
  const connections = new Map(session.connections.map(c => [c.id, c]));
  const hf = session.terrain.hf;
  const installations = report.entities.flatMap<Installation>(({id}) => {
    const entity = entities.get(id); if (!entity) return [];
    const def = itemById(entity.type), size: Vec3 = def ? sizeOf(def, entity.params) : [1, 1, 1];
    const [x, y, z] = entity.pose.position, top = Math.max(y + size[1], sampleHeight(hf, x, z));
    const corners = entity.type === 'parcela' ? footprint(entity.pose, size) : null;
    return [{id, entity, target: {point: [x, top, z], distance: Math.max(10, 3.1 * Math.max(...size))},
      ...(corners && {footprint: [...corners, corners[0]].map(([px, pz]) => [px, sampleHeight(hf, px, pz) + 0.25, pz])})}];
  });
  const links = report.connections.flatMap<Link>(({id}) => {
    const link = connections.get(id); if (!link) return [];
    const ea = entities.get(link.a.entityId), eb = entities.get(link.b.entityId);
    const pa = ea?.ports.find(p => p.id === link.a.portId), pb = eb?.ports.find(p => p.id === link.b.portId);
    if (!ea || !eb || !pa || !pb) return [];
    const a = portWorld(ea, pa), b = portWorld(eb, pb);
    const start: Vec3 = [a.x, a.y, a.z], end: Vec3 = [b.x, b.y, b.z];
    const points = link.route?.length ? [start, ...link.route, end] : link.kind === 'hydraulic' ? [start, end] : cablePoints(a, b);
    const bounds = ([0, 1, 2] as const).map(axis => {
      const values = points.map(p => p[axis]);
      return [Math.min(...values), Math.max(...values)];
    });
    const [x, y, z] = bounds.map(([lo, hi]) => (lo + hi) / 2);
    return [{id, points, target: {point: [x, Math.max(y, sampleHeight(hf, x, z)), z], distance: Math.max(12, 2.5 * Math.hypot(...bounds.map(([lo, hi]) => hi - lo)))}}];
  });
  return {installations, links};
}

const AMBER = '#ffb63d', FOCUS = '#fff1a3', NETWORK = '#ffdd85';

function Marker({point, size, color}: {point: Vec3; size: number; color: string}) {
  return <mesh position={point} renderOrder={20} raycast={() => null}>
    <octahedronGeometry args={[size]} /><meshBasicMaterial color={color} depthTest={false} depthWrite={false} toneMapped={false} />
  </mesh>;
}

export function TerrainReviewLayer({scene, focus}: {scene: ReturnType<typeof terrainReviewScene>; focus: ReviewFocus | null}) {
  const dense = scene.installations.length + scene.links.length > 80;
  // En revisiones grandes, las marcas generales se dibujan juntas y el detalle se reserva para la fila activa.
  const positions = useMemo(() => {
    if (!dense) return null;
    const anchors = scene.installations.map(({target: {point: [x, y, z]}}) => [x, y + 0.35, z]);
    for (const {points} of scene.links) anchors.push(points[0], points.at(-1)!);
    return new Float32Array(anchors.flat());
  }, [scene, dense]);
  return <group name="revisión del terreno">
    {positions && <points renderOrder={19} raycast={() => null}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color={AMBER} size={4} sizeAttenuation={false} depthTest={false} depthWrite={false} toneMapped={false} />
    </points>}
    {scene.installations.map(({id, entity, target, footprint: border}) => {
      const active = focus?.kind === 'entity' && focus.id === id, color = active ? FOCUS : AMBER;
      if (dense && !active) return null;
      const [x, y, z] = target.point;
      return <group key={id}>
        {border ? <Line points={border} color={color} lineWidth={active ? 4 : 2} depthTest={false} renderOrder={17} /> :
          itemById(entity.type) && <group position={entity.pose.position} rotation={entity.pose.rotation}><Outline entity={entity} color={color} /></group>}
        <Marker point={[x, y + (active ? 0.65 : 0.35), z]} size={active ? 0.46 : 0.19} color={color} />
      </group>;
    })}
    {scene.links.map(({id, points, target}) => {
      const active = focus?.kind === 'connection' && focus.id === id, color = active ? FOCUS : NETWORK;
      if (dense && !active) return null;
      return <group key={id}>
        <Line points={points} color={color} lineWidth={active ? 5 : 2} dashed dashSize={0.35} gapSize={0.18} depthTest={false} renderOrder={18} />
        <Marker point={points[0]} size={active ? 0.27 : 0.12} color={color} />
        <Marker point={points.at(-1)!} size={active ? 0.27 : 0.12} color={color} />
        {active && <Marker point={[target.point[0], target.point[1] + 0.55, target.point[2]]} size={0.35} color={color} />}
      </group>;
    })}
  </group>;
}
