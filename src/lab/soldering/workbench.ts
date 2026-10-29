import {newStation,stepStation,type Station,ALLOYS} from './model';
import {DB9_CUPS,type Point} from './manual';
type Thermal=Pick<Station,'joint'|'flux'|'quality'|'contact'|'overheat'>;
export type JointWork={pin:number;wireEnd:Point;stripped:[boolean,boolean];joined:boolean;sleeve:boolean;insulated:boolean;thermal:Thermal};
export type Workbench={station:Station;jobs:JointWork[]};
export type Update<T>=T|((old:T)=>T);
const thermal=(s:Station):Thermal=>({joint:s.joint,flux:s.flux,quality:s.quality,contact:s.contact,overheat:s.overheat});
export const looseEnd=(i:number):Point=>({x:355+i*85,y:345+(i===1?35:0)});
export function newJoint(i:number):JointWork{return {pin:[1,6,5,0][i],wireEnd:i===3?{x:310,y:200}:looseEnd(i),stripped:[false,i!==3],joined:false,sleeve:false,insulated:false,thermal:thermal(newStation())};}
export function newWorkbench(wires:{soldered:boolean;pin:number}[]):Workbench{return {station:newStation(),jobs:[0,1,2,3].map(i=>{const j=newJoint(i),w=wires[i],cup=DB9_CUPS.find(c=>c.pin===w?.pin);return w?.soldered&&cup?{...j,pin:w.pin,wireEnd:cup,stripped:[true,true],joined:true,sleeve:true,insulated:true,thermal:{...j.thermal,quality:'wet'}}:j;})};}
export const stationFor=(b:Workbench,i:number):Station=>({...b.station,...b.jobs[i].thermal});
export function updateJob<K extends keyof JointWork>(b:Workbench,i:number,key:K,update:Update<JointWork[K]>):Workbench{const prev=b.jobs[i][key],value=typeof update==='function'?(update as (v:JointWork[K])=>JointWork[K])(prev):update;if(value===prev)return b;return {...b,jobs:b.jobs.map((j,n)=>n===i?{...j,[key]:value}:j)};}
export function updateStation(b:Workbench,i:number,update:Update<Station>):Workbench{const prev=stationFor(b,i),next=typeof update==='function'?update(prev):update;return {...b,station:next,jobs:b.jobs.map((j,n)=>n===i?{...j,thermal:thermal(next)}:j)};}
export function tickWorkbench(b:Workbench,active:number,dt:number):Workbench{let changed=false;const current=stationFor(b,active),next=stepStation(current,dt);if(next!==current&&(next.tip!==current.tip||next.joint!==current.joint||next.overheat!==current.overheat))changed=true;
 const jobs=b.jobs.map((j,i)=>{if(i===active)return changed?{...j,thermal:thermal(next)}:j;const old={...b.station,...j.thermal,contact:false},n=stepStation(old,dt);if(n.joint===old.joint&&n.overheat===old.overheat&&!j.thermal.contact)return j;changed=true;return {...j,thermal:thermal(n)};});
 return changed?{station:next,jobs}:b;
}
export const bonded=(s:Station)=>s.quality!=='none';
export const molten=(s:Station)=>s.contact&&s.tip>=ALLOYS[s.alloy].liquidus&&s.joint>=ALLOYS[s.alloy].liquidus;
export const canRelease=(s:Station,insulated:boolean)=>bonded(s)&&!insulated&&molten(s);
export const GUIDE_COLORS=['#855535','#f4f1e7','#32834b'];
export const UTP_COLORS=[{name:'Café',hex:'#855535'},{name:'Blanco',hex:'#f4f1e7'},{name:'Verde',hex:'#32834b'},{name:'Azul',hex:'#2978c8'},{name:'Naranja',hex:'#e07b2a'},{name:'Blanco/azul',hex:'#b6d8f1'},{name:'Blanco/naranja',hex:'#f6c9a3'},{name:'Blanco/verde',hex:'#c5dfc6'}];

export function serializeJobs(b:Workbench){return JSON.stringify(b.jobs.map(({thermal,...j})=>({...j,quality:thermal.quality})));}
export function restoreWorkbench(raw:string|undefined,wires:{soldered:boolean;pin:number}[]):Workbench{const b=newWorkbench(wires);if(!raw)return b;try{const jobs=JSON.parse(raw);if(!Array.isArray(jobs)||jobs.length!==4)return b;
 return {...b,jobs:b.jobs.map((fallback,i)=>{if(wires[i]?.soldered)return fallback;const j=jobs[i];if(!j||!Number.isInteger(j.pin)||j.pin<(i===3?0:1)||j.pin>9||!j.wireEnd||![j.wireEnd.x,j.wireEnd.y].every((n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=1_000_000)||!Array.isArray(j.stripped)||j.stripped.length!==2||j.stripped.some((v:unknown)=>typeof v!=='boolean')||['joined','sleeve','insulated'].some(k=>typeof j[k]!=='boolean')||!['none','cold','wet','disturbed'].includes(j.quality))return fallback;const attached=j.quality!=='none';if(attached&&!j.joined)return fallback;return {...fallback,pin:j.pin,wireEnd:j.wireEnd,stripped:j.stripped,joined:j.joined,sleeve:j.sleeve,insulated:j.insulated,thermal:{...fallback.thermal,quality:j.quality}};})};
 }catch{return b;}}
