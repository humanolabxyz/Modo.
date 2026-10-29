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

// src/lab/meterReadout.ts
var meterReadout_exports = {};
__export(meterReadout_exports, {
  parseMeterReadout: () => parseMeterReadout
});
module.exports = __toCommonJS(meterReadout_exports);
function parseMeterReadout(text) {
  const match = text.match(/^\s*(?:•\)\)\s*)?(-?\d+(?:[.,]\d+)?)\s*(mV|V|µA|μA|mA|A|MΩ|kΩ|Ω)\s*$/);
  if (!match) return null;
  const unit = match[2], factor = unit === "mV" || unit === "mA" ? 1e-3 : unit === "\xB5A" || unit === "\u03BCA" ? 1e-6 : unit === "k\u03A9" ? 1e3 : unit === "M\u03A9" ? 1e6 : 1;
  const value = Number(match[1].replace(",", ".")) * factor, digits = match[1].split(/[.,]/)[1]?.length ?? 0;
  const n = Math.abs(value) / factor;
  const range = unit === "\u03A9" ? 600 : unit === "M\u03A9" ? n < 6 ? 6 : 50 : unit === "A" ? n < 6 ? 6 : 10 : unit === "mV" ? 600 : n < 6 ? 6 : n < 60 ? 60 : n < 600 ? 600 : unit === "V" ? 1e3 : 6e3;
  return { value, factor, digits, token: match[1], unit, range, step: 10 ** -digits };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseMeterReadout
});
