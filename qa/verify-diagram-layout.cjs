const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4323/';
const report={checks:[],errors:[],viewports:[]};const pass=s=>report.checks.push(s);
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});page.on('requestfailed',r=>report.errors.push(r.url()+': '+r.failure()?.errorText));
 await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('[data-terminal-id]').count(),94);assert.equal(await page.locator('[data-module-id]').count(),6);
 assert.match(await page.locator('[data-module-id="CONTACTOR_TERMICO"]').textContent(),/KM1/);assert.match(await page.locator('[data-module-id="CONTACTOR_TRIFASICO"]').textContent(),/KM2/);
 await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.getByRole('button',{name:'Practicar paso a paso',exact:true}).click();await page.locator('.lesson-settings>summary').click();await page.locator('.cade-controls>summary').click();
 await page.locator('.lesson-mappings>summary').click();assert.equal(await page.getByRole('combobox',{name:'Correspondencia -KM1:11',exact:true}).inputValue(),'CONTACTOR_TERMICO:71');assert.equal(await page.getByRole('combobox',{name:'Correspondencia -KM1:12',exact:true}).inputValue(),'CONTACTOR_TERMICO:72');assert.equal(await page.getByRole('combobox',{name:'Correspondencia -F:95',exact:true}).inputValue(),'CONTACTOR_TERMICO:95');assert.equal(await page.getByRole('combobox',{name:'Correspondencia -F:96',exact:true}).inputValue(),'CONTACTOR_TERMICO:96');
 pass('Confirmed KM1/KM2 identities, 11→71 / 12→72 and distinct thermal 95/96 associations');
 const checkFrame=async expanded=>{
  await page.waitForTimeout(350);await page.waitForFunction(()=>document.getAnimations().every(a=>a.effect?.getComputedTiming().iterations===Infinity||a.playState!=='running'));
  const result=await page.locator('.diagram-pane').evaluate((pane,expanded)=>{
   const body=pane.querySelector('.diagram-pane-body'),header=pane.querySelector('.diagram-pane-actions'),tabs=pane.querySelector(':scope>.diagram-tabs');
   const r=pane.getBoundingClientRect(),b=body.getBoundingClientRect(),h=header.getBoundingClientRect(),t=tabs?.getBoundingClientRect();
   const overlap=(a,z)=>a.left<z.right-1&&a.right>z.left+1&&a.top<z.bottom-1&&a.bottom>z.top+1;
   const conflicts=[...document.querySelectorAll('.topbar,.workspace-navigation,.searchbox-wrap,.stage-topline,.work-card>.work-tools,.tool-dock,.zoom-toolbar')].filter(e=>getComputedStyle(e).display!=='none'&&e.getClientRects().length&&!e.closest('details:not([open])')&&(!expanded||!e.closest('.stage-wrap,.filterbar'))).filter(e=>overlap(r,e.getBoundingClientRect())).map(e=>e.className);
   const extra=[...body.querySelectorAll('*')].filter(e=>getComputedStyle(e).overflowY==='auto'&&e.scrollHeight>e.clientHeight+1).map(e=>e.className);
   return {bounds:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&(pane.closest('.diagram-window')?h.bottom<=innerHeight+1:r.bottom<=innerHeight+1),bodyFits:b.top>=h.bottom-1&&(!t||b.top>=t.bottom-1)&&b.bottom<=r.bottom+1,headerVisible:h.top>=r.top&&h.bottom<=r.bottom,overflows:body.scrollWidth>body.clientWidth+1,conflicts,extra,display:getComputedStyle(pane).display,bodyScroll:body.scrollHeight>body.clientHeight};
  },expanded);
  assert.ok(result.bounds,JSON.stringify(result));assert.ok(result.bodyFits,JSON.stringify(result));assert.ok(result.headerVisible);assert.equal(result.overflows,false);assert.deepEqual(result.conflicts,[],JSON.stringify({viewport:page.viewportSize(),expanded,result}));assert.deepEqual(result.extra,[]);assert.equal(result.display,'grid');assert.ok(result.bodyScroll);
  const before=await page.locator('.diagram-pane-actions').boundingBox();await page.locator('.diagram-pane-body').evaluate(e=>e.scrollTop=e.scrollHeight);assert.deepEqual(await page.locator('.diagram-pane-actions').boundingBox(),before,'Scrolling content must not move its header');await page.getByRole('button',{name:'Cerrar diagrama',exact:true}).last().hover();await page.locator('.diagram-pane-body').evaluate(e=>e.scrollTop=0);
 };
 for(const viewport of [{width:1920,height:1080},{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:360,height:800},{width:844,height:390}]){
  await page.setViewportSize(viewport);await checkFrame(false);await page.getByRole('button',{name:'Ampliar diagrama',exact:true}).click();await checkFrame(true);
  if(viewport.width===1440)await page.screenshot({path:'qa/diagrama-layout/despues-ampliado.png'});if(viewport.width===390)await page.screenshot({path:'qa/diagrama-layout/despues-mobile-ampliado.png'});
  await page.getByRole('button',{name:'Volver al banco',exact:true}).click();await checkFrame(false);if(viewport.width===1440)await page.screenshot({path:'qa/diagrama-layout/despues-desktop.png'});
  report.viewports.push(viewport);
 }
 pass('Expanded tools and all mappings: one content scrollbar, stable accessible header, no overlap or horizontal overflow in desktop/tablet/mobile/landscape');
 assert.ok(await page.evaluate(()=>document.fonts.check('600 14px "Source Sans 3"')));assert.match(await page.getByRole('button',{name:'Abrir diagrama',exact:true}).count()?'':await page.getByRole('button',{name:'Cerrar diagrama',exact:true}).first().evaluate(e=>getComputedStyle(e).fontFamily),/Source Sans 3/);
 await page.setViewportSize({width:1440,height:900});assert.ok(parseFloat(await page.getByRole('button',{name:'Ampliar diagrama',exact:true}).evaluate(e=>getComputedStyle(e).fontSize))>=13);pass('Local Source Sans 3 actually loads; primary diagram button text is at least 13px');
 if(await page.locator('.diagram-more').getAttribute('open')===null)await page.locator('.diagram-more>summary').click();await page.getByRole('button',{name:'Guía interactiva',exact:false}).click();await page.locator('.teacher-material:not(.exam-reference)>summary').click();await page.getByRole('button',{name:'Mando',exact:true}).click();assert.match(await page.locator('.teacher-material img').getAttribute('src'),/circuito-mando/);await page.getByRole('button',{name:'Bornes en estrella',exact:true}).click();assert.match(await page.locator('.teacher-material img').getAttribute('src'),/bornes-estrella/);
 await page.locator('.exam-reference>summary').click();await page.locator('.exam-networks>summary').click();assert.equal(await page.locator('.exam-networks>section').count(),7);assert.match(await page.locator('.exam-reference').textContent(),/11 es 71 y 12 es 72/);assert.match(await page.locator('.exam-reference').textContent(),/PERFECTO difieren/);await page.locator('.exam-reference').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/diagrama-layout/conectores-prueba-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Ampliar diagrama',exact:true}).click();await page.locator('.exam-reference').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/diagrama-layout/conectores-prueba-mobile.png'});
 await page.getByRole('button',{name:'Ver 95 · módulo KM1 con térmico',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');assert.equal(await page.locator('[data-terminal-id="CONTACTOR_TERMICO:95"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-terminal-id="CONTACTOR_TERMICO:96"]').count(),1);assert.equal(await page.locator('.interactive-wire').count(),0,'Locating protection must not install a bridge');
 const pdf=await page.request.get(base+'materiales/actividad-1-u2.pdf');assert.ok(pdf.ok());const original=fs.readFileSync('C:/Users/HUMANO LAB/Downloads/materal/Administracion/Actividad 1 U2 (1).pdf');assert.equal(crypto.createHash('sha256').update(await pdf.body()).digest('hex'),crypto.createHash('sha256').update(original).digest('hex'));
 pass('Professor PDF preserved byte-for-byte; four source figures, separate exam connector reference, seven control networks, and locating 95 creates no 95–96 bridge');
 assert.deepEqual(report.errors,[]);
 }finally{await browser.close()}
 fs.writeFileSync('qa/diagrama-layout/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{report.errors.push(e.stack);fs.writeFileSync('qa/diagrama-layout/verification.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1});
