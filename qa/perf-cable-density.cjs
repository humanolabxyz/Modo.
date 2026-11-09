const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const {SIMULATION_EXAMPLES}=await import('./cable-performance-2026-11-03/model/simulation.js');
 const {createCable}=await import('./cable-performance-2026-11-03/model/wiring.js');
 const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327/').replace(/\/?$/,'/'),out='qa/cable-performance-2026-11-03';
 const browser=await chromium.launch();const results=[];
 try{for(const copies of [1,3]){
  const wires=[];for(let i=0;i<copies;i++)for(const [a,b] of [...SIMULATION_EXAMPLES.starDelta.pairs,['FUENTE:TP','BORNERA_MOTOR:TP']])wires.push(createCable(a,b,wires));
  const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  await ctx.addInitScript(wires=>{
   localStorage.setItem('panellab-practice-v2',JSON.stringify({version:2,title:'Prueba de densidad de cables',wires,diagram:null,steps:[],mode:'free',stepIndex:0}));
   localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1');
  },wires);
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto(base+'?view=simulator');await p.locator('.board-svg').waitFor();
  assert.equal(await p.locator('.interactive-wire').count(),wires.length);
  if(await p.locator('.simulation-toggle').getAttribute('aria-pressed')!=='true')await p.locator('.simulation-toggle').click();
  for(const selector of ['[data-supply-plug]','[data-control-breaker="0"]','[data-control-breaker="1"]','[data-force-breaker]'])await p.locator(selector).dispatchEvent('click');
  await p.getByRole('button',{name:'Pulsador verde izquierdo',exact:true}).focus();await p.keyboard.down('Space');await p.waitForTimeout(250);await p.keyboard.up('Space');
  await p.locator('.motor-rotor[data-spinning=true]').waitFor();await p.waitForTimeout(1500);
  const sample=await p.evaluate(()=>new Promise(resolve=>{
   const frames=[],long=[],start=performance.now();let last=start;
   const observer=new PerformanceObserver(list=>long.push(...list.getEntries().map(e=>e.duration)));observer.observe({entryTypes:['longtask']});
   const frame=t=>{frames.push(t-last);last=t;if(t-start<4000)requestAnimationFrame(frame);else{observer.disconnect();frames.sort((a,b)=>a-b);resolve({frames:frames.length,p95:frames[Math.floor(frames.length*.95)],longTasks:long.length,longMs:long.reduce((a,b)=>a+b,0)});}};requestAnimationFrame(frame);
  }));
  assert.ok(await p.locator('[data-live-wire]').count());
  const flow=p.locator('[data-flow-wire]').first(),offset=await flow.getAttribute('stroke-dashoffset');await p.waitForTimeout(300);assert.equal(await flow.getAttribute('stroke-dashoffset'),offset,'live indicators do not animate the whole SVG');
  const first=p.locator('.interactive-wire').first();await first.focus();await p.keyboard.press('Enter');await p.waitForTimeout(250);assert.equal(await first.getAttribute('aria-pressed'),'true','keyboard selection remains available');
  await p.screenshot({path:`${out}/panel-${wires.length}-cables.png`});
  assert.deepEqual(errors,[]);results.push({wires:wires.length,cpuThrottle:4,deviceScaleFactor:2,...sample,errors});
  await ctx.close();console.log(JSON.stringify(results.at(-1)));
 }}finally{await browser.close();fs.writeFileSync(`${out}/density.json`,JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exit(1)});
