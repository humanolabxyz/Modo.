// Guías de programación paso a paso. Cada `source` se compila con `qa/fixtures/robotica/build-guide-programs.mjs` y el .hex queda en `programHex.generated.ts`
// (así los pasos funcionan también sin servicio de compilación). Si cambias un `source`, hay que regenerar los .hex.
import type {ProgramGuideDef} from './programTypes.ts';
import {PICK_GUIDE, TRACKED_GUIDE} from './programGuideTracked.ts';

const AVOID_HEAD = `// Evitar obstáculos. Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor HC-SR04: TRIG=D9, ECHO=D10.\n`;
const AVOID_SETUP = (extra = '') => `void setup() {${extra}
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);  // IN1..IN4: sentido de cada motor
  pinMode(9, OUTPUT);   // TRIG: el Arduino manda el pulso
  pinMode(10, INPUT);   // ECHO: el Arduino escucha el eco
}
`;
const MOTORES = `// izqAdelante / derAdelante: true = esa rueda gira hacia adelante. fuerza: 0 a 255 (PWM).
void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);   // motor 1: IN1 y IN2 siempre opuestos
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);  // motor 2: IN3 y IN4 siempre opuestos
  analogWrite(5, fuerza); analogWrite(6, fuerza);                // ENA y ENB: la velocidad
}
`;
const DISTANCIA = `// Devuelve la distancia al obstáculo en centímetros (400 si no hay eco).
long distanciaCm() {
  digitalWrite(9, LOW); delayMicroseconds(2);
  digitalWrite(9, HIGH); delayMicroseconds(10);   // pulso de 10 µs en TRIG: «mide ahora»
  digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 25000UL);  // cuánto tarda ECHO en volver
  if (us == 0) return 400;
  return us / 58;                                 // 58 µs por cada centímetro de ida y vuelta
}
`;

export const AVOID_GUIDE: ProgramGuideDef = {
  id: 'evitar-obstaculos',
  name: 'Evitar obstáculos',
  summary: '4 pasos: pines, motores, medir con el HC-SR04 y decidir. Sirve para el robot de 2 ruedas, el explorador y el Rover 4WD.',
  templates: ['robot-2-ruedas-listo', 'robot-explorador-luces', 'robot-rover-4wd'],
  steps: [
    {
      id: 'pines', title: 'Paso 1 · Configurar los pines',
      why: 'Antes de usar un pin hay que decirle al Arduino si manda (OUTPUT) o escucha (INPUT). Aquí van los seis que usa el robot.',
      learn: ['setup() corre una sola vez al encender.', 'pinMode(pin, OUTPUT) = el Arduino manda señal; INPUT = la lee.', 'loop() se repite para siempre (por ahora vacío).'],
      source: AVOID_HEAD + AVOID_SETUP() + `void loop() {\n}\n`,
      see: 'Nada se mueve todavía. En Consola → Serie y estado, D4, D7, D8, D12 y D9 aparecen como salidas.',
      checks: [{label: 'al encender', ms: 300, expect: [
        {kind: 'pin-mode', pin: 'D4', mode: 'out'}, {kind: 'pin-mode', pin: 'D7', mode: 'out'}, {kind: 'pin-mode', pin: 'D8', mode: 'out'}, {kind: 'pin-mode', pin: 'D12', mode: 'out'}, {kind: 'pin-mode', pin: 'D9', mode: 'out'}]}],
    },
    {
      id: 'motores', title: 'Paso 2 · Mover los motores',
      why: 'Una función `motores()` esconde los detalles del puente H: cada motor tiene dos pines de sentido (siempre opuestos) y un pin de velocidad.',
      learn: ['IN1 alto + IN2 bajo = adelante; al revés = atrás.', 'analogWrite(pin, 0..255) manda PWM: más número, más velocidad.', 'Una función con parámetros evita repetir código.'],
      source: AVOID_HEAD + MOTORES + AVOID_SETUP() + `void loop() {\n  motores(true, true, 200);   // los dos hacia adelante\n}\n`,
      see: 'Pulsa ▶: el robot avanza en línea recta sin parar.',
      checks: [{label: 'avanzando', ms: 400, expect: [
        {kind: 'pin-level', pin: 'D4', level: 'high'}, {kind: 'pin-level', pin: 'D7', level: 'low'}, {kind: 'pin-level', pin: 'D8', level: 'high'}, {kind: 'pin-level', pin: 'D12', level: 'low'},
        {kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, above: 1.5}]}],
    },
    {
      id: 'medir', title: 'Paso 3 · Medir la distancia',
      why: 'El HC-SR04 mide con sonido: TRIG lanza un pulso y ECHO se mantiene en alto mientras el sonido va y vuelve. La distancia sale del tiempo.',
      learn: ['pulseIn mide cuánto dura un pulso en microsegundos.', 'El sonido recorre 1 cm de ida y vuelta en unos 58 µs.', 'Serial.print escribe en el Monitor serie para ver qué «ve» el robot.'],
      source: AVOID_HEAD + DISTANCIA + MOTORES + AVOID_SETUP('\n  Serial.begin(9600);') + `void loop() {
  long d = distanciaCm();
  Serial.print("distancia: "); Serial.print(d); Serial.println(" cm");
  motores(true, true, 200);
  delay(100);
}
`,
      see: 'Abre Consola → Serie y estado: aparece «distancia: 30 cm» (cambia el obstáculo en el escenario y cambia el número).',
      checks: [
        {label: 'con un obstáculo a 50 cm', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.5}], ms: 700, expect: [{kind: 'serial', match: 'distancia: (49|50|51) cm', hint: 'no se lee «distancia: 50 cm»'}, {kind: 'sensor-echoes', min: 2}]},
        {label: 'con un obstáculo a 15 cm', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.15}], ms: 700, expect: [{kind: 'serial', match: 'distancia: 1[4-6] cm', hint: 'no se lee «distancia: 15 cm»'}]},
      ],
    },
    {
      id: 'decidir', title: 'Paso 4 · Decidir y esquivar',
      why: 'Ahora el robot toma una decisión con if: si hay algo a menos de 20 cm gira un momento (una rueda adelante y la otra atrás); si no, sigue recto.',
      learn: ['if / else elige qué hacer según lo que mide el sensor.', 'Girar en el lugar = una rueda adelante y la otra atrás.', 'delay(400) deja que el giro dure lo suficiente antes de volver a medir.'],
      source: AVOID_HEAD + DISTANCIA + MOTORES + AVOID_SETUP() + `void loop() {
  if (distanciaCm() < 20) { motores(true, false, 200); delay(400); }  // obstáculo cerca: gira a la derecha
  else motores(true, true, 200);                                       // camino libre: avanza
  delay(30);
}
`,
      see: 'Pulsa ▶ con una caja delante: avanza, gira antes de tocarla y sigue por otro lado.',
      checks: [
        {label: 'con el camino libre (1 m)', set: [{def: 'hc-sr04', prop: 'testDistance', value: 1}], ms: 500, expect: [{kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, above: 1.5}]},
        {label: 'con un obstáculo a 10 cm', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.1}], ms: 300, expect: [{kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, below: -1.5}]},
      ],
    },
  ],
};

