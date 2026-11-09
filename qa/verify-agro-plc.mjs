// Agro, Fase 5: tablero con PLC genérico (escalera de Industria reutilizada), direcciones estilo Delta, HMI y riego automático por humedad.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {ADDRESSES, addBranch, addContact, addRung, addWidget, addressKind, bitOn, checkProgram, exampleProgram, isAddress, readRuntime, removeContact, removeRung, removeWidget, setCoil, toggleContact, validateProgram, writeRuntime, EMPTY_PROGRAM, scanStep} from '../src/agro/plc/program.ts';
import {inWindow, plcInputs, wiredSensor} from '../src/agro/sim/plc.ts';
import {analyzePower} from '../src/agro/sim/power.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {parseWorld, exportWorld} from '../src/agro/model/validate.ts';
import {viewOf} from '../src/agro/sim/soil.ts';
import {timeInfo} from '../src/agro/sim/clock.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const bad = (r, re) => { assert.ok(!r.ok, 'debía fallar'); if (re) assert.match(r.error, re); };
const H = 3600;

/** Mundo de riego con PLC: estanque → tubería → bomba → tubería → aspersor, parcela bajo el aspersor, sonda en la parcela cableada al tablero. */
function plcWorld({seed = 5, example = true, auto = true, wire = true, crop = true} = {}) {
  const s = WorldSession.fromWorld(newWorld('Riego con PLC', {seed}));
  const put = (t, x, z, params) => must(s.place(t, x, z, 0, params ? {params} : {}));
  const tank = put('estanque', -10, -8), p1 = put('tuberia', -10, -3), pump = put('bomba', -10, 2), p2 = put('tuberia', -10, 7), spr = put('emisor', -10, 14), grid = put('acometida', 8, -8), board = put('tablero', 8, -4);
  const link = (a, ap, b, bp) => must(s.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}));
  link(tank, 'salida', p1, 'a'); link(p1, 'b', pump, 'succion'); link(pump, 'descarga', p2, 'a'); link(p2, 'b', spr, 'entrada'); link(grid, 'red', board, 'red'); link(board, 'salida-bomba', pump, 'alim');
  const at = s.entity(spr.id).pose.position, parcel = must(s.place('parcela', at[0], at[2], 0)), probe = must(s.place('sensor-humedad', at[0] - 6, at[2] + 6, 0));
  if (wire) link(probe, 'senal', board, 'entrada-senal');
  must(s.setState(board.id, 'interruptor', true));
  if (example) { must(s.loadExample(board.id)); must(s.setTag(board.id, 'M0', true)); }
  if (auto) must(s.setState(board.id, 'modo', 'auto'));
  if (crop) must(s.plant(parcel.id, 'tomate'));
  return {s, tank: tank.id, pump: pump.id, spr: spr.id, board: board.id, parcel: parcel.id, probe: probe.id};
}
const avail = (s, id) => viewOf(s.entity(id).state).available * 100;
const y0 = (s, id) => bitOn(s.entity(id).state, 'Y0');
const running = (s, pump) => s.analyze().elements[pump].running === true;
/** Avanza `days` días rellenando el estanque cada vez que baja de 3 000 L (fuente de agua ilimitada), y devuelve el recorrido hora por hora. */
function run(w, days, {refill = true, trace = true} = {}) {
  const out = {hours: [], onHours: 0, starts: 0, stops: 0, maxAvail: 0, minAvail: 100};
  let prev = y0(w.s, w.board);
  for (let h = 0; h < days * 24; h++) {
    if (refill && Number(w.s.entity(w.tank).state.nivelL) < 3000) must(w.s.setState(w.tank, 'nivelL', 10000));
    w.s.advance(H);
    const now = y0(w.s, w.board), a = avail(w.s, w.parcel);
    if (now && !prev) out.starts++; if (!now && prev) out.stops++; prev = now;
    if (now) out.onHours++;
    out.maxAvail = Math.max(out.maxAvail, a); out.minAvail = Math.min(out.minAvail, a);
    if (trace) out.hours.push({t: w.s.clock.simSeconds, y0: now, run: running(w.s, w.pump), a, hour: timeInfo(w.s.clock).hour});
  }
  return out;
}

