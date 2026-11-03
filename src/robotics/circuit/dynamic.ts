// Circuito «con tiempo» (etapa 4): análisis nodal modificado de las redes del proyecto con los pines del UNO que el programa maneja.
// Es un solver DC por pasos (la tensión PROMEDIO de cada pin PWM en la ventana), no un simulador de transitorios:
//   fuentes reales con resistencia interna (batería, 5 V del UNO y del L298N, pines de salida del ATmega ≈ 25 Ω, salidas del puente H),
//   resistencias, motores (8 Ω de rotor bloqueado, sin fuerza contraelectromotriz) y LED lineales por tramos (Vf + 5 Ω).
// Todo lo que sale de aquí viene de las redes del proyecto: ningún LED ni motor «se enciende» sin un camino eléctrico real.
import type {PartInstance, RobotProject} from '../project/types.ts';
import {netOfPin, type CircuitGraph, type NetId} from './graph.ts';
import {solve, type Solution} from './solve.ts';

/** Lo que el programa hace con un pin del UNO durante la ventana: salida con tensión promedio (0–1 de 5 V) o entrada (con o sin pull-up). */
export type PinDrive = {mode: 'out'; level: number} | {mode: 'in'; pullup: boolean};
export type DriveMap = Map<string, Map<string, PinDrive>>; // instanceId del UNO → pinId → comportamiento

export const LED_VF: Record<string, number> = {rojo: 1.9, verde: 2.1, amarillo: 2.0, azul: 3.0};
export const R_PIN_OUT = 25, R_LED_ON = 5, R_MOTOR = 8, R_BATTERY = 0.3, R_REGULATOR = 1, R_BRIDGE = 1.5, V_BRIDGE_DROP = 2, LOGIC_HIGH = 2.5, GMIN = 1e-9;
export const R_BUTTON_ON = 0.1, R_POT_TOTAL = 10_000, R_POT_MIN = 1;
export const LED_FULL_A = 0.015, LED_BURN_A = 0.03;

export type LedState = {on: boolean; amps: number; brightness: number; overcurrent: boolean};
/** `braking`: sus dos terminales están unidos a masa por el puente H (freno rápido): se opone al giro aunque la tensión sea 0 V. */
export type MotorState = {volts: number; amps: number; speed: number; braking: boolean};
export type BridgeState = {logic: boolean; motorSupply: number; channelA: {enable: number; direction: -1 | 0 | 1}; channelB: {enable: number; direction: -1 | 0 | 1}};
export type DynamicResult = {
  voltages: Map<NetId, number>;
  leds: Map<string, LedState>;
  motors: Map<string, MotorState>;
  bridges: Map<string, BridgeState>;
  /** Tensión (V) de un pin respecto del GND del UNO dado; `null` si la red no existe. */
  pinVolts(unoId: string, ref: {instanceId: string; pinId: string}): number | null;
};

const num = (part: PartInstance, key: string, fallback: number) => { const v = part.props?.[key]; return typeof v === 'number' && Number.isFinite(v) ? v : fallback; };

type Elem = {a: number; b: number; g: number; i: number}; // conductancia entre a y b, y corriente inyectada hacia a (y sacada de b)

