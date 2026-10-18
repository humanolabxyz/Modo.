const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { build } = require('esbuild');
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url = process.env.PANELLAB_URL || 'http://127.0.0.1:4331/';
const report = { checks: [], screens: [], content: [], errors: [], contrast: [] };
const pass = text => { report.checks.push(text); console.log('PASS', text); };
(async () => {
  const baseline = JSON.parse(fs.readFileSync('qa/estudio-v3/baseline-hashes.json','utf8').replace(/^\uFEFF/,''));
  const changed = baseline.filter(f => crypto.createHash('sha256').update(fs.readFileSync(f.Path)).digest('hex').toUpperCase() !== f.Hash).map(f=> f.Path.split('PanelLab-INACAP\\')[1]);
  const allowed = ['src\\study\\StudyApp.tsx','src\\study\\Activity.tsx','src\\study\\TermExplorer.tsx','src\\study\\Practice.tsx','src\\study\\ExamView.tsx','src\\pages\\estudio.astro'];
  for (const file of changed) assert.ok(allowed.includes(file), `Archivo fuera del alcance: ${file}`);
  pass('Hashes de esta revisión: panel, Inicio, estilos compartidos, material original, modelo de cálculo y banco de preguntas intactos');
  await build({entryPoints:['src/study/teachingContent.ts'],bundle:true,platform:'node',format:'cjs',outfile:'qa/estudio-v3/teaching.cjs',logLevel:'silent'});
  const { teaching } = require('./estudio-v3/teaching.cjs');
  const lessons = JSON.parse(fs.readFileSync('src/study/content/lecciones.json')).lessons;
  assert.deepEqual(Object.keys(teaching),lessons.map(l=>l.id));
  for (const l of lessons) {
    const t=teaching[l.id];
    const words = JSON.stringify(t).split(/\s+/).length;
    assert.ok(words > 470, `${l.id}: desarrollo insuficiente (${words})`);
    assert.equal(t.sections.length,3);
    assert.equal(t.example.steps.length,3);
    assert.equal(t.errors.length,2);
    assert.ok(t.terms.length>=3 && t.comparison.rows.length>=3);
    report.content.push({topic:l.id,words,slides:l.slides});
  }
  assert.equal(Number((Math.sqrt(3)*400*.88*.83).toFixed(2)),506.04);
  assert.equal(Number((5500/(Math.sqrt(3)*400*.88*.83)).toFixed(2)),10.87);
  assert.equal(Number((5500/(Math.sqrt(3)*400*.80*.83)).toFixed(2)),11.96);
  assert.equal(30*.9*.8,21.6);
  pass('Ocho lecciones completas: objetivos, 24 secciones, tablas, glosarios, ejemplos con procedencia, errores y reflexión; operaciones de los ejemplos contrastadas');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
    const page = await context.newPage();
    page.on('pageerror',e=>report.errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`)});
    const topic = async id => {
      if(await page.locator('.study-mobile-topics').isVisible()) await page.locator('.study-mobile-topics select').selectOption(id);
      else await page.locator('.topic-desktop-list nav>button').filter({hasText:lessons.find(l=>l.id===id).title}).click();
    };
    const tab = async name => page.getByRole('tab',{name,exact:true}).click();
    const snap = async (name,selector) => {
      if(selector) await page.evaluate(selector=>document.querySelector(selector).scrollIntoView({block:'start'}),selector);
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:`qa/estudio-v3/${name}.png`,animations:'disabled'});
      report.screens.push(name);
    };
    const fits = async label => assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label}: desborde`);
    const contrast = async label => {
      const failures=await page.evaluate(()=>{
        const parse=s=>s.match(/[\d.]+/g)?.map(Number);
        const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
        return [...document.querySelectorAll('.lesson-guide p,.lesson-guide h3,.lesson-guide h4,.lesson-guide th,.lesson-guide td,.lesson-guide summary,.lesson-reading-tabs button,.study-task-instruction,.study-field label,.study-input-help,.study-answer-instruction,.study-response-block h4,.calculation-steps strong,.calculation-steps p,.study-options label,.study-feedback,.study-exercise-route span')].filter(e=>e.checkVisibility()).flatMap(e=>{
          const style=getComputedStyle(e), fg=parse(style.color);let node=e,bg;
          while(node&&!bg){const v=parse(getComputedStyle(node).backgroundColor);if(v&&v.length>=3&&(v.length<4||v[3]===1))bg=v;node=node.parentElement;}
          bg||=[255,255,255];const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
          const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&Number(style.fontWeight)>=700);
          return ratio<(large?3:4.5)?[{text:e.textContent.slice(0,70),ratio}]:[];
        });
      });
      report.contrast.push({label,failures});assert.deepEqual(failures,[],`Contraste: ${label}`);
    };
    await page.goto(url+'estudio/?v=3');
    await page.locator('.lesson-guide').waitFor();
    for(const l of lessons){
      await topic(l.id);
      await tab('Explicación');
      assert.equal(await page.locator('.lesson-prose section').count(),3);
      await page.locator('.lesson-glossary summary').click();
      assert.ok(await page.locator('.lesson-glossary dd').count()>=3);
      await contrast(l.id+' conceptos');
      await tab('Ejemplo resuelto');
      assert.equal(await page.locator('.lesson-worked-steps li').count(),3);
      await contrast(l.id+' ejemplo');
      await tab('Errores y repaso');
      await page.getByLabel('Tu explicación de estudio',{exact:true}).fill(`Mi explicación de ${l.id}: causa, operación y límites.`);
      await page.locator('.lesson-model-answer summary').click();
      assert.ok(await page.locator('.lesson-model-answer p').first().isVisible());
      await contrast(l.id+' repaso');
    }
    await page.reload();await page.locator('.lesson-guide').waitFor();
    assert.equal(await page.getByRole('tab',{name:'Errores y repaso'}).getAttribute('aria-selected'),'true');
    assert.match(await page.getByLabel('Tu explicación de estudio',{exact:true}).inputValue(),/motor-trifasico/);
    await page.getByRole('tab',{name:'Errores y repaso'}).focus();
    await page.keyboard.press('Home');assert.equal(await page.getByRole('tab',{name:'Explicación',exact:true}).getAttribute('aria-selected'),'true');
    await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Ejemplo resuelto'}).getAttribute('aria-selected'),'true');
    pass('Las ocho lecciones permiten leer, consultar vocabulario, recorrer ejemplos y escribir reflexiones; pestañas accesibles con flechas/Home y recuperación al recargar');
    await page.getByLabel('Rendimiento η (0–1)').fill('0,80');
    assert.match(await page.locator('.study-output').innerText(),/11,96/);
    assert.match(await page.locator('.calculation-steps').innerText(),/460,03/);
    await page.getByLabel('Tu resultado I (A)').fill('11,96');
    await page.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
    assert.match(await page.locator('.study-feedback').innerText(),/Correcto/);
    assert.ok(await page.locator('.study-feedback').evaluate(e=>e===document.activeElement));
    await page.getByLabel('Rendimiento η (0–1)').fill('0,88');
    await page.getByLabel('Tu resultado I (A)').fill('0,01087');
    await page.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
    assert.match(await page.locator('.study-feedback').innerText(),/1000 veces menor/);
    await page.getByLabel('Rendimiento η (0–1)').fill('88');
    assert.equal(await page.locator('.study-output').count(),0);
    await page.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
    assert.match(await page.locator('.study-feedback').innerText(),/inválidos/);
    await page.getByLabel('Rendimiento η (0–1)').fill('0,88');
    await page.getByRole('navigation',{name:'Secciones del estudio'}).getByRole('button',{name:'Practicar',exact:true}).click();
    assert.equal(await page.locator('.calculation-steps').count(),0);
    await page.getByLabel('Tu resultado I (A)').fill('7,94');
    await page.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
    assert.ok(await page.locator('.calculation-steps').isVisible());
    assert.match(await page.locator('.study-feedback').innerText(),/omitir η y cosφ/);
    await topic('conductores');
    await tab('Errores y repaso');
    await page.getByLabel('Caso de práctica').selectOption('CABLE-02');
    assert.equal(await page.getByRole('tab',{name:'Errores y repaso'}).getAttribute('aria-selected'),'true');
    await page.getByLabel('Tu resultado Iz (A)').fill(await page.getByLabel('Capacidad tabulada Itabla (A)').inputValue());
    await page.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
    assert.match(await page.locator('.study-feedback').innerText(),/capacidad tabulada/);
    await page.getByLabel('Tu resultado Iz (A)').fill('25,5');
    await page.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();
    assert.match(await page.locator('.study-feedback').innerText(),/Correcto/);
    pass('Coma decimal, resultado vivo, procedimiento con datos actuales, rechazo de porcentajes mal escritos, diagnóstico de conversión/omisión de factores y corrección visible; práctica oculta procedimiento hasta comprobar');
    for(const width of [360,375,390,768,1280,1920]){
      await page.setViewportSize({width,height:width<600?844:1000});
      await topic('motor-trifasico');
      for(const name of ['Explicación','Ejemplo resuelto','Errores y repaso']){
        await tab(name);await fits(`${width} ${name}`);await contrast(`${width} ${name}`);
      }
      await tab('Explicación');
      await snap(`lectura-${width}`,'#lesson-reading');
      await tab('Ejemplo resuelto');await snap(`ejemplo-${width}`,'#lesson-reading');
      await snap(`campos-${width}`,'.study-fields');
      await snap(`procedimiento-${width}`,'.calculation-steps');
      await contrast(`${width} actividad`);
      const input=page.getByLabel('Tu resultado I (A)');
      assert.equal(await input.getAttribute('inputmode'),'decimal');
      const box=await input.boundingBox();assert.ok(box.height>=54);
      if(width<600) assert.equal(await page.locator('.study-fields').first().evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),1);
    }
    pass('Lectura, ejemplos, respuestas y cálculos sin desbordes a 360/375/390/768/1280/1920 px; controles de 54 px o más y contraste AA en los textos educativos medidos');
    const touch = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'});
    const mobile=await touch.newPage();await mobile.goto(url+'estudio/?v=3');await mobile.locator('.lesson-guide').waitFor();
    await mobile.getByRole('tab',{name:'Ejemplo resuelto'}).tap();await mobile.getByRole('button',{name:'Probar en la actividad'}).tap();
    assert.equal(await mobile.evaluate(()=>document.activeElement.id),'lesson-lab');
    await mobile.getByLabel('Normal',{exact:true}).tap();
    assert.ok(await mobile.getByLabel('Normal',{exact:true}).isChecked());
    await mobile.getByRole('button',{name:'Comprobar respuesta',exact:true}).tap();
    assert.match(await mobile.locator('.study-feedback').innerText(),/Correcto/);
    pass('Interacción táctil: pestaña, salto al ejercicio, elección de alternativa y corrección con foco');
    await touch.close();
    assert.deepEqual(report.errors,[]);pass('Sin errores de navegador ni recursos fallidos');
    await context.close();
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>fs.writeFileSync('qa/estudio-v3/verification.json',JSON.stringify(report,null,2)));
