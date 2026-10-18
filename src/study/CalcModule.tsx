import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowDownToLine, CornerDownLeft, FileText, RotateCcw } from "lucide-react";
import { Calculator } from "./Calculator";
import { CalculationSteps, MotorSteps } from "./CalculationSteps";
import { cableCapacity, coordination, motorCurrent, numberValue } from "./model";
import { formatResult } from "./calcEngine";

const d = (n: number) => formatResult(Math.round(n * 1e6) / 1e6);
const CURVES: Record<string, [number, number]> = { B: [3, 5], C: [5, 10], D: [10, 20] };
const PDF = "/estudio/profesor.pdf#page=";

/** Símbolo con subíndice, tal como se escribe en la presentación. */
export const S = ({ b, s, sup }: { b: string; s?: string; sup?: string }) => (
  <span className="sym">{b}{s && <sub>{s}</sub>}{sup && <sup>{sup}</sup>}</span>
);

type Field = { key: string; label: string; unit: string; def: string; hint?: string; options?: string[] };
type Outcome = { value: string; unit?: string; numeric?: number; exprs?: string[]; body: ReactNode };
export type Card = {
  id: string;
  tab: string;
  title: string;
  /** Lámina de origen y si es fórmula del profesor o cálculo didáctico añadido. */
  slide: number;
  origin: "profesor" | "didactico";
  /** Fórmula escrita como en la lámina. */
  exact: ReactNode;
  legend: [ReactNode, string][];
  example: string;
  note: string;
  fields: Field[];
  run: (v: Record<string, string>) => Outcome | string;
};
const num = (v: Record<string, string>, k: string) => numberValue(v[k]);

