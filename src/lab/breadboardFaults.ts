import {HOLE_BY_ID,HOLES,componentHoles,crowdedHoles,newProject,type LabProject,type ProtoComponent} from './model';
import {netGroups,solveBreadboard} from './dc';
import {parseProject} from './validation';
export type FaultMode='surprise'|'remove'|'move';
type Board=LabProject['breadboard'];
export type BridgeReference={motor:string;buttons:[string,string];currents:[number,number]};
export type WireFault={kind:'remove'|'move';wireId:string;from:string;to:string;newFrom?:string;newTo?:string};
export type BreadboardFaultSession={version:1;projectId:string;reference:Board;bridge:BridgeReference;fault:WireFault;attempts:number;hints:0|1|2;solved:boolean;restored?:boolean;notes:string;createdAt:string};
const EPS=.005;
export function inspectBridge(board:Board):{ok:true;bridge:BridgeReference}|{ok:false;message:string}{
 const motors=board.components.filter(c=>c.kind==='motor'),buttons=board.components.filter(c=>c.kind==='button');
 if(board.components.filter(c=>c.kind==='bjt').length<4||motors.length!==1||buttons.length!==2)return {ok:false,message:'Arma un puente H con cuatro transistores, un motor y dos pulsadores antes de iniciar la prueba.'};
 if(Object.keys(crowdedHoles(board.components)).length)return {ok:false,message:'Primero corrige las patas que comparten un mismo orificio.'};
 const values:number[]=[];
 for(const which of [-1,0,1]){const r=solveBreadboard(board,Object.fromEntries(buttons.map((c,i)=>[c.id,i===which])),{failures:true}),amps=r.amps[motors[0].id]??0;
  if(r.fault||r.tripped||Object.keys(r.failures).length)return {ok:false,message:'El montaje de referencia presenta una falla o sobreesfuerzo. Corrígelo antes de introducir una avería de prueba.'};
  if(which===-1&&Math.abs(amps)>EPS)return {ok:false,message:'El motor de referencia debe quedar detenido con ambos pulsadores sueltos.'};
  if(which>=0)values.push(amps);
 }
 if(values.some(a=>Math.abs(a)<EPS)||values[0]*values[1]>=0)return {ok:false,message:'Primero comprueba que cada pulsador haga circular corriente por el motor en un sentido distinto.'};
 return {ok:true,bridge:{motor:motors[0].id,buttons:[buttons[0].id,buttons[1].id],currents:values as [number,number]}};
}
export function applyWireFault(reference:Board,fault:WireFault):Board{
 return {...structuredClone(reference),power:{...reference.power??{plugged:false,redConnected:false,blackConnected:false},enabled:false},components:reference.components.flatMap(c=>c.id!==fault.wireId?[structuredClone(c)]:fault.kind==='remove'?[]:[{...c,from:fault.newFrom??c.from,to:fault.newTo??c.to}])};
}
function observableFault(board:Board,bridge:BridgeReference){
 let changed=false;
 for(const which of [-1,0,1]){const r=solveBreadboard(board,Object.fromEntries(bridge.buttons.map((id,i)=>[id,i===which])),{failures:true});
  if(r.fault||r.tripped||Object.keys(r.failures).length)return false;
  const amps=r.amps[bridge.motor]??0;if(which===-1&&Math.abs(amps)>EPS)return false;
  if(which>=0&&Math.abs(amps-bridge.currents[which])>Math.max(EPS,Math.abs(bridge.currents[which])*.15))changed=true;
 }return changed;
}
/** Randomness selects a physical edit, never a reading. Each accepted edit is solved. */
export function createWireFault(board:Board,mode:FaultMode,seed:number):{ok:true;fault:WireFault;board:Board;bridge:BridgeReference}|{ok:false;message:string}{
 const valid=inspectBridge(board);if(!valid.ok)return valid;
 const wires=board.components.filter(c=>c.kind==='wire'),used=new Set(board.components.flatMap(componentHoles)),groups=netGroups(board);
 used.add(board.positive);used.add(board.negative);
 const offset=Math.abs(Math.floor(seed))%Math.max(1,wires.length),ordered=[...wires.slice(offset),...wires.slice(0,offset)];
 const kinds:('remove'|'move')[]=mode==='surprise'?(seed%2?['move','remove']:['remove','move']):[mode];
 for(const kind of kinds)for(const wire of ordered){
  const base:WireFault={kind,wireId:wire.id,from:wire.from,to:wire.to};
  if(kind==='remove'){const changed=applyWireFault(board,base);if(observableFault(changed,valid.bridge))return {ok:true,fault:base,board:changed,bridge:valid.bridge};continue;}
  for(const end of ['from','to'] as const){const original=HOLE_BY_ID.get(wire[end]);if(!original)continue;
   const candidates=HOLES.filter(h=>!used.has(h.id)&&groups[h.id]!==groups[original.id]&&Math.abs(h.x-original.x)<=48&&Math.abs(h.y-original.y)<=60).sort((a,b)=>Math.hypot(a.x-original.x,a.y-original.y)-Math.hypot(b.x-original.x,b.y-original.y));
   for(const hole of candidates.slice(0,6)){const fault={...base,[end==='from'?'newFrom':'newTo']:hole.id},changed=applyWireFault(board,fault);if(observableFault(changed,valid.bridge))return {ok:true,fault,board:changed,bridge:valid.bridge};}
  }
 }return {ok:false,message:'No se encontró una alteración de este tipo que cambie el funcionamiento sin provocar daños en el modelo. Prueba otro tipo de fallo.'};
}
const partition=(board:Board)=>{const groups=netGroups(board),nets=new Map<string,string[]>();for(const h of HOLES){const root=groups[h.id];nets.set(root,[...nets.get(root)??[],h.id]);}return [...nets.values()].map(ids=>ids.sort().join('|')).sort().join(';');};
const partSignature=(c:ProtoComponent)=>JSON.stringify([c.id,c.kind,c.value,c.polarity??null,c.closed,componentHoles(c).map(id=>HOLE_BY_ID.get(id)?.group)]);
export function checkWireRepair(current:Board,reference:Board){
 if(Object.keys(crowdedHoles(current.components)).length)return {ok:false,message:'Hay patas compartiendo orificio. Corrige esa ocupación antes de comprobar.'};
 const a=current.components.filter(c=>c.kind!=='wire').map(partSignature).sort(),b=reference.components.filter(c=>c.kind!=='wire').map(partSignature).sort();
 if(JSON.stringify(a)!==JSON.stringify(b)||current.voltage!==reference.voltage||HOLE_BY_ID.get(current.positive)?.group!==HOLE_BY_ID.get(reference.positive)?.group||HOLE_BY_ID.get(current.negative)?.group!==HOLE_BY_ID.get(reference.negative)?.group)return {ok:false,message:'Se han cambiado componentes, valores o alimentación respecto a tu referencia. Revisa esos cambios antes de validar la reparación.'};
 if(partition(current)!==partition(reference))return {ok:false,message:'Las conexiones aún no recuperan las redes de tu montaje original. Sigue el recorrido con continuidad y revisa dónde acaba cada puente.'};
 const functional=inspectBridge(current);if(!functional.ok)return functional;
 return {ok:true,message:'Reparación comprobada: conexiones equivalentes a tu referencia y corriente del motor en ambos sentidos. No se ha instalado ningún cable automáticamente.'};
}
export function readFaultSession(raw:string|null,projectId:string):BreadboardFaultSession|null{
 if(!raw)return null;const s=JSON.parse(raw) as BreadboardFaultSession;
 if(!s||s.version!==1||s.projectId!==projectId||!s.reference||!s.fault||!['remove','move'].includes(s.fault.kind)||!Number.isInteger(s.attempts)||s.attempts<0||s.attempts>100000||![0,1,2].includes(s.hints)||typeof s.solved!=='boolean'||s.restored!==undefined&&typeof s.restored!=='boolean'||typeof s.notes!=='string'||s.notes.length>4000||typeof s.createdAt!=='string')throw Error('Prueba guardada incompatible. Se conserva sin sobrescribir.');
 const parsed=parseProject({...newProject('blank'),breadboard:s.reference});if(!parsed.ok)throw Error('Referencia guardada no válida. Se conserva sin sobrescribir.');
 const valid=inspectBridge(parsed.project.breadboard),wire=parsed.project.breadboard.components.find(c=>c.kind==='wire'&&c.id===s.fault.wireId);
 if(!valid.ok||!wire||wire.from!==s.fault.from||wire.to!==s.fault.to||[s.fault.newFrom,s.fault.newTo].some(h=>h!==undefined&&!HOLE_BY_ID.has(h)))throw Error('La referencia de la prueba no coincide con el fallo guardado.');
 if(!observableFault(applyWireFault(parsed.project.breadboard,s.fault),valid.bridge))throw Error('El fallo guardado no produce una alteración comprobable.');
 return {...s,reference:parsed.project.breadboard,bridge:valid.bridge};
}
