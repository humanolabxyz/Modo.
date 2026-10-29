// SPIKE E1+E3+E4 · Punto de entrada del Web Worker de prueba (se empaqueta con esbuild y se carga como Blob).
import {runAll} from './avr-harness.js';
import {scenarioRapier} from './rapier-harness.js';
self.onmessage = async e => {
  const {cmd} = e.data;
  try {
    if (cmd === 'e1') postMessage({cmd, result: runAll(e.data.hex)});
    else if (cmd === 'e3') postMessage({cmd, result: await scenarioRapier({seconds: e.data.seconds})});
  } catch (error) { postMessage({cmd, error: String((error && error.stack) || error)}); }
};
postMessage({cmd: 'ready'});
