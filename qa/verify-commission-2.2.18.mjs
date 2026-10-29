import {build} from 'esbuild';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
await build({entryPoints:['src/lab/soldering/commissioning.ts'],bundle:true,platform:'node',format:'cjs',outfile:'qa/redes-2.2.18/commission.cjs',logLevel:'silent'});
const {newCommission,stepCommission,commissionComplete}=createRequire(import.meta.url)('./redes-2.2.18/commission.cjs');
const cable={valid:true,verified:true,signature:'current'};let s=newCommission();
const act=a=>s=stepCommission(s,a,cable);
act({type:'send',command:'start'});assert.equal(s.output,false);
act({type:'download',device:'plc'});assert.equal(s.loadedPlc,null);
act({type:'connect',end:'db9'});act({type:'plcPlug'});for(let i=0;i<3;i++){act({type:'screw',slot:i+1});act({type:'insert',wire:i,slot:i+1});act({type:'screw',slot:i+1});}
for(const device of ['hmi','plc']){act({type:'power',device});act({type:'usb',device});act({type:'download',device});assert.equal(s[device==='hmi'?'loadedHmi':'loadedPlc'],null);act({type:'edit',device,patch:device==='plc'?{contact:true,coil:true,stopContact:true,reset:true}:{start:true,stop:true}});act({type:'compile',device});act({type:'download',device});}
act({type:'connect',end:'db9'});assert.equal(s.db9,true,'live connector removal blocked');
act({type:'run'});act({type:'send',command:'start'});assert.equal(s.output,true);assert.equal(s.display,true);assert.equal(s.started,true);
// A silent request must never turn off an already energized PLC output.
let failed=stepCommission(s,{type:'send',command:'stop'},{...cable,valid:false});assert.equal(failed.output,true);assert.equal(failed.display,null);
act({type:'send',command:'stop'});assert.equal(s.output,false);assert.equal(s.stopped,true);
act({type:'edit',device:'hmi',patch:{baud:115200}});act({type:'send',command:'read'});assert.equal(s.display,false,'editing does not apply until download');assert.equal(s.failedBaud,false);
act({type:'usb',device:'hmi'});act({type:'compile',device:'hmi'});act({type:'download',device:'hmi'});act({type:'send',command:'read'});assert.equal(s.display,null);assert.equal(s.failedBaud,true);assert.equal(commissionComplete(s,cable,'baud'),false);
act({type:'edit',device:'hmi',patch:{baud:9600}});act({type:'compile',device:'hmi'});act({type:'download',device:'hmi'});assert.equal(s.recovered,false);act({type:'send',command:'read'});assert.equal(s.recovered,true);assert.equal(commissionComplete(s,cable,'baud'),true);assert.equal(commissionComplete(s,cable,'video'),false);
assert.equal(commissionComplete(s,{...cable,signature:'changed'},'baud'),false);
let changed=stepCommission(s,{type:'send',command:'read'},{...cable,signature:'changed'});assert.equal(changed.started,false);assert.equal(changed.failedBaud,false);
let unmeasured=stepCommission(newCommission(),{type:'edit',device:'hmi',patch:{}},{...cable,verified:false});assert.equal(commissionComplete(unmeasured,{...cable,verified:false},'baud'),false);
act({type:'power',device:'plc'});assert.equal(s.output,false);assert.equal(s.memory,false);assert.equal(s.run,true);assert.equal(commissionComplete(s,cable,'baud'),false);
let invalid=newCommission();invalid.plcPower=true;invalid.usb='plc';invalid.plc={...invalid.plc,contact:true,coil:true,stopContact:true,reset:true,coilAddress:'X0'};invalid=stepCommission(invalid,{type:'compile',device:'plc'},cable);assert.equal(invalid.loadedPlc,null);assert.match(invalid.log[0],/No asignes una entrada X/);
invalid=newCommission();invalid.hmiPower=true;invalid.usb='hmi';invalid.hmi={...invalid.hmi,start:true,stop:true,stopAddress:'M0'};invalid=stepCommission(invalid,{type:'compile',device:'hmi'},cable);assert.equal(invalid.loadedHmi,null);assert.match(invalid.log[0],/marcha escribe M0/);
let manual=newCommission();manual=stepCommission(manual,{type:'insert',wire:0,slot:1},cable);assert.equal(manual.terminations[0].slot,null);manual=stepCommission(manual,{type:'screw',slot:1},cable);manual=stepCommission(manual,{type:'insert',wire:0,slot:1},cable);assert.equal(manual.terminal,false);manual=stepCommission(manual,{type:'screw',slot:1},cable);manual=stepCommission(manual,{type:'remove',wire:0},cable);assert.equal(manual.terminations[0].slot,1);manual=stepCommission(manual,{type:'screw',slot:1},cable);manual=stepCommission(manual,{type:'remove',wire:0},cable);assert.equal(manual.terminations[0].slot,null);
let offline=newCommission();offline.plc={...offline.plc,contact:true,coil:true,stopContact:true,reset:true};offline=stepCommission(offline,{type:'compile',device:'plc'},cable);assert.ok(offline.compiledPlc);assert.equal(offline.loadedPlc,null);offline.usb='plc';offline=stepCommission(offline,{type:'download',device:'plc'},cable);assert.match(offline.log[0],/necesita alimentación/);offline.plcPower=true;offline.run=true;offline=stepCommission(offline,{type:'download',device:'plc'},cable);assert.match(offline.log[0],/STOP/);assert.equal(offline.loadedPlc,null);offline.run=false;offline=stepCommission(offline,{type:'download',device:'plc'},cable);assert.ok(offline.loadedPlc);offline=stepCommission(offline,{type:'edit',device:'plc',patch:{baud:115200}},cable);offline=stepCommission(offline,{type:'download',device:'plc'},cable);assert.match(offline.log[0],/Compila la versión actual/);
console.log('PASS commissioning: download gates, compiled projects, RUN, real request/response, output retention, unapplied edits, 115200 failure/recovery, evidence and rework');
