const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4342',out=process.env.PANELLAB_QA_OUT||'qa/inicio-mejora',report={base,checks:[],errors:[]};
fs.mkdirSync(out,{recursive:true});const pass=s=>{report.checks.push(s);console.log('PASS',s);};
(async()=>{const browser=await chromium.launch();try{
 for(const [file,hash] of Object.entries(JSON.parse(fs.readFileSync('qa/inicio-mejora/protected-hashes.json'))))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);
 pass('Simulador, datos, prácticas y materia conservan sus hashes');
 const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'});await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 for(const width of [360,390,768,1024,1440,1920]){await p.setViewportSize({width,height:1000});await p.goto(base+'/');await p.waitForSelector('.modo-home');await p.locator('.modo-primary:not(:disabled)').waitFor();await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.locator('.modo-home .study-exam-focus').count(),0);assert.doesNotMatch(await p.locator('.modo-home').innerText(),/prueba del lunes 19|Preparar la prueba|FOCO EN ÁLGEBRA/);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${width}`);
  assert.equal(await p.locator('.modo-laboratory-tools a').count(),8);assert.equal(await p.locator('#learning-mode option').count(),4);
  assert.equal(await p.locator('.modo-home-shortcuts a').count(),3);
  assert.ok(await p.locator('.modo-home .modo-card').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(n).boxShadow==='none')),'Las secciones deben ser abiertas, sin cajas');
  for(const link of await p.locator('.modo-home-shortcuts a,.modo-laboratory-tools a').all()){const rect=await link.boundingBox();assert.ok(rect.height>=44);}
  assert.ok(await p.evaluate(()=>document.querySelector('.modo-recent').getBoundingClientRect().top<document.querySelector('.modo-community').getBoundingClientRect().top));
  await p.screenshot({path:`${out}/despues-${width}.png`,fullPage:true});
 }
 pass('Inicio sin aviso de prueba; tres accesos y ocho herramientas utilizables a 360/390/768/1024/1440/1920 px');
 await p.getByRole('heading',{name:'Empieza a practicar',exact:true}).waitFor();await p.locator('.modo-continue').click();await p.locator('.editor-workbench').waitFor();await p.getByRole('button',{name:'Inicio',exact:true}).click();await p.locator('.modo-home').waitFor();
 await p.locator('.modo-home-shortcuts a[href="/estudio"]').click();await p.locator('.campus-course').first().waitFor();await p.getByRole('link',{name:'Preparar la prueba',exact:true}).waitFor();
 pass('El panel abre y regresa al inicio; el aviso de la prueba permanece dentro de Estudio');
 await p.goto(base+'/');await p.locator('.modo-home').waitFor();await p.locator('.modo-study').click();await p.locator('.campus-course').first().waitFor();
 await p.goto(base+'/');await p.locator('.modo-home').waitFor();await p.locator('.modo-laboratory-open').click();await p.waitForURL(/laboratorio/);
 pass('Tarjetas de Estudio y laboratorio conservan sus destinos');
 const savedContext=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'});
 await savedContext.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-practice-v2'))localStorage.setItem('panellab-practice-v2',JSON.stringify({version:2,title:'Práctica conservada',wires:[{id:'home-qa',from:{terminalId:'CONTACTOR_TERMICO:95'},to:{terminalId:'CONTACTOR_TERMICO:96'},color:'#145650',layer:0}],steps:[],mode:'free',stepIndex:0,diagram:null}));});
 const saved=await savedContext.newPage();await saved.goto(base+'/');await saved.getByRole('heading',{name:'Tu práctica actual',exact:true}).waitFor();await saved.locator('.modo-continue:not(:disabled)').waitFor();const prior=await saved.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')));await saved.locator('.modo-continue').click();await saved.locator('.editor-workbench').waitFor();assert.deepEqual(await saved.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2'))),prior);await saved.getByRole('button',{name:'Inicio',exact:true}).click();await saved.getByRole('heading',{name:'Tu práctica actual',exact:true}).waitFor();await savedContext.close();
 pass('Una práctica con cable guardado se reconoce y continúa sin reemplazar su documento');
 assert.deepEqual(report.errors,[]);pass('Sin excepciones ni errores de consola');
 }finally{await browser.close();fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1;});
