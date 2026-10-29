import {useEffect,useState,type ReactNode} from 'react';
import {Target,MessageSquareText,ListChecks,NotebookPen,Send,ArrowRight,ChevronRight,Check,Cable,FileDown,LayoutGrid,ClipboardCheck,AlertCircle} from 'lucide-react';
import type {BananaCable} from '../data/practice';
import type {LessonAssessment as Assessment} from '../data/assessmentState';
import {LESSONS,terminalLabel} from '../data/lessons';
import {answerFor,assessLesson,questionFor,connectionKey} from '../data/lessonAssessment';
import {teachingForStep} from '../data/lessonTeaching';
import {FloatingWindow} from './FloatingWindow';
import {LessonConnectionCard} from './LessonConnectionCard';
import {AssessmentDraft} from './AssessmentDraft';
import '../styles/lesson-understanding.css';

type Panel='objective'|'question'|'answers'|'reflection'|'submission'|'results'|'montage'|'review';
type Panels=Record<Panel,boolean>;
const closed:Panels={objective:false,question:false,answers:false,reflection:false,submission:false,results:false,montage:false,review:false};
const goals={estrellaDosContactores:{title:'Montar tu circuito de dos contactores',items:['S1 inicia KT1 y KM2 en estrella; S2 detiene.','KT1 realiza el cambio a KM1 en triángulo, con enclavamiento cruzado.','KM1 incluye el relé térmico: no es un tercer contactor. Los 37 cables corresponden al archivo recibido.']},simple:{title:'Arrancar, mantener y detener',items:['Marcha con retención al soltar el pulsador.','Parada e intervención del térmico.','Señales de estado, fuerza y protección.']},inversion:{title:'Girar en ambos sentidos',items:['Marcha, retención y paro para los dos sentidos.','Enclavamiento entre KM1 y KM2.','Señalización, fuerza y protección del esquema.']},estrellaManual:{title:'Cambiar de estrella a triángulo con S3',items:['S1 arranca KM1 y KM3 (estrella). S2 detiene.','S3 cambia a KM2 (triángulo), con retención y enclavamiento.','Fuerza, pilotos y TP según el archivo (2).']},estrellaTimer:{title:'Cambiar de estrella a triángulo con KT1',items:['S1 arranca KM1, KT1 y KM2 (estrella). S2 detiene.','KT1 pasa a KM3 (triángulo), con enclavamiento cruzado.','Fuerza y señalización según el archivo (3).']}};
type Props={assessment:Assessment;wires:BananaCable[];wireId:string|null;open:boolean;compact:boolean;portrait:boolean;onChange:(next:Assessment)=>void;onChoose:(id:string|null)=>void;onReference:()=>void;onMinimize:()=>void;onShowMenu:()=>void;onLayoutChange:()=>void;onExit:()=>void};

