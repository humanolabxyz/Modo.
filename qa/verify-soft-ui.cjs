const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4344',out='qa/soft-ui-global',before=process.argv.includes('--before');
fs.mkdirSync(out,{recursive:true});
const hashes=()=>{const result={};function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(tsx?|json)$/.test(file))result[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}}walk('src');return result;};
const routes=[['inicio','/','.modo-home'],['panel','/?view=simulator','.editor-workbench'],['estudio','/estudio','.campus-course'],['ramo','/estudio?curso=s2-4','.class-unit'],['clase','/estudio?curso=s2-4&clase=ri-teoria','.teaching-reader'],['protecciones','/estudio?curso=s2-2&clase=protecciones-docente-2026-10-07','.study-shell'],...['equipment','schematic','plc','hmi','process','breadboard','temperature','detectors','geogebra'].map(tool=>[tool,'/laboratorio?tool='+tool,'.lab-page[data-lab-ready="true"]']),['comunidad','/comunidad/','.community-page'],['legal','/legal/','.legal-main']];
(async()=>{const browser=await chromium.launch(),report={base,checks:[],errors:[]};try{
 if(before)fs.writeFileSync(`${out}/logic-hashes.json`,JSON.stringify(hashes(),null,2));
 else assert.deepEqual(hashes(),JSON.parse(fs.readFileSync(`${out}/logic-hashes.json`)),'No changes to React, models, lessons or data');
 const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'});await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 for(const width of [1440,390])for(const [name,url,selector] of routes){
  const p=await context.newPage();await p.setViewportSize({width,height:960});p.on('pageerror',e=>report.errors.push(`${name}: ${e.message}`));
  await p.goto(base+url,{waitUntil:'domcontentloaded'});await p.locator(selector).first().waitFor();
  if(name==='panel'){await p.locator('.board-svg .terminal').first().waitFor();await p.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');}
  if(name==='inicio')await p.locator('.modo-primary:not(:disabled)').waitFor();
  if(url.startsWith('/laboratorio'))await p.locator('.lab-loading').waitFor({state:'detached'});
  await p.evaluate(()=>document.fonts.ready);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow ${name} ${width}`);
  if(!before){
   assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--soft-accent').trim()),'#171819');
   if(name==='inicio')assert.equal(await p.locator('.modo-laboratory-tools a').count(),8);
   if(name==='clase'){await p.getByRole('button',{name:'Ver un ejemplo',exact:true}).click();await p.getByRole('button',{name:'Practicar',exact:true}).click();await p.getByRole('radio').first().focus();await p.keyboard.press('ArrowDown');assert.ok(await p.getByRole('radio').nth(1).isChecked());}
  }
  await p.screenshot({path:`${out}/${before?'antes':'despues'}-${name}-${width}.png`,fullPage:!url.startsWith('/laboratorio')&&name!=='legal'});
  if(!before&&name==='schematic'){
   await p.getByRole('toolbar',{name:'Herramientas del esquema'}).getByRole('button',{name:'Componentes',exact:true}).click();
   await p.getByRole('menuitem',{name:/^Piloto/}).waitFor();
   await p.screenshot({path:`${out}/menu-componentes-${width}.png`});
   if(width===1440){const count=await p.locator('.lab-device').count();await p.getByRole('menuitem',{name:/^Piloto/}).click();await p.locator('.lab-device.selected .lab-device-hit').waitFor();assert.equal(await p.locator('.lab-device').count(),count+1);await p.locator('.lab-device.selected .lab-device-hit').focus();await p.keyboard.press('Delete');await p.waitForFunction(n=>document.querySelectorAll('.lab-device').length===n,count);await p.keyboard.press('Control+z');await p.waitForFunction(n=>document.querySelectorAll('.lab-device').length===n,count+1);}
  }
  report.checks.push(`${name} ${width}: no overflow, rendered`);await p.close();
 }
 assert.deepEqual(report.errors,[]);console.log(`PASS ${report.checks.length} screens; no page errors; logic preserved`);
 }finally{await browser.close();fs.writeFileSync(`${out}/${before?'baseline':'verification'}.json`,JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1;});
