import {ListChecks,Terminal} from 'lucide-react';
import {useEffect,useId,useImperativeHandle,useLayoutEffect,useRef,useState,type Ref,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Keyboard,Check,ChevronDown,Download,ExternalLink,FolderOpen,Save,FileText,Maximize2,Minimize2} from 'lucide-react';
import {geoLesson,geoLessons,laboratoryLessonUrl,newGeoProgress,progressKey,readGeoProgress,studyLessonUrl,type GeoProgress} from '../learning/geogebraLessons';
import {loadGeoGebra,verifyGeoStep,executeGeoCommand,type GeoGebraAPI} from './geogebra/api';
import {FloatingWindow} from '../components/FloatingWindow';
import {GeoCommandKeyboard} from './GeoCommandKeyboard';
import {mathUnits} from '../learning/mathUnits';
import {matrixNotebooks} from '../study/matrixNotebooks';
import '../styles/geogebra.css';
import '../styles/geogebra-responsive.css';
import '../styles/geogebra-workspace.css';
export type GeoGebraHandle={save:(done:()=>void)=>void};
type ExternalLesson={open:boolean;onOpen:()=>void;onClose:()=>void;render:(guide:ReactNode,progress:GeoProgress,confirmation:boolean)=>ReactNode};
export default function GeoGebraView({navigationRef,lessonId,externalLesson}:{navigationRef:Ref<GeoGebraHandle>;lessonId?:string;externalLesson?:ExternalLesson}){
  const [lesson]=useState(()=>geoLesson(lessonId||new URLSearchParams(location.search).get('leccion')));
  const [lessonsOpen,setLessonsOpen]=useState(false);
  const [commandOpen,setCommandOpen]=useState(true),[feedbackKind,setFeedbackKind]=useState<'info'|'error'>('info');
  const [confirmation,setConfirmation]=useState(false),[resultsOpen,setResultsOpen]=useState(false);
  const advanceTimer=useRef<ReturnType<typeof setTimeout>|null>(null),checking=useRef(false);
  useEffect(()=>()=>{if(advanceTimer.current)clearTimeout(advanceTimer.current);},[]);
  const [filesOpen,setFilesOpen]=useState(false),[unit,setUnit]=useState<number>(lesson?.unit||1);
  const [expanded,setExpanded]=useState(false);
  useEffect(()=>{const page=host.current?.closest('.lab-page');page?.classList.toggle('geo-expanded',expanded);return()=>page?.classList.remove('geo-expanded');},[expanded]);
  const [view,setView]=useState('G');
  const [keyboardOpen,setKeyboardOpen]=useState(false);
  const foldKeyboard=()=>setKeyboardOpen(false);
  const toggleKeyboard=()=>{setGuide(false);externalLesson?.onClose();setCommandOpen(true);setKeyboardOpen(open=>!open);};
  const commandInput=useRef<HTMLInputElement>(null),guideBody=useRef<HTMLDivElement>(null);
  const commandCaret=useRef<number|null>(null);
  const [progress,setProgress]=useState<GeoProgress>(newGeoProgress),[ready,setReady]=useState(false),[error,setError]=useState(''),[saveMessage,setSaveMessage]=useState(''),[feedback,setFeedback]=useState(''),[passed,setPassed]=useState(false),[retry,setRetry]=useState(0),[guide,setGuide]=useState(false),[command,setCommand]=useState('');
  const host=useRef<HTMLDivElement>(null),api=useRef<GeoGebraAPI|null>(null),blocked=useRef(false),progressBlocked=useRef(false),saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null),saving=useRef(false),dirty=useRef(false),saveSequence=useRef(0),forceSave=useRef<(done?:()=>void)=>void>(done=>done?.());
  useLayoutEffect(()=>{const caret=commandCaret.current,input=commandInput.current;if(caret===null||!input)return;commandCaret.current=null;input.focus({preventScroll:true});input.setSelectionRange(caret,caret);},[command]);

  useImperativeHandle(navigationRef,()=>({save:done=>forceSave.current(done)}),[]);
  const progressRef=useRef(progress);progressRef.current=progress;
  const id=`ggb-${useId().replace(/:/g,'')}`,workspaceKey=`modo:geogebra:workspace:${lesson?.id||'free'}:v1`;
  const step=lesson?.steps[progress.step],completed=!!lesson&&lesson.steps.every((_,i)=>progress.completed.includes(i));
  useEffect(()=>{
    const page=host.current?.closest<HTMLElement>('.lab-page');if(!page)return;
    const viewport=window.visualViewport;
    const fit=()=>{page.style.setProperty('--geo-visible-height',`${viewport?.height||innerHeight}px`);page.style.setProperty('--geo-visible-top',`${viewport?.offsetTop||0}px`);};
    fit();viewport?.addEventListener('resize',fit);viewport?.addEventListener('scroll',fit);window.addEventListener('resize',fit);
    return()=>{viewport?.removeEventListener('resize',fit);viewport?.removeEventListener('scroll',fit);window.removeEventListener('resize',fit);page.style.removeProperty('--geo-visible-height');page.style.removeProperty('--geo-visible-top');};
  },[]);
  useEffect(()=>{if(!ready)return;let frame=0;try{api.current?.setPerspective(view);api.current?.showToolBar(view!=='A');const target=host.current;if(target)api.current?.setSize(target.clientWidth,target.clientHeight);frame=requestAnimationFrame(foldKeyboard);}catch{setFeedback('No se pudo cambiar la vista. Intenta seleccionarla otra vez.');}return()=>cancelAnimationFrame(frame);},[view,ready]);
  useEffect(()=>{if(feedback&&guide)guideBody.current?.querySelector('.geo-feedback')?.scrollIntoView({block:'nearest'});},[feedback,guide]);
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
      try{const raw=localStorage.getItem(workspaceKey);if(raw){const snapshot:unknown=JSON.parse(raw);if(typeof snapshot!=='object'||snapshot===null||!('version'in snapshot)||snapshot.version!==1||!('data'in snapshot)||typeof snapshot.data!=='string'||snapshot.data.length>4000000||!/^[A-Za-z0-9+/=]+$/.test(snapshot.data))throw new Error('Guardado incompatible');loaded.setBase64(snapshot.data,listen);}else {if(lesson?.viewBounds)executeGeoCommand(loaded,`ZoomIn(${lesson.viewBounds.join(',')})`);listen();}}
      catch{blocked.current=true;setSaveMessage('El archivo anterior se conserva porque no se pudo abrir. Descarga este trabajo para mantenerlo.');listen();}
    };
    const timeout=setTimeout(()=>{if(!initialized&&!disposed)setError('GeoGebra está tardando en responder. Puedes reintentar o abrirlo en otra pestaña.');},45000);
    // GWT enables debugging by default on localhost, but on a public host even
    // the presence of GeoGebraDebug=false enables its blank-iframe loader.
    // Keep both environments on the normal fetch loader, controlled by our SW.
    const localHost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    const frame=document.createElement('iframe');frame.title='GeoGebra Classic';frame.src='/geogebra-frame.html'+(localHost?'?GeoGebraDebug=false':'');frame.allowFullscreen=true;
    frame.onload=()=>{const frameWindow=frame.contentWindow;if(!frameWindow||disposed)return;loadGeoGebra(frameWindow).then(Applet=>{
      if(disposed)return;const container=frameWindow.document.getElementById('geogebra-root');if(!container)throw new Error('No se pudo abrir el área de GeoGebra.');
      const applet=new Applet({id:'modoGeoGebra',appName:'classic',width:Math.max(160,target.clientWidth),height:Math.max(100,target.clientHeight),language:'es',showToolBar:true,showAlgebraInput:false,showMenuBar:true,showResetIcon:false,showFullscreenButton:true,showSuggestionButtons:true,showKeyboardOnFocus:false,disableAutoScale:true,enableCAS:true,enable3d:true,enableUndoRedo:true,preventFocus:true,useBrowserForJS:true,perspective:'G',appletOnLoad:finish},true);
      applet.setHTML5Codebase('/vendor/geogebra/HTML5/5.0/web3d/',true);
      applet.inject(container);
    }).catch(e=>{if(!disposed)setError(e instanceof Error?e.message:'No se pudo abrir GeoGebra.');});};target.replaceChildren(frame);
    window.addEventListener('beforeunload',beforeLeave);
    return()=>{disposed=true;clearTimeout(timeout);if(saveTimer.current)clearTimeout(saveTimer.current);observer?.disconnect();window.removeEventListener('beforeunload',beforeLeave);if(instance){instance.unregisterAddListener(changed);instance.unregisterUpdateListener(changed);instance.unregisterRemoveListener(changed);instance.unregisterClearListener(changed);instance.unregisterClientListener(changed);instance.remove();}frame.remove();api.current=null;};
  },[retry,workspaceKey]);
  const updateProgress=(next:GeoProgress)=>{setProgress(next);if(!lesson||progressBlocked.current)return;try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setSaveMessage('No se pudo guardar el avance de la guía. Conserva una copia del trabajo.');}};
  const check=()=>{
    if(!lesson||!step||!api.current||checking.current)return;
    try{
      const correct=verifyGeoStep(api.current,step.check);
      setPassed(correct);setFeedbackKind(correct?'info':'error');
      if(!correct){setFeedback('Todavía no coincide. Revisa la consigna y los comandos de ayuda. Tu trabajo se conserva.');return;}
      const next={...progress,completed:[...new Set([...progress.completed,progress.step])]};
      updateProgress(next);setFeedback(step.success);setConfirmation(true);checking.current=true;
      advanceTimer.current=setTimeout(()=>{
        setConfirmation(false);checking.current=false;
        if(progress.step<lesson.steps.length-1){updateProgress({...next,notes:progressRef.current.notes,step:progress.step+1});setFeedback('');setPassed(false);guideBody.current?.scrollTo({top:0});guideBody.current?.closest('.floating-window-body')?.scrollTo({top:0});}
        else setFeedback('Práctica completada. Puedes seguir explorando o volver al cuaderno.');
      },700);
    }catch{setPassed(false);setFeedbackKind('error');setFeedback('No se pudo comprobar este resultado. Revisa que los objetos estén definidos y vuelve a intentarlo.');}
  };
  const move=(index:number)=>{if(advanceTimer.current)clearTimeout(advanceTimer.current);checking.current=false;setConfirmation(false);updateProgress({...progress,step:index});setFeedback('');setPassed(false);guideBody.current?.scrollTo({top:0});guideBody.current?.closest('.floating-window-body')?.scrollTo({top:0});};
  const prepareCommand=(text:string)=>{foldKeyboard();setCommandOpen(true);setCommand(text);setGuide(false);externalLesson?.onClose();requestAnimationFrame(()=>commandInput.current?.focus());};
  const download=()=>{if(!api.current)return;api.current.getBase64(value=>{const bytes=Uint8Array.from(atob(value),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.geogebra.file'}));const a=document.createElement('a');a.href=url;a.download=`modo-${lesson?.id||'geogebra-libre'}.ggb`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});};
  const editCommand=(text:string,start:number,end:number,back=0)=>{const next=command.slice(0,start)+text+command.slice(end);if(next.length>2000)return;commandCaret.current=start+text.length-back;setCommand(next);setFeedback('');};
  const insertCommandText=(text:string,back=0)=>{const input=commandInput.current;editCommand(text,input?.selectionStart??command.length,input?.selectionEnd??command.length,back);};
  const deleteCommandCharacter=()=>{const input=commandInput.current,start=input?.selectionStart??command.length,end=input?.selectionEnd??command.length;editCommand('',start===end?Math.max(0,start-1):start,end);};
  const enterCommand=()=>{
    const engine=api.current;if(!engine||!command.trim())return;
    try{
      let success=false;
      if(view==='C'){
        let row=1;while(engine.exists(`$${row}`))row++;
        engine.evalCommand(`$${row}=${command}`);success=engine.exists(`$${row}`);
        setFeedback(success?`Cálculo enviado a la fila ${row} de CAS.`:'Revisa la sintaxis del cálculo en CAS.');
      }else{success=executeGeoCommand(engine,command);setFeedback(success?'Comando enviado a GeoGebra. Puedes editar el resultado en la herramienta.':'Revisa el resultado en GeoGebra. Si no cambió, comprueba la sintaxis del comando.');}
      setPassed(false);setFeedbackKind(success?'info':'error');if(success){setCommand('');forceSave.current();}
    }catch{setFeedbackKind('error');setFeedback('No se pudo ejecutar el comando. Revisa la sintaxis y vuelve a intentarlo.');}
  };
  const leave=(event:React.MouseEvent<HTMLAnchorElement>,href:string)=>{if(!ready)return;event.preventDefault();forceSave.current(()=>{dirty.current=false;location.assign(href);});};
  const guideContent=lesson&&step?<aside className="geo-guide" aria-label="Lección de GeoGebra">
        <div ref={guideBody} className="geo-guide-body">
          <div className="geo-guide-top"><a href={studyLessonUrl(lesson,0)} onClick={e=>leave(e,studyLessonUrl(lesson,0))}><ArrowLeft size={16}/>Volver al cuaderno</a><button aria-label="Cerrar guía" onClick={()=>externalLesson?externalLesson.onClose():setGuide(false)}>Cerrar ×</button></div>
          <p className="geo-eyebrow">PASO {progress.step+1} DE {lesson.steps.length} · {progress.completed.length} COMPROBADOS</p>
          <h2 tabIndex={-1}>{step.title}</h2><p>{step.text}</p>
          {lesson.unit===4&&matrixNotebooks[lesson.id]&&<details><summary>Preguntas para analizar el problema</summary><p>{matrixNotebooks[lesson.id].problem}</p><ol>{matrixNotebooks[lesson.id].questions.map(question=><li key={question.prompt}>{question.prompt}</li>)}</ol><p>Responde en «Mis observaciones» qué calculaste, qué significa y cómo lo comprobaste. El cuaderno conserva también tus respuestas por pregunta.</p></details>}
          <button className="geo-go-work" onClick={()=>externalLesson?externalLesson.onClose():setGuide(false)}>Trabajar en GeoGebra <ArrowRight size={17}/></button>
          <details><summary>Ver comandos de ayuda <ChevronDown size={14}/></summary><div className="geo-command-examples">{step.commands.map(text=><button key={text} disabled={!ready} onClick={()=>prepareCommand(text)} aria-label={`Preparar comando ${text}`}><code>{text}</code><span>Usar en la entrada <ArrowRight size={14}/></span></button>)}</div><small>Preparar un comando lo lleva a la entrada para que lo revises y ejecutes. No completa la actividad automáticamente.</small></details>
          {lesson.source?<a href={lesson.source.startsWith('https:')?lesson.source:`${lesson.source}#page=${step.page}`}  target="_blank" rel="noreferrer">{lesson.source.startsWith('https:')?'Actividad original':`Guía original · página ${step.page}`} <ExternalLink size={13}/></a>:<small>Práctica complementaria de matrices · modo.</small>}
          {feedback&&<p className={`geo-feedback ${passed?'is-correct':''}`} data-result={passed?'correct':feedbackKind} role="status">{feedback}</p>}
          {completed&&<a className="geo-primary" href={studyLessonUrl(lesson,2)} onClick={e=>leave(e,studyLessonUrl(lesson,2))}>Práctica completada · volver a Estudio <ArrowRight size={17}/></a>}
          <label className="geo-notes">Mis observaciones<textarea aria-label="Mis observaciones" value={progress.notes} maxLength={20000} onChange={e=>updateProgress({...progress,notes:e.target.value})} placeholder="Qué observaste, qué cambió y por qué…"/></label>
          <a href="/laboratorio?tool=geogebra" onClick={e=>leave(e,'/laboratorio?tool=geogebra')}>Abrir mi archivo libre ↗</a>
        </div>
        <div className="geo-guide-actions"><button className="geo-primary" disabled={!ready||confirmation} onClick={check}>Comprobar mi trabajo <Check size={16}/></button><div className="geo-step-actions"><button disabled={confirmation||progress.step===0} onClick={()=>move(progress.step-1)} aria-label="Paso anterior"><ArrowLeft size={17}/></button><span>{progress.step+1} / {lesson.steps.length}</span><button disabled={confirmation||progress.step===lesson.steps.length-1||!progress.completed.includes(progress.step)} onClick={()=>move(progress.step+1)} aria-label="Paso siguiente"><ArrowRight size={17}/></button></div></div>
      </aside>:null;
  const guideShown=externalLesson?.open??guide;
  return <section className={`geo-workbench${lesson?' is-lesson':''}`} aria-label="GeoGebra" data-geogebra-ready={ready} data-view={view} data-calculator-open={keyboardOpen} data-cas={view==='C'}>
    <div className="geo-toolbar">
      <div className="geo-heading"><strong title={lesson?.title}>{lesson?.title||'GeoGebra'}</strong><span>{lesson?`Actividad ${progress.step+1} de ${lesson.steps.length}`:'Funciones y matrices · espacio libre'}</span></div>
      <div className="geo-toolbar-actions">
      <button className="geo-calculator-toggle" title="Teclado para escribir comandos sin cambiar la vista" aria-label={keyboardOpen?'Replegar teclado':'Mostrar teclado'} aria-expanded={keyboardOpen} disabled={!ready} onClick={toggleKeyboard}><Keyboard size={17}/><span>Teclado</span><ChevronDown size={15}/></button>

        <button aria-label="Ampliar gráfica" title="Ampliar gráfica" onClick={()=>setExpanded(true)}><Maximize2 size={17}/></button>
        <button className="geo-lessons-trigger" aria-expanded={lessonsOpen} onClick={()=>setLessonsOpen(true)}><BookOpen size={17}/>Lecciones</button>

        <button aria-label="Archivos de GeoGebra" aria-expanded={filesOpen} onClick={()=>setFilesOpen(true)}><FileText size={17}/><span>Archivo</span></button>
      </div>
    </div>
    <div className="geo-viewbar">
      <label>Vista<select aria-label="Vista de GeoGebra" value={view} disabled={!ready} onChange={e=>setView(e.target.value)}><option value="G">Gráfica y comandos</option><option value="AG">Álgebra + gráfica</option><option value="A">Matrices y resultados</option><option value="C">CAS</option></select></label>

      {lesson&&<div className="geo-mobile-tabs" role="group" aria-label="Trabajo y lección"><button aria-pressed={!guide} onClick={()=>setGuide(false)}>Trabajo</button><button aria-pressed={guide} onClick={()=>setGuide(true)}>Lección {progress.step+1}/{lesson.steps.length}</button></div>}
    </div>
    <div className={`geo-layout ${lesson&&guide?'has-guide':''}`}>
      {expanded&&<button className="geo-focus-exit" onClick={()=>setExpanded(false)}><Minimize2 size={16}/>Volver a controles</button>}
      <button className="lab-card-toggle geo-results-tab" aria-label="Ver resultados" aria-expanded={resultsOpen} onClick={()=>setResultsOpen(!resultsOpen)} disabled={!ready}><ListChecks size={16}/>Resultados <ChevronDown size={15}/></button>

      <section className="lab-float geo-command-panel"><button className="lab-card-toggle" aria-expanded={commandOpen} onClick={()=>{setCommandOpen(!commandOpen);setKeyboardOpen(false);}}><Terminal size={16}/>Comandos <ChevronDown size={15}/></button>{commandOpen&&<form className="geo-command" onSubmit={e=>{e.preventDefault();enterCommand();commandInput.current?.blur();}}><label htmlFor={`${id}-command`}>Comando de GeoGebra</label><input ref={commandInput} id={`${id}-command`} disabled={!ready} value={command} maxLength={2000} inputMode={keyboardOpen?"none":"text"} onChange={e=>{setCommand(e.target.value);setFeedback('');}} onFocus={()=>{setGuide(false);}} placeholder={view==='C'?'Ej.: Factor(x^2-1)':lesson?.unit===4?'Ej.: A={{1,2},{3,4}}':'Ej.: f(x)=2x-3'} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send"/><button disabled={!ready||!command.trim()} type="submit">Ejecutar <ArrowRight size={16}/></button></form>}{commandOpen&&keyboardOpen&&feedback&&<p className="geo-feedback geo-command-feedback" data-result={feedbackKind} role="status">{feedback}</p>}{commandOpen&&keyboardOpen&&<GeoCommandKeyboard inputId={`${id}-command`} insert={insertCommandText} backspace={deleteCommandCharacter} execute={enterCommand} canExecute={ready&&!!command.trim()}/>}</section>
      {lesson&&step&&<section className="lab-float geo-panel-rail"><button className="lab-card-toggle" aria-label={externalLesson?(guideShown?'Replegar lección':'Mostrar lección'):(guide?'Replegar guía':'Mostrar guía')} aria-expanded={guideShown} onClick={()=>externalLesson?(guideShown?externalLesson.onClose():externalLesson.onOpen()):setGuide(!guide)}><BookOpen size={16}/>Guía · {progress.step+1}/{lesson.steps.length}<ChevronDown size={15}/></button>
      {!externalLesson&&guide&&guideContent}</section>}
      <div className="geo-surface"><div id={id} ref={host} className="geo-applet" aria-label="Área de trabajo de GeoGebra"/>
        {!ready&&<div className="geo-loading" role="status">{error?<><strong>No pudimos abrir GeoGebra</strong><p>{error}</p><button onClick={()=>{api.current=null;setRetry(n=>n+1);}}>Reintentar</button><a href="/sin-conexion/">Comprobar copia sin conexión</a></>:<><strong>Abriendo GeoGebra Classic…</strong><span>Cargando el motor local, sin necesitar internet.</span></>}</div>}
      </div>
    {!keyboardOpen&&(!lesson||!guide)&&feedback&&<p className={`geo-feedback geo-work-feedback ${passed?'is-correct':''}`} data-result={passed?'correct':feedbackKind} role="status">{feedback}</p>}
      {confirmation&&<div className="geo-confirmation" role="status" aria-live="polite" data-geo-confirmation><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34"/><path d="m24 40 11 11 22-24" pathLength="1"/></svg><strong>¡Correcto!</strong><span>{progress.step<lesson!.steps.length-1?'Siguiente actividad…':'Práctica completada'}</span></div>}
    </div>
    {lesson&&step&&!completed&&<div className="geo-taskbar"><button className="geo-task-title" onClick={()=>externalLesson?externalLesson.onOpen():setGuide(true)}><BookOpen size={16}/><span>{progress.step+1}. {step.title}</span></button><button disabled={!ready||confirmation} onClick={check} aria-label="Comprobar actividad"><Check size={18}/><span>Comprobar</span></button>{progress.completed.includes(progress.step)&&progress.step<lesson.steps.length-1&&<button onClick={()=>move(progress.step+1)} aria-label="Actividad siguiente"><ArrowRight size={18}/></button>}</div>}
    {completed&&<a className="geo-completed-link" href={studyLessonUrl(lesson!,2)} onClick={e=>leave(e,studyLessonUrl(lesson!,2))}>Práctica completada · volver al cuaderno <ArrowRight size={16}/></a>}


    <div className="geo-footer"><span role="status">{saveMessage||'Archivo y avance guardados por separado en este navegador.'}</span><a href="https://www.geogebra.org/" target="_blank" rel="noreferrer">GeoGebra® <ExternalLink size={12}/></a></div>
    {externalLesson?.render(guideContent,progress,confirmation)}
    {resultsOpen&&<FloatingWindow className="geo-files-window" title="Objetos y resultados" width={400} side="right" closeLabel="Cerrar resultados" onClose={()=>setResultsOpen(false)}><div className="geo-results-list">{api.current?.getAllObjectNames().filter(name=>!name.startsWith('modoCheck')).map(name=><p key={name}><code>{api.current?.getValueString(name)}</code></p>)}{!api.current?.getAllObjectNames().length&&<p>Escribe un comando debajo de la gráfica para crear tu primer objeto.</p>}<button onClick={()=>setResultsOpen(false)}>Volver a la gráfica</button></div></FloatingWindow>}
    {filesOpen&&<FloatingWindow className="geo-files-window" title="Archivo de GeoGebra" width={360} side="right" closeLabel="Cerrar archivos" onClose={()=>setFilesOpen(false)}><div className="geo-file-actions">
      <button disabled={!ready} onClick={()=>forceSave.current()} aria-label="Guardar GeoGebra"><Save size={18}/>Guardar en este navegador</button><button disabled={!ready} onClick={download} aria-label="Descargar archivo GeoGebra"><Download size={18}/>Descargar .ggb</button>
      <label className="geo-import"><FolderOpen size={18}/>Abrir archivo .ggb<input aria-label="Abrir archivo GeoGebra" type="file" accept=".ggb" disabled={!ready} onChange={async event=>{const file=event.target.files?.[0];event.target.value='';if(!file||!api.current)return;if(file.size>3000000){setFeedback('El archivo supera los 3 MB. Ábrelo desde el menú de GeoGebra.');return;}if(api.current.getAllObjectNames().length&&!confirm('Abrir este archivo sustituirá el trabajo visible. Descarga una copia antes si deseas conservarlo.'))return;const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);api.current.setBase64(btoa(binary),()=>{api.current?.setPerspective(view);api.current?.showToolBar(view!=='A');forceSave.current();setFilesOpen(false);});}}/></label><p role="status">{saveMessage||'El archivo libre y cada lección se guardan por separado.'}</p></div></FloatingWindow>}
    {lessonsOpen&&<FloatingWindow className="geo-lessons-window" title="Lecciones y ejercicios" eyebrow="FUNCIONES Y MATRICES" width={420} side="right" closeLabel="Cerrar lecciones" onClose={()=>setLessonsOpen(false)}><div className="geo-lesson-catalog"><label className="geo-unit-picker">Unidad<select aria-label="Unidad de las lecciones" value={unit} onChange={event=>setUnit(Number(event.target.value))}>{mathUnits.map(item=><option key={item.id} value={item.number}>{item.title}</option>)}</select></label><section aria-live="polite"><h2>{mathUnits.find(item=>item.number===unit)?.title}</h2>{geoLessons.filter(l=>l.unit===unit).map(l=><a key={l.id} aria-current={l.id===lesson?.id?'page':undefined} href={laboratoryLessonUrl(l)} onClick={e=>leave(e,laboratoryLessonUrl(l))}><div><strong>{l.title}</strong><span>{l.steps.length} actividades · explicación y comprobación</span></div><ArrowRight size={17}/></a>)}{!geoLessons.some(l=>l.unit===unit)&&<p className="geo-unit-empty">Todavía no hay lecciones de GeoGebra para esta unidad.</p>}</section><a className="geo-unit-study" href={`/estudio?curso=s2-5&unidad=${mathUnits.find(item=>item.number===unit)?.id}`} onClick={event=>leave(event,`/estudio?curso=s2-5&unidad=${mathUnits.find(item=>item.number===unit)?.id}`)}>Ver esta unidad en Estudio <ArrowRight size={16}/></a><p>Tu espacio libre y cada lección conservan sus archivos y avances por separado.</p></div></FloatingWindow>}
  </section>;
}
