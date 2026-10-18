/* Captura de la chuleta de fórmulas abierta y comprobación de que la evaluación no la ofrece. */
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4324/');
(async()=>{const b=await chromium.launch(),p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
 await p.goto(base+'estudio');await p.waitForSelector('.study-main');await p.waitForTimeout(500);
 await p.getByTitle('Fórmulas para recordar').click();await p.getByRole('button',{name:/Capacidad del cable/}).click();await p.waitForTimeout(300);await p.screenshot({path:'qa/calculos/despues/formulas-dock.png'});
 await p.keyboard.press('Escape');await p.getByRole('button',{name:/Evaluarme/}).click();await p.waitForTimeout(400);assert.equal(await p.getByTitle('Fórmulas para recordar').count(),0,'la evaluación no ofrece fórmulas');console.log('ok: sin fórmulas en la evaluación');await b.close();})();
