import {useEffect,useRef,useState} from 'react';
import {CheckCircle2,ArrowRight,ArrowLeft} from 'lucide-react';
import {IDENTIFICATION_STEPS,type AssistanceLevel,type PracticeDocument} from '../data/practice';
import {connectedByCables} from '../data/wiring';
import {LESSONS,terminalLabel} from '../data/lessons';
import {LessonSchematic} from './LessonSchematic';
import '../styles/guide-confirmation.css';
import {motionReduced} from '../motion/surface';
type Props={practice:PracticeDocument;selected:string|null;assistance:AssistanceLevel;onAssistance:(v:AssistanceLevel)=>void;onAdvance:()=>void;onBack?:()=>void;onOpenDiagram?:()=>void;feedback:string;onFeedback:(v:string)=>void;onLocate:()=>void};
export function StudyGuide({practice,selected,assistance,onAssistance,onAdvance,onBack,onOpenDiagram,feedback,onFeedback,onLocate}:Props){
 const identify=practice.mode==='identify';
 const steps=identify?IDENTIFICATION_STEPS:practice.steps;
 const index=Math.min(practice.stepIndex,steps.length),step=steps[index];
 const lesson=!identify&&!!practice.diagram?.id.startsWith('leccion-');
 /* Comprobación automática: al completar el cable del paso la guía lo detecta sola. En las lecciones, si el cable se acaba de conectar, pasa al siguiente paso. */
 const stepKey=!identify&&step?practice.steps[index]?.id:undefined;
 const satisfied=!identify&&!!step&&connectedByCables(practice.steps[index].from,practice.steps[index].to,practice.wires);
 const arrival=useRef({key:stepKey,wires:practice.wires,satisfied});
 if(arrival.current.key!==stepKey)arrival.current={key:stepKey,wires:practice.wires,satisfied};
 const justConnected=satisfied&&!arrival.current.satisfied&&arrival.current.wires!==practice.wires;
 const confirming=lesson&&justConnected;
 const [leaving,setLeaving]=useState(false),content=useRef<HTMLDivElement>(null),advance=useRef(onAdvance);
 advance.current=onAdvance;
 useEffect(()=>{if(satisfied&&feedback!=='correct')onFeedback('correct')},[satisfied,feedback,stepKey]);
 useEffect(()=>{
  setLeaving(false);
  if(!confirming)return;
  // Primero se dibuja el tick y se lee la confirmación; después sale suavemente.
  const exit=setTimeout(()=>setLeaving(true),1800);
  const timer=setTimeout(()=>advance.current(),2060);
  return()=>{clearTimeout(exit);clearTimeout(timer)};
 },[confirming,stepKey]);
 useEffect(()=>{
  if(!lesson||motionReduced())return;
  const animation=content.current?.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.7,.3,1)'});
  return()=>animation?.cancel();
 },[stepKey,lesson]);
 if(!step)return <section className="guide-card" aria-label="Guía de estudio"><strong>{steps.length?'Recorrido terminado':'Crea tu primer paso'}</strong><p>{steps.length?'Puedes repetir el recorrido o seguir practicando libremente.':'Carga una referencia, marca una zona del diagrama y revisa sus dos terminales. Después podrás comprobar tu cableado frente a ese par.'}</p>{!!steps.length&&<button className="outline-full" onClick={onAdvance}>Repetir recorrido</button>}</section>;
 const validate=()=>{
  if(identify){const target=IDENTIFICATION_STEPS[index];onFeedback(selected===target.terminalId?'correct':'Selecciona el borne que pide este reto. Puedes aumentar la ayuda.');}
  else {const target=practice.steps[index];onFeedback(connectedByCables(target.from,target.to,practice.wires)?'correct':'Todavía no hay una red de cables que una el par revisado de este paso.');}
 };
 const stillMatches=identify?selected===IDENTIFICATION_STEPS[index].terminalId:connectedByCables(practice.steps[index].from,practice.steps[index].to,practice.wires);
 const manual=!identify?practice.steps[index]:undefined;
 const lessonDef=lesson?Object.values(LESSONS).find(l=>l.diagram.id===practice.diagram?.id):undefined;
 return <section className="guide-card" aria-label="Guía de estudio" data-lesson={lesson||undefined} data-guide-phase={confirming?(leaving?'leaving':'confirmed'):'waiting'}>
  <div ref={content} className="guide-step-content" inert={confirming||undefined} aria-hidden={confirming||undefined}>
  <div className="guide-top"><span>{identify?'RECONOCIMIENTO GUIADO':lesson?'LECCIÓN':'GUÍA MANUAL'} · {index+1}/{steps.length}</span><span>Ayuda {assistance}/3</span></div>
  <h3>{step.title}</h3>
  {lesson&&manual&&<p className="guide-why">{step.explanation}</p>}
  {lessonDef&&manual&&<LessonSchematic lesson={lessonDef} step={manual} steps={practice.steps} wires={practice.wires} onOpenDiagram={onOpenDiagram}/>}
  {lesson&&manual&&assistance>=2&&<p className="guide-connect" data-guide-connect><b>{terminalLabel(manual.from)}</b><ArrowRight size={14} aria-hidden="true"/><b>{terminalLabel(manual.to)}</b></p>}
  <details className="disclosure guide-hints" open><summary>Ayuda · nivel {assistance}/3</summary><div className="assistance-levels" aria-label="Nivel de ayuda">{([1,2,3] as const).map(level=><button key={level} aria-pressed={assistance===level} onClick={()=>onAssistance(level)}>{identify?(level===1?'Consigna':level===2?'Componentes':'Bornes'):(level===1?'Esquema':level===2?'Módulos':'Cable')}</button>)}</div>
  {lesson&&<p className="guide-level-note">{assistance===1?'Solo el esquema: busca tú los bornes en el banco.':assistance===2?'Se resaltan los módulos y se nombran los bornes.':'Se dibuja el cable que falta y se marcan sus bornes.'}</p>}
  {assistance>=2&&<button className="text-action" onClick={onLocate}>{identify?'Acercar componente':'Ver el cable en el banco'}</button>}
  </details>
  {(lesson?satisfied:feedback==='correct'&&stillMatches)?<div className="guide-success"><CheckCircle2 size={17}/><div><strong>{identify?'Borne identificado':lesson?'¡Cable conectado!':'Coincide con tu par revisado'}</strong>{!lesson&&<p>{step.explanation}</p>}{lesson&&justConnected&&<p className="guide-auto" role="status">Pasando al siguiente paso…</p>}<button className="primary-action" onClick={onAdvance}>Siguiente paso <ArrowRight size={16}/></button></div></div>:<>{identify?<button className="outline-full" onClick={validate}>Comprobar borne</button>:<p className="guide-waiting" role="status" data-guide-waiting><i aria-hidden="true"/>Esperando el cable… se comprueba solo al conectarlo.</p>}{feedback&&<p className="guide-feedback" role="status">{feedback==='correct'?'La selección o conexión cambió. Vuelve a comprobar el paso.':feedback}</p>}</>}
  {lesson&&onBack&&index>0&&<button className="text-action guide-back" onClick={onBack}><ArrowLeft size={14}/> Paso anterior</button>}
  </div>
  {confirming&&<div className="guide-check-overlay" role="status" aria-live="polite" aria-atomic="true" data-guide-confirmation key={stepKey}>
   <svg className="guide-check-mark" viewBox="0 0 80 80" aria-hidden="true"><circle className="guide-check-halo" cx="40" cy="40" r="35"/><circle className="guide-check-fill" cx="40" cy="40" r="35"/><circle className="guide-check-ring" cx="40" cy="40" r="35" pathLength="1"/><path className="guide-check-tick" d="m24 40 11 11 22-24" pathLength="1"/></svg>
   <strong>¡Cable correcto!</strong>
   <span>Conexión comprobada</span>
   <div className="guide-check-progress" aria-hidden="true"><i/></div>
   <small>{index===steps.length-1?'Terminando la lección…':'Preparando el siguiente cable…'}</small>
   <button type="button" className="text-action" onClick={onAdvance}>Continuar <ArrowRight size={14}/></button>
  </div>}
 </section>;
}
