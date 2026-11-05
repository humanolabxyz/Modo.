/* Página /sonidos/: cada botón pide su sonido sin errores y el motor sano, sin fase y frenado se encienden y apagan. */
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PANELLAB_URL||'http://127.0.0.1:4410').replace(/\/$/,'');
(async()=>{
 const b=await chromium.launch(),c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{
  const create=AudioContext.prototype.createDynamicsCompressor;
  AudioContext.prototype.createDynamicsCompressor=function(){
   const compressor=create.call(this),analyser=this.createAnalyser();
   analyser.fftSize=4096;analyser.smoothingTimeConstant=0;
   compressor.connect(analyser);window.motorAudio=analyser;
   return compressor;
  };
 });
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
 const profile=async name=>{
  await p.getByRole('button',{name,exact:true}).click();
  await p.waitForTimeout(700);
  return p.evaluate(async()=>{
   const node=window.motorAudio,frequencies=new Float32Array(node.frequencyBinCount),points=[];
   for(let i=0;i<27;i++){
    node.getFloatFrequencyData(frequencies);
    points.push({low:Math.max(...frequencies.slice(3,13)),high:Math.max(...frequencies.slice(65,112))});
    await new Promise(resolve=>setTimeout(resolve,35));
   }
   const low=points.map(v=>v.low),high=points.map(v=>v.high).sort((a,b)=>a-b);
   return {low:Math.max(...low),high:high[high.length-4],pulse:high[high.length-4]-high[3]};
  });
 };
 const phase=await profile('Falta una fase');
 assert.ok((await log()).includes('motor:falla'));
 const blocked=await profile('Rotor frenado (bloqueado)');
 assert.ok(phase.high>blocked.high+8,'Falta de fase tiene más traqueteo en la banda alta');
 assert.ok(phase.pulse>8,'Falta de fase tiene pulsos claramente audibles');
 assert.ok(blocked.low>blocked.high+20,'Rotor frenado queda dominado por el zumbido grave');
 await p.getByRole('button',{name:'Parar motor',exact:true}).click();
 assert.ok((await log()).includes('motor:para'));
 console.log({phase,blocked});
 assert.deepEqual(errors,[]);console.log('PASS página de sonidos');await b.close();
})().catch(e=>{console.log('FAIL',e.stack||e.message);process.exit(1);});
