import {useId, useState} from 'react';
import {Play, Power, RotateCcw, CheckCircle2, Hand, ListOrdered, Move3d} from 'lucide-react';
import {ARM_ID, BLOCK_ID, heldId, armTaskProgress} from './model.ts';
import {JOINTS, armAngles, armFrames} from './kinematics.ts';
import type {ArmController} from './useArmController';
import {ConveyorControls} from '../conveyor/ConveyorControls';

const locked = (c:ArmController) => !c.enabled || c.eStop || c.running || c.dropping;
const stateLabel = (c:ArmController) => c.eStop?'Emergencia activa':c.paused?'En pausa':c.dropping?'Soltando pieza':c.running?c.feeding?'Transportando pieza':'Brazo en movimiento':c.enabled?'Listo para mover':'Motores apagados';

/** Uses FloatingWindow through the shared Robotics window manager. No fixed overlay. */
export function ArmControls({controller:c,selected,onTabChange:setTab}:{controller:ArmController;selected:string;onTabChange:(name:string)=>void}) {
  const uid=useId(),tab=selected==='Cinta'&&!c.line.belt?'Empezar':selected;
  const arm=c.project.parts.find(x=>x.definitionId===ARM_ID);if(!arm)return null;
  const progress=armTaskProgress(c.project),tcp=armFrames(arm).tcp.position;
  const tabs=['Empezar','Mover a mano','Programa',...(c.line.belt?['Cinta']:[])];
  return <div className="rb-arm-controls rb-arm-content">
    <div className="rb-arm-power" data-status={c.status}>
      <div><small>{c.enabled?'Control del brazo':'1 · Enciende el brazo'}</small><strong>{stateLabel(c)}</strong></div>
      <button type="button" disabled={c.running||c.dropping||c.eStop} onClick={c.enable}><Power size={16}/>{c.enabled?'Apagar motores':'Encender motores'}</button>
    </div>
    {c.message&&<p className="rb-arm-feedback" role="status">{c.message}</p>}
    <div className="rb-arm-tabs" role="tablist" aria-label="Controles del brazo">{tabs.map(name=><button type="button" key={name} id={`${uid}-tab-${tabs.indexOf(name)}`} role="tab" aria-selected={tab===name} aria-controls={`${uid}-body`} tabIndex={tab===name?0:-1} onKeyDown={e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
      const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1)!:tabs[(tabs.indexOf(name)+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];setTab(next);document.getElementById(`${uid}-tab-${tabs.indexOf(next)}`)?.focus();
    }} onClick={()=>setTab(name)}>{name}</button>)}</div>
    <div id={`${uid}-body`} role="tabpanel" aria-labelledby={`${uid}-tab-${tabs.indexOf(tab)}`}>
      {tab==='Empezar'&&<>
        <section className="rb-arm-start">
          <span className="rb-arm-kicker">2 · Prueba el recorrido</span>
          <h4>{c.line.belt?'De la cinta a su color':'Recoger, levantar y depositar'}</h4>
          <p>{c.line.belt?'La cinta acerca cada cubo. El brazo lo recoge y lo deja en la zona del mismo color.':'El brazo tomará '+(progress.total>1?'los cubos y los dejará en sus zonas.':'el cubo naranja y lo dejará en la zona azul.')+' Tú puedes pausar en cualquier momento.'}</p>
          <div className="rb-arm-sequence" aria-label="Orden del recorrido"><span>Recoger</span><span>Levantar</span><span>Trasladar</span><span>Soltar</span></div>
          {!c.enabled&&!c.eStop&&<small>Primero pulsa «Encender motores». No necesitas configurar ni enseñar puntos para esta primera prueba.</small>}
          {c.eStop&&<small>Restablece la emergencia en la parte inferior. Después vuelve a encender los motores.</small>}
          {progress.complete&&<p className="rb-arm-success"><CheckCircle2 size={18}/>Objetivo logrado. Reinicia la práctica para repetirla.</p>}
        </section>
        <div className="rb-arm-next-actions"><button type="button" onClick={()=>setTab('Mover a mano')}><Hand size={17}/><span>Mover yo el brazo<small>Controlar ejes y pinza</small></span></button><button type="button" onClick={()=>setTab('Programa')}><ListOrdered size={17}/><span>Crear mi recorrido<small>Guardar y ordenar posiciones</small></span></button></div>
        <ManualPractice controller={c}/>
      </>}
      {tab==='Mover a mano'&&<ManualControls controller={c}/>}
      {tab==='Programa'&&<ProgramControls controller={c} onManual={()=>setTab('Mover a mano')}/>}
      {tab==='Cinta'&&<ConveyorControls controller={c}/>}
    </div>
    <label className="rb-arm-speed">Velocidad del brazo · {c.speed} %<input type="range" aria-label="Velocidad del brazo" min="10" max="100" step="10" value={c.speed} disabled={c.running||c.dropping} onChange={e=>c.setSpeed(Number(e.target.value))}/><small>Reduce la velocidad para seguir cada movimiento.</small></label>
    <div className="rb-arm-progress"><span>Entregas verificadas: {progress.done} de {progress.total}</span><progress aria-label="Piezas entregadas" value={progress.done} max={Math.max(1,progress.total)}/></div>
    {!c.eStop&&progress.complete&&!c.running&&!c.dropping&&<p role="status" className="rb-arm-success">✓ Práctica completada: {progress.total===1?'pieza depositada dentro de la zona.':'todas las piezas depositadas en sus destinos.'}</p>}
    {!(tab==='Empezar'&&progress.complete)&&<button type="button" className="rb-arm-reset" disabled={locked(c)} onClick={c.resetPractice}><RotateCcw size={15}/>Reiniciar práctica</button>}
    <details className="rb-arm-technical"><summary>Posición y datos del modelo</summary><p className="rb-arm-position">Pinza respecto a la base · X {(tcp[0]*1000).toFixed(1)} · Y {(-tcp[2]*1000).toFixed(1)} · Z {(tcp[1]*1000).toFixed(1)} mm</p><p>Simulación educativa local con modelo mecánico E6. Pinza añadida; sin conexión al equipo físico. Carga de referencia: 750 g incluida la herramienta simulada de 80 g.</p><p>Par estimado con datos CAD; no es una medición del motor: {c.torques.map((v,i)=>`J${i+1}: ${v.toFixed(2)} N·m`).join(' · ')}.</p><a href="https://github.com/Dobot-Arm/DOBOT_6Axis_ROS2_V4" target="_blank" rel="noreferrer">Modelo y licencia del fabricante ↗</a></details>
  </div>;
}

