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

// src/study/calcEngine.ts
var calcEngine_exports = {};
__export(calcEngine_exports, {
  CalcError: () => CalcError,
  evaluate: () => evaluate,
  formatResult: () => formatResult
});
module.exports = __toCommonJS(calcEngine_exports);
var CalcError = class extends Error {
};
function tokenize(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.,]/.test(c)) {
      let j = i;
      let dots = 0;
      while (j < src.length && /[0-9.,]/.test(src[j])) {
        if (src[j] === "." || src[j] === ",") dots++;
        j++;
      }
      if (dots > 1) throw new CalcError("N\xFAmero con dos comas");
      const raw = src.slice(i, j).replace(",", ".");
      const v = Number(raw === "." ? NaN : raw);
      if (!Number.isFinite(v)) throw new CalcError("N\xFAmero no v\xE1lido");
      out.push({ t: "n", v });
      i = j;
      continue;
    }
    if (c === "+") out.push({ t: "op", v: "+" });
    else if (c === "-" || c === "\u2212") out.push({ t: "op", v: "-" });
    else if (c === "\xD7" || c === "*" || c === "\xB7") out.push({ t: "op", v: "*" });
    else if (c === "\xF7" || c === "/") out.push({ t: "op", v: "/" });
    else if (c === "^") out.push({ t: "op", v: "^" });
    else if (c === "(" || c === ")") out.push({ t: "op", v: c });
    else if (c === "\u221A") out.push({ t: "op", v: "\u221A" });
    else throw new CalcError("Car\xE1cter no permitido");
    i++;
  }
  return out;
}
function evaluate(src) {
  const tokens = tokenize(src);
  if (tokens.length === 0) throw new CalcError("Escribe una operaci\xF3n");
  let p = 0;
  const peek = () => tokens[p];
  const isOp = (v) => peek()?.t === "op" && peek().v === v;
  const startsFactor = () => {
    const k = peek();
    return !!k && (k.t === "n" || k.t === "op" && (k.v === "(" || k.v === "\u221A"));
  };
  function expr() {
    let v = term();
    while (isOp("+") || isOp("-")) {
      const op = tokens[p++].v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term() {
    let v = unary();
    for (; ; ) {
      if (isOp("*") || isOp("/")) {
        const op = tokens[p++].v;
        const r = unary();
        if (op === "/" && r === 0) throw new CalcError("No se puede dividir por 0");
        v = op === "*" ? v * r : v / r;
      } else if (startsFactor()) {
        v *= unary();
      } else return v;
    }
  }
  function unary() {
    if (isOp("-")) {
      p++;
      return -unary();
    }
    if (isOp("+")) {
      p++;
      return unary();
    }
    return power();
  }
  function power() {
    const base = atom();
    if (isOp("^")) {
      p++;
      return Math.pow(base, unary());
    }
    return base;
  }
  function atom() {
    const k = peek();
    if (!k) throw new CalcError("Falta un n\xFAmero");
    if (k.t === "n") {
      p++;
      return k.v;
    }
    if (k.v === "(") {
      p++;
      const v = expr();
      if (!isOp(")")) throw new CalcError("Falta cerrar el par\xE9ntesis");
      p++;
      return v;
    }
    if (k.v === "\u221A") {
      p++;
      const v = atom();
      if (v < 0) throw new CalcError("No existe la ra\xEDz de un negativo");
      return Math.sqrt(v);
    }
    throw new CalcError("Revisa la operaci\xF3n");
  }
  const result = expr();
  if (p < tokens.length) throw new CalcError(isOp(")") ? "Par\xE9ntesis de m\xE1s" : "Revisa la operaci\xF3n");
  if (!Number.isFinite(result)) throw new CalcError("Resultado fuera de rango");
  return result;
}
function formatResult(n) {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) return n.toExponential(6).replace(".", ",").replace(/,?0+e/, "e");
  const rounded = Number(n.toPrecision(10));
  return rounded.toLocaleString("es-CL", { useGrouping: false, maximumFractionDigits: 10 });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CalcError,
  evaluate,
  formatResult
});
