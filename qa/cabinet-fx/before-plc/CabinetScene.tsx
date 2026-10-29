import {memo,type CSSProperties} from 'react';
import {dimensions,type Board} from './model';
import {assignedArea,atSlot,ductsFor,railsFor,slotsFor} from './cabinet';

function Fastener({x,y}:{x:number;y:number}){return <g><circle cx={x+1.2} cy={y+2.4} r="8" fill="#0d1f1c" opacity=".34"/><circle cx={x} cy={y} r="7" fill="url(#cab-zinc)" stroke="#5f716d"/><path d={`M${x-4} ${y+.4}h8M${x} ${y-3.6}v8`} stroke="#45575a" strokeWidth="1.6"/><circle cx={x-2.2} cy={y-2.6} r="1.5" fill="#fff" opacity=".8"/></g>;}
function Duct({id,x,y,w,h,installed}:{id:string;x:number;y:number;w:number;h:number;installed:boolean}){
 const vertical=h>w,tooth=vertical?<><rect x="0" y="4" width="9" height="12" rx="1" fill="#eef1e8"/><rect x={w-9} y="4" width="9" height="12" rx="1" fill="#eef1e8"/></>:<><rect x="4" y="0" width="12" height="8" rx="1" fill="#eef1e8"/><rect x="4" y={h-8} width="12" height="8" rx="1" fill="#eef1e8"/></>;
 return <g opacity={installed?1:.2} data-cabinet-hardware="duct"><defs><pattern id={`cab-teeth-${id}`} x={x} y={y} width={vertical?w:20} height={vertical?20:h} patternUnits="userSpaceOnUse">{tooth}</pattern></defs><rect x={x+3.5} y={y+5} width={w} height={h} rx="2" fill="#0b1a17" opacity=".3"/><rect x={x} y={y} width={w} height={h} rx="2" fill="url(#cab-duct)" stroke="#5d6e66" strokeWidth="1.4"/><rect x={x+4} y={y+4} width={w-8} height={h-8} fill="url(#cab-duct-inner)"/><rect x={x} y={y} width={w} height={h} fill={`url(#cab-teeth-${id})`}/><path d={vertical?`M${x+1.5} ${y}v${h}`:`M${x} ${y+1.5}h${w}`} stroke="#fff" opacity=".85"/></g>;
}
function Rail({x,y,width,installed}:{x:number;y:number;width:number;installed:boolean}){return <g opacity={installed?1:.17} data-cabinet-hardware="rail" transform={`translate(${x} ${y})`}><rect x="2.5" y="5" width={width} height="31" fill="#0b1a17" opacity=".28"/><path d={`M0 0h${width}v8h-6v15h6v9H0v-9h6V8H0z`} fill="url(#cab-zinc)" stroke="#6c7f78" strokeWidth="1"/><path d={`M0 7h${width}M6 12h${width-12}M0 25h${width}`} stroke="#fff" strokeWidth="2" opacity=".9"/><path d={`M6 23h${width-12}`} stroke="#42544d" strokeWidth="1" opacity=".5"/>{Array.from({length:Math.floor(width/65)},(_,i)=><rect key={i} x={25+i*65} y="13" width="21" height="6" rx="3" fill="#44574f" stroke="#a9b8b0"/>)}<Fastener x={14} y={16}/><Fastener x={width-16} y={16}/></g>;}

