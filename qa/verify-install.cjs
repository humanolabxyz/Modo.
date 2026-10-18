/* Instalación como app: aviso en iPhone (instrucciones), aviso nativo en PC/Android, botón del pie,
   diálogo por dispositivo y ausencia del aviso en modo app instalada. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, devices} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4410').replace(/\/$/, '');
const out = path.join(__dirname, 'install');
fs.mkdirSync(out, {recursive: true});

const fakeInstallEvent = () => {
  window.__prompted = 0;
  const event = new Event('beforeinstallprompt', {cancelable: true});
  event.prompt = async () => { window.__prompted++; };
  event.userChoice = Promise.resolve({outcome: 'accepted'});
  window.dispatchEvent(event);
};

(async () => {
  const browser = await chromium.launch();
  const r = {};

  // iPhone (Safari): sin evento nativo → aviso con «Ver cómo» e instrucciones de iOS.
  {
    const ctx = await browser.newContext({...devices['iPhone 13']});
    const page = await ctx.newPage();
    await page.addInitScript(() => localStorage.setItem('modo-tutoriales-bienvenida-v1', '1'));
    await page.goto(base + '/', {waitUntil: 'load'});
    const banner = page.locator('.install-banner');
    await banner.waitFor({timeout: 12000});
    assert.match(await banner.innerText(), /iPhone/);
    await page.screenshot({path: path.join(out, 'ios-aviso.png')});
    await banner.getByRole('button', {name: 'Ver cómo'}).click();
    const dlg = page.locator('dialog.install-dialog');
    await dlg.waitFor();
    assert.equal(await dlg.getByRole('tab', {selected: true}).innerText(), 'iPhone y iPad');
    assert.match(await dlg.innerText(), /Añadir a pantalla de inicio/);
    await page.screenshot({path: path.join(out, 'ios-instrucciones.png')});
    await page.keyboard.press('Escape');
    await dlg.waitFor({state: 'detached'});
    // «Ahora no» se recuerda: no vuelve a salir al recargar.
    r.ios = {aviso: true, instrucciones: true};
    await page.reload({waitUntil: 'load'});
    await page.waitForTimeout(3500);
    assert.equal(await page.locator('.install-banner').count(), 0, 'el aviso no debe volver tras cerrarlo');
    // El botón del pie sigue disponible.
    await page.locator('.install-link').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.install-link').count(), 1);
    await ctx.close();
  }

  // PC (Chrome/Edge): evento nativo → «Instalar» lanza el aviso del navegador.
  {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    const page = await ctx.newPage();
    await page.addInitScript(() => localStorage.setItem('modo-tutoriales-bienvenida-v1', '1'));
    await page.goto(base + '/', {waitUntil: 'load'});
    await page.evaluate(fakeInstallEvent);
    const banner = page.locator('.install-banner');
    await banner.waitFor({timeout: 12000});
    assert.match(await banner.innerText(), /¿Instalar modo\. en este equipo\?/);
    await page.screenshot({path: path.join(out, 'pc-aviso.png')});
    await banner.getByRole('button', {name: 'Instalar', exact: true}).click();
    await page.waitForFunction(() => window.__prompted === 1);
    await page.locator('.install-banner').waitFor({state: 'detached'});
    r.pc = {aviso: true, promptNativo: true};
    await ctx.close();
  }

  // Android: pestaña de Android por defecto en el diálogo.
  {
    const ctx = await browser.newContext({...devices['Pixel 7']});
    const page = await ctx.newPage();
    await page.addInitScript(() => localStorage.setItem('modo-tutoriales-bienvenida-v1', '1'));
    await page.goto(base + '/', {waitUntil: 'load'});
    await page.locator('.install-link').click();
    const dlg = page.locator('dialog.install-dialog');
    await dlg.waitFor();
    assert.equal(await dlg.getByRole('tab', {selected: true}).innerText(), 'Android');
    await dlg.getByRole('tab', {name: 'Computador'}).click();
    assert.match(await dlg.innerText(), /Chrome.*Edge/s);
    await page.screenshot({path: path.join(out, 'android-instrucciones.png')});
    r.android = {pestanaPorDefecto: 'Android', cambioDePestana: true};
    await ctx.close();
  }

  // App instalada (display-mode: standalone): sin botón ni aviso.
  {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      const mm = window.matchMedia.bind(window);
      window.matchMedia = q => /display-mode: standalone/.test(q) ? {matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}} : mm(q);
    });
    await page.goto(base + '/', {waitUntil: 'load'});
    await page.waitForTimeout(3500);
    assert.equal(await page.locator('.install-link,.install-banner').count(), 0);
    r.instalada = {sinAviso: true};
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(r, null, 2));
  console.log(JSON.stringify(r, null, 2));
  console.log('PASS verify-install');
})().catch(e => { console.error(e); process.exit(1); });
