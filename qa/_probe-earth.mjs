import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const out=path.resolve('qa/_probe');
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/faultCases';export {addExtraModule} from './src/data/layout';export * from './src/data/measurementProfiles';export * from './src/data/meterActivity';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/panelCalibration';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:path.join(out,'bundle.mjs'),logLevel:'error'});
const m=await import(pathToFileURL(path.join(out,'bundle.mjs')).href);
m.addExtraModule('tri');
for(const p of ['twoContactors','manual','matias']){const w=m.activityDocument(p).wires;const tp=w.filter(x=>/TP/.test(x.from.terminalId+x.to.terminalId));console.log(p,w.length,'cables; TP:',JSON.stringify(tp.map(x=>x.from.terminalId+'->'+x.to.terminalId)));}
