/* PanelLab INACAP — service worker. astro.config.mjs sustituye los dos marcadores de abajo al terminar el build. */
const BUILD='__BUILD__';
const CACHE=`panellab-${BUILD}`;
const PRECACHE=__PRECACHE__;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('panellab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==location.origin)return;
 if(req.mode==='navigate'){
  // El estudio tiene su propia página: nunca debe sobrescribir la copia offline del Banco.
  if(url.pathname==='/estudio'||url.pathname.startsWith('/estudio/')){
   const studyKey=url.pathname==='/estudio'||url.pathname==='/estudio/'?'/estudio/':req;
   e.respondWith(fetch(req).then(async res=>{if(res.ok){const cache=await caches.open(CACHE);await cache.put(studyKey,res.clone())}return res}).catch(()=>caches.match(studyKey).then(hit=>hit||Response.error())));
   return;
  }
  e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('/',copy));return res}).catch(()=>caches.match('/').then(hit=>hit||Response.error())));
  return;
 }
 e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
});
