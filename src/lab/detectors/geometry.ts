import type {Terminal} from './physics';
/** Geometría del banco (coordenadas del lienzo, 1100 × 640). Las posiciones son del banco didáctico, no de equipos comerciales. */
export type Pt={x:number;y:number};
export const WORLD={w:1100,h:640};
export const SUPPLY={x:30,y:80,w:230,h:260};
export const SENSOR={x:330,y:90,w:240,h:100};
export const STRIP={x:330,y:270,w:250,h:70};
export const TRACK={x:570,y:128,w:160};
/** La pista se ajusta al alcance del detector para que la zona de detección sea legible: abarca tres veces el alcance (máx. 200 mm). */
export const trackSpan=(range:number|null)=>Math.min(200,Math.max(3,(range??10)*3));
export const OBJECT={w:44,h:76};
export const PLC={x:40,y:410,w:640,h:200};
export const PLC_ROW={y:PLC.y+50,s:52,first:PLC.x+70};
export const METER={x:800,y:60,w:240,h:400};
export const JACKS={black:{x:860,y:424},red:{x:980,y:424}};
export const objectX=(mm:number,span:number)=>TRACK.x+Math.max(0,Math.min(span,mm))*TRACK.w/span;
export function termPos(id:Terminal):Pt{
  switch(id){
    case 'g+':return {x:SUPPLY.x+170,y:SUPPLY.y+222};
    case 'g-':return {x:SUPPLY.x+70,y:SUPPLY.y+222};
    case 's+':return {x:STRIP.x+40,y:STRIP.y+38};
    case 's-':return {x:STRIP.x+125,y:STRIP.y+38};
    case 'so':return {x:STRIP.x+210,y:STRIP.y+38};
    case 'pc':return {x:PLC_ROW.first,y:PLC_ROW.y};
    case 'px':return {x:PLC_ROW.first+PLC_ROW.s,y:PLC_ROW.y};
  }
}
/** Los bornes del PLC miran hacia arriba; los demás cuelgan hacia abajo. */
export const facesUp=(id:Terminal)=>id==='px'||id==='pc';
/** Cable entre dos bornes; `lane` separa cables que se cruzan. */
export const cable=(a:Terminal,b:Terminal,lane=0)=>{
  const p=termPos(a),q=termPos(b),sag=56+Math.abs(q.x-p.x)*0.1+lane*14,da=facesUp(a)?-1:1,db=facesUp(b)?-1:1;
  return `M${p.x} ${p.y} C${p.x} ${p.y+da*sag} ${q.x} ${q.y+db*sag} ${q.x} ${q.y}`;
};
export const hangingCable=(a:Pt,b:Pt,sag=70)=>`M${a.x} ${a.y} C${a.x} ${a.y+sag} ${b.x} ${b.y+sag} ${b.x} ${b.y}`;
