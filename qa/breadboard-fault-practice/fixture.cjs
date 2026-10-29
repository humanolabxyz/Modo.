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

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  DEFAULT_BOARD_POWER: () => DEFAULT_BOARD_POWER,
  DEVICES: () => DEVICES,
  HOLES: () => HOLES,
  HOLE_BY_ID: () => HOLE_BY_ID,
  IC_PIN_NAMES: () => IC_PIN_NAMES,
  Nets: () => Nets,
  TOOLS: () => TOOLS,
  TOOL_GROUPS: () => TOOL_GROUPS,
  addressOK: () => addressOK,
  bjtBase: () => bjtBase,
  boardPowered: () => boardPowered,
  buttonPins: () => buttonPins,
  componentHoles: () => componentHoles,
  crowdedHoles: () => crowdedHoles,
  deviceClosed: () => deviceClosed,
  devicePinLabel: () => devicePinLabel,
  devicePinOffset: () => devicePinOffset,
  icPinHoles: () => icPinHoles,
  icTo: () => icTo,
  initialControlClosed: () => initialControlClosed,
  initialMemory: () => initialMemory,
  isMaintainedControl: () => isMaintainedControl,
  joinBoardParts: () => joinBoardParts,
  newProject: () => newProject,
  parseHoleId: () => parseHoleId,
  pinKey: () => pinKey,
  relocate: () => relocate,
  uid: () => uid,
  verticalDevice: () => verticalDevice
});
module.exports = __toCommonJS(stdin_exports);

