import {useEffect,useState} from 'react';
import {ArrowRight,Trash2} from 'lucide-react';
import type {BananaCable} from '../data/practice';
export function WireInspector({wire,onChange,onDelete,onEndpoint,onLayer}:{wire:BananaCable;onChange:(wire:BananaCable)=>void;onDelete:()=>void;onEndpoint:(id:string)=>void;onLayer:(front:boolean)=>void}){
 const [sag,setSag]=useState(wire.route?.sag??130),[side,setSide]=useState(wire.route?.fromOffset?.x??12);
 useEffect(()=>{setSag(wire.route?.sag??130);setSide(wire.route?.fromOffset?.x??12)},[wire]);
 return <section className="wire-detail" aria-label="Inspector del cable">
  <p className="small-note">Conecta estos dos bornes:</p>
  <button className="wire-endpoint" onClick={()=>onEndpoint(wire.from.terminalId)}>{wire.from.terminalId}<ArrowRight size={14}/></button>
  <button className="wire-endpoint" onClick={()=>onEndpoint(wire.to.terminalId)}>{wire.to.terminalId}<ArrowRight size={14}/></button>
  <details className="disclosure wire-settings"><summary>Recorrido del cable</summary>
  <label className="field-label">Caída de la curva <output>{sag}</output><input type="range" aria-label="Caída del cable" min="35" max="500" step="5" value={sag} onChange={e=>setSag(+e.target.value)}/></label>
  <label className="field-label">Desvío lateral <output>{side}</output><input type="range" aria-label="Desvío lateral del cable" min="-400" max="400" step="10" value={side} onChange={e=>setSide(+e.target.value)}/></label>
  <button className="outline-full" onClick={()=>onChange({...wire,route:{...wire.route,sag,fromOffset:{x:side,y:0},toOffset:{x:-side,y:0}}})}>Aplicar recorrido</button>
  <div className="button-pair"><button onClick={()=>onLayer(false)}>Enviar detrás</button><button onClick={()=>onLayer(true)}>Traer delante</button></div>
  </details>
  <button className="danger-button" onClick={onDelete}><Trash2 size={15}/> Retirar este cable</button>

 </section>;
}
