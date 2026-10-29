// Robótica · cámara en primera persona (solo PC): botón/tecla C, WASD + Q/E, mirar con el botón derecho, sin atravesar el suelo,
// sin interferir con los atajos ni los campos de texto, y salida limpia.  Uso: PANELLAB_URL=http://127.0.0.1:4344 node qa/verify-robotics-fly-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4325').replace(/\/$/, ''), out = 'qa/robotics';
fs.mkdirSync(out, {recursive: true});
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);

(async () => {
  const {buildRobot2wd} = await import('./robotics/robot2wd.mjs'); const {project: robot} = buildRobot2wd();
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [robot], active: robot.id});
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds?.().length === 11, null, {timeout: 20000});
    const cam = () => p.evaluate(() => window.__modoRobotics.camera());
    const fly = p.locator('.rb-dock button[aria-label="Primera persona"]');
    await p.locator('.rb-dock button[aria-label="Encuadrar"]').click(); await p.waitForTimeout(900);
    const orbit = await cam(); assert.ok(orbit.distance > 0.2, 'en modo órbita el objetivo está lejos de la cámara');

    // 1) Activar con el botón
    await fly.click(); assert.equal(await fly.getAttribute('aria-pressed'), 'true'); await p.locator('.rb-fly-bar').waitFor(); assert.match(await p.locator('.rb-fly-bar').textContent(), /W A S D/);
    const start = await cam(); near(start.distance, 0.05, 0.005, 'el objetivo queda a 5 cm: la cámara es «los ojos»'); orbit.position.forEach((v, i) => near(start.position[i], v, 1e-6, 'activar no mueve la cámara de sitio'));
    pass('el botón activa la primera persona sin mover la cámara; el objetivo queda a 5 cm y el aviso explica las teclas');

    // 2) WASD mueve; W no activa la herramienta Cable
    const dir = [start.target[0] - start.position[0], 0, start.target[2] - start.position[2]], len = Math.hypot(...dir), f = dir.map(v => v / len);
    await p.keyboard.down('w'); await p.waitForTimeout(700); await p.keyboard.up('w'); await p.waitForTimeout(120);
    const afterW = await cam(); const moved = dist2(afterW.position, start.position); assert.ok(moved > 0.1 && moved < 0.45, `W avanza ~0,25 m en 0,7 s (${moved.toFixed(3)} m)`);
    const along = (afterW.position[0] - start.position[0]) * f[0] + (afterW.position[2] - start.position[2]) * f[2]; assert.ok(along > 0.9 * moved, 'avanza hacia donde mira');
    assert.equal(await p.locator('.rb-dock button[aria-label="Cable"]').getAttribute('aria-pressed'), 'false', 'con la primera persona W mueve la cámara y no activa la herramienta Cable');
    near(afterW.distance, 0.05, 0.005, 'sigue en primera persona');
    await p.keyboard.down('s'); await p.waitForTimeout(700); await p.keyboard.up('s'); await p.waitForTimeout(120);
    const afterS = await cam(); assert.ok(dist2(afterS.position, start.position) < 0.06, `S vuelve casi al punto de partida (${dist2(afterS.position, start.position).toFixed(3)} m)`);
    const right = [-f[2], 0, f[0]]; // f × arriba
    await p.keyboard.down('d'); await p.waitForTimeout(600); await p.keyboard.up('d'); await p.waitForTimeout(120);
    const afterD = await cam(), side = (afterD.position[0] - afterS.position[0]) * right[0] + (afterD.position[2] - afterS.position[2]) * right[2]; assert.ok(side > 0.08, `D se desplaza a la derecha (${side.toFixed(3)} m)`);
    await p.keyboard.down('a'); await p.waitForTimeout(600); await p.keyboard.up('a'); await p.waitForTimeout(120);
    assert.ok(dist2((await cam()).position, afterS.position) < 0.06, 'A deshace lo que hizo D');
    pass('W avanza hacia donde miras, S retrocede, D/A van a los lados; W no activa la herramienta Cable');

    // 3) Q/E suben y bajan; el suelo no se atraviesa
    const y0 = (await cam()).position[1];
    await p.keyboard.down('e'); await p.waitForTimeout(500); await p.keyboard.up('e'); await p.waitForTimeout(120); const up = (await cam()).position[1]; assert.ok(up > y0 + 0.08, `E sube (${y0.toFixed(3)} → ${up.toFixed(3)})`);
    await p.keyboard.down('Shift'); await p.keyboard.down('q'); await p.waitForTimeout(1400); await p.keyboard.up('q'); await p.keyboard.up('Shift'); await p.waitForTimeout(150);
    const floor = (await cam()).position[1]; assert.ok(floor >= 0.0199, `la cámara no atraviesa el suelo (y = ${floor.toFixed(4)})`); near(floor, 0.02, 0.002, 'se queda justo sobre el suelo');
    pass('E sube, Q baja (Mayús corre) y la cámara se detiene a 2 cm del suelo');

    // 4) Mirar con el botón derecho gira la vista sin mover la cámara de sitio
    const before = await cam(), vb = [before.target[0] - before.position[0], before.target[2] - before.position[2]];
    await p.mouse.move(700, 450); await p.mouse.down({button: 'right'}); await p.mouse.move(820, 450, {steps: 8}); await p.mouse.up({button: 'right'}); await p.waitForTimeout(250);
    const after = await cam(), va = [after.target[0] - after.position[0], after.target[2] - after.position[2]];
    near(dist2(after.position, before.position), 0, 0.004, 'mirar no traslada la cámara'); const turn = Math.abs(Math.atan2(vb[0] * va[1] - vb[1] * va[0], vb[0] * va[0] + vb[1] * va[1])); assert.ok(turn > 0.1, `la vista giró ${(turn * 57.3).toFixed(0)}°`);
    const w0 = await cam(); await p.mouse.move(720, 450); for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, -300); await p.waitForTimeout(200); } await p.waitForTimeout(300);
    const w1 = await cam(); assert.ok(dist2(w1.position, w0.position) > 0.01, `la rueda avanza por donde miras (${dist2(w1.position, w0.position).toFixed(3)} m)`); near(w1.distance, 0.05, 0.005, 'sigue en primera persona tras la rueda');
    pass('clic derecho y arrastrar gira la mirada sobre el sitio (la cámara no se desplaza); la rueda avanza');

    // 5) Con foco en un campo de texto, WASD no mueve la cámara
    await p.locator('.rb-dock button[aria-label="Propiedades"]').click(); await p.locator('.rb-dock button[aria-label="Piezas"]').click();
    const camField = await cam(); await p.locator('input[aria-label="Buscar pieza"]').focus(); await p.keyboard.down('w'); await p.waitForTimeout(500); await p.keyboard.up('w'); await p.waitForTimeout(150);
    near(dist2((await cam()).position, camField.position), 0, 1e-6, 'escribir «w» en un campo no mueve la cámara'); assert.equal(await p.locator('input[aria-label="Buscar pieza"]').inputValue(), 'w');
    await p.locator('.rb-window-parts button[aria-label="Cerrar Piezas"]').click(); await p.locator('.rb-window-properties button[aria-label="Cerrar Propiedades"]').click();
    pass('en un campo de texto WASD escribe y la cámara no se mueve');

    // 6) Salir con C: vuelve la órbita, la posición se conserva y W vuelve a ser el atajo del cable
    const preExit = await cam(); await p.locator('.rb-canvas').click({position: {x: 5, y: 450}, button: 'middle'}).catch(() => {}); await p.keyboard.press('c'); await p.waitForTimeout(300);
    assert.equal(await fly.getAttribute('aria-pressed'), 'false'); assert.equal(await p.locator('.rb-fly-bar').count(), 0);
    const exit = await cam(); dist2(exit.position, preExit.position) < 0.05 || assert.fail(`al salir la cámara se queda donde estaba (${dist2(exit.position, preExit.position).toFixed(3)} m)`); assert.ok(exit.distance >= 0.25, `el objetivo vuelve a una distancia útil para orbitar (${exit.distance.toFixed(2)} m)`);
    await p.keyboard.press('w'); assert.equal(await p.locator('.rb-dock button[aria-label="Cable"]').getAttribute('aria-pressed'), 'true', 'fuera de la primera persona W vuelve a ser el atajo del cable'); await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
    // la rueda vuelve a acercar al objetivo y la órbita funciona
    const o0 = await cam(); await p.mouse.move(720, 450); await p.mouse.wheel(0, -400); await p.waitForTimeout(800); assert.ok((await cam()).distance < o0.distance - 0.03, 'el zoom de la órbita funciona');
    pass('C sale: la cámara se queda donde estaba, el objetivo vuelve a distancia útil, la órbita y el zoom funcionan y W vuelve a ser el atajo del cable');

    // 7) Esc sale solo cuando no hay nada más que cancelar
    await fly.click(); assert.equal(await fly.getAttribute('aria-pressed'), 'true'); await p.keyboard.press('Escape'); assert.equal(await fly.getAttribute('aria-pressed'), 'false');
    await fly.click(); await p.locator('.rb-fly-bar button', {hasText: 'Salir'}).click(); assert.equal(await fly.getAttribute('aria-pressed'), 'false');
    pass('Esc y el botón «Salir» también desactivan la primera persona');

    // 8) Recargar no deja la cámara «dentro» de la primera persona
    await fly.click(); await p.keyboard.down('w'); await p.waitForTimeout(400); await p.keyboard.up('w'); await p.waitForTimeout(500);
    await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.camera, null, {timeout: 20000}); assert.equal(await fly.getAttribute('aria-pressed'), 'false');
    assert.ok((await cam()).distance >= 0.12 - 1e-6, 'tras recargar la cámara arranca en modo órbita, no a 5 cm'); await p.screenshot({path: `${out}/e3-primera-persona.png`});
    pass('recargar vuelve a la órbita (no se guarda la mirada de 5 cm)');
    assert.deepEqual(report.errors, [], 'sin errores de consola ni de página'); pass('sin errores de consola ni de página');
    await ctx.close();
  } finally { await browser.close(); fs.writeFileSync(`${out}/fly-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
