import {canonical,describeWire,type FrameChanges} from '../data/changes';
import {cableNodes} from '../data/wiring';
import {useEffect,useState} from 'react';
import {ClipboardList} from 'lucide-react';
import {FloatingWindow} from './FloatingWindow';
import {Board,FULL} from './Board';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {LOTO_STEPS,type SessionFrame,type ActionSession} from '../data/session';
import type {ActionRecorder} from '../hooks/useActionRecorder';
import type {PracticeDocument} from '../data/practice';
const PHOTOS=[
 ['foto-1.jpg','Seccionador en OFF con candado. Vista de referencia, sin comprobar aislamiento eléctrico.'],
 ['foto-2.jpg','Segunda vista del bloqueo del seccionador.'],
 ['foto-3.jpg','Contactor trifásico: disposición general y bloque auxiliar UT-AX4.'],
 ['foto-4.jpg','Bobina A2 sobre A1; bornes 71–72 y 81–82 a la izquierda.'],
 ['foto-5.jpg','Auxiliares 13–14, 63–64 y 93–94 a la derecha.'],
 ['foto-6.jpg','Contactor con térmico: A1 sobre A2; 95–96 y 97–98 en el módulo.']
];
export function ProcedureTools({isolator,recorder,frame,panelHistory,historyMessage,onImportPanel,onExportPanel,onLoto,onRestore,onTargets}:{isolator:{on:boolean;locked:boolean};recorder:ActionRecorder;frame:SessionFrame;panelHistory:ActionSession;historyMessage:string;onImportPanel:(file:File)=>Promise<void>;onExportPanel:()=>void;onLoto:(n:number)=>void;onRestore:(p:PracticeDocument)=>void;onTargets:(ids:string[])=>void}){
 const [open,setOpen]=useState(false),[tab,setTab]=useState<'record'|'loto'|'photos'>('record'),[name,setName]=useState('Mi procedimiento'),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[guiding,setGuiding]=useState(false),[photo,setPhoto]=useState(0),[view,setView]=useState({...FULL});
 const [useHistory,setUseHistory]=useState(true),[showBefore,setShowBefore]=useState(false);
 const s=useHistory?panelHistory:recorder.selected,step=index>0?s?.steps[index-1]:undefined,previous=index>1?s?.steps[index-2]?.frame:s?.initial,preview=(showBefore&&index>0?previous:step?.frame)||s?.initial;
 useEffect(()=>{setUseHistory(true);},[panelHistory.id]);
 useEffect(()=>{if(recorder.selected)setUseHistory(false);},[recorder.selected?.id]);
 useEffect(()=>{setIndex(0);setPlaying(false);setGuiding(false);setShowBefore(false);onTargets([]);},[s?.id,useHistory]);
 useEffect(()=>{setIndex(i=>Math.min(i,s?.steps.length||0));},[s?.steps.length]);
 useEffect(()=>{if(!playing||!s)return;if(index>=s.steps.length){setPlaying(false);return;}const delay=Math.min(4000,Math.max(500,(s.steps[index].at-(index?s.steps[index-1].at:0))));const timer=setTimeout(()=>setIndex(i=>i+1),delay);return()=>clearTimeout(timer);},[playing,index,s]);
 useEffect(()=>{if(guiding)onTargets(s?.steps[index]?.targets||[]);else onTargets([]);return()=>onTargets([]);},[guiding,index,s?.id]);
 const need=(i:number)=>i===2&&isolator.on?'Gira el seccionador del tablero a OFF para aislar.':i===3&&!isolator.locked?(isolator.on?'Primero aísla (OFF) y luego coloca el candado en el tablero.':'Coloca el candado en el seccionador del tablero.'):i===7&&isolator.locked?'Abre el candado con su llave (en el tablero) antes de restituir.':'';
 const close=()=>{setOpen(false);setPlaying(false);setGuiding(false);};
 return <div className="procedure-tools"><button className="procedure-trigger" aria-label="Procedimientos y grabación" aria-expanded={open} title="Procedimientos y grabación" data-recording={recorder.recording||undefined} onClick={()=>{if(open)close();else setOpen(true);}}><ClipboardList size={18} aria-hidden="true"/><span className="procedure-label">{recorder.recording?'● Grabando':'Procedimientos'}</span></button>{open&&<FloatingWindow title="Procedimientos del panel" onClose={close} closeLabel="Cerrar procedimientos"><div className="procedure-drawer">
  <nav aria-label="Secciones de procedimientos">{(['record','loto','photos'] as const).map((id,i)=><button key={id} aria-pressed={tab===id} onClick={()=>{setTab(id);setPlaying(false);setGuiding(false);}}>{['Grabación','LOTO','Fotos'][i]}</button>)}</nav>
  {tab==='record'&&<section><p>El historial del panel registra cada cambio aunque no inicies una grabación manual. Puedes abrir un JSON para leer el circuito y revisar sus pasos anteriores.</p>
   <div className="procedure-actions"><button onClick={onExportPanel}>Exportar panel con historial</button><label className="procedure-import">Abrir panel JSON<input aria-label="Abrir panel JSON" type="file" accept="application/json,.json" onChange={e=>{const file=e.target.files?.[0];if(file)void onImportPanel(file);e.target.value='';}}/></label></div>
   <div className="procedure-actions" role="group" aria-label="Origen del historial"><button aria-pressed={useHistory} onClick={()=>{setUseHistory(true);setPlaying(false);}}>Historial del panel</button><button disabled={!recorder.selected} aria-pressed={!useHistory} onClick={()=>{setUseHistory(false);setPlaying(false);}}>Grabación seleccionada</button></div>
   {useHistory&&historyMessage&&<p className="procedure-notice">{historyMessage}</p>}
   {s?.truncated&&<p className="procedure-notice">Se muestran los últimos pasos conservados. Se alcanzó el límite de 200 pasos o de tamaño; el estado inicial corresponde al comienzo de este tramo.</p>}
   {useHistory&&s?.origin==='snapshot'&&<small>El estado inicial se recuperó sin pasos previos. Solo se registran los cambios hechos desde esa carga.</small>}
   <label>Nombre de la grabación<input value={name} maxLength={120} onChange={e=>setName(e.target.value)}/></label>
   <div className="procedure-actions">{recorder.recording?<button onClick={recorder.stop}>Detener grabación</button>:<button disabled={!recorder.ready} onClick={()=>{setPlaying(false);setGuiding(false);setUseHistory(false);recorder.start(frame,name);}}>Grabar acciones</button>}<label className="procedure-import">Importar grabación<input type="file" accept="application/json,.json" disabled={recorder.recording} onChange={e=>{const f=e.target.files?.[0];if(f)void recorder.importFile(f);e.target.value='';}}/></label></div>
   {recorder.message&&<p role="status" className="procedure-notice">{recorder.message}</p>}
   <label>Grabaciones guardadas<select aria-label="Grabaciones guardadas" disabled={recorder.recording} value={recorder.selected?.id||''} onChange={e=>{setUseHistory(false);recorder.select(e.target.value);}}><option value="">Selecciona una grabación</option>{recorder.sessions.map(item=><option key={item.id} value={item.id}>{item.name} · {item.steps.length} pasos</option>)}</select></label>
   {s&&<><strong>{s.steps.length} pasos registrados</strong>{!useHistory&&<div className="procedure-actions"><button onClick={recorder.exportSelected}>Exportar grabación</button><button disabled={recorder.recording} onClick={()=>{if(window.confirm('¿Eliminar esta grabación local? Exporta una copia si quieres conservarla.'))recorder.remove();}}>Eliminar</button></div>}
   <details open={!recorder.recording}><summary>Reproducción y guía</summary><p>La reproducción recorre estados guardados; no modifica tu práctica. Las pausas mayores a 4 segundos se acortan.</p>
    <div className="procedure-actions"><button disabled={recorder.recording||!s.steps.length} onClick={()=>{if(index>=s.steps.length)setIndex(0);setGuiding(false);setPlaying(!playing);}}>{playing?'Pausar reproducción':'Reproducir pasos'}</button><button disabled={recorder.recording} aria-pressed={guiding} onClick={()=>{setPlaying(false);setGuiding(!guiding);}}>Guía de bornes</button></div>
    <label>Paso de la grabación<input aria-label="Paso de la grabación" type="range" min={0} max={s.steps.length} value={Math.min(index,s.steps.length)} onChange={e=>{setPlaying(false);setIndex(Number(e.target.value));}}/></label>
    <p className="recorded-step" data-recorded-step={index}>{index} / {s.steps.length} · {step?.label||'Estado inicial'}</p>
    {step?.changes&&<ChangesView changes={step.changes}/>}
    <details className="history-step-list"><summary>Ver todos los pasos anteriores</summary><ol>{s.steps.map((item,i)=><li key={i}><button aria-label={'Ver paso '+(i+1)} aria-current={index===i+1?'step':undefined} onClick={()=>{setPlaying(false);setShowBefore(false);setIndex(i+1);}}>{i+1}. {item.label}</button></li>)}</ol></details>
    <div className="procedure-actions"><button disabled={!index} aria-pressed={showBefore} onClick={()=>setShowBefore(true)}>Ver antes del cambio</button><button aria-pressed={!showBefore} onClick={()=>setShowBefore(false)}>Ver después del cambio</button></div>
    {guiding&&<p role="status">{s.steps[index]?'Siguiente: '+s.steps[index].label:'Fin del recorrido.'} Esta guía señala bornes; avanza manualmente tras revisar cada acción.</p>}
    <div className="procedure-actions"><button disabled={index===0} onClick={()=>{setPlaying(false);setIndex(i=>i-1);}}>Paso anterior</button><button disabled={index>=s.steps.length} onClick={()=>{setPlaying(false);setIndex(i=>i+1);}}>Paso siguiente</button></div>
    {preview&&<><div className="procedure-preview" inert aria-label="Vista previa del montaje grabado"><Board selected={null} onSelect={()=>{}} group="todos" query="" view={view} setView={setView} aliases={CONFIRMED_MODULE_ALIASES} wires={preview.practice.wires}/></div><details className="circuit-reading"><summary>Leer circuito · {preview.practice.wires.length} cables</summary><p>Conexiones explícitas de cables. Las relaciones internas de los componentes no se deducen.</p><ul>{preview.practice.wires.map(w=><li key={w.id}><strong>{describeWire(w)}</strong><small>Cable {w.id.slice(0,8)} · color {w.color}</small></li>)}</ul><small>{cableNodes(preview.practice.wires).size} redes formadas por cables.</small></details><small>Vista previa: {preview.practice.wires.length} cables · enchufe virtual {preview.simulation.plugged?'conectado':'desconectado'} · CONTROL {preview.simulation.breakers.map(v=>v?'ON':'OFF').join('/')} · LOTO {preview.loto}/{LOTO_STEPS.length}. La vista previa no calcula el funcionamiento eléctrico.</small><button disabled={recorder.recording} onClick={()=>{onRestore(preview.practice);setGuiding(false);}}>Usar este montaje en mi práctica</button><small>Recupera el cableado y detiene la simulación virtual. Deshacer recupera tu práctica anterior.</small></>}
   </details></>}
  </section>}
  {tab==='loto'&&<section><p><strong>Práctica educativa de bloqueo y etiquetado.</strong> El procedimiento del equipo real debe definirlo y validarlo el docente o responsable autorizado. Estos pasos no certifican aislamiento físico.</p><img className="loto-photo" src="/photos-2026-10-15/foto-1.jpg" alt="Referencia del seccionador rojo en OFF con candado amarillo"/>
   <p>El seccionador amarillo está a la izquierda del tablero: gira la manilla roja a OFF para cortar la corriente, coloca el candado para bloquearla y, al restituir, ábrelo con su llave. Los pasos 3, 4 y 8 se habilitan según su posición.</p><p role="status">{frame.loto} de {LOTO_STEPS.length} etapas revisadas en el ejercicio.</p><ol className="loto-list">{LOTO_STEPS.map(([title,detail],i)=><li key={title} data-complete={i<frame.loto}><strong>{title}</strong><p>{detail}</p><button disabled={frame.loto!==i||!!need(i)} onClick={()=>onLoto(i+1)}>{frame.loto>i?'Revisado':i===5?'Registrar verificación educativa':'Revisar esta etapa'}</button>{frame.loto===i&&need(i)&&<small className="loto-need" role="status">{need(i)}</small>}</li>)}</ol><button disabled={!frame.loto} onClick={()=>onLoto(0)}>Reiniciar ejercicio LOTO</button><p>Secuencia de referencia: <a href="https://www.osha.gov/etools/lockout-tagout/tutorial/application-energy-control" target="_blank" rel="noreferrer">OSHA · control de energías peligrosas</a>. Pendiente de adaptación al procedimiento de INACAP.</p>
  </section>}
  {tab==='photos'&&<section><p>Seis fotografías aportadas el 15 de octubre de 2026.</p><div className="procedure-actions">{PHOTOS.map((p,i)=><button key={p[0]} aria-pressed={photo===i} onClick={()=>setPhoto(i)}>Foto {i+1}</button>)}</div><a href={'/photos-2026-10-15/'+PHOTOS[photo][0]} target="_blank" rel="noreferrer"><img className="procedure-photo" src={'/photos-2026-10-15/'+PHOTOS[photo][0]} alt={PHOTOS[photo][1]}/></a><p>{PHOTOS[photo][1]}</p><p>El negro visible en los bornes NC se representa gris por tu indicación anterior. Las fotos 3–5 no muestran 95–96 en el contactor trifásico; se conservan como información indicada previamente, por confirmar. La referencia KM manuscrita sigue sin confirmarse por la fotografía.</p></section>}
 </div></FloatingWindow>}</div>;
}

