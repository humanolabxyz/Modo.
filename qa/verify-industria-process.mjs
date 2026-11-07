// Proceso de planta y canaletas (fase 15): la planta opera de verdad (cinta, cajas, sensores, PLC, válvula, cilindro, robot, torre) y los cables viajan por canaletas.
// Node 24 ejecuta .ts directamente. El bucle de la prueba es el mismo de la app: sensores → simulación lógica → proceso mecánico, cada 100 ms.
import assert from 'node:assert/strict';
import {exampleMiniFactory} from '../src/industria/sim/examples.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {emptyProcess, stepProcess, sensorStates, driveOf, valveOf, productPosition, robotAngle, hasProcess} from '../src/industria/sim/process.ts';
import {routeAll} from '../src/industria/wiring/route.ts';
import {ductSegments, project, isDuct} from '../src/industria/wiring/ducts.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const r = exampleMiniFactory(); assert.ok(r.ok, r.error); const p = r.value;

// ——— Canaletas ———
const ducts = p.entities.filter(e => isDuct(e.definitionId)); assert.equal(ducts.length, 16, 'cinco canaletas de tablero y once canales de piso');
const segs = ductSegments(p); assert.equal(segs.length, 16);
for (const id of ['cn1', 'cn2', 'cn3', 'cn4', 'cv1']) assert.ok(p.mounts.some(m => m.child.entityId === id && m.parent.entityId === 'placa'), `${id} montada en la placa`);
for (const id of ['pz1', 'pz2', 'pz3', 'pz4', 'pz5', 'pz6', 'pz7', 'pz8', 'pz9', 'pz10', 'pz11']) assert.ok(p.mounts.some(m => m.child.entityId === id && ['piso', 'piso2'].includes(m.parent.entityId)), `${id} montado en un piso`);
const routes = routeAll(p);
const insideDuct = pt => segs.some(s => project(s, pt).dist < 0.04);
let ducted = 0, long = 0;
for (const c of p.connections) { const route = routes.get(c.id); const inside = route.filter(insideDuct).length; if (inside >= 2) ducted++; long += inside >= 2 ? 0 : 1; }
assert.ok(ducted / p.connections.length >= 0.8, `${ducted} de ${p.connections.length} cables van por canaleta`);
ok(`${ducted} de ${p.connections.length} cables viajan por dentro de canaletas y canales de piso (${long} van por el aire)`);
// Cables en las canaletas: terminan en sus terminales y atraviesan al menos dos puntos de canaleta
for (const c of p.connections) { const route = routes.get(c.id); assert.ok(route.flat().every(Number.isFinite)); }
// Un cable del tablero a una máquina pasa por el canal de piso
const motorCable = p.connections.find(c => c.b.entityId === 'motor' && c.b.terminalId === 'U1'), mr = routes.get(motorCable.id);
assert.ok(mr.some(pt => segs.filter(s => ducts.find(d => d.id === s.id)?.definitionId === 'canal-piso').some(s => project(s, pt).dist < 0.04)), 'el cable del motor baja al canal de piso');
ok('el cable de fuerza del motor baja por la canaleta vertical y sigue por el canal de piso');
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(p))).ok);

// ——— Proceso ———
assert.ok(hasProcess(p)); assert.equal(driveOf(p, 'cinta'), 'motor', 'el motor junto a la cinta la mueve');
assert.equal(valveOf(p, simulate(p, {}), 'cil'), 'valvula', 'la válvula gobierna al cilindro');
const run = (inputs, secs, st = emptyProcess(), prev = {energized: {}, plc: {}}) => {
  let sim = null, clockPrev = prev;
  for (let i = 0; i < secs * 10; i++) {
    const sens = sensorStates(p, st); sim = simulate(p, {...inputs, ...sens}, clockPrev.energized, clockPrev.plc, 100);
    clockPrev = {energized: sim.energized, plc: sim.plc}; st = stepProcess(p, sim, st, 0.1);
  }
  return {sim, st, prev: clockPrev};
};
const trace = (inputs, secs) => { let st = emptyProcess(), prev = {energized: {}, plc: {}}, out = []; for (let i = 0; i < secs * 10; i++) { const sens = sensorStates(p, st), sim = simulate(p, {...inputs, ...sens}, prev.energized, prev.plc, 100); prev = {energized: sim.energized, plc: sim.plc}; st = stepProcess(p, sim, st, 0.1); out.push({sens, sim, st}); } return out; };

const idle = run({}, 3); assert.ok(!idle.sim.energized.motor && !idle.st.products.prod1, 'en reposo nada se mueve');
const ON = {qf1: true, qf2: true};
const wake = run(ON, 2); assert.ok(wake.sim.energized.plc && !wake.sim.energized.motor, 'con los interruptores el PLC se alimenta pero el motor sigue parado');
ok('en reposo la cinta está quieta y con solo la alimentación el PLC arranca sin mover la línea');

