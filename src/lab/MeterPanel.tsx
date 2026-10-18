import {Clipboard,Download,Trash2,X} from 'lucide-react';
import type {Measurement} from './model';
import type {BreadboardResult} from './dc';
import {formatReading} from './units';
import {holeName} from './dc';
/** Multímetro de banco y bitácora de mediciones. Solo presentación: las lecturas salen del solver. */
export type MeterMode='V'|'A'|'R'|'C';
export const MODES:{id:MeterMode;symbol:string;name:string;kind:Measurement['kind']}[]=[
  {id:'V',symbol:'V⎓',name:'Tensión continua',kind:'voltage'},
  {id:'A',symbol:'A⎓',name:'Corriente continua (en serie)',kind:'current'},
  {id:'R',symbol:'Ω',name:'Resistencia',kind:'resistance'},
  {id:'C',symbol:'•))',name:'Continuidad',kind:'continuity'},
];
export type MeterDisplay={text:string;tone:'ok'|'idle'|'warn'|'bad';note:string;record?:{kind:Measurement['kind'];value:number|null};beep?:boolean};
const NOTES:Record<MeterMode,string>={
  V:'Tensión entre la punta roja y la negra. Mide con el circuito energizado; un signo negativo significa puntas invertidas.',
  A:'Corriente: abre el circuito y coloca las puntas en el hueco, en serie. En paralelo cortocircuita el tramo y puede fundir el fusible.',
  R:'Resistencia: mide con el circuito sin energía (con la simulación detenida), con el componente aislado del resto si puedes.',
  C:'Continuidad: se enciende si hay un camino de menos de 50 Ω entre las puntas. Úsala para revisar el montaje antes de energizar.',
};
export function meterDisplay(mode:MeterMode,running:boolean,probes:[string,string]|null,result:BreadboardResult|null,ohm:{ohms:number|null;short:boolean}|null,damaged:Record<string,string>):MeterDisplay{
  const note=NOTES[mode];
  if(mode==='V'||mode==='A'){
    if(!running)return {text:'Inicia la simulación',tone:'idle',note:`${note} Con la simulación detenida el circuito no tiene energía.`};
    if(result?.tripped)return {text:'FUENTE APAGADA',tone:'bad',note:'La protección de la fuente cortó la alimentación.'};
    if(mode==='A'&&damaged.meter)return {text:'FUSIBLE FUNDIDO',tone:'bad',note:`${damaged.meter}. El fusible de 10 A se repone al detener la simulación.`};
    if(result?.fault)return {text:'Revisar circuito',tone:'bad',note:result.fault};
    if(!probes)return {text:'Pon las puntas',tone:'idle',note};
    if(mode==='V'){
      const a=result?.holeVolts[probes[0]],b=result?.holeVolts[probes[1]];
      if(a===undefined||b===undefined)return {text:'SIN REFERENCIA',tone:'warn',note:`${note} Una de las puntas toca una parte sin camino a la fuente: un multímetro real marcaría un valor inestable.`};
      const value=a-b,f=formatReading('voltage',value);return {text:`${f.text} ${f.unit}`,tone:'ok',note,record:{kind:'voltage',value}};
    }
    const current=result?.meterCurrent;
    if(current===undefined)return {text:'---',tone:'warn',note};
    const f=formatReading('current',current);return {text:`${f.text} ${f.unit}`,tone:'ok',note,record:{kind:'current',value:current}};
  }
  if(running)return {text:'Detén la simulación',tone:'warn',note:`${note} Medir resistencia con tensión puede dar lecturas falsas o dañar el instrumento.`};
  if(!probes)return {text:'Pon las puntas',tone:'idle',note};
  if(!ohm)return {text:'---',tone:'idle',note};
  if(mode==='R'){
    if(ohm.ohms===null)return {text:'OL',tone:'ok',note:`${note} OL = circuito abierto (fuera de rango).`,record:{kind:'resistance',value:null}};
    const f=formatReading('resistance',ohm.ohms);return {text:`${f.text} ${f.unit}`,tone:'ok',note,record:{kind:'resistance',value:ohm.ohms}};
  }
  const closed=ohm.ohms!==null&&ohm.ohms<50;
  return {text:closed?`•)) ${ohm.ohms!<.05?'0,0':formatReading('resistance',ohm.ohms!).text} Ω`:'Sin continuidad',tone:closed?'ok':'idle',note,record:{kind:'continuity',value:ohm.ohms},beep:closed};
}

