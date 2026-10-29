import React, {useRef,useState} from 'react';
import { COLOR_HEX, matchesTerminal, terminalDisplay, terminalLabelPosition, type PanelModule, type Terminal } from '../data/panel';
import type {BananaCable} from '../data/practice';
import {terminalPoint,cablePath} from '../data/wiring';
import {useSvgNavigation,currentSvgView} from '../hooks/useSvgNavigation';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {WireLayer} from './WireLayer';
import {BananaCableVisual} from './BananaCable';
import type {SimulationController} from '../hooks/useSimulation';
import {boardFrame,clampFree,dropModule,fitView,getLayout,modulePos,setModulePos,snapModule,useLayout,useModules,type Pos} from '../data/layout';

type View = {x:number;y:number;w:number;h:number};
type Props={modulesLocked?:boolean;selected:string|null;onSelect:(id:string)=>void;group:string;query:string;view:View;setView:(v:View)=>void;aliases:Record<string,string>;wires?:BananaCable[];selectedWire?:string|null;onSelectWire?:(id:string)=>void;highlightedTerminals?:string[];highlightedModules?:string[];pendingTerminal?:string|null;hitConnectors?:boolean;ghost?:{from:string;to:string};ghosts?:{from:string;to:string}[];routeWireIds?:string[];errorWires?:string[];simulation?:SimulationController;overlay?:React.ReactNode;liveWireIds?:string[];onRemoveModule?:(id:string)=>void;};
const textStyle:React.CSSProperties={userSelect:'none'};

