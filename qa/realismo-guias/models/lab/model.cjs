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

// src/lab/model.ts
var model_exports = {};
__export(model_exports, {
  DEVICES: () => DEVICES,
  HOLES: () => HOLES,
  HOLE_BY_ID: () => HOLE_BY_ID,
  IC_PIN_NAMES: () => IC_PIN_NAMES,
  Nets: () => Nets,
  TOOLS: () => TOOLS,
  addressOK: () => addressOK,
  bjtBase: () => bjtBase,
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
  newProject: () => newProject,
  parseHoleId: () => parseHoleId,
  pinKey: () => pinKey,
  relocate: () => relocate,
  uid: () => uid,
  verticalDevice: () => verticalDevice
});
module.exports = __toCommonJS(model_exports);
var TOOLS = [
  { id: "schematic", name: "Esquemas", description: "Dibuja y prueba circuitos de mando." },
  { id: "equipment", name: "Equipos el\xE9ctricos", description: "Monta mando, automatizaci\xF3n y energ\xEDa con equipos y bornes interactivos." },
  { id: "plc", name: "PLC", description: "Programa contactos, bobinas y temporizadores." },
  { id: "hmi", name: "HMI", description: "Crea una pantalla para operar tus se\xF1ales." },
  { id: "process", name: "Procesos", description: "Controla el llenado de un tanque." },
  { id: "breadboard", name: "Protoboard", description: "Monta un circuito y mide tensi\xF3n y corriente." },
  { id: "temperature", name: "Temperatura", description: "Mide termocupla y Pt100 en un horno de pozo seco, con transmisor." },
  { id: "detectors", name: "Detectores", description: "Mide detectores inductivo, capacitivo y fotoel\xE9ctrico y con\xE9ctalos a un PLC." },
  { id: "geogebra", name: "GeoGebra", description: "Explora funciones, geometr\xEDa, c\xE1lculo y matrices libremente o con una lecci\xF3n." }
];
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
    breadboard: kind === "hbridge-bjt" ? { voltage: 12, positive: "top+:1", negative: "top-:1", components: [
      ...["e:2", "e:6", "e:10", "e:14"].map((from, i) => ({ id: `bj-q${[2, 3, 1, 4][i]}`, kind: "bjt", from, to: `e:${[4, 8, 12, 16][i]}`, value: 100, closed: true, color: "#1f2327" })),
      { id: "bj-r1", kind: "resistor", from: "c:3", to: "c:5", value: 1e3, closed: true, color: "#0f766e" },
      { id: "bj-r2", kind: "resistor", from: "c:7", to: "c:9", value: 1e3, closed: true, color: "#0f766e" },
      { id: "bj-r3", kind: "resistor", from: "d:11", to: "d:9", value: 1e3, closed: true, color: "#0f766e" },
      { id: "bj-r4", kind: "resistor", from: "c:15", to: "c:13", value: 1e3, closed: true, color: "#0f766e" },
      { id: "bj-s1", kind: "button", from: "b:4", to: "b:5", value: 0, closed: false, color: "#d94848" },
      { id: "bj-s2", kind: "button", from: "d:4", to: "e:9", value: 0, closed: false, color: "#d94848" },
      { id: "bj-m", kind: "motor", from: "h:3", to: "h:9", value: 40, closed: true, color: "#4b5563" },
      { id: "bj-p1", kind: "wire", from: "top+:4", to: "a:4", value: 0, closed: true, color: "#d94848" },
      { id: "bj-p2", kind: "wire", from: "top+:12", to: "a:12", value: 0, closed: true, color: "#d94848" },
      { id: "bj-g1", kind: "wire", from: "top-:6", to: "a:6", value: 0, closed: true, color: "#334155" },
      { id: "bj-g2", kind: "wire", from: "top-:14", to: "a:14", value: 0, closed: true, color: "#334155" },
      { id: "bj-ml", kind: "wire", from: "a:2", to: "a:8", value: 0, closed: true, color: "#e07b2a" },
      { id: "bj-mr", kind: "wire", from: "a:10", to: "a:16", value: 0, closed: true, color: "#d6a516" },
      { id: "bj-na", kind: "wire", from: "a:5", to: "a:13", value: 0, closed: true, color: "#2f6fd1" },
      { id: "bj-ma", kind: "wire", from: "d:2", to: "g:3", value: 0, closed: true, color: "#e07b2a" },
      { id: "bj-mb", kind: "wire", from: "d:10", to: "g:9", value: 0, closed: true, color: "#d6a516" }
    ] } : kind === "hbridge" ? { voltage: 12, positive: "top+:1", negative: "bottom-:1", components: [
      { id: "hb-r1", kind: "resistor", from: "top+:4", to: "a:10", value: 330, closed: true, color: "#0f766e" },
      { id: "hb-vs", kind: "wire", from: "top+:14", to: "j:17", value: 0, closed: true, color: "#d94848" },
      { id: "hb-ic", kind: "l293d", from: "f:10", to: "e:17", value: 0, closed: true, color: "#2b3035" },
      { id: "hb-s1", kind: "button", from: "c:10", to: "g:11", value: 0, closed: false, color: "#d94848" },
      { id: "hb-s2", kind: "button", from: "d:10", to: "g:16", value: 0, closed: false, color: "#d94848" },
      { id: "hb-en", kind: "wire", from: "h:10", to: "h:16", value: 0, closed: true, color: "#2f6fd1" },
      { id: "hb-m", kind: "motor", from: "h:12", to: "h:15", value: 40, closed: true, color: "#4b5563" },
      { id: "hb-g1", kind: "wire", from: "bottom-:13", to: "i:13", value: 0, closed: true, color: "#334155" },
      { id: "hb-g2", kind: "wire", from: "bottom-:14", to: "i:14", value: 0, closed: true, color: "#334155" }
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
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 366], ["bottom-", 390]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
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
function componentHoles(c) {
  if (c.kind === "l293d") return icPinHoles(c.from) ?? [c.from];
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
  } else if (from === to) return { ok: false, error: "Elige dos orificios diferentes." };
  const next = { ...c, from, to }, mine = new Set(componentHoles(c));
  const taken = /* @__PURE__ */ new Map();
  for (const o of components) if (o.id !== id) for (const h of componentHoles(o)) taken.set(h, o.kind);
  const clash = componentHoles(next).find((h) => taken.has(h) && !mine.has(h));
  if (clash) return { ok: false, error: `El orificio ${clash.replace(":", "")} ya tiene una pata. Cada orificio admite una sola.` };
  return { ok: true, component: next };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEVICES,
  HOLES,
  HOLE_BY_ID,
  IC_PIN_NAMES,
  Nets,
  TOOLS,
  addressOK,
  bjtBase,
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
  newProject,
  parseHoleId,
  pinKey,
  relocate,
  uid,
  verticalDevice
});
