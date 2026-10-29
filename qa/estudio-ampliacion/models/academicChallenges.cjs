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

// src/study/academicChallenges.ts
var academicChallenges_exports = {};
__export(academicChallenges_exports, {
  challengeItems: () => challengeItems
});
module.exports = __toCommonJS(academicChallenges_exports);
function challengeItems(course, variant) {
  const v = Math.abs(Math.trunc(variant)) % 20, k = v + 1;
  const item = (question, unit, value, reason, tolerance = 0.01) => ({ question, unit, value, reason, tolerance });
  if (course === "s2-1") return [item(`Fuente ${5 + k / 2} V, diodo directo de ca\xEDda fija 0,7 V y resistencia de 1 k\u03A9: calcula I.`, "mA", 5 + k / 2 - 0.7, "I=(V\u22120,7)/1000; convierte A a mA."), item(`No inversor ideal: ganancia 3, entrada ${1 + k / 10} V y rieles \xB112 V. Calcula la salida limitada.`, "V", Math.min(12, 3 * (1 + k / 10)), "Multiplica por 3 y contrasta con \xB112 V."), item(`Senoide pura centrada en cero con pico ${4 + k} V: calcula RMS.`, "V", (4 + k) / Math.sqrt(2), "RMS = pico/\u221A2, solo bajo las condiciones indicadas.")];
  if (course === "s2-2") return [item(`Motor de inducci\xF3n, ${k % 2 ? 50 : 60} Hz y 4 polos. Calcula la velocidad s\xEDncrona.`, "rpm", 120 * (k % 2 ? 50 : 60) / 4, "ns=120f/p."), item(`La velocidad s\xEDncrona es 1500 rpm y el rotor gira a ${1500 - 15 * k} rpm. Calcula el deslizamiento.`, "%", k, "s=(ns\u2212n)/ns; multiplica por 100."), item(`Sistema trif\xE1sico equilibrado: ${380 + k} V de l\xEDnea en estrella. Calcula Vfase.`, "V", (380 + k) / Math.sqrt(3), "En estrella Vfase=Vl\xEDnea/\u221A3; no determina la conexi\xF3n v\xE1lida de una placa.")];
  if (course === "s2-3") return [item(`Medias de ${98 + k / 10} \xB0C frente a referencia 100 \xB0C. Calcula el sesgo firmado.`, "\xB0C", 98 + k / 10 - 100, "Sesgo de la media = media \u2212 referencia."), item(`Columna est\xE1tica de agua de ${k / 2} m, \u03C1=1000 kg/m\xB3 y g=9,81 m/s\xB2. Calcula \u0394p.`, "kPa", 9.81 * k / 2, "\u03C1gh en Pa; divide entre 1000 para kPa."), item(`Transmisor lineal ideal 0\u2013100 kPa \u2192 4\u201320 mA. Calcula salida a ${5 * k} kPa.`, "mA", 4 + 16 * 5 * k / 100, "4+(p/100)\xD716. Este ejercicio no fija la configuraci\xF3n de un equipo real.")];
  if (course === "s2-4") return [item(`Env\xEDas ${k % 2 ? "10110101" : "11001001"} con paridad par. \xBFQu\xE9 bit de paridad agregas?`, "bit", k % 2 ? 1 : 0, "El total de unos, incluido el bit de paridad, debe ser par.", 0), item("Un mensaje pierde compatibilidad al cambiar el PLC de 9600 a 19200 baud. El HMI sigue en 9600. \xBFA qu\xE9 valor debes volver el PLC para igualarlos?", "baud", 9600, "Los par\xE1metros del enlace l\xF3gico deben coincidir; esto no prueba por s\xED solo el cable.", 0), item(`Manchester de la escena: cada bit contiene dos semiper\xEDodos. \xBFCu\xE1ntos semiper\xEDodos hay en ${k + 3} bits?`, "semiper\xEDodos", 2 * (k + 3), "Cada bit tiene una transici\xF3n central y dos intervalos de nivel.", 0)];
  return [item(`Cobro did\xE1ctico C(x)=200x+900. Calcula C(${k + 10}).`, "pesos", 200 * (k + 10) + 900, "Sustituye el consumo en la funci\xF3n af\xEDn."), item("Piedra base: h(t)=\u22125t\xB2+25t+40. \xBFEn qu\xE9 tiempo alcanza el m\xE1ximo?", "s", 2.5, "El v\xE9rtice se ubica en \u2212b/(2a).", 1e-3), item(`Ingreso I(x)=80000x y costo C(x)=\u22120,14x\xB2+1580x+805000000. Calcula U(${1e4 + 100 * k})=I\u2212C.`, "pesos", 0.14 * (1e4 + 100 * k) ** 2 + 78420 * (1e4 + 100 * k) - 805e6, "Resta el costo completo del ingreso; usa las ecuaciones del problema.", 1)];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  challengeItems
});
