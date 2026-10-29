// Captura el tablero completo en simulación y mide rendimiento. Uso: node qa/cabinet-fx/measure.cjs <prefijo>
const fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4325',tag=process.argv[2]||'after',out='qa/cabinet-fx',fixture=JSON.parse(fs.readFileSync('qa/cabinet/project-from-ui.modo.json','utf8'));
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1440,height:960}});
 await context.addInitScript(({project})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-laboratory-v1'))localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[project],active:project.id}));},{project:fixture});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(base+'/laboratorio?tool=equipment');await p.locator('.industrial-equipment').first().waitFor();await p.waitForTimeout(1200);
 if(process.env.FX_CSS)await p.addStyleTag({content:process.env.FX_CSS});
 if(process.env.FX_JS)await p.evaluate(process.env.FX_JS);
 await p.screenshot({path:`${out}/${tag}-reposo.png`});
 await p.getByRole('button',{name:'Accionar tablero',exact:true}).click();await p.waitForTimeout(500);
 await p.locator('.cab-stage-actions').getByRole('button',{name:'Puerta',exact:true}).click();await p.waitForTimeout(500);
 await p.getByRole('button',{name:'Marcha S1',exact:true}).click();await p.waitForTimeout(1800);
 await p.screenshot({path:`${out}/${tag}-puerta-marcha.png`});
 await p.locator('.cab-stage-actions').getByRole('button',{name:'Conjunto',exact:true}).click();await p.waitForTimeout(900);
 await p.screenshot({path:`${out}/${tag}-conjunto-marcha.png`});
 await p.locator('.cab-stage-actions').getByRole('button',{name:'Placa',exact:true}).click();await p.waitForTimeout(900);
 await p.screenshot({path:`${out}/${tag}-placa-marcha.png`});
 const cdp=await context.newCDPSession(p);await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const snap=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
 const m0=await snap();await p.waitForTimeout(4000);const m1=await snap(),cpu=Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].map(k=>[k,+((m1[k]-m0[k])/4*100).toFixed(1)+'% (de un núcleo, x4 más lento)']));
 const perf=await p.evaluate(()=>new Promise(resolve=>{const frames=[];let last=performance.now(),n=0;const long=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>long.push(e.duration))).observe({entryTypes:['longtask']});}catch{}
  const step=t=>{frames.push(t-last);last=t;if(++n<240)requestAnimationFrame(step);else{frames.sort((a,b)=>a-b);const q=f=>frames[Math.min(frames.length-1,Math.floor(frames.length*f))];resolve({frames:frames.length,median:+q(.5).toFixed(1),p95:+q(.95).toFixed(1),max:+frames.at(-1).toFixed(1),longTasks:long.length,longTaskMs:+long.reduce((a,b)=>a+b,0).toFixed(0)});}};requestAnimationFrame(step);}));
 const nodes=await p.evaluate(()=>({svgNodes:document.querySelectorAll('.eq-canvas *').length,filters:document.querySelectorAll('.eq-canvas [filter]').length}));
 console.log(JSON.stringify({tag,cpu,perf,nodes,errors},null,1));fs.writeFileSync(`${out}/${tag}-perf.json`,JSON.stringify({cpu,perf,nodes,errors},null,1));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
