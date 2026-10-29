const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.env.PANELLAB_URL||'https://modo-lab.vercel.app',out='qa/estudio-unificado/production-release.json';
const report={base,verifiedAt:new Date().toISOString(),deployment:process.env.PANELLAB_DEPLOYMENT||'no indicado',checks:[]};
const pass=s=>{report.checks.push(s);console.log('PASS',s);};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 for(const route of ['/','/estudio/','/laboratorio/','/legal/','/comunidad/']){
  const response=await fetch(base+route,{redirect:'manual'});assert.equal(response.status,200,route);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('x-frame-options'),'DENY');
  assert.match(response.headers.get('content-security-policy')||'',/frame-ancestors 'none'/);
  const text=await response.text();assert.match(text,/Content-Security-Policy/);
 }
 pass('Cinco rutas públicas devuelven 200 y conservan las cabeceras de seguridad');
 const local=fs.readFileSync('dist/estudio/index.html','utf8'),remote=await fetch(base+'/estudio/').then(r=>r.text());
 const bundle=local.match(/component-url="([^"]*StudyApp[^\"]+)"/)[1];assert.ok(remote.includes(bundle));
 const response=await fetch(base+bundle);assert.equal(response.status,200);
 assert.equal(hash(Buffer.from(await response.arrayBuffer())),hash(fs.readFileSync('dist'+bundle)));
 pass('El dominio público sirve exactamente el JavaScript comprobado en local');
 const sources=JSON.parse(fs.readFileSync('src/study/content/academic-sources.json'));
 // Bounded concurrency for source availability; only the three new PDFs are downloaded again.
 for(let i=0;i<sources.length;i+=5)await Promise.all(sources.slice(i,i+5).map(async source=>{const r=await fetch(base+source.url,{method:'HEAD',redirect:'manual'});assert.equal(r.status,200,source.id);assert.ok(Number(r.headers.get('content-length'))>0,source.id);}));
 pass(`${sources.length} fuentes originales disponibles en producción`);
 for(const id of ['F37','F38','F39']){const source=sources.find(s=>s.id===id),r=await fetch(base+source.url);assert.equal(hash(Buffer.from(await r.arrayBuffer())),source.sha256,id);}
 pass('Los tres PDF de la Unidad 2 publicados coinciden byte por byte con sus originales');
 const sw=await fetch(base+'/sw.js');assert.equal(sw.status,200);assert.match(sw.headers.get('cache-control')||'',/no-cache/);assert.ok(!(await sw.text()).includes('__BUILD__'));
 pass('Service worker actualizado y sin marcador de compilación pendiente');
 fs.writeFileSync(out,JSON.stringify(report,null,2));
})().catch(e=>{fs.writeFileSync(out,JSON.stringify({...report,failure:String(e)},null,2));console.error(e);process.exitCode=1;});
