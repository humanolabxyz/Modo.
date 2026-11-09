import {useMemo, type RefObject} from 'react';
import {createPortal, useFrame} from '@react-three/fiber';
import {PerspectiveCamera, Scene} from 'three';
import {defaultParams, sizeOf, type ItemDef} from '../catalog/items.ts';
import {EntityBody} from './EntityMesh.tsx';
import {Boards, type ModelInstance} from './ModelParts.tsx';

/** Cada ficha tiene su propia escena dentro de un solo lienzo WebGL. */
function Preview({item, targets}: {item: ItemDef; targets: RefObject<Map<string, HTMLSpanElement>>}) {
  const params = useMemo(() => {
    const values = defaultParams(item);
    if (item.id === 'tuberia') values.largoM = 1.2; // muestra un tramo corto para que se distinga la sección
    return values;
  }, [item]);
  const scene = useMemo(() => new Scene(), []);
  const camera = useMemo(() => {
    const view = new PerspectiveCamera(31, 1, 0.1, 12);
    view.position.set(2.1, 1.7, 3.6);
    view.lookAt(0, 0, 0);
    return view;
  }, []);
  const [width, height, depth] = sizeOf(item, params);
  const scale = 2.35 / Math.hypot(width, height, depth);
  const furrows = useMemo(() => Array.from({length: 8}, (_, i): ModelInstance => ({
    at: [((i + 0.5) / 8 - 0.5) * width, 0.19, 0],
    size: [width * 0.08, 0.34, depth * 0.91],
    color: i % 2 ? '#657849' : '#7e8a53',
  })), [width, depth]);

  useFrame(({gl}) => {
    const rect = targets.current.get(item.id)?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;
    const canvas = gl.domElement.getBoundingClientRect();
    const left = rect.left - canvas.left, bottom = canvas.bottom - rect.bottom;
    const x = Math.max(0, left), right = Math.min(canvas.width, left + rect.width);
    if (right <= x) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    gl.setViewport(left, bottom, rect.width, rect.height);
    gl.setScissor(x, bottom, right - x, rect.height);
    gl.setScissorTest(true);
    gl.render(scene, camera);
    gl.setScissorTest(false);
  }, 2);

  return createPortal(<>
    <hemisphereLight args={['#f3f8ff', '#9aa7ad', 2.2]} />
    <directionalLight position={[-3, 5, 4]} intensity={2.7} />
    <directionalLight position={[2, 3, -4]} intensity={1.1} />
    <group scale={scale}>
      <group position={[0, -height / 2, 0]}>
        {item.id === 'parcela' ? <group>
          <mesh position={[0, -0.25, 0]}><boxGeometry args={[width, 0.5, depth]} /><meshStandardMaterial color="#786142" roughness={0.96} /></mesh>
          <Boards parts={furrows} c="#657849" tint={null} rough={0.9} />
        </group>
          : <EntityBody type={item.id} params={params} state={item.state} live={{wet: item.id === 'tuberia'}} />}
      </group>
    </group>
  </>, scene);
}

export function CatalogViews({items, targets}: {items: readonly ItemDef[]; targets: RefObject<Map<string, HTMLSpanElement>>}) {
  useFrame(({gl}) => {
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear();
  }, 1);
  return items.map(item => <Preview key={item.id} item={item} targets={targets} />);
}
