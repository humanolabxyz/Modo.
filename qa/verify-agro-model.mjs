// Agro, Fase 0: contratos de mundo, entidades y puertos; validación y migración de archivos. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {newWorld, newSeed} from '../src/agro/model/defaults.ts';
import {parseWorld, parseWorldText, migrateWorld, exportWorld, OTHER_FORMATS} from '../src/agro/model/validate.ts';
import {checkPorts} from '../src/agro/model/ports.ts';
import {FORMAT, CURRENT_VERSION, LIMITS} from '../src/agro/model/types.ts';
import {newIndustryProject} from '../src/industria/model/defaults.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const clone = x => JSON.parse(JSON.stringify(x));
const rejects = (raw, pattern, name) => { const r = parseWorld(raw); assert.equal(r.ok, false, `${name}: debía rechazarse`); assert.match(r.error, pattern, `${name}: mensaje «${r.error}»`); ok(`rechaza: ${name}`); };

const hyd = (id, direction, d) => ({id, kind: 'hydraulic', direction, local: [0, 0, 0], normal: [0, 0, 1], spec: {diameterMm: d}});
const pwr = (id, direction, v = 400, phases = 3, current = 'ac') => ({id, kind: 'power', direction, local: [0, 0, 0], normal: [0, 1, 0], spec: {current, phases, voltage: v}});
const entity = (id, type, ports, extra = {}) => ({id, type, label: id, pose: {position: [0, 0, 0], rotation: [0, 0, 0]}, params: {}, ports, state: {}, lifecycle: 'installed', owner: 'player', ...extra});

// Formato y mundo vacío
const empty = newWorld('Granja de prueba', {seed: 1234, now: '2026-11-08T12:00:00.000Z'});
assert.equal(empty.format, 'modo-agro'); assert.equal(FORMAT, 'modo-agro'); assert.equal(empty.version, CURRENT_VERSION); assert.equal(empty.version, 1);
assert.equal(empty.terrain.sizeMeters[0] * empty.terrain.sizeMeters[1] / 10_000, empty.scenario.land.visibleHa);
assert.equal(empty.scenario.land.cultivatedHa, 0); assert.equal(empty.entities.length, 0);
assert.ok(parseWorld(empty).ok); ok('mundo vacío válido (100 ha visibles, 0 cultivadas)');
assert.ok(Number.isInteger(newSeed()) && newSeed() >= 0 && newSeed() <= 0x7fffffff); ok('semilla de 31 bits');

// Ida y vuelta de serialización: mismo contenido
const world = clone(empty);
world.entities = [
  entity('tanque1', 'estanque', [hyd('salida', 'out', 50)], {params: {capacidadL: 10000}}),
  entity('bomba1', 'bomba-centrifuga', [hyd('succion', 'in', 50), hyd('descarga', 'out', 40), pwr('alim', 'in')], {provenance: 'fictional', state: {encendida: false}}),
  entity('tubo1', 'tuberia', [hyd('a', 'bidirectional', 50), hyd('b', 'bidirectional', 50)]),
  entity('red1', 'red-trifasica', [pwr('l123', 'out')], {lifecycle: 'operating'}),
];
world.connections = [
  {id: 'c1', kind: 'hydraulic', a: {entityId: 'tanque1', portId: 'salida'}, b: {entityId: 'tubo1', portId: 'a'}, status: 'connected'},
  {id: 'c2', kind: 'hydraulic', a: {entityId: 'tubo1', portId: 'b'}, b: {entityId: 'bomba1', portId: 'succion'}, status: 'connected', route: [[1, 0, 2], [2, 0, 3]]},
  {id: 'c3', kind: 'power', a: {entityId: 'red1', portId: 'l123'}, b: {entityId: 'bomba1', portId: 'alim'}, status: 'draft'},
];
const parsed = parseWorld(world); assert.ok(parsed.ok, parsed.error);
const exported = exportWorld(parsed.value); assert.match(exported.filename, /\.modoagro\.json$/);
const again = parseWorldText(exported.text); assert.ok(again.ok, again.error);
assert.deepEqual(again.value, parsed.value); ok('exportar e importar conserva el mundo exactamente');

