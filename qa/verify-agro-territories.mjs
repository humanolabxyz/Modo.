import assert from 'node:assert/strict';
import {TERRITORY_IDS} from '../src/agro/model/types.ts';
import {exportWorld, parseWorld, parseWorldText} from '../src/agro/model/validate.ts';
import {buildChunk} from '../src/agro/terrain/chunks.ts';
import {buildExterior, sceneryHeight} from '../src/agro/terrain/exterior.ts';
import {checksum, createHeightfield, heightRange, sampleHeight, slopeDegrees} from '../src/agro/terrain/heightfield.ts';
import {CHUNK_CELLS, TerrainModel} from '../src/agro/terrain/model.ts';
import {cameraDistances, playablePoint} from '../src/agro/terrain/navigation.ts';
import {TERRITORIES} from '../src/agro/terrain/presets.ts';
import {raycastHeightfield} from '../src/agro/terrain/raycast.ts';
import {decorativeFeatures, greenCover, waterSection} from '../src/agro/terrain/surface.ts';
import {createConfiguredWorld, setupTerrain, siteX} from '../src/agro/world/setup.ts';
import {WorldSession} from '../src/agro/world/session.ts';

const must = r => { assert.ok(r.ok, r.error); return r.value; };
const setup = (territory, side = 800, seed = 31) => ({
  name: territory, seed, territory, template: 'farm', side, site: 'center', relief: 'natural', radius: 60,
  resources: ['parcel', 'irrigation', 'greenhouse', 'solar'], water: 80, experience: 'free', start: '2026-09-21',
  terrainParams: {...TERRITORIES[territory].params},
});
const pass = msg => console.log('PASS', msg);

const checksums = new Set(), stats = {};
for (const id of TERRITORY_IDS) {
  const config = setup(id), terrain = setupTerrain(config, 4), hf = createHeightfield(terrain);
  const range = heightRange(hf);
  stats[id] = +(range.max - range.min).toFixed(1);
  assert.equal(checksum(hf), checksum(createHeightfield(terrain)));
  assert.notEqual(checksum(hf), checksum(createHeightfield({...terrain, seed: 412})));
  checksums.add(checksum(hf));
  const world = must(createConfiguredWorld(config));
  const reopened = must(parseWorldText(exportWorld(world).text));
  assert.deepEqual(reopened.terrain, world.terrain);
  assert.deepEqual(reopened.entities, world.entities);
  assert.deepEqual(reopened.connections, world.connections);
}
assert.equal(checksums.size, 6);
assert.ok(stats.ladera > stats.free * 2);
assert.ok(stats['oasis-norte'] > stats.desierto);
pass(`seis relieves distintos, deterministas y persistentes con conjuntos iniciales completos; amplitud (m) ${JSON.stringify(stats)}`);

for (const id of TERRITORY_IDS) for (const side of [400, 800, 1200]) for (let seed = 0; seed < 20; seed++) {
  const hf = createHeightfield(setupTerrain(setup(id, side, seed), 10));
  for (const site of ['west', 'center', 'east']) {
    for (const [x, z] of [[0, 0], [-11, -10], [24, 21], [12, 31], [0, 35]]) {
      assert.ok(slopeDegrees(hf, siteX(site) + x, z) <= 5, `${id}/${side}/${seed}/${site}`);
    }
  }
}
pass('360 combinaciones de territorio, tamaño y semilla mantienen suaves las zonas de montaje');

