// Diagnósticos estáticos del circuito (docs/robotica/02 §5). Cada uno lleva los pines implicados (`refs`) para resaltarlos en el lienzo.
// Son avisos didácticos: el usuario puede cablear mal a propósito y verlo; nada se bloquea.
import {getDefinition} from '../catalog/index.ts';
import type {PartInstance, PinRef, RobotProject} from '../project/types.ts';
import {pinKey} from './graph.ts';
import {solve, VIN_MAX, VIN_MIN, type Solution} from './solve.ts';

export type Diagnostic = {severity: 'error' | 'warning' | 'info'; code: string; message: string; refs: PinRef[]};
export const DIAGNOSTIC_CODES = ['battery-reversed', 'supply-short', 'power-conflict', 'unpowered-device', 'ground-not-common', 'motor-unconnected', 'sensor-pin-unconnected', 'overvoltage', 'output-conflict', 'pins-tied', 'enable-jumper'] as const;

const label = (p: RobotProject, id: string) => p.parts.find(x => x.instanceId === id)?.label ?? id;
const pinName = (p: RobotProject, r: PinRef) => `${label(p, r.instanceId)} · ${getDefinition(p.parts.find(x => x.instanceId === r.instanceId)?.definitionId ?? '')?.pins.find(x => x.id === r.pinId)?.label ?? r.pinId}`;
export const connectionLabel = (p: RobotProject, a: PinRef, b: PinRef) => `${pinName(p, a)} → ${pinName(p, b)}`;

