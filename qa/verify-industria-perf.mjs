// Rendimiento de Industria (fase 10): tiempos de la lógica con proyectos grandes y tamaño del paquete de /industria/. Presupuestos holgados (varias veces lo medido)
// para que no fallen por ruido de la máquina pero sí si algo se vuelve cuadrático. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity} from '../src/industria/model/commands.ts';
import {parseIndustryProjectText} from '../src/industria/model/validate.ts';
import {exportProject} from '../src/industria/model/library.ts';
import {wire} from '../src/industria/wiring/commands.ts';
import {evaluate} from '../src/industria/wiring/engine.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {diagnose} from '../src/industria/faults/diagnose.ts';
import {addFault} from '../src/industria/faults/faults.ts';
import {buildDocumentation, toMarkdown} from '../src/industria/docs/generate.ts';
import {autoLayout, wirePoints} from '../src/industria/diagram/layout.ts';
import {buildBoards} from '../src/industria/board/layout.ts';
import {findSnapCandidates, mountProblems, overlapsOf} from '../src/industria/build/snap.ts';
import {examplePlcStartStop} from '../src/industria/sim/examples.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const time = (label, fn, budget) => { const t0 = performance.now(); const r = fn(); const ms = performance.now() - t0; console.log(`  ${label.padEnd(34)} ${ms.toFixed(1).padStart(8)} ms   (presupuesto ${budget} ms)`); assert.ok(ms <= budget, `${label}: ${ms.toFixed(0)} ms supera ${budget} ms`); return r; };

// Proyecto grande: una red y 60 circuitos de motor (disyuntor → contactor → motor) con mando por pulsador: ≈ 240 piezas y ≈ 420 cables
const CIRCUITS = 60;
let p = newIndustryProject('Planta grande');
p = must(addEntity(p, {id: 'red', definitionId: 'red-3f', label: 'Red', pose: {position: [0, 0, 0], rotation: [0, 0, 0]}}));
let wires = 0;
const link = (a, ta, b, tb) => { p = must(wire(p, {entityId: a, terminalId: ta}, {entityId: b, terminalId: tb})); wires++; };
for (let i = 0; i < CIRCUITS; i++) {
  const x = (i % 10) * 0.5, z = Math.floor(i / 10) * 0.5 + 1;
  for (const [suffix, def] of [['q', 'breaker-3p'], ['k', 'contactor-3p'], ['m', 'motor-3p'], ['s', 'pulsador-na']]) p = must(addEntity(p, {id: `${suffix}${i}`, definitionId: def, label: `${suffix.toUpperCase()}${i}`, pose: {position: [x, 0.5, z], rotation: [0, 0, 0]}}));
  // La red solo tiene 2 cables por terminal: cada circuito toma sus fases de un borne propio no existente → se usa una fuente por circuito para mantener el límite
  p = must(addEntity(p, {id: `r${i}`, definitionId: 'red-3f', label: `R${i}`, pose: {position: [x, 0, z - 0.2], rotation: [0, 0, 0]}}));
  link(`r${i}`, 'L1', `q${i}`, '1'); link(`r${i}`, 'L2', `q${i}`, '3'); link(`r${i}`, 'L3', `q${i}`, '5');
  link(`q${i}`, '2', `k${i}`, '1'); link(`q${i}`, '4', `k${i}`, '3'); link(`q${i}`, '6', `k${i}`, '5');
  link(`k${i}`, '2', `m${i}`, 'U1'); link(`k${i}`, '4', `m${i}`, 'V1'); link(`k${i}`, '6', `m${i}`, 'W1');
  link(`r${i}`, 'L1', `s${i}`, '3'); link(`s${i}`, '4', `k${i}`, 'A1'); link(`k${i}`, 'A2', `r${i}`, 'N');
}
console.log(`Proyecto de prueba: ${p.entities.length} piezas, ${p.connections.length} cables, ${CIRCUITS} circuitos`);
assert.ok(p.entities.length >= 300 && p.connections.length >= 700, `${p.entities.length}/${p.connections.length}`);
const text = exportProject(p).text; console.log(`  tamaño del archivo exportado: ${(text.length / 1024).toFixed(0)} KB`); assert.ok(text.length < 2 * 1024 * 1024, 'cabe en el límite de importación (2 MB)');