function ChangesView({changes:c}:{changes:FrameChanges}){
 const names:Record<string,string>={from:'Origen',to:'Destino',color:'Color',route:'Recorrido',layer:'Orden visual'};
 const value=(v:unknown)=>typeof v==='string'?v:canonical(v);
 return <section className="step-changes" aria-label="Cambios de este paso"><strong>Comparación con el paso anterior</strong><p>{c.added.length} añadidos · {c.removed.length} retirados · {c.modified.length} modificados</p>
 <ul>{c.added.map(w=><li key={'add-'+w.id} data-change="added"><strong>Cable añadido</strong>: {describeWire(w)}<small>Cable {w.id.slice(0,8)} · {w.color}</small></li>)}
 {c.removed.map(w=><li key={'remove-'+w.id} data-change="removed"><strong>Cable retirado</strong>: {describeWire(w)}<small>Cable {w.id.slice(0,8)} · color anterior {w.color}</small></li>)}
 {c.modified.map(w=><li key={'modify-'+w.id} data-change="modified"><strong>Cable modificado</strong>: {describeWire(w.after)}<small>Cable {w.id.slice(0,8)}</small>{w.fields.map(field=><p key={field}>{names[field]||field}: <span>{value(w.before[field as keyof typeof w.before])}</span> → <span>{value(w.after[field as keyof typeof w.after])}</span></p>)}</li>)}
 {c.simulation.map(change=><li key={change.field}>Mando virtual · {change.field}: {value(change.before)} → {value(change.after)}</li>)}
 {c.loto&&<li>LOTO educativo: {c.loto.before} → {c.loto.after}</li>}
 {c.practiceFields.length>0&&<li>Práctica o guía: {c.practiceFields.map(field=>field==='assessment'?'evaluación':field).join(', ')}</li>}
 {c.wireOrderChanged&&<li>Orden de los cables actualizado.</li>}
 </ul><small>Cambios comprobados entre los estados guardados. Esta comparación no verifica la seguridad eléctrica del circuito.</small></section>;
}
