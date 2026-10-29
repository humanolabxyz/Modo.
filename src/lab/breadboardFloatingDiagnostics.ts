import {componentHoles,IC_PIN_NAMES,type LabProject,type ProtoComponent} from './model';
import {holeName,type BreadboardResult} from './dc';

export type FloatingDiagnostic={id:string;title:string;locations:{componentId:string;label:string;hole:string;pin:string}[];holeIds:string[];cause:string;review:string;switchingState:boolean};
const names:Record<ProtoComponent['kind'],string>={wire:'Puente',resistor:'Resistencia',led:'LED',diode:'Diodo',motor:'Motor',bjt:'Transistor',switch:'Interruptor',button:'Pulsador',l293d:'L293D'};
/** Report actual solver nets and occupied pins, never infer a missing wire from a photograph. */
export function floatingDiagnostics(board:LabProject['breadboard'],result:BreadboardResult,switches:Record<string,boolean>={}):FloatingDiagnostic[]{
 return [...new Set(result.floating)].map(id=>{
  const locations:FloatingDiagnostic['locations']=[],holeIds:string[]=[];
  const nearby=board.components.filter(c=>componentHoles(c).some(h=>result.groups[h]===id));
  for(const c of nearby){const pins=componentHoles(c);pins.forEach((hole,i)=>{if(result.groups[hole]!==id)return;holeIds.push(hole);if(c.kind==='wire')return;const pin=c.kind==='bjt'?['E','B','C'][i]:c.kind==='l293d'?`${IC_PIN_NAMES[i]} (${i+1})`:c.kind==='motor'?['borne 1','borne 2'][i]:c.kind==='led'||c.kind==='diode'?['ánodo','cátodo'][i]:`pata ${i+1}`;locations.push({componentId:c.id,label:c.kind==='bjt'?(c.polarity==='pnp'?'2N2907 · PNP':'2N2222 · NPN'):names[c.kind],hole,pin});});}
  const off=nearby.filter(c=>c.kind==='bjt'&&result.bjts[c.id]?.region==='corte');
  const openControls=nearby.filter(c=>(c.kind==='button'||c.kind==='switch')&&!(switches[c.id]??(c.kind==='button'?false:c.closed)));
  const switchingState=off.length>0||openControls.length>0;
  const reference=locations[0]?.hole??holeIds[0];
  return {id,title:`Grupo sin referencia${reference?' · '+holeName(reference):''}`,locations,holeIds:[...new Set(holeIds)],switchingState,
   cause:switchingState?`Este grupo no tiene un camino conductor hacia una referencia de la fuente. ${off.length?'Hay transistores conectados a él que están en corte.':'Hay pulsadores o interruptores conectados a él que están abiertos.'} En una salida de puente H detenida puede ser un estado esperado; este aviso por sí solo no demuestra un cable faltante.`:'El cálculo no encuentra un camino conductor entre este grupo y una referencia de la fuente. Su tensión respecto al negativo no queda determinada.',
   review:switchingState?'Comprueba las patas indicadas y el mando que debe activar esta rama. En un puente H prueba un sentido a la vez y observa si el grupo adquiere referencia. No añadas un puente al negativo solo para quitar el aviso.':'Con la fuente detenida, sigue los puentes de los puntos indicados y comprueba alimentación, retorno e interruptores según tu esquema. Revisa si el recorrido cruza el corte de los rieles entre 15 y 16.'};
 }).filter(issue=>issue.holeIds.length>0);
}
