import type {CadeFrame,CadeObject} from '../data/cade';
/* Símbolos al estilo de CADe_SIMU, dibujados con las proporciones medidas sobre la fotografía de «CAMBIO DELTA, ESTRELLA».
 * Cada símbolo se dibuja respecto a su borne superior; los bornes reales vienen en los datos (`ports`). */
const W=.55,TEXT='Arial, Helvetica, sans-serif';
const S={stroke:'currentColor',strokeWidth:W,fill:'none'} as const;
function T({x,y,children,anchor='start',size=2.9,bold=false}:{x:number;y:number;children:React.ReactNode;anchor?:'start'|'middle'|'end';size?:number;bold?:boolean}){
 return <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontFamily={TEXT} fontWeight={bold?700:400} fill="currentColor" stroke="none">{children}</text>;
}
/** Polo de potencia: vástago superior, cuchilla con marca de accionamiento y vástago inferior. */
function PowerPole({x,y}:{x:number;y:number}){return <path {...S} d={`M${x} ${y} V${y+5.6} M${x-4.3} ${y+5.9} L${x} ${y+13.2} M${x-4} ${y+9.4} H${x} M${x} ${y+13.2} V${y+18}`}/>}
function ContactNO({x,y}:{x:number;y:number}){return <path {...S} d={`M${x} ${y} V${y+4.2} M${x-4.7} ${y+5.3} L${x} ${y+12.3} M${x} ${y+12.3} V${y+18}`}/>}
function ContactNC({x,y}:{x:number;y:number}){return <path {...S} d={`M${x} ${y} V${y+5.2} H${x+4.4} L${x} ${y+11.6} M${x} ${y+11.6} V${y+18}`}/>}
/** Actuador de pulsador: «[» con línea discontinua hacia la cuchilla. */
function Push({x,y,to}:{x:number;y:number;to:number}){return <><path {...S} d={`M${x-6.8} ${y+6.5} H${x-8.8} V${y+10.9} H${x-6.8} M${x-8.8} ${y+8.7} H${x-7.2}`}/><path {...S} strokeWidth={.4} strokeDasharray="1.1 .9" d={`M${x-5.8} ${y+8.7} H${to}`}/></>}
/** Accionamiento temporizado (retardo a la conexión): doble trazo desde la cuchilla hasta un arco «(», como en IEC 60617. */
function Delay({x,y,from}:{x:number;y:number;from:number}){return <path {...S} strokeWidth={.45} d={`M${from} ${y+8} H${x-10.2} M${from} ${y+9.6} H${x-10.2} M${x-9.4} ${y+4.4} Q${x-12.8} ${y+8.8} ${x-9.4} ${y+13.2}`}/>}
const labels2=(x:number,y:number,a:string,b:string)=><><T x={x+2.4} y={y+3.4}>{a}</T><T x={x+2.4} y={y+15.2}>{b}</T></>;
export function CadeShape({o}:{o:CadeObject}){
 const {x,y,reference,labels}=o,t=(i:number)=>labels[i]??'';
 switch(o.shape){
  case 'terminal-round':{
   const pins=o.pins??[];
   return <>{pins.map((p,i)=><g key={p}><circle cx={x+9*i} cy={y} r={1.9} fill="white" stroke="currentColor" strokeWidth={W}/><path {...S} strokeWidth={.45} d={`M${x+9*i} ${y-1.1} L${x+9*i+1.1} ${y} L${x+9*i} ${y+1.1} L${x+9*i-1.1} ${y} Z`}/><T x={x+9*i-1.6} y={y-4.2}>{p}</T></g>)}<T x={x-4.2} y={y+1.1} anchor="end" bold>{reference}</T></>;
  }
  case 'terminal-diamond':
   return <><path d={`M${x} ${y-1.9} L${x+1.9} ${y} L${x} ${y+1.9} L${x-1.9} ${y} Z`} fill="white" stroke="currentColor" strokeWidth={W}/><T x={x-.6} y={y-4.2} bold anchor="middle">{o.pins?.[0]}</T>{o.ref&&<T x={x-3.8} y={y+1.1} anchor="end" bold>{reference}</T>}</>;
  case 'breaker3':{
   return <>
    {[0,1,2].map(i=>{const xi=x+9*i;return <g key={i}>
     <path {...S} d={`M${xi} ${y} V${y+2.6} M${xi-4.6} ${y+2.8} L${xi} ${y+12.6} M${xi-4.4} ${y+7} H${xi} M${xi} ${y+12.6} V${y+15}`}/>
     <path {...S} d={`M${xi} ${y+15} V${y+24}`}/><path {...S} strokeWidth={.5} d={`M${xi} ${y+17.2} H${xi+2.6} V${y+19.3} H${xi}`}/>
     <T x={xi+1.2} y={y+21.9} size={3.3} bold>I&gt;</T>
     <T x={xi+2.3} y={y-.3}>{t(i)}</T><T x={xi+2.3} y={y+27.2}>{t(i+3)}</T></g>})}
    <rect x={x-4.5} y={y+15} width={27.6} height={9} {...S}/><path {...S} d={`M${x+4.7} ${y+15} V${y+24} M${x+13.9} ${y+15} V${y+24} M${x-4.5} ${y+19.5} H${x+23.1}`}/>
    <rect x={x-12.4} y={y+3.4} width={7.2} height={6.2} {...S}/><path {...S} d={`M${x-12.4} ${y+6.5} H${x-5.2} M${x-8.8} ${y+3.4} V${y+9.6} M${x-15.2} ${y+3.4} V${y+9.6} M${x-15.2} ${y+6.5} H${x-12.4}`}/>
    <path {...S} strokeWidth={.4} strokeDasharray="1.1 1" d={`M${x-9} ${y+9.6} V${y+21.5} M${x-9} ${y+17.5} H${x-4.5} M${x-9} ${y+21.5} H${x-4.5}`}/>
    <T x={x-17.6} y={y+6.4} anchor="end" bold>{reference}</T></>;
  }
  case 'contactor3':{
   const p=o.pitch??9;
   return <>{[0,1,2].map(i=><g key={i}><PowerPole x={x+p*i} y={y}/><T x={x+p*i+2.3} y={y+3.4}>{t(i)}</T><T x={x+p*i+2.3} y={y+15.4}>{t(i+3)}</T></g>)}<T x={x-5} y={y+8.6} anchor="end" bold>{reference}</T></>;
  }
  case 'thermal3':
   return <>{[0,1,2].map(i=>{const xi=x+9*i;return <g key={i}><path {...S} d={`M${xi} ${y} V${y+2.5} H${xi+4.5} V${y+6} H${xi} V${y+9}`}/><T x={xi+2.3} y={y-2.4}>{t(i)}</T><T x={xi+2.3} y={y+11.6}>{t(i+3)}</T></g>})}<rect x={x-3} y={y} width={25.5} height={9} {...S}/><T x={x-6.4} y={y+5} anchor="end" bold>{reference}</T></>;
  case 'motor':{
   return <><circle cx={x} cy={y} r={12} fill="white" stroke="currentColor" strokeWidth={.6}/>
    <T x={x} y={y-4.2} anchor="middle" size={3.2} bold>M</T><T x={x-6.5} y={y+3.9} anchor="middle" size={3}>3</T><path {...S} strokeWidth={.45} d={`M${x+1} ${y+4} q1.6 -2.6 3.2 0 t3.2 0`}/>
    {o.ports?.slice(0,3).map(p=><T key={p.terminal} x={p.x+1.6} y={y-14} >{p.terminal}</T>)}
    {o.ports?.slice(3,6).map(p=><T key={p.terminal} x={p.x+1.2} y={y+15} >{p.terminal}</T>)}
    <path {...S} strokeWidth={.9} d={`M${x+11.7} ${y-2.7} V${y+2.7}`}/><T x={x+18.4} y={y-14}>PE</T><T x={x-14} y={y+1.5} anchor="end" bold>{reference}</T></>;
  }
  case 'breaker1':
   return <><path {...S} d={`M${x} ${y} V${y+5.2} M${x-5} ${y+5.2} L${x} ${y+13.7} M${x} ${y+13.7} V${y+18} M${x} ${y+18} V${y+25.5}`}/>
    <rect x={x-4.5} y={y+18} width={9} height={7.5} {...S}/><path {...S} d={`M${x-4.5} ${y+21.9} H${x+4.5}`}/><path {...S} strokeWidth={.5} d={`M${x+.6} ${y+19.8} H${x+3.3} V${y+21.9} H${x+.6}`}/><T x={x+.9} y={y+23.9} size={2.3}>I&gt;</T>
    <rect x={x-12.1} y={y+6.6} width={6.4} height={5.7} {...S}/><path {...S} d={`M${x-12.1} ${y+9.45} H${x-5.7} M${x-8.9} ${y+6.6} V${y+12.3} M${x-14.3} ${y+6.6} V${y+12.3} M${x-14.3} ${y+9.45} H${x-12.1}`}/>
    <path {...S} strokeWidth={.4} strokeDasharray="1.1 1" d={`M${x-5.7} ${y+9.45} H${x-2.4} M${x-9.3} ${y+12.3} V${y+23} M${x-9.3} ${y+19} H${x-4.5} M${x-9.3} ${y+23} H${x-4.5}`}/>
    <T x={x+2.6} y={y+3.8}>{t(0)}</T><T x={x+2.6} y={y+27.7}>{t(1)}</T><T x={x-16.8} y={y+9.8} anchor="end" bold>{reference}</T></>;
  case 'f1aux':
   return <><ContactNC x={x} y={y}/><ContactNO x={x+13.5} y={y}/>
    <path {...S} d={`M${x-8.9} ${y+10.5} V${y+8.6} H${x-7.1} V${y+10.5}`}/><path {...S} d={`M${x+18.8} ${y+6.8} H${x+20.9} V${y+10} H${x+18.8}`}/>
    <path {...S} strokeWidth={.4} strokeDasharray="1.1 .9" d={`M${x-6} ${y+9.4} H${x+17.8}`}/>
    {labels2(x,y,t(0),t(1))}{labels2(x+13.5,y,t(2),t(3))}<T x={x-11.8} y={y+9.4} anchor="end" bold>{reference}</T></>;
  case 'push-nc': return <><ContactNC x={x} y={y}/><Push x={x} y={y} to={x+1.2}/>{labels2(x,y,t(0),t(1))}<T x={x-10.6} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'push-no': return <><ContactNO x={x} y={y}/><Push x={x} y={y} to={x-2.4}/>{labels2(x,y,t(0),t(1))}<T x={x-10.6} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'contact-no': return <><ContactNO x={x} y={y}/>{labels2(x,y,t(0),t(1))}<T x={x-6.4} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'contact-nc': return <><ContactNC x={x} y={y}/>{labels2(x,y,t(0),t(1))}<T x={x-6.8} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'double-push':
   return <><ContactNC x={x} y={y}/><ContactNO x={x+13} y={y}/><Push x={x} y={y} to={x+10.7}/>{labels2(x,y,t(0),t(1))}{labels2(x+13,y,t(2),t(3))}<T x={x-10.6} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'contact-nc-timed': return <><ContactNC x={x} y={y}/><Delay x={x} y={y} from={x+1.9}/>{labels2(x,y,t(0),t(1))}<T x={x-13.6} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'contact-no-timed': return <><ContactNO x={x} y={y}/><Delay x={x} y={y} from={x-2.4}/>{labels2(x,y,t(0),t(1))}<T x={x-13.6} y={y+9} anchor="end" bold>{reference}</T></>;
  case 'coil-timer':
   return <><path {...S} d={`M${x} ${y} V${y+6} M${x} ${y+12} V${y+18}`}/><rect x={x-6} y={y+6.25} width={12} height={5.5} {...S}/><rect x={x-10.4} y={y+6.25} width={4.4} height={5.5} {...S}/><path {...S} d={`M${x-10.4} ${y+6.25} L${x-6} ${y+11.75} M${x-6} ${y+6.25} L${x-10.4} ${y+11.75}`}/>{labels2(x,y,t(0),t(1))}<T x={x-13.4} y={y+9.4} anchor="end" bold>{reference}</T></>;
  case 'coil':
   return <><path {...S} d={`M${x} ${y} V${y+6} M${x} ${y+12} V${y+18}`}/><rect x={x-6} y={y+6.25} width={12} height={5.5} {...S}/>{labels2(x,y,t(0),t(1))}<T x={x-9} y={y+9.4} anchor="end" bold>{reference}</T></>;
  case 'lamp':
   return <><path {...S} d={`M${x} ${y} V${y+4.5} M${x} ${y+13.5} V${y+18}`}/><circle cx={x} cy={y+9} r={4.5} fill="white" stroke="currentColor" strokeWidth={W}/><path {...S} d={`M${x-3.2} ${y+5.8} L${x+3.2} ${y+12.2} M${x+3.2} ${y+5.8} L${x-3.2} ${y+12.2}`}/><T x={x+3.7} y={y+3.4}>{t(0)}</T><T x={x+3.7} y={y+15.6}>{t(1)}</T><T x={x-8.6} y={y+9.8} anchor="end" bold>{reference}</T></>;
  default: return null;
 }
}
/** Marco de la hoja: banda de columnas (A–H) y banda de filas numeradas, como en CADe. */
export function CadeSheetFrame({frame:f}:{frame:CadeFrame}){
 const cols=f.columns.letters.split(''),rows=Array.from({length:f.rows.count},(_,i)=>i);
 return <g stroke="currentColor" strokeWidth={.5} fill="none" color="#3c4650">
  <rect x={f.left} y={f.top} width={f.right-f.left} height={f.bottom-f.top}/>
  <rect x={f.left+f.band} y={f.top+f.header} width={f.right-f.left-2*f.band} height={f.bottom-f.top-f.header-f.band}/>
  {cols.slice(1).map((_,i)=><path key={i} d={`M${f.columns.first+f.columns.width*(i+1)} ${f.top} V${f.top+f.header}`}/>)}
  {rows.slice(1).map(i=><path key={i} d={`M${f.left} ${f.rows.first+f.rows.height*i} H${f.left+f.band} M${f.right-f.band} ${f.rows.first+f.rows.height*i} H${f.right}`}/>)}
  {cols.map((c,i)=><T key={c} x={f.columns.first+f.columns.width*(i+.5)} y={f.top+f.header*.55} anchor="middle" size={3.3}>{c}</T>)}
  {rows.map(i=><g key={i}><T x={f.left+f.band/2} y={f.rows.first+f.rows.height*(i+.5)} anchor="middle" size={3}>{i+1}</T><T x={f.right-f.band/2} y={f.rows.first+f.rows.height*(i+.5)} anchor="middle" size={3}>{i+1}</T></g>)}
 </g>;
}
