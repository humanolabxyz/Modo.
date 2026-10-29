const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4344',out='qa/geogebra-responsive',report={base,checks:[],errors:[]};
const pass=s=>{console.log('PASS',s);report.checks.push(s)};
async function fits(p){const geometry=await p.evaluate(()=>{const rect=selector=>{const n=document.querySelector(selector),r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,command:document.querySelector('.geo-command').getBoundingClientRect().height?rect('.geo-command'):null,layout:rect('.geo-layout'),toolbar:rect('.geo-toolbar')};});assert.ok(geometry.scrollWidth<=geometry.width+1,JSON.stringify(geometry));for(const r of [geometry.command,geometry.layout,geometry.toolbar].filter(Boolean)){assert.ok(r.x>=-1&&r.y>=-1&&r.right<=geometry.width+1&&r.bottom<=geometry.height+1,JSON.stringify(geometry));}assert.ok(geometry.layout.height>=80,JSON.stringify(geometry));}
async function nativeFits(p){await p.waitForFunction(()=>{const f=document.querySelector('.geo-applet iframe'),app=f.contentDocument.querySelector('.GeoGebraFrame');if(!app)return false;const r=app.getBoundingClientRect();return Math.abs(r.width-f.clientWidth)<3&&Math.abs(r.height-f.clientHeight)<3;},{},{timeout:5000});const dims=await p.evaluate(()=>{const f=document.querySelector('.geo-applet iframe'),d=f.contentDocument,scale=d.querySelector('.applet_scaler'),app=d.querySelector('.GeoGebraFrame');return {scale:f.contentWindow.getComputedStyle(scale).transform,width:app.getBoundingClientRect().width,height:app.getBoundingClientRect().height,hostWidth:f.clientWidth,hostHeight:f.clientHeight};});assert.ok(dims.scale==='none'||dims.scale==='matrix(1, 0, 0, 1, 0, 0)',JSON.stringify(dims));assert.ok(Math.abs(dims.width-dims.hostWidth)<3&&Math.abs(dims.height-dims.hostHeight)<3,JSON.stringify(dims));}
async function work(p){if(await p.getByRole('button',{name:'Trabajo',exact:true}).isVisible())await p.getByRole('button',{name:'Trabajo',exact:true}).tap();else if(await p.getByRole('button',{name:'Ocultar guía',exact:true}).isVisible())await p.getByRole('button',{name:'Ocultar guía',exact:true}).click();}
async function guide(p){if(await p.getByRole('button',{name:/^Lección \d/}).isVisible())await p.getByRole('button',{name:/^Lección \d/}).tap();else await p.getByRole('button',{name:'Mostrar guía',exact:true}).click();}
(async()=>{const b=await chromium.launch();try{
 for(const [width,height] of [[360,800],[390,844],[820,1180],[1180,820],[844,390],[1440,960]]){
  const c=await b.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(base+'/laboratorio?tool=geogebra&leccion=matrices-operaciones');await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
  await fits(p);assert.ok(await p.getByRole('button',{name:'Comprobar mi trabajo',exact:true}).isVisible());
  const checkBox=await p.getByRole('button',{name:'Comprobar mi trabajo',exact:true}).boundingBox();assert.ok(checkBox.height>=44&&checkBox.y+checkBox.height<=height);
  if(width<=720)assert.equal(await p.locator('.geo-surface').isVisible(),false);else{const g=await p.locator('.geo-guide').boundingBox(),s=await p.locator('.geo-surface').boundingBox();assert.ok(g.x+g.width<=s.x+1,'Guide and work area must not overlap');}
  await p.locator('.geo-guide summary').click();await p.getByRole('button',{name:'Preparar comando A={{2,1},{3,4}}',exact:true}).click();assert.equal(await p.getByLabel('Comando de GeoGebra',{exact:true}).inputValue(),'A={{2,1},{3,4}}');
  assert.equal(await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.exists('A')),false,'Preparing must not execute or approve');
  await p.getByLabel('Comando de GeoGebra',{exact:true}).press('Enter');
  await work(p);await p.getByRole('button',{name:'Comprobar actividad',exact:true}).click();await p.locator('.geo-feedback.is-correct').waitFor();
  if(width===360){
   await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.evalCommand('A={{0,0},{0,0}}'));await p.getByRole('button',{name:'Comprobar actividad',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('.geo-feedback.is-correct'));assert.equal(await p.getByRole('button',{name:'Actividad siguiente',exact:true}).count(),0);
   const entry=p.getByLabel('Comando de GeoGebra',{exact:true});await entry.fill('A={{2,1},{3,4}}');await entry.press('Enter');await p.getByRole('button',{name:'Comprobar actividad',exact:true}).click();await p.locator('.geo-feedback.is-correct').waitFor();
  }
  await p.getByRole('button',{name:'Actividad siguiente',exact:true}).click();
  assert.match(await p.locator('.geo-task-title').innerText(),/Suma dos registros/);
  await p.evaluate(()=>{const f=document.querySelector('.geo-applet iframe');f.contentWindow.sameApplet=f.contentWindow.modoGeoGebra;});
  await p.getByLabel('Vista de GeoGebra',{exact:true}).selectOption('G');await p.getByLabel('Vista de GeoGebra',{exact:true}).selectOption('A');
  const rotated={width:height,height:width};await p.setViewportSize(rotated);await p.waitForTimeout(250);await fits(p);await nativeFits(p);
  assert.equal(await p.evaluate(()=>{const w=document.querySelector('.geo-applet iframe').contentWindow;return w.sameApplet===w.modoGeoGebra&&w.modoGeoGebra.exists('A')}),true,'Rotation must retain live applet and objects');
  await guide(p);assert.match(await p.locator('.geo-guide h2').innerText(),/Suma dos registros/);await p.getByLabel('Mis observaciones',{exact:true}).fill('Conservé el trabajo al girar la pantalla.');
  await p.screenshot({path:`${out}/rotado-${width}.png`});
  await p.setViewportSize({width,height});await p.waitForTimeout(200);await fits(p);await p.screenshot({path:`${out}/leccion-${width}.png`});
  await work(p);await fits(p);await nativeFits(p);await p.screenshot({path:`${out}/trabajo-${width}.png`});
  if(width===390){await p.getByLabel('Comando de GeoGebra',{exact:true}).focus();await p.setViewportSize({width,height:360});await p.waitForTimeout(200);await fits(p);await p.screenshot({path:out+'/teclado-viewport.png'});await p.setViewportSize({width,height});}
  await p.getByRole('button',{name:'Archivos de GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Guardar GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Cerrar archivos',exact:true}).click();
  await p.reload();await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});assert.match(await p.locator('.geo-guide h2').innerText(),/Suma dos registros/);assert.equal(await p.getByLabel('Mis observaciones',{exact:true}).inputValue(),'Conservé el trabajo al girar la pantalla.');assert.equal(await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.exists('A')),true);
  pass(`${width}x${height}: lectura y trabajo sin solapamiento, comandos sin autoejecutar, comprobación, giro sin reinicio, vistas y persistencia`);await c.close();
 }
 assert.deepEqual(report.errors,[]);
}finally{await b.close();fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
