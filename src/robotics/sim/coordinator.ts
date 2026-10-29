// Coordinador temporal (docs/robotica/02 §5): reloj virtual en µs que avanza el MCU, mide el ciclo útil de los pines, resuelve el circuito
// y hace que los dispositivos (HC-SR04, puente H, LED) reaccionen. Es una clase SÍNCRONA y pura (sin Worker): el worker solo le pide avanzar,
// así las pruebas de Node ejercitan exactamente el mismo código que la interfaz.
//   programa → pines → circuito → LED / motores / sensor → pines de entrada → programa
import {solve, type Solution} from '../circuit/solve.ts';
import {solveDynamic, type BridgeState, type DriveMap, type DynamicResult, type LedState, type MotorState, type PinDrive} from '../circuit/dynamic.ts';
import {netOfPin} from '../circuit/graph.ts';
import {AvrRuntime} from '../mcu/avr/runtime.ts';
import {UNO_PINS} from '../mcu/avr/pins.ts';
import type {PinBus, PinMode} from '../mcu/types.ts';
import type {RobotProject} from '../project/types.ts';

export const STEP_US = 2000;          // el circuito se resuelve cada 2 ms virtuales
export const ECHO_LATENCY_US = 450;   // el HC-SR04 tarda ~450 µs en emitir y empezar a escuchar
export const SPEED_OF_SOUND = 343;    // m/s
export const SENSOR_MAX_M = 4, SENSOR_MIN_M = 0.02;

export type SimModel = {project: RobotProject; targetId: string; hex: string};
export type SensorState = {powered: boolean; linked: boolean; distance: number; echoes: number; lastEchoUs: number | null; reason?: string};
export type Snapshot = {
  simTimeUs: number;
  status: 'running' | 'unpowered' | 'error';
  message?: string;
  uno: {powered: boolean; via: string | null};
  pins: Record<string, {mode: PinMode; level: number}>;
  leds: Record<string, LedState>;
  motors: Record<string, MotorState>;
  bridges: Record<string, BridgeState>;
  sensors: Record<string, SensorState>;
  /** Texto nuevo del puerto serie desde la última vez que se pidió. */
  serial: string;
};

type Stat = {mode: PinMode; level: 0 | 1; since: number; highUs: number; avg: number};
type Sensor = {id: string; trig: string; echo: string; distance: number; powered: boolean; gndShared: boolean; t0: number | null; busyUntil: number; state: SensorState};

export class Coordinator {
  readonly solution: Solution;
  private runtime = new AvrRuntime();
  private stats = new Map<string, Stat>();
  private sensors: Sensor[] = [];
  private dynamic: DynamicResult | null = null;
  private time = 0;
  private serialBuf = '';
  private status: Snapshot['status'] = 'running';
  private message: string | undefined;
  private highInputs = new Set<string>();
  private readonly echoPins = new Set<string>();
  private readonly bus: PinBus;
  /** Gancho de observación (pruebas y depuración): cada flanco de cada pin con su instante virtual. */
  trace?: (pin: string, level: 0 | 1, atUs: number) => void;

  readonly model: SimModel;

  constructor(model: SimModel) {
    this.model = model;
    this.solution = solve(model.project);
    const uno = this.uno();
    const st = uno && this.solution.devices.get(uno.instanceId);
    for (const id of Object.keys(UNO_PINS)) this.stats.set(id, {mode: 'in', level: 0, since: 0, highUs: 0, avg: 0});
    this.bus = {
      writeDigital: (pin, level, at) => this.edge(pin, level, at),
      setPinMode: (pin, mode, at) => { const s = this.stats.get(pin); if (!s) return; this.close(s, at); s.mode = mode; },
      serial: byte => { this.serialBuf += String.fromCharCode(byte); },
    };
    if (!uno || st?.kind !== 'uno') { this.status = 'error'; this.message = 'La placa de destino no existe en el proyecto.'; return; }
    const loaded = this.runtime.load(model.hex);
    if (!loaded.ok) { this.status = 'error'; this.message = loaded.error; return; }
    if (!st.powered) { this.status = 'unpowered'; this.message = `${uno.label} no tiene alimentación: el programa no corre.`; }
    this.buildSensors();
    this.refresh(STEP_US);
  }

  private uno() { return this.model.project.parts.find(p => p.instanceId === this.model.targetId && p.definitionId === 'arduino-uno-r3'); }

  /** Cierra la ventana de promedio de un pin hasta `at`. */
  private close(s: Stat, at: number) { if (s.level === 1 && at > s.since) s.highUs += at - s.since; s.since = at; }
  private edge(pin: string, level: 0 | 1, at: number) {
    const s = this.stats.get(pin);
    if (!s) return;
    this.close(s, at); s.level = level; this.trace?.(pin, level, at);
    for (const sensor of this.sensors) if (sensor.trig === pin) this.trigger(sensor, level, at);
  }