/** Grupo motobomba con rodete visible, medidor y tubería con agua en movimiento. Solo cambia cuando la bomba arranca o frena. */
export const PUMP={x:2208,y:686,r:26,pipes:['M2208 875H1722','M2208 724V868']};
const Pump=memo(function Pump({on}:{on:boolean}){
 return <g className="cab-pump" data-pump={on?'on':'off'}>
  <path d="M1710 875h500" stroke="#0b1a17" strokeWidth="17" strokeLinecap="round" opacity=".2" transform="translate(2 4)"/><path d="M1710 875h500" stroke="url(#cab-pipe)" strokeWidth="14" strokeLinecap="round"/><path d="M1710 871h500" stroke="#fff" strokeWidth="2" opacity=".6"/>
  <path d="M1712 875h500" stroke="#2f4a55" strokeWidth="9" strokeLinecap="round" opacity=".55"/>
  {[1790,1960].map(x=><g key={x}><rect x={x} y="864" width="12" height="22" rx="2" fill="url(#cab-zinc)" stroke="#58696b"/></g>)}
  <rect x="2196" y="726" width="24" height="150" fill="#0b1a17" opacity=".2" transform="translate(3 3)"/><rect x="2197" y="722" width="22" height="154" fill="url(#cab-pipe-v)" stroke="#4d6870"/>
  <rect x="2136" y="672" width="40" height="28" rx="4" fill="url(#cab-zinc)" stroke="#52646a"/><path d="M2140 679h32M2140 693h32" stroke="#42545a" opacity=".5"/>
  <circle cx="2210" cy="688" r="49" fill="#0b1a17" opacity=".22" transform="translate(3 5)"/><circle cx="2208" cy="686" r="47" fill="url(#cab-volute)" stroke="#223f55" strokeWidth="2"/><circle cx="2208" cy="686" r="47" fill="none" stroke="#9fc2d6" strokeWidth="1.2" opacity=".55" strokeDasharray="1 7"/>
  {[0,60,120,180,240,300].map(a=><circle key={a} cx={2208+39*Math.cos(a*Math.PI/180)} cy={686+39*Math.sin(a*Math.PI/180)} r="3.4" fill="url(#cab-zinc)" stroke="#34505e"/>)}
  <circle cx="2208" cy="686" r="30" fill="#0c1f2b" stroke="#a9c7d6" strokeWidth="2"/>{on?<circle cx="2208" cy="686" r="28" fill="#2d9bc2" opacity=".55"/>:null}
  <path d="M2188 668a28 28 0 0 1 28-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5"/>
  <g transform="translate(2160 630)"><circle r="14" fill="#0b1a17" opacity=".25" transform="translate(1.5 2.5)"/><circle r="13" fill="url(#cab-zinc)" stroke="#5a6d72"/><circle r="10" fill="#f7f9f2" stroke="#8da0a5"/><path d="M-7 5a9 9 0 0 1 14 0" fill="none" stroke="#e24f3d" strokeWidth="2.4" opacity=".7"/><g className="fx-lever" style={{transform:`rotate(${on?42:-52}deg)`,transformOrigin:'0px 0px',transitionDuration:on?'1.6s':'2.2s'} as CSSProperties}><path d="M0 0V-8" stroke="#243f4b" strokeWidth="1.8" strokeLinecap="round"/></g><circle r="2" fill="#243f4b"/><path d="M-6-5a9 9 0 0 1 12 0" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".6"/></g>
  <text x="2186" y="852" textAnchor="end" style={{fontSize:12,fill:'#3d5c66',fontWeight:700,letterSpacing:.6}}>BOMBA CENTRÍFUGA · MODELO</text>
 </g>;
});

