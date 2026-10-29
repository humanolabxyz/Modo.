const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();
await p.goto('http://127.0.0.1:4460/',{waitUntil:'load'});await p.waitForTimeout(6000);
const card=p.locator('.home-module').first();await card.click({force:true});await p.waitForTimeout(600);await card.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Abrir diagrama/}).first().click();await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>{const s=document.querySelector('.diagram-window .cade-artboard');let n=s,o=[];while(n&&!n.classList.contains('diagram-window')){const cs=getComputedStyle(n),r=n.getBoundingClientRect();o.push(n.tagName+'.'+String(n.className.baseVal??n.className).slice(0,40)+' '+cs.display+' h'+Math.round(r.height)+' fl'+cs.flex.slice(0,12)+' ov'+cs.overflowY+' hs'+cs.height);n=n.parentElement}return o.join('\n')}));
console.log('white strip:',await p.evaluate(()=>{const e=document.elementFromPoint(430,400);let n=e,o=[];for(let i=0;i<7&&n;i++,n=n.parentElement)o.push(n.tagName+'.'+String(n.className).slice(0,40)+' '+getComputedStyle(n).backgroundColor);return o.join(' < ')}));
await b.close()})()
