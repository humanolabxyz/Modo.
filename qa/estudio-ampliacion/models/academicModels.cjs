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

// src/study/academicModels.ts
var academicModels_exports = {};
__export(academicModels_exports, {
  cableConnected: () => cableConnected,
  cableSignature: () => cableSignature,
  cableTargets: () => cableTargets,
  cableValid: () => cableValid,
  clamp: () => clamp,
  crc: () => crc,
  decimal: () => decimal,
  diode: () => diode,
  evaluatePolynomial: () => evaluatePolynomial,
  followerPoints: () => followerPoints,
  freshCable: () => freshCable,
  levelSample: () => levelSample,
  lineCode: () => lineCode,
  linearMap: () => linearMap,
  linkValid: () => linkValid,
  opamp: () => opamp,
  parity: () => parity,
  polynomialFit: () => polynomialFit,
  regression: () => regression,
  statistics: () => statistics,
  stockPoints: () => stockPoints,
  temperatureSample: () => temperatureSample,
  transistor: () => transistor
});
module.exports = __toCommonJS(academicModels_exports);
function decimal(raw) {
  const text = raw.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}
function statistics(values, reference) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { mean, bias: mean - reference, deviation: Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / (values.length - 1)) };
}
var temperatureSample = [98.7, 99, 98.8, 98.9, 98.7, 98.8, 98.9, 98.8, 98.7, 98.9];
var levelSample = [1.48, 1.51, 1.49, 1.48, 1.52, 1.49, 1.52, 1.51, 1.48, 1.49];
var clamp = (n, min, max) => Math.min(max, Math.max(min, n));
var linearMap = (x, lo, hi, outLo, outHi) => outLo + (x - lo) * (outHi - outLo) / (hi - lo);
function diode(v, r, forward, drop = 0.7) {
  return forward && r > 0 ? Math.max(0, (v - drop) / r) : 0;
}
function transistor(v, rb, rc, beta = 100) {
  const ib = Math.max(0, (v - 0.7) / rb), ic = Math.min(beta * ib, Math.max(0, (10 - 0.2) / rc));
  return { ib, ic, vce: 10 - ic * rc, region: ib === 0 ? "Corte" : beta * ib >= (10 - 0.2) / rc ? "Saturaci\xF3n" : "Activa" };
}
function opamp(input, gain, offset, rail = 12) {
  const ideal = input * gain + offset;
  return { ideal, output: clamp(ideal, -rail, rail), saturated: Math.abs(ideal) > rail };
}
function lineCode(bits, kind, initial = 0) {
  let state = initial;
  const out = [];
  for (const bit of bits) {
    const b = Number(bit);
    if (kind === "NRZ-L") out.push(b, b);
    else if (kind === "NRZ-I") {
      if (b) state = 1 - state;
      out.push(state, state);
    } else if (kind === "Manchester") out.push(b ? 0 : 1, b ? 1 : 0);
    else {
      if (!b) state = 1 - state;
      out.push(state, 1 - state);
      state = 1 - state;
    }
  }
  return out;
}
var parity = (bits) => [...bits].reduce((a, b) => a + Number(b), 0) % 2;
function crc(bits, polynomial = "1011") {
  const data = (bits + "0".repeat(polynomial.length - 1)).split("").map(Number), p = [...polynomial].map(Number);
  for (let i = 0; i < bits.length; i++) if (data[i]) for (let j = 0; j < p.length; j++) data[i + j] ^= p[j];
  return data.slice(-(p.length - 1)).join("");
}
function regression(points) {
  const n = points.length, sx = points.reduce((s, p) => s + p[0], 0), sy = points.reduce((s, p) => s + p[1], 0);
  const denominator = n * points.reduce((s, p) => s + p[0] ** 2, 0) - sx ** 2;
  if (!n || denominator === 0) return null;
  const m = (n * points.reduce((s, p) => s + p[0] * p[1], 0) - sx * sy) / denominator;
  return { m, b: (sy - m * sx) / n };
}
function polynomialFit(points, degree) {
  if (!Number.isInteger(degree) || degree < 1 || degree > 3 || points.length <= degree) throw Error("Datos insuficientes");
  const size = degree + 1, a = Array.from({ length: size }, (_, r) => [...Array.from({ length: size }, (_2, c) => points.reduce((s, [x]) => s + x ** (r + c), 0)), points.reduce((s, [x, y]) => s + y * x ** r, 0)]);
  for (let i = 0; i < size; i++) {
    let pivot = i;
    for (let j = i + 1; j < size; j++) if (Math.abs(a[j][i]) > Math.abs(a[pivot][i])) pivot = j;
    [a[i], a[pivot]] = [a[pivot], a[i]];
    if (Math.abs(a[i][i]) < 1e-12) throw Error("Ajuste singular");
    const v = a[i][i];
    for (let k = i; k <= size; k++) a[i][k] /= v;
    for (let j = 0; j < size; j++) if (j !== i) {
      const factor = a[j][i];
      for (let k = i; k <= size; k++) a[j][k] -= factor * a[i][k];
    }
  }
  return a.map((row) => row[size]);
}
var evaluatePolynomial = (coefficients, x) => coefficients.reduce((s, c, i) => s + c * x ** i, 0);
var stockPoints = [[1, 9867], [2, 9575], [3, 9102], [4, 9009], [5, 8956], [6, 8307], [7, 7802]];
var followerPoints = [[1, 485], [2, 1353], [3, 2307], [4, 2689], [5, 3005]];
var cableSignature = (s) => JSON.stringify({ revision: s.revision, cut: s.cut, wires: s.wires.map(({ color, ...electrical }) => electrical), bridge: s.bridge, flex: s.flex });
var cableTargets = [{ pin: 1, terminal: 1 }, { pin: 6, terminal: 2 }, { pin: 5, terminal: 3 }];
var freshCable = () => ({ revision: 0, cut: false, wires: cableTargets.map(() => ({ pin: 0, terminal: 0, stripped: false, tinned: false, soldered: false, tight: false, broken: false, cold: false })), bridge: false, flex: false, hmiBaud: 9600, plcBaud: 9600, hmiAddress: 1, plcAddress: 1, running: false });
function cableConnected(state, a, b) {
  const edges = /* @__PURE__ */ new Map();
  const join = (x, y) => {
    edges.set(x, [...edges.get(x) || [], y]);
    edges.set(y, [...edges.get(y) || [], x]);
  };
  state.wires.forEach((w, i) => {
    const left = `w${i}a`, right = `w${i}b`;
    if (!w.broken) join(left, right);
    if (state.cut && w.stripped && w.tinned && w.soldered && w.pin && !(w.cold && state.flex)) join(`p${w.pin}`, left);
    if (state.cut && w.stripped && w.tight && w.terminal) join(right, `t${w.terminal}`);
  });
  if (state.bridge) join("p1", "p6");
  const seen = /* @__PURE__ */ new Set(), todo = [a];
  while (todo.length) {
    const n = todo.pop();
    if (n === b) return true;
    if (seen.has(n)) continue;
    seen.add(n);
    todo.push(...edges.get(n) || []);
  }
  return false;
}
function cableValid(state) {
  return cableTargets.every(({ pin, terminal }) => cableConnected(state, `p${pin}`, `t${terminal}`) && cableTargets.every((t) => t.terminal === terminal || !cableConnected(state, `p${pin}`, `t${t.terminal}`))) && !state.wires.some((w) => w.cold || w.broken);
}
var linkValid = (state) => cableValid(state) && state.hmiBaud === state.plcBaud && state.hmiAddress === state.plcAddress;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cableConnected,
  cableSignature,
  cableTargets,
  cableValid,
  clamp,
  crc,
  decimal,
  diode,
  evaluatePolynomial,
  followerPoints,
  freshCable,
  levelSample,
  lineCode,
  linearMap,
  linkValid,
  opamp,
  parity,
  polynomialFit,
  regression,
  statistics,
  stockPoints,
  temperatureSample,
  transistor
});
