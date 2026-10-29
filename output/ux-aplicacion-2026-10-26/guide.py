from pathlib import Path
p=Path('src/components/FloatingWindow.tsx');s=p.read_text(encoding='utf-8').replace("'.tool-dock,.lab-dock'","'.tool-dock,.lab-dock,.cab-controls'");p.write_text(s,encoding='utf-8')
p=Path('src/lab/equipment/CabinetWorkshop.tsx');s=p.read_text(encoding='utf-8');s=s.replace('connect:(wire:PlannedWire)=>void;', 'connect:(wire:PlannedWire)=>void;identify:(wire:PlannedWire)=>void;',1).replace('change,place,connect,selectedWire,','change,place,connect,identify,selectedWire,',1)
s=s.replace('<button aria-label={`Colocar ${s.tag}`}','<button data-inline-action className="cab-part-action" aria-label={`Colocar ${s.tag}`}')
a=s.index("  {step==='brief'?");b=s.index("  {step==='mount'?",a)
old=s[a:b];start=old.index('<ol>');end=old.index('<fieldset disabled={running}>');extra=old[start:end];field=old[end:];field=field.replace('</div>:null}', '<details className="cab-brief-details"><summary>Ver el encargo completo y su contexto</summary>'+extra+'</details></div>:null}',1)
s=s[:a]+'''  {step==='brief'?<div className="cab-lesson"><p className="cab-brief-objective">Marcha inicia la bomba. Paro y el contacto térmico deben detenerla.</p>'''+field+s[b:]
old="onClick={()=>{connect(current);const next=plan.find(p=>p.label!==current.label&&!board.wires.some(w=>pair(w.from,w.to)===pair(p.from,p.to)));setLine(next?.label??current.label);}}"
new="onClick={()=>{if(present){identify(current);return;}connect(current);const next=plan.find(p=>p.label!==current.label&&!board.wires.some(w=>pair(w.from,w.to)===pair(p.from,p.to)));setLine(next?.label??current.label);}}"
assert old in s;s=s.replace(old,new,1)
s=s.replace("{present?'Identificar':'Conectar'} {current.label}</button></div>","{present?'Identificar':'Conectar'} {current.label}</button>{!present?<button className=\"cab-locate\" onClick={()=>identify(current)}>Localizar bornes de {current.label}</button>:null}</div>",1)
s=s.replace("if(!rungs.length)return <p>Aún no hay segmentos.","if(!rungs.length)return <p>Aún no hay segmentos.")
p.write_text(s,encoding='utf-8')
