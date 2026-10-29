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

// src/lab/dc.ts
var dc_exports = {};
__export(dc_exports, {
  SOURCE_LIMIT: () => SOURCE_LIMIT,
  actualValue: () => actualValue,
  holeName: () => holeName,
  junctionCurrent: () => junctionCurrent,
  measureResistance: () => measureResistance,
  netGroups: () => netGroups,
  solveBreadboard: () => solveBreadboard,
  solveDC: () => solveDC
});
module.exports = __toCommonJS(dc_exports);

// src/lab/model.ts
var HOLES = [];
for (let col = 1; col <= 30; col++) {
  const x = 55 + (col - 1) * 24;
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 366], ["bottom-", 390]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
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
var IC_PIN_NAMES = ["EN1", "IN1", "OUT1", "GND", "GND", "OUT2", "IN2", "VS", "EN2", "IN3", "OUT3", "GND", "GND", "OUT4", "IN4", "VSS"];
function icPinHoles(from) {
  const match = /^f:(\d+)$/.exec(from);
  if (!match) return null;
  const col = Number(match[1]);
  if (col < 1 || col > 23) return null;
  return [...Array.from({ length: 8 }, (_, i) => `f:${col + i}`), ...Array.from({ length: 8 }, (_, i) => `e:${col + 7 - i}`)];
}
function bjtBase(from, to) {
  const a = /^([a-j]):(\d+)$/.exec(from), b = /^([a-j]):(\d+)$/.exec(to);
  if (!a || !b || a[1] !== b[1] || Math.abs(Number(a[2]) - Number(b[2])) !== 2) return null;
  return `${a[1]}:${(Number(a[2]) + Number(b[2])) / 2}`;
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
  for (const c of board.components) if (c.kind === "wire" || (c.kind === "switch" || c.kind === "button") && closedOf(c)) nets.join(c.from, c.to);
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
  for (const c of board.components) if (c.kind === "wire" || (c.kind === "switch" || c.kind === "button") && (switches[c.id] ?? (c.kind === "button" ? false : c.closed))) nets.join(c.from, c.to);
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
  for (const c of board.components) if (c.kind === "wire" || (c.kind === "switch" || c.kind === "button") && (switches[c.id] ?? (c.kind === "button" ? false : c.closed))) nets.join(c.from, c.to);
  return Object.fromEntries(HOLES.map((h) => [h.id, nets.find(h.id)]));
}
function holeName(id) {
  return HOLE_BY_ID.has(id) ? id.replace(":", "").replace("top+", "+ superior ").replace("top-", "\u2212 superior ").replace("bottom+", "+ inferior ").replace("bottom-", "\u2212 inferior ") : id;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SOURCE_LIMIT,
  actualValue,
  holeName,
  junctionCurrent,
  measureResistance,
  netGroups,
  solveBreadboard,
  solveDC
});
