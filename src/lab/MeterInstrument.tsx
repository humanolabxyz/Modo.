import {PlugBody,CableMaterial} from '../components/BananaCable';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type ReactNode,type PointerEvent as ReactPointerEvent} from 'react';
import {Expand,Maximize2,Minimize2,Shrink} from 'lucide-react';
import {MODES,type MeterDisplay,type MeterMode,type Shortcut} from './MeterPanel';
import type {MeterJack} from '../data/panelElectrical';
import {useRollingLcd} from './useRollingLcd';
import {CORD_DEFAULTS,createChain,smoothPath,stepChain,type Chain,type CordOptions,type Pt} from './cords';
import {FloatingWindow} from '../components/FloatingWindow';
import {parseMeterReadout} from './meterReadout';
/** Multímetro como objeto del banco: carcasa, pantalla, selector, botones y conectores, con las puntas roja y negra
 *  unidas por cables que se ven sobre la placa. Las puntas se arrastran a un orificio; el cálculo sigue en el solver. */
export type {Pt};
export const VB={w:220,h:340};
/** Escala del multímetro: de 40 % a 130 %. Se recuerda en el navegador para que no estorbe al ponerlo en vertical. */
export const SCALE={min:.4,max:1.3,step:.15,key:'panellab.dmmScale'};
export const clampScale=(v:number)=>Math.min(SCALE.max,Math.max(SCALE.min,Math.round(v*100)/100));
function readScale(){try{const v=Number(localStorage.getItem(SCALE.key));return Number.isFinite(v)&&v>0?clampScale(v):1}catch{return 1}}
/** Posiciones del selector, en grados respecto de la vertical. */
const DIAL:{id:MeterMode|'OFF';angle:number;label:string;name:string}[]=[
  {id:'OFF',angle:-130,label:'OFF',name:'Apagado'},{id:'V',angle:-85,label:'V⎓',name:'Tensión continua'},{id:'A',angle:65,label:'A⎓',name:'Corriente continua (en serie)'},{id:'R',angle:0,label:'Ω',name:'Resistencia'},{id:'C',angle:30,label:'•))',name:'Continuidad'},
];
export const JACKS={a10:{x:38,y:296},ma:{x:86,y:296},com:{x:134,y:296},vo:{x:182,y:296}};
const DX=110,DY=214,DR=54;
export function jackAnchors(rect:{left:number;top:number;width:number;height:number},mode:MeterMode|'OFF',collapsed:boolean,redJack:MeterJack='vo'):{red:Pt;black:Pt}{
  if(collapsed)return {red:{x:rect.left+rect.width*.32,y:rect.top+rect.height},black:{x:rect.left+rect.width*.68,y:rect.top+rect.height}};
  const k=rect.width/VB.w,at=(j:{x:number;y:number})=>({x:rect.left+j.x*k,y:rect.top+j.y*(rect.height/VB.h)});
  return {red:at(redJack==='a10'?JACKS.a10:redJack==='ma'?JACKS.ma:JACKS.vo),black:at(JACKS.com)};
}
export type DeviceProps={caption?:string;onInfo?:()=>void;native?:boolean;embedded?:boolean;dial?:typeof DIAL;redJack?:MeterJack;onJack?(jack:MeterJack):void;milliamps?:boolean;blown?:{a10?:boolean;ma?:boolean};onReadoutState?:(state:string|null)=>void;onDisplayedReading?:(text:string)=>void;mode:MeterMode|'OFF';onMode:(m:MeterMode|'OFF')=>void;display:MeterDisplay;held:boolean;onHold:()=>void;onRecord:()=>void;collapsed:boolean;onCollapsed:(c:boolean)=>void;logCount:number;logOpen:boolean;onLog:()=>void;shortcuts:Shortcut[];onShortcut:(s:Shortcut)=>void;onRect:(r:DOMRect|null)=>void;hasProbes:boolean;above?:ReactNode;sideActions?:ReactNode};
export function MeterDevice(p:DeviceProps){
  const root=useRef<HTMLDivElement>(null),face=useRef<HTMLElement|SVGSVGElement|null>(null),[pos,setPos]=useState<Pt|null>(null),drag=useRef<{dx:number;dy:number}|null>(null),[scale,setScaleState]=useState(()=>p.embedded?1:readScale());
  const positions=p.dial??DIAL,dialDrag=useRef<{x:number;y:number;moved:boolean}|null>(null),[choosing,setChoosing]=useState(false),lastTouch=useRef({key:'',at:0});
  const turnDial=(e:ReactPointerEvent<SVGGElement>)=>{const matrix=e.currentTarget.ownerSVGElement?.getScreenCTM();if(!matrix)return;const at=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()),angle=Math.atan2(at.x-DX,DY-at.y)*180/Math.PI;const nearest=positions.reduce((a,b)=>Math.abs(a.angle-angle)<Math.abs(b.angle-angle)?a:b);if(nearest.id!==p.mode)p.onMode(nearest.id);};
  const [lit,setLit]=useState(false),[relative,setRelative]=useState<number|null>(null),[extreme,setExtreme]=useState<'live'|'min'|'max'>('live'),[limits,setLimits]=useState<{min:number;max:number}|null>(null);
  useEffect(()=>{p.onReadoutState?.(p.held?'HOLD':relative!==null?'REL':extreme!=='live'?'MIN/MAX':null);},[p.held,relative,extreme,p.onReadoutState]);
  const sample=parseMeterReadout(p.display.text),numeric=sample?.value??null;
  useEffect(()=>{setRelative(null);setExtreme('live');setLimits(null);},[p.mode]);
  useEffect(()=>{if(numeric===null||p.mode==='OFF')return;setLimits(v=>v&&numeric>=v.min&&numeric<=v.max?v:{min:Math.min(v?.min??numeric,numeric),max:Math.max(v?.max??numeric,numeric)});},[numeric,p.mode]);
  const value=extreme==='min'?limits?.min:extreme==='max'?limits?.max:numeric;
  // Show the sampled electrical reading directly; interpolation added latency and
  // fabricated intermediate measurements while keeping React busy every frame.
  const rendered=sample&&value!==null&&value!==undefined?p.display.text.replace(sample.token,((value-(relative??0))/sample.factor).toFixed(sample.digits).replace('.',',')):p.display.text;

  const setScale=(next:number)=>{const v=clampScale(next);setScaleState(v);try{localStorage.setItem(SCALE.key,String(v))}catch{}};
  const sizing={'--dmm-scale':scale} as CSSProperties,tiny=scale<.62;
  const report=()=>{const rect=face.current?.getBoundingClientRect();p.onRect(rect&&rect.width?rect:null);};
  useLayoutEffect(()=>{if(!p.embedded&&!p.native)report();},[pos,scale,p.collapsed,p.embedded,p.native]);
  useEffect(()=>{if(p.embedded||p.native)return;const observer=new ResizeObserver(report);if(root.current)observer.observe(root.current);window.addEventListener('resize',report);return()=>{observer.disconnect();window.removeEventListener('resize',report);p.onRect(null);};},[]);
  const down=(e:ReactPointerEvent)=>{if(p.embedded)return;if((e.target as Element).closest('button,select,[role=radio],[role=button],[role=slider],input')&&!(e.target as Element).closest('[data-dmm-handle]'))return;e.preventDefault();e.stopPropagation();const parent=root.current!.offsetParent as HTMLElement,box=root.current!.getBoundingClientRect(),origin=parent.getBoundingClientRect();drag.current={dx:e.clientX-box.left,dy:e.clientY-box.top};e.currentTarget.setPointerCapture(e.pointerId);setPos({x:box.left-origin.left,y:box.top-origin.top});};
  const move=(e:ReactPointerEvent)=>{const d=drag.current;if(!d||!root.current)return;const parent=root.current.offsetParent as HTMLElement,o=parent.getBoundingClientRect(),w=root.current.offsetWidth,h=root.current.offsetHeight;setPos({x:Math.max(4,Math.min(o.width-w-4,e.clientX-o.left-d.dx)),y:Math.max(4,Math.min(o.height-h-4,e.clientY-o.top-d.dy))});};
  const up=()=>{drag.current=null;};
  const shown=p.mode==='OFF'?'':rendered,long=shown.length>10,tone=p.mode==='OFF'?'idle':p.display.tone,symbol=p.mode==='OFF'?'':p.dial?.find(d=>d.id===p.mode)?.label??MODES.find(m=>m.id===p.mode)?.symbol??'';
  useEffect(()=>{p.onDisplayedReading?.(shown);},[shown,p.onDisplayedReading]);
  const lcdRef=useRollingLcd(shown,!p.native&&!p.held);
  const style=pos?{left:pos.x,top:pos.y,right:'auto',bottom:'auto'}:undefined,fullStyle={...style,...sizing};
  if(p.collapsed)return <div ref={root} className="lab-dmm-device is-collapsed" style={style} role="group" aria-label="Multímetro">
    <div ref={el=>{face.current=el;}} className={`lab-dmm-pill tone-${tone}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <span className="lab-dmm-pill-mode" aria-hidden="true">{symbol||'OFF'}</span><output aria-label="Lectura del multímetro" aria-live="polite">{shown||'—'}</output>
      <button type="button" aria-label="Abrir el multímetro completo" title="Abrir el multímetro completo" onClick={()=>p.onCollapsed(false)}><Maximize2 size={16}/></button>
    </div></div>;
  const faceNode=<svg ref={el=>{face.current=el;}} className={p.native?"dmm-native-body fluke-body":"lab-dmm-body fluke-body"} width={p.native?VB.w:undefined} height={p.native?VB.h:undefined} preserveAspectRatio="none" viewBox={`0 0 ${VB.w} ${VB.h}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Fluke 87 V · simulación de práctica">
      <defs><linearGradient id="dmm-shell" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffda19"/><stop offset=".6" stopColor="#efbd08"/><stop offset="1" stopColor="#c49700"/></linearGradient><linearGradient id="dmm-glass" x1="0" y1="0" x2="0" y2="1"><stop stopColor={lit?'#e9f2cc':'#a9b7a5'}/><stop offset="1" stopColor={lit?'#dce9b9':'#c6d0b9'}/></linearGradient></defs>
      <path d="M24 7Q110 -2 196 7Q212 9 214 32L210 311Q210 335 188 337H32Q10 336 10 312L6 32Q7 12 24 7Z" fill="url(#dmm-shell)" stroke="#a17c03" strokeWidth="2"/>
      <path d="M30 24Q110 13 190 24L194 302Q194 319 179 320H40Q25 318 25 303Z" fill="#23282a" stroke="#101517" strokeWidth="2"/>
      <rect x="29" y="26" width="58" height="14" fill="#f5cf14"/><text x="58" y="37" textAnchor="middle" fontFamily="Arial,sans-serif" fontStyle="italic" fontWeight="900" fontSize="12" fill="#171c1b">FLUKE</text><text x="94" y="37" fontSize="9" fill="#edf0e7" fontWeight="700">87 V</text><text x="124" y="36" fontSize="5.3" fill="#bfc8c8">TRUE RMS MULTIMETER</text>
      <rect x="31" y="45" width="158" height="79" rx="8" fill="#111919" stroke="#68716c"/><rect x="36" y="50" width="148" height="68" rx="5" fill="url(#dmm-glass)"/>
      <text x="43" y="65" fontSize="8" fill="#24332b">{p.mode==='OFF'?'':p.held?'HOLD':relative!==null?'REL Δ':extreme!=='live'?extreme.toUpperCase():'AUTO'}</text><text key={shown} ref={lcdRef} x="178" y="93" textAnchor="end" className={`dmm-lcd tone-${tone}`} aria-label={p.native?"Lectura del multímetro":undefined} aria-live={p.native?"polite":undefined} style={{fontSize:shown.length>12?13:shown.length>9?17:24}}>{shown}</text><text x="43" y="109" fontSize="7" fill="#25382d">{p.mode==='OFF'?'':symbol}</text><text x="178" y="109" textAnchor="end" fontSize="6" fill="#25382d">{p.mode!=='OFF'&&sample?'R: '+sample.range+' '+sample.unit:''}</text>
      {Array.from({length:25},(_,i)=><path key={i} d={`M${43+i*5.3} 113v${i%5===0?-5:-3}`} stroke="#34483b" strokeWidth=".7"/>)}
      {[{x:45,y:139,label:'☀',name:'Iluminar pantalla',on:()=>setLit(v=>!v),pressed:lit},{x:88,y:139,label:'MIN MAX',name:'Mínimo y máximo',on:()=>setExtreme(v=>v==='live'?'min':v==='min'?'max':'live'),pressed:extreme!=='live'},{x:131,y:139,label:'RANGE',name:'Restablecer rango automático',on:()=>{setRelative(null);setExtreme('live');},pressed:false},{x:174,y:139,label:'AutoHOLD',name:'Congelar lectura',on:p.onHold,pressed:p.held},{x:88,y:163,label:'REL Δ',name:'Medición relativa',on:()=>setRelative(v=>v===null?numeric:null),pressed:relative!==null}].map(k=><g key={k.name} className="fluke-key" role="button" tabIndex={0} aria-label={k.name} aria-pressed={k.pressed} onPointerUp={e=>{if(e.pointerType==='touch'){e.preventDefault();lastTouch.current={key:k.name,at:performance.now()};k.on();}}} onClick={e=>{if(e.detail>0&&lastTouch.current.key===k.name&&performance.now()-lastTouch.current.at<700)return;k.on();}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();k.on();}}}><rect x={k.x-19} y={k.y-9} width="38" height="16" rx="7" fill={k.name==='Iluminar pantalla'?'#e9b70b':k.pressed?'#718285':'#303b3d'} stroke="#0d1416"/><text x={k.x} y={k.y+1} fontSize="5.7" textAnchor="middle" fill="#f4f5ed">{k.label}</text></g>)}
      <text x="131" y="164" fontSize="6" fill="#7e8c8d" textAnchor="middle">Hz %</text><text x="131" y="175" fontSize="4.5" fill="#85908e" textAnchor="middle">{p.caption??'SIMULACIÓN · DC / Ω'}</text>
      <g role="radiogroup" aria-label="Selector de función del multímetro">{positions.map(d=>{const a=d.angle*Math.PI/180,x=DX+(DR+14)*Math.sin(a),y=DY-(DR+14)*Math.cos(a);return <g key={d.id} role="radio" tabIndex={0} aria-checked={p.mode===d.id} aria-label={d.name} className={`dmm-pos ${p.mode===d.id?'on':''}`} onPointerUp={e=>{if(e.pointerType==='touch'){e.preventDefault();lastTouch.current={key:d.id,at:performance.now()};p.onMode(d.id);}}} onClick={e=>{if(e.detail>0&&lastTouch.current.key===d.id&&performance.now()-lastTouch.current.at<700)return;p.onMode(d.id);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();p.onMode(d.id);}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const at=positions.findIndex(v=>v.id===p.mode),next=positions[(at+(e.key==='ArrowRight'?1:positions.length-1))%positions.length];p.onMode(next.id);}}}><circle cx={x} cy={y} r="14" fill="transparent"/><text x={x} y={y+3} textAnchor="middle" style={{fill:p.mode===d.id?'#f5ce18':'#eef0e7',fontSize:9}}>{d.label}</text></g>;})}<g data-nopan role="slider" tabIndex={0} aria-label="Girar selector del multímetro" aria-valuemin={0} aria-valuemax={positions.length-1} aria-valuenow={positions.findIndex(d=>d.id===p.mode)} aria-valuetext={positions.find(d=>d.id===p.mode)?.name} style={{cursor:'grab',touchAction:'none'}} onPointerDown={e=>{e.stopPropagation();e.preventDefault();dialDrag.current={x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=dialDrag.current;if(d&&(d.moved||Math.hypot(e.clientX-d.x,e.clientY-d.y)>7)){d.moved=true;turnDial(e);}}} onPointerUp={e=>{e.stopPropagation();if(dialDrag.current&&!dialDrag.current.moved)setChoosing(true);dialDrag.current=null;}} onPointerCancel={()=>{dialDrag.current=null;}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setChoosing(true);}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const index=positions.findIndex(d=>d.id===p.mode);p.onMode(positions[(index+(e.key==='ArrowRight'?1:positions.length-1))%positions.length].id);}}} transform={`rotate(${positions.find(d=>d.id===p.mode)?.angle??0} ${DX} ${DY})`}><circle cx={DX} cy={DY} r="49" fill="#1c2526" stroke="#101718" strokeWidth="2"/>{Array.from({length:32},(_,i)=><path key={i} d={`M${DX+Math.sin(i*Math.PI/16)*46} ${DY-Math.cos(i*Math.PI/16)*46}l${-Math.sin(i*Math.PI/16)*5} ${Math.cos(i*Math.PI/16)*5}`} stroke="#354044" strokeWidth="2"/>)}<rect x={DX-12} y={DY-46} width="24" height="94" rx="10" fill="#3b4547" stroke="#141b1d"/><path d={`M${DX-7} ${DY-41}h14l-7 -5z`} fill="#d2d8d6"/></g></g>
      {([['a10','A'],['ma','mA μA'],['com','COM'],['vo','V Ω']] as const).map(([id,label])=>{const j=JACKS[id],plug=id==='com'?'black':((p.redJack??(p.mode==='A'?'a10':'vo'))===id)?'red':null;return <g key={id} role={p.onJack&&(id==='vo'||id==='a10'||(id==='ma'&&!!p.milliamps))?'button':undefined} tabIndex={p.onJack&&(id==='vo'||id==='a10'||(id==='ma'&&!!p.milliamps))?0:undefined} aria-label={p.onJack&&(id==='vo'||id==='a10'||(id==='ma'&&!!p.milliamps))?`Conectar punta roja a ${label}`:undefined} onClick={()=>{if(id==='vo'||id==='a10'||(id==='ma'&&!!p.milliamps))p.onJack?.(id);}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&(id==='vo'||id==='a10'||(id==='ma'&&!!p.milliamps))){e.preventDefault();p.onJack?.(id);}}}><text x={j.x} y={j.y-19} textAnchor="middle" fontSize="7" fill="#d7dfdc">{label}</text><circle cx={j.x} cy={j.y} r="12" fill="#0e1416" stroke={id==='com'?'#73858e':'#943735'} strokeWidth="2"/><circle cx={j.x} cy={j.y} r="7" fill={plug==='red'?'#bd3035':plug==='black'?'#263038':'#030708'} stroke={plug?'#809da6':'#263137'}/><circle cx={j.x} cy={j.y} r="3" fill={plug?'#b3c2c4':'#060a0c'}/>{(id==='a10'||id==='ma')&&p.blown?.[id]?<g className="jack-fuse-blown" aria-hidden="true"><circle cx={j.x} cy={j.y} r="15.5" fill="none" stroke="#ff5a4d" strokeWidth="2.2" opacity=".9"/><rect x={j.x-16} y={j.y-48} width="32" height="10" rx="5" fill="#2a1010" stroke="#ff6a5f" strokeWidth="1.4"/><path d={`M${j.x-11} ${j.y-43}h6m10 0h6`} stroke="#ffb3ab" strokeWidth="1.5"/><path d={`M${j.x-3} ${j.y-46}l6 6m0-6l-6 6`} stroke="#ff6a5f" strokeWidth="1.3"/></g>:null}</g>;})}
      <text x="110" y="316" textAnchor="middle" fontSize="4.6" fill="#b6c2bc">FUSED             COM             V / Ω</text>
    </svg>;
  const chooser=choosing?<FloatingWindow title="Función del multímetro" eyebrow="Toca una función · también puedes girar el selector" width={360} scaleBody={false} onClose={()=>setChoosing(false)}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{positions.map(d=><button key={d.id} type="button" aria-label={`Usar ${d.name}`} aria-pressed={p.mode===d.id} style={{minHeight:64,padding:12,border:'1px solid #aabdc5',borderRadius:10,background:p.mode===d.id?'#d6ece8':'#fff',color:'#213e49',font:'600 14px system-ui',touchAction:'manipulation'}} onClick={()=>{p.onMode(d.id);setChoosing(false);}}><strong style={{display:'block',fontSize:22}}>{d.label}</strong>{d.name}</button>)}</div></FloatingWindow>:null;
  if(p.native){
    const blocked=!p.display.record||p.mode==='OFF'||p.held||relative!==null||extreme!=='live';
    const nativeButton=(x:number,label:string,text:string,action:()=>void,disabled=false)=><g role="button" tabIndex={disabled?-1:0} aria-label={label} aria-disabled={disabled||undefined} onPointerUp={e=>{if(e.pointerType==='touch'&&!disabled){e.preventDefault();lastTouch.current={key:label,at:performance.now()};action();}}} onClick={e=>{if(e.detail>0&&lastTouch.current.key===label&&performance.now()-lastTouch.current.at<700)return;if(!disabled)action();}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&!disabled){e.preventDefault();action();}}} style={{cursor:disabled?'default':'pointer',opacity:disabled?.5:1}}><rect x={x} y="350" width="106" height="32" rx="7" fill="#f6f8f8" stroke="#c4d1d6"/><text x={x+53} y="370" textAnchor="middle" fontFamily="system-ui" fontSize="10" fill="#294653">{text}</text></g>;
    return <g className="lab-dmm-native" role="group" aria-label="Multímetro">{chooser}{faceNode}{nativeButton(0,'Anotar medida','✎ Anotar lectura',p.onRecord,blocked)}{nativeButton(114,`Tabla de mediciones (${p.logCount})`,`Libreta${p.logCount?' · '+p.logCount:''}`,p.onLog)}</g>;
  }
  return <div ref={root} className={`lab-dmm-device ${tiny?'is-tiny':''}${p.sideActions?' has-side-actions':''}`} style={fullStyle} data-scale={scale} role="group" aria-label="Multímetro">
    {p.above}
    {chooser}<div className="lab-dmm-handle" data-dmm-handle role="button" tabIndex={0} aria-label="Mover multímetro" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={e=>{const step:Record<string,Pt>={ArrowLeft:{x:-20,y:0},ArrowRight:{x:20,y:0},ArrowUp:{x:0,y:-20},ArrowDown:{x:0,y:20}};const d=step[e.key],el=root.current;if(d&&el){e.preventDefault();setPos({x:Math.max(4,el.offsetLeft+d.x),y:Math.max(4,el.offsetTop+d.y)});}}}>⠿ Arrastra para mover</div>{faceNode}{p.sideActions}
    <output className="lab-sr-only" aria-label="Lectura del multímetro" aria-live="polite">{shown}</output>
    {!p.sideActions&&<div className="fluke-notebook-actions"><button type="button" aria-label="Anotar medida" disabled={!p.display.record||p.mode==='OFF'||p.held||relative!==null||extreme!=='live'} onClick={p.onRecord}>✎ Anotar lectura</button><button type="button" aria-label={`Tabla de mediciones (${p.logCount})`} onClick={p.onLog}>Libreta{p.logCount?` · ${p.logCount}`:''}</button></div>}
    {!p.sideActions&&p.onInfo?<button type="button" className="panel-meter-info-button" onClick={p.onInfo}>Conexión y valores del modelo</button>:null}
    <div className="lab-dmm-tools"><span aria-hidden="true" style={{font:'700 10px/1 system-ui,sans-serif',color:'#5d707c',alignSelf:'center',padding:'0 2px'}}>Tamaño</span><button type="button" aria-label="Achicar el multímetro" title="Achicar el multímetro (no cambia el zoom del panel)" disabled={scale<=SCALE.min} onClick={()=>setScale(scale-SCALE.step)}><Shrink size={15}/></button><button type="button" aria-label="Agrandar el multímetro" title="Agrandar el multímetro (no cambia el zoom del panel)" disabled={scale>=SCALE.max} onClick={()=>setScale(scale+SCALE.step)}><Expand size={15}/></button><button type="button" aria-label="Reducir el multímetro" onClick={()=>p.onCollapsed(true)}><Minimize2 size={15}/></button></div>
  </div>;
}

