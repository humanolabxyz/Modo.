import {useEffect,useRef,useState,type PointerEvent,type ReactNode} from 'react';
import {Cable,MousePointer2,Shapes,Trash2} from 'lucide-react';
import {DEVICES,pinKey,uid,type Device,type DeviceKind,type End} from './model';
import type {Laboratory} from './useLaboratory';
import {InspectorSheet} from './InspectorSheet';
import {PanStage,type StageApi} from './PanStage';
import {FloatingDock,type DockItem} from './CanvasControls';
import {DeviceIcon,iconTile} from './DeviceIcons';
import {historyDock} from './SurfaceDock';
type Point={x:number;y:number};
const NOTES:Record<DeviceKind,string>={supply:'Una sola por proyecto',no:'Se cierra al pulsar',nc:'Se abre al pulsar',coil:'Al energizarse cierra sus contactos',contact:'Sigue a la bobina con el mismo nombre',lamp:'Se enciende con tensión',motor:'Gira con tensión',output:'Sigue la salida del PLC'};
function point(event:PointerEvent<SVGElement>):Point {const svg=event.currentTarget.ownerSVGElement??event.currentTarget as SVGSVGElement;const matrix=svg.getScreenCTM();const p=matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):new DOMPoint();return {x:Math.max(55,Math.min(845,Math.round(p.x/10)*10)),y:Math.max(55,Math.min(575,Math.round(p.y/10)*10))};}
/** Símbolo normalizado de cada elemento, con su estado visible: contactos que se abren y cierran, pulsador que se hunde,
 *  bobina que se energiza, piloto que ilumina y motor que gira. */
