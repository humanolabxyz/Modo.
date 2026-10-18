const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4338/';
const output='qa/proteccion';
fs.mkdirSync(output,{recursive:true});
const report={base,checks:[],errors:[],captures:[],expectedViolations:[]};
const pass=message=>{report.checks.push(message);console.log('PASS',message);};
const walk=dir=>fs.readdirSync(dir).flatMap(name=>{const file=path.join(dir,name);return fs.statSync(file).isDirectory()?walk(file):[file];});

(async()=>{
 const browser=await chromium.launch();
 try{
  const ctx=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)report.errors.push(response.status()+' '+response.url());});
  for(const [width,height] of [[360,780],[390,844],[1920,1080]]){
   await page.setViewportSize({width,height});
   for(const route of ['','?view=simulator','estudio/','laboratorio/','legal/']){
    const response=await page.goto(base+route);
    assert.equal(response.status(),200,route);
    const headers=response.headers();
    assert.equal(headers['x-frame-options'],'DENY');
    assert.equal(headers['x-content-type-options'],'nosniff');
    assert.match(headers['content-security-policy'],/frame-ancestors 'none'/);
    assert.match(headers['x-robots-tag'],/noindex/);
    if(route==='')await page.locator('.modo-primary:not(:disabled)').waitFor();
    if(route.startsWith('?'))await page.locator('.board-svg').waitFor();
    if(route==='estudio/')await page.locator('.study-course-title').waitFor();
    if(route==='laboratorio/')await page.locator('[data-lab-ready=true]').waitFor();
    if(route==='legal/')await page.getByRole('heading',{name:'01 · Autoría y créditos'}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${route} ${width}`);
    if(!route.startsWith('?')){
     if(route!=='legal/'){
      if(route==='laboratorio/'&&await page.locator('.lab-compact-bar').count())await page.getByRole('button',{name:'Opciones del proyecto',exact:true}).click();
      const link=page.locator('.humano-legal-link');
      await assert.doesNotReject(()=>link.waitFor({state:'visible'}));
      assert.equal(await link.getAttribute('target'),'_blank');
      const box=await link.boundingBox();assert.ok(box.width>=44&&box.height>=44);
     }
     if(width!==360){
      const capture=`${output}/${route.replaceAll('/','')||'inicio'}-${width}x${height}.png`;
      await page.screenshot({path:capture,fullPage:route==='legal/'||route==='',animations:'disabled'});
      report.captures.push(capture);
     }
    }else if(width<900){
     await page.locator('.practice-menu>summary').click();
     await page.locator('.compact-legal .humano-legal-link').waitFor({state:'visible'});
    }
   }
  }
  assert.deepEqual(report.errors,[],'Errores de navegador o violaciones CSP durante el uso normal');
  pass('Cinco vistas a 360, 390 y 1920 px: sin desbordamiento, errores JS, recursos rotos ni bloqueos CSP; enlaces legales accesibles');

  await page.goto(base);
  await page.locator('.modo-primary:not(:disabled)').waitFor();
  await page.evaluate(()=>{localStorage.setItem('humano-qa-preservacion','conservar');});
  const [legal]=await Promise.all([ctx.waitForEvent('page'),page.locator('.humano-legal-link').click()]);
  await legal.waitForLoadState();assert.match(await legal.title(),/Humano Lab/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('humano-qa-preservacion')),'conservar');
  await legal.close();
  pass('La política abre otra pestaña sin abandonar ni borrar la práctica');

  // Comprobar el resultado estático: todas las etiquetas inline tienen hash autorizado.
  for(const file of walk('dist').filter(file=>file.endsWith('.html'))){
   const html=fs.readFileSync(file,'utf8');
   const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
   if(file.replace(/\\/g,'/').endsWith('/geogebra-frame.html')){
    assert.ok(policy.includes('https://www.geogebra.org')&&policy.includes('https://cdn.geogebra.org'));
    assert.ok(!/script-src[^;]*\shttps:;/.test(policy),'El marco no admite cualquier dominio de scripts');
    continue; // Única excepción: el runtime oficial de GeoGebra genera scripts inline.
   }
   assert.ok(!/script-src[^;]*(unsafe-inline|unsafe-eval)/.test(policy));
   for(const [,attrs,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(/\bsrc\s*=/i.test(attrs)||!body.trim())continue;
    const hash=crypto.createHash('sha256').update(body).digest('base64');assert.ok(policy.includes(hash),file);
   }
  }
  pass('CSP de la aplicación: hashes correctos, sin unsafe-inline ni unsafe-eval; GeoGebra tiene un documento con permisos específicos');

  // Ensayo negativo aislado: la inyección debe ser rechazada por el navegador.
  const securityCtx=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce'});
  const attack=await securityCtx.newPage();
  await attack.goto(base+'legal/');
  const blocked=await attack.evaluate(async()=>{
   const violation=new Promise(resolve=>document.addEventListener('securitypolicyviolation',event=>resolve(event.effectiveDirective),{once:true}));
   const script=document.createElement('script');script.textContent='window.__humanoInjected=true';document.body.append(script);
   const directive=await violation;return {directive,injected:window.__humanoInjected===true};
  });
  assert.equal(blocked.injected,false);assert.match(blocked.directive,/script-src/);report.expectedViolations.push(blocked);
  await securityCtx.close();pass('Inyección inline no autorizada bloqueada realmente por Chromium');

  const offline=await browser.newContext({reducedMotion:'reduce'}),offlinePage=await offline.newPage();
  await offlinePage.goto(base);
  await offlinePage.evaluate(()=>navigator.serviceWorker.ready);
  await offlinePage.reload();
  await offline.setOffline(true);
  await offlinePage.goto(base+'legal/');
  await offlinePage.getByRole('heading',{name:'01 · Autoría y créditos'}).waitFor();
  assert.equal((await offlinePage.evaluate(async()=>fetch('/THIRD_PARTY_NOTICES.txt').then(r=>r.status))),200);
  await offlinePage.goto(base+'?view=simulator');await offlinePage.locator('.board-svg').waitFor();
  await offline.close();pass('Créditos, licencias y simulador disponibles sin conexión');

  const publicFiles=walk('dist');
  assert.ok(!publicFiles.some(file=>/(?:^|[\\/])(?:\.env[^\\/]*|\.vercel|node_modules|qa)(?:[\\/]|$)|\.map$/.test(file)),'Artefactos privados o source maps en dist');
  const hashes=publicFiles.map(file=>({file:path.relative('dist',file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
  fs.writeFileSync(output+'/manifest-build-sha256.json',JSON.stringify({createdAt:new Date().toISOString(),purpose:'Huella local de los archivos públicos; no es un registro de propiedad intelectual.',files:hashes},null,2));
  pass('Build sin .env, carpetas privadas ni source maps; huellas SHA-256 conservadas localmente');
  report.status='PASS';
 }finally{
  fs.writeFileSync(output+'/verification.json',JSON.stringify(report,null,2));await browser.close();
 }
})().catch(error=>{console.error(error);process.exit(1);});