export function AssessmentWindows({assessment,wires,wireId,open,compact,portrait,onChange,onChoose,onReference,onMinimize,onShowMenu,onLayoutChange,onExit}:Props){
 const lesson=LESSONS[assessment.lessonId],report=assessLesson(assessment,wires),goal=goals[assessment.lessonId];
 const wire=wires.find(w=>w.id===wireId)??wires.find(w=>!answerFor(assessment,w)?.text.trim())??wires.at(-1);
 const [questionReady,setQuestionReady]=useState(false),[reflectionReady,setReflectionReady]=useState(false);
 const [activation,setActivation]=useState<Partial<Record<Panel,number>>>({});
 const [panels,setPanels]=useState<Panels>(closed),[pendingOnly,setPendingOnly]=useState(false),[reviewId,setReviewId]=useState<string|null>(null);
 // A new cable opens its own question; the menu keeps its own visibility and close control.
 useEffect(()=>{if(open&&compact)setPanels(closed)},[open,compact]);
 useEffect(()=>{if(wire&&!assessment.submitted){setPanels(p=>compact?{...closed,question:true}:{...p,question:true});setActivation(a=>({...a,question:(a.question??0)+1}));onMinimize()}},[wireId]);
 useEffect(()=>{if(assessment.submitted){setPanels(p=>compact?{...closed,results:true}:{...p,question:false,submission:false,results:true});setActivation(a=>({...a,results:(a.results??0)+1}));onMinimize()}},[assessment.submitted]);
 useEffect(()=>onLayoutChange(),[panels,open]);
 const show=(panel:Panel)=>{setActivation(a=>({...a,[panel]:(a[panel]??0)+1}));setPanels(p=>compact?{...closed,[panel]:true}:{...p,[panel]:true});if(compact)onMinimize()};
 const close=(panel:Panel)=>setPanels(p=>({...p,[panel]:false}));
 const menu=()=>{if(compact)setPanels(closed);onShowMenu()};
 const draftKey=(w:BananaCable)=>`modo-answer-${assessment.id}-${w.id}-${[w.from.terminalId,w.to.terminalId].sort().join('|')}`;
 const drafts=wires.filter(w=>{try{const value=localStorage.getItem(draftKey(w));return value!==null&&value!==(answerFor(assessment,w)?.text??'')}catch{return false}});
 const reflectionDirty=(()=>{try{const value=localStorage.getItem(`modo-answer-${assessment.id}-reflection`);return value!==null&&value!==assessment.reflection}catch{return false}})();
 const choose=(id:string)=>{onChoose(id);show(assessment.submitted?'review':'question');setReviewId(id)};
 const reviewWire=wires.find(w=>w.id===reviewId)??wire;
 const step=reviewWire?lesson.steps.find(s=>connectionKey(s.from,s.to)===connectionKey(reviewWire.from.terminalId,reviewWire.to.terminalId)):undefined;
 const compatible=report.verdicts.filter(v=>v.status==='compatible').length,incompatible=report.verdicts.filter(v=>v.status==='incompatible').length,unmapped=report.verdicts.filter(v=>v.status==='unmapped').length;
 const pane=(panel:Panel,title:string,children:ReactNode,width=440,actions?:ReactNode)=>panels[panel]&&<FloatingWindow key={panel} activation={activation[panel]??0} actions={actions} title={title} eyebrow={lesson.title.replace('Lección · ','')} width={width} side={panel==='answers'||panel==='montage'?'left':'right'} top={compact?0:92} anchor={compact&&portrait?'bottom':'top'} dockFraction={.72} className={`assessment-window assessment-${panel}-window`} closeLabel={`Cerrar ${title.toLowerCase()}`} onClose={()=>close(panel)}><div className="lesson-surface">{children}<button type="button" className="lesson-menu-return" onClick={menu}><LayoutGrid size={14}/>Menú de la prueba</button></div></FloatingWindow>;
 const exportReport=()=>{
  const text=[`Armar y explicar · ${lesson.title.replace('Lección · ','')}`,`Montaje: ${report.complete?'coincide con las redes de la referencia':'requiere revisión'}`,`${report.answered} respuestas guardadas; pendientes de revisión.`,...wires.flatMap((w,i)=>[`${i+1}. ${w.from.terminalId} ↔ ${w.to.terminalId}`,questionFor(lesson,w),answerFor(assessment,w)?.text||'Sin respuesta']),`Explicación final: ${assessment.reflection||'Sin respuesta'}`].join('\n\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`modo-evaluacion-${assessment.lessonId}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <>
  {open&&<FloatingWindow title="Mi prueba" eyebrow={lesson.title.replace('Lección · ','')} width={300} side="left" top={compact?0:82} anchor={compact&&portrait?'bottom':'top'} dockFraction={.65} className="assessment-window assessment-menu-window" actions={<button type="button" className="lesson-action is-primary" disabled={!wires.length} onClick={()=>show(assessment.submitted?'results':'submission')}>{assessment.submitted?<ClipboardCheck size={16}/>:<Send size={16}/>} {assessment.submitted?'Ver resultados':'Entregar prueba'}</button>} closeLabel="Minimizar evaluación" onClose={onMinimize}><div className="lesson-surface assessment-menu" data-assessment-active={!assessment.submitted||undefined} data-assessment-submitted={assessment.submitted||undefined}>
   <div className="assessment-counters"><div><Cable size={16}/><strong>{wires.length}</strong><span>Cables</span></div><div><Check size={16}/><strong>{report.answered}</strong><span>Respuestas</span></div></div>
   <nav className="assessment-menu-links" aria-label="Ventanas de la prueba">
    <button type="button" onClick={()=>show('objective')}><Target/><span><b>Objetivo</b><small>Qué debes construir</small></span><ChevronRight/></button>
    {!assessment.submitted&&<button type="button" disabled={!wire} onClick={()=>show('question')}><MessageSquareText/><span><b>Pregunta actual</b><small>{wire?'Explica el cable que conectaste':'Conecta tu primer cable'}</small></span><ChevronRight/></button>}
    <button type="button" disabled={!wires.length} onClick={()=>show('answers')}><ListChecks/><span><b>Mis respuestas</b><small>{report.unanswered} por responder</small></span><ChevronRight/></button>
    {<button type="button" onClick={()=>show('reflection')}><NotebookPen/><span><b>Explicación final</b><small>{assessment.submitted?'Ver tu explicación':'Relaciona el circuito completo'}</small></span><ChevronRight/></button>}
   </nav>

   <button type="button" className="lesson-action is-quiet" onClick={onExit}>Salir y conservar el montaje</button>
  </div></FloatingWindow>}

  {pane('objective','Objetivo de la prueba',<>
   <div className="lesson-panel-heading"><span className="lesson-icon-tile"><Target size={24}/></span><span className="lesson-kicker">TU RETO</span><h2>{goal.title}</h2></div>
   <div className="lesson-goal-list">{goal.items.map((item,i)=><div key={item}><span>{String(i+1).padStart(2,'0')}</span><p>{item}</p></div>)}</div>
   <div className="lesson-rule-row"><span>Orden libre</span><span>Sin pistas</span><span>Revisión al entregar</span></div>
   <button type="button" className="lesson-action is-primary" onClick={()=>{close('objective');onReference()}}>Consultar esquema de referencia <ArrowRight size={16}/></button>
  </>)}

  {wire&&!assessment.submitted&&pane('question','Explica esta conexión',<div className="assessment-question" data-assessment-active data-question-wire={wire.id}>
   <span className="lesson-kicker">CABLE {String(wires.indexOf(wire)+1).padStart(2,'0')}</span>
   <LessonConnectionCard from={wire.from.terminalId} to={wire.to.terminalId}/>
   <div className="assessment-prompt"><MessageSquareText size={20}/><p>{questionFor(lesson,wire)}</p></div>
   <AssessmentDraft key={draftKey(wire)} storageKey={draftKey(wire)} value={answerFor(assessment,wire)?.text??''} label="Tu explicación de la conexión" formId={`answer-${assessment.id}`} onReadyChange={setQuestionReady} onSave={text=>onChange({...assessment,answers:[...assessment.answers.filter(a=>a.wireId!==wire.id),{wireId:wire.id,from:wire.from.terminalId,to:wire.to.terminalId,text}]})}/>
  </div>,440,<><button type="submit" form={`answer-${assessment.id}`} className="lesson-action is-primary" disabled={!questionReady}>Guardar respuesta <Check size={15}/></button><button type="button" className="lesson-action" onClick={()=>{close('question');onMinimize()}}>Seguir cableando</button></>)}

  {pane('answers','Mis respuestas',<>
   <div className="lesson-panel-heading"><span className="lesson-kicker">TU RECORRIDO</span><h2>Una respuesta por cable</h2></div>
   <div className="lesson-filter-tabs" role="group" aria-label="Filtrar respuestas"><button type="button" aria-pressed={!pendingOnly} onClick={()=>setPendingOnly(false)}>Todas · {wires.length}</button><button type="button" aria-pressed={pendingOnly} onClick={()=>setPendingOnly(true)}>Pendientes · {report.unanswered}</button></div>
   <div className="assessment-response-list">{wires.filter(w=>!pendingOnly||!answerFor(assessment,w)?.text.trim()).map(w=><button type="button" key={w.id} onClick={()=>choose(w.id)} aria-label={`Abrir respuesta del cable ${wires.indexOf(w)+1}`}><span className="assessment-wire-number">{String(wires.indexOf(w)+1).padStart(2,'0')}</span><span className="assessment-response-label"><b>{terminalLabel(w.from.terminalId)} ↔ {terminalLabel(w.to.terminalId)}</b><small>{answerFor(assessment,w)?.text.trim()?'Respuesta guardada':'Por responder'}</small></span>{answerFor(assessment,w)?.text.trim()?<Check size={17}/>:<ChevronRight size={17}/>}</button>)}</div>
   {pendingOnly&&report.unanswered===0&&<p className="lesson-empty">Todas las conexiones tienen una respuesta guardada.</p>}
  </>)}

  {pane('reflection','Explicación del circuito',<>
   <div className="lesson-panel-heading"><span className="lesson-kicker">UNE LAS IDEAS</span><h2>Cuenta cómo funciona</h2></div>
   <div className="lesson-story-path">{['Arranque','Marcha','Parada','Protección',...(assessment.lessonId==='inversion'?['Cambio de giro']:assessment.lessonId==='estrellaTimer'?['Retardo de KT1','Cambio a triángulo']:assessment.lessonId==='estrellaManual'?['Cambio con S3']:[])].map((s,i)=><span key={s}><b>{i+1}</b>{s}</span>)}</div>
   <p className="lesson-short-note">Explica la secuencia y cómo intervienen los componentes.</p>
   {assessment.submitted?<div className="assessment-review-card"><span className="lesson-kicker">TU EXPLICACIÓN</span><blockquote>{assessment.reflection||'Sin explicación final guardada.'}</blockquote></div>:<AssessmentDraft key={`${assessment.id}-reflection`} storageKey={`modo-answer-${assessment.id}-reflection`} value={assessment.reflection} label="Tu explicación del circuito completo" formId={`reflection-${assessment.id}`} onReadyChange={setReflectionReady} maxLength={6000} onSave={reflection=>onChange({...assessment,reflection})}/>}
  </>,440,!assessment.submitted?<button type="submit" form={`reflection-${assessment.id}`} className="lesson-action is-primary" disabled={!reflectionReady}>Guardar respuesta <Check size={15}/></button>:undefined)}

  {!assessment.submitted&&pane('submission','Entregar prueba',<div className="assessment-submission">
   <div className="lesson-panel-heading"><span className="lesson-icon-tile"><Send size={23}/></span><span className="lesson-kicker">ÚLTIMA REVISIÓN</span><h2>¿Listo para entregar?</h2></div>
   <div className="assessment-readiness"><div><span>Conexiones respondidas</span><strong>{report.answered} / {wires.length}</strong></div><div><span>Explicación final</span><strong>{assessment.reflection.trim()?'Guardada':'Pendiente'}</strong></div></div>
   {drafts.length>0||reflectionDirty?<><div className="lesson-notice" role="alert"><AlertCircle size={18}/><p>Hay borradores sin guardar. Abre la respuesta y guárdala antes de entregar.</p></div>{drafts.map(w=><button type="button" className="lesson-action" key={w.id} onClick={()=>choose(w.id)}>Guardar borrador del cable {wires.indexOf(w)+1}<ChevronRight size={15}/></button>)}{reflectionDirty&&<button type="button" className="lesson-action" onClick={()=>show('reflection')}>Guardar explicación final</button>}</>:<><p className="lesson-short-note">{report.unanswered>0?`${report.unanswered} conexiones quedarán sin respuesta. `:''}Al entregar se abre la revisión del montaje.</p><button type="button" className="lesson-action is-primary" disabled={!wires.length} onClick={()=>{const dirtyNow=wires.some(w=>{try{const d=localStorage.getItem(draftKey(w));return d!==null&&d!==(answerFor(assessment,w)?.text??'')}catch{return false}});let finalDirty=false;try{const d=localStorage.getItem(`modo-answer-${assessment.id}-reflection`);finalDirty=d!==null&&d!==assessment.reflection}catch{}if(dirtyNow||finalDirty){setPanels(p=>({...p}));return}onChange({...assessment,submitted:true})}}>Confirmar entrega <Send size={16}/></button></>}
   <button type="button" className="lesson-action" onClick={()=>show('answers')}>Revisar mis respuestas</button>
  </div>)}

  {assessment.submitted&&pane('results','Resultados de la prueba',<div data-assessment-submitted>
   <div className="lesson-panel-heading"><span className="lesson-kicker">PRUEBA ENTREGADA</span><h2>Revisa tu trabajo</h2></div>
   <div className="assessment-result-card" data-montage-result><span>01 · MONTAJE</span><h3>{report.complete?'Coincide con la referencia':'Necesita revisión'}</h3><div className="assessment-result-metrics"><b>{compatible}<small>compatibles</small></b><b>{incompatible}<small>incompatibles</small></b><b>{unmapped}<small>sin referencia</small></b></div><button type="button" className="lesson-action" onClick={()=>show('montage')}>Revisar el montaje <ArrowRight size={15}/></button></div>
   <div className="assessment-result-card"><span>02 · EXPLICACIONES</span><h3>{report.answered} respuestas guardadas</h3><p>{report.unanswered} pendientes. Revisión docente o autoevaluación, sin nota automática.</p><button type="button" className="lesson-action" onClick={()=>show('answers')}>Revisar las explicaciones <ArrowRight size={15}/></button></div>
   <div className="lesson-window-actions"><button type="button" className="lesson-action" onClick={exportReport}><FileDown size={15}/>Descargar respuestas</button><button type="button" className="lesson-action" onClick={()=>{setPanels(closed);onChange({...assessment,submitted:false});onShowMenu()}}>Volver a editar</button></div>
  </div>,470)}

  {assessment.submitted&&pane('montage','Revisión del montaje',<>
   <span className="lesson-kicker">CONTRASTA CON EL ESQUEMA</span><h2>Qué debes revisar</h2>
   <p className="lesson-short-note">Se comparan las redes de cables; el orden de montaje y los puentes equivalentes pueden variar.</p>
   {report.verdicts.filter(v=>v.status!=='compatible').map(({wire:w,status})=><article key={w.id} className="assessment-montage-item"><span className="lesson-status-tag">{status==='incompatible'?'Une redes diferentes':'Sin correspondencia en la referencia'}</span><LessonConnectionCard from={w.from.terminalId} to={w.to.terminalId}/></article>)}
   <h3 className="lesson-list-heading">Conexiones pendientes · {report.missing.length}</h3>
   {report.missing.map(s=><article key={s.id} className="assessment-montage-item"><strong>{s.title}</strong><LessonConnectionCard from={s.from} to={s.to}/></article>)}
   <p className="lesson-footnote">Comparación con el modelo de esta lección; no certifica el equipo físico.</p>
  </>,500)}

  {assessment.submitted&&reviewWire&&pane('review',`Revisar respuesta ${wires.indexOf(reviewWire)+1}`,<>
   <LessonConnectionCard from={reviewWire.from.terminalId} to={reviewWire.to.terminalId}/>
   <div className="assessment-review-card"><span className="lesson-kicker">TU RESPUESTA</span><blockquote>{answerFor(assessment,reviewWire)?.text||'Sin respuesta guardada.'}</blockquote></div>
   <div className="assessment-review-card is-reference"><span className="lesson-kicker">QUÉ DEBES CONSIDERAR</span>{step?<><ul>{teachingForStep(step,lesson.schematic).criteria.map(c=><li key={c}><Check size={15}/><span>{c}</span></li>)}</ul><p>{step.explanation}</p></>:<p>Justifica esta unión frente al esquema y sus consecuencias. No hay una respuesta modelo específica para este par.</p>}</div>
   <span className="lesson-footnote">Respuesta de desarrollo pendiente de revisión.</span>
  </>,500)}
 </>;
}
