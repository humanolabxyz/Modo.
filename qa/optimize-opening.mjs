import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';
const backup='qa/performance-opening/before-source';
function edit(file,from,to){let body=fs.readFileSync(file,'utf8');if(!body.includes(from))throw Error('Patch anchor missing: '+file);fs.writeFileSync(file,body.replace(from,to))}
fs.writeFileSync('public/sw.js',"/* modo. — Offline essentials; large course media are cached when used. */\nconst BUILD='__BUILD__';\nconst CACHE=`panellab-${BUILD}`;\nconst PRECACHE=__PRECACHE__;\nconst NAVIGATION_TIMEOUT=2000;\nself.addEventListener('install',event=>{\n event.waitUntil((async()=>{\n  const cache=await caches.open(CACHE),pending=[...PRECACHE];\n  // Bound background downloads so installation does not flood a slow connection.\n  await Promise.all(Array.from({length:3},async()=>{while(pending.length)await cache.add(pending.shift())}));\n  await self.skipWaiting();\n })());\n});\nself.addEventListener('activate',event=>{\n event.waitUntil((async()=>{\n  await Promise.all((await caches.keys()).filter(key=>key.startsWith('panellab-')&&key!==CACHE).map(key=>caches.delete(key)));\n  await self.clients.claim();\n })());\n});\nfunction pageKey(url){\n const path=url.pathname.replace(/\\/index\\.html$/,'/').replace(/\\/+$/,'')||'/';\n return path==='/'?'/':path==='/estudio'||path==='/laboratorio'?path+'/':null;\n}\nself.addEventListener('fetch',event=>{\n const request=event.request;if(request.method!=='GET')return;\n const url=new URL(request.url);if(url.origin!==location.origin)return;\n if(request.mode==='navigate'){\n  event.respondWith((async()=>{\n   const cache=await caches.open(CACHE),key=pageKey(url)||request,cached=await cache.match(key);\n   const network=fetch(request).then(async response=>{\n    // PDFs and other documents keep their own key; never replace the home page.\n    if(response.status===200)await cache.put(key,response.clone());\n    return response;\n   });\n   event.waitUntil(network.then(()=>{},()=>{}));\n   if(!cached)return network;\n   let timer;\n   try{return await Promise.race([network.catch(()=>cached),new Promise(resolve=>{timer=setTimeout(()=>resolve(cached),NAVIGATION_TIMEOUT)})])}\n   finally{clearTimeout(timer)}\n  })());\n  return;\n }\n event.respondWith((async()=>{\n  const cache=await caches.open(CACHE),cached=await cache.match(request);\n  if(cached)return cached;\n  const response=await fetch(request);\n  if(response.status===200)event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));\n  return response;\n })());\n});\n");
edit('astro.config.mjs',".filter(u=>u!=='/sw.js'&&!u.endsWith('.map'))",".filter(u=>u.startsWith('/_astro/')||/^\\/(?:index\\.html|estudio\\/index\\.html|laboratorio\\/index\\.html)$/.test(u)||/^\\/(?:brand\\/|references\\/|images\\/modo\\/)/.test(u)||/^\\/fonts\\/[^/]+\\.woff2$/.test(u)||u==='/panel-model.json'||u==='/manifest.webmanifest')");
for(const name of ['bornes','protecciones','laboratorio'])for(const width of [640,1024])await sharp('public/images/modo/'+name+'.webp').resize({width}).webp({quality:84,effort:5}).toFile('public/images/modo/'+name+'-'+width+'.webp');
for(const file of ['src/components/Home.tsx','src/lab/HomeTools.tsx']){
 let body=fs.readFileSync(file,'utf8');
 for(const name of ['bornes','protecciones','laboratorio']){
  const original='src="/images/modo/'+name+'.webp"';
  if(!body.includes(original))continue;
  body=body.replace(original,original+' srcSet="/images/modo/'+name+'-640.webp 640w, /images/modo/'+name+'-1024.webp 1024w, /images/modo/'+name+'.webp 1536w" sizes="'+(name==='bornes'?'(max-width: 760px) calc(100vw - 24px), 56vw':'(max-width: 760px) calc(100vw - 24px), 38vw')+'"');
 }
 fs.writeFileSync(file,body);
}
let index=fs.readFileSync('src/pages/index.astro','utf8');
index=index.replace(/^\s*<link rel="preload" as="font"[^>]+\/>\r?\n/gm,'');
fs.writeFileSync('src/pages/index.astro',index);
// The panel and its data remain synchronous; optional side panels are downloaded on first use.
edit('src/components/App.tsx',"import {useCallback,","import {Suspense,lazy,useCallback,");
edit('src/components/App.tsx',"import {DiagramPane} from './DiagramPane';","const DiagramPane=lazy(()=>import('./DiagramPane').then(module=>({default:module.DiagramPane})));");
edit('src/components/App.tsx',"import {SimulatorInspector} from './SimulatorInspector';","const SimulatorInspector=lazy(()=>import('./SimulatorInspector').then(module=>({default:module.SimulatorInspector})));");
edit('src/components/App.tsx'," const [readingOnly,setReadingOnly]"," const [diagramMounted,setDiagramMounted]=useState(false);\n useEffect(()=>{if(showDiagram)setDiagramMounted(true)},[showDiagram]);\n const [readingOnly,setReadingOnly]");
let app=fs.readFileSync('src/components/App.tsx','utf8');
const lines=app.split('\n');let diagram=false,inspector=false;
for(let i=0;i<lines.length;i++){
 if(lines[i].includes('{wrapDiagram(<DiagramPane ')){
  lines[i]=lines[i].replace('{wrapDiagram(<DiagramPane ','{(showDiagram||diagramMounted)&&wrapDiagram(<Suspense fallback={<aside className="diagram-pane" aria-label="Diagrama y material de estudio"><p role="status">Abriendo diagrama…</p></aside>}><DiagramPane ');
  lines[i]=lines[i].replace('/>)}','/></Suspense>)}');diagram=true;
 }
 if(lines[i].includes('{showInspector&&<SimulatorInspector ')){
  lines[i]=lines[i].replace('{showInspector&&<SimulatorInspector ','{showInspector&&<Suspense fallback={<aside className="inspector" role="status">Abriendo inspector…</aside>}><SimulatorInspector ');
  lines[i]=lines[i].replace('/>}','/></Suspense>}');inspector=true;
 }
}
if(!diagram||!inspector)throw Error('Lazy panel anchor missing');
fs.writeFileSync('src/components/App.tsx',lines.join('\n'));
const pane='src/components/DiagramPane.tsx';fs.copyFileSync(pane,path.join(backup,'src/components/DiagramPane.tsx'));
edit(pane,' const src=recognitionImage||diagram?.src;'," const src=recognitionImage||(tab==='image'&&!hidden?diagram?.src:undefined);");
console.log('Applied: bounded core precache, cached navigation fallback, responsive assets, demand-loaded diagram/inspector and route-specific fonts.');

