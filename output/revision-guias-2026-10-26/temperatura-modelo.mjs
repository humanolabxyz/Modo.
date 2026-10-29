// src/lab/temperature/physics.ts
var TERMINALS = [
  { id: "tc+", label: "Termocupla +", sensor: "tc" },
  { id: "tc-", label: "Termocupla \u2212", sensor: "tc" },
  { id: "pt1", label: "Pt100 \xB7 hilo rojo 1", sensor: "pt" },
  { id: "pt2", label: "Pt100 \xB7 hilo rojo 2", sensor: "pt" },
  { id: "pt3", label: "Pt100 \xB7 hilo blanco 3", sensor: "pt" },
  { id: "pt4", label: "Pt100 \xB7 hilo blanco 4", sensor: "pt" },
  { id: "tx+", label: "Salida del transmisor +", sensor: "tx" },
  { id: "tx-", label: "Salida del transmisor \u2212", sensor: "tx" }
];
var terminalSensor = (t) => TERMINALS.find((x) => x.id === t).sensor;
var ptSide = (t) => t === "pt1" || t === "pt2" ? "red" : t === "pt3" || t === "pt4" ? "white" : null;
var K_NEG = [0, 0.039450128025, 23622373598e-15, -32858906784e-17, -49904828777e-19, -67509059173e-21, -57410327428e-23, -31088872894e-25, -10451609365e-27, -19889266878e-30, -16322697486e-33];
var K_POS = [-0.017600413686, 0.038921204975, 18558770032e-15, -99457592874e-18, 31840945719e-20, -56072844889e-23, 56075059059e-26, -32020720003e-29, 97151147152e-33, -12104721275e-36];
var J_ALL = [0, 0.050381187815, 3047583693e-14, -8568106572e-17, 1332293174e-19, -17022405966e-23, 20954753418e-26, -12538395336e-29, 15631725697e-33];
var horner = (c, t) => {
  let s = 0;
  for (let i = c.length - 1; i >= 0; i--) s = s * t + c[i];
  return s;
};
function tcEmf(type, celsius) {
  if (type === "J") return horner(J_ALL, celsius);
  if (celsius < 0) return horner(K_NEG, celsius);
  return horner(K_POS, celsius) + 0.1185976 * Math.exp(-1183432e-10 * (celsius - 126.9686) ** 2);
}
function tcTemperature(type, mv) {
  let lo = -100, hi = 760;
  if (mv <= tcEmf(type, lo)) return lo;
  if (mv >= tcEmf(type, hi)) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (tcEmf(type, mid) < mv) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
function ptOhms(celsius) {
  const R0 = 100, A = 39083e-7, B = -5775e-10, C = -4183e-15;
  return celsius >= 0 ? R0 * (1 + A * celsius + B * celsius * celsius) : R0 * (1 + A * celsius + B * celsius * celsius + C * (celsius - 100) * celsius ** 3);
}
var AMBIENT_MIN = 5;
var AMBIENT_MAX = 40;
var SET_MAX = 150;
var TX_OUT_MAX = 10;
var defaultSettings = () => ({ ptWires: 3, ambient: 22, tcType: "K", setpoint: 22, txType: "K", txMin: 0, txMax: 100, txConnected: false, txPowered: false, mode: "off", red: null, black: null, inWell: { tc: false, pt: false } });
function normalizeSettings(s) {
  s = { ...s, ptLeadOhms: Math.max(0, Math.min(10, s.ptLeadOhms ?? 0)) };
  if (s.ptWires === 4) return s;
  return { ...s, red: s.red === "pt4" ? null : s.red, black: s.black === "pt4" ? null : s.black };
}
var startTemps = (s) => ({ bath: s.ambient, tc: s.ambient, pt: s.ambient });
var TAU = { bath: 3, tc: 1, pt: 2, out: 5 };
function stepTemps(s, t, dt) {
  const approach = (cur, target, tau) => target + (cur - target) * Math.exp(-dt / tau);
  const bath = approach(t.bath, s.setpoint, TAU.bath);
  return { bath, tc: approach(t.tc, s.inWell.tc ? bath : s.ambient, s.inWell.tc ? TAU.tc : TAU.out), pt: approach(t.pt, s.inWell.pt ? bath : s.ambient, s.inWell.pt ? TAU.pt : TAU.out) };
}
var settledTemps = (s) => ({ bath: s.setpoint, tc: s.inWell.tc ? s.setpoint : s.ambient, pt: s.inWell.pt ? s.setpoint : s.ambient });
var STABLE_BAND = 0.2;
function isStable(s, t, sensor) {
  const probe = sensor === "pt" ? "pt" : "tc";
  return s.inWell[probe] && Math.abs(t.bath - s.setpoint) < STABLE_BAND && Math.abs(t[probe] - t.bath) < STABLE_BAND;
}
function txTemperature(s, t) {
  const measured = tcEmf(s.tcType, t.tc) - tcEmf(s.tcType, s.ambient);
  return tcTemperature(s.txType, measured + tcEmf(s.txType, s.ambient));
}
function txVolts(s, t) {
  if (!s.txPowered || !s.txConnected || s.txMax <= s.txMin) return 0;
  const v = TX_OUT_MAX * (txTemperature(s, t) - s.txMin) / (s.txMax - s.txMin);
  return Math.min(TX_OUT_MAX, Math.max(0, v));
}
function reference(s, sensor, celsius) {
  if (sensor === "pt") return ptOhms(celsius);
  if (sensor === "tc") return tcEmf(s.tcType, celsius) - tcEmf(s.tcType, s.ambient);
  const v = TX_OUT_MAX * (celsius - s.txMin) / (s.txMax - s.txMin);
  return s.txMax <= s.txMin ? 0 : Math.min(TX_OUT_MAX, Math.max(0, v));
}
var reading = (r) => ({ value: null, unit: "", sensor: null, meaningful: false, note: "", ...r });
function readMeter(s, t) {
  if (s.mode === "off") return reading({ state: "off", note: "El mult\xEDmetro est\xE1 apagado. Elige mV, \u03A9 o V." });
  if (!s.red || !s.black) return reading({ state: "open", note: "Conecta las dos puntas a los bornes del sensor." });
  const a = terminalSensor(s.red), b = terminalSensor(s.black);
  if (s.red === s.black) return reading({ state: "ok", value: 0, unit: s.mode === "ohm" ? "\u03A9" : s.mode === "V" ? "V" : "mV", note: "Las dos puntas est\xE1n en el mismo borne: no mides nada." });
  if (a !== b) return reading({ state: "open", note: "Las puntas est\xE1n en sensores distintos: el circuito queda abierto." });
  if (a === "tc") {
    const mv = (tcEmf(s.tcType, t.tc) - tcEmf(s.tcType, s.ambient)) * (s.red === "tc+" ? 1 : -1);
    if (s.mode === "mV") return reading({ state: "ok", value: mv, unit: "mV", sensor: "tc", meaningful: true, note: `Tensi\xF3n de la termocupla ${s.tcType} con la uni\xF3n de referencia a la temperatura ambiente.` });
    if (s.mode === "V") return reading({ state: "ok", value: mv / 1e3, unit: "V", sensor: "tc", note: "Es una se\xF1al de milivoltios: en la escala de voltios casi no se ve. Usa mV." });
    return reading({ state: "ok", value: 0, unit: "\u03A9", sensor: "tc", note: "Una termocupla es casi un conductor: su resistencia no informa la temperatura. Usa mV." });
  }
  if (a === "pt") {
    if (s.mode !== "ohm") return reading({ state: "ok", value: 0, unit: s.mode === "V" ? "V" : "mV", sensor: "pt", note: "El Pt100 no genera tensi\xF3n: es una resistencia. Usa \u03A9." });
    if (ptSide(s.red) === ptSide(s.black)) return reading({ state: "ok", value: 2 * (s.ptLeadOhms ?? 0), unit: "\u03A9", sensor: "pt", note: `Los dos hilos ${ptSide(s.red) === "red" ? "rojos" : "blancos"} van unidos al mismo extremo del elemento: solo mides los dos hilos de cable del mismo lado. Mide entre un hilo rojo y uno blanco.` });
    return reading({ state: "ok", value: ptOhms(t.pt) + 2 * (s.ptLeadOhms ?? 0), unit: "\u03A9", sensor: "pt", meaningful: true, note: `Resistencia del Pt100 entre un hilo rojo y uno blanco (${s.ptWires} hilos). El DMM usa dos puntas: suma los dos hilos del lazo; tener una sonda de 3/4 hilos no compensa autom\xE1ticamente.` });
  }
  if (s.mode === "V") {
    const v = txVolts(s, t) * (s.red === "tx+" ? 1 : -1);
    const note = !s.txPowered ? "El transmisor no est\xE1 alimentado: su salida vale 0 V." : !s.txConnected ? "El transmisor no recibe la termocupla: su salida vale 0 V." : s.txType !== s.tcType ? `El transmisor est\xE1 configurado para tipo ${s.txType} y la termocupla es ${s.tcType}: la lectura es incorrecta.` : "Salida en tensi\xF3n del transmisor.";
    return reading({ state: "ok", value: v, unit: "V", sensor: "tx", meaningful: s.txPowered && s.txConnected, note });
  }
  return reading({ state: "open", note: s.mode === "mV" ? "Sobrerango: la salida del transmisor es de voltios. Usa V." : "No midas resistencia en una salida energizada. Usa V." });
}

// src/lab/temperature/state.ts
var progressKey = (id) => `modo:temperature:progress:${id}:v1`;

// src/learning/temperatureLessons.ts
var POINTS = (ambient) => [ambient, 50, 75, 100];
var hasPoints = (c, sensor) => POINTS(c.settings.ambient).every((t) => c.records.some((r) => r.source === "simulada" && r.sensor === sensor && (sensor !== "pt" || Math.abs((r.ptLeadOhms ?? 0) - (c.settings.ptLeadOhms ?? 0)) < 1e-9) && Math.abs(r.temp - t) <= 0.6));
var SOURCE = "/estudio/instrumentacion/guia-temperatura-g03.docx";
var needPoints = "Registra antes los puntos: temperatura ambiente, 50, 75 y 100 \xB0C.";
var temperatureLessons = [
  {
    id: "temperatura-experiencia-1",
    materialId: "instrumentacion-g03-exp1",
    title: "Temperatura \xB7 Experiencia 1: investigar y explicar",
    experience: 1,
    unit: 2,
    source: SOURCE,
    bench: false,
    intro: "Antes de medir, aclara qu\xE9 es cada sensor, c\xF3mo funciona y qu\xE9 se\xF1al entrega. Estas preguntas siguen los puntos de investigaci\xF3n de la gu\xEDa.",
    concept: "Una termocupla y un Pt100 miden temperatura, pero de formas distintas: la primera genera una tensi\xF3n muy peque\xF1a y el segundo cambia su resistencia. Las dos var\xEDan de forma continua, no a saltos.",
    steps: [
      { title: "Se\xF1ales continuas y discretas", text: "La gu\xEDa pide definir la naturaleza de termocuplas y RTD.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo es la se\xF1al de una termocupla o de un Pt100?", options: ["Discreta: solo existe encendido o apagado", "Continua (anal\xF3gica): cambia de forma gradual con la temperatura", "Digital: ya viene codificada en bits"], answer: 1, explanation: "Ambas var\xEDan de forma continua con la temperatura. Una se\xF1al discreta solo toma estados separados, como un detector de presencia con salida todo o nada.", concept: "senal-continua" } },
      { title: "Principio de la termocupla", text: "Define el principio de funcionamiento de una termocupla.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo funciona una termocupla?", options: ["La resistencia de un metal aumenta con la temperatura", "Dos metales distintos unidos generan una tensi\xF3n peque\xF1a que depende de la diferencia de temperatura (efecto Seebeck)", "Un l\xEDquido se dilata y mueve una aguja"], answer: 1, explanation: "El efecto Seebeck produce milivoltios entre la uni\xF3n caliente y la referencia. Por eso una termocupla necesita conocer la temperatura de su uni\xF3n de referencia.", concept: "seebeck" } },
      { title: "Principio del Pt100", text: "Define el principio de funcionamiento de una RTD (Pt100).", success: "Correcto.", quiz: { question: "\xBFC\xF3mo funciona un Pt100?", options: ["Genera una tensi\xF3n propia al calentarse", "Cambia su temperatura seg\xFAn la corriente que lo atraviesa", "Su resistencia el\xE9ctrica aumenta de forma regular al subir la temperatura"], answer: 2, explanation: "El platino cambia su resistencia con la temperatura. Hay que medir esa resistencia (con una corriente peque\xF1a) para conocer la temperatura.", concept: "pt100-principio" } },
      { title: "Tipo de salida de cada sensor", text: "Define el tipo de salida de la termocupla y del Pt100.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 magnitud entrega cada uno?", options: ["Termocupla: ohmios \xB7 Pt100: milivoltios", "Termocupla: milivoltios \xB7 Pt100: ohmios", "Los dos entregan una corriente de 4\u201320 mA directamente"], answer: 1, explanation: "La termocupla entrega una tensi\xF3n en milivoltios y el Pt100 una resistencia en ohmios. El 4\u201320 mA o 0\u201310 V aparece reci\xE9n en un transmisor.", concept: "salidas" } },
      { title: "Qu\xE9 significa \xAB100\xBB en Pt100", text: "Interpreta el nombre del sensor.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 indica el 100 de Pt100?", options: ["Que mide hasta 100 \xB0C", "Que tiene 100 \u03A9 a 0 \xB0C", "Que entrega 100 mV a 100 \xB0C"], answer: 1, explanation: "Pt es platino y 100 es su resistencia a 0 \xB0C. Por eso a temperatura ambiente se espera algo m\xE1s de 100 \u03A9.", concept: "pt100-valor" } }
    ]
  },
  {
    id: "temperatura-experiencia-2",
    materialId: "instrumentacion-g03-exp2",
    title: "Temperatura \xB7 Experiencia 2: medir y comparar sensores",
    experience: 2,
    unit: 2,
    source: SOURCE,
    bench: true,
    intro: "Mide una termocupla (K o J, a tu elecci\xF3n) y un Pt100 a temperatura ambiente, 50, 75 y 100 \xB0C, y compara sus curvas. Los datos de esta pr\xE1ctica son simulados; en el laboratorio los reemplazas por tus mediciones reales.",
    concept: "La termocupla se mide en milivoltios (funci\xF3n mV) y el Pt100 en ohmios (funci\xF3n \u03A9). El horno de pozo seco necesita unos segundos para estabilizarse: lee solo cuando el banco avise que la sonda lleg\xF3 a la temperatura.",
    review: { concept: "funcion-medida", question: "\xBFPor qu\xE9 el Pt100 se mide en ohmios y la termocupla en milivoltios?", options: ["Porque el Pt100 es una resistencia y la termocupla genera una tensi\xF3n", "Porque el mult\xEDmetro solo mide ohmios en el horno", "Porque son lo mismo con otro nombre"], answer: 0, explanation: "El Pt100 cambia su resistencia con la temperatura; la termocupla genera una tensi\xF3n peque\xF1a por el efecto Seebeck. Medir con la funci\xF3n equivocada no informa la temperatura." },
    steps: [
      { title: "Introduce las dos sondas en el pozo", text: "Arrastra hacia abajo el control de cada sonda para insertarla, o toca \xABinsertar\xBB. Ambas deben quedar dentro del pozo.", success: "Las dos sondas est\xE1n en el pozo.", check: (c) => c.settings.inWell.tc && c.settings.inWell.pt },
      { title: "Mide la termocupla en milivoltios", text: "Elige la funci\xF3n mV en el mult\xEDmetro y conecta la punta roja al hilo + y la negra al hilo \u2212 de la termocupla. Cambia el tipo (K o J) si quieres comparar.", success: "Est\xE1s leyendo la tensi\xF3n de la termocupla con la funci\xF3n correcta.", concept: "funcion-medida", check: (c) => c.reading.state === "ok" && c.reading.sensor === "tc" && c.reading.meaningful },
      { title: "Registra los cuatro puntos de la termocupla", text: "Fija el horno en ambiente, 50, 75 y 100 \xB0C. En cada punto espera la estabilizaci\xF3n, toca su casilla en la libreta G03, lee la pantalla y transcribe el valor en mV. La uni\xF3n de referencia queda a la temperatura ambiente.", success: "Tienes los cuatro puntos de la termocupla.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "tc") },
      { title: "Mide el Pt100 en ohmios", text: "Cambia el mult\xEDmetro a \u03A9 y conecta una punta a un hilo rojo y la otra a un hilo blanco del Pt100.", success: "Est\xE1s midiendo la resistencia del Pt100.", concept: "hilos-pt100", check: (c) => c.reading.state === "ok" && c.reading.sensor === "pt" && c.reading.meaningful },
      { title: "Registra los cuatro puntos del Pt100", text: "Repite ambiente, 50, 75 y 100 \xB0C usando los botones del horno. Lee \u03A9 en el instrumento y transcribe cada lectura en la casilla Pt100 de la libreta. Luego compara con las referencias.", success: "Tienes los cuatro puntos del Pt100.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "pt") },
      {
        title: "Calcula la sensibilidad del Pt100",
        text: "Con tus datos, calcula cu\xE1ntos ohmios cambia el Pt100 por cada grado entre la temperatura ambiente y 100 \xB0C.",
        success: "La sensibilidad coincide con tus datos.",
        concept: "sensibilidad",
        ask: {
          prompt: "Sensibilidad media del Pt100 entre ambiente y 100 \xB0C",
          unit: "\u03A9/\xB0C",
          tolerance: 0.01,
          missing: needPoints,
          expected: (c) => {
            const pts = c.records.filter((r) => r.source === "simulada" && r.sensor === "pt");
            const lo = pts.find((r) => Math.abs(r.temp - c.settings.ambient) <= 0.6), hi = pts.find((r) => Math.abs(r.temp - 100) <= 0.6);
            return lo && hi ? (hi.value - lo.value) / (hi.temp - lo.temp) : null;
          }
        }
      }
    ]
  },
  {
    id: "temperatura-experiencia-3",
    materialId: "instrumentacion-g03-exp3",
    title: "Temperatura \xB7 Experiencia 3: medir mediante transmisor",
    experience: 3,
    unit: 2,
    source: SOURCE,
    bench: true,
    intro: "Conecta la termocupla de la experiencia anterior a un transmisor con salida en tensi\xF3n y construye otra curva: temperatura, salida de la termocupla y salida del transmisor en los mismos cuatro puntos.",
    concept: "Un transmisor convierte los milivoltios de la termocupla en una se\xF1al normalizada, por ejemplo 0\u201310 V. El rango de temperatura que corresponde a esa salida lo configuras t\xFA: la gu\xEDa propone 0\u201310 V como ejemplo y no fija el rango de entrada.",
    review: { concept: "transmisor-tipo", question: "Si el transmisor est\xE1 configurado para una termocupla tipo J y el sensor es tipo K, \xBFqu\xE9 ocurre?", options: ["Nada: ambos tipos son iguales", "La salida es incorrecta, porque interpreta los milivoltios con la tabla equivocada", "El transmisor se apaga solo"], answer: 1, explanation: "Cada tipo de termocupla tiene su propia tabla de milivoltios por grado. Un tipo mal configurado produce una temperatura err\xF3nea aunque todo est\xE9 conectado." },
    steps: [
      { title: "Conecta la termocupla al transmisor y alim\xE9ntalo", text: "Conecta los hilos sobre el transmisor y opera el interruptor de la fuente sobre el banco. Introduce la termocupla en el pozo.", success: "El transmisor recibe la termocupla y est\xE1 alimentado.", concept: "transmisor-conexion", check: (c) => c.settings.txConnected && c.settings.txPowered },
      { title: "Configura el transmisor", text: "Selecciona el mismo tipo de termocupla que usas y define un rango de temperatura para la salida de 0 a 10 V (por ejemplo, de 0 a 100 \xB0C o el que prefieras).", success: "El tipo coincide con la termocupla y el rango es v\xE1lido.", concept: "transmisor-tipo", check: (c) => c.settings.txType === c.settings.tcType && c.settings.txMax - c.settings.txMin >= 50 },
      { title: "Mide la salida del transmisor", text: "Elige la funci\xF3n V del mult\xEDmetro y conecta las puntas a la salida + y \u2212 del transmisor.", success: "Est\xE1s midiendo la tensi\xF3n de salida del transmisor.", concept: "transmisor-conexion", check: (c) => c.reading.state === "ok" && c.reading.sensor === "tx" && c.reading.meaningful },
      { title: "Registra los cuatro puntos de ambos sensores", text: "En ambiente, 50, 75 y 100 \xB0C registra la salida de la termocupla (mV) y la del transmisor (V). Gira el selector y mueve las puntas entre una lectura y otra. Transcribe cada valor en su casilla de la libreta G03.", success: "Tienes la curva de la termocupla y la del transmisor.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "tc") && hasPoints(c, "tx") },
      {
        title: "Predice una salida con tu rango",
        text: "Con el rango que configuraste, calcula qu\xE9 tensi\xF3n deber\xEDa entregar el transmisor a 75 \xB0C y comp\xE1rala con tu registro.",
        success: "Tu c\xE1lculo coincide con el rango configurado.",
        concept: "transmisor-rango",
        ask: {
          prompt: "Tensi\xF3n esperada a 75 \xB0C",
          unit: "V",
          tolerance: 0.05,
          missing: "Configura primero un rango v\xE1lido en el transmisor.",
          expected: (c) => {
            const { txMin, txMax } = c.settings;
            return txMax > txMin ? Math.min(10, Math.max(0, 10 * (75 - txMin) / (txMax - txMin))) : null;
          }
        }
      }
    ]
  }
];
var temperatureLesson = (id) => temperatureLessons.find((l) => l.id === id);
var temperatureLessonByMaterial = (id) => temperatureLessons.find((l) => l.materialId === id);
var tempStudyUrl = (lesson, step = 0) => `/estudio?curso=s2-3&clase=${lesson.materialId}&paso=${step}`;
var tempLabUrl = (lesson) => `/laboratorio?tool=temperature&leccion=${lesson.id}`;
var newTempProgress = () => ({ version: 1, step: 0, completed: [], notes: "", reviewed: false });
function readTempProgress(lesson) {
  const raw = localStorage.getItem(progressKey(lesson.id));
  if (!raw) return newTempProgress();
  const p = JSON.parse(raw);
  if (typeof p !== "object" || p === null || !("version" in p) || p.version !== 1 || !("step" in p) || !Number.isInteger(p.step) || Number(p.step) < 0 || Number(p.step) >= lesson.steps.length || !("completed" in p) || !Array.isArray(p.completed) || p.completed.some((i) => !Number.isInteger(i) || i < 0 || i >= lesson.steps.length) || !("notes" in p) || typeof p.notes !== "string" || p.notes.length > 2e4 || !("reviewed" in p) || typeof p.reviewed !== "boolean") throw new Error("No se pudo leer el avance anterior.");
  return p;
}
export {
  AMBIENT_MAX,
  AMBIENT_MIN,
  SET_MAX,
  STABLE_BAND,
  TAU,
  TERMINALS,
  TX_OUT_MAX,
  defaultSettings,
  isStable,
  newTempProgress,
  normalizeSettings,
  ptOhms,
  ptSide,
  readMeter,
  readTempProgress,
  reference,
  settledTemps,
  startTemps,
  stepTemps,
  tcEmf,
  tcTemperature,
  tempLabUrl,
  tempStudyUrl,
  temperatureLesson,
  temperatureLessonByMaterial,
  temperatureLessons,
  terminalSensor,
  txTemperature,
  txVolts
};
