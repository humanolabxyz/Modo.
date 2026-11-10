import {hash2, valueNoise} from './noise.ts';
import {inBounds, sampleHeight, slopeDegrees, type Heightfield} from './heightfield.ts';
import {decorativeFeatures, greenCover, waterSection} from './surface.ts';
import {roadContains} from './roads.ts';
import {TERRITORIES} from './presets.ts';

export type GroundDetail = {x:number;y:number;z:number;scale:number;yaw:number;tone:number};
export type GroundDetails = {grass:GroundDetail[]; twigs:GroundDetail[]; stones:GroundDetail[]};

/** Cubierta cercana al lugar de trabajo; determinista y decorativa, sin alterar la simulación. */
export function groundDetails(hf:Heightfield,site:readonly [number,number],keep:readonly {x:number;z:number;r:number}[]):GroundDetails {
  const grass:GroundDetail[]=[],twigs:GroundDetail[]=[],stones:GroundDetail[]=[];
  const params=hf.params??TERRITORIES[hf.presetId].params, features=decorativeFeatures(hf), seed=hf.seed;
  for(let i=0;i<15000;i++) {
    // Más detalle junto a la zona de juego, sin poblar toda la extensión con geometría innecesaria.
    const span=i<7500?180:440;
    const x=site[0]+(hash2(seed+141,i,1)-0.5)*span, z=site[1]+(hash2(seed+142,i,2)-0.5)*span;
    if(!inBounds(hf,x,z)||keep.some(p=>Math.hypot(p.x-x,p.z-z)<p.r))continue;
    if(roadContains(hf.baseRoads,x,z,1)||roadContains(hf.surfaceEdits,x,z,1))continue;
    if(features.water){const water=waterSection(hf,z);if(Math.abs(x-water.x)<water.half+1)continue;}
    const slope=slopeDegrees(hf,x,z);if(slope>35)continue;
    const cover=greenCover(hf,x,z,Math.cos(slope*Math.PI/180));
    const patch=valueNoise(seed+411,x/16,z/16), roll=hash2(seed+143,i,3);
    const detail={x,y:sampleHeight(hf,x,z),z,scale:0.65+hash2(seed+144,i,4)*0.7,yaw:hash2(seed+145,i,5)*Math.PI*2,tone:hash2(seed+146,i,6)};
    if(grass.length<6000 && roll<params.vegetation*(0.22+cover*1.25)*(0.35+patch*patch*1.5))grass.push(detail);
    else if(stones.length<800 && roll<0.14+params.rocks*0.14)stones.push(detail);
    else if(twigs.length<550 && params.vegetation>0 && roll>0.94-params.vegetation*0.08)twigs.push(detail);
  }
  return {grass,twigs,stones};
}
