// Renderiza cada variante visual de los equipos a un HTML estático para revisarla a ojo y comprobar que ninguna lanza error.
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/icons-variants';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export {EquipmentBody,EquipmentDefs} from './src/lab/equipment/Art';export {defaults,dimensions,VARIANTS,CATALOG} from './src/lab/equipment/model';export {createElement as h} from 'react';export {renderToStaticMarkup} from 'react-dom/server';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/bundle.mjs',jsx:'automatic',logLevel:'error',external:['react','react-dom','react-dom/server','react/jsx-runtime']});
const m=await import('./icons-variants/bundle.mjs?'+Date.now());
const cases=[];
for(const [kind,v] of Object.entries(m.VARIANTS))for(const o of v.options)cases.push({kind,variant:o.value,label:`${kind} · ${o.label}`});
for(const kind of ['contactor','thermal'])cases.push({kind,variant:'',label:`${kind} · simbólico`,symbolic:true});
let svgs='';
for(const c of cases){
 const d=m.dimensions(c.kind);
 for(const state of [{on:false,closed:true},{on:true,closed:false}]){
  const part={id:'x',kind:c.kind,tag:'X1',x:0,y:0,closed:state.closed,params:{...m.defaults(c.kind),text:c.variant}};
  const reading={voltage:0,current:0,power:0,energy:0,cost:0,frequency:0,rpm:0,soc:0,active:state.on,closed:state.closed,reverse:false,status:''};
  const body=m.renderToStaticMarkup(m.h(m.EquipmentBody,{part,reading,symbolic:!!c.symbolic}));
  if(!body||body.includes('NaN'))throw new Error('Dibujo inválido: '+c.label);
  svgs+=`<figure><svg viewBox="-10 -20 ${d.w+20} ${d.h+50}" width="${Math.min(240,d.w+20)}">${body}</svg><figcaption>${c.label} · ${state.on?'activo/abierto':'reposo/cerrado'}</figcaption></figure>`;
 }
}
fs.writeFileSync(out+'/variantes.html',`<!doctype html><meta charset="utf-8"><style>body{font:12px sans-serif;background:#eef1f3;display:flex;flex-wrap:wrap;gap:14px;padding:14px}figure{margin:0;background:#fff;padding:8px;border-radius:8px}figcaption{text-align:center;color:#334}</style>${m.renderToStaticMarkup(m.h('svg',{width:0,height:0},m.h(m.EquipmentDefs)))}${svgs}`);
console.log(`PASS render-icon-variants: ${cases.length*2} dibujos sin errores`);