// ── Direcciones y estado guardado ──────────────────────────────────────
{
  assert.equal(ADDRESSES.length, 36); assert.equal(new Set(ADDRESSES).size, 36);
  for (const a of ['X0', 'X3', 'Y0', 'Y3', 'M0', 'M15', 'T0', 'T7', 'C0', 'C3']) assert.ok(isAddress(a), a);
  for (const a of ['X4', 'Y4', 'M16', 'T8', 'C4', 'x0', 'Z1', 'X', '', 'X00', 'tag']) assert.ok(!isAddress(a), a);
  assert.deepEqual(['X1', 'Y2', 'M3', 'T4', 'C1', 'Q1'].map(addressKind), ['input', 'output', 'memory', 'timer', 'counter', null]);
  ok('36 direcciones estilo Delta (X0–X3, Y0–Y3, M0–M15, T0–T7, C0–C3); las que no existen se rechazan');
}
{
  const prog = exampleProgram();
  for (let seed = 1; seed <= 300; seed++) {
    const values = {}; let x = seed * 2654435761 >>> 0;
    for (const a of ADDRESSES) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; if (x & 0x10000) values[a] = true; }
    const rt = {values, scan: {timers: {[prog.rungs[0].id]: 1234, [prog.rungs[2].id]: 99}, counters: {C0: {n: 3, prev: true}, M2: {n: 1, prev: false}}}};
    const state = writeRuntime(prog, rt), back = readRuntime(state, prog);
    assert.deepEqual(back.values, values); assert.deepEqual(back.scan.timers, rt.scan.timers); assert.deepEqual(back.scan.counters, rt.scan.counters);
    for (const a of ADDRESSES) assert.equal(bitOn(state, a), !!values[a]);
  }
  assert.ok(Number.isSafeInteger(writeRuntime(prog, {values: Object.fromEntries(ADDRESSES.map(a => [a, true])), scan: {timers: {}, counters: {}}}).plcBits));
  assert.deepEqual(readRuntime({}, prog), {values: {}, scan: {timers: {}, counters: {}}});
  ok('el estado del PLC (36 bits, temporizadores y contadores) se guarda y se lee sin pérdida en 300 combinaciones; con las 36 variables activas sigue siendo un entero exacto');
}

