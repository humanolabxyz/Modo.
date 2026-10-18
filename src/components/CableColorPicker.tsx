import {useRef} from 'react';
import {BANANA_COLOR} from '../data/practice';
import {FloatingDisclosure} from './FloatingDisclosure';

const COLORS=[['Petróleo',BANANA_COLOR],['Rojo','#c53943'],['Azul','#2978c8'],['Amarillo','#d8ab28'],['Negro','#343b42'],['Blanco','#f4f1e7']] as const;
export function CableColorPicker({value,onChange,selected=false}:{value:string;onChange:(color:string)=>void;selected?:boolean}){
 const menu=useRef<HTMLDetailsElement>(null);
 const title=selected?'Color del cable seleccionado':'Color para nuevos cables';
 const choose=(color:string)=>{onChange(color);if(menu.current)menu.current.open=false};
 return <FloatingDisclosure detailsRef={menu} className="dock-color" title={title} summaryLabel={title} summary={<><span className="dock-color-preview" style={{background:value}}/><span>Color</span></>}>
  <div className="dock-color-menu">
   <strong>{selected?'Este cable':'Nuevos cables'}</strong>
   <div className="cable-color-presets" role="group" aria-label="Colores de cable">{COLORS.map(([name,color])=><button key={color} type="button" aria-label={`Cable ${name.toLocaleLowerCase('es')}`} aria-pressed={value.toLowerCase()===color} title={name} onClick={()=>choose(color)}><span style={{background:color}}/><small>{name}</small></button>)}</div>
   <label>Otro color<input aria-label={`Personalizar ${title.toLocaleLowerCase('es')}`} type="color" value={value} onChange={e=>choose(e.target.value)}/></label>
   <p>{selected?'Cambia solo el cable seleccionado.':'Elige el color antes de unir dos bornes.'}</p>
  </div>
 </FloatingDisclosure>;
}
