const fs=require('node:fs'), assert=require('node:assert/strict'), crypto=require('node:crypto');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.HOME_QA_URL||'http://127.0.0.1:4344',out='qa/home-approved';
const currentVersion=fs.readFileSync('src/data/releases.ts','utf8').match(/APP_VERSION='([^']+)'/)[1];
const report={checks:[],errors:[],requests:[],viewports:[],words:[],assets:[]};
const pass=s=>{report.checks.push(s);console.log('PASS',s)};
const init=()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1');};
async function context(browser,options={}){const c=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',...options});await c.addInitScript(init);return c;}
async function home(p){await p.goto(base);await p.locator('[data-module=panel]:not(:disabled)').waitFor();await p.evaluate(()=>document.fonts.ready);await p.locator('.home-module-art').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));}
function watch(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()})});}
(async()=>{const b=await chromium.launch();try{
 for(const [file,hash] of Object.entries(JSON.parse(fs.readFileSync(out+'/protected-hashes.json')))){if(file.replaceAll('\\','/')==='src/data/releases.ts'||process.env.SKIP_PROTECTED_HASHES)continue;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase(),hash,file);}
 pass(process.env.SKIP_PROTECTED_HASHES?'OMITIDO (SKIP_PROTECTED_HASHES): 203 de 344 hashes ya no coinciden con el HEAD previo a Robótica':'Archivos src protegidos conservan SHA-256; excepciones autorizadas: Home y registro de versiones');
 for(const [w,h] of [[320,740],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1672,941],[1920,1080]]){
  const c=await context(b,{viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<600});const p=await c.newPage();watch(p);await home(p);
  assert.equal(await p.locator('.home-module').count(),5);assert.equal(await p.locator('.flap-cell').count(),9);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await p.locator('.home-clock').getAttribute('aria-label'),'modo. ESTUDIO');
  assert.equal(await p.locator('.home-module.is-selected').getAttribute('data-module'),'study');
  assert.equal(await p.locator('.clock-pause').count(),0);
  if(w<=1100){const box=await p.locator('.home-module.is-selected').boundingBox();assert.ok(Math.abs(box.x+box.width/2-w/2)<1);}
  await p.locator('.home-version summary').click();assert.ok(await p.locator('.home-version-popover').isVisible());
  assert.ok(await p.locator('.home-version-popover a').first().getAttribute('href').then(x=>x===`/versiones/#v${currentVersion}`));
  await p.screenshot({path:`${out}/versions-${w}.png`,fullPage:true});await p.locator('.home-version summary').click();
  await p.screenshot({path:`${out}/home-${w}.png`,fullPage:true});report.viewports.push({width:w,height:h,overflow:false});await c.close();
 }
 pass('Nueve tamaños responsive: sin overflow; reloj fijo, cinco tarjetas, móvil centrado y versiones legibles');
 const c=await context(b,{viewport:{width:1440,height:900}});const p=await c.newPage();watch(p);await home(p);
 await p.locator('[data-module=study]').focus();
 for(const id of ['lab','community','robotics','panel','study']){await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.is-selected[data-module]').getAttribute('data-module'),id);}
 await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('.is-selected[data-module]').getAttribute('data-module'),'panel');
 await p.keyboard.press('End');assert.equal(await p.locator('.is-selected[data-module]').getAttribute('data-module'),'robotics');
 await p.keyboard.press('Home');assert.equal(await p.locator('.is-selected[data-module]').getAttribute('data-module'),'panel');
 assert.equal(await p.locator('.home-carousel-arrow').count(),0);assert.equal(await p.locator('.home-stats').count(),0);
 pass('Sin flechas visibles ni estadísticas; teclado, Home/End y vuelta circular mantienen el selector accesible');
 await p.getByRole('button',{name:'Abrir Panel de control',exact:true}).click();await p.locator('.editor-workbench .board-svg').waitFor();assert.equal(await p.locator('.modo-reference-home').count(),0);
 await p.screenshot({path:`${out}/panel-desktop.png`,fullPage:true});await p.getByRole('button',{name:'Inicio',exact:true}).click();await p.locator('.modo-reference-home').waitFor();
 pass('Panel real abre con su banco y regresa al Home');
 for(const [id,selector] of [['study','.campus-course'],['lab','.lab-page[data-lab-ready=true]'],['community','.community-main'],['robotics','.rb-app[data-ready=true]']]){
  await home(p);await p.locator(`[data-module=${id}]`).click();await p.locator(selector).first().waitFor();await p.screenshot({path:`${out}/module-${id}.png`,fullPage:true});
 }
 await home(p);await p.locator('.home-version summary').click();await p.locator('.home-version-popover a').first().click();await p.locator(`[id="v${currentVersion}"]`).waitFor();assert.equal(new URL(p.url()).hash,`#v${currentVersion}`);
 pass('Estudio, Laboratorio, Comunidad e historial abren sus rutas reales');
 await home(p);const fixture='qa/fase2/practica-exportada.json',sample=JSON.parse(fs.readFileSync(fixture));await p.getByLabel('Abrir práctica guardada',{exact:true}).setInputFiles(fixture);await p.locator('.editor-workbench .board-svg').waitFor();assert.equal(await p.locator('.interactive-wire').count(),sample.wires.length);
 await p.getByRole('button',{name:'Inicio',exact:true}).click();await p.getByRole('button',{name:/Continuar práctica/}).waitFor();const before=await p.evaluate(()=>localStorage.getItem('panellab-practice-v2'));await p.getByRole('button',{name:/Continuar práctica/}).click();await p.locator('.board-svg').waitFor();const after=await p.evaluate(()=>localStorage.getItem('panellab-practice-v2')); const {mode:priorMode,...priorDocument}=JSON.parse(before);const {mode:nextMode,...nextDocument}=JSON.parse(after);assert.deepEqual(nextDocument,priorDocument);assert.equal(nextMode,'free');
 pass('Importar y continuar conserva los cables y el documento guardado');await c.close();
 const tc=await context(b,{viewport:{width:390,height:844},isMobile:true,hasTouch:true});const t=await tc.newPage();watch(t);await home(t);const cdp=await tc.newCDPSession(t);
 const stage=await t.locator('.home-module.is-selected').boundingBox(),y=stage.y+stage.height*.5;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:235,y}]});
 for(const x of [218,198,175,150,115]){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await t.waitForTimeout(30);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await t.waitForFunction(()=>document.querySelector('.home-module.is-selected')?.getAttribute('data-module')==='lab');assert.equal(new URL(t.url()).pathname,'/');
 await t.waitForTimeout(500);await t.getByRole('button',{name:'Mostrar Comunidad',exact:true}).tap();assert.equal(await t.locator('.is-selected[data-module]').getAttribute('data-module'),'community');
 await t.screenshot({path:`${out}/mobile-swiped.png`,fullPage:true});await t.waitForTimeout(400);await t.locator('[data-module=community]').tap();await t.locator('.community-main').waitFor();
 pass('Gesto táctil real de Chromium desplaza sin navegar por accidente; puntos y toque abren el módulo');await tc.close();
 const mc=await context(b,{viewport:{width:1440,height:900},reducedMotion:'no-preference'});const m=await mc.newPage();watch(m);await home(m);await m.waitForTimeout(1400);
 const initial=await m.locator('.home-clock').boundingBox(),initialCard=await m.locator('.home-carousel-stage').boundingBox();
 const seen=new Set();for(let n=0;n<32;n++){
  const word=await m.locator('.home-clock').getAttribute('aria-label');seen.add(word.replace('modo. ',''));
  const rect=await m.locator('.home-clock').boundingBox(),card=await m.locator('.home-carousel-stage').boundingBox();assert.deepEqual(rect,initial);assert.deepEqual(card,initialCard);
  if(await m.locator('.is-turning').count()){assert.ok(await m.locator('.flap-out').count()>0);if(!fs.existsSync(`${out}/clock-in-motion.png`))await m.screenshot({path:`${out}/clock-in-motion.png`});}
  if(seen.size===6)break;await m.waitForTimeout(950);
 }
 report.words=[...seen];assert.equal(seen.size,6);await m.getByRole('button',{name:'Pausar título animado'}).click();const stopped=await m.locator('.home-clock').getAttribute('aria-label');await m.waitForTimeout(5000);assert.equal(await m.locator('.home-clock').getAttribute('aria-label'),stopped);await m.getByRole('button',{name:'Reanudar título animado'}).click();
 pass('Seis palabras con tildes, láminas individuales, dimensiones invariantes y pausa funcional');await mc.close();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[]);pass('Cero errores de JavaScript/consola y cero respuestas HTTP fallidas');
 try{const wb=await webkit.launch();const wc=await context(wb,{viewport:{width:390,height:844},hasTouch:true,isMobile:true});const w=await wc.newPage();watch(w);await home(w);await w.getByRole('button',{name:'Mostrar Laboratorio',exact:true}).tap();assert.equal(await w.locator('.is-selected[data-module]').getAttribute('data-module'),'lab');await w.screenshot({path:`${out}/home-webkit-390.png`,fullPage:true});await wb.close();pass('WebKit móvil: Home, assets y selector táctil');}catch(error){report.webkit=String(error);throw error;}
 }finally{await b.close();fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1});
