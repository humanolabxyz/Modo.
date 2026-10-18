import { useEffect, useState } from "react";
import { alternatives, developments, topicFor, type Exam } from "./model";
import { ArrowRight, LockKeyhole, ClipboardList } from "lucide-react";
import { topicAssets } from "./LessonMedia";
import { shortTitles } from "./StudyNavigation";
type Grading = typeof import("./grading");
export function ExamView({
  exam,
  history,
  onChange,
  onNew,
  onOpen,
  onTopic,
}: {
  exam?: Exam;
  history: Exam[];
  onChange: (e: Exam) => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onTopic: (id: string) => void;
}) {
  const [confirmed, setConfirmed] = useState(false),
    [grading, setGrading] = useState<Grading | null>(null),
    [error, setError] = useState(""),
    [onlyWrong, setOnlyWrong] = useState(false);
  useEffect(() => {
    let active = true;
    setConfirmed(false);
    setGrading(null);
    setError("");
    if (exam?.stage === "submitted")
      import("./grading")
        .then((m) => {
          if (active) setGrading(m);
        })
        .catch(() => {
          if (active)
            setError(
              "No se pudo cargar la corrección. Recarga para reintentar.",
            );
        });
    return () => {
      active = false;
    };
  }, [exam?.id, exam?.stage]);
  const ids = exam ? [...exam.alternatives, ...exam.developments] : [];
  const pending = exam
    ? ids.filter((id) => !exam.answers[id]?.trim()).length
    : 11;
  const update = (change: Partial<Exam>) => {
    if (exam && exam.stage !== "submitted") onChange({ ...exam, ...change });
  };
  if (!exam)
    return (
      <section className="study-exam-intro">
        <div className="exam-intro-hero">
          <div>
            <h3>Comprueba lo que aprendiste</h3>
            <p>
              Un simulacro para reconocer componentes, resolver cálculos y
              explicar tus decisiones. Sin tiempo obligatorio: avanza a tu
              ritmo.
            </p>
          </div>
          <div className="exam-component-gallery" aria-hidden="true">
            <img src={topicAssets.termomagnetico} alt="" />
            <img src={topicAssets.fusibles} alt="" />
          </div>
        </div>
        <section className="exam-topics-covered" aria-label="Temas que cubre el simulacro">
          <h4>Esta evaluación cubre los 8 temas</h4>
          <ol>
            {Object.entries(shortTitles).map(([id, title], i) => (
              <li key={id} data-topic={id}><span>{i + 1}</span>{title}</li>
            ))}
          </ol>
          <p>Las 8 alternativas recorren los 8 temas, una por cada tema. Los 3 desarrollos se sortean entre esos mismos temas.</p>
        </section>
        <div className="exam-format-row">
          <div>
            <strong>08</strong>
            <small>
              Preguntas de alternativas
              <br />
              Una por cada tema
            </small>
          </div>
          <div>
            <strong>03</strong>
            <small>
              Preguntas de desarrollo
              <br />
              Explica el razonamiento
            </small>
          </div>
          <div>
            <strong>A tu ritmo</strong>
            <small>
              Puedes volver y continuar
              <br />
              Se conserva el intento
            </small>
          </div>
        </div>
        <p className="exam-quiet-note">
          <LockKeyhole size={18} /> Durante el intento no se muestran pistas ni
          pautas. Al enviar verás la corrección de alternativas y una rúbrica
          para revisar tus desarrollos.
        </p>
        <p className="exam-calc-note">
          <strong>Calculadora disponible:</strong> durante el simulacro tendrás el botón «Calculadora» abajo a la derecha. Practica con ella en el módulo «Cálculos».
        </p>
        <p className="study-note">
          Preguntas elaboradas para practicar; no son preguntas oficiales. Los
          desarrollos no reciben una nota automática por coincidencia de texto.
        </p>
        <button className="study-primary" onClick={onNew}>
          Comenzar simulacro · 8 + 3 <ArrowRight size={18} />
        </button>
        <ExamHistory exams={history} onOpen={onOpen} />
      </section>
    );
  if (exam.stage === "submitted") {
    if (!grading) return <p role="status">{error || "Cargando corrección…"}</p>;
    const score = exam.alternatives.filter((id) =>
      grading.gradeAlternative(id, exam.answers[id]),
    ).length;
    const wrong = exam.alternatives.filter(
      (id) => !grading.gradeAlternative(id, exam.answers[id]),
    );
    return (
      <section className="study-results">
        <div className="exam-result-hero">
          <div className="result-ring">
            <svg viewBox="0 0 140 140" aria-hidden="true">
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="7"
              />
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke="#3a3a3a"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${(score / 8) * 364.425} 364.425`}
              />
            </svg>
            <output className="exam-score">
              {score} / 8 <small>{(score / 8) * 100}% de aciertos</small>
            </output>
          </div>
          <div>
            <h3>Resultado de alternativas</h3>
            <p>
              {wrong.length
                ? `${wrong.length} ${wrong.length === 1 ? "tema para volver a mirar" : "temas para volver a mirar"}. Revisa la explicación y vuelve a practicar.`
                : "Has respondido correctamente las ocho alternativas. Revisa ahora tus desarrollos."}
            </p>
            <p>
              Práctica no oficial ·{" "}
              {new Date(exam.submitted!).toLocaleString("es-CL")}
            </p>
          </div>
        </div>
        <p className="study-note">
          Los desarrollos se revisan por separado mediante rúbrica. No se
          calcula una nota global automática.
        </p>
        {wrong.length > 0 && (
          <div className="study-actions">
            {wrong.map((id) => {
              const q = alternatives.find((q) => q.id === id)!;
              return (
                <button key={id} onClick={() => onTopic(topicFor(q.theme))}>
                  Repasar {shortTitles[topicFor(q.theme)] || q.theme}
                </button>
              );
            })}
          </div>
        )}
        <label className="study-check">
          <input
            type="checkbox"
            checked={onlyWrong}
            onChange={(e) => setOnlyWrong(e.target.checked)}
          />{" "}
          Mostrar solo errores de alternativas
        </label>
        {exam.alternatives
          .filter((id) => !onlyWrong || wrong.includes(id))
          .map((id, i) => {
            const q = grading.answerBank.find((q) => q.id === id)!;
            const response = exam.answers[id];
            const ok = grading.gradeAlternative(id, response);
            return (
              <article className="study-question" key={id}>
                <h4>
                  {i + 1}. {q.question}
                </h4>
                <p className={ok ? "study-success" : "study-error"}>
                  {ok ? "Correcta" : "Por repasar"} · Tu respuesta:{" "}
                  {response === undefined
                    ? "Sin responder"
                    : q.options[Number(response)]}
                </p>
                <p>
                  <strong>Respuesta: </strong>
                  {q.options[q.correct_index]}
                </p>
                <p>{q.explanation}</p>
                <Source slides={q.slides} />
              </article>
            );
          })}
        <h3>Desarrollos · autoevaluación por rúbrica</h3>
        <p>
          Marca solo los criterios que tu respuesta demuestra. Las marcas
          expresan tu propia revisión; no son una calificación del profesor.
        </p>
        {exam.developments.map((id, i) => {
          const q = grading.developmentBank.find((q) => q.id === id)!;
          return (
            <article className="study-question" key={id}>
              <h4>
                {i + 1}. {q.prompt}
              </h4>
              <p className="saved-development">
                {exam.answers[id] || "Sin responder"}
              </p>
              <p>
                <strong>Pauta orientativa: </strong>
                {q.model_answer}
              </p>
              {q.rubric.map((r, j) => (
                <label className="study-check" key={r}>
                  <input
                    type="checkbox"
                    checked={exam.self[`${id}:${j}`] || false}
                    onChange={(e) =>
                      onChange({
                        ...exam,
                        self: {
                          ...exam.self,
                          [`${id}:${j}`]: e.target.checked,
                        },
                      })
                    }
                  />
                  {r}
                </label>
              ))}
              <Source slides={q.slides} />
            </article>
          );
        })}
        <button className="study-primary" onClick={onNew}>
          Nuevo simulacro
        </button>
        <ExamHistory exams={history} onOpen={onOpen} />
      </section>
    );
  }
  if (exam.stage === "review")
    return (
      <section className="study-exam-review">
        <div className="exam-attempt-header">
          <div>
            <strong>Última revisión</strong>
            <small>
              Tus respuestas siguen abiertas hasta confirmar el envío.
            </small>
          </div>
          <ClipboardList size={23} />
        </div>
        <h3>Revisión antes de enviar</h3>
        <p>
          {11 - pending} de 11 respondidas · {pending} pendientes. Puedes volver
          a cualquier pregunta.
        </p>
        <ol className="exam-review">
          {ids.map((id, i) => {
            const q = alternatives.find((q) => q.id === id);
            const dev = developments.find((q) => q.id === id);
            return (
              <li key={id}>
                <button onClick={() => update({ stage: "ongoing", index: i })}>
                  <b>
                    {i + 1}. {q?.question || dev?.prompt}
                  </b>
                  <span>
                    {!exam.answers[id]?.trim()
                      ? "Pendiente"
                      : q
                        ? q.options[Number(exam.answers[id])]
                        : "Desarrollo guardado"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <label className="study-check">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />{" "}
          Confirmo el envío
          {pending ? ` con ${pending} respuestas pendientes` : ""}. Las
          respuestas quedarán cerradas.
        </label>
        <div className="study-actions">
          <button onClick={() => update({ stage: "ongoing" })}>
            Seguir respondiendo
          </button>
          <button
            className="study-primary"
            disabled={!confirmed}
            onClick={() => {
              if (confirmed)
                update({
                  stage: "submitted",
                  submitted: new Date().toISOString(),
                });
            }}
          >
            Enviar y corregir
          </button>
        </div>
      </section>
    );
  const id = ids[exam.index],
    alt = alternatives.find((q) => q.id === id),
    dev = developments.find((q) => q.id === id);
  return (
    <section className="study-exam">
      <div className="exam-attempt-header">
        <div>
          <strong>
            Pregunta {exam.index + 1} de 11 ·{" "}
            {exam.index < 8 ? "Alternativas" : "Desarrollo"}
          </strong>
          <small>
            Simulacro no oficial · {11 - pending} respuestas guardadas
          </small>
        </div>
        <span>8 alternativas + 3 desarrollos</span>
      </div>
      <nav className="exam-number-nav" aria-label="Preguntas del simulacro">
        {ids.map((q, i) => (
          <button
            key={q}
            data-answered={!!exam.answers[q]?.trim()}
            aria-current={i === exam.index ? "step" : undefined}
            aria-label={`Pregunta ${i + 1}${exam.answers[q]?.trim() ? " respondida" : " pendiente"}`}
            onClick={() => update({ index: i })}
          >
            {i + 1}
            {exam.answers[q]?.trim() ? " ✓" : ""}
          </button>
        ))}
      </nav>
      <div className="exam-question-body" key={id}>
        <p className="study-answer-instruction">{alt ? "Marca una sola alternativa. Se guarda al seleccionarla y puedes cambiarla antes de enviar el simulacro." : "Redacta tu respuesta en el recuadro. Si corresponde hacer un cálculo, incluye datos, operaciones, unidades y una conclusión. Se guarda mientras escribes."}</p>
        {alt ? (
          <fieldset className="study-options exam-options">
            <legend>{alt.question}</legend>
            {alt.options.map((o, i) => (
              <label key={o}>
                <span className="option-letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <input
                  type="radio"
                  name={id}
                  checked={exam.answers[id] === String(i)}
                  onChange={() =>
                    update({ answers: { ...exam.answers, [id]: String(i) } })
                  }
                />
                {o}
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="development-field">
            <strong>{dev?.prompt}</strong>
            <textarea
              rows={9}
              maxLength={20000}
              placeholder="Explica tu razonamiento con tus propias palabras…"
              value={exam.answers[id] || ""}
              onChange={(e) =>
                update({ answers: { ...exam.answers, [id]: e.target.value } })
              }
            />
            <small>
              {(exam.answers[id] || "").length} / 20000 caracteres · sin pauta
              durante el intento
            </small>
          </label>
        )}
      </div>
      <div className="study-actions">
        <button
          disabled={exam.index === 0}
          onClick={() => update({ index: exam.index - 1 })}
        >
          Anterior
        </button>
        <button
          disabled={exam.index === 10}
          onClick={() => update({ index: exam.index + 1 })}
        >
          Siguiente pregunta
        </button>
        <button
          className="study-primary"
          onClick={() => update({ stage: "review" })}
        >
          Revisar y enviar
        </button>
      </div>
    </section>
  );
}
function ExamHistory({
  exams,
  onOpen,
}: {
  exams: Exam[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="exam-history">
      <h3>Historial de simulacros</h3>
      {exams.length === 0 ? (
        <p>Aún no has realizado un simulacro.</p>
      ) : (
        exams
          .slice()
          .reverse()
          .map((e) => (
            <button key={e.id} onClick={() => onOpen(e.id)}>
              {new Date(e.started).toLocaleString("es-CL")} ·{" "}
              {e.stage === "submitted" ? "Ver resultado" : "Continuar intento"}
            </button>
          ))
      )}
    </div>
  );
}
export function Source({ slides }: { slides: number[] }) {
  return (
    <a
      className="study-source"
      href={`/estudio/profesor.pdf#page=${slides[0]}`}
      target="_blank"
      rel="noreferrer"
    >
      Fuente docente · lámina{slides.length > 1 ? "s" : ""} {slides.join(", ")}{" "}
      ↗
    </a>
  );
}
