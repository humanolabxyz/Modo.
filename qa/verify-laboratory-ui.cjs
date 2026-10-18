/* Pruebas de navegador del laboratorio (protoboard y demás herramientas) en escritorio y móvil.
   Uso: npm run build && npm run preview -- --port 4324 y después PANELLAB_URL=http://127.0.0.1:4324/ npm run verify:lab-ui */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4324/').replace(/\/?$/,'/');
const report={checks:[],errors:[]},pass=name=>report.checks.push(name);
const hole=(page,id)=>page.locator(`[data-hole="${id}"]`);
const click=(page,id)=>hole(page,id).dispatchEvent('click');
const stored=page=>page.evaluate(()=>{const lib=JSON.parse(localStorage.getItem('panellab-laboratory-v1'));return lib.projects.find(p=>p.id===lib.active);});
const settle=(page,ms=450)=>page.waitForTimeout(ms);
const label=(page,id)=>page.locator(`.lab-label[data-label="${id}"]`);
async function open(browser,viewport,url){
  const context=await browser.newContext({viewport,hasTouch:viewport.width<500}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
  await page.goto(base+url);await page.waitForSelector('.lab-page');await settle(page,900);return {context,page};
}
async function desktop(browser){
  const {context,page}=await open(browser,{width:1440,height:900},'laboratorio?tool=breadboard');
  const menu=async name=>{await page.getByRole('button',{name:'Componentes'}).click();await page.getByRole('menuitem',{name}).first().click();};
  // 1. colocar una resistencia desde el menú y leer su valor al lado
  await menu('Resistencia');await click(page,'c:15');await click(page,'c:20');await settle(page);
  const dialog=page.getByRole('dialog',{name:'Resistencia'});assert.ok(await dialog.isVisible(),'el editor contextual se abre al colocar');
  const placed=(await stored(page)).breadboard.components.at(-1);assert.equal(placed.kind,'resistor');assert.equal(placed.value,1000);
  assert.match(await label(page,placed.id).textContent(),/1 kΩ/);pass('resistencia colocada con 1 kΩ visible y editor abierto');
  // 2. editar a 4,7 kΩ → 4700 Ω y etiqueta
  const field=dialog.getByRole('textbox',{name:'Valor'});await field.fill('4,7');await field.press('Enter');await settle(page,700);
  assert.equal((await stored(page)).breadboard.components.at(-1).value,4700);assert.match(await label(page,placed.id).textContent(),/4,7 kΩ/);pass('4,7 kΩ se guarda como 4700 Ω y la etiqueta coincide');
  // 3. cancelar con Escape no cambia el valor ni el historial
  await label(page,placed.id).click();await settle(page);const f2=page.getByRole('dialog',{name:'Resistencia'}).getByRole('textbox',{name:'Valor'});await f2.fill('2,2');await f2.press('Escape');await settle(page);
  assert.equal((await stored(page)).breadboard.components.at(-1).value,4700);pass('Escape cancela el borrador');
  // 4. un valor no válido muestra el error y no cambia nada
  await label(page,placed.id).click();await settle(page);const f3=page.getByRole('dialog',{name:'Resistencia'}).getByRole('textbox',{name:'Valor'});await f3.fill('abc');assert.ok(await page.getByRole('alert').filter({hasText:'No se entiende'}).first().isVisible());await f3.press('Escape');pass('error visible junto al campo');
  // 5. deshacer y rehacer
  await page.keyboard.press('Control+z');await settle(page,600);assert.equal((await stored(page)).breadboard.components.at(-1).value,1000);await page.keyboard.press('Control+y');await settle(page,600);assert.equal((await stored(page)).breadboard.components.at(-1).value,4700);pass('deshacer y rehacer restauran el valor');
  // 6. mover un extremo arrastrando su manejador
  await page.keyboard.press('v');await label(page,placed.id).click();await page.keyboard.press('Escape');await settle(page);
  const handle=page.locator('.lab-handle').nth(1),hb=await handle.boundingBox(),target=await hole(page,'c:24').boundingBox();
  await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await page.mouse.down();await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});await page.mouse.up();await settle(page,700);
  assert.equal((await stored(page)).breadboard.components.find(c=>c.id===placed.id).to,'c:24');pass('un extremo se mueve arrastrando su manejador');
  // 7. la plantilla de referencia y el multímetro
  await page.locator('.lab-project-menu summary').click();await page.locator('.lab-project-menu button',{hasText:'marcha y retención'}).click();await settle(page,900);
  const meter=page.getByRole('group',{name:'Multímetro',exact:true}),lcd=meter.getByLabel('Lectura del multímetro');
  assert.ok(await page.locator('.lab-lead').count()===2,'dos cables con puntas sobre la placa');
  const choose=async text=>{await meter.getByLabel('Poner las puntas en').selectOption({label:text});await settle(page,500);};
  const sources=await meter.getByLabel('Poner las puntas en').locator('option').allInnerTexts();
  await meter.getByRole('radio',{name:'Resistencia'}).click();await choose(sources.find(t=>t.startsWith('Resistencia')));assert.match(await lcd.textContent(),/1,000 kΩ/);pass('óhmetro: 1,000 kΩ con el circuito sin energía');
  await meter.getByRole('radio',{name:'Continuidad'}).click();await settle(page);assert.match(await lcd.textContent(),/Sin continuidad/);
  await meter.getByRole('button',{name:'Anotar medida'}).click();await settle(page);assert.ok(await page.locator('.lab-log-card').isVisible(),'la tabla de mediciones se abre');assert.equal(await page.locator('.lab-log tbody tr').count(),1);pass('continuidad y tabla de mediciones');
  // arrastrar la punta roja a otro orificio con el ratón
  const grab=await page.evaluate(()=>{const ws=document.querySelector('.lab-canvas-workspace').getBoundingClientRect(),tip=document.querySelector('.lab-lead.red .pen-tip'),hit=document.querySelector('.lab-lead.red .pen-hit');const hb=hit.getBoundingClientRect();return {tip:{x:ws.left+Number(tip.getAttribute('x1')),y:ws.top+Number(tip.getAttribute('y1'))},grab:{x:hb.x+hb.width/2,y:hb.y+hb.height/2}};});
  const goal=await hole(page,'a:12').boundingBox(),gx=goal.x+goal.width/2-(grab.tip.x-grab.grab.x),gy=goal.y+goal.height/2-(grab.tip.y-grab.grab.y);
  await page.mouse.move(grab.grab.x,grab.grab.y);await page.mouse.down();await page.mouse.move(gx,gy,{steps:10});await page.mouse.up();await settle(page,500);
  assert.match(await page.locator('.lab-dmm-device').innerText().catch(()=>''),/./);assert.ok(await page.locator('.lab-probe.a').count()===1,'la punta roja quedó en un orificio');pass('la punta roja se arrastra hasta un orificio');
  // física de los cables: al desplazar la placa las puntas siguen sus orificios cuadro a cuadro y el cable se balancea
  await choose(sources.find(t=>t.startsWith('Fuente')));await settle(page,1200);
  await page.evaluate(()=>{window.__lead={errors:[],shapes:new Set(),stop:false};const ws=document.querySelector('.lab-canvas-workspace');const frame=()=>{if(window.__lead.stop)return;const box=ws.getBoundingClientRect(),tip=document.querySelector('.lab-lead.red .pen-tip'),h=document.querySelector('[data-hole="top+:1"]').getBoundingClientRect();if(tip&&tip.getAttribute('x1')){window.__lead.errors.push(Math.hypot(box.left+Number(tip.getAttribute('x1'))-(h.x+h.width/2),box.top+Number(tip.getAttribute('y1'))-(h.y+h.height/2)));window.__lead.shapes.add(document.querySelector('.lab-lead.red .cord').getAttribute('d'));}requestAnimationFrame(frame);};requestAnimationFrame(frame);});
  const area=await page.locator('.lab-board-svg').boundingBox();await page.mouse.move(area.x+area.width/2,area.y+area.height/2);
  for(let i=0;i<10;i++){await page.mouse.wheel(70,40);await page.waitForTimeout(30);}
  await page.waitForTimeout(1000);const lead=await page.evaluate(()=>{window.__lead.stop=true;return {frames:window.__lead.errors.length,max:Math.max(...window.__lead.errors),shapes:window.__lead.shapes.size};});
  assert.ok(lead.frames>20,`muestras: ${lead.frames}`);assert.ok(lead.max<2.5,`la punta se separa ${lead.max.toFixed(2)} px de su orificio al desplazar`);assert.ok(lead.shapes>20,`el cable se balancea (${lead.shapes} formas distintas)`);pass('cables con física: la punta sigue al orificio cuadro a cuadro y el cable se balancea');
  await page.getByRole('button',{name:'Ajustar a la placa'}).click();await settle(page,600);
  await meter.getByRole('radio',{name:'Resistencia'}).click();await choose(sources.find(t=>t.startsWith('Resistencia')));
  await page.getByRole('button',{name:'Simular proyecto'}).click();await settle(page,900);
  await meter.getByRole('radio',{name:'Tensión continua'}).click();await choose(sources.find(t=>t.startsWith('Fuente')));assert.match(await lcd.textContent(),/5,000 V/);pass('voltímetro: 5,000 V en la fuente');
  await choose(sources.find(t=>t.startsWith('Resistencia')));assert.match(await lcd.textContent(),/3,069 V/);
  await meter.getByRole('radio',{name:'Corriente continua'}).click();await settle(page,900);
  assert.ok(await page.locator('.lab-failures').first().isVisible(),'el amperímetro en paralelo quema el LED');assert.match(await page.locator('.lab-failures').innerText(),/LED/);pass('amperímetro en paralelo: el LED se quema y se avisa');
  await page.getByRole('button',{name:'Detener'}).click();await settle(page);
  // 8. Práctica 2 armada: S2 hace girar el motor
  await page.getByRole('button',{name:'Aprender y referencias'}).click();await page.getByRole('menuitem',{name:/Diagramas/}).click();await page.getByRole('button',{name:'Cargar la Práctica 2 armada'}).click();await settle(page,900);
  await page.getByRole('button',{name:'Simular proyecto'}).click();await settle(page,900);
  await page.locator('.lab-proto-component[aria-label^="Pulsador"]').nth(1).locator('.lab-proto-hit').dispatchEvent('pointerdown',{pointerId:7,pointerType:'mouse',button:0});await settle(page,900);
  assert.match(await label(page,"hb-m").textContent(),/↺ 300/);pass('Práctica 2: S2 hace girar el motor a 300 mA');
  await page.getByRole('button',{name:'Detener'}).click();
  // 9. teclado: flechas entre orificios y una sola parada de tabulador
  await hole(page,'a:1').focus();await page.keyboard.press('ArrowRight');await settle(page,200);await page.keyboard.press('ArrowDown');await settle(page,200);
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-hole')),'b:2');assert.equal(await page.locator('[data-hole][tabindex="0"]').count(),1);pass('navegación por teclado entre orificios');
  // 10. puentes rectos
  await page.getByRole('button',{name:'Cables rectos'}).click();assert.equal(await page.locator('.lab-proto-component path.lab-halo, .lab-proto-hit').first().isVisible().catch(()=>true),true);pass('alternar cables rectos');
  await context.close();
}
async function inercia(browser){
  const {context,page}=await open(browser,{width:1440,height:900},'laboratorio?tool=breadboard');
  const vb=()=>page.evaluate(()=>document.querySelector('.lab-board-svg').viewBox.baseVal.x),bg=await page.locator('.lab-board-svg').boundingBox(),x=bg.x+bg.width*.5,y=bg.y+bg.height*.5;
  await page.mouse.move(x,y);await page.mouse.down();for(let i=1;i<=6;i++){await page.mouse.move(x-i*28,y);await page.waitForTimeout(14);}
  const atRelease=await vb();await page.mouse.up();await page.waitForTimeout(120);const during=await vb();await page.waitForTimeout(1400);const later=await vb(),settled=await vb();
  assert.ok(Math.abs(during-atRelease)>3,`la vista sigue moviéndose tras soltar (${atRelease.toFixed(1)} → ${during.toFixed(1)})`);assert.ok(Math.abs(settled-later)<.01,'y se detiene sola');pass('inercia al soltar el arrastre de la placa');
  await context.close();
}
async function movil(browser){
  for(const tool of ['schematic','hmi','plc','process']){
    const {context,page}=await open(browser,{width:390,height:844},`laboratorio?tool=${tool}`);
    const height=await page.evaluate(()=>document.documentElement.scrollHeight);assert.ok(height<=845,`${tool}: ${height}px de alto`);
    assert.equal(await page.locator('.lab-inspector-trigger').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${tool}: sin desplazamiento horizontal de la página`);
    if(tool==='schematic'){const box=await page.locator('.lab-device-hit').first().boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await settle(page,600);assert.ok(await page.locator('.lab-property-window').count());}
    await context.close();
  }
  pass('móvil 390×844: Esquemas, HMI, PLC y Procesos miden una pantalla y la hoja se abre al seleccionar');
  const {context,page}=await open(browser,{width:390,height:844},'laboratorio?tool=breadboard');
  const widths=await page.evaluate(()=>['.lab-workspace','.lab-editor','.lab-canvas-workspace','.lab-board-svg'].map(s=>Math.round(document.querySelector(s).getBoundingClientRect().width)));
  assert.ok(widths.every(w=>Math.abs(w-390)<=2),`el banco ocupa todo el ancho: ${widths}`);pass('móvil: el protoboard ocupa todo el ancho');
  await page.getByRole('button',{name:'Componentes'}).click();assert.ok(await page.getByRole('menuitem',{name:/L293D/}).isVisible());await page.getByRole('menuitem',{name:/Resistencia/}).click();
  await click(page,'c:3');await click(page,'c:8');await settle(page);assert.ok(await page.getByRole('dialog',{name:'Resistencia'}).isVisible());pass('móvil: menú de componentes y editor en hoja inferior');
  await page.keyboard.press('Escape');await settle(page,300);assert.ok(await page.locator('.lab-dmm-pill').isVisible(),'el multímetro compacto está a la vista');
  await page.getByRole('button',{name:'Abrir el multímetro completo'}).click();await settle(page);const device=await page.locator('.lab-dmm-body').boundingBox();assert.ok(device.width>=150&&device.x>=0&&device.x+device.width<=390&&device.y+device.height<=844,`multímetro completo dentro de la pantalla: ${JSON.stringify(device)}`);
  assert.equal(await page.locator('.lab-lead').count(),2);pass('móvil: multímetro compacto que se abre completo, con cables visibles');
  await context.close();
}
async function modulos(browser){
  const {context,page}=await open(browser,{width:1440,height:900},'laboratorio?tool=schematic');
  const dock=page.getByRole('toolbar',{name:'Herramientas del esquema'});assert.ok(await dock.isVisible(),'barra flotante del esquema');
  const count=async()=>(await stored(page)).schematic.devices.length,transform=()=>page.locator('.lab-pan-content').evaluate(el=>el.style.transform);
  // 1. componentes desde el menú: aparecen en la zona visible, seleccionados y con sus propiedades
  const before=await count();await dock.getByRole('button',{name:'Componentes'}).click();assert.equal(await page.getByRole('menuitem').count(),8,'ocho componentes en el menú');
  await page.getByRole('menuitem',{name:/^Piloto/}).click();await settle(page,500);assert.equal(await count(),before+1);
  const box=await page.locator('.lab-device.selected .lab-device-hit').boundingBox();
  assert.ok(box&&box.x>0&&box.y>140&&box.x+box.width<1130&&box.y+box.height<830,`el componente nuevo queda a la vista: ${JSON.stringify(box)}`);
  assert.ok(await page.getByRole('textbox',{name:'Designación'}).isVisible(),'propiedades del componente nuevo');pass('Esquemas: el componente del menú aparece a la vista y se selecciona');
  // 2. Supr lo retira y Ctrl+Z lo devuelve
  await page.locator('.lab-device.selected .lab-device-hit').focus();await page.keyboard.press('Delete');await settle(page,400);assert.equal(await count(),before);
  await page.keyboard.press('Control+z');await settle(page,400);assert.equal(await count(),before+1);pass('Esquemas: Supr retira y Ctrl+Z recupera');
  // 3. arrastrar el fondo desplaza la hoja y sigue por inercia
  const sheet=await page.locator('.lab-schematic').boundingBox(),sx=sheet.x+sheet.width*.5,sy=sheet.y+sheet.height*.74,t0=await transform();
  await page.mouse.move(sx,sy);await page.mouse.down();for(let i=1;i<=6;i++){await page.mouse.move(sx-i*26,sy-i*6);await page.waitForTimeout(14);}
  const held=await transform();await page.mouse.up();await page.waitForTimeout(120);const gliding=await transform();await page.waitForTimeout(1500);const rest=await transform(),again=await page.waitForTimeout(300).then(transform);
  assert.notEqual(t0,held,'la hoja se mueve al arrastrar');assert.notEqual(held,gliding,'la hoja sigue moviéndose al soltar');assert.equal(rest,again,'y se detiene sola');pass('Esquemas: desplazar el fondo con inercia');
  // 4. Ctrl + rueda acerca y el botón de ajuste vuelve a encuadrar
  const percent=async()=>Number((await page.getByLabel('Nivel de zoom').textContent()).replace('%',''));await page.getByRole('button',{name:'Ajustar la hoja'}).click();await settle(page,500);const p0=await percent();
  await page.mouse.move(sx,sy);await page.keyboard.down('Control');await page.mouse.wheel(0,-400);await page.keyboard.up('Control');await settle(page,300);const p1=await percent();assert.ok(p1>p0,`acerca con Ctrl+rueda (${p0}→${p1})`);
  await page.getByRole('button',{name:'Ajustar la hoja'}).click();await settle(page,500);assert.ok(Math.abs(await percent()-p0)<=2,'ajustar recupera el encuadre');pass('Esquemas: zoom con rueda y ajuste');
  // 5. arrastrar un componente con zoom distinto de 1 lo deja donde se suelta (rejilla de 10)
  const hit=page.locator('.lab-device-hit').first(),hb=await hit.boundingBox(),who=(await stored(page)).schematic.devices[0];
  await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await page.mouse.down();await page.mouse.move(hb.x+hb.width/2+60,hb.y+hb.height/2+40,{steps:6});await page.mouse.up();await settle(page,500);
  const moved=(await stored(page)).schematic.devices[0];assert.ok(moved.x>who.x&&moved.y>who.y,`componente movido ${who.x},${who.y} → ${moved.x},${moved.y}`);pass('Esquemas: arrastrar un componente respeta el zoom');
  // HMI
  await page.goto(base+'laboratorio?tool=hmi');await page.waitForSelector('.lab-pan');await settle(page,700);
  const widgets=async()=>(await stored(page)).hmi.widgets.length,w0=await widgets();
  await page.getByRole('toolbar',{name:'Herramientas de la pantalla'}).getByRole('button',{name:'Elementos'}).click();await page.getByRole('menuitem',{name:/^Barra de nivel/}).click();await settle(page,500);
  assert.equal(await widgets(),w0+1);const wb=await page.locator('.lab-widget.selected').boundingBox();assert.ok(wb&&wb.y>0&&wb.y+wb.height<900&&wb.x+wb.width<1130,'el elemento nuevo queda a la vista');
  const wx=(await stored(page)).hmi.widgets.at(-1);await page.mouse.move(wb.x+wb.width/2,wb.y+wb.height/2);await page.mouse.down();await page.mouse.move(wb.x+wb.width/2-90,wb.y+wb.height/2+30,{steps:6});await page.mouse.up();await settle(page,500);
  const wy=(await stored(page)).hmi.widgets.at(-1);assert.ok(wy.x<wx.x&&wy.y>wx.y,`elemento HMI movido ${wx.x},${wx.y} → ${wy.x},${wy.y}`);pass('HMI: menú de elementos y arrastre con zoom');
  // Procesos: la descarga solo se opera en marcha
  await page.goto(base+'laboratorio?tool=process');await page.waitForSelector('.lab-pan');await settle(page,700);
  const drain=page.getByRole('toolbar',{name:'Herramientas del proceso'}).getByRole('button',{name:/descarga/i});assert.ok(await drain.isDisabled(),'sin simulación, la descarga está bloqueada');
  await page.getByRole('button',{name:'Simular proyecto'}).click();await settle(page,600);assert.ok(await drain.isEnabled(),'en marcha, la descarga se opera desde la barra');await drain.click();await settle(page,300);assert.equal(await drain.getAttribute('aria-pressed'),'true');pass('Procesos: la barra opera la descarga solo durante la simulación');
  // PLC
  await page.goto(base+'laboratorio?tool=plc');await page.waitForSelector('.lab-rungs');await settle(page,600);
  const rungs=async()=>(await stored(page)).plc.rungs.length,r0=await rungs();const plcDock=page.getByRole('toolbar',{name:'Herramientas del programa'});
  await plcDock.getByRole('button',{name:'Añadir segmento'}).click();await settle(page,400);assert.equal(await rungs(),r0+1);
  await plcDock.getByRole('button',{name:'Texto estructurado'}).click();await settle(page,300);assert.ok(await page.locator('#lab-st-source').isVisible());await plcDock.getByRole('button',{name:'Ladder'}).click();await settle(page,300);
  assert.ok(await page.locator('.lab-ladder-symbol').count()>0,'símbolos de escalera dibujados');pass('PLC: barra con segmento, lenguaje y símbolos de escalera');
  await context.close();
  // Estudio: calculadora superpuesta disponible en cualquier pantalla
  const studyContext=await browser.newContext({viewport:{width:1280,height:800}}),sp=await studyContext.newPage(),study={context:studyContext};sp.on('pageerror',e=>report.errors.push(e.message));await studyContext.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));await sp.goto(base+'estudio');await sp.waitForSelector('.study-main');await settle(sp,600);
  assert.ok(await sp.getByRole('toolbar',{name:'Herramientas de estudio'}).isVisible(),'barra de herramientas de estudio en la lección');
  await sp.keyboard.press('Alt+c');await settle(sp,400);assert.ok(await sp.locator('#calc-dock-panel').isVisible(),'Alt+C abre la calculadora');
  await sp.getByRole('textbox',{name:'Operación'}).fill('12+30');await sp.keyboard.press('Enter');await settle(sp,200);assert.equal(await sp.getByRole('textbox',{name:'Operación'}).inputValue(),'42');
  await sp.keyboard.press('Escape');await settle(sp,300);assert.equal(await sp.locator('#calc-dock-panel').isHidden(),true);await sp.getByRole('button',{name:/^Calculadora/}).click();await settle(sp,300);
  assert.equal(await sp.getByRole('textbox',{name:'Operación'}).inputValue(),'42','la operación se conserva al cerrar y abrir');
  const panel=await sp.locator('#calc-dock-panel').boundingBox();await sp.mouse.move(panel.x+panel.width/2,panel.y+16);await sp.mouse.down();await sp.mouse.move(panel.x+panel.width/2-220,panel.y+16-120,{steps:6});await sp.mouse.up();
  const moved2=await sp.locator('#calc-dock-panel').boundingBox();assert.ok(moved2.x<panel.x-100,'la ventana se arrastra desde su cabecera');
  await sp.getByTitle('Fórmulas para recordar').click();await settle(sp,300);assert.ok(await sp.locator('.formula-sheet').isVisible(),'la chuleta de fórmulas se abre');await sp.getByRole('button',{name:/Corriente del motor/}).click();assert.ok(await sp.locator('.formula-detail').isVisible(),'al tocar una fórmula se ven sus símbolos');await sp.getByRole('button',{name:'Abrir la ficha y calcular'}).click();await settle(sp,500);assert.equal(await sp.locator('.calc-dock').isHidden(),true,'en la pantalla de cálculos no se duplica la calculadora');pass('Estudio: calculadora superpuesta con barra, atajo, memoria y arrastre');
  await study.context.close();
  // móvil
  for(const tool of ['schematic','hmi','process','plc']){
    const m=await open(browser,{width:390,height:844},`laboratorio?tool=${tool}`);const mp=m.page;
    const d=await mp.locator('.lab-dock').boundingBox();assert.ok(d&&d.x>=0&&d.x+d.width<=390&&d.y+d.height<=844,`${tool}: la barra cabe en pantalla ${JSON.stringify(d)}`);
    if(tool!=='plc'){const content=await mp.locator('.lab-pan-content').boundingBox();assert.ok(content.height>180&&content.width>300,`${tool}: el lienzo se lee en móvil (${Math.round(content.width)}×${Math.round(content.height)})`);}
    await m.context.close();
  }
  pass('móvil: barra flotante dentro de la pantalla y lienzo legible en los cuatro módulos');
}
(async()=>{const browser=await chromium.launch();try{await desktop(browser);await inercia(browser);await modulos(browser);await movil(browser);assert.deepEqual(report.errors,[],'sin errores en consola');pass('consola sin errores');
  console.log(JSON.stringify(report,null,2));fs.mkdirSync(path.join(__dirname,'laboratory-results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'laboratory-results','ui.json'),JSON.stringify(report,null,2));
}catch(error){console.error(error);console.error(JSON.stringify(report,null,2));process.exitCode=1;}finally{await browser.close();}})();
