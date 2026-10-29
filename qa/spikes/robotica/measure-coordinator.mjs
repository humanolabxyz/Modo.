// Mide cuántas veces más rápido que el tiempo real corre el coordinador completo (MCU + circuito + dispositivos) en Node. Uso: node qa/spikes/robotica/measure-coordinator.mjs
import fs from 'node:fs';
import {Coordinator} from '../../../src/robotics/sim/coordinator.ts';
import {buildRobot2wd, wireRobot2wd, withLedAnd9V} from '../../robotics/robot2wd.mjs';
const b = buildRobot2wd(), {project} = await withLedAnd9V({project: await wireRobot2wd(b), ids: b.ids}), rows = [];
for (const hex of ['blink_1000', 'hcsr04_read', 'motors_fwd', 'stuck_while1']) {
  const c = new Coordinator({project, targetId: b.ids.uno, hex: fs.readFileSync(new URL(`../../fixtures/robotica/${hex}.hex`, import.meta.url), 'utf8')});
  const t = performance.now(); c.advance(10e6); const ms = performance.now() - t; rows.push({programa: hex, ms: Math.round(ms), vezTiempoReal: +(10000 / ms).toFixed(1)}); console.log(hex.padEnd(14), `10 s virtuales en ${ms.toFixed(0)} ms → ${(10000 / ms).toFixed(1)}× el tiempo real`);
}
fs.writeFileSync(new URL('./results/e4-velocidad-coordinador.json', import.meta.url), JSON.stringify({maquina: 'AMD Ryzen 5 3600, Node 24', pasoCircuitoUs: 2000, rows}, null, 2));
