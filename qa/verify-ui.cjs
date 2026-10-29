const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
// Reuse the host runtime; Playwright is QA tooling, not an application dependency.
let chromium;
try{({chromium}=require('playwright'))}catch{
 ({chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')));
}
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4322';
const model=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/panel-model.json'),'utf8'));
const report={url:base,checks:[],errors:[],viewports:[],selectedTerminals:0};
const pass=(label)=>report.checks.push(label);
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1100}});
  const page=await context.newPage();page.on('dialog',d=>d.accept());
 const settleCanvas=()=>page.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text())});
  page.on('requestfailed',r=>report.errors.push(r.url()+': '+r.failure()?.errorText));
  await page.goto(base+'?view=simulator');
  await page.locator('.terminal').first().waitFor();
  await page.waitForFunction(()=>document.querySelector('astro-island')?.hasAttribute('ssr')===false);
  const enterPanel=async()=>{const card=page.getByRole('button',{name:'Abrir panel de control'});await card.waitFor({timeout:10000});await card.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelectorAll('.terminal').length===94)};
  const focusModule=async id=>{const c=page.getByRole('combobox',{name:'Enfocar un módulo',exact:true});if(!(await c.isVisible()))await page.locator('.practice-menu>summary').evaluate(e=>e.click());await c.selectOption(id)};
  const details=async()=>{const d=page.locator('.terminal-details');await d.waitFor({state:'attached'});if(await d.getAttribute('open')===null)await d.locator(':scope > summary').click();await page.waitForFunction(()=>document.querySelector('.terminal-details')?.open===true)};
  const inspectSelected=async()=>{await page.getByRole('button',{name:'Seleccionar',exact:true}).click();await settleCanvas();await page.waitForTimeout(400);await page.locator('.terminal[aria-pressed=true] .terminal-hit').first().click({timeout:10000}).catch(async()=>{await page.waitForTimeout(1000);await page.locator('.terminal[aria-pressed=true] .terminal-hit').first().click({force:true})});await details()};
  assert.equal(await page.locator('.terminal').count(),94);
  assert.equal(await page.locator('.board-module').count(),6);
  assert.equal(await page.locator('[data-cable-id]').count(),0);
  pass('6 visible modules, 94 interactive terminals, empty panel without demo cables');
  const collisions=await page.locator('.board-module').evaluateAll(ms=>ms.flatMap(m=>{
   const ts=[...m.querySelectorAll('.terminal')];
   const labelLayer=m.closest('svg').querySelector(`[data-module-labels="${m.dataset.moduleId}"]`);
   return [...labelLayer.querySelectorAll('[data-label-for]')].flatMap(a=>{const label=a.getBBox();return ts.flatMap(b=>{
    const circle=b.querySelector('.terminal-hit');const x=+circle.getAttribute('cx'),y=+circle.getAttribute('cy'),r=14;
    return label.x<x+r&&label.x+label.width>x-r&&label.y<y+r&&label.y+label.height>y-r?[a.dataset.labelFor+' / '+b.dataset.terminalId]:[];
   })});
  }));
  assert.deepEqual(collisions,[],'Terminal labels must not cover any socket');
  pass('SVG terminal labels do not overlap socket faces');
  assert.equal(await page.locator('[data-label-for]').count(),94);
  for(const m of model.modules)for(const t of m.terminals){
   const label=page.locator(`[data-label-for="${m.id}:${t.id}"]`);
   const expected=t.id.match(/^S[123]:([1234])$/)?.[1]||t.id.replace('PILOTO_','P').replace(/^TP_.+$/,'TP');
   assert.equal(await label.textContent(),expected,m.id+':'+t.id+' printed number');
   assert.equal(await label.getAttribute('font-size'),'16');
  }
  pass('94 complete printed labels at 16 SVG units, independently associated with each terminal');
  for(const m of model.modules){
   const boundsErrors=await page.locator(`[data-module-labels="${m.id}"] [data-label-for]`).evaluateAll((labels,size)=>labels.filter(el=>{
    const b=el.getBBox();return b.x<0||b.y<0||b.x+b.width>size.w||b.y+b.height>size.h;
   }).map(el=>el.dataset.labelFor),{w:m.w,h:m.h});
   assert.deepEqual(boundsErrors,[],m.id+' labels inside physical face');
  }
  for(const number of ['95','96']){
   const label=page.locator(`[data-label-for="CONTACTOR_TERMICO:${number}"]`);
   assert.ok((await label.boundingBox()).height>=12,number+' overview glyph height');
  }
  pass('All labels remain inside their module; 95 and 96 have at least 12 px glyph height in desktop overview');
  for(const [query,count] of [['95',2],['96',2],['97',1],['98',1],['55',1],['56',1],['67',1],['68',1],['A1',3],['13',3],['S2:3',1],['BOTONERAS:S2:3',1]]){
   await page.getByRole('textbox',{name:'Buscar un borne o componente'}).fill(query);
   assert.equal(await page.locator('.search-results button').count(),count,query);
   for(const id of await page.locator('.search-results small').allTextContents())assert.ok(await page.locator('.selected-ring').count()>=1,query+' highlights');
   await page.locator('.search-results button').first().click();
   await details();{const t=await page.locator('.info-lines').innerText();assert.ok(t.includes(query),query+' => '+t.slice(0,200))}
   pass('Search + canvas highlight + inspector: '+query);
  }
  await page.getByRole('textbox',{name:'Buscar un borne o componente'}).fill('inexistente');
  assert.ok(await page.locator('.search-empty').isVisible());
  await page.getByRole('textbox',{name:'Buscar un borne o componente'}).press('Escape');
  pass('Empty search and Escape');
  const selectModule=async id=>{await focusModule(id);await inspectSelected()};
  const a1ids=[];
  for(const m of model.modules){
   await selectModule(m.id);
   for(const t of m.terminals){
    const id=m.id+':'+t.id;
    const terminal=page.locator(`[data-terminal-id="${id}"]`);
    if(await page.getByRole('button',{name:'Cerrar inspector'}).count())await page.getByRole('button',{name:'Cerrar inspector'}).click();await terminal.locator('.terminal-hit').click();
    assert.equal(await terminal.getAttribute('aria-pressed'),'true',id);
    await details();assert.ok((await page.locator('.info-lines').innerText()).includes(id),id+' inspector');
    assert.equal(await page.getByRole('combobox',{name:'Seleccionar borne del módulo'}).inputValue(),id);
    if(t.verification!=='foto')assert.match(await page.locator('.verification').innerText(),t.verification==='usuario'?/Indicado por ti/:/confirmar/);
    if(t.id==='A1')a1ids.push(id);
    report.selectedTerminals++;
   }
   await page.getByRole('button',{name:'Ajustar al tablero'}).click();await settleCanvas();
  }
  assert.equal(new Set(a1ids).size,3);
  pass('All 94 terminals selected by physical click, correct inspector, confidence and independent A1 IDs');
  await selectModule('BOTONERAS');
  const keyPort=page.locator('[data-terminal-id="BOTONERAS:S3:4"]');
  await keyPort.focus();await page.keyboard.press('Enter');
  assert.equal(await keyPort.getAttribute('aria-pressed'),'true');
  await page.getByRole('combobox',{name:'Seleccionar borne del módulo'}).selectOption('BOTONERAS:S2:3');
  assert.ok((await page.locator('.info-lines').innerText()).includes('BOTONERAS:S2:3'));
  pass('Keyboard Enter and native terminal selector');
  await page.getByRole('button',{name:'Ajustar al tablero'}).click();await settleCanvas();
  const initial=await page.locator('.board-svg').getAttribute('viewBox');
  await page.getByRole('button',{name:'Acercar',exact:true}).click();await settleCanvas();
  assert.notEqual(await page.locator('.board-svg').getAttribute('viewBox'),initial);
  await page.getByRole('button',{name:'Alejar',exact:true}).click();await settleCanvas();
  await page.getByRole('button',{name:'Ajustar al tablero'}).click();await settleCanvas();
  const canvas=page.locator('.board-svg');const rect=await canvas.boundingBox();
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+80,rect.y+rect.height/2+40,{steps:5});await page.mouse.up();
  assert.notEqual(await canvas.getAttribute('viewBox'),initial);
  await canvas.focus();await page.keyboard.press('Home');await settleCanvas();
  assert.equal(await canvas.getAttribute('viewBox'),initial);
  await page.keyboard.press('ArrowRight');await settleCanvas();
  assert.notEqual(await canvas.getAttribute('viewBox'),initial);
  await page.getByRole('button',{name:'Ajustar al tablero'}).click();await settleCanvas();
  pass('Zoom in/out/reset; mouse pan and keyboard arrows/Home');
  await selectModule('CONTACTOR_TRIFASICO');
  await details();
  await page.getByLabel('Código en diagrama (p. ej., KM1)').fill('KM_ESTUDIO');
  await page.getByRole('button',{name:'Guardar',exact:true}).click();
  await page.getByRole('textbox',{name:'Buscar un borne o componente'}).fill('KM_ESTUDIO');
  assert.equal(await page.locator('.search-results button').count(),22);
  for(const id of (await page.locator('.search-results small').allTextContents()).filter(t=>t.includes(':')))assert.equal(await page.locator(`[data-terminal-id="${id}"] .selected-ring`).count(),1,id+' rings='+await page.locator('.selected-ring').count()+' term='+await page.locator(`[data-terminal-id="${id}"]`).count());
  await page.locator('.search-results button').first().click();
  await page.reload();await page.waitForFunction(()=>document.querySelector('astro-island')?.hasAttribute('ssr')===false);
  await inspectSelected();await page.locator('.info-lines').getByText('KM_ESTUDIO · etiqueta personal por confirmar',{exact:true}).waitFor();
  assert.ok((await page.locator('.info-lines').innerText()).includes('KM_ESTUDIO · etiqueta personal por confirmar'));
  await page.getByRole('button',{name:'Inicio',exact:true}).click();
  await page.getByRole('button',{name:'Abrir panel de control'}).waitFor({timeout:10000});
  await enterPanel();
  await page.getByRole('button',{name:'Seleccionar',exact:true}).click();
  await inspectSelected();assert.ok((await page.locator('.info-lines').innerText()).includes('CONTACTOR_TRIFASICO'));
  pass('Personal aliases, search all matches, reload persistence and Inicio/continue');
  await page.getByRole('button',{name:'Ampliar fotografía',exact:true}).click();
  const photo=page.locator('.floating-help[role="dialog"]');assert.ok(await photo.isVisible());
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(()=>!!document.activeElement.closest('.floating-help')),'el foco entra en la ventana de la fotografía');
  await page.keyboard.press('Escape');assert.equal(await photo.count(),0);
  pass('Photo modal, keyboard focus trap and Escape');
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.getByRole('button',{name:'Material de estudio',exact:true}).click();await page.getByRole('button',{name:'Mi diagrama',exact:false}).click();
  assert.ok(await page.locator('.diagram-pane').count());
  pass('Actual diagram reference is opened on request');
  await page.locator('.practice-menu>summary').click();await page.locator('.module-filters>summary').click();
  await page.getByRole('tab',{name:'Botoneras',exact:true}).click();
  assert.equal(await page.locator('[data-module-id="FUENTE"]').getAttribute('opacity'),'0.2');
  await page.getByRole('tab',{name:'Todos',exact:true}).click();
  pass('Module filters');await page.locator('.practice-menu>summary').click();
  // Clean study labels for deliverable screenshots, preserving real user storage outside this context.
  await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.waitForFunction(()=>document.querySelector('astro-island')?.hasAttribute('ssr')===false);
  await inspectSelected();await page.locator('.info-lines').waitFor();
  await page.screenshot({path:path.join(__dirname,'despues-desktop.png'),fullPage:true});
  for(const m of model.modules){
   await focusModule(m.id);
   await page.locator('.svg-surface').screenshot({path:path.join(__dirname,'modulo-'+m.id.toLowerCase()+'.png')});
  }
  await page.getByRole('button',{name:'Ajustar al tablero'}).click();await settleCanvas();
  for(const viewport of [{width:1920,height:1080},{width:768,height:1024},{width:390,height:844},{width:360,height:800}]){
   await page.setViewportSize(viewport);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),JSON.stringify(viewport)+' overflow');
   await focusModule('BOTONERAS');
   await inspectSelected();
   await page.getByRole('combobox',{name:'Seleccionar borne del módulo'}).selectOption('BOTONERAS:S3:1');
   await details();assert.ok((await page.locator('.info-lines').innerText()).includes('BOTONERAS:S3:1'));
   report.viewports.push(viewport);
   if(viewport.width===390){
    await page.screenshot({path:path.join(__dirname,'mobile-botoneras.png'),fullPage:true});
    await page.getByRole('button',{name:'Ajustar al tablero'}).click();await settleCanvas();
    await page.screenshot({path:path.join(__dirname,'despues-mobile.png'),fullPage:true});
    await page.getByRole('button',{name:'Inicio',exact:true}).click();
    await page.screenshot({path:path.join(__dirname,'inicio-mobile.png'),fullPage:true});
    await enterPanel();
   }
  }
  pass('Desktop 1440/1920, tablet 768, mobile 390/360: no page overflow and functioning inspector');
  // Genuine touch events in an independent mobile context.
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const touch=await mobile.newPage();touch.on('dialog',d=>d.accept());await touch.goto(base+'?view=simulator');await touch.waitForFunction(()=>document.querySelector('astro-island')?.hasAttribute('ssr')===false);
  await touch.waitForFunction(()=>document.querySelectorAll('.terminal').length===94);await touch.locator('.practice-menu>summary').tap();await touch.getByRole('combobox',{name:'Enfocar un módulo',exact:true}).selectOption('BOTONERAS');
  await touch.locator('[data-terminal-id="BOTONERAS:S2:3"] .terminal-hit').tap();
  await touch.locator('.terminal-details>summary').tap();
  assert.ok((await touch.locator('.info-lines').innerText()).includes('BOTONERAS:S2:3'));
  await touch.getByRole('button',{name:'Mover vista',exact:true}).tap();await touch.locator('.board-svg').scrollIntoViewIfNeeded();
  const beforeTouch=await touch.locator('.board-svg').getAttribute('viewBox');
  const cdps=await mobile.newCDPSession(touch);
  const box=await touch.locator('.board-svg').boundingBox();
  const x=box.x+box.width*.85,y=box.y+box.height*.75;
  await cdps.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await cdps.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-45,y:y-30}]});
  await cdps.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.notEqual(await touch.locator('.board-svg').getAttribute('viewBox'),beforeTouch);
  await mobile.close();pass('Mobile touch: physical terminal tap and canvas drag');
  assert.equal(report.errors.length,0,report.errors.join('\n'));
  pass('No browser exceptions, failed requests or console errors');
  fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(error=>{report.errors.push(error.stack);fs.writeFileSync(path.join(__dirname,'verification.json'),JSON.stringify(report,null,2));console.error(error);process.exitCode=1});
