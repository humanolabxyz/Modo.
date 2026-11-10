import {parcelArea,parcelPerimeter,parcelContains} from '../src/agro/world/parcelGeometry.ts';
import {coverageShare,irrigationByParcel} from '../src/agro/sim/irrigation.ts';
import {parcelAt} from '../src/agro/world/placement.ts';
import assert from 'node:assert/strict';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {exportWorld,parseWorldText} from '../src/agro/model/validate.ts';
const must=r=>{assert.ok(r.ok,r.error);return r.value;};
const make=()=>WorldSession.fromWorld(must(createConfiguredWorld({name:'Editor QA',seed:31,territory:'free',side:400,template:'blank',site:'center',relief:'natural',radius:30,resources:[],water:80,experience:'free',start:'2026-09-21'})));
const round=s=>must(parseWorldText(exportWorld(s.toWorld()).text));
const s=make();s.beginStroke();must(s.stamp('raise',40,40,8,8));s.endStroke();
const before=s.terrain.checksum(),saved=s.toWorld('2026-11-10T00:00:00.000Z');
const op={kind:'smooth',center:[40,40],radius:12,amount:1};
assert.equal(s.previewTerrainOperation(op).ok,false);
s.setEditorActive(true);must(s.previewTerrainOperation(op));
assert.notEqual(s.terrain.checksum(),before);assert.deepEqual(s.toWorld(saved.updatedAt).terrain,saved.terrain);
s.abortStroke();assert.equal(s.terrain.checksum(),before);
must(s.previewTerrainOperation(op));must(s.commitStroke('keep'));const after=s.terrain.checksum();
assert.ok(s.undo());assert.equal(s.terrain.checksum(),before);assert.ok(s.redo());assert.equal(s.terrain.checksum(),after);
assert.equal(WorldSession.fromWorld(round(s)).terrain.checksum(),after);
const bad=round(s);bad.terrain.edits.at(-1).algorithmVersion=99;assert.equal(parseWorldText(JSON.stringify(bad)).ok,false);
console.log('PASS 4A: suavizado determinista, contexto editor, preview no guardada, cancelar, aplicar, undo/redo, persistencia y rechazo de versión futura');

const restore=make();restore.beginStroke();must(restore.stamp('raise',40,40,8,8));restore.endStroke();restore.setEditorActive(true);
const raised=restore.terrain.checksum();must(restore.previewTerrainOperation({...op,kind:'restore'}));
const center=120*restore.terrain.hf.nx+120;assert.equal(restore.terrain.hf.data[center],restore.terrain.hf.base[center]);
restore.abortStroke();assert.equal(restore.terrain.checksum(),raised);
must(restore.previewTerrainOperation({...op,kind:'restore'}));must(restore.commitStroke('keep'));
assert.equal(WorldSession.fromWorld(round(restore)).terrain.checksum(),restore.terrain.checksum());restore.undo();assert.equal(restore.terrain.checksum(),raised);
console.log('PASS 4B: restaura la base de su generador, cancelar no pierde ediciones, historial reversible y guardado');

const paint=make();paint.setEditorActive(true);const unchanged=paint.terrain.checksum();const oldDoc=paint.toWorld();
must(paint.previewTerrainOperation({...op,kind:'paint',material:'gravel'}));assert.equal(paint.terrain.checksum(),unchanged);assert.deepEqual(paint.toWorld().terrain,oldDoc.terrain);
must(paint.commitStroke('keep'));const painted=round(paint);assert.equal(painted.terrain.surfaceEdits.length,1);assert.equal(painted.terrain.edits.length,0);
assert.equal(WorldSession.fromWorld(painted).terrain.hf.surfaceEdits[0].material,'gravel');
assert.deepEqual(painted.entities,oldDoc.entities);paint.undo();assert.equal(paint.toWorld().terrain.surfaceEdits,undefined);paint.redo();assert.equal(paint.toWorld().terrain.surfaceEdits.length,1);
painted.terrain.surfaceEdits[0].material='lava';assert.equal(parseWorldText(JSON.stringify(painted)).ok,false);
console.log('PASS 4C: capa visual separada, altura y estado científico intactos, historial, round-trip y materiales desconocidos rechazados');

