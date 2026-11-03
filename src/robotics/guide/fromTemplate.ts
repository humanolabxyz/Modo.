// Genera una guía de cableado paso a paso a partir del cableado de CUALQUIER proyecto de referencia (una plantilla). Así todos los robots tienen guía
// sin escribirla a mano: cada cable de la plantilla es un paso, agrupado por función y explicado con lo que hace cada pin.
import {getDefinition} from '../catalog/index.ts';
import type {PartInstance, RobotProject} from '../project/types.ts';
import type {GuideStep, PartRef, PropStep, WireStep, WiringGuideDef} from './types.ts';

const SHORT: Record<string, string> = {
  'arduino-uno-r3': 'Arduino', 'l298n-module': 'driver', 'battery-holder-4aa': 'batería', 'dc-motor-tt': 'motor', 'hc-sr04': 'HC-SR04', 'tcrt5000-module': 'sensor de línea',
  'breadboard-400': 'protoboard', 'regulator-5v': 'regulador 5 V', 'power-switch': 'interruptor', 'servo-sg90': 'servo', 'led-5mm': 'LED', resistor: 'resistencia',
  'push-button-6mm': 'pulsador', 'potentiometer-10k': 'potenciómetro', 'oled-ssd1306': 'pantalla OLED',
};
const COLOR_NAMES: Record<string, string> = {'#d64545': 'rojo', '#222222': 'negro', '#2a67a3': 'azul', '#e0a52a': 'amarillo', '#2a8f4f': 'verde', '#aab3b9': 'metálico', '#e8e8e8': 'blanco'};

export const G_AJUSTES = 'Ajustes antes de cablear', G_POTENCIA = 'Alimentación', G_MOTORES = 'Motores', G_CONTROL = 'Control del puente H', G_SENSORES = 'Sensores y accesorios', G_BRAZOS = 'Brazos y pinzas';
const GROUP_ORDER = [G_AJUSTES, G_POTENCIA, G_MOTORES, G_CONTROL, G_SENSORES, G_BRAZOS];

