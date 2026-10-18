// src/data/layout.ts
import { useSyncExternalStore } from "react";

// src/data/panel.ts
var port = (id, x, y, color, note, state, labelSide = "bottom", verification = "foto") => ({ id, label: id, x, y, color, note, state, labelSide, verification });
var source = { id: "FUENTE", title: "ALIMENTACI\xD3N Y TRANSFORMADOR", subtitle: "Transformador 220 / 24 V \xB7 3 A", x: 65, y: 82, w: 585, h: 285, image: "/references/suministro.jpg", category: "alimentacion", summary: "Fuentes y puntos de alimentaci\xF3n visibles. No energizar equipos reales sin autorizaci\xF3n docente.", labelBands: [["R", "S", "T"], ["N", "F"]], terminals: [
  port("R", 237, 230, "blue", "Fase R"),
  port("S", 297, 230, "black", "Fase S"),
  port("T", 357, 230, "red", "Fase T"),
  port("N", 430, 230, "white", "Neutro / referencia: conexi\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("F", 493, 230, "red", "Borne marcado F: funci\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("TP", 550, 242, "green", "Tierra de protecci\xF3n")
] };
var btn = { id: "BOTONERAS", title: "LUCES PILOTO 24 V A.C. / BOTONERAS", x: 712, y: 76, w: 615, h: 300, image: "/references/botoneras.jpg", category: "botoneras", summary: "Cuatro pilotos y tres pulsadores. Pares rojos 1\u20132; pares claros 3\u20134. En el pulsador derecho las columnas est\xE1n invertidas. NA/NC por convenci\xF3n, pendiente de verificaci\xF3n.", labelBands: [1, 2, 3].flatMap((s) => [[`S${s}:1`, `S${s}:3`], [`S${s}:2`, `S${s}:4`]]), terminals: [
  ...[78, 228, 378, 530].map((x, i) => port(`PILOTO_${i + 1}`, x, 105, "red", `Conector visible bajo piloto ${i + 1}; retorno a\xFAn no verificado`, void 0, "bottom", "no_verificado")),
  ...[115, 303, 488].flatMap((cx, i) => [
    // IMG_4737 and IMG_4536: the right-hand button has its columns reversed.
    port(`S${i + 1}:1`, cx + (i === 2 ? 29 : -29), 196, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:2`, cx + (i === 2 ? 29 : -29), 250, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:3`, cx + (i === 2 ? -29 : 29), 196, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:4`, cx + (i === 2 ? -29 : 29), 250, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar")
  ]),
  port("N", 571, 132, "white", "Borne N visible del m\xF3dulo; conexi\xF3n interna no verificada", void 0, "bottom", "no_verificado"),
  port("TP_IZQ", 40, 260, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 579, 260, "green", "Tierra de protecci\xF3n")
] };
var thermal = { id: "CONTACTOR_TERMICO", title: "CONTACTOR + REL\xC9 T\xC9RMICO", subtitle: "Contactor y protecci\xF3n de sobrecarga", x: 65, y: 408, w: 585, h: 350, image: "/photos-2026-10-15/foto-6.jpg", category: "contactores", summary: "Contactor con rel\xE9 t\xE9rmico. Los n\xFAmeros de bornes est\xE1n identificados; referencia KM escrita a mano sin confirmar.", aliasEditable: true, labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["71", "72"], ["81", "82"], ["95", "96"], ["13", "14"], ["63", "64"], ["93", "94"], ["97", "98"]], terminals: [
  port("A2", 176, 64, "red", "Bobina, borne A2", void 0, "right"),
  port("A1", 176, 108, "white", "Bobina, borne A1", void 0, "right"),
  ...["L1", "L2", "L3"].map((id, i) => port(id, 264 + i * 77, 70, ["blue", "black", "red"][i], "Entrada de potencia", void 0, "bottom")),
  ...["T1", "T2", "T3"].map((id, i) => port(id, 264 + i * 77, 309, ["blue", "black", "red"][i], "Salida de potencia", void 0, "bottom")),
  ...["71", "72", "81", "82", "95", "96"].map((id, i) => port(id, 178 + i % 2 * 74, 164 + Math.floor(i / 2) * 54, "black", `${i >= 4 ? "Protecci\xF3n t\xE9rmica" : "Auxiliar"} \xB7 contacto ${["71\u201372", "71\u201372", "81\u201382", "81\u201382", "95\u201396", "95\u201396"][i]}`, "NC probable", "top", "convencion_por_confirmar")),
  ...["13", "14", "63", "64", "93", "94", "97", "98"].map((id, i) => port(id, 449 + i % 2 * 70, 128 + Math.floor(i / 2) * 54, "blue", `${i >= 6 ? "Protecci\xF3n t\xE9rmica" : "Auxiliar"} \xB7 contacto ${["13\u201314", "13\u201314", "63\u201364", "63\u201364", "93\u201394", "93\u201394", "97\u201398", "97\u201398"][i]}`, "NA probable", "top", "convencion_por_confirmar")),
  port("TP_IZQ", 170, 309, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 551, 309, "green", "Tierra de protecci\xF3n")
] };
var tri = { id: "CONTACTOR_TRIFASICO", title: "CONTACTOR TRIF\xC1SICO", subtitle: "Referencia escrita KM\u2026 por confirmar", x: 712, y: 408, w: 615, h: 350, image: "/photos-2026-10-15/foto-3.jpg", category: "contactores", summary: "Contactor trif\xE1sico con bobina, bornes de potencia y contactos auxiliares. Etiqueta KM manuscrita a\xFAn no legible por completo.", aliasEditable: true, labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["71", "72"], ["81", "82"], ["13", "14"], ["63", "64"], ["93", "94"]], terminals: [
  port("A2", 52, 65, "red", "Bobina, borne A2", void 0, "right"),
  port("A1", 52, 112, "white", "Bobina, borne A1", void 0, "right"),
  ...["L1", "L2", "L3"].map((id, i) => port(id, 184 + i * 78, 71, ["blue", "black", "red"][i], "Entrada de potencia", void 0, "bottom")),
  ...["T1", "T2", "T3"].map((id, i) => port(id, 184 + i * 78, 309, ["blue", "black", "red"][i], "Salida de potencia", void 0, "bottom")),
  ...["71", "72", "81", "82"].map((id, i) => port(id, i === 0 ? 80 : 72 + i % 2 * 65, 157 + Math.floor(i / 2) * 60, "black", `Auxiliar \xB7 contacto ${i < 2 ? "71\u201372" : "81\u201382"}`, "NC probable", "top", "convencion_por_confirmar")),
  port("95", 72, 277, "black", "Borne 95 de KM2: presencia indicada por ti. No visible en fotos 3\u20135 del 15/10/2026; presencia en este m\xF3dulo por confirmar. Posici\xF3n y color de referencia; funci\xF3n interna por confirmar.", void 0, "top", "usuario"),
  port("96", 137, 277, "black", "Borne 96 de KM2: presencia indicada por ti. No visible en fotos 3\u20135 del 15/10/2026; presencia en este m\xF3dulo por confirmar. Posici\xF3n y color de referencia; funci\xF3n interna por confirmar.", void 0, "top", "usuario"),
  ...["13", "14", "63", "64", "93", "94"].map((id, i) => port(id, 473 + i % 2 * 65, 149 + Math.floor(i / 2) * 54, "blue", `Contacto ${["13\u201314", "13\u201314", "63\u201364", "63\u201364", "93\u201394", "93\u201394"][i]}`, "NA probable", "top", "convencion_por_confirmar")),
  port("TP_IZQ", 55, 309, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 580, 309, "green", "Tierra de protecci\xF3n")
] };
function timer(id, x, image) {
  return { id, title: "TEMPORIZADOR NEUM\xC1TICO", subtitle: "BOBINA 24 V A.C.", x, y: 787, w: 485, h: 270, image, category: "temporizadores", aliasEditable: true, summary: "Temporizador neum\xE1tico de 24 V CA. Antes de simularlo hay que confirmar el modo de retardo y su referencia.", labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["55", "56"], ["13", "14"], ["67", "68"]], terminals: [
    port("A2", 33, 59, "red", "Bobina A2", void 0, "right"),
    port("A1", 33, 102, "white", "Bobina A1", void 0, "right"),
    ...["L1", "L2", "L3"].map((id2, i) => port(id2, 152 + i * 63, 58, ["blue", "black", "red"][i], "Bornes superiores", void 0, "bottom")),
    ...["T1", "T2", "T3"].map((id2, i) => port(id2, 152 + i * 63, 222, ["blue", "black", "red"][i], "Bornes inferiores", void 0, "bottom")),
    port("55", 45, 169, "black", "Contacto 55\u201356, retardo no verificado", "NC probable", "top", "convencion_por_confirmar"),
    port("56", 96, 169, "black", "Contacto 55\u201356, retardo no verificado", "NC probable", "top", "convencion_por_confirmar"),
    port("13", 365, 135, "blue", "Auxiliar 13\u201314", "NA probable", "top", "convencion_por_confirmar"),
    port("14", 427, 135, "blue", "Auxiliar 13\u201314", "NA probable", "top", "convencion_por_confirmar"),
    port("67", 365, 191, "blue", "Contacto 67\u201368, retardo no verificado", "NA probable", "top", "convencion_por_confirmar"),
    port("68", 427, 191, "blue", "Contacto 67\u201368, retardo no verificado", "NA probable", "top", "convencion_por_confirmar"),
    port("TP_IZQ", 49, 224, "green", "Tierra de protecci\xF3n"),
    port("TP_DER", 452, 224, "green", "Tierra de protecci\xF3n")
  ] };
}
var motor = { id: "BORNERA_MOTOR", title: "MOTOR TRIF\xC1SICO", subtitle: "Motor con bornera U1 V1 W1 \xB7 W2 U2 V2", x: 65, y: 798, w: 715, h: 285, image: "/references/motor.jpg", category: "motor", summary: "Motor trif\xE1sico con su bornera: seis extremos de bobinado y tierra de protecci\xF3n. Estrella o tri\xE1ngulo se define con los puentes entre bornes.", labelBands: [["U1", "V1", "W1"], ["W2", "U2", "V2"]], terminals: [
  port("U1", 532, 109, "blue", "Terminal de motor U1", void 0, "top"),
  port("V1", 581, 109, "black", "Terminal de motor V1", void 0, "top"),
  port("W1", 630, 109, "red", "Terminal de motor W1", void 0, "top"),
  port("W2", 532, 176, "red", "Terminal de motor W2", void 0, "bottom"),
  port("U2", 581, 176, "blue", "Terminal de motor U2", void 0, "bottom"),
  port("V2", 630, 176, "black", "Terminal de motor V2", void 0, "bottom"),
  port("TP", 499, 144, "green", "Tierra de protecci\xF3n", void 0, "bottom")
] };
for (const m of [thermal, tri]) for (const t of m.terminals) {
  if (["71", "72", "81", "82", "95", "96"].includes(t.id)) {
    t.color = "gray";
    t.state = "NC \xB7 normalmente cerrado";
    t.verification = "usuario";
    t.note = (m === tri && ["95", "96"].includes(t.id) ? "Contacto 95\u201396: NC indicado por ti; accionamiento interno por confirmar." : t.note || "") + " Gris = normalmente cerrado, indicado por ti.";
  }
  if (["13", "14", "63", "64", "93", "94", "97", "98"].includes(t.id)) {
    t.state = "NA \xB7 normalmente abierto";
    t.verification = "usuario";
    t.note = (t.note || "") + " Azul = normalmente abierto, indicado por ti.";
  }
}
tri.labelBands.push(["95", "96"]);
source.x = 65;
source.y = 76;
btn.x = 674;
btn.y = 76;
thermal.x = 65;
thermal.y = 412;
tri.x = 674;
tri.y = 412;
var pneumatic = timer("TEMPORIZADOR_1", 65, "/references/temporizador-1.jpg");
pneumatic.y = 798;
motor.x = 574;
motor.y = 798;
var RETIRED_MODULES = [timer("TEMPORIZADOR_2", 831, "/references/temporizador-2.jpg")];
var MODULES = [source, btn, thermal, tri, motor, pneumatic];
var BASE_MODULE_IDS = new Set(MODULES.map((m) => m.id));
var RETIRED_TERMINAL_IDS = new Set(RETIRED_MODULES.flatMap((m) => m.terminals.map((t) => `${m.id}:${t.id}`)));
var PORT_COUNT = MODULES.reduce((n, m) => n + m.terminals.length, 0);
var terminalKey = (module, terminal) => `${module.id}:${terminal.id}`;
var TERMINALS = MODULES.flatMap((module) => module.terminals.map((terminal) => ({ key: terminalKey(module, terminal), module, terminal })));
var TERMINAL_BY_ID = new Map(TERMINALS.map((t) => [t.key, t]));
var EXTRA_KINDS = {
  tri: { label: "Contactor trif\xE1sico", hint: "Otro contactor con bobina, potencia y auxiliares (KM3, KM4\u2026)", prefix: "CONTACTOR_TRIFASICO_", first: 3 },
  timer: { label: "Temporizador neum\xE1tico", hint: "Otro temporizador con bobina 24 V y contactos de retardo", prefix: "TEMPORIZADOR_", first: 3 }
};
var MAX_EXTRA_MODULES = 8;
var extraKindOf = (id) => Object.keys(EXTRA_KINDS).find((k) => {
  const m = id.match(new RegExp(`^${EXTRA_KINDS[k].prefix}(\\d+)$`));
  return !!m && Number(m[1]) >= EXTRA_KINDS[k].first;
}) ?? null;
var isExtraModuleId = (id) => !BASE_MODULE_IDS.has(id) && extraKindOf(id) !== null;
function nextExtraNumber(kind, modules = MODULES) {
  const { prefix, first } = EXTRA_KINDS[kind];
  let n = first;
  while (modules.some((m) => m.id === `${prefix}${n}`) || kind === "timer" && RETIRED_MODULES.some((m) => m.id === `${prefix}${n}`)) n++;
  return n;
}
function buildExtraModule(kind, n) {
  const { prefix } = EXTRA_KINDS[kind], id = `${prefix}${n}`;
  if (kind === "tri") {
    const km = `KM${n}`, copy2 = structuredClone(tri);
    copy2.terminals.forEach((t) => {
      if (t.note) t.note = t.note.replace(/KM2/g, km);
    });
    return { ...copy2, id, subtitle: `Panel adicional \xB7 referencia ${km} por confirmar`, kind: "tri", extra: true, defaultAlias: km, summary: `Panel adicional de contactor trif\xE1sico (${km}). Copia los bornes del contactor trif\xE1sico del banco.` };
  }
  const copy = timer(id, 0, "/references/temporizador-1.jpg");
  return { ...copy, subtitle: "BOBINA 24 V A.C. \xB7 panel adicional", kind: "timer", extra: true, defaultAlias: `KT${n - 1}` };
}
function registerModule(m) {
  if (MODULES.some((x) => x.id === m.id)) return false;
  MODULES.push(m);
  for (const terminal of m.terminals) {
    const entry = { key: terminalKey(m, terminal), module: m, terminal };
    TERMINALS.push(entry);
    TERMINAL_BY_ID.set(entry.key, entry);
  }
  return true;
}
function unregisterModule(id) {
  if (BASE_MODULE_IDS.has(id)) return false;
  const index = MODULES.findIndex((m) => m.id === id);
  if (index < 0) return false;
  MODULES.splice(index, 1);
  for (let i = TERMINALS.length - 1; i >= 0; i--) if (TERMINALS[i].module.id === id) {
    TERMINAL_BY_ID.delete(TERMINALS[i].key);
    TERMINALS.splice(i, 1);
  }
  return true;
}

// src/data/layout.ts
var GAP = 24;
var MIN_GAP = 8;
var MARGIN_X = 65;
var TOP_Y = 76;
var RAIL_OFFSET = 34;
var SNAP = 56;
var MAX_X = 4e3;
var MAX_Y = 4e3;
var KEY = "panellab.layout.v1";
var EXTRAS_KEY = "panellab.extras.v1";
var BOARD_RIGHT = 1342;
var baseIds = () => MODULES.filter((m) => !m.extra);
var baseLayout = () => Object.fromEntries(baseIds().map((m) => [m.id, { x: m.x, y: m.y }]));
function placeExtras(layout) {
  const next = { ...layout };
  for (const m of MODULES) if (m.extra && !valid(next[m.id])) next[m.id] = freeSlot(next, m);
  return next;
}
var base = () => placeExtras(baseLayout());
var DEFAULT_LAYOUT = base();
var current = base();
var listeners = /* @__PURE__ */ new Set();
var emit = () => listeners.forEach((l) => l());
var getLayout = () => current;
var modulePos = (m, layout = current) => layout[m.id] ?? { x: m.x, y: m.y };
var moduleRect = (m, layout = current) => ({ ...modulePos(m, layout), w: m.w, h: m.h });
function valid(v) {
  return !!v && typeof v === "object" && Number.isFinite(v.x) && Number.isFinite(v.y);
}
function setModulePos(id, pos, persist = false) {
  current = { ...current, [id]: pos };
  emit();
  if (persist) save();
}
function resetLayout() {
  current = base();
  emit();
  try {
    localStorage.removeItem(KEY);
  } catch {
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
  }
}
function saveExtras() {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(MODULES.filter((m) => m.extra).map((m) => m.id)));
  } catch {
  }
}
var version = 0;
var moduleListeners = /* @__PURE__ */ new Set();
var bump = () => {
  version++;
  moduleListeners.forEach((l) => l());
};
var useModules = () => {
  useSyncExternalStore((cb) => {
    moduleListeners.add(cb);
    return () => {
      moduleListeners.delete(cb);
    };
  }, () => version, () => 0);
  return MODULES;
};
var extraModules = () => MODULES.filter((m) => m.extra);
function addExtraModule(kind) {
  if (extraModules().length >= MAX_EXTRA_MODULES) return null;
  const m = buildExtraModule(kind, nextExtraNumber(kind));
  if (!registerModule(m)) return null;
  current = { ...current, [m.id]: freeSlot(current, m) };
  saveExtras();
  save();
  bump();
  emit();
  return m;
}
function removeExtraModule(id) {
  if (!unregisterModule(id)) return false;
  const { [id]: _removed, ...rest } = current;
  current = rest;
  saveExtras();
  save();
  bump();
  emit();
  return true;
}
function loadExtraModules() {
  try {
    const raw = JSON.parse(localStorage.getItem(EXTRAS_KEY) || "null");
    if (!Array.isArray(raw)) return;
    let changed = false;
    for (const id of raw.slice(0, MAX_EXTRA_MODULES)) {
      if (typeof id !== "string" || !isExtraModuleId(id)) continue;
      const kind = extraKindOf(id);
      if (!kind) continue;
      if (registerModule(buildExtraModule(kind, Number(id.match(/(\d+)$/)[1])))) changed = true;
    }
    if (changed) {
      current = placeExtras(current);
      bump();
      emit();
    }
  } catch {
  }
}
function loadLayout() {
  loadExtraModules();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || typeof raw !== "object") {
      current = base();
      emit();
      return;
    }
    const next = baseLayout();
    for (const m of MODULES) if (valid(raw[m.id])) next[m.id] = { x: raw[m.id].x, y: raw[m.id].y };
    const placed = placeExtras(next);
    if (MODULES.some((a, i) => MODULES.slice(i + 1).some((b) => overlaps(moduleRect(a, placed), moduleRect(b, placed), MIN_GAP - 1)))) {
      current = base();
      emit();
      return;
    }
    current = placed;
    emit();
  } catch {
  }
}
var useLayout = () => useSyncExternalStore((cb) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}, getLayout, () => DEFAULT_LAYOUT);
var overlaps = (a, b, pad = MIN_GAP) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
var nearest = (value, candidates, threshold = SNAP) => {
  let best = null, bestDistance = threshold + 1;
  for (const c of candidates) {
    const d = Math.abs(c - value);
    if (d < bestDistance) {
      best = c;
      bestDistance = d;
    }
  }
  return best;
};
var clampPos = (p) => ({ x: Math.min(MAX_X, Math.max(MARGIN_X, Math.round(p.x))), y: Math.min(MAX_Y, Math.max(TOP_Y, Math.round(p.y))) });
function freeSlot(layout, me, modules = MODULES) {
  const others = modules.filter((m) => m.id !== me.id && valid(layout[m.id])).map((m) => moduleRect(m, layout));
  const right = Math.max(BOARD_RIGHT, ...others.map((o) => o.x + o.w)), bottom = Math.max(TOP_Y - GAP, ...others.map((o) => o.y + o.h));
  const candidates = [{ x: MARGIN_X, y: TOP_Y }, { x: MARGIN_X, y: bottom + GAP }];
  for (const o of others) candidates.push({ x: o.x + o.w + GAP, y: o.y }, { x: o.x, y: o.y + o.h + GAP }, { x: MARGIN_X, y: o.y + o.h + GAP }, { x: o.x - GAP - me.w, y: o.y });
  const fits = candidates.filter((c) => c.x >= MARGIN_X && c.y >= TOP_Y && c.x + me.w <= right && !others.some((o) => overlaps({ ...c, w: me.w, h: me.h }, o)));
  fits.sort((a, b) => a.y + me.h - (b.y + me.h) || a.y - b.y || a.x - b.x);
  return fits[0] ?? { x: MARGIN_X, y: bottom + GAP };
}
function dockedTo(r, others) {
  const tol = 2;
  for (const { id, rect: o } of others) {
    const sideBySide = Math.abs(r.x - (o.x + o.w + GAP)) <= tol || Math.abs(r.x + r.w + GAP - o.x) <= tol, rowsMeet = r.y < o.y + o.h && o.y < r.y + r.h;
    const stacked = Math.abs(r.y - (o.y + o.h + GAP)) <= tol || Math.abs(r.y + r.h + GAP - o.y) <= tol, columnsMeet = r.x < o.x + o.w && o.x < r.x + r.w;
    if (sideBySide && rowsMeet || stacked && columnsMeet) return id;
  }
  return null;
}
function snapModule(layout, id, desired, modules = MODULES) {
  const me = modules.find((m) => m.id === id);
  if (!me) return null;
  const entries = modules.filter((m) => m.id !== id && valid(layout[m.id])).map((m) => ({ id: m.id, rect: moduleRect(m, layout) }));
  const others = entries.map((e) => e.rect);
  const fits = (p) => !others.some((o) => overlaps({ ...p, w: me.w, h: me.h }, o));
  const d = clampPos(desired);
  const xs = [MARGIN_X, ...others.flatMap((o) => [o.x + o.w + GAP, o.x - GAP - me.w, o.x, o.x + o.w - me.w])].filter((x) => x >= MARGIN_X);
  const ys = [TOP_Y, ...others.flatMap((o) => [o.y + o.h + GAP, o.y - GAP - me.h, o.y, o.y + o.h - me.h])].filter((y) => y >= TOP_Y);
  const sx = nearest(d.x, xs), sy = nearest(d.y, ys);
  let pos = { x: sx ?? d.x, y: sy ?? d.y }, snapped = sx != null || sy != null;
  if (!fits(pos)) {
    const slots = [], alignY = nearest(d.y, ys, SNAP * 3) ?? d.y, alignX = nearest(d.x, xs, SNAP * 3) ?? d.x;
    for (const o of others) {
      for (const y of [o.y, o.y + o.h - me.h, alignY]) slots.push({ x: o.x + o.w + GAP, y }, { x: o.x - GAP - me.w, y });
      for (const x of [o.x, o.x + o.w - me.w, alignX]) slots.push({ x, y: o.y + o.h + GAP }, { x, y: o.y - GAP - me.h });
    }
    const clear = (p) => !others.some((o) => overlaps({ ...p, w: me.w, h: me.h }, o, GAP - 2));
    const free = slots.map(clampPos).filter(clear);
    free.sort((a, b) => Math.hypot(a.x - d.x, a.y - d.y) - Math.hypot(b.x - d.x, b.y - d.y));
    pos = free[0] ?? freeSlot(layout, me, modules);
    snapped = true;
  }
  const rect = { ...pos, w: me.w, h: me.h }, target = dockedTo(rect, entries);
  return { pos, guides: { ...xs.includes(pos.x) ? { x: pos.x } : {}, ...ys.includes(pos.y) ? { y: pos.y } : {} }, target, snapped };
}
function railRows(layout, modules = MODULES) {
  const rows = [];
  for (const r of modules.map((m) => moduleRect(m, layout)).sort((a, b) => a.y - b.y)) {
    const row = rows.find((x) => Math.abs(x.top - r.y) <= SNAP);
    if (row) {
      row.top = Math.min(row.top, r.y);
      row.bottom = Math.max(row.bottom, r.y + r.h);
    } else rows.push({ top: r.y, bottom: r.y + r.h });
  }
  return rows.map((r) => ({ ...r, rail: r.top - RAIL_OFFSET }));
}
function boardFrame(layout, modules = MODULES) {
  const rects = modules.map((m) => moduleRect(m, layout));
  const right = Math.max(...rects.map((r) => r.x + r.w)), bottom = Math.max(...rects.map((r) => r.y + r.h));
  const rows = railRows(layout, modules), railBottom = bottom + 46;
  return { x: 29, y: 28, w: right + 48 - 29, h: railBottom + 27 + 20 - 28, rows, railBottom, right: right + 48, bottom: railBottom + 47 };
}
var VIEW_ASPECT = 1680 / 1460;
function fitView(layout = current, modules = MODULES) {
  const f = boardFrame(layout, modules), padL = 270, padR = 130, padTop = 150, padBottom = 130;
  const w0 = f.w + padL + padR, h0 = f.h + padTop + padBottom, w = Math.max(w0, h0 * VIEW_ASPECT), h = w / VIEW_ASPECT;
  return { x: f.x - padL - (w - w0) / 2, y: f.y - padTop - (h - h0) / 2, w, h };
}
var clampFree = (p) => ({ x: Math.min(MAX_X, Math.max(MARGIN_X, p.x)), y: Math.min(MAX_Y, Math.max(TOP_Y, p.y)) });
var area = (r) => r.w * r.h;
var intersection = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
function dropModule(layout, id, desired, origin, modules = MODULES) {
  const me = modules.find((m) => m.id === id);
  if (!me) return null;
  const base2 = snapModule(layout, id, desired, modules);
  if (!base2) return null;
  const dock = { pos: base2.pos, moves: { [id]: base2.pos }, kind: base2.snapped ? "dock" : "free", swapWith: null, guides: base2.guides, target: base2.target, snapped: base2.snapped };
  const free = { ...clampFree(desired), w: me.w, h: me.h };
  let best = null;
  for (const m of modules) {
    if (m.id === id || !valid(layout[m.id])) continue;
    const rect = moduleRect(m, layout), inter = intersection(free, rect), center = { x: free.x + free.w / 2, y: free.y + free.h / 2 };
    const inside = center.x > rect.x && center.x < rect.x + rect.w && center.y > rect.y && center.y < rect.y + rect.h;
    if (!inside && inter < 0.3 * Math.min(area(free), area(rect))) continue;
    if (!best || inter > best.score) best = { m, rect, score: inter };
  }
  if (!best) return dock;
  const other = best.m, B = best.rect, A = { ...origin, w: me.w, h: me.h };
  const rest = modules.filter((m) => m.id !== id && m.id !== other.id && valid(layout[m.id])).map((m) => moduleRect(m, layout));
  const ok = (a, b) => {
    const ra = { ...a, w: A.w, h: A.h }, rb = { ...b, w: B.w, h: B.h };
    return a.x >= MARGIN_X && a.y >= TOP_Y && b.x >= MARGIN_X && b.y >= TOP_Y && !overlaps(ra, rb, GAP - 2) && !rest.some((r) => overlaps(ra, r) || overlaps(rb, r));
  };
  const candidates = [];
  const sameRow = A.y < B.y + B.h && B.y < A.y + A.h, sameColumn = A.x < B.x + B.w && B.x < A.x + A.w;
  if (sameRow) {
    const left = Math.min(A.x, B.x);
    candidates.push(B.x > A.x ? { b: { x: left, y: A.y }, a: { x: left + B.w + GAP, y: B.y } } : { a: { x: left, y: B.y }, b: { x: left + A.w + GAP, y: A.y } });
  } else if (sameColumn) {
    const top = Math.min(A.y, B.y);
    candidates.push(B.y > A.y ? { b: { x: A.x, y: top }, a: { x: B.x, y: top + B.h + GAP } } : { a: { x: B.x, y: top }, b: { x: A.x, y: top + A.h + GAP } });
  }
  candidates.push({ a: { x: B.x, y: B.y }, b: { x: A.x, y: A.y } });
  for (const c of candidates) if (ok(c.a, c.b)) return { pos: c.a, moves: { [id]: c.a, [other.id]: c.b }, kind: "swap", swapWith: other.id, guides: {}, target: other.id, snapped: true };
  return dock;
}
export {
  DEFAULT_LAYOUT,
  EXTRAS_KEY,
  GAP,
  KEY,
  MARGIN_X,
  MAX_X,
  MAX_Y,
  MIN_GAP,
  RAIL_OFFSET,
  SNAP,
  TOP_Y,
  VIEW_ASPECT,
  addExtraModule,
  boardFrame,
  clampFree,
  dropModule,
  extraModules,
  fitView,
  freeSlot,
  getLayout,
  loadExtraModules,
  loadLayout,
  modulePos,
  moduleRect,
  overlaps,
  railRows,
  removeExtraModule,
  resetLayout,
  setModulePos,
  snapModule,
  useLayout,
  useModules
};
