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

// src/lab/temperature/state.ts
var state_exports = {};
__export(state_exports, {
  SENSOR_NAMES: () => SENSOR_NAMES,
  UNIT_OF: () => UNIT_OF,
  addRecord: () => addRecord,
  benchKey: () => benchKey,
  formatNumber: () => formatNumber,
  formatTemp: () => formatTemp,
  formatValue: () => formatValue,
  parseBench: () => parseBench,
  parseNumber: () => parseNumber,
  progressKey: () => progressKey,
  sensorName: () => sensorName,
  serializeBench: () => serializeBench,
  toCsv: () => toCsv
});
module.exports = __toCommonJS(state_exports);

// src/lab/temperature/instrument.ts
function instrumentSample(value, unit) {
  const n = Math.abs(value), digits = unit === "mV" ? n < 600 ? 1 : 0 : unit === "\u03A9" ? n < 600 ? 1 : n < 6e3 ? 0 : 0 : unit === "V" ? n < 6 ? 3 : n < 60 ? 2 : 1 : 3;
  const step = 10 ** -digits, rounded = Number((Math.round(value / step) * step).toFixed(digits));
  return { value: Object.is(rounded, -0) ? 0 : rounded, digits, step };
}

// src/lab/temperature/physics.ts
var AMBIENT_MIN = 5;
var AMBIENT_MAX = 40;
var SET_MAX = 150;
function normalizeSettings(s) {
  s = { ...s, ptLeadOhms: Math.max(0, Math.min(10, s.ptLeadOhms ?? 0)) };
  if (s.ptWires === 4) return s;
  return { ...s, red: s.red === "pt4" ? null : s.red, black: s.black === "pt4" ? null : s.black };
}

// src/lab/temperature/state.ts
var UNIT_OF = { tc: "mV", pt: "\u03A9", tx: "V" };
var SENSOR_NAMES = { tc: "Termocupla", pt: "Pt100", tx: "Salida del transmisor" };
var sensorName = (sensor, tcType) => sensor === "pt" ? "Pt100" : sensor === "tc" ? `Termocupla ${tcType ?? ""}`.trim() : `Transmisor (termocupla ${tcType ?? ""})`.replace(" ()", "");
var benchKey = (id) => `modo:temperature:bench:${id || "free"}:v1`;
var progressKey = (id) => `modo:temperature:progress:${id}:v1`;
var recordKey = (r) => `${r.source}|${r.sensor}|${r.tcType ?? "-"}|${Math.round(r.temp)}|${"ptLeadOhms" in r ? r.ptLeadOhms ?? 0 : 0}`;
function addRecord(list, record) {
  const key = recordKey(record), repeat = record.transcribed || record.source === "real", trial = repeat ? Math.max(0, ...list.filter((r) => recordKey(r) === key && Math.abs(r.ambient - record.ambient) < 0.05).map((r) => r.trial ?? 1)) + 1 : void 0;
  return [...repeat ? list : list.filter((r) => recordKey(r) !== key), { ...record, ...trial ? { trial } : {} }].sort((a, b) => a.sensor.localeCompare(b.sensor) || a.temp - b.temp);
}
var isTerminal = (v) => v === null || ["tc+", "tc-", "pt1", "pt2", "pt3", "pt4", "tx+", "tx-"].includes(v);
var num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
function serializeBench(settings, records) {
  return JSON.stringify({ version: 1, settings, records });
}
function parseBench(raw) {
  const data = JSON.parse(raw);
  if (typeof data !== "object" || data === null || data.version !== 1) throw new Error("Guardado incompatible");
  const { settings: s, records } = data;
  const w = s?.inWell;
  const wires = s?.ptWires === void 0 ? 3 : s?.ptWires;
  const ok = s && (wires === 3 || wires === 4) && num(s.ambient, AMBIENT_MIN, AMBIENT_MAX) && (s.tcType === "K" || s.tcType === "J") && (s.txType === "K" || s.txType === "J") && num(s.setpoint, AMBIENT_MIN, SET_MAX) && num(s.txMin, -50, 400) && num(s.txMax, -50, 400) && typeof s.txConnected === "boolean" && typeof s.txPowered === "boolean" && ["off", "mV", "ohm", "V"].includes(s.mode) && isTerminal(s.red) && isTerminal(s.black) && !!w && typeof w.tc === "boolean" && typeof w.pt === "boolean";
  if (!ok || s.ptLeadOhms !== void 0 && !num(s.ptLeadOhms, 0, 10)) throw new Error("Guardado incompatible");
  if (!Array.isArray(records) || records.length > 500) throw new Error("Guardado incompatible");
  for (const r of records) {
    if (typeof r !== "object" || r === null || typeof r.id !== "string" || r.id.length > 60 || r.source !== "simulada" && r.source !== "real" || !["tc", "pt", "tx"].includes(r.sensor) || !(r.tcType === null || r.tcType === "K" || r.tcType === "J") || !num(r.temp, -100, 800) || !num(r.value, -1e6, 1e6) || !["mV", "\u03A9", "V"].includes(r.unit) || !num(r.ambient, -50, 100) || !num(r.at, 0, Number.MAX_SAFE_INTEGER) || r.setpoint !== void 0 && !num(r.setpoint, -100, 800) || r.bath !== void 0 && !num(r.bath, -100, 800) || r.trial !== void 0 && (!Number.isInteger(r.trial) || !num(r.trial, 1, 500)) || r.ptLeadOhms !== void 0 && !num(r.ptLeadOhms, 0, 10) || r.transcribed !== void 0 && typeof r.transcribed !== "boolean") throw new Error("Guardado incompatible");
  }
  const migrated = { ...s, ptWires: wires };
  if (s.ptWires === void 0 && (migrated.red === "pt2" || migrated.black === "pt2")) {
    if (migrated.red === "pt2") migrated.red = "pt3";
    if (migrated.black === "pt2") migrated.black = "pt3";
  }
  return { settings: normalizeSettings(migrated), records };
}
function parseNumber(text) {
  const t = text.trim().replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}
var DIGITS = { mV: 1, "\u03A9": 1, V: 3 };
function formatNumber(value, digits) {
  const fixed = Number(value.toFixed(digits));
  return (Object.is(fixed, -0) ? 0 : fixed).toFixed(digits).replace(".", ",");
}
var formatValue = (value, unit) => `${formatNumber(instrumentSample(value, unit).value, instrumentSample(value, unit).digits)} ${unit}`;
var formatTemp = (celsius) => `${formatNumber(celsius, 1)} \xB0C`;
function toCsv(records) {
  const rows = records.map((r) => [r.source, sensorName(r.sensor, r.tcType), formatNumber(r.temp, 1), formatNumber(r.value, DIGITS[r.unit]), r.unit, formatNumber(r.ambient, 1), new Date(r.at).toLocaleString("es-CL"), r.setpoint === void 0 ? "" : formatNumber(r.setpoint, 1), r.bath === void 0 ? "" : formatNumber(r.bath, 1), r.transcribed ? "s\xED" : "", r.ptLeadOhms === void 0 ? "" : formatNumber(r.ptLeadOhms, 2), r.trial ?? ""]);
  return ["origen;sensor;temperatura_C;valor;unidad;ambiente_C;fecha;consigna_C;pozo_C;transcrito;hilo_Pt100_ohm;repeticion", ...rows.map((r) => r.join(";"))].join("\r\n");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SENSOR_NAMES,
  UNIT_OF,
  addRecord,
  benchKey,
  formatNumber,
  formatTemp,
  formatValue,
  parseBench,
  parseNumber,
  progressKey,
  sensorName,
  serializeBench,
  toCsv
});
