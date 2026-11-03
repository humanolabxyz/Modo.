// Guía de programación del robot de orugas con radar, cara y brazos: 6 pasos. El último paso es EXACTAMENTE el programa de la plantilla (TRACKED_SKETCH).
// Si cambias algo aquí, regenera los .hex con `npm run build:guide-programs`.
import {PICK_SKETCH, TRACKED_SKETCH} from '../project/trackedSketch.ts';
import type {ProgramGuideDef} from './programTypes.ts';

const HEAD = `// Robot de orugas con cabeza de radar, cara y brazos.
// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Cuello (servo): D3. Hombros (servos): izquierdo D11, derecho D2. Codos: D13 y A0. Pinzas: A1 y A2. HC-SR04: TRIG=D9, ECHO=D10. Pantalla OLED por I2C: SDA=A4, SCL=A5.
`;
const MOTORES = `
void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
// Freno: los cuatro IN en bajo con el enable puesto cortocircuitan los motores y los detienen de golpe (con el enable apagado giran libres y el robot sigue de largo).
void parar() {
  digitalWrite(4, LOW); digitalWrite(7, LOW); digitalWrite(8, LOW); digitalWrite(12, LOW);
  analogWrite(5, 255); analogWrite(6, 255);
}
`;
const DISTANCIA = `
long distanciaCm() {
  digitalWrite(9, LOW); delayMicroseconds(2);
  digitalWrite(9, HIGH); delayMicroseconds(10);
  digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 25000UL);
  if (us == 0) return 400;
  return us / 58;
}
`;
const PINES = `  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);
  pinMode(9, OUTPUT); pinMode(10, INPUT);
`;
const CARA = `
// Cara: 0 = normal, 1 = sorprendido, 2 = mira a SU izquierda, 3 = mira a SU derecha (quien la ve de frente tiene la izquierda del robot a la derecha de la pantalla)
void cara(int estado) {
  int dx = (estado == 2) ? 6 : (estado == 3) ? -6 : 0;
  pantalla.clearDisplay();
  if (estado == 1) {                                          // sorpresa: ojos enormes y boca redonda
    pantalla.fillCircle(38, 24, 18, SSD1306_WHITE); pantalla.fillCircle(90, 24, 18, SSD1306_WHITE);
    pantalla.fillCircle(38, 24, 4, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 4, SSD1306_BLACK);
    pantalla.fillCircle(64, 52, 8, SSD1306_WHITE);  pantalla.fillCircle(64, 52, 4, SSD1306_BLACK);
  } else {                                                    // ojos con pupila y boca contenta
    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);
    pantalla.fillCircle(38 + dx, 24, 6, SSD1306_BLACK); pantalla.fillCircle(90 + dx, 24, 6, SSD1306_BLACK);
    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);
  }
  pantalla.display();
}
`;

