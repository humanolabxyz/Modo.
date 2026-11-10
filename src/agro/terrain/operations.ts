// Descriptores puros y versionados. Obras futuras pueden reutilizarlos sin
// ejecutar acciones del editor, sin inventar personal ni costos.
import {SURFACE_IDS, type Result, type TerrainEdit} from '../model/types.ts';
import type {Heightfield} from './heightfield.ts';
import {validatePolygon} from './geometry.ts';
export type TerrainOperation=Omit<TerrainEdit,'id'|'at'|'algorithmVersion'>;
export function compileOperation(hf:Pick<Heightfield,'originX'|'originZ'|'sizeX'|'sizeZ'>,op:TerrainOperation):Result<TerrainEdit> {
 const fail=(error:string):Result<TerrainEdit>=>({ok:false,error});
 if(!['smooth','restore','paint','slope','terrace','ditch','road'].includes(op.kind))return fail('Operación de editor desconocida.');
 const inside=(p:number[])=>p.length===2&&p.every(Number.isFinite)&&p[0]>=hf.originX&&p[0]<=hf.originX+hf.sizeX&&p[1]>=hf.originZ&&p[1]<=hf.originZ+hf.sizeZ;
 if(!Array.isArray(op.center)||!inside(op.center)||!Number.isFinite(op.amount)||!Number.isFinite(op.radius))return fail('Centro o valores no válidos.');
 const linear=op.kind==='ditch'||op.kind==='road';
 const shape=op.kind==='slope'||op.kind==='terrace';
 if(linear) {
  if(!Array.isArray(op.points)||op.points.length<2||op.points.length>64||op.points.some(p=>!Array.isArray(p)||!inside(p)))return fail('La línea necesita 2–64 puntos dentro del mapa.');
  for(let i=1;i<op.points.length;i++)if(Math.hypot(op.points[i][0]-op.points[i-1][0],op.points[i][1]-op.points[i-1][1])<0.1)return fail('Separa los puntos de la línea al menos 10 cm.');
  if(!Number.isFinite(op.width)||op.width!<2||op.width!>40)return fail('El ancho debe estar entre 2 y 40 m.');
  if(op.kind==='road'&&(op.amount<0||op.amount>1))return fail('La intensidad del camino debe estar entre 0 y 1.');
  if(op.kind==='ditch'&&(op.amount<0.1||op.amount>20))return fail('La profundidad debe estar entre 0,1 y 20 m.');
  if(op.kind==='road'&&(!Array.isArray(op.heights)||op.heights.length!==op.points.length||op.heights.some(h=>!Number.isFinite(h)||h < -50||h>500)))return fail('El camino necesita una cota válida por punto.');
  const xs=op.points.map(p=>p[0]),zs=op.points.map(p=>p[1]);const center:[number,number]=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2];
  op={...op,center,radius:Math.max(...op.points.map(p=>Math.hypot(p[0]-center[0],p[1]-center[1])))+op.width!/2+1};
 }
 if(shape){
  const polygon=validatePolygon(op.points);if(!polygon.ok)return polygon;
  if(polygon.value.some(p=>!inside(p)))return fail('El polígono se sale del terreno jugable.');
  if(op.amount < -50||op.amount>500||!Number.isFinite(op.width)||op.width!<1||op.width!>30)return fail('Revisa la cota (−50 a 500 m) y transición (1–30 m).');
  if(op.kind==='slope'&&(!Number.isFinite(op.grade)||Math.abs(op.grade!)>100))return fail('La pendiente debe estar entre −100 y 100 %.');
  if(op.kind==='terrace'&&(!Number.isFinite(op.stepHeight)||op.stepHeight!<0.5||op.stepHeight!>20))return fail('El escalón debe medir entre 0,5 y 20 m.');
  const xs=polygon.value.map(p=>p[0]),zs=polygon.value.map(p=>p[1]);
  const center:[number,number]=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2];
  op={...op,center,radius:Math.max(...polygon.value.map(p=>Math.hypot(p[0]-center[0],p[1]-center[1])))+1,points:polygon.value};
 }else if(!linear&&(op.radius<2||op.radius>120||op.amount<0||op.amount>1))return fail('Revisa radio (2–120 m) e intensidad (0–1).');
 if(!shape&&!linear&&[op.points,op.width,op.grade,op.stepHeight,op.heights].some(v=>v!==undefined))return fail('El pincel circular no admite geometría de otra herramienta.');
 if(op.kind!=='slope'&&op.grade!==undefined)return fail('Solo las pendientes admiten grade.');
 if(op.kind!=='terrace'&&op.stepHeight!==undefined)return fail('Solo las terrazas admiten stepHeight.');
 if(op.kind!=='road'&&op.heights!==undefined)return fail('Solo los caminos admiten perfil de cotas.');
 if(op.kind==='paint'&&!SURFACE_IDS.includes(op.material!))return fail('Superficie visual desconocida.');
 if(op.kind!=='paint'&&op.material!==undefined)return fail('Esta operación no admite material visual.');
 return {ok:true,value:{...structuredClone(op),id:'pending',at:0,algorithmVersion:1}};
}
