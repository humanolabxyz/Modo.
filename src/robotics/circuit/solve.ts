// Tensiones ESTÁTICAS por red con fuentes ideales (batería, regulador del L298N, 5 V del UNO). No hay corrientes ni dinámica:
// eso llega con el coordinador de la etapa 5. Es un solver pequeño propio: `src/lab/dc.ts` resuelve protoboard por orificios
// (from/to), no una lista genérica de pines, y no se modifica.
import {getDefinition} from '../catalog/index.ts';
import type {PartInstance, PinRef, RobotProject} from '../project/types.ts';
import {buildGraph, netOfPin, pinKey, type CircuitGraph, type NetId} from './graph.ts';

export type Source = {id: string; owner: string; kind: 'battery' | 'uno-5v' | 'l298n-5v'; plus: NetId; minus: NetId; volts: number; plusPin: PinRef};
export type Potential = {component: number; volts: number};

export type UnoState = {kind: 'uno'; powered: boolean; via: 'usb' | 'vin' | '5v' | null; vin: number | null; overvoltage: boolean};
export type L298nState = {kind: 'l298n'; motorSupply: number | null; regulatorOn: boolean; logicPowered: boolean; motorPowered: boolean; enableAHeld: boolean; enableBHeld: boolean};
export type SensorState = {kind: 'hc-sr04'; powered: boolean; supply: number | null};
export type DeviceState = UnoState | L298nState | SensorState;

export type Solution = {
  graph: CircuitGraph;
  potentials: Map<NetId, Potential>;
  sources: Source[];
  devices: Map<string, DeviceState>;
  /** Fuentes que obligan a la misma red a dos tensiones distintas (corto o fuentes en conflicto). */
  conflicts: {sources: [string, string]; nets: NetId[]}[];
};

export const LOGIC_MIN = 4.5, LOGIC_MAX = 5.5, REGULATOR_MIN_IN = 7, VIN_MIN = 7, VIN_MAX = 12, MOTOR_MIN = 5;
const EPS = 1e-6;

/** Propaga las fuentes: cada red tocada recibe (componente, tensión relativa al origen de ese componente). */
function propagate(sources: Source[]): {potentials: Map<NetId, Potential>; conflicts: Solution['conflicts']} {
  const adj = new Map<NetId, {to: NetId; dv: number; src: string}[]>();
  const link = (a: NetId, b: NetId, dv: number, src: string) => (adj.get(a) ?? adj.set(a, []).get(a)!).push({to: b, dv, src});
  for (const s of sources) { link(s.plus, s.minus, -s.volts, s.id); link(s.minus, s.plus, s.volts, s.id); }
  const potentials = new Map<NetId, Potential>(), conflicts: Solution['conflicts'] = [], viaSource = new Map<NetId, string>();
  let component = 0;
  for (const start of adj.keys()) {
    if (potentials.has(start)) continue;
    component++;
    potentials.set(start, {component, volts: 0});
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift()!, here = potentials.get(cur)!;
      for (const edge of adj.get(cur) ?? []) {
        const want = here.volts + edge.dv, known = potentials.get(edge.to);
        if (!known) { potentials.set(edge.to, {component, volts: want}); viaSource.set(edge.to, edge.src); queue.push(edge.to); }
        else if (Math.abs(known.volts - want) > EPS && !conflicts.some(c => c.nets.includes(edge.to))) conflicts.push({sources: [viaSource.get(edge.to) ?? edge.src, edge.src], nets: [cur, edge.to]});
      }
    }
  }
  return {potentials, conflicts};
}

/** Diferencia de tensión V(a) − V(b); `null` si no hay referencia común (redes flotantes). */
export function pd(potentials: Map<NetId, Potential>, a: NetId | undefined, b: NetId | undefined): number | null {
  if (!a || !b) return null;
  if (a === b) return 0;
  const pa = potentials.get(a), pb = potentials.get(b);
  return pa && pb && pa.component === pb.component ? pa.volts - pb.volts : null;
}

const net = (g: CircuitGraph, part: PartInstance, pin: string) => netOfPin(g, part.instanceId, pin);

