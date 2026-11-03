import {MODULES,TERMINALS} from './panel';
import {effectiveWires,type PanelFault} from './panelFaults';
import type {BananaCable} from './practice';

/** Tierra de protección (TP/PE). Modelo didáctico, no certifica el equipo físico.
 *  Supuesto: la TP de la fuente es la referencia de tierra del banco (esquema TN-S: neutro de la red unido a tierra en el origen),
 *  por eso la tensión de las fases se mide contra ella. Esa unión interna sigue «por confirmar» en el banco real.
 *
 *  En la realidad un motor sin tierra GIRA igual: la tierra no alimenta nada. Lo que cambia es la seguridad:
 *  - con tierra y una fuga de aislación, la corriente vuelve por TP y el cuerpo del motor queda a 0 V;
 *  - sin tierra, la carcasa queda flotando a la tensión de la fuga y quien la toque cierra el circuito con su cuerpo. */
export const EARTH_SOURCE='FUENTE:TP',MOTOR_CASING='BORNERA_MOTOR:TP';
/** Resistencia del cuerpo humano (mano a pie, piel seca) y umbral de corriente peligrosa en CA que usan los diferenciales de 30 mA. */
export const BODY_OHMS=1000,SHOCK_AMPS=.03;
/** Fuga a tierra tan alta que equivale a un cortocircuito franco a tierra. */
export const GROUND_FAULT_AMPS=2;
export const isEarthTerminal=(id:string)=>/:TP(_IZQ|_DER)?$/.test(id);
type Phasor={re:number;im:number};
export type EarthHazard='ok'|'sin-tierra'|'fuga'|'choque'|'falla-a-tierra';
export type EarthLeak={terminal:string;ohms:number;volts:number};
export type EarthState={
 /** BORNERA_MOTOR:TP llega a la TP de la fuente por cables. */
 motorBonded:boolean;
 /** Módulos del banco cuyos bornes TP no llegan a la TP de la fuente. */
 unbondedModules:string[];
 /** Una fase o el mando están unidos a la tierra de protección. */
 short:boolean;
 leaks:EarthLeak[];
 /** Con tierra: corriente de fuga que vuelve por TP (A). */
 groundAmps:number;
 /** Sin tierra: tensión de la carcasa en vacío (V), la que mide un voltímetro. */
 casingVolts:number;
 /** Sin tierra: corriente y tensión sobre una persona que toca la carcasa. */
 bodyAmps:number;touchVolts:number;
 hazard:EarthHazard;
 /** Tensión entre dos bornes TP, o null si alguno no es TP. */
 voltage:(a:string,b:string)=>number|null;
};
/** `edges` son las uniones por cable de la tierra: conductores ideales y cables con resistencia (los cortados no se incluyen). */
export function earthModel(edges:readonly (readonly [string,string])[],faults:readonly PanelFault[],phasorOf:(terminal:string)=>Phasor|null):EarthState{
 const parent=new Map(TERMINALS.map(t=>[t.key,t.key]));
 const root=(id:string):string=>{const p=parent.get(id);if(!p)return id;if(p!==id)parent.set(id,root(p));return parent.get(id)!;};
 for(const [a,b] of edges)parent.set(root(a),root(b));
 /* Los bornes TP izquierdo y derecho de un mismo módulo son una barra de tierra común: así la cadena de tierras pasa de un aparato al siguiente. */
 const bus=new Map<string,string>();
 for(const t of TERMINALS)if(isEarthTerminal(t.key)){const first=bus.get(t.module.id);if(first)parent.set(root(t.key),root(first));else bus.set(t.module.id,t.key);}
 const ground=root(EARTH_SOURCE),bonded=(id:string)=>root(id)===ground;
 const motorBonded=bonded(MOTOR_CASING);
 const modules=new Map<string,boolean>();
 for(const t of TERMINALS)if(isEarthTerminal(t.key))modules.set(t.module.id,(modules.get(t.module.id)??false)||bonded(t.key));
 const unbondedModules=[...modules].filter(([,ok])=>!ok).map(([id])=>id);
 const short=['R','S','T','F'].some(p=>bonded(`FUENTE:${p}`));
 const leaks:EarthLeak[]=[];
 for(const f of faults)if(f.kind==='insulation'){const z=phasorOf(f.terminal),ohms=Math.max(1,f.ohms);leaks.push({terminal:f.terminal,ohms,volts:z?Math.hypot(z.re,z.im):0});}
 let groundAmps=0,casingVolts=0,bodyAmps=0,touchVolts=0,casing:Phasor={re:0,im:0};
 if(leaks.length){
  const sum=faults.flatMap(f=>f.kind==='insulation'?[{z:phasorOf(f.terminal)??{re:0,im:0},g:1/Math.max(1,f.ohms)}]:[]);
  const current=sum.reduce((s,x)=>({re:s.re+x.z.re*x.g,im:s.im+x.z.im*x.g}),{re:0,im:0}),conductance=sum.reduce((s,x)=>s+x.g,0);
  if(motorBonded)groundAmps=Math.hypot(current.re,current.im);
  else{
   casing={re:current.re/conductance,im:current.im/conductance};casingVolts=Math.hypot(casing.re,casing.im);
   bodyAmps=casingVolts/(1/conductance+BODY_OHMS);touchVolts=bodyAmps*BODY_OHMS;
  }
 }
 const hazard:EarthHazard=!leaks.length?(motorBonded?'ok':'sin-tierra'):motorBonded?(groundAmps>=GROUND_FAULT_AMPS?'falla-a-tierra':'fuga'):(bodyAmps>=SHOCK_AMPS?'choque':'fuga');
 const potential=(id:string):Phasor=>bonded(id)?{re:0,im:0}:leaks.length&&root(id)===root(MOTOR_CASING)?casing:{re:0,im:0};
 const voltage=(a:string,b:string)=>{if(!isEarthTerminal(a)||!isEarthTerminal(b))return null;const x=potential(a),y=potential(b);return Math.hypot(x.re-y.re,x.im-y.im);};
 return {motorBonded,unbondedModules,short,leaks,groundAmps,casingVolts,bodyAmps,touchVolts,hazard,voltage};
}
const fmt=(n:number,d=0)=>n.toFixed(d).replace('.',',');
/** Aviso didáctico de seguridad para el banco energizado; vacío si no hay nada que advertir. */
export function earthAdvice(e:EarthState,energized:boolean):string{
 if(!energized)return '';
 if(e.short)return 'Una fase o el mando están unidos a la tierra de protección: es un cortocircuito a tierra. Desenergiza y retira ese cable.';
 if(e.hazard==='choque')return `Sin tierra en el motor y con fuga de aislación: la carcasa queda a ${fmt(e.casingVolts)} V y una persona que la toque recibiría unos ${fmt(e.bodyAmps*1000)} mA (peligro de choque). Nada dispara porque la corriente no tiene camino de retorno por TP. Une BORNERA_MOTOR TP con TP de la fuente.`;
 if(e.hazard==='falla-a-tierra')return `Falla franca a tierra: ${fmt(e.groundAmps,1)} A vuelven por TP. En una instalación real esto debe abrir la protección; este banco no tiene diferencial ni curva de disparo modelados.`;
 if(e.hazard==='fuga')return e.motorBonded?`Fuga de aislación: ${fmt(e.groundAmps*1000,1)} mA vuelven por TP. La carcasa sigue a 0 V porque la tierra está conectada.`:`Fuga de aislación sin tierra: la carcasa flota a ${fmt(e.casingVolts)} V. Aún por debajo del umbral de choque de 30 mA, pero no hay camino de retorno por TP.`;
 if(e.hazard==='sin-tierra')return 'El motor no está unido a tierra de protección (TP). Gira igual, pero si la aislación fallara la carcasa quedaría con tensión y ninguna protección actuaría. Une BORNERA_MOTOR TP con TP de la fuente.';
 return '';
}

