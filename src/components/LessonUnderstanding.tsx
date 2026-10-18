import {useEffect,useState} from 'react';
import {ArrowRight,ArrowLeft,Blocks,Cable,Zap,Unplug} from 'lucide-react';
import type {ManualStep} from '../data/practice';
import {teachingForStep} from '../data/lessonTeaching';
import {FloatingWindow} from './FloatingWindow';
import {LessonConnectionCard} from './LessonConnectionCard';
import '../styles/lesson-understanding.css';
import type {LessonId} from '../data/lessonIds';
const topics=[{label:'Componentes',Icon:Blocks},{label:'La conexión',Icon:Cable},{label:'Al funcionar',Icon:Zap},{label:'Si falta',Icon:Unplug}];
export function LessonUnderstanding({step,schematic,open,onToggle,onNext}:{step:ManualStep;schematic:LessonId;open:boolean;onToggle:(open:boolean)=>void;onNext:()=>void}){
 const teaching=teachingForStep(step,schematic),[topic,setTopic]=useState(0);
 useEffect(()=>setTopic(0),[step.id]);
 if(!open)return null;
 return <FloatingWindow title="Comprender la conexión" eyebrow={step.title} width={530} side="left" top={80} className="lesson-study-window" closeLabel="Cerrar explicación del paso" onClose={()=>onToggle(false)}>
  <div className="lesson-surface lesson-study">
   <div className="lesson-topic-tabs" role="group" aria-label="Contenido del paso">{topics.map(({label,Icon},i)=><button type="button" key={label} aria-pressed={topic===i} onClick={()=>setTopic(i)}><Icon size={17}/><span>{label}</span></button>)}</div>
   <LessonConnectionCard from={step.from} to={step.to}/>
   {topic===0?<section className="lesson-topic-content"><span className="lesson-kicker">01 · RECONOCE</span><h2>Quién participa</h2><div className="lesson-device-grid">{teaching.components.map((c,i)=><article key={c.name} className="lesson-device-card"><span className="lesson-device-number">{String(i+1).padStart(2,'0')}</span><h3>{c.name}</h3><p>{c.role}</p></article>)}</div></section>:
    topic===1?<section className="lesson-topic-content"><span className="lesson-kicker">02 · ENTIENDE</span><h2>Por qué se une así</h2><p className="lesson-main-idea">{teaching.why}</p><div className="lesson-context-card"><span>En este paso</span><p>{step.explanation}</p></div></section>:
    topic===2?<section className="lesson-topic-content"><span className="lesson-kicker">03 · SIGUE EL CAMBIO</span><h2>Qué ocurre al funcionar</h2><div className="lesson-effect-card"><Zap size={24}/><p>{teaching.behavior}</p></div><span className="lesson-footnote">Comportamiento representado en el modelo virtual de esta lección.</span></section>:
    <section className="lesson-topic-content"><span className="lesson-kicker">04 · COMPARA</span><h2>Qué cambia si falta</h2><p className="lesson-main-idea">{teaching.without}</p><span className="lesson-footnote">Sin otra unión equivalente que mantenga la misma red.</span><div className="lesson-thought-card"><span>Para pensar</span><p>{teaching.question}</p></div></section>}
   <div className="lesson-window-actions"><button type="button" className="lesson-action" disabled={topic===0} onClick={()=>setTopic(t=>t-1)}><ArrowLeft size={15}/>Atrás</button><span>{topic+1} / 4</span>{topic<3?<button type="button" className="lesson-action is-primary" onClick={()=>setTopic(t=>t+1)}>Siguiente <ArrowRight size={15}/></button>:<button type="button" className="lesson-action is-primary" onClick={onNext}>Leer siguiente paso <ArrowRight size={15}/></button>}</div>
  </div>
 </FloatingWindow>;
}
