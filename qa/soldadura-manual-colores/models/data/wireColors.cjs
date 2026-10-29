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

// src/data/wireColors.ts
var wireColors_exports = {};
__export(wireColors_exports, {
  DEFAULT_CABLE_COLORS: () => DEFAULT_CABLE_COLORS,
  WIRE_PALETTE: () => WIRE_PALETTE,
  isWireColor: () => isWireColor,
  wireColor: () => wireColor,
  wireColorName: () => wireColorName
});
module.exports = __toCommonJS(wireColors_exports);
var WIRE_PALETTE = [
  { name: "Petr\xF3leo", hex: "#145650" },
  { name: "Rojo", hex: "#c53943" },
  { name: "Azul", hex: "#2978c8" },
  { name: "Amarillo", hex: "#d8ab28" },
  { name: "Negro", hex: "#343b42" },
  { name: "Blanco", hex: "#f4f1e7" },
  { name: "Verde", hex: "#32834b" },
  { name: "Naranja", hex: "#e07b2a" },
  { name: "Violeta", hex: "#8755b4" },
  { name: "Gris", hex: "#929aa3" },
  { name: "Marr\xF3n", hex: "#855535" },
  { name: "Rosa", hex: "#d77eab" }
];
var isWireColor = (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
var DEFAULT_CABLE_COLORS = ["#2575a5", "#dce4e9", "#344249"];
var wireColor = (wire, index) => isWireColor(wire.color) ? wire.color : DEFAULT_CABLE_COLORS[index % 3];
var wireColorName = (color) => WIRE_PALETTE.find((c) => c.hex.toLowerCase() === color.toLowerCase())?.name ?? color;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_CABLE_COLORS,
  WIRE_PALETTE,
  isWireColor,
  wireColor,
  wireColorName
});
