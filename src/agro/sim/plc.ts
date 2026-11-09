// Ejecución del PLC del tablero (Fase 5). Puro.
//
// El PLC se ejecuta en cada paso de la simulación (≤ 5 min con agua en movimiento; ≤ 10 min si hay un tablero en automático), no cada pocos
// milisegundos como uno real: los temporizadores y las reacciones tienen esa resolución. Las entradas las calcula el mundo (sonda, reloj); la
// salida Y0 decide si el tablero da paso a la energía de la bomba en modo automático (ver `power.ts`).
import type {AgroProgram, Connection, Entity, PropValue} from '../model/types.ts';
import {EMPTY_PROGRAM, readRuntime, scanStep, writeRuntime} from '../plc/program.ts';
import {parcelAt} from '../world/placement.ts';
import {analyzePower} from './power.ts';
import {viewOf} from './soil.ts';

/** Agua útil (%) de la parcela donde está clavada la sonda; null si está fuera de toda parcela. (Mismo cálculo que `sensorReading` de alerts.ts, sin importarlo para no cerrar un ciclo con step.ts.) */
const availableAt = (entities: readonly Entity[], sensor: Entity): number | null => { const p = parcelAt(entities, sensor.pose.position[0], sensor.pose.position[2]); return p ? viewOf(p.state).available * 100 : null; };

export type Programs = Record<string, AgroProgram> | undefined;
const num = (v: PropValue | undefined, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** La sonda cableada a la entrada de señal del tablero (null si no hay cable o la otra punta no es una sonda). */
export function wiredSensor(entities: readonly Entity[], connections: readonly Connection[], board: Entity): Entity | null {
  const c = connections.find(x => x.kind === 'signal' && x.status === 'connected' && ((x.a.entityId === board.id && x.a.portId === 'entrada-senal') || (x.b.entityId === board.id && x.b.portId === 'entrada-senal')));
  if (!c) return null;
  const other = c.a.entityId === board.id ? c.b : c.a;
  const e = entities.find(x => x.id === other.entityId);
  return e && e.type === 'sensor-humedad' ? e : null;
}

/** Franja horaria de riego [ini, fin) en horas locales; si ini > fin cruza la medianoche; si son iguales no hay franja. */
export const inWindow = (hour: number, ini: number, fin: number): boolean => (ini === fin ? false : ini < fin ? hour >= ini && hour < fin : hour >= ini || hour < fin);

export type PlcInputs = {x: [boolean, boolean, boolean, boolean]; sensor: Entity | null; /** agua útil (%) que marca la sonda cableada; null si no hay sonda o está fuera de toda parcela */ availablePct: number | null};
/** Entradas físicas del PLC en este instante. */
export function plcInputs(entities: readonly Entity[], connections: readonly Connection[], board: Entity, hour: number): PlcInputs {
  const sensor = wiredSensor(entities, connections, board), avail = sensor ? availableAt(entities, sensor) : null;
  const seco = num(board.params.secoPct, 50), humedo = num(board.params.humedoPct, 85);
  return {x: [avail !== null && avail < seco, avail !== null && avail > humedo, inWindow(hour, num(board.params.horaIniH, 0), num(board.params.horaFinH, 24)), false], sensor, availablePct: avail};
}

/** ¿Tiene energía el PLC? Hace falta acometida conectada al tablero y el interruptor general encendido. */
export const boardPowered = (entities: readonly Entity[], connections: readonly Connection[], board: Entity, live = analyzePower(entities, connections).live): boolean => board.state.interruptor === true && !(typeof board.state.obraHasta === 'number' && board.state.obraHasta > 0) && live.has(`${board.id}:red`);

export type PlcRun = {entities: Entity[]; /** ¿cambió la salida Y0 de algún tablero (la red debe recalcularse)? */ outputChanged: boolean; /** ¿hay un PLC con energía en modo automático? */ watching: boolean};

/** Ejecuta un escaneo de cada tablero con programa. `dtMs` son los milisegundos transcurridos desde el escaneo anterior (0 = solo resolver la lógica). */
export function runPlcs(entities: readonly Entity[], connections: readonly Connection[], programs: Programs, hour: number, dtMs: number): PlcRun {
  if (!programs || Object.keys(programs).length === 0) return {entities: entities as Entity[], outputChanged: false, watching: false};
  const live = analyzePower(entities, connections).live;
  let outputChanged = false, watching = false, changed = false;
  const out = entities.map(e => {
    if (e.type !== 'tablero') return e;
    const program = programs[e.id]; if (!program) return e;
    const before = readRuntime(e.state, program), powered = boardPowered(entities, connections, e, live);
    let values: Record<string, boolean>, scan = before.scan;
    if (!powered) {   // sin energía: se apagan salidas, temporizadores y contadores; las marcas M se conservan
      values = Object.fromEntries(Object.entries(before.values).filter(([k, v]) => v && k[0] === 'M'));
      scan = {timers: {}, counters: {}};
    } else {
      watching ||= e.state.modo === 'auto';
      const inputs = plcInputs(entities, connections, e, hour).x;
      const given = {...before.values, X0: inputs[0], X1: inputs[1], X2: inputs[2], X3: inputs[3]};
      const r = scanStep({rungs: program.rungs, memory: []}, given, before.scan, dtMs); values = r.values; scan = r.state;
    }
    const written = writeRuntime(program, {values, scan});
    if (written.plcBits === e.state.plcBits && written.plcAcc === e.state.plcAcc && written.plcCnt === e.state.plcCnt) return e;
    if (!!values.Y0 !== !!before.values.Y0) outputChanged = true;
    changed = true;
    return {...e, state: {...e.state, ...written}};
  });
  return {entities: changed ? out : (entities as Entity[]), outputChanged, watching};
}

export { EMPTY_PROGRAM };
