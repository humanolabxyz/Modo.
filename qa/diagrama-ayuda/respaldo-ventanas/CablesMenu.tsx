import type {BananaCable} from '../data/practice';
export function CablesMenu({wires,selectedWire,onSelect}:{wires:BananaCable[];selectedWire:string|null;onSelect:(id:string|null)=>void}){
 return <details className="disclosure cables-menu"><summary>Cables <span data-wire-count={wires.length}>{wires.length}</span></summary><div>{wires.length?<select aria-label="Seleccionar un cable" value={selectedWire||''} onChange={e=>onSelect(e.target.value||null)}><option value="">Seleccionar cable…</option>{wires.map((w,i)=><option key={w.id} value={w.id}>{i+1}. {w.from.terminalId} ↔ {w.to.terminalId}</option>)}</select>:<p>Aún no has conectado cables.</p>}</div></details>;
}
