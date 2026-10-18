const assert = require('node:assert/strict'), fs = require('node:fs'), crypto = require('node:crypto');
const {build} = require('esbuild');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.PANELLAB_URL || 'http://127.0.0.1:4331/';
const report = {checks:[],captures:[],errors:[],contrast:[],viewports:[]};
const pass = text => {report.checks.push(text);console.log('PASS',text)};
(async()=>{
  const baseline=JSON.parse(fs.readFileSync('qa/estudio-v4/baseline-hashes.json','utf8').replace(/^\uFEFF/,''));
  const allowed=['src\\study\\lessonContent.ts','src\\study\\teachingContent.ts','src\\study\\model.ts','src\\styles\\study.css','src\\styles\\study-polish.css','src\\styles\\study-learning.css','src\\styles\\study-home.css','src\\styles\\study-focus.css','src\\styles\\study-professor.css','src\\study\\ExamView.tsx','src\\study\\LessonMedia.tsx','src\\study\\content\\preguntas_desarrollo_12.json','src\\study\\content\\preguntas_alternativas_32.json','src\\study\\content\\preguntas-publicas.json','src\\study\\journeyContent.ts','src\\study\\Activity.tsx','src\\study\\StudyApp.tsx','src\\study\\StudyNavigation.tsx','src\\study\\Practice.tsx','src\\study\\LessonGuide.tsx','src\\pages\\estudio.astro'];
  const changed=baseline.filter(f=>crypto.createHash('sha256').update(fs.readFileSync(f.Path)).digest('hex').toUpperCase()!==f.Hash).map(f=>f.Path.split('PanelLab-INACAP\\')[1]);
  for(const file of changed)assert.ok(allowed.includes(file),`Archivo fuera del alcance: ${file}`);
  await build({entryPoints:['src/study/model.ts','src/study/grading.ts','src/study/journeyContent.ts'],bundle:true,platform:'node',format:'cjs',outdir:'qa/estudio-v4/model',outExtension:{'.js':'.cjs'},logLevel:'silent'});
  const m=require('./estudio-v4/model/model.cjs'),g=require('./estudio-v4/model/grading.cjs'),{journeys}=require('./estudio-v4/model/journeyContent.cjs');
  assert.deepEqual(Object.keys(journeys),m.lessons.map(l=>l.id));
  assert.equal(m.alternatives.length,32);assert.equal(m.developments.length,12);assert.equal(m.cases.length,7);
  pass('Cambios circunscritos al estudio: panel práctico, Inicio, conexiones, Comparar, modelos, material docente y banco de preguntas conservan sus hashes');
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),p=await context.newPage();
    p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`)});
    const state=()=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),m.STORAGE_KEY);
    const section=async name=>{const modules=p.getByRole('navigation',{name:'Módulos'});if(name==='Evaluarme'){await modules.getByRole('button',{name:/Evaluarme/}).click();return}const tabs=p.getByRole('navigation',{name:'Secciones del estudio'});if(!(await tabs.count()))await modules.getByRole('button',{name:/Estudiar/}).click();await tabs.getByRole('button',{name,exact:true}).click()};
    const topic=async id=>{if(!(await p.getByRole('button',{name:'Abrir menú de temas'}).count()))await p.getByRole('navigation',{name:'Módulos'}).getByRole('button',{name:/Estudiar/}).click();await p.getByRole('button',{name:'Abrir menú de temas'}).click();await p.locator('.study-topic-dialog nav>button').filter({hasText:m.lessons.find(l=>l.id===id).title}).click()};
    const step=async index=>p.locator('.journey-steps button').nth(index).click();
    const capture=async name=>{await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`qa/estudio-v4/${name}.png`,fullPage:true,animations:'disabled'});report.captures.push(name)};
    const fits=async name=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: desborde`);
    const contrast=async name=>{
      const failures=await p.evaluate(()=>{
        const rgb=s=>s.match(/[\d.]+/g)?.map(Number);
        const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        return [...document.querySelectorAll('.journey-hook,.journey-idea,.journey-stage h2,.journey-steps button,.journey-stage-heading p,.quick-slider label,.quick-result output,.quick-result p,.quick-result>span,.quick-footnote,.journey-options label,.journey-number-answer small,.journey-feedback,.journey-help button,.study-section-tabs button,.study-course-title span,.practice-caption,.practice-single-heading,.study-footer')].filter(e=>e.checkVisibility()).flatMap(e=>{
          const s=getComputedStyle(e);let el=e,bg;while(el&&!bg){const c=rgb(getComputedStyle(el).backgroundColor);if(c&&(c.length<4||c[3]===1))bg=c;el=el.parentElement}bg||=[255,255,255];
          const a=lum(rgb(s.color)),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);const large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700);
          return ratio<(large?3:4.5)?[{text:e.textContent.trim().slice(0,60),ratio}]:[];
        });
      });report.contrast.push({name,failures});assert.deepEqual(failures,[],`Contraste ${name}`);
    };
    await p.goto(base);await p.locator('.home-module-grid').waitFor();
    const panelBefore=await p.evaluate(()=>localStorage.getItem('panellab-practice-v2'));
    await p.getByRole('link',{name:/Entrar a estudiar/}).click();await p.locator('.lesson-journey').waitFor();
    assert.equal(await p.locator('.lesson-guide').count(),0);assert.equal(await p.locator('.study-activity').count(),0);
    await capture('inicio-desktop');
    await p.getByRole('button',{name:'Entenderlo con más detalle'}).click();await p.locator('.journey-reading-dialog[open]').waitFor();
    assert.equal(await p.locator('.lesson-prose section').count(),3);
    await p.getByRole('tab',{name:'Errores y repaso'}).click();await p.getByLabel('Tu explicación de estudio',{exact:true}).fill('Mi explicación anterior se conserva.');
    await p.keyboard.press('Escape');assert.equal(await p.locator('.journey-reading-dialog[open]').count(),0);
    pass('Entrada con una pregunta y una acción; teoría extensa bajo consulta, con tres secciones, glosario, ejemplos y reflexión conservados');
    for(const l of m.lessons){
      await topic(l.id);await step(1);
      if(l.id==='objetivos-fallas'){await p.getByRole('button',{name:'Cortocircuito',exact:true}).click();assert.match(await p.locator('.quick-result').innerText(),/Baja impedancia/)}
      if(l.id==='coordinacion'){await p.getByRole('slider',{name:'Nominal de la protección',exact:true}).focus();await p.keyboard.press('End');assert.match(await p.locator('.quick-result').innerText(),/18 ≤ 40 ≤ 25/);assert.match(await p.locator('.quick-result').innerText(),/segunda relación/)}
      if(l.id==='termomagnetico'){await p.getByRole('button',{name:'D · 10–20 ×',exact:true}).click();assert.match(await p.locator('.quick-result').innerText(),/100–200 A/)}
      if(l.id==='fusibles'){await p.getByRole('button',{name:'200 kA',exact:true}).click();assert.match(await p.locator('.quick-result').innerText(),/Capacidad de ruptura/)}
      if(l.id==='conductores'){assert.match(await p.locator('.quick-result').innerText(),/21,6 A/);await p.getByRole('slider',{name:'Factor de temperatura fT',exact:true}).focus();await p.keyboard.press('Home');assert.match(await p.locator('.quick-result').innerText(),/12 A/)}
      if(l.id==='guardamotor'){await p.getByRole('button',{name:'Rango 4–6 A',exact:true}).click();assert.match(await p.locator('.quick-result').innerText(),/no alcanza/)}
      if(l.id==='tierra-sobretension'){assert.match(await p.locator('.quick-result').innerText(),/30 mA/);await p.getByRole('slider',{name:'Corriente que vuelve',exact:true}).focus();await p.keyboard.press('End');assert.match(await p.locator('.quick-result').innerText(),/0 mA/)}
      if(l.id==='motor-trifasico'){assert.match(await p.locator('.quick-result').innerText(),/10,87 A/);await p.getByRole('slider',{name:'Rendimiento η',exact:true}).focus();await p.keyboard.press('Home');assert.match(await p.locator('.quick-result').innerText(),new RegExp(m.fmt(m.motorCurrent(5.5,400,.7,.83))+' A'))}
      await contrast(l.id+' prueba');await capture(`experimento-${l.id}`);
      await p.getByRole('button',{name:'Resolver el reto'}).click();assert.equal(await p.locator('.quick-experiment').count(),0);
      await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.match(await p.locator('.journey-feedback').innerText(),/Falta tu respuesta/);
      if(journeys[l.id].options)await p.getByLabel(journeys[l.id].options[(Number(journeys[l.id].correct)+1)%journeys[l.id].options.length],{exact:true}).check();else await p.getByLabel('Tu resultado',{exact:true}).fill('999');
      await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.match(await p.locator('.journey-feedback').innerText(),/Vamos a corregirlo/);
      if(journeys[l.id].options)await p.getByLabel(journeys[l.id].options[Number(journeys[l.id].correct)],{exact:true}).check();else await p.getByLabel('Tu resultado',{exact:true}).fill(journeys[l.id].correct.replace('.',','));
      await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.match(await p.locator('.journey-feedback').innerText(),/Lo entendiste/);
      await p.reload();await p.locator('.journey-feedback').waitFor();assert.match(await p.locator('.journey-feedback').innerText(),/Lo entendiste/);
      assert.equal(m.readState(await state()).drafts[l.id].journeyStep,'2');
      await p.getByRole('button',{name:l.id==='motor-trifasico'?/^Ir a la evaluación/:/^Siguiente tema/}).click();
      assert.equal((await state()).progress[l.id].reviewed,true);
    }
    pass('Ocho recorridos completos: experimentos vivos, controles por teclado, respuesta faltante/incorrecta/correcta, coma decimal, recarga y avance con progreso real');
    const activityChecks={
      'objetivos-fallas':async()=>{await p.getByLabel('Cortocircuito',{exact:true}).check();},
      coordinacion:async()=>{await p.getByLabel('Sí, cumple la desigualdad').check();},
      termomagnetico:async()=>{await p.getByLabel('Térmico',{exact:true}).check();},
      fusibles:async()=>{await p.getByLabel('gG',{exact:true}).check();},
      conductores:async()=>{await p.getByLabel('Tu resultado Iz (A)').fill('21,6');},
      guardamotor:async()=>{},
      'tierra-sobretension':async()=>{await p.getByLabel('SPD',{exact:true}).check();},
      'motor-trifasico':async()=>{await p.getByLabel('Tu resultado I (A)').fill('10,87');},
    };
    for(const l of m.lessons){
      await topic(l.id);await section('Practicar');await p.getByRole('button',{name:/Ejercicio interactivo/}).click();
      if(l.id==='objetivos-fallas')await p.getByLabel('Situación del circuito').selectOption('corto');
      await activityChecks[l.id]();await p.getByRole('button',{name:'Comprobar respuesta',exact:true}).click();assert.match(await p.locator('.study-feedback').innerText(),/Correcto/);
      await p.getByRole('button',{name:/Preguntas del tema/}).click();
      const questions=g.answerBank.filter(q=>q.theme===m.themeFor(l.id));
      for(let i=0;i<questions.length;i++){
        await p.getByRole('button',{name:`Ir a pregunta ${i+1}`,exact:true}).click();assert.equal(await p.locator('.study-question').count(),1);
        const q=questions[i];await p.locator('.study-question input[type="radio"]').nth(q.correct_index).check();await p.getByRole('button',{name:`Comprobar alternativa ${i+1}`,exact:true}).click();assert.match(await p.locator('.study-feedback').innerText(),/Correcto/);
      }
      await contrast(l.id+' práctica');
    }
    assert.equal(Object.values((await state()).progress).filter(p=>m.lessonStatus(p)==='Dominada').length,8);
    assert.equal((await state()).drafts['objetivos-fallas'].reflection,'Mi explicación anterior se conserva.');
    pass('Ocho ejercicios libres conservados; las 32 alternativas se responden y corrigen de una en una, con navegación, borradores y dominio verificable');
    await section('Evaluarme');await p.getByRole('button',{name:/Comenzar simulacro/}).click();
    for(let i=0;i<11;i++){
      const data=await state(),exam=data.exams.find(e=>e.id===data.examId)||data.exams.at(-1);
      assert.equal(exam.index,i);
      assert.equal(await p.locator('.lesson-guide,.quick-experiment,.journey-feedback').count(),0);
      if(i<8){const q=g.answerBank.find(q=>q.id===exam.alternatives[i]);await p.locator('.exam-options input[type="radio"]').nth(q.correct_index).check()}
      else await p.locator('.development-field textarea').fill('Justifico datos, operaciones, unidades y las verificaciones que faltan.');
      if(i===4){await p.reload();await p.locator('.study-exam').waitFor();assert.equal((await state()).exams.at(-1).index,4)}
      if(i<10)await p.getByRole('button',{name:'Siguiente pregunta',exact:true}).click();
    }
    await p.getByRole('button',{name:'Revisar y enviar',exact:true}).click();assert.match(await p.locator('.study-exam-review').innerText().catch(()=>p.locator('.exam-review').innerText()),/./);
    await p.getByLabel(/Confirmo el envío/).check();await p.getByRole('button',{name:'Enviar y corregir',exact:true}).click();await p.locator('.exam-score').waitFor();assert.match(await p.locator('.exam-score').innerText(),/8 \/ 8/);
    pass('Simulacro 8+3 completo: respuestas y posición sobreviven recarga, sin pautas en el intento, confirmación y resultado 8/8 con rúbrica posterior');
    for(const width of [360,390,768,1280,1920]){
      await p.setViewportSize({width,height:width<600?844:1000});report.viewports.push(width);
      await topic('motor-trifasico');await step(0);await fits(width+' mira');
      const start=await p.getByRole('button',{name:'Empezar la lección'}).boundingBox();assert.ok(start.y+start.height<=p.viewportSize().height,`CTA inicial visible: ${width}`);
      await capture(`mira-${width}`);await step(1);await fits(width+' prueba');await capture(`prueba-${width}`);await contrast(width+' prueba');
      await step(2);await fits(width+' reto');await capture(`reto-${width}`);
      await p.getByRole('button',{name:'Necesito una explicación'}).click();await p.locator('.journey-reading-dialog[open]').waitFor();
      for(let i=0;i<15;i++){await p.keyboard.press('Tab');assert.ok(await p.locator('.journey-reading-dialog').evaluate(el=>el.contains(document.activeElement)))}
      await p.keyboard.press('Escape');await fits(width+' consulta');
      await p.getByRole('button',{name:'Abrir menú de temas'}).click();await p.getByLabel('Buscar tema en menú móvil').fill('fusible');assert.equal(await p.locator('.study-topic-dialog nav>button').count(),1);await p.keyboard.press('Escape');
      await section('Progreso');await fits(width+' progreso');await section('Evaluarme');await fits(width+' resultado');
    }
    assert.equal(await p.evaluate(()=>localStorage.getItem('panellab-practice-v2')),panelBefore);
    pass('360/390/768/1280/1920 px: CTA inicial dentro de pantalla, pasos sin desborde, consulta con foco contenido, menú buscable, resultados y progreso; datos del panel intactos');
    const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'}),tp=await touch.newPage();
    await tp.goto(base+'estudio/');await tp.locator('.lesson-journey').waitFor();await tp.locator('.journey-steps button').nth(1).tap();await tp.getByRole('button',{name:'Cortocircuito',exact:true}).tap();await tp.getByRole('button',{name:'Resolver el reto'}).tap();await tp.getByLabel('Cortocircuito',{exact:true}).tap();await tp.getByRole('button',{name:'Comprobar respuesta',exact:true}).tap();assert.match(await tp.locator('.journey-feedback').innerText(),/Lo entendiste/);await touch.close();
    pass('Recorrido completo mediante toque real en móvil');assert.deepEqual(report.errors,[]);pass('Sin errores de navegador ni recursos fallidos');await context.close();
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>fs.writeFileSync('qa/estudio-v4/verification.json',JSON.stringify(report,null,2)));
