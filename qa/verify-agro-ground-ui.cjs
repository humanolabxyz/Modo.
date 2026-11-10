process.env.AGRO_QA_OUT ??= '/private/tmp/modo-ground-qa';
const {chromium}=require('./lib/playwright.cjs');
const {fixtureOpen}=require('./verify-agro-territory-ui.cjs');
const {diagnostics,ready}=require('./review-agro-etapa3.cjs');
const fs=require('node:fs');
(async()=>{
  const {createConfiguredWorld}=await import('../src/agro/world/setup.ts');
  const made=createConfiguredWorld({name:'Revisión terreno',seed:31,territory:'valley',side:400,template:'blank',site:'center',relief:'natural',radius:30,resources:[],water:80,experience:'free',start:'2026-09-21'});
  if(!made.ok)throw Error(made.error);
  const executablePath=process.env.CHROME_PATH || (process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
  const browser=await chromium.launch({executablePath,headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await context.addInitScript(diagnostics);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error' && /shader|program|webgl/i.test(m.text()))errors.push(m.text());});
  try{
    await page.goto('http://127.0.0.1:4386/agro/');await page.locator('[data-view=lobby]').waitFor();await fixtureOpen(page,made.value);await ready(page);
    await page.evaluate(()=>{const state=window.reviewScene.__r3f.root.getState(),ctl=state.controls,y=ctl.target.y;state.camera.position.set(25,y+18,30);ctl.update();state.invalidate();});
    await page.waitForTimeout(1800);fs.mkdirSync('qa/capturas-terreno',{recursive:true});
    await page.screenshot({path:'qa/capturas-terreno/desktop.png'});
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(800);await page.screenshot({path:'qa/capturas-terreno/movil.png'});
    if(errors.length)throw Error(errors.join('\n'));console.log('PASS terreno UI escritorio y móvil, sin errores de shader');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
