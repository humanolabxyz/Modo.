const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
 await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen')});
 const p=await c.newPage(); await p.goto('http://127.0.0.1:4455/estudio/'); await p.waitForTimeout(3000);
 await p.locator('.campus-course').first().click(); await p.waitForTimeout(2000);
 const r=await p.evaluate(()=>{const out=[];for(const t of ['Unidad 1:','Contenido del curso','Electrónica Aplicada a la\nAutomatización']){const el=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim().startsWith(t.split('\n')[0])).slice(0,3);el.forEach(e=>{let n=e,chain=[];for(let i=0;i<3&&n;i++,n=n.parentElement)chain.push(n.tagName+'.'+n.className);out.push([chain.join(' < '),getComputedStyle(e).color,getComputedStyle(e).fontFamily.slice(0,20)])})}return out});
 console.log(JSON.stringify(r,null,1));
 // abrir primera unidad y primer tema
 await p.locator('.class-unit summary, .class-unit button').first().click().catch(()=>{}); await p.waitForTimeout(800);
 await p.screenshot({path:'qa/identidad-audit/new-estudio-unidad-d.png'});
 await b.close();
})();
