// Coordinador temporal (docs/robotica/02 §5): reloj virtual en µs que avanza el MCU, mide el ciclo útil de los pines, resuelve el circuito
// y hace que los dispositivos (HC-SR04, puente H, LED) reaccionen. Es una clase SÍNCRONA y pura (sin Worker): el worker solo le pide avanzar,
// así las pruebas de Node ejercitan exactamente el mismo código que la interfaz.
//   programa → pines → circuito → LED / motores / sensor → pines de entrada → programa
import {solve, type Solution} from '../circuit/solve.ts';
import {solveDynamic, type BridgeState, type DriveMap, type DynamicResult, type LedState, type MotorState, type PinDrive} from '../circuit/dynamic.ts';
import {netOfPin} from '../circuit/graph.ts';
import {AvrRuntime} from '../mcu/avr/runtime.ts';
import {Ssd1306} from '../mcu/i2c/ssd1306.ts';
import {UNO_PINS} from '../mcu/avr/pins.ts';
import type {PinBus, PinMode} from '../mcu/types.ts';
import type {RobotProject} from '../project/types.ts';
import type {PhysicsFrame} from './physics.ts';

export const STEP_US = 2000;          // el circuito se resuelve cada 2 ms virtuales
export const ECHO_LATENCY_US = 450;   // el HC-SR04 tarda ~450 µs en emitir y empezar a escuchar
export const SPEED_OF_SOUND = 343;    // m/s
export const SENSOR_MAX_M = 4, SENSOR_MIN_M = 0.02;
/** Servo SG90 con la biblioteca Servo de Arduino: 544 µs = 0°, 2400 µs = 180°; los pulsos fuera de 400–2700 µs se ignoran. Velocidad ≈ 0,1 s por cada 60°. */
const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);
export const SERVO_US_MIN = 544, SERVO_US_MAX = 2400, SERVO_VALID_MIN = 400, SERVO_VALID_MAX = 2700, SERVO_DEG_PER_S = 600, SERVO_REST_DEG = 90;

export type SimModel = {project: RobotProject; targetId: string; hex: string; /** Con física (Rapier): ruedas, obstáculos y rayos del HC-SR04. */ physics?: boolean};
/** The physics port supplies measurements; outputs still propagate through the circuit. */
export interface PhysicsPort {
  step(motorVolts: ReadonlyMap<string, number>, brakes?: ReadonlySet<string>): void;
  /** Ángulo de cada servo (el cuello gira la cabeza y el radar). */
  setServos?(angles: ReadonlyMap<string, number>): void;
  distance(sensorId: string): number | null | undefined;
  reflectance?(sensorId: string): {black: boolean; origin: [number, number, number]; height: number} | undefined;
  frame(): PhysicsFrame;
}
export type ReflectanceState = {powered: boolean; linked: boolean; black: boolean; level: 0 | 1; height: number | null; measured: boolean};
export type SensorState = {powered: boolean; linked: boolean; distance: number; echoes: number; lastEchoUs: number | null; reason?: string};
export type ServoSimState = {powered: boolean; linked: boolean; /** Ángulo actual del eje (°), con la velocidad del SG90. */ angle: number; /** Ángulo que pide el último pulso válido (°), o null si aún no llegó ninguno. */ target: number | null; pulseUs: number | null; pulses: number; reason?: string};
export type DisplaySimState = {powered: boolean; /** SDA en A4, SCL en A5 y GND común: el bus lo ve. */ linked: boolean; reason?: string; on: boolean; version: number; dataBytes: number; address: number;
  /** Imagen final (64 filas × 16 bytes, bit 7 = píxel izquierdo); la misma referencia mientras no cambie. */ frame: Uint8Array};
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
  reflectance: Record<string, ReflectanceState>;
  servos: Record<string, ServoSimState>;
  /** Pantallas OLED por I²C: lo que el programa dibujó. */
  displays: Record<string, DisplaySimState>;
  /** Valor vivo de cada control: potenciómetro 0–1, pulsador 0/1. */
  controls: Record<string, number>;
  /** Poses, ruedas y rayos de la física (solo si hay física). */
  physics?: PhysicsFrame;
};

