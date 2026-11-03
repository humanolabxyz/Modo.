import type {BananaCable} from './practice';
import {divide,multiply,type Complex} from './panelAC';
/** Fallas físicas de laboratorio que se inyectan en el banco virtual. Las usan por igual el modelo lógico (simulation.ts),
 *  el solver AC (panelElectrical.ts) y el óhmetro (panelMeter.ts), para que ningún instrumento vea un circuito distinto. */
export type PanelFault=
 |{id:string;kind:'wire-open';wire:string}
 /** Falso contacto: el cable conduce solo parte del tiempo (reloj de simulación, determinista). */
 |{id:string;kind:'wire-loose';wire:string;period?:number;closedFraction?:number}
 |{id:string;kind:'wire-resistive';wire:string;ohms:number}
 |{id:string;kind:'coil-open';relay:string}
 /** Par de bornes de un contacto (polo, auxiliar o pulsador) que no cierra o que quedó pegado cerrado. */
 |{id:string;kind:'contact-open'|'contact-welded';a:string;b:string}
 |{id:string;kind:'contact-resistive';a:string;b:string;ohms:number}
 |{id:string;kind:'pilot-burnt';n:number}
 |{id:string;kind:'winding-open';phase:'U'|'V'|'W'}
 /** Fuga de un borne del motor hacia la carcasa (TP). Con tierra conectada la corriente vuelve por TP; sin tierra la carcasa queda con tensión (ver panelEarth.ts). Se mide con el óhmetro y con el voltímetro entre TP. */
 |{id:string;kind:'insulation';terminal:string;ohms:number}
 |{id:string;kind:'sequence-reversed'}
 /** Rotor frenado o carga mecánica excesiva: el motor se queda a velocidad cero y pide corriente de rotor bloqueado. */
 |{id:string;kind:'rotor-locked'}
 |{id:string;kind:'control-low';volts:number}
 |{id:string;kind:'thermal-weak';factor:number}
 |{id:string;kind:'thermal-dead'}
 |{id:string;kind:'timer-fast'}
 |{id:string;kind:'timer-stuck'};
