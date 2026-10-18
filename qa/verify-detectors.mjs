import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
/* Modelos del banco de detectores: detección por principio y material, salida PNP/NPN, polaridad, cortocircuito, multímetro,
 * entrada de PLC, fichas pendientes y reglas de cada lección. Todo es un modelo ideal declarado, no un detector comercial. */
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'panellab-detectors-check-'));
const tests=[];
function test(name,run){try{run();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',error:error.message});}}
const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg||''} esperado ${b} ± ${tol}, obtenido ${a}`);
try{
  const sources={};
  for(const [file,out] of [['src/lab/detectors/physics.ts','physics.mjs'],['src/lab/detectors/state.ts','state.mjs'],['src/learning/detectorLessons.ts','lessons.mjs'],['src/lab/detectors/datasheets.ts','datasheets.mjs']]){
    let source=await fs.readFile(path.join(root,file),'utf8');sources[file]=source;
    source=source.replace(/from '(\.\.?\/[^']*?)(?:\.ts)?'/g,(m,p)=>`from '${p.replace(/^.*\/(physics|state)$/,(x,n)=>`./${n}.mjs`)}'`);
    await fs.writeFile(path.join(directory,out),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
  }
  const P=await import(pathToFileURL(path.join(directory,'physics.mjs')));
  const S=await import(pathToFileURL(path.join(directory,'state.mjs')));
  const L=await import(pathToFileURL(path.join(directory,'lessons.mjs')));
  const D=await import(pathToFileURL(path.join(directory,'datasheets.mjs')));

  /* Montajes de ayuda */
  const base=(over={})=>({...P.defaultSettings(),...over});
  const POWER=[['s+','g+'],['s-','g-']];
  const mk=(over={},wires=[])=>base({supplyOn:true,wires:[...POWER,...wires],...over});
  const run=s=>{const info=P.effectiveSpec(s),sol=P.solve(s,info.spec);return {info,sol,reading:P.readMeter(s,sol)};};
  const volts=(s)=>run(s).reading.value;
  const probes=(red,black,over={},wires=[])=>mk({mode:'V',red,black,...over},wires);

  test('Detección por principio y material: inductivo solo metal; capacitivo y fotoeléctrico ambos',()=>{
    assert.equal(P.detects('inductive','metal',5,10),true);assert.equal(P.detects('inductive','plastic',5,10),false);
    assert.equal(P.detects('capacitive','metal',5,10),true);assert.equal(P.detects('capacitive','plastic',5,10),true);
    assert.equal(P.detects('photo','metal',50,100),true);assert.equal(P.detects('photo','plastic',50,100),true);
    assert.equal(P.detects('inductive','none',0,10),false);
  });
  test('El alcance es un límite: dentro y en el borde detecta, fuera no',()=>{
    assert.equal(P.detects('inductive','metal',10,10),true);assert.equal(P.detects('inductive','metal',10.1,10),false);assert.equal(P.detects('photo','plastic',100.1,100),false);
  });
  test('Alcances del modelo genérico declarados (10, 10 y 100 mm)',()=>{assert.deepEqual(P.GENERIC_RANGE,{inductive:10,capacitive:10,photo:100});});
  test('PNP: la salida contra 0 V vale 24 V con objeto y 0 V sin objeto',()=>{
    near(volts(probes('so','g-',{object:'metal',distance:5})),24,1e-6);
    near(volts(probes('so','g-',{object:'none'})),0,1e-6);
    near(volts(probes('so','g-',{object:'plastic',distance:5})),0,1e-6,'inductivo con plástico');
    near(volts(probes('so','g-',{object:'metal',distance:50})),0,1e-6,'fuera del alcance');
  });
  test('NPN: contra 0 V siempre 0 V; entre +V y OUT aparecen 24 V solo al detectar',()=>{
    near(volts(probes('so','g-',{output:'npn',object:'metal',distance:5})),0,1e-6);
    near(volts(probes('so','g-',{output:'npn',object:'none'})),0,1e-6);
    near(volts(probes('g+','so',{output:'npn',object:'metal',distance:5})),24,1e-6);
    near(volts(probes('g+','so',{output:'npn',object:'none'})),0,1e-6,'salida abierta medida contra +V');
    near(volts(probes('so','g+',{output:'npn',object:'metal',distance:5})),-24,1e-6,'puntas invertidas');
  });
  test('El multímetro de 10 MΩ no perturba la salida: el borne OUT activo queda exactamente en el riel',()=>{
    const {sol}=run(probes('so','g-',{object:'metal',distance:5}));near(sol.v.so,24,1e-9);near(sol.v['s+'],24,1e-9);
  });
  test('Sin fuente encendida todo marca 0 V y el detector no está alimentado',()=>{
    const r=run(probes('so','g-',{supplyOn:false,object:'metal',distance:5}));assert.equal(r.sol.powered,false);near(r.reading.value,0,1e-9);
  });
  test('Detector sin cables a la fuente: no está alimentado ni activo',()=>{
    const s=base({supplyOn:true,mode:'V',red:'so',black:'g-',object:'metal',distance:5});const r=run(s);assert.equal(r.sol.powered,false);assert.equal(r.sol.active,false);
  });
  test('Alimentación invertida: el detector no funciona y se avisa',()=>{
    const s=base({supplyOn:true,wires:[['s+','g-'],['s-','g+']],mode:'V',red:'so',black:'g-',object:'metal',distance:5}),r=run(s);
    assert.equal(r.sol.polarity,'reversed');assert.equal(r.sol.powered,false);assert.ok(r.sol.warnings.some(w=>/invertida/i.test(w)));near(r.reading.value,0,1e-9);
  });
  test('Cortocircuito de la fuente: se avisa y las tensiones quedan en 0',()=>{
    const r=run(mk({mode:'V',red:'g+',black:'g-'},[['g+','g-']]));assert.equal(r.sol.short,true);assert.ok(r.sol.warnings.some(w=>/cortocircuito/i.test(w)));near(r.reading.value,0,1e-9);
  });
  test('Salida activa unida al otro riel: se avisa en vez de inventar una corriente',()=>{
    const r=run(mk({object:'metal',distance:5},[['so','g-']]));assert.ok(r.sol.warnings.some(w=>/cortocircuito/i.test(w)));assert.equal(r.sol.short,false);
  });
  test('PLC con PNP y común a 0 V: X0 lee 24 V y queda ON con objeto, OFF sin objeto',()=>{
    const w=[['so','px'],['pc','g-']];
    const on=run(mk({object:'metal',distance:5},w)).sol,off=run(mk({object:'none'},w)).sol;
    assert.equal(on.plcOn,true);near(on.plcVolts,24,1e-9);assert.equal(off.plcOn,false);near(off.plcVolts,0,1e-9);
  });
  test('PLC con NPN y común a +24 V: ON con objeto, OFF sin objeto',()=>{
    const w=[['so','px'],['pc','g+']];
    const on=run(mk({output:'npn',object:'metal',distance:5},w)).sol,off=run(mk({output:'npn',object:'none'},w)).sol;
    assert.equal(on.plcOn,true);near(on.plcVolts,24,1e-9);assert.equal(off.plcOn,false);near(off.plcVolts,0,1e-9);
  });
  test('PLC con común equivocado: PNP con COM a +24 V y NPN con COM a 0 V nunca activan la entrada',()=>{
    assert.equal(run(mk({object:'metal',distance:5},[['so','px'],['pc','g+']])).sol.plcOn,false);
    assert.equal(run(mk({output:'npn',object:'metal',distance:5},[['so','px'],['pc','g-']])).sol.plcOn,false);
  });
  test('PLC sin cable de salida o sin común: la entrada no se activa aunque el detector detecte',()=>{
    assert.equal(run(mk({object:'metal',distance:5},[['pc','g-']])).sol.plcOn,false);
    assert.equal(run(mk({object:'metal',distance:5},[['so','px']])).sol.plcOn,false);
  });
  test('Con el detector activo y X0 conectado, el multímetro en X0–COM lee la tensión de entrada',()=>{
    near(volts(probes('px','pc',{object:'metal',distance:5},[['so','px'],['pc','g-']])),24,1e-6);
  });
  test('Multímetro apagado, sin puntas o con las dos puntas en el mismo borne',()=>{
    assert.equal(run(base({mode:'off',red:'so',black:'g-'})).reading.state,'off');
    assert.equal(run(base({mode:'V'})).reading.state,'idle');
    near(run(mk({mode:'V',red:'g+',black:'g+'})).reading.value,0,0);
  });
  test('Invertir las puntas invierte el signo de la lectura',()=>{
    near(volts(probes('g-','so',{object:'metal',distance:5})),-24,1e-6);
  });
  test('La lectura identifica si mide la salida contra 0 V o contra +V',()=>{
    assert.deepEqual(run(probes('so','g-')).reading.out,{ref:'0v'});assert.deepEqual(run(probes('g+','so')).reading.out,{ref:'plus'});assert.deepEqual(run(probes('so','g+')).reading.out,{ref:'plus'});
    assert.equal(run(probes('g+','g-')).reading.out,null);assert.equal(run(probes('px','pc')).reading.out,null);
  });
  test('Nivel lógico: 24 V alto y 0 V bajo contra 0 V; invertido contra +V; zona intermedia indefinida',()=>{
    assert.equal(P.levelOf(24,'0v'),'Alto (24 V)');assert.equal(P.levelOf(0,'0v'),'Bajo (0 V)');assert.equal(P.levelOf(12,'0v'),'Indefinido');
    assert.equal(P.levelOf(24,'plus'),'Bajo (0 V)');assert.match(P.levelOf(0,'plus'),/abierta/);
  });

  /* Fichas: nada se inventa */
  test('Las cuatro fichas empiezan vacías: ningún dato de modelo viene precargado',()=>{
    const s=P.defaultSettings();assert.deepEqual(P.MODELS,['CR30-15DN','CR30-15DP','XS118BLPAL2','BR100-DDT-P']);
    for(const m of P.MODELS){assert.deepEqual(s.fichas[m],P.emptyFicha());assert.equal(P.fichaComplete(s.fichas[m]),false);}
  });
  test('Un modelo de G02 sin ficha queda pendiente de ficha técnica y no se simula',()=>{
    for(const m of P.MODELS){const i=P.effectiveSpec(base({model:m}));assert.equal(i.spec,null);assert.match(i.pending,/pendiente de ficha técnica/);}
    const s=mk({model:'CR30-15DP',object:'metal',distance:1,mode:'V',red:'so',black:'g-'}),r=run(s);assert.equal(r.sol.powered,false);assert.equal(r.sol.active,false);
  });
  const filled=(over={})=>({brand:'Marca de prueba',wires:'3',principle:'inductive',output:'pnp',supply:'prueba',range:'15',...over});
  test('Con la ficha completa se simula con los datos que escribió el estudiante',()=>{
    const s=mk({model:'CR30-15DP',object:'metal',distance:12,fichas:{...P.defaultSettings().fichas,'CR30-15DP':filled()},mode:'V',red:'so',black:'g-'}),r=run(s);
    assert.equal(r.info.spec.range,15);assert.equal(r.sol.active,true);near(r.reading.value,24,1e-6);
    const far=run({...s,distance:20});assert.equal(far.sol.active,false);
    assert.equal(run({...s,object:'plastic'}).sol.active,false);
  });
  test('La ficha acepta coma decimal y 4 hilos (el 4.º no se modela) y rechaza 2 hilos, salida «otra» o distancia inválida',()=>{
    const spec=f=>P.effectiveSpec(base({model:'XS118BLPAL2',fichas:{...P.defaultSettings().fichas,XS118BLPAL2:f}}));
    assert.equal(spec(filled({range:'7,5'})).spec.range,7.5);
    assert.match(spec(filled({wires:'2'})).pending,/3 hilos/);assert.match(spec(filled({wires:'4'})).spec.label,/4\.º hilo sin modelar/);
    assert.match(spec(filled({output:'other'})).pending,/PNP o NPN/);
    assert.match(spec(filled({range:'abc'})).pending,/distancia/);assert.match(spec(filled({range:'0'})).pending,/distancia/);assert.match(spec(filled({range:'999'})).pending,/distancia/);
  });
  test('El modelo físico, el estado y las lecciones no nombran colores ni bornes de los modelos concretos (solo las fichas citadas lo hacen)',()=>{
    for(const [file,text] of Object.entries(sources).filter(([f])=>!/datasheets/.test(f)))assert.doesNotMatch(text,/marr[oó]n|\bbrown\b|\bblue\b|\bBN\b|\bBU\b|\bBK\b|pin\s*\d/i,file);
  });

  /* Fichas citadas de los equipos */
  const sheet=id=>D.DATASHEETS.find(s=>s.id===id);
  test('Hay una ficha por cada modelo de G02, por cada principio y por cada equipo del banco, con identificadores únicos',()=>{
    assert.equal(new Set(D.DATASHEETS.map(s=>s.id)).size,D.DATASHEETS.length);
    for(const id of [...P.MODELS,...P.KINDS,'target','psu','plc','dmm'])assert.ok(sheet(id),id);
    for(const s of D.DATASHEETS){assert.ok(s.look.length>40&&s.rows.length>=2&&s.bench.length>=1&&s.pending.length>=1,s.id);}
  });
  test('Toda fuente de una ficha es un enlace https y las fichas de los modelos de G02 citan al menos una',()=>{
    for(const s of D.DATASHEETS)for(const src of s.sources)assert.match(src.url,/^https:\/\//,s.id);
    for(const id of P.MODELS)assert.ok(sheet(id).sources.length>=1,id);
    for(const id of ['inductive','capacitive','photo','psu','plc'])assert.ok(sheet(id).sources.length>=1,id);
  });
  test('«Usar los datos de la ficha citada» da una ficha completa que el banco simula con el principio, la salida y el alcance de la fuente',()=>{
    const expected={'CR30-15DN':['capacitive','npn',15],'CR30-15DP':['capacitive','pnp',15],XS118BLPAL2:['inductive','pnp',5],'BR100-DDT-P':['photo','pnp',100]};
    for(const m of P.MODELS){const f=sheet(m).fill;assert.ok(P.fichaComplete(f),m);const spec=P.effectiveSpec(base({model:m,fichas:{...P.defaultSettings().fichas,[m]:f}})).spec;assert.deepEqual([spec.kind,spec.output,spec.range],expected[m],m);}
  });
  test('Los CR30 figuran como capacitivos (no inductivos) y su ficha aclara la diferencia',()=>{
    for(const m of ['CR30-15DN','CR30-15DP']){assert.match(sheet(m).kind,/capacitivo/i);assert.match(sheet(m).rows.map(r=>r.join(' ')).join(' '),/no es inductivo/);}
  });
  test('Los colores de los hilos solo se muestran donde una ficha los respalda: CR30 y XS118 sí, BR100-DDT-P queda pendiente',()=>{
    for(const m of ['CR30-15DN','CR30-15DP','XS118BLPAL2'])assert.match(sheet(m).rows.map(r=>r.join(' ')).join(' '),/[Mm]arrón/,m);
    assert.ok(sheet('BR100-DDT-P').pending.some(p=>/colores/i.test(p)));assert.doesNotMatch(sheet('BR100-DDT-P').rows.map(r=>r.join(' ')).join(' '),/marrón|azul|negro/i);
    assert.deepEqual(Object.keys(D.WIRE_COLORS),['plus','minus','out']);
  });
  test('Los datos del PLC del banco coinciden con la ficha DVP-SS2: 4,7 kΩ y ON sobre 15 V',()=>{
    assert.equal(P.PLC_OHMS,4700);assert.equal(P.PLC_ON_VOLTS,15);const text=sheet('plc').rows.map(r=>r.join(' ')).join(' ');assert.match(text,/4,7 kΩ/);assert.match(text,/15 V/);
    assert.ok(sheet('plc').pending.some(p=>/maqueta/.test(p)));
  });

  /* Estado y guardado */
  const rec=(over={})=>({id:'a',source:'simulada',model:'generic',kind:'inductive',output:'pnp',object:'metal',detected:true,ref:'0v',value:24,at:1,...over});
  test('Un punto repetido reemplaza al anterior y simulado/real no se mezclan',()=>{
    let list=S.addRecord([],rec());list=S.addRecord(list,rec({id:'b',value:23.9}));assert.equal(list.length,1);assert.equal(list[0].value,23.9);
    list=S.addRecord(list,rec({id:'c',source:'real',value:23.5}));assert.equal(list.length,2);assert.deepEqual(list.map(r=>r.source).sort(),['real','simulada']);
  });
  test('El guardado se serializa y valida; uno incompatible o con datos fuera de rango se rechaza',()=>{
    const s=mk({wires:[['so','px']]}),raw=S.serializeBench(s,[rec()]),back=S.parseBench(raw);assert.deepEqual(back.settings.wires,s.wires);assert.equal(back.records.length,1);
    assert.throws(()=>S.parseBench('{"version":99}'));assert.throws(()=>S.parseBench('no es json'));
    assert.throws(()=>S.parseBench(JSON.stringify({version:1,settings:{...s,distance:9999},records:[]})));
    assert.throws(()=>S.parseBench(JSON.stringify({version:1,settings:{...s,wires:[['so','so']]},records:[]})));
    assert.throws(()=>S.parseBench(JSON.stringify({version:1,settings:s,records:[rec({value:'x'})]})));
  });
  test('El CSV distingue simulados y reales (coma decimal y «;»)',()=>{
    const csv=S.toCsv([rec({value:23.95}),rec({id:'z',source:'real',object:'plastic',detected:false,value:0.2})]);
    assert.match(csv,/^origen;detector;objeto;detectado;medida;tension_V;nivel;fecha/);assert.match(csv,/simulada;Inductivo PNP;Metal \(acero\);sí;OUT-0V;23,95/);assert.match(csv,/real;Inductivo PNP;No metálico \(plástico\);no;OUT-0V;0,20;Bajo \(0 V\)/);
  });
  test('parseNumber acepta coma decimal y rechaza texto o miles',()=>{
    assert.equal(S.parseNumber('23,9'),23.9);assert.equal(S.parseNumber('abc'),null);assert.equal(S.parseNumber('1,000.5'),null);assert.equal(S.parseNumber(''),null);
  });

  /* Lecciones: las reglas se comprueban contra el banco, no contra un clic */
  const lesson=id=>L.detectorLesson(id);
  const measure=(s,source='simulada')=>{ // misma regla que «Registrar punto»
    const {info,sol,reading}=run(s);if(s.mode!=='V'||!info.spec||!sol.powered||!reading.out)return null;
    return {id:Math.random().toString(36),source,model:s.model,kind:info.spec.kind,output:info.spec.output,object:s.object,detected:sol.active,ref:reading.out.ref,value:Number(reading.value.toFixed(3)),at:1};
  };
  const ctx=(s,records)=>{const {info,sol,reading}=run(s);return {settings:s,spec:info.spec,sol,reading,records};};
  const ok=(step,s,records)=>step.check(ctx(s,records));
  test('Hay tres lecciones: dos de G01 (investigar y montar) y una de G02, con identificadores únicos',()=>{
    assert.deepEqual(L.detectorLessons.map(l=>l.guide),['G01','G01','G02']);
    assert.equal(new Set(L.detectorLessons.map(l=>l.id)).size,3);assert.equal(new Set(L.detectorLessons.map(l=>l.materialId)).size,3);
    assert.deepEqual(L.detectorLessons.map(l=>l.bench),[false,true,true]);
    for(const l of L.detectorLessons)assert.ok(/\.docx$/.test(l.source));
  });
  test('Las preguntas de comprensión tienen una respuesta válida y explicación',()=>{
    for(const l of L.detectorLessons){
      const quizzes=[...l.steps.map(s=>s.quiz),l.review].filter(Boolean);
      for(const q of quizzes){assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(q.explanation.length>20);assert.equal(new Set(q.options).size,q.options.length);}
    }
    assert.equal(lesson('detectores-experiencia-1').steps.length,5);assert.ok(lesson('detectores-experiencia-1').steps.every(s=>s.quiz));
    assert.ok(lesson('detectores-experiencia-2').review&&lesson('proximidad-plc-g02').review);
  });
  test('G01 experiencia 2: cada paso se cumple solo con el montaje y los registros correspondientes',()=>{
    const steps=lesson('detectores-experiencia-2').steps,start=base();
    for(let i=0;i<steps.length-1;i++)assert.equal(ok(steps[i],start,[]),false,`paso ${i+1} no debería cumplirse al inicio`);
    // 1 alimentar
    assert.equal(ok(steps[0],mk(),[]),true);assert.equal(ok(steps[0],base({supplyOn:true}),[]),false,'sin cables');
    assert.equal(ok(steps[0],mk({supplyOn:false}),[]),false,'fuente apagada');
    assert.equal(ok(steps[0],base({supplyOn:true,wires:[['s+','g-'],['s-','g+']]}),[]),false,'invertida');
    // 2..6 registros reales del modelo
    let records=[];
    const take=(over)=>{const m=measure(probes('so','g-',over));assert.ok(m);records=S.addRecord(records,m);return m;};
    take({object:'none'});assert.equal(ok(steps[1],mk(),records),true);
    assert.equal(ok(steps[2],mk(),records),false);take({object:'metal',distance:5});assert.equal(ok(steps[2],mk(),records),true);
    take({object:'plastic',distance:5});assert.equal(ok(steps[3],mk(),records),true);
    take({kind:'capacitive',object:'metal',distance:5});assert.equal(ok(steps[4],mk(),records),false);take({kind:'capacitive',object:'plastic',distance:5});assert.equal(ok(steps[4],mk(),records),true);
    take({kind:'photo',object:'none'});assert.equal(ok(steps[5],mk(),records),false);take({kind:'photo',object:'plastic',distance:60});assert.equal(ok(steps[5],mk(),records),true);
    // 7 NPN contra +V
    const m=measure(probes('g+','so',{output:'npn',object:'metal',distance:5}));records=S.addRecord(records,m);assert.equal(ok(steps[6],mk(),records),true);
    // 8 pregunta numérica: sin registro 0 V el paso pide registrarlo; con él, el valor esperado es lo medido
    assert.equal(steps[7].ask.expected({settings:mk(),records}),null);
    records=S.addRecord(records,measure(probes('so','g-',{output:'npn',object:'metal',distance:5})));near(steps[7].ask.expected({settings:mk(),records}),0,1e-6);
  });
  test('Los registros reales (clase) nunca cumplen un paso de preparación',()=>{
    const steps=lesson('detectores-experiencia-2').steps;
    const fake=[rec({source:'real',object:'none',detected:false,value:0}),rec({source:'real'}),rec({source:'real',object:'plastic',detected:false,value:0}),rec({source:'real',kind:'capacitive',output:'pnp'}),rec({source:'real',output:'npn',ref:'plus'})];
    for(const i of [1,2,3,4,5,6])assert.equal(ok(steps[i],mk(),fake),false,`paso ${i+1}`);
    assert.equal(steps[7].ask.expected({settings:mk(),records:fake.map(r=>({...r,output:'npn',ref:'0v'}))}),null);
  });
  test('G01 experiencia 2: un registro con el valor equivocado no cumple (inductivo con plástico nunca da 24 V)',()=>{
    const steps=lesson('detectores-experiencia-2').steps;
    const bad=[rec({object:'plastic',detected:true,value:24})];assert.equal(ok(steps[3],mk(),bad),false);
  });
  test('G02: ficha, detector asignado, mediciones, entrada PLC ON/OFF y conteo de cables',()=>{
    const steps=lesson('proximidad-plc-g02').steps,fichas={...P.defaultSettings().fichas};
    assert.equal(ok(steps[0],base(),[]),false);
    const all=Object.fromEntries(P.MODELS.map(m=>[m,filled()]));assert.equal(ok(steps[0],base({fichas:all}),[]),true);
    assert.equal(ok(steps[0],base({fichas:{...all,'BR100-DDT-P':filled({brand:' '})}}),[]),false,'un dato vacío');
    // detector asignado
    assert.equal(ok(steps[1],mk({model:'CR30-15DN'}),[]),false,'sin ficha');
    const s=(over={},wires=[])=>mk({model:'CR30-15DN',fichas:{...all},object:'metal',distance:5,...over},wires);
    assert.equal(ok(steps[1],s(),[]),true);assert.equal(ok(steps[1],mk({fichas:all}),[]),false,'genérico no cuenta');
    let rs=[];rs=S.addRecord(rs,measure(s({mode:'V',red:'so',black:'g-',object:'none'})));assert.equal(ok(steps[2],s(),rs),true);assert.equal(ok(steps[3],s(),rs),false);
    rs=S.addRecord(rs,measure(s({mode:'V',red:'so',black:'g-'})));assert.equal(ok(steps[3],s(),rs),true);
    const w=[['so','px'],['pc','g-']];
    assert.equal(ok(steps[4],s({},w),rs),true);assert.equal(ok(steps[4],s({},[['so','px']]),rs),false,'sin común');assert.equal(ok(steps[4],s({object:'none'},w),rs),false,'sin objeto');
    assert.equal(ok(steps[5],s({object:'none'},w),rs),true);assert.equal(ok(steps[5],s({},w),rs),false,'con objeto aún ON');assert.equal(ok(steps[5],s({object:'none'},[]),rs),false,'sin conexiones');
    assert.equal(steps[6].ask.expected({settings:s({},w),records:rs}),4);assert.equal(steps[6].ask.expected({settings:s(),records:rs}),2);
    assert.equal(steps[6].ask.expected({settings:base(),records:rs}),null);
  });
  test('G02: un detector NPN de la ficha activa X0 solo con el común a +24 V',()=>{
    const all=Object.fromEntries(P.MODELS.map(m=>[m,filled({output:'npn'})])),steps=lesson('proximidad-plc-g02').steps;
    const s=(wires)=>mk({model:'XS118BLPAL2',fichas:all,object:'metal',distance:5},wires);
    assert.equal(ok(steps[4],s([['so','px'],['pc','g+']]),[]),true);assert.equal(ok(steps[4],s([['so','px'],['pc','g-']]),[]),false);
  });
  test('El progreso se valida: avance corrupto o fuera de rango lanza error',()=>{
    const l=lesson('detectores-experiencia-2');const store={};globalThis.localStorage={getItem:k=>store[k]??null};
    assert.equal(L.readDetProgress(l).step,0);
    store[S.progressKey(l.id)]=JSON.stringify({version:1,step:99,completed:[],notes:'',reviewed:false});assert.throws(()=>L.readDetProgress(l));
    store[S.progressKey(l.id)]=JSON.stringify({version:1,step:2,completed:[0,1],notes:'x',reviewed:false});assert.deepEqual(L.readDetProgress(l).completed,[0,1]);
    delete globalThis.localStorage;
  });
  test('Las URL de estudio y laboratorio apuntan a la misma lección',()=>{
    const l=lesson('proximidad-plc-g02');assert.equal(L.detStudyUrl(l,1),'/estudio?curso=s2-3&clase=instrumentacion-g02&paso=1');assert.equal(L.detLabUrl(l),'/laboratorio?tool=detectors&leccion=proximidad-plc-g02');
  });
}finally{await fs.rm(directory,{recursive:true,force:true});}
const failed=tests.filter(t=>t.status==='FAIL');
for(const t of tests)console.log(`${t.status==='PASS'?'✓':'✗'} ${t.name}${t.error?`\n    ${t.error}`:''}`);
console.log(`\n${tests.length-failed.length}/${tests.length} pruebas de detectores superadas`);
if(failed.length)process.exit(1);
