import {useEffect,useState} from 'react';
import {ArrowRight,FileDown} from 'lucide-react';
import type {BananaCable} from '../data/practice';
import type {LessonAssessment as Assessment} from '../data/assessmentState';
import {LESSONS,terminalLabel} from '../data/lessons';
import {answerFor,assessLesson,questionFor} from '../data/lessonAssessment';
import {teachingForStep} from '../data/lessonTeaching';
import '../styles/lesson-understanding.css';

/** Drafts survive minimizing/reloading, without adding an undo/history entry for every keystroke. */
function Draft({storageKey,value,onSave,label,rows=4,maxLength=3000}:{storageKey:string;value:string;onSave:(text:string)=>void;label:string;rows?:number;maxLength?:number}){
 const [text,setText]=useState(()=>{try{return localStorage.getItem(storageKey)?.slice(0,maxLength)??value}catch{return value}}),[error,setError]=useState('');
 const save=()=>{onSave(text);try{localStorage.removeItem(storageKey)}catch{}setError('')};
 return <div className="lesson-answer"><label>{label}<textarea aria-label={label} value={text} maxLength={maxLength} rows={rows} onChange={e=>{setText(e.target.value);try{localStorage.setItem(storageKey,e.target.value);setError('')}catch{setError('No se pudo conservar el borrador. Guarda la respuesta antes de cerrar.')}}}/></label><small>{text.length}/{maxLength} · {!text.trim()?'Escribe tu respuesta':text===value?'Respuesta guardada':'Borrador; pulsa Guardar para incluirlo en la entrega'}</small>{error&&<p role="alert">{error}</p>}<button type="button" className="lesson-primary" onClick={save} disabled={!text.trim()||text===value}>Guardar respuesta <ArrowRight size={15}/></button></div>;
}

