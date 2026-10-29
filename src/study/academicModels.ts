// Small, declared teaching models. None represents a calibrated physical bench.
export function decimal(raw: string): number | null {
  const text = raw.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}
export function statistics(values: number[], reference: number) {
  const mean = values.reduce((a,b)=>a+b,0)/values.length;
  return {mean, bias:mean-reference, deviation:Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/(values.length-1))};
}
export const temperatureSample = [98.7,99,98.8,98.9,98.7,98.8,98.9,98.8,98.7,98.9];
export const levelSample = [1.48,1.51,1.49,1.48,1.52,1.49,1.52,1.51,1.48,1.49];
export const clamp = (n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export const linearMap = (x:number,lo:number,hi:number,outLo:number,outHi:number)=>outLo+(x-lo)*(outHi-outLo)/(hi-lo);
export function diode(v:number,r:number,forward:boolean,drop=.7) {return forward&&r>0?Math.max(0,(v-drop)/r):0;}
export function transistor(v:number,rb:number,rc:number,beta=100) {
  const ib=Math.max(0,(v-.7)/rb), ic=Math.min(beta*ib,Math.max(0,(10-.2)/rc));
  return {ib,ic,vce:10-ic*rc,region:ib===0?'Corte':beta*ib>=(10-.2)/rc?'Saturación':'Activa'};
}
export function opamp(input:number,gain:number,offset:number,rail=12) {const ideal=input*gain+offset;return {ideal,output:clamp(ideal,-rail,rail),saturated:Math.abs(ideal)>rail};}
export function lineCode(bits:string,kind:string,initial=0):number[] {
  let state=initial;const out:number[]=[];
  for(const bit of bits){const b=Number(bit);if(kind==='NRZ-L')out.push(b,b);else if(kind==='NRZ-I'){if(b)state=1-state;out.push(state,state);}else if(kind==='Manchester')out.push(b?0:1,b?1:0);else {if(!b)state=1-state;out.push(state,1-state);state=1-state;}}
  return out;
}
export const parity=(bits:string)=>[...bits].reduce((a,b)=>a+Number(b),0)%2;
// XOR polynomial division, generator x³+x+1 (1011), MSB first, no reflection.
export function crc(bits:string, polynomial='1011') {
  const data=(bits+'0'.repeat(polynomial.length-1)).split('').map(Number), p=[...polynomial].map(Number);
  for(let i=0;i<bits.length;i++)if(data[i])for(let j=0;j<p.length;j++)data[i+j]^=p[j];
  return data.slice(-(p.length-1)).join('');
}
export function regression(points:[number,number][]) {
  const n=points.length, sx=points.reduce((s,p)=>s+p[0],0), sy=points.reduce((s,p)=>s+p[1],0);
  const denominator=n*points.reduce((s,p)=>s+p[0]**2,0)-sx**2;
  if(!n||denominator===0)return null;
  const m=(n*points.reduce((s,p)=>s+p[0]*p[1],0)-sx*sy)/denominator;
  return {m,b:(sy-m*sx)/n};
}
export function polynomialFit(points:[number,number][],degree:number) {
  if(!Number.isInteger(degree)||degree<1||degree>3||points.length<=degree)throw Error('Datos insuficientes');
  const size=degree+1,a=Array.from({length:size},(_,r)=>[...Array.from({length:size},(_,c)=>points.reduce((s,[x])=>s+x**(r+c),0)),points.reduce((s,[x,y])=>s+y*x**r,0)]);
  for(let i=0;i<size;i++){
    let pivot=i;for(let j=i+1;j<size;j++)if(Math.abs(a[j][i])>Math.abs(a[pivot][i]))pivot=j;
    [a[i],a[pivot]]=[a[pivot],a[i]];if(Math.abs(a[i][i])<1e-12)throw Error('Ajuste singular');
    const v=a[i][i];for(let k=i;k<=size;k++)a[i][k]/=v;
    for(let j=0;j<size;j++)if(j!==i){const factor=a[j][i];for(let k=i;k<=size;k++)a[j][k]-=factor*a[i][k];}
  }
  return a.map(row=>row[size]);
}
export const evaluatePolynomial=(coefficients:number[],x:number)=>coefficients.reduce((s,c,i)=>s+c*x**i,0);
export const stockPoints:[number,number][]=[[1,9867],[2,9575],[3,9102],[4,9009],[5,8956],[6,8307],[7,7802]];
export const followerPoints:[number,number][]=[[1,485],[2,1353],[3,2307],[4,2689],[5,3005]];
export type CableWire={pin:number;terminal:number;stripped:boolean;tinned:boolean;soldered:boolean;tight:boolean;broken:boolean;cold:boolean;color?:string};
export type CableState={revision:number;cut:boolean;wires:CableWire[];bridge:boolean;flex:boolean;hmiBaud:number;plcBaud:number;hmiAddress:number;plcAddress:number;running:boolean};
export const cableSignature=(s:CableState)=>JSON.stringify({revision:s.revision,cut:s.cut,wires:s.wires.map(({color,...electrical})=>electrical),bridge:s.bridge,flex:s.flex});
// HMI side only: Delta DOP-107EG instruction sheet (2019-10-16), COM2 MODE2.
// T1/T2/T3 are generic test terminals D+/D-/GND, not the classroom PLC terminals.
export const cableTargets=[{pin:1,terminal:1},{pin:6,terminal:2},{pin:5,terminal:3}];
export const freshCable=():CableState=>({revision:0,cut:false,wires:cableTargets.map(()=>({pin:0,terminal:0,stripped:false,tinned:false,soldered:false,tight:false,broken:false,cold:false})),bridge:false,flex:false,hmiBaud:9600,plcBaud:9600,hmiAddress:1,plcAddress:1,running:false});
export function cableConnected(state:CableState,a:string,b:string) {
  const edges=new Map<string,string[]>();
  const join=(x:string,y:string)=>{edges.set(x,[...(edges.get(x)||[]),y]);edges.set(y,[...(edges.get(y)||[]),x]);};
  state.wires.forEach((w,i)=>{
    const left=`w${i}a`,right=`w${i}b`;
    if(!w.broken)join(left,right);
    if(state.cut&&w.stripped&&w.tinned&&w.soldered&&w.pin&&!(w.cold&&state.flex))join(`p${w.pin}`,left);
    if(state.cut&&w.stripped&&w.tight&&w.terminal)join(right,`t${w.terminal}`);
  });
  if(state.bridge)join('p1','p6');
  const seen=new Set<string>(),todo=[a];
  while(todo.length){const n=todo.pop()!;if(n===b)return true;if(seen.has(n))continue;seen.add(n);todo.push(...(edges.get(n)||[]));}
  return false;
}
export function cableValid(state:CableState) {
  return cableTargets.every(({pin,terminal})=>cableConnected(state,`p${pin}`,`t${terminal}`)&&cableTargets.every(t=>t.terminal===terminal||!cableConnected(state,`p${pin}`,`t${t.terminal}`)))&&!state.wires.some(w=>w.cold||w.broken);
}
export const linkValid=(state:CableState)=>cableValid(state)&&state.hmiBaud===state.plcBaud&&state.hmiAddress===state.plcAddress;
