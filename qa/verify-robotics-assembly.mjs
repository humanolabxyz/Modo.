// Etapa 2 · Ensamblaje: catálogo, comandos puros, uniones, interferencia y serialización (Node 24 ejecuta .ts directamente).
import assert from 'node:assert/strict';
import {CATALOG, getDefinition, searchCatalog, catalogShape} from '../src/robotics/catalog/index.ts';
import {newRobotProject} from '../src/robotics/project/defaults.ts';
import {addPart, removeParts, moveParts, translateParts, rotatePartsAround, setPartTransform, attach, detach, duplicateParts, closure, anchorWorld, setLocked, setGroup, expandGroups, eulerToQuat, parentAttachment} from '../src/robotics/project/commands.ts';
import {qFromAxisAngle, qToEuler, qFromEuler, tMul, tInv, motion, DEG} from '../src/robotics/project/math.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {findInterferences, findJoinCandidates, obbOf, obbIntersect, placementCheck} from '../src/robotics/build/interference.ts';
import {LIMITS} from '../src/robotics/project/types.ts';
import {buildRobot2wd} from './robotics/robot2wd.mjs';

let n = 0; const ok = s => { n++; console.log('PASS', s); };
const add = (p, def, pos = [0, 0, 0], rot) => { const r = addPart(p, def, pos, rot); assert.ok(!('error' in r), r.error); return r.project; };
const last = p => p.parts.at(-1).instanceId;
const get = (p, id) => p.parts.find(x => x.instanceId === id);
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} vs ${b}`);
const close = (a, b, eps, msg) => a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) <= eps, `${msg}: ${a} vs ${b}`));

// ───── Catálogo
assert.equal(CATALOG.length, 12);
for (const id of ['chassis-2wd', 'dc-motor-tt', 'wheel-65', 'caster-ball', 'arduino-uno-r3', 'l298n-module', 'hc-sr04', 'battery-holder-4aa', 'sensor-bracket', 'bracket-generic']) assert.ok(getDefinition(id), id);
const uno = getDefinition('arduino-uno-r3'), pinIds = new Set(uno.pins.map(x => x.id));
for (let i = 0; i <= 13; i++) assert.ok(pinIds.has(`D${i}`), `D${i}`);
for (const id of ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', '5V', '3V3', 'VIN', 'GND.1', 'GND.2', 'GND.3']) assert.ok(pinIds.has(id), id);
assert.equal(uno.pins.filter(x => x.internalNet === 'GND').length, 3, 'tres GND del UNO unidos por internalNet');
assert.deepEqual(uno.pins.filter(x => x.role === 'pwm').map(x => x.id).sort(), ['D10', 'D11', 'D3', 'D5', 'D6', 'D9']);
assert.deepEqual(getDefinition('l298n-module').pins.map(x => x.id).sort(), ['+12V', '+5V', 'ENA', 'ENB', 'GND', 'IN1', 'IN2', 'IN3', 'IN4', 'OUT1', 'OUT2', 'OUT3', 'OUT4']);
assert.deepEqual(getDefinition('l298n-module').props.map(x => x.id), ['jumperENA', 'jumperENB', 'jumper5V']);
assert.deepEqual(getDefinition('hc-sr04').pins.map(x => x.id), ['VCC', 'TRIG', 'ECHO', 'GND']);
assert.deepEqual(getDefinition('dc-motor-tt').pins.map(x => x.id), ['M+', 'M-']);
assert.deepEqual(getDefinition('battery-holder-4aa').pins.map(x => x.id), ['B+', 'B-'], 'portapilas con terminales + y − (D-11 resuelta con un voltaje editable)'); assert.equal(getDefinition('battery-holder-4aa').props[0].default, 6);
assert.equal(uno.dimensionsSource, 'datasheet'); assert.equal(getDefinition('l298n-module').dimensionsSource, 'approximate');
for (const d of CATALOG) { assert.ok(d.dimensions.every(v => v > 0 && v < 0.5), d.id); assert.equal(new Set(d.pins.map(x => x.id)).size, d.pins.length, d.id + ' pines únicos'); assert.equal(new Set(d.anchors.map(x => x.id)).size, d.anchors.length); assert.equal(d.scalable, false); }
assert.equal(searchCatalog('ultrasónico').at(0).id, 'hc-sr04'); assert.ok(searchCatalog('motor').some(x => x.id === 'dc-motor-tt')); assert.deepEqual(searchCatalog('xyz'), []); assert.ok(searchCatalog('', 'sensor').every(x => x.category === 'sensor'));
ok('catálogo: 12 piezas, pines reales del UNO/L298N/HC-SR04/motor, GND con internalNet, portapilas sin pines, búsqueda sin tildes');

// ───── Añadir / borrar
let p = newRobotProject('T');
p = add(p, 'chassis-2wd'); const chassis = last(p);
p = add(p, 'dc-motor-tt', [0.2, 0, 0]); const motorL = last(p);
p = add(p, 'dc-motor-tt', [0.3, 0, 0]); const motorR = last(p);
p = add(p, 'wheel-65', [0.5, 0, 0]); const wheelL = last(p);
assert.deepEqual(p.parts.map(x => x.label), ['Chasis 2WD 1', 'Motor DC TT 1', 'Motor DC TT 2', 'Rueda 65 mm 1']);
assert.ok('error' in addPart(p, 'inventada'));
let full = newRobotProject('F'); for (let i = 0; i < LIMITS.parts; i++) full = add(full, 'caster-ball'); assert.ok('error' in addPart(full, 'caster-ball'));
assert.deepEqual(removeParts(p, [wheelL]).project.parts.map(x => x.instanceId), [chassis, motorL, motorR]);
ok('añadir con etiqueta única, rechazar definiciones inexistentes y el límite de 200');

// ───── Uniones: compatibilidad
let r = attach(p, {instanceId: chassis, anchorId: 'motor-l'}, {instanceId: motorL, anchorId: 'base'}); assert.ok(!('error' in r), r.error); p = r.project;
close(anchorWorld(get(p, motorL), 'base').position, anchorWorld(get(p, chassis), 'motor-l').position, 1e-9, 'los anclajes coinciden tras unir');
assert.equal(p.attachments.length, 1); assert.equal(p.attachments[0].kind, 'rigid');
assert.match(attach(p, {instanceId: chassis, anchorId: 'motor-l'}, {instanceId: motorR, anchorId: 'base'}).error, /ocupado/);
assert.match(attach(p, {instanceId: chassis, anchorId: 'board'}, {instanceId: motorR, anchorId: 'base'}).error, /no encaja/);
assert.match(attach(p, {instanceId: chassis, anchorId: 'motor-r'}, {instanceId: motorL, anchorId: 'base'}).error, /ya está unida/);
assert.match(attach(p, {instanceId: motorR, anchorId: 'axle-r'}, {instanceId: motorR, anchorId: 'base'}).error, /sí misma/);
r = attach(p, {instanceId: chassis, anchorId: 'motor-r'}, {instanceId: motorR, anchorId: 'base'}); p = r.project;
r = attach(p, {instanceId: motorL, anchorId: 'axle-l'}, {instanceId: wheelL, anchorId: 'hub'}); assert.ok(!('error' in r), r.error); p = r.project;
const hinge = p.attachments.find(a => a.child.instanceId === wheelL); assert.equal(hinge.kind, 'wheel-hinge'); assert.deepEqual(hinge.axis, [-1, 0, 0]);
assert.deepEqual([...closure(p, [chassis])].sort(), [chassis, motorL, motorR, wheelL].sort());
ok('unir motor→chasis y rueda→eje (wheel-hinge con eje); rechaza ocupado, incompatible, ya unida y consigo misma');

// ───── Mover el chasis conserva las transformaciones relativas (tolerancia 1e-6)
const rel = (proj, a, b) => tMul(tInv(get(proj, a).transform), get(proj, b).transform);
const before = {m: rel(p, chassis, motorL), w: rel(p, chassis, wheelL), r: rel(p, chassis, motorR)};
const q = qFromAxisAngle([0.3, 1, 0.2], 37 * DEG);
let moved = moveParts(p, [chassis], motion([0.12, 0.03, -0.4], q, [0.05, 0, 0.02])); assert.deepEqual(moved.notes, []);
for (const [key, id] of [['m', motorL], ['w', wheelL], ['r', motorR]]) { const now = rel(moved.project, chassis, id); close(now.position, before[key].position, 1e-6, 'posición relativa ' + key); close(now.rotation, before[key].rotation, 1e-6, 'rotación relativa ' + key); }
assert.equal(moved.project.attachments.length, 3, 'las uniones se conservan al mover el padre');
ok('mover/rotar el chasis: motores y rueda conservan su transformación relativa (1e-6) y las uniones');

// Mover un hijo suelto lo separa (con aviso)
moved = translateParts(p, [wheelL], [0, 0.1, 0]); assert.equal(moved.project.attachments.length, 2); assert.match(moved.notes[0], /se separó/);
// Mover padre e hijo juntos NO separa
moved = translateParts(p, [chassis, motorL], [0.1, 0, 0]); assert.equal(moved.project.attachments.length, 3); assert.deepEqual(moved.notes, []);
// Bloqueo
const locked = setLocked(p, [chassis], true); const stay = translateParts(locked, [chassis], [1, 0, 0]);
assert.deepEqual(get(stay.project, chassis).transform.position, get(p, chassis).transform.position); assert.match(stay.notes[0], /bloqueadas/);
ok('un hijo movido por su cuenta se separa con aviso; padre+hijo juntos no; las piezas bloqueadas no se mueven');

// ───── setPartTransform arrastra a los hijos; rotación en grados
const target = {position: [0.5, 0.02, -0.3], rotation: eulerToQuat([10, 90, -20])};
const placed = setPartTransform(p, chassis, target).project;
close(get(placed, chassis).transform.position, target.position, 1e-9, 'posición exacta'); close(get(placed, chassis).transform.rotation, target.rotation, 1e-9, 'rotación exacta');
close(rel(placed, chassis, wheelL).position, before.w.position, 1e-6, 'la rueda sigue al chasis');
const e = qToEuler(qFromEuler([0.2, -0.4, 0.9])); close(e, [0.2, -0.4, 0.9], 1e-9, 'euler ida y vuelta');
ok('editar coordenadas absolutas y grados mueve a los hijos; Euler↔cuaternión coherente');

// ───── Quitar una pieza rompe sus uniones, cables y programa
let wired = add(p, 'arduino-uno-r3', [0, 0.1, 0]); const arduino = last(wired); const l298 = (wired = add(wired, 'l298n-module', [0, 0.1, 0.2]), last(wired));
wired = {...wired, connections: [{id: 'c1', a: {instanceId: arduino, pinId: 'D5'}, b: {instanceId: l298, pinId: 'ENA'}, color: '#c00'}, {id: 'c2', a: {instanceId: motorL, pinId: 'M+'}, b: {instanceId: l298, pinId: 'OUT1'}, color: '#000'}], firmware: [{id: 'f1', targetInstanceId: arduino, board: 'arduino-uno-r3', source: 'void setup(){}void loop(){}', updatedAt: '2026-10-29T00:00:00Z'}]};
assert.ok(parseRobotProject(wired, {catalog: catalogShape}).ok, parseRobotProject(wired, {catalog: catalogShape}).error);
let gone = removeParts(wired, [motorL]); assert.equal(gone.project.attachments.filter(a => a.child.instanceId === wheelL || a.child.instanceId === motorL).length, 0, 'borrar el motor elimina sus uniones (con la rueda)');
assert.equal(gone.project.connections.length, 1); assert.equal(gone.project.firmware.length, 1); assert.ok(gone.notes.some(t => /unión/.test(t)) && gone.notes.some(t => /cable/.test(t)));
gone = removeParts(wired, [arduino]); assert.equal(gone.project.firmware.length, 0); assert.equal(gone.project.connections.length, 1); assert.ok(gone.notes.some(t => /programa/.test(t)));
assert.ok(parseRobotProject(gone.project, {catalog: catalogShape}).ok);
ok('borrar un motor elimina sus uniones; borrar el Arduino elimina su programa y sus cables; el resultado sigue siendo válido');

// ───── Serializar → parsear → igual
const round = parseRobotProject(JSON.parse(JSON.stringify(wired)), {catalog: catalogShape}); assert.ok(round.ok); assert.deepEqual(round.project, wired);
ok('serializar → parsear → deep equal');

// ───── Validación contra el catálogo
assert.match(parseRobotProject({...wired, connections: [{id: 'x', a: {instanceId: arduino, pinId: 'D99'}, b: {instanceId: l298, pinId: 'ENA'}, color: 'r'}]}, {catalog: catalogShape}).error, /pin/);
assert.match(parseRobotProject({...wired, attachments: [{id: 'z', kind: 'rigid', parent: {instanceId: chassis, anchorId: 'nada'}, child: {instanceId: arduino, anchorId: 'base'}}]}, {catalog: catalogShape}).error, /anclaje/);
const cyc = {...wired, attachments: [{id: 'a1', kind: 'rigid', parent: {instanceId: chassis, anchorId: 'board'}, child: {instanceId: arduino, anchorId: 'base'}}, {id: 'a2', kind: 'rigid', parent: {instanceId: arduino, anchorId: 'base'}, child: {instanceId: chassis, anchorId: 'board'}}]};
assert.match(parseRobotProject(cyc, {catalog: catalogShape}).error, /círculo|padre/);
assert.match(parseRobotProject({...wired, parts: [...wired.parts, {...get(wired, chassis), instanceId: 'otra', definitionId: 'inexistente'}]}, {catalog: catalogShape, knownDefinitions: new Set(CATALOG.map(d => d.id))}).error, /catálogo/);
ok('el validador rechaza pines/anclajes ajenos a la definición, ciclos y definiciones desconocidas');

// ───── Dos UNO tienen pines independientes
let two = add(newRobotProject('2'), 'arduino-uno-r3'); two = add(two, 'arduino-uno-r3', [0.2, 0, 0]); const [u1, u2] = two.parts.map(x => x.instanceId);
two = {...two, connections: [{id: 'k', a: {instanceId: u1, pinId: 'D5'}, b: {instanceId: u1, pinId: 'D6'}, color: 'r'}, {id: 'k2', a: {instanceId: u2, pinId: 'D5'}, b: {instanceId: u2, pinId: 'D6'}, color: 'r'}]};
assert.ok(parseRobotProject(two, {catalog: catalogShape}).ok);
assert.match(parseRobotProject({...two, connections: [...two.connections, {id: 'k3', a: {instanceId: u2, pinId: 'D6'}, b: {instanceId: u1, pinId: 'D5'}, color: 'r'}]}, {catalog: catalogShape}).error ?? 'sin error', /sin error/, 'unir pines de dos placas distintas es válido');
assert.notEqual(two.parts[0].instanceId, two.parts[1].instanceId); assert.notEqual(two.parts[0].label, two.parts[1].label);
const dup = parseRobotProject({...two, connections: [...two.connections, {id: 'k4', a: {instanceId: u2, pinId: 'D6'}, b: {instanceId: u2, pinId: 'D5'}, color: 'r'}]}, {catalog: catalogShape}); assert.match(dup.error, /duplicada/, 'D5–D6 de la placa 2 ya existía, el de la placa 1 no cuenta');
ok('dos UNO: los mismos nombres de pin son independientes por instancia');

// ───── Duplicar conserva uniones internas y ofrece ids nuevos
const copy = duplicateParts(p, [chassis]).project; assert.equal(copy.parts.length, p.parts.length * 2); assert.equal(copy.attachments.length, p.attachments.length * 2);
assert.equal(new Set(copy.parts.map(x => x.instanceId)).size, copy.parts.length); assert.ok(parseRobotProject(copy, {catalog: catalogShape}).ok);
const c0 = copy.parts[p.parts.length]; close(c0.transform.position, [get(p, chassis).transform.position[0] + 0.03, get(p, chassis).transform.position[1], get(p, chassis).transform.position[2] + 0.03], 1e-12, 'desplazada');
ok('duplicar el chasis duplica motores y rueda con sus uniones, ids nuevos y proyecto válido');

// ───── Grupos
let g = add(add(newRobotProject('G'), 'caster-ball'), 'caster-ball'); g = add(g, 'caster-ball'); const [g1, g2, g3] = g.parts.map(x => x.instanceId);
g = setGroup(g, [g1, g2], true); assert.deepEqual(expandGroups(g, [g1]).sort(), [g1, g2].sort()); assert.deepEqual(expandGroups(g, [g3]), [g3]);
g = setGroup(g, [g1, g2], false); assert.deepEqual(expandGroups(g, [g1]), [g1]);
ok('agrupar / desagrupar y expandir la selección al grupo');

// ───── Interferencia (OBB)
let ob = add(newRobotProject('O'), 'arduino-uno-r3', [0, 0, 0]); ob = add(ob, 'arduino-uno-r3', [0.02, 0, 0.0]); // se solapan
assert.equal(findInterferences(ob).length, 1);
ob = add(newRobotProject('O'), 'arduino-uno-r3', [0, 0, 0]); ob = add(ob, 'arduino-uno-r3', [0.0534, 0, 0]); // se tocan por una cara: no cuenta
assert.equal(findInterferences(ob).length, 0, 'tocarse no es interferir');
ob = add(newRobotProject('O'), 'arduino-uno-r3', [0, 0, 0]); ob = add(ob, 'arduino-uno-r3', [0.2, 0, 0]); assert.equal(findInterferences(ob).length, 0);
// Rotada 45° alrededor de Y: las cajas alineadas a ejes no se tocarían pero las orientadas sí
let rot = add(newRobotProject('R'), 'chassis-2wd', [0, 0, 0]); rot = add(rot, 'chassis-2wd', [0.17, 0, 0], qFromAxisAngle([0, 1, 0], 45 * DEG));
assert.equal(findInterferences(rot).length, 1, 'esquinas rotadas se atraviesan');
rot = add(newRobotProject('R'), 'chassis-2wd', [0, 0, 0]); rot = add(rot, 'chassis-2wd', [0.25, 0, 0], qFromAxisAngle([0, 1, 0], 45 * DEG)); assert.equal(findInterferences(rot).length, 0);
// Piezas unidas no cuentan aunque se toquen
assert.equal(findInterferences(p).filter(([a, b]) => [a, b].includes(motorL) && [a, b].includes(chassis)).length, 0);
// Dos cajas simples (SAT)
const unit = (c, ax) => ({center: c, axes: ax ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]], half: [1, 1, 1]});
assert.ok(obbIntersect(unit([0, 0, 0]), unit([1.9, 0, 0]))); assert.ok(!obbIntersect(unit([0, 0, 0]), unit([2.1, 0, 0])));
ok('interferencia OBB: solapa/toca/lejos, cajas rotadas, piezas unidas excluidas; es solo advertencia (no modifica el proyecto)');

// ───── Candidatos de unión (≤ 15 mm)
let j = add(newRobotProject('J'), 'chassis-2wd', [0, 0, 0]); const jc = last(j);
j = add(j, 'arduino-uno-r3', [0, 0.0075 + 0.002 + 0.01, 0.04]); const ja = last(j); // a 10 mm del anclaje «board»
let cands = findJoinCandidates(j, [ja]); assert.equal(cands.length, 1); assert.deepEqual([cands[0].parent.anchorId, cands[0].child.anchorId], ['board', 'base']); assert.ok(Math.abs(cands[0].distance - 0.01) < 1e-9);
assert.equal(findJoinCandidates(j, [jc]).length, 1, 'también se detecta desde el anfitrión');
j = {...j, parts: j.parts.map(x => (x.instanceId === ja ? {...x, transform: {...x.transform, position: [0, 0.05, 0.04]}} : x))}; assert.equal(findJoinCandidates(j, [ja]).length, 0, 'a 40 mm no hay candidato');
j = add(j, 'l298n-module', [0, 0.0135 + 0.002, -0.045]); const jl = last(j); j = add(j, 'l298n-module', [0, 0.0135 + 0.002, -0.045]); assert.equal(findJoinCandidates(j, [jl]).length, 1);
const joined = attach(j, {instanceId: jc, anchorId: 'driver'}, {instanceId: jl, anchorId: 'base'}).project; assert.equal(findJoinCandidates(joined, [last(j)]).length, 0, 'un anclaje ocupado no se ofrece');
assert.ok(parentAttachment(joined, jl));
ok('candidatos de unión a ≤ 15 mm: compatibles y libres; no se ofrecen anclajes ocupados ni piezas ya unidas');

// ───── Colocación (fantasma de inserción)
{ const base = add(newRobotProject('P'), 'arduino-uno-r3', [0, 0.0075, 0]);
  assert.deepEqual(placementCheck(base, 'hc-sr04', [0.3, 0.01, 0]), {ok: true, overlaps: []});
  const over = placementCheck(base, 'hc-sr04', [0.01, 0.01, 0]); assert.equal(over.ok, true, 'superponerse no impide colocar'); assert.equal(over.overlaps.length, 1);
  assert.match(placementCheck(base, 'hc-sr04', [5.5, 0.01, 0]).reason, /área de trabajo/); assert.match(placementCheck(base, 'hc-sr04', [0, 0.01, -6]).reason, /área de trabajo/);
  assert.match(placementCheck(base, 'hc-sr04', [0, 0.01, 0], 1).reason, /máximo/); assert.match(placementCheck(base, 'nada', [0, 0, 0]).reason, /catálogo/); }
ok('colocación: se explica por qué no se puede (fuera del área, tope de piezas, pieza inexistente) y solo se avisa de superposiciones');

// ───── Robot completo de dos ruedas
{ const {project: robot, ids} = buildRobot2wd();
  assert.equal(robot.parts.length, 11); assert.equal(robot.attachments.length, 10); assert.equal(robot.attachments.filter(a => a.kind === 'wheel-hinge').length, 2);
  assert.ok(parseRobotProject(robot, {catalog: catalogShape}).ok);
  assert.deepEqual(findInterferences(robot), [], 'un robot bien armado no tiene piezas atravesadas');
  assert.equal(closure(robot, [ids.chassis]).size, 11, 'todo cuelga del chasis');
  assert.equal(closure(robot, [ids.bracket]).size, 2);
  const wheelY = ['wheelL', 'wheelR'].map(k => get(robot, ids[k]).transform.position[1]); wheelY.forEach(y => near(y, 0.0325, 1e-9, 'las ruedas apoyan en el suelo'));
  const rt = parseRobotProject(JSON.parse(JSON.stringify(robot)), {catalog: catalogShape}); assert.deepEqual(rt.project, robot);
  // Mover y girar el chasis lleva a las 10 piezas con sus relativas intactas
  const rels = Object.entries(ids).filter(([k]) => k !== 'chassis').map(([k, id]) => [id, rel(robot, ids.chassis, id)]);
  const turned = moveParts(robot, [ids.chassis], motion([0.4, 0, -0.25], qFromAxisAngle([0, 1, 0], 0.9), [0, 0, 0])).project;
  for (const [id, r0] of rels) { const r1 = rel(turned, ids.chassis, id); close(r1.position, r0.position, 1e-6, 'posición relativa'); close(r1.rotation, r0.rotation, 1e-6, 'rotación relativa'); }
  assert.equal(turned.attachments.length, 10);
  // Quitar un motor deja la rueda suelta pero sin ciclos ni uniones colgando
  const noMotor = removeParts(robot, [ids.motorL]).project; assert.equal(noMotor.attachments.length, 8, 'se rompen la unión al chasis y la del eje'); assert.ok(parseRobotProject(noMotor, {catalog: catalogShape}).ok);
}
ok('robot de 2 ruedas completo (11 piezas, 10 uniones, 2 de eje): válido, sin interferencias, ruedas en el suelo, serializa igual y se mueve como un solo cuerpo');

// Desuniones
const free = detach(p, p.attachments[0].id); assert.equal(free.attachments.length, 2);
ok('separar una unión');
console.log(`\n${n} bloques OK`);
