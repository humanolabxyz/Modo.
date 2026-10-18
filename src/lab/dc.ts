import {HOLES,HOLE_BY_ID,IC_PIN_NAMES,Nets,bjtBase,icPinHoles,type LabProject,type ProtoComponent} from './model';
export type DCBranch={id:string;a:string;b:string;resistance:number;drop?:number};
/** Transistor NPN: base, colector y emisor como nodos; beta es la ganancia de corriente (hFE). */
export type BJT={id:string;b:string;c:string;e:string;beta:number;pnp?:boolean};
export type BJTRegion='corte'|'activa'|'saturación';
export type BJTState={ib:number;ic:number;vbe:number;vce:number;region:BJTRegion};
export type DCResult={volts:Record<string,number>;amps:Record<string,number>;floating:string[];fault:string|null;bjts:Record<string,BJTState>};
const BJT_VBE=.7,BJT_RB=10,BJT_VCE_SAT=.2,BJT_RCE=2;

/** Nodal DC model with fixed source nodes, a piecewise linear LED approximation and a three-region NPN model
 *  (corte / activa con Ic = beta·Ib / saturación con Vce≈0,2 V). Didáctico: sin efecto Early, capacidades ni temperatura. */
export function solveDC(branches:DCBranch[],fixed:Record<string,number>,transistors:BJT[]=[]):DCResult {
  const adjacency=new Map<string,Set<string>>();
  const link=(x:string,y:string)=>{if(!adjacency.has(x))adjacency.set(x,new Set());if(!adjacency.has(y))adjacency.set(y,new Set());adjacency.get(x)!.add(y);adjacency.get(y)!.add(x);};
  for(const b of branches)link(b.a,b.b);
  for(const t of transistors){link(t.b,t.e);link(t.c,t.e);}
  const reachable=new Set(Object.keys(fixed)),queue=[...reachable];for(let i=0;i<queue.length;i++)for(const next of adjacency.get(queue[i])??[])if(!reachable.has(next)){reachable.add(next);queue.push(next);}
  const nodes=[...reachable].filter(id=>!(id in fixed)),lookup=new Map(nodes.map((id,i)=>[id,i]));
  const floating=[...adjacency.keys()].filter(id=>!reachable.has(id));
  const failure=(fault:string):DCResult=>({volts:{},amps:{},floating,fault,bjts:{}});
  let volts={...fixed};let converged=false;
  if(nodes.length>500)return failure('La red supera la capacidad de cálculo de esta versión.');
  const active=transistors.filter(t=>reachable.has(t.b)&&reachable.has(t.e)&&t.b!==t.e);
  const regions=new Map<string,BJTRegion>(active.map(t=>[t.id,'corte']));
  /* Un nodo que solo se une a la red a través de uniones de transistor en corte no tiene referencia: una conductancia mínima a tierra evita tensiones inventadas por las fugas. */
  const gminNodes=new Set(active.flatMap(t=>[t.b,t.c,t.e]).filter(id=>lookup.has(id)));
  for(let iteration=0;iteration<120;iteration++){
    const matrix=nodes.map(()=>new Float64Array(nodes.length+1));
    const add=(row:string,col:string,coefficient:number)=>{const i=lookup.get(row);if(i===undefined)return;const j=lookup.get(col);if(j!==undefined)matrix[i][j]+=coefficient;else matrix[i][nodes.length]-=coefficient*(fixed[col]??0);};
    const rhs=(row:string,value:number)=>{const i=lookup.get(row);if(i!==undefined)matrix[i][nodes.length]+=value;};
    for(const branch of branches){
      if(!reachable.has(branch.a)||!reachable.has(branch.b)||branch.a===branch.b)continue;
      const conducting=branch.drop===undefined||((volts[branch.a]??0)-(volts[branch.b]??0))>branch.drop;
      const conductance=conducting?1/branch.resistance:1e-8;
      const drop=conducting?(branch.drop??0):0;
      for(const [a,b,sign] of [[branch.a,branch.b,1],[branch.b,branch.a,-1]] as const){
        const i=lookup.get(a);if(i===undefined)continue;matrix[i][i]+=conductance;
        const j=lookup.get(b);if(j!==undefined)matrix[i][j]-=conductance;else matrix[i][nodes.length]+=conductance*fixed[b];
        matrix[i][nodes.length]+=sign*conductance*drop;
      }
    }
    let regionChanged=false;
    for(const t of active){
      const s=t.pnp?-1:1,vb=volts[t.b]??0,ve=volts[t.e]??0,vc=volts[t.c]??ve,vbe=s*(vb-ve),vce=s*(vc-ve),on=vbe>BJT_VBE,before=regions.get(t.id)!;
      let region:BJTRegion=before;
      if(!on)region='corte';
      else if(before==='corte')region='activa';
      else if(before==='activa'&&vce<BJT_VCE_SAT)region='saturación';
      else if(before==='saturación'&&(vce-BJT_VCE_SAT)/BJT_RCE>t.beta*(vbe-BJT_VBE)/BJT_RB)region='activa';
      if(region!==before){regionChanged=true;regions.set(t.id,region);}
      const gb=on?1/BJT_RB:1e-8,db=on?BJT_VBE:0;
      add(t.b,t.b,gb);add(t.b,t.e,-gb);rhs(t.b,s*gb*db);add(t.e,t.e,gb);add(t.e,t.b,-gb);rhs(t.e,-s*gb*db);
      if(!reachable.has(t.c))continue;
      if(region==='corte'){add(t.c,t.c,1e-8);add(t.c,t.e,-1e-8);add(t.e,t.e,1e-8);add(t.e,t.c,-1e-8);}
      else if(region==='activa'){const k=t.beta/BJT_RB;add(t.c,t.b,k);add(t.c,t.e,-k);rhs(t.c,s*k*BJT_VBE);add(t.e,t.b,-k);add(t.e,t.e,k);rhs(t.e,-s*k*BJT_VBE);add(t.c,t.c,1e-8);add(t.c,t.e,-1e-8);add(t.e,t.e,1e-8);add(t.e,t.c,-1e-8);}
      else{const g=1/BJT_RCE;add(t.c,t.c,g);add(t.c,t.e,-g);rhs(t.c,s*g*BJT_VCE_SAT);add(t.e,t.e,g);add(t.e,t.c,-g);rhs(t.e,-s*g*BJT_VCE_SAT);}
    }
    for(const id of gminNodes){const i=lookup.get(id)!;matrix[i][i]+=1e-7;}
    for(let col=0;col<nodes.length;col++){
      let pivot=col;for(let row=col+1;row<nodes.length;row++)if(Math.abs(matrix[row][col])>Math.abs(matrix[pivot][col]))pivot=row;
      if(Math.abs(matrix[pivot][col])<1e-14)return failure('No se puede resolver esta red: revisa conexiones y referencia de tensión.');
      [matrix[pivot],matrix[col]]=[matrix[col],matrix[pivot]];
      const divisor=matrix[col][col];for(let j=col;j<=nodes.length;j++)matrix[col][j]/=divisor;
      for(let row=0;row<nodes.length;row++)if(row!==col){const scale=matrix[row][col];if(scale===0)continue;for(let j=col;j<=nodes.length;j++)matrix[row][j]-=scale*matrix[col][j];}
    }
    const next={...fixed};nodes.forEach((id,i)=>{next[id]=matrix[i][nodes.length];});
    if(!regionChanged&&nodes.every(id=>Math.abs((volts[id]??0)-next[id])<1e-8)){volts=next;converged=true;break;}
    volts=next;
  }
  if(!converged&&nodes.length)return failure(transistors.length?'El modelo del transistor no converge en este montaje. Revisa la resistencia de base y las conexiones.':'El modelo de diodo no converge en este montaje. Revisa polaridad y resistencia.');
  /* Alcance real: las uniones de transistor en corte no unen sus nodos; lo que queda sin camino a la fuente se declara sin referencia. */
  let floatingAll=floating;
  if(active.length){
    const live=new Set(Object.keys(fixed)),edges=new Map<string,Set<string>>(),join=(x:string,y:string)=>{if(!edges.has(x))edges.set(x,new Set());if(!edges.has(y))edges.set(y,new Set());edges.get(x)!.add(y);edges.get(y)!.add(x);};
    for(const b of branches)join(b.a,b.b);
    for(const t of transistors){if((regions.get(t.id)??'corte')!=='corte'){join(t.b,t.e);join(t.c,t.e);}}
    const pending=[...live];for(let i=0;i<pending.length;i++)for(const next of edges.get(pending[i])??[])if(!live.has(next)){live.add(next);pending.push(next);}
    const lost=Object.keys(volts).filter(id=>!live.has(id)&&!(id in fixed));
    if(lost.length){volts={...volts};for(const id of lost)delete volts[id];floatingAll=[...new Set([...floating,...lost])];}
  }
  const amps:Record<string,number>={},bjts:Record<string,BJTState>={};
  for(const b of branches)if(volts[b.a]!==undefined&&volts[b.b]!==undefined)amps[b.id]=b.drop===undefined?(volts[b.a]-volts[b.b])/b.resistance:Math.max(0,(volts[b.a]-volts[b.b]-b.drop)/b.resistance);
  for(const t of transistors){
    const region=regions.get(t.id)??'corte',vb=volts[t.b],ve=volts[t.e],vc=volts[t.c];
    if(vb===undefined||ve===undefined){bjts[t.id]={ib:0,ic:0,vbe:0,vce:0,region:'corte'};amps[t.id]=0;continue;}
    const sg=t.pnp?-1:1,vbe=sg*(vb-ve),vce=sg*((vc??ve)-ve),ib=region==='corte'?0:Math.max(0,(vbe-BJT_VBE)/BJT_RB),ic=region==='corte'?0:region==='activa'?t.beta*ib:Math.max(0,(vce-BJT_VCE_SAT)/BJT_RCE);
    bjts[t.id]={ib,ic,vbe,vce,region};amps[t.id]=ic;
  }
  return {volts,amps,floating:floatingAll,fault:null,bjts};
}

