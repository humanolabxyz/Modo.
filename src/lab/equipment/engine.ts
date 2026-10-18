import {Nets,type Memory} from '../model';
import {key,maintained,ports,type Board,type Part} from './model';
export type Complex={r:number;i:number};
export type Reading={voltage:number;current:number;power:number;energy:number;cost:number;frequency:number;rpm:number;soc:number;active:boolean;closed:boolean;reverse:boolean;status:string};
export type State={readings:Record<string,Reading>;contacts:Record<string,boolean>;hz:Record<string,number>;reverse:Record<string,boolean>;soc:Record<string,number>;energy:Record<string,number>;volts:Record<string,Complex>;live:string[];warnings:string[];fault:string|null};
type Branch={id:string;a:string;b:string;r:number};
type Source={owner:string;positive:string;negative:string;v:Complex;r:number;frequency:number};
const zero:Complex={r:0,i:0},mag=(v:Complex)=>Math.hypot(v.r,v.i),sub=(a:Complex,b:Complex):Complex=>({r:a.r-b.r,i:a.i-b.i});
const phase=(v:number,angle:number):Complex=>({r:v*Math.cos(angle),i:v*Math.sin(angle)});
const pkey=(p:Part,port:string)=>key({part:p.id,port});
const mains=(kind:string)=>kind==='ac'||kind==='threephase';
export const freshEquipment=():State=>({readings:{},contacts:{},hz:{},reverse:{},soc:{},energy:{},volts:{},live:[],warnings:[],fault:null});

/** Nodal resistive equivalents with complex RMS sources. No inductance, PWM or certified protection curves. */
function solve(branches:Branch[],fixed:Record<string,Complex>):{volts:Record<string,Complex>;amps:Record<string,Complex>} {
 const all=[...new Set(branches.flatMap(b=>[b.a,b.b]))],adj=new Map<string,string[]>();
 for(const b of branches){adj.set(b.a,[...(adj.get(b.a)??[]),b.b]);adj.set(b.b,[...(adj.get(b.b)??[]),b.a]);}
 // Unreferenced islands remain unknown. Never silently ground a real PE terminal.
 const referenced=new Set<string>(),stack=Object.keys(fixed);while(stack.length){const n=stack.pop()!;if(referenced.has(n))continue;referenced.add(n);stack.push(...(adj.get(n)??[]));}
 const nodes=all.filter(n=>referenced.has(n)&&!fixed[n]),index=new Map(nodes.map((n,i)=>[n,i]));
 if(nodes.length>320)throw new Error('La red supera la capacidad de cálculo de esta versión. Divide el montaje.');
 const n=nodes.length,a=nodes.map(()=>new Float64Array(n+2));
 for(const b of branches){if(b.a===b.b||!referenced.has(b.a))continue;const g=1/b.r;
  for(const [x,y]of [[b.a,b.b],[b.b,b.a]]){const i=index.get(x);if(i===undefined)continue;a[i][i]+=g;const j=index.get(y);if(j===undefined){a[i][n]+=g*(fixed[y]?.r??0);a[i][n+1]+=g*(fixed[y]?.i??0);}else a[i][j]-=g;}
 }
 for(let c=0;c<n;c++){let pivot=c;for(let r=c+1;r<n;r++)if(Math.abs(a[r][c])>Math.abs(a[pivot][c]))pivot=r;
  if(Math.abs(a[pivot][c])<1e-14)throw new Error('Red sin referencia suficiente o conexiones incompatibles.');[a[c],a[pivot]]=[a[pivot],a[c]];
  const divisor=a[c][c];for(let j=c;j<n+2;j++)a[c][j]/=divisor;
  for(let r=c+1;r<n;r++){const g=a[r][c];if(!g)continue;for(let j=c;j<n+2;j++)a[r][j]-=g*a[c][j];}
 }
 const volts={...fixed};for(let r=n-1;r>=0;r--){let vr=a[r][n],vi=a[r][n+1];for(let j=r+1;j<n;j++){vr-=a[r][j]*volts[nodes[j]].r;vi-=a[r][j]*volts[nodes[j]].i;}volts[nodes[r]]={r:vr,i:vi};}
 const amps:Record<string,Complex>={};for(const b of branches){if(!volts[b.a]||!volts[b.b])continue;const d=sub(volts[b.a],volts[b.b]);amps[b.id]={r:d.r/b.r,i:d.i/b.r};}
 return {volts,amps};
}