export const TRACKED_GUIDE: ProgramGuideDef = {
  id: 'oruga-radar',
  name: 'Robot de orugas con radar y cara',
  summary: '6 pasos: orugas con freno, cuello con servo, radar a los lados, cara en la pantalla, brazos y pinzas con servos y decidir hacia dónde girar.',
  templates: ['robot-oruga-radar'],
  steps: [
    {
      id: 'orugas', title: 'Paso 1 · Mover las orugas y frenar',
      why: 'Las orugas se mueven como dos ruedas: cada motor tiene dos pines de sentido y uno de velocidad. Además de avanzar, el robot necesita FRENAR: con los cuatro IN en bajo y el enable puesto, el puente H cortocircuita los motores y se detienen de golpe.',
      learn: ['IN1/IN2 e IN3/IN4 deciden el sentido; ENA/ENB, la velocidad (PWM).', 'Con el enable apagado el motor queda libre y el robot sigue de largo; con IN iguales y enable puesto, frena.', 'Una función por cada acción (motores, parar) mantiene el programa ordenado.'],
      source: HEAD + MOTORES + `
void setup() {
${PINES}}
void loop() {
  motores(true, true, 200);   // avanza un segundo
  delay(1000);
  parar();                    // frena un segundo
  delay(1000);
}
`,
      see: 'Pulsa ▶: el robot avanza un segundo y se detiene en seco otro segundo, una y otra vez.',
      checks: [
        {label: 'avanzando', ms: 500, expect: [{kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, above: 1.5}]},
        {label: 'frenando', ms: 1500, expect: [{kind: 'motor', motor: 0, above: -0.3, below: 0.3}, {kind: 'motor', motor: 1, above: -0.3, below: 0.3}]},
      ],
    },
    {
      id: 'cuello', title: 'Paso 2 · Girar el cuello',
      why: 'El cuello es un servo en D3. La biblioteca Servo manda un pulso cada 20 ms: `write(grados)` fija el ángulo. 90° es mirar al frente, 160° a la izquierda y 20° a la derecha. La cabeza entera gira con él.',
      learn: ['#include <Servo.h> y un objeto Servo.', 'cuello.attach(3) dice en qué pin está el servo; cuello.write(90) lo manda a 90°.', 'El servo tarda un momento en llegar: hay que esperar con delay antes de usarlo.'],
      source: HEAD + `#include <Servo.h>
Servo cuello;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + MOTORES + `
void setup() {
${PINES}  cuello.attach(3); cuello.write(CENTRO);
}
void loop() {
  cuello.write(IZQUIERDA); delay(800);   // mira a la izquierda
  cuello.write(DERECHA);   delay(800);   // mira a la derecha
  cuello.write(CENTRO);    delay(800);   // vuelve al frente
}
`,
      see: 'Pulsa ▶: la cabeza gira a la izquierda, luego a la derecha y vuelve al frente. La Consola muestra el ángulo del servo.',
      checks: [
        {label: 'a los 0,5 s (mirando a la izquierda)', ms: 500, expect: [{kind: 'servo-angle', servo: 0, angle: 160, tolerance: 6}]},
        {label: 'a los 1,3 s (mirando a la derecha)', ms: 1300, expect: [{kind: 'servo-angle', servo: 0, angle: 20, tolerance: 6}]},
        {label: 'a los 2,1 s (de vuelta al frente)', ms: 2100, expect: [{kind: 'servo-angle', servo: 0, angle: 90, tolerance: 6}]},
      ],
    },
    {
      id: 'radar', title: 'Paso 3 · El radar: medir a los lados',
      why: 'El HC-SR04 va en la cabeza: mide hacia donde mira. Si giras el cuello, mides en otra dirección. Mirar a la izquierda, medir, mirar a la derecha, medir y comparar es un radar casero.',
      learn: ['Una función `mirar(angulo)` mueve el cuello y espera a que llegue.', 'Medir en cada lado y guardar el resultado en variables (izq, der).', 'Serial.print deja ver lo que «ve» el radar.'],
      source: HEAD + `#include <Servo.h>
Servo cuello;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + DISTANCIA + MOTORES + `
void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar

void setup() {
  Serial.begin(9600);
${PINES}  cuello.attach(3); cuello.write(CENTRO);
}
void loop() {
  mirar(IZQUIERDA); long izq = distanciaCm();
  mirar(DERECHA);   long der = distanciaCm();
  mirar(CENTRO);
  Serial.print("izq="); Serial.print(izq); Serial.print(" der="); Serial.println(der);
  delay(200);
}
`,
      see: 'En el Monitor serie ves «izq=… der=…» con las distancias a cada lado. Cambia los obstáculos del escenario y cambian los números.',
      checks: [
        {label: 'con obstáculos a 50 cm', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.5}], ms: 1800, expect: [{kind: 'serial', match: 'izq=(49|50|51) der=(49|50|51)', hint: 'no se lee «izq=50 der=50»'}, {kind: 'sensor-echoes', min: 2}]},
        {label: 'con obstáculos a 20 cm', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.2}], ms: 1800, expect: [{kind: 'serial', match: 'izq=(19|20|21) der=(19|20|21)', hint: 'no se lee «izq=20 der=20»'}]},
      ],
    },
    {
      id: 'cara', title: 'Paso 4 · La cara en la pantalla',
      why: 'La pantalla OLED por I²C (SDA = A4, SCL = A5) se programa con las bibliotecas Adafruit: `fillCircle` dibuja los ojos, `fillRoundRect` la boca y `display()` envía la imagen a la pantalla. Cambiar la pupila de lugar hace que el robot «mire» hacia un lado.',
      learn: ['#include <Wire.h>, <Adafruit_GFX.h> y <Adafruit_SSD1306.h>.', 'pantalla.begin(...) arranca la pantalla; clearDisplay() borra; display() muestra lo dibujado.', 'Una función cara(estado) con if/else cambia la expresión.'],
      source: HEAD + `#include <Wire.h>
#include <Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);
Servo cuello;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + DISTANCIA + MOTORES + CARA + `
void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar

void setup() {
${PINES}  cuello.attach(3); cuello.write(CENTRO);
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara(0);
}
void loop() {
  mirar(IZQUIERDA); long izq = distanciaCm(); cara(2);   // mira a la izquierda y su cara también
  mirar(DERECHA);   long der = distanciaCm(); cara(3);   // mira a la derecha
  mirar(CENTRO);    cara(0);
  delay(300);
}
`,
      see: 'La pantalla de la cabeza muestra dos ojos con pupila y una boca; las pupilas se mueven hacia el lado al que mira el cuello.',
      checks: [
        {label: 'al encender (0,9 s)', ms: 900, expect: [{kind: 'display-lit', min: 1200, max: 2400, hint: 'la pantalla no muestra la cara'}]},
        {label: 'después de mirar a los lados', ms: 2500, expect: [{kind: 'display-lit', min: 1200, max: 2400, hint: 'la pantalla no muestra la cara'}, {kind: 'servo-angle', servo: 0, angle: 90, tolerance: 40}]},
      ],
    },
    {
      id: 'brazos', title: 'Paso 5 · Mover los brazos y las pinzas',
      why: 'Cada brazo tiene tres servos: el HOMBRO lo balancea (90° = colgando, menos de 90° = lo levanta hacia adelante), el CODO dobla el antebrazo (90° = recto, más de 90° = hacia adelante) y la PINZA abre o cierra los dedos (0° = muy abierta, 90° = casi cerrada). Los servos del lado derecho están espejados: reciben 180 − ángulo para moverse igual que los del izquierdo.',
      learn: ['Siete servos en total: cuello D3, hombros D11 y D2, codos D13 y A0, pinzas A1 y A2.', 'Una función brazos(hombro, codo, pinza) mueve los seis a la vez.', 'El espejo (180 - angulo) hace que los dos brazos se muevan simétricos.'],
      source: HEAD + `#include <Wire.h>
#include <Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);
Servo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + DISTANCIA + MOTORES + CARA + `
void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar
// hombro: 90 = brazo colgando, menos de 90 = lo levanta. codo: 90 = recto, mas de 90 = lo dobla hacia adelante. pinza: 0 = abierta, 90 = casi cerrada. El lado derecho va en espejo (180 - angulo).
void brazos(int hombro, int codo, int pinza) {
  hombroIzq.write(hombro); hombroDer.write(180 - hombro);
  codoIzq.write(codo);     codoDer.write(180 - codo);
  pinzaIzq.write(pinza);   pinzaDer.write(pinza);
}

void setup() {
${PINES}  cuello.attach(3); cuello.write(CENTRO);
  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);
  brazos(90, 140, 20);
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara(0);
}
void loop() {
  brazos(40, 140, 20);                                    // brazos arriba
  mirar(IZQUIERDA); long izq = distanciaCm(); cara(2);
  mirar(DERECHA);   long der = distanciaCm(); cara(3);
  mirar(CENTRO);    cara(0);
  brazos(90, 140, 64);                                    // brazos colgando y pinzas cerradas
  delay(600);
  brazos(90, 140, 20);                                    // pinzas abiertas
  delay(300);
}
`,
      see: 'El robot levanta los dos brazos a la vez mientras la cabeza mira a los lados; luego los baja, cierra las pinzas y las vuelve a abrir.',
      checks: [
        {label: 'con los brazos arriba y las pinzas abiertas (0,6 s)', ms: 600, expect: [{kind: 'servo-angle', servo: 1, angle: 40, tolerance: 8}, {kind: 'servo-angle', servo: 4, angle: 140, tolerance: 8}, {kind: 'servo-angle', servo: 3, angle: 20, tolerance: 8}, {kind: 'servo-angle', servo: 6, angle: 20, tolerance: 8}]},
        {label: 'al encender (brazos colgando)', ms: 60, expect: [{kind: 'servo-angle', servo: 1, angle: 90, tolerance: 25}, {kind: 'servo-angle', servo: 4, angle: 90, tolerance: 25}]},
        {label: 'con las pinzas cerradas (3,3 s)', ms: 3300, expect: [{kind: 'servo-angle', servo: 3, angle: 64, tolerance: 8}, {kind: 'servo-angle', servo: 6, angle: 64, tolerance: 8}]},
      ],
    },
    {
      id: 'decidir', title: 'Paso 6 · Sorprenderse, elegir y girar',
      why: 'Todo junto: si el camino está libre, avanza; si ve algo a menos de 25 cm, FRENA, pone cara de sorpresa, levanta los brazos, mira a los dos lados con el radar, compara las distancias y gira hacia el lado más libre. Cuando termina, vuelve a la cara normal.',
      learn: ['if / else decide según lo que mide el radar.', 'Comparar dos medidas (izq > der) elige el lado.', 'motores(!haciaIzquierda, haciaIzquierda, ...) gira en el sitio hacia ese lado.'],
      source: TRACKED_SKETCH,
      see: 'En Simular el robot avanza, se sorprende al ver la caja, levanta los brazos, gira el cuello a los dos lados y gira hacia donde hay más espacio (con la pared a la izquierda, gira a la derecha).',
      checks: [
        {label: 'con el camino libre (1 m)', set: [{def: 'hc-sr04', prop: 'testDistance', value: 1}], ms: 1500, expect: [{kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, above: 1.5}, {kind: 'display-lit', min: 1200, max: 2400, hint: 'la cara normal no se ve'}]},
        {label: 'al ver un obstáculo a 15 cm (0,2 s)', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.15}], ms: 200, expect: [{kind: 'motor', motor: 0, above: -0.3, below: 0.3}, {kind: 'motor', motor: 1, above: -0.3, below: 0.3}, {kind: 'display-lit', min: 2000, max: 3000, hint: 'no se ve la cara de sorpresa (ojos grandes y boca redonda)'}]},
        {label: 'con los brazos levantados mientras mira (0,7 s)', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.15}], ms: 700, expect: [{kind: 'servo-angle', servo: 1, angle: 40, tolerance: 8}, {kind: 'servo-angle', servo: 4, angle: 140, tolerance: 8}]},
        {label: 'después de mirar a los lados, girando en el sitio (1,25 s)', set: [{def: 'hc-sr04', prop: 'testDistance', value: 0.15}], ms: 1250, expect: [{kind: 'motor', motor: 0, above: 1.5}, {kind: 'motor', motor: 1, below: -1.5}]},
      ],
    },
  ],
};

