import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const base=process.env.RELEASE_URL||'https://modo-lab.vercel.app',out='qa/release-2.6.3';fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),report={url:base,version:'2.6.3',checkedAt:new Date().toISOString(),routes:[],assets:[],checks:[],limits:[]};
for(const path of ['/','/versiones/','/estudio/','/laboratorio/','/comunidad/','/legal/','/sin-conexion/']){
 const r=await fetch(base+path,{signal:AbortSignal.timeout(30000)}),html=await r.text();assert.equal(r.status,200,path);
 if(path==='/'||path==='/versiones/')assert.ok(html.includes('2.6.3'),path+' muestra versión actual');
 assert.equal(r.headers.get('x-content-type-options'),'nosniff');report.routes.push({path,status:r.status});
}
const beta=await fetch(base+'/robotica/',{signal:AbortSignal.timeout(30000)}),gate=await beta.text();assert.equal(beta.status,401);assert.ok(gate.includes('Contraseña'));report.routes.push({path:'/robotica/',status:401,protectedBeta:true});
const remoteManifest=await (await fetch(base+'/offline-assets.json')).json();
const assets=remoteManifest.assets.map(x=>x.url).filter(x=>x.startsWith('/_astro/')&&/\.(js|css|wasm)$/.test(x));
assets.push(...fs.readdirSync('dist/robotics/components').filter(x=>x.endsWith('.webp')).map(x=>'/robotics/components/'+x));
assets.push(...fs.readdirSync('dist/robotics/e6').filter(x=>/\.(STL|txt)$/.test(x)).map(x=>'/robotics/e6/'+x));
assert.ok(assets.some(x=>x.includes('ArenaPanel')));assert.ok(assets.some(x=>x.includes('arena.worker')));assert.ok(assets.some(x=>x.includes('ArmControls'))||assets.some(x=>x.includes('RoboticsApp')));
let index=0;await Promise.all(Array.from({length:6},async()=>{
 while(index<assets.length){const path=assets[index++],r=await fetch(base+path,{signal:AbortSignal.timeout(60000)});assert.equal(r.status,200,path);
  const bytes=Buffer.from(await r.arrayBuffer()),digest=hash(bytes),local=fs.existsSync('dist'+path);
  if(local)assert.equal(digest,hash(fs.readFileSync('dist'+path)),path+' coincide con el build local');
  report.assets.push({path,bytes:bytes.length,sha256:digest,localIdentical:local});
 }
}));
assert.equal(report.assets.filter(x=>x.path.endsWith('.webp')).length,23);assert.equal(report.assets.filter(x=>x.path.endsWith('.STL')).length,7);
const swResponse=await fetch(base+'/sw.js',{signal:AbortSignal.timeout(30000)});assert.equal(swResponse.status,200);const sw=await swResponse.text();assert.ok(!sw.includes('__BUILD__'));const build=sw.match(/const BUILD='([^']+)'/)[1];assert.equal(build,remoteManifest.build);report.serviceWorker=build;
const manifest=await fetch(base+'/manifest.webmanifest');assert.equal(manifest.status,200);
report.assets.sort((a,b)=>a.path.localeCompare(b.path));
report.checks=['Siete rutas públicas HTTP 200 y versión 2.6.3 visible.','Beta Robótica mantiene su contraseña (401 sin sesión).','Todos los JS/CSS/WASM del manifiesto remoto son accesibles; los archivos con el mismo nombre coinciden por SHA-256 con el build local.','Las 23 miniaturas y siete mallas E6 coinciden por SHA-256.','Service worker y manifest publicados; identificador de caché coincide con el manifiesto de producción.'];
report.limits=['La interfaz de Robótica se verificó en local en escritorio y móvil emulado. En producción se verifican protección y archivos; no se recuperó ni modificó la contraseña de la beta.','No se probaron dispositivos físicos ni se repitió la descarga offline completa durante esta publicación.'];
fs.writeFileSync(out+'/public-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,assets:report.assets.length},null,2));
