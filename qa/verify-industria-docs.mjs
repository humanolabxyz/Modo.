// Documentación técnica y alzado del tablero de Industria (fase 8). Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {buildDocumentation, toMarkdown, bomCsv, wiresCsv, DISCLAIMER} from '../src/industria/docs/generate.ts';
import {buildBoards} from '../src/industria/board/layout.ts';
import {examplePlcStartStop, exampleDirectStart} from '../src/industria/sim/examples.ts';
import {rotateEntity} from '../src/industria/build/commands.ts';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity} from '../src/industria/model/commands.ts';
import {wire} from '../src/industria/wiring/commands.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const p = must(examplePlcStartStop());
const d = buildDocumentation(p, '2026-11-07');

// Lista de materiales: cantidades correctas y estado honesto
const q = Object.fromEntries(d.bom.map(r => [r.definitionId, r.quantity]));
assert.equal(q['pulsador-na'], 2); assert.equal(q['riel'], 2); assert.equal(q['plc-generico'], 1); assert.equal(q['breaker-1p'], 1); assert.equal(d.bom.reduce((s, r) => s + r.quantity, 0), p.entities.length);
assert.ok(d.bom.every(r => r.status === 'Genérico · no verificado')); assert.deepEqual(d.bom.find(r => r.definitionId === 'pulsador-na').labels, ['S1', 'S2']); assert.equal(d.genericCount, p.entities.length);
assert.ok(!JSON.stringify(d.bom).match(/fabricante:|referencia:|part/i)); ok('lista de materiales: cantidades, referencias y estado «genérico» en todas las filas');

// Cables: uno por conexión, numerados, con red y estado
assert.equal(d.wires.length, p.connections.length); assert.deepEqual(d.wires.slice(0, 2).map(w => w.n), ['W001', 'W002']); assert.ok(d.wires.every(w => w.net && w.status === 'Sin verificar'));
const w0 = d.wires[0]; assert.match(w0.from, /^Red 3F\.L1$/); assert.match(w0.to, /^QF1\.1$/); assert.equal(d.wires.find(w => w.from === 'Red 3F.PE').kind, 'Tierra'); ok('lista de cables numerada, con tipo, red y estado «Sin verificar»');

// E/S y programa del PLC
assert.equal(d.io.length, 8); assert.deepEqual(d.io.filter(r => r.tag).map(r => [r.terminal, r.direction, r.tag, r.connectedTo]), [['DI0', 'Entrada', 'START', 'S1.4'], ['DI1', 'Entrada', 'STOP', 'S2.4'], ['DO0', 'Salida', 'MOTOR', 'KM1.A1']]);
assert.equal(d.program.length, 1); assert.equal(d.program[0].lines.length, 1); assert.match(d.program[0].lines[0], /START Y \/STOP Y \/HMI_STOP\s+O\s+HMI_START Y \/STOP Y \/HMI_STOP\s+O\s+MOTOR Y \/STOP Y \/HMI_STOP\s+→\s+\( \) MOTOR\s+\/\/ Marcha con sello/); ok('E/S con su variable y su conexión; el programa se lista en texto');

// Redes y avisos: el ejemplo no tiene errores
assert.ok(d.nets.length >= 8 && d.nets.every(x => x.terminals.length >= 2)); assert.deepEqual(d.issues, []); ok('redes listadas y sin avisos en el ejemplo');
// Con un error: el aviso aparece en el documento
let bad = must(addEntity(newIndustryProject('Con error'), {id: 'f', definitionId: 'fuente-cc', label: 'F1'})); bad = must(wire(bad, {entityId: 'f', terminalId: 'L+'}, {entityId: 'f', terminalId: 'M'}));
const db = buildDocumentation(bad, '2026-11-07'); assert.ok(db.issues.some(i => /positivo y negativo/.test(i))); assert.equal(db.wires[0].status, 'Inválido'); assert.match(db.wires[0].notes, /Cortocircuito/); ok('un cortocircuito aparece como aviso y como nota del cable');

