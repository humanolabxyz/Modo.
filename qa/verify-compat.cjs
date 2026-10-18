/* Compatibilidad con tablets: navegadores sin crypto.randomUUID (http en red local), sin Array.at / structuredClone (Safari < 15.4)
   y sin MediaQueryList.addEventListener (Safari < 14), más la pantalla de error. Uso: PANELLAB_URL=http://127.0.0.1:4410/ node qa/verify-compat.cjs */
const assert=require('node:assert/strict'),fs=require('node:fs');
const pw=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4322/';
const report={checks:[],errors:[]},pass=s=>report.checks.push(s);
const OLD=()=>{ // simula un navegador antiguo / contexto no seguro
 for(const f of [()=>delete Crypto.prototype.randomUUID,()=>delete Array.prototype.at,()=>delete String.prototype.at,()=>delete Array.prototype.findLast,()=>delete Array.prototype.findLastIndex,()=>delete Object.hasOwn,()=>delete String.prototype.replaceAll,()=>delete window.structuredClone,()=>delete MediaQueryList.prototype.addEventListener,()=>delete MediaQueryList.prototype.removeEventListener])try{f()}catch(e){}
};
(async()=>{const browser=await pw.chromium.launch();try{
 for(const device of ['iPad (gen 7)','iPad (gen 7) landscape','Galaxy Tab S4']){
  const context=await browser.newContext({...pw.devices[device]});await context.addInitScript(OLD);
  const page=await context.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
  for(const route of ['','?view=simulator']){
   errs.length=0;await page.goto(base+route);await page.waitForTimeout(2500);
   const info=await page.evaluate(()=>({uuid:typeof crypto.randomUUID,at:typeof [].at,clone:typeof structuredClone,mql:typeof matchMedia('(min-width:1px)').addEventListener,text:document.body.innerText.trim().length,board:document.querySelectorAll('svg.board-svg').length,crash:!!document.getElementById('modo-crash')}));
   assert.deepEqual(errs,[],`${device} ${route||'/'}: sin errores de página`);
   assert.deepEqual([info.uuid,info.at,info.clone,info.mql],['function','function','function','function'],'se completan las funciones que faltan');
   assert.ok(info.text>200&&!info.crash,`${device} ${route||'/'}: la página muestra contenido`);
   if(route)assert.equal(info.board,1,`${device}: el banco se dibuja`);
  }
  // el panel funciona de punta a punta sin esas funciones: conectar un cable usa crypto.randomUUID
  await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();
  assert.deepEqual(await page.evaluate(()=>structuredClone({a:[1,{b:2}]})),{a:[1,{b:2}]});
  await page.keyboard.press('c');await page.locator('[data-terminal-id="FUENTE:F"]').dispatchEvent('click');await page.locator('[data-terminal-id="CONTACTOR_TERMICO:95"]').dispatchEvent('click');
  await page.waitForFunction(()=>document.querySelectorAll('.interactive-wire').length===1);
  assert.deepEqual(errs,[]);
  await context.close();
 }
 pass('Sin crypto.randomUUID, Array.at, structuredClone ni MediaQueryList.addEventListener (iPad con Safari antiguo o sitio por http en red local) el panel arranca, dibuja el banco y conecta un cable en iPad vertical y horizontal y en una tableta Android');
 // pantalla de error: si la aplicación falla al arrancar no queda en blanco
 const context=await browser.newContext({...pw.devices['iPad (gen 7)']});
 await context.addInitScript(()=>{const real=window.matchMedia.bind(window);window.matchMedia=q=>{if(String(q).includes('orientation'))throw new Error('fallo de prueba al arrancar');return real(q)}});
 const page=await context.newPage();await page.goto(base+'?view=simulator');
 await page.locator('#modo-crash').waitFor({timeout:12000});
 const text=await page.locator('#modo-crash').innerText();
 assert.ok(text.includes('No se pudo abrir el panel')&&text.includes('fallo de prueba al arrancar'),'la pantalla de error dice qué falló');
 assert.ok(await page.getByRole('button',{name:'Recargar',exact:true}).isVisible()&&await page.getByRole('button',{name:/Borrar datos locales/}).isVisible());
 await page.screenshot({path:'qa/modulos-extra/pantalla-de-error.png'});await context.close();
 pass('Si la aplicación se cae al arrancar se ve una pantalla con el motivo y botones para recargar o borrar datos locales, en lugar de una página en blanco');
}finally{await browser.close();fs.writeFileSync('qa/modulos-extra/compat-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))}})().catch(e=>{console.error(e);process.exit(1)});
