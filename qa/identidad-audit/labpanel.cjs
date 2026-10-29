const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const check=require('./check.cjs');const base=process.env.B||'http://127.0.0.1:4455';const only=process.env.ONLY;
const report=async(k,list)=>{console.log('\n##',k,list.length,'fallos');const m=new Map();list.forEach(i=>{const key=i.cls+'|'+i.color;if(!m.has(key))m.set(key,i)});[...m.values()].slice(0,14).forEach(i=>console.log(` ${i.ratio}<${i.need} ${i.size}px "${i.txt}" .${i.cls} ${i.color}${i.unknown?' (gradiente)':''}`))};
(async()=>{
 const b=await chromium.launch();
 for(const [name,w,h] of [['d',1440,900],['m',390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});
  await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});
  const p=await c.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,160)));
  if(!only||only==='lab'){
   await p.goto(base+'/laboratorio/');await p.waitForTimeout(3500);
   const tabs=name==='d'?['Esquemas','Equipos eléctricos','PLC','HMI','Procesos','Protoboard','Soldadura','Temperatura','Detectores','GeoGebra']:['Esquemas'];
   for(const t of tabs){
    await p.getByRole('button',{name:new RegExp('^'+t)}).first().click({timeout:3000}).catch(()=>console.log('sin pestaña',t));await p.waitForTimeout(1800);
    await p.screenshot({path:`qa/identidad-audit/lab-${t.replace(/\W/g,'')}-${name}.png`});
    await report('lab-'+t+'-'+name,await p.evaluate(check));
   }
  }
  if(!only||only==='panel'){
   await p.goto(base+'/',{waitUntil:'load'});await p.waitForTimeout(2500);
   const card=p.locator('button.home-module').first();
   await card.click({force:true}).catch(()=>{});await p.waitForTimeout(500);await card.click({force:true}).catch(()=>{});await p.waitForTimeout(3000);
   await p.screenshot({path:`qa/identidad-audit/panel-banco-${name}.png`});
   await report('panel-banco-'+name,await p.evaluate(check));
   await p.getByRole('button',{name:/Abrir diagrama|Diagrama/}).first().click({timeout:3000}).catch(()=>console.log('sin diagrama'));await p.waitForTimeout(2000);
   await p.screenshot({path:`qa/identidad-audit/panel-diagrama-${name}.png`});
   await report('panel-diagrama-'+name,await p.evaluate(check));
   await p.getByText(/Opciones de práctica/).first().click({timeout:3000}).catch(()=>{});await p.waitForTimeout(800);
   await p.screenshot({path:`qa/identidad-audit/panel-opciones-${name}.png`});
   await report('panel-opciones-'+name,await p.evaluate(check));
  }
  await c.close();
 }
 await b.close();
})();
