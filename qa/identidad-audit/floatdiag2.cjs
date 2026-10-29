const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
await p.goto('http://127.0.0.1:4460/',{waitUntil:'load'});await p.waitForTimeout(6000);
const card=p.locator('.home-module').first();await card.click({force:true});await p.waitForTimeout(600);await card.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Abrir diagrama/}).first().click();await p.waitForTimeout(2000);
await p.screenshot({path:'qa/identidad-audit/float-4-limpio.png'});
const info=await p.evaluate(()=>{const h=document.querySelector('.diagram-window .float-handle-se');const r=h.getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {handle:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],top:el&&(el.tagName+'.'+String(el.className).slice(0,60))}});console.log(JSON.stringify(info));
const rect=()=>p.evaluate(()=>{const r=document.querySelector('.diagram-window').getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]});
console.log('antes',await rect());
const [x,y]=[info.handle[0]+info.handle[2]/2,info.handle[1]+info.handle[3]/2];
await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+200,y-60,{steps:10});await p.mouse.up();await p.waitForTimeout(400);console.log('tras SE',await rect());
const e=await p.locator('.diagram-window .float-handle-e').boundingBox();await p.mouse.move(e.x+5,e.y+e.height/2);await p.mouse.down();await p.mouse.move(e.x+105,e.y+e.height/2,{steps:6});await p.mouse.up();await p.waitForTimeout(300);console.log('tras E',await rect());
await p.screenshot({path:'qa/identidad-audit/float-5-redim.png'});
await b.close()})()
