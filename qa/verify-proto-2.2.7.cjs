const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const {buildSync}=require('esbuild'),m=require('./proto-2.2.5/models/model.cjs');
const out='qa/proto-2.2.7',base=process.env.PANELLAB_URL||'http://127.0.0.1:4327/';fs.mkdirSync(out,{recursive:true});
buildSync({entryPoints:['src/lab/componentGeometry.ts'],bundle:true,platform:'node',format:'cjs',outfile:out+'/geometry.cjs'});
const {bodyCollision}=require('./proto-2.2.7/geometry.cjs');
const resistor={id:'r',kind:'resistor',from:'b:1',to:'b:5',value:1000,closed:true,color:'#aaa'};
assert.ok(bodyCollision({...resistor,id:'q',kind:'bjt',from:'c:2',to:'c:4'},[resistor]));
assert.equal(bodyCollision({...resistor,id:'q',kind:'bjt',from:'e:2',to:'e:4'},[resistor]),undefined);
for(const kind of ['hbridge','hbridge-bjt']){const p=m.newProject(kind);for(const c of p.breadboard.components)assert.equal(bodyCollision(c,p.breadboard.components),undefined,kind+' '+c.id);}
(async()=>{
 for(const engine of [chromium,webkit]){
  const b=await engine.launch();
  for(const width of [393,820]){
   const c=await b.newContext({viewport:{width,height:1000},isMobile:true,hasTouch:true,serviceWorkers:'block'}),p=await c.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));const project=m.newProject('hbridge-bjt');project.breadboard.power={plugged:true,enabled:true,redConnected:true,blackConnected:true};
   await c.addInitScript(v=>{localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[v],active:v.id}));localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');},project);
   await p.goto(base+'laboratorio?tool=breadboard');await p.locator('.lab-board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));
   const d=engine===chromium?await c.newCDPSession(p):null;
   const move=async(a,z,hold=false)=>{if(d){await d.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});for(let i=1;i<=12;i++){await d.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(z.x-a.x)*i/12,y:a.y+(z.y-a.y)*i/12,id:1}]});await p.waitForTimeout(16);}if(!hold)await d.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(z.x,z.y,{steps:12});if(!hold)await p.mouse.up();}};
   const release=()=>d?d.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}):p.mouse.up();
   await p.getByRole('button',{name:'Simular proyecto',exact:true}).tap();
   const motor=p.locator('[data-component-id="bj-m"]');
   for(const [id,sign] of [['bj-s1',1],['bj-s2',-1]]){
    const q=await p.locator(`[data-component-id="${id}"] .lab-button-hit`).boundingBox(),at={x:q.x+q.width/2,y:q.y+q.height/2};
    const vb=await p.locator('.lab-board-svg').getAttribute('viewBox');await move(at,{x:at.x+2,y:at.y+1},true);
    assert.ok(sign*Number(await motor.getAttribute('data-current'))>.15);assert.equal(await motor.locator('.lab-proto-motor-spin').getAttribute('data-direction'),sign>0?'forward':'reverse');
    assert.equal(await motor.locator('.lab-proto-motor-spin').evaluate(el=>getComputedStyle(el).animationName),'lab-proto-rotate');
    assert.equal(await p.locator('.lab-board-svg').getAttribute('viewBox'),vb);
    await p.screenshot({path:`${out}/${engine.name()}-${width}-${id}.png`});await release();
    assert.ok(Math.abs(Number(await motor.getAttribute('data-current')))<1e-5);
   }
   assert.equal(await p.locator('.lab-label.clickable').count(),0);
   const labels=await p.locator('.lab-label').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
   for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){const a=labels[i],z=labels[j];assert.ok(!(a.x<z.x+z.w&&a.x+a.w>z.x&&a.y<z.y+z.h&&a.y+a.h>z.y),'Overlapping labels');}
   await p.getByRole('button',{name:'Detener',exact:true}).tap();await p.getByRole('button',{name:'Multímetro',exact:true}).tap();
   const handle=p.getByRole('button',{name:'Mover multímetro',exact:true}),old=await handle.boundingBox(),vb=await p.locator('.lab-board-svg').getAttribute('viewBox');
   await move({x:old.x+old.width/2,y:old.y+old.height/2},{x:old.x+old.width/2-65,y:old.y+old.height/2-30});
   const now=await handle.boundingBox();assert.ok(Math.abs(now.x-old.x+65)<2);assert.equal(await p.locator('.lab-board-svg').getAttribute('viewBox'),vb);
   await p.getByRole('radio',{name:'Resistencia',exact:true}).tap();await p.waitForTimeout(400);
   for(const [color,hole] of [['roja',project.breadboard.components.find(c=>c.id==='bj-r1').from],['negra',project.breadboard.components.find(c=>c.id==='bj-r1').to]]){
    const el=p.getByRole('button',{name:`Punta ${color}: arrastra hasta un orificio`,exact:true});
    const a=await el.evaluate(el=>({x:(+el.getAttribute('x1')+ +el.getAttribute('x2'))/2,y:(+el.getAttribute('y1')+ +el.getAttribute('y2'))/2}));
    const tip=await el.locator('..').locator('.pen-tip').evaluate(el=>({x:+el.getAttribute('x1'),y:+el.getAttribute('y1')}));
    const z=await p.locator(`[data-hole="${hole}"]`).evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
    const box=await p.locator('.lab-leads').boundingBox();await move({x:a.x+box.x,y:a.y+box.y},{x:z.x+a.x-tip.x,y:z.y+a.y-tip.y});
   }
   assert.match(await p.getByLabel('Lectura del multímetro',{exact:true}).textContent(),/1,000.*kΩ/);
   assert.deepEqual(errors,[]);console.log('PASS',engine.name(),width,'touch switches, motor rotation, scaled labels, meter drag and probe measurement');await c.close();
  }await b.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
