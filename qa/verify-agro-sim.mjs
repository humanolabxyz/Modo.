// Agro, Fase 4: reloj, clima determinista, balance hídrico del suelo, cultivo (etapas, estrés, muerte, cosecha), vaciado del estanque y riego.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {DAY, rand, timeInfo, secondsToMidnight} from '../src/agro/sim/clock.ts';
import {dayWeather, etFractionBy, rainFractionBy} from '../src/agro/sim/climate.ts';
import {TOMATE, kcAt, stageAt, gddOfDay} from '../src/agro/sim/crops.ts';
import {SOILS, boundsOf, ksOf, stepParcel, viewOf, plant, harvest, clearCrop, PARCEL_STATE, ROOT_DEPTH_MM, DEATH_DAYS} from '../src/agro/sim/soil.ts';
import {coverageShare, irrigationByParcel} from '../src/agro/sim/irrigation.ts';
import {alertsOf, sensorReading} from '../src/agro/sim/alerts.ts';
import {deadVolumeL, stepWorld} from '../src/agro/sim/step.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {parseWorld, parseWorldText, exportWorld} from '../src/agro/model/validate.ts';
import {SIM_SPEEDS} from '../src/agro/model/types.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const START = '2026-09-21T08:00:00.000Z';

/** Estanque → tubería → bomba → tubería → aspersor, con acometida y tablero; la parcela se coloca bajo el aspersor ya acoplado. */
function irrigationWorld({seed = 7, soil = 'franco', level = 6000, radio, caudal} = {}) {
  const s = WorldSession.fromWorld(newWorld('Riego', {seed}));
  const put = (t, x, z, params) => must(s.place(t, x, z, 0, params ? {params} : {}));
  const tank = put('estanque', -10, -8), p1 = put('tuberia', -10, -3), pump = put('bomba', -10, 2), p2 = put('tuberia', -10, 7);
  const spr = put('emisor', -10, 14, {...(radio ? {radioM: radio} : {}), ...(caudal ? {caudalNominalLmin: caudal} : {})}), grid = put('acometida', 8, -8), board = put('tablero', 8, -4);
  const link = (a, ap, b, bp) => must(s.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}));
  link(tank, 'salida', p1, 'a'); link(p1, 'b', pump, 'succion'); link(pump, 'descarga', p2, 'a'); link(p2, 'b', spr, 'entrada'); link(grid, 'red', board, 'red'); link(board, 'salida-bomba', pump, 'alim');
  must(s.setState(board.id, 'interruptor', true));
  const at = s.entity(spr.id).pose.position, parcel = must(s.place('parcela', at[0], at[2], 0));
  must(s.setState(parcel.id, 'suelo', soil)); must(s.setState(tank.id, 'nivelL', level));
  return {s, tank: tank.id, pump: pump.id, spr: spr.id, board: board.id, parcel: parcel.id, area: 600};
}
const state = (s, id) => s.entity(id).state;

// ── Reloj y fechas ─────────────────────────────────────────────────────
{
  const c = {simSeconds: 0, startDate: START}, t = timeInfo(c);
  assert.deepEqual([t.dayIndex, t.dateLabel, t.timeLabel, t.doy], [0, '21 sep 2026', '08:00', 264]);
  const t2 = timeInfo({...c, simSeconds: 16 * 3600}); assert.deepEqual([t2.dayIndex, t2.dateLabel, t2.timeLabel], [1, '22 sep 2026', '00:00']);
  assert.equal(timeInfo({...c, simSeconds: 101 * DAY}).dateLabel, '31 dic 2026'); assert.equal(timeInfo({...c, simSeconds: 101 * DAY}).doy, 365);
  assert.equal(timeInfo({...c, simSeconds: 102 * DAY}).dateLabel, '1 ene 2027'); assert.equal(timeInfo({...c, simSeconds: 102 * DAY}).doy, 1); assert.equal(timeInfo({startDate: '2028-02-28T00:00:00Z', simSeconds: 2 * DAY}).dateLabel, '1 mar 2028');  // bisiesto: existe el 29 de febrero
  assert.equal(timeInfo({startDate: '2028-02-28T00:00:00Z', simSeconds: DAY}).dateLabel, '29 feb 2028');
  assert.equal(secondsToMidnight(c), 16 * 3600); assert.equal(secondsToMidnight({...c, simSeconds: 16 * 3600}), DAY);
  ok('reloj: fecha y hora locales, día del año, cambio de año y 29 de febrero, segundos hasta la medianoche');
}
{
  for (const sp of [0, 1, 5, 20, 100, 3600, 86400]) assert.ok(SIM_SPEEDS.includes(sp));
  const w = newWorld('V', {seed: 1}); for (const sp of [3600, 86400]) { w.clock.speed = sp; assert.ok(parseWorld(w).ok, `velocidad ${sp}`); }
  w.clock.speed = 7; assert.ok(!parseWorld(w).ok); ok('las velocidades 1 h/s y 1 día/s son válidas en el archivo; una velocidad inventada se rechaza');
}

