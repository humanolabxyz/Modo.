import {useCallback, useEffect, useMemo, useSyncExternalStore} from 'react';
import {useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, type Texture} from 'three';
import {buildExterior} from '../terrain/exterior.ts';
import {CHUNK_CELLS, type TerrainModel} from '../terrain/model.ts';
import {groundMaterial,groundUV,type GroundPhotos} from './groundTexture.ts';
import {TERRITORIES} from '../terrain/presets.ts';

export function ExteriorTerrain({model, grain, photos}: {model: TerrainModel; grain: Texture; photos:GroundPhotos|null}) {
  const {invalidate} = useThree();
  const subscribe = useCallback((fn: () => void) => model.subscribe(fn), [model]);
  const edgeVersions = useCallback(() => model.edgeVersion, [model]);
  const revision = useSyncExternalStore(subscribe, edgeVersions);
  const material=useMemo(()=>groundMaterial(grain,photos,TERRITORIES[model.presetId].landscape.dust),[grain,photos,model]);
  useEffect(()=>()=>material.dispose(),[material]);
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
  return <mesh name="cinturón y horizonte escénicos" geometry={geometry} material={material} raycast={() => null} />;
}
