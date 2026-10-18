import {reference,type Sensor,type Settings} from './physics';
import {UNIT_OF,formatNumber,sensorName,type TempRecord} from './state';
/** Curva de un sensor: puntos medidos (simulados en azul, reales en naranja) sobre la referencia de tabla. */
const W=290,H=170,L=46,R=12,T=12,B=30;
export function TemperatureChart({sensor,settings,records}:{sensor:Sensor;settings:Settings;records:TempRecord[]}){
  const unit=UNIT_OF[sensor],mine=records.filter(r=>r.sensor===sensor);
  const lo=0,hi=110,curve=Array.from({length:23},(_,i)=>{const temp=lo+i*5;return {temp,value:reference(settings,sensor,temp)};});
  const values=[...curve.map(c=>c.value),...mine.map(r=>r.value)],min=Math.min(...values),max=Math.max(...values),span=max-min||1;
  const x=(temp:number)=>L+(temp-lo)/(hi-lo)*(W-L-R),y=(v:number)=>T+(1-(v-min)/span)*(H-T-B);
  const digits=unit==='Ω'?1:2,ticks=[min,(min+max)/2,max];
  return <figure className="temp-chart"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Curva de ${sensorName(sensor,settings.tcType)}: ${mine.length} puntos registrados, ${unit} contra °C`}>
    {ticks.map(v=><g key={v}><line className="grid" x1={L} x2={W-R} y1={y(v)} y2={y(v)}/><text className="tick" x={L-6} y={y(v)+4} textAnchor="end">{formatNumber(v,digits)}</text></g>)}
    {[0,25,50,75,100].map(temp=><text key={temp} className="tick" x={x(temp)} y={H-12} textAnchor="middle">{temp}</text>)}
    <text className="axis" x={W/2} y={H-1} textAnchor="middle">temperatura (°C)</text><text className="axis" x="2" y="9">{unit}</text>
    <polyline className="reference" points={curve.map(c=>`${x(c.temp)},${y(c.value)}`).join(' ')}/>
    {mine.map(r=>r.source==='simulada'?<circle key={r.id} className="p-sim" cx={x(r.temp)} cy={y(r.value)} r="5"/>:<rect key={r.id} className="p-real" x={x(r.temp)-5} y={y(r.value)-5} width="10" height="10" transform={`rotate(45 ${x(r.temp)} ${y(r.value)})`}/>)}
  </svg>
  <figcaption><span><i className="k ref"/>Referencia de tabla</span><span><i className="k sim"/>Simulada</span><span><i className="k real"/>Real</span></figcaption></figure>;
}
