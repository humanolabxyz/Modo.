const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4342',out=process.env.PANELLAB_QA_OUT||'qa/estudio-unificado',report={base,checks:[],errors:[]};
fs.mkdirSync(out,{recursive:true});
const pass=msg=>{report.checks.push(msg);console.log('PASS',msg);};
(async()=>{
 const browser=await chromium.launch();
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 let p=await context.newPage(),visits=0;
 const listen=()=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});};listen();
 const go=async query=>{if(++visits%10===0){const viewport=p.viewportSize();await p.close();p=await context.newPage();await p.setViewportSize(viewport);listen();}await p.goto(`${base}/estudio?${query}`);await p.locator('.study-class-context').waitFor();await p.evaluate(()=>document.fonts.ready);};
 const fit=async()=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow: ${p.url()}`);
 const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/${name}.png`,fullPage:true,animations:'disabled'});};
 const routes=[['academica','curso=s2-4&clase=ri-teoria'],['algebra','curso=s2-5&clase=mtfm01-repaso-u2'],['geogebra','curso=s2-5&clase=mtfm01-logaritmicas'],['temperatura','curso=s2-3&clase=instrumentacion-g03-exp2'],['detectores','curso=s2-3&clase=instrumentacion-g01-exp2']];
 let style;
 for(const [name,query] of routes){
  await go(query);const nav=p.locator('nav.study-sequence');await nav.waitFor();
  assert.deepEqual((await nav.locator('button').allTextContents()).slice(0,3),['01Entender','02Ver un ejemplo','03Practicar']);
  const currentStyle=await nav.evaluate(el=>({background:getComputedStyle(el).backgroundColor,radius:getComputedStyle(el).borderRadius,font:getComputedStyle(el.querySelector('button')).fontFamily}));
  if(style)assert.deepEqual(currentStyle,style);else style=currentStyle;
  if(name!=='algebra'){await p.locator('.teaching-section-dots').waitFor();assert.equal(await p.locator('.teaching-section-dots>button[aria-current=step]').evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)');}
  await nav.getByRole('button',{name:'Ver un ejemplo',exact:true}).click();
  await p.getByRole('region',{name:name==='algebra'?'Ejemplo resuelto de la Unidad 2':'Ejemplo explicado',exact:true}).waitFor();
  assert.equal(await nav.getByRole('button',{name:'Ver un ejemplo',exact:true}).getAttribute('aria-current'),'step');
  if(['geogebra','temperatura','detectores'].includes(name)){assert.match(p.url(),/lectura=ejemplo/);await p.reload();await p.getByRole('region',{name:'Ejemplo explicado',exact:true}).waitFor();}
  await nav.getByRole('button',{name:'Practicar',exact:true}).click();await fit();await shot(`${name}-desktop`);
 }
 pass('Cinco recorridos comparten controles, estilo y etapas; ejemplo de los bancos recuperable al recargar');
 await go('curso=s2-4&clase=ri-teoria');
 await p.getByRole('button',{name:'Usar en clase',exact:true}).click();await p.locator('.study-notebook-wrap[open]').waitFor();
 await p.getByRole('button',{name:'Siguiente',exact:true}).click();await p.locator('.study-notebook-wrap[open]').waitFor();
 assert.equal(await p.locator('.study-sequence button[aria-current=step]').getAttribute('aria-label'),'Practicar');
 await p.getByRole('button',{name:'Aprender paso a paso',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.study-sequence button[aria-current=step]')?.getAttribute('aria-label')==='Entender');assert.equal(await p.locator('.study-sequence button[aria-current=step]').getAttribute('aria-label'),'Entender');
 await p.getByRole('button',{name:'Repasar errores',exact:true}).click();await p.waitForFunction(()=>document.querySelector('.study-sequence button[aria-current=step]')?.getAttribute('aria-label')==='Practicar');assert.equal(await p.locator('.study-sequence button[aria-current=step]').getAttribute('aria-label'),'Practicar');
 pass('Usar en clase conserva la práctica al avanzar; aprender y repasar abren la etapa correspondiente');
 const original=p.url();const next=p.getByRole('link',{name:'Clase siguiente',exact:true});const href=await next.getAttribute('href');await next.click();await p.locator('.study-class-context').waitFor();assert.equal(new URL(p.url()).search,new URL(href,base).search);
 await p.goBack();await p.locator('[data-academic="ri-teoria"]').waitFor();assert.equal(p.url(),original);
 const selector=p.getByRole('combobox',{name:'Cambiar de clase'});const other=await selector.locator('option').nth(1).getAttribute('value');await selector.selectOption(other);await p.locator('.study-class-context').waitFor();assert.equal(new URL(p.url()).searchParams.get('clase'),other);
 await p.locator('.study-context-back').click();await p.locator('.class-unit').first().waitFor();assert.equal(new URL(p.url()).searchParams.get('curso'),'s2-4');
 pass('Cambiar de clase, siguiente, atrás del navegador y volver al ramo mantienen un contexto coherente');
 await go('curso=s2-2&clase=protecciones-docente-2026-10-07');await p.getByRole('button',{name:'Empezar clase',exact:true}).click();await p.locator('.lesson-journey .study-sequence').waitFor();assert.equal(new URL(p.url()).searchParams.get('curso'),'s2-2');await p.locator('.study-sequence').getByRole('button',{name:'Ver un ejemplo',exact:true}).click();await p.locator('.journey-explore').waitFor();await fit();await shot('protecciones-desktop');await p.locator('.study-context-back').click();await p.locator('.class-unit').first().waitFor();
 pass('Protecciones usa el mismo marco y regresa al ramo sin perder su progreso anterior');
 for(const width of [390,768]){await p.setViewportSize({width,height:900});for(const [name,query] of routes){await go(query);await p.locator('.study-sequence').waitFor();await fit();await shot(`${name}-${width}`);for(const button of await p.locator('.study-sequence button').all()){const b=await button.boundingBox();assert.ok(b&&b.height>=44&&b.x>=0&&b.x+b.width<=width+1);}}await go('curso=s2-2&clase=protecciones-docente-2026-10-07&tema=objetivos-fallas&vista=lesson');await p.locator('.lesson-journey').waitFor();await fit();await shot(`protecciones-${width}`);}
 pass('390 y 768 px: seis experiencias sin desborde y controles de al menos 44 px');
 assert.deepEqual(report.errors,[]);pass('Sin errores JavaScript ni de consola');
 }finally{await browser.close();fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
