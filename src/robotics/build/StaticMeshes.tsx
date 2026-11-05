import {useLayoutEffect, useRef, type ReactNode} from 'react';
import {Group, Matrix4, Mesh, type BufferGeometry, type MeshStandardMaterial} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Batch only opaque, untextured static details. Keep decals and animated parts intact.
 * The batch lives in part coordinates, so physics moves it without rebuilding geometry. */
export function StaticMeshes({children, cacheKey}: {children: ReactNode; cacheKey: string}) {
  const root = useRef<Group>(null);
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const inverse = new Matrix4().copy(group.matrixWorld).invert();
    const buckets = new Map<string, {material: MeshStandardMaterial; meshes: Mesh[]}>();
    group.traverse(object => {
      const mesh = object as Mesh;
      if (!mesh.isMesh || 'isInstancedMesh' in mesh || !mesh.visible || Array.isArray(mesh.material)) return;
      const m = mesh.material as MeshStandardMaterial;
      if (!m.isMeshStandardMaterial || m.transparent || m.map || m.emissiveMap || Object.keys(mesh.userData).length) return;
      const key = [m.color.getHex(), m.metalness, m.roughness, m.emissive.getHex(), m.emissiveIntensity, m.side, mesh.raycast === Mesh.prototype.raycast].join(':');
      const bucket = buckets.get(key) ?? {material: m, meshes: []};
      bucket.meshes.push(mesh); buckets.set(key, bucket);
    });
    const batches: Mesh[] = [], hidden: Mesh[] = [];
    for (const {material, meshes} of buckets.values()) {
      if (meshes.length < 2) continue;
      const geometries: BufferGeometry[] = meshes.map(mesh => {
        const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        g.applyMatrix4(new Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
        return g;
      });
      const merged = mergeGeometries(geometries);
      geometries.forEach(g => g.dispose());
      if (!merged) continue;
      const batch = new Mesh(merged, material);
      if (meshes[0].raycast !== Mesh.prototype.raycast) batch.raycast = () => {};
      group.add(batch); batches.push(batch);
      meshes.forEach(mesh => { mesh.visible = false; hidden.push(mesh); });
    }
    return () => {
      hidden.forEach(mesh => { mesh.visible = true; });
      batches.forEach(mesh => { group.remove(mesh); mesh.geometry.dispose(); });
    };
  }, [cacheKey]);
  return <group ref={root}>{children}</group>;
}
