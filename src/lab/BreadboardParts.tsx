import {memo} from 'react';
import {HOLES,IC_PIN_NAMES,type ProtoComponent,type ProtoKind} from './model';
import type {IcState} from './dc';
import {resistorBands} from './units';
import type {Point} from './labels';

const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
/** Placa con relieve, rieles partidos y marcas de polaridad. Es solo dibujo: los orificios son interactivos aparte. */
export const BoardArt=memo(function BoardArt(){
  return <g aria-hidden="true">
    <defs>
      <linearGradient id="lab-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbfaf5"/><stop offset=".55" stopColor="#f4f1e8"/><stop offset="1" stopColor="#e9e5d9"/></linearGradient>
      <filter id="lab-board-shadow" x="-8%" width="116%" y="-8%" height="130%"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#35465a" floodOpacity=".22"/></filter>
      <linearGradient id="lab-can" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe4e8"/><stop offset=".5" stopColor="#aeb7bf"/><stop offset="1" stopColor="#7d8791"/></linearGradient>
      <radialGradient id="lab-dome" cx=".38" cy=".32" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".75"/><stop offset=".35" stopColor="#fff" stopOpacity=".12"/><stop offset="1" stopColor="#000" stopOpacity=".22"/></radialGradient>
      <filter id="lab-led-glow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <rect x="15" y="25" width="780" height="395" rx="21" fill="url(#lab-plate)" stroke="#cfcdc2" strokeWidth="1.4" filter="url(#lab-board-shadow)"/>
    <rect x="17" y="27" width="776" height="391" rx="19" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".85"/>
    <rect x="28" y="32" width="754" height="81" rx="8" fill="#ebe8de"/><rect x="28" y="347" width="754" height="63" rx="8" fill="#ebe8de"/>
    <rect x="28" y="221" width="754" height="31" rx="5" fill="#dcdcd4"/><path d="M30 235H780" stroke="#bbbcb3" strokeWidth="2"/>
    {[45,349].map(y=><g key={y}><path d={`M44 ${y}H395 M427 ${y}H764`} stroke="#d44e52" strokeWidth="2"/><path d={`M44 ${y+52}H395 M427 ${y+52}H764`} stroke="#3c82af" strokeWidth="2"/></g>)}
    {[62,366].map(y=><g key={y} className="lab-rail-sign"><text x="39" y={y+4} textAnchor="middle" fill="#c4474b">+</text><text x="39" y={y+28} textAnchor="middle" fill="#3a78a3">−</text></g>)}
    {[0,1,2,3,4,5,6,7,8,9].map(i=><text key={i} x="35" y={138+i*20+(i>=5?35:0)} className="lab-hole-label">{'abcdefghij'[i]}</text>)}
    {Array.from({length:30},(_,i)=><text key={i} x={55+i*24} y="125" textAnchor="middle" className="lab-hole-number">{i+1}</text>)}
    <text x="405" y="452" textAnchor="middle" className="lab-sheet-caption">a–e CONECTADOS POR COLUMNA · f–j CONECTADOS POR COLUMNA · RIELES PARTIDOS EN 15 / 16</text>
  </g>;
});

type ShapeProps={c:ProtoComponent;a:Point;b:Point;current:number;closed:boolean;previewValue:number|null;straight?:boolean};
/** Cuerpo del componente. No contiene texto: los valores se rotulan aparte para que se mantengan horizontales. */
export function ComponentShape({c,a,b,current,closed,previewValue,straight}:ShapeProps){
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx)*180/Math.PI,cos=dx/dist,sin=dy/dist;
  if(c.kind==='wire'){
    const top=Math.min(a.y,b.y)-35,d=straight?`M${a.x} ${a.y} L${b.x} ${b.y}`:`M${a.x} ${a.y} C${a.x} ${top} ${b.x} ${top} ${b.x} ${b.y}`;
    return <g><path d={d} stroke="#10202a" strokeOpacity=".16" strokeWidth="8" fill="none" strokeLinecap="round" transform="translate(0 2)"/><path d={d} stroke={c.color} strokeWidth="5" fill="none" strokeLinecap="round"/><path d={d} stroke="#fff" strokeOpacity=".28" strokeWidth="1.4" fill="none" strokeLinecap="round" transform="translate(0 -1.4)"/></g>;
  }
  const legs=<><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6f7a7e" strokeOpacity=".22" strokeWidth="5" strokeLinecap="round" transform="translate(0 1.6)"/><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/></>;
  if(c.kind==='resistor'){
    const value=previewValue??c.value,bands=resistorBands(value),length=clamp(dist-14,24,50);
    return <g>{legs}<g transform={`translate(${mx} ${my}) rotate(${angle})`}>
      <rect x={-length/2} y="-7.5" width={length} height="15" rx="6.5" fill={bands?'#e4cf9f':'#dcd8cb'} stroke={previewValue!==null?'#2a7fa6':'#9e8a5e'} strokeWidth="1.3" strokeDasharray={previewValue!==null?'3 2':undefined}/>
      {bands?bands.map((color,i)=><rect key={i} x={-length*.27+i*length*.19-1.7} y="-7.5" width="3.6" height="15" fill={color}/>):<path d={`M${-length*.28} 0H${length*.28}`} stroke="#a79f89" strokeWidth="1.2" strokeDasharray="2 3"/>}
      <rect x={-length/2} y="-7.5" width={length} height="6" rx="3" fill="#fff" opacity=".22"/>
    </g></g>;
  }
  if(c.kind==='led'){
    const lit=current>.0001,hot=current>.02,fill=lit?c.color:'#d6d7cf',dome=(x:number)=>({x:mx+cos*x,y:my+sin*x});
    const plus=dome(-3.4),minus=dome(3.8);
    return <g>{legs}{lit?<circle cx={mx} cy={my} r="15" fill={c.color} opacity={.5} filter="url(#lab-led-glow)"/>:null}
      <g transform={`translate(${mx} ${my}) rotate(${angle})`}><circle r="12.6" fill="#0d1215" opacity=".14" transform="translate(0 1.4)"/><path d="M12.4 -9.5V9.5" stroke="#434a4d" strokeWidth="2.8" strokeLinecap="round"/><circle r="11.8" fill={lit?c.color:'#e7e8e2'} fillOpacity=".55" stroke="#8b9498" strokeWidth=".9"/><circle r="10" fill={fill} stroke={hot?'#bf2d34':c.color} strokeWidth="1.6"/><circle r="4.2" fill="#fff" opacity={lit?.55:.28}/><circle r="10" fill="url(#lab-dome)"/></g>
      <text x={plus.x} y={plus.y+3.4} textAnchor="middle" className="lab-led-sign">+</text><text x={minus.x} y={minus.y+3.4} textAnchor="middle" className="lab-led-sign">−</text></g>;
  }
  if(c.kind==='diode'){
    const length=clamp(dist-14,22,36);
    return <g>{legs}<g transform={`translate(${mx} ${my}) rotate(${angle})`}><rect x={-length/2} y="-5.5" width={length} height="11" rx="3.5" fill="#1d2023" stroke="#0b0d0e" strokeWidth="1"/><rect x={length/2-8} y="-5.5" width="5" height="11" fill="#d3d9dc"/><rect x={-length/2+2} y="-4" width={length-14} height="2.4" rx="1.2" fill="#fff" opacity=".22"/></g></g>;
  }
  if(c.kind==='bjt'){
    const bx=(a.x+b.x)/2,yb=my-12,letters=a.x<b.x?['E','B','C']:['C','B','E'],xs=[a.x,bx,b.x],tops=xs.map(x=>bx+(x-bx)*.4);
    return <g>{xs.map((x,i)=><g key={i}><line x1={x} y1={my} x2={tops[i]} y2={yb+1} stroke="#6f7a7e" strokeOpacity=".25" strokeWidth="4.6" strokeLinecap="round" transform="translate(0 1.5)"/><line x1={x} y1={my} x2={tops[i]} y2={yb+1} stroke="#aab2b6" strokeWidth="2.4" strokeLinecap="round"/><circle cx={x} cy={my} r="3" fill="#3e4342"/></g>)}
      <path d={`M${bx-13} ${yb}V${yb-8}A13 13 0 0 1 ${bx+13} ${yb-8}V${yb}Z`} fill="#202428" stroke="#0b0d0e" strokeWidth="1.2"/>
      <path d={`M${bx-13} ${yb}V${yb-8}A13 13 0 0 1 ${bx-3} ${yb-20}`} fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round"/>
      <rect x={bx-13} y={yb-3} width="26" height="3" fill="#0b0d0e" opacity=".5"/>
      <text x={bx} y={yb-9} textAnchor="middle" className="lab-bjt-name">{c.polarity==='pnp'?'2N2907':'2N2222'}</text>
      {letters.map((l,i)=><text key={i} x={bx+(i-1)*8.5} y={yb-1} textAnchor="middle" className="lab-bjt-pins">{l}</text>)}</g>;
  }
  if(c.kind==='button'){
    return <g>{legs}<g transform={`translate(${mx} ${my}) rotate(${angle})`}><rect x="-13" y="-12" width="26" height="24" rx="3.5" fill="#2f353a" stroke="#14181b" strokeWidth="1"/><rect x="-13" y="-12" width="26" height="6" rx="3" fill="#fff" opacity=".1"/>{[[-10,-9],[10,-9],[-10,9],[10,9]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="1.5" fill="#b9c0c4"/>)}<circle cx={closed?.8:0} cy={closed?.8:0} r={closed?8:9.2} fill="#8c969c" stroke="#5c666c" strokeWidth="1"/><circle cx={closed?.8:0} cy={closed?.8:0} r={closed?6.2:7.4} fill={closed?'#a92d2d':c.color} stroke="#7d1f1f" strokeWidth="1"/><ellipse cx="-2.2" cy="-2.8" rx="2.8" ry="1.8" fill="#fff" opacity={closed?.15:.45}/></g></g>;
  }
  if(c.kind==='motor'){
    const turning=Math.abs(current)>1e-4,sign=current>=0?1:-1;
    return <g>{legs}<g transform={`translate(${mx} ${my}) rotate(${angle})`}><rect x="-22" y="-9" width="6" height="3.6" rx="1" fill="#c4cacd"/><rect x="-22" y="5.4" width="6" height="3.6" rx="1" fill="#c4cacd"/><rect x="-17" y="-12.5" width="30" height="25" rx="5" fill="url(#lab-can)" stroke="#55606a" strokeWidth="1.2"/><rect x="13" y="-12.5" width="7" height="25" rx="2" fill="#5d6770" stroke="#3d454c" strokeWidth=".8"/><rect x="20" y="-3" width="9" height="6" rx="2" fill="#d5dade" stroke="#8b949b" strokeWidth=".8"/><path d="M-12 -7h18M-12 -3.5h18M-12 0h18M-12 3.5h18M-12 7h18" stroke="#6f7a83" strokeOpacity=".35" strokeWidth=".8"/><g transform={`rotate(${-angle})`}><circle r="7" fill="#f3f5f6" stroke="#6f7a83" strokeWidth=".9"/><text y="3.4" textAnchor="middle" className="lab-motor-m">M</text></g></g>
      {turning?<g transform={`translate(${mx} ${my})`}><g className="lab-motor-spin" style={{transformOrigin:'0 0',animationDirection:sign>0?'normal':'reverse'}}><path d="M0 -22A22 22 0 1 1 -19 -11" fill="none" stroke="#1599dc" strokeWidth="2.4" strokeLinecap="round"/><path d="M-23 -14L-19 -9L-14 -14Z" fill="#1599dc"/></g></g>:null}</g>;
  }
  const length=clamp(dist-12,28,42);
  return <g>{legs}<g transform={`translate(${mx} ${my}) rotate(${angle})`}><rect x={-length/2} y="-11" width={length} height="22" rx="5.5" fill={closed?'#0f766e':'#69757a'} stroke="#1c2b2f" strokeOpacity=".35"/><rect x={closed?length/2-17:-length/2+4} y="-7" width="13" height="14" rx="3" fill="#fff"/><circle cx={-length/2} cy="0" r="2.6" fill="#2d3739"/><circle cx={length/2} cy="0" r="2.6" fill="#2d3739"/></g></g>;
}

