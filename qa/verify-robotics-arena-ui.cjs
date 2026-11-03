const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4331',out='qa/robotics-arena';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const fixture=JSON.parse(fs.readFileSync(out+'/library-fixture.json','utf8'));
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const report={url:base,checks:[],errors:[]};let current;
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.addInitScript(l=>{if(!localStorage.getItem('modo-robotica-v1'))localStorage.setItem('modo-robotica-v1',JSON.stringify(l));},fixture);
  const p=await ctx.newPage();current=p;p.on('pageerror',e=>report.errors.push(e.message));
  const press=l=>width<600?l.tap():l.click(),arena=p.locator('.rb-arena');
  const btn=name=>arena.getByRole('button',{name,exact:true});
  await p.goto(base+'/robotica/');await p.locator('.rb-app[data-ready=true]').waitFor();
  await p.waitForFunction(()=>document.querySelector('.rb-name small')?.textContent.includes('Guardado'));
  await p.screenshot({path:`${out}/${view}-before.png`});
  const open=async()=>{if(width<600){await press(p.getByRole('button',{name:'Opciones del proyecto',exact:true}));await press(p.getByRole('button',{name:'Entrar a la arena de sumo',exact:true}));}else await press(p.getByRole('button',{name:'Abrir arena de robots',exact:true}));};await open();await arena.waitFor();
  await p.waitForTimeout(1500);await p.screenshot({path:`${out}/${view}-arena.png`});
  assert.equal(await arena.locator('canvas').count(),1);
  await arena.getByLabel('Robot Azul',{exact:true}).selectOption(fixture.projects[0].id);assert.ok(await btn('Iniciar combate').isDisabled());
  await arena.getByLabel('Robot Azul',{exact:true}).selectOption(fixture.projects[1].id);
  await arena.getByLabel('Robot Naranja',{exact:true}).selectOption(fixture.projects[2].id);
  await arena.getByLabel('Duración de ronda').selectOption('30');
  const sourceBefore=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-robotica-v1')).projects);
  await press(btn('Iniciar combate'));await p.locator('.rb-arena-view[data-status=running]').waitFor({timeout:30000});
  await press(btn('Pausar ronda'));await p.locator('.rb-arena-view[data-status=paused]').waitFor();await p.waitForTimeout(300);
  const time=await arena.getByLabel('Tiempo restante').textContent();await p.waitForTimeout(1000);assert.equal(await arena.getByLabel('Tiempo restante').textContent(),time);
  assert.ok(await arena.getByLabel('Robot Azul',{exact:true}).isDisabled());
  await press(btn('Continuar ronda'));await p.locator('.rb-arena-view[data-status=finished]').waitFor({timeout:90000});
  assert.ok((await arena.locator('.rb-arena-result').textContent()).includes('Gana Azul'));assert.equal((await arena.locator('.team-blue b').textContent()),'1');
  await p.screenshot({path:`${out}/${view}-victory.png`});
  await press(btn('Revancha'));await p.locator('.rb-arena-view[data-status=running]').waitFor({timeout:30000});await press(btn('Cancelar ronda'));
  await p.locator('.rb-arena-view[data-status=ready]').waitFor();assert.equal(await arena.locator('.team-blue b').textContent(),'1');
  const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-robotica-v1')));assert.deepEqual(stored.projects,sourceBefore);
  // Built-in is copied into the existing editor, then appears among saved contestants.
  await arena.getByLabel('Robot Azul',{exact:true}).selectOption('template:robot-minisumo-practica');
  await press(arena.getByRole('button',{name:'Construir mi versión',exact:true}));await arena.waitFor({state:'detached'});
  await p.waitForFunction(()=>JSON.parse(localStorage.getItem('modo-robotica-v1')).projects.length===4);
  const saved=await p.evaluate(()=>{const l=JSON.parse(localStorage.getItem('modo-robotica-v1'));return l.projects.find(x=>x.id===l.active);});assert.equal(saved.parts.length,23);
  await open();await arena.waitFor();await arena.getByLabel('Robot Azul',{exact:true}).selectOption(saved.id);assert.ok(await btn('Iniciar combate').isEnabled());
  const overflow=await p.evaluate(()=>({body:document.documentElement.scrollWidth>innerWidth,dialog:document.querySelector('.rb-arena').scrollWidth>document.querySelector('.rb-arena').clientWidth}));assert.deepEqual(overflow,{body:false,dialog:false});
  await press(btn('Volver al taller'));await arena.waitFor({state:'detached'});await p.locator('.rb-canvas canvas').waitFor();
  report.checks.push(`${view}: dos proyectos guardados, rechazo de vacío, pausa, victoria física, marcador, revancha/cancelación, fuentes intactas, copia editable y regreso al taller sin desborde.`);
  await ctx.close();
 }assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
 catch(e){if(current)await current.screenshot({path:out+'/failure.png'}).catch(()=>{});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
