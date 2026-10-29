const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4336/',out='qa/multimeter-activity',report={checks:[],errors:[]};
let current;
(async()=>{const m=await import('./multimeter-activity/model.mjs');
 for(const [engine,width,profile,full] of [[chromium,1440,'manual',true],[chromium,1440,'matias',true],[chromium,390,'manual',true],[webkit,390,'manual',false]]){
  const b=await engine.launch();try{const c=await b.newContext({viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390,serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
   const old={...m.emptyPractice(),wires:[{id:'old-cable',from:{terminalId:'BORNERA_MOTOR:W2'},to:{terminalId:'BORNERA_MOTOR:U2'},color:'#145650',layer:1}]};
   await c.addInitScript(d=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!sessionStorage.getItem('seeded')){localStorage.setItem('panellab-practice-v2',JSON.stringify(d));sessionStorage.setItem('seeded','yes')}},old);
   const p=await c.newPage();current=p;p.setDefaultTimeout(15000);p.on('pageerror',e=>report.errors.push(e.message));
   await p.goto(base+'?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash'));
   await p.getByRole('button',{name:'Multímetro del panel',exact:true}).click();await p.getByRole('button',{name:'Lección · medir con el multímetro',exact:true}).click();
   const lesson=p.locator('.panel-meter-lesson'),dialog=p.getByRole('dialog',{name:'Medir · Actividad 2',exact:true});
   if(profile==='matias'){await lesson.getByText('Referencia opcional de Matías',{exact:true}).click();await lesson.getByLabel('Montaje de la actividad',{exact:true}).selectOption(profile)}await lesson.getByRole('button',{name:profile==='manual'?'Comenzar guía del profesor':'Preparar variante de Matías',exact:true}).click();await lesson.waitFor();
   const dismiss=p.getByRole('button',{name:'Cerrar aviso',exact:true});if(await dismiss.count())await dismiss.first().click();
   assert.equal(await p.locator('.interactive-wire').count(),profile==='manual'?46:45);assert.equal(await p.locator('.floating-power').count(),0);
   const progress=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('modo-meter-activity2-v1')));
   await lesson.getByLabel('Lectura observada',{exact:true}).fill('0,4');await lesson.getByRole('button',{name:'Comprobar y registrar',exact:true}).click();assert.equal((await progress()).index,0,'Función OFF y puntas sin poner no completan el paso');
   const handles=[p.getByRole('button',{name:'Punta roja: arrastra hasta un borne',exact:true}),p.getByRole('button',{name:'Punta negra: arrastra hasta un borne',exact:true})];
   const probe=async(which,id)=>{if(await handles[which].getAttribute('data-probe-connected')===id)return;await handles[which].focus();for(let guard=0;guard<150;guard++){if(await handles[which].getAttribute('data-probe-connected')===id)return;await p.keyboard.press('ArrowRight')}throw Error('No se pudo colocar punta en '+id)};
   const power=async()=>{const d=lesson.locator('.meter-lesson-energy');if(await d.getAttribute('open')===null)await d.locator('summary').click();return d};
   const change=async prefix=>{const d=await power();await d.getByRole('button',{name:new RegExp('^'+prefix)}).click()};
   const pulse=async(id)=>{const d=await power(),button=d.getByRole('button',{name:new RegExp('^'+id+' ·')});await button.focus();await p.keyboard.down('Space');await p.waitForTimeout(150);await p.keyboard.up('Space')};
   const parse=text=>text.trim()==='OL'?'OL':text.match(/-?\d+(?:[.,]\d+)?/)?.[0];
   for(const [index,raw] of m.ACTIVITY_STEPS.entries()){const s=m.activityStep(profile,index);
    if(!full&&index>=12)break;
    await p.waitForFunction(id=>document.querySelector('.panel-meter-lesson')?.dataset.activityStep===id,s.id);
    if(s.stage==='control'){
     await change('Enchufar corriente virtual');await change('CONTROL 1');await change('CONTROL 2');
    }
    if(s.id==='force-continuity'){await change('CONTROL 1');await change('CONTROL 2');await change('Desenchufar corriente virtual')}
    if(s.id==='line-RS'){await change('Enchufar corriente virtual');await change('FUERZA')}
    if(s.id==='powered-rest'){await change('CONTROL 1');await change('CONTROL 2')}
    if(s.id==='control-star')await pulse('S1');
    if(s.id==='control-delta'){if(profile==='manual')await pulse('S3');else{const d=await power();await d.getByLabel('Retardo de Matías',{exact:true}).selectOption('2')}}
    if(s.id==='control-trip')await change('TEST');
    if(s.id==='control-reset')await change('RESET');
    if(s.id==='start-star')await pulse('S1');
    if(s.id==='change-delta'){
     if(profile==='manual')await pulse('S3');else{const d=await power();await d.getByLabel('Retardo de Matías',{exact:true}).selectOption('2')}
    }
    if(s.id==='overload')await change('TEST');
    if(s.id==='reset')await change('RESET');
    if(s.id==='shutdown'){await change('FUERZA');await change('CONTROL 1');await change('CONTROL 2');await change('Desenchufar corriente virtual')}
    if(s.kind==='meter'){
     const name=s.mode==='C'?'Continuidad':s.mode==='R'?'Resistencia':'Tensión alterna de mando y fuerza';await p.getByRole('radio',{name,exact:true}).click();
     await lesson.getByRole('button',{name:'Dónde poner las puntas',exact:true}).click();
     await probe(0,s.red);await probe(1,s.black);
     await lesson.locator('.meter-lesson-state.is-ready').waitFor();
     const read=p.getByLabel('Lectura del multímetro',{exact:true}),text=await read.innerText();
     await lesson.getByLabel('Lectura observada',{exact:true}).fill(parse(text));
     if(s.id==='thermal'){
      await p.screenshot({path:`${out}/${engine.name()}-${width}-${profile}-probes.png`});
      const frame=await dialog.boundingBox(),meter=await p.locator('.lab-dmm-body').boundingBox();if(width===390)assert.ok(frame.y+frame.height<meter.y+80,'La guía deja visible el cuerpo del instrumento');
      await p.getByRole('button',{name:'Ocultar lección del multímetro',exact:true}).click();assert.equal(await handles[0].getAttribute('data-probe-connected'),s.red);
      await p.getByRole('button',{name:'Lección · medir con el multímetro',exact:true}).click();assert.equal(await lesson.getAttribute('data-activity-step'),'thermal','Ocultar y reabrir conserva el paso y las puntas');
     }
    }
    if(s.kind==='clamp'){
     const wrong=s.phase==='R'?'S':'R';await lesson.getByRole('button',{name:'Pinza en '+wrong,exact:true}).click();assert.equal(await lesson.locator('.meter-lesson-state.is-ready').count(),0);
     await lesson.getByRole('button',{name:'Pinza en '+s.phase,exact:true}).click();await lesson.locator('.meter-lesson-state.is-ready').waitFor();const text=await lesson.getByLabel('Lectura de la pinza virtual',{exact:true}).innerText();await lesson.getByLabel('Lectura observada',{exact:true}).fill(parse(text));
     if(s.phase==='R')await p.screenshot({path:`${out}/${engine.name()}-${width}-${profile}-${s.stage}-clamp.png`});
    }
    if(s.kind==='compare'){await lesson.getByLabel('Comparación estrella y triángulo',{exact:true}).fill('En estrella cada bobina recibe VL dividido por raíz de tres, cerca de 219 V. En triángulo recibe 380 V; con estas resistencias equivalentes la corriente de línea se triplica.');}
    await lesson.locator('.meter-lesson-state.is-ready').waitFor();
    const name=s.kind==='meter'||s.kind==='clamp'?'Comprobar y registrar':s.id==='shutdown'?'Terminar práctica':'Comprobar y continuar';await lesson.getByRole('button',{name,exact:true}).click();
   }
   const saved=await progress();assert.equal(saved.index,full?m.ACTIVITY_STEPS.length-1:12);
   if(full){assert.equal(saved.complete,true);assert.equal(saved.records.length,m.ACTIVITY_STEPS.length);assert.equal(saved.records.filter(r=>m.ACTIVITY_STEPS.find(s=>s.id===r.id)?.table).length,15);await p.screenshot({path:`${out}/${engine.name()}-${width}-${profile}-complete.png`});
    const dl=p.waitForEvent('download');await lesson.getByRole('button',{name:'Descargar informe JSON',exact:true}).first().click();const download=await dl;const path=await download.path(),downloaded=JSON.parse(fs.readFileSync(path,'utf8'));assert.equal(downloaded.complete,true);assert.equal(downloaded.measurements.length,m.ACTIVITY_STEPS.length);
    await p.getByRole('button',{name:'Deshacer',exact:true}).click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')).wires.length===1);assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')).wires),old.wires,'Deshacer recupera el cable previo');
   }
   await p.reload();await p.locator('.board-svg').waitFor();assert.deepEqual(await progress(),saved,'El cuaderno persiste tras recargar');
   report.checks.push({engine:engine.name(),width,profile,steps:full?m.ACTIVITY_STEPS.length:12,records:saved.records.length});await c.close();
  }finally{await b.close()}
 }
 assert.deepEqual(report.errors,[]);fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(async e=>{if(current&&!current.isClosed())await current.screenshot({path:out+'/failure.png'}).catch(()=>{});fs.writeFileSync(out+'/ui-results.json',JSON.stringify({...report,failure:e.stack},null,2));console.error(e);process.exit(1)});
