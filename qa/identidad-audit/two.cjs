const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const check=require('./check.cjs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();
await p.goto('http://127.0.0.1:4460/',{waitUntil:'load'});await p.waitForTimeout(5000);const card=p.locator('.home-module').first();await card.click({force:true});await p.waitForTimeout(600);await card.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);
const btn=p.locator('button[aria-label*="Color"]');console.log('color btns',await btn.count());await btn.first().click({force:true,timeout:3000}).catch(e=>console.log('x',e.message.slice(0,60)));await p.waitForTimeout(800);
await p.screenshot({path:'qa/identidad-audit/sw-panel-color.png'});console.log('contraste',(await p.evaluate(check)).filter(i=>!i.unknown&&!/SVGAnimated/.test(i.cls)).map(i=>i.ratio+' '+i.txt).join(' | '));
await p.goto('http://127.0.0.1:4460/laboratorio/');await p.waitForTimeout(3500);await p.getByRole('button',{name:/^Temperatura/}).first().click();await p.waitForTimeout(2000);
const lb=p.locator('button[aria-label*="libreta" i]');console.log('libreta btns',await lb.count());await lb.first().click({force:true,timeout:3000}).catch(e=>console.log('x',e.message.slice(0,60)));await p.waitForTimeout(1000);
await p.screenshot({path:'qa/identidad-audit/sw-lab-libreta.png'});console.log('contraste',(await p.evaluate(check)).filter(i=>!i.unknown&&!/SVGAnimated/.test(i.cls)).map(i=>i.ratio+' '+i.txt).join(' | '));
await b.close()})()
