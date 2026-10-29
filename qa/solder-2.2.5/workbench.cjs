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

// src/lab/soldering/workbench.ts
var workbench_exports = {};
__export(workbench_exports, {
  GUIDE_COLORS: () => GUIDE_COLORS,
  UTP_COLORS: () => UTP_COLORS,
  bonded: () => bonded,
  canRelease: () => canRelease,
  looseEnd: () => looseEnd,
  molten: () => molten,
  newJoint: () => newJoint,
  newWorkbench: () => newWorkbench,
  restoreWorkbench: () => restoreWorkbench,
  serializeJobs: () => serializeJobs,
  stationFor: () => stationFor,
  tickWorkbench: () => tickWorkbench,
  updateJob: () => updateJob,
  updateStation: () => updateStation
});
module.exports = __toCommonJS(workbench_exports);

// src/lab/soldering/model.ts
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

// src/lab/soldering/manual.ts
var DB9_CUPS = Array.from({ length: 9 }, (_, i) => {
  const pin = i + 1;
  return { pin, x: pin <= 5 ? 390 + (5 - pin) * 40 : 410 + (9 - pin) * 40, y: pin <= 5 ? 160 : 215 };
});

// src/lab/soldering/workbench.ts
var thermal = (s) => ({ joint: s.joint, flux: s.flux, quality: s.quality, contact: s.contact, overheat: s.overheat });
var looseEnd = (i) => ({ x: 355 + i * 85, y: 345 + (i === 1 ? 35 : 0) });
function newJoint(i) {
  return { pin: [1, 6, 5, 0][i], wireEnd: i === 3 ? { x: 310, y: 200 } : looseEnd(i), stripped: [false, i !== 3], joined: false, sleeve: false, insulated: false, thermal: thermal(newStation()) };
}
function newWorkbench(wires) {
  return { station: newStation(), jobs: [0, 1, 2, 3].map((i) => {
    const j = newJoint(i), w = wires[i], cup = DB9_CUPS.find((c) => c.pin === w?.pin);
    return w?.soldered && cup ? { ...j, pin: w.pin, wireEnd: cup, stripped: [true, true], joined: true, sleeve: true, insulated: true, thermal: { ...j.thermal, quality: "wet" } } : j;
  }) };
}
var stationFor = (b, i) => ({ ...b.station, ...b.jobs[i].thermal });
function updateJob(b, i, key, update) {
  const prev = b.jobs[i][key], value = typeof update === "function" ? update(prev) : update;
  if (value === prev) return b;
  return { ...b, jobs: b.jobs.map((j, n) => n === i ? { ...j, [key]: value } : j) };
}
function updateStation(b, i, update) {
  const prev = stationFor(b, i), next = typeof update === "function" ? update(prev) : update;
  return { ...b, station: next, jobs: b.jobs.map((j, n) => n === i ? { ...j, thermal: thermal(next) } : j) };
}
function tickWorkbench(b, active, dt) {
  let changed = false;
  const current = stationFor(b, active), next = stepStation(current, dt);
  if (next !== current && (next.tip !== current.tip || next.joint !== current.joint || next.overheat !== current.overheat)) changed = true;
  const jobs = b.jobs.map((j, i) => {
    if (i === active) return changed ? { ...j, thermal: thermal(next) } : j;
    const old = { ...b.station, ...j.thermal, contact: false }, n = stepStation(old, dt);
    if (n.joint === old.joint && n.overheat === old.overheat && !j.thermal.contact) return j;
    changed = true;
    return { ...j, thermal: thermal(n) };
  });
  return changed ? { station: next, jobs } : b;
}
var bonded = (s) => s.quality !== "none";
var molten = (s) => s.contact && s.tip >= ALLOYS[s.alloy].liquidus && s.joint >= ALLOYS[s.alloy].liquidus;
var canRelease = (s, insulated) => bonded(s) && !insulated && molten(s);
var GUIDE_COLORS = ["#855535", "#f4f1e7", "#32834b"];
var UTP_COLORS = [{ name: "Caf\xE9", hex: "#855535" }, { name: "Blanco", hex: "#f4f1e7" }, { name: "Verde", hex: "#32834b" }, { name: "Azul", hex: "#2978c8" }, { name: "Naranja", hex: "#e07b2a" }, { name: "Blanco/azul", hex: "#b6d8f1" }, { name: "Blanco/naranja", hex: "#f6c9a3" }, { name: "Blanco/verde", hex: "#c5dfc6" }];
function serializeJobs(b) {
  return JSON.stringify(b.jobs.map(({ thermal: thermal2, ...j }) => ({ ...j, quality: thermal2.quality })));
}
function restoreWorkbench(raw, wires) {
  const b = newWorkbench(wires);
  if (!raw) return b;
  try {
    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length !== 4) return b;
    return { ...b, jobs: b.jobs.map((fallback, i) => {
      if (wires[i]?.soldered) return fallback;
      const j = jobs[i];
      if (!j || !Number.isInteger(j.pin) || j.pin < (i === 3 ? 0 : 1) || j.pin > 9 || !j.wireEnd || ![j.wireEnd.x, j.wireEnd.y].every((n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 1e6) || !Array.isArray(j.stripped) || j.stripped.length !== 2 || j.stripped.some((v) => typeof v !== "boolean") || ["joined", "sleeve", "insulated"].some((k) => typeof j[k] !== "boolean") || !["none", "cold", "wet", "disturbed"].includes(j.quality)) return fallback;
      const attached = j.quality !== "none";
      if (attached && !j.joined) return fallback;
      return { ...fallback, pin: j.pin, wireEnd: j.wireEnd, stripped: j.stripped, joined: j.joined, sleeve: j.sleeve, insulated: j.insulated, thermal: { ...fallback.thermal, quality: j.quality } };
    }) };
  } catch {
    return b;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GUIDE_COLORS,
  UTP_COLORS,
  bonded,
  canRelease,
  looseEnd,
  molten,
  newJoint,
  newWorkbench,
  restoreWorkbench,
  serializeJobs,
  stationFor,
  tickWorkbench,
  updateJob,
  updateStation
});