export const CARDS: Card[] = [
  {
    id: "coord", tab: "Coordinación", title: "Coordinación de corrientes", slide: 6, origin: "profesor",
    exact: <><S b="I" s="n" /> ≤ <S b="I" s="p" /> ≤ <S b="I" s="z" /></>,
    legend: [
      [<S b="I" s="n" key="n" />, "Corriente de carga (A), en esta presentación."],
      [<S b="I" s="p" key="p" />, "Corriente nominal de la protección (A)."],
      [<S b="I" s="z" key="z" />, "Capacidad corregida del cable (A)."],
      [<span key="iec">Notación IEC</span>, "Suele escribirse Ib ≤ In ≤ Iz: cambia el símbolo, no el criterio."],
    ],
    example: "Lámina 6: 18 A ≤ 20 A ≤ 25 A. Lámina 12, con la capacidad corregida: 18 ≤ 20 ≤ 21,6 A.",
    note: "El poder de corte debe cubrir la corriente de cortocircuito prevista. Esta regla no sustituye las verificaciones de disparo y energía pasante.",
    fields: [
      { key: "in", label: "In · corriente de carga", unit: "A", def: "18" },
      { key: "ip", label: "Ip · nominal de la protección", unit: "A", def: "20" },
      { key: "iz", label: "Iz · capacidad corregida", unit: "A", def: "21,6" },
    ],
    run: (v) => {
      const [i, p, z] = [num(v, "in"), num(v, "ip"), num(v, "iz")];
      if (i === null || p === null || z === null) return "Completa los tres datos con números.";
      const first = i <= p, second = p <= z;
      return {
        value: coordination(i, p, z) ? "Cumple" : "No cumple",
        body: <CalculationSteps title="Procedimiento" steps={[
          ["¿La protección admite la carga?", `In ≤ Ip → ${d(i)} ≤ ${d(p)}: ${first ? "sí" : "no"}`],
          ["¿La protección respeta el cable?", `Ip ≤ Iz → ${d(p)} ≤ ${d(z)}: ${second ? "sí" : "no"}`],
        ]} meaning={first && second ? "Cumple la coordinación básica de corrientes. Aún faltan poder de corte, disparo y energía pasante." : `No cumple: ${!first ? "la nominal es menor que la carga" : "la nominal supera la capacidad corregida del cable"}.`} />,
      };
    },
  },
  {
    id: "banda", tab: "Banda B / C / D", title: "Banda del disparo magnético", slide: 8, origin: "profesor",
    exact: <>B: 3–5 × nominal · C: 5–10 × nominal · D: 10–20 × nominal</>,
    legend: [
      [<span key="b">B</span>, "Cargas resistivas: disparo magnético de 3 a 5 veces la nominal."],
      [<span key="c">C</span>, "Uso general: de 5 a 10 veces la nominal."],
      [<span key="dd">D</span>, "Arranques altos: de 10 a 20 veces la nominal (IEC 60898-1)."],
      [<span key="pc">Poder de corte</span>, "Debe ser ≥ la corriente de falla prevista."],
    ],
    example: "Ejemplo didáctico añadido: curva C de 16 A → 5 × 16 = 80 A y 10 × 16 = 160 A.",
    note: "Esquema cualitativo, sin escala ni tolerancias. Usa la curva del fabricante para verificar tiempos.",
    fields: [
      { key: "curve", label: "Curva", unit: "", def: "C", options: ["B", "C", "D"] },
      { key: "nominal", label: "Corriente nominal", unit: "A", def: "16" },
    ],
    run: (v) => {
      const n = num(v, "nominal");
      const band = CURVES[v.curve];
      if (n === null || !band) return "Elige la curva y escribe la nominal.";
      if (n <= 0) return "La nominal debe ser mayor que 0.";
      const [lo, hi] = band;
      return {
        value: `${d(lo * n)}–${d(hi * n)}`, unit: "A", exprs: [`${lo}×${d(n)}`, `${hi}×${d(n)}`],
        body: <CalculationSteps title="Procedimiento" steps={[
          ["Identifica la banda de la curva", `Curva ${v.curve}: ${lo}–${hi} veces la nominal`],
          ["Multiplica ambos extremos", `${lo} × ${d(n)} = ${d(lo * n)} A · ${hi} × ${d(n)} = ${d(hi * n)} A`],
        ]} meaning="Es la banda del umbral magnético, no un tiempo de disparo." />,
      };
    },
  },
  {
    id: "iz", tab: "Capacidad del cable", title: "Capacidad corregida del cable", slide: 12, origin: "profesor",
    exact: <><S b="I" s="z" /> = <S b="I" s="tabla" /> <S b="f" s="T" /> <S b="f" s="G" /></>,
    legend: [
      [<S b="I" s="z" key="z" />, "Capacidad corregida del cable (A)."],
      [<S b="I" s="tabla" key="t" />, "Capacidad tabulada (A): según material, aislación y método de instalación."],
      [<S b="f" s="T" key="ft" />, "Factor de corrección por temperatura (sin unidad)."],
      [<S b="f" s="G" key="fg" />, "Factor de corrección por agrupamiento (sin unidad)."],
    ],
    example: "Lámina 12: 30 × 0,9 × 0,8 = 21,6 A. Los factores se multiplican; no se suman.",
    note: "Ejemplo didáctico con datos supuestos. La capacidad tabulada debe corresponder al material, aislación y método de instalación reales.",
    fields: [
      { key: "table", label: "Itabla · capacidad tabulada", unit: "A", def: "30" },
      { key: "ft", label: "fT · factor de temperatura", unit: "", def: "0,9", hint: "Sin unidad" },
      { key: "fg", label: "fG · factor de agrupamiento", unit: "", def: "0,8", hint: "Sin unidad" },
    ],
    run: (v) => {
      const [t, ft, fg] = [num(v, "table"), num(v, "ft"), num(v, "fg")];
      if (t === null || ft === null || fg === null) return "Completa los tres datos con números.";
      if (t <= 0 || ft <= 0 || fg <= 0) return "Todos los datos deben ser mayores que 0.";
      const iz = cableCapacity(t, ft, fg);
      return {
        value: d(iz), unit: "A", numeric: iz, exprs: [`${d(t)}×${d(ft)}×${d(fg)}`],
        body: <CalculationSteps title="Procedimiento" steps={[
          ["Multiplica los factores", `fT × fG = ${d(ft)} × ${d(fg)} = ${d(ft * fg)}`],
          ["Aplícalos a la capacidad tabulada", `Itabla × ${d(ft * fg)} = ${d(t)} × ${d(ft * fg)} = ${d(iz)} A`],
        ]} meaning="Es la capacidad corregida (Iz). Caída de tensión y cortocircuito se comprueban aparte." />,
      };
    },
  },
  {
    id: "caida", tab: "Caída de tensión", title: "Caída de tensión", slide: 12, origin: "profesor",
    exact: <>Calcular para longitud y carga; comparar con el límite aplicable.</>,
    legend: [
      [<span key="c">Calculada</span>, "Caída de tensión obtenida para la longitud y la carga (%)."],
      [<span key="l">Límite</span>, "Límite aplicable que se adopta en el ejercicio (%)."],
    ],
    example: "Lámina 12: 2 % calculado frente a 3 % adoptado en el ejercicio → cumple.",
    note: "La lámina no entrega la fórmula para obtener la caída: se calcula con la longitud y la carga y se compara con el límite aplicable. El 3 % es del ejemplo, no un límite universal.",
    fields: [
      { key: "calc", label: "Caída calculada", unit: "%", def: "2" },
      { key: "limit", label: "Límite adoptado", unit: "%", def: "3" },
    ],
    run: (v) => {
      const [c, l] = [num(v, "calc"), num(v, "limit")];
      if (c === null || l === null) return "Escribe ambos porcentajes.";
      if (c < 0 || l <= 0) return "Usa valores positivos.";
      return {
        value: c <= l ? "Cumple" : "No cumple",
        body: <CalculationSteps title="Procedimiento" steps={[["Compara con el límite", `${d(c)} % ≤ ${d(l)} % → ${c <= l ? "sí" : "no"}`]]} meaning={c <= l ? "La caída calculada no supera el límite adoptado." : "La caída calculada supera el límite: revisa sección o longitud."} />,
      };
    },
  },
  {
    id: "i2t", tab: "Cortocircuito I²t", title: "Resistencia del cable al cortocircuito", slide: 12, origin: "profesor",
    exact: <><S b="I" sup="2" />t ≤ <S b="k" sup="2" /><S b="S" sup="2" /></>,
    legend: [
      [<span key="e"><S b="I" sup="2" />t</span>, "Energía pasante de la protección (A²·s): se toma de la ficha del fabricante."],
      [<S b="k" key="k" />, "Constante según conductor y aislación."],
      [<S b="S" key="s" />, "Sección del conductor (mm²)."],
      [<span key="r">k²S²</span>, "Capacidad térmica del cable: modelo adiabático."],
    ],
    example: "La lámina no entrega valores. Los de abajo son un ejemplo didáctico supuesto.",
    note: "Comparar energía pasante con capacidad térmica del cable. Modelo adiabático bajo sus condiciones de aplicación. Elegir k según conductor y aislación; consultar IEC 60364 y la normativa local vigente.",
    fields: [
      { key: "i2t", label: "I²t · energía pasante (supuesta)", unit: "A²s", def: "30000" },
      { key: "k", label: "k · constante (supuesta)", unit: "", def: "115", hint: "Según conductor y aislación" },
      { key: "s", label: "S · sección", unit: "mm²", def: "2,5" },
    ],
    run: (v) => {
      const [e, k, s] = [num(v, "i2t"), num(v, "k"), num(v, "s")];
      if (e === null || k === null || s === null) return "Completa los tres datos con números.";
      if (e < 0 || k <= 0 || s <= 0) return "Usa valores positivos.";
      const cap = k * k * s * s;
      return {
        value: e <= cap ? "Cumple" : "No cumple", exprs: [`${d(k)}^2×${d(s)}^2`],
        body: <CalculationSteps title="Procedimiento" steps={[
          ["Capacidad térmica del cable", `k² × S² = ${d(k)}² × ${d(s)}² = ${d(cap)} A²s`],
          ["Compara con la energía pasante", `I²t ≤ k²S² → ${d(e)} ≤ ${d(cap)}: ${e <= cap ? "sí" : "no"}`],
        ]} meaning={e <= cap ? "El cable soporta la energía pasante en este ejemplo supuesto." : "La energía pasante supera la capacidad térmica del cable: revisa la sección o la protección."} />,
      };
    },
  },
  {
    id: "guardamotor", tab: "Guardamotor", title: "Rango del guardamotor", slide: 13, origin: "profesor",
    exact: <>Elegir un rango que incluya la corriente de placa y ajustar según el fabricante.</>,
    legend: [
      [<span key="p">Corriente de placa</span>, "Corriente nominal, tensión y conexión del motor (A)."],
      [<span key="r">Rango</span>, "Intervalo de ajuste térmico del guardamotor: mínimo y máximo (A)."],
      [<span key="a">Ajuste</span>, "Valor elegido dentro del rango, según el fabricante."],
    ],
    example: "Ejemplo didáctico añadido: placa de 6,3 A → el rango 6–10 A la incluye; 4–6 A no.",
    note: "Comprobar el umbral magnético, el tiempo de arranque y el poder de corte. El magnético puede ser fijo según el modelo.",
    fields: [
      { key: "min", label: "Rango · mínimo", unit: "A", def: "6" },
      { key: "max", label: "Rango · máximo", unit: "A", def: "10" },
      { key: "plate", label: "Corriente de placa", unit: "A", def: "6,3" },
    ],
    run: (v) => {
      const [lo, hi, p] = [num(v, "min"), num(v, "max"), num(v, "plate")];
      if (lo === null || hi === null || p === null) return "Completa los tres datos con números.";
      if (lo <= 0 || hi < lo) return "El máximo debe ser mayor o igual que el mínimo.";
      const ok = lo <= p && p <= hi;
      return {
        value: ok ? "Incluye la placa" : "No incluye la placa",
        body: <CalculationSteps title="Procedimiento" steps={[["Compara la placa con el rango", `${d(lo)} ≤ ${d(p)} ≤ ${d(hi)}: ${ok ? "sí" : "no"}`]]} meaning={ok ? "El rango sirve. Ajusta según el fabricante a la corriente de placa; no al extremo del rango." : "Elige otro rango: la corriente de placa debe quedar dentro del intervalo."} />,
      };
    },
  },
  {
    id: "fuga", tab: "Fuga en mA", title: "Desequilibrio por fuga", slide: 14, origin: "didactico",
    exact: <>Desequilibrio = |ida − vuelta| · 1 A = 1000 mA</>,
    legend: [
      [<span key="i">Ida / vuelta</span>, "Corriente que sale y que regresa por el circuito (A)."],
      [<span key="m">≤ 30 mA</span>, "Sensibilidad diferencial habitual para protección adicional de personas bajo IEC (lámina 14)."],
    ],
    example: "Cálculo didáctico añadido: ida 10 A y vuelta 9,97 A → 0,03 A = 30 mA.",
    note: "La lámina 14 no entrega una fórmula: esta resta es un cálculo didáctico para entender el desequilibrio. No determina tiempo de disparo.",
    fields: [
      { key: "ida", label: "Corriente de ida", unit: "A", def: "10" },
      { key: "vuelta", label: "Corriente de vuelta", unit: "A", def: "9,97" },
    ],
    run: (v) => {
      const [a, b] = [num(v, "ida"), num(v, "vuelta")];
      if (a === null || b === null) return "Escribe ambas corrientes con números.";
      const diff = Math.round(Math.abs(a - b) * 1e6) / 1e6;
      return {
        value: d(diff * 1000), unit: "mA", numeric: diff * 1000, exprs: [`(${d(a)}−${d(b)})×1000`],
        body: <CalculationSteps title="Procedimiento" steps={[
          ["Resta en la misma unidad", `|${d(a)} − ${d(b)}| = ${d(diff)} A`],
          ["Convierte a miliamperes", `${d(diff)} × 1000 = ${d(diff * 1000)} mA`],
        ]} meaning="Es una comparación conceptual de desequilibrio por fuga." />,
      };
    },
  },
  {
    id: "motor", tab: "Corriente del motor", title: "Corriente de un motor trifásico", slide: 15, origin: "profesor",
    exact: <><S b="I" s="n" /> = <S b="P" s="salida" /> / (√3 <S b="V" s="LL" /> η cos φ)</>,
    legend: [
      [<S b="I" s="n" key="n" />, "Corriente nominal calculada del motor (A)."],
      [<S b="P" s="salida" key="p" />, "Potencia mecánica de salida, en watts (kW × 1000)."],
      [<S b="V" s="LL" key="v" />, "Tensión entre líneas (V)."],
      [<span key="e">η</span>, "Rendimiento (fracción, sin unidad)."],
      [<span key="c">cos φ</span>, "Factor de potencia (fracción, sin unidad)."],
    ],
    example: "La lámina deja los valores por completar. Ejemplo didáctico supuesto: 5,5 kW · 400 V · η 0,88 · cosφ 0,83 → 10,87 A.",
    note: "Válida si la potencia indicada es mecánica de salida. Comparar el cálculo con la corriente de placa y justificar cada selección.",
    fields: [
      { key: "kw", label: "Psalida · potencia de salida", unit: "kW", def: "5,5" },
      { key: "v", label: "VLL · tensión entre líneas", unit: "V", def: "400" },
      { key: "eta", label: "η · rendimiento", unit: "", def: "0,88", hint: "Fracción, no porcentaje" },
      { key: "pf", label: "cos φ · factor de potencia", unit: "", def: "0,83", hint: "Fracción, no porcentaje" },
    ],
    run: (v) => {
      const [kw, volt, eta, pf] = [num(v, "kw"), num(v, "v"), num(v, "eta"), num(v, "pf")];
      if (kw === null || volt === null || eta === null || pf === null) return "Completa los cuatro datos con números.";
      if (kw <= 0 || volt <= 0) return "Potencia y tensión deben ser mayores que 0.";
      if (eta <= 0 || eta > 1 || pf <= 0 || pf > 1) return "η y cosφ van entre 0 y 1 (por ejemplo 0,88, no 88).";
      const i = motorCurrent(kw, volt, eta, pf);
      return { value: d(Math.round(i * 100) / 100), unit: "A", numeric: i, exprs: [`${d(kw * 1000)}/(√(3)×${d(volt)}×${d(eta)}×${d(pf)})`], body: <MotorSteps power={kw} voltage={volt} eta={eta} pf={pf} current={i} /> };
    },
  },
];


