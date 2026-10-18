const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4331/';
const report={checks:[],captures:[],errors:[]};
const pass=s=>{report.checks.push(s);console.log('PASS',s)};
(async()=>{
 const original=JSON.parse(fs.readFileSync('qa/estudio-v5/baseline-hashes.json','utf8').replace(/^\uFEFF/,''));
 const allowed=['src\\study\\QuickExperiment.tsx','src\\study\\Activity.tsx','src\\pages\\estudio.astro'];
 for(const f of original){const hash=crypto.createHash('sha256').update(fs.readFileSync(f.Path)).digest('hex').toUpperCase();if(hash!==f.Hash)assert.ok(allowed.includes(f.Path.split('PanelLab-INACAP\\')[1]),f.Path)}
 pass('Solo se modifica la representación de fallas en el estudio; panel, diagramas prácticos, modelos y fuentes locales intactos');
 const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:1280,height:1000},serviceWorkers:'block'});
 p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base+'estudio/?v=5');await p.locator('.lesson-journey').waitFor();await p.getByRole('button',{name:'Vamos a probar'}).click();
 const svg=p.locator('.fault-schematic>svg');
 assert.equal(await svg.locator('[data-phase]').count(),3);assert.equal(await svg.locator('[data-breaker-contact][data-open="false"]').count(),3);assert.equal(await svg.locator('[data-fault-bridge]').count(),0);
 assert.match(await svg.locator('title').textContent(),/Sobrecarga/);assert.equal(await svg.locator('[data-current-highlight]').count(),3);
 assert.ok(await svg.locator('text').allTextContents().then(t=>['L1','L2','L3','Q1','PE','M','3~','M1','U1','V1','W1','1','2','3','4','5','6'].every(s=>t.includes(s))));
 const pe=await svg.locator('[data-pe-path]').getAttribute('d');
 await p.locator('.fault-schematic').screenshot({path:'qa/estudio-v5/sobrecarga-desktop.png'});report.captures.push('sobrecarga-desktop');
 await p.getByRole('button',{name:'Cortocircuito',exact:true}).click();assert.equal(await svg.locator('[data-fault-bridge]').count(),1);assert.equal(await svg.locator('[data-current-highlight]').count(),2);assert.equal(await svg.locator('[data-fault-bridge] circle').count(),2);assert.match(await p.locator('.fault-symbol-explanation').innerText(),/puntos indican unión eléctrica/);
 await p.locator('.fault-schematic').screenshot({path:'qa/estudio-v5/corto-desktop.png'});report.captures.push('corto-desktop');
 await p.getByRole('button',{name:'Q1',exact:true}).click();assert.match(await p.locator('.fault-symbol-explanation').innerText(),/vínculo mecánico/);
 await p.getByRole('button',{name:'M1',exact:true}).click();assert.match(await p.locator('.fault-symbol-explanation').innerText(),/trifásica alterna/);
 await p.getByRole('button',{name:'PE',exact:true}).click();assert.match(await p.locator('.fault-symbol-explanation').innerText(),/No es el retorno/);
 await p.getByRole('button',{name:'Ver la apertura de Q1',exact:true}).click();assert.equal(await svg.locator('[data-breaker-contact][data-open="true"]').count(),3);assert.equal(await svg.locator('[data-current-highlight]').count(),0);assert.equal(await svg.locator('[data-pe-path]').getAttribute('d'),pe);assert.equal(await svg.locator('[data-fault-bridge]').count(),1);assert.match(await p.locator('.fault-opening-note').innerText(),/falla permanece/);
 await p.locator('.fault-schematic').screenshot({path:'qa/estudio-v5/q1-abierto-desktop.png'});report.captures.push('q1-abierto-desktop');
 pass('L1/L2/L3, tres polos, seis bornes, motor M 3~, U1/V1/W1 y PE; sobrecarga sin puente, corto L1–L2 con dos nodos; apertura de tres polos sin alterar PE ni borrar la falla');
 for(const width of [360,390,768,1280]){
  await p.setViewportSize({width,height:844});await p.getByRole('button',{name:'Sobrecarga',exact:true}).click();assert.equal(await svg.locator('[data-breaker-contact][data-open="false"]').count(),3);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('.fault-schematic').screenshot({path:`qa/estudio-v5/esquema-${width}.png`});report.captures.push(`esquema-${width}`);
  for(const box of await p.locator('.fault-symbol-buttons button').evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().height)))assert.ok(box>=44);
 }
 await p.getByRole('navigation',{name:'Secciones del estudio'}).getByRole('button',{name:'Practicar',exact:true}).click();await p.getByRole('button',{name:/Ejercicio interactivo/}).click();assert.match(await svg.locator('title').textContent(),/normal/);assert.equal(await svg.locator('[data-fault-bridge]').count(),0);
 await p.getByLabel('Situación del circuito').selectOption('corto');assert.equal(await svg.locator('[data-fault-bridge]').count(),1);await p.getByLabel('Cortocircuito',{exact:true}).check();await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.match(await p.locator('.study-feedback').innerText(),/Correcto/);
 await p.getByRole('button',{name:'Ver la apertura de Q1',exact:true}).focus();await p.keyboard.press('Enter');assert.equal(await svg.locator('[data-breaker-contact][data-open="true"]').count(),3);
 pass('Misma simbología en aprendizaje y práctica; estado normal, clasificación y accionamiento por teclado; controles de 44 px y sin desbordes en cuatro anchos');
 assert.deepEqual(report.errors,[]);pass('Sin errores de navegador');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>fs.writeFileSync('qa/estudio-v5/verification.json',JSON.stringify(report,null,2)));