function Tag({x,y,children,small=false}:{x:number;y:number;children:React.ReactNode;small?:boolean}){
  const label=String(children);
  const width=Math.max(27, label.length*(small?5.9:7.1)+17);
  return <g><rect x={x-width/2} y={y-12} width={width} height="20" rx="2" fill="#f4f2ed" stroke="#c6c7c7" strokeWidth=".7"/>
    <text x={x} y={y+2} fontSize={small?10:12} fontWeight="650" textAnchor="middle" fill="#353943" style={textStyle}>{children}</text></g>;
}
function Pilot({x,y,c,on=false,id}:{x:number;y:number;c:string;on?:boolean;id?:string}){
 return <g data-sim-pilot={id} data-lit={on}><circle className="pilot-glow" cx={x} cy={y} r="36" fill={c} opacity={on?.65:0} filter="url(#pilotGlow)"/><circle cx={x} cy={y+2} r="28" fill="#313e3b" filter="url(#softDrop)"/><circle cx={x} cy={y} r="25" fill="#596763" stroke="#3c4844" strokeWidth="2"/>
  <circle cx={x} cy={y} r="22" fill={c} stroke={on?'#fff5c5':'#202a27'} strokeWidth={on?3:2}/>{on&&<circle cx={x} cy={y} r="17" fill="#ffffde" opacity=".48"/>}<path d={`M${x-14} ${y-8} Q${x-3} ${y-21} ${x+14} ${y-10}`} fill="none" stroke="#ffffff" strokeWidth="3" opacity=".3" strokeLinecap="round"/></g>;
}
function ButtonSwitch({x,y,c,label}:{x:number;y:number;c:string;label:string}){
 return <g><circle cx={x} cy={y+2} r="29" fill="#abb0b3" stroke="#82888f" strokeWidth="2"/><circle cx={x} cy={y} r="25" fill={c} stroke="#e4e5e6" strokeWidth="3"/><circle cx={x} cy={y} r="23" fill="none" stroke="#323943" strokeWidth="1"/><path d={`M${x-17} ${y-10} Q${x} ${y-24} ${x+16} ${y-11}`} fill="none" stroke="#fff" strokeWidth="2" opacity=".18"/><title>{`Pulsador ${label}`}</title></g>;
}
function ModelContactor({x,y,w=128,h=165,thermal=false,delayed=false,variant=1}:{x:number;y:number;w?:number;h?:number;thermal?:boolean;delayed?:boolean;variant?:number}){
 return <g>
   <rect x={x+4} y={y+6} width={w} height={h} rx="8" fill="#131820" opacity=".18" filter="url(#softDrop)"/>
   <rect x={x} y={y} width={w} height={h} rx="7" fill="url(#contactorDevice)" stroke="#323943" strokeWidth="2"/>
   {Array.from({length:4},(_,i)=><g key={i}>
    <rect x={x+9+i*(w-18)/4} y={y+9} width={(w-28)/4} height="17" rx="2" fill="#e8eaeb" stroke="#7f8589"/>
    <circle cx={x+19+i*(w-18)/4} cy={y+17} r="4" fill="#262b30" />
    <rect x={x+9+i*(w-18)/4} y={y+h-29} width={(w-28)/4} height="19" rx="2" fill="#e7e8e9" stroke="#909497"/>
    <circle cx={x+19+i*(w-18)/4} cy={y+h-20} r="4" fill="#272d33"/>
   </g>)}
   <rect x={x+18} y={y+34} width={w-36} height={h-68} rx="3" fill={delayed?'#222c30':'#e6e5db'} stroke="#a8afa9"/>
   {!delayed&&<>
    <rect x={x+25} y={y+41} width={w-50} height="19" fill="#c8ccbf"/>
    <text x={x+w/2} y={y+54} fill="#333d3d" textAnchor="middle" fontSize="11" fontWeight="750">UT-AX4</text>
    <text x={x+w/2} y={y+65} fill="#4b5148" textAnchor="middle" fontSize="7">2NO 2NC · S-T12</text>
    {['63NO','71NC','81NC','93NO'].map((label,i)=><text key={label} x={x+19+i*(w-18)/4} y={y+31} textAnchor="middle" fontSize="6" fill="#343c36">{label}</text>)}
    {['64NO','72NC','82NC','94NO'].map((label,i)=><text key={label} x={x+19+i*(w-18)/4} y={y+h-34} textAnchor="middle" fontSize="6" fill="#343c36">{label}</text>)}
    {[0,1,2,3].map(i=><g key={i}><circle cx={x+27+i*(w-54)/3} cy={y+h-43} r="7" fill="#21282b" stroke="#a0a496"/><rect x={x+22+i*(w-54)/3} y={y+65} width="10" height="17" rx="1" fill="#7b8278"/></g>)}
    <path d={`M${x+28} ${y+h-65} H${x+w-28}`} stroke="#92988d" strokeWidth="2"/>
   </>}
   {thermal && <g aria-label="Relé térmico de sobrecarga" transform={`translate(${x+7} ${y+h+3})`}>
    <rect width={w-14} height="40" rx="3" fill="#303a3e" stroke="#172125" strokeWidth="2"/>
    <rect x="8" y="5" width={w-30} height="27" rx="2" fill="#deddd2"/>
    <rect x="15" y="8" width="26" height="12" rx="1" fill="#42728a"/>
    <circle cx={w-48} cy="15" r="9" fill="#b4b4a5" stroke="#545d57" strokeWidth="2"/>
    {[23,49,75].map(cx=><circle key={cx} cx={cx} cy="29" r="4" fill="#1e2526"/>)}
    <text x={(w-14)/2} y="38" textAnchor="middle" fontSize="7" fill="#46565c">RELÉ TÉRMICO</text>
   </g>}
   {delayed && <>
    {variant===2&&<g><rect x={x-21} y={y+20} width={w+12} height={h-40} rx="4" fill="#283536" stroke="#626d69" strokeWidth="2"/>
     {[0,1,2].map(i=><rect key={i} x={x-11} y={y+30+i*16} width="40" height="9" rx="1" fill="#4a5957"/>)}</g>}
    <rect x={x+22} y={y+31} width={w-44} height={h-61} rx="3" fill="#151e20" stroke="#757b77" strokeWidth="2"/>
    <g transform={`translate(${x+w/2+(variant===2?17:0)} ${y+h/2})`}>
     {variant===2&&<><rect x="-36" y="-36" width="72" height="72" fill="#d2d8d0" stroke="#68736c" strokeWidth="2"/>{[-30,30].map(cx=>[-30,30].map(cy=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="#414b44"/>))}</>}
     <circle r="35" fill={variant===1?'#c3b69b':'#c0c7c4'} stroke="#565c56" strokeWidth="3"/>
     {variant===1&&Array.from({length:24},(_,i)=><line key={i} y1="-31" y2="-27" transform={`rotate(${i*15})`} stroke="#6b6355" strokeWidth="2"/>)}
     <circle r={variant===1?24:30} fill={variant===1?'#ede5cf':'#e2e6e3'} stroke={variant===1?'#916c49':'#8a9691'} strokeWidth="3"/>
     <text y="3" textAnchor="middle" fontSize="8" fill="#605e52" fontWeight="750">NEUMÁTICO</text>
    </g>
   </>}
 </g>;
}
function Ports({module,selected,onSelect,query,alias}:{module:PanelModule;selected:string|null;onSelect:(id:string)=>void;query:string;alias:string}){
 return <g>
 {module.terminals.map((t:Terminal)=>{
   const key=`${module.id}:${t.id}`;
   const active=selected===key;
   const hit=query.trim() && matchesTerminal(module,t,query,alias);
   const color=COLOR_HEX[t.color];
   const isWhite=t.color==='white';
   return <g key={key} data-terminal-id={key} role="button" aria-pressed={active} tabIndex={0} aria-label={`${module.title} terminal ${t.id}`} className={`terminal ${active?'is-selected':''}`} onClick={e=>{e.stopPropagation();onSelect(key)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(key)}}}>
     {(active||hit)&&<circle cx={t.x} cy={t.y} r="27" fill="none" stroke={active?'#edab3f':'#2486fa'} strokeWidth="5" opacity=".8" className="selected-ring" />}
     <circle cx={t.x} cy={t.y} r="20" fill="transparent" className="terminal-hit" />
     <circle cx={t.x+1} cy={t.y+2} r="17" fill="#4d535d" opacity=".3" />
     <circle cx={t.x} cy={t.y} r="15" fill="url(#socketMetal)" stroke="#7e858c" strokeWidth="1.2"/>
     <circle cx={t.x} cy={t.y} r="12" fill={color} stroke={isWhite?'#b0a99e':'#22262c'} strokeWidth="1"/>
     <circle cx={t.x} cy={t.y} r="6.2" fill="#151a20" stroke="#4f5660" strokeWidth="1.3"/>
     <circle cx={t.x-4} cy={t.y-4} r="2" fill="#fff" opacity={isWhite?.5:.16} />
     <title>{`${module.title} · ${t.id} ${t.note||''}`}</title>
   </g>;
 })}
 </g>;
}
function Brand({x,y}:{x:number;y:number}){return <g transform={`translate(${x} ${y})`}><rect width="10" height="10" fill="#d52a36"/><rect x="3" y="3" width="4" height="7" fill="#fff"/><text x="13" y="10" fontFamily="Arial, sans-serif" fontSize="13" fill="#33343b" fontWeight="800">inacap</text></g>}
/** Printed label strips from the photos. Paint every label last so another socket cannot hide it. */
function TerminalLabels({module}:{module:PanelModule}){
 const included=new Set(module.labelBands?.flat()||[]);
 const bands=[...(module.labelBands||[]),...module.terminals.filter(t=>!included.has(t.id)).map(t=>[t.id])];
 return <g className="terminal-label-layer" pointerEvents="none" aria-hidden="true">
  {bands.map(ids=>{
   const positions=ids.map(id=>module.terminals.find(t=>t.id===id)!).map(t=>({...terminalLabelPosition(t),width:terminalDisplay(t).length*10+10}));
   const x=Math.min(...positions.map(p=>p.x-p.width/2)),y=Math.min(...positions.map(p=>p.y-18));
   const right=Math.max(...positions.map(p=>p.x+p.width/2)),bottom=Math.max(...positions.map(p=>p.y+5));
   return <rect key={ids.join(':')} data-label-band={ids.join(' ')} x={x} y={y} width={right-x} height={bottom-y} rx="1.2" fill="#fffef9" stroke="#d2d1c8" strokeWidth=".7"/>;
  })}
  {module.terminals.map(t=>{
   const {x,y}=terminalLabelPosition(t);
   return <text key={t.id} data-label-for={`${module.id}:${t.id}`} x={x} y={y} fontSize="16" fontFamily="Arial, sans-serif" fontWeight="700" textAnchor="middle" fill="#131a1e" style={textStyle}>{terminalDisplay(t)}</text>;
  })}
 </g>;
}
const ROTOR_BLADES=[0,60,120,180,240,300];
/** Flecha circular que indica el sentido de giro visto desde el eje (horario = 1). */
function turnArrow(cx:number,cy:number,r:number,direction:1|-1){
 const rad=(deg:number)=>deg*Math.PI/180,span=250,start=direction===1?-215:-325,end=start+direction*span;
 const at=(deg:number)=>({x:cx+r*Math.cos(rad(deg)),y:cy+r*Math.sin(rad(deg))});
 const a=at(start),b=at(end),t={x:-direction*Math.sin(rad(end)),y:direction*Math.cos(rad(end))},n={x:-t.y,y:t.x};
 const tip={x:b.x+t.x*11,y:b.y+t.y*11},l={x:b.x+n.x*8,y:b.y+n.y*8},rr={x:b.x-n.x*8,y:b.y-n.y*8};
 return {arc:`M${a.x.toFixed(1)} ${a.y.toFixed(1)} A${r} ${r} 0 1 ${direction===1?1:0} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,head:`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L${l.x.toFixed(1)} ${l.y.toFixed(1)} L${rr.x.toFixed(1)} ${rr.y.toFixed(1)}Z`};
}
/** Motor trifásico visto desde el eje: el rotor gira según el estado calculado por la simulación (sentido y estrella/triángulo). */
function MotorFace({m,simulation}:{m:PanelModule;simulation?:SimulationController}){
 const motor=simulation?.result.motor,running=motor?.status==='running',fault=motor?.status==='fault';
 const cx=240,cy=150,spin=running?`${(.6/(motor!.speed||1)).toFixed(2)}s`:'0s',dir=(motor?.direction??1) as 1|-1,arrow=running?turnArrow(cx,cy,60,dir):null;
 const label=!simulation?.input.enabled?'MOTOR EN REPOSO':running?`GIRANDO · ${motor!.connection==='star'?'ESTRELLA':'TRIÁNGULO'} · ${dir===1?'HORARIO ↻':'ANTIHORARIO ↺'}`:fault?'REVISAR CONEXIÓN':'SIN TENSIÓN';
 return <g data-motor-status={motor?.status||'off'} data-motor-connection={motor?.connection||''} data-motor-direction={running?dir:0}>
  <rect x="150" y="238" width="180" height="14" rx="3" fill="#3a444a"/><rect x="190" y="38" width="100" height="30" rx="5" fill="#2c5f93" stroke="#1d4472" strokeWidth="2"/><path d="M215 38 V30 H265 V38" fill="none" stroke="#1d4472" strokeWidth="4"/>
  <circle cx={cx} cy={cy+3} r="98" fill="#142029" opacity=".2"/>
  <circle cx={cx} cy={cy} r="96" fill="#2f6fb0" stroke="#1d4472" strokeWidth="3"/>
  {Array.from({length:36},(_,i)=><line key={i} x1={cx} x2={cx} y1={cy-92} y2={cy-82} stroke="#1d4472" strokeWidth="4" strokeLinecap="round" transform={`rotate(${i*10} ${cx} ${cy})`}/>)}
  <circle cx={cx} cy={cy} r="76" fill="#e8edee" stroke="#8f9ba1" strokeWidth="2.5"/>
  {/* Rotor en SVG puro: un foreignObject con animación CSS no sigue las transformaciones del tablero en navegadores móviles (se descolocaba y se agrandaba al mover el panel). El grupo gira sobre su propio origen (0,0), que es el eje del motor. */}
  <g transform={`translate(${cx} ${cy})`} pointerEvents="none"><g className="motor-rotor" data-spinning={running} style={{'--spin':spin,animationDirection:dir===-1?'reverse':'normal'} as React.CSSProperties}>
   {running&&ROTOR_BLADES.map(a=><path key={`g${a}`} d="M0 0 C8 -26 34 -52 12 -68 C-4 -52 -12 -26 0 0Z" fill="#58707d" opacity=".22" transform={`rotate(${a-dir*24})`}/>)}
   {ROTOR_BLADES.map(a=><path key={a} d="M0 0 C8 -26 34 -52 12 -68 C-4 -52 -12 -26 0 0Z" fill={a===0?'#d9453b':'#58707d'} stroke={a===0?'#8f2620':'#3e5260'} strokeWidth="1.5" transform={`rotate(${a})`}/>)}
   <circle r="16" fill="#b4bfc5" stroke="#6c7b84" strokeWidth="2"/><circle r="6" fill="#26323a"/><rect x="-2" y="-14" width="4" height="9" fill="#26323a"/>
  </g></g>
  {[26,50,72].map(r=><circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#c4ced3" strokeWidth="1.2" opacity=".7"/>)}
  {arrow&&<g data-turn-arrow={dir} pointerEvents="none"><path d={arrow.arc} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity=".8"/><path d={arrow.arc} fill="none" stroke="#c2352c" strokeWidth="5" strokeLinecap="round"/><path d={arrow.head} fill="#c2352c" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" paintOrder="stroke"/></g>}
  <g transform="translate(78 150)"><circle r="32" fill="#fff" stroke="#2f3a42" strokeWidth="2.5"/><text y="-2" textAnchor="middle" fontSize="26" fontWeight="800" fill="#2f3a42">M</text><text y="20" textAnchor="middle" fontSize="15" fill="#2f3a42">3 ~</text></g>
  <rect x="106" y="256" width="268" height="22" rx="11" fill={running?'#d5efe0':fault?'#fbe1df':'#eef0ee'} stroke={running?'#7fb99a':fault?'#d98a85':'#c9cdcb'}/>
  <text x={cx} y="271" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={running?'#1e6a49':fault?'#9a2f2a':'#5c666d'} style={textStyle}>{label}</text>
  <g transform="translate(470 50)"><rect width="217" height="180" rx="10" fill="#f1f0ec" stroke="#d1d2d1"/><rect x="185" y="20" width="20" height="140" rx="2" fill="#f2d42b"/><text x="192" y="90" transform="rotate(90 192 90)" fill="#2c2d2a" textAnchor="middle" fontSize="11" fontWeight="800">BORNE MOTOR</text></g>
 </g>;
}
function Face({m,aliases,simulation}:{m:PanelModule;aliases:Record<string,string>;simulation?:SimulationController}){
 const isButtons=m.id==='BOTONERAS';
 const isSource=m.id==='FUENTE';
 const isThermal=m.id==='CONTACTOR_TERMICO';
 const isTri=m.id==='CONTACTOR_TRIFASICO'||m.kind==='tri';
 const isTimer=m.category==='temporizadores';
 const isMotor=m.category==='motor';
 return <g>
  <rect x="0" y="0" width={m.w} height={m.h} rx="3" fill="url(#panelFace)" stroke="#969ba1" strokeWidth="2.5" filter="url(#moduleShadow)"/>
  <rect x="9" y="8" width={m.w-18} height={m.h-16} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity=".65"/>
  {[18,m.w-18].map(x=>[19,m.h-18].map(y=><g key={`${x}-${y}`}><circle cx={x} cy={y} r="4.3" fill="#777b81" stroke="#eee" strokeWidth="1.5"/><line x1={x-2} x2={x+2} y1={y} y2={y} stroke="#393e43"/></g>))}
  {<><rect x={m.w/2-Math.min(m.w-48,395)/2} y="7" width={Math.min(m.w-48,395)} height={isTimer?41:25} rx="2" fill="#f8f7f2" opacity=".96" stroke="#c5c9c8" strokeWidth="1"/>
  <text x={m.w/2} y={isTimer?24:25} fontWeight="750" textAnchor="middle" fontSize="16" fill="#33383d">{isSource?'ALIMENTACIÓN · 24 V A.C.':isButtons?'LUCES PILOTO 24 V A.C.':m.title}</text></>}
  {isTimer&&<text x={m.w/2} y="41" fontSize="14" textAnchor="middle" fill="#35393d" fontWeight="720">BOBINA 24 V A.C.</text>}
  {isSource&&<g data-source-powered={!!simulation?.result.powered}>
    <rect x="18" y="39" width="186" height="214" rx="12" fill="#f6f7f6" stroke="#aeb3b7" strokeWidth="2.5" filter="url(#softDrop)"/>
    <rect x="32" y="69" width="157" height="137" rx="5" fill="#272f32" stroke="#13161b" strokeWidth="2"/>
    <g transform="translate(42 90)">
     <rect width="137" height="92" rx="3" fill="#d4d7cf"/>
     <g className="simulation-control" data-force-breaker role="button" tabIndex={0} aria-label="Interruptor FUERZA" aria-pressed={!!simulation?.input.forceBreaker} aria-disabled={!simulation?.enabled} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();simulation?.switchForce()}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)simulation?.switchForce()}}}>
      <rect className="simulation-focus" x="4" y="6" width="78" height="54" fill="transparent" stroke="transparent"/>
      {[0,1,2].map(i=><g key={i} transform={`translate(${6+i*26} 8)`}><rect width="22" height="50" rx="2" fill="#f1f1e9" stroke="#a0a89e"/><g className="breaker-lever" style={{transform:simulation?.input.forceBreaker?'translateY(7px)':'translateY(25px)'}}><rect x="3" width="16" height="16" rx="1" fill={simulation?.input.forceBreaker?'#168765':'#222c2c'}/></g><text x="11" y={simulation?.input.forceBreaker?43:18} textAnchor="middle" fontSize="7" fontWeight="700" fill="#45564e">{simulation?.input.forceBreaker?'ON':'OFF'}</text></g>)}
      <title>Interruptor de fuerza de tres polos · indicador virtual</title>
     </g>
     {[0,1].map(i=><g key={i} transform={`translate(${84+i*26} 8)`} className="simulation-control" data-control-breaker={i} role="button" tabIndex={0} aria-label={`Interruptor CONTROL ${i+1}`} aria-pressed={!!simulation?.input.breakers[i]} aria-disabled={!simulation?.enabled} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();simulation?.switchBreaker(i as 0|1)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)simulation?.switchBreaker(i as 0|1)}}}><rect className="simulation-focus" width="22" height="50" rx="2" fill="#f1f1e9" stroke="#a0a89e"/><g className="breaker-lever" style={{transform:simulation?.input.breakers[i]?'translateY(7px)':'translateY(25px)'}}><rect x="3" width="16" height="16" rx="1" fill={simulation?.input.breakers[i]?'#168765':'#222c2c'}/></g><text x="11" y={simulation?.input.breakers[i]?43:18} textAnchor="middle" fontSize="7" fontWeight="700" fill="#45564e">{simulation?.input.breakers[i]?'ON':'OFF'}</text><title>{simulation?.enabled?'Abrir/cerrar este polo del mando virtual':'Activa Simular 24 V para usar este interruptor'}</title></g>)}
     <rect x="5" y="67" width="73" height="15" fill="#e4d87a"/><rect x="85" y="67" width="46" height="15" fill="#e4d87a"/>
     <text x="41" y="78" textAnchor="middle" fontSize="9" fontWeight="750">FUERZA</text><text x="108" y="78" textAnchor="middle" fontSize="9" fontWeight="750">CONTROL</text>
    </g>
    <rect x="87" y="216" width="41" height="19" rx="3" fill="#d9dcd9" stroke="#80888c"/>
    <rect x="221" y="45" width="108" height="88" rx="8" fill="#b7bec1" stroke="#737c80" strokeWidth="2"/><rect x="229" y="59" width="92" height="49" fill="#d8d9d2" stroke="#83898b"/>
    <text x="275" y="76" fontSize="11" fontWeight="650" textAnchor="middle" fill="#404347">220V</text><text x="275" y="95" fontSize="12" fontWeight="750" textAnchor="middle" fill="#404347">0 — 24V</text><text x="275" y="111" fontSize="12" textAnchor="middle" fill="#404347">3A</text>
    <rect x="347" y="45" width="210" height="85" rx="7" fill="#eeece4" stroke="#abaeae" strokeWidth="3"/>
    {[0,1].map(i=><g key={i} transform={`translate(${379+i*100} 76)`}><rect x="-21" y="-21" width="43" height="55" rx="2" fill="#f9f9f8" stroke="#aeb0b1"/>{[-10,5,20].map(yy=><circle key={yy} cy={yy} r="3.4" fill="#252a30"/>)}</g>)}
    <g className="simulation-control supply-plug" data-supply-plug data-plugged={!!simulation?.input.plugged} role="button" tabIndex={0} aria-label={simulation?.input.plugged?'Desenchufar corriente virtual':'Enchufar corriente virtual'} aria-pressed={!!simulation?.input.plugged} aria-disabled={!simulation?.input.enabled} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();simulation?.plug(!simulation.input.plugged)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)simulation?.plug(!simulation.input.plugged)}}}>
     <rect className="simulation-focus" x="346" y="49" width="64" height="84" rx="5" fill="transparent" stroke="transparent"/>
     <g className="supply-plug-body" style={{transform:simulation?.input.plugged?'translate(379px, 76px)':'translate(400px, 94px)'}}>
      {!simulation?.input.plugged&&<g stroke="#969fa4" strokeWidth="4"><path d="M-12 -8 H-23 M-12 8 H-23"/></g>}
      <rect x="-16" y="-21" width="32" height="42" rx="7" fill="#25353c" stroke="#657a84" strokeWidth="2"/>
      <path d="M-7 -10 V10 M0 -10 V10 M7 -10 V10" stroke="#71828a" strokeWidth="2"/>
      <path d="M16 0 H26 Q35 0 35 9 V25" fill="none" stroke="#27343a" strokeWidth="7" strokeLinecap="round"/>
     </g>
     <rect x="346" y="119" width="99" height="16" rx="3" fill={simulation?.input.plugged?'#d5efe0':'#f4f5f2'}/><text x="395" y="130" fontSize="10" fontWeight="700" textAnchor="middle" fill="#385748">{simulation?.input.plugged?'ENCHUFADO':'ENCHUFAR'}</text>
     <title>Conectar/desconectar la alimentación virtual del tablero</title>
    </g>
    {[237,297,357,493].map((x,i)=><g key={i}><circle cx={x} cy="176" r="24" fill="#393e3d"/>{i===3&&simulation?.result.powered&&<circle data-source-lamp cx={x} cy="174" r="30" fill="#f4c637" opacity=".6" filter="url(#pilotGlow)"/>}<circle cx={x} cy="174" r="20" fill={i===3&&simulation?.result.powered?'#ffe47a':i===3?'#d19b27':simulation?.enabled&&simulation.input.plugged&&simulation.input.forceBreaker?'#f75462':'#a5192c'} stroke="#4b2522" strokeWidth="3"/><path d={`M${x-12} 164 Q${x} 158 ${x+12} 164`} fill="none" stroke="#fff" opacity=".25" strokeWidth="2"/></g>)}
    <circle cx="430" cy="176" r="15" fill="#1a2427" stroke="#4d5652" strokeWidth="3"/>
    <path d="M422 169 L438 180" stroke="#899591" strokeWidth="2"/>
    <Tag x={430} y={206} small>FUS 3A</Tag><Tag x={495} y={145} small>24 V A.C.</Tag>
  </g>}
  {isButtons&&<g>
    {[78,228,378,530].map((x,i)=><Pilot key={x} x={x} y={63} id={`P${i+1}`} on={simulation?.result.pilots[i]} c={['#11794c','#971c28','#ddab31','#11794c'][i]}/>)}
    <Tag x={310} y={122}>BOTONERAS</Tag>
    {[115,303,488].map((x,i)=>{const id=`S${i+1}`,pressed=!!simulation?.input.pressed.includes(id);return <g key={id} className="simulation-control" data-pushbutton={id} data-pressed={pressed} role="button" tabIndex={0} aria-label={`Pulsador ${['verde izquierdo','rojo central','verde derecho'][i]}`} aria-pressed={pressed} aria-disabled={!simulation?.enabled} onPointerDown={e=>{e.stopPropagation();if(e.button!==0||!simulation?.enabled)return;simulation.press(id,true);e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={e=>{e.stopPropagation();simulation?.press(id,false)}} onPointerCancel={()=>simulation?.press(id,false)} onLostPointerCapture={()=>simulation?.press(id,false)} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();simulation?.press(id,true)}}} onKeyUp={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();simulation?.press(id,false)}}}><circle className="simulation-focus" cx={x} cy="160" r="32" fill="transparent" stroke="transparent"/><g transform={pressed?'translate(0 2)':undefined}><ButtonSwitch x={x} y={160} c={i===1?'#922831':'#126d53'} label={['verde izquierdo','rojo central','verde derecho'][i]}/></g><title>{simulation?.enabled?'Mantén pulsado para actuar el contacto virtual':'Activa Simular 24 V para probar este pulsador'}</title></g>})}
  </g>}
  {(isThermal||isTri)&&<g>
    <g data-contact-legend aria-label="Contactos auxiliares: gris normalmente cerrado, azul normalmente abierto"><circle cx="258" cy="48" r="5" fill="#6a747c"/><text x="268" y="52" fontSize="10" fill="#495c67">NC · gris</text><circle cx="329" cy="48" r="5" fill="#17509a"/><text x="339" y="52" fontSize="10" fill="#495c67">NA · azul</text></g>
    {isThermal&&<><rect x="155" y="244" width="119" height="48" rx="3" fill="#efebe0" opacity=".65"/><rect x="429" y="262" width="111" height="48" rx="3" fill="#efebe0" opacity=".65"/></>}
    {isThermal?<g data-contactor-assembly="KM1" aria-label="Conjunto de contactor y relé térmico KM1"><ModelContactor x={288} y={110} w={125} h={138} thermal/></g>:<ModelContactor x={230} y={124} w={142} h={146}/>}
    <rect x={isThermal?505:500} y="37" width="69" height="29" rx="2" fill="#e4e1d9" stroke="#b7b7af"/>
    <text x={isThermal?540:534} y="57" textAnchor="middle" fontSize="13" fontWeight="700" fill="#49515a">{aliases[m.id]||m.defaultAlias||'KM ?'}</text>
    <text x={isThermal?540:534} y="80" textAnchor="middle" fontSize="10" fill="#626b70">{!!CONFIRMED_MODULE_ALIASES[m.id]&&aliases[m.id]===CONFIRMED_MODULE_ALIASES[m.id]?'confirmado':'por confirmar'}</text>
  </g>}
  {simulation?.input.enabled&&(isThermal||isTri)&&<g data-sim-relay={m.id} data-active={!!simulation.result.relays[m.id]}><rect x={isThermal?505:500} y="86" width="70" height="19" rx="3" fill={simulation.result.relays[m.id]?'#ccf0da':'#e5e9e7'}/><text x={isThermal?540:535} y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill="#355e49">{simulation.result.relays[m.id]?'ACTIVO':'REPOSO'}</text></g>}
  {isTimer&&<g><ModelContactor x={188} y={100} w={128} h={105} delayed variant={m.id==='TEMPORIZADOR_1'||m.kind==='timer'?1:2}/><TimerStatus id={m.id} simulation={simulation}/></g>}
  {isMotor&&<MotorFace m={m} simulation={simulation}/>}
  {<Brand x={isSource?65:isButtons?174:m.w-121} y={isSource||isButtons?m.h-11:m.h-15}/>}
 </g>;
}
/** Estado del temporizador de retardo a la conexión: barra que se llena durante el retardo (animación CSS, sin repintar el tablero). */
function TimerStatus({id,simulation}:{id:string;simulation?:SimulationController}){
 const on=!!simulation?.input.enabled,coil=!!simulation?.result.relays[id],done=coil&&!!simulation?.timed.includes(id);
 if(!on)return <text x="397" y="64" textAnchor="middle" fontSize="10" fill="#606a76">Retardo a la conexión</text>;
 const seconds=simulation!.timerSeconds,label=done?'TEMPORIZADO':coil?`CONTANDO · ${seconds} s`:'EN REPOSO';
 return <g data-sim-timer={id} data-timer-state={done?'done':coil?'timing':'idle'} data-timer-seconds={seconds}>
  <clipPath id={`timer-clip-${id}`}><rect x="335" y="68" width="124" height="22" rx="4"/></clipPath>
  <rect x="335" y="68" width="124" height="22" rx="4" fill={done?'#ccf0da':'#e5e9e7'} stroke={done?'#7fb99a':'#c4cac8'}/>
  {coil&&!done&&<g clipPath={`url(#timer-clip-${id})`}><rect className="timer-fill" x="335" y="68" width="124" height="22" fill="#f3dc8a" style={{'--delay':`${seconds}s`} as React.CSSProperties}/></g>}
  <text x="397" y="83" textAnchor="middle" fontSize="11" fontWeight="700" fill={done?'#1e6a49':'#4c585f'} style={textStyle}>{label}</text>
 </g>;
}
const MemoFace=React.memo(Face),MemoPorts=React.memo(Ports),MemoLabels=React.memo(TerminalLabels),MemoWireLayer=React.memo(WireLayer);
export {FULL} from '../layout/boardViewport';
export function Board({modulesLocked=true,selected,onSelect,group,query,view,setView,aliases,wires=[],selectedWire=null,onSelectWire=()=>{},highlightedTerminals=[],highlightedModules=[],pendingTerminal=null,hitConnectors=true,ghost,ghosts=ghost?[ghost]:[],routeWireIds=[],errorWires=[],simulation,liveWireIds=[],onRemoveModule,overlay}:Props){
 const [pointer,setPointer]=useState<{x:number;y:number}|null>(null);
 const anchor=useRef<{x:number;y:number;view:View;scale:number}|null>(null);
 const svg=useRef<SVGSVGElement>(null);
 const nav=useSvgNavigation(svg,view,setView);
 /* El hook de navegación es quien escribe el viewBox después del montaje; así los cambios de encuadre se animan. */
 const firstView=useRef(`${view.x} ${view.y} ${view.w} ${view.h}`);
 const modules=useModules(),layout=useLayout();
 /* Acoplamiento: el módulo se agarra desde cualquier parte libre de su cara (o desde el asa), sigue al puntero y,
    al soltarlo, se acopla al hueco indicado por la vista previa (junto a otro módulo, encima o debajo, o en un riel). */
 type DragState={id:string;pointerId:number;dx:number;dy:number;startX:number;startY:number;moved:boolean;origin:Pos;moves:Record<string,Pos>;free:Pos};
 const dragging=useRef<DragState|null>(null),settling=useRef(0);
 const [dragId,setDragId]=useState<string|null>(null),[preview,setPreview]=useState<{pos:Pos;moves:Record<string,Pos>;kind:'swap'|'dock'|'free';guides:{x?:number;y?:number};target:string|null}|null>(null);
 const toBoard=(e:{clientX:number;clientY:number})=>{const matrix=svg.current?.getScreenCTM();return matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()):null};
 const startDrag=(e:React.PointerEvent<SVGGElement>,mod:PanelModule)=>{
  const target=e.target as Element;
  if(modulesLocked||e.button!==0||target.closest('.terminal,.simulation-control,.module-remove')||(target.closest('.board-tool-pan')&&!target.closest('.module-grip')))return;
  e.stopPropagation();const p=toBoard(e);if(!p)return;
  cancelAnimationFrame(settling.current);
  const pos=modulePos(mod,getLayout());dragging.current={id:mod.id,pointerId:e.pointerId,dx:p.x-pos.x,dy:p.y-pos.y,startX:e.clientX,startY:e.clientY,moved:false,origin:pos,moves:{},free:pos};
 };
 /* Hasta mover unos píxeles es un clic normal; después el svg captura el puntero hasta soltar. */
 const moveDrag=(e:React.PointerEvent<SVGSVGElement>)=>{
  const d=dragging.current;if(!d||e.pointerId!==d.pointerId)return;
  if(!(e.buttons&1)){if(d.moved)endDrag();else dragging.current=null;return}
  if(!d.moved){
   if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<5)return;
   d.moved=true;setDragId(d.id);try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
  }
  const p=toBoard(e);if(!p)return;
  const desired={x:p.x-d.dx,y:p.y-d.dy},r=dropModule(getLayout(),d.id,desired,d.origin);
  d.free=clampFree(desired);d.moves=r?.moves??{};
  setModulePos(d.id,d.free);setPreview(r?{pos:r.pos,moves:r.moves,kind:r.kind,guides:r.guides,target:r.target}:null);
 };
 const endDrag=()=>{
  const d=dragging.current;if(!d)return;dragging.current=null;
  if(!d.moved)return;
  /* Cada módulo que cambia de sitio (el arrastrado y, si se intercambian, el otro) se asienta con un breve deslizamiento. */
  const moves=Object.keys(d.moves).length?d.moves:{[d.id]:d.free},start=Object.fromEntries(Object.keys(moves).map(id=>[id,id===d.id?d.free:modulePos({id,x:0,y:0},getLayout())]));
  const done=()=>{setDragId(null);setPreview(null);for(const [id,to] of Object.entries(moves))setModulePos(id,to,true)};
  const still=Object.entries(moves).every(([id,to])=>Math.abs(to.x-start[id].x)<1&&Math.abs(to.y-start[id].y)<1);
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||still){done();return}
  const t0=performance.now(),step=(now:number)=>{
   const k=Math.min(1,(now-t0)/190),ease=1-Math.pow(1-k,3);
   for(const [id,to] of Object.entries(moves))setModulePos(id,{x:start[id].x+(to.x-start[id].x)*ease,y:start[id].y+(to.y-start[id].y)*ease});
   if(k<1)settling.current=requestAnimationFrame(step);else done();
  };
  setPreview(null);settling.current=requestAnimationFrame(step);
 };
 const keyMove=(e:React.KeyboardEvent<SVGGElement>,mod:PanelModule)=>{
  if(modulesLocked)return;
  const step=48,delta:Record<string,[number,number]>={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
  if(!delta[e.key])return;e.preventDefault();e.stopPropagation();
  const pos=modulePos(mod,getLayout()),r=snapModule(getLayout(),mod.id,{x:pos.x+delta[e.key][0],y:pos.y+delta[e.key][1]});
  if(r)setModulePos(mod.id,r.pos,true);
 };
 /* El marco y los rieles se calculan con el módulo ya en su hueco, para que no salten mientras se arrastra. */
 const frameLayout=dragId&&preview?{...layout,...preview.moves}:layout,frame=boardFrame(frameLayout);
 const drawOrder=dragId?[...modules.filter(m=>m.id!==dragId),...modules.filter(m=>m.id===dragId)]:modules;
 const dragModule=dragId?modules.find(m=>m.id===dragId):undefined,targetModule=preview?.target?modules.find(m=>m.id===preview.target):undefined;
 const pointerFrame=useRef(0),pointerNext=useRef<{x:number;y:number}|null>(null);
 const onDown=(e:React.PointerEvent<SVGSVGElement>)=>{
  if((e.target as Element).closest('.terminal,.interactive-wire,.simulation-control,.module-remove,[data-nopan]'))return;
  if(!modulesLocked&&(e.target as Element).closest('.module-grip'))return;
  if(e.button!==0)return;
  const matrix=svg.current?.getScreenCTM();
  e.currentTarget.dataset.dragging='true';anchor.current={x:e.clientX,y:e.clientY,view:currentSvgView(e.currentTarget,view),scale:matrix?.a||1};
  try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
 };
 const onMove=(e:React.PointerEvent<SVGSVGElement>)=>{
  if(dragging.current){moveDrag(e);return}
  if(pendingTerminal&&svg.current){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.current.getScreenCTM()!.inverse());pointerNext.current={x:p.x,y:p.y};if(!pointerFrame.current)pointerFrame.current=requestAnimationFrame(()=>{pointerFrame.current=0;setPointer(pointerNext.current)})}
  if(!anchor.current||!svg.current)return;
  const scale=anchor.current.scale;
  nav.show({...anchor.current.view,x:anchor.current.view.x-(e.clientX-anchor.current.x)/scale,y:anchor.current.view.y-(e.clientY-anchor.current.y)/scale});
 };
 const onUp=()=>{if(dragging.current){endDrag();return}if(anchor.current)nav.commit();anchor.current=null;if(svg.current)delete svg.current.dataset.dragging};
 return <svg ref={svg} className="board-svg" data-modules-locked={modulesLocked} viewBox={firstView.current} role="group" tabIndex={0} aria-label="Panel didáctico interactivo; flechas para desplazar, Inicio para ajustar" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={()=>setPointer(null)} onKeyDown={e=>{
  const step=view.w*.06;
  if(e.key==='Home'){e.preventDefault();setView(fitView(getLayout()));return;}
  const delta:Record<string,[number,number]>={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
  if(delta[e.key]){e.preventDefault();const [dx,dy]=delta[e.key];setView({...view,x:view.x+dx,y:view.y+dy});}
 }}>

 <defs>
 <filter id="pilotGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
 <linearGradient id="panelFace" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fff"/><stop offset=".63" stopColor="#f3f4f3"/><stop offset="1" stopColor="#e7e9e7"/></linearGradient>
 <linearGradient id="railMetal" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#e0e4e5"/><stop offset=".18" stopColor="#aeb5bd"/><stop offset=".5" stopColor="#78828c"/><stop offset=".78" stopColor="#afb6bd"/><stop offset="1" stopColor="#626c76"/></linearGradient>
 <linearGradient id="socketMetal" x1="0" x2="1"><stop stopColor="#c2c8cd"/><stop offset=".48" stopColor="#f3f4f4"/><stop offset="1" stopColor="#68717c"/></linearGradient>
 <linearGradient id="contactorDevice" x1="0" x2="1"><stop stopColor="#343a40"/><stop offset=".22" stopColor="#e8ebeb"/><stop offset=".78" stopColor="#f5f4ed"/><stop offset="1" stopColor="#292f35"/></linearGradient>
 <filter id="moduleShadow" x="-12%" width="128%" y="-12%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#263746" floodOpacity=".21"/></filter>
 <filter id="softDrop" x="-25%" width="160%" y="-25%" height="160%"><feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#17212b" floodOpacity=".23"/></filter>
 <pattern id="vent" width="15" height="85" patternUnits="userSpaceOnUse"><rect width="3" height="62" x="4" y="8" rx="1" fill="#aeb7bc"/></pattern>
 </defs>

 <rect x="29" y="28" width={frame.w} height={frame.h} rx="10" fill="#e8ebed" stroke="#9fa8b1" strokeWidth="4"/>
 {[...frame.rows.map(r=>r.rail),frame.railBottom].map((y,i)=><g key={y} data-rail={i}><rect x="28" y={y} width={frame.w+1} height="27" rx="5" fill="url(#railMetal)"/><line x1="35" y1={y+4} x2={frame.w-7} y2={y+4} stroke="#f5f7f8" opacity=".7" strokeWidth="1.3"/></g>)}
 <rect x="28" y="27" width={frame.w+2} height={frame.h+2} rx="12" fill="none" stroke="#818b94" strokeWidth="5" opacity=".43" />
 {dragModule&&preview&&<g data-drop-preview pointerEvents="none">{targetModule&&<rect data-drop-target={targetModule.id} x={modulePos(targetModule,layout).x-6} y={modulePos(targetModule,layout).y-6} width={targetModule.w+12} height={targetModule.h+12} rx="8" fill="#1c8fb512" stroke="#1c8fb5" strokeWidth="3"/>}<rect x={preview.pos.x} y={preview.pos.y} width={dragModule.w} height={dragModule.h} rx="5" fill="#1c8fb51f" stroke="#1c8fb5" strokeWidth="3.5" strokeDasharray="14 9"/>{preview.kind==='swap'&&targetModule&&preview.moves[targetModule.id]&&<g data-swap-preview={targetModule.id}><rect x={preview.moves[targetModule.id].x} y={preview.moves[targetModule.id].y} width={targetModule.w} height={targetModule.h} rx="5" fill="#e0953a1f" stroke="#d4891f" strokeWidth="3.5" strokeDasharray="14 9"/><text x={preview.moves[targetModule.id].x+targetModule.w/2} y={preview.moves[targetModule.id].y+targetModule.h/2} textAnchor="middle" fontSize="34" fontWeight="800" fill="#b8700f" style={textStyle}>⇄ INTERCAMBIO</text></g>}</g>}
 {dragId&&preview?.guides.x!=null&&<line data-snap-guide="x" x1={preview!.guides.x} x2={preview!.guides.x} y1="28" y2={frame.bottom} stroke="#1c8fb5" strokeWidth="2.5" strokeDasharray="10 8" opacity=".8" pointerEvents="none"/>}
 {dragId&&preview?.guides.y!=null&&<line data-snap-guide="y" x1="29" x2={frame.right} y1={preview!.guides.y} y2={preview!.guides.y} stroke="#1c8fb5" strokeWidth="2.5" strokeDasharray="10 8" opacity=".8" pointerEvents="none"/>}
 {drawOrder.map(m=>{
   const faded=group!=='todos'&&m.category!==group;
   const byQuery=query.trim()&&m.terminals.some(t=>matchesTerminal(m,t,query,aliases[m.id]));
   const pos=modulePos(m,layout);
   return <g key={m.id} data-module-id={m.id} data-extra={m.extra?'true':undefined} transform={`translate(${pos.x} ${pos.y})`} opacity={faded?.2:1} className={`board-module ${dragId===m.id?'is-dragging':''}`} onPointerDown={e=>startDrag(e,m)}>
     <MemoFace m={m} aliases={aliases} simulation={simulation}/>
     <g className="module-grip" role="button" aria-disabled={modulesLocked} tabIndex={modulesLocked?-1:0} aria-label={`Mover ${m.title}${aliases[m.id]||m.defaultAlias?' '+(aliases[m.id]||m.defaultAlias):''}. Arrastra desde cualquier parte libre o usa las flechas; se acopla a los módulos cercanos`} onKeyDown={e=>keyMove(e,m)}>
      <rect x="0" y="0" width={m.w} height="40" fill="transparent"/>
      <g className="grip-dots" transform="translate(30 11)">{[0,1].flatMap(c=>[0,1,2].map(r=><circle key={`${c}${r}`} cx={c*8} cy={r*8} r="2.4"/>))}</g>
      <title>Arrastra para mover el módulo</title>
     </g>
     {m.extra&&onRemoveModule&&<g className="module-remove" role="button" tabIndex={0} aria-label={`Quitar el panel ${aliases[m.id]||m.defaultAlias||m.title}`} onClick={e=>{e.stopPropagation();onRemoveModule(m.id)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onRemoveModule(m.id)}}}><circle cx={m.w-24} cy="22" r="15" className="module-remove-bg"/><path d={`M${m.w-30} 16 L${m.w-18} 28 M${m.w-18} 16 L${m.w-30} 28`} className="module-remove-x"/><title>Quitar este panel del banco</title></g>}
     {highlightedModules.includes(m.id)&&<rect x="-5" y="-5" width={m.w+10} height={m.h+10} rx="6" fill="none" stroke="#187b6c" strokeWidth="5" pointerEvents="none"/>}
     {byQuery&&<rect x="-4" y="-4" width={m.w+8} height={m.h+8} rx="7" fill="none" stroke="#d6a158" strokeWidth="4" pointerEvents="none"/>}
     <MemoPorts module={m} selected={selected} onSelect={onSelect} query={query} alias={aliases[m.id]||''}/>
   </g>;
 })}
  {pendingTerminal&&pointer&&terminalPoint(pendingTerminal)&&<path className="pending-cable-preview" d={cablePath(terminalPoint(pendingTerminal)!,pointer,60)} fill="none" stroke="#258cb2" strokeWidth="5" strokeDasharray="10 7" opacity=".7" pointerEvents="none"/>}
 {ghosts.map((g,i)=>terminalPoint(g.from)&&terminalPoint(g.to)&&<g key={`${g.from}-${g.to}`} className="ghost-cable" data-ghost-from={g.from} data-ghost-to={g.to} opacity=".48" pointerEvents="none" aria-hidden="true"><BananaCableVisual id={`lesson-ghost-${i}`} from={terminalPoint(g.from)!} to={terminalPoint(g.to)!} sag={80+(i%4)*24} color="#168cac"/></g>)}
 <MemoWireLayer layoutKey={layout} liveWireIds={liveWireIds} routeWireIds={routeWireIds} hitConnectors={hitConnectors} wires={wires} selected={selectedWire} onSelect={onSelectWire} errorWires={errorWires}/>
 {drawOrder.map(m=><g key={m.id} data-module-labels={m.id} transform={`translate(${modulePos(m,layout).x} ${modulePos(m,layout).y})`} opacity={group!=='todos'&&m.category!==group ? .2 : 1}>
  {m.terminals.filter(t=>highlightedTerminals.includes(`${m.id}:${t.id}`)||pendingTerminal===`${m.id}:${t.id}`).map(t=><circle key={t.id} data-highlight-terminal={`${m.id}:${t.id}`} cx={t.x} cy={t.y} r="23" fill="none" stroke={pendingTerminal===`${m.id}:${t.id}`?'#edab3f':'#168a74'} strokeWidth="4" pointerEvents="none"/>)}
  <MemoLabels module={m}/>
 </g>)}
 {overlay}
 <text x="70" y={frame.bottom+24} fill="#717a85" fontSize="15" fontWeight="650">{simulation?.input.enabled?'PANEL DIDÁCTICO · SIMULACIÓN VIRTUAL DE MANDO 24 V':'PANEL DIDÁCTICO · REPRESENTACIÓN DIGITAL DE REFERENCIA · SIN ENERGÍA'}</text>
 </svg>;
}
