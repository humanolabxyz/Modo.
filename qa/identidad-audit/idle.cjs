const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();
const run=async(name,path,prep)=>{const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
await p.goto('http://127.0.0.1:4460'+path,{waitUntil:'load'});await p.waitForTimeout(3500);if(prep)await prep(p);await p.waitForTimeout(1500);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});const g=async()=>{const {metrics}=await cdp.send('Performance.getMetrics');const v=k=>metrics.find(x=>x.name===k).value;return {task:v('TaskDuration'),script:v('ScriptDuration'),layout:v('LayoutDuration'),style:v('RecalcStyleDuration'),layouts:v('LayoutCount'),recalcs:v('RecalcStyleCount')}};
const a=await g();await p.waitForTimeout(5000);const z=await g();
console.log(name.padEnd(22),'ocupado '+Math.round((z.task-a.task)/5*100)/10+'% del hilo en reposo · script '+Math.round((z.script-a.script)*1000)+'ms · estilo '+Math.round((z.style-a.style)*1000)+'ms/'+(z.recalcs-a.recalcs)+' · layout '+Math.round((z.layout-a.layout)*1000)+'ms/'+(z.layouts-a.layouts));await c.close()};
await run('Home','/');
await run('Home (movimiento reducido)','/?movimiento=reducido');
await run('Panel','/',async p=>{await p.locator('.home-module').first().click({force:true});await p.waitForTimeout(2500)});
await run('Panel simulando','/',async p=>{await p.locator('.home-module').first().click({force:true});await p.waitForTimeout(2500);await p.locator('.simulation-toggle').click();await p.waitForTimeout(800)});
await run('Estudio','/estudio/');
await run('Lab Esquemas','/laboratorio/');
await run('Lab Protoboard','/laboratorio/',async p=>{await p.getByRole('button',{name:/^Protoboard/}).first().click();await p.waitForTimeout(1500)});
await run('Lab PLC simulando','/laboratorio/',async p=>{await p.getByRole('button',{name:/^PLC/}).first().click();await p.waitForTimeout(1000);await p.getByRole('button',{name:/Simular proyecto/}).click();await p.waitForTimeout(800)});
await run('Lab Temperatura','/laboratorio/',async p=>{await p.getByRole('button',{name:/^Temperatura/}).first().click();await p.waitForTimeout(1500)});
await b.close()})()