// ── Aleatorio y clima deterministas ────────────────────────────────────
{
  let sum = 0, min = 1, max = 0; for (let i = 0; i < 20000; i++) { const v = rand(42, 3, i); sum += v; min = Math.min(min, v); max = Math.max(max, v); }
  assert.ok(Math.abs(sum / 20000 - 0.5) < 0.01 && min >= 0 && max < 1, `media ${sum / 20000}`);
  assert.equal(rand(5, 1, 99), rand(5, 1, 99)); assert.notEqual(rand(5, 1, 99), rand(6, 1, 99)); assert.notEqual(rand(5, 1, 99), rand(5, 2, 99)); assert.notEqual(rand(5, 1, 99), rand(5, 1, 100));
  ok('aleatorio con semilla: uniforme en [0, 1), mismo resultado para la misma (semilla, canal, contador) y distinto si cambia cualquiera');
}
{
  const year = (seed) => Array.from({length: 365}, (_, d) => dayWeather(seed, d, ((d + 263) % 365) + 1));
  const a = year(11), b = year(11), c = year(12); assert.deepEqual(a, b); assert.notDeepEqual(a, c);
  assert.deepEqual(dayWeather(11, 200, 100), dayWeather(11, 200, 100));
  for (const w of a) { assert.ok(w.et0Mm > 0.5 && w.et0Mm < 9 && w.rainMm >= 0 && w.rainMm <= 12.001 && w.tMaxC > w.tMinC); }
  const avg = (arr, f) => arr.reduce((x, w) => x + f(w), 0) / arr.length;
  const summer = a.filter((_, d) => { const doy = ((d + 263) % 365) + 1; return doy > 350 || doy < 45; }), winter = a.filter((_, d) => { const doy = ((d + 263) % 365) + 1; return doy > 170 && doy < 230; });
  assert.ok(avg(summer, w => w.et0Mm) > avg(winter, w => w.et0Mm) + 2.5 && avg(summer, w => w.tMeanC) > avg(winter, w => w.tMeanC) + 10);
  const rainy = a.filter(w => w.rainMm > 0).length; assert.ok(rainy >= 3 && rainy <= 45, `${rainy} días de lluvia`);
  ok(`clima: mismo (semilla, día) → mismo día; otra semilla → otro año; verano con más ET₀ (${avg(summer, w => w.et0Mm).toFixed(1)} vs ${avg(winter, w => w.et0Mm).toFixed(1)} mm) y más calor; ${rainy} días de lluvia al año`);
}
{
  for (const f of [etFractionBy, rainFractionBy]) { let prev = -1; for (let h = 0; h <= 24; h += 0.25) { const v = f(h); assert.ok(v >= prev && v >= 0 && v <= 1); prev = v; } assert.equal(f(0), 0); assert.equal(f(24), 1); }
  // sumar por tramos cualquiera da el total del día
  const cuts = [0, 3.3, 7.9, 12, 12.01, 17.5, 24]; let et = 0, rain = 0; for (let i = 1; i < cuts.length; i++) { et += etFractionBy(cuts[i]) - etFractionBy(cuts[i - 1]); rain += rainFractionBy(cuts[i]) - rainFractionBy(cuts[i - 1]); }
  assert.ok(near(et, 1) && near(rain, 1)); assert.equal(etFractionBy(5), 0); assert.ok(near(etFractionBy(12), 0.5));
  ok('reparto horario: la evapotranspiración (6–18 h) y la lluvia (14–17 h) suman exactamente el total del día para cualquier partición');
}

