// Biblioteca con el ejemplo «marcha/paro con PLC» ya cargado (para pruebas de interfaz). Salida: JSON por stdout.
import {examplePlcStartStop} from '../src/industria/sim/examples.ts';
const p = examplePlcStartStop().value;
process.stdout.write(JSON.stringify({projects: [p], active: p.id}));
