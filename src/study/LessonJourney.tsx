import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, RotateCcw, X } from "lucide-react";
import { LessonMedia } from "./LessonMedia";
import { LessonGuide } from "./LessonGuide";
import { QuickExperiment } from "./QuickExperiment";
import { RememberCard } from "./RememberCard";
import { GuidedLesson } from "./GuidedLesson";
import { Rich } from "./Rich";
import { TopicDone } from "./TopicDone";
import { journeys } from "./journeyContent";
import { numberValue, type Draft } from "./model";
import { trapDialogTab } from "./dialog";

export function LessonJourney({ topic, slides, draft, onDraft, onResult, onNext, onPractice, last, index, nextTitle }: {
  topic: string; slides: number[]; draft: Draft; onDraft: (draft: Draft) => void;
  onResult: (correct: boolean, item: string) => void; onNext: () => void; onPractice: () => void; last: boolean; index: number; nextTitle?: string;
}) {
  const info = journeys[topic];
  const step = ["0", "1", "2"].includes(draft.journeyStep) ? Number(draft.journeyStep) : 0;
  const answer = draft.journeyAnswer || "";
  const matchesAnswer = info.options ? answer === info.correct : numberValue(answer) !== null && Math.abs(numberValue(answer)! - Number(info.correct)) <= .05;
  const feedback = draft.journeyFeedback === "correct" && !matchesAnswer ? "wrong" : draft.journeyFeedback;
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const response = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState(false);
  const setStep = (value: number) => onDraft({ ...draft, journeyStep: String(value) });
  useEffect(() => { if (reading) dialog.current?.showModal(); }, [reading]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); if (step > 0) root.current?.scrollIntoView({ block: "start", behavior: "instant" }); }, [step]);
  useEffect(() => { if (feedback && step === 2) { response.current?.focus({ preventScroll: true }); response.current?.scrollIntoView({ block: "nearest", behavior: "instant" }); } }, [feedback, step]);
  const check = () => {
    if (!answer.trim() || (!info.options && numberValue(answer) === null)) {
      onDraft({ ...draft, journeyFeedback: "missing" }); return;
    }
    const correct = matchesAnswer;
    onDraft({ ...draft, journeyFeedback: correct ? "correct" : "wrong" });
    onResult(correct, `journey-${topic}`);
  };
  const openReading = () => setReading(true);
  const changeAnswer = (value: string) => onDraft({ ...draft, journeyAnswer: value, journeyFeedback: "" });
  const experimentTitles: Record<string, string> = { "objetivos-fallas": "Cambia la falla", coordinacion: "Mueve la protección", termomagnetico: "Prueba las curvas", fusibles: "Lee la placa", conductores: "Cambia la temperatura", guardamotor: "Elige el rango", "tierra-sobretension": "Compara los fenómenos", "motor-trifasico": "Baja el rendimiento" };
  return <div className="lesson-journey" ref={root}>
    <nav className="journey-steps" aria-label="Pasos del tema">{["Aprende", "Prueba", "Resuelve"].map((label, index) => <button key={label} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}><span>{index === 2 && feedback === "correct" ? <Check size={14} /> : index + 1}</span>{label}</button>)}</nav>
    <div className="journey-stage" key={step}>
      {step === 0 && <GuidedLesson topic={topic} draft={draft} onDraft={onDraft} onFinish={() => setStep(1)} intro={(start) => <div className="journey-intro">
        <div className="journey-intro-copy"><span className="journey-eyebrow">EMPIEZA POR ESTA IDEA</span><h2 ref={heading} tabIndex={-1}>{info.title}</h2><p className="journey-hook">{info.hook}</p><p className="journey-idea"><Rich text={info.idea} /></p><button className="study-primary journey-start" onClick={start}>Empezar la lección <ArrowRight size={18} /></button><button className="journey-reading-link" onClick={openReading}><BookOpen size={16} /> Entenderlo con más detalle</button></div>
        <LessonMedia topic={topic} draft={draft} onDraft={onDraft} />
      </div>} />}
      {step === 1 && <div className="journey-explore"><div className="journey-stage-heading"><h2 ref={heading} tabIndex={-1}>{experimentTitles[topic]}</h2><p>{info.experiment}</p></div><QuickExperiment topic={topic} draft={draft} onDraft={onDraft} /><div className="journey-stage-actions"><button className="journey-back" onClick={() => setStep(0)}><ArrowLeft size={16} /> Volver a la idea</button><button className="study-primary" onClick={() => setStep(2)}>Resolver el reto <ArrowRight size={18} /></button></div></div>}
      {step === 2 && <div className="journey-challenge"><div className="journey-stage-heading"><span className="journey-eyebrow">UN RETO PARA CERRAR</span><h2 ref={heading} tabIndex={-1}>{info.question}</h2><p className="journey-given">{info.given}</p></div>
        {info.options ? <fieldset className="study-options journey-options"><legend className="sr-only">Tu respuesta al reto</legend>{info.options.map((option, index) => <label key={option}><input type="radio" name={`${id}-challenge`} checked={answer === String(index)} onChange={() => changeAnswer(String(index))} /><span>{option}</span></label>)}</fieldset> : <div className="journey-number-answer"><label htmlFor={`${id}-answer`}>Tu resultado</label><div><input id={`${id}-answer`} type="text" inputMode="decimal" placeholder="Escribe el número" value={answer} onChange={event => changeAnswer(event.target.value)} aria-describedby={`${id}-help`} onKeyDown={event => { if (event.key === "Enter") check(); }} /><span>{info.unit}</span></div><small id={`${id}-help`}>Coma o punto decimal · redondeo admitido: 0,05 {info.unit}.</small></div>}
        {feedback && <div ref={response} tabIndex={-1} role="status" className={`journey-feedback ${feedback === "correct" ? "is-correct" : "is-retry"}`}><strong>{feedback === "correct" ? "Lo entendiste." : feedback === "missing" ? "Falta tu respuesta." : "Vamos a corregirlo."}</strong><p>{feedback === "missing" ? info.options ? "Marca una opción antes de comprobar." : "Escribe un número; la unidad ya está indicada junto al campo." : <Rich text={info.explanation} />}</p></div>}
        {feedback === "correct" && <RememberCard topic={topic} />}
        {feedback === "correct" && <TopicDone topic={topic} title={`¡Tema ${index + 1} completado!`} text={last ? "Ya recorriste los 8 temas. Ahora puedes evaluarte con un simulacro de todo el curso." : "Lo entendiste. Pasa al siguiente tema o practica este un poco más."} primary={last ? "Ir a la evaluación" : "Siguiente tema"} primarySub={last ? "Simulacro de los 8 temas" : `Tema ${index + 2} · ${nextTitle}`} onPrimary={onNext} secondary="Practicar este tema" onSecondary={onPractice} />}
        {feedback !== "correct" && <div className="journey-stage-actions"><button className="journey-back" onClick={() => setStep(1)}><RotateCcw size={16} /> Volver a probar</button><button className="study-primary" onClick={check}>{feedback === "wrong" ? "Comprobar de nuevo" : "Comprobar respuesta"}<ArrowRight size={18} /></button></div>}
      </div>}
    </div>
    {step > 0 && <div className="journey-help"><button className="journey-reading-link" onClick={openReading}><BookOpen size={16} /> Necesito una explicación</button><span>Paso {step + 1} de 3</span></div>}
    {reading && <dialog ref={dialog} className="journey-reading-dialog" onKeyDown={trapDialogTab} onClose={() => setReading(false)} aria-labelledby={`${id}-reading-title`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}><div className="journey-reading-header"><h2 id={`${id}-reading-title`}>Consulta del tema</h2><button autoFocus aria-label="Cerrar explicación" onClick={() => dialog.current?.close()}><X size={21} /></button></div><LessonGuide topic={topic} slides={slides} draft={draft} onDraft={onDraft} onExperiment={() => { dialog.current?.close(); setStep(1); }} /></dialog>}
  </div>;
}
