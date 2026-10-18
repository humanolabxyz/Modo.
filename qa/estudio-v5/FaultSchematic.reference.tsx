import { useId, useState } from "react";

type Part = "phases" | "protection" | "motor" | "pe" | "fault";
/** Esquema de potencia propio del estudio; no utiliza el grafo del Banco. */
export function FaultSchematic({ fault }: { fault: "normal" | "sobrecarga" | "corto" }) {
  const [opened, setOpened] = useState(false);
  const [part, setPart] = useState<Part>("fault");
  const id = useId();
  const short = fault === "corto";
  const normal = fault === "normal";
  const phases = [134, 194, 254];
  const endY = (x: number) => 310 - Math.sqrt(67 ** 2 - (x - 194) ** 2);
  const descriptions: Record<Part, [string, string]> = {
    phases: ["L1, L2, L3 · conductores de fase", "Sigue las tres líneas desde la alimentación, pasando por Q1, hasta U1, V1 y W1 del motor. No son tres equipos distintos."],
    protection: ["Q1 · interruptor automático de tres polos", "Las tres cuchillas pertenecen al mismo dispositivo. El enlace discontinuo representa su vínculo mecánico, no un puente eléctrico entre fases. Se muestran las funciones térmica y de sobrecorriente."],
    motor: ["M1 · motor trifásico", "M identifica el motor y 3~ indica alimentación trifásica alterna. Sus tres conductores llegan a U1, V1 y W1. No se representa una conexión interna estrella o triángulo específica."],
    pe: ["PE · conductor de protección", "Llega a la carcasa del motor y permanece separado de las tres fases. No es el retorno de corriente de carga y Q1 no lo interrumpe."],
    fault: normal ? ["Recorrido normal", "Las tres fases alimentan el motor por Q1. Este estado representa funcionamiento dentro de la corriente normal, sin sobrecarga ni puente de cortocircuito."] : short
      ? ["Falla entre L1 y L2", "El trazo rojo une dos fases aguas abajo de Q1. Los puntos indican unión eléctrica: aparece un camino de muy baja impedancia, distinto del recorrido por el motor."]
      : ["Sobrecarga · sin puente entre fases", "El recorrido sigue pasando por el motor. La carga exige más corriente de la normal; el destacado ámbar identifica ese recorrido, sin añadir una conexión de falla."],
  };
  const labels: [Part, string][] = [["phases", "L1 · L2 · L3"], ["protection", "Q1"], ["motor", "M1"], ["pe", "PE"], ["fault", short ? "Falla L1–L2" : normal ? "Recorrido normal" : "Recorrido de carga"]];
  return <section className={`fault-schematic ${short ? "is-short" : normal ? "is-normal" : "is-overload"} ${opened ? "is-open" : "is-closed"}`} aria-label="Esquema eléctrico de potencia">
    <div className="fault-sheet-heading"><strong>Circuito de potencia · 3~</strong><span>{opened ? "Después de abrir Q1" : normal ? "Circuito cerrado" : "Instante previo al disparo"}</span></div>
    <svg viewBox="0 0 380 403" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
      <title id={`${id}-title`}>{short ? "Cortocircuito entre fases L1 y L2" : normal ? "Funcionamiento normal del motor trifásico" : "Sobrecarga del motor trifásico"} · Q1 {opened ? "abierto" : "cerrado"}</title>
      <desc id={`${id}-desc`}>Tres fases atraviesan los polos de Q1 y llegan al motor M1, marcado M y 3~. PE llega a la carcasa sin pasar por Q1. {short ? "Una unión de falla conecta L1 y L2 por debajo de Q1." : normal ? "No hay una falla representada." : "No hay un puente entre fases; la sobrecorriente sigue el circuito de carga."} {opened ? normal ? "Los tres contactos de Q1 están abiertos." : "Los tres contactos de Q1 están abiertos; la causa de la falla permanece." : normal ? "Los tres contactos de Q1 están cerrados." : "Los contactos se muestran cerrados para estudiar el instante de la falla."}</desc>
      <g className="fault-sheet-wires" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {phases.map((x, index) => <g key={x} data-phase={index + 1}>
          <path d={`M${x} 35V74 M${x} 110V130h8v13h-8v12 M${x} 155V${endY(x)}`} />
          <path d={`M${x - 4} 70l8 8m-8 0 8-8`} />
          <path data-breaker-contact={index + 1} data-open={opened} d={opened ? `M${x} 110l-18-28` : `M${x} 110V74`} />
          <circle cx={x} cy="110" r="2.4" className="fault-pivot" />
        </g>)}
        <path className="fault-mechanical" d="M115 97H269" strokeDasharray="4 5" />
        <path className="fault-release-frame" d="M110 125H278V182H110Z M164 125V182 M224 125V182 M110 152H278" />
        <path className="fault-pe" data-pe-path d="M328 35V310H261" />
        <circle className="fault-motor" cx="194" cy="310" r="67" />
      </g>
      <g className="fault-highlight" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {!opened && phases.filter((_, i) => !short || i < 2).map(x => <path key={x} data-current-highlight d={`M${x} 35V130h8v13h-8v${short ? 218 - 143 : endY(x) - 143}`} />)}
        {short && <g data-fault-bridge><path d="M134 218H194" /><circle cx="134" cy="218" r="4" fill="currentColor" stroke="none" /><circle cx="194" cy="218" r="4" fill="currentColor" stroke="none" /></g>}
      </g>
      <g className="fault-sheet-labels">
        {phases.map((x, i) => <g key={x}><text className="fault-reference" x={x} y="23" textAnchor="middle">L{i + 1}</text><text className="fault-terminal" x={x + 10} y="60">{i * 2 + 1}</text><text className="fault-terminal" x={x + 10} y="200">{i * 2 + 2}</text><text className="fault-trip-mark" x={x + 8} y="173">I&gt;</text><text className="fault-terminal" x={x - 12} y={endY(x) - 10} textAnchor="end">{["U1", "V1", "W1"][i]}</text></g>)}
        <text className="fault-reference" x="46" y="106">Q1</text><text x="46" y="126">3 polos</text>
        <text className="fault-reference" x="328" y="23" textAnchor="middle">PE</text>
        <text className="fault-reference" x="194" y="306" textAnchor="middle">M</text><text className="fault-motor-kind" x="194" y="333" textAnchor="middle">3~</text>
        <text className="fault-reference" x="194" y="392" textAnchor="middle">M1</text>
        {short && <><text className="fault-fault-label" x="24" y="220">Falla</text><path className="fault-callout" d="M66 216H120" fill="none" /></>}
      </g>
      {part === "protection" && <rect className="fault-selection" x="104" y="64" width="180" height="124" rx="5" />}
      {part === "motor" && <circle className="fault-selection" cx="194" cy="310" r="74" />}
      {part === "phases" && phases.map(x => <rect className="fault-selection" key={x} x={x - 9} y="29" width="18" height="36" rx="3" />)}
      {part === "pe" && <path className="fault-selection" d="M328 35V310H261" />}
    </svg>
    <div className="fault-symbol-buttons" role="group" aria-label="Identificar elementos del esquema">{labels.map(([value, label]) => <button key={value} aria-pressed={part === value} onClick={() => setPart(value)}>{label}</button>)}</div>
    <div className="fault-symbol-explanation" aria-live="polite"><strong>{descriptions[part][0]}</strong><p>{descriptions[part][1]}</p></div>
    <button className="fault-opening-button" aria-pressed={opened} onClick={() => setOpened(!opened)}>{opened ? normal ? "Volver al circuito cerrado" : "Volver al instante de falla" : "Ver la apertura de Q1"}</button>
    {opened && <p className="fault-opening-note" role="status">Los tres polos abren e interrumpen la alimentación mostrada. {!normal && "La causa de la falla permanece; no se ha corregido por abrir Q1."}</p>}
    <details className="fault-conventions"><summary>Convenciones y referencias del dibujo</summary><p>Esquema didáctico multifilar simplificado. Los contactos cambian de posición para mostrar dos estados, no tiempos de disparo. El color destaca un recorrido; no representa colores reales del cableado. Q1 y M1 son referencias de este ejemplo, sin correspondencia asignada al panel práctico.</p><p>Criterios de falla: láminas 2–4 del profesor. Símbolos contrastados con <a href="https://library.e.abb.com/public/3824ffa857ca19c1c1256b1900336151/1TSC902009D0201.pdf#page=32" target="_blank" rel="noreferrer">ABB · símbolos de diagramas</a> y <a href="https://download.se.com/files?p_Doc_Ref=1549892_01A55&p_File_Name=1549892_01A55.pdf&p_enDocType=Instruction+sheet#page=4" target="_blank" rel="noreferrer">Schneider Electric · esquema de motor</a>.</p></details>
  </section>;
}
