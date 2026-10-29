const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const model={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/learning/geogebraLessons.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,model);
const lessons=model.exports.geoLessons.filter(l=>l.unit===4),base=process.env.PANELLAB_URL||'http://127.0.0.1:4344',out=process.env.PANELLAB_QA_OUT||'qa/geo-unificado',report={base,checks:[],errors:[]};
fs.mkdirSync(out,{recursive:true});
const pass=message=>{console.log('PASS',message);report.checks.push(message)};
(async()=>{const browser=await chromium.launch();try{
 const c=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block',reducedMotion:'reduce'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(base+'/laboratorio?tool=geogebra');await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
 assert.equal(await p.locator('.lab-tool-nav').count(),0);assert.ok(await p.getByLabel('Herramienta del laboratorio',{exact:true}).isVisible());
 await p.getByRole('button',{name:'Lecciones',exact:true}).click();await p.getByLabel('Unidad de las lecciones',{exact:true}).selectOption('4');
 for(const lesson of lessons)assert.ok(await p.getByRole('link',{name:new RegExp(lesson.title)}).isVisible());
 await p.screenshot({path:out+'/catalog-desktop.png'});await p.getByRole('button',{name:'Cerrar lecciones',exact:true}).click();
 await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.evalCommand('preservar=17'));
 await p.getByRole('button',{name:'Archivos de GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Guardar GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Cerrar archivos',exact:true}).click();await p.waitForFunction(()=>localStorage.getItem('modo:geogebra:workspace:free:v1'));
 const free=await p.evaluate(()=>localStorage.getItem('modo:geogebra:workspace:free:v1'));
 pass('Barra común, sin navegación lateral distinta, catálogo visible de funciones y matrices');
 await p.getByLabel('Herramienta del laboratorio',{exact:true}).selectOption('schematic');await p.locator('.lab-split').waitFor();
 await p.getByRole('navigation',{name:'Herramientas del laboratorio'}).getByRole('button',{name:/GeoGebra/}).click();await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
 assert.equal(await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.getValue('preservar')),17);
 await p.goto(base+'/laboratorio?tool=geogebra&leccion=funciones-lineales');await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
 await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.evalCommand('f(x)=-3'));
 await p.getByRole('button',{name:'Comprobar mi trabajo',exact:true}).click();assert.equal(await p.locator('.geo-feedback.is-correct').count(),1);
 pass('Cambio de herramienta conserva el archivo; la guía existente de funciones sigue comprobando resultados');
 for(const lesson of lessons){
  await p.goto(base+model.exports.laboratoryLessonUrl(lesson));await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
  await p.getByRole('button',{name:'Comprobar mi trabajo',exact:true}).click();assert.match(await p.locator('.geo-guide .geo-feedback').innerText(),/Todavía no coincide/);
  for(const [i,step] of lesson.steps.entries()){
   assert.equal(await p.locator('.geo-guide h2').innerText(),step.title);
   for(const command of step.commands){const ok=await p.evaluate(command=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.evalCommand(command),command);assert.equal(ok,true,command);}
   await p.getByRole('button',{name:'Comprobar mi trabajo',exact:true}).click();assert.equal(await p.locator('.geo-feedback.is-correct').count(),1,lesson.id+' '+step.title);
   if(i<lesson.steps.length-1)await p.getByRole('button',{name:'Paso siguiente',exact:true}).click();
  }
  await p.getByRole('button',{name:'Archivos de GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Guardar GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Cerrar archivos',exact:true}).click();await p.waitForFunction(id=>!!localStorage.getItem(`modo:geogebra:workspace:${id}:v1`),lesson.id);
  await p.reload();await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
  assert.ok(await p.getByRole('link',{name:/Práctica completada/}).isVisible());
  await p.screenshot({path:out+'/'+lesson.id+'.png'});
  await p.getByRole('link',{name:/Práctica completada/}).click();await p.locator('.tool-study-question').waitFor();
  await p.getByRole('radio').nth(0).check();await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.ok(await p.getByText('Práctica completada y concepto revisado.',{exact:true}).isVisible());
  pass(`${lesson.title}: ${lesson.steps.length} actividades comprobadas con GeoGebra real, rechazo de trabajo vacío, guardado y revisión en Estudio`);
 }
 assert.equal(await p.evaluate(()=>localStorage.getItem('modo:geogebra:workspace:free:v1')),free);pass('Archivo libre preservado e independiente de las tres lecciones');
 await c.close();
 for(const [width,height] of [[390,844],[820,1180],[1180,820],[844,390]]){
  const c=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const p=await c.newPage();
  await p.goto(base+'/laboratorio?tool=geogebra');await p.locator('.geo-toolbar').waitFor();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const box=await p.locator('.geo-surface').boundingBox();assert.ok(box.height>90&&box.y+box.height<=height,'Applet fits screen');
  await p.getByRole('button',{name:'Lecciones',exact:true}).tap();await p.getByLabel('Unidad de las lecciones',{exact:true}).selectOption('4');await p.getByRole('link',{name:/Matrices: datos y operaciones/}).waitFor();
  const dialog=await p.getByRole('dialog',{name:'Lecciones y ejercicios',exact:true}).boundingBox();assert.ok(dialog.x>=0&&dialog.x+dialog.width<=width+1);
  await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/geo-${width}.png`});
  if(width===390){
   await p.getByRole('link',{name:/Matrices: datos y operaciones/}).click();await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
   await p.getByRole('button',{name:'Trabajo',exact:true}).tap();
   const command=p.getByLabel('Comando de GeoGebra',{exact:true});await command.fill('A={{2,1},{3,4}}');await command.press('Enter');
   await p.getByRole('button',{name:/^Lección /}).tap();await p.getByRole('button',{name:'Comprobar mi trabajo',exact:true}).tap();assert.equal(await p.locator('.geo-feedback.is-correct').count(),1);
   await p.screenshot({path:out+'/matrices-mobile.png'});pass('Móvil: comandos reales, guía reabrible y comprobación táctil de matrices');
  }
  await c.close();pass(`${width}x${height}: controles, catálogo y área de trabajo dentro de la pantalla`);
 }
 assert.deepEqual(report.errors,[]);
}finally{await browser.close();fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