// ── Cultivo ────────────────────────────────────────────────────────────
{
  assert.equal(stageAt(TOMATE, 0).id, 'establecimiento'); assert.equal(stageAt(TOMATE, 300).id, 'vegetativo'); assert.equal(stageAt(TOMATE, 600).id, 'floracion'); assert.equal(stageAt(TOMATE, 900).id, 'fructificacion'); assert.equal(stageAt(TOMATE, 1100).id, 'madurez'); assert.equal(stageAt(TOMATE, 5000).id, 'madurez');
  assert.equal(kcAt(TOMATE, 0), 0.5); assert.equal(kcAt(TOMATE, 480), 1.15); assert.ok(near(kcAt(TOMATE, 330), 0.875)); assert.equal(kcAt(TOMATE, 1100), 0.8); assert.equal(kcAt(TOMATE, 9999), 0.8);
  assert.equal(gddOfDay(TOMATE, 5), 0); assert.equal(gddOfDay(TOMATE, 20), 10); assert.equal(gddOfDay(TOMATE, 40), 20);
  for (let i = 1; i < TOMATE.stages.length; i++) assert.equal(TOMATE.stages[i].from, TOMATE.stages[i - 1].to);
  ok('tomate: etapas contiguas por grados-día, Kc interpolado (0,5 → 1,15 → 0,8), tiempo térmico con base 10 °C y tope 30 °C');
}
{
  for (const soil of SOILS) { const b = boundsOf(soil); assert.ok(b.wpMm < b.fcMm && b.fcMm < b.satMm && b.airDryMm < b.wpMm); }
  const b = boundsOf(SOILS[1]); assert.equal(ksOf(b.fcMm, b, 0.4), 1); assert.equal(ksOf(b.wpMm, b, 0.4), 0); assert.equal(ksOf(b.fcMm - 0.4 * b.tawMm, b, 0.4), 1);
  let prev = 2; for (let w = b.fcMm; w >= b.wpMm - 1; w -= 2) { const k = ksOf(w, b, 0.4); assert.ok(k <= prev + 1e-12); prev = k; }
  assert.ok(near(ksOf(b.wpMm + 0.5 * b.tawMm * 0.6, b, 0.4), 0.5));
  ok('estrés hídrico Ks: 1 hasta agotar el 40 % del agua útil, baja de forma lineal y monótona y llega a 0 en el punto de marchitez');
}

