import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import {Maximize2,Minimize2,ZoomIn,ZoomOut} from 'lucide-react';
import {MODES,type MeterDisplay,type MeterMode,type Shortcut} from './MeterPanel';
import {CORD_DEFAULTS,createChain,smoothPath,stepChain,type Chain,type CordOptions,type Pt} from './cords';
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
  {id:'OFF',angle:-100,label:'OFF',name:'Apagado'},{id:'V',angle:-50,label:'V⎓',name:'Tensión continua'},{id:'A',angle:0,label:'A⎓',name:'Corriente continua (en serie)'},{id:'R',angle:50,label:'Ω',name:'Resistencia'},{id:'C',angle:100,label:'•))',name:'Continuidad'},
];
const JACKS={com:{x:45,y:296},vo:{x:110,y:296},a10:{x:175,y:296}};
const DX=110,DY=214,DR=54;
export function jackAnchors(rect:{left:number;top:number;width:number;height:number},mode:MeterMode|'OFF',collapsed:boolean):{red:Pt;black:Pt}{
  if(collapsed)return {red:{x:rect.left+rect.width*.32,y:rect.top+rect.height},black:{x:rect.left+rect.width*.68,y:rect.top+rect.height}};
  const k=rect.width/VB.w,at=(j:{x:number;y:number})=>({x:rect.left+j.x*k,y:rect.top+(j.y+14)*(rect.height/VB.h)});
  return {red:at(mode==='A'?JACKS.a10:JACKS.vo),black:at(JACKS.com)};
}
export type DeviceProps={mode:MeterMode|'OFF';onMode:(m:MeterMode|'OFF')=>void;display:MeterDisplay;held:boolean;onHold:()=>void;onRecord:()=>void;collapsed:boolean;onCollapsed:(c:boolean)=>void;logCount:number;logOpen:boolean;onLog:()=>void;shortcuts:Shortcut[];onShortcut:(s:Shortcut)=>void;onRect:(r:DOMRect|null)=>void;hasProbes:boolean};
export function MeterDevice(p:DeviceProps){
  const root=useRef<HTMLDivElement>(null),face=useRef<HTMLElement|SVGSVGElement|null>(null),[pos,setPos]=useState<Pt|null>(null),drag=useRef<{dx:number;dy:number}|null>(null),[scale,setScaleState]=useState(readScale);
  const setScale=(next:number)=>{const v=clampScale(next);setScaleState(v);try{localStorage.setItem(SCALE.key,String(v))}catch{}};
  const sizing={'--dmm-scale':scale} as CSSProperties,tiny=scale<.62;
  const report=()=>{const rect=face.current?.getBoundingClientRect();p.onRect(rect&&rect.width?rect:null);};
  useLayoutEffect(()=>{report();});
  useEffect(()=>{const observer=new ResizeObserver(report);if(root.current)observer.observe(root.current);window.addEventListener('resize',report);return()=>{observer.disconnect();window.removeEventListener('resize',report);p.onRect(null);};},[]);
  const down=(e:ReactPointerEvent)=>{if((e.target as Element).closest('button,select,[role=radio],[role=button],input'))return;const parent=root.current!.offsetParent as HTMLElement,box=root.current!.getBoundingClientRect(),origin=parent.getBoundingClientRect();drag.current={dx:e.clientX-box.left,dy:e.clientY-box.top};e.currentTarget.setPointerCapture(e.pointerId);setPos({x:box.left-origin.left,y:box.top-origin.top});};
  const move=(e:ReactPointerEvent)=>{const d=drag.current;if(!d||!root.current)return;const parent=root.current.offsetParent as HTMLElement,o=parent.getBoundingClientRect(),w=root.current.offsetWidth,h=root.current.offsetHeight;setPos({x:Math.max(4,Math.min(o.width-w-4,e.clientX-o.left-d.dx)),y:Math.max(4,Math.min(o.height-h-4,e.clientY-o.top-d.dy))});};
  const up=()=>{drag.current=null;};
  const shown=p.mode==='OFF'?'':p.display.text,long=shown.length>10,tone=p.mode==='OFF'?'idle':p.display.tone,symbol=p.mode==='OFF'?'':MODES.find(m=>m.id===p.mode)?.symbol??'';
  const style=pos?{left:pos.x,top:pos.y,right:'auto',bottom:'auto'}:undefined,fullStyle={...style,...sizing};
  if(p.collapsed)return <div ref={root} className="lab-dmm-device is-collapsed" style={style} role="group" aria-label="Multímetro">
    <div ref={el=>{face.current=el;}} className={`lab-dmm-pill tone-${tone}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <span className="lab-dmm-pill-mode" aria-hidden="true">{symbol||'OFF'}</span><output aria-label="Lectura del multímetro" aria-live="polite">{shown||'—'}</output>
      <button type="button" aria-label="Abrir el multímetro completo" title="Abrir el multímetro completo" onClick={()=>p.onCollapsed(false)}><Maximize2 size={16}/></button>
    </div></div>;
  return <div ref={root} className={`lab-dmm-device ${tiny?'is-tiny':''}`} style={fullStyle} data-scale={scale} role="group" aria-label="Multímetro">
    <svg ref={el=>{face.current=el;}} className="lab-dmm-body" viewBox={`0 0 ${VB.w} ${VB.h}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <defs><linearGradient id="dmm-shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8d23d"/><stop offset=".6" stopColor="#efb91a"/><stop offset="1" stopColor="#d99f0a"/></linearGradient><linearGradient id="dmm-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d3e0c8"/><stop offset="1" stopColor="#b9cbad"/></linearGradient><filter id="dmm-shadow" x="-10%" y="-6%" width="120%" height="118%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1c2430" floodOpacity=".3"/></filter></defs>
      <rect x="6" y="6" width="208" height="328" rx="28" fill="#23282c" filter="url(#dmm-shadow)"/>
      <rect x="12" y="12" width="196" height="316" rx="22" fill="url(#dmm-shell)" stroke="#8a6805" strokeWidth="1.2"/>
      <path d="M12 34Q12 12 34 12H186Q208 12 208 34V40H12Z" fill="#23282c" opacity=".9"/><text x="110" y="29" textAnchor="middle" className="dmm-brand">modo. · DMM 600</text>
      <rect x="24" y="46" width="172" height="76" rx="10" fill="#23282c"/><rect x="29" y="51" width="162" height="66" rx="7" fill="url(#dmm-glass)"/>
      <text x="38" y="68" className="dmm-lcd-mode">{symbol}</text><text x="38" y="108" className="dmm-lcd-aux">{p.held?'HOLD':p.mode==='OFF'?'':'AUTO'}</text>
      <text x="184" y={long?96:100} textAnchor="end" className={`dmm-lcd tone-${tone} ${long?'small':''}`}>{shown}</text>
      {[ {x:44,label:'REC',title:'Anotar medida',on:p.onRecord,off:!p.display.record||p.mode==='OFF'},{x:110,label:'HOLD',title:p.held?'Soltar la lectura':'Congelar la lectura',on:p.onHold,off:p.mode==='OFF',pressed:p.held},{x:176,label:'TABLA',title:'Abrir la tabla de mediciones',on:p.onLog,off:false,pressed:p.logOpen} ].map(b=>
        <g key={b.label} role="button" tabIndex={b.off?-1:0} aria-label={b.label==='REC'?'Anotar medida':b.label==='HOLD'?'Congelar lectura':`Tabla de mediciones (${p.logCount})`} aria-disabled={b.off} aria-pressed={'pressed' in b?b.pressed:undefined} className={`dmm-key ${b.off?'off':''} ${'pressed' in b&&b.pressed?'on':''}`} onClick={()=>{if(!b.off)b.on();}} onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&!b.off){e.preventDefault();b.on();}}}><title>{b.title}</title><rect x={b.x-27} y="130" width="54" height="22" rx="8"/><text x={b.x} y="145" textAnchor="middle">{b.label}{b.label==='TABLA'&&p.logCount?` ${p.logCount}`:''}</text></g>)}
      <g role="radiogroup" aria-label="Selector de función del multímetro">
        {DIAL.map(d=>{const a=d.angle*Math.PI/180,x=DX+(DR+19)*Math.sin(a),y=DY-(DR+19)*Math.cos(a),on=p.mode===d.id;return <g key={d.id} role="radio" aria-checked={on} aria-label={d.name} tabIndex={0} className={`dmm-pos ${on?'on':''}`} onClick={()=>p.onMode(d.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();p.onMode(d.id);}}}><title>{d.name}</title><circle cx={x} cy={y} r="14" fill="transparent"/><text x={x} y={y+4} textAnchor="middle">{d.label}</text></g>;})}
        <g className="dmm-knob" style={{transform:`rotate(${DIAL.find(d=>d.id===p.mode)!.angle}deg)`,transformOrigin:`${DX}px ${DY}px`}} pointerEvents="none">
          <circle cx={DX} cy={DY} r={DR} fill="#14171a" opacity=".3" transform="translate(0 3)"/><circle cx={DX} cy={DY} r={DR} fill="#2f353b" stroke="#0e1113" strokeWidth="2"/>
          {Array.from({length:28},(_,i)=><line key={i} x1={DX+(DR-1)*Math.sin(i*Math.PI/14)} y1={DY-(DR-1)*Math.cos(i*Math.PI/14)} x2={DX+(DR-7)*Math.sin(i*Math.PI/14)} y2={DY-(DR-7)*Math.cos(i*Math.PI/14)} stroke="#0e1113" strokeWidth="3"/>)}
          <circle cx={DX} cy={DY} r={DR-14} fill="#454d55"/><path d={`M${DX} ${DY-DR+9}L${DX-5.5} ${DY-6}H${DX+5.5}Z`} fill="#f8d23d"/><circle cx={DX} cy={DY} r="8" fill="#2a3036"/>
        </g>
      </g>
      {([['com',JACKS.com,'COM'],['vo',JACKS.vo,'VΩ'],['a10',JACKS.a10,'10 A']] as const).map(([id,j,name])=>{const plug=id==='com'?'black':(p.mode==='A'?id==='a10':id==='vo')?'red':null;return <g key={id}><circle cx={j.x} cy={j.y} r="17" fill="#23282c"/><circle cx={j.x} cy={j.y} r="10" fill={plug?(plug==='red'?'#c4262e':'#0b0d0e'):'#0b0d0e'} stroke={plug?'#fff':'#3d444b'} strokeWidth={plug?2:1}/><circle cx={j.x} cy={j.y} r="4" fill="#d6dbde" opacity={plug?1:.2}/><text x={j.x} y={j.y+33} textAnchor="middle" className="dmm-jack">{name}</text></g>;})}
    </svg>
    <output className="lab-sr-only" aria-label="Lectura del multímetro" aria-live="polite">{shown}</output>
    <div className="lab-dmm-tools">
      <button type="button" className="lab-dmm-zoom" aria-label="Achicar el multímetro" title={`Achicar el multímetro (${Math.round(scale*100)} %)`} disabled={scale<=SCALE.min} onClick={()=>setScale(scale-SCALE.step)}><ZoomOut size={15}/></button>
      <button type="button" className="lab-dmm-zoom" aria-label="Agrandar el multímetro" title={`Agrandar el multímetro (${Math.round(scale*100)} %)`} disabled={scale>=SCALE.max} onClick={()=>setScale(scale+SCALE.step)}><ZoomIn size={15}/></button>
      <label className="lab-dmm-place"><span className="lab-sr-only">Poner las puntas en</span><select aria-label="Poner las puntas en" value="" onChange={e=>{const s=p.shortcuts.find(x=>x.id===e.target.value);if(s)p.onShortcut(s);}}><option value="" disabled>{p.hasProbes?'Mover las puntas a…':'Poner las puntas en…'}</option>{p.shortcuts.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
      <button type="button" aria-label="Reducir el multímetro" title="Reducir el multímetro" onClick={()=>p.onCollapsed(true)}><Minimize2 size={15}/></button>
    </div>
  </div>;
}

