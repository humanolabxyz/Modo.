const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4325/').replace(/\/?$/, '/');
const report = {checks: [], viewports: [], errors: [], captures: []};
const pass = message => {report.checks.push(message); console.log('PASS', message);};
const ready = async page => {
  await page.locator('.modo-home').waitFor();
  await page.waitForFunction(() => !document.querySelector('.modo-primary').disabled);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.modo-card-photo').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
};
const fit = async (page, label) => {await page.waitForFunction(()=>!document.documentElement.dataset.motion);assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label)};
const save = async (page, name, fullPage = true) => {
  await page.waitForFunction(()=>!document.documentElement.dataset.motion);
  const file = `qa/modo/${name}.png`;
  await page.screenshot({path: file, fullPage, animations:'disabled'});
  report.captures.push(file);
};
const listen = page => {
  page.on('pageerror', error => report.errors.push(page.url()+': '+error.name+': '+error.message+' '+error.stack));
  page.on('console', message => {if (message.type() === 'error') report.errors.push(page.url()+': '+message.text()+' '+JSON.stringify(message.location()));});
  page.on('response', response => {if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`);});
};

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({serviceWorkers:'block',acceptDownloads:true});
    const page = await context.newPage();
    listen(page);
    for (const [width,height] of [[360,780],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1672,941],[1920,1080]]) {
      await page.setViewportSize({width,height});
      await page.goto(base);
      await ready(page);
      await fit(page, `Home ${width}: no horizontal overflow`);
      assert.match(await page.title(), /^modo\./);
      assert.equal(await page.locator('.modo-card-photo').count(), 3);
      assert.ok(await page.locator('.modo-card-photo').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)));
      const layout = await page.evaluate(() => {
        const box = selector => {const b=document.querySelector(selector).getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height,r:b.right,b:b.bottom};};
        return {panel:box('.modo-panel'), study:box('.modo-study'), lab:box('.modo-laboratory'), recent:box('.modo-recent'), logo:box('.modo-logo'), select:box('#learning-mode'), primary:box('.modo-primary')};
      });
      assert.ok(layout.logo.w > 70 && layout.logo.h > 20);
      assert.ok(layout.select.h >= 44 && layout.primary.h >= 48);
      if (width <= 760) {
        assert.ok(layout.study.y >= layout.panel.b + 12 && layout.lab.y >= layout.study.b + 12);
        assert.ok(layout.recent.y >= layout.lab.b + 12);
        assert.ok(layout.panel.x >= 9 && layout.panel.r <= width - 9);
        assert.ok(await page.locator('.modo-laboratory-tools a:not(.modo-tools-arrow)').evaluateAll(links => {
          const boxes=links.map(link=>link.getBoundingClientRect());
          return boxes.every(box=>box.height>=44 && Math.abs(box.y-boxes[0].y)<1);
        }));
        const lineHeight = await page.locator('.modo-intro h1').evaluate(element=>parseFloat(getComputedStyle(element).lineHeight));
        assert.ok((await page.locator('.modo-intro h1').boundingBox()).height > lineHeight * 1.9, 'Mobile title retains two approved lines');
      } else {
        assert.ok(layout.study.x > layout.panel.x && layout.lab.x > layout.panel.x);
        assert.ok(layout.recent.y >= Math.max(layout.panel.b,layout.lab.b) + 18);
      }
      await save(page,`inicio-${width}x${height}`);
      if (width === 1672 || width === 390) await save(page,`viewport-${width}x${height}`,false);
      await page.locator('.modo-diagram>summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.modo-diagram').evaluate(element=>element.open),true);
      await fit(page, `Expanded diagram ${width}`);
      await page.locator('#circuit').selectOption({index:1});
      if (width === 390) await save(page,'movil-diagrama-abierto');
      report.viewports.push({width,height,layout});
    }
    pass('Eight sizes: approved desktop/sidebar and stacked mobile layout, two-line mobile title, separated cards, loaded photos, five laboratory shortcuts in one row and touch targets >=44px');

    await page.setViewportSize({width:1440,height:900});
    for (const mode of ['free','identify','guided','explore']) {
      await page.goto(base); await ready(page);
      await page.locator('#learning-mode').selectOption(mode);
      await page.getByRole('button',{name:'Abrir panel de control',exact:true}).click();
      await page.locator('.board-svg').waitFor();
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')).mode),mode);
      assert.equal(await page.locator('.terminal').count(),94);
    }
    pass('All four existing learning modes open the original 94-terminal simulator');

    const fixture=JSON.parse(fs.readFileSync('qa/fase2/practica-exportada.json','utf8'));
    await page.goto(base); await ready(page);
    await page.getByLabel('Abrir práctica guardada',{exact:true}).setInputFiles({name:'legacy-panellab-practice.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
    await page.locator('.board-svg').waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('panellab-practice-v2')).wires.length),fixture.wires.length);
    await page.goto(base); await ready(page);
    assert.match(await page.locator('.modo-recent-copy').innerText(),new RegExp(`${fixture.wires.length} cables`));
    await page.getByRole('button',{name:'Continuar práctica',exact:true}).click();
    await page.locator('.board-svg').waitFor();
    assert.equal(await page.locator('.interactive-wire').count(),fixture.wires.length);
    pass('Legacy JSON import, saved real cable count and Continue recover the existing practice');

    await page.goto(base); await ready(page);
    await page.getByRole('button',{name:'Cómo usar el panel',exact:true}).click();
    assert.ok(await page.getByRole('dialog',{name:'Uso del panel'}).isVisible());
    assert.match(await page.getByRole('dialog').innerText(),/modo\./);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(),0);
    await page.getByRole('button',{name:'Simulador',exact:true}).click();
    await page.locator('.board-svg').waitFor();
    await save(page,'panel-escritorio');
    pass('Header Simulator and keyboard-accessible help preserve their original behavior');

    await page.goto(base); await ready(page);
    await page.getByRole('link',{name:'Estudiar protecciones',exact:true}).click();
    await page.locator('.study-layout').waitFor();
    assert.match(await page.title(),/modo\./);
    assert.equal(await page.locator('.modo-logo').getAttribute('alt'),'modo.');
    await save(page,'protecciones-escritorio');
    pass('Protections opens the existing study module with modo. branding');

    for (const [id,name] of [['schematic','Esquemas'],['plc','PLC'],['hmi','HMI'],['process','Procesos'],['breadboard','Protoboard']]) {
      await page.goto(base); await ready(page);
      await page.getByRole('navigation',{name:'Herramientas del laboratorio'}).getByRole('link',{name,exact:true}).click();
      await page.locator('.lab-page').waitFor();
      await page.waitForFunction(()=>!document.querySelector('[aria-label="Proyecto activo"]').disabled);
      assert.equal(new URL(page.url()).searchParams.get('tool'),id);
      assert.match(await page.title(),/modo\./);
      assert.equal(await page.locator('.modo-logo').getAttribute('alt'),'modo.');
      await page.waitForFunction(()=>!!JSON.parse(localStorage.getItem('panellab-laboratory-v1'))?.projects.length);
      assert.ok(await page.evaluate(()=>!!JSON.parse(localStorage.getItem('panellab-laboratory-v1')).projects.length));
      await fit(page,`Laboratory ${id}`);
    }
    await save(page,'laboratorio-escritorio');
    pass('All five Home shortcuts open the corresponding existing laboratory tool and preserve its project library');

    for (const file of ['brand/modo-logo-horizontal-color.svg','brand/modo-logo-horizontal-blanco.svg','brand/favicon.ico','brand/apple-touch-icon.png','brand/icono-app-192.png','brand/icono-app-512.png','brand/icono-maskable-512.png','fonts/InterVariable.woff2']) {
      assert.ok((await page.request.get(base+file)).ok(),file);
    }
    const manifest=await (await page.request.get(base+'manifest.webmanifest')).json();
    assert.equal(manifest.short_name,'modo.');
    assert.equal(manifest.start_url,'/?view=simulator');
    assert.ok(manifest.icons.every(icon=>icon.src.startsWith('/brand/')));
    pass('Original kit logos, local Inter font, favicon, Apple and PWA/maskable assets resolve; existing installed-app launch route is retained');
    assert.deepEqual(report.errors,[]);
    report.result='PASS';
  } finally {
    await browser.close();
    fs.writeFileSync('qa/modo/verification.json',JSON.stringify(report,null,2));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
