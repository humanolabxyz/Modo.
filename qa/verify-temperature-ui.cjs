/* Recorrido real del banco de temperatura y de su lección en Estudio (Chromium, sin simular el navegador).
 * Requiere el servidor local: npm run dev -- --port 4341  (o PANELLAB_URL). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const ts=require('typescript');
const reviewModule={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/learning/temperatureReview.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:reviewModule.exports,Date,Math,JSON,Number,Object,Array,Set,Error},{});
const REV=reviewModule.exports;
const physics={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lab/temperature/physics.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:physics.exports,Math});
const P=physics.exports,base=(process.env.PANELLAB_URL||'http://127.0.0.1:4341').replace(/\/$/,''),out='qa/temperatura';
const report={checks:[],errors:[],captures:[]};fs.mkdirSync(out,{recursive:true});
const pass=s=>{report.checks.push(s);console.log('✓',s);};
const fmt=(v,d)=>{const f=Number(v.toFixed(d));return (Object.is(f,-0)?0:f).toFixed(d).replace('.',',');};
async function context(browser,viewport){
  const c=await browser.newContext({viewport,hasTouch:viewport.width<500,serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
  await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
  const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.stack||e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,400));});p.on('dialog',d=>d.accept());return {c,p};
}
const ready=p=>p.waitForSelector('[data-temperature-ready="true"]',{timeout:20000});
async function capture(p,name){await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));await p.waitForTimeout(250);await p.screenshot({path:`${out}/${name}.png`});report.captures.push(`${name}.png`);}
const fits=async(p,name)=>{const d=await p.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));assert.ok(d.width<=d.viewport+1,`${name}: ${JSON.stringify(d)}`);};
/* Las sondas se pulsan por su manguito, como haría una persona (el centro de su silueta completa queda en el aire). */
const equip=(p,re)=>{const e=p.getByRole('button',{name:re});return /Termocupla|Pt100/.test(String(re))?e.locator('.sleeve'):e;};
const reading=p=>p.locator('.temp-reading').innerText();
async function setBath(p,text){await equip(p,/^Horno de pozo seco/).click();await p.getByLabel('Temperatura objetivo').fill(text);await p.getByLabel('Temperatura objetivo').press('Enter');await p.waitForSelector('.temp-pop',{state:'detached'});await p.getByRole('button',{name:'Esperar a que se estabilice'}).click();}
async function wire(p,mode,red,black){await p.getByRole('button',{name:mode,exact:true}).click();await p.getByLabel('Borne de la punta roja').selectOption(red);await p.getByLabel('Borne de la punta negra').selectOption(black);}
(async()=>{const browser=await chromium.launch();try{
  /* ── Banco libre, escritorio ── */
  const {c,p}=await context(browser,{width:1440,height:900});
  await p.goto(base+'/laboratorio?tool=temperature');await ready(p);
  assert.equal(await p.locator('.lab-canvas-workspace.tool-temperature').count(),1);
  assert.ok(await p.locator('.lab-pan').count()===1&&await p.locator('.lab-dock').count()===1&&await p.locator('.lab-zoombar').count()===1);
  pass('El banco usa el pizarrón del simulador: lienzo con pan/zoom, dock oscuro flotante y barra de zoom');
  await capture(p,'banco-inicial-desktop');

  /* Fichas de los equipos y fuente */
  await p.getByRole('button',{name:'Fichas de los equipos'}).click();
  const sheets=p.locator('.temp-sheet-window');await sheets.waitFor();
  assert.equal(await sheets.locator('.temp-sheet').count(),6);assert.match(await sheets.innerText(),/no indica marca ni modelo/);
  assert.ok(await sheets.locator('.temp-sheet-sources a[href^="https://"]').count()>=10);
  await sheets.locator('.temp-sheet[data-sheet="pt"] summary').click();assert.match(await sheets.locator('.temp-sheet[data-sheet="pt"]').innerText(),/100,00 Ω a 0 °C/);
  await p.getByRole('button',{name:'Cerrar las fichas'}).click();await p.waitForSelector('.temp-sheet-window',{state:'detached'});
  await equip(p,/^Termocupla K, fuera del pozo/).click();await p.getByRole('button',{name:'Ver ficha del equipo'}).click();assert.equal(await p.locator('.temp-sheet[data-sheet="tc"]').getAttribute('open'),'');
  await p.getByRole('button',{name:'Cerrar las fichas'}).click();await p.keyboard.press('Escape');
  await equip(p,/^Fuente de alimentación, apagada/).click();await p.getByRole('button',{name:'Encender la fuente'}).click();await p.keyboard.press('Escape');
  assert.equal(await equip(p,/^Fuente de alimentación, encendida/).count(),1);assert.match(await p.locator('svg.temp-bench').textContent(),/24,0 V/);
  await equip(p,/^Fuente de alimentación, encendida/).click();await p.getByRole('button',{name:'Apagar la fuente'}).click();await p.keyboard.press('Escape');
  pass('Seis fichas con fuentes enlazadas (ventana del dock y desde cada equipo) y fuente de alimentación que enciende y apaga el transmisor');
  await equip(p,/^Pt100 · 3 hilos, fuera del pozo/).click();await p.getByRole('button',{name:'Introducir en el pozo'}).click();await p.keyboard.press('Escape');
  await equip(p,/^Termocupla K, fuera del pozo/).click();await p.getByRole('button',{name:'Introducir en el pozo'}).click();await p.keyboard.press('Escape');
  assert.equal(await equip(p,/^Pt100 · 3 hilos, dentro del pozo/).count(),1);assert.equal(await equip(p,/^Termocupla K, dentro del pozo/).count(),1);
  pass('Las sondas se introducen al pozo con su edición contextual y Escape la cierra');

  /* Edición del horno con borrador, error visible y Escape */
  await equip(p,/^Horno de pozo seco/).click();
  await p.getByLabel('Temperatura objetivo').fill('abc');assert.match(await p.locator('.temp-pop .lab-field-error').innerText(),/número/);
  await p.getByLabel('Temperatura objetivo').fill('300');assert.match(await p.locator('.temp-pop .lab-field-error').innerText(),/hasta 150/);
  await p.getByLabel('Temperatura objetivo').fill('10');assert.match(await p.locator('.temp-pop .lab-field-error').innerText(),/no enfría por debajo del ambiente/);
  await p.getByLabel('Temperatura objetivo').fill('75');await p.keyboard.press('Escape');await p.waitForSelector('.temp-pop',{state:'detached'});
  assert.match(await p.locator('svg.temp-bench').textContent(),/objetivo 22,0 °C/);
  pass('Un valor inválido muestra el motivo junto al campo y Escape cancela sin cambiar el objetivo');
  await setBath(p,'75');assert.match(await p.locator('svg.temp-bench').textContent(),/objetivo 75,0 °C/);assert.match(await p.locator('svg.temp-bench').textContent(),/75,0 °C/);
  pass('El horno acepta 75 °C con Enter y muestra su temperatura junto al equipo');

  /* Multímetro: función correcta, lectura y registro */
  await wire(p,'mV','tc+','tc-');
  const emf=P.tcEmf('K',75)-P.tcEmf('K',22);assert.equal(await reading(p),`${fmt(emf,3)} mV`);
  pass(`Termocupla K a 75 °C con referencia a 22 °C: ${fmt(emf,3)} mV`);
  await p.getByRole('button',{name:'Registrar punto'}).click();assert.equal(await p.locator('.temp-table tbody tr').count(),1);
  await wire(p,'Ω','pt1','pt3');assert.equal(await reading(p),`${fmt(P.ptOhms(75),2)} Ω`);
  await p.getByRole('button',{name:'Registrar punto'}).click();assert.equal(await p.locator('.temp-table tbody tr').count(),2);
  pass('Pt100 en Ω lee R(75 °C) y cada lectura estable se registra con su referencia de tabla');
  /* Función equivocada: no se puede registrar */
  await wire(p,'Ω','tc+','tc-');assert.equal(await p.getByRole('button',{name:'Registrar punto'}).isDisabled(),true);assert.match(await p.locator('.temp-why').innerText(),/no depende de la temperatura/);
  await wire(p,'mV','tc+','pt1');assert.equal(await reading(p),'OL');assert.equal(await p.getByRole('button',{name:'Registrar punto'}).isDisabled(),true);
  pass('Ω en la termocupla o puntas en sensores distintos no producen un registro válido');
  /* Pt100 de 3 y 4 hilos: rojo–blanco mide, rojo–rojo no */
  await wire(p,'Ω','pt1','pt2');assert.equal(await p.getByRole('button',{name:'Registrar punto'}).isDisabled(),true);assert.match(await p.locator('.temp-note').innerText(),/solo mides el cable/);
  await wire(p,'Ω','pt1','pt3');assert.equal(await reading(p),`${fmt(P.ptOhms(75),2)} Ω`);
  await equip(p,/^Pt100 · 3 hilos, dentro del pozo/).click();await p.locator('.temp-pop').getByRole('button',{name:'4 hilos'}).click();await p.keyboard.press('Escape');
  assert.equal(await p.getByRole('button',{name:/^Pt100 · hilo blanco 4/}).count(),1);
  await wire(p,'Ω','pt4','pt2');assert.equal(await reading(p),`${fmt(P.ptOhms(75),2)} Ω`);
  await equip(p,/^Pt100 · 4 hilos, dentro del pozo/).click();await p.locator('.temp-pop').getByRole('button',{name:'3 hilos'}).click();await p.keyboard.press('Escape');
  assert.equal(await p.getByRole('button',{name:/^Pt100 · hilo blanco 4/}).count(),0);assert.equal(await p.getByLabel('Borne de la punta roja').inputValue(),'');
  pass('Pt100 de 3 y 4 hilos: entre un rojo y un blanco mide R(T), entre dos del mismo color solo el cable, y pasar a 3 hilos suelta el cuarto');
  await wire(p,'Ω','pt1','pt3');
  /* Puntas con el dock y los bornes */
  await p.getByRole('button',{name:'Quitar las puntas'}).click();assert.equal(await p.getByLabel('Borne de la punta roja').inputValue(),'');
  await p.getByRole('button',{name:'Punta roja'}).click();await p.getByRole('button',{name:/^Termocupla \+/}).click();
  await p.getByRole('button',{name:/^Termocupla −/}).click();assert.equal(await p.getByLabel('Borne de la punta negra').inputValue(),'tc-');
  assert.equal(await p.getByLabel('Borne de la punta roja').inputValue(),'tc+');
  pass('Las puntas roja y negra se conectan pulsando los bornes del lienzo (el orden se encadena solo)');
  await wire(p,'mV','tc-','tc+');assert.equal(await reading(p),`${fmt(-emf,3)} mV`);pass('Invertir las puntas invierte el signo de la lectura');
  await wire(p,'mV','tc+','tc-');

  /* Cuatro puntos de cada sensor */
  for(const t of ['Ambiente','50','100']){
    await equip(p,/^Horno de pozo seco/).click();await p.getByRole('button',{name:t==='Ambiente'?/^Ambiente ·/:new RegExp(`^${t} °C$`)}).click();await p.getByRole('button',{name:'Aplicar'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
    await p.getByRole('button',{name:'Esperar a que se estabilice'}).click();
    await wire(p,'mV','tc+','tc-');await p.getByRole('button',{name:'Registrar punto'}).click();await wire(p,'Ω','pt1','pt3');await p.getByRole('button',{name:'Registrar punto'}).click();
  }
  assert.equal(await p.locator('.temp-table tbody tr').count(),8);
  const rows=await p.locator('.temp-table tbody tr').allInnerTexts();assert.ok(rows.some(r=>r.includes('138,51 Ω')),rows.join('|'));
  pass('Cuatro temperaturas por sensor: Pt100 a 100 °C = 138,51 Ω y ocho registros en total');
  await p.getByRole('button',{name:'Curva'}).click();assert.equal(await p.locator('.temp-chart .p-sim').count(),4);await capture(p,'banco-registros-desktop');
  pass('La curva muestra los puntos simulados sobre la referencia');

  /* Transmisor */
  await equip(p,/^Transmisor de temperatura/).click();
  await p.getByRole('button',{name:'Conectar entrada a la termocupla'}).click();await p.getByRole('button',{name:'Encender alimentación'}).click();
  await p.getByLabel('Rango: hasta').fill('0');assert.match(await p.locator('.temp-pop .lab-field-error').innerText(),/mayor que el inferior/);
  await p.getByLabel('Rango: hasta').fill('100');await p.getByRole('button',{name:'Aplicar'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
  await setBath(p,'75');await wire(p,'V','tx+','tx-');assert.equal(await reading(p),`${fmt(7.5,3)} V`);
  pass('Transmisor 0–100 °C → 0–10 V entrega 7,500 V a 75 °C');
  await equip(p,/^Transmisor de temperatura/).click();await p.locator('.temp-pop').getByRole('button',{name:'Tipo J'}).click();await p.keyboard.press('Escape');
  assert.match(await p.locator('.temp-note').innerText(),/incorrecta/);assert.notEqual(await reading(p),`${fmt(7.5,3)} V`);
  pass('Un transmisor con el tipo de termocupla equivocado avisa y entrega una lectura errónea');
  await equip(p,/^Transmisor de temperatura/).click();await p.locator('.temp-pop').getByRole('button',{name:'Tipo K'}).click();await p.keyboard.press('Escape');

  /* Datos reales separados, CSV y persistencia */
  await p.getByRole('tab',{name:'En clase'}).click();assert.equal(await p.locator('.temp-table tbody tr').count(),0);
  await p.getByLabel('Temperatura medida').fill('50,5');await p.getByLabel('Valor medido').fill('x');await p.getByRole('button',{name:'Agregar medición real'}).click();assert.match(await p.locator('.temp-real .lab-field-error').innerText(),/valor medido/);
  await p.getByLabel('Valor medido').fill('119,6');await p.getByRole('button',{name:'Agregar medición real'}).click();assert.equal(await p.locator('.temp-table tbody tr').count(),1);
  await p.getByRole('tab',{name:'Preparación'}).click();assert.ok(await p.locator('.temp-table tbody tr').count()>=8);
  const [download]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'CSV para planilla'}).click()]);const csv=fs.readFileSync(await download.path(),'utf8');
  assert.match(csv,/origen;sensor;temperatura_C/);assert.match(csv,/real;Pt100;50,5;119,60;Ω/);assert.match(csv,/simulada;Pt100;100,0;138,51;Ω/);
  pass('Las mediciones reales quedan separadas de las simuladas y el CSV las distingue (coma decimal, «;»)');
  await p.waitForTimeout(500);await p.reload();await ready(p);
  assert.ok(await p.locator('.temp-table tbody tr').count()>=8);await p.getByRole('tab',{name:'En clase'}).click();assert.equal(await p.locator('.temp-table tbody tr').count(),1);
  pass('Configuración y registros se conservan al recargar');
  /* Guardado incompatible: se conserva sin sobrescribir */
  await p.evaluate(()=>localStorage.setItem('modo:temperature:bench:free:v1','{"version":99}'));await p.reload();await ready(p);
  assert.match(await p.locator('.temp-hint').innerText(),/se conserva porque no se pudo leer/);await p.waitForTimeout(700);
  assert.equal(await p.evaluate(()=>localStorage.getItem('modo:temperature:bench:free:v1')),'{"version":99}');
  pass('Un guardado incompatible se conserva sin sobrescribir');
  await p.evaluate(()=>localStorage.removeItem('modo:temperature:bench:free:v1'));
  /* Otras herramientas intactas */
  await p.goto(base+'/laboratorio?tool=breadboard');await p.waitForSelector('.lab-canvas-workspace');assert.equal(await p.locator('.tool-temperature').count(),0);
  await p.goto(base+'/laboratorio?tool=process');await p.waitForSelector('.lab-plant');
  pass('Protoboard y Procesos siguen abriendo');
  await c.close();

  /* ── Lección en Estudio ── */
  const lesson=await context(browser,{width:1440,height:900}),q=lesson.p;
  await q.goto(base+'/estudio');await q.getByRole('button',{name:'Abrir Instrumentación Industrial',exact:true}).click();
  assert.match(await q.locator('.class-units').innerText(),/Unidad 2: Medición y actuación discreta y analógica/);
  assert.equal(await q.locator('.class-material-row',{hasText:'Temperatura ·'}).locator('.class-ready').count(),4);assert.match(await q.locator('.class-unit-pending').first().textContent(),/Falta incorporar/);
  pass('Instrumentación → Unidad 2 muestra las tres experiencias de G03 y las tres clases de detectores; las unidades sin material siguen pendientes');
  /* Experiencia 1 */
  await q.getByRole('button',{name:/Experiencia 1/}).click();await q.getByRole('button',{name:/Responder las preguntas/}).click();
  const quizItems=q.locator('.tool-study-quiz-item');assert.equal(await quizItems.count(),5);
  await quizItems.nth(0).getByRole('radio').nth(0).check();await quizItems.nth(0).getByRole('button',{name:'Comprobar respuesta'}).click();assert.equal(await quizItems.nth(0).locator('.tool-study-progress').count(),0);
  await quizItems.nth(0).getByRole('radio').nth(1).check();await quizItems.nth(0).getByRole('button',{name:'Comprobar respuesta'}).click();assert.equal(await quizItems.nth(0).locator('.tool-study-progress').count(),1);
  assert.equal(await q.evaluate(()=>JSON.parse(localStorage.getItem('modo:temperature:progress:temperatura-experiencia-1:v1')).completed.length),1);
  pass('Experiencia 1: una respuesta incorrecta no suma y la correcta guarda el avance');
  /* Experiencia 2 */
  await q.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g03-exp2&paso=1');
  await q.getByRole('link',{name:/Abrir el banco de temperatura/}).click();await ready(q);
  assert.match(await q.locator('.temp-guide').innerText(),/PASO 1 DE 6/);
  const check=async()=>{await q.getByRole('button',{name:'Comprobar mi trabajo'}).click();return q.locator('.temp-feedback').innerText();};
  assert.match(await check(),/Todavía no/);assert.equal(await q.evaluate(()=>(JSON.parse(localStorage.getItem('modo:temperature:progress:temperatura-experiencia-2:v1')||'{"completed":[]}')).completed.length),0);
  pass('Un trabajo incompleto no marca el paso como comprobado');
  await equip(q,/^Pt100 · 3 hilos, fuera del pozo/).click();await q.getByRole('button',{name:'Introducir en el pozo'}).click();await q.keyboard.press('Escape');
  await equip(q,/^Termocupla K, fuera del pozo/).click();await q.getByRole('button',{name:'Introducir en el pozo'}).click();await q.keyboard.press('Escape');
  assert.match(await check(),/Las dos sondas/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  await wire(q,'Ω','tc+','tc-');assert.match(await check(),/Todavía no/);await wire(q,'mV','tc+','tc-');assert.match(await check(),/función correcta/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  const point=async(label,sensor)=>{
    await equip(q,/^Horno de pozo seco/).click();await q.getByRole('button',{name:label}).click();await q.getByRole('button',{name:'Aplicar'}).click();await q.waitForSelector('.temp-pop',{state:'detached'});
    await q.getByRole('button',{name:'Esperar a que se estabilice'}).click();
    if(sensor==='tc')await wire(q,'mV','tc+','tc-');else await wire(q,'Ω','pt1','pt3');
    await q.getByRole('button',{name:'Registrar punto'}).click();
  };
  for(const l of [/^Ambiente ·/,/^50 °C$/,/^75 °C$/,/^100 °C$/])await point(l,'tc');
  assert.match(await check(),/cuatro puntos de la termocupla/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  await wire(q,'Ω','pt1','pt3');assert.match(await check(),/midiendo la resistencia/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  assert.match(await check(),/Todavía no/);
  for(const l of [/^Ambiente ·/,/^50 °C$/,/^75 °C$/,/^100 °C$/])await point(l,'pt');
  assert.match(await check(),/cuatro puntos del Pt100/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  await q.locator('#temp-answer').fill('0,9');assert.match(await check(),/Todavía no coincide/);
  await q.locator('#temp-answer').fill('abc');assert.match(await check(),/como número/);
  await q.locator('#temp-answer').fill(fmt((P.ptOhms(100)-P.ptOhms(22))/78,3));assert.match(await check(),/sensibilidad coincide/);
  await q.getByLabel('Mis observaciones').fill('El Pt100 sube casi linealmente.');
  const progress=await q.evaluate(()=>JSON.parse(localStorage.getItem('modo:temperature:progress:temperatura-experiencia-2:v1')));assert.deepEqual(progress.completed,[0,1,2,3,4,5]);
  await capture(q,'leccion-banco-desktop');
  pass('Experiencia 2: seis pasos comprobados con el banco real (sondas, funciones, cuatro puntos por sensor y cálculo con los datos propios)');
  await q.getByRole('link',{name:/Práctica completada · volver a Estudio/}).click();await q.waitForSelector('.tool-study');assert.match(q.url(),/paso=2/);
  const review=q.locator('.tool-study-question');await review.getByRole('radio').nth(1).check();await q.getByRole('button',{name:'Comprobar respuesta'}).click();assert.doesNotMatch(await q.locator('.tool-study-progress').innerText().catch(()=>''),/revisado/);
  await review.getByRole('radio').nth(0).check();await q.getByRole('button',{name:'Comprobar respuesta'}).click();assert.match(await q.locator('.tool-study-progress').innerText(),/concepto revisado/);
  assert.match(await q.locator('.tool-study-notes').innerText(),/casi linealmente/);
  pass('El regreso recupera la clase en «Comprobar», con la comprobación conceptual y las observaciones del banco');
  await capture(q,'estudio-comprobar-desktop');

  /* Experiencia 3 */
  await q.goto(base+'/laboratorio?tool=temperature&leccion=temperatura-experiencia-3');await ready(q);
  await equip(q,/^Termocupla K, fuera del pozo/).click();await q.getByRole('button',{name:'Introducir en el pozo'}).click();await q.keyboard.press('Escape');
  assert.match(await check(),/Todavía no/);
  await equip(q,/^Transmisor de temperatura/).click();await q.getByRole('button',{name:'Conectar entrada a la termocupla'}).click();await q.getByRole('button',{name:'Encender alimentación'}).click();await q.keyboard.press('Escape');
  assert.match(await check(),/recibe la termocupla/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  assert.match(await check(),/tipo coincide/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  await wire(q,'V','tx+','tx-');assert.match(await check(),/tensión de salida/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  for(const l of [/^Ambiente ·/,/^50 °C$/,/^75 °C$/,/^100 °C$/]){
    await equip(q,/^Horno de pozo seco/).click();await q.getByRole('button',{name:l}).click();await q.getByRole('button',{name:'Aplicar'}).click();await q.waitForSelector('.temp-pop',{state:'detached'});
    await q.getByRole('button',{name:'Esperar a que se estabilice'}).click();
    await wire(q,'mV','tc+','tc-');await q.getByRole('button',{name:'Registrar punto'}).click();await wire(q,'V','tx+','tx-');await q.getByRole('button',{name:'Registrar punto'}).click();
  }
  assert.match(await check(),/curva de la termocupla y la del transmisor/);await q.getByRole('button',{name:'Paso siguiente'}).click();
  await q.locator('#temp-answer').fill('7,5');assert.match(await check(),/coincide con el rango/);
  await q.getByRole('link',{name:/Práctica completada/}).click();await q.waitForSelector('.tool-study');
  const review3=q.locator('.tool-study-question');await review3.getByRole('radio').nth(1).check();await q.getByRole('button',{name:'Comprobar respuesta'}).click();assert.match(await q.locator('.tool-study-progress').innerText(),/concepto revisado/);
  pass('Experiencia 3: transmisor conectado, configurado y medido; curva de ambos sensores y predicción con el rango elegido');

  /* Los bancos de cada lección se guardan por separado */
  const keys=await q.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('modo:temperature:bench:')).sort());
  assert.deepEqual(keys,['modo:temperature:bench:temperatura-experiencia-2:v1','modo:temperature:bench:temperatura-experiencia-3:v1']);
  pass('Cada lección guarda su propio banco; el banco libre no se tocó');
  await lesson.c.close();

  /* ── Repaso de la guía G03 ── */
  const rv=await context(browser,{width:1440,height:900}),r=rv.p;
  await r.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g03-exp1&paso=1');
  const first=r.locator('.tool-study-quiz-item').nth(0);await first.getByRole('radio').nth(0).check();await first.getByRole('button',{name:'Comprobar respuesta'}).click();
  await first.getByRole('button',{name:'Comprobar respuesta'}).click();/* repetir no suma otro error */
  const log=()=>r.evaluate(()=>JSON.parse(localStorage.getItem('modo:temperature:review:v1')||'null'));
  assert.equal((await log()).concepts['senal-continua'].wrong,1);
  await r.goto(base+'/laboratorio?tool=temperature');await ready(r);
  await equip(r,/^Termocupla K, fuera del pozo/).click();await r.getByRole('button',{name:'Introducir en el pozo'}).click();await r.keyboard.press('Escape');
  await wire(r,'Ω','tc+','tc-');await r.waitForTimeout(300);
  await wire(r,'mV','tc+','tc-');await wire(r,'Ω','tc+','tc-');await r.waitForTimeout(300);
  const afterMisuse=await log();assert.equal(afterMisuse.concepts['funcion-medida'].wrong,2);
  pass('Los errores se anotan por concepto: una respuesta incorrecta (una sola vez por respuesta) y montajes sin sentido físico en el banco');
  await r.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g03-repaso');await r.waitForSelector('.temp-review');
  assert.match(await r.locator('.temp-review .tool-study-intro').innerText(),/Tienes 2 conceptos con errores/);
  assert.equal(await r.locator('.temp-review-list li[data-status="pendiente"]').count(),2);
  assert.match(await r.locator('.temp-review-list li[data-status="pendiente"] a').first().getAttribute('href'),/tool=temperature&leccion=temperatura-experiencia-2|clase=instrumentacion-g03-exp1/);
  const runSession=async(wrongFirst)=>{
    await r.getByRole('button',{name:/Repasar mis errores|Repasar de nuevo|Empezar repaso general/}).first().click();
    const seen=[];
    for(let i=0;i<6;i++){
      const text=await r.locator('.tool-study-question legend').innerText(),item=REV.QUESTIONS.find(x=>x.question===text);assert.ok(item,text);seen.push(item);
      const pick=wrongFirst&&i===0?(item.answer+1)%item.options.length:item.answer;
      await r.locator('.tool-study-question input[type=radio]').nth(pick).check();await r.getByRole('button',{name:'Comprobar respuesta'}).click();
      assert.match(await r.locator('.tool-study-feedback').innerText(),wrongFirst&&i===0?/^No es esa/:/^Correcto/);
      await r.getByRole('button',{name:i===5?'Ver resultado':'Siguiente'}).click();
    }
    assert.equal(new Set(seen.map(x=>x.question)).size,6);return seen;
  };
  const s1=await runSession(true);assert.equal(s1[0].concept,'funcion-medida');assert.equal(s1[1].concept,'senal-continua');
  assert.match(await r.locator('.temp-review-score').innerText(),/5 de 6 correctas/);assert.match(await r.locator('.temp-review-list').first().innerText(),/Practicar en el banco/);
  assert.equal((await log()).concepts['funcion-medida'].wrong,3);
  await capture(r,'repaso-resultado-desktop');
  await runSession(false);await runSession(false);
  await r.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g03-repaso');await r.waitForSelector('.temp-review');
  assert.equal(await r.locator('.temp-review-list li[data-status="dominado"]').count(),2);assert.equal(await r.locator('.temp-review-list li[data-status="pendiente"]').count(),0);
  await capture(r,'repaso-estado-desktop');
  pass('El repaso empieza por los conceptos con errores, no repite preguntas, explica cada respuesta y marca «Repasado» tras dos aciertos seguidos');
  await r.getByText('Borrar mi historial de repaso').click();await r.getByRole('button',{name:'Borrar historial'}).click();
  assert.deepEqual((await log()).concepts,{});
  await rv.c.close();

  /* ── Móvil 390 px ── */
  const phone=await context(browser,{width:390,height:844}),m=phone.p;
  await m.goto(base+'/laboratorio?tool=temperature');await ready(m);await m.waitForTimeout(300);await fits(m,'banco móvil');
  assert.ok(await m.locator('.lab-dock').isVisible());assert.ok(await m.locator('.lab-pan').isVisible());
  await m.getByRole('button',{name:/^Multímetro/}).click();await m.getByRole('button',{name:'mV',exact:true}).click();
  await capture(m,'banco-movil');await fits(m,'banco móvil con multímetro');
  await equip(m,/^Termocupla K, fuera del pozo/).click();await m.waitForSelector('.temp-pop',{state:'visible',timeout:5000});
  const box=await m.locator('.temp-pop').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=391,JSON.stringify(box));await capture(m,'banco-movil-edicion');
  pass('Móvil 390 px: pizarrón, dock y tarjetas accesibles, edición como hoja inferior y sin desbordamiento');
  await m.goto(base+'/laboratorio?tool=temperature&leccion=temperatura-experiencia-2');await ready(m);await m.waitForTimeout(300);await fits(m,'lección móvil');
  assert.match(await m.locator('.temp-guide').innerText(),/PASO 1 DE 6/);await capture(m,'leccion-movil');
  await m.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g03-exp2&paso=1');await m.waitForSelector('.tool-study');await fits(m,'Estudio móvil');
  pass('La lección y la clase de Estudio caben en 390 px');
  await phone.c.close();

  assert.deepEqual(report.errors,[],`errores de aplicación: ${report.errors.join(' | ')}`);
  pass('Consola sin errores de aplicación');
  fs.writeFileSync(`${out}/verification.json`,JSON.stringify({date:new Date().toISOString(),...report},null,2));
}finally{await browser.close();}})().catch(e=>{console.error('✗',e.stack||e);fs.writeFileSync(`${out}/verification-failed.json`,JSON.stringify({error:String(e.stack||e),...report},null,2));process.exit(1);});
