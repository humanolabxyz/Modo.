const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {emptyPractice,SIMULATION_EXAMPLES}=require('./cable-performance/fixtures.cjs');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327').replace(/\/$/,''),out=process.env.PANELLAB_QA_OUTPUT||'qa/cable-reset-tablet';fs.mkdirSync(out,{recursive:true});
const baseline=process.argv.includes('--baseline');
(async()=>{const results=[];for(const engine of baseline?[chromium]:[chromium,webkit]){
 const browser=await engine.launch();try{for(const viewport of baseline?[{width:820,height:1180}]:[{width:390,height:844},{width:820,height:1180},{width:1440,height:1000}].filter(v=>!process.argv.includes('--phone-only')||v.width===390)){
 const context=await browser.newContext({viewport,hasTouch:true,serviceWorkers:'block'});
 await context.addInitScript(doc=>{if(!localStorage.getItem('panellab-practice-v2')){localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');localStorage.setItem('panellab-practice-v2',JSON.stringify(doc));}},{...emptyPractice(),wires:SIMULATION_EXAMPLES.starDelta.pairs.map(([from,to],i)=>({id:`tablet-${i}`,from:{terminalId:from},to:{terminalId:to},color:'#145650',layer:i}))});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?view=simulator');await page.locator('.board-svg').waitFor();await page.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));await page.waitForTimeout(2200);
 const count=await page.locator('.interactive-wire').count();assert.equal(count,35);
 const before=await page.evaluate(()=>Number(document.documentElement.dataset.appRenders));await page.waitForTimeout(2000);
 const idleRenders=await page.evaluate(n=>Number(document.documentElement.dataset.appRenders)-n,before);
 if(!baseline){
 if(!process.env.PANELLAB_URL)assert.ok(idleRenders<=2,`unplugged idle: ${idleRenders} renders`);
 const eraser=page.getByRole('button',{name:'Retirar cables',exact:true});
 await eraser.click();assert.equal(await page.locator('.interactive-wire').count(),35,'Pulsar la goma conserva los cables hasta elegir uno');
 await page.locator('.interactive-wire').first().press('Enter');await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===34);
 await page.getByRole('button',{name:'Deshacer',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===35);
 await page.getByRole('button',{name:'Seleccionar',exact:true}).click();
 const box=await eraser.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
 if(engine===chromium){const cd=await context.newCDPSession(page);await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let j=1;j<=8;j++)await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-j*7}]});await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y-56,{steps:8});await page.mouse.up();}
 const trash=page.getByRole('button',{name:'Borrar todos los cables',exact:true});await trash.waitFor();await page.waitForTimeout(220);const top=await trash.boundingBox();assert.ok(top.y+top.height<box.y,'El basurero es un botón aparte encima de la goma');assert.ok(Math.abs(top.x+top.width/2-x)<2,'Basurero alineado con la goma');assert.equal(await eraser.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.interactive-wire').count(),35,'Deslizar solo revela el basurero');
 const hint=await page.locator('.connection-message.context-hint').boundingBox();if(hint)assert.ok(hint.y+hint.height<=top.y||hint.y>=top.y+top.height||hint.x+hint.width<=top.x||hint.x>=top.x+top.width,'La ayuda no tapa el basurero');
 await page.screenshot({path:`${out}/${engine.name()}-${viewport.width}-swipe-trash.png`});await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Conectar cables',exact:true}).click();await page.locator('[data-terminal-id="FUENTE:F"]').press('Enter');
 await page.getByRole('button',{name:'Retirar cables',exact:true}).click();await page.screenshot({path:`${out}/${engine.name()}-${viewport.width}-eraser.png`});await page.getByRole('button',{name:'Borrar todos los cables',exact:true}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===0);
 assert.equal(await page.locator('.pending-cable-preview').count(),0);
 await page.getByRole('button',{name:'Retirar cables',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Borrar todos los cables',exact:true}).isDisabled(),true);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Deshacer',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===35);
 await page.getByRole('button',{name:'Rehacer',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===0);
 await page.reload();await page.locator('.board-svg').waitFor();await page.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));assert.equal(await page.locator('.interactive-wire').count(),0);
 await page.screenshot({path:`${out}/${engine.name()}-${viewport.width}-after.png`});
 }else await page.screenshot({path:`${out}/tablet-before.png`});
 assert.deepEqual(errors,[]);results.push({engine:engine.name(),width:viewport.width,idleRenders,count});await context.close();
 }}finally{await browser.close();}}fs.writeFileSync(`${out}/${baseline?'before':'after'}.json`,JSON.stringify(results,null,2));console.log(results);
})().catch(e=>{console.error(e);process.exitCode=1;});
