// src/lab/equipment/model.ts
var CATALOG = [
  { kind: "enclosure", name: "Gabinete con placa de montaje", family: "estructura", prefix: "TAB", detail: "Base libre para organizar equipos. Arrastra el borde para mover el gabinete con las piezas de su interior." },
  { kind: "duct", name: "Canaleta horizontal", family: "estructura", prefix: "CH", detail: "Canalizaci\xF3n visual para organizar el cableado; no crea conexiones el\xE9ctricas." },
  { kind: "duct-v", name: "Canaleta vertical", family: "estructura", prefix: "CV", detail: "Canalizaci\xF3n vertical para organizar el cableado; no crea conexiones el\xE9ctricas." },
  { kind: "dc", name: "Fuente DC regulada", family: "mando", prefix: "G", detail: "Alimentaci\xF3n de mando con polos + y \u2212." },
  { kind: "ac", name: "Fuente monof\xE1sica", family: "mando", prefix: "G", detail: "Fuente AC ideal, valores eficaces." },
  { kind: "threephase", name: "Fuente trif\xE1sica", family: "automatizacion", prefix: "G", detail: "Tres fases a 120\xB0, neutro y PE separado." },
  { kind: "earth", name: "Tierra de protecci\xF3n", family: "mando", prefix: "PE", detail: "Punto de protecci\xF3n; no se une a N autom\xE1ticamente." },
  { kind: "terminal", name: "Bornera de paso", family: "mando", prefix: "X", detail: "Dos bornes de una misma red." },
  { kind: "busbar", name: "Barra de distribuci\xF3n", family: "mando", prefix: "X", detail: "Cuatro puntos del mismo nodo." },
  { kind: "breaker", name: "Disyuntor de un polo", family: "mando", prefix: "Q", detail: "Maniobra manual. Dispara por sobrecarga y cortocircuito seg\xFAn su corriente nominal." },
  { kind: "breaker2", name: "Disyuntor de dos polos", family: "mando", prefix: "Q", detail: "Apertura simult\xE1nea de ambos polos. Dispara por sobrecarga y cortocircuito." },
  { kind: "breaker3", name: "Disyuntor de tres polos", family: "mando", prefix: "Q", detail: "Tres polos vinculados mec\xE1nicamente. Dispara por sobrecarga y cortocircuito." },
  { kind: "fuse", name: "Portafusible", family: "mando", prefix: "FU", detail: "Inserta o extrae el cartucho. Se funde por sobrecarga o cortocircuito; se repone insert\xE1ndolo de nuevo." },
  { kind: "differential", name: "Diferencial did\xE1ctico", family: "mando", prefix: "ID", detail: "Dispara con una fuga a tierra sobre 30 mA: corriente que sale por la fase y no vuelve por el neutro. Para probarlo, une la carga a PE y PE a N." },
  { kind: "guard", name: "Guardamotor", family: "mando", prefix: "QM", detail: "Maniobra tripolar. Dispara por sobrecarga del motor y por cortocircuito." },
  { kind: "thermal", name: "Rel\xE9 t\xE9rmico", family: "mando", prefix: "F", detail: "Mide la corriente del motor y, al sobrecargarse, abre 95\u201396 y cierra 97\u201398. Se rearma con OFF y ON." },
  { kind: "contactor", name: "Contactor de potencia", family: "automatizacion", prefix: "K", detail: "Bobina A1\u2013A2, tres polos y auxiliares vinculados." },
  { kind: "timer", name: "Rel\xE9 temporizador ON-delay", family: "automatizacion", prefix: "KT", detail: "Bobina A1\u2013A2. Al energizarla cuenta el retardo; luego cierra 15\u201318 y abre 15\u201316. Se ajusta en segundos." },
  { kind: "aux-no", name: "Auxiliar NA", family: "mando", prefix: "K", detail: "Sigue al contactor con la misma designaci\xF3n." },
  { kind: "aux-nc", name: "Auxiliar NC", family: "mando", prefix: "K", detail: "Abre al actuar el contactor con la misma designaci\xF3n." },
  { kind: "push-no", name: "Pulsador NA", family: "mando", prefix: "S", detail: "Cierra mientras se mantiene pulsado." },
  { kind: "push-nc", name: "Pulsador NC", family: "mando", prefix: "S", detail: "Abre mientras se mantiene pulsado." },
  { kind: "emergency", name: "Parada de emergencia", family: "mando", prefix: "S", detail: "Enclavada: pulsa para abrir; vuelve a accionar para rearmar." },
  { kind: "selector", name: "Selector de dos posiciones", family: "mando", prefix: "SA", detail: "Conserva su posici\xF3n al soltar." },
  { kind: "lamp", name: "Piloto", family: "mando", prefix: "H", detail: "Se ilumina por tensi\xF3n entre sus dos bornes." },
  { kind: "buzzer", name: "Zumbador", family: "mando", prefix: "HA", detail: "Carga equivalente con se\xF1al visual de activaci\xF3n; sin audio autom\xE1tico." },
  { kind: "motor", name: "Motor monof\xE1sico", family: "automatizacion", prefix: "M", detail: "Carga equivalente con pico de arranque (6 veces) que decae en segundos; movimiento ilustrativo." },
  { kind: "motor3", name: "Motor trif\xE1sico de seis bornes", family: "automatizacion", prefix: "M", detail: "Cablea las bobinas y los puentes estrella/tri\xE1ngulo. Tiene pico de arranque." },
  { kind: "plc", name: "PLC del proyecto", family: "automatizacion", prefix: "PLC", detail: "Q1\u2013Q4 siguen Q0.0\u2013Q0.3 del programa actual. Cada salida tiene su com\xFAn C." },
  { kind: "vfd", name: "Variador con entrada monof\xE1sica", family: "automatizacion", prefix: "VFD", detail: "Salida trif\xE1sica equivalente, consigna, rampa y sentido." },
  { kind: "vfd3", name: "Variador con entrada trif\xE1sica", family: "automatizacion", prefix: "VFD", detail: "Valida las tres fases y genera salida trif\xE1sica equivalente." },
  { kind: "softstart", name: "Arrancador suave trif\xE1sico", family: "automatizacion", prefix: "SS", detail: "Sube la tensi\xF3n del motor con una rampa, sin cambiar la frecuencia; al llegar al 100 % se puentea." },
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
  { kind: "rail", name: "Riel DIN", family: "estructura", prefix: "DIN", detail: "Soporte visual; no crea conexiones el\xE9ctricas." },
  { kind: "text", name: "R\xF3tulo de montaje", family: "mando", prefix: "TXT", detail: "Anotaci\xF3n independiente del circuito." }
];
var VARIANTS = {
  lamp: { label: "Piloto", options: [{ value: "", label: "Verde (est\xE1ndar)" }, { value: "rojo", label: "Rojo" }, { value: "ambar", label: "\xC1mbar" }, { value: "amarillo", label: "Amarillo" }, { value: "azul", label: "Azul" }, { value: "blanco", label: "Blanco" }, { value: "bombillo", label: "Bombillo" }] },
  "push-no": { label: "Color del pulsador", options: [{ value: "", label: "Verde (est\xE1ndar)" }, { value: "rojo", label: "Rojo" }, { value: "amarillo", label: "Amarillo" }, { value: "azul", label: "Azul" }, { value: "blanco", label: "Blanco" }, { value: "negro", label: "Negro" }] },
  "push-nc": { label: "Color del pulsador", options: [{ value: "", label: "Rojo (est\xE1ndar)" }, { value: "verde", label: "Verde" }, { value: "amarillo", label: "Amarillo" }, { value: "azul", label: "Azul" }, { value: "blanco", label: "Blanco" }, { value: "negro", label: "Negro" }] },
  selector: { label: "Aspecto", options: [{ value: "", label: "Selector de panel" }, { value: "pared", label: "Interruptor de pared" }] },
  busbar: { label: "Barra", options: [{ value: "", label: "De paso" }, { value: "neutro", label: "De neutro" }, { value: "tierra", label: "De tierra" }] },
  rail: { label: "Riel", options: [{ value: "", label: "Liso" }, { value: "8", label: "8 posiciones" }, { value: "12", label: "12 posiciones" }] },
  breaker: { label: "Corriente", options: [{ value: "", label: "Alterna (CA)" }, { value: "dc", label: "Continua (CC)" }] },
  breaker2: { label: "Corriente", options: [{ value: "", label: "Alterna (CA)" }, { value: "dc", label: "Continua (CC)" }] }
};
var defaults = (kind) => ({ voltage: kind === "ac" || kind === "vfd" || kind === "motor" ? 230 : kind === "threephase" || kind === "vfd3" || kind === "softstart" || kind === "motor3" ? 400 : kind === "pv" ? 36 : 24, power: kind === "micro1200" ? 1200 : kind === "micro600" ? 600 : kind === "inverter" ? 1e3 : kind === "motor3" ? 1500 : kind === "pv" || kind === "micro300" ? 300 : kind === "lamp" ? 2 : kind === "buzzer" ? 1 : 100, current: 10, capacity: 100, soc: 50, irradiance: 1e3, frequency: 50, target: 30, ramp: 3, poles: 4, tariff: 0, text: kind === "text" ? "Mi montaje" : "" });
function dimensions(kind) {
  if (kind === "enclosure") return { w: 900, h: 760 };
  if (kind === "duct") return { w: 680, h: 42 };
  if (kind === "duct-v") return { w: 42, h: 620 };
  if (kind === "rail") return { w: 270, h: 44 };
  if (kind === "text") return { w: 190, h: 50 };
  if (kind === "plc") return { w: 260, h: 156 };
  if (["contactor", "thermal", "vfd", "vfd3", "softstart", "controller"].includes(kind)) return { w: 180, h: 178 };
  if (["inverter", "micro300", "micro600", "micro1200", "dcdc", "pv", "battery", "motor3"].includes(kind)) return { w: 166, h: 150 };
  return { w: 116, h: 126 };
}
function rows(top, bottom, w, h) {
  return [...top.map((id, i) => ({ id, x: (i + 1) * w / (top.length + 1), y: 0 })), ...bottom.map((id, i) => ({ id, x: (i + 1) * w / (bottom.length + 1), y: h }))];
}
function ports(kind) {
  const { w, h } = dimensions(kind);
  switch (kind) {
    case "enclosure":
    case "duct":
    case "duct-v":
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
    case "softstart":
      return [...rows(["L1", "L2", "L3", "PE"], ["T1", "T2", "T3", "PEo"], w, h), { id: "24", x: w, y: 45 }, { id: "DI1", x: w, y: 80 }, { id: "COM", x: w, y: 145 }];
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
    case "timer":
      return rows(["A1", "15", "18"], ["A2", "16"], w, h);
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

// src/lab/equipment/Art.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function EquipmentDefs() {
  return /* @__PURE__ */ jsxs("defs", { children: [
    /* @__PURE__ */ jsxs("linearGradient", { id: "eq-shell", x1: "0", y1: "0", x2: "1", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { stopColor: "#fff" }),
      /* @__PURE__ */ jsx("stop", { offset: ".5", stopColor: "#e8eae6" }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#bec7c5" })
    ] }),
    /* @__PURE__ */ jsxs("linearGradient", { id: "eq-dark", x1: "0", y1: "0", x2: "1", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { stopColor: "#47545b" }),
      /* @__PURE__ */ jsx("stop", { offset: ".48", stopColor: "#26343b" }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#162228" })
    ] }),
    /* @__PURE__ */ jsxs("linearGradient", { id: "eq-metal", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { stopColor: "#f4f7f6" }),
      /* @__PURE__ */ jsx("stop", { offset: ".4", stopColor: "#b9c6cb" }),
      /* @__PURE__ */ jsx("stop", { offset: ".55", stopColor: "#edf3f3" }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#83949c" })
    ] }),
    /* @__PURE__ */ jsxs("radialGradient", { id: "eq-lens", cx: ".32", cy: ".28", r: ".8", children: [
      /* @__PURE__ */ jsx("stop", { stopColor: "#ffffff", stopOpacity: ".7" }),
      /* @__PURE__ */ jsx("stop", { offset: ".4", stopColor: "#fff", stopOpacity: ".06" }),
      /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#000", stopOpacity: ".35" })
    ] }),
    /* @__PURE__ */ jsx("filter", { id: "eq-shadow", x: "-12%", y: "-12%", width: "130%", height: "140%", children: /* @__PURE__ */ jsx("feDropShadow", { dx: "0", dy: "3", stdDeviation: "2.4", floodColor: "#20333a", floodOpacity: ".15" }) })
  ] });
}
var rect = (x, y, w, h, fill, rx = 3, stroke = "#596c74") => /* @__PURE__ */ jsx("rect", { x, y, width: w, height: h, rx, style: { fill, stroke, strokeWidth: 1 } });
var PALETTE = { verde: "#3b967b", rojo: "#d85448", ambar: "#e0a23a", amarillo: "#e8cf4a", azul: "#4a78b8", blanco: "#eef2f1", negro: "#2b3438" };
function Screw({ x, y }) {
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: "6.5", style: { fill: "url(#eq-metal)", stroke: "#4c626b", strokeWidth: 1 } }),
    /* @__PURE__ */ jsx("path", { d: `M${x - 3.4} ${y}h6.8M${x} ${y - 3.4}v6.8`, stroke: "#52646b", strokeWidth: "1.2" })
  ] });
}
function Text({ x, y, children, size = 9, color = "#566a73", anchor = "middle" }) {
  return /* @__PURE__ */ jsx("text", { x, y, textAnchor: anchor, style: { fill: color, stroke: "none", fontFamily: "LabSource, sans-serif", fontSize: size, fontWeight: 600 }, children });
}
function Display({ x, y, w, h, main, unit, on }) {
  return /* @__PURE__ */ jsxs("g", { children: [
    rect(x - 3, y - 3, w + 6, h + 6, "#34434a", 5),
    rect(x, y, w, h, on ? "#d7e8c9" : "#bbc4b5", 2, "#697c72"),
    /* @__PURE__ */ jsx("text", { x: x + w - 7, y: y + h * 0.61, textAnchor: "end", style: { fill: on ? "#203b32" : "#778171", stroke: "none", fontFamily: "Consolas,monospace", fontSize: Math.min(h * 0.37, (w - 13) / Math.max(1, main.length * 0.62)), fontWeight: 700 }, children: main }),
    /* @__PURE__ */ jsx(Text, { x: x + w - 7, y: y + h - 6, anchor: "end", size: 8, color: on ? "#344d43" : "#778171", children: unit })
  ] });
}
function ProtectionArt({ part, closed }) {
  const { w, h } = dimensions(part.kind), k = part.kind, n = k === "breaker3" || k === "guard" ? 3 : k === "breaker2" || k === "differential" ? 2 : 1;
  const dc = (k === "breaker" || k === "breaker2") && part.params.text === "dc", label = k === "differential" ? "DIFERENCIAL" : k === "guard" ? "GUARDAMOTOR" : k === "fuse" ? "PORTAFUSIBLE" : `DISYUNTOR ${dc ? "DC " : ""}${n}P`;
  if (k === "fuse") return /* @__PURE__ */ jsxs("g", { "data-protection-art": "fuse", children: [
    rect(22, 14, w - 44, h - 28, "url(#eq-shell)", 5),
    rect(34, 39, w - 68, 53, "#c1cccb", 3),
    rect(42, 45, w - 84, 40, closed ? "#e1e6db" : "#53666c", 3),
    closed ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("path", { d: `M${w / 2} 49v31`, stroke: "#7b8686", strokeWidth: "3" }),
      rect(40, 45, w - 80, 6, "url(#eq-metal)", 1),
      rect(40, 79, w - 80, 6, "url(#eq-metal)", 1)
    ] }) : null,
    /* @__PURE__ */ jsx(Text, { x: w / 2, y: 31, size: 7, children: "PORTAFUSIBLE" }),
    /* @__PURE__ */ jsx(Text, { x: w / 2, y: 104, size: 8, children: closed ? "CARTUCHO" : "EXTRA\xCDDO" })
  ] });
  return /* @__PURE__ */ jsxs("g", { "data-protection-art": k, children: [
    rect(12, 13, w - 24, h - 26, "url(#eq-shell)", 4),
    Array.from({ length: n - 1 }, (_, i) => /* @__PURE__ */ jsx("path", { d: `M${12 + (w - 24) * (i + 1) / n} 15v${h - 30}`, stroke: "#adbbbb", strokeWidth: ".8" }, i)),
    /* @__PURE__ */ jsx("path", { d: `M17 36h${w - 34}M17 99h${w - 34}`, stroke: "#9eafad", strokeWidth: "1" }),
    /* @__PURE__ */ jsx(Text, { x: w / 2, y: 29, size: k === "differential" ? 7 : 8, children: label }),
    /* @__PURE__ */ jsx(Text, { x: w / 2, y: 47, size: 7, children: "modo. \xB7 MANIOBRA" }),
    dc ? /* @__PURE__ */ jsxs("g", { "data-dc-breaker": "true", children: [
      rect(12, 13, w - 24, 5, "#4a78b8", 2, "none"),
      Array.from({ length: n }, (_, i) => {
        const x = 20 + (i + 0.5) * (w - 40) / n, plus = n === 1 || i === 0;
        return /* @__PURE__ */ jsx(Text, { x, y: 97, size: 11, color: plus ? "#b3412f" : "#2f5d9a", children: plus ? "+" : "\u2212" }, i);
      })
    ] }) : null,
    k === "guard" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("circle", { cx: w / 2 - 13, cy: "70", r: "16", fill: "url(#eq-metal)", stroke: "#667c80" }),
      /* @__PURE__ */ jsx("path", { d: `M${w / 2 - 13} 70l8-8`, stroke: "#36595c", strokeWidth: "3" }),
      rect(w / 2 + 8, 57, 18, 12, "#6d9d89", 2),
      rect(w / 2 + 8, 75, 18, 12, "#bf6c60", 2)
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      Array.from({ length: n }, (_, i) => {
        const x = 20 + i * (w - 40) / n, cw = (w - 40) / n - 4;
        return /* @__PURE__ */ jsxs("g", { children: [
          rect(x, 55, cw, 37, "#73878a", 2),
          rect(x + 2, closed ? 57 : 75, cw - 4, 14, closed ? "#347d72" : "#526b72", 2)
        ] }, i);
      }),
      n > 1 ? /* @__PURE__ */ jsx("path", { d: `M24 ${closed ? 64 : 82}H${w - 28}`, stroke: "#d1e6de", strokeWidth: "4", strokeLinecap: "round" }) : null,
      k === "differential" ? /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("circle", { cx: w - 26, cy: "47", r: "5", fill: "#d8bd6b", stroke: "#947b46" }),
        /* @__PURE__ */ jsx(Text, { x: w - 26, y: 49, size: 6, children: "T" })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx(Text, { x: w / 2, y: 110, size: 8, color: closed ? "#287463" : "#5c6f75", children: closed ? "I \xB7 CERRADO" : "O \xB7 ABIERTO" })
  ] });
}
function EquipmentBody({ part, reading, operated = false, symbolic = false, compact = false }) {
  const { w, h } = dimensions(part.kind), cx = w / 2, cy = h / 2, k = part.kind, on = reading?.active ?? false, closed = reading?.closed ?? part.closed;
  if (k === "enclosure") return /* @__PURE__ */ jsxs("g", { "data-free-cabinet": "true", children: [
    /* @__PURE__ */ jsx("rect", { x: "2", y: "2", width: w - 4, height: h - 4, rx: "12", fill: "#e9edf2", fillOpacity: ".16", stroke: "#8193a4", strokeWidth: "4" }),
    /* @__PURE__ */ jsx("rect", { x: "22", y: "36", width: w - 44, height: h - 58, rx: "4", fill: "none", stroke: "#b4bfcb", strokeWidth: "2", strokeDasharray: "6 5" }),
    /* @__PURE__ */ jsx(Text, { x: w / 2, y: 24, size: 12, children: "PLACA DE MONTAJE \xB7 GABINETE" }),
    [18, w - 18].map((x) => [18, h - 18].map((y) => /* @__PURE__ */ jsx(Screw, { x, y }, `${x}-${y}`)))
  ] });
  if (k === "duct" || k === "duct-v") return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("rect", { x: "1", y: "1", width: w - 2, height: h - 2, rx: "3", fill: "#e5e9ee", fillOpacity: ".7", stroke: "#8b9ba9", strokeWidth: "2" }),
    Array.from({ length: Math.floor((k === "duct" ? w : h) / 14) }, (_, i) => k === "duct" ? /* @__PURE__ */ jsx("path", { d: `M${i * 14 + 7} 2v9m0 20v9`, stroke: "#8495a5", strokeWidth: "2" }, i) : /* @__PURE__ */ jsx("path", { d: `M2 ${i * 14 + 7}h9m20 0h9`, stroke: "#8495a5", strokeWidth: "2" }, i))
  ] });
  if (symbolic && ["breaker", "breaker2", "breaker3", "differential", "guard", "fuse"].includes(k)) {
    const n = k === "breaker3" || k === "guard" ? 3 : k === "breaker2" || k === "differential" ? 2 : 1;
    return /* @__PURE__ */ jsxs("g", { className: "eq-symbolic", "data-protection-symbol": k, style: { stroke: "#536e73", strokeWidth: 2, fill: "none" }, children: [
      Array.from({ length: n }, (_, i) => {
        const x = (i + 1) * w / (n + 1);
        return /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("path", { d: `M${x} 0v43M${x} 83V${h}M${x} 83l${closed ? 0 : 13} -40` }),
          k === "fuse" ? /* @__PURE__ */ jsx("rect", { x: x - 8, y: "43", width: "16", height: "40" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("circle", { cx: x, cy: "43", r: "2.5" }),
            /* @__PURE__ */ jsx("path", { d: `M${x - 6} 53h12m-6-6v12` })
          ] })
        ] }, i);
      }),
      n > 1 ? /* @__PURE__ */ jsx("path", { d: `M${w / (n + 1) - 5} 64H${n * w / (n + 1) + 5}`, strokeDasharray: "4 3" }) : null,
      /* @__PURE__ */ jsx(Text, { x: w / 2, y: h + 30, size: 9, children: k === "differential" ? "\u0394I \xB7 maniobra" : k === "fuse" ? "FUSIBLE" : `${n}P \xB7 maniobra` })
    ] });
  }
  if (symbolic && (k === "contactor" || k === "thermal")) {
    const poles = [0, 1, 2].map((i) => (i + 1) * w / 4);
    return /* @__PURE__ */ jsxs("g", { className: "eq-symbolic", "data-power-symbol": k, style: { stroke: "#536e73", strokeWidth: 2, fill: "none" }, children: [
      poles.map((x, i) => /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("path", { d: `M${x} 0V30M${x} 82V${h}` }),
        k === "contactor" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("circle", { cx: x, cy: "30", r: "2.5" }),
          /* @__PURE__ */ jsx("path", { d: `M${x} 82L${x + (closed ? 0 : 14)} 36` })
        ] }) : /* @__PURE__ */ jsx("path", { d: `M${x} 30l-7 6 14 8-14 8 14 8-7 6V82` })
      ] }, i)),
      /* @__PURE__ */ jsx("path", { d: `M${poles[0] - 6} 56H${poles[2] + 6}`, strokeDasharray: "4 3" }),
      k === "contactor" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("rect", { x: w - 38, y: "44", width: "32", height: "26", rx: "2", fill: "#fff" }),
        /* @__PURE__ */ jsx("text", { x: w - 22, y: "61", textAnchor: "middle", style: { fill: "#536e73", stroke: "none", fontSize: 8, fontFamily: "LabSource, sans-serif", fontWeight: 600 }, children: "A1\u2013A2" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("path", { d: `M${w - 40} 40h30v34h-30z`, fill: "#fff" }),
        /* @__PURE__ */ jsx("path", { d: `M${w - 36} 62l5-8 5 8 5-8 5 8 5-8` })
      ] }),
      /* @__PURE__ */ jsx(Text, { x: w / 2, y: h + 30, size: 9, children: k === "contactor" ? "KM \xB7 3 polos NA + bobina" : "F \xB7 3 bimetales \xB7 95\u201396" })
    ] });
  }
  if (symbolic) return /* @__PURE__ */ jsxs("g", { className: "eq-symbolic", style: { stroke: "#536e73", strokeWidth: 2, fill: "none" }, children: [
    rect(8, 12, w - 16, h - 24, "#fff", 3, "#809699"),
    /* @__PURE__ */ jsx(Text, { x: cx, y: cy + 5, size: k === "text" ? 12 : 19, children: k === "text" ? part.params.text : k === "motor3" ? "M 3~" : k === "vfd" || k === "vfd3" ? "~ / ~" : k === "pv" ? "PV" : k === "battery" ? "+ | \u2212" : k === "plc" ? "PLC" : k === "energy" ? "kWh" : k === "wattmeter" ? "W" : k === "voltmeter" ? "V" : k === "ammeter" ? "A" : k === "contactor" ? "( K )" : part.tag })
  ] });
  if (k === "text") return /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(Text, { x: cx, y: cy + 5, size: 16, children: part.params.text }) });
  if (k === "rail") {
    const count = part.params.text === "8" ? 8 : part.params.text === "12" ? 12 : 0;
    return /* @__PURE__ */ jsxs("g", { "data-rail-positions": count || void 0, children: [
      rect(0, 7, w, 30, "url(#eq-metal)", 1),
      /* @__PURE__ */ jsx("path", { d: `M0 12H${w}M0 33H${w}`, stroke: "#667e87", strokeWidth: "2" }),
      count ? Array.from({ length: count }, (_, i) => {
        const x = (i + 0.5) * w / count;
        return /* @__PURE__ */ jsxs("g", { children: [
          rect(x - w / count / 2 + 2, 16, w / count - 4, 13, "#9fb0b4", 2, "#667e87"),
          /* @__PURE__ */ jsx(Text, { x, y: 26, size: Math.min(8, w / count - 4), color: "#2c3f45", children: String(i + 1) })
        ] }, i);
      }) : [20, w - 20].map((x) => /* @__PURE__ */ jsxs("g", { children: [
        rect(x, 18, 18, 7, "#b3c1c4", 3),
        /* @__PURE__ */ jsx(Screw, { x: x + 9, y: 21.5 })
      ] }, x))
    ] });
  }
  if (k === "earth") return /* @__PURE__ */ jsxs("g", { children: [
    rect(20, 10, w - 40, h - 20, "#e4cf64", 5),
    rect(26, 15, w - 52, h - 30, "#73a786", 3),
    /* @__PURE__ */ jsx(Screw, { x: cx, y: 30 }),
    /* @__PURE__ */ jsx("path", { d: `M${cx} 45v24m-20 0h40m-32 8h24m-17 8h10`, stroke: "#24483a", strokeWidth: "3" })
  ] });
  let art;
  if (["breaker", "breaker2", "breaker3", "differential", "guard", "fuse"].includes(k)) art = /* @__PURE__ */ jsx(ProtectionArt, { part, closed });
  else if (k === "lamp" && part.params.text === "bombillo") art = /* @__PURE__ */ jsxs("g", { "data-bulb": "true", children: [
    rect(cx - 14, h - 52, 28, 22, "url(#eq-metal)", 3),
    /* @__PURE__ */ jsx("path", { d: `M${cx - 14} ${h - 44}h28M${cx - 14} ${h - 38}h28`, stroke: "#7b8f95", strokeWidth: "1.6" }),
    /* @__PURE__ */ jsx("path", { d: `M${cx - 20} ${h - 52}C${cx - 34} ${h - 72} ${cx - 30} ${h - 112} ${cx} ${h - 112}S${cx + 34} ${h - 72} ${cx + 20} ${h - 52}z`, fill: on ? "#fff3b0" : "#e9f0f0", fillOpacity: on ? 0.95 : 0.55, stroke: "#81979c", strokeWidth: "1.6" }),
    /* @__PURE__ */ jsx("path", { d: `M${cx - 8} ${h - 52}V${h - 78}l4-8 8 0 4 8V${h - 52}`, fill: "none", stroke: on ? "#e08a2c" : "#7d8d92", strokeWidth: "2" }),
    on ? /* @__PURE__ */ jsx("circle", { cx, cy: h - 84, r: "34", fill: "#ffe27a", opacity: ".3" }) : null
  ] });
  else if (k === "selector" && part.params.text === "pared") art = /* @__PURE__ */ jsxs("g", { "data-wall-switch": "true", children: [
    rect(cx - 34, 10, 68, h - 20, "#f4f5f2", 6, "#aab4b2"),
    rect(cx - 24, 22, 48, h - 44, "#e3e7e4", 4, "#aab4b2"),
    /* @__PURE__ */ jsx("path", { d: `M${cx - 17} ${closed ? 30 : h / 2 + 4}h34v${h / 2 - 34}h-34z`, fill: closed ? "#d4ddd8" : "#c3cdc8", stroke: "#8da09a", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx(Text, { x: cx, y: h - 14, size: 7, children: closed ? "I \xB7 ON" : "O \xB7 OFF" })
  ] });
  else if (k === "busbar" && (part.params.text === "neutro" || part.params.text === "tierra")) art = /* @__PURE__ */ jsxs("g", { "data-bus-variant": part.params.text, children: [
    rect(10, 18, w - 20, h - 36, part.params.text === "neutro" ? "#bcd2e8" : "#d9d98a", 3),
    rect(10, 18, w - 20, 6, part.params.text === "neutro" ? "#4a78b8" : "#5f9a63", 2, "none"),
    Array.from({ length: 4 }, (_, i) => /* @__PURE__ */ jsx(Screw, { x: 20 + i * (w - 40) / 3, y: h / 2 }, i)),
    /* @__PURE__ */ jsx(Text, { x: cx, y: h - 26, size: 9, color: part.params.text === "neutro" ? "#24507f" : "#2f5a33", children: part.params.text === "neutro" ? "N \xB7 NEUTRO" : "PE \xB7 TIERRA" })
  ] });
  else if (k === "pv") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(6, 12, w - 12, h - 24, "url(#eq-metal)", 2),
    rect(12, 18, w - 24, h - 36, "#173c61", 1, "#1c4668"),
    Array.from({ length: 5 }, (_, col) => Array.from({ length: 4 }, (_2, row) => /* @__PURE__ */ jsxs("g", { children: [
      rect(15 + col * (w - 30) / 5, 21 + row * (h - 42) / 4, (w - 36) / 5 - 2, (h - 46) / 4 - 2, "#28577a", 1, "#8da8b6"),
      /* @__PURE__ */ jsx("path", { d: `M${21 + col * (w - 30) / 5} ${22 + row * (h - 42) / 4}v${(h - 46) / 4 - 3}`, stroke: "#a2b6c5", strokeWidth: ".6" })
    ] }, `${col}:${row}`))),
    /* @__PURE__ */ jsx("path", { d: `M15 20L${w - 15} ${h - 20}H15z`, fill: "#fff", opacity: ".06" })
  ] });
  else if (k === "lamp" || k === "buzzer" || k === "push-no" || k === "push-nc" || k === "emergency" || k === "selector") {
    const variant = part.params.text, tint = PALETTE[variant], color = k === "emergency" ? "#d85448" : k === "selector" ? "#34484c" : tint ?? (k === "push-nc" ? "#d85448" : "#3b967b");
    art = /* @__PURE__ */ jsxs("g", { children: [
      rect(19, 12, w - 38, h - 24, "url(#eq-dark)", 7),
      /* @__PURE__ */ jsx("circle", { cx, cy, r: k === "emergency" ? 34 : 30, style: { fill: k === "emergency" ? "#efd260" : "url(#eq-metal)", stroke: "#61737b", strokeWidth: 1.4 } }),
      k === "buzzer" ? /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("circle", { cx, cy, r: "25", fill: "#23343a" }),
        [-12, -6, 0, 6, 12].map((x) => /* @__PURE__ */ jsx("path", { d: `M${cx + x} ${cy - 14}v28`, stroke: "#81979a", strokeWidth: "2" }, x))
      ] }) : /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("circle", { cx, cy: cy + (operated ? 3 : 0), r: k === "emergency" ? 26 : 24, style: { fill: k === "lamp" && !on ? tint ? color : "#a3b5ac" : color, fillOpacity: k === "lamp" && !on && tint ? 0.4 : 1, stroke: "#254c49", strokeWidth: 1.4 } }),
        /* @__PURE__ */ jsx("circle", { cx, cy: cy + (operated ? 3 : 0), r: k === "emergency" ? 25 : 23, fill: "url(#eq-lens)" }),
        k === "selector" ? /* @__PURE__ */ jsx("path", { d: `M${cx - 16} ${cy + (closed ? 12 : -12)}l32 ${closed ? -24 : 24}`, stroke: "#dbe8e6", strokeWidth: "8", strokeLinecap: "round" }) : null
      ] }),
      k === "emergency" ? /* @__PURE__ */ jsx(Text, { x: cx, y: cy + 4, color: "#fff", size: 10, children: closed ? "PARO" : "PARO \u25CF" }) : null,
      k === "lamp" && on ? /* @__PURE__ */ jsx("circle", { cx, cy, r: "35", fill: "none", stroke: tint ?? "#59b58a", strokeWidth: "4", opacity: ".35" }) : null,
      k === "buzzer" && on ? /* @__PURE__ */ jsx("path", { d: `M${cx + 32} ${cy - 17}q14 17 0 34m5-42q21 25 0 50`, stroke: "#37a18a", strokeWidth: "2", fill: "none" }) : null
    ] });
  } else if (k === "motor" || k === "motor3") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(18, 24, w - 36, h - 52, "url(#eq-dark)", 12),
    Array.from({ length: 9 }, (_, i) => /* @__PURE__ */ jsx("path", { d: `M${28 + i * (w - 56) / 8} 34v${h - 72}`, stroke: "#8aa0aa", strokeWidth: "3", opacity: ".65" }, i)),
    rect(25, h - 30, 22, 18, "url(#eq-metal)", 2),
    rect(w - 47, h - 30, 22, 18, "url(#eq-metal)", 2),
    /* @__PURE__ */ jsx("circle", { cx, cy, r: "29", fill: "url(#eq-metal)", stroke: "#526970", strokeWidth: "2" }),
    /* @__PURE__ */ jsx("circle", { cx, cy, r: "19", fill: "#344d59" }),
    /* @__PURE__ */ jsx("g", { className: on ? "eq-rotor spinning" : "eq-rotor", style: { transformOrigin: `${cx}px ${cy}px`, animationDirection: reading?.reverse ? "reverse" : "normal" }, children: /* @__PURE__ */ jsx("path", { d: `M${cx} ${cy - 14}v28m-14-14h28`, stroke: "#a3bec6", strokeWidth: "5" }) }),
    /* @__PURE__ */ jsx(Text, { x: cx, y: h - 7, size: 8, children: k === "motor3" ? "MOTOR 3~ \xB7 SEIS BORNES" : "MOTOR 1~" })
  ] });
  else if (k === "contactor" || k === "thermal") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(12, 12, w - 24, h - 24, "url(#eq-dark)", 5),
    rect(17, 44, w - 34, 19, k === "thermal" ? "#71849b" : "#4b8a79", 2, "#435f65"),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 57, color: "#eef4f3", size: 11, children: k === "thermal" ? "PROTECCI\xD3N \xB7 T\xC9RMICO" : "CONTACTOR \xB7 modo." }),
    rect(35, 76, w - 70, 64, "#192a31", 3),
    k === "thermal" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("circle", { cx: cx - 21, cy: "104", r: "20", fill: "url(#eq-metal)" }),
      /* @__PURE__ */ jsx("path", { d: `M${cx - 21} 104l9-9`, stroke: "#3e606c", strokeWidth: "3" }),
      rect(cx + 10, 85, 25, 15, "#5b9b88"),
      rect(cx + 10, 111, 25, 15, "#c96555")
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      rect(cx - 30, 88, 60, 27, "#4c626b", 2),
      rect(cx - 19, 92, 38, 19, on ? "#54b08c" : "#26393f", 1),
      /* @__PURE__ */ jsx(Text, { x: cx, y: 132, size: 9, color: "#c2d3d5", children: "A1 \xB7 A2" })
    ] })
  ] });
  else if (k === "softstart") {
    const progress = Math.min(1, (reading?.frequency ?? 0) / (part.params.frequency || 50)), pct = Math.round((on ? part.params.target / 100 + (1 - part.params.target / 100) * progress : 0) * 100), full = progress >= 0.9999;
    art = /* @__PURE__ */ jsxs("g", { "data-softstart-art": "true", children: [
      rect(8, 12, w - 16, h - 24, "url(#eq-shell)", 6),
      Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ jsx("path", { d: `M${w - 35 + i * 3} 38v${h - 78}`, stroke: "#91a2a4", strokeWidth: "1" }, i)),
      rect(17, 26, w - 63, h - 58, "url(#eq-dark)", 5),
      /* @__PURE__ */ jsx(Text, { x: 25, y: 42, anchor: "start", color: "#d9e6e2", size: 9, children: "ARRANCADOR SUAVE" }),
      /* @__PURE__ */ jsx(Display, { x: 27, y: 50, w: w - 104, h: 38, on, main: String(pct), unit: "% TENSI\xD3N" }),
      rect(27, 94, w - 104, 8, "#0d171b", 2, "#3d5057"),
      rect(28, 95, Math.max(0, (w - 106) * progress), 6, full ? "#59d6a3" : "#e5b84b", 1, "none"),
      /* @__PURE__ */ jsx(Text, { x: 27, y: 112, anchor: "start", size: 6.5, color: "#c3d2cf", children: on ? full ? "PLENA TENSI\xD3N \xB7 PUENTEADO" : `RAMPA ${Math.round(progress * 100)} %` : "DETENIDO" }),
      [["PWR", on], ["RUN", on], ["BYP", full]].map(([label, lit], i) => /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("circle", { cx: 32 + i * 27, cy: "123", r: "3", fill: lit ? "#63b994" : "#718881" }),
        lit ? /* @__PURE__ */ jsx("circle", { cx: 32 + i * 27, cy: "123", r: "7", fill: "#63b994", opacity: ".25" }) : null,
        /* @__PURE__ */ jsx(Text, { x: 32 + i * 27, y: 136, size: 7, color: "#c3d2cf", children: String(label) })
      ] }, String(label))),
      rect(117, 61, 20, 17, on ? "#3fae8a" : "#529780"),
      rect(117, 85, 20, 17, "#b76859"),
      /* @__PURE__ */ jsx(Text, { x: 127, y: 73, size: 7, color: "#fff", children: "I" }),
      /* @__PURE__ */ jsx(Text, { x: 127, y: 97, size: 7, color: "#fff", children: "O" })
    ] });
  } else if (k === "vfd" || k === "vfd3" || k === "plc") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(8, 12, w - 16, h - 24, "url(#eq-shell)", 6),
    Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ jsx("path", { d: `M${w - 35 + i * 3} 38v${h - 78}`, stroke: "#91a2a4", strokeWidth: "1" }, i)),
    rect(17, 26, w - 63, h - 58, "url(#eq-dark)", 5),
    /* @__PURE__ */ jsx(Text, { x: 25, y: 42, anchor: "start", color: "#d9e6e2", size: 9, children: k === "plc" ? "PLC \xB7 modo." : "VARIADOR \xB7 modo." }),
    /* @__PURE__ */ jsx(Display, { x: 27, y: 54, w: k === "plc" ? w - 84 : w - 104, h: k === "plc" ? 42 : 47, on: on || !!reading?.frequency, main: k === "plc" ? on ? "RUN" : "STOP" : (reading?.frequency ?? 0).toFixed(1), unit: k === "plc" ? "PROGRAMA DEL PROYECTO" : "Hz" }),
    [0, 1, 2].map((i) => /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("circle", { cx: 32 + i * 27, cy: k === "plc" ? 112 : 123, r: "3", fill: i === 0 && on ? "#63b994" : "#718881" }),
      /* @__PURE__ */ jsx(Text, { x: 32 + i * 27, y: k === "plc" ? 127 : 136, size: 7, color: "#c3d2cf", children: ["PWR", "RUN", "FLT"][i] })
    ] }, i)),
    k === "plc" ? null : /* @__PURE__ */ jsxs(Fragment, { children: [
      rect(117, 61, 20, 17, "#529780"),
      rect(117, 85, 20, 17, "#b76859"),
      /* @__PURE__ */ jsx(Text, { x: 127, y: 73, size: 7, color: "#fff", children: "I" }),
      /* @__PURE__ */ jsx(Text, { x: 127, y: 97, size: 7, color: "#fff", children: "O" })
    ] })
  ] });
  else if (k === "voltmeter" || k === "ammeter" || k === "wattmeter" || k === "energy") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(13, 14, w - 26, h - 28, "url(#eq-shell)", 5),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 33, size: 10, children: k === "energy" ? "ENERG\xCDA" : k === "voltmeter" ? "TENSI\xD3N" : k === "ammeter" ? "CORRIENTE" : "POTENCIA" }),
    /* @__PURE__ */ jsx(Display, { x: 25, y: 45, w: w - 50, h: 48, on: !!reading, main: (k === "voltmeter" ? reading?.voltage : k === "ammeter" ? reading?.current : k === "energy" ? reading?.energy : reading?.power ?? 0)?.toFixed(k === "energy" ? 4 : 2) ?? "0.00", unit: k === "energy" ? "kWh" : k === "voltmeter" ? "V" : k === "ammeter" ? "A" : "W" })
  ] });
  else if (k === "battery") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(11, 20, w - 22, h - 34, "url(#eq-dark)", 7),
    rect(27, 12, 19, 12, "url(#eq-metal)", 2),
    rect(w - 46, 12, 19, 12, "#a66458", 2),
    rect(27, 45, w - 54, 66, "#d7e2dc", 3),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 66, size: 11, children: "BATER\xCDA DC" }),
    /* @__PURE__ */ jsxs(Text, { x: cx, y: 91, size: 20, children: [
      (reading?.soc ?? part.params.soc).toFixed(0),
      "%"
    ] }),
    /* @__PURE__ */ jsxs(Text, { x: cx, y: 105, size: 8, children: [
      part.params.voltage,
      " V \xB7 ",
      part.params.capacity,
      " Ah"
    ] })
  ] });
  else if (k === "controller" || k === "inverter" || k.startsWith("micro") || k === "dcdc") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(9, 13, w - 18, h - 26, "url(#eq-shell)", 7),
    rect(16, 40, w - 32, h - 66, "url(#eq-dark)", 5),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 31, size: 10, children: k === "controller" ? "CONTROLADOR SOLAR" : k === "dcdc" ? "REGULADOR DC/DC" : k.startsWith("micro") ? "MICROINVERSOR" : "INVERSOR DC/AC" }),
    /* @__PURE__ */ jsx(Display, { x: 26, y: 53, w: w - 52, h: 45, main: (reading?.power ?? 0).toFixed(1), unit: "W \xB7 MODELO EQUIVALENTE", on }),
    [0, 1, 2].map((i) => /* @__PURE__ */ jsx("circle", { cx: cx - 25 + i * 25, cy: h - 44, r: "4", fill: i === 0 && on ? "#60b18e" : "#758783" }, i))
  ] });
  else if (k === "dc" || k === "ac" || k === "threephase") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(11, 13, w - 22, h - 26, "url(#eq-shell)", 5),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 33, size: 9, children: k === "dc" ? "FUENTE DC" : k === "ac" ? "FUENTE AC" : "FUENTE 3~" }),
    /* @__PURE__ */ jsx(Display, { x: 25, y: 46, w: w - 50, h: 42, main: String(part.params.voltage), unit: k === "dc" ? "V DC" : k === "threephase" ? "V \xB7 L\xCDNEA RMS" : "V RMS", on: true }),
    /* @__PURE__ */ jsx("path", { d: `M26 102h${w - 52}`, stroke: "#98aaa9", strokeWidth: "3" })
  ] });
  else if (k === "terminal" || k === "busbar") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(13, 20, w - 26, h - 40, "#a9b5b7", 3),
    rect(23, 22, w - 46, h - 44, "url(#eq-metal)", 1),
    [40, h - 40].map((y) => /* @__PURE__ */ jsx(Screw, { x: cx, y }, y)),
    /* @__PURE__ */ jsx(Text, { x: cx, y: cy + 3, size: 10, children: "PASO" })
  ] });
  else if (k === "timer") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(14, 15, w - 28, h - 30, "url(#eq-shell)", 5),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 32, size: 8.5, children: "TEMPORIZADOR" }),
    rect(24, 38, w - 48, 34, "url(#eq-dark)", 3),
    /* @__PURE__ */ jsxs(Text, { x: cx, y: 60, size: 15, color: closed ? "#8fe0b8" : "#e5b84b", children: [
      part.params.ramp.toFixed(1),
      " s"
    ] }),
    /* @__PURE__ */ jsx("circle", { cx: w - 30, cy: 84, r: "4", fill: on ? "#63b994" : reading?.status?.startsWith("Contando") ? "#e5b84b" : "#718881" }),
    /* @__PURE__ */ jsx(Text, { x: cx - 8, y: 88, size: 7, color: "#344e41", children: closed ? "15\u201318" : "15\u201316" })
  ] });
  else if (k === "aux-no" || k === "aux-nc") art = /* @__PURE__ */ jsxs("g", { children: [
    rect(16, 17, w - 32, h - 34, "url(#eq-shell)", 4),
    rect(28, 48, w - 56, 32, closed ? "#7cab94" : "#65777d", 2),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 68, color: "#fff", size: 12, children: k === "aux-no" ? "NA" : "NC" })
  ] });
  else art = /* @__PURE__ */ jsxs("g", { children: [
    rect(19, 14, w - 38, h - 28, "url(#eq-shell)", 4),
    /* @__PURE__ */ jsx("path", { d: `M24 30h${w - 48}m-${w - 48} 66h${w - 48}`, stroke: "#9aabab", strokeWidth: "2" }),
    /* @__PURE__ */ jsx(Text, { x: cx, y: 46, size: 9, children: k === "fuse" ? "FUSIBLE" : k === "differential" ? "PRUEBA ID" : k === "guard" ? "GUARDAMOTOR" : "MANIOBRA" }),
    rect(34, 55, w - 68, 35, "#455c63", 3),
    rect(38, closed ? 58 : 72, w - 76, 14, closed ? "#39866e" : "#677b82", 2),
    /* @__PURE__ */ jsx(Text, { x: cx, y: closed ? 68 : 82, size: 9, color: "#fff", children: closed ? "I" : "O" })
  ] });
  return /* @__PURE__ */ jsxs("g", { className: `eq-art ${on ? "is-active" : ""}`, filter: "url(#eq-shadow)", children: [
    art,
    !compact && ports(k).map((port) => {
      const innerX = port.x === 0 ? 10 : port.x === w ? w - 10 : port.x, innerY = port.y === 0 ? 17 : port.y === h ? h - 17 : port.y;
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx("line", { x1: port.x, y1: port.y, x2: innerX, y2: innerY, stroke: "#748b94", strokeWidth: "2" }),
        /* @__PURE__ */ jsx(Screw, { x: innerX, y: innerY }),
        /* @__PURE__ */ jsx(Text, { x: port.x === 0 ? 22 : port.x === w ? w - 22 : port.x, y: port.y === 0 ? -7 : port.y === h ? h + 14 : port.y + 3, size: k === "plc" ? 7 : 8, anchor: port.x === 0 ? "start" : port.x === w ? "end" : "middle", children: port.id })
      ] }, port.id);
    })
  ] });
}

// <stdin>
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
export {
  CATALOG,
  EquipmentBody,
  EquipmentDefs,
  VARIANTS,
  defaults,
  dimensions,
  createElement as h,
  renderToStaticMarkup
};