function evalDevices(g: CircuitGraph, parts: PartInstance[], potentials: Map<NetId, Potential>): Map<string, DeviceState> {
  const out = new Map<string, DeviceState>();
  for (const part of parts) {
    if (part.definitionId === 'arduino-uno-r3') {
      const gnd = net(g, part, 'GND.1'), vin = pd(potentials, net(g, part, 'VIN'), gnd), v5 = pd(potentials, net(g, part, '5V'), gnd);
      const usb = !!part.props?.usb, viaVin = vin !== null && vin >= VIN_MIN, via5 = v5 !== null && v5 >= LOGIC_MIN && v5 <= LOGIC_MAX;
      const via = usb ? 'usb' : viaVin ? 'vin' : via5 ? '5v' : null;
      out.set(part.instanceId, {kind: 'uno', powered: via !== null, via, vin, overvoltage: vin !== null && vin > VIN_MAX});
    } else if (part.definitionId === 'l298n-module') {
      const gnd = net(g, part, 'GND'), vs = pd(potentials, net(g, part, '+12V'), gnd), v5 = pd(potentials, net(g, part, '+5V'), gnd);
      const regulatorOn = (part.props?.jumper5V ?? true) === true && vs !== null && vs >= REGULATOR_MIN_IN;
      const logicPowered = regulatorOn || (v5 !== null && v5 >= LOGIC_MIN && v5 <= LOGIC_MAX);
      out.set(part.instanceId, {kind: 'l298n', motorSupply: vs, regulatorOn, logicPowered, motorPowered: vs !== null && vs >= MOTOR_MIN, enableAHeld: !!(part.props?.jumperENA ?? true), enableBHeld: !!(part.props?.jumperENB ?? true)});
    } else if (part.definitionId === 'hc-sr04') {
      const supply = pd(potentials, net(g, part, 'VCC'), net(g, part, 'GND'));
      out.set(part.instanceId, {kind: 'hc-sr04', powered: supply !== null && supply >= LOGIC_MIN && supply <= LOGIC_MAX, supply});
    }
  }
  return out;
}

/** Resuelve el proyecto: baterías → estado de los dispositivos → fuentes derivadas (5 V del UNO y del L298N) hasta que no cambie nada. */
export function solve(p: RobotProject): Solution {
  const graph = buildGraph(p);
  const base: Source[] = [];
  for (const part of p.parts) {
    if (part.definitionId !== 'battery-holder-4aa') continue;
    const plus = net(graph, part, 'B+'), minus = net(graph, part, 'B-');
    const volts = Number(part.props?.voltage ?? getDefinition(part.definitionId)?.props?.[0]?.default ?? 6);
    if (plus && minus && plus !== minus && Number.isFinite(volts)) base.push({id: `bat:${part.instanceId}`, owner: part.instanceId, kind: 'battery', plus, minus, volts, plusPin: {instanceId: part.instanceId, pinId: 'B+'}});
  }
  let sources = base, result = propagate(sources), devices = evalDevices(graph, p.parts, result.potentials);
  for (let round = 0; round < 6; round++) {
    const derived: Source[] = [];
    for (const part of p.parts) {
      const st = devices.get(part.instanceId);
      if (st?.kind === 'uno' && (st.via === 'usb' || st.via === 'vin')) {
        const plus = net(graph, part, '5V'), minus = net(graph, part, 'GND.1');
        if (plus && minus && plus !== minus) derived.push({id: `uno5v:${part.instanceId}`, owner: part.instanceId, kind: 'uno-5v', plus, minus, volts: 5, plusPin: {instanceId: part.instanceId, pinId: '5V'}});
      }
      if (st?.kind === 'l298n' && st.regulatorOn) {
        const plus = net(graph, part, '+5V'), minus = net(graph, part, 'GND');
        if (plus && minus && plus !== minus) derived.push({id: `l298n5v:${part.instanceId}`, owner: part.instanceId, kind: 'l298n-5v', plus, minus, volts: 5, plusPin: {instanceId: part.instanceId, pinId: '+5V'}});
      }
    }
    const next = [...base, ...derived];
    if (next.map(s => s.id).join('|') === sources.map(s => s.id).join('|')) break;
    sources = next; result = propagate(sources); devices = evalDevices(graph, p.parts, result.potentials);
  }
  return {graph, potentials: result.potentials, sources, devices, conflicts: result.conflicts};
}

export type Reading = {volts: number | null; continuity: boolean; note: string};
/** Multímetro simplificado: tensión V(a) − V(b) y continuidad (misma red). */
export function measure(s: Solution, a: PinRef, b: PinRef): Reading {
  const na = s.graph.netOf.get(pinKey(a)), nb = s.graph.netOf.get(pinKey(b));
  if (!na || !nb) return {volts: null, continuity: false, note: 'Ese pin no existe.'};
  if (na === nb) return {volts: 0, continuity: true, note: 'Los dos pines están unidos (continuidad).'};
  const v = pd(s.potentials, na, nb);
  return v === null
    ? {volts: null, continuity: false, note: 'Sin referencia común: al menos uno de los pines está flotando (no llega a ninguna fuente).'}
    : {volts: Math.round(v * 1000) / 1000, continuity: false, note: 'Sin continuidad: son redes distintas, pero ambas tienen una fuente de referencia.'};
}
