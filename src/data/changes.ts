import type {BananaCable,PracticeDocument} from './practice';
import type {SessionFrame} from './session';
export type FrameChanges={
 added:BananaCable[];removed:BananaCable[];
 modified:Array<{id:string;before:BananaCable;after:BananaCable;fields:string[]}>;
 wireOrderChanged:boolean;practiceFields:string[];
 simulation:Array<{field:string;before:unknown;after:unknown}>;
 loto?:{before:number;after:number};
};
export function canonical(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
 return JSON.stringify(value)??'null';
}
export const samePractice=(a:PracticeDocument,b:PracticeDocument)=>canonical(a)===canonical(b);
export const describeWire=(w:BananaCable)=>w.from.terminalId+' → '+w.to.terminalId;
export function frameChanges(before:SessionFrame,after:SessionFrame):FrameChanges{
 const old=new Map(before.practice.wires.map(w=>[w.id,w])),next=new Map(after.practice.wires.map(w=>[w.id,w]));
 const added=after.practice.wires.filter(w=>!old.has(w.id)),removed=before.practice.wires.filter(w=>!next.has(w.id));
 const modified=after.practice.wires.flatMap(w=>{const prev=old.get(w.id);if(!prev||canonical(prev)===canonical(w))return [];return [{id:w.id,before:prev,after:w,fields:['from','to','color','route','layer'].filter(k=>canonical(prev[k as keyof BananaCable])!==canonical(w[k as keyof BananaCable]))}];});
 return {added,removed,modified,wireOrderChanged:!added.length&&!removed.length&&canonical(before.practice.wires.map(w=>w.id))!==canonical(after.practice.wires.map(w=>w.id)),practiceFields:['title','diagram','steps','mode','stepIndex','learning','archive','assessment'].filter(k=>canonical(before.practice[k as keyof PracticeDocument])!==canonical(after.practice[k as keyof PracticeDocument])),simulation:Object.keys(before.simulation).filter(k=>canonical(before.simulation[k as keyof typeof before.simulation])!==canonical(after.simulation[k as keyof typeof after.simulation])).map(field=>({field,before:before.simulation[field as keyof typeof before.simulation],after:after.simulation[field as keyof typeof after.simulation]})),...(before.loto!==after.loto?{loto:{before:before.loto,after:after.loto}}:{})};
}
