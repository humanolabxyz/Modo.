import {useState} from 'react';
import {LockKeyhole,PackagePlus,UnlockKeyhole} from 'lucide-react';
import {FloatingWindow} from './FloatingWindow';
import {EXTRA_KINDS,MAX_EXTRA_MODULES,type ExtraKind} from '../data/panel';
import {extraModules,useModules} from '../data/layout';

/** Botón «Añadir panel»: agrega al banco otro contactor trifásico o otro temporizador (por ejemplo, el KM3 del arranque estrella-triángulo). */
export function AddPanelMenu({onAdd,variant='button',locked,onLock}:{onAdd:(kind:ExtraKind)=>void;variant?:'button'|'tile';locked:boolean;onLock:(locked:boolean)=>void}){
 useModules();
 const [open,setOpen]=useState(false),count=extraModules().length,full=count>=MAX_EXTRA_MODULES;
 return <div className={`add-panel add-panel-${variant} module-edit-actions`}>
  <button type="button" className={variant==='tile'?'menu-tile':'add-panel-toggle'} aria-haspopup="dialog" aria-expanded={open} aria-label="Añadir panel al banco" title="Añadir otro contactor o temporizador al banco" onClick={()=>setOpen(!open)}><PackagePlus size={variant==='tile'?22:16}/><span className={variant==='tile'?undefined:'sr-label'}>{variant==='tile'?'Añadir':'Añadir panel'}</span></button>
  <div className="module-lock-controls" role="group" aria-label="Movimiento de módulos">
   <button type="button" aria-label="Bloquear movimiento de módulos" aria-pressed={locked} onClick={()=>onLock(true)}><LockKeyhole size={16}/><span className="sr-label">Fijar</span></button>
   <button type="button" aria-label="Desbloquear movimiento de módulos" aria-pressed={!locked} onClick={()=>onLock(false)}><UnlockKeyhole size={16}/><span className="sr-label">Mover</span></button>
  </div>
  {open&&<FloatingWindow title="Añadir módulo" onClose={()=>setOpen(false)} width={340} className="floating-add-panel"><div className="add-panel-pop">
   <p>Se coloca en un hueco libre. Para cambiarlo de sitio, activa «Mover»; al terminar, pulsa «Fijar».</p>
   {(Object.keys(EXTRA_KINDS) as ExtraKind[]).map(kind=><button key={kind} type="button" disabled={full} onClick={()=>{onAdd(kind);setOpen(false)}}><b>{EXTRA_KINDS[kind].label}</b><small>{EXTRA_KINDS[kind].hint}</small></button>)}
   <small className="add-panel-count">{full?`Máximo de ${MAX_EXTRA_MODULES} paneles adicionales.`:`${count} de ${MAX_EXTRA_MODULES} paneles adicionales`}</small>
  </div></FloatingWindow>}
 </div>;
}
