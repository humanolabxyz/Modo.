// Ejecuta las comprobaciones de un paso de programación en el simulador (el mismo coordinador, circuito y emulador AVR de la simulación), sin interfaz.
// El resultado sale del robot REAL del estudiante: si le falta un cable o la batería, la comprobación lo dice en vez de pasar.
import {setPartProp, setFirmwareArtifact, setFirmwareSource} from '../project/commands.ts';
import type {PartInstance, RobotProject} from '../project/types.ts';
import {Coordinator, STEP_US, type Snapshot} from '../sim/coordinator.ts';
import {hashSource} from '../mcu/compiler/state.ts';
import {PROGRAM_HEX} from './programHex.generated.ts';
import {PROGRAM_GUIDES} from './programGuides.ts';
import type {CheckLine, CheckReport, CheckScenario, Expectation, ProgramGuideDef, ProgramStep} from './programTypes.ts';

/** Mismo programa aunque cambien los saltos de línea (CRLF), los espacios al final de cada línea o las líneas vacías sobrantes: es lo que se pierde o se agrega al copiar y pegar. */
const normalize = (t: string) => t.replace(/\r\n?/g, '\n').split('\n').map(l => l.trimEnd()).join('\n').trim();
let byNormalized: Map<string, string> | undefined;
/** Hex ya compilado de un código que coincide con un paso de las guías, para que pegarlo en Programación no pida recompilar ni dependa del servicio de compilación. */
export function precompiledHex(text: string): string | undefined {
  const exact = PROGRAM_HEX[hashSource(text)];
  if (exact) return exact;
  if (!byNormalized) { byNormalized = new Map(); for (const g of PROGRAM_GUIDES) for (const s of g.steps) { const hex = stepHex(s); if (hex) byNormalized.set(normalize(s.source), hex); } }
  return byNormalized.get(normalize(text));
}
export const stepHex = (step: ProgramStep): string | undefined => PROGRAM_HEX[hashSource(step.source)];
const nth = (project: RobotProject, def: string, n = 0): PartInstance | undefined => project.parts.filter(p => p.definitionId === def)[n];
const v = (x: number) => `${x.toFixed(1).replace('.', ',')} V`;

function evaluate(project: RobotProject, snap: Snapshot, e: Expectation): CheckLine {
  const motors = project.parts.filter(p => p.definitionId === 'dc-motor-tt').map(m => snap.motors[m.instanceId]?.volts);
  const motor = (i: number) => motors[i];
  switch (e.kind) {
    case 'pin-mode': {
      const mode = snap.pins[e.pin]?.mode ?? 'in', ok = mode === e.mode;
      return {ok, text: `${e.pin} ${e.mode === 'out' ? 'es salida (OUTPUT)' : 'es entrada (INPUT)'}${ok ? '' : `; ahora es ${mode === 'out' ? 'salida' : 'entrada'}: revisa pinMode(${e.pin.slice(1)}, ${e.mode === 'out' ? 'OUTPUT' : 'INPUT'})`}`};
    }
    case 'pin-level': {
      const p = snap.pins[e.pin], level = p?.mode === 'out' ? p.level : undefined, ok = level !== undefined && (e.level === 'high' ? level > 0.9 : level < 0.1);
      return {ok, text: `${e.pin} está en ${e.level === 'high' ? 'ALTO' : 'BAJO'}${ok ? '' : level === undefined ? ': el pin no está configurado como salida' : `: está en ${level > 0.9 ? 'ALTO' : level < 0.1 ? 'BAJO' : 'PWM'}`}`};
    }
    case 'motor': {
      const volts = motor(e.motor);
      if (volts === undefined) return {ok: false, text: `Motor ${e.motor + 1}: el robot no tiene ese motor conectado`};
      const ok = (e.above === undefined || volts > e.above) && (e.below === undefined || volts < e.below);
      const want = e.above !== undefined ? `más de ${v(e.above)} (adelante)` : `menos de ${v(e.below!)} (atrás)`;
      return {ok, text: `Motor ${e.motor + 1} recibe ${want}${ok ? '' : `: recibe ${v(volts)}`}`};
    }
    case 'motor-less-than': {
      const a = motor(e.motor), b = motor(e.other);
      if (a === undefined || b === undefined) return {ok: false, text: 'Faltan motores conectados'};
      const ok = a < b - e.margin;
      return {ok, text: `El motor ${e.motor + 1} va más lento que el motor ${e.other + 1}${ok ? '' : ` (${v(a)} contra ${v(b)})`}`};
    }
    case 'motor-close': {
      const a = motor(e.motor), b = motor(e.other);
      if (a === undefined || b === undefined) return {ok: false, text: 'Faltan motores conectados'};
      const ok = Math.abs(a - b) <= e.tolerance;
      return {ok, text: `Los motores ${e.motor + 1} y ${e.other + 1} van igual${ok ? '' : ` (${v(a)} contra ${v(b)})`}`};
    }
    case 'serial': {
      const ok = new RegExp(e.match).test(snap.serial);
      return {ok, text: ok ? `El Monitor serie muestra lo esperado` : `${e.hint}${snap.serial.trim() ? ` (se lee «${snap.serial.trim().split(/\r?\n/).at(-1)!.slice(0, 40)}»)` : ' (el Monitor serie está vacío: falta Serial.begin(9600) o Serial.print)'}`};
    }
    case 'servo-angle': {
      const sv = project.parts.filter(x => x.definitionId === 'servo-sg90')[e.servo], st = sv && snap.servos[sv.instanceId];
      if (!st) return {ok: false, text: `El robot no tiene el servo ${e.servo + 1}`};
      if (st.reason) return {ok: false, text: `Servo ${e.servo + 1}: ${st.reason}`};
      const ok = Math.abs(st.angle - e.angle) <= e.tolerance;
      return {ok, text: `El servo ${e.servo + 1} está en ${e.angle}°${ok ? '' : `: está en ${st.angle.toFixed(0)}°${st.target === null ? ' (el programa aún no le manda pulsos: falta attach y write)' : ''}`}`};
    }
    case 'display-lit': {
      const oled = project.parts.find(x => x.definitionId === 'oled-ssd1306'), d = oled && snap.displays[oled.instanceId];
      if (!d) return {ok: false, text: 'El robot no tiene pantalla OLED'};
      if (d.reason) return {ok: false, text: `Pantalla: ${d.reason}`};
      let lit = 0; if (d.on) for (const b of d.frame) for (let k = 0; k < 8; k++) lit += (b >> k) & 1;
      const ok = lit >= e.min && lit <= e.max;
      return {ok, text: ok ? `La pantalla muestra una imagen (${lit} píxeles encendidos)` : `${e.hint} (hay ${lit} píxeles encendidos${d.on ? '' : '; la pantalla está apagada: falta pantalla.begin(...)'})`};
    }
    case 'sensor-echoes': {
      const sensor = nth(project, 'hc-sr04'), echoes = sensor ? snap.sensors[sensor.instanceId]?.echoes ?? 0 : 0, ok = echoes >= e.min;
      return {ok, text: `El HC-SR04 respondió al menos ${e.min} veces${ok ? '' : `: respondió ${echoes}; revisa los cables TRIG y ECHO`}`};
    }
  }
}