// Normalización: los campos desconocidos no sobreviven
const extra = clone(world); extra.hackeo = {x: 1}; extra.entities[0].oculto = true;
const clean = parseWorld(extra); assert.ok(clean.ok); assert.equal('hackeo' in clean.value, false); assert.equal('oculto' in clean.value.entities[0], false); ok('descarta campos desconocidos');

// Migración y formatos ajenos
assert.ok(migrateWorld(clone(empty)).ok); ok('migración de la versión vigente');
for (const [format, owner] of Object.entries(OTHER_FORMATS)) { const r = migrateWorld({format, version: 1}); assert.equal(r.ok, false); assert.match(r.error, new RegExp(owner)); }
ok('reconoce los formatos de otros módulos y dice dónde abrirlos');
const industria = parseWorld(JSON.parse(JSON.stringify(newIndustryProject('Planta')))); assert.equal(industria.ok, false); assert.match(industria.error, /Industria/); ok('un proyecto real de Industria se rechaza con mensaje claro');
rejects({format: 'otra-cosa', version: 1}, /no es un mundo de Agro/, 'formato desconocido');
rejects({format: FORMAT, version: 99}, /más nueva/, 'versión futura');
rejects({format: FORMAT, version: 0}, /versión válida/, 'versión inválida');
rejects(null, /no es un mundo/, 'null'); rejects([], /no es un mundo/, 'arreglo');
rejects({format: FORMAT}, /versión válida/, 'sin versión');

// Texto: tamaño y JSON
assert.equal(parseWorldText('{no es json').ok, false); assert.match(parseWorldText('{no es json').error, /JSON/); ok('rechaza JSON roto');
assert.equal(parseWorldText('x'.repeat(LIMITS.importBytes + 1)).ok, false); ok('rechaza archivos sobre el límite');

// Mundo
let w = clone(empty); w.experience = 'dios'; rejects(w, /experiencia/, 'experiencia desconocida');
w = clone(empty); w.name = ''; rejects(w, /nombre/, 'nombre vacío');
w = clone(empty); w.createdAt = 'ayer'; rejects(w, /fechas/, 'fecha inválida');
w = clone(empty); w.id = '__proto__'; rejects(w, /id válido/, 'id peligroso');
w = clone(empty); w.scenario.land.cultivatedHa = 5; rejects(w, /coherentes/, 'cultivado mayor que administrado (no se confunden superficies)');
w = clone(empty); w.scenario.land.authorizedHa = 101; rejects(w, /coherentes/, 'autorizado mayor que lo visible');
w = clone(empty); w.scenario.land.visibleHa = -1; rejects(w, /inválida/, 'superficie negativa');
w = clone(empty); w.terrain.sizeMeters = [0, 1000]; rejects(w, /tamaño del terreno/, 'terreno de tamaño cero');
w = clone(empty); w.terrain.sizeMeters = [LIMITS.maxSideMeters + 1, 1000]; rejects(w, /tamaño del terreno/, 'terreno gigante');
w = clone(empty); w.terrain.seed = 1.5; rejects(w, /semilla/, 'semilla no entera');
w = clone(empty); w.terrain.cellMeters = 0.01; rejects(w, /celda/, 'celda diminuta');
w = clone(empty); w.terrain.edits = [{id: 'e1', kind: 'raise', center: [10, 10], radius: -1, amount: 1, at: 0}]; rejects(w, /fuera de rango/, 'edición con radio negativo');
w = clone(empty); w.terrain.edits = [{id: 'e1', kind: 'explotar', center: [10, 10], radius: 1, amount: 1, at: 0}]; rejects(w, /inválida/, 'edición de tipo desconocido');
w = clone(empty); w.clock.speed = 3; rejects(w, /velocidad/, 'velocidad no permitida');
w = clone(empty); w.clock.simSeconds = -5; rejects(w, /tiempo simulado/, 'tiempo negativo');
w = clone(empty); w.clock.startDate = 'nunca'; rejects(w, /fecha de inicio/, 'fecha simulada inválida');
w = clone(empty); w.clock.seed = -1; rejects(w, /semilla de simulación/, 'semilla de simulación negativa');
w = clone(empty); w.entities = 'no'; rejects(w, /componentes/, 'entidades que no son lista');

