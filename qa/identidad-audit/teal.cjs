const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[390,844],[1440,900]]){const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();
await p.goto('http://127.0.0.1:4455/',{waitUntil:'load'});await p.waitForTimeout(6000);
const card=p.locator('.home-module').first();await card.click({force:true,timeout:8000});await p.waitForTimeout(600);await card.click({force:true,timeout:8000}).catch(()=>{});await p.waitForTimeout(3000);
await p.getByRole('button',{name:/Diagrama|Abrir diagrama/}).first().click().catch(()=>{});await p.waitForTimeout(1500);
console.log('##',w,await p.evaluate(()=>{const o=new Set();for(const e of document.querySelectorAll('.editor-workbench *, .mobile-floating-window *')){if(e.closest('svg'))continue;const r=e.getBoundingClientRect();if(r.width<16||r.height<16)continue;const cs=getComputedStyle(e);const m=cs.backgroundColor.match(/rgba?\(([^)]+)\)/);if(!m)continue;const [R,G,B,A=1]=m[1].split(/[ ,\/]+/).map(Number);if(A>.4&&B>R+6&&G>R+4&&R>150)o.add(e.tagName+'.'+String(e.className).slice(0,50)+' '+R+','+G+','+B)}return [...o].join('\n')}));
await c.close()}await b.close()})()
