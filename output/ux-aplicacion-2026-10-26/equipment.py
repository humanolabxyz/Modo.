from pathlib import Path
p=Path('src/lab/EquipmentView.tsx');s=p.read_text(encoding='utf-8')
s=s.replace('CircuitBoard,Download,','CircuitBoard,Hand,Cable,Focus,Undo2,Redo2,Download,',1)
s=s.replace("const [selected,setSelected]", "const [mode,setMode]=useState<'select'|'pan'|'wire'>('select'),[located,setLocated]=useState<PlannedWire|null>(null),[zoomHost,setZoomHost]=useState<HTMLDivElement|null>(null);\n const svg=useRef<SVGSVGElement>(null);\n const [selected,setSelected]",1)
s=s.replace("const openStep=(step:CabinetStep)=>{setCabinetStep(step);", "const openStep=(step:CabinetStep)=>{lab.setMessage('');setCabinetStep(step);",1)
s=s.replace('const place=(role:CabinetRole)=>{','const place=(role:CabinetRole)=>{lab.setMessage(\'\');',1)
# Identify reads geometry and changes only presentation; it never updates the project.
needle=' const beginWorkshop=()=>'
insert=''' const focusBounds=(ends:End[])=>{const points=ends.filter(e=>board.parts.some(p=>p.id===e.part&&ports(p.kind).some(q=>q.id===e.port))).map(point);if(!points.length)return;const x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y));stage.current?.focus({x:x-80,y:y-80,w:Math.max(180,Math.max(...points.map(p=>p.x))-x+160),h:Math.max(180,Math.max(...points.map(p=>p.y))-y+160)});};
 const focusSelection=()=>{if(active){const d=dimensions(active.kind);stage.current?.focus({x:active.x-65,y:active.y-65,w:d.w+130,h:d.h+130});return;}const wire=board.wires.find(w=>w.id===selectedWire);if(wire){const el=svg.current?.querySelector<SVGGElement>('.eq-wire.selected');if(el){const b=el.getBBox();stage.current?.focus({x:b.x-65,y:b.y-65,w:Math.max(180,b.width+130),h:Math.max(180,b.height+130)});return;}focusBounds([wire.from,wire.to]);}else if(located)focusBounds([located.from,located.to]);else stage.current?.fit();};
 const identify=(wire:PlannedWire)=>{const found=board.wires.find(w=>pair(w.from,w.to)===pair(wire.from,wire.to));setLocated(wire);setSelected(null);setSelectedWire(found?.id??null);setPending(null);setNotice(`${wire.label} · ${board.parts.find(p=>p.id===wire.from.part)?.tag}:${wire.from.port} → ${board.parts.find(p=>p.id===wire.to.part)?.tag}:${wire.to.port}`);requestAnimationFrame(()=>focusBounds([wire.from,wire.to]));};
 const changeMode=(next:'select'|'pan'|'wire')=>{setMode(next);setPending(null);setNotice(next==='wire'?'Conectar: elige el borne de origen y después el de destino.':next==='pan'?'Mano: arrastra la pizarra; los equipos conservan su posición.':'Seleccionar: toca un equipo o cable. Arrastra un equipo para moverlo.');};
'''
assert needle in s;s=s.replace(needle,insert+needle,1)
# Keep normal reads until event time, after point() has been initialized.
s=s.replace("const connect=(end:End)=>{if(running)return;", "const connect=(end:End)=>{if(running)return;setMode('wire');",1)
s=s.replace("useEffect(()=>{if(running){setPending(null);", "useEffect(()=>{if(running){setMode('select');setPending(null);",1)
# One fit effect, rather than two identical effects.
line=" useEffect(()=>{if(board.cabinet)stage.current?.fit();},[cabinetView,!!board.cabinet]);\n"
assert s.count(line)==2;s=s.replace(line,'',1)
s=s.replace("if(e.key==='Escape'){setPending(null);setSelected(null);setSelectedWire(null);}","if(e.key==='Escape'){setPending(null);setSelected(null);setSelectedWire(null);setLocated(null);}if(!(e.target as Element)?.closest('.mobile-floating-window')&&['v','h','c'].includes(e.key.toLowerCase())){e.preventDefault();changeMode(e.key.toLowerCase()==='h'?'pan':e.key.toLowerCase()==='c'?'wire':'select');}",1)
s=s.replace("pressed:!pending,onClick:()=>setPending(null)","pressed:mode==='select',onClick:()=>changeMode('select')",1)
s=s.replace("'separator',...FAMILIES.map", "{id:'pan',label:'Desplazar pizarra',icon:<Hand size={20}/>,pressed:mode==='pan',onClick:()=>changeMode('pan')},{id:'wire',label:'Conectar bornes',icon:<Cable size={20}/>,pressed:mode==='wire',disabled:running,onClick:()=>changeMode('wire')},'separator',...FAMILIES.map",1)
s=s.replace('apiRef={stage} focus=',"apiRef={stage} zoomTarget={board.cabinet?zoomHost:undefined} interaction={mode==='pan'?'pan':'auto'} focus=",1)
s=s.replace("{x:60,y:110,w:2250,h:1530}","{x:60,y:110,w:2250,h:board.parts.some(p=>p.y>=1110)?1530:1020}",1)
s=s.replace('setSelected(null);setSelectedWire(null);}}}>','setSelected(null);setSelectedWire(null);setLocated(null);}}}>',1)
s=s.replace('<svg className="eq-canvas"','<svg ref={svg} data-canvas-mode={mode} className="eq-canvas"',1)
s=s.replace('className={`eq-wire ${running', 'data-wire-id={w.id} className={`eq-wire ${running',1)
s=s.replace('e.preventDefault();select(p);if(running)',"e.preventDefault();select(p);if(mode==='wire'&&!running)return;if(running)",1)
s=s.replace("if(!running&&e.key.startsWith('Arrow'))", "if(!running&&mode!=='wire'&&e.key.startsWith('Arrow'))",1)
# Located pins remain visible even where connected-pin styling normally hides the dot.
needle="{ports(p.kind).map(port=><g key={port.id} className={`eq-port "
assert needle in s;s=s.replace(needle,"{ports(p.kind).map(port=><g key={port.id} className={`eq-port ${[located?.from,located?.to,board.wires.find(w=>w.id===selectedWire)?.from,board.wires.find(w=>w.id===selectedWire)?.to].some(e=>e?.part===p.id&&e.port===port.id)?'is-located':''} ",1)
s=s.replace("onClick={()=>connect({part:p.id,port:port.id})}","onClick={()=>{if(mode==='wire')connect({part:p.id,port:port.id});else{select(p);setSelectedPort(port.id);}}}",1)
s=s.replace("e.preventDefault();connect({part:p.id,port:port.id});", "e.preventDefault();if(mode==='wire')connect({part:p.id,port:port.id});else{select(p);setSelectedPort(port.id);}",1)
# Shared controls are laid out with the zoom, rather than overlapping at fixed coordinates.
needle=' properties={properties}><CabinetPanel'
new=''' properties={properties} onZoomHost={setZoomHost} tools={<>
  <button data-inline-action aria-label="Seleccionar y mover equipos" title="Seleccionar · V" aria-pressed={mode==='select'} onClick={()=>changeMode('select')}><MousePointer2 size={19}/><span>Seleccionar</span></button>
  <button data-inline-action aria-label="Desplazar pizarra" title="Mano · H" aria-pressed={mode==='pan'} onClick={()=>changeMode('pan')}><Hand size={19}/><span>Mano</span></button>
  <button data-inline-action aria-label="Conectar bornes" title="Conectar · C" aria-pressed={mode==='wire'} disabled={running} onClick={()=>changeMode('wire')}><Cable size={19}/><span>Conectar</span></button>
  <button data-inline-action aria-label="Deshacer en la pizarra" title="Deshacer · Ctrl+Z" disabled={running||!lab.canUndo} onClick={lab.undo}><Undo2 size={19}/><span>Deshacer</span></button>
  <button data-inline-action aria-label="Rehacer en la pizarra" title="Rehacer · Ctrl+Y" disabled={running||!lab.canRedo} onClick={lab.redo}><Redo2 size={19}/><span>Rehacer</span></button>
  <button data-inline-action aria-label="Ajustar selección" title="Ajustar selección" disabled={!active&&!selectedWire&&!located} onClick={focusSelection}><Focus size={19}/><span>Ajustar selección</span></button>
 </>}><CabinetPanel'''
assert needle in s;s=s.replace(needle,new,1).replace('connect={connectPlanned} selectedWire=', 'connect={connectPlanned} identify={identify} selectedWire=',1)
p.write_text(s,encoding='utf-8')
# Hide the empty equipment tray without changing parts or their coordinates.
p=Path('src/lab/equipment/CabinetScene.tsx');s=p.read_text(encoding='utf-8');a=s.index('  <rect x="105" y="1110"');b=s.index('\n  <text x="130" y="1091"',a);s=s[:a]+"  {board.parts.some(p=>p.y>=1110)?<g className=\"cab-tray\">"+s[a:b].strip()+"</g>:null}"+s[b:];p.write_text(s,encoding='utf-8')
