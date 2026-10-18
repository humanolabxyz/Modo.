const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch();try{
 const document=JSON.parse(fs.readFileSync(path.join(__dirname,'fase2/practica-exportada.json')));document.mode='free';document.stepIndex=0;
 const context=await browser.newContext({viewport:{width:1920,height:1080}});
 await context.addInitScript(doc=>localStorage.setItem('panellab-practice-v2',JSON.stringify(doc)),document);
 const page=await context.newPage();await page.goto('http://127.0.0.1:4322/');await page.waitForFunction(()=>document.querySelector('astro-island')?.hasAttribute('ssr')===false);await page.getByRole('button',{name:'Continuar práctica'}).click();await page.getByRole('button',{name:'Comparar',exact:true}).click();await page.getByRole('button',{name:'Mi diagrama',exact:true}).click();await page.getByRole('button',{name:'Ajustar al tablero'}).click();await page.locator('.work-card').screenshot({path:path.join(__dirname,'fase2/workbench-cables.png')});
 await page.locator('.cables-menu>summary').click();await page.getByRole('combobox',{name:'Seleccionar un cable'}).selectOption(document.wires[0].id);await page.locator('.cables-menu>summary').click();await page.locator('.work-card').screenshot({path:path.join(__dirname,'fase2/inspector-cable.png')});
 console.log('Captured actual V2 controls in an isolated QA practice.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
