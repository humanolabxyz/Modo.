// Static, dependency-free server for the built app. No npm or internet at launch.
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','dist');
const port=Number(process.env.MODO_OFFLINE_PORT||4325),host='127.0.0.1';
if(!existsSync(path.join(root,'index.html')))throw new Error('Falta la copia compilada. Antes de viajar ejecuta npm run prepare:offline.');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.mp4':'video/mp4','.pdf':'application/pdf','.wasm':'application/wasm','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.ggb':'application/vnd.geogebra.file','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
export function server(){return createServer((request,response)=>{
 try{
  if(!['GET','HEAD'].includes(request.method)){response.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(pathname.includes('\0')||pathname.includes('\\')){response.writeHead(400).end();return;}
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){response.writeHead(403).end();return;}
  if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!existsSync(file)||!statSync(file).isFile()){response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Archivo local no encontrado');return;}
  const size=statSync(file).size,headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Cache-Control':file.endsWith('sw.js')||file.endsWith('.html')||file.endsWith('offline-assets.json')?'no-cache':'public, max-age=3600'};
  let start=0,end=size-1,status=200;
  if(request.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
   if(match){start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;}
   if(!match||(!match[1]&&!match[2])||start>=size||start>end){response.writeHead(416,{...headers,'Content-Range':`bytes */${size}`}).end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);response.writeHead(status,headers);
  if(request.method==='HEAD'||!size){response.end();return;}
  const stream=createReadStream(file,{start,end});stream.on('error',()=>response.destroy());stream.pipe(response);
 }catch{response.writeHead(400).end();}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=server();app.on('error',error=>{console.error(`No se pudo abrir modo. local: ${error.message}`);process.exitCode=1;});
 app.listen(port,host,()=>console.log(`modo. sin conexión: http://${host}:${port}/`));
}
