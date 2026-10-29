import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ExternalLink} from 'lucide-react';
import {functionProblems,type FunctionProblem,type ProblemQuestion} from '../learning/functionProblems';
import {laboratoryLessonUrl,type GeoLesson,type GeoProgress} from '../learning/geogebraLessons';
import '../styles/problem-notebook.css';
import {ProblemFormula} from './ProblemFormula';
import {ExamReviewContext,inUnit2Review} from './ExamReviewContext';
import {unit2ReviewUrl} from './studyFocus';
import {ProblemLessonIntro,hasProblemLesson} from './ProblemLessonIntro';

export const correctProblemAnswer=(q:ProblemQuestion,value:string)=>{
  if(q.options)return value===String(q.correct);
  const normalized=value.trim().replace(',','.');
  return /^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)&&Number.isFinite(Number(normalized))&&Math.abs(Number(normalized)-q.value!)<=(q.tolerance??.01);
};
type Save={version:1;question:number;answers:Record<string,{value:string;reason:string}>;checked:string[]};
const fresh=():Save=>({version:1,question:0,answers:{},checked:[]});
export function readProblemSave(raw:unknown,p:FunctionProblem):Save{
  if(!raw||typeof raw!=='object')throw Error('Invalid record');
  const s=raw as Save;
  if(s.version!==1||!Number.isInteger(s.question)||s.question<0||s.question>=p.questions.length||!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers)||!Array.isArray(s.checked))throw Error('Invalid record');
  for(const [id,a] of Object.entries(s.answers))if(!p.questions.some(q=>q.id===id)||!a||typeof a.value!=='string'||a.value.length>100||typeof a.reason!=='string'||a.reason.length>4000)throw Error('Invalid answer');
  for(const id of s.checked){const q=p.questions.find(q=>q.id===id);if(!q||!correctProblemAnswer(q,s.answers[id]?.value||''))throw Error('Invalid completion');}
  return {...s,checked:[...new Set(s.checked)]};
}
export function FunctionProblemNotebook({problem,lesson,geoProgress,onBack,onOpenGeo}:{problem:FunctionProblem;lesson:GeoLesson;geoProgress:GeoProgress;onBack:()=>void;onOpenGeo?:()=>void}){
  const [save,setSave]=useState<Save>(fresh),[ready,setReady]=useState(false),[blocked,setBlocked]=useState(false),[status,setStatus]=useState(''),[feedback,setFeedback]=useState(''),[method,setMethod]=useState(false),[methodStep,setMethodStep]=useState(0),[showStatement,setShowStatement]=useState(false);
  const key=`modo:function-problem:${problem.id}:v1`,heading=useRef<HTMLHeadingElement>(null);
  const [showLesson,setShowLesson]=useState(true);
  useEffect(()=>{setShowLesson(!hasProblemLesson(problem.id));},[problem.id]);
  useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw)setSave(readProblemSave(JSON.parse(raw),problem));}catch{setBlocked(true);setStatus('El guardado anterior no se pudo leer y se conserva. Puedes trabajar en esta sesión.');}setReady(true);},[key,problem]);
  const q=problem.questions[save.question],record=save.answers[q.id]||{value:'',reason:''},checked=save.checked.includes(q.id);
  const persist=(next:Save)=>{setSave(next);if(blocked)return;try{localStorage.setItem(key,JSON.stringify(next));setStatus('Guardado en este navegador');}catch{setStatus('No se pudo guardar. Copia tus respuestas antes de salir.');}};
  const go=(i:number)=>{persist({...save,question:i});setFeedback('');setMethod(false);setMethodStep(0);requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));};
  const update=(patch:Partial<typeof record>)=>{persist({...save,answers:{...save.answers,[q.id]:{...record,...patch}},checked:patch.value===undefined?save.checked:save.checked.filter(id=>id!==q.id)});setFeedback('');};
  const review=()=>{if(!record.value.trim()){setFeedback('Escribe o selecciona tu respuesta antes de comprobar.');return;}const correct=correctProblemAnswer(q,record.value);persist({...save,checked:correct?[...new Set([...save.checked,q.id])]:save.checked.filter(id=>id!==q.id)});setFeedback(correct?'Respuesta correcta. Revisa tu procedimiento y contrasta el resultado en GeoGebra.':`Revisa tu respuesta. ${q.hint}`);};
  if(showLesson)return <ProblemLessonIntro problem={problem} onBack={onBack} onPractice={()=>{setShowLesson(false);requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));}}/>;
  return <article className="study-hub problem-notebook" data-function-problem={problem.id}>
    <ExamReviewContext/>
    <header className="problem-heading"><div><p>FUNCIONES Y MATRICES · PROBLEMAS DE CLASE</p><h1 id="campus-title" tabIndex={-1}>{problem.title}</h1></div><button onClick={onBack}><ArrowLeft size={16}/>Volver al ramo</button></header>
    {(blocked||status.startsWith('No se pudo'))&&<p className="problem-storage-error" role="alert">{status}</p>}
    <button className="lesson-skip" onClick={()=>setShowLesson(true)}>Volver a entender la fórmula</button>
    <div className="problem-toolbar"><label>Elegir problema<select aria-label="Elegir problema de clase" value={problem.id} onChange={e=>location.assign(`/estudio?curso=s2-5&clase=mtfm01-${e.target.value}&paso=0${inUnit2Review()?'&repaso=unidad2':''}`)}>{functionProblems.map(p=><option value={p.id} key={p.id}>{p.title}</option>)}</select></label><span>{save.checked.length}/{problem.questions.length} respuestas comprobadas</span><>{onOpenGeo?<button className="problem-primary" onClick={onOpenGeo}>Trabajar en GeoGebra<ExternalLink size={15}/></button>:<a className="problem-primary" href={laboratoryLessonUrl(lesson)}>Trabajar en GeoGebra <ExternalLink size={15}/></a>}</></div>
    <nav className="problem-mobile-tabs" aria-label="Panel del ejercicio"><button aria-pressed={showStatement} onClick={()=>setShowStatement(true)}>Ver enunciado</button><button aria-pressed={!showStatement} onClick={()=>setShowStatement(false)}>Responder pregunta</button></nav>
    <div className="problem-workspace" data-panel={showStatement?'statement':'answer'}>
      <aside className="problem-statement" aria-label="Enunciado y datos"><h2>El problema</h2><p>{problem.statement}</p><div className="problem-formula" aria-label={problem.formula}><ProblemFormula id={problem.id}/></div><ul>{problem.variables.map(v=><li key={v}>{v}</li>)}</ul><details><summary>Consultar la actividad original</summary><p>Datos fijados según tus capturas. El botón «Nuevo ejercicio» del original cambia los valores.</p><a href={problem.source} target="_blank" rel="noreferrer">Abrir recurso de Ciencias Básicas Puente Alto <ExternalLink size={14}/></a></details></aside>
      <section className="problem-task" aria-label="Pregunta activa">
        <nav className="problem-questions" aria-label="Preguntas del problema">{problem.questions.map((question,i)=><button key={question.id} aria-label={`Pregunta ${String.fromCharCode(97+i)}: ${question.title}`} aria-current={save.question===i?'step':undefined} onClick={()=>go(i)}><span>{String.fromCharCode(97+i)})</span>{question.title}{save.checked.includes(question.id)&&<Check size={14} aria-label="Respuesta comprobada"/>}</button>)}</nav>
        <div className="problem-task-body"><span className="problem-step-label">PREGUNTA {String.fromCharCode(97+save.question).toUpperCase()} · {save.question+1} DE {problem.questions.length}</span><h2 ref={heading} tabIndex={-1}>{q.prompt}</h2><p className="problem-skill">{q.skill}</p>
          <fieldset disabled={!ready} className="problem-answer" data-result={checked?'correct':feedback?'error':undefined}><legend>Tu respuesta{q.unit?` en ${q.unit}`:''}</legend>{q.options?q.options.map((option,i)=><label key={option} className="problem-option"><input type="radio" name={q.id} value={i} checked={record.value===String(i)} onChange={e=>update({value:e.target.value})}/>{option}</label>):<><input aria-label="Tu respuesta numérica" aria-invalid={!!feedback&&!checked} inputMode="decimal" maxLength={100} value={record.value} onChange={e=>update({value:e.target.value})} onKeyDown={e=>{if(e.key==='Enter')review();}} placeholder="Escribe el valor"/>{q.unit==='pesos'&&<small>Escribe pesos sin separadores de miles: por ejemplo 16000.</small>}</>}</fieldset>
          <details className="problem-reason"><summary>Escribir mi procedimiento</summary><label>¿Qué operación elegiste y qué significa el resultado?<textarea aria-label="Mi procedimiento" maxLength={4000} value={record.reason} onChange={e=>update({reason:e.target.value})}/></label><small>Tu explicación se guarda; no se califica automáticamente.</small></details>
          <div className="problem-help"><button aria-expanded={method} onClick={()=>{setMethod(!method);setMethodStep(0);}}>{method?'Cerrar guía':'Resolver paso a paso'}</button><details key={q.id}><summary>Necesito una pista</summary><p>{q.hint}</p></details></div>
          {method&&<section className="problem-method" aria-label="Resolución guiada"><span>PASO {methodStep+1} DE {q.steps.length}</span><p>{q.steps[methodStep]}</p><div><button disabled={!methodStep} onClick={()=>setMethodStep(methodStep-1)}>Anterior</button><button onClick={()=>{if(methodStep<q.steps.length-1)setMethodStep(methodStep+1);else{setMethod(false);requestAnimationFrame(()=>document.querySelector<HTMLInputElement>('.problem-answer input')?.focus());}}}>{methodStep<q.steps.length-1?'Siguiente paso':'Ahora responde'}<ArrowRight size={15}/></button></div></section>}
          <p className={checked?'problem-feedback is-correct':feedback?'problem-feedback is-wrong':'problem-feedback'} role="status">{feedback||(checked?'Respuesta comprobada.':'')}</p>
          {save.checked.length===problem.questions.length&&<section className="lesson-problem-brief"><strong>Ya resolviste las preguntas. Ahora llévalo a la práctica.</strong><p>Abre la lección de GeoGebra: construirás el modelo, representarás los puntos y comprobarás cada actividad. Tus respuestas del cuaderno quedan guardadas.</p><>{onOpenGeo?<button className="problem-primary" onClick={onOpenGeo}>Practicar esta lección en GeoGebra<ArrowRight size={16}/></button>:<a className="problem-primary" href={laboratoryLessonUrl(lesson)}>Practicar esta lección en GeoGebra<ArrowRight size={16}/></a>}</></section>}
          {inUnit2Review()&&save.checked.length===problem.questions.length&&lesson.steps.every((_,i)=>geoProgress.completed.includes(i))&&<a className="exam-return-link" href={functionProblems[functionProblems.findIndex(p=>p.id===problem.id)+1]?`/estudio?curso=s2-5&clase=mtfm01-${functionProblems[functionProblems.findIndex(p=>p.id===problem.id)+1].id}&repaso=unidad2`:unit2ReviewUrl}>{functionProblems.findIndex(p=>p.id===problem.id)<functionProblems.length-1?'Siguiente actividad formativa':'Ver mi avance del repaso'}<ArrowRight size={16}/></a>}
          {q.options&&<p className="problem-graph-note">Aquí revisas la interpretación. La curva, los puntos y el encuadre se trabajan en GeoGebra.</p>}
        </div>
        <footer className="problem-actions"><button onClick={()=>go(save.question-1)} disabled={!save.question}><ArrowLeft size={16}/>Anterior</button><button className="problem-primary" disabled={!ready} onClick={review}>{q.options?'Revisar interpretación':'Comprobar respuesta'}<Check size={16}/></button>{save.question<problem.questions.length-1?<button onClick={()=>go(save.question+1)}>Siguiente<ArrowRight size={16}/></button>:onOpenGeo?<button onClick={onOpenGeo}>Ir a GeoGebra<ArrowRight size={16}/></button>:<a href={laboratoryLessonUrl(lesson)}>Ir a GeoGebra<ArrowRight size={16}/></a>}</footer>
      </section>
    </div>
    <footer className="problem-save"><span role="status">{blocked||status.startsWith('No se pudo')?'':status||'Respuestas guardadas en este navegador'}</span><span>GeoGebra: {geoProgress.completed.length}/{lesson.steps.length} actividades comprobadas</span></footer>
  </article>;
}
