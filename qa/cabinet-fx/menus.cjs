// Abre los menús y ventanas del laboratorio en celular y tableta y mide si caben. Uso: node qa/cabinet-fx/menus.cjs <prefijo>
const fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4411',tag=process.argv[2]||'menu',out='qa/cabinet-fx/devices';fs.mkdirSync(out,{recursive:true});
const plc=JSON.parse(fs.readFileSync('qa/cabinet/fixture-plc.modo.json','utf8'));
const sizes=[['phone',390,844],['phone-land',844,390],['tablet',768,1024],['tablet-land',1024,768]];
const fit=async(p,selector)=>p.evaluate(sel=>{const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;return {left:Math.round(r.left),top:Math.round(r.top),right:Math.round(r.right),bottom:Math.round(r.bottom),vw,vh,clipped:r.left<-1||r.top<-1||r.right>vw+1||r.bottom>vh+1,scrolls:el.scrollHeight>el.clientHeight+1};},selector);
(async()=>{const b=await chromium.launch(),report=[];
for(const [name,w,h] of sizes){
 const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<700,deviceScaleFactor:2});
 await c.addInitScript(({project})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-laboratory-v1'))localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[project],active:project.id}));},{project:plc});
 const p=await c.newPage();
 const step=async(label,action,selector)=>{try{await action();await p.waitForTimeout(500);const m=selector?await fit(p,selector):null;await p.screenshot({path:`${out}/${tag}-${name}-${label}.png`});report.push({size:name,menu:label,...m});}catch(e){report.push({size:name,menu:label,error:String(e.message).slice(0,90)});}};
 await p.goto(base+'/laboratorio?tool=equipment');await p.waitForTimeout(1400);
 const close=p.getByRole('button',{name:/^Cerrar (taller|orientaci|selecci)/});if(await close.count())await close.first().click().catch(()=>{});await p.waitForTimeout(300);
 await step('opciones',()=>p.getByRole('button',{name:'Opciones del proyecto'}).click(),'.lab-project-window,.floating-window');
 await p.keyboard.press('Escape');await p.waitForTimeout(300);const x1=p.getByRole('button',{name:'Cerrar opciones del proyecto'});if(await x1.count())await x1.click().catch(()=>{});
 await step('guia',()=>p.getByRole('button',{name:/Guía y propiedades/}).click(),'.lab-inspector,.lab-sheet,.floating-window');
 const x2=p.locator('.floating-window button[aria-label^="Cerrar"]');if(await x2.count())await x2.first().click().catch(()=>{});await p.waitForTimeout(300);
 await step('taller',()=>p.getByRole('button',{name:'Guía del taller'}).click(),'.floating-window,.cab-guide-window');
 await c.close();}
fs.writeFileSync(`${out}/${tag}-menus.json`,JSON.stringify(report,null,1));console.log(JSON.stringify(report));await b.close();})().catch(e=>{console.error(e);process.exit(1);});
