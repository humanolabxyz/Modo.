const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {armUi}=require('./arm-ui-helpers.cjs');
(async()=>{
 const {buildArmPractice}=await import('../src/robotics/arm/model.ts');
 const {buildConveyorCell}=await import('../src/robotics/conveyor/model.ts');
 const out='qa/robotics-arm-windows',report={checks:[],errors:[]};fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]])for(const [kind,build]of[['arm',buildArmPractice],['conveyor',buildConveyorCell]]){
  const project=build(),ctx=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.addInitScript(p=>localStorage.setItem('modo-robotica-v1',JSON.stringify({projects:[p],active:p.id})),project);
  const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto((process.env.PANELLAB_URL||'http://127.0.0.1:4330')+'/robotica/?debug=1');
  const {panel,button,press,tab}=armUi(page,width);await panel.waitFor();await page.waitForTimeout(700);
  const start=button(kind==='arm'?'Iniciar práctica automática':'Iniciar clasificación'),cta=await start.boundingBox(),frame=await panel.boundingBox(),body=await panel.locator('.floating-window-body').boundingBox();
  assert.ok(cta.y>=body.y+body.height-1&&cta.y+cta.height<=frame.y+frame.height,'iniciar fuera del área desplazable y visible');
  assert.ok(await start.isDisabled());assert.equal(await panel.getByRole('button',{name:'EMERGENCIA',exact:true}).evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(181, 46, 54)');
  await page.screenshot({path:`${out}/${view}-${kind}-final.png`,timeout:60000});
  await press(button('Encender motores'));await press(start);await page.waitForFunction(()=>document.querySelector('.rb-arm-power')?.dataset.status==='EN MARCHA');
  await press(button('Pausar movimiento'));await page.waitForFunction(()=>document.querySelector('.rb-arm-power')?.dataset.status==='PAUSA');
  await press(panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}));await press(page.getByRole('button',{name:'Parada de emergencia del brazo',exact:true}));
  await press(page.locator('.rb-dock').getByRole('button',{name:'Restaurar Brazo robótico',exact:true}));
  await page.waitForFunction(()=>document.querySelector('.rb-arm-power')?.dataset.status==='EMERGENCIA');await press(button('Restablecer emergencia'));assert.ok(await start.isDisabled());
  await tab('Articulaciones');await panel.getByRole('tabpanel',{name:'Mover a mano',exact:true}).waitFor();
  await page.screenshot({path:`${out}/${view}-${kind}-manual-final.png`,timeout:60000});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  report.checks.push(`${view}/${kind}: inicio visible en pie fijo, emergencia roja, encendido, ejecución, pausa, emergencia con ventana minimizada, restauración y pestaña manual accesible.`);console.log('PASS',report.checks.at(-1));await ctx.close();
 }assert.deepEqual(report.errors,[]);}finally{fs.writeFileSync(out+'/final-build-results.json',JSON.stringify(report,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
