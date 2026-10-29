export type Point={x:number;y:number};
export const DB9_CUPS=Array.from({length:9},(_,i)=>{const pin=i+1;return {pin,x:pin<=5?390+(5-pin)*40:410+(9-pin)*40,y:pin<=5?160:215};});
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
/** Preserve the place where the hand grips the object; its working tip does not jump to the cursor. */
export function dragPosition(pointer:Point,offset:Point):Point{return {x:pointer.x-offset.x,y:pointer.y-offset.y};}
export function nearestCup(point:Point){return DB9_CUPS.find(c=>distance(point,c)<22)??null;}
export function spliceContact(a:Point,b:Point){return distance(a,b)<25;}
