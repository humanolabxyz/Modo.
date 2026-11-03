const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4335/',out='qa/panel-fixes';fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[]};
(async()=>{for(const engine of [chromium,webkit]){const browser=await engine.launch();try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000},hasTouch:width===390,isMobile:width===390,serviceWorkers:'block',reducedMotion:'reduce'}),p=await context.newPage();p.setDefaultTimeout(15000);p.on('dialog',d=>d.accept());/* reemplazar cables existentes pide confirmación nativa */p.on('pageerror',e=>report.errors.push(e.message));
 await context.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));
 await p.goto(base+'?view=simulator');await p.locator('.board-svg').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));
 /* Al cambiar a corriente en serie el panel abre su tutorial flotante, que tapa el menú: se cierra antes de usarlo. */
 const tut=async()=>{const w=p.locator('.current-tutorial-window');if(await w.count())await w.getByRole('button',{name:'Cerrar ventana',exact:true}).first().click();};
 const menu=async()=>{await tut();if(await p.locator('.simulation-menu').getAttribute('open')===null)await p.getByLabel('Opciones de simulación',{exact:true}).click();};
 const close=async()=>{const b=p.getByRole('button',{name:'Cerrar simulación · 24 v',exact:true});if(await b.count())await b.click();};
 /* En el diseño de teléfono la ventana de estado de energía queda sobre el aviso: se oculta antes de cerrarlo. */
 const dismiss=async()=>{const st=p.getByRole('button',{name:'Ocultar el estado de energía',exact:true});if(await st.count())await st.click();const b=p.getByRole('button',{name:'Cerrar aviso',exact:true});if(await b.count())await b.click();};
 const example=async name=>{await menu();await p.locator('.simulation-examples>summary').click();await p.getByRole('button',{name,exact:true}).click();await dismiss();};
 const power=async()=>{await menu();const d=p.getByRole('dialog',{name:'Simulación · 24 V',exact:true});await d.getByRole('button',{name:'Enchufar corriente virtual',exact:true}).click();await d.getByRole('button',{name:'FUERZA · OFF',exact:true}).click();for(const n of [1,2])await d.getByRole('button',{name:`CONTROL ${n} · OFF`,exact:true}).click();await close();const status=p.getByRole('button',{name:'Ocultar el estado de energía',exact:true});if(await status.count())await status.click();};
 await example('Cargar arranque estrella-triángulo automático');assert.equal(await p.locator('[data-module-id]').count(),6);await menu();await p.getByLabel('Retardo del temporizador',{exact:true}).selectOption('2');await close();await power();
 const start=p.getByRole('button',{name:'Pulsador verde derecho',exact:true});await start.focus();await p.keyboard.down('Space');
 await p.waitForFunction(()=>document.querySelector('[data-motor-connection="star"]'));await p.keyboard.up('Space');
 await p.waitForFunction(()=>document.querySelector('[data-sim-relay="CONTACTOR_TRIFASICO"]')?.dataset.active==='true');
 await p.getByRole('button',{name:'Multímetro del panel',exact:true}).click();/* La pantalla del instrumento se actualiza con una animación: se espera la lectura en vez de leerla al instante. */
 const showsRe=re=>p.waitForFunction(r=>new RegExp(r).test(document.querySelector('.panel-multimeter output')?.textContent||''),re.source);
 const shows=text=>p.waitForFunction(t=>document.querySelector('.panel-multimeter output')?.textContent===t,text);
 const meter=p.locator('.panel-multimeter'),read=meter.getByLabel('Lectura del multímetro',{exact:true});
 await meter.getByRole('radio',{name:'Tensión alterna de mando y fuerza',exact:true}).dispatchEvent('click');
 const probe=async(color,id)=>{const handle=meter.getByRole('button',{name:new RegExp(`^(Punta|Cable banana) ${color==='roja'?'roj[ao]':'negr[ao]'}: arrastra hasta un borne$`)});for(let i=0;i<180;i++){if(await handle.getAttribute('data-probe-connected')===id)return;await handle.press('ArrowRight');}throw Error('No alcanza '+id);};
 await probe('roja','FUENTE:R');await probe('negra','FUENTE:S');/* El motor en marcha carga la red: la tensión medida cae un poco bajo los 380 V nominales por la impedancia de línea del modelo. */
 await p.waitForFunction(()=>{const v=parseFloat((document.querySelector('.panel-multimeter output')?.textContent||'').replace(',','.'));return v>=370&&v<=380.05;});
 await p.waitForFunction(()=>document.querySelector('[data-sim-relay="CONTACTOR_TERMICO"]')?.dataset.active==='true');assert.equal(await p.locator('[data-sim-relay="CONTACTOR_TRIFASICO"]').getAttribute('data-active'),'false');
 await p.screenshot({path:`${out}/${engine.name()}-${width}-force-delta.png`});
 /* Las opciones del instrumento (anotar, tabla, valores del modelo) están plegadas e inertes hasta desplegarlas. */
 const opts=async()=>{if(await p.locator('.instrument-options-group[inert]').count())await meter.getByRole('button',{name:'Desplegar opciones del instrumento',exact:true}).dispatchEvent('click');};await opts();
 await meter.getByRole('button',{name:'Anotar medida',exact:true}).dispatchEvent('click');await meter.getByRole('button',{name:'Tabla de mediciones (1)',exact:true}).dispatchEvent('click');assert.match(await p.getByRole('dialog',{name:'Libreta del multímetro del panel',exact:true}).innerText(),/3[78]\d,\d V/);await p.getByRole('dialog',{name:'Libreta del multímetro del panel',exact:true}).getByRole('button',{name:'Cerrar ventana',exact:true}).click();
 /* La tensión de línea ahora se edita en «Banco: protección y referencias» y solo se aplica con el banco desconectado. */
 await opts();await meter.getByRole('button',{name:'Banco: protección y referencias',exact:true}).dispatchEvent('click');const bench=p.getByRole('dialog',{name:'Banco · protección y referencias',exact:true});await bench.getByRole('button',{name:'Perfil del banco',exact:true}).click();const line=bench.getByLabel('Tensión de línea (V)',{exact:true});assert.equal(await line.inputValue(),'380');await line.fill('400');await bench.getByRole('button',{name:'Aplicar perfil con el banco desconectado',exact:true}).click();assert.match(await bench.innerText(),/No se aplicó el perfil/);await showsRe(/3[78]\d,\d V/);await bench.getByRole('button',{name:'Cerrar ventana',exact:true}).click();
 // Real cable removal followed by series insertion through the normal probe controls.
 await example('Cargar piloto con pulsador');assert.equal(await p.locator('.interactive-wire').count(),3);await p.getByRole('button',{name:'Retirar cables',exact:true}).click();await p.locator('.interactive-wire').last().press('Enter');assert.equal(await p.locator('.interactive-wire').count(),2);await power();
 await meter.getByRole('radio',{name:'Corriente alterna (en serie)',exact:true}).dispatchEvent('click');await shows('USA CABLES BANANA');await meter.getByRole('button',{name:'Cambiar cables del multímetro',exact:true}).dispatchEvent('click');/* en teléfono el instrumento flotante nunca queda «estable» para Playwright */await shows('USA A Y COM');await meter.getByRole('button',{name:'Conectar punta roja a A',exact:true}).dispatchEvent('click');
 await probe('roja','BOTONERAS:N');await probe('negra','FUENTE:N');await start.focus();await p.keyboard.down('Space');await p.waitForFunction(()=>document.querySelector('[data-sim-pilot="P4"]')?.dataset.lit==='true');await showsRe(/0,050 A/);assert.equal(await p.locator('.interactive-wire').count(),2);
 await p.screenshot({path:`${out}/${engine.name()}-${width}-series-current.png`});await p.keyboard.up('Space');
 await probe('roja','FUENTE:F');await shows('SOBRECARGA');assert.equal(await p.locator('[data-sim-pilot="P4"]').getAttribute('data-lit'),'false');
 await meter.getByRole('radio',{name:'Tensión alterna de mando y fuerza',exact:true}).dispatchEvent('click');await shows('USA V Ω');await meter.getByRole('button',{name:'Conectar punta roja a V Ω',exact:true}).dispatchEvent('click');await shows('24,00 V');
 await meter.getByRole('radio',{name:'Continuidad',exact:true}).dispatchEvent('click');await shows('DESENERGIZA');await menu();await p.getByRole('dialog',{name:'Simulación · 24 V',exact:true}).getByRole('button',{name:'Desenchufar corriente virtual',exact:true}).click();await close();await probe('roja','CONTACTOR_TERMICO:95');await probe('negra','CONTACTOR_TERMICO:96');await showsRe(/0,4 Ω/);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 report.checks.push(`${engine.name()} ${width}: 6 módulos; estrella→triángulo automático; 380/400 V; libreta; retirar cable e insertar A/COM; 0,050 A; sobrecarga; retorno V Ω; continuidad; sin overflow`);console.log('PASS',report.checks.at(-1));await context.close();
 }}finally{await browser.close();}}
 assert.deepEqual(report.errors,[]);report.result='PASS';
})().catch(e=>{console.error(e);report.failure=String(e);process.exitCode=1;}).finally(()=>fs.writeFileSync(out+'/ui-results.json',JSON.stringify(report,null,2)));