export type Shortcut={id:string;label:string;a:string;b:string};

const KIND_SHORT:Record<Measurement['kind'],string>={voltage:'V',current:'I',resistance:'R',continuity:'Cont.'};
export function measurementValue(m:Measurement){
  if(m.kind==='continuity')return m.value!==null&&m.value<50?'Sí':'No';
  if(m.value===null)return 'OL';
  const f=formatReading(m.kind as 'voltage'|'current'|'resistance',m.value);return `${f.text} ${f.unit}`;
}
export function tableText(log:Measurement[],separator='\t'){
  const head=['N°','Tipo','Punta roja','Punta negra','Valor','Descripción'];
  const rows=log.map((m,i)=>[String(i+1),KIND_SHORT[m.kind],holeName(m.a),holeName(m.b),measurementValue(m),m.label]);
  return [head,...rows].map(r=>r.map(c=>separator===';'&&/[;"\n]/.test(c)?`"${c.replace(/"/g,'""')}"`:c).join(separator)).join('\n');
}
export function LogBody({log,notes,onRemove,onLabel,onClearAll,onNotes,onNotice}:{log:Measurement[];notes:string;onRemove:(id:string)=>void;onLabel:(id:string,label:string)=>void;onClearAll:()=>void;onNotes:(t:string)=>void;onNotice:(t:string)=>void}){
  const lines=notes.split('\n').filter(l=>l.trim()).length;
  const copy=async()=>{try{await navigator.clipboard.writeText(tableText(log));onNotice('Tabla copiada. Pégala en una hoja de cálculo o en tu informe.');}catch{onNotice('No se pudo copiar. Usa «Exportar CSV».');}};
  const download=()=>{const blob=new Blob(['﻿'+tableText(log,';')+(notes.trim()?`\n\nConclusiones;"${notes.replace(/"/g,'""')}"`:'')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mediciones-protoboard.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);onNotice('Mediciones exportadas.');};
  return <>
    {log.length?<div className="lab-log-wrap"><table className="lab-log"><thead><tr><th>N°</th><th>Tipo</th><th>Puntas</th><th>Valor</th><th><span className="lab-sr-only">Quitar</span></th></tr></thead><tbody>{log.map((m,i)=><tr key={m.id}><td>{i+1}</td><td>{KIND_SHORT[m.kind]}</td><td><span className="lab-log-points">{holeName(m.a)} → {holeName(m.b)}</span><input aria-label={`Descripción de la medición ${i+1}`} maxLength={80} value={m.label} onChange={e=>onLabel(m.id,e.target.value)}/></td><td className="lab-mono">{measurementValue(m)}</td><td><button type="button" aria-label={`Quitar la medición ${i+1}`} onClick={()=>onRemove(m.id)}><X size={13}/></button></td></tr>)}</tbody></table></div>:<p className="lab-meter-note">Aún no hay mediciones. Coloca las puntas y pulsa «Anotar medida».</p>}
    <div className="lab-meter-actions"><button type="button" disabled={!log.length} onClick={copy}><Clipboard size={14}/>Copiar</button><button type="button" disabled={!log.length} onClick={download}><Download size={14}/>CSV</button><button type="button" disabled={!log.length} onClick={onClearAll}><Trash2 size={14}/>Borrar</button></div>
    <label className="lab-notes"><span>Conclusiones <em className={lines>10?'over':''}>{lines}/10 líneas</em></span><textarea rows={4} maxLength={2000} value={notes} placeholder="Resume en no más de diez líneas lo más importante de la experiencia, con datos técnicos." onChange={e=>onNotes(e.target.value)}/></label>
  </>;
}
