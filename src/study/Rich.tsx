import { Fragment, type ReactNode } from "react";

// Palabras y reglas clave que se resaltan en las explicaciones. Solo se marca
// la primera aparición de cada término dentro de un mismo texto.
const TERMS = [
  "In ≤ Ip ≤ Iz",
  "Iz = Itabla × fT × fG",
  "In = Psalida / (√3 VLL η cosφ)",
  "camino de muy baja impedancia",
  "baja impedancia",
  "capacidad de ruptura",
  "capacidad corregida",
  "corriente de placa",
  "poder de corte",
  "caída de tensión",
  "factor de potencia",
  "sobretensión",
  "sobrecarga",
  "cortocircuito",
  "rendimiento",
  "arco eléctrico",
  "esfuerzos magnéticos",
  "mando remoto",
  "termomagnético",
  "guardamotor",
  "diferencial",
  "desequilibrio",
  "fusible",
  "rango",
  "SPD",
  "RCD",
];
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = new RegExp(
  `(${[...TERMS].sort((a, b) => b.length - a.length).map(escape).join("|")})`,
  "gi",
);

/** Resalta los términos clave (una vez cada uno) con <mark class="kw">. */
export function Rich({ text }: { text: string }): ReactNode {
  const seen = new Set<string>();
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const key = part.toLowerCase();
        if (seen.has(key)) return <Fragment key={i}>{part}</Fragment>;
        seen.add(key);
        return (
          <mark className="kw" key={i}>
            {part}
          </mark>
        );
      })}
    </>
  );
}
