import {useMemo, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3, Vector3} from 'three';
import ModelMesh from './ModelMesh';
import {modelParts, partBounds} from './models.ts';

export default function PartPreview({definitionId, name}: {definitionId: string; name: string}) {
  const {center, scale} = useMemo(() => {
    const bounds = new Box3();
    for (const part of modelParts(definitionId)) {
      const {min, max} = partBounds(part);
      bounds.expandByPoint(new Vector3(...min)).expandByPoint(new Vector3(...max));
    }
    return {
      center: bounds.getCenter(new Vector3()).negate(),
      scale: 1.7 / Math.max(bounds.getSize(new Vector3()).length(), 0.01),
    };
  }, [definitionId]);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);

  return <div className="ind-preview" tabIndex={0} role="group" aria-label={`Modelo 3D de ${name}. Usa las flechas para girar.`} onKeyDown={event => {
    const step = Math.PI / 12;
    const turns: Record<string, [number, number]> = {
      ArrowLeft: [0, -step], ArrowRight: [0, step], ArrowUp: [-step, 0], ArrowDown: [step, 0],
    };
    const turn = turns[event.key];
    if (!turn) return;
    event.preventDefault();
    setRotation(([x, y]) => [x + turn[0], y + turn[1]]);
  }}>
    <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{position: [1.6, 1.3, 2.8], fov: 35, near: 0.05, far: 25}}>
      <hemisphereLight args={['#f2f7ff', '#b8c4d6', 2.1]} />
      <directionalLight position={[-3, 4, 5]} intensity={2.3} />
      <directionalLight position={[3, 2, -3]} intensity={1.3} />
      <group rotation={[rotation[0], rotation[1], 0]} scale={scale}>
        <group position={center}>
          <ModelMesh definitionId={definitionId} detail="high" selected={false} door={definitionId === 'gabinete' ? 0.75 : 0} />
        </group>
      </group>
      <OrbitControls enablePan={false} minDistance={1.8} maxDistance={6} />
    </Canvas>
    <span>Arrastra o usa las flechas para girar</span>
  </div>;
}