/** Always visible in the FloatingWindow action area, outside its scrolling body. */
export function ArmTransportControls({controller:c,showStart=false}:{controller:ArmController;showStart?:boolean}) {
  const complete=armTaskProgress(c.project).complete;
  return <div className="rb-arm-transport">
    {c.step&&<p role="status">Paso {c.step.index} de {c.step.total} · {c.step.name}</p>}
    <div className="rb-arm-actions">
      {showStart&&!c.running&&!c.eStop&&(complete?<button type="button" className="rb-arm-reset" disabled={locked(c)} onClick={c.resetPractice}><RotateCcw size={15}/>Reiniciar práctica</button>:<button type="button" className="rb-arm-primary" disabled={locked(c)} onClick={()=>void(c.line.belt?c.classify():c.startPractice())}><Play size={18}/>{c.line.belt?'Iniciar clasificación':'Iniciar práctica automática'}</button>)}
      {c.running&&<><button type="button" onClick={c.pause}>{c.paused?'Reanudar movimiento':'Pausar movimiento'}</button><button type="button" onClick={c.stop}>Detener movimiento</button></>}
      <button type="button" className="rb-arm-estop" onClick={c.emergency}>EMERGENCIA</button>
      {c.eStop&&<button type="button" onClick={c.resetEmergency}>Restablecer emergencia</button>}
    </div>
  </div>;
}

