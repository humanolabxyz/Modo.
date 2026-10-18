import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import {readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[p]});
/** Rellena __BUILD__ y __PRECACHE__ en dist/sw.js con los archivos reales del build. */
const stampServiceWorker=()=>({name:'panellab-stamp-sw',hooks:{'astro:build:done':({dir})=>{
 const root=fileURLToPath(dir),sw=join(root,'sw.js');
 const urls=walk(root).map(p=>'/'+relative(root,p).split('\\').join('/')).filter(u=>u!=='/sw.js'&&!u.endsWith('.map')).map(u=>u==='/index.html'?'/':u.replace(/\/index\.html$/,'/'));
 const body=readFileSync(sw,'utf8').replace('__BUILD__',Date.now().toString(36)).replace('__PRECACHE__',JSON.stringify([...new Set(urls)]));
 writeFileSync(sw,body);
}}});
export default defineConfig({integrations:[react(),stampServiceWorker()],output:'static',devToolbar:{enabled:false}});
