const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();p.on('dialog',d=>d.accept());
await p.goto('http://127.0.0.1:4399/');await p.waitForFunction(()=>document.querySelector('astro-island')?.hasAttribute('ssr')===false);
await p.getByRole('button',{name:'Ahora no'}).tap();const el=p.getByRole('button',{name:'Abrir panel de control'});console.log(await el.evaluate(e=>e.tagName+' '+e.outerHTML.slice(0,200)));await el.focus();await p.keyboard.press('Enter');await p.waitForTimeout(4000);console.log(p.url());
await p.screenshot({path:'qa/_run/m.png'});console.log(await p.locator('.terminal').count(),await p.locator('body').evaluate(()=>[...document.querySelectorAll('button,summary')].filter(x=>x.offsetParent).map(x=>(x.getAttribute('aria-label')||x.innerText).trim().slice(0,30)).join(' | ')));
await b.close()})();
