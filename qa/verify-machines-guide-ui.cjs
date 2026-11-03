const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='qa/machines-guide-complete',base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327').replace(/\/$/,''),report={date:'2026-10-27',base,checks:[],errors:[]};
let p,b;
(async()=>{
 const m=await import('./machines-guide-complete/model.mjs');
 b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
 await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>{report.errors.push(e.stack||e.message);console.log('PAGEERROR',e.stack||e.message);});
 await p.goto(base+'/?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash'));
 await p.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await p.locator('.guide-measure-feature').click();
 const lesson=p.locator('.panel-meter-lesson-window');
 async function prepareExamples(page,guide){await guide.getByRole('button',{name:'Referencia',exact:true}).click();await guide.locator('.machine-prep-entry').click();const prep=page.locator('.machine-preparation');await prep.getByLabel('Tensión de cada bobina en estrella (V)',{exact:true}).fill('219,4');await prep.getByLabel('Tensión de cada bobina en triángulo (V)',{exact:true}).fill('380');await prep.getByLabel('Compatibilidad del motor A',{exact:true}).selectOption('yes');await prep.getByLabel('Compatibilidad del motor B',{exact:true}).selectOption('star');await prep.getByRole('button',{name:'Comprobar placa',exact:true}).click();await prep.getByRole('button',{name:'2 · Protección',exact:true}).click();await prep.getByLabel('Ajuste Ir calculado (A)',{exact:true}).fill('5,77');await prep.getByLabel('Rango del relé de ejemplo',{exact:true}).selectOption('4-6');await prep.getByLabel('Dispositivo de sobrecarga',{exact:true}).selectOption('thermal');await prep.getByRole('button',{name:'Comprobar protección',exact:true}).click();assert.match(await prep.innerText(),/Ajuste comprobado/);await page.screenshot({path:out+'/preparacion-'+page.viewportSize().width+'.png'});await prep.getByRole('button',{name:'Cerrar ventana',exact:true}).click();await guide.getByRole('button',{name:'Lección',exact:true}).click();}
 await prepareExamples(p,lesson);await lesson.getByRole('button',{name:/^Comenzar mediciones/}).click();
     assert.equal(await p.locator('.interactive-wire').count(),40,'Comenzar monta el panel completo: 37 cables recibidos + 3 del piloto rojo');
     const named=(color)=>p.getByRole('button',{name:new RegExp('^(Punta|Cable banana) '+color+': arrastra hasta un borne$')});const handles=[named('roj[ao]'),named('negr[ao]')];
 async function probe(which,id){await handles[which].focus();for(let j=0;j<160;j++){if(await handles[which].getAttribute('data-probe-connected')===id)return;await p.keyboard.press('ArrowRight');}throw Error('Punta no alcanza '+id);}
 async function controls(){await p.waitForTimeout(100);const toggle=lesson.getByRole('button',{name:'Controles',exact:true});if(await toggle.count())await toggle.click();}
 async function change(prefix){await controls();await lesson.locator('.meter-lesson-controls').getByRole('button',{name:new RegExp('^'+prefix)}).click();}
 async function pulse(id){await controls();const bt=lesson.getByRole('button',{name:new RegExp('^'+id+' ·')});await bt.focus();await p.keyboard.down('Space');await p.waitForTimeout(100);await p.keyboard.up('Space');}
 const parse=t=>t.trim()==='OL'?'OL':t.match(/-?\d+(?:[.,]\d+)?/)?.[0];
 for(const [index,base] of m.ACTIVITY_STEPS.entries()){const s=m.activityStep('twoContactors',index);/* los bornes pedidos dependen del montaje: p. ej. R → KT1:L1 */
  await p.waitForFunction(id=>document.querySelector('.panel-meter-lesson')?.dataset.activityStep===id,s.id);
  if(s.id==='control-volts'){await change('Conectar corriente');await change('CONTROL 1');await change('CONTROL 2');}
      if(s.id==='force-continuity'){await change('CONTROL 1');await change('CONTROL 2');await change('Desenchufar');assert.equal(await p.locator('.interactive-wire').count(),40,'la fuerza ya está montada desde el inicio');await lesson.locator('.machine-prep-entry').click();const prep=p.locator('.machine-preparation');await prep.getByRole('button',{name:'3 · Mi esquema',exact:true}).click();await prep.getByRole('button',{name:'Generar desde mi cableado actual',exact:true}).click();await prep.getByLabel('Explicación de mi esquema',{exact:true}).fill('KT1 retiene la marcha con 13–14; KM2 forma estrella y KM1 triángulo. Los NC 71–72 cruzados impiden su actuación simultánea y 95–96 interrumpe el mando.');await prep.getByRole('button',{name:'Comprobar mi esquema',exact:true}).click();await p.waitForFunction(()=>/montaje de dos contactores están guardadas/.test(document.querySelector('.machine-preparation')?.innerText||''));assert.match(await prep.innerText(),/40 conductores guardados/);await p.screenshot({path:out+'/esquema-escritorio.png'});await prep.getByRole('button',{name:'Cerrar ventana',exact:true}).click();await lesson.getByRole('button',{name:'Lección',exact:true}).click();}
  if(s.id==='line-RS'){await change('Conectar corriente');await change('FUERZA');}
  if(s.id==='powered-rest'){await change('CONTROL 1');await change('CONTROL 2');}
      /* S3 no interviene en el panel de dos contactores: el reposo se comprueba con S1 sin pulsar. */
      if(['control-rest','powered-rest'].includes(s.id)){await p.waitForTimeout(180);assert.equal(await p.locator('[data-sim-relay="CONTACTOR_TERMICO"]').getAttribute('data-active'),'false');assert.equal(await p.locator('[data-sim-relay="CONTACTOR_TRIFASICO"]').getAttribute('data-active'),'false');assert.equal(await p.locator('[data-motor-status]').getAttribute('data-motor-status'),'off');report.checks.push(s.id+': en reposo ningún contactor actúa y el motor está detenido');}
  if(['control-star','start-star'].includes(s.id))await pulse('S1');
      /* El cambio a triángulo lo hace el temporizador: se acorta su retardo para el estudio y se espera a que lo cumpla. */
      if(['control-delta','change-delta'].includes(s.id)){await controls();const delay=lesson.getByLabel(/^Retardo/);if(await delay.count()&&await delay.first().isVisible())await delay.first().selectOption({index:0});}
      if(['control-delta','change-delta'].includes(s.id))await p.waitForFunction(()=>document.querySelector('[data-sim-relay="CONTACTOR_TERMICO"]')?.dataset.active==='true',null,{timeout:30000});
  if(s.id==='control-trip'){
   await pulse('S2');await change('TEST');await p.waitForTimeout(180);
   await lesson.getByRole('button',{name:'Comprobar y seguir',exact:true}).click();
   assert.equal(await lesson.locator('[data-activity-step]').getAttribute('data-activity-step'),s.id,'TEST desde reposo no comprueba el disparo desde triángulo');
   assert.match(await lesson.locator('.meter-lesson-state').innerText(),/triángulo/);
       await change('RESET');await pulse('S1');await p.waitForFunction(()=>document.querySelector('[data-sim-relay="CONTACTOR_TERMICO"]')?.dataset.active==='true',null,{timeout:30000});
   report.checks.push('TEST desde reposo rechazado aunque pilotos y térmico coincidan; se exige la transición desde triángulo');
  }
  if(['control-trip','overload'].includes(s.id))await change('TEST');
  if(['control-reset','reset'].includes(s.id))await change('RESET');
  if(s.id==='shutdown'){await change('FUERZA');await change('CONTROL 1');await change('CONTROL 2');await change('Desenchufar');}
  if(s.kind==='meter'){
   await lesson.locator('.measure-mode-options').getByRole('button',{name:s.mode==='C'?'Continuidad':s.mode==='R'?'Ω':'V~',exact:true}).click();
   await lesson.getByRole('button',{name:'Dónde poner las puntas',exact:true}).click();await probe(0,s.red);await probe(1,s.black);
   await lesson.locator('.meter-lesson-state.is-ready').waitFor({state:'attached'});
  }
  if(s.kind==='clamp'){
   await lesson.getByRole('button',{name:'Pinza en '+s.phase,exact:true}).click();await lesson.locator('.meter-lesson-state.is-ready').waitFor({state:'attached'});
   
  }
  if(s.kind==='compare')await lesson.getByLabel('Comparación estrella y triángulo',{exact:true}).fill('Las bobinas reciben VL dividido por raíz de tres en estrella y VL en triángulo. La relación de corrientes depende de la velocidad y carga registradas; ambas conexiones se comparan con sus condiciones.');
  if(s.kind==='compare'){const rows=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-meter-two-contactors-v1')).records),v=id=>rows.find(r=>r.id===id).value;await lesson.getByLabel('Relación de tensiones triángulo estrella',{exact:true}).fill((v('delta-U')/v('star-U')).toFixed(3));await lesson.getByLabel('Relación de corrientes triángulo estrella',{exact:true}).fill((v('delta-current-R')/v('star-current-R')).toFixed(3));}
      if(s.id==='thermal'){
       /* Sin captura no se puede registrar la medición. */
       const rec=lesson.getByRole('button',{name:'Registrar y seguir',exact:true});if(await rec.count())assert.equal(await rec.isDisabled(),true,'sin captura no se registra');
       assert.match(await lesson.locator('.meter-lesson-state').innerText(),/capturar/);
      }
  if(s.kind==='meter'||s.kind==='clamp'){for(let tries=0;tries<30;tries++){await lesson.getByRole('button',{name:'Tomar lectura actual',exact:true}).click();if(await lesson.locator('.measure-sample').getAttribute('data-reading-sampled')==='true')break;await p.waitForTimeout(200);}assert.equal(await lesson.locator('.measure-sample').getAttribute('data-reading-sampled'),'true');}
      if(s.id==='thermal'){
       /* La lectura ya no se transcribe: queda capturada del instrumento y se muestra tal cual. */
       assert.match(await lesson.getByLabel('Lectura capturada',{exact:true}).textContent(),/\d/);
       report.checks.push('La lectura se captura del instrumento; no hay transcripción manual que pueda diferir de la pantalla');
      }
  if(s.id==='dismantle')await lesson.getByRole('button',{name:'Desmontar circuito',exact:true}).click();
  await lesson.locator('.meter-lesson-state.is-ready').waitFor({state:'attached'});
  await lesson.getByRole('button',{name:s.kind==='meter'||s.kind==='clamp'?'Registrar y seguir':s.id==='dismantle'?'Terminar práctica':'Comprobar y seguir',exact:true}).click();
  console.log((index+1)+'/'+m.ACTIVITY_STEPS.length+' '+s.id);
 }
 const progress=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-meter-two-contactors-v1')));assert.equal(progress.complete,true);assert.equal(progress.records.length,34);
 assert.equal(progress.records.filter(r=>r.action).length,8);assert.equal(progress.records.filter(r=>r.conditions).length,21);
 for(const r of progress.records.filter(r=>r.conditions)){assert.ok(r.capturedAt);assert.ok(Number.isFinite(r.conditions.simulationSeconds));assert.ok(r.displayUnit);}
 await lesson.getByRole('button',{name:'Revisar mis resultados',exact:true}).click();
 for(const [label,key] of [['Descargar tablas','csv'],['Guardar informe','json'],['Descargar informe para imprimir','html']]){const pending=p.waitForEvent('download');await lesson.getByRole('button',{name:label,exact:true}).click();await (await pending).saveAs(out+'/maquinas-resultados.'+key);}
 assert.equal(JSON.parse(fs.readFileSync(out+'/maquinas-resultados.json','utf8')).measurements.length,34);
 await p.screenshot({path:out+'/maquinas-resultados.png'});
 report.checks.push('Placas y protecciones comprobadas; 40 cables desde el inicio (mando y fuerza); esquema copiado del cableado y explicado; 34 pasos, 15 mediciones, TEST/RESET, comparación, cierre y exportaciones CSV/JSON/HTML');
 await c.close();
 const mobile=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});await mobile.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 p=await mobile.newPage();await p.goto(base+'/?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash'));
 await p.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await p.locator('.guide-measure-feature').click();await prepareExamples(p,p.locator('.panel-meter-lesson-window'));await p.getByRole('button',{name:/^Comenzar mediciones/}).click();await p.locator('[data-activity-step="thermal"]').waitFor();
 await p.screenshot({path:out+'/maquinas-movil.png'});report.checks.push('Acceso a Actividad 2 desde las guías del panel en móvil 390 × 844');
 assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/recorrido-resultados.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();
})().catch(async e=>{if(p&&!p.isClosed())await p.screenshot({path:out+'/recorrido-fallo.png'}).catch(()=>{});fs.writeFileSync(out+'/recorrido-resultados.json',JSON.stringify({...report,failure:e.stack},null,2));console.error(e);if(b)await b.close();process.exit(1);});
