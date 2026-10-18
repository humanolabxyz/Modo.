import { useEffect, useId, useRef, useState } from "react";
import {
  cases,
  coordination,
  cableCapacity,
  motorCurrent,
  numberValue,
  fmt,
  type Draft,
} from "./model";
import { TermExplorer } from "./TermExplorer";
import { ProfessorFaultView } from "./ProfessorFaultView";
import { CalculationSteps, MotorSteps } from "./CalculationSteps";

const fieldHelp: Record<string, string> = {
  In_A: "Corriente que demanda la carga. Se introduce en amperes.",
  Ip_A: "Corriente nominal de la protección; compárala con carga y cable.",
  Iz_A: "Capacidad del cable ya corregida por las condiciones de instalación.",
  nominal: "Valor supuesto para calcular las bandas B/C/D en amperes.",
  voltage: "Dato del candidato ficticio, en voltios; el circuito del ejercicio es de 400 V CA.",
  rupture: "Capacidad de ruptura del candidato en kA; compara con Icc = 10 kA.",
  Itabla_A: "Capacidad de partida en A. En un caso real procede de la tabla aplicable.",
  fT: "Multiplicador de temperatura. Ejemplo: 0,9; no escribas 90 %.",
  fG: "Multiplicador de agrupamiento. Ejemplo: 0,8; no se suma a fT.",
  plate: "Valor de la placa ficticia, en amperes. Comprueba que el rango lo incluya.",
  adjust: "Valor térmico propuesto dentro del rango elegido, en A.",
  out: "Magnitud de la corriente de ida, en A; el resultado se convierte a mA.",
  back: "Magnitud de la corriente de vuelta, también en A.",
  Pout_kW: "Potencia mecánica de salida en kW. El cálculo la convierte a W.",
  VLL_V: "Tensión entre líneas en voltios, no otra tensión del circuito.",
  eta: "Usa una fracción mayor que 0 y hasta 1. Ejemplo: 88 % → 0,88.",
  cosphi: "Usa una fracción mayor que 0 y hasta 1. Ejemplo: 83 % → 0,83.",
};
const tasks: Record<string, string> = {
  "objetivos-fallas": "Elige una situación, observa qué cambia y marca su clasificación. Después comprueba por qué corresponde a esa falla.",
  coordinacion: "Introduce las tres corrientes, compara cada relación y elige si se cumple In ≤ Ip ≤ Iz. Justifica cuál condición falla si cambias un valor.",
  termomagnetico: "Modifica la nominal y observa las bandas. Después clasifica qué mecanismo responde a la falla propuesta.",
  fusibles: "Elige el equipo protegido y la clase. Después completa los datos del candidato ficticio y comprueba tensión, ruptura y CA/CC.",
  conductores: "Lee Itabla y los dos factores, calcula Iz y escribe tu resultado en amperes. No escribas la fórmula dentro del campo de respuesta.",
  guardamotor: "Lee la placa ficticia, elige un rango que incluya esa corriente y propone el ajuste térmico del ejercicio.",
  "tierra-sobretension": "Elige el fenómeno y marca el dispositivo que cumple esa función. En fuga, modifica ida y vuelta para comprender el desequilibrio.",
  "motor-trifasico": "Lee los cuatro datos, convierte la potencia a W y calcula la corriente. Escribe solo el valor numérico en amperes en «Tu resultado».",
};
const caseNames: Record<string, string> = {
  "COORD-01": "18 / 20 / 25 A · Ejemplo docente",
  "COORD-02": "18 / 32 / 25 A · Variante didáctica",
  "COORD-03": "22 / 20 / 25 A · Variante didáctica",
  "CABLE-01": "30 A · factores 0,9 y 0,8 · Ejemplo docente",
  "CABLE-02": "40 A · factores 0,85 y 0,75 · Supuesto",
  "MOTOR-01": "5,5 kW / 400 V · Supuesto didáctico",
  "MOTOR-02": "2,2 kW / 380 V · Supuesto didáctico",
};

