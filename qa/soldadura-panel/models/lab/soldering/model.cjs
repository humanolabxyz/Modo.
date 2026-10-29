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

// src/lab/soldering/model.ts
var model_exports = {};
__export(model_exports, {
  ALLOYS: () => ALLOYS,
  cleanTip: () => cleanTip,
  jointFinished: () => jointFinished,
  newStation: () => newStation,
  solder: () => solder,
  stepStation: () => stepStation
});
module.exports = __toCommonJS(model_exports);
var ALLOYS = { sn63: { label: "Sn63Pb37 \xB7 n\xFAcleo de resina", liquidus: 183 }, sac305: { label: "SAC305 \xB7 sin plomo", liquidus: 220 } };
var newStation = () => ({ on: false, setpoint: 330, tip: 22, joint: 22, clean: false, tinned: false, alloy: "sn63", flux: false, quality: "none", contact: false, overheat: 0 });
function stepStation(s, dt) {
  dt = Math.max(0, Math.min(dt, 0.5));
  const goal = s.on ? s.setpoint : 22;
  let tip = s.tip + (goal - s.tip) * (1 - Math.exp(-dt / 1.8));
  if (Math.abs(tip - goal) < 5e-3) tip = goal;
  const target = s.contact ? tip : 22;
  let joint = s.joint + (target - s.joint) * (1 - Math.exp(-dt / (s.contact ? s.clean && s.tinned ? 1.5 : 5 : 1.3)));
  if (Math.abs(joint - target) < 5e-3) joint = target;
  const overheat = s.contact && joint > 300 ? s.overheat + dt : Math.max(0, s.overheat - dt);
  return tip === s.tip && joint === s.joint && overheat === s.overheat ? s : { ...s, tip, joint, overheat };
}
function cleanTip(s, method, moist = true) {
  if (method === "sponge" && !moist) return { state: s, message: "La esponja debe estar humedecida y escurrida; no limpia como una esponja seca." };
  return { state: { ...s, clean: true, tinned: method === "restorer" || method === "brass" && s.tinned, tip: Math.max(22, s.tip - (method === "sponge" ? 30 : 5)) }, message: method === "restorer" ? "Restaurador espec\xEDfico de punta. Retira residuos y vuelve a esta\xF1ar; no es flux de uni\xF3n." : "Punta limpia. Comprueba el esta\xF1ado antes de calentar la uni\xF3n." };
}
function solder(s, target, joined) {
  const liquidus = ALLOYS[s.alloy].liquidus;
  if (s.tip < liquidus) return { state: s, message: "Enciende la estaci\xF3n y espera que la punta pueda fundir esta aleaci\xF3n." };
  if (target === "tip") return !s.clean ? { state: s, message: "Limpia primero la punta oxidada." } : { state: { ...s, tinned: true }, message: "Punta esta\xF1ada: una pel\xEDcula de soldadura mejora la transferencia de calor." };
  if (!joined) return { state: s, message: "Prepara y sujeta el conductor antes de aportar soldadura." };
  if (!s.contact || !s.clean || !s.tinned || s.joint < liquidus) return { state: { ...s, quality: "cold" }, message: "Uni\xF3n fr\xEDa: no basta fundir una gota sobre el caut\xEDn. Calienta conductor y terminal y rehace la uni\xF3n." };
  if (s.quality === "cold" || s.quality === "disturbed") return { state: s, message: "Retira la soldadura defectuosa con la malla y repite el proceso." };
  if (s.overheat > 5) return { state: s, message: "Exceso de calor en el modelo: retira el caut\xEDn y revisa aislamiento y terminal." };
  return { state: { ...s, quality: "wet", flux: true }, message: "Mojado de conductor y terminal. El hilo aporta flux de su n\xFAcleo; retira hilo y caut\xEDn y deja enfriar sin mover." };
}
var jointFinished = (s) => s.quality === "wet" && !s.contact && s.joint < 50;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALLOYS,
  cleanTip,
  jointFinished,
  newStation,
  solder,
  stepStation
});
