import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ExternalLink,RotateCcw} from 'lucide-react';
import {CONCEPTS,pendingConcepts,pickQuestions,statusOf,type ConceptId,type ReviewLog,type ReviewQuestion} from '../learning/temperatureReview';
import {newReviewLog} from '../learning/temperatureReview';
import {noteRight,noteWrong,readReview,writeReview} from '../learning/temperatureReviewStore';
import '../styles/tool-lessons.css';
import '../styles/temperature-review.css';
/** Repaso de la guía G03: refuerza los conceptos en los que hubo errores (preguntas, pasos del banco o montajes sin sentido físico).
 *  No es una calificación ni una evaluación oficial. */
const QUESTIONS_PER_SESSION=6;
type Session={questions:ReviewQuestion[];index:number;answer:string;checked:boolean;results:{concept:ConceptId;ok:boolean}[]};
const fix=(concept:ConceptId)=>{
  const c=CONCEPTS.find(x=>x.id===concept)!;
  return c.where==='banco'?{href:`/laboratorio?tool=temperature&leccion=temperatura-experiencia-${c.experience}`,label:'Practicar en el banco'}:{href:'/estudio?curso=s2-3&clase=instrumentacion-g03-exp1&paso=1',label:'Volver a las preguntas'};
};
export function TemperatureReviewStudy({onBack}:{onBack:()=>void}){
  const [log,setLog]=useState<ReviewLog>(newReviewLog),[blocked,setBlocked]=useState(false),[session,setSession]=useState<Session|null>(null),[done,setDone]=useState<Session|null>(null);
  const reload=()=>{const read=readReview();setLog(read.log);setBlocked(read.blocked);};
  useEffect(()=>{reload();window.addEventListener('focus',reload);window.addEventListener('storage',reload);return()=>{window.removeEventListener('focus',reload);window.removeEventListener('storage',reload);};},[]);
  const pending=pendingConcepts(log);
  const start=(all:boolean)=>{const questions=pickQuestions(log,QUESTIONS_PER_SESSION,all);setDone(null);setSession({questions,index:0,answer:'',checked:false,results:[]});window.scrollTo({top:0,behavior:'instant'});};
  const check=()=>{
    if(!session||!session.answer||session.checked)return;
    const item=session.questions[session.index],ok=Number(session.answer)===item.answer;
    if(ok)noteRight(item.concept);else noteWrong(item.concept);
    setSession({...session,checked:true,results:[...session.results,{concept:item.concept,ok}]});reload();
  };
  const next=()=>{
    if(!session)return;
    if(session.index+1>=session.questions.length){setDone(session);setSession(null);reload();return;}
    setSession({...session,index:session.index+1,answer:'',checked:false});
  };
  const current=session?session.questions[session.index]:null;
  const lastOk=session?.results.at(-1)?.ok;
  return <div className="study-hub tool-study temp-review">
    <button className="campus-back" onClick={onBack}><ArrowLeft size={17}/>Volver al ramo</button>
    <header className="campus-heading"><p>INSTRUMENTACIÓN INDUSTRIAL · UNIDAD 2 · GUÍA G03</p><h1 id="campus-title" tabIndex={-1}>Temperatura · Repaso de la guía G03</h1></header>
    {blocked&&<p role="alert">El historial de repaso anterior no se pudo leer y se conserva sin cambios. Puedes repasar, pero este avance no se guardará.</p>}
    {current&&session&&<section className="tool-study-body" aria-live="polite">
      <p className="temp-review-progress">Pregunta {session.index+1} de {session.questions.length} · {CONCEPTS.find(c=>c.id===current.concept)!.title}</p>
      <fieldset className="tool-study-question" disabled={session.checked}><legend>{current.question}</legend>{current.options.map((text,i)=><label key={text}><input type="radio" name="review-question" value={i} checked={session.answer===String(i)} onChange={e=>setSession({...session,answer:e.target.value})}/>{text}</label>)}</fieldset>
      {!session.checked?<button className="class-start" disabled={!session.answer} onClick={check}>Comprobar respuesta <Check size={17}/></button>:<>
        <p className={`tool-study-feedback ${lastOk?'is-right':''}`} role="status">{lastOk?'Correcto. ':'No es esa. '}{current.explanation}</p>
        <button className="class-start" onClick={next}>{session.index+1>=session.questions.length?'Ver resultado':'Siguiente'} <ArrowRight size={17}/></button></>}
    </section>}
    {done&&<section className="tool-study-body">
      <h2>Resultado del repaso</h2>
      <p className="temp-review-score">{done.results.filter(r=>r.ok).length} de {done.results.length} correctas</p>
      {done.results.some(r=>!r.ok)?<><p>Conviene volver a estos conceptos:</p><ul className="temp-review-list">{[...new Set(done.results.filter(r=>!r.ok).map(r=>r.concept))].map(id=>{const c=CONCEPTS.find(x=>x.id===id)!,f=fix(id);return <li key={id}><strong>{c.title}</strong><span>{c.summary}</span><a href={f.href}>{f.label} <ExternalLink size={13}/></a></li>;})}</ul></>:<p>Respondiste todo bien. Un concepto con errores previos queda como «repasado» después de dos aciertos seguidos.</p>}
      <button className="class-start" onClick={()=>start(false)}>Repasar de nuevo <RotateCcw size={16}/></button>
    </section>}
    {!session&&<section className="tool-study-body">
      <p className="tool-study-intro">{pending.length?`Tienes ${pending.length} ${pending.length===1?'concepto':'conceptos'} con errores por repasar. El repaso empieza por ellos.`:'Todavía no hay errores pendientes. Puedes hacer un repaso general de la guía.'}</p>
      <p className="tool-study-note">Los errores se anotan cuando respondes mal una pregunta, un paso de la práctica no se cumple o armas un montaje sin sentido físico (por ejemplo, medir la termocupla en Ω). Se guardan solo en este navegador. Esto es un repaso para estudiar, no una calificación.</p>
      <div className="temp-review-actions"><button className="class-start" onClick={()=>start(false)}>{pending.length?'Repasar mis errores':'Empezar repaso general'} <ArrowRight size={18}/></button>{pending.length>0&&<button className="tool-study-secondary" onClick={()=>start(true)}>Repasar todos los conceptos</button>}</div>
      {[1,2,3].map(exp=><div key={exp} className="temp-review-group"><h3>Experiencia {exp}</h3><ul className="temp-review-list">{CONCEPTS.filter(c=>c.experience===exp).map(c=>{const st=statusOf(log,c.id),n=log.concepts[c.id]?.wrong??0,f=fix(c.id);
        return <li key={c.id} data-status={st}><strong>{c.title}</strong><span className={`temp-review-chip ${st}`}>{st==='pendiente'?`Con errores (${n})`:st==='dominado'?'Repasado':'Sin errores'}</span><span>{c.summary}</span>{st==='pendiente'&&<a href={f.href}>{f.label} <ExternalLink size={13}/></a>}</li>;})}</ul></div>)}
      <details className="temp-review-reset"><summary>Borrar mi historial de repaso</summary><p>Se quitan los errores y aciertos anotados. Tus datos del banco y tu avance en las clases no cambian.</p><button className="tool-study-secondary" disabled={blocked} onClick={()=>{if(confirm('¿Borrar el historial de repaso de la guía G03?')){const empty=newReviewLog();writeReview(empty);setLog(empty);}}}>Borrar historial</button></details>
    </section>}
  </div>;
}