type Stat = {mode: PinMode; level: 0 | 1; since: number; highUs: number; avg: number};
type Display = {id: string; device: Ssd1306; address: number; powered: boolean; linked: boolean; reason?: string};
type Servo = {id: string; pin: string | undefined; powered: boolean; gndShared: boolean; rise: number | null; state: ServoSimState};
type Sensor = {id: string; trig: string; echo: string; distance: number; fromPhysics: boolean; powered: boolean; gndShared: boolean; t0: number | null; busyUntil: number; state: SensorState};

export class Coordinator {
  readonly solution: Solution;
  private runtime = new AvrRuntime();
  private stats = new Map<string, Stat>();
  private sensors: Sensor[] = [];
  private servos: Servo[] = [];
  private displays: Display[] = [];
  private controls = new Map<string, number>();
  private reflectance: Record<string, ReflectanceState> = {};
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
  private readonly physics: PhysicsPort | undefined;

  constructor(model: SimModel, physics?: PhysicsPort) {
    this.model = model; this.physics = physics;
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
    this.buildServos();
    this.buildDisplays();
    for (const part of model.project.parts) {
      if (part.definitionId === 'potentiometer-10k') this.controls.set(part.instanceId, clamp01(Number(part.props?.position ?? 0.5)));
      if (part.definitionId === 'push-button-6mm') this.controls.set(part.instanceId, part.props?.pressed ? 1 : 0);
    }
    this.refresh(STEP_US);
  }

  /** Cambia en vivo un control del banco (deslizador del potenciómetro o pulsador). Ignora ids que no son controles. */
  setControl(id: string, value: number): void { if (this.controls.has(id)) this.controls.set(id, clamp01(value)); }

  private uno() { return this.model.project.parts.find(p => p.instanceId === this.model.targetId && p.definitionId === 'arduino-uno-r3'); }

  /** Cierra la ventana de promedio de un pin hasta `at`. */
  private close(s: Stat, at: number) { if (s.level === 1 && at > s.since) s.highUs += at - s.since; s.since = at; }
  private edge(pin: string, level: 0 | 1, at: number) {
    const s = this.stats.get(pin);
    if (!s) return;
    this.close(s, at); s.level = level; this.trace?.(pin, level, at);
    for (const sensor of this.sensors) if (sensor.trig === pin) this.trigger(sensor, level, at);
    for (const servo of this.servos) if (servo.pin === pin) this.servoPulse(servo, level, at);
  }

  /** Mide el ancho de cada pulso de la señal (flanco de subida → bajada), como lo ve el servo real. */
  private servoPulse(s: Servo, level: 0 | 1, at: number) {
    if (level === 1) { s.rise = at; return; }
    if (s.rise === null) return;
    const width = at - s.rise; s.rise = null;
    if (width < SERVO_VALID_MIN || width > SERVO_VALID_MAX) return;
    s.state.pulseUs = Math.round(width); s.state.pulses++;
    s.state.target = Math.min(180, Math.max(0, (width - SERVO_US_MIN) / (SERVO_US_MAX - SERVO_US_MIN) * 180));
  }

