import {spawn} from 'node:child_process';
import {existsSync,openSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=4325,url=`http://127.0.0.1:${port}/`;
if(!existsSync(path.join(root,'dist/vendor/geogebra/deployggb.js')))throw new Error('Falta preparar GeoGebra local. Ejecuta npm run prepare:offline antes de viajar.');
const probe=async()=>{try{const response=await fetch(url+'offline-assets.json',{signal:AbortSignal.timeout(1500)});const data=await response.json();return data.version===1&&Array.isArray(data.assets)?'modo':'occupied';}catch(error){return error.cause?.code==='ECONNREFUSED'?'free':'occupied';}};
const state=await probe();
if(state==='occupied')throw new Error(`El puerto ${port} está ocupado. Cierra esa aplicación para conservar siempre la misma dirección y tu progreso.`);
if(state==='free'){
 const log=openSync(path.join(root,'modo-offline.log'),'a');
 const child=spawn(process.execPath,[path.join(root,'scripts/offline-server.mjs')],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log,log]});child.unref();
 let started=false;for(let i=0;i<40;i++){await new Promise(resolve=>setTimeout(resolve,250));if(await probe()==='modo'){started=true;break;}}
 if(!started)throw new Error('No se pudo iniciar la copia local. Revisa modo-offline.log.');
}
console.log(`modo. listo sin internet: ${url}\nUsa siempre esta dirección y el mismo navegador para conservar el avance.`);
if(process.platform==='win32'&&!process.argv.includes('--no-browser'))spawn('cmd.exe',['/d','/c','start','',url],{windowsHide:true,stdio:'ignore'}).unref();
