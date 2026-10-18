import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),temp=await fs.mkdtemp(path.join(os.tmpdir(),'modo-eq-ui-')),out=path.join(root,'qa/equipment');await fs.mkdir(out,{recursive:true});
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4341/').replace(/\/?$/,'/'),report={base,generatedAt:new Date().toISOString(),checks:[],errors:[]};
const pass=name=>{report.checks.push(name);console.log('PASS '+name);};
let browser,lastPage;
try{
 for(const name of ['model','equipment/model']){const target=path.join(temp,name+'.mjs');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,ts.transpileModule(await fs.readFile(path.join(root,'src/lab',name+'.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);}
 const {newProject}=await import(pathToFileURL(path.join(temp,'model.mjs'))),{exampleBoard,CATALOG,makePart}=await import(pathToFileURL(path.join(temp,'equipment/model.mjs')));
 browser=await chromium.launch({headless:true});
 async function open(viewport,kind){const project=newProject('blank');project.equipment=typeof kind==='string'?exampleBoard(kind):kind??{version:1,parts:[],wires:[]};const context=await browser.newContext({viewport,hasTouch:viewport.width<500});await context.addInitScript(({project})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-laboratory-v1'))localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[project],active:project.id}));},{project});const page=await context.newPage();lastPage=page;page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});await page.goto(base+'laboratorio?tool=equipment');await page.waitForSelector('[data-lab-ready="true"]');await page.waitForSelector('.eq-canvas');await page.waitForTimeout(700);return {context,page,project};}
 const stored=page=>page.evaluate(()=>{const b=JSON.parse(localStorage.getItem('panellab-laboratory-v1'));return b.projects.find(p=>p.id===b.active);});
 const menu=async(page,name,item)=>{await page.getByRole('toolbar',{name:'Herramientas de equipos eléctricos'}).getByRole('button',{name,exact:true}).click();await page.getByRole('menuitem',{name:item,exact:false}).click();};
 {
  const {context,page}=await open({width:1440,height:1000},null);
  await menu(page,'Mando y protecciones','Parada de emergencia');await page.waitForTimeout(450);assert.equal((await stored(page)).equipment.parts[0].kind,'emergency');pass('Añadir equipo real desde el dock y guardar en el proyecto');
  await menu(page,'Automatización','Variador con entrada monofásica');await page.waitForTimeout(450);await menu(page,'Medición y energía','Medidor de energía');await page.waitForTimeout(450);assert.equal((await stored(page)).equipment.parts.length,3);pass('Los tres grupos comparten biblioteca, lienzo y guardado');
  await page.keyboard.press('Escape');await page.keyboard.press('Control+z');await page.waitForTimeout(450);assert.equal((await stored(page)).equipment.parts.length,2);await page.keyboard.press('Control+y');await page.waitForTimeout(450);assert.equal((await stored(page)).equipment.parts.length,3);pass('Deshacer y rehacer del proyecto conservan equipos y parámetros');
  await page.getByRole('button',{name:'Vista simbólica de equipos',exact:true}).click();assert.equal(await page.locator('.eq-symbolic').count(),3);await page.getByRole('button',{name:'Vista simbólica de equipos',exact:true}).click();
  const download=page.waitForEvent('download');await menu(page,'Montajes y archivos','Exportar este montaje');const saved=await download,content=JSON.parse(await fs.readFile(await saved.path(),'utf8'));assert.equal(content.board.parts.length,3);pass('Vista simbólica y exportación de las piezas reales');
  const before=(await stored(page)).equipment;await page.reload();await page.waitForSelector('[data-lab-ready="true"]');await page.waitForSelector('.eq-canvas');assert.deepEqual((await stored(page)).equipment,before);pass('Recarga sin perder el montaje');
  await page.screenshot({path:path.join(out,'desktop-catalogo.png'),fullPage:true});await context.close();
 }
 {
  const {context,page,project}=await open({width:1440,height:1000},'control');await page.getByRole('button',{name:'Simular proyecto',exact:true}).click();
  const start=project.equipment.parts.find(p=>p.kind==='push-no'),stop=project.equipment.parts.find(p=>p.kind==='emergency'),coil=project.equipment.parts.find(p=>p.kind==='contactor');
  const button=page.locator(`[data-part-id="${start.id}"] .eq-part-hit`),box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(350);await page.mouse.up();await page.waitForTimeout(350);
  assert.equal(await page.locator(`[data-part-id="${coil.id}"]`).getAttribute('data-active'),'true');pass('Pulsación real mantiene la bobina por retención');
  const emergency=page.locator(`[data-part-id="${stop.id}"] .eq-part-hit`);await emergency.press('Enter');await page.waitForTimeout(350);assert.equal(await page.locator(`[data-part-id="${coil.id}"]`).getAttribute('data-active'),'false');pass('Parada enclavada operable desde teclado');
  await page.screenshot({path:path.join(out,'desktop-mando.png'),fullPage:true});
  await page.getByRole('button',{name:'Detener',exact:true}).click();const previous=(await stored(page)).equipment;
  const chooser=page.waitForEvent('filechooser');await menu(page,'Montajes y archivos','Importar como piezas nuevas');await (await chooser).setFiles({name:'control.modo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'modo-equipment',board:previous}))});await page.waitForTimeout(650);
  const merged=(await stored(page)).equipment;assert.equal(merged.parts.length,previous.parts.length*2);assert.deepEqual(merged.parts.slice(0,previous.parts.length),previous.parts);const appended=merged.parts.slice(previous.parts.length);assert.notEqual(appended.find(p=>p.kind==='contactor').tag,coil.tag);assert.equal(appended.find(p=>p.kind==='aux-no').tag,appended.find(p=>p.kind==='contactor').tag);pass('Importación aditiva conserva el montaje y separa las asociaciones de contactores');await context.close();
 }
 {
  const {context,page,project}=await open({width:1440,height:1000},'drive');await page.getByRole('button',{name:'Simular proyecto',exact:true}).click();const vfd=project.equipment.parts.find(p=>p.kind==='vfd'),motor=project.equipment.parts.find(p=>p.kind==='motor3');await page.getByRole('button',{name:'Marcha '+vfd.tag,exact:true}).click();await page.waitForTimeout(2300);assert.equal(await page.locator(`[data-part-id="${motor.id}"]`).getAttribute('data-active'),'true');pass('Botón del frontal del variador y motor cableado en estrella');await page.screenshot({path:path.join(out,'desktop-variador.png'),fullPage:true});await context.close();
 }
 {
  const {context,page,project}=await open({width:390,height:844},'solar');await page.getByRole('button',{name:'Simular proyecto',exact:true}).click();await page.waitForTimeout(900);const battery=project.equipment.parts.find(p=>p.kind==='battery');assert.match(await page.locator(`[data-part-id="${battery.id}"]`).getAttribute('data-state'),/Cargando/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);pass('Solar móvil: carga de batería y ausencia de desbordamiento');
  await page.getByRole('button',{name:'Detener',exact:true}).click();await page.locator(`[data-part-id="${battery.id}"] .eq-part-hit`).press('Enter');await page.getByRole('combobox',{name:'Borne del equipo seleccionado'}).selectOption('+');await page.getByRole('button',{name:'Empezar cable aquí',exact:true}).click();await page.getByRole('button',{name:'Cancelar cable',exact:true}).click();pass('Selector de borne accesible para cablear en móvil');await page.screenshot({path:path.join(out,'mobile-solar.png'),fullPage:true});await context.close();
 }
 // Render every adapted design, not just the example circuits.
 for(const family of ['mando','automatizacion','energia']){
  const fixture={version:1,parts:CATALOG.filter(d=>d.family===family).map((d,i)=>makePart(d.kind,[],70+(i%4)*310,80+Math.floor(i/4)*245)),wires:[]};const {context,page}=await open({width:1440,height:1000},fixture);assert.equal(await page.locator('[data-equipment]').count(),fixture.parts.length);await page.getByRole('button',{name:'Ajustar al montaje',exact:true}).click();await page.waitForTimeout(350);await page.screenshot({path:path.join(out,'familia-'+family+'.png'),fullPage:true});pass('Dibujos completos: '+family);await context.close();
 }
 assert.deepEqual(report.errors,[]);pass('Sin errores de navegador');
}catch(error){if(lastPage&&!lastPage.isClosed()){await lastPage.screenshot({path:path.join(out,'failure.png'),fullPage:true});report.geometry=await lastPage.evaluate(()=>[...document.querySelectorAll('.lab-stagebar,.lab-compact-bar,.lab-property-window')].map(e=>({class:e.className,box:JSON.stringify(e.getBoundingClientRect()),top:getComputedStyle(e).top,bar:getComputedStyle(e).getPropertyValue('--lab-bar-height')})));}report.failure=error.stack;console.error(error);process.exitCode=1;}finally{await browser?.close();await fs.writeFile(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));await fs.rm(temp,{recursive:true,force:true});}
