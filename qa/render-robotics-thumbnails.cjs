const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4326').replace(/\/$/,''),out='public/robotics/components';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+$/,'Generate only from the local source.');
(async()=>{fs.mkdirSync(out,{recursive:true});fs.mkdirSync('qa/robotics-menu',{recursive:true});const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block',reducedMotion:'reduce'}),p=await context.newPage();
await p.goto(base+'/robotica/?debug=1');await p.locator('.rb-app[data-ready=true]').waitFor();await p.waitForFunction(()=>!!window.__modoRobotics?.thumbnail);await p.locator('.rb-dock button[aria-label="Piezas"]').click();
const ids=await p.locator('.rb-part-list li[data-definition]').evaluateAll(items=>items.map(x=>x.dataset.definition));assert.equal(ids.length,35);
const requested=process.argv.slice(2); if(requested.length) ids.splice(0,ids.length,...ids.filter(id=>requested.includes(id))); assert.ok(ids.length);
for(const id of ids){await p.locator('[data-definition="'+id+'"] .rb-part-add').click(); console.log('ADD',id);}
await p.waitForFunction(n=>window.__modoRobotics.partIds().length===n,ids.length);await p.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.waitForTimeout(500);
await p.waitForFunction(n=>{const data=JSON.parse(localStorage.getItem('modo-robotica-v1'));return data?.projects.find(x=>x.id===data.active)?.parts.length===n;},ids.length);
const parts=await p.evaluate(()=>{const data=JSON.parse(localStorage.getItem('modo-robotica-v1'));return data.projects.find(x=>x.id===data.active).parts;});
if(ids.includes('educational-arm-e6')){await p.waitForFunction(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/robotics/e6/')&&r.name.endsWith('.STL')).length===7);await p.waitForTimeout(1200);}
const report=[];
for(const id of ids){const part=parts.find(x=>x.definitionId===id);const data=await p.evaluate(id=>window.__modoRobotics.thumbnail(id),part.instanceId);assert.match(data,/^data:image\/webp;base64,/);const bytes=Buffer.from(data.split(',')[1],'base64');assert.ok(bytes.length>500);fs.writeFileSync(out+'/'+id+'.webp',bytes);report.push({id,bytes:bytes.length});console.log('RENDER',id,bytes.length);}
fs.writeFileSync('qa/robotics-menu/generated.json',JSON.stringify({source:base,models:report,totalBytes:report.reduce((s,x)=>s+x.bytes,0)},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
