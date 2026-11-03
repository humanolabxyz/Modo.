// Visual review of the 20 existing robotics components, using the public UI.
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4326').replace(/\/$/, '');
const out = 'qa/robotics-models';
(async () => {
  fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const report = {errors:[], captures:[], pieces:[]};
  const open = async (width=1440,height=900) => {
    const ctx=await browser.newContext({viewport:{width,height},hasTouch:width<600,isMobile:width<600,serviceWorkers:'block',reducedMotion:'reduce'});
    const p=await ctx.newPage(); p.on('pageerror',e=>report.errors.push(e.message));
    await p.goto(base+'/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(()=>!!window.__modoRobotics?.partIds); return {ctx,p};
  };
  const frame = async p => {await p.keyboard.press('Escape'); await p.locator('.rb-dock button[aria-label="Encuadrar"]').click(); await p.waitForTimeout(800);};
  const capture = async (p,name) => {await p.screenshot({path:out+'/'+name+'.png'});report.captures.push(name);};
  try {
    // Inspect each component in isolation: catches missing geometry and runtime errors.
    const {ctx:listCtx,p:list}=await open(); await list.locator('.rb-dock button[aria-label="Piezas"]').click();
    const labels=await list.locator('button[aria-label^="Agregar "]').evaluateAll(xs=>xs.map(x=>x.getAttribute('aria-label'))); await listCtx.close();
    assert.equal(labels.length,23);
    for(let i=0;i<labels.length;i++) {
      const {ctx,p}=await open(); await p.locator('.rb-dock button[aria-label="Piezas"]').click(); await p.getByRole('button',{name:labels[i],exact:true}).click();
      await p.locator('button[aria-label="Cerrar Piezas"]').click(); await frame(p);
      assert.equal(await p.evaluate(()=>window.__modoRobotics.partIds().length),1);
      await capture(p,'pieza-'+String(i+1).padStart(2,'0')); report.pieces.push(labels[i]); await ctx.close();
    }
    for(const [name,w,h] of [['escritorio',1440,900],['movil',390,844]]) {
      const {ctx,p}=await open(w,h); await p.locator('.rb-empty .rb-template-btn').click(); await p.waitForFunction(()=>window.__modoRobotics?.partIds?.().length===14); await frame(p);
      assert.equal(await p.evaluate(()=>window.__modoRobotics.wireCount()),28); await capture(p,'despues-'+name);
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
      await p.locator('.rb-dock button[aria-label="Cable"]').click(); await p.waitForTimeout(300); await capture(p,'pines-'+name); await ctx.close();
    }
    assert.deepEqual(report.errors,[]); console.log('PASS: 20 modelos, plantilla con 28 cables, escritorio y móvil sin errores de página.');
  } finally { await browser.close(); fs.writeFileSync(out+'/visual-report.json',JSON.stringify(report,null,2)); }
})().catch(e=>{console.error(e);process.exit(1)});