const goals={simple:'Construye un circuito de marcha y paro que mantenga el motor en marcha al soltar el pulsador, incluya la intervención del térmico y sus señales de estado, y reproduzca la fuerza y protección del esquema.',inversion:'Construye el circuito de inversión de giro con marcha en ambos sentidos, paro, retención, enclavamiento entre contactores y señales de estado. Reproduce también la fuerza y protección del esquema.'};
export function LessonAssessment({assessment,wires,wireId,onChange,onChoose,onReference,onMinimize,onExit}:{assessment:Assessment;wires:BananaCable[];wireId:string|null;onChange:(next:Assessment)=>void;onChoose:(id:string|null)=>void;onReference:()=>void;onMinimize:()=>void;onExit:()=>void}){
 const lesson=LESSONS[assessment.lessonId],report=assessLesson(assessment,wires);
 const wire=wires.find(w=>w.id===wireId)??wires.find(w=>!answerFor(assessment,w)?.text.trim())??wires.at(-1);
 const [confirm,setConfirm]=useState(false),[showReflection,setShowReflection]=useState(false);
 useEffect(()=>{setShowReflection(false);setConfirm(false)},[wireId]);
 const saved=wire?answerFor(assessment,wire):undefined;
 const reflectionDraft=()=>{try{return localStorage.getItem(`modo-answer-${assessment.id}-reflection`)}catch{return null}};
 const dirtyDrafts=()=>{try{return wires.some(w=>{const d=localStorage.getItem(draftKey(w));return d!==null&&d!==(answerFor(assessment,w)?.text??'')})||reflectionDraft()!==null&&reflectionDraft()!==assessment.reflection}catch{return false}};
 const draftKey=(w:BananaCable)=>`modo-answer-${assessment.id}-${w.id}-${[w.from.terminalId,w.to.terminalId].sort().join('|')}`;
 const exportReport=()=>{
  const text=[`Armar y explicar · ${lesson.title.replace('Lección · ','')}`,`Montaje: ${report.complete?'coincide con las redes de la referencia':'requiere revisión'}`,`Desarrollo: ${report.answered} respuestas guardadas; pendientes de revisión docente o autoevaluación.`,...wires.flatMap((w,i)=>[`${i+1}. ${terminalLabel(w.from.terminalId)} ↔ ${terminalLabel(w.to.terminalId)}`,questionFor(lesson,w),answerFor(assessment,w)?.text||'Sin respuesta']),`Explicación final: ${assessment.reflection||'Sin respuesta'}`].join('\n\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`modo-evaluacion-${assessment.lessonId}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 if(assessment.submitted)return <div className="lesson-assessment" data-assessment-submitted>
  <h4>Resultado del montaje</h4><p data-montage-result>{report.complete?'El montaje coincide con las redes de la referencia.':'El montaje necesita revisión frente a la referencia.'}</p>
  <p>{report.verdicts.filter(v=>v.status==='compatible').length} cables compatibles · {report.verdicts.filter(v=>v.status==='incompatible').length} en redes incompatibles · {report.verdicts.filter(v=>v.status==='unmapped').length} sin correspondencia en esta referencia.</p>
  <small>Se compara la conectividad entre bornes. El orden de instalación y los puentes equivalentes pueden variar. Este resultado no certifica el equipo real.</small>
  {!!report.missing.length&&<details><summary>Conexiones de referencia pendientes · {report.missing.length}</summary>{report.missing.map(s=><p key={s.id}>{terminalLabel(s.from)} ↔ {terminalLabel(s.to)}<br/><small>{s.explanation}</small></p>)}</details>}
  <h4>Comprensión del circuito</h4><p>{report.answered} respuestas guardadas · {report.unanswered} sin responder. <b>Pendientes de revisión.</b></p><p>Las respuestas de desarrollo no reciben una nota automática. Contrasta tu razonamiento con los criterios o revísalo con tu docente.</p>
  {wires.map((w,i)=>{const step=lesson.steps.find(s=>[s.from,s.to].sort().join('|')===[w.from.terminalId,w.to.terminalId].sort().join('|'));return <details key={w.id}><summary>Revisar respuesta {i+1}</summary><p><b>{terminalLabel(w.from.terminalId)} ↔ {terminalLabel(w.to.terminalId)}</b></p><p>{questionFor(lesson,w)}</p><blockquote>{answerFor(assessment,w)?.text||'Sin respuesta guardada.'}</blockquote>{step?<><h4>Criterios para revisar</h4><ul>{teachingForStep(step,lesson.schematic).criteria.map(c=><li key={c}>{c}</li>)}</ul><p>{step.explanation}</p></>:<p>Justifica esta unión frente al esquema y explica sus consecuencias. No hay una respuesta modelo específica para este par.</p>}</details>})}
  <h4>Tu explicación final</h4><blockquote>{assessment.reflection||'Sin explicación final guardada.'}</blockquote>
  <div className="lesson-actions"><button type="button" className="lesson-secondary" onClick={exportReport}><FileDown size={15}/>Descargar respuestas</button><button type="button" className="lesson-secondary" onClick={()=>{setConfirm(false);onChange({...assessment,submitted:false})}}>Volver a editar</button></div><button type="button" className="lesson-secondary" onClick={onExit}>Salir y conservar el montaje</button>
 </div>;
 return <div className="lesson-assessment" data-assessment-active>
  <details className="lesson-objective" open={!wire}><summary>Objetivo y reglas de la prueba</summary><p>{goals[assessment.lessonId]}</p><p>Elige el orden de montaje. Consulta el esquema sin pistas y explica cada cable. La revisión del montaje se muestra al entregar.</p><button type="button" className="lesson-secondary" onClick={onReference}>Consultar esquema de referencia</button></details>
  <p className="lesson-answer-count" role="status">{wires.length} cables instalados · {report.answered} respuestas guardadas</p>
  {wires.length>0&&<details className="lesson-answer-picker"><summary>Revisar otras conexiones</summary><label>Conexión<select aria-label="Conexión a explicar" value={wire?.id??''} onChange={e=>{onChoose(e.target.value);setShowReflection(false);setConfirm(false)}}>{wires.map((w,i)=><option key={w.id} value={w.id}>{i+1}. {terminalLabel(w.from.terminalId)} ↔ {terminalLabel(w.to.terminalId)}{answerFor(assessment,w)?.text.trim()?' · respondida':''}</option>)}</select></label></details>}
  {wire&&!showReflection?<section className="lesson-question" key={wire.id}>
   <h4>Explica esta conexión</h4><p className="lesson-endpoints">{terminalLabel(wire.from.terminalId)} ↔ {terminalLabel(wire.to.terminalId)}</p><p>{questionFor(lesson,wire)}</p>
   <Draft key={draftKey(wire)} storageKey={draftKey(wire)} value={saved?.text??''} label="Tu explicación de la conexión" onSave={text=>{onChange({...assessment,answers:[...assessment.answers.filter(a=>a.wireId!==wire.id),{wireId:wire.id,from:wire.from.terminalId,to:wire.to.terminalId,text}]});setConfirm(false)}}/>
  </section>:!wire?<p>Conecta el primer cable en el banco. Aquí aparecerá la pregunta sobre esa unión.</p>:null}
  <div className="lesson-actions"><button type="button" className="lesson-secondary" onClick={onMinimize}>Seguir cableando</button><button type="button" className="lesson-secondary" onClick={()=>{setShowReflection(!showReflection);setConfirm(false)}}>{showReflection?'Volver a la conexión':'Explicar el circuito completo'}</button></div>
  {showReflection&&<section><p>Explica el arranque, el mantenimiento de la marcha, la parada y la intervención de la protección. En inversión, incluye el cambio de sentido y el enclavamiento.</p><Draft key={`${assessment.id}-reflection`} storageKey={`modo-answer-${assessment.id}-reflection`} value={assessment.reflection} label="Tu explicación del circuito completo" maxLength={6000} onSave={reflection=>{onChange({...assessment,reflection});setConfirm(false)}}/></section>}
  <button type="button" className="lesson-primary" disabled={!wires.length} onClick={()=>setConfirm(true)}>Entregar prueba</button>
  {confirm&&<section className="lesson-submit-confirm" role="group" aria-label="Revisar entrega"><p>{report.unanswered} conexiones sin respuesta guardada. {assessment.reflection.trim()?'La explicación final está guardada.':'Falta guardar la explicación final.'}</p>{dirtyDrafts()?<p role="alert">Hay borradores sin guardar. Guarda las respuestas antes de entregar.</p>:<><p>Al confirmar se muestran los resultados y los criterios de revisión.</p><button type="button" className="lesson-primary" onClick={()=>onChange({...assessment,submitted:true})}>Confirmar entrega</button></>}<button type="button" className="lesson-secondary" onClick={()=>setConfirm(false)}>Seguir revisando</button></section>}
 </div>;
}
