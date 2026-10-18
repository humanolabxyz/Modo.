/* Capturas con el menú de componentes abierto y con la simulación en marcha. Uso: node qa/shots-modules-extra.cjs <carpeta> */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve(process.argv[2]||'qa/modulos-lab/despues'),base='http://127.0.0.1:4336/';fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
  await page.goto(base+'laboratorio?tool=schematic');await page.waitForSelector('.lab-pan');await page.waitForTimeout(900);
  await page.getByRole('button',{name:'Componentes'}).click();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'schematic-menu.png')});await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Simular proyecto'}).click();await page.waitForTimeout(500);
  const s1=page.getByRole('button',{name:/^S1/});const b=await s1.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'schematic-running.png')});await page.mouse.up();
  await page.goto(base+'laboratorio?tool=process');await page.waitForSelector('.lab-pan');await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Simular proyecto'}).click();await page.waitForTimeout(2500);await page.screenshot({path:path.join(out,'process-running.png')});
  await page.goto(base+'laboratorio?tool=hmi');await page.waitForSelector('.lab-pan');await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Elementos'}).click();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'hmi-menu.png')});
  await browser.close();
})();
