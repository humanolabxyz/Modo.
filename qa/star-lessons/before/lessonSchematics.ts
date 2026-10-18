import {LESSON_CADES,type Cade,type CadePort} from './cade';
/** Esquemas (estilo CADe) de las lecciones guiadas. Cada borne del esquema sabe qué borne del banco representa (`panel`), así que
 *  para un cable del banco se puede hallar el conductor del esquema que lo representa y encenderlo mientras se arma. */
export type LessonSchematicId='simple'|'inversion';
export const LESSON_SCHEMATICS:Record<LessonSchematicId,Cade>=LESSON_CADES;
type Pt={x:number;y:number};
const key=(p:Pt)=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`;
const onSegment=(p:Pt,a:Pt,b:Pt)=>Math.abs((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))<.001&&p.x>=Math.min(a.x,b.x)-.001&&p.x<=Math.max(a.x,b.x)+.001&&p.y>=Math.min(a.y,b.y)-.001&&p.y<=Math.max(a.y,b.y)+.001;
type Graph={edges:Map<string,{to:string;wire:number}[]>;at:Map<string,Pt>;ports:Map<string,CadePort[]>};
const graphs=new Map<Cade,Graph>();
/** Grafo de conductores: se parte cada conductor en los puntos donde hay un borne, un punto de unión o el extremo de otro conductor.
 *  Dos conductores que solo se cruzan (sin punto ni extremo en común) no se conectan. */
function graphOf(cade:Cade):Graph{
 const cached=graphs.get(cade);if(cached)return cached;
 const special:Pt[]=[...cade.JUNCTIONS.map(j=>({x:j.x,y:j.y})),...cade.PORTS.map(p=>({x:p.x,y:p.y})),...cade.WIRES.flatMap(w=>[{x:w.x,y:w.y},{x:w.x2,y:w.y2}])];
 const edges=new Map<string,{to:string;wire:number}[]>(),at=new Map<string,Pt>();
 const link=(a:Pt,b:Pt,wire:number)=>{const ka=key(a),kb=key(b);if(ka===kb)return;at.set(ka,a);at.set(kb,b);(edges.get(ka)??edges.set(ka,[]).get(ka)!).push({to:kb,wire});(edges.get(kb)??edges.set(kb,[]).get(kb)!).push({to:ka,wire})};
 for(const w of cade.WIRES){
  const a={x:w.x,y:w.y},b={x:w.x2,y:w.y2},on=special.filter(p=>onSegment(p,a,b));
  const unique=new Map(on.map(p=>[key(p),p]));unique.set(key(a),a);unique.set(key(b),b);
  const t=(p:Pt)=>(b.x-a.x||b.y-a.y)?((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2):0;
  const ordered=[...unique.values()].sort((p,q)=>t(p)-t(q));
  for(let i=1;i<ordered.length;i++)link(ordered[i-1],ordered[i],w.id);
 }
 const ports=new Map<string,CadePort[]>();
 for(const p of cade.PORTS)if(p.panel)(ports.get(p.panel)??ports.set(p.panel,[]).get(p.panel)!).push(p);
 const g={edges,at,ports};graphs.set(cade,g);return g;
}
export type StepTrace={wires:number[];ends:[Pt,Pt]}|null;
/** Conductores del esquema que representan un cable del banco entre dos bornes (camino más corto entre los bornes del esquema). */
export function traceStep(cade:Cade,from:string,to:string):StepTrace{
 const g=graphOf(cade),starts=g.ports.get(from)??[],goals=g.ports.get(to)??[];
 let best:{wires:number[];ends:[Pt,Pt]}|null=null;
 for(const s of starts){
  const origin=key(s),prev=new Map<string,{from:string;wire:number}|null>([[origin,null]]),queue=[origin];
  while(queue.length){const here=queue.shift()!;for(const e of g.edges.get(here)??[])if(!prev.has(e.to)){prev.set(e.to,{from:here,wire:e.wire});queue.push(e.to)}}
  for(const goal of goals){
   const target=key(goal);if(!prev.has(target))continue;
   const wires:number[]=[];for(let k=target;prev.get(k);k=prev.get(k)!.from)wires.unshift(prev.get(k)!.wire);
   const unique=[...new Set(wires)];
   if(!best||unique.length<best.wires.length)best={wires:unique,ends:[{x:s.x,y:s.y},{x:goal.x,y:goal.y}]};
  }
 }
 return best;
}

/* ───── Lección ↔ esquema ───── */
import type {Lesson} from './lessons';
import type {BananaCable,ManualStep} from './practice';
import {connectedByCables} from './wiring';
const traceCache=new Map<string,StepTrace[]>();
/** Trazado en el esquema de cada paso de la lección (se calcula una vez). */
export function lessonTraces(lesson:Lesson):StepTrace[]{
 let traces=traceCache.get(lesson.id);
 if(!traces){const cade=LESSON_SCHEMATICS[lesson.schematic];traces=lesson.steps.map(s=>traceStep(cade,s.from,s.to));traceCache.set(lesson.id,traces)}
 return traces;
}
export type LessonProgress={active:number[];done:number[];ends:Pt[]};
/** Qué iluminar en el esquema: la línea del paso actual (naranja), las de los pasos ya armados (verde) y los dos bornes. */
export function lessonProgress(lesson:Lesson,stepIndex:number,wires:BananaCable[]):LessonProgress{
 const traces=lessonTraces(lesson),active=traces[stepIndex],done=new Set<number>();
 lesson.steps.forEach((s,i)=>{if(i!==stepIndex&&traces[i]&&connectedByCables(s.from,s.to,wires))traces[i]!.wires.forEach(id=>done.add(id))});
 const activeIds=new Set(active?.wires??[]);
 return {active:[...activeIds],done:[...done].filter(id=>!activeIds.has(id)),ends:active?.ends??[]};
}
/** Cables de la lección que representa una línea del esquema. */
export function stepsForWire(lesson:Lesson,wireId:number):ManualStep[]{
 const traces=lessonTraces(lesson);return lesson.steps.filter((_,i)=>traces[i]?.wires.includes(wireId));
}
/** Cables de la lección que salen o llegan a algún borne de un símbolo del esquema. */
export function stepsForSymbol(lesson:Lesson,symbolId:number):ManualStep[]{
 const cade=LESSON_SCHEMATICS[lesson.schematic],keys=new Set(cade.PORTS.filter(p=>p.objectId===symbolId&&p.panel).map(p=>p.panel!));
 return lesson.steps.filter(s=>keys.has(s.from)||keys.has(s.to));
}
