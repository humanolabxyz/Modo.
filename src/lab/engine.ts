import {Nets,deviceClosed,initialMemory,pinKey,type LabProject,type Memory,type Rung} from './model';
import {compileST,runST,type Diagnostic,type STProgram} from './st';
import {solveDC} from './dc';
import {freshEquipment,stepEquipment,type State as EquipmentState} from './equipment/engine';
export type BlockState={elapsed:number;previous:boolean;count:number;timing:boolean;downPrevious?:boolean;initialized?:boolean};
export type Runtime={memory:Memory;relays:Record<string,boolean>;active:string[];livePins:string[];blocks:Record<string,BlockState>;level:number;seconds:number;cycle:number;fault:string|null;pump:boolean;drain:boolean;equipment:EquipmentState};
export function emptyRuntime(project:LabProject):Runtime{return {memory:initialMemory(project),relays:{},active:[],livePins:[],blocks:{},level:project.process.initialLevel,seconds:0,cycle:0,fault:null,pump:false,drain:false,equipment:freshEquipment()};}
export function compilePLC(project:LabProject):{diagnostics:Diagnostic[];st:STProgram|null}{
  if(project.plc.language==='st'){const st=compileST(project.plc.source,project.plc.tags);return {diagnostics:st.diagnostics,st};}
  const diagnostics:Diagnostic[]=[],tags=new Map(project.plc.tags.map(t=>[t.address,t]));
  for(const rung of project.plc.rungs){
    const output=tags.get(rung.output);
    if(!output)diagnostics.push({code:'L001',message:`Salida no declarada: ${rung.output||'(vacía)'}`,rung:rung.id});
    else if(output.type!=='bool'||/^(I|AI)/.test(output.address))diagnostics.push({code:'L002',message:'La bobina necesita una salida o memoria booleana.',rung:rung.id});
    for(const field of ['resetSignal','loadSignal','downSignal'] as const)if(rung[field]&&tags.get(rung[field]!)?.type!=='bool')diagnostics.push({code:'L006',message:`Entrada del bloque no declarada: ${rung[field]}`,rung:rung.id});
    if(['ctu','ctd','ctud'].includes(rung.mode)&&!Number.isInteger(rung.preset))diagnostics.push({code:'L007',message:'El contador necesita un ajuste entero.',rung:rung.id});
    if(rung.branches.length===0)diagnostics.push({code:'L003',message:'El segmento necesita al menos una rama.',rung:rung.id});
    for(const branch of rung.branches)for(const contact of branch)if(tags.get(contact.address)?.type!=='bool')diagnostics.push({code:'L004',message:`Contacto sin variable booleana: ${contact.address||'(vacía)'}`,rung:rung.id});
    if(['ton','tof','tp','ctu','ctd','ctud'].includes(rung.mode)&&(!Number.isFinite(rung.preset)||rung.preset<=0))diagnostics.push({code:'L005',message:'El ajuste del bloque debe ser mayor que cero.',rung:rung.id});
  }
  return {diagnostics,st:null};
}
function runRung(rung:Rung,memory:Memory,state:BlockState,dt:number):BlockState{
  const powered=rung.branches.some(branch=>branch.every(c=>c.negated?!memory[c.address]:!!memory[c.address]));
  let result=!!memory[rung.output];const next={...state};
  switch(rung.mode){
    case'coil':result=powered;break;case'set':if(powered)result=true;break;case'reset':if(powered)result=false;break;
    case'ton':next.elapsed=powered?state.elapsed+dt:0;result=powered&&next.elapsed+1e-9>=rung.preset;break;
    case'tof':if(powered){next.elapsed=0;next.timing=false;result=true;}else{if(state.previous){next.elapsed=0;next.timing=true;}if(next.timing){next.elapsed+=dt;if(next.elapsed+1e-9>=rung.preset)next.timing=false;}result=next.timing;}break;
    case'tp':{
      if(powered&&!state.previous&&!state.timing){next.timing=true;next.elapsed=0;}
      if(next.timing){next.elapsed+=dt;if(next.elapsed>=rung.preset-1e-9)next.timing=false;}
      result=next.timing;break;
    }
    case'rise':result=powered&&!state.previous;break;
    case'fall':result=!powered&&state.previous;break;
    case'ctu':case'ctd':case'ctud':{
      const down=!!memory[rung.downSignal??''];
      if(!state.initialized){next.count=rung.mode==='ctd'?rung.preset:0;next.initialized=true;}
      if(memory[rung.resetSignal??''])next.count=0;
      else if(memory[rung.loadSignal??''])next.count=rung.preset;
      else {const up=powered&&!state.previous,fall=down&&!state.downPrevious;
        if(rung.mode==='ctu'&&up)next.count=Math.min(1e9,next.count+1);
        if(rung.mode==='ctd'&&up)next.count=Math.max(0,next.count-1);
        if(rung.mode==='ctud'&&up!==fall)next.count=Math.max(0,Math.min(1e9,next.count+(up?1:-1)));
      }
      next.downPrevious=down;result=rung.mode==='ctd'?next.count<=0:next.count>=rung.preset;break;
    }
  }
  next.previous=powered;memory[rung.output]=result;return next;
}
export function solveSchematic(project:LabProject,pressed:Record<string,boolean>,memory:Memory,previous:Record<string,boolean>,controls:Record<string,boolean>={}){
  const {devices,wires}=project.schematic;const relays={...previous};let active:string[]=[],livePins:string[]=[];
  for(let pass=0;pass<32;pass++){
    const nets=new Nets();for(const d of devices){nets.find(`${d.id}:0`);nets.find(`${d.id}:1`);}for(const wire of wires)nets.join(pinKey(wire.from),pinKey(wire.to));
    for(const d of devices)if(deviceClosed(d,pressed,controls,memory,relays))nets.join(`${d.id}:0`,`${d.id}:1`);
    const supplies=devices.filter(d=>d.kind==='supply');
    if(supplies.some(d=>nets.find(`${d.id}:0`)===nets.find(`${d.id}:1`)))return {relays:{},active:[],livePins:[],fault:'Cortocircuito entre los polos de la fuente. Detén la simulación y revisa el cableado.'};
    const fixed:Record<string,number>={};for(const supply of supplies){fixed[nets.find(`${supply.id}:0`)]=24;fixed[nets.find(`${supply.id}:1`)]=0;}
    const loads=devices.filter(d=>['coil','lamp','motor','buzzer'].includes(d.kind));
    const dc=solveDC(loads.map(d=>({id:d.id,a:nets.find(`${d.id}:0`),b:nets.find(`${d.id}:1`),resistance:d.kind==='coil'?1200:d.kind==='lamp'?240:d.kind==='buzzer'?480:48})),fixed);
    if(dc.fault)return {relays:{},active:[],livePins:[],fault:dc.fault};
    active=loads.filter(d=>Math.abs((dc.volts[nets.find(`${d.id}:0`)]??0)-(dc.volts[nets.find(`${d.id}:1`)]??0))>=18).map(d=>d.id);
    livePins=devices.flatMap(d=>([0,1] as const).filter(pin=>(dc.volts[nets.find(`${d.id}:${pin}`)]??0)>1).map(pin=>`${d.id}:${pin}`));
    const next:Record<string,boolean>={};for(const d of devices.filter(d=>d.kind==='coil'))next[d.tag]=(next[d.tag]||false)||active.includes(d.id);
    if(Object.keys({...next,...relays}).every(tag=>!!next[tag]===!!relays[tag]))return {relays:next,active,livePins,fault:null};
    Object.keys(relays).forEach(k=>delete relays[k]);Object.assign(relays,next);
  }
  return {relays:{},active:[],livePins:[],fault:'La maniobra no se estabiliza. Revisa los contactos del circuito.'};
}
export function tick(project:LabProject,previous:Runtime,pressed:Record<string,boolean>,writes:Memory,dt:number,st:STProgram|null,controls:Record<string,boolean>={}):Runtime {
  if(previous.fault)return previous;let memory={...previous.memory,...writes};const blocks={...previous.blocks};
  for(const d of project.schematic.devices)if((d.kind==='no'||d.kind==='nc')&&d.signal)memory[d.signal]=!!pressed[d.id]||!!writes[d.signal];
  const config=project.process;
  memory[config.lowSignal]=previous.level<=config.low;memory[config.highSignal]=previous.level>=config.high;memory[config.levelSignal]=previous.level;
  // Physical PLC inputs are sampled from the preceding electrical scan, like an input image.
  for(const plc of project.equipment?.parts.filter(p=>p.kind==='plc')??[]){const volts=previous.equipment.volts,plus=volts[`${plc.id}:L+`],minus=volts[`${plc.id}:M`],voltage=plus&&minus?Math.hypot(plus.r-minus.r,plus.i-minus.i):0,powered=!!minus&&voltage>=18&&voltage<=30;
    for(let i=1;i<=8;i++){const address=`I0.${i-1}`,v=volts[`${plc.id}:I${i}`];if(project.plc.tags.some(t=>t.address===address&&t.type==='bool'))memory[address]=powered&&!!v&&!!minus&&Math.hypot(v.r-minus.r,v.i-minus.i)>=18;}
  }
  try {
    if(project.plc.language==='st'&&st)memory=runST(st,memory);
    else for(const rung of project.plc.rungs)blocks[rung.id]=runRung(rung,memory,blocks[rung.id]??{elapsed:0,previous:false,count:0,timing:false},dt);
    const schematic=solveSchematic(project,pressed,memory,previous.relays,controls);
    if(schematic.fault)return {...previous,...schematic,memory,blocks,fault:schematic.fault,pump:false};
    const pump=!!memory[config.pumpSignal];const delta=(pump?config.inflow:0)-(previous.drain?config.outflow:0);
    const level=Math.min(100,Math.max(0,previous.level+delta*dt/config.capacity*100));
    memory[config.levelSignal]=level;
    // Las entradas físicas conservan la imagen muestreada del PLC; la planta no las sobrescribe después del programa.
    const physicalPLC=project.equipment?.parts.some(p=>p.kind==='plc');
    if(!physicalPLC||!/^I0\.[0-7]$/.test(config.lowSignal))memory[config.lowSignal]=level<=config.low;
    if(!physicalPLC||!/^I0\.[0-7]$/.test(config.highSignal))memory[config.highSignal]=level>=config.high;
    const equipment=project.equipment?stepEquipment(project.equipment,previous.equipment,memory,controls,pressed,dt):previous.equipment;
    return {...previous,...schematic,memory,blocks,level,pump,equipment,seconds:previous.seconds+dt,cycle:previous.cycle+1,fault:null};
  }catch(error){return {...previous,fault:error instanceof Error?error.message:'Error de simulación.',pump:false,active:[],relays:{}};}
}
