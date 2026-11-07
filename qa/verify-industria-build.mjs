// Constructor 3D de Industria (fase 3): anclajes, vista previa alineada, rotación, deslizamiento, interferencias, grupos y consistencia.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity, release, removeEntity} from '../src/industria/model/commands.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';
import {listShapes, shapeOf, anchorOf} from '../src/industria/build/shapes.ts';
import {findSnapCandidates, anchorWorld, overlapsOf, mountProblems, snapToGrid, descendantsOf, toTransform, SNAP_RANGE} from '../src/industria/build/snap.ts';
import {moveEntity, rotateEntity, snapMount} from '../src/industria/build/commands.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const near = (a, b, eps = 1e-4) => assert.ok(Math.abs(a - b) <= eps, `${a} ≉ ${b}`);
const nearV = (a, b, eps = 1e-4) => a.forEach((v, i) => near(v, b[i], eps));
const pose = (x, y, z, r = [0, 0, 0]) => ({position: [x, y, z], rotation: r});

// Catálogo geométrico de prueba: todo anclaje tiene normal unitaria y las formas son genéricas
for (const s of listShapes()) for (const a of s.anchors) near(Math.hypot(...a.normal), 1, 1e-9);
assert.equal(shapeOf('no-existe').anchors.length, 0); ok('formas con normales unitarias y forma desconocida sin fallar');

// Escena: placa en el suelo, riel pegado a su cara, aparato cerca del riel
let p = newIndustryProject('Construcción');
p = must(addEntity(p, {id: 'placa', definitionId: 'placa', label: 'Placa', pose: pose(0, 0, 0)}));
p = must(addEntity(p, {id: 'riel', definitionId: 'riel', label: 'Riel', pose: pose(0.02, 0.6, 0.05)})); // cerca de la cara (z=0.01)
let c = findSnapCandidates(p, 'riel');
assert.equal(c.length, 1); assert.equal(c[0].parent.entityId, 'placa'); assert.equal(c[0].parent.anchorId, 'cara'); assert.equal(c[0].child.anchorId, 'dorso');
// Alineación: el dorso del riel queda sobre la cara de la placa y su normal opuesta a la de ella
let q = must(snapMount(p, c[0]));
const dorso = anchorWorld(q.poses.riel, anchorOf('riel', 'dorso')), cara = anchorWorld(q.poses.placa, anchorOf('placa', 'cara'));
near(dorso.position[2], cara.position[2]); near(dorso.normal[0] * cara.normal[0] + dorso.normal[1] * cara.normal[1] + dorso.normal[2] * cara.normal[2], -1);
assert.equal(q.mounts.length, 1); assert.equal(q.mounts[0].kind, 'surface'); assert.deepEqual(mountProblems(q), []); ok('snap: el riel se acopla a la cara de la placa, alineado y con un montaje');

// Rotación: un riel girado 90° sobre el eje equivocado se alinea (normal opuesta, giro múltiplo de 90°)
let r = must(addEntity(p, {id: 'rail2', definitionId: 'riel', label: 'Riel girado', pose: pose(0.1, 0.3, 0.06, [0.3, 0.2, 0.15])}));
const rc = findSnapCandidates(r, 'rail2').find(x => x.parent.entityId === 'placa');
assert.ok(rc, 'candidato con rotación arbitraria');
const d2 = anchorWorld(rc.pose, anchorOf('riel', 'dorso')), n2 = anchorWorld(r.poses.placa, anchorOf('placa', 'cara'));
near(d2.normal[2], -1, 1e-3); const up = d2.up; assert.ok(Math.abs(up[0]) > 0.999 || Math.abs(up[1]) > 0.999, 'el giro queda en múltiplos de 90°'); ok('rotación: se alinea la normal y el giro queda a 90°'); void n2;

// Fuera de alcance no hay candidato; la vista previa no cambia el proyecto
assert.equal(findSnapCandidates(p, 'riel', pose(2, 0.6, 2)).length, 0); const before = JSON.stringify(p);
findSnapCandidates(p, 'riel'); assert.equal(JSON.stringify(p), before); ok('fuera de alcance no hay candidatos y buscar no modifica el modelo');
assert.ok(SNAP_RANGE > 0.05);

// Deslizamiento sobre la cara: dos puntos distintos de la placa dan posiciones distintas, recortadas a los límites
p = q; // riel montado
p = must(addEntity(p, {id: 'a1', definitionId: 'aparato-din', label: 'Aparato 1', pose: pose(0.1, 0.62, 0.09)}));
c = findSnapCandidates(p, 'a1'); assert.equal(c.length, 1); assert.equal(c[0].parent.entityId, 'riel'); assert.equal(c[0].kind, 'din-rail');
const railX = p.poses.riel.position[0];
near(c[0].pose.position[0], 0.1, 0.0051); assert.ok(c[0].pose.position[0] - railX <= 0.28 + 1e-6);
p = must(snapMount(p, c[0])); assert.equal(p.mounts.length, 2); ok('el aparato desliza sobre el riel y se monta');
// Límite del riel: más allá de 0.28 m se recorta
let far = must(addEntity(p, {id: 'a2', definitionId: 'aparato-din', label: 'Aparato 2', pose: pose(railX + 0.4, 0.62, 0.09)}));
const edge = findSnapCandidates(far, 'a2', undefined, {range: 0.5})[0];
assert.ok(edge.pose.position[0] - railX <= 0.28 + 1e-6, 'recortado al límite del riel'); ok('el deslizamiento se recorta a la longitud del riel');
// El riel admite varios aparatos (multi); una cara con anclaje no multi se ocupa
far = must(snapMount(far, findSnapCandidates(far, 'a2', pose(railX - 0.1, 0.62, 0.09))[0])); assert.equal(far.mounts.length, 3); ok('un anclaje multi admite varios hijos');

