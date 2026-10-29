const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4344',out='qa/soft-ui-global/estados';fs.mkdirSync(out,{recursive:true});
const paint=locator=>locator.evaluate(n=>{const s=getComputedStyle(n);return {background:s.backgroundColor,image:s.backgroundImage,color:s.color,border:s.borderColor};});
const green=async locator=>{const s=await paint(locator),channels=s.background.match(/\d+/g)?.map(Number);assert.ok((channels&&channels[1]>channels[0]+15)||s.image.includes('37, 134, 96'),JSON.stringify(s));};
(async()=>{const b=await chromium.launch(),report={checks:[],errors:[]};try{
for(const width of [1440,390]){
 const c=await b.newContext({viewport:{width,height:960},reducedMotion:'reduce',serviceWorkers:'block'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+'/?view=simulator');await p.locator('.board-svg .terminal').first().waitFor();await p.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');
 const toggle=p.getByRole('button',{name:'Simular mando de 24 V',exact:true});const off=await paint(toggle);
 await toggle.click();assert.equal(await toggle.getAttribute('aria-pressed'),'true');await green(toggle);
 assert.equal(await toggle.locator('.is-powered').count(),0,'Enabled is not the same as powered');
 await p.getByLabel('Opciones de simulación',{exact:true}).click();
 const plug=p.locator('.simulation-menu-body').getByRole('button',{name:'Enchufar corriente virtual',exact:true});await plug.click();await green(p.locator('.simulation-plug-action'));
 for(const n of [1,2]){const control=p.getByRole('button',{name:`CONTROL ${n} · OFF`,exact:true});await control.click();await green(p.getByRole('button',{name:`CONTROL ${n} · ON`,exact:true}));}
 await p.waitForFunction(()=>document.querySelector('[data-source-powered]')?.dataset.sourcePowered==='true');assert.equal(await toggle.locator('.is-powered').count(),1);
 await p.screenshot({path:`${out}/panel-energizado-${width}.png`});
 await p.getByLabel('Opciones de simulación',{exact:true}).click();await toggle.click();await p.mouse.move(0,500);assert.deepEqual(await paint(toggle),off);assert.equal(await toggle.locator('.is-powered').count(),0);
 report.checks.push(`${width}: neutral off, green simulation, green plug/breakers, powered indicator follows supply, off restores neutral`);
 await p.goto(base+'/laboratorio?tool=plc');await p.locator('.lab-page[data-lab-ready="true"]').waitFor();await p.locator('.lab-loading').waitFor({state:'detached'});
 const run=p.locator('.lab-run,.lab-compact-run').first();const idle=await paint(run);await run.click();await p.locator('.lab-run.running,.lab-compact-run.running').waitFor();await green(run);
 // Desktop has the PLC variable inspector open; compact layouts open it on demand.
 if(width===1440){const bit=p.locator('.lab-bit:not(:disabled)').first();await bit.waitFor();const was=await bit.getAttribute('aria-pressed');await bit.click();await p.waitForFunction(({label,prior})=>document.querySelector(`[aria-label="${label}"]`)?.getAttribute('aria-pressed')!==prior,{label:await bit.getAttribute('aria-label'),prior:was});assert.notEqual(await bit.getAttribute('aria-pressed'),was);if(was==='false')await green(bit);}
 await p.screenshot({path:`${out}/plc-simulando-${width}.png`});await run.click();await p.mouse.move(0,500);assert.deepEqual(await paint(run),idle);report.checks.push(`${width}: laboratory RUN green, STOP restores black`);
 await c.close();
}
assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report,null,2));
}finally{await b.close();fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));}})().catch(e=>{console.error(e);process.exitCode=1;});