/** Qué hace cada pin, en una frase. Las claves son `definición:pin`; las que no estén caen en una explicación por función. */
const PIN_NOTES: Record<string, string> = {
  'battery-holder-4aa:B+': 'El polo positivo de la batería: de aquí sale la energía de todo el robot.',
  'battery-holder-4aa:B-': 'El polo negativo: por aquí vuelve toda la corriente.',
  'power-switch:IN': 'El interruptor general corta o deja pasar la energía del robot.',
  'power-switch:OUT': 'La salida del interruptor alimenta lo que viene después; apagado, nada recibe energía.',
  'regulator-5v:VIN': 'El regulador recibe la tensión de la batería y la baja a 5 V estables para la lógica.',
  'regulator-5v:GND': 'Entrada de masa del regulador.',
  'regulator-5v:5V': 'Salida regulada de 5 V: alimenta la placa, los sensores y la protoboard.',
  'regulator-5v:GND.OUT': 'Masa de la salida de 5 V.',
  'l298n-module:+12V': 'Entrada de potencia del driver: de aquí toman la energía los motores.',
  'l298n-module:GND': 'Masa del driver: cierra el circuito de los motores y debe unirse con la masa de la placa.',
  'l298n-module:+5V': 'Alimentación de 5 V de la lógica del driver.',
  'l298n-module:ENA': 'ENA habilita el canal A del puente H; con PWM (analogWrite) fija la velocidad del motor.',
  'l298n-module:ENB': 'ENB habilita el canal B del puente H; con PWM fija la velocidad del segundo motor.',
  'l298n-module:IN1': 'IN1 e IN2 deciden el sentido del canal A: uno en ALTO y el otro en BAJO = adelante; al revés = atrás.',
  'l298n-module:IN2': 'Pareja de IN1: juntos fijan el sentido del canal A.',
  'l298n-module:IN3': 'IN3 e IN4 deciden el sentido del canal B.',
  'l298n-module:IN4': 'Pareja de IN3: juntos fijan el sentido del canal B.',
  'l298n-module:OUT1': 'Salida del puente H hacia el motor. Si luego gira al revés, invierte los dos cables del motor.',
  'l298n-module:OUT2': 'Segunda salida del canal A del puente H.',
  'l298n-module:OUT3': 'Salida del canal B del puente H hacia el segundo motor.',
  'l298n-module:OUT4': 'Segunda salida del canal B del puente H.',
  'dc-motor-tt:M+': 'Terminal del motor: el sentido de giro depende de qué terminal quede más positivo.',
  'dc-motor-tt:M-': 'Segundo terminal del motor.',
  'arduino-uno-r3:VIN': 'Entrada de energía de la placa (7 a 12 V): la placa la regula a 5 V para ella misma.',
  'arduino-uno-r3:5V': 'Salida de 5 V de la placa: alimenta sensores y módulos pequeños.',
  'hc-sr04:VCC': 'El sensor necesita 5 V para emitir el ultrasonido.',
  'hc-sr04:GND': 'Masa común del sensor con la placa.',
  'hc-sr04:TRIG': 'TRIG es la orden de medir: el programa lo pone en ALTO 10 µs para lanzar el pulso.',
  'hc-sr04:ECHO': 'ECHO sube mientras el sonido viaja y vuelve: el programa mide ese tiempo con pulseIn para calcular la distancia.',
  'tcrt5000-module:VCC': 'El sensor de línea necesita 5 V para encender su LED infrarrojo.',
  'tcrt5000-module:GND': 'Masa común del sensor de línea.',
  'tcrt5000-module:DO': 'DO es la salida digital: cambia de nivel según el suelo sea claro u oscuro.',
  'servo-sg90:SIG': 'La señal del servo: pulsos cada 20 ms cuyo ancho fija el ángulo (biblioteca Servo).',
  'servo-sg90:VCC': 'Alimentación del servo (4 a 6,5 V).',
  'servo-sg90:GND': 'Masa del servo; debe unirse con la de la placa.',
  'oled-ssd1306:VCC': 'La pantalla se alimenta con 3,3 o 5 V; el módulo trae su propio regulador.',
  'oled-ssd1306:GND': 'Masa común de la pantalla con la placa.',
  'oled-ssd1306:SDA': 'SDA es la línea de datos del bus I²C. En el Arduino UNO el I²C está fijo en el pin A4.',
  'oled-ssd1306:SCL': 'SCL es el reloj del bus I²C. En el Arduino UNO el I²C está fijo en el pin A5.',
  'potentiometer-10k:VCC': 'Un extremo del potenciómetro a 5 V.',
  'potentiometer-10k:OUT': 'El cursor entrega una tensión entre 0 y 5 V según su posición: se lee con analogRead.',
  'potentiometer-10k:GND': 'El otro extremo del potenciómetro a masa.',
  'push-button-6mm:P1': 'Terminal del pulsador; al pulsar se une con el otro.',
  'push-button-6mm:P2': 'Segundo terminal del pulsador.',
  'led-5mm:A': 'El ánodo (+) del LED va hacia la salida del programa, a través de su resistencia.',
  'led-5mm:K': 'El cátodo (−) del LED va a masa.',
  'resistor:P1': 'La resistencia limita la corriente del LED para que no se queme.',
  'resistor:P2': 'Segundo extremo de la resistencia.',
};

