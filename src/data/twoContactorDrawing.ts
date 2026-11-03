import type {CadeDrawing,CadeObject} from './cade';
import {referencePort} from './twoContactorReference';
/** Dibujo de la lección de dos contactores: el esquema recibido («CAMBIO DELTA, ESTRELLA», de tres contactores) con dos adaptaciones al banco.
 *  Las otras lecciones usan el dibujo base (cadeEstrellaTriangulo.json) sin ellas.
 *
 *  Nombres: los del banco. En el dibujo base KM1 es el principal, KM2 el de triángulo y KM3 el de estrella; aquí se rotulan KT1 (módulo «Temporizador neumático», principal y
 *  cabezal de retardo), KM1 («Contactor + relé térmico», triángulo) y KM2 («Contactor trifásico», estrella). Debajo de cada rótulo el esquema muestra el nombre del módulo.
 *  1. Piloto rojo: el dibujo solo tiene un NC entre la fase y la lámpara H1; se agrega el segundo (objeto 1001) y se baja la lámpara para hacerle lugar.
 *  2. Entrada de fuerza: los bornes L1, L2, L3 del dibujo se rotulan R, S, T, como la fuente del banco.
 *  Las salidas del contactor de triángulo ya vienen corregidas en el dibujo base (2 → W2, 4 → U2, 6 → V2, como la figura Nº2 de la guía). */
const BANK_REFERENCE:Record<string,string>={KM1:'KT1',KM2:'KM1',KM3:'KM2'};
export const TWO_CONTACTOR_LABELS:Record<number,string>={58:'KT1',62:'KM1',1001:'KM2'};
/** Piloto rojo: el dibujo recibido solo tiene un contacto NC entre la fase y la lámpara H1. En el banco son dos, 81–82 de KM1 y 81–82 de KM2 en serie.
 *  El existente (objeto 62) pasa a rotularse KM1; se agrega el de KM2 (objeto 1001) debajo y se baja la lámpara H1 para hacerle lugar. */
export const RED_PILOT_NC_KM2=1001,RED_PILOT_WIRE=1002,RED_PILOT_SHIFT=13;
function redPilotObjects(estrella:CadeDrawing):CadeObject[]{
 const nc=estrella.objects.find(o=>o.id===62)!,wire=estrella.objects.find(o=>o.id===75)!;
 const second:CadeObject={...nc,id:RED_PILOT_NC_KM2,reference:'KM2',y:152,box:nc.box?.map((v,i)=>i%2?v+23:v),ports:nc.ports?.map(p=>({...p,y:p.y+23,anchor:referencePort(RED_PILOT_NC_KM2,p.terminal)}))};
 const link:CadeObject={...wire,id:RED_PILOT_WIRE,x:265,y:170,x2:265,y2:175};
 return [second,link];
}
export function twoContactorDrawing(estrella:CadeDrawing):CadeDrawing{
 return {...estrella,source:estrella.source+' · rotulado con los nombres del banco (KT1, KM1, KM2) y bornes R, S, T',objects:estrella.objects.map(o=>{
  const n:CadeObject={...o};
  if(o.reference&&BANK_REFERENCE[o.reference])n.reference=BANK_REFERENCE[o.reference];
  if(TWO_CONTACTOR_LABELS[o.id])n.reference=TWO_CONTACTOR_LABELS[o.id];
  /* El bloque de entrada se rotula con los nombres de la fuente del banco: R, S y T (L1, L2 y L3 del dibujo). */
  if(o.id===1)n.pins=['R','S','T','PE'];
  if(o.id===75)n.y2=152;                                            /* de KM1:82 al nuevo NC */
  if(o.id===66){n.y=o.y+RED_PILOT_SHIFT;n.box=o.box?.map((v,i)=>i%2?v+RED_PILOT_SHIFT:v);n.ports=o.ports?.map(p=>({...p,y:p.y+RED_PILOT_SHIFT}));}
  if(o.id===76)n.y=o.y+RED_PILOT_SHIFT;                             /* retorno de H1 a N */
  if(n.ports)n.ports=n.ports.map(p=>({...p,anchor:referencePort(o.id,p.terminal)}));
  return n;
 }).concat(redPilotObjects(estrella))};
}
