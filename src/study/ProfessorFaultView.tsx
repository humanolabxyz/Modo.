import { useId } from "react";

/** Comparación de la lámina 3; no atribuye conexiones o placa al motor fotografiado. */
export function ProfessorFaultView({ fault }: { fault: "normal" | "sobrecarga" | "corto" }) {
  const id = useId();
  const states = [
    { id: "normal", label: "Nominal", height: 22, color: "#75d1ef" },
    { id: "sobrecarga", label: "Sobrecarga", height: 67, color: "#ffb533" },
    { id: "corto", label: "Cortocircuito", height: 113, color: "#d72960" },
  ];
  const explanations = {
    normal: "La corriente normal de funcionamiento sirve de referencia para comparar las otras condiciones.",
    sobrecarga: "La corriente supera la normal de funcionamiento y recalienta el conductor.",
    corto: "Se establece un camino de muy baja impedancia. El profesor señala que puede originarse por pérdida de aislación en un motor.",
  };
  return <section className="professor-fault-view" aria-label="Comparación de fallas del profesor">
    <header><strong>Así lo explica el profesor</strong><a href="/estudio/profesor.pdf#page=3" target="_blank" rel="noreferrer">Lámina 3 ↗</a></header>
    <div className="professor-fault-grid">
      <div className="professor-current-chart">
        <svg viewBox="0 0 360 185" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>Comparación conceptual: corriente nominal, sobrecarga y cortocircuito</title>
          <desc id={`${id}-desc`}>Tres barras sin escala numérica, basadas en la lámina 3. La barra destacada corresponde a {fault === "normal" ? "funcionamiento nominal" : fault === "corto" ? "cortocircuito" : "sobrecarga"}. Las alturas no son medidas ni umbrales de disparo.</desc>
          <path d="M17 142H343" stroke="#607467" strokeWidth="1.5" />
          {states.map((state, index) => <g key={state.id} data-comparison-state={state.id} data-selected={fault === state.id}>
            <rect x={29 + index * 115} y={142 - state.height} width="75" height={state.height} fill={state.color} opacity={fault === state.id ? 1 : .48} />
            {fault === state.id && <rect x={25 + index * 115} y={138 - state.height} width="83" height={state.height + 8} rx="2" fill="none" stroke="#294c3a" strokeWidth="2" />}
            <text x={66.5 + index * 115} y="170" textAnchor="middle" fontWeight={fault === state.id ? 700 : 400}>{state.label}</text>
          </g>)}
        </svg>
        <p className="professor-chart-limit">Comparación conceptual, sin escala. No representa amperes ni múltiplos de disparo.</p>
        <p className="professor-chart-explanation" aria-live="polite">{explanations[fault]}</p>
      </div>
      <figure className="professor-motor-reference">
        <img src="/estudio/fotos/02_motor_electrico.jpg" alt="Motor gris de la fotografía original de la lámina 3 del profesor" loading="eager" />
        <figcaption><strong>La aislación del motor</strong><span>Es una barrera frente a la falla, como indica la lámina 3. La foto no muestra la aislación interna ni permite identificar una conexión o placa.</span></figcaption>
      </figure>
    </div>
  </section>;
}