// ── Edición y validación del programa ──────────────────────────────────
{
  let p = EMPTY_PROGRAM;
  bad(addRung(p, {tag: 'X0'}), /entrada/);
  bad(addRung(p, {tag: 'Q9'}), /dirección válida/);
  bad(addRung(p, {tag: 'Y0'}, [{tag: 'foo'}]), /dirección válida/);
  assert.equal(must(addRung(p, {tag: 'T0', mode: 'ton'}, [{tag: 'X0'}])).rungs[0].coil.preset, 3000, 'un temporizador sin valor usa el de Industria (3 s)');
  p = must(addRung(p, {tag: 'Y0', mode: 'out'}, [{tag: 'X0'}]));
  assert.equal(p.rungs.length, 1); assert.equal(EMPTY_PROGRAM.rungs.length, 0, 'el programa vacío compartido no se muta');
  const id = p.rungs[0].id;
  p = must(addContact(p, id, 0, {tag: 'X2'})); p = must(toggleContact(p, id, 0, 1)); assert.deepEqual(p.rungs[0].branches[0], [{tag: 'X0'}, {tag: 'X2', nc: true}]);
  p = must(addBranch(p, id)); p = must(addContact(p, id, 1, {tag: 'M0'})); assert.equal(p.rungs[0].branches.length, 2);
  p = must(removeContact(p, id, 0, 0)); assert.deepEqual(p.rungs[0].branches[0], [{tag: 'X2', nc: true}]);
  bad(addContact(p, id, 0, {tag: 'W1'}), /dirección válida/);
  bad(setCoil(p, id, {tag: 'X1', mode: 'out'}), /entrada/);
  p = must(setCoil(p, id, {tag: 'T0', mode: 'ton', preset: 5000})); assert.equal(p.rungs[0].coil.preset, 5000);
  bad(setCoil(p, id, {tag: 'T0', mode: 'ton', preset: 0}), /milisegundos/);
  bad(setCoil(p, id, {tag: 'Y1', mode: 'ton', preset: 5}), /temporizador escribe/);
  p = must(setCoil(p, id, {tag: 'C0', mode: 'ctu', preset: 3})); assert.equal(p.rungs[0].coil.mode, 'ctu');
  bad(addRung(p, {tag: 'C0', mode: 'ctu', preset: 0}, []), /cuenta/);
  p = must(removeRung(p, id)); assert.equal(p.rungs.length, 0); bad(removeRung(p, id), /no existe/);
  for (let i = 0; i < 12; i++) p = must(addRung(p, {tag: 'M0'}, [{tag: 'X0'}]));
  bad(addRung(p, {tag: 'M0'}, [{tag: 'X0'}]), /hasta 12 líneas/);
  ok('editar el programa: líneas, contactos, ramas y bobinas; rechaza entradas como bobina, direcciones inventadas, presets fuera de rango y más de 12 líneas; no muta el original');
}
{
  let p = EMPTY_PROGRAM;
  bad(addWidget(p, {kind: 'switch', label: 'Auto', tag: 'Y0'}), /marca M/);
  bad(addWidget(p, {kind: 'lamp', label: 'Piloto', tag: 'Z9'}), /dirección válida/);
  p = must(addWidget(p, {kind: 'switch', label: 'Auto', tag: 'M0'})); p = must(addWidget(p, {kind: 'lamp', label: 'Bomba', tag: 'Y0'})); p = must(addWidget(p, {kind: 'label', label: 'Título'}));
  assert.equal(p.hmi.length, 3); p = must(removeWidget(p, p.hmi[2].id)); assert.equal(p.hmi.length, 2); bad(removeWidget(p, 'zz'), /no existe/);
  for (let i = 0; i < 10; i++) p = must(addWidget(p, {kind: 'lamp', label: `L${i}`, tag: 'X0'}));
  bad(addWidget(p, {kind: 'lamp', label: 'extra', tag: 'X0'}), /hasta 12 widgets/);
  assert.equal(validateProgram(exampleProgram()), null);
  assert.ok(checkProgram({rungs: [], hmi: []}).length === 0);
  assert.ok(checkProgram(must(addRung(EMPTY_PROGRAM, {tag: 'M0'}, []))).some(i => /siempre activa/.test(i.message)));
  assert.ok(checkProgram(must(addRung(EMPTY_PROGRAM, {tag: 'M0'}, [{tag: 'X0'}]))).some(i => /Y0/.test(i.message)));
  ok('pantalla HMI: pilotos, interruptores de marcas M y textos (máx. 12); un interruptor no puede escribir una salida; el ejemplo es válido y los avisos detectan una línea sin contactos y un programa sin Y0');
}

// ── El motor de escalera de Industria es el que escanea ────────────────
{
  const prog = exampleProgram(), pack = {rungs: prog.rungs, memory: []};
  let v = {X0: true, X2: true, M0: true}, st = {timers: {}, counters: {}};
  let r = scanStep(pack, v, st, 0); assert.equal(r.values.Y0, true); assert.equal(r.values.Y1, true);
  r = scanStep(pack, {...r.values, X0: false}, r.state, 0); assert.equal(r.values.Y0, true, 'set mantiene la salida aunque X0 se apague (enclavamiento)');
  r = scanStep(pack, {...r.values, X1: true}, r.state, 0); assert.equal(r.values.Y0, false, 'reset al llegar a suelo húmedo');
  // temporizador: retardo de 10 min
  const ton = must(addRung(EMPTY_PROGRAM, {tag: 'T0', mode: 'ton', preset: 600000}, [{tag: 'X0'}])), ton2 = must(addRung(ton, {tag: 'Y0'}, [{tag: 'T0'}])), pk = {rungs: ton2.rungs, memory: []};
  let q = scanStep(pk, {X0: true}, {timers: {}, counters: {}}, 0); assert.equal(q.values.Y0, false);
  q = scanStep(pk, q.values, q.state, 300000); assert.equal(q.values.Y0, false); q = scanStep(pk, q.values, q.state, 300000); assert.equal(q.values.Y0, true);
  q = scanStep(pk, {...q.values, X0: false}, q.state, 1000); assert.equal(q.values.Y0, false, 'el temporizador se reinicia al perder la condición');
  // contador
  const cnt = must(addRung(EMPTY_PROGRAM, {tag: 'C0', mode: 'ctu', preset: 2}, [{tag: 'X1'}])), pc = {rungs: cnt.rungs, memory: []};
  let c = scanStep(pc, {X1: true}, {timers: {}, counters: {}}, 0); c = scanStep(pc, {...c.values, X1: false}, c.state, 0); c = scanStep(pc, {...c.values, X1: true}, c.state, 0);
  assert.equal(c.values.C0, true); assert.equal(c.state.counters.C0.n, 2);
  ok('el escaneo es el de Industria: set/reset enclavan, el temporizador de 10 min cumple a los 600 s y se reinicia, el contador cuenta flancos');
}

