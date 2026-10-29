// Capturas ampliadas (x2) del tablero en marcha. Uso: node qa/cabinet-fx/crops.cjs <prefijo>
const fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4326',tag=process.argv[2]||'after',out='qa/cabinet-fx',fixture=JSON.parse(fs.readFileSync('qa/cabinet/project-from-ui.modo.json','utf8'));
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:2});
 await context.addInitScript(({project})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-laboratory-v1'))localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[project],active:project.id}));},{project:fixture});
 const p=await context.newPage();await p.goto(base+'/laboratorio?tool=equipment');await p.locator('.industrial-equipment').first().waitFor();await p.waitForTimeout(1500);
 const close=p.getByRole('button',{name:/^Cerrar/});if(await close.count())await close.first().click().catch(()=>{});await p.waitForTimeout(300);
 const view=name=>p.locator('.cab-stage-actions').getByRole('button',{name,exact:true}).click();
 await view('Placa');await p.waitForTimeout(700);await p.screenshot({path:`${out}/${tag}-crop-placa-reposo.png`});
 await p.getByRole('button',{name:'Accionar tablero',exact:true}).click();await p.waitForTimeout(400);
 await view('Puerta');await p.waitForTimeout(500);
 await p.getByRole('button',{name:'Marcha S1',exact:true}).click();await p.waitForTimeout(1800);
 await p.screenshot({path:`${out}/${tag}-crop-puerta.png`});
 await view('Placa');await p.waitForTimeout(900);await p.screenshot({path:`${out}/${tag}-crop-placa.png`});
 await view('Campo');await p.waitForTimeout(900);await p.screenshot({path:`${out}/${tag}-crop-campo.png`});
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
