// Conectividad del diagrama «Estrella-triángulo» transcrito de la foto: cada red debe unir exactamente estos bornes.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({entryPoints:['src/data/cade.ts'],bundle:true,platform:'node',format:'esm',outdir:'qa/estrella-triangulo/model',logLevel:'silent'});
const {ESTRELLA_CADE:c,PERFECTO_CADE:p}=await import('./estrella-triangulo/model/cade.js?'+Date.now());
const key=pt=>`${pt.reference||'N'}:${pt.terminal}`;
// Redes de conductores: conjuntos de bornes, sin atravesar contactos, bobinas ni cargas.
const nets=new Map();
for(const w of c.WIRES){const n=c.network(w.id),k=n.wires.map(x=>x.id).sort((a,b)=>a-b).join(',');if(!nets.has(k))nets.set(k,n.ports.map(key).sort().join(' '))}
const found=new Set(nets.values());
const expected=[
 // ── potencia ──
 '-X:L1 Q1:1','-X:L2 Q1:3','-X:L3 Q1:5',
 'KM1:1 KM2:1 Q1:2','KM1:3 KM2:3 Q1:4','KM1:5 KM2:5 Q1:6',
 'F1:1 KM1:2','F1:3 KM1:4','F1:5 KM1:6',
 'F1:2 M1:U1','F1:4 M1:V1','F1:6 M1:W1',
 'KM2:6 KM3:2 M1:V2','KM2:4 KM3:4 M1:U2','KM2:2 KM3:6 M1:W2',
 'KM3:1 KM3:3 KM3:5','-X:PE M1:PE',
 // ── mando ──
 '-X:L -Q:1','-Q:2 F1:95 F1:97 KM1:11','F1:96 SB1:11','F1:98 H4:X1',
 'KM1:13 SB1:12 SB2:13','KM1:14 KM1:A1 KM2:13 SB2:14 -S:11 -S:13',
 '-S:12 KM2:11','KM2:12 KM3:A1 H2:X1',
 '-S:14 KM2:14 KM3:11','KM2:A1 KM3:12 H3:X1',
 'H1:X1 KM1:12',
 'H1:X2 H2:X2 H3:X2 H4:X2 KM1:A2 KM2:A2 KM3:A2 N:N',
].map(s=>s.split(' ').sort().join(' '));
// Los rótulos repetidos (p. ej. KM2:12 del contacto NC y KM3:12) se distinguen por red: se comparan como conjuntos.
const norm=s=>[...new Set(s.split(' '))].sort().join(' ');
const foundNorm=new Set([...found].map(norm));
for(const e of expected)assert.ok(foundNorm.has(norm(e)),'falta la red: '+e+'\nredes encontradas:\n  '+[...foundNorm].join('\n  '));
// Conteos del dibujo transcrito
assert.equal(c.SYMBOLS.length,26,'símbolos');
const refs=c.SYMBOLS.map(o=>o.reference).filter(Boolean).sort().join(',');
assert.equal(refs,['-Q','-S','-X','-X','F1','F1','H1','H2','H3','H4','KM1','KM1','KM1','KM1','KM2','KM2','KM2','KM2','KM3','KM3','KM3','M1','Q1','SB1','SB2'].sort().join(','),'referencias');
// Todo símbolo tiene sus bornes sobre algún conductor (salvo los que solo se leen como etiqueta)
const onWire=(pt)=>c.WIRES.some(w=>Math.abs((w.x2-w.x)*(pt.y-w.y)-(w.y2-w.y)*(pt.x-w.x))<.01&&pt.x>=Math.min(w.x,w.x2)-.01&&pt.x<=Math.max(w.x,w.x2)+.01&&pt.y>=Math.min(w.y,w.y2)-.01&&pt.y<=Math.max(w.y,w.y2)+.01);
for(const pt of c.PORTS)assert.ok(onWire(pt),`borne sin conductor: ${pt.reference}:${pt.terminal} en (${pt.x},${pt.y})`);
// PERFECTO no cambia
assert.equal(p.WIRES.length,47,'PERFECTO conserva sus 47 conductores');
console.log(`PASS verify-estrella: ${expected.length} redes verificadas, ${c.SYMBOLS.length} símbolos, ${c.WIRES.length} conductores; PERFECTO intacto`);
