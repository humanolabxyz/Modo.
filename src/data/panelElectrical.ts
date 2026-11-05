import {TERMINALS} from './panel';
import {relayIds,simulationContacts,type MotorState,type RelayState,type SimulationInput} from './simulation';
import type {BananaCable} from './practice';
import {solvePanelAC,type ACBranch} from './panelAC';
import {motorEquivalent,type MotorModelSettings} from './panelMotorDynamics';
import {motorAdmittance,sequences,switchingRms} from './panelSequences';
import {EXAMPLE_RATING,type MotorRating} from './machinePreparation';
import type {ResistanceDatum} from './panelCalibration';
import {earthGaps,earthModel} from './panelEarth';
import {contactOhms,controlSourceVolts,effectiveWires,faultsOf,hasFault,openWindingAdmittance,pairKey} from './panelFaults';

/** Educational AC model settings, never equipment nameplate data. */
export type PanelMeterModel={nameplate?:MotorRating;lineVolts:number;supplyVariationPct?:number;supplyVariationEnabled?:boolean;coilOhms:number;pilotOhms:number;windingOhms:number;resistanceMode?:'model'|'provided';providedResistances?:Record<string,ResistanceDatum>}&MotorModelSettings;
export const DEFAULT_PANEL_METER_MODEL:PanelMeterModel={nameplate:{...EXAMPLE_RATING},lineVolts:380,supplyVariationPct:0,supplyVariationEnabled:false,coilOhms:240,pilotOhms:480,windingOhms:100,motorMode:'induction',frequencyHz:50,loadTorqueNm:4,lineOhms:.15};
/** Slow, bounded teaching variation of the common three-phase RMS source.
 * This is not measured mains data or 50 Hz waveform animation. The common
 * simulation clock makes pause/resume and repeated samples deterministic. */
