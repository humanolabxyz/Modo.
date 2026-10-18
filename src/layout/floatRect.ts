export type Rect={left:number;top:number;width:number;height:number};
export type Bounds={minLeft:number;maxRight:number;minTop:number;maxBottom:number};
/** Bordes que se pueden arrastrar para redimensionar (el borde superior se cambia moviendo la ventana). */
export type ResizeDir='se'|'sw'|'e'|'w'|'s';
export const MIN_W=220,MIN_H=150;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
/** Ajusta tamaño y posición para que la ventana quepa entera dentro de los límites. */
export function clampRect(r:Rect,b:Bounds):Rect{
 const width=Math.min(Math.max(r.width,MIN_W),b.maxRight-b.minLeft),height=Math.min(Math.max(r.height,MIN_H),b.maxBottom-b.minTop);
 return {left:clamp(r.left,b.minLeft,b.maxRight-width),top:clamp(r.top,b.minTop,b.maxBottom-height),width,height};
}
export function moveRect(r:Rect,dx:number,dy:number,b:Bounds):Rect{
 return {...r,left:clamp(r.left+dx,b.minLeft,b.maxRight-r.width),top:clamp(r.top+dy,b.minTop,b.maxBottom-r.height)};
}
export function resizeRect(r:Rect,dir:ResizeDir,dx:number,dy:number,b:Bounds):Rect{
 let {left,width,height}=r;
 if(dir.includes('e'))width=clamp(r.width+dx,MIN_W,b.maxRight-r.left);
 if(dir.includes('w')){const right=r.left+r.width;left=clamp(r.left+dx,b.minLeft,right-MIN_W);width=right-left}
 if(dir.includes('s'))height=clamp(r.height+dy,MIN_H,b.maxBottom-r.top);
 return {left,top:r.top,width,height};
}