// ── Balance hídrico del suelo ──────────────────────────────────────────
{
  // Escenario aleatorio con riego, lluvia y ET: Δ agua = riego + lluvia − escorrentía − ET − drenaje, exacto en cada paso.
  for (const soil of SOILS) for (const crop of ['', 'tomate']) {
    let st = {...PARCEL_STATE, suelo: soil.id, cultivo: crop, aguaMm: boundsOf(soil).fcMm * 0.8};
    const b = boundsOf(soil); let maxErr = 0;
    for (let i = 0; i < 400; i++) {
      const dt = 60 + rand(1, 1, i) * 1740, heavy = rand(1, 2, i) < 0.1;
      const inp = {dtS: dt, et0Mm: rand(1, 3, i) * 0.3, rainMm: heavy ? rand(1, 4, i) * 15 : 0, rainRateMmH: heavy ? 8 : 0, irrigMm: rand(1, 5, i) < 0.4 ? rand(1, 6, i) * 5 : 0, irrRunoffMm: 0, gddDay: 10};
      inp.irrRunoffMm = inp.irrigMm * (rand(1, 7, i) < 0.3 ? 0.4 : 0);
      const before = st, w0 = viewOf(before).waterMm; st = stepParcel(before, inp);
      const dW = st.aguaMm - w0, flux = (st.riegoMm - before.riegoMm) + (st.lluviaMm - before.lluviaMm) - (st.escorrentiaMm - before.escorrentiaMm) - (st.etMm - before.etMm) - (st.drenajeMm - before.drenajeMm);
      maxErr = Math.max(maxErr, Math.abs(dW - flux));
      assert.ok(st.aguaMm >= b.airDryMm - 1e-9 && st.aguaMm <= b.satMm + 1e-9, `agua ${st.aguaMm}`); assert.ok(st.ks >= 0 && st.ks <= 1);
    }
    assert.ok(maxErr < 1e-9, `error de balance ${maxErr}`);
  }
  ok('balance de masa del suelo: Δ agua = riego + lluvia − escorrentía − ET − drenaje con error < 1e-9 mm en 2 400 pasos (3 suelos, con y sin cultivo, nunca bajo el aire seco ni sobre la saturación)');
}
{
  const drainDays = (id) => { const soil = SOILS.find(s => s.id === id), b = boundsOf(soil); let st = {...PARCEL_STATE, suelo: id, aguaMm: b.satMm}; for (let i = 0; i < 48; i++) st = stepParcel(st, {dtS: 3600, et0Mm: 0, rainMm: 0, rainRateMmH: 0, irrigMm: 0, irrRunoffMm: 0, gddDay: 0}); return {left: st.aguaMm - b.fcMm, drained: st.drenajeMm, st}; };
  const a = drainDays('arenoso'), f = drainDays('franco'), c = drainDays('arcilloso');
  assert.ok(a.left < f.left && f.left < c.left, `${a.left} ${f.left} ${c.left}`); assert.ok(near(a.left, (boundsOf(SOILS[0]).satMm - boundsOf(SOILS[0]).fcMm) * Math.exp(-2 / 0.25), 1e-9));
  ok(`drenaje: en 2 días la arena casi vacía su exceso (${a.left.toFixed(2)} mm), el franco ${f.left.toFixed(1)} mm y la arcilla ${c.left.toFixed(1)} mm; coincide con la exponencial exacta`);
}
{
  const rain = (id) => stepParcel({...PARCEL_STATE, suelo: id, aguaMm: boundsOf(SOILS.find(s => s.id === id)).wpMm}, {dtS: 3 * 3600, et0Mm: 0, rainMm: 30, rainRateMmH: 10, irrigMm: 0, irrRunoffMm: 0, gddDay: 0});
  assert.equal(rain('arenoso').escorrentiaMm, 0); assert.equal(rain('franco').escorrentiaMm, 0); assert.ok(rain('arcilloso').escorrentiaMm > 10 && near(rain('arcilloso').escorrentiaMm, 30 * (1 - 6 / 10)));
  ok('lluvia de 10 mm/h: se infiltra en arena y franco; en arcilla (6 mm/h) escurre el 40 %');
}

// ── Riego sobre parcelas ───────────────────────────────────────────────
{
  const { s, spr, parcel } = irrigationWorld();
  const sp = s.entity(spr), pc = s.entity(parcel);
  assert.equal(coverageShare(sp, pc), 1);
  const far = must(s.place('parcela', sp.pose.position[0] + 60, sp.pose.position[2], 0)); assert.equal(coverageShare(sp, s.entity(far.id)), 0);
  // en el borde: la mitad del círculo cae fuera
  const edge = WorldSession.fromWorld(newWorld('Borde', {seed: 2})); const e1 = must(edge.place('emisor', 0, 0, 0)), p1 = must(edge.place('parcela', 10, 0, 0, {params: {anchoM: 20, largoM: 30}}));
  const sh = coverageShare(edge.entity(e1.id), edge.entity(p1.id)); assert.ok(sh > 0.45 && sh < 0.55, `${sh}`);
  const ir = irrigationByParcel(s.entities, {[spr]: 40})[parcel]; assert.ok(near(ir.lmin, 40) && near(ir.rateMmH, 40 * 60 / 600) && ir.runoffFraction === 0);
  assert.deepEqual(irrigationByParcel(s.entities, {[spr]: 0}), {});
  // arcilla + aspersor de poco radio y mucho caudal: la intensidad local supera la infiltración y escurre
  const clay = irrigationWorld({soil: 'arcilloso', radio: 3, caudal: 100 }), irc = irrigationByParcel(clay.s.entities, {[clay.spr]: 100})[clay.parcel];
  assert.ok(irc.runoffFraction > 0.5, `${irc.runoffFraction}`);
  ok('aspersor → parcela: cobertura 100 % dentro, 0 % lejos, ≈ 50 % en el borde; mm/h promedio = L/min·60/área; escorrentía si la intensidad local supera la infiltración');
}

