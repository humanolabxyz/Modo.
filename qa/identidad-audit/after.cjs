const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch();
 for (const [name,w,h] of [['d',1440,900],['m',390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});
  await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1');});
  const p=await c.newPage();
  p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
  for (const r of ['comunidad','legal','versiones','estudio']){
   await p.goto('http://127.0.0.1:4455/'+r+'/',{waitUntil:'load'}); await p.waitForTimeout(3000);
   await p.screenshot({path:`qa/identidad-audit/new-${r}-${name}.png`});
  }
  // estudio: entrar a un ramo
  const card=p.locator('.campus-course').first();
  if(await card.count()){ await card.click().catch(e=>console.log('click',e.message.slice(0,80))); await p.waitForTimeout(2500); await p.screenshot({path:`qa/identidad-audit/new-estudio-ramo-${name}.png`});
   const topic=p.locator('.campus-topic, .class-start, .study-card a, .campus-resume').first();
   if(await topic.count()){ await topic.click().catch(()=>{}); await p.waitForTimeout(2500); await p.screenshot({path:`qa/identidad-audit/new-estudio-tema-${name}.png`}); }
  }
  await c.close();
 }
 await b.close();
})();
