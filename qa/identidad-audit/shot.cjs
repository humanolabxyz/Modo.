const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch();
 for (const [name,w,h] of [['d',1440,900],['m',390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});
  await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1');});
  const p=await c.newPage();
  for (const r of ['','estudio','laboratorio','comunidad','legal','versiones']){
   await p.goto('http://127.0.0.1:4344/'+r,{waitUntil:'load'}).catch(e=>console.log(r,e.message));
   await p.waitForTimeout(2500);
   await p.screenshot({path:`qa/identidad-audit/${r||'home'}-${name}.png`});
  }
  await c.close();
 }
 await b.close();
})();
