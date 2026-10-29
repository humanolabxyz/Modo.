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
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lab/validation.ts
var validation_exports = {};
__export(validation_exports, {
  MAX_IMPORT_BYTES: () => MAX_IMPORT_BYTES,
  parseProject: () => parseProject,
  readProject: () => readProject
});
module.exports = __toCommonJS(validation_exports);

// src/lab/model.ts
var DEVICES = [
  { kind: "supply", name: "Fuente 24 V DC", prefix: "G" },
  { kind: "no", name: "Pulsador NA", prefix: "S" },
  { kind: "nc", name: "Pulsador NC", prefix: "S" },
  { kind: "coil", name: "Bobina de rel\xE9", prefix: "K" },
  { kind: "contact", name: "Contacto auxiliar NA", prefix: "K" },
  { kind: "lamp", name: "Piloto", prefix: "H" },
  { kind: "motor", name: "Motor DC ideal", prefix: "M" },
  { kind: "output", name: "Contacto de salida PLC", prefix: "Q" },
  { kind: "breaker", name: "Interruptor de mando DC", prefix: "Q" },
  { kind: "fuse", name: "Portafusible de mando", prefix: "FU" },
  { kind: "emergency", name: "Parada de emergencia NC", prefix: "S" },
  { kind: "selector", name: "Selector de dos posiciones", prefix: "SA" },
  { kind: "contact-nc", name: "Contacto auxiliar NC", prefix: "K" },
  { kind: "terminal", name: "Bornera de paso", prefix: "X" },
  { kind: "buzzer", name: "Zumbador 24 V DC", prefix: "HA" }
];
var addressOK = (s) => /^(?:[IQM]\d+\.[0-7]|[TC]\d+|(?:AI|AQ|MW)\d+)$/.test(s);
var pinKey = (end) => `${end.device}:${end.pin}`;
var HOLES = [];
for (let col = 1; col <= 30; col++) {
  const x = 55 + (col - 1) * 24;
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 366], ["bottom-", 390]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
  for (const [i, row] of [..."abcdefghij"].entries()) HOLES.push({ id: `${row}:${col}`, x, y: 135 + i * 20 + (i >= 5 ? 35 : 0), group: `${i < 5 ? "upper" : "lower"}:${col}` });
}
var HOLE_BY_ID = new Map(HOLES.map((h) => [h.id, h]));
function icPinHoles(from) {
  const match = /^f:(\d+)$/.exec(from);
  if (!match) return null;
  const col = Number(match[1]);
  if (col < 1 || col > 23) return null;
  return [...Array.from({ length: 8 }, (_, i) => `f:${col + i}`), ...Array.from({ length: 8 }, (_, i) => `e:${col + 7 - i}`)];
}
var icTo = (from) => {
  const pins = icPinHoles(from);
  return pins ? pins[8] : null;
};
function bjtBase(from, to) {
  const a = /^([a-j]):(\d+)$/.exec(from), b = /^([a-j]):(\d+)$/.exec(to);
  if (!a || !b || a[1] !== b[1] || Math.abs(Number(a[2]) - Number(b[2])) !== 2) return null;
  return `${a[1]}:${(Number(a[2]) + Number(b[2])) / 2}`;
}

