import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ChevronDown,FileImage,Focus,Minus,Plus,Upload,X,Hand,Route,Square,Undo2} from 'lucide-react';
import {useSvgNavigation,currentSvgView} from '../hooks/useSvgNavigation';
import {CadeDiagram,type CadeLearningProps} from './CadeDiagram';
import {CADE_DRAWINGS,ESTRELLA_CADE} from '../data/cade';
import {DiagramReader} from './DiagramReader';
import {MODULES,TERMINALS} from '../data/panel';
import {CLASS_DIAGRAMS,type DiagramReference,type DiagramRegion,type ManualStep} from '../data/practice';
type Props=CadeLearningProps&{onMaterial?:(material:'cade'|'learn'|'image')=>void;lesson?:ReactNode;learningMode?:'free'|'guided'|'exam';routeOptions?:ReactNode;routeToolbar?:ReactNode;routeDetails?:ReactNode;readingOnly?:boolean;onExpand?:()=>void;onClose?:()=>void;hidden?:boolean;diagram:DiagramReference|null;activeRegion:DiagramRegion|null;selected:string|null;onDiagram:(d:DiagramReference|null)=>void;onStep:(s:ManualStep)=>void;onError:(message:string)=>void;recognitionImage?:string;onLocate:(id:string)=>void;activePath?:{x:number;y:number}[];steps?:ManualStep[];onSelectStep?:(id:string)=>void;};
type View={x:number;y:number;w:number;h:number};
export function DiagramPane({hidden=false,diagram,activeRegion,selected,onDiagram,onStep,onError,recognitionImage,onLocate,activePath,steps=[],onSelectStep,lesson,learningMode,routeOptions,routeToolbar,routeDetails,readingOnly,onExpand,onClose,onMaterial,...cadeLearning}:Props){
 const [tab,setTab]=useState<'cade'|'learn'|'image'>(activeRegion||recognitionImage?'image':'cade');
 const [cadeId,setCadeId]=useState<'perfecto'|'estrella'>('perfecto'),guidedCade=cadeId==='perfecto';
 useEffect(()=>onMaterial?.(tab),[tab,onMaterial]);
 const [barsOpen,setBarsOpen]=useState(true);
 useEffect(()=>{try{if(localStorage.getItem('panellab.diagramBars')==='closed')setBarsOpen(false)}catch{}},[]);
 const toggleBars=()=>setBarsOpen(open=>{try{localStorage.setItem('panellab.diagramBars',open?'closed':'open')}catch{}return !open});
 const [lessonOpen,setLessonOpen]=useState(learningMode==='guided'||learningMode==='exam');
 const lessonRef=useRef<HTMLDetailsElement>(null),startPending=useRef(false);
 useEffect(()=>{if(learningMode==='exam')setLessonOpen(true)},[learningMode]);
 useEffect(()=>{if(startPending.current&&lesson&&lessonOpen){startPending.current=false;lessonRef.current?.scrollIntoView({block:'start'})}},[lessonOpen,lesson]);
 const startLesson=()=>{startPending.current=true;setLessonOpen(true);cadeLearning.onLearn?.()};
 const [imageTool,setImageTool]=useState<'pan'|'trace'|'region'>('pan'),[points,setPoints]=useState<{x:number;y:number}[]>([]);
 const [ratio,setRatio]=useState(1.33),[view,setView]=useState<View>({x:0,y:0,w:1000,h:1330});
 const [editing,setEditing]=useState(false),[draftRegion,setDraftRegion]=useState<DiagramRegion|null>(null);
 const [from,setFrom]=useState(''),[to,setTo]=useState(''),[title,setTitle]=useState(''),[explanation,setExplanation]=useState(''),[reviewed,setReviewed]=useState(false);
 const svg=useRef<SVGSVGElement>(null),gesture=useRef<{x:number;y:number;view:View;scale:number;regionStart:{x:number;y:number}}|null>(null);
 useSvgNavigation(svg,view,setView,{min:220,max:2400,active:tab==='image'||!!recognitionImage});
 const src=recognitionImage||diagram?.src;
 useEffect(()=>{
  setEditing(false);setDraftRegion(null);setReviewed(false);setPoints([]);setImageTool('pan');
  if(!src)return;let active=true;const img=new Image();img.onload=()=>{if(active){const next=img.naturalHeight/img.naturalWidth;setRatio(next);setView({x:0,y:0,w:1000,h:1000*next})}};img.onerror=()=>{if(active)onError('No se pudo cargar la imagen de referencia.')};img.src=src;return ()=>{active=false};
 },[src]);
 useEffect(()=>{if(cadeLearning.exam)setTab('cade')},[cadeLearning.exam]);
 useEffect(()=>{if(activeRegion||recognitionImage)setTab('image')},[activeRegion,recognitionImage]);
 const tracePath=(path:{x:number;y:number}[])=>path.map(p=>`${p.x},${p.y*ratio}`).join(' ');
 const imagePoint=(x:number,y:number)=>{
  const p=new DOMPoint(x,y).matrixTransform(svg.current!.getScreenCTM()!.inverse());
  return {x:Math.max(0,Math.min(1000,p.x)),y:Math.max(0,Math.min(1000,p.y/ratio))};
 };
 const regionRect=(region:DiagramRegion)=>({x:region.x,y:region.y*ratio,width:region.w,height:region.h*ratio});
 const zoom=(factor:number)=>setView(v=>{const w=Math.max(220,Math.min(2400,v.w*factor)),h=w*ratio;return {x:v.x+(v.w-w)/2,y:v.y+(v.h-h)/2,w,h}});
 const upload=async(file:File)=>{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){onError('Usa una imagen PNG, JPG o WebP de hasta 2 MB para guardarla en el navegador.');return;}
  const reader=new FileReader();reader.onload=()=>onDiagram({id:crypto.randomUUID(),name:file.name,src:String(reader.result),origin:'user_image'});reader.onerror=()=>onError('No se pudo leer el archivo.');reader.readAsDataURL(file);
 };
 const saveStep=()=>{
  if(!diagram||!draftRegion||!from||!to||from===to||!reviewed||!explanation.trim())return;
  onStep({id:crypto.randomUUID(),title:title.trim()||'Conexión revisada',from,to,region:draftRegion,...(imageTool==='trace'&&points.length>1?{path:points}:{}),explanation:explanation.trim(),review:'user_reviewed'});
  setEditing(false);setDraftRegion(null);setPoints([]);setImageTool('pan');setFrom('');setTo('');setTitle('');setExplanation('');setReviewed(false);
 };
 return <aside hidden={hidden} className={`diagram-pane ${tab==='cade'&&!recognitionImage&&guidedCade&&routeToolbar?'has-route-toolbar':''} diagram-simple`} aria-label="Diagrama y material de estudio">
  <div className="diagram-pane-actions"><strong>Diagrama</strong><button onClick={onExpand}>{readingOnly?'Volver al banco':'Ampliar diagrama'}</button><button aria-label="Cerrar diagrama" onClick={onClose}><X size={16}/></button></div>

  {tab==='cade'&&!recognitionImage&&guidedCade&&routeToolbar}
  <div className="diagram-pane-body" data-material={recognitionImage?'image':tab} data-bars={barsOpen?'open':'closed'}>
  {tab==='cade'&&!recognitionImage?<><button className="cade-bars-toggle" aria-expanded={barsOpen} onClick={toggleBars}><span>{barsOpen?'Ocultar selectores':`Selectores · ${guidedCade?'PERFECTO':'Estrella-triángulo'}`}</span><ChevronDown size={16}/></button><div className="cade-scope cade-source"><div role="group" aria-label="Diagrama de CADe a estudiar">{CADE_DRAWINGS.map(d=><button key={d.id} aria-pressed={cadeId===d.id} onClick={()=>setCadeId(d.id)}>{d.title}</button>)}</div></div>{guidedCade?<CadeDiagram key="perfecto" onLocate={onLocate} {...cadeLearning}/>:<CadeDiagram key="estrella" onLocate={onLocate} cade={ESTRELLA_CADE} title="Estrella-triángulo" exam={cadeLearning.exam}/>}</>:tab==='learn'&&!recognitionImage?<DiagramReader onLocate={onLocate}/>:<>
  <div className="pane-heading"><FileImage size={17}/><strong>{recognitionImage?'Referencia del reto':'Leer mi diagrama'}</strong></div>
  {!recognitionImage&&<details className="disclosure diagram-source-options" open={!diagram}><summary>{diagram?'Cambiar imagen':'Elegir imagen'}</summary><div className="diagram-source"><select aria-label="Referencia de diagrama" value={diagram?.origin==='class_photo'?diagram.id:diagram?'uploaded':'none'} onChange={e=>onDiagram(CLASS_DIAGRAMS.find(d=>d.id===e.target.value)||null)}><option value="none">Sin referencia</option>{CLASS_DIAGRAMS.map(d=><option key={d.id} value={d.id}>Foto de clase {d.id.slice(-1)}</option>)}{diagram?.origin==='user_image'&&<option value="uploaded">{diagram.name}</option>}</select><label className="upload-button" title="Cargar imagen"><Upload size={16}/><span>Cargar imagen</span><input aria-label="Cargar imagen de diagrama" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{if(e.target.files?.[0])void upload(e.target.files[0]);e.target.value=''}}/></label></div></details>}
  {src?<div className="diagram-canvas"><svg ref={svg} className={`diagram-svg ${editing?'is-marking':''}`} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="img" aria-label={recognitionImage?'Fotografía del módulo que estudias':diagram?.name} onPointerDown={e=>{
   if(e.button!==0||!svg.current)return;if(imageTool==='pan')e.currentTarget.dataset.dragging='true';gesture.current={x:e.clientX,y:e.clientY,view:currentSvgView(svg.current,view),scale:svg.current.getScreenCTM()?.a||1,regionStart:imagePoint(e.clientX,e.clientY)};if(imageTool==='trace'){setPoints([imagePoint(e.clientX,e.clientY)]);setDraftRegion(null)}e.currentTarget.setPointerCapture(e.pointerId);
  }} onPointerMove={e=>{
   const a=gesture.current;if(!a)return;
   if(imageTool==='trace'){const p=imagePoint(e.clientX,e.clientY);setPoints(prev=>{const last=prev.at(-1);return prev.length<500&&(!last||Math.hypot(p.x-last.x,p.y-last.y)>3)?[...prev,p]:prev})}
   else if(editing){const p=imagePoint(e.clientX,e.clientY);setDraftRegion({x:Math.min(p.x,a.regionStart.x),y:Math.min(p.y,a.regionStart.y),w:Math.abs(p.x-a.regionStart.x),h:Math.abs(p.y-a.regionStart.y)})}
   else setView({...a.view,x:a.view.x-(e.clientX-a.x)/a.scale,y:a.view.y-(e.clientY-a.y)/a.scale});
  }} onPointerUp={e=>{delete e.currentTarget.dataset.dragging;gesture.current=null;if(imageTool==='trace'&&points.length>1){const xs=points.map(p=>p.x),ys=points.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);setDraftRegion({x:Math.max(0,x-4),y:Math.max(0,y-4),w:Math.min(1000-Math.max(0,x-4),Math.max(...xs)-x+8),h:Math.min(1000-Math.max(0,y-4),Math.max(...ys)-y+8)})}}} onPointerCancel={e=>{delete e.currentTarget.dataset.dragging;gesture.current=null}}>
   <image href={src} width="1000" height={1000*ratio}/>
   {steps.filter(step=>step.path&&step.path!==activePath).map(step=><polyline key={step.id} points={tracePath(step.path!)} fill="none" stroke="#1296bd" strokeOpacity=".5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" tabIndex={0} role="button" aria-label={`Leer tramo: ${step.title}`} onPointerDown={e=>e.stopPropagation()} onClick={()=>onSelectStep?.(step.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelectStep?.(step.id)}}}/>)}
   {activePath&&<polyline data-active-path points={tracePath(activePath)} fill="none" stroke="#159dc4" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none"/>}
   {activeRegion&&!activePath&&<rect data-active-region {...regionRect(activeRegion)} fill="#ffc54a" fillOpacity=".2" stroke="#db8e16" strokeWidth="7"/>}
   {draftRegion&&imageTool!=='trace'&&<rect data-draft-region {...regionRect(draftRegion)} fill="#168973" fillOpacity=".16" stroke="#0e8c72" strokeWidth="7"/>}
   {points.length>1&&<polyline data-draft-path points={tracePath(points)} fill="none" stroke="#159dc4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none"/>}
  </svg>{diagram&&!recognitionImage&&<div className="image-tool-dock" role="toolbar" aria-label="Herramientas del diagrama"><button aria-label="Mover diagrama" aria-pressed={imageTool==='pan'} onClick={()=>{setImageTool('pan');setEditing(false)}}><Hand size={17}/></button><button aria-label="Trazar una línea" aria-pressed={imageTool==='trace'} onClick={()=>{setImageTool('trace');setEditing(true);setPoints([]);setDraftRegion(null);setReviewed(false)}}><Route size={18}/><span>Trazar línea</span></button><button aria-label="Marcar una zona" aria-pressed={imageTool==='region'} onClick={()=>{setImageTool('region');setEditing(true);setPoints([]);setDraftRegion(null);setReviewed(false)}}><Square size={17}/></button>{editing&&<button aria-label="Borrar trazado" onClick={()=>{setPoints([]);setDraftRegion(null)}}><Undo2 size={17}/></button>}</div>}<div className="diagram-zoom"><button aria-label="Alejar diagrama" onClick={()=>zoom(1.3)}><Minus size={15}/></button><button aria-label="Acercar diagrama" onClick={()=>zoom(1/1.3)}><Plus size={15}/></button><button aria-label="Ajustar diagrama" onClick={()=>setView({x:0,y:0,w:1000,h:1000*ratio})}><Focus size={15}/></button></div></div>:<div className="empty-diagram"><FileImage size={30}/><strong>Carga tu diagrama</strong><p>Una imagen legible te permitirá marcar los tramos y asociarlos manualmente a bornes.</p></div>}
  <p className="reference-caption">{recognitionImage?'Fotografía original del laboratorio.':diagram?.origin==='class_photo'?'Foto de proyección: las etiquetas no están completamente legibles. La guía requiere tu revisión.':diagram?'Imagen aportada por ti. Las asociaciones se revisan manualmente.':'PNG, JPG o WebP · hasta 2 MB · guardado local.'}</p>
  {diagram&&!recognitionImage&&<><button className="outline-full" aria-pressed={editing} onClick={()=>{setEditing(!editing);setImageTool(editing?'pan':'region');setPoints([]);setDraftRegion(null);setReviewed(false);if(!editing)setView({x:0,y:0,w:1000,h:1000*ratio})}}>{editing?<><X size={14}/> Cancelar marcado</>:'Marcar tramo y crear paso'}</button>
   {editing&&!draftRegion&&<p className="trace-instruction">{imageTool==='trace'?'Arrastra siguiendo una línea del diagrama. Al soltar, podrás indicar sus extremos y explicar qué une.':'Arrastra un rectángulo sobre el tramo que quieres estudiar.'}</p>}
   {editing&&draftRegion&&<form className="step-editor" onSubmit={e=>{e.preventDefault();saveStep()}}>
    <p>{draftRegion&&draftRegion.w>5&&draftRegion.h>5?'Zona marcada. Revisa el par de terminales.':'Arrastra un rectángulo sobre el tramo que quieres estudiar.'}</p>
    <label>Título del paso<input aria-label="Título del paso" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nombre de este tramo" maxLength={100}/></label>
    {(['from','to'] as const).map(end=><label key={end}>{end==='from'?'Origen':'Destino'}<select aria-label={end==='from'?'Borne de origen del paso':'Borne de destino del paso'} value={end==='from'?from:to} onChange={e=>end==='from'?setFrom(e.target.value):setTo(e.target.value)}><option value="">Seleccionar borne…</option>{MODULES.map(m=><optgroup key={m.id} label={m.title}>{TERMINALS.filter(t=>t.module.id===m.id).map(t=><option key={t.key} value={t.key}>{t.key}</option>)}</optgroup>)}</select><button type="button" className="text-action" disabled={!selected} onClick={()=>end==='from'?setFrom(selected||''):setTo(selected||'')}>Usar borne seleccionado</button></label>)}
    <label>Explicación<textarea aria-label="Explicación del paso" value={explanation} onChange={e=>setExplanation(e.target.value)} rows={3} maxLength={1500} placeholder="Explica la conexión según tu referencia."/></label>
    <label className="review-checkbox"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> Revisé esta zona y este par en mi referencia.</label>
    <button className="primary-action" disabled={!draftRegion||draftRegion.w<5||draftRegion.h<5||!from||!to||from===to||!reviewed||!explanation.trim()}>Guardar paso revisado</button>
   </form>}
  </>}
  {!!steps.length&&<div className="image-reading-list"><strong>Tramos de esta imagen</strong>{steps.map((step,i)=><button key={step.id} onClick={()=>onSelectStep?.(step.id)}>{i+1}. {step.title}<small>{step.from} → {step.to}</small></button>)}</div>}
  </>}
  {tab==='cade'&&!recognitionImage&&guidedCade&&routeDetails}
  {tab==='cade'&&!recognitionImage&&guidedCade&&!cadeLearning.exam&&(!lesson||!lessonOpen)&&<div className="diagram-practice-entry"><button onClick={startLesson}>Practicar paso a paso</button><p>La guía te indica qué bornes unir, una conexión a la vez.</p></div>}
  {tab==='cade'&&!recognitionImage&&guidedCade&&lesson&&(lessonOpen||learningMode==='exam')&&<details ref={lessonRef} className="lesson-shell" open={lessonOpen} onToggle={e=>setLessonOpen(e.currentTarget.open)}><summary>Práctica paso a paso</summary>{lesson}</details>}
  {!recognitionImage&&!cadeLearning.exam&&<details className="diagram-more"><summary>Material y otras opciones</summary><p>El circuito de la prueba está en PERFECTO; el cambio estrella-triángulo es otro diagrama de CADe. El material de estudio sirve para repasar la explicación del profesor.</p><div className="diagram-tabs" role="group" aria-label="Material de lectura"><button aria-pressed={tab==='cade'&&cadeId==='perfecto'} onClick={()=>{setTab('cade');setCadeId('perfecto')}}>PERFECTO · CADe<small>Circuito de la prueba</small></button><button aria-pressed={tab==='cade'&&cadeId==='estrella'} onClick={()=>{setTab('cade');setCadeId('estrella')}}>Estrella-triángulo · CADe<small>Diagrama a practicar · copia de la foto</small></button><button aria-pressed={tab==='learn'} onClick={()=>setTab('learn')}>Guía interactiva<small>Materia del profesor y repaso</small></button><button aria-pressed={tab==='image'} onClick={()=>setTab('image')}>Mi diagrama<small>Cargar una imagen propia</small></button></div>{tab==='cade'&&guidedCade&&routeOptions}</details>}

  </div>
 </aside>;
}
