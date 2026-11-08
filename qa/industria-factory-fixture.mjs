// Biblioteca con el ejemplo «línea de producción» ya cargado (para pruebas de interfaz). Salida: JSON por stdout.
import {exampleMiniFactory} from '../src/industria/sim/examples.ts';
const p = exampleMiniFactory().value;
process.stdout.write(JSON.stringify({projects: [p], active: p.id}));
