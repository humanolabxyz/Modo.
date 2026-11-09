const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='qa/lesson05-buttons';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:1000},serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
   await page.goto('http://127.0.0.1:4327/?view=simulator');
   await page.locator('.board-svg').waitFor();
   await page.waitForFunction(()=>!document.documentElement.matches('.modo-splash-on,.modo-opening-on'));
   await page.getByRole('button',{name:'Guía paso a paso',exact:true}).dispatchEvent('click');
   await page.getByRole('button',{name:'Aprender: Estrella-triángulo · 2 contactores',exact:true}).dispatchEvent('click');
   const svg=page.locator('[data-guide-schematic] > svg');await svg.waitFor();
   const labels=await svg.locator('text').allTextContents();
   assert.ok(labels.includes('S2'));assert.ok(labels.includes('S1'));
   assert.ok(!labels.includes('SB1')&&!labels.includes('SB2'));
   const controls=await svg.locator('g').evaluateAll(gs=>gs.filter(g=>['S1','S2'].some(s=>[...g.querySelectorAll('text')].some(t=>t.textContent===s))).map(g=>[...g.querySelectorAll('text')].map(t=>t.textContent)));
   assert.ok(controls.some(ts=>ts.includes('S2')&&ts.includes('1')&&ts.includes('2')));
   assert.ok(controls.some(ts=>ts.includes('S1')&&ts.includes('3')&&ts.includes('4')));
   await page.screenshot({path:`${out}/corrected-${width}.png`});
   await svg.evaluate(s=>s.setAttribute('viewBox','275 98 75 63'));
   await svg.screenshot({path:`${out}/buttons-${width}.png`});
   assert.deepEqual(errors,[]);await page.close();
   console.log(`PASS ${width}px: S2 1–2 y S1 3–4, sin SB1/SB2 ni errores de página`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