/** Cables y puntas del multímetro sobre la placa. Cada cable es una cadena de puntos con peso y holgura (ver cords.ts) que se
 *  sigue la vista en vivo al desplazar o acercar la placa. Una cadena estable descansa hasta que se mueve uno de sus extremos. */
export type LeadFrame={jacks:[Pt,Pt];tips:[Pt,Pt]};
const PEN=[{d:{x:.42,y:-.91},color:'#c4262e',dark:'#7d1a20'},{d:{x:.7,y:-.71},color:'#2b3036',dark:'#0b0d0e'}];
const NODES=16;
export function MeterLeads({size,getFrame,snap,onGrab,onMove,onDrop}:{size:{w:number;h:number};getFrame:()=>LeadFrame|null;snap:Pt|null;onGrab:(which:0|1,e:ReactPointerEvent)=>void;onMove:(e:ReactPointerEvent)=>void;onDrop:(e:ReactPointerEvent)=>void}){
  const root=useRef<SVGSVGElement>(null),parts=useRef<Record<string,SVGElement|null>[]>([{},{}]),chains=useRef<(Chain|null)[]>([null,null]),frameRef=useRef(getFrame);frameRef.current=getFrame;
  useEffect(()=>{
    let raf=0,last=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const asleep=[false,false],still=[0,0],anchors:( {jack:Pt;tip:Pt}|null)[]=[null,null];
    const set=(el:SVGElement|null|undefined,name:string,value:string)=>{if(el&&el.getAttribute(name)!==value)el.setAttribute(name,value);};
    const draw=(now:number,followOnly=false)=>{
      const frame=frameRef.current(),steps=Math.min(3,Math.max(1,Math.round((now-last)/16.7)));last=now;
      for(let i=0;i<2;i++){
        const el=parts.current[i],group=el.group;
        if(!frame){if(group&&group.style.visibility!=='hidden')group.style.visibility='hidden';chains.current[i]=null;anchors[i]=null;asleep[i]=false;still[i]=0;continue;}
        if(group&&group.style.visibility!=='visible')group.style.visibility='visible';
        const o:CordOptions={...CORD_DEFAULTS,penDir:PEN[i].d,damping:reduced?.8:CORD_DEFAULTS.damping},jack=frame.jacks[i],tip=frame.tips[i];
        const previous=anchors[i],moved=!previous||Math.hypot(jack.x-previous.jack.x,jack.y-previous.jack.y,tip.x-previous.tip.x,tip.y-previous.tip.y)>.01;
        if(moved){asleep[i]=false;still[i]=0;anchors[i]={jack:{...jack},tip:{...tip}};}
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
          still[i]=!moved&&motion<.08?still[i]+1:0;asleep[i]=still[i]>=12;
        }
        chains.current[i]=chain;
        const n=chain.nodes,end=n[n.length-1],back=n[n.length-2],len=Math.hypot(back.x-end.x,back.y-end.y)||1,ux=(back.x-end.x)/len,uy=(back.y-end.y)/len,mid={x:end.x+ux*16,y:end.y+uy*16};
        const d=smoothPath(n.slice(0,n.length-1));
        for(const name of ['shadow','cord','shine'])set(el[name],'d',d);
        set(el.tip,'x1',String(end.x));set(el.tip,'y1',String(end.y));set(el.tip,'x2',String(mid.x));set(el.tip,'y2',String(mid.y));
        for(const name of ['body','grip']){set(el[name],'x1',String(mid.x));set(el[name],'y1',String(mid.y));set(el[name],'x2',String(back.x));set(el[name],'y2',String(back.y));}
        set(el.back,'cx',String(back.x));set(el.back,'cy',String(back.y));
        set(el.hit,'x1',String(end.x+ux*8));set(el.hit,'y1',String(end.y+uy*8));set(el.hit,'x2',String(back.x));set(el.hit,'y2',String(back.y));
      }
    };
    const tick=(now:number)=>{draw(now);raf=requestAnimationFrame(tick);};
    const board=root.current?.parentElement?.querySelector('.lab-board-svg');
    const observer=new MutationObserver(()=>draw(performance.now(),true));
    if(board)observer.observe(board,{attributes:true,attributeFilter:['viewBox']});
    raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  },[]);
  const ref=(i:number,name:string)=>(el:SVGElement|null)=>{parts.current[i][name]=el;};
  return <svg ref={root} className="lab-leads" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} role="group" aria-label="Cables y puntas del multímetro">
    {snap?<circle className="lab-lead-snap" cx={snap.x} cy={snap.y} r="12"/>:null}
    {([0,1] as const).map(i=>{const pen=PEN[i];return <g key={i} ref={ref(i,'group')} className={`lab-lead ${i===0?'red':'black'}`} style={{visibility:'hidden'}}>
      <path ref={ref(i,'shadow')} className="cord-shadow" transform="translate(2 3)"/><path ref={ref(i,'cord')} className="cord" stroke={pen.color}/><path ref={ref(i,'shine')} className="cord-shine"/>
      <line ref={ref(i,'tip')} className="pen-tip"/><line ref={ref(i,'body')} className="pen-body" stroke={pen.dark}/><line ref={ref(i,'grip')} className="pen-grip" stroke={pen.color}/><circle ref={ref(i,'back')} r="5" fill={pen.dark}/>
      <line ref={ref(i,'hit')} className="pen-hit" role="button" tabIndex={0} aria-label={`Punta ${i===0?'roja':'negra'}: arrastra hasta un orificio`} onPointerDown={e=>onGrab(i,e)} onPointerMove={onMove} onPointerUp={onDrop} onPointerCancel={onDrop}/>
    </g>;})}
  </svg>;
}
