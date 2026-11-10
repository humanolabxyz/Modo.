import {BufferAttribute,BufferGeometry,ShapeUtils,Vector2} from 'three';
import type {Entity} from '../model/types.ts';
import {parcelWorldPolygon} from '../world/parcelGeometry.ts';
import {sampleHeight,type Heightfield} from '../terrain/heightfield.ts';
type Vec=[number,number,number];
/** Triangulación de polígonos simples cóncavos; cada triángulo se subdivide
 * para que la cubierta acompañe el suelo y no rellene las concavidades. */
export function polygonParcelGeometry(entity:Entity,hf:Heightfield):{fill:BufferGeometry;border:Vec[]} {
 const polygon=parcelWorldPolygon(entity),faces=ShapeUtils.triangulateShape(polygon.map(([x,z])=>new Vector2(x,z)),[]);
 const pos:number[]=[],idx:number[]=[];
 for(const face of faces) {
  const [a,b,c]=face.map(i=>polygon[i]);
  const n=Math.max(1,Math.min(48,Math.ceil(Math.max(Math.hypot(a[0]-b[0],a[1]-b[1]),Math.hypot(c[0]-b[0],c[1]-b[1]),Math.hypot(a[0]-c[0],a[1]-c[1]))/3)));
  const rows:number[][]=[];
  for(let u=0;u<=n;u++){const row:number[]=[];for(let v=0;v<=n-u;v++){
   const x=a[0]+(b[0]-a[0])*u/n+(c[0]-a[0])*v/n,z=a[1]+(b[1]-a[1])*u/n+(c[1]-a[1])*v/n;
   row.push(pos.length/3);pos.push(x,sampleHeight(hf,x,z)+0.22,z);
  }rows.push(row);}
  for(let u=0;u<n;u++)for(let v=0;v<n-u;v++){
   idx.push(rows[u][v],rows[u+1][v],rows[u][v+1]);
   if(v<n-u-1)idx.push(rows[u+1][v],rows[u+1][v+1],rows[u][v+1]);
  }
 }
 const fill=new BufferGeometry();fill.setAttribute('position',new BufferAttribute(Float32Array.from(pos),3));fill.setIndex(idx);
 const border:Vec[]=[];
 polygon.forEach((a,i)=>{const b=polygon[(i+1)%polygon.length],n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/2));for(let k=0;k<n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;border.push([x,sampleHeight(hf,x,z)+0.27,z]);}});
 border.push(border[0]);return {fill,border};
}
