// Biblioteca de prueba del cableado: fuente, contactor y motor sueltos, a la vista de una cámara cercana. Salida: JSON por stdout.
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity} from '../src/industria/model/commands.ts';
const must = r => { if (!r.ok) throw new Error(r.error); return r.value; };
const pose = (x, y, z) => ({position: [x, y, z], rotation: [0, 0, 0]});
let p = newIndustryProject('Cableado de prueba');
p = must(addEntity(p, {id: 'fuente', definitionId: 'fuente-cc', label: 'Fuente', pose: pose(-0.1, 0.5, 0)}));
p = must(addEntity(p, {id: 'km1', definitionId: 'contactor-3p', label: 'KM1', pose: pose(0.1, 0.5, 0)}));
p = must(addEntity(p, {id: 'motor', definitionId: 'motor-3p', label: 'M1', pose: pose(0.5, 0, 0)}));
process.stdout.write(JSON.stringify({projects: [p], active: p.id}));