const pinLabel = (def: string, pin: string): string => {
  if (def === 'breadboard-400') {
    const rail = /^([LR])([+-])(\d+)$/.exec(pin);
    if (rail) return `riel ${rail[2] === '+' ? '+' : '−'} ${rail[1] === 'L' ? 'izq.' : 'der.'} ${rail[3]}`;
    return `orificio ${pin}`;
  }
  return pin.replace(/\.\d+$/, '').replace('GND.OUT', 'GND salida');
};
const noteOf = (def: string, pin: string): string | undefined => {
  if (def === 'breadboard-400') return /^[LR][+-]/.test(pin)
    ? 'Los rieles de la protoboard reparten la alimentación: un cable al riel llega a todos los orificios de esa línea.'
    : 'En la protoboard los 5 orificios de cada fila (A–E y F–J) están unidos: el cable llega a la misma fila que el pin del módulo.';
  if (def === 'arduino-uno-r3' && /^D\d+$/.test(pin)) return `Pin digital ${pin} de la placa: tu programa lo usará con pinMode y digitalWrite/digitalRead (o analogWrite si tiene PWM).`;
  if (def === 'arduino-uno-r3' && /^GND/.test(pin)) return 'Cualquier GND de la placa es la misma masa: sin masa común las señales no tienen referencia.';
  if (def === 'arduino-uno-r3' && /^A\d$/.test(pin)) return `Entrada analógica ${pin}: se lee con analogRead (0–1023).`;
  return PIN_NOTES[`${def}:${pin}`];
};

type Pin = {def: string; pin: string};
/** Servo de un brazo o de una pinza (el proyecto le puso un nombre propio: «Servo codo izquierdo», «Servo pinza derecho»…). */
const isArmServo = (part: PartInstance) => part.definitionId === 'servo-sg90' && /hombro|codo|pinza/i.test(part.label);
const groupOf = (a: Pin, b: Pin, parts: PartInstance[] = []): string => {
  const defs = [a.def, b.def], pins = [a.pin, b.pin];
  if (parts.some(isArmServo)) return G_BRAZOS;
  if (defs.includes('dc-motor-tt')) return G_MOTORES;
  if (defs.includes('l298n-module') && pins.some(p => /^(IN[1-4]|EN[AB])$/.test(p))) return G_CONTROL;
  if (defs.some(d => ['hc-sr04', 'tcrt5000-module', 'servo-sg90', 'led-5mm', 'resistor', 'push-button-6mm', 'potentiometer-10k', 'oled-ssd1306'].includes(d))) return G_SENSORES;
  if (defs.includes('breadboard-400') && defs.includes('arduino-uno-r3') && pins.some(p => /^[DA]\d+$/.test(p))) return G_SENSORES;
  return G_POTENCIA;
};

