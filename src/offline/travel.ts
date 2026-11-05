export {};
type Asset={url:string;bytes:number};
type Pack={version:number;build:string;bytes:number;assets:Asset[]};
const status=document.querySelector<HTMLElement>('#offline-status')!;
const detail=document.querySelector<HTMLElement>('#offline-detail')!;
const errorBox=document.querySelector<HTMLElement>('#offline-error')!;
const progress=document.querySelector<HTMLProgressElement>('#offline-progress')!;
const download=document.querySelector<HTMLButtonElement>('#offline-download')!;
const check=document.querySelector<HTMLButtonElement>('#offline-check')!;
const recovery=document.querySelector<HTMLElement>('#offline-recovery')!;
const retry=recovery.querySelector<HTMLAnchorElement>('a')!;
if(!/^\/sin-conexion(?:\/|$)/.test(location.pathname)){
 retry.href=location.href;
 recovery.hidden=false;
}
let pack:Pack,cache:Cache,busy=false;
const mb=(bytes:number)=>`${(bytes/1048576).toFixed(1)} MiB`;
const fail=(message:string)=>{errorBox.textContent=message;errorBox.hidden=false;};
const workerInfo=(worker:ServiceWorker)=>new Promise<{build:string;cache:string}>((resolve,reject)=>{
 const channel=new MessageChannel(),timer=setTimeout(()=>reject(new Error('La copia local todavía no responde. Recarga esta página.')),15000);
 channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};worker.postMessage({type:'OFFLINE_INFO'},[channel.port2]);
});
async function audit(){
 const entries=await cache.keys(),keys=new Set(entries.map(r=>new URL(r.url).pathname));
 const missing=pack.assets.filter(a=>!keys.has(a.url));
 const bytes=pack.assets.filter(a=>keys.has(a.url)).reduce((sum,a)=>sum+a.bytes,0);
 progress.value=bytes/pack.bytes*100;
 status.textContent=missing.length?`${pack.assets.length-missing.length} de ${pack.assets.length} archivos guardados`:'Listo para el viaje';
 detail.textContent=missing.length?`${mb(bytes)} de ${mb(pack.bytes)} · incluye todos los simuladores, PDF, materiales y videos.`:`${mb(pack.bytes)} disponibles en este navegador. Puedes desconectar internet y abrir las actividades de abajo.`;
 download.textContent=missing.length?'Guardar todo para el viaje':'Volver a comprobar';
 document.documentElement.dataset.offlineReady=String(!missing.length);
 return missing;
}
const leaving=(event:BeforeUnloadEvent)=>{if(busy){event.preventDefault();event.returnValue='';}};
async function prepare(){
 if(busy)return;busy=true;download.disabled=true;check.disabled=true;errorBox.hidden=true;
 window.addEventListener('beforeunload',leaving);
 try{
  // Ask to retain this device's study data; denial does not prevent downloading.
  await navigator.storage?.persist?.().catch(()=>false);
  const missing=await audit();let pending=[...missing],completed=pack.assets.length-missing.length,downloaded=pack.bytes-missing.reduce((sum,a)=>sum+a.bytes,0);
  const failures:string[]=[];
  await Promise.all(Array.from({length:3},async()=>{
   while(pending.length){
    const asset=pending.shift()!;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),90000);
    try{
     const response=await fetch(asset.url,{cache:'no-store',signal:controller.signal});
     if(response.status!==200)throw new Error(`HTTP ${response.status}`);
     const blob=await response.blob();
     if(blob.size!==asset.bytes)throw new Error('Descarga incompleta o versión cambiada');
     await cache.put(asset.url,new Response(blob,{status:200,headers:response.headers}));
     completed++;downloaded+=asset.bytes;progress.value=downloaded/pack.bytes*100;
     status.textContent=`Preparando el viaje · ${completed} de ${pack.assets.length} archivos`;
     detail.textContent=`${mb(downloaded)} de ${mb(pack.bytes)} · puedes seguir al terminar.`;
    }catch(error){failures.push(asset.url);if(error instanceof DOMException&&error.name==='QuotaExceededError')pending=[];}
    finally{clearTimeout(timer);}
   }
  }));
  await audit();
  if(failures.length)fail(`No se pudieron guardar ${failures.length} archivos. Comprueba la conexión y el espacio disponible y vuelve a intentarlo. Lo ya descargado se conserva.`);
 }catch(error){fail(error instanceof Error?error.message:'No se pudo preparar este dispositivo.');}
 finally{busy=false;download.disabled=false;check.disabled=false;window.removeEventListener('beforeunload',leaving);}
}
download.addEventListener('click',()=>{void prepare();});
check.addEventListener('click',async()=>{if(busy)return;check.disabled=true;try{await audit();}catch{fail('No se pudo revisar el almacenamiento del navegador.');}finally{check.disabled=false;}});
async function start(){
 if(!('serviceWorker'in navigator)||!('caches'in window))throw new Error('Abre modo. en un navegador con almacenamiento sin conexión. En Windows también puedes usar la copia local con ABRIR_MODO_SIN_CONEXION.cmd.');
 const registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
 const ready=await Promise.race([navigator.serviceWorker.ready,new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('No terminó la preparación inicial. Recarga la página para volver a intentarlo.')),60000))]);
 const info=await workerInfo(navigator.serviceWorker.controller||ready.active||registration.active!);
 const response=await fetch('/offline-assets.json');if(!response.ok)throw new Error('Falta el inventario local. Ejecuta npm run build antes de viajar.');
 pack=await response.json();if(pack.build!==info.build)throw new Error('La aplicación se está actualizando. Recarga la página antes de preparar el viaje.');
 cache=await caches.open(info.cache);await audit();download.disabled=false;check.disabled=false;
}
void start().catch(error=>{status.textContent='La preparación necesita atención';fail(error instanceof Error?error.message:String(error));});
