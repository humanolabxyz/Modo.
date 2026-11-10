// Gestión (Fase 6): dock de gestión e «Inventario y compras» con pedidos, obras y libro de movimientos. Los precios y plazos son ilustrativos del escenario.
import {useState} from 'react';
import {X} from 'lucide-react';
import {ITEMS} from '../catalog/items.ts';
import {ECON, clp, inConstruction, laborCost, obraProgress, pendingQty, placedCount} from '../economy/economy.ts';
import {timeInfo} from '../sim/clock.ts';
import type {WorldSession} from '../world/session.ts';

const when = (session: WorldSession, at: number): string => { const t = timeInfo({simSeconds: at, startDate: session.clock.startDate}); return `${t.dateLabel} ${t.timeLabel}`; };

/** Panel «Inventario y compras». */
export function InventoryPanel({session, onClose, onNotice}: {session: WorldSession; onClose(): void; onNotice(m: string): void}) {
  const [tab, setTab] = useState<'stock' | 'orders' | 'works' | 'ledger'>('stock'), [qty, setQty] = useState<Record<string, number>>({});
  const eco = session.economy, real = session.policy.inventory && eco !== null, now = session.clock.simSeconds;
  const works = session.entities.filter(inConstruction);
  const items = ITEMS.filter(i => i.id in ECON);
  return <section className="agro-inv" role="dialog" aria-label="Inventario y compras" data-testid="agro-inventory">
    <header><div><h2>Inventario y compras</h2><small>{real ? `Modo real · ${clp(eco!.money)}` : session.policy.label+' · sin costos'}</small></div>
      <button type="button" className="agro-icon" aria-label="Cerrar inventario" onClick={onClose}><X size={18} aria-hidden="true" /></button></header>
    {!real ? <div className="agro-inv-free" data-testid="agro-inv-free">
      <p><b>{session.experience==='learning'?'En aprendizaje':'En modo libre'} no hay inventario, costos ni tiempos de obra:</b> cada pieza se coloca al instante, sin límite. En modo real hay que comprar las piezas, esperar al proveedor y pagar el montaje, que además toma tiempo.</p>
      <button type="button" className="agro-primary" data-testid="agro-go-real" onClick={() => { const r = session.setExperience('real'); onNotice(r.ok ? `Modo real activado: capital inicial ${clp(session.economy!.money)} (ilustrativo). Lo ya construido se considera recibido.` : r.error); }}>Activar el modo real</button>
    </div> : <>
      <div className="agro-tabs" role="tablist" aria-label="Secciones del inventario">
        {([['stock', 'Inventario'], ['orders', `Pedidos (${eco!.orders.filter(o => !o.delivered).length})`], ['works', `Obras (${works.length})`], ['ledger', 'Libro']] as const).map(([id, text]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} data-testid={`agro-inv-tab-${id}`} onClick={() => setTab(id)}>{text}</button>)}
      </div>
      {tab === 'stock' && <div className="agro-inv-grid" data-testid="agro-inv-stock">{items.map(i => {
        const have = session.stockOf(i.id), placed = placedCount(session.entities, i.id), incoming = pendingQty(eco!, i.id), q = qty[i.id] ?? 1, e = ECON[i.id];
        return <article key={i.id} data-item={i.id} data-stock={have}><h3>{i.name}</h3>
          <p className="agro-inv-nums"><span><b data-testid={`agro-stock-${i.id}`}>{have}</b> disponibles</span><span>{placed} colocadas</span>{incoming > 0 && <span>{incoming} por llegar</span>}</p>
          <p className="agro-muted agro-tiny">{clp(e.priceClp)} c/u · llega en {e.leadDays} días · montaje {e.buildHours} h</p>
          <div className="agro-row"><label className="agro-qty"><span className="agro-sr">Cantidad de {i.name}</span><input type="number" min={1} max={50} value={q} aria-label={`Cantidad de ${i.name}`} onChange={ev => setQty({...qty, [i.id]: Math.max(1, Math.min(50, Math.round(Number(ev.target.value)) || 1))})} /></label>
            <button type="button" className="agro-ghost" data-testid={`agro-buy-${i.id}`} onClick={() => { const r = session.buy(i.id, q); onNotice(r.ok ? `Pedido hecho: ${q} × ${i.name} por ${clp(e.priceClp * q)}. Llega en ${e.leadDays} días.` : r.error); }}>Comprar {clp(e.priceClp * q)}</button></div>
        </article>; })}</div>}
      {tab === 'orders' && <ul className="agro-inv-list" data-testid="agro-inv-orders">{eco!.orders.length === 0 ? <li className="agro-muted">Todavía no hay pedidos.</li> : [...eco!.orders].reverse().map(o => <li key={o.id} className={o.delivered ? 'done' : ''}><b>{o.qty} × {ITEMS.find(i => i.id === o.type)?.name ?? o.type}</b><span>{clp(o.cost)}</span><small>{o.delivered ? `Entregado el ${when(session, o.deliverAt)}` : `Llega en ${Math.max(0, Math.ceil((o.deliverAt - now) / 86400))} días (${when(session, o.deliverAt)})`}</small></li>)}</ul>}
      {tab === 'works' && <ul className="agro-inv-list" data-testid="agro-inv-works">{works.length === 0 ? <li className="agro-muted">No hay obras en curso.</li> : works.map(e => { const p = obraProgress(e, now), left = Math.max(0, (Number(e.state.obraHasta) - now) / 3600); return <li key={e.id}><b>{e.label}</b><span>{Math.round(p * 100)} %</span><div className="agro-meter" role="img" aria-label={`Avance ${Math.round(p * 100)} %`}><i style={{width: `${p * 100}%`}} /></div><small>Quedan {left < 1 ? `${Math.round(left * 60)} min` : `${left.toFixed(1).replace('.', ',')} h`} · mano de obra {clp(laborCost(e.type))}</small></li>; })}</ul>}
      {tab === 'ledger' && <ul className="agro-inv-list" data-testid="agro-inv-ledger">{[...eco!.ledger].reverse().slice(0, 40).map((l, i) => <li key={i} className={l.amount < 0 ? 'out' : 'in'}><b>{l.text}</b><span>{l.amount < 0 ? '−' : '+'}{clp(Math.abs(l.amount))}</span><small>{when(session, l.at)}</small></li>)}</ul>}
      <p className="agro-muted agro-tiny">Precios, plazos y capital inicial son ilustrativos del escenario: no son cotizaciones de mercado. Lo disponible es lo recibido menos lo colocado, así que eliminar una pieza la devuelve al inventario. Colocar cobra la mano de obra; el dinero y el tiempo no se deshacen.</p>
    </>}
  </section>;
}