export type PanelFaultKind=PanelFault['kind'];
/** Un cable con tanta resistencia no conduce nada útil: se trata como cortado en todos los solvers. */
export const OPEN_OHMS=10000;
export const COIL_VOLTS=24,PICKUP_FRACTION=.85,DROPOUT_FRACTION=.5;
export const pairKey=(a:string,b:string)=>a<b?a+'|'+b:b+'|'+a;
export const faultsOf=(input?:{faults?:readonly PanelFault[]}|null):readonly PanelFault[]=>input?.faults??[];
export const hasFault=(faults:readonly PanelFault[],kind:PanelFaultKind)=>faults.some(f=>f.kind===kind);
/** Los falsos contactos se resuelven a «abierto» o «sin falla» según el reloj, de modo que todos los solvers vean fallas estáticas. */
export function resolveFaults(faults:readonly PanelFault[]|undefined,seconds:number):PanelFault[]{
 if(!faults?.length)return [];
 const out:PanelFault[]=[];
 for(const f of faults){
  if(f.kind!=='wire-loose'){out.push(f);continue;}
  const period=Math.max(.5,f.period??3.2),closed=Math.min(.95,Math.max(.05,f.closedFraction??.65)),phase=(((seconds%period)+period)%period)/period;
  if(phase>=closed)out.push({id:f.id,kind:'wire-open',wire:f.wire});
 }
 return out;
}
/** Cables que quedan como conductor ideal y cables que pasan a ser una resistencia (falso contacto, terminal flojo, banana oxidada). */
export function effectiveWires(wires:BananaCable[],faults:readonly PanelFault[]){
 if(!faults.length)return {ideal:wires,resistive:[] as {id:string;a:string;b:string;ohms:number}[]};
 const open=new Set<string>(),ohms=new Map<string,number>();
 for(const f of faults){if(f.kind==='wire-open')open.add(f.wire);else if(f.kind==='wire-resistive'){if(f.ohms>=OPEN_OHMS)open.add(f.wire);else ohms.set(f.wire,Math.max(.01,f.ohms));}}
 const resistive:{id:string;a:string;b:string;ohms:number}[]=[];
 const ideal=wires.filter(w=>{if(open.has(w.id))return false;const r=ohms.get(w.id);if(r===undefined)return true;resistive.push({id:w.id,a:w.from.terminalId,b:w.to.terminalId,ohms:r});return false;});
 return {ideal,resistive};
}
/** Contactos con falla: los abiertos se retiran y los pegados se agregan estén o no accionados. */
export function applyContactFaults(pairs:[string,string][],faults:readonly PanelFault[]):[string,string][]{
 const open=new Set<string>(),welded:[string,string][]=[];
 /* Un contacto con tanta resistencia como un cable cortado (OPEN_OHMS) no conduce: abierto en el modelo lógico, el solver AC y el óhmetro por igual. */
 for(const f of faults){if(f.kind==='contact-open'||f.kind==='contact-resistive'&&f.ohms>=OPEN_OHMS)open.add(pairKey(f.a,f.b));else if(f.kind==='contact-welded')welded.push([f.a,f.b]);}
 if(!open.size&&!welded.length)return pairs;
 const kept=pairs.filter(([a,b])=>!open.has(pairKey(a,b))),have=new Set(kept.map(([a,b])=>pairKey(a,b)));
 for(const [a,b] of welded)if(!have.has(pairKey(a,b))){kept.push([a,b]);have.add(pairKey(a,b));}
 return kept;
}
export const contactOhms=(faults:readonly PanelFault[]):Map<string,number>=>new Map(faults.flatMap(f=>f.kind==='contact-resistive'?[[pairKey(f.a,f.b),Math.max(.02,f.ohms)] as [string,number]]:[]));
/** Hay que consultar tensiones reales de bobina cuando una falla las puede bajar sin abrir el circuito. */
export const needsNumericControl=(faults:readonly PanelFault[])=>faults.some(f=>f.kind==='wire-resistive'||f.kind==='contact-resistive'||f.kind==='control-low');
export const controlSourceVolts=(faults:readonly PanelFault[])=>{const low=faults.find(f=>f.kind==='control-low');return low&&low.kind==='control-low'?Math.max(0,low.volts):COIL_VOLTS;};
/** Una bobina de CA cierra por sobre ~85 % de su tensión y se mantiene hasta ~50 %. */
export const coilHolds=(volts:number|null|undefined,wasClosed:boolean)=>volts!=null&&volts>=COIL_VOLTS*(wasClosed?DROPOUT_FRACTION:PICKUP_FRACTION);
/** Complemento de Schur: admitancia de los devanados que siguen conectados cuando uno queda abierto (su corriente es cero). */
export function openWindingAdmittance(y:Complex[][],open:number):Complex[][]{
 const yo=y[open][open];
 return y.map((row,j)=>row.map((value,k)=>{
  if(j===open||k===open)return {re:0,im:0};
  const t=multiply(multiply(y[j][open],y[open][k]),divide({re:1,im:0},yo));
  return {re:value.re-t.re,im:value.im-t.im};
 }));
}
type ThermalLike={enabled:boolean;amps:number};
export function thermalWithFaults<T extends ThermalLike>(settings:T,faults:readonly PanelFault[]):T{
 let next=settings;
 for(const f of faults){if(f.kind==='thermal-weak')next={...next,amps:Math.max(.1,next.amps*f.factor)};else if(f.kind==='thermal-dead')next={...next,enabled:false};}
 return next;
}
/** Par resistente que ve el motor: con el rotor bloqueado supera cualquier par que pueda desarrollar. */
export const LOCKED_ROTOR_NM=400;
export const loadTorqueWithFaults=(nm:number|undefined,faults:readonly PanelFault[])=>hasFault(faults,'rotor-locked')?LOCKED_ROTOR_NM:nm;
export function timerDuration(seconds:number,faults:readonly PanelFault[]){
 if(hasFault(faults,'timer-stuck'))return 1e6;
 return hasFault(faults,'timer-fast')?Math.min(seconds,.25):seconds;
}
