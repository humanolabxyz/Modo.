// Barrido de menús en celular y tableta. Uso: node qa/cabinet-fx/devices.cjs <prefijo>
const fs=require('node:fs');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4411',tag=process.argv[2]||'dev',out='qa/cabinet-fx/devices';fs.mkdirSync(out,{recursive:true});
const project=JSON.parse(fs.readFileSync('qa/cabinet/fixture-plc.modo.json','utf8'));
const sizes=[['phone',390,844,true],['phone-land',844,390,true],['tablet',768,1024,true],['tablet-land',1024,768,true]];
(async()=>{const b=await chromium.launch(),report=[];
for(const [name,w,h,touch] of sizes){
 const c=await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:w<700,deviceScaleFactor:2});
 await c.addInitScript(({project})=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');if(!localStorage.getItem('panellab-laboratory-v1'))localStorage.setItem('panellab-laboratory-v1',JSON.stringify({projects:[project],active:project.id}));},{project});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const tool of ['equipment','plc','schematic']){
  await p.goto(base+'/laboratorio?tool='+tool);await p.waitForTimeout(1400);
  const close=p.getByRole('button',{name:/^Cerrar (taller|orientaci|selecci)/});if(await close.count())await close.first().click().catch(()=>{});await p.waitForTimeout(300);
  await p.screenshot({path:`${out}/${tag}-${name}-${tool}.png`});
  const metrics=await p.evaluate(()=>{const vw=innerWidth,vh=innerHeight,bad=[];for(const el of document.querySelectorAll('button,a,select,summary,[role=button]')){const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none')continue;if(r.right>vw+1||r.left<-1||r.bottom>vh+1){bad.push((el.getAttribute('aria-label')||el.textContent||el.tagName).trim().slice(0,28)+` [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}]`);}}const small=[...document.querySelectorAll('button,a,select')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width&&r.height&&s.display!=='none'&&s.visibility!=='hidden'&&(r.width<40||r.height<40)&&r.top<vh&&r.bottom>0&&r.left<vw}).length;return {hscroll:document.documentElement.scrollWidth>vw+1,offscreen:bad.slice(0,6),smallTargets:small}});
  report.push({size:name,tool,...metrics});
 }
 report.push({size:name,errors});await c.close();}
fs.writeFileSync(`${out}/${tag}-report.json`,JSON.stringify(report,null,1));console.log(JSON.stringify(report,null,1));await b.close();})().catch(e=>{console.error(e);process.exit(1);});