const terrain = setupTerrain(setup('valle-rio'), 4);
const hf = createHeightfield(terrain);
for (const [key, value] of Object.entries({reliefStrength: 0.3, roughness: 0.91, baseElevationM: 80, valleyBias: 0.08})) {
  assert.notEqual(checksum(hf), checksum(createHeightfield({...terrain, params: {...terrain.params, [key]: value}})), key);
}
const bare = {...terrain, params: {...terrain.params, vegetation: 0, rocks: 0}};
assert.equal(checksum(hf), checksum(createHeightfield(bare)));
const flat = createHeightfield({...bare, params: {...bare.params, reliefStrength: 0}});
assert.ok(flat.data.every(y => y === flat.params.baseElevationM));
const world = must(createConfiguredWorld(setup('valle-rio')));
assert.match(parseWorld({...world, terrain: {...world.terrain, params: {...world.terrain.params, roughness: 2}}}).error, /Rugosidad/);
assert.match(parseWorld({...world, terrain: {...world.terrain, params: {...world.terrain.params, typo: 0}}}).error, /campo desconocido/);
assert.match(parseWorld({...world, terrain: {...world.terrain, params: undefined}}).error, /Faltan los parámetros/);
const river = waterSection(hf, 100);
assert.ok(sampleHeight(hf, river.x, 100) < sampleHeight(hf, river.x + 28, 100));
const oasis = createHeightfield(setupTerrain(setup('oasis-norte'), 4));
assert.ok(greenCover(oasis, -18, -25, 1) > greenCover(oasis, 330, -25, 1) + 0.4);
assert.equal(decorativeFeatures(hf).water, true); assert.equal(decorativeFeatures(oasis).water, false);
pass('controles físicos y de cubierta independientes, cauce deprimido y vegetación concentrada en el oasis');

for (const spec of [setupTerrain({...setup('valley', 420), terrainParams: undefined}), setupTerrain(setup('oasis-norte', 800))]) {
  const model = TerrainModel.fromTerrain(spec), {hf} = model;
  const [x, z] = [hf.originX, hf.originZ], y = sampleHeight(hf, x, z);
  assert.equal(sceneryHeight(hf, x, z), y);
  assert.ok(Math.abs(sceneryHeight(hf, x - 0.01, z) - y) < 0.01);
  const original = model.checksum(), mesh = buildExterior(hf, CHUNK_CELLS);
  assert.equal(model.checksum(), original);
  assert.ok(mesh.positions.every(Number.isFinite));
  assert.ok(mesh.indices.every(index => index < mesh.positions.length / 3));
  const vertices = new Map();
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const [px, py, pz] = mesh.positions.subarray(i, i + 3);
    if (pz === z && px >= x && px <= -x) vertices.set(px, {py, color: [...mesh.colors.subarray(i, i + 3)]});
  }
  for (const lod of [0, 1, 2]) {
    const chunk = buildChunk(hf, 0, 0, lod, true);
    const row = [...vertices.keys()].filter(px => px <= x + CHUNK_CELLS * hf.cell);
    for (const px of row) {
      let at = -1;
      for (let i = 0; i < chunk.positions.length; i += 3) if (chunk.positions[i] === px && chunk.positions[i + 2] === z) {at = i; break;}
      assert.ok(at >= 0, 'vértice compartido en el perímetro dibujado');
      assert.deepEqual([...chunk.positions.subarray(at, at + 3)], [px, vertices.get(px).py, z]);
      assert.deepEqual([...chunk.colors.subarray(at, at + 3)], vertices.get(px).color);
    }
  }
  model.beginStroke(); assert.ok(model.stamp('raise', x, z, 15, 2).ok); model.endStroke();
  assert.equal(buildExterior(hf, CHUNK_CELLS).positions[1], Math.fround(y + 2));
  assert.ok(model.undo()); assert.equal(model.checksum(), original);
  assert.equal(buildExterior(hf, CHUNK_CELLS).positions[1], y);
}
pass('el cinturón comparte vértices y color con todos los niveles de detalle y sigue las ediciones y el deshacer de borde');

const s = WorldSession.fromWorld(world), boundary = s.terrain.hf.originX;
const before = s.toWorld();
assert.equal(raycastHeightfield(s.terrain.hf, [boundary - 20, 900, 0], [0, -1, 0]), null);
assert.equal(s.place('bomba', boundary - 20, 0, 0).ok, false);
s.beginStroke(); assert.equal(s.stamp('raise', boundary - 20, 0, 30, 3).ok, false); s.endStroke();
assert.deepEqual(s.toWorld(before.updatedAt), before);
assert.deepEqual(playablePoint(s.terrain.hf, -10000, 10000, 2), [boundary + 2, -boundary - 2]);
assert.ok(cameraDistances(s.terrain.hf, 0.5).overview > cameraDistances(s.terrain.hf, 1.6).overview);
pass('el exterior no admite picking, obras ni pincel; navegación adaptada al tamaño y relación de pantalla');

