import {useEffect,useMemo,useState} from 'react';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {FloatingWindow} from './FloatingWindow';
import {terminalLabel} from '../data/lessons';
import {ACTIVITY_KEY,ACTIVITY_PROFILES,ACTIVITY_STEPS,activityStep,activityDocument,checkActivity,newActivity,observedMatches,readActivity,type ActivityContext,type ActivityProfile,type ActivityProgress,type ActivityRecord,type Phase} from '../data/meterActivity';
import type {PracticeDocument} from '../data/practice';
import type {SimulationController} from '../hooks/useSimulation';
import '../styles/panel-meter-lesson.css';

type Props={visible:boolean;context:Omit<ActivityContext,'profile'|'clamp'>;simulation:SimulationController;onPrepare:(profile:ActivityProfile,document:PracticeDocument)=>boolean;onLocate:(ids:string[])=>void;onClose:()=>void};
const download=(name:string,text:string,type:string)=>{const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
export function PanelMeterLesson({visible,context,simulation,onPrepare,onLocate,onClose}:Props){
 const {compact}=useCompactLayout('(max-width:700px)');
 const [progress,setProgress]=useState<ActivityProgress>(()=>{try{return readActivity(JSON.parse(localStorage.getItem(ACTIVITY_KEY)||'null'))??newActivity('manual')}catch{return newActivity('manual')}});
 const [active,setActive]=useState(false),[observed,setObserved]=useState(''),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[clamp,setClamp]=useState<Phase|null>(null),[saveError,setSaveError]=useState(false);
 const profile=progress.profile,step=useMemo(()=>activityStep(profile,progress.index),[profile,progress.index]);
 const result=useMemo(()=>checkActivity(step,{...context,profile,clamp}),[step,context,profile,clamp]);
 useEffect(()=>{try{localStorage.setItem(ACTIVITY_KEY,JSON.stringify(progress));setSaveError(false)}catch{setSaveError(true)}},[progress]);
 useEffect(()=>{setObserved('');setMessage('');setClamp(null);setHelp(false);onLocate([]);if(profile==='matias'&&step.id==='start-star')simulation.setTimerSeconds(60)},[progress.index,profile]);
 const prepare=(resume:boolean)=>{
  if(!onPrepare(profile,activityDocument(profile))){setMessage('No se pudo preparar el banco. Revisa si hay espacio para KM3.');return}
  if(!resume)setProgress(newActivity(profile));setActive(true);setObserved('');setMessage('');setClamp(null);setHelp(false);
 };
 const record=()=>{
  if(!result.ready){setMessage(result.message);return}
  if(step.kind==='compare'&&progress.reflection.trim().length<25){setMessage('Escribe tu comparación: qué cambió en las bobinas y en las corrientes de entrada.');return}
  if(result.reading&&!observedMatches(observed,result.reading.value??null)){setMessage('La anotación no coincide con la lectura actual. Revisa el número y su unidad; para circuito abierto escribe OL.');return}
  const r=result.reading;
  const entry:ActivityRecord={id:step.id,observed:r?observed.trim():'Estado comprobado',text:r?.text??'Estado comprobado',value:r?.value??null,red:step.kind==='meter'?context.probes[0]??undefined:undefined,black:step.kind==='meter'?context.probes[1]??undefined:undefined,phase:step.kind==='clamp'?clamp??undefined:undefined,at:new Date().toISOString()};
  setProgress(p=>({...p,records:[...p.records.filter(v=>v.id!==step.id),entry],index:Math.min(ACTIVITY_STEPS.length-1,p.index+1),complete:p.index===ACTIVITY_STEPS.length-1}));setMessage('');
 };
 const exportReport=()=>download('actividad-2-mediciones-'+profile+'.json',JSON.stringify({activity:'ARCM02 · Actividad 2 · Unidad 2',guide:'/activities/actividad-2-unidad-2.pdf',...progress,model:simulation.meterModel,measurements:progress.records.map(r=>({...r,task:ACTIVITY_STEPS.find(s=>s.id===r.id)})),notice:'Práctica virtual. Las corrientes son equivalentes resistivos, no mediciones físicas ni datos de placa.'},null,2),'application/json');
 const exportCSV=()=>{const cells=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';const rows=[['Tabla','Medición','Anotación','Lectura virtual','Roja','Negra','Fase','Fecha'],...progress.records.filter(r=>ACTIVITY_STEPS.find(s=>s.id===r.id)?.table).map(r=>{const s=ACTIVITY_STEPS.find(s=>s.id===r.id)!;return [s.table,s.title,r.observed,r.text,r.red,r.black,r.phase,r.at]})];download('tablas-actividad-2-'+profile+'.csv','\ufeff'+rows.map(r=>r.map(cells).join(';')).join('\r\n'),'text/csv;charset=utf-8')};
 const power=<details className="meter-lesson-energy"><summary>Preparar el estado del circuito</summary><div className="meter-lesson-controls">
  <button type="button" aria-pressed={context.input.plugged} onClick={()=>simulation.plug(!context.input.plugged)}>{context.input.plugged?'Desenchufar corriente virtual':'Enchufar corriente virtual'}</button>
  <button type="button" aria-pressed={context.input.forceBreaker} onClick={simulation.switchForce}>FUERZA · {context.input.forceBreaker?'ON':'OFF'}</button>
  {([0,1] as const).map(i=><button type="button" key={i} aria-pressed={context.input.breakers[i]} onClick={()=>simulation.switchBreaker(i)}>CONTROL {i+1} · {context.input.breakers[i]?'ON':'OFF'}</button>)}
  {(['S1','S2','S3'] as const).map(id=><button type="button" key={id} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);simulation.press(id,true)}} onPointerUp={()=>simulation.press(id,false)} onPointerCancel={()=>simulation.press(id,false)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();simulation.press(id,true)}}} onKeyUp={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();simulation.press(id,false)}}}>{id} · {id==='S1'?'partir estrella':id==='S2'?'parar':profile==='manual'?'cambiar a triángulo':'sin uso en Matías'}</button>)}
  <button type="button" onClick={simulation.trip}>{context.input.thermalTripped?'RESET · rearmar térmico':'TEST · disparar térmico'}</button>
  {profile==='matias'&&<label>Retardo para estudiar<select aria-label="Retardo de Matías" value={simulation.timerSeconds} onChange={e=>simulation.setTimerSeconds(Number(e.target.value))}>{[2,4,10,30,60].map(n=><option key={n} value={n}>{n} segundos</option>)}</select></label>}
 </div></details>;
 return <FloatingWindow title="Medir · Actividad 2" eyebrow="Unidad 2 · Control de máquinas eléctricas" onClose={()=>{onLocate([]);onClose()}} closeLabel="Ocultar lección del multímetro" visible={visible} width={420} side="left" top={compact?0:70} anchor="top" heightFraction={compact?.35:.72} dockFraction={.44} className="panel-meter-lesson-window" scaleBody={false}>
 <div className="panel-meter-lesson" data-activity-step={active?step.id:'intro'}>
 {!active?<>
  <h2>Actividad 2 del profesor</h2><p>Primero comprueba el mando y los pilotos sin fuerza. Después revisa fuerza y mide estrella y triángulo. Coloca las puntas, registra tus tablas y termina con la comparación y TEST/RESET.</p><p className="meter-lesson-note">ARCM02 · Unidad 2 · Juan Carlos Toro Cornejo · Otoño 2025. Cada paso indica la página y el punto de la guía.</p>
  <details><summary>Referencia opcional de Matías</summary><label>Montaje para practicar<select aria-label="Montaje de la actividad" value={profile} onChange={e=>setProgress(newActivity(e.target.value as ActivityProfile))}>{Object.entries(ACTIVITY_PROFILES).map(([key,p])=><option key={key} value={key}>{p.title}</option>)}</select></label><p>La ruta principal es el circuito manual del profesor. La variante de Matías es material complementario y no reemplaza ese esquema.</p></details>
  <p><strong>{profile==='manual'?'Guía principal · cambio manual':'Variante automática opcional'}</strong></p><p>{ACTIVITY_PROFILES[profile].detail}</p>
  <details><summary>Qué pide la guía y qué contiene Matías</summary><p>Continuidad (4 y 11); voltaje AC de mando (5); entre fases (12); voltaje de las bobinas en estrella y triángulo (15 y 18); corrientes con pinza (16 y 19); comparación (20); TEST, RESET y cierre (21–25).</p><p>La práctica de Ω de un contacto es adicional. No se inventan resistencias de bobinas: el archivo no las documenta.</p><p>El proyecto de Matías conserva 45 cables y un historial sin pasos. No contiene posiciones guardadas de puntas ni mediciones. Es automático; el dibujo del profesor es manual.</p><p>El mando virtual usa 24 V~; fuerza parte de 380 V entre fases. Los amperios se calculan con equivalentes resistivos ajustables, no son corrientes reales de arranque.</p><a href="/activities/actividad-2-unidad-2.pdf" target="_blank" rel="noreferrer">Abrir guía del profesor</a> · <a href="/activities/proyecto-matias.json" download>Proyecto original de Matías</a></details>
  <p className="meter-lesson-note">Preparar carga el circuito elegido. Deshacer recupera el montaje que tenías. La práctica siempre comienza desenchufada.</p>
  <button type="button" className="meter-lesson-primary" onClick={()=>prepare(false)}>{profile==='manual'?'Comenzar guía del profesor':'Preparar variante de Matías'}</button>
  {progress.records.length>0&&<button type="button" onClick={()=>prepare(true)}>Retomar · paso {progress.index+1}</button>}
  {message&&<p role="status">{message}</p>}
 </>:progress.complete?<>
  <h2>Práctica completada</h2><p>Registraste las mediciones, comparaste los dos estados y dejaste el banco sin alimentación.</p><button type="button" onClick={exportReport}>Descargar informe JSON</button><button type="button" onClick={exportCSV}>Descargar tablas CSV</button><button type="button" onClick={()=>setActive(false)}>Elegir otra práctica</button>
 </>:<>
  <div className="meter-lesson-progress"><span>Paso {progress.index+1} de {ACTIVITY_STEPS.length}</span><span>Pág. {step.page} · punto {step.point}</span></div>
  <h2>{step.title}</h2><p>{step.task}</p>
  <details><summary>Comprender esta medición</summary><p>{step.why}</p><small>{ACTIVITY_PROFILES[profile].detail}</small></details>
  {step.kind==='meter'&&<>
   <button type="button" aria-expanded={help} onClick={()=>{setHelp(v=>!v);if(!help)onLocate([step.red!,step.black!])}}>Dónde poner las puntas</button>
   {help&&<div className="meter-lesson-probes"><p><i className="probe-red"/>Roja · <strong>{terminalLabel(step.red!)}</strong></p><p><i className="probe-black"/>Negra · <strong>{terminalLabel(step.black!)}</strong></p><small>Rojo conectado a V Ω; negro a COM. Arrastra las puntas o usa sus flechas del teclado. En V~ y Ω puedes intercambiar los dos extremos.</small></div>}
  </>}
  {step.kind==='clamp'&&<div className="meter-lesson-clamp" aria-label="Pinza virtual en la alimentación">
   <svg viewBox="0 0 260 68" role="img" aria-label="Una sola fase atraviesa la pinza antes de dividirse en dos ramas"><path d="M12 34H170L235 12M170 34L235 56" fill="none" stroke="#b96a14" strokeWidth="3"/><path d="M95 48C62 64 49 13 80 11C109 8 116 36 100 45" fill="none" stroke="#344951" strokeWidth="10"/><rect x="72" y="46" width="45" height="18" rx="4" fill="#e9c659"/><text x="18" y="22" fontSize="14">{clamp??'?'}</text><text x="184" y="35" fontSize="10">derivaciones</text></svg>
   <p>Una sola fase de entrada, antes de sus derivaciones. Se suman sus ramas en el modelo.</p><div role="group" aria-label="Conductor dentro de la pinza">{(['R','S','T'] as const).map(phase=><button type="button" key={phase} aria-pressed={clamp===phase} onClick={()=>{setClamp(phase);onLocate([`FUENTE:${phase}`])}}>Pinza en {phase}</button>)}</div>
   <output aria-label="Lectura de la pinza virtual">{result.ready?result.reading?.text:'— A'}</output><small>Equivalente resistivo virtual · no corriente real de placa.</small>
  </div>}
  {power}
  {step.kind==='compare'&&<label>Tu comparación<textarea aria-label="Comparación estrella y triángulo" rows={4} maxLength={5000} value={progress.reflection} onChange={e=>setProgress(p=>({...p,reflection:e.target.value}))}/></label>}
  <p className={`meter-lesson-state ${result.ready?'is-ready':''}`} role="status">{message||result.message}</p>
  {(step.kind==='meter'||step.kind==='clamp')&&<label>Lectura observada {step.kind==='clamp'?'(A)':step.mode==='V'?'(V)':step.expected==='open'?'(OL o Ω)':'(Ω)'}<input aria-label="Lectura observada" inputMode={step.expected==='open'?'text':'decimal'} value={observed} onChange={e=>{setObserved(e.target.value);setMessage('')}} placeholder={step.expected==='open'?'Escribe OL si aparece OL':'Escribe el valor de la pantalla'}/></label>}
  <div className="meter-lesson-actions"><button type="button" disabled={progress.index===0} onClick={()=>setProgress(p=>({...p,index:p.index-1}))}>Anterior</button><button type="button" className="meter-lesson-primary" onClick={record}>{step.kind==='meter'||step.kind==='clamp'?'Comprobar y registrar':step.id==='shutdown'?'Terminar práctica':'Comprobar y continuar'}</button></div>
  <button type="button" className="meter-lesson-link" onClick={()=>setActive(false)}>Volver al inicio de la lección</button>
 </>}
 <details className="meter-lesson-tables"><summary>Mis tablas · {progress.records.filter(r=>ACTIVITY_STEPS.find(s=>s.id===r.id)?.table).length} mediciones</summary>{['Tabla 1','Tabla 3','Tabla 4','Tabla 5','Tabla 6'].map(table=><section key={table}><h3>{table}</h3><table><thead><tr><th>Medición</th><th>Tu lectura</th></tr></thead><tbody>{ACTIVITY_STEPS.filter(s=>s.table===table).map(s=>{const r=progress.records.find(r=>r.id===s.id);return <tr key={s.id}><td>{s.title}</td><td>{r?r.observed+' '+(s.kind==='clamp'?'A':'V'):'Por medir'}</td></tr>})}</tbody></table></section>)}<button type="button" onClick={exportReport}>Descargar informe JSON</button><button type="button" onClick={exportCSV}>Descargar tablas CSV</button></details>
 {saveError&&<p role="alert">El navegador no pudo guardar el progreso. Descarga tu informe antes de cerrar.</p>}
 <p className="meter-lesson-note">Entrenamiento virtual basado en la guía. La revisión y las mediciones del equipo real corresponden al laboratorio y al docente.</p>
 </div></FloatingWindow>;
}