const LINE_HEAD = `// Seguidor de línea con dos TCRT5000 (negro = ALTO, blanco = BAJO). DO izquierdo=D2, derecho=D3.\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.\n`;
const LINE_SETUP = (extra = '') => `void setup() {${extra}
  pinMode(2, INPUT); pinMode(3, INPUT);   // los dos sensores de línea
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);   // sentido de los motores
}
`;
const LINE_MOTORES = `// izquierda / derecha: fuerza de cada rueda (0 a 255). Los dos motores siempre van hacia adelante.
void motores(int izquierda, int derecha) {
  digitalWrite(4, HIGH); digitalWrite(7, LOW);
  digitalWrite(8, HIGH); digitalWrite(12, LOW);
  analogWrite(5, izquierda); analogWrite(6, derecha);
}
`;
export const LINE_GUIDE: ProgramGuideDef = {
  id: 'seguidor-linea',
  name: 'Seguidor de línea',
  summary: '4 pasos: pines, motores con fuerza propia, leer los sensores y corregir el rumbo.',
  templates: ['robot-seguidor-linea'],
  steps: [
    {
      id: 'pines', title: 'Paso 1 · Configurar los pines',
      why: 'Los sensores de línea son entradas (INPUT) y los pines del puente H son salidas (OUTPUT).',
      learn: ['Los TCRT5000 entregan ALTO sobre negro y BAJO sobre blanco.', 'Un pin de entrada solo lee; uno de salida manda.'],
      source: LINE_HEAD + LINE_SETUP() + `void loop() {\n}\n`,
      see: 'Nada se mueve. D2 y D3 son entradas; D4, D7, D8 y D12 salidas.',
      checks: [{label: 'al encender', ms: 300, expect: [{kind: 'pin-mode', pin: 'D4', mode: 'out'}, {kind: 'pin-mode', pin: 'D7', mode: 'out'}, {kind: 'pin-mode', pin: 'D8', mode: 'out'}, {kind: 'pin-mode', pin: 'D12', mode: 'out'}, {kind: 'pin-mode', pin: 'D2', mode: 'in'}, {kind: 'pin-mode', pin: 'D3', mode: 'in'}]}],
    },
    {
      id: 'motores', title: 'Paso 2 · Motores con fuerza propia',
      why: 'Para seguir una curva cada rueda necesita su propia velocidad. `motores(izquierda, derecha)` fija la fuerza de cada una.',
      learn: ['Girar suave = una rueda más lenta que la otra.', 'ENA controla el motor izquierdo y ENB el derecho con analogWrite.'],
      source: LINE_HEAD + LINE_MOTORES + LINE_SETUP() + `void loop() {\n  motores(180, 180);   // ambas ruedas igual: recto\n}\n`,
      see: 'Pulsa ▶: el robot avanza recto.',
      checks: [{label: 'avanzando recto', ms: 400, expect: [{kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, above: 1.5}, {kind: 'motor-close', motor: 0, other: 1, tolerance: 0.4}]}],
    },
    {
      id: 'leer', title: 'Paso 3 · Leer los sensores',
      why: 'digitalRead devuelve 1 (negro) o 0 (blanco). Verlo en el Monitor serie ayuda a entender qué ve cada sensor antes de decidir.',
      learn: ['digitalRead(pin) lee un nivel ALTO/BAJO.', 'Un bool guarda un sí/no.', 'Imprimir lo que lees es la mejor forma de depurar.'],
      source: LINE_HEAD + LINE_MOTORES + LINE_SETUP('\n  Serial.begin(9600);') + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  Serial.print("izq="); Serial.print(izquierda); Serial.print(" der="); Serial.println(derecha);
  motores(180, 180);
  delay(100);
}
`,
      see: 'En el Monitor serie ves «izq=0 der=0». Si pones un sensor sobre negro, su número pasa a 1.',
      checks: [
        {label: 'con el sensor izquierdo sobre negro', set: [{def: 'tcrt5000-module', n: 0, prop: 'testBlack', value: true}], ms: 500, expect: [{kind: 'serial', match: 'izq=1 der=0', hint: 'no se lee «izq=1 der=0»'}]},
        {label: 'con los dos sensores sobre blanco', ms: 500, expect: [{kind: 'serial', match: 'izq=0 der=0', hint: 'no se lee «izq=0 der=0»'}]},
      ],
    },
    {
      id: 'corregir', title: 'Paso 4 · Corregir el rumbo',
      why: 'Si el sensor izquierdo ve negro, la línea se fue a la izquierda: frena la rueda izquierda para girar hacia ella. Con el derecho, al revés.',
      learn: ['if / else if / else decide entre tres casos.', 'Corregir = frenar el lado hacia donde está la línea.', 'Un delay corto (5 ms) hace que el robot reaccione rápido.'],
      source: LINE_HEAD + LINE_MOTORES + LINE_SETUP() + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  if (izquierda && !derecha) motores(65, 200);        // línea a la izquierda: frena la rueda izquierda
  else if (derecha && !izquierda) motores(200, 65);   // línea a la derecha: frena la rueda derecha
  else motores(180, 180);                              // centrado: recto
  delay(5);
}
`,
      see: 'En la pista ovalada el robot sigue la línea y corrige en las curvas.',
      checks: [
        {label: 'con la línea a la izquierda', set: [{def: 'tcrt5000-module', n: 0, prop: 'testBlack', value: true}], ms: 400, expect: [{kind: 'motor-less-than', motor: 0, other: 1, margin: 0.5}]},
        {label: 'con la línea a la derecha', set: [{def: 'tcrt5000-module', n: 1, prop: 'testBlack', value: true}], ms: 400, expect: [{kind: 'motor-less-than', motor: 1, other: 0, margin: 0.5}]},
        {label: 'centrado', ms: 400, expect: [{kind: 'motor-close', motor: 0, other: 1, tolerance: 0.4}, {kind: 'motor', motor: 0, above: 1.5}]},
      ],
    },
  ],
};

