const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const scan=()=>{
 const hue=(r,g,b)=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(d<.08)return null;let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;return {h,s:d/(1-Math.abs(mx+mn-1)||1),l:(mx+mn)/2}};
 const bad=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const [R,G,B,A=1]=m[1].split(/[ ,\/]+/).map(Number);if(A<.35)return null;const x=hue(R,G,B);if(!x)return null;/* cian/azul petróleo y verde-azulado: 150°-215° salvo el azul de marca (≈229°) */return ((x.h>=150&&x.h<=215&&x.s>.2)||(x.h>=40&&x.h<150&&x.s>.12&&x.l>.8)||(x.h>=100&&x.h<150&&x.s>.2))?`${R},${G},${B}`:null};
 const out=new Map();
 for(const e of document.querySelectorAll('body *')){if(e.closest('svg,canvas,img,.lab-dmm-device,.lab-pan-content,.board,.stage,.diagram-svg,.cade-artboard'))continue;const r=e.getBoundingClientRect();if(r.width<8||r.height<8||r.bottom<0||r.top>innerHeight)continue;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
  for(const [k,v] of [['bg',cs.backgroundColor],['color',cs.color],['border',cs.borderTopColor]]){const c=bad(v);if(!c)continue;if(k==='border'&&cs.borderTopWidth==='0px')continue;if(k==='color'&&!e.childNodes.length)continue;const key=k+' '+c+' | '+(e.tagName+'.'+String(e.className).slice(0,34));if(!out.has(key))out.set(key,(e.textContent||'').trim().slice(0,22))}}
 return [...out].slice(0,26).map(([k,v])=>k+' "'+v+'"');
};
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>{localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1')});const p=await c.newPage();
const show=async(n)=>{const r=await p.evaluate(scan);console.log('##',n,r.length);r.forEach(x=>console.log(' ',x))};
await p.goto('http://127.0.0.1:4460/estudio/');await p.waitForTimeout(3000);await p.locator('.campus-course').first().click();await p.waitForTimeout(1500);await p.locator('.course-unit>summary').first().click();await p.waitForTimeout(500);await p.locator('text=Estudiar').first().click();await p.waitForTimeout(2500);
for(const [n,re] of [['entender',/^Entender/],['ejemplo',/Ver un ejemplo/],['practicar',/^Practicar/],['repasar',/Repasar errores/],['usar clase',/Usar en clase/],['desafio',/Desafío del ramo/]]){await p.getByRole('button',{name:re}).first().click().catch(()=>{});await p.waitForTimeout(900);await show(n)}
await b.close()})()
