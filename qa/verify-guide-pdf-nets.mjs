// El montaje de la lección manual debe ser, red por red, el de las figuras Nº1 (mando) y Nº2 (fuerza) del PDF de la Actividad 2 de la Unidad 2.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/panel-faults';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/meterActivity';export {addExtraModule} from './src/data/layout';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/pdf-nets-model.mjs',loader:{'.json':'json'},logLevel:'silent'});
const m=await import('./panel-faults/pdf-nets-model.mjs?'+Date.now());m.addExtraModule('tri');
const nets=(wires,keep=()=>true)=>{const parent=new Map(),r=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,r(parent.get(x)));return parent.get(x);};for(const w of wires)parent.set(r(w.from.terminalId),r(w.to.terminalId));const g=new Map();for(const k of [...parent.keys()]){const x=r(k);(g.get(x)??g.set(x,[]).get(x)).push(k);}return [...g.values()].map(a=>a.filter(keep).sort().join(' ')).filter(Boolean).sort();};
const T='CONTACTOR_TERMICO',K2='CONTACTOR_TRIFASICO',K3='CONTACTOR_TRIFASICO_3',B='BOTONERAS',M='BORNERA_MOTOR';
/* SB1=S2, SB2=S1, SB3=S3 · H1=P2 (rojo), H2=P1 (estrella), H3=P4 (triángulo), H4=P3 (sobrecarga) · KM1=térmico (principal), KM2=triángulo, KM3=estrella. */
const pdf=[
 // Figura Nº1 · mando
 ['FUENTE:F',T+':95'],[T+':95',T+':97'],[T+':95',T+':71'],[T+':96',B+':S2:1'],
 [B+':S2:2',B+':S1:3'],[B+':S2:2',T+':13'],
 [B+':S1:4',T+':14'],[B+':S1:4',T+':A1'],[B+':S1:4',B+':S3:1'],[B+':S1:4',B+':S3:3'],[B+':S1:4',K2+':13'],
 [B+':S3:2',K2+':71'],[K2+':72',K3+':A1'],[K2+':72',B+':PILOTO_1'],
 [B+':S3:4',K2+':14'],[B+':S3:4',K3+':71'],[K3+':72',K2+':A1'],[K3+':72',B+':PILOTO_4'],
 [T+':98',B+':PILOTO_3'],[T+':72',B+':PILOTO_2'],
 ['FUENTE:N',B+':N'],['FUENTE:N',T+':A2'],['FUENTE:N',K2+':A2'],['FUENTE:N',K3+':A2'],
 // Figura Nº2 · fuerza: KM1 al motor; KM2 (triángulo) toma L1-L3 antes de KM1 y sale 2→W2, 4→U2, 6→V2; KM3 (estrella) puentea 1-3-5 y sale 2→V2, 4→U2, 6→W2
 ['FUENTE:R',T+':L1'],['FUENTE:S',T+':L2'],['FUENTE:T',T+':L3'],
 [T+':T1',M+':U1'],[T+':T2',M+':V1'],[T+':T3',M+':W1'],
 [T+':L1',K2+':L1'],[T+':L2',K2+':L2'],[T+':L3',K2+':L3'],
 [K2+':T1',M+':W2'],[K2+':T2',M+':U2'],[K2+':T3',M+':V2'],
 [K3+':L1',K3+':L2'],[K3+':L2',K3+':L3'],
 [K3+':T1',M+':V2'],[K3+':T2',M+':U2'],[K3+':T3',M+':W2']
].map(([a,b])=>({from:{terminalId:a},to:{terminalId:b}}));
const noEarth=t=>!/:TP(_|$)/.test(t);/* las tierras de protección no están dibujadas en las figuras */
const bench=nets(m.activityDocument('manual').wires,noEarth),reference=nets(pdf);
const extra=bench.filter(x=>!reference.includes(x)),missing=reference.filter(x=>!bench.includes(x));
assert.deepEqual({extra,missing},{extra:[],missing:[]},'La lección manual debe coincidir con las figuras del PDF');
console.log(`PASS verify-guide-pdf-nets: ${reference.length} redes idénticas entre la lección manual y las figuras Nº1 y Nº2 del PDF`);
