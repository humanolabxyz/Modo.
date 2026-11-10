import type {Entity} from '../model/types.ts';
import {insidePolygon,polygonArea,polygonPerimeter,type Point2} from '../terrain/geometry.ts';
type Parcel=Pick<Entity,'params'|'pose'|'parcelPolygon'>;
export function localParcelPolygon(e:Parcel):Point2[] {
  if(e.parcelPolygon)return e.parcelPolygon;
  const w=Number(e.params.anchoM??20)/2,d=Number(e.params.largoM??30)/2;
  return [[-w,-d],[w,-d],[w,d],[-w,d]];
}
export function parcelWorldPolygon(e:Parcel):Point2[] {
  const c=Math.cos(e.pose.rotation[1]),s=Math.sin(e.pose.rotation[1]);
  return localParcelPolygon(e).map(([x,z])=>[e.pose.position[0]+x*c+z*s,e.pose.position[2]-x*s+z*c]);
}
export function parcelContains(e:Parcel,x:number,z:number):boolean {return insidePolygon([x,z],parcelWorldPolygon(e));}
export function parcelArea(e:Parcel):number {return e.parcelPolygon?polygonArea(e.parcelPolygon):Number(e.params.anchoM??20)*Number(e.params.largoM??30);}
export function parcelPerimeter(e:Parcel):number {return polygonPerimeter(localParcelPolygon(e));}
