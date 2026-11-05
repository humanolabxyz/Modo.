// Robótica · robot de orugas con radar y cara en la interfaz: se abre desde «Mis proyectos», ▶ y se comprueba lo que se ve: avanza, la cabeza gira con el cuello y la pantalla cambia de cara.
// Uso: PANELLAB_URL=http://127.0.0.1:4330 node qa/verify-robotics-tracked-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4330').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const robot = buildTemplate('robot-oruga-radar');
  const project = {...robot, workspace: {...robot.workspace, mode: 'simulate'}};
  const ids = {chassis: robot.parts[0].instanceId, head: robot.parts.find(x => x.definitionId === 'robot-head').instanceId, oled: robot.parts.find(x => x.definitionId === 'oled-ssd1306').instanceId};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); localStorage.setItem('panellab.robotica.sonido', '1'); }, {projects: [project], active: project.id});
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, robot.parts.length, {timeout: 25000}); await p.waitForTimeout(800);
    assert.equal(await p.evaluate(() => window.__modoRobotics.partIds().length), 31);
    assert.match(await p.locator('.rb-sim-note').textContent(), /Bosque de exploración/);
    await p.screenshot({path: `${out}/tracked-ui-start.png`});
    pass('el robot de orugas se abre armado: 31 piezas en el 3D');
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    await p.waitForFunction(() => document.querySelector('.rb-sim-chip')?.textContent === 'EN MARCHA', null, {timeout: 40000});
    const seen = {lit: new Set(), rel: [], z: [], reactions: new Set()}, t0 = Date.now();
    const sample = async () => p.evaluate(({c, h, o}) => ({c: window.__modoRobotics.partYaw(c), h: window.__modoRobotics.partYaw(h), lit: window.__modoRobotics.oledLit(o), z: window.__modoRobotics.partWorld(c)?.[2]}), {c: ids.chassis, h: ids.head, o: ids.oled});
    let shotLeft = false;
    while (Date.now() - t0 < 90000) {
      const s = await sample();
      const reaction = await p.locator('.rb-reaction').allTextContents();
      reaction.forEach(value => seen.reactions.add(value));
      if (s.lit !== null) seen.lit.add(s.lit); seen.z.push(s.z);
      let rel = s.h - s.c; while (rel > 180) rel -= 360; while (rel < -180) rel += 360; seen.rel.push(rel);
      if (!shotLeft && rel > 50) { shotLeft = true; await p.screenshot({path: `${out}/tracked-ui-mirando-izquierda.png`}); }
      if (Math.max(...seen.rel) > 50 && Math.min(...seen.rel) < -50 && seen.lit.size >= 3 && Math.max(...seen.z) > 0.4 && seen.reactions.has('¡Obstáculo!') && seen.reactions.has('Giro a la derecha')) break;
      await p.waitForTimeout(120);
    }
    assert.ok(Math.max(...seen.z) > 0.4, `avanzó (z máx ${Math.max(...seen.z).toFixed(2)} m)`); pass(`▶ el robot avanza con sus orugas (z hasta ${Math.max(...seen.z).toFixed(2)} m)`);
    assert.ok(Math.max(...seen.rel) > 50 && Math.min(...seen.rel) < -50, `la cabeza gira (de ${Math.min(...seen.rel).toFixed(0)}° a ${Math.max(...seen.rel).toFixed(0)}° respecto del chasis)`);
    pass(`la cabeza dibujada gira con el cuello: de ${Math.min(...seen.rel).toFixed(0)}° a +${Math.max(...seen.rel).toFixed(0)}° respecto del chasis`);
    assert.ok(seen.lit.size >= 3, `la pantalla mostró ${seen.lit.size} imágenes distintas`); pass(`la pantalla de la cara cambió de imagen: ${seen.lit.size} caras distintas (${[...seen.lit].sort((a, b) => a - b).join(', ')} píxeles encendidos)`);
    assert.ok(seen.reactions.has('¡Obstáculo!') && seen.reactions.has('Giro a la derecha'), [...seen.reactions].join(', '));
    await p.locator('[data-sound-ctx="running"]').waitFor();
    pass('el bosque está activo y la sorpresa y el giro llegan a la interfaz con el audio habilitado');
    await p.screenshot({path: `${out}/tracked-ui-corriendo.png`});
    await p.locator('.rb-dock button[aria-label="Consola"]').click(); await p.locator('[role=tab]', {hasText: 'Serie y estado'}).click();
    const state = await p.locator('.rb-state-list').textContent(); assert.match(state, /bytes recibidos por I²C/); assert.match(state, /→ pide|° ·/);
    pass('la Consola muestra la pantalla («bytes recibidos por I²C») y el ángulo del servo del cuello');
    assert.deepEqual(report.errors, [], 'sin errores de consola: ' + report.errors.join(' | ')); pass('sin errores de consola');
  } finally { await browser.close(); fs.writeFileSync(`${out}/tracked-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error(e); process.exit(1); });
