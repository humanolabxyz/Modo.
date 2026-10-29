import {CADE_JUNCTIONS,CADE_PORTS,CADE_SYMBOLS,CADE_WIRES,cadeNetwork,type CadePort} from './cade';
import {cableNodes,connectedByCables,TERMINAL_BY_ID} from './wiring';
import type {AssistanceLevel,BananaCable} from './practice';
import {DEFAULT_CADE_BINDINGS,cadePortKey,bindingConflict} from './panelCorrespondence';
import {SIMPLE_LESSON} from './lessons';

export type LearningState={mode:'guided'|'free'|'exam';index:number;assistance:AssistanceLevel;bindings:Record<string,string>;examFinished:boolean;answers:Record<string,string>};
export const newLearning=():LearningState=>({mode:'free',index:0,assistance:1,bindings:{},examFinished:false,answers:{}});
export const portKey=cadePortKey;
export const UNIQUE_PORTS=[...new Map(CADE_PORTS.filter(p=>p.terminal).map(p=>[portKey(p),p])).values()];
/** Correspondences shared with the virtual lesson's bank components. */
export const LABEL_BINDINGS=DEFAULT_CADE_BINDINGS;
const visited=new Set<number>();
const geometricNets=CADE_WIRES.flatMap(w=>{
 if(visited.has(w.id))return [];
 const net=cadeNetwork(w.id);net.wires.forEach(a=>visited.add(a.id));
 return [{id:Math.min(...net.wires.map(a=>a.id)),lineIds:net.wires.map(a=>a.id),ports:net.ports}];
}).sort((a,b)=>a.id-b.id);
// The same reference + port drawn in power and control denotes one physical node.
// Repeated numbers belonging to different references remain independent.
export const LEARNING_NETS=geometricNets.reduce<typeof geometricNets>((groups,net)=>{
 const related=groups.filter(g=>g.ports.some(p=>net.ports.some(q=>portKey(p)===portKey(q))));
 const merged=[net,...related];
 return [...groups.filter(g=>!related.includes(g)),{id:Math.min(...merged.map(n=>n.id)),lineIds:merged.flatMap(n=>n.lineIds),ports:[...new Map(merged.flatMap(n=>n.ports).map(p=>[portKey(p),p])).values()]}];
},[]).sort((a,b)=>a.id-b.id);
function pairsForTerminals(terminals:string[]){
 const parent=new Map(terminals.map(id=>[id,id])),root=(id:string):string=>parent.get(id)===id?id:root(parent.get(id)!);
 const pairs:{from:string;to:string}[]=[];
 const add=(from:string,to:string)=>{if(!parent.has(from)||!parent.has(to)||root(from)===root(to))return;parent.set(root(from),root(to));pairs.push({from,to})};
 // Prefer the actual lesson cables and their order. Only personal remappings
 // need the fallback spanning chain; equivalent cable topologies still validate.
 SIMPLE_LESSON.pairs.forEach(([from,to])=>add(from,to));
 terminals.slice(1).forEach((to,i)=>add(terminals[i],to));
 return pairs;
}
function mapNet(net:typeof LEARNING_NETS[number],bindings:Record<string,string>){
 const map={...LABEL_BINDINGS,...bindings};
 const terminals=[...new Set(net.ports.map(p=>map[portKey(p)]).filter(id=>TERMINAL_BY_ID.has(id)))];
 // Expected protection cables from the lesson; no implicit internal links.
 if(net.ports.some(p=>portKey(p)==='-M:PE')&&!net.ports.some(p=>Object.hasOwn(bindings,portKey(p))))terminals.push(...['CONTACTOR_TERMICO:TP_DER','BOTONERAS:TP_DER'].filter(id=>TERMINAL_BY_ID.has(id)));
 return {...net,terminals,missing:net.ports.filter(p=>!TERMINAL_BY_ID.has(map[portKey(p)])),pairs:pairsForTerminals(terminals)};
}
/** Show only the cables represented by the selected conductor, even when the
 * panel integrates two drawing networks in the same supply/protection socket. */
