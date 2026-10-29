const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.B||'http://127.0.0.1:4455';
const check=()=>{
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const [r,g,b,a=1]=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r,g,b,a}};
 const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
 const bgOf=el=>{const layers=[];let n=el,unknown=false;while(n&&n.nodeType===1){const cs=getComputedStyle(n);if(cs.backgroundImage!=='none'&&!/^url/.test(cs.backgroundImage)){unknown=true;} const c=parse(cs.backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=1)break}n=n.parentElement}
  let base={r:247,g:248,b:251,a:1};for(let i=layers.length-1;i>=0;i--)base=over(layers[i],base);return {base,unknown}};
 const out=[];const seen=new Set();
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(w.nextNode()){const t=w.currentNode;const txt=t.textContent.trim();if(!txt)continue;const el=t.parentElement;if(!el||seen.has(el))continue;seen.add(el);
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)continue;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;
  let op=1,n=el;while(n&&n.nodeType===1){op*=+getComputedStyle(n).opacity;n=n.parentElement}
  const fg=parse(cs.color);if(!fg)continue;const {base,unknown}=bgOf(el);const f=over({...fg,a:fg.a*op},base);
  const L1=lum(f),L2=lum(base);const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const size=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700;const large=size>=24||(size>=18.66&&bold);
  const need=large?3:4.5;if(ratio<need)out.push({txt:txt.slice(0,40),ratio:+ratio.toFixed(2),need,size,cls:(el.className||el.tagName).toString().slice(0,50),color:cs.color,unknown});
 }
 return out;
};
(async()=>{
 const b=await chromium.launch();const all={};
 for(const [name,w,h] of [['d',1440,900],['m',390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},serviceWorkers:'block'});
  await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});
  const p=await c.newPage();
  for(const r of ['comunidad','legal','versiones','estudio']){
   await p.goto(base+'/'+r+'/',{waitUntil:'load'});await p.waitForTimeout(2500);
   all[r+'-'+name]=await p.evaluate(check);
   if(r==='estudio'){
    await p.locator('.campus-course').first().click();await p.waitForTimeout(1500);
    await p.locator('.course-unit>summary').first().click().catch(()=>{});await p.waitForTimeout(600);
    all['estudio-ramo-'+name]=await p.evaluate(check);
    await p.screenshot({path:`qa/identidad-audit/new-estudio-unidad-${name}.png`});
    for(const [k,sel] of [['clase1','text=Clase 1'],['clase3','text=Clase 3']]){
     await p.locator('text=Estudiar').first().click().catch(()=>{});await p.waitForTimeout(2500);
     all['estudio-leccion-'+name]=await p.evaluate(check);
     await p.screenshot({path:`qa/identidad-audit/new-estudio-leccion-${name}.png`});break;}
   }
  }
  await c.close();
 }
 await b.close();
 for(const k in all){console.log('\n##',k,all[k].length,'fallos');const m=new Map();all[k].forEach(i=>{const key=i.cls+'|'+i.color;if(!m.has(key))m.set(key,i)});[...m.values()].slice(0,25).forEach(i=>console.log(` ${i.ratio}<${i.need} ${i.size}px "${i.txt}" .${i.cls} ${i.color}${i.unknown?' (fondo con gradiente)':''}`))}
})();
