import {useMemo,useState} from 'react';
import {activityDocument,matchesActivity,activityRoles,type ActivityContext,type ActivityProfile} from '../data/meterActivity';
import {FAULT_CASES,FAULT_GROUPS,casesFor,type FaultCase,type FaultGroup} from '../data/faultCases';
import type {PracticeDocument} from '../data/practice';
import type {SimulationController} from '../hooks/useSimulation';
const storageKey=(profile:ActivityProfile,id:string)=>'modo:guide:fault:'+profile+':'+id;
const readSolved=(profile:ActivityProfile)=>{const done=new Set<string>();for(const c of FAULT_CASES){try{if(localStorage.getItem(storageKey(profile,c.id)))done.add(c.id);}catch{break;}}return done;};
/** Casos de diagnóstico. Cada uno daña el banco virtual como lo haría una falla real: se diagnostica con el multímetro y la pinza, y se repara
 *  cableando de nuevo o reemplazando la pieza dañada. Las fallas ocultas se limpian al terminar el caso o al iniciar la guía de mediciones. */
export function PanelGuideFaults({profile='twoContactors',context,simulation,onPrepare,onLocate,onOpenBench}:{profile?:ActivityProfile;context:Omit<ActivityContext,'profile'|'clamp'>;simulation:SimulationController;onPrepare:(p:ActivityProfile,d:PracticeDocument)=>boolean;onLocate:(ids:string[])=>void;onOpenBench:()=>void}){
 const roles=activityRoles(profile),available=useMemo(()=>casesFor(activityDocument(profile).wires,profile),[profile]);
 const [showCases,setShowCases]=useState(true),[chosen,setChosen]=useState<string|null>(null),[targets,setTargets]=useState<string[]>([]),[hint,setHint]=useState(false),[showMeasure,setShowMeasure]=useState(false),[message,setMessage]=useState(''),[picked,setPicked]=useState<number|null>(null),[solved,setSolved]=useState(()=>readSolved(profile)),[resolved,setResolved]=useState(false);
 const fault=available.find(c=>c.id===chosen)??null,groups=(Object.keys(FAULT_GROUPS) as FaultGroup[]).map(g=>({g,cases:available.filter(c=>c.group===g)})).filter(x=>x.cases.length);
 function load(c:FaultCase){
  const doc=activityDocument(profile),b=c.build(doc.wires,profile);if(!b)return;
  if(!onPrepare(profile,{...doc,title:'Diagnóstico · '+c.title,wires:b.wires}))return;
  simulation.setFaults(b.faults);
  setChosen(c.id);setShowCases(false);setTargets(b.targets);setHint(false);setShowMeasure(false);setPicked(null);setResolved(false);
  setMessage(c.fix==='practice'?'Práctica preparada con el banco sano. Reproduce el error y observa cómo responde el instrumento.':'Caso preparado. Deshacer recupera el montaje anterior.');
 }
 const markSolved=(c:FaultCase)=>{try{localStorage.setItem(storageKey(profile,c.id),JSON.stringify({repaired:true,at:new Date().toISOString()}));}catch{}setSolved(s=>new Set(s).add(c.id));setResolved(true);};
 function finish(){simulation.setFaults([]);setChosen(null);setShowCases(true);setTargets([]);setMessage('Banco sano otra vez. Elige otro caso o continúa con la guía.');}
 function diagnose(c:FaultCase){
  if(picked===null){setMessage('Elige primero una respuesta.');return;}
  if(picked!==c.answer){setMessage(c.fix==='practice'?'No es esa. Reproduce el error con el instrumento y vuelve a pensarlo.':'Esa pieza está sana o no explica el síntoma. Mide de nuevo: la lectura de «Ver qué medir» te dice qué comparar.');return;}
  if(c.fix==='component'){
   if(context.input.plugged||context.input.forceBreaker||context.input.breakers.some(Boolean)){setMessage('Diagnóstico correcto. Para cambiar la pieza desenchufa y abre CONTROL y FUERZA.');return;}
   simulation.setFaults([]);markSolved(c);setMessage('Pieza reemplazada. Ahora energiza el banco y repite reposo, estrella, triángulo y paro para comprobar que todo funciona. '+c.why);return;
  }
  if(c.fix==='practice'){markSolved(c);setMessage(c.why);return;}
  setMessage('Diagnóstico correcto: '+c.why+' Ahora repara el cableado con la herramienta de conectar y comprueba tu reparación.');
 }
 function checkWiring(c:FaultCase){
  if(context.input.plugged||context.input.forceBreaker||context.input.breakers.some(Boolean)){setMessage('Desenchufa y abre CONTROL y FUERZA antes de comprobar la reparación.');return;}
  if(!matchesActivity(profile,context.wires)){setMessage('El montaje todavía no recupera todas sus conexiones. Comprueba el recorrido con el multímetro y conecta el cable que falta o corrige el que está mal.');return;}
  markSolved(c);setMessage('Cableado reparado y comprobado sin alimentación. Ahora energiza el banco y repite reposo, estrella, triángulo y paro para comprobar el funcionamiento.');
 }
 return <section className="panel-guide-faults">
  <div className="measure-view-heading"><div><h3>Practica diagnóstico</h3><p>Encuentra y repara una falla en el panel virtual.</p></div></div>
  {!fault&&<p className="measure-menu-lead">Elige un caso para comenzar. {solved.size?`${[...solved].filter(id=>available.some(c=>c.id===id)).length} de ${available.length} resueltos.`:`${available.length} casos disponibles.`}</p>}
  {fault&&<button type="button" className="measure-change-case" onClick={()=>setShowCases(v=>!v)} aria-expanded={showCases}>{showCases?'Ocultar casos':'Cambiar caso'}</button>}
  {showCases&&groups.map(({g,cases})=><details className="measure-menu-disclosure" key={g} open={groups.length<=2||cases.some(c=>c.id===chosen)}>
   <summary>{FAULT_GROUPS[g].title} · {cases.filter(c=>solved.has(c.id)).length}/{cases.length}</summary><p className="measure-menu-lead">{FAULT_GROUPS[g].lead}</p>
   <div className="measure-fault-cases" aria-label={'Casos: '+FAULT_GROUPS[g].title}>{cases.map((c,i)=><button type="button" key={c.id} aria-label={c.title} aria-pressed={chosen===c.id} onClick={()=>load(c)}><small>Caso {i+1}{solved.has(c.id)?' · resuelto':''}</small><span>{c.title}</span><span aria-hidden="true">→</span></button>)}</div>
  </details>)}
  {fault&&<section className="measure-fault-current"><span className="measure-eyebrow">{FAULT_GROUPS[fault.group].title}</span><h4>{fault.title}</h4><p>{fault.symptom}</p>
   <p className="measure-fault-next">{fault.fix==='practice'?'Reproduce el error con el instrumento y contesta qué pasa.':'Desconecta el banco, mide con el multímetro o la pinza y decide qué está dañado.'}</p>
   <details className="measure-menu-disclosure"><summary>Controles del banco</summary><div className="meter-lesson-controls"><button type="button" onClick={()=>simulation.plug(!context.input.plugged)}>{context.input.plugged?'Desenchufar':'Conectar corriente'}</button>{([0,1] as const).map(i=><button type="button" key={i} onClick={()=>simulation.switchBreaker(i)}>CONTROL {i+1} · {context.input.breakers[i]?'ON':'OFF'}</button>)}<button type="button" onClick={simulation.switchForce}>FUERZA · {context.input.forceBreaker?'ON':'OFF'}</button>{(['S1','S2','S3'] as const).filter(id=>profile!=='twoContactors'||id!=='S3').map(id=><button type="button" key={id} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);simulation.press(id,true);}} onPointerUp={()=>simulation.press(id,false)} onPointerCancel={()=>simulation.press(id,false)} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();simulation.press(id,true);}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter')simulation.press(id,false);}}>{id} · {id===roles.start?'Partir':id==='S2'?'Parar':'Triángulo'}</button>)}<button disabled={context.input.thermalTripped&&!simulation.canReset} onClick={simulation.trip}>{context.input.thermalTripped?'RESET · rearmar':'TEST · probar relé'}</button></div><p>Motor: {context.result.motor.status==='running'?context.result.motor.connection==='star'?'estrella':'triángulo':'detenido'} · {context.input.plugged?'alimentación conectada':'sin alimentación'}</p><button type="button" onClick={onOpenBench}>Protección y perfil del banco</button></details>
   {simulation.protectionWarning&&<p role="alert">{simulation.protectionWarning}</p>}
   <button type="button" className="measure-fault-hint" onClick={()=>setHint(v=>!v)} aria-expanded={hint}>{hint?'Ocultar pista de diagnóstico':'Ver pista de diagnóstico'}</button>
   {hint&&<div className="measure-fault-guidance"><p>{fault.hint}</p><button type="button" onClick={()=>onLocate(targets)}>Localizar bornes para medir</button>{fault.fix!=='practice'&&<button type="button" className="measure-fault-hint" onClick={()=>setShowMeasure(v=>!v)} aria-expanded={showMeasure}>{showMeasure?'Ocultar qué medir':'Ver qué medir'}</button>}{showMeasure&&<p><strong>Qué medir:</strong> {fault.measure}</p>}</div>}
   <fieldset className="measure-fault-quiz"><legend>{fault.question}</legend>{fault.options.map((o,i)=><label key={o}><input type="radio" name={'fault-'+fault.id} checked={picked===i} onChange={()=>{setPicked(i);setMessage('');}}/> {o}</label>)}</fieldset>
   <button type="button" className="meter-lesson-primary" onClick={()=>diagnose(fault)}>{fault.fix==='component'?'Reemplazar esta pieza':fault.fix==='practice'?'Comprobar mi respuesta':'Comprobar mi diagnóstico'}</button>
   {fault.fix==='wiring'&&<button type="button" className="meter-lesson-primary" onClick={()=>checkWiring(fault)}>Comprobar mi reparación</button>}
   {(resolved||solved.has(fault.id))&&<p className="measure-menu-feedback" role="status"><strong>Qué pasaba:</strong> {fault.why}</p>}
   <button type="button" className="measure-fault-hint" onClick={finish}>Terminar caso y dejar el banco sano</button>
  </section>}
  {message&&<p className="measure-menu-feedback" role="status">{message}</p>}
  <details className="measure-menu-disclosure"><summary>Cómo funciona esta práctica</summary><p>Cada caso daña el circuito virtual como lo haría una falla real: un cable cortado por dentro, un contactor con la bobina abierta, un terminal flojo, una fase que falta o un motor con la aislación baja. Observa el síntoma, desconecta la alimentación, mide y decide qué pieza cambiar. La pista no completa el ejercicio. Las protecciones actúan según el modelo simulado y las fallas se limpian al terminar el caso.</p></details>
 </section>;
}
