import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {Shapes,Trash2} from 'lucide-react';
import {uid,type Widget} from './model';
import type {Laboratory} from './useLaboratory';
import {InspectorSheet} from './InspectorSheet';
import {PanStage,type StageApi} from './PanStage';
import {FloatingDock,type DockItem} from './CanvasControls';
import {WidgetIcon,iconTile} from './DeviceIcons';
import {historyDock} from './SurfaceDock';
const WIDGETS:{kind:Widget['kind'];label:string;note:string}[]=[{kind:'toggle',label:'Interruptor',note:'Escribe una entrada o una marca'},{kind:'lamp',label:'Piloto',note:'Indica el estado de una variable'},{kind:'number',label:'Valor numérico',note:'Muestra un dato del PLC'},{kind:'bar',label:'Barra de nivel',note:'Escala un valor entre 0 y su máximo'}];
export function HMIView({lab}:{lab:Laboratory}){
  const {project,running,update,runtime}=lab;const [selected,setSelected]=useState<string|null>(null),[drag,setDrag]=useState<{id:string;x:number;y:number}|null>(null);
  const origin=useRef<{id:string;x:number;y:number;clientX:number;clientY:number;moved:boolean}|null>(null),latest=useRef<{x:number;y:number}|null>(null),stage=useRef<StageApi|null>(null),scale=useRef(1);
  const active=project.hmi.widgets.find(w=>w.id===selected);
  const reserved=[project.process.lowSignal,project.process.highSignal,project.process.levelSignal];
  const compatible=(kind:Widget['kind'])=>project.plc.tags.filter(t=>['number','bar'].includes(kind)?t.type==='number':t.type==='bool'&&(kind!=='toggle'||/^[IM]/.test(t.address)&&!reserved.includes(t.address)));
  const patch=(id:string,value:Partial<Widget>)=>update(p=>({...p,hmi:{widgets:p.hmi.widgets.map(w=>w.id===id?{...w,...value}:w)}}));
  const snap=(x:number,y:number)=>({x:Math.max(0,Math.min(650,Math.round(x/10)*10)),y:Math.max(0,Math.min(460,Math.round(y/10)*10))});
  const add=(kind:Widget['kind'])=>{if(project.hmi.widgets.length>=128){lab.setMessage('Se alcanzó la capacidad de widgets.');return;}const tag=compatible(kind)[0];if(!tag){lab.setMessage('Primero añade una variable compatible en PLC.');return;}
    const centre=stage.current?.center()??{x:425,y:300};let spot=snap(centre.x-100,centre.y-45),tries=0;while(project.hmi.widgets.some(w=>Math.abs(w.x-spot.x)<40&&Math.abs(w.y-spot.y)<40)&&tries<30){tries++;spot=snap(spot.x+30,spot.y+30);}
    const w:Widget={id:uid('widget'),kind,label:WIDGETS.find(w=>w.kind===kind)!.label,address:tag.address,x:spot.x,y:spot.y,max:100};update(p=>({...p,hmi:{widgets:[...p.hmi.widgets,w]}}));setSelected(w.id);};
  const remove=()=>{if(running||!active)return;update(p=>({...p,hmi:{widgets:p.hmi.widgets.filter(w=>w.id!==active.id)}}));setSelected(null);};
  useEffect(()=>{const keys=(e:KeyboardEvent)=>{if((e.target as Element)?.closest('input,textarea,select,[contenteditable]'))return;if(e.key==='Delete'&&active&&!running){e.preventDefault();remove();}else if(e.key==='Escape')setSelected(null);};window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);});
  const move=(event:PointerEvent<HTMLDivElement>)=>{const start=origin.current;if(!start)return;const k=scale.current||1,p=snap(start.x+(event.clientX-start.clientX)/k,start.y+(event.clientY-start.clientY)/k);start.moved ||= p.x!==start.x||p.y!==start.y;latest.current=p;setDrag({id:start.id,...p});};
  const dock:DockItem[]=[
    {id:'components',label:'Elementos',icon:<Shapes size={20}/>,disabled:running,menu:WIDGETS.map(w=>({id:w.kind,label:w.label,note:w.note,icon:iconTile(<WidgetIcon kind={w.kind}/>),onClick:()=>add(w.kind)}))},
    {id:'remove',label:active?'Retirar elemento':'Retirar (selecciona uno)',shortcut:'Supr',icon:<Trash2 size={20}/>,disabled:running||!active,onClick:remove},
    'separator',...historyDock(lab),
  ];
  return <div className="lab-split"><section className="lab-stage"><div className="lab-stagebar"><span>{running?'Pantalla de operador · en línea con el PLC virtual':'Arrastra los elementos para diseñar la pantalla'}</span><span className="lab-badge">HMI 01</span></div>
    <PanStage width={850} height={600} label="Pantalla de operador" fitLabel="Ajustar la pantalla" apiRef={stage} scaleRef={scale} onBackground={()=>setSelected(null)}>
    <div className="lab-hmi-screen" role="region" aria-label="Pantalla de operador" onPointerMove={move} onPointerUp={()=>{const start=origin.current;if(start&&start.moved&&latest.current)patch(start.id,latest.current);origin.current=null;latest.current=null;setDrag(null);}} onPointerCancel={()=>{origin.current=null;latest.current=null;setDrag(null);}}>
      <div className="lab-hmi-heading"><span>PANEL LAB</span><strong>{project.name}</strong><span>{running?'EN OPERACIÓN':'DISEÑO DE PANTALLA'}</span></div>
      {project.hmi.widgets.length===0?<div className="lab-empty"><h2>Una pantalla para tu proyecto</h2><p>Añade controles e indicadores desde <b>Elementos</b>, en la barra inferior, y enlázalos a tus variables.</p></div>:null}
      {project.hmi.widgets.map(widget=>{const value=running?(runtime.memory[widget.address]??0):(project.plc.tags.find(t=>t.address===widget.address)?.initial??0),position=drag?.id===widget.id?drag:widget;return <div key={widget.id} className={`lab-widget ${widget.kind} ${selected===widget.id&&!running?'selected':''} ${drag?.id===widget.id?'dragging':''}`} style={{left:position.x,top:position.y}} tabIndex={running?-1:0} role={running?'group':'button'} aria-label={`${widget.label} · ${widget.address}`} onKeyDown={e=>{if(!running&&(e.key==='Enter'||e.key===' ')){e.preventDefault();setSelected(widget.id);}}} onPointerDown={e=>{if(running)return;e.preventDefault();setSelected(widget.id);e.currentTarget.setPointerCapture(e.pointerId);origin.current={id:widget.id,x:widget.x,y:widget.y,clientX:e.clientX,clientY:e.clientY,moved:false};}}>
        <strong>{widget.label}</strong>
        {widget.kind==='toggle'?running?<button role="switch" aria-checked={!!value} aria-label={`HMI ${widget.label}`} className={`lab-hmi-toggle ${value?'is-on':''}`} onClick={()=>lab.write(widget.address,!value)}><span/>{value?'ACTIVO':'INACTIVO'}</button>:<div className="lab-hmi-toggle"><span/>INTERRUPTOR</div>:
          widget.kind==='lamp'?<div className={`lab-hmi-lamp ${value?'is-on':''}`} role="img" aria-label={`${widget.label}: ${value?'encendido':'apagado'}`}/>:
          widget.kind==='number'?<output className="lab-hmi-number">{Number(value).toFixed(1)}</output>:<div className="lab-hmi-bar" role="meter" aria-label={widget.label} aria-valuemin={0} aria-valuemax={widget.max} aria-valuenow={Math.max(0,Math.min(widget.max,Number(value)))}><span style={{width:`${Math.max(0,Math.min(100,Number(value)/widget.max*100))}%`}}/><b>{Number(value).toFixed(1)} / {widget.max}</b></div>}
        <small>{widget.address}</small>
      </div>;})}
    </div></PanStage>
    <FloatingDock label="Herramientas de la pantalla" items={dock}/>
  </section><InspectorSheet title="Elemento de la pantalla" summary={active?active.label:`${project.hmi.widgets.length} elementos`} openKey={selected}><h2>Pantalla de operador</h2>
    {active?<fieldset disabled={running}><legend>Elemento seleccionado</legend><label>Etiqueta<input maxLength={80} value={active.label} onChange={e=>patch(active.id,{label:e.target.value})}/></label><label>Variable<select value={active.address} onChange={e=>patch(active.id,{address:e.target.value})}>{compatible(active.kind).map(t=><option key={t.address} value={t.address}>{t.address} · {t.name}</option>)}</select></label>{active.kind==='bar'?<label>Escala máxima<input type="number" min="0.001" max="1000000000" value={active.max} onChange={e=>{const n=e.target.valueAsNumber;if(Number.isFinite(n)&&n>0&&n<=1e9)patch(active.id,{max:n});}}/></label>:null}<button className="lab-danger" onClick={remove}>Retirar elemento</button></fieldset>:<p className="lab-muted">Selecciona un elemento de la pantalla para editar su etiqueta y su señal. Añade más desde <b>Elementos</b>, en la barra inferior.</p>}
    <details className="lab-help"><summary>Probar una pantalla</summary><p>Inicia la simulación y cambia Marcha. La salida Q0.0 activa el piloto y la bomba del tanque. Activa Paro para detenerla; desactiva Marcha para evitar un nuevo arranque.</p><p>Los interruptores escriben entradas o marcas. Los indicadores leen la memoria del PLC y de la planta.</p></details>
  </InspectorSheet></div>;
}
