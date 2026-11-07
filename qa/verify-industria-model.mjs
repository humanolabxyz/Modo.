// Modelo compartido de Industria: identidad, relaciones separadas, validación, migración, historial y persistencia.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {parseIndustryProject, parseIndustryProjectText, migrate} from '../src/industria/model/validate.ts';
import {addEntity, renameEntity, setEntityProp, setPose, setSymbols, mount, release, connect, disconnect, bind, unbind, dependenciesOf, removeEntity, setConnectionRoute, setMode} from '../src/industria/model/commands.ts';
import {STORAGE_KEY, readLibrary, emptyLibrary, createProject, duplicateProject, deleteProject, renameProject, importProject, exportProject, activeProject, updateActive, emptyHistory, pushHistory, undo, redo} from '../src/industria/model/library.ts';
import {parseUi, defaultUi, uiKey} from '../src/industria/model/ui.ts';
import {LIMITS} from '../src/industria/model/types.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };

// Proyecto vacío válido
const empty = newIndustryProject('Planta de prueba');
assert.equal(empty.format, 'modo-industria'); assert.equal(empty.version, 4); assert.equal(empty.mode, 'free');
assert.ok(parseIndustryProject(empty).ok); ok('proyecto vacío válido');

// Clave de almacenamiento propia, sin colisión con módulos existentes
assert.match(STORAGE_KEY, /^modo:industria:/); assert.match(uiKey('abc'), /^modo:industria:ui:abc:v1$/); ok('claves modo:industria:*');

// Entidades con ID estable
let p = must(addEntity(empty, {id: 'rail', definitionId: 'din-rail', label: 'Riel DIN'}));
p = must(addEntity(p, {id: 'km1', definitionId: 'contactor', label: 'KM1'}));
p = must(addEntity(p, {id: 'plc', definitionId: 'plc', label: 'PLC-01'}));
assert.equal(p.entities.length, 3); assert.ok(p.poses.km1);
assert.ok(!addEntity(p, {id: 'km1', definitionId: 'x', label: 'dup'}).ok); ok('altas con id estable y sin duplicados');
p = must(renameEntity(p, 'km1', 'KM1 bomba'));
assert.equal(p.entities[1].id, 'km1'); assert.equal(p.entities[1].label, 'KM1 bomba'); ok('renombrar conserva el id');
assert.ok(!renameEntity(p, 'km1', '   ').ok); assert.ok(!renameEntity(p, 'nope', 'x').ok);

// Tres relaciones distintas: montar NO conecta ni asocia
const mounted = must(mount(p, {entityId: 'rail', anchorId: 'rail-top'}, {entityId: 'km1', anchorId: 'back'}, 'din-rail'));
assert.equal(mounted.mounts.length, 1); assert.equal(mounted.connections.length, 0); assert.equal(mounted.bindings.length, 0); ok('montar no crea conexiones ni asociaciones');
assert.ok(!mount(mounted, {entityId: 'plc', anchorId: 'x'}, {entityId: 'km1', anchorId: 'back'}, 'din-rail').ok); ok('un componente no se monta dos veces');
assert.ok(!mount(p, {entityId: 'km1', anchorId: 'a'}, {entityId: 'km1', anchorId: 'b'}, 'surface').ok); ok('no se monta sobre sí mismo');
const two = must(mount(mounted, {entityId: 'rail', anchorId: 'rail-top'}, {entityId: 'plc', anchorId: 'back'}, 'din-rail'));
assert.equal(two.mounts.length, 2); ok('un riel admite varios módulos');
assert.ok(!mount(two, {entityId: 'km1', anchorId: 'a'}, {entityId: 'rail', anchorId: 'b'}, 'modular').ok); ok('rechaza ciclos de montaje');

// Conectar: sin verificar por defecto, no depende del montaje
let c = must(connect(mounted, {entityId: 'plc', terminalId: 'Q0.0'}, {entityId: 'km1', terminalId: 'A1'}, 'control', 'Q0.0→A1'));
assert.equal(c.connections[0].status, 'unverified'); ok('conexión nueva queda «no verificada»');
assert.ok(!connect(c, {entityId: 'km1', terminalId: 'A1'}, {entityId: 'plc', terminalId: 'Q0.0'}, 'control').ok); ok('conexión duplicada (en cualquier sentido) rechazada');
assert.ok(!connect(c, {entityId: 'km1', terminalId: 'A1'}, {entityId: 'km1', terminalId: 'A1'}, 'power').ok);
assert.ok(!connect(c, {entityId: 'ghost', terminalId: 'A1'}, {entityId: 'km1', terminalId: 'A2'}, 'power').ok); ok('terminal de entidad inexistente rechazado');
c = must(setConnectionRoute(c, c.connections[0].id, [[0, 0, 0], [1, 0, 0]]));
assert.equal(c.connections[0].route.length, 2);

