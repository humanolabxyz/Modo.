import type {RelayState,SimulationInput} from './simulation';
import {activityRoles} from './measurementProfiles';
import type {ActivityContext,ActivityProfile,ActivityStep} from './meterActivity';
import type {PanelReading} from './panelMeter';
import {parseMeterReadout} from '../lab/meterReadout';
export type TraceAction={kind:'press'|'test'|'thermalReset'|'timer';control?:string};
export type TraceState={enabled:boolean;plugged:boolean;force:boolean;control:boolean;tripped:boolean;relays:RelayState;rpm:number};
export type SimulationEvent=TraceAction&{id:number;seconds:number;before:TraceState;after:TraceState};
export const traceState=(input:SimulationInput,relays:RelayState,rpm:number):TraceState=>({enabled:input.enabled,plugged:input.plugged,force:input.forceBreaker,control:input.breakers.every(Boolean),tripped:input.thermalTripped,relays:{...relays},rpm});
export type ActionProof={version:1;eventId:number;kind:TraceAction['kind'];control?:string;seconds:number;from:string;to:string};
export function validActionProof(v:unknown){const p=v as ActionProof;return !!p&&p.version===1&&Number.isInteger(p.eventId)&&p.eventId>0&&Number.isFinite(p.seconds)&&p.seconds>=0&&['press','test','thermalReset','timer'].includes(p.kind)&&(p.control===undefined||typeof p.control==='string'&&p.control.length<80)&&typeof p.from==='string'&&p.from.length<50&&typeof p.to==='string'&&p.to.length<50;}

function mode(s:TraceState,profile:ActivityProfile){const r=activityRoles(profile);return s.tripped?'disparo':s.relays[r.main]&&s.relays[r.star]&&!s.relays[r.delta]?'estrella':s.relays[r.main]&&s.relays[r.delta]&&!s.relays[r.star]?'triángulo':Object.values(s.relays).every(v=>!v)?'reposo':'otro estado';}
export function actionRequirement(step:ActivityStep,profile:ActivityProfile):{kind:TraceAction['kind'];control?:string;from:string;to:string;message:string}|null{
 if(['control-star','start-star'].includes(step.id))return {kind:'press',control:activityRoles(profile).start,from:'reposo',to:'estrella',message:`Desde reposo, pulsa y suelta ${activityRoles(profile).start}. Deben mantenerse el conjunto principal y estrella sin sostener el pulsador.`};
 if(['control-delta','change-delta'].includes(step.id))return {kind:profile==='manual'?'press':'timer',control:profile==='manual'?'S3':'TEMPORIZADOR_1',from:'estrella',to:'triángulo',message:profile==='manual'?'Primero deja el circuito en estrella. Después pulsa y suelta S3 (SB3) para comprobar el cambio a triángulo.':`Primero inicia estrella con ${activityRoles(profile).start} y espera el cambio del temporizador en este paso.`};
 if(['control-trip','overload'].includes(step.id))return {kind:'test',from:'triángulo',to:'disparo',message:'Con el circuito en triángulo, pulsa TEST del relé. Un disparo automático o cortar la alimentación no sustituye esta prueba.'};
 if(['control-reset','reset'].includes(step.id))return {kind:'thermalReset',from:'disparo',to:'reposo',message:'Con el relé disparado y las bobinas desactivadas, pulsa RESET. El mando debe seguir alimentado y no debe dar marcha.'};
 return null;
}
export function checkActionEvidence(step:ActivityStep,c:ActivityContext,events:SimulationEvent[],since:number){
 const required=actionRequirement(step,c.profile);if(!required)return {ready:true,message:''};
 const event=[...events].reverse().find(e=>e.id>since&&e.kind===required.kind&&(!required.control||e.control===required.control)&&e.before.enabled&&e.before.plugged&&e.before.control&&e.before.force===!step.stage.startsWith('control')&&e.after.enabled&&e.after.plugged&&e.after.control&&e.after.force===e.before.force&&mode(e.before,c.profile)===required.from&&mode(e.after,c.profile)===required.to&&(required.kind!=='thermalReset'||Object.values(e.before.relays).every(v=>!v))&&(required.kind!=='test'||Object.values(e.after.relays).every(v=>!v)));
 if(!event)return {ready:false,message:required.message};
 if(c.input.pressed.length)return {ready:false,message:'Suelta los pulsadores antes de comprobar la retención y seguir.'};
 const proof:ActionProof={version:1,eventId:event.id,kind:event.kind,control:event.control,seconds:event.seconds,from:required.from,to:required.to};
 return {ready:true,message:`Transición comprobada: ${required.from} → ${required.to}.`,proof};
}
export type MeasurementConditions={simulationSeconds:number;lineVolts:number;frequencyHz:number;relayAmps:number;profile:string;connection:'star'|'delta'|null};
export type CapturedMeasurement={stepId:string;reading:PanelReading;at:string;capturedAt:string;rpm:number;loadTorqueNm:number;motorMode:'induction'|'resistive';conditions:MeasurementConditions};
export const validConditions=(v:unknown)=>{const c=v as MeasurementConditions;return !!c&&[c.simulationSeconds,c.lineVolts,c.frequencyHz,c.relayAmps].every(Number.isFinite)&&c.simulationSeconds>=0&&c.lineVolts>0&&c.frequencyHz>0&&c.relayAmps>0&&typeof c.profile==='string'&&c.profile.length<=160&&[null,'star','delta'].includes(c.connection);};
/** Compare the transcribed digits, including the displayed unit's scale, not a percentage of a moving target. */
export function matchesCapturedReading(written:string,reading:PanelReading){
 if(reading.value===null)return reading.text.trim()==='OL'&&written.trim().toUpperCase()==='OL';
 if(!/^-?\d+(?:[.,]\d+)?$/.test(written.trim()))return false;const visible=parseMeterReadout(reading.text);if(!visible)return false;
 return Math.abs(Number(written.replace(',','.'))-Number(visible.token.replace(',','.')))<=Math.max(1e-10,Math.abs(Number(visible.token.replace(',','.')))*1e-12);
}
