const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
await p.goto('http://127.0.0.1:4460/',{waitUntil:'load'});await p.waitForTimeout(6000);
const card=p.locator('.home-module').first();await card.click({force:true,timeout:8000});await p.waitForTimeout(600);await card.click({force:true,timeout:8000}).catch(()=>{});await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Abrir diagrama/}).first().click();await p.waitForTimeout(2000);
const rect=()=>p.evaluate(()=>{const e=document.querySelector('.diagram-window');if(!e)return null;const r=e.getBoundingClientRect();return {cls:e.className,pos:getComputedStyle(e).position,x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),hidden:e.hidden,handles:e.querySelectorAll('.float-handle').length}});
console.log('abierto',JSON.stringify(await rect()));await p.screenshot({path:'qa/identidad-audit/float-1-abierto.png'});
// mover por cabecera
const h=await p.locator('.diagram-window .diagram-pane-actions').boundingBox();
await p.mouse.move(h.x+60,h.y+h.height/2);await p.mouse.down();await p.mouse.move(h.x+460,h.y+h.height/2+60,{steps:8});await p.mouse.up();await p.waitForTimeout(400);
console.log('movido',JSON.stringify(await rect()));
// redimensionar por borde E y esquina SE
let r=await rect();const se=p.locator('.diagram-window .float-handle-se');const sb=await se.boundingBox();
await p.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2);await p.mouse.down();await p.mouse.move(sb.x+sb.width/2+220,sb.y+sb.height/2-80,{steps:8});await p.mouse.up();await p.waitForTimeout(400);
console.log('redim',JSON.stringify(await rect()));await p.screenshot({path:'qa/identidad-audit/float-2-movido.png'});
console.log('guardado',await p.evaluate(()=>localStorage.getItem('panellab-float-v2-desktop')));
// recarga: conserva
await p.reload({waitUntil:'load'});await p.waitForTimeout(6000);const c2=p.locator('.home-module').first();await c2.click({force:true}).catch(()=>{});await p.waitForTimeout(600);await c2.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);await p.getByRole('button',{name:/Abrir diagrama/}).first().click();await p.waitForTimeout(2000);console.log('tras recargar',JSON.stringify(await rect()));
// Ampliar -> lectura -> volver
await p.getByRole('button',{name:/Ampliar diagrama/}).first().click();await p.waitForTimeout(1500);console.log('ampliado',JSON.stringify(await rect()));await p.screenshot({path:'qa/identidad-audit/float-3-ampliado.png'});
await p.getByRole('button',{name:/Volver al banco/}).first().click();await p.waitForTimeout(1500);console.log('vuelto',JSON.stringify(await rect()));
// cerrar
await p.getByRole('button',{name:'Cerrar diagrama'}).first().click();await p.waitForTimeout(800);console.log('cerrado',JSON.stringify(await rect()));
await b.close()})()
