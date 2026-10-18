import { useId } from "react";
import { cableCapacity, coordination, fmt, motorCurrent, numberValue, type Draft } from "./model";
import { ProfessorFaultView } from "./ProfessorFaultView";

export function QuickExperiment({ topic, draft, onDraft }: { topic: string; draft: Draft; onDraft: (draft: Draft) => void }) {
  const id = useId();
  const set = (key: string, value: string) => onDraft({ ...draft, [key]: value });
  const n = (key: string, fallback: number) => numberValue(draft[key]) ?? fallback;
  const toggle = (key: string, current: string, options: [string, string][]) => <div className="quick-choices">{options.map(([value, label]) => <button key={value} aria-pressed={current === value} onClick={() => set(key, value)}>{label}</button>)}</div>;
  const slider = (key: string, label: string, value: number, min: number, max: number, step: number, unit = "") => <div className="quick-slider">
    <label htmlFor={`${id}-${key}`}>{label}<strong aria-hidden="true">{fmt(value)}{unit && ` ${unit}`}</strong></label>
    <input id={`${id}-${key}`} type="range" min={min} max={max} step={step} value={value} onChange={e => set(key, e.target.value)} />
    <div aria-hidden="true"><span>{fmt(min)} {unit}</span><span>{fmt(max)} {unit}</span></div>
  </div>;
  const result = (label: string, value: string, explanation: string, ok?: boolean) => <div className={`quick-result ${ok === false ? "quick-result-warning" : ""}`} aria-live="polite"><span>{label}</span><output>{value}</output><p>{explanation}</p></div>;
  if (topic === "objetivos-fallas") {
    const fault = draft.expFault || "sobrecarga";
    return <div className="quick-experiment">
      {toggle("expFault", fault, [["sobrecarga", "Sobrecarga"], ["corto", "Cortocircuito"]])}
      <ProfessorFaultView fault={fault === "corto" ? "corto" : "sobrecarga"} />
      {result("La diferencia está en la causa", fault === "corto" ? "Baja impedancia" : "Mayor demanda", fault === "corto" ? "La pérdida de aislación puede abrir un camino de muy baja impedancia. La falla puede producir arco, calor y esfuerzos magnéticos." : "La carga exige más corriente de la normal durante un tiempo y el conductor se calienta. No es lo mismo que un cortocircuito.")}
    </div>;
  }
  if (topic === "coordinacion") {
    const ip = n("expIp", 20), ok = coordination(18, ip, 25);
    return <div className="quick-experiment">
      <div className="quick-bars">{[["Carga", 18], ["Protección", ip], ["Cable corregido", 25]].map(([label, value]) => <div key={label}><span>{label}<strong>{fmt(Number(value))} A</strong></span><div><i style={{ width: `${Number(value) / 40 * 100}%` }} /></div></div>)}</div>
      {slider("expIp", "Nominal de la protección", ip, 10, 40, 1, "A")}
      {result("Compara las dos condiciones", `18 ≤ ${fmt(ip)} ≤ 25 A`, ok ? "Cumple la regla básica de corriente. Poder de corte, disparo y energía pasante siguen por verificar." : ip < 18 ? "Falla la primera relación: la nominal es inferior a la corriente de carga." : "Falla la segunda relación: la nominal supera la capacidad corregida del cable.", ok)}
    </div>;
  }
  if (topic === "termomagnetico") {
    const curve = ["B", "C", "D"].includes(draft.expCurve) ? draft.expCurve : "B";
    const nominal = n("expNominal", 10);
    const [lo, hi] = ({ B: [3, 5], C: [5, 10], D: [10, 20] } as Record<string, number[]>)[curve];
    return <div className="quick-experiment">
      {toggle("expCurve", curve, [["B", "B · 3–5 ×"], ["C", "C · 5–10 ×"], ["D", "D · 10–20 ×"]])}
      <div className="quick-band" role="img" aria-label={`Banda ${curve}: ${lo} a ${hi} veces la nominal`}><div><i style={{ left: `${lo / 20 * 100}%`, width: `${(hi - lo) / 20 * 100}%` }} /></div><span>0</span><span>5</span><span>10</span><span>15</span><span>20 × nominal</span></div>
      {slider("expNominal", "Nominal del ejemplo", nominal, 6, 32, 1, "A")}
      {result(`Banda magnética ${curve}`, `${fmt(nominal * lo)}–${fmt(nominal * hi)} A`, "La banda cambia en amperes al cambiar la nominal. No muestra tiempos de disparo ni aprueba un arranque real.")}
      <details className="quick-method"><summary>Ver la multiplicación</summary><p>{lo} × {fmt(nominal)} = {fmt(nominal * lo)} A · {hi} × {fmt(nominal)} = {fmt(nominal * hi)} A</p></details>
    </div>;
  }
  if (topic === "fusibles") {
    const active = draft.expPlate || "50 A";
    const meanings: Record<string, [string, string]> = {
      "50 A": ["Corriente nominal", "Es el dato nominal del ejemplo. No es la capacidad para interrumpir el cortocircuito. La elección exige conocer la carga y la clase de uso."],
      "700 V": ["Tensión del ejemplo", "Compara con la tensión del circuito y confirma las capacidades específicas declaradas para CA o CC en la ficha."],
      "200 kA": ["Capacidad de ruptura", "Compara con la corriente de cortocircuito prevista. No significa que el fusible deba conducir 200 kA continuamente."],
    };
    const meaning = meanings[active] || meanings["50 A"];
    return <div className="quick-experiment"><div className="quick-fuse-label"><span>PLACA TEXTUAL · LÁMINA 10</span>{toggle("expPlate", active, [["50 A", "50 A"], ["700 V", "700 V CA/CC"], ["200 kA", "200 kA"]])}<small>Ejemplo separado de la fotografía.</small></div>{result("Este dato representa", meaning[0], meaning[1])}<p className="quick-footnote">La guía menciona gG para conductores y aR/gR para semiconductores. Confirma cobertura y energía pasante en ficha.</p></div>;
  }
  if (topic === "conductores") {
    const ft = n("expFT", .9), value = cableCapacity(30, ft, .8), ok = coordination(18, 20, value);
    return <div className="quick-experiment"><div className="quick-fixed"><span>Capacidad tabulada<strong>30 A</strong></span><span>Agrupamiento fG<strong>0,8</strong></span></div>
      {slider("expFT", "Factor de temperatura fT", ft, .5, 1, .05)}
      <div className="quick-capacity"><i style={{ width: `${ft * .8 * 100}%` }} /></div>
      {result("Capacidad corregida Iz", `${fmt(value)} A`, ok ? "Con carga de 18 A y protección de 20 A cumple coordinación básica. Caída de tensión y cortocircuito quedan pendientes." : "Para carga de 18 A y protección de 20 A ya no cumple coordinación básica. Observa qué límite se ha reducido.", ok)}
      <details className="quick-method"><summary>Ver el cálculo</summary><p>Iz = 30 × {fmt(ft)} × 0,8 = {fmt(value)} A. Los factores se multiplican.</p></details>
    </div>;
  }
  if (topic === "guardamotor") {
    const range = draft.expRange || "6–10", ok = range === "6–10";
    return <div className="quick-experiment"><div className="quick-motor-plate"><span>PLACA FICTICIA DEL MOTOR</span><strong>6,3 <small>A</small></strong></div>
      {toggle("expRange", range, [["4–6", "Rango 4–6 A"], ["6–10", "Rango 6–10 A"]])}
      {result("¿Incluye la corriente de placa?", ok ? "6 ≤ 6,3 ≤ 10" : "6,3 A supera 6 A", ok ? "El rango incluye la placa. En este ejercicio se ajusta el térmico a 6,3 A; no al máximo de 10 A." : "El rango no alcanza la corriente de placa. No puedes obtener el ajuste requerido dentro de ese intervalo.", ok)}
      <p className="quick-footnote">Rangos hipotéticos. Arranque, magnético y poder de corte requieren comprobación según fabricante.</p>
    </div>;
  }
  if (topic === "tierra-sobretension") {
    const scenario = draft.expScenario || "fuga", back = n("expBack", 9.97), leak = Math.abs(10 - back) * 1000;
    return <div className="quick-experiment">{toggle("expScenario", scenario, [["transitorio", "Pico de tensión"], ["fuga", "Corriente de fuga"]])}
      {scenario === "fuga" ? <><div className="quick-current-pair"><span>Ida →<strong>10 A</strong></span><span>← Vuelta<strong>{fmt(back)} A</strong></span></div>{slider("expBack", "Corriente que vuelve", back, 9.9, 10, .01, "A")}{result("Desequilibrio · función diferencial", `${fmt(leak)} mA`, "Diferencia entre ida y vuelta, convertida a mA. Es un modelo conceptual; no calcula tiempo ni garantiza actuación real.")}<details className="quick-method"><summary>Ver la conversión</summary><p>|10 − {fmt(back)}| A × 1000 = {fmt(leak)} mA</p></details></> : <><svg className="quick-pulse" viewBox="0 0 480 150" role="img" aria-label="Pulso conceptual de sobretensión"><path d="M10 110H145L190 20 220 110H470" /></svg>{result("Sobretensión transitoria · función SPD", "Limita la tensión", "Las maniobras o descargas atmosféricas pueden producir transitorios. El SPD limita la sobretensión y deriva su corriente; no sustituye al diferencial.")}</>}
    </div>;
  }
  const eta = n("expEta", .88), value = motorCurrent(5.5, 400, eta, .83);
  return <div className="quick-experiment"><div className="quick-fixed"><span>Salida mecánica<strong>5,5 kW</strong></span><span>Tensión entre líneas<strong>400 V</strong></span><span>Factor de potencia<strong>0,83</strong></span></div>
    {slider("expEta", "Rendimiento η", eta, .7, 1, .01)}
    {result("Corriente estimada", `${fmt(value)} A`, "Al bajar el rendimiento, sube la corriente calculada para la misma potencia de salida. Contrasta el resultado con la placa.")}
    <details className="quick-method"><summary>Ver cómo se obtiene</summary><p>5,5 × 1000 = 5500 W</p><p>√3 × 400 × {fmt(eta)} × 0,83 ≈ {fmt(Math.sqrt(3) * 400 * eta * .83)}</p><p>I = 5500 / (√3 × 400 × {fmt(eta)} × 0,83) ≈ {fmt(value)} A</p></details>
    <p className="quick-footnote">Motor supuesto. No determina curva, sección ni poder de corte sin los demás datos.</p>
  </div>;
}
