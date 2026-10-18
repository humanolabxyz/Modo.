/* Capturas de la pantalla Cálculos de Estudio. Uso: node qa/shots-calc.cjs <carpeta> */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve(process.argv[2]||'qa/calculos'),base=(process.argv[3]||'http://127.0.0.1:4336/');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();
 for(const [n,v,t] of [['desktop',{width:1366,height:850},false],['mobile',{width:390,height:844},true]]){
  const c=await browser.newContext({viewport:v,hasTouch:t,isMobile:t}),p=await c.newPage();await p.goto(base+'estudio');await p.waitForSelector('.study-main');await p.waitForTimeout(600);
  await p.getByRole('button',{name:/Cálculos/}).click();await p.waitForTimeout(700);await p.screenshot({path:path.join(out,`calc-${n}.png`),fullPage:true});await c.close();}
 await browser.close();})();
