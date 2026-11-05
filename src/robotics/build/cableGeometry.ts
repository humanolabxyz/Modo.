import {BufferGeometry, Float32BufferAttribute, Vector3, type Curve} from 'three';

/** Fixed topology; moving endpoints update the existing GPU buffers. No TubeGeometry
 * allocation/disposal or arc-length lookup table per cable per physics snapshot. */
export function createCableGeometry(segments=24,radial=6){
 const geometry=new BufferGeometry(),positions=new Float32Array((segments+1)*(radial+1)*3),normals=new Float32Array(positions.length),indices:number[]=[];
 for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){
  const a=i*(radial+1)+j,b=a+radial+1;indices.push(a,a+1,b,b,a+1,b+1);
 }
 geometry.setIndex(indices);geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new Float32BufferAttribute(normals,3));
 return geometry;
}

export function updateCableGeometry(geometry:BufferGeometry,curve:Curve<Vector3>,radius:number,segments=24,radial=6){
 const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal');
 const point=new Vector3(),tangent=new Vector3(),normal=new Vector3(),binormal=new Vector3(),axis=new Vector3();
 for(let i=0;i<=segments;i++){
  const t=i/segments;curve.getPoint(t,point);curve.getTangent(t,tangent).normalize();if(tangent.lengthSq()<1e-10)tangent.set(0,1,0);
  if(i===0){axis.set(Math.abs(tangent.y)<.9?0:1,Math.abs(tangent.y)<.9?1:0,0);normal.crossVectors(tangent,axis).normalize();}
  else normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();
  if(normal.lengthSq()<1e-10){axis.set(Math.abs(tangent.y)<.9?0:1,Math.abs(tangent.y)<.9?1:0,0);normal.crossVectors(tangent,axis).normalize();}
  binormal.crossVectors(tangent,normal).normalize();
  for(let j=0;j<=radial;j++){
   const angle=j/radial*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle),x=normal.x*c+binormal.x*s,y=normal.y*c+binormal.y*s,z=normal.z*c+binormal.z*s,index=i*(radial+1)+j;
   positions.setXYZ(index,point.x+radius*x,point.y+radius*y,point.z+radius*z);normals.setXYZ(index,x,y,z);
  }
 }
 positions.needsUpdate=true;normals.needsUpdate=true;geometry.computeBoundingSphere();geometry.computeBoundingBox();
}
