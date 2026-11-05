import {useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';
import {Check, Download, EllipsisVertical, Share, SquarePlus, X} from 'lucide-react';
import {canPrompt, detectPlatform, dismissedRecently, getVersion, isStandalone, promptInstall, rememberDismissal, subscribe, type Platform} from '../pwa/install';
import '../styles/install.css';

const TABS: {id: Platform; label: string}[] = [
  {id: 'ios', label: 'iPhone y iPad'},
  {id: 'android', label: 'Android'},
  {id: 'desktop', label: 'Computador'}
];

const Steps = ({children}: {children: ReactNode}) => <ol className="install-steps">{children}</ol>;

function Instructions({platform, canInstall, onInstall}: {platform: Platform; canInstall: boolean; onInstall: () => void}) {
  const direct = canInstall && platform === detectPlatform();
  return <>
    {platform === 'ios' && <Steps>
      <li><span>Abre <strong>modo-lab.vercel.app</strong> en <strong>Safari</strong>. Si llegaste desde WhatsApp o Instagram, toca el ícono de la brújula (o «Abrir en Safari») para salir de ese visor.</span></li>
      <li><span>Toca <strong>Compartir</strong> <Share size={16} aria-hidden="true"/> (el cuadro con la flecha hacia arriba, en la barra de abajo; en iPad, arriba a la derecha).</span></li>
      <li><span>Desliza el menú y elige <strong>Añadir a pantalla de inicio</strong> <SquarePlus size={16} aria-hidden="true"/>.</span></li>
      <li><span>Activa <strong>Abrir como app web</strong> si aparece esa opción y toca <strong>Añadir</strong>. Luego abre modo. desde su nuevo ícono.</span></li>
    </Steps>}
    {platform === 'android' && <>
      {direct && <button type="button" className="install-primary" onClick={onInstall}><Download size={18} aria-hidden="true"/> Instalar ahora</button>}
      <Steps>
        <li><span>Abre <strong>modo-lab.vercel.app</strong> en <strong>Chrome</strong>.</span></li>
        <li><span>Toca el menú <EllipsisVertical size={16} aria-hidden="true"/> (los tres puntos, arriba a la derecha).</span></li>
        <li><span>Elige <strong>Instalar app</strong> (en algunos teléfonos dice <strong>Añadir a la pantalla de inicio</strong>).</span></li>
        <li><span>Confirma con <strong>Instalar</strong>. Aparecerá en tu pantalla de inicio y en el cajón de aplicaciones.</span></li>
      </Steps>
    </>}
    {platform === 'desktop' && <>
      {direct && <button type="button" className="install-primary" onClick={onInstall}><Download size={18} aria-hidden="true"/> Instalar ahora</button>}
      <Steps>
        <li><span>Abre <strong>modo-lab.vercel.app</strong> en <strong>Chrome</strong> o <strong>Edge</strong>.</span></li>
        <li><span>Pulsa el ícono de instalar <Download size={16} aria-hidden="true"/> al final de la barra de direcciones. Si no aparece, abre el menú <EllipsisVertical size={16} aria-hidden="true"/> y busca <strong>Instalar modo.</strong> (en Edge: Aplicaciones → Instalar este sitio como aplicación).</span></li>
        <li><span>Confirma con <strong>Instalar</strong>. modo. se abre en su propia ventana y queda disponible desde el lanzador de aplicaciones.</span></li>
      </Steps>
      <p className="install-note">En Safari con macOS Sonoma 14 o posterior, usa Archivo → Añadir al Dock. Si tu Mac usa un sistema anterior, revisa la opción de instalación en Chrome o Edge.</p>
    </>}
  </>;
}

function InstallDialog({onClose, canInstall, onInstall}: {onClose: () => void; canInstall: boolean; onInstall: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [platform, setPlatform] = useState<Platform>(detectPlatform());

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    const keys = (event: KeyboardEvent) => event.stopPropagation();
    element.addEventListener('keydown', keys);
    return () => {element.removeEventListener('keydown', keys); element.close(); document.body.style.overflow = overflow;};
  }, []);

  const close = () => {dialog.current?.close(); onClose();};
  return <dialog ref={dialog} className="install-dialog" aria-labelledby={titleId} onCancel={event => {event.preventDefault(); close();}}>
    <header className="install-heading">
      <span className="install-banner-icon"><Download size={22} aria-hidden="true"/></span>
      <div>
        <p className="install-eyebrow">INSTALAR MODO.</p>
        <h2 id={titleId}>Instala modo. en este dispositivo<span>.</span></h2>
        <p>Abre modo. desde su propio ícono. Para usar los simuladores y materiales sin internet, abre «Preparar viaje» desde Inicio y guarda el contenido en este dispositivo.</p>
      </div>
      <button type="button" className="install-close" aria-label="Cerrar instrucciones" autoFocus onClick={close}><X size={22} aria-hidden="true"/></button>
    </header>
    {isStandalone() && <p className="install-done"><Check size={18} aria-hidden="true"/> Ya estás usando modo. como app instalada.</p>}
    <div className="install-tabs" role="tablist" aria-label="Dispositivo">
      {TABS.map(tab => <button key={tab.id} type="button" role="tab" aria-selected={platform === tab.id} className="install-tab" onClick={() => setPlatform(tab.id)}>{tab.label}</button>)}
    </div>
    <div role="tabpanel" className="install-panel"><Instructions platform={platform} canInstall={canInstall} onInstall={onInstall}/></div>
    {platform === 'ios' && <p className="install-note">¿Ya la habías añadido desde la dirección anterior (panellab-inacap)? Esa dirección ya no existe: borra ese ícono y añade modo. de nuevo con estos pasos.</p>}
  </dialog>;
}