export const CabinetBackdrop=memo(function CabinetBackdrop({board,pumpOn=false}:{board:Board;pumpOn?:boolean}){
 const c=board.cabinet!,area=assignedArea(board);
 return <g className="cabinet-backdrop" pointerEvents="none">
  <defs>
   <linearGradient id="cab-enamel" x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#fbfcf7"/><stop offset=".3" stopColor="#e3e8e0"/><stop offset=".7" stopColor="#c4cfc8"/><stop offset="1" stopColor="#9fb0a8"/></linearGradient>
   <linearGradient id="cab-plate" x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#dfe7e1"/><stop offset=".35" stopColor="#f0f4ec"/><stop offset=".7" stopColor="#cfd9d1"/><stop offset="1" stopColor="#a8b8ae"/></linearGradient>
   <linearGradient id="cab-zinc" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffffff"/><stop offset=".2" stopColor="#ccd7d2"/><stop offset=".42" stopColor="#7f948d"/><stop offset=".6" stopColor="#eef4ee"/><stop offset="1" stopColor="#8aa097"/></linearGradient>
   <linearGradient id="cab-inner" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2a3a33"/><stop offset=".5" stopColor="#4a5f55"/><stop offset="1" stopColor="#6b8176"/></linearGradient>
   <linearGradient id="cab-duct" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e1e6dc"/><stop offset=".5" stopColor="#b7c1b8"/><stop offset="1" stopColor="#8c9a91"/></linearGradient>
   <linearGradient id="cab-duct-inner" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#33423b"/><stop offset="1" stopColor="#5a6c62"/></linearGradient>
   <linearGradient id="cab-pipe" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e8f0f2"/><stop offset=".3" stopColor="#8fb0ba"/><stop offset=".55" stopColor="#cfe0e5"/><stop offset="1" stopColor="#4d6f7b"/></linearGradient>
   <linearGradient id="cab-pipe-v" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#e8f0f2"/><stop offset=".3" stopColor="#8fb0ba"/><stop offset=".55" stopColor="#cfe0e5"/><stop offset="1" stopColor="#4d6f7b"/></linearGradient>
   <radialGradient id="cab-volute" cx=".35" cy=".3" r=".85"><stop stopColor="#9fc6dc"/><stop offset=".45" stopColor="#4d7a96"/><stop offset="1" stopColor="#1d3d54"/></radialGradient>
   <radialGradient id="cab-vignette" cx=".5" cy=".42" r=".75"><stop offset=".55" stopColor="#1a3a30" stopOpacity="0"/><stop offset="1" stopColor="#1a3a30" stopOpacity=".26"/></radialGradient>
   <radialGradient id="cab-plate-light" cx=".28" cy=".16" r=".9"><stop stopColor="#fff" stopOpacity=".5"/><stop offset=".45" stopColor="#fff" stopOpacity=".08"/><stop offset="1" stopColor="#0d2019" stopOpacity=".34"/></radialGradient>
   <linearGradient id="cab-bevel" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0b1a15" stopOpacity=".5"/><stop offset=".08" stopColor="#0b1a15" stopOpacity=".12"/><stop offset=".2" stopColor="#0b1a15" stopOpacity="0"/></linearGradient>
   <linearGradient id="cab-spec" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".5"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
   <linearGradient id="cab-tray" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#eef4ec"/><stop offset="1" stopColor="#d5e0d5"/></linearGradient>
   <linearGradient id="cab-field" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f2f6f1"/><stop offset="1" stopColor="#d3dfd6"/></linearGradient>
   <pattern id="cab-brush" width="13" height="7" patternUnits="userSpaceOnUse"><path d="M0 1h10M3 4h9" stroke="#fff" strokeWidth=".5" opacity=".22"/></pattern>
  </defs>
  <rect width="2400" height="1650" fill="url(#cab-vignette)"/>
  <text x="100" y="138" className="cab-zone-title">GABINETE DE CONTROL</text><text x="1180" y="138" className="cab-zone-title">PUERTA DE MANDO</text><text x="1680" y="138" className="cab-zone-title">EQUIPO DE CAMPO</text>
  <path d="M100 170h1036v880H116v-10H100z" fill="#0b1a17" opacity=".2" transform="translate(12 10)"/>
  <path d="M1120 160l24 23v880l-24-23z" fill="#8a9d94" stroke="#5f766b"/><path d="M100 1040h1020l24 23H124z" fill="#738a7e" stroke="#5f766b"/>
  <rect x="100" y="160" width="1020" height="880" rx="5" fill="url(#cab-enamel)" stroke="#5f7468" strokeWidth="3"/>
  <rect x="121" y="181" width="978" height="838" rx="3" fill="url(#cab-inner)" stroke="#6e867a" strokeWidth="2"/>
  <rect x="135" y="195" width="950" height="810" rx="2" fill="#7f9285" stroke="#2c4439" strokeWidth="2"/>
  <rect x="157" y="218" width="906" height="780" rx="2" fill="url(#cab-plate)" stroke="#7d9288" strokeWidth="2"/>
  <rect x="157" y="218" width="906" height="780" fill="url(#cab-brush)"/>
  <rect x="157" y="218" width="906" height="780" fill="url(#cab-plate-light)"/>
  <rect x="157" y="218" width="906" height="40" fill="url(#cab-bevel)"/>
  {[177,1043].flatMap(x=>[237,962].map(y=><Fastener key={x+':'+y} x={x} y={y}/>))}
  {railsFor(board).map(r=><Rail key={r.id} {...r} installed={c.fixtures.rail}/>)}
  {ductsFor(board).map(r=><Duct key={r.id} id={r.id} x={r.x} y={r.y} w={r.width} h={r.height} installed={c.fixtures.duct}/>)}
  <rect x={area.x} y={area.y} width={area.width} height={area.height} fill="none" stroke="#2f8a63" strokeWidth="2" strokeDasharray="9 5" opacity=".8"/>
  <text x={area.x+8} y={area.y+17} style={{fontSize:12,fill:'#2f6b4f',fontWeight:600}}>AREA UTIL ASIGNADA {area.width} x {area.height} · MODELO</text>
  <rect x="190" y="1014" width="838" height="24" fill="#a9b8ae" stroke="#5f766b"/><rect x="190" y="1014" width="838" height="9" fill="#fff" opacity=".3"/>{Array.from({length:9},(_,i)=><g key={i}><path d={`M${222+i*88} 1020l10-5h12l10 5v13l-10 6h-12l-10-6z`} fill="url(#cab-zinc)" stroke="#56695f"/><circle cx={238+i*88} cy="1026" r="7" fill="#33463c"/><circle cx={238+i*88} cy="1026" r="4" fill="#10231a"/><circle cx={236+i*88} cy="1024" r="1.4" fill="#fff" opacity=".6"/></g>)}
  <rect x="1183" y="168" width="450" height="882" rx="5" fill="#0b1a17" opacity=".24"/>
  <path d="M1180 160h440v880h-440z" fill="url(#cab-enamel)" stroke="#5f7468" strokeWidth="3"/>
  <path d="M1180 160h150L1180 700z" fill="url(#cab-spec)" opacity=".55"/><path d="M1370 160h40L1180 770v-70z" fill="url(#cab-spec)" opacity=".16"/>
  <rect x="1194" y="174" width="412" height="852" rx="3" fill="none" stroke="#fff" strokeWidth="2" opacity=".8"/><rect x="1196" y="176" width="412" height="852" rx="3" fill="none" stroke="#7d9186" strokeWidth="1.2" opacity=".6"/>
  {[355,790].map(y=><g key={y}><rect x="1126" y={y+3} width="64" height="23" rx="3" fill="#0b1a17" opacity=".25"/><rect x="1124" y={y} width="64" height="23" rx="3" fill="url(#cab-zinc)" stroke="#5a6f62"/><rect x="1150" y={y-5} width="17" height="34" rx="4" fill="url(#cab-zinc)" stroke="#4b6355"/><Fastener x={1135} y={y+12}/><Fastener x={1177} y={y+12}/></g>)}
  <rect x="1581" y="554" width="16" height="109" rx="7" fill="#33473c" stroke="#6a7e72"/><rect x="1584" y="568" width="10" height="75" rx="4" fill="url(#cab-zinc)"/><circle cx="1589" cy="653" r="3" fill="#14261a"/>
  <rect x="1262" y="209" width="280" height="31" rx="2" fill="#0b1a17" opacity=".3"/><rect x="1260" y="206" width="280" height="31" rx="2" fill="#16301f" stroke="#5d7d64"/><rect x="1260" y="206" width="280" height="12" rx="2" fill="#fff" opacity=".14"/><text x="1400" y="227" textAnchor="middle" style={{fontSize:16,fill:'#f4f8e4',fontWeight:700,letterSpacing:.5}}>BOMBA AUXILIAR · M1</text>
  <path d="M1490 890l34 60h-68z" fill="#f2cf3c" stroke="#2c3a23" strokeWidth="2"/><path d="M1490 890l34 60h-68z" fill="url(#cab-spec)" opacity=".35"/><path d="M1493 906l-12 18h10l-5 15 15-21h-11z" fill="#1d2b1d"/>
  {c.fixtures.bond?<g><path d="M1014 963C1090 1025 1120 927 1204 977" stroke="#1d4a28" strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M1014 963C1090 1025 1120 927 1204 977" stroke="#3a9a46" strokeWidth="6" fill="none" strokeLinecap="round"/><path d="M1014 963C1090 1025 1120 927 1204 977" stroke="#f2d332" strokeDasharray="6 7" strokeWidth="5" fill="none"/><Fastener x={1014} y={963}/><Fastener x={1204} y={977}/></g>:null}
  <rect x="1680" y="160" width="580" height="880" rx="5" fill="url(#cab-field)" stroke="#9db4a6" strokeWidth="2"/><rect x="1680" y="160" width="580" height="880" rx="5" fill="url(#cab-vignette)" opacity=".5"/>
  <text x="1710" y="201" className="cab-zone-note">ALIMENTACIÓN Y MOTOR EQUIVALENTES</text>
  <rect x="1959" y="774" width="218" height="32" fill="#0b1a17" opacity=".25" transform="translate(3 4)"/><rect x="1959" y="772" width="218" height="32" fill="url(#cab-zinc)" stroke="#6d867a"/><path d="M1959 782h218" stroke="#fff" opacity=".8"/>{[1975,2160].map(x=><Fastener key={x} x={x} y={788}/>)}
  <Pump on={pumpOn}/>
  {slotsFor(board).filter(s=>!atSlot(board,s.role)).map(s=>{const d=dimensions(s.kind);return <g key={s.role} className="cab-slot"><rect x={s.x-8} y={s.y-9} width={d.w+16} height={d.h+18} rx="5"/><text x={s.x+d.w/2} y={s.y+d.h/2} textAnchor="middle">{s.tag}</text><text x={s.x+d.w/2} y={s.y+d.h/2+22} textAnchor="middle" className="cab-slot-note">Ubicación del encargo</text></g>;})}
  <rect x="105" y="1110" width="2160" height="510" rx="7" fill="url(#cab-tray)" stroke="#9db5a5" strokeWidth="2"/><path d="M105 1155h2160" stroke="#a9bfae"/><text x="135" y="1143" className="cab-zone-title">Bandeja de equipos · selecciona y coloca cada pieza</text>
  <text x="130" y="1091" className="cab-zone-note">Modelo didáctico · representación industrial genérica · sin cotas de fabricación.</text>
 </g>;
});

export {roundedCable} from './cable';
