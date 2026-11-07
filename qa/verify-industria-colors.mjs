// Color de cable por función, punteras y bornes de tierra/neutro (fase 16). Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {WIRE_COLORS, wireRole, wireLook, wireName, ferruleFor} from '../src/industria/wiring/colors.ts';
import {exampleMiniFactory, exampleDirectStart} from '../src/industria/sim/examples.ts';
import {shapeOf} from '../src/industria/build/shapes.ts';
import {evaluate} from '../src/industria/wiring/engine.ts';
import {simulate} from '../src/industria/sim/engine.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const p = exampleMiniFactory().value;
const role = (ea, ta, eb, tb) => { const c = p.connections.find(x => (x.a.entityId === ea && x.a.terminalId === ta && x.b.entityId === eb && x.b.terminalId === tb) || (x.b.entityId === ea && x.b.terminalId === ta && x.a.entityId === eb && x.a.terminalId === tb)); assert.ok(c, `${ea}.${ta}–${eb}.${tb}`); return wireRole(p, c); };

// Funciones
assert.equal(role('red', 'L1', 'qf1', '1'), 'L1'); assert.equal(role('red', 'L2', 'qf1', '3'), 'L2'); assert.equal(role('red', 'L3', 'qf1', '5'), 'L3');
assert.equal(role('km1', '2', 'motor', 'U1'), 'L1'); assert.equal(role('km1', '4', 'motor', 'V1'), 'L2'); assert.equal(role('km1', '6', 'motor', 'W1'), 'L3');
assert.equal(role('red', 'PE', 'pe1', '1'), 'PE'); assert.equal(role('pe1', '2', 'motor', 'PE'), 'PE'); assert.equal(role('red', 'N', 'ne1', '1'), 'N');
assert.equal(role('plc', 'L+', 'foto', 'BN'), 'DCP'); assert.equal(role('plc', 'M', 'foto', 'BU'), 'DCN'); assert.equal(role('foto', 'BK', 'plc', 'DI2'), 'SIG');
assert.equal(role('comp', 'P', 'valvula', 'P'), 'PIPE'); assert.equal(role('plc', 'DO1', 'valvula', 'A1'), 'CTRL');
ok('cada cable toma su color de la función: fases azul/negro/rojo, neutro blanco, tierra verde, 24 V marrón/azul claro, mando naranja, señal gris y aire azul');

// Cada color es distinto salvo el negro de la fase 2 y el gris de la señal, que no se confunden
const colors = Object.values(WIRE_COLORS).map(w => w.color); assert.equal(new Set(colors).size, colors.length); for (const w of Object.values(WIRE_COLORS)) { assert.match(w.color, /^#[0-9a-f]{6}$/i); assert.ok(w.name); }
ok('la tabla de colores no repite ningún color');

// Punteras por sección
assert.equal(ferruleFor('L1').section, 2.5); assert.equal(ferruleFor('DCP').section, 0.75); assert.equal(ferruleFor('SIG').section, 0.5);
for (const c of p.connections) { const l = wireLook(p, c); assert.ok(l.ferrule.color && l.ferrule.section > 0 && l.color); }
ok('toda conexión tiene color, sección y puntera');

// Etiquetas: nombres únicos
const names = p.connections.map(c => wireName(p, c)); assert.equal(new Set(names).size, names.length); assert.ok(names.every(x => /^W\d+$/.test(x)));
ok('los cables tienen etiquetas W1…Wn únicas');

// Bornes de tierra y neutro
for (const id of ['borne-tierra', 'borne-neutro']) { const s = shapeOf(id); assert.deepEqual(s.bridges, [['1', '2']]); assert.equal(s.terminals.length, 2); assert.ok(s.anchors.some(a => a.kind === 'din-rail' && a.role === 'child')); }
assert.ok(shapeOf('borne-tierra').terminals.every(t => t.role === 'ground' && t.kind === 'earth') && shapeOf('borne-neutro').terminals.every(t => t.role === 'neutral'));
assert.ok(p.mounts.some(m => m.child.entityId === 'pe1' && m.parent.entityId === 'riel2') && p.mounts.some(m => m.child.entityId === 'ne1' && m.parent.entityId === 'riel2'), 'bornes montados en el riel');
// La tierra llega a los dos motores a través del borne y el neutro a la fuente
const sim = simulate(p, {qf1: true, qf2: true, s1: true});
assert.ok(sim.sameNet({entityId: 'red', terminalId: 'PE'}, {entityId: 'motor', terminalId: 'PE'}) && sim.sameNet({entityId: 'red', terminalId: 'PE'}, {entityId: 'motor2', terminalId: 'PE'}), 'tierra continua por el borne');
assert.ok(sim.sameNet({entityId: 'red', terminalId: 'N'}, {entityId: 'fuente', terminalId: 'N'}), 'neutro continuo por el borne');
assert.ok(!evaluate(p).issues.some(i => /tierra/i.test(i.message) && i.severity === 'error'), 'sin avisos de tierra');
ok('tierra y neutro pasan por sus bornes de riel y siguen conectando motores y fuente');

// El ejemplo de arranque directo sigue con los colores por función (sin bornes)
const d = exampleDirectStart().value; assert.ok(d.connections.every(c => wireLook(d, c).role));
console.log(`\n${n} comprobaciones de colores y bornes OK`);
