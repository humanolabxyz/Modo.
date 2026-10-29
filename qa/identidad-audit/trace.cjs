const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const scen=process.env.SCEN||'panel';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();const cdp=await c.newCDPSession(p);
await p.goto('http://127.0.0.1:4460/'+(scen==='lab'?'laboratorio/':''),{waitUntil:'load'});await p.waitForTimeout(5000);
if(scen==='panel'){const card=p.locator('.home-module').first();await card.click({force:true});await p.waitForTimeout(600);await card.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);}
else{await p.getByRole('button',{name:/^Protoboard/}).first().click();await p.waitForTimeout(2000)}
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const events=[];cdp.on('Tracing.dataCollected',e=>events.push(...e.value));
await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking',transferMode:'ReportEvents'});
await p.mouse.move(800,450);await p.keyboard.down('Space');await p.mouse.down();for(let i=0;i<40;i++)await p.mouse.move(800+i*6,450+i*3);await p.mouse.up();await p.keyboard.up('Space');
for(let i=0;i<8;i++){await p.mouse.wheel(0,-120);await p.waitForTimeout(50)}
await p.waitForTimeout(300);
const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
const dur={};const cnt={};for(const e of events){if(e.ph==='X'&&e.dur&&/^(UpdateLayoutTree|Layout|RecalculateStyles|Paint|PrePaint|Layerize|UpdateLayer|FunctionCall|EventDispatch|HitTest|IntersectionObserverController::computeIntersections|UpdateLayoutTree)$/.test(e.name)){dur[e.name]=(dur[e.name]||0)+e.dur/1000;cnt[e.name]=(cnt[e.name]||0)+1}}
console.log('Tiempo por tipo (ms@4x) / veces:');Object.entries(dur).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log('  ',k.padEnd(26),Math.round(v).toString().padStart(6),cnt[k]));
const ul=events.filter(e=>e.name==='UpdateLayoutTree'&&e.ph==='X').sort((a,b)=>b.dur-a.dur).slice(0,3);console.log('\nUpdateLayoutTree más largos:');ul.forEach(e=>console.log('  ',Math.round(e.dur/1000)+' ms · elementos',e.args?.elementCount));
const inv={};for(const e of events){if(/InvalidationTracking|StyleRecalcInvalidationTracking|ScheduleStyleRecalculationTracking/.test(e.name)){const d=e.args?.data||{};const k=e.name.replace('Tracking','')+' | '+(d.reason||'')+' | '+(d.invalidatedSelectorId||d.invalidationSet||d.selectorPart||d.changedAttribute||d.changedClass||d.changedId||'')+' | '+(d.nodeName||'');inv[k]=(inv[k]||0)+1}}
console.log('\nCausas de invalidación (top):');Object.entries(inv).sort((a,b)=>b[1]-a[1]).slice(0,14).forEach(([k,v])=>console.log('  ',String(v).padStart(5),k.slice(0,150)));
// quién provoca layout forzado
const lay=events.filter(e=>e.name==='Layout'&&e.ph==='X').sort((a,b)=>b.dur-a.dur).slice(0,3);console.log('\nLayout más largos:');lay.forEach(e=>console.log('  ',Math.round(e.dur/1000)+' ms · nodos',e.args?.beginData?.dirtyObjects,'/',e.args?.beginData?.totalObjects,'raíz',e.args?.endData?.root?.slice?.(0,40)||''));
await b.close()})()
