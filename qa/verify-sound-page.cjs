/* Página /sonidos/: cada botón pide su sonido sin errores y el motor sano, sin fase y frenado se encienden y apagan. */
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4410').replace(/\/$/,'');
(async()=>{
 const b=await chromium.launch(),c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'/sonidos/');
 const log=()=>p.evaluate(()=>[...(window.__panelSounds||[])]);
 for(const name of ['Conectar cable','Desconectar cable','Paso correcto (guía)','Pulsador: apretar','Pulsador: soltar','Interruptor FUERZA','Enchufar','Contactor cierra (KT1)','Contactor cierra (KM1)','Contactor abre','Temporizador: fin de retardo','Térmico dispara (TEST)','Térmico rearma']){
  await p.getByRole('button',{name,exact:true}).click();await p.waitForTimeout(40);
 }
 let l=await log();console.log(l.join(' · '));
 assert.ok(!l.some(x=>x.startsWith('error:')),'sin errores de audio: '+l.filter(x=>x.startsWith('error:')));
 for(const k of ['cable-conecta','cable-desconecta','paso-correcto','pulsador-abajo:S1','interruptor:FUERZA','enchufe','contactor-cierra:TEMPORIZADOR_1','temporizado:TEMPORIZADOR_1','termico-dispara','termico-rearma'])assert.ok(l.includes(k),'falta '+k);
 await p.getByRole('button',{name:'Motor sano (arranque y régimen)',exact:true}).click();await p.waitForTimeout(600);
 assert.ok((await log()).includes('motor:arranca'));
 await p.getByRole('button',{name:'Falta una fase',exact:true}).click();await p.waitForTimeout(600);
 assert.ok((await log()).includes('motor:falla'));
 await p.getByRole('button',{name:'Parar motor',exact:true}).click();await p.waitForTimeout(200);
 assert.ok((await log()).includes('motor:para'));
 assert.deepEqual(errors,[]);console.log('PASS página de sonidos');await b.close();
})().catch(e=>{console.log('FAIL',e.stack||e.message);process.exit(1);});
