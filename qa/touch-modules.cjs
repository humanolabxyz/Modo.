/* Comprobación manual de gestos táctiles (pan y pellizco) en los módulos del laboratorio, con eventos reales de CDP. */
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4336/').replace(/\/?$/,'/');
(async()=>{
  const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),page=await context.newPage(),cdp=await context.newCDPSession(page);
  await page.goto(base+'laboratorio?tool=schematic');await page.waitForSelector('.lab-pan');await page.waitForTimeout(900);
  const t=()=>page.locator('.lab-pan-content').evaluate(el=>el.style.transform),touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({x:p[0],y:p[1],id:i}))});
  const t0=await t();
  await touch('touchStart',[[200,450]]);for(let i=1;i<=8;i++){await touch('touchMove',[[200-i*14,450-i*4]]);await page.waitForTimeout(16);}await touch('touchEnd',[]);await page.waitForTimeout(100);
  const t1=await t();assert.notEqual(t0,t1,'un dedo desplaza el lienzo');
  const scale=s=>Number(/scale\(([\d.]+)\)/.exec(s)[1]);
  await touch('touchStart',[[150,450],[250,450]]);for(let i=1;i<=8;i++){await touch('touchMove',[[150-i*10,450],[250+i*10,450]]);await page.waitForTimeout(16);}await touch('touchEnd',[]);await page.waitForTimeout(200);
  const t2=await t();assert.ok(scale(t2)>scale(t1)*1.3,`el pellizco acerca (${scale(t1).toFixed(2)} → ${scale(t2).toFixed(2)})`);
  console.log('gestos táctiles correctos',scale(t1).toFixed(2),'→',scale(t2).toFixed(2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
