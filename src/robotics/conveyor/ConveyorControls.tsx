import type {ArmController} from '../arm/useArmController';
export function ConveyorControls({controller:c}:{controller:ArmController}){
  const {belt,piece,present,color,remaining}=c.line;if(!belt)return null;
  const blocked=!c.enabled||c.eStop||c.running||c.dropping;
  const editing=c.running||c.dropping;
  return <fieldset className="rb-conveyor-controls"><legend>Cinta y clasificación por color</legend>
    <p>La banda lleva la pieza al sensor. Se detiene, el brazo recoge y deposita según la lectura de color.</p>
    <dl className="rb-conveyor-readings" aria-live="polite">
      <dt>Presencia</dt><dd>{present?'Detectada · banda detenida':'Sin pieza en estación'}</dd>
      <dt>Lectura RGB</dt><dd>{color?`${color.rgb.map(v=>Number.isFinite(v)?Math.round(v):'—').join(' / ')} · ${color.color??'desconocido'}`:'—'}</dd>
      <dt>Pieza en estación</dt><dd>{piece?.label??'—'}</dd>
      <dt>Sobre la banda</dt><dd>{remaining}</dd>
      <dt>Avance de banda</dt><dd>{Math.round(Number(belt.props?.phaseM??0)*1000)} mm · vuelta de 720 mm</dd>
    </dl>
    <label>Velocidad de cinta: {Math.round(Number(belt.props?.speedMps??.08)*1000)} mm/s<input type="range" aria-label="Velocidad de cinta" min="20" max="120" step="10" value={Math.round(Number(belt.props?.speedMps??.08)*1000)} disabled={editing} onChange={e=>c.setConveyorProp('speedMps',Number(e.target.value)/1000)}/></label>
    <div className="rb-arm-actions"><button type="button" disabled={blocked} onClick={c.advance}>Avanzar hasta sensor</button><button type="button" disabled={blocked||c.line.progress.complete} onClick={()=>void c.classify()}>Clasificar lote</button></div>
    {c.step&&<p role="status">Paso {c.step.index} de {c.step.total} · {c.step.name}</p>}
    <details><summary>Practicar fallas</summary>
      <label><input type="checkbox" aria-label="Cinta atascada" disabled={editing} checked={belt.props?.jammed===true} onChange={e=>c.setConveyorProp('jammed',e.target.checked)}/> Cinta atascada</label>
      <label><input type="checkbox" aria-label="Sensor sin detección" disabled={editing} checked={belt.props?.sensorFault===true} onChange={e=>c.setConveyorProp('sensorFault',e.target.checked)}/> Sensor sin detección</label>
      <p>Activa una falla con la célula detenida e intenta avanzar. Un sensor sin detección lleva a una parada de protección en la salida. Para un color desconocido, cambia los canales de superficie de una pieza en Propiedades.</p>
    </details>
    <small>Cinta y sensores educativos genéricos; transporte sin deslizamiento. La presencia depende de la posición y la lectura RGB de la superficie simulada. Reiniciar práctica devuelve las piezas a la banda; conserva las fallas elegidas.</small>
  </fieldset>;
}
