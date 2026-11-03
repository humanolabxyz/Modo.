import {useEffect, useMemo} from 'react';
import {Vector3} from 'three';
import {ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry.js';
import {combatHulls, COMBAT_COLORS} from '../catalog/combat.ts';
export function CombatMesh({id}: {id: string}) {
  const geometries = useMemo(() => (combatHulls(id) ?? []).map(hull => {
    const points: Vector3[] = [];
    for (let i=0;i<hull.vertices.length;i+=3) points.push(new Vector3(hull.vertices[i],hull.vertices[i+1],hull.vertices[i+2]));
    return new ConvexGeometry(points);
  }), [id]);
  useEffect(() => () => geometries.forEach(g => g.dispose()), [geometries]);
  return <group>{geometries.map((geometry,i) => <mesh key={i} geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={COMBAT_COLORS[id]} metalness={.55} roughness={.38} /></mesh>)}</group>;
}
