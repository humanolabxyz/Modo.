const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('./lib/playwright.cjs');
const {fixtureOpen}=require('./verify-agro-territory-ui.cjs');
const {diagnostics,ready,camera}=require('./review-agro-etapa3.cjs');
const out=process.env.AGRO_QA_OUT;assert.ok(out);

function probe() {
  const state=window.reviewScene.__r3f.root.getState(), {scene,camera,raycaster}=state;
  const mesh=scene.getObjectByName('cinturón y horizonte escénicos'),terrain=scene.getObjectByName('terreno'),missed=[];
  const ray=new raycaster.constructor();
  for(const x of [-.95,-.6,0,.6,.95]) for(const y of [-.9,-.6,-.3,0]) {
    ray.setFromCamera({x,y},camera);if(ray.ray.direction.y>=-.05)continue;
    const hits=ray.intersectObjects(terrain.children);mesh.constructor.prototype.raycast.call(mesh,ray,hits);
    if(!hits.length)missed.push([x,y]);
  }
  ray.ray.origin.set(camera.position.x,10000,camera.position.z);ray.ray.direction.set(0,-1,0);
  const hits=[];mesh.constructor.prototype.raycast.call(mesh,ray,hits);
  const gap=hits.length?camera.position.y-Math.max(...hits.map(h=>h.point.y)):null;
  return {position:camera.position.toArray(),target:state.controls.target.toArray(),missed,gap};
}

(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
  const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(diagnostics);
  const p=await c.newPage(),result={sweeps:[],clearance:[]},errors=[];p.on('pageerror',e=>errors.push(e.message));
  try {
    await p.goto((process.env.AGRO_URL||'http://127.0.0.1:4388')+'/agro/');await p.locator('[data-view=lobby]').waitFor();
    const {createConfiguredWorld}=await import('../src/agro/world/setup.ts');
    const {TERRITORIES}=await import('../src/agro/terrain/presets.ts');
    const {createHeightfield,sampleHeight}=await import('../src/agro/terrain/heightfield.ts');
    const {sceneryHeight}=await import('../src/agro/terrain/exterior.ts');
    for(const id of Object.keys(TERRITORIES)) {
      const made=createConfiguredWorld({name:'Cámara '+id,seed:31415,territory:id,terrainParams:{...TERRITORIES[id].params},side:1200,template:'blank',site:'center',relief:'natural',radius:60,resources:[],water:80,experience:'free',start:'2026-09-21'});assert.ok(made.ok,made.error);
      if(result.sweeps.length)await p.getByRole('button',{name:/Mis mundos/}).click();
      await fixtureOpen(p,made.value);await ready(p);
      if(id==='ladera') {
        const hf=createHeightfield(made.value.terrain);
        let samples=await p.evaluate(()=>{
          const g=window.reviewScene.getObjectByName('cinturón y horizonte escénicos').geometry,ps=g.attributes.position,ix=g.index,out=[];
          for(let k=0;k<ix.count;k+=3){const a=ix.getX(k),b=ix.getX(k+1),c=ix.getX(k+2),x=(ps.getX(a)+ps.getX(b)+ps.getX(c))/3,z=(ps.getZ(a)+ps.getZ(b)+ps.getZ(c))/3,y=(ps.getY(a)+ps.getY(b)+ps.getY(c))/3;if(Math.max(Math.abs(x),Math.abs(z))>600&&Math.hypot(x,z)<1700)out.push({x,y,z});}return out;
        });
        samples=samples.map(s=>{
          const tx=Math.max(-599,Math.min(599,s.x)),tz=Math.max(-599,Math.min(599,s.z)),ty=sampleHeight(hf,tx,tz),analytic=sceneryHeight(hf,s.x,s.z);
          return {...s,tx,tz,ty,analytic,delta:s.y-analytic};
        }).filter(s=>s.analytic+2-s.ty>Math.hypot(s.x-s.tx,s.z-s.tz)*.12).sort((a,b)=>b.delta-a.delta).slice(0,6);
        const candidateFile=path.join(path.dirname(out),'camera-candidates.json');
        if(fs.existsSync(candidateFile))samples=JSON.parse(fs.readFileSync(candidateFile));else fs.writeFileSync(candidateFile,JSON.stringify(samples,null,2));
        for(let n=0;n<samples.length;n++) {
          const s=samples[n];await camera(p,'orbit',[s.x-s.tx,s.analytic+2-s.ty,s.z-s.tz],[s.tx,s.ty,s.tz]);
          const row={requested:s,...await p.evaluate(probe)};result.clearance.push(row);
          await p.screenshot({path:path.join(out,`camara-superficie-${n}.png`)});
          if(process.env.AGRO_REVIEW_ASSERT==='1')assert.ok(row.gap===null||row.gap>=1.9,JSON.stringify(row));
        }
      }
      for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
        await p.setViewportSize(viewport);await p.getByRole('button',{name:'Estratégica',exact:true}).click();
        for(let k=0;k<4;k++) {
          await p.evaluate(k=>{
            const s=window.reviewScene.__r3f.root.getState(),d=s.controls.maxDistance,a=k*Math.PI/2;
            s.controls.target.set(0,26,0);s.camera.position.set(Math.sin(a)*d*Math.sin(.88),26+d*Math.cos(.88),Math.cos(a)*d*Math.sin(.88));s.controls.update();s.invalidate();
          },k);await p.waitForTimeout(300);
          const row={id,viewport,k,...await p.evaluate(probe)};result.sweeps.push(row);
          if(process.env.AGRO_REVIEW_ASSERT==='1')assert.equal(row.missed.length,0,JSON.stringify(row));
        }
        if(id==='ladera')await p.screenshot({path:path.join(out,`camara-maxima-${viewport.width}.png`)});
      }
      await p.setViewportSize({width:1440,height:900});console.log('CAMERA',id);
    }
    result.errors=errors;assert.deepEqual(errors,[]);
  }finally{fs.writeFileSync(path.join(out,'camaras.json'),JSON.stringify(result,null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
