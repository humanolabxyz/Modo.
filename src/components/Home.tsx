import {useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent} from 'react';
import {ArrowRight, Bot, BookOpen, ChevronDown, Factory, FlaskConical, FolderOpen, PanelTop, Pause, Play, Plug, Sprout, UsersRound} from 'lucide-react';
import {InstallApp} from './InstallApp';
import {HumanoLabBand} from './HumanoLabBand';
import type {PracticeDocument} from '../data/practice';
import {APP_VERSION, releases} from '../data/releases';
import '../styles/modo-home-approved.css';

type HomeProps = {practice: PracticeDocument; onEnterPanel: () => void; onContinue: () => void; onImport: (file: File) => void; ready: boolean};
const words = ['ESTUDIO', 'LAB', 'CONTROL', 'ROBÓTICA', 'CIRCUITOS', 'PRÁCTICA'];
const spaces = [
  {id:'panel', name:'Panel de control', Icon:Plug, href:'', color:'dark'},
  {id:'study', name:'Estudio', Icon:BookOpen, href:'/estudio/', color:'blue'},
  {id:'lab', name:'Laboratorio', Icon:FlaskConical, href:'/laboratorio/', color:'dark'},
  {id:'community', name:'Comunidad', Icon:UsersRound, href:'/comunidad/', color:'blue'},
  {id:'robotics', name:'Robótica', Icon:Bot, href:'/robotica/', color:'dark', badge:'Beta'},
  {id:'industry', name:'Industria', Icon:Factory, href:'/industria/', color:'dark', badge:'Beta'},
  {id:'agro', name:'Agro', Icon:Sprout, href:'/agro/', color:'green', badge:'Beta'},
];
const padded = (word: string) => word.padStart(word.length + Math.floor((9-word.length)/2), ' ').padEnd(9, ' ');

function Flap({letter, index, reduced}: {letter:string; index:number; reduced:boolean}) {
  const previous = useRef(letter);
  // Keep the last settled glyph on screen until both rotating halves are ready.
  // Rendering the incoming prop here causes a one-frame flash before useEffect.
  const [settled, setSettled] = useState(letter);
  const [turn, setTurn] = useState<{from:string; to:string}|null>(null);
  useEffect(() => {
    const from = previous.current;
    previous.current = letter;
    if (reduced || from === letter) {setSettled(letter);setTurn(null); return;}
    setTurn({from, to:letter});
    const timer = setTimeout(() => {setSettled(letter);setTurn(null);}, 760 + index*46);
    return () => clearTimeout(timer);
  }, [letter, index, reduced]);
  const face = (value:string, className:string) => <span className={`flap-face ${className}`}><span className="flap-glyph">{value === ' ' ? '\u00a0' : value}</span></span>;
  return <span className={`flap-cell${turn?' is-turning':''}`} style={{'--flap-delay':`${index*46}ms`} as CSSProperties}>
    {face(turn?.to ?? settled,'flap-top')}{face(turn?.from ?? settled,'flap-bottom')}
    {turn && <span className="flap-moving" key={`${turn.from}-${turn.to}`}>
      {face(turn.from,'flap-top flap-out')}{face(turn.to,'flap-bottom flap-in')}
    </span>}
  </span>;
}

function SplitFlap() {
  const [word, setWord] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    // MotionHead resolves the explicit app preference before the system default.
    const sync = () => setReduced(!document.documentElement.classList.contains('modo-motion-full') && (query.matches || document.documentElement.classList.contains('modo-reduced')));
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (paused || reduced) return;
    const advance = () => {if (!document.hidden) setWord(value => (value+1)%words.length);};
    let cycle:ReturnType<typeof setInterval>|undefined;
    const first = setTimeout(() => {advance();cycle=setInterval(advance,4200);},1800);
    return () => {clearTimeout(first);if(cycle)clearInterval(cycle);};
  }, [paused, reduced]);
  return <div className="home-clock-wrap">
    <div className="home-clock" aria-label={`modo. ${words[word]}`} role="img">
      <div className="home-clock-slots" aria-hidden="true">{[...padded(words[word])].map((letter,index) => <Flap key={index} letter={letter} index={index} reduced={reduced || paused}/>)}</div>
    </div>
    {reduced?<a className="clock-enable" href="?movimiento=completo"><Play size={11} aria-hidden="true"/>Activar animaciones</a>:<button className="clock-pause" type="button" aria-label={paused?'Reanudar título animado':'Pausar título animado'} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused?<Play size={13}/>:<Pause size={13}/>}</button>}
  </div>;
}

