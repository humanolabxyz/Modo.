import {useState} from 'react';
import {bjtBase,type ProtoComponent} from './model';
import {holeName} from './dc';

const PINS=[{letter:'E',name:'Emisor',color:'#a56326',note:'En un NPN de conmutación por el lado negativo suele ir al retorno. Identifica E antes de cablear.'},{letter:'B',name:'Base',color:'#8051a7',note:'Es la entrada de control. La corriente de base se limita con una resistencia; no es una alimentación para el motor.'},{letter:'C',name:'Colector',color:'#247799',note:'Es la conexión hacia la carga en el montaje NPN por el lado negativo. La corriente de carga circula entre C y E.'}];
export function TransistorPinout({component}:{component:ProtoComponent}){
 const [selected,setSelected]=useState(1),holes=[component.from,bjtBase(component.from,component.to)!,component.to],order=Number(component.from.split(':')[1])<Number(component.to.split(':')[1])?[0,1,2]:[2,1,0];
 return <section className="transistor-pinout" aria-label="Patas del transistor">
  <p><strong>Tres patas, tres columnas distintas.</strong> En este montaje la base queda en el orificio del medio. Toca una pata para identificarla.</p>
  <svg viewBox="0 0 300 186" role="img" aria-label={`Cara plana visible. De izquierda a derecha: ${order.map(i=>PINS[i].name).join(', ')}.`}>
   <path d="M95 99V39Q95 12 150 12Q205 12 205 39V99Z" fill="#1b2024" stroke="#0d1215" strokeWidth="2"/>
   <path d="M95 39Q150 24 205 39V99H95Z" fill="#323a3e"/><text x="150" y="59" textAnchor="middle" fontSize="16" fill="#e6e9e7">{component.polarity==='pnp'?'PNP':'NPN'}</text><text x="150" y="83" textAnchor="middle" fontSize="11" fill="#b9c5c7">CARA PLANA</text>
   {order.map((i,j)=>{const x=90+j*60,p=PINS[i];return <g key={i}><path d={`M${120+j*30} 99V111L${x} 130V148`} fill="none" stroke={selected===i?p.color:'#a9b4b8'} strokeWidth="6"/><circle cx={x} cy="150" r="10" fill="#e6ebe8" stroke={p.color} strokeWidth={selected===i?3:1}/><text x={x} y="154" textAnchor="middle" fontSize="12" fontWeight="700" fill={p.color}>{p.letter}</text><text x={x} y="178" textAnchor="middle" fontSize="12" fill="#344f5a">{holeName(holes[i])}</text></g>;})}
  </svg>
  <div className="transistor-pin-buttons" role="group" aria-label="Identificar una pata">{PINS.map((p,i)=><button key={p.letter} type="button" data-pin={p.letter} aria-pressed={selected===i} onClick={()=>setSelected(i)} style={{borderColor:p.color}}><strong style={{color:p.color}}>{p.letter}</strong>{p.name}<small>{holeName(holes[i])}</small></button>)}</div>
  <p className="transistor-pin-explanation" aria-live="polite">{component.polarity==='pnp'?['En un PNP de conmutación por el lado positivo, el emisor se conecta hacia el positivo. Identifica E antes de cablear.','La base controla el PNP con polaridad opuesta al NPN. Limita su corriente con una resistencia.','El colector conecta hacia la carga en el montaje PNP por el lado positivo. La corriente principal circula entre E y C.'][selected]:PINS[selected].note}</p>
  <p className="lab-saved-as">El dibujo representa el patillaje del modelo virtual. No todos los transistores llamados 2222 tienen el mismo orden de patas: comprueba el fabricante y encapsulado. <a href="https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf" target="_blank" rel="noreferrer">Ejemplo de hoja de datos: P2N2222A, C–B–E</a>.</p>
 </section>;
}
