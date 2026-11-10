import assert from 'node:assert/strict';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {sampleHeight} from '../src/agro/terrain/heightfield.ts';
import {roadContains, snapToRoad} from '../src/agro/terrain/roads.ts';
import {exportWorld, parseWorldText} from '../src/agro/model/validate.ts';
import {itemById, sizeOf} from '../src/agro/catalog/items.ts';

const must = r => { assert.ok(r.ok, r.error); return r.value; };
const make = () => WorldSession.fromWorld(must(createConfiguredWorld({name:'Caminos QA',seed:31,territory:'free',side:400,template:'blank',site:'center',relief:'natural',radius:30,resources:[],water:80,experience:'free',start:'2026-09-21'})));
const road = s => ({kind:'road',center:[0,0],radius:20,amount:1,points:[[-15,0],[15,0]],width:6,heights:[sampleHeight(s.terrain.hf,-15,0),sampleHeight(s.terrain.hf,15,0)]});
const s = make(); s.setEditorActive(true); must(s.previewTerrainOperation(road(s))); must(s.commitStroke('keep'));
assert.ok(roadContains(s.terrain.hf.surfaceEdits, 0, 0));
assert.match(s.place('bomba',0,0,0).error, /camino/);
const restored = WorldSession.fromWorld(must(parseWorldText(exportWorld(s.toWorld()).text)));
assert.match(restored.place('bomba',0,0,0).error, /camino/);
assert.ok(s.undo()); assert.ok(!roadContains(s.terrain.hf.surfaceEdits, 0, 0)); assert.ok(s.redo());
const occupied = make(); must(occupied.place('bomba',0,0,0)); occupied.setEditorActive(true);
assert.match(occupied.previewTerrainOperation(road(occupied)).error, /estructura/);
console.log('PASS caminos: ocupación, trazado sobre estructuras, persistencia y deshacer/rehacer');

for (const territory of ['free','valley','oasis-norte','desierto','ladera','valle-rio']) {
  const world=must(createConfiguredWorld({name:'Red rural',seed:31,territory,side:400,template:'blank',site:'center',relief:'natural',radius:30,resources:[],water:80,experience:'free',start:'2026-09-21'}));
  const session=WorldSession.fromWorld(world), roads=session.terrain.hf.baseRoads;
  assert.equal(roads.length,4);
  assert.equal(roads[0].width,6);
  assert.ok(roads[0].width < sizeOf(itemById('granero'),{})[0]);
  for(const access of roads.slice(1)) assert.ok(roadContains([roads[0]],...access.points.at(-1)));
  const point=roads[0].points[0]; assert.match(session.place('bomba',...point,0).error,/camino/);
  const snapped=snapToRoad(roads,[point[0]+2,point[1]+2]); assert.ok(roadContains(roads,...snapped));
}
const game=make(); must(game.previewTerrainOperation(road(game))); must(game.commitStroke('keep'));
console.log('PASS red conectada en todos los territorios, reserva, ajuste a caminos y construcción durante la partida');
