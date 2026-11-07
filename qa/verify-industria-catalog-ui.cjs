// Industria, fase 4: biblioteca con búsqueda, familias, estado y datos de cada pieza (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), fs = require('node:fs');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(600);
    const items = p.locator('.ind-shapes > li'), search = p.getByLabel('Buscar en la biblioteca');
    const stored = () => p.evaluate(k => JSON.parse(localStorage.getItem(k)).projects[0], LIB);

    // 1) Catálogo completo, con estado visible en cada pieza
    assert.ok(await items.count() >= 10);
    assert.equal(await p.locator('.ind-shapes small', {hasText: 'Genérico · no verificado'}).count(), await items.count());
    assert.equal(await p.locator('.ind-shapes small', {hasText: /^Verificado/}).count(), 0);
    pass('La biblioteca lista el catálogo y marca cada pieza como «Genérico · no verificado»');

    // 2) Búsqueda sin tildes y por terminal; sin resultados avisa
    await search.fill('contactor'); assert.equal(await items.count(), 1);
    await search.fill('automatizacion'); assert.equal(await items.count(), 1); assert.match(await items.first().innerText(), /PLC/);
    await search.fill('A1'); assert.equal(await items.count(), 2); // terminal A1: contactor y electroválvula
    await search.fill('zzz'); assert.equal(await items.count(), 0); assert.match(await p.locator('[role=status]', {hasText: 'Ninguna pieza'}).innerText(), /zzz/);
    await search.fill('');
    pass('La búsqueda ignora tildes, encuentra por terminal y avisa cuando no hay resultados');

    // 3) Familias: filtrar; las vacías quedan deshabilitadas (sin inventar piezas)
    const fam = p.getByRole('group', {name: 'Familias'});
    assert.ok(await fam.getByRole('button', {name: /Hidráulica/}).isDisabled());
    await fam.getByRole('button', {name: /Electricidad industrial/}).click();
    assert.ok(await items.count() >= 5); assert.equal(await p.locator('.ind-shapes > li:has(small:text("Mecánica"))').count(), 0);
    await fam.getByRole('button', {name: 'Todas'}).click();
    pass('Se filtra por familia y las familias sin piezas aparecen deshabilitadas');

    // 4) Datos de la pieza: terminales y procedencia, sin fabricante
    await search.fill('contactor');
    await items.first().locator('summary').click();
    const info = await items.first().locator('.ind-item-info').innerText();
    assert.match(info, /1 · 3 · 5 · 2 · 4 · 6 · A1 · A2 · 13 · 14/); assert.match(info, /No contrastado/); assert.match(info, /Sin fuente de fabricante/);
    await p.screenshot({path: out + '/catalogo-1-biblioteca.png'});
    pass('«Datos» muestra terminales, medidas de ejemplo y que no hay fuente de fabricante');

    // 5) Colocar desde la biblioteca: queda con su definición, seleccionada, y el inspector muestra estado y terminales
    await items.first().locator(':scope > button').click(); await p.waitForTimeout(700);
    let pr = await stored(); assert.equal(pr.entities.length, 1); assert.equal(pr.entities[0].definitionId, 'contactor-3p'); assert.equal(pr.poses[pr.entities[0].id].position[1], 0.5, 'las piezas de riel nacen a la altura del riel');
    await p.getByRole('button', {name: 'Propiedades', exact: true}).click();
    assert.match(await p.locator('[aria-label="Identidad del componente"]').innerText(), /Contactor 3P · Genérico · no verificado/);
    assert.equal(await p.locator('[data-terminals] summary').innerText(), 'Terminales (10)');
    await p.screenshot({path: out + '/catalogo-2-inspector.png'});
    pass('Colocar crea la pieza con su definición; el inspector muestra estado y terminales');

    // 6) Persistencia y exportación conservan la definición (sin datos nuevos de fabricante)
    await p.waitForTimeout(500); await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor();
    pr = await stored(); assert.equal(pr.entities[0].definitionId, 'contactor-3p'); assert.ok(!JSON.stringify(pr).match(/manufacturer|partNumber/));
    pass('Recargar conserva la definición del catálogo');

    // 7) Tablet sin desbordes
    await p.setViewportSize({width: 820, height: 1000}); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    pass('La biblioteca no desborda en tablet');

    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/catalogo-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
