const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const project=JSON.parse(fs.readFileSync('qa/robotics-arm-task/transfer-completed.modo.json','utf8'));
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{for(const [name,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block'});
  await ctx.addInitScript(p=>localStorage.setItem('modo-robotica-v1',JSON.stringify({projects:[p],active:p.id})),project);
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.PANELLAB_URL||'http://127.0.0.1:4330')+'/robotica/?debug=1');
  const panel=page.locator('.rb-window-arm');await panel.waitFor();
  await panel.getByRole('status').filter({hasText:'Práctica completada: todas las piezas'}).waitFor();
  assert.ok(await panel.getByRole('button',{name:'Cerrar pinza',exact:true}).isDisabled());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await panel.getByRole('tab',{name:'Práctica',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[role=tab][aria-selected=true]')?.textContent==='Práctica');
  await panel.locator('.floating-window-body').evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.waitForTimeout(1200);
  await page.screenshot({path:`qa/robotics-arm-task/${name}-final.png`,timeout:60000});
  await (await panel.isVisible()?panel.getByRole('button',{name:'Minimizar: Brazo robótico',exact:true}):page.locator('.rb-dock').getByRole('button',{name:'Restaurar Brazo robótico',exact:true})).click();await page.waitForTimeout(150);
  await page.screenshot({path:`qa/robotics-arm-task/${name}-scene-final.png`,timeout:60000});
  assert.deepEqual(errors,[]);console.log('PASS',name,'build final: carga del proyecto completado, resultado, servos apagados y capturas sin desbordamiento.');await ctx.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
