const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4344',out='qa/geogebra-responsive',report={base,checks:[],errors:[]};
(async()=>{const browser=await chromium.launch();try{
 for(const [width,height] of [[390,844],[844,390],[820,1180]]){
  const c=await browser.newContext({viewport:{width,height},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+'/laboratorio?tool=geogebra');await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});
  await p.getByLabel('Vista de GeoGebra',{exact:true}).selectOption('G');
  await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.setMode(1));
  const canvas=await p.evaluate(()=>{const f=document.querySelector('.geo-applet iframe'),offset=f.getBoundingClientRect();const r=[...f.contentDocument.querySelectorAll('canvas')].map(n=>n.getBoundingClientRect()).filter(r=>r.width>100&&r.height>40).sort((a,b)=>b.width*b.height-a.width*a.height)[0];if(!r)throw Error('No interactive graph canvas');return {x:offset.x+r.x+r.width*.6,y:offset.y+r.y+r.height*.55};});
  await p.touchscreen.tap(canvas.x,canvas.y);await p.waitForFunction(()=>{const a=document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra;return a.getAllObjectNames().some(name=>a.getObjectType(name)==='point')});
  await p.getByLabel('Vista de GeoGebra',{exact:true}).selectOption('C');await p.waitForFunction(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.evalCommandCAS('1+1')==='2',{},{timeout:30000,polling:250});
  const entry=p.getByLabel('Comando de GeoGebra',{exact:true});await entry.fill('2+3');await entry.press('Enter');await p.waitForFunction(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.getValueString('$1')==='5');
  await entry.fill('Factor(x^2-1)');await entry.press('Enter');await p.waitForFunction(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.isDefined('$2'));
  assert.equal(await p.evaluate(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.getCASObjectNumber()),2);
  await p.getByRole('button',{name:'Archivos de GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Guardar GeoGebra',exact:true}).click();await p.getByRole('button',{name:'Cerrar archivos',exact:true}).click();
  await p.screenshot({path:`${out}/cas-${width}.png`});await p.reload();await p.locator('[data-geogebra-ready=true]').waitFor({timeout:65000});await p.getByLabel('Vista de GeoGebra',{exact:true}).selectOption('C');await p.waitForFunction(()=>document.querySelector('.geo-applet iframe').contentWindow.modoGeoGebra.getValueString('$1')==='5',{},{timeout:30000,polling:250});
  const message=`${width}x${height}: toque nativo crea punto, entrada CAS crea filas sin sobrescribir y conserva resultados al recargar`;console.log('PASS',message);report.checks.push(message);await c.close();
 }assert.deepEqual(report.errors,[]);
}finally{await browser.close();fs.writeFileSync(out+'/native-verification.json',JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
