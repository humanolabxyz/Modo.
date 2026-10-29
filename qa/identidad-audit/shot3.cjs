const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch();
 for (const [name,w,h] of [['d',1440,900],['m',390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});
  await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1');});
  const p=await c.newPage();
  p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
  for (const r of ['estudio','laboratorio','comunidad','legal','versiones']){
   await p.goto('http://127.0.0.1:4455/'+r+'/',{waitUntil:'load'});
   await p.waitForTimeout(3500);
   await p.screenshot({path:`qa/identidad-audit/${r}-${name}.png`});
   if(r==='estudio'||r==='laboratorio') await p.screenshot({path:`qa/identidad-audit/${r}-${name}-full.png`,fullPage:true});
  }
  // panel
  await p.goto('http://127.0.0.1:4455/',{waitUntil:'load'}); await p.waitForTimeout(2500);
  const btn=p.locator('button.home-module').first(); 
  if(await btn.count()){ await btn.click({force:true}).catch(()=>{}); await p.waitForTimeout(500); await btn.click({force:true}).catch(()=>{}); await p.waitForTimeout(3000);}
  await p.screenshot({path:`qa/identidad-audit/panel-${name}.png`});
  await c.close();
 }
 await b.close();
})();
