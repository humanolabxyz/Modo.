import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/data/panel.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {MODULES,RETIRED_MODULES,TERMINALS,PORT_COUNT,matchesTerminal}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const originalPath=new URL('./panel-model-original.json',import.meta.url);
const publicPath=new URL('../public/panel-model.json',import.meta.url);
if(!fs.existsSync(originalPath))fs.copyFileSync(publicPath,originalPath);
const original=JSON.parse(fs.readFileSync(originalPath,'utf8'));
const originalIds=original.modules.flatMap(m=>m.terminals.map(t=>`${m.id}:${t.id}`)).sort();
assert.equal(MODULES.length,6);
const corrections=JSON.parse(fs.readFileSync(new URL('./user-terminal-corrections.json',import.meta.url),'utf8'));
assert.equal(originalIds.length,108);
assert.equal(PORT_COUNT,94);
assert.equal(new Set(TERMINALS.map(t=>t.key)).size,94);
assert.deepEqual(RETIRED_MODULES.map(m=>m.id),corrections.retiredModules);
assert.equal(RETIRED_MODULES.flatMap(m=>m.terminals).length,16);
const photoAudit=JSON.parse(fs.readFileSync(new URL('./photo-audit.json',import.meta.url),'utf8'));
for(const expected of photoAudit.modules){
 const m=[...MODULES,...RETIRED_MODULES].find(m=>m.id===expected.id);
 assert.deepEqual([...m.terminals.filter(t=>!corrections.additions.includes(`${m.id}:${t.id}`)).map(t=>t.id)].sort(),[...expected.labels].sort(),m.id+' photographed inventory');
 for(const [i,id] of expected.labels.entries())assert.equal(m.terminals.find(t=>t.id===id).color,corrections.colorOverrides?.[`${m.id}:${id}`]||expected.colors[i],m.id+':'+id+' photographed color');
 assert.deepEqual(m.labelBands.filter(b=>!b.every(id=>corrections.additions.includes(`${m.id}:${id}`))),expected.bands,m.id+' photographed label bands');
}
assert.deepEqual([...TERMINALS.map(t=>t.key),...RETIRED_MODULES.flatMap(m=>m.terminals.map(t=>`${m.id}:${t.id}`))].sort(),[...originalIds,...corrections.additions].sort(),'All base IDs accounted for: active terminals plus explicitly retired timer');
assert.ok(!TERMINALS.some(t=>t.module.id==='TEMPORIZADOR_2'));
assert.deepEqual(MODULES.map(m=>[m.id,m.x,m.y]).sort(),[['BORNERA_MOTOR',574,798],['BOTONERAS',674,76],['CONTACTOR_TERMICO',65,412],['CONTACTOR_TRIFASICO',674,412],['FUENTE',65,76],['TEMPORIZADOR_1',65,798]],'Disposición base compacta en dos columnas, sin huecos');
for(const m of MODULES)for(const n of MODULES.filter(n=>n.id!==m.id))assert.ok(m.x+m.w<=n.x||n.x+n.w<=m.x||m.y+m.h<=n.y||n.y+n.h<=m.y,`${m.id} overlaps ${n.id}`);
for(const {module,terminal,key} of TERMINALS){
 assert.ok(['red','blue','black','gray','white','green'].includes(terminal.color),key);
 assert.ok(['foto','convencion_por_confirmar','no_verificado','usuario'].includes(terminal.verification),key);
 if(corrections.additions.includes(key)){assert.equal(terminal.verification,'usuario');assert.equal(terminal.state,'NC · normalmente cerrado');assert.match(terminal.note,/por confirmar/)}
 assert.ok(terminal.x>=15&&terminal.x<=module.w-15&&terminal.y>=15&&terminal.y<=module.h-15,key+' position');
 assert.ok(!terminal.state||terminal.verification!=='foto',key+' unverified contact cannot be photo-confirmed');
}
const buttons=MODULES.find(m=>m.id==='BOTONERAS');
const port=id=>buttons.terminals.find(t=>t.id===id);
for(const s of [1,2,3]){
 assert.equal(port(`S${s}:1`).color,'red');assert.equal(port(`S${s}:2`).color,'red');
 assert.equal(port(`S${s}:3`).color,'white');assert.equal(port(`S${s}:4`).color,'white');
 assert.ok(port(`S${s}:1`).y<port(`S${s}:2`).y);
 assert.ok(port(`S${s}:3`).y<port(`S${s}:4`).y);
 assert.ok(port(`S${s}:1`).x<port(`S${s}:3`).x);
}
for(const [query,count] of [['95',2],['96',2],['A1',3],['13',3],['S2:3',1],['BOTONERAS:S2:3',1]]){
 assert.equal(TERMINALS.filter(t=>matchesTerminal(t.module,t.terminal,query)).length,count,query);
}
assert.ok(matchesTerminal(buttons,port('S2:3'),'botoneras'));
const motor=MODULES.find(m=>m.id==='BORNERA_MOTOR');
assert.deepEqual(motor.terminals.slice(0,6).map(t=>[t.id,t.color]),[['U1','blue'],['V1','black'],['W1','red'],['W2','red'],['U2','blue'],['V2','black']]);
assert.ok(!MODULES.find(m=>m.id==='CONTACTOR_TRIFASICO').terminals.some(t=>t.id==='97'));
const thermal=MODULES.find(m=>m.id==='CONTACTOR_TERMICO');
const thermalPort=id=>thermal.terminals.find(t=>t.id===id);
assert.ok(thermalPort('95').y>thermalPort('81').y&&thermalPort('81').y>thermalPort('71').y);
assert.equal(thermalPort('95').y,thermalPort('96').y);
assert.ok(thermalPort('97').y>thermalPort('93').y&&thermalPort('93').y>thermalPort('63').y);
assert.equal(thermalPort('97').y,thermalPort('98').y);
if(process.argv.includes('--sync')){
 fs.writeFileSync(publicPath,JSON.stringify({...original,version:'2.1',modules:MODULES,portCount:PORT_COUNT,retiredModuleIds:corrections.retiredModules},null,2)+'\n');
 const csvPath=new URL('../TABLA_DE_BORNES.csv',import.meta.url);
 const csvOriginal=new URL('./TABLA_DE_BORNES-original.csv',import.meta.url);
 if(!fs.existsSync(csvOriginal))fs.copyFileSync(csvPath,csvOriginal);
 const cell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
 fs.writeFileSync(csvPath,'module_id,module_title,terminal_id,full_id,color,note,verification,x_local,y_local\n'+TERMINALS.map(({module,terminal,key})=>[module.id,module.title,terminal.id,key,terminal.color,terminal.note,terminal.verification,terminal.x,terminal.y].map(cell).join(',')).join('\n')+'\n');
}
assert.deepEqual(JSON.parse(fs.readFileSync(publicPath,'utf8')).modules,JSON.parse(JSON.stringify(MODULES)),'Run npm run sync:data after editing geometry');
console.log('PASS: 6 modules, 94 active IDs; 16 original timer IDs explicitly retired; original photo audit with explicit user color overrides; centred KM1, no module overlaps and export parity.');
