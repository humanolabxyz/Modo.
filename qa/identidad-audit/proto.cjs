const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();
for(const [n,w,h] of [['d',1440,900],['m',390,844]]){
 const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block',hasTouch:w<800});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message.slice(0,100)));
 await p.goto('http://127.0.0.1:4460/laboratorio/',{waitUntil:'load'});await p.waitForTimeout(3500);
 if(w>800)await p.getByRole('button',{name:/^Protoboard/}).first().click();else await p.locator('select[aria-label="Herramienta del laboratorio"]').selectOption({label:'Protoboard'});
 await p.waitForTimeout(2200);await p.screenshot({path:`qa/identidad-audit/pb-${n}-1.png`});
 if(w>800){
  await p.getByRole('button',{name:/Simular proyecto/}).click().catch(()=>{});await p.waitForTimeout(1500);await p.screenshot({path:`qa/identidad-audit/pb-${n}-2-sim.png`});
  await p.getByRole('button',{name:/Detener/}).first().click().catch(()=>{});await p.waitForTimeout(600);
  await p.getByRole('button',{name:/^Componentes|Agregar|Piezas/}).first().click({timeout:2000}).catch(()=>{});await p.waitForTimeout(800);await p.screenshot({path:`qa/identidad-audit/pb-${n}-3-menu.png`});
 }
 await c.close()}
await b.close()})()
