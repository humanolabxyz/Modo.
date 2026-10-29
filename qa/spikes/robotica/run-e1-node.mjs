// SPIKE E1 en Node (rendimiento de escritorio sin navegador). Requiere haber corrido run-e2.mjs (genera los .hex).
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
import {runAll} from './avr-harness.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'), dir = path.join(root, '.cache/spikes-robotica/hex');
const hex = Object.fromEntries(['blink', 'pwm_64', 'pwm_128', 'pwm_192', 'pulse', 'serial_adc', 'robot_like'].map(n => [n, fs.readFileSync(path.join(dir, n + '.hex'), 'utf8')]));
const r = runAll(hex);
fs.mkdirSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'results'), {recursive: true});
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'results/e1-node.json'), JSON.stringify(r, null, 2));
console.log(JSON.stringify(r, null, 1));
