/* Pantalla de apertura: aparece al pulsar un módulo, sigue durante la carga y se retira al terminar,
   incluso con movimiento reducido. Uso: node qa/verify-opening.cjs [http://127.0.0.1:4410] */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4410').replace(/\/$/, '');
const out = path.join(__dirname, 'opening');
fs.mkdirSync(out, {recursive: true});

const sampler = () => {
  window.__open = [];
  const sample = () => {
    const d = document.documentElement;
    if (!d) return;
    window.__open.push({t: Math.round(performance.now()), on: d.classList.contains('modo-opening-on'),
      label: document.querySelector('.modo-opening-label')?.textContent || '', bar: Number(getComputedStyle(document.querySelector('.modo-opening-late') || d).opacity)});
  };
  setInterval(sample, 40);
};

(async () => {
  const browser = await chromium.launch();
  const results = {};
  for (const reduce of ['reduce', 'no-preference']) {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, reducedMotion: reduce});
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 250, downloadThroughput: 400 * 1024 / 8 * 8, uploadThroughput: 200 * 1024, connectionType: 'cellular3g'});
    await page.addInitScript(sampler);
    await page.goto(base + '/', {waitUntil: 'load'});
    await page.waitForFunction(() => !document.documentElement.classList.contains('modo-opening-on'), null, {timeout: 20000});
    // 1 · Laboratorio por enlace
    await page.evaluate(() => { window.__open = []; });
    await page.locator('a.modo-laboratory-open').evaluate(el => el.click());
    await page.waitForURL(/\/laboratorio\/?$/, {timeout: 20000});
    await page.waitForSelector('.lab-page', {timeout: 30000});
    await page.waitForFunction(() => !document.documentElement.classList.contains('modo-opening-on'), null, {timeout: 20000});
    const lab = await page.evaluate(() => window.__open);
    const labOn = lab.filter(s => s.on);
    assert.ok(labOn.length > 0, reduce + ': la pantalla de apertura nunca se mostró al llegar al laboratorio');
    assert.ok(labOn.some(s => /laboratorio/i.test(s.label)), reduce + ': falta el texto "Abriendo el laboratorio"');
    // 2 · Panel de control en la misma página
    await page.goto(base + '/', {waitUntil: 'load'});
    await page.waitForFunction(() => !document.documentElement.classList.contains('modo-opening-on'), null, {timeout: 20000});
    await page.evaluate(() => { window.__open = []; });
    await page.getByRole('button', {name: /Abrir panel de control/}).first().click();
    await page.waitForSelector('.editor-workbench svg', {timeout: 30000});
    await page.waitForFunction(() => !document.documentElement.classList.contains('modo-opening-on'), null, {timeout: 20000});
    const panel = await page.evaluate(() => window.__open);
    const panelOn = panel.filter(s => s.on);
    assert.ok(panelOn.length > 0, reduce + ': la pantalla de apertura nunca se mostró al abrir el panel');
    assert.ok(panelOn.some(s => /panel/i.test(s.label)), reduce + ': falta el texto "Abriendo el panel de control"');
    // 3 · Estudio por enlace
    await page.goto(base + '/', {waitUntil: 'load'});
    await page.waitForFunction(() => !document.documentElement.classList.contains('modo-opening-on'), null, {timeout: 20000});
    await page.evaluate(() => { window.__open = []; });
    await page.locator('a.modo-study').evaluate(el => el.click());
    await page.waitForURL(/\/estudio\/?$/, {timeout: 20000});
    await page.waitForFunction(() => !document.documentElement.classList.contains('modo-opening-on'), null, {timeout: 20000});
    const study = await page.evaluate(() => window.__open);
    const studyOn = study.filter(s => s.on);
    assert.ok(studyOn.length > 0, reduce + ': la pantalla de apertura nunca se mostró al abrir estudio');
    results[reduce] = {
      laboratorio: {muestras: labOn.length, barra_visible: labOn.some(s => s.bar > 0.9), texto: labOn.find(s => s.label)?.label},
      panel: {muestras: panelOn.length, barra_visible: panelOn.some(s => s.bar > 0.9), texto: panelOn.find(s => s.label)?.label},
      estudio: {muestras: studyOn.length, barra_visible: studyOn.some(s => s.bar > 0.9), texto: studyOn.find(s => s.label)?.label}
    };
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  console.log('PASS verify-opening');
})().catch(e => { console.error(e); process.exit(1); });