function Symbol({device,on,closed,pressed,running}:{device:Device;on:boolean;closed:boolean;pressed:boolean;running:boolean}):ReactNode{
  const lit=running&&on;
  switch(device.kind){
    case 'supply':return <><line y1="-48" y2="-9"/><line y1="9" y2="48"/><line x1="-19" x2="19" y1="-9" y2="-9" strokeWidth="3.4"/><line x1="-11" x2="11" y1="9" y2="9" strokeWidth="5"/><text x="-27" y="-14" className="lab-symbol-sign">+</text><text x="-27" y="26" className="lab-symbol-sign">−</text><text x="30" y="4" className="lab-device-note">24 V DC</text></>;
    case 'coil':return <><line x1="-48" x2="-22"/><line x1="22" x2="48"/><rect className={`lab-coil-body ${lit?'energized':''}`} x="-22" y="-16" width="44" height="32" rx="4"/><path className="lab-coil-turns" d="M-12 -7v14M-4 -7v14M4 -7v14M12 -7v14"/><text x="-40" y="-8" className="lab-terminal-label">A1</text><text x="30" y="-8" className="lab-terminal-label">A2</text></>;
    case 'lamp':return <><line x1="-48" x2="-22"/><line x1="22" x2="48"/>{lit?<circle className="lab-lamp-glow" r="34"/>:null}<circle className={`lab-lamp-body ${lit?'lit':''}`} r="22"/><line x1="-15.5" y1="-15.5" x2="15.5" y2="15.5"/><line x1="-15.5" y1="15.5" x2="15.5" y2="-15.5"/></>;
    case 'motor':return <><line x1="-48" x2="-22"/><line x1="22" x2="48"/><circle className={`lab-motor-body ${lit?'lit':''}`} r="22"/>{lit?<circle className="lab-motor-spin" r="28"/>:null}<text textAnchor="middle" y="7" className="lab-symbol-text">M</text></>;
    case 'no':case 'nc':{const travel=pressed?6:0;return <><line x1="-48" x2="-17"/><line x1="17" x2="48"/><circle className="lab-contact-point" cx="-17" r="3"/><circle className="lab-contact-point" cx="17" r="3"/>
      <line className={`lab-blade ${closed?'closed':''} ${closed&&running?'live':''}`} x1="-17" y1="0" x2={closed?17:13} y2={closed?0:-15}/>
      <line className="lab-link" x1="0" x2="0" y1={closed?-18:-13+travel} y2={-28+travel}/><rect className="lab-pushcap" x="-14" y={-37+travel} width="28" height="9" rx="4.5"/>
      <text y="39" textAnchor="middle" className="lab-device-note">{device.signal||device.tag}</text></>;}
    default:return <><line x1="-48" x2="-16"/><line x1="16" x2="48"/><line x1="-16" y1="-17" x2="-16" y2="17"/><line x1="16" y1="-17" x2="16" y2="17"/>{closed?<line className="lab-bridge" x1="-16" x2="16"/>:null}<text y="39" textAnchor="middle" className="lab-device-note">{device.signal||device.tag}</text></>;
  }
}
export function SchematicView({lab}:{lab:Laboratory}){
  const {project,update,running,runtime}=lab;
  const [tool,setTool]=useState<'select'|'wire'>('select'),[selected,setSelected]=useState<string|null>(null),[selectedWire,setSelectedWire]=useState<string|null>(null),[pending,setPending]=useState<End|null>(null),[drag,setDrag]=useState<{id:string;point:Point}|null>(null);
  const origin=useRef<{id:string;point:Point;device:Point;moved:boolean}|null>(null),latest=useRef<Point|null>(null),stage=useRef<StageApi|null>(null);
  const active=project.schematic.devices.find(d=>d.id===selected);
  const change=(id:string,patch:Partial<Device>)=>update(p=>({...p,schematic:{...p.schematic,devices:p.schematic.devices.map(d=>d.id===id?{...d,...patch}:d)}}));
  const free=(p:Point)=>{let q=p,tries=0;const taken=(c:Point)=>project.schematic.devices.some(d=>Math.abs(d.x-c.x)<90&&Math.abs(d.y-c.y)<80);while(taken(q)&&tries<40){tries++;q={x:p.x+(tries%6)*100-250+(Math.floor(tries/6)%2)*50,y:p.y+Math.floor(tries/6)*90};q={x:Math.max(55,Math.min(845,Math.round(q.x/10)*10)),y:Math.max(55,Math.min(575,Math.round(q.y/10)*10))};}return q;};
  const add=(kind:DeviceKind)=>{if(project.schematic.devices.length>=128){lab.setMessage('El esquema admite hasta 128 elementos en esta versión.');return;}const definition=DEVICES.find(d=>d.kind===kind)!;let index=1;while(project.schematic.devices.some(d=>d.tag===`${definition.prefix}${index}`))index++;
    const centre=stage.current?.center()??{x:450,y:320},spot=free({x:Math.max(55,Math.min(845,Math.round(centre.x/10)*10)),y:Math.max(55,Math.min(575,Math.round(centre.y/10)*10))});
    const device:Device={id:uid('device'),kind,tag:`${definition.prefix}${index}`,x:spot.x,y:spot.y,signal:kind==='no'?'I0.0':kind==='nc'?'I0.1':kind==='output'?'Q0.0':''};update(p=>({...p,schematic:{...p.schematic,devices:[...p.schematic.devices,device]}}));setSelected(device.id);setSelectedWire(null);setTool('select');};
  const connect=(end:End)=>{if(running)return;if(!pending){setPending(end);return;}if(pinKey(end)===pinKey(pending)){setPending(null);return;}if(project.schematic.wires.some(w=>[pinKey(w.from),pinKey(w.to)].sort().join('|')===[pinKey(pending),pinKey(end)].sort().join('|'))){lab.setMessage('Esos terminales ya están conectados.');setPending(null);return;}if(project.schematic.wires.length>=512){lab.setMessage('Se alcanzó la capacidad de cables del editor.');return;}const from=pending;update(p=>({...p,schematic:{...p.schematic,wires:[...p.schematic.wires,{id:uid('wire'),from,to:end}]}}));setPending(null);};
  const remove=()=>{if(running)return;if(selected){update(p=>({...p,schematic:{devices:p.schematic.devices.filter(d=>d.id!==selected),wires:p.schematic.wires.filter(w=>w.from.device!==selected&&w.to.device!==selected)}}));setSelected(null);setPending(null);}else if(selectedWire){update(p=>({...p,schematic:{...p.schematic,wires:p.schematic.wires.filter(w=>w.id!==selectedWire)}}));setSelectedWire(null);}};
  useEffect(()=>{
    const keys=(e:KeyboardEvent)=>{if((e.target as Element)?.closest('input,textarea,select,[contenteditable]')||e.ctrlKey||e.metaKey||e.altKey)return;
      if(e.key==='Delete'||e.key==='Backspace'){if(selected||selectedWire){e.preventDefault();remove();}}
      else if(e.key==='Escape'){setPending(null);setSelected(null);setSelectedWire(null);}
      else if(e.key.toLowerCase()==='v'){setTool('select');setPending(null);}else if(e.key.toLowerCase()==='w'&&!running)setTool('wire');};
    window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);
  });
  const positions=new Map(project.schematic.devices.map(d=>[d.id,drag?.id===d.id?drag.point:d]));
  const pinPoint=(end:End)=>{const d=positions.get(end.device)!,device=project.schematic.devices.find(d=>d.id===end.device)!;return device.kind==='supply'?{x:d.x,y:d.y+(end.pin===0?-48:48)}:{x:d.x+(end.pin===0?-48:48),y:d.y};};
  const wirePath=(from:End,to:End)=>{const a=pinPoint(from),b=pinPoint(to);if(a.x===b.x)return `M${a.x},${a.y} V${b.y}`;if(a.x>b.x){const y=Math.min(595,Math.max(a.y,b.y,380)+75);return `M${a.x},${a.y} V${y} H${b.x} V${b.y}`;}const mid=(a.x+b.x)/2;return `M${a.x},${a.y} H${mid} V${b.y} H${b.x}`;};
  const hasSupply=project.schematic.devices.some(x=>x.kind==='supply');
  const dock:DockItem[]=[
    {id:'select',label:'Seleccionar y mover',shortcut:'V',icon:<MousePointer2 size={20}/>,pressed:tool==='select',onClick:()=>{setTool('select');setPending(null);}},
    {id:'wire',label:'Cablear',shortcut:'W',icon:<Cable size={20}/>,pressed:tool==='wire',disabled:running,onClick:()=>setTool('wire')},
    'separator',
    {id:'components',label:'Componentes',icon:<Shapes size={20}/>,disabled:running,menu:DEVICES.map(d=>({id:d.kind,label:d.name,note:NOTES[d.kind],icon:iconTile(<DeviceIcon kind={d.kind}/>),disabled:d.kind==='supply'&&hasSupply,onClick:()=>add(d.kind)}))},
    {id:'remove',label:selected?'Retirar componente':selectedWire?'Retirar cable':'Retirar (selecciona algo)',shortcut:'Supr',icon:<Trash2 size={20}/>,disabled:running||(!selected&&!selectedWire),onClick:remove},
    'separator',
    ...historyDock(lab),
  ];
  const hint=pending?'Elige el terminal de destino · Esc cancela':running?'Mantén pulsado S1 para arrancar; pulsa S0 para parar.':tool==='wire'?'Toca un terminal y luego otro para unirlos':'Arrastra un componente · fondo para mover la hoja';
  return <div className="lab-split"><section className="lab-stage" aria-label="Editor de esquemas">
    <div className="lab-stagebar"><span role="status">{hint}</span>{pending?<button onClick={()=>setPending(null)}>Cancelar cable</button>:null}<span className="lab-count-chip">{project.schematic.devices.length} componentes · {project.schematic.wires.length} cables</span></div>
    <PanStage width={900} height={640} label="Hoja del esquema" fitLabel="Ajustar la hoja" apiRef={stage} onBackground={()=>{if(!pending){setSelected(null);setSelectedWire(null);}}} focus={()=>{const d=project.schematic.devices;if(!d.length)return null;const loops=project.schematic.wires.flatMap(w=>[...wirePath(w.from,w.to).matchAll(/V(-?\d+)/g)].map(m=>Number(m[1])));const x0=Math.min(...d.map(v=>v.x))-85,x1=Math.max(...d.map(v=>v.x))+85,y0=Math.min(...d.map(v=>v.y))-85,y1=Math.max(Math.max(...d.map(v=>v.y))+85,...loops.map(v=>v+30));return {x:x0,y:y0,w:x1-x0,h:y1-y0};}}>
    <svg className={`lab-schematic ${tool==='wire'?'is-wiring':''}`} viewBox="0 0 900 640" width="900" height="640" aria-label="Circuito de mando editable de 24 V DC" onPointerMove={event=>{const start=origin.current;if(!start)return;const position=point(event);const p={x:Math.max(55,Math.min(845,start.device.x+position.x-start.point.x)),y:Math.max(55,Math.min(575,start.device.y+position.y-start.point.y))};if(p.x!==start.device.x||p.y!==start.device.y)start.moved=true;latest.current=p;setDrag({id:start.id,point:p});}} onPointerUp={()=>{const start=origin.current;if(start&&latest.current&&start.moved)change(start.id,latest.current);origin.current=null;latest.current=null;setDrag(null);}} onPointerCancel={()=>{origin.current=null;latest.current=null;setDrag(null);}}>
      <defs><pattern id="lab-schema-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#cbd5db"/></pattern></defs><rect width="900" height="640" rx="14" className="lab-sheet-paper"/><rect width="900" height="640" rx="14" fill="url(#lab-schema-grid)"/>
      <text x="28" y="35" className="lab-sheet-caption">PANEL LAB · MANDO DC</text><text x="28" y="610" className="lab-sheet-caption">HOJA 01 · {project.name}</text>
      {project.schematic.wires.map(w=>{const voltage=running&&runtime.livePins.includes(pinKey(w.from));return <g key={w.id} className={`lab-schematic-wire ${voltage?'live':''} ${selectedWire===w.id?'selected':''}`}><path d={wirePath(w.from,w.to)}/><path className="lab-hit" d={wirePath(w.from,w.to)} role="button" tabIndex={running?-1:0} aria-label={`Seleccionar cable ${w.id}`} onClick={()=>{if(!running&&tool==='select'){setSelectedWire(w.id);setSelected(null);}}} onKeyDown={e=>{if(e.key==='Delete'&&!running)update(p=>({...p,schematic:{...p.schematic,wires:p.schematic.wires.filter(x=>x.id!==w.id)}}));else if(e.key==='Enter'){setSelectedWire(w.id);setSelected(null);}}}/></g>;})}
      {project.schematic.devices.map(device=>{const position=positions.get(device.id)!,on=running&&runtime.active.includes(device.id),closed=device.kind==='nc'?!lab.pressed[device.id]:device.kind==='no'?!!lab.pressed[device.id]:device.kind==='output'?!!runtime.memory[device.signal]:!!runtime.relays[device.tag];const isButton=device.kind==='no'||device.kind==='nc';return <g key={device.id} transform={`translate(${position.x} ${position.y})`} className={`lab-device ${device.kind} ${selected===device.id?'selected':''} ${on?'on':''} ${drag?.id===device.id?'dragging':''}`}>
        <rect className="lab-device-hit" x="-45" y="-43" width="90" height="86" rx="9" fill="transparent" role="button" tabIndex={0} aria-label={`${device.tag}: ${DEVICES.find(d=>d.kind===device.kind)?.name}`} aria-pressed={isButton&&running?!!lab.pressed[device.id]:undefined}
          onPointerDown={event=>{event.preventDefault();setSelected(device.id);setSelectedWire(null);if(running){if(isButton)lab.actuate(device.id,true);return;}if(tool==='select'){event.currentTarget.setPointerCapture(event.pointerId);origin.current={id:device.id,point:point(event),device:{x:device.x,y:device.y},moved:false};}}}
          onPointerUp={()=>{if(isButton)lab.actuate(device.id,false);}}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(device.id);if(isButton&&running)lab.actuate(device.id,true);}}} onKeyUp={e=>{if(e.key==='Enter'||e.key===' ')lab.actuate(device.id,false);}}/>
        <g pointerEvents="none"><text y="-45" textAnchor="middle" className="lab-device-tag">{device.tag}</text>
        <Symbol device={device} on={on} closed={closed} pressed={isButton&&!!lab.pressed[device.id]} running={running}/></g>
        {([0,1] as const).map(pin=><g key={pin} role="button" tabIndex={running?-1:0} aria-label={`Terminal ${device.tag} ${DEVICES.find(d=>d.kind===device.kind)!.name} ${pin===0?'1':'2'}`} onClick={()=>connect({device:device.id,pin})} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();connect({device:device.id,pin});}}}><circle cx={device.kind==='supply'?0:pin===0?-48:48} cy={device.kind==='supply'?pin===0?-48:48:0} r="12" fill="transparent" stroke="none"/><circle className={`lab-terminal ${pending?.device===device.id&&pending.pin===pin?'pending':''}`} cx={device.kind==='supply'?0:pin===0?-48:48} cy={device.kind==='supply'?pin===0?-48:48:0} r="5" fill="#fff"/></g>)}
      </g>;})}
    </svg></PanStage>
    <FloatingDock label="Herramientas del esquema" items={dock}/>
  </section><InspectorSheet title="Propiedades" summary={active?`${active.tag} seleccionado`:selectedWire?'Cable seleccionado':'Selecciona un elemento'} openKey={selected??selectedWire}><h2>Propiedades</h2>
    {active?<fieldset disabled={running}><legend>{active.tag} · {DEVICES.find(d=>d.kind===active.kind)?.name}</legend><label>Designación<input maxLength={32} value={active.tag} onChange={e=>change(active.id,{tag:e.target.value.toUpperCase()})}/></label>{['no','nc','output'].includes(active.kind)?<label>Señal compartida<select value={active.signal} onChange={e=>change(active.id,{signal:e.target.value})}>{project.plc.tags.filter(t=>t.type==='bool'&&(active.kind==='output'?t.address.startsWith('Q'):t.address.startsWith('I'))).map(t=><option key={t.address} value={t.address}>{t.address} · {t.name}</option>)}</select></label>:null}{active.kind==='contact'?<small>Usa la misma designación que la bobina para vincular este contacto.</small>:null}<button className="lab-danger" onClick={remove}>Retirar componente y sus cables</button></fieldset>:selectedWire&&project.schematic.wires.some(w=>w.id===selectedWire)?<fieldset disabled={running}><legend>Cable seleccionado</legend><button className="lab-danger" onClick={remove}>Retirar cable</button></fieldset>:<p className="lab-muted">Selecciona un componente para editarlo. Añade más desde <b>Componentes</b>, en la barra inferior.</p>}
    <details className="lab-help"><summary>Cómo probar la retención</summary><ol><li>Inicia la simulación.</li><li>Mantén S1 un instante y suéltalo.</li><li>K1 y H1 permanecen activos.</li><li>Pulsa S0 para romper la retención.</li></ol><p>Los pulsadores comparten I0.0 e I0.1 con el PLC. El circuito de relés y el programa son dos maniobras independientes.</p></details>
  </InspectorSheet></div>;
}
