const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4323/';
const errors=[],pass=m=>console.log('PASS',m);
(async()=>{const browser=await chromium.launch();try{
 // ── escritorio ──
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();
 await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();
 const group=page.getByRole('group',{name:'Diagrama de CADe a estudiar'});
 assert.equal(await group.getByRole('button').count(),2,'el selector debe ofrecer dos diagramas');
 assert.equal(await group.getByRole('button',{name:'PERFECTO'}).getAttribute('aria-pressed'),'true','PERFECTO sigue siendo el diagrama por defecto');
 await page.getByRole('button',{name:'Todo',exact:true}).click();assert.equal(await page.locator('[data-cade-wire]').count(),47,'PERFECTO conserva sus 47 conductores');
 assert.ok(await page.getByRole('button',{name:'Practicar paso a paso'}).isVisible(),'PERFECTO conserva la práctica guiada');
 pass('PERFECTO intacto: 47 conductores y práctica guiada');
 await group.getByRole('button',{name:'Estrella-triángulo'}).click();await page.getByRole('button',{name:'Todo',exact:true}).click();
 assert.equal(await page.locator('[data-cade-symbol]').count(),26,'símbolos del diagrama estrella-triángulo');
 assert.equal(await page.locator('[data-cade-wire]').count(),82,'conductores del diagrama estrella-triángulo');
 assert.equal(await page.getByRole('button',{name:'Practicar paso a paso'}).count(),0,'la práctica guiada es solo de PERFECTO');
 for(const ref of ['Q1','KM1','KM2','KM3','F1','M1','SB1','SB2','H1','H2','H3','H4'])assert.ok(await page.locator(`[data-cade-symbol][aria-label^="Componente ${ref} "]`).count()>0,'falta el componente '+ref);
 assert.ok(await page.locator('.cade-artboard svg text',{hasText:/^A$/}).count()>0,'el marco debe mostrar las columnas A–H');
 pass('Estrella-triángulo: 26 componentes, 82 conductores, marco y sin práctica guiada');
 // La entrada nueva del material de estudio también abre el diagrama
 await group.getByRole('button',{name:'PERFECTO'}).click();
 await page.locator('.diagram-more>summary').click();
 await page.getByRole('button',{name:/Estrella-triángulo · CADe/}).click();
 assert.equal(await group.getByRole('button',{name:'Estrella-triángulo'}).getAttribute('aria-pressed'),'true','la entrada del material debe abrir el diagrama estrella-triángulo');
 assert.equal(await page.getByRole('button',{name:/Estrella-triángulo · CADe/}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Todo',exact:true}).click();assert.equal(await page.locator('[data-cade-symbol]').count(),26);
 pass('Entrada nueva «Estrella-triángulo · CADe» en el material de estudio');
 // Selección de una línea: se resalta su red y se listan sus bornes
 await page.getByRole('button',{name:'Potencia',exact:true}).click();
 const wire=page.locator('[data-cade-wire]:visible').first();await wire.dispatchEvent('click');
 await page.locator('.cade-explanation>summary').click();
 const text=await page.locator('.cade-port-list').textContent();assert.match(text,/L1/,'la línea de L1 debe mostrar el borne L1');assert.match(text,/Q1/,'…y el borne 1 de Q1');
 pass('Seleccionar una línea muestra su red de bornes');
 // Volver a PERFECTO restablece su lector
 await group.getByRole('button',{name:'PERFECTO'}).click();assert.ok(await page.getByRole('button',{name:'Practicar paso a paso'}).isVisible());
 pass('Volver a PERFECTO restablece su práctica');
 // ── móvil: el selector funciona dentro de la ventana flotante ──
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await ctx.newPage();m.on('pageerror',e=>errors.push(e.message));
 await m.goto(base+'?view=simulator');await m.locator('.board-svg').waitFor();
 await m.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await m.locator('.diagram-window').waitFor();
 await m.getByRole('group',{name:'Diagrama de CADe a estudiar'}).getByRole('button',{name:'Estrella-triángulo'}).tap();
 await m.getByRole('button',{name:'Todo',exact:true}).tap();assert.equal(await m.locator('[data-cade-symbol]').count(),26);
 const ok=await m.evaluate(()=>{const s=document.querySelector('.cade-artboard svg').getBoundingClientRect(),w=document.querySelector('.diagram-window').getBoundingClientRect();return s.width>100&&s.left>=w.left-1&&s.right<=w.right+1});assert.ok(ok,'el diagrama debe caber en la ventana');
 pass('Móvil: el diagrama estrella-triángulo se ve y se selecciona dentro de la ventana');
 assert.deepEqual(errors,[],'errores de página: '+errors.join(' | '));
 console.log('PASS verify-estrella-ui');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