  /** Pantallas OLED: solo responden en el bus I²C si tienen alimentación, GND común y SDA/SCL en A4/A5 (lo único que Wire sabe usar en el UNO). */
  private buildDisplays() {
    const graph = this.solution.graph, uno = this.uno()!, unoGnd = netOfPin(graph, uno.instanceId, 'GND.1');
    const sda = netOfPin(graph, uno.instanceId, 'A4'), scl = netOfPin(graph, uno.instanceId, 'A5');
    for (const part of this.model.project.parts.filter(p => p.definitionId === 'oled-ssd1306')) {
      const st = this.solution.devices.get(part.instanceId), powered = st?.kind === 'oled-ssd1306' && st.powered;
      const sdaOk = !!sda && netOfPin(graph, part.instanceId, 'SDA') === sda, sclOk = !!scl && netOfPin(graph, part.instanceId, 'SCL') === scl, gndOk = netOfPin(graph, part.instanceId, 'GND') === unoGnd;
      const reason = !powered ? 'Sin 3–5,5 V entre VCC y GND.' : !gndOk ? 'El GND de la pantalla no está unido al de la placa.' : !sdaOk ? 'SDA debe ir al pin A4 del Arduino UNO.' : !sclOk ? 'SCL debe ir al pin A5 del Arduino UNO.' : undefined;
      const device = new Ssd1306(), address = Number(part.props?.address) === 61 ? 0x3d : 0x3c;
      if (!reason) this.runtime.attachI2c(address, device);
      this.displays.push({id: part.instanceId, device, address, powered, linked: !reason, reason});
    }
  }

  private buildServos() {
    const graph = this.solution.graph, uno = this.uno()!, unoGnd = netOfPin(graph, uno.instanceId, 'GND.1');
    for (const part of this.model.project.parts.filter(p => p.definitionId === 'servo-sg90')) {
      const st = this.solution.devices.get(part.instanceId), net = netOfPin(graph, part.instanceId, 'SIG');
      const pin = (graph.nets.get(net ?? '') ?? []).filter(r => r.instanceId === uno.instanceId && r.pinId in UNO_PINS).map(r => r.pinId)[0];
      const powered = st?.kind === 'servo-sg90' && st.powered, gndShared = netOfPin(graph, part.instanceId, 'GND') === unoGnd, linked = !!pin;
      const reason = !linked ? 'SIG no llega a un pin de la placa.' : !powered ? 'Sin 4–6,5 V entre VCC y GND.' : !gndShared ? 'El GND del servo no está unido al de la placa.' : undefined;
      this.servos.push({id: part.instanceId, pin, powered, gndShared, rise: null, state: {powered, linked, angle: SERVO_REST_DEG, target: null, pulseUs: null, pulses: 0, reason}});
    }
  }

  /** El eje se acerca al ángulo pedido a la velocidad del SG90; sin alimentación o sin masa común no se mueve. */
  private moveServos(stepUs: number) {
    const max = SERVO_DEG_PER_S * stepUs / 1e6;
    for (const s of this.servos) {
      const t = s.state.target;
      if (t === null || !s.powered || !s.gndShared) continue;
      s.state.angle += Math.max(-max, Math.min(max, t - s.state.angle));
    }
  }

  private buildSensors() {
    const {project} = this.model, graph = this.solution.graph, uno = this.uno()!;
    const unoGnd = netOfPin(graph, uno.instanceId, 'GND.1');
    const pinsOn = (net: string | undefined) => (graph.nets.get(net ?? '') ?? []).filter(r => r.instanceId === uno.instanceId && r.pinId in UNO_PINS).map(r => r.pinId);
    for (const part of project.parts.filter(p => p.definitionId === 'hc-sr04')) {
      const st = this.solution.devices.get(part.instanceId), trig = pinsOn(netOfPin(graph, part.instanceId, 'TRIG'))[0], echo = pinsOn(netOfPin(graph, part.instanceId, 'ECHO'))[0];
      const measured = this.physics?.distance(part.instanceId), d = measured !== undefined ? (measured ?? Infinity) : typeof part.props?.testDistance === 'number' ? part.props.testDistance : 0.3;
      const powered = st?.kind === 'hc-sr04' && st.powered, gndShared = netOfPin(graph, part.instanceId, 'GND') === unoGnd;
      const linked = !!trig && !!echo, reason = !linked ? 'TRIG o ECHO no llegan a un pin de la placa.' : !powered ? 'Sin 5 V entre VCC y GND.' : !gndShared ? 'El GND del sensor no está unido al de la placa.' : undefined;
      this.sensors.push({id: part.instanceId, trig, echo, distance: d, fromPhysics: measured !== undefined, powered, gndShared, t0: null, busyUntil: 0, state: {powered, linked, distance: d, echoes: 0, lastEchoUs: null, reason}});
      if (echo) this.echoPins.add(echo);
    }
  }

