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

// src/study/serialProtocol.ts
var serialProtocol_exports = {};
__export(serialProtocol_exports, {
  crc16: () => crc16,
  frame: () => frame,
  hex: () => hex,
  transaction: () => transaction,
  validFrame: () => validFrame
});
module.exports = __toCommonJS(serialProtocol_exports);
function crc16(bytes) {
  let crc = 65535;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? crc >>> 1 ^ 40961 : crc >>> 1;
  }
  return crc & 65535;
}
var frame = (data) => {
  const crc = crc16(data);
  return [...data, crc & 255, crc >>> 8];
};
var hex = (bytes) => bytes.map((n) => n.toString(16).padStart(2, "0").toUpperCase()).join(" ");
function validFrame(bytes) {
  return bytes.length >= 4 && bytes.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) && crc16(bytes.slice(0, -2)) === (bytes.at(-2) | bytes.at(-1) << 8);
}
function transaction(setup, request, coil) {
  const result = (reason, response = [], next = coil) => ({ ok: !!response.length && response[1] < 128, reason, response, coil: next });
  if (!setup.wired) return result("Sin camino el\xE9ctrico v\xE1lido: revisar continuidad y aislamiento.");
  if (setup.clientBaud !== setup.serverBaud || setup.clientParity !== setup.serverParity || setup.clientStop !== setup.serverStop) return result("Timeout: formato serie incompatible (velocidad, paridad o bits de parada).");
  if (!validFrame(request)) return result("Trama descartada: CRC16 incorrecto; la salida conserva su estado.");
  if (request[0] !== setup.server || request[0] !== setup.destination || request[0] === 0) return result("Timeout: el destinatario no responde a esa direcci\xF3n unicast.");
  if (request.length !== 8) return result("Longitud de trama no admitida.");
  const fn = request[1], address = request[2] << 8 | request[3], data = request[4] << 8 | request[5];
  if (address !== 0) return result("Excepci\xF3n 02: direcci\xF3n de dato no disponible.", frame([request[0], fn | 128, 2]));
  if (fn === 5) {
    if (data !== 0 && data !== 65280) return result("Excepci\xF3n 03: valor de bobina inv\xE1lido.", frame([request[0], 133, 3]));
    return result("Respuesta v\xE1lida: escritura de bobina confirmada.", request.slice(), data === 65280);
  }
  if (fn === 3 && data !== 1) return result("Excepci\xF3n 03: este banco admite un registro por lectura.", frame([request[0], 131, 3]));
  if (fn === 3 && data === 1) return result("Respuesta v\xE1lida: registro de estado le\xEDdo.", frame([request[0], 3, 2, 0, coil ? 1 : 0]));
  return result("Excepci\xF3n 01: funci\xF3n no implementada en este banco.", frame([request[0], fn | 128, 1]));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  crc16,
  frame,
  hex,
  transaction,
  validFrame
});
