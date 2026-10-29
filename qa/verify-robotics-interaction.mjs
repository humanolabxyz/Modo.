// Pizarra 3D: la máquina de estados bloquea gestos simultáneos, Esc cancela y los atajos respetan el foco.
import assert from 'node:assert/strict';
import {startGesture, endGesture, escapeAction, classifyRelease, nextSelection, rectFromPoints, rectsIntersect} from '../src/robotics/interaction/tools.ts';
import {resolveShortcut, describeTarget} from '../src/robotics/interaction/shortcuts.ts';

const base = {button: 0, target: 'empty', shift: false, alt: false, space: false, tool: 'select', pointerType: 'mouse'};
const g = (over, cur = 'idle') => startGesture(cur, {...base, ...over});
// Mapa de gestos de la etapa 1
assert.equal(g({target: 'object'}), 'selecting');
assert.equal(g({}), 'marquee');
assert.equal(g({button: 1}), 'panning');
assert.equal(g({space: true}), 'panning');
assert.equal(g({tool: 'hand'}), 'panning');
assert.equal(g({button: 2}), 'orbiting');
assert.equal(g({alt: true}), 'orbiting');
assert.equal(g({pointerType: 'touch'}), 'orbiting', 'un dedo en vacío orbita');
assert.equal(g({pointerType: 'touch', target: 'object'}), 'selecting');
// Un gesto activo bloquea a los demás
for (const active of ['selecting', 'marquee', 'panning', 'orbiting']) {
  for (const over of [{}, {button: 1}, {button: 2}, {target: 'object'}, {space: true}, {alt: true}]) assert.equal(g(over, active), active, `${active} bloquea ${JSON.stringify(over)}`);
}
assert.equal(endGesture('panning'), 'idle');
// Esc: cancela lo más reciente primero y nunca cierra ventanas
const st = o => ({gesture: 'idle', tool: 'select', selection: 0, menuOpen: false, ...o});
assert.equal(escapeAction(st({gesture: 'marquee', menuOpen: true, selection: 2})), 'cancel-gesture');
assert.equal(escapeAction(st({menuOpen: true, selection: 2})), 'close-menu');
assert.equal(escapeAction(st({tool: 'hand', selection: 2})), 'reset-tool');
assert.equal(escapeAction(st({selection: 2})), 'clear-selection');
assert.equal(escapeAction(st()), 'none');
// Clic derecho sin mover = menú; moviéndolo = órbita
assert.equal(classifyRelease(2, 0), 'context-menu'); assert.equal(classifyRelease(2, 30), 'drag'); assert.equal(classifyRelease(0, 2), 'click');
// Selección múltiple y rectángulo
assert.deepEqual(nextSelection([], 'a', false), ['a']); assert.deepEqual(nextSelection(['a'], 'b', true), ['a', 'b']);
assert.deepEqual(nextSelection(['a', 'b'], 'a', true), ['b']); assert.deepEqual(nextSelection(['a'], null, false), []); assert.deepEqual(nextSelection(['a'], null, true), ['a']);
assert.ok(rectsIntersect(rectFromPoints(10, 10, 0, 0), {x: 5, y: 5, w: 10, h: 10})); assert.ok(!rectsIntersect(rectFromPoints(0, 0, 4, 4), {x: 5, y: 5, w: 2, h: 2}));
// Atajos
const body = {tag: 'BODY', editable: false, insideWindow: false, insideEditor: false};
const k = (key, o = {}) => resolveShortcut({key, code: o.code ?? (/^\d$/.test(key) ? 'Digit' + key : 'Key' + key.toUpperCase()), ctrl: false, meta: false, shift: false, alt: false, target: body, ...o});
assert.equal(k('v'), 'tool-select'); assert.equal(k('h'), 'tool-hand'); assert.equal(k('f'), 'frame-selection');
assert.equal(k('1'), 'view-front'); assert.equal(k('3'), 'view-side'); assert.equal(k('7'), 'view-top'); assert.equal(k('0'), 'view-iso');
assert.equal(k('!', {code: 'Digit1', shift: true}), 'frame-all');
assert.equal(k('z', {ctrl: true}), 'undo'); assert.equal(k('z', {ctrl: true, shift: true}), 'redo'); assert.equal(k('z', {meta: true}), 'undo'); assert.equal(k('d', {ctrl: true}), 'duplicate');
assert.equal(k('Delete', {code: 'Delete'}), 'delete'); assert.equal(k('q'), null); assert.equal(k('v', {alt: true}), null);
for (const target of [{...body, tag: 'INPUT'}, {...body, tag: 'TEXTAREA'}, {...body, tag: 'SELECT'}, {...body, editable: true}, {...body, insideWindow: true}, {...body, insideEditor: true}]) {
  assert.equal(k('v', {target}), null, `ignorado con foco en ${JSON.stringify(target)}`); assert.equal(k('z', {ctrl: true, target}), null);
}
assert.deepEqual(describeTarget(null), {...body, tag: 'body'});
console.log('PASS interacción: gestos, Esc, selección y atajos');
