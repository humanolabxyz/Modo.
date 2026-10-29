import {StudySequence} from './StudySequence';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ExternalLink,ChartNoAxesCombined,ChevronDown} from 'lucide-react';
import {correctUnit2,freshUnit2,readUnit2,unit2Curve,unit2StorageKey,unit2Topics,type Unit2Save,type Unit2TopicId} from './mathUnit2';
import '../styles/study-focus-unit2.css';
import '../styles/problem-notebook.css';
import '../styles/lesson-focus.css';
import {FormulaMeaning} from './FormulaMeaning';
const fmt=(n:number,d=4)=>n.toLocaleString('es-CL',{maximumFractionDigits:d});
function Curve({topic}:{topic:Unit2TopicId}){
 const plot=useRef<SVGSVGElement>(null),[width,setWidth]=useState(720);
 useEffect(()=>{if(!plot.current)return;const observer=new ResizeObserver(([entry])=>{if(entry.contentRect.width>0)setWidth(Math.max(240,Math.floor(entry.contentRect.width)));});observer.observe(plot.current);return()=>observer.disconnect();},[]);
 const right=width-25;
 const ranges:Record<Unit2TopicId,[number,number,number,number,string,string]>={exp:[-2,4,0,18,'x','f(x)'],bacteria:[0,20,0,4000,'Horas','Bacterias'],elimination:[0,24,0,1000,'Horas','Cantidad (mg)'],logs:[.1,10,-2.5,2.5,'x','ln(x)'],followers:[1,12,0,4500,'Mes','Seguidores']};
 const [min,max,low,high,xLabel,yLabel]=ranges[topic],[x,setX]=useState(topic==='exp'?2:topic==='bacteria'?8:topic==='elimination'?6:topic==='logs'?3:7),y=unit2Curve(topic,x),px=(v:number)=>75+(v-min)/(max-min)*(right-75),py=(v:number)=>248-(v-low)/(high-low)*215;
 const points=Array.from({length:161},(_,i)=>{const t=min+(max-min)*i/160;return `${px(t)},${py(unit2Curve(topic,t))}`;}).join(' ');
 return <section className="unit-curve" aria-label="Explorar la función"><div className="unit-curve-caption"><span>EXPLORA EL MODELO</span><strong>{topic==='elimination'?`Después de ${fmt(x,1)} horas quedan ${fmt(y,2)} mg.`:<>{xLabel}: {fmt(x,1)} <ArrowRight size={13}/> {fmt(y,2)}</>}</strong></div><svg ref={plot} viewBox={`0 0 ${width} 292`} role="img" aria-label={`${yLabel}, calculado para ${xLabel} ${x}: ${fmt(y)}`}>
 {[0,1,2,3,4].map(i=>{const v=low+(high-low)*i/4;return <g key={i}><path d={`M75 ${py(v)}H${right}`} stroke="#e0e0e0" strokeDasharray="3 5"/><text x="65" y={py(v)+4} textAnchor="end" fontSize="11" fill="#717171">{fmt(v,1)}</text></g>;})}<path d={`M75 30V248H${right}`} fill="none" stroke="#b3b3b3"/>
 {min<0&&max>0&&<><path d={`M${px(0)} 30V248`} stroke="#b3b3b3"/><text x={px(0)} y="268" textAnchor="middle" fontSize="11" fill="#717171">0</text></>}{low<0&&high>0&&<path d={`M75 ${py(0)}H${right}`} stroke="#b3b3b3"/>}
 {topic==='elimination'&&<g><path d={`M75 ${py(500)}H${right}`} stroke="#b77928" strokeDasharray="6 4"/><text x={right-3} y={py(500)-8} textAnchor="end" fontSize="12" fill="#946223">La mitad: 500 mg</text></g>}
 <polyline points={points} fill="none" stroke="#2d7059" strokeWidth="3"/><path d={`M${px(x)} ${py(y)}V248`} stroke="#777" strokeDasharray="4 4"/><circle cx={px(x)} cy={py(y)} r="5" fill="#2d7059" stroke="#fff" strokeWidth="2"/>
 {[0,1,2,3,4].map(i=>{const v=min+(max-min)*i/4;return <text key={i} x={px(v)} y="268" textAnchor="middle" fontSize="11" fill="#717171">{fmt(v,1)}</text>;})}<text x="75" y="18" fontSize="11" fill="#555">{yLabel}</text><text x={right} y="287" textAnchor="end" fontSize="11" fill="#555">{xLabel}</text></svg><label>{topic==='elimination'?'Mueve las horas':xLabel}<input aria-label={`Explorar ${xLabel}`} type="range" min={min} max={max} step="0.1" value={x} onChange={e=>setX(Number(e.target.value))}/><output>{fmt(x,1)}</output></label></section>;
}
export function MathUnitReview({initialTopic='all',onBack}:{initialTopic?:'all'|Unit2TopicId;onBack:()=>void}){
 const [topicId,setTopicId]=useState<Unit2TopicId>(initialTopic==='all'?'exp':initialTopic),[view,setView]=useState<'understand'|'example'|'practice'>('understand'),[save,setSave]=useState<Unit2Save>(freshUnit2),[ready,setReady]=useState(false),[problem,setProblem]=useState(''),[feedback,setFeedback]=useState(''),[position,setPosition]=useState(0),[showGraph,setShowGraph]=useState(false);
 const topic=unit2Topics.find(t=>t.id===topicId)!,heading=useRef<HTMLHeadingElement>(null);
 const steps=view==='understand'?topic.ideas:topic.example;
 const question=topic.questions[Math.min(position,topic.questions.length-1)],checked=save.checked.includes(question.id);
 const count=view==='practice'?topic.questions.length:steps.length;
 const current=Math.min(position,count-1);
 const focus=()=>requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));
 const navigate=(next:typeof view)=>{setView(next);setPosition(0);setShowGraph(false);setFeedback('');focus();};
 const move=(next:number)=>{setPosition(next);setFeedback('');focus();};
 useEffect(()=>{try{const raw=localStorage.getItem(unit2StorageKey);if(raw)setSave(readUnit2(JSON.parse(raw)));}catch{setProblem('El avance anterior no se pudo leer y se conserva. Puedes practicar en esta sesión.');}setReady(true);},[]);
 useEffect(()=>{if(!ready||problem)return;try{localStorage.setItem(unit2StorageKey,JSON.stringify(save));}catch{setProblem('No se pudo guardar. Las respuestas de esta sesión siguen disponibles.');}},[save,ready,problem]);
 const update=(answer:string)=>{setSave(s=>({...s,answers:{...s.answers,[question.id]:answer},checked:s.checked.filter(k=>k!==question.id)}));setFeedback('');};
 const check=()=>{const answer=save.answers[question.id]||'';if(!answer.trim()){setFeedback('Escribe o selecciona una respuesta.');return;}const correct=correctUnit2(question,answer);setSave(s=>({...s,checked:correct?[...new Set([...s.checked,question.id])]:s.checked.filter(k=>k!==question.id)}));setFeedback(correct?'':question.hint);};
 const advance=()=>{if(current<count-1)move(current+1);else navigate(view==='understand'?'example':'practice');};
 return <article className="study-hub unit-review lesson-focus" data-unit-review="unidad-2">
   <header className="lesson-focus-heading"><span className="study-kicker">UNIDAD 2 · LECCIÓN GUIADA</span><h1 id="campus-title">{topic.title}</h1><p>{initialTopic==='all'?'Elige un tema y avanza a tu ritmo.':'Entiende el modelo, sigue el ejemplo y resuelve una pregunta a la vez.'}</p></header>
   {problem&&<p role="alert" className="unit-review-notice">{problem}</p>}
   {initialTopic==='all'&&<label className="lesson-topic-picker">Tema<select aria-label="Tema del repaso" value={topicId} onChange={e=>{setTopicId(e.target.value as Unit2TopicId);navigate('understand');}}>{unit2Topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}
   <StudySequence className="unit-review-modes" label="Recorrido de la lección" value={view} onChange={next=>{if(next!=='check')navigate(next);}}/>
   <section className="lesson-focus-card" aria-label={view==='practice'?'Práctica de la Unidad 2':view==='example'?'Ejemplo resuelto de la Unidad 2':'Explicación de la Unidad 2'}>
     <div className="lesson-focus-meta"><span>{view==='understand'?'ENTENDER':view==='example'?'EJEMPLO':'TU TURNO'} · {current+1} DE {count}</span><span>{topic.questions.filter(q=>save.checked.includes(q.id)).length}/{topic.questions.length} respuestas</span></div>
     {!(view==='understand'&&current<2&&topicId==='elimination')&&<FormulaMeaning key={topic.id} topic={topic.id} formula={topic.formula}/>}
     {view==='practice'?<div className="lesson-question" key={question.id}>
       <h2 ref={heading} tabIndex={-1}>{question.prompt}</h2>
       <fieldset disabled={!ready}><legend className="sr-only">Tu respuesta</legend>{question.options?question.options.map((option,i)=><label className="unit-answer-choice" key={option}><input type="radio" name={question.id} value={i} checked={save.answers[question.id]===String(i)} onChange={e=>update(e.target.value)}/>{option}</label>):<label className="unit-answer-number">Tu respuesta {question.unit&&`en ${question.unit}`}<input aria-label={`Respuesta ${question.id}`} aria-invalid={!!feedback&&!checked} inputMode="decimal" value={save.answers[question.id]||''} maxLength={100} onChange={e=>update(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')check();}}/></label>}</fieldset>
       <p className={checked?'unit-answer-correct':'unit-answer-feedback'} role="status">{checked?`Correcto. ${question.explanation}`:feedback}</p>
       {!checked&&<details className="lesson-extra"><summary>Necesito una pista</summary><p>{question.hint}</p></details>}
       {checked&&current===count-1&&<div className="lesson-problem-brief"><strong>Ya comprobaste la idea. Llevémosla a la práctica.</strong><p>Ahora aplicarás lo aprendido a un problema de las capturas del profesor. Cambian los datos y el contexto: la lección te ayudará a leer la nueva fórmula antes de resolver.</p></div>}
     </div>:<div className="lesson-reading-step" key={`${view}-${current}`}>
       <h2 ref={heading} tabIndex={-1}>{steps[current][0]}</h2>
       {current===0&&view==='understand'&&<div className="lesson-problem-brief"><strong>El problema, en palabras simples</strong><p>{topic.lead}</p></div>}
       <p>{steps[current][1]}</p>
       <button className="lesson-graph-toggle" aria-label={showGraph?'Ocultar la gráfica':'Ver la gráfica'} aria-expanded={showGraph} aria-controls="lesson-graph" onClick={()=>setShowGraph(!showGraph)}><ChartNoAxesCombined size={21}/><span><strong>{showGraph?'Ocultar la gráfica':'Ver la gráfica'}</strong><small>{topic.id==='elimination'?'Mueve las horas y mira cuánto queda':'Cambia un valor y observa el resultado'}</small></span><ChevronDown size={17}/></button>
       {showGraph&&<div id="lesson-graph"><p className="lesson-graph-help">{topic.id==='elimination'?'Abajo se leen las horas y al costado los miligramos que quedan. Mueve el control de horas: el punto verde muestra la cantidad. La línea marcada en 500 mg es la mitad que buscamos.':'Mueve el control de abajo. El punto verde muestra cómo cambia el resultado para el valor que elegiste.'}</p><Curve key={topic.id} topic={topic.id}/></div>}
     </div>}
     <footer className="lesson-focus-actions"><button className="lesson-secondary" disabled={current===0&&view==='understand'} onClick={()=>current?move(current-1):navigate(view==='practice'?'example':'understand')}><ArrowLeft size={16}/>Anterior</button>
       {view==='practice'?(checked?(current<count-1?<button className="lesson-primary" onClick={()=>move(current+1)}>Siguiente pregunta<ArrowRight size={16}/></button>:<a className="lesson-primary" href={`/estudio?curso=s2-5&clase=mtfm01-problema-${({exp:'poblacion',bacteria:'poblacion',elimination:'estroncio',logs:'planta',followers:'ahorro'} as const)[topic.id]}${initialTopic==='all'?'&repaso=unidad2':''}`}>Resolver un problema del profesor<ArrowRight size={16}/></a>):<button className="lesson-primary" disabled={!ready} onClick={check}>Comprobar respuesta<Check size={16}/></button>):<button className="lesson-primary" onClick={advance}>{current<count-1?'Siguiente paso':view==='understand'?'Ver el ejemplo':'Resolver yo'}<ArrowRight size={16}/></button>}
     </footer>
   </section>
   <details className="lesson-extra lesson-resources"><summary>Material y herramientas de apoyo</summary><p>{topic.remember}</p><a href={`/estudio/fuentes/${topic.source}.pdf#page=${topic.pages.split('–')[0]}`} target="_blank" rel="noreferrer"><BookOpen size={15}/>Documento original · {topic.source}<ExternalLink size={14}/></a><a href="/laboratorio?tool=geogebra">Explorar en GeoGebra<ArrowRight size={15}/></a><a href="/estudio?curso=s2-5&unidad=mtfm01-u2&modulo=mtfm01-u2-formativas">Problemas del profesor: población, estroncio, bancos y planta<ArrowRight size={15}/></a>
   {topic.commands&&<pre>{topic.commands.join('\n')}</pre>}
   {topic.id==='bacteria'&&<p>En la actividad 5, revisa con tu profesor el signo de la fórmula logística de la página 3: la forma impresa con +1 no devuelve P₀ cuando t=0. Mantén esta observación al resolverla.</p>}
   </details>
 </article>;
}
