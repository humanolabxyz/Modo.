/* modo. — Versioned local resources, optional complete travel pack. */
const BUILD='__BUILD__';
const CACHE=`panellab-${BUILD}`;
const PRECACHE=__PRECACHE__;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),pending=[...PRECACHE];
  try {
   await Promise.all(Array.from({length:8},async()=>{while(pending.length)await cache.add(new Request(pending.shift(),{cache:'reload'}))}));
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
 return path==='/'?'/':/^\/(estudio|laboratorio|legal|comunidad|versiones|sin-conexion)$/.test(path)?path+'/':url.pathname;
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
 if(request.cache==='no-store')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=pageKey(url);
  const cached=await cache.match(key,{ignoreVary:true});
  if(cached)return rangeResponse(request,cached);
  const response=await fetch(request);
  if(response.status===200&&!request.headers.has('range'))event.waitUntil(cache.put(key,response.clone()).catch(()=>{}));
  return response;
 })());
});
