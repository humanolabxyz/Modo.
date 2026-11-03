// src/robotics/catalog/combat.ts
var prism = (width, yz, x = 0, massFraction = 1) => ({ vertices: [-1, 1].flatMap((sign) => yz.flatMap(([y, z]) => [x + sign * width / 2, y, z])), massFraction });
var box = (w, h, d, at, fraction) => prism(w, [[at[1] - h / 2, at[2] - d / 2], [at[1] + h / 2, at[2] - d / 2], [at[1] + h / 2, at[2] + d / 2], [at[1] - h / 2, at[2] + d / 2]], at[0], fraction);
var shapes = {
  "sumo-wedge": [prism(0.18, [[-0.02, -0.0375], [0.02, -0.0375], [-0.018, 0.0375], [-0.02, 0.0375]])],
  "sumo-scoop": [
    prism(0.2, [[-0.0225, -0.035], [-0.0145, -0.035], [-0.0195, 0.055], [-0.0225, 0.055]], 0, 0.4),
    box(0.2, 0.045, 3e-3, [0, 0, -0.0335], 0.22),
    prism(3e-3, [[-0.0225, -0.035], [0.0225, -0.035], [-0.01, 0.055], [-0.0225, 0.055]], -0.0985, 0.15),
    prism(3e-3, [[-0.0225, -0.035], [0.0225, -0.035], [-0.01, 0.055], [-0.0225, 0.055]], 0.0985, 0.15),
    box(0.012, 4e-3, 0.02, [-0.05, 0.0175, -0.045], 0.04),
    box(0.012, 4e-3, 0.02, [0.05, 0.0175, -0.045], 0.04)
  ],
  "sumo-bumper": [box(0.2, 0.065, 0.018, [0, 0, 0], 1)]
};
var combatHulls = (id) => shapes[id];
var COMBAT_DEFINITIONS = [
  { id: "sumo-wedge", name: "Cu\xF1a de sumo", dimensions: [0.18, 0.04, 0.075], massKg: 0.065, mountY: 0.02, summary: "Rampa fija de perfil bajo para entrar bajo el rival y empujarlo. Modelo did\xE1ctico de 180 \xD7 40 \xD7 75 mm.", keywords: ["cu\xF1a", "pala", "sumo", "rampa", "empujar", "combate", "blade"] },
  { id: "sumo-scoop", name: "Pala empujadora", dimensions: [0.2, 0.045, 0.11], massKg: 0.1, mountY: 0.0175, summary: "Pala fija con base inclinada, respaldo, laterales y pesta\xF1as de montaje. Modelo did\xE1ctico de 200 \xD7 45 \xD7 110 mm; sin mecanismo de elevaci\xF3n.", keywords: ["pala", "cuchara", "bulldozer", "empujar", "sumo", "combate", "scoop"] },
  { id: "sumo-bumper", name: "Defensa frontal ancha", dimensions: [0.2, 0.065, 0.018], massKg: 0.09, mountY: 75e-4, summary: "Escudo fijo vertical para empujar y proteger el frente. Modelo did\xE1ctico de 200 \xD7 65 \xD7 18 mm.", keywords: ["defensa", "escudo", "parachoques", "empujar", "sumo", "combate"] }
].map((d) => ({ ...d, dimensions: d.dimensions, category: "structure", dimensionsSource: "approximate", pins: [], anchors: [{ id: "back", label: "Fijaci\xF3n posterior", position: [0, d.mountY, -d.dimensions[2] / 2], normal: [0, 0, -1], tag: "combat-mount", accepts: [] }], scalable: false, model: "procedural" }));

// src/robotics/conveyor/constants.ts
var CONVEYOR_ID = "educational-conveyor";
var CONVEYOR_TEMPLATE = "brazo-e6-cinta-clasificadora";
var SORT_COLORS = ["rojo", "verde", "azul"];
var COLOR_RGB = { rojo: [220, 55, 55], verde: [50, 180, 95], azul: [55, 115, 225] };

// src/robotics/conveyor/catalog.ts
var conveyorDefinition = {
  id: CONVEYOR_ID,
  name: "Cinta transportadora \xB7 c\xE9lula educativa",
  category: "actuator",
  dimensions: [0.16, 0.08, 0.72],
  dimensionsSource: "approximate",
  massKg: 1.2,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  props: [
    { id: "speedMps", label: "Velocidad de cinta (m/s)", type: "number", min: 0.02, max: 0.12, default: 0.08 },
    { id: "jammed", label: "Falla: cinta atascada", type: "boolean", default: false },
    { id: "sensorFault", label: "Falla: sensor no detecta", type: "boolean", default: false }
  ],
  summary: "Banda de 720 mm, rodillos, sensor de presencia y lectura RGB did\xE1cticos. Transporte y clasificaci\xF3n coordinados con el E6; control por secuencia, sin conexi\xF3n el\xE9ctrica ni hardware real.",
  keywords: ["cinta", "transportadora", "banda", "linea", "clasificacion", "color", "sensor", "produccion"]
};