// Entidades y puertos
w = clone(world); w.entities.push(clone(w.entities[0])); rejects(w, /mismo id/, 'id de entidad repetido (una pieza no existe dos veces)');
w = clone(world); w.entities[0].pose.position = [0, NaN, 0]; rejects(w, /pose/, 'pose con NaN');
w = clone(world); w.entities[0].pose.position = [0, Infinity, 0]; w = JSON.parse(JSON.stringify(w)); rejects(w, /pose/, 'pose con Infinity (serializado como null)');
w = clone(world); w.entities[0].lifecycle = 'volando'; rejects(w, /ciclo de vida/, 'ciclo de vida desconocido');
w = clone(world); w.entities[0].owner = ''; rejects(w, /propietario/, 'sin propietario');
w = clone(world); w.entities[0].type = ''; rejects(w, /tipo/, 'sin tipo');
w = clone(world); w.entities[1].ports.push(hyd('succion', 'in', 50)); rejects(w, /repetido/, 'puerto repetido en una entidad');
w = clone(world); w.entities[0].ports[0].kind = 'magico'; rejects(w, /tipo de puerto/, 'tipo de puerto desconocido');
w = clone(world); w.entities[0].ports[0].direction = 'lateral'; rejects(w, /dirección/, 'dirección de puerto desconocida');
w = clone(world); w.entities[0].ports[0].normal = [0, 0, 5]; rejects(w, /unitario/, 'normal no unitaria');
w = clone(world); w.entities[0].ports[0].spec.diameterMm = -50; rejects(w, /diámetro/, 'diámetro negativo');
w = clone(world); w.entities[3].ports[0].spec.phases = 2; rejects(w, /fases/, 'fases inválidas');
w = clone(world); w.entities[3].ports[0].spec.voltage = 0; rejects(w, /tensión/, 'tensión cero');
w = clone(world); w.entities[0].params = {'__proto__': 1}; w.entities[0].params = JSON.parse('{"__proto__": 1}'); rejects(w, /nombre de propiedad inválido/, 'propiedad __proto__');
w = clone(world); w.entities[0].params = {a: {b: 1}}; rejects(w, /valor inválido/, 'parámetro anidado');
w = clone(world); w.entities[0].ports = Array.from({length: LIMITS.portsPerEntity + 1}, (_, i) => hyd('p' + i, 'in', 50)); rejects(w, /puertos/, 'demasiados puertos');

// Conexiones
w = clone(world); w.connections.push({...clone(w.connections[0]), id: 'c9', a: {entityId: 'fantasma', portId: 'x'}}); rejects(w, /no existe/, 'conexión a un componente inexistente');
w = clone(world); w.connections[0].b.portId = 'inexistente'; rejects(w, /puerto «inexistente» no existe/, 'conexión a un puerto inexistente');
w = clone(world); w.connections[0].kind = 'power'; rejects(w, /no es de tipo power/, 'tipo de conexión distinto del puerto');
w = clone(world); w.connections.push({...clone(w.connections[0]), id: 'c1'}); rejects(w, /mismo id/, 'id de conexión repetido');
w = clone(world); w.connections.push({...clone(w.connections[0]), id: 'c9', a: clone(w.connections[0].b), b: clone(w.connections[0].a)}); rejects(w, /repite una unión/, 'unión duplicada en sentido inverso');
w = clone(world); w.connections[0].a = clone(w.connections[0].b); rejects(w, /consigo mismo/, 'puerto unido consigo mismo');
w = clone(world); w.connections[0].status = 'cerrada'; rejects(w, /estado desconocido/, 'estado de conexión desconocido');
w = clone(world); w.connections[0].route = new Array(LIMITS.route + 1).fill([0, 0, 0]); rejects(w, /ruta/, 'ruta demasiado larga');
// Una unión física incompatible se rechaza; la misma unión como borrador es válida y queda marcada
w = clone(world); w.entities[2].ports[0].spec.diameterMm = 25;
rejects(w, /figura como «connected»[^]*adaptador/, 'unión «connected» con diámetros distintos (falta adaptador)');
w.connections[0].status = 'incompatible'; w.connections[0].reason = 'Diámetros distintos'; assert.ok(parseWorld(w).ok); ok('la misma unión se acepta como «incompatible» con su motivo');

