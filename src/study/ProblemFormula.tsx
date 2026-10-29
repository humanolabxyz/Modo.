export function ProblemFormula({id}:{id:string}){
  if(id==='problema-poblacion')return <>p(t) = 9,5 · e<sup>0,06t</sup> + 3</>;
  if(id==='problema-estroncio')return <>E(t) = 237 · (0,4)<sup>t/24</sup> + 3</>;
  if(id==='problema-planta')return <>h(t) = 1 + 4 · log<sub>10</sub>(t + 1)</>;
  return <><div>T₁(G) = 12 · log<sub>1,9</sub>((G + 16)/16)</div><div>T₂(G) = 12 · log<sub>1,6</sub>((G + 14)/14)</div></>;
}
