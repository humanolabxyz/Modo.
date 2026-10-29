const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
 const p=await c.newPage();
 p.on('console',m=>{if(['error','warning'].includes(m.type()))console.log(m.type(),m.text().slice(0,300))});
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,300)));
 p.on('requestfailed',r=>console.log('FAIL',r.url().slice(0,150)));
 await p.goto('http://127.0.0.1:4344/estudio',{waitUntil:'load'});
 await p.waitForTimeout(15000);
 console.log((await p.innerText('body')).slice(0,300));
 await b.close();
})();
