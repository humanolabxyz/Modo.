import {solveDC,type DCBranch} from '../lab/dc';
import {cableConnected,type CableState} from './academicModels';
/** Explicit exercise values: each conductor 0.12 Ω, solder/screw 0.03 Ω each, test leads 0.2 Ω each. */
export function cableOhms(s:CableState,a:string,b:string):number|null{
 if(a===b)return .4;if(!cableConnected(s,a,b))return null;
 const edges:DCBranch[]=[],join=(id:string,a:string,b:string,resistance:number)=>edges.push({id,a,b,resistance});
 s.wires.forEach((w,i)=>{const l=`w${i}a`,r=`w${i}b`;if(!w.broken)join('w'+i,l,r,.12);if(s.cut&&w.stripped&&w.tinned&&w.soldered&&w.pin&&!(w.cold&&s.flex))join('j'+i,`p${w.pin}`,l,.03);if(s.cut&&w.stripped&&w.tight&&w.terminal)join('t'+i,r,`t${w.terminal}`,.03);});
 if(s.bridge)join('bridge','p1','p6',.02);const result=solveDC(edges,{[a]:1,[b]:0});if(result.fault)return null;const current=edges.reduce((total,e)=>total+(e.a===a?result.amps[e.id]??0:e.b===a?-(result.amps[e.id]??0):0),0);return current>0?1/current+.4:null;
}
