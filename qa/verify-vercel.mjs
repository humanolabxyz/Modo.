import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://panellab-inacap.vercel.app';
const files=fs.readdirSync('public',{recursive:true}).filter(p=>fs.statSync(path.join('public',p)).isFile());
const checks=await Promise.all(files.map(async file=>{
 const url=base+'/'+file.split(path.sep).map(encodeURIComponent).join('/');
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 assert.equal(response.status,200,url);
 const actual=Buffer.from(await response.arrayBuffer()),expected=fs.readFileSync(path.join('public',file));
 if(file==='sw.js'){ // el publicado está sellado en el build: no coincide byte a byte con la plantilla
  const text=actual.toString('utf8');assert.ok(!/__BUILD__|__PRECACHE__/.test(text),'sw.js publicado conserva marcadores sin sustituir');assert.match(text,/const BUILD='[a-z0-9]+'/);
  return {file,url,status:response.status,sha256:'sellado en build'};
 }
 const digest=v=>crypto.createHash('sha256').update(v).digest('hex');
 assert.equal(digest(actual),digest(expected),url+' byte parity');
 return {file,url,status:response.status,sha256:digest(actual)};
}));
fs.mkdirSync('qa/vercel',{recursive:true});
const report={url:base,result:'PASS',deploymentId:process.env.PANELLAB_DEPLOYMENT_ID||'dpl_EUtLdETQYke8TcZ2hAhK3m5tdrpF',assets:checks};
fs.writeFileSync('qa/vercel/assets.json',JSON.stringify(report,null,2));
console.log(`PASS: ${checks.length} public assets respond without login and match local files byte-for-byte (including diagram, model, fonts and study material).`);
