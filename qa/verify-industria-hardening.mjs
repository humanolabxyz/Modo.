// Endurecimiento de Industria (fase 10): archivos hostiles o corruptos, inyección en exportaciones y robustez de todo el motor ante proyectos raros.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {parseIndustryProject, parseIndustryProjectText} from '../src/industria/model/validate.ts';
import {examplePlcStartStop, exampleDirectStart} from '../src/industria/sim/examples.ts';
import {startActivity, evaluateActivity} from '../src/industria/activities/activities.ts';
import {addEntity} from '../src/industria/model/commands.ts';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {buildDocumentation, toMarkdown, bomCsv, wiresCsv} from '../src/industria/docs/generate.ts';
import {buildBoards} from '../src/industria/board/layout.ts';
import {autoLayout, wirePoints, symbolPos} from '../src/industria/diagram/layout.ts';
import {evaluate} from '../src/industria/wiring/engine.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {diagnose} from '../src/industria/faults/diagnose.ts';
import {findSnapCandidates, mountProblems, overlapsOf} from '../src/industria/build/snap.ts';
import {checkProgram} from '../src/industria/plc/program.ts';
import {LIMITS} from '../src/industria/model/types.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const base = JSON.parse(JSON.stringify(must(examplePlcStartStop())));

// — Ids y claves peligrosas —
for (const key of ['__proto__', 'constructor', 'prototype']) {
  const e = JSON.parse(JSON.stringify(base)); e.entities[0].id = key; assert.ok(!parseIndustryProject(e).ok, `id ${key}`);
  const t = JSON.parse(JSON.stringify(base)); t.entities[0].props = JSON.parse(`{"${key}": 1}`); assert.ok(!parseIndustryProject(t).ok, `propiedad ${key}`);
  const a = JSON.parse(JSON.stringify(base)); a.lesson.answers = JSON.parse(`{"${key}": "x"}`); assert.ok(!parseIndustryProject(a).ok, `respuesta ${key}`);
}
const polluted = parseIndustryProjectText('{"format":"modo-industria","version":4,"__proto__":{"polluted":true}}'); assert.equal({}.polluted, undefined); assert.ok(!polluted.ok); ok('ids, propiedades y respuestas con __proto__, constructor o prototype se rechazan y no contaminan el prototipo');

// — Tamaños y límites —
assert.match(parseIndustryProjectText('x'.repeat(LIMITS.importBytes + 1)).error, /2 MB/);
const many = JSON.parse(JSON.stringify(base)); many.entities = Array.from({length: LIMITS.entities + 1}, (_, i) => ({id: 'e' + i, definitionId: 'generico', label: 'x', props: {}})); assert.ok(!parseIndustryProject(many).ok);
const long = JSON.parse(JSON.stringify(base)); long.entities[0].label = 'x'.repeat(LIMITS.label + 1); assert.ok(!parseIndustryProject(long).ok);
const deep = '['.repeat(5000) + ']'.repeat(5000); assert.ok(!parseIndustryProjectText(deep).ok); for (const bad of ['', 'null', '[]', '"texto"', '{', '{"format":"otro"}', '{"format":"modo-industria"}']) assert.ok(!parseIndustryProjectText(bad).ok, bad); ok('archivos enormes, con demasiados elementos, con textos largos, anidados o malformados se rechazan sin fallar');

// — Inyección en exportaciones —
let p = must(addEntity(newIndustryProject('=HYPERLINK("http://x","clic")'), {id: 'a', definitionId: 'fuente-cc', label: '=1+1'}));
p = must(addEntity(p, {id: 'b', definitionId: 'fuente-cc', label: '@SUM(A1)'})); p = must(addEntity(p, {id: 'c', definitionId: 'fuente-cc', label: '-2+3'}));
const doc = buildDocumentation(p, '2026-11-07'), csv = bomCsv(doc);
assert.ok(csv.includes("'=1+1"), csv);
for (const line of csv.split('\r\n').slice(1).filter(Boolean)) { const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '')); for (const c of cells.slice(1)) assert.ok(!/^[=@+\-]/.test(c), `celda con fórmula: ${c}`); }
const docs2 = buildDocumentation(must(addEntity(newIndustryProject('x'), {id: 'k', definitionId: 'contactor-3p', label: '+cmd|calc'})), 'x'); assert.ok(bomCsv(docs2).includes("'+cmd|calc")); assert.ok(bomCsv(buildDocumentation(must(addEntity(newIndustryProject('x'), {id: 'k', definitionId: 'contactor-3p', label: '@x'})), 'x')).includes("'@x")); assert.ok(!wiresCsv(doc).match(/(^|,)[=@]/m));
const html = must(addEntity(newIndustryProject('<script>alert(1)</script>\n# Falso encabezado'), {id: 'x', definitionId: 'fuente-cc', label: '<img src=x onerror=alert(1)>|columna'})); const md = toMarkdown(buildDocumentation(html, 'hoy'));
assert.ok(!md.includes('<script') && !md.includes('<img'), 'sin HTML sin escapar'); assert.ok(md.includes('&lt;img') && md.includes('\\|columna')); assert.equal(md.split('\n')[0].includes('\n'), false); assert.ok(!md.split('\n').some(l => l.startsWith('# Falso')), 'un nombre con salto de línea no crea encabezados');
assert.equal(bomCsv(buildDocumentation(must(addEntity(newIndustryProject(), {id: 'q', definitionId: 'fuente-cc', label: 'a"b,c'})), 'x')).includes('"a""b,c"'), true); ok('el CSV neutraliza fórmulas y el Markdown escapa HTML, barras y saltos de línea');

