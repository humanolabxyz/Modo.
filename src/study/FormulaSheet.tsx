import { useState } from "react";
import { CARDS, GROUPS, PURPOSE } from "./CalcModule";

/** Chuleta de fórmulas: cada fórmula se ve de un vistazo y, al tocarla, muestra qué significa cada símbolo para acordarse.
 *  Desde aquí se salta a la ficha completa para calcular con datos propios. No se ofrece durante la evaluación. */
export function FormulaSheet({ onOpenCard }: { onOpenCard: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="formula-sheet">
      <p className="formula-hint">Toca una fórmula para recordar qué significa cada símbolo.</p>
      {GROUPS.map((g) => (
        <section key={g.name} aria-label={g.name}>
          <h4>{g.name}</h4>
          <ul>
            {g.ids.map((cid) => {
              const c = CARDS.find((x) => x.id === cid)!;
              const isOpen = open === c.id;
              return (
                <li key={c.id} className={isOpen ? "is-open" : ""}>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)}>
                    <span className="formula-name">{c.tab}</span>
                    <span className="formula-exact">{c.exact}</span>
                  </button>
                  {isOpen && (
                    <div className="formula-detail">
                      <dl>{c.legend.map(([sym, meaning], i) => <div key={i}><dt>{sym}</dt><dd>{meaning}</dd></div>)}</dl>
                      <p>{PURPOSE[c.id].what}</p>
                      <button type="button" className="formula-open" onClick={() => onOpenCard(c.id)}>Abrir la ficha y calcular</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
