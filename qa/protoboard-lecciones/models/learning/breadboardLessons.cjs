"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/learning/breadboardLessons.ts
var breadboardLessons_exports = {};
__export(breadboardLessons_exports, {
  breadboardLesson: () => breadboardLesson,
  breadboardLessons: () => breadboardLessons,
  checkBreadboardStep: () => checkBreadboardStep,
  freshLesson: () => freshLesson,
  newBreadboardProgress: () => newBreadboardProgress,
  readBreadboardProgress: () => readBreadboardProgress
});
module.exports = __toCommonJS(breadboardLessons_exports);

// src/lab/model.ts
var uid = (prefix = "id") => `${prefix}-${crypto.randomUUID()}`;
function newProject(kind = "motor") {
  const empty = kind === "blank" || kind === "hbridge" || kind === "hbridge-bjt";
  const devices = [
    { id: "g1", kind: "supply", tag: "G1", x: 85, y: 115, signal: "" },
    { id: "stop", kind: "nc", tag: "S0", x: 260, y: 115, signal: "I0.1" },
    { id: "start", kind: "no", tag: "S1", x: 450, y: 115, signal: "I0.0" },
    { id: "aux", kind: "contact", tag: "K1", x: 450, y: 285, signal: "" },
    { id: "k1", kind: "coil", tag: "K1", x: 660, y: 115, signal: "" },
    { id: "h1", kind: "lamp", tag: "H1", x: 660, y: 285, signal: "" }
  ];
  const ends = (device, pin) => ({ device, pin });
  const wire = (id, a, ap, b, bp) => ({ id, from: ends(a, ap), to: ends(b, bp) });
  const wires = [wire("w1", "g1", 0, "stop", 0), wire("w2", "stop", 1, "start", 0), wire("w3", "start", 1, "k1", 0), wire("w4", "k1", 1, "g1", 1), wire("w5", "stop", 1, "aux", 0), wire("w6", "aux", 1, "k1", 0), wire("w7", "h1", 0, "k1", 0), wire("w8", "h1", 1, "g1", 1)];
  const tags = [
    { address: "I0.0", name: "Marcha", type: "bool", initial: false },
    { address: "I0.1", name: "Paro pulsado", type: "bool", initial: false },
    { address: "I0.2", name: "Nivel bajo", type: "bool", initial: true },
    { address: "I0.3", name: "Nivel alto", type: "bool", initial: false },
    { address: "Q0.0", name: "Bomba / marcha", type: "bool", initial: false },
    { address: "M0.0", name: "Memoria auxiliar", type: "bool", initial: false },
    { address: "T1", name: "Temporizador", type: "bool", initial: false },
    { address: "C1", name: "Contador", type: "bool", initial: false },
    { address: "AI0", name: "Nivel del tanque (%)", type: "number", initial: 20 }
  ];
  const rungs = kind === "tank" ? [
    { id: "low", comment: "Nivel bajo: memorizar marcha de la bomba", branches: [[{ address: "I0.2", negated: false }]], output: "Q0.0", mode: "set", preset: 1 },
    { id: "high", comment: "Nivel alto o paro: detener bomba", branches: [[{ address: "I0.3", negated: false }], [{ address: "I0.1", negated: false }]], output: "Q0.0", mode: "reset", preset: 1 }
  ] : [{ id: "r1", comment: "Marcha con retenci\xF3n y prioridad de paro", branches: [[{ address: "I0.0", negated: false }, { address: "I0.1", negated: true }], [{ address: "Q0.0", negated: false }, { address: "I0.1", negated: true }]], output: "Q0.0", mode: "coil", preset: 1 }];
  return {
    format: "panellab-laboratory",
    version: 2,
    id: uid("project"),
    name: kind === "hbridge" ? "Puente H con L293D" : kind === "hbridge-bjt" ? "Puente H con transistores" : kind === "blank" ? "Proyecto nuevo" : kind === "tank" ? "Llenado autom\xE1tico" : "Marcha y retenci\xF3n",
    schematic: empty ? { devices: [], wires: [] } : { devices, wires },
    plc: { language: "ladder", tags, rungs: empty ? [] : rungs, source: "IF I0.1 THEN\n  Q0.0 := FALSE;\nELSE\n  Q0.0 := I0.0 OR Q0.0;\nEND_IF;" },
    hmi: { widgets: empty ? [] : [
      { id: "hm1", kind: "toggle", label: "Marcha", address: "I0.0", x: 45, y: 65, max: 100 },
      { id: "hm2", kind: "toggle", label: "Paro", address: "I0.1", x: 250, y: 65, max: 100 },
      { id: "hm3", kind: "lamp", label: "Bomba en marcha", address: "Q0.0", x: 455, y: 65, max: 100 },
      { id: "hm4", kind: "bar", label: "Nivel del tanque", address: "AI0", x: 45, y: 260, max: 100 },
      { id: "hm5", kind: "number", label: "Nivel (%)", address: "AI0", x: 455, y: 260, max: 100 }
    ] },
    process: { capacity: 100, initialLevel: 20, inflow: 6, outflow: 1, low: 20, high: 80, pumpSignal: "Q0.0", lowSignal: "I0.2", highSignal: "I0.3", levelSignal: "AI0" },
    breadboard: kind === "hbridge-bjt" ? { voltage: 12, positive: "top+:1", negative: "bottom-:1", components: [
      ...[["bj-q2", "c:9", "c:11"], ["bj-q1", "c:14", "c:16"], ["bj-q3", "h:9", "h:11"], ["bj-q4", "h:14", "h:16"]].map(([id, from, to]) => ({ id, kind: "bjt", from, to, value: 100, closed: true, color: "#1f2327" })),
      ...[["bj-r1", "b:4", "b:7"], ["bj-r2", "g:4", "g:7"], ["bj-r3", "b:15", "b:19"], ["bj-r4", "g:15", "g:19"]].map(([id, from, to]) => ({ id, kind: "resistor", from, to, value: 1e3, closed: true, color: "#0f766e" })),
      { id: "bj-s1", kind: "button", from: "a:1", to: "d:4", value: 0, closed: false, color: "#d94848" },
      { id: "bj-s2", kind: "button", from: "f:1", to: "i:4", value: 0, closed: false, color: "#d94848" },
      { id: "bj-m", kind: "motor", from: "c:23", to: "c:27", value: 40, closed: true, color: "#4b5563" },
      ...[
        ["bj-p1", "top+:11", "a:11"],
        ["bj-p2", "top+:17", "a:16"],
        ["bj-supply1", "top+:2", "e:1"],
        ["bj-supply2", "top+:3", "j:1"],
        ["bj-positive-rail", "top+:15", "top+:16"],
        ["bj-g1", "bottom-:9", "j:9"],
        ["bj-g2", "bottom-:14", "j:14"],
        ["bj-negative-rail", "bottom-:15", "bottom-:16"],
        ["bj-ma", "a:9", "f:11"],
        ["bj-ma-motor", "g:11", "a:23"],
        ["bj-mb", "a:14", "f:16"],
        ["bj-mb-motor", "g:16", "a:27"],
        ["bj-input1a", "a:7", "a:10"],
        ["bj-input1b", "e:4", "j:19"],
        ["bj-input2a", "j:4", "a:19"],
        ["bj-input2b", "j:7", "j:10"]
      ].map(([id, from, to]) => ({ id, kind: "wire", from, to, value: 0, closed: true, color: "#0f766e" }))
    ] } : kind === "hbridge" ? { voltage: 5, positive: "top+:1", negative: "bottom-:1", components: [
      { id: "hb-ic", kind: "l293d", from: "f:10", to: "e:17", value: 0, closed: true, color: "#2b3035" },
      { id: "hb-s1", kind: "button", from: "e:2", to: "f:5", value: 0, closed: false, color: "#d94848" },
      { id: "hb-s2", kind: "button", from: "e:24", to: "f:27", value: 0, closed: false, color: "#d94848" },
      { id: "hb-m", kind: "motor", from: "h:12", to: "h:15", value: 40, closed: true, color: "#4b5563" },
      { id: "hb-pull1", kind: "resistor", from: "i:11", to: "i:7", value: 1e4, closed: true, color: "#0f766e" },
      { id: "hb-pull2", kind: "resistor", from: "i:16", to: "i:20", value: 1e4, closed: true, color: "#0f766e" },
      ...[["hb-vss", "top+:10", "a:10"], ["hb-vs", "top+:14", "j:17"], ["hb-en", "top+:12", "j:10"], ["hb-sp1", "top+:2", "a:2"], ["hb-sp2", "top+:24", "a:24"], ["hb-rail", "top+:15", "top+:16"]].map(([id, from, to]) => ({ id, kind: "wire", from, to, value: 0, closed: true, color: "#c53943" })),
      ...[["hb-g1", "bottom-:13", "i:13"], ["hb-g2", "bottom-:14", "i:14"], ["hb-g3", "top-:13", "a:13"], ["hb-g4", "top-:14", "a:14"], ["hb-grail", "top-:1", "bottom-:2"], ["hb-grail2", "bottom-:15", "bottom-:16"], ["hb-gpull1", "bottom-:7", "j:7"], ["hb-gpull2", "bottom-:20", "j:20"]].map(([id, from, to]) => ({ id, kind: "wire", from, to, value: 0, closed: true, color: "#343b42" })),
      ...[["hb-in1", "j:5", "h:11"], ["hb-in2", "j:27", "h:16"]].map(([id, from, to]) => ({ id, kind: "wire", from, to, value: 0, closed: true, color: "#2978c8" }))
    ] } : { voltage: 5, positive: "top+:1", negative: "top-:1", components: empty ? [] : [
      { id: "pr1", kind: "wire", from: "top+:1", to: "a:5", value: 0, closed: true, color: "#0f766e" },
      { id: "pr2", kind: "resistor", from: "b:5", to: "b:10", value: 1e3, closed: true, color: "#0f766e" },
      { id: "pr3", kind: "led", from: "c:10", to: "f:10", value: 1.9, closed: true, color: "#d94848" },
      { id: "pr4", kind: "wire", from: "g:10", to: "top-:5", value: 0, closed: true, color: "#334155" }
    ] }
  };
}
var HOLES = [];
for (let col = 1; col <= 30; col++) {
  const x = 55 + (col - 1) * 24;
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 386], ["bottom-", 410]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
  for (const [i, row] of [..."abcdefghij"].entries()) HOLES.push({ id: `${row}:${col}`, x, y: 135 + i * 20 + (i >= 5 ? 35 : 0), group: `${i < 5 ? "upper" : "lower"}:${col}` });
}
var HOLE_BY_ID = new Map(HOLES.map((h) => [h.id, h]));
var Nets = class {
  parent = /* @__PURE__ */ new Map();
  find(x) {
    const p = this.parent.get(x);
    if (p === void 0) {
      this.parent.set(x, x);
      return x;
    }
    if (p === x) return x;
    const root = this.find(p);
    this.parent.set(x, root);
    return root;
  }
  join(a, b) {
    this.parent.set(this.find(a), this.find(b));
  }
};
function buttonPins(from, to) {
  const a = /^([a-j]):(\d+)$/.exec(from), b = /^([a-j]):(\d+)$/.exec(to);
  if (!a || !b || Math.abs(+a[2] - +b[2]) !== 3 || !HOLE_BY_ID.has(from) || !HOLE_BY_ID.has(to)) return null;
  const ar = "abcdefghij".indexOf(a[1]), br = "abcdefghij".indexOf(b[1]), across = a[1] === "e" && b[1] === "f" || a[1] === "f" && b[1] === "e", sameHalf = Math.floor(ar / 5) === Math.floor(br / 5) && Math.abs(ar - br) === 3;
  if (!across && !sameHalf) return null;
  return [from, `${b[1]}:${a[2]}`, `${a[1]}:${b[2]}`, to];
}
function joinBoardParts(nets, components, switches) {
  for (const c of components) {
    const pins = c.kind === "button" ? buttonPins(c.from, c.to) : null;
    if (pins) {
      nets.join(pins[0], pins[1]);
      nets.join(pins[2], pins[3]);
    }
    if (c.kind === "wire" || (c.kind === "switch" || c.kind === "button") && (switches[c.id] ?? (c.kind === "button" ? false : c.closed))) nets.join(c.from, c.to);
  }
}

