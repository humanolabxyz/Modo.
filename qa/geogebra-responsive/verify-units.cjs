const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch();try{
 for(const [width,height] of [[390,844],[844,390],[820,1180],[1180,820],[1440,960]]){
  const c=await b.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));const p=await c.newPage();
  await p.goto('http://localhost:4350/laboratorio?tool=geogebra');await p.getByRole('button',{name:'Lecciones',exact:true}).click();
  const picker=p.getByLabel('Unidad de las lecciones',{exact:true});assert.equal(await picker.locator('option').count(),4);
  for(const [unit,count] of [[1,2],[2,1],[3,0],[4,3]]){
   await picker.selectOption(String(unit));assert.match(await p.locator('.geo-lesson-catalog h2').innerText(),new RegExp('Unidad '+unit+':'));
   assert.equal(await p.locator('.geo-lesson-catalog section a').count(),count);
   assert.equal(await p.getByRole('link',{name:'Ver esta unidad en Estudio',exact:true}).getAttribute('href'),`/estudio?curso=s2-5&unidad=mtfm01-u${unit}`);
   if(unit===3)assert.ok(await p.getByText('Todavía no hay lecciones de GeoGebra para esta unidad.',{exact:true}).isVisible());
  }
  const dialog=p.getByRole('dialog',{name:'Lecciones y ejercicios',exact:true}),r=await dialog.boundingBox();assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=height+1);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.match(await dialog.evaluate(n=>getComputedStyle(n).fontFamily),/LabSource/);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`qa/geogebra-responsive/unidades-${width}.png`});
  await p.getByRole('link',{name:/Matrices: datos y operaciones/}).click();await p.getByRole('button',{name:'Lecciones',exact:true}).click();assert.equal(await picker.inputValue(),'4');assert.equal(await p.locator('.geo-lesson-catalog a[aria-current=page]').count(),1);
  console.log(`PASS ${width}x${height}: cuatro unidades, conteos 2/1/0/3, enlace a Estudio y selección de la unidad actual`);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
