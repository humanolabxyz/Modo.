const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  crypto = require("node:crypto");
const {
  chromium,
} = require("C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const sharp = require("sharp");
const url = process.env.PANELLAB_URL || "http://127.0.0.1:4330/",
  key = "panellab:estudio:v1";
const lessons = JSON.parse(
  fs.readFileSync("src/study/content/lecciones.json"),
).lessons;
const alts = JSON.parse(
  fs.readFileSync("src/study/content/preguntas_alternativas_32.json"),
).questions;
const devs = JSON.parse(
  fs.readFileSync("src/study/content/preguntas_desarrollo_12.json"),
).questions;
const report = {
  checks: [],
  screenshots: [],
  viewports: [],
  errors: [],
  contrast: [],
};
const pass = (s) => {
  report.checks.push(s);
  console.log("PASS", s);
};
(async () => {
  const baseline = JSON.parse(
    fs
      .readFileSync("qa/estudio-v2/baseline-hashes.json", "utf8")
      .replace(/^\uFEFF/, ""),
  );
  const changed = baseline
    .filter(
      (f) =>
        crypto
          .createHash("sha256")
          .update(fs.readFileSync(f.Path))
          .digest("hex")
          .toUpperCase() !== f.Hash,
    )
    .map((f) => f.Path.split("PanelLab-INACAP\\")[1]);
  for (const f of changed)
    assert.ok(
      /^src\\study\\.*\.tsx$/.test(f) ||
        /^src\\styles\\study/.test(f) ||
        f === "src\\pages\\estudio.astro" ||
        f === "src\\components\\Home.tsx",
      `fuera del módulo: ${f}`,
    );
  assert.ok(
    !changed.some((f) => f.startsWith("public")),
    "Se alteró material previo",
  );
  for (const file of [
    "termomagnetico-v2",
    "fusibles-v2",
    "spd-diferencial-v2",
    "motor-v2",
  ]) {
    const meta = await sharp(`public/estudio/assets/${file}.webp`).metadata();
    assert.ok(meta.width >= 900 && meta.hasAlpha);
    assert.ok(fs.statSync(`public/estudio/assets/${file}.webp`).size < 400000);
  }
  pass(
    "Cambios limitados al estudio/inicio; material original, motor de cálculo y Banco intactos; cuatro assets WebP locales con alpha y menos de 400 kB cada uno",
  );
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({
        viewport: { width: 1672, height: 1000 },
        serviceWorkers: "block",
      }),
      p = await ctx.newPage();
    p.on("pageerror", (e) => report.errors.push(e.message));
    p.on("response", (r) => {
      if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`);
    });
    const data = () =>
      p.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
    const topic = async (id) => {
      if (await p.locator(".study-mobile-topics").isVisible())
        await p.locator(".study-mobile-topics select").selectOption(id);
      else
        await p
          .locator(".study-sidebar nav>button")
          .filter({ hasText: lessons.find((l) => l.id === id).title })
          .click();
    };
    const section = async (name) =>
      p
        .getByRole("navigation", { name: "Secciones del estudio" })
        .getByRole("button", { name, exact: true })
        .click();
    const snap = async (name) => {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.evaluate(() => document.fonts.ready);
      await p.waitForFunction(() =>
        Array.from(document.images)
          .filter((img) => img.getClientRects().length > 0)
          .every((img) => img.complete && img.naturalWidth > 0),
      );
      await p.screenshot({
        path: `qa/estudio-v2/${name}.png`,
        fullPage: true,
        animations: "disabled",
      });
      report.screenshots.push({ file: `${name}.png`, ...p.viewportSize() });
    };
    const fits = async (name) =>
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${name}: desborde`,
      );
    const contrast = async (label) => {
      const issues = await p.evaluate(() => {
        const rgb = (s) => {
          const v = s.match(/[\d.]+/g)?.map(Number) || [];
          return v.length >= 3 ? v : null;
        };
        const lum = (v) =>
          v
            .slice(0, 3)
            .map((c) => c / 255)
            .map((c) =>
              c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
            )
            .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
        return Array.from(
          document.querySelectorAll(
            ".study-card-heading h2,.study-card-heading p,.topic-short-title,.topic-label small,.media-explanation p,.lesson-media figcaption small,.study-section-tabs button,.practice-overview p,.practice-phase-nav button small,.exam-attempt-header small,.exam-review button span,.study-options legend,.study-footer,.development-field small",
          ),
        )
          .filter((e) => e.getClientRects().length && e.checkVisibility())
          .map((el) => {
            const css = getComputedStyle(el),
              color = rgb(css.color);
            let parent = el,
              bg = null;
            while (parent && !bg) {
              const c = rgb(getComputedStyle(parent).backgroundColor);
              if (c && (c.length < 4 || c[3] === 1)) bg = c;
              parent = parent.parentElement;
            }
            bg ||= [246, 247, 248];
            if (!color) return null;
            const a = lum(color),
              bb = lum(bg),
              ratio = (Math.max(a, bb) + 0.05) / (Math.min(a, bb) + 0.05),
              large =
                parseFloat(css.fontSize) >= 24 ||
                (parseFloat(css.fontSize) >= 18.66 &&
                  Number(css.fontWeight) >= 700);
            return ratio < (large ? 3 : 4.5)
              ? {
                  text: el.textContent.trim().slice(0, 65),
                  ratio: Number(ratio.toFixed(2)),
                  color: css.color,
                  bg,
                }
              : null;
          })
          .filter(Boolean);
      });
      report.contrast.push({ screen: label, issues });
      assert.deepEqual(issues, [], `Contraste ${label}`);
    };
    await p.goto(url + "estudio/");
    await p.locator(".study-layout").waitFor();
    await p.addStyleTag({
      content:
        ".study-shell *{animation:none!important;transition:none!important}",
    });
    const search = p.getByRole("textbox", { name: "Buscar tema", exact: true });
    await search.fill("fusible");
    assert.equal(await p.locator(".topic-desktop-list nav>button").count(), 1);
    await search.fill("zzsinresultado");
    assert.equal(await p.locator(".topic-empty").count(), 2);
    assert.ok(await p.locator(".topic-desktop-list .topic-empty").isVisible());
    await p
      .locator(".topic-desktop-list")
      .getByRole("button", { name: "Limpiar búsqueda" })
      .click();
    assert.equal(await p.locator(".topic-desktop-list nav>button").count(), 8);
    for (const l of lessons) {
      await topic(l.id);
      await fits(l.id);
      await snap(`tema-${l.id}-desktop`);
      if (l.id === "termomagnetico") {
        await p
          .getByRole("button", { name: "Explorar bornes", exact: true })
          .click();
        assert.equal(
          await p
            .getByRole("button", { name: "Explorar bornes", exact: true })
            .getAttribute("aria-pressed"),
          "true",
        );
        assert.match(
          await p.locator(".media-explanation").innerText(),
          /Puntos de conexión/,
        );
        await p
          .getByRole("button", { name: "Ver imagen original", exact: true })
          .click();
        await p.locator(".study-image-dialog[open]").waitFor();
        assert.ok(
          await p
            .locator(".study-image-dialog[open] img")
            .evaluate((e) => e.src.includes("/fotos/")),
        );
        await p.keyboard.press("Escape");
        assert.equal(await p.locator(".study-image-dialog[open]").count(), 0);
        await contrast("termomagnetico");
      }
      if (l.id === "conductores") {
        await p.getByRole("button", { name: "Aislación", exact: true }).click();
        assert.match(
          await p.locator(".media-explanation").innerText(),
          /aislación/,
        );
        await p
          .getByRole("button", { name: "Ver lámina del profesor", exact: true })
          .click();
        assert.match(
          await p.locator(".study-image-dialog[open] img").getAttribute("src"),
          /lamina-12/,
        );
        await p.keyboard.press("Escape");
      }
      if (l.id === "guardamotor") {
        await p.getByLabel("Ajuste térmico propuesto (A)").fill("8");
        assert.match(
          await p.locator(".lesson-diagram").textContent(),
          /ajuste 8 A/,
        );
      }
    }
    pass(
      "Ocho lecciones con imágenes/esquemas específicos; buscador, puntos explorables, capas de conductor, dial sincronizado y comparación con foto/lámina original",
    );
    await topic("termomagnetico");
    await section("Practicar");
    await p.getByRole("button", { name: /Preguntas del tema/ }).click();
    assert.equal(await p.locator(".study-question").count(), 4);
    assert.equal(await p.locator(".study-activity").count(), 0);
    await p.reload();
    await p.locator(".study-layout").waitFor();
    assert.equal(await p.locator(".study-question").count(), 4);
    await p.getByRole("button", { name: /Ejercicio interactivo/ }).click();
    assert.equal(await p.locator(".study-activity").count(), 1);
    await snap("practica-ejercicio-desktop");
    await p.getByRole("button", { name: /Preguntas del tema/ }).click();
    const q = alts.find((q) => q.theme === "termomagnetico");
    await p
      .locator(`input[name="${q.id}"]`)
      .nth((q.correct_index + 1) % 4)
      .check();
    await p
      .getByRole("button", { name: "Comprobar alternativa 1", exact: true })
      .click();
    assert.match(await p.locator(".study-feedback").innerText(), /Revisa/);
    await snap("practica-correccion-desktop");
    await p.locator(`input[name="${q.id}"]`).nth(q.correct_index).check();
    await p
      .getByRole("button", { name: "Comprobar alternativa 1", exact: true })
      .click();
    await section("Progreso");
    assert.equal(
      await p
        .getByRole("button", {
          name: new RegExp(q.question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        })
        .count(),
      0,
    );
    await snap("progreso-desktop");
    await contrast("progreso");
    pass(
      "Prácticas separadas en ejercicio/preguntas, pestaña conservada al recargar, corrección y eliminación de errores resueltos del repaso pendiente",
    );
    await section("Evaluarme");
    await snap("evaluarme-desktop");
    await contrast("introduccion-examen");
    await p.getByRole("button", { name: /Comenzar simulacro/ }).click();
    await snap("simulacro-desktop");
    await contrast("pregunta-examen");
    assert.equal(await p.locator(".study-feedback").count(), 0);
    assert.equal(
      await p.getByText("Pauta orientativa:", { exact: false }).count(),
      0,
    );
    assert.ok(
      !JSON.stringify((await data()).exams.at(-1)).match(
        /model_answer|correct_index|rubric/,
      ),
    );
    await p
      .getByRole("button", { name: "Revisar y enviar", exact: true })
      .click();
    await snap("revision-desktop");
    await contrast("revision");
    pass(
      "Introducción, pregunta y revisión de simulacro refinadas; sin claves ni pautas en pantalla/estado del intento",
    );
    for (const width of [375, 390, 768, 1280, 1920]) {
      await p.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
      for (const l of lessons) {
        await topic(l.id);
        await fits(`${l.id} ${width}`);
      }
      await section("Practicar");
      await fits(`practica ${width}`);
      await section("Evaluarme");
      await fits(`evaluarme ${width}`);
      await section("Progreso");
      await fits(`progreso ${width}`);
      report.viewports.push(width);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await topic("termomagnetico");
    await snap("leccion-mobile");
    await p
      .getByRole("button", { name: "Abrir menú de temas", exact: true })
      .click();
    await p.locator(".study-topic-dialog[open]").waitFor();
    await p
      .getByRole("textbox", { name: "Buscar tema en menú móvil" })
      .fill("fusible");
    assert.equal(await p.locator(".study-topic-dialog nav>button").count(), 1);
    await snap("menu-mobile");
    await p.keyboard.press("Escape");
    await p
      .getByRole("button", { name: "Abrir menú de temas", exact: true })
      .click();
    await p
      .getByRole("textbox", { name: "Buscar tema en menú móvil" })
      .fill("");
    for (let i = 0; i < 18; i++) {
      await p.keyboard.press("Tab");
      assert.ok(
        await p.evaluate(
          () => !!document.activeElement.closest("dialog[open]"),
        ),
        "foco fuera del menú modal",
      );
    }
    await p
      .locator(".study-topic-dialog nav>button")
      .filter({ hasText: "Fusibles" })
      .click();
    assert.equal(await p.locator(".study-topic-dialog[open]").count(), 0);
    assert.match(
      await p.locator(".study-card-heading h2").innerText(),
      /Fusibles/,
    );
    await snap("fusibles-mobile");
    await contrast("fusibles-mobile");
    await topic("conductores");
    await snap("conductores-mobile");
    await topic("motor-trifasico");
    await snap("motor-mobile");
    await section("Practicar");
    await p.getByRole("button", { name: /Ejercicio interactivo/ }).click();
    await snap("practica-mobile");
    await section("Evaluarme");
    await snap("revision-mobile");
    await section("Progreso");
    await snap("progreso-mobile");
    await p
      .getByRole("button", { name: "Reiniciar solo estudio", exact: true })
      .click();
    await p.getByRole("alertdialog").waitFor();
    await p.keyboard.press("Escape");
    assert.equal(await p.getByRole("alertdialog").count(), 0);
    pass(
      "375/390/768/1280/1920: todas las lecciones y secciones caben; menú móvil buscable con foco contenido, selección real, Escape y confirmación accesible",
    );
    const submitted = await data();
    let exam = submitted.exams.at(-1);
    exam = {
      ...exam,
      stage: "submitted",
      submitted: new Date().toISOString(),
      answers: Object.fromEntries(
        exam.alternatives
          .map((id, i) => {
            const a = alts.find((x) => x.id === id);
            return [
              id,
              String(i === 0 ? (a.correct_index + 1) % 4 : a.correct_index),
            ];
          })
          .concat(
            exam.developments.map((id) => [
              id,
              "Respuesta de prueba visual para revisar mediante rúbrica.",
            ]),
          ),
      ),
    };
    submitted.screen = "exam";
    submitted.exams = [exam];
    submitted.examId = exam.id;
    await p.evaluate(
      ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
      { key, value: submitted },
    );
    await p.reload();
    await p.locator(".exam-score").waitFor();
    assert.match(await p.locator(".exam-score").innerText(), /7 \/ 8/);
    await fits("resultados-mobile");
    await snap("resultados-mobile");
    await p.setViewportSize({ width: 1672, height: 1000 });
    await snap("resultados-desktop");
    await topic("termomagnetico");
    await snap("leccion-desktop");
    await contrast("leccion-final");
    await p.goto(url);
    await p.waitForFunction(
      () => !document.querySelector(".home-options button").disabled,
    );
    await snap("inicio-desktop");
    await p.setViewportSize({ width: 390, height: 844 });
    await snap("inicio-mobile");
    await ctx.close();
    const touch = await b.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        serviceWorkers: "block",
      }),
      t = await touch.newPage();
    await t.goto(url + "estudio/");
    await t.locator(".study-layout").waitFor();
    await t
      .getByRole("button", { name: "Abrir menú de temas", exact: true })
      .tap();
    await t
      .locator(".study-topic-dialog nav>button")
      .filter({ hasText: "Interruptor termomagnético" })
      .tap();
    await t.getByRole("button", { name: "Explorar bornes", exact: true }).tap();
    assert.match(
      await t.locator(".media-explanation").innerText(),
      /Puntos de conexión/,
    );
    await touch.close();
    const reduced = await b.newContext({
        reducedMotion: "reduce",
        serviceWorkers: "block",
      }),
      rp = await reduced.newPage();
    await rp.goto(url + "estudio/");
    await rp.locator(".study-layout").waitFor();
    assert.equal(
      await rp
        .locator(".study-lesson")
        .evaluate((e) => getComputedStyle(e).animationName),
      "none",
    );
    assert.equal(
      await rp
        .locator(".study-section-tabs button")
        .first()
        .evaluate((e) => getComputedStyle(e).transitionDuration),
      "0s",
    );
    await reduced.close();
    pass(
      "Resultados con porcentaje real y rúbrica posterior; tacto real en menú/hotspot; movimiento reducido desactiva animaciones y transiciones",
    );
    assert.deepEqual(report.errors, []);
    report.result = "PASS";
  } finally {
    await b.close();
    fs.writeFileSync(
      "qa/estudio-v2/verification.json",
      JSON.stringify(report, null, 2),
    );
  }
})().catch((e) => {
  report.result = "FAIL";
  report.failure = e.stack;
  fs.writeFileSync(
    "qa/estudio-v2/verification.json",
    JSON.stringify(report, null, 2),
  );
  console.error(e);
  process.exitCode = 1;
});
