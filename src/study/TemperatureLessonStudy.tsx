import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ExternalLink} from 'lucide-react';
import {newTempProgress,readTempProgress,tempLabUrl,tempStudyUrl,type Quiz,type TempLesson,type TempProgress} from '../learning/temperatureLessons';
import {progressKey} from '../lab/temperature/state';
import {noteRight,noteWrong} from '../learning/temperatureReviewStore';
import {reviewUrl} from '../learning/temperatureReview';
import {DatasheetList} from '../lab/temperature/TemperatureDatasheets';
import '../styles/temperature-sheets.css';
import '../styles/temperature.css';
import '../styles/tool-lessons.css';
/** Clase de la guía G03 en Estudio: Comprender → Practicar en el banco (o responder) → Comprobar. Consultar el material no acredita el aprendizaje. */
export function QuizBlock({quiz,name,disabled,onCorrect}:{quiz:Quiz;name:string;disabled?:boolean;onCorrect?:()=>void}){
  const [answer,setAnswer]=useState(''),[feedback,setFeedback]=useState(''),[right,setRight]=useState(false),[counted,setCounted]=useState('');
  const review=()=>{if(!answer){setFeedback('Elige una respuesta antes de comprobar.');return;}const ok=Number(answer)===quiz.answer;setRight(ok);
    /* Cada respuesta distinta se anota una sola vez en el repaso: pulsar «Comprobar» de nuevo no suma aciertos. */
    if(quiz.concept&&counted!==answer){setCounted(answer);if(ok)noteRight(quiz.concept);else noteWrong(quiz.concept);}setFeedback(ok?`Correcto. ${quiz.explanation}`:quiz.explanation);if(ok)onCorrect?.();};
  return <div><fieldset className="tool-study-question" disabled={disabled}><legend>{quiz.question}</legend>{quiz.options.map((text,i)=><label key={text}><input type="radio" name={name} value={i} checked={answer===String(i)} onChange={e=>{setAnswer(e.target.value);setFeedback('');}}/>{text}</label>)}</fieldset>
    <button className="class-start" disabled={disabled} onClick={review}>Comprobar respuesta <Check size={17}/></button>{feedback&&<p className={`tool-study-feedback ${right?'is-right':''}`} role="status">{feedback}</p>}</div>;
}
export function TemperatureLessonStudy({lesson,onBack}:{lesson:TempLesson;onBack:()=>void}){
  const [phase,setPhase]=useState(0),[progress,setProgress]=useState<TempProgress>(newTempProgress),[error,setError]=useState('');
  const completed=lesson.steps.every((_,i)=>progress.completed.includes(i));
  const last=lesson.bench?2:1;
  useEffect(()=>{
    const sync=()=>{const requested=Number(new URLSearchParams(location.search).get('paso')||0);setPhase(requested>=0&&requested<=last?requested:0);try{setProgress(readTempProgress(lesson));setError('');}catch{setError('No se pudo leer el avance de esta clase. El guardado anterior se conserva.');}};
    sync();window.addEventListener('popstate',sync);window.addEventListener('focus',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('focus',sync);window.removeEventListener('storage',sync);};
  },[lesson,last]);
  const persist=(next:TempProgress)=>{setProgress(next);if(error)return;try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setError('No se pudo guardar el avance en este navegador.');}};
  const navigate=(next:number)=>{setPhase(next);history.pushState(null,'',tempStudyUrl(lesson,next));window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.getElementById('campus-title')?.focus({preventScroll:true}));};
  const labels=lesson.bench?['Comprender','Practicar en el banco','Comprobar']:['Comprender','Responder'];
  return <div className="study-hub tool-study">
    <button className="campus-back" onClick={onBack}><ArrowLeft size={17}/>Volver al ramo</button>
    <header className="campus-heading"><p>INSTRUMENTACIÓN INDUSTRIAL · UNIDAD 2 · GUÍA G03</p><h1 id="campus-title" tabIndex={-1}>{lesson.title}</h1></header>
    <nav className="tool-study-steps" aria-label="Momentos de la clase">{labels.map((label,i)=><button key={label} aria-current={phase===i?'step':undefined} onClick={()=>navigate(i)}><span>{i+1}</span>{label}</button>)}</nav>
    {error&&<p role="alert">{error}</p>}
    {phase===0&&<section className="tool-study-body"><p className="tool-study-intro">{lesson.intro}</p><div className="tool-study-concept"><BookOpen size={22}/><p>{lesson.concept}</p></div>{lesson.bench&&<details className="tool-study-sheets"><summary>Fichas de los equipos del banco</summary><DatasheetList/></details>}<h2>Lo que vas a hacer</h2><ol>{lesson.steps.map(step=><li key={step.title}>{step.title}</li>)}</ol>
      {lesson.bench?<p>La práctica abre el banco de temperatura con una guía al lado. Los datos que obtienes son <strong>simulados</strong>: sirven para preparar la sesión. Las mediciones reales de tus equipos se registran aparte, en la pestaña «En clase».</p>:<p>Son preguntas de comprensión sobre los puntos de investigación de la guía. La presentación grupal y el debate se conservan como una tarea independiente.</p>}
      <button className="class-start" onClick={()=>navigate(1)}>{lesson.bench?'Llegar a la práctica':'Responder las preguntas'} <ArrowRight size={18}/></button></section>}
    {phase===1&&lesson.bench&&<section className="tool-study-body"><h2>Ahora te toca medir</h2><p>Abre el banco, sigue la guía de la práctica y comprueba cada paso. Al volver seguirás en esta clase. Este banco se guarda separado de tu espacio libre y de las demás herramientas.</p>
      <a className="class-start" href={tempLabUrl(lesson)}>{progress.completed.length?'Continuar práctica en el banco':'Abrir el banco de temperatura'}<ArrowRight size={18}/></a>
      <p className="tool-study-progress"><Check size={17}/>{progress.completed.length}/{lesson.steps.length} pasos comprobados{completed?' · práctica completada':''}</p>
      <p className="tool-study-note">Los valores simulados usan los modelos NIST (termocuplas) e IEC 60751 (Pt100). Son ideales: los sensores reales tienen tolerancia, y el Pt100 a dos hilos incluye la resistencia de los cables.</p>
      {completed&&<button className="tool-study-secondary" onClick={()=>navigate(2)}>Volví de la práctica · continuar <ArrowRight size={16}/></button>}</section>}
    {phase===1&&!lesson.bench&&<section className="tool-study-body"><h2>Responde</h2>
      {lesson.steps.map((step,i)=><div key={step.title} className="tool-study-quiz-item"><h3>{i+1}. {step.title}</h3><p>{step.text}</p>{step.quiz&&<QuizBlock quiz={step.quiz} name={`${lesson.id}-${i}`} onCorrect={()=>{if(!progress.completed.includes(i))persist({...progress,completed:[...progress.completed,i].sort((a,b)=>a-b),reviewed:progress.completed.length+1===lesson.steps.length||progress.reviewed});}}/>}{progress.completed.includes(i)&&<p className="tool-study-progress"><Check size={17}/>Respuesta correcta guardada.</p>}</div>)}
      <p className="tool-study-progress"><Check size={17}/>{progress.completed.length}/{lesson.steps.length} respondidas{completed?' · actividad completada':''}</p>
      <a className="tool-study-secondary" href={reviewUrl()}>Repasar la guía G03 <ArrowRight size={16}/></a><button className="tool-study-secondary" onClick={onBack}>Volver a las clases <ArrowRight size={16}/></button></section>}
    {phase===2&&lesson.bench&&lesson.review&&<section className="tool-study-body"><h2>Comprueba lo aprendido</h2>{!completed?<><p>Primero completa los pasos de la práctica en el banco. Abrirlo no cuenta como terminarla.</p><a className="class-start" href={tempLabUrl(lesson)}>Ir a la práctica <ArrowRight size={17}/></a></>:<>
      <QuizBlock quiz={lesson.review} name={`${lesson.id}-review`} onCorrect={()=>{if(!progress.reviewed)persist({...progress,reviewed:true});}}/>
      {progress.reviewed&&<p className="tool-study-progress"><Check size={17}/>Práctica completada y concepto revisado.</p>}
      {progress.notes&&<div className="tool-study-notes"><h3>Tus observaciones del laboratorio</h3><p>{progress.notes}</p></div>}
      <a className="tool-study-secondary" href={reviewUrl()}>Repasar la guía G03 <ArrowRight size={16}/></a><button className="tool-study-secondary" onClick={onBack}>Volver a las clases <ArrowRight size={16}/></button></>}</section>}
    <footer className="tool-study-source"><a href={lesson.source} target="_blank" rel="noreferrer">Guía original (G03) <ExternalLink size={15}/></a>{lesson.bench&&<a href="/laboratorio?tool=temperature">Abrir el banco libre <ExternalLink size={15}/></a>}<span>Recorrido didáctico adaptado a la guía docente.</span></footer>
  </div>;
}