type Props = {
  topic: string;
  draft: Draft;
  onDraft: (d: Draft) => void;
  onResult: (correct: boolean, item: string) => void;
  practice?: boolean;
};
const base: Record<string, Draft> = {
  "objetivos-fallas": { scenario: "normal", effect: "calor" },
  coordinacion: { In_A: "18", Ip_A: "20", Iz_A: "25" },
  termomagnetico: {
    nominal: "10",
    curve: "B",
    mechanism: "Térmico",
    part: "palanca",
    fault: "Sobrecarga",
  },
  fusibles: {
    purpose: "conductores",
    plate: "50 A",
    voltage: "700",
    rupture: "200",
    system: "CA",
  },
  conductores: { Itabla_A: "30", fT: "0.9", fG: "0.8", In_A: "18", Ip_A: "20" },
  guardamotor: { plate: "6.3", range: "6–10", adjust: "6.3" },
  "tierra-sobretension": { scenario: "transitorio", out: "10", back: "9.97" },
  "motor-trifasico": {
    Pout_kW: "5.5",
    VLL_V: "400",
    eta: "0.88",
    cosphi: "0.83",
  },
};
export function Activity({
  topic,
  draft,
  onDraft,
  onResult,
  practice = false,
}: Props) {
  const fieldId = useId();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<{
      ok: boolean;
      text: string;
    } | null>(null),
    [hint, setHint] = useState(0);
  useEffect(() => {
    if (feedback) {
      feedbackRef.current?.focus({ preventScroll: true });
      feedbackRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }, [feedback]);
  if (topic === "termomagnetico" && !practice)
    return <TermExplorer draft={draft} onDraft={onDraft} onResult={onResult} />;
  const d = { ...base[topic], ...draft };
  const set = (key: string, value: string) => {
    onDraft({ ...d, [key]: value });
    setFeedback(null);
  };
  const n = (key: string) => numberValue(d[key]);
  const field = (key: string, label: string) => (
    <div className={`study-field ${key === "answer" ? "study-answer-field" : ""}`} key={key}>
      <label htmlFor={`${fieldId}-${key}`}>{label}</label>
      <input
        id={`${fieldId}-${key}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-describedby={`${fieldId}-${key}-help`}
        placeholder={key === "answer" ? "Escribe tu resultado…" : "Introduce un valor"}
        value={d[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
      <small id={`${fieldId}-${key}-help`} className="study-input-help">{key === "answer" ? "Solo el número en A, con coma o punto decimal. Se admite un redondeo de hasta 0,05 A." : fieldHelp[key]}</small>
    </div>
  );
  const select = (key: string, label: string, options: string[]) => (
    <label className="study-field">
      {label}
      <select value={d[key] ?? ""} onChange={(e) => set(key, e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  const answer = (label: string, options: string[]) => (
    <fieldset className="study-options">
      <legend>{label}</legend>
      <p className="study-answer-instruction">Marca una sola opción. Puedes cambiarla antes de comprobar.</p>
      {options.map((o, i) => (
        <label key={o}>
          <input
            type="radio"
            name={`activity-${topic}`}
            value={String(i)}
            checked={d.choice === String(i)}
            onChange={(e) => set("choice", e.target.value)}
          />
          {o}
        </label>
      ))}
    </fieldset>
  );
  const numeric = topic === "conductores" || topic === "motor-trifasico";
  let invalid = "",
    value: number | null = null,
    expected = false,
    correction = "",
    body;
  if (topic === "objetivos-fallas") {
    const descriptions: Record<string, string> = {
      normal: "El motor trabaja dentro de su corriente normal.",
      sobrecarga:
        "El motor exige más corriente de la habitual durante un tiempo y el conductor se calienta.",
      corto: "La aislación falla y aparece un camino de muy baja impedancia.",
    };
    const effects: Record<string, string> = {
      arco: "El arco puede quemar materiales en su trayectoria.",
      calor:
        "La energía de la falla eleva la temperatura. El caso 15 kA / cobre 6 AWG / +205 °C en menos de un ciclo corresponde solo al ejemplo de la lámina 4.",
      fuerza: "Los esfuerzos magnéticos pueden deformar conductores y barras.",
    };
    expected =
      d.choice ===
      String(["normal", "sobrecarga", "corto"].indexOf(d.scenario));
    correction = `${d.scenario === "normal" ? "Funcionamiento normal" : d.scenario === "sobrecarga" ? "Sobrecarga: corriente sobre la normal y calentamiento" : "Cortocircuito: camino de muy baja impedancia y corriente de falla potencialmente alta"}. La magnitud real depende de la carga y de la red.`;
    body = (
      <>
        {select("scenario", "Situación del circuito", [
          "normal",
          "sobrecarga",
          "corto",
        ])}
        <p>{descriptions[d.scenario]}</p>
        <ProfessorFaultView fault={d.scenario === "corto" ? "corto" : d.scenario === "sobrecarga" ? "sobrecarga" : "normal"} />
        <div className="study-segments" aria-label="Consecuencias">
          {["arco", "calor", "fuerza"].map((e) => (
            <button
              key={e}
              aria-pressed={d.effect === e}
              onClick={() => set("effect", e)}
            >
              {e === "arco"
                ? "Arco eléctrico"
                : e === "calor"
                  ? "Calor"
                  : "Esfuerzo magnético"}
            </button>
          ))}
        </div>
        <p>{effects[d.effect]}</p>
        {answer("Clasifica la situación elegida", [
          "Normal",
          "Sobrecarga",
          "Cortocircuito",
        ])}
      </>
    );
  } else if (topic === "coordinacion") {
    const keys = ["In_A", "Ip_A", "Iz_A"],
      nums = keys.map(n);
    invalid = nums.some((v) => v === null || v <= 0)
      ? "Completa las tres corrientes con valores mayores que cero."
      : "";
    const [load, protection, cable] = nums as number[];
    const ok = !invalid && coordination(load, protection, cable);
    expected = d.choice === (ok ? "0" : "1");
    correction =
      invalid ||
      `${fmt(load)} ≤ ${fmt(protection)} ≤ ${fmt(cable)} A: ${ok ? "cumple la coordinación básica" : load > protection ? "In supera Ip: la protección es inferior a la carga" : "Ip supera Iz: la protección excede la capacidad corregida del cable"}.`;
    body = (
      <>
        <div className="study-fields">
          {field("In_A", "Carga In (A)")}
          {field("Ip_A", "Protección Ip (A)")}
          {field("Iz_A", "Cable Iz (A)")}
        </div>
        <div className="current-bars">
          {keys.map((k, i) => (
            <div key={k}>
              <span>
                {["Carga", "Protección", "Cable"][i]}{" "}
                {n(k) === null ? "—" : `${fmt(n(k)!)} A`}
              </span>
              <i
                style={{
                  width: `${invalid ? 0 : (n(k)! / Math.max(...(nums as number[]))) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>
        {!practice && !invalid && (
          <p className={ok ? "study-success" : "study-error"}>{correction}</p>
        )}
        {answer("¿Cumple la regla básica In ≤ Ip ≤ Iz?", [
          "Sí, cumple la desigualdad",
          "No, incumple una condición",
        ])}
        <p className="study-note">
          Coordinación básica de corriente, no aprobación integral. Pendientes:
          Icc, poder de corte, disparo y energía pasante.
        </p>
      </>
    );
  } else if (topic === "termomagnetico") {
    const nominal = n("nominal");
    invalid =
      nominal === null || nominal <= 0
        ? "Ingresa una corriente nominal mayor que cero."
        : "";
    const ranges: Record<string, [number, number]> = {
      B: [3, 5],
      C: [5, 10],
      D: [10, 20],
    };
    expected = d.choice === (d.fault === "Sobrecarga" ? "0" : "1");
    correction =
      d.fault === "Sobrecarga"
        ? "Térmico: el calentamiento del elemento bimetálico responde a sobrecargas."
        : "Magnético: responde al cortocircuito suficientemente elevado. Verifica la curva del fabricante.";
    body = (
      <>
        <div className="study-segments">
          {["palanca", "bornes", "etiqueta"].map((p) => (
            <button
              key={p}
              aria-pressed={d.part === p}
              onClick={() => set("part", p)}
            >
              {p === "palanca"
                ? "Palanca"
                : p === "bornes"
                  ? "Bornes"
                  : "Datos de selección"}
            </button>
          ))}
        </div>
        <p>
          {d.part === "palanca"
            ? "La palanca permite maniobrar el aparato. Su posición no sustituye una verificación de ausencia de tensión."
            : d.part === "bornes"
              ? "Los bornes son puntos de conexión; su capacidad y condiciones se consultan en la ficha del equipo."
              : "Busca nominal, tensión, polos, curva y poder de corte en placa y ficha. No se transcriben etiquetas ilegibles de la foto."}
        </p>
        <div className="study-segments">
          {["Térmico", "Magnético"].map((m) => (
            <button
              key={m}
              aria-pressed={d.mechanism === m}
              onClick={() => set("mechanism", m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div
          className={`mechanism ${d.mechanism === "Térmico" ? "thermal" : "magnetic"}`}
        >
          <span aria-hidden="true">
            {d.mechanism === "Térmico" ? "⌒" : "∩"}
          </span>
          <p>
            {d.mechanism === "Térmico"
              ? "El bimetal responde al calentamiento por sobrecarga."
              : "El mecanismo magnético responde a corriente de cortocircuito suficientemente alta."}
          </p>
        </div>
        {field("nominal", "Nominal didáctica Ip (A)")}
        <div
          className="magnetic-bands"
          aria-label="Rangos magnéticos proporcionales de 0 a 20 veces la nominal"
        >
          {Object.entries(ranges).map(([c, [lo, hi]]) => (
            <button
              key={c}
              aria-pressed={d.curve === c}
              onClick={() => set("curve", c)}
            >
              <b>{c}</b>
              <span>
                <i
                  style={{
                    left: `${(lo / 20) * 100}%`,
                    width: `${((hi - lo) / 20) * 100}%`,
                  }}
                />
              </span>
              <em>
                {lo}–{hi} × Ip
              </em>
            </button>
          ))}
          <div className="band-axis">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20 × Ip</span>
          </div>
        </div>
        {!invalid && (
          <output className="study-output">
            Curva {d.curve}: {fmt(nominal! * ranges[d.curve][0])}–
            {fmt(nominal! * ranges[d.curve][1])} A
          </output>
        )}
        <small>
          Rangos del umbral magnético, sin tiempos exactos. B: resistivas; C:
          uso general; D: arranques altos, según lámina 8. Consultar fabricante.
        </small>
        {select("fault", "Falla para comprobar", [
          "Sobrecarga",
          "Cortocircuito",
        ])}
        {answer("¿Qué mecanismo responde a esta falla?", [
          "Térmico",
          "Magnético",
        ])}
      </>
    );
  } else if (topic === "fusibles") {
    const plate: Record<string, string> = {
      "50 A": "Corriente nominal del ejemplo, no corriente de ruptura.",
      "700 V CA/CC":
        "Tensión del ejemplo. Confirmar capacidades específicas para corriente alterna y continua.",
      "200 kA":
        "Capacidad de ruptura del ejemplo. Debe cubrir la Icc prevista.",
    };
    const volt = n("voltage"),
      rupture = n("rupture");
    invalid =
      volt === null || rupture === null || volt <= 0 || rupture <= 0
        ? "Completa tensión y ruptura con valores mayores que cero."
        : "";
    const classOk = d.choice === (d.purpose === "conductores" ? "0" : "1");
    expected =
      classOk &&
      !invalid &&
      volt! >= 400 &&
      rupture! >= 10 &&
      d.system === "CA";
    correction = `Para ${d.purpose}: ${d.purpose === "conductores" ? "gG" : "aR/gR según cobertura concreta"}. En este escenario de 400 V CA e Icc 10 kA, se requieren tensión ≥400 V, ruptura ≥10 kA y compatibilidad CA. No basta la forma ni el amperaje.`;
    body = (
      <>
        <small>
          Placa textual didáctica de la lámina 10; separada de la fotografía.
        </small>
        <div className="fuse-plate">
          {Object.keys(plate).map((v) => (
            <button
              key={v}
              aria-pressed={d.plate === v}
              onClick={() => set("plate", v)}
            >
              {v}
            </button>
          ))}
        </div>
        <p>{plate[d.plate]}</p>
        {select("purpose", "Equipo que se quiere proteger", [
          "conductores",
          "semiconductores",
        ])}
        {answer("¿Qué clase menciona el docente para este objetivo?", [
          "gG",
          "aR / gR",
        ])}
        <p>
          Comparación didáctica: circuito de 400 V CA, Icc prevista de 10 kA.
          Modifica los datos de un candidato ficticio.
        </p>
        <div className="study-fields">
          {field("voltage", "Tensión admisible (V)")}
          {field("rupture", "Ruptura (kA)")}
          {select("system", "Compatibilidad declarada", ["CA", "CC"])}
        </div>
        <p className="study-note">
          Rápido o retardado: elegir según carga y características del
          fabricante. Este ejercicio no comprueba energía pasante ni
          coordinación completa.
        </p>
      </>
    );
  } else if (topic === "conductores") {
    const values = ["Itabla_A", "fT", "fG"].map(n);
    invalid = values.some((v) => v === null || v <= 0)
      ? "Completa Itabla y factores con valores mayores que cero."
      : "";
    if (!invalid)
      value = cableCapacity(...(values as [number, number, number]));
    if (value !== null && !Number.isFinite(value)) {
      invalid = "Los valores exceden el rango calculable. Revisa los datos.";
      value = null;
    }
    expected =
      value !== null &&
      n("answer") !== null &&
      Math.abs(n("answer")! - value) <= 0.05;
    correction =
      value === null
        ? invalid
        : `Iz = ${fmt(values[0]!)} × ${fmt(values[1]!)} × ${fmt(values[2]!)} = ${fmt(value)} A. Primero multiplica los factores; luego aplica el resultado a Itabla.`;
    const load = n("In_A"),
      ip = n("Ip_A");
    body = (
      <>
        <div className="study-fields">
          {field("Itabla_A", "Capacidad tabulada Itabla (A)")}
          {field("fT", "Factor temperatura fT")}
          {field("fG", "Factor agrupamiento fG")}
        </div>
        <div className="capacity-visual">
          <span
            style={{
              width: `${invalid ? 0 : Math.min(100, values[1]! * values[2]! * 100)}%`,
            }}
          />
        </div>
        <p>Iz = Itabla × fT × fG</p>
        {!practice && value !== null && <output className="study-output">Iz = {fmt(value)} A</output>}
        {(!practice || feedback) && value !== null && <CalculationSteps title="Así se calcula con tus datos" steps={[
          ["Combina los factores", `${values[1]!.toLocaleString("es-CL", { maximumFractionDigits: 8 })} × ${values[2]!.toLocaleString("es-CL", { maximumFractionDigits: 8 })} ≈ ${(values[1]! * values[2]!).toLocaleString("es-CL", { maximumFractionDigits: 8 })}`],
          ["Corrige la capacidad tabulada", `${values[0]!.toLocaleString("es-CL", { maximumFractionDigits: 8 })} A × ${values[1]!.toLocaleString("es-CL", { maximumFractionDigits: 8 })} × ${values[2]!.toLocaleString("es-CL", { maximumFractionDigits: 8 })} ≈ ${fmt(value)} A`],
          ["Usa el valor corregido", `Compara la protección con Iz = ${fmt(value)} A, no solo con Itabla = ${fmt(values[0]!)} A.`],
        ]} meaning="Este resultado comprueba capacidad de corriente para los datos introducidos. Caída de tensión y cortocircuito requieren verificaciones separadas." />}
        <div className="study-fields">
          {field("In_A", "Carga In (A)")}
          {field("Ip_A", "Protección Ip (A)")}
        </div>
        {!practice && (
          <p>
            {value !== null &&
            load !== null &&
            ip !== null &&
            load > 0 &&
            ip > 0
              ? coordination(load, ip, value)
                ? "Corriente: cumple coordinación básica."
                : "Corriente: no cumple coordinación básica."
              : "Corriente: datos incompletos."}
          </p>
        )}
        <div className="study-checks">
          <p>
            Caída de tensión: datos incompletos. Faltan longitud, carga,
            instalación y límite aplicable.
          </p>
          <p>
            Cortocircuito: datos incompletos. Faltan Icc, tiempo, k de
            conductor/aislación y sección S para I²t ≤ k²S².
          </p>
        </div>
        <div className="study-response-block"><h4>Tu respuesta · capacidad corregida</h4>{field("answer", "Tu resultado Iz (A)")}</div>
      </>
    );
  } else if (topic === "guardamotor") {
    const plate = n("plate"),
      adjust = n("adjust"),
      [lo, hi] = d.range.split("–").map(Number);
    invalid =
      plate === null || adjust === null || plate <= 0 || adjust <= 0
        ? "Completa placa y ajuste con valores mayores que cero."
        : "";
    expected =
      !invalid &&
      plate! >= lo &&
      plate! <= hi &&
      adjust! >= lo &&
      adjust! <= hi &&
      Math.abs(plate! - adjust!) < 0.05;
    correction =
      invalid ||
      `${plate! < lo || plate! > hi ? "La corriente de placa queda fuera del rango elegido." : Math.abs(plate! - adjust!) >= 0.05 ? "El ajuste no coincide con la nominal de placa del ejemplo." : "Rango y ajuste térmico compatibles con el ejemplo."} Arranque, magnético y poder de corte siguen por verificar según fabricante.`;
    body = (
      <>
        <p className="study-note">
          Placa y guardamotor ficticios · ejemplo didáctico supuesto.
        </p>
        <div className="study-fields">
          {field("plate", "Corriente nominal de placa (A)")}
          {select("range", "Rango térmico hipotético (A)", ["4–6", "6–10"])}
          {field("adjust", "Ajuste térmico propuesto (A)")}
        </div>
        <div className="guard-dial">
          <svg
            viewBox="0 0 220 110"
            role="img"
            aria-label={`Dial térmico didáctico: ${d.adjust} A, rango ${d.range} A`}
          >
            <path d="M25 95 A85 85 0 0 1 195 95" />
            <line
              x1="110"
              y1="95"
              x2={
                110 +
                70 *
                  Math.cos(
                    Math.PI +
                      Math.max(
                        0,
                        Math.min(1, ((adjust ?? lo) - lo) / (hi - lo)),
                      ) *
                        Math.PI,
                  )
              }
              y2={
                95 +
                70 *
                  Math.sin(
                    Math.PI +
                      Math.max(
                        0,
                        Math.min(1, ((adjust ?? lo) - lo) / (hi - lo)),
                      ) *
                        Math.PI,
                  )
              }
            />
            <text x="25" y="108">
              {lo} A
            </text>
            <text x="170" y="108">
              {hi} A
            </text>
          </svg>
          <output>{adjust === null ? "—" : fmt(adjust)} A</output>
        </div>
        <p>
          Leer placa → rango → ajuste → arranque. El contactor permite el mando
          remoto; este dial solo representa el ajuste térmico.
        </p>
      </>
    );
  } else if (topic === "tierra-sobretension") {
    const out = n("out"),
      back = n("back");
    invalid =
      out === null || back === null || out < 0 || back < 0
        ? "Completa ambas corrientes con valores no negativos."
        : "";
    const leak = invalid ? null : Math.abs(out! - back!) * 1000;
    expected = d.choice === (d.scenario === "transitorio" ? "0" : "1");
    correction =
      d.scenario === "transitorio"
        ? "SPD: limita la sobretensión transitoria y deriva su corriente. No es una función diferencial."
        : "RCD: detecta desequilibrio por fuga. No sustituye la protección frente a sobrecorrientes.";
    body = (
      <>
        {select("scenario", "Fenómeno observado", ["transitorio", "fuga"])}
        <div className={`protection-scene ${d.scenario}`}>
          <div className="phenomenon-symbol" aria-hidden="true">
            {d.scenario === "transitorio" ? "↯" : "↘"}
          </div>
          <p>
            {d.scenario === "transitorio"
              ? "Una maniobra o descarga atmosférica produce un pico de tensión."
              : "Parte de la corriente no retorna por el conductor de vuelta."}
          </p>
          <svg
            viewBox="0 0 360 70"
            role="img"
            aria-label={
              d.scenario === "transitorio"
                ? "Pulso conceptual de sobretensión"
                : "Circuito conceptual con corriente de fuga"
            }
          >
            {d.scenario === "transitorio" ? (
              <path d="M10 55H110L135 10 155 55H350" />
            ) : (
              <>
                <path d="M10 15H320V55H10M240 55V65" />
                <text x="125" y="36">
                  ida / vuelta
                </text>
              </>
            )}
          </svg>
        </div>
        {d.scenario === "fuga" && (
          <>
            <div className="study-fields">
              {field("out", "Corriente de ida (A)")}
              {field("back", "Corriente de vuelta (A)")}
            </div>
            {leak !== null && (
              <output className="study-output">
                Desequilibrio: {fmt(leak)} mA
              </output>
            )}
            {leak !== null && <CalculationSteps title="De amperes a miliamperes" steps={[
              ["Resta las magnitudes en A", `|${fmt(out!)} − ${fmt(back!)}| ≈ ${Math.abs(out! - back!).toLocaleString("es-CL", { maximumFractionDigits: 6 })} A`],
              ["Convierte la diferencia", `|${fmt(out!)} − ${fmt(back!)}| × 1000 = ${fmt(leak)} mA`],
            ]} meaning="Desequilibrio del circuito conceptual. No es la corriente nominal de la carga ni un tiempo de actuación." />}
            <small>
              Cálculo conceptual; no simula tiempo ni garantiza actuación de un
              dispositivo real.
            </small>
          </>
        )}
        {answer("¿Qué dispositivo corresponde al fenómeno?", [
          "SPD",
          "Diferencial RCD",
        ])}
        <p className="study-note">
          ≤30 mA: sensibilidad habitual para protección adicional según lámina
          14. Comprobar normativa, selectividad y compatibilidad con variadores.
        </p>
      </>
    );
  } else {
    const values = ["Pout_kW", "VLL_V", "eta", "cosphi"].map(n);
    invalid =
      values.some((v) => v === null || v <= 0) ||
      values[2]! > 1 ||
      values[3]! > 1
        ? "Completa P y V mayores que cero; η y cosφ deben estar entre 0 (excluido) y 1."
        : "";
    if (!invalid)
      value = motorCurrent(...(values as [number, number, number, number]));
    if (value !== null && !Number.isFinite(value)) {
      invalid = "Los valores exceden el rango calculable. Revisa los datos.";
      value = null;
    }
    expected =
      value !== null &&
      n("answer") !== null &&
      Math.abs(n("answer")! - value) <= 0.05;
    correction =
      value === null
        ? invalid
        : `Convierte ${fmt(values[0]!)} kW a ${fmt(values[0]! * 1000)} W. Denominador = √3 × ${fmt(values[1]!)} × ${fmt(values[2]!)} × ${fmt(values[3]!)} = ${fmt(Math.sqrt(3) * values[1]! * values[2]! * values[3]!)}. I ≈ ${fmt(value)} A.`;
    body = (
      <>
        <p className="study-note">
          Ejemplo didáctico supuesto. La lámina 15 no contiene valores de placa
          completos.
        </p>
        <div className="study-fields">
          {field("Pout_kW", "Potencia mecánica de salida (kW)")}
          {field("VLL_V", "Tensión entre líneas VLL (V)")}
          {field("eta", "Rendimiento η (0–1)")}
          {field("cosphi", "Factor de potencia cosφ (0–1)")}
        </div>
        <p className="study-formula">
          In (A) = [Psalida (kW) × 1000] / [√3 VLL (V) η cosφ]
        </p>
        {!practice && value !== null && (
          <>
            <output className="study-output">Corriente ≈ {fmt(value)} A</output>
          </>
        )}
        {(!practice || feedback) && value !== null && <MotorSteps power={values[0]!} voltage={values[1]!} eta={values[2]!} pf={values[3]!} current={value} />}
        <div className="study-response-block"><h4>Tu respuesta · corriente calculada</h4>{field("answer", "Tu resultado I (A)")}</div>
        <p className="study-note">
          Comparar con placa. Faltan arranque, Icc, longitud, instalación,
          temperatura y fichas para terminar una selección.
        </p>
      </>
    );
  }
  const check = () => {
    if (invalid) {
      setFeedback({
        ok: false,
        text: `Datos incompletos o inválidos: ${invalid}`,
      });
      return;
    }
    if (
      (numeric && n("answer") === null) ||
      (!numeric && !["guardamotor"].includes(topic) && d.choice === undefined)
    ) {
      setFeedback({
        ok: false,
        text: "Datos incompletos: introduce tu respuesta antes de comprobar.",
      });
      return;
    }
    const response = numeric ? n("answer") : null;
    let diagnosis = "";
    if (!expected && topic === "motor-trifasico" && value !== null && response !== null) {
      diagnosis = Math.abs(response * 1000 - value) <= 0.05
        ? " Tu resultado parece 1000 veces menor: revisa la conversión de kW a W."
        : response > 0 && Math.abs(response - n("Pout_kW")! * 1000 / (Math.sqrt(3) * n("VLL_V")!)) <= 0.05
          ? " Tu resultado coincide con omitir η y cosφ: incluye ambos factores en el denominador."
          : " Revisa unidades, los cuatro factores del denominador y el redondeo final.";
    }
    if (!expected && topic === "conductores" && response !== null) {
      diagnosis = Math.abs(response - n("Itabla_A")!) <= 0.05
        ? " Has escrito la capacidad tabulada; todavía debes multiplicar por fT y fG."
        : " Multiplica los dos factores, sin sumarlos, y aplica el producto a Itabla.";
    }
    setFeedback({
      ok: expected,
      text: `${expected ? "Correcto." : "Revisa tu respuesta."}${diagnosis} ${correction}`,
    });
    onResult(expected, d.caseId || topicCases[0]?.id || `actividad-${topic}`);
  };
  const topicCases = cases.filter((c) => c.topic === topic);
  const hints = numeric
    ? [
        "Identifica primero qué dato representa cada variable y sus unidades.",
        "Cable: multiplica Itabla, fT y fG. Motor: convierte kW a W y divide por √3·VLL·η·cosφ.",
        "Cable: calcula fT×fG y multiplícalo por Itabla. Motor: calcula √3×VLL, luego multiplica por η y cosφ antes de dividir la potencia.",
      ]
    : [
        "Identifica el fenómeno o la magnitud que debes comprobar.",
        "Revisa la explicación técnica del tema: la función del dispositivo depende de la falla, no de su apariencia.",
        "Justifica tu elección con los criterios de selección y distingue qué comprobaciones siguen pendientes.",
      ];
  return (
    <section className="study-activity" aria-label="Actividad interactiva">
      <h3>{practice ? "Resuelve y comprueba" : "Explora y comprueba"}</h3>
      <p className="study-task-instruction">{tasks[topic]}</p>
      <div className="study-exercise-route" aria-label="Pasos del ejercicio"><span>1 · Lee los datos</span><span>2 · {numeric ? "Calcula" : "Elige y explica"}</span><span>3 · Comprueba</span></div>
      {numeric && <p className="study-calculation-mode">{practice ? "Modo práctica: resuelve antes de comprobar. El procedimiento se muestra con la corrección." : "Modo aprendizaje: el resultado y el procedimiento cambian con tus datos. Escribe el resultado para ensayar; después practica sin verlo."}</p>}
      {topicCases.length > 0 && (
        <label className="study-field">
          Caso de práctica
          <select
            value={d.caseId || topicCases[0].id}
            onChange={(e) => {
              const c = topicCases.find((c) => c.id === e.target.value)!;
              onDraft({
                ...Object.fromEntries(Object.entries(draft).filter(([key]) => ["reflection", "readingTab", "practiceTab"].includes(key))),
                ...base[topic],
                ...Object.fromEntries(
                  Object.entries(c.given).map(([k, v]) => [k, String(v)]),
                ),
                caseId: c.id,
                answer: "",
              });
              setFeedback(null);
              setHint(0);
            }}
          >
            {topicCases.map((c) => (
              <option key={c.id} value={c.id}>
                {caseNames[c.id] || c.id}
              </option>
            ))}
          </select>
        </label>
      )}
      {body}
      {invalid && (
        <p className="study-error" role="status">
          {invalid}
        </p>
      )}
      <div className="study-actions">
        <button className="study-primary" onClick={check}>
          Comprobar respuesta
        </button>
        {practice && hint < 3 && (
          <button onClick={() => setHint((h) => h + 1)}>
            Pista {hint + 1} de 3
          </button>
        )}
      </div>
      {practice && hint > 0 && (
        <ol className="study-hints">
          {hints.slice(0, hint).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
      {feedback && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={
            feedback.ok
              ? "study-feedback study-success"
              : "study-feedback study-error"
          }
          role="status"
        >
          {feedback.text}
        </div>
      )}
    </section>
  );
}
