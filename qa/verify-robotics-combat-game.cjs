const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4331',out='qa/robotics-combat-game';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const fixture=JSON.parse(fs.readFileSync('qa/robotics-arena/library-fixture.json','utf8'));
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const report={url:base,checks:[],errors:[],resources:[]};let p;
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  const c=await b.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion:'no-preference'});
  await c.addInitScript(l=>{if(!localStorage.getItem('modo-robotica-v1'))localStorage.setItem('modo-robotica-v1',JSON.stringify(l));},fixture);
  p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));const requests=[];p.on('request',r=>requests.push(r.url()));const press=l=>width<600?l.tap():l.click(),arena=p.locator('.rb-arena');
  await p.goto(base+'/arena/');await arena.waitFor();await p.locator('canvas').waitFor();await p.waitForTimeout(1700);
  assert.equal(await p.locator('canvas').count(),1);assert.equal(await p.locator('.rb-dock,.rb-arm-controls,.rb-code-editor').count(),0);
  assert.equal(await arena.getByRole('button',{name:'Cámara automática',exact:true}).getAttribute('aria-pressed'),'true');
  const a=await p.locator('canvas').screenshot();await p.waitForTimeout(1200);const d=await p.locator('canvas').screenshot();assert.notEqual(crypto.createHash('sha256').update(a).digest('hex'),crypto.createHash('sha256').update(d).digest('hex'),'cámara automática produce movimiento visible antes de competir');
  await p.screenshot({path:`${out}/${view}-intro.png`});
  const initialRequests=[...requests];assert.ok(!initialRequests.some(x=>/RoboticsApp\.|CodeEditor|ArmMesh\.|\/e6\/.*STL/.test(x)),'modo independiente no descarga el editor ni el modelo E6');
  await press(arena.getByRole('button',{name:'Reducir movimiento',exact:true}));assert.equal(await arena.getAttribute('data-reduced'),'true');assert.ok(await arena.getByRole('button',{name:'Cámara automática',exact:true}).isDisabled());
  await press(arena.getByRole('button',{name:'Reducir movimiento',exact:true}));
  await arena.getByLabel('Robot Azul',{exact:true}).selectOption(fixture.projects[1].id);await arena.getByLabel('Robot Naranja',{exact:true}).selectOption(fixture.projects[2].id);await arena.getByLabel('Duración de ronda').selectOption('30');
  await press(arena.getByRole('button',{name:'Sonido del combate',exact:true}));assert.equal(await arena.getByRole('button',{name:'Sonido del combate',exact:true}).getAttribute('aria-pressed'),'true');
  await press(arena.getByRole('button',{name:'Iniciar combate',exact:true}));await p.locator('.rb-arena-countdown').waitFor({timeout:30000});await p.screenshot({path:`${out}/${view}-countdown.png`});assert.equal(await arena.getByLabel('Impactos registrados').textContent(),'0');
  await press(arena.getByRole('button',{name:'Pausar ronda',exact:true}));await p.locator('.rb-arena-pause').waitFor();const clock=await arena.getByLabel('Tiempo restante').textContent();await p.waitForTimeout(700);assert.equal(await arena.getByLabel('Tiempo restante').textContent(),clock);
  await press(arena.getByRole('button',{name:'Continuar ronda',exact:true}));
  await p.waitForFunction(()=>Number(document.querySelector('[aria-label="Impactos registrados"]')?.textContent)>0,{},{timeout:90000});
  await p.screenshot({path:`${out}/${view}-contact.png`});
  await p.locator('.rb-arena-view[data-status=finished]').waitFor({timeout:90000});
  assert.ok((await arena.locator('.rb-arena-result').textContent()).includes('Gana Azul'));assert.ok(await p.locator('.rb-confetti i').count()>0);
  assert.ok(Number(await arena.getByLabel('Margen al borde Naranja').getAttribute('aria-valuenow'))<20);
  await p.screenshot({path:`${out}/${view}-victory.png`});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-robotica-v1')).projects),fixture.projects);
  await press(arena.getByRole('button',{name:'Preparar otro duelo',exact:true}));await press(arena.getByRole('button',{name:'Volver al taller',exact:true}));await p.locator('.rb-app[data-ready=true]').waitFor();
  report.resources.push({view,initialRequests:initialRequests.map(x=>new URL(x).pathname),noEditor:true,noE6:true});report.checks.push(`${view}: ruta independiente, un lienzo, cámara animada, reducción de movimiento, cuenta regresiva, sonido opcional, contacto físico, pausa, victoria animada y biblioteca intacta.`);await c.close();
 }assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks,errors:report.errors},null,2));}
 catch(e){if(p)await p.screenshot({path:out+'/failure.png'}).catch(()=>{});throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