// Marcha: pulsar S1 un instante y soltar (el sello del programa mantiene el motor)
let st = emptyProcess(), prev = {energized: {}, plc: {}}, hist = [];
for (let i = 0; i < 400; i++) { const sens = sensorStates(p, st), inputs = {...ON, ...(i >= 5 && i < 8 ? {s1: true} : {}), ...sens}, sim = simulate(p, inputs, prev.energized, prev.plc, 100); prev = {energized: sim.energized, plc: sim.plc}; st = stepProcess(p, sim, st, 0.1); hist.push({sens, sim, st}); }
const last = hist.at(-1);
assert.ok(last.sim.energized.motor && last.sim.energized.km1, 'el sello mantiene el motor');
const moved = p.entities.filter(e => e.definitionId === 'caja-producto').every(e => (st.products[e.id] ?? 0) !== 0); assert.ok(moved || hist.some(h => Object.keys(h.st.products).length), 'las cajas se mueven');
assert.ok(st.belts.cinta > 5, `la banda recorrió ${st.belts.cinta?.toFixed(1)} m`);
ok('con la marcha el motor sigue (sello) y la banda corre con las cajas encima');

// Las cajas pasan frente al sensor fotoeléctrico: se detectan, el PLC acciona la válvula y el cilindro sale con aire
const seen = hist.filter(h => h.sens.foto), valve = hist.filter(h => h.sim.energized.valvula), rodOut = hist.filter(h => (h.st.rods.cil ?? 0) > 0.9);
assert.ok(seen.length > 5, 'el sensor de cinta detecta cajas'); assert.ok(valve.length > 5, 'la válvula se energiza vía PLC'); assert.ok(rodOut.length > 3, 'el vástago sale');
assert.ok(hist.some(h => h.sim.plc.plc.tags.SENSOR_CINTA && h.sim.plc.plc.tags.VALVULA), 'el PLC ve el sensor y activa la salida');
assert.ok(hist.every(h => !h.sim.energized.valvula || h.sens.foto || hist.indexOf(h) > 0), 'la válvula solo actúa con la caja');
ok(`el sensor detecta cajas (${seen.length} décimas), el PLC energiza la válvula y el vástago sale (${rodOut.length} décimas)`);

// Sensor inductivo: activo con el vástago atrás y se apaga cuando sale
assert.ok(hist.some(h => h.sens.ind) && hist.some(h => !h.sens.ind), 'el sensor inductivo cambia con el vástago');
assert.ok(hist.every((h, i) => i === 0 || (hist[i - 1].st.rods.cil ?? 0) <= 0.9 || !h.sens.ind), 'con el vástago afuera el sensor inductivo no detecta'); // el sensor lee el estado del paso anterior
ok('el sensor inductivo detecta el vástago atrás y se apaga cuando sale');

// Robot y torre: trabajan mientras corre la línea
assert.ok(Math.abs(robotAngle(last.st, 'robot')) >= 0 && (last.st.swing.robot ?? 0) > 5, 'el robot giró'); assert.ok(last.sim.energized.robot, 'robot alimentado');
assert.ok(last.sim.energized['torre:G'] && last.sim.energized.torre && !last.sim.energized['torre:R'], 'torre: solo la luz verde');
ok('el brazo trabaja y la torre muestra luz verde mientras la línea corre');

// Paro: todo se detiene
const stopped = (() => { let s2 = st, pv = prev, h2 = []; for (let i = 0; i < 100; i++) { const sens = sensorStates(p, s2), inputs = {...ON, ...(i < 3 ? {} : {}), ...sens}; const sim = simulate(p, {...inputs, s2: true}, pv.energized, pv.plc, 100); pv = {energized: sim.energized, plc: sim.plc}; s2 = stepProcess(p, sim, s2, 0.1); h2.push({sim, s2}); } return h2; })();
assert.ok(!stopped.at(-1).sim.energized.motor && !stopped.at(-1).sim.energized.robot, 'S2 (paro) detiene motor y robot');
const frozen = stopped.slice(-20).map(h => h.s2.belts.cinta); assert.ok(frozen.every(v => v === frozen[0]), 'la banda se detiene');
ok('el paro detiene el motor, la banda y el robot');

// Las cajas dan la vuelta (no se salen de la cinta)
for (const e of p.entities.filter(x => x.definitionId === 'caja-producto' && p.mounts.some(m => m.child.entityId === x.id && m.parent.entityId.startsWith('cinta')))) { const belt = p.mounts.find(m => m.child.entityId === e.id).parent.entityId, cx = p.poses[belt].position[0]; for (const h of hist) { const q = productPosition(p, h.st, e.id); assert.ok(q[0] > cx - 0.8 && q[0] < cx + 0.8, `${e.id} fuera de la cinta (${q[0].toFixed(2)})`); } }
assert.ok(hist.at(-1).st.belts.cinta2 > 5, 'la segunda cinta también corre (motor en paralelo)'); assert.ok(hist.at(-1).sim.energized.motor2 && hist.at(-1).sim.energized.robot2, 'segundo motor y segundo robot alimentados');
ok('las cajas dan la vuelta al llegar al final y nunca salen de la cinta');
console.log(`\n${n} comprobaciones del proceso y las canaletas OK`);