// Compatibilidad de puertos (con motivo legible)
const h50out = hyd('a', 'out', 50), h50in = hyd('b', 'in', 50), h40in = hyd('c', 'in', 40), h50bi = hyd('d', 'bidirectional', 50);
assert.ok(checkPorts(h50out, h50in).ok); assert.ok(checkPorts(h50out, h50bi).ok); assert.ok(checkPorts(h50bi, h50bi).ok); ok('hidráulico: salida→entrada y bidireccional compatibles');
let r = checkPorts(h50out, h40in); assert.equal(r.ok, false); assert.match(r.error, /50 mm y 40 mm.*adaptador/); ok('hidráulico: diámetros distintos explican el motivo');
r = checkPorts(h50out, hyd('e', 'out', 50)); assert.match(r.error, /salida.*no se pueden unir/); r = checkPorts(h50in, hyd('f', 'in', 50)); assert.match(r.error, /entrada/); ok('dos salidas o dos entradas no se unen');
r = checkPorts(h50out, pwr('p', 'in')); assert.match(r.error, /hidráulico.*de potencia/); ok('tipos distintos no se unen');
assert.ok(checkPorts(pwr('a', 'out'), pwr('b', 'in')).ok); assert.match(checkPorts(pwr('a', 'out'), pwr('b', 'in', 230)).error, /tensiones/); assert.match(checkPorts(pwr('a', 'out'), pwr('b', 'in', 400, 1)).error, /fases/); assert.match(checkPorts(pwr('a', 'out'), pwr('b', 'in', 400, 3, 'dc')).error, /alterna.*continua/);
assert.ok(checkPorts(pwr('a', 'out', 400.5), pwr('b', 'in', 400)).ok); ok('potencia: tensión, fases y tipo de corriente');
const sig = (id, direction, signal, level) => ({id, kind: 'signal', direction, local: [0, 0, 0], normal: [0, 1, 0], spec: {signal, ...(level ? {level} : {})}});
assert.ok(checkPorts(sig('a', 'out', 'digital', '24V'), sig('b', 'in', 'digital', '24V')).ok); assert.match(checkPorts(sig('a', 'out', 'digital'), sig('b', 'in', 'analog')).error, /señales/); assert.match(checkPorts(sig('a', 'out', 'digital', '24V'), sig('b', 'in', 'digital', '5V')).error, /niveles/); ok('señal: tipo y nivel');
const mech = (id, mount) => ({id, kind: 'mechanical', direction: 'bidirectional', local: [0, 0, 0], normal: [0, 1, 0], spec: {mount}});
assert.ok(checkPorts(mech('a', 'din'), mech('b', 'din')).ok); assert.match(checkPorts(mech('a', 'din'), mech('b', 'suelo')).error, /montajes/); ok('mecánico: tipo de montaje');

// Límite de cantidad
w = clone(empty); w.entities = Array.from({length: LIMITS.entities + 1}, (_, i) => entity('e' + i, 't', [])); rejects(w, /componentes/, 'demasiados componentes');

console.log(`\n${n} comprobaciones OK`);
