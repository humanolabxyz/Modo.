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

// src/lab/units.ts
var units_exports = {};
__export(units_exports, {
  COMMON_OHMS: () => COMMON_OHMS,
  COMMON_SUPPLY: () => COMMON_SUPPLY,
  LED_DROP_MAX: () => LED_DROP_MAX,
  LED_DROP_MIN: () => LED_DROP_MIN,
  OHM_MAX: () => OHM_MAX,
  OHM_MIN: () => OHM_MIN,
  OHM_UNITS: () => OHM_UNITS,
  SUPPLY_MAX: () => SUPPLY_MAX,
  SUPPLY_MIN: () => SUPPLY_MIN,
  formatAmps: () => formatAmps,
  formatNumber: () => formatNumber,
  formatOhms: () => formatOhms,
  formatReading: () => formatReading,
  formatVolts: () => formatVolts,
  parseGain: () => parseGain,
  parseOhms: () => parseOhms,
  parseVolts: () => parseVolts,
  resistorBands: () => resistorBands,
  splitOhms: () => splitOhms
});
module.exports = __toCommonJS(units_exports);
var OHM_MIN = 1;
var OHM_MAX = 1e7;
var SUPPLY_MIN = 0.1;
var SUPPLY_MAX = 30;
var LED_DROP_MIN = 0.1;
var LED_DROP_MAX = 5;
var OHM_UNITS = [{ unit: "\u03A9", factor: 1 }, { unit: "k\u03A9", factor: 1e3 }, { unit: "M\u03A9", factor: 1e6 }];
var COMMON_OHMS = [220, 330, 470, 1e3, 4700, 1e4];
var COMMON_SUPPLY = [3.3, 5, 9, 12, 24];
var fail = (error) => ({ ok: false, error });
function formatNumber(n, maxDecimals = 6) {
  if (!Number.isFinite(n)) return "\u2014";
  const text = String(Number(n.toFixed(maxDecimals)));
  return text.includes("e") ? n.toExponential(3).replace(".", ",") : text.replace(".", ",");
}
function formatOhms(ohms) {
  if (!Number.isFinite(ohms)) return "\u2014 \u03A9";
  if (ohms >= 1e6) return `${formatNumber(Number((ohms / 1e6).toPrecision(10)))} M\u03A9`;
  if (ohms >= 1e3) return `${formatNumber(Number((ohms / 1e3).toPrecision(10)))} k\u03A9`;
  return `${formatNumber(Number(ohms.toPrecision(10)))} \u03A9`;
}
function splitOhms(ohms) {
  const unit = ohms >= 1e6 ? "M\u03A9" : ohms >= 1e3 ? "k\u03A9" : "\u03A9", factor = unit === "M\u03A9" ? 1e6 : unit === "k\u03A9" ? 1e3 : 1;
  return { text: formatNumber(Number((ohms / factor).toPrecision(10))), unit };
}
function formatVolts(volts) {
  return `${formatNumber(Number(volts.toPrecision(10)), 3)} V`;
}
function formatAmps(amps) {
  const a = Math.abs(amps);
  if (!Number.isFinite(amps)) return "\u2014 mA";
  if (a >= 1) return `${formatNumber(amps, 3)} A`;
  if (a > 0 && a < 5e-4) return `${formatNumber(amps * 1e6, 1)} \xB5A`;
  return `${formatNumber(amps * 1e3, 3)} mA`;
}
var GROUP_FIRST = /^\d{1,3}$/;
var GROUP_NEXT = /^\d{3}$/;
function splitNumber(raw) {
  let t = raw.trim().replace(/ω/gi, "").replace(/ohm(?:io)?s?/gi, "").trim();
  if (!t) return fail("Escribe un valor.");
  const compact = /^(\d+)([kKMrR])(\d+)$/.exec(t);
  if (compact) return { ok: true, digits: `${compact[1]}${compact[3]}`, exponent: -compact[3].length, unit: compact[2] };
  const match = /^([0-9][0-9.,\s]*|[.,][0-9]+)\s*([A-Za-zµ]*)$/.exec(t);
  if (!match) return fail(`No se entiende \xAB${raw.trim().slice(0, 24)}\xBB. Usa n\xFAmeros como 220 o 4,7.`);
  let number = match[1].trim();
  const unit = match[2];
  if (/\s/.test(number)) {
    if (!/^\d{1,3}(\s\d{3})+([.,]\d+)?$/.test(number)) return fail("Hay espacios dentro del n\xFAmero. Escribe 4700 o 4,7.");
    number = number.replace(/\s+/g, "");
  }
  const separators = [...number].filter((c) => c === "." || c === ",");
  let integer = number, fraction = "";
  if (separators.length === 1) {
    const [a, b] = number.split(/[.,]/);
    if (b === "") return fail("El n\xFAmero est\xE1 incompleto: falta la parte decimal.");
    if (b.length === 3 && a !== "" && GROUP_FIRST.test(a) && !a.startsWith("0")) return fail(`\xAB${number}\xBB es ambiguo (\xBFdecimal o miles?). Escribe ${a}${b} o ${a},${b} con una unidad.`);
    integer = a === "" ? "0" : a;
    fraction = b;
  } else if (separators.length > 1) {
    const decimal = separators.at(-1), other = decimal === "." ? "," : ".", last = number.lastIndexOf(decimal);
    const lastDecimalPart = number.slice(last + 1);
    const hasMixed = separators.some((c) => c !== decimal);
    if (hasMixed) {
      const head = number.slice(0, last).split(other);
      if (number.slice(0, last).includes(decimal) || !GROUP_FIRST.test(head[0]) || !head.slice(1).every((g) => GROUP_NEXT.test(g)) || lastDecimalPart === "") return fail("Separadores mezclados: escribe 4700 o 4,7.");
      integer = head.join("");
      fraction = lastDecimalPart;
    } else {
      const groups = number.split(decimal);
      if (!GROUP_FIRST.test(groups[0]) || !groups.slice(1).every((g) => GROUP_NEXT.test(g))) return fail("Hay demasiados separadores. Escribe 4700 o 4,7.");
      integer = groups.join("");
    }
  }
  if (!/^\d+$/.test(integer) || fraction !== "" && !/^\d+$/.test(fraction)) return fail("El n\xFAmero no es v\xE1lido.");
  return { ok: true, digits: `${integer}${fraction}`, exponent: -fraction.length, unit };
}
var exact = (digits, exponent) => Number(`${digits}e${exponent}`);
function parseOhms(text, defaultUnit = "\u03A9", min = OHM_MIN, max = OHM_MAX) {
  const split = splitNumber(text);
  if (!split.ok) return split;
  let power = defaultUnit === "M\u03A9" ? 6 : defaultUnit === "k\u03A9" ? 3 : 0;
  const unit = split.unit;
  if (unit === "k" || unit === "K") power = 3;
  else if (unit === "M" || /^meg(a)?$/i.test(unit)) power = 6;
  else if (unit === "m") return fail("\xABm\xBB es ambiguo: usa k para kilo o M para mega.");
  else if (unit === "r" || unit === "R") power = 0;
  else if (unit !== "" && !/^(ohm|o)$/i.test(unit)) return fail(`Unidad \xAB${unit}\xBB no reconocida. Usa \u03A9, k\u03A9 o M\u03A9.`);
  const value = exact(split.digits, split.exponent + power);
  if (!Number.isFinite(value) || value < min || value > max) return fail(`El valor debe estar entre ${formatOhms(min)} y ${formatOhms(max)}.`);
  return { ok: true, value };
}
function parseVolts(text, min, max) {
  const split = splitNumber(text);
  if (!split.ok) return split;
  if (split.unit !== "" && !/^v$/i.test(split.unit)) return fail(`Unidad \xAB${split.unit}\xBB no reconocida. Usa V.`);
  const value = exact(split.digits, split.exponent);
  if (!Number.isFinite(value) || value < min || value > max) return fail(`El valor debe estar entre ${formatVolts(min)} y ${formatVolts(max)}.`);
  return { ok: true, value };
}
var DIGIT_COLORS = ["#1f1f1f", "#7b4426", "#cf3a2f", "#e5822a", "#e8c62d", "#3f9a52", "#2f6fc0", "#7f55b2", "#8d9093", "#f2f2ee"];
var GOLD = "#c9a227";
var SILVER = "#bec4c8";
function resistorBands(ohms) {
  if (!Number.isFinite(ohms) || ohms < OHM_MIN || ohms > OHM_MAX) return null;
  for (let multiplier = -2; multiplier <= 7; multiplier++) {
    const scaled = ohms / Math.pow(10, multiplier);
    if (scaled < 10 - 1e-9 || scaled > 99 + 1e-9) continue;
    const digits = Math.round(scaled);
    if (Math.abs(scaled - digits) > 1e-7) continue;
    const color = multiplier >= 0 ? DIGIT_COLORS[multiplier] : multiplier === -1 ? GOLD : SILVER;
    return [DIGIT_COLORS[Math.floor(digits / 10)], DIGIT_COLORS[digits % 10], color];
  }
  return null;
}
function parseGain(text, min = 10, max = 1e3) {
  const split = splitNumber(text);
  if (!split.ok) return split;
  if (split.unit !== "") return fail("La ganancia no lleva unidad: escribe, por ejemplo, 100.");
  const value = exact(split.digits, split.exponent);
  if (!Number.isFinite(value) || value < min || value > max) return fail(`La ganancia debe estar entre ${min} y ${max}.`);
  return { ok: true, value };
}
function formatReading(kind, value) {
  const abs = Math.abs(value), fixed = (n, d) => (Math.abs(n) < 10 ** -d / 2 ? 0 : n).toFixed(d).replace(".", ",");
  const ranges = kind === "voltage" ? [[6, 1, 3, "V"], [60, 1, 2, "V"], [600, 1, 1, "V"], [1e3, 1, 0, "V"]] : kind === "current" ? [[6, 1, 3, "A"], [10, 1, 2, "A"]] : [[600, 1, 1, "\u03A9"], [6e3, 1e3, 3, "k\u03A9"], [6e4, 1e3, 2, "k\u03A9"], [6e5, 1e3, 1, "k\u03A9"], [6e6, 1e6, 3, "M\u03A9"], [5e7, 1e6, 2, "M\u03A9"]];
  for (let i = 0; i < ranges.length; i++) {
    const [limit, factor, d, unit] = ranges[i];
    const rounded = Number((abs / factor).toFixed(d)) * factor, last = i === ranges.length - 1;
    if (last ? abs <= limit : rounded < limit) return { text: fixed(value / factor, d), unit };
  }
  return { text: "OL", unit: "" };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COMMON_OHMS,
  COMMON_SUPPLY,
  LED_DROP_MAX,
  LED_DROP_MIN,
  OHM_MAX,
  OHM_MIN,
  OHM_UNITS,
  SUPPLY_MAX,
  SUPPLY_MIN,
  formatAmps,
  formatNumber,
  formatOhms,
  formatReading,
  formatVolts,
  parseGain,
  parseOhms,
  parseVolts,
  resistorBands,
  splitOhms
});
