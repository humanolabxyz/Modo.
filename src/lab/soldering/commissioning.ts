import {frame,hex,transaction} from '../../study/serialProtocol';
export type Project={baud:number;address:number;contact:boolean;coil:boolean;start:boolean;stop:boolean;stopContact:boolean;reset:boolean;stopContactAddress:string;resetAddress:string;contactAddress:string;coilAddress:string;startAddress:string;stopAddress:string};
export type Termination={slot:number|null;tight:boolean};
export type Commission={hmiPower:boolean;plcPower:boolean;plcPlugged:boolean;db9:boolean;terminal:boolean;terminations:Termination[];released:boolean[];usb:'hmi'|'plc'|null;run:boolean;hmi:Project;plc:Project;compiledHmi:Project|null;compiledPlc:Project|null;loadedHmi:Project|null;loadedPlc:Project|null;memory:boolean;output:boolean;display:boolean|null;started:boolean;stopped:boolean;failedBaud:boolean;recovered:boolean;signature:string;log:string[]};
export const project=():Project=>({baud:9600,address:1,contact:false,coil:false,start:false,stop:false,stopContact:false,reset:false,stopContactAddress:'M1',resetAddress:'Y0',contactAddress:'M0',coilAddress:'Y0',startAddress:'M0',stopAddress:'M1'});
export const newCommission=():Commission=>({hmiPower:false,plcPower:false,plcPlugged:false,db9:false,terminal:false,terminations:[0,1,2].map(()=>({slot:null,tight:false})),released:[false,false,false],usb:null,run:false,hmi:project(),plc:project(),compiledHmi:null,compiledPlc:null,loadedHmi:null,loadedPlc:null,memory:false,output:false,display:null,started:false,stopped:false,failedBaud:false,recovered:false,signature:'',log:[]});
export const terminalsReady=(s:Commission)=>s.terminations.length===3&&s.terminations.every((t,i)=>t.slot===i+1&&t.tight);
export type Action={type:'plcPlug'}|{type:'power';device:'hmi'|'plc'}|{type:'connect';end:'db9'|'terminal'}|{type:'insert';wire:number;slot:number}|{type:'screw';slot:number}|{type:'remove';wire:number}|{type:'usb';device:'hmi'|'plc'}|{type:'edit';device:'hmi'|'plc';patch:Partial<Project>}|{type:'compile';device:'hmi'|'plc'}|{type:'download';device:'hmi'|'plc'}|{type:'run'}|{type:'send';command:'start'|'stop'|'read'};
export function stepCommission(previous:Commission,action:Action,cable:{valid:boolean;verified:boolean;signature:string}):Commission{
 let s:Commission={...previous,log:[...previous.log]};
 const note=(message:string)=>{s.log=[message,...s.log].slice(0,24);return s;};
 // Electrical rework invalidates all evidence, including the deliberately provoked baud fault.
 if(s.signature!==cable.signature){s={...s,signature:cable.signature,started:false,stopped:false,failedBaud:false,recovered:false,display:null};}
 if(action.type==='insert'||action.type==='screw'||action.type==='remove'){
  if(s.hmiPower||s.plcPower)return note('Apaga ambos equipos antes de trabajar en las entradas o los tornillos.');
  const rows=s.terminations.map(t=>({...t}));
  if(action.type==='insert'){
   if(!Number.isInteger(action.wire)||action.wire<0||action.wire>2||![1,2,3].includes(action.slot))return note('Entrada de bornera no válida.');
   if(rows[action.wire].tight)return note('El conductor está sujeto: afloja el tornillo antes de retirarlo.');
   if(rows.some((t,i)=>i!==action.wire&&t.slot===action.slot))return note('Entrada ocupada. Retira el otro conductor antes de insertar este.');
   if(!s.released[action.slot-1])return note(`Afloja primero el tornillo T${action.slot} para abrir la entrada superior.`);
   rows[action.wire]={slot:action.slot,tight:false};
  }else if(action.type==='remove'){
   if(!rows[action.wire])return s;
   if(rows[action.wire].tight)return note('El conductor está sujeto: afloja el tornillo antes de retirarlo.');
   rows[action.wire]={slot:null,tight:false};
  }else{
   if(![1,2,3].includes(action.slot))return s;
   const released=[...s.released];released[action.slot-1]=!released[action.slot-1];s.released=released;
   const wire=rows.findIndex(t=>t.slot===action.slot);if(wire>=0)rows[wire].tight=!released[action.slot-1];
  }
  s.terminations=rows;s.terminal=terminalsReady(s);s.display=null;s.started=false;s.stopped=false;s.failedBaud=false;s.recovered=false;
  return note(action.type==='insert'?`Conductor ${action.wire+1} insertado en T${action.slot}. Falta apretar su tornillo.`:action.type==='remove'?`Conductor ${action.wire+1} retirado.`:`Tornillo T${action.slot} ${s.released[action.slot-1]?'aflojado: entrada superior abierta':'apretado: entrada cerrada'}.`);
 }
 if(action.type==='plcPlug'){if(s.hmiPower||s.plcPower)return note('Apaga los equipos antes de enchufar o retirar el conector del PLC.');s.plcPlugged=!s.plcPlugged;s.display=null;s.started=false;s.stopped=false;s.failedBaud=false;s.recovered=false;return note(s.plcPlugged?'Conector de tres vías enchufado al puerto del PLC.':'Conector retirado del PLC.');}
 if(action.type==='edit')return {...s,[action.device]:{...s[action.device],...action.patch}};
 if(action.type==='power'){
  const key=action.device==='hmi'?'hmiPower':'plcPower';s[key]=!s[key];s.display=null;
  if(action.device==='plc'&&!s.plcPower){s.memory=false;s.output=false;}
  s.started=false;s.stopped=false;s.failedBaud=false;s.recovered=false;
  return note(`${action.device.toUpperCase()} ${s[key]?'encendido':'apagado'}.`);
 }
 if(action.type==='connect'){
  if(action.end==='terminal')return note('Conecta los tres conductores en sus entradas y aprieta cada tornillo; la bornera no se conecta con un botón.');
  if(s.hmiPower||s.plcPower)return note('Apaga ambos equipos antes de conectar o retirar el cable.');
  s[action.end]=!s[action.end];s.display=null;return note(`${action.end==='db9'?'DB9 · COM2 HMI':'Bornera RS-485 PLC'} ${s[action.end]?'conectado':'retirado'}.`);
 }
 if(action.type==='usb'){s.usb=s.usb===action.device?null:action.device;return note(s.usb?`USB de programación conectado al ${action.device.toUpperCase()}.`:'USB retirado.');}
 if(action.type==='compile'){
  const device=action.device;
  if(device==='plc'&&(!s.plc.contact||!s.plc.coil||!s.plc.stopContact||!s.plc.reset))return note('Compilación: completa las redes Arranque → SET Motor y Parada → RESET Motor.');
  if(device==='hmi'&&(!s.hmi.start||!s.hmi.stop))return note('Compilación: añade los botones de marcha y paro a la pantalla.');
  if(device==='plc'&&(s.plc.contactAddress!=='M0'||s.plc.coilAddress!=='Y0'||s.plc.stopContactAddress!=='M1'||s.plc.resetAddress!=='Y0'))return note('Compilación de esta práctica: usa M0 para arranque, M1 para parada y Y0 en SET y RESET. No asignes una entrada X como bobina.');
  if(device==='hmi'&&(s.hmi.startAddress!=='M0'||s.hmi.stopAddress!=='M1'))return note('Revisa Write Address: marcha escribe M0 (Arranque) y paro escribe M1 (Parada) del PLC.');
  if(device==='hmi')s.compiledHmi={...s.hmi};else s.compiledPlc={...s.plc};
  return note(`${device==='hmi'?'DOPSoft':'ISPSoft'}: compilación correcta en la laptop. Proyecto preparado; aún no se ha transferido al equipo.`);
 }
 if(action.type==='download'){
  const device=action.device,problem=transferProblem(s,device);
  if(problem)return note(problem);
  const sameLogic=device==='hmi'&&s.loadedHmi?.start===s.hmi.start&&s.loadedHmi?.stop===s.hmi.stop&&s.loadedHmi?.address===s.hmi.address&&s.loadedHmi?.startAddress===s.hmi.startAddress&&s.loadedHmi?.stopAddress===s.hmi.stopAddress;
  if(device==='hmi'){s.loadedHmi={...s.hmi};s.display=null;}else{s.loadedPlc={...s.plc};s.run=false;s.memory=false;s.output=false;}
  if(!sameLogic){s.started=false;s.stopped=false;s.failedBaud=false;}
  s.recovered=false;
  return note(`${device==='hmi'?'DOPSoft':'ISPSoft'}: programa transferido y verificado en el equipo. ${device==='plc'?'PLC en STOP.':''}`);
 }
 if(action.type==='run'){
  s.run=!s.run;if(!s.run){s.output=false;s.started=false;s.stopped=false;s.failedBaud=false;s.recovered=false;}return note(`Palanca en ${s.run?'RUN':'STOP'}${!s.plcPower?' · PLC sin alimentación':!s.loadedPlc?' · falta transferir el programa':''}.`);
 }
 if(!s.hmiPower||!s.plcPower||!s.loadedHmi||!s.loadedPlc||!s.run){s.display=null;return note('Sin ensayo: enciende ambos equipos, carga los dos programas y coloca el PLC en RUN.');}
 if(action.command!=='read'&&!(action.command==='start'?s.loadedHmi.start:s.loadedHmi.stop))return note('Ese botón no está en el proyecto cargado.');
 const h=s.loadedHmi,p=s.loadedPlc;
 const request=frame(action.command==='read'?[h.address,3,0,0,0,1]:[h.address,5,0,action.command==='stop'?1:0,255,0]);
 const result=transaction({clientBaud:h.baud,serverBaud:p.baud,destination:h.address,server:p.address,clientParity:'E',serverParity:'E',clientStop:1,serverStop:1,wired:cable.valid&&s.db9&&s.plcPlugged&&terminalsReady(s)},request,s.output,action.command==='stop'?1:0);
 s.memory=result.ok&&action.command==='start';
 if(result.ok){
  if(action.command==='start'&&p.contact&&p.coil)s.output=true;
  if(action.command==='stop'&&p.stopContact&&p.reset)s.output=false;
  s.display=s.output;
  if(cable.verified){if(action.command==='start'&&s.output)s.started=true;if(action.command==='stop'&&!s.output&&s.started)s.stopped=true;if(s.failedBaud&&h.baud===p.baud)s.recovered=true;}
 }else{
  s.display=null;
  if(cable.valid&&cable.verified&&s.db9&&s.plcPlugged&&s.terminal&&s.started&&s.stopped&&h.baud===115200&&p.baud!==h.baud&&h.address===p.address)s.failedBaud=true;
 }
 return note(`TX ${hex(request)} · ${result.response.length?`RX ${hex(result.response)}`:'sin respuesta'} · ${result.reason}${!cable.verified?' Cable pendiente de seis medidas.':''}`);
}
export function commissionComplete(s:Commission,cable:{valid:boolean;verified:boolean;signature:string},explanation:string){return cable.valid&&cable.verified&&s.signature===cable.signature&&s.hmiPower&&s.plcPower&&s.run&&s.db9&&s.plcPlugged&&s.terminal&&s.display!==null&&s.started&&s.stopped&&s.failedBaud&&s.recovered&&s.loadedHmi?.baud===s.loadedPlc?.baud&&explanation==='baud';}

export function transferProblem(s:Commission,device:'hmi'|'plc'){
 const compiled=device==='hmi'?s.compiledHmi:s.compiledPlc;
 if(!compiled||JSON.stringify(compiled)!==JSON.stringify(s[device]))return 'Compila la versión actual en la laptop antes de transferir.';
 if(s.usb!==device)return `Conecta el USB de la laptop al ${device.toUpperCase()} de destino.`;
 if(!(device==='hmi'?s.hmiPower:s.plcPower))return `El ${device.toUpperCase()} necesita alimentación para recibir datos por USB. La edición y compilación se hacen sin alimentarlo.`;
 if(device==='plc'&&s.run)return 'Coloca la palanca del PLC en STOP para realizar la transferencia de esta práctica.';
 return null;
}
