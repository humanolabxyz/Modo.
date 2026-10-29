const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4327').replace(/\/$/,''),out='qa/activity-precision';
(async()=>{const b=await chromium.launch();try{
 const c=await b.newContext({viewport:{width:820,height:1180},hasTouch:true,serviceWorkers:'block'});
 await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');localStorage.setItem('modo-meter-activity2-v1',JSON.stringify({version:1,profile:'matias',index:22,records:[{id:'thermal',text:'0,4 Ω',observed:'0,4',value:.4,at:new Date().toISOString()}],reflection:'',complete:false}));});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/?view=simulator&activity=maquinas-u2');const lesson=p.locator('.panel-meter-lesson-window');await lesson.getByRole('button',{name:'Continuar · paso 23',exact:true}).click();await lesson.locator('[data-activity-step="change-delta"]').waitFor();
 async function controls(){await p.waitForTimeout(100);const t=lesson.getByRole('button',{name:'Controles',exact:true});if(await t.count())await t.click();}
 async function change(prefix){await controls();await lesson.locator('.meter-lesson-controls').getByRole('button',{name:new RegExp('^'+prefix)}).click();}
 async function pulse(id){await controls();await lesson.getByRole('button',{name:new RegExp('^'+id+' ·')}).focus();await p.keyboard.down('Space');await p.waitForTimeout(100);await p.keyboard.up('Space');}
 await change('Conectar corriente');await change('CONTROL 1');await change('CONTROL 2');await change('FUERZA');await lesson.getByLabel('Retardo de Matías',{exact:true}).selectOption('2');
 await lesson.getByRole('button',{name:'Comprobar y seguir',exact:true}).click();assert.equal(await lesson.locator('[data-activity-step]').getAttribute('data-activity-step'),'change-delta');
 await pulse('S1');await lesson.locator('.meter-lesson-state.is-ready').waitFor();assert.match(await lesson.locator('.meter-lesson-state.is-ready').innerText(),/estrella → triángulo/);
 await lesson.getByRole('button',{name:'Comprobar y seguir',exact:true}).click();await lesson.locator('[data-activity-step="delta-U"]').waitFor();const record=await p.evaluate(()=>JSON.parse(localStorage.getItem('modo-meter-activity2-v1')).records.find(r=>r.id==='change-delta'));
 assert.equal(record.action.kind,'timer');assert.equal(record.action.control,'TEMPORIZADOR_1');assert.equal(record.action.from,'estrella');assert.equal(record.action.to,'triángulo');assert.ok(record.action.seconds>=2);assert.deepEqual(errors,[]);
 await p.screenshot({path:out+'/temporizador-tablet.png'});fs.writeFileSync(out+'/timer-ui.json',JSON.stringify({base,record,errors},null,2));console.log('Transición real del temporizador comprobada y persistida en tablet vertical, sin saltar desde reposo.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