export type IcPin={name:string;level:'high'|'low'|'off'|'none'};
export type IcState={powered:boolean;pins:IcPin[]};
export type BreadboardResult=DCResult&{holeVolts:Record<string,number>;groups:Record<string,string>;warnings:string[];ics:Record<string,IcState>;failures:Record<string,string>;damaged:Record<string,string>;tripped:boolean;sourceCurrent:number;meterCurrent?:number};
export type SolveOptions={
  /** Amperímetro en serie entre dos orificios (resistencia de carga de 0,1 Ω, fusible de 10 A). */
  ammeter?:{a:string;b:string};
  /** Activa fallas por sobreesfuerzo (LED, resistencia, transistor, L293D, fusible del multímetro, protección de la fuente). */
  failures?:boolean;
  /** Componentes ya dañados en esta simulación: se comportan como circuito abierto. */
  damaged?:Record<string,string>;
  sourceLimit?:number;
};
const LOGIC_HIGH=2.3,VSS_MIN=4.5,VSS_MAX=7,IC_OUT_LIMIT=.6,AMMETER_OHMS=.1,AMMETER_FUSE=10;
export const SOURCE_LIMIT=3;
/** Canales del L293D: [salida, entrada, habilitación] como posiciones de pin (0 = pin 1). */
const IC_CHANNELS=[[2,1,0],[5,6,0],[10,9,8],[13,14,8]] as const;

