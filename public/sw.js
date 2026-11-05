/* modo. — Versioned local resources, optional complete travel pack. */
const BUILD='__BUILD__';
const CACHE=`panellab-${BUILD}`;
const PRECACHE=__PRECACHE__;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),pending=[...PRECACHE];
  try {
   const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true}).catch(()=>[]);
   let saved=0,lastNotice=0;
   await Promise.all(Array.from({length:4},async()=>{
    while(pending.length){
     await cache.add(new Request(pending.shift(),{cache:'reload'}));
     saved++;
     const now=Date.now();
     if(saved===PRECACHE.length||now-lastNotice>=120){
      lastNotice=now;
      for(const client of clients)client.postMessage({type:'UPDATE_PROGRESS',saved,total:PRECACHE.length});
     }
    }
   }));
   await self.skipWaiting();
  } catch(error) {await caches.delete(CACHE);throw error;}
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  await Promise.all((await caches.keys()).filter(key=>key.startsWith('panellab-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='OFFLINE_INFO')event.ports[0]?.postMessage({build:BUILD,cache:CACHE});
});
function pageKey(url){
 const path=url.pathname.replace(/\/index\.html$/,'/').replace(/\/+$/,'')||'/';
 return path==='/'?'/':/^\/(estudio|laboratorio|robotica|arena|legal|comunidad|versiones|sin-conexion)$/.test(path)?path+'/':url.pathname;
}
async function rangeResponse(request,cached){
 const range=request.headers.get('range');
 if(!range||cached.status!==200)return cached;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range),blob=await cached.blob(),size=blob.size;
 let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):size-1;
 if(match&&!match[1]&&match[2]){start=Math.max(0,size-Number(match[2]));end=size-1;}
 const headers=new Headers(cached.headers);headers.set('Accept-Ranges','bytes');
 if(!match||(!match[1]&&!match[2])||start>=size||start>end){headers.set('Content-Range',`bytes */${size}`);headers.delete('Content-Length');return new Response(null,{status:416,headers});}
 end=Math.min(end,size-1);headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));
 return new Response(blob.slice(start,end+1),{status:206,headers});
}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==location.origin)return;
 // The explicit downloader verifies complete bodies before storing them.
 if(request.cache==='no-store'&&request.mode!=='navigate')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=pageKey(url);
  const cached=await cache.match(key,{ignoreVary:true});
  // Al navegar en línea, usa el HTML de la versión publicada. Un HTML
  // anterior puede apuntar a módulos con hash que ya no existen en el servidor.
  if(cached&&request.mode!=='navigate')return rangeResponse(request,cached);
  let response;
  try {
   response=await fetch(request.mode==='navigate'?new Request(request,{cache:'no-cache'}):request);
  } catch(error) {
   if(request.mode!=='navigate')throw error;
   if(cached)return cached;
   // Serve the cached recovery page at the requested URL so retry keeps its query.
   const fallback=await cache.match('/sin-conexion/');
   if(fallback)return fallback;
   return new Response('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>modo. · Sin conexión</title><h1>Sin conexión</h1><p>Conéctate a internet y vuelve a cargar esta página.</p><a href="/">Volver a modo.</a></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
  }
  if(request.mode==='navigate'&&(response.status===401||response.status===403))event.waitUntil(cache.delete(key));
  if(response.status===200&&!request.headers.has('range'))event.waitUntil(cache.put(key,response.clone()).catch(()=>{}));
  return response;
 })());
});