type Wire={from:{terminalId:string};to:{terminalId:string}};
/** La tierra es una sola: basta un cable de TP entre el motor y la TP de la fuente. Devuelve el módulo que queda sin tierra (el motor) o nada. */
export function earthGaps(wires:readonly BananaCable[],faults:readonly PanelFault[]):string[]{
 const eff=effectiveWires(wires as BananaCable[],faults);
 return earthModel([...eff.ideal.map(w=>[w.from.terminalId,w.to.terminalId] as const),...eff.resistive.map(w=>[w.a,w.b] as const)],[],()=>null).motorBonded?[]:['BORNERA_MOTOR'];
}
export const earthGapText=(ids:readonly string[])=>`Falta la tierra de protección (TP) del motor${ids.length&&ids[0]!=='BORNERA_MOTOR'?` en: ${ids.map(id=>MODULES.find(m=>m.id===id)?.title??id).join(', ')}`:''}. Une la TP del ${MODULES.find(m=>m.id==='BORNERA_MOTOR')?.title??'motor'} con la TP de la fuente (basta un cable) antes de energizar.`;
/** Cable de tierra que completa un montaje: la TP del motor hacia la TP de la fuente, si aún no están unidas. */
export const earthCompletion=(wires:readonly Wire[]):[string,string][]=>
 earthModel(wires.map(w=>[w.from.terminalId,w.to.terminalId] as const),[],()=>null).motorBonded?[]:[[MOTOR_CASING,EARTH_SOURCE]];