// Liberar elimina SOLO el montaje; conserva identidad, pose y conexiones
c = must(setPose(c, 'km1', {position: [1, 2, 3], rotation: [0, 0.5, 0]}));
const released = must(release(c, c.mounts[0].id));
assert.equal(released.mounts.length, 0); assert.equal(released.connections.length, 1);
assert.deepEqual(released.poses.km1.position, [1, 2, 3]); assert.ok(released.entities.some(e => e.id === 'km1')); ok('liberar conserva identidad, pose y conexiones');
const remounted = must(mount(released, {entityId: 'rail', anchorId: 'rail-top'}, {entityId: 'km1', anchorId: 'back'}, 'din-rail'));
assert.equal(remounted.mounts.length, 1); ok('reubicar: se puede volver a montar');

// Desconectar elimina solo ese enlace
const wired = must(connect(c, {entityId: 'plc', terminalId: 'Q0.1'}, {entityId: 'km1', terminalId: 'A2'}, 'control'));
const cut = must(disconnect(wired, wired.connections[0].id));
assert.equal(cut.connections.length, 1); assert.equal(cut.entities.length, 3); ok('desconectar solo elimina el enlace');

// Asociaciones lógicas y símbolos independientes de la pose
let b = must(bind(cut, {kind: 'plc-tag', entityId: 'km1', terminalId: 'A1', target: 'Q0.0'}));
assert.ok(!bind(b, {kind: 'plc-tag', entityId: 'km1', terminalId: 'A1', target: 'Q0.0'}).ok);
b = must(setSymbols(b, 'km1', [{page: 1, x: 10, y: 20, part: 'coil'}, {page: 3, x: 40, y: 50, part: 'contact-13-14'}]));
assert.deepEqual(b.poses.km1.position, [1, 2, 3]); assert.equal(b.symbols.km1.length, 2);
assert.equal(b.entities.filter(e => e.id === 'km1').length, 1); ok('un contactor, varios símbolos, una sola entidad');
assert.equal(unbind(b, b.bindings[0].id).value.bindings.length, 0);

// Eliminar pide revisar dependencias y no borra en silencio
const dep = dependenciesOf(b, 'km1');
assert.deepEqual([dep.mounts.length, dep.connections.length, dep.bindings.length, dep.symbols], [1, 1, 1, 2]);
const refused = removeEntity(b, 'km1');
assert.ok(!refused.ok); assert.match(refused.error, /confirma/); assert.equal(refused.dependencies.connections.length, 1);
assert.equal(b.entities.length, 3); ok('eliminar con dependencias exige confirmación');
const gone = must(removeEntity(b, 'km1', {confirm: true}));
assert.equal(gone.entities.length, 2); assert.equal(gone.mounts.length, 0); assert.equal(gone.connections.length, 0); assert.equal(gone.bindings.length, 0); assert.ok(!gone.poses.km1 && !gone.symbols.km1);
assert.ok(parseIndustryProject(gone).ok); ok('eliminar confirmado deja un proyecto íntegro');
const loose = must(addEntity(empty, {id: 'solo', definitionId: 'x', label: 'Solo'}));
assert.ok(removeEntity(loose, 'solo').ok); ok('sin dependencias se elimina sin confirmar');
const locked = {...loose, entities: [{...loose.entities[0], locked: true}]};
assert.ok(!removeEntity(locked, 'solo', {confirm: true}).ok); ok('un componente bloqueado no se elimina');

// Propiedades y modo
let q = must(setEntityProp(loose, 'solo', 'tension', 24)); assert.equal(q.entities[0].props.tension, 24);
q = must(setEntityProp(q, 'solo', 'tension', null)); assert.deepEqual(q.entities[0].props, {});
assert.equal(must(setMode(q, 'test')).mode, 'test'); ok('propiedades y modo educativo');

// Exportar → importar: ida y vuelta idéntica, con id de proyecto nuevo
const lib = updateActive(emptyLibrary(), () => b);
const file = exportProject(activeProject(renameProject(lib, 'Estación A/B: bombeo')));
assert.match(file.filename, /^Estación-A-B-bombeo\.industria\.json$/);
const imp = importProject(lib, file.text);
assert.ok('library' in imp); const copy = activeProject(imp.library);
assert.notEqual(copy.id, activeProject(lib).id); assert.deepEqual(copy.entities, b.entities); assert.deepEqual(copy.connections, b.connections); assert.deepEqual(copy.poses, b.poses); ok('exportar y reimportar conserva el contenido con id nuevo');