const SUMO_HEAD = `// Minisumo: arena con borde negro. Sensores de borde: izquierdo=D2, derecho=D3 (negro = ALTO).\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.\n`;
const SUMO_SETUP = (extra = '') => `void setup() {${extra}
  pinMode(2, INPUT); pinMode(3, INPUT);   // sensores de borde
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);
}
`;
export const SUMO_GUIDE: ProgramGuideDef = {
  id: 'minisumo-borde',
  name: 'Minisumo · no caerse del borde',
  summary: '4 pasos: pines, motores, detectar el borde negro y reaccionar. Sirve para el minisumo y los robots de combate.',
  templates: ['robot-minisumo-practica', 'robot-sumo-cuna', 'robot-sumo-pala-4wd', 'robot-sumo-defensa'],
  steps: [
    {
      id: 'pines', title: 'Paso 1 · Configurar los pines',
      why: 'Dos sensores miran el suelo para detectar el borde negro de la arena; el resto de los pines mandan al puente H.',
      learn: ['Los sensores de borde son entradas.', 'Los motores se controlan desde salidas.'],
      source: SUMO_HEAD + SUMO_SETUP() + `void loop() {\n}\n`,
      see: 'Nada se mueve todavía.',
      checks: [{label: 'al encender', ms: 300, expect: [{kind: 'pin-mode', pin: 'D2', mode: 'in'}, {kind: 'pin-mode', pin: 'D3', mode: 'in'}, {kind: 'pin-mode', pin: 'D4', mode: 'out'}, {kind: 'pin-mode', pin: 'D8', mode: 'out'}]}],
    },
    {
      id: 'motores', title: 'Paso 2 · Avanzar y retroceder',
      why: '`motores()` mueve cada rueda hacia adelante o atrás. Retroceder será lo primero que haga al encontrar el borde.',
      learn: ['Cambiar true/false invierte el sentido de una rueda.', 'Dos ruedas en sentidos opuestos hacen girar al robot en su sitio.'],
      source: SUMO_HEAD + `void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
` + SUMO_SETUP() + `void loop() {\n  motores(true, true, 150);   // avanza\n}\n`,
      see: 'Pulsa ▶: avanza hasta el borde y se saldría de la arena.',
      checks: [{label: 'avanzando', ms: 400, expect: [{kind: 'motor', motor: 0, above: 1.0}, {kind: 'motor', motor: 1, above: 1.0}]}],
    },
    {
      id: 'borde', title: 'Paso 3 · Detectar el borde',
      why: 'Si cualquiera de los dos sensores ve negro, el robot está en el borde. Primero lo mostramos en el Monitor serie.',
      learn: ['Un OR (||) vale si cualquiera de las dos condiciones es cierta.', 'Mostrar la lectura confirma que el sensor funciona antes de actuar.'],
      source: SUMO_HEAD + `void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
` + SUMO_SETUP('\n  Serial.begin(9600);') + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  Serial.println((izquierda || derecha) ? "BORDE" : "libre");
  motores(true, true, 150);
  delay(100);
}
`,
      see: 'El Monitor serie dice «libre»; con un sensor sobre negro dice «BORDE».',
      checks: [
        {label: 'con el sensor derecho sobre negro', set: [{def: 'tcrt5000-module', n: 1, prop: 'testBlack', value: true}], ms: 500, expect: [{kind: 'serial', match: 'BORDE', hint: 'no aparece «BORDE»'}]},
        {label: 'sobre blanco', ms: 500, expect: [{kind: 'serial', match: 'libre', hint: 'no aparece «libre»'}]},
      ],
    },
    {
      id: 'reaccionar', title: 'Paso 4 · Retroceder y girar',
      why: 'Al detectar el borde: primero retrocede (para alejarse) y luego gira hacia dentro de la arena. Si no hay borde, avanza.',
      learn: ['Una secuencia de acciones con delay: retroceder 320 ms, luego girar 420 ms.', 'else deja el comportamiento normal cuando no hay borde.'],
      source: SUMO_HEAD + `void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
` + SUMO_SETUP() + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  if (izquierda || derecha) {
    motores(false, false, 180); delay(320);   // retrocede para alejarse del borde
    motores(true, false, 180); delay(420);    // gira hacia dentro de la arena
  } else {
    motores(true, true, 150);                 // sin borde: avanza
  }
  delay(5);
}
`,
      see: 'En la arena el robot avanza, retrocede al ver el borde negro y vuelve a entrar.',
      checks: [
        {label: 'al detectar el borde (sensor izquierdo sobre negro)', set: [{def: 'tcrt5000-module', n: 0, prop: 'testBlack', value: true}], ms: 200, expect: [{kind: 'motor', motor: 0, below: -1.0}, {kind: 'motor', motor: 1, below: -1.0}]},
        {label: 'sin borde', ms: 400, expect: [{kind: 'motor', motor: 0, above: 1.0}, {kind: 'motor', motor: 1, above: 1.0}]},
      ],
    },
  ],
};

export const PROGRAM_GUIDES: readonly ProgramGuideDef[] = [AVOID_GUIDE, LINE_GUIDE, SUMO_GUIDE, TRACKED_GUIDE, PICK_GUIDE];
export const getProgramGuide = (id: string | undefined): ProgramGuideDef | undefined => PROGRAM_GUIDES.find(g => g.id === id);
/** Guía de programación sugerida para un robot (plantilla). */
export const programGuideForTemplate = (templateId: string | undefined): ProgramGuideDef | undefined => (templateId ? PROGRAM_GUIDES.find(g => g.templates.includes(templateId)) : undefined);
