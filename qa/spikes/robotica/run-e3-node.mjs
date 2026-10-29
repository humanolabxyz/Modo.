// SPIKE E3 en Node: rendimiento, estabilidad y determinismo de Rapier sin navegador.
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
import {scenarioRapier} from './rapier-harness.js';
const here = path.dirname(fileURLToPath(import.meta.url));
const r = await scenarioRapier({seconds: 60});
fs.mkdirSync(path.join(here, 'results'), {recursive: true});
fs.writeFileSync(path.join(here, 'results/e3-node.json'), JSON.stringify(r, null, 2));
console.log(JSON.stringify(r, null, 1));
