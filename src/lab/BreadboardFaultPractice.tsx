import {useEffect,useMemo,useState} from 'react';
import {Focus,SearchCheck,Wrench} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {holeName} from './dc';
import {checkWireRepair,createWireFault,inspectBridge,readFaultSession,type BreadboardFaultSession,type FaultMode} from './breadboardFaults';
import type {Laboratory} from './useLaboratory';

export function BreadboardFaultPractice({lab,open,onClose,onTargets}:{lab:Laboratory['board'];open:boolean;onClose:()=>void;onTargets:(ids:[string,string])=>void}){
 const key='panellab.breadboardFaults.v1.'+lab.project.id;
 const [initial]=useState(()=>{try{return {session:readFaultSession(localStorage.getItem(key),lab.project.id),error:''};}catch(e){return {session:null,error:String(e)};}});
 const [session,setSession]=useState<BreadboardFaultSession|null>(initial.session),[storageError,setStorageError]=useState(initial.error),[mode,setMode]=useState<FaultMode>('surprise'),[message,setMessage]=useState('');
 const reference=session?.reference??lab.project.breadboard,ready=useMemo(()=>inspectBridge(reference),[reference]);
 useEffect(()=>{if(!lab.ready||storageError||!session)return;try{localStorage.setItem(key,JSON.stringify(session));}catch{setStorageError('No se pudo guardar esta prueba. El montaje del proyecto y su historial siguen disponibles.');}},[lab.ready,session,key,storageError]);
 const begin=()=>{if(lab.running){setMessage('Detén la simulación antes de cambiar el cableado de prueba.');return;}
  const created=createWireFault(reference,mode,Math.floor(Math.random()*1000000));if(!created.ok){setMessage(created.message);return;}
  const board={...created.board,log:lab.project.breadboard.log,notes:lab.project.breadboard.notes};
  lab.update(p=>({...p,breadboard:board}));setSession({version:1,projectId:lab.project.id,reference:structuredClone(reference),bridge:created.bridge,fault:created.fault,attempts:0,hints:0,solved:false,notes:session?.notes??'',createdAt:new Date().toISOString()});
  setMessage('Prueba preparada con una alteración real de cableado. OUTPUT quedó apagado. Conecta la fuente e inicia la simulación para observar el síntoma; prueba un pulsador a la vez.');
 };
 const restore=()=>{if(!session||lab.running)return;lab.update(p=>({...p,breadboard:{...structuredClone(session.reference),log:p.breadboard.log,notes:p.breadboard.notes,power:{...session.reference.power??{plugged:false,redConnected:false,blackConnected:false},enabled:false}}}));setSession(s=>s?{...s,restored:true}:s);setMessage('Tu montaje original está restaurado, con OUTPUT apagado. Se conservan las mediciones y las observaciones.');};
 const verify=()=>{if(!session)return;if(lab.running){setMessage('Detén la simulación antes de comprobar la reparación.');return;}const checked=checkWireRepair(lab.project.breadboard,session.reference);setSession(s=>s?{...s,attempts:s.attempts+1,solved:checked.ok}:s);setMessage(checked.message);};
 const fault=session?.fault,original=fault?`${holeName(fault.from)} → ${holeName(fault.to)}`:'',changed=fault?`${holeName(fault.newFrom??fault.from)} → ${holeName(fault.newTo??fault.to)}`:'';
 const motor=reference.components.find(c=>c.id===(session?.bridge??(ready.ok?ready.bridge:null))?.motor);
 return <FloatingWindow visible={open} title="Prueba de fallos · Puente H" eyebrow="BUSCAR · MEDIR · REPARAR" width={380} side="left" anchor="top" top={75} heightFraction={.8} scaleBody={false} className="breadboard-fault-window" closeLabel="Cerrar modo prueba de fallos" onClose={onClose}>
  <div className="breadboard-fault-practice"><p>Parte de tu puente H ya armado. Se retira un puente o se mueve uno de sus extremos a otro orificio. La fuente, el motor y el multímetro responden al cableado que queda.</p>
  {!ready.ok&&<p role="status">{ready.message} Puedes cargar y armar la referencia desde las lecciones.</p>}
  <label>Tipo de prueba<select aria-label="Tipo de fallo del puente H" value={mode} onChange={e=>setMode(e.target.value as FaultMode)}><option value="surprise">Sorpresa · un fallo</option><option value="remove">Un puente retirado</option><option value="move">Un extremo en otro orificio</option></select></label>
  <button type="button" className="fault-primary" disabled={!lab.ready||lab.running||!ready.ok} onClick={begin}><Wrench size={17}/>{session?'Nueva prueba sobre mi referencia':'Iniciar prueba con mi montaje'}</button>
  {session&&<><p className="fault-state" role="status">{session.restored?'Montaje original restaurado':session.solved?'Reparación comprobada':'Fallo preparado · encuentra la causa'} · {session.attempts} comprobaciones · ayuda {session.hints}/2</p>
   <ol><li>Observa qué sentido falla. Usa tensión, corriente y continuidad según el estado del circuito.</li><li>Detén la simulación y apaga OUTPUT antes de retirar o recolocar puentes.</li><li>Repara con las herramientas normales y pulsa «Comprobar mi reparación».</li></ol>
   {motor&&<button type="button" onClick={()=>{onTargets([motor.from,motor.to]);onClose();}}><Focus size={16}/>Localizar bornes del motor</button>}
   <button type="button" disabled={session.hints===2} onClick={()=>setSession(s=>s?{...s,hints:(s.hints+1) as 1|2}:s)}>Pedir pista</button>
   {session.hints>=1&&<p>Compara los dos mandos y sigue alimentación → transistor → motor → retorno. Un extremo movido una columna puede dejar otra red eléctrica. El canal e–f y los rieles cortados requieren puentes explícitos.</p>}
   {session.hints===2&&fault&&<section className="fault-reveal"><h4>Cambio introducido</h4><p>{fault.kind==='remove'?`Se retiró el puente que unía ${original}.`:`Un extremo del puente ${original} se cambió y ahora une ${changed}.`}</p><button type="button" onClick={()=>{onTargets([fault.from,fault.to]);onClose();}}><Focus size={16}/>Localizar conexión de referencia</button></section>}
   <button type="button" disabled={lab.running||!!session.restored} onClick={verify}><SearchCheck size={17}/>Comprobar mi reparación</button>
   <button type="button" disabled={lab.running} onClick={restore}>Restaurar mi montaje original</button>
   <label>Mis observaciones<textarea aria-label="Observaciones de la prueba de fallos" maxLength={4000} rows={3} value={session.notes} onChange={e=>setSession(s=>s?{...s,notes:e.target.value}:s)}/></label>
  </>}
  {message&&<p role="status" className="fault-feedback">{message}</p>}{storageError&&<p role="alert">{storageError}</p>}
  <p>Puedes cerrar para medir y volver desde «Modo prueba · buscar fallos». Deshacer conserva los cambios del proyecto; restaurar recupera la referencia guardada. La comprobación utiliza el modelo eléctrico y no certifica un equipo físico.</p></div>
 </FloatingWindow>;
}