/** Ilustración reconocible de cada pieza (icono de dock, bandeja móvil y biblioteca). */
export function PartIcon({kind,size=40}:{kind:ProtoKind|'pnp';size?:number}){
  const bands=resistorBands(1000)!;
  return <svg className="lab-part-icon" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    {kind==='wire'?<><path d="M9 33C9 9 39 9 39 33" fill="none" stroke="#0b4f4a" strokeOpacity=".25" strokeWidth="7" strokeLinecap="round" transform="translate(0 1.5)"/><path d="M9 33C9 9 39 9 39 33" fill="none" stroke="#0f766e" strokeWidth="5" strokeLinecap="round"/><path d="M12 27C14 15 34 14 36 27" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="35" r="4.2" fill="#3e4342"/><circle cx="39" cy="35" r="4.2" fill="#3e4342"/><circle cx="9" cy="35" r="1.6" fill="#c9cfd2"/><circle cx="39" cy="35" r="1.6" fill="#c9cfd2"/></>:null}
    {kind==='resistor'?<><line x1="3" y1="24" x2="45" y2="24" stroke="#9ba4a8" strokeWidth="3" strokeLinecap="round"/><rect x="10" y="14" width="28" height="20" rx="10" fill="#e4cf9f" stroke="#9e8a5e" strokeWidth="1.6"/>{bands.map((c,i)=><rect key={i} x={16+i*6.2} y="14.4" width="3.8" height="19.2" fill={c}/>)}<rect x="12" y="15.5" width="24" height="6" rx="3" fill="#fff" opacity=".25"/></>:null}
    {kind==='led'?<><line x1="19" y1="31" x2="19" y2="46" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><line x1="29" y1="31" x2="29" y2="41" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><path d="M13 30V19a11 11 0 0 1 22 0v11z" fill="#d94848" stroke="#a92d2d" strokeWidth="1.6"/><rect x="11" y="28" width="26" height="5" rx="2" fill="#b83a3a"/><ellipse cx="19" cy="15" rx="3.4" ry="5.2" fill="#fff" opacity=".55" transform="rotate(-12 19 15)"/><path d="M38 9l4-3M41 15l5-1" stroke="#e9a13b" strokeWidth="2" strokeLinecap="round"/></>:null}
    {kind==='diode'?<><line x1="3" y1="24" x2="45" y2="24" stroke="#9ba4a8" strokeWidth="3" strokeLinecap="round"/><rect x="10" y="17" width="28" height="14" rx="5" fill="#1d2023" stroke="#0b0d0e" strokeWidth="1.4"/><rect x="31" y="17" width="6" height="14" fill="#d3d9dc"/><rect x="13" y="19.5" width="15" height="3" rx="1.5" fill="#fff" opacity=".25"/></>:null}
    {kind==='bjt'||kind==='pnp'?<><line x1="15" y1="28" x2="15" y2="46" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><line x1="24" y1="28" x2="24" y2="46" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><line x1="33" y1="28" x2="33" y2="46" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><path d="M8 30V20a16 16 0 0 1 32 0V30Z" fill="#202428" stroke="#0b0d0e" strokeWidth="1.4"/><path d="M9 29V20a15 15 0 0 1 8-13" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round"/><text x="24" y="22" textAnchor="middle" fontSize="7" fontWeight="800" fill="#e5e9ec">{kind==='pnp'?'2N2907':'2N2222'}</text></>:null}
    {kind==='button'?<><line x1="15" y1="33" x2="15" y2="45" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><line x1="33" y1="33" x2="33" y2="45" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><rect x="7" y="12" width="34" height="22" rx="5" fill="#59636b" stroke="#2a3238" strokeWidth="1.4"/><circle cx="24" cy="23" r="9.5" fill="#d94848" stroke="#7d1f1f" strokeWidth="1.6"/><ellipse cx="21" cy="19" rx="3.6" ry="2.2" fill="#fff" opacity=".5"/></>:null}
    {kind==='motor'?<><line x1="3" y1="24" x2="10" y2="24" stroke="#9ba4a8" strokeWidth="3" strokeLinecap="round"/><line x1="38" y1="24" x2="45" y2="24" stroke="#9ba4a8" strokeWidth="3" strokeLinecap="round"/><circle cx="24" cy="24" r="14.5" fill="#6b7280" stroke="#2f363d" strokeWidth="1.8"/><circle cx="24" cy="24" r="10.5" fill="#9aa3ad"/><text x="24" y="29" textAnchor="middle" fontSize="14" fontWeight="800" fill="#2f363d">M</text><path d="M24 4A20 20 0 0 1 43 18" fill="none" stroke="#1599dc" strokeWidth="2.6" strokeLinecap="round"/><path d="M38 12l6 6-8 1.4z" fill="#1599dc"/></>:null}
    {kind==='l293d'?<><rect x="9" y="8" width="30" height="32" rx="3" fill="#2b3035" stroke="#12161a" strokeWidth="1.4"/><path d="M19 8a5 5 0 0 0 10 0z" fill="#dcdcd4"/>{[14,22,30,38].map(y=><g key={y}><rect x="3" y={y-10+8} width="7" height="3.4" rx="1" fill="#c4cacd"/><rect x="38" y={y-10+8} width="7" height="3.4" rx="1" fill="#c4cacd"/></g>)}<text x="24" y="30" textAnchor="middle" fontSize="8" fontWeight="800" fill="#cfd5d9">L293D</text></>:null}
    {kind==='switch'?<><rect x="5" y="12" width="38" height="22" rx="6" fill="#0f766e" stroke="#0b4f4a" strokeWidth="1.4"/><rect x="10" y="18" width="28" height="10" rx="4" fill="#0b4f4a"/><rect x="24" y="14.5" width="13" height="17" rx="3.5" fill="#fff" stroke="#c8d2d6"/><path d="M28 19v8M32 19v8" stroke="#c8d2d6" strokeWidth="1.2"/><line x1="15" y1="34" x2="15" y2="45" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/><line x1="33" y1="34" x2="33" y2="45" stroke="#9ba4a8" strokeWidth="2.6" strokeLinecap="round"/></>:null}
  </svg>;
}

/** L293D (DIP-16): cuerpo sobre el canal central; los pines salen en los orificios e (9–16) y f (1–8). */
export function IcShape({a,b,state}:{a:Point;b:Point;state?:IcState}){
  const x0=a.x-11,x1=b.x+11,top=b.y+8,bottom=a.y-8,mid=(top+bottom)/2,levels=state?.pins;
  const color=(i:number)=>{const l=levels?.[i]?.level;return l==='high'?'#e0453a':l==='low'?'#3c82af':l==='off'?'#7c858c':null;};
  const holes=Array.from({length:16},(_,i)=>i<8?{x:a.x+i*24,y:a.y,i}:{x:b.x-(i-8)*24,y:b.y,i});
  return <g>
    <rect x={x0} y={top+2} width={x1-x0} height={bottom-top} rx="3" fill="#10202a" opacity=".22"/>
    {holes.map(h=><rect key={h.i} x={h.x-2.6} y={h.i<8?bottom-1:top-9} width="5.2" height="10" rx="1.4" fill="#c4cacd" stroke="#8b9397" strokeWidth=".6"/>)}
    <rect x={x0} y={top} width={x1-x0} height={bottom-top} rx="3" fill="#2b3035" stroke="#12161a" strokeWidth="1.2"/>
    <rect x={x0+1.5} y={top+1.5} width={x1-x0-3} height="5" rx="2" fill="#fff" opacity=".08"/>
    <path d={`M${x0} ${mid-5.5}a5.5 5.5 0 0 1 0 11`} fill="#dcdcd4" stroke="#12161a" strokeWidth="1"/>
    <text x={(x0+x1)/2} y={mid+4} textAnchor="middle" className="lab-ic-name">L293D</text>
    {holes.map(h=><text key={`n${h.i}`} x={h.x} y={h.i<8?bottom-3.5:top+8} textAnchor="middle" className="lab-ic-pin">{IC_PIN_NAMES[h.i]}</text>)}
    {holes.map(h=>{const fill=color(h.i);return fill?<circle key={`d${h.i}`} cx={h.x} cy={h.y} r="3.6" fill={fill} stroke="#fff" strokeWidth="1"/>:null;})}
  </g>;
}

/** Vista de rayos X: las láminas metálicas bajo cada grupo de orificios (columnas de cinco y rieles partidos). */
export const BoardStrips=memo(function BoardStrips(){
  const groups=new Map<string,{x0:number;x1:number;y0:number;y1:number;rail:boolean}>();
  for(const h of HOLES){const g=groups.get(h.group),rail=/^(top|bottom)/.test(h.group);if(!g)groups.set(h.group,{x0:h.x,x1:h.x,y0:h.y,y1:h.y,rail});else{g.x0=Math.min(g.x0,h.x);g.x1=Math.max(g.x1,h.x);g.y0=Math.min(g.y0,h.y);g.y1=Math.max(g.y1,h.y);}}
  return <g className="lab-strips" aria-hidden="true" pointerEvents="none">{[...groups].map(([id,g])=><rect key={id} x={g.x0-5.5} y={g.y0-5.5} width={g.x1-g.x0+11} height={g.y1-g.y0+11} rx="5.5" className={g.rail?'rail':'column'}/>)}</g>;
});

/** Pieza quemada: carbonizada, con grietas y humo. */
export function BurntMark({a,b,kind}:{a:Point;b:Point;kind:ProtoKind}){
  const x=kind==='l293d'?(a.x+b.x)/2:kind==='bjt'?(a.x+b.x)/2:(a.x+b.x)/2,y=kind==='l293d'?(a.y+b.y)/2:kind==='bjt'?a.y-20:(a.y+b.y)/2,w=kind==='l293d'?(b.x-a.x)/2+14:kind==='bjt'?15:17,h=kind==='l293d'?(a.y-b.y)/2-2:kind==='bjt'?15:13;
  return <g className="lab-burnt" pointerEvents="none"><rect x={x-w} y={y-h} width={w*2} height={h*2} rx="6" fill="#171210" opacity=".78"/><path d={`M${x-w*.6} ${y-h*.7}L${x-w*.1} ${y}L${x-w*.5} ${y+h*.7}M${x+w*.3} ${y-h*.8}L${x+w*.6} ${y+h*.2}`} stroke="#5b3a2b" strokeWidth="1.4" fill="none" strokeLinecap="round"/><text x={x} y={y+4} textAnchor="middle" className="lab-burnt-x">✕</text>
    {[0,1,2].map(i=><circle key={i} className="lab-smoke" cx={x-6+i*6} cy={y-h-2} r={4+i} style={{animationDelay:`${i*.6}s`}}/>)}</g>;
}
