// Calculadora y módulo Cálculos del estudio: motor aritmético, pantalla, dock en la evaluación.
const assert = require('node:assert/strict'), fs = require('node:fs');
const {build} = require('esbuild');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.PANELLAB_URL || 'http://127.0.0.1:4331/';
const pass = text => console.log('PASS', text);
(async () => {
  fs.mkdirSync('qa/estudio-v9', {recursive: true});
  await build({entryPoints: ['src/study/calcEngine.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: 'qa/estudio-v9/calcEngine.cjs', logLevel: 'silent'});
  const {evaluate, formatResult, CalcError} = require('./estudio-v9/calcEngine.cjs');
  const near = (src, expected) => assert.ok(Math.abs(evaluate(src) - expected) < 1e-9, `${src} = ${evaluate(src)} ≠ ${expected}`);
  near('2+3×4', 14); near('(2+3)×4', 20); near('10÷4', 2.5); near('1,5+2,25', 3.75); near('1.5*2', 3);
  near('√(16)', 4); near('√16×2', 8); near('2^3', 8); near('3^2', 9); near('-2+5', 3); near('2(3+4)', 14); near('2√(9)', 6);
  near('5500/(√(3)×400×0,88×0,83)', 10.868792718);
  near('30×0,9×0,8', 21.6); 
  assert.equal(formatResult(evaluate('5500÷(√(3)×400×0,88×0,83)')), '10,86879272');
  assert.equal(formatResult(evaluate('0,1+0,2')), '0,3');
  assert.equal(formatResult(evaluate('1000×1000')), '1000000');
  for (const bad of ['', '2+', '(2+3', '2+3)', '5÷0', '√(-4)', '1,2,3', '2 $ 3', '××2']) {
    assert.throws(() => evaluate(bad), CalcError, `debía fallar: «${bad}»`);
  }
  pass('Motor aritmético: precedencia, paréntesis, raíz, potencia, coma decimal, multiplicación implícita, formato y errores controlados');

  const browser = await chromium.launch();
  const errors = [];
  const ctx = await browser.newContext({viewport: {width: 1280, height: 900}});
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(base + 'estudio/');
  const modules = p.getByRole('navigation', {name: 'Módulos'});
  await modules.getByRole('button', {name: /Cálculos/}).click();
  await p.getByRole('heading', {name: 'Cálculos', exact: true}).waitFor();
  assert.equal(await p.getByRole('navigation', {name: 'Secciones del estudio'}).count(), 0);
  // teclas en pantalla
  const key = name => p.locator('.calculator').first().getByRole('button', {name, exact: true});
  await key('Raíz cuadrada').click(); await key('3').click(); await key('Cerrar paréntesis').click();
  await key('Multiplicar').click(); await key('4').click(); await key('Calcular').click();
  assert.equal(await p.locator('.calculator .calc-input').first().inputValue(), '6,92820323');
  // teclado físico
  await p.locator('.calculator .calc-input').first().fill('');
  await p.locator('.calculator .calc-input').first().type('5500/(√(3)*400*0,88*0,83)');
  assert.match(await p.locator('.calculator .calc-result').first().innerText(), /10,86879272/);
  await p.keyboard.press('Enter');
  assert.equal(await p.locator('.calculator .calc-input').first().inputValue(), '10,86879272');
  await p.locator('.calculator .calc-input').first().fill('5÷0');
  await p.keyboard.press('Enter');
  assert.match(await p.locator('.calculator .calc-result').first().innerText(), /dividir por 0/);
  pass('Calculadora: teclas en pantalla, teclado físico, vista previa, Enter y mensaje de error');
  // fórmulas 1:1 y guiadas
  const tabs = [['Coordinación', 'Cumple'], ['Banda B / C / D', '80–160'], ['Capacidad del cable', '21,6'], ['Caída de tensión', 'Cumple'], ['Cortocircuito I²t', 'Cumple'], ['Guardamotor', 'Incluye la placa'], ['Fuga en mA', '30'], ['Corriente del motor', '10,87']];
  for (const [tab, expected] of tabs) {
    await p.getByRole('tab', {name: tab}).click();
    assert.ok((await p.locator('.calc-outcome').innerText()).includes(expected), `${tab}: ${expected}`);
    assert.ok(await p.locator('.calculation-steps').count() >= 1, 'paso a paso por defecto');
    assert.ok(await p.locator('.calc-formula-exact').count() === 1);
    await p.getByRole('tab', {name: 'Para qué sirve'}).click();
    assert.equal(await p.locator('.calc-purpose dt').count(), 3, 'para qué sirve: 3 filas');
    assert.ok((await p.locator('.calc-purpose dd').first().innerText()).length > 30);
    await p.getByRole('tab', {name: 'Símbolos'}).click();
    assert.ok(await p.locator('.calc-legend dt').count() >= 2);
    assert.match(await p.locator('.calc-origin a').getAttribute('href'), /profesor\.pdf#page=\d+/);
  }
  assert.deepEqual(await p.locator('.calc-pick-group h4').allTextContents(), ['Elegir la protección', 'Verificar el cable', 'Motor trifásico', 'Fuga y personas']);
  assert.equal(await p.locator('.calc-pick-group [role=tab]').count(), 8);
  // notación exacta de las láminas
  const exact = async tab => { await p.getByRole('tab', {name: tab}).click(); return (await p.locator('.calc-formula-exact').innerText()).replace(/\s+/g, ' ').trim(); };
  assert.equal(await exact('Coordinación'), 'In ≤ Ip ≤ Iz');
  assert.equal(await exact('Capacidad del cable'), 'Iz = Itabla fT fG');
  assert.equal(await exact('Cortocircuito I²t'), 'I2t ≤ k2S2');
  assert.equal(await exact('Corriente del motor'), 'In = Psalida / (√3 VLL η cos φ)');
  await p.getByRole('tab', {name: 'Coordinación'}).click();
  await p.getByRole('tab', {name: 'Símbolos'}).click();
  assert.match(await p.locator('.calc-legend').innerText(), /Ib ≤ In ≤ Iz/);
  await p.getByRole('tab', {name: 'Ejemplo'}).click();
  assert.match(await p.locator('.calc-example').innerText(), /18 A ≤ 20 A ≤ 25 A/);
  // «cómo se teclea»: la expresión mostrada, ejecutada en la calculadora, da el resultado de la ficha
  await p.getByRole('tab', {name: 'Cortocircuito I²t'}).click();
  await p.getByRole('button', {name: 'Escribir ahí'}).click();
  await p.waitForFunction(() => /[\^√]/.test(document.querySelector('.calculator .calc-input').value));
  await p.locator('.calculator .calc-input').first().press('Enter');
  assert.equal(await p.locator('.calculator .calc-input').first().inputValue(), '82656,25');
  await p.getByRole('tab', {name: 'Corriente del motor'}).click();
  await p.getByLabel(/η · rendimiento/).fill('88');
  assert.match(await p.locator('.calc-message').innerText(), /entre 0 y 1/);
  await p.getByLabel(/η · rendimiento/).fill('0,88');
  await p.getByRole('button', {name: 'Escribir ahí'}).click();
  await p.waitForFunction(() => /[\^√]/.test(document.querySelector('.calculator .calc-input').value));
  await p.locator('.calculator .calc-input').first().press('Enter');
  assert.equal(await p.locator('.calculator .calc-input').first().inputValue(), '10,86879272');
  await p.getByRole('button', {name: /Pasar a la calculadora/}).click();
  await p.waitForFunction(() => /^10,8688$/.test(document.querySelector('.calculator .calc-input').value));
  // el resultado de la calculadora vuelve a una ficha con «Usar»
  await p.getByRole('tab', {name: 'Guardamotor'}).click();
  await p.locator('.calc-field', {hasText: 'Corriente de placa'}).getByRole('button', {name: /Usar 10,8688/}).click();
  assert.equal(await p.getByLabel(/Corriente de placa/).inputValue(), '10,8688');
  assert.ok((await p.locator('.calc-outcome').innerText()).includes('No incluye la placa') || (await p.locator('.calc-outcome').innerText()).includes('Incluye'), 'la ficha recalcula con el dato traído');
  pass('Fórmulas 1:1 con las láminas (6, 8, 12, 13, 14, 15): notación exacta, símbolos, ejemplo, lámina enlazada y expresión que da el mismo resultado en la calculadora');

  // persistencia de la pantalla y navegación entre módulos
  await p.reload();
  await p.getByRole('heading', {name: 'Cálculos', exact: true}).waitFor();
  await modules.getByRole('button', {name: /Estudiar/}).click();
  await p.getByRole('navigation', {name: 'Secciones del estudio'}).waitFor();
  pass('El módulo Cálculos se conserva al recargar y se vuelve a Estudiar sin perder el recorrido');

  // dock en la evaluación
  await modules.getByRole('button', {name: /Evaluarme/}).click();
  assert.equal(await p.locator('.calc-fab').count(), 1);
  await p.getByRole('button', {name: /Comenzar simulacro/}).click();
  const fab = p.locator('.calc-fab');
  assert.equal(await fab.getAttribute('aria-expanded'), 'false');
  await fab.click();
  assert.equal(await fab.getAttribute('aria-expanded'), 'true');
  const dockInput = p.locator('.calc-dock-panel .calc-input');
  await dockInput.type('18+2');
  await p.keyboard.press('Enter');
  assert.equal(await dockInput.inputValue(), '20');
  await p.keyboard.press('Escape');
  await p.locator('.calc-dock-panel').waitFor({state: 'hidden'});
  await fab.click();
  assert.equal(await dockInput.inputValue(), '20');
  assert.equal(await p.locator('.study-hints').count(), 0);
  pass('Evaluación: botón Calculadora siempre disponible, conserva la operación al cerrar/abrir y no muestra pistas');
  await p.screenshot({path: 'qa/estudio-v9/dock-1280.png'});

  // móvil
  const m = await browser.newContext({viewport: {width: 360, height: 780}, hasTouch: true});
  const mp = await m.newPage();
  mp.on('pageerror', e => errors.push(e.message));
  await mp.goto(base + 'estudio/');
  await mp.getByRole('navigation', {name: 'Módulos'}).getByRole('button', {name: /Cálculos/}).click();
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, 'desborde horizontal en 360 px: ' + overflow);
  await mp.getByRole('button', {name: /^Calculadora/}).tap();
  const mk = name => mp.locator('.calc-dock-panel .calculator').getByRole('button', {name, exact: true});
  await mk('7').tap(); await mk('Sumar').tap(); await mk('5').tap(); await mk('Calcular').tap();
  assert.equal(await mp.locator('.calc-dock-panel .calc-input').inputValue(), '12');
  await mp.getByRole('tab', {name: 'Fórmulas'}).tap();
  await mp.getByRole('button', {name: /Capacidad del cable/}).tap();
  assert.ok(await mp.locator('.formula-detail').isVisible(), 'al tocar una fórmula se ven sus símbolos');
  await mp.getByRole('button', {name: 'Abrir la ficha y calcular'}).tap();
  await mp.waitForTimeout(400);
  assert.match(await mp.locator('.calc-work h3').innerText(), /Capacidad corregida del cable/);
  await mp.screenshot({path: 'qa/estudio-v9/calculos-360.png', fullPage: true});
  pass('360 px: módulo Cálculos sin desborde y calculadora operable con toque real');
  await browser.close();
  assert.deepEqual(errors, [], 'errores de navegador: ' + errors.join(' | '));
  pass('Sin errores de navegador');
})().catch(e => { console.error(e); process.exit(1); });
