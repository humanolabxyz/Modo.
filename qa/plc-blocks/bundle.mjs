// src/lab/model.ts
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

// src/lab/st.ts
var PRECEDENCE = { OR: 1, XOR: 2, AND: 3, "=": 4, "<>": 4, "<": 5, ">": 5, "<=": 5, ">=": 5, "+": 6, "-": 6, "*": 7, "/": 7, MOD: 7 };
function compileST(source, tags) {
  const tokens = [];
  let index = 0, line = 1;
  const diagnostics = [];
  while (index < source.length) {
    const text2 = source.slice(index);
    const spaces = /^\s+/.exec(text2);
    if (spaces) {
      line += (spaces[0].match(/\n/g) || []).length;
      index += spaces[0].length;
      continue;
    }
    if (text2.startsWith("//")) {
      const end = text2.indexOf("\n");
      index = end < 0 ? source.length : index + end;
      continue;
    }
    const comment = /^\(\*[\s\S]*?\*\)/.exec(text2);
    if (comment) {
      line += (comment[0].match(/\n/g) || []).length;
      index += comment[0].length;
      continue;
    }
    const token = /^(?::=|<=|>=|<>|[A-Za-z_][A-Za-z_0-9]*(?:\.[0-7])?|\d+(?:\.\d+)?|[()+\-*/;=<>])/.exec(text2);
    if (!token) {
      diagnostics.push({ code: "ST001", message: `Car\xE1cter no admitido: ${text2[0]}`, line });
      return { statements: [], diagnostics };
    }
    tokens.push({ text: token[0].toUpperCase(), line });
    index += token[0].length;
    if (tokens.length > 1e4) return { statements: [], diagnostics: [{ code: "ST_LIMIT", message: "El programa supera la capacidad de esta versi\xF3n del editor." }] };
  }
  tokens.push({ text: "EOF", line });
  let at = 0, depth = 0;
  const byName = /* @__PURE__ */ new Map();
  for (const tag of tags) {
    byName.set(tag.address, tag);
    if (/^[A-Z_][A-Z_0-9]*$/i.test(tag.name)) byName.set(tag.name.toUpperCase(), tag);
  }
  const peek = () => tokens[at] ?? tokens[tokens.length - 1];
  const fail = (message) => {
    throw new Error(`L\xEDnea ${peek().line}: ${message}`);
  };
  const take = () => tokens[at++];
  const expect = (s) => {
    if (peek().text !== s) fail(`Se esperaba \xAB${s}\xBB; se encontr\xF3 \xAB${peek().text}\xBB.`);
    take();
  };
  const resolve = (name) => {
    const tag = byName.get(name);
    if (!tag) fail(`La variable \xAB${name}\xBB no est\xE1 declarada.`);
    return tag;
  };
  function expression(min = 0) {
    if (++depth > 40) fail("La expresi\xF3n est\xE1 demasiado anidada.");
    const token = take().text;
    let left;
    if (token === "(") {
      left = expression();
      expect(")");
    } else if (token === "NOT" || token === "-") {
      const value = expression(8);
      if (value.type !== (token === "NOT" ? "bool" : "number")) fail(`Tipo incorrecto para ${token}.`);
      left = { kind: "unary", op: token, value, type: value.type };
    } else if (token === "TRUE" || token === "FALSE") left = { kind: "literal", value: token === "TRUE", type: "bool" };
    else if (/^\d/.test(token)) left = { kind: "literal", value: Number(token), type: "number" };
    else {
      const tag = resolve(token);
      left = { kind: "ref", address: tag.address, type: tag.type };
    }
    while ((PRECEDENCE[peek().text] ?? -1) >= min) {
      const op = take().text;
      const right = expression(PRECEDENCE[op] + 1);
      const boolean = ["AND", "OR", "XOR"].includes(op), compare = ["=", "<>", "<", ">", "<=", ">="].includes(op);
      if (boolean && (left.type !== "bool" || right.type !== "bool")) fail(`${op} necesita valores booleanos.`);
      if (!boolean && !compare && (left.type !== "number" || right.type !== "number")) fail(`${op} necesita n\xFAmeros.`);
      if (compare && (left.type !== right.type || !["=", "<>"].includes(op) && left.type !== "number")) fail(`Tipos incompatibles para ${op}.`);
      left = { kind: "binary", op, left, right, type: boolean || compare ? "bool" : "number" };
    }
    depth--;
    return left;
  }
  function statements(stops, level = 0) {
    if (level > 20) fail("Demasiados condicionales anidados.");
    const result = [];
    while (peek().text !== "EOF" && !stops.includes(peek().text)) {
      if (peek().text === "IF") {
        take();
        const condition = expression();
        if (condition.type !== "bool") fail("IF necesita una condici\xF3n booleana.");
        expect("THEN");
        const yes = statements(["ELSE", "END_IF"], level + 1);
        let no = [];
        if (peek().text === "ELSE") {
          take();
          no = statements(["END_IF"], level + 1);
        }
        expect("END_IF");
        expect(";");
        result.push({ kind: "if", condition, yes, no });
      } else {
        const tag = resolve(take().text);
        if (tag.address.startsWith("I") || tag.address.startsWith("AI")) fail("Las entradas se leen; usa una salida o memoria para asignar.");
        expect(":=");
        const expr = expression();
        if (expr.type !== tag.type) fail(`Tipo incompatible con ${tag.address}.`);
        expect(";");
        result.push({ kind: "assign", address: tag.address, expr });
      }
    }
    return result;
  }
  try {
    const result = statements([]);
    expect("EOF");
    return { statements: result, diagnostics };
  } catch (error) {
    return { statements: [], diagnostics: [{ code: "ST002", message: error instanceof Error ? error.message : "No se pudo compilar el programa.", line: peek().line }] };
  }
}
function evaluate(expr, memory) {
  if (expr.kind === "literal") return expr.value;
  if (expr.kind === "ref") return memory[expr.address] ?? (expr.type === "bool" ? false : 0);
  if (expr.kind === "unary") return expr.op === "NOT" ? !evaluate(expr.value, memory) : -Number(evaluate(expr.value, memory));
  const a = evaluate(expr.left, memory), b = evaluate(expr.right, memory);
  switch (expr.op) {
    case "AND":
      return !!a && !!b;
    case "OR":
      return !!a || !!b;
    case "XOR":
      return !!a !== !!b;
    case "=":
      return a === b;
    case "<>":
      return a !== b;
    case "<":
      return a < b;
    case ">":
      return a > b;
    case "<=":
      return a <= b;
    case ">=":
      return a >= b;
    case "+":
      return Number(a) + Number(b);
    case "-":
      return Number(a) - Number(b);
    case "*":
      return Number(a) * Number(b);
    case "/":
      if (Number(b) === 0) throw new Error("Divisi\xF3n por cero: ejecuci\xF3n detenida.");
      return Number(a) / Number(b);
    case "MOD":
      if (Number(b) === 0) throw new Error("MOD por cero: ejecuci\xF3n detenida.");
      return Number(a) % Number(b);
    default:
      throw new Error("Operaci\xF3n ST desconocida.");
  }
}
function runST(program, memory) {
  const result = { ...memory };
  function run(statements) {
    for (const statement of statements) if (statement.kind === "assign") {
      const value = evaluate(statement.expr, result);
      if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Resultado num\xE9rico fuera de rango.");
      result[statement.address] = value;
    } else run(evaluate(statement.condition, result) ? statement.yes : statement.no);
  }
  run(program.statements);
  return result;
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

// src/lab/equipment/model.ts
var PUMP_ROLES = ["supply", "fuse", "guard", "contactor", "thermal", "u", "v", "w", "earth", "stop", "start", "lamp", "feed", "motor"];
var CATALOG = [
  { kind: "enclosure", name: "Gabinete con placa de montaje", family: "estructura", prefix: "TAB", detail: "Base libre para organizar equipos. Arrastra el borde para mover el gabinete con las piezas de su interior." },
  { kind: "duct", name: "Canaleta horizontal", family: "estructura", prefix: "CH", detail: "Canalizaci\xF3n visual para organizar el cableado; no crea conexiones el\xE9ctricas." },
  { kind: "duct-v", name: "Canaleta vertical", family: "estructura", prefix: "CV", detail: "Canalizaci\xF3n vertical para organizar el cableado; no crea conexiones el\xE9ctricas." },
  { kind: "dc", name: "Fuente DC regulada", family: "mando", prefix: "G", detail: "Alimentaci\xF3n de mando con polos + y \u2212." },
  { kind: "ac", name: "Fuente monof\xE1sica", family: "mando", prefix: "G", detail: "Fuente AC ideal, valores eficaces." },
  { kind: "threephase", name: "Fuente trif\xE1sica", family: "automatizacion", prefix: "G", detail: "Tres fases a 120\xB0, neutro y PE separado." },
  { kind: "earth", name: "Tierra de protecci\xF3n", family: "mando", prefix: "PE", detail: "Punto de protecci\xF3n; no se une a N autom\xE1ticamente." },
  { kind: "terminal", name: "Bornera de paso", family: "mando", prefix: "X", detail: "Dos bornes de una misma red." },
  { kind: "busbar", name: "Barra de distribuci\xF3n", family: "mando", prefix: "X", detail: "Cuatro puntos del mismo nodo." },
  { kind: "breaker", name: "Disyuntor de un polo", family: "mando", prefix: "Q", detail: "Maniobra manual. Dispara por sobrecarga y cortocircuito seg\xFAn su corriente nominal." },
  { kind: "breaker2", name: "Disyuntor de dos polos", family: "mando", prefix: "Q", detail: "Apertura simult\xE1nea de ambos polos. Dispara por sobrecarga y cortocircuito." },
  { kind: "breaker3", name: "Disyuntor de tres polos", family: "mando", prefix: "Q", detail: "Tres polos vinculados mec\xE1nicamente. Dispara por sobrecarga y cortocircuito." },
  { kind: "fuse", name: "Portafusible", family: "mando", prefix: "FU", detail: "Inserta o extrae el cartucho. Se funde por sobrecarga o cortocircuito; se repone insert\xE1ndolo de nuevo." },
  { kind: "differential", name: "Diferencial did\xE1ctico", family: "mando", prefix: "ID", detail: "Dispara con una fuga a tierra sobre 30 mA: corriente que sale por la fase y no vuelve por el neutro. Para probarlo, une la carga a PE y PE a N." },
  { kind: "guard", name: "Guardamotor", family: "mando", prefix: "QM", detail: "Maniobra tripolar. Dispara por sobrecarga del motor y por cortocircuito." },
  { kind: "thermal", name: "Rel\xE9 t\xE9rmico", family: "mando", prefix: "F", detail: "Mide la corriente del motor y, al sobrecargarse, abre 95\u201396 y cierra 97\u201398. Se rearma con OFF y ON." },
  { kind: "contactor", name: "Contactor de potencia", family: "automatizacion", prefix: "K", detail: "Bobina A1\u2013A2, tres polos y auxiliares vinculados." },
  { kind: "timer", name: "Rel\xE9 temporizador ON-delay", family: "automatizacion", prefix: "KT", detail: "Bobina A1\u2013A2. Al energizarla cuenta el retardo; luego cierra 15\u201318 y abre 15\u201316. Se ajusta en segundos." },
  { kind: "aux-no", name: "Auxiliar NA", family: "mando", prefix: "K", detail: "Sigue al contactor con la misma designaci\xF3n." },
  { kind: "aux-nc", name: "Auxiliar NC", family: "mando", prefix: "K", detail: "Abre al actuar el contactor con la misma designaci\xF3n." },
  { kind: "push-no", name: "Pulsador NA", family: "mando", prefix: "S", detail: "Cierra mientras se mantiene pulsado." },
  { kind: "push-nc", name: "Pulsador NC", family: "mando", prefix: "S", detail: "Abre mientras se mantiene pulsado." },
  { kind: "emergency", name: "Parada de emergencia", family: "mando", prefix: "S", detail: "Enclavada: pulsa para abrir; vuelve a accionar para rearmar." },
  { kind: "selector", name: "Selector de dos posiciones", family: "mando", prefix: "SA", detail: "Conserva su posici\xF3n al soltar." },
  { kind: "lamp", name: "Piloto", family: "mando", prefix: "H", detail: "Se ilumina por tensi\xF3n entre sus dos bornes." },
  { kind: "buzzer", name: "Zumbador", family: "mando", prefix: "HA", detail: "Carga equivalente con se\xF1al visual de activaci\xF3n; sin audio autom\xE1tico." },
  { kind: "motor", name: "Motor monof\xE1sico", family: "automatizacion", prefix: "M", detail: "Carga equivalente con pico de arranque (6 veces) que decae en segundos; movimiento ilustrativo." },
  { kind: "motor3", name: "Motor trif\xE1sico de seis bornes", family: "automatizacion", prefix: "M", detail: "Cablea las bobinas y los puentes estrella/tri\xE1ngulo. Tiene pico de arranque." },
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
  { kind: "rail", name: "Riel DIN", family: "estructura", prefix: "DIN", detail: "Soporte visual; no crea conexiones el\xE9ctricas." },
  { kind: "text", name: "R\xF3tulo de montaje", family: "mando", prefix: "TXT", detail: "Anotaci\xF3n independiente del circuito." }
];
var key = (end) => `${end.part}:${end.port}`;
var maintained = (kind) => ["breaker", "breaker2", "breaker3", "fuse", "differential", "guard", "thermal", "emergency", "selector"].includes(kind);
var defaults = (kind) => ({ voltage: kind === "ac" || kind === "vfd" || kind === "motor" ? 230 : kind === "threephase" || kind === "vfd3" || kind === "softstart" || kind === "motor3" ? 400 : kind === "pv" ? 36 : 24, power: kind === "micro1200" ? 1200 : kind === "micro600" ? 600 : kind === "inverter" ? 1e3 : kind === "motor3" ? 1500 : kind === "pv" || kind === "micro300" ? 300 : kind === "lamp" ? 2 : kind === "buzzer" ? 1 : 100, current: 10, capacity: 100, soc: 50, irradiance: 1e3, frequency: 50, target: 30, ramp: 3, poles: 4, tariff: 0, text: kind === "text" ? "Mi montaje" : "" });
function dimensions(kind) {
  if (kind === "enclosure") return { w: 900, h: 760 };
  if (kind === "duct") return { w: 680, h: 42 };
  if (kind === "duct-v") return { w: 42, h: 620 };
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
    case "enclosure":
    case "duct":
    case "duct-v":
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
    case "timer":
      return rows(["A1", "15", "18"], ["A2", "16"], w, h);
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

// src/lab/equipment/engine.ts
var POLES = { differential: [["1", "2"], ["3", "4"]], breaker: [["1", "2"]], fuse: [["1", "2"]], breaker2: [["1", "2"], ["3", "4"]], breaker3: [["1", "2"], ["3", "4"], ["5", "6"]], guard: [["1", "2"], ["3", "4"], ["5", "6"]], thermal: [["L1", "T1"], ["L2", "T2"], ["L3", "T3"]] };
var guarded = (kind) => kind in POLES;
var MAGNETIC = 10;
var OVERLOAD = 1.13;
var HEAT_TIME = 30;
var COOL_TIME = 60;
var RESIDUAL = 0.03;
var INRUSH = 6;
var INRUSH_TAU = 0.5;
var zero = { r: 0, i: 0 };
var mag = (v) => Math.hypot(v.r, v.i);
var sub = (a, b) => ({ r: a.r - b.r, i: a.i - b.i });
var phase = (v, angle) => ({ r: v * Math.cos(angle), i: v * Math.sin(angle) });
var pkey = (p, port) => key({ part: p.id, port });
var mains = (kind) => kind === "ac" || kind === "threephase";
function motorsWithoutEarth(board) {
  if (!board.cabinet) return [];
  const net = new Nets();
  for (const p of board.parts) for (const port of ports(p.kind)) net.find(pkey(p, port.id));
  for (const w of board.wires) net.join(key(w.from), key(w.to));
  for (const p of board.parts) {
    if (p.kind === "terminal") net.join(pkey(p, "1"), pkey(p, "2"));
    if (p.kind === "busbar") for (const port of ["2", "3", "4"]) net.join(pkey(p, "1"), pkey(p, port));
  }
  const feeds = board.parts.filter((p) => mains(p.kind));
  if (!feeds.length) return [];
  const ground = new Set(feeds.map((p) => net.find(pkey(p, "PE"))));
  return board.parts.filter((p) => ports(p.kind).some((x) => x.id === "PE") && (p.kind === "motor3" || p.kind === "motor") && !ground.has(net.find(pkey(p, "PE")))).map((p) => p.tag);
}
var freshEquipment = () => ({ readings: {}, contacts: {}, hz: {}, reverse: {}, soc: {}, energy: {}, volts: {}, live: [], warnings: [], fault: null, tripped: {}, heat: {}, timers: {}, leak: {} });
function solve(branches, fixed) {
  const all = [...new Set(branches.flatMap((b) => [b.a, b.b]))], adj = /* @__PURE__ */ new Map();
  for (const b of branches) {
    adj.set(b.a, [...adj.get(b.a) ?? [], b.b]);
    adj.set(b.b, [...adj.get(b.b) ?? [], b.a]);
  }
  const referenced = /* @__PURE__ */ new Set(), stack = Object.keys(fixed);
  while (stack.length) {
    const n2 = stack.pop();
    if (referenced.has(n2)) continue;
    referenced.add(n2);
    stack.push(...adj.get(n2) ?? []);
  }
  const nodes = all.filter((n2) => referenced.has(n2) && !fixed[n2]), index = new Map(nodes.map((n2, i) => [n2, i]));
  if (nodes.length > 320) throw new Error("La red supera la capacidad de c\xE1lculo de esta versi\xF3n. Divide el montaje.");
  const n = nodes.length, a = nodes.map(() => new Float64Array(n + 2));
  for (const b of branches) {
    if (b.a === b.b || !referenced.has(b.a)) continue;
    const g = 1 / b.r;
    for (const [x, y] of [[b.a, b.b], [b.b, b.a]]) {
      const i = index.get(x);
      if (i === void 0) continue;
      a[i][i] += g;
      const j = index.get(y);
      if (j === void 0) {
        a[i][n] += g * (fixed[y]?.r ?? 0);
        a[i][n + 1] += g * (fixed[y]?.i ?? 0);
      } else a[i][j] -= g;
    }
  }
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[pivot][c])) pivot = r;
    if (Math.abs(a[pivot][c]) < 1e-14) throw new Error("Red sin referencia suficiente o conexiones incompatibles.");
    [a[c], a[pivot]] = [a[pivot], a[c]];
    const divisor = a[c][c];
    for (let j = c; j < n + 2; j++) a[c][j] /= divisor;
    for (let r = c + 1; r < n; r++) {
      const g = a[r][c];
      if (!g) continue;
      for (let j = c; j < n + 2; j++) a[r][j] -= g * a[c][j];
    }
  }
  const volts = { ...fixed };
  for (let r = n - 1; r >= 0; r--) {
    let vr = a[r][n], vi = a[r][n + 1];
    for (let j = r + 1; j < n; j++) {
      vr -= a[r][j] * volts[nodes[j]].r;
      vi -= a[r][j] * volts[nodes[j]].i;
    }
    volts[nodes[r]] = { r: vr, i: vi };
  }
  const amps = {};
  for (const b of branches) {
    if (!volts[b.a] || !volts[b.b]) continue;
    const d = sub(volts[b.a], volts[b.b]);
    amps[b.id] = { r: d.r / b.r, i: d.i / b.r };
  }
  return { volts, amps };
}
function stepEquipment(board, previous, memory, controls, pressed, dt) {
  const state = { ...freshEquipment(), contacts: { ...previous.contacts }, hz: { ...previous.hz }, reverse: { ...previous.reverse }, soc: { ...previous.soc }, energy: { ...previous.energy }, tripped: { ...previous.tripped }, heat: { ...previous.heat }, timers: { ...previous.timers }, leak: { ...previous.leak } };
  const activeIds = new Set(board.parts.map((p) => p.id));
  for (const store of [state.contacts, state.hz, state.reverse, state.soc, state.energy, state.tripped, state.heat, state.timers, state.leak]) for (const id of Object.keys(store)) if (!activeIds.has(id)) delete store[id];
  dt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 2)) : 0;
  const control = (p) => controls[p.id] ?? p.closed;
  for (const p of board.parts) if (guarded(p.kind) && !control(p) && state.tripped[p.id]) {
    delete state.tripped[p.id];
    delete state.leak[p.id];
    state.heat[p.id] = Math.min(state.heat[p.id] ?? 0, 0.5);
  }
  const rated = (p) => Math.max(0.1, p.params.current), currents = {};
  let lastVolts = previous.volts, lastPower = {}, stable = false, net = new Nets(), amps = {}, sources = [], frequency = {};
  const read = (p, a, b, values = lastVolts) => sub(values[pkey(p, a)] ?? zero, values[pkey(p, b)] ?? zero);
  const warnings = /* @__PURE__ */ new Set(), conversionScale = {};
  const earthBlocked = motorsWithoutEarth(board);
  if (earthBlocked.length) warnings.add(`Falta la tierra de protecci\xF3n (PE) de ${earthBlocked.join(", ")}. Une su PE con la PE de la alimentaci\xF3n (basta un cable) antes de energizar.`);
  try {
    for (let pass = 0; pass < 12; pass++) {
      net = new Nets();
      for (const p of board.parts) for (const port of ports(p.kind)) net.find(pkey(p, port.id));
      for (const w of board.wires) net.join(key(w.from), key(w.to));
      const join = (p, a, b) => net.join(pkey(p, a), pkey(p, b));
      for (const p of board.parts) {
        const on = control(p), kind = p.kind;
        if (kind === "terminal") join(p, "1", "2");
        if (kind === "busbar") for (const port of ["2", "3", "4"]) join(p, "1", port);
        if (kind === "emergency" && on) join(p, "1", "2");
        if (kind === "push-no" && pressed[p.id] || kind === "push-nc" && !pressed[p.id]) join(p, kind === "push-no" ? "3" : "1", kind === "push-no" ? "4" : "2");
        if (kind === "selector" && on) join(p, "3", "4");
        if (kind === "thermal") {
          const ok = on && !state.tripped[p.id];
          join(p, ok ? "95" : "97", ok ? "96" : "98");
        }
        if (kind === "contactor") {
          if (state.contacts[p.id]) {
            for (let i = 1; i <= 3; i++) join(p, "L" + i, "T" + i);
            join(p, "13", "14");
          } else join(p, "21", "22");
        }
        if (kind === "timer") {
          const done = !!state.contacts[p.id] && (state.timers[p.id] ?? 0) >= p.params.ramp;
          join(p, "15", done ? "18" : "16");
        }
        if (kind === "aux-no" || kind === "aux-nc") {
          const energized = board.parts.some((c) => c.kind === "contactor" && c.tag === p.tag && state.contacts[c.id]);
          if (kind === "aux-no" ? energized : !energized) join(p, kind === "aux-no" ? "13" : "21", kind === "aux-no" ? "14" : "22");
        }
        if (kind === "plc" && mag(read(p, "L+", "M")) >= 18 && mag(read(p, "L+", "M")) <= 30) {
          for (let i = 1; i <= 4; i++) if (memory["Q0." + (i - 1)]) join(p, "C" + i, "Q" + i);
        }
        if (kind === "controller") {
          join(p, "BAT+", "LOAD+");
          join(p, "BAT\u2212", "LOAD\u2212");
          join(p, "PV\u2212", "BAT\u2212");
        }
        if (kind === "vfd" || kind === "vfd3" || kind === "softstart") join(p, "PE", "PEo");
      }
      const root = (p, port) => net.find(pkey(p, port));
      const branches = [], fixed = {};
      sources = [];
      frequency = {};
      const branch = (id, a, b, r) => branches.push({ id, a, b, r: Math.max(1e-6, r) });
      const load = (p, a, b, r, id = p.id) => branch(id, root(p, a), root(p, b), r);
      const source = (p, plus, minus, v, resistance = 1e-6, f = 0) => {
        if (earthBlocked.length) return;
        const positive = root(p, plus), negative = root(p, minus);
        if (positive === negative && mag(v) > 1) throw new Error(`${p.tag}: cortocircuito entre los polos de la fuente.`);
        sources.push({ owner: p.id, positive, negative, v, r: resistance, frequency: f });
      };
      for (const p of board.parts) {
        const q = p.params, kind = p.kind;
        if (guarded(kind) && (kind === "thermal" || control(p) && !state.tripped[p.id])) for (const [a, b] of POLES[kind]) load(p, a, b, 2e-3, p.id + ":" + a);
        if (kind === "dc") source(p, "+", "\u2212", { r: q.voltage, i: 0 });
        if (kind === "ac") source(p, "L", "N", { r: q.voltage, i: 0 }, 1e-6, q.frequency);
        if (kind === "threephase") for (let i = 0; i < 3; i++) source(p, "L" + (i + 1), "N", phase(q.voltage / Math.sqrt(3), -i * 2 * Math.PI / 3), 1e-6, q.frequency);
        if (kind === "pv") source(p, "+", "\u2212", { r: q.irradiance > 0 ? q.voltage : 0, i: 0 }, Math.max(0.05, q.voltage * q.voltage / (4 * q.power * Math.max(1e-3, q.irradiance / 1e3))));
        if (kind === "battery") {
          const soc = state.soc[p.id] ?? q.soc;
          source(p, "+", "\u2212", { r: q.voltage * (0.9 + 0.2 * soc / 100), i: 0 }, soc <= 0 ? 1e8 : 0.4);
        }
        if (kind === "contactor" || kind === "timer") load(p, "A1", "A2", 1200);
        if (kind === "lamp" || kind === "buzzer") load(p, "1", "2", q.voltage * q.voltage / q.power);
        const surge = 1 + (INRUSH - 1) * Math.exp(-(state.timers[p.id] ?? 0) / INRUSH_TAU);
        if (kind === "motor") load(p, "L", "N", q.voltage * q.voltage / q.power / surge);
        if (kind === "motor3") for (const [a, b] of [["U1", "U2"], ["V1", "V2"], ["W1", "W2"]]) load(p, a, b, q.voltage * q.voltage / q.power / surge, p.id + ":" + a);
        if (kind === "voltmeter") load(p, "V+", "V\u2212", 1e7);
        if (kind === "ammeter") load(p, "A1", "A2", 0.01);
        if (kind === "wattmeter" || kind === "energy") {
          load(p, "I1", "I2", 0.01);
          load(p, "V+", "V\u2212", 1e7, p.id + ":V");
        }
        if (kind === "plc") {
          load(p, "L+", "M", 240);
          for (let i = 1; i <= 8; i++) load(p, "I" + i, "M", 1e4, p.id + ":I" + i);
        }
        if (kind === "vfd" || kind === "vfd3" || kind === "softstart") {
          const single = kind === "vfd", soft = kind === "softstart", outs = soft ? ["T1", "T2", "T3"] : ["U", "V", "W"], input = single ? mag(read(p, "L", "N")) : [mag(read(p, "L1", "L2")), mag(read(p, "L2", "L3")), mag(read(p, "L3", "L1"))].reduce((a, b) => a + b) / 3;
          const expected = q.voltage, powered = input >= expected * 0.8 && input <= expected * 1.15;
          const phases = single ? [] : [mag(read(p, "L1", "L2")), mag(read(p, "L2", "L3")), mag(read(p, "L3", "L1"))];
          const unbalanced = phases.length > 0 && Math.max(...phases) - Math.min(...phases) > input * 0.1;
          const outputRoots = outs.map((port) => root(p, port)), conflict = new Set(outputRoots).size < 3 || board.parts.some((s) => s.id !== p.id && (mains(s.kind) || s.kind === "dc" || s.kind === "battery") && ports(s.kind).some((port) => !port.id.startsWith("PE") && outputRoots.includes(root(s, port.id))));
          if (conflict) warnings.add(`${p.tag}: salidas ${outs.join("/")} unidas o conectadas a una fuente.`);
          if (input > 1 && (!powered || unbalanced)) warnings.add(`${p.tag}: alimentaci\xF3n fuera de rango o fase ausente/repetida.`);
          const wired = board.wires.some((w) => w.from.part === p.id && w.from.port === "DI1" || w.to.part === p.id && w.to.port === "DI1");
          const run = wired ? root(p, "24") === root(p, "DI1") : !!controls[p.id + ":run"];
          const reverse = soft ? false : wired ? root(p, "24") === root(p, "DI2") : !!controls[p.id + ":reverse"];
          if (pass === 1) {
            let hz2 = state.hz[p.id] ?? 0, oldReverse = state.reverse[p.id] ?? false;
            const target = powered && !unbalanced && !conflict && run && (reverse === oldReverse || hz2 <= 1e-6) ? soft ? q.frequency : Math.min(q.target, q.frequency) : 0;
            const step = q.frequency / q.ramp * dt;
            hz2 += Math.max(-step, Math.min(step, target - hz2));
            if (soft && !target) hz2 = 0;
            if (hz2 < 1e-6) {
              hz2 = 0;
              oldReverse = reverse;
            }
            state.hz[p.id] = powered && !conflict ? hz2 : 0;
            state.reverse[p.id] = oldReverse;
          }
          const hz = state.hz[p.id] ?? 0;
          if (powered && !unbalanced && !conflict) {
            source(p, "24", "COM", { r: 24, i: 0 }, 0.1);
            if (hz > 0) {
              const sign = state.reverse[p.id] ? -1 : 1, progress = Math.min(1, hz / q.frequency), line = soft ? expected * (q.target / 100 + (1 - q.target / 100) * progress) : expected * progress;
              for (const [i, port] of outs.entries()) sources.push({ owner: p.id, positive: root(p, port), negative: "ref:" + p.id, v: phase(line / Math.sqrt(3), -sign * i * 2 * Math.PI / 3), r: 1e-3, frequency: soft ? q.frequency * Math.max(0.15, progress) : hz });
            }
          }
          if (input > 1) load(p, single ? "L" : "L1", single ? "N" : "L2", input * input / Math.max(1, (lastPower[p.id] ?? 0) / 0.95));
        }
        if (kind === "inverter" || kind === "dcdc" || kind.startsWith("micro") || kind === "controller") {
          const inputPlus = kind === "controller" ? "PV+" : kind === "dcdc" ? "IN+" : "DC+", inputMinus = kind === "controller" ? "PV\u2212" : kind === "dcdc" ? "IN\u2212" : "DC\u2212";
          const vin = mag(read(p, inputPlus, inputMinus));
          let power = lastPower[p.id] ?? 0;
          if (power > q.power) conversionScale[p.id] = (conversionScale[p.id] ?? 1) * Math.sqrt(q.power / power);
          const scale = conversionScale[p.id] ?? 1;
          if (vin > 1) {
            if (kind === "inverter" && vin >= q.voltage * 0.8) source(p, "L", "N", { r: 230 * scale, i: 0 }, 0.05, q.frequency);
            if (kind === "dcdc") source(p, "OUT+", "OUT\u2212", { r: Math.min(q.voltage, vin * 0.95) * scale, i: 0 }, 0.1);
            if (kind === "controller" && vin > mag(read(p, "BAT+", "BAT\u2212")) + 1) source(p, "BAT+", "BAT\u2212", { r: Math.min(q.voltage * 1.15, vin * 0.95) * scale, i: 0 }, 1);
            if (kind.startsWith("micro")) {
              const grid = read(p, "L", "N"), vg = mag(grid);
              const externalGrid = board.parts.some((s) => mains(s.kind) && ports(s.kind).some((port) => !port.id.startsWith("PE") && root(s, port.id) === root(p, "L")));
              if (vg > 180 && externalGrid) {
                const pvPower = board.parts.filter((s) => s.kind === "pv" && root(s, "+") === root(p, "DC+")).reduce((sum, s) => sum + s.params.power * s.params.irradiance / 1e3 * 0.9, 0);
                const available = Math.min(q.power, pvPower || q.power), r = 0.5, boost = available / vg * r;
                source(p, "L", "N", { r: grid.r * (1 + boost / vg), i: grid.i * (1 + boost / vg) }, r, q.frequency);
                power = available;
              } else warnings.add(`${p.tag}: necesita una red AC presente; no funciona aislado.`);
            }
            if (power > q.power * 1.02) warnings.add(`${p.tag}: l\xEDmite de potencia; el modelo reduce la tensi\xF3n de salida.`);
            if (power > 0) load(p, inputPlus, inputMinus, vin * vin / (Math.min(power, q.power) / 0.9), p.id + ":input");
          }
        }
      }
      const assign = (node, v) => {
        if (fixed[node] && mag(sub(fixed[node], v)) > 0.1) throw new Error("Fuentes con referencias incompatibles. Este modelo no admite esa asociaci\xF3n.");
        fixed[node] = v;
      };
      for (const [i, s] of sources.entries()) {
        assign(s.negative, zero);
        const hidden = "source:" + i;
        assign(hidden, s.v);
        branch("source:" + i, hidden, s.positive, s.r);
        frequency[s.positive] = s.frequency;
      }
      const result = solve(branches, fixed);
      amps = result.amps;
      lastVolts = {};
      for (const p of board.parts) for (const port of ports(p.kind)) {
        const value = result.volts[root(p, port.id)];
        if (value) lastVolts[pkey(p, port.id)] = value;
      }
      lastPower = {};
      for (const [i, s] of sources.entries()) {
        const current = amps["source:" + i] ?? zero, terminal = sub(result.volts[s.positive] ?? zero, result.volts[s.negative] ?? zero);
        lastPower[s.owner] = (lastPower[s.owner] ?? 0) + Math.max(0, terminal.r * current.r + terminal.i * current.i);
      }
      let changed = false;
      for (const p of board.parts) {
        if (!guarded(p.kind)) continue;
        const I = Math.max(0, ...POLES[p.kind].map(([a]) => mag(amps[p.id + ":" + a] ?? zero)));
        currents[p.id] = I;
        if (p.kind === "differential" && control(p) && !state.tripped[p.id]) {
          const a = amps[p.id + ":1"] ?? zero, b = amps[p.id + ":3"] ?? zero;
          if (Math.hypot(a.r + b.r, a.i + b.i) > RESIDUAL) {
            state.tripped[p.id] = true;
            state.leak[p.id] = true;
            changed = true;
          }
        }
        if (p.kind !== "thermal" && control(p) && !state.tripped[p.id] && I > rated(p) * MAGNETIC) {
          state.tripped[p.id] = true;
          changed = true;
        }
        if (pass === 1) {
          const ratio = Math.min(I / rated(p), 2.5), heat = state.heat[p.id] ?? 0;
          state.heat[p.id] = ratio > OVERLOAD ? Math.min(1.5, heat + (ratio * ratio - 1) * dt / HEAT_TIME) : Math.max(0, heat - dt / COOL_TIME);
          if (state.heat[p.id] >= 1 && !state.tripped[p.id] && control(p)) {
            state.tripped[p.id] = true;
            changed = true;
          }
        }
      }
      if (pass === 1) for (const p of board.parts) {
        if (p.kind === "timer") state.timers[p.id] = state.contacts[p.id] ? (state.timers[p.id] ?? 0) + dt : 0;
        if (p.kind === "motor" || p.kind === "motor3") {
          const pairs = p.kind === "motor3" ? [["U1", "U2"], ["V1", "V2"], ["W1", "W2"]] : [["L", "N"]], powered = pairs.every(([a, b]) => mag(read(p, a, b)) > p.params.voltage * 0.2);
          state.timers[p.id] = powered ? (state.timers[p.id] ?? 0) + dt : 0;
        }
      }
      for (const p of board.parts) if (p.kind === "contactor" || p.kind === "timer") {
        const energized = mag(read(p, "A1", "A2")) >= p.params.voltage * 0.75;
        if (energized !== !!state.contacts[p.id]) changed = true;
        state.contacts[p.id] = energized;
      }
      if (pass >= 4 && !changed) {
        stable = true;
        break;
      }
    }
    if (!stable && board.parts.length) warnings.add("La maniobra no se estabiliz\xF3; revisa los enclavamientos.");
    for (const p of board.parts) {
      const q = p.params, kind = p.kind;
      const r = { voltage: 0, current: 0, power: 0, energy: previous.energy[p.id] ?? 0, cost: 0, frequency: 0, rpm: 0, soc: state.soc[p.id] ?? q.soc, active: false, closed: control(p), reverse: false, status: "Sin alimentaci\xF3n" };
      const port = ports(kind), v = port.length >= 2 ? read(p, port[0].id, port[1].id) : zero;
      r.voltage = mag(v);
      r.current = mag(amps[p.id] ?? zero);
      r.power = r.voltage * r.current;
      if (maintained(kind)) r.status = control(p) ? kind === "thermal" ? "Normal" : "Cerrado" : kind === "emergency" ? "Enclavada" : kind === "thermal" ? "Disparo de pr\xE1ctica" : "Abierto";
      if (kind === "push-no" || kind === "push-nc") {
        r.closed = kind === "push-no" ? !!pressed[p.id] : !pressed[p.id];
        r.status = pressed[p.id] ? "Pulsado" : "Suelto";
      }
      if (guarded(kind)) {
        r.current = currents[p.id] ?? 0;
        r.power = r.voltage * r.current;
        if (state.tripped[p.id]) {
          r.closed = false;
          const cause = state.leak[p.id] ? "fuga a tierra (corriente residual sobre 30 mA)" : kind === "thermal" ? "sobrecarga del motor" : "sobrecarga o cortocircuito";
          r.status = "Disparado por " + cause + " \xB7 ap\xE1galo y vuelve a conectar";
          warnings.add(`${p.tag}: dispar\xF3 por ${cause}. Corrige la causa y rearma (OFF y luego ON).`);
        } else if ((state.heat[p.id] ?? 0) > 0.3 && control(p)) r.status += ` \xB7 calentamiento ${Math.round(Math.min(1, state.heat[p.id]) * 100)} %`;
      }
      if (kind === "timer") {
        const t = state.timers[p.id] ?? 0, done = !!state.contacts[p.id] && t >= q.ramp;
        r.voltage = mag(read(p, "A1", "A2"));
        r.active = done;
        r.closed = done;
        r.status = state.contacts[p.id] ? done ? "Retardo cumplido \xB7 15\u201318 cerrado" : `Contando ${t.toFixed(1)} / ${q.ramp} s` : "Sin bobina \xB7 15\u201316 cerrado";
      }
      if (kind === "contactor") {
        r.voltage = mag(read(p, "A1", "A2"));
        r.power = r.voltage * r.current;
        r.active = !!state.contacts[p.id];
        r.status = r.active ? "Bobina activa" : "En reposo";
      }
      if (kind === "aux-no" || kind === "aux-nc") {
        const on = board.parts.some((c) => c.kind === "contactor" && c.tag === p.tag && state.contacts[c.id]);
        r.closed = kind === "aux-no" ? on : !on;
        r.status = r.closed ? "Contacto cerrado" : "Contacto abierto";
      }
      if (kind === "lamp" || kind === "buzzer") {
        r.voltage = mag(read(p, "1", "2"));
        r.active = r.voltage >= q.voltage * 0.75;
        r.status = r.active ? "Activo" : "Apagado";
      }
      if (kind === "motor" || kind === "motor3") {
        const pairs = kind === "motor3" ? [["U1", "U2"], ["V1", "V2"], ["W1", "W2"]] : [["L", "N"]];
        const values = pairs.map(([a, b]) => mag(read(p, a, b)));
        r.voltage = Math.max(...values);
        r.active = values.every((x) => x > q.voltage * 0.2);
        r.frequency = r.active ? frequency[net.find(pkey(p, pairs[0][0]))] ?? q.frequency : 0;
        r.rpm = r.active ? 120 * r.frequency / q.poles * 0.95 : 0;
        r.power = pairs.reduce((sum, [a, b]) => sum + mag(read(p, a, b)) ** 2 / (q.voltage * q.voltage / q.power), 0);
        if (kind === "motor3") {
          const u = read(p, "U1", "V1"), v2 = read(p, "V1", "W1");
          r.reverse = u.r * v2.i - u.i * v2.r > 0;
        }
        r.status = r.active ? `Marcha ${r.reverse ? "\u21BA" : "\u21BB"} \xB7 equivalente resistivo` : values.some((x) => x > 1) ? "Bobinado sin alimentaci\xF3n completa" : "Detenido";
        if (kind === "motor3" && values.some((x) => x > 1) && !values.every((x) => x > q.voltage * 0.2)) warnings.add(`${p.tag}: falta una fase o una bobina sin alimentar; en un motor real se calentar\xEDa y el t\xE9rmico disparar\xEDa.`);
      }
      if (kind === "softstart") {
        const progress = Math.min(1, (state.hz[p.id] ?? 0) / q.frequency);
        r.frequency = state.hz[p.id] ?? 0;
        r.active = progress > 0;
        r.status = r.active ? progress >= 0.9999 ? "Plena tensi\xF3n \xB7 puenteado" : `Rampa ${Math.round(progress * 100)} %` : "Detenido";
        r.voltage = mag(read(p, "T1", "T2"));
      }
      if (kind === "vfd" || kind === "vfd3") {
        r.frequency = state.hz[p.id] ?? 0;
        r.active = r.frequency > 0;
        r.status = r.active ? Math.abs(r.frequency - q.target) < 0.01 ? "Marcha" : "En rampa" : "Detenido";
        r.voltage = mag(read(p, "U", "V"));
      }
      if (kind === "voltmeter") {
        r.voltage = mag(read(p, "V+", "V\u2212"));
        r.status = "Tensi\xF3n entre puntas";
      }
      if (kind === "ammeter") r.status = "Corriente por el shunt";
      if (kind === "wattmeter" || kind === "energy") {
        const volts = read(p, "V+", "V\u2212"), current = amps[p.id] ?? zero;
        r.voltage = mag(volts);
        r.current = mag(current);
        r.power = volts.r * current.r + volts.i * current.i;
        r.energy = (previous.energy[p.id] ?? 0) + Math.max(0, r.power) * dt / 36e5;
        state.energy[p.id] = r.energy;
        r.cost = r.energy * q.tariff;
        r.status = "Potencia activa";
      }
      if (kind === "battery") {
        const sourceIndex = sources.findIndex((s) => s.owner === p.id), current = amps["source:" + sourceIndex]?.r ?? 0;
        r.current = current;
        r.power = r.voltage * current;
        r.soc = Math.max(0, Math.min(100, (previous.soc[p.id] ?? q.soc) - current * dt / (q.capacity * 3600) * 100));
        state.soc[p.id] = r.soc;
        r.status = current < -1e-3 ? "Cargando" : current > 1e-3 ? "Descargando" : "En reposo";
      }
      const owned = sources.map((s, i) => ({ s, i })).filter(({ s }) => s.owner === p.id);
      if (owned.length && kind !== "battery") {
        r.current = Math.max(...owned.map(({ i }) => mag(amps["source:" + i] ?? zero)));
        r.power = lastPower[p.id] ?? 0;
      }
      if (kind === "pv") {
        r.status = q.irradiance > 0 ? "Equivalente FV lineal" : "Sin irradiancia";
        r.power = lastPower[p.id] ?? 0;
        r.active = r.power > 0.01;
      }
      if (kind === "inverter" || kind === "dcdc" || kind.startsWith("micro") || kind === "controller") {
        r.power = lastPower[p.id] ?? 0;
        r.active = r.power > 0.01;
        r.status = r.active ? "Conversi\xF3n equivalente" : "En espera";
      }
      if (kind === "dc" || mains(kind)) r.status = "Fuente ideal";
      if (kind === "plc") {
        r.active = mag(read(p, "L+", "M")) >= 18 && mag(read(p, "L+", "M")) <= 30;
        r.status = r.active ? "Programa del proyecto" : "Sin 24 V de mando";
      }
      if (["enclosure", "rail", "duct", "duct-v", "text"].includes(kind)) r.status = "Soporte de montaje";
      state.readings[p.id] = r;
    }
    state.volts = lastVolts;
    state.live = board.wires.filter((w) => mag(lastVolts[key(w.from)] ?? zero) > 1).map((w) => w.id);
    state.warnings = [...warnings];
  } catch (error) {
    state.fault = error instanceof Error ? error.message : "No se pudo resolver el montaje.";
    state.volts = {};
    state.live = [];
    state.readings = {};
  }
  return state;
}