// — Robustez: proyectos mutados al azar no hacen fallar ninguna parte del motor —
let seed = 20261107; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = a => a[Math.floor(rnd() * a.length)];
const WEIRD = [null, 0, -1, 1e9, 'x', '', [], {}, true, 'a'.repeat(300), [1, 2, 3], {a: 1}];
function paths(o, prefix = []) { const out = []; if (o && typeof o === 'object') for (const k of Object.keys(o)) { out.push([...prefix, k]); out.push(...paths(o[k], [...prefix, k])); } return out; }
function mutate(o) {
  const copy = JSON.parse(JSON.stringify(o)), all = paths(copy);
  for (let i = 0, m = 1 + Math.floor(rnd() * 3); i < m; i++) {
    const path = pick(all); let at = copy; for (const k of path.slice(0, -1)) at = at?.[k]; if (at == null || typeof at !== 'object') continue;
    const last = path.at(-1), r = rnd();
    if (r < 0.3) { if (Array.isArray(at)) at.splice(Number(last), 1); else delete at[last]; } else if (r < 0.8) at[last] = pick(WEIRD); else if (Array.isArray(at)) at.push(JSON.parse(JSON.stringify(at[Number(last)] ?? null)));
  }
  return copy;
}
function exercise(proj) {
  const ev = evaluate(proj); void ev.nets;
  for (const inputs of [{}, {qf1: true, qf2: true, s1: true}]) { const s = simulate(proj, inputs); for (const e of proj.entities) for (const t of [{entityId: e.id, terminalId: '1'}]) s.measure(t, t, 'voltage'); }
  diagnose(proj, {qf1: true, qf2: true, s1: true}); toMarkdown(buildDocumentation(proj, 'x')); bomCsv(buildDocumentation(proj, 'x')); buildBoards(proj);
  const auto = autoLayout(proj); for (const c of proj.connections) wirePoints(proj, c, auto); for (const e of proj.entities) { symbolPos(proj, e.id, auto); findSnapCandidates(proj, e.id); overlapsOf(proj, e.id); }
  mountProblems(proj); for (const e of proj.entities.filter(x => x.definitionId === 'plc-generico')) checkProgram(proj, e.id);
  for (const id of ['tablero', 'arranque', 'falla', 'plc']) evaluateActivity({...proj, lesson: {activityId: id, answers: {}, submitted: null}});
}
let accepted = 0, rejected = 0; const failures = [];
for (let i = 0; i < 600; i++) {
  const text = JSON.stringify(mutate(base));
  let parsed; try { parsed = parseIndustryProjectText(text); } catch (e) { failures.push(`iter ${i}: parse lanzó ${e.message}`); continue; }
  if (!parsed.ok) { rejected++; assert.equal(typeof parsed.error, 'string'); continue; }
  accepted++; try { exercise(parsed.value); } catch (e) { failures.push(`iter ${i}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
}
assert.deepEqual(failures.slice(0, 5), [], `${failures.length} fallos`); assert.ok(accepted > 20 && rejected > 100, `aceptados ${accepted}, rechazados ${rejected}`);
ok(`600 proyectos mutados al azar: ${rejected} rechazados con mensaje, ${accepted} aceptados y procesados por toda la lógica sin una sola excepción`);
// Las otras plantillas también
for (const src of [must(exampleDirectStart()), must(startActivity('falla')), must(startActivity('plc'))]) exercise(src); ok('las plantillas y actividades pasan por toda la lógica sin excepciones');
console.log(`\n${n} bloques OK`);
