const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4322/';
const report={checks:[],errors:[],viewports:[]};
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1062,height:834}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();
 const settle=()=>page.waitForFunction(()=>[...document.querySelectorAll('.board-svg,.cade-artboard>svg')].every(e=>e.dataset.animating!=='true'));
 await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();
 assert.equal(await page.locator('.cade-route-actions').count(),0);assert.equal(await page.locator('.connection-lesson').count(),0);
 for(const selector of ['.diagram-more','.cade-controls','.cade-explanation'])assert.equal(await page.locator(selector).getAttribute('open'),null);
 assert.equal(await page.getByRole('button',{name:'Todas las rutas',exact:true}).count(),0);
 assert.ok(await page.locator('.cade-artboard').isVisible());
 const order=await page.evaluate(()=>document.querySelector('.cade-artboard').getBoundingClientRect().top<document.querySelector('.cade-controls').getBoundingClientRect().top);assert.ok(order);
 await settle();await page.screenshot({path:'qa/diagrama-simple/despues.png'});
 report.checks.push('Fresh panel opens on the authoritative CADe circuit, with no disabled route buttons, automatic practice or expanded options. Drawing precedes tools.');
 for(const viewport of [{width:1920,height:1080},{width:1440,height:900},{width:1062,height:834},{width:768,height:1024},{width:390,height:844},{width:360,height:800},{width:844,height:390}]){
  await page.setViewportSize(viewport);await settle();
  for(const expanded of [false,true]){
   if(expanded)await page.getByRole('button',{name:'Ampliar diagrama',exact:true}).click();
   const frame=await page.locator('.diagram-pane').evaluate(p=>{const r=p.getBoundingClientRect(),b=p.querySelector('.diagram-pane-body'),h=p.querySelector('.diagram-pane-actions').getBoundingClientRect();return {bounds:r.top>=0&&r.left>=0&&(p.closest('.diagram-window')?h.bottom<=innerHeight+1:r.bottom<=innerHeight+1)&&r.right<=innerWidth+1,noOverflow:b.scrollWidth<=b.clientWidth+1,body:b.getBoundingClientRect().height>30,header:h.bottom<=r.bottom}});
   assert.ok(Object.values(frame).every(Boolean),JSON.stringify({viewport,expanded,frame}));
   if(viewport.width===390&&expanded)await page.screenshot({path:'qa/diagrama-simple/mobile-ampliado.png'});
   if(expanded)await page.getByRole('button',{name:'Volver al banco',exact:true}).click();
  }
  report.viewports.push(viewport);
 }
 report.checks.push('Initial and expanded views fit seven viewport sizes with accessible close/expand controls and no horizontal overflow.');
 await page.setViewportSize({width:1062,height:834});await page.locator('[data-cade-wire="42"]').focus();await page.keyboard.press('Enter');await settle();
 assert.ok(await page.locator('.ghost-cable').count()>1);assert.ok(await page.getByRole('button',{name:'Mostrar recorrido en el tablero',exact:true}).isVisible());assert.equal(await page.locator('.connection-lesson').count(),0);assert.equal(await page.locator('.cade-explanation').getAttribute('open'),null);await page.locator('.diagram-pane-body').evaluate(e=>e.scrollTop=0);await page.screenshot({path:'qa/diagrama-simple/recorrido.png'});
 await page.getByRole('button',{name:'Practicar paso a paso',exact:true}).click();assert.ok(await page.locator('.connection-lesson').isVisible());assert.equal(await page.locator('.lesson-settings').getAttribute('open'),null);await page.locator('.lesson-settings>summary').click();assert.ok(await page.getByRole('combobox',{name:'Modo de montaje'}).isVisible());
 report.checks.push('Selected line keeps all known cable branches visible; practice opens only on request and its settings remain optional.');
 await page.getByRole('button',{name:'Cerrar diagrama',exact:true}).first().click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();await page.locator('.simulation-examples>summary').click();await page.getByRole('button',{name:'Cargar marcha y parada con KM1',exact:true}).click();await page.getByLabel('Opciones de simulación',{exact:true}).click();await page.getByRole('button',{name:'Cerrar aviso',exact:true}).click();
 await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();assert.ok(await page.getByRole('button',{name:'Practicar paso a paso',exact:true}).isVisible());await page.getByRole('button',{name:'Cerrar diagrama',exact:true}).first().click();
 const focus=async id=>{await page.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption(id);await settle()};
 await focus('FUENTE');await page.getByRole('button',{name:'Interruptor CONTROL 1',exact:true}).click();await page.getByRole('button',{name:'Interruptor CONTROL 2',exact:true}).click();assert.equal(await page.locator('[data-source-powered]').getAttribute('data-source-powered'),'false');
 await page.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).click();assert.equal(await page.locator('[data-source-powered]').getAttribute('data-source-powered'),'true');
 await page.getByRole('button',{name:'Interruptor FUERZA',exact:true}).click();assert.equal(await page.locator('[data-force-breaker]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-force-breaker] .breaker-lever').count(),3);assert.equal(await page.locator('[data-force-breaker] text').allTextContents().then(x=>x.join(',')),'ON,ON,ON');
 await page.waitForFunction(()=>document.querySelector('[data-force-breaker] .breaker-lever').getAnimations().every(a=>a.playState==='finished'));assert.match(await page.locator('[data-force-breaker] .breaker-lever').first().evaluate(e=>getComputedStyle(e).transform),/7\)/);await page.screenshot({path:'qa/diagrama-simple/enchufe-on.png'});
 await focus('BOTONERAS');const green=page.getByRole('button',{name:'Pulsador verde derecho',exact:true});await green.focus();await page.keyboard.down('Space');await page.keyboard.up('Space');assert.equal(await page.locator('[data-sim-relay="CONTACTOR_TERMICO"]').getAttribute('data-active'),'true');
 await focus('FUENTE');const count=await page.locator('.interactive-wire').count();await page.getByRole('button',{name:'Desenchufar corriente virtual',exact:true}).click();assert.equal(await page.locator('[data-source-powered]').getAttribute('data-source-powered'),'false');assert.equal(await page.locator('[data-sim-relay="CONTACTOR_TERMICO"]').getAttribute('data-active'),'false');assert.equal(await page.locator('[data-sim-pilot="P4"]').getAttribute('data-lit'),'false');assert.equal(await page.locator('.interactive-wire').count(),count);await page.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).click();assert.equal(await page.locator('[data-sim-relay="CONTACTOR_TERMICO"]').getAttribute('data-active'),'false','Reconnect does not restart held motor circuit');
 await page.getByRole('button',{name:'Interruptor FUERZA',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-force-breaker]').getAttribute('aria-pressed'),'false');
 report.checks.push('Unplugged CONTROL switches cannot energize source; plug enables wired control. FUERZA moves all three poles, supports keyboard, and reports ON/OFF. Unplug drops holding relay and pilots without deleting cables or restarting on reconnect.');
 for(const m of ['CONTACTOR_TERMICO','CONTACTOR_TRIFASICO']){
  await focus(m);assert.equal(await page.locator(`[data-terminal-id="${m}:71"] circle`).nth(3).getAttribute('fill'),'#6a747c');assert.equal(await page.locator(`[data-terminal-id="${m}:13"] circle`).nth(3).getAttribute('fill'),'#17509a');assert.ok(await page.locator(`[data-module-id="${m}"] [data-contact-legend]`).isVisible());
  await page.getByRole('button',{name:'Seleccionar',exact:true}).click();await page.locator(`[data-terminal-id="${m}:71"]`).focus();await page.keyboard.press('Enter');assert.match(await page.locator('.terminal-description').innerText(),/Gris = normalmente cerrado/);
 }
 report.checks.push('Both contactors show gray NC and blue NO with visible legends and user-supplied interpretation in inspector; source and coil colors remain separate.');
 const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const tp=await touch.newPage();
 await tp.goto(base+'?view=simulator');await tp.locator('.board-svg').waitFor();await tp.getByRole('button',{name:'Simular mando de 24 V',exact:true}).tap();await tp.locator('.practice-menu>summary').tap();await tp.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption('FUENTE');await tp.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');
 await tp.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).tap();await tp.getByRole('button',{name:'Interruptor CONTROL 1',exact:true}).tap();await tp.getByRole('button',{name:'Interruptor CONTROL 2',exact:true}).tap();await tp.getByRole('button',{name:'Interruptor FUERZA',exact:true}).tap();assert.equal(await tp.locator('[data-source-powered]').getAttribute('data-source-powered'),'true');assert.equal(await tp.locator('[data-force-breaker]').getAttribute('aria-pressed'),'true');await tp.getByRole('button',{name:'Desenchufar corriente virtual',exact:true}).tap();assert.equal(await tp.locator('[data-source-powered]').getAttribute('data-source-powered'),'false');await touch.close();report.checks.push('Real mobile touch operates the plug and physical FUERZA/CONTROL switches on the source plate.');
 assert.deepEqual(report.errors,[]);report.result='PASS';
 }finally{await browser.close();fs.writeFileSync('qa/diagrama-simple/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