// ── Vaciado del estanque y riego (balance de masa) ─────────────────────
{
  const { s, tank, parcel, spr } = irrigationWorld();
  const q = s.analyze().elements[spr].flowLmin; assert.ok(q > 30);
  const L0 = state(s, tank).nivelL; s.advance(60);
  const dTank = L0 - state(s, tank).nivelL, dBeta = state(s, parcel).riegoMm * 600;
  assert.ok(near(dTank, q * 1, 1e-6), `${dTank} vs ${q}`); assert.ok(near(dTank, dBeta, 1e-9), `${dTank} vs ${dBeta}`);
  ok(`el estanque entrega ${dTank.toFixed(1)} L en 1 min (= ${q.toFixed(1)} L/min × 1 min) y la parcela recibe exactamente esos litros (${(dBeta / 600).toFixed(2)} mm)`);
}
{
  const { s, tank, parcel, pump } = irrigationWorld(), dead = deadVolumeL(s.entity(tank));
  assert.ok(dead > 1500 && dead < 2200, `volumen muerto ${dead}`);
  const events = []; let l0 = state(s, tank).nivelL, delivered = 0;
  for (let i = 0; i < 200; i++) { s.advance(300); delivered = state(s, parcel).riegoMm * 600; if (s.analyze().balance.emittersLmin === 0) break; }
  const lvl = state(s, tank).nivelL; assert.ok(lvl >= 0 && lvl < dead, `nivel final ${lvl} (muerto ${dead})`);
  assert.ok(near(l0 - lvl - (dead - lvl) , delivered, 1e-6) || Math.abs((l0 - dead) - delivered) < 1e-3, `entregado ${delivered} vs útil ${l0 - dead}`);
  assert.equal(s.analyze().balance.emittersLmin, 0); assert.match(s.analyze().elements[pump].reason ?? '', /Sin agua|No sale agua/);
  const texts = s.events.map(e => e.text).join(' | '); assert.match(texts, /menos del 15 %/); assert.match(texts, /sin agua utilizable/);
  assert.ok(alertsOf(s.entities, s.analyze()).some(a => a.level === 'bad' && /no tiene agua utilizable/.test(a.text)));
  // sin agua no se riega más, y el avance en seco no toca el estanque
  const before = state(s, parcel).riegoMm; s.advance(3600); assert.equal(state(s, parcel).riegoMm, before);
  // rellenar reanuda el riego
  must(s.setState(tank, 'nivelL', 5000)); assert.ok(s.analyze().balance.emittersLmin > 30); s.advance(600); assert.ok(state(s, parcel).riegoMm > before);
  ok(`el estanque se vacía hasta su salida (volumen muerto ${dead.toFixed(0)} L): entrega exactamente el agua útil, avisa al 15 % y al agotarse, deja de regar y reanuda al rellenar`);
}
{
  // un paso que cruza el agotamiento reparte lo que había: no se entrega más agua que la disponible
  const { s, tank, parcel } = irrigationWorld({level: 2000}); const dead = deadVolumeL(s.entity(tank));
  s.advance(3600); const delivered = state(s, parcel).riegoMm * 600; assert.ok(Math.abs(delivered - (2000 - dead)) < 1e-6, `${delivered} vs ${2000 - dead}`);
  ok('con 2 000 L (solo ~140 L útiles) el riego entrega exactamente el agua útil y ni un litro más, aunque la bomba pida más en el paso');
}
{
  // sin agua en movimiento el tanque no cambia; sin pasar el interruptor no hay riego
  const { s, tank, board, parcel } = irrigationWorld(); must(s.setState(board, 'interruptor', false)); const L = state(s, tank).nivelL; s.advance(DAY);
  assert.equal(state(s, tank).nivelL, L); assert.equal(state(s, parcel).riegoMm, 0);
  ok('con el interruptor apagado pasa un día sin mover ni un litro del estanque ni regar la parcela');
}

