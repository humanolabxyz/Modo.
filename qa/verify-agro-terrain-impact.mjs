// Etapa 2: una edición de terreno es una transacción de relieve, poses e incidencias.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newWorld} from '../src/agro/model/defaults.ts';
import {LIMITS} from '../src/agro/model/types.ts';
import {exportWorld, parseWorldText} from '../src/agro/model/validate.ts';
import {autosaveDecision} from '../src/agro/store/autosave.ts';
import {memoryBackend} from '../src/agro/store/backend.ts';
import {WorldStore} from '../src/agro/store/worlds.ts';
import {sampleHeight} from '../src/agro/terrain/heightfield.ts';
import {TERRAIN_REVIEW} from '../src/agro/world/impact.ts';
import {pipePortElevation, TERRAIN_ISSUE} from '../src/agro/world/pipeElevation.ts';
import {WorldSession} from '../src/agro/world/session.ts';

const now = '2026-11-10T12:00:00.000Z';
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const mk = () => WorldSession.fromWorld(newWorld('Finca', {seed: 4242, now}));
const snapshot = s => ({world: s.toWorld(now), sum: s.terrain.checksum()});
const draw = (s, ...marks) => {
  s.beginStroke();
  for (const mark of marks) must(s.stamp(...mark));
  return s.endStroke();
};
const heights = (s, id, hf = s.terrain.hf) => {
  const pipe = s.entity(id);
  return pipe.ports.map(p => pipePortElevation(hf, pipe, p));
};
const ids = report => report.entities.map(e => e.id);
const pass = name => console.log('PASS', name);

{
  const setup = mk();
  must(setup.place('bomba', 0, 0, 0));
  const world = structuredClone(setup.toWorld(now));
  world.entities[0].pose.position[1] += 2;  // instalación preexistente fuera de la cota del suelo
  const s = WorldSession.fromWorld(world);
  const before = snapshot(s);
  assert.equal(draw(s, ['raise', 100, 100, 20, 2]), null);
  assert.deepEqual(s.entities, before.world.entities);
  assert.ok(s.undo()); assert.deepEqual(snapshot(s), before);
  const revision = s.saveVersion;
  assert.equal(draw(s, ['raise', 0, 0, 20, 1]).entities.length, 1);
  assert.equal(s.canRedo, false);
  s.abortStroke();
  assert.equal(s.saveVersion, revision);
  assert.deepEqual(snapshot(s), before);
  assert.ok(s.redo());
  pass('zona libre confirma sin diálogo y respeta una pieza fuera de cota; cancelar conserva el rehacer y la revisión guardada');
}

