import {LogoModo} from '../components/LogoModo';
import {LegalLink} from '../components/LegalLink';
import { useEffect, useRef, useState } from "react";
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  Shield,
  BookOpen,
  ClipboardList,
  Calculator,
} from "lucide-react";
import { Practice } from "./Practice";
import { ExamView } from "./ExamView";
import { StudyNavigation, StudyTabs, shortTitles } from "./StudyNavigation";
import { LessonJourney } from "./LessonJourney";
import { CalcModule } from "./CalcModule";
import { CalculatorDock } from "./CalculatorDock";
import { trapDialogTab } from "./dialog";
import { direction, motion } from "../motion/transition";
const SCREEN_ORDER: Screen[] = ["lesson", "practice", "progress", "calc", "exam"];
import {
  STORAGE_KEY,
  freshState,
  readState,
  lessons,
  alternatives,
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
  const resetDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (reset) resetDialog.current?.showModal();
  }, [reset]);
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
    progress = state.progress[lesson.id],
    reviewed = Object.values(state.progress).filter((p) => p.reviewed).length;
  const setExamId = (id: string) =>
    setState((s) => ({ ...s, examId: id || undefined }));
  const currentExam =
    state.exams.find((e) => e.id === state.examId) || state.exams.at(-1);
  const activeExam = state.exams.find((e) => e.stage !== "submitted");
  const navigate = (screen: Screen, topic = state.lesson) => {
    const lessonIndex = (id: string) => lessons.findIndex((l) => l.id === id);
    const dir = screen === state.screen
      ? direction(lessonIndex(state.lesson), lessonIndex(topic))
      : direction(SCREEN_ORDER.indexOf(state.screen), SCREEN_ORDER.indexOf(screen));
    motion(() => {
      setState((s) => ({ ...s, screen, lesson: topic }));
      window.scrollTo({ top: 0, behavior: "instant" });
    }, "stage", dir);
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
    a.download = "modo-estudio-progreso.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const latestAttempts = new Map(
    state.attempts.map((a) => [`${a.topic}:${a.item}`, a]),
  );
  const failures = [...latestAttempts.values()]
    .filter((a) => !a.correct)
    .sort((a, b) => a.at.localeCompare(b.at));
  return (
    <div className="app-shell study-shell study-focus-shell" data-topic={state.lesson} data-module={state.screen === "exam" ? "exam" : state.screen === "calc" ? "calc" : "study"}>
      <header className="topbar study-header">
        <a href="/" className="brand-wrap" aria-label="modo. · inicio">
          <LogoModo/>
        </a>
        <div className="study-header-context">
          Máquinas rotatorias <span>/</span> Protecciones eléctricas
        </div>
        <div className="top-spacer" />
        <LegalLink/>
        <a href="/" className="study-top-link">
          Inicio
        </a>
        <a href="/?view=simulator" className="study-top-link">
          Simulador
        </a>
      </header>
      <main className="study-main">
        <div className="study-course-title"><h1>Protecciones eléctricas</h1><span>INACAP · Material de estudio</span></div>
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
            <nav className="study-modules" aria-label="Módulos">
              <button
                aria-current={state.screen !== "exam" && state.screen !== "calc" ? "page" : undefined}
                onClick={() => navigate(state.screen === "exam" || state.screen === "calc" ? "lesson" : state.screen)}
              >
                <BookOpen size={22} />
                <span><strong>Estudiar</strong><small>Aprende y practica cada tema</small></span>
              </button>
              <button
                aria-current={state.screen === "calc" ? "page" : undefined}
                onClick={() => navigate("calc")}
              >
                <Calculator size={22} />
                <span><strong>Cálculos</strong><small>Calculadora y fórmulas</small></span>
              </button>
              <button
                aria-current={state.screen === "exam" ? "page" : undefined}
                onClick={() => navigate("exam")}
              >
                <ClipboardList size={22} />
                <span><strong>Evaluarme</strong><small>Simulacro de los 8 temas</small></span>
              </button>
            </nav>
            {state.screen !== "exam" && state.screen !== "calc" && (
              <div className="study-workbar">
                <StudyNavigation
                  lesson={state.lesson}
                  screen={state.screen}
                  progress={state.progress}
                  onNavigate={navigate}
                />
                <StudyTabs screen={state.screen} onNavigate={navigate} />
              </div>
            )}
            <div className="study-layout">
              <div className={`study-content study-screen-${state.screen}`}>
                <section
                  className="study-card study-lesson"
                  key={`${state.screen}-${state.lesson}`}
                >
                  {state.screen !== "lesson" && <div className="study-card-heading">
                    <div>
                      {["lesson", "practice"].includes(state.screen) && (
                        <span className="study-topic-eyebrow">
                          TEMA{" "}
                          {String(lessons.indexOf(lesson) + 1).padStart(2, "0")}{" "}
                          / 08 ·{" "}
                          {state.screen === "practice"
                            ? "APLICA LO APRENDIDO"
                            : "COMPRENDER Y EXPLORAR"}
                        </span>
                      )}
                      <h2 ref={heading} tabIndex={-1}>
                        {state.screen === "exam"
                          ? "Evaluación de los 8 temas"
                          : state.screen === "calc"
                            ? "Cálculos"
                          : state.screen === "progress"
                            ? "Mi progreso"
                            : `${state.screen === "practice" ? "Practicar · " : ""}${lesson.title}`}
                      </h2>
                      <p>
                        {state.screen === "practice"
                            ? "Resuelve, explica el error y vuelve a intentarlo."
                            : state.screen === "exam"
                              ? "Módulo aparte: 8 alternativas (una por tema) y 3 preguntas de desarrollo."
                              : state.screen === "calc"
                                ? "Elige qué calcular, escribe tus datos y comprueba con la calculadora."
                                : "Tu recorrido de estudio en este navegador."}
                      </p>
                    </div>
                    {state.screen === "practice" && (
                      <button onClick={() => navigate("lesson")}>
                        <ArrowLeft size={16} /> Volver a la lección
                      </button>
                    )}
                  </div>}
                  {state.screen === "lesson" && (
                    <LessonJourney
                      key={lesson.id}
                      topic={lesson.id}
                      slides={lesson.slides}
                      draft={state.drafts[lesson.id] || {}}
                      last={lessons.indexOf(lesson) === lessons.length - 1}
                      index={lessons.indexOf(lesson)}
                      nextTitle={shortTitles[lessons[lessons.indexOf(lesson) + 1]?.id]}
                      onDraft={(d) => setState((s) => ({ ...s, drafts: { ...s.drafts, [s.lesson]: d } }))}
                      onResult={record}
                      onPractice={() => navigate("practice")}
                      onNext={() => {
                        changeProgress((p) => ({ ...p, reviewed: true }));
                        if (lessons.indexOf(lesson) === lessons.length - 1) navigate("exam");
                        else navigate("lesson", lessons[lessons.indexOf(lesson) + 1].id);
                      }}
                    />
                  )}
                  {state.screen === "practice" && (
                    <Practice
                      onLearn={() => navigate("lesson")}
                      allProgress={state.progress}
                      onTopic={(id) => navigate("practice", id)}
                      index={lessons.indexOf(lesson)}
                      last={lessons.indexOf(lesson) === lessons.length - 1}
                      onNext={() => {
                        if (lessons.indexOf(lesson) === lessons.length - 1) navigate("exam");
                        else navigate("practice", lessons[lessons.indexOf(lesson) + 1].id);
                      }}
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
                  {state.screen === "calc" && <CalcModule />}
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
                      <div className="progress-summary">
                        <div className="progress-summary-stats">
                          <div>
                            <strong>
                              {
                                lessons.filter(
                                  (l) =>
                                    lessonStatus(state.progress[l.id]) ===
                                    "Dominada",
                                ).length
                              }
                              <span> / 8</span>
                            </strong>
                            <small>temas dominados</small>
                          </div>
                          <div>
                            <strong>
                              {reviewed}
                              <span> / 8</span>
                            </strong>
                            <small>temas revisados</small>
                          </div>
                          <div>
                            <strong>{state.attempts.length}</strong>
                            <small>intentos de práctica</small>
                          </div>
                          <div>
                            <strong>
                              {
                                state.exams.filter(
                                  (e) => e.stage === "submitted",
                                ).length
                              }
                            </strong>
                            <small>simulacros enviados</small>
                          </div>
                        </div>
                        <div
                          className="progress-summary-bar"
                          role="progressbar"
                          aria-label="Temas dominados"
                          aria-valuemin={0}
                          aria-valuemax={8}
                          aria-valuenow={
                            lessons.filter(
                              (l) =>
                                lessonStatus(state.progress[l.id]) ===
                                "Dominada",
                            ).length
                          }
                        >
                          <span
                            style={{
                              width: `${(lessons.filter((l) => lessonStatus(state.progress[l.id]) === "Dominada").length / 8) * 100}%`,
                            }}
                          />
                        </div>
                        {(() => {
                          const next = lessons.find(
                            (l) =>
                              lessonStatus(state.progress[l.id]) !== "Dominada",
                          );
                          return next ? (
                            <button
                              className="study-primary progress-continue"
                              onClick={() => navigate("lesson", next.id)}
                            >
                              Continuar · Tema{" "}
                              {String(lessons.indexOf(next) + 1).padStart(
                                2,
                                "0",
                              )}{" "}
                              {next.title}
                              <ArrowRight size={18} />
                            </button>
                          ) : (
                            <p className="progress-all-done">
                              Dominaste los ocho temas. Repasa los errores o
                              haz otro simulacro.
                            </p>
                          );
                        })()}
                      </div>
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
                            data-topic={l.id}
                            onClick={() => navigate("lesson", l.id)}
                          >
                            <span className="progress-topic-heading">
                              <span className="progress-topic-number">
                                {String(lessons.indexOf(l) + 1).padStart(
                                  2,
                                  "0",
                                )}
                              </span>
                              {l.title}
                              <small>
                                {state.progress[l.id]?.correct.length || 0} de 4
                                alternativas comprobadas
                              </small>
                              <span className="progress-topic-dots" aria-hidden="true">
                                {[0, 1, 2, 3].map((i) => (
                                  <i
                                    key={i}
                                    className={
                                      i < (state.progress[l.id]?.correct.length || 0)
                                        ? "on"
                                        : ""
                                    }
                                  />
                                ))}
                              </span>
                            </span>
                            <strong>
                              {lessonStatus(state.progress[l.id])}
                            </strong>
                          </button>
                        ))}
                      </div>
                      <h3>Errores para repasar</h3>
                      {failures.length === 0 ? (
                        <div className="study-empty-state">
                          <Shield size={28} />
                          <div>
                            <strong>Tu repaso empieza con la práctica</strong>
                            <p>
                              Aún no hay errores registrados. Cuando compruebes
                              respuestas, podrás volver aquí a repasar lo que
                              necesites.
                            </p>
                          </div>
                          <button onClick={() => navigate("practice")}>
                            Practicar el tema actual <ArrowRight size={16} />
                          </button>
                        </div>
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
              </div>
            </div>
            <CalculatorDock onOpenCard={state.screen === "exam" ? undefined : (cid) => { try { sessionStorage.setItem("study-calc-card", cid); } catch { /* sin almacenamiento */ } window.dispatchEvent(new CustomEvent("study-calc-open", { detail: cid })); if (state.screen !== "calc") navigate("calc"); }} />
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
              <dialog
                ref={resetDialog}
                className="study-reset"
                onKeyDown={trapDialogTab}
                role="alertdialog"
                aria-label="Reiniciar progreso de estudio"
                onClose={() => setReset(false)}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setReset(false);
                }}
              >
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
              </dialog>
            )}
          </>
        )}
      </main>
    </div>
  );
}