export function routeForLine(id:number,bindings:Record<string,string>={}){
 const net=LEARNING_NETS.find(n=>n.lineIds.includes(id));return net?mapNet(net,bindings):undefined;
}
export function learningModel(bindings:Record<string,string>={}){
 const mapped=LEARNING_NETS.map(net=>mapNet(net,bindings));
 // The panel exposes one common pilot return and integrates the supply protections
 // and thermal power stage. Merge their equivalent sockets, never the contacts themselves.
 return mapped.reduce<typeof mapped>((groups,net)=>{
  let merged=net,remaining=groups;
  for(;;){const related=remaining.filter(g=>g.terminals.some(id=>merged.terminals.includes(id)));if(!related.length)break;
   const all=[merged,...related];remaining=remaining.filter(g=>!related.includes(g));
   merged={id:Math.min(...all.map(g=>g.id)),lineIds:all.flatMap(g=>g.lineIds),ports:all.flatMap(g=>g.ports),terminals:[...new Set(all.flatMap(g=>g.terminals))],missing:all.flatMap(g=>g.missing),pairs:[]};
  }
  merged.pairs=pairsForTerminals(merged.terminals);return [...remaining,merged];
 },[]).sort((a,b)=>a.id-b.id);
}
export type LearningNet=ReturnType<typeof learningModel>[number];
export const netForLine=(id:number,model:LearningNet[])=>model.find(n=>n.lineIds.includes(id));
export function canBind(key:string,id:string,bindings:Record<string,string>){
 if(!UNIQUE_PORTS.some(p=>portKey(p)===key)||id&&!TERMINAL_BY_ID.has(id))return false;
 // Distinct source ports cannot silently collapse onto one physical socket.
 return !bindingConflict(key,id,bindings);
}
function shortedNodes(wires:BananaCable[],bindings:Record<string,string>){
 const map={...LABEL_BINDINGS,...bindings};
 const sources=CADE_SYMBOLS.filter(o=>[3000,3001,3002,3004].includes(o.type));
 const sourcePorts=CADE_PORTS.filter(p=>sources.some(o=>o.id===p.objectId));
 return [...cableNodes(wires).values()].filter(ids=>{
  const potentials=new Set(sourcePorts.filter(p=>ids.includes(map[portKey(p)])).map(p=>p.terminal));
  // The lesson's 24 V control F (L in the drawing) is separate from three-phase R (L1).
  return potentials.size>1;
 });
}
export type CableVerdict='correct'|'incorrect'|'unknown'|'short';
export function assessCable(wire:BananaCable,wires:BananaCable[],model:LearningNet[],bindings:Record<string,string>):CableVerdict{
 const component=[...cableNodes(wires).values()].find(ids=>ids.includes(wire.from.terminalId))||[];
 if(shortedNodes(wires,bindings).some(ids=>ids.includes(wire.from.terminalId)))return 'short';
 const membership=(id:string)=>model.filter(n=>n.terminals.includes(id));
 const a=membership(wire.from.terminalId),b=membership(wire.to.terminalId);
 if(!a.length||!b.length)return 'unknown';
 const known=component.filter(id=>membership(id).length);
 if(!model.some(n=>known.every(id=>n.terminals.includes(id))))return 'incorrect';
 return a.some(n=>b.includes(n))?'correct':'incorrect';
}
export function netComplete(net:LearningNet,wires:BananaCable[],model:LearningNet[],bindings:Record<string,string>){
 if(net.missing.length||!net.pairs.length)return false;
 return net.pairs.every(p=>connectedByCables(p.from,p.to,wires))&&wires.filter(w=>net.terminals.includes(w.from.terminalId)||net.terminals.includes(w.to.terminalId)).every(w=>assessCable(w,wires,model,bindings)==='correct');
}
export function nextPair(net:LearningNet,wires:BananaCable[]){return net.pairs.find(p=>!connectedByCables(p.from,p.to,wires))}
export function routePairs(nets:LearningNet[],wires:BananaCable[]){
 return nets.flatMap(net=>net.pairs.map((pair,index)=>({...pair,netId:net.id,index,installed:connectedByCables(pair.from,pair.to,wires)})));
}
export function explainNet(net:LearningNet){
 const keys=net.ports.map(portKey);
 if(keys.includes('-M:W2'))return 'El esquema reúne W2, U2 y V2 en un punto común del motor. Constrúyelo con dos puentes; puedes cambiar el borne que sirve como punto de unión.';
 if(keys.includes('-F:95'))return 'Este conductor lleva la salida de Q al borne 95 de la protección. La línea termina en el contacto: no sustituye el contacto 95–96.';
 if(keys.includes('-F:96'))return 'Desde 96 el mando llega a la parada y a la rama auxiliar indicada. La bifurcación es un mismo nodo, aunque se dibuje en varios tramos.';
 if(keys.includes('-SB2:13'))return 'La salida de la parada alimenta la marcha y el auxiliar de mantenimiento. Dos ramas nacen de un punto compartido; no son alimentaciones distintas.';
 if(keys.includes('-KM1:A1'))return 'Las salidas de marcha y del auxiliar se reúnen antes de A1 y del piloto H1. Une los extremos de esta red sin puentear la bobina A1–A2.';
 if(keys.includes('-KM1:A2'))return 'A2 y los retornos X2 de los pilotos llegan al retorno N. Los puentes pueden compartir bornes; N permanece separado de la protección PE.';
 if(keys.includes('-F:98'))return 'La salida 98 de la protección llega al piloto H2. Este conductor une dispositivos; el contacto 97–98 permanece como un símbolo separado.';
 if(keys.includes('-KM1:12'))return 'La salida del auxiliar KM1:12 llega al piloto H3:X1. Reconoce la referencia KM1 antes de buscar el borne en el panel.';
 if(keys.some(k=>k.endsWith(':PE')))return 'Sigue la protección PE entre la referencia de tierra y el motor. No la confundas con el retorno N.';
 if(keys.some(k=>/^\-M:[UVW]1$/.test(k)))return 'Esta fase sale de la protección F y llega al terminal identificado del motor. Mantén separadas las tres fases y distingue entrada de salida.';
 return 'Sigue esta fase de potencia entre los dos dispositivos indicados. La línea acaba en sus bornes; los contactos internos se leen como símbolos, no como puentes.';
}
type GraphEdge={to:string;line:number|null};
const drawingGraph=new Map<string,GraphEdge[]>();
const pointKey=(p:{x:number;y:number})=>`@${p.x},${p.y}`;
const link=(a:string,b:string,line:number|null)=>{drawingGraph.set(a,[...(drawingGraph.get(a)||[]),{to:b,line}]);drawingGraph.set(b,[...(drawingGraph.get(b)||[]),{to:a,line}])};
const points=[...CADE_PORTS,...CADE_JUNCTIONS,...CADE_WIRES.flatMap(w=>[{x:w.x,y:w.y},{x:w.x2,y:w.y2}])];
for(const w of CADE_WIRES){
 const on=points.filter(p=>Math.abs((w.x2-w.x)*(p.y-w.y)-(w.y2-w.y)*(p.x-w.x))<.001&&p.x>=Math.min(w.x,w.x2)&&p.x<=Math.max(w.x,w.x2)&&p.y>=Math.min(w.y,w.y2)&&p.y<=Math.max(w.y,w.y2));
 const sorted=[...new Map(on.map(p=>[pointKey(p),p])).values()].sort((a,b)=>Math.hypot(a.x-w.x,a.y-w.y)-Math.hypot(b.x-w.x,b.y-w.y));
 sorted.slice(1).forEach((p,i)=>link(pointKey(sorted[i]),pointKey(p),w.id));
}
CADE_PORTS.forEach(p=>link(portKey(p),pointKey(p),null));
/** Color only source conductor paths supported by correct installed cables. */
export function completedDiagramLines(wires:BananaCable[],model:LearningNet[],bindings:Record<string,string>){
 const inverse=new Map(Object.entries({...LABEL_BINDINGS,...bindings}).filter(([,id])=>id).map(([key,id])=>[id,key]));
 const complete=new Set<number>(),covered=new Set<string>();
 const edgeKey=(a:string,b:string,line:number)=>`${line}|${[a,b].sort().join('|')}`;
 for(const w of wires){
  if(assessCable(w,wires,model,bindings)!=='correct')continue;
  const from=inverse.get(w.from.terminalId),to=inverse.get(w.to.terminalId);if(!from||!to)continue;
  const previous=new Map<string,{node:string;line:number|null}>(),queue=[from],seen=new Set(queue);
  for(let i=0;i<queue.length&&!seen.has(to);i++)for(const edge of drawingGraph.get(queue[i])||[]){if(seen.has(edge.to))continue;seen.add(edge.to);previous.set(edge.to,{node:queue[i],line:edge.line});queue.push(edge.to)}
  if(!seen.has(to))continue;
  let current=to;while(current!==from){const edge=previous.get(current)!;if(edge.line!==null)covered.add(edgeKey(current,edge.node,edge.line));current=edge.node}
 }
 // An original line may span several branch points. Do not color the entire
 // record green when only part of that conductor path has been completed.
 for(const line of CADE_WIRES){const edges=[...drawingGraph].flatMap(([a,list])=>list.filter(e=>e.line===line.id).map(e=>edgeKey(a,e.to,line.id)));if(edges.length&&edges.every(key=>covered.has(key)))complete.add(line.id)}
 for(const net of model)if(netComplete(net,wires,model,bindings))net.lineIds.forEach(id=>complete.add(id));
 return [...complete];
}
export const EXPLANATION_QUESTIONS=[
 '¿Qué diferencia hay entre un conductor y el contacto 95–96? ¿Por qué no se puentea el contacto?',
 '¿Qué representan las dos ramas en paralelo entre marcha y el auxiliar KM1:13–14?',
 '¿Por qué una red con tres bornes puede construirse con dos puentes en distinto orden?',
 '¿Qué función tiene A1–A2 y por qué no debes unirlos con un cable?',
];
