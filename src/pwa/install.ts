/* Instalación como app. Chrome/Edge (PC y Android) avisan con beforeinstallprompt; Safari no tiene ese
   aviso, así que en iPhone/iPad solo se pueden dar instrucciones. El evento puede llegar antes de que el
   inicio se monte, por eso se captura aquí, a nivel de módulo. */
export type Platform = 'ios' | 'android' | 'desktop';
type InstallEvent = Event & {prompt: () => Promise<void>; userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>};

const DISMISS_KEY = 'modo-instalar-v1';
const DISMISS_DAYS = 14;
const subs = new Set<() => void>();
let deferred: InstallEvent | null = typeof window === 'undefined' ? null : ((window as unknown as {__modoInstall?: InstallEvent}).__modoInstall ?? null);
let version = 0;
let installed = false;

const emit = () => {version++; subs.forEach(fn => fn());};

export const detectPlatform = (): Platform => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
};

export const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & {standalone?: boolean};
  return installed || nav.standalone === true || matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches;
};

export const canPrompt = () => deferred !== null;

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferred;
  if (!event) return 'unavailable';
  deferred = null;
  emit();
  try {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') installed = true;
    emit();
    return choice.outcome;
  } catch {
    emit();
    return 'dismissed';
  }
}

export const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {return false;}
};
export const rememberDismissal = () => {try {localStorage.setItem(DISMISS_KEY, String(Date.now()));} catch {/* sin almacenamiento */}};

export const subscribe = (fn: () => void) => {subs.add(fn); return () => {subs.delete(fn);};};
export const getVersion = () => version;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {event.preventDefault(); deferred = event as InstallEvent; emit();});
  window.addEventListener('appinstalled', () => {installed = true; deferred = null; emit();});
}