export function stepEquipment(board:Board,previous:State,memory:Memory,controls:Record<string,boolean>,pressed:Record<string,boolean>,dt:number):State {
 const state:State={...freshEquipment(),contacts:{...previous.contacts},hz:{...previous.hz},reverse:{...previous.reverse},soc:{...previous.soc},energy:{...previous.energy}};
 const activeIds=new Set(board.parts.map(p=>p.id));for(const store of [state.contacts,state.hz,state.reverse,state.soc,state.energy])for(const id of Object.keys(store))if(!activeIds.has(id))delete store[id];
 dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,2)):0;
 const control=(p:Part)=>controls[p.id]??p.closed;
 let lastVolts=previous.volts,lastPower:Record<string,number>={},stable=false,net=new Nets(),amps:Record<string,Complex>={},sources:Source[]=[],frequency:Record<string,number>={};
 const read=(p:Part,a:string,b:string,values=lastVolts)=>sub(values[pkey(p,a)]??zero,values[pkey(p,b)]??zero);
 const warnings=new Set<string>(),conversionScale:Record<string,number>={};
 try {
  for(let pass=0;pass<12;pass++){
   net=new Nets();for(const p of board.parts)for(const port of ports(p.kind))net.find(pkey(p,port.id));for(const w of board.wires)net.join(key(w.from),key(w.to));
   const join=(p:Part,a:string,b:string)=>net.join(pkey(p,a),pkey(p,b));
   for(const p of board.parts){
    const on=control(p),kind=p.kind;
    if(kind==='terminal')join(p,'1','2');if(kind==='busbar')for(const port of ['2','3','4'])join(p,'1',port);
    if(['breaker','fuse','emergency'].includes(kind)&&on)join(p,'1','2');
    if((kind==='push-no'&&pressed[p.id])||(kind==='push-nc'&&!pressed[p.id]))join(p,kind==='push-no'?'3':'1',kind==='push-no'?'4':'2');
    if(kind==='selector'&&on)join(p,'3','4');
    if((kind==='breaker2'||kind==='differential')&&on){join(p,'1','2');join(p,'3','4');}
    if((kind==='breaker3'||kind==='guard')&&on)for(let i=1;i<=5;i+=2)join(p,''+i,''+(i+1));
    if(kind==='thermal'){for(let i=1;i<=3;i++)join(p,'L'+i,'T'+i);join(p,on?'95':'97',on?'96':'98');}
    if(kind==='contactor'){if(state.contacts[p.id]){for(let i=1;i<=3;i++)join(p,'L'+i,'T'+i);join(p,'13','14');}else join(p,'21','22');}
    if(kind==='aux-no'||kind==='aux-nc'){const energized=board.parts.some(c=>c.kind==='contactor'&&c.tag===p.tag&&state.contacts[c.id]);if(kind==='aux-no'?energized:!energized)join(p,kind==='aux-no'?'13':'21',kind==='aux-no'?'14':'22');}
    if(kind==='plc'&&mag(read(p,'L+','M'))>=18&&mag(read(p,'L+','M'))<=30)for(let i=1;i<=4;i++)if(memory['Q0.'+(i-1)])join(p,'C'+i,'Q'+i);
    if(kind==='controller'){join(p,'BAT+','LOAD+');join(p,'BAT−','LOAD−');join(p,'PV−','BAT−');}
    if(kind==='vfd'||kind==='vfd3')join(p,'PE','PEo');
   }
   const root=(p:Part,port:string)=>net.find(pkey(p,port));
   const branches:Branch[]=[],fixed:Record<string,Complex>={};sources=[];frequency={};
   const branch=(id:string,a:string,b:string,r:number)=>branches.push({id,a,b,r:Math.max(.000001,r)});
   const load=(p:Part,a:string,b:string,r:number,id=p.id)=>branch(id,root(p,a),root(p,b),r);
   const source=(p:Part,plus:string,minus:string,v:Complex,resistance=.000001,f=0)=>{const positive=root(p,plus),negative=root(p,minus);if(positive===negative&&mag(v)>1)throw new Error(`${p.tag}: cortocircuito entre los polos de la fuente.`);sources.push({owner:p.id,positive,negative,v,r:resistance,frequency:f});};
   for(const p of board.parts){const q=p.params,kind=p.kind;
    if(kind==='dc')source(p,'+','−',{r:q.voltage,i:0});
    if(kind==='ac')source(p,'L','N',{r:q.voltage,i:0},.000001,q.frequency);
    if(kind==='threephase')for(let i=0;i<3;i++)source(p,'L'+(i+1),'N',phase(q.voltage/Math.sqrt(3),-i*2*Math.PI/3),.000001,q.frequency);
    if(kind==='pv')source(p,'+','−',{r:q.irradiance>0?q.voltage:0,i:0},Math.max(.05,q.voltage*q.voltage/(4*q.power*Math.max(.001,q.irradiance/1000))));
    if(kind==='battery'){const soc=state.soc[p.id]??q.soc;source(p,'+','−',{r:q.voltage*(.9+.2*soc/100),i:0},soc<=0?1e8:.4);}
    if(kind==='contactor')load(p,'A1','A2',1200);
    if(kind==='lamp'||kind==='buzzer')load(p,'1','2',q.voltage*q.voltage/q.power);
    if(kind==='motor')load(p,'L','N',q.voltage*q.voltage/q.power);
    if(kind==='motor3')for(const [a,b]of [['U1','U2'],['V1','V2'],['W1','W2']])load(p,a,b,q.voltage*q.voltage/q.power,p.id+':'+a);
    if(kind==='voltmeter')load(p,'V+','V−',1e7);
    if(kind==='ammeter')load(p,'A1','A2',.01);
    if(kind==='wattmeter'||kind==='energy'){load(p,'I1','I2',.01);load(p,'V+','V−',1e7,p.id+':V');}
    if(kind==='plc'){load(p,'L+','M',240);for(let i=1;i<=8;i++)load(p,'I'+i,'M',10000,p.id+':I'+i);}
    if(kind==='vfd'||kind==='vfd3'){
     const single=kind==='vfd',input=single?mag(read(p,'L','N')):[mag(read(p,'L1','L2')),mag(read(p,'L2','L3')),mag(read(p,'L3','L1'))].reduce((a,b)=>a+b)/3;
     const expected=q.voltage,powered=input>=expected*.8&&input<=expected*1.15;
     const phases=single?[]:[mag(read(p,'L1','L2')),mag(read(p,'L2','L3')),mag(read(p,'L3','L1'))];
     const unbalanced=phases.length>0&&Math.max(...phases)-Math.min(...phases)>input*.1;
     const outputRoots=['U','V','W'].map(port=>root(p,port)),conflict=new Set(outputRoots).size<3||board.parts.some(s=>s.id!==p.id&&(mains(s.kind)||s.kind==='dc'||s.kind==='battery')&&ports(s.kind).some(port=>!port.id.startsWith('PE')&&outputRoots.includes(root(s,port.id))));
     if(conflict)warnings.add(`${p.tag}: salidas U/V/W unidas o conectadas a una fuente.`);
     if(input>1&&(!powered||unbalanced))warnings.add(`${p.tag}: alimentación fuera de rango o fase ausente/repetida.`);
     const wired=board.wires.some(w=>w.from.part===p.id&&w.from.port==='DI1'||w.to.part===p.id&&w.to.port==='DI1');
     const run=wired?root(p,'24')===root(p,'DI1'):!!controls[p.id+':run'];const reverse=wired?root(p,'24')===root(p,'DI2'):!!controls[p.id+':reverse'];
     if(pass===1){let hz=state.hz[p.id]??0,oldReverse=state.reverse[p.id]??false;const target=powered&&!unbalanced&&!conflict&&run&&(reverse===oldReverse||hz<=.000001)?Math.min(q.target,q.frequency):0;const step=q.frequency/q.ramp*dt;hz+=Math.max(-step,Math.min(step,target-hz));if(hz<1e-6){hz=0;oldReverse=reverse;}state.hz[p.id]=powered&&!conflict?hz:0;state.reverse[p.id]=oldReverse;}
     const hz=state.hz[p.id]??0;
     if(powered&&!unbalanced&&!conflict){source(p,'24','COM',{r:24,i:0},.1);if(hz>0){const sign=state.reverse[p.id]?-1:1,line=expected*Math.min(1,hz/q.frequency);for(const [i,port]of ['U','V','W'].entries())sources.push({owner:p.id,positive:root(p,port),negative:'ref:'+p.id,v:phase(line/Math.sqrt(3),-sign*i*2*Math.PI/3),r:.001,frequency:hz});}}
     if(input>1)load(p,single?'L':'L1',single?'N':'L2',input*input/Math.max(1,(lastPower[p.id]??0)/.95));
    }
    if(kind==='inverter'||kind==='dcdc'||kind.startsWith('micro')||kind==='controller'){
     const inputPlus=kind==='controller'?'PV+':kind==='dcdc'?'IN+':'DC+',inputMinus=kind==='controller'?'PV−':kind==='dcdc'?'IN−':'DC−';const vin=mag(read(p,inputPlus,inputMinus));
     let power=lastPower[p.id]??0;if(power>q.power)conversionScale[p.id]=(conversionScale[p.id]??1)*Math.sqrt(q.power/power);const scale=conversionScale[p.id]??1;
     if(vin>1){
      if(kind==='inverter'&&vin>=q.voltage*.8)source(p,'L','N',{r:230*scale,i:0},.05,q.frequency);
      if(kind==='dcdc')source(p,'OUT+','OUT−',{r:Math.min(q.voltage,vin*.95)*scale,i:0},.1);
      if(kind==='controller'&&vin>mag(read(p,'BAT+','BAT−'))+1)source(p,'BAT+','BAT−',{r:Math.min(q.voltage*1.15,vin*.95)*scale,i:0},1);
      if(kind.startsWith('micro')){const grid=read(p,'L','N'),vg=mag(grid);const externalGrid=board.parts.some(s=>mains(s.kind)&&ports(s.kind).some(port=>!port.id.startsWith('PE')&&root(s,port.id)===root(p,'L')));
       if(vg>180&&externalGrid){const pvPower=board.parts.filter(s=>s.kind==='pv'&&root(s,'+')===root(p,'DC+')).reduce((sum,s)=>sum+s.params.power*s.params.irradiance/1000*.9,0);const available=Math.min(q.power,pvPower||q.power),r=.5,boost=available/vg*r;source(p,'L','N',{r:grid.r*(1+boost/vg),i:grid.i*(1+boost/vg)},r,q.frequency);power=available;}else warnings.add(`${p.tag}: necesita una red AC presente; no funciona aislado.`);}
      if(power>q.power*1.02)warnings.add(`${p.tag}: límite de potencia; el modelo reduce la tensión de salida.`);
      if(power>0)load(p,inputPlus,inputMinus,vin*vin/(Math.min(power,q.power)/.9),p.id+':input');
     }
    }
   }
   // Sources use private Thevenin nodes. PE is never selected as a reference automatically.
   const assign=(node:string,v:Complex)=>{if(fixed[node]&&mag(sub(fixed[node],v))>.1)throw new Error('Fuentes con referencias incompatibles. Este modelo no admite esa asociación.');fixed[node]=v;};
   for(const [i,s]of sources.entries()){assign(s.negative,zero);const hidden='source:'+i;assign(hidden,s.v);branch('source:'+i,hidden,s.positive,s.r);frequency[s.positive]=s.frequency;}
   const result=solve(branches,fixed);amps=result.amps;lastVolts={};for(const p of board.parts)for(const port of ports(p.kind)){const value=result.volts[root(p,port.id)];if(value)lastVolts[pkey(p,port.id)]=value;}
   lastPower={};for(const [i,s]of sources.entries()){const current=amps['source:'+i]??zero,terminal=sub(result.volts[s.positive]??zero,result.volts[s.negative]??zero);lastPower[s.owner]=(lastPower[s.owner]??0)+Math.max(0,terminal.r*current.r+terminal.i*current.i);}
   let changed=false;for(const p of board.parts)if(p.kind==='contactor'){const energized=mag(read(p,'A1','A2'))>=p.params.voltage*.75;if(energized!==!!state.contacts[p.id])changed=true;state.contacts[p.id]=energized;}
   if(pass>=4&&!changed){stable=true;break;}
  }
  if(!stable&&board.parts.length)warnings.add('La maniobra no se estabilizó; revisa los enclavamientos.');
  for(const p of board.parts){const q=p.params,kind=p.kind;const r:Reading={voltage:0,current:0,power:0,energy:previous.energy[p.id]??0,cost:0,frequency:0,rpm:0,soc:state.soc[p.id]??q.soc,active:false,closed:control(p),reverse:false,status:'Sin alimentación'};
   const port=ports(kind),v=port.length>=2?read(p,port[0].id,port[1].id):zero;r.voltage=mag(v);r.current=mag(amps[p.id]??zero);r.power=r.voltage*r.current;
   if(maintained(kind))r.status=control(p)?(kind==='thermal'?'Normal':'Cerrado'):(kind==='emergency'?'Enclavada':kind==='thermal'?'Disparo de práctica':'Abierto');
   if(kind==='push-no'||kind==='push-nc'){r.closed=kind==='push-no'?!!pressed[p.id]:!pressed[p.id];r.status=pressed[p.id]?'Pulsado':'Suelto';}
   if(kind==='contactor'){r.voltage=mag(read(p,'A1','A2'));r.power=r.voltage*r.current;r.active=!!state.contacts[p.id];r.status=r.active?'Bobina activa':'En reposo';}
   if(kind==='aux-no'||kind==='aux-nc'){const on=board.parts.some(c=>c.kind==='contactor'&&c.tag===p.tag&&state.contacts[c.id]);r.closed=kind==='aux-no'?on:!on;r.status=r.closed?'Contacto cerrado':'Contacto abierto';}
   if(kind==='lamp'||kind==='buzzer'){r.voltage=mag(read(p,'1','2'));r.active=r.voltage>=q.voltage*.75;r.status=r.active?'Activo':'Apagado';}
   if(kind==='motor'||kind==='motor3'){
    const pairs=kind==='motor3'?[['U1','U2'],['V1','V2'],['W1','W2']]:[['L','N']];const values=pairs.map(([a,b])=>mag(read(p,a,b)));r.voltage=Math.max(...values);r.active=values.every(x=>x>q.voltage*.2);
    r.frequency=r.active?(frequency[net.find(pkey(p,pairs[0][0]))]??q.frequency):0;r.rpm=r.active?120*r.frequency/q.poles*.95:0;r.power=pairs.reduce((sum,[a,b])=>sum+mag(read(p,a,b))**2/(q.voltage*q.voltage/q.power),0);if(kind==='motor3'){const u=read(p,'U1','V1'),v=read(p,'V1','W1');r.reverse=u.r*v.i-u.i*v.r>0;}r.status=r.active?`Marcha ${r.reverse?'↺':'↻'} · equivalente resistivo`:values.some(x=>x>1)?'Bobinado sin alimentación completa':'Detenido';
   }
   if(kind==='vfd'||kind==='vfd3'){r.frequency=state.hz[p.id]??0;r.active=r.frequency>0;r.status=r.active?(Math.abs(r.frequency-q.target)<.01?'Marcha':'En rampa'):'Detenido';r.voltage=mag(read(p,'U','V'));}
   if(kind==='voltmeter'){r.voltage=mag(read(p,'V+','V−'));r.status='Tensión entre puntas';}
   if(kind==='ammeter')r.status='Corriente por el shunt';
   if(kind==='wattmeter'||kind==='energy'){const volts=read(p,'V+','V−'),current=amps[p.id]??zero;r.voltage=mag(volts);r.current=mag(current);r.power=volts.r*current.r+volts.i*current.i;r.energy=(previous.energy[p.id]??0)+Math.max(0,r.power)*dt/3600000;state.energy[p.id]=r.energy;r.cost=r.energy*q.tariff;r.status='Potencia activa';}
   if(kind==='battery'){const sourceIndex=sources.findIndex(s=>s.owner===p.id),current=amps['source:'+sourceIndex]?.r??0;r.current=current;r.power=r.voltage*current;r.soc=Math.max(0,Math.min(100,(previous.soc[p.id]??q.soc)-current*dt/(q.capacity*3600)*100));state.soc[p.id]=r.soc;r.status=current<-.001?'Cargando':current>.001?'Descargando':'En reposo';}
   const owned=sources.map((s,i)=>({s,i})).filter(({s})=>s.owner===p.id);if(owned.length&&kind!=='battery'){r.current=Math.max(...owned.map(({i})=>mag(amps['source:'+i]??zero)));r.power=lastPower[p.id]??0;}
   if(kind==='pv'){r.status=q.irradiance>0?'Equivalente FV lineal':'Sin irradiancia';r.power=lastPower[p.id]??0;r.active=r.power>.01;}
   if(kind==='inverter'||kind==='dcdc'||kind.startsWith('micro')||kind==='controller'){r.power=lastPower[p.id]??0;r.active=r.power>.01;r.status=r.active?'Conversión equivalente':'En espera';}
   if(kind==='dc'||mains(kind))r.status='Fuente ideal';
   if(kind==='plc'){r.active=mag(read(p,'L+','M'))>=18&&mag(read(p,'L+','M'))<=30;r.status=r.active?'Programa del proyecto':'Sin 24 V de mando';}
   state.readings[p.id]=r;
  }
  state.volts=lastVolts;state.live=board.wires.filter(w=>mag(lastVolts[key(w.from)]??zero)>1).map(w=>w.id);state.warnings=[...warnings];
 }catch(error){state.fault=error instanceof Error?error.message:'No se pudo resolver el montaje.';state.volts={};state.live=[];state.readings={};}
 return state;
}