  /** TRIG ≥ 10 µs → el sensor «emite» y ECHO sube 2·d/343 s (el programa lo mide con pulseIn y el reloj virtual). */
  private trigger(s: Sensor, level: 0 | 1, at: number) {
    if (level === 1) { s.t0 = at; return; }
    if (s.t0 === null) return;
    const width = at - s.t0; s.t0 = null;
    if (width < 10 || !s.powered || !s.gndShared || !s.echo || at < s.busyUntil) return;
    if (s.fromPhysics) { const m = this.physics?.distance(s.id); s.distance = m ?? Infinity; s.state.distance = s.distance; } // mide ahora, con el robot donde está
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
    const sensorOutputs = new Map<string, number>(), graph = this.solution.graph;
    for (const part of this.model.project.parts.filter(p => p.definitionId === 'tcrt5000-module')) {
      const st = this.solution.devices.get(part.instanceId), reading = this.physics?.reflectance?.(part.instanceId);
      const black = reading ? reading.black : this.physics ? false : !!part.props?.testBlack;
      const powered = st?.kind === 'tcrt5000' && st.powered;
      const level: 0 | 1 = black !== !!part.props?.activeLow ? 1 : 0;
      const net = netOfPin(graph, part.instanceId, 'DO');
      const linked = (graph.nets.get(net ?? '') ?? []).some(r => r.instanceId === uno.instanceId && r.pinId in UNO_PINS);
      this.reflectance[part.instanceId] = {powered, linked, black, level, height: reading?.height ?? null, measured: !!reading};
      if (powered) sensorOutputs.set(part.instanceId, level * 5);
    }
    this.moveServos(step);
    this.dynamic = solveDynamic(this.model.project, drive, this.dynamic ?? undefined, this.solution, sensorOutputs, this.controls);
    if (this.physics) {
      const volts = new Map<string, number>(); for (const [id, m] of this.dynamic.motors) volts.set(id, m.volts);
      this.physics.setServos?.(new Map(this.servos.map(sv => [sv.id, sv.state.angle])));
      this.physics.step(volts, new Set([...this.dynamic.motors].filter(([, m]) => m.braking).map(([id]) => id)));
    }
    if (this.status !== 'running') return;
    for (const [id, s] of this.stats) {
      const volts = this.dynamic.pinVolts(uno.instanceId, {instanceId: uno.instanceId, pinId: id}) ?? 0;
      if (id[0] === 'A') this.runtime.setAnalog(id, Math.max(0, volts));
      if (s.mode === 'out' || this.echoPins.has(id)) continue; // el eco lo gobierna el sensor, con el instante exacto
      const high = this.highInputs.has(id) ? volts > 1.5 : volts > 3;  // histéresis 1,5 V / 3 V
      high ? this.highInputs.add(id) : this.highInputs.delete(id);
      this.runtime.setInput(id, high ? 1 : 0); s.level = high ? 1 : 0;
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
      sensors: Object.fromEntries(this.sensors.map(s => [s.id, {...s.state}])), serial, reflectance: {...this.reflectance}, servos: Object.fromEntries(this.servos.map(s => [s.id, {...s.state}])), displays: Object.fromEntries(this.displays.map(d => [d.id, {powered: d.powered, linked: d.linked, reason: d.reason, on: d.device.on, version: d.device.version, dataBytes: d.device.dataBytes, address: d.address, frame: d.device.frame()}])), physics: this.physics?.frame(), controls: Object.fromEntries(this.controls),
    };
  }
}