// ── Entradas del PLC: sonda, umbrales y franja horaria ─────────────────
{
  assert.ok(inWindow(10, 6, 20)); assert.ok(!inWindow(20, 6, 20)); assert.ok(inWindow(6, 6, 20));
  assert.ok(inWindow(23, 20, 6)); assert.ok(inWindow(3, 20, 6)); assert.ok(!inWindow(12, 20, 6)); assert.ok(inWindow(0, 0, 24)); assert.ok(inWindow(23.99, 0, 24)); assert.ok(!inWindow(5, 8, 8));
  const w = plcWorld({}), b = () => w.s.entity(w.board);
  assert.equal(wiredSensor(w.s.entities, w.s.connections, b())?.id, w.probe);
  let i = plcInputs(w.s.entities, w.s.connections, b(), 12); assert.equal(i.availablePct !== null, true);
  const a = avail(w.s, w.parcel); assert.deepEqual(i.x, [a < 50, a > 85, true, false]);
  must(w.s.setParam(w.board, 'secoPct', Math.ceil(a) + 1)); i = plcInputs(w.s.entities, w.s.connections, b(), 12); assert.equal(i.x[0], true, 'X0 con el umbral por encima de la lectura');
  must(w.s.setParam(w.board, 'humedoPct', Math.floor(a) - 1)); i = plcInputs(w.s.entities, w.s.connections, b(), 12); assert.equal(i.x[1], true, 'X1 con el umbral por debajo de la lectura');
  bad(w.s.setParam(w.board, 'secoPct', 120), /.+/);
  const none = plcWorld({wire: false}); i = plcInputs(none.s.entities, none.s.connections, none.s.entity(none.board), 12); assert.deepEqual([i.x[0], i.x[1], i.sensor, i.availablePct], [false, false, null, null]);
  ok('entradas: X0/X1 comparan el agua útil de la sonda con los umbrales, X2 es la franja horaria (también cruzando la medianoche), X3 está reservada; sin cable de la sonda no hay entradas');
}

// ── Potencia: manual no cambia; automático depende de Y0 ───────────────
{
  const w = plcWorld({example: false, auto: false, crop: false});
  must(w.s.setState(w.tank, 'nivelL', 8000));
  assert.equal(running(w.s, w.pump), true, 'manual: el interruptor basta (comportamiento de las fases 3 y 4)');
  must(w.s.setState(w.board, 'modo', 'auto'));
  assert.equal(running(w.s, w.pump), false); assert.match(w.s.analyze().elements[w.pump].reason ?? '', /PLC.*Y0/, 'automático sin programa: el PLC mantiene la bomba detenida');
  assert.ok(w.s.alerts().some(a => /no tiene programa/.test(a.text)));
  must(w.s.setState(w.board, 'modo', 'manual')); assert.equal(running(w.s, w.pump), true);
  assert.deepEqual(analyzePower(w.s.entities, w.s.connections).energized[w.pump], true);
  bad(w.s.setState(w.board, 'modo', 'turbo'), /manual.*auto/); bad(w.s.setState(w.board, 'plcBits', 1), /simulación/);
  ok('modo manual: el interruptor general energiza la bomba como antes; automático sin programa la deja detenida con el motivo «el PLC mantiene la bomba detenida» y avisa; modo y estado interno validados');
}

