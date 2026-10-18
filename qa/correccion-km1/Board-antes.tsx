import React, {useRef,useState} from 'react';
import { MODULES, COLOR_HEX, matchesTerminal, terminalDisplay, terminalLabelPosition, type PanelModule, type Terminal } from '../data/panel';
import type {BananaCable} from '../data/practice';
import {terminalPoint,cablePath} from '../data/wiring';
import {useSvgNavigation,currentSvgView} from '../hooks/useSvgNavigation';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {WireLayer} from './WireLayer';
import {BananaCableVisual} from './BananaCable';
import type {SimulationController} from '../hooks/useSimulation';

type View = {x:number;y:number;w:number;h:number};
type Props={selected:string|null;onSelect:(id:string)=>void;group:string;query:string;view:View;setView:(v:View)=>void;aliases:Record<string,string>;wires?:BananaCable[];selectedWire?:string|null;onSelectWire?:(id:string)=>void;highlightedTerminals?:string[];highlightedModules?:string[];pendingTerminal?:string|null;hitConnectors?:boolean;ghost?:{from:string;to:string};ghosts?:{from:string;to:string}[];routeWireIds?:string[];errorWires?:string[];simulation?:SimulationController;liveWireIds?:string[];};
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
    <text x={x+w/2} y={y+54} fill="#333d3d" textAnchor="middle" fontSize="11" fontWeight="750">CONTACTOR</text>
    {[0,1,2,3].map(i=><g key={i}><circle cx={x+27+i*(w-54)/3} cy={y+h-43} r="7" fill="#21282b" stroke="#a0a496"/><rect x={x+22+i*(w-54)/3} y={y+65} width="10" height="17" rx="1" fill="#7b8278"/></g>)}
    <path d={`M${x+28} ${y+h-65} H${x+w-28}`} stroke="#92988d" strokeWidth="2"/>
   </>}
   {thermal && <g aria-label="Relé térmico de sobrecarga" transform={`translate(${x+7} ${y+h+3})`}>
    <rect width={w-14} height="40" rx="3" fill="#303a3e" stroke="#172125" strokeWidth="2"/>
    <rect x="8" y="5" width={w-30} height="27" rx="2" fill="#deddd2"/>
    <rect x="15" y="8" width="26" height="12" rx="1" fill="#42728a"/>
    <circle cx={w-48} cy="15" r="9" fill="#b4b4a5" stroke="#545d57" strokeWidth="2"/>
    {[23,49,75].map(cx=><circle key={cx} cx={cx} cy="29" r="4" fill="#1e2526"/>)}
    <text x={(w-14)/2} y="52" textAnchor="middle" fontSize="10" fill="#46565c">RELÉ TÉRMICO</text>
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
function Face({m,aliases,simulation}:{m:PanelModule;aliases:Record<string,string>;simulation?:SimulationController}){
 const isButtons=m.id==='BOTONERAS';
 const isSource=m.id==='FUENTE';
 const isThermal=m.id==='CONTACTOR_TERMICO';
 const isTri=m.id==='CONTACTOR_TRIFASICO';
 const isTimer=m.category==='temporizadores';
 const isMotor=m.category==='motor';
 return <g>
  <rect x="0" y="0" width={m.w} height={m.h} rx="3" fill="url(#panelFace)" stroke="#969ba1" strokeWidth="2.5" filter="url(#moduleShadow)"/>
  <rect x="9" y="8" width={m.w-18} height={m.h-16} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity=".65"/>
  {[18,m.w-18].map(x=>[19,m.h-18].map(y=><g key={`${x}-${y}`}><circle cx={x} cy={y} r="4.3" fill="#777b81" stroke="#eee" strokeWidth="1.5"/><line x1={x-2} x2={x+2} y1={y} y2={y} stroke="#393e43"/></g>))}
  {!isMotor&&<><rect x={m.w/2-Math.min(m.w-48,395)/2} y="7" width={Math.min(m.w-48,395)} height={isTimer?41:25} rx="2" fill="#f8f7f2" opacity=".96" stroke="#c5c9c8" strokeWidth="1"/>
  <text x={m.w/2} y={isTimer?24:25} fontWeight="750" textAnchor="middle" fontSize="16" fill="#33383d">{isSource?'ALIMENTACIÓN · 24 V A.C.':isButtons?'LUCES PILOTO 24 V A.C.':m.title}</text></>}
  {isTimer&&<text x={m.w/2} y="41" fontSize="14" textAnchor="middle" fill="#35393d" fontWeight="720">BOBINA 24 V A.C.</text>}
  {isSource&&<g data-source-powered={!!simulation?.result.powered}>
    <rect x="18" y="39" width="186" height="214" rx="12" fill="#f6f7f6" stroke="#aeb3b7" strokeWidth="2.5" filter="url(#softDrop)"/>
    <rect x="32" y="69" width="157" height="137" rx="5" fill="#272f32" stroke="#13161b" strokeWidth="2"/>
    <g transform="translate(42 90)">
     <rect width="137" height="92" rx="3" fill="#d4d7cf"/>
     {[0,1,2,3,4].map(i=>i<3?<g key={i} transform={`translate(${6+i*26} 8)`}><rect width="22" height="50" rx="2" fill="#f1f1e9" stroke="#a0a89e"/><rect x="3" y="18" width="16" height="18" rx="1" fill="#222c2c"/><line x1="4" x2="18" y1="21" y2="21" stroke="#69746e"/></g>:<g key={i} transform={`translate(${6+i*26} 8)`} className="simulation-control" data-control-breaker={i-3} role="button" tabIndex={0} aria-label={`Interruptor CONTROL ${i-2}`} aria-pressed={!!simulation?.input.breakers[i-3]} aria-disabled={!simulation?.enabled} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();simulation?.switchBreaker((i-3) as 0|1)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)simulation?.switchBreaker((i-3) as 0|1)}}}><rect className="simulation-focus" width="22" height="50" rx="2" fill="#f1f1e9" stroke="#a0a89e"/><rect x="3" y={simulation?.input.breakers[i-3]?7:25} width="16" height="16" rx="1" fill={simulation?.input.breakers[i-3]?'#168765':'#222c2c'}/><text x="11" y={simulation?.input.breakers[i-3]?43:18} textAnchor="middle" fontSize="7" fontWeight="700" fill="#45564e">{simulation?.input.breakers[i-3]?'ON':'OFF'}</text><title>{simulation?.enabled?'Abrir/cerrar este polo del mando virtual':'Activa Simular 24 V para usar este interruptor'}</title></g>)}
     <rect x="5" y="67" width="73" height="15" fill="#e4d87a"/><rect x="85" y="67" width="46" height="15" fill="#e4d87a"/>
     <text x="41" y="78" textAnchor="middle" fontSize="9" fontWeight="750">FUERZA</text><text x="108" y="78" textAnchor="middle" fontSize="9" fontWeight="750">CONTROL</text>
    </g>
    <rect x="87" y="216" width="41" height="19" rx="3" fill="#d9dcd9" stroke="#80888c"/>
    <rect x="221" y="45" width="108" height="88" rx="8" fill="#b7bec1" stroke="#737c80" strokeWidth="2"/><rect x="229" y="59" width="92" height="49" fill="#d8d9d2" stroke="#83898b"/>
    <text x="275" y="76" fontSize="11" fontWeight="650" textAnchor="middle" fill="#404347">220V</text><text x="275" y="95" fontSize="12" fontWeight="750" textAnchor="middle" fill="#404347">0 — 24V</text><text x="275" y="111" fontSize="12" textAnchor="middle" fill="#404347">3A</text>
    <rect x="347" y="45" width="210" height="85" rx="7" fill="#eeece4" stroke="#abaeae" strokeWidth="3"/>
    {[0,1].map(i=><g key={i} transform={`translate(${379+i*100} 76)`}><rect x="-21" y="-21" width="43" height="55" rx="2" fill="#f9f9f8" stroke="#aeb0b1"/>{[-10,5,20].map(yy=><circle key={yy} cy={yy} r="3.4" fill="#252a30"/>)}</g>)}
    {[237,297,357,493].map((x,i)=><g key={i}><circle cx={x} cy="176" r="24" fill="#393e3d"/>{i===3&&simulation?.result.powered&&<circle data-source-lamp cx={x} cy="174" r="30" fill="#f4c637" opacity=".6" filter="url(#pilotGlow)"/>}<circle cx={x} cy="174" r="20" fill={i===3&&simulation?.result.powered?'#ffe47a':i===3?'#d19b27':'#a5192c'} stroke="#4b2522" strokeWidth="3"/><path d={`M${x-12} 164 Q${x} 158 ${x+12} 164`} fill="none" stroke="#fff" opacity=".25" strokeWidth="2"/></g>)}
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
    {isThermal&&<><rect x="155" y="244" width="119" height="48" rx="3" fill="#efebe0" opacity=".65"/><rect x="429" y="262" width="111" height="48" rx="3" fill="#efebe0" opacity=".65"/></>}
    {isThermal?<ModelContactor x={23} y={90} w={125} h={138} thermal/>:<ModelContactor x={230} y={124} w={142} h={146}/>}
    <rect x={isThermal?505:500} y="37" width="69" height="29" rx="2" fill="#e4e1d9" stroke="#b7b7af"/>
    <text x={isThermal?540:534} y="57" textAnchor="middle" fontSize="13" fontWeight="700" fill="#49515a">{aliases[m.id]||'KM ?'}</text>
    <text x={isThermal?540:534} y="80" textAnchor="middle" fontSize="10" fill="#626b70">{aliases[m.id]===CONFIRMED_MODULE_ALIASES[m.id]?'confirmado':'por confirmar'}</text>
  </g>}
  {simulation?.input.enabled&&(isThermal||isTri)&&<g data-sim-relay={m.id} data-active={simulation.result.relays[isThermal?'CONTACTOR_TERMICO':'CONTACTOR_TRIFASICO']}><rect x={isThermal?505:500} y="86" width="70" height="19" rx="3" fill={simulation.result.relays[isThermal?'CONTACTOR_TERMICO':'CONTACTOR_TRIFASICO']?'#ccf0da':'#e5e9e7'}/><text x={isThermal?540:535} y="99" textAnchor="middle" fontSize="10" fontWeight="700" fill="#355e49">{simulation.result.relays[isThermal?'CONTACTOR_TERMICO':'CONTACTOR_TRIFASICO']?'ACTIVO':'REPOSO'}</text></g>}
  {isTimer&&<g><ModelContactor x={188} y={100} w={128} h={105} delayed variant={m.id==='TEMPORIZADOR_1'?1:2}/><text x="397" y="64" textAnchor="middle" fontSize="10" fill="#606a76">Retardo por confirmar</text></g>}
  {isMotor&&<g><rect x="8" y="9" width={m.w-16} height={m.h-18} rx="10" fill="#f1f0ec" stroke="#d1d2d1"/><rect x="185" y="20" width="20" height="140" rx="2" fill="#f2d42b"/><text x="192" y="90" transform="rotate(90 192 90)" fill="#2c2d2a" textAnchor="middle" fontSize="11" fontWeight="800">BORNE MOTOR</text></g>}
  {!isMotor&&<Brand x={isSource?65:isButtons?174:m.w-121} y={isSource||isButtons?m.h-11:m.h-15}/>}
 </g>;
}
const MemoFace=React.memo(Face),MemoPorts=React.memo(Ports),MemoLabels=React.memo(TerminalLabels),MemoWireLayer=React.memo(WireLayer);
export const FULL:View={x:-140,y:-110,w:1680,h:1460};
export function Board({selected,onSelect,group,query,view,setView,aliases,wires=[],selectedWire=null,onSelectWire=()=>{},highlightedTerminals=[],highlightedModules=[],pendingTerminal=null,hitConnectors=true,ghost,ghosts=ghost?[ghost]:[],routeWireIds=[],errorWires=[],simulation,liveWireIds=[]}:Props){
 const [pointer,setPointer]=useState<{x:number;y:number}|null>(null);
 const anchor=useRef<{x:number;y:number;view:View;scale:number}|null>(null);
 const svg=useRef<SVGSVGElement>(null);
 useSvgNavigation(svg,view,setView);
 const onDown=(e:React.PointerEvent<SVGSVGElement>)=>{
  if((e.target as Element).closest('.terminal,.interactive-wire,.simulation-control'))return;
  if(e.button!==0)return;
  const matrix=svg.current?.getScreenCTM();
  e.currentTarget.dataset.dragging='true';anchor.current={x:e.clientX,y:e.clientY,view:currentSvgView(e.currentTarget,view),scale:matrix?.a||1};
  try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
 };
 const onMove=(e:React.PointerEvent<SVGSVGElement>)=>{
  if(pendingTerminal&&svg.current){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.current.getScreenCTM()!.inverse());setPointer({x:p.x,y:p.y})}
  if(!anchor.current||!svg.current)return;
  const scale=anchor.current.scale;
  setView({...anchor.current.view,x:anchor.current.view.x-(e.clientX-anchor.current.x)/scale,y:anchor.current.view.y-(e.clientY-anchor.current.y)/scale});
 };
 const onUp=()=>{anchor.current=null;if(svg.current)delete svg.current.dataset.dragging};
 return <svg ref={svg} className="board-svg" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="group" tabIndex={0} aria-label="Panel didáctico interactivo; flechas para desplazar, Inicio para ajustar" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={()=>setPointer(null)} onKeyDown={e=>{
  const step=view.w*.06;
  if(e.key==='Home'){e.preventDefault();setView({...FULL});return;}
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

 <rect x="29" y="28" width="1346" height="1172" rx="10" fill="#e8ebed" stroke="#9fa8b1" strokeWidth="4"/>
 {[42,378,765,1188].map((y,i)=><g key={y}><rect x="28" y={y} width="1347" height={i===0?29:27} rx="5" fill="url(#railMetal)"/><line x1="35" y1={y+4} x2="1367" y2={y+4} stroke="#f5f7f8" opacity=".7" strokeWidth="1.3"/></g>)}
 {[0,1,2].map((i)=><g key={i} opacity=".55"><rect x="36" y={i*355+102} width="1330" height="80" fill="url(#vent)"/></g>)}
 <rect x="28" y="27" width="1348" height="1190" rx="12" fill="none" stroke="#818b94" strokeWidth="5" opacity=".43" />
 {MODULES.map(m=>{
   const faded=group!=='todos'&&m.category!==group;
   const byQuery=query.trim()&&m.terminals.some(t=>matchesTerminal(m,t,query,aliases[m.id]));
   return <g key={m.id} data-module-id={m.id} transform={`translate(${m.x} ${m.y})`} opacity={faded?.2:1} className="board-module">
     <MemoFace m={m} aliases={aliases} simulation={simulation}/>
     {highlightedModules.includes(m.id)&&<rect x="-5" y="-5" width={m.w+10} height={m.h+10} rx="6" fill="none" stroke="#187b6c" strokeWidth="5" pointerEvents="none"/>}
     {byQuery&&<rect x="-4" y="-4" width={m.w+8} height={m.h+8} rx="7" fill="none" stroke="#d6a158" strokeWidth="4" pointerEvents="none"/>}
     <MemoPorts module={m} selected={selected} onSelect={onSelect} query={query} alias={aliases[m.id]||''}/>
   </g>;
 })}
  {pendingTerminal&&pointer&&terminalPoint(pendingTerminal)&&<path className="pending-cable-preview" d={cablePath(terminalPoint(pendingTerminal)!,pointer,60)} fill="none" stroke="#258cb2" strokeWidth="5" strokeDasharray="10 7" opacity=".7" pointerEvents="none"/>}
 {ghosts.map((g,i)=>terminalPoint(g.from)&&terminalPoint(g.to)&&<g key={`${g.from}-${g.to}`} className="ghost-cable" data-ghost-from={g.from} data-ghost-to={g.to} opacity=".48" pointerEvents="none" aria-hidden="true"><BananaCableVisual id={`lesson-ghost-${i}`} from={terminalPoint(g.from)!} to={terminalPoint(g.to)!} sag={80+(i%4)*24} color="#168cac"/></g>)}
 <MemoWireLayer liveWireIds={liveWireIds} routeWireIds={routeWireIds} hitConnectors={hitConnectors} wires={wires} selected={selectedWire} onSelect={onSelectWire} errorWires={errorWires}/>
 {MODULES.map(m=><g key={m.id} data-module-labels={m.id} transform={`translate(${m.x} ${m.y})`} opacity={group!=='todos'&&m.category!==group ? .2 : 1}>
  {m.terminals.filter(t=>highlightedTerminals.includes(`${m.id}:${t.id}`)||pendingTerminal===`${m.id}:${t.id}`).map(t=><circle key={t.id} data-highlight-terminal={`${m.id}:${t.id}`} cx={t.x} cy={t.y} r="23" fill="none" stroke={pendingTerminal===`${m.id}:${t.id}`?'#edab3f':'#168a74'} strokeWidth="4" pointerEvents="none"/>)}
  <MemoLabels module={m}/>
 </g>)}
 <text x="70" y="1223" fill="#717a85" fontSize="15" fontWeight="650">{simulation?.input.enabled?'PANEL DIDÁCTICO · SIMULACIÓN VIRTUAL DE MANDO 24 V':'PANEL DIDÁCTICO · REPRESENTACIÓN DIGITAL DE REFERENCIA · SIN ENERGÍA'}</text>
 </svg>;
}
