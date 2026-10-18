import type {Settings,Terminal} from './physics';
/** Geometría del banco (coordenadas del lienzo, 1100 × 640). Las sondas bajan al pozo o quedan elevadas sobre el horno. */
export type Pt={x:number;y:number};
export const WORLD={w:1100,h:640};
export const BATH={x:60,y:330,w:320,h:230};
export const PROBE_X={tc:140,pt:300};
export const HEAD={w:88,h:54};
const HEAD_TOP_IN=190,LIFT=90;
export const STEM=150;
export const headTop=(sensor:'tc'|'pt',s:Settings)=>HEAD_TOP_IN-(s.inWell[sensor]?0:LIFT);
export const METER={x:480,y:110,w:220,h:410};
/* Transmisor de riel DIN (angosto): entrada y alimentación arriba, salida abajo. */
export const TX={x:790,y:130,w:120,h:300};
export const TX_IN={plus:{x:808,y:TX.y+30},minus:{x:832,y:TX.y+30}};
export const TX_PWR={plus:{x:856,y:TX.y+30},minus:{x:880,y:TX.y+30}};
export const TX_OUT={plus:{x:808,y:TX.y+TX.h-30},minus:{x:832,y:TX.y+TX.h-30}};
export const PSU={x:960,y:200,w:120,h:210};
export const PSU_JACKS={red:{x:990,y:382},black:{x:1050,y:382}};
export const JACKS={black:{x:590,y:492},red:{x:660,y:492},ampere:{x:520,y:492}};
/** Puntas de los hilos que salen del cable de cada sonda (arriba de la varilla). Los hilos se abren en abanico, con 24 px entre puntas. */
export const TIP_RISE=34;
export function leadOffsets(id:Terminal,s:Settings):number[]{
  if(id==='tc+'||id==='tc-')return [-12,12];
  return s.ptWires===4?[-36,-12,12,36]:[-24,0,24];
}
export function tipPos(id:Terminal,s:Settings):Pt{
  const sensor=id.startsWith('tc')?'tc':'pt',index=id==='tc+'?0:id==='tc-'?1:Number(id.slice(2))-1,list=leadOffsets(id,s);
  return {x:PROBE_X[sensor]+(list[Math.min(index,list.length-1)]??0),y:headTop(sensor,s)-TIP_RISE};
}
export function termPos(id:Terminal,s:Settings):Pt{
  switch(id){
    case 'tc+':case 'tc-':case 'pt1':case 'pt2':case 'pt3':case 'pt4':return tipPos(id,s);
    case 'tx+':return TX_OUT.plus;
    case 'tx-':return TX_OUT.minus;
  }
}
/** Cable que cuelga de una punta hasta un borne. */
export const hangingCable=(a:Pt,b:Pt,sag=70)=>`M${a.x} ${a.y} C${a.x} ${a.y+sag} ${b.x} ${b.y+sag} ${b.x} ${b.y}`;
/** Cable entre dos bornes enfrentados en horizontal. */
export const sideCable=(a:Pt,b:Pt)=>{const d=Math.max(70,Math.abs(b.x-a.x)/2);return `M${a.x} ${a.y} C${a.x+d} ${a.y} ${b.x-d} ${b.y} ${b.x} ${b.y}`;};
/** Cable que sube desde un conector hasta un borne más arriba, pasando por encima. */
export const riseCable=(a:Pt,b:Pt,lift=110)=>`M${a.x} ${a.y} C${a.x} ${a.y-lift} ${b.x} ${b.y-lift} ${b.x} ${b.y}`;
