/** Fundamental-frequency RMS nodal analysis. Voltages and currents are phasors. */
export type Complex={re:number;im:number};
export type ACBranch={id:string;a:string;b:string;resistance:number;reactance?:number};
export type CoupledLoad={ids:string[];ports:[string,string][];admittance:Complex[][]};
export const multiply=(a:Complex,b:Complex):Complex=>({re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re});
export const divide=(a:Complex,b:Complex):Complex=>{const d=b.re*b.re+b.im*b.im;return {re:(a.re*b.re+a.im*b.im)/d,im:(a.im*b.re-a.re*b.im)/d};};
export function solvePanelAC(branches:ACBranch[],fixed:Record<string,Complex>,coupled:CoupledLoad[]=[]){
 const graph=new Map<string,Set<string>>();for(const b of branches){if(!graph.has(b.a))graph.set(b.a,new Set());if(!graph.has(b.b))graph.set(b.b,new Set());graph.get(b.a)!.add(b.b);graph.get(b.b)!.add(b.a);}
 for(const load of coupled){const ids=load.ports.flat();for(const a of ids){if(!graph.has(a))graph.set(a,new Set());for(const b of ids)if(a!==b)graph.get(a)!.add(b);}}
 const reached=new Set(Object.keys(fixed)),queue=[...reached];for(let i=0;i<queue.length;i++)for(const id of graph.get(queue[i])??[])if(!reached.has(id)){reached.add(id);queue.push(id);}
 const nodes=[...reached].filter(id=>!(id in fixed)),index=new Map(nodes.map((id,i)=>[id,i])),n=nodes.length;
 const volts:Record<string,Complex>={...fixed},amps:Record<string,Complex>={},floating=[...graph.keys()].filter(id=>!reached.has(id));
 const fail=(fault:string)=>({volts:{...fixed},amps:{} as Record<string,Complex>,floating,fault});
 if(n>256)return fail('La red AC supera el límite del simulador.');
 const re=nodes.map(()=>new Float64Array(n+1)),im=nodes.map(()=>new Float64Array(n+1));
 const add=(row:string,col:string,g:Complex)=>{const i=index.get(row);if(i===undefined)return;const j=index.get(col);if(j!==undefined){re[i][j]+=g.re;im[i][j]+=g.im;}else{const z=multiply(g,fixed[col]??{re:0,im:0});re[i][n]-=z.re;im[i][n]-=z.im;}};
 for(const b of branches){if(b.a===b.b||!reached.has(b.a))continue;const z={re:b.resistance,im:b.reactance??0};if(!Number.isFinite(z.re)||!Number.isFinite(z.im)||Math.hypot(z.re,z.im)<1e-9)return fail('Impedancia AC inválida.');const y=divide({re:1,im:0},z),neg={re:-y.re,im:-y.im};add(b.a,b.a,y);add(b.b,b.b,y);add(b.a,b.b,neg);add(b.b,b.a,neg);}
 for(const load of coupled)for(let i=0;i<load.ports.length;i++)for(let j=0;j<load.ports.length;j++){const [a,b]=load.ports[i],[c,d]=load.ports[j],y=load.admittance[i][j],neg={re:-y.re,im:-y.im};add(a,c,y);add(a,d,neg);add(b,c,neg);add(b,d,y);}
 for(let col=0;col<n;col++){
  let pivot=col;for(let row=col+1;row<n;row++)if(Math.hypot(re[row][col],im[row][col])>Math.hypot(re[pivot][col],im[pivot][col]))pivot=row;
  if(Math.hypot(re[pivot][col],im[pivot][col])<1e-12)return fail('Red AC sin referencia suficiente.');
  [re[col],re[pivot]]=[re[pivot],re[col]];[im[col],im[pivot]]=[im[pivot],im[col]];
  const p={re:re[col][col],im:im[col][col]};for(let j=col;j<=n;j++){const z=divide({re:re[col][j],im:im[col][j]},p);re[col][j]=z.re;im[col][j]=z.im;}
  for(let row=0;row<n;row++){if(row===col)continue;const g={re:re[row][col],im:im[row][col]};for(let j=col;j<=n;j++){const z=multiply(g,{re:re[col][j],im:im[col][j]});re[row][j]-=z.re;im[row][j]-=z.im;}}
 }
 for(let i=0;i<n;i++)volts[nodes[i]]={re:re[i][n],im:im[i][n]};
 for(const b of branches){const a=volts[b.a],z=volts[b.b];amps[b.id]=a&&z?divide({re:a.re-z.re,im:a.im-z.im},{re:b.resistance,im:b.reactance??0}):{re:0,im:0};}
 for(const load of coupled){const v=load.ports.map(([a,b])=>({re:(volts[a]?.re??0)-(volts[b]?.re??0),im:(volts[a]?.im??0)-(volts[b]?.im??0)}));for(let i=0;i<v.length;i++)amps[load.ids[i]]=load.admittance[i].reduce((sum,y,j)=>{const x=multiply(y,v[j]);return {re:sum.re+x.re,im:sum.im+x.im};},{re:0,im:0});}
 if(Object.values(volts).some(v=>!Number.isFinite(v.re)||!Number.isFinite(v.im)))return fail('El cálculo AC no converge.');
 return {volts,amps,floating,fault:null as string|null};
}
