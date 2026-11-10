import assert from 'node:assert/strict';
import {EXPERIENCE_POLICIES,experiencePolicy} from '../src/agro/world/experience.ts';
import {learningChecks} from '../src/agro/world/learning.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {exportWorld,parseWorldText} from '../src/agro/model/validate.ts';
import {inConstruction,START_MONEY} from '../src/agro/economy/economy.ts';
import {TERRAIN_ISSUE} from '../src/agro/world/pipeElevation.ts';
const must=r=>{assert.ok(r.ok,r.error);return r.value;};
const setup=experience=>({name:'Experiencias QA',seed:31,territory:'free',side:400,template:'blank',site:'center',relief:'natural',radius:30,resources:[],water:80,experience,start:'2026-09-21'});
for(const mode of ['learning','free','real']){
 const p=experiencePolicy(mode);assert.equal(p,EXPERIENCE_POLICIES[mode]);assert.ok(Object.isFrozen(p));
 assert.equal(p.inventory,mode==='real');assert.equal(p.chargeCosts,mode==='real');assert.equal(p.constructionTime,mode==='real');assert.equal(p.guidedChecks,mode==='learning');
 const s=WorldSession.fromWorld(must(createConfiguredWorld(setup(mode))));assert.equal(s.experience,mode);
 assert.equal(s.stockOf('bomba'),mode==='real'?0:Infinity);
 if(mode==='real'){assert.equal(s.economy.money,START_MONEY);assert.equal(s.place('bomba',0,0,0).ok,false);}
 else{const p=must(s.place('bomba',0,0,0));assert.equal(inConstruction(p),false);assert.equal(s.economy,null);assert.equal(s.buy('bomba',1).ok,false);}
}
console.log('PASS tres políticas inmutables, creación en cada experiencia, aprendizaje/libre inmediatos y real con inventario');
const s=WorldSession.fromWorld(must(createConfiguredWorld(setup('free'))));
s.beginStroke();must(s.stamp('raise',40,40,8,5));s.endStroke();must(s.place('parcela',-30,-30,0));
const before=s.toWorld(),checksum=s.terrain.checksum(),id=s.id;
for(const mode of ['learning','real','free','learning'])must(s.setExperience(mode));
const after=s.toWorld();for(const field of ['terrain','entities','connections','plc','clock','scenario'])assert.deepEqual(after[field],before[field],field);
assert.equal(s.id,id);assert.equal(s.terrain.checksum(),checksum);assert.equal(s.economy.money,START_MONEY);
const restored=WorldSession.fromWorld(must(parseWorldText(exportWorld(after).text)));assert.equal(restored.id,id);assert.equal(restored.experience,'learning');assert.equal(restored.terrain.checksum(),checksum);
console.log('PASS cambiar libre → aprendizaje → real → libre → aprendizaje conserva ID, terreno editado, entidades, conexiones, PLC, reloj y archivo');
must(s.setExperience('real'));must(s.buy('bomba',1));const money=s.economy.money;s.advance(3*86400);
const pump=must(s.place('bomba',0,0,0));assert.ok(inConstruction(s.entity(pump.id)));const spent=s.economy.money;
must(s.setExperience('learning'));assert.equal(inConstruction(s.entity(pump.id)),false);must(s.place('bomba',20,0,0));assert.equal(s.economy.money,spent);
must(s.setExperience('real'));assert.equal(s.economy.money,spent);assert.ok(spent<money);assert.equal(s.economy.orders.length,1);
console.log('PASS compras, entregas y montaje reales; aprendizaje termina obras, permite piezas gratuitas y conserva fondos/pedidos al volver');
must(s.setExperience('learning'));s.setEditorActive(true);must(s.previewTerrainOperation({kind:'smooth',center:[40,40],radius:10,amount:1}));assert.equal(s.setExperience('real').ok,false);s.abortStroke();
must(s.previewPolygonParcel([[50,50],[60,50],[60,60],[50,60]]));assert.equal(s.setExperience('free').ok,false);s.abortStroke();assert.equal(s.setExperience('desconocido').ok,false);assert.equal(s.experience,'learning');
console.log('PASS los cambios de experiencia no atraviesan previsualizaciones pendientes; modo desconocido rechazado');
const empty=WorldSession.fromWorld(must(createConfiguredWorld(setup('learning'))));
const snap=JSON.stringify(empty.toWorld('2026-11-10T00:00:00.000Z')),version=empty.saveVersion;
for(let i=0;i<3;i++){const checks=learningChecks(empty);assert.equal(checks.find(c=>c.id==='equipment').status,'todo');assert.equal(checks.find(c=>c.id==='power').status,'todo');}
assert.equal(JSON.stringify(empty.toWorld('2026-11-10T00:00:00.000Z')),snap);assert.equal(empty.saveVersion,version);
const p=must(empty.place('bomba',0,0,0));assert.ok(learningChecks(empty).find(c=>c.id==='power').detail.length);
const impacted=empty.toWorld();impacted.entities.find(e=>e.id===p.id).state[TERRAIN_ISSUE]='Revisar apoyo';
const withIssue=WorldSession.fromWorld(impacted);
assert.equal(learningChecks(withIssue).find(c=>c.id==='support').status,'review');assert.equal(learningChecks(withIssue).find(c=>c.id==='support').entityId,p.id);
console.log('PASS guía derivada sin escrituras ni progreso artificial, causas del motor, avisos de apoyo y construcción no bloqueante');
const farm=WorldSession.fromWorld(must(createConfiguredWorld({...setup('learning'),territory:'valley',relief:'level',radius:60,template:'farm',resources:['parcel','irrigation']})));
const status=id=>learningChecks(farm).find(c=>c.id===id).status;
const board=farm.entities.find(e=>e.type==='tablero'),parcel=farm.entities.find(e=>e.type==='parcela');
assert.equal(status('equipment'),'ready');assert.equal(status('power'),'todo');assert.equal(status('water'),'todo');
must(farm.setState(board.id,'interruptor',true));assert.equal(status('power'),'ready');assert.equal(status('water'),'ready');
must(farm.plant(parcel.id,'tomate'));assert.equal(status('crop'),'ready');
const started=farm.toWorld();for(const mode of ['free','real','learning'])must(farm.setExperience(mode));
assert.deepEqual(farm.toWorld().connections,started.connections);assert.deepEqual(farm.toWorld().entities,started.entities);
assert.equal(status('power'),'ready');assert.equal(status('water'),'ready');assert.equal(status('crop'),'ready');
must(farm.setState(board.id,'interruptor',false));assert.equal(status('power'),'todo');assert.equal(status('water'),'todo');
console.log('PASS guía reacciona a encender/apagar riego y sembrar; cambiar experiencia conserva red conectada y cultivo vivo');
