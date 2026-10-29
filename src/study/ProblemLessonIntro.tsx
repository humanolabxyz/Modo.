import {useState} from 'react';
import {ArrowLeft,ArrowRight,Check} from 'lucide-react';
import {teacherProblemTeaching} from './teacherProblemTeaching';
import type {FunctionProblem} from '../learning/functionProblems';
import '../styles/lesson-focus.css';
import {ProblemFormula} from './ProblemFormula';
import {ExamReviewContext} from './ExamReviewContext';
export const problemLessonKey=(id:string)=>`modo:problem-lesson:${id}:v1`;
export function hasProblemLesson(id:string){try{const raw=JSON.parse(localStorage.getItem(problemLessonKey(id))||'null');return raw?.version===1&&raw.correct===teacherProblemTeaching[id]?.correct;}catch{return false;}}
export function ProblemLessonIntro({problem,onPractice,onBack}:{problem:FunctionProblem;onPractice:()=>void;onBack:()=>void}){
 const lesson=teacherProblemTeaching[problem.id];
 const [step,setStep]=useState(0),[symbol,setSymbol]=useState(0),[answer,setAnswer]=useState(''),[checked,setChecked]=useState(false),[feedback,setFeedback]=useState('');
 if(!lesson)return null;
 const move=(next:number)=>{setStep(next);requestAnimationFrame(()=>document.getElementById('problem-lesson-title')?.focus({preventScroll:true}));};
 const review=()=>{const correct=answer!==''&&Number(answer)===lesson.correct;setChecked(correct);setFeedback(correct?'Correcto. Relacionaste el dato con lo que significa en el problema.':answer===''?'Elige una respuesta para comprobar.':lesson.hint);if(correct)try{localStorage.setItem(problemLessonKey(problem.id),JSON.stringify({version:1,correct:lesson.correct}));}catch{/* The lesson remains usable without storage. */}};
 return <article className="study-hub lesson-focus problem-intro" data-function-problem={problem.id} data-problem-lesson>
  <ExamReviewContext/>
  <header className="problem-heading"><div><p>PROBLEMA DEL PROFESOR · LECCIÓN GUIADA</p><h1>{problem.title}</h1></div><button onClick={onBack}><ArrowLeft size={16}/>Volver al ramo</button></header>
  <section className="lesson-focus-card">
   <div className="lesson-focus-meta"><span>{['ENTENDER EL PROBLEMA','LEER LA FÓRMULA','COMPROBAR LA IDEA'][step]}</span><span>{step+1} / 3</span></div>
   <h2 id="problem-lesson-title" tabIndex={-1}>{['Primero, ¿qué está pasando?','La fórmula, en palabras simples','¿Qué entendiste?'][step]}</h2>
   {step===0&&<div className="lesson-reading-step"><p>{lesson.context}</p><div className="lesson-problem-brief"><strong>¿Qué vamos a resolver?</strong><p>{lesson.goal}</p></div><details className="lesson-extra"><summary>Ver el enunciado del profesor</summary><p>{problem.statement}</p></details></div>}
   {step===1&&<div className="lesson-reading-step"><p>{lesson.reading}</p><div className="unit-formula" aria-label={problem.formula}><ProblemFormula id={problem.id}/></div><p className="symbol-instruction">Toca un símbolo para entenderlo. No necesitas memorizar la fórmula.</p><div className="lesson-symbols" role="group" aria-label="Símbolos de la fórmula">{lesson.symbols.map((item,i)=><button key={item.label} aria-pressed={symbol===i} onClick={()=>setSymbol(i)}>{item.label}</button>)}</div><section className="lesson-symbol-card" aria-live="polite"><h3>{lesson.symbols[symbol].label}</h3><p>{lesson.symbols[symbol].meaning}</p><p><strong>Por ejemplo:</strong> {lesson.symbols[symbol].example}</p></section></div>}
   {step===2&&<div className="lesson-question"><h3>{lesson.question}</h3><fieldset><legend className="sr-only">Comprueba la idea antes de practicar</legend>{lesson.options.map((option,i)=><label className="unit-answer-choice" key={option}><input type="radio" name="intro-check" value={i} checked={answer===String(i)} onChange={e=>{setAnswer(e.target.value);setChecked(false);setFeedback('');}}/>{option}</label>)}</fieldset>{feedback&&<p className={checked?'unit-answer-correct':'unit-answer-feedback'} role="status">{feedback}</p>}{checked&&<div className="lesson-problem-brief"><strong>Ya comprobaste la idea. Llevémosla a la práctica.</strong><p>Ahora resolveremos las preguntas del profesor, una por una. Después construirás y comprobarás el modelo en GeoGebra.</p></div>}</div>}
   <footer className="lesson-focus-actions"><button className="lesson-secondary" disabled={!step} onClick={()=>move(step-1)}><ArrowLeft size={16}/>Anterior</button>{step<2?<button className="lesson-primary" onClick={()=>move(step+1)}>{step===0?'Entender la fórmula':'Comprobar qué entendí'}<ArrowRight size={16}/></button>:checked?<button className="lesson-primary" onClick={onPractice}>Resolver las preguntas<ArrowRight size={16}/></button>:<button className="lesson-primary" onClick={review}>Comprobar mi idea<Check size={16}/></button>}</footer>
  </section>
  <button className="lesson-skip" onClick={onPractice}>Ir a las preguntas</button>
 </article>;
}