  private buildSensors() {
    const {project} = this.model, graph = this.solution.graph, uno = this.uno()!;
    const unoGnd = netOfPin(graph, uno.instanceId, 'GND.1');
    const pinsOn = (net: string | undefined) => (graph.nets.get(net ?? '') ?? []).filter(r => r.instanceId === uno.instanceId && r.pinId in UNO_PINS).map(r => r.pinId);
    for (const part of project.parts.filter(p => p.definitionId === 'hc-sr04')) {
      const st = this.solution.devices.get(part.instanceId), trig = pinsOn(netOfPin(graph, part.instanceId, 'TRIG'))[0], echo = pinsOn(netOfPin(graph, part.instanceId, 'ECHO'))[0];
      const d = typeof part.props?.testDistance === 'number' ? part.props.testDistance : 0.3;
      const powered = st?.kind === 'hc-sr04' && st.powered, gndShared = netOfPin(graph, part.instanceId, 'GND') === unoGnd;
      const linked = !!trig && !!echo, reason = !linked ? 'TRIG o ECHO no llegan a un pin de la placa.' : !powered ? 'Sin 5 V entre VCC y GND.' : !gndShared ? 'El GND del sensor no está unido al de la placa.' : undefined;
      this.sensors.push({id: part.instanceId, trig, echo, distance: d, powered, gndShared, t0: null, busyUntil: 0, state: {powered, linked, distance: d, echoes: 0, lastEchoUs: null, reason}});
      if (echo) this.echoPins.add(echo);
    }
  }

  /** TRIG ≥ 10 µs → el sensor «emite» y ECHO sube 2·d/343 s (el programa lo mide con pulseIn y el reloj virtual). */
  private trigger(s: Sensor, level: 0 | 1, at: number) {
    if (level === 1) { s.t0 = at; return; }
    if (s.t0 === null) return;
    const width = at - s.t0; s.t0 = null;
    if (width < 10 || !s.powered || !s.gndShared || !s.echo || at < s.busyUntil) return;
    const d = Math.max(SENSOR_MIN_M, s.distance);
    if (d > SENSOR_MAX_M) return; // fuera de alcance: ECHO no sube y pulseIn agota su tiempo
    const echoUs = (2 * d / SPEED_OF_SOUND) * 1e6, start = at + ECHO_LATENCY_US;
    s.busyUntil = start + echoUs + 50;
    this.runtime.schedule(start, () => this.runtime.setInput(s.echo, 1));
    this.runtime.schedule(start + echoUs, () => { this.runtime.setInput(s.echo, 0); s.state.echoes++; s.state.lastEchoUs = echoUs; });
  }

  /** Cierra la ventana [time-step, time], resuelve el circuito con los promedios medidos y entrega las entradas al programa. */
  private refresh(step: number) {
    const uno = this.uno()!, drive: DriveMap = new Map(), pins = new Map<string, PinDrive>();
    for (const [id, s] of this.stats) {
      this.close(s, this.time);
      s.avg = s.mode === 'out' ? Math.min(1, s.highUs / Math.max(1, step)) : 0; s.highUs = 0;
      pins.set(id, s.mode === 'out' ? {mode: 'out', level: s.avg} : {mode: 'in', pullup: s.mode === 'pullup'});
    }
    drive.set(uno.instanceId, pins);
    this.dynamic = solveDynamic(this.model.project, drive, this.dynamic ?? undefined, this.solution);
    if (this.status !== 'running') return;
    for (const [id, s] of this.stats) {
      const volts = this.dynamic.pinVolts(uno.instanceId, {instanceId: uno.instanceId, pinId: id}) ?? 0;
      if (id[0] === 'A') this.runtime.setAnalog(id, Math.max(0, volts));
      if (s.mode === 'out' || this.echoPins.has(id)) continue; // el eco lo gobierna el sensor, con el instante exacto
      const high = this.highInputs.has(id) ? volts > 1.5 : volts > 3;  // histéresis 1,5 V / 3 V
      high ? this.highInputs.add(id) : this.highInputs.delete(id);
      this.runtime.setInput(id, high ? 1 : 0);
    }
  }

  /** Avanza `us` microsegundos virtuales. */
  advance(us: number): void {
    let left = us;
    while (left > 1e-6) {
      const step = Math.min(STEP_US, left), target = this.time + step;
      if (this.status === 'running') {
        const r = this.runtime.runUntil(target, this.bus);
        if (r !== 'running') { this.status = 'error'; this.message = `El emulador se detuvo: ${r.error}`; }
      }
      this.time = target; left -= step;
      this.refresh(step);
    }
  }

  get timeUs() { return this.time; }
  get serialPending() { return this.serialBuf.length; }

  snapshot(): Snapshot {
    const uno = this.uno(), st = uno && this.solution.devices.get(uno.instanceId), out: Snapshot['pins'] = {};
    for (const [id, s] of this.stats) if (s.mode !== 'in' || /^D1[0-3]|^D[2-9]$/.test(id)) out[id] = {mode: s.mode, level: s.mode === 'out' ? s.avg : s.level};
    const serial = this.serialBuf; this.serialBuf = '';
    return {
      simTimeUs: this.time, status: this.status, message: this.message, uno: {powered: st?.kind === 'uno' && st.powered, via: st?.kind === 'uno' ? st.via : null}, pins: out,
      leds: Object.fromEntries(this.dynamic?.leds ?? []), motors: Object.fromEntries(this.dynamic?.motors ?? []), bridges: Object.fromEntries(this.dynamic?.bridges ?? []),
      sensors: Object.fromEntries(this.sensors.map(s => [s.id, {...s.state}])), serial,
    };
  }
}
