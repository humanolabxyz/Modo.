const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../vercel.json'),'utf8'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ico':'image/x-icon','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const url=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(url.pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(!path.extname(file))file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
  // Reproduce las cabeceras de vercel.json; no verifica un despliegue remoto.
  for(const rule of config.headers){
   if(new RegExp('^'+rule.source+'$').test(pathname))for(const header of rule.headers)res.setHeader(header.key,header.value);
  }
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400).end();}
});
server.listen(4338,'127.0.0.1',()=>console.log('Build local con cabeceras preparadas para Vercel: http://127.0.0.1:4338/'));
