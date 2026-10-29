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

// src/lab/soldering/manual.ts
var manual_exports = {};
__export(manual_exports, {
  DB9_CUPS: () => DB9_CUPS,
  distance: () => distance,
  dragPosition: () => dragPosition,
  nearestCup: () => nearestCup,
  spliceContact: () => spliceContact
});
module.exports = __toCommonJS(manual_exports);
var DB9_CUPS = Array.from({ length: 9 }, (_, i) => {
  const pin = i + 1;
  return { pin, x: pin <= 5 ? 390 + (5 - pin) * 40 : 410 + (9 - pin) * 40, y: pin <= 5 ? 160 : 215 };
});
var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function dragPosition(pointer, offset) {
  return { x: pointer.x - offset.x, y: pointer.y - offset.y };
}
function nearestCup(point) {
  return DB9_CUPS.find((c) => distance(point, c) < 22) ?? null;
}
function spliceContact(a, b) {
  return distance(a, b) < 25;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DB9_CUPS,
  distance,
  dragPosition,
  nearestCup,
  spliceContact
});
