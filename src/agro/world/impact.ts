import {polygonsOverlap} from '../terrain/geometry.ts';
import {entityFootprint,polygonSlope} from './placement.ts';
import {itemById, sizeOf} from '../catalog/items.ts';
import {LIMITS, PHYSICAL_STATUSES, type Connection, type Entity, type TerrainEdit, type Vec3} from '../model/types.ts';
import {editCellBounds, inBounds, sampleHeight, type Heightfield} from '../terrain/heightfield.ts';
import type {Parts} from './commands.ts';
import {CABLE_MAX, DOCK_TOLERANCE, cablePoints} from './connections.ts';
import {clearTerrainSupport, pipePortElevation} from './pipeElevation.ts';
import {footprint, footprintSlope, overlaps, portWorld} from './placement.ts';

type CellBounds = ReturnType<typeof editCellBounds>;
type EntityImpact = {id: string; label: string; nextY: number; deltaY: number; blocker?: string; pin?: string};
type ConnectionImpact = {id: string; label: string; warning?: string};
export type ImpactReport = {
  changedRegion: CellBounds | null;
  entities: EntityImpact[];
  connections: ConnectionImpact[];
};
export const TERRAIN_REVIEW = 'Revalidación pendiente por edición del terreno.';

function boundsOf(hf: Heightfield, points: readonly (readonly [number, number])[]): CellBounds {
  const xs = points.map(([x]) => (x - hf.originX) / hf.cell), zs = points.map(([, z]) => (z - hf.originZ) / hf.cell);
  return {i0: Math.floor(Math.min(...xs)), i1: Math.ceil(Math.max(...xs)), j0: Math.floor(Math.min(...zs)), j1: Math.ceil(Math.max(...zs))};
}

function intersects(a: CellBounds, b: CellBounds): boolean {
  return a.i0 <= b.i1 && a.i1 >= b.i0 && a.j0 <= b.j1 && a.j1 >= b.j0;
}

/** Una altura de la malla influye hasta una celda a cada lado por la interpolación. */
function footprintChanged(hf: Heightfield, before: Heightfield, corners: [number, number][], region: CellBounds): boolean {
  const b = boundsOf(hf, corners);
  if (!intersects(b, region)) return false;
  for (let j = Math.max(b.j0, region.j0); j <= Math.min(b.j1, region.j1); j++) {
    for (let i = Math.max(b.i0, region.i0); i <= Math.min(b.i1, region.i1); i++) {
      const idx = j * hf.nx + i, original = before.originals?.get(idx);
      if (original === undefined || original === hf.data[idx]) continue;
      const x = hf.originX + i * hf.cell, z = hf.originZ + j * hf.cell, d = hf.cell;
      if (polygonsOverlap(corners, [[x-d,z-d], [x+d,z-d], [x+d,z+d], [x-d,z+d]])) return true;
    }
  }
  return false;
}

/** Detecta cambios de contacto con el suelo a lo largo de una ruta fija, aunque sus puertos queden lejos del pincel. */
function routeAffected(hf: Heightfield, before: Heightfield, points: Vec3[], region: CellBounds): boolean {
  for (let k = 1; k < points.length; k++) {
    const [x, y, z] = points[k - 1], [endX, endY, endZ] = points[k];
    if (!intersects(boundsOf(hf, [[x,z], [endX,endZ]]), region)) continue;
    const dx = endX - x, dz = endZ - z, dy = endY - y;
    let from = 0, to = 1;
    for (const [start, delta, min, max] of [[x, dx, hf.originX + region.i0 * hf.cell, hf.originX + region.i1 * hf.cell], [z, dz, hf.originZ + region.j0 * hf.cell, hf.originZ + region.j1 * hf.cell]]) {
      if (!delta) continue;
      const a = (min - start) / delta, b = (max - start) / delta;
      from = Math.max(from, Math.min(a, b)); to = Math.min(to, Math.max(a, b));
    }
    if (from > to) continue;
    const steps = Math.max(1, Math.ceil(2 * Math.hypot(dx * (to - from), dz * (to - from)) / hf.cell));
    for (let i = 0; i <= steps; i++) {
      const t = from + (to - from) * i / steps, px = x + t * dx, pz = z + t * dz, py = y + t * dy;
      const old = sampleHeight(before, px, pz), next = sampleHeight(hf, px, pz);
      if (Math.abs(old - next) > 1e-6 && Math.max(old, next) >= py) return true;
    }
  }
  return false;
}