{
  const s = mk(), tank = must(s.place('estanque', -8, 0, 0)), pump = must(s.place('bomba', 0, 0, 0));
  const pipe = must(s.place('tuberia', 8, 0, 0)), building = must(s.place('invernadero', 22, 20, Math.PI / 4));
  must(s.connectPorts({entityId: pump.id, portId: 'descarga'}, {entityId: pipe.id, portId: 'a'}));
  const remote = must(s.place('granero', -100, -100, 0));
  const original = snapshot(s), revision = s.saveVersion, conn = s.connections[0], oldEnds = heights(s, pipe.id);
  const oldAnalysis = s.analyze();
  const marks = [['raise', 0, 0, 75, 3], ['lower', 0, 0, 60, 1]];
  const report = draw(s, ...marks);
  assert.deepEqual(ids(report), [tank.id, pump.id, pipe.id, building.id]);
  assert.deepEqual(report.connections.map(c => c.id), [conn.id]);
  assert.ok(report.entities.every(e => !e.blocker));
  assert.equal(s.canUndo, false);
  assert.equal(s.place('bomba', 20, 20, 0).ok, false);
  assert.equal(s.stamp('raise', 30, 30, 10, 2).ok, false);
  assert.notEqual(s.terrain.checksum(), original.sum);
  assert.deepEqual(s.toWorld(now), original.world);
  assert.deepEqual(s.analyze(), oldAnalysis);
  assert.deepEqual(heights(s, pipe.id, s.terrain.committedHeightfield), oldEnds);
  assert.equal(autosaveDecision(s, revision, true).save, false);
  s.abortStroke();
  assert.deepEqual(snapshot(s), original);
  assert.equal(s.saveVersion, revision);
  pass('vista previa y cancelar restauran cada altura, la red y las poses de bomba, estanque, tubería e invernadero');

  draw(s, ...marks);
  const emitted = [];
  const unsubscribe = s.subscribe(() => emitted.push(snapshot(s)));
  must(s.commitStroke('reseat'));
  const reseated = snapshot(s);
  assert.deepEqual(emitted, [reseated]);
  for (const e of report.entities) {
    const installed = s.entity(e.id);
    assert.equal(installed.pose.position[1], e.nextY);
    assert.equal(installed.pose.position[1], sampleHeight(s.terrain.hf, installed.pose.position[0], installed.pose.position[2]));
  }
  assert.deepEqual(s.entity(remote.id), remote);
  assert.deepEqual(s.connections, [{...conn, reason: TERRAIN_REVIEW}]);
  assert.ok(s.undo()); assert.deepEqual(snapshot(s), original);
  assert.ok(s.redo()); assert.deepEqual(snapshot(s), reseated);
  assert.deepEqual(emitted, [reseated, original, reseated]);
  unsubscribe();
  s.undo();
  pass('reasentar cambia solo las piezas anunciadas y publica un estado completo en confirmar, deshacer y rehacer');

  draw(s, ...marks); must(s.commitStroke('keep'));
  const kept = snapshot(s);
  assert.deepEqual(kept.world.entities.map(e => e.pose), original.world.entities.map(e => e.pose));
  assert.deepEqual(heights(s, pipe.id), oldEnds);
  assert.equal(s.analyze().stretched.length, oldAnalysis.stretched.length);
  assert.ok(s.entity(tank.id).state[TERRAIN_ISSUE]);
  assert.ok(s.alerts().some(a => a.text.includes(TERRAIN_REVIEW)));
  assert.ok(s.undo()); assert.deepEqual(snapshot(s), original);
  assert.ok(s.redo()); assert.deepEqual(snapshot(s), kept);
  const reopened = WorldSession.fromWorld(must(parseWorldText(exportWorld(kept.world).text)));
  assert.deepEqual(snapshot(reopened), kept);
  assert.deepEqual(heights(reopened, pipe.id), oldEnds);
  assert.ok(reopened.alerts().some(a => a.text.includes(TERRAIN_REVIEW)));
  pass('señalar conserva poses y cotas de tubería; incidencias y conexiones sobreviven al historial y la exportación');
}

{
  const s = mk(), building = must(s.place('invernadero', 0, 0, 0));
  const [x, y, z] = building.pose.position;
  const report = draw(s, ['raise', x + 3.5, z + 8, 4, 14]);
  assert.equal(report.entities[0].id, building.id);
  assert.match(report.entities[0].blocker, /Pendiente/);
  assert.equal(sampleHeight(s.terrain.hf, x, z), y);
  must(s.commitStroke('reseat'));
  assert.deepEqual(s.entity(building.id).pose, building.pose);
  assert.match(s.entity(building.id).state[TERRAIN_ISSUE], /Pendiente/);
  pass('un cambio de huella fuera del centro detecta y conserva un invernadero en pendiente excesiva');
}

