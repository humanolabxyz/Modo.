const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch();
 try{for(const [width,height] of [[320,700],[600,360]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block'});
  await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
  const page=await context.newPage();await page.goto((process.env.PANELLAB_URL||'http://127.0.0.1:4327')+'/laboratorio?tool=equipment');
  await page.locator('[data-lab-ready="true"]').waitFor();await page.waitForFunction(()=>!document.getElementById('modo-splash'));await page.waitForTimeout(600);
  const trigger=page.getByRole('button',{name:/^Cambiar módulo:/}),menu=page.getByRole('menu',{name:'Módulos del laboratorio'});
  await trigger.click();await page.waitForTimeout(200);const a=await trigger.boundingBox(),b=await menu.boundingBox();assert.ok(Math.abs(b.y-a.y-a.height-7)<2);assert.ok(b.x>=0&&b.x+b.width<=width&&b.y+b.height<=height);
  await trigger.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('End');const last=menu.getByRole('menuitem').last();assert.equal(await last.evaluate(el=>document.activeElement===el),true);const end=await last.boundingBox();assert.ok(end.y+end.height<=height-10,'Último módulo alcanzable en pantalla baja');
  await page.keyboard.press('Escape');await menu.waitFor({state:'detached'});assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);await trigger.click();await menu.waitFor();await trigger.click();await menu.waitFor({state:'detached'});
  await context.close();console.log(width+'×'+height+': anclaje, límites, desplazamiento, teclado y plegado correctos');
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