// ── Riego automático en lazo cerrado ───────────────────────────────────
{
  const w = plcWorld({}), tr = run(w, 40);
  assert.ok(tr.starts >= 2 && tr.stops >= 2, `arranques ${tr.starts}, paradas ${tr.stops}`);
  assert.ok(tr.maxAvail <= 85 + 6, `el agua útil no se pasa del umbral húmedo: ${tr.maxAvail.toFixed(1)}`);
  assert.ok(tr.minAvail >= 50 - 8, `el agua útil no baja mucho del umbral seco: ${tr.minAvail.toFixed(1)}`);
  assert.ok(tr.onHours > 0 && tr.onHours < 40 * 24 * 0.5, `la bomba trabaja solo una parte del tiempo: ${tr.onHours} h de ${40 * 24}`);
  assert.ok(viewOf(w.s.entity(w.parcel).state).alive, 'el cultivo sobrevive sin atención');
  assert.ok(Number(w.s.entity(w.parcel).state.riegoMm) > 20, 'se aplicó riego');
  for (const h of tr.hours) if (h.run) assert.ok(h.y0, 'la bomba solo corre con Y0 activa');
  assert.ok(w.s.events.some(e => /arrancó la bomba/.test(e.text)) && w.s.events.some(e => /detuvo la bomba/.test(e.text)));
  ok(`riego automático en 40 días: ${tr.starts} arranques y ${tr.stops} paradas, la bomba trabaja ${tr.onHours} h, el agua útil se mantiene entre ${tr.minAvail.toFixed(0)} y ${tr.maxAvail.toFixed(0)} % y el tomate sobrevive; el registro anota cada arranque y parada`);

  const dry = plcWorld({}); must(dry.s.setTag(dry.board, 'M0', false)); const t2 = run(dry, 40);
  assert.equal(t2.onHours, 0); assert.equal(Number(dry.s.entity(dry.parcel).state.riegoMm), 0);
  ok('con el interruptor de la pantalla «Riego automático» apagado (M0) el PLC no riega nunca: el cultivo queda a merced del clima');

  const manual = plcWorld({example: false, auto: false}); const t3 = run(manual, 10, {trace: false});
  assert.ok(Number(manual.s.entity(manual.parcel).state.riegoMm) > Number(w.s.entity(w.parcel).state.riegoMm) / 4);
  ok('manual (sin PLC): el riego continuo sigue funcionando como en la Fase 4');
}
{
  const a = plcWorld({}), b = plcWorld({});
  a.s.advance(30 * 24 * H); for (let i = 0; i < 30 * 24; i++) b.s.advance(H);
  for (const id of [a.parcel, a.board, a.tank]) { const ea = a.s.entity(id), eb = b.s.entity(id === a.parcel ? b.parcel : id === a.board ? b.board : b.tank); assert.deepEqual(ea.state, eb.state, id); }
  assert.equal(a.s.clock.simSeconds, b.s.clock.simSeconds);
  ok('avanzar 30 días de una vez o en 720 tramos de 1 h da exactamente el mismo estado (suelo, tablero y estanque)');
}

// ── Franja horaria ─────────────────────────────────────────────────────
{
  const w = plcWorld({}); must(w.s.setParam(w.board, 'horaIniH', 22)); must(w.s.setParam(w.board, 'horaFinH', 6));
  const tr = run(w, 40);
  assert.ok(tr.starts >= 1, 'riega de noche');
  for (const h of tr.hours) if (h.run) assert.ok(h.hour >= 22 || h.hour <= 7, `bomba en marcha fuera de la franja (hora ${h.hour})`);
  ok('con franja de riego 22–6 h la bomba solo corre de noche (el cruce de medianoche funciona)');
}

