export type Box={left:number;top:number;width:number;height:number};
export type View={x:number;y:number;w:number;h:number};
const area=(b:Box)=>Math.max(0,b.width)*Math.max(0,b.height);
/** Mayor franja del banco que la ventana flotante no tapa. Si la ventana lo cubre casi todo, se usa el banco entero. */
export function freeRegion(stage:Box,win:Box|null,minSide=120):Box{
 if(!win)return stage;
 const sr=stage.left+stage.width,sb=stage.top+stage.height,wr=win.left+win.width,wb=win.top+win.height;
 const strips:Box[]=[
  {left:stage.left,top:stage.top,width:stage.width,height:win.top-stage.top},
  {left:stage.left,top:wb,width:stage.width,height:sb-wb},
  {left:stage.left,top:stage.top,width:win.left-stage.left,height:stage.height},
  {left:wr,top:stage.top,width:sr-wr,height:stage.height},
 ].filter(b=>b.width>=minSide&&b.height>=minSide);
 return strips.reduce<Box|null>((best,b)=>!best||area(b)>area(best)?b:best,null)??stage;
}
/** viewBox que deja el módulo centrado en `free` (coordenadas de pantalla) y entero dentro de ella. */
export function viewForModule(m:{x:number;y:number;w:number;h:number},full:{w:number;h:number},stage:Box,free:Box):View{
 const aspect=full.h/full.w;let w=Math.max(m.w+110,440);
 const scale=(w:number)=>Math.min(stage.width/w,stage.height/(w*aspect));
 /* Al ampliar w el zoom baja en la misma proporción, así que basta un solo ajuste. */
 const k=Math.max(1,(m.w*scale(w))/(free.width*.92),(m.h*scale(w))/(free.height*.92));
 w*=k;const s=scale(w),h=w*aspect;
 const dx=free.left+free.width/2-(stage.left+stage.width/2),dy=free.top+free.height/2-(stage.top+stage.height/2);
 return {x:m.x+m.w/2-w/2-dx/s,y:m.y+m.h/2-h/2-dy/s,w,h};
}
