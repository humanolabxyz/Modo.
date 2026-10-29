import {memo} from 'react';
import {dimensions,type Board} from './model';
import {assignedArea,atSlot,ductsFor,railsFor,slotsFor} from './cabinet';

function Fastener({x,y}:{x:number;y:number}){return <g><circle cx={x+1} cy={y+2} r="8" fill="#627070" opacity=".3"/><circle cx={x} cy={y} r="7" fill="url(#cab-zinc)" stroke="#798582"/><path d={`M${x-4} ${y}h8M${x} ${y-4}v8`} stroke="#536364" strokeWidth="1.5"/></g>;}
function Duct({x,y,w,h,installed}:{x:number;y:number;w:number;h:number;installed:boolean}){
 const vertical=h>w,length=vertical?h:w,n=Math.floor(length/20);
 return <g opacity={installed?1:.2} data-cabinet-hardware="duct"><rect x={x+3} y={y+4} width={w} height={h} rx="2" fill="#4d5858" opacity=".22"/><rect x={x} y={y} width={w} height={h} rx="2" fill="#a8b1aa" stroke="#717e78" strokeWidth="1.4"/><rect x={x+4} y={y+4} width={w-8} height={h-8} fill="#6f7f77"/>{Array.from({length:n},(_,i)=>vertical?<g key={i}><rect x={x} y={y+i*20+4} width={9} height="12" rx="1" fill="#d5dad1"/><rect x={x+w-9} y={y+i*20+4} width="9" height="12" rx="1" fill="#d5dad1"/></g>:<g key={i}><rect x={x+i*20+4} y={y} width="12" height="8" rx="1" fill="#d5dad1"/><rect x={x+i*20+4} y={y+h-8} width="12" height="8" rx="1" fill="#d5dad1"/></g>)}<path d={vertical?`M${x+2} ${y}v${h}M${x+w-2} ${y}v${h}`:`M${x} ${y+2}h${w}M${x} ${y+h-2}h${w}`} stroke="#edf0e4" opacity=".8"/></g>;
}
function Rail({x,y,width,installed}:{x:number;y:number;width:number;installed:boolean}){return <g opacity={installed?1:.17} data-cabinet-hardware="rail" transform={`translate(${x} ${y})`}><rect x="2" y="4" width={width} height="31" fill="#63746f" opacity=".2"/><path d={`M0 0h${width}v8h-6v15h6v9H0v-9h6V8H0z`} fill="url(#cab-zinc)" stroke="#8c9992" strokeWidth="1"/><path d={`M0 7h${width}M6 12h${width-12}M0 25h${width}`} stroke="#f5f7ed" strokeWidth="2"/>{Array.from({length:Math.floor(width/65)},(_,i)=><rect key={i} x={25+i*65} y="13" width="21" height="6" rx="3" fill="#7d8e86" stroke="#b8c2b6"/>)}<Fastener x={14} y={16}/><Fastener x={width-16} y={16}/></g>;}