export function Home({practice, onEnterPanel, onContinue, onImport, ready}: HomeProps) {
  const [selected, setSelected] = useState(1);
  // En escritorio hay siete tarjetas (-3…+3): la inicial es Comunidad para que queden en orden y el conjunto centrado (en tablet/teléfono sigue Estudio).
  useLayoutEffect(()=>{if(matchMedia('(min-width:1101px)').matches)setSelected(3);},[]);
  const [drag, setDrag] = useState(0);
  const gesture = useRef<{x:number; y:number; pointer:number; horizontal:boolean; dx:number}|null>(null);
  const selectionAtPointerDown = useRef(selected);
  const suppressClick = useRef(false);
  const versionMenu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event:PointerEvent) => {if(versionMenu.current && !versionMenu.current.contains(event.target as Node)) versionMenu.current.open=false;};
    const escape = (event:KeyboardEvent) => {if(event.key==='Escape' && versionMenu.current?.open){versionMenu.current.open=false;versionMenu.current.querySelector('summary')?.focus();}};
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', escape);
    return () => {document.removeEventListener('pointerdown',closeOutside);document.removeEventListener('keydown',escape);};
  }, []);
  const hasPractice = practice.wires.length>0 || practice.steps.length>0 || !!practice.learning || !!practice.assessment;
  const select = (index:number) => setSelected((index+spaces.length)%spaces.length);
  const finishGesture = (cancelled=false) => {
    const current=gesture.current;
    if (!current) return;
    if (!cancelled && current.horizontal && Math.abs(current.dx)>40) {select(selectionAtPointerDown.current+(current.dx<0?1:-1)); suppressClick.current=true;}
    gesture.current=null; setDrag(0);
  };
  return <section className="modo-reference-home" aria-label="Inicio de modo.">
    <header className="home-hero">
      <h1 className="home-brand"><img src="/brand/modo-logo-horizontal-negro.svg" alt="modo." width="316" height="90"/></h1>
      <SplitFlap/>
      <p className="home-description">Simulaciones, diagramas, prácticas y material de clase<br className="home-desktop-break"/> para entender y aplicar la automatización en el mundo real.</p>
    </header>
    <nav className={`home-carousel${gesture.current?.horizontal?' is-dragging':''}`} aria-label="Módulos de modo." aria-roledescription="carrusel" onKeyDown={event => {
      const next=event.key==='ArrowRight'?selected+1:event.key==='ArrowLeft'?selected-1:event.key==='Home'?0:event.key==='End'?spaces.length-1:null;
      if(next===null)return;
      event.preventDefault();select(next);
      if((event.target as HTMLElement).closest('.home-module'))event.currentTarget.querySelector<HTMLElement>(`[data-module="${spaces[(next+spaces.length)%spaces.length].id}"]`)?.focus({preventScroll:true});
    }}>
      <div className="home-carousel-stage" onPointerDown={event => {
        suppressClick.current=false;
        selectionAtPointerDown.current=selected;
        if (event.button!==0) return;
        gesture.current={x:event.clientX,y:event.clientY,pointer:event.pointerId,horizontal:false,dx:0};
      }} onPointerMove={event => {
        const start=gesture.current; if(!start || event.pointerId!==start.pointer) return;
        const dx=event.clientX-start.x, dy=event.clientY-start.y;
        if (!start.horizontal && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>10) {gesture.current=null;return;}
        if (Math.abs(dx)>8 || start.horizontal) {
          if(!start.horizontal && event.pointerType==='mouse')event.currentTarget.setPointerCapture(event.pointerId);
          start.horizontal=true;start.dx=dx;suppressClick.current=true;setDrag(Math.max(-180,Math.min(180,dx)));
          if(event.pointerType==='mouse')event.preventDefault();
        }
      }} onPointerUp={() => finishGesture()} onPointerCancel={() => finishGesture(true)} onLostPointerCapture={() => finishGesture(true)} onDragStart={event=>event.preventDefault()} onClickCapture={event => {
        if (suppressClick.current) {event.preventDefault();event.stopPropagation();suppressClick.current=false;return;}
        const card=(event.target as HTMLElement).closest<HTMLElement>('[data-module]');
        const index=spaces.findIndex(space=>space.id===card?.dataset.module);
        if(event.detail>0 && index>=0 && index!==selectionAtPointerDown.current && matchMedia('(max-width:1100px)').matches){event.preventDefault();event.stopPropagation();select(index);}
      }}>
        {spaces.map(({id,name,Icon,href,color,badge},index) => {
          let offset = (index-selected+spaces.length)%spaces.length;
          if (offset>spaces.length/2) offset-=spaces.length;
          const active=index===selected;
          const style={'--offset':offset,'--distance':Math.abs(offset),'--drag':`${drag}px`,'--tilt':active?'0deg':`${-offset*4}deg`,zIndex:10-Math.abs(offset)} as CSSProperties;
          const contents=<><span className="home-module-icon"><Icon strokeWidth={1.8} aria-hidden="true"/></span><img className={`home-module-art art-${id}`} src={`/images/home-approved/${id}.${id==='agro'?'svg':'webp'}`} width="900" height="900" alt="" draggable="false" decoding="async"/><span className="home-module-bottom"><strong>{name}{badge&&<em className="home-module-badge">{badge}</em>}</strong><span className="home-module-arrow"><ArrowRight aria-hidden="true"/></span></span></>;
          const className=`home-module module-${color}${active?' is-selected':''}`;
          const common={className,style,'aria-label':`Abrir ${name}${badge?` · ${badge}`:''}`,'aria-current':active?'true' as const:undefined,'data-module':id,onFocus:(event:FocusEvent<HTMLElement>)=>{if(!gesture.current && event.currentTarget.matches(':focus-visible'))select(index);}};
          return id==='panel'?<button key={id} {...common} type="button" disabled={!ready} onClick={onEnterPanel}>{contents}</button>:<a key={id} {...common} href={href}>{contents}</a>;
        })}
      </div>
      <div className="home-carousel-dots" aria-label="Seleccionar módulo">{spaces.map((space,index) => <button key={space.id} type="button" aria-label={`Mostrar ${space.name}`} aria-pressed={selected===index} onClick={()=>select(index)}><span/></button>)}</div>
      <p className="home-carousel-hint">Desliza para explorar · toca la tarjeta central para entrar</p>
      <p className="home-sr-only" role="status" aria-live="polite">{spaces[selected].name} · {selected+1} de {spaces.length}</p>
    </nav>
    <div className={`home-practice-tools${hasPractice?' has-practice':''}`}>
      <a className="home-cabinet-link" href="/laboratorio?tool=equipment&start=taller"><PanelTop size={17} aria-hidden="true"/><span>Tableros de control · montaje y PLC</span><ArrowRight size={14} aria-hidden="true"/></a>
      {hasPractice && <button className="home-continue" type="button" disabled={!ready} onClick={onContinue}><Play size={15} aria-hidden="true"/>Continuar práctica <span>{practice.wires.length} cables · {practice.steps.length} pasos</span><ArrowRight size={16} aria-hidden="true"/></button>}
      <label className="home-import" title="Carga un archivo .json que exportaste antes con «Exportar». Para seguir donde lo dejaste usa «Continuar práctica»."><FolderOpen size={15} aria-hidden="true"/><span>Abrir práctica guardada</span><input type="file" aria-label="Abrir práctica guardada" accept="application/json,.json" disabled={!ready} onChange={event=>{if(event.target.files?.[0])onImport(event.target.files[0]);event.target.value='';}}/></label>
      <InstallApp/>
      <a className="home-import" href="/sin-conexion/">Preparar viaje · sin conexión</a>
    </div>
    <footer className="home-approved-footer">
      <p>© 2026 Félix Levancini Toledo.<span> Todos los derechos reservados.</span></p>
      <div className="home-footer-links"><a href="/legal/">Créditos y políticas</a><a href="/versiones/">Changelog</a><a href="/comunidad/">Comunidad</a></div>
      <details ref={versionMenu} className="home-version"><summary aria-label={`Historial de versiones, versión actual ${APP_VERSION}`}><i aria-hidden="true"/>v{APP_VERSION}<ChevronDown size={19} aria-hidden="true"/></summary><div className="home-version-popover"><strong>Historial de modo.</strong>{releases.slice(0,4).map(release=><a key={release.version} href={`/versiones/#v${release.version}`}><b>v{release.version}</b><span>{release.title}</span><small>{release.date}</small></a>)}<a className="home-all-releases" href="/versiones/">Ver todas las versiones<ArrowRight size={15}/></a></div></details>
    </footer>
    <HumanoLabBand/>
  </section>;
}