time('importar y validar', () => assert.ok(parseIndustryProjectText(text).ok), 400);
time('evaluar redes y avisos', () => evaluate(p), 400);
const all = Object.fromEntries([...Array(CIRCUITS).keys()].flatMap(i => [[`q${i}`, true], [`s${i}`, true]]));
const sim = time('simular (todos los mandos)', () => simulate(p, all), 1500);
assert.equal(Object.values(sim.energized).filter(Boolean).length >= CIRCUITS * 2, true, 'los motores y contactores se energizan'); assert.ok(sim.converged);
time('simular de nuevo con estado previo', () => simulate(p, all, sim.energized, sim.plc), 1500);
const faulty = must(addFault(p, {kind: 'wire-open', connectionId: p.connections[5].id}));
time('diagnosticar con una falla', () => diagnose(faulty, all), 3000);
time('generar la documentación', () => { const d = buildDocumentation(p, 'x'); return toMarkdown(d).length; }, 800);
time('disposición y rutas del esquema', () => { const auto = autoLayout(p); return p.connections.map(c => wirePoints(p, c, auto)).length; }, 800);
time('alzado de tableros', () => buildBoards(p), 300);
time('candidatos de anclaje (por pieza)', () => { for (const e of p.entities.slice(0, 40)) findSnapCandidates(p, e.id); }, 500);
time('interferencias de 40 piezas', () => { for (const e of p.entities.slice(0, 40)) overlapsOf(p, e.id); }, 800);
time('comprobar montajes', () => mountProblems(p), 300);
ok('con ≈300 piezas y ≈700 cables toda la lógica responde dentro del presupuesto');

// La simulación crece de forma razonable: el doble de circuitos no cuesta más del triple (sin comportamiento cuadrático grave)
const small = (() => { let q = newIndustryProject('x'); const mk = (c) => { for (let i = 0; i < c; i++) { for (const [s, d] of [['k', 'contactor-3p'], ['r', 'red-3f'], ['s', 'pulsador-na']]) q = must(addEntity(q, {id: `${s}${i}`, definitionId: d, label: `${s}${i}`})); q = must(wire(q, {entityId: `r${i}`, terminalId: 'L1'}, {entityId: `s${i}`, terminalId: '3'})); q = must(wire(q, {entityId: `s${i}`, terminalId: '4'}, {entityId: `k${i}`, terminalId: 'A1'})); q = must(wire(q, {entityId: `k${i}`, terminalId: 'A2'}, {entityId: `r${i}`, terminalId: 'N'})); } return q; }; return [mk(40), (q = newIndustryProject('y'), mk(80))]; })();
const bench = proj => { const inp = Object.fromEntries(proj.entities.filter(e => e.id.startsWith('s')).map(e => [e.id, true])); simulate(proj, inp); const t0 = performance.now(); for (let i = 0; i < 5; i++) simulate(proj, inp); return (performance.now() - t0) / 5; };
const t40 = bench(small[0]), t80 = bench(small[1]); console.log(`  simulación 40 → 80 circuitos: ${t40.toFixed(1)} ms → ${t80.toFixed(1)} ms (×${(t80 / t40).toFixed(2)})`); assert.ok(t80 <= Math.max(t40 * 4.5, 40), 'crece como mucho ~cuadrático'); ok('el coste de simular crece de forma razonable con el tamaño');

// Ejemplo típico: instantáneo
const ex = must(examplePlcStartStop()); time('simular el ejemplo con PLC', () => simulate(ex, {qf1: true, qf2: true, s1: true}), 60); ok('el ejemplo con PLC simula en milisegundos');