// ── Cultivo completo ───────────────────────────────────────────────────
function growSeason(irrigate, seed = 7) {
  const w = irrigationWorld({seed, level: 10000}); const { s, tank, parcel, board } = w;
  must(s.plant(parcel, 'tomate')); const stages = new Set([viewOf(state(s, parcel)).stage.id]);
  let days = 0;
  while (days < 300) {
    must(s.setState(board, 'interruptor', irrigate && viewOf(state(s, parcel)).available < 0.8));
    must(s.setState(tank, 'nivelL', 10000));
    s.advance(900); if ((s.clock.simSeconds / 900) % 96 === 0) days++;
    const v = viewOf(state(s, parcel)); stages.add(v.stage.id); if (v.ready || !v.alive) break;
  }
  return {...w, stages: [...stages], days: s.clock.simSeconds / DAY, view: viewOf(state(s, parcel))};
}
{
  const r = growSeason(true); assert.ok(r.view.ready, 'llegó a la madurez'); assert.deepEqual(r.stages, ['establecimiento', 'vegetativo', 'floracion', 'fructificacion', 'madurez']);
  assert.ok(r.view.damage < 0.1, `daño ${r.view.damage}`); assert.ok(r.days > 80 && r.days < 220, `${r.days} días`);
  const texts = r.s.events.map(e => e.text); for (const re of [/etapa «desarrollo vegetativo»/, /etapa «floración»/, /etapa «llenado de frutos»/, /listo para cosechar/]) assert.ok(texts.some(t => re.test(t)), String(re));
  assert.ok(alertsOf(r.s.entities, r.s.analyze()).some(a => a.level === 'info' && /listo para cosechar/.test(a.text)));
  const h = must(r.s.harvest(r.parcel)); assert.ok(near(h.kg, h.tha * 0.06 * 1000, 1e-9) && h.tha > 60 && h.tha <= 80); assert.equal(state(r.s, r.parcel).cultivo, ''); assert.equal(state(r.s, r.parcel).cosechas, 1); assert.equal(state(r.s, r.parcel).cosechaKg, h.kg);
  assert.ok(!r.s.harvest(r.parcel).ok);
  ok(`ciclo con riego atendido: pasa por las 5 etapas en ${r.days.toFixed(0)} días, daño por estrés ${(r.view.damage * 100).toFixed(1)} % y cosecha ${h.tha.toFixed(1)} t/ha (${Math.round(h.kg).toLocaleString('es-CL')} kg en 600 m²)`);
}
{
  const r = growSeason(false); assert.ok(!r.view.alive, 'sin riego el cultivo muere'); const texts = r.s.events.map(e => e.text);
  assert.ok(texts.some(t => /entra en estrés hídrico/.test(t))); assert.ok(texts.some(t => /murió por falta de agua/.test(t)));
  assert.ok(alertsOf(r.s.entities, r.s.analyze()).some(a => a.level === 'bad' && /murió/.test(a.text)));
  const e = r.s.harvest(r.parcel); assert.ok(!e.ok && /murió/.test(e.error)); const clear = must(r.s.clearCrop(r.parcel)); assert.equal(clear.state.cultivo, ''); must(r.s.plant(r.parcel, 'tomate'));
  ok(`sin riego el tomate entra en estrés, muere (a los ${r.days.toFixed(0)} días) y avisa; no se puede cosechar, pero se retira y se vuelve a sembrar`);
}
{
  // la misma sequía duele más en la floración que en el establecimiento (Ky 1,1 vs 0,2)
  const dry = (gdd) => { let st = {...PARCEL_STATE, cultivo: 'tomate', gdd, aguaMm: boundsOf(SOILS[1]).wpMm + 5}; for (let i = 0; i < 24; i++) st = stepParcel(st, {dtS: 3600, et0Mm: 0.2, rainMm: 0, rainRateMmH: 0, irrigMm: 0, irrRunoffMm: 0, gddDay: 12}); return st.dano; };
  assert.ok(dry(600) > 3 * dry(50), `${dry(600)} vs ${dry(50)}`);
  ok('sensibilidad por etapa: el mismo día de sequía daña más en floración que en establecimiento');
}
{
  const p = plant({...PARCEL_STATE}, 'tomate', 3); assert.ok(p.ok); assert.equal(p.state.siembraDia, 3); assert.ok(!plant(p.state, 'tomate', 4).ok); assert.ok(!plant({...PARCEL_STATE}, 'maiz', 0).ok);
  const early = harvest(p.state, 600); assert.ok(!early.ok && /Todavía no está listo/.test(early.error)); assert.ok(!harvest({...PARCEL_STATE}, 600).ok);
  assert.deepEqual(clearCrop(p.state).cultivo, ''); ok('siembra y cosecha: no se siembra encima de un cultivo vivo, no se cosecha antes de tiempo ni sin cultivo, ni un cultivo muerto');
}

