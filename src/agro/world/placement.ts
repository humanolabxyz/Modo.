import {parcelWorldPolygon,parcelContains} from './parcelGeometry.ts';
import {polygonsOverlap,insidePolygon,type Point2} from '../terrain/geometry.ts';
// Colocación sobre el terreno: huellas, pendiente, solapes, picking de piezas y medición. Puro (sin three).
import {itemById, sizeOf} from '../catalog/items.ts';
import type {Entity, Pose, Port, Result, Vec3} from '../model/types.ts';
import {inBounds, sampleHeight, slopeDegrees, type Heightfield} from '../terrain/heightfield.ts';

export const yawOf = (pose: Pose): number => pose.rotation[1];
const fail = (error: string): {ok: false; error: string} => ({ok: false, error});

/** Esquinas de la huella en el plano (x, z) de una pieza de medidas `size` en `pose`. */
export function footprint(pose: Pose, size: Vec3): [number, number][] {
  const c = Math.cos(yawOf(pose)), s = Math.sin(yawOf(pose)), hw = size[0] / 2, hd = size[2] / 2;
  return ([[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]] as [number, number][]).map(([x, z]) => [pose.position[0] + x * c + z * s, pose.position[2] - x * s + z * c]);
}

/** Solape de dos rectángulos orientados (teorema del eje separador). `tolerance` (m) deja que las piezas se toquen. */
export function overlaps(a: [number, number][], b: [number, number][], tolerance = 0.05): boolean {
  for (const poly of [a, b]) for (let i = 0; i < 4; i++) {
    const p = poly[i], q = poly[(i + 1) % 4], ax = -(q[1] - p[1]), az = q[0] - p[0], len = Math.hypot(ax, az) || 1, nx = ax / len, nz = az / len;
    const proj = (pts: [number, number][]) => { let lo = Infinity, hi = -Infinity; for (const [x, z] of pts) { const d = x * nx + z * nz; if (d < lo) lo = d; if (d > hi) hi = d; } return [lo, hi]; };
    const [a0, a1] = proj(a), [b0, b1] = proj(b);
    if (a1 - tolerance <= b0 || b1 - tolerance <= a0) return false;
  }
  return true;
}

export function entityFootprint(e:Entity):Point2[] {return e.parcelPolygon?parcelWorldPolygon(e):footprint(e.pose,sizeOf(itemById(e.type)!,e.params));}
export function polygonSlope(hf:Heightfield,polygon:Point2[]):number {
 let worst=0;for(const [x,z] of polygon)worst=Math.max(worst,slopeDegrees(hf,x,z));
 const xs=polygon.map(p=>p[0]),zs=polygon.map(p=>p[1]);
 for(let z=Math.min(...zs);z<=Math.max(...zs);z+=Math.max(2,hf.cell))for(let x=Math.min(...xs);x<=Math.max(...xs);x+=Math.max(2,hf.cell))if(insidePolygon([x,z],polygon))worst=Math.max(worst,slopeDegrees(hf,x,z));
 return worst;
}

/** Cota a la que se apoya una pieza: el suelo en el centro de su huella. */
export const groundY = (hf: Heightfield, x: number, z: number): number => sampleHeight(hf, x, z);

/** Pendiente máxima bajo la huella (centro y esquinas), en grados. */
export function footprintSlope(hf: Heightfield, pose: Pose, size: Vec3): number {
  let worst = slopeDegrees(hf, pose.position[0], pose.position[2]);
  for (const [x, z] of footprint(pose, size)) worst = Math.max(worst, slopeDegrees(hf, x, z));
  return worst;
}

/** ¿Se puede colocar `typeId` con esa pose? Devuelve el motivo legible cuando no. `ignoreId` excluye la pieza que se está moviendo. */
export function checkPlacement(hf: Heightfield, entities: readonly Entity[], typeId: string, pose: Pose, params: Record<string, number | string | boolean>, ignoreId?: string, parcelPolygon?: Point2[]): Result<true> {
  const def = itemById(typeId); if (!def) return fail(`Tipo de pieza desconocido: «${typeId}».`);
  const size = sizeOf(def, params), corners = parcelPolygon?parcelWorldPolygon({pose,params,parcelPolygon}):footprint(pose, size);
  for (const [x, z] of corners) if (!inBounds(hf, x, z)) return fail('La pieza se sale del mapa.');
  const slope = parcelPolygon?polygonSlope(hf,corners):footprintSlope(hf, pose, size);
  if (slope > def.maxSlopeDeg) return fail(`La pendiente del suelo (${slope.toFixed(1).replace('.', ',')}°) supera el máximo de ${def.maxSlopeDeg}° para ${def.name.toLowerCase()}.`);
  for (const other of entities) {
    if (other.id === ignoreId) continue;
    const od = itemById(other.type); if (!od) continue;
    if (!def.solid && !od.solid) { if (polygonsOverlap(corners, entityFootprint(other))) return fail(`Se solapa con la parcela «${other.label}».`); continue; }
    if (!def.solid || !od.solid) continue; // una pieza puede estar sobre una parcela
    if (overlaps(corners, footprint(other.pose, sizeOf(od, other.params)))) return fail(`Se solapa con «${other.label}».`);
  }
  return {ok: true, value: true};
}

