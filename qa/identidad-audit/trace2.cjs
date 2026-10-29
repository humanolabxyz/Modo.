const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const tab=process.env.TAB||'Temperatura';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();const cdp=await c.newCDPSession(p);
await p.goto('http://127.0.0.1:4460/laboratorio/',{waitUntil:'load'});await p.waitForTimeout(3000);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
const events=[];cdp.on('Tracing.dataCollected',e=>events.push(...e.value));
await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline',transferMode:'ReportEvents'});
await p.getByRole('button',{name:new RegExp('^'+tab)}).first().click();await p.waitForTimeout(1800);
const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
const lay=events.filter(e=>e.name==='Layout'&&e.ph==='X').sort((a,b)=>b.dur-a.dur).slice(0,6);console.log('Layouts más largos (ms@4x · objetos sucios/total):');lay.forEach(e=>console.log('  ',Math.round(e.dur/1000),'·',e.args?.beginData?.dirtyObjects,'/',e.args?.beginData?.totalObjects));
const ul=events.filter(e=>e.name==='UpdateLayoutTree'&&e.ph==='X').sort((a,b)=>b.dur-a.dur).slice(0,3);console.log('UpdateLayoutTree más largos:');ul.forEach(e=>console.log('  ',Math.round(e.dur/1000),'· elementos',e.args?.elementCount));
const pa=events.filter(e=>/^(Paint|PrePaint|Layerize|RasterTask|ImageDecodeTask)$/.test(e.name)&&e.ph==='X');const sum={};pa.forEach(e=>sum[e.name]=(sum[e.name]||0)+e.dur/1000);console.log('Pintado:',Object.entries(sum).map(([k,v])=>k+' '+Math.round(v)).join(' · '));
// quién dispara los layouts: stack del primero
const withStack=events.filter(e=>e.name==='Layout'&&e.args?.beginData?.stackTrace).sort((a,b)=>b.dur-a.dur)[0];if(withStack)console.log('Pila del layout más largo:',withStack.args.beginData.stackTrace.slice(0,6).map(f=>f.functionName+'@'+(f.url||'').split('/').pop()+':'+f.lineNumber).join(' ← '));
await b.close()})()
