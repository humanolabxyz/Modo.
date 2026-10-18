import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Lightbulb, RotateCcw, X } from "lucide-react";
import { lessonCards, type Card, type Choice, type Learn, type Match, type NumberQ, type Order, type Sort } from "./lessonCards";
import { numberValue, type Draft } from "./model";
import { Rich } from "./Rich";
import { LessonMedia } from "./LessonMedia";

type Props = {
  topic: string;
  draft: Draft;
  onDraft: (d: Draft) => void;
  /** Contenido de la primera pantalla (idea y recurso visual). Recibe la acción «empezar». */
  intro: (start: () => void) => ReactNode;
  onFinish: () => void;
};

export function GuidedLesson({ topic, draft, onDraft, intro, onFinish }: Props) {
  const cards = lessonCards[topic] || [];
  const total = cards.length + 1;
  const index = Math.max(0, Math.min(total - 1, Number.parseInt(draft.lessonCard || "0", 10) || 0));
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [done, setDone] = useState<Set<number>>(
    () => new Set((draft.lessonDone || "").split(",").filter(Boolean).map(Number)),
  );
  useEffect(() => {
    const value = [...done].sort((a, b) => a - b).join(",");
    if (value !== (draftRef.current.lessonDone || "")) onDraft({ ...draftRef.current, lessonDone: value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  const markDone = (i: number) => setDone((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  const go = (i: number) => onDraft({ ...draftRef.current, lessonCard: String(Math.max(0, Math.min(total - 1, i))) });
  const card = index > 0 ? cards[index - 1] : undefined;
  const last = index === total - 1;
  const ready = index === 0 || done.has(index) || (card?.kind === "learn" && !card.reveal);
  return (
    <div className="guided-lesson" data-kind={card?.kind || "intro"}>
      <div className="gl-top">
        <div className="gl-progress" role="progressbar" aria-label="Avance de la lección" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1}>
          {Array.from({ length: total }, (_, i) => (
            <button key={i} type="button" className={`gl-dot${i === index ? " is-current" : ""}${i < index || done.has(i) ? " is-done" : ""}`} aria-label={`Ir a la parte ${i + 1}`} aria-current={i === index ? "step" : undefined} disabled={i > index && (!ready || i > index + 1)} onClick={() => go(i)} />
          ))}
        </div>
        <span className="gl-count">Parte {index + 1} de {total}</span>
        <button type="button" className="gl-skip" onClick={onFinish}>Ya lo sé · ir a probar</button>
      </div>
      <div className="gl-stage" key={index}>
        {index === 0 ? (
          intro(() => go(1))
        ) : (
          <>
            <div className={card?.kind === "learn" ? "campus-visual-lesson" : undefined}>
              <CardView card={card!} onComplete={() => markDone(index)} key={index} />
              {card?.kind === "learn" && <aside className="campus-lesson-visual" aria-label="Explicación visual del tema"><span className="campus-eyebrow">OBSERVA Y EXPLORA EL TEMA</span><LessonMedia topic={topic} draft={draft} onDraft={onDraft} /></aside>}
            </div>
            <div className="gl-nav">
              <button type="button" className="gl-back" onClick={() => go(index - 1)}><ArrowLeft size={18} /> Anterior</button>
              <button type="button" className="study-primary gl-next" disabled={!ready} onClick={() => (last ? onFinish() : go(index + 1))}>
                {last ? "Vamos a probar" : "Siguiente"} <ArrowRight size={18} />
              </button>
              {!ready && <p className="gl-lock" role="status">{card?.kind === "learn" ? "Toca todos los conceptos para continuar." : "Resuelve esta parte para continuar."}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CardView({ card, onComplete }: { card: Card; onComplete: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  return (
    <article className={`gl-card kind-${card.kind}`}>
      <span className="gl-tag">{tagFor(card)}</span>
      <h3 ref={heading} tabIndex={-1}>{card.title}</h3>
      {card.kind === "learn" && <LearnView card={card} onComplete={onComplete} />}
      {card.kind === "choice" && <ChoiceView card={card} onComplete={onComplete} />}
      {card.kind === "sort" && <SortView card={card} onComplete={onComplete} />}
      {card.kind === "match" && <MatchView card={card} onComplete={onComplete} />}
      {card.kind === "order" && <OrderView card={card} onComplete={onComplete} />}
      {card.kind === "number" && <NumberView card={card} onComplete={onComplete} />}
    </article>
  );
}
const tagFor = (c: Card) => ({ learn: "APRENDE", choice: "ELIGE", sort: "CLASIFICA", match: "UNE", order: "ORDENA", number: "CALCULA" })[c.kind];

function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className={`gl-feedback ${ok ? "is-correct" : "is-retry"}`} role="status">
      <strong>{ok ? <><Check size={18} aria-hidden="true" /> ¡Correcto!</> : <><X size={18} aria-hidden="true" /> Casi. Revisa y vuelve a intentarlo.</>}</strong>
      <p><Rich text={String(children)} /></p>
    </div>
  );
}

function LearnView({ card, onComplete }: { card: Learn; onComplete: () => void }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const id = useId();
  const total = card.reveal?.length || 0;
  useEffect(() => { if (total > 0 && open.size === total) onComplete(); }, [open, total, onComplete]);
  return (
    <>
      {card.body.map((p) => <p key={p} className="gl-text"><Rich text={p} /></p>)}
      {card.analogy && <p className="gl-analogy"><Lightbulb size={20} aria-hidden="true" /><span><strong>Piénsalo así:</strong> {card.analogy}</span></p>}
      {card.reveal && (
        <div className="gl-reveal">
          <p className="gl-hint">{card.revealHint || "Toca para descubrir"} · {open.size}/{total}</p>
          {card.reveal.map((r, i) => {
            const isOpen = open.has(i);
            return (
              <div key={r.label} className={`gl-reveal-item${isOpen ? " is-open" : ""}`}>
                <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${i}`} onClick={() => setOpen((s) => new Set(s).add(i))}>
                  <span>{r.label}</span>
                  <i aria-hidden="true">{isOpen ? <Check size={16} /> : "+"}</i>
                </button>
                <div id={`${id}-${i}`} role="region" hidden={!isOpen}><p><Rich text={r.text} /></p></div>
              </div>
            );
          })}
        </div>
      )}
      {card.takeaway && (!card.reveal || open.size === total) && <p className="gl-takeaway"><Rich text={card.takeaway} /></p>}
    </>
  );
}

function ChoiceView({ card, onComplete }: { card: Choice; onComplete: () => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [tries, setTries] = useState(0);
  const ok = checked && pick === card.correct;
  const id = useId();
  return (
    <>
      <p className="gl-question"><Rich text={card.question} /></p>
      <fieldset className="gl-options">
        <legend className="sr-only">{card.question}</legend>
        {card.options.map((o, i) => (
          <label key={o} className={checked && i === card.correct && (ok || tries >= 2) ? "is-right" : checked && i === pick && !ok ? "is-wrong" : ""}>
            <input type="radio" name={id} checked={pick === i} disabled={ok} onChange={() => { setPick(i); setChecked(false); }} />
            <span className="gl-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
            <span>{o}</span>
          </label>
        ))}
      </fieldset>
      {!ok && <button type="button" className="study-primary gl-check" disabled={pick === null} onClick={() => { setChecked(true); const right = pick === card.correct; setTries((t) => t + 1); if (right || tries + 1 >= 2) onComplete(); }}>Comprobar</button>}
      {checked && <Feedback ok={ok}>{ok || tries >= 2 ? card.explain : "Esa no es. Lee de nuevo y prueba otra opción."}</Feedback>}
      {checked && !ok && tries >= 2 && <p className="gl-hint">La respuesta correcta es la {String.fromCharCode(65 + card.correct)}. Ya puedes continuar.</p>}
    </>
  );
}

function SortView({ card, onComplete }: { card: Sort; onComplete: () => void }) {
  const [assign, setAssign] = useState<(0 | 1 | null)[]>(card.items.map(() => null));
  const [checked, setChecked] = useState(false);
  const allSet = assign.every((a) => a !== null);
  const allOk = checked && assign.every((a, i) => a === card.items[i].bucket);
  return (
    <>
      <p className="gl-question"><Rich text={card.question} /></p>
      <ul className="gl-sort">
        {card.items.map((it, i) => {
          const state = checked ? (assign[i] === it.bucket ? "ok" : "bad") : "";
          return (
            <li key={it.text} className={state}>
              <p>{it.text}</p>
              <div role="group" aria-label={`Clasificar: ${it.text}`}>
                {card.buckets.map((b, bi) => (
                  <button key={b} type="button" aria-pressed={assign[i] === bi} disabled={allOk} onClick={() => { setAssign((a) => a.map((x, xi) => (xi === i ? (bi as 0 | 1) : x))); setChecked(false); }}>{b}</button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      {!allOk && <button type="button" className="study-primary gl-check" disabled={!allSet} onClick={() => { setChecked(true); if (assign.every((a, i) => a === card.items[i].bucket)) onComplete(); }}>Comprobar</button>}
      {checked && <Feedback ok={allOk}>{allOk ? card.explain : "Hay respuestas marcadas en rojo. Cámbialas y comprueba otra vez."}</Feedback>}
    </>
  );
}

function MatchView({ card, onComplete }: { card: Match; onComplete: () => void }) {
  const right = useMemo(() => card.pairs.map((_, i) => (i + 1) % card.pairs.length), [card.pairs]);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const finished = matched.size === card.pairs.length;
  useEffect(() => { if (finished) onComplete(); }, [finished, onComplete]);
  const tryMatch = (def: number) => {
    if (sel === null) return;
    if (def === sel) { setMatched((m) => new Set(m).add(sel)); setSel(null); setWrong(null); }
    else { setWrong(def); window.setTimeout(() => setWrong(null), 500); }
  };
  return (
    <>
      <p className="gl-question"><Rich text={card.question} /> <span className="gl-hint">{matched.size}/{card.pairs.length} unidos</span></p>
      <div className="gl-match">
        <ul aria-label="Conceptos">
          {card.pairs.map(([term], i) => (
            <li key={term}><button type="button" className={matched.has(i) ? "is-matched" : sel === i ? "is-selected" : ""} aria-pressed={sel === i} disabled={matched.has(i)} onClick={() => setSel(i)}>{term}</button></li>
          ))}
        </ul>
        <ul aria-label="Significados">
          {right.map((i) => (
            <li key={card.pairs[i][1]}><button type="button" className={`${matched.has(i) ? "is-matched" : ""}${wrong === i ? " is-wrong" : ""}`} disabled={matched.has(i) || sel === null} onClick={() => tryMatch(i)}>{card.pairs[i][1]}</button></li>
          ))}
        </ul>
      </div>
      {sel === null && !finished && <p className="gl-hint">Primero toca un concepto de la izquierda.</p>}
      {finished && <Feedback ok>{card.explain}</Feedback>}
    </>
  );
}

function OrderView({ card, onComplete }: { card: Order; onComplete: () => void }) {
  const initial = useMemo(() => {
    const idx = card.steps.map((_, i) => i).sort((a, b) => ((a * 5 + 2) % 7) - ((b * 5 + 2) % 7));
    return idx.every((v, i) => v === i) ? idx.reverse() : idx;
  }, [card.steps]);
  const [order, setOrder] = useState<number[]>(initial);
  const [checked, setChecked] = useState(false);
  const ok = checked && order.every((v, i) => v === i);
  const move = (pos: number, dir: -1 | 1) => {
    const j = pos + dir;
    if (j < 0 || j >= order.length) return;
    setOrder((o) => { const n = [...o]; [n[pos], n[j]] = [n[j], n[pos]]; return n; });
    setChecked(false);
  };
  return (
    <>
      <p className="gl-question"><Rich text={card.question} /></p>
      <ol className="gl-order">
        {order.map((v, pos) => (
          <li key={v} className={checked ? (v === pos ? "ok" : "bad") : ""}>
            <span className="gl-order-num">{pos + 1}</span>
            <p>{card.steps[v]}</p>
            <div>
              <button type="button" aria-label={`Subir: ${card.steps[v]}`} disabled={ok || pos === 0} onClick={() => move(pos, -1)}><ArrowUp size={18} /></button>
              <button type="button" aria-label={`Bajar: ${card.steps[v]}`} disabled={ok || pos === order.length - 1} onClick={() => move(pos, 1)}><ArrowDown size={18} /></button>
            </div>
          </li>
        ))}
      </ol>
      {!ok && <button type="button" className="study-primary gl-check" onClick={() => { setChecked(true); if (order.every((v, i) => v === i)) onComplete(); }}>Comprobar el orden</button>}
      {checked && <Feedback ok={ok}>{ok ? card.explain : "Algunos pasos no están en su lugar (marcados en rojo). Muévelos con las flechas."}</Feedback>}
    </>
  );
}

function NumberView({ card, onComplete }: { card: NumberQ; onComplete: () => void }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"" | "ok" | "bad" | "missing">("");
  const [tries, setTries] = useState(0);
  const id = useId();
  const check = () => {
    const n = numberValue(value);
    if (n === null) { setState("missing"); return; }
    const ok = Math.abs(n - card.answer) <= (card.tol ?? 0.05);
    setState(ok ? "ok" : "bad");
    if (ok) onComplete();
    else { setTries((t) => t + 1); if (tries + 1 >= 2) onComplete(); }
  };
  return (
    <>
      <p className="gl-question"><Rich text={card.question} /></p>
      {card.given && <p className="gl-given">{card.given}</p>}
      <div className="gl-number">
        <label htmlFor={id}>Tu resultado</label>
        <div>
          <input id={id} type="text" inputMode="decimal" placeholder="Escribe el número" value={value} disabled={state === "ok"} onChange={(e) => { setValue(e.target.value); setState(""); }} onKeyDown={(e) => { if (e.key === "Enter") check(); }} />
          <span>{card.unit}</span>
        </div>
        <small>Coma o punto decimal · se admite una diferencia de {String(card.tol ?? 0.05).replace(".", ",")} {card.unit}</small>
      </div>
      {state !== "ok" && <button type="button" className="study-primary gl-check" onClick={check}>Comprobar</button>}
      {state === "missing" && <div className="gl-feedback is-retry" role="status"><strong>Falta tu respuesta.</strong><p>Escribe un número; la unidad ya está indicada.</p></div>}
      {state === "bad" && <div className="gl-feedback is-retry" role="status"><strong><RotateCcw size={16} aria-hidden="true" /> Todavía no.</strong><p>{tries >= 2 ? `La respuesta es ${String(card.answer).replace(".", ",")} ${card.unit}. ` : "Revisa los datos y las unidades, y calcula otra vez. "}{tries >= 2 ? card.explain : "Puedes usar la calculadora del módulo «Cálculos»."}</p></div>}
      {state === "ok" && <Feedback ok>{card.explain}</Feedback>}
    </>
  );
}