// Exportaciones
const md = toMarkdown(d); assert.match(md, /^# Documentación técnica · Ejemplo · marcha\/paro con PLC/); for (const sec of ['## 1. Lista de materiales', '## 2. Lista de cables', '## 3. Entradas y salidas del PLC', '## 4. Programa del PLC', '## 5. Redes', '## 6. Avisos']) assert.ok(md.includes(sec), sec);
assert.ok(md.includes(DISCLAIMER)); assert.ok(md.includes('| W001 | Red 3F.L1 | QF1.1 |')); assert.match(md, /Sin avisos de topología/);
const csvB = bomCsv(d).split('\r\n'); assert.equal(csvB[0], 'Cantidad,Pieza,Familia,Estado,Referencias'); assert.ok(csvB.some(l => l.startsWith('2,Pulsador NA,') && l.endsWith('S1 S2')));
const csvW = wiresCsv(d).split('\r\n'); assert.equal(csvW.length, p.connections.length + 2); assert.ok(csvW[1].startsWith('W001,Red 3F.L1,QF1.1,Fuerza,'));
const tricky = buildDocumentation(must(addEntity(newIndustryProject('Comillas'), {id: 'x', definitionId: 'fuente-cc', label: 'A,"B"'})), '2026-11-07'); assert.ok(bomCsv(tricky).includes('"A,""B"""')); ok('Markdown y CSV completos, con avisos y con comillas bien escapadas');
// Determinismo y sin efectos
const before = JSON.stringify(p); assert.equal(toMarkdown(buildDocumentation(p, '2026-11-07')), md); assert.equal(JSON.stringify(p), before); ok('la documentación es determinista y no modifica el proyecto');
// Proyecto sin PLC
const dd = buildDocumentation(must(exampleDirectStart()), 'hoy'); assert.equal(dd.io.length, 0); assert.equal(dd.program.length, 0); assert.match(toMarkdown(dd), /No hay PLC en el proyecto/); ok('un proyecto sin PLC se documenta sin secciones vacías engañosas');

// — Alzado del tablero —
const b = buildBoards(p); assert.equal(b.boards.length, 1); const board = b.boards[0]; assert.equal(board.label, 'Placa'); assert.deepEqual([board.w, board.h], [800, 1000]);
assert.equal(board.devices.length, 10); assert.equal(board.devices.filter(x => x.kind === 'rail').length, 2); assert.deepEqual(b.offBoard.map(x => x.label).sort(), ['M1', 'Red 3F']);
for (const dv of board.devices) { assert.ok(dv.x >= 0 && dv.y >= 0 && dv.x + dv.w <= board.w + 0.1 && dv.y + dv.h <= board.h + 0.1, `${dv.label} fuera de la placa`); }
const rails = board.devices.filter(x => x.kind === 'rail'), devs = board.devices.filter(x => x.kind === 'device');
assert.ok(rails[0].y < rails[1].y || rails[0].y > rails[1].y); const km = devs.find(x => x.label === 'KM1'), plcDev = devs.find(x => x.label === 'PLC'), qf1 = devs.find(x => x.label === 'QF1');
assert.ok(km.y < plcDev.y, 'la fila de potencia está arriba y la del PLC debajo'); assert.equal(Math.round(km.w), 45); assert.equal(Math.round(qf1.w), 53);
for (let i = 0; i < devs.length; i++) for (let j = i + 1; j < devs.length; j++) { const a = devs[i], c = devs[j]; assert.ok(a.x + a.w <= c.x + 0.5 || c.x + c.w <= a.x + 0.5 || a.y + a.h <= c.y + 0.5 || c.y + c.h <= a.y + 0.5, `${a.label} y ${c.label} se solapan en el tablero`); }
const a1 = km.terminals.find(t => t.id === 'A1'); assert.equal(a1.wires, 2 - 1 + 0 === 1 ? 1 : a1.wires); assert.equal(plcDev.terminals.find(t => t.id === 'DO0').wires, 1); assert.equal(km.terminals.length, 10); ok('alzado: una placa, 2 rieles y 8 aparatos dentro de la placa, sin solapes y con sus cables contados');
// Girar la placa en 3D no cambia el alzado
const turned = buildBoards(must(rotateEntity(p, 'placa', 90))).boards[0]; for (const dv of board.devices) { const t = turned.devices.find(x => x.id === dv.id); assert.ok(Math.abs(t.x - dv.x) < 1 && Math.abs(t.y - dv.y) < 1 && Math.abs(t.w - dv.w) < 1, `${dv.label}: el alzado cambió al girar la placa`); }
ok('girar la placa en 3D no cambia el alzado');
// Sin placa: todo fuera del tablero
const lonely = buildBoards(must(addEntity(newIndustryProject(), {id: 'k', definitionId: 'contactor-3p', label: 'K'}))); assert.equal(lonely.boards.length, 0); assert.deepEqual(lonely.offBoard.map(x => x.id), ['k']); ok('sin placa, los equipos con terminales se listan fuera del tablero');
console.log(`\n${n} bloques OK`);
