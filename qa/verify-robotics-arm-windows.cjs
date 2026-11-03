const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {armUi}=require('./arm-ui-helpers.cjs');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4330',out='qa/robotics-arm-windows';
(async()=>{
 const {buildArmPractice}=await import('../src/robotics/arm/model.ts');
 fs.mkdirSync(out,{recursive:true});const report={checks:[],errors:[]};let active;
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  const project=buildArmPractice(),ctx=await b.newContext({viewport:{width,height},hasTouch:width<600,isMobile:width<600,serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.addInitScript(p=>{if(!localStorage.getItem('modo-robotica-v1'))localStorage.setItem('modo-robotica-v1',JSON.stringify({projects:[p],active:p.id}));},project);
  const p=await ctx.newPage();active=p;p.on('pageerror',e=>report.errors.push(e.message));
  const {panel,press,button,tab}=armUi(p,width),state=text=>p.waitForFunction(t=>document.querySelector('.rb-arm-power')?.dataset.status===t,text,{timeout:30000});
  await p.goto(base+'/robotica/?debug=1');await panel.waitFor();
  assert.equal(await panel.getAttribute('role'),'dialog');assert.equal(await panel.getByRole('tab',{name:'Empezar',exact:true}).getAttribute('aria-selected'),'true');
  assert.ok(await button('Iniciar práctica automática').isDisabled());assert.ok((await panel.innerText()).includes('No necesitas configurar ni enseñar puntos'));
  assert.equal(await panel.getByRole('slider').count(),1,'al abrir no muestra seis ejes sin explicar');
  await p.waitForTimeout(1000);await p.screenshot({path:`${out}/${view}-start.png`,timeout:60000});
  if(view==='desktop'){
   const original=await panel.boundingBox(),header=await panel.locator('.floating-window-title').boundingBox();
   await p.mouse.move(header.x+25,header.y+header.height/2);await p.mouse.down();await p.mouse.move(header.x-280,header.y+header.height/2+40,{steps:10});await p.mouse.up();
   const moved=await panel.boundingBox();assert.ok(original.x-moved.x>250,'arrastra por cabecera');
   const grip=await panel.locator('.fw-edge-se').boundingBox();await p.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);await p.mouse.down();await p.mouse.move(grip.x+grip.width/2+90,grip.y+grip.height/2-100,{steps:10});await p.mouse.up();
   const resized=await panel.boundingBox();assert.ok(resized.width>moved.width+70);assert.ok(resized.height<moved.height-70);
   await press(panel.getByRole('button',{name:'Maximizar o restaurar: Brazo robótico',exact:true}));assert.equal(await panel.getAttribute('data-maximized'),'true');
   await press(panel.getByRole('button',{name:'Maximizar o restaurar: Brazo robótico',exact:true}));assert.equal(await panel.getAttribute('data-maximized'),'false');
   const saved=await panel.boundingBox();await p.reload();await panel.waitFor();const reload=await panel.boundingBox();
   for(const key of ['x','y','width','height'])assert.ok(Math.abs(saved[key]-reload[key])<3,`recuerda ${key}`);
   await p.screenshot({path:`${out}/${view}-moved-resized.png`,timeout:60000});
   await press(panel.getByRole('button',{name:'Restablecer tamaño y posición de la ventana',exact:true}));
  }else{
   const box=await panel.boundingBox(),dock=await p.locator('.rb-dock').boundingBox();
   assert.ok(box.y>180,'deja ver el brazo por encima');assert.ok(box.y+box.height<=dock.y+1,'no tapa el dock');assert.ok(box.x>=0&&box.x+box.width<=width);
   assert.equal(await panel.getAttribute('data-phone-layout'),'true');
  }
  await press(panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}));await panel.waitFor({state:'hidden'});
  await press(p.locator('.rb-dock').getByRole('button',{name:'Restaurar Brazo robótico',exact:true}));await panel.waitFor();
  await press(panel.getByRole('button',{name:'Cerrar Brazo robótico',exact:true}));await panel.waitFor({state:'detached'});
  await press(p.locator('.rb-dock').getByRole('button',{name:'Brazo robótico',exact:true}));await panel.waitFor();
  await press(button('Encender motores'));await state('LISTO');const speed=panel.getByRole('slider',{name:'Velocidad del brazo',exact:true});await speed.focus();await speed.press('End');
  await press(button('Iniciar práctica automática'));await state('EN MARCHA');await press(button('Pausar movimiento'));await state('PAUSA');
  const pos=await panel.locator('.rb-arm-position').textContent();await p.waitForTimeout(150);assert.equal(await panel.locator('.rb-arm-position').textContent(),pos);
  await press(panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}));await press(p.getByRole('button',{name:'Parada de emergencia del brazo',exact:true}));
  await press(p.locator('.rb-dock').getByRole('button',{name:'Restaurar Brazo robótico',exact:true}));await state('EMERGENCIA');
  await press(button('Restablecer emergencia'));assert.ok(await button('Iniciar práctica automática').isDisabled());await press(button('Encender motores'));await state('LISTO');await press(button('Reiniciar práctica'));
  await press(button('Iniciar práctica automática'));console.log('RUN',view,'primera práctica sin enseñar puntos');
  await panel.getByRole('status').filter({hasText:'Práctica completada: pieza'}).waitFor({timeout:90000});await state('LISTO');
  await press(button('Reiniciar práctica'));await tab('Articulaciones');
  const slider=panel.getByRole('slider',{name:'J1 · Base',exact:true});const initial=await slider.inputValue();await slider.focus();await slider.press('ArrowRight');assert.notEqual(await slider.inputValue(),initial);
  const actual=await panel.locator('.rb-arm-joints output').first().textContent();assert.ok(actual.includes('→'),'distingue posición actual y objetivo');
  assert.equal(await panel.locator('.rb-arm-power').getAttribute('data-status'),'LISTO','ajustar la barra no inicia movimiento');
  await press(button('Mover a esta posición'));await state('LISTO');await tab('Programa');await press(button('Guardar posición actual'));
  assert.equal(await panel.locator('.rb-arm-points li').count(),10);await p.screenshot({path:`${out}/${view}-program.png`,timeout:60000});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  report.checks.push(`${view}: entrada guiada, ventana nativa, minimizar/cerrar/reabrir, emergencia con ventana minimizada, práctica automática, postura preparada antes de mover y programa editable.${view==='desktop'?' Arrastre, tamaño, maximizar/restaurar y persistencia de geometría comprobados.':' Se conservan visibles el robot y el dock.'}`);
  console.log('PASS',report.checks.at(-1));await ctx.close();
 }assert.deepEqual(report.errors,[]);}catch(e){if(active&&!active.isClosed()){await active.screenshot({path:out+'/failure.png',timeout:60000});fs.writeFileSync(out+'/failure.txt',await active.locator('body').innerText());}throw e;}finally{fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
