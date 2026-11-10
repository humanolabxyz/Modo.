// Conexiones físicas entre puertos, con acople (snap) para los hidráulicos. Puro.
// Hidráulico: una tubería no se une «a distancia»: al conectar, la pieza que se pueda mover se desplaza y gira hasta que los dos puertos coinciden y se miran de frente.
// Potencia y señal: son cables, no se acoplan; basta con que la distancia sea razonable.
import {checkPorts} from '../model/ports.ts';
import {newId} from '../model/defaults.ts';
import {LIMITS, type Connection, type Entity, type Pose, type PortRef, type Result, type Vec3} from '../model/types.ts';
import type {Heightfield} from '../terrain/heightfield.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import * as cmd from './commands.ts';
import {checkPlacement, portWorld} from './placement.ts';

/** Máxima separación (m, en planta) para que dos puertos hidráulicos cuenten como unidos. */
export const DOCK_TOLERANCE = 0.25;
export const CABLE_MAX = 300;
export function cablePoints(a: {x: number; y: number; z: number}, b: {x: number; y: number; z: number}): Vec3[] {
  return [[a.x, a.y, a.z], [(a.x + b.x) / 2, Math.max(a.y, b.y) + 0.35, (a.z + b.z) / 2], [b.x, b.y, b.z]];
}
const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const same = (x: PortRef, y: PortRef): boolean => x.entityId === y.entityId && x.portId === y.portId;

/** Separación en planta entre los dos puertos de una conexión hidráulica (null si no es hidráulica o falta algo). */
export function connectionGap(entities: readonly Entity[], c: Connection): number | null {
  if (c.kind !== 'hydraulic') return null;
  const ea = entities.find(e => e.id === c.a.entityId), eb = entities.find(e => e.id === c.b.entityId), pa = ea?.ports.find(p => p.id === c.a.portId), pb = eb?.ports.find(p => p.id === c.b.portId);
  if (!ea || !eb || !pa || !pb) return null;
  const wa = portWorld(ea, pa), wb = portWorld(eb, pb);
  return Math.hypot(wa.x - wb.x, wa.z - wb.z);
}
/** Una unión hidráulica «estirada» (sus puertos se separaron al mover una pieza) no conduce agua, pero sigue registrada. */
export const isStretched = (entities: readonly Entity[], c: Connection): boolean => { const g = connectionGap(entities, c); return g !== null && g > DOCK_TOLERANCE; };

/** Pose que deja el puerto `port` de `mover` sobre el punto `target` y mirando de frente a `targetNormal`. */
function dockPose(mover: Entity, portId: string, target: {x: number; z: number; nx: number; nz: number}, hf: Heightfield): Pose {
  const port = mover.ports.find(p => p.id === portId)!, [lx, , lz] = port.local, [nx, , nz] = port.normal;
  const theta = Math.atan2(nz, nx) - Math.atan2(-target.nz, -target.nx), c = Math.cos(theta), s = Math.sin(theta);
  const x = target.x - (lx * c + lz * s), z = target.z - (-lx * s + lz * c);
  const yaw = Math.atan2(Math.sin(theta), Math.cos(theta)); // normalizado a (−π, π]
  return {position: [x, sampleHeight(hf, x, z), z], rotation: [0, yaw, 0]};
}

/** Valida y aplica una conexión. Devuelve el motivo legible si no se puede. */
export function connectPorts(parts: cmd.Parts, hf: Heightfield, a: PortRef, b: PortRef): Result<{parts: cmd.Parts; docked: string | null}> {
  const ea = parts.entities.find(e => e.id === a.entityId), eb = parts.entities.find(e => e.id === b.entityId);
  const pa = ea?.ports.find(p => p.id === a.portId), pb = eb?.ports.find(p => p.id === b.portId);
  if (!ea || !eb || !pa || !pb) return fail('El puerto no existe.');
  if (ea.id === eb.id) return fail('No se puede unir una pieza consigo misma.');
  const fit = checkPorts(pa, pb); if (!fit.ok) return fail(fit.error);
  for (const [e, p, r] of [[ea, pa, a], [eb, pb, b]] as const) if (parts.connections.some(c => same(c.a, r) || same(c.b, r))) return fail(`El puerto «${p.label ?? p.id}» de «${e.label}» ya está conectado.`);
  if (parts.connections.length >= LIMITS.connections) return fail(`El mundo admite hasta ${LIMITS.connections} conexiones.`);

  let entities = parts.entities, docked: string | null = null;
  const wa = portWorld(ea, pa), wb = portWorld(eb, pb);
  if (pa.kind === 'hydraulic') {
    if (Math.abs(pa.normal[1]) > 0.5 || Math.abs(pb.normal[1]) > 0.5) return fail('Los puertos que apuntan hacia arriba no admiten acople.');
    if (Math.hypot(wa.x - wb.x, wa.z - wb.z) > DOCK_TOLERANCE) {
      const linked = (id: string) => parts.connections.some(c => c.a.entityId === id || c.b.entityId === id);
      // se mueve la pieza elegida en segundo lugar, salvo que esté enlazada a otras y la primera no
      const [mover, moverPort, anchor, anchorPort] = linked(eb.id) && !linked(ea.id) ? [ea, pa, eb, pb] as const : [eb, pb, ea, pa] as const;
      if (linked(mover.id)) return fail(`«${ea.label}» y «${eb.label}» ya están conectadas a otras piezas: acerca los puertos a menos de ${Math.round(DOCK_TOLERANCE * 100)} cm y vuelve a conectar.`);
      const pose = dockPose(mover, moverPort.id, portWorld(anchor, anchorPort), hf);
      const check = checkPlacement(hf, parts.entities, mover.type, pose, mover.params, mover.id);
      if (!check.ok) return fail(`No se puede acercar «${mover.label}» a «${anchor.label}»: ${check.error}`);
      const moved = cmd.setPose(parts, mover.id, pose); if (!moved.ok) return moved;
      entities = moved.value.entities; docked = mover.label;
    }
  } else {
    const dist = Math.hypot(wa.x - wb.x, wa.y - wb.y, wa.z - wb.z);
    if (dist > CABLE_MAX) return fail(`Los puertos están a ${dist.toFixed(0)} m: un cable admite hasta ${CABLE_MAX} m.`);
  }
  const connection: Connection = {id: newId('c'), kind: pa.kind, a: {...a}, b: {...b}, status: 'connected'};
  return {ok: true, value: {parts: {entities, connections: [...parts.connections, connection]}, docked}};
}

/** Puertos libres y compatibles con `from` en todo el mundo: es lo que ofrece la interfaz para conectar. */
export function compatibleTargets(parts: cmd.Parts, from: PortRef): {entityId: string; portId: string; label: string}[] {
  const ea = parts.entities.find(e => e.id === from.entityId), pa = ea?.ports.find(p => p.id === from.portId);
  if (!ea || !pa) return [];
  const out: {entityId: string; portId: string; label: string}[] = [];
  for (const e of parts.entities) {
    if (e.id === ea.id) continue;
    for (const p of e.ports) {
      if (parts.connections.some(c => same(c.a, {entityId: e.id, portId: p.id}) || same(c.b, {entityId: e.id, portId: p.id}))) continue;
      if (checkPorts(pa, p).ok) out.push({entityId: e.id, portId: p.id, label: `${e.label} · ${p.label ?? p.id}`});
    }
  }
  return out;
}
