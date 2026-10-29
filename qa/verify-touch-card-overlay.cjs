const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const [width,height] of [[390,844],[820,1180],[1180,820],[844,390]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block'});
   await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
   const page=await context.newPage();await page.goto('http://127.0.0.1:4344');
   await page.locator('.launch-import input:not(:disabled)').waitFor({state:'attached'});
   for(let index=0;index<3;index++){
    const entries=page.locator('.launch-entry');
    const original=await entries.evaluateAll(nodes=>nodes.map(n=>({top:n.getBoundingClientRect().top+scrollY,height:n.getBoundingClientRect().height})));
    await entries.nth(index).tap();
    const preview=page.locator('.launch-preview:not(.is-leaving)');await preview.waitFor();
    await page.waitForTimeout(400);
    assert.equal(await entries.nth(index).evaluate(n=>getComputedStyle(n).display),'none','Original card must leave layout while preview is open');
    assert.equal(await preview.evaluate(n=>getComputedStyle(n).position),'relative');
    const previewTop=await preview.evaluate(n=>n.getBoundingClientRect().top+scrollY);
    assert.ok(Math.abs(previewTop-original[index].top)<1,'Expanded card must occupy original position without a gap');
    const bounds=await preview.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1,'Preview must fit screen');
    const enter=preview.locator('.launch-solid');await enter.scrollIntoViewIfNeeded();assert.ok(await enter.isVisible());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(index===0&&width===390)await page.screenshot({path:'qa/entrada-directa/touch-overlay-390.png'});
    await preview.locator('.launch-preview-close').tap();await preview.waitFor({state:'detached'});
    await entries.nth(index).waitFor({state:'visible'});
   }
   console.log(`PASS ${width}x${height}: preview replaces original without gap, Enter and close accessible`);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