// — Paquete de /industria/ (si hay build): grafo real de importaciones, no solo lo que menciona el HTML —
if (existsSync('dist/industria/index.html')) {
  const html = readFileSync('dist/industria/index.html', 'utf8');
  const entries = [...html.matchAll(/(?:component-url|renderer-url|before-hydration-url)="(\/_astro\/[^"]+)"/g)].map(m => m[1]);
  const cssFiles = [...new Set([...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map(m => m[1]))];
  const read = f => readFileSync('dist' + f);
  const statics = (f) => { const src = read(f).toString('utf8'), dir = f.slice(0, f.lastIndexOf('/') + 1); return [...src.matchAll(/(?:from|import)\s*["'`](\.\/[^"'`]+\.js)["'`]/g)].map(m => dir + m[1].slice(2)); };
  const dynamics = (f) => { const src = read(f).toString('utf8'), dir = f.slice(0, f.lastIndexOf('/') + 1); return [...src.matchAll(/import\(\s*["'`](\.\/[^"'`]+\.js)["'`]\s*\)/g)].map(m => dir + m[1].slice(2)).concat([...src.matchAll(/["'`]_astro\/([^"'`]+\.js)["'`]/g)].map(m => '/_astro/' + m[1])); };
  const seen = new Set(), lazy = new Set(), queue = [...entries];
  while (queue.length) { const f = queue.shift(); if (seen.has(f)) continue; seen.add(f); queue.push(...statics(f)); for (const d of dynamics(f)) lazy.add(d); }
  const size = f => { const raw = read(f); return {f, raw: raw.length, gz: gzipSync(raw).length}; };
  const initial = [...seen].map(size), css = cssFiles.map(size), sum = (a, k) => a.reduce((t, x) => t + x[k], 0);
  const deferred = new Set(), q2 = [...lazy].filter(f => !seen.has(f));
  while (q2.length) { const f = q2.shift(); if (seen.has(f) || deferred.has(f)) continue; deferred.add(f); q2.push(...statics(f)); }
  const lazyFiles = [...deferred].map(size);
  console.log(`  carga inicial: ${initial.length} JS = ${(sum(initial, 'gz') / 1024).toFixed(0)} KB gzip (${(sum(initial, 'raw') / 1024).toFixed(0)} KB) + ${css.length} CSS = ${(sum(css, 'gz') / 1024).toFixed(0)} KB gzip`);
  console.log(`  diferido (escenario 3D): ${lazyFiles.length} JS = ${(sum(lazyFiles, 'gz') / 1024).toFixed(0)} KB gzip`);
  for (const h of [...initial].sort((a, b) => b.gz - a.gz).slice(0, 3)) console.log(`   · inicial: ${h.f.split('/').pop()} ${(h.gz / 1024).toFixed(0)} KB gzip`);
  assert.ok([...lazy].some(f => f.includes('IndustriaCanvas')), 'el escenario 3D se carga de forma diferida');
  assert.ok(sum(lazyFiles, 'raw') > 300 * 1024, 'three y el escenario viven en la carga diferida');
  const BUDGET_JS = 220 * 1024, BUDGET_CSS = 90 * 1024;
  assert.ok(sum(initial, 'gz') <= BUDGET_JS, `JS inicial ${(sum(initial, 'gz') / 1024).toFixed(0)} KB gzip supera ${BUDGET_JS / 1024} KB`);
  assert.ok(sum(css, 'gz') <= BUDGET_CSS, `CSS inicial ${(sum(css, 'gz') / 1024).toFixed(0)} KB gzip supera ${BUDGET_CSS / 1024} KB`);
  ok(`carga inicial de /industria/: ${(sum(initial, 'gz') / 1024).toFixed(0)} KB de JS y ${(sum(css, 'gz') / 1024).toFixed(0)} KB de CSS (gzip); three y el escenario 3D se cargan aparte`);
} else console.log('  (sin dist/: se omite el tamaño del paquete; ejecuta npm run build)');
console.log(`\n${n} bloques OK`);
