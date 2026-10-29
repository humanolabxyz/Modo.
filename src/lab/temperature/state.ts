import {instrumentSample} from './instrument';
import {AMBIENT_MAX,AMBIENT_MIN,SET_MAX,normalizeSettings,type Sensor,type Settings,type TcType,type Terminal} from './physics';
/** Estado persistido del banco de temperatura y formato de los datos. Los registros «simulada» (preparación) y «real» (clase)
 *  viven en la misma lista pero nunca se mezclan: cada uno conserva su origen. */
export type Unit='mV'|'Ω'|'V';
export type Source='simulada'|'real';
export type TempRecord={id:string;source:Source;sensor:Sensor;tcType:TcType|null;temp:number;value:number;unit:Unit;ambient:number;at:number;setpoint?:number;bath?:number;transcribed?:boolean;ptLeadOhms?:number;trial?:number;txType?:TcType;txMin?:number;txMax?:number};
/** Legacy measurements remain available, but an unknown transmitter range cannot certify a new series. */
export function matchesTempSeries(r:TempRecord,s:Settings){return Math.abs(r.ambient-s.ambient)<.05&&(r.sensor==='pt'?Math.abs((r.ptLeadOhms??0)-(s.ptLeadOhms??0))<1e-9:r.tcType===s.tcType&&(r.sensor!=='tx'||r.txType===s.txType&&r.txMin===s.txMin&&r.txMax===s.txMax));}
export const UNIT_OF:Record<Sensor,Unit>={tc:'mV',pt:'Ω',tx:'V'};
export const SENSOR_NAMES:Record<Sensor,string>={tc:'Termocupla',pt:'Pt100',tx:'Salida del transmisor'};
export const sensorName=(sensor:Sensor,tcType:TcType|null)=>sensor==='pt'?'Pt100':sensor==='tc'?`Termocupla ${tcType??''}`.trim():`Transmisor (termocupla ${tcType??''})`.replace(' ()','');
export const benchKey=(id:string|null|undefined)=>`modo:temperature:bench:${id||'free'}:v1`;
export const progressKey=(id:string)=>`modo:temperature:progress:${id}:v1`;

const recordKey=(r:TempRecord)=>`${r.source}|${r.sensor}|${r.tcType??'-'}|${Math.round(r.temp)}|${r.ptLeadOhms??0}|${r.ambient}|${r.txType??''}|${r.txMin??''}|${r.txMax??''}`;
/** Manual and classroom trials append; legacy automatic curve points retain their replacement semantics. */
export function addRecord(list:TempRecord[],record:TempRecord):TempRecord[]{
  const key=recordKey(record),repeat=record.transcribed||record.source==='real',trial=repeat?Math.max(0,...list.filter(r=>recordKey(r)===key&&Math.abs(r.ambient-record.ambient)<.05).map(r=>r.trial??1))+1:undefined;return [...(repeat?list:list.filter(r=>recordKey(r)!==key)),{...record,...trial?{trial}:{}}].sort((a,b)=>a.sensor.localeCompare(b.sensor)||a.temp-b.temp);
}