/** Para qué sirve cada fórmula y cómo se agrupan según la tarea. */
export const PURPOSE: Record<string, { what: string; when: string; tells: string }> = {
  coord: {
    what: "Comprobar que la protección elegida cuida al cable sin dispararse con la carga normal.",
    when: "Cuando ya conoces la carga y el cable, y quieres decidir la corriente nominal del interruptor o fusible.",
    tells: "Si la protección sirve (Cumple / No cumple) y cuál de las dos condiciones falla.",
  },
  banda: {
    what: "Convertir la letra de la curva (B, C o D) en amperes: desde qué corriente actúa el disparo magnético.",
    when: "Al elegir la curva de un termomagnético según la carga: resistiva, de uso general o con arranque alto.",
    tells: "La banda de corriente, mínima y máxima, en que dispara el magnético (cortocircuito).",
  },
  iz: {
    what: "Saber cuánta corriente aguanta de verdad el cable en tu instalación, descontando calor y agrupamiento.",
    when: "Antes de coordinar: necesitas Iz para aplicar la regla In ≤ Ip ≤ Iz.",
    tells: "La capacidad corregida del cable (Iz), en amperes.",
  },
  caida: {
    what: "Revisar que el cable no pierda demasiada tensión por su largo y por la carga que alimenta.",
    when: "Después de elegir la sección, para confirmar que la caída queda dentro del límite aplicable.",
    tells: "Si la caída calculada está dentro del límite adoptado (Cumple / No cumple).",
  },
  i2t: {
    what: "Confirmar que el cable no se daña durante un cortocircuito, mientras la protección tarda en actuar.",
    when: "Cuando ya tienes la protección y la sección: se compara lo que deja pasar la protección con lo que el cable resiste.",
    tells: "Si el cable resiste la energía de la falla (Cumple / No cumple).",
  },
  guardamotor: {
    what: "Elegir un guardamotor cuyo rango de ajuste incluya la corriente de placa del motor.",
    when: "Al seleccionar el guardamotor de un motor concreto, después de leer su placa.",
    tells: "Si el rango sirve para tu motor (Incluye / No incluye la placa).",
  },
  motor: {
    what: "Calcular cuánta corriente toma un motor trifásico a partir de su potencia, para compararla con la placa.",
    when: "Cuando conoces la potencia de salida, la tensión, el rendimiento y el factor de potencia; es el punto de partida para protecciones y cable.",
    tells: "La corriente nominal del motor (In), en amperes.",
  },
  fuga: {
    what: "Ver cuánta corriente se está yendo por una fuga a tierra: justamente lo que detecta un diferencial.",
    when: "Para entender la sensibilidad de un diferencial (habitualmente ≤ 30 mA para proteger a las personas).",
    tells: "El desequilibrio entre ida y vuelta, en miliamperes.",
  },
};
export const GROUPS: { name: string; blurb: string; ids: string[] }[] = [
  { name: "Elegir la protección", blurb: "Qué interruptor o fusible usar", ids: ["coord", "banda"] },
  { name: "Verificar el cable", blurb: "Que el cable aguante", ids: ["iz", "caida", "i2t"] },
  { name: "Motor trifásico", blurb: "Corriente y guardamotor", ids: ["motor", "guardamotor"] },
  { name: "Fuga y personas", blurb: "Qué detecta el diferencial", ids: ["fuga"] },
];

