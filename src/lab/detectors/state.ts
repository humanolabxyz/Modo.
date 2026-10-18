import {DIST_MAX,FICHA_FIELDS,KINDS,KIND_NAMES,MATERIAL_NAMES,MODELS,OUTPUT_NAMES,TERMINALS,levelOf,terminalLabel,type Ficha,type Kind,type Material,type ModelId,type Output,type Settings,type Terminal} from './physics';
/** Estado persistido del banco de detectores. Los registros «simulada» (preparación) y «real» (clase) viven en la misma lista pero nunca se mezclan. */
export type Source='simulada'|'real';
export type DetRecord={id:string;source:Source;model:'generic'|ModelId;kind:Kind;output:Output;object:Material;detected:boolean;ref:'0v'|'plus';value:number;at:number};
export const benchKey=(id:string|null|undefined)=>`modo:detectors:bench:${id||'free'}:v1`;
export const progressKey=(id:string)=>`modo:detectors:progress:${id}:v1`;
export const seriesKey=(r:Pick<DetRecord,'model'|'kind'|'output'>)=>r.model==='generic'?`${r.kind}-${r.output}`:r.model;
export const seriesName=(r:Pick<DetRecord,'model'|'kind'|'output'>)=>r.model==='generic'?`${KIND_NAMES[r.kind]} ${OUTPUT_NAMES[r.output]}`:`${r.model} (${KIND_NAMES[r.kind]} ${OUTPUT_NAMES[r.output]})`;
const recordKey=(r:DetRecord)=>`${r.source}|${seriesKey(r)}|${r.object}|${r.detected?1:0}|${r.ref}`;
/** Agrega un registro; repetir la misma condición (origen, detector, objeto, referencia) reemplaza al anterior. */
export function addRecord(list:DetRecord[],record:DetRecord):DetRecord[]{
  const key=recordKey(record);return [...list.filter(r=>recordKey(r)!==key),record].sort((a,b)=>seriesKey(a).localeCompare(seriesKey(b))||a.ref.localeCompare(b.ref)||a.object.localeCompare(b.object));
}

const isTerminal=(v:unknown):v is Terminal=>TERMINALS.some(t=>t.id===v);
const isFicha=(f:unknown):f is Ficha=>{
  if(typeof f!=='object'||f===null)return false;const r=f as Record<string,unknown>;
  return FICHA_FIELDS.every(k=>typeof r[k]==='string'&&(r[k] as string).length<=60)&&['','2','3','4'].includes(r.wires as string)&&(r.principle===''||KINDS.includes(r.principle as Kind))&&['','pnp','npn','other'].includes(r.output as string);
};
export function serializeBench(settings:Settings,records:DetRecord[]):string{return JSON.stringify({version:1,settings,records});}
/** Lee y valida un guardado. Lanza un error si no es compatible; quien llama conserva el texto original sin sobrescribirlo. */
export function parseBench(raw:string):{settings:Settings;records:DetRecord[]}{
  const data:unknown=JSON.parse(raw);
  if(typeof data!=='object'||data===null||(data as {version?:unknown}).version!==1)throw new Error('Guardado incompatible');
  const {settings:s,records}=data as {settings:Record<string,unknown>;records:unknown};
  const fichas=s?.fichas as Record<string,unknown>|undefined;
  const ok=!!s&&KINDS.includes(s.kind as Kind)&&(s.output==='pnp'||s.output==='npn')&&(s.model==='generic'||MODELS.includes(s.model as ModelId))&&typeof s.supplyOn==='boolean'
    &&['none','metal','plastic'].includes(s.object as string)&&typeof s.distance==='number'&&s.distance>=0&&s.distance<=DIST_MAX&&(s.mode==='off'||s.mode==='V')
    &&(s.red===null||isTerminal(s.red))&&(s.black===null||isTerminal(s.black))&&Array.isArray(s.wires)&&s.wires.length<=40
    &&(s.wires as unknown[]).every(w=>Array.isArray(w)&&w.length===2&&isTerminal(w[0])&&isTerminal(w[1])&&w[0]!==w[1])&&!!fichas&&MODELS.every(m=>isFicha(fichas[m]));
  if(!ok)throw new Error('Guardado incompatible');
  if(!Array.isArray(records)||records.length>500)throw new Error('Guardado incompatible');
  for(const r of records as Record<string,unknown>[]){
    if(typeof r!=='object'||r===null||typeof r.id!=='string'||r.id.length>60||(r.source!=='simulada'&&r.source!=='real')||!(r.model==='generic'||MODELS.includes(r.model as ModelId))||!KINDS.includes(r.kind as Kind)
      ||(r.output!=='pnp'&&r.output!=='npn')||!['none','metal','plastic'].includes(r.object as string)||typeof r.detected!=='boolean'||(r.ref!=='0v'&&r.ref!=='plus')||typeof r.value!=='number'||!Number.isFinite(r.value)||Math.abs(r.value)>1000||typeof r.at!=='number')throw new Error('Guardado incompatible');
  }
  return {settings:s as unknown as Settings,records:records as DetRecord[]};
}

/** Números con coma o punto decimal. Rechaza texto, separadores de miles y valores vacíos. */
export function parseNumber(text:string):number|null{
  const t=text.trim().replace(',','.');
  return /^-?\d+(\.\d+)?$/.test(t)?Number(t):null;
}
export function formatNumber(value:number,digits:number):string{
  const fixed=Number(value.toFixed(digits));return (Object.is(fixed,-0)?0:fixed).toFixed(digits).replace('.',',');
}
export const formatVolts=(v:number)=>`${formatNumber(v,2)} V`;
export const formatMm=(mm:number)=>`${formatNumber(mm,mm%1?1:0)} mm`;
export const connectionText=([a,b]:[Terminal,Terminal])=>`${terminalLabel(a)} ↔ ${terminalLabel(b)}`;

/** CSV para planilla en español (separador «;» y coma decimal). */
export function toCsv(records:DetRecord[]):string{
  const rows=records.map(r=>[r.source,seriesName(r),MATERIAL_NAMES[r.object],r.detected?'sí':'no',r.ref==='0v'?'OUT-0V':'OUT-+V',formatNumber(r.value,2),levelOf(r.value,r.ref),new Date(r.at).toLocaleString('es-CL')]);
  return ['origen;detector;objeto;detectado;medida;tension_V;nivel;fecha',...rows.map(r=>r.join(';'))].join('\r\n');
}