// Una transición de LOD no puede cambiar la normal ni la cubierta en nodos
// compartidos, tampoco dentro del mapa (no solo en el cinturón exterior).
for (const id of ['oasis-norte', 'ladera', 'valle-rio']) {
  const model = TerrainModel.fromTerrain(setupTerrain(setup(id, 1200)));
  const fine = buildChunk(model.hf, 3, 4, 0, true), byPosition = new Map();
  for (let i=0;i<fine.positions.length;i+=3) byPosition.set([...fine.positions.subarray(i,i+3)].join(','), i);
  for (const lod of [1,2]) {
    const coarse = buildChunk(model.hf, 3, 4, lod, true);
    for (let i=0;i<coarse.positions.length;i+=3) {
      const at = byPosition.get([...coarse.positions.subarray(i,i+3)].join(','));
      if (at === undefined) continue;
      assert.deepEqual([...coarse.normals.subarray(i,i+3)], [...fine.normals.subarray(at,at+3)]);
      assert.deepEqual([...coarse.colors.subarray(i,i+3)], [...fine.colors.subarray(at,at+3)]);
    }
    const edge = (mesh, x) => {
      const rows = new Map();
      for (const index of mesh.indices) {
        const i=index*3;
        if (mesh.positions[i] === x) rows.set(mesh.positions[i+2], [...mesh.positions.subarray(i,i+3), ...mesh.normals.subarray(i,i+3)]);
      }
      return [...rows.values()].sort((a,b)=>a[2]-b[2]);
    };
    const x = model.hf.originX + 4*CHUNK_CELLS*model.hf.cell;
    assert.deepEqual(edge(coarse,x), edge(buildChunk(model.hf,4,4,0,true),x));
    let area=0;
    for(let k=0;k<coarse.indices.length;k+=3) {
      const [a,b,c]=[...coarse.indices.subarray(k,k+3)].map(i=>i*3), p=coarse.positions;
      const twice=(p[b+2]-p[a+2])*(p[c]-p[a])-(p[b]-p[a])*(p[c+2]-p[a+2]);
      assert.ok(twice>0,'todos los triángulos tienen superficie y miran hacia arriba'); area+=twice/2;
    }
    assert.equal(area,(CHUNK_CELLS*model.hf.cell)**2,'las tiras cubren exactamente el chunk, sin huecos ni solapes');
  }
  const mesh = buildExterior(model.hf, CHUNK_CELLS);
  assert.ok(mesh.indices.length/3 < 100000, 'el refinamiento del horizonte mantiene acotada la geometría');
}
pass('normales y cubierta idénticas en nodos compartidos de los tres LOD, con geometría exterior acotada');

for (const side of [404, 408, 420, 800, 1200]) {
  const m=TerrainModel.fromTerrain(setupTerrain(setup('ladera',side)));
  for (const lod of [0,1,2]) {
    const cx=m.chunksX-1,cz=m.chunksZ-1,mesh=buildChunk(m.hf,cx,cz,lod,true);
    assert.ok(mesh.positions.every(Number.isFinite));
    const widths=[m.hf.nx-1-cx*CHUNK_CELLS,m.hf.nz-1-cz*CHUNK_CELLS].map(n=>Math.min(n,CHUNK_CELLS)*m.hf.cell);
    let area=0;
    for(let k=0;k<mesh.indices.length;k+=3) {
      const [a,b,c]=[...mesh.indices.subarray(k,k+3)].map(i=>i*3),p=mesh.positions;
      const twice=(p[b+2]-p[a+2])*(p[c]-p[a])-(p[b]-p[a])*(p[c+2]-p[a+2]);
      assert.ok(twice>0);area+=twice/2;
    }
    assert.equal(area,widths[0]*widths[1]);
  }
}
pass('chunks parciales de esquina y tres LOD conservan área, orientación y coordenadas finitas');
