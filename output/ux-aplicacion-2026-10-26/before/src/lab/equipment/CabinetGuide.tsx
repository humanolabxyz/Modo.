import {useEffect,useRef,useState,type ReactNode} from 'react';
import {BookOpen,SlidersHorizontal} from 'lucide-react';
import {FloatingWindow} from '../../components/FloatingWindow';
import {useCompactLayout} from '../../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from '../workspaceLayout';
import {CABINET_STEPS,programmed} from './cabinet';
import {GOALS} from './CabinetIntroduction';
import type {Board,CabinetStep} from './model';

export function CabinetGuide({board,step,navigate,openKey,selectionLabel,properties,children}:{
  board:Board;step:CabinetStep;navigate:(step:CabinetStep)=>void;openKey:number;
  selectionLabel?:string;properties:ReactNode;children:ReactNode;
}){
  const {compact}=useCompactLayout(LAB_COMPACT_QUERY);
  const [open,setOpen]=useState(true),[inspect,setInspect]=useState(false);
  const body=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(openKey)setOpen(true);},[openKey]);
  useEffect(()=>{if(!selectionLabel)setInspect(false);},[selectionLabel]);
  useEffect(()=>{if(body.current)body.current.closest('.floating-window-body')?.scrollTo({top:0});},[step]);
  const steps=CABINET_STEPS.filter(s=>s.id!=='program'||programmed(board)),goal=GOALS[step];
  return <>
    <div className="cab-workspace-tools" role="toolbar" aria-label="Ventanas del taller">
      <button type="button" aria-expanded={open} aria-haspopup="dialog" onClick={()=>setOpen(v=>!v)}><BookOpen size={18}/><span>Actividad</span><small>{steps.find(s=>s.id===step)?.name}</small></button>
      {selectionLabel?<button type="button" aria-expanded={inspect} aria-haspopup="dialog" onClick={()=>setInspect(v=>!v)}><SlidersHorizontal size={18}/><span>Propiedades · {selectionLabel}</span></button>:null}
    </div>
    {open?<FloatingWindow title="Actividad · Tableros" className="automation-window cabinet-activity-window" width={compact?320:380} side="right" top={compact?48:180} heightFraction={compact?.55:.7} showControlsHint closeLabel="Cerrar actividad del taller" onClose={()=>setOpen(false)}>
      <div ref={body} className="cab-activity-content">
        <header className="cab-guide-heading">
          <label><span>PASO {steps.findIndex(s=>s.id===step)+1} DE {steps.length}</span>
            <select aria-label="Etapa del taller" value={step} onChange={e=>navigate(e.target.value as CabinetStep)}>{steps.map((s,i)=><option key={s.id} value={s.id}>{i+1}. {s.name}</option>)}</select>
          </label>
          <h2>{goal.title}</h2><p>{goal.action}</p>
        </header>
        <div className="cab-guide-body">{children}</div>
      </div>
    </FloatingWindow>:null}
    {inspect&&selectionLabel?<FloatingWindow title={`Propiedades · ${selectionLabel}`} className="automation-window" width={330} side="left" top={120} heightFraction={.6} showControlsHint closeLabel="Cerrar propiedades del tablero" onClose={()=>setInspect(false)}>{properties}</FloatingWindow>:null}
  </>;
}
