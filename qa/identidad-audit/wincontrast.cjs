const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const check = require('./check.cjs');
const base = process.env.B || 'http://127.0.0.1:4460';
(async () => {
  const b = await chromium.launch();
  for (const [name, w, h] of [['PC', 1440, 900], ['móvil', 390, 844]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', hasTouch: w < 800 });
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    const rep = async (label) => {
      await p.waitForTimeout(600);
      const con = (await p.evaluate(check)).filter(i => !i.unknown && !/SVGAnimated/.test(i.cls));
      const seen = new Set(); const out = [];
      con.forEach(i => { const k = i.cls + i.color; if (!seen.has(k) && out.length < 4) { seen.add(k); out.push(i.ratio + ' "' + i.txt + '" .' + i.cls.split(' < ')[0] + ' fg=' + i.color + ' bg=' + i.bg); } });
      console.log(name + ' · ' + label + ': ' + con.length + ' fallos de contraste' + (out.length ? '\n    ' + out.join('\n    ') : ''));
    };
    await p.goto(base + '/estudio/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
    await p.locator('.tutorial-trigger').first().click().catch(() => {}); await rep('tutoriales'); await p.keyboard.press('Escape');
    await p.goto(base + '/laboratorio/', { waitUntil: 'load' }); await p.waitForTimeout(3000);
    if (w > 800) {
      await p.locator('.lab-project-menu>summary').first().click().catch(() => {}); await rep('Proyecto'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      await p.getByRole('button', { name: /^Componentes/ }).first().click().catch(() => {}); await rep('componentes'); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      await p.getByRole('button', { name: /^Detectores/ }).first().click().catch(() => {}); await p.waitForTimeout(1500);
      await p.locator('g[role=button][aria-label*="uente"], g[role=button][aria-label*="detector"]').first().click({ force: true }).catch(() => {}); await rep('editor de equipo');
      await p.screenshot({ path: 'qa/identidad-audit/win-editor-' + name + '.png' });
    } else {
      await p.locator('button[aria-label="Opciones del proyecto"]').first().click().catch(() => {}); await rep('Mi proyecto'); await p.screenshot({ path: 'qa/identidad-audit/win-proyecto-' + name + '.png' });
    }
    await c.close();
  }
  await b.close();
})();
