import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import {readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {roboticaCompiler} from './scripts/robotica-compile-service.mjs';
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
  // Robótica ejecuta WebAssembly (Rapier, avr8js en etapas siguientes): solo esa página añade 'wasm-unsafe-eval'.
  const isRobotics=relative(root,file).split('\\').join('/')==='robotica/index.html';
  // La aplicación conserva su CSP estricta. Solo el documento del motor externo
  // permite descargar los recursos oficiales de GeoGebra.
  const policy=(isGeoGebraFrame?[
   "default-src 'self'", "script-src 'self' https://www.geogebra.org https://cdn.geogebra.org 'unsafe-inline' 'wasm-unsafe-eval'",
   "style-src 'self' 'unsafe-inline' https://www.geogebra.org https://cdn.geogebra.org https://fonts.googleapis.com",
   "img-src 'self' data: blob: https://www.geogebra.org https://cdn.geogebra.org", "font-src 'self' data: https://www.geogebra.org https://cdn.geogebra.org https://fonts.gstatic.com",
   "connect-src 'self' data: blob: https://www.geogebra.org https://cdn.geogebra.org https://api.geogebra.org", "worker-src 'self' blob: https://www.geogebra.org https://cdn.geogebra.org",
   "frame-src 'self' blob: https://www.geogebra.org https://accounts.geogebra.org", "object-src 'none'", "base-uri 'self'", "form-action 'self' https://www.geogebra.org"
  ]:["default-src 'self'",`script-src 'self' ${isRobotics?"'wasm-unsafe-eval' ":''}${[...new Set(hashes)].join(' ')}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self'","connect-src 'self'","worker-src 'self' blob:","media-src 'self' blob: data:","frame-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'"]).join('; ');
  writeFileSync(file,html.replace(/<head>/i,`<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`));
 }
 // Se entregan los avisos completos de los componentes principales y del runtime de React.
 const packages=['astro','@astrojs/react','react','react-dom','scheduler','lucide-react','three','@react-three/fiber','@react-three/drei','avr8js','codemirror','@codemirror/state','@codemirror/view','@codemirror/lint','@codemirror/language','@codemirror/commands','@codemirror/autocomplete','@codemirror/search','@codemirror/lang-cpp','@lezer/cpp','@lezer/common','@lezer/highlight','@lezer/lr','style-mod','w3c-keyname','crelt','@marijn/find-cluster-break'];
 const notices=packages.map(name=>{
  const folder=join('node_modules',name),info=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));
  const license=['LICENSE','LICENSE.md','LICENSE.txt'].find(name=>{try{return statSync(join(folder,name)).isFile()}catch{return false}});
  // @react-three/fiber no incluye un archivo de licencia en su paquete: se deja constancia de la licencia que declara.
  if(!license&&!info.license)throw new Error(`Falta licencia de ${name}`);
  return `${name} ${info.version}\n${license?readFileSync(join(folder,license),'utf8'):`Licencia declarada en package.json: ${info.license}. El paquete publicado no incluye el archivo de licencia.`}`;
 });
 writeFileSync(join(root,'THIRD_PARTY_NOTICES.txt'),'modo. / PanelLab — Humano Lab\nAvisos de componentes principales; sus licencias conservan plena vigencia.\nLas tipografías conservan sus avisos en /fonts/.\n\n'+notices.join('\n\n========================================\n\n'));
}}});
/** Rellena __BUILD__ y __PRECACHE__ en dist/sw.js con los archivos reales del build. */
/** Archivos de /_astro/ que solo alcanza /robotica/ (three, R3F, drei…): no se precachean, se guardan al visitar la página. */
const roboticsOnlyChunks=(root,files)=>{
 const byUrl=new Map(files.map(p=>['/'+relative(root,p).split('\\').join('/'),p]));
 const reach=starts=>{
  const seen=new Set(),queue=[...starts];
  while(queue.length){
   const url=queue.pop();if(seen.has(url)||!byUrl.has(url))continue;seen.add(url);
   const text=readFileSync(byUrl.get(url),'utf8');
   for(const m of text.matchAll(/["'(`]((?:\.{1,2}\/|\/?_astro\/)[^"'()`\s]+\.(?:js|mjs))["')`]/g)){
    queue.push(m[1].startsWith('/')?m[1]:m[1].startsWith('_astro/')?'/'+m[1]:'/_astro/'+m[1].replace(/^(?:\.{1,2}\/)+/,''));
   }
  }
  return seen;
 };
 const entries=page=>{const f=byUrl.get(page);if(!f)return [];return [...readFileSync(f,'utf8').matchAll(/(?:src|href|component-url|renderer-url)="(\/_astro\/[^"]+\.js)"/g)].map(m=>m[1])};
 const others=reach([...byUrl.keys()].filter(u=>u.endsWith('.html')&&!u.startsWith('/robotica/')).flatMap(entries));
 return new Set([...reach(entries('/robotica/index.html'))].filter(u=>!others.has(u)));
};
const stampServiceWorker=()=>({name:'panellab-stamp-sw',hooks:{'astro:build:done':({dir})=>{
 const root=fileURLToPath(dir),sw=join(root,'sw.js');
 const files=walk(root).filter(p=>{const name=relative(root,p).split('\\').join('/');return !['sw.js','offline-assets.json'].includes(name)&&!/^vendor\/geogebra\/HTML5\/5\.0\/(web|webSimple)\//.test(name)});
 const assets=files.map(p=>({url:('/'+relative(root,p).split('\\').join('/')).replace(/\/index\.html$/,'/'),bytes:statSync(p).size}));
 const roboticsOnly=roboticsOnlyChunks(root,files);
 const urls=assets.map(a=>a.url).filter(u=>!roboticsOnly.has(u)).filter(u=>u.startsWith('/_astro/')||u==='/'||/^\/(?:estudio|laboratorio|robotica|legal|comunidad|versiones|sin-conexion)\/$/.test(u)||/^\/(?:brand\/(?!og-)(?!.*\.(?:mp4|jpg)$)|references\/|images\/home-approved\/|icons\/)/.test(u)||/^\/fonts\/[^/]+\.woff2$/.test(u)||/^\/fonts\/.*LICENSE\.(?:txt|md)$/.test(u)||['/THIRD_PARTY_NOTICES.txt','/panel-model.json','/manifest.webmanifest','/geogebra-frame.html'].includes(u));
 const hash=createHash('sha256');for(const file of files){hash.update(relative(root,file));hash.update(readFileSync(file));}const build=hash.digest('hex').slice(0,16);
 writeFileSync(join(root,'offline-assets.json'),JSON.stringify({version:1,build,bytes:assets.reduce((sum,a)=>sum+a.bytes,0),assets}));
 const body=readFileSync(sw,'utf8').replace('__BUILD__',build).replace('__PRECACHE__',JSON.stringify([...new Set([...urls,'/offline-assets.json'])]));
 writeFileSync(sw,body);
}}});
export default defineConfig({integrations:[react(),protectStaticPages(),stampServiceWorker(),roboticaCompiler()],output:'static',devToolbar:{enabled:false}});