/** La pregunta que el estudiante se hace antes de elegir la fórmula: el selector se lee como una tarea, no como un índice. */
export const ASK: Record<string, string> = {
  coord: "¿Sirve esta protección?",
  banda: "¿Desde cuántos A dispara?",
  iz: "¿Cuánto aguanta el cable?",
  caida: "¿Cae demasiada tensión?",
  i2t: "¿Resiste el cortocircuito?",
  motor: "¿Cuánta corriente toma?",
  guardamotor: "¿Sirve este rango?",
  fuga: "¿Cuántos mA se fugan?",
};
export const CARD_KEY = "study-calc-card";
export const SEND_EVENT = "study-calc-send";
export const RESULT_EVENT = "study-calc-result";
export const OPEN_EVENT = "study-calc-open";
const send = (text: string) => window.dispatchEvent(new CustomEvent(SEND_EVENT, { detail: text }));
const EXPLAIN = [["steps", "Paso a paso"], ["symbols", "Símbolos"], ["why", "Para qué sirve"], ["example", "Ejemplo"]] as const;
type Explain = (typeof EXPLAIN)[number][0];

/** Cálculos como banco de trabajo: ¿qué quieres calcular? → fórmula a la vista → tus datos → resultado en vivo.
 *  La explicación (pasos, símbolos, para qué sirve, ejemplo) queda a un toque, y la calculadora acompaña al lado. */
