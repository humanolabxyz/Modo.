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
  const names2 = { supply: ["+", "\u2212"], coil: ["A1", "A2"], contact: ["13", "14"], "contact-nc": ["21", "22"], nc: ["1", "2"], emergency: ["1", "2"], no: ["3", "4"], selector: ["3", "4"], buzzer: ["+", "\u2212"] };
  return (names2[kind] ?? ["1", "2"])[pin];
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
  for (const hole of HOLES) nets.join(hole.id, hole.group);
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
    const first = result, level = (hole) => first.volts[nets.find(hole)];
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
  const voltOf = (hole) => result.volts[nets.find(hole)];
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
  for (const hole of HOLES) nets.join(hole.id, hole.group);
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
  for (const hole of HOLES) nets.join(hole.id, hole.group);
  joinBoardParts(nets, board.components, switches);
  return Object.fromEntries(HOLES.map((h) => [h.id, nets.find(h.id)]));
}
function holeName(id) {
  return HOLE_BY_ID.has(id) ? id.replace(":", "").replace("top+", "+ superior ").replace("top-", "\u2212 superior ").replace("bottom+", "+ inferior ").replace("bottom-", "\u2212 inferior ") : id;
}

// src/lab/breadboardFloatingDiagnostics.ts
var names = { wire: "Puente", resistor: "Resistencia", led: "LED", diode: "Diodo", motor: "Motor", bjt: "Transistor", switch: "Interruptor", button: "Pulsador", l293d: "L293D" };
function floatingDiagnostics(board, result, switches = {}) {
  return [...new Set(result.floating)].map((id) => {
    const locations = [], holeIds = [];
    const nearby = board.components.filter((c) => componentHoles(c).some((h) => result.groups[h] === id));
    for (const c of nearby) {
      const pins = componentHoles(c);
      pins.forEach((hole, i) => {
        if (result.groups[hole] !== id) return;
        holeIds.push(hole);
        if (c.kind === "wire") return;
        const pin = c.kind === "bjt" ? ["E", "B", "C"][i] : c.kind === "l293d" ? `${IC_PIN_NAMES[i]} (${i + 1})` : c.kind === "motor" ? ["borne 1", "borne 2"][i] : c.kind === "led" || c.kind === "diode" ? ["\xE1nodo", "c\xE1todo"][i] : `pata ${i + 1}`;
        locations.push({ componentId: c.id, label: c.kind === "bjt" ? c.polarity === "pnp" ? "2N2907 \xB7 PNP" : "2N2222 \xB7 NPN" : names[c.kind], hole, pin });
      });
    }
    const off = nearby.filter((c) => c.kind === "bjt" && result.bjts[c.id]?.region === "corte");
    const openControls = nearby.filter((c) => (c.kind === "button" || c.kind === "switch") && !(switches[c.id] ?? (c.kind === "button" ? false : c.closed)));
    const switchingState = off.length > 0 || openControls.length > 0;
    const reference = locations[0]?.hole ?? holeIds[0];
    return {
      id,
      title: `Grupo sin referencia${reference ? " \xB7 " + holeName(reference) : ""}`,
      locations,
      holeIds: [...new Set(holeIds)],
      switchingState,
      cause: switchingState ? `Este grupo no tiene un camino conductor hacia una referencia de la fuente. ${off.length ? "Hay transistores conectados a \xE9l que est\xE1n en corte." : "Hay pulsadores o interruptores conectados a \xE9l que est\xE1n abiertos."} En una salida de puente H detenida puede ser un estado esperado; este aviso por s\xED solo no demuestra un cable faltante.` : "El c\xE1lculo no encuentra un camino conductor entre este grupo y una referencia de la fuente. Su tensi\xF3n respecto al negativo no queda determinada.",
      review: switchingState ? "Comprueba las patas indicadas y el mando que debe activar esta rama. En un puente H prueba un sentido a la vez y observa si el grupo adquiere referencia. No a\xF1adas un puente al negativo solo para quitar el aviso." : "Con la fuente detenida, sigue los puentes de los puntos indicados y comprueba alimentaci\xF3n, retorno e interruptores seg\xFAn tu esquema. Revisa si el recorrido cruza el corte de los rieles entre 15 y 16."
    };
  }).filter((issue) => issue.holeIds.length > 0);
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
  bjtBase,
  boardPowered,
  buttonPins,
  componentHoles,
  crowdedHoles,
  deviceClosed,
  devicePinLabel,
  devicePinOffset,
  floatingDiagnostics,
  holeName,
  icPinHoles,
  icTo,
  initialControlClosed,
  initialMemory,
  isMaintainedControl,
  joinBoardParts,
  junctionCurrent,
  measureResistance,
  netGroups,
  newProject,
  parseHoleId,
  pinKey,
  relocate,
  solveBreadboard,
  solveDC,
  uid,
  verticalDevice
};