const shapePoints=[[-20,-20],[20,-20],[20,20],[-20,20]];
const slope=make();slope.setEditorActive(true);const slopeOriginal=slope.terrain.checksum();
must(slope.previewTerrainOperation({...op,kind:'slope',center:[0,0],points:shapePoints,width:3,amount:20,grade:10}));
assert.equal(slope.terrain.hf.data[100*slope.terrain.hf.nx+100],22);must(slope.commitStroke('keep'));
assert.equal(WorldSession.fromWorld(round(slope)).terrain.checksum(),slope.terrain.checksum());slope.undo();assert.equal(slope.terrain.checksum(),slopeOriginal);
assert.equal(slope.previewTerrainOperation({...op,kind:'slope',points:[[0,0],[20,20],[0,20],[20,0]],width:3,amount:20,grade:10}).ok,false);
const terrace=make();terrace.setEditorActive(true);must(terrace.previewTerrainOperation({...op,kind:'terrace',points:shapePoints,width:2,amount:20,stepHeight:2}));
must(terrace.commitStroke('keep'));assert.equal(WorldSession.fromWorld(round(terrace)).terrain.checksum(),terrace.terrain.checksum());
const impacted=make();must(impacted.place('bomba',0,0,0));impacted.setEditorActive(true);const prior=impacted.toWorld();
must(impacted.previewTerrainOperation({...op,kind:'slope',points:shapePoints,width:3,amount:40,grade:2}));assert.ok(impacted.terrainImpact?.entities.length);impacted.abortStroke();assert.deepEqual(impacted.entities,prior.entities);
console.log('PASS 4D: plano con pendiente en %, terrazas por cotas, polígonos inválidos rechazados, impacto en equipos y persistencia');

for(const kind of ['ditch','road']) {
 const path=make();path.setEditorActive(true);const original=path.terrain.checksum(),raw=path.toWorld();
 must(path.previewTerrainOperation({...op,kind,points:[[-20,0],[20,0]],width:6,amount:kind==='road'?1:2,...(kind==='road'?{heights:[24,26]}:{})}));
 assert.notEqual(path.terrain.checksum(),original);must(path.commitStroke('keep'));
 const reopened=WorldSession.fromWorld(round(path));assert.equal(reopened.terrain.checksum(),path.terrain.checksum());
 assert.deepEqual(path.connections,raw.connections);assert.deepEqual(path.entities,raw.entities);
 path.undo();assert.equal(path.terrain.checksum(),original);path.redo();assert.equal(path.terrain.checksum(),reopened.terrain.checksum());
}
console.log('PASS 4E: zanja excavada, camino con perfil persistente, undo/redo y reapertura sin agregar navegación ni hidráulica');

const poly=make();poly.setEditorActive(true);const outline=[[-10,-15],[10,-15],[10,0],[0,0],[0,15],[-10,15]];
must(poly.previewPolygonParcel(outline));assert.equal(poly.entities.length,0);assert.equal(poly.toWorld().entities.length,0);assert.equal(parcelArea(poly.parcelPreview),450);
poly.abortStroke();assert.equal(poly.parcelPreview,null);must(poly.previewPolygonParcel(outline));must(poly.confirmPolygonParcel());
const polygon=poly.entities[0];assert.equal(parcelArea(polygon),450);assert.equal(parcelPerimeter(polygon),100);
assert.equal(parcelAt(poly.entities,5,10),null);assert.equal(parcelAt(poly.entities,-5,10).id,polygon.id);
assert.equal(poly.previewPolygonParcel(outline).ok,false);
assert.deepEqual(round(poly).entities[0].parcelPolygon,polygon.parcelPolygon);
poly.undo();assert.equal(poly.entities.length,0);poly.redo();assert.equal(poly.entities[0].id,polygon.id);
const beforeRotation=parcelArea(polygon);must(poly.rotate(polygon.id,Math.PI/2));assert.equal(parcelArea(poly.entities[0]),beforeRotation);poly.undo();
// Un rectángulo descrito por sus vértices produce los mismos resultados que el
// rectángulo histórico: cobertura, agua, crecimiento y superficie de cosecha.
const rectangle=make();const rect=must(rectangle.place('parcela',0,0,0));
const equivalent={...rect,parcelPolygon:[[-10,-15],[10,-15],[10,15],[-10,15]]};
for(const x of [-15,-8,0,8,15]) {
 const emitter={...rect,type:'emisor',pose:{...rect.pose,position:[x,1,0]},params:{radioM:8}};
 assert.equal(coverageShare(emitter,rect),coverageShare(emitter,equivalent));
 assert.deepEqual(irrigationByParcel([rect,emitter],{[emitter.id]:40}),irrigationByParcel([equivalent,emitter],{[emitter.id]:40}));
}
const w=rectangle.toWorld(),pw=structuredClone(w);pw.entities[0]=equivalent;
const rSession=WorldSession.fromWorld(w),pSession=WorldSession.fromWorld(pw);must(rSession.plant(rect.id,'tomate'));must(pSession.plant(rect.id,'tomate'));rSession.advance(86400);pSession.advance(86400);assert.deepEqual(rSession.entities[0].state,pSession.entities[0].state);
const invalid=round(poly);invalid.entities[0].parcelPolygon=[[0,0],[10,10],[0,10],[10,0]];assert.equal(parseWorldText(JSON.stringify(invalid)).ok,false);
assert.equal(parcelContains(polygon,5,10),false);
console.log('PASS 4F: parcela cóncava, área/perímetro, selección, solapes, movimiento/rotación, preview, historial y persistencia; rectángulos mantienen riego, suelo y cultivo');

