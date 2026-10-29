import {useEffect,useId,useImperativeHandle,useRef,useState,type Ref} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ChevronDown,Download,ExternalLink,FolderOpen,Save} from 'lucide-react';
import {geoLesson,geoLessons,laboratoryLessonUrl,newGeoProgress,progressKey,readGeoProgress,studyLessonUrl,type GeoProgress} from '../learning/geogebraLessons';
import {loadGeoGebra,verifyGeoStep,type GeoGebraAPI} from './geogebra/api';
import {FloatingWindow} from '../components/FloatingWindow';
import '../styles/geogebra.css';
export type GeoGebraHandle={save:(done:()=>void)=>void};
export default function GeoGebraView({navigationRef}:{navigationRef:Ref<GeoGebraHandle>}){
  const [lesson]=useState(()=>geoLesson(new URLSearchParams(location.search).get('leccion')));
  const [lessonsOpen,setLessonsOpen]=useState(false);
  const [progress,setProgress]=useState<GeoProgress>(newGeoProgress),[ready,setReady]=useState(false),[error,setError]=useState(''),[saveMessage,setSaveMessage]=useState(''),[feedback,setFeedback]=useState(''),[passed,setPassed]=useState(false),[retry,setRetry]=useState(0),[guide,setGuide]=useState(true),[command,setCommand]=useState('');
  const host=useRef<HTMLDivElement>(null),api=useRef<GeoGebraAPI|null>(null),blocked=useRef(false),progressBlocked=useRef(false),saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null),saving=useRef(false),dirty=useRef(false),saveSequence=useRef(0),forceSave=useRef<(done?:()=>void)=>void>(done=>done?.());
  useImperativeHandle(navigationRef,()=>({save:done=>forceSave.current(done)}),[]);
  const id=`ggb-${useId().replace(/:/g,'')}`,workspaceKey=`modo:geogebra:workspace:${lesson?.id||'free'}:v1`;
  const step=lesson?.steps[progress.step],completed=!!lesson&&lesson.steps.every((_,i)=>progress.completed.includes(i));
  useEffect(()=>{
    if(!lesson)return;
    try{setProgress(readGeoProgress(lesson));}catch{progressBlocked.current=true;setSaveMessage('El avance anterior se conserva porque no se pudo leer. Puedes usar la guía, pero el nuevo avance no se guardará.');}
  },[lesson]);
  useEffect(()=>{
    let disposed=false,initialized=false,observer:ResizeObserver|undefined,instance:GeoGebraAPI|null=null;
    const target=host.current!;setError('');setReady(false);blocked.current=false;
    const save=(done?:()=>void)=>{
      if(saveTimer.current)clearTimeout(saveTimer.current);
      if(!instance||disposed){done?.();return;}
      if(blocked.current){done?.();return;}
      const sequence=++saveSequence.current;const current=instance;
      saving.current=true;
      try{current.getBase64(value=>{
        if(disposed||sequence!==saveSequence.current)return;
        try{if(value.length>4000000)throw new Error('El archivo es demasiado grande para el guardado local.');localStorage.setItem(workspaceKey,JSON.stringify({version:1,data:value}));dirty.current=false;setSaveMessage('Trabajo guardado en este navegador.');saving.current=false;done?.();}
        catch{saving.current=false;setSaveMessage('No se pudo guardar. Descarga tu archivo .ggb antes de salir.');}
      });}catch{saving.current=false;setSaveMessage('No se pudo guardar. Descarga tu archivo .ggb antes de salir.');}
    };
    forceSave.current=save;
    const changed=()=>{dirty.current=true;if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>save(),600);};
    const beforeLeave=(event:BeforeUnloadEvent)=>{if(dirty.current||saving.current){event.preventDefault();event.returnValue='';}};
    const finish=(loaded:GeoGebraAPI)=>{
      if(disposed){loaded.remove();return;}instance=loaded;api.current=loaded;
      const listen=()=>{
        if(disposed)return;
        loaded.registerAddListener(changed);loaded.registerUpdateListener(changed);loaded.registerRemoveListener(changed);loaded.registerClearListener(changed);loaded.registerClientListener(changed);
        initialized=true;setReady(true);setError('');
        observer=new ResizeObserver(entries=>{const width=Math.floor(entries[0].contentRect.width),height=Math.floor(entries[0].contentRect.height);if(width>0&&height>0)loaded.setSize(width,height);});observer.observe(target);
      };
      try{const raw=localStorage.getItem(workspaceKey);if(raw){const snapshot:unknown=JSON.parse(raw);if(typeof snapshot!=='object'||snapshot===null||!('version'in snapshot)||snapshot.version!==1||!('data'in snapshot)||typeof snapshot.data!=='string'||snapshot.data.length>4000000||!/^[A-Za-z0-9+/=]+$/.test(snapshot.data))throw new Error('Guardado incompatible');loaded.setBase64(snapshot.data,listen);}else listen();}
      catch{blocked.current=true;setSaveMessage('El archivo anterior se conserva porque no se pudo abrir. Descarga este trabajo para mantenerlo.');listen();}
    };
    const timeout=setTimeout(()=>{if(!initialized&&!disposed)setError('GeoGebra está tardando en responder. Puedes reintentar o abrirlo en otra pestaña.');},45000);
    const frame=document.createElement('iframe');frame.title='GeoGebra Classic';frame.src='/geogebra-frame.html';frame.allowFullscreen=true;
    frame.onload=()=>{const frameWindow=frame.contentWindow;if(!frameWindow||disposed)return;loadGeoGebra(frameWindow).then(Applet=>{
      if(disposed)return;const container=frameWindow.document.getElementById('geogebra-root');if(!container)throw new Error('No se pudo abrir el área de GeoGebra.');
      const applet=new Applet({id:'modoGeoGebra',appName:'classic',width:Math.max(300,target.clientWidth),height:Math.max(480,target.clientHeight),language:'es',showToolBar:true,showAlgebraInput:true,showMenuBar:true,showResetIcon:false,showFullscreenButton:true,showSuggestionButtons:true,enableCAS:true,enable3d:true,enableUndoRedo:true,preventFocus:true,useBrowserForJS:true,perspective:'AG',appletOnLoad:finish},true);
      applet.inject(container);
    }).catch(e=>{if(!disposed)setError(e instanceof Error?e.message:'No se pudo abrir GeoGebra.');});};target.replaceChildren(frame);
    window.addEventListener('beforeunload',beforeLeave);
    return()=>{disposed=true;clearTimeout(timeout);if(saveTimer.current)clearTimeout(saveTimer.current);observer?.disconnect();window.removeEventListener('beforeunload',beforeLeave);if(instance){instance.unregisterAddListener(changed);instance.unregisterUpdateListener(changed);instance.unregisterRemoveListener(changed);instance.unregisterClearListener(changed);instance.unregisterClientListener(changed);instance.remove();}frame.remove();api.current=null;};
  },[retry,workspaceKey]);
  const updateProgress=(next:GeoProgress)=>{setProgress(next);if(!lesson||progressBlocked.current)return;try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setSaveMessage('No se pudo guardar el avance de la guía. Conserva una copia del trabajo.');}};
  const check=()=>{
    if(!api.current||!step||!lesson)return;
    try{const correct=verifyGeoStep(api.current,step.check);setPassed(correct);setFeedback(correct?step.success:'Todavía no coincide. Revisa los nombres, los datos y los resultados indicados; puedes corregirlos en GeoGebra y comprobar otra vez.');if(correct)updateProgress({...progress,completed:[...new Set([...progress.completed,progress.step])]});}
    catch{setPassed(false);setFeedback('No se pudo comprobar este resultado. Revisa que los objetos estén definidos y vuelve a intentarlo.');}
  };
  const move=(index:number)=>{updateProgress({...progress,step:index});setFeedback('');setPassed(false);};
  const download=()=>{if(!api.current)return;api.current.getBase64(value=>{const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.geogebra.file'}));const a=document.createElement('a');a.href=url;a.download=`modo-${lesson?.id||'geogebra-libre'}.ggb`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});};
  const enterCommand=()=>{if(!api.current||!command.trim())return;try{const success=api.current.evalCommand(command);setFeedback(success?'Comando enviado a GeoGebra. Puedes editar el resultado en la herramienta.':'Revisa el resultado en GeoGebra. Si no cambió, comprueba la sintaxis del comando.');setPassed(false);if(success){setCommand('');forceSave.current();}}catch{setFeedback('No se pudo ejecutar el comando. Revisa la sintaxis y vuelve a intentarlo.');}};
  const leave=(event:React.MouseEvent<HTMLAnchorElement>,href:string)=>{if(!ready)return;event.preventDefault();forceSave.current(()=>{dirty.current=false;location.assign(href);});};
  return <section className="geo-workbench" aria-label="GeoGebra" data-geogebra-ready={ready}>
    <div className="geo-toolbar"><div><strong>{lesson?.title||'GeoGebra'}</strong><span>{lesson?'Lección guiada · archivo independiente':'Funciones y matrices · espacio libre'}</span></div><div className="geo-toolbar-actions">
      <button className="geo-lessons-trigger" aria-expanded={lessonsOpen} onClick={()=>setLessonsOpen(!lessonsOpen)}><BookOpen size={17}/>Lecciones</button>
      {lesson&&<button aria-expanded={guide} onClick={()=>setGuide(!guide)}><BookOpen size={16}/>{guide?'Ocultar guía':'Mostrar guía'}</button>}
      <button disabled={!ready} onClick={()=>forceSave.current()} aria-label="Guardar GeoGebra"><Save size={16}/><span>Guardar</span></button><button disabled={!ready} onClick={download} aria-label="Descargar archivo GeoGebra"><Download size={16}/><span>.ggb</span></button>
      <label className="geo-import"><FolderOpen size={16}/><span>Abrir .ggb</span><input aria-label="Abrir archivo GeoGebra" type="file" accept=".ggb" disabled={!ready} onChange={async event=>{const file=event.target.files?.[0];event.target.value='';if(!file||!api.current)return;if(file.size>3000000){setFeedback('El archivo supera los 3 MB. Ábrelo desde el menú de GeoGebra.');return;}if(api.current.getAllObjectNames().length&&!confirm('Abrir este archivo sustituirá el trabajo visible. Descarga una copia antes si deseas conservarlo.'))return;const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);api.current.setBase64(btoa(binary),()=>forceSave.current());}}/></label>
    </div></div>
    <div className={`geo-layout ${lesson&&guide?'has-guide':''}`}>
      {lesson&&guide&&step&&<aside className="geo-guide" aria-label="Lección de GeoGebra"><a href={studyLessonUrl(lesson)} onClick={e=>leave(e,studyLessonUrl(lesson))}><ArrowLeft size={16}/>Volver a la clase</a><p className="geo-eyebrow">PASO {progress.step+1} DE {lesson.steps.length}</p><h2>{step.title}</h2><p>{step.text}</p><details><summary>Ver comandos de ayuda <ChevronDown size={14}/></summary>{step.commands.map(command=><code key={command}>{command}</code>)}<small>Escríbelos en GeoGebra o en el campo de comandos. Los comandos se muestran con sus nombres internacionales.</small></details>
        {lesson.source?<a href={`${lesson.source}#page=${step.page}`} target="_blank" rel="noreferrer">Guía original · página {step.page} <ExternalLink size={13}/></a>:<small>Práctica complementaria de matrices · modo.</small>}
        <button className="geo-primary" disabled={!ready} onClick={check}>Comprobar mi trabajo <Check size={16}/></button>
        {feedback&&<p className={`geo-feedback ${passed?'is-correct':''}`} role="status">{feedback}</p>}
        <div className="geo-step-actions"><button disabled={progress.step===0} onClick={()=>move(progress.step-1)} aria-label="Paso anterior"><ArrowLeft size={17}/></button><span>{progress.completed.length}/{lesson.steps.length} comprobados</span><button disabled={progress.step===lesson.steps.length-1||!progress.completed.includes(progress.step)} onClick={()=>move(progress.step+1)} aria-label="Paso siguiente"><ArrowRight size={17}/></button></div>
        {completed&&<a className="geo-primary" href={studyLessonUrl(lesson,2)} onClick={e=>leave(e,studyLessonUrl(lesson,2))}>Práctica completada · volver a Estudio <ArrowRight size={17}/></a>}
        <label className="geo-notes">Mis observaciones<textarea value={progress.notes} maxLength={20000} onChange={e=>updateProgress({...progress,notes:e.target.value})} placeholder="Qué observaste, qué cambió y por qué…"/></label>
        <a href="/laboratorio?tool=geogebra" onClick={e=>leave(e,'/laboratorio?tool=geogebra')}>Abrir mi archivo libre ↗</a>
      </aside>}
      <div className="geo-surface"><div id={id} ref={host} className="geo-applet" aria-label="Área de trabajo de GeoGebra"/>
        {!ready&&<div className="geo-loading" role="status">{error?<><strong>No pudimos abrir GeoGebra</strong><p>{error}</p><button onClick={()=>{api.current=null;setRetry(n=>n+1);}}>Reintentar</button><a href="https://www.geogebra.org/classic" target="_blank" rel="noreferrer">Abrir GeoGebra en otra pestaña ↗</a></>:<><strong>Abriendo GeoGebra Classic…</strong><span>Necesita conexión a Internet.</span></>}</div>}
      </div>
    </div>
    <form className="geo-command" onSubmit={e=>{e.preventDefault();enterCommand();}}><label htmlFor={`${id}-command`}>Comando de GeoGebra</label><input id={`${id}-command`} disabled={!ready} value={command} maxLength={2000} onChange={e=>setCommand(e.target.value)} placeholder="Ej.: f(x)=2x-3 o A={{1,2},{3,4}}" autoComplete="off"/><button disabled={!ready||!command.trim()} type="submit">Ejecutar <ArrowRight size={16}/></button></form>
    {(!lesson||!guide)&&feedback&&<p className="geo-feedback" role="status">{feedback}</p>}
    <div className="geo-footer"><span role="status">{saveMessage||'El archivo libre y cada lección se guardan por separado en este navegador.'}</span><a href="https://www.geogebra.org/" target="_blank" rel="noreferrer">GeoGebra® <ExternalLink size={12}/></a></div>
    {lessonsOpen&&<FloatingWindow className="geo-lessons-window" title="Lecciones y ejercicios" eyebrow="FUNCIONES Y MATRICES" width={420} side="right" closeLabel="Cerrar lecciones" onClose={()=>setLessonsOpen(false)}><div className="geo-lesson-catalog">{[{title:'Matrices · prácticas complementarias',items:geoLessons.filter(l=>l.unit===4)},{title:'Funciones · guías de clase',items:geoLessons.filter(l=>l.unit!==4)}].map(group=><section key={group.title}><h2>{group.title}</h2>{group.items.map(l=><a key={l.id} href={laboratoryLessonUrl(l)} onClick={e=>leave(e,laboratoryLessonUrl(l))}><div><strong>{l.title}</strong><span>{l.steps.length} actividades · explicación y comprobación</span></div><ArrowRight size={17}/></a>)}</section>)}<p>El espacio libre y cada lección conservan sus archivos y avances por separado.</p></div></FloatingWindow>}
  </section>;
}
