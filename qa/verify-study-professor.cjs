const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4331/';
const report={checks:[],errors:[],captures:[]};const pass=s=>{console.log('PASS',s);report.checks.push(s)};
(async()=>{
 const allowed=['src\\study\\QuickExperiment.tsx','src\\study\\Activity.tsx','src\\study\\journeyContent.ts','src\\study\\FaultSchematic.tsx','src\\styles\\study-schematic.css','src\\pages\\estudio.astro'];
 const baseline=JSON.parse(fs.readFileSync('qa/estudio-v6/baseline-hashes.json','utf8').replace(/^\uFEFF/,''));
 for(const file of baseline){const relative=file.Path.split('PanelLab-INACAP\\')[1];if(!fs.existsSync(file.Path)){assert.ok(allowed.includes(relative));continue}const hash=crypto.createHash('sha256').update(fs.readFileSync(file.Path)).digest('hex').toUpperCase();if(hash!==file.Hash)assert.ok(allowed.includes(relative),relative)}
 assert.equal(fs.existsSync('src/study/FaultSchematic.tsx'),false);
 for(const file of fs.readdirSync('src/study').filter(f=>f.endsWith('.tsx')))assert.ok(!fs.readFileSync('src/study/'+file,'utf8').includes('./FaultSchematic'));
 pass('Esquema externo Q1/M1 retirado del código activo; motor, aislación y comparación se apoyan en la lámina 3; imágenes originales y panel práctico intactos');
 const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:1280,height:1000},serviceWorkers:'block'});p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base+'estudio/?v=6');await p.locator('.lesson-journey').waitFor();await p.getByRole('button',{name:'Vamos a probar'}).click();
 assert.equal(await p.locator('.fault-schematic').count(),0);assert.equal(await p.locator('[data-comparison-state]').count(),3);assert.equal(await p.locator('[data-comparison-state="sobrecarga"]').getAttribute('data-selected'),'true');
 assert.match(await p.locator('.professor-motor-reference img').getAttribute('src'),/02_motor_electrico.jpg/);
 assert.equal(await p.locator('.professor-fault-view header a').getAttribute('href'),'/estudio/profesor.pdf#page=3');
 assert.match(await p.locator('.professor-chart-limit').innerText(),/sin escala/);
 assert.ok(!(await p.locator('.professor-fault-view').innerText()).includes('Q1'));
 await p.getByRole('button',{name:'Cortocircuito',exact:true}).click();assert.equal(await p.locator('[data-comparison-state="corto"]').getAttribute('data-selected'),'true');assert.match(await p.locator('.professor-chart-explanation').innerText(),/pérdida de aislación/);
 for(const width of [360,390,768,1280]){
  await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('.professor-fault-view').screenshot({path:`qa/estudio-v6/materia-${width}.png`});report.captures.push(`materia-${width}`);
 }
 pass('Tres condiciones conceptuales, motor gris original, referencia a la lámina 3, cambio de estado y explicación de aislación; sin bornes, conexiones ni escala numérica atribuidos al profesor');
 await p.getByRole('navigation',{name:'Secciones del estudio'}).getByRole('button',{name:'Practicar',exact:true}).click();await p.getByRole('button',{name:/Ejercicio interactivo/}).click();
 assert.equal(await p.locator('[data-comparison-state="normal"]').getAttribute('data-selected'),'true');
 await p.getByLabel('Situación del circuito').selectOption('corto');await p.getByLabel('Cortocircuito',{exact:true}).check();await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.match(await p.locator('.study-feedback').innerText(),/Correcto/);
 pass('Mismo material en el ejercicio libre; funcionamiento normal, clasificación y corrección conservados; adaptación a cuatro tamaños');
 assert.deepEqual(report.errors,[]);pass('Sin errores de navegador');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>fs.writeFileSync('qa/estudio-v6/verification.json',JSON.stringify(report,null,2)));
