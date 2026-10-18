const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.PANELLAB_URL || 'http://127.0.0.1:4341';
const out = 'qa/estudio-clases';
const report = { checks: [], errors: [], captures: [] };
const pass = text => { report.checks.push(text); console.log('PASS', text); };
(async () => {
  const before = JSON.parse(fs.readFileSync(`${out}/before-hashes.json`, 'utf8').replace(/^\uFEFF/, ''));
  const edited = new Set(['src/study/StudyHub.tsx', 'src/styles/study-campus.css']);
  for (const item of before) {
    const file = path.relative(process.cwd(), item.Path).replaceAll('\\', '/');
    if (!edited.has(file)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.Path)).digest('hex').toUpperCase(), item.Hash, file);
  }
  pass('Solo cambia la navegación de estudio; fuentes, actividades, preguntas, guardado y simulador conservados');
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    p.on('pageerror', error => report.errors.push(error.message));
    await p.goto(`${base}/estudio/`);
    await p.locator('.study-hub').waitFor();
    const initial = await p.evaluate(() => localStorage.getItem('panellab:estudio:v1'));
    await p.locator('[data-course="s2-1"]').click();
    assert.equal(await p.locator('.class-unit').count(), 3);
    const rows = p.locator('.class-unit').first().locator('.class-material-row');
    assert.equal(await rows.count(), 7);
    assert.deepEqual(await rows.locator(':scope > span').allTextContents(), ['Clase 1', 'Clase 2', 'Clase 3', 'Clase 4', 'Clase 5', 'Ejercicio 1', 'Guía 1']);
    assert.equal(await p.locator('.class-material-row[data-kind="class"]').count(), 5);
    assert.equal(await p.locator('.class-material-row[data-kind="exercise"]').count(), 1);
    assert.equal(await p.locator('.class-material-row[data-kind="guide"]').count(), 1);
    assert.equal(await p.locator('button.class-material-row').count(), 0);
    assert.match(await rows.first().innerText(), /PDF pendiente/);
    assert.equal(await p.evaluate(() => localStorage.getItem('panellab:estudio:v1')), initial);
    pass('Electrónica conserva tres unidades, cinco clases, ejercicio y guía separados; no copia el Hecho ni inventa PDFs');
    for (const width of [320, 390, 768, 1440]) {
      await p.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await p.evaluate(() => document.fonts.ready);
      await p.screenshot({ path: `${out}/unidades-${width}.png`, fullPage: true, animations: 'disabled' });
      report.captures.push(`unidades-${width}`);
      await p.locator('.class-unit').nth(1).locator('summary').click();
      assert.ok(await p.locator('.class-unit').nth(1).locator('.class-unit-pending').isVisible());
      await p.locator('.class-unit').nth(1).locator('summary').click();
    }
    await p.getByRole('button', { name: 'Mis ramos', exact: true }).click();
    await p.locator('[data-course="s2-4"]').click();
    assert.match(await p.locator('.class-unit-pending').innerText(), /falta incorporar/);
    await p.getByRole('button', { name: 'Mis ramos', exact: true }).click();
    await p.locator('[data-course="s2-2"]').click();
    assert.equal(await p.locator('.class-unit').count(), 0);
    assert.match(await p.locator('.class-unassigned').innerText(), /unidad todavía están por confirmar/);
    assert.equal(await p.locator('.class-material-row').count(), 1);
    await p.locator('button.class-material-row').click();
    assert.equal(await p.locator('.campus-topic').count(), 8);
    assert.match(await p.locator('.class-study-bar').innerText(), /0\/8/);
    assert.equal(await p.getByRole('link', { name: 'Ver PDF original' }).getAttribute('href'), '/estudio/profesor.pdf');
    assert.ok(await p.getByRole('button', { name: 'Empezar clase', exact: true }).isVisible());
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.screenshot({ path: `${out}/clase-protecciones.png`, fullPage: true, animations: 'disabled' });
    await p.getByRole('button', { name: 'Empezar clase', exact: true }).click();
    await p.locator('.lesson-journey').waitFor();
    assert.match(p.url(), /tema=objetivos-fallas/);
    pass('Un PDF de Protecciones conserva sus ocho temas dentro de una sola clase, fuente original, avance y entrada en orden');
    assert.deepEqual(report.errors, []);
    pass('Unidades y clases funcionan a 320/390/768/1440 px sin desbordes ni errores de JavaScript');
  } finally { await browser.close(); fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
