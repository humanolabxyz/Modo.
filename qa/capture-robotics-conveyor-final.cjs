const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const {buildConveyorCell}=await import('../src/robotics/conveyor/model.ts');
 const base=process.env.PANELLAB_URL||'http://127.0.0.1:4330',out='qa/robotics-conveyor';
 const done=JSON.parse(fs.readFileSync(out+'/desktop-completed.modo.json','utf8'));
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  for(const [state,project]of[['initial',buildConveyorCell()],['complete',done]]){
   const ctx=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block'});
   await ctx.addInitScript(p=>localStorage.setItem('modo-robotica-v1',JSON.stringify({projects:[p],active:p.id})),project);
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/robotica/?debug=1');
   const panel=page.locator('.rb-window-arm');await panel.waitFor();
   await panel.getByRole('tab',{name:'Cinta',exact:true}).click();assert.ok(await panel.getByRole('button',{name:'Clasificar lote',exact:true}).isDisabled());
   if(state==='complete'){await panel.locator('.rb-arm-feedback,.rb-arm-success').filter({hasText:'Práctica completada'}).waitFor();await panel.locator('.floating-window-body').evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:`${out}/${view}-final-controls.png`,timeout:60000});}
   await (await panel.isVisible()?panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}):page.locator('.rb-dock').getByRole('button',{name:'Restaurar Brazo robótico',exact:true})).click();await page.waitForTimeout(1000);await page.screenshot({path:`${out}/${view}-${state}-final.png`,timeout:60000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(state==='initial'){
    await (await panel.isVisible()?panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}):page.locator('.rb-dock').getByRole('button',{name:'Restaurar Brazo robótico',exact:true})).click();await panel.getByRole('button',{name:'Encender motores',exact:true}).click();
    await page.locator('.rb-run').click();await page.waitForFunction(()=>document.querySelector('.rb-arm-power')?.getAttribute('data-status')==='EN MARCHA');
    await page.waitForFunction(()=>parseFloat(document.querySelector('.rb-conveyor-readings dd:last-child')?.textContent||'0')>0);
    await page.locator('.rb-run').click();await page.waitForFunction(()=>document.querySelector('.rb-arm-power')?.getAttribute('data-status')==='PAUSA');
    const paused=await panel.locator('.rb-conveyor-readings').textContent();await page.waitForTimeout(150);assert.equal(await panel.locator('.rb-conveyor-readings').textContent(),paused);
    await page.locator('.rb-run').click();await panel.getByRole('button',{name:'EMERGENCIA',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.rb-arm-power')?.getAttribute('data-status')==='EMERGENCIA');
    await panel.getByRole('button',{name:'Restablecer emergencia',exact:true}).click();assert.ok(await page.locator('.rb-run').isDisabled());
    await page.locator('.rb-dock button[aria-label="Piezas"]').click();await page.getByLabel('Buscar pieza',{exact:true}).fill('cinta');
    const card=page.locator('[data-definition="educational-conveyor"]');await card.locator('img').evaluate(img=>img.decode());assert.equal(await card.locator('img').evaluate(img=>img.naturalWidth),320);
   }
   assert.deepEqual(errors,[]);await ctx.close();
  }
  console.log('PASS',view,'build final: miniatura, ejecución general, transporte, pausa/reanudación, emergencia y estado completado.');
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
