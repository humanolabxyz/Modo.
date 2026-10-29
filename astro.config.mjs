import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import {readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[p]});
/** Scripts propios y hashes de Astro; el marco de GeoGebra tiene su propia política. */
const protectStaticPages=()=>({name:'humano-static-security',hooks:{'astro:build:done':({dir})=>{
 const root=fileURLToPath(dir);
 for(const file of walk(root).filter(file=>file.endsWith('.html'))){
  const html=readFileSync(file,'utf8');
  const hashes=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
   .filter(([,attrs,body])=>!(/\bsrc\s*=/i.test(attrs))&&body.trim())
   .map(([, ,body])=>`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  const isGeoGebraFrame=relative(root,file).split('\\').join('/')==='geogebra-frame.html';
  // La aplicación conserva su CSP estricta. Solo el documento del motor externo
  // permite descargar los recursos oficiales de GeoGebra.
  const policy=(isGeoGebraFrame?[
   "default-src 'self'", "script-src 'self' https://www.geogebra.org https://cdn.geogebra.org 'unsafe-inline' 'wasm-unsafe-eval'",
   "style-src 'self' 'unsafe-inline' https://www.geogebra.org https://cdn.geogebra.org https://fonts.googleapis.com",
   "img-src 'self' data: blob: https://www.geogebra.org https://cdn.geogebra.org", "font-src 'self' data: https://www.geogebra.org https://cdn.geogebra.org https://fonts.gstatic.com",
   "connect-src 'self' data: blob: https://www.geogebra.org https://cdn.geogebra.org https://api.geogebra.org", "worker-src 'self' blob: https://www.geogebra.org https://cdn.geogebra.org",
   "frame-src 'self' blob: https://www.geogebra.org https://accounts.geogebra.org", "object-src 'none'", "base-uri 'self'", "form-action 'self' https://www.geogebra.org"
  ]:["default-src 'self'",`script-src 'self' ${[...new Set(hashes)].join(' ')}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self'","connect-src 'self'","worker-src 'self' blob:","media-src 'self' blob: data:","frame-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'"]).join('; ');
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
 const files=walk(root).filter(p=>{const name=relative(root,p).split('\\').join('/');return !['sw.js','offline-assets.json'].includes(name)&&!/^vendor\/geogebra\/HTML5\/5\.0\/(web|webSimple)\//.test(name)});
 const assets=files.map(p=>({url:('/'+relative(root,p).split('\\').join('/')).replace(/\/index\.html$/,'/'),bytes:statSync(p).size}));
 const urls=assets.map(a=>a.url).filter(u=>u.startsWith('/_astro/')||u==='/'||/^\/(?:estudio|laboratorio|legal|comunidad|versiones|sin-conexion)\/$/.test(u)||/^\/(?:brand\/(?!og-)(?!.*\.(?:mp4|jpg)$)|references\/|images\/home-approved\/|icons\/)/.test(u)||/^\/fonts\/[^/]+\.woff2$/.test(u)||/^\/fonts\/.*LICENSE\.(?:txt|md)$/.test(u)||['/THIRD_PARTY_NOTICES.txt','/panel-model.json','/manifest.webmanifest','/geogebra-frame.html'].includes(u));
 const hash=createHash('sha256');for(const file of files){hash.update(relative(root,file));hash.update(readFileSync(file));}const build=hash.digest('hex').slice(0,16);
 writeFileSync(join(root,'offline-assets.json'),JSON.stringify({version:1,build,bytes:assets.reduce((sum,a)=>sum+a.bytes,0),assets}));
 const body=readFileSync(sw,'utf8').replace('__BUILD__',build).replace('__PRECACHE__',JSON.stringify([...new Set([...urls,'/offline-assets.json'])]));
 writeFileSync(sw,body);
}}});
export default defineConfig({integrations:[react(),protectStaticPages(),stampServiceWorker()],output:'static',devToolbar:{enabled:false}});
