const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {build}=require('esbuild');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4342',out='qa/estudio-visual',report={checks:[],errors:[]};
const pass=label=>{report.checks.push(label);console.log('PASS',label);};
(async()=>{
 await build({entryPoints:['src/study/lessonTeachings.ts','src/study/academicContent.ts'],bundle:true,platform:'node',format:'cjs',outdir:`${out}/models`,outExtension:{'.js':'.cjs'},logLevel:'silent'});
 const {lessonTeaching,teachingUnits}=require('./estudio-visual/models/lessonTeachings.cjs'),{academicLessons:lessons}=require('./estudio-visual/models/academicContent.cjs');
 let count=0;for(const lesson of lessons)for(const step of lesson.steps){const unit=lessonTeaching(lesson,step);assert.ok(unit.title&&unit.lead&&unit.action);assert.ok(unit.sections.length>=3,lesson.id);assert.ok(unit.sections.every(s=>s.title&&s.text.length>100),lesson.id);assert.ok(unit.example.steps.length>=3);count++;}
 pass(`${lessons.length} clases / ${count} pasos con explicación, conceptos, ejemplo razonado y acción relacionada`);
 for(const [file,hash] of Object.entries(JSON.parse(fs.readFileSync(`${out}/before-hashes.json`))))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);
 pass('Panel, laboratorio, solvers, datos académicos y formato de progreso conservados');
 assert.equal(teachingUnits.osi.sections.length>=3,true);
 const browser=await chromium.launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 let p=await context.newPage(),visits=0;p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const go=async(id,step=0)=>{if(++visits%12===0){const viewport=p.viewportSize();await p.close();p=await context.newPage();await p.setViewportSize(viewport);p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});}const l=lessons.find(l=>l.id===id);await p.goto(`${base}/estudio?curso=${l.courseId}&clase=${id}&paso=${step}`);await p.getByRole('region',{name:'Explicación de la materia',exact:true}).waitFor();};
 const shot=async name=>{await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/${name}.png`,fullPage:true});};
 const fits=async()=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+p.url());
 for(const lesson of lessons){await go(lesson.id);assert.ok((await p.locator('.teaching-reading-text').innerText()).length>100);assert.equal(await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).count(),0);await fits();}
 pass('Cada clase abre en la explicación, con la actividad disponible después de leer');
 await go('ri-teoria');await p.getByRole('button',{name:'PLC',exact:true}).click();assert.match(await p.locator('.teaching-focus').innerText(),/programa usa la información/);
 const before=await p.locator('.teaching-reading-text').innerText();await p.getByRole('button',{name:'Siguiente idea',exact:true}).click();assert.notEqual(await p.locator('.teaching-reading-text').innerText(),before);
 await p.getByRole('button',{name:'Ver un ejemplo',exact:true}).click();await p.getByRole('region',{name:'Ejemplo explicado',exact:true}).waitFor();
 while(await p.getByRole('button',{name:'Siguiente paso',exact:true}).count())await p.getByRole('button',{name:'Siguiente paso',exact:true}).click();
 assert.ok((await p.locator('.teaching-conclusion').innerText()).length>30);await shot('despues-ejemplo');await p.getByRole('button',{name:'Ahora practico',exact:true}).click();await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).waitFor();
 const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo:estudio:academic:v1')||'{"lessons":{}}'));assert.ok(Object.values(save.lessons).every(l=>Object.values(l.steps||{}).every(s=>!s.checked&&!s.attempts)));
 pass('Explorar equipos, leer ideas y razonar el ejemplo no aprueba automáticamente la actividad');
 const ri=lessons.find(l=>l.id==='ri-teoria');
 await go('ri-teoria',ri.steps.findIndex(s=>s.id==='codigos'));
 assert.match(await p.locator('.teaching-bit-reason').innerText(),/invierte.*alto/);await p.getByRole('button',{name:'Siguiente bit',exact:true}).click();assert.match(await p.locator('.teaching-bit-reason').innerText(),/conserva.*alto/);
 for(const name of ['NRZ-L','NRZ-I','Manchester','Manchester diferencial']){await p.getByRole('button',{name,exact:true}).click();assert.equal(await p.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true');}
 await shot('despues-codigos');pass('Codificación bit a bit: inversión, conservación y cuatro convenciones con estado inicial explícito');
 await go('ri-teoria',ri.steps.findIndex(s=>s.id==='errores'));await p.getByRole('button',{name:'Alterar fila A, columna 1',exact:true}).click();assert.match(await p.locator('.teaching-focus').innerText(),/discrepancia/);await p.getByRole('button',{name:'Restablecer los datos',exact:true}).click();assert.match(await p.locator('.teaching-focus').innerText(),/coincide/);
 await p.getByRole('button',{name:'Checksum',exact:true}).click();await p.getByRole('button',{name:'Alterar ambos bloques',exact:true}).click();assert.match(await p.locator('.teaching-sum').innerText(),/13\s*\+\s*19\s*=\s*32/);
 await p.getByRole('button',{name:'CRC',exact:true}).click();await p.getByRole('button',{name:'Alterar un bit recibido',exact:true}).click();assert.match(await p.locator('.teaching-crc').innerText(),/resto 010/);
 await p.getByRole('button',{name:'Hamming',exact:true}).click();await p.getByRole('button',{name:'Alterar posición 6 de Hamming',exact:true}).click();assert.match(await p.locator('.teaching-focus').innerText(),/Síndrome 6/);await p.getByRole('button',{name:'Alterar posición 6 de Hamming',exact:true}).click();assert.match(await p.locator('.teaching-focus').innerText(),/Sin error/);
 await shot('despues-errores');pass('LRC, colisión de suma, CRC y localización de un error Hamming comprobados con cambios reales');
 await go('ri-teoria',ri.steps.findIndex(s=>s.id==='osi'));assert.equal(await p.locator('.teaching-osi-stack button').count(),7);for(const name of ['Aplicación','Presentación','Sesión','Transporte','Red','Enlace','Física']){await p.locator('.teaching-osi-stack').getByRole('button',{name:new RegExp(name)}).click();assert.match(await p.locator('.teaching-focus h3').innerText(),new RegExp(name));}await shot('despues-osi');pass('Siete capas OSI seleccionables con su función y ejemplo');
 await p.goto(base+'/estudio');await p.waitForSelector('.campus-course');await shot('despues-inicio');
 await p.goto(base+'/estudio?curso=s2-4');await p.waitForSelector('.class-unit');await shot('despues-ramo');
 for(const width of [390,768]){await p.setViewportSize({width,height:900});for(const id of ['ri-teoria','ea-clase-1','ea-clase-3','ea-clase-4','ea-clase-5','ii-metrologia','mt-piedra']){await go(id);await fits();}await go('ri-teoria',1);await shot(`despues-codigos-${width}`);await go('ri-teoria',2);await fits();await shot(`despues-errores-${width}`);}
 pass('Explicaciones y esquemas a 390 y 768 px sin desbordamiento');
 await p.setViewportSize({width:1440,height:1000});await go('ri-teoria');await shot('despues-redes');await p.screenshot({path:`${out}/despues-redes-viewport.png`});
 const next=p.getByRole('button',{name:'Siguiente idea',exact:true});await next.focus();await p.keyboard.press('Enter');assert.match(await p.locator('.teaching-part-count').innerText(),/IDEA 2/);await go('ea-clase-2');assert.equal(await p.locator('.study-flow-line').first().evaluate(n=>getComputedStyle(n).animationName),'none');pass('Controles con teclado y respeto por movimiento reducido');
 assert.deepEqual(report.errors,[]);pass('Sin excepciones ni errores de consola');await context.close();
 }finally{await browser.close();}
 fs.writeFileSync(`${out}/teaching.json`,JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);fs.writeFileSync(`${out}/teaching.json`,JSON.stringify({...report,failure:String(e)},null,2));process.exitCode=1;});
