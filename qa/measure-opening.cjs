const fs=require('node:fs'),{chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'https://panellab-inacap.vercel.app/').replace(/\/?$/,'/');
const label=process.env.PERF_LABEL||'before',dir='qa/performance-opening';fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch();const report={base,label,profile:{downloadKbps:1600,latencyMs:150,cpuSlowdown:4},samples:[],errors:[]};
try{for(const mode of ['home','simulator'])for(let run=1;run<=2;run++){
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'}),page=await ctx.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.addInitScript(()=>{window.__perf={lcp:0,cls:0,longTasks:[]};for(const type of ['largest-contentful-paint','layout-shift','longtask'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')window.__perf.lcp=e.startTime;if(type==='layout-shift'&&!e.hadRecentInput)window.__perf.cls+=e.value;if(type==='longtask')window.__perf.longTasks.push({start:e.startTime,duration:e.duration})}}).observe({type,buffered:true})}catch{}});
 const cdp=await ctx.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:95000});
 await page.goto(base+(mode==='simulator'?'?view=simulator':''),{waitUntil:'domcontentloaded',timeout:60000});
 if(mode==='simulator')await page.locator('.board-svg').waitFor({timeout:60000});else await page.waitForFunction(()=>document.querySelector('.modo-primary')&&!document.querySelector('.modo-primary').disabled,{timeout:60000});
 const readyMs=await page.evaluate(()=>performance.now());
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(700);
 const data=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource'),paints=performance.getEntriesByType('paint');return{ttfbMs:n.responseStart,fcpMs:paints.find(x=>x.name==='first-contentful-paint')?.startTime,lcpMs:window.__perf.lcp,cls:window.__perf.cls,longTaskBlockingMs:window.__perf.longTasks.reduce((s,x)=>s+Math.max(0,x.duration-50),0),transferBytes:n.transferSize+resources.reduce((s,r)=>s+r.transferSize,0),requests:resources.length+1,resources:resources.map(r=>({url:r.name,bytes:r.transferSize,duration:r.duration}))}});
 report.samples.push({mode,run,readyMs,...data});console.log(JSON.stringify({mode,run,readyMs:Math.round(readyMs),fcpMs:data.fcpMs,lcpMs:data.lcpMs,bytes:data.transferBytes,cls:data.cls}));
 if(run===1)await page.screenshot({path:dir+'/'+label+'-'+mode+'.png',fullPage:mode==='home',animations:'disabled'});
 await ctx.close();
}
const ctx=await browser.newContext(),page=await ctx.newPage();await page.goto(base);await page.evaluate(()=>navigator.serviceWorker.ready);
report.precache=await page.evaluate(async()=>{let count=0,bytes=0,urls=[];for(const name of await caches.keys())if(name.startsWith('panellab-')){const c=await caches.open(name);for(const req of await c.keys()){const r=await c.match(req);bytes+=(await r.arrayBuffer()).byteLength;count++;urls.push(req.url)}}return{count,bytes,urls}});
console.log('PRECACHE',JSON.stringify({count:report.precache.count,bytes:report.precache.bytes}));await ctx.close();
}finally{await browser.close();fs.writeFileSync(dir+'/'+label+'.json',JSON.stringify(report,null,2))}})().catch(e=>{console.error(e);process.exitCode=1});
