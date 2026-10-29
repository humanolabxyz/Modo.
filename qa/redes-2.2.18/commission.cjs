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

// src/lab/soldering/commissioning.ts
var commissioning_exports = {};
__export(commissioning_exports, {
  commissionComplete: () => commissionComplete,
  newCommission: () => newCommission,
  project: () => project,
  stepCommission: () => stepCommission,
  terminalsReady: () => terminalsReady,
  transferProblem: () => transferProblem
});
module.exports = __toCommonJS(commissioning_exports);

// src/study/serialProtocol.ts
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
function transaction(setup, request, coil, allowedAddress = 0) {
  const result = (reason, response = [], next = coil) => ({ ok: !!response.length && response[1] < 128, reason, response, coil: next });
  if (!setup.wired) return result("Sin camino el\xE9ctrico v\xE1lido: revisar continuidad y aislamiento.");
  if (setup.clientBaud !== setup.serverBaud || setup.clientParity !== setup.serverParity || setup.clientStop !== setup.serverStop) return result("Timeout: formato serie incompatible (velocidad, paridad o bits de parada).");
  if (!validFrame(request)) return result("Trama descartada: CRC16 incorrecto; la salida conserva su estado.");
  if (request[0] !== setup.server || request[0] !== setup.destination || request[0] === 0) return result("Timeout: el destinatario no responde a esa direcci\xF3n unicast.");
  if (request.length !== 8) return result("Longitud de trama no admitida.");
  const fn = request[1], address = request[2] << 8 | request[3], data = request[4] << 8 | request[5];
  if (address !== allowedAddress) return result("Excepci\xF3n 02: direcci\xF3n de dato no disponible.", frame([request[0], fn | 128, 2]));
  if (fn === 5) {
    if (data !== 0 && data !== 65280) return result("Excepci\xF3n 03: valor de bobina inv\xE1lido.", frame([request[0], 133, 3]));
    return result("Respuesta v\xE1lida: escritura de bobina confirmada.", request.slice(), data === 65280);
  }
  if (fn === 3 && data !== 1) return result("Excepci\xF3n 03: este banco admite un registro por lectura.", frame([request[0], 131, 3]));
  if (fn === 3 && data === 1) return result("Respuesta v\xE1lida: registro de estado le\xEDdo.", frame([request[0], 3, 2, 0, coil ? 1 : 0]));
  return result("Excepci\xF3n 01: funci\xF3n no implementada en este banco.", frame([request[0], fn | 128, 1]));
}

