import {parcelArea,parcelPerimeter} from '../world/parcelGeometry.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import {useState} from 'react';
import type {WorldSession} from '../world/session.ts';
import type {Point} from '../scene/AgroCanvas.tsx';
import type {TerrainOperation} from '../terrain/operations.ts';

export function TerrainEditor({session,points,onClear,onNotice,onPointMode,onRemoveLast}: {session:WorldSession;points:Point[];onClear():void;onNotice(s:string):void;onPointMode(mode:'center'|'polygon'|'path'):void;onRemoveLast():void}) {
  const [kind,setKind]=useState<TerrainOperation['kind']|'parcel'>('smooth');
  const [radius,setRadius]=useState(20),[amount,setAmount]=useState(0.7);
  const [material,setMaterial]=useState<'grass'|'soil'|'gravel'|'sand'>('gravel');
  const [grade,setGrade]=useState(5),[width,setWidth]=useState(3),[stepHeight,setStepHeight]=useState(2);
  const linear=kind==='ditch'||kind==='road';
  const shape=kind==='slope'||kind==='terrace';
  const parcel=kind==='parcel';
  const preview=session.operationPreview;
  const pending=!!preview||!!session.parcelPreview;
  const prepare=()=>{
    if(parcel){const r=session.previewPolygonParcel(points.map(p=>[p.x,p.z]));if(!r.ok)onNotice(r.error);return;}
    const p=points.at(-1);if(!p){onNotice('Pulsa el terreno para elegir el centro.');return;}
    const result=session.previewTerrainOperation({kind:kind as TerrainOperation['kind'],center:[p.x,p.z],radius,amount,...(kind==='paint'?{material}: {}),...(linear?{points:points.map(p=>[p.x,p.z] as [number,number]),width,...(kind==='road'?{heights:points.map(p=>p.y)}:{})}:{}),...(shape?{points:points.map(p=>[p.x,p.z] as [number,number]),width,...(kind==='slope'?{grade}:{stepHeight})}: {})});
    if(!result.ok)onNotice(result.error);
  };
  return <section className="agro-terrain-editor" aria-label="Editor del terreno" data-testid="agro-terrain-editor">
    <header><strong>Editar mapa</strong><small>Preparación del escenario · simulación en pausa</small></header>
    <p>Elige una herramienta, marca su región y revisa los cambios antes de aplicarlos.</p>
    <label>Herramienta de terreno<select aria-label="Herramienta de terreno" value={kind} disabled={pending} onChange={e=>{const next=e.target.value as typeof kind;setKind(next);onPointMode(next==='slope'||next==='terrace'||next==='parcel'?'polygon':next==='ditch'||next==='road'?'path':'center');if(next==='ditch'||next==='road'){setWidth(6);setAmount(next==='road'?1:1.5);}if(next==='slope'||next==='terrace')setAmount(sampleHeight(session.terrain.hf,0,0));else if(next!=='ditch'&&next!=='road')setAmount(0.7);onClear();}}><option value="smooth">Suavizar</option><option value="restore">Restaurar región</option><option value="paint">Pintar superficie</option><option value="slope">Pendiente guiada</option><option value="terrace">Terrazas</option><option value="ditch">Zanja</option><option value="road">Camino</option><option value="parcel">Parcela poligonal</option></select></label>
    {!shape && !linear && !parcel && <label>Radio de edición (m)<input aria-label="Radio de edición" type="number" min={2} max={120} value={radius} disabled={pending} onChange={e=>setRadius(e.target.valueAsNumber)} /></label>}
    {kind==='paint' && <label>Superficie visual<select aria-label="Superficie visual" value={material} disabled={pending} onChange={e=>setMaterial(e.target.value as typeof material)}><option value="grass">Hierba</option><option value="soil">Tierra</option><option value="gravel">Grava</option><option value="sand">Arena</option></select><small>Solo apariencia: conserva humedad, infiltración y tipo de suelo.</small></label>}
    {(kind==='smooth'||kind==='paint') && <label>Intensidad (0–1)<input aria-label="Intensidad de edición" type="number" min={0} max={1} step={0.1} value={amount} disabled={pending} onChange={e=>setAmount(e.target.valueAsNumber)} /></label>}
    {kind==='restore' && <p>Restaura el relieve procedural dentro del radio, con transición suave en el borde. Confirma para sustituir las modificaciones de esa zona.</p>}
    {linear && <>
      <p>Marca 2–64 puntos de la línea. El ancho y el perfil definen el trazado sobre el terreno.</p>
      <label>Ancho (m)<input aria-label="Ancho del trazado" type="number" min={2} max={40} value={width} disabled={pending} onChange={e=>setWidth(e.target.valueAsNumber)} /></label>
      {kind==='ditch' && <label>Profundidad (m)<input aria-label="Profundidad de zanja" type="number" min={0.1} max={20} step={0.1} value={amount} disabled={pending} onChange={e=>setAmount(e.target.valueAsNumber)} /></label>}
    </>}
    {parcel && <p>Marca los vértices del borde en orden. Puedes dibujar entrantes; evita cruces y solapes con otras parcelas.</p>}
    {shape && <>
      <p>Marca 3–64 vértices en el terreno. El borde une el último con el primero.</p>
      <label>Cota de referencia (m)<input aria-label="Cota de referencia" type="number" min={-50} max={500} step={0.5} value={amount} disabled={pending} onChange={e=>setAmount(e.target.valueAsNumber)} /></label>
      {kind==='slope' ? <label>Pendiente (%)<input aria-label="Pendiente objetivo" type="number" min={-100} max={100} value={grade} disabled={pending} onChange={e=>setGrade(e.target.valueAsNumber)} /><small>Dirección: del primer vértice al segundo.</small></label> : <label>Altura de escalón (m)<input aria-label="Altura de escalón" type="number" min={0.5} max={20} step={0.5} value={stepHeight} disabled={pending} onChange={e=>setStepHeight(e.target.valueAsNumber)} /></label>}
      <label>Transición del borde (m)<input aria-label="Transición del borde" type="number" min={1} max={30} value={width} disabled={pending} onChange={e=>setWidth(e.target.valueAsNumber)} /></label>
    </>}
    <p data-testid="agro-editor-points">{shape||linear||parcel?`${points.length} puntos`:points.length ? `Centro: ${points.at(-1)!.x.toFixed(1)}, ${points.at(-1)!.z.toFixed(1)} m` : 'Pulsa el terreno para elegir el centro.'}</p>
    {session.parcelPreview ? <><p data-testid="agro-editor-volume">Vista previa · área {parcelArea(session.parcelPreview).toFixed(1)} m² · perímetro {parcelPerimeter(session.parcelPreview).toFixed(1)} m</p><div><button type="button" onClick={()=>session.abortStroke()}>Cancelar edición</button><button type="button" className="agro-primary" onClick={()=>{const r=session.confirmPolygonParcel();if(!r.ok)onNotice(r.error);}}>Aplicar edición</button></div></> : preview ? <><p data-testid="agro-editor-volume">Vista previa · corte ≈ {preview.cutM3.toFixed(1)} m³ · relleno ≈ {preview.fillM3.toFixed(1)} m³</p><small>Estimación por celdas, sin cálculo geotécnico.</small><div><button type="button" onClick={()=>session.abortStroke()}>Cancelar edición</button><button type="button" className="agro-primary" onClick={()=>{const r=session.commitStroke('keep');if(!r.ok)onNotice(r.error);}}>Aplicar edición</button></div></> : <div>{(shape||linear||parcel)&&<button type="button" onClick={onRemoveLast}>Quitar último</button>}<button type="button" onClick={onClear}>Borrar puntos</button><button type="button" className="agro-primary" onClick={prepare}>Previsualizar edición</button></div>}
  </section>;
}