export const CabinetBackdrop=memo(function CabinetBackdrop({board}:{board:Board}){
 const c=board.cabinet!,area=assignedArea(board);
 return <g className="cabinet-backdrop" pointerEvents="none">
  <defs><linearGradient id="cab-enamel" x1="0" y1="0" x2="1" y2=".6"><stop stopColor="#e7e8df"/><stop offset=".5" stopColor="#d6dcd4"/><stop offset="1" stopColor="#bec8c0"/></linearGradient><linearGradient id="cab-plate" x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#b8c3b8"/><stop offset=".4" stopColor="#dce1d5"/><stop offset=".7" stopColor="#c7d0c1"/><stop offset="1" stopColor="#adbba9"/></linearGradient><linearGradient id="cab-zinc" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f1f3e9"/><stop offset=".2" stopColor="#c7d1c6"/><stop offset=".42" stopColor="#899c93"/><stop offset=".6" stopColor="#e5ece0"/><stop offset="1" stopColor="#99aaa0"/></linearGradient><pattern id="cab-brush" width="13" height="7" patternUnits="userSpaceOnUse"><path d="M0 1h10M3 4h9" stroke="#fcfff3" strokeWidth=".5" opacity=".17"/></pattern></defs>
  <text x="100" y="138" className="cab-zone-title">GABINETE DE CONTROL</text><text x="1180" y="138" className="cab-zone-title">PUERTA DE MANDO</text><text x="1680" y="138" className="cab-zone-title">EQUIPO DE CAMPO</text>
  <path d="M100 170h1036v880H116v-10H100z" fill="#2c3d3e" opacity=".15" transform="translate(10 8)"/>
  <path d="M1120 160l24 23v880l-24-23z" fill="#99a9a0" stroke="#768c81"/><path d="M100 1040h1020l24 23H124z" fill="#879d90" stroke="#788d81"/>
  <rect x="100" y="160" width="1020" height="880" rx="5" fill="url(#cab-enamel)" stroke="#7c8f84" strokeWidth="3"/>
  <rect x="121" y="181" width="978" height="838" rx="3" fill="#53675c" stroke="#889d8b" strokeWidth="2"/>
  <rect x="135" y="195" width="950" height="810" rx="2" fill="#a0afa0" stroke="#3a5345" strokeWidth="2"/>
  <rect x="157" y="218" width="906" height="780" rx="2" fill="url(#cab-plate)" stroke="#93a58e" strokeWidth="2"/>
  <rect x="157" y="218" width="906" height="780" fill="url(#cab-brush)"/>
  {[177,1043].flatMap(x=>[237,962].map(y=><Fastener key={x+':'+y} x={x} y={y}/>))}
  {railsFor(board).map(r=><Rail key={r.id} {...r} installed={c.fixtures.rail}/>)}
  {ductsFor(board).map(r=><Duct key={r.id} x={r.x} y={r.y} w={r.width} h={r.height} installed={c.fixtures.duct}/>)}
  <rect x={area.x} y={area.y} width={area.width} height={area.height} fill="none" stroke="#52775c" strokeWidth="2" strokeDasharray="9 5"/>
  <text x={area.x+8} y={area.y+17} style={{fontSize:12,fill:'#4c6e53'}}>AREA UTIL ASIGNADA {area.width} x {area.height} · MODELO</text>
  <rect x="190" y="1014" width="838" height="24" fill="#b8c4b6" stroke="#718978"/>{Array.from({length:9},(_,i)=><g key={i}><path d={`M${222+i*88} 1020l10-5h12l10 5v13l-10 6h-12l-10-6z`} fill="url(#cab-zinc)" stroke="#728778"/><circle cx={238+i*88} cy="1026" r="7" fill="#576e5f"/><circle cx={238+i*88} cy="1026" r="4" fill="#2a4735"/></g>)}
  <rect x="1183" y="168" width="450" height="882" rx="5" fill="#485e51" opacity=".18"/>
  <path d="M1180 160h440v880h-440z" fill="url(#cab-enamel)" stroke="#87998b" strokeWidth="3"/>
  <rect x="1194" y="174" width="412" height="852" rx="3" fill="none" stroke="#afbbae" strokeWidth="2"/>
  {[355,790].map(y=><g key={y}><rect x="1124" y={y} width="64" height="23" rx="3" fill="url(#cab-zinc)" stroke="#718476"/><rect x="1150" y={y-5} width="17" height="34" rx="4" fill="#8c9e90" stroke="#607a68"/><Fastener x={1135} y={y+12}/><Fastener x={1177} y={y+12}/></g>)}
  <rect x="1581" y="554" width="16" height="109" rx="7" fill="#4a5e50" stroke="#819080"/><rect x="1584" y="568" width="10" height="75" rx="4" fill="url(#cab-zinc)"/><circle cx="1589" cy="653" r="3" fill="#293d2e"/>
  <rect x="1260" y="206" width="280" height="31" rx="2" fill="#253d2e" stroke="#718875"/><text x="1400" y="227" textAnchor="middle" style={{fontSize:16,fill:'#eef3df',fontWeight:600}}>BOMBA AUXILIAR · M1</text>
  <path d="M1490 890l34 60h-68z" fill="#d8bc54" stroke="#3c4734" strokeWidth="2"/><path d="M1493 906l-12 18h10l-5 15 15-21h-11z" fill="#293b2a"/>
  {c.fixtures.bond?<g><path d="M1014 963C1090 1025 1120 927 1204 977" stroke="#477448" strokeWidth="7" fill="none"/><path d="M1014 963C1090 1025 1120 927 1204 977" stroke="#d5c365" strokeDasharray="6 7" strokeWidth="3" fill="none"/><Fastener x={1014} y={963}/><Fastener x={1204} y={977}/></g>:null}
  <rect x="1680" y="160" width="580" height="880" rx="5" fill="#e5ebe2" stroke="#c7d3c3" strokeWidth="2"/>
  <text x="1710" y="201" className="cab-zone-note">ALIMENTACIÓN Y MOTOR EQUIVALENTES</text><path d="M1710 875h515" stroke="#b7c7b0" strokeWidth="5"/><rect x="1959" y="772" width="218" height="32" fill="url(#cab-zinc)" stroke="#8eaa96"/>
  {slotsFor(board).filter(s=>!atSlot(board,s.role)).map(s=>{const d=dimensions(s.kind);return <g key={s.role} className="cab-slot"><rect x={s.x-8} y={s.y-9} width={d.w+16} height={d.h+18} rx="5"/><text x={s.x+d.w/2} y={s.y+d.h/2} textAnchor="middle">{s.tag}</text><text x={s.x+d.w/2} y={s.y+d.h/2+22} textAnchor="middle" className="cab-slot-note">Ubicación del encargo</text></g>;})}
  <rect x="105" y="1110" width="2160" height="510" rx="7" fill="#dee6db" stroke="#b9c7b2" strokeWidth="2"/><path d="M105 1155h2160" stroke="#c0ceba"/><text x="135" y="1143" className="cab-zone-title">Bandeja de equipos · selecciona y coloca cada pieza</text>
  <text x="130" y="1091" className="cab-zone-note">Modelo didáctico · representación industrial genérica · sin cotas de fabricación.</text>
 </g>;
});

export {roundedCable} from './cable';
