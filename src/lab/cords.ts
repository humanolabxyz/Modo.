/** Cable del multímetro como una cadena de puntos (integración de Verlet): colgado del conector, con holgura, peso y
 *  amortiguación; el último tramo es el mango de la punta, rígido y con una ligera tendencia a mantenerse en pie. */
export type Pt={x:number;y:number};
export type Node={x:number;y:number;px:number;py:number};
export type Chain={nodes:Node[];rope:number};
export type CordOptions={gravity:number;damping:number;iterations:number;penLength:number;penDir:Pt;penStiffness:number;slack:number};
export const CORD_DEFAULTS:Omit<CordOptions,'penDir'>={gravity:.55,damping:.972,iterations:12,penLength:62,penStiffness:.1,slack:.16};
const dist=(a:Pt,b:Pt)=>Math.hypot(a.x-b.x,a.y-b.y);
export function ropeTarget(jack:Pt,tip:Pt,o:CordOptions){const back={x:tip.x+o.penDir.x*o.penLength,y:tip.y+o.penDir.y*o.penLength};return Math.max(dist(jack,back)*(1+o.slack),dist(jack,back)+60);}
export function createChain(jack:Pt,tip:Pt,count:number,o:CordOptions):Chain{
  const rope=ropeTarget(jack,tip,o),back={x:tip.x+o.penDir.x*o.penLength,y:tip.y+o.penDir.y*o.penLength},nodes:Node[]=[];
  for(let i=0;i<count-1;i++){const t=i/(count-2),sag=Math.sin(t*Math.PI)*Math.sqrt(Math.max(0,rope*rope-dist(jack,back)**2))/2;const x=jack.x+(back.x-jack.x)*t,y=jack.y+(back.y-jack.y)*t+sag;nodes.push({x,y,px:x,py:y});}
  nodes.push({x:tip.x,y:tip.y,px:tip.x,py:tip.y});return {nodes,rope};
}
/** Avanza un paso. El primer nodo (conector) y el último (aguja de la punta) están fijos a las posiciones dadas. */
export function stepChain(chain:Chain,jack:Pt,tip:Pt,o:CordOptions):Chain{
  const n=chain.nodes,last=n.length-1,rope=chain.rope+(ropeTarget(jack,tip,o)-chain.rope)*.12,seg=rope/(n.length-2);
  for(let i=1;i<last;i++){const q=n[i],vx=(q.x-q.px)*o.damping,vy=(q.y-q.py)*o.damping;q.px=q.x;q.py=q.y;q.x+=vx;q.y+=vy+o.gravity;}
  n[0]={x:jack.x,y:jack.y,px:jack.x,py:jack.y};n[last]={x:tip.x,y:tip.y,px:tip.x,py:tip.y};
  const back=n[last-1];back.x+=(tip.x+o.penDir.x*o.penLength-back.x)*o.penStiffness;back.y+=(tip.y+o.penDir.y*o.penLength-back.y)*o.penStiffness;
  for(let k=0;k<o.iterations;k++){
    for(let i=0;i<last;i++){
      const a=n[i],b=n[i+1],rest=i===last-1?o.penLength:seg,dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-6,diff=(d-rest)/d;
      // la cuerda solo tira cuando se estira; comprimida puede formar curvas
      const pull=diff,wa=i===0?0:1,wb=i+1===last?0:1,w=wa+wb;if(!w)continue;
      a.x+=dx*pull*wa/w;a.y+=dy*pull*wa/w;b.x-=dx*pull*wb/w;b.y-=dy*pull*wb/w;
    }
  }
  return {nodes:n,rope};
}
/** Trazo suave que pasa por los puntos (curvas cuadráticas entre puntos medios). */
export function smoothPath(points:Pt[]):string{
  if(points.length<3)return points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  let d=`M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for(let i=1;i<points.length-1;i++){const m={x:(points[i].x+points[i+1].x)/2,y:(points[i].y+points[i+1].y)/2};d+=`Q${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`;}
  const e=points[points.length-1];return d+`L${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
}
