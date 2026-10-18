import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ExternalLink} from 'lucide-react';
import {detLabUrl,detStudyUrl,newDetProgress,readDetProgress,type DetLesson,type DetProgress} from '../learning/detectorLessons';
import {progressKey} from '../lab/detectors/state';
import {QuizBlock} from './TemperatureLessonStudy';
import {DetectorDatasheetList} from '../lab/detectors/DetectorDatasheets';
import '../styles/tool-lessons.css';
import '../styles/temperature-sheets.css';
/** Clase de las guías G01 y G02 en Estudio: Comprender → Practicar en el banco (o responder) → Comprobar. Consultar el material no acredita el aprendizaje. */
export function DetectorLessonStudy({lesson,onBack}:{lesson:DetLesson;onBack:()=>void}){
  const [phase,setPhase]=useState(0),[progress,setProgress]=useState<DetProgress>(newDetProgress),[error,setError]=useState('');
  const completed=lesson.steps.every((_,i)=>progress.completed.includes(i));
  const last=lesson.bench?2:1;
  useEffect(()=>{
    const sync=()=>{const requested=Number(new URLSearchParams(location.search).get('paso')||0);setPhase(requested>=0&&requested<=last?requested:0);try{setProgress(readDetProgress(lesson));setError('');}catch{setError('No se pudo leer el avance de esta clase. El guardado anterior se conserva.');}};
    sync();window.addEventListener('popstate',sync);window.addEventListener('focus',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('focus',sync);window.removeEventListener('storage',sync);};
  },[lesson,last]);
  const persist=(next:DetProgress)=>{setProgress(next);if(error)return;try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setError('No se pudo guardar el avance en este navegador.');}};
  const navigate=(next:number)=>{setPhase(next);history.pushState(null,'',detStudyUrl(lesson,next));window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.getElementById('campus-title')?.focus({preventScroll:true}));};
  const labels=lesson.bench?['Comprender','Practicar en el banco','Comprobar']:['Comprender','Responder'];
  return <div className="study-hub tool-study">
    <button className="campus-back" onClick={onBack}><ArrowLeft size={17}/>Volver al ramo</button>
    <header className="campus-heading"><p>INSTRUMENTACIÓN INDUSTRIAL · UNIDAD 2 · GUÍA {lesson.guide}</p><h1 id="campus-title" tabIndex={-1}>{lesson.title}</h1></header>
    <nav className="tool-study-steps" aria-label="Momentos de la clase">{labels.map((label,i)=><button key={label} aria-current={phase===i?'step':undefined} onClick={()=>navigate(i)}><span>{i+1}</span>{label}</button>)}</nav>
    {error&&<p role="alert">{error}</p>}
    {phase===0&&<section className="tool-study-body"><p className="tool-study-intro">{lesson.intro}</p><div className="tool-study-concept"><BookOpen size={22}/><p>{lesson.concept}</p></div>{lesson.bench&&<details className="tool-study-sheets"><summary>Fichas de los equipos del banco</summary><DetectorDatasheetList/></details>}<h2>Lo que vas a hacer</h2><ol>{lesson.steps.map(step=><li key={step.title}>{step.title}</li>)}</ol>
      {lesson.bench?<p>La práctica abre el banco de detectores con una guía al lado. Los datos que obtienes son <strong>simulados</strong>: sirven para preparar la sesión. Las mediciones reales de tus equipos se registran aparte, en la pestaña «En clase».</p>:<p>Son preguntas de comprensión sobre los puntos de investigación de la guía. La búsqueda en la web, la presentación grupal y el debate se conservan como una tarea independiente, que esta clase no evalúa.</p>}
      <button className="class-start" onClick={()=>navigate(1)}>{lesson.bench?'Llegar a la práctica':'Responder las preguntas'} <ArrowRight size={18}/></button></section>}
    {phase===1&&lesson.bench&&<section className="tool-study-body"><h2>Ahora te toca montar y medir</h2><p>Abre el banco, sigue la guía de la práctica y comprueba cada paso. Al volver seguirás en esta clase. Este banco se guarda separado de tu espacio libre y de las demás herramientas.</p>
      <a className="class-start" href={detLabUrl(lesson)}>{progress.completed.length?'Continuar práctica en el banco':'Abrir el banco de detectores'}<ArrowRight size={18}/></a>
      <p className="tool-study-progress"><Check size={17}/>{progress.completed.length}/{lesson.steps.length} pasos comprobados{completed?' · práctica completada':''}</p>
      <p className="tool-study-note">{lesson.guide==='G01'?'El banco usa un detector genérico de 3 hilos con alcance declarado, fuente ideal de 24 V y multímetro de 10 MΩ. No hay corrientes de fuga ni tolerancias. Los detectores de tu laboratorio pueden comportarse distinto: consulta su ficha.':'Los cuatro modelos de la guía (CR30-15DN, CR30-15DP, XS118BLPAL2 y BR100-DDT-P) están pendientes de ficha técnica: tú copias sus datos y el banco los simula como detector genérico de 3 hilos. Los bornes, colores y distancias reales de cada modelo, y los bornes de la maqueta Delta, no están en el programa.'}</p>
      {completed&&<button className="tool-study-secondary" onClick={()=>navigate(2)}>Volví de la práctica · continuar <ArrowRight size={16}/></button>}</section>}
    {phase===1&&!lesson.bench&&<section className="tool-study-body"><h2>Responde</h2>
      {lesson.steps.map((step,i)=><div key={step.title} className="tool-study-quiz-item"><h3>{i+1}. {step.title}</h3><p>{step.text}</p>{step.quiz&&<QuizBlock quiz={step.quiz} name={`${lesson.id}-${i}`} onCorrect={()=>{if(!progress.completed.includes(i))persist({...progress,completed:[...progress.completed,i].sort((a,b)=>a-b),reviewed:progress.completed.length+1===lesson.steps.length||progress.reviewed});}}/>}{progress.completed.includes(i)&&<p className="tool-study-progress"><Check size={17}/>Respuesta correcta guardada.</p>}</div>)}
      <p className="tool-study-progress"><Check size={17}/>{progress.completed.length}/{lesson.steps.length} respondidas{completed?' · actividad completada':''}</p>
      <label className="temp-notes">Plan de la presentación grupal (opcional, no se evalúa)<textarea value={progress.notes} maxLength={20000} placeholder="Ideas, fuentes y conclusiones para la exposición y el debate…" onChange={e=>persist({...progress,notes:e.target.value})}/></label>
      <button className="tool-study-secondary" onClick={onBack}>Volver a las clases <ArrowRight size={16}/></button></section>}
    {phase===2&&lesson.bench&&lesson.review&&<section className="tool-study-body"><h2>Comprueba lo aprendido</h2>{!completed?<><p>Primero completa los pasos de la práctica en el banco. Abrirlo no cuenta como terminarla.</p><a className="class-start" href={detLabUrl(lesson)}>Ir a la práctica <ArrowRight size={17}/></a></>:<>
      <QuizBlock quiz={lesson.review} name={`${lesson.id}-review`} onCorrect={()=>{if(!progress.reviewed)persist({...progress,reviewed:true});}}/>
      {progress.reviewed&&<p className="tool-study-progress"><Check size={17}/>Práctica completada y concepto revisado.</p>}
      {progress.notes&&<div className="tool-study-notes"><h3>Tus observaciones del laboratorio</h3><p>{progress.notes}</p></div>}
      <button className="tool-study-secondary" onClick={onBack}>Volver a las clases <ArrowRight size={16}/></button></>}</section>}
    <footer className="tool-study-source"><a href={lesson.source} target="_blank" rel="noreferrer">Guía original ({lesson.guide}) <ExternalLink size={15}/></a>{lesson.bench&&<a href="/laboratorio?tool=detectors">Abrir el banco libre <ExternalLink size={15}/></a>}<span>Recorrido didáctico adaptado a la guía docente.</span></footer>
  </div>;
}