const emitterAt=(x,z)=>({...polygon,id:'qa-emitter',type:'emisor',pose:{...polygon.pose,position:[x,1,z]},params:{radioM:2}});
assert.equal(coverageShare(emitterAt(5,10),polygon),0);assert.equal(coverageShare(emitterAt(-5,8),polygon),1);
assert.equal(irrigationByParcel([polygon,emitterAt(-5,8)],{'qa-emitter':40})[polygon.id].rateMmH,40*60/450);
must(poly.plant(polygon.id,'tomate'));must(poly.setState(polygon.id,'gdd',10000));assert.ok(Math.abs(must(poly.harvest(polygon.id)).kg-3600)<1e-9);
const guard=make();guard.beginStroke();assert.equal(guard.stamp('smooth',0,0,10,1).ok,false);guard.abortStroke();
guard.setEditorActive(true);assert.equal(guard.previewTerrainOperation({...op,points:[[0,0],[1,1]]}).ok,false);
const forged=structuredClone(saved);forged.version=1;delete forged.terrain.generatorVersion;delete forged.terrain.presetId;delete forged.scenario.territory;forged.terrain.surfaceEdits=[];assert.equal(parseWorldText(JSON.stringify(forged)).ok,false);
console.log('PASS invariantes: riego y cosecha usan el área cóncava real; descriptores mezclados y falsos v1 se rechazan');

for(const kind of ['smooth','restore','paint','slope','terrace','ditch','road']) {
 const fixture=make().toWorld();fixture.terrain.edits=[{id:'setup',kind:'raise',center:[0,0],radius:24,amount:4,at:0}];
 const check=WorldSession.fromWorld(fixture);must(check.place('bomba',0,0,0));check.setEditorActive(true);
 const document=check.toWorld('2026-11-10T00:00:00.000Z'),version=check.saveVersion,analysis=check.analyze();
 const descriptor={kind,center:[0,0],radius:16,amount:kind==='paint'||kind==='smooth'||kind==='restore'||kind==='road'?1:kind==='slope'?30:kind==='terrace'?20:2,
  ...(kind==='paint'?{material:'sand'}:{}),
  ...(kind==='slope'||kind==='terrace'?{points:shapePoints,width:3,...(kind==='slope'?{grade:0}:{stepHeight:3})}:{}),
  ...(kind==='ditch'||kind==='road'?{points:[[-16,0],[16,0]],width:6,...(kind==='road'?{heights:[20,20]}:{})}:{})};
 must(check.previewTerrainOperation(descriptor));
 if(kind==='paint')assert.equal(check.terrainImpact,null);else assert.ok(check.terrainImpact?.entities.some(e=>e.id===check.entities[0].id),kind);
 assert.deepEqual(check.analyze(),analysis);assert.deepEqual(check.toWorld(document.updatedAt),document);check.abortStroke();
 assert.deepEqual(check.toWorld(document.updatedAt),document);assert.equal(check.saveVersion,version);
}
console.log('PASS impactos por herramienta: preview no altera la hidráulica confirmada, cancelar restaura documento y saveVersion; pintura no mueve instalaciones');
const paintedScience=WorldSession.fromWorld(w);paintedScience.setEditorActive(true);must(paintedScience.previewTerrainOperation({...op,kind:'paint',center:[0,0],material:'sand'}));must(paintedScience.commitStroke('keep'));paintedScience.setEditorActive(false);
const referenceScience=WorldSession.fromWorld(w);must(paintedScience.plant(rect.id,'tomate'));must(referenceScience.plant(rect.id,'tomate'));paintedScience.advance(86400);referenceScience.advance(86400);assert.deepEqual(paintedScience.entities,referenceScience.entities);
console.log('PASS pintura científica: un día de suelo y cultivo produce el mismo estado con y sin la capa visual');