{
  const setup = mk(), pump = must(setup.place('bomba', 0, 0, 0)), world = setup.toWorld(now);
  const state = Object.fromEntries(Array.from({length: LIMITS.params}, (_, i) => [`dato${i}`, i]));
  world.entities[0] = {...pump, state, locked: true};
  const s = WorldSession.fromWorld(world), before = snapshot(s);
  assert.match(draw(s, ['raise', 0, 0, 30, 1]).entities[0].blocker, /bloqueada/);
  assert.match(s.commitStroke('keep').error, /no admite más datos/);
  assert.deepEqual(s.toWorld(now), before.world);
  assert.ok(s.terrainImpact);
  s.abortStroke();
  assert.deepEqual(snapshot(s), before);
  pass('si una pieza bloqueada agotó su estado válido, rechazar la escritura conserva sus datos y deja cancelar');
}

{
  const s = mk(), power = must(s.place('acometida', -20, 0, 0)), panel = must(s.place('tablero', 20, 0, 0));
  must(s.connectPorts({entityId: power.id, portId: 'red'}, {entityId: panel.id, portId: 'red'}));
  const report = draw(s, ['raise', 0, 0, 7, 10]);
  assert.deepEqual(ids(report), []);
  assert.deepEqual(report.connections.map(c => c.id), [s.connections[0].id]);
  assert.match(report.connections[0].warning, /paso/);
  must(s.commitStroke('keep'));
  assert.equal(s.connections[0].reason, TERRAIN_REVIEW);
  pass('la subida de terreno bajo un cable se detecta aunque ambos extremos estén fuera del pincel');
}

{
  const s = mk(), {hf} = s.terrain, before = snapshot(s);
  s.beginStroke();
  assert.equal(s.stamp('raise', hf.originX - 0.01, 0, 20, 5).ok, false);
  assert.deepEqual(snapshot(s), before);
  must(s.stamp('raise', hf.originX, 0, 20, 5));
  assert.notEqual(s.terrain.checksum(), before.sum);
  s.abortStroke();
  assert.deepEqual(snapshot(s), before);
  const world = s.toWorld(now);
  world.terrain.edits = [{id: 'e2', kind: 'raise', center: [0, 0], radius: 10, amount: 1, at: 0}];
  const imported = WorldSession.fromWorld(world);
  assert.equal(draw(imported, ['raise', 0, 0, 10, 1], ['lower', 0, 0, 10, 1]), null);
  assert.deepEqual(imported.terrain.edits.map(e => e.id), ['e2', 'e1', 'e3']);
  must(parseWorldText(exportWorld(imported.toWorld(now)).text));
  pass('el pincel respeta los bordes y conserva ids únicos al continuar un historial importado con huecos');
}

{
  const original = JSON.parse(readFileSync(new URL('fixtures/v1/v1-04-terreno-editado-conectado.modoagro.json', import.meta.url), 'utf8'));
  const backend = memoryBackend(), store = new WorldStore(backend);
  const row = {id: original.id, name: original.name, createdAt: original.createdAt, updatedAt: original.updatedAt, experience: original.experience, entities: original.entities.length, edits: original.terrain.edits.length, data: original};
  await backend.put('worlds', original.id, row);
  const s = WorldSession.fromWorld(must(await store.load(original.id))), before = snapshot(s);
  const tank = s.entities.find(e => e.type === 'estanque'), [x, , z] = tank.pose.position;
  assert.ok(draw(s, ['lower', x, z, 12, 2]));
  assert.deepEqual(s.toWorld(now), before.world);
  must(s.commitStroke('keep'));
  const edited = snapshot(s);
  must(await store.save(edited.world));
  assert.deepEqual((await backend.get('meta', `backup:${s.id}:v1`)).row, row);
  assert.deepEqual(snapshot(WorldSession.fromWorld(must(await store.load(s.id)))), edited);
  assert.deepEqual(edited.world.terrain.edits.slice(0, 30), original.terrain.edits);
  assert.deepEqual(edited.world.connections.map(({id, a, b, status}) => ({id, a, b, status})), original.connections.map(({id, a, b, status}) => ({id, a, b, status})));
  pass('mundo conectado v1 con 30 ediciones migra tras aplicar el trazo, conserva una copia exacta y reabre íntegro');
}
