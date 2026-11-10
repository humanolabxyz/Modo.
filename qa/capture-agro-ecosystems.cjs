// Etapa 6 · capturas y medición de los ecosistemas en los seis territorios (AGRO_URL, AGRO_QA_OUT, AGRO_MODELS=off para comparar).
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const {fixtureOpen} = require('./verify-agro-territory-ui.cjs');
const {diagnostics, ready, camera, profile} = require('./review-agro-etapa3.cjs');
const out = process.env.AGRO_QA_OUT, off = process.env.AGRO_MODELS === 'off';
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const {createConfiguredWorld} = await import('../src/agro/world/setup.ts'), {TERRITORIES} = await import('../src/agro/terrain/presets.ts');
  const browser = await chromium.launch({args: ['--use-angle=d3d11', '--ignore-gpu-blocklist']}), res = {}, errors = [];
  for (const id of ['free', 'valley', 'oasis-norte', 'desierto', 'ladera', 'valle-rio']) {
    const made = createConfiguredWorld({name: 'Eco ' + id, seed: 31415, territory: id, ...(id !== 'valley' && {terrainParams: {...TERRITORIES[id].params}}), side: 1200, template: 'blank', site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'});
    assert.ok(made.ok, made.error); const world = made.value, [sx, sz] = world.scenario.site;
    const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'}); await ctx.addInitScript(diagnostics); if (off) await ctx.addInitScript(() => localStorage.setItem('modo-agro-modelos', 'off'));
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(id + ': ' + e.message)); p.on('console', m => m.type() === 'error' && errors.push(id + ': ' + m.text()));
    await p.goto(process.env.AGRO_URL + '/agro/'); await p.locator('[data-view=lobby]').waitFor(); await fixtureOpen(p, world); await ready(p);
    for (const [name, off2] of [['cerca', [60, 22, 80]], ['media', [150, 55, 190]]]) {
      await camera(p, 'orbit', off2, [sx, null, sz]); await p.waitForTimeout(2200);
      const pr = await profile(p, world); res[id + '-' + name] = {calls: pr.total.calls, tris: pr.total.triangles};
      await p.mouse.move(10, 15); await p.screenshot({path: path.join(out, `${off ? 'sin' : 'eco'}-${id}-${name}.png`)});
    }
    await ctx.close();
  }
  console.log(JSON.stringify(res)); console.log('errores', errors.length, errors.slice(0, 3)); fs.writeFileSync(path.join(out, off ? 'eco-sin.json' : 'eco-con.json'), JSON.stringify(res, null, 1)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
