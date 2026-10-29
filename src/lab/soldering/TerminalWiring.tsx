import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {wireColor} from '../../data/wireColors';
import type {CableState} from '../../study/academicModels';
import type {Action,Commission} from './commissioning';
type Point={x:number;y:number};
const loose=(i:number):Point=>({x:590+i*94,y:700}),terminalBase=(slot:number):Point=>({x:596+(slot-1)*70,y:489});
export function TerminalWiring({state,cable,rear,send,onNotice}:{state:Commission;cable:CableState;rear:boolean;send:(a:Action)=>void;onNotice:(text:string)=>void}){
 const shift=state.plcPlugged?-20:90,inlet=(slot:number)=>({...terminalBase(slot),y:489+shift});
 const [preview,setPreview]=useState<{kind:number|'db9';point:Point}|null>(null);
 const [plugArmed,setPlugArmed]=useState(false);
 const [selected,setSelected]=useState<number|null>(null),[positions,setPositions]=useState(()=>[0,1,2].map(loose)),[db9,setDb9]=useState<Point>({x:210,y:465}),[armed,setArmed]=useState(false),[tool,setTool]=useState<'wire'|'driver'>('wire'),[driverSlot,setDriverSlot]=useState(1);
  const driverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(driverTimer.current)clearTimeout(driverTimer.current);},[]);
 const turnScrew=(slot:number)=>{setTool('driver');setDriverSlot(slot);send({type:'screw',slot});if(driverTimer.current)clearTimeout(driverTimer.current);driverTimer.current=setTimeout(()=>setTool('wire'),550);};
 const controlTouch=useRef<Record<string,number>>({});
 const pressAction=(key:string,act:()=>void)=>({onPointerUp:(e:PointerEvent<SVGElement>)=>{if(e.pointerType==='touch'){e.preventDefault();e.stopPropagation();controlTouch.current[key]=performance.now();act();}},onClick:(e:React.MouseEvent<SVGElement>)=>{if(e.detail>0&&performance.now()-(controlTouch.current[key]??-Infinity)<700)return;act();}});
 const root=useRef<SVGSVGElement>(null),drag=useRef<{kind:number|'db9';origin:Point;start:Point;moved:boolean}|null>(null),last=useRef(-Infinity);
 const point=(e:PointerEvent<SVGElement>)=>{const m=root.current?.getScreenCTM();return m?new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()):{x:0,y:0};};
 const start=(kind:number|'db9',e:PointerEvent<SVGElement>)=>{e.stopPropagation();if(state.hmiPower||state.plcPower){onNotice('Apaga los equipos antes de manipular el cable.');return;}const origin=kind==='db9'?state.db9?{x:240,y:317}:db9:state.terminations[kind].slot?inlet(state.terminations[kind].slot!):positions[kind];drag.current={kind,origin,start:point(e),moved:false};e.currentTarget.setPointerCapture(e.pointerId);if(typeof kind==='number')setSelected(kind);else setArmed(true);setPreview(null);};
 const move=(e:PointerEvent<SVGElement>)=>{const d=drag.current;if(!d)return;e.stopPropagation();const p=point(e),dx=p.x-d.start.x,dy=p.y-d.start.y;if(Math.hypot(dx,dy)<8&&!d.moved)return;d.moved=true;
  if(typeof d.kind==='number'&&state.terminations[d.kind].tight){onNotice('Afloja el tornillo antes de retirar este conductor.');return;}
  setPreview({kind:d.kind,point:{x:d.origin.x+dx,y:d.origin.y+dy}});

 };
 const end=(e:PointerEvent<SVGElement>)=>{const d=drag.current;drag.current=null;setPreview(null);if(!d)return;e.stopPropagation();e.preventDefault();last.current=performance.now();
  if(!d.moved){if(d.kind==='db9'){if(state.db9){send({type:'connect',end:'db9'});setArmed(false);}else{setArmed(true);onNotice('DB9 seleccionado. Toca el puerto COM2 en la parte trasera del HMI.');}}else{setSelected(d.kind);setTool('wire');onNotice(`Conductor ${d.kind+1} seleccionado. Toca una entrada de bornera; el tornillo se trabaja por separado.`);}return;}
  const finger=point(e),tip={x:d.origin.x+finger.x-d.start.x,y:d.origin.y+finger.y-d.start.y};
  const scale=Math.hypot(root.current?.getScreenCTM()?.a??1,root.current?.getScreenCTM()?.b??0),snap=Math.max(36,Math.min(85,30/scale));
  if(d.kind==='db9'){
   const near= Math.min(Math.hypot(tip.x-240,tip.y-317),Math.hypot(finger.x-240,finger.y-317))<snap;
   if(rear&&near&&!state.db9){send({type:'connect',end:'db9'});setArmed(false);}
   else if(state.db9&&rear&&!near){setDb9(tip);send({type:'connect',end:'db9'});setArmed(false);}
   else if(!state.db9){setDb9(tip);onNotice(rear?'Conector suelto. Llévalo a COM2.':'Gira el HMI para acceder al puerto COM2.');}
  }else{
   if(state.terminations[d.kind].tight){onNotice('Afloja el tornillo antes de retirar este conductor.');return;}
   const slot=[1,2,3].map(s=>({slot:s,d:Math.min(Math.hypot(tip.x-inlet(s).x,tip.y-inlet(s).y),Math.hypot(finger.x-inlet(s).x,finger.y-inlet(s).y))})).sort((a,b)=>a.d-b.d)[0];
   if(slot.d<snap)send({type:'insert',wire:d.kind,slot:slot.slot});
   else{setPositions(old=>old.map((v,i)=>i===d.kind?tip:v));if(state.terminations[d.kind].slot)send({type:'remove',wire:d.kind});}
  }

 };
 const activate=(kind:number|'db9')=>{if(kind==='db9'){if(state.db9)send({type:'connect',end:'db9'});else{setArmed(true);onNotice('Ahora toca COM2 en la parte trasera del HMI.');}}else{setSelected(kind);setTool('wire');}};
 const wireEvent=(kind:number|'db9')=>({onPointerDown:(e:PointerEvent<SVGElement>)=>start(kind,e),onPointerMove:move,onPointerUp:end,onPointerCancel:()=>{drag.current=null;setPreview(null);},onClick:(e:React.MouseEvent<SVGElement>)=>{if(e.detail===0||performance.now()-last.current>700)activate(kind);},onKeyDown:(e:React.KeyboardEvent<SVGElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(kind);}}});
 const body=preview?.kind==='db9'?preview.point:state.db9?{x:240,y:317}:db9,shown=!state.db9||rear;
 const chooseSlot=(slot:number)=>{if(selected===null){onNotice('Toma primero uno de los tres conductores.');return;}send({type:'insert',wire:selected,slot});};
 return <>
  <svg className="terminal-wiring" ref={root} width="940" height="740" viewBox="0 0 940 740" role="group" data-db9-connected={state.db9} data-plc-plugged={state.plcPlugged} aria-label="Conectores y bornera manual del cable">
   {/* The common jacket stays behind the HMI when its front is visible. */}
   <path data-cable-jacket d={`M${body.x} ${state.db9&&!rear?395:body.y+34}C${body.x} 590 430 620 545 625`} fill="none" stroke="#35444a" strokeWidth="23" pointerEvents="none"/>
   <path d={`M${body.x+3} ${state.db9&&!rear?395:body.y+34}C${body.x+3} 590 433 620 548 625`} fill="none" stroke="#7b8c91" strokeWidth="4" pointerEvents="none"/>
   <g transform={`translate(0 ${shift})`}>{[1,2,3].map(slot=>{const p=inlet(slot),row=state.terminations.find(t=>t.slot===slot);return <g key={slot} className="din-terminal" data-terminal-slot={slot}>
    <path d={`M${p.x-29} 486h50l10 17v52l-12 12h-48v-64Z`} fill="#82a76b" stroke="#788783" strokeWidth="2"/>
    <path d={`M${p.x-29} 486h50l10 17h-60Z`} fill="#b7cd91" stroke="#98a5a0"/>
    <path d={`M${p.x+21} 486l10 17v52l-12 12V503Z`} fill="#648254"/>
    <ellipse cx={p.x+16} cy="493" rx="6" ry="4" fill="#31463b"/><rect x={p.x-23} y="530" width="42" height="17" fill="#eef0e7" stroke="#9ba79f"/>
    <text x={p.x-2} y="542" fontSize="12" textAnchor="middle" fill="#293d35">T{slot}</text>
    <g role="button" tabIndex={0} aria-label={`Tornillo T${slot}: ${state.released[slot-1]?'apretar':'aflojar'}`} className="terminal-screw" {...pressAction('screw'+slot,()=>turnScrew(slot))} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();turnScrew(slot);}}}>
     <rect x={p.x-26} y="501" width="50" height="37" fill="transparent"/>
     <ellipse cx={p.x-2} cy="518" rx="14" ry="11" fill="#606d68" stroke="#ecf1e7" strokeWidth="2"/>
     <path d={`M${p.x-11} 518h18`} stroke="#d1d9c9" strokeWidth="3" transform={`rotate(${state.released[slot-1]?0:52} ${p.x-2} 518)`}/>
    </g>
    <g role="button" tabIndex={0} aria-label={`Entrada T${slot}`} {...pressAction('entry'+slot,()=>chooseSlot(slot))} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseSlot(slot);}}}>
     <rect x={p.x-27} y="460" width="51" height="42" fill="transparent"/>
     <path d={`M${p.x-16} 481h28v18h-28Z`} fill="#26372f" stroke={selected!==null?'#5a9dac':'#8f9e95'} strokeWidth="2"/>
     <path d={`M${p.x-10} 485h16v8h-16Z`} fill="#536a59"/>
    </g>
   </g>;})}</g>
   <g role="button" tabIndex={0} aria-label="Tomar conector de tres vías PLC" onClick={()=>{if(state.plcPlugged)send({type:'plcPlug'});else{setPlugArmed(true);onNotice('Conector seleccionado. Toca el alojamiento RS-485 bajo el PLC.');}}} onKeyDown={e=>{if(e.key==='Enter')setPlugArmed(true);}}><rect x="802" y={552+shift} width="35" height="27" rx="3" fill="#6f945d" stroke={plugArmed?'#2b8f9d':'#547449'} strokeWidth="2"/><text x="819" y={570+shift} textAnchor="middle" fontSize="11" fill="#fff">{state.plcPlugged?'✓':'PLC'}</text></g>
   {plugArmed&&!state.plcPlugged?<g role="button" tabIndex={0} aria-label="Insertar conector en PLC" onClick={()=>{send({type:'plcPlug'});setPlugArmed(false);}} onKeyDown={e=>{if(e.key==='Enter'){send({type:'plcPlug'});setPlugArmed(false);}}}><rect x="650" y="435" width="125" height="55" fill="#23889e33" stroke="#258798" strokeDasharray="4 4"/></g>:null}
   <text x="670" y="420" fontSize="11" textAnchor="middle" fill="#344d4a" stroke="#e1e6e0" strokeWidth="3" paintOrder="stroke">Conector PLC · tres vías · entradas superiores</text>
   {cable.wires.map((w,i)=>{const row=state.terminations[i],p=preview?.kind===i?preview.point:row.slot?inlet(row.slot):positions[i],color=wireColor(w,i);return <g key={i} className="terminal-wire" data-manual-wire={i} data-wire-slot={row.slot??''} data-wire-tight={row.tight}>
    <path d={`M545 625C${565+i*15} ${650+i*17} ${p.x} ${p.y-80} ${p.x} ${p.y-15}`} fill="none" stroke={color} strokeWidth="8" pointerEvents="none"/>
    <path d={`M${p.x} ${p.y-15}V${p.y+3}`} stroke="#be8c57" strokeWidth="6" pointerEvents="none"/>
    <g role="button" tabIndex={0} aria-label={`Tomar conductor ${i+1}`} {...wireEvent(i)} style={{touchAction:'none',cursor:'grab'}}>
     <rect x={p.x-22} y={p.y-48} width="44" height="48" fill="transparent"/><path d={`M${p.x} ${p.y-42}v28`} stroke={color} strokeWidth="10"/>
     <path d={`M${p.x} ${p.y-48}v43`} stroke="transparent" strokeWidth="44" pointerEvents="stroke"/>
     {selected===i?<circle cx={p.x} cy={p.y-27} r="24" fill="none" stroke="#258597" strokeDasharray="4 4" strokeWidth="2" pointerEvents="none"/>:null}
    </g>
    {!row.slot?<text x={p.x} y={p.y+65} fontSize="12" textAnchor="middle" fill="#354e52">Hilo {i+1}</text>:null}
   </g>;})}
   {shown?<g role="button" tabIndex={0} aria-label="Tomar conector DB9" data-manual-db9 transform={`translate(${body.x} ${body.y})`} {...wireEvent('db9')} style={{touchAction:'none',cursor:'grab'}}>
    <path d="M-40 3H40L30 44H-30Z" fill="#89969e" stroke="#415763" strokeWidth="3"/>
    <rect x="-53" y="-7" width="106" height="15" rx="4" fill="#b9c1bf" stroke="#607580"/>
    <path d="M-32 -21H32L25 -8H-25Z" fill="#c4c8b8" stroke="#667b7d" strokeWidth="2"/>
    {Array.from({length:9},(_,i)=><circle key={i} cx={i<5?-22+i*11:-16+(i-5)*11} cy={i<5?-17:-11} r="1.8" fill="#b1944d"/>)}
    <circle cx="-44" r="4" fill="#63777f"/><circle cx="44" r="4" fill="#63777f"/>
    {armed&&!state.db9?<path d="M-60 -32H60V57H-60Z" fill="none" stroke="#288697" strokeWidth="2" strokeDasharray="5 5"/>:null}
    <rect x="-60" y="-30" width="120" height="90" fill="transparent"/>
   </g>:null}
   {rear&&armed&&!state.db9?<g role="button" tabIndex={0} aria-label="Insertar DB9 en COM2" onClick={()=>{send({type:'connect',end:'db9'});setArmed(false);}} onKeyDown={e=>{if(e.key==='Enter'){send({type:'connect',end:'db9'});setArmed(false);}}}><rect x="179" y="273" width="122" height="75" fill="#3a97a51a" stroke="#45a2b0" strokeWidth="2" strokeDasharray="4 4"/><text x="240" y="268" fontSize="12" textAnchor="middle" fill="#214d56" stroke="#fff" paintOrder="stroke" strokeWidth="3">Insertar en COM2</text></g>:null}
   {tool==='driver'?<g data-active-screwdriver pointerEvents="none" transform={`translate(${inlet(driverSlot).x} ${518+shift}) rotate(-22)`}><path d="M0 -56V-7" stroke="#80959c" strokeWidth="5"/><path d="M-3 -7H3L2 1H-2Z" fill="#566a75"/><rect x="-9" y="-110" width="18" height="58" rx="7" fill="#b73f35" stroke="#782c2d" strokeWidth="2"/><path d="M-2 -105v42" stroke="#ec6b53" strokeWidth="4"/></g>:null}
  </svg>
  <div className="terminal-context-controls"><button aria-label="Enchufar o retirar conector del PLC" aria-pressed={state.plcPlugged} onClick={()=>send({type:'plcPlug'})}>{state.plcPlugged?'Retirar conector PLC':'Enchufar conector al PLC'}</button><button className="terminal-driver-select" aria-pressed={tool==='driver'} onClick={()=>{setTool(v=>v==='driver'?'wire':'driver');onNotice('Toca la cabeza del tornillo que quieras apretar o aflojar.');}}>Destornillador</button>{selected!==null&&state.terminations[selected].slot?<button onClick={()=>send({type:'remove',wire:selected})}>Retirar hilo {selected+1}</button>:null}<small>{selected===null?'Toma un conductor y llévalo a una entrada.':`Hilo ${selected+1} · ${state.terminations[selected].tight?'sujeto por el tornillo':state.terminations[selected].slot?'insertado, falta apretar':'suelto'}`}</small></div>
 </>;
}
