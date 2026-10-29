import {memo} from 'react';
import type {Wire} from './model';
import type {CableGeometry} from './cable';

export function CableMaterials(){return <defs><linearGradient id="cab-ferrule-metal" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f5f4df"/><stop offset=".3" stopColor="#a7b3ad"/><stop offset=".55" stopColor="#e9eee0"/><stop offset="1" stopColor="#687c73"/></linearGradient><linearGradient id="cab-marker" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f1e0a0"/><stop offset=".45" stopColor="#d6bb63"/><stop offset="1" stopColor="#9c873e"/></linearGradient><linearGradient id="cab-ferrule-collar" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#edf1e3"/><stop offset=".45" stopColor="#cbd4c3"/><stop offset="1" stopColor="#7e9080"/></linearGradient></defs>;}

export const FLOW:Record<string,{spark:string;glow:string}>={power:{spark:'#fff1bf',glow:'#ffb938'},control:{spark:'#e6fdff',glow:'#32d6ff'},pe:{spark:'#f4ffd0',glow:'#a7e24a'}};

/** Cuerpo del cable. Con tensión añade un resplandor; el flujo de carga animado vive en la capa CabinetFx para no repintar esta escena. */
export const CableBody=memo(function CableBody({geometry,selected,pe,live=false,route='control'}:{geometry:CableGeometry;selected:boolean;pe:boolean;live?:boolean;route?:string}){
 const {path,color}=geometry,flow=FLOW[route]??FLOW.control;
 return <g pointerEvents="none"><path d={path} className="cab-cable-shadow" style={{fill:'none',stroke:selected?'#be9b4d':'#102219',strokeWidth:selected?9:7.4,opacity:selected?.45:.26,strokeLinecap:'round'}} transform="translate(1.6 2.8)"/>{live?<path d={path} className="cab-cable-glow" style={{stroke:flow.glow,strokeWidth:12}}/>:null}<path d={path} className="cab-cable-rim" style={{fill:'none',stroke:'#10231b',strokeWidth:5.8,strokeLinecap:'round',opacity:.72}}/><path d={path} className="cab-cable-insulation" style={{fill:'none',stroke:color,strokeWidth:4.6,strokeLinecap:'round'}}/><path d={path} className="cab-cable-sheen" style={{fill:'none',stroke:'#fff',strokeWidth:1.5,strokeLinecap:'round',opacity:.26}} transform="translate(-.8 -.9)"/><path d={path} className="cab-cable-shine" style={{fill:'none',stroke:pe?'#f2dc63':'#cfe6ec',strokeWidth:pe?1.8:1,strokeLinecap:'round',opacity:pe?.95:.5}} transform="translate(-.55 -.6)"/></g>;
});

export const CableTerminations=memo(function CableTerminations({wire,geometry,selected}:{wire:Wire;geometry:CableGeometry;selected:boolean}){
 return <g className="cab-cable-terminations" pointerEvents="none">{geometry.ends.map((end,i)=><g key={i} transform={`translate(${end.point.x} ${end.point.y}) rotate(${end.angle})`}>
  <rect x="-12" y="-2.5" width="17" height="5" rx=".8" fill="url(#cab-ferrule-metal)" stroke="#60766c" strokeWidth=".5"/>
  <path d="M-10-1h12m-12 2H2" stroke="#f1f2da" strokeWidth=".45"/>
  <path d="M1-4.2h10l4 2V2l-4 2.2H1z" fill="url(#cab-ferrule-collar)" stroke="#718878" strokeWidth=".6"/>
  <path d="M5-3.5v7m4-7v7" stroke="#b7c4ad" strokeWidth=".65"/>
  <rect x="17" y="-4" width="18" height="8" rx="2" fill="url(#cab-marker)" stroke="#9e8946" strokeWidth=".45"/>
  <text x="26" y="1.8" textAnchor="middle" style={{fontFamily:'Consolas,monospace',fontSize:4.5,fontWeight:700,fill:'#394a34',stroke:'none'}} transform={Math.abs(end.angle)>90?'rotate(180 26 0)':undefined}>{wire.label??'HILO'}</text>
  {selected?<><circle r="10" fill="none" stroke="#d6ad4b" strokeWidth="1.7"/><rect x="38" y="-8" width="35" height="16" rx="3" fill="#fff9df" stroke="#c3a052" strokeWidth=".8"/><text x="55.5" y="3" textAnchor="middle" style={{fontFamily:'LabSource,sans-serif',fontSize:9,fill:'#6c5b2f',stroke:'none'}} transform={Math.abs(end.angle)>90?'rotate(180 55.5 0)':undefined}>{wire.label??'Hilo'}</text></>:null}
 </g>)}</g>;
});
