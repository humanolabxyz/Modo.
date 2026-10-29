const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4342',out='qa/estudio-diseno',before=process.argv.includes('--before'),report={checks:[],errors:[]};
fs.mkdirSync(out,{recursive:true});
const paths=['src/components/App.tsx','src/components/Board.tsx','src/data/panel.ts','src/data/wiring.ts','src/lab/dc.ts','src/study/academicContent.ts','src/study/academicModels.ts','src/study/academicState.ts','src/study/lessonTeachings.ts','src/study/TeachingVisual.tsx','src/study/model.ts'];
const hashes=()=>Object.fromEntries(paths.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
if(before)fs.writeFileSync(`${out}/before-hashes.json`,JSON.stringify(hashes(),null,2));
const pass=s=>{report.checks.push(s);console.log('PASS',s);};
(async()=>{const browser=await chromium.launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));let p=await context.newPage();
 const listen=()=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});};listen();
 const go=async(path,selector)=>{await p.goto(base+path);await p.waitForSelector(selector);await p.evaluate(()=>document.fonts.ready);};
 const shot=async(name)=>{await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:`${out}/${before?'antes':'despues'}-${name}.png`,fullPage:true});};
 const fit=async()=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Desbordamiento en '+p.url());
 for(const [name,path,selector] of [['inicio','/estudio','.campus-course'],['ramo','/estudio?curso=s2-4','.class-unit'],['clase','/estudio?curso=s2-4&clase=ri-teoria','.teaching-reader']]){await go(path,selector);await shot(name);if(!before)await fit();}
 if(before){await p.setViewportSize({width:390,height:844});await shot('clase-390');return;}
 assert.deepEqual(hashes(),JSON.parse(fs.readFileSync(`${out}/before-hashes.json`)));pass('Materia, modelos, progreso, panel y laboratorio conservados');
 assert.ok(await p.locator('.teaching-reader-grid').evaluate(n=>n.getBoundingClientRect().top<690),'La explicación queda demasiado abajo');
 assert.ok(await p.locator('.teaching-reading-text').evaluate(n=>parseFloat(getComputedStyle(n).fontSize)>=15));pass('Cabecera compacta y lectura principal legible en escritorio');
 await p.getByRole('button',{name:'Ver un ejemplo',exact:true}).click();await shot('ejemplo');await p.getByRole('button',{name:'Practicar',exact:true}).click();await shot('practica');
 await p.getByRole('radio').first().focus();await p.keyboard.press('ArrowDown');assert.ok(await p.getByRole('radio').nth(1).isChecked());pass('El cambio visual conserva selección por teclado y las tres fases');
 await p.close();p=await context.newPage();listen();
 for(const width of [390,768,1280]){
  await p.setViewportSize({width,height:900});
  for(const [name,path,selector] of [['inicio','/estudio','.campus-course'],['ramo','/estudio?curso=s2-4','.class-unit'],['clase','/estudio?curso=s2-4&clase=ri-teoria','.teaching-reader'],['electronica','/estudio?curso=s2-1&clase=ea-clase-4','.teaching-reader'],['temperatura','/estudio?curso=s2-3&clase=instrumentacion-g03-exp2','.tool-teaching']]){await go(path,selector);await fit();await shot(`${name}-${width}`);}
  await go('/estudio?curso=s2-4&clase=ri-teoria&paso=1','.teaching-reader');await fit();await shot(`codigos-${width}`);
 }
 pass('Inicio, ramo, explicación, electrónica, herramienta y codificación sin desbordamiento a 390/768/1280 px');
 await p.setViewportSize({width:390,height:900});
 await go('/estudio?curso=s2-3&clase=ii-metrologia&paso=2','.teaching-reader');await p.getByRole('button',{name:'Practicar',exact:true}).click();await p.locator('.study-notebook-wrap>summary').click();await p.getByLabel('Desarrollo, fuentes y conclusión',{exact:true}).fill('Revisión visual del cuaderno y de los campos de registro.');
 await p.getByText('Registrar mediciones y exportar tabla',{exact:true}).click();await p.getByLabel('Equipo y condiciones',{exact:true}).fill('Registro de prueba de interfaz');await p.getByLabel('Valor',{exact:true}).fill('98,7');await p.getByLabel('Unidad',{exact:true}).fill('°C');await p.getByRole('button',{name:'Añadir registro',exact:true}).click();assert.match(await p.locator('.academic-table-wrap').innerText(),/98,7/);await fit();await shot('cuaderno-390');
 await p.getByRole('button',{name:'Desafío del ramo',exact:true}).click();await fit();await shot('desafio-390');
 await go('/estudio?curso=s2-4&clase=ri-cable','.teaching-reader');await p.getByRole('button',{name:'Practicar',exact:true}).click();await fit();await shot('taller-390');pass('Cuaderno, tabla, desafío y taller conservan controles utilizables en móvil');
 await p.setViewportSize({width:1440,height:1000});await go('/estudio?curso=s2-4&clase=ri-teoria','.teaching-reader');await p.screenshot({path:`${out}/clase-viewport.png`});
 assert.deepEqual(report.errors,[]);pass('Cero excepciones y errores de consola');
 }finally{await browser.close();if(!before)fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);fs.writeFileSync(`${out}/verification.json`,JSON.stringify({...report,failure:String(e)},null,2));process.exitCode=1;});
