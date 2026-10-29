const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327').replace(/\/$/,''),out='qa/desktop-laboratory-header';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();const checks=[],errors=[];
 try{for(const width of [1101,1280,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const tool of ['equipment','hmi','temperature']){
   await page.goto(base+'/laboratorio?tool='+tool);await page.locator('[data-lab-ready="true"]').waitFor();await page.waitForFunction(()=>!document.getElementById('modo-splash'));await page.waitForTimeout(450);const notebook=page.getByRole('dialog',{name:'Libreta G03',exact:true});if(await notebook.isVisible())await notebook.getByRole('button',{name:'Cerrar ventana',exact:true}).click();
   const chrome=page.locator('.lab-desktop-chrome'),header=page.locator('.lab-topbar'),nav=header.getByRole('navigation',{name:'Herramientas del laboratorio'});assert.equal(await nav.count(),1,'Selector integrado en la cabecera');const box=await chrome.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width);const project=page.locator('.lab-projectbar');if(await project.count()){assert.ok((await header.boundingBox()).y+(await header.boundingBox()).height<=(await project.boundingBox()).y);}
   const note=page.locator('.automation-context');if(await note.count())assert.ok(box.y+box.height<=(await note.boundingBox()).y,'Franja fuera de la cabecera');
   for(const control of await chrome.locator('button:visible:not(:disabled),a:visible,input:visible:not(:disabled),select:visible:not(:disabled),summary:visible').all()){
    const r=await control.boundingBox();assert.ok(r.x>=box.x-1&&r.x+r.width<=box.x+box.width+1&&r.y>=box.y-1&&r.y+r.height<=box.y+box.height+1,'Control dentro de cabecera');assert.equal(await control.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),true,'Control accesible sin superposición: '+await control.evaluate(el=>el.outerHTML.slice(0,180)+' / '+document.elementFromPoint(el.getBoundingClientRect().x+el.getBoundingClientRect().width/2,el.getBoundingClientRect().y+el.getBoundingClientRect().height/2)?.outerHTML.slice(0,180)));
   }
   const trigger=nav.getByRole('button',{name:/^Cambiar módulo:/});await trigger.click();const menu=page.getByRole('menu',{name:'Módulos del laboratorio'});await menu.waitFor();const a=await trigger.boundingBox(),b=await menu.boundingBox();assert.ok(Math.abs(b.y-a.y-a.height-7)<2);assert.equal(await menu.getByRole('menuitem').count(),10);await page.screenshot({path:out+'/'+tool+'-'+width+'.png'});await page.keyboard.press('Escape');await menu.waitFor({state:'detached'});assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
   checks.push(width+' '+tool+': cabecera integrada, controles accesibles y desplegable anclado');
  }await context.close();
 }assert.deepEqual(errors,[]);fs.writeFileSync(out+'/results.json',JSON.stringify({base,checks,errors},null,2));console.log(JSON.stringify({base,checks,errors},null,2));}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
