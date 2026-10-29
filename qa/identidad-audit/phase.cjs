const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.goto('http://127.0.0.1:4460/',{waitUntil:'load'});await p.waitForTimeout(5000);const card=p.locator('.home-module').first();await card.click({force:true});await p.waitForTimeout(600);await card.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);
await p.evaluate(()=>{window.__fr=[];window.__ph='idle';let last=performance.now();const loop=t=>{window.__fr.push([t,t-last,window.__ph]);last=t;window.__raf=requestAnimationFrame(loop)};window.__raf=requestAnimationFrame(loop)});
const phase=n=>p.evaluate(n=>{window.__ph=n},n);
const m=async()=>{const {metrics}=await cdp.send('Performance.getMetrics');const g=k=>metrics.find(x=>x.name===k).value;return {style:g('RecalcStyleDuration'),layout:g('LayoutDuration'),script:g('ScriptDuration')}};
const out=[];const run=async(name,fn)=>{await phase(name);const a=await m();await fn();await p.waitForTimeout(400);const z=await m();out.push(name+': script '+Math.round((z.script-a.script)*1000)+' style '+Math.round((z.style-a.style)*1000)+' layout '+Math.round((z.layout-a.layout)*1000))};
await p.mouse.move(800,450);
await run('zoom-in (12 ruedas)',async()=>{for(let i=0;i<12;i++){await p.mouse.wheel(0,-120);await p.waitForTimeout(50)}});
await run('arrastre (40 mov.)',async()=>{await p.keyboard.down('Space');await p.mouse.down();for(let i=0;i<40;i++)await p.mouse.move(800+i*6,450+i*3);await p.mouse.up();await p.keyboard.up('Space')});
await run('zoom-out (12 ruedas)',async()=>{for(let i=0;i<12;i++){await p.mouse.wheel(0,120);await p.waitForTimeout(50)}});
await run('reposo 2 s',async()=>{await p.waitForTimeout(2000)});
const fr=await p.evaluate(()=>{cancelAnimationFrame(window.__raf);return window.__fr});
console.log(out.join('\n'));console.log('\nCuadros > 40 ms:');fr.filter(f=>f[1]>40).forEach(f=>console.log('  ',Math.round(f[1])+' ms en fase',f[2]));
const byPhase={};fr.forEach(f=>{(byPhase[f[2]]??=[]).push(f[1])});console.log('\nPor fase (cuadros / peor / media):');for(const k in byPhase){const a=byPhase[k];console.log('  ',k,a.length,Math.round(Math.max(...a)),Math.round(a.reduce((s,x)=>s+x,0)/a.length))}
await b.close()})()