export function CalcModule() {
  const id = useId();
  const [active, setActive] = useState(() => {
    try { const saved = sessionStorage.getItem(CARD_KEY); if (saved && CARDS.some((c) => c.id === saved)) return saved; } catch { /* sin almacenamiento */ }
    return CARDS[0].id;
  });
  const [explain, setExplain] = useState<Explain>("steps");
  const [last, setLast] = useState("");
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () => Object.fromEntries(CARDS.map((c) => [c.id, Object.fromEntries(c.fields.map((f) => [f.key, f.def]))])),
  );
  useEffect(() => {
    const result = (e: Event) => setLast(String((e as CustomEvent).detail ?? ""));
    const open = (e: Event) => { const to = String((e as CustomEvent).detail ?? ""); if (CARDS.some((c) => c.id === to)) { setActive(to); setExplain("steps"); } };
    window.addEventListener(RESULT_EVENT, result);
    window.addEventListener(OPEN_EVENT, open);
    return () => { window.removeEventListener(RESULT_EVENT, result); window.removeEventListener(OPEN_EVENT, open); };
  }, []);
  const choose = (cid: string) => { setActive(cid); setExplain("steps"); try { sessionStorage.setItem(CARD_KEY, cid); } catch { /* sin almacenamiento */ } };
  const card = CARDS.find((c) => c.id === active)!;
  const v = values[card.id];
  const outcome = card.run(v);
  const ok = typeof outcome !== "string" && /^(Cumple|Incluye)/.test(outcome.value);
  const bad = typeof outcome !== "string" && /^No /.test(outcome.value);
  const set = (key: string, value: string) => setValues((all) => ({ ...all, [card.id]: { ...all[card.id], [key]: value } }));
  const reset = () => setValues((all) => ({ ...all, [card.id]: Object.fromEntries(card.fields.map((f) => [f.key, f.def])) }));
  return (
    <div className="calc-lab">
      <nav className="calc-picker" aria-label="¿Qué quieres calcular?">
        <h3>¿Qué quieres calcular?</h3>
        {GROUPS.map((g) => (
          <div key={g.name} className="calc-pick-group">
            <h4>{g.name}</h4>
            <div role="tablist" aria-label={g.name} aria-orientation="vertical">
              {g.ids.map((cid) => {
                const c = CARDS.find((x) => x.id === cid)!;
                return (
                  <button key={c.id} role="tab" aria-selected={active === c.id} aria-controls={`${id}-panel`} onClick={() => choose(c.id)}>
                    <strong>{c.tab}</strong>
                    <small>{ASK[c.id]}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <section id={`${id}-panel`} role="tabpanel" className="calc-work" key={card.id} data-origin={card.origin} aria-label={card.title}>
        <header className="calc-work-head">
          <div>
            <h3>{card.title}</h3>
            <p className="calc-lead">{PURPOSE[card.id].what}</p>
          </div>
          <p className="calc-origin">
            <span className="calc-origin-tag">{card.origin === "profesor" ? "Fórmula del profesor" : "Cálculo didáctico"}</span>
            <a href={`${PDF}${card.slide}`} target="_blank" rel="noreferrer"><FileText size={15} aria-hidden="true" /> Lámina {card.slide} ↗</a>
          </p>
        </header>

        <div className="calc-formula-exact" role="math" aria-label="Fórmula">{card.exact}</div>

        <div className="calc-block">
          <div className="calc-block-title">
            <h4>Tus datos</h4>
            <button type="button" className="calc-link" onClick={reset}><RotateCcw size={14} aria-hidden="true" /> Volver al ejemplo</button>
          </div>
          <div className="calc-fields">
            {card.fields.map((f) => (
              <div key={f.key} className="calc-field">
                <label>
                  <span>{f.label}</span>
                  {f.options ? (
                    <select value={v[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                      {f.options.map((o) => <option key={o} value={o}>Curva {o}</option>)}
                    </select>
                  ) : (
                    <span className="calc-input-wrap">
                      <input type="text" inputMode="decimal" value={v[f.key]} onChange={(e) => set(f.key, e.target.value)} aria-describedby={f.hint ? `${id}-${f.key}` : undefined} />
                      {f.unit && <i aria-hidden="true">{f.unit}</i>}
                    </span>
                  )}
                  {f.hint && <small id={`${id}-${f.key}`}>{f.hint}</small>}
                </label>
                {!f.options && last && last !== v[f.key] && (
                  <button type="button" className="calc-use" onClick={() => set(f.key, last)} title="Poner en este dato el último resultado de la calculadora">
                    <CornerDownLeft size={14} aria-hidden="true" /> Usar {last}
                  </button>
                )}
              </div>
            ))}
          </div>

          {typeof outcome === "string" ? (
            <p className="calc-message" role="status">{outcome}</p>
          ) : (
            <div className={`calc-outcome${ok ? " is-ok" : bad ? " is-bad" : ""}`} role="status">
              <span>Resultado</span>
              <strong>{outcome.value}{outcome.unit && <small> {outcome.unit}</small>}</strong>
              {outcome.numeric !== undefined && (
                <button type="button" onClick={() => send(formatResult(Math.round(outcome.numeric! * 1e4) / 1e4))}>
                  <ArrowDownToLine size={16} aria-hidden="true" /> Pasar a la calculadora
                </button>
              )}
            </div>
          )}
          {typeof outcome !== "string" && outcome.exprs && outcome.exprs.map((e) => (
            <div key={e} className="calc-expr">
              <span>Compruébalo en la calculadora</span>
              <code>{e}</code>
              <button type="button" onClick={() => send(e)}>Escribir ahí</button>
            </div>
          ))}
        </div>

        <div className="calc-block">
          <div className="calc-explain-tabs" role="tablist" aria-label="Explicación">
            {EXPLAIN.map(([key, label]) => (
              <button key={key} role="tab" aria-selected={explain === key} onClick={() => setExplain(key)}>{label}</button>
            ))}
          </div>
          <div className="calc-explain" role="tabpanel" aria-label={EXPLAIN.find(([k]) => k === explain)![1]}>
            {explain === "steps" && (typeof outcome === "string" ? <p className="calc-muted">Completa los datos para ver el procedimiento.</p> : outcome.body)}
            {explain === "symbols" && (
              <dl className="calc-legend">
                {card.legend.map(([sym, meaning], i) => <div key={i}><dt>{sym}</dt><dd>{meaning}</dd></div>)}
              </dl>
            )}
            {explain === "why" && (
              <dl className="calc-purpose">
                <div><dt>Sirve para</dt><dd>{PURPOSE[card.id].what}</dd></div>
                <div><dt>Cuándo se usa</dt><dd>{PURPOSE[card.id].when}</dd></div>
                <div><dt>Qué te dice</dt><dd>{PURPOSE[card.id].tells}</dd></div>
              </dl>
            )}
            {explain === "example" && <p className="calc-example">{card.example}</p>}
          </div>
        </div>
        <p className="calc-note"><strong>Ojo:</strong> {card.note}</p>
      </section>

      <aside className="calc-side" aria-label="Calculadora">
        <h3>Calculadora</h3>
        <p>La misma de la evaluación. Pasa resultados a la ficha con <b>Usar</b>.</p>
        <Calculator />
      </aside>
    </div>
  );
}
