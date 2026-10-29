const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4324/';
(async()=>{const browser=await chromium.launch();try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const page=await ctx.newPage();
 await page.goto(base);
 const link=await page.locator('link[rel=manifest]').getAttribute('href');assert.equal(link,'/manifest.webmanifest');
 const manifest=await (await page.request.get(base+'manifest.webmanifest')).json();
 assert.equal(manifest.display,'standalone');assert.equal(manifest.orientation,'any');assert.equal(manifest.lang,'es');
 assert.ok(manifest.icons.some(i=>i.sizes==='192x192')&&manifest.icons.some(i=>i.sizes==='512x512')&&manifest.icons.some(i=>i.purpose==='maskable'),'faltan iconos 192/512/maskable');
 for(const i of manifest.icons){const r=await page.request.get(new URL(i.src,base).href);assert.equal(r.status(),200,i.src)}
 assert.equal((await page.request.get(base+'icons/apple-touch-icon.png')).status(),200);
 assert.match(await page.locator('meta[name=viewport]').getAttribute('content'),/viewport-fit=cover/);
 assert.equal(await page.locator('meta[name=apple-mobile-web-app-capable]').getAttribute('content'),'yes');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 assert.ok(await page.evaluate(()=>!!navigator.serviceWorker.controller),'el service worker no controla la página');
 await ctx.setOffline(true);
 await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor({timeout:10000});
 assert.ok(await page.evaluate(async()=>(await fetch('/panel-model.json')).ok),'panel-model.json no está en caché');
 assert.ok(await page.evaluate(async()=>(await fetch('/references/botoneras.jpg')).ok),'las fotos de referencia no están en caché');
 console.log('PASS verify-pwa: manifest, iconos, service worker y arranque sin conexión');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
