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

// src/lab/componentGeometry.ts
var componentGeometry_exports = {};
__export(componentGeometry_exports, {
  bodyCollision: () => bodyCollision,
  componentBody: () => componentBody
});
module.exports = __toCommonJS(componentGeometry_exports);

// src/lab/model.ts
var HOLES = [];
for (let col = 1; col <= 30; col++) {
  const x = 55 + (col - 1) * 24;
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 386], ["bottom-", 410]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
  for (const [i, row] of [..."abcdefghij"].entries()) HOLES.push({ id: `${row}:${col}`, x, y: 135 + i * 20 + (i >= 5 ? 35 : 0), group: `${i < 5 ? "upper" : "lower"}:${col}` });
}
var HOLE_BY_ID = new Map(HOLES.map((h) => [h.id, h]));
function buttonPins(from, to) {
  const a = /^([a-j]):(\d+)$/.exec(from), b = /^([a-j]):(\d+)$/.exec(to);
  if (!a || !b || Math.abs(+a[2] - +b[2]) !== 3 || !HOLE_BY_ID.has(from) || !HOLE_BY_ID.has(to)) return null;
  const ar = "abcdefghij".indexOf(a[1]), br = "abcdefghij".indexOf(b[1]), across = a[1] === "e" && b[1] === "f" || a[1] === "f" && b[1] === "e", sameHalf = Math.floor(ar / 5) === Math.floor(br / 5) && Math.abs(ar - br) === 3;
  if (!across && !sameHalf) return null;
  return [from, `${b[1]}:${a[2]}`, `${a[1]}:${b[2]}`, to];
}

// src/lab/componentGeometry.ts
function componentBody(c) {
  const a = HOLE_BY_ID.get(c.from), b = HOLE_BY_ID.get(c.to);
  if (!a || !b || c.kind === "wire") return null;
  const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
  if (c.kind === "bjt") return { x: x - 14, y: y - 37, w: 28, h: 27 };
  if (c.kind === "l293d") return { x: a.x - 11, y: b.y + 8, w: b.x - a.x + 22, h: a.y - b.y - 16 };
  if (c.kind === "button" && buttonPins(c.from, c.to)) return { x: Math.min(a.x, b.x) + 8, y: Math.min(a.y, b.y) + 6, w: Math.abs(b.x - a.x) - 16, h: Math.abs(b.y - a.y) - 12 };
  const d = Math.hypot(b.x - a.x, b.y - a.y) || 1, cos = Math.abs(b.x - a.x) / d, sin = Math.abs(b.y - a.y) / d;
  const w = c.kind === "motor" ? 46 : c.kind === "led" ? 26 : c.kind === "resistor" ? Math.max(24, Math.min(50, d - 14)) : c.kind === "diode" ? Math.max(22, Math.min(36, d - 14)) : 30;
  const h = c.kind === "motor" ? 26 : c.kind === "led" ? 26 : c.kind === "resistor" ? 15 : c.kind === "diode" ? 11 : 26;
  const rw = w * cos + h * sin, rh = w * sin + h * cos;
  return { x: x - rw / 2, y: y - rh / 2, w: rw, h: rh };
}
function bodyCollision(c, others) {
  const a = componentBody(c);
  if (!a) return;
  return others.find((o) => {
    if (o.id === c.id) return false;
    const b = componentBody(o);
    return b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bodyCollision,
  componentBody
});