/** Tamaño mínimo (m) de la caja de selección: una tubería de 6 cm de grosor sigue siendo fácil de pulsar. */
export const PICK_MIN = 0.5;
export type Ray = {origin: readonly [number, number, number]; dir: readonly [number, number, number]};

/** Rayo contra la caja orientada (yaw) de cada pieza sólida. Devuelve la más cercana. */
export function pickEntity(entities: readonly Entity[], ray: Ray, maxDistance = 6000): {id: string; distance: number} | null {
  let best: {id: string; distance: number} | null = null;
  for (const e of entities) {
    const def = itemById(e.type); if (!def || !def.solid) continue;
    const real = sizeOf(def, e.params), size: Vec3 = [Math.max(real[0], PICK_MIN), Math.max(real[1], PICK_MIN), Math.max(real[2], PICK_MIN)], yaw = yawOf(e.pose), c = Math.cos(yaw), s = Math.sin(yaw); // las piezas finas (tubería, sensor) se pueden elegir con comodidad
    const ox = ray.origin[0] - e.pose.position[0], oy = ray.origin[1] - e.pose.position[1], oz = ray.origin[2] - e.pose.position[2];
    // al marco local: rotación inversa de yaw
    const lo: Vec3 = [ox * c - oz * s, oy, ox * s + oz * c], ld: Vec3 = [ray.dir[0] * c - ray.dir[2] * s, ray.dir[1], ray.dir[0] * s + ray.dir[2] * c];
    const min: Vec3 = [-size[0] / 2, 0, -size[2] / 2], max: Vec3 = [size[0] / 2, size[1], size[2] / 2];
    let t0 = 0, t1 = maxDistance, hit = true;
    for (let k = 0; k < 3; k++) {
      if (Math.abs(ld[k]) < 1e-9) { if (lo[k] < min[k] || lo[k] > max[k]) { hit = false; break; } continue; }
      let a = (min[k] - lo[k]) / ld[k], b = (max[k] - lo[k]) / ld[k]; if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) { hit = false; break; }
    }
    if (hit && (!best || t0 < best.distance)) best = {id: e.id, distance: t0};
  }
  return best;
}

/** Parcela bajo un punto del suelo (para seleccionarla pulsando dentro de ella). */
export function parcelAt(entities: readonly Entity[], x: number, z: number): Entity | null {
  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i]; if (e.type !== 'parcela') continue;
    if(e.parcelPolygon){if(parcelContains(e,x,z))return e;continue;}
    const def = itemById('parcela')!, size = sizeOf(def, e.params), yaw = yawOf(e.pose), c = Math.cos(yaw), s = Math.sin(yaw);
    const dx = x - e.pose.position[0], dz = z - e.pose.position[2], lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (Math.abs(lx) <= size[0] / 2 && Math.abs(lz) <= size[2] / 2) return e;
  }
  return null;
}

export type Measurement = {distance: number; horizontal: number; rise: number; slopeDeg: number};
/** Distancia entre dos puntos del terreno: en el espacio, en horizontal, desnivel y pendiente media. */
export function measure(a: {x: number; y: number; z: number}, b: {x: number; y: number; z: number}): Measurement {
  const dx = b.x - a.x, dz = b.z - a.z, rise = b.y - a.y, horizontal = Math.hypot(dx, dz);
  return {distance: Math.hypot(horizontal, rise), horizontal, rise, slopeDeg: horizontal > 0 ? (Math.atan(Math.abs(rise) / horizontal) * 180) / Math.PI : 0};
}

// ── Puertos en el mundo ───────────────────────────────────────────────────
export type PortWorld = {x: number; y: number; z: number; nx: number; nz: number};

/** Posición y normal horizontal de un puerto en coordenadas del mundo (yaw sobre Y: x' = x·cos + z·sin; z' = −x·sin + z·cos). */
export function portWorld(entity: Pick<Entity, 'pose'>, port: Pick<Port, 'local' | 'normal'>): PortWorld {
  const yaw = yawOf(entity.pose), c = Math.cos(yaw), s = Math.sin(yaw), [lx, ly, lz] = port.local, [nx, , nz] = port.normal;
  return {x: entity.pose.position[0] + lx * c + lz * s, y: entity.pose.position[1] + ly, z: entity.pose.position[2] - lx * s + lz * c, nx: nx * c + nz * s, nz: -nx * s + nz * c};
}

/** Puerto más cercano al rayo (esferas de selección que crecen con la distancia para poder pulsarlos desde lejos). */
export function pickPort(entities: readonly Entity[], ray: Ray, maxDistance = 6000): {entityId: string; portId: string; distance: number} | null {
  let best: {entityId: string; portId: string; distance: number} | null = null;
  for (const e of entities) for (const p of e.ports) {
    const w = portWorld(e, p), ox = w.x - ray.origin[0], oy = w.y - ray.origin[1], oz = w.z - ray.origin[2];
    const t = ox * ray.dir[0] + oy * ray.dir[1] + oz * ray.dir[2];
    if (t < 0 || t > maxDistance) continue;
    const dx = ox - ray.dir[0] * t, dy = oy - ray.dir[1] * t, dz = oz - ray.dir[2] * t, radius = Math.max(0.4, t * 0.012);
    if (dx * dx + dy * dy + dz * dz <= radius * radius && (!best || t < best.distance)) best = {entityId: e.id, portId: p.id, distance: t};
  }
  return best;
}
