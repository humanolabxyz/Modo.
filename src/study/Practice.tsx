import { useState } from "react";
import { Activity } from "./Activity";
import { alternatives, lessons, themeFor, type Draft, type Progress } from "./model";
import { shortTitles } from "./StudyNavigation";
import { TopicDone } from "./TopicDone";
import { Rich } from "./Rich";
import { content } from "./lessonContent";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Practice({
  topic,
  draft,
  answers,
  progress,
  onDraft,
  onAnswer,
  onResult,
  onLearn,
  allProgress,
  onTopic,
  onNext,
  index,
  last,
}: {
  topic: string;
  draft: Draft;
  answers: Record<string, string>;
  progress?: Progress;
  onDraft: (d: Draft) => void;
  onAnswer: (id: string, value: string) => void;
  onResult: (correct: boolean, item: string) => void;
  onLearn: () => void;
  allProgress: Record<string, Progress>;
  onTopic: (id: string) => void;
  onNext: () => void;
  index: number;
  last: boolean;
}) {
  const [feedback, setFeedback] = useState<
      Record<string, { ok: boolean; text: string }>
    >({}),
    [hints, setHints] = useState<Record<string, number>>({}),
    [error, setError] = useState("");
  const questions = alternatives.filter((q) => q.theme === themeFor(topic));
  const phase = draft.practiceTab === "activity" ? "activity" : "questions";
  const current = Math.max(0, Math.min(questions.length - 1, Number.parseInt(draft.practiceQuestion || "0", 10) || 0));
  const goQuestion = (index: number) => { onDraft({ ...draft, practiceQuestion: String(index) }); setError(""); };
  const setPhase = (value: string) => {
    onDraft({ ...draft, practiceTab: value });
    setError("");
  };
  async function check(id: string) {
    if (answers[id] === undefined) {
      setError("Selecciona una alternativa antes de comprobar.");
      return;
    }
    try {
      const { answerBank, gradeAlternative } = await import("./grading");
      const q = answerBank.find((q) => q.id === id)!;
      const ok = gradeAlternative(id, answers[id]);
      setFeedback((f) => ({
        ...f,
        [id]: {
          ok,
          text: `${ok ? "Correcto." : "Revisa tu respuesta."} ${q.explanation} Respuesta: ${q.options[q.correct_index]}`,
        },
      }));
      onResult(ok, id);
      setError("");
    } catch {
      setError("No se pudo abrir la corrección. Vuelve a comprobar.");
    }
  }
  return (
    <>
      <section className="practice-topics" aria-label="Elegir el tema que quieres practicar">
        <div className="practice-topics-head">
          <h3>Practica un tema a la vez</h3>
          <p>Elige un tema, haz su ejercicio y responde sus 4 preguntas. Cada tema se practica por separado.</p>
        </div>
        <ol>
          {lessons.map((l, i) => {
            const done = (allProgress[l.id]?.correct.length || 0) >= 4;
            return (
              <li key={l.id}>
                <button data-topic={l.id} aria-current={l.id === topic ? "true" : undefined} data-done={done || undefined} onClick={() => onTopic(l.id)}>
                  <span className="practice-topic-num">{done ? <CheckCircle2 size={16} /> : i + 1}</span>
                  <span className="practice-topic-name">{shortTitles[l.id]}</span>
                  <small>{allProgress[l.id]?.correct.length || 0}/4</small>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
      <p className="practice-caption">Preguntas para practicar · no oficiales. Resuelve una y entiende la corrección.</p>
      <nav className="practice-phase-nav" aria-label="Actividades del tema">
        <button
          aria-current={phase === "activity" ? "step" : undefined}
          onClick={() => setPhase("activity")}
        >
          <span>{progress?.activity ? <CheckCircle2 size={16} /> : 1}</span>
          <span>
            Ejercicio interactivo<small>Paso 1 · explora, calcula y comprueba</small>
          </span>
        </button>
        <button
          aria-current={phase === "questions" ? "step" : undefined}
          onClick={() => setPhase("questions")}
        >
          <span>2</span>
          <span>
            Preguntas del tema
            <small>Paso 2 · {progress?.correct.length || 0} de 4 comprobadas</small>
          </span>
        </button>
      </nav>
      {phase === "activity" ? (
        <div className="practice-phase-panel" key="activity">
          <Activity
            topic={topic}
            draft={draft}
            onDraft={onDraft}
            onResult={onResult}
            practice
          />
          <div className="practice-question-footer">
            <span>
              Cuando termines, aplica el concepto a nuevas situaciones.
            </span>
            <button
              className="study-primary"
              onClick={() => setPhase("questions")}
            >
              Ir a las preguntas <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="practice-phase-panel" key="questions">
          <div className="practice-single-heading"><span>Pregunta {current + 1} de {questions.length}</span><nav aria-label="Preguntas de práctica">{questions.map((q, i) => <button key={q.id} aria-label={`Ir a pregunta ${i + 1}`} aria-current={current === i ? "step" : undefined} onClick={() => goQuestion(i)}>{progress?.correct.includes(q.id) ? <CheckCircle2 size={16} /> : i + 1}</button>)}</nav></div>
          {error && (
            <p role="alert" className="study-error">
              {error}
            </p>
          )}
          {questions.map((q, index) => current === index && (
            <section className="study-question" key={q.id}>
              <fieldset className="study-options">
                <legend>
                  {index + 1}. {q.question}
                </legend>
                {q.options.map((o, i) => (
                  <label key={o}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === String(i)}
                      onChange={() => {
                        onAnswer(q.id, String(i));
                        setFeedback((f) => {
                          const next = { ...f };
                          delete next[q.id];
                          return next;
                        });
                      }}
                    />
                    <span className="option-letter" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o}
                  </label>
                ))}
              </fieldset>
              <div className="study-actions">
                <button className={feedback[q.id]?.ok ? "" : "study-primary"} onClick={() => check(q.id)}>
                  Comprobar alternativa {index + 1}
                </button>
                {(hints[q.id] || 0) < 3 && (
                  <button
                    onClick={() =>
                      setHints((h) => ({ ...h, [q.id]: (h[q.id] || 0) + 1 }))
                    }
                  >
                    Pista {(hints[q.id] || 0) + 1} de 3
                  </button>
                )}
              </div>
              {hints[q.id] > 0 && (
                <p className="study-hints">
                  {hints[q.id] === 1
                    ? `Ubica el concepto en la lámina ${q.slides.join(", ")} del docente.`
                    : hints[q.id] === 2
                      ? content[topic].what
                      : content[topic].choose}
                </p>
              )}
              {feedback[q.id] && (
                <p
                  role="status"
                  className={
                    feedback[q.id].ok
                      ? "study-feedback study-success"
                      : "study-feedback study-error"
                  }
                >
                  <Rich text={feedback[q.id].text} />
                </p>
              )}
            </section>
          ))}
          {(progress?.correct.length || 0) >= questions.length && (
            <TopicDone
              topic={topic}
              title={`¡Practicaste el tema ${index + 1}!`}
              text={last ? "Acertaste las 4 preguntas del último tema. Ya puedes evaluarte con los 8 temas." : "Acertaste las 4 preguntas de este tema. Sigue con el siguiente cuando quieras."}
              primary={last ? "Ir a la evaluación" : "Practicar el siguiente tema"}
              primarySub={last ? "Simulacro de los 8 temas" : `Tema ${index + 2} · ${shortTitles[lessons[index + 1].id]}`}
              onPrimary={onNext}
              secondary="Volver a la lección"
              onSecondary={onLearn}
            />
          )}
          <div className="practice-question-footer">
            <button disabled={current === 0} onClick={() => goQuestion(current - 1)}>Anterior</button>
            <span>{progress?.correct.length || 0} de 4 comprobadas</span>
            <button className={feedback[questions[current].id]?.ok ? "study-primary" : ""} onClick={() => current < questions.length - 1 ? goQuestion(current + 1) : onLearn()}>{current < questions.length - 1 ? "Siguiente pregunta" : "Volver al tema"}<ArrowRight size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
}
