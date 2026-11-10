// Mundo piloto «Oasis nortino» de la Etapa 6: instalación de riego completa + estructuras + dos parcelas.
// Se construye solo con la API pública de la sesión (colocación y conexiones reales), de modo que sirve para comparar antes/después.
import assert from 'node:assert/strict';
import {createConfiguredWorld} from '../../src/agro/world/setup.ts';
import {WorldSession} from '../../src/agro/world/session.ts';

const must = r => { assert.ok(r.ok, r.error); return r.value; };
export function buildPilotWorld({sow = true, advanceDays = 18, staged = true} = {}) {
  const made = createConfiguredWorld({name: 'Piloto · Oasis nortino', seed: 31415, territory: 'oasis-norte', side: 1200, template: 'blank', site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'});
  assert.ok(made.ok, made.error);
  const s = WorldSession.fromWorld(made.value), [sx, sz] = s.site;
  const put = (t, x, z, yaw = 0, params) => must(s.place(t, sx + x, sz + z, yaw, params ? {params} : {}));
  const link = (a, ap, b, bp) => must(s.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}));
  const tank = put('estanque', -10, -8), p1 = put('tuberia', -10, -3), valve = put('valvula', -10, 0), p2 = put('tuberia', -10, 4), pump = put('bomba', -10, 9), p3 = put('tuberia', -10, 14), spr = put('emisor', -10, 19);
  const grid = put('acometida', 30, -26), board = put('tablero', 30, -22);
  link(tank, 'salida', p1, 'a'); link(p1, 'b', valve, 'a'); link(valve, 'b', p2, 'a'); link(p2, 'b', pump, 'succion'); link(pump, 'descarga', p3, 'a'); link(p3, 'b', spr, 'entrada'); link(grid, 'red', board, 'red'); link(board, 'salida-bomba', pump, 'alim');
  must(s.setState(board.id, 'interruptor', true));
  const at = s.entity(spr.id).pose.position, parcel = must(s.place('parcela', at[0], at[2], 0, {params: {anchoM: 16, largoM: 22}}));
  const parcel2 = put('parcela', 26, 24, 0, {anchoM: 16, largoM: 22});
  put('invernadero', 36, -14, 0, {anchoM: 8, largoM: 20}); put('granero', -34, 24, Math.PI / 2); put('molino', 38, 40); put('panel-solar', 18, -10); put('panel-solar', 18, -7.5);
  put('sensor-humedad', 5, 22); put('cerca', -4, -34, 0, {largoM: 24});
  if (sow) { must(s.plant(parcel.id, 'tomate')); must(s.plant(parcel2.id, 'tomate')); if (advanceDays) s.advance(advanceDays * 86400);
    // Etapas distintas para ver variantes: la parcela 1 en floración y la 2 en llenado de frutos (grados-día del motor; no se altera ningún parámetro).
    if (staged) { must(s.setState(parcel.id, 'gdd', 520)); must(s.setState(parcel2.id, 'gdd', 900)); } }
  return {world: s.toWorld(), ids: {parcel: parcel.id, parcel2: parcel2.id, board: board.id, pump: pump.id, tank: tank.id}};
}
