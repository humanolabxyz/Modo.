import {RETIRED_TERMINAL_IDS,TERMINAL_BY_ID,isExtraModuleId} from './panel';
import {BANANA_COLOR,emptyPractice,type BananaCable,type PracticeDocument,type Point} from './practice';
import {CADE_PORTS} from './cade';
import {DEFAULT_CADE_BINDINGS} from './panelCorrespondence';
import {modulePos} from './layout';
export {TERMINAL_BY_ID};
/** Borne de un panel adicional que ya no está en el banco (se retiró o aún no se restauró): sus cables se descartan al leer una práctica. */
const orphanExtra=(id:unknown)=>typeof id==='string'&&!TERMINAL_BY_ID.has(id)&&isExtraModuleId(id.split(':')[0]);
export function terminalPoint(id:string):Point|null{
 const t=TERMINAL_BY_ID.get(id);if(!t)return null;const p=modulePos(t.module);return {x:p.x+t.terminal.x,y:p.y+t.terminal.y};
}
/** Only explicit cables union nodes. Bobinas, contacts, N and TP never join implicitly. */
export function cableNodes(wires:BananaCable[]):Map<string,string[]>{
 const parent=new Map<string,string>();
 const root=(id:string):string=>{if(!parent.has(id))parent.set(id,id);const p=parent.get(id)!;if(p!==id)parent.set(id,root(p));return parent.get(id)!};
 for(const w of wires){const a=root(w.from.terminalId),b=root(w.to.terminalId);if(a!==b)parent.set(b,a)}
 const groups=new Map<string,string[]>();
 for(const id of parent.keys()){const r=root(id);groups.set(r,[...(groups.get(r)||[]),id])}
 return groups;
}
export function connectedByCables(a:string,b:string,wires:BananaCable[]){
 return a!==b&&[...cableNodes(wires).values()].some(ids=>ids.includes(a)&&ids.includes(b));
}
export function networkFor(id:string|null,wires:BananaCable[]):string[]{
 return id?[...cableNodes(wires).values()].find(ids=>ids.includes(id))||[]:[];
}
export function createCable(from:string,to:string,wires:BananaCable[],color=BANANA_COLOR):BananaCable{
 if(!TERMINAL_BY_ID.has(from)||!TERMINAL_BY_ID.has(to)||from===to)throw new Error('Selecciona dos bornes distintos del inventario.');
 return {id:crypto.randomUUID(),from:{terminalId:from},to:{terminalId:to},color,route:{sag:130},layer:wires.reduce((n,w)=>Math.max(n,w.layer),0)+1};
}
export function cableGeometry(wire:BananaCable,wires:BananaCable[]){
 const endpoint=(end:'from'|'to')=>{
  const id=wire[end].terminalId;const point=terminalPoint(id)!;
  const siblings=wires.filter(w=>w.from.terminalId===id||w.to.terminalId===id).sort((a,b)=>a.layer-b.layer||a.id.localeCompare(b.id));
  const index=siblings.findIndex(w=>w.id===wire.id);
  const stack=wire[end].stackOffset||{x:Math.max(0,index)*8,y:Math.max(0,index)*-5};
  const offset=end==='from'?wire.route?.fromOffset:wire.route?.toOffset;
  return {point,head:{x:point.x+stack.x,y:point.y+stack.y},offset:offset||{x:0,y:0}};
 };
 return {from:endpoint('from'),to:endpoint('to'),sag:wire.route?.sag??130};
}
export function cablePath(from:Point,to:Point,sag:number,offsets?:{from?:Point;to?:Point}){
 const bottom=Math.max(from.y,to.y)+sag;
 return `M${from.x} ${from.y+19} C${from.x+(offsets?.from?.x??12)} ${bottom+(offsets?.from?.y??0)} ${to.x+(offsets?.to?.x??-12)} ${bottom+(offsets?.to?.y??0)} ${to.x} ${to.y+19}`;
}
export function readPractice(value:unknown):PracticeDocument{
 if(!value||typeof value!=='object')throw new Error('Archivo de práctica no válido.');
 const v=value as Record<string,unknown>;
 if(v.version!==2||!Array.isArray(v.wires)||!Array.isArray(v.steps))throw new Error('Formato de práctica incompatible.');
 const archive=v.archive as PracticeDocument['archive'];
 const dropOrphans=<T,>(items:T[],ends:(item:T)=>unknown[])=>items.filter(item=>!ends(item).some(orphanExtra));
 const keepWires=dropOrphans(v.wires as BananaCable[],w=>[w?.from?.terminalId,w?.to?.terminalId]),keepSteps=dropOrphans(v.steps as PracticeDocument['steps'],st=>[st?.from,st?.to]);
 if(archive&&(!Array.isArray(archive.wires)||!Array.isArray(archive.steps)||!archive.bindings||typeof archive.bindings!=='object'||Array.isArray(archive.bindings)))throw new Error('El respaldo de módulos retirados no es válido.');
 const knownTerminal=(id:string)=>TERMINAL_BY_ID.has(id)||RETIRED_TERMINAL_IDS.has(id);
 const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n);
 const validPoint=(p:unknown)=>!p||(typeof p==='object'&&p!==null&&finite((p as Point).x)&&finite((p as Point).y));
 const ids=new Set<string>();
 const allWires=[...keepWires,...(archive?.wires||[])].map((raw:unknown)=>{
  const w=raw as BananaCable;
  if(!w||typeof w.id!=='string'||ids.has(w.id)||!knownTerminal(w.from?.terminalId)||!knownTerminal(w.to?.terminalId)||w.from.terminalId===w.to.terminalId||!/^#[\da-f]{6}$/i.test(w.color)||!finite(w.layer)||!validPoint(w.from.stackOffset)||!validPoint(w.to.stackOffset)||!validPoint(w.route?.fromOffset)||!validPoint(w.route?.toOffset)||w.route?.sag!==undefined&&!finite(w.route.sag))throw new Error('La práctica contiene un cable no válido.');
  ids.add(w.id);return w;
 });
 const diagram=v.diagram as PracticeDocument['diagram'];
 if(diagram&&(!['class_photo','user_image'].includes(diagram.origin)||typeof diagram.name!=='string'||typeof diagram.src!=='string'||!(/^\/diagrams\/(?:clase-[123]\.jpg|leccion-[a-z0-9-]+\.png)$/.test(diagram.src)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(diagram.src))))throw new Error('La referencia de diagrama no es una imagen admitida.');
 const stepIds=new Set<string>();
 const allSteps=[...keepSteps,...(archive?.steps||[])].map((raw:unknown)=>{
  const s=raw as PracticeDocument['steps'][number],r=s?.region;
  if(!s||typeof s.id!=='string'||stepIds.has(s.id)||typeof s.title!=='string'||typeof s.explanation!=='string'||s.review!=='user_reviewed'||!knownTerminal(s.from)||!knownTerminal(s.to)||s.from===s.to||!r||![r.x,r.y,r.w,r.h].every(finite)||r.x<0||r.y<0||r.w<=0||r.h<=0||r.x+r.w>1000.1||r.y+r.h>1000.1)throw new Error('La práctica contiene un paso sin revisión válida.');
  if(s.path!==undefined&&(!Array.isArray(s.path)||s.path.length<2||s.path.length>500||s.path.some(p=>!p||!finite(p.x)||!finite(p.y)||p.x<0||p.y<0||p.x>1000||p.y>1000)))throw new Error('El paso contiene un trazado no válido.');
  stepIds.add(s.id);return s;
 });
 if(allSteps.length&&!diagram)throw new Error('Los pasos necesitan su imagen de referencia.');
 const learning=v.learning as PracticeDocument['learning'];
 if(learning){
  if(!['guided','free','exam'].includes(learning.mode)||!Number.isInteger(learning.index)||learning.index<0||learning.index>=47||![1,2,3].includes(learning.assistance)||!learning.bindings||typeof learning.bindings!=='object'||Array.isArray(learning.bindings)||typeof learning.examFinished!=='boolean'||!learning.answers||typeof learning.answers!=='object'||Array.isArray(learning.answers)||Object.values(learning.answers).some(s=>typeof s!=='string'||s.length>3000)||Object.entries(learning.bindings).some(([key,id])=>!key.startsWith('-')||typeof id!=='string'||id!==''&&!knownTerminal(id)))throw new Error('El progreso o las correspondencias de PERFECTO no son válidos.');
  const known=new Set(CADE_PORTS.map(p=>`${p.reference}:${p.terminal}`));
  if(Object.keys(learning.bindings).some(k=>!known.has(k)))throw new Error('La correspondencia no pertenece a PERFECTO.');
  const defaults=DEFAULT_CADE_BINDINGS;
  const assigned=Object.values({...defaults,...learning.bindings}).filter(Boolean);if(new Set(assigned).size!==assigned.length)throw new Error('Dos bornes del esquema no pueden asignarse al mismo borne físico.');
 }
 const retired=(a:string,b:string)=>RETIRED_TERMINAL_IDS.has(a)||RETIRED_TERMINAL_IDS.has(b);
 const wires=allWires.filter(w=>!retired(w.from.terminalId,w.to.terminalId)),steps=allSteps.filter(s=>!retired(s.from,s.to));
 const archivedBindings={...(archive?.bindings||{}),...Object.fromEntries(Object.entries(learning?.bindings||{}).filter(([,id])=>RETIRED_TERMINAL_IDS.has(id)))};
 if(Object.entries(archivedBindings).some(([key,id])=>!CADE_PORTS.some(p=>`${p.reference}:${p.terminal}`===key)||typeof id!=='string'||!RETIRED_TERMINAL_IDS.has(id)))throw new Error('El respaldo contiene correspondencias no válidas.');
 const retainedArchive={wires:allWires.filter(w=>retired(w.from.terminalId,w.to.terminalId)),steps:allSteps.filter(s=>retired(s.from,s.to)),bindings:archivedBindings};
 const migratedLearning=learning?{...learning,bindings:Object.fromEntries(Object.entries(learning.bindings).map(([key,id])=>[key,RETIRED_TERMINAL_IDS.has(id)?'':id]))}:undefined;
 const stepIndex=finite(v.stepIndex)?Math.max(0,Math.floor(v.stepIndex as number)):0;
 return {...emptyPractice(),title:typeof v.title==='string'?v.title.slice(0,100):'Mi práctica',wires,diagram,steps,mode:['explore','free','identify','guided'].includes(String(v.mode))?v.mode as PracticeDocument['mode']:'free',stepIndex:retainedArchive.steps.length&&v.mode==='guided'?Math.min(stepIndex,Math.max(0,steps.length-1)):stepIndex,...(migratedLearning?{learning:migratedLearning}: {}),...(retainedArchive.wires.length||retainedArchive.steps.length||Object.keys(archivedBindings).length?{archive:retainedArchive}:{})};
}
