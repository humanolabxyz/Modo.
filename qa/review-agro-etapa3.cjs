// Revisión visual reproducible, sin hooks de diagnóstico en el producto.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const {fixtureOpen, stressWorld, frames} = require('./verify-agro-territory-ui.cjs');
const out = process.env.AGRO_QA_OUT;
assert.ok(out, 'Define AGRO_QA_OUT para guardar la evidencia fuera del código');
const url = process.env.AGRO_URL || 'http://127.0.0.1:4388';
const ids = ['free', 'valley', 'oasis-norte', 'desierto', 'ladera', 'valle-rio'];

function diagnostics() {
  localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen');
  sessionStorage.setItem('modo-opened-v2', '1');
  window.__THREE_DEVTOOLS__ = new EventTarget();
  window.__THREE_DEVTOOLS__.addEventListener('observe', ({detail: r}) => {
    if (!r.isWebGLRenderer) return;
    const render = r.render;
    r.render = function(scene, camera) {
      window.reviewScene = scene; window.reviewCamera = camera; window.reviewRenderer = r;
      return render.apply(this, arguments);
    };
  });
  window.drawnFrames = 0; window.frameTimes = [];
  for (const C of [WebGL2RenderingContext, WebGLRenderingContext]) {
    const draw = C.prototype.drawElements;
    C.prototype.drawElements = function(...args) { window.drew = true; return draw.apply(this, args); };
  }
  let previous = 0;
  const frame = time => {
    if (window.drew) { window.drawnFrames++; if (previous) window.frameTimes.push(time - previous); previous = time; }
    window.drew = false; requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

async function ready(page) {
  await page.waitForFunction(() => window.reviewScene?.__r3f?.root?.getState()?.controls);
  await page.waitForTimeout(900);
}

async function camera(page, mode, offset, target = [0, null, 0]) {
  await page.getByRole('button', {name: mode === 'strategic' ? 'Estratégica' : 'Órbita', exact: true}).click();
  await page.evaluate(({offset, target}) => {
    const state = window.reviewScene.__r3f.root.getState(), ctl = state.controls;
    const y = target[1] ?? ctl.target.y;
    ctl.target.set(target[0], y, target[2]);
    state.camera.position.set(target[0] + offset[0], y + offset[1], target[2] + offset[2]);
    ctl.update(); state.invalidate();
  }, {offset, target});
  await page.waitForTimeout(850);
}

async function profile(page, world) {
  return page.evaluate(world => {
    const scene = window.reviewScene, r = window.reviewRenderer, state = scene.__r3f.root.getState();
    const pieces = scene.getObjectByName('piezas'), rows = {}, restore = [];
    const category = object => {
      let node = object;
      while (node.parent && node.parent !== scene && node.parent !== pieces) node = node.parent;
      if (node.parent === pieces) {
        const index = pieces.children.indexOf(node), e = world.entities[index];
        return e ? 'entidad:' + e.type : 'conexiones/auxiliares';
      }
      if (node.name === 'terreno') return 'terreno jugable';
      if (node.name.includes('cinturón')) return 'cinturón exterior';
      if (object.userData.tag) return 'etiquetas';
      return 'entorno:' + (node.name || node.type);
    };
    scene.traverse(o => {
      if (!o.isMesh && !o.isSprite && !o.isLine) return;
      const before = o.onBeforeRender, after = o.onAfterRender;
      let calls, tris;
      o.onBeforeRender = function(...args) { before.apply(this, args); calls = r.info.render.calls; tris = r.info.render.triangles; };
      o.onAfterRender = function(...args) {
        const key = category(o), row = rows[key] ??= {calls: 0, triangles: 0, objects: 0};
        row.calls += r.info.render.calls - calls; row.triangles += r.info.render.triangles - tris; row.objects++;
        after.apply(this, args);
      };
      restore.push(() => {o.onBeforeRender = before; o.onAfterRender = after;});
    });
    r.render(scene, state.camera);
    const total = {...r.info.render}; restore.forEach(fn => fn());
    const sum = Object.values(rows).reduce((n, row) => n + row.calls, 0);
    return {total, sum, rows, camera: state.camera.position.toArray(), target: state.controls.target.toArray(), heapMB: Math.round(performance.memory.usedJSHeapSize / 1048576)};
  }, world);
}

async function shot(page, name) {
  // Se conserva la interfaz; solo se aparta el puntero para no resaltar una pieza.
  await page.mouse.move(10, 15); await page.waitForTimeout(100);
  await page.screenshot({path: path.join(out, name + '.png')});
}

module.exports = {diagnostics, ready, camera, profile};

if (require.main === module) (async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-precise-memory-info']});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', hasTouch: true});
  await context.addInitScript(diagnostics);
  const page = await context.newPage(), errors = [], result = {territories: {}, boundaries: []};
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(url + '/agro/'); await page.locator('[data-view=lobby]').waitFor();
    result.renderer = await page.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info'); return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL); });
    const {createConfiguredWorld} = await import('../src/agro/world/setup.ts');
    const {TERRITORIES} = await import('../src/agro/terrain/presets.ts');
    for (const id of ids) {
      const setup = {name: 'Revisión · ' + id, seed: 31415, territory: id, ...(id !== 'valley' && {terrainParams: {...TERRITORIES[id].params}}), side: 1200, template: 'blank', site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'};
      const made = createConfiguredWorld(setup); assert.ok(made.ok, made.error); const world = made.value;
      if (id !== ids[0]) await page.getByRole('button', {name: /Mis mundos/}).click();
      await fixtureOpen(page, world); await ready(page);
      await camera(page, 'orbit', [90, 55, 130]);
      const orbit = await profile(page, world); assert.equal(orbit.total.calls, orbit.sum);
      await shot(page, id + '-orbital');
      await page.getByRole('button', {name: 'Estratégica', exact: true}).click();
      await page.mouse.move(720, 450); for (let n = 0; n < 24; n++) await page.mouse.wheel(0, 150);
      await page.waitForTimeout(900);
      const strategic = await profile(page, world); await shot(page, id + '-estrategica');
      result.territories[id] = {seed: world.terrain.seed, generatorVersion: world.terrain.generatorVersion, side: 1200, orbit, strategic};
      // Inspección del perímetro mirando hacia fuera en las cuatro esquinas, a ras del paisaje.
      const edges = [[-590,-590],[590,-590],[590,590],[-590,590]];
      for (let k = 0; k < edges.length; k++) {
        const [x,z] = edges[k]; await camera(page, 'orbit', [Math.sign(x)*120, 32, Math.sign(z)*120], [x,null,z]);
        const check = await page.evaluate(() => {
          const {scene,camera,controls} = window.reviewScene.__r3f.root.getState();
          // Rayos de terreno en la mitad inferior; no se cuentan cielo ni nubes.
          const mesh = scene.getObjectByName('cinturón y horizonte escénicos');
          const Raycaster = scene.__r3f.root.getState().raycaster.constructor;
          const ray = new Raycaster(), missed = [];
          for (const u of [-0.9,-0.5,0,0.5,0.9]) for (const v of [-0.85,-0.5,-0.2]) {
            ray.setFromCamera({x:u,y:v},camera);
            // El exterior excluye picking de producto; la prueba invoca el raycast original de Mesh.
            const hits=[]; mesh.constructor.prototype.raycast.call(mesh,ray,hits);
            const terrain=scene.getObjectByName('terreno'); hits.push(...ray.intersectObjects(terrain.children));
            if (!hits.length && ray.ray.direction.y < -0.05) missed.push([u,v]);
          }
          const down = new Raycaster(); down.ray.origin.copy(camera.position); down.ray.origin.y=10000; down.ray.direction.set(0,-1,0);
          const below=[]; mesh.constructor.prototype.raycast.call(mesh,down,below);
          const exteriorClearance = below.length ? camera.position.y-Math.max(...below.map(h=>h.point.y)) : null;
          return {camera:camera.position.toArray(),target:controls.target.toArray(),missed,exteriorClearance};
        });
        result.boundaries.push({id,corner:k,...check});
        if(process.env.AGRO_REVIEW_ASSERT === '1' && check.exteriorClearance !== null) assert.ok(check.exteriorClearance >= 1.9, JSON.stringify({id,k,...check}));
        if (id === 'ladera' || id === 'oasis-norte') await shot(page, id + '-esquina-' + k);
      }
      console.log('CAPTURED', id, orbit.total.calls, strategic.total.calls);
    }
    await page.getByRole('button', {name: /Mis mundos/}).click();
    const world = await stressWorld(); fs.writeFileSync(path.join(out, 'stress-world.json'), JSON.stringify(world));
    await fixtureOpen(page, world); await ready(page);
    result.stress = await profile(page, world); assert.equal(result.stress.total.calls, result.stress.sum);
    // Ablación temporal solo en el navegador de pruebas: cuánto consumen etiquetas
    // y sombras de contacto. No cambia el mundo ni su almacenamiento.
    result.stress.ablations = await page.evaluate(() => {
      const scene=window.reviewScene,r=window.reviewRenderer,camera=window.reviewCamera, pieces=scene.getObjectByName('piezas');
      const tags=[],shadows=[];
      pieces.traverse(o=>{if(o.userData.tag) tags.push(o); if(o.isMesh && o.renderOrder===1) shadows.push(o);});
      const measure=objects=>{const old=objects.map(o=>o.visible);objects.forEach(o=>o.visible=false);r.render(scene,camera);const calls=r.info.render.calls;objects.forEach((o,i)=>o.visible=old[i]);return calls;};
      const noTags=measure(tags),noShadows=measure(shadows),noTagsOrShadows=measure([...tags,...shadows]);r.render(scene,camera);
      return {tagCount:tags.length,shadowCount:shadows.length,noTags,noShadows,noTagsOrShadows};
    });
    await shot(page, 'carga-150-orbita');
    result.motion = [];
    for (let run=0;run<3;run++) {
      await camera(page, 'orbit', [26,26,52]);
      result.motion.push(await frames(page, async () => {
        await page.mouse.move(720,490); await page.mouse.down();
        const start=Date.now(); let n=0;
        while(Date.now()-start<3000) {await page.mouse.move(720+105*Math.sin(n/9),490+45*Math.sin(n++/12)); await page.waitForTimeout(16);}
        await page.mouse.up();
      }));
    }
    result.errors=errors; assert.deepEqual(errors, []);
    console.log('PROFILE', JSON.stringify(result.stress));
  } finally {
    fs.writeFileSync(path.join(out, 'mediciones.json'), JSON.stringify(result,null,2));
    await browser.close();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