function ManualPractice({controller:c}:{controller:ArmController}) {
  const arm=c.project.parts.find(x=>x.definitionId===ARM_ID)!,holding=heldId(arm),blocked=locked(c);
  const blocks=c.project.parts.filter(x=>x.definitionId===BLOCK_ID);
  return <details className="rb-arm-manual-practice"><summary>Hacerlo paso a paso</summary>
    <p>Acércate con la pinza abierta. Ciérrala junto al cubo, levanta, lleva a la zona y abre para soltar.</p>
    {blocks.length>1&&<label>Pieza de trabajo<select aria-label="Pieza de trabajo" disabled={blocked||!!holding} value={c.selectedBlock||blocks[0]?.instanceId} onChange={e=>c.setSelectedBlock(e.target.value)}>{blocks.map(x=><option key={x.instanceId} value={x.instanceId}>{x.label}</option>)}</select></label>}
    <div className="rb-arm-actions"><button type="button" disabled={blocked||!!holding} onClick={()=>c.approach(false,true)}>Sobre la pieza</button><button type="button" disabled={blocked||!!holding} onClick={()=>c.approach(false)}>Acercar a pieza</button><button type="button" disabled={blocked||!holding} onClick={()=>c.approach(true,true)}>Sobre la zona</button><button type="button" disabled={blocked||!holding} onClick={()=>c.approach(true)}>Acercar a zona</button></div>
    <GripperControls controller={c}/>
  </details>;
}

function GripperControls({controller:c}:{controller:ArmController}) {
  const arm=c.project.parts.find(x=>x.definitionId===ARM_ID)!,holding=heldId(arm);
  return <section className="rb-arm-gripper"><p><strong>Pinza {arm.props?.gripperOpen===false?'cerrada':'abierta'}</strong> · {holding?'Sostiene una pieza':'Sin pieza sujeta'}</p><div className="rb-arm-actions"><button type="button" disabled={locked(c)} onClick={c.grip}>{arm.props?.gripperOpen===false?'Abrir pinza':'Cerrar pinza'}</button><button type="button" disabled={locked(c)} onClick={c.home}>Posición inicial / levantar</button></div></section>;
}

function ManualControls({controller:c}:{controller:ArmController}) {
  const [mode,setMode]=useState('Articulaciones'),[draft,setDraft]=useState<number[]|null>(null);
  const arm=c.project.parts.find(x=>x.definitionId===ARM_ID)!,actual=armAngles(arm),target=draft??actual;
  const busy=c.running||c.dropping;
  return <>
    <h4 className="rb-arm-section-title">Mueve una parte o desplaza la pinza</h4>
    <p>Los cambios de posición se recorren poco a poco. Si el camino está bloqueado, el brazo te lo indicará.</p>
    <div className="rb-arm-manual-modes" role="group" aria-label="Tipo de control manual">{['Articulaciones','Cartesiano'].map(name=><button type="button" key={name} aria-pressed={mode===name} onClick={()=>setMode(name)}>{name==='Articulaciones'?'Girar articulaciones':'Desplazar pinza'}</button>)}</div>
    {!c.enabled&&<p className="rb-arm-note">Puedes elegir una posición. Para mover el brazo, enciende los motores arriba.</p>}
    {mode==='Articulaciones'?<>
      <p className="rb-arm-note">Los botones ±5° mueven un eje. Para una postura completa, ajusta las barras y pulsa «Mover a esta posición».</p>
      <div className="rb-arm-joints">{JOINTS.map((j,i)=><label key={j.name}><span>{j.name}<output>{actual[i].toFixed(1)}°{draft&&` → ${target[i].toFixed(0)}°`}</output></span><input type="range" aria-label={j.name} min={j.min} max={j.max} step="1" disabled={busy} value={target[i]} onChange={e=>{const next=[...target];next[i]=Number(e.target.value);setDraft(next);}}/><span className="rb-arm-jog"><button type="button" aria-label={`${j.name} menos 5 grados`} disabled={locked(c)} onClick={()=>{setDraft(null);c.jog(i,-1);}}>− 5°</button><button type="button" aria-label={`${j.name} más 5 grados`} disabled={locked(c)} onClick={()=>{setDraft(null);c.jog(i,1);}}>+ 5°</button></span></label>)}</div>
      <div className="rb-arm-actions"><button type="button" disabled={locked(c)||!draft} onClick={()=>{c.move([...target]);setDraft(null);}}>Mover a esta posición</button><button type="button" disabled={!draft||busy} onClick={()=>setDraft(null)}>Descartar ajuste</button></div>
    </>:<>
      <p>Desplaza la pinza 10 mm sin cambiar su orientación. Los ejes se toman desde la base del robot, aunque gires la cámara. Z es la altura.</p>
      {[['X',0,1],['Y',2,-1],['Z',1,1]].map(([name,axis,sign])=><div className="rb-arm-cartesian" key={name}><strong>{name==='Z'?'Altura Z':`Eje ${name}`}</strong><button type="button" disabled={locked(c)} onClick={()=>c.jog(Number(axis),-Number(sign),true)}>{name} − 10 mm</button><button type="button" disabled={locked(c)} onClick={()=>c.jog(Number(axis),Number(sign),true)}>{name} + 10 mm</button></div>)}
    </>}
    <GripperControls controller={c}/>
  </>;
}

