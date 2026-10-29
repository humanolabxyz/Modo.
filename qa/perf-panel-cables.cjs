const fs=require('node:fs'),assert=require('node:assert/strict');
const {build}=require('esbuild');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.env.PERF_PHASE||'before',base=process.env.PANELLAB_URL||'http://127.0.0.1:4335/',out=`qa/cable-performance/${phase}`;
const metrics=async c=>Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
const results=[],errors=[];
async function sample(p,c,name,gesture){
 await p.waitForTimeout(350);
 await p.evaluate(()=>{const s=window.__cablePerf={long:[],frames:[],writes:0,geometry:0,wireRenders:0,previewRenders:0,last:performance.now()};const frame=t=>{s.frames.push(t-s.last);s.last=t;s.raf=requestAnimationFrame(frame);};s.raf=requestAnimationFrame(frame);s.observer=new PerformanceObserver(l=>s.long.push(...l.getEntries().map(e=>e.duration)));s.observer.observe({entryTypes:['longtask']});s.mutation=new MutationObserver(l=>s.writes+=l.length);s.mutation.observe(document.querySelector('.wire-layer'),{attributes:true,subtree:true});});
 const a=await metrics(c),started=Date.now();if(gesture)await gesture();await p.waitForTimeout(Math.max(400,1800-(Date.now()-started)));const b=await metrics(c);
 const stats=await p.evaluate(()=>{const s=window.__cablePerf;cancelAnimationFrame(s.raf);s.observer.disconnect();s.mutation.disconnect();const f=s.frames.sort((a,b)=>a-b);return {elapsed:performance.now()-s.last,frames:f.length,p95:f[Math.floor(f.length*.95)],slowFrames:f.filter(x=>x>35).length,longTasks:s.long.length,longMs:s.long.reduce((a,b)=>a+b,0),wireWrites:s.writes};});
 const row={name,...stats};for(const k of ['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount'])row[k]=+(b[k]-a[k]).toFixed(5);results.push(row);console.log(JSON.stringify(row));
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});await build({stdin:{contents:`export {SIMULATION_EXAMPLES,emptySimulation} from './src/data/simulation';export {emptyPractice} from './src/data/practice';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:'qa/cable-performance/fixtures.cjs',logLevel:'silent'});
 const {SIMULATION_EXAMPLES:examples,emptyPractice}=require('./cable-performance/fixtures.cjs');
 const browser=await chromium.launch();try{for(const count of [54,160]){
 const practice={...emptyPractice(),diagram:null,title:'Prueba de carga de cables',wires:Array.from({length:count},(_,i)=>{const [a,b]=examples.starDelta.pairs[i%examples.starDelta.pairs.length];return {id:`perf-cable-${i}`,from:{terminalId:a},to:{terminalId:b},color:'#145650',route:{sag:130},layer:i+1};})};
 const ctx=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:2,hasTouch:true,serviceWorkers:'block'});await ctx.addInitScript(doc=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');localStorage.setItem('panellab-practice-v2',JSON.stringify(doc));},practice);
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:4});await c.send('Performance.enable');await p.goto(base+'?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));assert.equal(await p.locator('.interactive-wire').count(),count);
 const board=p.locator('.board-svg'),box=await board.boundingBox();const pan=async()=>{await p.mouse.move(box.x+10,box.y+box.height-100);await p.mouse.down();for(let i=1;i<=30;i++)await p.mouse.move(box.x+10+i*3,box.y+box.height-100-i);await p.mouse.up();};
 await sample(p,c,`${count}-idle`);
 await sample(p,c,`${count}-pan`,pan);
 await p.getByRole('button',{name:'Conectar cables',exact:true}).click();const source=p.locator('[data-terminal-id="FUENTE:F"]');await source.focus();await p.keyboard.press('Enter');
 await sample(p,c,`${count}-connect-preview`,async()=>{for(let i=0;i<60;i++)await p.mouse.move(box.x+120+(i%30)*12,box.y+200+(i%20)*15);});await p.keyboard.press('Escape');
 await p.getByRole('button',{name:'Simular mando de 24 V',exact:true}).click();await p.getByLabel('Opciones de simulación',{exact:true}).click();const d=p.getByRole('dialog',{name:'Simulación · 24 V',exact:true});await d.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).click();for(const name of ['FUERZA · OFF','CONTROL 1 · OFF','CONTROL 2 · OFF'])await d.getByRole('button',{name,exact:true}).click();await d.getByRole('button',{name:'Cerrar simulación · 24 v',exact:true}).click();await p.getByRole('button',{name:'Ocultar el estado de energía',exact:true}).click();await p.getByRole('button',{name:'Pulsador verde derecho',exact:true}).focus();await p.keyboard.down('Space');await p.locator('[data-motor-connection=star]').waitFor();await p.keyboard.up('Space');await p.locator('[data-motor-connection=delta]').waitFor();
 await sample(p,c,`${count}-running`);await sample(p,c,`${count}-running-pan`,pan);
 await p.screenshot({path:`${out}/${count}-cables.png`});await ctx.close();
 }assert.deepEqual(errors,[]);}finally{await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify({base,cpuThrottle:4,viewport:'820x1180',deviceScaleFactor:2,phase,results,errors},null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
