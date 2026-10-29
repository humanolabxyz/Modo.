import {DEFAULT_PANEL_METER_MODEL,type PanelMeterModel} from './panelElectrical';
import {MOTOR_EQUIVALENT,type MotorParameters} from './panelMotorDynamics';
import {readMotorRating} from './machinePreparation';
import {DEFAULT_THERMAL,type ThermalSettings} from './panelRuntime';
export type ResistanceDatum={ohms:number;reference:string};
export type PanelCalibration={version:1;name:string;reference:string;model:PanelMeterModel;thermal:ThermalSettings;contacts:{pickupMs:number;dropMs:number;gapMs:number};resistanceMode:'model'|'provided';resistances:Record<string,ResistanceDatum>};
export const CALIBRATION_KEY='modo:panel:calibration:v1';
export const resistanceKey=(a:string,b:string)=>[a,b].sort().join('|');
export const defaultCalibration=():PanelCalibration=>({version:1,name:'Banco didáctico · parámetros de ejemplo',reference:'Sin datos físicos del laboratorio',model:{...DEFAULT_PANEL_METER_MODEL,motorParameters:{...MOTOR_EQUIVALENT}},thermal:{...DEFAULT_THERMAL},contacts:{pickupMs:40,dropMs:25,gapMs:80},resistanceMode:'model',resistances:{}});
export const MOTOR_FIELDS:{key:keyof MotorParameters;label:string;min:number;max:number}[]=[{key:'statorOhms',label:'Resistencia del estator (Ω)',min:.05,max:1000},{key:'rotorOhms',label:'Resistencia del rotor referida (Ω)',min:.05,max:1000},{key:'statorX50',label:'Reactancia del estator a 50 Hz (Ω)',min:.01,max:2000},{key:'rotorX50',label:'Reactancia del rotor a 50 Hz (Ω)',min:.01,max:2000},{key:'magnetizingX50',label:'Reactancia magnetizante a 50 Hz (Ω)',min:1,max:10000},{key:'poles',label:'Número de polos',min:2,max:12},{key:'inertia',label:'Inercia (kg·m²)',min:.005,max:10},{key:'friction',label:'Rozamiento (N·m·s/rad)',min:0,max:1}];
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const num=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function readCalibration(raw:unknown):PanelCalibration{
 if(!obj(raw)||raw.version!==1||typeof raw.name!=='string'||raw.name.length>160||typeof raw.reference!=='string'||raw.reference.length>2000||!obj(raw.model)||!obj(raw.thermal)||!obj(raw.contacts)||!obj(raw.resistances))throw Error('Perfil incompatible. El guardado anterior se conserva.');
 const d=defaultCalibration(),m=raw.model,t=raw.thermal,c=raw.contacts,p=m.motorParameters;
 if(!obj(p)||MOTOR_FIELDS.some(f=>!num(p[f.key],f.min,f.max))||!Number.isInteger(p.poles)||Number(p.poles)%2!==0)throw Error('Parámetros del motor inválidos.');
 for(const [key,min,max] of [['lineVolts',24,690],['frequencyHz',20,70],['coilOhms',1,1e6],['pilotOhms',1,1e6],['windingOhms',.05,1e5],['lineOhms',0,10],['loadTorqueNm',0,40]] as const)if(!num(m[key],min,max))throw Error('Valor fuera de rango: '+key);
 if(m.supplyVariationEnabled!==undefined&&typeof m.supplyVariationEnabled!=='boolean')throw Error('Activación de perturbación de red inválida.');
 if(m.supplyVariationPct!==undefined&&!num(m.supplyVariationPct,0,1))throw Error('Variación de red fuera de rango (0–1 %).');
 if(m.motorMode!=='induction'||!num(t.amps,.1,200)||![5,10,20,30].includes(Number(t.tripClass))||t.enabled!==true||!num(t.coolingSeconds,10,3600)||!num(t.resetLevel,.1,.9)||!num(c.pickupMs,0,500)||!num(c.dropMs,0,500)||!num(c.gapMs,20,1000)||!['model','provided'].includes(String(raw.resistanceMode)))throw Error('Protección o tiempos inválidos.');
 const resistances:PanelCalibration['resistances']={};if(Object.keys(raw.resistances).length>100)throw Error('Demasiadas resistencias.');
 for(const [key,r] of Object.entries(raw.resistances)){if(!/^[A-Z0-9_:]+\|[A-Z0-9_:]+$/.test(key)||!obj(r)||!num(r.ohms,.001,1e7)||typeof r.reference!=='string'||!r.reference.trim()||r.reference.length>1000)throw Error('Resistencia sin valor o referencia válida.');resistances[key]={ohms:Number(r.ohms),reference:r.reference};}
 const model:PanelMeterModel={...d.model};for(const key of ['lineVolts','frequencyHz','coilOhms','pilotOhms','windingOhms','lineOhms','loadTorqueNm','motorMode'] as const)(model as Record<string,unknown>)[key]=m[key];model.supplyVariationEnabled=m.supplyVariationEnabled===true;model.supplyVariationPct=m.supplyVariationPct===undefined?d.model.supplyVariationPct:Number(m.supplyVariationPct);model.nameplate=m.nameplate===undefined?d.model.nameplate:readMotorRating(m.nameplate);model.motorParameters=Object.fromEntries(MOTOR_FIELDS.map(f=>[f.key,p[f.key]])) as MotorParameters;
 return {version:1,name:raw.name,reference:raw.reference,model,thermal:{enabled:t.enabled,amps:Number(t.amps),tripClass:Number(t.tripClass) as 5|10|20|30,coolingSeconds:Number(t.coolingSeconds),resetLevel:Number(t.resetLevel)},contacts:{pickupMs:Number(c.pickupMs),dropMs:Number(c.dropMs),gapMs:Number(c.gapMs)},resistanceMode:raw.resistanceMode as 'model'|'provided',resistances};
}
