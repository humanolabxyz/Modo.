// Etapa 3 · Circuito: redes, tensiones estáticas, diagnósticos y medición (invariantes de docs/robotica/fuentes/03).
import assert from 'node:assert/strict';
import {catalogShape} from '../src/robotics/catalog/index.ts';
import {newRobotProject} from '../src/robotics/project/defaults.ts';
import {addPart, connect, disconnect, setConnectionRoute, setConnectionColor, setPartProp, removeParts, pinWorld, moveParts, translateParts} from '../src/robotics/project/commands.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {buildGraph, netOfPin, peers, isConnected} from '../src/robotics/circuit/graph.ts';
import {solve, measure} from '../src/robotics/circuit/solve.ts';
import {diagnose, connectionLabel} from '../src/robotics/circuit/diagnostics.ts';
import {buildRobot2wd, wireRobot2wd} from './robotics/robot2wd.mjs';

let n = 0; const ok = s => { n++; console.log('PASS', s); };
const add = (p, def, pos = [0, 0, 0]) => { const r = addPart(p, def, pos); assert.ok(!('error' in r), r.error); return [r.project, r.project.parts.at(-1).instanceId]; };
const wire = (p, a, b, color) => { const r = connect(p, a, b, color); assert.ok(!('error' in r), r.error); return r.project; };
const P = (id, pin) => ({instanceId: id, pinId: pin});
const codes = ds => ds.map(d => d.code);
const sameNet = (g, a, b) => netOfPin(g, ...a) === netOfPin(g, ...b);
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} vs ${b}`);

// ───── Redes
let p = newRobotProject('C'); let uno, drv, bat;
[p, uno] = add(p, 'arduino-uno-r3'); [p, drv] = add(p, 'l298n-module', [0.1, 0, 0]); [p, bat] = add(p, 'battery-holder-4aa', [0.2, 0, 0]);
let g = buildGraph(p);
assert.ok(!sameNet(g, [uno, 'D5'], [drv, 'ENA']), 'un pin desconectado no propaga a otros');
assert.ok(sameNet(g, [uno, 'GND.1'], [uno, 'GND.2']) && sameNet(g, [uno, 'GND.2'], [uno, 'GND.3']), 'los tres GND del UNO son una sola red (internalNet)');
assert.ok(!sameNet(g, [uno, 'GND.1'], [drv, 'GND']), 'GND de piezas distintas no se unen solos');
assert.ok(sameNet(g, [drv, 'ENA'], [drv, '+5V']) && sameNet(g, [drv, 'ENB'], [drv, '+5V']), 'con los puentes puestos ENA y ENB van a +5V');
assert.ok(!sameNet(buildGraph(setPartProp(setPartProp(p, drv, 'jumperENA', false), drv, 'jumperENB', false)), [drv, 'ENA'], [drv, '+5V']), 'sin el puente ENA queda libre');
assert.equal(isConnected(g, P(uno, 'D5')), false); assert.equal(isConnected(g, P(uno, 'GND.1')), true, 'el GND tiene pares internos');
p = wire(p, P(uno, 'D5'), P(drv, 'ENA')); g = buildGraph(p);
assert.ok(sameNet(g, [uno, 'D5'], [drv, 'ENA'])); assert.ok(peers(g, P(uno, 'D5')).some(r => r.instanceId === drv && r.pinId === 'ENA') && peers(g, P(uno, 'D5')).some(r => r.pinId === '+5V'), 'ENA arrastra a +5V por el puente');
assert.match(connect(p, P(uno, 'D5'), P(drv, 'ENA')).error, /ya están unidos/);
assert.match(connect(p, P(uno, 'D5'), P(uno, 'D5')).error, /mismo pin/); assert.match(connect(p, P(uno, 'D5'), P(drv, 'XX')).error, /no existe/); assert.match(connect(p, P(uno, 'D5'), P('fantasma', 'A')).error, /ya no existe/);
assert.match(connect(p, P(drv, 'ENA'), P(uno, 'D5')).error, /ya están unidos/, 'el par no tiene orden');
ok('redes: pin suelto no propaga, GND del UNO unidos, puentes ENA/ENB, cable, duplicado/mismo pin/pin inexistente');

// ───── Dos UNO idénticos no mezclan redes
let two = newRobotProject('2'); let u1, u2; [two, u1] = add(two, 'arduino-uno-r3'); [two, u2] = add(two, 'arduino-uno-r3', [0.2, 0, 0]);
two = wire(two, P(u1, 'D5'), P(u1, 'D6')); const g2 = buildGraph(two);
assert.ok(sameNet(g2, [u1, 'D5'], [u1, 'D6'])); assert.ok(!sameNet(g2, [u2, 'D5'], [u2, 'D6']), 'el cable de la placa 1 no toca la placa 2');
assert.ok(!sameNet(g2, [u1, 'GND.1'], [u2, 'GND.1']), 'los GND de dos UNO son redes distintas'); assert.notEqual(netOfPin(g2, u1, 'D5'), netOfPin(g2, u2, 'D5'));
ok('dos UNO idénticos: mismos nombres de pin, redes independientes');

// ───── Quitar un componente elimina sus conexiones
const full = await wireRobot2wd(buildRobot2wd());
assert.equal(full.connections.length, 18); assert.ok(parseRobotProject(full, {catalog: catalogShape}).ok);
const parts = Object.fromEntries(full.parts.map(x => [x.definitionId + (x.label.endsWith('2') ? '2' : ''), x.instanceId]));
const unoId = parts['arduino-uno-r3'], drvId = parts['l298n-module'], batId = parts['battery-holder-4aa'], senId = parts['hc-sr04'], mL = parts['dc-motor-tt'], mR = parts['dc-motor-tt2'];
const noUno = removeParts(full, [unoId]); assert.equal(noUno.project.connections.filter(c => c.a.instanceId === unoId || c.b.instanceId === unoId).length, 0); assert.ok(noUno.project.connections.length < full.connections.length); assert.ok(noUno.notes.some(t => /cable/.test(t)));
assert.ok(parseRobotProject(noUno.project, {catalog: catalogShape}).ok);
ok('quitar el UNO elimina sus 12 cables y deja un proyecto válido');

// ───── Robot bien cableado: tensiones y sin diagnósticos graves
let sol = solve(full);
const v = (a, b) => measure(sol, a, b).volts;
near(v(P(batId, 'B+'), P(batId, 'B-')), 6); near(v(P(drvId, '+12V'), P(drvId, 'GND')), 6); near(v(P(unoId, 'VIN'), P(unoId, 'GND.3')), 6);
assert.deepEqual(sol.devices.get(unoId), {kind: 'uno', powered: false, via: null, vin: 6, overvoltage: false}, 'con 6 V el UNO NO arranca por VIN (necesita ≥ 7 V)');
assert.equal(sol.devices.get(drvId).regulatorOn, false, 'el regulador del L298N necesita ≥ 7 V');
assert.equal(sol.devices.get(drvId).motorPowered, true);
ok('con 6 V (4×AA) el UNO por VIN y el regulador del L298N no arrancan (mínimo 7 V): lo que enseña el aula');

let seven = setPartProp(full, batId, 'voltage', 9); sol = solve(seven);
assert.deepEqual(sol.devices.get(unoId), {kind: 'uno', powered: true, via: 'vin', vin: 9, overvoltage: false});
assert.equal(sol.devices.get(drvId).regulatorOn, true); assert.equal(sol.devices.get(drvId).logicPowered, true); assert.equal(sol.devices.get(senId).powered, true);
near(measure(sol, P(unoId, '5V'), P(unoId, 'GND.2')).volts, 5); near(measure(sol, P(senId, 'VCC'), P(senId, 'GND')).volts, 5); near(measure(sol, P(batId, 'B+'), P(unoId, 'GND.1')).volts, 9);
let d = diagnose(seven, sol); assert.deepEqual(d.filter(x => x.severity !== 'info'), [], `sin avisos: ${JSON.stringify(d)}`);
ok('con 9 V: el UNO arranca por VIN, el L298N regula 5 V, el sensor recibe 5 V; el robot bien cableado no tiene errores ni avisos');

// ───── Mediciones
assert.deepEqual(measure(sol, P(unoId, 'D4'), P(drvId, 'IN1')), {volts: 0, continuity: true, note: 'Los dos pines están unidos (continuidad).'});
let r = measure(sol, P(unoId, 'D4'), P(unoId, 'D7')); assert.equal(r.continuity, false); assert.equal(r.volts, null); assert.match(r.note, /Sin referencia común/);
r = measure(sol, P(batId, 'B-'), P(batId, 'B+')); near(r.volts, -9); assert.equal(r.continuity, false);
assert.match(measure(sol, P(unoId, 'D4'), P('x', 'y')).note, /no existe/);
ok('multímetro: continuidad entre pines cableados, tensión con signo entre redes alimentadas y «sin referencia» entre flotantes');

// ───── Diagnósticos
const base = seven;
// batería invertida
{ const bad = JSON.parse(JSON.stringify(base)); bad.connections = bad.connections.filter(c => !(c.a.pinId === 'B+' || c.a.pinId === 'B-' || c.b.pinId === 'B+' || c.b.pinId === 'B-'));
  let q = bad; q = wire(q, P(batId, 'B-'), P(drvId, '+12V')); q = wire(q, P(batId, 'B-'), P(unoId, 'VIN')); q = wire(q, P(batId, 'B+'), P(drvId, 'GND'));
  const dd = diagnose(q); assert.ok(codes(dd).includes('battery-reversed'), JSON.stringify(codes(dd))); assert.equal(dd.find(x => x.code === 'battery-reversed').severity, 'error'); assert.ok(dd.find(x => x.code === 'battery-reversed').refs.length >= 3);
  assert.equal(solve(q).devices.get(unoId).powered, false, 'con la polaridad invertida nada arranca'); assert.ok(codes(dd).includes('unpowered-device')); }
// masas no comunes
{ const q = {...base, connections: base.connections.filter(c => !((c.a.pinId === 'GND' && c.b.pinId === 'GND.1') || (c.a.pinId === 'GND.1' && c.b.pinId === 'GND')))};
  const dd = diagnose(q); assert.ok(codes(dd).includes('ground-not-common'), JSON.stringify(codes(dd))); const gn = dd.find(x => x.code === 'ground-not-common'); assert.deepEqual(gn.refs.map(x => x.pinId).sort(), ['GND', 'GND.1']); assert.match(gn.message, /sin masa común|no están unidos/); }
// corto 5V–GND del UNO
{ const q = wire(base, P(unoId, '5V'), P(unoId, 'GND.3')); const dd = diagnose(q); assert.ok(codes(dd).includes('supply-short')); }
// corto de la batería
{ const q = wire(base, P(batId, 'B+'), P(batId, 'B-')); assert.ok(codes(diagnose(q)).includes('supply-short')); }
// sin alimentación del L298N (batería desconectada) y UNO sin USB
{ const q = {...base, connections: base.connections.filter(c => ![c.a, c.b].some(r => r.instanceId === batId))}; const dd = diagnose(q); const un = dd.filter(x => x.code === 'unpowered-device'); assert.ok(un.length >= 3, `UNO, L298N y sensor sin alimentación: ${un.map(x => x.message)}`); }
{ const q = setPartProp({...base, connections: base.connections.filter(c => ![c.a, c.b].some(r => r.instanceId === batId))}, unoId, 'usb', true); assert.equal(solve(q).devices.get(unoId).via, 'usb'); near(measure(solve(q), P(unoId, '5V'), P(unoId, 'GND.1')).volts, 5); assert.equal(solve(q).devices.get(senId).powered, true, 'el 5V del UNO por USB alimenta al sensor'); }
// motor sin conectar y sensor con TRIG/ECHO sueltos
{ const q = {...base, connections: base.connections.filter(c => !(c.a.instanceId === mR || c.b.instanceId === mR) && !(c.a.pinId === 'TRIG' || c.a.pinId === 'ECHO'))}; const dd = diagnose(q); assert.ok(codes(dd).includes('motor-unconnected')); assert.ok(codes(dd).includes('sensor-pin-unconnected')); assert.match(dd.find(x => x.code === 'sensor-pin-unconnected').message, /TRIG y ECHO/); }
// salida a salida y pines unidos
{ const q = wire(wire(base, P(drvId, 'OUT1'), P(drvId, 'OUT3')), P(unoId, 'D2'), P(unoId, 'D3')); const dd = codes(diagnose(q)); assert.ok(dd.includes('output-conflict') && dd.includes('pins-tied')); }
// dos fuentes de 5 V unidas (UNO por USB + regulador del L298N)
{ const q = setPartProp(wire(base, P(unoId, '5V'), P(drvId, '+5V')), unoId, 'usb', true); const dd = diagnose(q); assert.ok(dd.some(x => x.code === 'output-conflict' && /fuentes de alimentación/.test(x.message)), JSON.stringify(dd.map(x => x.message))); }
// sobretensión en VIN
{ const q = setPartProp(base, batId, 'voltage', 18); assert.ok(codes(diagnose(q)).includes('overvoltage')); }
// puente de ENA con cable de PWM: aviso informativo
{ const q = setPartProp(base, drvId, 'jumperENA', true); const dd = diagnose(q); assert.ok(dd.some(x => x.code === 'enable-jumper' && x.severity === 'info')); }
// alimentar el UNO desde el +5V del L298N (sin VIN)
{ let q = {...base, connections: base.connections.filter(c => ![c.a.pinId, c.b.pinId].includes('VIN'))}; q = wire(q, P(drvId, '+5V'), P(unoId, '5V')); q = {...q, connections: q.connections.filter(c => !(c.a.instanceId === senId && c.a.pinId === 'VCC'))}; q = wire(q, P(senId, 'VCC'), P(drvId, '+5V'));
  const sq = solve(q); assert.equal(sq.devices.get(unoId).via, '5v'); assert.equal(sq.devices.get(senId).powered, true); assert.deepEqual(diagnose(q).filter(x => x.severity !== 'info'), [], 'alimentar el UNO por su pin 5V desde el L298N es válido'); }
// orden: errores antes que avisos
{ const q = wire({...base, connections: base.connections.filter(c => ![c.a, c.b].some(r => r.instanceId === mR))}, P(batId, 'B+'), P(batId, 'B-')); const sev = diagnose(q).map(x => x.severity); assert.deepEqual(sev, [...sev].sort((a, b) => ({error: 0, warning: 1, info: 2}[a] - {error: 0, warning: 1, info: 2}[b]))); }
ok('diagnósticos: batería invertida, masas no comunes, cortos, sin alimentación (con y sin USB), motor y sensor sueltos, salida↔salida, fuentes unidas, sobretensión, puente ENA, UNO por +5V del L298N');

// ───── Etiquetas y estado vacío
assert.equal(connectionLabel(full, P(unoId, 'D5'), P(drvId, 'ENA')), 'Arduino UNO R3 1 · D5 → Driver L298N 1 · ENA');
assert.deepEqual(diagnose(newRobotProject('vacío')), []); assert.deepEqual(diagnose(add(newRobotProject('x'), 'arduino-uno-r3')[0]), [], 'una placa sola, sin cables, no es un error');
ok('etiqueta «Arduino UNO R3 1 · D5 → Driver L298N 1 · ENA» y proyectos vacíos/sueltos sin avisos');

// ───── Los cables siguen a los pines y se serializan idénticos
const w0 = pinWorld(full, P(unoId, 'D5')); const moved = translateParts(full, [unoId], [0.01, 0.02, 0.03]); // el UNO está unido al chasis: se separa y se mueve
const w1 = pinWorld(moved.project, P(unoId, 'D5')); near(w1[0] - w0[0], 0.01); near(w1[1] - w0[1], 0.02); near(w1[2] - w0[2], 0.03);
assert.equal(moved.project.connections.length, full.connections.length, 'mover una pieza conserva sus cables');
const chassisMoved = moveParts(full, [full.parts.find(x => x.definitionId === 'chassis-2wd').instanceId], {position: [0.1, 0, 0], rotation: [0, 0, 0, 1]}).project;
near(pinWorld(chassisMoved, P(drvId, 'ENA'))[0] - pinWorld(full, P(drvId, 'ENA'))[0], 0.1); assert.equal(chassisMoved.connections.length, 18);
const withRoute = setConnectionRoute(full, full.connections[0].id, [[0, 0.1, 0], [0.05, 0.12, 0.02]]); assert.equal(withRoute.connections[0].route.length, 2); assert.ok(parseRobotProject(withRoute, {catalog: catalogShape}).ok);
assert.equal(setConnectionRoute(withRoute, full.connections[0].id, []).connections[0].route, undefined);
assert.equal(setConnectionColor(full, full.connections[0].id, '#00ff00').connections[0].color, '#00ff00');
assert.equal(disconnect(full, full.connections[0].id).connections.length, 17);
const round = parseRobotProject(JSON.parse(JSON.stringify(withRoute)), {catalog: catalogShape}); assert.ok(round.ok); assert.deepEqual(round.project, withRoute);
assert.deepEqual(diagnose(round.project).map(x => x.code), diagnose(withRoute).map(x => x.code), 'el diagnóstico es el mismo tras restaurar');
assert.equal(JSON.stringify(solve(round.project).devices.get(unoId)), JSON.stringify(solve(withRoute).devices.get(unoId)));
ok('los cables siguen a sus pines al mover una pieza o el chasis; ruta, color y borrado; serializar → parsear → idéntico y mismo diagnóstico');

// ───── El color no implica validez
{ let q = {...base, connections: base.connections.filter(c => ![c.a, c.b].some(r => r.instanceId === batId))};
  q = wire(q, P(batId, 'B-'), P(drvId, '+12V'), '#d64545'); q = wire(q, P(batId, 'B-'), P(unoId, 'VIN'), '#d64545'); q = wire(q, P(batId, 'B+'), P(drvId, 'GND'), '#222222'); // «rojo» al negativo y «negro» al positivo
  assert.ok(codes(diagnose(q)).includes('battery-reversed'), 'cables con los colores «correctos» pero conectados al revés siguen siendo un error');
  const swapped = {...q, connections: q.connections.map(c => ({...c, color: c.color === '#d64545' ? '#222222' : '#d64545'}))}; assert.deepEqual(codes(diagnose(swapped)), codes(diagnose(q)), 'cambiar los colores no cambia el diagnóstico'); }
ok('el color de un cable nunca cambia el resultado eléctrico');
console.log(`\n${n} bloques OK`);