// src/lab/model.ts
var TOOLS = [
  { id: "schematic", name: "Esquemas", description: "Dibuja y prueba circuitos de mando." },
  { id: "equipment", name: "Tableros de control", description: "Distribuye equipos en el gabinete, cablea y programa PLC o rel\xE9s l\xF3gicos." },
  { id: "plc", name: "PLC", description: "Programa contactos, bobinas y temporizadores." },
  { id: "hmi", name: "HMI", description: "Crea una pantalla para operar tus se\xF1ales." },
  { id: "process", name: "Procesos", description: "Controla el llenado de un tanque." },
  { id: "breadboard", name: "Protoboard", description: "Monta un circuito y mide tensi\xF3n y corriente." },
  { id: "soldering", name: "Soldadura", description: "Prepara herramientas, suelda el DB9 HMI\u2013PLC y comprueba el cable." },
  { id: "temperature", name: "Temperatura", description: "Mide termocupla y Pt100 en un horno de pozo seco, con transmisor." },
  { id: "detectors", name: "Detectores", description: "Mide detectores inductivo, capacitivo y fotoel\xE9ctrico y con\xE9ctalos a un PLC." },
  { id: "geogebra", name: "GeoGebra", description: "Explora funciones, geometr\xEDa, c\xE1lculo y matrices libremente o con una lecci\xF3n." }
];
var TOOL_GROUPS = [{ id: "automation", name: "Automatizaci\xF3n", tools: ["equipment", "plc", "hmi", "process"] }];
var DEVICES = [
  { kind: "supply", name: "Fuente 24 V DC", prefix: "G" },
  { kind: "no", name: "Pulsador NA", prefix: "S" },
  { kind: "nc", name: "Pulsador NC", prefix: "S" },
  { kind: "coil", name: "Bobina de rel\xE9", prefix: "K" },
  { kind: "contact", name: "Contacto auxiliar NA", prefix: "K" },
  { kind: "lamp", name: "Piloto", prefix: "H" },
  { kind: "motor", name: "Motor DC ideal", prefix: "M" },
  { kind: "output", name: "Contacto de salida PLC", prefix: "Q" },
  { kind: "breaker", name: "Interruptor de mando DC", prefix: "Q" },
  { kind: "fuse", name: "Portafusible de mando", prefix: "FU" },
  { kind: "emergency", name: "Parada de emergencia NC", prefix: "S" },
  { kind: "selector", name: "Selector de dos posiciones", prefix: "SA" },
  { kind: "contact-nc", name: "Contacto auxiliar NC", prefix: "K" },
  { kind: "terminal", name: "Bornera de paso", prefix: "X" },
  { kind: "buzzer", name: "Zumbador 24 V DC", prefix: "HA" }
];
var isMaintainedControl = (kind) => ["breaker", "fuse", "emergency", "selector"].includes(kind);
var initialControlClosed = (device) => device.closed ?? (device.kind === "fuse" || device.kind === "emergency");
function deviceClosed(device, pressed, controls, memory, relays) {
  if (isMaintainedControl(device.kind)) return controls[device.id] ?? initialControlClosed(device);
  switch (device.kind) {
    case "no":
      return !!pressed[device.id];
    case "nc":
      return !pressed[device.id];
    case "contact":
      return !!relays[device.tag];
    case "contact-nc":
      return !relays[device.tag];
    case "output":
      return !!memory[device.signal];
    case "terminal":
      return true;
    default:
      return false;
  }
}
var verticalDevice = (kind) => kind === "supply" || kind === "breaker" || kind === "fuse";
function devicePinOffset(kind, pin) {
  return verticalDevice(kind) ? { x: 0, y: pin === 0 ? -48 : 48 } : { x: pin === 0 ? -48 : 48, y: 0 };
}
function devicePinLabel(kind, pin) {
  const names = { supply: ["+", "\u2212"], coil: ["A1", "A2"], contact: ["13", "14"], "contact-nc": ["21", "22"], nc: ["1", "2"], emergency: ["1", "2"], no: ["3", "4"], selector: ["3", "4"], buzzer: ["+", "\u2212"] };
  return (names[kind] ?? ["1", "2"])[pin];
}
var DEFAULT_BOARD_POWER = { plugged: false, enabled: false, redConnected: false, blackConnected: false };
var boardPowered = (p) => p.plugged && p.enabled && p.redConnected && p.blackConnected;
var uid = (prefix = "id") => `${prefix}-${crypto.randomUUID()}`;
var addressOK = (s) => /^(?:[IQM]\d+\.[0-7]|[TC]\d+|(?:AI|AQ|MW)\d+)$/.test(s);
var pinKey = (end) => `${end.device}:${end.pin}`;
var initialMemory = (p) => Object.fromEntries(p.plc.tags.map((t) => [t.address, t.initial]));
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
function parseHoleId(input) {
  const match = /^(top[+-]|bottom[+-]|[a-j]):?([1-9]|[12]\d|30)$/.exec(input.trim().toLowerCase());
  if (!match) return null;
  const id = `${match[1]}:${match[2]}`;
  return HOLE_BY_ID.has(id) ? id : null;
}
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
var IC_PIN_NAMES = ["EN1", "IN1", "OUT1", "GND", "GND", "OUT2", "IN2", "VS", "EN2", "IN3", "OUT3", "GND", "GND", "OUT4", "IN4", "VSS"];
function icPinHoles(from) {
  const match = /^f:(\d+)$/.exec(from);
  if (!match) return null;
  const col = Number(match[1]);
  if (col < 1 || col > 23) return null;
  return [...Array.from({ length: 8 }, (_, i) => `f:${col + i}`), ...Array.from({ length: 8 }, (_, i) => `e:${col + 7 - i}`)];
}
var icTo = (from) => {
  const pins = icPinHoles(from);
  return pins ? pins[8] : null;
};
function bjtBase(from, to) {
  const a = /^([a-j]):(\d+)$/.exec(from), b = /^([a-j]):(\d+)$/.exec(to);
  if (!a || !b || a[1] !== b[1] || Math.abs(Number(a[2]) - Number(b[2])) !== 2) return null;
  return `${a[1]}:${(Number(a[2]) + Number(b[2])) / 2}`;
}
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
function componentHoles(c) {
  if (c.kind === "l293d") return icPinHoles(c.from) ?? [c.from];
  if (c.kind === "button") return buttonPins(c.from, c.to) ?? [c.from, c.to];
  if (c.kind === "bjt") {
    const base = bjtBase(c.from, c.to);
    return base ? [c.from, base, c.to] : [c.from, c.to];
  }
  return [c.from, c.to];
}
function crowdedHoles(components) {
  const used = /* @__PURE__ */ new Map();
  for (const c of components) for (const hole of new Set(componentHoles(c))) used.set(hole, [...used.get(hole) ?? [], c.id]);
  return Object.fromEntries([...used].filter(([, ids]) => ids.length > 1));
}
var holeCol = (id) => Number(id.split(":")[1]);
function relocate(components, id, change) {
  const c = components.find((x) => x.id === id);
  if (!c) return { ok: false, error: "Ese componente ya no existe." };
  let from = change.from ?? c.from, to = change.to ?? c.to;
  if (change.anchor !== void 0) {
    if (c.kind === "l293d") {
      from = change.anchor;
    } else if (c.kind === "button" && buttonPins(c.from, c.to)) {
      const col = holeCol(change.anchor), row = change.anchor.split(":")[0], rows = "abcdefghij", oldA = c.from.split(":")[0], oldB = c.to.split(":")[0];
      if (!rows.includes(row) || row.length !== 1) return { ok: false, error: "El pulsador necesita filas a\u2013j." };
      const across = ["e", "f"].includes(oldA) && ["e", "f"].includes(oldB);
      if (across && !["e", "f"].includes(row)) return { ok: false, error: "Este pulsador cruza el canal central (e\u2013f)." };
      const endRow = across ? row === "e" ? "f" : "e" : rows[rows.indexOf(row) + rows.indexOf(oldB) - rows.indexOf(oldA)];
      from = change.anchor;
      to = `${endRow}:${col + holeCol(c.to) - holeCol(c.from)}`;
    } else if (c.kind === "bjt") {
      const row = /^([a-j]):\d+$/.exec(change.anchor);
      if (!row) return { ok: false, error: "El transistor va en las filas a\u2013j, no en un riel." };
      from = change.anchor;
      to = `${row[1]}:${holeCol(change.anchor) + holeCol(c.to) - holeCol(c.from)}`;
    } else from = change.anchor;
  }
  if (!HOLE_BY_ID.has(from) || !HOLE_BY_ID.has(to)) return { ok: false, error: c.kind === "bjt" ? "El transistor necesita tres orificios seguidos dentro de la placa." : "Ese orificio no existe." };
  if (c.kind === "l293d") {
    const end = icTo(from);
    if (!end) return { ok: false, error: "El L293D empieza en la fila f, columnas 1 a 23, y cruza el canal central." };
    to = end;
  } else if (c.kind === "bjt") {
    if (!bjtBase(from, to)) return { ok: false, error: "El transistor ocupa tres orificios seguidos de una misma fila (emisor, base y colector)." };
  } else if (c.kind === "button" && buttonPins(c.from, c.to) && !buttonPins(from, to)) return { ok: false, error: "Conserva la separaci\xF3n de las cuatro patas: tres columnas y el canal central, o tres filas dentro de la misma mitad." };
  else if (from === to) return { ok: false, error: "Elige dos orificios diferentes." };
  const next = { ...c, from, to }, mine = new Set(componentHoles(c));
  const taken = /* @__PURE__ */ new Map();
  for (const o of components) if (o.id !== id) for (const h of componentHoles(o)) taken.set(h, o.kind);
  const clash = componentHoles(next).find((h) => taken.has(h) && !mine.has(h));
  if (clash) return { ok: false, error: `El orificio ${clash.replace(":", "")} ya tiene una pata. Cada orificio admite una sola.` };
  return { ok: true, component: next };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_BOARD_POWER,
  DEVICES,
  HOLES,
  HOLE_BY_ID,
  IC_PIN_NAMES,
  Nets,
  TOOLS,
  TOOL_GROUPS,
  addressOK,
  bjtBase,
  boardPowered,
  buttonPins,
  componentHoles,
  crowdedHoles,
  deviceClosed,
  devicePinLabel,
  devicePinOffset,
  icPinHoles,
  icTo,
  initialControlClosed,
  initialMemory,
  isMaintainedControl,
  joinBoardParts,
  newProject,
  parseHoleId,
  pinKey,
  relocate,
  uid,
  verticalDevice
});
