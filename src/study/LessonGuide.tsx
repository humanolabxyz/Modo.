import { useId, useRef } from "react";
import { BookOpen, ListChecks, PencilLine, ArrowDown } from "lucide-react";
import { teaching } from "./teachingContent";
import { type Draft } from "./model";
import { Source } from "./ExamView";
import { RememberCard } from "./RememberCard";
import { Rich } from "./Rich";

export function LessonGuide({ topic, slides, draft, onDraft, onExperiment }: {
  topic: string;
  slides: number[];
  draft: Draft;
  onDraft: (draft: Draft) => void;
  onExperiment?: () => void;
}) {
  const info = teaching[topic];
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const tabs = [
    ["concepts", "Explicación", BookOpen],
    ["example", "Ejemplo resuelto", ListChecks],
    ["review", "Errores y repaso", PencilLine],
  ] as const;
  const active = tabs.some(([key]) => key === draft.readingTab) ? draft.readingTab : "concepts";
  const select = (value: string) => onDraft({ ...draft, readingTab: value });
  const goActivity = () => {
    if (onExperiment) { onExperiment(); return; }
    const activity = document.getElementById("lesson-lab");
    activity?.focus({ preventScroll: true });
    activity?.scrollIntoView({ behavior: "instant", block: "start" });
  };
  return (
    <section className="lesson-guide" id="lesson-reading" aria-labelledby={`${id}-title`}>
      <header className="lesson-guide-heading">
        <span className="lesson-step">01 · COMPRENDE</span>
        <h3 id={`${id}-title`}>Estudia el razonamiento</h3>
        <p><strong>Al terminar podrás:</strong> {info.goal}</p>
      </header>
      <RememberCard topic={topic} />
      <div className="lesson-reading-tabs" role="tablist" aria-label="Contenido de la lección">
        {tabs.map(([key, label, Icon], i) => (
          <button key={key} id={`${id}-${key}`} role="tab" aria-selected={active === key}
            aria-controls={`${id}-panel`} tabIndex={active === key ? 0 : -1}
            onClick={() => select(key)} onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
              if (event.key === "ArrowLeft") next = (i + tabs.length - 1) % tabs.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = tabs.length - 1;
              if (next === undefined) return;
              event.preventDefault();
              select(tabs[next][0]);
              document.getElementById(`${id}-${tabs[next][0]}`)?.focus();
            }}>
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div ref={panel} id={`${id}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${id}-${active}`} className="lesson-reading-panel">
        {active === "concepts" && <>
          <div className="lesson-prose">
            {info.sections.map((section, i) => <section key={section.title}>
              <h4><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{section.title}</h4>
              {section.paragraphs.map((paragraph) => <p key={paragraph}><Rich text={paragraph} /></p>)}
            </section>)}
          </div>
          <div className="lesson-table-wrap" tabIndex={0} role="region" aria-label="Comparación de conceptos">
            <table className="lesson-table">
              <caption>Relaciona los conceptos</caption>
              <thead><tr>{info.comparison.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
              <tbody>{info.comparison.rows.map((row) => <tr key={row[0]}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <details className="lesson-glossary">
            <summary>Vocabulario del tema · {info.terms.length} conceptos explicados</summary>
            <dl>{info.terms.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>
          </details>
          <div className="lesson-reading-next"><p>Ahora aplica la explicación a un caso.</p><button className="study-primary" onClick={() => { select("example"); panel.current?.focus(); }}>Leer el ejemplo resuelto</button></div>
        </>}
        {active === "example" && <article className="lesson-worked-example">
          <span className="lesson-step">EJEMPLO RAZONADO</span>
          <h4>{info.example.title}</h4>
          <p className="lesson-origin">{info.example.origin}</p>
          <div className="lesson-given"><strong>Datos y situación</strong><p>{info.example.given}</p></div>
          <ol className="lesson-worked-steps">{info.example.steps.map(([title, explanation], i) => <li key={title}><span className="lesson-step-number" aria-hidden="true">{i + 1}</span><div><h5>{title}</h5><p>{explanation}</p></div></li>)}</ol>
          <div className="lesson-conclusion"><strong>Qué puedes concluir</strong><p>{info.example.conclusion}</p></div>
          <div className="lesson-limit"><strong>Qué falta comprobar</strong><p>{info.example.limit}</p></div>
          <div className="lesson-reading-next"><button onClick={() => { select("review"); panel.current?.focus(); }}>Revisar errores frecuentes</button><button className="study-primary" onClick={goActivity}>Probar en la actividad <ArrowDown size={17} /></button></div>
        </article>}
        {active === "review" && <>
          <div className="lesson-prose"><h4>Aprende a corregir el razonamiento</h4><p>Localiza la idea equivocada y reconstruye la explicación. Acertar una alternativa tiene más valor cuando puedes justificarla.</p></div>
          <div className="lesson-mistakes">{info.errors.map(([error, correction]) => <article key={error}><h4>{error}</h4><p><strong>Cómo corregirlo:</strong> {correction}</p></article>)}</div>
          <section className="lesson-reflection">
            <h4>Explícalo con tus palabras</h4>
            <p id={`${id}-question`}>{info.question}</p>
            <label htmlFor={`${id}-reflection`}>Tu explicación de estudio</label>
            <textarea id={`${id}-reflection`} aria-describedby={`${id}-question ${id}-reflection-help`} rows={5} maxLength={20000}
              placeholder="Escribe qué ocurre, por qué y qué puedes concluir…"
              value={draft.reflection || ""} onChange={(event) => onDraft({ ...draft, reflection: event.target.value })} />
            <p className="lesson-input-help" id={`${id}-reflection-help`}>Se guarda en este navegador. Esta reflexión no recibe nota automática.</p>
            <details className="lesson-model-answer"><summary>Comparar con una explicación razonada</summary><p>{info.answer}</p><p>Comprueba si tu respuesta identifica el concepto, explica la causa y reconoce los límites del resultado.</p></details>
          </section>
          <div className="lesson-experiment"><strong>Prueba y explica el cambio</strong><p>{info.experiment}</p><button className="study-primary" onClick={goActivity}>Ir a la actividad <ArrowDown size={17} /></button></div>
        </>}
      </div>
      <div className="lesson-source-note"><Source slides={slides} /><p>Explicación ampliada para estudiar a partir del material del docente. Los supuestos adicionales se identifican en cada ejemplo.</p></div>
    </section>
  );
}