// ── Sin cable de la sonda, sin energía, HMI ────────────────────────────
{
  const w = plcWorld({wire: false}); const tr = run(w, 20, {trace: false});
  assert.equal(tr.onHours, 0); assert.ok(w.s.alerts().some(a => /no recibe señal de ninguna sonda/.test(a.text)));
  const cable = plcWorld({wire: false}); must(cable.s.connectPorts({entityId: cable.probe, portId: 'senal'}, {entityId: cable.board, portId: 'entrada-senal'}));
  assert.ok(!cable.s.alerts().some(a => /no recibe señal/.test(a.text)));
  ok('sin cable de la sonda el PLC no ve «suelo seco», la bomba no arranca y se avisa; al cablear la sonda el aviso desaparece');
}
{
  const w = plcWorld({}); run(w, 30, {trace: false});
  assert.equal(bitOn(w.s.entity(w.board).state, 'M0'), true);
  must(w.s.setState(w.board, 'interruptor', false));
  const st = w.s.entity(w.board).state; assert.equal(bitOn(st, 'Y0'), false); assert.equal(bitOn(st, 'M0'), true, 'las marcas M se conservan sin energía');
  assert.equal(running(w.s, w.pump), false);
  must(w.s.setState(w.board, 'interruptor', true));
  ok('al apagar el interruptor general el PLC pierde la energía: se apagan las salidas y se conservan las marcas M');
}
{
  const w = plcWorld({}); bad(w.s.setTag(w.board, 'Y0', true), /marcas internas/); bad(w.s.setTag(w.board, 'X0', true), /marcas internas/);
  const none = plcWorld({example: false, auto: false}); bad(none.s.setTag(none.board, 'M0', true), /no tiene programa/);
  const before = w.s.version; must(w.s.setTag(w.board, 'M3', true)); assert.ok(w.s.version > before); assert.equal(bitOn(w.s.entity(w.board).state, 'M3'), true);
  assert.equal(w.s.undoLabel?.startsWith('Programar') || w.s.undoLabel?.startsWith('Cambiar'), true, 'escribir una marca desde la pantalla no entra en el historial');
  ok('HMI: desde la pantalla solo se escriben marcas M; escribir una marca no entra en el historial de deshacer');
}

