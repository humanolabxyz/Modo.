import {useLayoutEffect,useRef,useState} from 'react';
import {Delete,CornerDownLeft} from 'lucide-react';
import '../styles/geo-command-keyboard.css';

type Key={label:string;text:string;back?:number};
const math:Key[]=[{label:'eˣ',text:'exp()',back:1},{label:'log₁₀',text:'log(10,)',back:1},{label:'ln',text:'ln()',back:1},{label:'√',text:'sqrt()',back:1},{label:'x²',text:'^2'},{label:'xʸ',text:'^'},{label:'sen',text:'sin()',back:1},{label:'cos',text:'cos()',back:1},{label:'π',text:'pi'},{label:'e',text:'e'},{label:'(',text:'('},{label:')',text:')'},{label:'{',text:'{'},{label:'}',text:'}'},{label:',',text:','}];
export function GeoCommandKeyboard({inputId,insert,backspace,execute,canExecute}:{inputId:string;insert:(value:string,back?:number)=>void;backspace:()=>void;execute:()=>void;canExecute:boolean}){
 const [tab,setTab]=useState<'123'|'ABC'|'f(x)'>('123');
 const root=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{root.current?.scrollTo({top:0});},[tab]);
 const rows=tab==='ABC'?['qwertyuiop','asdfghjklñ','zxcvbnm']:tab==='123'?['789xyz+-*/','456te^=()','1230.,{}[]']:[];
 return <section ref={root} className="geo-command-keyboard" aria-label="Teclado para comandos" aria-controls={inputId} onPointerDown={event=>event.preventDefault()}>
  <div className="geo-keyboard-tabs" role="tablist" aria-label="Tipo de teclas">{(['123','f(x)','ABC'] as const).map(name=><button key={name} type="button" role="tab" aria-selected={tab===name} onClick={()=>setTab(name)}>{name}</button>)}</div>
  <div className="geo-keyboard-keys" role="tabpanel" aria-label={`Teclas ${tab}`}>
   {rows.map((row,i)=><div className="geo-keyboard-row" key={i}>{[...row].map((key,j)=><button key={j} type="button" aria-label={`Escribir ${key}`} onClick={()=>insert(key)}>{key}</button>)}</div>)}
   {tab==='f(x)'&&<div className="geo-keyboard-functions">{math.map(key=><button key={key.label} type="button" aria-label={`Escribir ${key.label}`} onClick={()=>insert(key.text,key.back)}>{key.label}</button>)}</div>}
   <div className="geo-keyboard-actions"><button type="button" onClick={()=>insert(' ')}>Espacio</button><button type="button" aria-label="Borrar carácter" onClick={backspace}><Delete size={19}/></button><button type="button" className="geo-keyboard-execute" disabled={!canExecute} onClick={execute}>Ejecutar<CornerDownLeft size={18}/></button></div>
  </div>
 </section>;
}
