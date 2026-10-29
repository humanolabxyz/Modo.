const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4344',out='qa/matrix-notebooks',report={checks:[],errors:[]};
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();try{
 const c=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
 await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 for(const id of ['matrices-operaciones','matrices-producto','matrices-sistemas']){
  const url=base+'/estudio?curso=s2-5&clase=mtfm01-'+id+'&paso=0';
  await p.goto(url);await p.locator('.matrix-notebook').waitFor();
  assert.equal(await p.locator('.matrix-data table').count(),2);assert.equal(await p.locator('.matrix-analysis textarea').count(),4);
  await p.locator('.matrix-analysis textarea').first().fill('Mi razonamiento para '+id);
  await p.getByRole('button',{name:'Ver un ejemplo',exact:true}).click();
  assert.ok(await p.getByText('PASO 1 DE 4',{exact:true}).isVisible());
  assert.equal(await p.locator('.matrix-analysis textarea').first().inputValue(),'Mi razonamiento para '+id);
  await p.getByRole('button',{name:'Siguiente paso',exact:true}).click();
  assert.ok(await p.getByText('PASO 2 DE 4',{exact:true}).isVisible());
  await p.reload();await p.locator('.matrix-notebook').waitFor();
  assert.equal(await p.locator('.matrix-analysis textarea').first().inputValue(),'Mi razonamiento para '+id);
  const detail=p.locator('.matrix-analysis details').nth(1);await detail.locator('summary').click();assert.ok(await detail.locator('p').isVisible());
  assert.equal(await p.evaluate(id=>localStorage.getItem(`modo:geogebra:progress:${id}:v1`),id),null,'Writing and revealing explanations do not complete GeoGebra work');
  await p.getByRole('button',{name:'Practicar',exact:true}).click();
  await p.waitForURL('**/laboratorio?tool=geogebra&leccion='+id);await p.locator('.geo-guide h2').waitFor();
  await p.getByText('Preguntas para analizar el problema',{exact:true}).click();
  assert.equal(await p.locator('.geo-guide ol li').count(),4);
  report.checks.push(id+': direct navigation, example steps, analysis answers persisted, prompts in GeoGebra, no false completion');
 }
 for(const width of [1440,820,390]){
  await p.setViewportSize({width,height:width===390?844:1000});
  await p.goto(base+'/estudio?curso=s2-5&clase=mtfm01-matrices-operaciones&paso=0');await p.locator('.matrix-notebook').waitFor();
  await p.evaluate(()=>document.fonts.ready);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No overflow at '+width);
  await p.screenshot({path:`${out}/notebook-${width}.png`,fullPage:true});
  if(width===390){await p.getByRole('button',{name:'Ver un ejemplo',exact:true}).click();await p.screenshot({path:out+'/example-390.png',fullPage:true});await p.getByRole('button',{name:'Practicar',exact:true}).click();await p.waitForURL('**/laboratorio?tool=geogebra&leccion=matrices-operaciones');}
  report.checks.push(width+': notebook fits viewport'+(width===390?', mobile practice opens correct lesson':''));
 }
 // Existing functions use the same direct practice action.
 await p.goto(base+'/estudio?curso=s2-5&clase=mtfm01-lineales&paso=0');await p.locator('.tool-study-steps').waitFor();await p.getByRole('button',{name:'Practicar',exact:true}).click();await p.waitForURL('**/laboratorio?tool=geogebra&leccion=funciones-lineales');report.checks.push('Functions: practice opens its own lesson');
 // Invalid prior answers stay intact instead of being overwritten on input.
 await p.goto(base+'/estudio?curso=s2-5&clase=mtfm01-matrices-sistemas&paso=0');await p.locator('.matrix-notebook').waitFor();
 await p.evaluate(()=>localStorage.setItem('modo:matrix-analysis:matrices-sistemas:v1','broken'));await p.reload();await p.getByText(/No se pudieron leer las respuestas guardadas/).waitFor();await p.locator('.matrix-analysis textarea').first().fill('Temporary answer');assert.equal(await p.evaluate(()=>localStorage.getItem('modo:matrix-analysis:matrices-sistemas:v1')),'broken');report.checks.push('Unreadable stored answers preserved');
 assert.deepEqual(report.errors,[]);
}finally{await browser.close();fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
