const fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4346/',phase=process.env.PERF_PHASE||'after',out='qa/offline-travel';
const routes=[['home','/','button[data-module="panel"]:enabled'],['panel','/?view=simulator','.board-svg'],['study','/estudio/','.campus-course'],['plc','/laboratorio?tool=plc','.lab-program'],['breadboard','/laboratorio?tool=breadboard','.lab-board-svg'],['temperature','/laboratorio?tool=temperature','[data-temperature-ready="true"]'],['detectors','/laboratorio?tool=detectors','[data-detectors-ready="true"]']];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch();const results=[];try{
 for(const [name,route,selector]of routes){
  for(let run=0;run<3;run++){
   const ctx=await browser.newContext({viewport:{width:820,height:1180},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
   await ctx.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
   const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Performance.enable');
   let js=0;const urls=[];page.on('response',r=>{if(r.url().includes('/_astro/')&&r.url().endsWith('.js')){js+=Number(r.headers()['content-length']||0);urls.push(r.url().split('/').pop());}});
   const started=Date.now();await page.goto(base.replace(/\/$/,'')+route);await page.locator(selector).first().waitFor({timeout:30000});
   const readyMs=Date.now()-started;await page.waitForTimeout(150);
   const before=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
   await page.waitForTimeout(1000);const after=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
   const row={name,run,readyMs,jsBytes:js,unusedSchematicLoaded:urls.some(u=>u.startsWith('SchematicView.')),idleTaskMs:Math.round((after.TaskDuration-before.TaskDuration)*1000),heapMB:Math.round(after.JSHeapUsedSize/1048576*10)/10};results.push(row);console.log(JSON.stringify(row));await ctx.close();
  }
 }
}finally{await browser.close();fs.writeFileSync(`${out}/performance-${phase}.json`,JSON.stringify({base,cpuThrottle:4,viewport:'820x1180',runs:3,results},null,2));}})().catch(e=>{console.error(e);process.exitCode=1;});
