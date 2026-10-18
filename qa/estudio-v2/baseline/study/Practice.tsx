import { useState } from "react";
import { Activity } from "./Activity";
import { alternatives, themeFor, type Draft, type Progress } from "./model";
import { content } from "./lessonContent";

export function Practice({
  topic,
  draft,
  answers,
  progress,
  onDraft,
  onAnswer,
  onResult,
}: {
  topic: string;
  draft: Draft;
  answers: Record<string, string>;
  progress?: Progress;
  onDraft: (d: Draft) => void;
  onAnswer: (id: string, value: string) => void;
  onResult: (correct: boolean, item: string) => void;
}) {
  const [feedback, setFeedback] = useState<
      Record<string, { ok: boolean; text: string }>
    >({}),
    [hints, setHints] = useState<Record<string, number>>({}),
    [error, setError] = useState("");
  const questions = alternatives.filter((q) => q.theme === themeFor(topic));
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
      <p className="study-note">
        Práctica elaborada para estudiar; no son preguntas oficiales. Puedes
        modificar los valores, usar pistas y reintentar.
      </p>
      <Activity
        topic={topic}
        draft={draft}
        onDraft={onDraft}
        onResult={onResult}
        practice
      />
      <h3>
        Aplica lo aprendido · {progress?.correct.length || 0} de 4 comprobadas
      </h3>
      {error && (
        <p role="alert" className="study-error">
          {error}
        </p>
      )}
      {questions.map((q, index) => (
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
                {o}
              </label>
            ))}
          </fieldset>
          <div className="study-actions">
            <button onClick={() => check(q.id)}>
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
              {feedback[q.id].text}
            </p>
          )}
        </section>
      ))}
    </>
  );
}
