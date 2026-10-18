const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
await p.goto('http://127.0.0.1:4330/estudio/');await p.locator('.lesson-journey').waitFor();
const snap=async name=>{await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:`qa/estudio-v4/${name}.png`,animations:'disabled',fullPage:true})};
await snap('desktop-mira');await p.getByRole('button',{name:'Vamos a probar'}).click();await snap('desktop-prueba');await p.getByRole('button',{name:'Resolver el reto'}).click();await snap('desktop-resuelve');
await p.setViewportSize({width:390,height:844});await p.locator('.journey-steps button').nth(0).click();await snap('movil-mira');await p.getByRole('button',{name:'Vamos a probar'}).click();await snap('movil-prueba');
await p.getByRole('button',{name:'Abrir menú de temas'}).click();await p.locator('.study-topic-dialog nav>button').filter({hasText:'Motor trifásico'}).click();await p.getByRole('button',{name:'Vamos a probar'}).click();await snap('movil-motor');
await b.close()})().catch(e=>{console.error(e);process.exitCode=1});