// src/lab/soldering/commissioning.ts
var project = () => ({ baud: 9600, address: 1, contact: false, coil: false, start: false, stop: false, stopContact: false, reset: false, stopContactAddress: "M1", resetAddress: "Y0", contactAddress: "M0", coilAddress: "Y0", startAddress: "M0", stopAddress: "M1" });
var newCommission = () => ({ hmiPower: false, plcPower: false, plcPlugged: false, db9: false, terminal: false, terminations: [0, 1, 2].map(() => ({ slot: null, tight: false })), released: [false, false, false], usb: null, run: false, hmi: project(), plc: project(), compiledHmi: null, compiledPlc: null, loadedHmi: null, loadedPlc: null, memory: false, output: false, display: null, started: false, stopped: false, failedBaud: false, recovered: false, signature: "", log: [] });
var terminalsReady = (s) => s.terminations.length === 3 && s.terminations.every((t, i) => t.slot === i + 1 && t.tight);
function stepCommission(previous, action, cable) {
  let s = { ...previous, log: [...previous.log] };
  const note = (message) => {
    s.log = [message, ...s.log].slice(0, 24);
    return s;
  };
  if (s.signature !== cable.signature) {
    s = { ...s, signature: cable.signature, started: false, stopped: false, failedBaud: false, recovered: false, display: null };
  }
  if (action.type === "insert" || action.type === "screw" || action.type === "remove") {
    if (s.hmiPower || s.plcPower) return note("Apaga ambos equipos antes de trabajar en las entradas o los tornillos.");
    const rows = s.terminations.map((t) => ({ ...t }));
    if (action.type === "insert") {
      if (!Number.isInteger(action.wire) || action.wire < 0 || action.wire > 2 || ![1, 2, 3].includes(action.slot)) return note("Entrada de bornera no v\xE1lida.");
      if (rows[action.wire].tight) return note("El conductor est\xE1 sujeto: afloja el tornillo antes de retirarlo.");
      if (rows.some((t, i) => i !== action.wire && t.slot === action.slot)) return note("Entrada ocupada. Retira el otro conductor antes de insertar este.");
      if (!s.released[action.slot - 1]) return note(`Afloja primero el tornillo T${action.slot} para abrir la entrada superior.`);
      rows[action.wire] = { slot: action.slot, tight: false };
    } else if (action.type === "remove") {
      if (!rows[action.wire]) return s;
      if (rows[action.wire].tight) return note("El conductor est\xE1 sujeto: afloja el tornillo antes de retirarlo.");
      rows[action.wire] = { slot: null, tight: false };
    } else {
      if (![1, 2, 3].includes(action.slot)) return s;
      const released = [...s.released];
      released[action.slot - 1] = !released[action.slot - 1];
      s.released = released;
      const wire = rows.findIndex((t) => t.slot === action.slot);
      if (wire >= 0) rows[wire].tight = !released[action.slot - 1];
    }
    s.terminations = rows;
    s.terminal = terminalsReady(s);
    s.display = null;
    s.started = false;
    s.stopped = false;
    s.failedBaud = false;
    s.recovered = false;
    return note(action.type === "insert" ? `Conductor ${action.wire + 1} insertado en T${action.slot}. Falta apretar su tornillo.` : action.type === "remove" ? `Conductor ${action.wire + 1} retirado.` : `Tornillo T${action.slot} ${s.released[action.slot - 1] ? "aflojado: entrada superior abierta" : "apretado: entrada cerrada"}.`);
  }
  if (action.type === "plcPlug") {
    if (s.hmiPower || s.plcPower) return note("Apaga los equipos antes de enchufar o retirar el conector del PLC.");
    s.plcPlugged = !s.plcPlugged;
    s.display = null;
    s.started = false;
    s.stopped = false;
    s.failedBaud = false;
    s.recovered = false;
    return note(s.plcPlugged ? "Conector de tres v\xEDas enchufado al puerto del PLC." : "Conector retirado del PLC.");
  }
  if (action.type === "edit") return { ...s, [action.device]: { ...s[action.device], ...action.patch } };
  if (action.type === "power") {
    const key = action.device === "hmi" ? "hmiPower" : "plcPower";
    s[key] = !s[key];
    s.display = null;
    if (action.device === "plc" && !s.plcPower) {
      s.memory = false;
      s.output = false;
    }
    s.started = false;
    s.stopped = false;
    s.failedBaud = false;
    s.recovered = false;
    return note(`${action.device.toUpperCase()} ${s[key] ? "encendido" : "apagado"}.`);
  }
  if (action.type === "connect") {
    if (action.end === "terminal") return note("Conecta los tres conductores en sus entradas y aprieta cada tornillo; la bornera no se conecta con un bot\xF3n.");
    if (s.hmiPower || s.plcPower) return note("Apaga ambos equipos antes de conectar o retirar el cable.");
    s[action.end] = !s[action.end];
    s.display = null;
    return note(`${action.end === "db9" ? "DB9 \xB7 COM2 HMI" : "Bornera RS-485 PLC"} ${s[action.end] ? "conectado" : "retirado"}.`);
  }
  if (action.type === "usb") {
    s.usb = s.usb === action.device ? null : action.device;
    return note(s.usb ? `USB de programaci\xF3n conectado al ${action.device.toUpperCase()}.` : "USB retirado.");
  }
  if (action.type === "compile") {
    const device = action.device;
    if (device === "plc" && (!s.plc.contact || !s.plc.coil || !s.plc.stopContact || !s.plc.reset)) return note("Compilaci\xF3n: completa las redes Arranque \u2192 SET Motor y Parada \u2192 RESET Motor.");
    if (device === "hmi" && (!s.hmi.start || !s.hmi.stop)) return note("Compilaci\xF3n: a\xF1ade los botones de marcha y paro a la pantalla.");
    if (device === "plc" && (s.plc.contactAddress !== "M0" || s.plc.coilAddress !== "Y0" || s.plc.stopContactAddress !== "M1" || s.plc.resetAddress !== "Y0")) return note("Compilaci\xF3n de esta pr\xE1ctica: usa M0 para arranque, M1 para parada y Y0 en SET y RESET. No asignes una entrada X como bobina.");
    if (device === "hmi" && (s.hmi.startAddress !== "M0" || s.hmi.stopAddress !== "M1")) return note("Revisa Write Address: marcha escribe M0 (Arranque) y paro escribe M1 (Parada) del PLC.");
    if (device === "hmi") s.compiledHmi = { ...s.hmi };
    else s.compiledPlc = { ...s.plc };
    return note(`${device === "hmi" ? "DOPSoft" : "ISPSoft"}: compilaci\xF3n correcta en la laptop. Proyecto preparado; a\xFAn no se ha transferido al equipo.`);
  }
  if (action.type === "download") {
    const device = action.device, problem = transferProblem(s, device);
    if (problem) return note(problem);
    const sameLogic = device === "hmi" && s.loadedHmi?.start === s.hmi.start && s.loadedHmi?.stop === s.hmi.stop && s.loadedHmi?.address === s.hmi.address && s.loadedHmi?.startAddress === s.hmi.startAddress && s.loadedHmi?.stopAddress === s.hmi.stopAddress;
    if (device === "hmi") {
      s.loadedHmi = { ...s.hmi };
      s.display = null;
    } else {
      s.loadedPlc = { ...s.plc };
      s.run = false;
      s.memory = false;
      s.output = false;
    }
    if (!sameLogic) {
      s.started = false;
      s.stopped = false;
      s.failedBaud = false;
    }
    s.recovered = false;
    return note(`${device === "hmi" ? "DOPSoft" : "ISPSoft"}: programa transferido y verificado en el equipo. ${device === "plc" ? "PLC en STOP." : ""}`);
  }
  if (action.type === "run") {
    s.run = !s.run;
    if (!s.run) {
      s.output = false;
      s.started = false;
      s.stopped = false;
      s.failedBaud = false;
      s.recovered = false;
    }
    return note(`Palanca en ${s.run ? "RUN" : "STOP"}${!s.plcPower ? " \xB7 PLC sin alimentaci\xF3n" : !s.loadedPlc ? " \xB7 falta transferir el programa" : ""}.`);
  }
  if (!s.hmiPower || !s.plcPower || !s.loadedHmi || !s.loadedPlc || !s.run) {
    s.display = null;
    return note("Sin ensayo: enciende ambos equipos, carga los dos programas y coloca el PLC en RUN.");
  }
  if (action.command !== "read" && !(action.command === "start" ? s.loadedHmi.start : s.loadedHmi.stop)) return note("Ese bot\xF3n no est\xE1 en el proyecto cargado.");
  const h = s.loadedHmi, p = s.loadedPlc;
  const request = frame(action.command === "read" ? [h.address, 3, 0, 0, 0, 1] : [h.address, 5, 0, action.command === "stop" ? 1 : 0, 255, 0]);
  const result = transaction({ clientBaud: h.baud, serverBaud: p.baud, destination: h.address, server: p.address, clientParity: "E", serverParity: "E", clientStop: 1, serverStop: 1, wired: cable.valid && s.db9 && s.plcPlugged && terminalsReady(s) }, request, s.output, action.command === "stop" ? 1 : 0);
  s.memory = result.ok && action.command === "start";
  if (result.ok) {
    if (action.command === "start" && p.contact && p.coil) s.output = true;
    if (action.command === "stop" && p.stopContact && p.reset) s.output = false;
    s.display = s.output;
    if (cable.verified) {
      if (action.command === "start" && s.output) s.started = true;
      if (action.command === "stop" && !s.output && s.started) s.stopped = true;
      if (s.failedBaud && h.baud === p.baud) s.recovered = true;
    }
  } else {
    s.display = null;
    if (cable.valid && cable.verified && s.db9 && s.plcPlugged && s.terminal && s.started && s.stopped && h.baud === 115200 && p.baud !== h.baud && h.address === p.address) s.failedBaud = true;
  }
  return note(`TX ${hex(request)} \xB7 ${result.response.length ? `RX ${hex(result.response)}` : "sin respuesta"} \xB7 ${result.reason}${!cable.verified ? " Cable pendiente de seis medidas." : ""}`);
}
function commissionComplete(s, cable, explanation) {
  return cable.valid && cable.verified && s.signature === cable.signature && s.hmiPower && s.plcPower && s.run && s.db9 && s.plcPlugged && s.terminal && s.display !== null && s.started && s.stopped && s.failedBaud && s.recovered && s.loadedHmi?.baud === s.loadedPlc?.baud && explanation === "baud";
}
function transferProblem(s, device) {
  const compiled = device === "hmi" ? s.compiledHmi : s.compiledPlc;
  if (!compiled || JSON.stringify(compiled) !== JSON.stringify(s[device])) return "Compila la versi\xF3n actual en la laptop antes de transferir.";
  if (s.usb !== device) return `Conecta el USB de la laptop al ${device.toUpperCase()} de destino.`;
  if (!(device === "hmi" ? s.hmiPower : s.plcPower)) return `El ${device.toUpperCase()} necesita alimentaci\xF3n para recibir datos por USB. La edici\xF3n y compilaci\xF3n se hacen sin alimentarlo.`;
  if (device === "plc" && s.run) return "Coloca la palanca del PLC en STOP para realizar la transferencia de esta pr\xE1ctica.";
  return null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commissionComplete,
  newCommission,
  project,
  stepCommission,
  terminalsReady,
  transferProblem
});