export function diagnose(p: RobotProject, solution: Solution = solve(p)): Diagnostic[] {
  const out: Diagnostic[] = [];
  const g = solution.graph;
  const net = (r: PinRef) => g.netOf.get(pinKey(r));
  const hasCable = (r: PinRef) => p.connections.some(c => pinKey(c.a) === pinKey(r) || pinKey(c.b) === pinKey(r));
  const roleOf = (part: PartInstance, pinId: string) => {
    const role = getDefinition(part.definitionId)?.pins.find(x => x.id === pinId)?.role;
    if (part.definitionId === 'l298n-module' && pinId === '+5V') return (part.props?.jumper5V ?? true) ? 'power-out' : 'power-in'; // sin el puente, +5V es una entrada
    return role;
  };
  const pins = (id: string) => p.parts.find(x => x.instanceId === id);

  // Baterías: al revés, en corto, o con sus terminales sin usar
  for (const bat of p.parts.filter(x => x.definitionId === 'battery-holder-4aa')) {
    const plus: PinRef = {instanceId: bat.instanceId, pinId: 'B+'}, minus: PinRef = {instanceId: bat.instanceId, pinId: 'B-'};
    const nPlus = net(plus), nMinus = net(minus);
    if (nPlus && nPlus === nMinus) { out.push({severity: 'error', code: 'supply-short', message: `${bat.label}: el positivo y el negativo están unidos. Es un corto en la batería.`, refs: [plus, minus]}); continue; }
    const inputsOnMinus = (g.nets.get(nMinus ?? '') ?? []).filter(r => r.instanceId !== bat.instanceId && roleOf(pins(r.instanceId)!, r.pinId) === 'power-in');
    const groundsOnPlus = (g.nets.get(nPlus ?? '') ?? []).filter(r => r.instanceId !== bat.instanceId && roleOf(pins(r.instanceId)!, r.pinId) === 'ground');
    if (inputsOnMinus.length || groundsOnPlus.length) out.push({severity: 'error', code: 'battery-reversed', message: `${bat.label} está con la polaridad invertida: ${groundsOnPlus.length ? 'el positivo llega a un pin GND' : 'el negativo llega a una entrada de alimentación'}. Intercambia los dos cables.`, refs: [plus, minus, ...groundsOnPlus, ...inputsOnMinus]});
  }

  // Cortos entre alimentación y GND: una red con una salida de alimentación y un pin de masa
  for (const [id, members] of g.nets) {
    const outs = members.filter(r => roleOf(pins(r.instanceId)!, r.pinId) === 'power-out'), grounds = members.filter(r => roleOf(pins(r.instanceId)!, r.pinId) === 'ground');
    if (outs.length && grounds.length) out.push({severity: 'error', code: 'supply-short', message: `Corto: ${pinName(p, outs[0])} (alimentación) está unido a ${pinName(p, grounds[0])} (GND).`, refs: [...outs, ...grounds]});
    // Dos fuentes activas en la misma red
    const live = solution.sources.filter(s => s.plus === id);
    if (live.length > 1) out.push({severity: 'error', code: 'output-conflict', message: `Dos fuentes de alimentación están unidas entre sí: ${live.map(s => pinName(p, s.plusPin)).join(' y ')}. Una de las dos debe ir sola.`, refs: live.map(s => s.plusPin)});
  }
  for (const c of solution.conflicts) {
    const members = c.nets.flatMap(n => g.nets.get(n) ?? []);
    if (!out.some(d => d.code === 'supply-short' || d.code === 'output-conflict')) out.push({severity: 'error', code: 'power-conflict', message: 'Hay fuentes que exigen tensiones distintas en la misma red (corto o fuentes en conflicto).', refs: members.slice(0, 6)});
  }

  // Salidas del puente H unidas entre sí; pines de placa unidos entre sí
  for (const [, members] of g.nets) {
    const outs = members.filter(r => pins(r.instanceId)?.definitionId === 'l298n-module' && /^OUT\d$/.test(r.pinId));
    if (outs.length > 1) out.push({severity: 'warning', code: 'output-conflict', message: `Salidas del L298N unidas entre sí (${outs.map(r => r.pinId).join(', ')}): puede cortocircuitar el puente H.`, refs: outs});
    const board = members.filter(r => pins(r.instanceId)?.definitionId === 'arduino-uno-r3' && /^(D\d+|A\d)$/.test(r.pinId));
    if (board.length > 1) out.push({severity: 'warning', code: 'pins-tied', message: `Pines de la placa unidos entre sí (${board.map(r => r.pinId).join(', ')}): si ambos son salidas pueden dañarse.`, refs: board});
  }

  // Dispositivos: alimentación presente (solo si ya están conectados a algo)
  const used = (part: PartInstance) => p.connections.some(c => c.a.instanceId === part.instanceId || c.b.instanceId === part.instanceId);
  for (const part of p.parts) {
    const st = solution.devices.get(part.instanceId);
    if (!st || !used(part)) continue;
    if (st.kind === 'uno') {
      if (!st.powered) out.push({severity: 'warning', code: 'unpowered-device', message: `${part.label} no tiene alimentación${st.vin !== null && st.vin > 0 ? `: VIN recibe solo ${st.vin.toFixed(1)} V y necesita al menos ${VIN_MIN} V` : ''}. Conecta VIN a un positivo de ${VIN_MIN}–${VIN_MAX} V (con su GND), el pin 5V a 5 V, o activa «Alimentada por USB» en Propiedades.`, refs: [{instanceId: part.instanceId, pinId: 'VIN'}, {instanceId: part.instanceId, pinId: 'GND.1'}]});
      if (st.overvoltage) out.push({severity: 'error', code: 'overvoltage', message: `${part.label}: VIN recibe ${st.vin?.toFixed(1)} V, por encima de los ${VIN_MAX} V recomendados.`, refs: [{instanceId: part.instanceId, pinId: 'VIN'}]});
    }
    if (st.kind === 'l298n') {
      if (!st.motorPowered) out.push({severity: 'warning', code: 'unpowered-device', message: `${part.label}: los motores no tienen alimentación (+12V respecto a GND ${st.motorSupply === null ? 'sin referencia' : `= ${st.motorSupply.toFixed(1)} V`}).`, refs: [{instanceId: part.instanceId, pinId: '+12V'}, {instanceId: part.instanceId, pinId: 'GND'}]});
      else if (!st.logicPowered) out.push({severity: 'warning', code: 'unpowered-device', message: `${part.label}: la lógica no tiene 5 V (puente del regulador puesto y ≥ 7 V en +12V, o 5 V externos en +5V).`, refs: [{instanceId: part.instanceId, pinId: '+5V'}, {instanceId: part.instanceId, pinId: 'GND'}]});
      const ena = {instanceId: part.instanceId, pinId: 'ENA'}, enb = {instanceId: part.instanceId, pinId: 'ENB'};
      if (st.enableAHeld && hasCable(ena)) out.push({severity: 'info', code: 'enable-jumper', message: `${part.label}: ENA tiene el puente puesto (siempre activado); el PWM que le conectes no controlará la velocidad. Quita el puente en Propiedades.`, refs: [ena]});
      if (st.enableBHeld && hasCable(enb)) out.push({severity: 'info', code: 'enable-jumper', message: `${part.label}: ENB tiene el puente puesto (siempre activado); el PWM que le conectes no controlará la velocidad. Quita el puente en Propiedades.`, refs: [enb]});
    }
    if (st.kind === 'hc-sr04' && !st.powered) out.push({severity: 'warning', code: 'unpowered-device', message: `${part.label} no tiene 5 V entre VCC y GND${st.supply === null ? ' (sin referencia común)' : ` (hay ${st.supply.toFixed(1)} V)`}.`, refs: [{instanceId: part.instanceId, pinId: 'VCC'}, {instanceId: part.instanceId, pinId: 'GND'}]});
  }

  // Masas no comunes entre dispositivos que se comunican por cables
  const grounds: Record<string, string> = {'arduino-uno-r3': 'GND.1', 'l298n-module': 'GND', 'hc-sr04': 'GND'};
  const seenPairs = new Set<string>();
  for (const c of p.connections) {
    const a = pins(c.a.instanceId), b = pins(c.b.instanceId);
    if (!a || !b || a.instanceId === b.instanceId || !grounds[a.definitionId] || !grounds[b.definitionId]) continue;
    const ga: PinRef = {instanceId: a.instanceId, pinId: grounds[a.definitionId]}, gb: PinRef = {instanceId: b.instanceId, pinId: grounds[b.definitionId]};
    const key = [a.instanceId, b.instanceId].sort().join('|');
    // Las alimentaciones que ya comparten red por un cable de potencia no cuentan como señal
    const powerOnly = [c.a, c.b].every(r => ['power-in', 'power-out', 'ground'].includes(roleOf(pins(r.instanceId)!, r.pinId) ?? ''));
    if (seenPairs.has(key) || powerOnly || net(ga) === net(gb)) continue;
    seenPairs.add(key);
    out.push({severity: 'warning', code: 'ground-not-common', message: `${a.label} y ${b.label} se comunican pero sus GND no están unidos: sin masa común la señal no tiene referencia.`, refs: [ga, gb]});
  }

  // Motores y sensor sin conectar
  for (const part of p.parts) {
    if (part.definitionId === 'dc-motor-tt') {
      const m: PinRef[] = [{instanceId: part.instanceId, pinId: 'M+'}, {instanceId: part.instanceId, pinId: 'M-'}], open = m.filter(r => !hasCable(r));
      if (open.length) out.push({severity: 'warning', code: 'motor-unconnected', message: `${part.label} no está conectado${open.length === 1 ? ` (falta ${open[0].pinId})` : ''}: no recibirá corriente.`, refs: m});
    }
    if (part.definitionId === 'hc-sr04') {
      const open = ['TRIG', 'ECHO'].filter(id => !hasCable({instanceId: part.instanceId, pinId: id}));
      if (open.length) out.push({severity: 'warning', code: 'sensor-pin-unconnected', message: `${part.label}: ${open.join(' y ')} sin conectar; el programa no podrá medir distancia.`, refs: open.map(id => ({instanceId: part.instanceId, pinId: id}))});
    }
  }
  // Orden: errores primero, luego avisos e info; estable
  const rank = {error: 0, warning: 1, info: 2} as const;
  const seen = new Set<string>();
  const unique = out.filter(d => { const key = `${d.code}|${d.refs.map(pinKey).sort().join(',')}`; if (seen.has(key)) return false; seen.add(key); return true; });
  return unique.map((d, i) => ({d, i})).sort((x, y) => rank[x.d.severity] - rank[y.d.severity] || x.i - y.i).map(x => x.d);
}


