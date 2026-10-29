// Capturas del PLC, el relé programable y la pantalla de programar. Uso: node qa/cabinet-fx/plc-shots.cjs <prefijo>
const fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4411',tag=process.argv[2]||'plc',out='qa/cabinet-fx';
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[];
 for(const name of ['plc','relay']){
  const project=JSON.parse(fs.readFileSync(`qa/cabinet/fixture-${name}.modo.json`,'utf8'));
  const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:2});
  await context.addInitScript(({project})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-laboratory-v1'))localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[project],active:project.id}));},{project});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(name+': '+m.text());});
  await p.goto(base+'/laboratorio?tool=equipment');await p.locator('.industrial-equipment').first().waitFor();await p.waitForTimeout(1200);
  const close=p.getByRole('button',{name:/^Cerrar/});if(await close.count())await close.first().click().catch(()=>{});await p.waitForTimeout(300);
  const view=n=>p.locator('.cab-stage-actions').getByRole('button',{name:n,exact:true}).click();
  await view('Placa');await p.waitForTimeout(700);
  await p.getByRole('button',{name:'Accionar tablero',exact:true}).click();await p.waitForTimeout(600);
  await view('Puerta');await p.waitForTimeout(400);await p.getByRole('button',{name:'Marcha S1',exact:true}).click();await p.waitForTimeout(1500);
  await view('Placa');await p.waitForTimeout(900);await p.screenshot({path:`${out}/${tag}-${name}-placa-marcha.png`});
  await p.getByRole('button',{name:'Programar',exact:true}).click();await p.waitForTimeout(900);await p.screenshot({path:`${out}/${tag}-${name}-ventana-programar.png`});
  await p.goto(base+'/laboratorio?tool=plc');await p.waitForTimeout(1500);await p.screenshot({path:`${out}/${tag}-${name}-editor-plc.png`});
  await context.close();
 }
 console.log(JSON.stringify({errors},null,1));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
