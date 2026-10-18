/** Colocación de etiquetas de la protoboard.
 *  Los orificios ocupan casi toda la placa, así que una etiqueta pegada al componente taparía contactos.
 *  Las etiquetas se ubican en franjas libres de orificios (sobre los rieles, entre rieles y fila a, canal central,
 *  bajo los rieles inferiores) y se evitan las patas y los puentes ya dibujados. */
export type Point={x:number;y:number};
export type Rect={x:number;y:number;w:number;h:number};
export type LabelRequest={id:string;anchor:Point;w:number;h?:number};
export type PlacedLabel={id:string;x:number;y:number;w:number;h:number;anchor:Point};
export const LABEL_LANES=[44,105,242,408];
export const LABEL_HEIGHT=18;
export const BOARD_LABEL_X=[38,772] as const;

const overlaps=(a:Rect,b:Rect,margin=3)=>a.x<b.x+b.w+margin&&a.x+a.w+margin>b.x&&a.y<b.y+b.h+margin&&a.y+a.h+margin>b.y;
/** ¿El segmento p–q atraviesa el rectángulo? (Liang–Barsky). */
export function segmentHitsRect(p:Point,q:Point,r:Rect):boolean{
  let t0=0,t1=1;const dx=q.x-p.x,dy=q.y-p.y;
  const clip=(pp:number,qq:number)=>{if(pp===0)return qq>=0;const t=qq/pp;if(pp<0){if(t>t1)return false;if(t>t0)t0=t;}else{if(t<t0)return false;if(t<t1)t1=t;}return true;};
  return clip(-dx,p.x-r.x)&&clip(dx,r.x+r.w-p.x)&&clip(-dy,p.y-r.y)&&clip(dy,r.y+r.h-p.y);
}
/** Puntos de un puente curvo, igual que el trazo cúbico de la vista. */
export function wirePolyline(a:Point,b:Point,steps=14,straight=false):Point[]{
  if(straight)return [a,b];
  const top=Math.min(a.y,b.y)-35,points:Point[]=[];
  for(let i=0;i<=steps;i++){const t=i/steps,u=1-t;points.push({x:u*u*u*a.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*top+3*u*t*t*top+t*t*t*b.y});}
  return points;
}
export type Segment=[Point,Point];
/** Coloca cada etiqueta en la franja libre más cercana a su componente, sin chocar con otras etiquetas ni con segmentos. */
export function placeLabels(requests:LabelRequest[],segments:Segment[]):PlacedLabel[]{
  const placed:PlacedLabel[]=[];
  for(const request of [...requests].sort((a,b)=>a.anchor.x-b.anchor.x)){
    const w=request.w,h=request.h??LABEL_HEIGHT,min=BOARD_LABEL_X[0]+w/2,max=BOARD_LABEL_X[1]-w/2;
    let best:{x:number;y:number;cost:number}|null=null;
    for(const lane of LABEL_LANES){
      const laneCost=Math.abs(lane-request.anchor.y);
      for(let step=0;step<=14;step++){
        for(const sign of step===0?[1]:[1,-1]){
          const x=Math.max(min,Math.min(max,request.anchor.x+sign*step*((w+8)/2)));
          const rect:Rect={x:x-w/2,y:lane-h/2,w,h};
          if(placed.some(p=>overlaps(rect,{x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h}))||segments.some(([p,q])=>segmentHitsRect(p,q,{x:rect.x-2,y:rect.y-2,w:rect.w+4,h:rect.h+4})))continue;
          const cost=laneCost+Math.abs(x-request.anchor.x)*.7+step*3;
          if(!best||cost<best.cost)best={x,y:lane,cost};
        }
      }
    }
    if(!best){const lane=LABEL_LANES.reduce((a,b)=>Math.abs(b-request.anchor.y)<Math.abs(a-request.anchor.y)?b:a);best={x:Math.max(min,Math.min(max,request.anchor.x)),y:lane,cost:0};}
    placed.push({id:request.id,x:best.x,y:best.y,w,h,anchor:request.anchor});
  }
  return placed;
}
/** Ancho estimado de una etiqueta de varias partes (11 px). */
export function labelWidth(parts:string[]):number{return Math.max(34,parts.reduce((sum,text)=>sum+text.length*6.4+14,0)+(parts.length-1)*4);}
