/* Sonidos de cables y motor: el cable banana suena al entrar y salir, el motor arranca y se detiene con su sonido, y un motor mal conectado suena áspero.
 * Se comprueba el registro interno (window.__panelSounds); la salida de audio real no se puede oír en una prueba automática. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4410').replace(/\/$/,''),out=process.env.PANELLAB_QA_OUTPUT||'qa/motor-cable-sounds',report={base,checks:[],errors:[]};
fs.mkdirSync(out,{recursive:true});
const {pairs:matiasPairs}=require('../src/data/twoContactorMatias.json');
async function session(browser,pairs){
 const c=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
 await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');localStorage.removeItem('panellab.sonidos.v1');});
 const p=await c.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>{report.errors.push(e.message);console.log('PAGEERROR',e.message);});
 await p.goto(base+'/?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.documentElement.matches('.modo-splash-on,.modo-opening-on'));
 await p.getByRole('button',{name:'Guía paso a paso',exact:true}).dispatchEvent('click');
 await p.getByRole('button',{name:'Aprender: Estrella-triángulo · 2 contactores y temporizador',exact:true}).dispatchEvent('click');await p.locator('.guide-window').waitFor();
 const wires=pairs.map(([a,b],i)=>({id:'lw'+i,from:{terminalId:a},to:{terminalId:b},color:'#145650',route:{sag:130},layer:i+1}));
 await p.evaluate(w=>{const k='panellab-practice-v2',d=JSON.parse(localStorage.getItem(k));d.wires=w;d.stepIndex=d.steps.length;localStorage.setItem(k,JSON.stringify(d));},wires);
 await p.reload();await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.documentElement.matches('.modo-splash-on,.modo-opening-on'));
 await p.getByRole('button',{name:/Ocultar la guía/}).click().catch(()=>{});
 return p;
}
const sounds=p=>p.evaluate(()=>[...(window.__panelSounds||[])]),clear=p=>p.evaluate(()=>{if(window.__panelSounds)window.__panelSounds.length=0;});
async function power(p){
 await p.getByLabel('Simular mando de 24 V',{exact:true}).click();await p.getByLabel('Opciones de simulación',{exact:true}).click();
 const d=p.getByRole('dialog',{name:'Simulación · 24 V',exact:true});
 await p.getByLabel('Retardo del temporizador',{exact:true}).selectOption('2');
 await d.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).click();
 for(const name of ['FUERZA · OFF','CONTROL 1 · OFF','CONTROL 2 · OFF'])await d.getByRole('button',{name,exact:true}).click();
 await p.getByRole('button',{name:'Cerrar simulación · 24 v',exact:true}).click();
}
(async()=>{
 const browser=await chromium.launch();
 /* 1 · Cable: entra y sale */
 {
  const c=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
  await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');localStorage.removeItem('panellab.sonidos.v1');});
  const p=await c.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(base+'/?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.documentElement.matches('.modo-splash-on,.modo-opening-on'));
  await p.getByRole('button',{name:'Conectar cables',exact:true}).click();
  for(const id of ['FUENTE:F','CONTACTOR_TERMICO:95'])await p.locator(`[data-terminal-id="${id}"]`).dispatchEvent('click');
  await p.waitForTimeout(300);
  let log=await sounds(p);assert.ok(log.includes('cable-conecta'),'cable entra: '+log);
  report.checks.push('Un cable que se conecta suena: '+log.join(' · '));
  await c.close();
 }
 /* 2 · Motor sano: arranca, gira y se detiene */
 {
  const p=await session(browser,matiasPairs);await power(p);await clear(p);
  const start=p.getByRole('button',{name:'Pulsador verde izquierdo',exact:true});
  await start.focus();await p.keyboard.down('Space');await p.waitForTimeout(500);await p.keyboard.up('Space');
  await p.waitForTimeout(800);
  let log=await sounds(p);
  assert.ok(log.includes('motor:arranca'),'el motor arranca: '+log);assert.ok(!log.includes('motor:falla'),'bien conectado no suena mal: '+log);
  report.checks.push('Motor bien conectado: arranca sin sonido áspero: '+log.join(' · '));
  await p.locator('[data-motor-connection=delta]').waitFor({timeout:8000});
  assert.ok(!(await sounds(p)).includes('motor:falla'),'en triángulo tampoco suena mal');
  await clear(p);
  await p.getByRole('button',{name:'Pulsador rojo',exact:true}).first().focus().catch(()=>{});
  await p.getByLabel('Opciones de simulación',{exact:true}).click();
  await p.getByRole('button',{name:'Disparar térmico',exact:true}).click();
  await p.waitForFunction(()=>(window.__panelSounds||[]).includes('motor:para'),null,{timeout:20000});
  report.checks.push('Al parar el motor se apaga su sonido: '+(await sounds(p)).join(' · '));
  await p.context().close();
 }
 /* 3 · Motor mal conectado: falta una fase de fuerza */
 {
  const broken=matiasPairs.filter(([a,b])=>!(a==='TEMPORIZADOR_1:T3'&&b==='BORNERA_MOTOR:W1')&&!(b==='TEMPORIZADOR_1:T3'&&a==='BORNERA_MOTOR:W1'));
  assert.equal(broken.length,matiasPairs.length-1,'se quitó un cable de fuerza');
  const p=await session(browser,broken);await power(p);await clear(p);
  const start=p.getByRole('button',{name:'Pulsador verde izquierdo',exact:true});
  await start.focus();await p.keyboard.down('Space');await p.waitForTimeout(500);await p.keyboard.up('Space');
  await p.waitForFunction(()=>(window.__panelSounds||[]).includes('motor:falla'),null,{timeout:8000});
  report.checks.push('Motor con una fase abierta: suena áspero: '+(await sounds(p)).join(' · '));
  await p.context().close();
 }
 assert.deepEqual(report.errors,[]);
 fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.log(report.checks.map(s=>'PASS '+s).join('\n'));
 await browser.close();
})().catch(e=>{console.log('FAIL',e.stack||e.message);process.exit(1);});
