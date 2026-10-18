/* modo. — Offline essentials; large course media are cached when used. */
const BUILD='__BUILD__';
const CACHE=`panellab-${BUILD}`;
const PRECACHE=__PRECACHE__;
const NAVIGATION_TIMEOUT=2000;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),pending=[...PRECACHE];
  // Bound background downloads so installation does not flood a slow connection.
  await Promise.all(Array.from({length:3},async()=>{while(pending.length)await cache.add(pending.shift())}));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  await Promise.all((await caches.keys()).filter(key=>key.startsWith('panellab-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
function pageKey(url){
 const path=url.pathname.replace(/\/index\.html$/,'/').replace(/\/+$/,'')||'/';
 return path==='/'?'/':path==='/estudio'||path==='/laboratorio'||path==='/legal'||path==='/comunidad'?path+'/':null;
}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==location.origin)return;
 // Los tutoriales se sirven bajo demanda. El navegador gestiona sus rangos de
 // video directamente; una respuesta completa cacheada rompería el seek.
 if(url.pathname.startsWith('/tutoriales/')&&url.pathname.endsWith('.mp4'))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),key=pageKey(url)||request,cached=await cache.match(key);
   const network=fetch(request).then(async response=>{
    // PDFs and other documents keep their own key; never replace the home page.
    if(response.status===200)await cache.put(key,response.clone());
    return response;
   });
   event.waitUntil(network.then(()=>{},()=>{}));
   if(!cached)return network;
   let timer;
   try{return await Promise.race([network.catch(()=>cached),new Promise(resolve=>{timer=setTimeout(()=>resolve(cached),NAVIGATION_TIMEOUT)})])}
   finally{clearTimeout(timer)}
  })());
  return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.status===200)event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
  return response;
 })());
});
