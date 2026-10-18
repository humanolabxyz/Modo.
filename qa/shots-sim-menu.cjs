/* Captura del menú de simulación del panel en móvil y escritorio. */
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4324/');
(async()=>{const b=await chromium.launch();
 for(const [n,v,t] of [['mobile',{width:390,height:844},true],['desktop',{width:1366,height:800},false]]){
  const c=await b.newContext({viewport:v,hasTouch:t,isMobile:t}),p=await c.newPage();await p.goto(base+'?view=simulator');await p.waitForTimeout(1500);
  await p.getByLabel('Simular mando de 24 V',{exact:true}).click();await p.getByLabel('Opciones de simulación',{exact:true}).click();await p.waitForTimeout(400);
  await p.screenshot({path:`qa/calculos/despues/sim-menu-${n}.png`});await c.close();}
 await b.close();})();