const PICK_HEAD = `// Robot de orugas que recoge cubos del suelo con las dos manos.
// Cuello (servo): D3. Hombros: izquierdo D11, derecho D2. Codos: izquierdo D13, derecho A0. Pinzas: izquierda A1, derecha A2. Pantalla OLED por I2C: SDA=A4, SCL=A5.
// Los servos del lado derecho van en espejo: reciben 180 - angulo para moverse igual que los del izquierdo.
`;
const PICK_SERVOS = `#include <Servo.h>
Servo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;

// hombro: 90 = brazo colgando, menos de 90 = lo adelanta (0 = horizontal). codo: 90 = antebrazo recto, mas de 90 = lo dobla hacia adelante. pinza: 0 = muy abierta, 90 = casi cerrada.
void brazos(int hombro, int codo, int pinza) {
  hombroIzq.write(hombro); hombroDer.write(180 - hombro);
  codoIzq.write(codo);     codoDer.write(180 - codo);
  pinzaIzq.write(pinza);   pinzaDer.write(pinza);
}
void conectarServos() {
  cuello.attach(3); cuello.write(90);
  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);
  brazos(90, 140, 20);  // brazos colgando con los antebrazos doblados y pinzas abiertas
}
`;

export const PICK_GUIDE: ProgramGuideDef = {
  id: 'oruga-recoger',
  name: 'Robot de orugas que recoge cubos',
  summary: '3 pasos: abrir y cerrar las pinzas, estirar el antebrazo hasta el cubo y la rutina completa: agarrar, levantar y soltar los dos cubos.',
  templates: ['robot-oruga-recoger'],
  steps: [
    {
      id: 'pinzas', title: 'Paso 1 · Abrir y cerrar las pinzas',
      why: 'Cada pinza tiene dos dedos que corren sobre un riel; un servo los junta o los separa. Con 20° quedan muy abiertos (unos 54 mm) y con 64° casi se tocan (32 mm): un cubo de 30 mm cabe justo. Los dos servos de pinza se mueven igual.',
      learn: ['Un servo por pinza: izquierda en A1 y derecha en A2.', 'El ángulo fija la separación de los dedos: más grados = más cerrada.', 'Los pines analógicos (A0–A5) también sirven como pines digitales para un servo.'],
      source: PICK_HEAD + PICK_SERVOS + `
void setup() {
  conectarServos();
}
void loop() {
  brazos(90, 140, 64);  // cierra las pinzas
  delay(1000);
  brazos(90, 140, 20);  // las abre
  delay(1000);
}
`,
      see: 'Pulsa ▶: los dedos de las dos pinzas se cierran un segundo y se vuelven a abrir, una y otra vez.',
      checks: [
        {label: 'pinzas cerradas (0,6 s)', ms: 600, expect: [{kind: 'servo-angle', servo: 3, angle: 64, tolerance: 8}, {kind: 'servo-angle', servo: 6, angle: 64, tolerance: 8}]},
        {label: 'pinzas abiertas (1,6 s)', ms: 1600, expect: [{kind: 'servo-angle', servo: 3, angle: 20, tolerance: 8}, {kind: 'servo-angle', servo: 6, angle: 20, tolerance: 8}]},
      ],
    },
    {
      id: 'estirar', title: 'Paso 2 · Bajar el brazo hasta el cubo',
      why: 'En reposo los brazos cuelgan a los lados con los antebrazos doblados hacia adelante. Para llegar al cubo el hombro se adelanta hasta 28° (el brazo queda inclinado hacia adelante) y el codo baja a 28° para que el antebrazo quede vertical y la pinza justo sobre el cubo, a ras del suelo. Los servos del lado derecho están espejados: reciben 180 − ángulo.',
      learn: ['Hombro y codo con el mismo ángulo dejan el antebrazo vertical, apuntando al suelo.', 'Primero se llega al cubo con la pinza abierta; recién después se cierra.', 'delay() da tiempo a que los servos lleguen antes del siguiente movimiento.'],
      source: PICK_HEAD + PICK_SERVOS + `
void setup() {
  conectarServos();
  delay(800);
}
void loop() {
  brazos(28, 28, 20);    // baja los brazos con las pinzas abiertas
  delay(1500);
  brazos(28, 28, 64);    // cierra las pinzas: agarra
  delay(1500);
  brazos(90, 140, 20);   // vuelve a colgar los brazos
  delay(1500);
}
`,
      see: 'Los dos brazos se inclinan hacia adelante, las pinzas se cierran donde están los cubos y luego todo vuelve al reposo.',
      checks: [
        {label: 'con los brazos inclinados hacia el cubo (1,6 s)', ms: 1600, expect: [{kind: 'servo-angle', servo: 1, angle: 28, tolerance: 8}, {kind: 'servo-angle', servo: 2, angle: 28, tolerance: 8}, {kind: 'servo-angle', servo: 5, angle: 152, tolerance: 8}, {kind: 'servo-angle', servo: 3, angle: 20, tolerance: 8}]},
        {label: 'con las pinzas cerradas (3,6 s)', ms: 3600, expect: [{kind: 'servo-angle', servo: 3, angle: 64, tolerance: 8}, {kind: 'servo-angle', servo: 6, angle: 64, tolerance: 8}]},
      ],
    },
    {
      id: 'recoger', title: 'Paso 3 · Agarrar, levantar y soltar',
      why: 'La rutina completa: baja los brazos hacia los cubos, cierra las pinzas, pone cara de contento, levanta los cubos (hombro a 0° y codo a 50°: el antebrazo se dobla hacia adelante), los baja otra vez, abre las pinzas para soltarlos y vuelve a colgar los brazos. En el simulador los cubos son objetos físicos: se agarran de verdad, suben con la pinza y caen al soltarlos.',
      learn: ['Una secuencia de posturas con delay() entre ellas.', 'El hombro con 90° deja el brazo colgando; con menos de 90° lo adelanta, y con 0° queda horizontal.', 'La cara cambia mientras sostiene los cubos.'],
      source: PICK_SKETCH,
      see: 'En Simular el robot baja los dos brazos, agarra los dos cubos, los levanta unos centímetros, los vuelve a poner en el suelo y los suelta. Mientras los sostiene la cara se pone contenta.',
      checks: [
        {label: 'bajando hacia los cubos (2,2 s)', ms: 2200, expect: [{kind: 'servo-angle', servo: 1, angle: 28, tolerance: 8}, {kind: 'servo-angle', servo: 2, angle: 28, tolerance: 8}, {kind: 'servo-angle', servo: 5, angle: 152, tolerance: 8}, {kind: 'servo-angle', servo: 3, angle: 20, tolerance: 8}]},
        {label: 'con los cubos levantados (4,8 s)', ms: 4800, expect: [{kind: 'servo-angle', servo: 1, angle: 0, tolerance: 8}, {kind: 'servo-angle', servo: 2, angle: 50, tolerance: 8}, {kind: 'servo-angle', servo: 4, angle: 180, tolerance: 8}, {kind: 'servo-angle', servo: 3, angle: 64, tolerance: 8}, {kind: 'servo-angle', servo: 6, angle: 64, tolerance: 8}]},
        {label: 'con los brazos colgando otra vez (9,5 s)', ms: 9500, expect: [{kind: 'servo-angle', servo: 1, angle: 90, tolerance: 8}, {kind: 'servo-angle', servo: 2, angle: 140, tolerance: 8}, {kind: 'servo-angle', servo: 3, angle: 20, tolerance: 8}]},
      ],
    },
  ],
};
