import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
/* Modelos del banco de temperatura contra valores publicados (NIST ITS-90 e IEC 60751) y reglas de lectura. */
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'panellab-temperature-check-'));
const tests=[];
function test(name,run){try{run();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',error:error.message});}}
const near=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg||''} esperado ${b} ± ${tol}, obtenido ${a}`);
try{
  for(const [file,out] of [['src/learning/temperatureReview.ts','review.mjs'],['src/lab/temperature/physics.ts','physics.mjs'],['src/lab/temperature/instrument.ts','instrument.mjs'],['src/lab/temperature/state.ts','state.mjs'],['src/learning/temperatureLessons.ts','lessons.mjs']]){
    let source=await fs.readFile(path.join(root,file),'utf8');
    source=source.replace(/from '(\.\.?\/[^']*?)(?:\.ts)?'/g,(m,p)=>`from '${p.endsWith('.mjs')?p:p.replace(/^.*\/(physics|state|instrument)$/,(x,n)=>`./${n}.mjs`)}'`);
    const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
    await fs.writeFile(path.join(directory,out),result.outputText);
  }
  const P=await import(pathToFileURL(path.join(directory,'physics.mjs')));
  const S=await import(pathToFileURL(path.join(directory,'state.mjs')));
  const L=await import(pathToFileURL(path.join(directory,'lessons.mjs')));
  const I=await import(pathToFileURL(path.join(directory,'instrument.mjs')));
  test('Fluke 87 V normal: resolución 0,1 mV y 0,1 Ω, autorango de V y signo',()=>{assert.equal(I.instrumentSample(3.059,'mV').value,3.1);assert.equal(I.instrumentSample(119.397,'Ω').value,119.4);assert.equal(I.instrumentSample(-3.059,'mV').value,-3.1);assert.equal(I.instrumentSample(5.12345,'V').value,5.123);assert.equal(I.instrumentSample(10.1234,'V').value,10.12);});
  const R=await import(pathToFileURL(path.join(directory,'review.mjs')));

  test('Termocupla K coincide con NIST (0, 50, 75, 100 y 200 °C)',()=>{
    near(P.tcEmf('K',0),0,0.002);near(P.tcEmf('K',50),2.023,0.002);near(P.tcEmf('K',75),3.059,0.003);near(P.tcEmf('K',100),4.096,0.002);near(P.tcEmf('K',200),8.138,0.004);
  });
  test('Termocupla J coincide con NIST (0, 50, 100 y 200 °C)',()=>{
    near(P.tcEmf('J',0),0,0.002);near(P.tcEmf('J',50),2.585,0.002);near(P.tcEmf('J',100),5.269,0.002);near(P.tcEmf('J',200),10.779,0.004);
  });
  test('K y J dan tensiones distintas a la misma temperatura',()=>{assert.ok(P.tcEmf('J',100)-P.tcEmf('K',100)>1);});
  test('La inversa devuelve la temperatura original',()=>{for(const type of ['K','J'])for(const t of [0,22,50,75,100,150])near(P.tcTemperature(type,P.tcEmf(type,t)),t,1e-6,`${type} ${t}`);});
  test('Pt100 coincide con IEC 60751 (−50, 0, 50, 75 y 100 °C)',()=>{
    near(P.ptOhms(0),100,1e-9);near(P.ptOhms(50),119.397,0.01);near(P.ptOhms(75),128.99,0.02);near(P.ptOhms(100),138.506,0.01);near(P.ptOhms(-50),80.306,0.02);
  });
  const base=()=>P.defaultSettings();
  test('Constantes de tiempo: el horno y las sondas convergen y quedan estables',()=>{
    const s={...base(),setpoint:75,inWell:{tc:true,pt:true}};let t=P.startTemps(s);
    assert.equal(P.isStable(s,t,'tc'),false);
    for(let i=0;i<400;i++)t=P.stepTemps(s,t,0.1);
    assert.ok(P.isStable(s,t,'tc')&&P.isStable(s,t,'pt'));near(t.bath,75,0.05);
    const settled=P.settledTemps(s);near(settled.tc,75,1e-9);
  });
  test('Una sonda fuera del pozo no se considera estable y vuelve al ambiente',()=>{
    const s={...base(),setpoint:100,inWell:{tc:false,pt:true}};let t={bath:100,tc:100,pt:100};
    assert.equal(P.isStable(s,t,'tc'),false);for(let i=0;i<600;i++)t=P.stepTemps(s,t,0.1);near(t.tc,22,0.1);
  });
  const meter=(patch,temps)=>{const s={...base(),...patch};return P.readMeter(s,temps||P.settledTemps(s));};
  test('Multímetro apagado o sin puntas no entrega lectura',()=>{
    assert.equal(meter({mode:'off',red:'tc+',black:'tc-'}).state,'off');
    assert.equal(meter({mode:'mV',red:'tc+',black:null}).state,'open');
  });
  test('Termocupla en mV: lectura = E(T) − E(ambiente) y cambia de signo al invertir puntas',()=>{
    const s={setpoint:100,mode:'mV',inWell:{tc:true,pt:true},red:'tc+',black:'tc-'};
    const r=meter(s);assert.equal(r.unit,'mV');assert.equal(r.meaningful,true);near(r.value,P.tcEmf('K',100)-P.tcEmf('K',22),1e-9);
    const inv=meter({...s,red:'tc-',black:'tc+'});near(inv.value,-r.value,1e-9);
  });
  test('Termocupla J usa su propia tabla',()=>{
    const r=meter({tcType:'J',setpoint:100,mode:'mV',inWell:{tc:true,pt:false},red:'tc+',black:'tc-'});near(r.value,P.tcEmf('J',100)-P.tcEmf('J',22),1e-9);
  });
  test('Pt100 en Ω da R(T); en mV o V no informa y no es significativa',()=>{
    const s={setpoint:50,inWell:{tc:false,pt:true},red:'pt1',black:'pt3'};
    const r=meter({...s,mode:'ohm'});near(r.value,P.ptOhms(50),1e-9);assert.equal(r.meaningful,true);
    assert.equal(meter({...s,mode:'mV'}).meaningful,false);assert.equal(meter({...s,mode:'V'}).meaningful,false);
  });
  test('Pt100 de 3 o 4 hilos: rojo–blanco mide R(T); rojo–rojo o blanco–blanco solo miden el cable',()=>{
    const s={setpoint:50,mode:'ohm',inWell:{tc:false,pt:true}};
    const rw=meter({...s,red:'pt1',black:'pt3'});near(rw.value,P.ptOhms(50),1e-9);assert.equal(rw.meaningful,true);
    const rw2=meter({...s,red:'pt2',black:'pt3'});near(rw2.value,P.ptOhms(50),1e-9);
    const rr=meter({...s,red:'pt1',black:'pt2'});assert.equal(rr.value,0);assert.equal(rr.meaningful,false);assert.match(rr.note,/rojos/);
    const ww=meter({...s,ptWires:4,red:'pt3',black:'pt4'});assert.equal(ww.value,0);assert.equal(ww.meaningful,false);assert.match(ww.note,/blancos/);
    near(meter({...s,ptWires:4,red:'pt4',black:'pt2'}).value,P.ptOhms(50),1e-9);
  });
  test('Pasar de 4 a 3 hilos suelta la punta conectada al cuarto hilo',()=>{
    const four={...base(),ptWires:4,red:'pt4',black:'pt1'};const three=P.normalizeSettings({...four,ptWires:3});
    assert.equal(three.red,null);assert.equal(three.black,'pt1');assert.equal(P.normalizeSettings(four).red,'pt4');
  });
  test('Un guardado anterior de dos bornes se abre como Pt100 de 3 hilos (el borne 2 pasa al hilo blanco)',()=>{
    const old={...base()};delete old.ptWires;old.red='pt1';old.black='pt2';
    const back=S.parseBench(JSON.stringify({version:1,settings:old,records:[]}));
    assert.equal(back.settings.ptWires,3);assert.equal(back.settings.black,'pt3');assert.equal(back.settings.red,'pt1');
  });
  test('Ω sobre la termocupla o mV sobre el Pt100 no son lecturas válidas',()=>{
    assert.equal(meter({mode:'ohm',red:'tc+',black:'tc-',setpoint:50,inWell:{tc:true,pt:true}}).meaningful,false);
    assert.equal(meter({mode:'V',red:'tc+',black:'tc-',setpoint:50,inWell:{tc:true,pt:true}}).meaningful,false);
  });
  test('Puntas en sensores distintos dejan el circuito abierto',()=>{assert.equal(meter({mode:'mV',red:'tc+',black:'pt1'}).state,'open');});
  test('Transmisor: 0–100 °C → 0–10 V, exacto en 0, 50, 75 y 100 °C',()=>{
    for(const [t,v] of [[0,0],[50,5],[75,7.5],[100,10]]){
      const s={...base(),tcType:'K',txType:'K',txConnected:true,txPowered:true,setpoint:t,ambient:22,inWell:{tc:true,pt:true}};
      near(P.txVolts(s,P.settledTemps(s)),v,0.005,`${t} °C`);
    }
  });
  test('Transmisor con otro rango: 20–120 °C a 75 °C da 5,5 V',()=>{
    const s={...base(),txMin:20,txMax:120,txConnected:true,txPowered:true,setpoint:75,inWell:{tc:true,pt:false}};near(P.txVolts(s,P.settledTemps(s)),5.5,0.005);
  });
  test('Transmisor: sin alimentación, sin termocupla o con rango inválido da 0 V; satura en 10 V',()=>{
    const s={...base(),txConnected:true,txPowered:true,setpoint:100,inWell:{tc:true,pt:false}},t=P.settledTemps(s);
    assert.equal(P.txVolts({...s,txPowered:false},t),0);assert.equal(P.txVolts({...s,txConnected:false},t),0);assert.equal(P.txVolts({...s,txMin:50,txMax:50},t),0);
    near(P.txVolts({...s,txMin:0,txMax:60},t),10,1e-9);
  });
  test('Transmisor configurado con el tipo equivocado produce un error medible',()=>{
    const s={...base(),tcType:'K',txType:'J',txConnected:true,txPowered:true,setpoint:100,inWell:{tc:true,pt:false}};
    const wrong=P.txVolts(s,P.settledTemps(s));assert.ok(Math.abs(wrong-10)>0.3,`debería diferir de 10 V, dio ${wrong}`);
    const r=P.readMeter({...s,mode:'V',red:'tx+',black:'tx-'},P.settledTemps(s));assert.match(r.note,/incorrecta/);
  });
  test('Referencia: coincide con la tabla en la consigna',()=>{
    const s=base();near(P.reference(s,'pt',100),138.506,0.01);near(P.reference(s,'tc',100),P.tcEmf('K',100)-P.tcEmf('K',22),1e-9);near(P.reference(s,'tx',50),5,1e-9);
  });

  /* Registro y estado persistido */
  const rec=(o)=>({id:'r'+Math.random(),source:'simulada',sensor:'pt',tcType:null,temp:50,value:119.4,unit:'Ω',ambient:22,at:1,...o});
  test('Un punto repetido reemplaza al anterior (misma fuente, sensor, tipo y temperatura)',()=>{
    let list=S.addRecord([],rec({temp:50,value:119.0}));list=S.addRecord(list,rec({temp:50.2,value:119.4}));assert.equal(list.length,1);near(list[0].value,119.4,1e-9);
    list=S.addRecord(list,rec({source:'real',temp:50}));assert.equal(list.length,2);
  });
  test('El estado guardado se valida y un archivo incompatible se rechaza',()=>{
    const good=S.serializeBench(base(),[rec({})]);const back=S.parseBench(good);assert.equal(back.records.length,1);assert.equal(back.settings.tcType,'K');
    assert.throws(()=>S.parseBench('{"version":9}'));assert.throws(()=>S.parseBench('no es json'));
    assert.throws(()=>S.parseBench(JSON.stringify({version:1,settings:{...base(),ambient:99},records:[]})));
  });
  test('Formato decimal con coma y lectura de números',()=>{
    assert.equal(S.formatValue(3.0587,'mV'),'3,1 mV');assert.equal(S.formatValue(119.397,'Ω'),'119,4 Ω');assert.equal(S.formatValue(7.5,'V'),'7,50 V');
    assert.equal(S.parseNumber('4,5'),4.5);assert.equal(S.parseNumber(' 75 '),75);assert.equal(S.parseNumber('abc'),null);assert.equal(S.parseNumber(''),null);
  });

  /* Lecciones */
  const points=(sensor,amb=22,extra={})=>[amb,50,75,100].map(temp=>rec({sensor,temp,ambient:amb,tcType:sensor==='pt'?null:'K',...(sensor==='tx'?{txType:'K',txMin:0,txMax:100}:{}),...extra}));
  const lesson=id=>L.temperatureLessons.find(l=>l.id===id);
  test('Hay tres actividades conservadas de la guía G03',()=>{assert.deepEqual(L.temperatureLessons.map(l=>l.experience),[1,2,3]);});
  test('Experiencia 2: pasos que exigen sondas, lecturas válidas y los cuatro puntos',()=>{
    const l=lesson('temperatura-experiencia-2'),s=base(),ctx=(over={},records=[])=>({settings:{...s,...over},temps:P.settledTemps({...s,...over}),reading:P.readMeter({...s,...over},P.settledTemps({...s,...over})),records});
    assert.equal(l.steps[0].check(ctx()),false);assert.equal(l.steps[0].check(ctx({inWell:{tc:true,pt:true}})),true);
    assert.equal(l.steps[1].check(ctx({inWell:{tc:true,pt:true},mode:'mV',red:'tc+',black:'tc-'})),true);
    assert.equal(l.steps[1].check(ctx({inWell:{tc:true,pt:true},mode:'ohm',red:'tc+',black:'tc-'})),false);
    assert.equal(l.steps[2].check(ctx({},points('tc'))),true);assert.equal(l.steps[2].check(ctx({},points('tc').slice(0,3))),false);
    assert.equal(l.steps[2].check(ctx({},points('tc',22,{source:'real'}))),false);
    assert.equal(l.steps[3].check(ctx({inWell:{tc:true,pt:true},mode:'ohm',red:'pt1',black:'pt3'})),true);
    assert.equal(l.steps[4].check(ctx({},points('pt'))),true);
  });
  test('Experiencia 2: la sensibilidad pedida se calcula con los datos del estudiante',()=>{
    const l=lesson('temperatura-experiencia-2'),ask=l.steps[5].ask;const records=[22,50,75,100].map(temp=>rec({sensor:'pt',temp,value:P.ptOhms(temp)}));
    const expected=ask.expected({settings:base(),records});near(expected,(P.ptOhms(100)-P.ptOhms(22))/(100-22),1e-9);assert.ok(expected>0.38&&expected<0.39,`sensibilidad fuera de lo esperado: ${expected}`);
    assert.equal(ask.expected({settings:base(),records:[]}),null);
  });
  test('Experiencia 3: conexión, configuración, medición, registro y cálculo con el rango elegido',()=>{
    const l=lesson('temperatura-experiencia-3'),s={...base(),txConnected:true,txPowered:true,inWell:{tc:true,pt:false}},t=P.settledTemps(s);
    const ctx=(over={},records=[])=>{const st={...s,...over};return {settings:st,temps:t,reading:P.readMeter(st,t),records};};
    assert.equal(l.steps[0].check(ctx({txConnected:false})),false);assert.equal(l.steps[0].check(ctx()),true);
    assert.equal(l.steps[1].check(ctx({txType:'J'})),false);assert.equal(l.steps[1].check(ctx({txMin:0,txMax:20})),false);assert.equal(l.steps[1].check(ctx()),true);
    assert.equal(l.steps[2].check(ctx({mode:'V',red:'tx+',black:'tx-'})),true);assert.equal(l.steps[2].check(ctx({mode:'V',red:'tx+',black:'tx-',txPowered:false})),false);
    assert.equal(l.steps[3].check(ctx({},[...points('tc'),...points('tx',22,{unit:'V',value:5})])),true);assert.equal(l.steps[3].check(ctx({},points('tx',22,{unit:'V'}))),false);
    near(l.steps[4].ask.expected(ctx({txMin:20,txMax:120})),5.5,1e-9);
  });
  test('Cambiar tipo, ambiente o rango no reutiliza puntos de otra configuración',()=>{const s={...base(),txType:'K',txMin:0,txMax:100},ctx=(settings,records)=>({settings,records,temps:P.settledTemps(settings),reading:P.readMeter(settings,P.settledTemps(settings))});assert.equal(lesson('temperatura-experiencia-2').steps[2].check(ctx({...s,tcType:'J'},points('tc'))),false);assert.equal(lesson('temperatura-experiencia-3').steps[3].check(ctx({...s,txMax:120},[...points('tc'),...points('tx')])),false);assert.equal(lesson('temperatura-experiencia-3').steps[3].check(ctx(s,[...points('tc'),...points('tx').map(({txMin,txMax,txType,...r})=>r)])),false);assert.equal(S.matchesTempSeries(points('tc')[0],{...s,ambient:23}),false);});
  test('Experiencia 1: preguntas con una sola respuesta correcta y explicación',()=>{
    const l=lesson('temperatura-experiencia-1');assert.ok(l.steps.length>=4);
    for(const step of l.steps){assert.ok(step.quiz.options.length>=3);assert.ok(Number.isInteger(step.quiz.answer)&&step.quiz.answer<step.quiz.options.length);assert.ok(step.quiz.explanation.length>20);}
  });
  test('Cada lección conserva su material original',()=>{for(const l of L.temperatureLessons){assert.match(l.source,/guia-temperatura-g03\.docx$/);assert.ok(l.materialId.startsWith('instrumentacion-g03-'));}});

  /* Repaso */
  test('El banco de repaso tiene al menos dos preguntas bien formadas por concepto',()=>{
    for(const c of R.CONCEPTS){const bank=R.QUESTIONS.filter(q=>q.concept===c.id);assert.ok(bank.length>=2,`${c.id}: ${bank.length}`);
      for(const q of bank){assert.ok(q.options.length>=3&&Number.isInteger(q.answer)&&q.answer<q.options.length&&q.explanation.length>20,q.question);}}
    assert.ok(R.QUESTIONS.every(q=>R.CONCEPTS.some(c=>c.id===q.concept)));
  });
  test('Cada paso y pregunta de las lecciones apunta a un concepto del repaso',()=>{
    const ids=new Set(R.CONCEPTS.map(c=>c.id));
    for(const l of L.temperatureLessons){for(const step of l.steps){const concept=step.concept||(step.quiz&&step.quiz.concept);if(concept!==undefined||step.quiz)assert.ok(ids.has(concept),`${l.id} · ${step.title}`);}
      if(l.review)assert.ok(ids.has(l.review.concept),`${l.id} repaso`);}
  });
  test('Errores: un concepto con errores queda pendiente y se vuelve repasado tras dos aciertos seguidos',()=>{
    let log=R.newReviewLog();assert.equal(R.statusOf(log,'funcion-medida'),'sin-errores');
    log=R.recordWrong(log,'funcion-medida',10);assert.equal(R.statusOf(log,'funcion-medida'),'pendiente');
    log=R.recordRight(log,'funcion-medida',11);assert.equal(R.statusOf(log,'funcion-medida'),'pendiente');
    log=R.recordRight(log,'funcion-medida',12);assert.equal(R.statusOf(log,'funcion-medida'),'dominado');
    log=R.recordWrong(log,'funcion-medida',13);assert.equal(R.statusOf(log,'funcion-medida'),'pendiente');assert.equal(log.concepts['funcion-medida'].wrong,2);
  });
  test('El repaso empieza por los conceptos con más errores, sin repetir preguntas',()=>{
    let log=R.newReviewLog();log=R.recordWrong(log,'hilos-pt100',1);log=R.recordWrong(log,'transmisor-tipo',2);log=R.recordWrong(log,'transmisor-tipo',3);
    assert.deepEqual(R.pendingConcepts(log),['transmisor-tipo','hilos-pt100']);
    const picked=R.pickQuestions(log,6);assert.equal(picked.length,6);assert.equal(picked[0].concept,'transmisor-tipo');assert.equal(picked[1].concept,'hilos-pt100');
    assert.equal(new Set(picked).size,6);
    const general=R.pickQuestions(R.newReviewLog(),20);assert.equal(general.length,20);assert.equal(new Set(general).size,20);
    assert.ok(R.pickQuestions(log,100,true).length<=R.QUESTIONS.length);
  });
  test('La pregunta elegida rota con los intentos del concepto',()=>{
    let log=R.recordWrong(R.newReviewLog(),'seebeck',1);const first=R.pickQuestions(log,1)[0];
    log=R.recordRight(log,'seebeck',2);const second=R.pickQuestions(log,1)[0];
    assert.equal(first.concept,'seebeck');assert.notEqual(first.question,second.question);
  });
  test('El historial de repaso se valida y un archivo incompatible se rechaza',()=>{
    const log=R.recordWrong(R.newReviewLog(),'estabilidad',5);assert.equal(R.parseReview(JSON.stringify(log)).concepts.estabilidad.wrong,1);
    const real=R.recordWrong(R.newReviewLog(),'estabilidad',Date.now());assert.equal(R.parseReview(JSON.stringify(real)).concepts.estabilidad.wrong,1);/* marcas de tiempo reales (≈1,8·10¹²) */
    assert.throws(()=>R.parseReview('{"version":2}'));assert.throws(()=>R.parseReview(JSON.stringify({version:1,concepts:{inventado:{wrong:1,right:0,streak:0,last:1}}})));
    assert.throws(()=>R.parseReview(JSON.stringify({version:1,concepts:{estabilidad:{wrong:-1,right:0,streak:0,last:1}}})));
  });
  test('Montajes sin sentido físico se asocian al concepto correcto',()=>{
    const mk=(patch,temps)=>{const s={...base(),...patch};return R.misuseConcept(s,P.readMeter(s,temps||P.settledTemps(s)));};
    assert.equal(mk({mode:'ohm',red:'tc+',black:'tc-',inWell:{tc:true,pt:true}}),'funcion-medida');
    assert.equal(mk({mode:'mV',red:'pt1',black:'pt3',inWell:{tc:true,pt:true}}),'funcion-medida');
    assert.equal(mk({mode:'ohm',red:'pt1',black:'pt2',inWell:{tc:true,pt:true}}),'hilos-pt100');
    assert.equal(mk({mode:'mV',red:'tc+',black:'pt1'}),'conexion-puntas');
    assert.equal(mk({mode:'V',red:'tx+',black:'tx-',txConnected:true,txPowered:false}),'transmisor-conexion');
    assert.equal(mk({mode:'V',red:'tx+',black:'tx-',txConnected:true,txPowered:true,txType:'J',setpoint:50,inWell:{tc:true,pt:false}}),'transmisor-tipo');
    assert.equal(mk({mode:'mV',red:'tc+',black:'tc-',inWell:{tc:true,pt:true}}),null);
    assert.equal(mk({mode:'ohm',red:'pt1',black:'pt3',inWell:{tc:true,pt:true}}),null);
    assert.equal(mk({mode:'off',red:'tc+',black:'tc-'}),null);
  });
}finally{await fs.rm(directory,{recursive:true,force:true});}
const failed=tests.filter(t=>t.status==='FAIL');
for(const t of tests)console.log(`${t.status==='PASS'?'✓':'✗'} ${t.name}${t.error?`\n    ${t.error}`:''}`);
console.log(`\n${tests.length-failed.length}/${tests.length} pruebas del banco de temperatura`);
if(failed.length)process.exit(1);