/** Aviso al crear un cable (no bloquea: permitir errores didácticos). `null` si el cable es razonable. */
export function connectionWarning(p: RobotProject, a: PinRef, b: PinRef): string | null {
  const roleOf = (r: PinRef) => {
    const part = p.parts.find(x => x.instanceId === r.instanceId);
    if (part?.definitionId === 'l298n-module' && r.pinId === '+5V') return (part.props?.jumper5V ?? true) ? 'power-out' : 'power-in';
    return part ? getDefinition(part.definitionId)?.pins.find(x => x.id === r.pinId)?.role : undefined;
  };
  const ra = roleOf(a), rb = roleOf(b), power = (r?: string) => r === 'power-in' || r === 'power-out', signal = (r?: string) => r === 'digital' || r === 'pwm' || r === 'analog' || r === 'signal';
  const busy = [a, b].filter(r => p.connections.some(c => pinKey(c.a) === pinKey(r) || pinKey(c.b) === pinKey(r)));
  if ((ra === 'ground' && power(rb)) || (rb === 'ground' && power(ra))) return 'Cuidado: unes un GND con una alimentación. Eso es un corto.';
  if (ra === 'power-out' && rb === 'power-out') return 'Cuidado: unes dos salidas de alimentación.';
  if ((ra === 'power-in' && signal(rb)) || (rb === 'power-in' && signal(ra))) return 'Cuidado: unes una entrada de alimentación con un pin de señal.';
  if ((ra === 'motor' && signal(rb)) || (rb === 'motor' && signal(ra))) return 'Cuidado: unes una salida de motor con un pin de señal.';
  if (busy.length) return 'Ese pin ya tenía otro cable: ahora todos comparten la misma red.';
  return null;
}