export function supplyLineVolts(model:PanelMeterModel){
 if(!model.supplyVariationEnabled)return model.lineVolts;
 const seconds=model.simulationSeconds;if(seconds===undefined||!Number.isFinite(seconds))return model.lineVolts;
 const t=Math.max(0,seconds),amount=Math.max(0,Math.min(1,model.supplyVariationPct??0))/100;
 return model.lineVolts*(1+amount*(.65*Math.sin(2*Math.PI*t/7.3)+.35*Math.sin(2*Math.PI*t/2.1)));
}
/** Entrada A del multímetro (Fluke 87V): 10 A continuos y 20 A como máximo durante 30 s; sobre eso se quema el fusible de 11 A. */
export const AMMETER_RATED=10,AMMETER_MAX=20,MA_MAX=.6;
export type MeterJack='vo'|'a10'|'ma';
/** Límite de la entrada usada: A (20 A) o mA/µA (600 mA). */
export const jackLimit=(jack:MeterJack)=>jack==='ma'?MA_MAX:AMMETER_MAX;
export type PanelAmmeter={red:string;black:string;limit?:number};
export function panelElectrical(wires:BananaCable[],input:SimulationInput,relays:RelayState,timed:readonly string[],model=DEFAULT_PANEL_METER_MODEL,meter?:PanelAmmeter){
 const parent=new Map(TERMINALS.map(t=>[t.key,t.key]));
 const root=(id:string):string=>{const p=parent.get(id);if(!p)return id;if(p!==id)parent.set(id,root(p));return parent.get(id)!;};
 const join=(a:string,b:string)=>parent.set(root(a),root(b));
 const faults=faultsOf(input),eff=effectiveWires(wires,faults),series:{id:string;a:string;b:string;ohms:number}[]=[...eff.resistive];
 for(const w of eff.ideal)join(w.from.terminalId,w.to.terminalId);
 const contacts=simulationContacts(input,relays,timed),contactR=contactOhms(faults);
 /* Un contacto sucio o carbonizado conduce, pero con resistencia: es una rama más, no una unión ideal. */
 for(const [a,b] of contacts){const r=contactR.get(pairKey(a,b));if(r===undefined)join(a,b);else series.push({id:'contact-'+pairKey(a,b),a,b,ohms:r});}
 const ports:Record<string,[string,string]>={};
 const branches:ACBranch[]=[],load=(id:string,a:string,b:string,resistance:number,reactance=0)=>{ports[id]=[a,b];a=root(a);b=root(b);if(a!==b)branches.push({id,a,b,resistance,reactance});};
 const openCoil=new Set(faults.flatMap(f=>f.kind==='coil-open'?[f.relay]:[])),burnt=new Set(faults.flatMap(f=>f.kind==='pilot-burnt'?[f.n]:[]));
 for(const id of relayIds())if(!openCoil.has(id))load(id,`${id}:A1`,`${id}:A2`,model.coilOhms);
 for(let n=1;n<=4;n++)if(!burnt.has(n))load(`pilot-${n}`,`BOTONERAS:PILOTO_${n}`,'BOTONERAS:N',model.pilotOhms);
 for(const sr of series)load(sr.id,sr.a,sr.b,sr.ohms);
 const motor=model.motorMode==='induction'?motorEquivalent(model).impedance:{re:model.windingOhms,im:0};
 const openWinding=faults.find(f=>f.kind==='winding-open'),openIndex=openWinding&&openWinding.kind==='winding-open'?['U','V','W'].indexOf(openWinding.phase):-1;
 for(const p of ['U','V','W'])if(openIndex<0||p!==['U','V','W'][openIndex])load(`winding-${p}`,`BORNERA_MOTOR:${p}1`,`BORNERA_MOTOR:${p}2`,motor.re,motor.im);
 if(meter)load('ammeter',meter.red,meter.black,.1);
 const energized=input.enabled&&input.plugged&&!(input.earthRequired&&earthGaps(wires,faults).length),control=energized&&input.breakers.every(Boolean),force=energized&&input.forceBreaker;
 // The 24 V secondary is isolated from the three-phase source. TP is never a neutral.
 const source=[{id:'FUENTE:F',re:control?controlSourceVolts(faults):0,im:0,family:'control'}, {id:'FUENTE:N',re:0,im:0,family:'control'},
 ...['R','S','T'].filter(p=>model.openPhase!==p).map(p=>{const i=['R','S','T'].indexOf(p),k=hasFault(faults,'sequence-reversed')?[0,2,1][i]:i,v=force?supplyLineVolts(model)*(model.phaseScale?.[i]??1)/Math.sqrt(3):0;return {id:(model.lineOhms??0)>0?`__SUPPLY_${p}`:`FUENTE:${p}`,re:v*Math.cos(-k*2*Math.PI/3),im:v*Math.sin(-k*2*Math.PI/3),family:'force'};})];
 if((model.lineOhms??0)>0)for(const phase of ['R','S','T'])if(model.openPhase!==phase)load(`supply-${phase}`,`__SUPPLY_${phase}`,`FUENTE:${phase}`,model.lineOhms!);
 const fixedRe:Record<string,number>={},fixedIm:Record<string,number>={},families=new Map<string,Set<string>>();let fault:string|null=null;
 for(const s of source){const r=root(s.id);if(r in fixedRe&&Math.hypot(fixedRe[r]-s.re,fixedIm[r]-s.im)>1e-6)fault='Cortocircuito entre fuentes de tensión.';fixedRe[r]=s.re;fixedIm[r]=s.im;if(!families.has(r))families.set(r,new Set());families.get(r)!.add(s.family);}
 // Propagate source family through loads without joining their terminals as conductors.
 for(let i=0;i<branches.length+1;i++){let changed=false;for(const b of branches){const both=new Set([...(families.get(b.a)??[]),...(families.get(b.b)??[])]);for(const id of [b.a,b.b])if(both.size>(families.get(id)?.size??0)){families.set(id,new Set(both));changed=true;}}if(!changed)break;}
 if([...families.values()].some(f=>f.size>1))fault='Mando y fuerza unidos: revisa la separación de las fuentes.';
 const same=(a:string,b:string)=>root(`BORNERA_MOTOR:${a}`)===root(`BORNERA_MOTOR:${b}`);
 const connection:MotorState['connection']=same('U2','V2')&&same('V2','W2')?'star':same('U1','W2')&&same('V1','U2')&&same('W1','V2')?'delta':null;
 const coupled=model.motorMode==='induction'&&connection?[{ids:['winding-U','winding-V','winding-W'],ports:['U','V','W'].map(p=>[root(`BORNERA_MOTOR:${p}1`),root(`BORNERA_MOTOR:${p}2`)] as [string,string]),admittance:openIndex>=0?openWindingAdmittance(motorAdmittance(model),openIndex):motorAdmittance(model)}]:[];
 const solved=solvePanelAC(coupled.length?branches.filter(b=>!b.id.startsWith('winding-')):branches,Object.fromEntries(Object.keys(fixedRe).map(id=>[id,{re:fixedRe[id],im:fixedIm[id]}])),coupled);
 fault??=solved.fault;
 /* Tierra de protección: solo cables (los contactos no la interrumpen). No cambia el solver; informa fugas y riesgo de choque. */
 const earth=earthModel([...eff.ideal.map(w=>[w.from.terminalId,w.to.terminalId] as const),...eff.resistive.map(w=>[w.a,w.b] as const)],faults,t=>solved.volts[root(t)]??null);
 if(earth.short&&energized)fault??='Fase unida a la tierra de protección: cortocircuito a tierra.';
 const current=meter&&root(meter.red)===root(meter.black)?0:switchingRms(solved.amps.ammeter??{re:0,im:0},model);
 const phasor=(a:string,b:string)=>{const va=solved.volts[root(a)],vb=solved.volts[root(b)];return va&&vb?{re:va.re-vb.re,im:va.im-vb.im}:{re:0,im:0};};
 const voltage=(a:string,b:string):number|null=>{
  a=root(a);b=root(b);if(a===b)return 0;
  const fa=families.get(a),fb=families.get(b);
  if(!fa?.size||!fb?.size||[...fa].some(f=>!fb.has(f)))return null;
  if(solved.volts[a]===undefined||solved.volts[b]===undefined)return null;
  return Math.hypot(solved.volts[a].re-solved.volts[b].re,solved.volts[a].im-solved.volts[b].im);
 };
 // Input clamp before the phase branches: sum complex currents first, then take RMS magnitude.
 const linePhasors:Record<string,{re:number;im:number}>={};
 const lineAmps=Object.fromEntries(['R','S','T'].map(phase=>{
  const node=root(`FUENTE:${phase}`),sum=(part:'re'|'im')=>branches.filter(b=>!b.id.startsWith('supply-')).reduce((total,b)=>total+(b.a===node?(solved.amps[b.id]?.[part]??0):b.b===node?-(solved.amps[b.id]?.[part]??0):0),0);
  linePhasors[phase]={re:sum('re'),im:sum('im')};return [phase,switchingRms(linePhasors[phase],model)];
 })) as Record<'R'|'S'|'T',number>;
 // KCL across an ideal conductor cut preserves ideal voltages, unlike inserting
 // an arbitrary shunt. An ideal parallel bypass makes that individual current indeterminate.
 const conductorCurrent=(from:string,to:string)=>{
  const index=contacts.findIndex(([a,b])=>a===from&&b===to||a===to&&b===from);
  if(index<0)return {amps:0,bypassed:false};
  const graph=new Map<string,Set<string>>(),edge=(a:string,b:string)=>{if(!graph.has(a))graph.set(a,new Set());if(!graph.has(b))graph.set(b,new Set());graph.get(a)!.add(b);graph.get(b)!.add(a);};
  eff.ideal.forEach(w=>edge(w.from.terminalId,w.to.terminalId));contacts.forEach(([a,b],i)=>{if(i!==index&&!contactR.has(pairKey(a,b)))edge(a,b);});
  const region=(id:string)=>{const seen=new Set([id]),queue=[id];for(let i=0;i<queue.length;i++)for(const next of graph.get(queue[i])??[])if(!seen.has(next)){seen.add(next);queue.push(next);}return seen;};
  let side=region(to);if(side.has(from))return {amps:0,bypassed:true};
  if(source.some(v=>side.has(v.id)))side=region(from);
  const current=Object.entries(ports).reduce((sum,[id,[a,b]])=>{const z=solved.amps[id]??{re:0,im:0},sign=Number(side.has(a))-Number(side.has(b));return {re:sum.re+sign*z.re,im:sum.im+sign*z.im};},{re:0,im:0});
  return {amps:switchingRms(current,model),bypassed:false};
 };
 const thermalPoles=[1,2,3].map(i=>conductorCurrent(`CONTACTOR_TERMICO:L${i}`,`CONTACTOR_TERMICO:T${i}`));
 const sequence=sequences(['U','V','W'].map(p=>phasor(`BORNERA_MOTOR:${p}1`,`BORNERA_MOTOR:${p}2`))),positive=model.motorDirection===-1?sequence.negative:sequence.positive,negative=model.motorDirection===-1?sequence.positive:sequence.negative;
 const positiveVolts=Math.hypot(positive.re,positive.im),negativeVolts=Math.hypot(negative.re,negative.im);
 // Cut only the selected physical cable. KCL measures that conductor, including
 // branches after a source; a parallel ideal path has no unique branch current.
 const wirePhasor=(id:string)=>{const wire=wires.find(w=>w.id===id);if(!wire)return null;const graph=new Map<string,Set<string>>(),edge=(a:string,b:string)=>{if(!graph.has(a))graph.set(a,new Set());if(!graph.has(b))graph.set(b,new Set());graph.get(a)!.add(b);graph.get(b)!.add(a);};eff.ideal.forEach(w=>{if(w.id!==id)edge(w.from.terminalId,w.to.terminalId)});contacts.forEach(([a,b])=>{if(!contactR.has(pairKey(a,b)))edge(a,b);});const region=(id:string)=>{const seen=new Set([id]),q=[id];for(let i=0;i<q.length;i++)for(const next of graph.get(q[i])??[])if(!seen.has(next)){seen.add(next);q.push(next);}return seen;};let side=region(wire.to.terminalId),sign=1;if(side.has(wire.from.terminalId))return null;if(source.some(s=>side.has(s.id))){side=region(wire.from.terminalId);sign=-1;}return Object.entries(ports).reduce((sum,[id,[a,b]])=>{const z=solved.amps[id]??{re:0,im:0},k=(Number(side.has(a))-Number(side.has(b)))*sign;return {re:sum.re+k*z.re,im:sum.im+k*z.im};},{re:0,im:0});};
 const wireClampAmps=(ids:string[])=>{const readings=ids.map(wirePhasor);return readings.some(v=>v===null)?null:switchingRms(readings.reduce<{re:number;im:number}>((sum,z)=>({re:sum.re+z!.re,im:sum.im+z!.im}),{re:0,im:0}),model);};
 return {root,branches,current,voltage,fault,earth,earthVoltage:earth.voltage,lineAmps,wireClampAmps,clampAmps:(phases:string[])=>switchingRms(phases.reduce((v,p)=>({re:v.re+(linePhasors[p]?.re??0),im:v.im+(linePhasors[p]?.im??0)}),{re:0,im:0}),model),thermalAmps:thermalPoles.map(p=>p.amps),thermalBypassed:thermalPoles.some(p=>p.bypassed),connection,positiveVolts,negativeVolts,unbalancePct:positiveVolts>1?100*negativeVolts/positiveVolts:0};
}

/** A current input closes the opened branch, but a short/overrange never becomes a virtual cable. */
export function panelAmmeterBridge(wires:BananaCable[],input:SimulationInput,relays:RelayState,timed:readonly string[],model:PanelMeterModel,meter:PanelAmmeter|null):BananaCable|null{
 if(!meter||![meter.red,meter.black].every(id=>TERMINALS.some(t=>t.key===id)))return null;
 const solved=panelElectrical(wires,input,relays,timed,model,meter);
 if(solved.fault||solved.current>(meter.limit??AMMETER_MAX)||solved.root(meter.red)===solved.root(meter.black))return null;
 // Never bypass a source directly, even before energizing it.
 const nodes=new Set([solved.root(meter.red),solved.root(meter.black)]);
 if(['F','N','R','S','T'].filter(p=>nodes.has(solved.root(`FUENTE:${p}`))).length>1)return null;
 return {id:'panel-ammeter-bridge',from:{terminalId:meter.red},to:{terminalId:meter.black},color:'#bd3035',layer:0};
}
