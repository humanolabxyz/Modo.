// Etapa 6 · capturas de la galería de candidatos (AGRO_URL con el build servido; AGRO_QA_OUT = carpeta de salida).
const path = require('node:path'), fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const url = process.env.AGRO_URL || 'http://127.0.0.1:4386', out = process.env.AGRO_QA_OUT; assert.ok(out); fs.mkdirSync(out, {recursive: true});
(async () => {
  const browser = await chromium.launch({args: ['--use-angle=d3d11', '--ignore-gpu-blocklist']}), page = await (await browser.newContext({viewport: {width: 1600, height: 950}, serviceWorkers: 'block'})).newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url + '/agro-galeria-3d/'); await page.getByTestId('agro-gallery').waitFor();
  const shot = async n => { await page.waitForTimeout(2200); await page.screenshot({path: path.join(out, n + '.png')}); };
  const pick = async (family, status) => { await page.getByLabel('Familia').selectOption(family); await page.getByLabel('Estado').selectOption(status); await page.getByLabel('Buscar').fill(''); };
  // ficha individual desde varios ángulos
  await page.getByLabel('Buscar').fill('Tomato_4'); await page.locator('.gal-list button').first().click();
  for (const v of ['3/4', 'Frontal', 'Lateral', 'Superior']) { await page.getByRole('button', {name: v, exact: true}).click(); await shot('galeria-tomate4-' + v.replace('/', '-')); }
  await page.getByLabel('Buscar').fill('Barn'); await page.locator('.gal-list button').first().click(); await page.getByRole('button', {name: '3/4', exact: true}).click(); await shot('galeria-barn');
  // hojas comparativas por estado y familia
  await pick('todas', 'listo'); await page.getByLabel('Buscar').fill('_4'); await page.getByRole('button', {name: /Hoja comparativa/}).click(); await shot('galeria-hoja-listos-etapa4');
  await pick('estructuras-agricolas', 'todos'); await shot('galeria-hoja-estructuras');
  await pick('arboles-vegetacion', 'descartar'); await shot('galeria-hoja-descartados-arboles');
  await pick('terrenos-rocas', 'todos'); await shot('galeria-hoja-rocas-sin-color');
  await pick('animales', 'todos'); await shot('galeria-hoja-animales');
  await page.getByRole('button', {name: /Escena de prueba/}).click(); await shot('galeria-escena-prueba-oasis');
  console.log('errores:', errors.length, errors.slice(0, 3)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
