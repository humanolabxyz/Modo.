import {useEffect,useRef,useState,type ReactNode} from 'react';
import {BookOpen,SlidersHorizontal} from 'lucide-react';
import {FloatingWindow} from '../../components/FloatingWindow';
import {useCompactLayout} from '../../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from '../workspaceLayout';
import {CABINET_STEPS,programmed} from './cabinet';
import {GOALS} from './CabinetIntroduction';
import type {Board,CabinetStep} from './model';
type WindowState='open'|'minimized'|'closed';
export function CabinetGuide({board,step,navigate,openKey,selectionLabel,properties,tools,onZoomHost,children}:{
 board:Board;step:CabinetStep;navigate:(step:CabinetStep)=>void;openKey:number;
 selectionLabel?:string;properties:ReactNode;tools:ReactNode;onZoomHost:(node:HTMLDivElement|null)=>void;children:ReactNode;
}){
 const {compact,portrait}=useCompactLayout(LAB_COMPACT_QUERY);
 const [activity,setActivity]=useState<WindowState>('open'),[inspect,setInspect]=useState<WindowState>('closed');
 const [activation,setActivation]=useState(0),[propertyActivation,setPropertyActivation]=useState(0);
 const body=useRef<HTMLDivElement>(null);
 const showActivity=()=>{setActivity('open');setActivation(v=>v+1);if(compact)setInspect(v=>v==='open'?'minimized':v);};
 const showProperties=()=>{setInspect('open');setPropertyActivation(v=>v+1);if(compact)setActivity(v=>v==='open'?'minimized':v);};
 useEffect(()=>{if(openKey){setActivity('open');setActivation(v=>v+1);if(compact)setInspect(v=>v==='open'?'minimized':v);}},[openKey,compact]);
 useEffect(()=>{if(!selectionLabel)setInspect('closed');},[selectionLabel]);
 useEffect(()=>{if(body.current)body.current.closest('.floating-window-body')?.scrollTo({top:0});},[step]);
 const steps=CABINET_STEPS.filter(s=>s.id!=='program'||programmed(board)),goal=GOALS[step];
 return <>
  <div className="cab-controls">
   <div className="workspace-dock" role="toolbar" aria-label="Herramientas de la pizarra">
    {tools}<span className="workspace-dock-separator"/>
    <button data-inline-action type="button" aria-label="Abrir actividad del taller" title={`Actividad · ${activity==='minimized'?'minimizada':steps.find(s=>s.id===step)?.name}`} aria-expanded={activity==='open'} aria-haspopup="dialog" data-window-state={activity} onClick={showActivity}><BookOpen size={19}/><span>Actividad</span></button>
    <button data-inline-action type="button" aria-label={selectionLabel?`Propiedades · ${selectionLabel}`:'Propiedades: selecciona un equipo o cable'} title={selectionLabel?`Propiedades · ${selectionLabel}`:'Selecciona un equipo o cable'} disabled={!selectionLabel} aria-expanded={inspect==='open'} aria-haspopup="dialog" data-window-state={inspect} onClick={showProperties}><SlidersHorizontal size={19}/><span>Propiedades</span></button>
   </div>
   <div className="cab-zoom-slot" ref={onZoomHost}/>
  </div>
  {activity!=='closed'?<FloatingWindow title="Actividad · Tableros" className="automation-window cabinet-activity-window" width={compact?(portrait?320:520):380} side="right" top={compact?10:180} heightFraction={compact?(portrait?.85:.95):.78} activation={activation} visible={activity==='open'} showControlsHint closeLabel="Cerrar actividad del taller" onClose={()=>setActivity('closed')} onMinimize={()=>setActivity('minimized')}>
   <div ref={body} className="cab-activity-content">
    <header className="cab-guide-heading"><label><span>PASO {steps.findIndex(s=>s.id===step)+1} DE {steps.length}</span><select aria-label="Etapa del taller" value={step} onChange={e=>navigate(e.target.value as CabinetStep)}>{steps.map((s,i)=><option key={s.id} value={s.id}>{i+1}. {s.name}</option>)}</select></label></header>
    <div className="cab-guide-body">{children}</div>
    <details className="cab-stage-help"><summary>Qué hacer y qué comprobar</summary><h3>{goal.title}</h3><p>{goal.action}</p><p><b>Resultado esperado:</b> {goal.result}</p></details>
   </div>
  </FloatingWindow>:null}
  {inspect!=='closed'&&selectionLabel?<FloatingWindow title={`Propiedades · ${selectionLabel}`} className="automation-window" width={330} side="right" top={compact?12:180} heightFraction={.75} activation={propertyActivation} visible={inspect==='open'} showControlsHint closeLabel="Cerrar propiedades del tablero" onClose={()=>setInspect('closed')} onMinimize={()=>setInspect('minimized')}>{properties}</FloatingWindow>:null}
 </>;
}
