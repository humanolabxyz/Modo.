const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4331',out='qa/robotics-combat-parts';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const report={url:base,checks:[],errors:[]};let current;
 try{for(const [view,width,height]of[['desktop',1440,900],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<600,hasTouch:width<600,serviceWorkers:'block',reducedMotion:'reduce'}),p=await ctx.newPage();current=p;
  if(process.env.PANELLAB_REMOTE_SHELL==='1'){
   const remote=await (await fetch(base+'/offline-assets.json')).json(),local=fs.readdirSync('dist/_astro');let html=fs.readFileSync('dist/robotica/index.html','utf8');
   const stem=s=>s.replace(/[.-][A-Za-z0-9_-]{8}\.(js|css|wasm)$/,'.$1');
   for(const file of local){const matches=remote.assets.filter(x=>x.url.startsWith('/_astro/')&&stem(x.url.slice(8))===stem(file));if(matches.length===1)html=html.replaceAll('/_astro/'+file,matches[0].url);}
   // Test only: provide the local document shell while all JS/CSS/workers/models come from production.
   // The server password is neither retrieved nor modified; this is not an authenticated beta session.
   await p.route(base+'/robotica/',route=>route.fulfill({status:200,contentType:'text/html',body:html}));
  }
  p.on('pageerror',e=>report.errors.push(e.message));const press=l=>width<600?l.tap():l.click();
  await p.goto(base+'/robotica/');await p.locator('.rb-app[data-ready=true]').waitFor();
  const options=()=>press(p.getByRole('button',{name:'Opciones del proyecto',exact:true}));
  const saved=()=>p.evaluate(()=>{const l=JSON.parse(localStorage.getItem('modo-robotica-v1'));return l?.projects.find(x=>x.id===l.active);});
  // Free building: the three accessories are available individually, with real generated thumbnails.
  await press(p.locator('.rb-dock button[aria-label="Piezas"]'));
  assert.equal(await p.locator('.rb-part-list li[data-definition]').count(),35);
  await p.getByLabel('Buscar pieza',{exact:true}).fill('sumo');
  for(const id of ['sumo-wedge','sumo-scoop','sumo-bumper']){
   const card=p.locator(`[data-definition="${id}"]`);await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(i=>i.decode());
   assert.ok(await card.locator('img').evaluate(i=>i.naturalWidth===320&&i.naturalHeight===240));
  }
  await p.screenshot({path:`${out}/${view}-parts.png`});
  await press(p.locator('[data-definition="sumo-scoop"] .rb-part-add'));
  await p.waitForFunction(()=>JSON.parse(localStorage.getItem('modo-robotica-v1'))?.projects.some(x=>x.parts.some(y=>y.definitionId==='sumo-scoop')));
  await press(p.getByRole('button',{name:'Cerrar Piezas',exact:true}));
  const ids=[];
  for(const [template,part,count] of [['robot-sumo-cuna','sumo-wedge',18],['robot-sumo-pala-4wd','sumo-scoop',22],['robot-sumo-defensa','sumo-bumper',18]]){
   await options();await press(p.locator(`[data-template="${template}"]`));
   await p.waitForFunction(({part,count})=>{const l=JSON.parse(localStorage.getItem('modo-robotica-v1')),a=l?.projects.find(x=>x.id===l.active);return a?.parts.length===count&&a.parts.some(x=>x.definitionId===part);},{part,count});
   const project=await saved();ids.push(project.id);
   assert.equal(project.attachments.length,count-1);await press(p.getByRole('button',{name:'Encuadrar',exact:true}));await p.waitForTimeout(900);
   await p.screenshot({path:`${out}/${view}-${part}.png`});
  }
  await p.reload();await p.locator('.rb-app[data-ready=true]').waitFor();assert.ok((await saved()).parts.some(x=>x.definitionId==='sumo-bumper'));
  await options();await press(p.getByRole('button',{name:'Entrar a la arena de sumo',exact:true}));const arena=p.locator('.rb-arena');await arena.waitFor();
  assert.equal(await arena.getByLabel('Robot Azul',{exact:true}).inputValue(),'template:robot-sumo-cuna');
  assert.equal(await arena.getByLabel('Robot Naranja',{exact:true}).inputValue(),'template:robot-sumo-pala-4wd');
  await arena.getByLabel('Robot Azul',{exact:true}).selectOption(ids[0]);await arena.getByLabel('Robot Naranja',{exact:true}).selectOption(ids[1]);
  await arena.getByLabel('Duración de ronda').selectOption('30');await p.waitForTimeout(500);
  await p.screenshot({path:`${out}/${view}-arena.png`});
  const sources=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-robotica-v1')).projects.filter(x=>x.parts.some(y=>y.definitionId.startsWith('sumo-'))));
  await press(arena.getByRole('button',{name:'Iniciar combate',exact:true}));
  await p.waitForFunction(()=>document.querySelector('.rb-arena-view')?.dataset.status==='running'&&Number(document.querySelector('[aria-label="Tiempo restante"]')?.textContent.replace(/\D/g,''))<=28,{},{timeout:60000});
  await press(arena.getByRole('button',{name:'Pausar ronda',exact:true}));await p.waitForTimeout(300);
  if(width<600)await arena.locator('.rb-arena-view').scrollIntoViewIfNeeded();
  await p.screenshot({path:`${out}/${view}-combat.png`});
  assert.equal(await p.locator('.rb-arena-view').getAttribute('data-status'),'paused');
  const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-robotica-v1')).projects.filter(x=>x.parts.some(y=>y.definitionId.startsWith('sumo-'))));assert.deepEqual(after,sources);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.rb-arena').scrollWidth<=innerWidth));
  await press(arena.getByRole('button',{name:'Volver al taller',exact:true}));await arena.waitFor({state:'detached'});
  report.checks.push(`${view}: tres accesorios individuales con miniaturas, tres robots editables, guardado/reapertura, cuña contra pala 4WD en arena y fuentes intactas.`);await ctx.close();
 }assert.deepEqual(report.errors,[]);const target=process.env.PANELLAB_REMOTE_SHELL==='1'?'qa/release-2.6.3/remote-bundles-ui.json':out+'/ui-results.json';fs.writeFileSync(target,JSON.stringify({...report,localDocumentShell:process.env.PANELLAB_REMOTE_SHELL==='1'},null,2));console.log(JSON.stringify(report,null,2));}
 catch(e){if(current)await current.screenshot({path:out+'/failure.png'}).catch(()=>{});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
