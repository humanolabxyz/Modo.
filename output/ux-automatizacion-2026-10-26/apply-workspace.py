from pathlib import Path
p=Path('src/lab/EquipmentView.tsx');s=p.read_text(encoding='utf-8')
s=s.replace("import {CabinetPanel,CabinetWelcome,type CabinetView}","import {CabinetGuide} from './equipment/CabinetGuide';\nimport '../styles/automation-workspace.css';\nimport {CabinetPanel,CabinetWelcome,type CabinetView}",1)
s=s.replace("matchMedia('(max-width:520px) and (orientation:portrait)').matches?'plate':'all'","matchMedia('(max-width:1100px)').matches?'plate':'all'",1)
s=s.replace("const openStep=(step:CabinetStep)=>{setCabinetStep(step);", "const openStep=(step:CabinetStep)=>{setCabinetStep(step);if(step==='mount'||step==='wire'||step==='program')setCabinetView('plate');else if(step==='test')setCabinetView('door');else if(step==='brief')setCabinetView('all');",1)
# Refit only when the user changes the requested view. Dragging, wiring and edits keep the user's zoom.
s=s.replace("const pendingPart=pending&&", "useEffect(()=>{if(board.cabinet)stage.current?.fit();},[cabinetView,!!board.cabinet]);\n const pendingPart=pending&&",1)
# Existing properties remain functional and are available from the guide header without opening another window.
a=s.index('  {active?<div className="eq-pf">');b=s.index('\n </InspectorSheet>',a)
properties=s[a:b]
s=s[:a]+s[b:]
returnidx=s.index(' return <div className={`lab-split eq-workspace')
s=s[:returnidx]+' const properties=<>'+properties+'</>;\n'+s[returnidx:]
s=s.replace("${board.cabinet?'cabinet-workspace':''}","${board.cabinet?'cabinet-workspace cab-guided':''}",1)
s=s.replace('<FloatingWindow showControlsHint title="Taller de tableros de control" width={620}', '<FloatingWindow title="Taller de tableros de control" width={620}',1)
old='''<div className="cab-stage-actions"><button onClick={()=>setGuideOpen(n=>n+1)}><CabinetIcon name="guide" size={14}/>Guía del taller</button>{(['all','plate','door','field']as const).map(v=><button key={v} aria-pressed={cabinetView===v} onClick={()=>setCabinetView(v)}><CabinetIcon name={v} size={14}/>{v==='all'?'Conjunto':v==='plate'?'Placa':v==='door'?'Puerta':'Campo'}</button>)}</div>'''
new='''<label className="cab-zone-control">Vista<select aria-label="Zona del gabinete" value={cabinetView} onChange={e=>setCabinetView(e.target.value as CabinetView)}><option value="all">Conjunto</option><option value="plate">Placa</option><option value="door">Puerta</option><option value="field">Campo</option></select></label>'''
assert old in s;s=s.replace(old,new,1)
# Make the first action visible on the otherwise empty canvas, also on mobile.
s=s.replace('''  <PanStage width={WORLD.w}''','''  {!board.cabinet&&!board.parts.length?<div className="eq-start-actions"><h2>¿Qué quieres montar?</h2><p>Construye el control de una bomba paso a paso o añade equipos para un montaje libre.</p><button type="button" disabled={!lab.ready||running||lab.projects.length>=30} onClick={beginWorkshop}>Elegir práctica de tableros</button><small>Para explorar libremente, añade piezas desde la barra de equipos.</small></div>:null}
  <PanStage width={WORLD.w}''',1)
s=s.replace('''!board.parts.length?<g className="eq-empty">''','''!board.parts.length?<g className="eq-empty" aria-hidden="true" style={{display:'none'}}>''',1)
# One execution control, in the project bar; stages live in the guide.
a=s.index("  </PanStage>{board.cabinet?<div className=\"cab-actionbar")
b=s.index('<input ref={importer}',a)
s=s[:a]+'''   </PanStage>{!board.cabinet?<FloatingDock label="Herramientas de equipos eléctricos" items={dock}/>:null}'''+s[b:]
a=s.index('</section><InspectorSheet floating=')
b=s.index('\n}',a)
s=s[:a]+'''  </section>{board.cabinet?<CabinetGuide board={board} step={cabinetStep} navigate={openStep} openKey={guideOpen} selectionLabel={active?.tag??(selectedWire?'Cable':undefined)} properties={properties}><CabinetPanel board={board} lab={lab} change={update} place={place} connect={connectPlanned} selectedWire={selectedWire} view={cabinetView} setView={setCabinetView} step={cabinetStep} navigate={openStep}/></CabinetGuide>:<InspectorSheet title="Equipo y conexiones" summary={active?`${active.tag} · ${definition(active.kind).name}`:'Selecciona un equipo'} openKey={selected??selectedWire}><h2>Equipo y conexiones</h2>{!active&&!selectedWire?<div className="cab-entry-summary"><h3>Práctica guiada</h3><p>Monta, cablea y prueba el control de una bomba.</p><button type="button" disabled={!lab.ready||running||lab.projects.length>=30} onClick={beginWorkshop}>Elegir práctica</button></div>:null}{properties}</InspectorSheet>}</div>;
''' +s[b:]
p.write_text(s,encoding='utf-8')
p=Path('src/lab/equipment/CabinetWorkshop.tsx');s=p.read_text(encoding='utf-8');a=s.index('export function CabinetWelcome(');b=s.index('\n\nfunction CabinetLayoutEditor',a)
s=s[:a]+'''export function CabinetWelcome({lab}:{lab:Laboratory}){
 return <CabinetStart disabled={!lab.ready||lab.running||lab.projects.length>=30} onStart={profile=>lab.add('blank',p=>{
  const equipment=createPumpBoard(profile),next={...p,name:'Tablero · '+CABINET_PROFILES.find(item=>item.id===profile)!.name,equipment};
  return profile==='pump-direct'?next:{...next,plc:{...p.plc,tags:plcTags(next),rungs:[],source:''}};
 })}/>;
}''' +s[b:];p.write_text(s,encoding='utf-8')
# Context is present on all four views, including when the user moves to another tool.
p=Path('src/lab/LaboratoryApp.tsx');s=p.read_text(encoding='utf-8');s=s.replace("import {LAB_COMPACT_QUERY}","import './..//styles/automation-workspace.css';\nimport {LAB_COMPACT_QUERY}",1).replace("'./..//styles/automation-workspace.css'","'../styles/automation-workspace.css'")
s=s.replace("${tool==='geogebra'?'lab-geogebra-mode':''}","${tool==='geogebra'?'lab-geogebra-mode':''} ${inGroup?'lab-automation':''}",1)
needle='''        <Suspense fallback='''
assert needle in s
s=s.replace(needle,'''        {inGroup?<div className="automation-context" role="note"><strong>Automatización</strong><span>{lab.project.equipment?.cabinet?'Control de una bomba · Tablero y PLC comparten el montaje. HMI y Procesos son vistas complementarias.':'Un proyecto compartido · Montaje, programa, pantalla y proceso.'}</span></div>:null}
'''+needle,1)
p.write_text(s,encoding='utf-8')



