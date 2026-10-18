import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import {readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[p]});
/** Política por página: solo scripts propios y los bloques inline exactos generados por Astro. */
const protectStaticPages=()=>({name:'humano-static-security',hooks:{'astro:build:done':({dir})=>{
 const root=fileURLToPath(dir);
 for(const file of walk(root).filter(file=>file.endsWith('.html'))){
  const html=readFileSync(file,'utf8');
  const hashes=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
   .filter(([,attrs,body])=>!(/\bsrc\s*=/i.test(attrs))&&body.trim())
   .map(([, ,body])=>`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  const policy=["default-src 'self'",`script-src 'self' ${[...new Set(hashes)].join(' ')}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self'","connect-src 'self'","worker-src 'self' blob:","media-src 'self' blob: data:","frame-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'"].join('; ');
  writeFileSync(file,html.replace(/<head>/i,`<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`));
 }
 // Se entregan los avisos completos de los componentes principales y del runtime de React.
 const packages=['astro','@astrojs/react','react','react-dom','scheduler','lucide-react'];
 const notices=packages.map(name=>{
  const folder=join('node_modules',name),info=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));
  const license=['LICENSE','LICENSE.md','LICENSE.txt'].find(name=>{try{return statSync(join(folder,name)).isFile()}catch{return false}});
  if(!license)throw new Error(`Falta licencia de ${name}`);
  return `${name} ${info.version}\n${readFileSync(join(folder,license),'utf8')}`;
 });
 writeFileSync(join(root,'THIRD_PARTY_NOTICES.txt'),'modo. / PanelLab — Humano Lab\nAvisos de componentes principales; sus licencias conservan plena vigencia.\nLas tipografías conservan sus avisos en /fonts/.\n\n'+notices.join('\n\n========================================\n\n'));
}}});
/** Rellena __BUILD__ y __PRECACHE__ en dist/sw.js con los archivos reales del build. */
const stampServiceWorker=()=>({name:'panellab-stamp-sw',hooks:{'astro:build:done':({dir})=>{
 const root=fileURLToPath(dir),sw=join(root,'sw.js');
 const urls=walk(root).map(p=>'/'+relative(root,p).split('\\').join('/')).filter(u=>u.startsWith('/_astro/')||/^\/(?:index\.html|estudio\/index\.html|laboratorio\/index\.html|legal\/index\.html)$/.test(u)||/^\/(?:brand\/|references\/|images\/modo\/)/.test(u)||/^\/fonts\/[^/]+\.woff2$/.test(u)||/^\/fonts\/.*LICENSE\.(?:txt|md)$/.test(u)||u==='/THIRD_PARTY_NOTICES.txt'||u==='/panel-model.json'||u==='/manifest.webmanifest').map(u=>u==='/index.html'?'/':u.replace(/\/index\.html$/,'/'));
 const body=readFileSync(sw,'utf8').replace('__BUILD__',Date.now().toString(36)).replace('__PRECACHE__',JSON.stringify([...new Set(urls)]));
 writeFileSync(sw,body);
}}});
export default defineConfig({integrations:[react(),protectStaticPages(),stampServiceWorker()],output:'static',devToolbar:{enabled:false}});
