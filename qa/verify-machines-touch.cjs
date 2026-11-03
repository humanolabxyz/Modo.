// Táctil: preparación de la actividad (placa, protección, mi esquema), pinza sobre un conductor real y un caso de diagnóstico, en tablet y teléfono.
const fs=require('node:fs'),assert=require('node:assert/strict');const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327').replace(/\/$/,''),out='qa/machines-guide-complete',report={base,checks:[],errors:[]};let browser,page;
/* Las ventanas táctiles se reacomodan mientras el modelo corre y Playwright nunca las ve «estables»: el toque se entrega como evento de clic. */
const tap=loc=>loc.dispatchEvent('click');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 for(const [engine,width,height] of [[chromium,820,1180],[webkit,390,844]]){
  browser=await engine.launch();const c=await browser.newContext({viewport:{width,height},isMobile:engine===chromium,hasTouch:true,serviceWorkers:'block',acceptDownloads:true,reducedMotion:'reduce'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));page=await c.newPage();const p=page;p.setDefaultTimeout(12000);p.on('pageerror',e=>report.errors.push(e.message));p.on('dialog',d=>d.accept());
  await p.goto(base+'/?view=simulator&activity=maquinas-u2');const lesson=p.locator('.panel-meter-lesson-window');
  // ── Preparación: placa, protección y conexiones ──
  await tap(lesson.getByRole('button',{name:'Referencia',exact:true}));await tap(lesson.locator('.machine-prep-entry'));const prep=p.locator('.machine-preparation');await prep.waitFor();
  assert.equal(await p.locator('.interactive-wire').count(),0,'La preparación no monta cables');
  await prep.getByLabel('Tensión de cada bobina en estrella (V)',{exact:true}).fill('380');await prep.getByLabel('Tensión de cada bobina en triángulo (V)',{exact:true}).fill('380');await prep.getByLabel('Compatibilidad del motor A',{exact:true}).selectOption('yes');await prep.getByLabel('Compatibilidad del motor B',{exact:true}).selectOption('both');
  await tap(prep.getByRole('button',{name:'Comprobar placa',exact:true}));assert.match(await prep.innerText(),/Revisa VL/);
  await prep.getByLabel('Tensión de cada bobina en estrella (V)',{exact:true}).fill('219.4');await prep.getByLabel('Compatibilidad del motor B',{exact:true}).selectOption('star');
  await tap(prep.getByRole('button',{name:'2 · Protección',exact:true}));await prep.getByLabel('Ajuste Ir calculado (A)',{exact:true}).fill('10');await prep.getByLabel('Rango del relé de ejemplo',{exact:true}).selectOption('4-6');await prep.getByLabel('Dispositivo de sobrecarga',{exact:true}).selectOption('thermal');
  await tap(prep.getByRole('button',{name:'Comprobar protección',exact:true}));assert.match(await prep.innerText(),/Revisa la ubicación/);
  await prep.getByLabel('Ajuste Ir calculado (A)',{exact:true}).fill('5.77');await tap(prep.getByRole('button',{name:'Usar el ejemplo en el banco desconectado',exact:true}));
  assert.ok(Math.abs(await p.evaluate(()=>JSON.parse(localStorage.getItem('modo:panel:calibration:v1')).thermal.amps)-10/Math.sqrt(3))<.001);
  // «Mi esquema» del panel de dos contactores: copia el cableado del banco (sin cables no hay nada que copiar) y pide explicar retención y cambio.
  await tap(prep.getByRole('button',{name:'3 · Mi esquema',exact:true}));assert.match(await prep.innerText(),/Conexiones del panel de dos contactores/);
  assert.equal(await prep.getByRole('button',{name:'Generar desde mi cableado actual',exact:true}).isDisabled(),true,'sin cables no se genera el esquema');
  await prep.getByLabel('Explicación de mi esquema',{exact:true}).fill('KT1 se retiene con 13–14 en paralelo con S1; KM1 y KM2 se enclavan con sus NC 71–72 y KT1 cambia de estrella a triángulo.');
  await tap(prep.getByRole('button',{name:'Comprobar mi esquema',exact:true}));await p.waitForTimeout(200);
  const draft=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo:machines:preparation:v1:two-contactors')));assert.match(draft.diagram.explanation,/KT1 se retiene/);assert.equal(draft.diagram.wires.length,0);
  assert.match(await prep.innerText(),/0 conductores guardados/);await p.screenshot({path:out+'/preparacion-esquema-'+engine.name()+'.png'});
  await tap(prep.getByRole('button',{name:'Cerrar ventana',exact:true}));
  // Comenzar monta el panel completo: los 40 cables (37 recibidos + 3 del piloto rojo).
  await tap(lesson.getByRole('button',{name:'Lección',exact:true}));await tap(lesson.getByRole('button',{name:/^Comenzar mediciones/}));await p.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===40);
  report.checks.push(engine.name()+' '+width+'px: errores de placa y ajuste rechazados, ejemplo aplicado, explicación del esquema guardada y 40 cables al comenzar');
  // ── Pinza: mordaza sobre un conductor real ──
  await p.evaluate(()=>localStorage.setItem('modo-meter-two-contactors-v1',JSON.stringify({version:1,profile:'twoContactors',index:19,records:[{id:'thermal',observed:'0,4',text:'0,4 Ω',value:.42,at:new Date().toISOString()}],reflection:'',complete:false})));await p.reload();
  await tap(lesson.getByRole('button',{name:/^Continuar · paso/}));
  const controls=async()=>{const b=lesson.getByRole('button',{name:'Controles',exact:true});if(await b.count())await tap(b);};
  for(const name of ['Conectar corriente','CONTROL 1','CONTROL 2','FUERZA']){await controls();await tap(lesson.locator('.meter-lesson-controls').getByRole('button',{name:new RegExp('^'+name)}));}
  const start=lesson.getByRole('button',{name:'S1 · Partir',exact:true});await start.focus();await p.keyboard.down('Space');await p.waitForTimeout(100);await p.keyboard.up('Space');
  await tap(lesson.getByRole('button',{name:'Pinza en R',exact:true}));await lesson.locator('.meter-lesson-state.is-ready').waitFor();
  const instrument=p.getByRole('group',{name:'Pinza amperimétrica del panel',exact:true});await instrument.getByRole('button',{name:'Abrir o cerrar mordaza',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForTimeout(150);
  assert.equal(await lesson.getByRole('button',{name:'Tomar lectura actual',exact:true}).isDisabled(),true);
  await tap(lesson.getByRole('button',{name:'Pinza en S',exact:true}));assert.equal(await lesson.getByRole('button',{name:'Tomar lectura actual',exact:true}).isDisabled(),true);
  await tap(lesson.getByRole('button',{name:'Pinza en R',exact:true}));await lesson.locator('.meter-lesson-state.is-ready').waitFor();await p.screenshot({path:out+'/pinza-fisica-'+engine.name()+'.png'});
  report.checks.push(engine.name()+': pinza dentro de la pizarra, conductor real seleccionado; registro bloqueado al quedar sin conductor o elegir fase equivocada');
  // ── Diagnóstico: TEST que no corta el mando ──
  await tap(lesson.getByRole('button',{name:'Fallas',exact:true}));
  await tap(lesson.locator('summary',{hasText:'Cableado y cables'}));await tap(lesson.getByRole('button',{name:'TEST no corta el mando',exact:true}));
  await tap(lesson.locator('summary',{hasText:'Controles del banco'}));
  for(const name of ['Conectar corriente','CONTROL 1 · OFF','CONTROL 2 · OFF','FUERZA · OFF'])await tap(lesson.getByRole('button',{name,exact:true}));
  const sb=lesson.getByRole('button',{name:'S1 · Partir',exact:true});await sb.focus();await p.keyboard.down('Space');await p.waitForTimeout(100);await p.keyboard.up('Space');
  await p.waitForFunction(()=>document.querySelector('[data-motor-status]')?.dataset.motorStatus==='running');
  await tap(lesson.getByRole('button',{name:'TEST · probar relé',exact:true}));await p.waitForTimeout(200);
  assert.equal(await p.locator('[data-motor-status]').getAttribute('data-motor-status'),'running');assert.match(await lesson.innerText(),/sigue (energizado|alimentado)/);
  await p.screenshot({path:out+'/diagnostico-termico-'+engine.name()+'.png'});
  report.checks.push(engine.name()+': diagnóstico con mando del térmico anulado mantiene el motor alimentado y señala el error');await c.close();await browser.close();browser=null;
 }
 assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/touch-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(async e=>{if(page&&!page.isClosed())await page.screenshot({path:out+'/touch-failure.png'}).catch(()=>{});fs.writeFileSync(out+'/touch-results.json',JSON.stringify({...report,failure:e.stack},null,2));console.error(e);await browser?.close();process.exit(1);});
