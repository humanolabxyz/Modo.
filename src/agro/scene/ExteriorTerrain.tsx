import {useCallback, useEffect, useMemo, useSyncExternalStore} from 'react';
import {useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, type Texture} from 'three';
import {buildExterior} from '../terrain/exterior.ts';
import {CHUNK_CELLS, type TerrainModel} from '../terrain/model.ts';
import {groundUV} from './groundTexture.ts';

export function ExteriorTerrain({model, grain}: {model: TerrainModel; grain: Texture}) {
  const {invalidate} = useThree();
  const subscribe = useCallback((fn: () => void) => model.subscribe(fn), [model]);
  const edgeVersions = useCallback(() => model.edgeVersion, [model]);
  const revision = useSyncExternalStore(subscribe, edgeVersions);
  const geometry = useMemo(() => {
    const mesh = buildExterior(model.hf, CHUNK_CELLS), g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(mesh.positions, 3));
    g.setAttribute('normal', new BufferAttribute(mesh.normals, 3));
    g.setAttribute('color', new BufferAttribute(mesh.colors, 3));
    g.setAttribute('uv', new BufferAttribute(groundUV(mesh.positions), 2));
    g.setIndex(new BufferAttribute(mesh.indices, 1));
    return g;
  }, [model, revision]);
  useEffect(() => { invalidate(); return () => geometry.dispose(); }, [geometry, invalidate]);
  return <mesh name="cinturón y horizonte escénicos" geometry={geometry} raycast={() => null}>
    <meshStandardMaterial map={grain} vertexColors roughness={1} />
  </mesh>;
}
