import {CircuitBoard} from 'lucide-react';
import {MODULES,TERMINALS} from '../data/panel';
import {canBind,LABEL_BINDINGS,portKey,routePairs,type LearningNet,type LearningState} from '../data/learning';
import type {BananaCable} from '../data/practice';
import {TERMINAL_BY_ID} from '../data/wiring';

export function CadeRouteToolbar({title,nets,wires,onShow,onDetails,canDetails=true}:{title:string;nets:LearningNet[];wires:BananaCable[];onShow:()=>void;onDetails:()=>void;canDetails?:boolean}){
 const routes=routePairs(nets,wires),missing=new Set(nets.flatMap(n=>n.missing.map(portKey)));
 return <div className="cade-route-toolbar" aria-label="Recorrido de CADe en el banco">
  <div className="cade-route-head"><i aria-hidden="true"><CircuitBoard size={18}/></i><div><small>{nets.length?'Selección':'Esquema de la prueba'}</small><strong>{nets.length?title:'PERFECTO'}</strong><p>{nets.length?`${routes.length} conexiones identificadas${missing.size?` · ${missing.size} bornes pendientes`:''}`:'Toca una línea o un componente para ver sus cables en el banco.'}</p></div></div>
  {nets.length>0&&<div className="cade-route-actions"><button onClick={onShow}>Mostrar recorrido en el tablero</button>{canDetails&&<button onClick={onDetails}>Ver bornes</button>}</div>}
 </div>;
}
export function CadeRouteOptions({all,onAll}:{all:boolean;onAll:()=>void}){
 return <div className="cade-route-options"><button aria-pressed={all} onClick={onAll}>Todas las rutas</button><p>Muestra a la vez todos los cables identificados del circuito. Las siluetas sirven de ayuda; aún no están conectadas.</p></div>;
}
export function CadeRouteDetails({title,nets,wires,state,aliases,onChange,onLocate}:{title:string;nets:LearningNet[];wires:BananaCable[];state:LearningState;aliases:Record<string,string>;onChange:(patch:Partial<LearningState>)=>void;onLocate:(id:string)=>void}){
 const map={...LABEL_BINDINGS,...state.bindings};
 const ports=[...new Map(nets.flatMap(n=>n.ports).map(p=>[portKey(p),p])).values()];
 const label=(id:string)=>{const t=TERMINAL_BY_ID.get(id);return t?`${aliases[t.module.id]||t.module.title} · ${t.terminal.id}${t.module.id==='BOTONERAS'&&t.terminal.id.startsWith('S3:')?' · verde derecho':''}`:id};
 return <details className="cade-route-details" id="cade-route-details"><summary>Bornes y conexiones · {title}</summary><div>
  <p>Las siluetas muestran cables por montar. Los cables instalados de esta red se resaltan en azul. Cada red termina en los contactos; no crea puentes dentro del componente.</p>
  {nets.map(n=><section key={n.id} data-route-net={n.id}><strong>Red · líneas {n.lineIds.join(', ')}</strong>{routePairs([n],wires).map(r=><div className="cade-route-pair" key={`${r.from}-${r.to}`}><span>{label(r.from)} ↔ {label(r.to)}</span><small>{r.installed?'Conectados':'Por montar'}</small></div>)}{n.missing.length>0&&<p className="connector-pending">Falta identificar: {n.missing.map(portKey).join(', ')}. Se muestra solo la parte identificada.</p>}{!n.pairs.length&&<p>No hay dos extremos identificados para mostrar un cable en esta red.</p>}</section>)}
  <h3>Correspondencias de esta selección</h3>
  {ports.map(p=>{const key=portKey(p),id=map[key]||'';return <label className="cade-route-binding" key={key}><strong>{key}</strong><select aria-label={`Borne físico ${key}`} value={id} onChange={e=>{const value=e.target.value;if(canBind(key,value,state.bindings))onChange({bindings:{...state.bindings,[key]:value}})}}><option value="">Pendiente de identificar…</option>{MODULES.map(m=><optgroup key={m.id} label={`${aliases[m.id]||m.title} · ${m.title}`}>{TERMINALS.filter(t=>t.module.id===m.id).map(t=><option key={t.key} value={t.key} disabled={!canBind(key,t.key,state.bindings)}>{label(t.key)}</option>)}</optgroup>)}</select>{id&&<button onClick={()=>onLocate(id)}>Localizar {label(id)}</button>}</label>})}
 </div></details>;
}