/** Botón «Instalar como app» + aviso de instalación + instrucciones por dispositivo. */
export function InstallApp() {
  useSyncExternalStore(subscribe, getVersion, () => 0);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const standalone = mounted && isStandalone();
  const canInstall = mounted && canPrompt();
  const platform = mounted ? detectPlatform() : 'desktop';

  useEffect(() => setMounted(true), []);

  // El aviso espera unos segundos y no tapa la bienvenida de los tutoriales.
  useEffect(() => {
    if (!mounted || standalone || open || banner || dismissed || dismissedRecently()) return;
    if (!canInstall && platform !== 'ios') return;

    let retries = 4;
    let timer = window.setTimeout(showWhenAvailable, 2500);
    function showWhenAvailable() {
      if (dismissedRecently() || isStandalone()) return;
      if (document.hidden || document.querySelector('.tutorial-welcome, dialog[open]')) {
        if (retries-- > 0) timer = window.setTimeout(showWhenAvailable, 2500);
        return;
      }
      setBanner(true);
    }
    return () => window.clearTimeout(timer);
  }, [mounted, standalone, open, banner, dismissed, canInstall, platform]);

  const dismiss = () => {rememberDismissal(); setDismissed(true); setBanner(false);};
  const install = async () => {
    const outcome = await promptInstall();
    if (outcome === 'unavailable') setOpen(true);
    else if (outcome === 'dismissed') dismiss();
  };

  if (!mounted || standalone) return null;
  return <>
    <button type="button" className="install-link" onClick={() => setOpen(true)}><Download size={15} aria-hidden="true"/> Instalar como app</button>
    {banner && !open && <aside className="install-banner" role="region" aria-label="Instalar modo.">
      <button type="button" className="install-banner-x" aria-label="Cerrar aviso" onClick={dismiss}><X size={18} aria-hidden="true"/></button>
      <span className="install-banner-icon"><Download size={22} aria-hidden="true"/></span>
      <div>
        <h2>{platform === 'ios' ? 'modo. en tu pantalla de inicio' : 'Abre modo. como app'}</h2>
        <p>{platform === 'ios' ? 'Añade el ícono para abrir modo. directamente desde tu iPhone o iPad.' : 'Instálala para abrirla desde el lanzador de aplicaciones.'}</p>
        <div className="install-banner-actions">
          {canInstall ? <button type="button" className="install-primary" onClick={install}>Instalar</button> : <button type="button" className="install-primary" onClick={() => setOpen(true)}>Ver pasos</button>}
          {canInstall && <button type="button" className="install-secondary" onClick={() => setOpen(true)}>Ver pasos</button>}
          <button type="button" className="install-secondary" onClick={dismiss}>Ahora no</button>
        </div>
      </div>
    </aside>}
    {open && <InstallDialog canInstall={canInstall} onInstall={async () => {await promptInstall(); setOpen(false);}} onClose={() => {setOpen(false); dismiss();}}/>}
  </>;
}
