const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4323/';
const only=((process.argv.find(a=>a.startsWith('--only='))||'').slice(7)).split(',').filter(Boolean);
const want=n=>!only.length||only.includes(n);
const errors=[],pass=m=>console.log('PASS',m);
const rect=(page,sel)=>page.locator(sel).first().evaluate(el=>{const r=el.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}});
const overlaps=(a,b)=>a.l<b.r-1&&b.l<a.r-1&&a.t<b.b-1&&b.t<a.b-1;
const open=async(browser,w,h)=>{const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();await page.evaluate(()=>document.fonts.ready);return {ctx,page}};
const noHScroll=async(page,label)=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+': hay scroll horizontal');
const snap=page=>page.locator('.app-shell').getAttribute('data-sheet');
const drag=async(page,from,to,steps=12)=>{await page.mouse.move(from.x,from.y);await page.mouse.down();for(let i=1;i<=steps;i++){await page.mouse.move(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps);await page.waitForTimeout(30)}await page.mouse.up();await page.waitForTimeout(400)};
(async()=>{const browser=await chromium.launch();try{
 if(want('bar'))for(const [w,h] of [[390,844],[360,780]]){
  const {ctx,page}=await open(browser,w,h);
  assert.equal(await page.locator('.compact-bar').count(),1,'falta .compact-bar');
  const bar=await rect(page,'.compact-bar');assert.ok(bar.h<=56,`barra de ${bar.h}px`);
  assert.ok(await page.locator('.compact-bar').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${w}px: la barra desborda`);
  for(const sel of ['.topbar','.workspace-navigation','.work-tools','.mobile-work-tabs','.stage-topline'])assert.ok(!(await page.locator(sel).first().isVisible().catch(()=>false)),sel+' sigue visible');
  assert.ok(!(await page.locator('.searchbox-wrap').first().isVisible().catch(()=>false)),'el buscador no debe verse hasta abrir ⋯');
  await page.locator('.compact-bar .simulation-toggle').waitFor();await page.locator('.compact-bar .cables-menu').waitFor();
  await page.locator('.practice-menu>summary').click();
  const input=page.getByRole('textbox',{name:'Buscar un borne o componente'});await input.waitFor();await input.fill('A1');
  assert.ok(await page.locator('.search-results button').count()>0,'sin resultados para A1');
  await page.locator('.search-results button').first().click();
  assert.equal(await page.locator('.practice-menu').evaluate(el=>el.open),false,'el menú debe cerrarse al elegir un borne');
  await noHScroll(page,`${w}px`);pass(`bar ${w}×${h}: barra ${Math.round(bar.h)}px, menú ⋯ con buscador`);await ctx.close();
 }
 for(const [name,w,h,portrait] of [['portrait',390,844,true],['landscape',844,390,false]])if(want(name)){
  const {ctx,page}=await open(browser,w,h);
  const openDiagram=async()=>{await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.diagram-window').waitFor();await page.waitForTimeout(400)};
  const hdr=async()=>{const r=await rect(page,'.diagram-window .diagram-pane-actions');return {x:r.l+28,y:r.t+r.h/2}};
  await openDiagram();
  const first=await rect(page,'.diagram-window'),bar=await rect(page,'.compact-bar'),stage=await rect(page,'.stage-wrap'),dock=await rect(page,'.tool-dock');
  assert.ok(first.t>=bar.b-1,'la ventana no debe tapar la barra');assert.ok(first.l>=0&&first.r<=w+0.5&&first.b<=h+0.5,'la ventana debe caber en la pantalla');
  assert.ok(!overlaps(bar,first),'barra y ventana se solapan');assert.ok(!overlaps(dock,first),'por defecto la ventana no debe tapar la barra de herramientas');
  assert.ok(stage.l<1&&stage.w>=w-1&&stage.b>=h-1,`el banco debe usar toda la pantalla (${stage.l}/${stage.w}/${stage.b})`);
  if(portrait)assert.ok(first.t>=h*.4,`en vertical el banco debe quedar visible sobre la ventana (top ${first.t})`);
  assert.equal(await page.locator('.sheet-grip').count(),0,'ya no existe la hoja con asa');
  assert.equal(await page.locator('.float-handle').count(),5,'faltan los 5 tiradores de redimensión');
  const dx=portrait?0:200,dy=portrait?-120:10;
  let hh=await hdr();await drag(page,hh,{x:hh.x+dx,y:hh.y+dy});
  const moved=await rect(page,'.diagram-window');assert.ok(Math.abs(moved.l-(first.l+dx))<3&&Math.abs(moved.t-(first.t+dy))<3,`mover: ${first.l},${first.t} → ${moved.l},${moved.t}`);assert.ok(Math.abs(moved.w-first.w)<2&&Math.abs(moved.h-first.h)<2,'mover no debe cambiar el tamaño');
  const se=await rect(page,'.float-handle-se');const sdx=portrait?0:80,sdy=portrait?40:20;
  await drag(page,{x:se.l+se.w/2,y:se.t+se.h/2},{x:se.l+se.w/2+sdx,y:se.t+se.h/2+sdy});
  const sized=await rect(page,'.diagram-window');assert.ok(Math.abs(sized.w-(moved.w+sdx))<3&&Math.abs(sized.h-(moved.h+sdy))<3,`tamaño ${moved.w}×${moved.h} → ${sized.w}×${sized.h}`);
  const we=await rect(page,'.float-handle-w');await drag(page,{x:we.l+we.w/2,y:we.t+we.h/2},{x:we.l+we.w/2+60,y:we.t+we.h/2});
  const wsized=await rect(page,'.diagram-window');assert.ok(Math.abs(wsized.w-(sized.w-60))<3&&Math.abs(wsized.r-sized.r)<3,'el borde izquierdo debe cambiar el ancho sin mover el derecho');
  hh=await hdr();await drag(page,hh,{x:hh.x+3000,y:hh.y-3000});
  const clamped=await rect(page,'.diagram-window');assert.ok(clamped.r<=w+0.5&&clamped.t>=bar.b-1&&clamped.l>=0&&clamped.b<=h+0.5,'la ventana se salió de la pantalla');
  hh=await hdr();await drag(page,hh,{x:hh.x-3000,y:hh.y+3000});
  const clamped2=await rect(page,'.diagram-window');assert.ok(clamped2.l>=0&&clamped2.b<=h+0.5,'la ventana se salió por abajo o por la izquierda');
  const saved=await rect(page,'.diagram-window');await page.reload();await page.locator('.board-svg').waitFor();await openDiagram();
  const again=await rect(page,'.diagram-window');assert.ok(['l','t','w','h'].every(k=>Math.abs(again[k]-saved[k])<2),'no recordó posición y tamaño');
  const dockHit=await page.evaluate(()=>{const d=document.querySelector('.tool-dock').getBoundingClientRect();return document.elementFromPoint(d.left+d.width/2,d.top+d.height/2)?.closest('.tool-dock')!==null});
  assert.ok(dockHit,'la barra de herramientas debe quedar siempre por encima de la ventana');
  await page.locator('.diagram-window').getByRole('button',{name:'Ampliar diagrama'}).click();await page.waitForTimeout(400);
  const full=await rect(page,'.diagram-window');assert.ok(full.w>=w-30&&full.h>=h-bar.b-20,`ampliada: ${full.w}×${full.h}`);
  await page.locator('.diagram-window').getByRole('button',{name:'Volver al banco'}).click();await page.waitForTimeout(400);
  const back=await rect(page,'.diagram-window');assert.ok(['l','t','w','h'].every(k=>Math.abs(back[k]-saved[k])<2),'Volver debe recuperar la ventana');
  hh=await hdr();await page.mouse.dblclick(hh.x,hh.y);await page.waitForTimeout(300);
  const reset=await rect(page,'.diagram-window');assert.ok(['l','t','w','h'].every(k=>Math.abs(reset[k]-first[k])<2),'doble toque debe restablecer la posición por defecto');
  await page.locator('.diagram-window').getByRole('button',{name:'Cerrar diagrama'}).click();await page.locator('.diagram-window').waitFor({state:'hidden'});assert.ok(!(await page.locator('.diagram-window').isVisible()),'la ventana debe ocultarse');
  await noHScroll(page,name);pass(`${name}: ventana flotante movible, redimensionable, persistente y maximizable`);await ctx.close();
 }
 if(want('rotate')){
  const {ctx,page}=await open(browser,390,844);
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.diagram-window').waitFor();await page.waitForTimeout(300);
  let hh=await rect(page,'.diagram-window .diagram-pane-actions');await drag(page,{x:hh.l+28,y:hh.t+hh.h/2},{x:hh.l+68,y:hh.t+hh.h/2-100});
  const vertical=await rect(page,'.diagram-window');
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(500);
  const land=await rect(page,'.diagram-window'),bar=await rect(page,'.compact-bar');
  assert.ok(land.r<=844.5&&land.b<=390.5&&land.t>=bar.b-1&&land.l>=0,`tras girar a horizontal la ventana debe caber: ${JSON.stringify(land)}`);
  assert.ok(Math.abs(land.l-vertical.l)>1||Math.abs(land.w-vertical.w)>1,'en horizontal debe usar su propia posición, no la de vertical');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  const back=await rect(page,'.diagram-window');assert.ok(['l','t','w','h'].every(k=>Math.abs(back[k]-vertical[k])<2),'al volver a vertical debe recuperar su posición de vertical');
  pass('rotate: cada orientación recuerda su propia posición y tamaño');await ctx.close();
 }
 if(want('floating')){
  const {ctx,page}=await open(browser,390,844);
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.diagram-window').waitFor();await page.waitForTimeout(400);
  const win=await rect(page,'.diagram-window'),dock=await rect(page,'.tool-dock'),zoom=await rect(page,'.practice-workspace .zoom-toolbar'),bar=await rect(page,'.compact-bar');
  assert.ok(dock.l>=0&&dock.r<=390,'las herramientas se salen de la pantalla');assert.ok(!overlaps(dock,zoom),'herramientas y zoom se solapan');assert.ok(zoom.t>=bar.b-1,'el zoom invade la barra');
  await page.locator('[data-terminal-id]').first().click({force:true});
  if(await page.locator('.practice-workspace .inspector').count()){const i=await rect(page,'.practice-workspace .inspector');assert.ok(i.l>=0&&i.r<=390&&i.t>=bar.b-1,'el inspector se sale o tapa la barra');assert.ok(!overlaps(i,win),'el inspector no debe quedar bajo la ventana');}
  pass('floating: herramientas, zoom e inspector visibles y sin solapamientos');await ctx.close();
 }
 if(want('touch')){
  for(const [name,w,h] of [['vertical',390,844],['horizontal',844,390]]){
   const {ctx,page}=await open(browser,w,h);const cdp=await ctx.newCDPSession(page);
   await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.diagram-window').waitFor();await page.waitForTimeout(400);
   const finger=async(from,to,steps=12)=>{const pt=(x,y)=>[{x,y,id:1}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pt(from.x,from.y)});for(let i=1;i<=steps;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pt(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps)});await page.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300)};
   const before=await rect(page,'.diagram-window'),hd=await rect(page,'.diagram-window .diagram-pane-actions');
   const mdy=name==='vertical'?-80:40;await finger({x:hd.l+28,y:hd.t+hd.h/2},{x:hd.l+28,y:hd.t+hd.h/2+mdy});
   const moved=await rect(page,'.diagram-window');assert.ok(Math.abs(moved.t-(before.t+mdy))<4,`${name}: el dedo debe mover la ventana (${before.t} → ${moved.t})`);
   const se=await rect(page,'.float-handle-se');await finger({x:se.l+se.w/2,y:se.t+se.h/2},{x:se.l+se.w/2,y:se.t+se.h/2+30});
   const sized=await rect(page,'.diagram-window');assert.ok(Math.abs(sized.h-(moved.h+30))<4,`${name}: el dedo debe estirar la ventana (${moved.h} → ${sized.h})`);
   pass(`touch ${name}: toques reales mueven y estiran la ventana`);await ctx.close();
  }
 }
 if(want('fit')){
  for(const [name,w,h] of [['vertical',390,844],['horizontal',844,390]]){
   const {ctx,page}=await open(browser,w,h);
   const union=()=>page.evaluate(()=>{const r=[...document.querySelectorAll('[data-module-id]')].map(e=>e.getBoundingClientRect());return {l:Math.min(...r.map(x=>x.left)),t:Math.min(...r.map(x=>x.top)),r:Math.max(...r.map(x=>x.right)),b:Math.max(...r.map(x=>x.bottom))}});
   await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.diagram-window').waitFor();await page.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');await page.waitForTimeout(400);
   const win=await rect(page,'.diagram-window'),bar=await rect(page,'.compact-bar'),u=await union();
   if(name==='vertical')assert.ok(u.b<=win.t+2&&u.t>=bar.b-2,`vertical: el banco debe verse entero sobre la ventana (banco ${Math.round(u.t)}–${Math.round(u.b)}, ventana desde ${Math.round(win.t)})`);
   else assert.ok(u.l>=win.r-2&&u.r<=w+2,`horizontal: el banco debe verse entero a la derecha de la ventana (banco ${Math.round(u.l)}–${Math.round(u.r)}, ventana hasta ${Math.round(win.r)})`);
   await page.locator('.diagram-window').getByRole('button',{name:'Cerrar diagrama'}).click();await page.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');await page.waitForTimeout(400);
   const closed=await union();assert.ok(closed.b-closed.t>(u.b-u.t)-1||closed.r-closed.l>(u.r-u.l)-1,`${name}: al cerrar el diagrama el banco debe volver a usar toda la pantalla`);
   await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.waitForTimeout(500);
   await page.getByRole('button',{name:'Ajustar al tablero',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');await page.waitForTimeout(300);
   const again=await union();if(name==='vertical')assert.ok(again.b<=win.t+2,'«Ajustar al tablero» debe encuadrar el banco en la parte visible');else assert.ok(again.l>=win.r-2,'«Ajustar al tablero» debe encuadrar el banco en la parte visible');
   pass(`fit ${name}: el banco se encuadra en la parte que la ventana no tapa`);await ctx.close();
  }
 }
 if(want('focus')){
  const {ctx,page}=await open(browser,390,844);
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.diagram-window').waitFor();await page.waitForTimeout(400);
  await page.locator('.practice-menu>summary').click();await page.getByRole('combobox',{name:'Enfocar un módulo'}).selectOption('BORNERA_MOTOR');await page.waitForFunction(()=>document.querySelector('.board-svg')?.dataset.animating!=='true');await page.waitForTimeout(300);
  const t=await rect(page,'[data-terminal-id="BORNERA_MOTOR:W2"]'),win=await rect(page,'.diagram-window'),stage=await rect(page,'.stage-wrap');
  assert.ok(!overlaps(t,win),`el módulo enfocado no debe quedar bajo la ventana (borne ${Math.round(t.t)}–${Math.round(t.b)}, ventana desde ${Math.round(win.t)})`);
  assert.ok(t.t>=stage.t&&t.b<=win.t,'el módulo enfocado debe estar en la parte visible del banco');
  pass('focus: «Ver módulo de cerca» deja el módulo en la parte visible del banco');await ctx.close();
 }
 if(want('desktop')){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();
  assert.equal(await page.locator('.compact-bar').count(),0,'escritorio no debe tener .compact-bar');assert.ok(await page.locator('.topbar').isVisible(),'escritorio conserva el topbar');
  pass('desktop: sin cambios');await ctx.close();
 }
 assert.deepEqual(errors,[],'errores de página: '+errors.join(' | '));
 console.log('PASS verify-mobile');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
