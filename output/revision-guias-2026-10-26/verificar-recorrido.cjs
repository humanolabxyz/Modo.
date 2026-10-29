const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=__dirname,base='http://127.0.0.1:4327',report={date:'2026-10-26',checks:[],errors:[]};
let p,b;
(async()=>{
 const m=await import('../../qa/multimeter-activity/model.mjs');
 b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
 await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>{report.errors.push(e.stack||e.message);console.log('PAGEERROR',e.stack||e.message);});
 for(const course of ['s2-2','s2-3']){
  await p.goto(base+'/estudio?curso='+course);await p.getByRole('button',{name:'Expandir todo',exact:true}).click();
  const text=await p.locator('body').innerText();fs.writeFileSync(out+'/catalogo-'+course+'.txt',text);
  if(course==='s2-3')for(const i of [1,2,3])assert.match(text,new RegExp('Experiencia '+i));
  if(course==='s2-2'){assert.match(text,/Actividad 1 U2/);assert.match(text,/Actividad 2 U2/);}
  await p.screenshot({path:out+'/catalogo-'+course+'.png',fullPage:true});
 }
 report.checks.push('Catálogos: tres experiencias de temperatura; Actividad 2 UA2 integrada en Estudio');
 for(const exp of [2,3]){
  await p.goto(base+'/laboratorio?tool=temperature&leccion=temperatura-experiencia-'+exp);await p.waitForSelector('[data-temperature-ready="true"]');
  assert.equal(await p.locator('.temperature-notebook-window').count(),1);assert.match(await p.locator('body').innerText(),exp===2?/TC K.*mV[\s\S]*Pt100.*Ω/:/TC K.*mV[\s\S]*Transm.*V/);
  await p.screenshot({path:out+'/temperatura-exp'+exp+'.png'});
 }
 report.checks.push('Experiencias 2 y 3 abren banco y libreta con sus columnas correspondientes');
 await p.goto(base+'/?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash'));
 await p.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await p.locator('.guide-measure-feature').click();
 const lesson=p.locator('.panel-meter-lesson-window');await lesson.getByRole('button',{name:'Comenzar guía del profesor',exact:true}).click();
 assert.equal(await p.locator('.interactive-wire').count(),46);
 const handles=[p.getByRole('button',{name:'Punta roja: arrastra hasta un borne',exact:true}),p.getByRole('button',{name:'Punta negra: arrastra hasta un borne',exact:true})];
 async function probe(which,id){await handles[which].focus();for(let j=0;j<160;j++){if(await handles[which].getAttribute('data-probe-connected')===id)return;await p.keyboard.press('ArrowRight');}throw Error('Punta no alcanza '+id);}
 async function controls(){const toggle=lesson.getByRole('button',{name:'Controles',exact:true});if(await toggle.count())await toggle.click();}
 async function change(prefix){await controls();await lesson.locator('.meter-lesson-controls').getByRole('button',{name:new RegExp('^'+prefix)}).click();}
 async function pulse(id){await controls();const bt=lesson.getByRole('button',{name:new RegExp('^'+id+' ·')});await bt.focus();await p.keyboard.down('Space');await p.waitForTimeout(100);await p.keyboard.up('Space');}
 const parse=t=>t.trim()==='OL'?'OL':t.match(/-?\d+(?:[.,]\d+)?/)?.[0];
 for(const [index,s] of m.ACTIVITY_STEPS.entries()){
  await p.waitForFunction(id=>document.querySelector('.panel-meter-lesson')?.dataset.activityStep===id,s.id);
  if(s.id==='control-volts'){await change('Conectar corriente');await change('CONTROL 1');await change('CONTROL 2');}
  if(s.id==='force-continuity'){await change('CONTROL 1');await change('CONTROL 2');await change('Desenchufar');}
  if(s.id==='line-RS'){await change('Conectar corriente');await change('FUERZA');}
  if(s.id==='powered-rest'){await change('CONTROL 1');await change('CONTROL 2');}
  if(['control-star','start-star'].includes(s.id))await pulse('S1');
  if(['control-delta','change-delta'].includes(s.id))await pulse('S3');
  if(['control-trip','overload'].includes(s.id))await change('TEST');
  if(['control-reset','reset'].includes(s.id))await change('RESET');
  if(s.id==='shutdown'){await change('FUERZA');await change('CONTROL 1');await change('CONTROL 2');await change('Desenchufar');}
  if(s.kind==='meter'){
   await lesson.locator('.measure-mode-options').getByRole('button',{name:s.mode==='C'?'Continuidad':s.mode==='R'?'Ω':'V~',exact:true}).click();
   await lesson.getByRole('button',{name:'Dónde poner las puntas',exact:true}).click();await probe(0,s.red);await probe(1,s.black);
   await lesson.locator('.meter-lesson-state.is-ready').waitFor();
  }
  if(s.kind==='clamp'){
   await lesson.getByRole('button',{name:'Pinza en '+s.phase,exact:true}).click();await lesson.locator('.meter-lesson-state.is-ready').waitFor();
   
  }
  if(s.kind==='compare')await lesson.getByLabel('Comparación estrella y triángulo',{exact:true}).fill('Las bobinas reciben VL dividido por raíz de tres en estrella y VL en triángulo. La corriente de línea de este equivalente resistivo se triplica.');
  if(s.kind==='compare'){const rows=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-meter-activity2-v1')).records),v=id=>rows.find(r=>r.id===id).value;await lesson.getByLabel('Relación de tensiones triángulo estrella',{exact:true}).fill((v('delta-U')/v('star-U')).toFixed(3));await lesson.getByLabel('Relación de corrientes triángulo estrella',{exact:true}).fill((v('delta-current-R')/v('star-current-R')).toFixed(3));}
  if(s.kind==='meter'||s.kind==='clamp'){for(let tries=0;tries<30;tries++){await lesson.getByRole('button',{name:'Tomar lectura actual',exact:true}).click();if(await lesson.locator('.measure-sample').getAttribute('data-reading-sampled')==='true')break;await p.waitForTimeout(200);}assert.equal(await lesson.locator('.measure-sample').getAttribute('data-reading-sampled'),'true');}
  if(s.id==='dismantle')await lesson.getByRole('button',{name:'Desmontar circuito',exact:true}).click();
  await lesson.locator('.meter-lesson-state.is-ready').waitFor();
  await lesson.getByRole('button',{name:s.kind==='meter'||s.kind==='clamp'?'Registrar y seguir':s.id==='dismantle'?'Terminar práctica':'Comprobar y seguir',exact:true}).click();
  console.log((index+1)+'/'+m.ACTIVITY_STEPS.length+' '+s.id);
 }
 const progress=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-meter-activity2-v1')));assert.equal(progress.complete,true);assert.equal(progress.records.length,34);
 await lesson.getByRole('button',{name:'Revisar mis resultados',exact:true}).click();
 for(const [label,key] of [['Descargar tablas','csv'],['Guardar informe','json']]){const pending=p.waitForEvent('download');await lesson.getByRole('button',{name:label,exact:true}).click();await (await pending).saveAs(out+'/maquinas-resultados.'+key);}
 assert.equal(JSON.parse(fs.readFileSync(out+'/maquinas-resultados.json','utf8')).measurements.length,34);
 await p.screenshot({path:out+'/maquinas-resultados.png'});
 report.checks.push('Recorrido manual completo en navegador: 34 pasos, 15 mediciones en tablas, TEST/RESET, cierre, CSV y JSON');
 await c.close();
 const mobile=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});await mobile.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 p=await mobile.newPage();await p.goto(base+'/?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash'));
 await p.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await p.locator('.guide-measure-feature').click();await p.getByRole('button',{name:'Comenzar guía del profesor',exact:true}).click();await p.locator('[data-activity-step="thermal"]').waitFor();
 await p.screenshot({path:out+'/maquinas-movil.png'});report.checks.push('Acceso a Actividad 2 desde las guías del panel en móvil 390 × 844');
 assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/recorrido-resultados.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();
})().catch(async e=>{if(p&&!p.isClosed())await p.screenshot({path:out+'/recorrido-fallo.png'}).catch(()=>{});fs.writeFileSync(out+'/recorrido-resultados.json',JSON.stringify({...report,failure:e.stack},null,2));console.error(e);if(b)await b.close();process.exit(1);});
