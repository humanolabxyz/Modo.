const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {academicLessons:lessons}=require('./estudio-ampliacion/models/academicContent.cjs');
const {challengeItems}=require('./estudio-ampliacion/models/academicChallenges.cjs');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4341',out='qa/estudio-ampliacion',key='modo:estudio:academic:v1';
const report={checks:[],errors:[],captures:[]},pass=s=>{report.checks.push(s);console.log('PASS',s);};
const legacy={schemaVersion:1,lesson:JSON.parse(fs.readFileSync('src/study/content/lecciones.json','utf8')).lessons[0].id,screen:'lesson',progress:{},drafts:{},practiceAnswers:{},attempts:[],exams:[]};
async function fits(p,label){assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label);}
async function screenshot(p,name){await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/${name}.png`,fullPage:true});report.captures.push(name);}
let p,visits=0;
async function go(_page,l,step=0){if(++visits%12===0){const context=p.context(),viewport=p.viewportSize();await p.close();p=await context.newPage();await p.setViewportSize(viewport);p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});}await p.goto(`${base}/estudio?curso=${l.courseId}&clase=${l.id}&paso=${step}`);await p.waitForSelector(`[data-academic="${l.id}"]`).catch(async e=>{console.log("FAILED PAGE",await p.locator("body").innerText());await screenshot(p,"failure");throw e;});await p.getByRole('button',{name:'Practicar',exact:true}).click();}
async function buildCable(p){
 const bench=p.getByRole('region',{name:'Taller virtual de cable'}),apply=bench.getByRole('button',{name:'Aplicar herramienta',exact:true});
 await bench.getByLabel('Herramienta',{exact:true}).selectOption('cut');await apply.click();
 for(const [i,pin] of [1,6,5].entries()){
  await bench.getByLabel('Conductor',{exact:true}).selectOption(String(i));
  await bench.getByLabel('Pin DB9',{exact:true}).selectOption(String(pin));
  await bench.getByLabel('Terminal de tornillos',{exact:true}).selectOption(String(i+1));
  for(const tool of ['strip','tin','solder','tight']){await bench.getByLabel('Herramienta',{exact:true}).selectOption(tool);await apply.click();}
 }
 for(const [a,b] of [['p1','t1'],['p6','t2'],['p5','t3'],['p1','p6'],['p1','p5'],['p6','p5']]){
  await bench.getByLabel('Punta A',{exact:true}).selectOption(a);await bench.getByLabel('Punta B',{exact:true}).selectOption(b);await bench.getByRole('button',{name:'Medir continuidad',exact:true}).click();
 }
 await p.getByText('Cable comprobado: tres recorridos y tres pruebas de aislamiento.',{exact:true}).waitFor();
}
async function touch(p,scene){
 if(scene==='cable'){if(!await p.getByText('Cable comprobado: tres recorridos y tres pruebas de aislamiento.',{exact:true}).count())await buildCable(p);return;}
 const region=p.locator('.academic-scene');
 if(await region.getByRole('slider').count()){await region.getByRole('slider').first().focus();await region.getByRole('slider').first().press('ArrowRight');}
 else if(await region.getByRole('combobox').count()){const select=region.getByRole('combobox').first(),options=await select.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value)),value=await select.inputValue();await select.selectOption(options.find(v=>v!==value));}
 else await region.getByRole('button').first().click();
}
(async()=>{const browser=await chromium.launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block',acceptDownloads:true});
 await context.addInitScript(({legacy})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab:estudio:v1'))localStorage.setItem('panellab:estudio:v1',JSON.stringify(legacy));},{legacy});
 p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await p.goto(base+'/estudio');await p.waitForSelector('.campus-course');assert.equal(await p.locator('.campus-course').count(),6);await fits(p,'campus desktop');await screenshot(p,'despues-desktop');
 await p.getByRole('textbox',{name:'Buscar ramo o tema',exact:true}).fill('metrología');assert.equal(await p.locator('.campus-course').count(),1);await p.getByRole('button',{name:'Abrir Instrumentación Industrial',exact:true}).click();await p.getByRole('button',{name:/Conferencia 2 · Características y metrología/}).click();await p.waitForSelector('[data-academic]');await p.locator('.study-context-back').click();assert.match(p.url(),/curso=s2-3/);await p.getByRole('button',{name:'Mis ramos',exact:true}).click();pass('Seis ramos, búsqueda de contenido, navegación de ida y vuelta');
 let total=0;
 for(const l of lessons){console.log("CLASS",l.id);
  await go(p,l);
  for(const [i,step] of l.steps.entries()){
   await p.locator('.academic-step-head h2').getByText(step.title,{exact:true}).waitFor();
   await p.getByRole('button',{name:'Practicar',exact:true}).click();
   if(step.scene)await touch(p,step.scene);
   if(step.options)await p.getByRole('radio').nth(step.correct).check();else await p.getByLabel(`Respuesta en ${step.unit}`,{exact:true}).fill(String(step.value).replace('.',','));
   await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
   await p.waitForFunction(({key,id,step})=>JSON.parse(localStorage.getItem(key)||'{}').lessons?.[id]?.steps?.[step]?.checked,{key,id:l.id,step:step.id});
   total++;
   if(i<l.steps.length-1)await p.getByRole('button',{name:'Siguiente',exact:true}).click();
  }
  await fits(p,l.id);
 }
 pass(`${lessons.length} clases y ${total} pasos: escenas, comprobación, avance y persistencia reales`);
 // Wrong answer, correction, note and reload preserve concrete data.
 const met=lessons.find(l=>l.id==='ii-metrologia');await go(p,met,2);await p.getByLabel('Respuesta en °C',{exact:true}).fill('99');await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.equal(await p.locator('.academic-correct').count(),0);await p.getByRole('button',{name:'Repasar errores',exact:true}).click();assert.match(await p.locator('.academic-step-head h2').innerText(),/promedio/);
 await p.getByLabel('Respuesta en °C',{exact:true}).fill('98,82');await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();await p.locator('.study-notebook-wrap>summary').click();await p.getByLabel('Desarrollo, fuentes y conclusión',{exact:true}).fill('Referencia externa 100 °C; no sustituir por la media.');await p.reload();await p.waitForSelector('[data-academic]');await p.getByRole('button',{name:'Practicar',exact:true}).click();await p.locator('.study-notebook-wrap>summary').click();assert.equal(await p.getByLabel('Respuesta en °C',{exact:true}).inputValue(),'98,82');assert.match(await p.getByLabel('Desarrollo, fuentes y conclusión',{exact:true}).inputValue(),/Referencia externa/);pass('Respuesta errónea, repaso de error, corrección con coma decimal y cuaderno tras recarga');
 // Original source and response do not count as an automatic physical measurement.
 await p.getByRole('button',{name:'Usar en clase',exact:true}).click();assert.equal(await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).count(),0);await p.getByText('Registrar mediciones y exportar tabla',{exact:true}).click();
 await p.getByLabel('Equipo y condiciones',{exact:true}).fill('Termómetro de clase · baño 100 °C');await p.getByLabel('Valor',{exact:true}).fill('98,7');await p.getByLabel('Unidad',{exact:true}).fill('°C');await p.getByRole('button',{name:'Añadir registro',exact:true}).click();await p.getByLabel('Origen',{exact:true}).selectOption('simulated');await p.getByLabel('Valor',{exact:true}).fill('98,82');await p.getByRole('button',{name:'Añadir registro',exact:true}).click();assert.match(await p.locator('table').innerText(),/Física anotada/);assert.match(await p.locator('table').innerText(),/Simulada/);const downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Exportar tabla CSV',exact:true}).click();const csv=await downloadPromise;await csv.saveAs(`${out}/tabla-clase.csv`);assert.match(fs.readFileSync(`${out}/tabla-clase.csv`,'utf8'),/medición física anotada/);pass('Modo en clase: registro físico y simulado distinguidos y CSV descargado');
 const cable=lessons.find(l=>l.id==='ri-cable');await go(p,cable,1);const bench=p.getByRole('region',{name:'Taller virtual de cable'});await bench.getByRole('button',{name:'Marcha HMI',exact:true}).click();assert.match(await bench.locator('output').last().innerText(),/activa/);await bench.getByLabel('Baud PLC',{exact:true}).selectOption('19200');assert.match(await bench.locator('output').last().innerText(),/Sin enlace/);await bench.getByLabel('Baud PLC',{exact:true}).selectOption('9600');assert.match(await bench.locator('output').last().innerText(),/detenida/);await bench.getByText('Provocar o reparar una falla',{exact:true}).click();await bench.getByRole('button',{name:'Puente indeseado 1–6',exact:true}).click();assert.equal(await bench.getByRole('button',{name:'Marcha HMI',exact:true}).isDisabled(),true);await bench.getByRole('button',{name:'Retirar puente 1–6',exact:true}).click();await bench.getByRole('button',{name:'Ver cara de soldadura',exact:true}).click();await screenshot(p,'taller-redes-desktop');await p.reload();await p.waitForSelector('[data-academic]');await p.getByRole('button',{name:'Practicar',exact:true}).click();assert.equal(await p.getByLabel('Pin DB9',{exact:true}).inputValue(),'1');pass('Taller real: herramientas, mediciones, falla de puente, baud, paro al perder enlace y recarga');
 for(const course of ['s2-1','s2-2','s2-3','s2-4','s2-5']){
  const l=lessons.find(l=>l.courseId===course);await go(p,l);await p.getByRole('button',{name:'Desafío del ramo',exact:true}).click();
  for(const [i,item] of challengeItems(course,0).entries())await p.getByLabel(`Desafío ${i+1} en ${item.unit}`,{exact:true}).fill(String(item.value).replace('.',','));
  await p.getByRole('button',{name:'Comprobar desafío',exact:true}).click();await p.getByText('3/3 respuestas comprobadas.',{exact:true}).waitFor();await p.getByRole('button',{name:'Nueva variante',exact:true}).click();assert.equal(await p.locator('.academic-challenge input').first().inputValue(),'');
 }
 pass('Cinco desafíos de ramo: comprobación numérica, variante nueva y avance separado');
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('panellab:estudio:v1'))),legacy);pass('Progreso previo de Protecciones conservado sin migración ni reemplazo');
 await p.goto(base+'/estudio');await p.getByText('Respaldo de las clases nuevas',{exact:true}).click();const backupPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Exportar clases nuevas',exact:true}).click();const backup=await backupPromise;await backup.saveAs(`${out}/respaldo-clases.json`);const saved=JSON.parse(fs.readFileSync(`${out}/respaldo-clases.json`));assert.equal(Object.keys(saved.lessons).length,lessons.length);await p.getByLabel('Elegir respaldo de clases nuevas',{exact:true}).setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":99,"lessons":{}}')});await p.getByText('Archivo incompatible. Tus datos actuales se conservan.',{exact:true}).waitFor();await p.getByLabel('Elegir respaldo de clases nuevas',{exact:true}).setInputFiles(`${out}/respaldo-clases.json`);await p.getByRole('button',{name:'Reemplazar clases nuevas con este respaldo',exact:true}).click();await p.getByText('Respaldo recuperado.',{exact:true}).waitFor();assert.deepEqual(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),saved);pass('Respaldo completo, rechazo de archivo incompatible e importación confirmada');
 // A corrupt or future save must never be replaced by mount/autosave.
 await p.evaluate(key=>localStorage.setItem(key,'{"version":99,"keep":"original"}'),key);await go(p,met);await p.getByRole('alert').filter({hasText:'Se conserva el original'}).waitFor();await p.getByRole('button',{name:'Siguiente',exact:true}).click();assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),'{"version":99,"keep":"original"}');await p.evaluate(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key,saved});pass('Guardado desconocido conservado íntegro al abrir y navegar');
 for(const width of [390,768]){
  await p.setViewportSize({width,height:900});await p.goto(base+'/estudio');await p.waitForSelector('.campus-course');await fits(p,'campus '+width);await screenshot(p,'despues-'+width);
  for(const id of ['ii-fundamentos','ii-metrologia','ri-teoria','ri-cable','mt-piedra','mt-energia-extension','mt-instagram','mt-stock','ea-clase-5']){const l=lessons.find(l=>l.id===id),step=l.steps.findIndex(s=>s.scene);await go(p,l,Math.max(0,step));await fits(p,`${id} ${width}`);if(width===390&&['ri-cable','ii-fundamentos','mt-stock'].includes(id))await screenshot(p,`${id}-movil`);}
 }
 pass('390 y 768 px: campus, clases, modelos, gráficas y taller sin desbordamiento');
 await go(p,lessons.find(l=>l.id==='ea-clase-1'));const radio=p.getByRole('radio').first();await radio.focus();await p.keyboard.press('ArrowDown');await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).focus();await p.keyboard.press('Enter');assert.ok(await p.locator('.academic-step-head').count());pass('Radio y comprobación mediante teclado');
 assert.deepEqual(report.errors,[]);pass('Sin errores de consola ni excepciones de navegador');await context.close();
}finally{fs.writeFileSync(`${out}/ui.json`,JSON.stringify(report,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
