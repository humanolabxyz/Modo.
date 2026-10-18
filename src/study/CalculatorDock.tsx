import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator as CalcIcon, GripHorizontal, Sigma, X } from "lucide-react";
import { Calculator } from "./Calculator";
import { FormulaSheet } from "./FormulaSheet";
import { SEND_EVENT } from "./CalcModule";

/** Barra de herramientas de estudio: abre la calculadora como una ventana superpuesta disponible en cualquier pantalla.
 *  La calculadora se mantiene montada para conservar la operación; en escritorio la ventana se arrastra desde su cabecera
 *  y en móvil sube como una hoja inferior. Alt+C la abre o la cierra y Escape la cierra. */
export function CalculatorDock({ onOpenCard, hidden }: { onOpenCard?: (id: string) => void; hidden?: boolean }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"calc" | "formulas">("calc");
  const root = useRef<HTMLDivElement>(null);
  const show = (next: "calc" | "formulas") => { if (open && view === next) setOpen(false); else { setView(next); setOpen(true); } };
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; from: { x: number; y: number } } | null>(null);
  const panel = useRef<HTMLElement>(null);
  const fab = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) { setOpen(false); fab.current?.focus(); }
      else if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "c") { e.preventDefault(); show("calc"); }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [open, view]);
  /* Si otra parte de Estudio envía una operación y esta ventana es la visible, se abre para mostrarla. */
  useEffect(() => {
    const incoming = () => { if (root.current && root.current.offsetParent !== null) { setView("calc"); setOpen(true); } };
    window.addEventListener(SEND_EVENT, incoming);
    return () => window.removeEventListener(SEND_EVENT, incoming);
  }, []);

  const startDrag = (e: ReactPointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("button") || e.button > 0) return;
    drag.current = { x: e.clientX, y: e.clientY, from: offset };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
  };
  const moveDrag = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current, el = panel.current;
    if (!d || !el) return;
    const box = el.getBoundingClientRect(), base = { left: box.left - offset.x, top: box.top - offset.y };
    const x = Math.min(window.innerWidth - box.width - base.left - 6, Math.max(6 - base.left, d.from.x + e.clientX - d.x));
    const y = Math.min(window.innerHeight - box.height - base.top - 6, Math.max(6 - base.top, d.from.y + e.clientY - d.y));
    setOffset({ x, y });
  };
  const endDrag = () => { drag.current = null; };

  return (
    <div className="calc-dock" data-open={open} hidden={hidden} ref={root}>
      <section
        ref={panel}
        id="calc-dock-panel"
        className="calc-dock-panel"
        role="group"
        aria-label="Calculadora"
        hidden={!open}
        style={{ translate: `${offset.x}px ${offset.y}px` }}
      >
        <header onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={() => setOffset({ x: 0, y: 0 })}>
          <GripHorizontal size={18} aria-hidden="true" className="calc-grip" />
          {onOpenCard ? (
            <div className="calc-dock-tabs" role="tablist" aria-label="Herramienta">
              <button type="button" role="tab" aria-selected={view === "calc"} aria-label="Calculadora" title="Calculadora" onClick={() => setView("calc")}><CalcIcon size={20} aria-hidden="true" /></button>
              <button type="button" role="tab" aria-selected={view === "formulas"} aria-label="Fórmulas" title="Fórmulas" onClick={() => setView("formulas")}><Sigma size={20} aria-hidden="true" /></button>
            </div>
          ) : <strong>Calculadora</strong>}
          <button type="button" aria-label="Cerrar calculadora" onClick={() => { setOpen(false); fab.current?.focus(); }}><X size={20} /></button>
        </header>
        <div hidden={view !== "calc"}><Calculator /></div>
        {onOpenCard && view === "formulas" && <FormulaSheet onOpenCard={(id) => { setOpen(false); onOpenCard(id); }} />}
      </section>
      <div className="study-tools" role="toolbar" aria-label="Herramientas de estudio">
        <button ref={fab} type="button" className="calc-fab" aria-expanded={open && view === "calc"} aria-controls="calc-dock-panel" aria-label="Calculadora" aria-keyshortcuts="Alt+C" title="Calculadora (Alt+C)" onClick={() => show("calc")}>
          <CalcIcon size={24} aria-hidden="true" />
        </button>
        {onOpenCard ? (
          <button type="button" className="calc-fab calc-fab-alt" aria-expanded={open && view === "formulas"} aria-controls="calc-dock-panel" aria-label="Fórmulas" title="Fórmulas para recordar" onClick={() => show("formulas")}>
            <Sigma size={24} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