/** Analiza el trazo visible sin modificar ni el terreno ni las instalaciones. */
export function previewTerrainImpact(parts: Parts, before: Heightfield, hf: Heightfield, edits: readonly TerrainEdit[]): ImpactReport {
  const changedRegion = edits.reduce<CellBounds | null>((a, edit) => {
    const b = editCellBounds(hf, edit);
    return a ? {i0: Math.min(a.i0, b.i0), i1: Math.max(a.i1, b.i1), j0: Math.min(a.j0, b.j0), j1: Math.max(a.j1, b.j1)} : b;
  }, null);
  const entities: EntityImpact[] = [], connections: ConnectionImpact[] = [];
  if (!changedRegion || !before.originals?.size) return {changedRegion, entities, connections};
  const byId = new Map(parts.entities.map(e => [e.id, e])), byImpact = new Map<string, EntityImpact>();

  for (const e of parts.entities) {
    const [x, y, z] = e.pose.position, def = itemById(e.type);
    const size = def ? sizeOf(def, e.params) : [0.1, 0, 0.1] as Vec3;
    const corners = def?entityFootprint(e):footprint(e.pose,size);
    const a = e.type === 'tuberia' && e.ports.find(p => p.id === 'a'), b = e.type === 'tuberia' && e.ports.find(p => p.id === 'b');
    const bounds = boundsOf(hf, corners);
    const slopeBounds = {i0: bounds.i0 - 1, i1: bounds.i1 + 1, j0: bounds.j0 - 1, j1: bounds.j1 + 1};
    const nearby = intersects(slopeBounds, changedRegion);
    const pipeChanged = a && b && [a, b].some(p => {
      const w = portWorld(e, p);
      return intersects(boundsOf(hf, [[w.x, w.z]]), changedRegion) && sampleHeight(before, w.x, w.z) !== sampleHeight(hf, w.x, w.z);
    });
    if (!nearby && !pipeChanged) continue;
    const slope = e.parcelPolygon?polygonSlope(hf,corners):footprintSlope(hf, e.pose, size);
    const changedSlope = def && slope > def.maxSlopeDeg && Math.abs(slope - (e.parcelPolygon?polygonSlope(before,corners):footprintSlope(before, e.pose, size))) > 1e-6;
    if (!pipeChanged && !changedSlope && !footprintChanged(hf, before, corners, changedRegion)) continue;
    const nextY = sampleHeight(hf, x, z);
    const blocker = e.locked ? 'Pieza bloqueada.' : !def ? 'Pieza de catálogo desconocido.' :
      corners.some(([px, pz]) => !inBounds(hf, px, pz)) ? 'La huella sale del mapa.' :
      slope > def.maxSlopeDeg ? `Pendiente de ${slope.toFixed(1)}° (máximo ${def.maxSlopeDeg}°).` : undefined;
    const pin = a && b ? [pipePortElevation(before, e, a), pipePortElevation(before, e, b)].join(',') : undefined;
    const impact = {id: e.id, label: e.label, nextY, deltaY: nextY - y, blocker, pin};
    entities.push(impact);
    byImpact.set(e.id, impact);
  }

  for (const c of parts.connections) {
    const ea = byId.get(c.a.entityId), eb = byId.get(c.b.entityId);
    const pa = ea?.ports.find(p => p.id === c.a.portId), pb = eb?.ports.find(p => p.id === c.b.portId);
    if (!ea || !eb || !pa || !pb) continue;
    const ia = byImpact.get(ea.id), ib = byImpact.get(eb.id);
    const wa = portWorld(ea, pa), wb = portWorld(eb, pb);
    const route = c.kind === 'hydraulic' ? [[wa.x, wa.y, wa.z], [wb.x, wb.y, wb.z]] as Vec3[] : cablePoints(wa, wb);
    const buried = routeAffected(hf, before, route, changedRegion)
      || !!c.route?.length && routeAffected(hf, before, [route[0], ...c.route, route.at(-1)!], changedRegion);
    if (!ia && !ib && !buried) continue;
    const yAfter = (e: Entity, p: typeof pa, y: number, impact?: EntityImpact): number => {
      if (c.kind === 'hydraulic' && e.type === 'tuberia') {
        return impact && !impact.blocker ? pipePortElevation(hf, {...e, state: clearTerrainSupport(e.state)}, p) : pipePortElevation(before, e, p);
      }
      return y + (impact && !impact.blocker ? impact.deltaY : 0);
    };
    const dy = yAfter(ea, pa, wa.y, ia) - yAfter(eb, pb, wb.y, ib);
    const distance = Math.hypot(wa.x - wb.x, dy, wa.z - wb.z);
    const warning = c.kind === 'hydraulic' && Math.abs(dy) > DOCK_TOLERANCE ? 'Revisa el desnivel entre los puertos.' :
      c.kind !== 'hydraulic' && distance > CABLE_MAX ? 'El cable superaría su alcance con el reajuste.' :
      buried ? 'El terreno cambia el paso de esta conexión.' : undefined;
    connections.push({id: c.id, label: `${ea.label} · ${pa.label ?? pa.id} ↔ ${eb.label} · ${pb.label ?? pb.id}`, warning});
  }
  return {changedRegion, entities, connections};
}

/** Conserva diagnósticos existentes y el estado físico de la unión. */
export function markTerrainReview(c: Connection): Connection {
  if (!c.reason) return {...c, reason: TERRAIN_REVIEW};
  const combined = `${c.reason} ${TERRAIN_REVIEW}`;
  return c.reason.endsWith(TERRAIN_REVIEW) || combined.length > LIMITS.text ? c : {...c, reason: combined};
}

export function needsTerrainReview(c: Connection): boolean {
  return !!c.reason && (c.reason.endsWith(TERRAIN_REVIEW) || PHYSICAL_STATUSES.includes(c.status));
}
