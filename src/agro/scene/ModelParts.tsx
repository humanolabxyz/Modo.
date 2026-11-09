import {useLayoutEffect, useMemo, useRef, type ReactNode} from 'react';
import {useThree} from '@react-three/fiber';
import {Color, InstancedMesh, Object3D} from 'three';

type Vec = [number, number, number];
export type ModelInstance = {at: Vec; size?: Vec; rotation?: Vec; color?: string};
export type ModelFinish = {c: string; tint: string | null; metal?: number; rough?: number};

export function Mat({c, tint, metal = 0.1, rough = 0.7}: ModelFinish) {
  return <meshStandardMaterial color={tint ?? c} transparent={!!tint} opacity={tint ? 0.6 : 1} roughness={rough} metalness={metal} depthWrite={!tint} />;
}

export function Instances({parts, geometry, c, tint, metal, rough}: ModelFinish & {parts: ModelInstance[]; geometry: ReactNode}) {
  const mesh = useRef<InstancedMesh>(null), {invalidate} = useThree();
  const transform = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    const model = mesh.current;
    if (!model) return;
    const color = new Color();
    for (const [i, part] of parts.entries()) {
      transform.position.set(...part.at);
      transform.rotation.set(...(part.rotation ?? [0, 0, 0]), 'YXZ');
      transform.scale.set(...(part.size ?? [1, 1, 1]));
      transform.updateMatrix();
      model.setMatrixAt(i, transform.matrix);
      model.setColorAt(i, color.set(tint ? '#ffffff' : part.color ?? c));
    }
    model.instanceMatrix.needsUpdate = true;
    if (model.instanceColor) model.instanceColor.needsUpdate = true;
    model.computeBoundingSphere();
    invalidate();
  }, [c, invalidate, parts, tint, transform]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, parts.length]} key={parts.length}>
    {geometry}
    <Mat c="#ffffff" tint={tint} metal={metal} rough={rough} />
  </instancedMesh>;
}

export function Boards(props: ModelFinish & {parts: ModelInstance[]}) {
  return <Instances {...props} geometry={<boxGeometry />} />;
}