// Archivos de otros módulos y datos dañados
assert.match(parseIndustryProjectText(JSON.stringify({format: 'modo-robotica', version: 1})).error, /Robótica/);
assert.match(parseIndustryProjectText(JSON.stringify({format: 'panellab-laboratory', version: 2})).error, /Laboratorio/);
assert.match(parseIndustryProjectText('{no json').error, /JSON/);
assert.match(parseIndustryProjectText(JSON.stringify({format: 'otra-cosa'})).error, /no es un proyecto de Industria/); ok('archivos de otros módulos → mensaje claro');
assert.ok(!parseIndustryProjectText('x'.repeat(LIMITS.importBytes + 1)).ok); ok('límite de 2 MB');
const dangling = {...b, connections: [{...b.connections[0], a: {entityId: 'fantasma', terminalId: 'X'}}]};
assert.match(parseIndustryProject(dangling).error, /no existe/); ok('integridad referencial: conexión a entidad inexistente');
assert.ok(!parseIndustryProject({...b, entities: [...b.entities, {...b.entities[0]}]}).ok); ok('ids repetidos rechazados');
const cyc = {...two, mounts: [two.mounts[0], {id: 'mx', kind: 'modular', parent: {entityId: 'km1', anchorId: 'a'}, child: {entityId: 'rail', anchorId: 'b'}}]};
assert.match(parseIndustryProject(cyc).error, /ciclo/); ok('ciclos de montaje rechazados al importar');
assert.ok(!parseIndustryProject({...b, poses: {...b.poses, fantasma: {position: [0, 0, 0], rotation: [0, 0, 0]}}}).ok);
assert.ok(!parseIndustryProject({...b, poses: {...b.poses, km1: {position: [0, NaN, 0], rotation: [0, 0, 0]}}}).ok); ok('poses con NaN o sin entidad rechazadas');

// Migración: versión futura, sin ruta, y cadena con migraciones inyectadas
assert.match(parseIndustryProject({...b, version: 5}).error, /más nueva/); ok('versión futura rechazada');
assert.match(migrate({version: 1}, {}, 3).error, /No hay migración/);
const chain = migrate({version: 1, a: 1}, {1: r => ({...r, b: 2}), 2: r => ({...r, c: 3})}, 3);
assert.ok(chain.ok); assert.deepEqual(chain.value, {version: 3, a: 1, b: 2, c: 3}); ok('cadena de migraciones');

// Biblioteca y persistencia
assert.equal(readLibrary(null).status, 'empty'); assert.equal(readLibrary('').status, 'empty');
const stored = JSON.stringify(lib);
const read = readLibrary(stored);
assert.equal(read.status, 'ok'); assert.deepEqual(activeProject(read.library).entities, b.entities); ok('guardar y recuperar la biblioteca');
assert.equal(readLibrary('{{').status, 'unreadable'); assert.equal(readLibrary('{"projects":[],"active":"x"}').status, 'unreadable');
assert.equal(readLibrary(JSON.stringify({projects: [{format: 'modo-robotica'}], active: 'x'})).status, 'unreadable'); ok('datos ilegibles no se sobrescriben (status unreadable)');
const two2 = createProject(lib).library; assert.equal(two2.projects.length, 2);
assert.equal(deleteProject(deleteProject(two2, two2.projects[0].id), two2.projects[1].id).projects.length, 1); ok('la biblioteca nunca queda vacía');
assert.equal(duplicateProject(lib).library.projects.length, 2);
let full = lib; for (let i = 0; i < LIMITS.projects; i++) { const r = createProject(full); if ('error' in r) break; full = r.library; }
assert.equal(full.projects.length, LIMITS.projects); assert.ok('error' in createProject(full)); ok('límite de proyectos');

// Deshacer / rehacer: 25 pasos y tope de 50
let proj = empty, h = emptyHistory();
for (let i = 0; i < 25; i++) { h = pushHistory(h, proj); proj = must(addEntity(proj, {definitionId: 'x', label: `C${i}`})); }
assert.equal(proj.entities.length, 25);
for (let i = 0; i < 25; i++) { const s = undo(h, proj); assert.ok(s); h = s.history; proj = s.project; }
assert.equal(proj.entities.length, 0); assert.equal(undo(h, proj), null);
for (let i = 0; i < 25; i++) { const s = redo(h, proj); assert.ok(s); h = s.history; proj = s.project; }
assert.equal(proj.entities.length, 25); assert.equal(redo(h, proj), null); ok('25 pasos de deshacer y rehacer');
let long = emptyHistory(); for (let i = 0; i < 80; i++) long = pushHistory(long, empty);
assert.equal(long.past.length, LIMITS.history); ok('historial acotado a 50');
const branched = pushHistory(undo(pushHistory(emptyHistory(), empty), proj).history, empty); assert.equal(branched.future.length, 0); ok('un cambio nuevo descarta el rehacer');

// Estado de interfaz separado y tolerante
assert.deepEqual(parseUi(null), defaultUi()); assert.deepEqual(parseUi('{roto'), defaultUi());
const ui = parseUi(JSON.stringify({version: 1, view: 'plc', operation: 'simulate', camera: {position: [1, 2, 3], target: [0, 0, 0]}, panels: {library: false, inspector: true}, selection: ['km1', 5], path: ['Planta', 'Bombeo']}));
assert.equal(ui.view, 'plc'); assert.equal(ui.operation, 'simulate'); assert.deepEqual(ui.selection, ['km1']); assert.equal(ui.panels.library, false); assert.equal(ui.panels.inspector, true); assert.equal(ui.panels.console, false);
assert.equal(parseUi(JSON.stringify({version: 1, view: 'otra', camera: {position: [1, 'x', 3]}})).view, 'plant'); ok('estado de UI separado, validado y con valores por defecto');
assert.ok(!('camera' in b) && !('selection' in b) && !('view' in b)); ok('el proyecto no contiene estado de interfaz');

console.log(`\n${n} bloques OK`);
