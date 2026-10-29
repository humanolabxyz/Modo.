const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();
const probe=async(label,sel)=>{const loc=p.locator(sel).first();if(!(await loc.count())){console.log(label,'NO ENCONTRADO');return}
 const get=()=>loc.evaluate(e=>{const cs=getComputedStyle(e);return e.tagName+'.'+String(e.className).slice(0,30)+' bg='+cs.backgroundColor+' col='+cs.color+' bi='+cs.backgroundImage.slice(0,30)+' sh='+cs.boxShadow.slice(0,30)+' bd='+cs.borderTopColor});
 const a=await get();await loc.hover({force:true,timeout:1500}).catch(()=>{});await p.waitForTimeout(500);const d=await get();console.log(label,a===d?'SIN CAMBIO':'ok','\n   ',a,'\n   ',d)};
await p.goto('http://127.0.0.1:4460/laboratorio/');await p.waitForTimeout(3500);
await probe('lab-back','.lab-back');
await p.locator('.lab-project-menu>summary').first().click().catch(()=>{});await p.waitForTimeout(500);
await probe('menu ejemplo','.lab-project-menu>div button:has-text("Ejemplo")');
await probe('menu panel','.lab-project-menu>div a');
await probe('tab no activo','.lab-tool-nav button:not(.current):not([aria-pressed=true])');
await p.getByRole('button',{name:/^Temperatura/}).first().click();await p.waitForTimeout(1500);
await probe('medir','button:has-text("Medir TC K")');
await probe('preparacion','button:has-text("Preparación")');
await probe('como se conectan','button:has-text("Cómo se conectan")');
await p.goto('http://127.0.0.1:4460/estudio/');await p.waitForTimeout(3500);await p.locator('.campus-course').first().click();await p.waitForTimeout(1500);
await probe('videos','a:has-text("Videos tutoriales"), button:has-text("Videos tutoriales")');
await probe('unidad summary','.course-unit>summary');
await p.locator('.course-unit>summary').first().click();await p.waitForTimeout(500);
await probe('clase fila','.course-unit a:has-text("Clase 1"), .course-unit button:has-text("Clase 1")');
await b.close()})()