function ProgramControls({controller:c,onManual}:{controller:ArmController;onManual:()=>void}) {
  const points=c.project.armProgram?.points??[],busy=c.running||c.dropping;
  const arm=c.project.parts.find(x=>x.definitionId===ARM_ID)!,angles=armAngles(arm),holding=heldId(arm);
  return <>
    <h4 className="rb-arm-section-title">Un recorrido es una lista de posiciones</h4>
    <p>Mueve el brazo, ajusta la pinza y guarda esa posición. Repite y luego ejecuta la lista en orden.</p>
    <div className="rb-arm-actions"><button type="button" onClick={onManual}><Move3d size={16}/>Mover brazo</button><button type="button" disabled={locked(c)||points.length>=40} onClick={c.record}>Guardar posición actual</button></div>
    <label>Cómo llegar al siguiente punto<select aria-label="Tipo de movimiento del brazo" value={c.kind} disabled={busy} onChange={e=>c.setKind(e.target.value as 'MovJ'|'MovL')}><option value="MovJ">Mover entre posiciones (MovJ)</option><option value="MovL">Mantener una línea recta con la pinza (MovL)</option></select></label>
    <div className="rb-arm-actions"><button type="button" disabled={busy} onClick={c.prepare}>Generar recorrido de ejemplo</button><button type="button" disabled={locked(c)||!points.length} onClick={()=>void c.playback()}>Ejecutar mi programa</button></div>
    <GripperControls controller={c}/>
    <small>{c.line.belt?'Para generar un ejemplo, primero lleva una pieza hasta el sensor en Cinta. Para clasificar todo el lote vuelve a Empezar.':'El ejemplo genera la recogida y entrega de esta escena.'} Reemplaza la lista; puedes deshacer el cambio.</small>
    {!points.length&&<div className="rb-arm-empty-program">Todavía no guardaste posiciones. Puedes generar un ejemplo y ver cómo está armado antes de crear el tuyo.</div>}
    <ol className="rb-arm-points">{points.map((p,i)=><li key={i} aria-current={c.step?.index===i+1?'step':undefined}><details><summary><strong>{i+1}. {p.name}</strong><small>{p.kind==='MovL'?'Pinza en línea recta':'Movimiento entre posiciones'} · pinza {p.gripperOpen?'abierta':'cerrada'}</small></summary><label>Nombre<input aria-label={`Nombre del punto ${i+1}`} maxLength={60} value={p.name} disabled={busy} onChange={e=>c.editPoint(i,{name:e.target.value||`P${i+1}`})}/></label><label>Recorrido<select aria-label={`Movimiento del punto ${i+1}`} value={p.kind} disabled={busy} onChange={e=>c.editPoint(i,{kind:e.target.value as 'MovJ'|'MovL'})}><option value="MovJ">Entre posiciones (MovJ)</option><option value="MovL">Pinza en línea recta (MovL)</option></select></label><div className="rb-arm-actions"><button type="button" aria-label={`Subir punto ${i+1}`} disabled={busy||i===0} onClick={()=>c.reorderPoint(i,-1)}>Subir</button><button type="button" aria-label={`Bajar punto ${i+1}`} disabled={busy||i===points.length-1} onClick={()=>c.reorderPoint(i,1)}>Bajar</button><button type="button" disabled={locked(c)} onClick={()=>c.editPoint(i,{angles:[...angles],gripperOpen:arm.props?.gripperOpen!==false,expectedHeld:holding||undefined})}>Usar postura actual</button></div></details><button type="button" aria-label={`Eliminar punto ${i+1}`} disabled={busy} onClick={()=>c.removePoint(i)}>×</button></li>)}</ol>
  </>;
}