// ── Determinismo, pasos y persistencia ─────────────────────────────────
{
  const run = (seed, chunks) => { const w = irrigationWorld({seed}); must(w.s.plant(w.parcel, 'tomate')); must(w.s.setState(w.board, 'interruptor', false)); for (let i = 0; i < chunks; i++) w.s.advance(10 * DAY / chunks); return w; };
  const a = run(7, 1), b = run(7, 1); assert.deepEqual(a.s.entities.map(e => e.state), b.s.entities.map(e => e.state));
  const c = run(8, 1); assert.notEqual(state(a.s, a.parcel).etMm, state(c.s, c.parcel).etMm);
  const f = run(7, 1000); const sa = state(a.s, a.parcel), sf = state(f.s, f.parcel);
  assert.ok(Math.abs(sa.aguaMm - sf.aguaMm) < 0.5 && Math.abs(sa.etMm - sf.etMm) < 0.5 && Math.abs(sa.gdd - sf.gdd) < 1e-6, `${sa.aguaMm} vs ${sf.aguaMm}`);
  ok(`mismo mundo y semilla → mismo resultado; otra semilla → otro; avanzar 10 días de una vez o en 1 000 tramos da lo mismo (Δ agua ${Math.abs(sa.aguaMm - sf.aguaMm).toExponential(1)} mm)`);
}
{
  const w = irrigationWorld(); must(w.s.plant(w.parcel, 'tomate')); w.s.advance(5 * DAY);
  w.s.setSpeed(20); const file = exportWorld(w.s.toWorld()); const back = parseWorldText(file.text); assert.ok(back.ok, back.error);
  assert.equal(back.value.clock.simSeconds, 5 * DAY); assert.equal(back.value.clock.speed, 20);
  const s2 = WorldSession.fromWorld(back.value); assert.equal(s2.clock.speed, 0, 'se abre en pausa'); assert.equal(s2.clock.simSeconds, 5 * DAY);
  assert.deepEqual(s2.entities.map(e => e.state), w.s.entities.map(e => e.state));
  w.s.advance(3 * DAY); s2.advance(3 * DAY); assert.deepEqual(s2.entities.map(e => e.state), w.s.entities.map(e => e.state));
  ok('guardar y reabrir conserva reloj, agua, cultivo y semilla; el mundo se abre en pausa y, al seguir, evoluciona igual que el original (reproducible)');
}
{
  // deshacer no deshace el tiempo
  const w = irrigationWorld(); must(w.s.plant(w.parcel, 'tomate')); const extra = must(w.s.place('sensor-humedad', w.s.entity(w.parcel).pose.position[0] + 3, w.s.entity(w.parcel).pose.position[2], 0));
  w.s.advance(2 * 3600); const lvl = state(w.s, w.tank).nivelL, water = state(w.s, w.parcel).aguaMm, gdd = state(w.s, w.parcel).gdd; assert.ok(lvl < 6000);
  assert.ok(w.s.undo()); assert.equal(w.s.entity(extra.id), undefined); assert.equal(state(w.s, w.tank).nivelL, lvl); assert.equal(state(w.s, w.parcel).aguaMm, water); assert.equal(state(w.s, w.parcel).gdd, gdd);
  assert.ok(w.s.redo()); assert.equal(state(w.s, w.tank).nivelL, lvl); assert.equal(state(w.s, w.parcel).cultivo, 'tomate');
  const label = w.s.undoLabel; must(w.s.setState(w.tank, 'nivelL', 3000)); assert.equal(w.s.undoLabel, label, 'cambiar el nivel no entra en el historial'); must(w.s.setState(w.parcel, 'suelo', 'arenoso')); assert.equal(w.s.undoLabel, label);
  assert.ok(!w.s.setState(w.tank, 'nivelL', 99999).ok); assert.ok(!w.s.setState(w.parcel, 'suelo', 5).ok);
  ok('deshacer y rehacer piezas conservan el agua y el cultivo ya transcurridos; los mandos de nivel, suelo y cultivo no ensucian el historial y se validan');
}
{
  // una edición de terreno con el tiempo corriendo no pierde el estado vivo
  const w = irrigationWorld(); const x = w.s.entity(w.tank).pose.position[0]; w.s.beginStroke(); w.s.stamp('raise', x + 40, 40, 6, 1); w.s.advance(1800); const lvl = state(w.s, w.tank).nivelL; w.s.endStroke();
  assert.equal(state(w.s, w.tank).nivelL, lvl); ok('el estado vivo se conserva al cerrar un trazo de terreno aunque el tiempo corra durante el trazo');
}
{
  // mundo antiguo (Fase 3): parcela sin claves de suelo/cultivo y aspersor sin radio
  const w = irrigationWorld(); const world = w.s.toWorld(); for (const e of world.entities) { if (e.type === 'parcela') e.state = {}; if (e.type === 'emisor') delete e.params.radioM; }
  const parsed = parseWorld(world); assert.ok(parsed.ok, parsed.error); const s2 = WorldSession.fromWorld(parsed.value);
  assert.equal(s2.entities.find(e => e.type === 'emisor').params.radioM, 8); const p = s2.entities.find(e => e.type === 'parcela'); s2.advance(DAY);
  assert.ok(Number.isFinite(s2.entity(p.id).state.aguaMm) && s2.entity(p.id).state.aguaMm > 0); ok('un mundo de la Fase 3 se abre y avanza: el aspersor recibe su radio de riego y la parcela parte con un suelo franco al 60 % del agua útil');
}
{
  // sensor, alertas y límites
  const w = irrigationWorld(); const at = w.s.entity(w.parcel).pose.position, sensor = must(w.s.place('sensor-humedad', at[0] - 6, at[2] + 6, 0)), out = must(w.s.place('sensor-humedad', at[0] + 100, at[2], 0));
  const r = sensorReading(w.s.entities, w.s.entity(sensor.id)); assert.equal(r.parcelId, w.parcel); assert.ok(near(r.moisturePct, 100 * (boundsOf(SOILS[1]).wpMm + 0.6 * boundsOf(SOILS[1]).tawMm) / ROOT_DEPTH_MM, 1e-9)); assert.equal(sensorReading(w.s.entities, w.s.entity(out.id)), null);
  must(w.s.setState(w.parcel, 'aguaMm', boundsOf(SOILS[1]).wpMm + 5)); must(w.s.plant(w.parcel, 'tomate'));
  assert.ok(sensorReading(w.s.entities, w.s.entity(sensor.id)).stressed); assert.ok(alertsOf(w.s.entities, w.s.analyze()).some(a => a.level === 'bad' && /estrés hídrico severo/.test(a.text)));
  assert.equal(DEATH_DAYS, 4); ok('sensor de humedad: lee la parcela donde está clavado (y nada fuera); las alertas se derivan del estado y ordenan lo grave primero');
}
{
  // rendimiento: 30 días con el riego activo y 1 día en reposo
  const w = irrigationWorld({level: 10000}); const t0 = Date.now(); w.s.advance(DAY); const idle = Date.now() - t0;
  must(w.s.setState(w.board, 'interruptor', true)); const t1 = Date.now(); for (let d = 0; d < 30; d++) { must(w.s.setState(w.tank, 'nivelL', 10000)); w.s.advance(DAY); } const active = Date.now() - t1;
  assert.ok(idle < 500 && active < 8000, `reposo ${idle} ms, activo ${active} ms`);
  ok(`rendimiento (Node): 1 día simulado con la red parada ${idle} ms; 30 días con riego continuo ${active} ms`);
}
{
  // presupuesto de tiempo: un avance enorme se corta y reporta lo avanzado
  const w = irrigationWorld(); const done = w.s.advance(400 * DAY, 15); assert.ok(done > 0 && done < 400 * DAY); assert.equal(w.s.clock.simSeconds, done);
  assert.equal(w.s.advance(0), 0); assert.equal(w.s.advance(-5), 0); ok(`con un presupuesto de 15 ms el avance se corta y el reloj refleja exactamente lo simulado (${(done / DAY).toFixed(1)} de 400 días)`);
}

console.log(`\n${n} bloques de verificación de Agro (tiempo, suelo y cultivo) en verde.`);
