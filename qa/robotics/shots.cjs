// Capturas de revisión visual (no es una prueba). Uso: node qa/robotics/shots.cjs [url]
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4330').replace(/\/$/, '');
(async () => {
  const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  for (const [name, w, h, touch] of [['escritorio', 1440, 900, false], ['tablet', 1024, 768, true], ['telefono', 390, 844, true]]) {
    const c = await b.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: w < 600, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    await p.goto(base + '/'); await p.locator('[data-module=panel]:not(:disabled)').waitFor();
    if (w > 1100) { await p.locator('[data-module=study]').focus(); await p.keyboard.press('End'); } else await p.locator('.home-carousel-dots button[aria-label="Mostrar Robótica"]').click(); await p.waitForTimeout(900);
    await p.screenshot({path: `qa/robotics/inicio-${name}.png`});
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForTimeout(1500);
    const a = await p.evaluate(() => window.__modoRobotics.screenOf('dbg-b')); await p.mouse.click(a.x, a.y); await p.waitForTimeout(600);
    await p.screenshot({path: `qa/robotics/seleccion-${name}.png`});
    for (const l of (w < 600 ? ['Piezas'] : ['Piezas', 'Propiedades'])) await p.locator(`.rb-dock button[aria-label="${l}"]`).click();
    await p.waitForTimeout(300);
    await p.screenshot({path: `qa/robotics/pizarra-${name}.png`});
    await c.close();
  }
  await b.close();
})();
