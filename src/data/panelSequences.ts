import {divide,multiply,type Complex} from './panelAC';
import {motorEquivalent,motorFrequency,type MotorModelSettings} from './panelMotorDynamics';
const a={re:-.5,im:Math.sqrt(3)/2},a2={re:-.5,im:-Math.sqrt(3)/2};
const sum=(z:Complex[])=>({re:z.reduce((s,v)=>s+v.re,0)/3,im:z.reduce((s,v)=>s+v.im,0)/3});
export function sequences(v:Complex[]){return {zero:sum(v),positive:sum([v[0],multiply(a,v[1]),multiply(a2,v[2])]),negative:sum([v[0],multiply(a2,v[1]),multiply(a,v[2])])};}
const restore=(z:Complex,p:Complex,n:Complex):Complex[]=>[{re:z.re+p.re+n.re,im:z.im+p.im+n.im},...[[a2,a],[a,a2]].map(([x,y])=>{const px=multiply(x,p),ny=multiply(y,n);return {re:z.re+px.re+ny.re,im:z.im+px.im+ny.im};})];
/** Sequence-domain induction admittance: forward slip s and backward slip 2−s. */
export function motorAdmittance(model:MotorModelSettings){const eq=motorEquivalent(model),neg=motorEquivalent(model,2-eq.slip),forward=divide({re:1,im:0},eq.impedance),backward=divide({re:1,im:0},neg.impedance),dir=model.motorDirection??1;
 const cols=[0,1,2].map(j=>{const seq=sequences([0,1,2].map(i=>({re:i===j?1:0,im:0})));return restore(multiply(seq.zero,forward),multiply(seq.positive,dir===1?forward:backward),multiply(seq.negative,dir===1?backward:forward));});return [0,1,2].map(i=>[0,1,2].map(j=>cols[j][i]));}
/** Cycle RMS of a first-order RL energization. DC offset is set by the closing angle,
 * and decays with L/R; it is not random jitter or a full electromagnetic motor solver. */
export function switchingRms(current:Complex,model:MotorModelSettings){const rms=Math.hypot(current.re,current.im),age=(model.simulationSeconds??0)-(model.lastMakeSeconds??-10);if(model.lastMakeSeconds==null||age<0||age>.2||model.motorMode!=='induction')return rms;
 const omega=2*Math.PI*motorFrequency(model),z=motorEquivalent(model).impedance,tau=Math.max(.0005,Math.min(.08,Math.abs(z.im)/(omega*Math.max(.05,z.re)))),close=omega*model.lastMakeSeconds,offset=-Math.SQRT2*(current.re*Math.cos(close)-current.im*Math.sin(close));let squares=0;
 for(let i=0;i<64;i++){const t=age+(i+.5)/64/motorFrequency(model),phase=omega*(model.lastMakeSeconds+t),sample=Math.SQRT2*(current.re*Math.cos(phase)-current.im*Math.sin(phase))+offset*Math.exp(-t/tau);squares+=sample*sample;}return Math.sqrt(squares/64);}
