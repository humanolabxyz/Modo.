// Proyecto resuelto de la actividad «Cablear un arranque directo» (para importarlo en la prueba de interfaz). Salida: texto .industria.json.
import {startActivity} from '../src/industria/activities/activities.ts';
import {exampleDirectStart} from '../src/industria/sim/examples.ts';
import {wire} from '../src/industria/wiring/commands.ts';
import {exportProject} from '../src/industria/model/library.ts';

let p = startActivity('arranque').value;
for (const c of exampleDirectStart().value.connections) { const r = wire(p, c.a, c.b); if (r.ok) p = r.value; }
process.stdout.write(exportProject(p).text);
