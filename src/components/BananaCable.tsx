import type {Point} from '../data/practice';
import {BANANA_COLOR} from '../data/practice';
import {cablePath} from '../data/wiring';

/** Aclara (amount>0) u oscurece (amount<0) un color #rrggbb; resultado de dibujo, sin efecto eléctrico. */
function shade(hex:string,amount:number){
 const n=parseInt(hex.slice(1),16),mix=(c:number)=>Math.round(amount>=0?c+(255-c)*amount:c*(1+amount));
 return `rgb(${mix(n>>16&255)},${mix(n>>8&255)},${mix(n&255)})`;
}
/** Clavija banana apilable de 4 mm vista de frente al panel, como en el laboratorio: un bloque corto y redondeado que tapa el borne,
 *  con el agujero trasero (para apilar otra clavija) y el cuello por donde cae el cable. Degradado y sombra dan volumen. */
export function PlugBody({gradient,color}:{gradient:string;color:string}){
 const dark=shade(color,-.6),edge={stroke:dark,strokeWidth:1.1} as const;
 return <>
   <g transform="translate(3.5 6)" fill="#10202a" opacity=".24"><rect x="-11.5" y="-12.5" width="23" height="27" rx="8.5"/><path d="M-5.5 10 H5.5 L4 27 H-4Z"/></g>
   <path d="M-5.6 9 H5.6 L4.2 25.5 Q4 27.2 2.4 27.2 H-2.4 Q-4 27.2 -4.2 25.5Z" fill={shade(color,-.35)} {...edge}/>
   <path d="M-3.4 12 V24 M3.4 12 V24" stroke={shade(color,.35)} strokeWidth="1" opacity=".35" fill="none"/>
   <rect x="-11" y="-12" width="22" height="26" rx="8" fill={`url(#${gradient}-r)`} {...edge}/>
   <ellipse cx="-3.6" cy="-8.6" rx="5.6" ry="2.2" fill="#fff" opacity=".4"/>
   <circle cy="-.5" r="8.4" fill={shade(color,-.2)} stroke={dark} strokeWidth=".9"/>
   <circle cy="-.5" r="6" fill="#050d0d"/>
   <path d="M-4.3 2.4 A5.2 5.2 0 0 0 4.3 2.4" fill="none" stroke={shade(color,.5)} strokeWidth="1.1" opacity=".55"/>
   <circle cy="-.5" r="2.1" fill="#26363a"/>
 </>;
}
function Plug({point,gradient,color,fresh=false,materialId}:{point:Point;gradient:string;color:string;fresh?:boolean;materialId?:string}){
 return <g transform={`translate(${point.x} ${point.y})`}>
  {fresh&&<circle className="plug-ripple" cy="-1" r="14" fill="none" stroke="#1fa5c9" strokeWidth="3.5"/>}
  <g className={fresh?'plug-seat':undefined}>{materialId?<use href={`#${materialId}-plug`}/>:<PlugBody gradient={gradient} color={color}/>}</g>
 </g>;
}
/** One painted connector definition per colour, reused by every cable without changing its appearance. */
export function CableMaterial({id,color}:{id:string;color:string}){
 return <defs><radialGradient id={`${id}-r`} cx=".32" cy=".26" r=".95"><stop offset="0" stopColor={shade(color,.5)}/><stop offset=".45" stopColor={color}/><stop offset="1" stopColor={shade(color,-.5)}/></radialGradient><g id={`${id}-plug`}><PlugBody gradient={id} color={color}/></g></defs>;
}
/** Dibujo puro. Las posiciones las da quien llama; nunca une nodos eléctricos.
 *  Capas estáticas (sin filtros ni animación): halo, sombra, contorno, cuerpo, brillo; ligero incluso con muchos cables. */
export function BananaCableVisual({id,from,to,color=BANANA_COLOR,sag=100,offsets,fresh=false,path,materialId}:{
 id:string;from:Point;to:Point;color?:string;sag?:number;fresh?:boolean;/** Trazo ya calculado (cuerda con peso); si falta se usa la curva fija. */path?:string;
 offsets?:{from?:Point;to?:Point};
 materialId?:string;
}){
 const d=path??cablePath(from,to,sag,offsets),safe=/^#[\da-f]{6}$/i.test(color)?color:BANANA_COLOR,gradient=materialId??`cg-${id.replace(/[^\w-]/g,'')}`;
 return <g data-cable-id={id} pointerEvents="none">
  {!materialId&&<CableMaterial id={gradient} color={safe}/>}
  <path data-wp className="cable-detail" d={d} fill="none" stroke="#ffffff" strokeWidth="10.5" strokeLinecap="round" opacity=".6"/>
  <path data-wp className="cable-detail" d={d} fill="none" stroke="#10202a" strokeWidth="9" strokeLinecap="round" opacity=".12" transform="translate(5 12)"/>
  <path data-wp className="cable-detail" d={d} fill="none" stroke="#10202a" strokeWidth="6" strokeLinecap="round" opacity=".22" transform="translate(3 8)"/>
  <path data-wp d={d} fill="none" stroke={shade(safe,-.6)} strokeWidth="7.2" strokeLinecap="round"/>
  <path data-wp d={d} fill="none" stroke={safe} strokeWidth="5.2" strokeLinecap="round"/>
  <path data-wp className="cable-detail" d={d} fill="none" stroke={shade(safe,.45)} strokeWidth="2.2" strokeLinecap="round" opacity=".85" transform="translate(-.7 -1.1)"/>
  <path data-wp className="cable-detail" d={d} fill="none" stroke="#ffffff" strokeWidth=".9" strokeLinecap="round" opacity=".55" transform="translate(-1.1 -1.8)"/>
  {[from,to].map((point,index)=><Plug key={index} point={point} gradient={gradient} color={safe} fresh={fresh} materialId={gradient}/>)}
 </g>;
}

export function CablePreview(){
 return <div className="cable-preview">
  <div><strong>Cables banana del laboratorio</strong><p>Demostración visual sin simulación de continuidad. Extremos libres: no representa un circuito.</p></div>
  <svg viewBox="0 0 440 190" role="img" aria-label="Dos cables banana verde petróleo con extremos libres y curvas cruzadas">
   <BananaCableVisual id="muestra-1" from={{x:50,y:32}} to={{x:345,y:65}} sag={100}/>
   <BananaCableVisual id="muestra-2" from={{x:155,y:50}} to={{x:400,y:30}} sag={85} color="#c53943"/>
  </svg>
 </div>;
}
