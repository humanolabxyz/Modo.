import { useRef, type ReactNode } from "react";
import { ArrowUpRight, Expand, Image as ImageIcon, X } from "lucide-react";
import { content } from "./lessonContent";
import { fmt, numberValue, type Draft } from "./model";
import { trapDialogTab } from "./dialog";

export const topicAssets: Record<string, string> = {
  termomagnetico: "/estudio/assets/termomagnetico-v2.webp",
  fusibles: "/estudio/assets/fusibles-v2.webp",
  "tierra-sobretension": "/estudio/assets/spd-diferencial-v2.webp",
  "motor-trifasico": "/estudio/assets/motor-v2.webp",
};
const slides: Record<string, number> = {
  "objetivos-fallas": 4,
  coordinacion: 6,
  termomagnetico: 8,
  fusibles: 10,
  conductores: 12,
  guardamotor: 13,
  "tierra-sobretension": 14,
  "motor-trifasico": 15,
};
type Point = {
  id: string;
  label: string;
  x: number;
  y: number;
  explanation: string;
};
const points: Record<string, Point[]> = {
  termomagnetico: [
    {
      id: "bornes",
      label: "Bornes",
      x: 47,
      y: 19,
      explanation:
        "Puntos de conexión del aparato. La capacidad y condiciones de conexión se consultan en su ficha.",
    },
    {
      id: "palanca",
      label: "Palanca",
      x: 46,
      y: 56,
      explanation:
        "Permite maniobrar el interruptor. Su posición no acredita ausencia de tensión.",
    },
  ],
  fusibles: [
    {
      id: "vidrio",
      label: "Vidrio",
      x: 30,
      y: 32,
      explanation:
        "La carcasa de vidrio permite reconocer el formato. No determina por sí sola rapidez, clase ni capacidad de ruptura.",
    },
    {
      id: "ceramico",
      label: "Cerámico",
      x: 30,
      y: 65,
      explanation:
        "La carcasa cerámica es otro formato. Comprueba la clase y los valores en placa y ficha.",
    },
    {
      id: "portafusible",
      label: "Portafusible",
      x: 73,
      y: 49,
      explanation:
        "Aloja el cartucho. Su compatibilidad depende de las especificaciones del conjunto.",
    },
  ],
  "tierra-sobretension": [
    {
      id: "spd",
      label: "SPD",
      x: 26,
      y: 48,
      explanation:
        "Limita la sobretensión transitoria y deriva su corriente. Se estudia aparte de la función diferencial.",
    },
    {
      id: "rcd",
      label: "Diferencial",
      x: 76,
      y: 48,
      explanation:
        "Detecta desequilibrio por fuga. No sustituye la protección contra sobrecorrientes.",
    },
  ],
  "motor-trifasico": [
    {
      id: "caja",
      label: "Caja de bornes",
      x: 32,
      y: 33,
      explanation:
        "La tensión y conexión se contrastan con placa y documentación del motor. Esta imagen no aporta una placa numérica completa.",
    },
    {
      id: "motor",
      label: "Motor",
      x: 33,
      y: 49,
      explanation:
        "Convierte potencia eléctrica en potencia mecánica. El cálculo usa potencia mecánica de salida, rendimiento y factor de potencia.",
    },
    {
      id: "acoplamiento",
      label: "Acoplamiento",
      x: 65,
      y: 49,
      explanation:
        "Transmite movimiento a la carga. No permite deducir la corriente nominal ni el arranque del motor.",
    },
  ],
};
export function LessonMedia({
  topic,
  draft,
  onDraft,
}: {
  topic: string;
  draft: Draft;
  onDraft: (d: Draft) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    p = points[topic] || [],
    active =
      p.find(
        (x) =>
          x.id ===
          (topic === "termomagnetico"
            ? draft.part || "palanca"
            : draft.mediaPart),
      ) || p[0];
  const select = (id: string) =>
    onDraft({
      ...draft,
      [topic === "termomagnetico" ? "part" : "mediaPart"]: id,
    });
  const derived = !!topicAssets[topic];
  return (
    <figure className={`study-photo lesson-media media-${topic}`}>
      <div className="media-caption-top">
        <span>{derived ? "Explora el componente" : "Observa el concepto"}</span>
        <span>Lámina {slides[topic]}</span>
      </div>
      <div className="media-stage">
        {topic === "coordinacion" ? (
          <CoordinationVisual draft={draft} />
        ) : topic === "conductores" ? (
          <CableVisual active={draft.mediaPart || "conductor"} />
        ) : topic === "guardamotor" ? (
          <GuardVisual draft={draft} />
        ) : (
          <img
            className={derived ? "derived-component" : "teacher-scene"}
            src={topicAssets[topic] || `/estudio/fotos/${content[topic].image}`}
            alt={`${derived ? "Imagen ilustrativa derivada de la PPT" : "Imagen del material docente"}: ${content[topic] && topic.replaceAll("-", " ")}`}
            loading="eager"
          />
        )}
        {p.map((point, i) => (
          <button
            key={point.id}
            className="media-hotspot"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            aria-label={`Explorar ${point.label.toLowerCase()}`}
            aria-pressed={active?.id === point.id}
            onClick={() => select(point.id)}
          >
            <span>{i + 1}</span>
          </button>
        ))}
        {topic === "objetivos-fallas" && (
          <span className="media-scene-caption">
            Arco · calor · esfuerzos magnéticos
          </span>
        )}
      </div>
      {topic === "conductores" && (
        <div className="media-layer-controls">
          {[
            ["conductor", "Conductor"],
            ["aislacion", "Aislación"],
            ["instalacion", "Instalación"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={(draft.mediaPart || "conductor") === id}
              onClick={() => select(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {active && (
        <div className="media-explanation" key={active.id}>
          <strong>{active.label}</strong>
          <p>{active.explanation}</p>
        </div>
      )}
      {topic === "conductores" && (
        <div className="media-explanation">
          <strong>
            {draft.mediaPart === "aislacion"
              ? "Aislación"
              : draft.mediaPart === "instalacion"
                ? "Método de instalación"
                : "Capacidad del conductor"}
          </strong>
          <p>
            {draft.mediaPart === "aislacion"
              ? "La capacidad tabulada y el valor k dependen también de la aislación; no se deducen solo de esta representación."
              : draft.mediaPart === "instalacion"
                ? "Temperatura, agrupamiento y método de instalación cambian la capacidad disponible."
                : "La sección y el material intervienen en la capacidad de corriente y en la respuesta térmica a la falla."}
          </p>
        </div>
      )}
      <figcaption>
        <small>
          {derived
            ? "Imagen derivada de la PPT · uso ilustrativo"
            : topic === "objetivos-fallas"
              ? "Imagen original de la PPT"
              : "Esquema didáctico basado en la PPT"}
        </small>
        <button onClick={() => dialog.current?.showModal()}>
          <ImageIcon size={15} />
          {derived || topic === "objetivos-fallas"
            ? "Ver imagen original"
            : "Ver lámina del profesor"}
          <ArrowUpRight size={14} />
        </button>
      </figcaption>
      <dialog
        className="study-image-dialog"
        onKeyDown={trapDialogTab}
        ref={dialog}
        aria-label="Referencia del profesor ampliada"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="image-dialog-heading">
          <strong>Referencia del profesor · lámina {slides[topic]}</strong>
          <button
            aria-label="Cerrar imagen ampliada"
            onClick={() => dialog.current?.close()}
          >
            <X size={21} />
          </button>
        </div>
        {derived || topic === "objetivos-fallas" ? (
          <img
            loading="lazy"
            src={`/estudio/fotos/${content[topic].image}`}
            alt="Imagen original incluida en la presentación docente"
          />
        ) : (
          <div className="original-slide-note">
            <img
              loading="lazy"
              src={`/estudio/assets/lamina-${String(slides[topic]).padStart(2, "0")}.png`}
              alt={`Lámina ${slides[topic]} original del profesor`}
            />
            <a
              href={`/estudio/profesor.pdf#page=${slides[topic]}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir lámina {slides[topic]} del PDF <Expand size={16} />
            </a>
          </div>
        )}
        <p>
          Las especificaciones se consultan en el material y en las fichas; las
          imágenes no identifican valores oficiales.
        </p>
      </dialog>
    </figure>
  );
}
function DiagramFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <svg
      className="lesson-diagram"
      viewBox="0 0 400 320"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`case-${title.length}`} x1="0" x2="1">
          <stop stopColor="#fdfdfd" />
          <stop offset="1" stopColor="#e4e4e4" />
        </linearGradient>
        <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e8c08b" />
          <stop offset=".5" stopColor="#bc8152" />
          <stop offset="1" stopColor="#e9c795" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}
function CoordinationVisual({ draft }: { draft: Draft }) {
  const values = [
    numberValue(draft.In_A ?? "18"),
    numberValue(draft.Ip_A ?? "20"),
    numberValue(draft.Iz_A ?? "25"),
  ];
  return (
    <DiagramFrame title="Carga In, protección Ip y cable Iz como en la lámina 6">
      <text className="diagram-eyebrow" x="24" y="54">
        COORDINACIÓN DE CORRIENTE
      </text>
      {[
        ["Carga", "In", "#e1f1f8"],
        ["Protección", "Ip", "#f7ebd2"],
        ["Cable", "Iz", "#eaeaea"],
      ].map(([label, symbol, color], i) => (
        <g key={label}>
          <rect
            x={24 + i * 121}
            y="95"
            width="112"
            height="132"
            rx="12"
            fill={color}
          />
          <text
            className="diagram-label"
            x={80 + i * 121}
            y="126"
            textAnchor="middle"
          >
            {label} · {symbol}
          </text>
          <text
            className="diagram-value"
            x={80 + i * 121}
            y="170"
            textAnchor="middle"
          >
            {values[i] === null ? "—" : fmt(values[i]!)}
          </text>
          <text
            className="diagram-unit"
            x={80 + i * 121}
            y="198"
            textAnchor="middle"
          >
            amperes
          </text>
        </g>
      ))}
      <text className="diagram-rule" x="200" y="271" textAnchor="middle">
        In ≤ Ip ≤ Iz
      </text>
      <text className="diagram-label" x="200" y="299" textAnchor="middle">
        Una condición. Otras verificaciones pendientes.
      </text>
    </DiagramFrame>
  );
}
function CableVisual({ active }: { active: string }) {
  return (
    <DiagramFrame title="Capas conceptuales de un conductor eléctrico">
      <text className="diagram-eyebrow" x="24" y="38">
        CONDUCTOR · ESQUEMA DIDÁCTICO
      </text>
      <path
        d="M45 135 Q160 80 285 120 L320 224 Q194 180 78 232Z"
        fill={active === "instalacion" ? "#2e2e2e" : "#3f535c"}
        stroke="#263d47"
        strokeWidth="2"
      />
      <path
        d="M78 143Q177 100 283 132L302 210Q196 170 98 218Z"
        fill={active === "aislacion" ? "#e8bb68" : "#ccad74"}
        stroke="#a38b5e"
        strokeWidth="2"
      />
      <path
        d="M105 148Q192 111 280 145L290 195Q198 165 117 204Z"
        fill="url(#copper)"
        stroke="#a97346"
        strokeWidth="2"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M${112 + i * 4} ${153 + i * 6} Q195 ${124 + i * 6} ${278 + i * 1.4} ${150 + i * 6}`}
          fill="none"
          stroke="#996638"
          strokeWidth="2"
          opacity=".7"
        />
      ))}
      <path d="M205 180L205 252H78" stroke="#383838" fill="none" />
      <circle cx="205" cy="180" r="4" fill="#383838" />
      <text className="diagram-label" x="28" y="277">
        {active === "aislacion"
          ? "Aislación: dato para tablas y modelo térmico"
          : active === "instalacion"
            ? "Instalación: temperatura y agrupamiento"
            : "Conductor: material y sección"}
      </text>
      <text className="diagram-label" x="28" y="302">
        Iz = Itabla × fT × fG
      </text>
    </DiagramFrame>
  );
}
function GuardVisual({ draft }: { draft: Draft }) {
  const adjustment = numberValue(draft.adjust ?? "6.3"),
    range = draft.range || "6–10",
    [low, high] = range.split("–").map(Number),
    angle =
      -125 +
      Math.max(0, Math.min(1, ((adjustment ?? low) - low) / (high - low))) *
        250;
  return (
    <DiagramFrame title="Guardamotor esquemático con ajuste térmico ficticio">
      <text className="diagram-eyebrow" x="24" y="32">
        RANGO Y AJUSTE TÉRMICO
      </text>
      <rect x="101" y="56" width="198" height="222" rx="14" fill="#35464a" />
      <rect x="115" y="68" width="170" height="40" rx="6" fill="#e7e7e7" />
      {[143, 200, 257].map((x) => (
        <g key={x}>
          <circle cx={x} cy="86" r="12" fill="#68777b" />
          <path d={`M${x - 6} 86H${x + 6}`} stroke="#cbcbcb" strokeWidth="3" />
        </g>
      ))}
      <circle
        cx="200"
        cy="171"
        r="50"
        fill="#52666b"
        stroke="#8e8e8e"
        strokeWidth="2"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d="M200 126V133"
          transform={`rotate(${-125 + i * 31.25} 200 171)`}
          stroke="#d9d9d9"
          strokeWidth="2"
        />
      ))}
      <circle cx="200" cy="171" r="30" fill="#d7d7d7" />
      <path
        d="M200 171V146"
        stroke="#222222"
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${angle} 200 171)`}
      />
      <rect x="125" y="231" width="64" height="30" rx="6" fill="#d9d9d9" />
      <rect x="210" y="231" width="64" height="30" rx="6" fill="#b46c57" />
      <text x="157" y="251" textAnchor="middle" fill="#242424" fontSize="12">
        I
      </text>
      <text x="242" y="251" textAnchor="middle" fill="white" fontSize="12">
        O
      </text>
      <text className="diagram-label" x="200" y="307" textAnchor="middle">
        Rango ficticio {range} A · ajuste{" "}
        {adjustment === null ? "—" : fmt(adjustment)} A
      </text>
    </DiagramFrame>
  );
}
