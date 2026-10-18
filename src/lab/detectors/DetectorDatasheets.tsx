import {ExternalLink} from 'lucide-react';
import {FloatingWindow} from '../../components/FloatingWindow';
import {DATASHEETS,SHEET_NOTE,type SheetId} from './datasheets';
/** Lista de fichas de los equipos. Se usa en una ventana del banco y dentro de la clase de Estudio. */
export function DetectorDatasheetList({open}:{open?:SheetId|null}){
  return <div className="temp-sheets">
    <p className="temp-sheet-note">{SHEET_NOTE}</p>
    {DATASHEETS.map(sheet=><details key={`${sheet.id}${open===sheet.id?'-open':''}`} className="temp-sheet" open={open===sheet.id} data-sheet={sheet.id}>
      <summary><strong>{sheet.title}</strong><span>{sheet.kind}</span></summary>
      <div className="temp-sheet-body">
        <p className="temp-sheet-look"><b>Cómo es:</b> {sheet.look}</p>
        <dl>{sheet.rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <h4>En este banco</h4><ul>{sheet.bench.map(b=><li key={b}>{b}</li>)}</ul>
        {sheet.pending.length?<><h4>Pendiente</h4><ul className="det-sheet-pending">{sheet.pending.map(b=><li key={b}>{b}</li>)}</ul></>:null}
        {sheet.sources.length?<><h4>Fuentes</h4><ul className="temp-sheet-sources">{sheet.sources.map(src=><li key={src.url}><a href={src.url} target="_blank" rel="noreferrer">{src.label} <ExternalLink size={12}/></a></li>)}</ul></>:null}
      </div>
    </details>)}
  </div>;
}
export function DetectorDatasheetWindow({open,onClose}:{open:SheetId|null;onClose:()=>void}){
  return <FloatingWindow title="Fichas de los equipos" eyebrow="BANCO DE DETECTORES" width={470} side="left" className="temp-sheet-window" closeLabel="Cerrar las fichas" onClose={onClose}><DetectorDatasheetList open={open}/></FloatingWindow>;
}