// src/robotics/catalog/index.ts
var mm = (v) => v / 1e3;
var pin = (id, label, position, role, extra = {}) => ({ id, label, position, role, ...extra });
var anchor = (id, label, position, normal, tag, accepts = []) => ({ id, label, position, normal, tag, accepts });
var UP = [0, 1, 0];
var DOWN = [0, -1, 0];
var PWM_PINS = /* @__PURE__ */ new Set([3, 5, 6, 9, 10, 11]);
var unoPins = [];
var pitch = mm(2.54);
var hx = mm(23.5);
var digitalZ = (i) => mm(31.5) - i * pitch - (i >= 8 ? mm(4) : 0);
for (let n = 0; n <= 13; n++) unoPins.push(pin(`D${n}`, `D${n}`, [hx, mm(7.5), digitalZ(n)], PWM_PINS.has(n) ? "pwm" : "digital", { electrical: { vMax: 5, iMax: 0.02 } }));
unoPins.push(pin("GND.3", "GND", [hx, mm(7.5), digitalZ(14)], "ground", { internalNet: "GND" }));
["A0", "A1", "A2", "A3", "A4", "A5"].forEach((id, i) => unoPins.push(pin(id, id, [-hx, mm(7.5), mm(10) - i * pitch], "analog", { electrical: { vMax: 5 } })));
unoPins.push(pin("VIN", "VIN", [-hx, mm(7.5), mm(10) + 1 * pitch], "power-in", { electrical: { vMax: 12 } }));
unoPins.push(pin("GND.1", "GND", [-hx, mm(7.5), mm(10) + 2 * pitch], "ground", { internalNet: "GND" }));
unoPins.push(pin("GND.2", "GND", [-hx, mm(7.5), mm(10) + 3 * pitch], "ground", { internalNet: "GND" }));
unoPins.push(pin("5V", "5V", [-hx, mm(7.5), mm(10) + 4 * pitch], "power-out", { electrical: { vMax: 5, iMax: 0.5 } }));
unoPins.push(pin("3V3", "3,3V", [-hx, mm(7.5), mm(10) + 5 * pitch], "power-out", { electrical: { vMax: 3.3, iMax: 0.15 } }));
var arduino = {
  id: "arduino-uno-r3",
  name: "Arduino UNO R3",
  category: "control",
  dimensions: [mm(53.4), mm(15), mm(68.6)],
  dimensionsSource: "datasheet",
  massKg: 0.025,
  pins: unoPins,
  anchors: [anchor("base", "Base", [0, -mm(7.5), 0], DOWN, "board-mount")],
  props: [{ id: "usb", label: "Alimentada por USB (virtual, 5 V)", type: "boolean", default: false }],
  scalable: false,
  model: "procedural",
  summary: "Placa de control con el microcontrolador ATmega328P.",
  keywords: ["arduino", "uno", "placa", "microcontrolador", "atmega"]
};
var l298n = {
  id: "l298n-module",
  name: "Driver L298N",
  category: "driver",
  dimensions: [mm(43), mm(27), mm(43)],
  dimensionsSource: "approximate",
  massKg: 0.03,
  pins: [
    pin("OUT1", "OUT1", [-mm(21.5), mm(8), mm(8)], "motor"),
    pin("OUT2", "OUT2", [-mm(21.5), mm(8), mm(2)], "motor"),
    pin("OUT3", "OUT3", [mm(21.5), mm(8), mm(8)], "motor"),
    pin("OUT4", "OUT4", [mm(21.5), mm(8), mm(2)], "motor"),
    pin("+12V", "+12V", [-mm(5), mm(8), -mm(21.5)], "power-in", { electrical: { vMax: 35, iMax: 2 } }),
    pin("GND", "GND", [0, mm(8), -mm(21.5)], "ground"),
    pin("+5V", "+5V", [mm(5), mm(8), -mm(21.5)], "power-out", { electrical: { vMax: 5, iMax: 0.5 } }),
    pin("ENA", "ENA", [-mm(10), mm(8), mm(21.5)], "pwm"),
    pin("IN1", "IN1", [-mm(6), mm(8), mm(21.5)], "digital"),
    pin("IN2", "IN2", [-mm(2), mm(8), mm(21.5)], "digital"),
    pin("IN3", "IN3", [mm(2), mm(8), mm(21.5)], "digital"),
    pin("IN4", "IN4", [mm(6), mm(8), mm(21.5)], "digital"),
    pin("ENB", "ENB", [mm(10), mm(8), mm(21.5)], "pwm")
  ],
  anchors: [anchor("base", "Base", [0, -mm(13.5), 0], DOWN, "driver-mount")],
  props: [
    { id: "jumperENA", label: "Puente ENA (canal A siempre activo)", type: "boolean", default: true },
    { id: "jumperENB", label: "Puente ENB (canal B siempre activo)", type: "boolean", default: true },
    { id: "jumper5V", label: "Puente regulador 5 V", type: "boolean", default: true }
  ],
  scalable: false,
  model: "procedural",
  summary: "Puente H para dos motores DC; los puentes de ENA/ENB y 5 V son ajustables.",
  keywords: ["l298n", "driver", "puente h", "motor", "controlador"]
};
var hcsr04 = {
  id: "hc-sr04",
  name: "Sensor HC-SR04",
  category: "sensor",
  dimensions: [mm(45), mm(20), mm(15)],
  dimensionsSource: "datasheet",
  massKg: 9e-3,
  pins: [pin("VCC", "VCC", [-mm(3.8), -mm(7), -mm(7.5)], "power-in", { electrical: { vMax: 5.5 } }), pin("TRIG", "TRIG", [-mm(1.3), -mm(7), -mm(7.5)], "digital"), pin("ECHO", "ECHO", [mm(1.3), -mm(7), -mm(7.5)], "digital"), pin("GND", "GND", [mm(3.8), -mm(7), -mm(7.5)], "ground")],
  anchors: [anchor("base", "Base", [0, -mm(10), 0], DOWN, "sensor-mount")],
  // Banco de pruebas controlado (etapa 4): la física con obstáculos llega en la etapa 5.
  props: [{ id: "testDistance", label: "Distancia de prueba (m) \u2014 banco controlado", type: "number", min: 0.02, max: 4, default: 0.3 }],
  scalable: false,
  model: "procedural",
  summary: "Mide distancia con ultrasonido (2\u2013400 cm).",
  keywords: ["hc-sr04", "ultrasonico", "ultrasonido", "distancia", "sensor", "trig", "echo"]
};
var motor = {
  id: "dc-motor-tt",
  name: "Motor DC TT",
  category: "actuator",
  dimensions: [mm(70), mm(22), mm(18)],
  dimensionsSource: "approximate",
  massKg: 0.03,
  pins: [pin("M+", "M+", [-mm(30), mm(4), -mm(9)], "motor"), pin("M-", "M\u2212", [-mm(30), -mm(4), -mm(9)], "motor")],
  anchors: [
    anchor("base", "Base", [0, mm(11), 0], UP, "motor-mount"),
    anchor("axle-r", "Eje derecho", [mm(42), 0, 0], [1, 0, 0], "axle", ["wheel-hub"]),
    anchor("axle-l", "Eje izquierdo", [-mm(42), 0, 0], [-1, 0, 0], "axle", ["wheel-hub"]),
    anchor("track-r", "Oruga derecha", [mm(42), 0, 0], [1, 0, 0], "slot-track-r", ["track-mount"]),
    anchor("track-l", "Oruga izquierda", [-mm(42), 0, 0], [-1, 0, 0], "slot-track-l", ["track-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Motor con reductora y doble eje para las ruedas.",
  keywords: ["motor", "dc", "tt", "reductora", "eje"]
};
var wheel = {
  id: "wheel-65",
  name: "Rueda 65 mm",
  category: "structure",
  dimensions: [mm(26), mm(65), mm(65)],
  dimensionsSource: "approximate",
  massKg: 0.03,
  pins: [],
  anchors: [anchor("hub", "Cubo", [0, 0, 0], [1, 0, 0], "wheel-hub")],
  scalable: false,
  model: "procedural",
  summary: "Rueda de goma de 65 mm para el eje del motor.",
  keywords: ["rueda", "llanta", "goma"]
};
var caster = {
  id: "caster-ball",
  name: "Rueda loca",
  category: "structure",
  dimensions: [mm(25), mm(43), mm(25)],
  dimensionsSource: "approximate",
  massKg: 0.01,
  pins: [],
  anchors: [anchor("base", "Base", [0, mm(21.5), 0], UP, "caster-mount")],
  scalable: false,
  model: "procedural",
  summary: "Esfera de apoyo libre, sin motor (con separador: su base toca el suelo con las ruedas de 65 mm).",
  keywords: ["rueda loca", "caster", "bola", "apoyo"]
};
var chassis = {
  id: "chassis-2wd",
  name: "Chasis 2WD",
  category: "structure",
  dimensions: [mm(140), mm(4), mm(210)],
  dimensionsSource: "approximate",
  massKg: 0.12,
  pins: [],
  props: [{ id: "color", label: "Acabado: placa acr\xEDlica azul o base blanca de oruga", type: "enum", options: ["azul", "oruga"], default: "azul" }],
  anchors: [
    anchor("combat-front", "Pala, cu\xF1a o defensa frontal", [0, 0, mm(105)], [0, 0, 1], "slot-combat", ["combat-mount"]),
    anchor("combat-sensor", "Sensor elevado para sumo", [0, mm(30), mm(45)], UP, "slot-combat-sensor", ["bracket-mount"]),
    anchor("combat-ir", "Sensores de borde para pala 4WD", [0, -mm(2), mm(95)], DOWN, "slot-combat-ir", ["line-support"]),
    anchor("motor-l", "Motor izquierdo", [-mm(62), -mm(2), -mm(20)], DOWN, "slot-motor", ["motor-mount"]),
    anchor("motor-r", "Motor derecho", [mm(62), -mm(2), -mm(20)], DOWN, "slot-motor", ["motor-mount"]),
    anchor("caster", "Rueda loca", [0, -mm(2), mm(85)], DOWN, "slot-caster", ["caster-mount"]),
    anchor("board-left", "Arduino lateral", [mm(-33), mm(2), mm(15)], UP, "slot-board-left", ["board-mount"]),
    anchor("breadboard", "Protoboard", [mm(32), mm(2), mm(10)], UP, "slot-breadboard", ["board-mount"]),
    anchor("driver-rear", "Driver posterior", [mm(-10), mm(2), mm(-70)], UP, "slot-driver-rear", ["driver-mount"]),
    anchor("regulator", "Regulador", [mm(44), mm(2), mm(-70)], UP, "slot-regulator", ["regulator-mount"]),
    anchor("switch", "Interruptor", [mm(-48), mm(2), mm(-75)], UP, "slot-switch", ["switch-mount"]),
    anchor("line-sensors", "Soporte infrarrojos", [0, -mm(2), mm(80)], DOWN, "slot-line-support", ["line-support"]),
    anchor("neck", "Cuello (servo)", [-mm(5.6), mm(2), mm(95)], UP, "slot-neck", ["sensor-mount"]),
    // el cuerno del servo queda justo en el eje central del robot
    anchor("torso", "Armaz\xF3n superior (torso)", [0, mm(2), -mm(5)], UP, "slot-torso", ["torso-mount"]),
    // Alternative mechanical layouts reuse the same parts; original anchors stay available.
    anchor("4wd-motor-rl", "Motor trasero izquierdo", [mm(-62), mm(-2), mm(-65)], DOWN, "slot-4wd-motor-rl", ["motor-mount"]),
    anchor("4wd-motor-rr", "Motor trasero derecho", [mm(62), mm(-2), mm(-65)], DOWN, "slot-4wd-motor-rr", ["motor-mount"]),
    anchor("4wd-motor-fl", "Motor delantero izquierdo", [mm(-62), mm(-2), mm(65)], DOWN, "slot-4wd-motor-fl", ["motor-mount"]),
    anchor("4wd-motor-fr", "Motor delantero derecho", [mm(62), mm(-2), mm(65)], DOWN, "slot-4wd-motor-fr", ["motor-mount"]),
    anchor("4wd-driver-a", "Driver posterior izquierdo", [mm(-30), mm(2), mm(-75)], UP, "slot-4wd-driver-a", ["driver-mount"]),
    anchor("4wd-driver-b", "Driver posterior derecho", [mm(30), mm(2), mm(-75)], UP, "slot-4wd-driver-b", ["driver-mount"]),
    anchor("4wd-regulator", "Regulador delantero", [mm(44), mm(2), mm(75)], UP, "slot-4wd-regulator", ["regulator-mount"]),
    anchor("4wd-switch", "Interruptor delantero", [mm(-48), mm(2), mm(75)], UP, "slot-4wd-switch", ["switch-mount"]),
    anchor("4wd-battery", "Bateria central inferior", [0, mm(-2), 0], DOWN, "slot-4wd-battery", ["battery-mount"]),
    anchor("tower-post-fl", "Columna delantera izquierda", [mm(-45), mm(2), mm(75)], UP, "slot-tower-post-fl", ["bracket-mount"]),
    anchor("tower-post-fr", "Columna delantera derecha", [mm(45), mm(2), mm(75)], UP, "slot-tower-post-fr", ["bracket-mount"]),
    anchor("tower-post-rl", "Columna trasera izquierda", [mm(-45), mm(2), mm(-75)], UP, "slot-tower-post-rl", ["bracket-mount"]),
    anchor("tower-post-rr", "Columna trasera derecha", [mm(45), mm(2), mm(-75)], UP, "slot-tower-post-rr", ["bracket-mount"]),
    anchor("tower-driver", "Driver del piso inferior", [0, mm(2), mm(-55)], UP, "slot-tower-driver", ["driver-mount"]),
    anchor("tower-regulator", "Regulador del piso inferior", [mm(45), mm(2), mm(-50)], UP, "slot-tower-regulator", ["regulator-mount"]),
    anchor("tower-switch", "Interruptor del piso inferior", [mm(-48), mm(2), mm(-45)], UP, "slot-tower-switch", ["switch-mount"]),
    anchor("tower-board", "Protoboard transversal", [0, mm(2), mm(10)], UP, "slot-tower-board", ["board-mount"]),
    anchor("sumo-motor-l", "Traccion delantera izquierda", [mm(-64), mm(-2), mm(45)], DOWN, "slot-sumo-motor-l", ["motor-mount"]),
    anchor("sumo-motor-r", "Traccion delantera derecha", [mm(64), mm(-2), mm(45)], DOWN, "slot-sumo-motor-r", ["motor-mount"]),
    anchor("sumo-caster", "Apoyo trasero", [0, mm(-2), mm(-85)], DOWN, "slot-sumo-caster", ["caster-mount"]),
    anchor("sumo-battery", "Bateria trasera inferior", [0, mm(-2), mm(-40)], DOWN, "slot-sumo-battery", ["battery-mount"]),
    anchor("sumo-uno", "Placa transversal trasera", [0, mm(2), mm(-75)], UP, "slot-sumo-uno", ["board-mount"]),
    anchor("sumo-board", "Protoboard transversal central", [0, mm(2), mm(-10)], UP, "slot-sumo-board", ["board-mount"]),
    anchor("sumo-driver", "Driver lateral delantero", [mm(-38), mm(2), mm(55)], UP, "slot-sumo-driver", ["driver-mount"]),
    anchor("sumo-regulator", "Regulador lateral", [mm(45), mm(2), mm(45)], UP, "slot-sumo-regulator", ["regulator-mount"]),
    anchor("sumo-switch", "Interruptor lateral", [mm(45), mm(2), mm(75)], UP, "slot-sumo-switch", ["switch-mount"]),
    anchor("sumo-ir", "Sensores adelantados", [0, mm(-2), mm(55)], DOWN, "slot-sumo-ir", ["line-support"]),
    anchor("sumo-post-l", "Defensa izquierda", [mm(-40), mm(-2), mm(90)], DOWN, "slot-sumo-post-l", ["bracket-mount"]),
    anchor("sumo-post-c", "Defensa central", [0, mm(-2), mm(90)], DOWN, "slot-sumo-post-c", ["bracket-mount"]),
    anchor("sumo-post-r", "Defensa derecha", [mm(40), mm(-2), mm(90)], DOWN, "slot-sumo-post-r", ["bracket-mount"]),
    anchor("stack-corner", "Apoyo de esquina para segundo piso", [-mm(45), -mm(2), -mm(75)], DOWN, "plate-mount"),
    anchor("board", "Placa", [0, mm(2), mm(40)], UP, "slot-board", ["board-mount"]),
    anchor("driver", "Driver", [0, mm(2), -mm(45)], UP, "slot-driver", ["driver-mount"]),
    anchor("battery", "Portapilas", [0, -mm(2), mm(30)], DOWN, "slot-battery", ["battery-mount"]),
    anchor("front", "Soporte frontal", [0, mm(2), mm(100)], UP, "slot-front", ["bracket-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Base de acr\xEDlico con anclajes para motores, placa, driver, portapilas y soporte.",
  keywords: ["chasis", "base", "acrilico", "2wd", "robot"]
};
var battery = {
  id: "battery-holder-4aa",
  name: "Portapilas 4\xD7AA",
  category: "power",
  dimensions: [mm(63), mm(16), mm(58)],
  dimensionsSource: "approximate",
  massKg: 0.08,
  // D-11 (resuelta con un supuesto): el voltaje es una propiedad editable. 4 pilas AA alcalinas ≈ 6 V; se corrige con el kit real.
  pins: [pin("B+", "Positivo (+)", [mm(-26), mm(8.5), mm(-27)], "power-out", { electrical: { vMax: 24, iMax: 2 } }), pin("B-", "Negativo (\u2212)", [mm(26), mm(8.5), mm(-27)], "ground")],
  props: [{ id: "voltage", label: "Voltaje (V) \u2014 supuesto de 4\xD7AA; verif\xEDcalo con el kit", type: "number", min: 1.5, max: 24, default: 6 }],
  anchors: [anchor("base", "Base", [0, mm(8), 0], UP, "battery-mount")],
  scalable: false,
  model: "procedural",
  summary: "Portapilas con terminales + y \u2212. Voltaje editable (por defecto 6 V, 4\xD7AA: supuesto a verificar con el kit).",
  keywords: ["portapilas", "bateria", "pilas", "aa", "alimentacion", "voltaje"]
};
var sensorBracket = {
  id: "sensor-bracket",
  name: "Soporte del sensor",
  category: "structure",
  dimensions: [mm(50), mm(30), mm(12)],
  dimensionsSource: "approximate",
  massKg: 0.01,
  pins: [],
  anchors: [anchor("base", "Base", [0, -mm(15), 0], DOWN, "bracket-mount"), anchor("sensor", "Sensor", [0, 0, mm(6)], [0, 0, 1], "slot-sensor", ["sensor-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Escuadra para fijar el HC-SR04 al frente del chasis.",
  keywords: ["soporte", "escuadra", "sensor", "bracket"]
};
var genericBracket = {
  id: "bracket-generic",
  name: "Soporte gen\xE9rico",
  category: "structure",
  dimensions: [mm(40), mm(20), mm(20)],
  dimensionsSource: "approximate",
  massKg: 8e-3,
  pins: [],
  anchors: [anchor("base", "Base", [0, -mm(10), 0], DOWN, "bracket-mount"), anchor("top", "Superior", [0, mm(10), 0], UP, "slot-generic", ["board-mount", "driver-mount", "battery-mount", "sensor-mount", "bracket-mount", "plate-mount"]), anchor("front-low", "Extension baja frontal", [0, mm(10), -mm(10)], UP, "slot-low-bumper", ["bracket-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Bloque para elevar o fijar cualquier placa o m\xF3dulo.",
  keywords: ["soporte", "separador", "bloque", "generico"]
};
var led = {
  id: "led-5mm",
  name: "LED 5 mm",
  category: "actuator",
  dimensions: [mm(5.8), mm(9), mm(5.8)],
  dimensionsSource: "approximate",
  massKg: 5e-4,
  pins: [pin("A", "\xC1nodo (+)", [-mm(1.27), -mm(4.5), 0], "signal"), pin("K", "C\xE1todo (\u2212)", [mm(1.27), -mm(4.5), 0], "signal")],
  props: [{ id: "color", label: "Color", type: "enum", options: ["rojo", "verde", "amarillo", "azul"], default: "rojo" }],
  anchors: [anchor("base", "Patas", [0, -mm(4.5), 0], DOWN, "led-mount")],
  scalable: false,
  model: "procedural",
  summary: "Diodo emisor de luz. Sin resistencia en serie se puede quemar.",
  keywords: ["led", "diodo", "luz", "indicador"]
};
var resistor = {
  id: "resistor",
  name: "Resistencia",
  category: "passive",
  dimensions: [mm(6.3), mm(2.4), mm(2.4)],
  dimensionsSource: "approximate",
  massKg: 2e-4,
  pins: [pin("P1", "Pata 1", [-mm(4.5), 0, 0], "signal"), pin("P2", "Pata 2", [mm(4.5), 0, 0], "signal")],
  props: [{ id: "ohms", label: "Resistencia (\u03A9)", type: "number", min: 1, max: 1e6, default: 220 }],
  anchors: [anchor("base", "Apoyo", [0, -mm(1.2), 0], DOWN, "resistor-mount")],
  scalable: false,
  model: "procedural",
  summary: "Resistencia de 1/4 W; por defecto 220 \u03A9, la de un LED con 5 V.",
  keywords: ["resistencia", "resistor", "ohm", "pasivo"]
};
var breadboardPins = [];
var breadboardColumns = [-13.97, -11.43, -8.89, -6.35, -3.81, 3.81, 6.35, 8.89, 11.43, 13.97];
for (let row = 1; row <= 30; row++) {
  for (let col = 0; col < 10; col++) {
    const id = `${"ABCDEFGHIJ"[col]}${row}`;
    breadboardPins.push(pin(id, id, [mm(breadboardColumns[col]), mm(4.65), mm((row - 15.5) * 2.54)], "signal", { internalNet: `${col < 5 ? "left" : "right"}-${row}` }));
  }
}
for (const [side, sign, x] of [["L", "+", -22.86], ["L", "-", -20.32], ["R", "+", 20.32], ["R", "-", 22.86]]) {
  for (let n = 1; n <= 25; n++) {
    const id = `${side}${sign}${n}`;
    const z = -35.56 + (n - 1 + Math.floor((n - 1) / 5)) * 2.54;
    breadboardPins.push(pin(id, `${side === "L" ? "Izq." : "Der."} ${sign} ${n}`, [mm(x), mm(4.65), mm(z)], "signal", { internalNet: `rail-${side}-${sign}` }));
  }
}
var breadboard = {
  id: "breadboard-400",
  name: "Protoboard 400 puntos",
  category: "passive",
  dimensions: [mm(55), mm(9.3), mm(82.6)],
  dimensionsSource: "approximate",
  massKg: 0.038,
  pins: breadboardPins,
  anchors: [anchor("base", "Base adhesiva", [0, -mm(4.65), 0], DOWN, "board-mount"), anchor("indicator", "LED filas 20\u201321", [-mm(13.97), mm(4.65), mm(12.7)], UP, "slot-led", ["led-mount"]), anchor("resistor", "Resistencia filas 21\u201325", [-mm(8.89), mm(4.65), mm(19.05)], UP, "slot-resistor", ["resistor-mount"])],
  scalable: false,
  model: "procedural",
  summary: "400 puntos: A\u2013E y F\u2013J unidos por fila, separados por el canal central. Cuatro rieles continuos de 25 puntos, aislados entre s\xED; +/\u2212 no alimentan por s\xED solos.",
  keywords: ["protoboard", "breadboard", "placa de pruebas", "400", "riel", "orificios", "sin soldadura"]
};
var irSensor = {
  id: "tcrt5000-module",
  name: "Sensor de l\xEDnea TCRT5000",
  category: "sensor",
  dimensions: [mm(12), mm(8), mm(32)],
  dimensionsSource: "approximate",
  massKg: 4e-3,
  pins: [pin("VCC", "VCC", [-mm(2.54), mm(4), -mm(13)], "power-in", { electrical: { vMax: 5.5 } }), pin("GND", "GND", [0, mm(4), -mm(13)], "ground"), pin("DO", "DO", [mm(2.54), mm(4), -mm(13)], "digital")],
  anchors: [anchor("base", "Fijaci\xF3n superior", [0, mm(4), 0], UP, "ir-mount")],
  props: [{ id: "activeLow", label: "Salida baja sobre negro (invertir polaridad)", type: "boolean", default: false }, { id: "testBlack", label: "Negro en banco de pruebas (sin f\xEDsica)", type: "boolean", default: false }],
  scalable: false,
  model: "procedural",
  summary: "Sensor reflectivo digital mirando al suelo. Requiere 5 V y GND; DO cambia sobre la pista. Negro = HIGH por defecto; polaridad invertible.",
  keywords: ["infrarrojo", "ir", "linea", "tcrt5000", "reflectancia", "seguidor"]
};
var servoSg90 = {
  id: "servo-sg90",
  name: "Servo SG90",
  category: "actuator",
  dimensions: [mm(32.5), mm(22.7), mm(12)],
  dimensionsSource: "approximate",
  massKg: 9e-3,
  pins: [pin("SIG", "Se\xF1al", [-mm(18), -mm(4), -mm(2.54)], "pwm"), pin("VCC", "VCC", [-mm(18), -mm(4), 0], "power-in", { electrical: { vMax: 6 } }), pin("GND", "GND", [-mm(18), -mm(4), mm(2.54)], "ground")],
  anchors: [anchor("base", "Base", [0, -mm(11.35), 0], DOWN, "sensor-mount"), anchor("horn", "Cuerno (gira lo que le pongas encima)", [mm(5.6), mm(16.6), 0], UP, "slot-servo-horn", ["neck-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Gira a un \xE1ngulo de 0\xB0 a 180\xB0 seg\xFAn el ancho del pulso de la se\xF1al (0,54\u20132,4 ms cada 20 ms). Necesita 5 V y GND; usa la biblioteca Servo.",
  keywords: ["servo", "sg90", "servomotor", "angulo", "brazo", "garra", "pwm", "actuador"]
};
var oled = {
  id: "oled-ssd1306",
  name: 'Pantalla OLED 2,42" I\xB2C',
  category: "actuator",
  dimensions: [mm(66), mm(4.5), mm(41)],
  dimensionsSource: "approximate",
  massKg: 0.012,
  pins: [
    pin("GND", "GND", [-mm(3.81), mm(2.5), -mm(17.5)], "ground"),
    pin("VCC", "VCC", [-mm(1.27), mm(2.5), -mm(17.5)], "power-in", { electrical: { vMax: 5.5 } }),
    pin("SCL", "SCL", [mm(1.27), mm(2.5), -mm(17.5)], "digital"),
    pin("SDA", "SDA", [mm(3.81), mm(2.5), -mm(17.5)], "digital")
  ],
  anchors: [anchor("base", "Base", [0, -mm(2.25), 0], DOWN, "sensor-mount")],
  props: [{ id: "address", label: "Direcci\xF3n I\xB2C (60 = 0x3C, 61 = 0x3D)", type: "number", min: 60, max: 61, default: 60 }],
  scalable: false,
  model: "procedural",
  summary: "Pantalla de 128 \xD7 64 p\xEDxeles y 2,42 pulgadas (la versi\xF3n grande del SSD1306: sirve para una cara con ojos y boca). En el Arduino UNO el I\xB2C usa A4 (SDA) y A5 (SCL). Se programa con Adafruit_SSD1306 y Adafruit_GFX: lo que dibujas se ve en la pantalla.",
  keywords: ["pantalla", "oled", "display", "ssd1306", "i2c", "cara", "ojos", "boca", "adafruit", "wire", "2.42"]
};
var pushButton = {
  id: "push-button-6mm",
  name: "Pulsador",
  category: "sensor",
  dimensions: [mm(12), mm(8), mm(12)],
  dimensionsSource: "approximate",
  massKg: 3e-3,
  pins: [pin("P1", "Terminal 1", [-mm(3.5), mm(2), -mm(5.5)], "digital"), pin("P2", "Terminal 2", [mm(3.5), mm(2), -mm(5.5)], "digital")],
  anchors: [anchor("base", "Base", [0, -mm(4), 0], DOWN, "sensor-mount")],
  props: [{ id: "pressed", label: "Pulsado al iniciar la simulaci\xF3n", type: "boolean", default: false }],
  scalable: false,
  model: "procedural",
  summary: "Al pulsarlo (bot\xF3n \xABPulsar\xBB del panel Estado o la tecla Espacio) une sus dos terminales. Con\xE9ctalo entre un pin y GND y usa pinMode(pin, INPUT_PULLUP): pulsado = LOW.",
  keywords: ["pulsador", "boton", "button", "interruptor", "entrada", "digital", "pullup"]
};
var potentiometer = {
  id: "potentiometer-10k",
  name: "Potenci\xF3metro 10 k\u03A9",
  category: "sensor",
  dimensions: [mm(18), mm(16), mm(18)],
  dimensionsSource: "approximate",
  massKg: 6e-3,
  pins: [pin("VCC", "Extremo 1 (VCC)", [-mm(5), -mm(5), -mm(8)], "power-in", { electrical: { vMax: 5.5 } }), pin("OUT", "Cursor (OUT)", [0, -mm(5), -mm(8)], "analog"), pin("GND", "Extremo 2 (GND)", [mm(5), -mm(5), -mm(8)], "ground")],
  anchors: [anchor("base", "Base", [0, -mm(8), 0], DOWN, "sensor-mount")],
  props: [{ id: "position", label: "Posici\xF3n inicial del cursor (0\u20131)", type: "number", min: 0, max: 1, default: 0.5 }],
  scalable: false,
  model: "procedural",
  summary: "Divisor de tensi\xF3n ajustable con el deslizador del panel Estado. Extremos a 5 V y GND, cursor a una entrada anal\xF3gica (A0\u2013A5): analogRead da 0\u20131023.",
  keywords: ["potenciometro", "pot", "perilla", "analogico", "analogread", "divisor", "tension", "resistencia variable"]
};
var robotHead = {
  id: "robot-head",
  name: "Cabeza del robot",
  category: "structure",
  dimensions: [mm(104), mm(78), mm(78)],
  dimensionsSource: "approximate",
  massKg: 0.08,
  pins: [],
  anchors: [
    anchor("base", "Cuello (al cuerno del servo)", [0, -mm(39), 0], DOWN, "neck-mount"),
    anchor("screen", "Pantalla (cara)", [0, mm(2), mm(39)], [0, 0, 1], "slot-head-screen", ["sensor-mount"]),
    anchor("visor", "Visor del radar", [0, mm(39), mm(12)], UP, "slot-head-visor", ["sensor-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Carcasa redondeada de 104 \xD7 78 \xD7 78 mm con el marco de la pantalla al frente y un soporte arriba para el HC-SR04. Gira con el servo del cuello: la cara y el radar miran hacia donde gira.",
  keywords: ["cabeza", "cara", "cuello", "robot", "radar", "carcasa", "oruga"]
};
var trackSprocket = {
  id: "track-sprocket",
  name: "Rueda motriz de oruga",
  category: "structure",
  dimensions: [mm(22), mm(65), mm(65)],
  dimensionsSource: "approximate",
  massKg: 0.035,
  pins: [],
  anchors: [anchor("hub", "Cubo", [0, 0, 0], [1, 0, 0], "wheel-hub")],
  scalable: false,
  model: "procedural",
  summary: "Rueda dentada de 65 mm que va en el eje del motor. Empuja al robot; la banda de la oruga se apoya sobre ella.",
  keywords: ["oruga", "rueda motriz", "sprocket", "dentada", "tanque"]
};
var trackBelt = {
  id: "track-belt",
  name: "Banda de oruga",
  category: "structure",
  dimensions: [mm(26), mm(65), mm(160)],
  dimensionsSource: "approximate",
  massKg: 0.045,
  pins: [],
  anchors: [anchor("base", "Fijaci\xF3n al motor", [0, 0, 0], [1, 0, 0], "track-mount")],
  scalable: false,
  model: "procedural",
  summary: "Banda de 160 mm con dientes que rodea la rueda motriz. En la simulaci\xF3n desliza sobre el suelo y el robot avanza por la rueda motriz: se comporta como un robot de dos ruedas con patines largos.",
  keywords: ["oruga", "banda", "cadena", "tanque", "patin"]
};
var robotTorso = {
  id: "robot-torso",
  name: "Cuerpo humanoide del robot",
  category: "structure",
  dimensions: [mm(224), mm(162), mm(150)],
  dimensionsSource: "approximate",
  massKg: 0.1,
  pins: [],
  anchors: [
    anchor("base", "Base (al chasis)", [0, -mm(81), 0], DOWN, "torso-mount"),
    anchor("neck", "Cuello (servo) arriba", [-mm(5.6), mm(81), mm(10)], UP, "slot-neck-top", ["sensor-mount"]),
    anchor("shoulder-l", "Hombro izquierdo (servo)", [mm(118), mm(59), mm(8)], [1, 0, 0], "slot-shoulder-l", ["sensor-mount"]),
    anchor("shoulder-r", "Hombro derecho (servo)", [-mm(118), mm(59), mm(8)], [-1, 0, 0], "slot-shoulder-r", ["sensor-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Cuerpo humanoide de 162 mm: vientre de vidrio ahumado (la electr\xF3nica del chasis se ve por dentro), cintura, pecho que se ensancha hacia unos hombros anchos y cuello. Arriba lleva la cabeza y, en los extremos de la barra de hombros, los servos de los hombros: as\xED los brazos cuelgan por fuera de las orugas.",
  keywords: ["torso", "cuerpo", "carcasa", "armazon", "estructura", "robot", "hombro", "vidrio"]
};
var robotArm = {
  id: "robot-arm",
  name: "Brazo del robot",
  category: "structure",
  dimensions: [mm(32), mm(84), mm(36)],
  dimensionsSource: "approximate",
  massKg: 0.05,
  pins: [],
  anchors: [
    anchor("base", "Hombro (al cuerno del servo)", [0, mm(42), 0], UP, "neck-mount"),
    anchor("elbow-l", "Codo (servo) del brazo izquierdo", [mm(28), -mm(38), 0], [1, 0, 0], "slot-elbow-l", ["sensor-mount"]),
    anchor("elbow-r", "Codo (servo) del brazo derecho", [-mm(28), -mm(38), 0], [-1, 0, 0], "slot-elbow-r", ["sensor-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Brazo de 84 mm con hombro azul. Cuelga del cuerno del servo del hombro (a 90\xB0 queda recto) y lleva en su extremo el servo del codo, que mueve el antebrazo.",
  keywords: ["brazo", "hombro", "robot", "codo", "saludar"]
};
var robotForearm = {
  id: "robot-forearm",
  name: "Antebrazo del robot",
  category: "structure",
  dimensions: [mm(28), mm(86), mm(24)],
  dimensionsSource: "approximate",
  massKg: 0.04,
  pins: [],
  anchors: [
    anchor("base", "Codo (al cuerno del servo)", [0, mm(43), 0], UP, "neck-mount"),
    anchor("wrist", "Mu\xF1eca (pinza)", [0, -mm(43), 0], DOWN, "slot-wrist", ["claw-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Antebrazo de 86 mm, proporcionado al brazo: cuelga del cuerno del servo del codo y lleva la pinza en la mu\xF1eca.",
  keywords: ["antebrazo", "codo", "brazo", "robot", "mu\xF1eca"]
};
var robotClaw = {
  id: "robot-claw",
  name: "Pinza del robot",
  category: "actuator",
  dimensions: [mm(34), mm(36), mm(40)],
  dimensionsSource: "approximate",
  massKg: 0.04,
  pins: [],
  anchors: [
    anchor("base", "Mu\xF1eca (al antebrazo)", [0, mm(18), 0], UP, "claw-mount"),
    anchor("servo", "Servo de la pinza (al frente)", [0, mm(18), mm(26)], UP, "slot-claw-servo", ["sensor-mount"])
  ],
  props: [],
  scalable: false,
  model: "procedural",
  summary: "Pinza de dos dedos paralelos. Su servo la abre y la cierra: a 0\xB0 est\xE1 muy abierta (64 mm) y a 90\xB0 casi cerrada (19 mm). Un objeto movible que quede entre los dedos con la separaci\xF3n justa se agarra y se lleva.",
  keywords: ["pinza", "garra", "mano", "agarrar", "recoger", "dedos", "robot"]
};
var lineSupport = {
  id: "ir-double-bracket",
  name: "Soporte doble infrarrojo",
  category: "structure",
  dimensions: [mm(56), mm(34), mm(34)],
  dimensionsSource: "approximate",
  massKg: 0.012,
  pins: [],
  anchors: [anchor("base", "Fijaci\xF3n al chasis", [0, mm(17), 0], UP, "line-support"), anchor("left", "Sensor izquierdo", [-mm(18), -mm(17), 0], DOWN, "slot-ir-left", ["ir-mount"]), anchor("right", "Sensor derecho", [mm(18), -mm(17), 0], DOWN, "slot-ir-right", ["ir-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Separadores y travesa\xF1o para dos sensores de l\xEDnea bajo el frente del chasis.",
  keywords: ["soporte", "infra", "separador", "linea"]
};
var powerSwitch = {
  id: "power-switch",
  name: "Interruptor general",
  category: "power",
  dimensions: [mm(14), mm(16), mm(24)],
  dimensionsSource: "approximate",
  massKg: 6e-3,
  pins: [pin("IN", "Entrada", [0, -mm(7), -mm(8)], "signal"), pin("OUT", "Salida", [0, -mm(7), mm(8)], "signal")],
  anchors: [anchor("base", "Fijaci\xF3n", [0, -mm(8), 0], DOWN, "switch-mount")],
  props: [{ id: "closed", label: "Encendido", type: "boolean", default: true }],
  scalable: false,
  model: "procedural",
  summary: "Contacto SPST: encendido une IN y OUT; apagado corta la alimentaci\xF3n. C\xE1mbialo en Propiedades con la simulaci\xF3n detenida.",
  keywords: ["interruptor", "encendido", "apagado", "switch"]
};
var regulator = {
  id: "regulator-5v",
  name: "Regulador 5 V buck-boost",
  category: "power",
  dimensions: [mm(20), mm(12), mm(28)],
  dimensionsSource: "approximate",
  massKg: 5e-3,
  pins: [pin("VIN", "VIN", [-mm(7), mm(5), -mm(9)], "power-in", { electrical: { vMax: 11.8 } }), pin("GND", "GND", [-mm(7), mm(5), mm(9)], "ground"), pin("5V", "5V", [mm(7), mm(5), -mm(9)], "power-out", { electrical: { vMax: 5, iMax: 0.5 } }), pin("GND.OUT", "GND salida", [mm(7), mm(5), mm(9)], "ground", { internalNet: "GND" })],
  anchors: [anchor("base", "Base", [0, -mm(6), 0], DOWN, "regulator-mount")],
  scalable: false,
  model: "procedural",
  summary: "Modelo did\xE1ctico buck-boost: entrada 2,7\u201311,8 V, salida regulada de 5 V. Alimenta la l\xF3gica; los motores van al driver.",
  keywords: ["regulador", "5v", "buck", "boost", "alimentacion"]
};
regulator.pins.find((p) => p.id === "GND").internalNet = "GND";
var arm = {
  id: "educational-arm-e6",
  name: "Brazo educativo \xB7 referencia E6",
  category: "actuator",
  dimensions: [0.162, 0.103, 0.12],
  dimensionsSource: "approximate",
  massKg: 7.2,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  summary: "Modelo mec\xE1nico oficial E6: seis articulaciones, Jog, MovJ/MovL, ense\xF1anza de puntos y pinza de pr\xE1ctica. Simulaci\xF3n local sin equipo conectado.",
  keywords: ["brazo", "robot", "dobot", "e6", "pinza", "articulacion"]
};
var practiceBlock = {
  id: "arm-practice-block",
  name: "Pieza de pr\xE1ctica \xB7 50 g",
  category: "structure",
  dimensions: [0.035, 0.035, 0.035],
  dimensionsSource: "approximate",
  massKg: 0.05,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  props: [{ id: "massKg", label: "Masa de la pieza (kg)", type: "number", min: 1e-3, max: 2, default: 0.05 }, ...["R", "G", "B"].map((channel, i) => ({ id: `surface${channel}`, label: `Superficie \xB7 canal ${channel} (0\u2013255)`, type: "number", min: 0, max: 255, default: [220, 150, 55][i] }))],
  summary: "Cubo manipulable con la pinza del brazo educativo.",
  keywords: ["pieza", "cubo", "brazo", "carga"]
};
var dropZone = {
  id: "arm-drop-zone",
  name: "Zona de entrega",
  category: "structure",
  dimensions: [0.12, 4e-3, 0.12],
  dimensionsSource: "approximate",
  massKg: 0.01,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  summary: "Objetivo azul para depositar la pieza de pr\xE1ctica.",
  keywords: ["zona", "entrega", "brazo"]
};
var CATALOG = [chassis, motor, wheel, caster, arduino, l298n, hcsr04, battery, sensorBracket, genericBracket, led, resistor, breadboard, irSensor, servoSg90, oled, robotHead, trackSprocket, trackBelt, robotTorso, robotArm, robotForearm, robotClaw, pushButton, potentiometer, lineSupport, powerSwitch, regulator, arm, practiceBlock, dropZone, ...COMBAT_DEFINITIONS, conveyorDefinition];
var byId = new Map(CATALOG.map((d) => [d.id, d]));
var getDefinition = (id) => byId.get(id);
var definitionIds = new Set(CATALOG.map((d) => d.id));
var catalogShape = new Map(CATALOG.map((d) => [d.id, { pins: new Set(d.pins.map((p) => p.id)), anchors: new Set(d.anchors.map((a) => a.id)) }]));

// src/robotics/project/types.ts
var ROBOTICS_FORMAT = "modo-robotica";
var ROBOTICS_VERSION = 1;
var LIMITS = {
  projects: 30,
  parts: 200,
  attachments: 400,
  connections: 1e3,
  firmware: 8,
  obstacles: 100,
  sketchBytes: 64 * 1024,
  hexBytes: 256 * 1024,
  name: 100,
  label: 60,
  importBytes: 2 * 1024 * 1024,
  history: 50
};

// src/robotics/project/defaults.ts
var IDENTITY = { position: [0, 0, 0], rotation: [0, 0, 0, 1] };
var newId = () => globalThis.crypto.randomUUID();
function newRobotProject(name = "Robot sin nombre", now = (/* @__PURE__ */ new Date()).toISOString()) {
  return {
    format: ROBOTICS_FORMAT,
    version: ROBOTICS_VERSION,
    id: newId(),
    name,
    createdAt: now,
    updatedAt: now,
    parts: [],
    attachments: [],
    connections: [],
    firmware: [],
    scene: { obstacles: [], robotStart: { ...IDENTITY, position: [0, 0, 0] }, physics: { gravity: 9.81, friction: 0.7 } },
    workspace: { mode: "build" }
  };
}

// src/robotics/project/math.ts
var Q_IDENTITY = [0, 0, 0, 1];
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
var sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var len = (a) => Math.hypot(a[0], a[1], a[2]);
var dist = (a, b) => len(sub(a, b));
var cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var qMul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];
var qNorm = (q) => {
  const n = Math.hypot(...q) || 1;
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
};
var qRotate = (q, v) => {
  const [x, y, z, w] = q, [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
};
var tIdentity = () => ({ position: [0, 0, 0], rotation: Q_IDENTITY });
var tMul = (a, b) => ({ position: add(a.position, qRotate(a.rotation, b.position)), rotation: qNorm(qMul(a.rotation, b.rotation)) });
var tPoint = (t, p) => add(t.position, qRotate(t.rotation, p));
var motion = (dp, q = Q_IDENTITY, center = [0, 0, 0]) => ({ position: add(sub(center, qRotate(q, center)), dp), rotation: q });
var DEG = Math.PI / 180;

// src/robotics/project/commands.ts
var part = (p, id) => p.parts.find((x) => x.instanceId === id);
var replaceParts = (p, parts) => ({ ...p, parts });
function closure(p, ids) {
  const out = new Set(ids);
  let grew = true;
  while (grew) {
    grew = false;
    for (const a of p.attachments) if (out.has(a.parent.instanceId) && !out.has(a.child.instanceId)) {
      out.add(a.child.instanceId);
      grew = true;
    }
  }
  return out;
}
var parentAttachment = (p, id) => p.attachments.find((a) => a.child.instanceId === id);
function nextLabel(p, definitionName) {
  const taken = new Set(p.parts.map((x) => x.label));
  for (let n = 1; ; n++) {
    const label = `${definitionName} ${n}`;
    if (!taken.has(label)) return label;
  }
}
function addPart(p, definitionId, position = [0, 0, 0], rotation = [0, 0, 0, 1]) {
  const def = getDefinition(definitionId);
  if (!def) return { error: `La pieza \xAB${definitionId}\xBB no existe en el cat\xE1logo.` };
  if (p.parts.length >= LIMITS.parts) return { error: `Un proyecto admite hasta ${LIMITS.parts} piezas.` };
  const props = def.props ? Object.fromEntries(def.props.map((x) => [x.id, x.default])) : void 0;
  const instance = { instanceId: newId(), definitionId, label: nextLabel(p, def.name), transform: { position, rotation: qNorm(rotation) }, ...props ? { props } : {} };
  return { project: replaceParts(p, [...p.parts, instance]), notes: [] };
}
function removeParts(p, ids) {
  const gone = new Set(ids.filter((id) => part(p, id) && !part(p, id).locked));
  const notes = [];
  if (ids.length > gone.size) notes.push("Las piezas bloqueadas no se borran. Desbloqu\xE9alas primero.");
  const lostAttachments = p.attachments.filter((a) => gone.has(a.parent.instanceId) || gone.has(a.child.instanceId));
  const lostConnections = p.connections.filter((c) => gone.has(c.a.instanceId) || gone.has(c.b.instanceId));
  const lostFirmware = p.firmware.filter((f) => gone.has(f.targetInstanceId));
  if (lostAttachments.length) notes.push(`Se rompieron ${lostAttachments.length} uni\xF3n(es) mec\xE1nica(s).`);
  if (lostConnections.length) notes.push(`Se quitaron ${lostConnections.length} cable(s).`);
  if (lostFirmware.length) notes.push("Se quit\xF3 el programa de la placa borrada.");
  const lostArmProgram = p.armProgram && (gone.has(p.armProgram.armId) || p.armProgram.points.some((point) => point.expectedHeld && gone.has(point.expectedHeld)));
  if (lostArmProgram) notes.push("Se quit\xF3 el programa del brazo porque se borr\xF3 una pieza requerida. Puedes preparar un ciclo nuevo.");
  return {
    project: { ...p, ...lostArmProgram ? { armProgram: void 0 } : {}, parts: p.parts.filter((x) => !gone.has(x.instanceId)).map((x) => typeof x.props?.held === "string" && gone.has(x.props.held) ? { ...x, props: { ...x.props, held: "", gripperOpen: true } } : x), attachments: p.attachments.filter((a) => !lostAttachments.includes(a)), connections: p.connections.filter((c) => !lostConnections.includes(c)), firmware: p.firmware.filter((f) => !lostFirmware.includes(f)) },
    notes
  };
}
function moveParts(p, ids, m) {
  const notes = [];
  const movable = ids.filter((id) => part(p, id) && !part(p, id).locked);
  if (movable.length < ids.length) notes.push("Las piezas bloqueadas no se mueven.");
  const moving = closure(p, movable);
  const broken = p.attachments.filter((a) => moving.has(a.child.instanceId) && !moving.has(a.parent.instanceId));
  for (const a of broken) notes.push(`${part(p, a.child.instanceId)?.label} se separ\xF3 de ${part(p, a.parent.instanceId)?.label}.`);
  return {
    project: { ...replaceParts(p, p.parts.map((x) => moving.has(x.instanceId) ? { ...x, transform: tMul(m, x.transform) } : x)), attachments: p.attachments.filter((a) => !broken.includes(a)) },
    notes
  };
}
var renamePart = (p, id, label) => replaceParts(p, p.parts.map((x) => x.instanceId === id ? { ...x, label: label.slice(0, LIMITS.label) || x.label } : x));
var setPartProp = (p, id, key, value) => replaceParts(p, p.parts.map((x) => x.instanceId === id ? { ...x, props: { ...x.props, [key]: value } } : x));
var anchorOf = (instance, anchorId) => getDefinition(instance.definitionId)?.anchors.find((a) => a.id === anchorId);
function anchorWorld(instance, anchorId) {
  const a = anchorOf(instance, anchorId);
  return a ? { position: tPoint(instance.transform, a.position), normal: qRotate(instance.transform.rotation, a.normal) } : void 0;
}
var hosts = (host, guest) => host.accepts.includes(guest.tag);
function attach(p, parent, child, kind) {
  const pp = part(p, parent.instanceId), cc = part(p, child.instanceId);
  if (!pp || !cc) return { error: "La pieza ya no existe." };
  if (pp.instanceId === cc.instanceId) return { error: "Una pieza no se une a s\xED misma." };
  const pa = anchorOf(pp, parent.anchorId), ca = anchorOf(cc, child.anchorId);
  if (!pa || !ca) return { error: "Ese anclaje no existe." };
  if (!hosts(pa, ca)) return { error: `\xAB${ca.label}\xBB de ${cc.label} no encaja en \xAB${pa.label}\xBB de ${pp.label}.` };
  if (parentAttachment(p, cc.instanceId)) return { error: `${cc.label} ya est\xE1 unida a otra pieza. Sep\xE1rala primero.` };
  if (p.attachments.some((a) => a.parent.instanceId === pp.instanceId && a.parent.anchorId === parent.anchorId)) return { error: `\xAB${pa.label}\xBB de ${pp.label} ya est\xE1 ocupado.` };
  if (closure(p, [cc.instanceId]).has(pp.instanceId)) return { error: "No se pueden unir en c\xEDrculo." };
  if (p.attachments.length >= LIMITS.attachments) return { error: `Un proyecto admite hasta ${LIMITS.attachments} uniones.` };
  if (cc.locked) return { error: `${cc.label} est\xE1 bloqueada.` };
  const wanted = anchorWorld(pp, parent.anchorId).position, have = anchorWorld(cc, child.anchorId).position;
  const moved = moveParts(p, [cc.instanceId], motion(sub(wanted, have)));
  const isWheel = getDefinition(cc.definitionId)?.anchors.find((a) => a.id === child.anchorId)?.tag === "wheel-hub";
  const attachment = { id: newId(), kind: kind ?? (isWheel ? "wheel-hinge" : "rigid"), parent, child, ...(kind ?? (isWheel ? "wheel-hinge" : "rigid")) === "wheel-hinge" ? { axis: pa.normal } : {} };
  return { project: { ...moved.project, attachments: [...moved.project.attachments, attachment] }, notes: moved.notes };
}
var detach = (p, attachmentId) => ({ ...p, attachments: p.attachments.filter((a) => a.id !== attachmentId) });
function part_(p, id) {
  return p.parts.find((x) => x.instanceId === id);
}
var pairKey = (a, b) => [`${a.instanceId}:${a.pinId}`, `${b.instanceId}:${b.pinId}`].sort().join("|");
function connect(p, a, b, color = "#d64545") {
  const pa = part_(p, a.instanceId), pb = part_(p, b.instanceId);
  if (!pa || !pb) return { error: "La pieza ya no existe." };
  if (!getDefinition(pa.definitionId)?.pins.some((x) => x.id === a.pinId) || !getDefinition(pb.definitionId)?.pins.some((x) => x.id === b.pinId)) return { error: "Ese pin no existe." };
  if (a.instanceId === b.instanceId && a.pinId === b.pinId) return { error: "Un cable no puede empezar y terminar en el mismo pin." };
  if (p.connections.some((c) => pairKey(c.a, c.b) === pairKey(a, b))) return { error: "Esos dos pines ya est\xE1n unidos por un cable." };
  if (p.connections.length >= LIMITS.connections) return { error: `Un proyecto admite hasta ${LIMITS.connections} cables.` };
  return { project: { ...p, connections: [...p.connections, { id: newId(), a: { instanceId: a.instanceId, pinId: a.pinId }, b: { instanceId: b.instanceId, pinId: b.pinId }, color }] }, notes: [] };
}
var SKETCH_TEMPLATE = `// Programa para el Arduino UNO.
void setup() {
  // Se ejecuta una sola vez al encender.
}

void loop() {
  // Se repite sin parar.
}
`;
var firmwareOf = (p, targetId) => p.firmware.find((f) => f.targetInstanceId === targetId);
function ensureFirmware(p, targetId) {
  if (!part_(p, targetId) || firmwareOf(p, targetId) || p.firmware.length >= LIMITS.firmware) return p;
  return { ...p, firmware: [...p.firmware, { id: newId(), targetInstanceId: targetId, board: "arduino-uno-r3", source: SKETCH_TEMPLATE, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }] };
}
function setFirmwareArtifact(p, targetId, artifact) {
  const base = ensureFirmware(p, targetId);
  return { ...base, firmware: base.firmware.map((f) => f.targetInstanceId === targetId ? { ...f, artifact } : f) };
}

// src/robotics/mcu/sha256.ts
var K = Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var rotr = (x, n) => x >>> n | x << 32 - n;
function sha256(text) {
  const data = new TextEncoder().encode(text), bitLen = data.length * 8;
  const padded = new Uint8Array(data.length + 9 + 63 >> 6 << 6);
  padded.set(data);
  padded[data.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 2 ** 32));
  view.setUint32(padded.length - 4, bitLen >>> 0);
  const h = Uint32Array.from([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]), w = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ w[i - 15] >>> 3, s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + (e & f ^ ~e & g) + K[i] + w[i] | 0, t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + (a & b ^ a & c ^ b & c) | 0;
      hh = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
    h[4] += e;
    h[5] += f;
    h[6] += g;
    h[7] += hh;
  }
  return Array.from(h, (x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
}

// src/robotics/mcu/compiler/state.ts
var hashSource = sha256;

// src/robotics/project/avoidSketch.ts
var AVOID_SKETCH = "// Evitar obst\xE1culos: avanza; si el HC-SR04 ve algo a menos de 20 cm, gira a la derecha un momento.\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor: TRIG=D9, ECHO=D10.\nlong distanciaCm() {\n  digitalWrite(9, LOW); delayMicroseconds(2); digitalWrite(9, HIGH); delayMicroseconds(10); digitalWrite(9, LOW);\n  unsigned long us = pulseIn(10, HIGH, 25000UL);\n  if (us == 0) return 400;\n  return us / 58;\n}\nvoid motores(bool izqAdelante, bool derAdelante, int fuerza) {\n  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);\n  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);\n  analogWrite(5, fuerza); analogWrite(6, fuerza);\n}\nvoid setup() { pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT); pinMode(9, OUTPUT); pinMode(10, INPUT); }\nvoid loop() {\n  if (distanciaCm() < 20) { motores(true, false, 200); delay(400); }\n  else motores(true, true, 200);\n  delay(30);\n}\n";
var AVOID_HEX = ":100000000C9461000C9473000C9473000C947300B6\n:100010000C9473000C9473000C9473000C94730094\n:100020000C9473000C9473000C9473000C94730084\n:100030000C9473000C9473000C9473000C94730074\n:100040000C94B6010C9473000C9473000C94730020\n:100050000C9473000C9473000C9473000C94730054\n:100060000C9473000C947300000000002300260021\n:10007000290000000000240027002A0000000000E2\n:10008000250028002B0004040404040404040202D4\n:100090000202020203030303030301020408102007\n:1000A0004080010204081020010204081020000012\n:1000B0000008000201000003040700000000000027\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\n:1000E00045020C9404030C94000090E0FC01E255DE\n:1000F000FF4F2491FC01E656FF4F3491FC01EA5773\n:10010000FF4FE491EE23C9F0222339F0233001F1AF\n:10011000A8F4213019F1223029F1F0E0EE0FFF1F91\n:10012000E458FF4FA591B4918FB7F894EC91611109\n:1001300026C030953E233C938FBF08952730A9F009\n:100140002830C9F0243049F7809180008F7D03C0AA\n:10015000809180008F7780938000DFCF84B58F7788\n:1001600084BDDBCF84B58F7DFBCF8091B0008F77CE\n:100170008093B000D2CF8091B0008F7DF9CF3E2B1D\n:10018000DACFCF93DF9390E0FC01E656FF4F249146\n:100190008A579F4FFC0184918823D1F090E0880F0B\n:1001A000991FFC01EE58FF4FA591B491FC01E45852\n:1001B000FF4FC591D49161110EC09FB7F8948C91F7\n:1001C000E22FE0958E238C932881E223E8839FBF62\n:1001D000DF91CF9108958FB7F894EC91E22BEC93D7\n:1001E0008FBFF6CF3FB7F89480910501909106013B\n:1001F000A0910701B091080126B5A89B05C02F3F2B\n:1002000019F00196A11DB11D3FBFBA2FA92F982F3C\n:100210008827BC01CD01620F711D811D911D42E037\n:10022000660F771F881F991F4A95D1F708958F92FF\n:100230009F92AF92BF92CF92DF92EF92FF924B01CB\n:100240005C010E94F2006B017C010E94F2006C19BB\n:100250007D098E099F09683E734081059105A8F3C9\n:1002600021E0821A9108A108B10888EEC80E83E047\n:10027000D81EE11CF11C81149104A104B10429F7DA\n:10028000FF90EF90DF90CF90BF90AF909F908F90B6\n:100290000895E82FF0E0E255FF4FE491E33031F1AB\n:1002A00038F4E130B9F0E230D9F061E00C94750037\n:1002B000E73041F1E83079F1E430B9F7809180001E\n:1002C00080628093800088EC90E090938B00809314\n:1002D0008A00089584B5806884BD88EC87BD089540\n:1002E00084B5806284BD88EC88BD089580918000CB\n:1002F00080688093800088EC90E0909389008093E0\n:10030000880008958091B00080688093B00088ECE8\n:100310008093B30008958091B00080628093B00014\n:1003200088EC8093B4000895CF93C82F61E084E0F7\n:100330000E94750060E087E00E9475006C2F88E0E5\n:100340000E94750061E06C278CE00E94750061E0FE\n:1003500085E00E94C10085E00E94490161E086E0DD\n:100360000E94C10086E0CF910C9449011F920F9228\n:100370000FB60F9211242F933F938F939F93AF93B8\n:10038000BF938091010190910201A0910301B0916E\n:1003900004013091000123E0230F2D3758F5019619\n:1003A000A11DB11D209300018093010190930201D2\n:1003B000A0930301B093040180910501909106017F\n:1003C000A0910701B09108010196A11DB11D809374\n:1003D000050190930601A0930701B0930801BF9116\n:1003E000AF919F918F913F912F910F900FBE0F90E2\n:1003F0001F90189526E8230F0296A11DB11DD2CF9C\n:10040000CF92DF92EF92FF920F931F93E82FF92F75\n:1004100005C0015011092109310961F1908196232C\n:100420009417B9F305C0015011092109310911F1DF\n:10043000908196239413F7CFC12CD12CE12CF12C71\n:100440000AC08FEFC81AD80AE80AF80A0C151D0569\n:100450002E053F0579F080818623841791F36C2D5A\n:100460007D2D8E2D9F2D1F910F91FF90EF90DF908E\n:10047000CF90089560E070E080E090E01F910F91D0\n:10048000FF90EF90DF90CF900895789484B58260CC\n:1004900084BD84B5816084BD85B5826085BD85B528\n:1004A000816085BD80916E00816080936E001092A6\n:1004B0008100809181008260809381008091810021\n:1004C00081608093810080918000816080938000B2\n:1004D0008091B10084608093B1008091B000816010\n:1004E0008093B00080917A00846080937A0080913C\n:1004F0007A00826080937A0080917A008160809394\n:100500007A0080917A00806880937A001092C1000E\n:1005100061E084E00E94C10061E087E00E94C100C8\n:1005200061E088E00E94C10061E08CE00E94C100AF\n:1005300061E089E00E94C10060E08AE00E94C100A1\n:10054000C3E0D0E093E2E92EF12C24EAC22E20E0B1\n:10055000D22E30E9A32E30E0B32E40E0842E40E0CE\n:10056000942E60E089E00E947500CE010197F1F7BA\n:1005700061E089E00E947500C7010197F1F760E032\n:1005800089E00E947500F6016491F5018491E82FDD\n:10059000F0E0EE0FFF1FE859FF4F8591949108EAB4\n:1005A00011E620E030E0462F0E940002611571053F\n:1005B0008105910529F1DC01CB010196A11DB11D39\n:1005C000BF700097A105B105D9F088389440A10506\n:1005D000B105B0F480E00E94940160E971E080E030\n:1005E00090E00E9417016EE170E080E090E00E94D0\n:1005F00017018114910409F4B4CF0E940000B1CF17\n:0C06000081E00E949401EFCFF894FFCF3E\n:00000001FF\n";

// src/robotics/project/kitSketches.ts
var LINE_SKETCH = "// Seguidor de linea con dos TCRT5000: negro=HIGH, blanco=LOW.\n// DO izquierdo=D2, derecho=D3. Driver IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.\nvoid motores(int izquierda, int derecha) {\n digitalWrite(4,HIGH); digitalWrite(7,LOW); digitalWrite(8,HIGH); digitalWrite(12,LOW);\n analogWrite(5,izquierda); analogWrite(6,derecha);\n}\nvoid setup() {\n pinMode(2,INPUT); pinMode(3,INPUT); pinMode(4,OUTPUT); pinMode(7,OUTPUT); pinMode(8,OUTPUT); pinMode(12,OUTPUT);\n}\nvoid loop() {\n bool izquierda=digitalRead(2), derecha=digitalRead(3);\n if(izquierda && !derecha) motores(65,200);\n else if(derecha && !izquierda) motores(200,65);\n else motores(180,180);\n delay(5);\n}\n";
var LINE_HEX = ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C94C3010C9473000C9473000C94730013\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C94730000000000240027001F\r\n:100070002A0000000000250028002B0000000000DE\r\n:1000800023002600290004040404040404040202DA\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E0000D020C94B0020C940000833081F028F4CF\r\n:1000F000813099F08230A9F008958730A9F08830D6\r\n:10010000C9F08430B1F4809180008F7D03C080916C\r\n:1001100080008F7780938000089584B58F7784BDA9\r\n:10012000089584B58F7DFBCF8091B0008F77809349\r\n:10013000B00008958091B0008F7DF9CFCF93DF9309\r\n:10014000282F30E0F901E255FF4F8491F901E6567E\r\n:10015000FF4FD491F901EA57FF4FC491CC23A1F08E\r\n:1001600081110E947500EC2FF0E0EE0FFF1FE458A4\r\n:10017000FF4FA591B491EC91ED2381E090E009F45B\r\n:1001800080E0DF91CF91089580E090E0FACF1F9357\r\n:10019000CF93DF93282F30E0F901E255FF4F849190\r\n:1001A000F901E656FF4FD491F901EA57FF4FC49188\r\n:1001B000CC23A9F0162F81110E947500EC2FF0E0DE\r\n:1001C000EE0FFF1FEE58FF4FA591B4918FB7F89433\r\n:1001D000EC91111108C0D095DE23DC938FBFDF9125\r\n:1001E000CF911F910895DE2BF8CFCF93DF9390E04E\r\n:1001F000FC01E656FF4F24918A579F4FFC018491E2\r\n:100200008823D1F090E0880F991FFC01E859FF4F37\r\n:10021000A591B491FC01EE58FF4FC591D4916111A5\r\n:100220000EC09FB7F8948C91E22FE0958E238C93AB\r\n:100230002881E223E8839FBFDF91CF9108958FB794\r\n:10024000F894EC91E22BEC938FBFF6CF1F93CF93F2\r\n:10025000DF93182FEB0161E00E94F500E12FF0E041\r\n:10026000E255FF4FE491E33069F178F4E130E9F0D1\r\n:10027000E23019F160E0C038D1050CF061E0812F67\r\n:10028000DF91CF911F910C94C700E73029F1E8303E\r\n:1002900059F1E43079F7809180008062809380008A\r\n:1002A000D0938B00C0938A0004C084B5806884BD5D\r\n:1002B000C7BDDF91CF911F91089584B5806284BD41\r\n:1002C000C8BDF7CF80918000806880938000D09374\r\n:1002D0008900C0938800EDCF8091B0008068809342\r\n:1002E000B000C093B300E5CF8091B00080628093EE\r\n:1002F000B000C093B400DDCF3FB7F8948091050102\r\n:1003000090910601A0910701B091080126B5A89B24\r\n:1003100005C02F3F19F00196A11DB11D3FBFBA2F97\r\n:10032000A92F982F8827BC01CD01620F711D811D57\r\n:10033000911D42E0660F771F881F991F4A95D1F7DC\r\n:1003400008950F931F93CF93DF938C01EB0161E02E\r\n:1003500084E00E94C70060E087E00E94C70061E07F\r\n:1003600088E00E94C70060E08CE00E94C700B801EE\r\n:1003700085E00E942601BE0186E0DF91CF911F91AA\r\n:100380000F910C9426011F920F920FB60F92112419\r\n:100390002F933F938F939F93AF93BF9380910101CE\r\n:1003A00090910201A0910301B091040130910001EC\r\n:1003B00023E0230F2D3758F50196A11DB11D209381\r\n:1003C00000018093010190930201A0930301B09377\r\n:1003D00004018091050190910601A0910701B0915F\r\n:1003E00008010196A11DB11D80930501909306019E\r\n:1003F000A0930701B0930801BF91AF919F918F9196\r\n:100400003F912F910F900FBE0F901F90189526E8E7\r\n:10041000230F0296A11DB11DD2CF789484B58260BE\r\n:1004200084BD84B5816084BD85B5826085BD85B598\r\n:10043000816085BD80916E00816080936E00109216\r\n:100440008100809181008260809381008091810091\r\n:100450008160809381008091800081608093800022\r\n:100460008091B10084608093B1008091B000816080\r\n:100470008093B00080917A00846080937A008091AC\r\n:100480007A00826080937A0080917A008160809304\r\n:100490007A0080917A00806880937A001092C1007F\r\n:1004A00060E082E00E94F50060E083E00E94F500D9\r\n:1004B00061E084E00E94F50061E087E00E94F500C1\r\n:1004C00061E088E00E94F50061E08CE00E94F500A8\r\n:1004D000C0E0D0E082E00E949E007C0183E00E94A8\r\n:1004E0009E00EF28B1F1892B79F568EC70E081E48A\r\n:1004F00090E00E94A1010E947C014B015C0185E01B\r\n:10050000C82ED12CE12CF12C0E947C0168197909AC\r\n:100510008A099B09683E734081059105A8F321E093\r\n:10052000C21AD108E108F10888EE880E83E0981E0F\r\n:10053000A11CB11CC114D104E104F10429F72097D6\r\n:1005400049F20E940000C6CF64EB70E084EB90E0BB\r\n:10055000D0CF892BC9F361E470E088EC90E0C9CF7B\r\n:04056000F894FFCF3D\r\n:00000001FF\r\n";
var EXPLORER_SKETCH = "// Evitar obst\xE1culos: avanza; si el HC-SR04 ve algo a menos de 20 cm, gira a la derecha un momento.\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor: TRIG=D9, ECHO=D10.\nlong distanciaCm() {\n  digitalWrite(9, LOW); delayMicroseconds(2); digitalWrite(9, HIGH); delayMicroseconds(10); digitalWrite(9, LOW);\n  unsigned long us = pulseIn(10, HIGH, 25000UL);\n  if (us == 0) return 400;\n  return us / 58;\n}\nvoid motores(bool izqAdelante, bool derAdelante, int fuerza) {\n  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);\n  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);\n  analogWrite(5, fuerza); analogWrite(6, fuerza);\n}\nvoid setup() { pinMode(11, OUTPUT); pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT); pinMode(9, OUTPUT); pinMode(10, INPUT); }\nvoid loop() {\n  long distancia = distanciaCm(); digitalWrite(11, distancia < 20);\n  if (distancia < 20) { motores(true, false, 200); delay(400); }\n  else motores(true, true, 200);\n  delay(30);\n}\n";
var EXPLORER_HEX = ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C94B6010C9473000C9473000C94730020\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C947300000000002300260021\r\n:10007000290000000000240027002A0000000000E2\r\n:10008000250028002B0004040404040404040202D4\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E00045020C9445030C94000090E0FC01E2559D\r\n:1000F000FF4F2491FC01E656FF4F3491FC01EA5773\r\n:10010000FF4FE491EE23C9F0222339F0233001F1AF\r\n:10011000A8F4213019F1223029F1F0E0EE0FFF1F91\r\n:10012000E458FF4FA591B4918FB7F894EC91611109\r\n:1001300026C030953E233C938FBF08952730A9F009\r\n:100140002830C9F0243049F7809180008F7D03C0AA\r\n:10015000809180008F7780938000DFCF84B58F7788\r\n:1001600084BDDBCF84B58F7DFBCF8091B0008F77CE\r\n:100170008093B000D2CF8091B0008F7DF9CF3E2B1D\r\n:10018000DACFCF93DF9390E0FC01E656FF4F249146\r\n:100190008A579F4FFC0184918823D1F090E0880F0B\r\n:1001A000991FFC01EE58FF4FA591B491FC01E45852\r\n:1001B000FF4FC591D49161110EC09FB7F8948C91F7\r\n:1001C000E22FE0958E238C932881E223E8839FBF62\r\n:1001D000DF91CF9108958FB7F894EC91E22BEC93D7\r\n:1001E0008FBFF6CF3FB7F89480910501909106013B\r\n:1001F000A0910701B091080126B5A89B05C02F3F2B\r\n:1002000019F00196A11DB11D3FBFBA2FA92F982F3C\r\n:100210008827BC01CD01620F711D811D911D42E037\r\n:10022000660F771F881F991F4A95D1F708958F92FF\r\n:100230009F92AF92BF92CF92DF92EF92FF924B01CB\r\n:100240005C010E94F2006B017C010E94F2006C19BB\r\n:100250007D098E099F09683E734081059105A8F3C9\r\n:1002600021E0821A9108A108B10888EEC80E83E047\r\n:10027000D81EE11CF11C81149104A104B10429F7DA\r\n:10028000FF90EF90DF90CF90BF90AF909F908F90B6\r\n:100290000895E82FF0E0E255FF4FE491E33031F1AB\r\n:1002A00038F4E130B9F0E230D9F061E00C94750037\r\n:1002B000E73041F1E83079F1E430B9F7809180001E\r\n:1002C00080628093800088EC90E090938B00809314\r\n:1002D0008A00089584B5806884BD88EC87BD089540\r\n:1002E00084B5806284BD88EC88BD089580918000CB\r\n:1002F00080688093800088EC90E0909389008093E0\r\n:10030000880008958091B00080688093B00088ECE8\r\n:100310008093B30008958091B00080628093B00014\r\n:1003200088EC8093B4000895CF93C82F61E084E0F7\r\n:100330000E94750060E087E00E9475006C2F88E0E5\r\n:100340000E94750061E06C278CE00E94750061E0FE\r\n:1003500085E00E94C10085E00E94490161E086E0DD\r\n:100360000E94C10086E0CF910C9449011F920F9228\r\n:100370000FB60F9211242F933F938F939F93AF93B8\r\n:10038000BF938091010190910201A0910301B0916E\r\n:1003900004013091000123E0230F2D3758F5019619\r\n:1003A000A11DB11D209300018093010190930201D2\r\n:1003B000A0930301B093040180910501909106017F\r\n:1003C000A0910701B09108010196A11DB11D809374\r\n:1003D000050190930601A0930701B0930801BF9116\r\n:1003E000AF919F918F913F912F910F900FBE0F90E2\r\n:1003F0001F90189526E8230F0296A11DB11DD2CF9C\r\n:10040000CF92DF92EF92FF920F931F93E82FF92F75\r\n:1004100005C0015011092109310961F1908196232C\r\n:100420009417B9F305C0015011092109310911F1DF\r\n:10043000908196239413F7CFC12CD12CE12CF12C71\r\n:100440000AC08FEFC81AD80AE80AF80A0C151D0569\r\n:100450002E053F0579F080818623841791F36C2D5A\r\n:100460007D2D8E2D9F2D1F910F91FF90EF90DF908E\r\n:10047000CF90089560E070E080E090E01F910F91D0\r\n:10048000FF90EF90DF90CF900895789484B58260CC\r\n:1004900084BD84B5816084BD85B5826085BD85B528\r\n:1004A000816085BD80916E00816080936E001092A6\r\n:1004B0008100809181008260809381008091810021\r\n:1004C00081608093810080918000816080938000B2\r\n:1004D0008091B10084608093B1008091B000816010\r\n:1004E0008093B00080917A00846080937A0080913C\r\n:1004F0007A00826080937A0080917A008160809394\r\n:100500007A0080917A00806880937A001092C1000E\r\n:1005100061E08BE00E94C10061E084E00E94C100C4\r\n:1005200061E087E00E94C10061E088E00E94C100B4\r\n:1005300061E08CE00E94C10061E089E00E94C1009E\r\n:1005400060E08AE00E94C100C3E0D0E023E2A22E76\r\n:10055000B12C30E9232E30E0332E4AE3442E512CC7\r\n:10056000612C712C50E0852E50E0952E60E089E0E2\r\n:100570000E947500CE010197F1F761E089E00E94C9\r\n:100580007500C5010197F1F760E089E00E947500F0\r\n:10059000E4EAF0E06491F1018491E82FF0E0EE0FDD\r\n:1005A000FF1FE859FF4F8591949108EA11E620E07A\r\n:1005B00030E0462F0E94000261157105810591050A\r\n:1005C000B9F16F5F7F4F8F4F9F4F9F70611571051E\r\n:1005D0008105910569F1A30192010E94230369013C\r\n:1005E0007A0161E0F4E1CF16D104E104F1040CF0EA\r\n:1005F00060E08BE00E94750084E1C816D104E1043C\r\n:10060000F104ECF480E00E94940160E971E080E084\r\n:1006100090E00E9417016EE170E080E090E00E949F\r\n:1006200017018114910409F4A1CF0E9400009ECF0C\r\n:1006300080E9C82EDD24D394E12CF12CD2CF81E0C7\r\n:100640000E949401E8CFA1E21A2EAA1BBB1BFD0158\r\n:100650000DC0AA1FBB1FEE1FFF1FA217B307E407A1\r\n:10066000F50720F0A21BB30BE40BF50B661F771FF9\r\n:10067000881F991F1A9469F76095709580959095D9\r\n:0E0680009B01AC01BD01CF010895F894FFCF9E\r\n:00000001FF\r\n";

// src/robotics/project/assemblySketches.ts
var FOLLOW_SKETCH = "// Seguidor de objetos: se acerca entre 32 y 150 cm, retrocede a menos de 20 cm y espera entre 20 y 32 cm.\n// Evitar obst\xE1culos: avanza; si el HC-SR04 ve algo a menos de 20 cm, gira a la derecha un momento.\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor: TRIG=D9, ECHO=D10.\nlong distanciaCm() {\n  digitalWrite(9, LOW); delayMicroseconds(2); digitalWrite(9, HIGH); delayMicroseconds(10); digitalWrite(9, LOW);\n  unsigned long us = pulseIn(10, HIGH, 25000UL);\n  if (us == 0) return 400;\n  return us / 58;\n}\nvoid motores(bool izqAdelante, bool derAdelante, int fuerza) {\n  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);\n  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);\n  analogWrite(5, fuerza); analogWrite(6, fuerza);\n}\nvoid setup() { pinMode(4,OUTPUT); pinMode(7,OUTPUT); pinMode(8,OUTPUT); pinMode(12,OUTPUT); pinMode(9,OUTPUT); pinMode(10,INPUT); pinMode(2,INPUT); pinMode(3,INPUT); }\nvoid loop() {\n long d=distanciaCm();\n if(d>32 && d<150) motores(true,true,180);\n else if(d<20) motores(false,false,160);\n else { analogWrite(5,0); analogWrite(6,0); }\n delay(30);\n}\n";
var FOLLOW_HEX = ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C9499010C9473000C9473000C9473003D\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C947300000000002300260021\r\n:10007000290000000000240027002A0000000000E2\r\n:10008000250028002B0004040404040404040202D4\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E00028020C9447030C94000090E0FC01E255B8\r\n:1000F000FF4F2491FC01E656FF4F3491FC01EA5773\r\n:10010000FF4FE491EE23C9F0222339F0233001F1AF\r\n:10011000A8F4213019F1223029F1F0E0EE0FFF1F91\r\n:10012000E458FF4FA591B4918FB7F894EC91611109\r\n:1001300026C030953E233C938FBF08952730A9F009\r\n:100140002830C9F0243049F7809180008F7D03C0AA\r\n:10015000809180008F7780938000DFCF84B58F7788\r\n:1001600084BDDBCF84B58F7DFBCF8091B0008F77CE\r\n:100170008093B000D2CF8091B0008F7DF9CF3E2B1D\r\n:10018000DACFCF93DF9390E0FC01E656FF4F249146\r\n:100190008A579F4FFC0184918823D1F090E0880F0B\r\n:1001A000991FFC01EE58FF4FA591B491FC01E45852\r\n:1001B000FF4FC591D49161110EC09FB7F8948C91F7\r\n:1001C000E22FE0958E238C932881E223E8839FBF62\r\n:1001D000DF91CF9108958FB7F894EC91E22BEC93D7\r\n:1001E0008FBFF6CF1F93CF93DF93182FEB0161E002\r\n:1001F0000E94C100209739F460E0812FDF91CF91F8\r\n:100200001F910C947500E12FF0E0E255FF4FE4914F\r\n:10021000E33039F148F4E130B9F0E230E9F0C038C8\r\n:10022000D10554F361E0E9CFE73029F1E83059F125\r\n:10023000E430A9F780918000806280938000D093A1\r\n:100240008B00C0938A0004C084B5806884BDC7BD9C\r\n:10025000DF91CF911F91089584B5806284BDC8BDA0\r\n:10026000F7CF80918000806880938000D0938900D0\r\n:10027000C0938800EDCF8091B00080688093B0007B\r\n:10028000C093B300E5CF8091B00080628093B0004E\r\n:10029000C093B400DDCF3FB7F894809105019091F1\r\n:1002A0000601A0910701B091080126B5A89B05C0E1\r\n:1002B0002F3F19F00196A11DB11D3FBFBA2FA92FE5\r\n:1002C000982F8827BC01CD01620F711D811D911DE2\r\n:1002D00042E0660F771F881F991F4A95D1F708954E\r\n:1002E000FF920F931F93CF93DF93D82FC62F8A01CE\r\n:1002F000682F84E00E947500FF24F3946D2F6F2512\r\n:1003000087E00E9475006C2F88E00E9475006C2FBA\r\n:100310006F258CE00E947500B80185E00E94F20014\r\n:10032000B80186E0DF91CF911F910F91FF900C945F\r\n:10033000F2001F920F920FB60F9211242F933F934A\r\n:100340008F939F93AF93BF9380910101909102018E\r\n:10035000A0910301B09104013091000123E0230F2B\r\n:100360002D3758F50196A11DB11D209300018093F2\r\n:10037000010190930201A0930301B09304018091C5\r\n:10038000050190910601A0910701B0910801019625\r\n:10039000A11DB11D8093050190930601A093070153\r\n:1003A000B0930801BF91AF919F918F913F912F9191\r\n:1003B0000F900FBE0F901F90189526E8230F0296FE\r\n:1003C000A11DB11DD2CFCF92DF92EF92FF920F937A\r\n:1003D0001F93E82FF92F05C0015011092109310998\r\n:1003E00061F1908196239417B9F305C0015011096A\r\n:1003F0002109310911F1908196239413F7CFC12C73\r\n:10040000D12CE12CF12C0AC08FEFC81AD80AE80AC7\r\n:10041000F80A0C151D052E053F0579F0808186230D\r\n:10042000841791F36C2D7D2D8E2D9F2D1F910F9193\r\n:10043000FF90EF90DF90CF90089560E070E080E053\r\n:1004400090E01F910F91FF90EF90DF90CF90089573\r\n:10045000789484B5826084BD84B5816084BD85B59F\r\n:10046000826085BD85B5816085BD80916E008160AB\r\n:1004700080936E0010928100809181008260809351\r\n:100480008100809181008160809381008091800053\r\n:100490008160809380008091B10084608093B1007E\r\n:1004A0008091B00081608093B00080917A00846078\r\n:1004B00080937A0080917A00826080937A008091A4\r\n:1004C0007A00816080937A0080917A0080688093BE\r\n:1004D0007A001092C10061E084E00E94C10061E0F6\r\n:1004E00087E00E94C10061E088E00E94C10061E0F5\r\n:1004F0008CE00E94C10061E089E00E94C10060E0E0\r\n:100500008AE00E94C10060E082E00E94C10060E0D9\r\n:1005100083E00E94C10023E2222E312C3AE3432ED5\r\n:10052000512C612C712CC0E0D0E060E089E00E9489\r\n:10053000750083E090E00197F1F761E089E00E94A7\r\n:100540007500C1010197F1F760E089E00E94750034\r\n:10055000E4EAF0E06491E0E9F0E08491E82FF0E073\r\n:10056000EE0FFF1FE859FF4F8591949108EA11E6BD\r\n:1005700020E030E0462F0E94E301611571058105FE\r\n:10058000910509F448C06F5F7F4F8F4F9F4F9F7059\r\n:100590006115710581059105F1F1A30192010E9498\r\n:1005A0002503DA01C9018197A109B10985379105B0\r\n:1005B000A105B105A8F544EB50E061E081E00E949F\r\n:1005C00070010E944B016B017C018EE1882E912C01\r\n:1005D000A12CB12C0E944B016C197D098E099F0939\r\n:1005E000683E734081059105A8F3F1E08F1A9108E8\r\n:1005F000A108B10828EEC20E23E0D21EE11CF11CB6\r\n:1006000081149104A104B10429F7209709F48DCF36\r\n:100610000E9400008ACF20E931E040E050E0C1CFE5\r\n:1006200024313105410551052CF440EA50E060E0E9\r\n:1006300080E0C5CF70E060E085E00E94F20070E0ED\r\n:1006400060E086E00E94F200BCCFA1E21A2EAA1B55\r\n:10065000BB1BFD010DC0AA1FBB1FEE1FFF1FA21772\r\n:10066000B307E407F50720F0A21BB30BE40BF50B6F\r\n:10067000661F771F881F991F1A9469F760957095F8\r\n:10068000809590959B01AC01BD01CF010895F89430\r\n:02069000FFCF9A\r\n:00000001FF\r\n";
var SUMO_SKETCH = "// Minisumo de practica: arena con borde negro; no incluye oponente ni puntuacion.\n// IR izquierdo=D2 y derecho=D3, negro=HIGH. Detectar borde: retroceder y girar hacia dentro.\n// Evitar obst\xE1culos: avanza; si el HC-SR04 ve algo a menos de 20 cm, gira a la derecha un momento.\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor: TRIG=D9, ECHO=D10.\nlong distanciaCm() {\n  digitalWrite(9, LOW); delayMicroseconds(2); digitalWrite(9, HIGH); delayMicroseconds(10); digitalWrite(9, LOW);\n  unsigned long us = pulseIn(10, HIGH, 25000UL);\n  if (us == 0) return 400;\n  return us / 58;\n}\nvoid motores(bool izqAdelante, bool derAdelante, int fuerza) {\n  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);\n  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);\n  analogWrite(5, fuerza); analogWrite(6, fuerza);\n}\nvoid setup() { pinMode(4,OUTPUT); pinMode(7,OUTPUT); pinMode(8,OUTPUT); pinMode(12,OUTPUT); pinMode(9,OUTPUT); pinMode(10,INPUT); pinMode(2,INPUT); pinMode(3,INPUT); }\nvoid loop() {\n bool izquierda=digitalRead(2), derecha=digitalRead(3);\n if(izquierda || derecha) {\n   motores(false,false,180); delay(320);\n   motores(true,false,180); delay(420);\n } else { motores(true,true,150); }\n delay(5);\n}\n";
var SUMO_HEX = ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C94FD010C9473000C9473000C947300D9\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C94730000000000240027001F\r\n:100070002A0000000000250028002B0000000000DE\r\n:1000800023002600290004040404040404040202DA\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E00047020C94E1020C940000833081F028F464\r\n:1000F000813099F08230A9F008958730A9F08830D6\r\n:10010000C9F08430B1F4809180008F7D03C080916C\r\n:1001100080008F7780938000089584B58F7784BDA9\r\n:10012000089584B58F7DFBCF8091B0008F77809349\r\n:10013000B00008958091B0008F7DF9CFCF93DF9309\r\n:10014000282F30E0F901E255FF4F8491F901E6567E\r\n:10015000FF4FD491F901EA57FF4FC491CC23A1F08E\r\n:1001600081110E947500EC2FF0E0EE0FFF1FE458A4\r\n:10017000FF4FA591B491EC91ED2381E090E009F45B\r\n:1001800080E0DF91CF91089580E090E0FACF1F9357\r\n:10019000CF93DF93282F30E0F901E255FF4F849190\r\n:1001A000F901E656FF4FD491F901EA57FF4FC49188\r\n:1001B000CC23A9F0162F81110E947500EC2FF0E0DE\r\n:1001C000EE0FFF1FEE58FF4FA591B4918FB7F89433\r\n:1001D000EC91111108C0D095DE23DC938FBFDF9125\r\n:1001E000CF911F910895DE2BF8CFCF93DF9390E04E\r\n:1001F000FC01E656FF4F24918A579F4FFC018491E2\r\n:100200008823D1F090E0880F991FFC01E859FF4F37\r\n:10021000A591B491FC01EE58FF4FC591D4916111A5\r\n:100220000EC09FB7F8948C91E22FE0958E238C93AB\r\n:100230002881E223E8839FBFDF91CF9108958FB794\r\n:10024000F894EC91E22BEC938FBFF6CF1F93CF93F2\r\n:10025000DF93D82FC62F172F61E00E94F500ED2FF6\r\n:10026000F0E0E255FF4FE491E33059F158F4E1300A\r\n:10027000D9F0E23009F161E08D2FDF91CF911F912C\r\n:100280000C94C700E73049F1E83079F1E43099F790\r\n:10029000809180008062809380008C2F912F9093BA\r\n:1002A0008B0080938A0004C084B5806884BDC7BD7C\r\n:1002B000DF91CF911F91089584B5806284BDC8BD40\r\n:1002C000F7CF809180008068809380008C2F912FE1\r\n:1002D0009093890080938800EBCF8091B000806874\r\n:1002E0008093B000C093B300E3CF8091B0008062F0\r\n:1002F0008093B000C093B400DBCF3FB7F8948091F7\r\n:10030000050190910601A0910701B091080126B561\r\n:10031000A89B05C02F3F19F00196A11DB11D3FBF3D\r\n:10032000BA2FA92F982F8827BC01CD01620F711D0C\r\n:10033000811D911D42E0660F771F881F991F4A9506\r\n:10034000D1F708958F929F92AF92BF92CF92DF9292\r\n:10035000EF92FF924B015C010E947D016B017C01D9\r\n:100360000E947D016C197D098E099F09683E7340CA\r\n:1003700081059105A8F321E0821A9108A108B1082E\r\n:1003800088EEC80E83E0D81EE11CF11C8114910494\r\n:10039000A104B10429F7FF90EF90DF90CF90BF90B8\r\n:1003A000AF909F908F900895FF920F931F93CF93DC\r\n:1003B000DF93D82FC62F8A01682F84E00E94C700E0\r\n:1003C000FF24F3946D2F6F2587E00E94C7006C2FE8\r\n:1003D00088E00E94C7006C2F6F258CE00E94C70048\r\n:1003E000B80185E00E942601B80186E0DF91CF9137\r\n:1003F0001F910F91FF900C9426011F920F920FB640\r\n:100400000F9211242F933F938F939F93AF93BF939A\r\n:100410008091010190910201A0910301B09104012A\r\n:100420003091000123E0230F2D3758F50196A11DCF\r\n:10043000B11D209300018093010190930201A093CC\r\n:100440000301B09304018091050190910601A091F0\r\n:100450000701B09108010196A11DB11D809305010E\r\n:1004600090930601A0930701B0930801BF91AF914B\r\n:100470009F918F913F912F910F900FBE0F901F90E2\r\n:10048000189526E8230F0296A11DB11DD2CF7894AE\r\n:1004900084B5826084BD84B5816084BD85B5826089\r\n:1004A00085BD85B5816085BD80916E00816080933A\r\n:1004B0006E001092810080918100826080938100A3\r\n:1004C00080918100816080938100809180008160B3\r\n:1004D000809380008091B10084608093B10080910E\r\n:1004E000B00081608093B00080917A008460809336\r\n:1004F0007A0080917A00826080937A0080917A00FD\r\n:10050000816080937A0080917A00806880937A007D\r\n:100510001092C10061E084E00E94F50061E087E094\r\n:100520000E94F50061E088E00E94F50061E08CE047\r\n:100530000E94F50061E089E00E94F50060E08AE039\r\n:100540000E94F50060E082E00E94F50060E083E038\r\n:100550000E94F500C0E0D0E082E00E949E008C0185\r\n:1005600083E00E949E00012B11F4892B19F144EBCA\r\n:1005700050E060E080E00E94D40160E471E080E03F\r\n:1005800090E00E94A20144EB50E060E081E00E9414\r\n:10059000D40164EA71E080E090E00E94A20165E08D\r\n:1005A00070E080E090E00E94A2012097A9F20E94F2\r\n:1005B0000000D2CF46E950E061E081E00E94D40122\r\n:0605C000EECFF894FFCF1E\r\n:00000001FF\r\n";

// src/robotics/sim/lineTrack.ts
function makeLineTrack(preset) {
  if (preset === "arena") return { name: "Arena minisumo", width: 0.04, closed: true, points: Array.from({ length: 96 }, (_, i) => {
    const a = i * Math.PI * 2 / 96;
    return [0.65 * Math.cos(a), 0, 0.65 * Math.sin(a)];
  }) };
  if (preset === "oval") return { name: "Circuito ovalado", width: 0.025, closed: true, points: Array.from({ length: 96 }, (_, i) => {
    const a = i * Math.PI * 2 / 96;
    return [0.55 * (1 - Math.cos(a)), 0, 0.75 * Math.sin(a)];
  }) };
  return { name: "Curvas suaves", width: 0.025, closed: false, points: Array.from({ length: 81 }, (_, i) => {
    const z = i * 0.02;
    return [0.22 * (1 - Math.cos(z * 3)), 0, z];
  }) };
}

// src/robotics/project/trackedSketch.ts
var TRACKED_SKETCH = "// Robot de orugas con cabeza de radar, cara y brazos.\r\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Cuello (servo): D3. Hombros (servos): izquierdo D11, derecho D2. Codos: D13 y A0. Pinzas: A1 y A2. HC-SR04: TRIG=D9, ECHO=D10. Pantalla OLED por I2C: SDA=A4, SCL=A5.\r\n// Avanza mirando al frente. Si ve algo cerca se sorprende y levanta los brazos, mira a los lados con el cuello, elige el lado mas libre y gira hacia el.\r\n#include <Wire.h>\r\n#include <Servo.h>\r\n#include <Adafruit_GFX.h>\r\n#include <Adafruit_SSD1306.h>\r\n\r\nAdafruit_SSD1306 pantalla(128, 64, &Wire, -1);\r\nServo cuello, brazoIzq, brazoDer, codoIzq, codoDer, pinzaIzq, pinzaDer;\r\n\r\nconst int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)\r\n\r\nlong distanciaCm() {\r\n  digitalWrite(9, LOW); delayMicroseconds(2);\r\n  digitalWrite(9, HIGH); delayMicroseconds(10);\r\n  digitalWrite(9, LOW);\r\n  unsigned long us = pulseIn(10, HIGH, 25000UL);\r\n  if (us == 0) return 400;\r\n  return us / 58;\r\n}\r\n\r\nvoid motores(bool izqAdelante, bool derAdelante, int fuerza) {\r\n  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);\r\n  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);\r\n  analogWrite(5, fuerza); analogWrite(6, fuerza);\r\n}\r\n// Freno: los cuatro IN en bajo con el enable puesto cortocircuitan los motores y los detienen de golpe (con el enable apagado giran libres y el robot sigue de largo).\r\nvoid parar() {\r\n  digitalWrite(4, LOW); digitalWrite(7, LOW); digitalWrite(8, LOW); digitalWrite(12, LOW);\r\n  analogWrite(5, 255); analogWrite(6, 255);\r\n}\r\n\r\n// Cara: 0 = normal, 1 = sorprendido, 2 = mira a SU izquierda, 3 = mira a SU derecha (quien la ve de frente tiene la izquierda del robot a la derecha de la pantalla)\r\nvoid cara(int estado) {\r\n  int dx = (estado == 2) ? 6 : (estado == 3) ? -6 : 0;\r\n  pantalla.clearDisplay();\r\n  if (estado == 1) {                                          // sorpresa: ojos enormes y boca redonda\r\n    pantalla.fillCircle(38, 24, 18, SSD1306_WHITE); pantalla.fillCircle(90, 24, 18, SSD1306_WHITE);\r\n    pantalla.fillCircle(38, 24, 4, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 4, SSD1306_BLACK);\r\n    pantalla.fillCircle(64, 52, 8, SSD1306_WHITE);  pantalla.fillCircle(64, 52, 4, SSD1306_BLACK);\r\n  } else {                                                    // ojos con pupila y boca contenta\r\n    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);\r\n    pantalla.fillCircle(38 + dx, 24, 6, SSD1306_BLACK); pantalla.fillCircle(90 + dx, 24, 6, SSD1306_BLACK);\r\n    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);\r\n  }\r\n  pantalla.display();\r\n}\r\n\r\nvoid mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar\r\n// Hombros: 90 = brazos colgando a los lados del cuerpo; menos de 90 = los adelanta y los levanta. El derecho se mueve en espejo (180 - angulo).\r\nvoid brazos(int angulo) { brazoIzq.write(angulo); brazoDer.write(180 - angulo); }\r\n\r\nvoid setup() {\r\n  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);\r\n  pinMode(9, OUTPUT); pinMode(10, INPUT);\r\n  cuello.attach(3); cuello.write(CENTRO);\r\n  brazoIzq.attach(11); brazoDer.attach(2); brazos(90);\r\n  codoIzq.attach(13); codoDer.attach(A0); codoIzq.write(140); codoDer.write(40);     // codos doblados hacia adelante\r\n  pinzaIzq.attach(A1); pinzaDer.attach(A2); pinzaIzq.write(20); pinzaDer.write(20); // pinzas abiertas\r\n  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);\r\n  cara(0);\r\n}\r\n\r\nvoid loop() {\r\n  if (distanciaCm() > 25) {\r\n    motores(true, true, 200);                // camino libre: avanza\r\n  } else {\r\n    parar(); cara(1); brazos(40);            // algo cerca: se sorprende y levanta los brazos\r\n    mirar(IZQUIERDA); long izq = distanciaCm(); cara(2);\r\n    mirar(DERECHA);   long der = distanciaCm(); cara(3);\r\n    mirar(CENTRO);\r\n    bool haciaIzquierda = izq > der;\r\n    motores(!haciaIzquierda, haciaIzquierda, 200);   // gira en el sitio hacia el lado mas libre\r\n    delay(520);\r\n    parar(); cara(0); brazos(90);            // vuelve a la calma: brazos colgando\r\n  }\r\n  delay(30);\r\n}\r\n";
var TRACKED_HEX = ":100000000C9446050C946E050C946E050C946E05CC\r\n:100010000C946E050C946E050C946E050C946E0594\r\n:100020000C946E050C946E050C946E050C94701770\r\n:100030000C946E050C946E050C946E050C946E0574\r\n:100040000C9426170C946E050C946E050C946E059A\r\n:100050000C946E050C946E050C946E050C946E0554\r\n:100060000C942C180C946E05000000002300260050\r\n:1000700029002200FF2100000000003E5B4F5B3E94\r\n:100080003E6B4F6B3E1C3E7C3E1C183C7E3C181C5D\r\n:10009000577D571C1C5E7F5E1C00183C1800FFE754\r\n:1000A000C3E7FF0018241800FFE7DBE7FF30483AFA\r\n:1000B000060E2629792926407F050507407F05255C\r\n:1000C0003F5A3CE73C5A7F3E1C1C08081C1C3E7FE4\r\n:1000D00014227F22145F5F005F5F06097F017F00AB\r\n:1000E0006689956A606060606094A2FFA2940804CB\r\n:1000F0007E040810207E201008082A1C08081C2AEC\r\n:1001000008081E101010100C1E0C1E0C30383E3843\r\n:1001100030060E3E0E06000000000000005F0000EA\r\n:100120000007000700147F147F14242A7F2A12235B\r\n:100130001308646236495620500008070300001C6B\r\n:100140002241000041221C002A1C7F1C2A08083E74\r\n:100150000808008070300008080808080000606087\r\n:100160000020100804023E5149453E00427F4000F5\r\n:1001700072494949462141494D331814127F1027CD\r\n:10018000454545393C4A494931412111090736491C\r\n:10019000494936464949291E0000140000004034F0\r\n:1001A00000000008142241141414141400412214F5\r\n:1001B0000802015909063E415D594E7C1211127C1C\r\n:1001C0007F494949363E414141227F4141413E7F7D\r\n:1001D000494949417F090909013E414151737F085D\r\n:1001E00008087F00417F41002040413F017F081403\r\n:1001F00022417F404040407F021C027F7F04081064\r\n:100200007F3E4141413E7F090909063E4151215E41\r\n:100210007F09192946264949493203017F01033FD5\r\n:100220004040403F1F2040201F3F4038403F631464\r\n:1002300008146303047804036159494D43007F4166\r\n:1002400041410204081020004141417F04020102A3\r\n:1002500004404040404000030708002054547840C8\r\n:100260007F284444383844444428384444287F385C\r\n:100270005454541800087E090218A4A49C787F08DE\r\n:1002800004047800447D40002040403D007F102859\r\n:10029000440000417F40007C047804787C0804041A\r\n:1002A000783844444438FC1824241818242418FCB2\r\n:1002B0007C08040408485454542404043F44243C57\r\n:1002C0004040207C1C2040201C3C4030403C4428C6\r\n:1002D0001028444C9090907C4464544C4400083660\r\n:1002E00041000000770000004136080002010204CE\r\n:1002F000023C2623263C1EA1A161123A4040207AEE\r\n:100300003854545559215555794122545478422135\r\n:100310005554784020545579400C1E52721239556C\r\n:100320005555593954545459395554545800004569\r\n:100330007C410002457D420001457C407D12111246\r\n:100340007DF0282528F07C545545002054547C54D9\r\n:100350007C0A097F4932494949323A4444443A3295\r\n:100360004A4848303A4141217A3A42402078009D3B\r\n:10037000A0A07D3D4242423D3D4040403D3C24FFE7\r\n:100380002424487E4943662B2FFC2F2BFF0929F696\r\n:1003900020C0887E090320545479410000447D41E7\r\n:1003A0003048484A32384040227A007A0A0A727D40\r\n:1003B0000D19317D2629292F28262929292630485B\r\n:1003C0004D4020380808080808080808382F10C8C9\r\n:1003D000ACBA2F102834FA00007B000008142A144D\r\n:1003E0002222142A14085500550055AA55AA55AAC8\r\n:1003F000FF55FF55FF000000FF00101010FF001414\r\n:100400001414FF001010FF00FF1010F010F014146F\r\n:1004100014FC001414F700FF0000FF00FF1414F494\r\n:1004200004FC141417101F10101F101F1414141F95\r\n:1004300000101010F0000000001F101010101F100E\r\n:10044000101010F010000000FF101010101010100D\r\n:100450001010FF10000000FF140000FF00FF00005C\r\n:100460001F10170000FC04F414141710171414F4D0\r\n:1004700004F40000FF00F714141414141414F7000B\r\n:10048000F7141414171410101F101F141414F4145C\r\n:100490001010F010F000001F101F0000001F1400CB\r\n:1004A0000000FC140000F010F01010FF10FF1414F6\r\n:1004B00014FF141010101F00000000F010FFFFFFC9\r\n:1004C000FFFFF0F0F0F0F0FFFFFF0000000000FF82\r\n:1004D000FF0F0F0F0F0F3844443844FC4A4A4A3488\r\n:1004E0007E02020606027E027E026355494163389F\r\n:1004F00044443C04407E201E2006027E020299A550\r\n:10050000E7A5991C2A492A1C4C7201724C304A4DAD\r\n:100510004D303048784830BC625A463D3E494949E2\r\n:10052000007E0101017E2A2A2A2A2A44445F44448B\r\n:1005300040514A444040444A51400000FF0103E01A\r\n:1005400080FF000008086B6B083612362436060F51\r\n:10055000090F06000018180000001010003040FFBE\r\n:100560000101001F01011E00191D1712003C3C3C37\r\n:100570003C0000000000000103070F1F3F7F0080C8\r\n:10058000C0E0F0F8FCFEDB40A4A62EAF2000A1C81E\r\n:10059000D300408DAED580A80000600000000000B0\r\n:1005A000000000000000000000E00000000000006B\r\n:1005B0000000000000000001E0000000000000005A\r\n:1005C00000000000000001F000000000000000003A\r\n:1005D000000000000003F000000000000000000028\r\n:1005E0000000000007F00000000000000000000014\r\n:1005F00000000007F80000000000000000000000FC\r\n:1006000000000FF800000003C0007E000001E000C1\r\n:100610007F0FF800000003C000FE000001E000FFB3\r\n:10062000EFF800000003C000FE000001E000FFFF43\r\n:10063000F800000003C000F00000000F007FFE7F04\r\n:10064000C0000003C000F00000000F003FFE7FF874\r\n:100650003FF1FBCFFCFEF3BC3DEFE01FFE7FFF7FD1\r\n:10066000FBFFDFFEFEFFBC3DEFE01FC6FFFF7FFB91\r\n:10067000FFDFFEFEFFBC3DEFE00FE3C7FE787BC36C\r\n:10068000DE1EF0FFBC3DEF0007FF87FC787BC3DE7A\r\n:100690001EF0F83C3DEF0001FFFFF0007BC3C01EE1\r\n:1006A000F0F03C3DEF0001F37FE03FFBC3CFFEF0F5\r\n:1006B000F03C3DEF0003E33F807FFBC3DFFEF0F043\r\n:1006C0003C3DEF0007E73C00787BC3DE1EF0F03CCA\r\n:1006D0003DEF0007FFBE00787BC3DE1EF0F03C3D1F\r\n:1006E000EF0007FFFE00787BC3DE1EF0F03C3DEF1D\r\n:1006F000000FFFFE007FFBFFDFFEF0F03FFDEFE0AD\r\n:100700000FFFFF007FFBFFDFFEF0F03FFDEFE00F8C\r\n:10071000F9FF003E79F9CF9EF0F01F3DE7E01FF1B1\r\n:10072000FF0000000000000000000000001F80FF2C\r\n:10073000007FFFFFFFFFFFFFFFFFFFE01C007F00C8\r\n:100740007FFFFFFFFEB46D888D18E000001F007F63\r\n:10075000FFFFFFFE95AD7DB577E000000F007FFF46\r\n:10076000FFFFFEA5AD9D8D19E0000006007FFFFF95\r\n:10077000FFFEB5ADEDB57EE0000000000001800099\r\n:1007800000000000000000000380000000000000E6\r\n:1007900000000007C000000000000000000007C0CB\r\n:1007A0000000000000000000000FC000000000007A\r\n:1007B000000000001FE00000000000000000001F1B\r\n:1007C000E00000000000000000003FE0000000002A\r\n:1007D00000000000003FF0000000000000000000EA\r\n:1007E0007FF0000000000000001FF87FF000000014\r\n:1007F000000000003FFE7FF0000000000000003F0E\r\n:10080000FF7FF0000000000000001FFFFBE0000081\r\n:1008100000000000000FFFF9FFC000000000000012\r\n:100820000FFFF9FFF800000000000007FFF1FFFFD5\r\n:1008300000000000000003FC73FFFF8000000000C8\r\n:100840000001FE3FFFFF80000000000000FF1E0FC0\r\n:10085000FF000000000000007FFE1FFC0000000001\r\n:100860000000003FFFFFF8000000000000000FDF65\r\n:10087000FFE0000000000000001F19FFC0000000A2\r\n:10088000000000003F3CFF00000000000000007E70\r\n:100890007CF800000000000000007FFE7C000000EB\r\n:1008A0000000000000FFFFFC00000000000000004E\r\n:1008B000FFFFFE0000000000000000FFFFFE000040\r\n:1008C000000000000001FFEFFE000000000000003B\r\n:1008D00001FFCFFE0000000000000003FF07FE0044\r\n:1008E00000000000000003FC07FE00000000000004\r\n:1008F0000003F003FE00000000000000018000FE85\r\n:10090000000000000000000000007E000000000069\r\n:1009100000000000003E0000000000000000000099\r\n:100920000C000000000000078000FC000003C00075\r\n:100930000000078001FC000003C0000000078001E8\r\n:10094000FC000003C0000000078001E00000001E62\r\n:10095000000000078001E00000001E007FE3F79F19\r\n:10096000F9FDE7787BDFC0FFF7FFBFFDFDFF787B78\r\n:10097000DFC0FFF7FFBFFDFDFF787BDFC0F0F7872B\r\n:10098000BC3DE1FF787BDE00F0F787BC3DE1F0780D\r\n:100990007BDE0000F787803DE1E0787BDE007FF7BB\r\n:1009A000879FFDE1E0787BDE00FFF787BFFDE1E098\r\n:1009B000787BDE00F0F787BC3DE1E0787BDE00F07D\r\n:1009C000F787BC3DE1E0787BDE00F0F787BC3DE1D6\r\n:1009D000E0787BDE00FFF7FFBFFDE1E07FFBDFC0DB\r\n:1009E000FFF7FFBFFDE1E07FFBDFC07CF3F39F3D3E\r\n:1009F000E1E03E7BCFC000000000000000000000EE\r\n:100A000000FFFFFFFFFFFFFFFFFFFFC0FFFFFFFF34\r\n:100A1000FD68DB111A31C0FFFFFFFFFD2B5AFB6A97\r\n:100A2000EFC0FFFFFFFFFD4B5B3B1A33C0FFFFFF33\r\n:100A3000FFFD6B5BDB6AFDC00000000024002700A7\r\n:100A40002A0000000000250028002B0004040404F4\r\n:100A50000404040402020202020203030303030368\r\n:100A60000102040810204080010204081020010245\r\n:100A70000408102000000008000201000003040721\r\n:100A80000000000000000000AB197B1D11241FBEF8\r\n:100A9000CFEFD8E0DEBFCDBF11E0A0E0B1E0EAE7E4\r\n:100AA000FEE302C005900D92A434B107D9F722E00D\r\n:100AB000A4E4B1E001C01D92A339B207E1F715E04B\r\n:100AC000C5E4D5E004C02197FE010E94F91DC4349D\r\n:100AD000D107C9F70E94211A0C94301F0C94000012\r\n:100AE000089590E0FC01EC58F54F2491FC01E05A88\r\n:100AF000F54F3491FC01E45BF54FE491EE23C9F02E\r\n:100B0000222339F0233001F1A8F4213019F12230E9\r\n:100B100029F1F0E0EE0FFF1FEE5BF54FA591B491C8\r\n:100B20008FB7F894EC91611126C030953E233C9329\r\n:100B30008FBF08952730A9F02830C9F0243049F735\r\n:100B4000809180008F7D03C0809180008F7780939B\r\n:100B50008000DFCF84B58F7784BDDBCF84B58F7DF8\r\n:100B6000FBCF8091B0008F778093B000D2CF80917F\r\n:100B7000B0008F7DF9CF3E2BDACFCF93DF9390E09B\r\n:100B8000FC01E05AF54F2491845B954FFC01849160\r\n:100B90008823D1F090E0880F991FFC01E85CF54FA5\r\n:100BA000A591B491FC01EE5BF54FC591D491611113\r\n:100BB0000EC09FB7F8948C91E22FE0958E238C9312\r\n:100BC0002881E223E8839FBFDF91CF9108958FB7FB\r\n:100BD000F894EC91E22BEC938FBFF6CFE82FF0E086\r\n:100BE000EC58F54FE491E33011F138F4E130A9F01D\r\n:100BF000E230C1F061E00C947105E73011F1E830AA\r\n:100C000041F1E430B9F780918000806280938000E8\r\n:100C100070938B0060938A00089584B5806884BDCA\r\n:100C200067BD089584B5806284BD68BD08958091D4\r\n:100C300080008068809380007093890060938800B2\r\n:100C400008958091B00080688093B0006093B300F5\r\n:100C500008958091B00080628093B0006093B400EA\r\n:100C600008953FB7F8948091260290912702A091B1\r\n:100C70002802B091290226B5A89B05C02F3F19F084\r\n:100C80000196A11DB11D3FBFBA2FA92F982F88270C\r\n:100C9000BC01CD01620F711D811D911D42E0660FE7\r\n:100CA000771F881F991F4A95D1F708958F929F92B9\r\n:100CB000AF92BF92CF92DF92EF92FF924B015C0115\r\n:100CC0000E9431066B017C010E9431066C197D097E\r\n:100CD0008E099F09683E734081059105A8F321E0C4\r\n:100CE000821A9108A108B10888EEC80E83E0D81EC8\r\n:100CF000E11CF11C81149104A104B10429F7FF90B7\r\n:100D0000EF90DF90CF90BF90AF909F908F9008951D\r\n:100D100008950895AF92BF92CF92DF92EF92FF9223\r\n:100D20000F931F93CF93DF936C017B018B01040F13\r\n:100D3000151FEB015E01AE18BF08C017D10759F0AF\r\n:100D40006991D601ED91FC910190F081E02DC601F1\r\n:100D50000995892B79F7C501DF91CF911F910F91EB\r\n:100D6000FF90EF90DF90CF90BF90AF900895EF92FB\r\n:100D7000FF920F931F93CF93DF93EC01EC80FD80E4\r\n:100D80006E157F050CF070C057FF04C0240F351F8F\r\n:100D900050E040E08E819F81FA01E20FF31F8E1731\r\n:100DA0009F071CF49C01241B350B121613060CF034\r\n:100DB0005BC0922F842F8695869586958E9DD00157\r\n:100DC0008F9DB00D11246A0F7B1FAF8DB8A1A60FA8\r\n:100DD000B71F477049F188E0841B482F682F70E0E7\r\n:100DE000FB01E258FA4FE491281708F063C0621B38\r\n:100DF00071092FEF30E002C0359527956A95E2F72B\r\n:100E0000E2230130110539F0B0F10230110561F52E\r\n:100E10008C91E82702C08C91E82BEC93941720F179\r\n:100E20002C813D81A20FB31FE92FE41BE83078F03D\r\n:100E30000230110521F58E2F9C9190959C932C8169\r\n:100E40003D81A20FB31F88508830B0F7E770EE23C2\r\n:100E500059F0F0E0EA58FA4FE49101301105F9F049\r\n:100E600010F10230110519F1DF91CF911F910F910F\r\n:100E7000FF90EF900895E0958C91E823CECF81E02C\r\n:100E80000115110509F480E081959E2F8C932C812A\r\n:100E90003D81A20FB31F98509830C0F7D7CF8C91E7\r\n:100EA000E82BEC93E1CFE0958C91E823FACF8C917D\r\n:100EB000E827F7CF0130110509F4ADCFE0F2023099\r\n:100EC000110509F4A5CFAE0DBF1DAECF0F931F9333\r\n:100ED000CF93DF9377FF04C0260F371F70E060E0E9\r\n:100EE000DC011496CD91DC91FB01E20FF31FCE17CC\r\n:100EF000DF071CF49E01261B370B121613064CF558\r\n:100F0000FA0157FD3796A3E0F595E795AA95E1F725\r\n:100F1000EC9FD001ED9FB00DFC9FB00D11246A0F26\r\n:100F20007B1FDC015F96ED91FC91E60FF71F477088\r\n:100F3000552781E090E001C0880F4A95EAF7482FD5\r\n:100F40000130110559F0A8F02E0F3F1F0230110596\r\n:100F5000E1F0DF91CF911F910F9108952E0F3F1F68\r\n:100F6000E217F307B1F38191DF011197842B8C9382\r\n:100F7000F7CF80952E0F3F1FE217F30751F39191A2\r\n:100F8000DF01119798239C93F7CFE217F30709F33A\r\n:100F90008191DF01119784278C93F7CF0F931F93D3\r\n:100FA000FA01DC0156964C9156974230E9F04330F5\r\n:100FB000A1F1413061F514964D915C91DA01AE1BBF\r\n:100FC000BF0BFD01E21BF30B77FD0BC0DC01169696\r\n:100FD0004D915C916417750724F4AB01BF010E9429\r\n:100FE00066071F910F91089514964D915C91DA0157\r\n:100FF000A61BB70BBD0161507109DC0116964D911E\r\n:101000005C91DA01AE1BBF0BFD01E21BF30B77FD18\r\n:10101000E8CFAF010E94B706E4CF16964D915C91E0\r\n:10102000DA01A61BB70BBD0161507109CDCF0F933B\r\n:101030001F93FA01DC0156964C9156974230A9F065\r\n:10104000433091F1413019F514964D915C91DA01DC\r\n:10105000AE1BBF0BFD013197F7FD04C0AB01BF0113\r\n:101060000E94B7061F910F91089514964D915C91BF\r\n:10107000DA01A61BB70BBD01DC0116964D915C9100\r\n:10108000DA01AE1BBF0BFD013197621B730BF7FD3D\r\n:10109000E9CFDC0116964D915C91E417F50714F742\r\n:1010A000AF010E946607DECF16964D915C91DA0182\r\n:1010B000A61BB70BBD01621B730BCECFFC0177FDE6\r\n:1010C00064C080859185681779070CF05EC057FD74\r\n:1010D0005CC082859385481759070CF056C08689F5\r\n:1010E0008230B1F0833029F1813041F484819581DF\r\n:1010F000841B950BAB01BC01615071092130310596\r\n:1011000009F108F443C02230310509F463C00895A1\r\n:1011100084819581DC01A61BB70BBD01615071096B\r\n:1011200086819781DC01A41BB50BAD0141505109AB\r\n:10113000E5CF86819781861B970BBA01AC014150A0\r\n:101140005109DCCFCA0157FD0796A3E09595879515\r\n:10115000AA95E1F7A481B5818A9F90018B9F300DFC\r\n:101160009A9F300D1124620F731F078CF0A1E02DA0\r\n:10117000E60FF71F4770552721E030E001C0220F2E\r\n:101180004A95EAF78081822B80830895CA0157FD32\r\n:10119000079633E0959587953A95E1F7A481B58157\r\n:1011A0008A9F90018B9F300D9A9F300D1124620F02\r\n:1011B000731F078CF0A1E02DE60FF71F477055272E\r\n:1011C00081E090E001C0880F4A95EAF78095908110\r\n:1011D0008923DACFCA0157FD079623E095958795B5\r\n:1011E0002A95E1F7A481B5818A9F90018B9F300DEC\r\n:1011F0009A9F300D1124620F731F078CF0A1E02D10\r\n:10120000E60FF71F4770552721E030E001C0220F9D\r\n:101210004A95EAF780818227B7CF08958EBD0000F6\r\n:101220000DB407FEFDCF8EB508958CBD9DBD08950C\r\n:101230000895FC016370668B8481958126813781D6\r\n:10124000613039F0633029F09187808733872287B6\r\n:101250000895318720879387828708952F923F9240\r\n:101260004F925F926F927F928F929F92AF92BF92B6\r\n:10127000CF92DF92EF92FF920F931F93CF93DF9362\r\n:10128000CDB7DEB76A970FB6F894DEBF0FBECDBFFD\r\n:101290009A8F898F7A8369834A01D22E18870F83A8\r\n:1012A0003701BC2CDC0159962D913C915A972115A0\r\n:1012B000310509F015C118968D919C911997681701\r\n:1012C00079070CF0D9C11A968D919C91481759074E\r\n:1012D0000CF0D2C14C2C512CB6E0CB9E600D711D90\r\n:1012E00011247C876B87161617060CF0C5C1EA2DF2\r\n:1012F000F0E0FA87E98793E0EE0FFF1F9A95E1F798\r\n:10130000F88BEF87CF01840F951F181619060CF084\r\n:10131000B3C1A98DBA8D58968C91811104C0BFEAD2\r\n:10132000BD1508F4D394A98DBA8DED91FC91119758\r\n:101330000284F385E02DCD010995B5E0DB9EC00167\r\n:101340001124E981FA81FC83EB83312C212C9C014F\r\n:101350002A583F4F388F2F8B4A2D50E05E8B4D8B94\r\n:10136000EF89F88DE20DF31D44919E828D82D12C80\r\n:10137000C12C69817A81620D731D7A8B698B842FF0\r\n:1013800090E09C8B8B8BE98DFA8DA081B18140FF21\r\n:1013900082C0F1E0BF126FC0AF126DC01C96ED911C\r\n:1013A000FC912F813885A4014C0D5D1D69897A89D6\r\n:1013B000898D9A8D0995EB89FC89F595E7954E2FD6\r\n:1013C0005FEFC51AD50A6D817E818D899E89680F70\r\n:1013D000791F7E836D8398E0C916D10481F6AFEF43\r\n:1013E0002A1A3A0AEB81FC81E40DF51DFC83EB839C\r\n:1013F000F5E02F16310409F0B3CF2F81388526157B\r\n:101400003705B9F0A98DBA8DED91FC91B1E0BB1211\r\n:1014100057C0AB1255C069817A816B5F7F4F0088DE\r\n:10142000F189E02D830128E030E0A401898D9A8DB7\r\n:101430000995A98DBA8DED91FC9111970688F789D0\r\n:10144000E02DCD016A960FB6F894DEBF0FBECDBF7A\r\n:10145000DF91CF911F910F91FF90EF90DF90CF9090\r\n:10146000BF90AF909F908F907F906F905F904F90C4\r\n:101470003F902F9009941E96ED91FC91EF80F88497\r\n:1014800009851A8592014D815E816B817C81898DF0\r\n:101490009A8D099590CF2F8138852615370509F447\r\n:1014A0008ACF31E0B31207C0A31205C01C96ED919C\r\n:1014B000FC91930178CF1E96ED91FC917301E0CFE2\r\n:1014C0006B857C85641975090684F785E02D7301A9\r\n:1014D0000F8518899201A401898D9A8D0995A9CF4C\r\n:1014E000F901349645915491F90132968591949180\r\n:1014F000D41AB7E0DB9E800D911D1124F9012591CE\r\n:1015000034913C8B2B8BFC0125903490FC0132965E\r\n:10151000749031963491398B329664903196449020\r\n:1015200041E04C1518F04A1508F07FC0662D062CD6\r\n:10153000000C770B7C836B83842D042C000C990B9F\r\n:101540009E838D83A98DBA8DED91FC9111970284B4\r\n:10155000F385E02DCD010995512CD12CC12CEA2D1C\r\n:10156000F0E0FA87E9872B2D30E03C872B87A40138\r\n:10157000440D511D47FC5A95588F4F8B69817A81D4\r\n:10158000660D711D67FC7A957E876D877989C71610\r\n:1015900008F04FCF2C2D30E04D815E81420F531F5C\r\n:1015A000A985BA854A9FC0014B9F900D5A9F900D07\r\n:1015B0001124FC01E80DF91DF88BEF87852D612CB6\r\n:1015C0004F89588D420F531F5E8B4D8B671408F067\r\n:1015D00050C044244394480E877041F4C1010196E1\r\n:1015E000EB89FC89E20DF31DD4901C01D7FE19C0D4\r\n:1015F000A98DBA8DED91FC91662D70E0B1E0BB1222\r\n:1016000019C0AB1217C02D853E85620F731F04846D\r\n:10161000F585E02D2F8138854D895E89898D9A8DDC\r\n:101620000995DD0C6394842DD1CF1E821D821C820E\r\n:101630001B8288CF4B815C81640F751FAB85BC8595\r\n:101640006A9FC0016B9F900D7A9F900D1124698154\r\n:101650007A81680F791F0684F785E02DEF80F88482\r\n:1016600009851A859D014F855889898D9A8D09951F\r\n:10167000D8CF570CC3948ACF6A960FB6F894DEBFC2\r\n:101680000FBECDBFDF91CF911F910F91FF90EF90D3\r\n:10169000DF90CF90BF90AF909F908F907F906F9092\r\n:1016A0005F904F903F902F9008958F929F92AF92AE\r\n:1016B000CF92EF92FF920F931F93CF93DF93EC01A2\r\n:1016C000262F898D9A8D009709F051C06A30D1F488\r\n:1016D0001D861C868D8948E0849F900111248E858B\r\n:1016E0009F85820F931F9F878E8781E090E0DF9117\r\n:1016F000CF911F910F91FF90EF90CF90AF909F905F\r\n:101700008F9008956D3089F3CC88AD888F898823B8\r\n:10171000C1F08C859D8536E0C39E800D911D1124FE\r\n:10172000488559854817590764F44E855F851D869D\r\n:101730001C8638E0A39EC0011124840F951F9F874B\r\n:101740008E87EA88FB88088919894E855F856C85B4\r\n:101750007D85CE010E942E092C898C859D8546E0D1\r\n:10176000249F800D911D11249D878C87BECF6A30E8\r\n:1017700069F41D861C86FC013896E4912D898E85BE\r\n:101780009F85E29F800D911D1124ADCF6D3009F42E\r\n:10179000ACCFFC0134964591549170E06417750705\r\n:1017A00008F4A3CFFC013696A591B491A617B7070C\r\n:1017B00008F49BCFFC01329685909490362F341B11\r\n:1017C00047E0349F800C911C1124F401329634912F\r\n:1017D0003196E4913323A9F1EE2399F1CC88F401F9\r\n:1017E0003596E491AD884F89442301F10E2E000C0B\r\n:1017F000FF0BE30FF11DCE9EA001CF9E500D1124D3\r\n:101800006C857D85460F571F688579856417750738\r\n:101810006CF44E855F851D861C86FC013896E4912C\r\n:10182000AE9E400D511D11245F874E87EA88FB88CC\r\n:10183000088919894E855F856C857D85CE010E945A\r\n:101840002E09F4013496E4912C898C859D85E29FC4\r\n:10185000800D911D112488CF6F927F928F929F925D\r\n:10186000AF92BF92CF92DF92EF92FF920F931F93AE\r\n:10187000CF93DF93EC016B015A0139014801E881F4\r\n:10188000F9810284F385E02D0995E881F9810288C8\r\n:10189000F389E02D87019301A501B601CE010995D9\r\n:1018A000A501480D591D41505109E881F98102886F\r\n:1018B000F389E02D9301B601CE010995E881F98104\r\n:1018C0000088F189E02D9401A501B601CE010995AA\r\n:1018D000C60CD71CB60161507109E881F9810088F6\r\n:1018E000F189E02D9401A501CE010995E881F981E6\r\n:1018F0000688F789E02DCE01DF91CF911F910F91DE\r\n:10190000FF90EF90DF90CF90BF90AF909F908F901F\r\n:101910007F906F9009946F927F928F929F92AF9277\r\n:10192000BF92CF92DF92EF92FF920F931F93CF93CC\r\n:10193000DF935C01EB016A01490138018701DC0199\r\n:10194000ED91FC916217730719F5641675062CF07A\r\n:10195000962D872D3A01C92ED82E960126193709C2\r\n:101960002F5F3F4F048CF58DE02DA301BE01C50113\r\n:101970000995DF91CF911F910F91FF90EF90DF902C\r\n:10198000CF90BF90AF909F908F907F906F90089571\r\n:101990004615570591F42617370724F0892D4B017A\r\n:1019A000C22FD82F9E01281939092F5F3F4F068C6F\r\n:1019B000F78DE02DA601B401DACF0284F385E02D86\r\n:1019C0000995D501ED91FC910488F589E02D8301FD\r\n:1019D0009401A601BE01C5010995D501ED91FC91C7\r\n:1019E0000688F789E02DC501DF91CF911F910F91F6\r\n:1019F000FF90EF90DF90CF90BF90AF909F908F902F\r\n:101A00007F906F900994EF92FF920F931F93DC01E8\r\n:101A10001A960D911C911B9718962D913C91199730\r\n:101A2000ED91FC9100A0F1A1E02D7B0150E040E0A0\r\n:101A300070E060E009951F910F91FF90EF9008957D\r\n:101A40004F925F926F927F928F929F92AF92BF92CE\r\n:101A5000CF92DF92EF92FF920F931F93CF93DF937A\r\n:101A60006C012B015A0139014801DC01ED91FC9117\r\n:101A70000284F385E02D0995E201640C751CD60102\r\n:101A8000ED91FC91C615D7055CF40088F189E02D35\r\n:101A900087019401A501BE01C60109952196EFCFEA\r\n:101AA0000688F789E02DC601DF91CF911F910F9134\r\n:101AB000FF90EF90DF90CF90BF90AF909F908F906E\r\n:101AC0007F906F905F904F9009948F929F92AF920A\r\n:101AD000BF92CF92DF92EF92FF920F931F93CF931B\r\n:101AE000DF93EC015B014A016901E881F98102841D\r\n:101AF000F385E02D099595012C0D3D1D21503109EF\r\n:101B0000E881F9810488F589E02D78018401A40138\r\n:101B1000B501CE010995E881F9810688F789E02DA4\r\n:101B2000CE01DF91CF911F910F91FF90EF90DF9049\r\n:101B3000CF90BF90AF909F908F9009948F929F927B\r\n:101B4000AF92BF92CF92DF92EF92FF920F931F93CB\r\n:101B5000CF93DF93EC015B014A0169017801E881D1\r\n:101B6000F9810284F385E02D0995C80CD91C860102\r\n:101B700001501109E881F9810488F589E02D95016A\r\n:101B8000A401B501CE010995E881F9810688F7899C\r\n:101B9000E02DCE01DF91CF911F910F91FF90EF903B\r\n:101BA000DF90CF90BF90AF909F908F900994EF926D\r\n:101BB000FF920F931F93DC01ED91FC9100A0F1A126\r\n:101BC000E02D09951F910F91FF90EF9008950F93CD\r\n:101BD0001F93DC01ED91FC91068CF78DE02D0995AA\r\n:101BE0001F910F9108950F931F93DC01ED91FC91CC\r\n:101BF000048CF58DE02D09951F910F9108952F927A\r\n:101C00003F924F925F926F927F928F929F92AF928C\r\n:101C1000BF92CF92DF92EF92FF920F931F93CF93D9\r\n:101C2000DF93CDB7DEB72C970FB6F894DEBF0FBEAB\r\n:101C3000CDBF3C017C836B835C874B8718012701F8\r\n:101C400081E090E05C01A41AB50ACA0191958195E2\r\n:101C50009109AC01440F551F5A834983C80101966D\r\n:101C60009E838D83F12CE12C88248394912C922FD8\r\n:101C700091709F8322702887AB014F5F5F4F5A8717\r\n:101C800049878B859C85E816F9060CF07AC0CB84D1\r\n:101C9000DC84B7FC0CC06C0191E0C91AD108498101\r\n:101CA0005A814E5F5F4F5A834983A40EB51E5FEF82\r\n:101CB000E51AF50A82E0880E911CA80CB91CCE1416\r\n:101CC000DF0464F19F81992399F09601220F331F5D\r\n:101CD0004D815E81240F351F82014B815C814C193F\r\n:101CE0005D09B701660D771D8FE492E00E94F30D48\r\n:101CF0005885552399F09601220F331F8D819E81BF\r\n:101D0000280F391F82014B815C814C195D09B30199\r\n:101D10006E197F098FE492E00E94F30D4B855C857C\r\n:101D20004C155D0559F15F81552391F094012250C6\r\n:101D30003109220D331D820149855A854E195F09EB\r\n:101D40006B857C85660D771D8FE492E00E94F30D14\r\n:101D50008885882399F0940122503109220D331D82\r\n:101D6000B3014B855C85641B750B820149855A85DF\r\n:101D70004E195F098FE492E00E94F30DDC86CB865A\r\n:101D800080CF2C960FB6F894DEBF0FBECDBFDF918B\r\n:101D9000CF911F910F91FF90EF90DF90CF90BF9068\r\n:101DA000AF909F908F907F906F905F904F903F90FB\r\n:101DB0002F900895AF92BF92CF92DF92EF92FF9251\r\n:101DC0000F931F93CF93DF936C015B01EA017901BD\r\n:101DD0009A01220F331F2F5F3F4FAB014C1B5D0B4E\r\n:101DE0008701B6018FE492E00E94F30D10E000E05D\r\n:101DF00023E0AE01B501C6010E94FF0DDF91CF9136\r\n:101E00001F910F91FF90EF90DF90CF90BF90AF9018\r\n:101E10000895DC01ED91FC910084F185E02D099499\r\n:101E20003F924F925F926F927F928F929F92AF926A\r\n:101E3000BF92CF92DF92EF92FF920F931F93CF93B7\r\n:101E4000DF935C017B014A016901390187E0680E7B\r\n:101E5000711C93E0759467949A95E1F72B01400EFD\r\n:101E6000511E10E000E0312CD0E0C0E0CE018770C0\r\n:101E70009927330C892B59F4FE0183E0F595E795FA\r\n:101E80008A95E1F7E00FF11FE80DF91D349037FE58\r\n:101E90000AC021E030E0A701B5016C0F7D1F8FE47F\r\n:101EA00092E00E94090F2196CC16DD06F9F68FEF1D\r\n:101EB000E81AF80A060D171DE414F504A9F6DF91D7\r\n:101EC000CF911F910F91FF90EF90DF90CF90BF9037\r\n:101ED000AF909F908F907F906F905F904F903F90CA\r\n:101EE00008952F923F924F925F926F927F928F92BE\r\n:101EF0009F92AF92BF92CF92DF92EF92FF920F9399\r\n:101F00001F93CF93DF9300D000D000D0CDB7DEB7C2\r\n:101F10003C016A013E832D83FC82EB825801A41AA6\r\n:101F2000B50AB7FE03C0B194A194B1088D809E801C\r\n:101F3000861A970A97FE03C09194819491088A1497\r\n:101F40009B045CF0902F812F0D811E819D838E83D9\r\n:101F50009C2D8D2D6B01692F782F0C151D055CF0C4\r\n:101F60009D818E817E836D83692F782F902F812FA5\r\n:101F70008601C92ED82E1601201A310A2B012D8177\r\n:101F80003E81421A530A57FE03C0519441945108AE\r\n:101F9000710137FE03C03FEFE31AF30AF594E794AB\r\n:101FA0008D819E81861797075CF5A1E0B0E0BA832A\r\n:101FB000A983C016D1064CF1D301ED91FC910484A4\r\n:101FC000F585E02D2B813C81A8016D817E818A14ED\r\n:101FD0009B041CF04D815E81B801C3010995E41892\r\n:101FE000F508F7FE0AC02D813E8189819A81280F6C\r\n:101FF000391F3E832D83E20CF31C0F5F1F4FD9CF97\r\n:102000002FEF3FEF3A832983D4CF26960FB6F8946B\r\n:10201000DEBF0FBECDBFDF91CF911F910F91FF901B\r\n:10202000EF90DF90CF90BF90AF909F908F907F9078\r\n:102030006F905F904F903F902F9008950895CF92AA\r\n:10204000DF92EF92FF92CF93DF93EC01603282E058\r\n:102050007807CCF5653B710514F064EB70E089817D\r\n:1020600028E830E0281B310987FD3395220F331F04\r\n:10207000220F331F6901330FEE08FF088A8128E51C\r\n:1020800032E0281B310987FD3395220F331F220FC1\r\n:10209000331F032E000C440B550B2C193D094E0920\r\n:1020A0005F09DB0177FF02C0B0E0A0E00E94B41D31\r\n:1020B00024EB30E040E050E00E948A1DC20ED31EA7\r\n:1020C000E41EF51EB601E881EC3070F5298188E840\r\n:1020D00090E0821B910927FD9395880F991F880F27\r\n:1020E000991F681779077CF02A8188E592E0821BA6\r\n:1020F000910927FD9395880F991F880F991F6817DD\r\n:1021000079070CF4CB010297880F991F4FB7F89409\r\n:102110002E2F30E0F901EE0FFF1FE20FF31FEA5000\r\n:10212000FE4F928381834FBFDF91CF91FF90EF905D\r\n:10213000DF90CF9008951F93CF93DF93EC01162F7C\r\n:1021400088818C3008F04EC061E0812F0E94BD056F\r\n:102150008881282F30E0F901EE0FFF1FE20FF31FF7\r\n:10216000EA50FE4F1F736081607C612B608319828F\r\n:102170001A822CE0622F0E94ED1D829FB001112473\r\n:1021800030E020E0AB01420F531FFA01EE0FFF1FBA\r\n:10219000E40FF51FEA50FE4F908196FD16C02F5FA9\r\n:1021A0003F4F2C30310571F781110FC01092800024\r\n:1021B00082E0809381001092850010928400B19A91\r\n:1021C00080916F00826080936F00E8818E2F90E095\r\n:1021D000FC01EE0FFF1FE80FF91FEA50FE4F808150\r\n:1021E000806480838881DF91CF911F910895209131\r\n:1021F000AA01260F3327331F21323105ECF4209139\r\n:10220000CE01FC0190E080E0243069F082E0089586\r\n:10221000A091AA012191AC0146575E4FA40FB52FA2\r\n:10222000B11D2C930196861798F38091AA01680F2F\r\n:102230006093AA0180E0089581E008951092CE0194\r\n:1022400081E08093D0011092CF0161E082E10E9491\r\n:10225000710561E083E10E947105E9EBF0E08081A6\r\n:102260008E7F808380818D7F808388E48093B80017\r\n:1022700085E48093BC000895CF93DF9391E0909321\r\n:1022800089018823B9F0C091B800D091BA0080913B\r\n:10229000BC008A7B8093BC0060E082E10E947105F3\r\n:1022A00060E083E10E9471050E941E11D093BA0084\r\n:1022B000C093B800DF91CF910895E0912002809102\r\n:1022C0001F02E81730F4F0E0EC59FE4F808190E0F7\r\n:1022D00008958FEF9FEF08959091200280911F0243\r\n:1022E0002FEF3FEF981748F4E92FF0E0EC59FE4F3D\r\n:1022F000208130E09F5F90932002C9010895809172\r\n:102300001F0290912002891B990B0895CF92DF92B2\r\n:10231000EF92FF920F931F93CF93DF937C01CB013A\r\n:102320008A0120912D02222389F0EB016B01C40E5A\r\n:10233000D51ECC15DD0569F06991D701ED91FC91B1\r\n:102340000190F081E02DC7010995F3CF642F0E9421\r\n:10235000F710C801DF91CF911F910F91FF90EF907F\r\n:10236000DF90CF900895CF93DF931F92CDB7DEB764\r\n:10237000698320912D022223F9F020912A02203234\r\n:1023800058F021E030E0FC013383228390E080E0CC\r\n:102390000F90DF91CF91089580912B02E82FF0E00C\r\n:1023A000EC5BFE4F998190838F5F80932B0280932B\r\n:1023B0002A0281E090E0ECCF61E0CE0101960E941C\r\n:1023C000F710F7CFCF92DF92EF92FF920F931F9308\r\n:1023D000CF93DF93D0912A0281E0D13208F09CC0E4\r\n:1023E000C0912C020E9431066B017C018091CE01CC\r\n:1023F00081116CC082E08093CE0181E08093D00196\r\n:102400008FEF8093CD011092F201D093F101A4E4FB\r\n:10241000B1E0E1EDF1E080E0D8138DC01092F3015E\r\n:102420008091F301CC0FC82BC093F3018091CF01B1\r\n:10243000813009F084C01092CF010E9431066B01F7\r\n:102440007C018091F3018093BB0080918501909184\r\n:102450008601A0918701B0918801892B8A2B8B2B53\r\n:10246000A1F00E9431060091850110918601209112\r\n:102470008701309188016C197D098E099F09061723\r\n:1024800017072807390708F442C08091BC0083FD74\r\n:10249000D8CF85EC8093BC000E9431066B017C0193\r\n:1024A0008091CE01823009F44CC08091CD018F3FE4\r\n:1024B00009F469C08091CD01803209F466C0809131\r\n:1024C000CD01803309F463C084E026C0809185018A\r\n:1024D00090918601A0918701B0918801892B8A2B68\r\n:1024E0008B2B09F483CF0E94310600918501109156\r\n:1024F000860120918701309188016C197D098E0930\r\n:102500009F09061717072807390708F06FCF809132\r\n:1025100084010E943C1185E010922B0210922A0245\r\n:1025200010922D02DF91CF911F910F91FF90EF90AC\r\n:10253000DF90CF9008959D9191938F5F6DCF85EE41\r\n:10254000A9CF8091850190918601A0918701B091DA\r\n:102550008801892B8A2B8B2B09F4A2CF0E9431068C\r\n:1025600000918501109186012091870130918801A9\r\n:102570006C197D098E099F09061717072807390767\r\n:1025800008F08ECFC4CF80E0C7CF82E0C5CF83E014\r\n:10259000C3CFEF92FF920F931F93CF93DF937C01F2\r\n:1025A000C62F80916C0290916D02009709F459C07A\r\n:1025B0002091700231E030932D0220932C02109272\r\n:1025C0002B0210922A02DC01ED91FC910190F08126\r\n:1025D000E02D60E009958701EE24E394F12CD1E031\r\n:1025E000C15080916C0290916D02CF3F91F1B0E2A9\r\n:1025F000EB16F104D8F00E94E21180916C029091E8\r\n:102600006D0220917002D0932D0220932C02109223\r\n:102610002B0210922A02DC01ED91FC910190F081D5\r\n:10262000E02D60E00995EE24E394F12C80916C029A\r\n:1026300090916D02F8016491DC01ED91FC910190A3\r\n:10264000F081E02D0995BFEFEB1AFB0A0F5F1F4FDA\r\n:10265000C7CFDF91CF911F910F91FF90EF900C9416\r\n:10266000E211E0917C02F0917D02908180918202E2\r\n:102670008095892380838701C15008F438C0F80110\r\n:10268000849120916A0230916B02232B29F00E94E1\r\n:102690000E090F5F1F4FF0CF28E030E040E8E091D7\r\n:1026A0007802F091790290918002582F5423D9F04A\r\n:1026B0005081952B9083E0917A02F0917B0290817A\r\n:1026C00050918102952B9083E0917A02F0917B02E8\r\n:1026D0005081909181029095952390834695215049\r\n:1026E0003109E9F6D6CF508190959523E3CFDF915C\r\n:1026F000CF911F910F91FF90EF9008951F93CF936B\r\n:10270000DF93EC018D8D9E8D009721F1162F29A16D\r\n:1027100031E030932D0220932C0210922B02109264\r\n:102720002A02DC01ED91FC910190F081E02D60E046\r\n:1027300009958D8D9E8DDC01ED91FC910190F081CC\r\n:10274000E02D612F09958D8D9E8DDF91CF911F9189\r\n:102750000C94E211ADA5BEA59C918BA9809589230F\r\n:102760008C938B8D9C8D892B31F0862FDF91CF91AF\r\n:102770001F910C940E0928E030E080E8A9A5BAA5C5\r\n:1027800099A9462F4823C1F04C91942B9C93ABA55B\r\n:10279000BCA59C914AA9942B9C93ABA5BCA54C913C\r\n:1027A0009AA9909594239C9386952150310931F7ED\r\n:1027B000DF91CF911F9108954C9190959423E6CF8E\r\n:1027C0001F93CF93DF93EC01162F8D8D9E8D892B58\r\n:1027D000B1F12DA93EA94FA958AD60E074E284EF94\r\n:1027E00090E00E94BC1D20513109410951095695C4\r\n:1027F0004795379527952093B80066EA111167EA47\r\n:10280000CE010E947E138D8D9E8D892B41F129ADC5\r\n:102810003AAD4BAD5CAD60E074E284EF90E00E94B5\r\n:10282000BC1D2051310941095109569547953795ED\r\n:1028300027952093B800DF91CF911F9108958B8D3C\r\n:102840009C8D892B21F08EAD9FAD0E941509EFA5BF\r\n:10285000F8A990818CA9809589238083CECFEFA59C\r\n:10286000F8A980819CA9892B8083E5CF90E080E046\r\n:102870000895CF93DF93EC01BC018DE392E00E94B9\r\n:102880001F1064EB70E06C1B7D0B8AE392E0DF911C\r\n:10289000CF910C941F10BC0180E492E00E941F10A5\r\n:1028A0006CE271E080E090E00C9456061F93CF93A9\r\n:1028B000DF93D82FC62F682F84E00E94710511E0A6\r\n:1028C0006D2F612787E00E9471056C2F88E00E94C0\r\n:1028D00071056C2F61278CE00E94710561E085E035\r\n:1028E0000E94BD0568EC70E085E00E94EE0561E0A5\r\n:1028F00086E00E94BD0568EC70E086E0DF91CF9134\r\n:102900001F910C94EE0560E084E00E94710560E088\r\n:1029100087E00E94710560E088E00E94710560E038\r\n:102920008CE00E94710561E085E00E94BD0561E0D8\r\n:1029300085E00E94710561E086E00E94BD0561E0CE\r\n:1029400086E00C9471052091550230915602C90120\r\n:10295000079697FD079623E0959587952A95E1F7C9\r\n:102960002091530230915402829FA001839F500D09\r\n:10297000929F500D112470E060E080916E02909162\r\n:102980006F020C94291FDF92EF92FF920F931F9317\r\n:10299000CF93DF938C01C6E0D0E08230910531F017\r\n:1029A000CAEFDFEF039711F0D0E0C0E00E94A3145C\r\n:1029B00021E030E00130110509F0E6C042E150E0CD\r\n:1029C00068E170E086E290E00E94DA0E21E030E0FB\r\n:1029D00042E150E068E170E08AE590E00E94DA0EA2\r\n:1029E00030E020E044E050E068E170E086E290E012\r\n:1029F0000E94DA0E30E020E044E050E068E170E050\r\n:102A00008AE590E00E94DA0E21E030E048E050E0F4\r\n:102A100064E370E080E490E00E94DA0E30E020E0B1\r\n:102A200044E050E064E370E080E490E00E94DA0E5D\r\n:102A300080916C0290916D02892B09F4F0C0209175\r\n:102A4000840230918502409186025091870260E0B5\r\n:102A500074E284EF90E00E94BC1D205131094109CD\r\n:102A6000510956954795379527952093B80064E00E\r\n:102A700082E790E00E94C912809153029091540223\r\n:102A80008034910509F0E2C060E28FE492E00E9498\r\n:102A90007E1360915302615E8FE492E00E947E1388\r\n:102AA0002091550230915602C901079697FD07966D\r\n:102AB00033E0959587953A95E1F72091530230914F\r\n:102AC0005402829F8001839F100D929F100D11244C\r\n:102AD000C0916E02D0916F0280916C0290916D0254\r\n:102AE0000C0F1D1F009709F4E3C02091700231E024\r\n:102AF00030932D0220932C0210922B0210922A0266\r\n:102B0000DC01ED91FC910190F081E02D60E40995EC\r\n:102B1000EE24E394F12CDD24D39480916C02909107\r\n:102B20006D020C171D0709F49AC0B0E2EB16F10410\r\n:102B3000D8F00E94E21180916C0290916D02209178\r\n:102B40007002D0922D0220932C0210922B02109230\r\n:102B50002A02DC01ED91FC910190F081E02D60E40E\r\n:102B60000995EE24E394F12C80916C0290916D0212\r\n:102B70006991DC01ED91FC910190F081E02D0995C6\r\n:102B8000BFEFEB1AFB0AC9CF4FE050E068E170E0FD\r\n:102B900086E290E00E94DA0E21E030E04FE050E063\r\n:102BA00068E170E08AE590E00E94DA0E30E020E013\r\n:102BB00046E050E068E170E0CE0186960E94DA0EB1\r\n:102BC00030E020E046E050E068E170E0CE01865A57\r\n:102BD0009F4F0E94DA0EEE24E394F12C08E010E0FF\r\n:102BE00028E230E042E350E06CE270E08FE492E0F3\r\n:102BF0000E94D70D0FEF1FEF21E044E050E066E3A5\r\n:102C000070E083E590E00E94FF0D22E044E050E098\r\n:102C100066E370E08CE290E00E94FF0D09CF8091A6\r\n:102C20006A0290916B02892B31F080918D02909114\r\n:102C30008E020E941509E0917E02F0917F02908140\r\n:102C40008091830280958923808311CF60E08FE497\r\n:102C500092E00E947E136091530261501DCF0E944A\r\n:102C6000E21180916C0290916D02892B09F461C090\r\n:102C7000209188023091890240918A0250918B0202\r\n:102C800060E074E284EF90E00E94BC1D20513109A5\r\n:102C90004109510956954795379527952093B800D6\r\n:102CA000DF91CF911F910F91FF90EF90DF900895EA\r\n:102CB000E0917C02F0917D02808190918202892BCB\r\n:102CC00080830C171D0769F2899120916A02309167\r\n:102CD0006B02232B19F00E940E09F3CF28E030E09D\r\n:102CE00040E8E0917802F091790290918002582FAB\r\n:102CF0005423D9F05081952B9083E0917A02F09182\r\n:102D00007B02908150918102952B9083E0917A0211\r\n:102D1000F0917B0250819091810290959523908350\r\n:102D2000469521503109E9F6CCCF508190959523F5\r\n:102D3000E3CFE0917E02F0917F0280819091830247\r\n:102D4000892B8083ADCF0E94241F85ED8093BC002A\r\n:102D50008091850190918601A0918701B0918801B1\r\n:102D60000796A11DB11D23E0B695A7959795879568\r\n:102D70002A95D1F72091BC0024FD03C01092CE010A\r\n:102D8000089540918501509186016091870170916D\r\n:102D90008801452B462B472B69F30097A105B10508\r\n:102DA00041F02AE22A95F1F700C00197A109B10983\r\n:102DB000E1CF809184010C943C110F931F9360E04C\r\n:102DC00089E00E94710583E090E00197F1F761E0EE\r\n:102DD00089E00E94710583E290E00197F1F760E0DD\r\n:102DE00089E00E947105EAE6FAE06491E6E5FAE01E\r\n:102DF000E491F0E0EE0FFF1FE859FF4F85919491A9\r\n:102E000008EA11E620E030E0462F0E944B196115D8\r\n:102E1000710581059105A9F06F5F7F4F8F4F9F4F1F\r\n:102E20009F70611571058105910559F02AE330E025\r\n:102E300040E050E00E94BC1DCA01B9011F910F91F2\r\n:102E4000089520E931E040E050E0F6CF1F920F9264\r\n:102E50000FB60F9211242F933F938F939F93AF93AD\r\n:102E6000BF938091220290912302A0912402B091FD\r\n:102E700025023091210223E0230F2D3758F50196CA\r\n:102E8000A11DB11D20932102809322029093230261\r\n:102E9000A0932402B09325028091260290912702EC\r\n:102EA000A0912802B09129020196A11DB11D809325\r\n:102EB000260290932702A0932802B0932902BF9183\r\n:102EC000AF919F918F913F912F910F900FBE0F90D7\r\n:102ED0001F90189526E8230F0296A11DB11DD2CF91\r\n:102EE0001F920F920FB60F9211242F933F934F937F\r\n:102EF0005F936F937F938F939F93AF93BF93CF9382\r\n:102F0000DF93EF93FF938091F401C091F501D0E03E\r\n:102F100087FF24C010928500109284008091F401F4\r\n:102F20008F5F8093F4018091F401082E000C990BBF\r\n:102F30008C179D0724F48091F4018C30C4F18091AA\r\n:102F4000840090918500049680349C4908F47AC0EE\r\n:102F50008091840090918500049676C08091F40160\r\n:102F6000082E000C990B8C179D07C4F6E091F40114\r\n:102F70008E2FEE0F990BFC01EE0FFF1FE80FF91FCC\r\n:102F8000EA50FE4F808186FFC9CFE091F4018E2F79\r\n:102F9000EE0F990BFC01EE0FFF1FE80FF91FEA502F\r\n:102FA000FE4F808160E08F730E947105B7CF209142\r\n:102FB000840030918500E091F4018E2FEE0F990B83\r\n:102FC000FC01EE0FFF1FE80FF91FEA50FE4F818151\r\n:102FD0009281820F931F9093890080938800E091E3\r\n:102FE000F4018E2FEE0F990BFC01EE0FFF1FE80F7F\r\n:102FF000F91FEA50FE4F808186FF11C0E091F40175\r\n:103000008E2FEE0F990BFC01EE0FFF1FE80FF91F3B\r\n:10301000EA50FE4F808161E08F730E947105FF913D\r\n:10302000EF91DF91CF91BF91AF919F918F917F9160\r\n:103030006F915F914F913F912F910F900FBE0F9025\r\n:103040001F90189580E49CE99093890080938800F4\r\n:103050008FEF8093F401E3CF1F920F920FB60F9280\r\n:1030600011242F933F934F935F936F937F938F938D\r\n:103070009F93AF93BF93EF93FF938091B900887FA5\r\n:10308000803609F44AC0F0F5883209F4A7C018F573\r\n:10309000803109F49BC0B8F4882309F4F9C0883062\r\n:1030A00009F494C0FF91EF91BF91AF919F918F91DF\r\n:1030B0007F916F915F914F913F912F910F900FBE34\r\n:1030C0000F901F901895883109F488C0803251F70D\r\n:1030D0008093CD0114C0803409F49DC040F4803346\r\n:1030E000B9F38833F9F68093CD0185ECB0C0803513\r\n:1030F00009F485C0883509F496C0883499F60E9491\r\n:10310000A516D0CF883909F48CC038F5883729F056\r\n:1031100050F4883611F0803729F683E08093CE0191\r\n:103120001092CC0157C0883809F47BC0803919F05F\r\n:10313000803809F0B7CF8091CC01803208F071C09F\r\n:10314000E091CC0181E08E0F8093CC018091BB0097\r\n:10315000F0E0E455FE4F80833DC0803B39F0E0F461\r\n:10316000803A09F479C0883A09F09CCF84E08093D2\r\n:10317000CE011092AB011092AA01E0911D02F091D4\r\n:103180001E0209958091AA0181110FC081E08093F0\r\n:10319000AA0110928A0109C0803C09F4A6CF883C9C\r\n:1031A00009F4A3CF883B09F07DCFE091AB0181E02A\r\n:1031B0008E0F8093AB01F0E0E657FE4F8081809345\r\n:1031C000BB009091AB018091AA0129C08091F301CD\r\n:1031D0008093BB0085EC8093BC0064CF9091F2019A\r\n:1031E0008091F101981758F5E091F20181E08E0F7E\r\n:1031F0008093F201F0E0EF52FE4F8081E9CFE09141\r\n:10320000F20181E08E0F8093F2018091BB00F0E02B\r\n:10321000EF52FE4F80839091F2018091F101981757\r\n:10322000C8F285E8D8CFE091F20181E08E0F80935B\r\n:10323000F2018091BB00F0E0EF52FE4F808380915D\r\n:10324000D00181115CCF81E08093CF0184EA80932B\r\n:10325000BC001092CE0126CF85EC8093BC0010926A\r\n:10326000CE018091CC01803230F4E091CC01F0E0CD\r\n:10327000E455FE4F10826091CC0170E0E0911B029A\r\n:10328000F0911C028CEA91E009951092CC010ACFD2\r\n:103290001092CD0134CFCF92DF92EF92FF920F9335\r\n:1032A0001F93E82FF92F05C0015011092109310999\r\n:1032B00061F1908196239417B9F305C0015011096B\r\n:1032C0002109310911F1908196239413F7CFC12C74\r\n:1032D000D12CE12CF12C0AC08FEFC81AD80AE80AC9\r\n:1032E000F80A0C151D052E053F0579F0808186230F\r\n:1032F000841791F36C2D7D2D8E2D9F2D1F910F9195\r\n:10330000FF90EF90DF90CF90089560E070E080E054\r\n:1033100090E01F910F91FF90EF90DF90CF90089574\r\n:10332000FC019091F5019C3098F481E0890F809325\r\n:10333000F5019083892F90E0FC01EE0FFF1FE80F4D\r\n:10334000F91FEA50FE4F88EB9BE09283818308953A\r\n:103350008FEF80830895A3E4B2E013961C921E922F\r\n:10336000129748EE53E060E070E014964D935D9341\r\n:103370006D937C9317978AE091E011969C938E93BE\r\n:10338000EFE4F2E01382128220E830E035832483F8\r\n:1033900080E490E0978386833187208793878287B4\r\n:1033A000168A158614861786168681E0858B848B8F\r\n:1033B0002FEF3FEF338B228B318B208B878B108E3F\r\n:1033C000128E118E8CE191E091838083148E138E86\r\n:1033D000B68FA58F10A2178E8FEF84A385A386A327\r\n:1033E00087A380A780E89AE1A6E0B0E085AB96AB22\r\n:1033F000A7ABB0AF80EA96E8A1E0B0E081AF92AFB2\r\n:10340000A3AFB4AF80E586AF17AE80E492E00E9430\r\n:1034100090198DE392E00E9490198AE392E00E9455\r\n:10342000901987E392E00E94901984E392E00E9451\r\n:10343000901981E392E00E9490198EE292E00C9440\r\n:103440009019789484B5826084BD84B5816084BD10\r\n:1034500085B5826085BD85B5816085BD80916E0032\r\n:10346000816080936E001092810080918100826063\r\n:1034700080938100809181008160809381008091A0\r\n:1034800080008160809380008091B100846080938F\r\n:10349000B1008091B00081608093B00080917A008B\r\n:1034A000846080937A0080917A00826080937A00B1\r\n:1034B00080917A00816080937A0080917A008068A0\r\n:1034C00080937A001092C10061E084E00E94BD0503\r\n:1034D00061E087E00E94BD0561E088E00E94BD05D3\r\n:1034E00061E08CE00E94BD0561E089E00E94BD05BD\r\n:1034F00060E08AE00E94BD0563E070E080E492E055\r\n:103500000E949B106AE570E080E492E00E941F1028\r\n:103510006BE070E08DE392E00E949B1062E070E04F\r\n:103520008AE392E00E949B108AE590E00E943914A1\r\n:103530006DE070E087E392E00E949B106EE070E027\r\n:1035400084E392E00E949B106CE870E087E392E0D5\r\n:103550000E941F1068E270E084E392E00E941F1056\r\n:103560006FE070E081E392E00E949B1060E170E008\r\n:103570008EE292E00E949B1064E170E081E392E0B1\r\n:103580000E941F1064E170E08EE292E00E941F1022\r\n:1035900080916E0290916F02892B11F10E94A31409\r\n:1035A000209155023091560280915302909154021D\r\n:1035B000213231050CF053C0B9016052710977FF17\r\n:1035C00002C06F5F7F4F759567958357910997FD8F\r\n:1035D000019600E210E023E730E048E955E052C0F0\r\n:1035E0002091550230915602C901079697FD079622\r\n:1035F000B3E095958795BA95E1F720915302309104\r\n:103600005402AC01429FC001439F900D529F900D08\r\n:1036100011240E94FF1D90936F0280936E02892BEC\r\n:1036200009F0BCCF90E080E00E94C314C0E0D0E07D\r\n:103630000E94DD166A317105810591050CF414C2F2\r\n:1036400061E081E00E9456146EE170E080E090E05D\r\n:103650000E945606209761F30E940000E9CFB9014D\r\n:103660006054710977FF02C06F5F7F4F7595679552\r\n:103670008255910997FD019600E410E022E530E0C3\r\n:1036800048E757E0959587950E94100F82E0809358\r\n:10369000710280916C0290916D02892B09F494C0A3\r\n:1036A0008CE3809370021092200210921F021092FD\r\n:1036B0002B0210922A020E941E1188E896E0909335\r\n:1036C0001E0280931D0289E896E090931C0280936D\r\n:1036D0001B028091770287FD1EC061E00E94BD053C\r\n:1036E00061E0809177020E94710561E070E080E006\r\n:1036F00090E00E94560660E0809177020E9471057A\r\n:103700006AE070E080E090E00E94560661E08091FF\r\n:1037100077020E94710580916C0290916D02892B55\r\n:1037200009F411C1209184023091850240918602F2\r\n:103730005091870260E074E284EF90E00E94BC1D2B\r\n:1037400020513109410951095695479537952795DB\r\n:103750002093B80064E084E995E00E94C91260916A\r\n:10376000550261508FE492E00E947E1364E080E98C\r\n:1037700095E00E94C9128091710264E1813009F4E0\r\n:1037800060E18FE492E00E947E1364E08CE895E0B3\r\n:103790000E94C9128FE880938C028091530290910D\r\n:1037A00054028038910509F031C180915502909101\r\n:1037B00056028034910509F039C18091710281303F\r\n:1037C00009F4D8C08FECD7C061E0809175020E94E7\r\n:1037D000BD0561E0809176020E94BD058091750271\r\n:1037E000082E000C990BFC01E45BF54FE491F0E02E\r\n:1037F000EE0FFF1FEE5BF54F2591349130937D0264\r\n:1038000020937C02FC01E05AF54FE491E0938202A0\r\n:1038100080917602082E000C990BFC01E45BF54FB9\r\n:10382000E491F0E0EE0FFF1FEE5BF54FA591B49130\r\n:10383000B0937F02A0937E02FC01E05AF54FE49121\r\n:10384000E09383028C91E82BEC9380916A02909133\r\n:103850006B02892B09F434C0CFB7F89480911A0217\r\n:10386000811127C0E6E5FAE08491EAE6FAE0949156\r\n:10387000E82FF0E0EE0FFF1FE85CF54FA591B49143\r\n:10388000EC91E92321F461E08AE00E94710561E096\r\n:103890008AE00E94BD058CB580618CBD8CB58064CA\r\n:1038A0008CBD61E08DE00E94BD0561E08BE00E946F\r\n:1038B000BD0580911A028F5F80931A02CFBF09CF96\r\n:1038C00061E0809173020E94BD0561E08091740205\r\n:1038D0000E94BD0580917302082E000C990BFC011B\r\n:1038E000E45BF54FE491F0E0EE0FFF1FEE5BF54F68\r\n:1038F000259134913093790220937802FC01E05AAB\r\n:10390000F54FE491E093800280917402082E000C40\r\n:10391000990BFC01E45BF54FE491F0E0EE0FFF1F23\r\n:10392000EE5BF54FA591B491B0937B02A0937A0220\r\n:10393000FC01E05AF54FE491E09381028C91E0950F\r\n:10394000E823EC93C6CE80916A0290916B02892B9A\r\n:1039500031F080918D0290918E020E941509E091C4\r\n:103960007E02F0917F02908180918302809589236D\r\n:103970008083F0CE8FE980938C02C2E16AED8FE400\r\n:1039800092E00E947E136C2F8FE492E00E947E13DF\r\n:1039900061E88FE492E00E947E1360918C028FE4D4\r\n:1039A00092E00E947E1369ED8FE492E00E947E1304\r\n:1039B0008091710261EF813009F462E28FE492E05C\r\n:1039C0000E947E1366E086E895E00E94C91280910D\r\n:1039D0006C0290916D02892BE9F12091880230915F\r\n:1039E000890240918A0250918B0260E074E284EF78\r\n:1039F00090E00E94BC1D20513109410951095695A2\r\n:103A00004795379527952093B8000CCE80369105C1\r\n:103A100089F48091550290915602409739F4809133\r\n:103A20007102813029F08FEA80938C02C2E0A6CF28\r\n:103A300080E1FACF80349105C9F7809155029091C9\r\n:103A40005602809799F780917102813009F0BACEC1\r\n:103A500080E191CFE0917E02F0917F028081909190\r\n:103A60008302892B8083DECD0E94831481E090E065\r\n:103A70000E94C31488E290E00E94391480EA90E02A\r\n:103A80000E944B140E94DD164B015C0182E090E025\r\n:103A90000E94C31484E190E00E944B140E94DD1642\r\n:103AA0006B017C0183E090E00E94C3148AE590E002\r\n:103AB0000E944B1461E0C814D904EA04FB040CF022\r\n:103AC00060E081E0C814D904EA04FB040CF480E04F\r\n:103AD0000E94561468E072E080E090E00E94560672\r\n:103AE0000E94831490E080E00E94C3148AE590E075\r\n:103AF0000E943914A9CD8CE191E0909350028093FB\r\n:103B00004F0280916E0290916F02009711F00C9419\r\n:103B10009B1E0895052E97FB1EF400940E94A11D84\r\n:103B200057FD07D00E94BC1D07FC03D04EF40C9437\r\n:103B3000A11D50954095309521953F4F4F4F5F4FB8\r\n:103B4000089590958095709561957F4F8F4F9F4F09\r\n:103B500008950E94DE1DA59F900DB49F900DA49F17\r\n:103B6000800D911D11240895B7FF0C94A91D0E948A\r\n:103B7000A91D821B930B0895A1E21A2EAA1BBB1B41\r\n:103B8000FD010DC0AA1FBB1FEE1FFF1FA217B30729\r\n:103B9000E407F50720F0A21BB30BE40BF50B661F3F\r\n:103BA000771F881F991F1A9469F760957095809503\r\n:103BB00090959B01AC01BD01CF010895A29FB0017A\r\n:103BC000B39FC001A39F700D811D1124911DB29F51\r\n:103BD000700D811D1124911D0895991B79E004C079\r\n:103BE000991F961708F0961B881F7A95C9F780953C\r\n:103BF0000895EE0FFF1F0590F491E02D09940F93A7\r\n:103C00001F93CF93DF938230910510F482E090E010\r\n:103C1000E0919102F091920230E020E0B0E0A0E06B\r\n:103C2000309799F42115310509F44AC0281B390B46\r\n:103C300024303105D8F58A819B816115710589F1A0\r\n:103C4000FB0193838283FE0111C040815181028177\r\n:103C5000138148175907E0F04817590799F410974E\r\n:103C600061F012960C93129713961C933296CF0123\r\n:103C7000DF91CF911F910F910895009391021093BE\r\n:103C80009202F4CF2115310551F04217530738F055\r\n:103C9000A901DB019A01BD01DF01F801C1CFEF01EC\r\n:103CA000F9CF9093920280939102CDCFFE01E20F63\r\n:103CB000F31F819391932250310939832883D7CF01\r\n:103CC00020918F0230919002232B41F42091020128\r\n:103CD000309103013093900220938F0220910001D4\r\n:103CE000309101012115310541F42DB73EB74091C6\r\n:103CF000040150910501241B350BE0918F02F091D6\r\n:103D00009002E217F307A0F42E1B3F0B2817390788\r\n:103D100078F0AC014E5F5F4F2417350748F04E0F27\r\n:103D20005F1F5093900240938F02819391939FCF96\r\n:103D3000F0E0E0E09CCFCF93DF930097E9F0FC0147\r\n:103D4000329713821282A0919102B0919202ED01FA\r\n:103D500030E020E01097A1F420813181820F931F81\r\n:103D600020918F02309190022817390709F061C025\r\n:103D7000F0939002E0938F02DF91CF910895EA01D2\r\n:103D8000CE17DF07E8F54A815B819E014115510599\r\n:103D9000B1F7E901FB83EA8349915991C40FD51F1B\r\n:103DA000EC17FD0761F4808191810296840F951FC5\r\n:103DB000E90199838883828193819B838A83F0E0E0\r\n:103DC000E0E012968D919C9113970097B9F52D9193\r\n:103DD0003C911197CD010296820F931F20918F0283\r\n:103DE000309190022817390739F6309751F5109223\r\n:103DF000920210929102B0939002A0938F02BCCFD6\r\n:103E0000D383C28340815181840F951FC817D9077E\r\n:103E100061F44E5F5F4F88819981480F591F51832C\r\n:103E200040838A819B81938382832115310509F028\r\n:103E3000B0CFF0939202E09391029ECFFD01DC019E\r\n:103E4000C0CF13821282D7CF81E090E0F8940C9417\r\n:103E5000301FDC0101C06D9341505040E0F70895E0\r\n:103E600015E0C5E4D5E004C0FE010E94F91D2196CD\r\n:0A3E7000C634D107C9F7F894FFCF5C\r\n:103E7A0000009302800000000000B311861136147E\r\n:103E8A0070057F116C115D1100000000550B8A0648\r\n:103E9A0036141E105E087005090FD70DF30DE70DD5\r\n:103EAA00710F70051909E013CE071708200D030DCD\r\n:043EBA008B0C2C0C35\r\n:00000001FF\r\n";
var PICK_SKETCH = "// Robot de orugas que recoge dos cubos del suelo, uno con cada mano, los levanta un momento y los suelta.\n// Cuello (servo): D3. Hombros: izquierdo D11, derecho D2. Codos: izquierdo D13, derecho A0. Pinzas: izquierda A1, derecha A2. Pantalla OLED por I2C: SDA=A4, SCL=A5.\n// Los servos del lado derecho van en espejo: reciben 180 - angulo para moverse igual que los del izquierdo.\n#include <Wire.h>\n#include <Servo.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 pantalla(128, 64, &Wire, -1);\nServo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;\n\n// hombro: 90 = brazo colgando, menos de 90 = lo adelanta (0 = horizontal). codo: 90 = antebrazo recto, mas de 90 = lo dobla hacia adelante. pinza: 0 = muy abierta, 90 = casi cerrada.\nvoid brazos(int hombro, int codo, int pinza) {\n  hombroIzq.write(hombro); hombroDer.write(180 - hombro);\n  codoIzq.write(codo);     codoDer.write(180 - codo);\n  pinzaIzq.write(pinza);   pinzaDer.write(pinza);\n}\n\n// Cara: 0 = normal, 1 = contento (ojos cerrados en arco y sonrisa grande)\nvoid cara(int estado) {\n  pantalla.clearDisplay();\n  if (estado == 1) {\n    pantalla.fillCircle(38, 28, 15, SSD1306_WHITE); pantalla.fillCircle(90, 28, 15, SSD1306_WHITE);\n    pantalla.fillRect(20, 28, 36, 20, SSD1306_BLACK); pantalla.fillRect(72, 28, 36, 20, SSD1306_BLACK);   // solo la mitad de arriba: ojos sonrientes\n    pantalla.fillRoundRect(34, 46, 60, 12, 6, SSD1306_WHITE);\n  } else {\n    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);\n    pantalla.fillCircle(38, 24, 6, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 6, SSD1306_BLACK);\n    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);\n  }\n  pantalla.display();\n}\n\nvoid setup() {\n  cuello.attach(3); cuello.write(90);\n  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);\n  brazos(90, 140, 20);                    // brazos colgando con los antebrazos doblados y pinzas abiertas\n  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  cara(0);\n  delay(1200);\n\n  brazos(28, 28, 20);   delay(1500);      // baja los brazos hacia los cubos, con las pinzas abiertas\n  brazos(28, 28, 64);   delay(1000);      // cierra las pinzas: agarra los cubos\n  cara(1);\n  brazos(0, 50, 64);    delay(1500);      // levanta los brazos con los cubos\n  brazos(28, 28, 64);   delay(1500);      // los baja otra vez al suelo\n  brazos(28, 28, 20);   delay(1000);      // abre las pinzas: los suelta\n  brazos(90, 140, 20);   delay(800);       // vuelve a colgar los brazos\n  cara(0);\n}\n\nvoid loop() {}\n";
var PICK_HEX = ":100000000C9441050C9469050C9469050C946905E0\r\n:100010000C9469050C9469050C9469050C946905A8\r\n:100020000C9469050C9469050C9469050C94C91627\r\n:100030000C9469050C9469050C9469050C94690588\r\n:100040000C947F160C9469050C9469050C94690551\r\n:100050000C9469050C9469050C9469050C94690568\r\n:100060000C9485170C9469052200FF210000000004\r\n:10007000003E5B4F5B3E3E6B4F6B3E1C3E7C3E1C2E\r\n:10008000183C7E3C181C577D571C1C5E7F5E1C0074\r\n:10009000183C1800FFE7C3E7FF0018241800FFE72B\r\n:1000A000DBE7FF30483A060E2629792926407F05EE\r\n:1000B0000507407F05253F5A3CE73C5A7F3E1C1C04\r\n:1000C00008081C1C3E7F14227F22145F5F005F5FC4\r\n:1000D00006097F017F006689956A606060606094B0\r\n:1000E000A2FFA29408047E040810207E20100808B5\r\n:1000F0002A1C08081C2A08081E101010100C1E0CC0\r\n:100100001E0C30383E3830060E3E0E060000000051\r\n:100110000000005F00000007000700147F147F1438\r\n:10012000242A7F2A1223130864623649562050007D\r\n:1001300008070300001C2241000041221C002A1C69\r\n:100140007F1C2A08083E0808008070300008080854\r\n:100150000808000060600020100804023E51494574\r\n:100160003E00427F400072494949462141494D3392\r\n:100170001814127F1027454545393C4A49493141F9\r\n:10018000211109073649494936464949291E0000C7\r\n:10019000140000004034000000081422411414141C\r\n:1001A0001414004122140802015909063E415D5908\r\n:1001B0004E7C1211127C7F494949363E4141412211\r\n:1001C0007F4141413E7F494949417F090909013E3B\r\n:1001D000414151737F0808087F00417F4100204062\r\n:1001E000413F017F081422417F404040407F021C74\r\n:1001F000027F7F0408107F3E4141413E7F0909098B\r\n:10020000063E4151215E7F09192946264949493256\r\n:1002100003017F01033F4040403F1F2040201F3F1C\r\n:100220004038403F631408146303047804036159A1\r\n:10023000494D43007F4141410204081020004141E3\r\n:10024000417F04020102044040404040000307088F\r\n:100250000020545478407F2844443838444444288B\r\n:10026000384444287F385454541800087E09021832\r\n:10027000A4A49C787F0804047800447D40002040BA\r\n:10028000403D007F1028440000417F40007C0478FE\r\n:1002900004787C080404783844444438FC18242446\r\n:1002A0001818242418FC7C080404084854545424C6\r\n:1002B00004043F44243C4040207C1C2040201C3C43\r\n:1002C0004030403C44281028444C9090907C44643A\r\n:1002D000544C4400083641000000770000004136CD\r\n:1002E000080002010204023C2623263C1EA1A16153\r\n:1002F000123A4040207A3854545559215555794185\r\n:100300002254547842215554784020545579400C59\r\n:100310001E5272123955555559395454545939553C\r\n:100320005454580000457C410002457D420001457F\r\n:100330007C407D1211127DF0282528F07C54554513\r\n:10034000002054547C547C0A097F4932494949327F\r\n:100350003A4444443A324A4848303A4141217A3A90\r\n:1003600042402078009DA0A07D3D4242423D3D405C\r\n:1003700040403D3C24FF2424487E4943662B2FFC0B\r\n:100380002F2BFF0929F620C0887E090320545479B9\r\n:10039000410000447D413048484A32384040227A8A\r\n:1003A000007A0A0A727D0D19317D2629292F282607\r\n:1003B0002929292630484D4020380808080808080F\r\n:1003C0000808382F10C8ACBA2F102834FA00007B68\r\n:1003D000000008142A142222142A1408550055007B\r\n:1003E00055AA55AA55AAFF55FF55FF000000FF006A\r\n:1003F000101010FF00141414FF001010FF00FF1065\r\n:1004000010F010F0141414FC001414F700FF000096\r\n:10041000FF00FF1414F404FC141417101F10101F15\r\n:10042000101F1414141F00101010F0000000001F03\r\n:10043000101010101F10101010F010000000FF100E\r\n:100440001010101010101010FF10000000FF14000A\r\n:1004500000FF00FF00001F10170000FC04F414143C\r\n:100460001710171414F404F40000FF00F714141408\r\n:1004700014141414F700F7141414171410101F1088\r\n:100480001F141414F4141010F010F000001F101FAB\r\n:100490000000001F14000000FC140000F010F01019\r\n:1004A00010FF10FF141414FF141010101F00000090\r\n:1004B00000F010FFFFFFFFFFF0F0F0F0F0FFFFFF94\r\n:1004C0000000000000FFFF0F0F0F0F0F38444438EB\r\n:1004D00044FC4A4A4A347E02020606027E027E023A\r\n:1004E00063554941633844443C04407E201E200645\r\n:1004F000027E020299A5E7A5991C2A492A1C4C7282\r\n:1005000001724C304A4D4D303048784830BC625A08\r\n:10051000463D3E494949007E0101017E2A2A2A2A98\r\n:100520002A44445F444440514A444040444A514074\r\n:100530000000FF0103E080FF000008086B6B083635\r\n:1005400012362436060F090F0600001818000000A6\r\n:100550001010003040FF0101001F01011E00191D95\r\n:100560001712003C3C3C3C00000000000001030767\r\n:100570000F1F3F7F0080C0E0F0F8FCFEDB40A4A628\r\n:100580002EAF2000A1C8D300408DAED580A80000BA\r\n:10059000600000000000000000000000000000E01B\r\n:1005A0000000000000000000000000000001E0006A\r\n:1005B00000000000000000000000000001F000004A\r\n:1005C000000000000000000000000003F000000038\r\n:1005D0000000000000000000000007F00000000024\r\n:1005E00000000000000000000007F800000000000C\r\n:1005F00000000000000000000FF800000003C00031\r\n:100600007E000001E0007F0FF800000003C000FE44\r\n:10061000000001E000FFEFF800000003C000FE0052\r\n:100620000001E000FFFFF800000003C000F0000040\r\n:10063000000F007FFE7FC0000003C000F00000003C\r\n:100640000F003FFE7FF83FF1FBCFFCFEF3BC3DEF18\r\n:10065000E01FFE7FFF7FFBFFDFFEFEFFBC3DEFE004\r\n:100660001FC6FFFF7FFBFFDFFEFEFFBC3DEFE00F7D\r\n:10067000E3C7FE787BC3DE1EF0FFBC3DEF0007FF43\r\n:1006800087FC787BC3DE1EF0F83C3DEF0001FFFFE6\r\n:10069000F0007BC3C01EF0F03C3DEF0001F37FE0B3\r\n:1006A0003FFBC3CFFEF0F03C3DEF0003E33F807F14\r\n:1006B000FBC3DFFEF0F03C3DEF0007E73C00787B3A\r\n:1006C000C3DE1EF0F03C3DEF0007FFBE00787BC3A9\r\n:1006D000DE1EF0F03C3DEF0007FFFE00787BC3DE3E\r\n:1006E0001EF0F03C3DEF000FFFFE007FFBFFDFFE42\r\n:1006F000F0F03FFDEFE00FFFFF007FFBFFDFFEF0BC\r\n:10070000F03FFDEFE00FF9FF003E79F9CF9EF0F0EA\r\n:100710001F3DE7E01FF1FF000000000000000000A7\r\n:100720000000001F80FF007FFFFFFFFFFFFFFFFFB4\r\n:10073000FFE01C007F007FFFFFFFFEB46D888D1877\r\n:10074000E000001F007FFFFFFFFE95AD7DB577E065\r\n:1007500000000F007FFFFFFFFEA5AD9D8D19E0009B\r\n:100760000006007FFFFFFFFEB5ADEDB57EE00000A7\r\n:100770000000000180000000000000000000038075\r\n:1007800000000000000000000007C00000000000A2\r\n:100790000000000007C00000000000000000000F83\r\n:1007A000C00000000000000000001FE0000000008A\r\n:1007B00000000000001FE00000000000000000003A\r\n:1007C0003FE00000000000000000003FF0000000DB\r\n:1007D0000000000000007FF0000000000000001F8B\r\n:1007E000F87FF0000000000000003FFE7FF00000F6\r\n:1007F00000000000003FFF7FF0000000000000004C\r\n:100800001FFFFBE0000000000000000FFFF9FFC029\r\n:100810000000000000000FFFF9FFF80000000000DA\r\n:100820000007FFF1FFFF00000000000003FC73FF62\r\n:10083000FF80000000000001FE3FFFFF800000007D\r\n:10084000000000FF1E0FFF000000000000007FFE00\r\n:100850001FFC000000000000003FFFFFF800000048\r\n:10086000000000000FDFFFE0000000000000001F9C\r\n:1008700019FFC0000000000000003F3CFF00000026\r\n:1008800000000000007E7CF8000000000000000076\r\n:100890007FFE7C0000000000000000FFFFFC000065\r\n:1008A000000000000000FFFFFE000000000000004C\r\n:1008B00000FFFFFE0000000000000001FFEFFE004F\r\n:1008C00000000000000001FFCFFE0000000000005B\r\n:1008D0000003FF07FE0000000000000003FC07FE0D\r\n:1008E0000000000000000003F003FE000000000014\r\n:1008F0000000018000FE0000000000000000000079\r\n:100900007E000000000000000000003E000000002B\r\n:100910000000000000000C00000000000007800044\r\n:10092000FC000003C0000000078001FC000003C0C1\r\n:10093000000000078001FC000003C00000000780E9\r\n:1009400001E00000001E000000078001E000000040\r\n:100950001E007FE3F79FF9FDE7787BDFC0FFF7FF1D\r\n:10096000BFFDFDFF787BDFC0FFF7FFBFFDFDFF7818\r\n:100970007BDFC0F0F787BC3DE1FF787BDE00F0F75E\r\n:1009800087BC3DE1F0787BDE0000F787803DE1E049\r\n:10099000787BDE007FF7879FFDE1E0787BDE00FF5C\r\n:1009A000F787BFFDE1E0787BDE00F0F787BC3DE133\r\n:1009B000E0787BDE00F0F787BC3DE1E0787BDE008D\r\n:1009C000F0F787BC3DE1E0787BDE00FFF7FFBFFD7D\r\n:1009D000E1E07FFBDFC0FFF7FFBFFDE1E07FFBDF72\r\n:1009E000C07CF3F39F3DE1E03E7BCFC00000000000\r\n:1009F00000000000000000FFFFFFFFFFFFFFFFFF00\r\n:100A0000FFC0FFFFFFFFFD68DB111A31C0FFFFFFD2\r\n:100A1000FFFD2B5AFB6AEFC0FFFFFFFFFD4B5B3B67\r\n:100A20001A33C0FFFFFFFFFD6B5BDB6AFDC00000F8\r\n:100A3000000800020100000304070000000000009D\r\n:100A4000000000000000250028002B00000000002E\r\n:100A5000240027002A0004040404040404040202FD\r\n:100A6000020202020303030303030102040810202D\r\n:100A70004080010204081020010204081020BF1861\r\n:100A8000631C11241FBECFEFD8E0DEBFCDBF11E045\r\n:100A9000A0E0B1E0EAE4FCE302C005900D92A434CA\r\n:100AA000B107D9F722E0A4E4B1E001C01D92A33957\r\n:100AB000B207E1F715E0C0E4D5E004C02197FE01DC\r\n:100AC0000E94E11CCF33D107C9F70E9435190C945D\r\n:100AD000181E0C940000089590E0FC01E659F54FB3\r\n:100AE00024918A5A954FFC018491882399F090E0D3\r\n:100AF000880F991FFC01E45BF54FA591B491FC01AF\r\n:100B0000EE5BF54F859194918FB7F894EC91E22BC1\r\n:100B1000EC938FBF089590E0FC01E25DF54F2491C6\r\n:100B2000FC01E659F54F3491FC01EA5AF54FE49186\r\n:100B3000EE23C9F0222339F0233001F1A8F421304B\r\n:100B400019F1223029F1F0E0EE0FFF1FEE5BF54FB7\r\n:100B5000A591B4918FB7F894EC91611126C03095AE\r\n:100B60003E233C938FBF08952730A9F02830C9F069\r\n:100B7000243049F7809180008F7D03C080918000F0\r\n:100B80008F7780938000DFCF84B58F7784BDDBCFF4\r\n:100B900084B58F7DFBCF8091B0008F778093B000BC\r\n:100BA000D2CF8091B0008F7DF9CF3E2BDACF3FB707\r\n:100BB000F8948091260290912702A0912802B0918A\r\n:100BC000290226B5A89B05C02F3F19F00196A11D4B\r\n:100BD000B11D3FBFBA2FA92F982F8827BC01CD0187\r\n:100BE000620F711D811D911D42E0660F771F881FE6\r\n:100BF000991F4A95D1F708958F929F92AF92BF9215\r\n:100C0000CF92DF92EF92FF924B015C010E94D705D9\r\n:100C10006B017C010E94D7056C197D098E099F0923\r\n:100C2000683E734081059105A8F321E0821A91087E\r\n:100C3000A108B10888EEC80E83E0D81EE11CF11CA3\r\n:100C400081149104A104B10429F7FF90EF90DF9083\r\n:100C5000CF90BF90AF909F908F9008950895089582\r\n:100C6000AF92BF92CF92DF92EF92FF920F931F93BA\r\n:100C7000CF93DF936C017B018B01040F151FEB01F8\r\n:100C80005E01AE18BF08C017D10759F06991D601AF\r\n:100C9000ED91FC910190F081E02DC6010995892B21\r\n:100CA00079F7C501DF91CF911F910F91FF90EF90E0\r\n:100CB000DF90CF90BF90AF900895EF92FF920F9387\r\n:100CC0001F93CF93DF93EC01EC80FD806E157F05C1\r\n:100CD0000CF070C057FF04C0240F351F50E040E0F7\r\n:100CE0008E819F81FA01E20FF31F8E179F071CF47C\r\n:100CF0009C01241B350B121613060CF05BC0922FBF\r\n:100D0000842F8695869586958E9DD0018F9DB00DFA\r\n:100D100011246A0F7B1FAF8DB8A1A60FB71F4770B4\r\n:100D200049F188E0841B482F682F70E0FB01EC58E4\r\n:100D3000FA4FE491281708F063C0621B71092FEF86\r\n:100D400030E002C0359527956A95E2F7E22301303D\r\n:100D5000110539F0B0F10230110561F58C91E827E9\r\n:100D600002C08C91E82BEC93941720F12C813D81EB\r\n:100D7000A20FB31FE92FE41BE83078F00230110511\r\n:100D800021F58E2F9C9190959C932C813D81A20FF3\r\n:100D9000B31F88508830B0F7E770EE2359F0F0E0C9\r\n:100DA000E459FA4FE49101301105F9F010F10230E5\r\n:100DB000110519F1DF91CF911F910F91FF90EF90E5\r\n:100DC0000895E0958C91E823CECF81E001151105BF\r\n:100DD00009F480E081959E2F8C932C813D81A20F98\r\n:100DE000B31F98509830C0F7D7CF8C91E82BEC9375\r\n:100DF000E1CFE0958C91E823FACF8C91E827F7CFEB\r\n:100E00000130110509F4ADCFE0F20230110509F40B\r\n:100E1000A5CFAE0DBF1DAECF0F931F93CF93DF9322\r\n:100E200077FF04C0260F371F70E060E0DC011496E6\r\n:100E3000CD91DC91FB01E20FF31FCE17DF071CF40D\r\n:100E40009E01261B370B121613064CF5FA0157FDAF\r\n:100E50003796A3E0F595E795AA95E1F7EC9FD001C9\r\n:100E6000ED9FB00DFC9FB00D11246A0F7B1FDC01BC\r\n:100E70005F96ED91FC91E60FF71F4770552781E0D3\r\n:100E800090E001C0880F4A95EAF7482F013011051C\r\n:100E900059F0A8F02E0F3F1F02301105E1F0DF914D\r\n:100EA000CF911F910F9108952E0F3F1FE217F30767\r\n:100EB000B1F38191DF011197842B8C93F7CF80954B\r\n:100EC0002E0F3F1FE217F30751F39191DF011197A6\r\n:100ED00098239C93F7CFE217F30709F38191DF0181\r\n:100EE000119784278C93F7CF0F931F93FA01DC019E\r\n:100EF00056964C9156974230E9F04330A1F141307B\r\n:100F000061F514964D915C91DA01AE1BBF0BFD01AA\r\n:100F1000E21BF30B77FD0BC0DC0116964D915C9143\r\n:100F20006417750724F4AB01BF010E940C071F91E1\r\n:100F30000F91089514964D915C91DA01A61BB70BA1\r\n:100F4000BD0161507109DC0116964D915C91DA0189\r\n:100F5000AE1BBF0BFD01E21BF30B77FDE8CFAF012A\r\n:100F60000E945D06E4CF16964D915C91DA01A61BB6\r\n:100F7000B70BBD0161507109CDCF0F931F93FA01DB\r\n:100F8000DC0156964C9156974230A9F0433091F1CE\r\n:100F9000413019F514964D915C91DA01AE1BBF0BEF\r\n:100FA000FD013197F7FD04C0AB01BF010E945D0652\r\n:100FB0001F910F91089514964D915C91DA01A61B33\r\n:100FC000B70BBD01DC0116964D915C91DA01AE1BA9\r\n:100FD000BF0BFD013197621B730BF7FDE9CFDC01FD\r\n:100FE00016964D915C91E417F50714F7AF010E9436\r\n:100FF0000C07DECF16964D915C91DA01A61BB70B5C\r\n:10100000BD01621B730BCECFFC0177FD64C08085F0\r\n:101010009185681779070CF05EC057FD5CC082852A\r\n:101020009385481759070CF056C086898230B1F075\r\n:10103000833029F1813041F484819581841B950BA3\r\n:10104000AB01BC01615071092130310509F108F48F\r\n:1010500043C02230310509F463C00895848195812D\r\n:10106000DC01A61BB70BBD01615071098681978118\r\n:10107000DC01A41BB50BAD0141505109E5CF8681C0\r\n:101080009781861B970BBA01AC0141505109DCCF07\r\n:10109000CA0157FD0796A3E095958795AA95E1F7B4\r\n:1010A000A481B5818A9F90018B9F300D9A9F300D4E\r\n:1010B0001124620F731F078CF0A1E02DE60FF71FBC\r\n:1010C0004770552721E030E001C0220F4A95EAF72A\r\n:1010D0008081822B80830895CA0157FD079633E0F3\r\n:1010E000959587953A95E1F7A481B5818A9F9001FE\r\n:1010F0008B9F300D9A9F300D1124620F731F078C48\r\n:10110000F0A1E02DE60FF71F4770552781E090E032\r\n:1011100001C0880F4A95EAF7809590818923DACF3C\r\n:10112000CA0157FD079623E0959587952A95E1F723\r\n:10113000A481B5818A9F90018B9F300D9A9F300DBD\r\n:101140001124620F731F078CF0A1E02DE60FF71F2B\r\n:101150004770552721E030E001C0220F4A95EAF799\r\n:1011600080818227B7CF08958EBD00000DB407FEA1\r\n:10117000FDCF8EB508958CBD9DBD08950895FC01E9\r\n:101180006370668B8481958126813781613039F067\r\n:10119000633029F0918780873387228708953187CC\r\n:1011A00020879387828708952F923F924F925F9274\r\n:1011B0006F927F928F929F92AF92BF92CF92DF9267\r\n:1011C000EF92FF920F931F93CF93DF93CDB7DEB7CC\r\n:1011D0006A970FB6F894DEBF0FBECDBF9A8F898F86\r\n:1011E0007A8369834A01D22E18870F833701BC2C7A\r\n:1011F000DC0159962D913C915A972115310509F042\r\n:1012000015C118968D919C911997681779070CF064\r\n:10121000D9C11A968D919C91481759070CF0D2C1EB\r\n:101220004C2C512CB6E0CB9E600D711D11247C8797\r\n:101230006B87161617060CF0C5C1EA2DF0E0FA8789\r\n:10124000E98793E0EE0FFF1F9A95E1F7F88BEF87A0\r\n:10125000CF01840F951F181619060CF0B3C1A98D84\r\n:10126000BA8D58968C91811104C0BFEABD1508F45F\r\n:10127000D394A98DBA8DED91FC9111970284F385D9\r\n:10128000E02DCD010995B5E0DB9EC0011124E98177\r\n:10129000FA81FC83EB83312C212C9C0124593F4F94\r\n:1012A000388F2F8B4A2D50E05E8B4D8BEF89F88D58\r\n:1012B000E20DF31D44919E828D82D12CC12C698157\r\n:1012C0007A81620D731D7A8B698B842F90E09C8BE1\r\n:1012D0008B8BE98DFA8DA081B18140FF82C0F1E056\r\n:1012E000BF126FC0AF126DC01C96ED91FC912F81A3\r\n:1012F0003885A4014C0D5D1D69897A89898D9A8D87\r\n:101300000995EB89FC89F595E7954E2F5FEFC51A96\r\n:10131000D50A6D817E818D899E89680F791F7E83B4\r\n:101320006D8398E0C916D10481F6AFEF2A1A3A0A04\r\n:10133000EB81FC81E40DF51DFC83EB83F5E02F16BA\r\n:10134000310409F0B3CF2F81388526153705B9F060\r\n:10135000A98DBA8DED91FC91B1E0BB1257C0AB12D3\r\n:1013600055C069817A816B5F7F4F0088F189E02DDC\r\n:10137000830128E030E0A401898D9A8D0995A98D1B\r\n:10138000BA8DED91FC9111970688F789E02DCD017A\r\n:101390006A960FB6F894DEBF0FBECDBFDF91CF9136\r\n:1013A0001F910F91FF90EF90DF90CF90BF90AF9083\r\n:1013B0009F908F907F906F905F904F903F902F9075\r\n:1013C00009941E96ED91FC91EF80F88409851A85A9\r\n:1013D00092014D815E816B817C81898D9A8D099509\r\n:1013E00090CF2F8138852615370509F48ACF31E053\r\n:1013F000B31207C0A31205C01C96ED91FC91930196\r\n:1014000078CF1E96ED91FC917301E0CF6B857C85C2\r\n:10141000641975090684F785E02D73010F85188915\r\n:101420009201A401898D9A8D0995A9CFF90134966D\r\n:1014300045915491F901329685919491D41AB7E06F\r\n:10144000DB9E800D911D1124F901259134913C8B77\r\n:101450002B8BFC0125903490FC01329674903196D0\r\n:101460003491398B329664903196449041E04C151A\r\n:1014700018F04A1508F07FC0662D062C000C770B7B\r\n:101480007C836B83842D042C000C990B9E838D83AD\r\n:10149000A98DBA8DED91FC9111970284F385E02D11\r\n:1014A000CD010995512CD12CC12CEA2DF0E0FA8701\r\n:1014B000E9872B2D30E03C872B87A401440D511D7B\r\n:1014C00047FC5A95588F4F8B69817A81660D711D43\r\n:1014D00067FC7A957E876D877989C71608F04FCFAC\r\n:1014E0002C2D30E04D815E81420F531FA985BA85B6\r\n:1014F0004A9FC0014B9F900D5A9F900D1124FC01F3\r\n:10150000E80DF91DF88BEF87852D612C4F89588DDB\r\n:10151000420F531F5E8B4D8B671408F050C044245C\r\n:101520004394480E877041F4C1010196EB89FC8910\r\n:10153000E20DF31DD4901C01D7FE19C0A98DBA8D00\r\n:10154000ED91FC91662D70E0B1E0BB1219C0AB12B9\r\n:1015500017C02D853E85620F731F0484F585E02D2D\r\n:101560002F8138854D895E89898D9A8D0995DD0C8D\r\n:101570006394842DD1CF1E821D821C821B8288CF52\r\n:101580004B815C81640F751FAB85BC856A9FC00170\r\n:101590006B9F900D7A9F900D112469817A81680F5D\r\n:1015A000791F0684F785E02DEF80F88409851A8578\r\n:1015B0009D014F855889898D9A8D0995D8CF570CF3\r\n:1015C000C3948ACF6A960FB6F894DEBF0FBECDBF24\r\n:1015D000DF91CF911F910F91FF90EF90DF90CF900F\r\n:1015E000BF90AF909F908F907F906F905F904F9043\r\n:1015F0003F902F9008958F929F92AF92CF92EF924B\r\n:10160000FF920F931F93CF93DF93EC01262F898DC9\r\n:101610009A8D009709F051C06A30D1F41D861C865E\r\n:101620008D8948E0849F900111248E859F85820FCB\r\n:10163000931F9F878E8781E090E0DF91CF911F916C\r\n:101640000F91FF90EF90CF90AF909F908F90089563\r\n:101650006D3089F3CC88AD888F898823C1F08C8563\r\n:101660009D8536E0C39E800D911D112448855985C6\r\n:101670004817590764F44E855F851D861C8638E03F\r\n:10168000A39EC0011124840F951F9F878E87EA882F\r\n:10169000FB88088919894E855F856C857D85CE011B\r\n:1016A0000E94D4082C898C859D8546E0249F800D5E\r\n:1016B000911D11249D878C87BECF6A3069F41D86E9\r\n:1016C0001C86FC013896E4912D898E859F85E29FCA\r\n:1016D000800D911D1124ADCF6D3009F4ACCFFC010C\r\n:1016E00034964591549170E06417750708F4A3CFC0\r\n:1016F000FC013696A591B491A617B70708F49BCFC5\r\n:10170000FC01329685909490362F341B47E0349F2D\r\n:10171000800C911C1124F401329634913196E4919D\r\n:101720003323A9F1EE2399F1CC88F4013596E491A5\r\n:10173000AD884F89442301F10E2E000CFF0BE30FFF\r\n:10174000F11DCE9EA001CF9E500D11246C857D858C\r\n:10175000460F571F68857985641775076CF44E85A9\r\n:101760005F851D861C86FC013896E491AE9E400D77\r\n:10177000511D11245F874E87EA88FB8808891989E3\r\n:101780004E855F856C857D85CE010E94D408F4016D\r\n:101790003496E4912C898C859D85E29F800D911D66\r\n:1017A000112488CF6F927F928F929F92AF92BF92B7\r\n:1017B000CF92DF92EF92FF920F931F93CF93DF931D\r\n:1017C000EC016B015A0139014801E881F981028479\r\n:1017D000F385E02D0995E881F9810288F389E02DF0\r\n:1017E00087019301A501B601CE010995A501480D18\r\n:1017F000591D41505109E881F9810288F389E02D92\r\n:101800009301B601CE010995E881F9810088F1893B\r\n:10181000E02D9401A501B601CE010995C60CD71C97\r\n:10182000B60161507109E881F9810088F189E02DE4\r\n:101830009401A501CE010995E881F9810688F7890F\r\n:10184000E02DCE01DF91CF911F910F91FF90EF908E\r\n:10185000DF90CF90BF90AF909F908F907F906F90D0\r\n:1018600009946F927F928F929F92AF92BF92CF9284\r\n:10187000DF92EF92FF920F931F93CF93DF935C0160\r\n:10188000EB016A01490138018701DC01ED91FC910E\r\n:101890006217730719F5641675062CF0962D872DBF\r\n:1018A0003A01C92ED82E9601261937092F5F3F4FCE\r\n:1018B000048CF58DE02DA301BE01C5010995DF91D2\r\n:1018C000CF911F910F91FF90EF90DF90CF90BF903D\r\n:1018D000AF909F908F907F906F9008954615570519\r\n:1018E00091F42617370724F0892D4B01C22FD82FEA\r\n:1018F0009E01281939092F5F3F4F068CF78DE02D87\r\n:10190000A601B401DACF0284F385E02D0995D50153\r\n:10191000ED91FC910488F589E02D83019401A601E5\r\n:10192000BE01C5010995D501ED91FC910688F789A5\r\n:10193000E02DC501DF91CF911F910F91FF90EF90A6\r\n:10194000DF90CF90BF90AF909F908F907F906F90DF\r\n:101950000994EF92FF920F931F93DC011A960D9159\r\n:101960001C911B9718962D913C911997ED91FC9124\r\n:1019700000A0F1A1E02D7B0150E040E070E060E0CC\r\n:1019800009951F910F91FF90EF9008954F925F92EC\r\n:101990006F927F928F929F92AF92BF92CF92DF927F\r\n:1019A000EF92FF920F931F93CF93DF936C012B0164\r\n:1019B0005A0139014801DC01ED91FC910284F38563\r\n:1019C000E02D0995E201640C751CD601ED91FC91A6\r\n:1019D000C615D7055CF40088F189E02D87019401D4\r\n:1019E000A501BE01C60109952196EFCF0688F789AA\r\n:1019F000E02DC601DF91CF911F910F91FF90EF90E5\r\n:101A0000DF90CF90BF90AF909F908F907F906F901E\r\n:101A10005F904F9009948F929F92AF92BF92CF9216\r\n:101A2000DF92EF92FF920F931F93CF93DF93EC011E\r\n:101A30005B014A016901E881F9810284F385E02DA7\r\n:101A4000099595012C0D3D1D21503109E881F98141\r\n:101A50000488F589E02D78018401A401B501CE0147\r\n:101A60000995E881F9810688F789E02DCE01DF919B\r\n:101A7000CF911F910F91FF90EF90DF90CF90BF908B\r\n:101A8000AF909F908F9009948F929F92AF92BF9248\r\n:101A9000CF92DF92EF92FF920F931F93CF93DF933A\r\n:101AA000EC015B014A0169017801E881F981028456\r\n:101AB000F385E02D0995C80CD91C86010150110948\r\n:101AC000E881F9810488F589E02D9501A401B5012B\r\n:101AD000CE010995E881F9810688F789E02DCE01CC\r\n:101AE000DF91CF911F910F91FF90EF90DF90CF90FA\r\n:101AF000BF90AF909F908F900994EF92FF920F93B9\r\n:101B00001F93DC01ED91FC9100A0F1A1E02D09955E\r\n:101B10001F910F91FF90EF9008950F931F93DC0199\r\n:101B2000ED91FC91068CF78DE02D09951F910F9199\r\n:101B300008950F931F93DC01ED91FC91048CF58DBA\r\n:101B4000E02D09951F910F9108952F923F924F928A\r\n:101B50005F926F927F928F929F92AF92BF92CF923D\r\n:101B6000DF92EF92FF920F931F93CF93DF93CDB746\r\n:101B7000DEB72C970FB6F894DEBF0FBECDBF3C0189\r\n:101B80007C836B835C874B871801270181E090E0A1\r\n:101B90005C01A41AB50ACA01919581959109AC011D\r\n:101BA000440F551F5A834983C80101969E838D8334\r\n:101BB000F12CE12C88248394912C922F91709F8397\r\n:101BC00022702887AB014F5F5F4F5A8749878B850B\r\n:101BD0009C85E816F9060CF07AC0CB84DC84B7FC4F\r\n:101BE0000CC06C0191E0C91AD10849815A814E5F3D\r\n:101BF0005F4F5A834983A40EB51E5FEFE51AF50ABD\r\n:101C000082E0880E911CA80CB91CCE14DF0464F18C\r\n:101C10009F81992399F09601220F331F4D815E8198\r\n:101C2000240F351F82014B815C814C195D09B7017E\r\n:101C3000660D771D8FE492E00E94990D588555231B\r\n:101C400099F09601220F331F8D819E81280F391F35\r\n:101C500082014B815C814C195D09B3016E197F09CA\r\n:101C60008FE492E00E94990D4B855C854C155D05D3\r\n:101C700059F15F81552391F0940122503109220DD1\r\n:101C8000331D820149855A854E195F096B857C8514\r\n:101C9000660D771D8FE492E00E94990D8885882358\r\n:101CA00099F0940122503109220D331DB3014B8567\r\n:101CB0005C85641B750B820149855A854E195F0945\r\n:101CC0008FE492E00E94990DDC86CB8680CF2C9623\r\n:101CD0000FB6F894DEBF0FBECDBFDF91CF911F913D\r\n:101CE0000F91FF90EF90DF90CF90BF90AF909F90BB\r\n:101CF0008F907F906F905F904F903F902F900895BE\r\n:101D00002F923F924F925F926F927F928F929F920B\r\n:101D1000AF92BF92CF92DF92EF92FF920F931F93F9\r\n:101D2000CF93DF932C014B015A016901E901D5954D\r\n:101D3000C7950C171D070CF4E8013E01660C771CD3\r\n:101D40001E01240C351C950126193709EE24E39455\r\n:101D5000F12C8601A401B1018FE492E00E947D0D77\r\n:101D6000C618D70881E0C81AD1088C0E9D1EA40C95\r\n:101D7000B51CC5018C1B9D0B860121E0AE01B40191\r\n:101D800001970E94A50D22E0AE01B401C1010E949D\r\n:101D9000A50DDF91CF911F910F91FF90EF90DF90F4\r\n:101DA000CF90BF90AF909F908F907F906F905F90FB\r\n:101DB0004F903F902F900895AF92BF92CF92DF92B5\r\n:101DC000EF92FF920F931F93CF93DF936C015B0110\r\n:101DD000EA0179019A01220F331F2F5F3F4FAB01B8\r\n:101DE0004C1B5D0B8701B6018FE492E00E94990DB8\r\n:101DF00010E000E023E0AE01B501C6010E94A50D90\r\n:101E0000DF91CF911F910F91FF90EF90DF90CF90D6\r\n:101E1000BF90AF900895DC01ED91FC910084F185B5\r\n:101E2000E02D09943F924F925F926F927F928F9232\r\n:101E30009F92AF92BF92CF92DF92EF92FF920F9359\r\n:101E40001F93CF93DF935C017B014A016901390144\r\n:101E500087E0680E711C93E0759467949A95E1F79A\r\n:101E60002B01400E511E10E000E0312CD0E0C0E00C\r\n:101E7000CE0187709927330C892B59F4FE0183E03A\r\n:101E8000F595E7958A95E1F7E00FF11FE80DF91D4B\r\n:101E9000349037FE0AC021E030E0A701B5016C0F95\r\n:101EA0007D1F8FE492E00E940B0F2196CC16DD0679\r\n:101EB000F9F68FEFE81AF80A060D171DE414F50479\r\n:101EC000A9F6DF91CF911F910F91FF90EF90DF90D6\r\n:101ED000CF90BF90AF909F908F907F906F905F90CA\r\n:101EE0004F903F9008952F923F924F925F926F9242\r\n:101EF0007F928F929F92AF92BF92CF92DF92EF929A\r\n:101F0000FF920F931F93CF93DF9300D000D000D0A8\r\n:101F1000CDB7DEB73C016A013E832D83FC82EB82A4\r\n:101F20005801A41AB50AB7FE03C0B194A194B10830\r\n:101F30008D809E80861A970A97FE03C091948194A3\r\n:101F400091088A149B045CF0902F812F0D811E81D3\r\n:101F50009D838E839C2D8D2D6B01692F782F0C1501\r\n:101F60001D055CF09D818E817E836D83692F782FA6\r\n:101F7000902F812F8601C92ED82E1601201A310AE2\r\n:101F80002B012D813E81421A530A57FE03C0519402\r\n:101F900041945108710137FE03C03FEFE31AF30A81\r\n:101FA000F594E7948D819E81861797075CF5A1E0F3\r\n:101FB000B0E0BA83A983C016D1064CF1D301ED91EC\r\n:101FC000FC910484F585E02D2B813C81A8016D8175\r\n:101FD0007E818A149B041CF04D815E81B801C3018F\r\n:101FE0000995E418F508F7FE0AC02D813E81898124\r\n:101FF0009A81280F391F3E832D83E20CF31C0F5F5B\r\n:102000001F4FD9CF2FEF3FEF3A832983D4CF2696A6\r\n:102010000FB6F894DEBF0FBECDBFDF91CF911F91F9\r\n:102020000F91FF90EF90DF90CF90BF90AF909F9077\r\n:102030008F907F906F905F904F903F902F9008957A\r\n:102040000895CF92DF92EF92FF92CF93DF93EC014E\r\n:10205000603282E07807CCF5653B710514F064EBE3\r\n:1020600070E0898128E830E0281B310987FD33952D\r\n:10207000220F331F220F331F6901330FEE08FF08B1\r\n:102080008A8128E532E0281B310987FD3395220F2C\r\n:10209000331F220F331F032E000C440B550B2C193A\r\n:1020A0003D094E095F09DB0177FF02C0B0E0A0E007\r\n:1020B0000E949C1C24EB30E040E050E00E94721C27\r\n:1020C000C20ED31EE41EF51EB601E881EC3070F599\r\n:1020D000298188E890E0821B910927FD9395880F5C\r\n:1020E000991F880F991F681779077CF02A8188E566\r\n:1020F00092E0821B910927FD9395880F991F880F05\r\n:10210000991F681779070CF4CB010297880F991F64\r\n:102110004FB7F8942E2F30E0F901EE0FFF1FE20FBA\r\n:10212000F31FEA50FE4F928381834FBFDF91CF911F\r\n:10213000FF90EF90DF90CF9008951F93CF93DF93A0\r\n:10214000EC01162F88818C3008F04DC0862F0E943C\r\n:102150006C058881282F30E0F901EE0FFF1FE20F98\r\n:10216000F31FEA50FE4F1F736081607C612B608318\r\n:1021700019821A822CE0622F0E94D51C829FB00126\r\n:10218000112430E020E0AB01420F531FFA01EE0FA3\r\n:10219000FF1FE40FF51FEA50FE4F908196FD16C019\r\n:1021A0002F5F3F4F2C30310571F781110FC0109216\r\n:1021B000800082E08093810010928500109284005C\r\n:1021C000B19A80916F00826080936F00E8818E2FBA\r\n:1021D00090E0FC01EE0FFF1FE80FF91FEA50FE4FE1\r\n:1021E0008081806480838881DF91CF911F910895E1\r\n:1021F0002091AA01260F3327331F21323105ECF439\r\n:102200002091CE01FC0190E080E0243069F082E072\r\n:102210000895A091AA012191AC0146575E4FA40FE9\r\n:10222000B52FB11D2C930196861798F38091AA01C2\r\n:10223000680F6093AA0180E0089581E008951092EC\r\n:10224000CE0181E08093D0011092CF0161E082E164\r\n:102250000E948B0561E083E10E948B05E9EBF0E0D1\r\n:1022600080818E7F808380818D7F808388E48093CE\r\n:10227000B80085E48093BC000895CF93DF9391E08C\r\n:10228000909389018823B9F0C091B800D091BA0029\r\n:102290008091BC008A7B8093BC0060E082E10E9458\r\n:1022A0008B0560E083E10E948B050E941F11D09393\r\n:1022B000BA00C093B800DF91CF910895E091200259\r\n:1022C00080911F02E81730F4F0E0EC59FE4F808156\r\n:1022D00090E008958FEF9FEF0895909120028091F4\r\n:1022E0001F022FEF3FEF981748F4E92FF0E0EC5969\r\n:1022F000FE4F208130E09F5F90932002C901089536\r\n:1023000080911F0290912002891B990B0895CF9212\r\n:10231000DF92EF92FF920F931F93CF93DF937C0195\r\n:10232000CB018A0120912D02222389F0EB016B0160\r\n:10233000C40ED51ECC15DD0569F06991D701ED916C\r\n:10234000FC910190F081E02DC7010995F3CF642F36\r\n:102350000E94F810C801DF91CF911F910F91FF905B\r\n:10236000EF90DF90CF900895CF93DF931F92CDB77A\r\n:10237000DEB7698320912D022223F9F020912A02F1\r\n:10238000203258F021E030E0FC013383228390E0DA\r\n:1023900080E00F90DF91CF91089580912B02E82F7C\r\n:1023A000F0E0EC5BFE4F998190838F5F80932B026E\r\n:1023B00080932A0281E090E0ECCF61E0CE010196AB\r\n:1023C0000E94F810F7CFCF92DF92EF92FF920F9317\r\n:1023D0001F93CF93DF93D0912A0281E0D13208F08E\r\n:1023E0009CC0C0912C020E94D7056B017C0180919A\r\n:1023F000CE0181116CC082E08093CE0181E0809398\r\n:10240000D0018FEF8093CD011092F201D093F101B2\r\n:10241000A4E4B1E0E1EDF1E080E0D8138DC01092CA\r\n:10242000F3018091F301CC0FC82BC093F30180918D\r\n:10243000CF01813009F084C01092CF010E94D705EE\r\n:102440006B017C018091F3018093BB008091850139\r\n:1024500090918601A0918701B0918801892B8A2BE8\r\n:102460008B2BA1F00E94D705009185011091860168\r\n:1024700020918701309188016C197D098E099F098F\r\n:10248000061717072807390708F442C08091BC00D7\r\n:1024900083FDD8CF85EC8093BC000E94D7056B01EB\r\n:1024A0007C018091CE01823009F44CC08091CD0135\r\n:1024B0008F3F09F469C08091CD01803209F466C074\r\n:1024C0008091CD01803309F463C084E026C08091FF\r\n:1024D000850190918601A0918701B0918801892B97\r\n:1024E0008A2B8B2B09F483CF0E94D705009185019D\r\n:1024F0001091860120918701309188016C197D0926\r\n:102500008E099F09061717072807390708F06FCFAC\r\n:10251000809184010E943D1185E010922B0210925F\r\n:102520002A0210922D02DF91CF911F910F91FF90FF\r\n:10253000EF90DF90CF9008959D9191938F5F6DCF35\r\n:1025400085EEA9CF8091850190918601A0918701A8\r\n:10255000B0918801892B8A2B8B2B09F4A2CF0E9482\r\n:10256000D705009185011091860120918701309156\r\n:1025700088016C197D098E099F090617170728071E\r\n:10258000390708F08ECFC4CF80E0C7CF82E0C5CF37\r\n:1025900083E0C3CFEF92FF920F931F93CF93DF930C\r\n:1025A0007C01C62F80916C0290916D02009709F416\r\n:1025B00059C02091700231E030932D0220932C02FB\r\n:1025C00010922B0210922A02DC01ED91FC910190F5\r\n:1025D000F081E02D60E009958701EE24E394F12C71\r\n:1025E000D1E0C15080916C0290916D02CF3F91F18A\r\n:1025F000B0E2EB16F104D8F00E94E31180916C0276\r\n:1026000090916D0220917002D0932D0220932C02A4\r\n:1026100010922B0210922A02DC01ED91FC910190A4\r\n:10262000F081E02D60E00995EE24E394F12C809197\r\n:102630006C0290916D02F8016491DC01ED91FC91C6\r\n:102640000190F081E02D0995BFEFEB1AFB0A0F5FB7\r\n:102650001F4FC7CFDF91CF911F910F91FF90EF9048\r\n:102660000C94E311E0917C02F0917D0290818091C5\r\n:1026700082028095892380838701C15008F438C085\r\n:10268000F801849120916A0230916B02232B29F08A\r\n:102690000E94B4080F5F1F4FF0CF28E030E040E801\r\n:1026A000E0917802F091790290918002582F5423A2\r\n:1026B000D9F05081952B9083E0917A02F0917B02C2\r\n:1026C000908150918102952B9083E0917A02F09154\r\n:1026D0007B0250819091810290959523908346953D\r\n:1026E00021503109E9F6D6CF508190959523E3CF5B\r\n:1026F000DF91CF911F910F91FF90EF9008951F935D\r\n:10270000CF93DF93EC018D8D9E8D009721F1162FD5\r\n:1027100029A131E030932D0220932C0210922B023C\r\n:1027200010922A02DC01ED91FC910190F081E02DE4\r\n:1027300060E009958D8D9E8DDC01ED91FC910190FD\r\n:10274000F081E02D612F09958D8D9E8DDF91CF91C8\r\n:102750001F910C94E311ADA5BEA59C918BA980950A\r\n:1027600089238C938B8D9C8D892B31F0862FDF9163\r\n:10277000CF911F910C94B40828E030E080E8A9A51F\r\n:10278000BAA599A9462F4823C1F04C91942B9C934C\r\n:10279000ABA5BCA59C914AA9942B9C93ABA5BCA5C9\r\n:1027A0004C919AA9909594239C9386952150310938\r\n:1027B00031F7DF91CF911F9108954C91909594231B\r\n:1027C000E6CF1F93CF93DF93EC01162F8D8D9E8D57\r\n:1027D000892BB1F12DA93EA94FA958AD60E074E253\r\n:1027E00084EF90E00E94A41C205131094109510955\r\n:1027F00056954795379527952093B80066EA1111AD\r\n:1028000067EACE010E947F138D8D9E8D892B41F149\r\n:1028100029AD3AAD4BAD5CAD60E074E284EF90E081\r\n:102820000E94A41C20513109410951095695479530\r\n:10283000379527952093B800DF91CF911F91089588\r\n:102840008B8D9C8D892B21F08EAD9FAD0E94BB0896\r\n:10285000EFA5F8A990818CA9809589238083CECF9C\r\n:10286000EFA5F8A980819CA9892B8083E5CF90E012\r\n:1028700080E00895CF92DF92EF92FF920F931F9323\r\n:10288000CF93DF936C017B018A01BC018DE392E061\r\n:102890000E942110C4EBD0E0BE016C197D098AE3CF\r\n:1028A00092E00E942110B70187E392E00E9421107C\r\n:1028B000BE016E197F0984E392E00E942110B801E5\r\n:1028C00081E392E00E942110B8018EE292E0DF9154\r\n:1028D000CF911F910F91FF90EF90DF90CF900C94CC\r\n:1028E00021102091550230915602C901079697FD9B\r\n:1028F000079623E0959587952A95E1F72091530255\r\n:1029000030915402829FA001839F500D929F500DE1\r\n:10291000112470E060E080916E0290916F020C943F\r\n:10292000111EDF92EF92FF920F931F93CF93DF93CD\r\n:10293000EC010E94711421E030E04FE050E021975B\r\n:1029400009F0E0C06CE170E086E290E00E94DC0EED\r\n:1029500021E030E04FE050E06CE170E08AE590E08B\r\n:102960000E94DC0EF12CE12C04E110E024E230E0C6\r\n:102970004CE150E064E170E08FE492E00E94C60C0C\r\n:1029800024E230E04CE150E068E470E08FE492E053\r\n:102990000E94C60C06E010E02CE030E04CE350E072\r\n:1029A0006EE270E082E290E00E94800E80916C0204\r\n:1029B00090916D02892B09F4D4C02091840230914A\r\n:1029C0008502409186025091870260E074E284EFB4\r\n:1029D00090E00E94A41C20513109410951095695EB\r\n:1029E0004795379527952093B80064E088E690E0F6\r\n:1029F0000E94CA1280915302909154028034910532\r\n:102A000009F0C6C060E28FE492E00E947F136091FB\r\n:102A10005302615E8FE492E00E947F132091550281\r\n:102A200030915602C901079697FD079633E09595B8\r\n:102A300087953A95E1F72091530230915402829F95\r\n:102A40008001839F100D929F100D1124C0916E0282\r\n:102A5000D0916F0280916C0290916D020C0F1D1F3E\r\n:102A6000009709F4C7C02091700231E030932D0225\r\n:102A700020932C0210922B0210922A02DC01ED917D\r\n:102A8000FC910190F081E02D60E40995EE24E3943F\r\n:102A9000F12CDD24D39480916C0290916D020C177F\r\n:102AA0001D0709F47EC0B0E2EB16F104D8F00E94D5\r\n:102AB000E31180916C0290916D0220917002D0928E\r\n:102AC0002D0220932C0210922B0210922A02DC017C\r\n:102AD000ED91FC910190F081E02D60E40995EE24E8\r\n:102AE000E394F12C80916C0290916D026991DC016C\r\n:102AF000ED91FC910190F081E02D0995BFEFEB1A6B\r\n:102B0000FB0AC9CF68E170E086E290E00E94DC0E2B\r\n:102B100021E030E04FE050E068E170E08AE590E0CD\r\n:102B20000E94DC0E30E020E046E050E068E170E01A\r\n:102B300086E290E00E94DC0E30E020E046E050E0CB\r\n:102B400068E170E08AE590E00E94DC0E04E010E0AD\r\n:102B500028E030E040E350E062E370E088E290E09B\r\n:102B600023CF80916A0290916B02892B31F0809182\r\n:102B70008D0290918E020E94BB08E0917E02F0913E\r\n:102B80007F029081809183028095892380832DCF5D\r\n:102B900060E08FE492E00E947F13609153026150E5\r\n:102BA00039CF0E94E31180916C0290916D02892BC4\r\n:102BB00009F461C0209188023091890240918A0213\r\n:102BC00050918B0260E074E284EF90E00E94A41CBC\r\n:102BD0002051310941095109569547953795279557\r\n:102BE0002093B800DF91CF911F910F91FF90EF904C\r\n:102BF000DF900895E0917C02F0917D0280819091B8\r\n:102C00008202892B80830C171D0769F2899120911C\r\n:102C10006A0230916B02232B19F00E94B408F3CFA3\r\n:102C200028E030E040E8E0917802F091790290915C\r\n:102C30008002582F5423D9F05081952B9083E09136\r\n:102C40007A02F0917B02908150918102952B9083C2\r\n:102C5000E0917A02F0917B025081909181029095EF\r\n:102C600095239083469521503109E9F6CCCF5081C8\r\n:102C700090959523E3CFE0917E02F0917F028081D1\r\n:102C800090918302892B8083ADCF0E940C1E85ED2D\r\n:102C90008093BC008091850190918601A09187016D\r\n:102CA000B09188010796A11DB11D23E0B695A795A7\r\n:102CB000979587952A95D1F72091BC0024FD03C0F4\r\n:102CC0001092CE0108954091850150918601609146\r\n:102CD000870170918801452B462B472B69F300979C\r\n:102CE000A105B10541F02AE22A95F1F700C001974C\r\n:102CF000A109B109E1CF809184010C943D111F928B\r\n:102D00000F920FB60F9211242F933F938F939F939F\r\n:102D1000AF93BF938091220290912302A09124024D\r\n:102D2000B09125023091210223E0230F2D3758F571\r\n:102D30000196A11DB11D2093210280932202909340\r\n:102D40002302A0932402B093250280912602909141\r\n:102D50002702A0912802B09129020196A11DB11D60\r\n:102D60008093260290932702A0932802B093290211\r\n:102D7000BF91AF919F918F913F912F910F900FBE77\r\n:102D80000F901F90189526E8230F0296A11DB11DE4\r\n:102D9000D2CF1F920F920FB60F9211242F933F9311\r\n:102DA0004F935F936F937F938F939F93AF93BF9353\r\n:102DB000CF93DF93EF93FF938091F401C091F501DE\r\n:102DC000D0E087FF24C0109285001092840080918B\r\n:102DD000F4018F5F8093F4018091F401082E000CC0\r\n:102DE000990B8C179D0724F48091F4018C30C4F169\r\n:102DF0008091840090918500049680349C4908F469\r\n:102E00007AC08091840090918500049676C080916C\r\n:102E1000F401082E000C990B8C179D07C4F6E09165\r\n:102E2000F4018E2FEE0F990BFC01EE0FFF1FE80F40\r\n:102E3000F91FEA50FE4F808186FFC9CFE091F4016F\r\n:102E40008E2FEE0F990BFC01EE0FFF1FE80FF91FFD\r\n:102E5000EA50FE4F808160E08F730E948B05B7CFF0\r\n:102E60002091840030918500E091F4018E2FEE0FC7\r\n:102E7000990BFC01EE0FFF1FE80FF91FEA50FE4F00\r\n:102E800081819281820F931F9093890080938800A3\r\n:102E9000E091F4018E2FEE0F990BFC01EE0FFF1F56\r\n:102EA000E80FF91FEA50FE4F808186FF11C0E091C4\r\n:102EB000F4018E2FEE0F990BFC01EE0FFF1FE80FB0\r\n:102EC000F91FEA50FE4F808161E08F730E948B05ED\r\n:102ED000FF91EF91DF91CF91BF91AF919F918F9132\r\n:102EE0007F916F915F914F913F912F910F900FBE06\r\n:102EF0000F901F90189580E49CE99093890080932F\r\n:102F000088008FEF8093F401E3CF1F920F920FB6EA\r\n:102F10000F9211242F933F934F935F936F937F935F\r\n:102F20008F939F93AF93BF93EF93FF938091B900DB\r\n:102F3000887F803609F44AC0F0F5883209F4A7C0CA\r\n:102F400018F5803109F49BC0B8F4882309F4F9C05E\r\n:102F5000883009F494C0FF91EF91BF91AF919F9198\r\n:102F60008F917F916F915F914F913F912F910F9032\r\n:102F70000FBE0F901F901895883109F488C08032D9\r\n:102F800051F78093CD0114C0803409F49DC040F402\r\n:102F90008033B9F38833F9F68093CD0185ECB0C066\r\n:102FA000803509F485C0883509F496C0883499F6CF\r\n:102FB0000E944716D0CF883909F48CC038F588377D\r\n:102FC00029F050F4883611F0803729F683E0809399\r\n:102FD000CE011092CC0157C0883809F47BC08039EB\r\n:102FE00019F0803809F0B7CF8091CC01803208F019\r\n:102FF00071C0E091CC0181E08E0F8093CC01809173\r\n:10300000BB00F0E0E455FE4F80833DC0803B39F0CB\r\n:10301000E0F4803A09F479C0883A09F09CCF84E062\r\n:103020008093CE011092AB011092AA01E0911D0293\r\n:10303000F0911E0209958091AA0181110FC081E0D3\r\n:103040008093AA0110928A0109C0803C09F4A6CF9E\r\n:10305000883C09F4A3CF883B09F07DCFE091AB0118\r\n:1030600081E08E0F8093AB01F0E0E657FE4F808148\r\n:103070008093BB009091AB018091AA0129C08091FF\r\n:10308000F3018093BB0085EC8093BC0064CF9091EA\r\n:10309000F2018091F101981758F5E091F20181E079\r\n:1030A0008E0F8093F201F0E0EF52FE4F8081E9CF66\r\n:1030B000E091F20181E08E0F8093F2018091BB00DC\r\n:1030C000F0E0EF52FE4F80839091F2018091F10188\r\n:1030D0009817C8F285E8D8CFE091F20181E08E0F11\r\n:1030E0008093F2018091BB00F0E0EF52FE4F8083AD\r\n:1030F0008091D00181115CCF81E08093CF0184EA7F\r\n:103100008093BC001092CE0126CF85EC8093BC004A\r\n:103110001092CE018091CC01803230F4E091CC014C\r\n:10312000F0E0E455FE4F10826091CC0170E0E09138\r\n:103130001B02F0911C028CEA91E009951092CC01DF\r\n:103140000ACF1092CD0134CFFC019091F5019C3053\r\n:1031500098F481E0890F8093F5019083892F90E0A6\r\n:10316000FC01EE0FFF1FE80FF91FEA50FE4F88EB3E\r\n:103170009BE09283818308958FEF80830895A3E479\r\n:10318000B2E013961C921E92129748EE53E060E054\r\n:1031900070E014964D935D936D937C9317978AE03E\r\n:1031A00091E011969C938E93EFE4F2E013821282E9\r\n:1031B00020E830E03583248380E490E097838683A1\r\n:1031C0003187208793878287168A1586148617860B\r\n:1031D000168681E0858B848B2FEF3FEF338B228B1C\r\n:1031E000318B208B878B108E128E118E8CE191E0AB\r\n:1031F00091838083148E138EB68FA58F10A2178EA5\r\n:103200008FEF84A385A386A387A380A780E89AE194\r\n:10321000A6E0B0E085AB96ABA7ABB0AF80EA96E88E\r\n:10322000A1E0B0E081AF92AFA3AFB4AF80E586AFCD\r\n:1032300017AE80E492E00E94A4188DE392E00E9411\r\n:10324000A4188AE392E00E94A41887E392E00E9407\r\n:10325000A41884E392E00E94A41881E392E00E9403\r\n:10326000A4188EE292E00C94A418789484B582603D\r\n:1032700084BD84B5816084BD85B5826085BD85B51A\r\n:10328000816085BD80916E00816080936E00109298\r\n:103290008100809181008260809381008091810013\r\n:1032A00081608093810080918000816080938000A4\r\n:1032B0008091B10084608093B1008091B000816002\r\n:1032C0008093B00080917A00846080937A0080912E\r\n:1032D0007A00826080937A0080917A008160809386\r\n:1032E0007A0080917A00806880937A001092C10001\r\n:1032F00063E070E080E492E00E949D106AE570E077\r\n:1033000080E492E00E9421106BE070E08DE392E097\r\n:103310000E949D1062E070E08AE392E00E949D109E\r\n:103320006DE070E087E392E00E949D106EE070E037\r\n:1033300084E392E00E949D106FE070E081E392E0F0\r\n:103340000E949D1060E170E08EE292E00E949D106C\r\n:1033500044E150E06CE870E08AE590E00E943A14A5\r\n:1033600080916E0290916F02892B11F10E9471146D\r\n:10337000209155023091560280915302909154024F\r\n:10338000213231050CF0A3C0B9016052710977FFF9\r\n:1033900002C06F5F7F4F759567958357910997FDC1\r\n:1033A000019600E210E023E730E04EE855E0A2C0CD\r\n:1033B0002091550230915602C901079697FD079654\r\n:1033C000B3E095958795BA95E1F720915302309136\r\n:1033D0005402AC01429FC001439F900D529F900D3B\r\n:1033E00011240E94E71C90936F0280936E02892B38\r\n:1033F00009F0BCCF90E080E00E94911460EB74E093\r\n:1034000080E090E00E94FC0544E150E06CE170E057\r\n:103410008CE190E00E943A146CED75E080E090E061\r\n:103420000E94FC0540E450E06CE170E08CE190E02B\r\n:103430000E943A1468EE73E080E090E00E94FC0580\r\n:1034400081E090E00E94911440E450E062E370E07B\r\n:1034500090E080E00E943A146CED75E080E090E02E\r\n:103460000E94FC0540E450E06CE170E08CE190E0EB\r\n:103470000E943A146CED75E080E090E00E94FC053B\r\n:1034800044E150E06CE170E08CE190E00E943A147D\r\n:1034900068EE73E080E090E00E94FC0544E150E0BB\r\n:1034A0006CE870E08AE590E00E943A1460E273E014\r\n:1034B00080E090E00E94FC0590E080E00E94911482\r\n:1034C000C0E0D0E02097F1F30E940000FBCFB901EB\r\n:1034D0006054710977FF02C06F5F7F4F75956795E4\r\n:1034E0008255910997FD019600E410E022E530E055\r\n:1034F0004EE657E0959587950E94120F82E08093E3\r\n:10350000710280916C0290916D02892B09F493C035\r\n:103510008CE3809370021092200210921F0210928E\r\n:103520002B0210922A020E941F118EE296E09093C5\r\n:103530001E0280931D028FE296E090931C028093FE\r\n:103540001B028091770287FD1DC00E946C0561E01F\r\n:10355000809177020E948B0561E070E080E090E04E\r\n:103560000E94FC0560E0809177020E948B056AE072\r\n:1035700070E080E090E00E94FC0561E080917702BD\r\n:103580000E948B0580916C0290916D02892B09F449\r\n:1035900009C12091840230918502409186025091A8\r\n:1035A000870260E074E284EF90E00E94A41C205146\r\n:1035B000310941095109569547953795279520932B\r\n:1035C000B80064E08AE895E00E94CA126091550252\r\n:1035D00061508FE492E00E947F1364E086E895E0FA\r\n:1035E0000E94CA128091710264E1813009F460E1A5\r\n:1035F0008FE492E00E947F1364E082E895E00E94ED\r\n:10360000CA128FE880938C028091530290915402E9\r\n:103610008038910509F029C1809155029091560298\r\n:103620008034910509F031C180917102813009F433\r\n:10363000D0C08FECCFC0809175020E946C05809144\r\n:1036400076020E946C0580917502082E000C990B81\r\n:10365000FC01EA5AF54FE491F0E0EE0FFF1FEE5B3C\r\n:10366000F54F2591349130937D0220937C02FC012B\r\n:10367000E659F54FE491E093820280917602082E9C\r\n:10368000000C990BFC01EA5AF54FE491F0E0EE0FC3\r\n:10369000FF1FEE5BF54FA591B491B0937F02A0930D\r\n:1036A0007E02FC01E659F54FE491E09383028C9190\r\n:1036B000E82BEC9380916A0290916B02892B89F13F\r\n:1036C000CFB7F89480911A02811124C0E0E6FAE0A5\r\n:1036D0008491E4E7FAE09491E82FF0E0EE0FFF1F09\r\n:1036E000E45BF54FA591B491EC91E92321F461E0FD\r\n:1036F0008AE00E948B058AE00E946C058CB580618F\r\n:103700008CBD8CB580648CBD8DE00E946C058BE017\r\n:103710000E946C0580911A028F5F80931A02CFBFBE\r\n:1037200010CF809173020E946C05809174020E94F8\r\n:103730006C0580917302082E000C990BFC01EA5A6B\r\n:10374000F54FE491F0E0EE0FFF1FEE5BF54F259192\r\n:1037500034913093790220937802FC01E659F54FB9\r\n:10376000E491E093800280917402082E000C990B82\r\n:10377000FC01EA5AF54FE491F0E0EE0FFF1FEE5B1B\r\n:10378000F54FA591B491B0937B02A0937A02FC010E\r\n:10379000E659F54FE491E09381028C91E095E8239E\r\n:1037A000EC93CFCE80916A0290916B02892B31F01D\r\n:1037B00080918D0290918E020E94BB08E0917E0262\r\n:1037C000F0917F029081809183028095892380838C\r\n:1037D000F8CE8FE980938C02C2E16AED8FE492E02B\r\n:1037E0000E947F136C2F8FE492E00E947F1361E8A8\r\n:1037F0008FE492E00E947F1360918C028FE492E04C\r\n:103800000E947F1369ED8FE492E00E947F13809104\r\n:10381000710261EF813009F462E28FE492E00E946C\r\n:103820007F1366E08CE795E00E94CA1280916C02DB\r\n:1038300090916D02892BE9F12091880230918902E3\r\n:1038400040918A0250918B0260E074E284EF90E034\r\n:103850000E94A41C205131094109510956954795F0\r\n:10386000379527952093B800C5CD8036910589F40A\r\n:103870008091550290915602409739F480917102DF\r\n:10388000813029F08FEA80938C02C2E0A6CF80E1DC\r\n:10389000FACF80349105C9F7809155029091560274\r\n:1038A000809799F780917102813009F0C2CE80E152\r\n:1038B00091CFE0917E02F0917F028081909183020E\r\n:1038C000892B808397CD8CE191E090935002809377\r\n:1038D0004F0280916E0290916F02009711F00C944C\r\n:1038E000831D0895052E97FB1EF400940E94891CE9\r\n:1038F00057FD07D00E94A41C07FC03D04EF40C9483\r\n:10390000891C50954095309521953F4F4F4F5F4F03\r\n:10391000089590958095709561957F4F8F4F9F4F3B\r\n:1039200008950E94C61CA59F900DB49F900DA49F62\r\n:10393000800D911D11240895B7FF0C94911C0E94D5\r\n:10394000911C821B930B0895A1E21A2EAA1BBB1B8C\r\n:10395000FD010DC0AA1FBB1FEE1FFF1FA217B3075B\r\n:10396000E407F50720F0A21BB30BE40BF50B661F71\r\n:10397000771F881F991F1A9469F760957095809535\r\n:1039800090959B01AC01BD01CF010895A29FB001AC\r\n:10399000B39FC001A39F700D811D1124911DB29F83\r\n:1039A000700D811D1124911D0895991B79E004C0AB\r\n:1039B000991F961708F0961B881F7A95C9F780956E\r\n:1039C0000895EE0FFF1F0590F491E02D09940F93D9\r\n:1039D0001F93CF93DF938230910510F482E090E043\r\n:1039E000E0919102F091920230E020E0B0E0A0E09E\r\n:1039F000309799F42115310509F44AC0281B390B79\r\n:103A000024303105D8F58A819B816115710589F1D2\r\n:103A1000FB0193838283FE0111C0408151810281A9\r\n:103A2000138148175907E0F04817590799F4109780\r\n:103A300061F012960C93129713961C933296CF0155\r\n:103A4000DF91CF911F910F910895009391021093F0\r\n:103A50009202F4CF2115310551F04217530738F087\r\n:103A6000A901DB019A01BD01DF01F801C1CFEF011E\r\n:103A7000F9CF9093920280939102CDCFFE01E20F95\r\n:103A8000F31F819391932250310939832883D7CF33\r\n:103A900020918F0230919002232B41F4209102015A\r\n:103AA000309103013093900220938F022091000106\r\n:103AB000309101012115310541F42DB73EB74091F8\r\n:103AC000040150910501241B350BE0918F02F09108\r\n:103AD0009002E217F307A0F42E1B3F0B28173907BB\r\n:103AE00078F0AC014E5F5F4F2417350748F04E0F5A\r\n:103AF0005F1F5093900240938F02819391939FCFC9\r\n:103B0000F0E0E0E09CCFCF93DF930097E9F0FC0179\r\n:103B1000329713821282A0919102B0919202ED012C\r\n:103B200030E020E01097A1F420813181820F931FB3\r\n:103B300020918F02309190022817390709F061C057\r\n:103B4000F0939002E0938F02DF91CF910895EA0104\r\n:103B5000CE17DF07E8F54A815B819E0141155105CB\r\n:103B6000B1F7E901FB83EA8349915991C40FD51F4D\r\n:103B7000EC17FD0761F4808191810296840F951FF7\r\n:103B8000E90199838883828193819B838A83F0E012\r\n:103B9000E0E012968D919C9113970097B9F52D91C5\r\n:103BA0003C911197CD010296820F931F20918F02B5\r\n:103BB000309190022817390739F6309751F5109255\r\n:103BC000920210929102B0939002A0938F02BCCF08\r\n:103BD000D383C28340815181840F951FC817D907B1\r\n:103BE00061F44E5F5F4F88819981480F591F51835F\r\n:103BF00040838A819B81938382832115310509F05B\r\n:103C0000B0CFF0939202E09391029ECFFD01DC01D0\r\n:103C1000C0CF13821282D7CF81E090E0F8940C9449\r\n:103C2000181EDC0101C06D9341505040E0F708952B\r\n:103C300015E0C0E4D5E004C0FE010E94E11C21961D\r\n:0A3C4000C134D107C9F7F894FFCF93\r\n:103C4A0000009302800000000000B41187113714AD\r\n:103C5A006B0580116D115E1100000000FB0A300631\r\n:103C6A003714201004086B050B0F7D0D990D8D0D6F\r\n:103C7A00730F6B05BF08E1137407BD07C60CA90CC7\r\n:043C8A00310CD20B1C\r\n:00000001FF\r\n";

// src/robotics/project/trackedRobot.ts
var TEMPLATE_TRACKED = "robot-oruga-radar";
var TRACKED_TEMPLATE_INFO = {
  id: TEMPLATE_TRACKED,
  name: "Robot de orugas con radar y cara",
  layout: "2 orugas \xB7 cuerpo \xB7 cuello con servo \xB7 cabeza con pantalla y radar \xB7 2 brazos con pinza",
  summary: "Un robot de pie, dif\xEDcil y simp\xE1tico: base de orugas, cuerpo con carcasa de vidrio, cabeza con pantalla (ojos y boca) y radar sobre un cuello con servo, y dos brazos completos (hombro, codo y pinza) que recogen objetos. Se arma, se cablea (44 cables) y se programa."
};
var TEMPLATE_PICK = "robot-oruga-recoger";
var PICK_TEMPLATE_INFO = {
  id: TEMPLATE_PICK,
  name: "Robot de orugas recoge cubos",
  layout: "El mismo robot de orugas \xB7 2 cubos sobre el suelo \xB7 programa que los agarra, levanta y suelta",
  summary: "El robot de orugas con radar y cara, parado frente a dos cubos de 30 mm. Sus dos brazos estiran el antebrazo, cierran la pinza, levantan los cubos y los sueltan. Los cubos son objetos f\xEDsicos: se empujan, se agarran y caen."
};
var fail = (message) => {
  throw new Error(`Robot de orugas: ${message}`);
};
function buildTrackedRobot(now = (/* @__PURE__ */ new Date()).toISOString(), pick = false) {
  const info = pick ? PICK_TEMPLATE_INFO : TRACKED_TEMPLATE_INFO, sketch = pick ? PICK_SKETCH : TRACKED_SKETCH, hex = pick ? PICK_HEX : TRACKED_HEX;
  let p = newRobotProject(info.name, now);
  const put = (def, pos = [0, 0.5, 0], rot) => {
    const r = addPart(p, def, pos, rot);
    if ("error" in r) fail(r.error);
    else p = r.project;
    return p.parts.at(-1).instanceId;
  };
  const join = (parent, anchor2, child, childAnchor = "base") => {
    const r = attach(p, { instanceId: parent, anchorId: anchor2 }, { instanceId: child, anchorId: childAnchor });
    if ("error" in r) fail(r.error);
    else p = r.project;
  };
  const pin2 = (instanceId, pinId) => ({ instanceId, pinId });
  const RED = "#d64545", BLACK = "#222222", BLUE = "#2a67a3", YELLOW = "#e0a52a", GREEN = "#2a8f4f", WHITE = "#e8e8e8";
  const wire = (a, b, color) => {
    const r = connect(p, a, b, color);
    if ("error" in r) fail(r.error);
    else p = r.project;
  };
  const chassis2 = put("chassis-2wd", [0, 0.0455, 0]);
  p = renamePart(setPartProp(p, chassis2, "color", "oruga"), chassis2, "Base de oruga");
  const motorLeft = put("dc-motor-tt"), motorRight = put("dc-motor-tt");
  join(chassis2, "motor-r", motorLeft);
  join(chassis2, "motor-l", motorRight);
  const sprocketLeft = put("track-sprocket"), sprocketRight = put("track-sprocket");
  join(motorLeft, "axle-r", sprocketLeft, "hub");
  join(motorRight, "axle-l", sprocketRight, "hub");
  const beltLeft = put("track-belt"), beltRight = put("track-belt");
  join(motorLeft, "track-r", beltLeft);
  join(motorRight, "track-l", beltRight);
  const uno = put("arduino-uno-r3");
  join(chassis2, "board-left", uno);
  const board = put("breadboard-400");
  join(chassis2, "breadboard", board);
  const driver = put("l298n-module");
  join(chassis2, "driver-rear", driver);
  const regulator2 = put("regulator-5v");
  join(chassis2, "regulator", regulator2);
  const servoRegulator = put("regulator-5v");
  join(chassis2, "4wd-regulator", servoRegulator);
  const battery2 = put("battery-holder-4aa");
  join(chassis2, "battery", battery2);
  const power = put("power-switch");
  join(chassis2, "switch", power);
  const torso = put("robot-torso");
  join(chassis2, "torso", torso);
  const servo = put("servo-sg90");
  join(torso, "neck", servo);
  const head = put("robot-head");
  join(servo, "horn", head);
  const display = put("oled-ssd1306", [0, 0.5, 0], [Math.SQRT1_2, 0, 0, Math.SQRT1_2]);
  join(head, "screen", display);
  const sensor = put("hc-sr04");
  join(head, "visor", sensor);
  const arm2 = (side) => {
    const name = side > 0 ? "izquierdo" : "derecho", up = Math.SQRT1_2;
    const shoulderRot = side > 0 ? [0, 0, -up, up] : [-up, up, 0, 0];
    const elbowRot = side > 0 ? [-up, up, 0, 0] : [0, 0, -up, up];
    const shoulder = put("servo-sg90", [0, 0.5, 0], shoulderRot);
    join(torso, side > 0 ? "shoulder-l" : "shoulder-r", shoulder);
    const upper = put("robot-arm");
    join(shoulder, "horn", upper);
    const elbow = put("servo-sg90", [0, 0.5, 0], elbowRot);
    join(upper, side > 0 ? "elbow-l" : "elbow-r", elbow);
    const forearm = put("robot-forearm");
    join(elbow, "horn", forearm);
    const claw = put("robot-claw");
    join(forearm, "wrist", claw);
    const grip = put("servo-sg90");
    join(claw, "servo", grip);
    for (const [id, label] of [[shoulder, `Servo hombro ${name}`], [upper, `Brazo ${name}`], [elbow, `Servo codo ${name}`], [forearm, `Antebrazo ${name}`], [claw, `Pinza ${name}`], [grip, `Servo pinza ${name}`]]) p = renamePart(p, id, label);
    return { shoulder, elbow, grip };
  };
  const left = arm2(1), right = arm2(-1);
  p = renamePart(p, servo, "Servo del cuello");
  p = renamePart(p, regulator2, "Regulador 5 V \xB7 l\xF3gica");
  p = renamePart(p, servoRegulator, "Regulador 5 V \xB7 servos");
  p = setPartProp(p, battery2, "voltage", 9);
  p = setPartProp(setPartProp(setPartProp(p, driver, "jumperENA", false), driver, "jumperENB", false), driver, "jumper5V", false);
  const METAL = "#aab3b9";
  wire(pin2(battery2, "B+"), pin2(power, "IN"), RED);
  wire(pin2(power, "OUT"), pin2(driver, "+12V"), RED);
  wire(pin2(power, "OUT"), pin2(regulator2, "VIN"), RED);
  wire(pin2(power, "OUT"), pin2(servoRegulator, "VIN"), RED);
  wire(pin2(battery2, "B-"), pin2(driver, "GND"), BLACK);
  wire(pin2(battery2, "B-"), pin2(regulator2, "GND"), BLACK);
  wire(pin2(battery2, "B-"), pin2(servoRegulator, "GND"), BLACK);
  wire(pin2(regulator2, "5V"), pin2(board, "L+1"), RED);
  wire(pin2(regulator2, "GND.OUT"), pin2(board, "L-1"), BLACK);
  wire(pin2(servoRegulator, "5V"), pin2(board, "R+1"), RED);
  wire(pin2(servoRegulator, "GND.OUT"), pin2(board, "R-1"), BLACK);
  wire(pin2(board, "R-25"), pin2(board, "L-25"), BLACK);
  wire(pin2(board, "L+10"), pin2(uno, "5V"), RED);
  wire(pin2(board, "L-10"), pin2(uno, "GND.1"), BLACK);
  wire(pin2(board, "L+3"), pin2(driver, "+5V"), RED);
  wire(pin2(driver, "OUT1"), pin2(motorLeft, "M+"), RED);
  wire(pin2(driver, "OUT2"), pin2(motorLeft, "M-"), BLACK);
  wire(pin2(driver, "OUT3"), pin2(motorRight, "M+"), RED);
  wire(pin2(driver, "OUT4"), pin2(motorRight, "M-"), BLACK);
  for (const [d, i] of [["D4", "IN1"], ["D7", "IN2"], ["D8", "IN3"], ["D12", "IN4"]]) wire(pin2(uno, d), pin2(driver, i), BLUE);
  wire(pin2(uno, "D5"), pin2(driver, "ENA"), YELLOW);
  wire(pin2(uno, "D6"), pin2(driver, "ENB"), YELLOW);
  wire(pin2(sensor, "VCC"), pin2(board, "L+5"), RED);
  wire(pin2(sensor, "GND"), pin2(board, "L-5"), BLACK);
  wire(pin2(uno, "D9"), pin2(board, "A5"), GREEN);
  wire(pin2(board, "E5"), pin2(sensor, "TRIG"), GREEN);
  wire(pin2(uno, "D10"), pin2(board, "A7"), GREEN);
  wire(pin2(board, "E7"), pin2(sensor, "ECHO"), GREEN);
  const servoSignals = [[servo, "D3", 10], [left.shoulder, "D11", 12], [left.elbow, "D13", 14], [left.grip, "A1", 16], [right.shoulder, "D2", 18], [right.elbow, "A0", 20], [right.grip, "A2", 22]];
  servoSignals.forEach(([servoId, sig, row], i) => {
    wire(pin2(servoId, "VCC"), pin2(board, `R+${3 + i}`), RED);
    wire(pin2(servoId, "GND"), pin2(board, `R-${3 + i}`), BLACK);
    wire(pin2(servoId, "SIG"), pin2(board, `J${row}`), YELLOW);
    wire(pin2(board, `F${row}`), pin2(uno, sig), YELLOW);
  });
  wire(pin2(display, "VCC"), pin2(board, "L+8"), RED);
  wire(pin2(display, "GND"), pin2(board, "L-8"), BLACK);
  wire(pin2(display, "SDA"), pin2(board, "J24"), WHITE);
  wire(pin2(board, "F24"), pin2(uno, "A4"), WHITE);
  wire(pin2(display, "SCL"), pin2(board, "J26"), GREEN);
  wire(pin2(board, "F26"), pin2(uno, "A5"), GREEN);
  p = ensureFirmware(p, uno);
  p = { ...p, firmware: p.firmware.map((f) => f.targetInstanceId === uno ? { ...f, source: sketch, updatedAt: now } : f) };
  p = setFirmwareArtifact(p, uno, { hex, origin: "remote-compiler", sourceHash: hashSource(sketch), compiledAt: now });
  const cubes = () => [-1, 1].map((side) => ({ id: side > 0 ? "cubo-izquierdo" : "cubo-derecho", shape: "box", transform: { position: [0.146 * side, 0.015, 0.078], rotation: [0, 0, 0, 1] }, size: [0.03, 0.03, 0.03], movable: true, massKg: 0.04 }));
  p = { ...p, scene: { ...p.scene, obstacles: pick ? cubes() : [
    { id: "caja-frente", shape: "box", transform: { position: [0, 0.2, 0.95], rotation: [0, 0, 0, 1] }, size: [0.5, 0.4, 0.1] },
    { id: "pared-izquierda", shape: "box", transform: { position: [0.32, 0.2, 0.75], rotation: [0, 0, 0, 1] }, size: [0.08, 0.4, 0.7] }
  ] } };
  return { ...p, name: info.name, workspace: { mode: "build", camera: { position: [0.62, 0.42, 0.72], target: [0, 0.07, 0.04] } } };
}

// src/robotics/arm/e6Data.ts
var E6_JOINTS = [{ "origin": [0, 0, 0.1268], "rpy": [0, 0, 0], "axis": [0, 0, 1], "lower": -6.27, "upper": 6.27, "velocity": 2.36, "effort": 100 }, { "origin": [-0.046, 0, 0.04], "rpy": [1.5708, 0, -1.5708], "axis": [0, 0, 1], "lower": -2.356, "upper": 2.356, "velocity": 2.36, "effort": 100 }, { "origin": [0, 0.18906, 3e-3], "rpy": [0, 0, 0], "axis": [0, 0, 1], "lower": -2.6878, "upper": 2.6878, "velocity": 2.36, "effort": 100 }, { "origin": [0, 0.16, 5e-3], "rpy": [0, 0, 0], "axis": [0, 0, 1], "lower": -2.7925, "upper": 2.7925, "velocity": 2.36, "effort": 100 }, { "origin": [0, 0.067, 0.032], "rpy": [-1.5708, 1.5708, 0], "axis": [0, 0, 1], "lower": -3.0194, "upper": 3.0194, "velocity": 2.36, "effort": 100 }, { "origin": [-0.047, 0, 0.034], "rpy": [1.5708, 0, -1.5708], "axis": [0, 0, 1], "lower": -6.27, "upper": 6.27, "velocity": 2.36, "effort": 100 }];
var E6_HOME = [0, 30.578757526132033, 41.6884091737187, 20.32854257124161, -90.80235137233286, 0];

// src/robotics/catalog/torso.ts
var mm2 = (v) => v / 1e3;
var TORSO_ID = "robot-torso";
var TORSO_BOXES = [
  { center: [0, mm2(78), 0], half: [mm2(68), mm2(3), mm2(48)] },
  // placa del cuello
  { center: [0, mm2(60), 0], half: [mm2(112), mm2(19), mm2(38)] },
  // barra de hombros (los brazos cuelgan por fuera de las orugas)
  { center: [0, mm2(30), 0], half: [mm2(54), mm2(44), mm2(46)] },
  // pecho
  ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ center: [sx * mm2(64), -mm2(50), sz * mm2(69)], half: [mm2(4), mm2(31), mm2(4)] }))),
  // cuatro columnas del vientre
  ...[-1, 1].map((sx) => ({ center: [sx * mm2(64), -mm2(75), 0], half: [mm2(4), mm2(3), mm2(56)] }))
  // rieles inferiores (más cortos que el cuerpo para dejar libre el interruptor del chasis)
];

// src/robotics/build/interference.ts
function obbOf(part2, shrink = 0) {
  const def = getDefinition(part2.definitionId);
  if (!def) return null;
  const q = part2.transform.rotation;
  return { center: part2.transform.position, axes: [qRotate(q, [1, 0, 0]), qRotate(q, [0, 1, 0]), qRotate(q, [0, 0, 1])], half: [Math.max(0, def.dimensions[0] / 2 - shrink), Math.max(0, def.dimensions[1] / 2 - shrink), Math.max(0, def.dimensions[2] / 2 - shrink)] };
}
function boxesOf(part2, shrink) {
  if (part2.definitionId === "arm-drop-zone") return [];
  if (part2.definitionId === TORSO_ID) {
    const q = part2.transform.rotation;
    return TORSO_BOXES.map((b) => ({ center: tPoint(part2.transform, b.center), axes: [qRotate(q, [1, 0, 0]), qRotate(q, [0, 1, 0]), qRotate(q, [0, 0, 1])], half: b.half.map((h) => Math.max(0, h - shrink)) }));
  }
  const hulls = combatHulls(part2.definitionId);
  if (!hulls) {
    const box2 = obbOf(part2, shrink);
    return box2 ? [box2] : [];
  }
  return hulls.map((hull) => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < hull.vertices.length; i++) {
      const axis = i % 3;
      min[axis] = Math.min(min[axis], hull.vertices[i]);
      max[axis] = Math.max(max[axis], hull.vertices[i]);
    }
    const q = part2.transform.rotation;
    return { center: tPoint(part2.transform, min.map((v, i) => (v + max[i]) / 2)), axes: [qRotate(q, [1, 0, 0]), qRotate(q, [0, 1, 0]), qRotate(q, [0, 0, 1])], half: min.map((v, i) => Math.max(0, (max[i] - v) / 2 - shrink)) };
  });
}
function obbIntersect(a, b) {
  const t = sub(b.center, a.center);
  const radius = (o, axis) => o.half[0] * Math.abs(dot(o.axes[0], axis)) + o.half[1] * Math.abs(dot(o.axes[1], axis)) + o.half[2] * Math.abs(dot(o.axes[2], axis));
  const axes = [...a.axes, ...b.axes];
  for (const x of a.axes) for (const y of b.axes) {
    const c = cross(x, y);
    if (len(c) > 1e-9) axes.push(c);
  }
  for (const axis of axes) if (Math.abs(dot(t, axis)) > radius(a, axis) + radius(b, axis)) return false;
  return true;
}
var nested = (p, a, b) => {
  const d = [p.parts.find((x) => x.instanceId === a)?.definitionId, p.parts.find((x) => x.instanceId === b)?.definitionId].sort().join("|");
  return d === "track-belt|track-sprocket" || d === "robot-arm|robot-forearm";
};
function findInterferences(p, shrink = 5e-4) {
  const boxes = p.parts.map((x) => ({ id: x.instanceId, boxes: boxesOf(x, shrink) }));
  const joined = new Set(p.attachments.flatMap((a) => [`${a.parent.instanceId}|${a.child.instanceId}`, `${a.child.instanceId}|${a.parent.instanceId}`]));
  const out = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (joined.has(`${a.id}|${b.id}`) || nested(p, a.id, b.id)) continue;
    if (a.boxes.some((x) => b.boxes.some((y) => dist(x.center, y.center) <= len(x.half) + len(y.half) && obbIntersect(x, y)))) out.push([a.id, b.id]);
  }
  return out;
}

// src/robotics/arm/kinematics.ts
var HOME = E6_HOME;
var JOINTS = E6_JOINTS.map((j, i) => ({ name: ["J1 \xB7 Base", "J2 \xB7 Hombro", "J3 \xB7 Codo", "J4 \xB7 Giro de mu\xF1eca", "J5 \xB7 Flexi\xF3n de mu\xF1eca", "J6 \xB7 Herramienta"][i], min: j.lower / DEG, max: j.upper / DEG, velocity: Math.min(120, j.velocity / DEG) }));

// src/robotics/arm/model.ts
var ARM_ID = "educational-arm-e6";
var BLOCK_ID = "arm-practice-block";
var ZONE_ID = "arm-drop-zone";
var ARM_TEMPLATE = "brazo-educativo-e6";
var ARM_TRANSFER_TEMPLATE = "brazo-e6-transferencia";
function buildArmTransfer(now = (/* @__PURE__ */ new Date()).toISOString()) {
  const p = buildArmPractice(now), arm2 = p.parts[0];
  const positions = [[0.25, 0.1, -0.14], [0.38, 0.1, -0.14], [0.25, 0.23, -0.27]];
  return { ...p, name: "E6 \xB7 transferencia de tres piezas", parts: [arm2, ...positions.flatMap(([x, z, targetZ], i) => {
    const zoneId = newId();
    return [
      { instanceId: newId(), definitionId: BLOCK_ID, label: `Pieza ${i + 1} \xB7 50 g`, transform: { ...tIdentity(), position: [x, 0.0175, z] }, props: { massKg: 0.05, startX: x, startZ: z, targetZone: zoneId } },
      { instanceId: zoneId, definitionId: ZONE_ID, label: `Destino ${i + 1}`, transform: { ...tIdentity(), position: [x, 2e-3, targetZ] }, locked: true }
    ];
  })] };
}
function buildArmPractice(now = (/* @__PURE__ */ new Date()).toISOString()) {
  const p = newRobotProject("Brazo educativo \xB7 pr\xE1ctica de pinza", now);
  const arm2 = { instanceId: newId(), definitionId: ARM_ID, label: "Brazo educativo \xB7 referencia E6", transform: { ...tIdentity(), position: [0, 0.0515, 0] }, locked: true, props: { ...Object.fromEntries(HOME.map((v, i) => [`j${i + 1}`, v])), gripperOpen: true, held: "", modelRevision: "e6-urdf-v1" } };
  return { ...p, parts: [
    arm2,
    { instanceId: newId(), definitionId: BLOCK_ID, label: "Pieza de pr\xE1ctica \xB7 50 g", transform: { ...tIdentity(), position: [0.28, 0.0175, 0.1] }, props: { massKg: 0.05 } },
    { instanceId: newId(), definitionId: ZONE_ID, label: "Zona de entrega", transform: { ...tIdentity(), position: [0.28, 2e-3, -0.14] }, locked: true }
  ], workspace: { mode: "simulate", welcomeDismissed: true, camera: { position: [1, 0.8, 1.1], target: [0.15, 0.12, 0] } } };
}

// src/robotics/conveyor/model.ts
function buildConveyorCell(now = (/* @__PURE__ */ new Date()).toISOString()) {
  const p = buildArmPractice(now), arm2 = p.parts.find((x) => x.definitionId === ARM_ID);
  const belt = { instanceId: newId(), definitionId: CONVEYOR_ID, label: "Cinta \xB7 presencia y color", transform: { ...tIdentity(), position: [0.28, 0.04, 0.4] }, locked: true, props: { speedMps: 0.08, jammed: false, sensorFault: false, phaseM: 0 } };
  const destinations = [[0.25, -0.14], [0.38, -0.14], [0.25, -0.27]];
  return { ...p, name: "C\xE9lula E6 \xB7 cinta y clasificaci\xF3n", parts: [arm2, belt, ...SORT_COLORS.flatMap((color, i) => {
    const zoneId = newId(), [r, g, b] = COLOR_RGB[color], z = 0.28 + i * 0.17, [x, dz] = destinations[i];
    return [
      { instanceId: newId(), definitionId: BLOCK_ID, label: `Pieza ${color}`, transform: { ...tIdentity(), position: [0.28, 0.0975, z] }, props: { massKg: 0.05, startX: 0.28, startY: 0.046, startZ: z, surfaceR: r, surfaceG: g, surfaceB: b, targetZone: zoneId } },
      { instanceId: zoneId, definitionId: ZONE_ID, label: `Destino ${color}`, transform: { ...tIdentity(), position: [x, 2e-3, dz] }, locked: true, props: { acceptColor: color, surfaceR: r, surfaceG: g, surfaceB: b } }
    ];
  })], workspace: { mode: "simulate", welcomeDismissed: true, camera: { position: [1.25, 1, 1.45], target: [0.2, 0.1, 0.25] } } };
}

// src/robotics/project/templates.ts
var TEMPLATE_READY_ROBOT = "robot-2-ruedas-listo";
var TEMPLATE_LINE_ROBOT = "robot-seguidor-linea";
var TEMPLATE_EXPLORER = "robot-explorador-luces";
var TEMPLATE_ROVER_4WD = "robot-rover-4wd";
var TEMPLATE_TOWER = "robot-torre-seguidor";
var TEMPLATE_SUMO = "robot-minisumo-practica";
var TEMPLATE_WEDGE = "robot-sumo-cuna";
var TEMPLATE_SCOOP = "robot-sumo-pala-4wd";
var TEMPLATE_PUSHER = "robot-sumo-defensa";
var COMBAT_TEMPLATES = [
  { id: TEMPLATE_WEDGE, name: "Sumo cu\xF1a \xB7 perfil bajo", layout: "2 motores \xB7 cu\xF1a inclinada \xB7 sensores de borde", summary: "Cu\xF1a de 180 mm para entrar bajo el rival. Construcci\xF3n editable con contacto f\xEDsico de la rampa." },
  { id: TEMPLATE_SCOOP, name: "Sumo pala \xB7 4WD", layout: "4 motores \xB7 pala con laterales \xB7 sensores de borde", summary: "Pala empujadora fija de 200 mm y cuatro ruedas motrices. Base inclinada, respaldo y laterales con contacto f\xEDsico independiente." },
  { id: TEMPLATE_PUSHER, name: "Sumo defensa \xB7 empujador", layout: "2 motores \xB7 escudo frontal ancho \xB7 sensores de borde", summary: "Defensa vertical de 200 mm para empujar de frente. Compara su comportamiento con la cu\xF1a y la pala." }
];
var KIT_TEMPLATES = [
  { id: TEMPLATE_READY_ROBOT, layout: "2 motores \xB7 2 ruedas \xB7 1 plataforma", name: "Robot 2 ruedas \xB7 listo para usar", summary: "Evita obst\xE1culos con ultrasonido. Protoboard cableada, interruptor y regulador de 5 V; portapilas de 6 V." },
  { id: TEMPLATE_LINE_ROBOT, layout: "2 motores \xB7 sensores inferiores \xB7 1 plataforma", name: "Robot seguidor de l\xEDnea", summary: "Dos sensores infrarrojos bajo el chasis y pista ovalada. Lee el suelo y corrige cada motor a trav\xE9s de su programa." },
  { id: TEMPLATE_EXPLORER, layout: "2 motores \xB7 indicador en protoboard \xB7 1 plataforma", name: "Robot explorador con luces", summary: "Evita obst\xE1culos y enciende un LED de aviso a trav\xE9s de una resistencia insertada en la protoboard." },
  { id: TEMPLATE_ROVER_4WD, layout: "4 motores \xB7 4 ruedas \xB7 2 drivers", name: "Rover 4WD", summary: "Armado con cuatro motores, cuatro ruedas y dos drivers. Sin rueda loca; evita obst\xE1culos con tracci\xF3n en ambos ejes." },
  { id: TEMPLATE_TOWER, layout: "2 plataformas \xB7 columnas de soportes", name: "Robot de dos pisos \xB7 seguidor de objetos", summary: "Dos chasis separados por columnas: potencia y protoboard abajo; Arduino y sensor arriba. Se acerca, espera o retrocede seg\xFAn la distancia." },
  { id: TEMPLATE_SUMO, layout: "Tracci\xF3n delantera \xB7 apoyo trasero \xB7 defensa baja", name: "Minisumo \xB7 pr\xE1ctica de borde", summary: "Detecta el borde negro y retrocede. Modifica su construcci\xF3n y programa; ll\xE9valo a la Arena para enfrentar otro robot." }
];
var TEMPLATES = [
  ...KIT_TEMPLATES.filter((t) => t.id !== TEMPLATE_TOWER),
  TRACKED_TEMPLATE_INFO,
  PICK_TEMPLATE_INFO,
  ...COMBAT_TEMPLATES,
  { id: ARM_TEMPLATE, layout: "Modelo oficial E6 \xB7 6 ejes \xB7 ense\xF1anza de puntos", name: "Brazo educativo \xB7 referencia E6", summary: "Operaci\xF3n con servos, Jog, MovJ/MovL, pausa, emergencia y pinza de pr\xE1ctica. Trayectorias comprobadas y ca\xEDda de piezas con f\xEDsica." },
  { id: ARM_TRANSFER_TEMPLATE, layout: "E6 \xB7 3 piezas \xB7 3 destinos \xB7 ciclo editable", name: "E6 \xB7 transferencia de tres piezas", summary: "Prepara y ejecuta un ciclo de recogida y entrega por pieza. Agarre comprobado, descenso lineal y resultado por posici\xF3n f\xEDsica." },
  { id: CONVEYOR_TEMPLATE, layout: "Cinta \xB7 presencia \xB7 lectura RGB \xB7 brazo E6", name: "C\xE9lula E6 \xB7 cinta y clasificaci\xF3n", summary: "Transporta tres piezas, detiene la banda por presencia, lee su color y coordina la recogida y entrega con el brazo. Incluye fallas de sensor y atasco." }
];
var fail2 = (msg) => {
  throw new Error(`Plantilla inv\xE1lida: ${msg}`);
};
function buildKit(kind, now) {
  const templateIndex = { avoid: 0, line: 1, explorer: 2, rover: 3, tower: 4, sumo: 5, sumo4: 3 };
  const template = KIT_TEMPLATES[templateIndex[kind]];
  const rover = kind === "rover" || kind === "sumo4", tower = kind === "tower", sumo = kind === "sumo", border = sumo || kind === "sumo4";
  const transverse = [0, Math.SQRT1_2, 0, Math.SQRT1_2];
  let p = newRobotProject(template.name, now);
  const put = (def, pos = [0, 0.5, 0], rot) => {
    const r = addPart(p, def, pos, rot);
    if ("error" in r) fail2(r.error);
    else p = r.project;
    return p.parts.at(-1).instanceId;
  };
  const join = (parent, anchor2, child, childAnchor = "base") => {
    const r = attach(p, { instanceId: parent, anchorId: anchor2 }, { instanceId: child, anchorId: childAnchor });
    if ("error" in r) fail2(r.error);
    else p = r.project;
  };
  const chassis2 = put("chassis-2wd", [0, 0.0455, 0]);
  const motorL = put("dc-motor-tt"), motorR = put("dc-motor-tt");
  join(chassis2, rover ? "4wd-motor-rl" : sumo ? "sumo-motor-l" : "motor-l", motorL);
  join(chassis2, rover ? "4wd-motor-rr" : sumo ? "sumo-motor-r" : "motor-r", motorR);
  const wheelL = put("wheel-65"), wheelR = put("wheel-65");
  for (const [parent, anchorId, child] of [[motorL, "axle-l", wheelL], [motorR, "axle-r", wheelR]]) {
    const r = attach(p, { instanceId: parent, anchorId }, { instanceId: child, anchorId: "hub" });
    if ("error" in r) fail2(r.error);
    else p = r.project;
  }
  if (!rover) {
    const caster2 = put("caster-ball");
    join(chassis2, sumo ? "sumo-caster" : "caster", caster2);
  }
  let controlDeck = chassis2;
  if (tower) {
    const upperPosts = [];
    for (const slot of ["tower-post-rl", "tower-post-rr", "tower-post-fl", "tower-post-fr"]) {
      const lower = put("bracket-generic");
      join(chassis2, slot, lower);
      const upper = put("bracket-generic");
      join(lower, "top", upper);
      upperPosts.push(upper);
    }
    controlDeck = put("chassis-2wd");
    join(upperPosts[0], "top", controlDeck, "stack-corner");
  }
  const uno = put("arduino-uno-r3", [0, 0.5, 0], sumo ? transverse : void 0);
  join(controlDeck, tower ? "board" : sumo ? "sumo-uno" : "board-left", uno);
  const board = put("breadboard-400", [0, 0.5, 0], tower || sumo ? transverse : void 0);
  join(chassis2, tower ? "tower-board" : sumo ? "sumo-board" : "breadboard", board);
  const driver = put("l298n-module");
  join(chassis2, rover ? "4wd-driver-a" : tower ? "tower-driver" : sumo ? "sumo-driver" : "driver-rear", driver);
  const battery2 = put("battery-holder-4aa");
  join(chassis2, rover ? "4wd-battery" : sumo ? "sumo-battery" : "battery", battery2);
  const regulator2 = put("regulator-5v");
  join(chassis2, rover ? "4wd-regulator" : tower ? "tower-regulator" : sumo ? "sumo-regulator" : "regulator", regulator2);
  const power = put("power-switch");
  join(chassis2, rover ? "4wd-switch" : tower ? "tower-switch" : sumo ? "sumo-switch" : "switch", power);
  const bracket = put("sensor-bracket");
  join(controlDeck, "front", bracket);
  const sensor = put("hc-sr04");
  join(bracket, "sensor", sensor);
  p = setPartProp(p, battery2, "voltage", 6);
  p = setPartProp(setPartProp(setPartProp(p, driver, "jumperENA", false), driver, "jumperENB", false), driver, "jumper5V", false);
  const pin2 = (instanceId, pinId) => ({ instanceId, pinId });
  const wire = (a, b, color) => {
    const r = connect(p, a, b, color);
    if ("error" in r) fail2(r.error);
    else p = r.project;
  };
  const RED = "#d64545", BLACK = "#222222", BLUE = "#2a67a3", YELLOW = "#e0a52a", GREEN = "#2a8f4f", METAL = "#aab3b9";
  wire(pin2(battery2, "B+"), pin2(power, "IN"), RED);
  wire(pin2(power, "OUT"), pin2(driver, "+12V"), RED);
  wire(pin2(power, "OUT"), pin2(regulator2, "VIN"), RED);
  wire(pin2(battery2, "B-"), pin2(driver, "GND"), BLACK);
  wire(pin2(battery2, "B-"), pin2(regulator2, "GND"), BLACK);
  wire(pin2(regulator2, "5V"), pin2(board, "L+1"), RED);
  wire(pin2(regulator2, "GND.OUT"), pin2(board, "L-1"), BLACK);
  wire(pin2(board, "L+25"), pin2(board, "R+1"), RED);
  wire(pin2(board, "L-25"), pin2(board, "R-1"), BLACK);
  wire(pin2(board, "R+10"), pin2(uno, "5V"), RED);
  wire(pin2(board, "R-10"), pin2(uno, "GND.1"), BLACK);
  wire(pin2(board, "R+5"), pin2(driver, "+5V"), RED);
  for (const [d, i] of [["D4", "IN1"], ["D7", "IN2"], ["D8", "IN3"], ["D12", "IN4"]]) wire(pin2(uno, d), pin2(driver, i), BLUE);
  wire(pin2(uno, "D5"), pin2(driver, "ENA"), YELLOW);
  wire(pin2(uno, "D6"), pin2(driver, "ENB"), YELLOW);
  wire(pin2(driver, "OUT1"), pin2(motorL, "M+"), RED);
  wire(pin2(driver, "OUT2"), pin2(motorL, "M-"), BLACK);
  wire(pin2(driver, "OUT3"), pin2(motorR, "M+"), RED);
  wire(pin2(driver, "OUT4"), pin2(motorR, "M-"), BLACK);
  wire(pin2(sensor, "VCC"), pin2(board, "L+5"), RED);
  wire(pin2(sensor, "GND"), pin2(board, "L-5"), BLACK);
  wire(pin2(uno, "D9"), pin2(board, "A5"), GREEN);
  wire(pin2(board, "E5"), pin2(sensor, "TRIG"), GREEN);
  wire(pin2(uno, "D10"), pin2(board, "A7"), GREEN);
  wire(pin2(board, "E7"), pin2(sensor, "ECHO"), GREEN);
  if (rover) {
    const frontL = put("dc-motor-tt"), frontR = put("dc-motor-tt");
    join(chassis2, "4wd-motor-fl", frontL);
    join(chassis2, "4wd-motor-fr", frontR);
    for (const [motor2, axle] of [[frontL, "axle-l"], [frontR, "axle-r"]]) {
      const wheel2 = put("wheel-65"), r = attach(p, { instanceId: motor2, anchorId: axle }, { instanceId: wheel2, anchorId: "hub" });
      if ("error" in r) fail2(r.error);
      else p = r.project;
    }
    const frontDriver = put("l298n-module");
    join(chassis2, "4wd-driver-b", frontDriver);
    p = setPartProp(setPartProp(setPartProp(p, frontDriver, "jumperENA", false), frontDriver, "jumperENB", false), frontDriver, "jumper5V", false);
    wire(pin2(power, "OUT"), pin2(frontDriver, "+12V"), RED);
    wire(pin2(battery2, "B-"), pin2(frontDriver, "GND"), BLACK);
    wire(pin2(board, "R+20"), pin2(frontDriver, "+5V"), RED);
    for (const [d, i] of [["D4", "IN1"], ["D7", "IN2"], ["D8", "IN3"], ["D12", "IN4"], ["D5", "ENA"], ["D6", "ENB"]]) wire(pin2(uno, d), pin2(frontDriver, i), BLUE);
    wire(pin2(frontDriver, "OUT1"), pin2(frontL, "M+"), RED);
    wire(pin2(frontDriver, "OUT2"), pin2(frontL, "M-"), BLACK);
    wire(pin2(frontDriver, "OUT3"), pin2(frontR, "M+"), RED);
    wire(pin2(frontDriver, "OUT4"), pin2(frontR, "M-"), BLACK);
  }
  if (kind === "line" || border) {
    const support = put("ir-double-bracket");
    join(chassis2, sumo ? "sumo-ir" : "line-sensors", support);
    const left = put("tcrt5000-module"), right = put("tcrt5000-module");
    join(support, "left", left);
    join(support, "right", right);
    for (const [id, tap, row, d] of [[left, 15, 10, "D2"], [right, 20, 12, "D3"]]) {
      wire(pin2(id, "VCC"), pin2(board, `R+${tap}`), RED);
      wire(pin2(id, "GND"), pin2(board, `R-${tap}`), BLACK);
      wire(pin2(id, "DO"), pin2(board, `J${row}`), GREEN);
      wire(pin2(board, `F${row}`), pin2(uno, d), GREEN);
    }
  }
  if (sumo) {
    const upsideDown = [1, 0, 0, 0];
    for (const slot of ["sumo-post-l", "sumo-post-c", "sumo-post-r"]) {
      const hanger = put("bracket-generic", [0, 0.5, 0], upsideDown);
      join(chassis2, slot, hanger);
      const bumper = put("bracket-generic", [0, 0.5, 0], upsideDown);
      join(hanger, "front-low", bumper);
    }
  }
  if (kind === "explorer") {
    const q = [0, Math.SQRT1_2, 0, Math.SQRT1_2];
    const led2 = put("led-5mm", [0, 0.5, 0], q), resistor2 = put("resistor", [0, 0.5, 0], q);
    join(board, "indicator", led2);
    join(board, "resistor", resistor2);
    p = setPartProp(setPartProp(p, led2, "color", "rojo"), resistor2, "ohms", 220);
    wire(pin2(uno, "D11"), pin2(board, "E25"), YELLOW);
    wire(pin2(board, "C25"), pin2(resistor2, "P1"), METAL);
    wire(pin2(resistor2, "P2"), pin2(board, "C21"), METAL);
    wire(pin2(led2, "A"), pin2(board, "A21"), METAL);
    wire(pin2(led2, "K"), pin2(board, "A20"), METAL);
    wire(pin2(board, "E20"), pin2(board, "L-20"), BLACK);
  }
  const source = tower ? FOLLOW_SKETCH : border ? SUMO_SKETCH : kind === "line" ? LINE_SKETCH : kind === "explorer" ? EXPLORER_SKETCH : AVOID_SKETCH;
  const hex = tower ? FOLLOW_HEX : border ? SUMO_HEX : kind === "line" ? LINE_HEX : kind === "explorer" ? EXPLORER_HEX : AVOID_HEX;
  p = ensureFirmware(p, uno);
  p = { ...p, firmware: p.firmware.map((f) => f.targetInstanceId === uno ? { ...f, source, updatedAt: now } : f) };
  p = setFirmwareArtifact(p, uno, { hex, origin: "remote-compiler", sourceHash: hashSource(source), compiledAt: now });
  p = { ...p, scene: { ...p.scene, obstacles: kind === "line" ? [] : [{ id: "caja-ejemplo", shape: "box", transform: { position: [0, 0.1, 0.75], rotation: [0, 0, 0, 1] }, size: [0.4, 0.2, 0.1] }], ...kind === "line" ? { lineTrack: makeLineTrack("oval") } : {} }, workspace: { mode: "build" } };
  if (tower) p = { ...p, scene: { ...p.scene, obstacles: [{ id: "objeto-seguimiento", shape: "cylinder", transform: { position: [0, 0.1, 0.65], rotation: [0, 0, 0, 1] }, size: [0.16, 0.2, 0.16] }] } };
  if (border) p = { ...p, scene: { ...p.scene, obstacles: [], lineTrack: makeLineTrack("arena") } };
  return p;
}
var buildReadyRobot = (now = (/* @__PURE__ */ new Date()).toISOString()) => buildKit("avoid", now);
var buildLineRobot = (now = (/* @__PURE__ */ new Date()).toISOString()) => buildKit("line", now);
var buildExplorer = (now = (/* @__PURE__ */ new Date()).toISOString()) => buildKit("explorer", now);
var buildRover4wd = (now = (/* @__PURE__ */ new Date()).toISOString()) => buildKit("rover", now);
var buildTowerRobot = (now = (/* @__PURE__ */ new Date()).toISOString()) => buildKit("tower", now);
var buildSumoRobot = (now = (/* @__PURE__ */ new Date()).toISOString()) => buildKit("sumo", now);
function buildCombatRobot(kind, now = (/* @__PURE__ */ new Date()).toISOString()) {
  let p = buildKit(kind === "scoop" ? "sumo4" : "sumo", now);
  if (kind !== "scoop") p = removeParts(p, p.parts.filter((x) => x.definitionId === "bracket-generic").map((x) => x.instanceId)).project;
  const chassis2 = p.parts.find((x) => x.definitionId === "chassis-2wd");
  if (kind === "scoop") {
    const support = p.parts.find((x) => x.definitionId === "ir-double-bracket");
    p = detach(p, p.attachments.find((x) => x.child.instanceId === support.instanceId).id);
    const joinedSupport = attach(p, { instanceId: chassis2.instanceId, anchorId: "combat-ir" }, { instanceId: support.instanceId, anchorId: "base" });
    if ("error" in joinedSupport) return fail2(joinedSupport.error);
    p = joinedSupport.project;
  }
  const sensorBracket2 = p.parts.find((x) => x.definitionId === "sensor-bracket");
  const old = p.attachments.find((x) => x.child.instanceId === sensorBracket2.instanceId);
  p = detach(p, old.id);
  const elevated = attach(p, { instanceId: chassis2.instanceId, anchorId: "combat-sensor" }, { instanceId: sensorBracket2.instanceId, anchorId: "base" });
  if ("error" in elevated) return fail2(elevated.error);
  p = elevated.project;
  const added = addPart(p, `sumo-${kind}`);
  if ("error" in added) return fail2(added.error);
  p = added.project;
  const joined = attach(p, { instanceId: chassis2.instanceId, anchorId: "combat-front" }, { instanceId: p.parts.at(-1).instanceId, anchorId: "back" });
  if ("error" in joined) return fail2(joined.error);
  p = joined.project;
  const id = kind === "wedge" ? TEMPLATE_WEDGE : kind === "scoop" ? TEMPLATE_SCOOP : TEMPLATE_PUSHER;
  return { ...p, name: COMBAT_TEMPLATES.find((x) => x.id === id).name, workspace: { mode: "build", camera: { position: [0.65, 0.48, 0.75], target: [0, 0.04, 0.03] } } };
}
function buildTemplate(id, now) {
  if (id === TEMPLATE_TRACKED) return buildTrackedRobot(now);
  if (id === TEMPLATE_PICK) return buildTrackedRobot(now, true);
  if (id === TEMPLATE_WEDGE || id === TEMPLATE_SCOOP || id === TEMPLATE_PUSHER) return buildCombatRobot(id === TEMPLATE_WEDGE ? "wedge" : id === TEMPLATE_SCOOP ? "scoop" : "bumper", now);
  if (id === ARM_TEMPLATE) return buildArmPractice(now);
  if (id === ARM_TRANSFER_TEMPLATE) return buildArmTransfer(now);
  if (id === CONVEYOR_TEMPLATE) return buildConveyorCell(now);
  return id === TEMPLATE_READY_ROBOT ? buildReadyRobot(now) : id === TEMPLATE_LINE_ROBOT ? buildLineRobot(now) : id === TEMPLATE_EXPLORER ? buildExplorer(now) : id === TEMPLATE_ROVER_4WD ? buildRover4wd(now) : id === TEMPLATE_TOWER ? buildTowerRobot(now) : id === TEMPLATE_SUMO ? buildSumoRobot(now) : null;
}
export {
  buildTemplate,
  findInterferences
};
