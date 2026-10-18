const assert=require('node:assert/strict'),fs=require('node:fs');
const {build}=require('esbuild');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.PANELLAB_URL||'http://127.0.0.1:4322/';
const report={checks:[],errors:[],viewports:[]},pass=s=>report.checks.push(s);
(async()=>{
 await build({entryPoints:['src/data/learning.ts','src/data/cade.ts'],bundle:true,platform:'node',format:'cjs',outdir:'qa/recorridos/model',outExtension:{'.js':'.cjs'},logLevel:'silent'});
 const {learningModel,routePairs,netForLine,LABEL_BINDINGS}=require('./recorridos/model/learning.cjs'),{CADE_SYMBOLS}=require('./recorridos/model/cade.cjs');
 const model=learningModel();assert.equal(LABEL_BINDINGS['-SB2:13'],'BOTONERAS:S3:3');assert.equal(LABEL_BINDINGS['-SB2:14'],'BOTONERAS:S3:4');
 const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
 await page.goto(url+'?view=simulator');await page.locator('.board-svg').waitFor();await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();
 const settle=async()=>{await page.waitForTimeout(350);await page.waitForFunction(()=>[...document.querySelectorAll('.board-svg,.cade-artboard>svg')].every(e=>e.dataset.animating!=='true')&&document.getAnimations().every(a=>a.effect?.getComputedTiming().iterations===Infinity||a.playState!=='running'))};
 const line=async id=>{await page.locator('.cade-controls').evaluate(e=>e.open=true);await page.getByRole('button',{name:'Mando',exact:true}).click();await settle();await page.locator(`[data-cade-wire="${id}"]`).focus();await page.keyboard.press('Enter');await settle()};
 await line(42);const expected=routePairs([netForLine(42,model)],[]);assert.ok(expected.length>=2);assert.equal(await page.locator('.ghost-cable').count(),expected.length);
 const ghosts=await page.locator('.ghost-cable').evaluateAll(es=>es.map(e=>[e.dataset.ghostFrom,e.dataset.ghostTo]));assert.deepEqual(ghosts,expected.map(r=>[r.from,r.to]));assert.equal(await page.locator('.interactive-wire').count(),0);
 assert.ok(ghosts.flat().includes('BOTONERAS:S3:4'));assert.ok(ghosts.flat().includes('CONTACTOR_TERMICO:A1'));pass('Selecting CADe line 42 automatically shows every known branch, including right green SB2, without installing cables');
 await page.getByRole('button',{name:'Ver bornes',exact:true}).click();assert.ok(await page.locator('.cade-route-details').evaluate(e=>e.open));assert.match(await page.locator('.cade-route-details').innerText(),/-H1:X1/);assert.equal(await page.getByRole('combobox',{name:'Borne físico -SB2:14',exact:true}).inputValue(),'BOTONERAS:S3:4');
 await page.getByRole('combobox',{name:'Borne físico -H1:X1',exact:true}).selectOption('BOTONERAS:PILOTO_1');assert.equal(await page.locator('.ghost-cable').count(),expected.length+1);await page.getByRole('combobox',{name:'Borne físico -H1:X1',exact:true}).selectOption('');assert.equal(await page.locator('.ghost-cable').count(),expected.length);pass('Visible selected-network mapping explains missing pilot and updates every route on assign/clear');
 await line(83);assert.equal(await page.locator('.ghost-cable').count(),0);assert.match(await page.locator('.cade-route-toolbar').innerText(),/bornes pendientes/);pass('Unknown supply endpoint stays pending; no invented route or thermal 95-96 bridge');
 await line(25);assert.equal(await page.locator('.ghost-cable').count(),routePairs([netForLine(25,model)],[]).length);
 // Use native mouse selection of a symbol, in the general Mando view.
 await page.getByRole('button',{name:'Mando',exact:true}).click();await settle();const sb2=CADE_SYMBOLS.find(o=>o.reference==='-SB2');await page.locator(`[data-cade-symbol="${sb2.id}"]`).click();await settle();assert.match(await page.locator('.cade-route-toolbar').innerText(),/Componente -SB2/);assert.ok(await page.locator('.ghost-cable').count()>=3);pass('Mouse selection of SB2 synchronizes its separate input/output networks with the bank');
 await page.keyboard.press('Escape');await page.locator('.diagram-more>summary').click();await page.getByRole('button',{name:'Todas las rutas',exact:true}).click();assert.equal(await page.locator('.ghost-cable').count(),routePairs(model,[]).length);pass('All-routes view includes every identified network, keeping unassigned endpoints explicit');
 await page.screenshot({path:'qa/recorridos/todas-desktop.png'});
 await line(42);await page.getByRole('button',{name:'Conectar cables',exact:true}).click();const first=expected[0];
 const search=async id=>{await page.getByRole('textbox',{name:'Buscar un borne o componente'}).fill(id);await page.locator('.search-results button').first().click()};
 await search(first.from);await search(first.to);assert.equal(await page.locator('.interactive-wire').count(),1);assert.equal(await page.locator('.ghost-cable').count(),expected.length-1);assert.equal(await page.locator('[data-route-wire]').count(),1);await page.getByRole('button',{name:'Deshacer',exact:true}).click();assert.equal(await page.locator('.ghost-cable').count(),expected.length);pass('Installing a preview cable removes only its silhouette and highlights real cable; undo restores route');
 await page.getByRole('button',{name:'Ajustar al tablero',exact:true}).click();await settle();await page.locator('.cade-controls').evaluate(e=>e.open=false);
 for(const viewport of [{width:1920,height:1080},{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:360,height:800},{width:844,height:390}]){
  await page.setViewportSize(viewport);await settle();
  const before=await page.locator('.cade-route-toolbar').boundingBox();await page.locator('.diagram-pane-body').evaluate(e=>e.scrollTop=e.scrollHeight);assert.deepEqual(await page.locator('.cade-route-toolbar').boundingBox(),before);
  const frame=await page.locator('.diagram-pane').evaluate(p=>{const r=p.getBoundingClientRect(),t=p.querySelector('.cade-route-toolbar').getBoundingClientRect(),b=p.querySelector('.diagram-pane-body').getBoundingClientRect();return {fits:r.left>=0&&r.right<=innerWidth+1&&(p.closest('.diagram-window')?t.bottom<=innerHeight+1:r.bottom<=innerHeight+1),toolbar:t.top>=r.top&&t.bottom<=r.bottom,body:b.height>8&&b.top>=t.bottom-1&&b.bottom<=r.bottom+1,overflow:p.scrollWidth>p.clientWidth+1||document.documentElement.scrollWidth>innerWidth}});
  assert.ok(frame.fits&&frame.toolbar&&frame.body&&!frame.overflow,JSON.stringify({viewport,frame}));report.viewports.push(viewport);
  await page.locator('.diagram-pane-body').evaluate(e=>e.scrollTop=0);if(viewport.width===390)await page.screenshot({path:'qa/recorridos/seleccion-mobile.png'});
 }
 pass('Persistent route actions and a usable single scroll area fit seven desktop/tablet/mobile/landscape sizes');
 await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Cerrar diagrama',exact:true}).first().click();
 await page.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption('CONTACTOR_TRIFASICO');await settle();await page.getByRole('button',{name:'Seleccionar',exact:true}).click();
 for(const n of ['95','96']){await page.locator(`[data-terminal-id="CONTACTOR_TRIFASICO:${n}"] .terminal-hit`).click();assert.equal(await page.locator(`[data-terminal-id="CONTACTOR_TRIFASICO:${n}"]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator(`[data-terminal-id="CONTACTOR_TERMICO:${n}"]`).count(),1)}
 await page.screenshot({path:'qa/recorridos/km2-bornes.png'});pass('KM2 95/96 are independent clickable sockets; KM1 sockets remain unchanged');
 assert.deepEqual(report.errors,[]);report.result='PASS';console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();fs.writeFileSync('qa/recorridos/verification.json',JSON.stringify(report,null,2))}
})().catch(e=>{console.error(e);process.exitCode=1});
