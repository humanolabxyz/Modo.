// Lección guiada por tarjetas: recorre las 40 tarjetas de los 8 temas con sus respuestas correctas.
const assert = require('node:assert/strict'), fs = require('node:fs');
const {build} = require('esbuild');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.PANELLAB_URL || 'http://127.0.0.1:4331/';
const pass = text => console.log('PASS', text);
(async () => {
  fs.mkdirSync('qa/estudio-v10', {recursive: true});
  await build({entryPoints: ['src/study/lessonCards.ts', 'src/study/model.ts'], bundle: true, platform: 'node', format: 'cjs', outdir: 'qa/estudio-v10/model', outExtension: {'.js': '.cjs'}, logLevel: 'silent'});
  const {lessonCards} = require('./estudio-v10/model/lessonCards.cjs');
  const m = require('./estudio-v10/model/model.cjs');
  assert.equal(m.lessons.length, 8);
  let total = 0;
  for (const l of m.lessons) {
    const cards = lessonCards[l.id];
    assert.ok(cards && cards.length === 5, `5 tarjetas en ${l.id}`);
    total += cards.length;
    for (const c of cards) {
      if (c.kind === 'choice') assert.ok(c.correct >= 0 && c.correct < c.options.length);
      if (c.kind === 'sort') assert.ok(c.items.every(i => i.bucket === 0 || i.bucket === 1));
      if (c.kind === 'match') assert.ok(c.pairs.length === 4 && new Set(c.pairs.map(p => p[1])).size === 4);
      if (c.kind === 'order') assert.ok(c.steps.length === 4);
      if (c.kind === 'learn' && c.reveal) assert.ok(c.reveal.length >= 2);
    }
    assert.ok(cards.some(c => c.kind === 'learn') && cards.some(c => c.kind !== 'learn'), 'mezcla explicación e interacción');
  }
  pass(`Contenido: ${total} tarjetas en 8 temas (5 por tema), con explicación e interacciones válidas`);

  const browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext({viewport: {width: 1280, height: 900}});
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await p.goto(base + 'estudio/');
  const topic = async id => {
    await p.getByRole('button', {name: 'Abrir menú de temas'}).click();
    await p.locator('.study-topic-dialog nav>button').filter({hasText: m.lessons.find(l => l.id === id).title}).click();
  };
  const next = async () => { const b = p.locator('.gl-next'); await b.waitFor(); await p.waitForFunction(() => !document.querySelector('.gl-next').disabled, null, {timeout: 4000}).catch(async () => { throw new Error('Siguiente sigue bloqueado en: ' + await p.locator('.gl-card h3').innerText()); }); await b.click(); };

  for (const l of m.lessons) {
    await topic(l.id);
    await p.locator('.journey-steps button').nth(0).click();
    await p.getByRole('button', {name: /Empezar la lección/}).click();
    const cards = lessonCards[l.id];
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      await p.locator('.gl-card h3').waitFor();
      assert.equal(await p.locator('.gl-card h3').innerText(), c.title);
      if (c.kind === 'learn') {
        if (c.reveal) {
          assert.equal(await p.locator('.gl-next').isDisabled(), true, 'bloqueado hasta tocar todo');
          const n = await p.locator('.gl-reveal-item > button').count();
          for (let k = 0; k < n; k++) await p.locator('.gl-reveal-item > button').nth(k).click();
        }
      } else if (c.kind === 'choice') {
        assert.equal(await p.locator('.gl-next').isDisabled(), true);
        const wrong = (c.correct + 1) % c.options.length;
        await p.locator('.gl-options label').nth(wrong).click();
        await p.getByRole('button', {name: 'Comprobar', exact: true}).click();
        await p.locator('.gl-feedback.is-retry').waitFor();
        await p.locator('.gl-options label').nth(c.correct).click();
        await p.getByRole('button', {name: 'Comprobar', exact: true}).click();
        await p.locator('.gl-feedback.is-correct').waitFor();
      } else if (c.kind === 'sort') {
        for (let k = 0; k < c.items.length; k++) await p.locator('.gl-sort li').nth(k).locator('button').nth(c.items[k].bucket).click();
        await p.getByRole('button', {name: 'Comprobar', exact: true}).click();
        await p.locator('.gl-feedback.is-correct').waitFor();
      } else if (c.kind === 'match') {
        for (const [term, def] of c.pairs) {
          await p.locator('.gl-match ul').nth(0).getByRole('button', {name: term, exact: true}).click();
          await p.locator('.gl-match ul').nth(1).getByRole('button', {name: def, exact: true}).click();
        }
        await p.locator('.gl-feedback.is-correct').waitFor();
      } else if (c.kind === 'order') {
        for (let pos = 0; pos < c.steps.length; pos++) {
          for (let guard = 0; guard < 6; guard++) {
            const texts = await p.locator('.gl-order li p').allInnerTexts();
            const at = texts.indexOf(c.steps[pos]);
            if (at <= pos) break;
            await p.locator('.gl-order li').nth(at).getByRole('button', {name: /^Subir/}).click();
          }
        }
        await p.getByRole('button', {name: 'Comprobar el orden'}).click();
        await p.locator('.gl-feedback.is-correct').waitFor();
      } else if (c.kind === 'number') {
        await p.locator('.gl-number input').fill('1');
        await p.getByRole('button', {name: 'Comprobar', exact: true}).click();
        await p.locator('.gl-feedback.is-retry').waitFor();
        await p.locator('.gl-number input').fill(String(c.answer).replace('.', ','));
        await p.getByRole('button', {name: 'Comprobar', exact: true}).click();
        await p.locator('.gl-feedback.is-correct').waitFor();
      }
      if (i === cards.length - 1) {
        assert.match(await p.locator('.gl-next').innerText(), /Vamos a probar/);
        await p.locator('.gl-next').click();
        await p.locator('.journey-explore').waitFor();
      } else await next();
    }
  }
  pass('Ocho temas: las 5 tarjetas de cada uno se completan (explicar, elegir, clasificar, unir, ordenar, calcular) y llevan a «Prueba»');

  // Recarga: conserva la tarjeta actual y las completadas
  await topic('coordinacion');
  await p.locator('.journey-steps button').nth(0).click();
  const label = await p.locator('.gl-count').innerText();
  await p.reload();
  assert.equal(await p.locator('.gl-count').innerText(), label);
  await p.locator('.gl-skip').click();
  await p.locator('.journey-explore').waitFor();
  pass('La lección conserva su avance al recargar y permite saltar a la prueba');

  // Móvil
  const mob = await browser.newContext({viewport: {width: 360, height: 780}, hasTouch: true});
  const mp = await mob.newPage();
  mp.on('pageerror', e => errors.push(e.message));
  await mp.goto(base + 'estudio/');
  await mp.getByRole('button', {name: /Empezar la lección/}).tap();
  for (const w of [1, 2, 3]) {
    const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, 'desborde horizontal ' + overflow);
    await mp.screenshot({path: `qa/estudio-v10/movil-${w}.png`, fullPage: true});
    if (w === 1) { const n = await mp.locator('.gl-reveal-item > button').count(); for (let k = 0; k < n; k++) await mp.locator('.gl-reveal-item > button').nth(k).tap(); await mp.locator('.gl-next').tap(); }
    if (w === 2) { await mp.screenshot({path: 'qa/estudio-v10/movil-sort.png', fullPage: true}); break; }
  }
  pass('360 px: tarjetas sin desborde horizontal y operables con toque real');
  await browser.close();
  assert.deepEqual(errors, [], 'errores de navegador: ' + errors.join(' | '));
  pass('Sin errores de navegador');
})().catch(e => { console.error(e); process.exit(1); });
