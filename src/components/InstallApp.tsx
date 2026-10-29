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
      <li><span>Toca <strong>Añadir</strong>. Abre modo. desde su ícono nuevo: se ve a pantalla completa, sin la barra de Safari.</span></li>
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
        <li><span>Confirma con <strong>Instalar</strong>. modo. se abre en su propia ventana y queda en el menú de inicio.</span></li>
      </Steps>
      <p className="install-note">En Safari de Mac: menú Archivo → Añadir al Dock. Firefox no permite instalar.</p>
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
      <div>
        <p className="install-eyebrow">INSTALAR MODO.</p>
        <h2 id={titleId}>Llévate modo. contigo<span>.</span></h2>
        <p>Se abre como una app, sin la barra del navegador. Para llevar todos los simuladores y materiales sin internet, completa «Preparar viaje» en Inicio.</p>
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
  const standalone = mounted && isStandalone();
  const canInstall = mounted && canPrompt();
  const platform = mounted ? detectPlatform() : 'desktop';

  useEffect(() => setMounted(true), []);

  // El aviso espera unos segundos y no tapa la bienvenida de los tutoriales.
  useEffect(() => {
    if (!mounted || isStandalone() || dismissedRecently()) return;
    const timer = window.setInterval(() => {
      if (isStandalone()) {setBanner(false); return;}
      if (document.querySelector('.tutorial-welcome') || document.querySelector('dialog[open]')) return;
      if (canPrompt() || detectPlatform() === 'ios') setBanner(true);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [mounted]);

  const dismiss = () => {rememberDismissal(); setBanner(false);};
  const install = async () => {
    const outcome = await promptInstall();
    if (outcome === 'unavailable') setOpen(true);
    else setBanner(false);
  };

  if (!mounted || standalone) return null;
  return <>
    <button type="button" className="install-link" onClick={() => setOpen(true)}><Download size={15} aria-hidden="true"/> Instalar como app</button>
    {banner && !open && <aside className="install-banner" role="region" aria-label="Instalar modo.">
      <button type="button" className="install-banner-x" aria-label="Cerrar aviso" onClick={dismiss}><X size={18} aria-hidden="true"/></button>
      <span className="install-banner-icon"><Download size={22} aria-hidden="true"/></span>
      <div>
        <h2>{platform === 'ios' ? 'Instala modo. en tu iPhone' : '¿Instalar modo. en este equipo?'}</h2>
        <p>{platform === 'ios' ? 'Añádela a tu pantalla de inicio para abrirla a pantalla completa.' : 'Se abre como una app, sin la barra del navegador, y funciona sin conexión.'}</p>
        <div className="install-banner-actions">
          {canInstall ? <button type="button" className="install-primary" onClick={install}>Instalar</button> : <button type="button" className="install-primary" onClick={() => setOpen(true)}>Ver cómo</button>}
          {canInstall && <button type="button" className="install-secondary" onClick={() => setOpen(true)}>Cómo instalar</button>}
          <button type="button" className="install-secondary" onClick={dismiss}>Ahora no</button>
        </div>
      </div>
    </aside>}
    {open && <InstallDialog canInstall={canInstall} onInstall={async () => {await promptInstall(); setOpen(false);}} onClose={() => {setOpen(false); setBanner(false); rememberDismissal();}}/>}
  </>;
}
