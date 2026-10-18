/* Indicador activo deslizante para grupos de pestañas, vistas y selectores.
   No inserta nodos en el árbol de React: dibuja el indicador con ::before del grupo (modo-motion.css)
   a partir de variables --seg-* medidas aquí. El aspecto se toma del elemento activo original,
   así cada grupo conserva su diseño aprobado. Varios activos a la vez (p. ej. Banco + diagrama
   en «Comparar») se cubren con un único indicador que abarca ambos. */
const GROUPS=[
 '.workspace-views','.compact-views','.mobile-work-tabs',
 '.diagram-tabs','.cade-scope>[role=group]','.reader-mode',
 '.filters-scroll','.menu-modes',
 '.lab-tool-nav','.study-section-tabs',
].join(',');
const ACTIVE='[aria-pressed=true],[aria-selected=true],[aria-checked=true],[aria-current=page],[aria-current=true],.current';
const ITEM='button,a,[role=tab],[role=radio]';

type Entry={observer:MutationObserver;resize:ResizeObserver;frame:number};
const groups=new Map<HTMLElement,Entry>();

const items=(group:HTMLElement)=>Array.from(group.children).filter((el):el is HTMLElement=>el instanceof HTMLElement&&el.matches(ITEM));

/** Copia el aspecto del activo antes de que la clase motion-seg-item lo vuelva transparente. */
function adoptLook(group:HTMLElement,active:HTMLElement){
 const s=getComputedStyle(active);
 const bg=s.backgroundColor;
 if(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')group.style.setProperty('--seg-bg',bg);
 group.style.setProperty('--seg-r',s.borderRadius||'9px');
 const border=parseFloat(s.borderTopWidth)>0&&s.borderTopStyle!=='none'?`inset 0 0 0 ${s.borderTopWidth} ${s.borderTopColor}`:'';
 const shadow=s.boxShadow&&s.boxShadow!=='none'?s.boxShadow:'';
 group.style.setProperty('--seg-shadow',[shadow,border].filter(Boolean).join(',')||'none');
 group.dataset.segLook='1';
}

function measure(group:HTMLElement){
 const all=items(group),active=all.filter(el=>el.matches(ACTIVE)&&el.offsetParent!==null);
 if(!all.length)return;
 if(!group.dataset.segLook){if(!active.length)return;adoptLook(group,active[0])}
 if(!group.classList.contains('motion-seg')){group.classList.add('motion-seg','motion-seg-init');requestAnimationFrame(()=>requestAnimationFrame(()=>group.classList.remove('motion-seg-init')))}
 for(const el of all)if(!el.classList.contains('motion-seg-item'))el.classList.add('motion-seg-item');
 /* Otras hojas pueden dejar el grupo en position:static; el indicador necesita anclarse a él. */
 if(getComputedStyle(group).position==='static')group.style.position='relative';
 if(!active.length){group.style.setProperty('--seg-o','0');return}
 const box=group.getBoundingClientRect(),bl=group.clientLeft,bt=group.clientTop;
 let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 for(const el of active){const r=el.getBoundingClientRect();left=Math.min(left,r.left);top=Math.min(top,r.top);right=Math.max(right,r.right);bottom=Math.max(bottom,r.bottom)}
 /* Coordenadas relativas al contenido desplazable del grupo (pestañas con scroll horizontal). */
 group.style.setProperty('--seg-x',`${left-box.left-bl+group.scrollLeft}px`);
 group.style.setProperty('--seg-y',`${top-box.top-bt+group.scrollTop}px`);
 group.style.setProperty('--seg-w',`${right-left}px`);
 group.style.setProperty('--seg-h',`${bottom-top}px`);
 group.style.setProperty('--seg-o','1');
}

function schedule(group:HTMLElement){
 const entry=groups.get(group);if(!entry||entry.frame)return;
 entry.frame=requestAnimationFrame(()=>{entry.frame=0;if(group.isConnected)measure(group)});
}

function attach(group:HTMLElement){
 if(groups.has(group))return;
 const observer=new MutationObserver(()=>schedule(group));
 observer.observe(group,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','aria-selected','aria-checked','aria-current','class','hidden']});
 const resize=new ResizeObserver(()=>schedule(group));
 resize.observe(group);
 groups.set(group,{observer,resize,frame:0});
 measure(group);
}

function detach(group:HTMLElement){
 const entry=groups.get(group);if(!entry)return;
 entry.observer.disconnect();entry.resize.disconnect();cancelAnimationFrame(entry.frame);groups.delete(group);
}

let scanTimer=0;
function scan(){
 scanTimer=0;
 for(const group of groups.keys())if(!group.isConnected)detach(group);
 document.querySelectorAll<HTMLElement>(GROUPS).forEach(attach);
}
const requestScan=()=>{if(!scanTimer)scanTimer=window.setTimeout(scan,60)};

function start(){
 if(!('ResizeObserver' in window))return;
 scan();
 /* Los grupos aparecen y desaparecen con React: se buscan de nuevo tras cambios en el documento. */
 new MutationObserver(records=>{for(const r of records)if(r.addedNodes.length||r.removedNodes.length){requestScan();return}}).observe(document.body,{childList:true,subtree:true});
 addEventListener('resize',()=>groups.forEach((_,g)=>schedule(g)),{passive:true});
 document.fonts?.ready.then(()=>groups.forEach((_,g)=>schedule(g)));
 /* Las pestañas con desplazamiento lateral siguen al contenido. */
 document.addEventListener('scroll',e=>{const g=e.target;if(g instanceof HTMLElement&&groups.has(g))schedule(g)},{capture:true,passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