// src/lab/dc.ts
function netGroups(board, switches = {}) {
  const nets = new Nets();
  for (const hole of HOLES) nets.join(hole.id, hole.group);
  joinBoardParts(nets, board.components, switches);
  return Object.fromEntries(HOLES.map((h) => [h.id, nets.find(h.id)]));
}

// src/learning/breadboardLessons.ts
var verdict = (ok, message) => ({ ok, message });
var intrinsic = (a, b) => !!HOLE_BY_ID.get(a) && HOLE_BY_ID.get(a)?.group === HOLE_BY_ID.get(b)?.group;
var pair = (a, b, x, y) => intrinsic(a, x) && intrinsic(b, y) || intrinsic(a, y) && intrinsic(b, x);
var part = (id, kind, from, to, value) => ({ id, kind, from, to, value, closed: true, color: "#2a7169" });
var base = (components, voltage = 5, realistic = false) => ({ components, voltage, positive: "top+:1", negative: "top-:1", realistic });
var supply = () => [part("wp", "wire", "c:5", "top+:2", 0), part("wn", "wire", "c:15", "top-:2", 0)];
var divider = () => base([part("r1", "resistor", "a:5", "a:10", 1e3), part("r2", "resistor", "b:10", "b:15", 1e3), ...supply()]);
var junction = (led) => base([part("r", "resistor", "a:5", "a:10", led ? 220 : 330), part("d", led ? "led" : "diode", "b:10", "b:15", led ? 2 : 0.7), ...supply()], 0.5, true);
var bjt = () => base([part("q", "bjt", "e:5", "e:7", 100), part("rb", "resistor", "a:6", "a:10", 1e5), part("rc", "resistor", "a:7", "a:12", 270), part("we", "wire", "a:5", "top-:2", 0), part("wb", "wire", "a:10", "top+:2", 0), part("wc", "wire", "a:12", "top+:3", 0)], 10, true);
var bridge = () => {
  const b = newProject("hbridge").breadboard;
  return { ...b, voltage: 5, components: b.components.map((p) => p.kind === "button" ? { ...p, kind: "switch" } : p) };
};
var series = () => base([part("r", "resistor", "a:10", "a:15", 100), ...supply()]);
function prepared(c, kinds, reference) {
  const groups = netGroups(c.board, {}), referenceGroups = netGroups(reference, {}), ends = [...new Set(reference.components.flatMap((p) => [p.from, p.to]).concat(reference.positive, reference.negative))], topology = ends.every((a) => ends.every((b) => groups[a] === groups[b] === (referenceGroups[a] === referenceGroups[b]))) && groups[c.board.positive] === groups[reference.positive] && groups[c.board.negative] === groups[reference.negative], matches = reference.components.every((p) => p.kind === "wire" ? groups[p.from] === groups[p.to] : c.board.components.some((q) => q.kind === p.kind && Math.abs(q.value - p.value) < 1e-8 && pair(q.from, q.to, p.from, p.to)));
  return verdict(!c.running && topology && matches && Math.abs(c.board.voltage - reference.voltage) < 1e-3 && kinds.every((k) => c.board.components.some((p) => p.kind === k)), "Det\xE9n la simulaci\xF3n y monta los componentes indicados. Puedes construirlos a mano o cargar la referencia.");
}
function measure(c, kind, a, b, open = false) {
  if (!c.meterReady) return verdict(false, "Desactiva HOLD, REL y MIN/MAX para comprobar una lectura directa.");
  if (!c.probes[0] || !c.probes[1] || !pair(c.probes[0], c.probes[1], a, b)) return verdict(false, `Lleva las puntas a ${a.replace(":", "")} y ${b.replace(":", "")}, o a orificios de sus mismas tiras.`);
  if (c.reading?.kind !== kind) return verdict(false, kind === "continuity" ? "Con la fuente detenida, gira a continuidad y usa COM y V \u03A9." : kind === "current" ? "Abre la rama, conecta la toma roja a A, gira a A y energiza." : "Conecta la toma roja a V \u03A9, gira a V y energiza.");
  if (kind === "continuity") return verdict(!c.running && (open ? c.reading.value === null : c.reading.value !== null && c.reading.value < 50), open ? "Debe indicar OL: las tiras est\xE1n separadas. Revisa si hay un puente que las una." : "Debe haber continuidad. Revisa las columnas y el puente, sin alimentaci\xF3n.");
  if (!c.running || c.result?.fault || c.result?.tripped || Object.keys(c.result?.failures ?? {}).length) return verdict(false, "El circuito debe estar energizado, sin fallas ni componentes da\xF1ados.");
  if (kind === "current" && c.redJack !== "a10") return verdict(false, "Mueve la toma roja a A para insertar el shunt en la rama.");
  if (kind === "voltage" && c.redJack !== "vo") return verdict(false, "Devuelve la toma roja a V \u03A9 antes de medir tensi\xF3n.");
  if (c.reading.value === null) return verdict(false, "Necesitas una lectura num\xE9rica v\xE1lida.");
  const logged = c.board.log?.some((m) => Date.parse(m.at) >= c.startedAt && m.kind === kind && pair(m.a, m.b, a, b) && m.sourceVoltage !== void 0 && Math.abs(m.sourceVoltage - c.board.voltage) < 1e-3 && m.value !== null && Math.abs(m.value - c.reading.value) < Math.max(1e-4, Math.abs(c.reading.value) * 2e-3));
  return verdict(!!logged, "Lee el instrumento y pulsa \xABAnotar lectura\xBB. Necesitas una medici\xF3n nueva de esta lecci\xF3n, a la tensi\xF3n actual.");
}
var measured = (c, a, b) => c.board.log?.filter((m) => m.kind === "voltage" && Date.parse(m.at) >= c.startedAt && pair(m.a, m.b, a, b) && m.sourceVoltage !== void 0 && Math.abs(m.sourceVoltage - c.board.voltage) < 1e-3 && m.value !== null).at(-1)?.value ?? null;
var voltageStep = (id, title, a, b, explain, voltage = 5) => ({ id, title, explain, action: `Gira a V, conecta las puntas en ${a.replace(":", "")} y ${b.replace(":", "")}, lee y anota.`, targets: [a, b], check: (c) => Math.abs(c.board.voltage - voltage) > 1e-3 ? verdict(false, `Det\xE9n la simulaci\xF3n y ajusta la fuente a ${voltage} V para este paso.`) : measure(c, "voltage", a, b) });
var currentAsk = (resistance) => ({ id: "calculate", title: "Calcula con tus mediciones", explain: "La corriente de una resistencia se obtiene de su ca\xEDda de tensi\xF3n y su resistencia. Aqu\xED usamos R nominal; con tolerancia, el c\xE1lculo es una estimaci\xF3n.", action: "Usa la \xFAltima ca\xEDda anotada entre a5 y a10. Calcula I = VR / R y convierte A a mA.", ask: { label: "Corriente estimada con R nominal", unit: "mA", tolerance: 0.1, expected: (c) => {
  const v = measured(c, "a:5", "a:10");
  return v === null ? null : Math.abs(v) / resistance * 1e3;
} } });
var breadboardLessons = [
  { id: "fundamentals", title: "1 \xB7 Conoce la protoboard", subtitle: "Tiras, canal, rieles y puentes", sourceLabel: "Fundamentos del banco", template: () => base([]), steps: [
    { id: "column", title: "Cinco orificios, un nodo", explain: "a\u2013e de cada columna comparten una l\xE1mina. Dos agujeros vecinos en la misma fila no est\xE1n unidos por defecto.", action: "Sin alimentaci\xF3n, gira a continuidad. Lleva una punta a a5 y otra a e5.", targets: ["a:5", "e:5"], check: (c) => measure(c, "continuity", "a:5", "e:5") },
    { id: "channel", title: "El canal central separa", explain: "La columna superior a\u2013e est\xE1 separada de f\u2013j. Un DIP cruza el canal para que sus patas enfrentadas no queden en el mismo nodo.", action: "Mueve una punta de e5 a f5. La otra queda en a5; debe marcar OL.", targets: ["a:5", "f:5"], check: (c) => measure(c, "continuity", "a:5", "f:5", true) },
    { id: "rails", title: "Comprueba el corte del riel", explain: "En esta placa el riel se interrumpe entre 15 y 16. En una placa f\xEDsica compru\xE9balo; la l\xEDnea pintada no garantiza continuidad.", action: "Mide continuidad entre + superior 15 y + superior 16. Debe indicar OL.", targets: ["top+:15", "top+:16"], check: (c) => measure(c, "continuity", "top+:15", "top+:16", true) },
    { id: "bridge", title: "Une las dos mitades", explain: "Un puente crea un camino el\xE9ctrico entre las tiras. Usa un orificio libre para cada extremo.", action: "Con Puente (W), une + superior 14 con + superior 17. Vuelve a medir entre 15 y 16.", targets: ["top+:15", "top+:16"], check: (c) => measure(c, "continuity", "top+:15", "top+:16") },
    { id: "understand", title: "Explica la conexi\xF3n", explain: "Un nodo re\xFAne puntos conectados por metal y cables ideales. Su forma en pantalla no define la conexi\xF3n.", action: "Responde despu\xE9s de comprobar la placa.", quiz: { question: "\xBFQu\xE9 comparten a5 y e5?", options: ["El mismo nodo el\xE9ctrico", "Solo el n\xFAmero, sin conexi\xF3n", "Todas las columnas de la placa"], answer: 0, why: "La tira met\xE1lica une los cinco orificios de esa columna." } }
  ] },
  { id: "divider", title: "2 \xB7 Tensi\xF3n y ley de Ohm", subtitle: "Dos resistencias y tus primeras lecturas", sourceLabel: "Preparaci\xF3n para F03", template: divider, steps: [
    { id: "prepare", title: "Monta un divisor", explain: "Dos resistencias de 1 k\u03A9 en serie reparten 5 V. La referencia empieza sin tolerancias para comparar con el c\xE1lculo ideal.", action: "Det\xE9n la simulaci\xF3n. Coloca R1 entre a5\u2013a10 y R2 entre b10\u2013b15. Une c5 a + y c15 a \u2212; fija 5 V.", check: (c) => prepared(c, ["resistor"], divider()) },
    voltageStep("upper", "Mide la ca\xEDda de R1", "a:5", "a:10", "V se mide en paralelo. La punta negra no tiene que estar siempre en el negativo de la fuente: mide la diferencia entre las puntas."),
    voltageStep("lower", "Mide la ca\xEDda de R2", "a:10", "a:15", "Cambia las puntas sobre el banco. Al invertirlas, cambia el signo de la lectura."),
    currentAsk(1e3),
    { id: "sum", title: "Comprueba el recorrido de tensi\xF3n", explain: "La suma de las dos ca\xEDdas debe aproximarse a la tensi\xF3n aplicada. La entrada del volt\xEDmetro carga ligeramente el circuito.", action: "Suma los valores absolutos de tus dos ca\xEDdas.", ask: { label: "Suma de ca\xEDdas medidas", unit: "V", tolerance: 0.03, expected: (c) => {
      const a = measured(c, "a:5", "a:10"), b = measured(c, "a:10", "a:15");
      return a === null || b === null ? null : Math.abs(a) + Math.abs(b);
    } } }
  ] },
  { id: "diode", title: "3 \xB7 Diodo y resistencia", subtitle: "Montar, medir VD/VR y calcular I", source: "/estudio/fuentes/F03.pdf#page=15", sourceLabel: "F03 \xB7 Clase 2 \xB7 p.15", template: () => junction(false), steps: [
    { id: "prepare", title: "Prepara el montaje sin energ\xEDa", explain: "La gu\xEDa utiliza 330 \u03A9 y 1N4001. Este banco usa una uni\xF3n de silicio gen\xE9rica, con la banda en el c\xE1todo. No es un modelo de fabricante.", action: "Monta R entre a5\u2013a10 y diodo entre b10\u2013b15. Une c5 al + y c15 al \u2212. Empieza en 0,5 V.", check: (c) => prepared(c, ["resistor", "diode"], junction(false)) },
    voltageStep("vd", "Mide la tensi\xF3n del diodo", "b:10", "b:15", "Con la fuente detenida fija 5 V; luego energiza. La ca\xEDda del diodo depende de su corriente en Valores reales."),
    voltageStep("vr", "Mide la ca\xEDda de la resistencia", "a:5", "a:10", "El resto de la tensi\xF3n cae en la resistencia que limita corriente. Anota la lectura con su fuente aplicada."),
    currentAsk(330),
    { id: "safe", title: "Interpreta el barrido de la gu\xEDa", explain: "F03 propone fuentes de 0,5 a 30 V. Tambi\xE9n hay que observar corriente, potencia y da\xF1o; no todas las condiciones sirven para cualquier componente.", action: "Comprueba tu criterio antes de repetir la tabla.", quiz: { question: "Si subes la fuente, \xBFla ca\xEDda del diodo es siempre exactamente 0,7 V?", options: ["S\xED, es un valor invariable", "No: cambia con corriente, temperatura y dispositivo", "La resistencia deja de limitar corriente"], answer: 1, why: "0,7 V es una aproximaci\xF3n. La curva de una uni\xF3n de silicio es no lineal." } }
  ] },
  { id: "led", title: "4 \xB7 LED y polaridad", subtitle: "Resistencia de 220 \u03A9 y ca\xEDda directa", source: "/estudio/fuentes/F03.pdf#page=15", sourceLabel: "F03 \xB7 Clase 2 \xB7 p.15", template: () => junction(true), steps: [
    { id: "prepare", title: "Reconoce \xE1nodo y c\xE1todo", explain: "El primer extremo del LED es el \xE1nodo. Usa la resistencia de 220 \u03A9 en serie; nunca conectes directamente el LED a la fuente.", action: "Det\xE9n la simulaci\xF3n y monta el LED entre b10\u2013b15 con la resistencia entre a5\u2013a10.", check: (c) => prepared(c, ["resistor", "led"], junction(true)) },
    voltageStep("vd", "Mide el LED encendido", "b:10", "b:15", "Det\xE9n, fija 3 V y vuelve a energizar. Si no conduce, revisa polaridad y camino cerrado.", 3),
    voltageStep("vr", "Mide la limitaci\xF3n de corriente", "a:5", "a:10", "Mide la tensi\xF3n sobre la resistencia; no uses la ca\xEDda del LED para calcular la corriente en R.", 3),
    currentAsk(220),
    { id: "safe", title: "Elige c\xF3mo comprobar resistencia", explain: "El \xF3hmetro inyecta su propia se\xF1al; necesita el circuito sin alimentaci\xF3n. Una rama paralela puede cambiar lo que mide.", action: "Responde antes de cambiar el selector.", quiz: { question: "Para medir la resistencia sin alterar el resultado por otras ramas, debes\u2026", options: ["Dejar la fuente encendida", "Desenergizar y, si hay caminos paralelos, aislar la resistencia", "Usar la toma A con el circuito encendido"], answer: 1, why: "Una medici\xF3n en \u03A9 requiere ausencia de tensi\xF3n externa y revisar caminos paralelos." } }
  ] },
  { id: "current", title: "5 \xB7 Corriente en serie", subtitle: "Abrir la rama y cambiar la toma roja", sourceLabel: "Uso pr\xE1ctico del mult\xEDmetro", template: series, steps: [
    { id: "prepare", title: "Abre la rama", explain: "El amper\xEDmetro se convierte en parte del camino de corriente. La referencia deja abierta la uni\xF3n entre a5 y a10.", action: "Det\xE9n la simulaci\xF3n. Prepara 5 V y R=100 \u03A9 entre a10\u2013a15; la fuente llega a a5 y sale por a15.", check: (c) => prepared(c, ["resistor"], series()) },
    { id: "series", title: "Inserta el instrumento", explain: "La toma A agrega el shunt de 0,1 \u03A9 del ejercicio. En paralelo producir\xEDa una carga muy baja y podr\xEDa fundir el fusible.", action: "Con la fuente detenida, mueve la toma roja a A y gira a A. Pon las puntas en a5\u2013a10, energiza y anota la corriente.", targets: ["a:5", "a:10"], check: (c) => measure(c, "current", "a:5", "a:10") },
    { id: "read", title: "Lee y convierte unidades", explain: "Una lectura de 0,05 A equivale a 50 mA. Usa el valor real que obtuviste; el shunt tambi\xE9n produce ca\xEDda.", action: "Convierte a mA tu \xFAltima corriente anotada en a5\u2013a10.", ask: { label: "Corriente medida", unit: "mA", tolerance: 0.1, expected: (c) => {
      const m = c.board.log?.filter((m2) => m2.kind === "current" && Date.parse(m2.at) >= c.startedAt && pair(m2.a, m2.b, "a:5", "a:10") && m2.value !== null).at(-1);
      return m?.value === null || m?.value === void 0 ? null : Math.abs(m.value) * 1e3;
    } } },
    { id: "finish", title: "Devuelve el instrumento a V \u03A9", explain: "Terminar en la toma de corriente favorece un cortocircuito en la siguiente medici\xF3n de tensi\xF3n.", action: "Det\xE9n la simulaci\xF3n, mueve la toma roja a V \u03A9 y deja el selector en V.", check: (c) => verdict(!c.running && c.redJack === "vo" && c.dial === "V", "Det\xE9n, devuelve la toma roja a V \u03A9 y gira a V.") }
  ] },
  { id: "bjt", title: "6 \xB7 Transistor en emisor com\xFAn", subtitle: "VBE, VCE y ca\xEDdas en base/colector", source: "/estudio/fuentes/F04.pdf#page=22", sourceLabel: "F04 \xB7 Clase 3 \xB7 p.22", template: bjt, steps: [
    { id: "prepare", title: "Distingue E, B y C", explain: "F04 utiliza BC337, 10 V, RB=100 k\u03A9 y RC=270 \u03A9. La representaci\xF3n es NPN gen\xE9rica; E/B/C son e5/e6/e7 en este montaje.", action: "Det\xE9n y monta la referencia. No supongas que el encapsulado f\xEDsico tiene el mismo pinout.", check: (c) => prepared(c, ["bjt", "resistor"], bjt()) },
    voltageStep("vbe", "Mide base respecto de emisor", "e:6", "e:5", "Energiza a 10 V. VBE es la diferencia entre base y emisor; no es la tensi\xF3n total de alimentaci\xF3n.", 10),
    voltageStep("vce", "Mide colector respecto de emisor", "e:7", "e:5", "La tensi\xF3n VCE ayuda a interpretar el estado del transistor junto a sus corrientes.", 10),
    voltageStep("vrb", "Mide la ca\xEDda de RB", "a:10", "a:6", "La corriente de base estimada es VRB / 100 k\u03A9.", 10),
    voltageStep("vrc", "Mide la ca\xEDda de RC", "a:12", "a:7", "La corriente de colector estimada es VRC / 270 \u03A9. No uses VCE en esa divisi\xF3n.", 10),
    { id: "calculate", title: "Calcula la corriente de colector", explain: "Utiliza la ca\xEDda de la resistencia de colector que acabas de medir y su valor nominal.", action: "Calcula IC estimada = VRC / 270 \u03A9. Expresa el resultado en mA.", ask: { label: "IC estimada", unit: "mA", tolerance: 0.1, expected: (c) => {
      const v = measured(c, "a:12", "a:7");
      return v === null ? null : Math.abs(v) / 270 * 1e3;
    } } }
  ] },
  { id: "bridge", title: "7 \xB7 Puente H con L293D", subtitle: "Alimentaciones, mando y salida al motor", source: "/estudio/fuentes/F05.pdf#page=13", sourceLabel: "F05 \xB7 Clase 4 \xB7 pp.13\u201314", template: bridge, steps: [
    { id: "prepare", title: "Reconoce las dos alimentaciones", explain: "VCC1 alimenta la l\xF3gica y VCC2 el motor. Esta preparaci\xF3n usa 5 V para ambos y mandos mantenidos para poder medir. El montaje docente de motor a 12 V requiere alimentaci\xF3n l\xF3gica independiente: no lleves 12 V a VCC1. El puente de cuatro transistores es otro ejemplo.", action: "Det\xE9n y fija 5 V. Revisa los pines con los diagramas de clase; el L293D cruza el canal.", check: (c) => prepared(c, ["l293d", "motor"], bridge()) },
    { id: "operate", title: "Opera el mando sobre el banco", explain: "No basta con elegir un estado en un men\xFA: opera los interruptores/pulsadores del circuito para cerrar el recorrido.", action: "Energiza y cierra el mando S2; el motor debe tener corriente. Comprueba este paso mientras est\xE1 accionado.", check: (c) => {
      const motor = c.board.components.find((p) => p.kind === "motor");
      return verdict(!!motor && c.running && !c.result?.fault && !c.result?.tripped && !Object.keys(c.result?.failures ?? {}).length && Math.abs(c.result?.amps[motor.id] ?? 0) > 1e-3, "Revisa alimentaci\xF3n, EN, entradas y mando; el motor debe tener corriente sin fallas.");
    } },
    { id: "measure", title: "Mide entre los terminales del motor", explain: "La polaridad entre terminales determina el sentido. No confundas la tensi\xF3n de la fuente con la ca\xEDda real de la etapa de salida.", action: "Coloca las puntas en los extremos del motor, gira a V y anota con el mando accionado.", check: (c) => {
      const motor = c.board.components.find((p) => p.kind === "motor");
      if (!motor) return verdict(false, "Monta el motor antes de medir.");
      if (Math.abs(c.result?.amps[motor.id] ?? 0) < 1e-3) return verdict(false, "Acciona el mando para medir con el motor activo.");
      return measure(c, "voltage", motor.from, motor.to);
    } },
    { id: "stop", title: "Det\xE9n antes de recablear", explain: "Las mediciones hechas durante el mando se conservan en la libreta. Para cambiar conexiones, det\xE9n la fuente.", action: "Det\xE9n la simulaci\xF3n y devuelve la toma roja a V \u03A9.", check: (c) => verdict(!c.running && c.redJack === "vo", "Det\xE9n la simulaci\xF3n y comprueba la toma V \u03A9.") }
  ] }
];
var breadboardLesson = (id) => breadboardLessons.find((l) => l.id === id) || null;
function checkBreadboardStep(step, c, input, choice) {
  if (step.quiz) return verdict(choice === step.quiz.answer, step.quiz.why);
  if (step.ask) {
    const expected = step.ask.expected(c);
    if (expected === null) return verdict(false, "Primero realiza y anota las mediciones de esta lecci\xF3n.");
    const number = input.trim().replace(",", ".");
    if (!number || !Number.isFinite(Number(number))) return verdict(false, `Escribe un n\xFAmero en ${step.ask.unit}; puedes usar coma decimal.`);
    return verdict(Math.abs(Number(number) - expected) <= step.ask.tolerance, `Revisa el c\xE1lculo y la conversi\xF3n a ${step.ask.unit}. Usa tus lecturas, con su tensi\xF3n aplicada.`);
  }
  return step.check?.(c) ?? verdict(false, "Realiza la acci\xF3n indicada.");
}
var newBreadboardProgress = () => ({ version: 1, lessons: {} });
var freshLesson = () => ({ step: 0, startedAt: Date.now(), completed: [], notes: "" });
function readBreadboardProgress(raw) {
  if (!raw) return newBreadboardProgress();
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !data.lessons || typeof data.lessons !== "object" || Array.isArray(data.lessons)) throw Error("Progreso incompatible");
  for (const [id, row] of Object.entries(data.lessons)) {
    const l = breadboardLesson(id), p = row;
    if (!l || !p || !Number.isInteger(p.step) || p.step < 0 || p.step >= l.steps.length || typeof p.startedAt !== "number" || !Number.isFinite(p.startedAt) || p.startedAt < 0 || !Array.isArray(p.completed) || p.completed.some((s) => !l.steps.some((step) => step.id === s)) || new Set(p.completed).size !== p.completed.length || typeof p.notes !== "string" || p.notes.length > 4e3) throw Error("Progreso incompatible");
  }
  return data;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  breadboardLesson,
  breadboardLessons,
  checkBreadboardStep,
  freshLesson,
  newBreadboardProgress,
  readBreadboardProgress
});
