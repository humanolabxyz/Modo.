const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});p.on('dialog',d=>d.accept());
await p.goto('http://127.0.0.1:4399/?view=simulator');await p.waitForFunction(()=>document.querySelectorAll('.terminal').length===94);
await p.getByRole('textbox',{name:'Buscar un borne o componente'}).fill('95');await p.locator('.search-results button').first().click();await p.waitForTimeout(800);
console.log(await p.locator('aside.inspector').evaluate(e=>e.outerHTML.replace(/<svg.*?<\/svg>/g,'').slice(0,2500)));
console.log(await p.locator('.info-lines').count(), await p.locator('.terminal-details').count());
await b.close()})();
