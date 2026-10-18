/* Capturas de los menús del panel en móvil. Uso: node qa/shots-menus.cjs <carpeta> */
const fs=require('node:fs');const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4324/'),out=process.argv[2]||'qa/menus/antes';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch(),c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await c.newPage();
 await p.goto(base+'?view=simulator');await p.waitForTimeout(1500);await p.screenshot({path:`${out}/00-base.png`});
 const open=async(sel,name)=>{await p.locator(sel).first().tap();await p.waitForTimeout(450);await p.screenshot({path:`${out}/${name}.png`});await p.locator(sel).first().tap().catch(()=>{});await p.waitForTimeout(250);};
 await open('.practice-menu>summary','01-practica');
 await open('.cables-menu>summary','02-cables');
 await open('.dock-color>summary','03-color');
 await open('.module-filters>summary','04-modulos').catch(()=>{});
 await b.close();})().catch(e=>{console.error(e.message);process.exit(1)});
