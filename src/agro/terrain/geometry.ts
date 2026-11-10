import type {Result} from '../model/types.ts';
export type Point2=[number,number];
export function polygonArea(p:readonly Point2[]):number {
  return Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
}
export function polygonPerimeter(p:readonly Point2[]):number {return p.reduce((sum,a,i)=>sum+Math.hypot(a[0]-p[(i+1)%p.length][0],a[1]-p[(i+1)%p.length][1]),0);}
export function segmentSample(p:Point2,a:Point2,b:Point2) {
  const dx=b[0]-a[0],dz=b[1]-a[1],den=dx*dx+dz*dz;
  const t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/den)):0;
  return {t,distance:Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t)};
}
export function insidePolygon(p:Point2,poly:readonly Point2[],boundary=true):boolean {
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const a=poly[j],b=poly[i];
    if(segmentSample(p,a,b).distance<1e-7)return boundary;
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return inside;
}
export function pathSample(p:Point2,line:readonly Point2[]) {
  let best={distance:Infinity,t:0,segment:0};
  for(let i=1;i<line.length;i++){const q=segmentSample(p,line[i-1],line[i]);if(q.distance<best.distance)best={...q,segment:i-1};}return best;
}
export function polygonDistance(p:Point2,poly:readonly Point2[]):number {return pathSample(p,[...poly,poly[0]]).distance;}
const cross=(a:Point2,b:Point2,c:Point2)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export function segmentsCross(a:Point2,b:Point2,c:Point2,d:Point2):boolean {
  const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);
  if(x*y<0&&z*w<0)return true;
  return (Math.abs(x)<1e-8&&segmentSample(c,a,b).distance<1e-7)||(Math.abs(y)<1e-8&&segmentSample(d,a,b).distance<1e-7)||(Math.abs(z)<1e-8&&segmentSample(a,c,d).distance<1e-7)||(Math.abs(w)<1e-8&&segmentSample(b,c,d).distance<1e-7);
}
export function validatePolygon(raw:unknown):Result<Point2[]> {
  if(!Array.isArray(raw)||raw.length<3||raw.length>64||raw.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))return {ok:false,error:'El polígono necesita entre 3 y 64 vértices finitos.'};
  const p=raw as Point2[];
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++) {
    if(Math.hypot(p[i][0]-p[j][0],p[i][1]-p[j][1])<0.05)return {ok:false,error:'Hay vértices repetidos o demasiado próximos.'};
    if(j===i+1||(i===0&&j===p.length-1))continue;
    if(segmentsCross(p[i],p[(i+1)%p.length],p[j],p[(j+1)%p.length]))return {ok:false,error:'El polígono se cruza consigo mismo.'};
  }
  if(polygonArea(p)<1)return {ok:false,error:'El área debe ser de al menos 1 m².'};
  return {ok:true,value:p.map(q=>[...q])};
}

/** Intersección con área positiva para polígonos simples, también cóncavos. */
export function polygonsOverlap(a:readonly Point2[],b:readonly Point2[]):boolean {
 for(const [p,q] of [[a,b],[b,a]]) {
  if(p.some(v=>insidePolygon(v,q,false)))return true;
  const signed=p.reduce((sum,v,i)=>{const w=p[(i+1)%p.length];return sum+v[0]*w[1]-w[0]*v[1];},0);
  for(let i=0;i<p.length;i++) {
   const u=p[i],v=p[(i+1)%p.length],dx=v[0]-u[0],dz=v[1]-u[1],length=Math.hypot(dx,dz),sign=signed>=0?1:-1;
   const probe:Point2=[(u[0]+v[0])/2-dz/length*sign*1e-5,(u[1]+v[1])/2+dx/length*sign*1e-5];
   if(insidePolygon(probe,p,false)&&insidePolygon(probe,q,false))return true;
   for(let j=0;j<q.length;j++) {
    const x=q[j],y=q[(j+1)%q.length];
    if(cross(u,v,x)*cross(u,v,y)<-1e-10&&cross(x,y,u)*cross(x,y,v)<-1e-10)return true;
   }
  }
 }return false;
}
