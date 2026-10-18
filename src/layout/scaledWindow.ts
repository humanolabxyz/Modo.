import type {Bounds,Rect} from './floatRect';
/** Una esquina escala las dos dimensiones a la vez y conserva toda la ventana dentro de la pantalla. */
export function scaleWindowRect(rect:Rect,factor:number,bounds:Bounds):Rect{
 const maximum=Math.min((bounds.maxRight-rect.left)/rect.width,(bounds.maxBottom-rect.top)/rect.height);
 const minimum=Math.min(maximum,Math.max(260/rect.width,140/rect.height,.65));
 const scale=Math.max(minimum,Math.min(maximum,factor));
 return {...rect,width:rect.width*scale,height:rect.height*scale};
}
