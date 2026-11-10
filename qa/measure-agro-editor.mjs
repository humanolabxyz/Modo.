import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {buildChunk} from '../src/agro/terrain/chunks.ts';
const result=[];
for(const count of [100,1000,5000]) {
 const made=createConfiguredWorld({name:'Carga editor',seed:31415,territory:'free',terrainParams:{reliefStrength:.7,roughness:.3,baseElevationM:20,valleyBias:.15,vegetation:.45,rocks:.35},side:1200,template:'blank',site:'center',relief:'natural',radius:60,resources:[],water:80,experience:'free',start:'2026-09-21'});
 if(!made.ok)throw Error(made.error);const s=WorldSession.fromWorld(made.value);s.setEditorActive(true);
 const start=performance.now();
 for(let i=0;i<count;i++) {
  const r=s.previewTerrainOperation({kind:'paint',center:[(i*73%1100)-550,(i*137%1100)-550],radius:20,amount:.7,material:i%2?'grass':'gravel'});
  if(!r.ok)throw Error(r.error);s.commitStroke('keep');
 }
 const authorMs=performance.now()-start;
 const chunksStart=performance.now();let hash=createHash('sha256');
 for(const [x,z] of [[0,0],[3,4],[5,5],[11,11]]){const c=buildChunk(s.terrain.hf,x,z,0,true);hash.update(Buffer.from(c.colors.buffer));}
 result.push({count,authorMs:+authorMs.toFixed(1),fourChunksMs:+(performance.now()-chunksStart).toFixed(1),colorHash:hash.digest('hex')});
}
if(process.env.AGRO_MEASURE_FILE)writeFileSync(process.env.AGRO_MEASURE_FILE,JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