function gauss(n: number, g: number[][], rhs: number[]): number[] {
  const m = g.map((row, i) => [...row, rhs[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    if (Math.abs(m[p][c]) < 1e-18) continue;
    [m[c], m[p]] = [m[p], m[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = m[r][c] / m[c][c]; if (f) for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k]; }
  }
  return m.map((row, i) => (Math.abs(row[i]) < 1e-18 ? 0 : row[n] / row[i]));
}

/** Resuelve el circuito con el comportamiento actual de los pines. `previous` aporta las tensiones del paso anterior (entradas del L298N). */
export function solveDynamic(project: RobotProject, drive: DriveMap, previous?: DynamicResult, solution: Solution = solve(project), sensorOutputs: ReadonlyMap<string, number> = new Map(), controls: ReadonlyMap<string, number> = new Map()): DynamicResult {
  const graph: CircuitGraph = solution.graph;
  const net = (part: PartInstance, pin: string) => netOfPin(graph, part.instanceId, pin);
  // Referencia (0 V): la red del negativo de la batería, si no la del GND del primer UNO, si no la del primer GND que haya.
  const batteries = project.parts.filter(p => p.definitionId === 'battery-holder-4aa'), unos = project.parts.filter(p => p.definitionId === 'arduino-uno-r3');
  const refNet = (batteries[0] && net(batteries[0], 'B-')) || (unos[0] && net(unos[0], 'GND.1')) || undefined;
  const index = new Map<NetId, number>(), nodeOf = (n: NetId | undefined): number => { if (!n || n === refNet) return -1; let i = index.get(n); if (i === undefined) { i = index.size; index.set(n, i); } return i; };
  const elems: Elem[] = [];
  const source = (plus: NetId | undefined, minus: NetId | undefined, volts: number, r: number) => { const a = nodeOf(plus), b = nodeOf(minus), g = 1 / r; if (a === -1 && b === -1) return; elems.push({a, b, g, i: volts * g}); };
  const conduct = (x: NetId | undefined, y: NetId | undefined, g: number) => { const a = nodeOf(x), b = nodeOf(y); if (a === b) return; elems.push({a, b, g, i: 0}); };

  // Fuentes estáticas (batería, 5 V del UNO, regulador del L298N) con su resistencia interna
  for (const s of solution.sources) source(s.plus, s.minus, s.volts, s.kind === 'battery' ? R_BATTERY : R_REGULATOR);
  // Pines del UNO: salidas (tensión promedio), entradas con pull-up
  for (const uno of unos) {
    const st = solution.devices.get(uno.instanceId);
    if (!st || st.kind !== 'uno' || !st.powered) continue;
    const gnd = net(uno, 'GND.1');
    for (const [pinId, d] of drive.get(uno.instanceId) ?? []) {
      if (d.mode === 'out') source(net(uno, pinId), gnd, 5 * Math.min(1, Math.max(0, d.level)), R_PIN_OUT);
      else if (d.pullup) source(net(uno, pinId), gnd, 5, 20000);
    }
  }
  // The IR comparator drives its own DO net; MCU inputs still receive it through actual wiring.
  for (const part of project.parts.filter(p => p.definitionId === 'tcrt5000-module')) {
    const st = solution.devices.get(part.instanceId), level = sensorOutputs.get(part.instanceId);
    if (st?.kind === 'tcrt5000' && st.powered && level !== undefined) source(net(part, 'DO'), net(part, 'GND'), level, 1000);
  }
  // Puente H: cada canal reproduce la tabla de verdad con las tensiones del paso anterior
  const bridges = new Map<string, BridgeState>(), braked = new Set<NetId>();
  for (const part of project.parts.filter(p => p.definitionId === 'l298n-module')) {
    const st = solution.devices.get(part.instanceId);
    if (!st || st.kind !== 'l298n') continue;
    const gnd = net(part, 'GND'), vs = st.motorSupply ?? 0, level = (pin: string) => { const v = previous?.voltages; const n = net(part, pin), g = gnd; if (!v || !n) return 0; const vn = n === refNet ? 0 : v.get(n) ?? 0, vg = g === refNet ? 0 : v.get(g!) ?? 0; return vn - vg; };
    const channel = (en: string, in1: string, in2: string, o1: string, o2: string) => {
      const enable = st.logicPowered && st.motorPowered ? Math.min(1, Math.max(0, level(en) / 5)) : 0;
      const a = level(in1) > LOGIC_HIGH, b = level(in2) > LOGIC_HIGH, direction: -1 | 0 | 1 = a && !b ? 1 : !a && b ? -1 : 0;
      if (enable > 0.02 && direction !== 0) { // con ENA/ENB activos y un solo IN en alto: un lado conduce a Vs−2 V y el otro a 0 V
        const high = Math.max(0, vs - V_BRIDGE_DROP) * enable;
        source(net(part, o1), gnd, direction === 1 ? high : 0, R_BRIDGE); source(net(part, o2), gnd, direction === -1 ? high : 0, R_BRIDGE);
      } else if (enable > 0.02 && a === b) { source(net(part, o1), gnd, 0, R_BRIDGE); source(net(part, o2), gnd, 0, R_BRIDGE); const n1 = net(part, o1), n2 = net(part, o2); if (n1) braked.add(n1); if (n2) braked.add(n2); } // freno rápido (hoja de datos del L298): IN1 = IN2 con enable alto, ya sea ambos en alto o ambos en bajo; ambas salidas a masa
      return {enable, direction};
    };
    bridges.set(part.instanceId, {logic: st.logicPowered, motorSupply: vs, channelA: channel('ENA', 'IN1', 'IN2', 'OUT1', 'OUT2'), channelB: channel('ENB', 'IN3', 'IN4', 'OUT3', 'OUT4')});
  }
  // Pasivos y cargas
  for (const part of project.parts) {
    if (part.definitionId === 'resistor') conduct(net(part, 'P1'), net(part, 'P2'), 1 / Math.max(1, num(part, 'ohms', 220)));
    if (part.definitionId === 'dc-motor-tt') conduct(net(part, 'M+'), net(part, 'M-'), 1 / R_MOTOR);
    // Pulsador: pulsado une sus terminales (valor vivo 0/1). Potenciómetro: el cursor reparte los 10 kΩ en dos tramos (valor vivo 0–1).
    if (part.definitionId === 'push-button-6mm' && (controls.get(part.instanceId) ?? (part.props?.pressed ? 1 : 0)) >= 0.5) conduct(net(part, 'P1'), net(part, 'P2'), 1 / R_BUTTON_ON);
    if (part.definitionId === 'potentiometer-10k') {
      const pos = Math.min(1, Math.max(0, controls.get(part.instanceId) ?? num(part, 'position', 0.5)));
      conduct(net(part, 'VCC'), net(part, 'OUT'), 1 / Math.max(R_POT_MIN, R_POT_TOTAL * (1 - pos))); conduct(net(part, 'OUT'), net(part, 'GND'), 1 / Math.max(R_POT_MIN, R_POT_TOTAL * pos)); // 0 = cursor en GND (0 V), 1 = en VCC
    }
  }
  const leds = project.parts.filter(p => p.definitionId === 'led-5mm'), ledOn = new Map<string, boolean>(leds.map(l => [l.instanceId, false]));
  const vf = (l: PartInstance) => LED_VF[String(l.props?.color ?? 'rojo')] ?? 1.9;
  const nodes = () => index.size;
  const run = (): number[] => {
    const all: Elem[] = [...elems];
    for (const l of leds) {
      const x = nodeOf(net(l, 'A')), y = nodeOf(net(l, 'K'));
      if (x === y) continue;
      if (ledOn.get(l.instanceId)) { const g = 1 / R_LED_ON; all.push({a: x, b: y, g, i: vf(l) * g}); } // encendido: Vf en serie con 5 Ω
      else all.push({a: x, b: y, g: GMIN, i: 0});
    }
    const n = nodes(); const g = Array.from({length: n}, () => new Array<number>(n).fill(0)), rhs = new Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) g[i][i] += GMIN; // evita matrices singulares con redes flotantes
    for (const e of all) {
      if (e.a >= 0) { g[e.a][e.a] += e.g; rhs[e.a] += e.i; }
      if (e.b >= 0) { g[e.b][e.b] += e.g; rhs[e.b] -= e.i; }
      if (e.a >= 0 && e.b >= 0) { g[e.a][e.b] -= e.g; g[e.b][e.a] -= e.g; }
    }
    return gauss(n, g, rhs);
  };
  // Los nodos de los LED tienen que existir antes de montar la matriz
  for (const l of leds) { nodeOf(net(l, 'A')); nodeOf(net(l, 'K')); }
  let v = run();
  const volt = (n: NetId | undefined) => { const i = nodeOf(n); return i < 0 ? 0 : v[i]; };
  // Cada LED es un diodo: se prueba «apagado/encendido» hasta que todos sean coherentes. Un LED que al encenderse no conduce
  // (cátodo al aire, camino abierto) queda «bloqueado» en apagado para no oscilar.
  const blocked = new Set<string>(), amps = (l: PartInstance) => (volt(net(l, 'A')) - volt(net(l, 'K')) - vf(l)) / R_LED_ON;
  for (let round = 0; round < 10; round++) {
    let changed = false;
    for (const l of leds) {
      const vd = volt(net(l, 'A')) - volt(net(l, 'K')), on = ledOn.get(l.instanceId)!;
      if (!on && !blocked.has(l.instanceId) && vd > vf(l) + 0.02) { ledOn.set(l.instanceId, true); changed = true; }
      else if (on && amps(l) < 1e-6) { ledOn.set(l.instanceId, false); blocked.add(l.instanceId); changed = true; }
    }
    if (!changed) break;
    v = run();
  }
  const voltages = new Map<NetId, number>(); for (const [n, i] of index) voltages.set(n, v[i]); if (refNet) voltages.set(refNet, 0);
  const ledResult = new Map<string, LedState>();
  for (const l of leds) { const on = ledOn.get(l.instanceId)!, i = on ? Math.max(0, amps(l)) : 0; ledResult.set(l.instanceId, {on: on && i > 1e-6, amps: i, brightness: on ? Math.min(1, i / LED_FULL_A) : 0, overcurrent: i > LED_BURN_A}); }
  const motors = new Map<string, MotorState>();
  for (const m of project.parts.filter(p => p.definitionId === 'dc-motor-tt')) { const vm = volt(net(m, 'M+')) - volt(net(m, 'M-')); const n1 = net(m, 'M+'), n2 = net(m, 'M-'); motors.set(m.instanceId, {volts: vm, amps: Math.abs(vm) / R_MOTOR, speed: Math.max(-1, Math.min(1, vm / 6)), braking: !!n1 && !!n2 && braked.has(n1) && braked.has(n2)}); }
  return {
    voltages, leds: ledResult, motors, bridges,
    pinVolts(unoId, ref) {
      const uno = project.parts.find(p => p.instanceId === unoId), n = netOfPin(graph, ref.instanceId, ref.pinId), g = uno && net(uno, 'GND.1');
      if (!n || !g) return null;
      const get = (x: NetId) => (x === refNet ? 0 : voltages.get(x) ?? 0);
      return get(n) - get(g);
    },
  };
}

