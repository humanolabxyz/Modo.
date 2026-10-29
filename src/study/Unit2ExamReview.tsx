import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check} from 'lucide-react';
import {functionProblems} from '../learning/functionProblems';
import {geoLesson,readGeoProgress} from '../learning/geogebraLessons';
import {readProblemSave} from './FunctionProblemNotebook';
import {MathUnitReview} from './MathUnitReview';
import '../styles/unit2-exam-review.css';

type Counts={answers:number;geo:number;error:boolean};
export const formativeReviewUrl=(id:string)=>`/estudio?curso=s2-5&clase=mtfm01-${id}&unidad=mtfm01-u2&modulo=mtfm01-u2-formativas&repaso=unidad2`;
const skills=['Valor inicial, población en 2015, encontrar el año y leer la gráfica.','Cantidad inicial, tiempo, cantidad a los 50 años y gráfica.','Comparar bancos, interpretar miles de pesos, meses y ganancias.','Altura inicial, altura a los 79 días, tiempo y ejes de la gráfica.'];
export function Unit2ExamReview({onBack}:{onBack:()=>void}){
 const [counts,setCounts]=useState<Record<string,Counts>>({}),[ready,setReady]=useState(false),[basics,setBasics]=useState(false);
 useEffect(()=>{const read=()=>{const next:Record<string,Counts>={};for(const p of functionProblems){let answers=0,geo=0,error=false;try{const raw=localStorage.getItem(`modo:function-problem:${p.id}:v1`);if(raw)answers=readProblemSave(JSON.parse(raw),p).checked.length;}catch{error=true;}try{const lesson=geoLesson(p.id);if(lesson)geo=new Set(readGeoProgress(lesson).completed).size;}catch{error=true;}next[p.id]={answers,geo,error};}setCounts(next);setReady(true);};read();window.addEventListener('focus',read);window.addEventListener('storage',read);return()=>{window.removeEventListener('focus',read);window.removeEventListener('storage',read);};},[]);
 const complete=(id:string,n:number)=>!counts[id]?.error&&counts[id]?.answers===n&&counts[id]?.geo===n;
 const next=functionProblems.find(p=>!complete(p.id,p.questions.length))||functionProblems[0];
 const total=functionProblems.reduce((n,p)=>n+(counts[p.id]?.answers||0),0),allComplete=functionProblems.every(p=>complete(p.id,p.questions.length));
 if(basics)return <div data-exam-basics><button className="campus-back" onClick={()=>setBasics(false)}><ArrowLeft size={16}/>Volver al repaso de la prueba</button><MathUnitReview initialTopic="all" onBack={()=>setBasics(false)}/></div>;
 return <article className="study-hub lesson-focus unit2-exam-review" data-unit2-exam-review>
  <header className="lesson-focus-heading"><span className="study-kicker">PRUEBA · 19 DE OCTUBRE DE 2026</span><h1>Repaso de la Unidad 2</h1><p>Repasa las cuatro actividades formativas que indicaste para la prueba. Entiende el problema, resuélvelo y compruébalo en GeoGebra.</p></header>
  <section className="exam-review-start" aria-label="Continuar el repaso"><div><strong>{allComplete?'Terminaste este recorrido de repaso':total?'Retoma tu repaso':'Empieza por las actividades formativas'}</strong><p>{ready?`${total}/17 respuestas comprobadas · avance guardado en este navegador`:'Leyendo tu avance…'}</p></div><a href={formativeReviewUrl(next.id)}>{allComplete?'Volver a practicar':total?'Continuar repaso':'Empezar repaso'}<ArrowRight size={17}/></a></section>
  <ol className="exam-formative-list" aria-label="Actividades formativas para la prueba">{functionProblems.map((p,i)=>{const progress=counts[p.id];return <li key={p.id}><a href={formativeReviewUrl(p.id)}><span className="exam-activity-number">{complete(p.id,p.questions.length)?<Check size={17}/>:i+1}</span><span><strong>{p.title}</strong><span className="exam-activity-skill">{skills[i]}</span><small>{!ready?'Leyendo avance…':progress?.error?'No se pudo leer parte del avance. El guardado anterior se conserva.':`${progress?.answers||0}/${p.questions.length} respuestas · ${progress?.geo||0}/${p.questions.length} actividades en GeoGebra`}</small></span><ArrowRight size={17}/></a></li>;})}</ol>
  <details className="lesson-extra exam-foundations"><summary>¿Te cuesta una fórmula? Refuerza las bases</summary><p>Exponenciales, bacterias, eliminación de fármacos, logaritmos y seguidores. Explicaciones y ejemplos de los cinco documentos de la Unidad 2.</p><button onClick={()=>setBasics(true)}><BookOpen size={17}/>Repasar fórmulas y ejemplos<ArrowRight size={16}/></button></details>
  <button className="lesson-skip" onClick={onBack}><ArrowLeft size={16}/>Volver al ramo</button>
 </article>;
}
