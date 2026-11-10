const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('./lib/playwright.cjs');
const {fixtureOpen}=require('./verify-agro-territory-ui.cjs');
const {diagnostics,ready}=require('./review-agro-etapa3.cjs');
const out=process.env.AGRO_QA_OUT;if(!out)throw Error('Define AGRO_QA_OUT');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(diagnostics);
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const shot=name=>p.screenshot({path:path.join(out,name+'.png')});
 const scene=p.getByTestId('agro-app'),guide=p.getByTestId('agro-learning-guide');
 const waitMode=mode=>p.waitForFunction(mode=>document.querySelector('[data-testid=agro-app]')?.dataset.experience===mode,mode);
 const mode=async id=>{await p.locator('summary',{hasText:'Archivo'}).click();await p.getByTestId('agro-exp-'+id).click();await waitMode(id);};
 const saved=()=>p.waitForFunction(()=>document.querySelector('[data-testid=agro-app]')?.dataset.save==='saved');
 const snapshot=()=>scene.evaluate(el=>Object.fromEntries(['world','checksum','entities','conns','simSeconds'].map(k=>[k,el.dataset[k]])));
 const records=()=>p.evaluate(()=>new Promise((res,rej)=>{const req=indexedDB.open('modo-agro',1);req.onerror=()=>rej(req.error);req.onsuccess=()=>{const db=req.result,r=db.transaction('worlds').objectStore('worlds').getAll();r.onsuccess=()=>{db.close();res(r.result);};r.onerror=()=>rej(r.error);};}));
 try{
  await p.goto((process.env.AGRO_URL||'http://127.0.0.1:4386')+'/agro/');await p.locator('[data-view=lobby]').waitFor();
  for(const experience of ['learning','free','real']){
   await p.getByTestId('agro-new').click();await p.getByLabel('Nombre del mundo').fill('Etapa 5 · '+experience);
   for(let i=0;i<5;i++)await p.getByTestId('agro-wizard-next').click();
   assert.deepEqual(await p.getByLabel('Modo de trabajo').locator('option').evaluateAll(es=>es.map(e=>e.value)),['learning','free','real']);
   await p.getByLabel('Modo de trabajo').selectOption(experience);
   if(experience==='learning'){await p.getByLabel('Modo de trabajo').selectOption('real');await p.getByLabel('Modo de trabajo').selectOption('learning');await shot('01-tres-experiencias');}
   await p.getByTestId('agro-wizard-next').click();await p.getByTestId('agro-create').click();await ready(p);await waitMode(experience);await saved();
   assert.equal(await guide.count(),experience==='learning'?1:0);
   const initialId=await scene.getAttribute('data-world'),rows=await records();assert.equal(rows.length,['learning','free','real'].indexOf(experience)+1);assert.equal(rows.find(r=>r.id===(initialId))?.experience,experience); // creación cuenta exactamente un mundo
   await p.getByRole('button',{name:'Volver a Mis mundos',exact:true}).click();await p.locator('[data-view=lobby]').waitFor();
  }
  console.log('PASS wizard crea las tres experiencias y cada creación añade exactamente un mundo');
  const {createConfiguredWorld}=await import('../src/agro/world/setup.ts');
  const made=createConfiguredWorld({name:'Finca de aprendizaje',seed:31,territory:'valley',side:400,template:'farm',site:'center',relief:'level',radius:60,resources:['parcel','irrigation'],water:80,experience:'learning',start:'2026-09-21'});assert.ok(made.ok,made.error);
  await fixtureOpen(p,made.value);await ready(p);await guide.waitFor();
  assert.equal(await guide.locator('[data-check=equipment]').getAttribute('data-status'),'ready');
  assert.equal(await guide.locator('[data-check=power]').getAttribute('data-status'),'todo');
  await shot('02-aprendizaje');const initial=await snapshot();
  await p.getByRole('button',{name:'Cerrar guía',exact:true}).click();assert.equal(await guide.count(),0);
  await p.locator('summary',{hasText:'Archivo'}).click();await p.getByTestId('agro-guide-toggle').click();await guide.waitFor();
  await guide.locator('[data-check=power]').getByRole('button',{name:'Localizar'}).click();assert.notEqual(await scene.getAttribute('data-selected'),'');assert.equal(await guide.count(),0);
  await p.locator('[data-mode=inspect]').click();await p.keyboard.press('Escape');
  await mode('free');assert.equal(await guide.count(),0);assert.deepEqual(await snapshot(),initial);await shot('03-construccion-libre');
  await mode('real');assert.deepEqual(await snapshot(),initial);await p.locator('[data-mode=manage]').click();await p.getByTestId('agro-inventory').waitFor();
  assert.equal((await p.getByTestId('agro-stock-bomba').innerText()).trim(),'0');await p.getByTestId('agro-buy-bomba').click();await saved();
  const bought=(await records()).find(r=>r.id===made.value.id).data.economy;assert.equal(bought.orders.length,1);await shot('04-entorno-real');
  await p.getByRole('button',{name:'Cerrar inventario',exact:true}).click();await mode('learning');await p.locator('[data-mode=inspect]').click();await p.keyboard.press('Escape');await guide.waitFor();await saved();
  const switched=await records();assert.equal(switched.length,4);assert.deepEqual(switched.find(r=>r.id===made.value.id).data.economy,bought);assert.deepEqual(await snapshot(),initial);
  await p.reload();await p.locator('[data-view]').first().waitFor();if(await p.locator('[data-view=lobby]').count())await p.locator(`[data-world-id="${made.value.id}"]`).getByRole('button',{name:'Abrir',exact:true}).click();await ready(p);await waitMode('learning');await guide.waitFor();
  assert.deepEqual(await snapshot(),initial);console.log('PASS mismo mundo cambia de experiencia, conserva geometría y economía, no duplica mundos y persiste tras recarga; guía cierra/reabre/localiza');
  await p.getByRole('button',{name:'Editar mapa',exact:true}).click();assert.equal(await guide.count(),0);await p.getByTestId('agro-terrain-editor').waitFor();await p.getByRole('button',{name:'Volver a partida',exact:true}).click();await guide.waitFor();
  await p.setViewportSize({width:390,height:844});await guide.waitFor();const box=await guide.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390&&box.y>=0&&box.y+box.height<=844);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await shot('05-aprendizaje-movil');await p.getByRole('button',{name:'Cerrar guía',exact:true}).click();await p.locator('summary',{hasText:'Archivo'}).click();await p.getByTestId('agro-guide-toggle').click();await guide.waitFor();
  console.log('PASS guía contextual sin superponer editor/inspector, móvil sin desborde y controles accesibles');
  assert.deepEqual(errors,[]);console.log('PASS consola y respuestas HTTP sin errores');
 }finally{fs.writeFileSync(path.join(out,'errores.json'),JSON.stringify(errors,null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