/** Cables y puntas del multímetro sobre la placa. Cada cable es una cadena de puntos con peso y holgura (ver cords.ts) que se
 *  sigue la vista en vivo al desplazar o acercar la placa. Una cadena estable descansa hasta que se mueve uno de sus extremos. */
export type LeadFrame={jacks:[Pt,Pt];tips:[Pt,Pt]};
const PEN=[{d:{x:.42,y:-.91},color:'#c4262e',dark:'#7d1a20'},{d:{x:.7,y:-.71},color:'#2b3036',dark:'#0b0d0e'}];
const NODES=16;
export function MeterLeads({size,getFrame,snap,onGrab,onMove,onDrop,interactive=true,banana=false,navigation,probeLabel='orificio',connections,onProbeKey}:{banana?:boolean;navigation?:SVGSVGElement|null;probeLabel?:'orificio'|'borne';connections?:[string|null,string|null];onProbeKey?:(which:0|1,key:string)=>void;interactive?:boolean;size:{w:number;h:number};getFrame:()=>LeadFrame|null;snap:Pt|null;onGrab:(which:0|1,e:ReactPointerEvent)=>void;onMove:(e:ReactPointerEvent)=>void;onDrop:(e:ReactPointerEvent)=>void}){
  const root=useRef<SVGSVGElement>(null),parts=useRef<Record<string,SVGElement|null>[]>([{},{}]),chains=useRef<(Chain|null)[]>([null,null]),frameRef=useRef(getFrame);frameRef.current=getFrame;
  useEffect(()=>{
    let raf=0,sleep=0,last=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const asleep=[false,false],still=[0,0],movedAt=[performance.now(),performance.now()],anchors:( {jack:Pt;tip:Pt}|null)[]=[null,null];
    const set=(el:SVGElement|null|undefined,name:string,value:string)=>{if(el&&el.getAttribute(name)!==value)el.setAttribute(name,value);};
    chains.current=[null,null];
    const draw=(now:number,followOnly=false)=>{
      /* Píxeles por unidad del tablero: la clavija banana se dibuja del mismo tamaño que la de los cables del circuito. */
      const unit=((navigation??root.current?.parentElement?.querySelector('.lab-board-svg')) as SVGGraphicsElement|null)?.getScreenCTM?.()?.a||.5;
      /* Clavijas y cable proporcionales al multímetro: si se achica o agranda el tester, también ellos (200 px de ancho = tamaño 1). */
      const meterW=parseFloat(getComputedStyle(document.querySelector('.lab-dmm-device')??document.body).width)||172,leadScale=Math.max(.3,Math.min(1.4,meterW/200)),headScale=leadScale*.72;
      const frame=frameRef.current(),steps=Math.min(3,Math.max(1,Math.round((now-last)/16.7)));last=now;
      for(let i=0;i<2;i++){
        const el=parts.current[i],group=el.group;
        if(!frame){if(el.jackPlug)(el.jackPlug as SVGElement).style.display='none';if(group&&group.style.visibility!=='hidden')group.style.visibility='hidden';chains.current[i]=null;anchors[i]=null;asleep[i]=false;still[i]=0;continue;}
        if(group&&group.style.visibility!=='visible')group.style.visibility='visible';
        const o:CordOptions={...CORD_DEFAULTS,penDir:banana?{x:0,y:1}:PEN[i].d,penLength:banana?25*headScale:CORD_DEFAULTS.penLength,damping:reduced?.8:CORD_DEFAULTS.damping},jack=frame.jacks[i],tip=frame.tips[i];
        const previous=anchors[i],moved=!previous||Math.hypot(jack.x-previous.jack.x,jack.y-previous.jack.y,tip.x-previous.tip.x,tip.y-previous.tip.y)>.01;
        if(moved){asleep[i]=false;still[i]=0;movedAt[i]=now;anchors[i]={jack:{...jack},tip:{...tip}};}
        if(asleep[i])continue;
        let chain=chains.current[i]??createChain(jack,tip,NODES,o);
        if(followOnly){
          // La inercia escribe el viewBox después del RAF de los cables. Fijar los extremos
          // antes de pintar evita un fotograma de separación sin avanzar dos veces la física.
          chain.nodes[0]={...jack,px:jack.x,py:jack.y};
          chain.nodes[chain.nodes.length-1]={...tip,px:tip.x,py:tip.y};
        }else{
          const before=chain.nodes.map(n=>({x:n.x,y:n.y}));
          for(let k=0;k<steps;k++)chain=stepChain(chain,jack,tip,o);
          const motion=Math.max(...chain.nodes.map((n,j)=>Math.hypot(n.x-before[j].x,n.y-before[j].y)));
          still[i]=!moved&&motion<.08?still[i]+1:0;asleep[i]=still[i]>=12||(!moved&&now-movedAt[i]>1800);
        }
        chains.current[i]=chain;
        // The probe is rigid: only its cable follows the spring simulation. A swinging grip
        // otherwise moves out from under the finger between pointer move and pointer down.
        const n=chain.nodes,end=n[n.length-1],ux=banana?0:PEN[i].d.x,uy=banana?1:PEN[i].d.y,reach=banana?25*headScale:48,back={x:end.x+ux*reach,y:end.y+uy*reach},mid={x:end.x+ux*(banana?0:16),y:end.y+uy*(banana?0:16)};
        for(const name of ['tip','body','grip','back'])set(el[name],'display',banana?'none':'inline');
        /* El tester es grande frente al tablero: las clavijas y el cable se proporcionan al tester, no al zoom del tablero (mismo tamaño en los dos extremos). */const plugScale=headScale,cordW=banana?6*headScale:0;for(const [name,extra] of [['cord',0],['shadow',2.5],['shine',-cordW*.6]] as const){const el2=el[name] as SVGElement|null|undefined;if(el2)el2.style.strokeWidth=banana?String(Math.max(.8,cordW+extra)):'';}set(el.plug,'transform',`translate(${end.x} ${end.y}) scale(${plugScale})`);set(el.jackPlug,'transform',`translate(${jack.x} ${jack.y-2}) scale(${plugScale})`);if(el.jackPlug)(el.jackPlug as SVGElement).style.display=banana?'inline':'none';
        const d=smoothPath([...n.slice(0,-2),back]);
        for(const name of ['shadow','cord','shine'])set(el[name],'d',d);
        set(el.tip,'x1',String(end.x));set(el.tip,'y1',String(end.y));set(el.tip,'x2',String(mid.x));set(el.tip,'y2',String(mid.y));
        for(const name of ['body','grip']){set(el[name],'x1',String(mid.x));set(el[name],'y1',String(mid.y));set(el[name],'x2',String(back.x));set(el[name],'y2',String(back.y));}
        set(el.back,'cx',String(back.x));set(el.back,'cy',String(back.y));
        set(el.hit,'x1',String(end.x+ux*8));set(el.hit,'y1',String(end.y+uy*8));set(el.hit,'x2',String(back.x));set(el.hit,'y2',String(back.y));
      }
    };
    const tick=(now:number)=>{raf=0;if(!document.hidden)draw(now);if(document.hidden||asleep.every(Boolean))sleep=window.setTimeout(()=>{sleep=0;raf=requestAnimationFrame(tick);},250);else raf=requestAnimationFrame(tick);};
    const wake=()=>{if(sleep){clearTimeout(sleep);sleep=0;}if(!raf)raf=requestAnimationFrame(tick);};
    window.addEventListener('pointermove',wake,{passive:true});window.addEventListener('resize',wake);document.addEventListener('visibilitychange',wake);
    const board=navigation??root.current?.parentElement?.querySelector('.lab-board-svg');
    const observer=new MutationObserver(()=>draw(performance.now(),true));
    if(board)observer.observe(board,{attributes:true,attributeFilter:['viewBox']});
    raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);clearTimeout(sleep);observer.disconnect();window.removeEventListener('pointermove',wake);window.removeEventListener('resize',wake);document.removeEventListener('visibilitychange',wake);};
  },[navigation,banana]);
  const ref=(i:number,name:string)=>(el:SVGElement|null)=>{parts.current[i][name]=el;};
  return <><svg ref={root} className={`lab-leads${interactive?'':' is-inactive'}${banana?' is-banana':''}`} width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} role="group" aria-label="Cables y puntas del multímetro">
    {banana&&<><CableMaterial id="lead-red" color="#c4262e"/><CableMaterial id="lead-black" color="#2b3036"/></>}
    {snap?<circle className="lab-lead-snap" cx={snap.x} cy={snap.y} r="12"/>:null}
    {([0,1] as const).map(i=>{const pen=PEN[i];return <g key={i} ref={ref(i,'group')} className={`lab-lead ${i===0?'red':'black'}`} style={{visibility:'hidden'}}>
      <path ref={ref(i,'shadow')} className="cord-shadow" transform="translate(2 3)"/><path ref={ref(i,'cord')} className="cord" stroke={pen.color}/><path ref={ref(i,'shine')} className="cord-shine"/>
      {banana&&<g ref={ref(i,'plug')} className="lead-banana-plug" pointerEvents="none"><PlugBody gradient={i===0?'lead-red':'lead-black'} color={i===0?'#c4262e':'#2b3036'}/></g>}<line ref={ref(i,'tip')} className="pen-tip"/><line ref={ref(i,'body')} className="pen-body" stroke={pen.dark}/><line ref={ref(i,'grip')} className="pen-grip" stroke={pen.color}/><circle ref={ref(i,'back')} r="5" fill={pen.dark}/>
      <line ref={ref(i,'hit')} className="pen-hit" role="button" tabIndex={0} data-probe-connected={connections?.[i]??undefined} aria-label={`${banana?'Cable banana':'Punta'} ${i===0?'rojo':'negro'}: arrastra hasta un ${probeLabel}`.replace('Punta rojo','Punta roja').replace('Punta negro','Punta negra')} onKeyDown={e=>{if(onProbeKey&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Delete','Backspace'].includes(e.key)){e.preventDefault();e.stopPropagation();onProbeKey(i,e.key);}}} onPointerDown={e=>onGrab(i,e)} onPointerMove={onMove} onPointerUp={onDrop} onPointerCancel={onDrop}/>
    </g>;})}
  </svg>
  {/* La clavija del extremo que va al multímetro se dibuja encima del tester, para ver en cuál borne está enchufada. */}
  {banana&&<svg className="lab-leads lab-leads-top" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true" style={{zIndex:37}}>{([0,1] as const).map(i=><g key={i} ref={ref(i,'jackPlug')} className="lead-jack-plug" style={{display:'none'}}><PlugBody gradient={i===0?'lead-red':'lead-black'} color={i===0?'#c4262e':'#2b3036'}/></g>)}</svg>}</>;
}
