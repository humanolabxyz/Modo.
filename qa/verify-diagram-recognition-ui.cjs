const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4336/',out='qa/diagram-recognition';
const report={checks:[],errors:[]};fs.mkdirSync(out,{recursive:true});
(async()=>{
 const m=await import('./diagram-recognition/model.mjs');m.registerModule(m.buildExtraModule('tri',3));
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();try{for(const width of [1440,390]){
   const c=await browser.newContext({viewport:{width,height:width===390?844:1000},hasTouch:width===390,isMobile:width===390,serviceWorkers:'block',reducedMotion:'reduce'}),p=await c.newPage();p.setDefaultTimeout(15000);p.on('pageerror',e=>report.errors.push(e.message));
   await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
   await p.goto(base+'?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));
   await p.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await p.locator('.cade-artboard>svg').waitFor();
   await p.screenshot({path:`${out}/${engine.name()}-${width}-initial.png`});
   const lines=width===1440?m.CADE_WIRES.map(w=>w.id):[83,23,25,47,52,94,77,106,112,17];
   for(const id of lines){
    await p.getByLabel('Zona del esquema',{exact:true}).selectOption('all');
    await p.locator(`[data-cade-wire="${id}"]`).press('Enter');
    const expected=m.routePairs([m.routeForLine(id)],[]).map(r=>[r.from,r.to].join('|')).sort();
    await p.waitForFunction(want=>JSON.stringify([...document.querySelectorAll('.ghost-cable')].map(e=>e.dataset.ghostFrom+'|'+e.dataset.ghostTo).sort())===JSON.stringify(want),expected);
    assert.doesNotMatch(await p.locator('.cade-route-toolbar').innerText(),/pendiente/i);
    assert.equal(await p.getByRole('button',{name:/Mostrar.*tablero/i}).count(),0);
   }
   report.checks.push(`${engine.name()} ${width}: ${lines.length} líneas de PERFECTO muestran el recorrido directamente, sin botón ni bornes pendientes`);
   await p.getByLabel('Zona del esquema',{exact:true}).selectOption('all');await p.locator('[data-cade-wire="83"]').press('Enter');
   const lineStyle=await p.locator('[data-cade-wire="83"] .cade-wire-stroke').evaluate(e=>({vector:getComputedStyle(e).vectorEffect,width:parseFloat(getComputedStyle(e).strokeWidth),hit:getComputedStyle(e.previousElementSibling).stroke,outline:getComputedStyle(e.parentElement).outlineStyle}));assert.equal(lineStyle.vector,'non-scaling-stroke');const labels=await p.locator('[data-cade-terminal-label]').evaluateAll(es=>es.map(e=>e.dataset.cadeTerminalLabel));assert.ok(labels.includes('2')&&labels.includes('95'));assert.ok(!labels.includes('96')&&!labels.includes('97'));assert.ok(await p.locator('[data-cade-terminal-label]').evaluateAll(es=>es.every(e=>e.tagName==='text'&&e.getAttribute('fill')==='#b84d00')));assert.equal(await p.locator('[data-cade-wire="83"] .cade-wire-stroke').getAttribute('stroke'),'#c75a04');assert.ok(lineStyle.width<=2.6);assert.equal(lineStyle.outline,'none');assert.ok(lineStyle.hit==='rgba(0, 0, 0, 0)'||lineStyle.hit==='transparent');await p.screenshot({path:`${out}/${engine.name()}-${width}-connection.png`});await p.locator('.cade-artboard').screenshot({path:`${out}/${engine.name()}-${width}-diagram-detail.png`});
   assert.equal(await p.locator('.interactive-wire').count(),0,'Consultar un diagrama no instala cables');
   // Deselecting is visual: repeating the line, background tap and Escape preserve the document.
   const beforeDeselect=await p.evaluate(()=>localStorage.getItem('panellab-practice-v2'));
   const cleared=async()=>{await p.waitForFunction(()=>!document.querySelector('.ghost-cable'));assert.equal(await p.locator('[data-cade-terminal-label]').count(),0);assert.equal(await p.locator('[data-cade-wire="83"]').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('.cade-route-toolbar').count(),0);assert.equal(await p.evaluate(()=>localStorage.getItem('panellab-practice-v2')),beforeDeselect);};
   await p.locator('[data-cade-wire="83"]').press('Enter');await cleared();
   await p.screenshot({path:`${out}/${engine.name()}-${width}-deselected.png`});
   await p.locator('[data-cade-wire="83"]').press('Enter');await p.waitForFunction(()=>document.querySelector('.ghost-cable'));
   const blank=await p.locator('.cade-artboard>svg').evaluate(svg=>{const r=svg.getBoundingClientRect();for(const fx of [.1,.25,.75,.9])for(const fy of [.3,.5,.7,.9]){const x=r.x+r.width*fx,y=r.y+r.height*fy,e=document.elementFromPoint(x,y);if(e?.closest('svg')===svg&&!e.closest('.cade-element'))return {x,y}}throw Error('No background point available')});
   if(width===390)await p.touchscreen.tap(blank.x,blank.y);else await p.mouse.click(blank.x,blank.y);await cleared();
   await p.locator('[data-cade-wire="83"]').press('Enter');await p.waitForFunction(()=>document.querySelector('.ghost-cable'));
   await p.mouse.move(blank.x,blank.y);await p.mouse.down();await p.mouse.move(blank.x+20,blank.y+12,{steps:5});await p.mouse.up();assert.ok(await p.locator('.ghost-cable').count(),'Pan preserves the selected connection');
   await p.locator('[data-cade-wire="83"]').press('Escape');await cleared();
   report.checks.push(`${engine.name()} ${width}: repetir la línea, fondo vacío y Escape deseleccionan sin cambiar el montaje; arrastrar conserva la selección`);
   // Click/tap on the actual conductor, with the drawing enlarged first.
   await p.getByRole('button',{name:'Ampliar diagrama',exact:true}).click();
   const hit=await p.locator('[data-cade-wire="83"] .cade-wire-hit').evaluate(e=>{const a=e.getPointAtLength(e.getTotalLength()*.5),b=new DOMPoint(a.x,a.y).matrixTransform(e.getScreenCTM());return {x:b.x,y:b.y}});
   if(width===390)await p.touchscreen.tap(hit.x,hit.y);else await p.mouse.click(hit.x,hit.y);
   assert.ok(await p.locator('.board-svg').isVisible());assert.equal(await p.getByRole('button',{name:'Volver al banco',exact:true}).count(),0,'La selección vuelve al tablero desde la vista ampliada');
   // The four lesson drawings use the same exact steps as Aprender.
   for(const [drawing,key] of [['simple','simple'],['inversion','inversion'],['estrella','estrellaManual'],['estrellaTimer','estrellaTimer']]){
    await p.getByLabel('Diagrama de CADe a estudiar',{exact:true}).selectOption(drawing);
    await p.waitForFunction(()=>!document.querySelector('.ghost-cable'));
    const lesson=m.LESSONS[key],index=key.startsWith('estrella')?lesson.steps.findIndex((s,i)=>[s.from,s.to].some(id=>id.startsWith('CONTACTOR_TRIFASICO_3:'))&&m.lessonTraces(lesson)[i]):0;
    const id=m.lessonTraces(lesson)[index].wires[0],expected=m.stepsForWire(lesson,id).map(s=>s.from+'|'+s.to).sort();
    await p.getByLabel('Zona del esquema',{exact:true}).selectOption('all');await p.locator(`[data-cade-wire="${id}"]`).press('Enter');
    await p.waitForFunction(want=>JSON.stringify([...document.querySelectorAll('.ghost-cable')].map(e=>e.dataset.ghostFrom+'|'+e.dataset.ghostTo).sort())===JSON.stringify(want),expected);
    if(key.startsWith('estrella'))assert.equal(await p.locator('[data-module-id="CONTACTOR_TRIFASICO_3"]').count(),1,'KM3 se añade antes de mostrar el cable');
    assert.equal(await p.getByRole('button',{name:/Mostrar.*tablero/i}).count(),0);
   }
   assert.equal(await p.locator('.interactive-wire').count(),0);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.screenshot({path:`${out}/${engine.name()}-${width}-star.png`});
   // Existing stored wiring and custom correspondence survive opening, selection and reload.
   const cable=m.createCable('BORNERA_MOTOR:W2','BORNERA_MOTOR:U2',[]),doc={...m.emptyPractice(),wires:[cable],learning:{...m.newLearning(),bindings:{'-SB2:13':'BOTONERAS:S3:3','-SB2:14':'BOTONERAS:S3:4'}}};
   await p.evaluate(d=>{localStorage.setItem('panellab-practice-v2',JSON.stringify(d));localStorage.removeItem('modo-panel-history-v1')},doc);
   await p.reload();await p.locator('.board-svg').waitFor();await p.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await p.getByLabel('Diagrama de CADe a estudiar',{exact:true}).selectOption('perfecto');await p.getByLabel('Zona del esquema',{exact:true}).selectOption('all');await p.locator('[data-cade-wire="25"]').press('Enter');
   await p.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===1);
   const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')));assert.deepEqual(saved.wires,doc.wires);assert.deepEqual(saved.learning.bindings,doc.learning.bindings);
   report.checks.push(`${engine.name()} ${width}: selección por ${width===390?'tacto':'mouse'}, 4 lecciones, KM3, guardado y correspondencias personales conservados`);
   await c.close();
  }}finally{await browser.close()}
 }
 assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{fs.writeFileSync(out+'/ui-results.json',JSON.stringify({...report,failure:e.stack},null,2));console.error(e);process.exit(1)});
