import {flushSync} from 'react-dom';
/* Transiciones dentro de una misma página con la View Transitions API.
   page: cambia toda la herramienta (Inicio ↔ Panel); la cabecera y la marca permanecen.
   internal: el lienzo se queda; los paneles con nombre (diagrama, inspector) se abren, cierran o reorganizan.
   stage: cambia la zona de trabajo (herramientas del laboratorio, secciones del estudio); la navegación queda quieta.
   Sin soporte o con movimiento reducido, el cambio se aplica al instante: nunca se retrasa ni se pierde estado. */
export type MotionKind='page'|'internal'|'stage';
export type MotionDir='forward'|'back'|'none';
type ViewTransitionLike={finished:Promise<void>;ready?:Promise<void>};
type StartViewTransition=(update:()=>void)=>ViewTransitionLike;

let current:ViewTransitionLike|null=null;

/* MotionHead marca html.modo-reduced según la preferencia del sistema (o la anulación ?movimiento=completo). */
const reduced=()=>document.documentElement.classList.contains('modo-reduced');

export function motion(update:()=>void,kind:MotionKind='internal',dir:MotionDir='none'){
 const doc=document as Document&{startViewTransition?:StartViewTransition};
 if(!doc.startViewTransition||reduced()||document.visibilityState!=='visible'){update();return}
 const root=document.documentElement;
 root.dataset.motion=kind;root.dataset.motionDir=dir;
 let transition:ViewTransitionLike;
 try{transition=doc.startViewTransition.call(document,()=>{flushSync(update)})}
 catch{delete root.dataset.motion;delete root.dataset.motionDir;update();return}
 current=transition;
 // A superseded animation may skip; the state update still completes.
 transition.ready?.catch(()=>{});
 transition.finished.catch(()=>{}).finally(()=>{if(current===transition){current=null;delete root.dataset.motion;delete root.dataset.motionDir}});
}

/** Dirección entre dos posiciones de una lista ordenada (pestañas, herramientas). */
export const direction=(from:number,to:number):MotionDir=>from<0||to<0||from===to?'none':to>from?'forward':'back';
