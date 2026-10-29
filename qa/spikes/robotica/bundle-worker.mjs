// Empaqueta el worker de los spikes (IIFE minificado) y mide el peso gzip de cada pieza.
import {build} from 'esbuild'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib'; import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../../..'), out = path.join(root, '.cache/spikes-robotica');
fs.mkdirSync(out, {recursive: true});
const sizes = {};
const bundle = async (name, entry) => {
  const file = path.join(out, name + '.js');
  await build({entryPoints: [entry], bundle: true, minify: true, format: 'iife', platform: 'browser', outfile: file, logLevel: 'error', loader: {'.wasm': 'binary'}});
  const buf = fs.readFileSync(file); sizes[name] = {kB: +(buf.length / 1024).toFixed(1), gzipKB: +(zlib.gzipSync(buf, {level: 9}).length / 1024).toFixed(1), brotliKB: +(zlib.brotliCompressSync(buf).length / 1024).toFixed(1)};
};
await bundle('worker', path.join(here, 'worker-main.js'));
await bundle('solo-avr8js', path.join(here, 'size-avr.js'));
await bundle('solo-rapier', path.join(here, 'size-rapier.js'));
fs.writeFileSync(path.join(here, 'results/pesos.json'), JSON.stringify(sizes, null, 2)); console.log(sizes);
