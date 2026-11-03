import {useEffect,useMemo,useRef,useState} from 'react';
import {Check,CircleAlert,Lock} from 'lucide-react';
import {FloatingWindow} from '../../components/FloatingWindow';
import {storageIdOf} from '../windows/useRoboticsWindows';
import type {PinRef,RobotProject} from '../project/types.ts';
import {CURATED_GUIDES,allWiringGuides,detectWiringGuide,getWiringGuide} from './guides.ts';
import {guideProgress,matchReference,resolveWire,stepPins,type Matched} from './wireGuide.ts';
import type {GuideStep} from './types.ts';
import {WiringDiagram} from './WiringDiagram';

type Props={project:RobotProject;guideId:string|undefined;onChoose(id:string):void;onApply(step:GuideStep,matched?:Matched):void;onGhost(wire:{from:PinRef;to:PinRef;color:string}|null):void;onShow(refs:PinRef[]):void;onClear():void;onClose():void};
export function WiringGuide({project,guideId,onChoose,onApply,onGhost,onShow,onClear,onClose}:Props){
 const [automatic,setAutomatic]=useState(true),[all,setAll]=useState(false),[selected,setSelected]=useState<number|null>(null);
 const detected=useMemo(()=>detectWiringGuide(project),[project.parts,project.workspace.assemblyTemplate]);
 const guide=automatic?(detected??getWiringGuide(guideId)):getWiringGuide(guideId);
 useEffect(()=>setSelected(null),[guide?.id]);
 const progress=guide?guideProgress(project,guide):null,matched=guide?matchReference(project,guide):undefined;
 const index=guide&&progress?(selected!==null&&selected<guide.steps.length?selected:progress.current):-1;
 const step=guide&&index>=0?guide.steps[index]:null,state=progress&&index>=0?progress.states[index]:null;
 const previewIndex=guide&&step?.kind==='prop'?guide.steps.findIndex((s,i)=>s.kind==='wire'&&progress?.states[i].state!=='done'):-1;
 const previewStep=step?.kind==='wire'?step:guide&&previewIndex>=0?guide.steps[previewIndex]:null;
 const resolved=previewStep?.kind==='wire'?resolveWire(project,previewStep,matched):null;
 const wire=resolved&&!('missing'in resolved)?resolved:null;
 const shown=useRef('');
 useEffect(()=>{const key=wire?`${guide?.id}:${previewStep?.id}:${wire.from.instanceId}.${wire.from.pinId}>${wire.to.instanceId}.${wire.to.pinId}`:'';if(key===shown.current)return;shown.current=key;if(wire&&previewStep?.kind==='wire'){onShow([wire.from,wire.to]);onGhost({from:wire.from,to:wire.to,color:previewStep.color});}else{onClear();onGhost(null);}});
 useEffect(()=>()=>{onClear();onGhost(null);},[]);
 const selectGuide=(id:string)=>{setSelected(null);setAutomatic(id==='auto');if(id!=='auto')onChoose(id);};
 const wrongAt=progress?progress.states.findIndex((s,i)=>s.state==='wrong'&&i!==index):-1;
 return <FloatingWindow storageId={storageIdOf('wiring')} title="Cableado paso a paso" eyebrow="Robótica" width={360} side="left" top={70} className="rb-guide-window" closeLabel="Cerrar cableado paso a paso" onClose={onClose}><section className="rb-assembly-guide rb-wiring-guide rb-guide-in-window" aria-label="Cableado paso a paso" data-guide-id={guide?.id??''}>
 <label>Robot a cablear<select aria-label="Guía de cableado" value={automatic?'auto':guideId??''} onChange={e=>selectGuide(e.target.value)}><option value="auto">Detectar el robot armado</option><option value="">Elegir otra guía…</option><optgroup label="Con explicación detallada">{CURATED_GUIDES.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</optgroup><optgroup label="Robots de las plantillas">{allWiringGuides().filter(g=>g.id.startsWith('plantilla:')).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</optgroup></select></label>
 {automatic&&detected?<p className="rb-guide-detected" role="status">Robot reconocido: <b>{detected.name}</b></p>:automatic?<p className="rb-guide-caption">No hay una coincidencia segura para este armado. Elige su referencia; si has cambiado piezas, revisa los pasos que faltan.</p>:null}
 {!guide?<p>Elige una guía para cablear tu robot con ayuda. Antes arma las piezas en el modo Construir.</p>:progress&&<>
 <div className="rb-guide-progress"><span>{progress.done} de {progress.total} pasos</span><progress aria-label="Avance del cableado" value={progress.done} max={progress.total}/></div>
 {wrongAt>=0&&progress.states[wrongAt].state==='wrong'?<p className="rb-warn rb-wiring-wrong" role="alert" data-wrong={guide.steps[wrongAt].id}><CircleAlert size={14}/><span>Cable por revisar · paso {wrongAt+1}: {guide.steps[wrongAt].title}. {(progress.states[wrongAt] as {hint:string}).hint}</span></p>:null}
 {progress.complete&&<p className="rb-wiring-done" role="status"><Check size={15}/><span><b>¡Cableado completo!</b> Todos los cables están donde deben. Continúa en Programar y Simular. Puedes revisar las conexiones en el diagrama.</span></p>}
 {step&&state&&<div className="rb-wiring-step" data-step={step.id} data-state={state.state}>
 <small>{step.group} · paso {index+1} de {progress.total}</small><strong className="rb-guide-piece">{step.title}</strong>
 {step.kind==='wire'&&<span className="rb-wiring-color"><i style={{background:step.color}}/>cable {step.colorName}</span>}<p>{step.why}</p>
 {(state.state==='blocked'||state.state==='wrong')&&<p className="rb-warn"><Lock size={14}/><span>{state.hint}</span></p>}
 <div className="rb-guide-actions">{step.kind==='wire'&&<button type="button" onClick={()=>onShow(stepPins(project,step,matched))} disabled={state.state==='blocked'}>Ver pines en 3D</button>}<button type="button" onClick={()=>onApply(step,matched)} disabled={state.state==='blocked'||state.state==='done'}>{step.kind==='wire'?'Poner el cable por mí':'Hacerlo por mí'}</button></div>
 {step.kind==='prop'&&previewStep?.kind==='wire'&&wire?<p className="rb-guide-caption">Vista previa del próximo cable. Completa este ajuste antes de conectarlo.</p>:null}
 </div>}
 {previewStep?.kind==='wire'&&wire?<div className="rb-step-diagram" aria-label="Diagrama de la conexión seleccionada"><span>CONEXIÓN {step?.kind==='prop'?'SIGUIENTE':'SELECCIONADA'}</span><div><b>1</b><strong>{wire.fromPart.label}<small>Pin {wire.from.pinId}</small></strong></div><svg viewBox="0 0 260 30" role="img" aria-label={`Cable ${previewStep.colorName} entre los dos pines`}><path d="M18 15H242" stroke={previewStep.color} strokeWidth="5"/><circle cx="18" cy="15" r="7" fill={previewStep.color}/><circle cx="242" cy="15" r="7" fill={previewStep.color}/></svg><div><b>2</b><strong>{wire.toPart.label}<small>Pin {wire.to.pinId}</small></strong></div><p>Une 1 → 2 con el cable {previewStep.colorName}. {state?.state==='done'?'Esta conexión ya está presente en el proyecto.':'La línea en el robot es una referencia; todavía no está conectada.'}</p></div>:null}
 <nav className="rb-wiring-navigation" aria-label="Recorrer conexiones"><button disabled={index<=0} onClick={()=>setSelected(Math.max(0,index-1))}>Anterior</button><button disabled={index>=guide.steps.length-1} onClick={()=>setSelected(index+1)}>Siguiente</button>{selected!==null&&<button onClick={()=>setSelected(null)}>Ir al pendiente</button>}</nav>
 <WiringDiagram project={project} guide={guide} selected={previewStep?.id} states={progress.states} onSelect={i=>setSelected(i)}/>
 <button type="button" className="rb-structure-link" aria-expanded={all} onClick={()=>setAll(v=>!v)}>{all?'Ocultar la lista de pasos':'Ver todos los pasos'}</button>
 {all&&<ol className="rb-wiring-list" aria-label="Todos los pasos">{guide.steps.map((s,i)=><li key={s.id} data-state={progress.states[i].state} aria-current={i===index?'step':undefined}><span aria-hidden="true">{progress.states[i].state==='done'?'✓':i+1}</span><button type="button" onClick={()=>setSelected(i)}>{s.title}</button></li>)}</ol>}
 </>}
 </section></FloatingWindow>;
}
