import type {AnchorDefinition, ComponentDefinition, PinDefinition} from './types.ts';
import type {Vec3} from '../project/types.ts';

const mm = (v: number) => v / 1000;
const pin = (id: string, label: string, position: Vec3, role: PinDefinition['role'], extra: Partial<PinDefinition> = {}): PinDefinition => ({id, label, position, role, ...extra});
const anchor = (id: string, label: string, position: Vec3, normal: Vec3, tag: string, accepts: string[] = []): AnchorDefinition => ({id, label, position, normal, tag, accepts});
const UP: Vec3 = [0, 1, 0], DOWN: Vec3 = [0, -1, 0];

// ───── Arduino UNO R3: 68,6 × 53,4 mm (ficha oficial). Cabecera digital en el borde +X, cabecera de potencia/analógica en el borde −X.
const PWM_PINS = new Set([3, 5, 6, 9, 10, 11]);
const unoPins: PinDefinition[] = [];
const pitch = mm(2.54), hx = mm(23.5);
// D0–D7 y D8–D13 + GND + AREF (la cabecera real tiene un hueco entre D7 y D8)
const digitalZ = (i: number) => mm(31.5) - i * pitch - (i >= 8 ? mm(4) : 0);
for (let n = 0; n <= 13; n++) unoPins.push(pin(`D${n}`, `D${n}`, [hx, mm(7.5), digitalZ(n)], PWM_PINS.has(n) ? 'pwm' : 'digital', {electrical: {vMax: 5, iMax: 0.02}}));
unoPins.push(pin('GND.3', 'GND', [hx, mm(7.5), digitalZ(14)], 'ground', {internalNet: 'GND'}));
['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].forEach((id, i) => unoPins.push(pin(id, id, [-hx, mm(7.5), mm(10) - i * pitch], 'analog', {electrical: {vMax: 5}})));
unoPins.push(pin('VIN', 'VIN', [-hx, mm(7.5), mm(10) + 1 * pitch], 'power-in', {electrical: {vMax: 12}}));
unoPins.push(pin('GND.1', 'GND', [-hx, mm(7.5), mm(10) + 2 * pitch], 'ground', {internalNet: 'GND'}));
unoPins.push(pin('GND.2', 'GND', [-hx, mm(7.5), mm(10) + 3 * pitch], 'ground', {internalNet: 'GND'}));
unoPins.push(pin('5V', '5V', [-hx, mm(7.5), mm(10) + 4 * pitch], 'power-out', {electrical: {vMax: 5, iMax: 0.5}}));
unoPins.push(pin('3V3', '3,3V', [-hx, mm(7.5), mm(10) + 5 * pitch], 'power-out', {electrical: {vMax: 3.3, iMax: 0.15}}));

const arduino: ComponentDefinition = {
  id: 'arduino-uno-r3', name: 'Arduino UNO R3', category: 'control', dimensions: [mm(53.4), mm(15), mm(68.6)], dimensionsSource: 'datasheet', massKg: 0.025,
  pins: unoPins, anchors: [anchor('base', 'Base', [0, -mm(7.5), 0], DOWN, 'board-mount')],
  props: [{id: 'usb', label: 'Alimentada por USB (virtual, 5 V)', type: 'boolean', default: false}],
  scalable: false, model: 'procedural',
  summary: 'Placa de control con el microcontrolador ATmega328P.', keywords: ['arduino', 'uno', 'placa', 'microcontrolador', 'atmega'],
};

// ───── Módulo L298N (puente H doble). 43 × 43 × 27 mm es la medida habitual del módulo rojo: aproximada, a confirmar con el kit.
const l298n: ComponentDefinition = {
  id: 'l298n-module', name: 'Driver L298N', category: 'driver', dimensions: [mm(43), mm(27), mm(43)], dimensionsSource: 'approximate', massKg: 0.03,
  pins: [
    pin('OUT1', 'OUT1', [-mm(21.5), mm(8), mm(8)], 'motor'), pin('OUT2', 'OUT2', [-mm(21.5), mm(8), mm(2)], 'motor'),
    pin('OUT3', 'OUT3', [mm(21.5), mm(8), mm(8)], 'motor'), pin('OUT4', 'OUT4', [mm(21.5), mm(8), mm(2)], 'motor'),
    pin('+12V', '+12V', [-mm(5), mm(8), -mm(21.5)], 'power-in', {electrical: {vMax: 35, iMax: 2}}), pin('GND', 'GND', [0, mm(8), -mm(21.5)], 'ground'),
    pin('+5V', '+5V', [mm(5), mm(8), -mm(21.5)], 'power-out', {electrical: {vMax: 5, iMax: 0.5}}),
    pin('ENA', 'ENA', [-mm(10), mm(8), mm(21.5)], 'pwm'), pin('IN1', 'IN1', [-mm(6), mm(8), mm(21.5)], 'digital'), pin('IN2', 'IN2', [-mm(2), mm(8), mm(21.5)], 'digital'),
    pin('IN3', 'IN3', [mm(2), mm(8), mm(21.5)], 'digital'), pin('IN4', 'IN4', [mm(6), mm(8), mm(21.5)], 'digital'), pin('ENB', 'ENB', [mm(10), mm(8), mm(21.5)], 'pwm'),
  ],
  anchors: [anchor('base', 'Base', [0, -mm(13.5), 0], DOWN, 'driver-mount')],
  props: [
    {id: 'jumperENA', label: 'Puente ENA (canal A siempre activo)', type: 'boolean', default: true},
    {id: 'jumperENB', label: 'Puente ENB (canal B siempre activo)', type: 'boolean', default: true},
    {id: 'jumper5V', label: 'Puente regulador 5 V', type: 'boolean', default: true},
  ],
  scalable: false, model: 'procedural', summary: 'Puente H para dos motores DC; los puentes de ENA/ENB y 5 V son ajustables.', keywords: ['l298n', 'driver', 'puente h', 'motor', 'controlador'],
};

// ───── Sensor ultrasónico HC-SR04: 45 × 20 × 15 mm (ficha).
const hcsr04: ComponentDefinition = {
  id: 'hc-sr04', name: 'Sensor HC-SR04', category: 'sensor', dimensions: [mm(45), mm(20), mm(15)], dimensionsSource: 'datasheet', massKg: 0.009,
  pins: [pin('VCC', 'VCC', [-mm(3.8), -mm(7), -mm(7.5)], 'power-in', {electrical: {vMax: 5.5}}), pin('TRIG', 'TRIG', [-mm(1.3), -mm(7), -mm(7.5)], 'digital'), pin('ECHO', 'ECHO', [mm(1.3), -mm(7), -mm(7.5)], 'digital'), pin('GND', 'GND', [mm(3.8), -mm(7), -mm(7.5)], 'ground')],
  anchors: [anchor('base', 'Base', [0, -mm(10), 0], DOWN, 'sensor-mount')],
  // Banco de pruebas controlado (etapa 4): la física con obstáculos llega en la etapa 5.
  props: [{id: 'testDistance', label: 'Distancia de prueba (m) — banco controlado', type: 'number', min: 0.02, max: 4, default: 0.3}],
  scalable: false, model: 'procedural', summary: 'Mide distancia con ultrasonido (2–400 cm).', keywords: ['hc-sr04', 'ultrasonico', 'ultrasonido', 'distancia', 'sensor', 'trig', 'echo'],
};

// ───── Motor DC con reductora tipo TT: ≈ 70 × 22 × 18 mm, eje doble (aproximado).
const motor: ComponentDefinition = {
  id: 'dc-motor-tt', name: 'Motor DC TT', category: 'actuator', dimensions: [mm(70), mm(22), mm(18)], dimensionsSource: 'approximate', massKg: 0.03,
  pins: [pin('M+', 'M+', [-mm(30), mm(4), -mm(9)], 'motor'), pin('M-', 'M−', [-mm(30), -mm(4), -mm(9)], 'motor')],
  anchors: [
    anchor('base', 'Base', [0, mm(11), 0], UP, 'motor-mount'),
    anchor('axle-r', 'Eje derecho', [mm(42), 0, 0], [1, 0, 0], 'axle', ['wheel-hub']),
    anchor('axle-l', 'Eje izquierdo', [-mm(42), 0, 0], [-1, 0, 0], 'axle', ['wheel-hub']),
  ],
  scalable: false, model: 'procedural', summary: 'Motor con reductora y doble eje para las ruedas.', keywords: ['motor', 'dc', 'tt', 'reductora', 'eje'],
};

const wheel: ComponentDefinition = {
  id: 'wheel-65', name: 'Rueda 65 mm', category: 'structure', dimensions: [mm(26), mm(65), mm(65)], dimensionsSource: 'approximate', massKg: 0.03,
  pins: [], anchors: [anchor('hub', 'Cubo', [0, 0, 0], [1, 0, 0], 'wheel-hub')],
  scalable: false, model: 'procedural', summary: 'Rueda de goma de 65 mm para el eje del motor.', keywords: ['rueda', 'llanta', 'goma'],
};

const caster: ComponentDefinition = {
  id: 'caster-ball', name: 'Rueda loca', category: 'structure', dimensions: [mm(25), mm(25), mm(25)], dimensionsSource: 'approximate', massKg: 0.01,
  pins: [], anchors: [anchor('base', 'Base', [0, mm(12.5), 0], UP, 'caster-mount')],
  scalable: false, model: 'procedural', summary: 'Esfera de apoyo libre, sin motor.', keywords: ['rueda loca', 'caster', 'bola', 'apoyo'],
};

// ───── Chasis acrílico 2WD (aprox. 140 × 210 mm, 4 mm).
const chassis: ComponentDefinition = {
  id: 'chassis-2wd', name: 'Chasis 2WD', category: 'structure', dimensions: [mm(140), mm(4), mm(210)], dimensionsSource: 'approximate', massKg: 0.12,
  pins: [],
  anchors: [
    anchor('motor-l', 'Motor izquierdo', [-mm(62), -mm(2), -mm(20)], DOWN, 'slot-motor', ['motor-mount']), anchor('motor-r', 'Motor derecho', [mm(62), -mm(2), -mm(20)], DOWN, 'slot-motor', ['motor-mount']),
    anchor('caster', 'Rueda loca', [0, -mm(2), -mm(85)], DOWN, 'slot-caster', ['caster-mount']),
    anchor('board', 'Placa', [0, mm(2), mm(40)], UP, 'slot-board', ['board-mount']), anchor('driver', 'Driver', [0, mm(2), -mm(45)], UP, 'slot-driver', ['driver-mount']),
    anchor('battery', 'Portapilas', [0, -mm(2), mm(30)], DOWN, 'slot-battery', ['battery-mount']), anchor('front', 'Soporte frontal', [0, mm(2), mm(100)], UP, 'slot-front', ['bracket-mount']),
  ],
  scalable: false, model: 'procedural', summary: 'Base de acrílico con anclajes para motores, placa, driver, portapilas y soporte.', keywords: ['chasis', 'base', 'acrilico', '2wd', 'robot'],
};

// El portapilas es solo una pieza mecánica (volumen, masa, anclaje): sus pines eléctricos esperan la decisión D-11.
const battery: ComponentDefinition = {
  id: 'battery-holder-4aa', name: 'Portapilas 4×AA', category: 'power', dimensions: [mm(63), mm(16), mm(58)], dimensionsSource: 'approximate', massKg: 0.08,
  // D-11 (resuelta con un supuesto): el voltaje es una propiedad editable. 4 pilas AA alcalinas ≈ 6 V; se corrige con el kit real.
  pins: [pin('B+', 'Positivo (+)', [mm(-26), mm(8.5), mm(-27)], 'power-out', {electrical: {vMax: 24, iMax: 2}}), pin('B-', 'Negativo (−)', [mm(26), mm(8.5), mm(-27)], 'ground')],
  props: [{id: 'voltage', label: 'Voltaje (V) — supuesto de 4×AA; verifícalo con el kit', type: 'number', min: 1.5, max: 24, default: 6}],
  anchors: [anchor('base', 'Base', [0, mm(8), 0], UP, 'battery-mount')],
  scalable: false, model: 'procedural', summary: 'Portapilas con terminales + y −. Voltaje editable (por defecto 6 V, 4×AA: supuesto a verificar con el kit).', keywords: ['portapilas', 'bateria', 'pilas', 'aa', 'alimentacion', 'voltaje'],
};

const sensorBracket: ComponentDefinition = {
  id: 'sensor-bracket', name: 'Soporte del sensor', category: 'structure', dimensions: [mm(50), mm(30), mm(12)], dimensionsSource: 'approximate', massKg: 0.01,
  pins: [], anchors: [anchor('base', 'Base', [0, -mm(15), 0], DOWN, 'bracket-mount'), anchor('sensor', 'Sensor', [0, 0, mm(6)], [0, 0, 1], 'slot-sensor', ['sensor-mount'])],
  scalable: false, model: 'procedural', summary: 'Escuadra para fijar el HC-SR04 al frente del chasis.', keywords: ['soporte', 'escuadra', 'sensor', 'bracket'],
};

const genericBracket: ComponentDefinition = {
  id: 'bracket-generic', name: 'Soporte genérico', category: 'structure', dimensions: [mm(40), mm(20), mm(20)], dimensionsSource: 'approximate', massKg: 0.008,
  pins: [], anchors: [anchor('base', 'Base', [0, -mm(10), 0], DOWN, 'bracket-mount'), anchor('top', 'Superior', [0, mm(10), 0], UP, 'slot-generic', ['board-mount', 'driver-mount', 'battery-mount', 'sensor-mount'])],
  scalable: false, model: 'procedural', summary: 'Bloque para elevar o fijar cualquier placa o módulo.', keywords: ['soporte', 'separador', 'bloque', 'generico'],
};

// ───── Piezas sueltas para probar el programa (etapa 4): se cablean, no se unen mecánicamente.
const led: ComponentDefinition = {
  id: 'led-5mm', name: 'LED 5 mm', category: 'actuator', dimensions: [mm(5.8), mm(9), mm(5.8)], dimensionsSource: 'approximate', massKg: 0.0005,
  pins: [pin('A', 'Ánodo (+)', [-mm(1.27), -mm(4.5), 0], 'signal'), pin('K', 'Cátodo (−)', [mm(1.27), -mm(4.5), 0], 'signal')],
  props: [{id: 'color', label: 'Color', type: 'enum', options: ['rojo', 'verde', 'amarillo', 'azul'], default: 'rojo'}],
  anchors: [], scalable: false, model: 'procedural', summary: 'Diodo emisor de luz. Sin resistencia en serie se puede quemar.', keywords: ['led', 'diodo', 'luz', 'indicador'],
};
const resistor: ComponentDefinition = {
  id: 'resistor', name: 'Resistencia', category: 'passive', dimensions: [mm(6.3), mm(2.4), mm(2.4)], dimensionsSource: 'approximate', massKg: 0.0002,
  pins: [pin('P1', 'Pata 1', [-mm(4.5), 0, 0], 'signal'), pin('P2', 'Pata 2', [mm(4.5), 0, 0], 'signal')],
  props: [{id: 'ohms', label: 'Resistencia (Ω)', type: 'number', min: 1, max: 1000000, default: 220}],
  anchors: [], scalable: false, model: 'procedural', summary: 'Resistencia de 1/4 W; por defecto 220 Ω, la de un LED con 5 V.', keywords: ['resistencia', 'resistor', 'ohm', 'pasivo'],
};

export const CATALOG: readonly ComponentDefinition[] = [chassis, motor, wheel, caster, arduino, l298n, hcsr04, battery, sensorBracket, genericBracket, led, resistor];
const byId = new Map(CATALOG.map(d => [d.id, d]));
export const getDefinition = (id: string): ComponentDefinition | undefined => byId.get(id);
export const definitionIds: ReadonlySet<string> = new Set(CATALOG.map(d => d.id));
export const CATEGORY_LABELS: Record<ComponentDefinition['category'], string> = {control: 'Control', driver: 'Drivers', sensor: 'Sensores', actuator: 'Actuadores', power: 'Energía', structure: 'Estructura', passive: 'Pasivos'};

/** Forma mínima del catálogo para el validador: qué pines y anclajes tiene cada definición. */
export const catalogShape: ReadonlyMap<string, {pins: ReadonlySet<string>; anchors: ReadonlySet<string>}> = new Map(CATALOG.map(d => [d.id, {pins: new Set(d.pins.map(p => p.id)), anchors: new Set(d.anchors.map(a => a.id))}]));

/** Filtra el catálogo por texto (nombre, resumen y palabras clave, sin tildes) y categoría. */
export function searchCatalog(query: string, category: ComponentDefinition['category'] | 'all' = 'all'): ComponentDefinition[] {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const words = norm(query).split(/\s+/).filter(Boolean);
  return CATALOG.filter(d => (category === 'all' || d.category === category) && words.every(w => norm([d.name, d.summary, ...d.keywords].join(' ')).includes(w)));
}
