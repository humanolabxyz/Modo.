const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const report={checks:[],errors:[]},pass=s=>{report.checks.push(s);console.log('PASS',s)};
const base='http://127.0.0.1:4344/';
async function home(p){await p.goto(base);await p.locator('[data-module=panel]:not(:disabled)').waitFor();}
const selected=p=>p.locator('.home-module.is-selected').getAttribute('data-module');
(async()=>{for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){const b=await engine.launch();try{const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await home(p);
// Side card first tap only centers; second tap opens the existing simulator.
await p.locator('[data-module=panel]').tap();assert.equal(new URL(p.url()).pathname,'/');assert.equal(await selected(p),'panel');assert.equal(await p.locator('.editor-workbench').count(),0);await p.locator('[data-module=panel]').tap();await p.locator('.editor-workbench .board-svg').waitFor();pass(`${name}: primer toque lateral centra; segundo toque abre Panel`);
await home(p);const rect=await p.locator('.home-module.is-selected').boundingBox(),y=rect.y+rect.height*.52;
await p.mouse.move(235,y);await p.mouse.down();await p.mouse.move(115,y,{steps:8});await p.mouse.up();assert.equal(await selected(p),'lab');assert.equal(new URL(p.url()).pathname,'/');pass(`${name}: arrastre con mouse en vista móvil cambia de tarjeta sin abrir módulo`);
await p.mouse.move(190,y);await p.mouse.down();await p.mouse.move(170,y,{steps:5});await p.mouse.up();assert.equal(await selected(p),'lab');assert.equal(new URL(p.url()).pathname,'/');pass(`${name}: gesto corto mueve sin navegar accidentalmente`);
await p.locator('[data-module=lab]').tap();await p.locator('.lab-page[data-lab-ready=true]').waitFor();pass(`${name}: toque en tarjeta central abre Laboratorio`);
await home(p);
if(name==='chromium'){
 const d=await c.newCDPSession(p);
 const swipe=async(from,to)=>{await d.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from,y}]});for(let step=1;step<=8;step++){await d.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from+(to-from)*step/8,y}]});await p.waitForTimeout(30)}await d.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(500)};
 await swipe(235,115);assert.equal(await selected(p),'lab');assert.equal(new URL(p.url()).pathname,'/');await swipe(150,265);assert.equal(await selected(p),'study');assert.equal(new URL(p.url()).pathname,'/');pass('Chromium: deslizamientos táctiles en ambas direcciones conservan Home');
 await p.locator('[data-module=lab]').tap();assert.equal(await selected(p),'lab');assert.equal(new URL(p.url()).pathname,'/');await p.screenshot({path:'qa/home-approved/mobile-card-selection.png',fullPage:true});
 await p.locator('[data-module=lab]').tap();await p.locator('.lab-page[data-lab-ready=true]').waitFor();pass('Chromium: después de deslizar, el primer toque lateral selecciona y el segundo entra');
}
await home(p);await p.getByRole('button',{name:'Mostrar Comunidad',exact:true}).tap();assert.equal(await selected(p),'community');await p.locator('[data-module=community]').tap();await p.locator('.community-main').waitFor();pass(`${name}: indicadores y acceso a Comunidad conservados`);
await c.close();const dc=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});await dc.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const desktop=await dc.newPage();await home(desktop);await desktop.locator('[data-module=lab]').click();await desktop.locator('.lab-page[data-lab-ready=true]').waitFor();pass(`${name}: escritorio conserva apertura directa con un clic`);await dc.close();}finally{await b.close()}}assert.deepEqual(report.errors,[]);fs.writeFileSync('qa/home-approved/card-gestures.json',JSON.stringify(report,null,2));})().catch(e=>{console.error(e);fs.writeFileSync('qa/home-approved/card-gestures.json',JSON.stringify({...report,error:String(e)},null,2));process.exitCode=1});
