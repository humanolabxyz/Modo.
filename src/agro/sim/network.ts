// Del mundo al solver: arma la red hidráulica con las piezas y conexiones reales, la resuelve y traduce el resultado a bar y L/min por puerto y por pieza.
import type {Connection, Entity} from '../model/types.ts';
import type {Heightfield} from '../terrain/heightfield.ts';
import {connectionGap, isStretched} from '../world/connections.ts';
import {portWorld} from '../world/placement.ts';
import {pipePortElevation} from '../world/pipeElevation.ts';
import {BAR_PER_M, solveNetwork, type Link, type SolverNode} from './hydraulics.ts';
import {analyzePower, type PowerResult} from './power.ts';

export const HW_C = 140;                 // PEAD / PVC nuevo
export const PUMP_EFFICIENCY = 0.6;      // didáctica y constante
export const TANK_RADIUS = 1.3;          // m (la huella del estanque)
export const EMITTER_REF_HEAD = 10;      // m: el caudal nominal del aspersor se da a 10 m de columna
const LMIN = 60000;                      // m³/s → L/min

export type PortReading = {head: number; elevation: number; pressureBar: number};
export type ElementReading =
  | {kind: 'tuberia'; flowLmin: number; headLossM: number; velocity: number; wet: boolean}
  | {kind: 'valvula'; open: boolean; flowLmin: number; wet: boolean}
  | {kind: 'bomba'; running: boolean; flowLmin: number; headGainM: number; hydraulicKw: number; shaftKw: number; nominalKw: number; reason: string | null}
  | {kind: 'emisor'; flowLmin: number; pressureBar: number; wet: boolean; reason: string | null}
  | {kind: 'estanque'; surfaceHead: number; levelM: number; netOutLmin: number; dryOutlet: boolean};

export type Analysis = {
  power: PowerResult;
  /** Lectura por puerto (`entityId:portId`); solo los puertos con agua. */
  ports: Record<string, PortReading>;
  elements: Record<string, ElementReading>;
  /** Uniones hidráulicas cuyos puertos se separaron: no conducen. */
  stretched: {connectionId: string; gapM: number}[];
  balance: {sourcesLmin: number; emittersLmin: number; errorLmin: number};
  solver: {converged: boolean; iterations: number; residual: number};
  warnings: string[];
};

const key = (entityId: string, portId: string): string => `${entityId}:${portId}`;
class Union { parent = new Map<string, string>(); find(a: string): string { if (!this.parent.has(a)) this.parent.set(a, a); let r = a; while (this.parent.get(r) !== r) r = this.parent.get(r)!; this.parent.set(a, r); return r; } join(a: string, b: string) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.parent.set(ra, rb); } }
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const fmt = (v: number, d = 1): string => v.toFixed(d).replace('.', ',');

/** Las piezas en obra (Fase 6) no cuentan para la red: ni agua ni energía hasta que termina el montaje. */
export function analyze(all: readonly Entity[], allConnections: readonly Connection[], hf: Heightfield): Analysis {
  const building = all.some(e => typeof e.state.obraHasta === 'number' && e.state.obraHasta > 0);
  if (!building) return analyzeInstalled(all, allConnections, hf);
  const entities = all.filter(e => !(typeof e.state.obraHasta === 'number' && e.state.obraHasta > 0)), ids = new Set(entities.map(e => e.id));
  return analyzeInstalled(entities, allConnections.filter(c => ids.has(c.a.entityId) && ids.has(c.b.entityId)), hf);
}

