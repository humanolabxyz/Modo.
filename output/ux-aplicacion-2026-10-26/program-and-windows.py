from pathlib import Path
p=Path('src/lab/PLCView.tsx');s=p.read_text(encoding='utf-8').replace("import {useState}","import {useRef,useState}",1).replace('Hammer,ListPlus,Rows3,Code2','Hammer,ListPlus,Rows3,Code2,Minus,Plus,Focus',1)
s=s.replace("const reserved=[project.process", "const [programZoom,setProgramZoom]=useState(1),[inspectorHost,setInspectorHost]=useState<HTMLDivElement|null>(null);\n  const program=useRef<HTMLDivElement>(null);\n  const fitProgram=()=>{const rows=[...program.current?.querySelectorAll<HTMLElement>('.plc-circuit-viewport')??[]];const scale=Math.min(1,...rows.map(v=>v.clientWidth/Math.max(1,v.querySelector<HTMLElement>('.lab-rung-circuit')?.scrollWidth??1)));setProgramZoom(Math.max(.25,scale));};\n  const unavailable=(tag:Tag)=>cabinetPLC&&!running&&/^I/.test(tag.address);\n  const reserved=[project.process",1)
s=s.replace("<div className=\"lab-rungs\">","<div ref={program} className=\"lab-rungs\">",1)
needle="      {project.plc.rungs.length===0?"
new='''      {project.plc.rungs.length>0?<div className="plc-program-navigation"><span>Segmentos continuos · desplaza para seguir la rama</span><div role="group" aria-label="Zoom del programa"><button aria-label="Alejar programa" onClick={()=>setProgramZoom(z=>Math.max(.25,z/1.2))}><Minus size={16}/></button><output>{Math.round(programZoom*100)}%</output><button aria-label="Acercar programa" onClick={()=>setProgramZoom(z=>Math.min(1.5,z*1.2))}><Plus size={16}/></button><button aria-label="Ajustar programa" onClick={fitProgram}><Focus size={16}/></button></div></div>:null}
'''
assert needle in s;s=s.replace(needle,new+needle,1)
s=s.replace('value={rung.comment} maxLength','value={rung.comment} title={rung.comment} maxLength',1)
s=s.replace('<div className="lab-rung-circuit">','<div className="plc-circuit-viewport" tabIndex={0} role="region" aria-label={`Circuito del segmento ${index+1}. Desplaza horizontalmente o ajusta el programa.`}><div className="lab-rung-circuit" style={{zoom:programZoom}}>',1)
s=s.replace('</small>:null}</div></div>','</small>:null}</div></div></div>',1)
s=s.replace('className={`lab-bit ${value(tag)?', 'data-inline-action title={unavailable(tag)?\'Entrada física: inicia la simulación para leerla\':tag.name} className={`lab-bit ${!unavailable(tag)&&value(tag)?',1).replace('aria-pressed={!!value(tag)}','aria-pressed={!unavailable(tag)&&!!value(tag)}',1)
s=s.replace('<FloatingDock label="Herramientas del programa" items={dock}/>','<div className="plc-bottom-tools"><FloatingDock label="Herramientas del programa" items={dock}/><div ref={setInspectorHost}/></div>',1)
s=s.replace('<InspectorSheet title="Variables y memoria"', '<InspectorSheet triggerTarget={inspectorHost} title="Variables y memoria"',1)
p.write_text(s,encoding='utf-8')
p=Path('src/lab/InspectorSheet.tsx');s=p.read_text(encoding='utf-8').replace("import {ChevronUp}","import {ChevronUp,SlidersHorizontal}",1);s="import {createPortal} from 'react-dom';\n"+s;s=s.replace('children,floating=false}', 'children,floating=false,triggerTarget}',1).replace('floating?:boolean})','floating?:boolean;triggerTarget?:HTMLElement|null})',1);s=s.replace('const [open,setOpen]=useState(false);',"const [open,setOpen]=useState(false),[created,setCreated]=useState(false),[activation,setActivation]=useState(0);",1).replace('if(openKey)setOpen(true);','if(openKey){setOpen(true);setCreated(true);setActivation(v=>v+1);}',1)
a=s.index('  return <>');b=s.index('\n}',a)
s=s[:a]+'''  const trigger=<button type="button" className={`lab-inspector-trigger ${floating?'cab-guide-trigger':''}`} title={title} aria-label={`Abrir ${title.toLocaleLowerCase('es')}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setOpen(true);setCreated(true);setActivation(v=>v+1);}}><SlidersHorizontal size={18}/><strong>{title}</strong><ChevronUp size={16}/></button>;
  return <>
    {triggerTarget?createPortal(trigger,triggerTarget):trigger}
    {created&&<FloatingWindow title={title} eyebrow={summary} width={floating&&!compact?420:350} side="right" top={104} className={`lab-property-window ${floating?'cab-guide-window':''}`} showControlsHint={floating} activation={activation} visible={open} closeLabel={`Cerrar ${title.toLocaleLowerCase('es')}`} onMinimize={()=>setOpen(false)} onClose={()=>{setOpen(false);setCreated(false);}}><div className="lab-property-content">{children}</div></FloatingWindow>}
  </>;
''' +s[b:];p.write_text(s,encoding='utf-8')
# Standard disclosure menus also preserve their contents when minimized.
p=Path('src/components/FloatingDisclosure.tsx');s=p.read_text(encoding='utf-8').replace('[open,setOpen]=useState(false);','[open,setOpen]=useState(false),[minimized,setMinimized]=useState(false),[activation,setActivation]=useState(0);',1).replace('setOpen(false)};','setOpen(false);setMinimized(false)};',1)
s=s.replace("e.preventDefault();const next=", "e.preventDefault();if(open&&minimized){setMinimized(false);setActivation(v=>v+1);return;}const next=",1).replace('scaleBody={false} title={title}', 'scaleBody={false} visible={!minimized} activation={activation} onMinimize={()=>setMinimized(true)} title={title}',1)
p.write_text(s,encoding='utf-8')
