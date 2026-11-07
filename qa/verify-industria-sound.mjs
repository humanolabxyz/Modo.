// Sonido de Industria (fase 11): qué debe sonar en cada cambio de la simulación. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {soundEvents} from '../src/industria/sound/plan.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {exampleDirectStart} from '../src/industria/sim/examples.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const p = exampleDirectStart().value, defs = new Map(p.entities.map(e => [e.id, e.definitionId]));
const snap = (inputs, prev) => { const r = simulate(p, inputs, prev?.energized ?? {}, prev?.plc ?? {}); return {r, s: {energized: r.energized, inputs}}; };

let a = snap({}), b = snap({qf1: true}, a.r);
let out = soundEvents(a.s, b.s, defs); assert.deepEqual(out.events, [{kind: 'switch', id: 'qf1', on: true}]); assert.equal(out.motors, 0);
a = b; b = snap({qf1: true, qf2: true}, a.r); assert.deepEqual(soundEvents(a.s, b.s, defs).events.map(e => e.id), ['qf2']);
a = b; b = snap({qf1: true, qf2: true, s1: true}, a.r); out = soundEvents(a.s, b.s, defs);
assert.deepEqual(out.events.map(e => `${e.kind}:${e.id}:${e.on}`).sort(), ['button:s1:true', 'contactor:km1:true']); assert.equal(out.motors, 1, 'el motor gira');
a = b; b = snap({qf1: true, qf2: true}, a.r); out = soundEvents(a.s, b.s, defs); assert.deepEqual(out.events.map(e => `${e.kind}:${e.id}:${e.on}`).sort(), ['button:s1:false', 'contactor:km1:false']); assert.equal(out.motors, 0);
ok('cada cambio produce sus eventos: interruptor, pulsador y contactor (cierra y abre) y el motor suena mientras gira');
// Sin cambios no suena nada; cambios que no importan (piloto, fuente) tampoco
a = b; b = snap({qf1: true, qf2: true}, a.r); assert.deepEqual(soundEvents(a.s, b.s, defs), {events: [], motors: 0}); ok('sin cambios no suena nada');
// Relé térmico: el disparo suena distinto al rearme
const rp = {...p, entities: [...p.entities, {id: 'rt', definitionId: 'rele-termico', label: 'RT', props: {}}]}; const rdefs = new Map(rp.entities.map(e => [e.id, e.definitionId]));
assert.deepEqual(soundEvents({energized: {}, inputs: {}}, {energized: {}, inputs: {rt: true}}, rdefs).events, [{kind: 'trip', id: 'rt', on: true}]); assert.deepEqual(soundEvents({energized: {}, inputs: {rt: true}}, {energized: {}, inputs: {}}, rdefs).events, [{kind: 'switch', id: 'rt', on: false}]); ok('el disparo del relé térmico suena distinto al rearme');
console.log(`\n${n} bloques OK`);
