import {Home as HomeIcon,X} from 'lucide-react';
import type {ReactNode} from 'react';
export function CompactBar({showDiagram,sheetFull,onHome,onBank,onToggleDiagram,measurementOpen,onMeasurement,simulation,cables}:{showDiagram:boolean;sheetFull:boolean;onHome:()=>void;onBank:()=>void;onToggleDiagram:()=>void;measurementOpen:boolean;onMeasurement:()=>void;simulation:ReactNode;cables:ReactNode}){
 return <nav className="compact-bar" aria-label="Controles del banco">
  <button className="compact-home" aria-label="Inicio" onClick={onHome}><HomeIcon size={20}/></button>
  <div className="compact-views" role="group" aria-label="Vista de trabajo"><button aria-pressed={!sheetFull&&!measurementOpen} onClick={onBank}>Banco</button><button className="open-diagram" aria-label={showDiagram?'Cerrar diagrama':'Abrir diagrama'} aria-pressed={showDiagram} onClick={onToggleDiagram}>Diagrama{showDiagram&&<X size={14}/>}</button></div>
  <div className="compact-sim">{simulation}</div>
  {cables}
 </nav>;
}
