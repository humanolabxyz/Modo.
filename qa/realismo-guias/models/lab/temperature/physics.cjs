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

// src/lab/temperature/physics.ts
var physics_exports = {};
__export(physics_exports, {
  AMBIENT_MAX: () => AMBIENT_MAX,
  AMBIENT_MIN: () => AMBIENT_MIN,
  SET_MAX: () => SET_MAX,
  STABLE_BAND: () => STABLE_BAND,
  TAU: () => TAU,
  TERMINALS: () => TERMINALS,
  TX_OUT_MAX: () => TX_OUT_MAX,
  defaultSettings: () => defaultSettings,
  isStable: () => isStable,
  normalizeSettings: () => normalizeSettings,
  ptOhms: () => ptOhms,
  ptSide: () => ptSide,
  readMeter: () => readMeter,
  reference: () => reference,
  settledTemps: () => settledTemps,
  startTemps: () => startTemps,
  stepTemps: () => stepTemps,
  tcEmf: () => tcEmf,
  tcTemperature: () => tcTemperature,
  terminalSensor: () => terminalSensor,
  txTemperature: () => txTemperature,
  txVolts: () => txVolts
});
module.exports = __toCommonJS(physics_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AMBIENT_MAX,
  AMBIENT_MIN,
  SET_MAX,
  STABLE_BAND,
  TAU,
  TERMINALS,
  TX_OUT_MAX,
  defaultSettings,
  isStable,
  normalizeSettings,
  ptOhms,
  ptSide,
  readMeter,
  reference,
  settledTemps,
  startTemps,
  stepTemps,
  tcEmf,
  tcTemperature,
  terminalSensor,
  txTemperature,
  txVolts
});