// ── Deshacer, guardar y abrir ──────────────────────────────────────────
{
  const w = plcWorld({}); run(w, 5, {trace: false});
  const t = w.s.clock.simSeconds, prog = w.s.program(w.board);
  must(w.s.clearProgram(w.board)); assert.equal(w.s.program(w.board).rungs.length, 0); assert.equal(w.s.toWorld().plc, undefined, 'sin programas no se escribe el campo plc');
  assert.equal(bitOn(w.s.entity(w.board).state, 'M0'), false, 'quitar el programa reinicia el PLC');
  assert.ok(w.s.undo()); assert.deepEqual(w.s.program(w.board), prog); assert.equal(w.s.clock.simSeconds, t, 'deshacer no deshace el tiempo');
  for (const a of ['M0', 'Y0', 'Y1']) assert.equal(bitOn(w.s.entity(w.board).state, a), false, `${a}: el programa restituido parte de cero (solo las entradas X se recalculan)`);
  assert.equal(w.s.entity(w.board).state.plcAcc, '');
  assert.ok(w.s.redo()); assert.equal(w.s.program(w.board).rungs.length, 0);
  assert.ok(w.s.undo());
  must(w.s.editProgram(w.board, p => addRung(p, {tag: 'Y1'}, [{tag: 'X0'}]))); assert.equal(w.s.program(w.board).rungs.length, prog.rungs.length + 1);
  assert.ok(w.s.undo()); assert.equal(w.s.program(w.board).rungs.length, prog.rungs.length);
  ok('programar entra en el historial y se deshace/rehace; el tiempo no se deshace; un programa nuevo o restituido parte de cero');
}
{
  const w = plcWorld({}); run(w, 12, {trace: false});
  const doc = w.s.toWorld(), text = exportWorld(doc).text, back = must(parseWorld(JSON.parse(text)));
  assert.deepEqual(back.plc, doc.plc); assert.deepEqual(back.entities, doc.entities);
  const s2 = WorldSession.fromWorld(back);
  assert.equal(s2.entity(w.board).state.plcBits, w.s.entity(w.board).state.plcBits); assert.deepEqual(s2.program(w.board), w.s.program(w.board));
  assert.equal(s2.clock.speed, 0, 'se abre en pausa');
  // y sigue igual de ahí en adelante
  const a = w.s, b = s2; a.advance(10 * 24 * H); b.advance(10 * 24 * H);
  assert.deepEqual(a.entity(w.parcel).state, b.entity(w.parcel).state); assert.deepEqual(a.entity(w.board).state, b.entity(w.board).state);
  ok('guardar y reabrir conserva el programa, las marcas y los temporizadores: ambos mundos evolucionan idénticos durante 10 días');
}
{
  const plain = newWorld('Sin PLC', {seed: 2}); assert.equal('plc' in plain, false);
  const s = WorldSession.fromWorld(plain); must(s.place('tablero', 0, 0, 0)); assert.equal('plc' in s.toWorld(), false, 'un mundo sin PLC se escribe igual que en la Fase 4');
  // mundo de la Fase 4: tablero sin umbrales ni estado del PLC
  const old = JSON.parse(exportWorld(s.toWorld()).text), e = old.entities[0]; for (const k of ['secoPct', 'humedoPct', 'horaIniH', 'horaFinH']) delete e.params[k]; for (const k of ['modo', 'plcBits', 'plcAcc', 'plcCnt']) delete e.state[k];
  const s2 = WorldSession.fromWorld(must(parseWorld(old))); const t = s2.entities[0];
  assert.equal(t.params.secoPct, 50); assert.equal(t.params.humedoPct, 85); assert.equal(t.params.horaFinH, 24);
  must(s2.setState(t.id, 'modo', 'auto')); must(s2.setState(t.id, 'interruptor', true));
  ok('un mundo de la Fase 4 se abre sin cambios: sin campo plc, y su tablero recibe umbrales y franja por defecto');
}
{
  const w = plcWorld({}), good = JSON.parse(exportWorld(w.s.toWorld()).text);
  const mut = f => { const d = JSON.parse(JSON.stringify(good)); f(d); return parseWorld(d); };
  bad(mut(d => { d.plc[w.pump] = d.plc[w.board]; }), /no es un tablero/);
  bad(mut(d => { d.plc[w.board].rungs[0].coil.tag = 'X0'; }), /entrada/);
  bad(mut(d => { d.plc[w.board].rungs[0].branches[0][0].tag = 'ZZ'; }), /dirección válida/);
  bad(mut(d => { d.plc[w.board].rungs[0].coil.mode = 'rm -rf'; }), /bobina|modo/i);
  bad(mut(d => { d.plc[w.board].rungs[0].coil.mode = 'ton'; d.plc[w.board].rungs[0].coil.tag = 'T0'; delete d.plc[w.board].rungs[0].coil.preset; }), /milisegundos/);
  bad(mut(d => { d.plc[w.board].rungs = Array.from({length: 13}, (_, i) => ({...d.plc[w.board].rungs[0], id: `r${i}`})); }), /hasta 12/);
  bad(mut(d => { d.plc[w.board].rungs[1].id = d.plc[w.board].rungs[0].id; }), /repetido/);
  bad(mut(d => { d.plc[w.board].hmi[0].tag = 'Y0'; }), /marca M/);
  bad(mut(d => { d.plc[w.board].hmi = 'x'; }), /formato/);
  bad(mut(d => { d.plc = [1]; }), /no son válidos/);
  bad(mut(d => { d.plc[w.board].rungs[0].branches = [null]; }), /mal formados/);
  const clean = must(mut(d => { d.plc[w.board].extra = 'x'; d.plc[w.board].rungs[0].extra = 1; d.plc[w.board].hmi[0].evil = '<script>'; }));
  assert.equal('extra' in clean.plc[w.board], false); assert.equal('extra' in clean.plc[w.board].rungs[0], false); assert.equal('evil' in clean.plc[w.board].hmi[0], false);
  ok('archivo dañado: programa de una pieza que no es tablero, bobina sobre una entrada, direcciones y modos inventados, preset ausente, más de 12 líneas, ids repetidos, interruptor sobre una salida y formas rotas se rechazan; los campos desconocidos se descartan');
}
{
  const w = plcWorld({}); assert.ok(w.s.program(w.board).rungs.length > 0);
  const r = w.s.remove(w.board, {confirm: true}); assert.ok(r.ok); assert.equal(w.s.toWorld().plc, undefined, 'el programa muere con su tablero');
  assert.ok(w.s.undo()); assert.ok(w.s.program(w.board).rungs.length > 0, 'deshacer devuelve el tablero con su programa');
  ok('eliminar el tablero elimina su programa; deshacer lo devuelve junto con el tablero');
}
{
  const a = plcWorld({}), b = plcWorld({});
  const t0 = performance.now(); a.s.advance(365 * 24 * H); const dt = performance.now() - t0;
  assert.ok(dt < 4000, `un año con PLC tardó ${dt.toFixed(0)} ms`);
  assert.ok(viewOf(a.s.entity(a.parcel).state).crop !== null);
  ok(`rendimiento: un año simulado con PLC en automático en ${dt.toFixed(0)} ms`);
}

console.log(`\n${n} bloques de verificación de Agro (PLC, HMI y riego automático) en verde.`);
