const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4326').replace(/\/$/,''),out='qa/robotics-kit';
const templates=[['robot-2-ruedas-listo',14,28],['robot-seguidor-linea',17,36],['robot-explorador-luces',16,34]];
(async()=>{fs.mkdirSync(out,{recursive:true});if(!fs.existsSync(out+'/antes-kit.png'))fs.copyFileSync('qa/robotics-models/despues-escritorio.png',out+'/antes-kit.png');
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}),report={checks:[],errors:[],requests:[],screens:[]};
 const saved=async p=>{await p.waitForFunction(()=>/Guardado/.test(document.querySelector('.rb-name small')?.textContent||''));return p.evaluate(()=>{const l=JSON.parse(localStorage.getItem('modo-robotica-v1'));return l.projects.find(p=>p.id===l.active);});};
 try{for(const [view,w,h] of [['escritorio',1440,900],['movil',390,844]])for(const [template,parts,wires] of templates){
  const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600,serviceWorkers:'block',reducedMotion:'reduce'}),p=await ctx.newPage(),press=async l=>w<600?l.tap():l.click();
  p.on('pageerror',e=>report.errors.push(view+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text()))report.errors.push(m.text());});p.on('request',r=>{if(r.url().includes('/api/compile')&&r.method()==='POST')report.requests.push(r.url());});
  await p.goto(base+'/robotica/?debug=1');await p.locator('.rb-app[data-ready=true]').waitFor();
  await press(p.getByRole('button',{name:'Más robots y proyectos',exact:true}));assert.equal(await p.locator('.rb-templates button[data-template]').count(),13);
  await press(p.locator('.rb-templates button[data-template="'+template+'"]'));await p.waitForFunction(n=>window.__modoRobotics?.partIds?.().length===n,parts);
  await press(p.locator('.rb-dock button[aria-label="Encuadrar"]'));await p.waitForTimeout(600);
  assert.equal(await p.evaluate(()=>window.__modoRobotics.wireCount()),wires);let project=await saved(p);
  assert.ok(project.parts.some(p=>p.definitionId==='breadboard-400'));assert.ok(!project.parts.find(p=>p.definitionId==='arduino-uno-r3').props.usb);
  const chassis=project.parts.find(p=>p.definitionId==='chassis-2wd').instanceId;
  await p.screenshot({path:out+'/'+template+'-'+view+'-armado.png'});report.screens.push(template+'-'+view+'-armado.png');
  if(template==='robot-seguidor-linea'){
    await press(p.locator('.rb-dock button[aria-label="Escenario"]'));const field=p.getByLabel('Pista de línea',{exact:true});assert.equal(await field.inputValue(),'oval');await field.selectOption('curves');await field.selectOption('oval');await press(p.locator('button[aria-label="Cerrar Escenario"]'));
  }
  const start=await p.evaluate(id=>window.__modoRobotics.partWorld(id),chassis);
  await press(p.locator('.rb-sim button[aria-label="Ejecutar"]'));
  await p.waitForFunction(({id,start})=>{const pos=window.__modoRobotics?.partWorld?.(id);return pos&&Math.hypot(pos[0]-start[0],pos[2]-start[2])>.01;},{id:chassis,start},{timeout:30000});
  await press(p.locator('.rb-dock button[aria-label="Consola"]'));await press(p.getByRole('tab',{name:'Serie y estado',exact:true}));await p.locator('.rb-state-list').waitFor();assert.match(await p.locator('.rb-state-list').textContent(),/alimentada.*pin 5V/);
  if(template==='robot-seguidor-linea')await p.waitForFunction(()=>/TCRT5000.*leído del suelo/s.test(document.querySelector('.rb-state-list')?.textContent||''));
  if(template==='robot-explorador-luces')assert.match(await p.locator('.rb-state-list').textContent(),/LED 5 mm/);
  await press(p.locator('button[aria-label="Cerrar Consola"]'));
  if(w<600){
    const note=await p.locator('.rb-sim-note').boundingBox(),dock=await p.locator('.rb-dock').boundingBox();
    assert.ok(note&&dock&&note.y+note.height<=dock.y-6,'el estado queda sobre el dock, sin solaparse');
    const screen=await p.evaluate(()=>window.__modoRobotics.partIds().map(id=>window.__modoRobotics.screenOf(id)));
    assert.ok(screen.every(q=>q&&q.x>16&&q.x<390-16),'todas las piezas quedan encuadradas en horizontal');
  }
  await p.screenshot({path:out+'/'+template+'-'+view+'-simulando.png'});report.screens.push(template+'-'+view+'-simulando.png');
  await press(p.locator('.rb-sim button[aria-label="Detener"]'));
  if(template==='robot-2-ruedas-listo'){
    await press(p.locator('.rb-dock button[aria-label="Estructura"]'));await press(p.locator('.rb-tree-name').filter({hasText:'Interruptor general'}));await press(p.locator('button[aria-label="Cerrar Estructura"]'));
    await press(p.locator('.rb-dock button[aria-label="Propiedades"]'));await p.getByRole('checkbox',{name:'Encendido',exact:true}).uncheck();await press(p.locator('button[aria-label="Cerrar Propiedades"]'));
    project=await saved(p);assert.equal(project.parts.find(p=>p.definitionId==='power-switch').props.closed,false);
    await press(p.locator('.rb-sim button[aria-label="Ejecutar"]'));await press(p.locator('.rb-dock button[aria-label="Consola"]'));await press(p.getByRole('tab',{name:'Serie y estado',exact:true}));await p.waitForFunction(()=>/no tiene alimentación|SIN alimentación/.test(document.querySelector('.rb-serial')?.textContent||'')).catch(async e=>{await p.screenshot({path:out+'/fallo-apagado-'+view+'.png'});fs.writeFileSync(out+'/fallo-apagado-'+view+'.txt',await p.locator('body').innerText());throw e;});
    await p.screenshot({path:out+'/interruptor-apagado-'+view+'.png'});await press(p.locator('button[aria-label="Cerrar Consola"]'));await press(p.locator('.rb-sim button[aria-label="Detener"]'));
  }
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));project=await saved(p);assert.equal(project.parts.length,parts);await p.reload();await p.locator('.rb-app[data-ready=true]').waitFor();await p.waitForFunction(n=>window.__modoRobotics?.partIds?.().length===n,parts);assert.equal(await p.evaluate(()=>window.__modoRobotics.wireCount()),wires);
  const result=view+' '+template+': crear, piezas y cables, ejecutar con física, consola, guardar/recargar y sin desbordamiento';report.checks.push(result);console.log('PASS',result);await ctx.close();
 }assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[],'las plantillas se ejecutan con HEX guardado, sin pedir compilación');
 }finally{await browser.close();fs.writeFileSync(out+'/ui-verification.json',JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e);process.exit(1)});
