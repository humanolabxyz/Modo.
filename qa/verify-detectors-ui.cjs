/* Recorrido real del banco de detectores y de sus tres lecciones en Estudio (Chromium, sin simular el navegador).
 * Requiere el servidor local: npm run dev -- --port 4341  (o PANELLAB_URL). Escritorio 1440 px y móvil 390 px; la consola no debe tener errores. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4341').replace(/\/$/,''),out='qa/detectores';
const report={checks:[],errors:[],captures:[]};fs.mkdirSync(out,{recursive:true});
const pass=s=>{report.checks.push(s);console.log('✓',s);};
async function context(browser,viewport){
  const c=await browser.newContext({viewport,hasTouch:viewport.width<500,serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
  await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
  const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.stack||e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,400));});p.on('dialog',d=>d.accept());return {c,p};
}
const ready=p=>p.waitForSelector('[data-detectors-ready="true"]',{timeout:30000});
async function capture(p,name){await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));await p.waitForTimeout(250);await p.screenshot({path:`${out}/${name}.png`});report.captures.push(`${name}.png`);}
const fits=async(p,name)=>{const d=await p.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));assert.ok(d.width<=d.viewport+1,`${name}: ${JSON.stringify(d)}`);};
const TERM={'g+':/^Fuente \+24 V/,'g-':/^Fuente 0 V/,'s+':/^Detector \+V/,'s-':/^Detector 0 V/,so:/^Detector OUT/,px:/^PLC entrada X0/,pc:/^PLC S\/S/};
const reading=p=>p.locator('.temp-reading').innerText();
const svgText=p=>p.locator('svg.det-bench').textContent();
const dock=(p,name)=>p.getByRole('toolbar').getByRole('button',{name,exact:true});
async function cable(p,a,b){await dock(p,'Cable').click();await p.getByRole('button',{name:TERM[a]}).click();await p.getByRole('button',{name:TERM[b]}).click();await dock(p,'Seleccionar').click();}
async function supply(p,on=true){await p.getByRole('button',{name:/^Fuente de 24 voltios/}).click();await p.getByRole('button',{name:on?'Encender la fuente':'Apagar la fuente'}).click();await p.keyboard.press('Escape');await p.waitForSelector('.temp-pop',{state:'detached'});}
async function power(p){await cable(p,'s+','g+');await cable(p,'s-','g-');await supply(p);}
async function meter(p,red,black,mode='V'){await p.getByRole('group',{name:'Función del multímetro'}).getByRole('button',{name:mode,exact:true}).click();await p.getByLabel('Borne de la punta roja').selectOption(red);await p.getByLabel('Borne de la punta negra').selectOption(black);}
const objectButton=p=>p.getByRole('button',{name:/^(Objeto |Sin objeto frente)/});
async function object(p,material,dist){
  await objectButton(p).click();await p.locator('.temp-pop').getByRole('button',{name:material,exact:true}).click();
  if(dist)await p.locator('.temp-pop').getByRole('button',{name:dist}).click();
  await p.locator('.temp-pop').getByRole('button',{name:'Aplicar'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
}
const sensorButton=p=>p.getByRole('button',{name:/^Detector .*Abre su edición/});
async function sensor(p,...buttons){await sensorButton(p).click();for(const b of buttons)await p.locator('.temp-pop').getByRole('button',{name:b,exact:true}).click();await p.keyboard.press('Escape');await p.waitForSelector('.temp-pop',{state:'detached'});}
const record=p=>p.getByRole('button',{name:'Registrar punto'}).click();
const rows=p=>p.locator('.temp-table tbody tr');
const card=(p,name)=>p.getByRole('button',{name,exact:true});
async function openCard(p,name){const b=card(p,name);if((await b.getAttribute('aria-expanded'))!=='true')await b.click();}

(async()=>{const browser=await chromium.launch();try{
  /* ── Banco libre, escritorio ── */
  const {c,p}=await context(browser,{width:1440,height:900});
  await p.goto(base+'/laboratorio?tool=detectors');await ready(p);
  assert.equal(await p.locator('.lab-canvas-workspace.tool-detectors').count(),1);
  assert.ok(await p.locator('.lab-pan').count()===1&&await p.locator('.lab-dock').count()===1&&await p.locator('.lab-zoombar').count()===1);
  assert.ok(await p.getByRole('navigation',{name:'Herramientas del laboratorio'}).getByRole('button',{name:/Detectores/}).isVisible());
  pass('El banco usa el pizarrón del simulador: lienzo con pan/zoom, dock oscuro flotante, barra de zoom y entrada «Detectores» en el laboratorio');
  await capture(p,'banco-inicial-desktop');
  assert.match(await svgText(p),/INDUCTIVO · PNP/);assert.match(await svgText(p),/modelo y bornes pendientes de ficha/);

  /* Cables */
  await dock(p,'Cable').click();await p.getByRole('button',{name:TERM['s+']}).click();assert.match(await p.locator('.temp-hint').innerText(),/segundo borne/);
  await p.getByRole('button',{name:/^Detector \+V.*primer extremo/}).click();assert.match(await p.locator('.temp-hint').innerText(),/Pulsa un borne y luego otro/);
  await dock(p,'Seleccionar').click();
  await cable(p,'s+','g+');await cable(p,'s-','g-');await openCard(p,'Conexiones');assert.equal(await p.locator('.det-wire-list li').count(),2);
  assert.match(await p.locator('.det-wire-list').innerText(),/Detector \+V ↔ Fuente \+24 V/);
  await cable(p,'g+','s+');assert.equal(await p.locator('.det-wire-list li').count(),1);await cable(p,'s+','g+');assert.equal(await p.locator('.det-wire-list li').count(),2);
  pass('Los cables se tienden pulsando dos bornes, un cable repetido se quita y la tarjeta «Conexiones» es el diagrama de conexión');
  await p.getByRole('button',{name:/^Quitar cable Detector 0 V ↔ Fuente 0 V/}).click();assert.equal(await p.locator('.det-wire-list li').count(),1);await cable(p,'s-','g-');

  /* Fuente, multímetro y registro */
  await supply(p);assert.match(await svgText(p),/24,00/);
  await meter(p,'so','g-');await object(p,'Metal (acero)',/^Dentro/);
  assert.equal(await reading(p),'24,00 V');assert.match(await p.locator('.det-status').innerText(),/Detecta el objeto/);
  await record(p);assert.equal(await rows(p).count(),1);
  await object(p,'Sin objeto');assert.equal(await reading(p),'0,00 V');await record(p);
  await object(p,'No metálico (plástico)',/^Dentro/);assert.equal(await reading(p),'0,00 V');assert.match(await p.locator('.det-status').innerText(),/sin detección/);await record(p);
  assert.equal(await rows(p).count(),3);
  const t1=await p.locator('.temp-table tbody').innerText();assert.match(t1,/Alto \(24 V\)/);assert.match(t1,/Bajo \(0 V\)/);assert.match(t1,/no detectado/);
  pass('Inductivo PNP: 24 V con metal dentro del alcance, 0 V sin objeto y con plástico; la tabla clasifica alto y bajo');
  await capture(p,'banco-registros-desktop');

  await sensor(p,'Capacitivo');await object(p,'Metal (acero)',/^Dentro/);assert.equal(await reading(p),'24,00 V');await record(p);
  await object(p,'No metálico (plástico)',/^Dentro/);assert.equal(await reading(p),'24,00 V');await record(p);
  await sensor(p,'Fotoeléctrico');await object(p,'No metálico (plástico)',/^Dentro/);assert.equal(await reading(p),'24,00 V');await record(p);
  await object(p,'No metálico (plástico)',/^Fuera/);assert.equal(await reading(p),'0,00 V');
  pass('El capacitivo y el fotoeléctrico detectan metal y plástico; fuera del alcance la salida vuelve a 0 V');
  await sensor(p,'Inductivo','NPN');await object(p,'Metal (acero)',/^Dentro/);
  assert.equal(await reading(p),'0,00 V');await meter(p,'g+','so');assert.equal(await reading(p),'24,00 V');await record(p);await meter(p,'so','g+');assert.equal(await reading(p),'−24,00 V'.replace('−','-'));
  await meter(p,'so','g-');await record(p);
  assert.match(await p.locator('.temp-note').innerText(),/respecto a 0 V/);
  pass('NPN: contra 0 V queda en 0 V y los 24 V aparecen entre +V y OUT; invertir las puntas invierte el signo');
  await sensor(p,'PNP');

  /* Situaciones erróneas */
  await meter(p,'so','g-','OFF');assert.equal(await p.getByRole('button',{name:'Registrar punto'}).isDisabled(),true);assert.match(await p.locator('.temp-why').innerText(),/Enciende el multímetro/);
  await meter(p,'g+','g-');assert.equal(await reading(p),'24,00 V');assert.equal(await p.getByRole('button',{name:'Registrar punto'}).isDisabled(),true);assert.match(await p.locator('.temp-why').innerText(),/Mide la salida/);
  await p.getByRole('button',{name:/^Quitar cable Detector \+V/}).click();await p.getByRole('button',{name:/^Quitar cable Detector 0 V/}).click();
  await cable(p,'s+','g-');await cable(p,'s-','g+');assert.match(await p.locator('.temp-meter-card [role=alert]').first().innerText(),/Alimentación invertida/);
  assert.match(await p.locator('.det-status').innerText(),/Sin alimentación válida/);
  await p.getByRole('button',{name:/^Quitar cable Detector \+V ↔ Fuente 0 V/}).click();await p.getByRole('button',{name:/^Quitar cable Detector 0 V ↔ Fuente \+24 V/}).click();
  await cable(p,'g+','g-');assert.match(await p.locator('.temp-meter-card [role=alert]').first().innerText(),/Cortocircuito/);await p.getByRole('button',{name:/^Quitar cable Fuente \+24 V ↔ Fuente 0 V/}).click();
  await cable(p,'s+','g+');await cable(p,'s-','g-');
  pass('Multímetro apagado, puntas fuera de la salida, polaridad invertida y cortocircuito se explican y no se pueden registrar');

  /* Gráfica y datos reales separados */
  await meter(p,'so','g-');await openCard(p,'Gráfica');
  await p.getByLabel('Detector de la gráfica').selectOption('inductive-pnp');assert.equal(await p.locator('.temp-chart .p-sim').count(),3);await capture(p,'banco-grafica-desktop');
  await p.getByRole('tab',{name:'En clase'}).click();assert.equal(await rows(p).count(),0);
  await p.getByLabel('Tensión medida').fill('x');await p.getByRole('button',{name:'Agregar medición real'}).click();assert.match(await p.locator('.temp-real .lab-field-error').innerText(),/tensión medida/);
  await p.getByLabel('Tensión medida').fill('23,8');await p.getByRole('button',{name:'Agregar medición real'}).click();assert.equal(await rows(p).count(),1);
  assert.equal(await p.locator('.temp-chart .p-real').count(),1);
  await p.getByRole('tab',{name:'Preparación'}).click();const prep=await rows(p).count();assert.ok(prep>=6);
  const [download]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'CSV para planilla'}).click()]);const csv=fs.readFileSync(await download.path(),'utf8');
  assert.match(csv,/origen;detector;objeto/);assert.match(csv,/real;Inductivo PNP;Metal \(acero\);sí;OUT-0V;23,80/);assert.match(csv,/simulada;Inductivo PNP;Metal \(acero\);sí;OUT-0V;24,00/);
  pass('La gráfica muestra puntos simulados y reales por separado; las mediciones reales quedan en «En clase» y el CSV las distingue');

  /* PLC */
  await object(p,'Metal (acero)',/^Dentro/);
  await cable(p,'so','px');assert.match(await svgText(p),/X0 OFF/);await cable(p,'pc','g-');
  assert.match(await svgText(p),/X0 ON/);assert.match(await svgText(p),/tensión de entrada 24,00 V/);await capture(p,'banco-plc-desktop');
  await object(p,'Sin objeto');assert.match(await svgText(p),/X0 OFF/);
  await object(p,'Metal (acero)',/^Dentro/);assert.match(await svgText(p),/X0 ON/);
  await p.getByRole('button',{name:/^Quitar cable PLC S\/S \(común\) ↔ Fuente 0 V/}).click();await cable(p,'pc','g+');assert.match(await svgText(p),/X0 OFF/);
  await p.getByRole('button',{name:/^Quitar cable PLC S\/S \(común\) ↔ Fuente \+24 V/}).click();await cable(p,'pc','g-');
  await sensor(p,'NPN');assert.match(await svgText(p),/X0 OFF/);
  await p.getByRole('button',{name:/^Quitar cable PLC S\/S/}).click();await cable(p,'pc','g+');assert.match(await svgText(p),/X0 ON/);
  await sensor(p,'PNP');
  pass('Entrada de PLC: un PNP con COM a 0 V da X0 = 24 V (ON) y se apaga sin objeto; un NPN solo la activa con COM a +24 V');

  /* Fichas pendientes: nada inventado */
  await sensorButton(p).click();await p.getByLabel('Modelo del detector').selectOption('CR30-15DN');
  assert.match(await p.locator('.temp-pop [role=alert]').innerText(),/pendiente de ficha técnica/);await p.getByRole('button',{name:'Cerrar edición'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
  assert.match(await svgText(p),/pendiente de ficha técnica/);assert.equal(await p.getByRole('button',{name:'Registrar punto'}).isDisabled(),true);assert.match(await p.locator('.temp-why').innerText(),/CR30-15DN: pendiente de ficha técnica/);
  await openCard(p,'Fichas');assert.equal(await p.locator('.det-ficha').count(),4);assert.equal(await p.locator('.det-ficha summary span.ok').count(),0);
  assert.deepEqual(await p.locator('.det-ficha input').evaluateAll(l=>l.map(i=>i.value)),['','','','','','','','','','','','']);
  assert.match(await p.locator('.det-ficha').first().innerText(),/pendiente de ficha técnica/);
  pass('Los cuatro modelos de G02 aparecen pendientes de ficha técnica, sin ningún dato precargado, y no se pueden simular ni registrar');
  await p.getByLabel('CR30-15DN · marca').fill('Prueba');await p.getByLabel('CR30-15DN · hilos').selectOption('3');await p.getByLabel('CR30-15DN · principio').selectOption('inductive');await p.getByLabel('CR30-15DN · salida').selectOption('npn');await p.getByLabel('CR30-15DN · alimentación').fill('prueba');await p.getByLabel('CR30-15DN · distancia de detección').fill('15');
  assert.match(await p.locator('.det-ficha').first().innerText(),/completa/);assert.match(await svgText(p),/CR30-15DN/);assert.match(await svgText(p),/INDUCTIVO · NPN/);assert.match(await p.locator('.det-status').innerText(),/según tu ficha/);
  await p.getByLabel('CR30-15DN · hilos').selectOption('2');assert.match(await p.locator('.det-status').innerText(),/Detector sin datos/);assert.match(await p.locator('.temp-why').innerText(),/3 hilos/);
  await p.getByLabel('CR30-15DN · hilos').selectOption('3');
  pass('Con la ficha escrita por el estudiante el modelo se simula (aquí un NPN de 15 mm); con 2 hilos el banco avisa que no lo simula');

  /* Fichas citadas y aspecto de los equipos */
  await p.locator('summary',{hasText:'BR100-DDT-P'}).click();await p.getByRole('button',{name:'BR100-DDT-P · usar los datos de la ficha citada'}).click();
  await sensorButton(p).click();await p.getByLabel('Modelo del detector').selectOption('BR100-DDT-P');
  assert.match(await p.locator('.temp-pop').innerText(),/según tu ficha; 4\.º hilo sin modelar/);
  await p.locator('.temp-pop').getByRole('button',{name:'Ver ficha del equipo'}).click();await p.waitForSelector('.temp-sheet-window');
  assert.equal(await p.locator('.temp-sheet-window details[open]').getAttribute('data-sheet'),'BR100-DDT-P');
  const sheetText=await p.locator('.temp-sheet-window details[open]').innerText();assert.match(sheetText,/reflexión difusa/);assert.match(sheetText,/pendiente/i);assert.match(sheetText,/Colores y cantidad exacta de hilos/);
  assert.ok(await p.locator('.temp-sheet-window details[open] a[href^="https://"]').count()>=2);
  assert.equal(await p.locator('.temp-sheet-window .temp-sheet').count(),11);
  await p.getByRole('button',{name:'Cerrar las fichas'}).click();await p.waitForSelector('.temp-sheet-window',{state:'detached'});
  await p.getByRole('button',{name:'Cerrar edición'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
  assert.match(await svgText(p),/FOTOELÉCTRICO · PNP · M18/);assert.match(await svgText(p),/color pendiente/);await capture(p,'detector-br100-desktop');
  await p.getByRole('button',{name:'Cerrar edición'}).click().catch(()=>{});
  await p.locator('summary',{hasText:'CR30-15DP'}).click();await p.getByRole('button',{name:'CR30-15DP · usar los datos de la ficha citada'}).click();
  await sensorButton(p).click();await p.getByLabel('Modelo del detector').selectOption('CR30-15DP');await p.getByRole('button',{name:'Cerrar edición'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
  assert.match(await svgText(p),/CAPACITIVO · PNP · M30/);assert.match(await svgText(p),/marrón/);await capture(p,'detector-cr30-desktop');
  await p.locator('summary',{hasText:'XS118BLPAL2'}).click();await p.getByRole('button',{name:'XS118BLPAL2 · usar los datos de la ficha citada'}).click();
  await sensorButton(p).click();await p.getByLabel('Modelo del detector').selectOption('XS118BLPAL2');await p.getByRole('button',{name:'Cerrar edición'}).click();await p.waitForSelector('.temp-pop',{state:'detached'});
  assert.match(await svgText(p),/INDUCTIVO · PNP · M18/);
  await p.keyboard.press('f');await p.waitForSelector('.temp-sheet-window');await p.getByRole('button',{name:'Cerrar las fichas'}).click();
  await p.getByRole('button',{name:/^Fuente de 24 voltios/}).click();await p.locator('.temp-pop').getByRole('button',{name:'Ver ficha del equipo'}).click();await p.waitForSelector('.temp-sheet-window');
  assert.equal(await p.locator('.temp-sheet-window details[open]').getAttribute('data-sheet'),'psu');await p.getByRole('button',{name:'Cerrar las fichas'}).click();await p.getByRole('button',{name:'Cerrar edición'}).click();
  pass('Cada equipo tiene su ficha con fuentes y pendientes: «Ver ficha del equipo» abre la correcta, la ventana del dock lista las 11, y el dibujo cambia con el modelo (M30 capacitivo, M18 inductivo, fotoeléctrico con hilos pendientes)');

  /* Persistencia y guardado incompatible */
  await p.waitForTimeout(600);await p.reload();await ready(p);
  assert.ok(await rows(p).count()>=6);await openCard(p,'Conexiones');assert.ok(await p.locator('.det-wire-list li').count()>=4);
  await p.getByRole('tab',{name:'En clase'}).click();assert.equal(await rows(p).count(),1);
  pass('Configuración, cables, fichas y registros se conservan al recargar');
  await p.evaluate(()=>localStorage.setItem('modo:detectors:bench:free:v1','{"version":99}'));await p.reload();await ready(p);
  assert.match(await p.locator('.temp-hint').innerText(),/se conserva porque no se pudo leer/);await p.waitForTimeout(700);
  assert.equal(await p.evaluate(()=>localStorage.getItem('modo:detectors:bench:free:v1')),'{"version":99}');
  pass('Un guardado incompatible se conserva sin sobrescribir');
  await p.evaluate(()=>localStorage.removeItem('modo:detectors:bench:free:v1'));
  for(const tool of ['breadboard','temperature','process']){await p.goto(base+`/laboratorio?tool=${tool}`);await p.waitForSelector(tool==='process'?'.lab-plant':'.lab-canvas-workspace');assert.equal(await p.locator('.tool-detectors').count(),0);}
  pass('Protoboard, Temperatura y Procesos siguen abriendo');
  await c.close();

  /* ── Lecciones en Estudio ── */
  const lesson=await context(browser,{width:1440,height:900}),q=lesson.p;
  await q.goto(base+'/estudio');await q.getByRole('button',{name:'Abrir Instrumentación Industrial',exact:true}).click();
  assert.match(await q.locator('.class-units').innerText(),/Unidad 2: Medición y actuación discreta y analógica/);
  const det=q.locator('.class-material-row').filter({hasText:/Detectores ·|Proximidad y PLC ·/});assert.equal(await det.count(),3);assert.equal(await det.locator('.class-ready').count(),3);assert.ok(await q.locator('.class-material-row',{hasText:'Temperatura ·'}).count()>=3);
  pass('Estudio → Instrumentación → Unidad 2 muestra las tres clases de G01/G02 junto a las de temperatura; las unidades sin material siguen pendientes');
  await capture(q,'estudio-unidad2-desktop');

  /* G01 experiencia 1: investigar y explicar */
  await q.getByRole('button',{name:/Guía 1, experiencia 1/}).click();await q.getByRole('button',{name:/Responder las preguntas/}).click();
  const items=q.locator('.tool-study-quiz-item');assert.equal(await items.count(),5);
  await items.nth(0).getByRole('radio').nth(0).check();await items.nth(0).getByRole('button',{name:'Comprobar respuesta'}).click();assert.equal(await items.nth(0).locator('.tool-study-progress').count(),0);
  const answers=[1,1,1,0,1];
  for(let i=0;i<5;i++){await items.nth(i).getByRole('radio').nth(answers[i]).check();await items.nth(i).getByRole('button',{name:'Comprobar respuesta'}).click();}
  assert.equal(await q.evaluate(()=>JSON.parse(localStorage.getItem('modo:detectors:progress:detectores-experiencia-1:v1')).completed.length),5);
  await q.getByLabel(/Plan de la presentación grupal/).fill('Exponer principios, hilos y salida.');await q.waitForTimeout(200);
  assert.match(await q.evaluate(()=>JSON.parse(localStorage.getItem('modo:detectors:progress:detectores-experiencia-1:v1')).notes),/Exponer principios/);
  assert.match(await q.locator('.tool-study-body').innerText(),/actividad completada/);
  pass('G01 experiencia 1: una respuesta incorrecta no suma, las cinco correctas completan la actividad y el plan de la exposición se guarda aparte');
  await capture(q,'estudio-g01-exp1-desktop');

  /* G01 experiencia 2: montar y medir */
  await q.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g01-exp2&paso=1');
  await q.getByRole('link',{name:/Abrir el banco de detectores/}).click();await ready(q);
  assert.match(await q.locator('.temp-guide').innerText(),/PASO 1 DE 8/);
  const check=async()=>{await q.getByRole('button',{name:'Comprobar mi trabajo'}).click();return q.locator('.temp-feedback').innerText();};
  const next=()=>q.getByRole('button',{name:'Paso siguiente'}).click();
  assert.match(await check(),/Todavía no/);assert.equal(await q.evaluate(()=>(JSON.parse(localStorage.getItem('modo:detectors:progress:detectores-experiencia-2:v1')||'{"completed":[]}')).completed.length),0);
  pass('Un trabajo incompleto no marca el paso como comprobado');
  await cable(q,'s+','g+');await cable(q,'s-','g-');assert.match(await check(),/Todavía no/);await supply(q);assert.match(await check(),/polaridad correcta/);await next();
  await meter(q,'so','g-');await object(q,'Sin objeto');assert.match(await check(),/Todavía no/);await record(q);assert.match(await check(),/sin objeto/);await next();
  await object(q,'Metal (acero)',/^Dentro/);await record(q);assert.match(await check(),/detecta el metal/);await next();
  await object(q,'No metálico (plástico)',/^Dentro/);await record(q);assert.match(await check(),/no detecta el plástico/);await next();
  await sensor(q,'Capacitivo');await object(q,'Metal (acero)',/^Dentro/);await record(q);assert.match(await check(),/Todavía no/);await object(q,'No metálico (plástico)',/^Dentro/);await record(q);assert.match(await check(),/ambos materiales/);await next();
  await sensor(q,'Fotoeléctrico');await object(q,'Sin objeto');await record(q);await object(q,'Metal (acero)',/^Dentro/);await record(q);assert.match(await check(),/con y sin objeto/);await next();
  await sensor(q,'Inductivo','NPN');await object(q,'Metal (acero)',/^Dentro/);await meter(q,'g+','so');await record(q);assert.match(await check(),/NPN medido contra \+V/);await next();
  await q.locator('#temp-answer').fill('24');assert.match(await check(),/Registra primero/);
  await meter(q,'so','g-');await record(q);await q.locator('#temp-answer').fill('24');assert.match(await check(),/Todavía no coincide/);await q.locator('#temp-answer').fill('abc');assert.match(await check(),/como número/);
  await q.locator('#temp-answer').fill('0');assert.match(await check(),/NPN activa queda en 0 V/);
  await q.getByLabel('Mis observaciones').fill('El inductivo ignora el plástico.');
  const prog=await q.evaluate(()=>JSON.parse(localStorage.getItem('modo:detectors:progress:detectores-experiencia-2:v1')));assert.deepEqual(prog.completed,[0,1,2,3,4,5,6,7]);
  await capture(q,'leccion-banco-desktop');
  pass('G01 experiencia 2: ocho pasos comprobados con el banco real (montaje, objeto metálico y no metálico, tres principios, NPN y lectura de la propia tabla)');
  await q.getByRole('link',{name:/Práctica completada · volver a Estudio/}).click();await q.waitForSelector('.tool-study');assert.match(q.url(),/paso=2/);
  const rev=q.locator('.tool-study-question');await rev.getByRole('radio').nth(0).check();await q.getByRole('button',{name:'Comprobar respuesta'}).click();assert.doesNotMatch(await q.locator('.tool-study-progress').innerText().catch(()=>''),/revisado/);
  await rev.getByRole('radio').nth(1).check();await q.getByRole('button',{name:'Comprobar respuesta'}).click();assert.match(await q.locator('.tool-study-progress').innerText(),/concepto revisado/);
  assert.match(await q.locator('.tool-study-notes').innerText(),/ignora el plástico/);
  pass('El regreso recupera la clase en «Comprobar», con la comprobación conceptual y las observaciones del banco');
  await capture(q,'estudio-comprobar-desktop');

  /* G02 proximidad y PLC */
  await q.goto(base+'/laboratorio?tool=detectors&leccion=proximidad-plc-g02');await ready(q);
  assert.match(await q.locator('.temp-guide').innerText(),/PASO 1 DE 7/);
  assert.match(await check(),/Todavía no/);
  await openCard(q,'Fichas');
  for(const m of ['CR30-15DN','CR30-15DP','XS118BLPAL2','BR100-DDT-P']){
    if(!(await q.getByLabel(`${m} · marca`).isVisible()))await q.locator('summary',{hasText:m}).click();
    const npn=m.endsWith('DN')||m==='XS118BLPAL2';
    await q.getByLabel(`${m} · marca`).fill('Ficha de prueba');await q.getByLabel(`${m} · hilos`).selectOption('3');await q.getByLabel(`${m} · principio`).selectOption(m==='BR100-DDT-P'?'photo':m==='XS118BLPAL2'?'capacitive':'inductive');await q.getByLabel(`${m} · salida`).selectOption(npn?'npn':'pnp');await q.getByLabel(`${m} · alimentación`).fill('prueba');await q.getByLabel(`${m} · distancia de detección`).fill(m==='BR100-DDT-P'?'100':'15');
  }
  assert.match(await check(),/cuatro fichas/);assert.match(await q.locator('.temp-feedback').innerText(),/no evalúa si coinciden/);await next();
  await sensorButton(q).click();await q.getByLabel('Modelo del detector').selectOption('CR30-15DP');await q.getByRole('button',{name:'Cerrar edición'}).click();await q.waitForSelector('.temp-pop',{state:'detached'});
  assert.match(await check(),/Todavía no/);await cable(q,'s+','g+');await cable(q,'s-','g-');await supply(q);assert.match(await check(),/alimentado según tu ficha/);await next();
  await meter(q,'so','g-');await object(q,'Sin objeto');await record(q);assert.match(await check(),/sin objeto/);await next();
  await object(q,'Metal (acero)',/^Dentro/);assert.equal(await reading(q),'24,00 V');await record(q);assert.match(await check(),/objeto detectado/);await next();
  assert.match(await check(),/Todavía no/);await cable(q,'so','px');await cable(q,'pc','g-');assert.match(await check(),/X0 lee 24 V/);await next();
  assert.match(await check(),/Todavía no/);await object(q,'Sin objeto');assert.match(await check(),/vuelve a OFF/);await next();
  await openCard(q,'Conexiones');assert.equal(await q.locator('.det-wire-list li').count(),4);
  await q.locator('#temp-answer').fill('3');assert.match(await check(),/Todavía no coincide/);await q.locator('#temp-answer').fill('4');assert.match(await check(),/Cuentas bien/);
  await q.getByLabel('Mis observaciones').fill('Conclusión individual de prueba.');
  const g02=await q.evaluate(()=>JSON.parse(localStorage.getItem('modo:detectors:progress:proximidad-plc-g02:v1')));assert.deepEqual(g02.completed,[0,1,2,3,4,5,6]);
  await capture(q,'leccion-g02-desktop');
  pass('G02: fichas de los cuatro modelos, detector asignado alimentado, medición con y sin objeto, entrada de PLC ON con objeto y OFF sin él, y diagrama de conexión');
  await q.getByRole('link',{name:/Práctica completada · volver a Estudio/}).click();await q.waitForSelector('.tool-study');
  const rev2=q.locator('.tool-study-question');await rev2.getByRole('radio').nth(1).check();await q.getByRole('button',{name:'Comprobar respuesta'}).click();assert.match(await q.locator('.tool-study-progress').innerText(),/concepto revisado/);
  const keys=await q.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('modo:detectors:bench:')).sort());
  assert.deepEqual(keys,['modo:detectors:bench:proximidad-plc-g02:v1','modo:detectors:bench:detectores-experiencia-2:v1'].sort());
  pass('Cada lección guarda su propio banco; el banco libre no se tocó y G02 conserva el conteo de cables, las fichas y las observaciones');
  await q.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g02&paso=1');await q.waitForSelector('.tool-study');
  assert.match(await q.locator('.tool-study-note').innerText(),/pendientes de ficha técnica/);assert.match(await q.locator('.tool-study-note').innerText(),/maqueta Delta/);
  await q.goto(base+'/estudio?curso=s2-3&clase=instrumentacion-g02&paso=0');await q.getByText('Fichas de los equipos del banco').click();
  assert.equal(await q.locator('.tool-study-sheets .temp-sheet').count(),11);assert.ok(await q.locator('.tool-study-sheets a',{hasText:'Autonics · catálogo de la serie CR'}).count()>=1);
  assert.match(await q.locator('.tool-study-sheets').textContent(),/Colores y cantidad exacta de hilos/);
  pass('La clase de Estudio lista las fichas de los equipos con sus fuentes');
  await lesson.c.close();

  /* ── Móvil 390 px ── */
  const phone=await context(browser,{width:390,height:844}),m=phone.p;
  await m.goto(base+'/laboratorio?tool=detectors');await ready(m);await m.waitForTimeout(300);await fits(m,'banco móvil');
  assert.ok(await m.locator('.lab-dock').isVisible());assert.ok(await m.locator('.lab-pan').isVisible());
  await m.getByRole('button',{name:/^Multímetro/}).click();await capture(m,'banco-movil');await fits(m,'banco móvil con multímetro');
  await m.getByRole('button',{name:/^Fuente de 24 voltios/}).click();await m.waitForSelector('.temp-pop',{state:'visible',timeout:5000});
  const box=await m.locator('.temp-pop').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=391,JSON.stringify(box));await capture(m,'banco-movil-edicion');
  pass('Móvil 390 px: pizarrón, dock y tarjetas accesibles, edición como hoja inferior y sin desbordamiento');
  for(const id of ['detectores-experiencia-2','proximidad-plc-g02']){
    await m.goto(base+`/laboratorio?tool=detectors&leccion=${id}`);await ready(m);await m.waitForTimeout(300);await fits(m,`lección móvil ${id}`);
    assert.match(await m.locator('.temp-guide').innerText(),/PASO 1 DE/);
  }
  await capture(m,'leccion-movil');
  await m.getByRole('button',{name:'Guía de la práctica'}).click();await m.getByRole('button',{name:'Fichas',exact:true}).click();await fits(m,'fichas móvil');await capture(m,'fichas-movil');
  for(const clase of ['instrumentacion-g01-exp1','instrumentacion-g01-exp2','instrumentacion-g02']){await m.goto(base+`/estudio?curso=s2-3&clase=${clase}&paso=1`);await m.waitForSelector('.tool-study');await fits(m,`Estudio móvil ${clase}`);}
  await capture(m,'estudio-movil');
  pass('Las lecciones y las clases de Estudio caben en 390 px');
  await phone.c.close();

  assert.deepEqual(report.errors,[],`errores de aplicación: ${report.errors.join(' | ')}`);
  pass('Consola sin errores de aplicación');
  fs.writeFileSync(`${out}/verification.json`,JSON.stringify({date:new Date().toISOString(),...report},null,2));
}finally{await browser.close();}})().catch(e=>{console.error('✗',e.stack||e);fs.writeFileSync(`${out}/verification-failed.json`,JSON.stringify({error:String(e.stack||e),...report},null,2));process.exit(1);});
