const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'panel-model-original.json')));
const current=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/panel-model.json')));
(async()=>{const browser=await chromium.launch();try{
 const before=await browser.newPage({viewport:{width:1440,height:1100}});
 await before.goto('file:///'+path.resolve('PANEL_LAB_INACAP.html').replaceAll('\\','/'));
 const after=await browser.newPage({viewport:{width:1440,height:1100}});
 await after.goto('http://127.0.0.1:4322');
 await after.waitForFunction(()=>!document.querySelector('astro-island').hasAttribute('ssr'));
 await after.addStyleTag({content:'.selected-ring{display:none}'});
 for(const m of current.modules){
  const old=original.modules.find(x=>x.id===m.id);
  await before.locator('#board-root svg').evaluate((svg,m)=>svg.setAttribute('viewBox',`${m.x-25} ${m.y-25} ${m.w+50} ${m.h+50}`),old);
  await before.locator(`#board-root svg > g[transform="translate(${old.x} ${old.y})"]`).screenshot({path:path.join(__dirname,'anterior-'+m.id.toLowerCase()+'.png')});
  await after.getByRole('combobox',{name:'Enfocar un módulo',exact:true}).selectOption(m.id);
  await after.locator(`[data-module-id="${m.id}"]`).screenshot({path:path.join(__dirname,'actual-'+m.id.toLowerCase()+'.png')});
 }
 console.log('Captured original approved and updated geometry for all 7 modules.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
