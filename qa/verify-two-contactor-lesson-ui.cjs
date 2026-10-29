const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=JSON.parse(fs.readFileSync('src/data/twoContactorSource.json','utf8')),original=JSON.parse(fs.readFileSync('referencias/lecciones-estrella-triangulo/modo-panel-dos-contactores-original.json','utf8'));
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327').replace(/\/$/,''),out=process.env.PANELLAB_QA_OUTPUT||'qa/two-contactor-lesson',report={base,checks:[],errors:[]};fs.mkdirSync(out,{recursive:true});let browser,page;
const data=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')));
const settled=p=>p.waitForFunction(()=>!document.documentElement.matches('.modo-splash-on,.modo-opening-on'));
const choose=async(p,name)=>{await p.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await p.getByRole('button',{name,exact:true}).click();};
(async()=>{for(const [engine,width,height] of [[chromium,1440,1000],[webkit,820,1180],[chromium,390,844]]){
 browser=await engine.launch();const c=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block'});
 await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));page=await c.newPage();page.on('dialog',d=>d.accept());page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/?view=simulator');await page.locator('.board-svg').waitFor();await settled(page);
 await choose(page,'Aprender: Estrella-triángulo · 2 contactores');await page.locator('.guide-window').waitFor();
 let doc=await data(page);assert.equal(doc.wires.length,0);assert.equal(doc.steps.length,37);assert.equal(doc.diagram.id,'leccion-estrellaDosContactores');assert.equal(await page.locator('[data-module-id="CONTACTOR_TRIFASICO_3"]').count(),0);
 assert.ok(Number(await page.locator('[data-guide-schematic]').getAttribute('data-active-wires'))>0);await page.getByRole('img',{name:'Diagrama original de estrella-triángulo',exact:true}).waitFor();
 await page.getByRole('button',{name:'Comprender este paso',exact:false}).click();await page.locator('.lesson-study-window').getByRole('button',{name:'La conexión',exact:true}).click();assert.match(await page.locator('.lesson-study-window').innerText(),/no otro contactor/);await page.screenshot({path:`${out}/understanding-${engine.name()}-${width}.png`});await page.getByRole('button',{name:'Cerrar explicación del paso',exact:true}).click();
 if(width===1440){
  await page.getByRole('button',{name:'Abrir en grande',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="Diagrama de CADe a estudiar"]')?.value==='estrellaDosContactores');
  await page.getByRole('button',{name:/Ocultar la guía/}).click();
  for(const scope of ['power','control']){await page.getByLabel('Zona del esquema',{exact:true}).selectOption(scope);await page.waitForTimeout(500);await page.screenshot({path:`${out}/diagram-${scope}.png`});}
  await page.locator('.diagram-pane').getByRole('button',{name:'Cerrar diagrama',exact:true}).click();await choose(page,'Mostrar ventana');
 }
 if(width<1440)await page.getByRole('button',{name:/Ocultar la guía/}).click();
 const steps=process.argv.includes('--full')&&width===1440?37:2;
 for(let i=0;i<steps;i++){
  await page.getByRole('button',{name:'Conectar cables',exact:true}).click();for(const id of source.pairs[i]){const target=page.locator(`[data-terminal-id="${id}"]`);if(width<1440)await target.tap();else await target.press('Enter');}
  if(width<1440)await choose(page,'Mostrar ventana');
  if(i===0&&width===1440){const toast=page.locator('[data-guide-confirmation]');await toast.waitFor();assert.equal(await toast.evaluate(e=>!!e.closest('.guide-window')),false);assert.equal(await toast.getByRole('button').count(),0);await page.waitForTimeout(180);await page.screenshot({path:`${out}/screen-tick-${width}.png`});}
  await page.waitForFunction(i=>JSON.parse(localStorage.getItem('panellab-practice-v2')).stepIndex===i+1,i);if(width<1440&&i+1<steps)await page.getByRole('button',{name:/Ocultar la guía/}).click();
  if(i%10===0)console.log(`${engine.name()} ${width}: paso ${i+1}/37`);
 }
 doc=await data(page);assert.equal(doc.wires.length,steps);await page.screenshot({path:`${out}/lesson-${engine.name()}-${width}.png`});
 await page.reload();await page.locator('.board-svg').waitFor();await settled(page);assert.equal((await data(page)).stepIndex,steps);assert.equal((await data(page)).wires.length,steps);
 if(width===1440){
  if(steps<37){await page.evaluate(wires=>{const key='panellab-practice-v2',doc=JSON.parse(localStorage.getItem(key));doc.wires=wires;doc.stepIndex=37;localStorage.setItem(key,JSON.stringify(doc));},original.wires);await page.reload();await page.locator('.board-svg').waitFor();await settled(page);}
  await page.locator('.guide-card').getByText('Recorrido terminado',{exact:true}).waitFor();await page.getByRole('button',{name:/Ocultar la guía/}).click();
  await page.getByLabel('Simular mando de 24 V',{exact:true}).click();await page.getByLabel('Opciones de simulación',{exact:true}).click();const d=page.getByRole('dialog',{name:'Simulación · 24 V',exact:true});await page.getByLabel('Retardo del temporizador',{exact:true}).selectOption('2');await d.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).click();for(const name of ['FUERZA · OFF','CONTROL 1 · OFF','CONTROL 2 · OFF'])await d.getByRole('button',{name,exact:true}).click();await page.getByRole('button',{name:'Cerrar simulación · 24 v',exact:true}).click();
  const start=page.getByRole('button',{name:'Pulsador verde derecho',exact:true});await start.focus();await page.keyboard.down('Space');await page.locator('[data-motor-connection=star]').waitFor();await page.keyboard.up('Space');await page.locator('[data-motor-connection=delta]').waitFor();await page.screenshot({path:out+'/running-delta.png'});
  const stop=page.getByRole('button',{name:'Pulsador rojo central',exact:true});await stop.focus();await page.keyboard.down('Space');await page.waitForFunction(()=>document.querySelector('[data-motor-status]')?.dataset.motorStatus!=='running');await page.keyboard.up('Space');report.checks.push('Recorrido de conexión y persistencia; montaje completo recibido: S1 inicia estrella y cambia a triángulo en 2 s; S2 detiene');
 }
 await choose(page,'Evaluarme: estrella-triángulo · 2 contactores');assert.equal((await data(page)).assessment.lessonId,'estrellaDosContactores');assert.equal((await data(page)).wires.length,0);assert.equal(await page.locator('[data-module-id="CONTACTOR_TRIFASICO_3"]').count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.checks.push(`${engine.name()} ${width}px: lección de 37 pasos, explicación, diagrama original, persistencia y evaluación; sin añadir KM3`);
 await c.close();await browser.close();browser=null;
 }assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2));console.log(report);
})().catch(async e=>{report.failure=e.stack;if(page&&!page.isClosed())await page.screenshot({path:out+'/ui-failure.png'}).catch(()=>{});fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2));console.error(e);await browser?.close();process.exitCode=1;});
