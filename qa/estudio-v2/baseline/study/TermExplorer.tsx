import { useState } from "react";
import { fmt, numberValue, type Draft } from "./model";
export function TermExplorer({
  draft,
  onDraft,
  onResult,
}: {
  draft: Draft;
  onDraft: (d: Draft) => void;
  onResult: (correct: boolean, item: string) => void;
}) {
  const d: Draft = {
    nominal: "10",
    curve: "B",
    part: "palanca",
    mechanism: "Térmico",
    ...draft,
  };
  const [message, setMessage] = useState("");
  const nominal = numberValue(d.nominal);
  const valid = nominal !== null && nominal > 0;
  const ranges: Record<string, [number, number]> = {
    B: [3, 5],
    C: [5, 10],
    D: [10, 20],
  };
  const range = ranges[d.curve] || ranges.B;
  const set = (key: string, value: string) => {
    onDraft({ ...d, [key]: value });
    setMessage("");
  };
  return (
    <section
      className="study-activity term-explorer"
      aria-label="Actividad interactiva"
    >
      <h3>Curvas · umbral magnético</h3>
      <div className="term-controls">
        <div className="study-segments" aria-label="Elegir curva">
          {["B", "C", "D"].map((c) => (
            <button
              key={c}
              aria-pressed={d.curve === c}
              onClick={() => set("curve", c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="study-field">
          Nominal didáctica Ip (A)
          <input
            type="number"
            step="any"
            value={d.nominal}
            onChange={(e) => set("nominal", e.target.value)}
          />
        </label>
      </div>
      <svg
        className="term-band-chart"
        viewBox="0 0 400 90"
        role="img"
        aria-label="Rangos a escala: B de 3 a 5, C de 5 a 10 y D de 10 a 20 veces la nominal"
      >
        {Object.entries(ranges).map(([c, [lo, hi]], i) => (
          <g key={c}>
            <text x="8" y={18 + i * 23}>
              {c}
            </text>
            <rect
              x="30"
              y={6 + i * 23}
              width="350"
              height="15"
              fill="#eff3f4"
            />
            <rect
              x={30 + (lo / 20) * 350}
              y={6 + i * 23}
              width={((hi - lo) / 20) * 350}
              height="15"
              fill={["#6c98ad", "#65947b", "#b7965d"][i]}
              opacity={c === d.curve ? 1 : 0.4}
            />
          </g>
        ))}
        {[0, 5, 10, 15, 20].map((x) => (
          <text key={x} x={30 + (x / 20) * 350} y="88" textAnchor="middle">
            {x}
          </text>
        ))}
      </svg>
      {valid ? (
        <output className="study-output">
          {d.curve}: {fmt(nominal! * range[0])}–{fmt(nominal! * range[1])} A ·{" "}
          {range[0]}–{range[1]} × Ip
        </output>
      ) : (
        <p className="study-error" role="status">
          Ingresa una nominal mayor que cero.
        </p>
      )}
      <small>
        Bandas magnéticas, no tiempos de disparo. B: resistivas; C: uso general;
        D: arranques altos. Ver curva del fabricante.
      </small>
      <details>
        <summary>Explorar el componente y comprobar</summary>
        <div className="study-segments">
          {["palanca", "bornes", "etiqueta"].map((part) => (
            <button
              key={part}
              aria-pressed={d.part === part}
              onClick={() => set("part", part)}
            >
              {part === "etiqueta"
                ? "Datos de selección"
                : part[0].toUpperCase() + part.slice(1)}
            </button>
          ))}
        </div>
        <p>
          {d.part === "palanca"
            ? "La palanca permite maniobrar el aparato; su posición no demuestra ausencia de tensión."
            : d.part === "bornes"
              ? "Los bornes son puntos de conexión. Su capacidad y condiciones dependen de la ficha del equipo."
              : "Consulta nominal, tensión, polos, curva y poder de corte. No se atribuyen etiquetas ilegibles a la fotografía."}
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
        <p>
          {d.mechanism === "Térmico"
            ? "El bimetal responde al calentamiento por sobrecarga."
            : "El mecanismo magnético responde a un cortocircuito suficientemente elevado."}
        </p>
        <fieldset className="study-options">
          <legend>Una sobrecarga prolongada: ¿qué mecanismo responde?</legend>
          {["Térmico", "Magnético"].map((m, i) => (
            <label key={m}>
              <input
                type="radio"
                name="term-lesson-answer"
                checked={d.choice === String(i)}
                onChange={() => set("choice", String(i))}
              />
              {m}
            </label>
          ))}
        </fieldset>
        <button
          className="study-primary"
          onClick={() => {
            if (d.choice === undefined) {
              setMessage("Selecciona una respuesta.");
              return;
            }
            const correct = d.choice === "0";
            setMessage(
              correct
                ? "Correcto: el térmico responde a sobrecarga."
                : "Revisa: el magnético responde a cortocircuito; la sobrecarga corresponde al térmico.",
            );
            onResult(correct, "actividad-termomagnetico");
          }}
        >
          Comprobar respuesta
        </button>
        {message && <p role="status">{message}</p>}
      </details>
    </section>
  );
}
