// Genera la biblioteca de prueba del constructor (usa el propio modelo, así las poses cumplen la geometría real). Salida: JSON por stdout.
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity} from '../src/industria/model/commands.ts';
import {findSnapCandidates} from '../src/industria/build/snap.ts';
import {snapMount} from '../src/industria/build/commands.ts';

const must = r => { if (!r.ok) throw new Error(r.error); return r.value; };
const pose = (x, y, z) => ({position: [x, y, z], rotation: [0, 0, 0]});
let p = newIndustryProject('Banco de montaje');
p = must(addEntity(p, {id: 'placa', definitionId: 'placa', label: 'Placa', pose: pose(0, 0, 0)}));
p = must(addEntity(p, {id: 'riel', definitionId: 'riel', label: 'Riel', pose: pose(0, 0.5, 0.06)}));
p = must(snapMount(p, findSnapCandidates(p, 'riel')[0]));
p = must(addEntity(p, {id: 'aparato', definitionId: 'aparato-din', label: 'Aparato', pose: pose(0.1, 0.5, 0.5)}));
p = must(addEntity(p, {id: 'bloqueA', definitionId: 'generico', label: 'Bloque A', pose: pose(2.5, 0, 0)}));
p = must(addEntity(p, {id: 'bloqueB', definitionId: 'generico', label: 'Bloque B', pose: pose(2.5, 0, 1.5)}));
process.stdout.write(JSON.stringify({projects: [p], active: p.id}));
