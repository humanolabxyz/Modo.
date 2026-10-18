import {useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowRight, Play, Video, X} from 'lucide-react';
import {TUTORIALS, tutorialPoster, tutorialSource, type TutorialContext} from '../data/tutorials';
import '../styles/tutorials.css';

const WELCOME_KEY = 'modo-tutoriales-bienvenida-v1';
let welcomedThisPage = false;

function TutorialDialog({initialIndex, onClose}: {initialIndex: number; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const titleId = useId();
  const [index, setIndex] = useState(initialIndex);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const tutorial = TUTORIALS[index];

  useEffect(() => {
    const media = video.current;
    return () => {media?.pause();};
  }, [index, attempt]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const overflow = document.body.style.overflow;
    // El diálogo nativo contiene el foco y deja inerte el banco que está detrás.
    element.showModal();
    document.body.style.overflow = 'hidden';
    const stopShortcuts = (event: KeyboardEvent) => {
      // Mantener también el ciclo de Tab dentro de la ayuda, incluidos sus extremos.
      if (event.key === 'Tab') {
        const controls = Array.from(element.querySelectorAll<HTMLElement>('button,a[href],video[controls],[tabindex="0"]')).filter(control => control.getClientRects().length > 0 && !control.hasAttribute('disabled'));
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last?.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first?.focus();}
      }
      event.stopPropagation();
    };
    element.addEventListener('keydown', stopShortcuts);
    return () => {
      element.removeEventListener('keydown', stopShortcuts);
      element.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  const select = (next: number) => {setFailed(false); setIndex(next);};
  const close = () => {dialog.current?.close(); onClose();};

  return <dialog ref={dialog} className="tutorial-dialog" aria-labelledby={titleId} onCancel={event => {event.preventDefault(); close();}}>
    <header className="tutorial-heading">
      <div><p className="tutorial-eyebrow">AYUDA DE MODO.</p><h2 id={titleId}>Aprende viendo<span>.</span></h2><p>Cuatro videos cortos para empezar a tu ritmo.</p></div>
      <button type="button" className="tutorial-close" aria-label="Cerrar tutoriales" autoFocus onClick={close}><X size={22} aria-hidden="true"/></button>
    </header>
    <div className="tutorial-layout">
      <section className="tutorial-player" aria-label="Video seleccionado">
        <video ref={video} key={`${tutorial.id}-${attempt}`} controls playsInline preload="metadata" poster={tutorialPoster(tutorial.id)} aria-label={`${tutorial.area} · Parte ${tutorial.part}: ${tutorial.title}`} onError={() => setFailed(true)}>
          <source src={tutorialSource(tutorial.id)} type="video/mp4"/>
          Tu navegador no puede reproducir este video. <a href={tutorialSource(tutorial.id)}>Abrir video</a>
        </video>
        {failed ? <div className="tutorial-error" role="alert"><p>No se pudo cargar el video. Comprueba tu conexión y vuelve a intentarlo.</p><button type="button" onClick={() => {setFailed(false); setAttempt(value => value + 1);}}>Reintentar</button><a href={tutorialSource(tutorial.id)} target="_blank" rel="noreferrer">Abrir video por separado</a></div> : null}
        <div className="tutorial-caption"><p className="tutorial-eyebrow">{tutorial.area} · PARTE {tutorial.part} · {tutorial.duration}</p><h3>{tutorial.title}</h3><p>{tutorial.description}</p><span>Con voz y subtítulos integrados · Puedes ampliar a pantalla completa.</span></div>
        <button type="button" className="tutorial-next" onClick={() => select((index + 1) % TUTORIALS.length)}>{index < TUTORIALS.length - 1 ? 'Siguiente tutorial' : 'Volver al primer tutorial'}<ArrowRight size={18} aria-hidden="true"/></button>
      </section>
      <nav className="tutorial-list" aria-label="Videos tutoriales">
        <p className="tutorial-eyebrow">ELIGE UN VIDEO</p>
        {TUTORIALS.map((item, itemIndex) => <button type="button" key={item.id} className="tutorial-item" aria-current={itemIndex === index ? 'true' : undefined} onClick={() => select(itemIndex)}>
          <span className="tutorial-thumbnail"><img src={tutorialPoster(item.id)} alt="" width="640" height="360" loading="lazy"/><span>{item.duration}</span></span>
          <span className="tutorial-item-copy"><small>{item.area} · Parte {item.part}</small><strong>{item.title}</strong>{itemIndex === index ? <span className="tutorial-selected">Seleccionado</span> : null}</span>
        </button>)}
        <p className="tutorial-list-note">Puedes cerrar esta ayuda y volver desde «Videos tutoriales».</p>
      </nav>
    </div>
  </dialog>;
}

export function TutorialHelp({context = 'home', variant = 'header'}: {context?: TutorialContext; variant?: 'header' | 'tile'}) {
  const [mounted, setMounted] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const initialIndex = context === 'laboratory' ? 2 : 0;

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => {
      if (welcomedThisPage) return;
      try {if (localStorage.getItem(WELCOME_KEY)) return;} catch {/* La ayuda funciona también sin almacenamiento. */}
      welcomedThisPage = true;
      try {localStorage.setItem(WELCOME_KEY, 'seen');} catch {/* Se recuerda durante esta página. */}
      setSuggestion(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const show = () => {welcomedThisPage = true; try {localStorage.setItem(WELCOME_KEY, 'seen');} catch {} setSuggestion(false); setOpen(true);};
  const close = () => {setOpen(false); trigger.current?.focus();};

  return <>
    <button ref={trigger} type="button" className={variant === 'tile' ? 'menu-tile tutorial-trigger' : 'tutorial-trigger'} aria-label="Videos tutoriales" aria-haspopup="dialog" onClick={show}><Video size={20} aria-hidden="true"/><span>{variant === 'tile' ? 'Tutoriales' : 'Videos tutoriales'}</span></button>
    {mounted ? createPortal(<>
      {suggestion ? <aside className="tutorial-welcome" aria-label="Ayuda para empezar">
        <button type="button" className="tutorial-dismiss" aria-label="Omitir sugerencia de tutoriales" onClick={() => setSuggestion(false)}><X size={18} aria-hidden="true"/></button>
        <span className="tutorial-welcome-icon"><Play size={22} aria-hidden="true"/></span>
        <p className="tutorial-eyebrow">TE DAMOS LA BIENVENIDA</p><h2>¿Primera vez en modo.?</h2><p>Descubre cómo conectar, simular y usar el laboratorio con cuatro videos cortos.</p>
        <div className="tutorial-welcome-actions"><button type="button" onClick={show}>Ver tutoriales <ArrowRight size={17} aria-hidden="true"/></button><button type="button" onClick={() => setSuggestion(false)}>Ahora no</button></div>
      </aside> : null}
      {open ? <TutorialDialog initialIndex={initialIndex} onClose={close}/> : null}
    </>, document.body) : null}
  </>;
}
