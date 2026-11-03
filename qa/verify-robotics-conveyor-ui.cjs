const {armUi}=require('./arm-ui-helpers.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4330',out='qa/robotics-conveyor';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const report={checks:[],errors:[]};let active;
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]].filter(([v])=>!process.env.PANELLAB_QA_VIEW||process.env.PANELLAB_QA_VIEW===v)){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion:'reduce'}),page=await ctx.newPage();active=page;
  page.on('pageerror',e=>report.errors.push(e.message));
  const {press,panel,button,tab}=armUi(page,width);
  const state=text=>page.waitForFunction(t=>document.querySelector('.rb-arm-power')?.getAttribute('data-status')===t,text,{timeout:30000});
  const feedback=(text,timeout=30000)=>panel.locator('.rb-arm-feedback,.rb-arm-success').filter({hasText:text}).waitFor({timeout});
  const snapshot=()=>page.evaluate(()=>{const l=JSON.parse(localStorage.getItem('modo-robotica-v1'));return l.projects.find(p=>p.id===l.active);});
  await page.goto(base+'/robotica/?debug=1');await page.locator('.rb-app[data-ready=true]').waitFor();
  await press(page.getByRole('button',{name:'Más robots y proyectos',exact:true}));await press(page.locator('[data-template="brazo-e6-cinta-clasificadora"]'));
  await panel.waitFor();await press(panel.getByRole('tab',{name:'Cinta',exact:true}));await page.waitForTimeout(1000);
  assert.ok(await button('Clasificar lote').isDisabled());await page.screenshot({path:`${out}/${view}-initial.png`,timeout:60000});
  await press(button('Habilitar servos'));await state('LISTO');
  const armSpeed=panel.getByRole('slider',{name:'Velocidad del brazo',exact:true});await armSpeed.focus();await armSpeed.press('End');
  const beltSpeed=panel.getByRole('slider',{name:'Velocidad de cinta',exact:true});await beltSpeed.focus();await beltSpeed.press('End');
  await press(panel.locator('.rb-conveyor-controls details summary'));
  await press(panel.getByLabel('Cinta atascada',{exact:true}));await press(button('Avanzar hasta sensor'));await feedback('Atasco de cinta');await state('LISTO');
  await press(panel.getByLabel('Cinta atascada',{exact:true}));
  await press(panel.getByLabel('Sensor sin detección',{exact:true}));await press(button('Avanzar hasta sensor'));await feedback('llegó al final sin detección');await state('LISTO');
  assert.ok((await panel.locator('.rb-conveyor-readings').innerText()).includes('Sin pieza en estación'));
  await press(panel.getByLabel('Sensor sin detección',{exact:true}));await press(button('Reiniciar práctica'));await state('LISTO');
  // A slower first feed gives touch scrolling time before the beam is reached.
  await beltSpeed.focus();await beltSpeed.press('Home');
  await press(button('Avanzar hasta sensor'));await state('EN MARCHA');
  await press(page.locator('.rb-run'));await state('PAUSA');const pos=await panel.locator('.rb-conveyor-readings').textContent();await page.waitForTimeout(150);assert.equal(await panel.locator('.rb-conveyor-readings').textContent(),pos);
  await press(button('EMERGENCIA'));await state('EMERGENCIA');await press(button('Restablecer emergencia'));assert.ok(await button('Avanzar hasta sensor').isDisabled());
  await press(button('Habilitar servos'));await state('LISTO');await press(button('Reiniciar práctica'));
  await beltSpeed.focus();await beltSpeed.press('End');
  await press(button('Clasificar lote'));await state('EN MARCHA');console.log('RUN',view,'clasificación completa');
  await feedback('Clasificación completada',180000);await state('LISTO');
  await panel.getByRole('status').filter({hasText:'Práctica completada: todas las piezas'}).waitFor({timeout:10000});
  await page.waitForFunction(()=>{const l=JSON.parse(localStorage.getItem('modo-robotica-v1'));return l.projects.find(p=>p.id===l.active)?.parts.filter(x=>x.definitionId==='arm-practice-block'&&x.props.depositedBy).length===3;});
  const p=await snapshot();assert.equal(p.firmware.length,0);
  for(const piece of p.parts.filter(x=>x.definitionId==='arm-practice-block')){
    const zone=p.parts.find(x=>x.instanceId===piece.props.targetZone);const color=piece.props.surfaceR>180?'rojo':piece.props.surfaceG>150?'verde':'azul';
    assert.equal(zone.props.acceptColor,color);assert.ok(Math.hypot(piece.transform.position[0]-zone.transform.position[0],piece.transform.position[2]-zone.transform.position[2])<.04);
  }
  fs.writeFileSync(`${out}/${view}-completed.modo.json`,JSON.stringify(p,null,2));
  await panel.evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:`${out}/${view}-complete.png`,timeout:60000});
  await press(panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}));await page.waitForTimeout(150);await page.screenshot({path:`${out}/${view}-scene.png`,timeout:60000});
  await page.reload();await panel.waitFor();await feedback('Práctica completada');assert.ok(await button('Cerrar pinza').isDisabled());
  const saved=await snapshot();assert.equal(saved.parts.filter(x=>x.definitionId==='arm-practice-block'&&x.props.depositedBy).length,3);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  report.checks.push(`${view}: célula 3D, controles, atasco, sensor sin detección, pausa y emergencia durante transporte; lote de tres colores con brazo, física de liberación, guardado y recarga con servos apagados.`);console.log('PASS',report.checks.at(-1));await ctx.close();
 }assert.deepEqual(report.errors,[]);}catch(e){if(active&&!active.isClosed()){await active.screenshot({path:out+'/failure.png',timeout:60000});fs.writeFileSync(out+'/failure.txt',await active.locator('body').innerText());}throw e;}finally{fs.writeFileSync(`${out}/ui${process.env.PANELLAB_QA_VIEW?'-'+process.env.PANELLAB_QA_VIEW:''}-results.json`,JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
