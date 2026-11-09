import {qFromAxisAngle, qRotate, sub, add, tInv, tPoint} from '../../robotics/project/math.ts';
import {toTransform} from '../build/snap.ts';
import {containerOf} from '../model/inspection.ts';
import type {IndustryProject, TerminalRef, Vec3} from '../model/types.ts';
import {DOORS, doorAngle} from '../scene/doors.ts';
import type {DuctSeg} from './ducts.ts';

type Horizontal = {y: number; z: number; min: number; max: number};
type Cabinet = {
  id: string;
  world: ReturnType<typeof toTransform>;
  local: ReturnType<typeof toTransform>;
  rows: Horizontal[];
  trunk?: {x: number; z: number; min: number; max: number};
};
type End = {cabinet: Cabinet; path: Vec3[]; row: Horizontal; entry: Vec3};
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
/** Coordenadas de los cuatro prensaestopas del modelo genérico del gabinete. */
const glandXs = [-0.32, -0.20, -0.08, 0.04];
const hinge = DOORS.gabinete.pivot;

export function cabinetRouter(project: IndustryProject, ducts: readonly DuctSeg[], doors: Readonly<Record<string, number>>) {
  const layouts = new Map<string, Cabinet>();
  const owners = new Map<string, string>();
  const doorOwners = new Map(project.mounts.filter(m => m.parent.anchorId === 'puerta' && m.child.anchorId === 'agujero').map(m => [m.child.entityId, m.parent.entityId]));
  const definitions = new Map(project.entities.map(e => [e.id, e.definitionId]));
  for (const entity of project.entities) {
    const pose = project.poses[entity.id];
    if (entity.definitionId !== 'gabinete' || !pose) continue;
    const world = toTransform(pose);
    layouts.set(entity.id, {id: entity.id, world, local: tInv(world), rows: []});
  }
  if (!layouts.size) return null;
  for (const entity of project.entities) {
    const owner = doorOwners.get(entity.id) ?? containerOf(project, entity.id, 'gabinete')?.id;
    if (owner && layouts.has(owner)) owners.set(entity.id, owner);
  }
  for (const duct of ducts) {
    const id = owners.get(duct.id);
    const cabinet = id ? layouts.get(id) : undefined;
    if (!cabinet) continue;
    const a = tPoint(cabinet.local, duct.a), b = tPoint(cabinet.local, duct.b);
    const def = definitions.get(duct.id);
    if (def === 'canaleta' && Math.abs(a[0] - b[0]) > 0.3) cabinet.rows.push({y: (a[1] + b[1]) / 2, z: (a[2] + b[2]) / 2, min: Math.min(a[0], b[0]), max: Math.max(a[0], b[0])});
    if (def === 'canaleta-vertical' && Math.abs(a[1] - b[1]) > 0.3) cabinet.trunk = {x: (a[0] + b[0]) / 2, z: (a[2] + b[2]) / 2, min: Math.min(a[1], b[1]), max: Math.max(a[1], b[1])};
  }

  const end = (ref: TerminalRef, terminal: Vec3, stub: Vec3, lane: number): End | null => {
    const owner = owners.get(ref.entityId), cabinet = owner ? layouts.get(owner) : undefined;
    if (!cabinet?.trunk) return null;
    const trunk = cabinet.trunk;
    const rows = cabinet.rows.filter(row => row.y >= trunk.min - 0.04 && row.y <= trunk.max + 0.04
      && Math.abs(row.z - trunk.z) <= 0.035 && Math.abs(clamp(trunk.x, row.min, row.max) - trunk.x) <= 0.045);
    if (!rows.length) return null;
    const a = tPoint(cabinet.local, terminal), start = tPoint(cabinet.local, stub);
    const offset = (lane - 2) * 0.0035;
    const onDoor = doorOwners.has(ref.entityId);
    const target = onDoor ? [hinge[0] + 0.15, 0.89, -0.1] : start;
    const row = rows.reduce((best, candidate) => {
      const score = (r: Horizontal) => Math.abs(r.y - target[1]) + Math.abs(target[0] - clamp(target[0], r.min, r.max));
      return score(candidate) < score(best) ? candidate : best;
    });
    if (!onDoor && Math.abs(row.y - start[1]) > 0.24) return null;
    const y = row.y + offset, z = row.z;
    const x = clamp(target[0], row.min + 0.009, row.max - 0.009);
    const entry: Vec3 = [x, y, z];
    let path: Vec3[];
    if (onDoor) {
      const angle = doorAngle('gabinete', doors[cabinet.id] ?? 0);
      const rotate = (point: Vec3, radians: number) => add(hinge, qRotate(qFromAxisAngle([0, 1, 0], radians), sub(point, hinge)));
      const closed = rotate(a, -angle);
      const loomY = 0.855 + offset;
      const loomZ = 0.14;
      const movingHinge = rotate([hinge[0] + 0.065, loomY, loomZ], angle);
      path = [a, rotate([closed[0], closed[1], loomZ - 0.014], angle), rotate([closed[0], loomY, loomZ], angle),
        movingHinge, [hinge[0] + 0.043, loomY - 0.043, hinge[2] - 0.041],
        [hinge[0] + 0.073, loomY - 0.028, row.z], [x, loomY - 0.028, row.z], entry];
    } else {
      path = [a, start, [start[0], y, start[2]], [x, y, start[2]], entry];
    }
    return {cabinet, path, row, entry};
  };

  const trunkAt = (endpoint: End, lane: number): Vec3 => {
    const trunk = endpoint.cabinet.trunk!;
    return [trunk.x + (lane - 2) * 0.0035, endpoint.entry[1], trunk.z];
  };
  // Las filas se comunican por la canaleta vertical; el paso exterior sale por la base.
  const localRun = (a: End, b: End, lane: number): Vec3[] | null => {
    if (a.cabinet !== b.cabinet) return null;
    const middle = a.row === b.row ? [] : [trunkAt(a, lane), trunkAt(b, lane)];
    return [...a.path, ...middle, ...b.path.slice().reverse()].map(q => tPoint(a.cabinet.world, q));
  };
  const leadOut = (a: End, lane: number, group: number): Vec3[] => {
    const t = trunkAt(a, lane);
    const x = glandXs[group] + (lane - 2) * 0.004, y = 0.132 + lane * 0.006;
    return [...a.path, t, [t[0], y, t[2]], [x, y, t[2]], [x, y, 0.02], [x, 0.006, 0.02]]
      .map(q => tPoint(a.cabinet.world, q as Vec3));
  };
  return {end, localRun, leadOut, cabinetOf: (id: string) => owners.get(id)};
}

export type CabinetRouter = ReturnType<typeof cabinetRouter>;
