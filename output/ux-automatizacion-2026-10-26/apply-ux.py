from pathlib import Path
root=Path('.')
def edit(file,old,new):
 p=root/file;s=p.read_text(encoding='utf-8');assert old in s,(file,old[:100]);p.write_text(s.replace(old,new,1),encoding='utf-8')
edit('src/lab/equipment/CabinetIntroduction.tsx',"const GOALS:","export const GOALS:")
p=root/'src/lab/equipment/CabinetIntroduction.tsx';s=p.read_text(encoding='utf-8');a=s.index(' return <section className="cab-welcome');b=s.index('\n}',a)
s=s[:a]+''' return <section className="cab-welcome cab-start" aria-label="Taller de tableros de control"><span className="cab-eyebrow"><PanelTop size={16}/>TALLER DE TABLEROS DE CONTROL</span><h2>¿Cómo quieres controlar la bomba?</h2><p className="cab-start-intro">Monta los equipos, conecta los bornes y comprueba Marcha y Paro.</p><div className="cab-profile-list">{PROFILE_ORDER.map(id=>{const profile=CABINET_PROFILES.find(p=>p.id===id)!,copy=PROFILE_COPY[id];return <div key={id} className={id==='pump-plc'?'cab-recommended':''}><strong>{id==='pump-plc'?'PLC industrial':profile.name}</strong><p>{id==='pump-plc'?'Cablea las entradas y salidas y programa en Ladder o ST.':id==='pump-direct'?'Practica marcha y retención con contactores, sin programar.':'Controla la maniobra con un relé lógico compacto.'}</p><button className="cab-primary" disabled={disabled} onClick={()=>onStart(id)}><Plus size={16}/>{copy.button}</button></div>;})}</div><small>Se crea un proyecto nuevo. Tu trabajo anterior se conserva en este navegador.</small><details className="cab-start-more"><summary>Qué aprenderás · estudiar o enseñar</summary><Purpose/></details></section>;''' +s[b:];s=s.replace('pulsa Accionar en la barra inferior','pulsa Simular proyecto en la barra superior');p.write_text(s,encoding='utf-8')
# Coherent labels both when creating the workshop and loading its sample program.
edit('src/lab/equipment/CabinetWorkshop.tsx',"import type {Laboratory}","import {plcTags} from '../plcContext';\nimport type {Laboratory}")
edit('src/lab/equipment/CabinetWorkshop.tsx',"plc:{...p.plc,rungs:[],source:''}","plc:{...p.plc,tags:plcTags({...p,equipment:createPumpBoard(profile)}),rungs:[],source:''}")
p=root/'src/lab/equipment/CabinetWorkshop.tsx';s=p.read_text(encoding='utf-8');a=s.index('  <header><span className="cab-eyebrow">');b=s.index("  {step==='brief'?",a)
s=s[:a]+'''  <div className="cab-detail-tools"><button className="cab-orientation-open" onClick={()=>setOrientation(true)}>Ajustes y ayuda del taller</button><button className="cab-schema-open" onClick={()=>setScheme(true)}>Ver esquema</button></div>
  {orientation?<FloatingWindow title="Cómo usar el taller de tableros" width={620} top={80} closeLabel="Cerrar orientación del taller" onClose={()=>setOrientation(false)}><CabinetHelp/></FloatingWindow>:null}
  {scheme?<FloatingWindow title="Esquema del encargo" eyebrow="Bombeo auxiliar · modelo didáctico" width={830} top={105} side="left" onClose={()=>setScheme(false)} closeLabel="Cerrar esquema del encargo" className="cab-schema-window"><CabinetSchematic board={board}/></FloatingWindow>:null}
  <div className="cab-progress"><progress value={passed} max={checks.length} aria-label="Verificaciones del tablero"/><span>{passed}/{checks.length} verificaciones</span></div>
  {running?<p className="cab-info">Simulación activa. Opera los mandos del montaje; detén para editar.</p>:null}
''' +s[b:]
s=s.replace('<b>Accionar</b> en la barra inferior','<b>Simular proyecto</b> en la barra superior')
s=s.replace("'Correcto. Paro o el térmico abren esa ruta.'","'Correcto. Paro o el térmico abren esa ruta.'")
p.write_text(s,encoding='utf-8')
edit('src/lab/equipment/cabinet.ts',"import {type LabProject}","import {plcTags} from '../plcContext';\nimport {type LabProject}")
edit('src/lab/equipment/cabinet.ts',"return {...project.plc,language,source:holding?","return {...project.plc,tags:plcTags(project),language,source:holding?")
# Programme state and contextual signal names; no change to electrical execution.
edit('src/lab/PLCView.tsx',"import {useState}","import {hasCabinetPLC,plcProgramEmpty,plcTags} from './plcContext';\nimport {useState}")
edit('src/lab/PLCView.tsx',"const booleanTags=project.plc.tags.filter", "const tags=plcTags(project),cabinetPLC=hasCabinetPLC(project),empty=plcProgramEmpty(project);\n  const booleanTags=tags.filter")
edit('src/lab/PLCView.tsx',"'Compilación correcta. El programa puede ejecutarse en el PLC virtual.'","empty?'Programa vacío. Añade un segmento o escribe el programa para empezar.':'Sin errores de compilación. Comprueba su comportamiento en la simulación.'")
edit('src/lab/PLCView.tsx',"'Programa listo'","empty?'Programa vacío':'Sin errores de compilación'")
edit('src/lab/PLCView.tsx',"Sin errores en el subconjunto admitido del PLC virtual.","{empty?'Añade un segmento o escribe el programa. Aún no hay una lógica que probar.':'La compilación es correcta. Prueba la secuencia para comprobar que cumple el objetivo.'}")
edit('src/lab/PLCView.tsx',"Las entradas de la planta se actualizan desde el tanque. Las demás entradas pueden accionarse durante RUN.","{cabinetPLC?'Las entradas I0.0–I0.3 se leen del cableado del tablero: marcha, paro, térmico y permiso. Simula y acciona sus mandos para observarlas.':'Las entradas de la planta se actualizan desde el tanque. Las demás entradas pueden accionarse durante RUN.'}")
edit('src/lab/PLCView.tsx',"{project.plc.tags.map(tag=>","{tags.map(tag=>")
edit('src/lab/PLCView.tsx',"Alcance del PLC virtual</summary>","Alcance del PLC virtual</summary>")
edit('src/lab/HMIView.tsx',"import {useEffect", "import {plcTags,hasCabinetPLC} from './plcContext';\nimport {useEffect")
edit('src/lab/HMIView.tsx',"const {project,running,update,runtime}=lab;", "const {project,running,update,runtime}=lab;const tags=plcTags(project);")
edit('src/lab/HMIView.tsx',"=>project.plc.tags.filter", "=>tags.filter")
edit('src/lab/HMIView.tsx',"{project.plc.tags.find(t=>t.address===widget.address)?.initial??0}","{project.plc.tags.find(t=>t.address===widget.address)?.initial??0}") if False else None
edit('src/lab/HMIView.tsx',"<p>Inicia la simulación y cambia Marcha. La salida Q0.0 activa el piloto y la bomba del tanque. Activa Paro para detenerla; desactiva Marcha para evitar un nuevo arranque.</p>","<p>{hasCabinetPLC(project)?'Los indicadores pueden mostrar las señales del tablero. Las entradas físicas se accionan desde sus pulsadores y protecciones; utiliza marcas M para los mandos de pantalla.':'Inicia la simulación y cambia Marcha. La salida Q0.0 activa el piloto y la bomba del tanque. Activa Paro para detenerla; desactiva Marcha para evitar un nuevo arranque.'}</p>")
# Physical inputs cannot be operated through HMI toggles even when not tank-reserved.
edit('src/lab/HMIView.tsx',"/^[IM]/.test(t.address)&&!reserved.includes(t.address)","(hasCabinetPLC(project)?/^M/:/^[IM]/).test(t.address)&&!reserved.includes(t.address)")
# Avoid rebuilding an unrelated object when naming a new cabinet project.
p=root/'src/lab/equipment/CabinetWorkshop.tsx';s=p.read_text(encoding='utf-8');s=s.replace('CabinetHelp,CabinetStepGoal','CabinetHelp');p.write_text(s,encoding='utf-8')
