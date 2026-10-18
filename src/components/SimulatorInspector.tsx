import {useEffect,useState} from 'react';
import {CheckCircle2,ExternalLink,Maximize2,ShieldAlert} from 'lucide-react';
import {COLOR_HEX,VERIFICATION_INFO,TERMINALS,type PanelModule} from '../data/panel';
import type {BananaCable} from '../data/practice';
import {networkFor} from '../data/wiring';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {WireInspector} from './WireInspector';
import {FloatingWindow} from './FloatingWindow';
type Props={selected:string|null;module:PanelModule;aliases:Record<string,string>;onAlias:(id:string,value:string)=>void;onPick:(id:string)=>void;onLocate:(id:string)=>void;onFocus:(m:PanelModule)=>void;onPhoto:()=>void;onClose:()=>void;wires:BananaCable[];selectedWire:string|null;onSelectWire:(id:string|null)=>void;onChangeWire:(w:BananaCable)=>void;onDeleteWire:()=>void;onLayer:(front:boolean)=>void;};
export function SimulatorInspector({selected,module:m,aliases,onAlias,onPick,onLocate,onFocus,onPhoto,onClose,wires,selectedWire,onChangeWire,onDeleteWire,onLayer}:Props){
 const [draft,setDraft]=useState('');
 const t=TERMINALS.find(t=>t.key===selected)?.terminal,wire=wires.find(w=>w.id===selectedWire);
 const node=networkFor(wire?.from.terminalId||selected,wires);
 useEffect(()=>setDraft(aliases[m.id]||''),[m.id,aliases]);
 /* Ventana como las demás del simulador: se mueve por la cabecera, se ajusta de tamaño y se cierra con su propia X. */
 return <FloatingWindow title={wire?'Cable seleccionado':'Borne seleccionado'} onClose={onClose} closeLabel="Cerrar inspector" side="right" top={96} width={330} className="inspector-window"><aside className="inspector compact-inspector" aria-label="Inspector de bornes">
  {wire?<WireInspector wire={wire} onChange={onChangeWire} onDelete={onDeleteWire} onEndpoint={onLocate} onLayer={onLayer}/>:t&&<>
   <div className="terminal-feature"><span className="feature-id">{t.id.match(/^S[123]:([1234])$/)?.[1]||t.id.replace('PILOTO_','P')}</span><div><span className="feature-module">{m.title}</span><small>{selected}</small></div><i className="color-dot" style={{background:COLOR_HEX[t.color]}}/></div>
   <p className="terminal-description">{t.note||m.summary}</p>
   <div className="button-pair"><button onClick={()=>onFocus(m)}><Maximize2 size={14}/> Enfocar módulo</button><button aria-label="Ampliar fotografía" onClick={onPhoto}><ExternalLink size={14}/> Ver fotografía</button></div>
   <details className="disclosure terminal-details" key={m.id}><summary>Información del módulo</summary>
    <label className="terminal-picker">Cambiar borne<select aria-label="Seleccionar borne del módulo" value={selected||''} onChange={e=>onPick(e.target.value)}>{m.terminals.map(t=><option key={t.id} value={`${m.id}:${t.id}`}>{t.id}</option>)}</select></label>
    <div className="info-lines"><div><span>Identificador completo</span><strong>{selected}</strong></div><div><span>Referencia del componente</span><strong>{aliases[m.id]?`${aliases[m.id]} · ${aliases[m.id]===CONFIRMED_MODULE_ALIASES[m.id]?'módulo confirmado por ti':'etiqueta personal por confirmar'}`:'Referencia en diagrama por confirmar'}</strong></div><div><span>Color del borne</span><strong>{({white:'Crema / blanco',red:'Rojo',blue:'Azul',green:'Verde',black:'Negro',gray:'Gris'})[t.color]}</strong></div>{t.state&&<div><span>Interpretación</span><strong>{t.verification==='usuario'||t.state.includes('por confirmar')?t.state:`${t.state} · por confirmar en el equipo`}</strong></div>}</div>
    <div className={`verification ${t.verification==='foto'?'confirmed':'pending'}`}><span>{t.verification==='foto'?<CheckCircle2 size={16}/>:<ShieldAlert size={16}/>}</span><div><strong>{t.verification==='foto'?'Identificación visual':t.verification==='usuario'?'Indicado por ti':'Pendiente de confirmar'}</strong><p>{VERIFICATION_INFO[t.verification||'foto']}</p></div></div>
    <p className="module-summary">{m.summary}</p>
    {m.aliasEditable&&<div className="alias-area"><label htmlFor="alias-input">Código en diagrama (p. ej., KM1)</label><div><input id="alias-input" value={draft} onChange={e=>setDraft(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,14))} placeholder="Por confirmar"/><button onClick={()=>onAlias(m.id,draft)}>Guardar</button></div><small>Etiqueta personal por confirmar.</small></div>}
    <button className="photo-preview" onClick={onPhoto}><img src={m.image} loading="lazy" decoding="async" alt={`Fotografía del módulo ${m.title}`}/></button>
   </details>
  </>}
  {node.length>1&&<details className="disclosure network-disclosure"><summary>Ver red · {node.length} bornes</summary><section className="node-detail" aria-label="Red de cables"><strong>Red de cables · {node.length} bornes</strong><p>Unidos solo por los cables agregados.</p>{node.map(id=><button key={id} onClick={()=>onLocate(id)}>{id}</button>)}</section></details>}
 </aside></FloatingWindow>;
}
