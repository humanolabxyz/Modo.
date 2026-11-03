// Copiar el código de un paso de la guía y pegarlo en Programación: debe quedar «compilado» sin recompilar.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/robotica-paste';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export {precompiledHex,stepHex} from './src/robotics/guide/programCheck.ts';export {PROGRAM_GUIDES} from './src/robotics/guide/programGuides.ts';export {hashSource,artifactStatus} from './src/robotics/mcu/compiler/state.ts';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/bundle.mjs',logLevel:'error'});
const m=await import('./robotica-paste/bundle.mjs?'+Date.now());
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++;};
const CRLF=/\r\n?/g;
for(const g of m.PROGRAM_GUIDES)for(const s of g.steps){
 const hex=m.stepHex(s);if(!hex)continue;
 const lf=s.source.replace(CRLF,'\n'),crlf=lf.replace(/\n/g,'\r\n');
 ok(m.precompiledHex(s.source)===hex,`${g.id}/${s.id}: el código exacto se reconoce`);
 ok(m.precompiledHex(lf)===hex,`${g.id}/${s.id}: copiado con saltos LF se reconoce`);
 ok(m.precompiledHex(crlf)===hex,`${g.id}/${s.id}: copiado con CRLF se reconoce`);
 ok(m.precompiledHex(lf.split('\n').map(l=>l||' ').join('\n'))===hex,`${g.id}/${s.id}: copiado de la ventana (líneas vacías con un espacio) se reconoce`);
 ok(m.precompiledHex(lf.trimEnd())===hex,`${g.id}/${s.id}: sin salto final se reconoce`);
 ok(m.precompiledHex(lf+'\n\n')===hex,`${g.id}/${s.id}: con líneas vacías al final se reconoce`);
 ok(m.precompiledHex(lf+'\n// cambio')===undefined,`${g.id}/${s.id}: si el alumno edita el código ya no coincide`);
 const art={hex,origin:'remote-compiler',sourceHash:m.hashSource(lf)};
 ok(m.artifactStatus(art,m.hashSource(lf))==='fresh',`${g.id}/${s.id}: estado «Compilado»`);
}
ok(n>10,'se probaron pasos de las guías');
console.log(`PASS verify-robotics-paste: ${n} comprobaciones`);