// Rejilla
assert.deepEqual(snapToGrid([0.07, 1.26, -0.02]), [0.05, 1.25, -0]); near(snapToGrid([0.07, 0, 0])[0], 0.05); ok('rejilla del imán');

// Arrastrar una pieza montada se rechaza; arrastrar el soporte arrastra a todo lo que cuelga y mantiene los montajes consistentes
assert.ok(!moveEntity(p, 'riel', pose(1, 0.6, 0.01)).ok); assert.match(moveEntity(p, 'riel', pose(1, 0.6, 0.01)).error, /montado/);
const moved = must(moveEntity(p, 'placa', pose(1.5, 0, -0.5)));
assert.deepEqual(mountProblems(moved), []); near(moved.poses.a1.position[0] - p.poses.a1.position[0], 1.5); near(moved.poses.a1.position[2] - p.poses.a1.position[2], -0.5);
assert.deepEqual(descendantsOf(p, 'placa').sort(), ['a1', 'riel']); ok('mover la placa arrastra riel y aparato; los montajes siguen coincidiendo');
// Girar el soporte gira también lo montado y no los rompe
const turned = must(rotateEntity(p, 'placa', 90)); assert.deepEqual(mountProblems(turned), []);
assert.notDeepEqual(turned.poses.a1.position.map(v => Math.round(v * 1e3)), p.poses.a1.position.map(v => Math.round(v * 1e3))); ok('girar el soporte conserva los montajes');
// Mover con rejilla
const grid = must(moveEntity(must(addEntity(newIndustryProject(), {id: 'x', definitionId: 'generico', label: 'X'})), 'x', pose(0.07, 0, 0.12), {grid: true})); assert.deepEqual(grid.poses.x.position, [0.05, 0, 0.1]); ok('mover con imán de rejilla');

// Soltar solo borra el montaje: pose, id y conexiones permanecen; el aparato queda suelto y reaparece como candidato
const loose = must(release(p, p.mounts.find(m => m.child.entityId === 'a1').id));
assert.equal(loose.mounts.length, 1); assert.ok(loose.entities.some(e => e.id === 'a1')); assert.deepEqual(loose.poses.a1, p.poses.a1);
assert.equal(findSnapCandidates(loose, 'a1').length, 1); ok('soltar conserva la pose y vuelve a ofrecer el anclaje');
// Un montaje queda inconsistente si se mueve solo el padre editando poses a mano
const hand = {...p, poses: {...p.poses, riel: {...p.poses.riel, position: [5, 5, 5]}}};
assert.ok(mountProblems(hand).length >= 1); ok('un montaje desalineado se detecta');

// Ciclos y duplicados: un padre nunca se ofrece sobre su propio descendiente; ya montado no genera candidatos
assert.equal(findSnapCandidates(p, 'riel').length, 0); assert.equal(findSnapCandidates(p, 'a1').length, 0);
const cyc = must(addEntity(p, {id: 'hijo', definitionId: 'generico', label: 'Bloque', pose: pose(5, 0, 5)}));
assert.equal(findSnapCandidates(cyc, 'placa').filter(x => x.parent.entityId === 'riel' || x.parent.entityId === 'a1').length, 0); ok('sin ciclos ni candidatos para piezas ya montadas');
// Bloque sobre bloque: cara superior (surface) recibe una base
let b = newIndustryProject();
b = must(addEntity(b, {id: 'b1', definitionId: 'generico', label: 'B1', pose: pose(0, 0, 0)}));
b = must(addEntity(b, {id: 'b2', definitionId: 'generico', label: 'B2', pose: pose(0.05, 0.45, 0.02)}));
const stack = findSnapCandidates(b, 'b2')[0]; assert.equal(stack.parent.anchorId, 'top'); near(stack.pose.position[1], 0.4);
b = must(snapMount(b, stack)); assert.deepEqual(mountProblems(b), []); ok('bloque sobre bloque');

// Interferencias: lo montado no cuenta; atravesar otra pieza sí
assert.deepEqual(overlapsOf(q, 'riel'), []); assert.deepEqual(overlapsOf(q, 'placa'), []);
const clash = must(addEntity(q, {id: 'fantasma', definitionId: 'generico', label: 'Intruso', pose: pose(0, 0, 0)}));
assert.ok(overlapsOf(clash, 'fantasma').includes('placa')); assert.ok(!overlapsOf(clash, 'fantasma', pose(3, 0, 3)).includes('placa')); ok('interferencias por cajas orientadas');

// Eliminar un soporte con hijos pide confirmación y los montajes se retiran con ella; el resto sigue consistente
const gone = removeEntity(p, 'riel'); assert.ok(!gone.ok); const forced = must(removeEntity(p, 'riel', {confirm: true}));
assert.equal(forced.mounts.length, 0); assert.ok(forced.entities.some(e => e.id === 'a1')); assert.deepEqual(mountProblems(forced), []); ok('eliminar un soporte retira sus montajes y conserva a los hijos');

// Persistencia: el proyecto con montajes y poses calculadas vuelve a validar tras serializar
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(p))).ok); ok('el proyecto montado se serializa y valida');
void toTransform;
console.log(`\n${n} bloques OK`);