// src/lab/equipment/model.ts
var CATALOG = [
  { kind: "dc", name: "Fuente DC regulada", family: "mando", prefix: "G", detail: "Alimentaci\xF3n de mando con polos + y \u2212." },
  { kind: "ac", name: "Fuente monof\xE1sica", family: "mando", prefix: "G", detail: "Fuente AC ideal, valores eficaces." },
  { kind: "threephase", name: "Fuente trif\xE1sica", family: "automatizacion", prefix: "G", detail: "Tres fases a 120\xB0, neutro y PE separado." },
  { kind: "earth", name: "Tierra de protecci\xF3n", family: "mando", prefix: "PE", detail: "Punto de protecci\xF3n; no se une a N autom\xE1ticamente." },
  { kind: "terminal", name: "Bornera de paso", family: "mando", prefix: "X", detail: "Dos bornes de una misma red." },
  { kind: "busbar", name: "Barra de distribuci\xF3n", family: "mando", prefix: "X", detail: "Cuatro puntos del mismo nodo." },
  { kind: "breaker", name: "Disyuntor de un polo", family: "mando", prefix: "Q", detail: "Maniobra manual ideal; sin curva de disparo." },
  { kind: "breaker2", name: "Disyuntor de dos polos", family: "mando", prefix: "Q", detail: "Apertura simult\xE1nea de ambos polos." },
  { kind: "breaker3", name: "Disyuntor de tres polos", family: "mando", prefix: "Q", detail: "Tres polos vinculados mec\xE1nicamente." },
  { kind: "fuse", name: "Portafusible", family: "mando", prefix: "FU", detail: "Inserta o extrae el cartucho; continuidad ideal." },
  { kind: "differential", name: "Diferencial did\xE1ctico", family: "mando", prefix: "ID", detail: "Maniobra y disparo de prueba; no calcula corriente residual." },
  { kind: "guard", name: "Guardamotor", family: "mando", prefix: "QM", detail: "Maniobra tripolar y disparo de pr\xE1ctica." },
  { kind: "thermal", name: "Rel\xE9 t\xE9rmico", family: "mando", prefix: "F", detail: "Tres v\xEDas de potencia y auxiliares 95\u201396/97\u201398. Disparo de pr\xE1ctica." },
  { kind: "contactor", name: "Contactor de potencia", family: "automatizacion", prefix: "K", detail: "Bobina A1\u2013A2, tres polos y auxiliares vinculados." },
  { kind: "aux-no", name: "Auxiliar NA", family: "mando", prefix: "K", detail: "Sigue al contactor con la misma designaci\xF3n." },
  { kind: "aux-nc", name: "Auxiliar NC", family: "mando", prefix: "K", detail: "Abre al actuar el contactor con la misma designaci\xF3n." },
  { kind: "push-no", name: "Pulsador NA", family: "mando", prefix: "S", detail: "Cierra mientras se mantiene pulsado." },
  { kind: "push-nc", name: "Pulsador NC", family: "mando", prefix: "S", detail: "Abre mientras se mantiene pulsado." },
  { kind: "emergency", name: "Parada de emergencia", family: "mando", prefix: "S", detail: "Enclavada: pulsa para abrir; vuelve a accionar para rearmar." },
  { kind: "selector", name: "Selector de dos posiciones", family: "mando", prefix: "SA", detail: "Conserva su posici\xF3n al soltar." },
  { kind: "lamp", name: "Piloto", family: "mando", prefix: "H", detail: "Se ilumina por tensi\xF3n entre sus dos bornes." },
  { kind: "buzzer", name: "Zumbador", family: "mando", prefix: "HA", detail: "Carga equivalente con se\xF1al visual de activaci\xF3n; sin audio autom\xE1tico." },
  { kind: "motor", name: "Motor monof\xE1sico", family: "automatizacion", prefix: "M", detail: "Carga resistiva equivalente; movimiento ilustrativo." },
  { kind: "motor3", name: "Motor trif\xE1sico de seis bornes", family: "automatizacion", prefix: "M", detail: "Cablea las bobinas y los puentes estrella/tri\xE1ngulo." },
  { kind: "plc", name: "PLC del proyecto", family: "automatizacion", prefix: "PLC", detail: "Q1\u2013Q4 siguen Q0.0\u2013Q0.3 del programa actual. Cada salida tiene su com\xFAn C." },
  { kind: "vfd", name: "Variador con entrada monof\xE1sica", family: "automatizacion", prefix: "VFD", detail: "Salida trif\xE1sica equivalente, consigna, rampa y sentido." },
  { kind: "vfd3", name: "Variador con entrada trif\xE1sica", family: "automatizacion", prefix: "VFD", detail: "Valida las tres fases y genera salida trif\xE1sica equivalente." },
  { kind: "voltmeter", name: "Volt\xEDmetro", family: "energia", prefix: "V", detail: "Mide tensi\xF3n eficaz o DC entre sus puntas." },
  { kind: "ammeter", name: "Amper\xEDmetro", family: "energia", prefix: "A", detail: "Se conecta en serie; shunt de medida idealizado." },
  { kind: "wattmeter", name: "Vat\xEDmetro", family: "energia", prefix: "W", detail: "I1\u2013I2 en serie; V+ y V\u2212 en paralelo a la carga." },
  { kind: "energy", name: "Medidor de energ\xEDa", family: "energia", prefix: "E", detail: "Integra potencia activa y tarifa durante el tiempo simulado." },
  { kind: "pv", name: "Panel fotovoltaico", family: "energia", prefix: "PV", detail: "Equivalente lineal dependiente de irradiancia; no es un modelo MPPT." },
  { kind: "battery", name: "Bater\xEDa", family: "energia", prefix: "BAT", detail: "Fuente con resistencia interna y SOC integrado por corriente." },
  { kind: "controller", name: "Controlador de carga", family: "energia", prefix: "CC", detail: "Conversi\xF3n DC idealizada con l\xEDmite de potencia y salida de carga." },
  { kind: "inverter", name: "Inversor DC/AC", family: "energia", prefix: "INV", detail: "Salida AC equivalente; consumo DC seg\xFAn la carga y eficiencia fija del modelo." },
  { kind: "micro300", name: "Microinversor 300 W", family: "energia", prefix: "MI", detail: "Inyecci\xF3n idealizada: requiere panel DC y red AC presentes." },
  { kind: "micro600", name: "Microinversor 600 W", family: "energia", prefix: "MI", detail: "Inyecci\xF3n idealizada limitada a 600 W." },
  { kind: "micro1200", name: "Microinversor 1200 W", family: "energia", prefix: "MI", detail: "Inyecci\xF3n idealizada limitada a 1200 W." },
  { kind: "dcdc", name: "Regulador DC/DC", family: "energia", prefix: "DC", detail: "Salida DC regulada equivalente." },
  { kind: "rail", name: "Riel DIN", family: "mando", prefix: "DIN", detail: "Soporte visual; no crea conexiones el\xE9ctricas." },
  { kind: "text", name: "R\xF3tulo de montaje", family: "mando", prefix: "TXT", detail: "Anotaci\xF3n independiente del circuito." }
];
var key = (end) => `${end.part}:${end.port}`;
var defaults = (kind) => ({ voltage: kind === "ac" || kind === "vfd" || kind === "motor" ? 230 : kind === "threephase" || kind === "vfd3" || kind === "motor3" ? 400 : kind === "pv" ? 36 : 24, power: kind === "micro1200" ? 1200 : kind === "micro600" ? 600 : kind === "inverter" ? 1e3 : kind === "motor3" ? 1500 : kind === "pv" || kind === "micro300" ? 300 : kind === "lamp" ? 2 : kind === "buzzer" ? 1 : 100, current: 10, capacity: 100, soc: 50, irradiance: 1e3, frequency: 50, target: 30, ramp: 3, poles: 4, tariff: 0, text: kind === "text" ? "Mi montaje" : "" });
function dimensions(kind) {
  if (kind === "rail") return { w: 270, h: 44 };
  if (kind === "text") return { w: 190, h: 50 };
  if (kind === "plc") return { w: 260, h: 156 };
  if (["contactor", "thermal", "vfd", "vfd3", "controller"].includes(kind)) return { w: 180, h: 178 };
  if (["inverter", "micro300", "micro600", "micro1200", "dcdc", "pv", "battery", "motor3"].includes(kind)) return { w: 166, h: 150 };
  return { w: 116, h: 126 };
}
function rows(top, bottom, w, h) {
  return [...top.map((id, i) => ({ id, x: (i + 1) * w / (top.length + 1), y: 0 })), ...bottom.map((id, i) => ({ id, x: (i + 1) * w / (bottom.length + 1), y: h }))];
}
function ports(kind) {
  const { w, h } = dimensions(kind);
  switch (kind) {
    case "rail":
    case "text":
      return [];
    case "dc":
    case "battery":
    case "pv":
      return rows([], ["+", "\u2212"], w, h);
    case "ac":
      return rows([], ["L", "N", "PE"], w, h);
    case "threephase":
      return rows([], ["L1", "L2", "L3", "N", "PE"], w, h);
    case "earth":
      return [{ id: "PE", x: w / 2, y: 0 }];
    case "busbar":
      return rows(["1", "2"], ["3", "4"], w, h);
    case "breaker2":
    case "differential":
      return rows(["1", "3"], ["2", "4"], w, h);
    case "breaker3":
    case "guard":
      return rows(["1", "3", "5"], ["2", "4", "6"], w, h);
    case "thermal":
      return [...rows(["L1", "L2", "L3"], ["T1", "T2", "T3"], w, h), { id: "95", x: 0, y: 65 }, { id: "96", x: 0, y: 110 }, { id: "97", x: w, y: 65 }, { id: "98", x: w, y: 110 }];
    case "contactor":
      return [...rows(["L1", "L2", "L3"], ["T1", "T2", "T3"], w, h), { id: "A1", x: 0, y: 40 }, { id: "A2", x: 0, y: 140 }, { id: "13", x: w, y: 32 }, { id: "14", x: w, y: 66 }, { id: "21", x: w, y: 110 }, { id: "22", x: w, y: 144 }];
    case "plc":
      return rows(["L+", "M", "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8"], ["C1", "Q1", "C2", "Q2", "C3", "Q3", "C4", "Q4"], w, h);
    case "vfd":
    case "vfd3":
      return [...rows(kind === "vfd" ? ["L", "N", "PE"] : ["L1", "L2", "L3", "PE"], ["U", "V", "W", "PEo"], w, h), { id: "24", x: w, y: 45 }, { id: "DI1", x: w, y: 80 }, { id: "DI2", x: w, y: 115 }, { id: "COM", x: w, y: 145 }];
    case "motor3":
      return rows(["U1", "V1", "W1"], ["W2", "U2", "V2", "PE"], w, h);
    case "motor":
      return rows(["L", "N"], ["PE"], w, h);
    case "controller":
      return rows(["PV+", "PV\u2212"], ["BAT+", "BAT\u2212", "LOAD+", "LOAD\u2212"], w, h);
    case "inverter":
    case "micro300":
    case "micro600":
    case "micro1200":
      return rows(["DC+", "DC\u2212"], ["L", "N", "PE"], w, h);
    case "dcdc":
      return rows(["IN+", "IN\u2212"], ["OUT+", "OUT\u2212"], w, h);
    case "wattmeter":
    case "energy":
      return rows(["I1", "I2"], ["V+", "V\u2212"], w, h);
    case "voltmeter":
      return rows([], ["V+", "V\u2212"], w, h);
    case "ammeter":
      return rows(["A1"], ["A2"], w, h);
    case "aux-no":
      return rows(["13"], ["14"], w, h);
    case "aux-nc":
      return rows(["21"], ["22"], w, h);
    case "push-no":
    case "selector":
      return rows(["3"], ["4"], w, h);
    default:
      return rows(["1"], ["2"], w, h);
  }
}
function parseBoard(raw) {
  if (typeof raw !== "object" || raw === null) throw new Error("Montaje de equipos inv\xE1lido.");
  const b = raw;
  if (b.version !== 1 || !Array.isArray(b.parts) || !Array.isArray(b.wires) || b.parts.length > 80 || b.wires.length > 400) throw new Error("Montaje de equipos incompatible.");
  const string = (v, max) => {
    if (typeof v !== "string" || !v.length || v.length > max) throw new Error("Texto de equipo inv\xE1lido.");
    return v;
  };
  const numeric = (v, min, max) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) throw new Error("Par\xE1metro de equipo fuera de rango.");
    return v;
  };
  const ranges = { voltage: [1, 690], power: [0.1, 2e4], current: [0.01, 1e3], capacity: [0.01, 1e4], soc: [0, 100], irradiance: [0, 1200], frequency: [1, 100], target: [0, 100], ramp: [0.1, 120], poles: [2, 12], tariff: [0, 1e6] };
  const parts = b.parts.map((value) => {
    if (typeof value !== "object" || value === null) throw new Error("Equipo inv\xE1lido.");
    const p = value, kind = string(p.kind, 40);
    if (!CATALOG.some((d) => d.kind === kind) || typeof p.closed !== "boolean" || typeof p.params !== "object" || p.params === null) throw new Error("Tipo o estado de equipo inv\xE1lido.");
    const params = { ...defaults(kind) }, source = p.params;
    for (const [k, range] of Object.entries(ranges)) params[k] = numeric(source[k], ...range);
    if (![2, 4, 6, 8, 10, 12].includes(params.poles)) throw new Error("N\xFAmero de polos inv\xE1lido.");
    if ((kind === "vfd" || kind === "vfd3") && params.target > params.frequency) throw new Error("La consigna del variador supera la frecuencia nominal.");
    if (typeof source.text !== "string" || source.text.length > 160) throw new Error("R\xF3tulo inv\xE1lido.");
    params.text = source.text;
    return { id: string(p.id, 100), kind, tag: string(p.tag, 32), x: numeric(p.x, 20, 2200), y: numeric(p.y, 35, 1400), closed: p.closed, params };
  });
  const ids = new Set(parts.map((p) => p.id));
  if (ids.size !== parts.length) throw new Error("Identidades de equipos duplicadas.");
  const end = (v) => {
    if (typeof v !== "object" || v === null) throw new Error("Terminal inv\xE1lido.");
    const e = v, part = parts.find((p) => p.id === e.part);
    if (!part || !ports(part.kind).some((p) => p.id === e.port)) throw new Error("Cable de equipo con borne inexistente.");
    return { part: part.id, port: e.port };
  };
  const wires = b.wires.map((v) => {
    if (typeof v !== "object" || v === null) throw new Error("Cable inv\xE1lido.");
    const w = v;
    return { id: string(w.id, 100), from: end(w.from), to: end(w.to) };
  });
  const pairs = wires.map((w) => [key(w.from), key(w.to)].sort().join("|"));
  if (new Set(wires.map((w) => w.id)).size !== wires.length || new Set(pairs).size !== pairs.length || wires.some((w) => key(w.from) === key(w.to))) throw new Error("Cables de equipo duplicados.");
  return { version: 1, parts, wires };
}

