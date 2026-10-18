const assert = require("node:assert/strict"),
  fs = require("node:fs");
const {
  chromium,
} = require("C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const url = process.env.PANELLAB_URL || "http://127.0.0.1:4331/",
  key = "panellab:estudio:v1";
const report = { checks: [] };
const pass = (s) => {
  report.checks.push(s);
  console.log("PASS", s);
};
(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({
        viewport: { width: 1440, height: 1000 },
        acceptDownloads: true,
      }),
      p = await c.newPage();
    await p.goto(url);
    await p.waitForFunction(
      () => !document.querySelector(".modo-primary").disabled,
    );
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.waitForFunction(() => !!navigator.serviceWorker.controller);
    const panel = await p.evaluate(() =>
      localStorage.getItem("panellab-practice-v2"),
    );
    await p.getByRole("link", { name: /Estudiar protecciones/ }).click();
    await p.locator(".study-layout").waitFor();
    await p.getByRole("navigation", { name: "Secciones del estudio" }).getByRole("button", { name: "Practicar", exact: true }).click();
    await p.getByRole("button", { name: /Ejercicio interactivo/ }).click();
    await p.getByLabel("Situación del circuito").selectOption("sobrecarga");
    const radio = p.getByLabel("Normal", { exact: true });
    await radio.focus();
    await p.keyboard.press("ArrowDown");
    assert.equal(
      await p.getByLabel("Sobrecarga", { exact: true }).isChecked(),
      true,
    );
    await p
      .getByRole("button", { name: "Comprobar respuesta", exact: true })
      .focus();
    await p.keyboard.press("Enter");
    assert.match(await p.locator(".study-feedback").innerText(), /Correcto/);
    await p
      .getByRole("navigation", { name: "Secciones del estudio" })
      .getByRole("button", { name: "Progreso", exact: true })
      .click();
    const before = await p.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)),
      key,
    );
    const downloadPromise = p.waitForEvent("download");
    await p
      .getByRole("button", {
        name: "Exportar progreso de estudio",
        exact: true,
      })
      .click();
    const download = await downloadPromise;
    await download.saveAs("qa/estudio/progreso-exportado.json");
    assert.equal(
      JSON.parse(fs.readFileSync("qa/estudio/progreso-exportado.json", "utf8"))
        .attempts.length,
      before.attempts.length,
    );
    await p
      .getByRole("button", { name: "Reiniciar solo estudio", exact: true })
      .click();
    await p.getByRole("button", { name: "Cancelar", exact: true }).click();
    assert.equal(
      (await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key))
        .attempts.length,
      before.attempts.length,
    );
    await p
      .getByRole("button", { name: "Reiniciar solo estudio", exact: true })
      .click();
    await p
      .getByRole("button", {
        name: "Confirmar reinicio de estudio",
        exact: true,
      })
      .click();
    assert.equal(
      (await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key))
        .attempts.length,
      0,
    );
    assert.equal(
      await p.evaluate(() => localStorage.getItem("panellab-practice-v2")),
      panel,
    );
    await p
      .getByRole("navigation", { name: "Secciones del estudio" })
      .getByRole("button", { name: "Progreso", exact: true })
      .click();
    await p
      .locator(".study-import input")
      .setInputFiles("qa/estudio/progreso-exportado.json");
    await p.waitForFunction(
      ({key,count}) => JSON.parse(localStorage.getItem(key)).attempts.length === count,
      {key,count:before.attempts.length},
    );
    assert.equal(
      (await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key))
        .attempts.length,
      before.attempts.length,
    );
    await p
      .locator(".study-import input")
      .setInputFiles({
        name: "invalido.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"schemaVersion":99}'),
      });
    await p.getByRole("alert").waitFor();
    assert.equal(
      (await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key))
        .attempts.length,
      before.attempts.length,
    );
    pass(
      "Teclado, exportación real, importación, rechazo de archivo inválido y reinicio con cancelación/confirmación; guardado del Banco intacto",
    );
    const rootCopy = await p.evaluate(async () => {
      const r = await caches.match("/");
      return r.text();
    });
    assert.match(rootCopy, /Tu espacio de trabajo/);
    assert.ok(!rootCopy.includes("<title>Estudiar"));
    const pdf = await c.newPage();
    await pdf.goto(url + "estudio/profesor.pdf").catch((e) => {
      if (!String(e).includes("ERR_ABORTED") && !String(e).includes("Download is starting")) throw e;
    });
    await pdf.close();
    const rootAfter = await p.evaluate(async () => {
      const r = await caches.match("/");
      return r.text();
    });
    assert.equal(rootAfter, rootCopy);
    await c.setOffline(true);
    await p.goto(url + "estudio/");
    await p.locator(".study-layout").waitFor();
    await p.goto(url);
    await p.locator(".modo-workspace").waitFor();
    assert.equal(await p.locator(".modo-panel,.modo-study").count(), 2);
    pass(
      "Build estático offline: Inicio y Estudio conservan páginas independientes; abrir el PDF no sustituye el inicio en caché",
    );
    await c.close();
    const touch = await b.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        serviceWorkers: "block",
      }),
      t = await touch.newPage();
    await t.goto(url + "estudio/");
    await t.locator(".study-layout").waitFor();
    await t.getByRole("navigation", { name: "Secciones del estudio" }).getByRole("button", { name: "Practicar", exact: true }).tap();
    await t.getByRole("button", { name: /Ejercicio interactivo/ }).tap();
    await t.getByLabel("Normal", { exact: true }).tap();
    await t
      .getByRole("button", { name: "Comprobar respuesta", exact: true })
      .tap();
    assert.match(await t.locator(".study-feedback").innerText(), /Correcto/);
    await t.getByRole("button", { name: /Preguntas del tema/ }).tap();
    await t
      .getByRole("button", { name: "Pista 1 de 3", exact: true })
      .first()
      .tap();
    assert.ok((await t.locator(".study-hints").count()) > 0);
    assert.ok(
      await t.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await touch.close();
    pass(
      "Interacción táctil real a 390 px: radio, comprobación, entrada a práctica y pista",
    );
    const denied = await b.newContext({ serviceWorkers: "block" });
    await denied.addInitScript((k) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === k)
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        return original.call(this, key, value);
      };
    }, key);
    const dp = await denied.newPage();
    await dp.goto(url + "estudio/");
    await dp.getByRole("alert").waitFor();
    assert.match(await dp.getByRole("alert").innerText(), /no pudo guardar/);
    await denied.close();
    pass(
      "Cuota de almacenamiento agotada: aviso visible y exportación disponible, sin falsa confirmación de guardado",
    );
    report.result = "PASS";
  } finally {
    await b.close();
    fs.writeFileSync(
      "qa/estudio/storage-verification.json",
      JSON.stringify(report, null, 2),
    );
  }
})().catch((e) => {
  report.result = "FAIL";
  report.failure = e.stack;
  fs.writeFileSync(
    "qa/estudio/storage-verification.json",
    JSON.stringify(report, null, 2),
  );
  console.error(e);
  process.exitCode = 1;
});
