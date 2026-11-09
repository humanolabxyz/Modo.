import {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Sphere, Vector3, type Group} from 'three';
import {buildChunk, chunkRect, lodForDistance, LOD_STRIDES, type ChunkData} from '../terrain/chunks.ts';
import type {TerrainModel} from '../terrain/model.ts';

type Slot = {mesh: Mesh; lod: number; version: number; cache: Map<number, {version: number; geometry: BufferGeometry}>};

function toGeometry(d: ChunkData): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(d.positions, 3));
  g.setAttribute('normal', new BufferAttribute(d.normals, 3));
  g.setAttribute('color', new BufferAttribute(d.colors, 3));
  g.setIndex(new BufferAttribute(d.indices, 1));
  g.boundingSphere = new Sphere(new Vector3(...d.center), d.radius);
  return g;
}

const MAX_BUILDS_PER_FRAME = 6;

/** Terreno por chunks: cada uno elige su nivel de detalle según la distancia a la cámara y se reconstruye solo si su versión cambia. */
export function TerrainMesh({model}: {model: TerrainModel}) {
  const group = useRef<Group>(null);
  const slots = useRef(new Map<number, Slot>());
  const dirty = useRef(true);
  const {camera, invalidate} = useThree();
  const material = useMemo(() => new MeshStandardMaterial({vertexColors: true, roughness: 1, metalness: 0}), []);

  useEffect(() => {
    dirty.current = true; invalidate();
    return model.subscribe(() => { dirty.current = true; invalidate(); });
  }, [model, invalidate]);

  useEffect(() => () => {
    for (const slot of slots.current.values()) { for (const c of slot.cache.values()) c.geometry.dispose(); slot.mesh.removeFromParent(); }
    slots.current.clear(); material.dispose();
  }, [material, model]);

  useFrame(() => {
    const parent = group.current; if (!parent) return;
    const {hf} = model; let builds = 0, pending = false;
    for (let cz = 0; cz < model.chunksZ; cz++) for (let cx = 0; cx < model.chunksX; cx++) {
      const index = model.chunkIndex(cx, cz), rect = chunkRect(hf, cx, cz);
      const dx = camera.position.x - rect.centerX, dz = camera.position.z - rect.centerZ, dy = camera.position.y - hf.data[(rect.c0j + (rect.h >> 1)) * hf.nx + rect.c0i + (rect.w >> 1)];
      const lod = lodForDistance(Math.sqrt(dx * dx + dz * dz + dy * dy) - 70), version = model.versions[index];
      let slot = slots.current.get(index);
      if (slot && slot.lod === lod && slot.version === version) continue;
      const cached = slot?.cache.get(lod);
      if (!cached || cached.version !== version) {
        if (builds >= MAX_BUILDS_PER_FRAME) { pending = true; continue; }
        builds++;
        const geometry = toGeometry(buildChunk(hf, cx, cz, lod));
        if (!slot) { const mesh = new Mesh(geometry, material); mesh.frustumCulled = true; slot = {mesh, lod, version, cache: new Map()}; slots.current.set(index, slot); parent.add(mesh); }
        else if (cached) cached.geometry.dispose();
        slot.cache.set(lod, {version, geometry});
        // Las versiones viejas de otros LOD ya no sirven.
        for (const [l, c] of slot.cache) if (c.version !== version) { c.geometry.dispose(); slot.cache.delete(l); }
      }
      const ready = slot!; // si no había casilla, la rama de construcción la creó
      ready.mesh.geometry = ready.cache.get(lod)!.geometry; ready.lod = lod; ready.version = version;
    }
    if (pending) invalidate();
  });

  return <group ref={group} name="terreno" userData={{lodStrides: LOD_STRIDES}} />;
}