// src/lab/validation.ts
var MAX_IMPORT_BYTES = 2 * 1024 * 1024;
var object = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function requireObject(value, label) {
  if (!object(value)) throw new Error(`${label}: se esperaba un objeto.`);
  return value;
}
function text(value, label, max = 200) {
  if (typeof value !== "string" || value.length > max) throw new Error(`${label}: texto inv\xE1lido.`);
  return value;
}
function num(value, label, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error(`${label}: valor fuera de rango (${min}\u2013${max}).`);
  return value;
}
function bool(value, label) {
  if (typeof value !== "boolean") throw new Error(`${label}: valor booleano inv\xE1lido.`);
  return value;
}
function list(value, label, max = 128) {
  if (!Array.isArray(value) || value.length > max) throw new Error(`${label}: lista inv\xE1lida o demasiado grande.`);
  return value;
}
function unique(items, label) {
  if (items.some((x) => !x.id) || new Set(items.map((x) => x.id)).size !== items.length) throw new Error(`${label}: identidades vac\xEDas o duplicadas.`);
}
function address(value, label) {
  const s = text(value, label, 32);
  if (!addressOK(s)) throw new Error(`${label}: direcci\xF3n no admitida.`);
  return s;
}
function hole(value) {
  const s = text(value, "Orificio", 24);
  if (!HOLE_BY_ID.has(s)) throw new Error(`Orificio desconocido: ${s}`);
  return s;
}
function polarity(value, kind) {
  if (value !== "pnp" || kind !== "bjt") throw new Error("Polaridad de transistor no admitida.");
  return "pnp";
}
function measurements(value) {
  const items = list(value, "Mediciones", 200).map((v) => {
    const m = requireObject(v, "Medici\xF3n"), kind = text(m.kind, "Tipo de medici\xF3n", 16);
    if (!["voltage", "current", "resistance", "continuity"].includes(kind)) throw new Error("Tipo de medici\xF3n desconocido.");
    return { id: text(m.id, "ID", 64), kind, a: hole(m.a), b: hole(m.b), value: m.value === null ? null : num(m.value, "Valor medido", -1e9, 1e9), label: text(m.label, "Descripci\xF3n", 120), at: text(m.at, "Fecha", 40), ...m.sourceVoltage === void 0 ? {} : { sourceVoltage: num(m.sourceVoltage, "Tensi\xF3n aplicada", 0, 30) } };
  });
  unique(items, "Mediciones");
  return items;
}
function parseProject(value) {
  try {
    let end2 = function(v) {
      const e = requireObject(v, "Terminal");
      const device = text(e.device, "Dispositivo");
      if (!ids.has(device) || !(e.pin === 0 || e.pin === 1)) throw new Error("Cable con terminal inexistente.");
      return { device, pin: e.pin };
    };
    var end = end2;
    const p = requireObject(value, "Proyecto");
    if (p.format !== "panellab-laboratory" || p.version !== 1 && p.version !== 2) throw new Error("Archivo incompatible. Abre un proyecto de Laboratorio modo. (versi\xF3n 1 o 2).");
    const schema = requireObject(p.schematic, "Esquema"), plc = requireObject(p.plc, "PLC"), hmi = requireObject(p.hmi, "HMI"), process = requireObject(p.process, "Proceso"), board = requireObject(p.breadboard, "Protoboard");
    const devices = list(schema.devices, "Dispositivos").map((v) => {
      const d = requireObject(v, "Dispositivo");
      const kind = text(d.kind, "Tipo");
      if (!DEVICES.some((x) => x.kind === kind)) throw new Error("Tipo de dispositivo desconocido.");
      return { id: text(d.id, "ID"), kind, tag: text(d.tag, "Designaci\xF3n", 32), x: num(d.x, "Posici\xF3n X", 30, 850), y: num(d.y, "Posici\xF3n Y", 40, 580), signal: d.signal === "" ? "" : address(d.signal, "Se\xF1al"), ...d.closed === void 0 ? {} : { closed: bool(d.closed, "Posici\xF3n inicial") } };
    });
    unique(devices, "Dispositivos");
    if (devices.filter((d) => d.kind === "supply").length > 1) throw new Error("Esta versi\xF3n admite una fuente de mando por esquema.");
    const ids = new Set(devices.map((d) => d.id));
    const wires = list(schema.wires, "Cables", 512).map((v) => {
      const w = requireObject(v, "Cable");
      return { id: text(w.id, "ID"), from: end2(w.from), to: end2(w.to) };
    });
    unique(wires, "Cables");
    const pairs = wires.map((w) => [pinKey(w.from), pinKey(w.to)].sort().join("|"));
    if (new Set(pairs).size !== pairs.length || wires.some((w) => pinKey(w.from) === pinKey(w.to))) throw new Error("Hay cables duplicados o conectados al mismo terminal.");
    const tags = list(plc.tags, "Variables", 128).map((v) => {
      const t = requireObject(v, "Variable");
      if (t.type !== "bool" && t.type !== "number") throw new Error("Tipo de variable desconocido.");
      return { address: address(t.address, "Variable"), name: text(t.name, "Nombre", 80), type: t.type, initial: t.type === "bool" ? bool(t.initial, "Valor inicial") : num(t.initial, "Valor inicial", -1e9, 1e9) };
    });
    if (new Set(tags.map((t) => t.address)).size !== tags.length) throw new Error("Hay direcciones de PLC duplicadas.");
    const tagMap = new Map(tags.map((t) => [t.address, t]));
    const rungs = list(plc.rungs, "Segmentos").map((v) => {
      const r = requireObject(v, "Segmento");
      const mode = text(r.mode, "Instrucci\xF3n");
      if (!["coil", "set", "reset", "ton", "tof", "ctu"].includes(mode)) throw new Error("Instrucci\xF3n desconocida.");
      return { id: text(r.id, "ID"), comment: text(r.comment, "Comentario", 500), branches: list(r.branches, "Ramas", 32).map((b) => list(b, "Contactos", 32).map((v2) => {
        const c = requireObject(v2, "Contacto");
        return { address: text(c.address, "Direcci\xF3n de contacto", 32), negated: bool(c.negated, "Contacto NC") };
      })), output: text(r.output, "Direcci\xF3n de salida", 32), mode, preset: num(r.preset, "Ajuste", 1e-3, 1e6) };
    });
    unique(rungs, "Segmentos");
    if (plc.language !== "ladder" && plc.language !== "st") throw new Error("Lenguaje desconocido.");
    const widgets = list(hmi.widgets, "Widgets").map((v) => {
      const w = requireObject(v, "Widget");
      const kind = text(w.kind, "Widget");
      if (!["toggle", "lamp", "number", "bar"].includes(kind)) throw new Error("Widget desconocido.");
      return { id: text(w.id, "ID"), kind, label: text(w.label, "Etiqueta", 80), address: address(w.address, "Se\xF1al HMI"), x: num(w.x, "Posici\xF3n X", 0, 650), y: num(w.y, "Posici\xF3n Y", 0, 460), max: num(w.max, "Escala", 1e-3, 1e9) };
    });
    unique(widgets, "Widgets");
    for (const w of widgets) {
      const tag = tagMap.get(w.address);
      if (!tag || (["toggle", "lamp"].includes(w.kind) ? tag.type !== "bool" : tag.type !== "number")) throw new Error("Un widget HMI tiene una se\xF1al inexistente o de tipo incompatible.");
    }
    const capacity = num(process.capacity, "Capacidad", 1, 1e6), low = num(process.low, "Nivel bajo", 0, 100), high = num(process.high, "Nivel alto", 0, 100);
    if (low >= high) throw new Error("El nivel bajo debe ser menor que el nivel alto.");
    const processSignals = { pumpSignal: address(process.pumpSignal, "Se\xF1al bomba"), lowSignal: address(process.lowSignal, "Se\xF1al nivel bajo"), highSignal: address(process.highSignal, "Se\xF1al nivel alto"), levelSignal: address(process.levelSignal, "Se\xF1al anal\xF3gica") };
    for (const [key2, signal] of Object.entries(processSignals)) {
      if (tagMap.get(signal)?.type !== (key2 === "levelSignal" ? "number" : "bool")) throw new Error("Se\xF1al de proceso inexistente o incompatible.");
    }
    if (new Set(Object.values(processSignals)).size !== 4) throw new Error("Las se\xF1ales de proceso deben ser diferentes.");
    const components = list(board.components, "Componentes de protoboard", 128).map((v) => {
      const c = requireObject(v, "Componente");
      const kind = text(c.kind, "Componente");
      if (!["wire", "resistor", "led", "switch", "button", "motor", "l293d", "bjt", "diode"].includes(kind)) throw new Error("Componente de protoboard desconocido.");
      const color = text(c.color, "Color", 20);
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error("Color inv\xE1lido.");
      return { id: text(c.id, "ID"), kind, from: hole(c.from), to: hole(c.to), value: num(c.value, "Valor", kind === "resistor" || kind === "motor" ? 1 : kind === "led" || kind === "diode" ? 0.1 : kind === "bjt" ? 10 : 0, kind === "resistor" ? 1e7 : kind === "motor" ? 1e4 : kind === "led" ? 5 : kind === "diode" ? 2 : kind === "bjt" ? 1e3 : 1e7), closed: bool(c.closed, "Interruptor"), color, ...c.polarity === void 0 ? {} : { polarity: polarity(c.polarity, kind) } };
    });
    unique(components, "Protoboard");
    for (const c of components) if (c.kind === "bjt" && !bjtBase(c.from, c.to)) throw new Error("El transistor debe ocupar tres orificios seguidos de una misma fila (emisor, base y colector).");
    for (const c of components) if (c.kind === "l293d" && icTo(c.from) !== c.to) throw new Error("El L293D debe empezar en la fila f (columnas 1 a 23) y terminar siete columnas a la derecha, en la fila e.");
    const project = { format: "panellab-laboratory", version: 2, id: text(p.id, "ID de proyecto"), name: text(p.name, "Nombre", 100), schematic: { devices, wires }, ...p.equipment === void 0 ? {} : { equipment: parseBoard(p.equipment) }, plc: { language: plc.language, tags, rungs, source: text(plc.source, "Fuente ST", 5e4) }, hmi: { widgets }, process: { capacity, initialLevel: num(process.initialLevel, "Nivel inicial", 0, 100), inflow: num(process.inflow, "Caudal de entrada", 0, 1e4), outflow: num(process.outflow, "Caudal de salida", 0, 1e4), low, high, ...processSignals }, breadboard: { voltage: num(board.voltage, "Fuente DC", 0.1, 30), positive: hole(board.positive), negative: hole(board.negative), components, ...board.realistic === void 0 ? {} : { realistic: bool(board.realistic, "Valores reales") }, ...board.log === void 0 ? {} : { log: measurements(board.log) }, ...board.notes === void 0 ? {} : { notes: text(board.notes, "Conclusiones", 2e3) } } };
    return { ok: true, project };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo leer el proyecto." };
  }
}
function readProject(textValue) {
  if (new TextEncoder().encode(textValue).length > MAX_IMPORT_BYTES) return { ok: false, error: "El archivo supera 2 MB, la capacidad de importaci\xF3n de esta versi\xF3n." };
  try {
    return parseProject(JSON.parse(textValue));
  } catch {
    return { ok: false, error: "El archivo no contiene JSON v\xE1lido." };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAX_IMPORT_BYTES,
  parseProject,
  readProject
});