// src/lab/engine.ts
function emptyRuntime(project) {
  return { memory: initialMemory(project), relays: {}, active: [], livePins: [], blocks: {}, level: project.process.initialLevel, seconds: 0, cycle: 0, fault: null, pump: false, drain: false, equipment: freshEquipment() };
}
function compilePLC(project) {
  if (project.plc.language === "st") {
    const st = compileST(project.plc.source, project.plc.tags);
    return { diagnostics: st.diagnostics, st };
  }
  const diagnostics = [], tags = new Map(project.plc.tags.map((t) => [t.address, t]));
  for (const rung of project.plc.rungs) {
    const output = tags.get(rung.output);
    if (!output) diagnostics.push({ code: "L001", message: `Salida no declarada: ${rung.output || "(vac\xEDa)"}`, rung: rung.id });
    else if (output.type !== "bool" || /^(I|AI)/.test(output.address)) diagnostics.push({ code: "L002", message: "La bobina necesita una salida o memoria booleana.", rung: rung.id });
    for (const field of ["resetSignal", "loadSignal", "downSignal"]) if (rung[field] && tags.get(rung[field])?.type !== "bool") diagnostics.push({ code: "L006", message: `Entrada del bloque no declarada: ${rung[field]}`, rung: rung.id });
    if (["ctu", "ctd", "ctud"].includes(rung.mode) && !Number.isInteger(rung.preset)) diagnostics.push({ code: "L007", message: "El contador necesita un ajuste entero.", rung: rung.id });
    if (rung.branches.length === 0) diagnostics.push({ code: "L003", message: "El segmento necesita al menos una rama.", rung: rung.id });
    for (const branch of rung.branches) for (const contact of branch) if (tags.get(contact.address)?.type !== "bool") diagnostics.push({ code: "L004", message: `Contacto sin variable booleana: ${contact.address || "(vac\xEDa)"}`, rung: rung.id });
    if (["ton", "tof", "tp", "ctu", "ctd", "ctud"].includes(rung.mode) && (!Number.isFinite(rung.preset) || rung.preset <= 0)) diagnostics.push({ code: "L005", message: "El ajuste del bloque debe ser mayor que cero.", rung: rung.id });
  }
  return { diagnostics, st: null };
}
function runRung(rung, memory, state, dt) {
  const powered = rung.branches.some((branch) => branch.every((c) => c.negated ? !memory[c.address] : !!memory[c.address]));
  let result = !!memory[rung.output];
  const next = { ...state };
  switch (rung.mode) {
    case "coil":
      result = powered;
      break;
    case "set":
      if (powered) result = true;
      break;
    case "reset":
      if (powered) result = false;
      break;
    case "ton":
      next.elapsed = powered ? state.elapsed + dt : 0;
      result = powered && next.elapsed + 1e-9 >= rung.preset;
      break;
    case "tof":
      if (powered) {
        next.elapsed = 0;
        next.timing = false;
        result = true;
      } else {
        if (state.previous) {
          next.elapsed = 0;
          next.timing = true;
        }
        if (next.timing) {
          next.elapsed += dt;
          if (next.elapsed + 1e-9 >= rung.preset) next.timing = false;
        }
        result = next.timing;
      }
      break;
    case "tp": {
      if (powered && !state.previous && !state.timing) {
        next.timing = true;
        next.elapsed = 0;
      }
      if (next.timing) {
        next.elapsed += dt;
        if (next.elapsed >= rung.preset - 1e-9) next.timing = false;
      }
      result = next.timing;
      break;
    }
    case "rise":
      result = powered && !state.previous;
      break;
    case "fall":
      result = !powered && state.previous;
      break;
    case "ctu":
    case "ctd":
    case "ctud": {
      const down = !!memory[rung.downSignal ?? ""];
      if (!state.initialized) {
        next.count = rung.mode === "ctd" ? rung.preset : 0;
        next.initialized = true;
      }
      if (memory[rung.resetSignal ?? ""]) next.count = 0;
      else if (memory[rung.loadSignal ?? ""]) next.count = rung.preset;
      else {
        const up = powered && !state.previous, fall = down && !state.downPrevious;
        if (rung.mode === "ctu" && up) next.count = Math.min(1e9, next.count + 1);
        if (rung.mode === "ctd" && up) next.count = Math.max(0, next.count - 1);
        if (rung.mode === "ctud" && up !== fall) next.count = Math.max(0, Math.min(1e9, next.count + (up ? 1 : -1)));
      }
      next.downPrevious = down;
      result = rung.mode === "ctd" ? next.count <= 0 : next.count >= rung.preset;
      break;
    }
  }
  next.previous = powered;
  memory[rung.output] = result;
  return next;
}
function solveSchematic(project, pressed, memory, previous, controls = {}) {
  const { devices, wires } = project.schematic;
  const relays = { ...previous };
  let active = [], livePins = [];
  for (let pass = 0; pass < 32; pass++) {
    const nets = new Nets();
    for (const d of devices) {
      nets.find(`${d.id}:0`);
      nets.find(`${d.id}:1`);
    }
    for (const wire of wires) nets.join(pinKey(wire.from), pinKey(wire.to));
    for (const d of devices) if (deviceClosed(d, pressed, controls, memory, relays)) nets.join(`${d.id}:0`, `${d.id}:1`);
    const supplies = devices.filter((d) => d.kind === "supply");
    if (supplies.some((d) => nets.find(`${d.id}:0`) === nets.find(`${d.id}:1`))) return { relays: {}, active: [], livePins: [], fault: "Cortocircuito entre los polos de la fuente. Det\xE9n la simulaci\xF3n y revisa el cableado." };
    const fixed = {};
    for (const supply of supplies) {
      fixed[nets.find(`${supply.id}:0`)] = 24;
      fixed[nets.find(`${supply.id}:1`)] = 0;
    }
    const loads = devices.filter((d) => ["coil", "lamp", "motor", "buzzer"].includes(d.kind));
    const dc = solveDC(loads.map((d) => ({ id: d.id, a: nets.find(`${d.id}:0`), b: nets.find(`${d.id}:1`), resistance: d.kind === "coil" ? 1200 : d.kind === "lamp" ? 240 : d.kind === "buzzer" ? 480 : 48 })), fixed);
    if (dc.fault) return { relays: {}, active: [], livePins: [], fault: dc.fault };
    active = loads.filter((d) => Math.abs((dc.volts[nets.find(`${d.id}:0`)] ?? 0) - (dc.volts[nets.find(`${d.id}:1`)] ?? 0)) >= 18).map((d) => d.id);
    livePins = devices.flatMap((d) => [0, 1].filter((pin) => (dc.volts[nets.find(`${d.id}:${pin}`)] ?? 0) > 1).map((pin) => `${d.id}:${pin}`));
    const next = {};
    for (const d of devices.filter((d2) => d2.kind === "coil")) next[d.tag] = next[d.tag] || false || active.includes(d.id);
    if (Object.keys({ ...next, ...relays }).every((tag) => !!next[tag] === !!relays[tag])) return { relays: next, active, livePins, fault: null };
    Object.keys(relays).forEach((k) => delete relays[k]);
    Object.assign(relays, next);
  }
  return { relays: {}, active: [], livePins: [], fault: "La maniobra no se estabiliza. Revisa los contactos del circuito." };
}
function tick(project, previous, pressed, writes, dt, st, controls = {}) {
  if (previous.fault) return previous;
  let memory = { ...previous.memory, ...writes };
  const blocks = { ...previous.blocks };
  for (const d of project.schematic.devices) if ((d.kind === "no" || d.kind === "nc") && d.signal) memory[d.signal] = !!pressed[d.id] || !!writes[d.signal];
  const config = project.process;
  memory[config.lowSignal] = previous.level <= config.low;
  memory[config.highSignal] = previous.level >= config.high;
  memory[config.levelSignal] = previous.level;
  for (const plc of project.equipment?.parts.filter((p) => p.kind === "plc") ?? []) {
    const volts = previous.equipment.volts, plus = volts[`${plc.id}:L+`], minus = volts[`${plc.id}:M`], voltage = plus && minus ? Math.hypot(plus.r - minus.r, plus.i - minus.i) : 0, powered = !!minus && voltage >= 18 && voltage <= 30;
    for (let i = 1; i <= 8; i++) {
      const address2 = `I0.${i - 1}`, v = volts[`${plc.id}:I${i}`];
      if (project.plc.tags.some((t) => t.address === address2 && t.type === "bool")) memory[address2] = powered && !!v && !!minus && Math.hypot(v.r - minus.r, v.i - minus.i) >= 18;
    }
  }
  try {
    if (project.plc.language === "st" && st) memory = runST(st, memory);
    else for (const rung of project.plc.rungs) blocks[rung.id] = runRung(rung, memory, blocks[rung.id] ?? { elapsed: 0, previous: false, count: 0, timing: false }, dt);
    const schematic = solveSchematic(project, pressed, memory, previous.relays, controls);
    if (schematic.fault) return { ...previous, ...schematic, memory, blocks, fault: schematic.fault, pump: false };
    const pump = !!memory[config.pumpSignal];
    const delta = (pump ? config.inflow : 0) - (previous.drain ? config.outflow : 0);
    const level = Math.min(100, Math.max(0, previous.level + delta * dt / config.capacity * 100));
    memory[config.levelSignal] = level;
    const physicalPLC = project.equipment?.parts.some((p) => p.kind === "plc");
    if (!physicalPLC || !/^I0\.[0-7]$/.test(config.lowSignal)) memory[config.lowSignal] = level <= config.low;
    if (!physicalPLC || !/^I0\.[0-7]$/.test(config.highSignal)) memory[config.highSignal] = level >= config.high;
    const equipment = project.equipment ? stepEquipment(project.equipment, previous.equipment, memory, controls, pressed, dt) : previous.equipment;
    return { ...previous, ...schematic, memory, blocks, level, pump, equipment, seconds: previous.seconds + dt, cycle: previous.cycle + 1, fault: null };
  } catch (error) {
    return { ...previous, fault: error instanceof Error ? error.message : "Error de simulaci\xF3n.", pump: false, active: [], relays: {} };
  }
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
      if (!["coil", "set", "reset", "ton", "tof", "tp", "ctu", "ctd", "ctud", "rise", "fall"].includes(mode)) throw new Error("Instrucci\xF3n desconocida.");
      return { id: text(r.id, "ID"), comment: text(r.comment, "Comentario", 500), branches: list(r.branches, "Ramas", 32).map((b) => list(b, "Contactos", 32).map((v2) => {
        const c = requireObject(v2, "Contacto");
        return { address: text(c.address, "Direcci\xF3n de contacto", 32), negated: bool(c.negated, "Contacto NC") };
      })), output: text(r.output, "Direcci\xF3n de salida", 32), mode, preset: num(r.preset, "Ajuste", 1e-3, 1e6), ...Object.fromEntries(["resetSignal", "loadSignal", "downSignal"].filter((k) => r[k] !== void 0).map((k) => [k, r[k] === "" ? "" : address(r[k], "Entrada del bloque")])) };
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
    if (plc.active !== void 0) {
      const active = requireObject(plc.active, "Programa activo");
      if ("active" in active) throw new Error("Programa activo anidado inv\xE1lido.");
      const validated = parseProject({ ...p, plc: active });
      if (!validated.ok) throw new Error("Programa activo: " + validated.error);
      project.plc.active = validated.project.plc;
    }
    return { ok: true, project };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo leer el proyecto." };
  }
}
export {
  compilePLC,
  emptyRuntime,
  newProject,
  parseProject,
  tick
};
