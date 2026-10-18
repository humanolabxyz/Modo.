/* Capturas de los módulos del laboratorio (Esquemas, PLC, HMI, Procesos) en escritorio y móvil.
   Uso: node qa/shots-modules.cjs <carpeta> [url]   (por defecto el servidor de desarrollo en 4336) */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve(process.argv[2]||'qa/modulos-lab'),base=(process.argv[3]||'http://127.0.0.1:4336/').replace(/\/?$/,'/');
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch();
  for(const [name,viewport,touch] of [['desktop',{width:1440,height:900},false],['mobile',{width:390,height:844},true]]){
    const context=await browser.newContext({viewport,hasTouch:touch,isMobile:touch,deviceScaleFactor:1}),page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    for(const tool of ['schematic','plc','hmi','process']){
      await page.goto(`${base}laboratorio?tool=${tool}`);await page.waitForSelector('.lab-page');await page.waitForTimeout(900);
      await page.screenshot({path:path.join(out,`${tool}-${name}.png`)});
    }
    console.log(name,'errores:',errors.length?errors:'ninguno');await context.close();
  }
  await browser.close();
})();
