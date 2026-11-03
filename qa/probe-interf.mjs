import {build} from 'esbuild';
await build({stdin:{resolveDir:process.cwd(),contents:"export {buildTemplate} from './src/robotics/project/templates.ts';export {findInterferences} from './src/robotics/build/interference.ts';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'qa/probe-interf.out.mjs',logLevel:'error'});
const m=await import('./probe-interf.out.mjs?'+Date.now());
const p=m.buildTemplate('robot-oruga-recoger');
const name=id=>p.parts.find(x=>x.instanceId===id)?.label;
console.log(m.findInterferences(p).map(([a,b])=>name(a)+' <> '+name(b)).join('\n'));
for(const x of p.parts) if(/belt|Banda|oruga|Chasis|chasis|Antebrazo izq|Brazo izq|Pinza izq/i.test(x.label||'')) console.log(x.label, x.definitionId, JSON.stringify(x.transform?.position?.map(v=>+(v*1000).toFixed(0))));
