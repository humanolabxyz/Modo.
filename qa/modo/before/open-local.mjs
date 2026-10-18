import {spawn} from 'node:child_process';
import {existsSync,openSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(!existsSync(path.join(root,'node_modules/astro/astro.js')))throw new Error('Faltan dependencias. Ejecuta npm install en PanelLab-INACAP.');
const probe=async port=>{try{const response=await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(1000)});return /<meta name="panellab-version" content="2.0"/.test(await response.text())?'panellab':'occupied'}catch(error){return error.cause?.code==='ECONNREFUSED'?'free':'occupied'}};
let port=4322;
while(port<4342){const state=await probe(port);if(state==='panellab')break;if(state==='free'){
 const log=openSync(path.join(root,'panellab-local.log'),'a');
 const server=spawn(process.execPath,[path.join(root,'node_modules/astro/astro.js'),'dev','--host','127.0.0.1','--port',String(port)],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log,log]});server.unref();
 let available=false;for(let n=0;n<30;n++){await new Promise(resolve=>setTimeout(resolve,400));if(await probe(port)==='panellab'){available=true;break}}
 if(!available)throw new Error('No se pudo iniciar PanelLab. Revisa panellab-local.log.');break;
}port++;}
if(port>=4342)throw new Error('No hay un puerto local disponible entre 4322 y 4341.');
const url=`http://127.0.0.1:${port}/?revision=practica-v2`;
console.log(`PanelLab actual: ${url}`);
if(process.platform==='win32'&&!process.argv.includes('--no-browser'))spawn('cmd.exe',['/d','/c','start','',url],{windowsHide:true,stdio:'ignore'}).unref();
