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
  for (const c of components) for (const hole2 of new Set(componentHoles(c))) used.set(hole2, [...used.get(hole2) ?? [], c.id]);
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
      const col = holeCol(change.anchor), row = change.anchor.split(":")[0], rows2 = "abcdefghij", oldA = c.from.split(":")[0], oldB = c.to.split(":")[0];
      if (!rows2.includes(row) || row.length !== 1) return { ok: false, error: "El pulsador necesita filas a\u2013j." };
      const across = ["e", "f"].includes(oldA) && ["e", "f"].includes(oldB);
      if (across && !["e", "f"].includes(row)) return { ok: false, error: "Este pulsador cruza el canal central (e\u2013f)." };
      const endRow = across ? row === "e" ? "f" : "e" : rows2[rows2.indexOf(row) + rows2.indexOf(oldB) - rows2.indexOf(oldA)];
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

// src/lab/dc.ts
function junctionCurrent(v, resistance, j) {
  const rs = Math.max(resistance, 1e-6), is = j.saturation, vt = j.nvt;
  if (v <= 0) {
    const ex = Math.exp(Math.max(-40, v / vt));
    return { current: is * (ex - 1), conductance: Math.max(1e-12, is * ex / vt) };
  }
  let lo = 0, hi = v / rs;
  for (let k = 0; k < 64; k++) {
    const mid = (lo + hi) / 2;
    if (vt * Math.log1p(mid / is) + mid * rs > v) hi = mid;
    else lo = mid;
  }
  const current = (lo + hi) / 2;
  return { current, conductance: 1 / (rs + vt / (current + is)) };
}
var BJT_VBE = 0.7;
var BJT_RB = 10;
var BJT_VCE_SAT = 0.2;
var BJT_RCE = 2;
function solveDC(branches, fixed, transistors = []) {
  const adjacency = /* @__PURE__ */ new Map();
  const link = (x, y) => {
    if (!adjacency.has(x)) adjacency.set(x, /* @__PURE__ */ new Set());
    if (!adjacency.has(y)) adjacency.set(y, /* @__PURE__ */ new Set());
    adjacency.get(x).add(y);
    adjacency.get(y).add(x);
  };
  for (const b of branches) link(b.a, b.b);
  for (const t of transistors) {
    link(t.b, t.e);
    link(t.c, t.e);
  }
  const reachable = new Set(Object.keys(fixed)), queue = [...reachable];
  for (let i = 0; i < queue.length; i++) for (const next of adjacency.get(queue[i]) ?? []) if (!reachable.has(next)) {
    reachable.add(next);
    queue.push(next);
  }
  const nodes = [...reachable].filter((id) => !(id in fixed)), lookup = new Map(nodes.map((id, i) => [id, i]));
  const floating = [...adjacency.keys()].filter((id) => !reachable.has(id));
  const failure = (fault) => ({ volts: {}, amps: {}, floating, fault, bjts: {} });
  let volts = { ...fixed };
  let converged = false;
  if (nodes.length > 500) return failure("La red supera la capacidad de c\xE1lculo de esta versi\xF3n.");
  const active = transistors.filter((t) => reachable.has(t.b) && reachable.has(t.e) && t.b !== t.e);
  const regions = new Map(active.map((t) => [t.id, "corte"]));
  const gminNodes = new Set(active.flatMap((t) => [t.b, t.c, t.e]).filter((id) => lookup.has(id)));
  for (let iteration = 0; iteration < 120; iteration++) {
    const matrix = nodes.map(() => new Float64Array(nodes.length + 1));
    const add = (row, col, coefficient) => {
      const i = lookup.get(row);
      if (i === void 0) return;
      const j = lookup.get(col);
      if (j !== void 0) matrix[i][j] += coefficient;
      else matrix[i][nodes.length] -= coefficient * (fixed[col] ?? 0);
    };
    const rhs = (row, value) => {
      const i = lookup.get(row);
      if (i !== void 0) matrix[i][nodes.length] += value;
    };
    for (const branch of branches) {
      if (!reachable.has(branch.a) || !reachable.has(branch.b) || branch.a === branch.b) continue;
      const conducting = branch.drop === void 0 || (volts[branch.a] ?? 0) - (volts[branch.b] ?? 0) > branch.drop;
      const v = (volts[branch.a] ?? 0) - (volts[branch.b] ?? 0), nonlinear = branch.junction ? junctionCurrent(v, branch.resistance, branch.junction) : null;
      const conductance = nonlinear?.conductance ?? (conducting ? 1 / branch.resistance : 1e-8);
      const drop = nonlinear ? v - nonlinear.current / conductance : conducting ? branch.drop ?? 0 : 0;
      for (const [a, b, sign] of [[branch.a, branch.b, 1], [branch.b, branch.a, -1]]) {
        const i = lookup.get(a);
        if (i === void 0) continue;
        matrix[i][i] += conductance;
        const j = lookup.get(b);
        if (j !== void 0) matrix[i][j] -= conductance;
        else matrix[i][nodes.length] += conductance * fixed[b];
        matrix[i][nodes.length] += sign * conductance * drop;
      }
    }
    let regionChanged = false;
    for (const t of active) {
      const s = t.pnp ? -1 : 1, vb = volts[t.b] ?? 0, ve = volts[t.e] ?? 0, vc = volts[t.c] ?? ve, vbe = s * (vb - ve), vce = s * (vc - ve), on = vbe > BJT_VBE, before = regions.get(t.id);
      let region = before;
      if (!on) region = "corte";
      else if (before === "corte") region = "activa";
      else if (before === "activa" && vce < BJT_VCE_SAT) region = "saturaci\xF3n";
      else if (before === "saturaci\xF3n" && (vce - BJT_VCE_SAT) / BJT_RCE > t.beta * (vbe - BJT_VBE) / BJT_RB) region = "activa";
      if (region !== before) {
        regionChanged = true;
        regions.set(t.id, region);
      }
      const gb = on ? 1 / BJT_RB : 1e-8, db = on ? BJT_VBE : 0;
      add(t.b, t.b, gb);
      add(t.b, t.e, -gb);
      rhs(t.b, s * gb * db);
      add(t.e, t.e, gb);
      add(t.e, t.b, -gb);
      rhs(t.e, -s * gb * db);
      if (!reachable.has(t.c)) continue;
      if (region === "corte") {
        add(t.c, t.c, 1e-8);
        add(t.c, t.e, -1e-8);
        add(t.e, t.e, 1e-8);
        add(t.e, t.c, -1e-8);
      } else if (region === "activa") {
        const k = t.beta / BJT_RB;
        add(t.c, t.b, k);
        add(t.c, t.e, -k);
        rhs(t.c, s * k * BJT_VBE);
        add(t.e, t.b, -k);
        add(t.e, t.e, k);
        rhs(t.e, -s * k * BJT_VBE);
        add(t.c, t.c, 1e-8);
        add(t.c, t.e, -1e-8);
        add(t.e, t.e, 1e-8);
        add(t.e, t.c, -1e-8);
      } else {
        const g = 1 / BJT_RCE;
        add(t.c, t.c, g);
        add(t.c, t.e, -g);
        rhs(t.c, s * g * BJT_VCE_SAT);
        add(t.e, t.e, g);
        add(t.e, t.c, -g);
        rhs(t.e, -s * g * BJT_VCE_SAT);
      }
    }
    for (const id of gminNodes) {
      const i = lookup.get(id);
      matrix[i][i] += 1e-7;
    }
    for (let col = 0; col < nodes.length; col++) {
      let pivot = col;
      for (let row = col + 1; row < nodes.length; row++) if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row;
      if (Math.abs(matrix[pivot][col]) < 1e-14) return failure("No se puede resolver esta red: revisa conexiones y referencia de tensi\xF3n.");
      [matrix[pivot], matrix[col]] = [matrix[col], matrix[pivot]];
      const divisor = matrix[col][col];
      for (let j = col; j <= nodes.length; j++) matrix[col][j] /= divisor;
      for (let row = 0; row < nodes.length; row++) if (row !== col) {
        const scale = matrix[row][col];
        if (scale === 0) continue;
        for (let j = col; j <= nodes.length; j++) matrix[row][j] -= scale * matrix[col][j];
      }
    }
    const next = { ...fixed };
    nodes.forEach((id, i) => {
      next[id] = matrix[i][nodes.length];
    });
    if (!regionChanged && nodes.every((id) => Math.abs((volts[id] ?? 0) - next[id]) < 1e-8)) {
      volts = next;
      converged = true;
      break;
    }
    volts = branches.some((b) => b.junction) ? Object.fromEntries(Object.entries(next).map(([id, value]) => [id, id in fixed ? value : (volts[id] ?? 0) * 0.4 + value * 0.6])) : next;
  }
  if (!converged && nodes.length) return failure(transistors.length ? "El modelo del transistor no converge en este montaje. Revisa la resistencia de base y las conexiones." : "El modelo de diodo no converge en este montaje. Revisa polaridad y resistencia.");
  let floatingAll = floating;
  if (active.length) {
    const live = new Set(Object.keys(fixed)), edges = /* @__PURE__ */ new Map(), join = (x, y) => {
      if (!edges.has(x)) edges.set(x, /* @__PURE__ */ new Set());
      if (!edges.has(y)) edges.set(y, /* @__PURE__ */ new Set());
      edges.get(x).add(y);
      edges.get(y).add(x);
    };
    for (const b of branches) join(b.a, b.b);
    for (const t of transistors) {
      if ((regions.get(t.id) ?? "corte") !== "corte") {
        join(t.b, t.e);
        join(t.c, t.e);
      }
    }
    const pending = [...live];
    for (let i = 0; i < pending.length; i++) for (const next of edges.get(pending[i]) ?? []) if (!live.has(next)) {
      live.add(next);
      pending.push(next);
    }
    const lost = Object.keys(volts).filter((id) => !live.has(id) && !(id in fixed));
    if (lost.length) {
      volts = { ...volts };
      for (const id of lost) delete volts[id];
      floatingAll = [.../* @__PURE__ */ new Set([...floating, ...lost])];
    }
  }
  const amps = {}, bjts = {};
  for (const b of branches) if (volts[b.a] !== void 0 && volts[b.b] !== void 0) amps[b.id] = b.junction ? junctionCurrent(volts[b.a] - volts[b.b], b.resistance, b.junction).current : b.drop === void 0 ? (volts[b.a] - volts[b.b]) / b.resistance : Math.max(0, (volts[b.a] - volts[b.b] - b.drop) / b.resistance);
  for (const t of transistors) {
    const region = regions.get(t.id) ?? "corte", vb = volts[t.b], ve = volts[t.e], vc = volts[t.c];
    if (vb === void 0 || ve === void 0) {
      bjts[t.id] = { ib: 0, ic: 0, vbe: 0, vce: 0, region: "corte" };
      amps[t.id] = 0;
      continue;
    }
    const sg = t.pnp ? -1 : 1, vbe = sg * (vb - ve), vce = sg * ((vc ?? ve) - ve), ib = region === "corte" ? 0 : Math.max(0, (vbe - BJT_VBE) / BJT_RB), ic = region === "corte" ? 0 : region === "activa" ? t.beta * ib : Math.max(0, (vce - BJT_VCE_SAT) / BJT_RCE);
    bjts[t.id] = { ib, ic, vbe, vce, region };
    amps[t.id] = ic;
  }
  return { volts, amps, floating: floatingAll, fault: null, bjts };
}
var LOGIC_HIGH = 2.3;
var VSS_MIN = 4.5;
var VSS_MAX = 7;
var IC_OUT_LIMIT = 0.6;
var AMMETER_OHMS = 0.1;
var AMMETER_FUSE = 10;
var SOURCE_LIMIT = 3;
var IC_CHANNELS = [[2, 1, 0], [5, 6, 0], [10, 9, 8], [13, 14, 8]];
function jitter(id, salt) {
  let h = 2166136261;
  for (const ch of `${id}|${salt}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295 * 2 - 1;
}
function actualValue(c, realistic) {
  if (!realistic) return c.value;
  const triangular = (spread) => 1 + spread * (jitter(c.id, "a") + jitter(c.id, "b")) / 2;
  if (c.kind === "resistor" || c.kind === "motor") return c.value * triangular(0.05);
  if (c.kind === "bjt") return c.value * (1 + 0.3 * jitter(c.id, "beta"));
  if (c.kind === "led" || c.kind === "diode") return c.value * triangular(0.03);
  return c.value;
}
function solveOnce(board, switches, options, dead) {
  const nets = new Nets();
  for (const hole2 of HOLES) nets.join(hole2.id, hole2.group);
  const closedOf = (c) => switches[c.id] ?? (c.kind === "button" ? false : c.closed);
  joinBoardParts(nets, board.components, switches);
  const groups = Object.fromEntries(HOLES.map((h) => [h.id, nets.find(h.id)])), positive = nets.find(board.positive), negative = nets.find(board.negative);
  const none = { failures: {}, damaged: {}, tripped: false, sourceCurrent: 0 };
  const empty = { volts: {}, amps: {}, floating: [], holeVolts: {}, groups, warnings: [], ics: {}, bjts: {}, ...none };
  if (positive === negative) return { result: { ...empty, fault: "Cortocircuito: los dos polos de la fuente est\xE1n unidos." }, stress: {} };
  const live = board.components.filter((c) => !dead.has(c.id)), real = (c) => actualValue(c, board.realistic);
  const branches = live.filter((c) => c.kind === "resistor" || c.kind === "led" || c.kind === "motor" || c.kind === "diode").map((c) => ({ id: c.id, a: nets.find(c.from), b: nets.find(c.to), resistance: c.kind === "led" ? 10 : c.kind === "diode" ? 1 : real(c), ...c.kind === "led" || c.kind === "diode" ? { drop: real(c) } : {} }));
  if (board.realistic) for (const branch of branches) {
    const part = live.find((c) => c.id === branch.id);
    if (part && (part.kind === "diode" || part.kind === "led")) {
      const nvt = part.kind === "led" ? 0.06 : 0.045, referenceCurrent = part.kind === "led" ? 0.02 : 0.01;
      branch.junction = { saturation: referenceCurrent / Math.expm1((real(part) - referenceCurrent * branch.resistance) / nvt), nvt };
      delete branch.drop;
    }
  }
  if (options.voltmeter) {
    const a = nets.find(options.voltmeter.a), b = nets.find(options.voltmeter.b);
    if (a !== b) branches.push({ id: "voltmeter-input", a, b, resistance: options.voltmeter.ohms ?? 1e7 });
  }
  const meterNets = options.ammeter && !dead.has("meter") ? [nets.find(options.ammeter.a), nets.find(options.ammeter.b)] : null;
  if (meterNets && meterNets[0] !== meterNets[1]) branches.push({ id: "meter", a: meterNets[0], b: meterNets[1], resistance: AMMETER_OHMS });
  const transistors = live.filter((c) => c.kind === "bjt").flatMap((c) => {
    const base = bjtBase(c.from, c.to);
    return base ? [{ id: c.id, e: nets.find(c.from), b: nets.find(base), c: nets.find(c.to), beta: real(c), pnp: c.polarity === "pnp" }] : [];
  });
  const fixed = { [positive]: board.voltage, [negative]: 0 };
  let result = solveDC(branches, fixed, transistors);
  const warnings = [], ics = {}, stress = {}, highDrives = [], lowDrives = [];
  const chips = board.components.filter((c) => c.kind === "l293d");
  let drives = {};
  if (chips.length && !result.fault) {
    const first = result, level = (hole2) => first.volts[nets.find(hole2)];
    let conflict = null;
    for (const chip of chips) {
      const pins = icPinHoles(chip.from);
      if (!pins) continue;
      if (dead.has(chip.id)) {
        ics[chip.id] = { powered: false, pins: IC_PIN_NAMES.map((name) => ({ name, level: "none" })) };
        continue;
      }
      const vss = level(pins[15]), vs = level(pins[7]), gnd = [3, 4, 11, 12].map((i) => level(pins[i])).find((v) => v !== void 0);
      const powered = vss !== void 0 && vss >= VSS_MIN && gnd !== void 0 && Math.abs(gnd) < 0.5;
      if (vss !== void 0 && vss > VSS_MAX) warnings.push(`L293D: VSS = ${vss.toFixed(1).replace(".", ",")} V; la hoja de datos t\xEDpica indica de 4,5 a 7 V para la l\xF3gica.`);
      else if (vss !== void 0 && vss < VSS_MIN) warnings.push("L293D sin alimentaci\xF3n l\xF3gica: VSS debe ser de al menos 4,5 V.");
      else if (vss === void 0) warnings.push("L293D sin alimentaci\xF3n: el pin VSS (16) no llega a la fuente.");
      if (powered && vs === void 0) warnings.push("L293D: el pin VS (8) no llega a la fuente; las salidas quedan desactivadas.");
      const state = IC_PIN_NAMES.map((name) => ({ name, level: "none" }));
      for (const [outPin, inPin, enPin] of IC_CHANNELS) {
        const input = level(pins[inPin]), enable = level(pins[enPin]);
        state[inPin].level = input !== void 0 && input >= LOGIC_HIGH ? "high" : "low";
        state[enPin].level = enable !== void 0 && enable >= LOGIC_HIGH ? "high" : "low";
        const active = powered && vs !== void 0 && state[enPin].level === "high";
        if (!active) {
          state[outPin].level = "off";
          continue;
        }
        const high = state[inPin].level === "high", volts = high ? vs : gnd, net = nets.find(pins[outPin]);
        state[outPin].level = high ? "high" : "low";
        if (drives[net] !== void 0 && Math.abs(drives[net] - volts) > 1e-9 || net in fixed && Math.abs(fixed[net] - volts) > 1e-9) conflict = `Salida ${IC_PIN_NAMES[outPin]} del L293D unida a otra tensi\xF3n fija (fuente u otra salida activa).`;
        drives[net] = volts;
        (high ? highDrives : lowDrives).push(net);
      }
      ics[chip.id] = { powered, pins: state };
    }
    if (conflict) return { result: { ...empty, ics, warnings, fault: conflict }, stress: {} };
    if (Object.keys(drives).length) {
      result = solveDC(branches, { ...fixed, ...drives }, transistors);
      if (!result.fault) for (const net of Object.keys(drives)) {
        let out = 0;
        for (const b of branches) {
          const i = result.amps[b.id];
          if (i === void 0) continue;
          if (b.a === net) out += i;
          if (b.b === net) out -= i;
        }
        const chip = chips.find((c) => {
          const pins = icPinHoles(c.from);
          return pins?.some((h) => nets.find(h) === net);
        });
        if (Math.abs(out) > IC_OUT_LIMIT) warnings.push(`L293D: una salida entrega ${(Math.abs(out) * 1e3).toFixed(0)} mA; supera los 600 mA por canal de la hoja de datos t\xEDpica.`);
        if (chip && Math.abs(out) > 2 * IC_OUT_LIMIT) stress[chip.id] = `salida sobrecargada: ${(Math.abs(out) * 1e3).toFixed(0)} mA`;
      }
    }
  }
  const voltOf = (hole2) => result.volts[nets.find(hole2)];
  for (const c of live) {
    const current = result.amps[c.id], a = voltOf(c.from), b = voltOf(c.to);
    if (c.kind === "led" && current !== void 0 && current > 0.02) warnings.push(`LED ${c.id.slice(-4)}: ${(current * 1e3).toFixed(1)} mA; supera la referencia did\xE1ctica de 20 mA.`);
    if (c.kind === "led" && current !== void 0 && current > 0.05) stress[c.id] = `sobrecorriente: ${(current * 1e3).toFixed(0)} mA`;
    if (c.kind === "led" && a !== void 0 && b !== void 0 && a - b < -5) {
      warnings.push("LED con tensi\xF3n inversa elevada en el modelo.");
      stress[c.id] = `tensi\xF3n inversa de ${(b - a).toFixed(1).replace(".", ",")} V`;
    }
    if (c.kind === "resistor" && current !== void 0) {
      const power = current * current * real(c);
      if (power > 0.25) warnings.push(`Resistencia ${c.id.slice(-4)}: potencia superior a 0,25 W.`);
      if (power > 0.5) stress[c.id] = `sobrecalentamiento: ${power.toFixed(2).replace(".", ",")} W`;
    }
    if (c.kind === "diode" && current !== void 0) {
      if (current > 1) warnings.push(`Diodo ${c.id.slice(-4)}: ${(current * 1e3).toFixed(0)} mA; supera 1 A, la corriente continua de un 1N4007.`);
      if (current > 2) stress[c.id] = `sobrecorriente: ${current.toFixed(1).replace(".", ",")} A`;
    }
    if (c.kind === "bjt") {
      const t = result.bjts[c.id];
      if (t) {
        if (t.ic > 0.6) warnings.push(`Transistor ${c.id.slice(-4)}: Ic = ${(t.ic * 1e3).toFixed(0)} mA; supera los 600 mA t\xEDpicos de un 2N2222 en TO-92.`);
        if (t.region !== "corte" && t.ic * t.vce > 0.625) warnings.push(`Transistor ${c.id.slice(-4)}: potencia superior a 0,625 W (TO-92).`);
        if (t.ib > 0.05) warnings.push(`Transistor ${c.id.slice(-4)}: corriente de base de ${(t.ib * 1e3).toFixed(0)} mA; falta una resistencia de base.`);
        if (t.ic > 1) stress[c.id] = `sobrecorriente de colector: ${(t.ic * 1e3).toFixed(0)} mA`;
        else if (t.region !== "corte" && t.ic * t.vce > 1) stress[c.id] = `sobrecalentamiento: ${(t.ic * t.vce).toFixed(1).replace(".", ",")} W`;
        else if (t.ib > 0.1) stress[c.id] = `corriente de base excesiva: ${(t.ib * 1e3).toFixed(0)} mA`;
      }
    }
  }
  const meterCurrent = meterNets ? meterNets[0] === meterNets[1] ? 0 : result.amps.meter : void 0;
  if (meterCurrent !== void 0 && Math.abs(meterCurrent) > AMMETER_FUSE) stress.meter = `corriente de ${Math.abs(meterCurrent).toFixed(1).replace(".", ",")} A en el amper\xEDmetro`;
  const outflow = (net) => {
    let out = 0;
    for (const b of branches) {
      const i = result.amps[b.id];
      if (i === void 0) continue;
      if (b.a === net) out += i;
      if (b.b === net) out -= i;
    }
    for (const t of transistors) {
      const st = result.bjts[t.id];
      if (!st) continue;
      const sg = t.pnp ? -1 : 1;
      if (t.c === net) out += sg * st.ic;
      if (t.b === net) out += sg * st.ib;
      if (t.e === net) out -= sg * (st.ic + st.ib);
    }
    return out;
  };
  const sourceCurrent = result.fault ? 0 : Math.max(0, outflow(positive) + highDrives.reduce((sum, n) => sum + Math.max(0, outflow(n)), 0));
  if (result.floating.length) warnings.push("Hay partes del circuito sin referencia a la fuente; no se asigna una medida de tensi\xF3n a esos nodos.");
  const full = { ...result, groups, ics, failures: {}, damaged: {}, tripped: false, sourceCurrent, meterCurrent, warnings: [...new Set(warnings)], holeVolts: Object.fromEntries(HOLES.filter((h) => result.volts[groups[h.id]] !== void 0).map((h) => [h.id, result.volts[groups[h.id]]])) };
  return { result: full, stress };
}
function solveBreadboard(board, switches = {}, options = {}) {
  const damaged = { ...options.damaged }, failures = {};
  let pass = solveOnce(board, switches, options, new Set(Object.keys(damaged)));
  if (options.failures) {
    for (let round = 0; round < 10; round++) {
      const found = Object.fromEntries(Object.entries(pass.stress).filter(([id]) => !(id in damaged)));
      if (Object.keys(found).length) {
        Object.assign(damaged, found);
        Object.assign(failures, found);
        pass = solveOnce(board, switches, options, new Set(Object.keys(damaged)));
        continue;
      }
      const limit = options.sourceLimit ?? SOURCE_LIMIT;
      if (pass.result.sourceCurrent > limit) {
        const amps = pass.result.sourceCurrent;
        return { ...pass.result, volts: {}, amps: {}, holeVolts: {}, bjts: {}, ics: {}, floating: [], failures, damaged, tripped: true, sourceCurrent: amps, fault: `Protecci\xF3n de la fuente: pidi\xF3 ${amps.toFixed(1).replace(".", ",")} A y el l\xEDmite es ${limit} A. La fuente se apag\xF3; det\xE9n la simulaci\xF3n y revisa el circuito.` };
      }
      break;
    }
  }
  return { ...pass.result, failures, damaged };
}
function measureResistance(board, switches, a, b, damaged = {}) {
  const nets = new Nets();
  for (const hole2 of HOLES) nets.join(hole2.id, hole2.group);
  joinBoardParts(nets, board.components, switches);
  const na = nets.find(a), nb = nets.find(b);
  if (na === nb) return { ohms: 0, short: true };
  const live = board.components.filter((c) => !(c.id in damaged)), real = (c) => actualValue(c, board.realistic);
  const branches = live.filter((c) => c.kind === "resistor" || c.kind === "led" || c.kind === "motor" || c.kind === "diode").map((c) => ({ id: c.id, a: nets.find(c.from), b: nets.find(c.to), resistance: c.kind === "led" ? 10 : c.kind === "diode" ? 1 : real(c), ...c.kind === "led" || c.kind === "diode" ? { drop: real(c) } : {} }));
  const transistors = live.filter((c) => c.kind === "bjt").flatMap((c) => {
    const base = bjtBase(c.from, c.to);
    return base ? [{ id: c.id, e: nets.find(c.from), b: nets.find(base), c: nets.find(c.to), beta: real(c), pnp: c.polarity === "pnp" }] : [];
  });
  const test = 0.4, result = solveDC(branches, { [na]: test, [nb]: 0 }, transistors);
  if (result.fault) return { ohms: null, short: false };
  let current = 0;
  for (const br of branches) {
    const i = result.amps[br.id];
    if (i === void 0) continue;
    if (br.a === na) current += i;
    if (br.b === na) current -= i;
  }
  if (Math.abs(current) < 4e-8) return { ohms: null, short: false };
  return { ohms: test / Math.abs(current), short: false };
}
function netGroups(board, switches = {}) {
  const nets = new Nets();
  for (const hole2 of HOLES) nets.join(hole2.id, hole2.group);
  joinBoardParts(nets, board.components, switches);
  return Object.fromEntries(HOLES.map((h) => [h.id, nets.find(h.id)]));
}
function holeName(id) {
  return HOLE_BY_ID.has(id) ? id.replace(":", "").replace("top+", "+ superior ").replace("top-", "\u2212 superior ").replace("bottom+", "+ inferior ").replace("bottom-", "\u2212 inferior ") : id;
}

// src/lab/equipment/model.ts
var PUMP_ROLES = ["supply", "fuse", "guard", "contactor", "thermal", "u", "v", "w", "earth", "stop", "start", "lamp", "feed", "motor"];
var CATALOG = [
  { kind: "dc", name: "Fuente DC regulada", family: "mando", prefix: "G", detail: "Alimentaci\xF3n de mando con polos + y \u2212." },
  { kind: "ac", name: "Fuente monof\xE1sica", family: "mando", prefix: "G", detail: "Fuente AC ideal, valores eficaces." },
  { kind: "threephase", name: "Fuente trif\xE1sica", family: "automatizacion", prefix: "G", detail: "Tres fases a 120\xB0, neutro y PE separado." },
  { kind: "earth", name: "Tierra de protecci\xF3n", family: "mando", prefix: "PE", detail: "Punto de protecci\xF3n; no se une a N autom\xE1ticamente." },
  { kind: "terminal", name: "Bornera de paso", family: "mando", prefix: "X", detail: "Dos bornes de una misma red." },
  { kind: "busbar", name: "Barra de distribuci\xF3n", family: "mando", prefix: "X", detail: "Cuatro puntos del mismo nodo." },
  { kind: "breaker", name: "Disyuntor de un polo", family: "mando", prefix: "Q", detail: "Maniobra manual ideal; sin curva de disparo." },
  { kind: "breaker2", name: "Disyuntor de dos polos", family: "mando", prefix: "Q", detail: "Apertura simult\xE1nea de ambos polos." },
  { kind: "breaker3", name: "Disyuntor de tres polos", family: "mando", prefix: "Q", detail: "Tres polos vinculados mec\xE1nicamente." },
  { kind: "fuse", name: "Portafusible", family: "mando", prefix: "FU", detail: "Inserta o extrae el cartucho; continuidad ideal." },
  { kind: "differential", name: "Diferencial did\xE1ctico", family: "mando", prefix: "ID", detail: "Maniobra y disparo de prueba; no calcula corriente residual." },
  { kind: "guard", name: "Guardamotor", family: "mando", prefix: "QM", detail: "Maniobra tripolar y disparo de pr\xE1ctica." },
  { kind: "thermal", name: "Rel\xE9 t\xE9rmico", family: "mando", prefix: "F", detail: "Tres v\xEDas de potencia y auxiliares 95\u201396/97\u201398. Disparo de pr\xE1ctica." },
  { kind: "contactor", name: "Contactor de potencia", family: "automatizacion", prefix: "K", detail: "Bobina A1\u2013A2, tres polos y auxiliares vinculados." },
  { kind: "aux-no", name: "Auxiliar NA", family: "mando", prefix: "K", detail: "Sigue al contactor con la misma designaci\xF3n." },
  { kind: "aux-nc", name: "Auxiliar NC", family: "mando", prefix: "K", detail: "Abre al actuar el contactor con la misma designaci\xF3n." },
  { kind: "push-no", name: "Pulsador NA", family: "mando", prefix: "S", detail: "Cierra mientras se mantiene pulsado." },
  { kind: "push-nc", name: "Pulsador NC", family: "mando", prefix: "S", detail: "Abre mientras se mantiene pulsado." },
  { kind: "emergency", name: "Parada de emergencia", family: "mando", prefix: "S", detail: "Enclavada: pulsa para abrir; vuelve a accionar para rearmar." },
  { kind: "selector", name: "Selector de dos posiciones", family: "mando", prefix: "SA", detail: "Conserva su posici\xF3n al soltar." },
  { kind: "lamp", name: "Piloto", family: "mando", prefix: "H", detail: "Se ilumina por tensi\xF3n entre sus dos bornes." },
  { kind: "buzzer", name: "Zumbador", family: "mando", prefix: "HA", detail: "Carga equivalente con se\xF1al visual de activaci\xF3n; sin audio autom\xE1tico." },
  { kind: "motor", name: "Motor monof\xE1sico", family: "automatizacion", prefix: "M", detail: "Carga resistiva equivalente; movimiento ilustrativo." },
  { kind: "motor3", name: "Motor trif\xE1sico de seis bornes", family: "automatizacion", prefix: "M", detail: "Cablea las bobinas y los puentes estrella/tri\xE1ngulo." },
  { kind: "plc", name: "PLC del proyecto", family: "automatizacion", prefix: "PLC", detail: "Q1\u2013Q4 siguen Q0.0\u2013Q0.3 del programa actual. Cada salida tiene su com\xFAn C." },
  { kind: "vfd", name: "Variador con entrada monof\xE1sica", family: "automatizacion", prefix: "VFD", detail: "Salida trif\xE1sica equivalente, consigna, rampa y sentido." },
  { kind: "vfd3", name: "Variador con entrada trif\xE1sica", family: "automatizacion", prefix: "VFD", detail: "Valida las tres fases y genera salida trif\xE1sica equivalente." },
  { kind: "softstart", name: "Arrancador suave trif\xE1sico", family: "automatizacion", prefix: "SS", detail: "Sube la tensi\xF3n del motor con una rampa, sin cambiar la frecuencia; al llegar al 100 % se puentea." },
  { kind: "voltmeter", name: "Volt\xEDmetro", family: "energia", prefix: "V", detail: "Mide tensi\xF3n eficaz o DC entre sus puntas." },
  { kind: "ammeter", name: "Amper\xEDmetro", family: "energia", prefix: "A", detail: "Se conecta en serie; shunt de medida idealizado." },
  { kind: "wattmeter", name: "Vat\xEDmetro", family: "energia", prefix: "W", detail: "I1\u2013I2 en serie; V+ y V\u2212 en paralelo a la carga." },
  { kind: "energy", name: "Medidor de energ\xEDa", family: "energia", prefix: "E", detail: "Integra potencia activa y tarifa durante el tiempo simulado." },
  { kind: "pv", name: "Panel fotovoltaico", family: "energia", prefix: "PV", detail: "Equivalente lineal dependiente de irradiancia; no es un modelo MPPT." },
  { kind: "battery", name: "Bater\xEDa", family: "energia", prefix: "BAT", detail: "Fuente con resistencia interna y SOC integrado por corriente." },
  { kind: "controller", name: "Controlador de carga", family: "energia", prefix: "CC", detail: "Conversi\xF3n DC idealizada con l\xEDmite de potencia y salida de carga." },
  { kind: "inverter", name: "Inversor DC/AC", family: "energia", prefix: "INV", detail: "Salida AC equivalente; consumo DC seg\xFAn la carga y eficiencia fija del modelo." },
  { kind: "micro300", name: "Microinversor 300 W", family: "energia", prefix: "MI", detail: "Inyecci\xF3n idealizada: requiere panel DC y red AC presentes." },
  { kind: "micro600", name: "Microinversor 600 W", family: "energia", prefix: "MI", detail: "Inyecci\xF3n idealizada limitada a 600 W." },
  { kind: "micro1200", name: "Microinversor 1200 W", family: "energia", prefix: "MI", detail: "Inyecci\xF3n idealizada limitada a 1200 W." },
  { kind: "dcdc", name: "Regulador DC/DC", family: "energia", prefix: "DC", detail: "Salida DC regulada equivalente." },
  { kind: "rail", name: "Riel DIN", family: "mando", prefix: "DIN", detail: "Soporte visual; no crea conexiones el\xE9ctricas." },
  { kind: "text", name: "R\xF3tulo de montaje", family: "mando", prefix: "TXT", detail: "Anotaci\xF3n independiente del circuito." }
];
var key = (end) => `${end.part}:${end.port}`;
var defaults = (kind) => ({ voltage: kind === "ac" || kind === "vfd" || kind === "motor" ? 230 : kind === "threephase" || kind === "vfd3" || kind === "softstart" || kind === "motor3" ? 400 : kind === "pv" ? 36 : 24, power: kind === "micro1200" ? 1200 : kind === "micro600" ? 600 : kind === "inverter" ? 1e3 : kind === "motor3" ? 1500 : kind === "pv" || kind === "micro300" ? 300 : kind === "lamp" ? 2 : kind === "buzzer" ? 1 : 100, current: 10, capacity: 100, soc: 50, irradiance: 1e3, frequency: 50, target: 30, ramp: 3, poles: 4, tariff: 0, text: kind === "text" ? "Mi montaje" : "" });
function dimensions(kind) {
  if (kind === "rail") return { w: 270, h: 44 };
  if (kind === "text") return { w: 190, h: 50 };
  if (kind === "plc") return { w: 260, h: 156 };
  if (["contactor", "thermal", "vfd", "vfd3", "softstart", "controller"].includes(kind)) return { w: 180, h: 178 };
  if (["inverter", "micro300", "micro600", "micro1200", "dcdc", "pv", "battery", "motor3"].includes(kind)) return { w: 166, h: 150 };
  return { w: 116, h: 126 };
}
function rows(top, bottom, w, h) {
  return [...top.map((id, i) => ({ id, x: (i + 1) * w / (top.length + 1), y: 0 })), ...bottom.map((id, i) => ({ id, x: (i + 1) * w / (bottom.length + 1), y: h }))];
}
function ports(kind) {
  const { w, h } = dimensions(kind);
  switch (kind) {
    case "rail":
    case "text":
      return [];
    case "dc":
    case "battery":
    case "pv":
      return rows([], ["+", "\u2212"], w, h);
    case "ac":
      return rows([], ["L", "N", "PE"], w, h);
    case "threephase":
      return rows([], ["L1", "L2", "L3", "N", "PE"], w, h);
    case "earth":
      return [{ id: "PE", x: w / 2, y: 0 }];
    case "busbar":
      return rows(["1", "2"], ["3", "4"], w, h);
    case "breaker2":
    case "differential":
      return rows(["1", "3"], ["2", "4"], w, h);
    case "breaker3":
    case "guard":
      return rows(["1", "3", "5"], ["2", "4", "6"], w, h);
    case "thermal":
      return [...rows(["L1", "L2", "L3"], ["T1", "T2", "T3"], w, h), { id: "95", x: 0, y: 65 }, { id: "96", x: 0, y: 110 }, { id: "97", x: w, y: 65 }, { id: "98", x: w, y: 110 }];
    case "contactor":
      return [...rows(["L1", "L2", "L3"], ["T1", "T2", "T3"], w, h), { id: "A1", x: 0, y: 40 }, { id: "A2", x: 0, y: 140 }, { id: "13", x: w, y: 32 }, { id: "14", x: w, y: 66 }, { id: "21", x: w, y: 110 }, { id: "22", x: w, y: 144 }];
    case "plc":
      return rows(["L+", "M", "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"], ["C1", "Q1", "C2", "Q2", "C3", "Q3", "C4", "Q4"], w, h);
    case "softstart":
      return [...rows(["L1", "L2", "L3", "PE"], ["T1", "T2", "T3", "PEo"], w, h), { id: "24", x: w, y: 45 }, { id: "DI1", x: w, y: 80 }, { id: "COM", x: w, y: 145 }];
    case "vfd":
    case "vfd3":
      return [...rows(kind === "vfd" ? ["L", "N", "PE"] : ["L1", "L2", "L3", "PE"], ["U", "V", "W", "PEo"], w, h), { id: "24", x: w, y: 45 }, { id: "DI1", x: w, y: 80 }, { id: "DI2", x: w, y: 115 }, { id: "COM", x: w, y: 145 }];
    case "motor3":
      return rows(["U1", "V1", "W1"], ["W2", "U2", "V2", "PE"], w, h);
    case "motor":
      return rows(["L", "N"], ["PE"], w, h);
    case "controller":
      return rows(["PV+", "PV\u2212"], ["BAT+", "BAT\u2212", "LOAD+", "LOAD\u2212"], w, h);
    case "inverter":
    case "micro300":
    case "micro600":
    case "micro1200":
      return rows(["DC+", "DC\u2212"], ["L", "N", "PE"], w, h);
    case "dcdc":
      return rows(["IN+", "IN\u2212"], ["OUT+", "OUT\u2212"], w, h);
    case "wattmeter":
    case "energy":
      return rows(["I1", "I2"], ["V+", "V\u2212"], w, h);
    case "voltmeter":
      return rows([], ["V+", "V\u2212"], w, h);
    case "ammeter":
      return rows(["A1"], ["A2"], w, h);
    case "aux-no":
      return rows(["13"], ["14"], w, h);
    case "aux-nc":
      return rows(["21"], ["22"], w, h);
    case "push-no":
    case "selector":
      return rows(["3"], ["4"], w, h);
    default:
      return rows(["1"], ["2"], w, h);
  }
}
function parseBoard(raw) {
  if (typeof raw !== "object" || raw === null) throw new Error("Montaje de equipos inv\xE1lido.");
  const b = raw;
  if (b.version !== 1 || !Array.isArray(b.parts) || !Array.isArray(b.wires) || b.parts.length > 80 || b.wires.length > 400) throw new Error("Montaje de equipos incompatible.");
  const string = (v, max) => {
    if (typeof v !== "string" || !v.length || v.length > max) throw new Error("Texto de equipo inv\xE1lido.");
    return v;
  };
  const numeric = (v, min, max) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw new Error("Par\xE1metro de equipo fuera de rango.");
    return v;
  };
  const ranges = { voltage: [1, 690], power: [0.1, 2e4], current: [0.01, 1e3], capacity: [0.01, 1e4], soc: [0, 100], irradiance: [0, 1200], frequency: [1, 100], target: [0, 100], ramp: [0.1, 120], poles: [2, 12], tariff: [0, 1e6] };
  const parts = b.parts.map((value) => {
    if (typeof value !== "object" || value === null) throw new Error("Equipo inv\xE1lido.");
    const p = value, kind = string(p.kind, 40);
    if (!CATALOG.some((d) => d.kind === kind) || typeof p.closed !== "boolean" || typeof p.params !== "object" || p.params === null) throw new Error("Tipo o estado de equipo inv\xE1lido.");
    const params = { ...defaults(kind) }, source = p.params;
    for (const [k, range] of Object.entries(ranges)) params[k] = numeric(source[k], ...range);
    if (![2, 4, 6, 8, 10, 12].includes(params.poles)) throw new Error("N\xFAmero de polos inv\xE1lido.");
    if ((kind === "vfd" || kind === "vfd3") && params.target > params.frequency) throw new Error("La consigna del variador supera la frecuencia nominal.");
    if (typeof source.text !== "string" || source.text.length > 160) throw new Error("R\xF3tulo inv\xE1lido.");
    params.text = source.text;
    return { id: string(p.id, 100), kind, tag: string(p.tag, 32), x: numeric(p.x, 20, 2200), y: numeric(p.y, 35, 1400), closed: p.closed, params };
  });
  const ids = new Set(parts.map((p) => p.id));
  if (ids.size !== parts.length) throw new Error("Identidades de equipos duplicadas.");
  const end = (v) => {
    if (typeof v !== "object" || v === null) throw new Error("Terminal inv\xE1lido.");
    const e = v, part = parts.find((p) => p.id === e.part);
    if (!part || !ports(part.kind).some((p) => p.id === e.port)) throw new Error("Cable de equipo con borne inexistente.");
    return { part: part.id, port: e.port };
  };
  const wires = b.wires.map((v) => {
    if (typeof v !== "object" || v === null) throw new Error("Cable inv\xE1lido.");
    const w = v;
    if (w.route !== void 0 && !["power", "control", "pe"].includes(String(w.route))) throw new Error("Canalizaci\xF3n de cable inv\xE1lida.");
    let via;
    if (w.via !== void 0) {
      if (typeof w.via !== "object" || w.via === null) throw new Error("Recorrido de cable inv\xE1lido.");
      const p = w.via;
      via = { x: numeric(p.x, 20, 2380), y: numeric(p.y, 20, 1630) };
    }
    return { id: string(w.id, 100), from: end(w.from), to: end(w.to), ...w.label === void 0 ? {} : { label: string(w.label, 24) }, ...w.route === void 0 ? {} : { route: w.route }, ...via ? { via } : {} };
  });
  const pairs = wires.map((w) => [key(w.from), key(w.to)].sort().join("|"));
  if (new Set(wires.map((w) => w.id)).size !== wires.length || new Set(pairs).size !== pairs.length || wires.some((w) => key(w.from) === key(w.to))) throw new Error("Cables de equipo duplicados.");
  return { version: 1, parts, wires, ...b.cabinet === void 0 ? {} : { cabinet: parseCabinet(b.cabinet) } };
}
function parseCabinet(raw) {
  const object2 = (v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Datos del taller inv\xE1lidos.");
    return v;
  };
  const text2 = (v, max) => {
    if (typeof v !== "string" || v.length > max) throw new Error("Texto del taller inv\xE1lido.");
    return v;
  };
  const choice = (v, values) => {
    if (!values.includes(v)) throw new Error("Estado del taller desconocido.");
    return v;
  };
  const flag = (v) => {
    if (typeof v !== "boolean") throw new Error("Comprobaci\xF3n del taller inv\xE1lida.");
    return v;
  };
  const c = object2(raw), r = object2(c.roles), f = object2(c.fixtures), roles = {};
  if (c.version !== 1 || !["pump-direct", "pump-plc", "pump-relay"].includes(String(c.scenario))) throw new Error("Versi\xF3n del taller incompatible.");
  for (const role of PUMP_ROLES) {
    roles[role] = text2(r[role], 100);
    if (!roles[role]) throw new Error("Identidad del taller vac\xEDa.");
  }
  if (new Set(Object.values(roles)).size !== PUMP_ROLES.length) throw new Error("Identidades del taller duplicadas.");
  const controllerRoles = roles;
  if (c.scenario !== "pump-direct") for (const name of ["plc", "permit"]) {
    controllerRoles[name] = text2(r[name], 100);
    if (!controllerRoles[name] || Object.values(controllerRoles).filter((id) => id === controllerRoles[name]).length > 1) throw new Error("Identidad de controlador inv\xE1lida.");
  }
  const faults = ["return", "holding", "phase", "earth", "program"], probes = ["coil", "retention", "windings", "pe"];
  const size = (v, min, max) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw new Error("Medida del espacio de montaje inv\xE1lida.");
    return v;
  };
  let area;
  if (c.area !== void 0) {
    const a = object2(c.area);
    area = { width: size(a.width, 400, 900), height: size(a.height, 400, 780) };
  }
  const hardware = (raw2, duct) => {
    if (!Array.isArray(raw2) || raw2.length > 8) throw new Error("Soportes del gabinete inv\xE1lidos.");
    const items = raw2.map((v) => {
      const item = object2(v);
      return { id: text2(item.id, 40), x: size(item.x, 157, 1057), y: size(item.y, 218, 998), width: size(item.width, 24, 900), ...duct ? { height: size(item.height, 24, 780) } : {} };
    });
    if (new Set(items.map((i) => i.id)).size !== items.length) throw new Error("Soportes del gabinete duplicados.");
    return items;
  };
  const rails = c.rails === void 0 ? void 0 : hardware(c.rails, false), ducts = c.ducts === void 0 ? void 0 : hardware(c.ducts, true);
  const repair = (v) => {
    const i = object2(v);
    return { kind: choice(i.kind, faults), probe: choice(i.probe, probes), at: text2(i.at, 40) };
  };
  if (!Array.isArray(c.repairs) || c.repairs.length > 20) throw new Error("Bit\xE1cora del taller inv\xE1lida.");
  let test;
  if (c.test !== void 0) {
    const t = object2(c.test);
    if (!Array.isArray(t.results) || t.results.length > 12) throw new Error("Prueba del taller inv\xE1lida.");
    test = { signature: text2(t.signature, 32), at: text2(t.at, 40), results: t.results.map((v) => {
      const item = object2(v);
      return { id: text2(item.id, 40), pass: flag(item.pass), detail: text2(item.detail, 240) };
    }) };
  }
  let fault;
  if (c.fault !== void 0) {
    const item = object2(c.fault);
    fault = { kind: choice(item.kind, faults), ...item.probe === void 0 ? {} : { probe: choice(item.probe, probes) }, ...item.answer === void 0 ? {} : { answer: choice(item.answer, faults) } };
  }
  return { version: 1, ...c.layout === "compact" ? { layout: "compact" } : {}, scenario: c.scenario, roles: controllerRoles, step: choice(c.step, ["brief", "mount", "wire", "program", "verify", "test", "diagnose"]), fixtures: { rail: flag(f.rail), duct: flag(f.duct), bond: flag(f.bond) }, ...area ? { area } : {}, ...rails ? { rails } : {}, ...ducts ? { ducts } : {}, understood: flag(c.understood), notes: text2(c.notes, 2e3), repairs: c.repairs.map(repair), ...test ? { test } : {}, ...fault ? { fault } : {} };
}

// src/lab/validation.ts
var MAX_IMPORT_BYTES = 2 * 1024 * 1024;
var object = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function requireObject(value, label) {
  if (!object(value)) throw new Error(`${label}: se esperaba un objeto.`);
  return value;
}
function text(value, label, max = 200) {
  if (typeof value !== "string" || value.length > max) throw new Error(`${label}: texto inv\xE1lido.`);
  return value;
}
function num(value, label, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error(`${label}: valor fuera de rango (${min}\u2013${max}).`);
  return value;
}
function bool(value, label) {
  if (typeof value !== "boolean") throw new Error(`${label}: valor booleano inv\xE1lido.`);
  return value;
}
function list(value, label, max = 128) {
  if (!Array.isArray(value) || value.length > max) throw new Error(`${label}: lista inv\xE1lida o demasiado grande.`);
  return value;
}
function unique(items, label) {
  if (items.some((x) => !x.id) || new Set(items.map((x) => x.id)).size !== items.length) throw new Error(`${label}: identidades vac\xEDas o duplicadas.`);
}
function address(value, label) {
  const s = text(value, label, 32);
  if (!addressOK(s)) throw new Error(`${label}: direcci\xF3n no admitida.`);
  return s;
}
function hole(value) {
  const s = text(value, "Orificio", 24);
  if (!HOLE_BY_ID.has(s)) throw new Error(`Orificio desconocido: ${s}`);
  return s;
}
function polarity(value, kind) {
  if (value !== "pnp" || kind !== "bjt") throw new Error("Polaridad de transistor no admitida.");
  return "pnp";
}
function measurements(value) {
  const items = list(value, "Mediciones", 200).map((v) => {
    const m = requireObject(v, "Medici\xF3n"), kind = text(m.kind, "Tipo de medici\xF3n", 16);
    if (!["voltage", "current", "resistance", "continuity"].includes(kind)) throw new Error("Tipo de medici\xF3n desconocido.");
    return { id: text(m.id, "ID", 64), kind, a: hole(m.a), b: hole(m.b), value: m.value === null ? null : num(m.value, "Valor medido", -1e9, 1e9), label: text(m.label, "Descripci\xF3n", 120), at: text(m.at, "Fecha", 40), ...m.sourceVoltage === void 0 ? {} : { sourceVoltage: num(m.sourceVoltage, "Tensi\xF3n aplicada", 0, 30) } };
  });
  unique(items, "Mediciones");
  return items;
}
function parseProject(value) {
  try {
    let end2 = function(v) {
      const e = requireObject(v, "Terminal");
      const device = text(e.device, "Dispositivo");
      if (!ids.has(device) || !(e.pin === 0 || e.pin === 1)) throw new Error("Cable con terminal inexistente.");
      return { device, pin: e.pin };
    };
    var end = end2;
    const p = requireObject(value, "Proyecto");
    if (p.format !== "panellab-laboratory" || p.version !== 1 && p.version !== 2) throw new Error("Archivo incompatible. Abre un proyecto de Laboratorio modo. (versi\xF3n 1 o 2).");
    const schema = requireObject(p.schematic, "Esquema"), plc = requireObject(p.plc, "PLC"), hmi = requireObject(p.hmi, "HMI"), process = requireObject(p.process, "Proceso"), board = requireObject(p.breadboard, "Protoboard");
    const devices = list(schema.devices, "Dispositivos").map((v) => {
      const d = requireObject(v, "Dispositivo");
      const kind = text(d.kind, "Tipo");
      if (!DEVICES.some((x) => x.kind === kind)) throw new Error("Tipo de dispositivo desconocido.");
      return { id: text(d.id, "ID"), kind, tag: text(d.tag, "Designaci\xF3n", 32), x: num(d.x, "Posici\xF3n X", 30, 850), y: num(d.y, "Posici\xF3n Y", 40, 580), signal: d.signal === "" ? "" : address(d.signal, "Se\xF1al"), ...d.closed === void 0 ? {} : { closed: bool(d.closed, "Posici\xF3n inicial") } };
    });
    unique(devices, "Dispositivos");
    if (devices.filter((d) => d.kind === "supply").length > 1) throw new Error("Esta versi\xF3n admite una fuente de mando por esquema.");
    const ids = new Set(devices.map((d) => d.id));
    const wires = list(schema.wires, "Cables", 512).map((v) => {
      const w = requireObject(v, "Cable");
      return { id: text(w.id, "ID"), from: end2(w.from), to: end2(w.to) };
    });
    unique(wires, "Cables");
    const pairs = wires.map((w) => [pinKey(w.from), pinKey(w.to)].sort().join("|"));
    if (new Set(pairs).size !== pairs.length || wires.some((w) => pinKey(w.from) === pinKey(w.to))) throw new Error("Hay cables duplicados o conectados al mismo terminal.");
    const tags = list(plc.tags, "Variables", 128).map((v) => {
      const t = requireObject(v, "Variable");
      if (t.type !== "bool" && t.type !== "number") throw new Error("Tipo de variable desconocido.");
      return { address: address(t.address, "Variable"), name: text(t.name, "Nombre", 80), type: t.type, initial: t.type === "bool" ? bool(t.initial, "Valor inicial") : num(t.initial, "Valor inicial", -1e9, 1e9) };
    });
    if (new Set(tags.map((t) => t.address)).size !== tags.length) throw new Error("Hay direcciones de PLC duplicadas.");
    const tagMap = new Map(tags.map((t) => [t.address, t]));
    const rungs = list(plc.rungs, "Segmentos").map((v) => {
      const r = requireObject(v, "Segmento");
      const mode = text(r.mode, "Instrucci\xF3n");
      if (!["coil", "set", "reset", "ton", "tof", "ctu"].includes(mode)) throw new Error("Instrucci\xF3n desconocida.");
      return { id: text(r.id, "ID"), comment: text(r.comment, "Comentario", 500), branches: list(r.branches, "Ramas", 32).map((b) => list(b, "Contactos", 32).map((v2) => {
        const c = requireObject(v2, "Contacto");
        return { address: text(c.address, "Direcci\xF3n de contacto", 32), negated: bool(c.negated, "Contacto NC") };
      })), output: text(r.output, "Direcci\xF3n de salida", 32), mode, preset: num(r.preset, "Ajuste", 1e-3, 1e6) };
    });
    unique(rungs, "Segmentos");
    if (plc.language !== "ladder" && plc.language !== "st") throw new Error("Lenguaje desconocido.");
    const widgets = list(hmi.widgets, "Widgets").map((v) => {
      const w = requireObject(v, "Widget");
      const kind = text(w.kind, "Widget");
      if (!["toggle", "lamp", "number", "bar"].includes(kind)) throw new Error("Widget desconocido.");
      return { id: text(w.id, "ID"), kind, label: text(w.label, "Etiqueta", 80), address: address(w.address, "Se\xF1al HMI"), x: num(w.x, "Posici\xF3n X", 0, 650), y: num(w.y, "Posici\xF3n Y", 0, 460), max: num(w.max, "Escala", 1e-3, 1e9) };
    });
    unique(widgets, "Widgets");
    for (const w of widgets) {
      const tag = tagMap.get(w.address);
      if (!tag || (["toggle", "lamp"].includes(w.kind) ? tag.type !== "bool" : tag.type !== "number")) throw new Error("Un widget HMI tiene una se\xF1al inexistente o de tipo incompatible.");
    }
    const capacity = num(process.capacity, "Capacidad", 1, 1e6), low = num(process.low, "Nivel bajo", 0, 100), high = num(process.high, "Nivel alto", 0, 100);
    if (low >= high) throw new Error("El nivel bajo debe ser menor que el nivel alto.");
    const processSignals = { pumpSignal: address(process.pumpSignal, "Se\xF1al bomba"), lowSignal: address(process.lowSignal, "Se\xF1al nivel bajo"), highSignal: address(process.highSignal, "Se\xF1al nivel alto"), levelSignal: address(process.levelSignal, "Se\xF1al anal\xF3gica") };
    for (const [key2, signal] of Object.entries(processSignals)) {
      if (tagMap.get(signal)?.type !== (key2 === "levelSignal" ? "number" : "bool")) throw new Error("Se\xF1al de proceso inexistente o incompatible.");
    }
    if (new Set(Object.values(processSignals)).size !== 4) throw new Error("Las se\xF1ales de proceso deben ser diferentes.");
    const components = list(board.components, "Componentes de protoboard", 128).map((v) => {
      const c = requireObject(v, "Componente");
      const kind = text(c.kind, "Componente");
      if (!["wire", "resistor", "led", "switch", "button", "motor", "l293d", "bjt", "diode"].includes(kind)) throw new Error("Componente de protoboard desconocido.");
      const color = text(c.color, "Color", 20);
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Color inv\xE1lido.");
      return { id: text(c.id, "ID"), kind, from: hole(c.from), to: hole(c.to), value: num(c.value, "Valor", kind === "resistor" || kind === "motor" ? 1 : kind === "led" || kind === "diode" ? 0.1 : kind === "bjt" ? 10 : 0, kind === "resistor" ? 1e7 : kind === "motor" ? 1e4 : kind === "led" ? 5 : kind === "diode" ? 2 : kind === "bjt" ? 1e3 : 1e7), closed: bool(c.closed, "Interruptor"), color, ...c.polarity === void 0 ? {} : { polarity: polarity(c.polarity, kind) } };
    });
    unique(components, "Protoboard");
    for (const c of components) if (c.kind === "bjt" && !bjtBase(c.from, c.to)) throw new Error("El transistor debe ocupar tres orificios seguidos de una misma fila (emisor, base y colector).");
    for (const c of components) if (c.kind === "l293d" && icTo(c.from) !== c.to) throw new Error("El L293D debe empezar en la fila f (columnas 1 a 23) y terminar siete columnas a la derecha, en la fila e.");
    const project = { format: "panellab-laboratory", version: 2, id: text(p.id, "ID de proyecto"), name: text(p.name, "Nombre", 100), schematic: { devices, wires }, ...p.equipment === void 0 ? {} : { equipment: parseBoard(p.equipment) }, plc: { language: plc.language, tags, rungs, source: text(plc.source, "Fuente ST", 5e4) }, hmi: { widgets }, process: { capacity, initialLevel: num(process.initialLevel, "Nivel inicial", 0, 100), inflow: num(process.inflow, "Caudal de entrada", 0, 1e4), outflow: num(process.outflow, "Caudal de salida", 0, 1e4), low, high, ...processSignals }, breadboard: { ...board.power === void 0 ? {} : { power: (() => {
      const p2 = requireObject(board.power, "Alimentaci\xF3n de protoboard");
      return { plugged: bool(p2.plugged, "Enchufe"), enabled: bool(p2.enabled, "Salida DC"), redConnected: bool(p2.redConnected, "Cable positivo"), blackConnected: bool(p2.blackConnected, "Cable negativo") };
    })() }, voltage: num(board.voltage, "Fuente DC", 0.1, 30), positive: hole(board.positive), negative: hole(board.negative), components, ...board.realistic === void 0 ? {} : { realistic: bool(board.realistic, "Valores reales") }, ...board.log === void 0 ? {} : { log: measurements(board.log) }, ...board.notes === void 0 ? {} : { notes: text(board.notes, "Conclusiones", 2e3) } } };
    return { ok: true, project };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo leer el proyecto." };
  }
}

// src/lab/breadboardFaults.ts
var EPS = 5e-3;
function inspectBridge(board) {
  const motors = board.components.filter((c) => c.kind === "motor"), buttons = board.components.filter((c) => c.kind === "button");
  if (board.components.filter((c) => c.kind === "bjt").length < 4 || motors.length !== 1 || buttons.length !== 2) return { ok: false, message: "Arma un puente H con cuatro transistores, un motor y dos pulsadores antes de iniciar la prueba." };
  if (Object.keys(crowdedHoles(board.components)).length) return { ok: false, message: "Primero corrige las patas que comparten un mismo orificio." };
  const values = [];
  for (const which of [-1, 0, 1]) {
    const r = solveBreadboard(board, Object.fromEntries(buttons.map((c, i) => [c.id, i === which])), { failures: true }), amps = r.amps[motors[0].id] ?? 0;
    if (r.fault || r.tripped || Object.keys(r.failures).length) return { ok: false, message: "El montaje de referencia presenta una falla o sobreesfuerzo. Corr\xEDgelo antes de introducir una aver\xEDa de prueba." };
    if (which === -1 && Math.abs(amps) > EPS) return { ok: false, message: "El motor de referencia debe quedar detenido con ambos pulsadores sueltos." };
    if (which >= 0) values.push(amps);
  }
  if (values.some((a) => Math.abs(a) < EPS) || values[0] * values[1] >= 0) return { ok: false, message: "Primero comprueba que cada pulsador haga circular corriente por el motor en un sentido distinto." };
  return { ok: true, bridge: { motor: motors[0].id, buttons: [buttons[0].id, buttons[1].id], currents: values } };
}
function applyWireFault(reference, fault) {
  return { ...structuredClone(reference), power: { ...reference.power ?? { plugged: false, redConnected: false, blackConnected: false }, enabled: false }, components: reference.components.flatMap((c) => c.id !== fault.wireId ? [structuredClone(c)] : fault.kind === "remove" ? [] : [{ ...c, from: fault.newFrom ?? c.from, to: fault.newTo ?? c.to }]) };
}
function observableFault(board, bridge) {
  let changed = false;
  for (const which of [-1, 0, 1]) {
    const r = solveBreadboard(board, Object.fromEntries(bridge.buttons.map((id, i) => [id, i === which])), { failures: true });
    if (r.fault || r.tripped || Object.keys(r.failures).length) return false;
    const amps = r.amps[bridge.motor] ?? 0;
    if (which === -1 && Math.abs(amps) > EPS) return false;
    if (which >= 0 && Math.abs(amps - bridge.currents[which]) > Math.max(EPS, Math.abs(bridge.currents[which]) * 0.15)) changed = true;
  }
  return changed;
}
function createWireFault(board, mode, seed) {
  const valid = inspectBridge(board);
  if (!valid.ok) return valid;
  const wires = board.components.filter((c) => c.kind === "wire"), used = new Set(board.components.flatMap(componentHoles)), groups = netGroups(board);
  used.add(board.positive);
  used.add(board.negative);
  const offset = Math.abs(Math.floor(seed)) % Math.max(1, wires.length), ordered = [...wires.slice(offset), ...wires.slice(0, offset)];
  const kinds = mode === "surprise" ? seed % 2 ? ["move", "remove"] : ["remove", "move"] : [mode];
  for (const kind of kinds) for (const wire of ordered) {
    const base = { kind, wireId: wire.id, from: wire.from, to: wire.to };
    if (kind === "remove") {
      const changed = applyWireFault(board, base);
      if (observableFault(changed, valid.bridge)) return { ok: true, fault: base, board: changed, bridge: valid.bridge };
      continue;
    }
    for (const end of ["from", "to"]) {
      const original = HOLE_BY_ID.get(wire[end]);
      if (!original) continue;
      const candidates = HOLES.filter((h) => !used.has(h.id) && groups[h.id] !== groups[original.id] && Math.abs(h.x - original.x) <= 48 && Math.abs(h.y - original.y) <= 60).sort((a, b) => Math.hypot(a.x - original.x, a.y - original.y) - Math.hypot(b.x - original.x, b.y - original.y));
      for (const hole2 of candidates.slice(0, 6)) {
        const fault = { ...base, [end === "from" ? "newFrom" : "newTo"]: hole2.id }, changed = applyWireFault(board, fault);
        if (observableFault(changed, valid.bridge)) return { ok: true, fault, board: changed, bridge: valid.bridge };
      }
    }
  }
  return { ok: false, message: "No se encontr\xF3 una alteraci\xF3n de este tipo que cambie el funcionamiento sin provocar da\xF1os en el modelo. Prueba otro tipo de fallo." };
}
var partition = (board) => {
  const groups = netGroups(board), nets = /* @__PURE__ */ new Map();
  for (const h of HOLES) {
    const root = groups[h.id];
    nets.set(root, [...nets.get(root) ?? [], h.id]);
  }
  return [...nets.values()].map((ids) => ids.sort().join("|")).sort().join(";");
};
var partSignature = (c) => JSON.stringify([c.id, c.kind, c.value, c.polarity ?? null, c.closed, componentHoles(c).map((id) => HOLE_BY_ID.get(id)?.group)]);
function checkWireRepair(current, reference) {
  if (Object.keys(crowdedHoles(current.components)).length) return { ok: false, message: "Hay patas compartiendo orificio. Corrige esa ocupaci\xF3n antes de comprobar." };
  const a = current.components.filter((c) => c.kind !== "wire").map(partSignature).sort(), b = reference.components.filter((c) => c.kind !== "wire").map(partSignature).sort();
  if (JSON.stringify(a) !== JSON.stringify(b) || current.voltage !== reference.voltage || HOLE_BY_ID.get(current.positive)?.group !== HOLE_BY_ID.get(reference.positive)?.group || HOLE_BY_ID.get(current.negative)?.group !== HOLE_BY_ID.get(reference.negative)?.group) return { ok: false, message: "Se han cambiado componentes, valores o alimentaci\xF3n respecto a tu referencia. Revisa esos cambios antes de validar la reparaci\xF3n." };
  if (partition(current) !== partition(reference)) return { ok: false, message: "Las conexiones a\xFAn no recuperan las redes de tu montaje original. Sigue el recorrido con continuidad y revisa d\xF3nde acaba cada puente." };
  const functional = inspectBridge(current);
  if (!functional.ok) return functional;
  return { ok: true, message: "Reparaci\xF3n comprobada: conexiones equivalentes a tu referencia y corriente del motor en ambos sentidos. No se ha instalado ning\xFAn cable autom\xE1ticamente." };
}
function readFaultSession(raw, projectId) {
  if (!raw) return null;
  const s = JSON.parse(raw);
  if (!s || s.version !== 1 || s.projectId !== projectId || !s.reference || !s.fault || !["remove", "move"].includes(s.fault.kind) || !Number.isInteger(s.attempts) || s.attempts < 0 || s.attempts > 1e5 || ![0, 1, 2].includes(s.hints) || typeof s.solved !== "boolean" || s.restored !== void 0 && typeof s.restored !== "boolean" || typeof s.notes !== "string" || s.notes.length > 4e3 || typeof s.createdAt !== "string") throw Error("Prueba guardada incompatible. Se conserva sin sobrescribir.");
  const parsed = parseProject({ ...newProject("blank"), breadboard: s.reference });
  if (!parsed.ok) throw Error("Referencia guardada no v\xE1lida. Se conserva sin sobrescribir.");
  const valid = inspectBridge(parsed.project.breadboard), wire = parsed.project.breadboard.components.find((c) => c.kind === "wire" && c.id === s.fault.wireId);
  if (!valid.ok || !wire || wire.from !== s.fault.from || wire.to !== s.fault.to || [s.fault.newFrom, s.fault.newTo].some((h) => h !== void 0 && !HOLE_BY_ID.has(h))) throw Error("La referencia de la prueba no coincide con el fallo guardado.");
  if (!observableFault(applyWireFault(parsed.project.breadboard, s.fault), valid.bridge)) throw Error("El fallo guardado no produce una alteraci\xF3n comprobable.");
  return { ...s, reference: parsed.project.breadboard, bridge: valid.bridge };
}
export {
  DEFAULT_BOARD_POWER,
  DEVICES,
  HOLES,
  HOLE_BY_ID,
  IC_PIN_NAMES,
  Nets,
  SOURCE_LIMIT,
  TOOLS,
  TOOL_GROUPS,
  actualValue,
  addressOK,
  applyWireFault,
  bjtBase,
  boardPowered,
  buttonPins,
  checkWireRepair,
  componentHoles,
  createWireFault,
  crowdedHoles,
  deviceClosed,
  devicePinLabel,
  devicePinOffset,
  holeName,
  icPinHoles,
  icTo,
  initialControlClosed,
  initialMemory,
  inspectBridge,
  isMaintainedControl,
  joinBoardParts,
  junctionCurrent,
  measureResistance,
  netGroups,
  newProject,
  parseHoleId,
  pinKey,
  readFaultSession,
  relocate,
  solveBreadboard,
  solveDC,
  uid,
  verticalDevice
};