/** Valores reales: cada pieza se desvía de su valor nominal de forma estable (depende solo de su identidad). */
function jitter(id:string,salt:string){let h=2166136261;for(const ch of `${id}|${salt}`){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return ((h>>>0)/4294967295)*2-1;}
export function actualValue(c:{id:string;kind:string;value:number},realistic:boolean|undefined):number{
  if(!realistic)return c.value;
  const triangular=(spread:number)=>1+spread*(jitter(c.id,'a')+jitter(c.id,'b'))/2;
  if(c.kind==='resistor'||c.kind==='motor')return c.value*triangular(.05);
  if(c.kind==='bjt')return c.value*(1+.3*jitter(c.id,'beta'));
  if(c.kind==='led'||c.kind==='diode')return c.value*triangular(.03);
  return c.value;
}
type Pass={result:BreadboardResult;stress:Record<string,string>};
function solveOnce(board:LabProject['breadboard'],switches:Record<string,boolean>,options:SolveOptions,dead:Set<string>):Pass {
  const nets=new Nets();for(const hole of HOLES)nets.join(hole.id,hole.group);
  const closedOf=(c:ProtoComponent)=>switches[c.id]??(c.kind==='button'?false:c.closed);
  for(const c of board.components)if(c.kind==='wire'||(c.kind==='switch'||c.kind==='button')&&closedOf(c))nets.join(c.from,c.to);
  const groups=Object.fromEntries(HOLES.map(h=>[h.id,nets.find(h.id)])),positive=nets.find(board.positive),negative=nets.find(board.negative);
  const none={failures:{},damaged:{},tripped:false,sourceCurrent:0};
  const empty={volts:{},amps:{},floating:[],holeVolts:{},groups,warnings:[],ics:{},bjts:{},...none};
  if(positive===negative)return {result:{...empty,fault:'Cortocircuito: los dos polos de la fuente están unidos.'},stress:{}};
  const live=board.components.filter(c=>!dead.has(c.id)),real=(c:ProtoComponent)=>actualValue(c,board.realistic);
  const branches:DCBranch[]=live.filter(c=>c.kind==='resistor'||c.kind==='led'||c.kind==='motor'||c.kind==='diode').map(c=>({id:c.id,a:nets.find(c.from),b:nets.find(c.to),resistance:c.kind==='led'?10:c.kind==='diode'?1:real(c),...c.kind==='led'||c.kind==='diode'?{drop:real(c)}:{}}));
  const meterNets=options.ammeter&&!dead.has('meter')?[nets.find(options.ammeter.a),nets.find(options.ammeter.b)]:null;
  if(meterNets&&meterNets[0]!==meterNets[1])branches.push({id:'meter',a:meterNets[0],b:meterNets[1],resistance:AMMETER_OHMS});
  const transistors:BJT[]=live.filter(c=>c.kind==='bjt').flatMap(c=>{const base=bjtBase(c.from,c.to);return base?[{id:c.id,e:nets.find(c.from),b:nets.find(base),c:nets.find(c.to),beta:real(c),pnp:c.polarity==='pnp'}]:[];});
  const fixed:Record<string,number>={[positive]:board.voltage,[negative]:0};
  let result=solveDC(branches,fixed,transistors);
  const warnings:string[]=[],ics:Record<string,IcState>={},stress:Record<string,string>={},highDrives:string[]=[],lowDrives:string[]=[];
  /* L293D didáctico: lectura lógica con la red sin excitar las salidas; después las salidas activas fijan su tensión (VS o GND). */
  const chips=board.components.filter(c=>c.kind==='l293d');
  let drives:Record<string,number>={};
  if(chips.length&&!result.fault){
    const first=result,level=(hole:string)=>first.volts[nets.find(hole)];
    let conflict:string|null=null;
    for(const chip of chips){
      const pins=icPinHoles(chip.from);if(!pins)continue;
      if(dead.has(chip.id)){ics[chip.id]={powered:false,pins:IC_PIN_NAMES.map(name=>({name,level:'none' as const}))};continue;}
      const vss=level(pins[15]),vs=level(pins[7]),gnd=[3,4,11,12].map(i=>level(pins[i])).find(v=>v!==undefined);
      const powered=vss!==undefined&&vss>=VSS_MIN&&gnd!==undefined&&Math.abs(gnd)<.5;
      if(vss!==undefined&&vss>VSS_MAX)warnings.push(`L293D: VSS = ${vss.toFixed(1).replace('.',',')} V; la hoja de datos típica indica de 4,5 a 7 V para la lógica.`);
      else if(vss!==undefined&&vss<VSS_MIN)warnings.push('L293D sin alimentación lógica: VSS debe ser de al menos 4,5 V.');
      else if(vss===undefined)warnings.push('L293D sin alimentación: el pin VSS (16) no llega a la fuente.');
      if(powered&&vs===undefined)warnings.push('L293D: el pin VS (8) no llega a la fuente; las salidas quedan desactivadas.');
      const state:IcPin[]=IC_PIN_NAMES.map(name=>({name,level:'none'}));
      for(const [outPin,inPin,enPin] of IC_CHANNELS){
        const input=level(pins[inPin]),enable=level(pins[enPin]);
        state[inPin].level=input!==undefined&&input>=LOGIC_HIGH?'high':'low';state[enPin].level=enable!==undefined&&enable>=LOGIC_HIGH?'high':'low';
        const active=powered&&vs!==undefined&&state[enPin].level==='high';
        if(!active){state[outPin].level='off';continue;}
        const high=state[inPin].level==='high',volts=high?vs!:gnd!,net=nets.find(pins[outPin]);
        state[outPin].level=high?'high':'low';
        if(drives[net]!==undefined&&Math.abs(drives[net]-volts)>1e-9||net in fixed&&Math.abs(fixed[net]-volts)>1e-9)conflict=`Salida ${IC_PIN_NAMES[outPin]} del L293D unida a otra tensión fija (fuente u otra salida activa).`;
        drives[net]=volts;(high?highDrives:lowDrives).push(net);
      }
      ics[chip.id]={powered,pins:state};
    }
    if(conflict)return {result:{...empty,ics,warnings,fault:conflict},stress:{}};
    if(Object.keys(drives).length){
      result=solveDC(branches,{...fixed,...drives},transistors);
      if(!result.fault)for(const net of Object.keys(drives)){let out=0;for(const b of branches){const i=result.amps[b.id];if(i===undefined)continue;if(b.a===net)out+=i;if(b.b===net)out-=i;}
        const chip=chips.find(c=>{const pins=icPinHoles(c.from);return pins?.some(h=>nets.find(h)===net);});
        if(Math.abs(out)>IC_OUT_LIMIT)warnings.push(`L293D: una salida entrega ${(Math.abs(out)*1000).toFixed(0)} mA; supera los 600 mA por canal de la hoja de datos típica.`);
        if(chip&&Math.abs(out)>2*IC_OUT_LIMIT)stress[chip.id]=`salida sobrecargada: ${(Math.abs(out)*1000).toFixed(0)} mA`;}
    }
  }
  const voltOf=(hole:string)=>result.volts[nets.find(hole)];
  for(const c of live){const current=result.amps[c.id],a=voltOf(c.from),b=voltOf(c.to);
    if(c.kind==='led'&&current!==undefined&&current>.02)warnings.push(`LED ${c.id.slice(-4)}: ${(current*1000).toFixed(1)} mA; supera la referencia didáctica de 20 mA.`);
    if(c.kind==='led'&&current!==undefined&&current>.05)stress[c.id]=`sobrecorriente: ${(current*1000).toFixed(0)} mA`;
    if(c.kind==='led'&&a!==undefined&&b!==undefined&&a-b< -5){warnings.push('LED con tensión inversa elevada en el modelo.');stress[c.id]=`tensión inversa de ${(b-a).toFixed(1).replace('.',',')} V`;}
    if(c.kind==='resistor'&&current!==undefined){const power=current*current*real(c);if(power>.25)warnings.push(`Resistencia ${c.id.slice(-4)}: potencia superior a 0,25 W.`);if(power>.5)stress[c.id]=`sobrecalentamiento: ${power.toFixed(2).replace('.',',')} W`;}
    if(c.kind==='diode'&&current!==undefined){if(current>1)warnings.push(`Diodo ${c.id.slice(-4)}: ${(current*1000).toFixed(0)} mA; supera 1 A, la corriente continua de un 1N4007.`);if(current>2)stress[c.id]=`sobrecorriente: ${current.toFixed(1).replace('.',',')} A`;}
    if(c.kind==='bjt'){const t=result.bjts[c.id];if(t){if(t.ic>.6)warnings.push(`Transistor ${c.id.slice(-4)}: Ic = ${(t.ic*1000).toFixed(0)} mA; supera los 600 mA típicos de un 2N2222 en TO-92.`);if(t.region!=='corte'&&t.ic*t.vce>.625)warnings.push(`Transistor ${c.id.slice(-4)}: potencia superior a 0,625 W (TO-92).`);if(t.ib>.05)warnings.push(`Transistor ${c.id.slice(-4)}: corriente de base de ${(t.ib*1000).toFixed(0)} mA; falta una resistencia de base.`);
      if(t.ic>1)stress[c.id]=`sobrecorriente de colector: ${(t.ic*1000).toFixed(0)} mA`;else if(t.region!=='corte'&&t.ic*t.vce>1)stress[c.id]=`sobrecalentamiento: ${(t.ic*t.vce).toFixed(1).replace('.',',')} W`;else if(t.ib>.1)stress[c.id]=`corriente de base excesiva: ${(t.ib*1000).toFixed(0)} mA`;}}
  }
  const meterCurrent=meterNets?(meterNets[0]===meterNets[1]?0:result.amps.meter):undefined;
  if(meterCurrent!==undefined&&Math.abs(meterCurrent)>AMMETER_FUSE)stress.meter=`corriente de ${Math.abs(meterCurrent).toFixed(1).replace('.',',')} A en el amperímetro`;
  /* Corriente que entrega la fuente: lo que sale por el polo + más lo que aportan las salidas altas del L293D desde VS */
  const outflow=(net:string)=>{let out=0;for(const b of branches){const i=result.amps[b.id];if(i===undefined)continue;if(b.a===net)out+=i;if(b.b===net)out-=i;}for(const t of transistors){const st=result.bjts[t.id];if(!st)continue;const sg=t.pnp?-1:1;if(t.c===net)out+=sg*st.ic;if(t.b===net)out+=sg*st.ib;if(t.e===net)out-=sg*(st.ic+st.ib);}return out;};
  const sourceCurrent=result.fault?0:Math.max(0,outflow(positive)+highDrives.reduce((sum,n)=>sum+Math.max(0,outflow(n)),0));
  if(result.floating.length)warnings.push('Hay partes del circuito sin referencia a la fuente; no se asigna una medida de tensión a esos nodos.');
  const full:BreadboardResult={...result,groups,ics,failures:{},damaged:{},tripped:false,sourceCurrent,meterCurrent,warnings:[...new Set(warnings)],holeVolts:Object.fromEntries(HOLES.filter(h=>result.volts[groups[h.id]]!==undefined).map(h=>[h.id,result.volts[groups[h.id]]]))};
  return {result:full,stress};
}
export function solveBreadboard(board:LabProject['breadboard'],switches:Record<string,boolean>={},options:SolveOptions={}):BreadboardResult {
  const damaged:Record<string,string>={...options.damaged},failures:Record<string,string>={};
  let pass=solveOnce(board,switches,options,new Set(Object.keys(damaged)));
  if(options.failures){
    for(let round=0;round<10;round++){
      const found=Object.fromEntries(Object.entries(pass.stress).filter(([id])=>!(id in damaged)));
      if(Object.keys(found).length){Object.assign(damaged,found);Object.assign(failures,found);pass=solveOnce(board,switches,options,new Set(Object.keys(damaged)));continue;}
      const limit=options.sourceLimit??SOURCE_LIMIT;
      if(pass.result.sourceCurrent>limit){
        const amps=pass.result.sourceCurrent;
        return {...pass.result,volts:{},amps:{},holeVolts:{},bjts:{},ics:{},floating:[],failures,damaged,tripped:true,sourceCurrent:amps,fault:`Protección de la fuente: pidió ${amps.toFixed(1).replace('.',',')} A y el límite es ${limit} A. La fuente se apagó; detén la simulación y revisa el circuito.`};
      }
      break;
    }
  }
  return {...pass.result,failures,damaged};
}

/** Óhmetro: se mide con el circuito sin energía (la fuente se retira). Devuelve null si está abierto («OL»). */
export function measureResistance(board:LabProject['breadboard'],switches:Record<string,boolean>,a:string,b:string,damaged:Record<string,string>={}):{ohms:number|null;short:boolean}{
  const nets=new Nets();for(const hole of HOLES)nets.join(hole.id,hole.group);
  for(const c of board.components)if(c.kind==='wire'||(c.kind==='switch'||c.kind==='button')&&(switches[c.id]??(c.kind==='button'?false:c.closed)))nets.join(c.from,c.to);
  const na=nets.find(a),nb=nets.find(b);if(na===nb)return {ohms:0,short:true};
  const live=board.components.filter(c=>!(c.id in damaged)),real=(c:ProtoComponent)=>actualValue(c,board.realistic);
  const branches:DCBranch[]=live.filter(c=>c.kind==='resistor'||c.kind==='led'||c.kind==='motor'||c.kind==='diode').map(c=>({id:c.id,a:nets.find(c.from),b:nets.find(c.to),resistance:c.kind==='led'?10:c.kind==='diode'?1:real(c),...c.kind==='led'||c.kind==='diode'?{drop:real(c)}:{}}));
  const transistors:BJT[]=live.filter(c=>c.kind==='bjt').flatMap(c=>{const base=bjtBase(c.from,c.to);return base?[{id:c.id,e:nets.find(c.from),b:nets.find(base),c:nets.find(c.to),beta:real(c),pnp:c.polarity==='pnp'}]:[];});
  const test=.4,result=solveDC(branches,{[na]:test,[nb]:0},transistors);if(result.fault)return {ohms:null,short:false};
  let current=0;for(const br of branches){const i=result.amps[br.id];if(i===undefined)continue;if(br.a===na)current+=i;if(br.b===na)current-=i;}
  if(Math.abs(current)<4e-8)return {ohms:null,short:false};
  return {ohms:test/Math.abs(current),short:false};
}
/** Redes eléctricas del tablero (columnas, rieles y puentes/interruptores/pulsadores cerrados) sin resolver tensiones. */
export function netGroups(board:LabProject['breadboard'],switches:Record<string,boolean>={}):Record<string,string> {
  const nets=new Nets();for(const hole of HOLES)nets.join(hole.id,hole.group);
  for(const c of board.components)if(c.kind==='wire'||(c.kind==='switch'||c.kind==='button')&&(switches[c.id]??(c.kind==='button'?false:c.closed)))nets.join(c.from,c.to);
  return Object.fromEntries(HOLES.map(h=>[h.id,nets.find(h.id)]));
}
export function holeName(id:string){return HOLE_BY_ID.has(id)?id.replace(':','').replace('top+','+ superior ').replace('top-','− superior ').replace('bottom+','+ inferior ').replace('bottom-','− inferior '):id;}
