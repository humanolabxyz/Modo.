// Proyecto de Robótica: validar, exportar, reimportar y proteger datos ilegibles (Node 24 ejecuta .ts directamente).
import assert from 'node:assert/strict';
import {newRobotProject} from '../src/robotics/project/defaults.ts';
import {parseRobotProject, parseRobotProjectText} from '../src/robotics/project/validate.ts';
import {readLibrary, emptyLibrary, createProject, duplicateProject, deleteProject, renameProject, importProject, exportProject, activeProject, updateActive, emptyHistory, pushHistory, undo, redo} from '../src/robotics/project/library.ts';
import {LIMITS} from '../src/robotics/project/types.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };

// Proyecto vacío válido y con forma de contrato
const p = newRobotProject('Mi robot');
assert.equal(p.format, 'modo-robotica'); assert.equal(p.version, 1);
assert.deepEqual([p.parts, p.attachments, p.connections, p.firmware], [[], [], [], []]);
assert.ok(parseRobotProject(p).ok); ok('proyecto vacío válido');

// Exportar y reimportar: id nuevo, mismo contenido
const lib = emptyLibrary();
const exported = exportProject(activeProject(renameProject(lib, 'Robot A/B: prueba')));
assert.match(exported.filename, /^Robot-A-B-prueba\.modo\.json$/);
const re = importProject(lib, exported.text);
assert.ok('library' in re); assert.equal(re.library.projects.length, 2);
const imported = activeProject(re.library);
assert.notEqual(imported.id, activeProject(lib).id, 'la importación crea un id nuevo');
assert.equal(imported.name, 'Robot A/B: prueba'); ok('exportar y reimportar con id nuevo');

// Archivos de otros módulos → error claro
let r = parseRobotProjectText(JSON.stringify({format: 'panellab-laboratory', version: 2, id: 'x', name: 'Lab'}));
assert.ok(!r.ok); assert.match(r.error, /Laboratorio/); ok('archivo del Laboratorio → error claro');
assert.match(parseRobotProjectText(JSON.stringify({format: 'modo-equipment', version: 1})).error, /Equipos/);
assert.match(parseRobotProjectText('{"hola":1}').error, /modo-robotica/);
assert.match(parseRobotProjectText('no es json').error, /JSON/); ok('formato desconocido y JSON roto');

// Versiones
r = parseRobotProject({...p, version: 99}); assert.ok(!r.ok); assert.match(r.error, /más nueva/);
r = parseRobotProject({...p, version: 0}); assert.ok(!r.ok);
r = parseRobotProject({...p, version: 'uno'}); assert.ok(!r.ok); ok('versión desconocida → error');

// Integridad y límites
const part = id => ({instanceId: id, definitionId: 'chassis', label: id, transform: {position: [0, 0, 0], rotation: [0, 0, 0, 1]}});
const conn = (id, a, b) => ({id, a: {instanceId: a[0], pinId: a[1]}, b: {instanceId: b[0], pinId: b[1]}, color: 'r'});
r = parseRobotProject({...p, parts: [part('a'), part('a')]}); assert.ok(!r.ok); assert.match(r.error, /repetidos/);
r = parseRobotProject({...p, parts: [part('a')], connections: [conn('c', ['a', 'X'], ['a', 'X'])]}); assert.ok(!r.ok);
r = parseRobotProject({...p, parts: [part('a'), part('b')], connections: [conn('c1', ['a', 'X'], ['b', 'Y']), conn('c2', ['b', 'Y'], ['a', 'X'])]}); assert.ok(!r.ok); assert.match(r.error, /duplicada/);
r = parseRobotProject({...p, parts: [part('a')], connections: [conn('c', ['a', 'X'], ['zz', 'Y'])]}); assert.ok(!r.ok); assert.match(r.error, /no existe/);
r = parseRobotProject({...p, parts: [{...part('a'), transform: {position: [NaN, 0, 0], rotation: [0, 0, 0, 1]}}]}); assert.ok(!r.ok);
r = parseRobotProject({...p, parts: [{...part('a'), transform: {position: [0, 0, 0], rotation: [0, 0, 0, 0.5]}}]}); assert.ok(!r.ok); assert.match(r.error, /normalizado/);
r = parseRobotProject({...p, parts: Array.from({length: LIMITS.parts + 1}, (_, i) => part('p' + i))}); assert.ok(!r.ok);
r = parseRobotProject({...p, name: ''}); assert.ok(!r.ok);
r = parseRobotProject({...p, parts: [part('a')]}, {knownDefinitions: new Set(['otra'])}); assert.ok(!r.ok); assert.match(r.error, /catálogo/);
r = parseRobotProjectText('x'.repeat(LIMITS.importBytes + 1)); assert.ok(!r.ok); assert.match(r.error, /2 MB/);
r = parseRobotProject({...p, parts: [part('a'), part('b')], connections: [conn('c1', ['a', 'X'], ['b', 'Y'])], attachments: [{id: 'u', kind: 'rigid', parent: {instanceId: 'a', anchorId: 'T'}, child: {instanceId: 'b', anchorId: 'B'}}]}); assert.ok(r.ok);
ok('integridad y límites');

// Biblioteca: datos corruptos no se aceptan (el hook no los sobrescribe)
assert.equal(readLibrary(null).status, 'empty');
assert.equal(readLibrary('{{{').status, 'unreadable');
assert.equal(readLibrary(JSON.stringify({projects: 'x', active: 'a'})).status, 'unreadable');
assert.equal(readLibrary(JSON.stringify({projects: [{format: 'modo-robotica', version: 1}], active: 'a'})).status, 'unreadable');
const good = readLibrary(JSON.stringify(lib)); assert.equal(good.status, 'ok'); assert.equal(good.library.active, lib.active);
const stale = readLibrary(JSON.stringify({...lib, active: 'no-existe'})); assert.equal(stale.library.active, lib.projects[0].id); ok('datos ilegibles se detectan y el activo se corrige');

// Operaciones de biblioteca
let l = emptyLibrary();
l = createProject(l, 'B').library; assert.equal(l.projects.length, 2);
const dup = duplicateProject(l); assert.equal(dup.library.projects.length, 3); assert.match(activeProject(dup.library).name, /\(copia\)$/);
l = deleteProject(dup.library, activeProject(dup.library).id); assert.equal(l.projects.length, 2);
let one = emptyLibrary(); one = deleteProject(one, one.active); assert.equal(one.projects.length, 1, 'nunca queda vacía');
let full = emptyLibrary(); while (full.projects.length < LIMITS.projects) full = createProject(full).library;
assert.ok('error' in createProject(full)); assert.ok('error' in duplicateProject(full)); assert.ok('error' in importProject(full, exported.text)); ok('nuevo/duplicar/borrar/máximo 30');

// Historial de 50 pasos
let h = emptyHistory(), cur = activeProject(emptyLibrary());
for (let i = 0; i < 60; i++) { h = pushHistory(h, cur); cur = {...cur, name: 'v' + i}; }
assert.equal(h.past.length, 50);
const u = undo(h, cur); assert.equal(u.project.name, 'v58'); const rd = redo(u.history, u.project); assert.equal(rd.project.name, 'v59');
assert.equal(undo(emptyHistory(), cur), null); ok('historial de 50 pasos');
assert.equal(activeProject(updateActive(emptyLibrary(), x => ({...x, name: 'Z'}))).name, 'Z');
console.log(`\n${n} bloques de pruebas OK`);
