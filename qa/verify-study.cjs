const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  crypto = require("node:crypto");
const { build } = require("esbuild");
const {
  chromium,
} = require("C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const url = process.env.PANELLAB_URL || "http://127.0.0.1:4330/";
const report = { checks: [], errors: [], viewports: [] };
const pass = (text) => {
  report.checks.push(text);
  console.log("PASS", text);
};
(async () => {
  await build({
    entryPoints: ["src/study/model.ts", "src/study/grading.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    outdir: "qa/estudio/model",
    outExtension: { ".js": ".cjs" },
    logLevel: "silent",
  });
  const m = require("./estudio/model/model.cjs"),
    g = require("./estudio/model/grading.cjs");
  assert.equal(m.lessons.length, 8);
  assert.equal(m.alternatives.length, 32);
  assert.equal(m.developments.length, 12);
  assert.equal(m.cases.length, 7);
  for (const c of m.cases) {
    const v = c.given;
    if (c.topic === "coordinacion")
      assert.equal(
        m.coordination(v.In_A, v.Ip_A, v.Iz_A),
        c.expected.basic_coordination,
      );
    if (c.topic === "conductores")
      assert.ok(
        Math.abs(m.cableCapacity(v.Itabla_A, v.fT, v.fG) - c.expected.Iz_A) <
          0.00001,
      );
    if (c.topic === "motor-trifasico")
      assert.equal(
        Number(m.motorCurrent(v.Pout_kW, v.VLL_V, v.eta, v.cosphi).toFixed(2)),
        c.expected.In_A_rounded_2dec,
      );
  }
  let previous;
  for (let i = 0; i < 100; i++) {
    const exam = m.newExam(previous);
    assert.equal(new Set(exam.alternatives).size, 8);
    assert.equal(new Set(exam.developments).size, 3);
    assert.equal(
      new Set(
        exam.alternatives.map(
          (id) => m.alternatives.find((q) => q.id === id).theme,
        ),
      ).size,
      8,
    );
    if (previous)
      assert.ok(
        !exam.alternatives.some((id) => previous.alternatives.includes(id)) &&
          !exam.developments.some((id) => previous.developments.includes(id)),
      );
    previous = exam;
    assert.equal(
      m.readState({ ...m.freshState(), exams: [exam] }).exams.length,
      1,
    );
  }
  for (const q of g.answerBank)
    for (let i = 0; i < 4; i++)
      assert.equal(g.gradeAlternative(q.id, String(i)), i === q.correct_index);
  for (const raw of [
    null,
    {},
    { ...m.freshState(), schemaVersion: 2 },
    { ...m.freshState(), drafts: { termomagnetico: { curve: "X" } } },
    { ...m.freshState(), exams: [{ ...previous, alternatives: ["ALT-01"] }] },
    { ...m.freshState(), exams: [{ ...previous, answers: { "ALT-01": "x" } }] },
  ])
    assert.throws(() => m.readState(raw));
  pass(
    "8 lecciones, 32 alternativas, 12 desarrollos; 7 cálculos; corrección de todas las opciones; 100 simulacros sin duplicados y con cobertura de ocho temas; almacenamiento inválido rechazado",
  );
  const baseline = JSON.parse(
    fs
      .readFileSync("qa/estudio/baseline-hashes.json", "utf8")
      .replace(/^\uFEFF/, ""),
  );
  const changed = baseline
    .filter(
      (f) =>
        fs.existsSync(f.Path) &&
        crypto
          .createHash("sha256")
          .update(fs.readFileSync(f.Path))
          .digest("hex")
          .toUpperCase() !== f.Hash,
    )
    .map((f) => f.Path.split("PanelLab-INACAP\\")[1]);
  assert.deepEqual(
    changed.sort(),
    ["public\\sw.js", "src\\components\\Home.tsx"].sort(),
  );
  pass(
    "Hashes originales: solo Home.tsx y la rama exclusiva de estudio en sw.js cambian; modelos, componentes y estilos del Banco intactos",
  );
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
        viewport: { width: 1672, height: 1040 },
        serviceWorkers: "block",
      }),
      p = await context.newPage();
    p.on("pageerror", (e) => report.errors.push(e.message));
    p.on("console", (e) => {
      if (e.type() === "error") report.errors.push(e.text());
    });
    p.on("response", (r) => {
      if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`);
    });
    const loaded = () => p.locator(".study-layout").waitFor();
    const state = () =>
      p.evaluate((key) => JSON.parse(localStorage.getItem(key)), m.STORAGE_KEY);
    const topic = async (id) => {
      if (await p.locator(".study-mobile-topics").isVisible())
        await p.locator(".study-mobile-topics select").selectOption(id);
      else
        await p
          .locator(".study-sidebar nav button")
          .filter({ hasText: m.lessons.find((l) => l.id === id).title })
          .click();
    };
    const clickScreen = async (name) => {
      if (await p.locator(".study-mobile-topics").isVisible())
        await p
          .locator(".study-mobile-topics select")
          .selectOption(name === "Evaluarme" ? "exam" : "progress");
      else
        await p
          .locator(".study-sidebar nav")
          .getByRole("button", { name, exact: true })
          .click();
    };
    const check = () =>
      p
        .getByRole("button", { name: "Comprobar respuesta", exact: true })
        .click();
    const assertFeedback = async (text) =>
      assert.match(await p.locator(".study-feedback").last().innerText(), text);
    await p.goto(url);
    await p.waitForFunction(
      () => !document.querySelector(".home-options button").disabled,
    );
    assert.equal(await p.locator(".home-module-card").count(), 2);
    const panelStorage = await p.evaluate(() => ({ ...localStorage }));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: "qa/estudio/inicio-desktop.png",
      fullPage: true,
      animations: "disabled",
    });
    await p.getByRole("link", { name: /Entrar a estudiar/ }).click();
    await loaded();
    await topic("objetivos-fallas");
    await p.getByLabel("Situación del circuito").selectOption("corto");
    await p.getByLabel("Sobrecarga", { exact: true }).check();
    await check();
    await assertFeedback(/Revisa/);
    await p.getByLabel("Cortocircuito", { exact: true }).check();
    await check();
    await assertFeedback(/Correcto/);
    await p
      .getByRole("button", { name: "Esfuerzo magnético", exact: true })
      .click();
    assert.match(await p.locator(".study-activity").innerText(), /deformar/);
    await topic("coordinacion");
    await p.getByLabel("Protección Ip (A)", { exact: true }).fill("32");
    await p.getByLabel("No, incumple una condición").check();
    await check();
    await assertFeedback(/Ip supera Iz/);
    await p.getByLabel("Carga In (A)", { exact: true }).fill("");
    await check();
    await assertFeedback(/Datos incompletos/);
    await p.getByLabel("Carga In (A)", { exact: true }).fill("18");
    await p.getByLabel("Protección Ip (A)", { exact: true }).fill("20");
    await p.getByLabel("Sí, cumple la desigualdad").check();
    await check();
    await assertFeedback(/Correcto/);
    await topic("termomagnetico");
    await p.getByRole("button", { name: "C", exact: true }).click();
    await p.getByLabel("Nominal didáctica Ip (A)").fill("16");
    assert.match(await p.locator(".study-output").innerText(), /80–160/);
    await p.getByRole("button", { name: "D", exact: true }).click();
    assert.match(await p.locator(".study-output").innerText(), /160–320/);
    await p.getByLabel("Nominal didáctica Ip (A)").fill("10");
    await p.getByRole("button", { name: "B", exact: true }).click();
    await p.locator(".term-explorer summary").click();
    await p.getByRole("button", { name: "Bornes", exact: true }).click();
    assert.match(
      await p.locator(".term-explorer").innerText(),
      /puntos de conexión/,
    );
    await p.getByRole("button", { name: "Magnético", exact: true }).click();
    assert.match(
      await p.locator(".term-explorer").innerText(),
      /suficientemente elevado/,
    );
    await p.getByLabel("Térmico", { exact: true }).check();
    await check();
    assert.match(await p.locator(".term-explorer").innerText(), /Correcto/);
    await p.locator(".term-explorer summary").click();
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.screenshot({
      path: "qa/estudio/leccion-desktop.png",
      fullPage: true,
      animations: "disabled",
    });
    await topic("fusibles");
    await p.getByRole("button", { name: "200 kA", exact: true }).click();
    assert.match(
      await p.locator(".study-activity").innerText(),
      /Capacidad de ruptura/,
    );
    await p.getByLabel("gG", { exact: true }).check();
    await p.getByLabel("Compatibilidad declarada").selectOption("CC");
    await check();
    await assertFeedback(/Revisa/);
    await p.getByLabel("Compatibilidad declarada").selectOption("CA");
    await check();
    await assertFeedback(/Correcto/);
    await topic("conductores");
    assert.match(await p.locator(".study-output").innerText(), /21,6/);
    await p.getByLabel("Tu resultado Iz (A)").fill("21.6");
    await check();
    await assertFeedback(/Correcto/);
    await p.getByLabel("Caso de práctica").selectOption("CABLE-02");
    await p.getByLabel("Tu resultado Iz (A)").fill("25.5");
    await check();
    await assertFeedback(/Correcto/);
    await p.getByLabel("Factor temperatura fT").fill("0");
    await check();
    await assertFeedback(/Datos incompletos/);
    await topic("guardamotor");
    await p.getByLabel("Rango térmico hipotético (A)").selectOption("4–6");
    await check();
    await assertFeedback(/fuera del rango/);
    await p.getByLabel("Rango térmico hipotético (A)").selectOption("6–10");
    await check();
    await assertFeedback(/Correcto/);
    await p.getByLabel("Ajuste térmico propuesto (A)").fill("8");
    await check();
    await assertFeedback(/no coincide/);
    await topic("tierra-sobretension");
    await p.getByLabel("Fenómeno observado").selectOption("fuga");
    assert.match(await p.locator(".study-output").innerText(), /30 mA/);
    await p.getByLabel("SPD", { exact: true }).check();
    await check();
    await assertFeedback(/Revisa/);
    await p.getByLabel("Diferencial RCD", { exact: true }).check();
    await check();
    await assertFeedback(/Correcto/);
    await topic("motor-trifasico");
    assert.match(await p.locator(".study-output").innerText(), /10,87/);
    await p.getByLabel("Tu resultado I (A)").fill("10.87");
    await check();
    await assertFeedback(/Correcto/);
    await p.getByLabel("Rendimiento η (0–1)").fill("0");
    assert.equal(await p.locator(".study-output").count(), 0);
    await check();
    await assertFeedback(/Datos incompletos/);
    await p.getByLabel("Rendimiento η (0–1)").fill(".88");
    await p.getByLabel("Tensión entre líneas VLL (V)").fill("0");
    await check();
    await assertFeedback(/Datos incompletos/);
    await p.getByLabel("Caso de práctica").selectOption("MOTOR-02");
    await p.getByLabel("Tu resultado I (A)").fill("4.92");
    await check();
    await assertFeedback(/Correcto/);
    pass(
      "Ocho actividades: cambios visuales, estados correctos/incorrectos/incompletos, B/C/D proporcionales, fusible CA/CC, conductores, dial, fuga de 30 mA y motor sin NaN/Infinity",
    );
    await p.getByRole("button", { name: /Practicar este tema/ }).click();
    await p
      .getByRole("button", { name: "Pista 1 de 3", exact: true })
      .first()
      .click();
    await p
      .getByRole("button", { name: "Pista 2 de 3", exact: true })
      .first()
      .click();
    await p
      .getByRole("button", { name: "Pista 3 de 3", exact: true })
      .first()
      .click();
    assert.equal(await p.locator(".study-hints li").count(), 3);
    await topic("coordinacion");
    await p.getByRole("button", { name: /Practicar este tema/ }).click();
    await p.getByRole("button", { name: /Preguntas del tema/ }).click();
    for (const [i, q] of g.answerBank
      .filter((q) => q.theme === "coordinacion")
      .entries()) {
      await p.locator(`input[name="${q.id}"]`).nth(q.correct_index).check();
      await p
        .getByRole("button", {
          name: `Comprobar alternativa ${i + 1}`,
          exact: true,
        })
        .click();
    }
    await p
      .getByRole("button", { name: "Marcar este tema revisado", exact: true })
      .click();
    await p.reload();
    await loaded();
    assert.equal(
      m.lessonStatus((await state()).progress.coordinacion),
      "Dominada",
    );
    assert.equal((await state()).lesson, "coordinacion");
    const afterStudy = await p.evaluate(() => ({ ...localStorage }));
    for (const [k, v] of Object.entries(panelStorage))
      assert.equal(afterStudy[k], v, `${k} fue alterado por estudio`);
    pass(
      "Práctica con pistas escalonadas, cuatro alternativas por tema, dominio con criterio verificable y recarga; guardados del panel conservados byte por byte",
    );
    await clickScreen("Evaluarme");
    await p.getByRole("button", { name: "Comenzar simulacro · 8 + 3" }).click();
    let e = (await state()).exams.at(-1);
    assert.equal(e.alternatives.length, 8);
    assert.equal(e.developments.length, 3);
    assert.equal(await p.getByText(/Pista [123]/).count(), 0);
    assert.ok(!JSON.stringify(e).match(/correct_index|model_answer|rubric/));
    assert.equal(await p.locator(".study-feedback").count(), 0);
    for (let i = 0; i < 8; i++) {
      const q = g.answerBank.find((q) => q.id === e.alternatives[i]);
      const chosen = i === 0 ? (q.correct_index + 1) % 4 : q.correct_index;
      await p.locator(`input[name="${q.id}"]`).nth(chosen).check();
      await p
        .getByRole("button", { name: "Siguiente pregunta", exact: true })
        .click();
    }
    await p
      .locator("textarea")
      .fill(
        "Mi explicación propia queda guardada incluso al volver y recargar.",
      );
    await p.getByRole("button", { name: "Anterior", exact: true }).click();
    await p
      .getByRole("button", { name: "Siguiente pregunta", exact: true })
      .click();
    await p.reload();
    await loaded();
    assert.match(
      await p.locator("textarea").inputValue(),
      /Mi explicación propia/,
    );
    await p
      .getByRole("button", { name: "Siguiente pregunta", exact: true })
      .click();
    await p.locator("textarea").fill("Segundo desarrollo.");
    await p
      .getByRole("button", { name: "Siguiente pregunta", exact: true })
      .click();
    await p.locator("textarea").fill("Tercer desarrollo.");
    assert.equal(
      await p
        .locator("body")
        .getByText("Pauta orientativa:", { exact: false })
        .count(),
      0,
    );
    await p
      .getByRole("button", { name: "Revisar y enviar", exact: true })
      .click();
    assert.equal(await p.locator(".exam-review li").count(), 11);
    assert.equal(
      await p
        .getByRole("button", { name: "Enviar y corregir", exact: true })
        .isDisabled(),
      true,
    );
    await p.getByRole("checkbox", { name: /Confirmo el envío/ }).check();
    await p
      .getByRole("button", { name: "Enviar y corregir", exact: true })
      .click();
    await p.locator(".exam-score").waitFor();
    assert.match(await p.locator(".exam-score").innerText(), /7 \/ 8/);
    assert.equal(await p.locator(".saved-development").count(), 3);
    assert.ok(
      (await p.getByText("Pauta orientativa:", { exact: false }).count()) === 3,
    );
    await p.locator(".study-results .study-check input").nth(1).check();
    await p.reload();
    await loaded();
    await p.locator(".exam-score").waitFor();
    assert.equal(
      await p.locator(".study-results .study-check input").nth(1).isChecked(),
      true,
    );
    await p.screenshot({
      path: "qa/estudio/resultados-desktop.png",
      fullPage: true,
      animations: "disabled",
    });
    const old = (await state()).exams.at(-1);
    await p
      .getByRole("button", { name: "Nuevo simulacro", exact: true })
      .click();
    e = (await state()).exams.at(-1);
    assert.ok(!e.alternatives.some((id) => old.alternatives.includes(id)));
    assert.ok(!e.developments.some((id) => old.developments.includes(id)));
    await p
      .getByRole("button", { name: "Revisar y enviar", exact: true })
      .click();
    await p
      .getByRole("checkbox", {
        name: /Confirmo el envío con 11 respuestas pendientes/,
      })
      .check();
    await p
      .getByRole("button", { name: "Enviar y corregir", exact: true })
      .click();
    await p.locator(".exam-score").waitFor();
    assert.match(await p.locator(".exam-score").innerText(), /0 \/ 8/);
    pass(
      "Simulacro completo 8+3: respuestas y posición sobreviven navegación/recarga, sin pautas en intento, confirmación, corrección 7/8 y 0/8, rúbrica manual persistente y reintento distinto",
    );
    for (const width of [375, 390, 768, 1280, 1920]) {
      await p.setViewportSize({ width, height: width < 600 ? 844 : 1080 });
      await topic("termomagnetico");
      await p.evaluate(() => document.fonts.ready);
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `overflow ${width}`,
      );
      assert.ok(
        await p
          .locator(".study-photo .media-stage img")
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      );
      if (width === 390)
        await p.screenshot({
          path: "qa/estudio/leccion-mobile.png",
          fullPage: true,
          animations: "disabled",
        });
      await p.getByRole("button", { name: /Practicar este tema/ }).click();
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await clickScreen("Evaluarme");
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await clickScreen("Mi progreso");
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      report.viewports.push(width);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(url);
    await p.waitForFunction(
      () => !document.querySelector(".home-options button").disabled,
    );
    await p.screenshot({
      path: "qa/estudio/inicio-mobile.png",
      fullPage: true,
      animations: "disabled",
    });
    await p
      .getByRole("button", { name: "Continuar práctica", exact: true })
      .click();
    await p.locator(".board-svg").waitFor();
    await p.screenshot({ path: "qa/estudio/panel-mobile-final.png" });
    assert.equal(await p.locator("[data-terminal-id]").count(), 94);
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.goto(url + "?view=simulator");
    await p.locator(".board-svg").waitFor();
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: "qa/estudio/panel-desktop-final.png" });
    await p
      .getByRole("button", { name: "Abrir diagrama", exact: true })
      .click();
    await p.locator(".cade-artboard").waitFor();
    await p
      .getByRole("button", { name: "Ampliar diagrama", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Volver al banco", exact: true })
      .last()
      .click();
    pass(
      "375/390/768/1280/1920: lección, práctica, resultados y progreso sin desbordamiento; inicio conserva entrada al Banco, 94 bornes, diagrama flotante y ampliación",
    );
    await context.close();
    const bad = await browser.newContext({ serviceWorkers: "block" });
    await bad.addInitScript(
      (key) => localStorage.setItem(key, "{invalido"),
      m.STORAGE_KEY,
    );
    const bp = await bad.newPage();
    await bp.goto(url + "estudio");
    await bp.getByRole("alert").waitFor();
    assert.equal(
      await bp.evaluate((key) => localStorage.getItem(key), m.STORAGE_KEY),
      "{invalido",
    );
    await bad.close();
    pass(
      "Progreso corrupto se conserva y muestra recuperación; no se sobreescribe silenciosamente",
    );
    assert.deepEqual(report.errors, []);
    report.result = "PASS";
  } finally {
    await browser.close();
    fs.writeFileSync(
      "qa/estudio/verification.json",
      JSON.stringify(report, null, 2),
    );
  }
})().catch((e) => {
  report.result = "FAIL";
  report.failure = e.stack;
  fs.writeFileSync(
    "qa/estudio/verification.json",
    JSON.stringify(report, null, 2),
  );
  console.error(e);
  process.exitCode = 1;
});
