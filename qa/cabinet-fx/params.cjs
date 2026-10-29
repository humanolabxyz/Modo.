const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4411',out='qa/cabinet-fx/devices';
(async()=>{const b=await chromium.launch();
for(const [name,w,h,touch] of [['desk',1440,1000,false],['tab',820,1180,true]]){
 const c=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,deviceScaleFactor:1.5});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 const p=await c.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(base+'/laboratorio?tool=equipment');await p.waitForTimeout(1200);
 await p.getByRole('button',{name:'Montajes y archivos'}).click();await p.getByText('Añadir ejemplo de arrancador suave').click();await p.waitForTimeout(700);
 await p.locator('[data-part-id]').nth(1).locator('.eq-part-hit').click({force:true});await p.waitForTimeout(700);
 const open=p.getByRole('button',{name:/Equipo y conexiones|Guía y propiedades/});if(await open.count()&&!(await p.locator('.eq-pf').count()))await open.first().click().catch(()=>{});
 await p.waitForTimeout(600);await p.screenshot({path:`${out}/params-${name}.png`});
 console.log(name,'eq-pf',await p.locator('.eq-pf').count(),JSON.stringify(errs));await c.close();}
await b.close();})();