function analyzeInstalled(entities: readonly Entity[], connections: readonly Connection[], hf: Heightfield): Analysis {
  const power = analyzePower(entities, connections), warnings: string[] = [];
  const byId = new Map(entities.map(e => [e.id, e]));
  const u = new Union();
  for (const e of entities) for (const p of e.ports) if (p.kind === 'hydraulic') u.find(key(e.id, p.id));

  const stretched: Analysis['stretched'] = [];
  for (const c of connections) {
    if (c.kind !== 'hydraulic' || c.status !== 'connected') continue;
    if (isStretched(entities, c)) { const gap = connectionGap(entities, c) ?? 0; stretched.push({connectionId: c.id, gapM: gap}); const a = byId.get(c.a.entityId), b = byId.get(c.b.entityId); warnings.push(`La unión entre «${a?.label}» y «${b?.label}» está separada ${fmt(gap)} m: no conduce agua.`); continue; }
    u.join(key(c.a.entityId, c.a.portId), key(c.b.entityId, c.b.portId));
  }
  // Piezas que unen sus puertos por dentro: la T siempre; la válvula abierta se modela como un tramo muy corto más abajo.
  for (const e of entities) if (e.type === 'te') { u.join(key(e.id, 'a'), key(e.id, 'b')); u.join(key(e.id, 'a'), key(e.id, 'c')); }

  // Elevación de cada puerto: las tuberías siguen el suelo; las demás piezas, su propia altura.
  const elevation = (e: Entity, portId: string): number => { const p = e.ports.find(q => q.id === portId)!; return e.type === 'tuberia' ? pipePortElevation(hf, e, p) : portWorld(e, p).y; };

  const nodes = new Map<string, SolverNode>(), node = (e: Entity, portId: string): string => { const id = u.find(key(e.id, portId)); if (!nodes.has(id)) nodes.set(id, {id}); return id; };
  const links: Link[] = [], tankInfo: Record<string, {surface: number; level: number; salida: string | null; entrada: string; dry: boolean}> = {};
  for (const e of entities) {
    if (e.type === 'estanque') {
      const level = num(e.state.nivelL, 0) / 1000 / (Math.PI * TANK_RADIUS * TANK_RADIUS), surface = e.pose.position[1] + level;
      const salidaPort = e.ports.find(p => p.id === 'salida'), dry = !salidaPort || level < salidaPort.local[1];
      const entrada = node(e, 'entrada'); nodes.get(entrada)!.fixedHead = surface;
      let salida: string | null = null;
      if (!dry) { salida = node(e, 'salida'); const n = nodes.get(salida)!; if (n.fixedHead !== undefined && Math.abs(n.fixedHead - surface) > 1e-9) warnings.push(`«${e.label}» está unido directamente a otro estanque con un nivel distinto.`); else n.fixedHead = surface; }
      tankInfo[e.id] = {surface, level, salida, entrada, dry};
    }
  }
  for (const e of entities) {
    if (e.type === 'tuberia') links.push({kind: 'pipe', id: e.id, a: node(e, 'a'), b: node(e, 'b'), lengthM: Math.max(0.1, num(e.params.largoM, 6)), diameterM: num(e.params.diametroMm, 50) / 1000, c: HW_C});
    else if (e.type === 'valvula' && e.state.abierta !== false) links.push({kind: 'pipe', id: e.id, a: node(e, 'a'), b: node(e, 'b'), lengthM: 0.5, diameterM: 0.05, c: HW_C});
    else if (e.type === 'bomba') links.push({kind: 'pump', id: e.id, a: node(e, 'succion'), b: node(e, 'descarga'), on: power.energized[e.id] === true, shutoffM: num(e.params.alturaCierreM, 30), k: num(e.params.kCurva, 320000)});
    else if (e.type === 'emisor') links.push({kind: 'emitter', id: e.id, a: node(e, 'entrada'), elevation: elevation(e, 'entrada'), ke: (num(e.params.caudalNominalLmin, 40) / LMIN) / Math.sqrt(EMITTER_REF_HEAD)});
  }
  for (const e of entities) if (e.type === 'valvula') { node(e, 'a'); node(e, 'b'); }
  const solved = solveNetwork({nodes: [...nodes.values()], links});
  if (!solved.converged && links.length) warnings.push('La red no convergió: revisa que las bombas no trabajen contra una altura mayor a la que pueden dar.');

  // Lecturas por puerto
  const ports: Analysis['ports'] = {};
  for (const e of entities) for (const p of e.ports) {
    if (p.kind !== 'hydraulic') continue;
    const id = u.find(key(e.id, p.id)), head = solved.heads[id];
    if (head === undefined) continue;
    const z = elevation(e, p.id); ports[key(e.id, p.id)] = {head, elevation: z, pressureBar: (head - z) * BAR_PER_M};
  }
  // Lecturas por pieza
  const elements: Analysis['elements'] = {};
  const q = (id: string) => (solved.flows[id] ?? 0);
  const netOut = new Map<string, number>(); // por nodo fijo: caudal que entrega a la red
  for (const l of links) { const f = q(l.id); if (l.kind === 'emitter') netOut.set(l.a, (netOut.get(l.a) ?? 0) - f); else { netOut.set(l.a, (netOut.get(l.a) ?? 0) - f); netOut.set(l.b, (netOut.get(l.b) ?? 0) + f); } }
  let sources = 0, emitters = 0;
  for (const e of entities) {
    const p = (id: string) => ports[key(e.id, id)];
    if (e.type === 'tuberia') { const f = q(e.id), a = p('a'), b = p('b'), area = Math.PI * Math.pow(num(e.params.diametroMm, 50) / 2000, 2); elements[e.id] = {kind: 'tuberia', flowLmin: f * LMIN, headLossM: a && b ? Math.abs(a.head - b.head) : 0, velocity: Math.abs(f) / area, wet: !!a && !!b}; }
    else if (e.type === 'valvula') { const open = e.state.abierta !== false; elements[e.id] = {kind: 'valvula', open, flowLmin: open ? q(e.id) * LMIN : 0, wet: !!p('a') || !!p('b')}; }
    else if (e.type === 'bomba') {
      const f = q(e.id), a = p('succion'), b = p('descarga'), running = power.energized[e.id] === true, gain = a && b ? b.head - a.head : 0, hyd = (1000 * 9.80665 * f * Math.max(gain, 0)) / 1000, nominal = num(e.params.potenciaNominalKw, 2.2);
      let reason: string | null = null;
      if (!running) reason = power.reasons[e.id] ?? 'Sin energía.';
      else if (!a) reason = 'Sin agua en la succión: conecta un estanque con nivel suficiente.';
      else if (f <= 1e-9) reason = `No sale agua por la descarga: hay una válvula cerrada o la red pide más altura de la que la bomba puede dar (cierre a ${fmt(num(e.params.alturaCierreM, 30), 0)} m).`;
      if (running && a && a.pressureBar < -0.8) warnings.push(`«${e.label}»: la succión trabaja con presión negativa (${fmt(a.pressureBar, 2)} bar).`);
      if (running && f > 0 && hyd / PUMP_EFFICIENCY > nominal) warnings.push(`«${e.label}» opera por encima de su potencia nominal (${fmt(hyd / PUMP_EFFICIENCY, 2)} kW de ${fmt(nominal, 1)} kW).`);
      if (reason) warnings.push(`«${e.label}»: ${reason}`);
      elements[e.id] = {kind: 'bomba', running, flowLmin: f * LMIN, headGainM: gain, hydraulicKw: hyd, shaftKw: hyd / PUMP_EFFICIENCY, nominalKw: nominal, reason};
    } else if (e.type === 'emisor') {
      const f = q(e.id), a = p('entrada'); emitters += f * LMIN;
      elements[e.id] = {kind: 'emisor', flowLmin: f * LMIN, pressureBar: a ? a.pressureBar : 0, wet: !!a, reason: f > 1e-9 ? null : !a ? 'Sin agua: no está conectado a una fuente.' : 'Sin presión suficiente en este punto.'};
    } else if (e.type === 'estanque') {
      const t = tankInfo[e.id];
      const delivered = -((t.salida ? netOut.get(t.salida) ?? 0 : 0) + (t.entrada !== t.salida ? netOut.get(t.entrada) ?? 0 : 0)); // lo que el estanque entrega a la red (negativo si recibe)
      sources += delivered * LMIN;
      elements[e.id] = {kind: 'estanque', surfaceHead: t.surface, levelM: t.level, netOutLmin: delivered * LMIN, dryOutlet: t.dry};
      if (t.dry) warnings.push(`«${e.label}»: el nivel (${fmt(t.level, 2)} m) está bajo la salida; no entrega agua.`);
    }
  }
  return {power, ports, elements, stretched, balance: {sourcesLmin: sources, emittersLmin: emitters, errorLmin: Math.abs(sources - emitters)}, solver: {converged: solved.converged, iterations: solved.iterations, residual: solved.residual}, warnings};
}
