const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('./lib/playwright.cjs');
const {fixtureOpen}=require('./verify-agro-territory-ui.cjs');
const {diagnostics,ready}=require('./review-agro-etapa3.cjs');
const out=process.env.AGRO_QA_OUT;if(!out)throw Error('Define AGRO_QA_OUT');
const stage=process.argv[2]||'4A';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const {createConfiguredWorld}=await import('../src/agro/world/setup.ts');
 const {WorldSession}=await import('../src/agro/world/session.ts');
 const {sampleHeight}=await import('../src/agro/terrain/heightfield.ts');
 const made=createConfiguredWorld({name:'Etapa '+stage,seed:31,territory:'free',side:400,template:'blank',site:'center',relief:'natural',radius:30,resources:[],water:80,experience:'free',start:'2026-09-21'});assert.ok(made.ok);
 const s=WorldSession.fromWorld(made.value);if(stage!=='4F'){s.beginStroke();assert.ok(s.stamp('raise',0,0,12,8).ok);s.endStroke();}
 const world=s.toWorld();
 const b=await chromium.launch({args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(diagnostics);
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto((process.env.AGRO_URL||'http://127.0.0.1:4386')+'/agro/');await p.locator('[data-view=lobby]').waitFor();await fixtureOpen(p,world);await ready(p);
  await p.getByRole('button',{name:'Editar mapa',exact:true}).click();
  if(stage==='4B')await p.getByLabel('Herramienta de terreno').selectOption('restore');
  if(stage==='4C')await p.getByLabel('Herramienta de terreno').selectOption('paint');
  if(stage.startsWith('4D')){await p.getByLabel('Herramienta de terreno').selectOption(stage==='4D'?'slope':'terrace');await p.getByLabel('Cota de referencia').fill('23');}
  if(stage.startsWith('4E'))await p.getByLabel('Herramienta de terreno').selectOption(stage==='4E'?'ditch':'road');
  if(stage==='4F')await p.getByLabel('Herramienta de terreno').selectOption('parcel');
  const attribute=stage==='4F'?'data-entities':stage==='4C'?'data-edits':'data-checksum';
  const scene=p.getByTestId('agro-app'),original=await scene.getAttribute(attribute);
  const points=stage==='4F'?[[-12,-12],[12,-12],[12,0],[0,0],[0,12],[-12,12]]:stage.startsWith('4E')?[[-12,0],[12,0]]:stage.startsWith('4D')?[[-12,-12],[12,-12],[12,12],[-12,12]]:[[0,0]];
  for(const [x,z] of points){
    const at=await p.evaluate(({x,y,z})=>{const state=window.reviewScene.__r3f.root.getState(),v=state.camera.position.clone().set(x,y,z).project(state.camera),r=state.gl.domElement.getBoundingClientRect();return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},{x,y:sampleHeight(s.terrain.hf,x,z),z});
    await p.mouse.click(at.x,at.y);
  }
  await p.getByRole('button',{name:'Previsualizar edición',exact:true}).click();
  await p.getByTestId('agro-editor-volume').waitFor();
  if(stage!=='4F')assert.notEqual(await scene.getAttribute(attribute),original);else assert.equal(await scene.getAttribute(attribute),original);
  await p.screenshot({path:path.join(out,stage+'-preview.png')});
  await p.getByRole('button',{name:'Cancelar edición',exact:true}).click();assert.equal(await scene.getAttribute(attribute),original);
  await p.getByRole('button',{name:'Previsualizar edición',exact:true}).click();await p.getByRole('button',{name:'Aplicar edición',exact:true}).click();
  const edited=await scene.getAttribute(attribute);assert.notEqual(edited,original);
  await p.getByRole('button',{name:'Deshacer',exact:true}).click();assert.equal(await scene.getAttribute(attribute),original);
  await p.getByRole('button',{name:'Rehacer',exact:true}).click();assert.equal(await scene.getAttribute(attribute),edited);
  await p.waitForFunction(()=>document.querySelector('[data-testid=agro-app]').dataset.save==='saved');
  await p.screenshot({path:path.join(out,stage+'-final.png')});
  await p.reload();await ready(p);assert.equal(await scene.getAttribute(attribute),edited);
  if(stage==='4F') {
    const point=async(x,z)=>{
      const at=await p.evaluate(({x,z})=>{const state=window.reviewScene.__r3f.root.getState(),v=state.camera.position.clone().set(x,state.controls.target.y,z).project(state.camera),r=state.gl.domElement.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},{x,z});
      await p.mouse.click(at.x,at.y);
    };
    await point(6,6);assert.equal(await scene.getAttribute('data-selected'),'');
    await point(-6,6);assert.notEqual(await scene.getAttribute('data-selected'),'');
    assert.match(await p.locator('body').innerText(),/Poligonal/);
    await p.screenshot({path:path.join(out,'4F-inspector.png')});
    await p.setViewportSize({width:390,height:844});
    await p.getByRole('button',{name:'Editar mapa',exact:true}).click();
    await p.getByLabel('Herramienta de terreno').selectOption('parcel');
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const panel=await p.getByTestId('agro-terrain-editor').boundingBox();assert.ok(panel.x>=0&&panel.x+panel.width<=391);
    await p.screenshot({path:path.join(out,'4F-movil.png')});
  }
  assert.deepEqual(errors,[]);console.log('PASS',stage,'UI: preview, cancelar, aplicar, undo/redo, autoguardado y recarga');
 }finally{fs.writeFileSync(path.join(out,stage+'-errores.json'),JSON.stringify(errors));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
