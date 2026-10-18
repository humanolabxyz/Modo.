import {useEffect,useState} from 'react';
import {X} from 'lucide-react';
import {Board,FULL} from './Board';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {LOTO_STEPS,type SessionFrame} from '../data/session';
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
export function ProcedureTools({recorder,frame,onLoto,onRestore,onTargets}:{recorder:ActionRecorder;frame:SessionFrame;onLoto:(n:number)=>void;onRestore:(p:PracticeDocument)=>void;onTargets:(ids:string[])=>void}){
 const [open,setOpen]=useState(false),[tab,setTab]=useState<'record'|'loto'|'photos'>('record'),[name,setName]=useState('Mi procedimiento'),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[guiding,setGuiding]=useState(false),[photo,setPhoto]=useState(0),[view,setView]=useState({...FULL});
 const s=recorder.selected,step=index>0?s?.steps[index-1]:undefined,preview=step?.frame||s?.initial;
 useEffect(()=>{setIndex(0);setPlaying(false);setGuiding(false);onTargets([]);},[s?.id]);
 useEffect(()=>{if(!playing||!s)return;if(index>=s.steps.length){setPlaying(false);return;}const delay=Math.min(4000,Math.max(500,(s.steps[index].at-(index?s.steps[index-1].at:0))));const timer=setTimeout(()=>setIndex(i=>i+1),delay);return()=>clearTimeout(timer);},[playing,index,s]);
 useEffect(()=>{if(guiding)onTargets(s?.steps[index]?.targets||[]);else onTargets([]);return()=>onTargets([]);},[guiding,index,s?.id]);
 useEffect(()=>{if(!open)return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);setPlaying(false);setGuiding(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[open]);
 const close=()=>{setOpen(false);setPlaying(false);setGuiding(false);};
 return <div className="procedure-tools"><button className="procedure-trigger" aria-label="Procedimientos y grabación" aria-expanded={open} onClick={()=>{if(open)close();else setOpen(true);}}>{recorder.recording?'● Grabando':'Procedimientos'}</button>{open&&<aside className="procedure-drawer" aria-label="Procedimientos del panel">
  <div className="procedure-heading"><strong>Procedimientos del panel</strong><button aria-label="Cerrar procedimientos" onClick={close}><X size={18}/></button></div>
  <nav aria-label="Secciones de procedimientos">{(['record','loto','photos'] as const).map((id,i)=><button key={id} aria-pressed={tab===id} onClick={()=>{setTab(id);setPlaying(false);setGuiding(false);}}>{['Grabación','LOTO','Fotos'][i]}</button>)}</nav>
  {tab==='record'&&<section><p>Registra las acciones del panel y vuelve a recorrerlas. Las grabaciones son ejemplos personales, pendientes de revisión docente.</p>
   <label>Nombre de la grabación<input value={name} maxLength={120} onChange={e=>setName(e.target.value)}/></label>
   <div className="procedure-actions">{recorder.recording?<button onClick={recorder.stop}>Detener grabación</button>:<button disabled={!recorder.ready} onClick={()=>{setPlaying(false);setGuiding(false);recorder.start(frame,name);}}>Grabar acciones</button>}<label className="procedure-import">Importar grabación<input type="file" accept="application/json,.json" disabled={recorder.recording} onChange={e=>{const f=e.target.files?.[0];if(f)void recorder.importFile(f);e.target.value='';}}/></label></div>
   {recorder.message&&<p role="status" className="procedure-notice">{recorder.message}</p>}
   <label>Grabaciones guardadas<select aria-label="Grabaciones guardadas" disabled={recorder.recording} value={s?.id||''} onChange={e=>recorder.select(e.target.value)}><option value="">Selecciona una grabación</option>{recorder.sessions.map(item=><option key={item.id} value={item.id}>{item.name} · {item.steps.length} pasos</option>)}</select></label>
   {s&&<><strong>{s.steps.length} pasos registrados</strong><div className="procedure-actions"><button onClick={recorder.exportSelected}>Exportar grabación</button><button disabled={recorder.recording} onClick={()=>{if(window.confirm('¿Eliminar esta grabación local? Exporta una copia si quieres conservarla.'))recorder.remove();}}>Eliminar</button></div>
   <details open={!recorder.recording}><summary>Reproducción y guía</summary><p>La reproducción recorre estados guardados; no modifica tu práctica. Las pausas mayores a 4 segundos se acortan.</p>
    <div className="procedure-actions"><button disabled={recorder.recording||!s.steps.length} onClick={()=>{if(index>=s.steps.length)setIndex(0);setGuiding(false);setPlaying(!playing);}}>{playing?'Pausar reproducción':'Reproducir pasos'}</button><button disabled={recorder.recording} aria-pressed={guiding} onClick={()=>{setPlaying(false);setGuiding(!guiding);}}>Guía de bornes</button></div>
    <label>Paso de la grabación<input aria-label="Paso de la grabación" type="range" min={0} max={s.steps.length} value={Math.min(index,s.steps.length)} onChange={e=>{setPlaying(false);setIndex(Number(e.target.value));}}/></label>
    <p className="recorded-step" data-recorded-step={index}>{index} / {s.steps.length} · {step?.label||'Estado inicial'}</p>
    {guiding&&<p role="status">{s.steps[index]?'Siguiente: '+s.steps[index].label:'Fin del recorrido.'} Esta guía señala bornes; avanza manualmente tras revisar cada acción.</p>}
    <div className="procedure-actions"><button disabled={index===0} onClick={()=>{setPlaying(false);setIndex(i=>i-1);}}>Paso anterior</button><button disabled={index>=s.steps.length} onClick={()=>{setPlaying(false);setIndex(i=>i+1);}}>Paso siguiente</button></div>
    {preview&&<><div className="procedure-preview" inert aria-label="Vista previa del montaje grabado"><Board selected={null} onSelect={()=>{}} group="todos" query="" view={view} setView={setView} aliases={CONFIRMED_MODULE_ALIASES} wires={preview.practice.wires}/></div><small>Vista previa: {preview.practice.wires.length} cables · enchufe virtual {preview.simulation.plugged?'conectado':'desconectado'} · CONTROL {preview.simulation.breakers.map(v=>v?'ON':'OFF').join('/')} · LOTO {preview.loto}/{LOTO_STEPS.length}. La vista previa no calcula el funcionamiento eléctrico.</small><button disabled={recorder.recording} onClick={()=>{onRestore(preview.practice);setGuiding(false);}}>Usar este montaje en mi práctica</button><small>Recupera el cableado y detiene la simulación virtual. Deshacer recupera tu práctica anterior.</small></>}
   </details></>}
  </section>}
  {tab==='loto'&&<section><p><strong>Práctica educativa de bloqueo y etiquetado.</strong> El procedimiento del equipo real debe definirlo y validarlo el docente o responsable autorizado. Estos pasos no certifican aislamiento físico.</p><img className="loto-photo" src="/photos-2026-10-15/foto-1.jpg" alt="Referencia del seccionador rojo en OFF con candado amarillo"/>
   <p role="status">{frame.loto} de {LOTO_STEPS.length} etapas revisadas en el ejercicio.</p><ol className="loto-list">{LOTO_STEPS.map(([title,detail],i)=><li key={title} data-complete={i<frame.loto}><strong>{title}</strong><p>{detail}</p><button disabled={frame.loto!==i} onClick={()=>onLoto(i+1)}>{frame.loto>i?'Revisado':i===5?'Registrar verificación educativa':'Revisar esta etapa'}</button></li>)}</ol><button disabled={!frame.loto} onClick={()=>onLoto(0)}>Reiniciar ejercicio LOTO</button><p>Secuencia de referencia: <a href="https://www.osha.gov/etools/lockout-tagout/tutorial/application-energy-control" target="_blank" rel="noreferrer">OSHA · control de energías peligrosas</a>. Pendiente de adaptación al procedimiento de INACAP.</p>
  </section>}
  {tab==='photos'&&<section><p>Seis fotografías aportadas el 15 de octubre de 2026.</p><div className="procedure-actions">{PHOTOS.map((p,i)=><button key={p[0]} aria-pressed={photo===i} onClick={()=>setPhoto(i)}>Foto {i+1}</button>)}</div><a href={'/photos-2026-10-15/'+PHOTOS[photo][0]} target="_blank" rel="noreferrer"><img className="procedure-photo" src={'/photos-2026-10-15/'+PHOTOS[photo][0]} alt={PHOTOS[photo][1]}/></a><p>{PHOTOS[photo][1]}</p><p>El negro visible en los bornes NC se representa gris por tu indicación anterior. Las fotos 3–5 no muestran 95–96 en el contactor trifásico; se conservan como información indicada previamente, por confirmar. La referencia KM manuscrita sigue sin confirmarse por la fotografía.</p></section>}
 </aside>}</div>;
}
