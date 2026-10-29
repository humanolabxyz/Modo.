const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const find=()=>{const out=[];for(const e of document.querySelectorAll('body *')){if(e.closest('svg'))continue;const r=e.getBoundingClientRect();if(r.width*r.height<1500||r.width<20||r.height<12)continue;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
 const m=cs.backgroundColor.match(/rgba?\(([^)]+)\)/);let tint=false,col='';if(m){const [R,G,B,A=1]=m[1].split(/[ ,\/]+/).map(Number);if(A>.3&&(Math.abs(G-R)>=4||Math.abs(G-B)>=5)&&!(R>200&&G>200&&B>200&&Math.abs(R-B)<8)&&!(R<60&&G<60&&B<60)){tint=true;col=`${R},${G},${B}`}}
 const bi=cs.backgroundImage!=='none'&&!/url/.test(cs.backgroundImage);
 if(tint||bi)out.push((e.className&&String(e.className).slice(0,60)||e.tagName)+' | '+(tint?'bg '+col:'')+(bi?' grad '+cs.backgroundImage.slice(0,70):'')+' | '+Math.round(r.width)+'x'+Math.round(r.height))}
 return [...new Set(out)].slice(0,40)};
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();
await p.goto('http://127.0.0.1:4455/laboratorio/');await p.waitForTimeout(3000);
for(const t of ['Esquemas','Equipos eléctricos','PLC','HMI','Procesos','Protoboard','Soldadura','Temperatura','Detectores']){await p.getByRole('button',{name:new RegExp('^'+t)}).first().click().catch(()=>{});await p.waitForTimeout(1500);console.log('\n##',t);(await p.evaluate(find)).forEach(x=>console.log(' ',x))}
await b.close()})()
