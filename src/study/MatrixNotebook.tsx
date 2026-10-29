import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {laboratoryLessonUrl,type GeoLesson} from '../learning/geogebraLessons';
import {matrixNotebooks} from './matrixNotebooks';
import '../styles/matrix-notebook.css';
import '../styles/problem-notebook.css';

export function MatrixNotebook({lesson,example,onExample}:{lesson:GeoLesson;example:boolean;onExample:()=>void}){
  const content=matrixNotebooks[lesson.id];
  const [part,setPart]=useState(0),[answers,setAnswers]=useState<string[]>([]),[saveStatus,setSaveStatus]=useState(''),[storageReady,setStorageReady]=useState(false),[answering,setAnswering]=useState(false),[questionIndex,setQuestionIndex]=useState(0),[showData,setShowData]=useState(false);
  const key=`modo:matrix-analysis:${lesson.id}:v1`;
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(key);
      if(raw){const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed)||parsed.length>content.questions.length||parsed.some(a=>typeof a!=='string'||a.length>4000))throw new Error('Invalid answers');setAnswers(parsed);}
      setStorageReady(true);
    }catch{setSaveStatus('No se pudieron leer las respuestas guardadas. Puedes escribir aquí, pero no se sobrescribirá el guardado anterior.');}
  },[key,content]);
  const writeAnswer=(index:number,value:string)=>{
    const next=[...answers];for(let i=0;i<=index;i++)next[i]??='';next[index]=value;setAnswers(next);
    if(storageReady)try{localStorage.setItem(key,JSON.stringify(next));setSaveStatus('Respuestas guardadas en este navegador.');}catch{setSaveStatus('No se pudieron guardar los cambios. Copia tus respuestas antes de salir.');}
  };
  const sections=example?content.worked:content.ideas,current=sections[part];
  const question=content.questions[questionIndex];
  return <section className="matrix-notebook problem-notebook" aria-label="Cuaderno de matrices">
    <a className="problem-course-link" href="/estudio?curso=s2-5&clase=mtfm01-problema-poblacion&paso=0">Problemas del profesor: población, estroncio, bancos y planta <ArrowRight size={16}/></a>
    <div className="matrix-compact-controls"><button aria-pressed={!answering} onClick={()=>{setAnswering(false);setShowData(false);}}>Leer explicación</button><button aria-pressed={answering} onClick={()=>{setAnswering(true);setShowData(false);}}>Responder preguntas</button><button className="matrix-data-toggle" aria-expanded={showData} onClick={()=>setShowData(!showData)}>Ver datos del problema</button></div>
    <div className="problem-workspace" data-panel={showData?'statement':'answer'}>
      <aside className="problem-statement"><h2>El problema</h2><p>{content.problem}</p><small>Ejemplo complementario de matrices.</small>{content.matrices.map(matrix=><div className="matrix-table-wrap" key={matrix.name}><table><caption>{matrix.name}</caption><thead><tr><th scope="col">Registro</th>{matrix.columns.map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{matrix.rows.map((row,i)=><tr key={i}><th scope="row">{matrix.labels[i]}</th>{row.map((value,j)=><td key={j}>{value}</td>)}</tr>)}</tbody></table></div>)}</aside>
      <section className="problem-task"><div className="problem-task-body">{answering?<>
        <nav className="matrix-question-nav" aria-label="Preguntas de análisis">{content.questions.map((q,i)=><button key={q.prompt} aria-label={`Responder pregunta ${i+1}`} aria-current={i===questionIndex?'step':undefined} onClick={()=>setQuestionIndex(i)}>{i+1}</button>)}</nav>
        <span className="problem-step-label">PREGUNTA {questionIndex+1} DE {content.questions.length}</span><h2>{question.prompt}</h2><label htmlFor="matrix-answer">Tu razonamiento</label><textarea id="matrix-answer" maxLength={4000} value={answers[questionIndex]||''} onChange={e=>writeAnswer(questionIndex,e.target.value)} placeholder="Explica el cálculo y qué significa el resultado…"/><div className="problem-help" key={questionIndex}><details><summary>Necesito una pista</summary><p>{question.hint}</p></details><details><summary>Contrastar mi respuesta</summary><p>{question.response}</p></details></div><p className="problem-graph-note">Se guarda tu explicación. No se califica automáticamente.</p>
      </>:<><span className="problem-step-label">{example?'PASO':'IDEA'} {part+1} DE {sections.length}</span><h2>{current.title}</h2><p className="matrix-current-text">{current.text}</p><nav className="matrix-section-nav" aria-label="Pasos de la explicación">{sections.map((s,i)=><button key={s.title} aria-current={part===i?'step':undefined} onClick={()=>setPart(i)}>{s.title.replace(/^\d\. /,'')}</button>)}</nav></>}</div>
      <footer className="problem-actions"><button disabled={answering?questionIndex===0:part===0} onClick={()=>answering?setQuestionIndex(questionIndex-1):setPart(part-1)}><ArrowLeft size={16}/>Anterior</button>{answering?(questionIndex<content.questions.length-1?<button onClick={()=>setQuestionIndex(questionIndex+1)}>Siguiente pregunta<ArrowRight size={16}/></button>:<a href={laboratoryLessonUrl(lesson)}>Practicar en GeoGebra<ArrowRight size={16}/></a>):part<sections.length-1?<button onClick={()=>setPart(part+1)}>Siguiente {example?'paso':'idea'}<ArrowRight size={16}/></button>:example?<button onClick={()=>setAnswering(true)}>Responder preguntas<ArrowRight size={16}/></button>:<button onClick={onExample}>Ver el ejemplo<ArrowRight size={16}/></button>}</footer></section>
    </div><p className="problem-save" role="status">{saveStatus||'Tus respuestas se guardan en este navegador al escribir.'}</p>
  </section>;
}
