import {useMemo, useRef, type ReactNode} from 'react';
import {useFrame, type ThreeEvent} from '@react-three/fiber';
import {Group, Vector3} from 'three';
import {shapeOf} from '../build/shapes.ts';
import {RoundedBox} from '@react-three/drei';
import {modelParts, type Detail, type Part, type Variant} from './models.ts';
import {DOORS, doorAngle} from './doors.ts';

export default function ModelMesh({definitionId, detail, selected, overlapping, glow, only, variant, doorMode, door, cutRoom, onDoorClick, uncoverDuct, cabinetPlate}: {definitionId: string; detail: Detail; selected: boolean; overlapping?: boolean; glow?: string; only?: (y: number) => boolean; variant?: Variant; doorMode?: string; /** avance de la puerta 0..1 */ door?: number; cutRoom?: boolean; onDoorClick?(event: ThreeEvent<MouseEvent>): void; uncoverDuct?: boolean; cabinetPlate?: boolean}) {
  const all = useMemo(() => modelParts(definitionId, detail, variant ?? 'din'), [definitionId, detail, variant]);
  const parts = only ? all.filter(p => only(p.pos[1])) : all;
  const draw = (p: Part, i: number) => {
    const bodyLike = p.role === 'body' || p.role === 'front';
    const glowing = glow !== undefined && (definitionId === 'piloto' ? p.role === 'lens' : p.role === 'body' || p.role === 'front');
    const emissive = p.emissive ?? (glowing ? glow : selected && bodyLike ? '#1b4fc4' : '#000000');
    const intensity = p.emissive ? 0.9 : glowing ? 0.75 : selected && bodyLike ? 0.4 : 0;
    const cover = p.role === 'lens' && (definitionId === 'canaleta' || definitionId === 'canaleta-vertical');
    if (cover && uncoverDuct) return null;
    const color = cabinetPlate && bodyLike ? (p.role === 'front' ? '#b6c1c9' : '#a7b4c0') : overlapping && bodyLike ? '#d9534f' : p.color;
    const rotation: [number, number, number] = p.shape === 'cyl' ? (p.axis === 'x' ? [0, 0, Math.PI / 2] : p.axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]) : [0, 0, 0];
    const shiny = p.role === 'metal' || p.role === 'screw', soft = detail === 'high' && p.shape === 'box' && !p.fine && Math.min(p.size[0], p.size[1], p.size[2]) > 0.012;
    // Puerta del gabinete: transparente (se ven los aparatos de dentro) o cerrada
    const ghost = p.tag === 'door' && definitionId === 'gabinete' && doorMode === 'transparente' && (door ?? 0) === 0;
    const mat = <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} roughness={shiny ? 0.28 : p.role === 'lens' ? 0.15 : p.role === 'trim' ? 0.45 : 0.55} metalness={shiny ? 0.85 : 0.04} transparent={(p.role === 'lens' && !cover) || ghost} opacity={ghost ? 0.13 : p.role === 'lens' && !cover ? p.opacity ?? 0.92 : 1} depthWrite={!ghost} />;
    const click = p.tag === 'door' ? onDoorClick : undefined;
    const interactions = click ? {
      onClick: click,
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        if (event.nativeEvent.target instanceof HTMLCanvasElement) event.nativeEvent.target.style.cursor = 'pointer';
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        if (event.nativeEvent.target instanceof HTMLCanvasElement) event.nativeEvent.target.style.cursor = '';
      },
    } : {raycast: () => null};
    const shadowed = detail === 'high' && !p.fine && !ghost;
    if (soft) return <RoundedBox key={i} args={p.size} radius={Math.min(0.004, Math.min(p.size[0], p.size[1], p.size[2]) * 0.18)} smoothness={3} position={p.pos} {...interactions} castShadow={shadowed} receiveShadow>{mat}</RoundedBox>;
    return <mesh key={i} position={p.pos} rotation={rotation} {...interactions} castShadow={shadowed} receiveShadow={detail === 'high'}>
      {p.shape === 'box' ? <boxGeometry args={p.size} /> : p.shape === 'cyl' ? <cylinderGeometry args={[p.size[0], p.size[0], p.size[1], detail === 'high' ? 32 : 16]} /> : <sphereGeometry args={[p.size[0], detail === 'high' ? 20 : 12, detail === 'high' ? 14 : 8]} />}
      {mat}
    </mesh>;
  };
  // La puerta (panel y herrajes) gira en torno a su bisagra vertical; el resto queda fijo
  const hinge = DOORS[definitionId];
  const fixed = parts.map((p, i) => [p, i] as const).filter(([p]) => !p.tag), swung = parts.map((p, i) => [p, i] as const).filter(([p]) => !!p.tag);
  const doorGroup = swung.length > 0 && (hinge
    ? <group position={[hinge.pivot[0], 0, hinge.pivot[2]]} rotation={[0, doorAngle(definitionId, door ?? 0), 0]}><group position={[-hinge.pivot[0], 0, -hinge.pivot[2]]}>{swung.map(([p, i]) => draw(p, i))}</group></group>
    : swung.map(([p, i]) => draw(p, i)));
  if (definitionId !== 'sala-electrica' || !cutRoom) return <>{fixed.map(([p, i]) => draw(p, i))}{doorGroup}</>;
  const [w, , d] = shapeOf(definitionId).size;
  const sides = [[0, -1, w / 2], [0, 1, w / 2], [2, -1, d / 2], [2, 1, d / 2]] as const;
  const buckets: (readonly [Part, number])[][] = [[], [], [], [], []];
  for (const item of fixed) {
    const [p] = item;
    const side = p.shape === 'box' && p.pos[1] > 0.19
      ? sides.findIndex(([axis, sign, edge]) => p.pos[axis] * sign > edge - 0.17)
      : -1;
    buckets[side + 1].push(item);
  }
  return <>{buckets[0].map(([p, i]) => draw(p, i))}{sides.map(([axis, sign, edge], side) =>
    <RoomSide key={side} axis={axis} sign={sign} edge={edge}>
      {buckets[side + 1].map(([p, i]) => draw(p, i))}
      {side === 1 && doorGroup}
    </RoomSide>)}</>;
}

function RoomSide({axis, sign, edge, children}: {axis: 0 | 2; sign: number; edge: number; children: ReactNode}) {
  const group = useRef<Group>(null);
  const local = useMemo(() => new Vector3(), []);
  useFrame(({camera}) => {
    if (!group.current) return;
    group.current.worldToLocal(local.copy(camera.position));
    group.current.visible = local.getComponent(axis) * sign < edge - 0.08;
  });
  return <group ref={group}>{children}</group>;
}

