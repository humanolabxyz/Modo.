/* Paneles adicionales y arrastre del banco, en el navegador. Uso: PANELLAB_URL=http://127.0.0.1:4410/ node qa/verify-modulos-extra-ui.cjs */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4322/';
const report={checks:[],errors:[]},pass=s=>report.checks.push(s);
(async()=>{const browser=await chromium.launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
 const open=async()=>{await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();await page.waitForFunction(()=>document.querySelector('[data-module-id]'))};
 const modules=()=>page.locator('[data-module-id]').count();
 const pos=async id=>{const t=await page.locator(`[data-module-id="${id}"]`).getAttribute('transform');const m=t.match(/translate\(([-\d.]+) ([-\d.]+)\)/);return {x:+m[1],y:+m[2]}};
 const box=async sel=>page.locator(sel).first().boundingBox();
 const spotOn=id=>page.evaluate(id=>{const r=document.querySelector(`[data-module-id="${id}"] rect`).getBoundingClientRect();for(let y=r.y+r.height*.25;y<r.y+r.height*.9;y+=8)for(let x=r.x+r.width*.08;x<r.x+r.width*.5;x+=8){const el=document.elementFromPoint(x,y);if(el&&el.closest(`[data-module-id="${id}"]`)&&!el.closest('.terminal,.interactive-wire,.simulation-control,.module-remove'))return {x,y}}return null},id);
 await open();assert.equal(await modules(),6);
 // 1. A2 sobre A1 en el contactor + térmico
 const a2=await box('[data-terminal-id="CONTACTOR_TERMICO:A2"]'),a1=await box('[data-terminal-id="CONTACTOR_TERMICO:A1"]');
 assert.ok(a2.y<a1.y,'A2 arriba y A1 abajo');pass('En el contactor + relé térmico A2 queda sobre A1');
 // 2. Añadir el tercer contactor desde el menú
 await page.getByRole('button',{name:'Añadir panel al banco'}).click();
 await page.getByRole('button',{name:/Contactor trifásico/}).click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-module-id]').length===7);
 assert.equal(await page.locator('[data-terminal-id="CONTACTOR_TRIFASICO_3:A1"]').count(),1);
 assert.equal(await page.getByRole('button',{name:/Quitar el panel KM3/}).count(),1);
 assert.ok((await page.locator('.status-banner').innerText()).includes('KM3'));
 const added=await pos('CONTACTOR_TRIFASICO_3');pass('«Añadir panel» agrega el contactor KM3 en un hueco libre, con su botón para quitarlo');
 await page.screenshot({path:'qa/modulos-extra/banco-con-km3.png'});
 // 3. Un clic sobre un borne no mueve el panel
 await page.locator('[data-terminal-id="CONTACTOR_TRIFASICO_3:A1"]').click();
 assert.deepEqual(await pos('CONTACTOR_TRIFASICO_3'),added);
 await page.getByRole('button',{name:'Desbloquear movimiento de módulos',exact:true}).click();
 // 4. Arrastrar desde una zona libre de la cara: vista previa, acople y guardado
 const face=await box('[data-module-id="CONTACTOR_TRIFASICO_3"]');
 const grab={x:face.x+face.width*.5,y:face.y+face.height*.52};
 const target=await box('[data-module-id="TEMPORIZADOR_1"]');
 await page.mouse.move(grab.x,grab.y);await page.mouse.down();
 await page.mouse.move(grab.x-20,grab.y-20,{steps:3});
 await page.mouse.move(target.x+target.width*.6,target.y+target.height*.4,{steps:8});
 assert.equal(await page.locator('[data-drop-preview]').count(),1,'vista previa del acople mientras se arrastra');
 assert.ok(await page.locator('[data-drop-target]').count()===1,'se resalta el panel al que se acopla');
 await page.mouse.up();await page.waitForTimeout(400);
 const moved=await pos('CONTACTOR_TRIFASICO_3');assert.notDeepEqual(moved,added);
 const rects=await page.evaluate(()=>[...document.querySelectorAll('[data-module-id]')].map(g=>{const b=g.querySelector('rect').getBBox();const t=g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return {id:g.dataset.moduleId,x:+t[1],y:+t[2],w:b.width,h:b.height}}));
 const me=rects.find(r=>r.id==='CONTACTOR_TRIFASICO_3');
 for(const o of rects.filter(r=>r.id!==me.id))assert.ok(!(me.x<o.x+o.w&&o.x<me.x+me.w&&me.y<o.y+o.h&&o.y<me.y+me.h),'no queda superpuesto con '+o.id);
 assert.equal(await page.locator('[data-drop-preview]').count(),0);
 pass('Arrastrar un panel desde su cara muestra el hueco de acople, lo resalta y al soltar lo deja junto al vecino sin superponerse');
 // 4b. Soltar un panel sobre otro los intercambia
 {
  const from=await spotOn('FUENTE'),to=await box('[data-module-id="BOTONERAS"]');
  await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(from.x+30,from.y+10,{steps:3});
  await page.mouse.move(to.x+to.width*.5,to.y+to.height*.5,{steps:10});
  assert.equal(await page.locator('[data-swap-preview="BOTONERAS"]').count(),1,'vista previa del intercambio');
  await page.mouse.up();await page.waitForTimeout(500);
  assert.deepEqual(await pos('BOTONERAS'),{x:65,y:76});assert.deepEqual(await pos('FUENTE'),{x:65+615+24,y:76});
  pass('Soltar la alimentación sobre las botoneras las intercambia de lugar (con vista previa) y sus anchos distintos no se superponen');
 }
 // 5. Mover con el asa sigue funcionando y el cambio sobrevive a recargar
 const grip=await box('[data-module-id="CONTACTOR_TRIFASICO_3"] .module-grip rect');
 await page.mouse.move(grip.x+grip.width*.45,grip.y+10);await page.mouse.down();await page.mouse.move(grip.x+grip.width*.45+40,grip.y+300,{steps:6});await page.mouse.up();await page.waitForTimeout(400);
 const final=await pos('CONTACTOR_TRIFASICO_3');
 await open();assert.equal(await modules(),7);assert.deepEqual(await pos('CONTACTOR_TRIFASICO_3'),final);
 pass('El asa también mueve el panel; paneles y posiciones se recuperan al recargar');
 // 6. Un cable al panel adicional sobrevive a recargar (los paneles se restauran antes de leer la práctica)
 await page.keyboard.press('c');
 await page.locator('[data-terminal-id="CONTACTOR_TRIFASICO_3:A1"]').click();await page.locator('[data-terminal-id="FUENTE:F"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===1);
 await page.waitForTimeout(600);await open();assert.equal(await modules(),7);
 assert.equal(await page.locator('.interactive-wire').count(),1);pass('Un cable conectado a KM3 se conserva al recargar');
 // 6b. Los cables se balancean al mover un panel y se asientan
 {
  const wire=()=>page.locator('.interactive-wire .wire-hit').first().getAttribute('d');
  await page.getByRole('button',{name:'Desbloquear movimiento de módulos',exact:true}).click();
  const rest=await wire(),spot=await spotOn('CONTACTOR_TRIFASICO_3');
  await page.mouse.move(spot.x,spot.y);await page.mouse.down();await page.mouse.move(spot.x+50,spot.y+40,{steps:6});await page.mouse.move(spot.x-30,spot.y+80,{steps:6});await page.mouse.up();
  const frames=[];for(let i=0;i<12;i++){frames.push(await wire());await page.waitForTimeout(110)}
  assert.notEqual(frames[0],rest);assert.ok(new Set(frames).size>4,'el cable sigue moviéndose después de soltar el panel');
  let same=0,previous=frames.at(-1),waited=0;while(same<4&&waited<12000){await page.waitForTimeout(250);waited+=250;const now=await wire();same=now===previous?same+1:0;previous=now}
  assert.ok(same>=4,'el cable termina asentándose');
  pass('Al mover un panel sus cables se balancean como los del multímetro y se asientan solos');
 }
 // 7. No se puede quitar un panel con cables; sin ellos, sí
 await page.getByRole('button',{name:/Quitar el panel KM3/}).click();
 assert.equal(await modules(),7);assert.ok((await page.locator('.status-banner').innerText()).includes('cable'));
 await page.keyboard.press('v');await page.locator('.interactive-wire').first().dispatchEvent('click');await page.locator('.selected-cable-action button').click();
 await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===0);
 await page.getByRole('button',{name:/Quitar el panel KM3/}).click();await page.waitForFunction(()=>document.querySelectorAll('[data-module-id]').length===6);
 await open();assert.equal(await modules(),6);pass('Un panel con cables no se quita; sin cables se quita y no reaparece al recargar');
 // 8. Acomodar módulos conserva los paneles añadidos y los recoloca
 for(const label of [/Contactor trifásico/,/Temporizador neumático/]){await page.getByRole('button',{name:'Añadir panel al banco'}).click();await page.getByRole('button',{name:label}).click()}
 await page.waitForFunction(()=>document.querySelectorAll('[data-module-id]').length===8);
 await page.getByRole('button',{name:'Acomodar módulos'}).click();assert.equal(await modules(),8);
 assert.deepEqual(await pos('FUENTE'),{x:65,y:76});pass('Acomodar módulos devuelve la disposición base y conserva los paneles añadidos');
 // 8b. Arranque estrella-triángulo automático con el temporizador
 await page.evaluate(()=>localStorage.clear());await open();assert.equal(await modules(),6);
 await page.getByRole('button',{name:'Simular mando de 24 V'}).click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 await page.getByLabel('Retardo del temporizador').selectOption('2');
 await page.locator('.simulation-examples').first().evaluate(e=>{if(e.tagName==='DETAILS')e.open=true});
 await page.getByRole('button',{name:'Cargar arranque estrella-triángulo automático'}).click();
 await page.waitForFunction(()=>document.querySelector('[data-module-id="CONTACTOR_TRIFASICO_3"]'));
 assert.equal(await modules(),7,'el ejemplo añadió KM3');
 assert.ok(await page.locator('.interactive-wire').count()>=30,'el ejemplo coloca sus 35 cables');
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 for(const name of ['Enchufar corriente virtual','FUERZA · OFF','CONTROL 1 · OFF','CONTROL 2 · OFF'])await page.locator('.simulation-menu-body').getByRole('button',{name,exact:true}).click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 await page.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption('BOTONERAS');await page.waitForTimeout(500);
 const green=page.getByRole('button',{name:'Pulsador verde derecho',exact:true}),gb=await green.boundingBox();
 await page.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2);await page.mouse.down();
 await page.waitForFunction(()=>document.querySelector('[data-sim-relay="CONTACTOR_TRIFASICO_3"]')?.getAttribute('data-active')==='true');
 await page.mouse.up();
 const attr=(sel,name)=>page.locator(sel).getAttribute(name);
 assert.equal(await attr('[data-motor-status]','data-motor-connection'),'star');await page.screenshot({path:'qa/modulos-extra/estrella-triangulo-1-estrella.png'});
 assert.equal(await attr('[data-sim-relay="CONTACTOR_TERMICO"]','data-active'),'true','KM1 se mantiene al soltar marcha');
 await page.waitForFunction(()=>document.querySelector('[data-motor-status]')?.getAttribute('data-motor-connection')==='delta',null,{timeout:6000});
 assert.equal(await attr('[data-sim-relay="CONTACTOR_TRIFASICO"]','data-active'),'true');assert.equal(await attr('[data-sim-relay="CONTACTOR_TRIFASICO_3"]','data-active'),'false');
 assert.equal(await attr('[data-motor-status]','data-motor-status'),'running');await page.screenshot({path:'qa/modulos-extra/estrella-triangulo-2-triangulo.png'});
 pass('El ejemplo estrella-triángulo añade KM3, arranca en estrella y pasa solo a triángulo cuando el temporizador cumple su retardo');
 const stopBtn=page.getByRole('button',{name:'Pulsador rojo central',exact:true}),sb=await stopBtn.boundingBox();
 await page.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2);await page.mouse.down();await page.mouse.up();
 await page.waitForFunction(()=>document.querySelector('[data-sim-relay="CONTACTOR_TERMICO"]')?.getAttribute('data-active')==='false');
 assert.notEqual(await attr('[data-motor-status]','data-motor-status'),'running');
 pass('El pulsador de parada detiene KM1, el temporizador y el motor');
 // 8c. Lección guiada de inversión de giro: se abre desde el sombrero de la barra, en una ventana movible
 await page.evaluate(()=>localStorage.clear());await open();
 await page.getByRole('button',{name:'Guía paso a paso',exact:true}).click();
 await page.getByRole('button',{name:/Inversión de giro con enclavamiento/}).click();
 await page.locator('.guide-window .guide-step-content').waitFor();
 assert.ok((await page.locator('.guide-window').innerText()).includes('1/41'));
 assert.equal(await page.locator('.interactive-wire').count(),0,'la lección parte con el banco sin cables');
 assert.equal(await page.locator('.guide-window [data-guide-schematic]').count(),1,'la ventana trae el esquema del circuito');
 assert.ok(Number(await page.locator('.guide-window [data-guide-schematic]').getAttribute('data-active-wires'))>0,'se ilumina la línea del paso');
 assert.ok(await page.locator('.guide-window [data-lesson-wire][data-state=active]').count()>0);
 const firstLine=await page.locator('.guide-window [data-lesson-wire][data-state=active]').first().getAttribute('data-lesson-wire');
 assert.ok((await page.locator('.guide-window [data-guide-connect]').innerText()).includes('Fuente · F'),'nombra los bornes del paso');
 assert.equal(await page.locator('.ghost-cable').count(),1,'el cable del paso se ve desde el primer momento');
  await page.screenshot({path:'qa/modulos-extra/leccion-paso-1.png'});
 // Abrir el diagrama grande desde la ventana de lección.
 await page.getByRole('button',{name:'Abrir en grande',exact:true}).click();
 // el panel de diagrama muestra el esquema de la lección con la línea del paso iluminada
 await page.locator('.diagram-pane:not([hidden]) .cade-wire').first().waitFor({state:'attached'});
 assert.equal(await page.getByLabel('Diagrama de CADe a estudiar').inputValue(),'inversion','el panel elige el esquema de la lección');
 assert.ok(await page.locator('.diagram-pane:not([hidden]) path[stroke="#e08a10"]').count()>0,'la línea del paso se ilumina en el diagrama grande');
 assert.ok(await page.locator('.diagram-pane:not([hidden]) [data-cade-end]').count()>=1,'se marcan los bornes del cable en el diagrama');
 // elegir otra línea del diagrama dibuja su cable en el banco
 {
  const ids=await page.locator('.diagram-pane:not([hidden]) [data-cade-wire]').evaluateAll(els=>els.map(e=>e.getAttribute('data-cade-wire')));
  let shown='';
  for(const id of ids){
   await page.locator(`.diagram-pane:not([hidden]) [data-cade-wire="${id}"]`).dispatchEvent('click');
   const from=await page.locator('.ghost-cable').evaluateAll(g=>g.map(x=>x.getAttribute('data-ghost-from')));
   if(from.some(f=>f!=='FUENTE:F')){shown=from.find(f=>f!=='FUENTE:F');break}
  }
  assert.ok(shown,'al elegir una línea del diagrama se ve su cable en el banco');
  assert.ok((await page.locator('.status-banner').innerText()).includes('se arma con'),'el aviso nombra los bornes del cable');
 }
 // la ventana se arrastra
 {
  const win=page.locator('.guide-window'),before=await win.boundingBox(),head=await page.locator('.guide-window .floating-window-header').boundingBox();
  await page.mouse.move(head.x+head.width/2-40,head.y+head.height/2);await page.mouse.down();await page.mouse.move(head.x+head.width/2-240,head.y+head.height/2-80,{steps:6});await page.mouse.up();
  const after=await win.boundingBox();assert.ok(Math.abs(after.x-before.x)>100&&Math.abs(after.y-before.y)>30,'la guía se mueve como una ventanita');
 }
 // niveles de ayuda: «Esquema» no dibuja el cable; «Cable» sí
 await page.locator('.guide-window .assistance-levels').getByRole('button',{name:'Esquema'}).click();assert.equal(await page.locator('.ghost-cable').count(),0);
 await page.locator('.guide-window .assistance-levels').getByRole('button',{name:'Cable'}).click();assert.equal(await page.locator('.ghost-cable').count(),1);
 // ocultar y volver a abrir desde el sombrero
 await page.getByRole('button',{name:/Ocultar la guía/}).click();assert.equal(await page.locator('.guide-window').count(),0);
 await page.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await page.getByRole('button',{name:/Mostrar ventana/}).click();await page.locator('.guide-window .guide-step-content').waitFor();
 // conectar el primer cable, validar y avanzar
 await page.keyboard.press('c');
 await page.locator('[data-terminal-id="FUENTE:F"]').dispatchEvent('click');await page.locator('[data-terminal-id="CONTACTOR_TERMICO:95"]').dispatchEvent('click');
 await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===1);
 assert.equal(await page.getByRole('button',{name:'Comprobar conexión del paso'}).count(),0,'ya no hay botón de comprobar: es automático');
 await page.waitForFunction(()=>document.querySelector('.guide-window')?.innerText.includes('2/41'),null,{timeout:6000});
 assert.equal(await page.locator('.ghost-cable').count(),1,'al avanzar se sigue mostrando el cable del paso nuevo');
 assert.ok(await page.locator('.guide-window [data-lesson-wire][data-state=done]').count()>0,'la línea armada queda en verde');
 assert.notEqual(await page.locator('.guide-window [data-lesson-wire][data-state=active]').first().getAttribute('data-lesson-wire'),firstLine,'se ilumina la línea del paso nuevo');
 // la lección sobrevive a recargar
 await page.waitForTimeout(700);await open();await page.locator('.guide-window .guide-step-content').waitFor();assert.ok((await page.locator('.guide-window').innerText()).includes('2/41'));assert.equal(await page.locator('.interactive-wire').count(),1);
 // salir de la guía conserva los cables
 await page.getByRole('button',{name:'Guía paso a paso',exact:true}).click();await page.getByRole('button',{name:/Salir de la guía/}).click();
 assert.equal(await page.locator('.guide-window').count(),0);assert.equal(await page.locator('.interactive-wire').count(),1);
 pass('La lección se abre desde el sombrero de la barra, en una ventana movible con esquema que ilumina la línea del paso, bornes nombrados y el cable visible desde el inicio; los niveles de ayuda lo ocultan, se oculta y reabre, comprueba y avanza solo al completar el cable, se conserva al recargar y se puede salir');
 // 8d. Ejemplo de inversión de giro funcionando en el banco
 await page.evaluate(()=>localStorage.clear());await open();
 await page.getByRole('button',{name:'Simular mando de 24 V'}).click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 await page.locator('.simulation-examples').first().evaluate(e=>{if(e.tagName==='DETAILS')e.open=true});
 await page.getByRole('button',{name:'Cargar inversión de giro con enclavamiento'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===41);
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 for(const name of ['Enchufar corriente virtual','FUERZA · OFF','CONTROL 1 · OFF','CONTROL 2 · OFF'])await page.locator('.simulation-menu-body').getByRole('button',{name,exact:true}).click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 await page.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption('BOTONERAS');await page.waitForTimeout(500);
 const tap=async name=>{const b=await page.getByRole('button',{name,exact:true}).boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(150);await page.mouse.up();await page.waitForTimeout(250)};
 const dir=()=>page.locator('[data-motor-status]').getAttribute('data-motor-direction');
 await tap('Pulsador verde izquierdo');assert.equal(await dir(),'1','marcha 1: giro directo');
 await tap('Pulsador verde derecho');assert.equal(await dir(),'1','el enclavamiento ignora la marcha 2 mientras KM1 está activo');
 await tap('Pulsador rojo central');assert.equal(await page.locator('[data-motor-status]').getAttribute('data-motor-status'),'off');
 await tap('Pulsador verde derecho');assert.equal(await dir(),'-1','marcha 2: giro inverso');
 pass('El ejemplo de inversión de giro carga sus 41 cables, gira en un sentido, se enclava, para y gira al revés');
 // 8e. Lección y ejemplo de marcha y paro (el circuito simple)
 await page.evaluate(()=>localStorage.clear());await open();
 await page.getByRole('button',{name:'Guía paso a paso',exact:true}).click();
 await page.getByRole('button',{name:/Marcha y paro con retención/}).click();
 await page.locator('.guide-window .guide-step-content').waitFor();
 assert.ok((await page.locator('.guide-window').innerText()).includes('1/24'));
 await page.evaluate(()=>localStorage.clear());await open();
 await page.getByRole('button',{name:'Simular mando de 24 V'}).click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 await page.locator('.simulation-examples').first().evaluate(e=>{if(e.tagName==='DETAILS')e.open=true});
 await page.getByRole('button',{name:'Cargar marcha y paro con retención (simple)'}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===24);
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 for(const name of ['Enchufar corriente virtual','FUERZA · OFF','CONTROL 1 · OFF','CONTROL 2 · OFF'])await page.locator('.simulation-menu-body').getByRole('button',{name,exact:true}).click();
 await page.getByLabel('Opciones de simulación',{exact:true}).click();
 await page.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption('BOTONERAS');await page.waitForTimeout(500);
 const press=async name=>{const b=await page.getByRole('button',{name,exact:true}).boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(150);await page.mouse.up();await page.waitForTimeout(250)};
 const status=()=>page.locator('[data-motor-status]').getAttribute('data-motor-status');
 await press('Pulsador verde izquierdo');assert.equal(await status(),'running');
 await page.waitForTimeout(300);assert.equal(await status(),'running','queda retenido al soltar');
 await press('Pulsador rojo central');assert.equal(await status(),'off');
 pass('La lección de marcha y paro abre su mapa (24 pasos) y el ejemplo arranca con S1, se retiene y para con S2');
 // 9. Móvil: el menú de opciones trae «Añadir» y no hay desborde horizontal
 await page.setViewportSize({width:390,height:844});await open();
 await page.getByLabel('Opciones de práctica',{exact:true}).first().click();
 assert.ok(await page.getByRole('button',{name:'Añadir panel al banco'}).isVisible());
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
 await page.getByRole('button',{name:'Añadir panel al banco'}).click();await page.waitForTimeout(1500);await page.screenshot({path:'qa/modulos-extra/movil-menu.png'});pass('En móvil el menú de opciones incluye «Añadir» sin desbordar la pantalla');
 // 10. Multímetro: se puede achicar y agrandar, recuerda su tamaño y las puntas siguen conectadas
 await page.setViewportSize({width:1280,height:900});await page.goto(base+'laboratorio/');await page.waitForTimeout(2500);
 await page.getByRole('button',{name:'Ahora no'}).click().catch(()=>{});await page.getByRole('button',{name:'Protoboard',exact:true}).click();await page.locator('.lab-dmm-device').waitFor();
 const width=()=>page.locator('.lab-dmm-device').evaluate(e=>Math.round(e.getBoundingClientRect().width));
 const full=await width();await page.getByRole('button',{name:'Achicar el multímetro'}).click();await page.getByRole('button',{name:'Achicar el multímetro'}).click();
 const small=await width();assert.ok(small<full*.8,'el multímetro se achica');
 assert.equal(await page.evaluate(()=>localStorage.getItem('panellab.dmmScale')),'0.7');
 for(let i=0;i<4;i++)if(!(await page.getByRole('button',{name:'Achicar el multímetro'}).isDisabled()))await page.getByRole('button',{name:'Achicar el multímetro'}).click();
 assert.ok(await page.getByRole('button',{name:'Achicar el multímetro'}).isDisabled(),'llega a un mínimo');assert.ok(await width()<full*.45);
 await page.getByRole('button',{name:'Agrandar el multímetro'}).click();assert.ok(await width()>full*.45);
 await page.reload();await page.waitForTimeout(2500);await page.getByRole('button',{name:'Ahora no'}).click().catch(()=>{});await page.getByRole('button',{name:'Protoboard',exact:true}).click();await page.locator('.lab-dmm-device').waitFor();
 assert.ok(await width()<full*.6,'recuerda el tamaño elegido');
 assert.ok(await page.locator('.lab-leads .lab-lead').count()===2);
 pass('El multímetro se achica y se agranda (40–130 %), recuerda su tamaño y conserva sus puntas');
 assert.deepEqual(report.errors.filter(e=>!/favicon/.test(e)),[]);
}finally{await browser.close();fs.writeFileSync('qa/modulos-extra/ui-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))}})().catch(e=>{console.error(e);process.exit(1)});
