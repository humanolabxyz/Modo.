// Crea un tablero nuevo por la interfaz, coloca todos los equipos y captura la placa. Uso: node qa/cabinet-fx/compact.cjs <perfil> <prefijo>
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4411',profile=process.argv[2]||'Comenzar mando cableado',tag=process.argv[3]||'compact',out='qa/cabinet-fx';
(async()=>{const b=await chromium.launch(),c=await b.newContext({viewport:{width:1440,height:960},deviceScaleFactor:2});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(base+'/laboratorio?tool=equipment&start=taller');await p.getByRole('button',{name:'Voy a estudiar'}).click();await p.getByRole('button',{name:new RegExp(profile)}).click();await p.locator('.industrial-equipment').first().waitFor();await p.waitForTimeout(1200);
await p.getByRole('toolbar',{name:'Acciones principales del tablero'}).getByRole('button',{name:'Montar',exact:true}).click();await p.waitForTimeout(500);
const btns=p.locator('.cab-parts button');const n=await btns.count();console.log('botones de colocar',n);
for(let i=0;i<n;i++){const bt=btns.nth(i);if(await bt.isEnabled())await bt.click().catch(()=>{});await p.waitForTimeout(120);}
for(const box of await p.locator('.cab-fixtures input[type=checkbox]').all())await box.check().catch(()=>{});
await p.waitForTimeout(500);
const close=p.getByRole('button',{name:/^Cerrar/});if(await close.count())await close.first().click().catch(()=>{});
await p.locator('.cab-stage-actions').getByRole('button',{name:'Placa',exact:true}).click();await p.waitForTimeout(900);await p.screenshot({path:`${out}/${tag}-placa.png`});
console.log(JSON.stringify({errors}));await b.close();})().catch(e=>{console.error(e);process.exit(1);});
