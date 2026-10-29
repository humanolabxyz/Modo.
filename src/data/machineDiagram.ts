import {LESSON_SCHEMATICS,traceStep} from './lessonSchematics';
import type {CadePort} from './cade';
import type {BananaCable} from './practice';
import type {DiagramDraft} from './machinePreparation';
// These are separate, existing bank sockets; no new internal connection is inferred.
export const MACHINE_PE_PORTS:CadePort[]=['FUENTE:TP','BOTONERAS:TP_IZQ','CONTACTOR_TERMICO:TP_DER','CONTACTOR_TRIFASICO:TP_IZQ','CONTACTOR_TRIFASICO:TP_DER','CONTACTOR_TRIFASICO_3:TP_IZQ'].map((panel,i)=>({objectId:9000+i,reference:panel.split(':')[0],terminal:panel.split(':')[1],panel,x:55+i*78,y:294}));
export const MACHINE_DIAGRAM_PORTS=[...LESSON_SCHEMATICS.estrellaManual.PORTS.filter(p=>p.panel),...MACHINE_PE_PORTS];
const c=LESSON_SCHEMATICS.estrellaManual,inside=c.PORTS.filter(p=>!p.panel);
export const MACHINE_INTERNAL_LINKS=c.WIRES.flatMap(w=>{const a=inside.find(p=>p.x===w.x&&p.y===w.y),b=inside.find(p=>p.x===w.x2&&p.y===w.y2);return a&&b?[{a,b}]:[];});
const pe=inside.find(p=>p.reference==='-X'&&p.terminal==='PE');
if(pe)MACHINE_INTERNAL_LINKS.push({a:pe,b:MACHINE_PE_PORTS[0]});
export function machineWirePath(w:BananaCable,positions:DiagramDraft['positions']){
 const point=(id:string)=>{const p=MACHINE_DIAGRAM_PORTS.find(p=>p.panel===id);return p?{x:p.x+(positions[p.objectId]?.x??0),y:p.y+(positions[p.objectId]?.y??0)}:null;},a=point(w.from.terminalId),b=point(w.to.terminalId);
 if(!a||!b)return '';const trace=traceStep(c,w.from.terminalId,w.to.terminalId);
 if(!trace)return `M${a.x} ${a.y} V${(a.y+b.y)/2} H${b.x} V${b.y}`;
 return `M${a.x} ${a.y}L${trace.ends[0].x} ${trace.ends[0].y} `+trace.wires.map(id=>{const s=c.WIRES.find(w=>w.id===id)!;return `M${s.x} ${s.y}L${s.x2} ${s.y2}`;}).join(' ')+` M${trace.ends[1].x} ${trace.ends[1].y}L${b.x} ${b.y}`;
}
