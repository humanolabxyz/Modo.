import {readFileSync} from 'node:fs'; import {spawnSync} from 'node:child_process';
const scripts = JSON.parse(readFileSync('package.json','utf8')).scripts, rows = [];
for (const [k,v] of Object.entries(scripts)) { if (!k.startsWith('verify:robotics-') ) continue; const m = v.match(/^node (qa\/\S+\.mjs)$/); if (!m) continue;
  const t=Date.now(), r = spawnSync('node',[m[1]],{encoding:'utf8',timeout:240000}); const pass=(r.stdout.match(/^PASS/gm)||[]).length; rows.push({k,ok:r.status===0,pass,ms:Date.now()-t,err:r.status===0?'':(r.stdout+r.stderr).split('\n').slice(-4).join(' | ').slice(0,240)}); console.log(r.status===0?'OK  ':'FALLA',k,pass,((Date.now()-t)/1000).toFixed(1)+'s'); }
console.log('TOTAL', rows.length, 'scripts;', rows.filter(r=>!r.ok).length, 'con fallas;', rows.reduce((s,r)=>s+r.pass,0), 'PASS'); for (const r of rows.filter(r=>!r.ok)) console.log('  >', r.k, r.err);
