import {ArrowRight,Search,X} from 'lucide-react';
import {COLOR_HEX,TERMINALS} from '../data/panel';
export type TerminalMatch=(typeof TERMINALS)[number];
export function SearchBox({query,onQuery,matches,onPick}:{query:string;onQuery:(q:string)=>void;matches:TerminalMatch[];onPick:(t:TerminalMatch)=>void}){
 return <div className="searchbox-wrap"><Search size={16}/><input aria-label="Buscar un borne o componente" value={query} onChange={e=>onQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')onQuery('');if(e.key==='Enter'&&matches[0])onPick(matches[0])}} placeholder="Buscar borne: A1, 95, S2:3…"/>{query&&<button aria-label="Borrar búsqueda" onClick={()=>onQuery('')}><X size={14}/></button>}{query.trim()&&<div className="search-results">{matches.length?matches.map(t=><button key={t.key} onClick={()=>onPick(t)}><span className="search-socket" style={{background:COLOR_HEX[t.terminal.color]}}/><div><strong>{t.terminal.id}</strong><small>{t.module.title}</small></div><ArrowRight size={14}/></button>):<div className="search-empty">Sin bornes que coincidan.</div>}</div>}</div>;
}