/** Guía de cableado de un proyecto de referencia. Devuelve null si no tiene cables (por ejemplo, los brazos). */
export function guideFromProject(id: string, name: string, reference: RobotProject): WiringGuideDef | null {
  if (!reference.connections.length) return null;
  const byDef = new Map<string, PartInstance[]>();
  for (const part of reference.parts) byDef.set(part.definitionId, [...(byDef.get(part.definitionId) ?? []), part]);
  const partRef = (part: PartInstance): PartRef => ({def: part.definitionId, n: byDef.get(part.definitionId)!.indexOf(part), ref: part.instanceId});
  const nameOf = (part: PartInstance): string => {
    const base = SHORT[part.definitionId] ?? getDefinition(part.definitionId)?.name ?? part.definitionId, all = byDef.get(part.definitionId)!;
    if (part.definitionId === 'servo-sg90' && all.length > 1 && part.label && !/^servo sg90( \d+)?$/i.test(part.label)) return part.label.charAt(0).toLowerCase() + part.label.slice(1); // varios servos: los distingue el nombre que les puso el proyecto
    return all.length > 1 ? `${base} ${all.indexOf(part) + 1}` : base;
  };

  const steps: GuideStep[] = [];
  const used = new Set<string>();
  const unique = (base: string) => { let k = base, i = 2; while (used.has(k)) k = `${base}-${i++}`; used.add(k); return k; };

  // Ajustes: voltaje de la batería y puentes del L298N que la plantilla cambió respecto del valor de fábrica.
  for (const part of reference.parts) {
    const def = getDefinition(part.definitionId);
    if (part.definitionId === 'battery-holder-4aa') {
      const volts = Number(part.props?.voltage ?? def?.props?.find(p => p.id === 'voltage')?.default ?? 6);
      steps.push({kind: 'prop', id: unique(`bateria-${volts}v`), group: G_AJUSTES, title: `Pon la ${nameOf(part)} en ${volts} V`, why: 'Cada robot necesita una tensión de batería para sus motores y su placa. Cámbiala en Propiedades de la batería; el simulador usa este valor.', part: partRef(part), prop: 'voltage', value: volts, atLeast: true} satisfies PropStep);
    }
    if (part.definitionId === 'l298n-module') {
      for (const [prop, label] of [['jumperENA', 'ENA'], ['jumperENB', 'ENB'], ['jumper5V', 'del regulador de 5 V']] as const) {
        const want = part.props?.[prop], fallback = def?.props?.find(p => p.id === prop)?.default;
        if (typeof want === 'boolean' && want !== fallback) steps.push({kind: 'prop', id: unique(`${prop}-${nameOf(part)}`), group: G_AJUSTES, title: `${want ? 'Pon' : 'Quita'} el puente ${label} del ${nameOf(part)}`, why: want ? `Con el puente puesto, el canal queda habilitado todo el tiempo.` : prop === 'jumper5V' ? 'Sin este puente el driver no genera 5 V propios: la lógica se alimenta desde fuera.' : `Sin el puente, ${label} recibe PWM del Arduino y puedes controlar la velocidad con analogWrite.`, part: partRef(part), prop, value: want} satisfies PropStep);
      }
    }
  }

  // Un cable de la plantilla = un paso.
  const parts = new Map(reference.parts.map(p => [p.instanceId, p]));
  const wires: WireStep[] = [];
  for (const c of reference.connections) {
    const pa = parts.get(c.a.instanceId), pb = parts.get(c.b.instanceId);
    if (!pa || !pb) continue;
    const a: Pin = {def: pa.definitionId, pin: c.a.pinId}, b: Pin = {def: pb.definitionId, pin: c.b.pinId};
    const title = `${nameOf(pa)} ${pinLabel(a.def, a.pin)} → ${nameOf(pb)} ${pinLabel(b.def, b.pin)}`;
    const servoName = [pa, pb].find(x => x.definitionId === 'servo-sg90' && byDef.get('servo-sg90')!.length > 1 && nameOf(x) !== `servo ${byDef.get('servo-sg90')!.indexOf(x) + 1}`);
    const notes = [noteOf(b.def, b.pin), noteOf(a.def, a.pin), servoName && /^(SIG|VCC|GND)$/.test(servoName === pa ? a.pin : b.pin) ? `Este es el ${nameOf(servoName)}.` : undefined].filter((n, i, all): n is string => !!n && all.indexOf(n) === i).slice(0, 3);
    wires.push({kind: 'wire', id: unique(`${nameOf(pa)}-${a.pin}-${nameOf(pb)}-${b.pin}`.toLowerCase().replace(/[^a-z0-9+-]+/g, '-')), group: groupOf(a, b, [pa, pb]), title, why: notes.join(' ') || 'Une estos dos puntos como en la plantilla.',
      from: {part: partRef(pa), pin: c.a.pinId}, to: {part: partRef(pb), pin: c.b.pinId}, color: c.color, colorName: COLOR_NAMES[c.color.toLowerCase()] ?? 'del color indicado'});
  }
  wires.sort((x, y) => GROUP_ORDER.indexOf(x.group) - GROUP_ORDER.indexOf(y.group)); // estable: conserva el orden de la plantilla dentro de cada grupo
  steps.push(...wires);

  const cables = wires.length, ajustes = steps.length - cables;
  return {id, name, summary: `${steps.length} pasos: ${ajustes ? `${ajustes} ajuste${ajustes === 1 ? '' : 's'} y ` : ''}${cables} cables, tal como están en la plantilla.`, steps, reference};
}
