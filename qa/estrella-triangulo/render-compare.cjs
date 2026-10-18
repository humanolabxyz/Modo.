// Renderiza el dibujo transcrito con la misma transformación que la foto rectificada, para compararlos (ver compare.py).
// Uso: node qa/estrella-triangulo/render-compare.cjs   (con el servidor de desarrollo en :4323)
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const crops=require('./crops.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1700,height:1000}});
await p.goto(process.env.PANELLAB_URL||'http://127.0.0.1:4323/?view=simulator');await p.locator('.board-svg').waitFor();
await p.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await p.getByRole('button',{name:'Ampliar diagrama',exact:true}).click();
await p.getByRole('button',{name:'Estrella-triángulo',exact:true}).click();await p.getByRole('button',{name:'Todo',exact:true}).click();await p.waitForTimeout(500);
const inner=await p.evaluate(()=>{const s=document.querySelector('.cade-artboard svg');return [...s.children].filter(c=>c.tagName!=='rect'&&c.tagName!=='defs').map(c=>c.outerHTML).join('')});
for(const [name,c] of Object.entries(crops)){
 const html=`<html><body style="margin:0;background:#fff;color:#000"><svg xmlns="http://www.w3.org/2000/svg" width="${c.w}" height="${c.h}" viewBox="${c.vb.join(' ')}" style="display:block;background:#fff">${inner}</svg></body></html>`;
 await p.setViewportSize({width:c.w,height:c.h});await p.setContent(html);await p.screenshot({path:`qa/estrella-triangulo/cmp-${name}-mine.png`});
}
await b.close()})();
