export type SurfaceKind='page'|'internal'|'stage';
export type SurfaceDir='forward'|'back'|'none';
export const motionReduced=()=>{
 const root=document.documentElement;
 return !root.classList.contains('modo-motion-full')&&(root.classList.contains('modo-reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches);
};

let current:Animation[]=[];
let generation=0;

/** Alternativa real para navegadores sin View Transitions. No transforma los controles fijos. */
export function animateSurface(kind:SurfaceKind){
 if(motionReduced()||document.visibilityState!=='visible')return;
 const root=document.documentElement,token=++generation;
 current.forEach(animation=>animation.cancel());
 const selector=kind==='stage'?'.lab-editor,.study-layout':kind==='internal'?'.diagram-window:not([hidden]),.practice-workspace .inspector':'main,.lab-workspace';
 const elements=Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(element=>element.getClientRects().length>0&&typeof element.animate==='function');
 if(!elements.length){current=[];delete root.dataset.motionFallback;return}
 root.dataset.motionFallback=kind;
 current=elements.map(element=>element.animate([{opacity:.12},{opacity:1}],{duration:340,easing:'cubic-bezier(.2,0,0,1)'}));
 Promise.allSettled(current.map(animation=>animation.finished)).then(()=>{if(token===generation){current=[];delete root.dataset.motionFallback}});
}
