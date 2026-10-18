import {MATERIAL_NAMES,SUPPLY_V,type Material} from './physics';
import {formatNumber,seriesKey,seriesName,type DetRecord} from './state';
/** Salida del detector por condición: puntos medidos (simulados en azul, reales en naranja) entre 0 V (bajo) y 24 V (alto). */
const W=290,H=190,L=46,R=12,T=14,B=44;
const CATS:Material[]=['none','metal','plastic'];
export function DetectorChart({series,records,measure}:{series:string;records:DetRecord[];measure:'0v'|'plus'}){
  const mine=records.filter(r=>seriesKey(r)===series&&r.ref===measure),name=mine.length?seriesName(mine[0]):series;
  const x=(i:number)=>L+(i+.5)*(W-L-R)/CATS.length,y=(v:number)=>T+(1-Math.max(0,Math.min(SUPPLY_V,v))/SUPPLY_V)*(H-T-B);
  return <figure className="temp-chart"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Salida de ${name} medida ${measure==='0v'?'contra 0 V':'contra +V'}: ${mine.length} puntos registrados`}>
    {[0,SUPPLY_V/2,SUPPLY_V].map(v=><g key={v}><line className="grid" x1={L} x2={W-R} y1={y(v)} y2={y(v)}/><text className="tick" x={L-6} y={y(v)+4} textAnchor="end">{formatNumber(v,0)}</text></g>)}
    {CATS.map((m,i)=><text key={m} className="tick" x={x(i)} y={H-24} textAnchor="middle">{MATERIAL_NAMES[m].split(' (')[0]}</text>)}
    <text className="axis" x={W/2} y={H-3} textAnchor="middle">condición del objeto</text><text className="axis" x="2" y="10">V</text>
    {mine.map(r=>{const i=CATS.indexOf(r.object),cx=x(i)+(r.source==='real'?14:-14);return <g key={r.id}><line className="stem" x1={cx} x2={cx} y1={y(0)} y2={y(r.value)}/>{r.source==='simulada'?<circle className="p-sim" cx={cx} cy={y(r.value)} r="6"/>:<rect className="p-real" x={cx-5} y={y(r.value)-5} width="10" height="10" transform={`rotate(45 ${cx} ${y(r.value)})`}/>}</g>;})}
  </svg>
  <figcaption><span><i className="k sim"/>Simulada</span><span><i className="k real"/>Real</span></figcaption></figure>;
}
