import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,GraduationCap} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {LessonConnectionCard} from '../components/LessonConnectionCard';
import {breadboardLesson,breadboardLessons,checkBreadboardStep,freshLesson,newBreadboardProgress,readBreadboardProgress,type BreadboardContext,type BreadboardProgress,type LessonProgress} from '../learning/breadboardLessons';
import {holeName} from './dc';
import type {Laboratory} from './useLaboratory';
import '../styles/lesson-understanding.css';
import '../styles/guide-confirmation.css';
import '../styles/bench-practice.css';
const labelFor=(id:string)=>`Protoboard · ${holeName(id)}`;
function requested(){const q=new URLSearchParams(location.search);return breadboardLesson(q.get('leccion')?.replace(/^protoboard-/,''))??breadboardLesson(q.get('practica'));}
export function BreadboardPractice({lab,context,onOpenGuide,onCable,onTargets,onVisibility,action,onFaults}:{onFaults?:()=>void;action:{kind:'catalog'|'free';id:number};lab:Laboratory['board'];context:Omit<BreadboardContext,'startedAt'>;onOpenGuide:()=>void;onCable:()=>void;onTargets:(ids:[string,string]|null,ghost?:boolean)=>void;onVisibility:(visible:boolean)=>void}){
 const [selected,setSelected]=useState(()=>requested()?.id??'fundamentals'),[open,setOpen]=useState(()=>!!requested()),[catalog,setCatalog]=useState(()=>!requested()),[understand,setUnderstand]=useState(false),[help,setHelp]=useState<1|2|3>(1),[input,setInput]=useState(''),[choice,setChoice]=useState<number|null>(null),[feedback,setFeedback]=useState(''),[confirmed,setConfirmed]=useState(false),[minimized,setMinimized]=useState(false);
 const key=`panellab.breadboardLessons.v1.${lab.project.id}`;
 const [initial]=useState(()=>{try{return {data:readBreadboardProgress(localStorage.getItem(key)),error:''};}catch{return {data:newBreadboardProgress(),error:'No se pudo leer el progreso anterior. Se conserva sin sobrescribir; este recorrido continuará sin guardado.'};}});
 const [saved,setSaved]=useState<BreadboardProgress>(initial.data),[storageError,setStorageError]=useState(initial.error);
 const item=breadboardLesson(selected)??breadboardLessons[0],progress=saved.lessons[item.id],fallback=useRef(freshLesson()),current=progress??fallback.current,step=item.steps[current.step],done=item.steps.every(s=>current.completed.includes(s.id));
 const update=(change:(old:BreadboardProgress)=>BreadboardProgress)=>setSaved(old=>change(old));
 useEffect(()=>{if(storageError)return;try{localStorage.setItem(key,JSON.stringify(saved));}catch{setStorageError('El navegador no pudo guardar el progreso. Conserva tus mediciones exportando el proyecto.');}},[saved,key,storageError]);
 const patch=(change:Partial<LessonProgress>)=>update(old=>({...old,lessons:{...old.lessons,[item.id]:{...(old.lessons[item.id]??fallback.current),...change}}}));
 const setRoute=(id:string|null)=>{const u=new URL(location.href);u.searchParams.delete('practica');if(id)u.searchParams.set('leccion',`protoboard-${id}`);else u.searchParams.delete('leccion');history.replaceState(null,'',u);};
 const resetForm=()=>{setInput('');setChoice(null);setFeedback('');setConfirmed(false);setUnderstand(false);};
 const select=(id:string)=>{setSelected(id);setOpen(true);setMinimized(false);setCatalog(false);resetForm();if(!saved.lessons[id])update(old=>({...old,lessons:{...old.lessons,[id]:freshLesson()}}));setRoute(id);};
 useEffect(()=>{if(open&&!catalog&&!progress)update(old=>({...old,lessons:{...old.lessons,[item.id]:freshLesson()}}));},[open,catalog,item.id,!!progress]);
 const visibilityRef=useRef(onVisibility);visibilityRef.current=onVisibility;
 useEffect(()=>{visibilityRef.current(open&&!minimized);return()=>visibilityRef.current(false);},[open,minimized]);
 const targetRef=useRef(onTargets);targetRef.current=onTargets;
 useEffect(()=>{targetRef.current(open&&!catalog&&help>=2?step.targets??null:null,help===3);return()=>targetRef.current(null);},[open,catalog,item.id,step.id,help]);
 const ctx:BreadboardContext={...context,startedAt:current.startedAt},status=step.check?checkBreadboardStep(step,ctx,'',null):null,autoOK=!!progress&&!!status?.ok&&!current.completed.includes(step.id);
 const latest=useRef({patch,current,item,step});latest.current={patch,current,item,step};
 useEffect(()=>{if(!open||catalog||understand||!autoOK)return;setMinimized(false);setConfirmed(true);setFeedback('Acción comprobada en el banco.');latest.current.patch({completed:[...latest.current.current.completed,latest.current.step.id]});},[open,catalog,understand,autoOK,item.id,step.id]);
 useEffect(()=>{if(!confirmed)return;const timer=setTimeout(()=>{const {current,item,patch}=latest.current;if(current.step<item.steps.length-1)patch({step:current.step+1});resetForm();},2060);return()=>clearTimeout(timer);},[confirmed,item.id,step.id]);
 const next=(index:number)=>{patch({step:index});resetForm();};
 const check=()=>{const result=checkBreadboardStep(step,ctx,input,choice);setFeedback(result.ok?step.quiz?.why??'Respuesta comprobada con tus mediciones.':result.message);if(result.ok&&!current.completed.includes(step.id))patch({completed:[...current.completed,step.id]});};
 const load=()=>{if(lab.running)return;const reference=item.template();lab.update(p=>({...p,breadboard:{...reference,log:p.breadboard.log,notes:p.breadboard.notes}}));patch(freshLesson());resetForm();setFeedback('Referencia preparada. Deshacer recupera el montaje anterior.');};
 const close=()=>{setOpen(false);setUnderstand(false);setConfirmed(false);};
 const free=()=>{close();setRoute(null);};
 useEffect(()=>{if(!action.id)return;if(action.kind==='free')free();else{setOpen(true);setMinimized(false);setCatalog(true);setUnderstand(false);}},[action.id]);
 return <>
  {open&&minimized?<button type="button" className="breadboard-resume" onClick={()=>setMinimized(false)}>Volver a la guía · {current.step+1}/{item.steps.length} · {step.title}</button>:null}
  {open&&!minimized?<FloatingWindow title={catalog?'Lecciones de protoboard':'Guía de la lección'} eyebrow="APRENDER EN EL BANCO" width={360} side="left" top={190} anchor="bottom" dockFraction={.48} heightFraction={.68} className="breadboard-lesson-window" scaleBody={false} closeLabel="Cerrar práctica guiada" onClose={close}>
   <div className="lesson-surface breadboard-lesson" aria-label="Práctica guiada de protoboard" data-lesson-id={item.id} data-step-id={step.id}>
    {catalog?<><div className="lesson-panel-heading"><span className="lesson-kicker">COMPRENDER · CONECTAR · COMPROBAR</span><h2>Aprende sobre la placa</h2><p>Como en el simulador: una acción por paso, ayuda progresiva y comprobación sobre tu montaje.</p></div>{onFaults&&<button type="button" className="lesson-action" onClick={onFaults}><GraduationCap size={19}/><span><b>Modo prueba · buscar fallos</b><small>Diagnostica y repara tu puente H con transistores</small></span><ArrowRight size={15}/></button>}<div className="assessment-menu-links">{breadboardLessons.map(l=>{const count=saved.lessons[l.id]?.completed.length??0;return <button type="button" key={l.id} onClick={()=>select(l.id)}><BookOpen size={19}/><span><b>{l.title}</b><small>{l.subtitle}</small><small>{count}/{l.steps.length} pasos comprobados{count>0?' · continuar':''}</small></span><ArrowRight size={15}/></button>;})}</div><p className="lesson-footnote">Abrir una lección conserva tu montaje. La referencia se carga solo al pedirla.</p></>:<>
     <button type="button" className="lesson-menu-return" onClick={()=>{setCatalog(true);setUnderstand(false);setConfirmed(false);}}><ArrowLeft size={14}/>Todas las lecciones</button>
     <div className="guide-top"><span>LECCIÓN · {current.step+1}/{item.steps.length}</span><span>{current.completed.length} comprobados</span></div>
     <strong>{item.title}</strong><h2>{step.title}</h2>
     {done?<div className="guide-success"><CheckCircle2 size={20}/><div><strong>Recorrido completado</strong><p>Las conexiones y respuestas comprobadas se conservan en este proyecto.</p></div></div>:null}
     {confirmed?<div className="breadboard-confirm" role="status"><CheckCircle2 size={32}/><strong>¡Paso correcto!</strong><span>Comprobado en el banco · preparando el siguiente paso…</span></div>:<>
      <button type="button" className="lesson-study-launch" aria-label="Comprender este paso" aria-expanded={understand} onClick={()=>setUnderstand(true)}><BookOpen size={17}/><span><b>Comprender este paso</b><small>Conexión, medida y funcionamiento</small></span><ArrowRight size={16}/></button>
      <p className="breadboard-consigna">{step.action}</p><button type="button" className="lesson-action" onClick={()=>{setMinimized(true);setUnderstand(false);}}>Despejar el banco para practicar<ArrowRight size={15}/></button>
      {help>=2&&step.targets?<LessonConnectionCard from={step.targets[0]} to={step.targets[1]} labelFor={labelFor}/>:null}
      <details className="guide-hints"><summary>Ayuda · nivel {help}/3</summary><div className="assistance-levels" aria-label="Nivel de ayuda">{([1,2,3] as const).map(level=><button type="button" key={level} aria-pressed={help===level} onClick={()=>setHelp(level)}>{level===1?'Consigna':level===2?'Orificios':'Conexión'}</button>)}</div><p>{help===1?'Busca los puntos de la consigna en la placa.':help===2?'Los anillos marcan los dos puntos del paso.':step.targets?'La línea de puntos es una referencia de medida; no instala un cable ni conecta las puntas.':'Comprueba el montaje y compara con las condiciones de la guía.'}</p>{step.targets?<button type="button" className="lesson-action" onClick={()=>setHelp(3)}>Ver en el banco</button>:null}</details>
      {step.ask?<label className="breadboard-answer">{step.ask.label} ({step.ask.unit})<input aria-label={step.ask.label} inputMode="decimal" value={input} maxLength={24} onChange={e=>{setInput(e.target.value);setFeedback('');}}/></label>:null}
      {step.quiz?<fieldset className="breadboard-question"><legend>{step.quiz.question}</legend>{step.quiz.options.map((option,i)=><label key={option}><input type="radio" name={`breadboard-${item.id}-${step.id}`} checked={choice===i} onChange={()=>{setChoice(i);setFeedback('');}}/>{option}</label>)}</fieldset>:null}
      {step.ask||step.quiz?<button type="button" className="lesson-action is-primary" onClick={check}>Comprobar respuesta</button>:<p className="guide-waiting" role="status"><i/>{current.completed.includes(step.id)?'Paso comprobado. Puedes repetir la acción o continuar.':status?.message??'Esperando tu acción en el banco…'}</p>}
      {feedback?<p role="status" className={current.completed.includes(step.id)?'guide-success':'guide-feedback'}>{feedback}</p>:null}
     </>}
     <div className="lesson-window-actions"><button type="button" className="lesson-action" disabled={current.step===0||confirmed} onClick={()=>next(current.step-1)}><ArrowLeft size={15}/>Anterior</button><span>{current.step+1} / {item.steps.length}</span><button type="button" className="lesson-action is-primary" disabled={current.step===item.steps.length-1||!current.completed.includes(step.id)||confirmed} onClick={()=>next(current.step+1)}>Siguiente<ArrowRight size={15}/></button></div>
     <details className="breadboard-lesson-options"><summary>Montaje de referencia y observaciones</summary><p>También puedes armarlo a mano con los componentes del banco. Cargarlo sustituye esta protoboard; Deshacer recupera el montaje anterior.</p><button type="button" className="lesson-action" disabled={lab.running||!lab.ready} onClick={load}>Cargar referencia · reemplaza esta protoboard (Deshacer disponible)</button><button type="button" className="lesson-action" onClick={()=>{patch(freshLesson());resetForm();}}>Repetir recorrido conservando el montaje</button><label>Mis observaciones<textarea aria-label="Observaciones de la lección" maxLength={4000} rows={3} value={current.notes} onChange={e=>patch({notes:e.target.value})}/></label></details>
     {item.source?<a className="lesson-action" href={item.source} target="_blank" rel="noreferrer">Guía original · {item.sourceLabel} ↗</a>:<small>{item.sourceLabel}</small>}
     <small>Progreso guardado por proyecto en este navegador. Las mediciones se exportan desde la libreta.</small>
    </>}
    {storageError?<p role="alert">{storageError}</p>:null}
   </div>
  </FloatingWindow>:null}
  {understand&&open&&!catalog?<FloatingWindow title="Comprender este paso" eyebrow={step.title} width={470} side="right" top={110} anchor="bottom" className="lesson-study-window" closeLabel="Cerrar explicación del paso" onClose={()=>setUnderstand(false)}>
   <div className="lesson-surface lesson-study"><span className="lesson-kicker">COMPRENDE ANTES DE CONECTAR</span><h2>{step.title}</h2>{step.targets?<LessonConnectionCard from={step.targets[0]} to={step.targets[1]} labelFor={labelFor}/>:null}<p className="lesson-main-idea">{step.explain}</p><div className="lesson-context-card"><span>En este paso</span><p>{step.action}</p></div><button type="button" className="lesson-action is-primary" onClick={()=>{setUnderstand(false);setMinimized(true);}}>Hacer en el banco<ArrowRight size={15}/></button></div>
  </FloatingWindow>:null}
 </>;
}
