import { useEffect, useRef, useState } from "react";
import {
  Zap,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Shield,
  Settings,
  Lightbulb,
  ChartNoAxesColumnIncreasing,
  Check,
  ClipboardList,
} from "lucide-react";
import { Activity } from "./Activity";
import { Practice } from "./Practice";
import { ExamView, Source } from "./ExamView";
import { content } from "./lessonContent";
import {
  STORAGE_KEY,
  freshState,
  readState,
  lessons,
  alternatives,
  themeFor,
  topicFor,
  newExam,
  lessonStatus,
  type StudyState,
  type Screen,
  type Exam,
  type Progress,
} from "./model";

export default function StudyApp() {
  const [state, setState] = useState<StudyState>(freshState),
    [ready, setReady] = useState(false),
    [saveError, setSaveError] = useState(""),
    [blocked, setBlocked] = useState(false),
    [reset, setReset] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(readState(JSON.parse(raw)));
    } catch {
      setSaveError(
        "No se pudo recuperar el progreso de estudio. El guardado anterior se conserva. Puedes exportarlo o reiniciar solo este módulo.",
      );
      setBlocked(true);
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    if (!ready || blocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError("");
    } catch {
      setSaveError(
        "El navegador no pudo guardar el estudio. Exporta tu progreso antes de cerrar.",
      );
    }
  }, [state, ready, blocked]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (ready) heading.current?.focus({ preventScroll: true });
  }, [state.screen, state.lesson, ready]);
  useEffect(() => {
    if (ready && ["lesson", "practice"].includes(state.screen))
      setState((s) =>
        s.progress[s.lesson]?.started
          ? s
          : {
              ...s,
              progress: {
                ...s.progress,
                [s.lesson]: {
                  ...(s.progress[s.lesson] || { correct: [] }),
                  started: true,
                },
              },
            },
      );
  }, [ready, state.lesson, state.screen]);
  const lesson = lessons.find((l) => l.id === state.lesson)!,
    info = content[lesson.id],
    progress = state.progress[lesson.id],
    reviewed = Object.values(state.progress).filter((p) => p.reviewed).length;
  const setExamId = (id: string) =>
    setState((s) => ({ ...s, examId: id || undefined }));
  const currentExam =
    state.exams.find((e) => e.id === state.examId) || state.exams.at(-1);
  const activeExam = state.exams.find((e) => e.stage !== "submitted");
  const navigate = (screen: Screen, topic = state.lesson) => {
    setState((s) => ({ ...s, screen, lesson: topic }));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const changeProgress = (fn: (p: Progress) => Progress) =>
    setState((s) => ({
      ...s,
      progress: {
        ...s.progress,
        [s.lesson]: fn(s.progress[s.lesson] || { correct: [] }),
      },
    }));
  const record = (correct: boolean, item: string) =>
    setState((s) => {
      const p = s.progress[s.lesson] || { correct: [] };
      return {
        ...s,
        progress: {
          ...s.progress,
          [s.lesson]: {
            ...p,
            attempted: true,
            activity: p.activity || (correct && !item.startsWith("ALT-")),
            correct:
              correct && item.startsWith("ALT-")
                ? [...new Set([...p.correct, item])]
                : p.correct,
          },
        },
        attempts: [
          ...s.attempts,
          {
            id: crypto.randomUUID(),
            topic: s.lesson,
            item,
            correct,
            at: new Date().toISOString(),
          },
        ],
      };
    });
  const updateExam = (e: Exam) =>
    setState((s) => ({
      ...s,
      exams: s.exams.map((old) => (old.id === e.id ? e : old)),
    }));
  const beginExam = () => {
    if (activeExam) {
      setExamId(activeExam.id);
      return;
    }
    const e = newExam(state.exams.at(-1));
    setState((s) => ({ ...s, exams: [...s.exams, e], screen: "exam" }));
    setExamId(e.id);
  };
  const exportProgress = () => {
    let text = JSON.stringify(state, null, 2);
    if (blocked) {
      try {
        text = localStorage.getItem(STORAGE_KEY) || text;
      } catch {}
    }
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "panellab-estudio-progreso.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const failures = state.attempts.filter((a) => !a.correct);
  const photoSlide: Record<string, number> = {
    "objetivos-fallas": 4,
    coordinacion: 1,
    termomagnetico: 8,
    fusibles: 10,
    conductores: 1,
    guardamotor: 3,
    "tierra-sobretension": 14,
    "motor-trifasico": 15,
  };
  return (
    <div className="app-shell study-shell">
      <header className="topbar">
        <a href="/" className="brand-wrap" aria-label="PanelLab · inicio">
          <div className="brand-icon">
            <Zap size={20} fill="currentColor" />
          </div>
          <div className="brand-caption">
            <strong>
              panel<span>lab</span>
            </strong>
            <small>INACAP · CONTROL</small>
          </div>
        </a>
        <div className="top-spacer" />
        <a href="/" className="study-top-link">
          Inicio
        </a>
        <a href="/?view=simulator" className="study-top-link">
          Simulador
        </a>
      </header>
      <main className="study-main">
        <div className="eyebrow">MÁQUINAS ROTATORIAS · INACAP</div>
        <h1>
          Estudiar protecciones<span className="header-period">.</span>
        </h1>
        <p className="study-lead">
          Explora los temas, entiende los componentes y practica antes de
          evaluar.
        </p>
        {!ready ? (
          <p role="status">Recuperando tu estudio…</p>
        ) : (
          <>
            {saveError && (
              <div role="alert" className="study-feedback study-error">
                {saveError}
                <button onClick={exportProgress}>Exportar progreso</button>
                <button onClick={() => setReset(true)}>
                  Reiniciar estudio
                </button>
              </div>
            )}
            <div className="study-layout">
              <aside className="study-sidebar">
                <h2>Temas</h2>
                <label className="study-mobile-topics">
                  Elegir tema
                  <select
                    value={
                      state.screen === "exam"
                        ? "exam"
                        : state.screen === "progress"
                          ? "progress"
                          : state.lesson
                    }
                    onChange={(e) =>
                      e.target.value === "exam" || e.target.value === "progress"
                        ? navigate(e.target.value)
                        : navigate("lesson", e.target.value)
                    }
                  >
                    {lessons.map((l, i) => (
                      <option key={l.id} value={l.id}>
                        {i + 1}. {l.title}
                      </option>
                    ))}
                    <option value="exam">Evaluarme</option>
                    <option value="progress">Mi progreso</option>
                  </select>
                </label>
                <nav aria-label="Temas de estudio">
                  {lessons.map((l, i) => (
                    <button
                      key={l.id}
                      aria-current={
                        state.lesson === l.id &&
                        ["lesson", "practice"].includes(state.screen)
                          ? "page"
                          : undefined
                      }
                      onClick={() => navigate("lesson", l.id)}
                    >
                      <span className="topic-number">
                        {state.progress[l.id]?.reviewed ? (
                          <Check size={17} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span>
                        {l.title}
                        <small>{lessonStatus(state.progress[l.id])}</small>
                      </span>
                    </button>
                  ))}
                  <button
                    aria-current={state.screen === "exam" ? "page" : undefined}
                    onClick={() => navigate("exam")}
                  >
                    <ClipboardList size={21} /> Evaluarme
                  </button>
                  <button
                    aria-current={
                      state.screen === "progress" ? "page" : undefined
                    }
                    onClick={() => navigate("progress")}
                  >
                    <ChartNoAxesColumnIncreasing size={21} /> Mi progreso
                  </button>
                </nav>
              </aside>
              <div className="study-content">
                <section className="study-card study-lesson">
                  <div className="study-card-heading">
                    <div>
                      <h2 ref={heading} tabIndex={-1}>
                        {state.screen === "exam"
                          ? "Evaluarme"
                          : state.screen === "progress"
                            ? "Mi progreso"
                            : `${state.screen === "practice" ? "Practicar · " : ""}${lesson.title}`}
                      </h2>
                      <p>
                        {state.screen === "lesson"
                          ? info.intro
                          : state.screen === "practice"
                            ? "Resuelve, explica el error y vuelve a intentarlo."
                            : state.screen === "exam"
                              ? "Simulacro de 8 alternativas y 3 preguntas de desarrollo."
                              : "Tu recorrido de estudio en este navegador."}
                      </p>
                    </div>
                    {state.screen === "practice" && (
                      <button onClick={() => navigate("lesson")}>
                        <ArrowLeft size={16} /> Volver a la lección
                      </button>
                    )}
                  </div>
                  {state.screen === "lesson" && (
                    <>
                      <div className="study-lesson-grid">
                        <figure className="study-photo">
                          <img
                            src={`/estudio/fotos/${info.image}`}
                            alt={`Fotografía del material docente para ${lesson.title}`}
                            loading="lazy"
                          />
                          <figcaption>
                            Fotografía del material docente · lámina{" "}
                            {photoSlide[lesson.id]}
                            {lesson.id === "guardamotor"
                              ? " · Motor como contexto del ajuste; no es una foto de guardamotor."
                              : ""}
                            {lesson.id === "conductores"
                              ? " · Tablero como contexto; la fotografía no determina la capacidad de sus conductores."
                              : ""}
                          </figcaption>
                        </figure>
                        <div className="study-explanations">
                          <article>
                            <Shield size={24} />
                            <div>
                              <h3>Qué hace</h3>
                              <p>{info.what}</p>
                            </div>
                          </article>
                          <article>
                            <Settings size={24} />
                            <div>
                              <h3>Cómo funciona</h3>
                              <p>{info.how}</p>
                            </div>
                          </article>
                          <div className="study-inline-activity">
                            <Activity
                              key={lesson.id}
                              topic={lesson.id}
                              draft={state.drafts[lesson.id] || {}}
                              onDraft={(d) =>
                                setState((s) => ({
                                  ...s,
                                  drafts: { ...s.drafts, [s.lesson]: d },
                                }))
                              }
                              onResult={record}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="study-actions">
                        <button
                          className="study-primary"
                          onClick={() => navigate("practice")}
                        >
                          <BookOpen size={18} /> Practicar este tema{" "}
                          <ArrowRight size={18} />
                        </button>
                        <button
                          onClick={() => {
                            changeProgress((p) => ({ ...p, reviewed: true }));
                            navigate(
                              "lesson",
                              lessons[
                                (lessons.indexOf(lesson) + 1) % lessons.length
                              ].id,
                            );
                          }}
                        >
                          Marcar revisado y seguir <ArrowRight size={18} />
                        </button>
                      </div>
                      <details className="study-details">
                        <summary>
                          Criterios de selección y errores frecuentes
                        </summary>
                        <h3>Qué revisar</h3>
                        <p>{info.choose}</p>
                        <h3>Error frecuente</h3>
                        <p>{info.error}</p>
                        <p>
                          <strong>Objetivo: </strong>
                          {lesson.learning_outcome}
                        </p>
                      </details>
                      <Source slides={lesson.slides} />
                    </>
                  )}
                  {state.screen === "practice" && (
                    <Practice
                      key={lesson.id}
                      topic={lesson.id}
                      draft={state.drafts[lesson.id] || {}}
                      answers={state.practiceAnswers}
                      progress={progress}
                      onDraft={(d) =>
                        setState((s) => ({
                          ...s,
                          drafts: { ...s.drafts, [s.lesson]: d },
                        }))
                      }
                      onAnswer={(id, value) =>
                        setState((s) => ({
                          ...s,
                          practiceAnswers: {
                            ...s.practiceAnswers,
                            [id]: value,
                          },
                        }))
                      }
                      onResult={record}
                    />
                  )}
                  {state.screen === "exam" && (
                    <ExamView
                      key={currentExam?.id || "intro"}
                      exam={currentExam}
                      history={state.exams}
                      onChange={updateExam}
                      onNew={beginExam}
                      onOpen={(id) => setExamId(id)}
                      onTopic={(id) => navigate("lesson", id)}
                    />
                  )}
                  {state.screen === "progress" && (
                    <>
                      <p>
                        {reviewed} de 8 temas revisados ·{" "}
                        {state.attempts.length} intentos de práctica ·{" "}
                        {
                          state.exams.filter((e) => e.stage === "submitted")
                            .length
                        }{" "}
                        simulacros enviados.
                      </p>
                      <p className="study-note">
                        Un tema se considera dominado cuando lo marcas revisado,
                        resuelves una actividad y compruebas correctamente sus
                        cuatro alternativas. El progreso representa práctica
                        local, no certificación.
                      </p>
                      <div className="study-progress-list">
                        {lessons.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => navigate("lesson", l.id)}
                          >
                            <span>{l.title}</span>
                            <strong>
                              {lessonStatus(state.progress[l.id])}
                            </strong>
                          </button>
                        ))}
                      </div>
                      <h3>Errores para repasar</h3>
                      {failures.length === 0 ? (
                        <p>Aún no hay errores registrados.</p>
                      ) : (
                        <ul>
                          {failures
                            .slice(-20)
                            .reverse()
                            .map((a) => (
                              <li key={a.id}>
                                <button
                                  className="study-text-button"
                                  onClick={() => navigate("practice", a.topic)}
                                >
                                  {alternatives.find((q) => q.id === a.item)
                                    ?.question ||
                                    `Actividad de ${lessons.find((l) => l.id === a.topic)?.title}`}{" "}
                                  · volver a practicar
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                      <h3>Simulacros guardados</h3>
                      {state.exams.length === 0 ? (
                        <p>Aún no has comenzado uno.</p>
                      ) : (
                        state.exams
                          .slice()
                          .reverse()
                          .map((e) => (
                            <button
                              className="history-row"
                              key={e.id}
                              onClick={() => {
                                setExamId(e.id);
                                navigate("exam");
                              }}
                            >
                              {new Date(e.started).toLocaleString("es-CL")} ·{" "}
                              {e.stage === "submitted"
                                ? "Ver resultado"
                                : "Continuar"}
                            </button>
                          ))
                      )}
                      <div className="study-actions">
                        <button onClick={exportProgress}>
                          Exportar progreso de estudio
                        </button>
                        <label className="study-import">
                          Importar progreso
                          <input
                            type="file"
                            accept="application/json,.json"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (!f) return;
                              try {
                                if (f.size > 5_000_000) throw Error();
                                setState(readState(JSON.parse(await f.text())));
                                setBlocked(false);
                                setSaveError("");
                              } catch {
                                setSaveError(
                                  "El archivo no es un progreso válido de este módulo. El estado actual se conserva.",
                                );
                              }
                            }}
                          />
                        </label>
                        <button onClick={() => setReset(true)}>
                          Reiniciar solo estudio
                        </button>
                      </div>
                    </>
                  )}
                </section>
                {["lesson", "practice"].includes(state.screen) && (
                  <div className="study-bottom">
                    <aside className="study-card study-key">
                      <Lightbulb size={26} />
                      <div>
                        <h3>Dato clave</h3>
                        <p>{info.key}</p>
                      </div>
                    </aside>
                    <aside className="study-card">
                      <h3>Progreso</h3>
                      <p>{reviewed} de 8 temas revisados</p>
                      <progress
                        value={reviewed}
                        max={8}
                        aria-label="Temas revisados"
                      />
                      <strong>{Math.round((reviewed / 8) * 100)}%</strong>
                      <p>
                        {lessonStatus(progress)} ·{" "}
                        {progress?.correct.length || 0}/4 alternativas
                      </p>
                      <button
                        className="study-text-button"
                        onClick={() =>
                          changeProgress((p) => ({ ...p, reviewed: true }))
                        }
                      >
                        Marcar este tema revisado
                      </button>
                    </aside>
                  </div>
                )}
              </div>
            </div>
            <footer className="study-footer">
              <span role="status">
                {saveError
                  ? "Guardado requiere atención"
                  : blocked
                    ? "Guardado detenido"
                    : "Progreso guardado en este navegador"}
              </span>
              <a href="/estudio/profesor.pdf" target="_blank" rel="noreferrer">
                Material de José Alfredo Lepin Quezada · 07/10/2026 ↗
              </a>
              <span>
                Material educativo de estudio. No es un procedimiento para
                intervenir equipos energizados.
              </span>
            </footer>
            {reset && (
              <div className="study-reset" role="alert">
                <p>
                  Se reiniciará únicamente el progreso de protecciones de este
                  navegador.
                </p>
                <div className="study-actions">
                  <button onClick={() => setReset(false)}>Cancelar</button>
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem(STORAGE_KEY);
                        setState(freshState());
                        setBlocked(false);
                        setSaveError("");
                        setExamId("");
                        setReset(false);
                      } catch {
                        setSaveError(
                          "El navegador no permite reiniciar el guardado.",
                        );
                      }
                    }}
                  >
                    Confirmar reinicio de estudio
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
