// Componentes de escena para los modelos de la biblioteca 3D (Etapa 6). Solo imagen: no cambian el catálogo, los puertos ni la simulación.
import {useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import {useThree} from '@react-three/fiber';
import {Color, InstancedMesh, Object3D} from 'three';
import {loadModel, peekModel, type LoadedModel} from '../models/loader.ts';
import {modelById} from '../models/library.ts';

/** undefined = cargando · null = no disponible (usar respaldo) · modelo = listo. */
export function useModel(id: string | undefined): LoadedModel | null | undefined {
  const [state, set] = useState<LoadedModel | null | undefined>(() => (id ? peekModel(id) : null));
  useEffect(() => {
    if (!id) { set(null); return; }
    const entry = modelById(id);
    if (!entry) { set(null); return; }
    let live = true;
    const known = peekModel(id);
    if (known !== undefined) set(known);
    loadModel(entry).then(m => { if (live) set(m); });
    return () => { live = false; };
  }, [id]);
  return state;
}

/** Conjunto de modelos ya cargados con éxito. Quien reparte objetos deja la representación de respaldo para los que no estén en él. */
export function useReadyModels(ids: readonly string[]): ReadonlySet<string> {
  const key = ids.join('|');
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set(ids.filter(id => peekModel(id))));
  useEffect(() => {
    let live = true;
    Promise.all(ids.map(id => { const entry = modelById(id); return entry ? loadModel(entry).then(m => (m ? id : null)) : Promise.resolve(null); }))
      .then(r => { if (live) setReady(new Set(r.filter((id): id is string => !!id))); });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return ready;
}

const none = () => null;

/** Un modelo de la biblioteca como objeto único (estructuras). Mientras carga, o si falla, muestra `fallback`. */
export function GlbObject({id, fallback, tint = null}: {id: string; fallback: ReactNode; tint?: string | null}) {
  const model = useModel(id), entry = modelById(id);
  if (tint || !model) return <>{fallback}</>; // el fantasma de colocación conserva la forma sencilla coloreada
  return <group name={`glb:${id}`}>{model.parts.map((p, i) =>
    <mesh key={i} geometry={p.geometry} material={p.material} castShadow={entry?.shadows?.cast ?? false} receiveShadow={entry?.shadows?.receive ?? false} />)}</group>;
}

/** `s` escala uniforme; `sx` estira o comprime solo a lo largo del eje X del modelo (tramos de cerca). */
export type GlbItem = {x: number; y: number; z: number; yaw?: number; s?: number; sx?: number; color?: string};

/** Muchas copias de un modelo con una malla instanciada por material: pocas llamadas de dibujo sea cual sea la cantidad. */
export function GlbInstances({id, items}: {id: string; items: readonly GlbItem[]}) {
  const model = useModel(id);
  if (!model || !items.length) return null;
  return <group name={`glb-instancias:${id}`}>{model.parts.map((p, i) => <PartInstances key={`${i}-${items.length}`} part={p} items={items} />)}</group>;
}

function PartInstances({part, items}: {part: LoadedModel['parts'][number]; items: readonly GlbItem[]}) {
  const ref = useRef<InstancedMesh>(null), {invalidate} = useThree();
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new Object3D(), c = new Color();
    let coloured = false;
    items.forEach((it, i) => {
      o.position.set(it.x, it.y, it.z); o.rotation.set(0, it.yaw ?? 0, 0); o.scale.set((it.s ?? 1) * (it.sx ?? 1), it.s ?? 1, it.s ?? 1); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      if (it.color) { m.setColorAt(i, c.set(it.color)); coloured = true; }
    });
    m.count = items.length; m.instanceMatrix.needsUpdate = true;
    if (coloured && m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere(); invalidate();
  }, [items, invalidate]);
  return <instancedMesh ref={ref} args={[part.geometry, part.material, items.length]} raycast={none} frustumCulled={false} />;
}
