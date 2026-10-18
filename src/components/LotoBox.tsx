import {useEffect,useRef,useState} from 'react';
/** Seccionador de aislamiento con bloqueo (LOTO) montado junto al tablero, como el del banco: caja amarilla, manilla roja que da o corta la
 *  corriente y candado amarillo con tarjeta. El candado solo se abre con su llave. Se dibuja dentro del SVG del tablero (sigue su zoom y desplazamiento). */
export type Isolator={on:boolean;locked:boolean};
type Props={isolator:Isolator;powered:boolean;onToggle:()=>void;onLock:()=>void;onUnlock:()=>void;x?:number;y?:number;scale?:number};
export function LotoBoardBox({isolator,powered,onToggle,onLock,onUnlock,x=-222,y=200,scale=1.3}:Props){
 const {on,locked}=isolator,[shake,setShake]=useState(false),[phase,setPhase]=useState<'idle'|'key'|'turn'|'open'>('idle'),[hint,setHint]=useState(false),timers=useRef<number[]>([]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 const later=(fn:()=>void,ms:number)=>{timers.current.push(window.setTimeout(fn,ms))};
 const turn=()=>{if(phase!=='idle')return;if(locked){setShake(true);setHint(true);later(()=>setShake(false),420);later(()=>setHint(false),2200);return}onToggle()};
 /* Llave: entra en el candado, gira y abre el arco; luego el candado queda suelto. */
 const useKey=()=>{if(!locked||phase!=='idle')return;setHint(false);setPhase('key');later(()=>setPhase('turn'),480);later(()=>setPhase('open'),900);later(()=>{onUnlock();setPhase('idle')},1350)};
 const padlock=()=>{if(phase!=='idle')return;if(locked){setHint(true);later(()=>setHint(false),2200);return}if(!on)onLock()};
 const key=(fn:()=>void)=>(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)fn()}};
 const stop=(e:React.PointerEvent)=>e.stopPropagation();
 const state=on?(powered?'ON · con corriente':'ON · sin carga'):locked?'OFF · BLOQUEADO':'OFF · sin corriente';
 const note=hint?'Necesitas la llave del candado':!locked&&!on?'Coloca el candado para bloquear':locked?'Usa la llave para liberar':'';
 const open=!locked||phase==='open';
 const lockT=locked?'none':'translate(74px,-6px) scale(.72)';
 const keyAt=phase==='idle'?'translate(112px,128px) rotate(-35deg)':phase==='key'?'translate(56px,150px) rotate(-90deg)':'translate(56px,150px) rotate(0deg)';
 return <g className="loto-box" data-loto-box data-on={on} data-locked={locked} data-phase={phase} data-shake={shake||undefined} transform={`translate(${x} ${y}) scale(${scale})`} onPointerDown={stop} role="group" aria-label={`Seccionador con bloqueo LOTO: ${state}`}>
  <path d="M4 11a7 7 0 0 1 7-7H38V12H74V4H101a7 7 0 0 1 7 7V109a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7Z" fill="#f5c400" stroke="#b58f00" strokeWidth="2" filter="url(#softDrop)"/>
  <text x="14" y="15" fontSize="6.5" fontWeight="700" fill="#6b5600" pointerEvents="none">Type 4X</text><circle cx="56" cy="9" r="2" fill="#9a9a8a"/>
  <g className="loto-handle" role="button" tabIndex={0} aria-pressed={on} aria-label={`Seccionador: ${on?'ON, girar a OFF':locked?'OFF, bloqueado con candado':'OFF, girar a ON'}`} onClick={e=>{e.stopPropagation();turn()}} onKeyDown={key(turn)}>
   <circle cx="56" cy="60" r="37" fill="#c4161c" stroke="#8f0f14" strokeWidth="2"/><circle cx="56" cy="60" r="29" fill="#a50f16"/>
   <rect x="22" y="56" width="15" height="12" rx="1.5" fill="#f5c400"/><text x="29.5" y="64.5" fontSize="5" fontWeight="800" textAnchor="middle" fill="#2b2b2b" pointerEvents="none">O OFF</text>
   <rect x="49" y="26" width="14" height="10" rx="1.5" fill="#f5c400"/><text x="56" y="33.5" fontSize="5" fontWeight="800" textAnchor="middle" fill="#2b2b2b" pointerEvents="none">I ON</text>
   <g className="loto-bar" style={{transform:`translate(56px,60px) rotate(${on?-90:0}deg)`}}><rect x="-9" y="-9" width="38" height="18" rx="3" fill="#d71d25" stroke="#8f0f14" strokeWidth="1.5"/><circle cx="3" cy="0" r="2.4" fill="#6e0b10"/></g>
   <title>{on?'Girar a OFF para cortar la corriente':locked?'Bloqueado: usa la llave del candado':'Girar a ON para dar corriente'}</title>
  </g>
  <rect x="46" y="97" width="20" height="9" rx="2" fill="#e3b100" stroke="#b58f00"/>
  <g className="loto-lock" role="button" tabIndex={on&&!locked?-1:0} aria-pressed={locked} aria-disabled={on&&!locked} aria-label={locked?'Candado cerrado: usa la llave':on?'Candado: primero gira el seccionador a OFF':'Colocar candado'} onClick={e=>{e.stopPropagation();padlock()}} onKeyDown={key(padlock)} style={{transform:lockT,transformOrigin:'56px 112px'}}>
   <path className="loto-shackle" d="M48 114V98Q48 89 56 89Q64 89 64 98V114" fill="none" stroke="#1b1b1b" strokeWidth="4.6" strokeLinecap="round" style={{transform:open?'translate(7px,-7px) rotate(24deg)':'none',transformOrigin:'64px 114px'}}/>
   <rect x="41" y="112" width="30" height="33" rx="3.5" fill="#f5c400" stroke="#b58f00" strokeWidth="1.5"/>
   <rect x="46" y="118" width="20" height="20" fill="#fff"/><rect x="46" y="118" width="20" height="7" fill="#c4161c"/><text x="56" y="123.4" fontSize="3.6" fontWeight="800" textAnchor="middle" fill="#fff" pointerEvents="none">DANGER</text>
   <text x="56" y="130" fontSize="3.8" fontWeight="800" textAnchor="middle" fill="#111" pointerEvents="none">LOCKED</text><text x="56" y="135" fontSize="3.8" fontWeight="800" textAnchor="middle" fill="#111" pointerEvents="none">OUT</text>
   <circle cx="56" cy="141.4" r="1.7" fill="#3b3300" pointerEvents="none"/>
   <title>{locked?'Candado cerrado: necesita su llave':on?'Primero gira el seccionador a OFF':'Colocar el candado'}</title>
  </g>
  <g className="loto-key" data-pulse={hint||undefined} data-active={locked||undefined} role="button" tabIndex={locked?0:-1} aria-disabled={!locked} aria-label={locked?'Llave del candado: abrir el candado':'Llave del candado'} onClick={e=>{e.stopPropagation();useKey()}} onKeyDown={key(useKey)} style={{transform:keyAt}}>
   <g stroke="#7a5a00" strokeWidth="1.2"><circle cx="0" cy="0" r="7" fill="#e8b923"/><circle cx="0" cy="0" r="2.6" fill="#fff"/><rect x="5" y="-2.4" width="26" height="4.8" rx="1.5" fill="#e8b923"/><path d="M22 2.4v6h4v-6M28 2.4v4h3v-4" fill="#e8b923"/></g>
   <title>{locked?'Usar la llave para abrir el candado':'Llave del candado'}</title>
  </g>
  <text x="56" y="164" fontSize="9.5" fontWeight="800" textAnchor="middle" fill={on?'#1d6b4a':locked?'#9a1c22':'#6b5600'} pointerEvents="none" role="status">{state}</text>
  {note&&<text x="56" y="176" fontSize="7.5" fontWeight="650" textAnchor="middle" fill="#8a5a00" pointerEvents="none">{note}</text>}
 </g>;
}