const isTerminal=(v:unknown):v is Terminal|null=>v===null||['tc+','tc-','pt1','pt2','pt3','pt4','tx+','tx-'].includes(v as string);
const num=(v:unknown,lo:number,hi:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
export function serializeBench(settings:Settings,records:TempRecord[]):string{return JSON.stringify({version:1,settings,records});}
/** Lee y valida un guardado. Lanza un error si no es compatible; quien llama conserva el texto original sin sobrescribirlo. */
export function parseBench(raw:string):{settings:Settings;records:TempRecord[]}{
  const data:unknown=JSON.parse(raw);
  if(typeof data!=='object'||data===null||(data as {version?:unknown}).version!==1)throw new Error('Guardado incompatible');
  const {settings:s,records}=data as {settings:Record<string,unknown>;records:unknown};
  const w=s?.inWell as Record<string,unknown>|undefined;
  const wires=s?.ptWires===undefined?3:s?.ptWires;
  const ok=s&&(wires===3||wires===4)&&num(s.ambient,AMBIENT_MIN,AMBIENT_MAX)&&(s.tcType==='K'||s.tcType==='J')&&(s.txType==='K'||s.txType==='J')&&num(s.setpoint,AMBIENT_MIN,SET_MAX)&&num(s.txMin,-50,400)&&num(s.txMax,-50,400)
    &&typeof s.txConnected==='boolean'&&typeof s.txPowered==='boolean'&&['off','mV','ohm','V'].includes(s.mode as string)&&isTerminal(s.red)&&isTerminal(s.black)&&!!w&&typeof w.tc==='boolean'&&typeof w.pt==='boolean';
  if(!ok||(s.ptLeadOhms!==undefined&&!num(s.ptLeadOhms,0,10)))throw new Error('Guardado incompatible');
  if(!Array.isArray(records)||records.length>500)throw new Error('Guardado incompatible');
  for(const r of records as Record<string,unknown>[]){
    if((r.txType!==undefined&&r.txType!=='K'&&r.txType!=='J')||(r.txMin!==undefined&&!num(r.txMin,-50,400))||(r.txMax!==undefined&&!num(r.txMax,-50,400)))throw new Error('Configuración de medición incompatible');
    if(typeof r!=='object'||r===null||typeof r.id!=='string'||r.id.length>60||(r.source!=='simulada'&&r.source!=='real')||!['tc','pt','tx'].includes(r.sensor as string)||!(r.tcType===null||r.tcType==='K'||r.tcType==='J')
      ||!num(r.temp,-100,800)||!num(r.value,-1e6,1e6)||!['mV','Ω','V'].includes(r.unit as string)||!num(r.ambient,-50,100)||!num(r.at,0,Number.MAX_SAFE_INTEGER)||(r.setpoint!==undefined&&!num(r.setpoint,-100,800))||(r.bath!==undefined&&!num(r.bath,-100,800))||(r.trial!==undefined&&(!Number.isInteger(r.trial)||!num(r.trial,1,500)))||(r.ptLeadOhms!==undefined&&!num(r.ptLeadOhms,0,10))||(r.transcribed!==undefined&&typeof r.transcribed!=='boolean'))throw new Error('Guardado incompatible');
  }
  /* Los guardados anteriores (sin ptWires) eran de dos bornes: se abren como Pt100 de 3 hilos con sus puntas válidas. */
  const migrated={...(s as unknown as Settings),ptWires:wires as 3|4};
  if(s.ptWires===undefined&&(migrated.red==='pt2'||migrated.black==='pt2')){/* el antiguo borne 2 era el segundo hilo: pasa a ser el blanco */
    if(migrated.red==='pt2')migrated.red='pt3';if(migrated.black==='pt2')migrated.black='pt3';}
  return {settings:normalizeSettings(migrated),records:records as TempRecord[]};
}

/** Números con coma o punto decimal. Rechaza texto, separadores de miles y valores vacíos. */
export function parseNumber(text:string):number|null{
  const t=text.trim().replace(',','.');
  return /^-?\d+(\.\d+)?$/.test(t)?Number(t):null;
}
const DIGITS:Record<Unit,number>={mV:1,'Ω':1,V:3};
export function formatNumber(value:number,digits:number):string{
  const fixed=Number(value.toFixed(digits));return (Object.is(fixed,-0)?0:fixed).toFixed(digits).replace('.',',');
}
export const formatValue=(value:number,unit:Unit)=>`${formatNumber(instrumentSample(value,unit).value,instrumentSample(value,unit).digits)} ${unit}`;
export const formatTemp=(celsius:number)=>`${formatNumber(celsius,1)} °C`;

/** CSV para planilla en español (separador «;» y coma decimal). */
export function toCsv(records:TempRecord[]):string{
  const rows=records.map(r=>[r.source,sensorName(r.sensor,r.tcType),formatNumber(r.temp,1),formatNumber(r.value,DIGITS[r.unit]),r.unit,formatNumber(r.ambient,1),new Date(r.at).toLocaleString('es-CL'),r.setpoint===undefined?'':formatNumber(r.setpoint,1),r.bath===undefined?'':formatNumber(r.bath,1),r.transcribed?'sí':'',r.ptLeadOhms===undefined?'':formatNumber(r.ptLeadOhms,2),r.trial??'',r.txType??'',r.txMin??'',r.txMax??'']);
  return ['origen;sensor;temperatura_C;valor;unidad;ambiente_C;fecha;consigna_C;pozo_C;transcrito;hilo_Pt100_ohm;repeticion;tipo_transmisor;rango_min_C;rango_max_C',...rows.map(r=>r.join(';'))].join('\r\n');
}