/** Ejecuta un escenario con el programa `hex` en el robot `project` y evalúa lo esperado. */
export function runScenario(project: RobotProject, hex: string, scenario: CheckScenario): CheckReport {
  const uno = nth(project, 'arduino-uno-r3');
  if (!uno) return {ok: false, scenario: scenario.label, lines: [], message: 'El robot no tiene una placa Arduino UNO.'};
  let p = project;
  for (const s of scenario.set ?? []) { const part = nth(p, s.def, s.n); if (part) p = setPartProp(p, part.instanceId, s.prop, s.value); }
  const c = new Coordinator({project: p, targetId: uno.instanceId, hex});
  const first = c.snapshot();
  if (first.status === 'error') return {ok: false, scenario: scenario.label, lines: [], message: first.message ?? 'El programa no se pudo cargar.'};
  if (first.status === 'unpowered') return {ok: false, scenario: scenario.label, lines: [], message: 'La placa Arduino no tiene alimentación: termina el cableado (guía «Cableado») y vuelve a probar.'};
  for (let t = 0; t < scenario.ms; t += STEP_US / 1000) c.advance(STEP_US);
  const snap = c.snapshot(), serial = first.serial + snap.serial;
  const lines = scenario.expect.map(e => evaluate(p, {...snap, serial}, e));
  return {ok: lines.every(l => l.ok), scenario: scenario.label, lines};
}

/** Todas las comprobaciones de un paso. */
export function runStepChecks(project: RobotProject, step: ProgramStep, hex: string): {ok: boolean; reports: CheckReport[]} {
  const reports = step.checks.map(s => runScenario(project, hex, s));
  return {ok: reports.every(r => r.ok), reports};
}

/** Pone el código del paso (y su .hex precompilado) como programa de la placa. */
export function applyProgramStep(project: RobotProject, step: ProgramStep): RobotProject | {error: string} {
  const uno = nth(project, 'arduino-uno-r3'), hex = stepHex(step);
  if (!uno) return {error: 'El robot no tiene una placa Arduino UNO.'};
  if (!hex) return {error: 'Este paso no tiene programa compilado: regenera los programas de la guía.'};
  return setFirmwareArtifact(setFirmwareSource(project, uno.instanceId, step.source), uno.instanceId, {hex, origin: 'remote-compiler', sourceHash: hashSource(step.source), compiledAt: new Date().toISOString()});
}

/** Índice del paso cuyo código es exactamente el que hay en el editor (o -1). */
export function reachedStep(project: RobotProject, guide: ProgramGuideDef): number {
  const uno = nth(project, 'arduino-uno-r3'), fw = uno && project.firmware.find(f => f.targetInstanceId === uno.instanceId);
  if (!fw) return -1;
  const h = hashSource(fw.source);
  return guide.steps.findIndex(s => hashSource(s.source) === h);
}

/** Hex a usar para comprobar: el del programa del estudiante si está al día; si no, el del paso cuando el editor tiene justo su código. */
export function hexForCheck(project: RobotProject, step: ProgramStep): {hex: string} | {reason: string} {
  const uno = nth(project, 'arduino-uno-r3'), fw = uno && project.firmware.find(f => f.targetInstanceId === uno.instanceId);
  if (!fw) return {reason: 'Todavía no hay programa. Pulsa «Poner este código en mi programa».'};
  if (fw.artifact && (fw.artifact.origin === 'hex-import' || fw.artifact.sourceHash === hashSource(fw.source))) return {hex: fw.artifact.hex};
  return {reason: 'El código cambió desde que se compiló. Compílalo en la ventana Programación o vuelve a poner el código del paso.'};
}
