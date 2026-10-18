# Modo móvil, rendimiento y PWA — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Con el diagrama abierto en móvil, header mínimo y panel inferior arrastrable (vertical) o columna lateral (horizontal); gestos fluidos; app instalable y offline como PWA.

**Architecture:** Una capa móvil activada por la clase `.is-compact` (hook `useCompactLayout`) sobre `.app-shell`. Un `CompactBar` reemplaza los controles flotantes dispersos; un `BottomSheet` envuelve el `DiagramPane` existente sin tocarlo; `mobile.css` se carga el último. El rendimiento se arregla escribiendo el `viewBox` directo durante los gestos (sin re-render de `App`) y apagando filtros SVG mientras hay gesto. La PWA añade manifest, iconos y un service worker sellado en build desde una integración de Astro.

**Tech Stack:** Astro 5, React 19, TypeScript, lucide-react, CSS plano, Playwright (runtime de Codex ya usado por `qa/*.cjs`), `sharp` (transitivo de Astro, solo para generar iconos).

**Contexto del proyecto (leer antes de empezar):**
- Código denso en una línea por bloque; seguir ese estilo (`const a=1,b=2;` sin espacios extra) al editar `App.tsx`.
- `AGENTS.md`: **no desplegar**; conservar mouse/teclado/tacto, inspector, búsqueda y zoom; no rediseñar el simulador.
- El proyecto **no es un repositorio git**, así que no hay pasos de commit. Cada tarea termina con un *checkpoint* (check + build + verificación) y la Tarea 0 deja un respaldo.
- Playwright se importa desde `C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright` (igual que `qa/verify-diagram-layout.cjs`).
- Servidor de desarrollo de QA: `http://127.0.0.1:4323/` (variable `PANELLAB_URL`).
- Spec: `docs/superpowers/specs/2026-10-14-modo-movil-pwa-design.md`. Dos ajustes respecto al spec, decididos al leer el código: (1) el buscador vive dentro del menú `⋯` (no como lupa expandible); (2) no se añade `React.memo` a `DiagramPane`/inspector salvo que `perf-mobile` demuestre que hace falta (Tarea 7, paso 9), porque al sacar los gestos de React `App` ya no se re-renderiza por `pointermove`.

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/layout/sheet.ts` | crear | Lógica pura de snaps de la hoja (`nearestSnap`, `stepSnap`, `tapSnap`). |
| `src/hooks/useCompactLayout.ts` | crear | `{compact, portrait}` con `matchMedia`. |
| `src/components/BottomSheet.tsx` | crear | Hoja arrastrable que envuelve al diagrama. |
| `src/components/CompactBar.tsx` | crear | Barra mínima (inicio, Banco/Diagrama, simulación, cables). |
| `src/components/CablesMenu.tsx` | crear | Menú «Cables N» extraído de `App.tsx`. |
| `src/components/SearchBox.tsx` | crear | Buscador de bornes extraído de `App.tsx`. |
| `src/styles/mobile.css` | crear | Todo el CSS `.is-compact`. Se importa el último. |
| `src/components/App.tsx` | modificar | Clases, estado de la hoja, render condicional compacto. |
| `src/components/SimulationControls.tsx` | modificar | Prop `compact` (etiqueta corta «24 V»). |
| `src/hooks/useSvgNavigation.ts` | modificar | `show`/`commit`: gestos sin React. |
| `src/components/Board.tsx` | modificar | Pan por `nav.show/commit`; `setPointer` con rAF. |
| `src/pages/index.astro` | modificar | Meta PWA, preload de fuentes, registro del SW, CSS móvil. |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*` | crear | PWA. |
| `scripts/make-icons.mjs` | crear | Genera iconos con `sharp`. |
| `astro.config.mjs` | modificar | Integración que sella `sw.js` al terminar el build. |
| `vercel.json` | modificar | Cabeceras de `sw.js`, manifest e iconos. |
| `package.json` | modificar | Scripts `verify:sheet`, `verify:mobile`, `verify:pwa`, `perf:mobile`. |
| `qa/verify-sheet.mjs`, `qa/verify-mobile.cjs`, `qa/perf-mobile.cjs`, `qa/verify-pwa.cjs` | crear | Pruebas. |

---

### Task 0: Respaldo, línea base y contador de renders

**Files:**
- Create: `qa/perf-mobile.cjs`
- Modify: `src/components/App.tsx:1`, `src/components/App.tsx:25`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Respaldar `src` y `public` fuera del proyecto**

```bash
cd "C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP"
mkdir -p ../_backup-pre-movil && cp -r src public astro.config.mjs vercel.json package.json ../_backup-pre-movil/
ls ../_backup-pre-movil
```
Expected: `astro.config.mjs  package.json  public  src  vercel.json`

- [ ] **Step 2: Línea base de tipos y build**

```bash
npm run check && npm run build
```
Expected: `0 errors` y `Complete!`. Si falla ya antes de tocar nada, anotar el error y no continuar: es un bloqueo previo.

- [ ] **Step 3: Arrancar el servidor de QA en segundo plano**

```bash
npm run dev -- --port 4323
```
(ejecutar en segundo plano; esperar `Local http://127.0.0.1:4323/`). Debe quedar corriendo durante todo el plan.

- [ ] **Step 4: Añadir el contador de renders (solo DEV)**

En `src/components/App.tsx` línea 1 cambiar el import de React:

```tsx
import {useCallback,useEffect,useMemo,useRef,useState,type ReactElement} from 'react';
```

Y justo después de `const practice=usePractice(),doc=practice.document;` insertar:

```tsx
 const renderCount=useRef(0);renderCount.current++;
 useEffect(()=>{if(import.meta.env.DEV)document.documentElement.dataset.appRenders=String(renderCount.current)});
```

- [ ] **Step 5: Crear `qa/perf-mobile.cjs`**

```js
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4323/';
const MAX_RENDERS=Number(process.env.MAX_RENDERS||3);
(async()=>{
 const browser=await chromium.launch();
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const page=await ctx.newPage();
 const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(500);
 await page.evaluate(()=>{window.__long=[];window.__frames=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__long.push(e.duration))).observe({entryTypes:['longtask']});let last=performance.now();const loop=t=>{window.__frames.push(t-last);last=t;requestAnimationFrame(loop)};requestAnimationFrame(loop)});
 const renders=()=>page.evaluate(()=>Number(document.documentElement.dataset.appRenders||0));
 const box=await page.locator('.board-svg').boundingBox();
 const x=box.x+10,y=box.y+box.height-10;
 const measure=async(name,gesture)=>{
  await page.evaluate(()=>{window.__long.length=0;window.__frames.length=0});
  const before=await renders();await gesture();await page.waitForTimeout(400);
  const after=await renders(),stats=await page.evaluate(()=>{const f=[...window.__frames].sort((a,b)=>a-b);return {frames:f.length,p95:f[Math.floor(f.length*.95)]||0,max:f.at(-1)||0,longTasks:window.__long.length,longTotal:Math.round(window.__long.reduce((a,b)=>a+b,0))}});
  const result={name,appRenders:after-before,...stats};console.log(JSON.stringify(result));return result;
 };
 const pan=await measure('pan 60 moves',async()=>{await page.mouse.move(x,y);await page.mouse.down();for(let i=1;i<=60;i++)await page.mouse.move(x+i*3,y-i*2);await page.mouse.up()});
 const wheel=await measure('ctrl+wheel 30 ticks',async()=>{await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.keyboard.down('Control');for(let i=0;i<30;i++)await page.mouse.wheel(0,-40);await page.keyboard.up('Control')});
 await browser.close();
 assert.ok(pan.appRenders<=MAX_RENDERS,`pan: ${pan.appRenders} renders de App (máx. ${MAX_RENDERS})`);
 assert.ok(wheel.appRenders<=MAX_RENDERS,`wheel: ${wheel.appRenders} renders de App (máx. ${MAX_RENDERS})`);
 console.log('PASS perf-mobile');
})().catch(e=>{console.error(e);process.exit(1)});
```

- [ ] **Step 6: Añadir scripts a `package.json`**

Dentro de `"scripts"`, tras `"verify:cable-color"`:

```json
    "verify:sheet": "node qa/verify-sheet.mjs",
    "verify:mobile": "node qa/verify-mobile.cjs",
    "verify:pwa": "node qa/verify-pwa.cjs",
    "perf:mobile": "node qa/perf-mobile.cjs"
```
(poner coma tras `"verify:cable-color": "node qa/verify-cable-color.cjs"`).

- [ ] **Step 7: Medir la línea base (debe FALLAR)**

```bash
npm run perf:mobile
```
Expected: dos líneas JSON con `appRenders` cercano al número de eventos (≈60 en pan) y `AssertionError: pan: ~60 renders de App (máx. 3)`. Guardar la salida en `qa/perf-baseline.txt` (`npm run perf:mobile > qa/perf-baseline.txt 2>&1`).

- [ ] **Step 8: Checkpoint de regresión base**

```bash
npm run check && npm run verify:ui && npm run verify:diagram-layout && npm run verify:canvas
```
Expected: todos pasan (en este punto aún no hay cambios de comportamiento). Anotar cualquiera que ya falle antes de empezar.

---

### Task 1: Lógica pura de snaps de la hoja

**Files:**
- Create: `src/layout/sheet.ts`
- Test: `qa/verify-sheet.mjs`

- [ ] **Step 1: Escribir la prueba que falla**

```js
// qa/verify-sheet.mjs — Node 24 ejecuta .ts directamente (type stripping).
import assert from 'node:assert/strict';
import {nearestSnap,stepSnap,tapSnap,snapHeights,HALF_RATIO} from '../src/layout/sheet.ts';
const h={closed:68,half:405,full:760};
assert.equal(nearestSnap(70,0,h),'closed');
assert.equal(nearestSnap(400,0,h),'half');
assert.equal(nearestSnap(700,0,h),'full');
assert.equal(nearestSnap(300,.5,h),'half','un impulso hacia arriba sube a la mitad');
assert.equal(nearestSnap(300,-.5,h),'closed','un impulso hacia abajo cierra');
assert.equal(nearestSnap(200,1.5,h),'half');
assert.equal(nearestSnap(600,1,h),'full','el impulso empuja a pantalla casi completa');
assert.equal(stepSnap('closed',-1),'closed');assert.equal(stepSnap('closed',1),'half');assert.equal(stepSnap('half',1),'full');assert.equal(stepSnap('full',1),'full');
assert.equal(tapSnap('closed'),'half');assert.equal(tapSnap('half'),'closed');assert.equal(tapSnap('full'),'half');
assert.deepEqual(snapHeights(760,68,844),{closed:68,half:Math.round(844*HALF_RATIO),full:760});
assert.deepEqual(snapHeights(300,68,844),{closed:68,half:300,full:300},'half nunca supera el espacio disponible');
console.log('PASS verify-sheet');
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `node qa/verify-sheet.mjs`
Expected: FAIL `Cannot find module '.../src/layout/sheet.ts'`

- [ ] **Step 3: Implementar `src/layout/sheet.ts`**

```ts
export type SheetSnap='closed'|'half'|'full';
export type SnapHeights=Record<SheetSnap,number>;
export const SNAP_ORDER:SheetSnap[]=['closed','half','full'];
/** Debe coincidir con --sheet-half:48dvh en mobile.css. */
export const HALF_RATIO=.48;
export function snapHeights(available:number,closed:number,viewport:number):SnapHeights{return {closed,half:Math.min(Math.round(viewport*HALF_RATIO),available),full:available}}
/** visible: alto visible actual (px). velocity: px/ms, positivo = la hoja sube. */
export function nearestSnap(visible:number,velocity:number,heights:SnapHeights):SheetSnap{
 const projected=visible+velocity*160;
 return SNAP_ORDER.reduce((best,s)=>Math.abs(heights[s]-projected)<Math.abs(heights[best]-projected)?s:best,SNAP_ORDER[0]);
}
export function stepSnap(snap:SheetSnap,direction:1|-1):SheetSnap{return SNAP_ORDER[Math.max(0,Math.min(SNAP_ORDER.length-1,SNAP_ORDER.indexOf(snap)+direction))]}
export function tapSnap(snap:SheetSnap):SheetSnap{return snap==='closed'?'half':snap==='half'?'closed':'half'}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `node qa/verify-sheet.mjs`
Expected: `PASS verify-sheet`

- [ ] **Step 5: Checkpoint**

```bash
npm run check
```
Expected: sin errores (el archivo nuevo no se usa todavía).

---

### Task 2: Detección compacta, clases en el contenedor y `mobile.css`

**Files:**
- Create: `src/hooks/useCompactLayout.ts`, `src/styles/mobile.css`
- Modify: `src/components/App.tsx`, `src/pages/index.astro`

- [ ] **Step 1: Crear `src/hooks/useCompactLayout.ts`**

```ts
import {useLayoutEffect,useState} from 'react';
export type LayoutMode={compact:boolean;portrait:boolean};
export const COMPACT_QUERY='(max-width:900px), (max-height:600px) and (max-width:1000px)';
export const PORTRAIT_QUERY='(orientation:portrait)';
const read=():LayoutMode=>({compact:matchMedia(COMPACT_QUERY).matches,portrait:matchMedia(PORTRAIT_QUERY).matches});
export function useCompactLayout():LayoutMode{
 const [mode,setMode]=useState<LayoutMode>({compact:false,portrait:false});
 useLayoutEffect(()=>{
  const queries=[matchMedia(COMPACT_QUERY),matchMedia(PORTRAIT_QUERY)];
  const update=()=>setMode(prev=>{const next=read();return prev.compact===next.compact&&prev.portrait===next.portrait?prev:next});
  update();queries.forEach(q=>q.addEventListener('change',update));
  return ()=>queries.forEach(q=>q.removeEventListener('change',update));
 },[]);
 return mode;
}
```

- [ ] **Step 2: Crear `src/styles/mobile.css` con los tokens**

```css
/* Modo móvil. Se activa con .is-compact (useCompactLayout). Se importa el último en index.astro. */
.app-shell.is-compact{--safe-t:env(safe-area-inset-top,0px);--safe-r:env(safe-area-inset-right,0px);--safe-b:env(safe-area-inset-bottom,0px);--safe-l:env(safe-area-inset-left,0px);--bar-h:48px;--bar-total:calc(var(--bar-h) + var(--safe-t));--sheet-closed:68px;--sheet-half:48dvh;--sheet-full:calc(100dvh - var(--bar-total) - 8px);--stage-left:0px;--stage-bottom:0px;--float-shadow:0 2px 8px #28384914}
.app-shell.is-compact.is-landscape{--bar-h:44px}
.app-shell.is-compact.is-portrait.diagram-open{--stage-bottom:var(--sheet-half)}
.app-shell.is-compact.is-portrait.diagram-open[data-sheet=closed]{--stage-bottom:var(--sheet-closed)}
.app-shell.is-compact.is-landscape.diagram-open{--sheet-w:min(38vw,360px);--stage-left:calc(var(--sheet-w) + var(--safe-l))}
.app-shell.is-compact.is-landscape.diagram-open[data-sheet=full]{--sheet-w:min(70vw,640px)}
.app-shell.is-compact[data-sheet=closed]{--sheet-visible:var(--sheet-closed);--sheet-hidden:calc(var(--sheet-full) - var(--sheet-closed))}
.app-shell.is-compact[data-sheet=half]{--sheet-visible:var(--sheet-half);--sheet-hidden:calc(var(--sheet-full) - var(--sheet-half))}
.app-shell.is-compact[data-sheet=full]{--sheet-visible:var(--sheet-full);--sheet-hidden:0px}
```

- [ ] **Step 3: Importarlo el último en `src/pages/index.astro`**

Tras `import '../styles/cable-color.css';` añadir:

```astro
import '../styles/mobile.css';
```

- [ ] **Step 4: Conectar el hook y las clases en `App.tsx`**

Añadir imports (junto a los demás, tras `import {usePractice} ...`):

```tsx
import {useCompactLayout} from '../hooks/useCompactLayout';
import type {SheetSnap} from '../layout/sheet';
```

Tras la línea del contador de renders (Task 0) añadir:

```tsx
 const {compact,portrait}=useCompactLayout(),[sheetSnap,setSheetSnap]=useState<SheetSnap>('half');
```

Reemplazar la línea de apertura del `return`:

old:
```tsx
 return <div className={`app-shell ${!isIntro?'editor-workbench':''} ${readingOnly?'editor-reading':''} ${guided?'editor-guided':''}`}>
```
new:
```tsx
 return <div data-sheet={sheetSnap} className={`app-shell ${!isIntro?'editor-workbench':''} ${readingOnly?'editor-reading':''} ${guided?'editor-guided':''} ${compact?`is-compact ${portrait?'is-portrait':'is-landscape'}`:''} ${compact&&showDiagram?'diagram-open':''}`}>
```

Añadir dos efectos tras `useEffect(()=>{setFeedback('');setPending(null)},[doc.mode,doc.stepIndex]);`:

```tsx
 useEffect(()=>{if(compact&&readingOnly){setReadingOnly(false);setSheetSnap('full')}},[compact,readingOnly]);
 useEffect(()=>{if(showDiagram)setSheetSnap(s=>s==='closed'?'half':s)},[showDiagram]);
```

- [ ] **Step 5: Verificar que las clases aparecen**

```bash
npm run check
```
Expected: sin errores. Luego en el navegador (viewport 390×844, `http://127.0.0.1:4323/?view=simulator`) ejecutar en consola: `document.querySelector('.app-shell').className` → contiene `is-compact is-portrait`. En 1440×900 → no contiene `is-compact`.

- [ ] **Step 6: Checkpoint**

```bash
npm run verify:ui && npm run verify:canvas
```
Expected: igual que la línea base (los estilos aún no cambian nada).

---

### Task 3: Header mínimo (CompactBar) y menú `⋯`

**Files:**
- Create: `src/components/SearchBox.tsx`, `src/components/CablesMenu.tsx`, `src/components/CompactBar.tsx`, `qa/verify-mobile.cjs`
- Modify: `src/components/SimulationControls.tsx`, `src/components/App.tsx`, `src/styles/mobile.css`

- [ ] **Step 1: Crear `qa/verify-mobile.cjs` completo (todas las secciones; se ejecuta por grupos con `--only=`)**

```js
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4323/';
const only=((process.argv.find(a=>a.startsWith('--only='))||'').slice(7)).split(',').filter(Boolean);
const want=n=>!only.length||only.includes(n);
const errors=[],pass=m=>console.log('PASS',m);
const rect=(page,sel)=>page.locator(sel).first().evaluate(el=>{const r=el.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}});
const overlaps=(a,b)=>a.l<b.r-1&&b.l<a.r-1&&a.t<b.b-1&&b.t<a.b-1;
const open=async(browser,w,h)=>{const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();await page.evaluate(()=>document.fonts.ready);return {ctx,page}};
const noHScroll=async(page,label)=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+': hay scroll horizontal');
const snap=page=>page.locator('.app-shell').getAttribute('data-sheet');
const drag=async(page,from,to,steps=12)=>{await page.mouse.move(from.x,from.y);await page.mouse.down();for(let i=1;i<=steps;i++)await page.mouse.move(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps);await page.mouse.up();await page.waitForTimeout(400)};
(async()=>{const browser=await chromium.launch();try{
 if(want('bar'))for(const [w,h] of [[390,844],[360,780]]){
  const {ctx,page}=await open(browser,w,h);
  assert.equal(await page.locator('.compact-bar').count(),1,'falta .compact-bar');
  const bar=await rect(page,'.compact-bar');assert.ok(bar.h<=56,`barra de ${bar.h}px`);
  assert.ok(await page.locator('.compact-bar').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${w}px: la barra desborda`);
  for(const sel of ['.topbar','.workspace-navigation','.work-tools','.mobile-work-tabs','.stage-topline'])assert.ok(!(await page.locator(sel).first().isVisible().catch(()=>false)),sel+' sigue visible');
  assert.ok(!(await page.locator('.searchbox-wrap').first().isVisible().catch(()=>false)),'el buscador no debe verse hasta abrir ⋯');
  await page.locator('.compact-bar .simulation-toggle').waitFor();await page.locator('.compact-bar .cables-menu').waitFor();
  await page.locator('.practice-menu>summary').click();
  const input=page.getByRole('textbox',{name:'Buscar un borne o componente'});await input.waitFor();await input.fill('A1');
  assert.ok(await page.locator('.search-results button').count()>0,'sin resultados para A1');
  await page.locator('.search-results button').first().click();
  assert.equal(await page.locator('.practice-menu').evaluate(el=>el.open),false,'el menú debe cerrarse al elegir un borne');
  await noHScroll(page,`${w}px`);pass(`bar ${w}×${h}: barra ${Math.round(bar.h)}px, menú ⋯ con buscador`);await ctx.close();
 }
 if(want('portrait')){
  const {ctx,page}=await open(browser,390,844);
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();
  await page.locator('.bottom-sheet').waitFor();await page.waitForTimeout(400);
  assert.equal(await snap(page),'half');
  const bar=await rect(page,'.compact-bar'),sheet=await rect(page,'.bottom-sheet'),stage=await rect(page,'.stage-wrap'),board=await rect(page,'.board-svg');
  assert.ok(sheet.t>=bar.b-1,'la hoja tapa la barra');assert.ok(stage.b<=sheet.t+2,'el banco queda bajo la hoja');assert.ok(board.h>240,`el banco mide solo ${board.h}px`);
  const grip=await rect(page,'.sheet-grip'),gx=grip.l+grip.w/2,gy=grip.t+grip.h/2;
  await drag(page,{x:gx,y:gy},{x:gx,y:gy-400});assert.equal(await snap(page),'full','arrastrar arriba → full');
  const g2=await rect(page,'.sheet-grip');await drag(page,{x:g2.l+g2.w/2,y:g2.t+8},{x:g2.l+g2.w/2,y:g2.t+420});assert.equal(await snap(page),'half','arrastrar abajo → half');
  const g3=await rect(page,'.sheet-grip');await drag(page,{x:g3.l+g3.w/2,y:g3.t+8},{x:g3.l+g3.w/2,y:g3.t+420});assert.equal(await snap(page),'closed','arrastrar abajo → closed');
  await page.locator('.sheet-grip').focus();await page.keyboard.press('ArrowUp');assert.equal(await snap(page),'half','ArrowUp sube un nivel');
  await page.locator('.bottom-sheet').getByRole('button',{name:'Cerrar diagrama'}).click();assert.ok(!(await page.locator('.bottom-sheet').isVisible()),'la hoja debe ocultarse');
  await noHScroll(page,'vertical');pass('portrait: hoja half/full/closed por arrastre y teclado, banco bajo la hoja');await ctx.close();
 }
 if(want('landscape')){
  const {ctx,page}=await open(browser,844,390);
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.bottom-sheet').waitFor();await page.waitForTimeout(400);
  const sheet=await rect(page,'.bottom-sheet'),bar=await rect(page,'.compact-bar'),stage=await rect(page,'.stage-wrap');
  assert.ok(Math.abs(sheet.l)<1&&Math.abs(sheet.t)<1,'la columna debe pegarse arriba a la izquierda');assert.ok(Math.abs(sheet.h-390)<2,'la columna ocupa toda la altura');assert.ok(sheet.w<=361&&sheet.w>=300,`ancho de columna ${sheet.w}`);
  assert.ok(bar.l>=sheet.r-1,'la barra no debe invadir la columna');assert.ok(stage.l>=sheet.r-1,'el banco empieza tras la columna');
  assert.ok(bar.h<=48,`barra horizontal de ${bar.h}px`);assert.ok(!overlaps(bar,sheet),'barra y columna se solapan');
  assert.ok(!(await page.locator('.sheet-grip').isVisible()),'el asa no se muestra en horizontal');
  await noHScroll(page,'horizontal');pass('landscape: columna lateral sin solapamientos');await ctx.close();
 }
 if(want('floating')){
  const {ctx,page}=await open(browser,390,844);
  await page.getByRole('button',{name:'Abrir diagrama',exact:true}).click();await page.locator('.bottom-sheet').waitFor();await page.waitForTimeout(400);
  const sheet=await rect(page,'.bottom-sheet'),dock=await rect(page,'.tool-dock'),zoom=await rect(page,'.practice-workspace .zoom-toolbar'),bar=await rect(page,'.compact-bar');
  assert.ok(dock.b<=sheet.t+1,'la barra de herramientas queda tapada por la hoja');assert.ok(dock.l>=0&&dock.r<=390,'las herramientas se salen de la pantalla');
  assert.ok(!overlaps(dock,zoom),'herramientas y zoom se solapan');assert.ok(zoom.t>=bar.b-1,'el zoom invade la barra');
  await page.locator('[data-terminal-id]').first().click({force:true});
  const insp=page.locator('.practice-workspace .inspector');
  if(await insp.count()){const i=await rect(page,'.practice-workspace .inspector');assert.ok(i.b<=sheet.t+1,'el inspector queda tapado por la hoja');assert.ok(i.l>=0&&i.r<=390,'el inspector se sale')}
  pass('floating: herramientas, zoom e inspector visibles y sin solapamientos');await ctx.close();
 }
 if(want('desktop')){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});const page=await ctx.newPage();await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor();
  assert.equal(await page.locator('.compact-bar').count(),0,'escritorio no debe tener .compact-bar');assert.ok(await page.locator('.topbar').isVisible(),'escritorio conserva el topbar');
  pass('desktop: sin cambios');await ctx.close();
 }
 assert.deepEqual(errors,[],'errores de página: '+errors.join(' | '));
 console.log('PASS verify-mobile');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
```

- [ ] **Step 2: Ejecutar `bar` y ver que falla**

Run: `node qa/verify-mobile.cjs --only=bar`
Expected: FAIL `falta .compact-bar` (`0 !== 1`).

- [ ] **Step 3: Crear `src/components/SearchBox.tsx`**

```tsx
import {ArrowRight,Search,X} from 'lucide-react';
import {COLOR_HEX,TERMINALS} from '../data/panel';
export type TerminalMatch=(typeof TERMINALS)[number];
export function SearchBox({query,onQuery,matches,onPick}:{query:string;onQuery:(q:string)=>void;matches:TerminalMatch[];onPick:(t:TerminalMatch)=>void}){
 return <div className="searchbox-wrap"><Search size={16}/><input aria-label="Buscar un borne o componente" value={query} onChange={e=>onQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')onQuery('');if(e.key==='Enter'&&matches[0])onPick(matches[0])}} placeholder="Buscar borne: A1, 95, S2:3…"/>{query&&<button aria-label="Borrar búsqueda" onClick={()=>onQuery('')}><X size={14}/></button>}{query.trim()&&<div className="search-results">{matches.length?matches.map(t=><button key={t.key} onClick={()=>onPick(t)}><span className="search-socket" style={{background:COLOR_HEX[t.terminal.color]}}/><div><strong>{t.terminal.id}</strong><small>{t.key}</small></div><ArrowRight size={14}/></button>):<div className="search-empty">Sin bornes que coincidan.</div>}</div>}</div>;
}
```

- [ ] **Step 4: Crear `src/components/CablesMenu.tsx`**

```tsx
import type {BananaCable} from '../data/practice';
export function CablesMenu({wires,selectedWire,onSelect}:{wires:BananaCable[];selectedWire:string|null;onSelect:(id:string|null)=>void}){
 return <details className="disclosure cables-menu"><summary>Cables <span data-wire-count={wires.length}>{wires.length}</span></summary><div>{wires.length?<select aria-label="Seleccionar un cable" value={selectedWire||''} onChange={e=>onSelect(e.target.value||null)}><option value="">Seleccionar cable…</option>{wires.map((w,i)=><option key={w.id} value={w.id}>{i+1}. {w.from.terminalId} ↔ {w.to.terminalId}</option>)}</select>:<p>Aún no has conectado cables.</p>}</div></details>;
}
```

- [ ] **Step 5: Crear `src/components/CompactBar.tsx`**

```tsx
import {Home as HomeIcon,X} from 'lucide-react';
import type {ReactNode} from 'react';
export function CompactBar({showDiagram,sheetFull,onHome,onBank,onToggleDiagram,simulation,cables}:{showDiagram:boolean;sheetFull:boolean;onHome:()=>void;onBank:()=>void;onToggleDiagram:()=>void;simulation:ReactNode;cables:ReactNode}){
 return <nav className="compact-bar" aria-label="Controles del banco">
  <button className="compact-home" aria-label="Inicio" onClick={onHome}><HomeIcon size={20}/></button>
  <div className="compact-views" role="group" aria-label="Vista de trabajo"><button aria-pressed={!sheetFull} onClick={onBank}>Banco</button><button className="open-diagram" aria-label={showDiagram?'Cerrar diagrama':'Abrir diagrama'} aria-pressed={showDiagram} onClick={onToggleDiagram}>Diagrama{showDiagram&&<X size={14}/>}</button></div>
  <div className="compact-sim">{simulation}</div>
  {cables}
 </nav>;
}
```

- [ ] **Step 6: `SimulationControls`: etiqueta corta en compacto**

En `src/components/SimulationControls.tsx` cambiar la firma:

old: `export function SimulationControls({simulation:s,onExample,hasWires}:{simulation:SimulationController;onExample:(id:ExampleId)=>void;hasWires:boolean}){`
new: `export function SimulationControls({simulation:s,onExample,hasWires,compact=false}:{simulation:SimulationController;onExample:(id:ExampleId)=>void;hasWires:boolean;compact?:boolean}){`

old: `<span>{s.input.enabled?'Detener 24 V':'Simular 24 V'}</span>`
new: `<span>{compact?'24 V':s.input.enabled?'Detener 24 V':'Simular 24 V'}</span>`

- [ ] **Step 7: `App.tsx` — imports**

Añadir tras el import de `useCompactLayout`:

```tsx
import {CompactBar} from './CompactBar';
import {CablesMenu} from './CablesMenu';
import {SearchBox,type TerminalMatch} from './SearchBox';
```
En el import de lucide (línea 2) quitar `ArrowRight` y `Search`; en el import de `../data/panel` quitar `COLOR_HEX` (ya no se usan en `App`; si `npm run check` indica otro símbolo sin uso, quitarlo también). Cambiar `useRef` ya importado: se usará abajo.

- [ ] **Step 8: `App.tsx` — referencia del menú y estado**

Ampliar la línea añadida en Task 2:

```tsx
 const {compact,portrait}=useCompactLayout(),[sheetSnap,setSheetSnap]=useState<SheetSnap>('half'),practiceMenu=useRef<HTMLDetailsElement>(null);
```

- [ ] **Step 9: `App.tsx` — definiciones antes del `return`**

Insertar justo antes de ` return <div data-sheet=` (la línea del return):

```tsx
 const closeMenu=()=>practiceMenu.current?.removeAttribute('open');
 const pickMatch=(t:TerminalMatch)=>{pick(t.key);focus(t.module);setQuery('');closeMenu()};
 const focusModule=(id:string)=>{const m=MODULES.find(m=>m.id===id);if(m){setSelected(`${m.id}:${m.terminals[0].id}`);setSelectedWire(null);focus(m)}};
 const moduleSelect=<select aria-label="Enfocar un módulo" value="" onChange={e=>{focusModule(e.target.value);closeMenu()}}><option value="" disabled>Ver módulo de cerca…</option>{MODULES.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>;
 const simControls=!exam?<SimulationControls simulation={simulation} onExample={loadSimulationExample} hasWires={!!doc.wires.length} compact={compact}/>:null;
```

- [ ] **Step 10: `App.tsx` — insertar la barra compacta**

old: `<main>{practice.saveError&&`
new:
```tsx
<main>{!isIntro&&compact&&<CompactBar showDiagram={showDiagram} sheetFull={sheetSnap==='full'} onHome={()=>{setIsIntro(true);setPending(null)}} onBank={()=>setSheetSnap(s=>s==='full'?'half':s)} onToggleDiagram={()=>{setShowDiagram(!showDiagram);setReadingOnly(false);setMobileView('panel')}} simulation={simControls} cables={<CablesMenu wires={doc.wires} selectedWire={selectedWire} onSelect={selectWire}/>}/>}{practice.saveError&&
```

- [ ] **Step 11: `App.tsx` — menú `⋯` con buscador y módulo**

old: `<details className="practice-menu disclosure">`
new: `<details ref={practiceMenu} className="practice-menu disclosure">`

old: `<div className="practice-settings"><label>Modo<select`
new: `<div className="practice-settings">{compact&&<><SearchBox query={query} onQuery={setQuery} matches={matches} onPick={pickMatch}/><label className="compact-module-focus">Ver módulo de cerca{moduleSelect}</label></>}<label>Modo<select`

- [ ] **Step 12: `App.tsx` — ocultar el cromo legado en compacto**

(a) Barra Banco/Abrir diagrama. old (una línea):
```tsx
<div className="work-toolbar workspace-navigation"><div className="workspace-views" role="group" aria-label="Vista de trabajo"><button aria-pressed={!readingOnly} onClick={()=>{setReadingOnly(false);setMobileView('panel')}}>Banco</button><button className="open-diagram" aria-pressed={showDiagram} onClick={()=>{setShowDiagram(!showDiagram);setReadingOnly(false);setMobileView('panel')}}>{showDiagram?'Cerrar diagrama':'Abrir diagrama'}</button></div></div>
```
new: el mismo contenido envuelto: `{!compact&&<div className="work-toolbar workspace-navigation">…</div>}` (copiar el `<div …>…</div>` exacto dentro de `{!compact&&` y `}`).

(b) Menú de cables. old:
```tsx
<div className="work-tools"><details className="disclosure cables-menu"><summary>Cables <span data-wire-count={doc.wires.length}>{doc.wires.length}</span></summary><div>{doc.wires.length?<select aria-label="Seleccionar un cable" value={selectedWire||''} onChange={e=>selectWire(e.target.value||null)}><option value="">Seleccionar cable…</option>{doc.wires.map((w,i)=><option key={w.id} value={w.id}>{i+1}. {w.from.terminalId} ↔ {w.to.terminalId}</option>)}</select>:<p>Aún no has conectado cables.</p>}</div></details></div>
```
new:
```tsx
{!compact&&<div className="work-tools"><CablesMenu wires={doc.wires} selectedWire={selectedWire} onSelect={selectWire}/></div>}
```

(c) Buscador. Reemplazar desde `<div className="searchbox-wrap"><Search size={16}/>` hasta `Sin bornes que coincidan.</div>}</div>}</div>` (incluye el cierre del `searchbox-wrap`) por:
```tsx
{!compact&&<SearchBox query={query} onQuery={setQuery} matches={matches} onPick={pickMatch}/>}
```

(d) Selector de módulo y simulación del `stage-topline`. old:
```tsx
</span><select aria-label="Enfocar un módulo" value="" onChange={e=>{const m=MODULES.find(m=>m.id===e.target.value);if(m){setSelected(`${m.id}:${m.terminals[0].id}`);setSelectedWire(null);focus(m)}}}><option value="" disabled>Ver módulo de cerca…</option>{MODULES.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>{!exam&&<SimulationControls simulation={simulation} onExample={loadSimulationExample} hasWires={!!doc.wires.length}/>}</div>
```
new:
```tsx
</span>{!compact&&<>{moduleSelect}{simControls}</>}</div>
```

- [ ] **Step 13: CSS de la barra y el menú — añadir al final de `src/styles/mobile.css`**

```css
/* ── Cromo legado oculto; la barra compacta lo reemplaza ── */
.app-shell.editor-workbench.is-compact .topbar,
.app-shell.editor-workbench.is-compact .mobile-work-tabs,
.app-shell.editor-workbench.is-compact .stage-topline,
.app-shell.editor-workbench.is-compact .workspace-caption{display:none}
/* ── Barra compacta ── */
.app-shell.editor-workbench.is-compact .compact-bar{position:fixed;z-index:50;top:0;left:var(--stage-left);right:0;height:var(--bar-total);box-sizing:border-box;padding:var(--safe-t) 52px 0 max(6px,var(--safe-l));display:flex;align-items:center;gap:4px;background:var(--float-bg);border-bottom:1px solid var(--float-border)}
.app-shell.editor-workbench.is-compact.is-landscape.diagram-open .compact-bar{padding-left:6px}
.compact-bar .compact-home{flex:none;width:36px;height:36px;display:grid;place-items:center;border:0;border-radius:10px;background:transparent;color:#355567}
.compact-bar .compact-views{display:flex;flex:1 1 auto;min-width:0;gap:2px;padding:2px;border-radius:10px;background:#edf3f6}
.compact-bar .compact-views button{flex:1 1 auto;min-width:0;min-height:34px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;gap:4px;border:0;border-radius:8px;background:transparent;color:#47657a;font:600 13px var(--ui-font);white-space:nowrap}
.compact-bar .compact-views button[aria-pressed=true]{background:#fff;color:#226e91;box-shadow:0 1px 3px #25405a1f}
.compact-bar .compact-sim{flex:none}
.compact-bar .simulation-controls{gap:2px}
.compact-bar .simulation-toggle,.compact-bar .simulation-menu>summary{min-height:36px;padding:4px 8px;font-size:13px}
.compact-bar .simulation-menu>summary{padding:4px 6px}
.compact-bar .simulation-menu-body{position:fixed;left:calc(var(--stage-left) + 8px);right:8px;top:calc(var(--bar-total) + 4px);width:auto;max-height:calc(100dvh - var(--bar-total) - 16px)}
.compact-bar .cables-menu{flex:none;min-width:0;z-index:auto}
.compact-bar .cables-menu>summary{display:flex;align-items:center;gap:4px;min-height:36px;padding:0 6px;font:600 12px var(--ui-font);list-style:none;white-space:nowrap}
.compact-bar .cables-menu>summary::-webkit-details-marker{display:none}
.compact-bar .cables-menu>div{position:fixed;left:calc(var(--stage-left) + 8px);right:8px;top:calc(var(--bar-total) + 4px);width:auto}
@media(max-width:380px){.compact-bar .cables-menu>summary{font-size:0}.compact-bar .cables-menu summary span{font-size:12px}}
/* ── Botón ⋯ y su panel ── */
.app-shell.editor-workbench.is-compact .practice-menu{position:fixed;z-index:60;top:calc(var(--safe-t) + 4px);right:max(6px,var(--safe-r));min-width:0;width:auto}
.app-shell.editor-workbench.is-compact .practice-menu>summary{width:40px;height:40px;min-height:0;padding:0;font-size:0;display:grid;place-items:center;list-style:none;border:0;background:transparent;box-shadow:none;border-radius:10px}
.app-shell.editor-workbench.is-compact .practice-menu>summary::-webkit-details-marker{display:none}
.app-shell.editor-workbench.is-compact .practice-menu>summary::before{content:'\22EF';font-size:24px;line-height:1;color:#355567}
.app-shell.editor-workbench.is-compact .practice-menu>summary::after{content:none}
.app-shell.editor-workbench.is-compact .practice-menu .practice-settings{position:fixed;top:calc(var(--bar-total) + 4px);left:max(8px,var(--stage-left));right:8px;width:auto;max-height:calc(100dvh - var(--bar-total) - 16px);overflow:auto;border-radius:14px;padding:14px;box-shadow:0 12px 36px #1a2b3833}
.app-shell.editor-workbench.is-compact .practice-settings .searchbox-wrap{position:relative;top:auto;left:auto;width:100%;height:auto;min-height:44px;display:flex;flex-wrap:wrap;align-items:center;box-shadow:none}
.app-shell.editor-workbench.is-compact .practice-settings .search-results{position:static;flex:1 1 100%;max-height:40dvh;margin-top:6px;box-shadow:none}
.app-shell.editor-workbench.is-compact .compact-module-focus{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#5f707a}
```

- [ ] **Step 14: Verificar tipos y la prueba `bar`**

```bash
npm run check && node qa/verify-mobile.cjs --only=bar
```
Expected: `PASS bar 390×844 …`, `PASS bar 360×780 …`. Si el ícono `⋯` no aparece (el CSS heredado puede pintarlo con otro pseudo-elemento), tomar captura y ajustar el `::before/::after` hasta que se vea un solo `⋯`.

- [ ] **Step 15: Checkpoint de regresión de escritorio**

```bash
node qa/verify-mobile.cjs --only=desktop && npm run verify:ui && npm run verify:canvas && npm run verify:interface
```
Expected: pasan. Si algún `verify:*` falla en escritorio, es una regresión: corregirla (probablemente un `!compact&&` mal cerrado en `App.tsx`).

---

### Task 4: Hoja inferior arrastrable (vertical)

**Files:**
- Create: `src/components/BottomSheet.tsx`
- Modify: `src/components/App.tsx`, `src/styles/mobile.css`

- [ ] **Step 1: Ejecutar `portrait` y ver que falla**

Run: `node qa/verify-mobile.cjs --only=portrait`
Expected: FAIL (timeout esperando `.bottom-sheet`).

- [ ] **Step 2: Crear `src/components/BottomSheet.tsx`**

```tsx
import {useRef,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {nearestSnap,snapHeights,stepSnap,tapSnap,SNAP_ORDER,type SheetSnap} from '../layout/sheet';
const LABEL:Record<SheetSnap,string>={closed:'Diagrama minimizado',half:'Diagrama a media altura',full:'Diagrama casi a pantalla completa'};
type Drag={startY:number;startVisible:number;lastY:number;lastT:number;velocity:number;moved:boolean;full:number;closed:number};
/** Hoja inferior. Durante el arrastre solo mueve `transform` (sin re-render); al soltar llama a onSnap. */
export function BottomSheet({snap,onSnap,open,draggable,children}:{snap:SheetSnap;onSnap:(s:SheetSnap)=>void;open:boolean;draggable:boolean;children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),drag=useRef<Drag|null>(null);
 const visibleNow=(el:HTMLElement)=>innerHeight-el.getBoundingClientRect().top;
 const down=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const el=root.current,target=e.target as Element;
  if(!draggable||!el||!target.closest('.sheet-grip,.diagram-pane-actions')||target.closest('button,a,input,select'))return;
  const full=el.offsetHeight,closed=parseFloat(getComputedStyle(el).getPropertyValue('--sheet-closed'))||68;
  drag.current={startY:e.clientY,startVisible:visibleNow(el),lastY:e.clientY,lastT:e.timeStamp,velocity:0,moved:false,full,closed};
  el.style.transition='none';el.setPointerCapture(e.pointerId);
 };
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const d=drag.current,el=root.current;if(!d||!el)return;
  const dy=e.clientY-d.startY;if(Math.abs(dy)>4)d.moved=true;
  const dt=e.timeStamp-d.lastT;if(dt>0)d.velocity=(d.lastY-e.clientY)/dt;d.lastY=e.clientY;d.lastT=e.timeStamp;
  const visible=Math.max(d.closed,Math.min(d.full,d.startVisible-dy));
  el.style.transform=`translateY(${d.full-visible}px)`;
 };
 const up=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const d=drag.current,el=root.current;if(!d||!el)return;drag.current=null;
  const visible=visibleNow(el);
  try{el.releasePointerCapture(e.pointerId)}catch{}
  el.style.transition='';
  const next=d.moved?nearestSnap(visible,d.velocity,snapHeights(d.full,d.closed,innerHeight)):tapSnap(snap);
  el.style.transform='';onSnap(next);
 };
 const key=(e:ReactKeyboardEvent)=>{if(e.key==='ArrowUp'){e.preventDefault();onSnap(stepSnap(snap,1))}else if(e.key==='ArrowDown'){e.preventDefault();onSnap(stepSnap(snap,-1))}};
 return <div ref={root} className="bottom-sheet" hidden={!open} data-snap={snap} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <div className="sheet-grip" role="slider" tabIndex={0} aria-label="Altura del diagrama" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={SNAP_ORDER.length-1} aria-valuenow={SNAP_ORDER.indexOf(snap)} aria-valuetext={LABEL[snap]} onKeyDown={key}/>
  {children}
 </div>;
}
```

- [ ] **Step 3: `App.tsx` — importar y envolver el diagrama**

Añadir import:

```tsx
import {BottomSheet} from './BottomSheet';
```

Antes del `return` (junto a las definiciones de Task 3 paso 9) añadir:

```tsx
 const wrapDiagram=(pane:ReactElement)=>compact?<BottomSheet snap={sheetSnap} onSnap={setSheetSnap} open={showDiagram} draggable={portrait}>{pane}</BottomSheet>:pane;
```

Envolver el `DiagramPane`:

old: `      <DiagramPane learningMode={learning?.mode}`
new: `      {wrapDiagram(<DiagramPane learningMode={learning?.mode}`

old: `recognitionImage={identification?TERMINAL_BY_ID.get(identification.terminalId)?.module.image:undefined}/>`
new: `recognitionImage={identification?TERMINAL_BY_ID.get(identification.terminalId)?.module.image:undefined}/>)}`

Ampliar/Volver al banco en compacto:

old: `readingOnly={readingOnly} onExpand={()=>setReadingOnly(!readingOnly)}`
new: `readingOnly={compact?sheetSnap==='full':readingOnly} onExpand={()=>compact?setSheetSnap(s=>s==='full'?'half':'full'):setReadingOnly(!readingOnly)}`

Que «Ubicar en el banco» y «Mostrar recorrido» bajen la hoja si está completa:

old: `setSelected(id);setShowInspector(true);focus(t.module);setReadingOnly(false);setMobileView('panel')};`
new: `setSelected(id);setShowInspector(true);focus(t.module);setReadingOnly(false);setMobileView('panel');setSheetSnap(s=>s==='full'?'half':s)};`

old: `const showRoute=()=>{setShowWires(true);`
new: `const showRoute=()=>{setSheetSnap(s=>s==='full'?'half':s);setShowWires(true);`

- [ ] **Step 4: CSS de la hoja y del banco — añadir al final de `mobile.css`**

```css
/* ── Banco: ocupa lo que dejan la barra y la hoja ── */
.app-shell.editor-workbench.is-compact[data-sheet] .practice-workspace .stage-wrap{position:absolute;inset:var(--bar-total) 0 var(--stage-bottom) var(--stage-left);width:auto;height:auto}
/* ── Hoja inferior ── */
.bottom-sheet{display:none}
.app-shell.editor-workbench.is-compact .bottom-sheet{display:flex;flex-direction:column;position:fixed;z-index:30;left:0;right:0;bottom:0;height:var(--sheet-full);box-sizing:border-box;background:var(--float-bg);border:1px solid var(--float-border);border-bottom:0;border-radius:16px 16px 0 0;box-shadow:0 -3px 16px #2838491f;contain:layout paint;will-change:transform;transform:translateY(calc(100% - var(--sheet-visible,48dvh)));transition:transform .26s var(--motion-ease);padding-bottom:var(--safe-b)}
.app-shell.editor-workbench.is-compact .bottom-sheet[hidden]{display:none}
.sheet-grip{flex:none;height:18px;display:grid;place-items:center;cursor:grab;touch-action:none}
.sheet-grip::before{content:'';width:38px;height:4px;border-radius:2px;background:#bccad2}
.app-shell.editor-workbench.is-compact .bottom-sheet .diagram-pane-actions{touch-action:none}
.app-shell.editor-workbench.is-compact .practice-workspace .bottom-sheet .diagram-pane{position:static;flex:1 1 0;min-height:0;width:auto;height:auto;max-width:none;max-height:none;border:0;border-radius:0;box-shadow:none;background:transparent;animation:none;overflow:hidden}
.app-shell.editor-workbench.is-compact .bottom-sheet .diagram-pane-body{padding-bottom:calc(14px + var(--sheet-hidden,0px))}
.app-shell.is-compact[data-sheet=closed] .bottom-sheet .diagram-pane>:not(.diagram-pane-actions){visibility:hidden}
@media(prefers-reduced-motion:reduce){.app-shell.is-compact .bottom-sheet{transition:none}}
```

- [ ] **Step 5: Verificar**

```bash
npm run check && node qa/verify-mobile.cjs --only=portrait,bar
```
Expected: `PASS portrait: hoja half/full/closed …` y `PASS bar …`. Si el arrastre no cambia de snap, revisar con la consola que el `pointerdown` llegue a `.sheet-grip` (que ningún elemento del DiagramPane lo tape) y que `touch-action:none` está aplicado.

- [ ] **Step 6: Verificar el scroll interno y la altura útil**

En el navegador (390×844, diagrama abierto en `half`): desplazar el cuerpo del diagrama hasta el final y comprobar que el último elemento (p. ej. «Opciones del diagrama») queda visible por encima del borde inferior de la pantalla. Si queda oculto, aumentar el `padding-bottom` de `.diagram-pane-body` (la causa es `--sheet-hidden`).

- [ ] **Step 7: Checkpoint**

```bash
node qa/verify-mobile.cjs --only=desktop && npm run verify:ui && npm run verify:diagram-layout
```
Expected: escritorio pasa. `verify:diagram-layout` puede probar tamaños móviles con el layout viejo: si falla **solo** en tamaños compactos, actualizar esas expectativas en el Task 9; si falla en escritorio, es regresión.

---

### Task 5: Horizontal — columna lateral

**Files:**
- Modify: `src/styles/mobile.css`

- [ ] **Step 1: Ejecutar `landscape` y ver que falla**

Run: `node qa/verify-mobile.cjs --only=landscape`
Expected: FAIL (`la columna debe pegarse arriba a la izquierda` o similar; la hoja sigue en modo vertical).

- [ ] **Step 2: Añadir el CSS horizontal al final de `mobile.css`**

```css
/* ── Horizontal: el diagrama es una columna a la izquierda ── */
.app-shell.editor-workbench.is-compact.is-landscape .bottom-sheet{top:0;bottom:0;left:0;right:auto;width:calc(var(--sheet-w,min(38vw,360px)) + var(--safe-l));height:auto;border-radius:0;border-width:0 1px 0 0;transform:none;transition:width .2s var(--motion-ease);padding:0 0 var(--safe-b) var(--safe-l)}
.app-shell.is-compact.is-landscape .sheet-grip{display:none}
.app-shell.editor-workbench.is-compact.is-landscape .bottom-sheet .diagram-pane-body{padding-bottom:14px}
.app-shell.is-compact.is-landscape[data-sheet=closed] .bottom-sheet .diagram-pane>:not(.diagram-pane-actions){visibility:visible}
```

- [ ] **Step 3: Verificar**

```bash
node qa/verify-mobile.cjs --only=landscape,portrait,bar
```
Expected: los tres `PASS`. Revisar además con captura 844×390 que el banco se ve completo a la derecha de la columna y que «Ampliar diagrama» ensancha la columna (`data-sheet=full` → `--sheet-w:min(70vw,640px)`).

- [ ] **Step 4: Checkpoint**

```bash
npm run check
```

---

### Task 6: Elementos flotantes (herramientas, zoom, mensajes, inspector, guía)

**Files:**
- Modify: `src/styles/mobile.css`

- [ ] **Step 1: Ejecutar `floating` y ver que falla**

Run: `node qa/verify-mobile.cjs --only=floating`
Expected: FAIL (`la barra de herramientas queda tapada…` o `…se solapan`).

- [ ] **Step 2: Añadir al final de `mobile.css`**

```css
/* ── Flotantes dentro del área del banco (siempre sobre la hoja, nunca bajo ella) ── */
.app-shell.editor-workbench.is-compact .tool-dock{z-index:20;left:calc(var(--stage-left) + (100% - var(--stage-left)) / 2);bottom:calc(var(--stage-bottom) + 10px + var(--safe-b));transform:translateX(-50%);max-width:calc(100vw - var(--stage-left) - 16px);overflow-x:auto;scrollbar-width:none}
.app-shell.editor-workbench.is-compact .tool-dock .dock-tooltip{display:none}
.app-shell.editor-workbench.is-compact .practice-workspace .zoom-toolbar{z-index:20;top:calc(var(--bar-total) + 8px);bottom:auto;left:auto;right:max(8px,var(--safe-r));height:40px;padding:2px}
.app-shell.editor-workbench.is-compact .zoom-toolbar button{width:34px;height:34px}
.app-shell.editor-workbench.is-compact .connection-message{z-index:20;left:calc(var(--stage-left) + (100% - var(--stage-left)) / 2);bottom:calc(var(--stage-bottom) + 66px + var(--safe-b));max-width:calc(100vw - var(--stage-left) - 24px);font-size:12px;white-space:normal;text-align:center}
.app-shell.editor-workbench.is-compact .status-banner{z-index:70;top:calc(var(--bar-total) + 8px);max-width:calc(100vw - 24px);font-size:13px}
.app-shell.editor-workbench.is-compact .selected-cable-action{z-index:20;top:calc(var(--bar-total) + 8px);left:calc(var(--stage-left) + 8px);transform:none;max-width:calc(100vw - var(--stage-left) - 150px)}
.app-shell.editor-workbench.is-compact .practice-workspace .inspector{z-index:25;left:calc(var(--stage-left) + 8px);right:8px;top:auto;bottom:calc(var(--stage-bottom) + 70px + var(--safe-b));width:auto;max-height:min(42dvh,320px);padding:14px}
.app-shell.editor-workbench.is-compact .guide-card{z-index:22;left:calc(var(--stage-left) + 8px);right:8px;top:auto;width:auto;bottom:calc(var(--stage-bottom) + 70px + var(--safe-b));max-height:34dvh;padding:12px}
.app-shell.editor-workbench.is-compact .reviewed-steps{left:calc(var(--stage-left) + 8px);top:calc(var(--bar-total) + 52px);bottom:auto;width:min(260px,calc(100vw - var(--stage-left) - 16px));max-height:30dvh}
```

- [ ] **Step 3: Verificar todo el grupo móvil**

```bash
node qa/verify-mobile.cjs
```
Expected: `PASS bar …` (×2), `PASS portrait …`, `PASS landscape …`, `PASS floating …`, `PASS desktop …`, `PASS verify-mobile`.

- [ ] **Step 4: Revisión visual**

Con el navegador integrado (`mcp__Claude_Browser__*`), `resize_window` a 390×844 y 844×390: capturar (a) banco sin diagrama, (b) diagrama `half`, (c) menú `⋯` abierto, (d) menú de simulación abierto, (e) modo `connect` con el mensaje «Elige un borne de origen…». Corregir cualquier solapamiento visible que los asserts no cubran. Restaurar con `preset: "desktop"` al terminar.

- [ ] **Step 5: Checkpoint**

```bash
npm run check && npm run build
```

---

### Task 7: Rendimiento — gestos fuera de React

**Files:**
- Modify: `src/hooks/useSvgNavigation.ts`, `src/components/Board.tsx`, `src/styles/mobile.css`, `src/components/SimulatorInspector.tsx`, `src/components/App.tsx`

- [ ] **Step 1: Confirmar que la prueba falla antes de tocar el código**

Run: `npm run perf:mobile`
Expected: FAIL `pan: ~60 renders de App (máx. 3)` (igual que la línea base).

- [ ] **Step 2: Reescribir `src/hooks/useSvgNavigation.ts`**

Sustituir el archivo completo por:

```ts
import {useEffect,useLayoutEffect,useRef,type RefObject} from 'react';
export type CanvasView={x:number;y:number;w:number;h:number};
export type SvgNavigationApi={show:(v:CanvasView)=>void;commit:()=>void};
export function currentSvgView(svg:SVGSVGElement,fallback:CanvasView):CanvasView{const b=svg.viewBox.baseVal;return b.width&&b.height?{x:b.x,y:b.y,w:b.width,h:b.height}:fallback}
/** Animate viewBox without rerendering every terminal on each animation frame.
 *  Durante un gesto, `show` escribe el viewBox directo en el DOM; `commit` sincroniza el estado de React una sola vez. */
export function useSvgNavigation(ref:RefObject<SVGSVGElement|null>,view:CanvasView,setView:(v:CanvasView)=>void,{min=240,max=3200,active=true}={}):SvgNavigationApi{
 const current=useRef(view),latest=useRef({view,setView,min,max}),frame=useRef(0);
 const api=useRef<SvgNavigationApi>({show:()=>{},commit:()=>{}}).current;
 latest.current={view,setView,min,max};
 useLayoutEffect(()=>{
  const svg=ref.current;if(!svg||!active)return;cancelAnimationFrame(frame.current);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const write=(v:CanvasView)=>{current.current=v;svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`)};
  if(reduced||svg.dataset.dragging==='true'){write(view);svg.dataset.animating='false';return;}
  const from=currentSvgView(svg,current.current),distance=Math.abs(from.x-view.x)+Math.abs(from.y-view.y)+Math.abs(from.w-view.w)+Math.abs(from.h-view.h);
  if(distance<.001){write(view);svg.dataset.animating='false';return;}
  write(from);svg.dataset.animating='true';const start=performance.now();
  const tick=(now:number)=>{const t=Math.min(1,(now-start)/210),ease=1-Math.pow(1-t,3);write({x:from.x+(view.x-from.x)*ease,y:from.y+(view.y-from.y)*ease,w:from.w+(view.w-from.w)*ease,h:from.h+(view.h-from.h)*ease});if(t<1)frame.current=requestAnimationFrame(tick);else{write(view);svg.dataset.animating='false'}};
  frame.current=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame.current);
 },[ref,active,view.x,view.y,view.w,view.h]);
 useEffect(()=>{
  const svg=ref.current;if(!svg||!active)return;
  let space=false,suppress=false,consumed=false;
  const pointers=new Map<number,{x:number;y:number}>();
  let drag:{x:number;y:number;view:CanvasView;scale:number}|null=null;
  let pinch:{distance:number;center:{x:number;y:number};world:{x:number;y:number};view:CanvasView;scale:number}|null=null;
  let pending:CanvasView|null=null,commitTimer=0,settle=0;
  const read=()=>currentSvgView(svg,latest.current.view);
  const show=(v:CanvasView)=>{pending=v;current.current=v;svg.dataset.gesture='true';svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`)};
  const commit=()=>{clearTimeout(commitTimer);if(pending){const v=pending;pending=null;latest.current.setView(v)}cancelAnimationFrame(settle);settle=requestAnimationFrame(()=>{delete svg.dataset.gesture})};
  const commitSoon=()=>{clearTimeout(commitTimer);commitTimer=window.setTimeout(commit,140)};
  api.show=show;api.commit=commit;
  const wheel=(e:WheelEvent)=>{e.preventDefault();const v=read(),scale=svg.getScreenCTM()?.a||1;
   if(e.ctrlKey||e.metaKey){const matrix=svg.getScreenCTM();if(!matrix)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()),w=Math.max(latest.current.min,Math.min(latest.current.max,v.w*Math.exp(e.deltaY*.002))),factor=w/v.w;show({x:p.x-(p.x-v.x)*factor,y:p.y-(p.y-v.y)*factor,w,h:v.h*factor})}
   else{const units=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;show({...v,x:v.x+(e.shiftKey&&e.deltaX===0?e.deltaY:e.deltaX)*units/scale,y:v.y+(e.shiftKey?0:e.deltaY)*units/scale})}
   commitSoon();
  };
  const keydown=(e:KeyboardEvent)=>{if(e.code!=='Space'||(e.target as Element)?.closest('input,textarea,select,button,summary,.simulation-control,[contenteditable]'))return;space=true;svg.dataset.spacePan='true';e.preventDefault()};
  const release=()=>{space=false;delete svg.dataset.spacePan};
  const keyup=(e:KeyboardEvent)=>{if(e.code==='Space')release()};
  const down=(e:PointerEvent)=>{
   if((e.target as Element)?.closest('.simulation-control'))return;
   if(!pointers.size&&!drag)suppress=false;
   if(e.pointerType==='touch')pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const [a,b]=[...pointers.values()],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},matrix=svg.getScreenCTM();if(!matrix)return;const p=new DOMPoint(center.x,center.y).matrixTransform(matrix.inverse());pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),center,world:{x:p.x,y:p.y},view:read(),scale:matrix.a};consumed=true;suppress=true;svg.dataset.dragging='true';for(const id of pointers.keys())try{svg.setPointerCapture(id)}catch{}e.stopPropagation();return;}
   if(space||e.button===1){drag={x:e.clientX,y:e.clientY,view:read(),scale:svg.getScreenCTM()?.a||1};svg.dataset.dragging='true';svg.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation()}
  };
  const move=(e:PointerEvent)=>{
   if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),w=Math.max(latest.current.min,Math.min(latest.current.max,pinch.view.w*pinch.distance/distance)),factor=w/pinch.view.w;show({x:pinch.world.x+(pinch.view.x-pinch.world.x)*factor-(center.x-pinch.center.x)/pinch.scale*factor,y:pinch.world.y+(pinch.view.y-pinch.world.y)*factor-(center.y-pinch.center.y)/pinch.scale*factor,w,h:pinch.view.h*factor});e.stopPropagation();return;}
   if(consumed){e.stopPropagation();return;}
   if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>3)suppress=true;show({...drag.view,x:drag.view.x-dx/drag.scale,y:drag.view.y-dy/drag.scale});e.stopPropagation()}
  };
  const up=(e:PointerEvent)=>{pointers.delete(e.pointerId);if(consumed){pinch=null;if(!pointers.size){consumed=false;delete svg.dataset.dragging;commit()}}if(drag){drag=null;delete svg.dataset.dragging;commit()}};
  const click=(e:MouseEvent)=>{if(suppress){e.preventDefault();e.stopPropagation();suppress=false}};
  svg.addEventListener('wheel',wheel,{passive:false});svg.addEventListener('pointerdown',down,true);svg.addEventListener('pointermove',move,true);svg.addEventListener('pointerup',up,true);svg.addEventListener('pointercancel',up,true);svg.addEventListener('click',click,true);document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',release);
  return ()=>{svg.removeEventListener('wheel',wheel);svg.removeEventListener('pointerdown',down,true);svg.removeEventListener('pointermove',move,true);svg.removeEventListener('pointerup',up,true);svg.removeEventListener('pointercancel',up,true);svg.removeEventListener('click',click,true);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',release);cancelAnimationFrame(frame.current);cancelAnimationFrame(settle);clearTimeout(commitTimer);api.show=()=>{};api.commit=()=>{}};
 },[ref,active]);
 return api;
}
```

Diferencias respecto al original (todas deliberadas): se añade `show/commit/pending/commitSoon`, `api`, `from=currentSvgView(svg,…)` en el efecto de animación (el DOM manda), y `commit()` al soltar cada gesto. Todo lo demás es idéntico.

- [ ] **Step 3: `Board.tsx` — pan por `nav.show/commit` y `setPointer` con rAF**

En `export function Board(...)`, reemplazar:

old: ` useSvgNavigation(svg,view,setView);`
new:
```tsx
 const nav=useSvgNavigation(svg,view,setView);
 const pointerFrame=useRef(0),pointerNext=useRef<{x:number;y:number}|null>(null);
```

old (en `onMove`):
```tsx
  if(pendingTerminal&&svg.current){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.current.getScreenCTM()!.inverse());setPointer({x:p.x,y:p.y})}
```
new:
```tsx
  if(pendingTerminal&&svg.current){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.current.getScreenCTM()!.inverse());pointerNext.current={x:p.x,y:p.y};if(!pointerFrame.current)pointerFrame.current=requestAnimationFrame(()=>{pointerFrame.current=0;setPointer(pointerNext.current)})}
```

old:
```tsx
  setView({...anchor.current.view,x:anchor.current.view.x-(e.clientX-anchor.current.x)/scale,y:anchor.current.view.y-(e.clientY-anchor.current.y)/scale});
```
new:
```tsx
  nav.show({...anchor.current.view,x:anchor.current.view.x-(e.clientX-anchor.current.x)/scale,y:anchor.current.view.y-(e.clientY-anchor.current.y)/scale});
```

old: ` const onUp=()=>{anchor.current=null;if(svg.current)delete svg.current.dataset.dragging};`
new: ` const onUp=()=>{if(anchor.current)nav.commit();anchor.current=null;if(svg.current)delete svg.current.dataset.dragging};`

Verificar que `Board.tsx` ya importa `useRef` (la línea `const svg=useRef<SVGSVGElement>(null)` lo confirma). Si no importa `React` hooks con nombre, añadirlos.

- [ ] **Step 4: Verificar la prueba de rendimiento**

```bash
npm run check && npm run perf:mobile
```
Expected: `pan … "appRenders":1` (o ≤3), `ctrl+wheel … "appRenders":1`, `PASS perf-mobile`. Si `appRenders` sigue alto, buscar quién llama a `setView` por evento (p. ej. otro `useSvgNavigation` o el `onKeyDown`) con `grep -n "setView(" src/components/*.tsx`.

- [ ] **Step 5: Comprobar que el estado queda consistente tras el gesto**

En el navegador (390×844): arrastrar el banco, pulsar «Acercar» (`+`) y comprobar que el zoom parte de donde quedó el banco (sin salto), y que `Home`/«Ajustar al tablero» vuelve al encuadre completo. Si salta, `current.current` quedó desincronizado: revisar el paso 2.

- [ ] **Step 6: CSS — apagar filtros y animaciones durante gestos; sombras baratas**

Añadir al final de `mobile.css`:

```css
/* ── Rendimiento ── */
.app-shell.is-compact .board-svg[data-gesture=true] [filter],
.app-shell.is-compact .board-svg[data-dragging=true] [filter],
.app-shell.is-compact .board-svg[data-animating=true] [filter]{filter:none}
.app-shell.is-compact .board-svg[data-gesture=true] *,
.app-shell.is-compact .board-svg[data-dragging=true] *{animation-play-state:paused}
.app-shell.is-compact .board-svg .pilot-glow[opacity="0"]{display:none}
.app-shell.is-compact button,.app-shell.is-compact summary{transition:none}
.app-shell.is-compact{touch-action:manipulation}
```

- [ ] **Step 7: Prueba de que los filtros se apagan en pleno gesto**

Añadir al final del `try` de `qa/perf-mobile.cjs`, antes de `await browser.close()`:

```js
 const filterDuringPan=await (async()=>{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+40,y-30);await page.mouse.move(x+80,y-60);const v=await page.evaluate(()=>{const el=document.querySelector('.board-svg [filter]');return el?getComputedStyle(el).filter:'none'});await page.mouse.up();return v})();
 assert.equal(filterDuringPan,'none','los filtros SVG deben apagarse durante el pan');
 await page.waitForTimeout(300);
 const filterAtRest=await page.evaluate(()=>{const el=document.querySelector('.board-svg [filter]');return el?getComputedStyle(el).filter:'none'});
 assert.notEqual(filterAtRest,'none','los filtros SVG deben volver en reposo');
```
Run: `npm run perf:mobile`
Expected: `PASS perf-mobile`.

- [ ] **Step 8: Carga — fuentes precargadas e imágenes diferidas**

En `src/pages/index.astro`, dentro de `<head>` tras `<title>…</title>`:

```astro
    <link rel="preload" as="font" type="font/woff2" href="/fonts/SourceSans3-Regular.woff2" crossorigin />
    <link rel="preload" as="font" type="font/woff2" href="/fonts/SourceSans3-Semibold.woff2" crossorigin />
```
En `src/components/SimulatorInspector.tsx` línea 26, y en `App.tsx` (`<img src={currentModule.image} …`), y en `TeacherMaterial.tsx` (`<img` de la figura), añadir `loading="lazy" decoding="async"` a cada `<img`. Para localizarlos: `grep -n "<img" src/components/*.tsx`.

- [ ] **Step 9: Decisión sobre `React.memo` (solo si hace falta)**

Si en el paso 4 `appRenders` es ≤3, **no** añadir `memo` (YAGNI). Si un gesto sigue provocando renders de `DiagramPane`, envolverlo con `React.memo` y estabilizar sus props con `useCallback`, volviendo a medir con `perf:mobile`.

- [ ] **Step 10: Checkpoint de regresión (interacción del banco)**

```bash
npm run check && npm run verify:canvas && npm run verify:reading && npm run verify:wiring && npm run verify:simulation-ui && node qa/verify-mobile.cjs
```
Expected: todos pasan; en especial `verify:canvas` y `verify:simulation-ui` cubren pan, zoom, pinch y pilotos.

---

### Task 8: PWA — manifest, iconos, service worker

**Files:**
- Create: `scripts/make-icons.mjs`, `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`, `qa/verify-pwa.cjs`
- Modify: `src/pages/index.astro`, `astro.config.mjs`, `vercel.json`

- [ ] **Step 1: Escribir `qa/verify-pwa.cjs` (falla primero)**

```js
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4324/';
(async()=>{const browser=await chromium.launch();try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}});const page=await ctx.newPage();
 await page.goto(base);
 const link=await page.locator('link[rel=manifest]').getAttribute('href');assert.equal(link,'/manifest.webmanifest');
 const manifest=await (await page.request.get(base+'manifest.webmanifest')).json();
 assert.equal(manifest.display,'standalone');assert.equal(manifest.orientation,'any');assert.equal(manifest.lang,'es');
 assert.ok(manifest.icons.some(i=>i.sizes==='192x192')&&manifest.icons.some(i=>i.sizes==='512x512')&&manifest.icons.some(i=>i.purpose==='maskable'),'faltan iconos 192/512/maskable');
 for(const i of manifest.icons){const r=await page.request.get(new URL(i.src,base).href);assert.equal(r.status(),200,i.src)}
 assert.equal((await page.request.get(base+'icons/apple-touch-icon.png')).status(),200);
 assert.match(await page.locator('meta[name=viewport]').getAttribute('content'),/viewport-fit=cover/);
 assert.equal(await page.locator('meta[name=apple-mobile-web-app-capable]').getAttribute('content'),'yes');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 assert.ok(await page.evaluate(()=>!!navigator.serviceWorker.controller),'el service worker no controla la página');
 await ctx.setOffline(true);
 await page.goto(base+'?view=simulator');await page.locator('.board-svg').waitFor({timeout:10000});
 assert.ok(await page.evaluate(async()=>(await fetch('/panel-model.json')).ok),'panel-model.json no está en caché');
 assert.ok(await page.evaluate(async()=>(await fetch('/references/botoneras.jpg')).ok),'las fotos de referencia no están en caché');
 console.log('PASS verify-pwa: manifest, iconos, service worker y arranque sin conexión');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
```

Run: `node qa/verify-pwa.cjs` — Expected: FAIL (no hay `link[rel=manifest]`).

- [ ] **Step 2: Crear `scripts/make-icons.mjs` y generar los iconos**

```js
// Genera los iconos de la PWA. Requiere `sharp` (ya instalado como dependencia de Astro). Uso: node scripts/make-icons.mjs
import sharp from 'sharp';
import {mkdirSync,writeFileSync} from 'node:fs';
const BG='#15191e';
const bolt=(size,scale)=>{const s=size*scale,o=(size-s)/2,p=([x,y])=>`${o+x*s/24},${o+y*s/24}`;return `<polygon fill="#fff" points="${[[13,2],[3,14],[12,14],[11,22],[21,10],[12,10]].map(p).join(' ')}"/>`};
const svg=(size,{radius=0,scale})=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>${bolt(size,scale)}</svg>`;
const out='public/icons';mkdirSync(out,{recursive:true});
const targets=[['icon-192.png',192,{radius:44,scale:.62}],['icon-512.png',512,{radius:112,scale:.62}],['icon-maskable-512.png',512,{radius:0,scale:.46}],['apple-touch-icon.png',180,{radius:0,scale:.58}]];
for(const [name,size,o] of targets)await sharp(Buffer.from(svg(size,o))).png().toFile(`${out}/${name}`);
writeFileSync(`${out}/icon.svg`,svg(512,{radius:112,scale:.62}));
console.log('Iconos generados en',out);
```

```bash
node scripts/make-icons.mjs && ls public/icons
```
Expected: `Iconos generados en public/icons` y los 5 archivos. Abrir `icon-512.png` y `icon-maskable-512.png` para confirmar que el rayo es legible y centrado.

- [ ] **Step 3: Crear `public/manifest.webmanifest`**

```json
{
  "id": "/",
  "name": "PanelLab INACAP",
  "short_name": "PanelLab",
  "description": "Práctica virtual de cableado con banco, diagrama y simulación de mando de 24 V.",
  "lang": "es",
  "start_url": "/?view=simulator",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#f6f7f7",
  "theme_color": "#f6f7f7",
  "icons": [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
```

- [ ] **Step 4: Crear `public/sw.js`**

```js
/* PanelLab INACAP — service worker. __BUILD__ y __PRECACHE__ los sustituye astro.config.mjs al terminar el build. */
const BUILD='__BUILD__';
const CACHE=`panellab-${BUILD}`;
const PRECACHE=__PRECACHE__;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('panellab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==location.origin)return;
 if(req.mode==='navigate'){
  e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('/',copy));return res}).catch(()=>caches.match('/').then(hit=>hit||Response.error())));
  return;
 }
 e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
});
```

- [ ] **Step 5: Sellar `sw.js` desde `astro.config.mjs`**

Reemplazar el archivo por:

```js
import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import {readdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[p]});
/** Rellena __BUILD__ y __PRECACHE__ en dist/sw.js con los archivos reales del build. */
const stampServiceWorker=()=>({name:'panellab-stamp-sw',hooks:{'astro:build:done':({dir})=>{
 const root=fileURLToPath(dir),sw=join(root,'sw.js');
 const urls=walk(root).map(p=>'/'+relative(root,p).split('\\').join('/')).filter(u=>u!=='/sw.js'&&!u.endsWith('.map')).map(u=>u==='/index.html'?'/':u.replace(/\/index\.html$/,'/'));
 const body=readFileSync(sw,'utf8').replace('__BUILD__',Date.now().toString(36)).replace('__PRECACHE__',JSON.stringify([...new Set(urls)]));
 writeFileSync(sw,body);
}}});
export default defineConfig({integrations:[react(),stampServiceWorker()],output:'static',devToolbar:{enabled:false}});
```

- [ ] **Step 6: `index.astro` — meta PWA y registro del service worker**

Reemplazar las dos líneas de `viewport` y `theme-color` y añadir los enlaces:

```astro
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#f6f7f7" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="PanelLab" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
```
Y al final del `<body>`, tras `<App client:load />`:

```astro
    <script>
      if ('serviceWorker' in navigator && import.meta.env.PROD) {
        window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
      }
    </script>
```

- [ ] **Step 7: `vercel.json` — cabeceras**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "astro",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {"source": "/sw.js", "headers": [{"key": "Cache-Control", "value": "no-cache"}, {"key": "Service-Worker-Allowed", "value": "/"}]},
    {"source": "/manifest.webmanifest", "headers": [{"key": "Content-Type", "value": "application/manifest+json"}, {"key": "Cache-Control", "value": "no-cache"}]},
    {"source": "/icons/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]}
  ]
}
```

- [ ] **Step 8: Compilar, servir en producción y verificar**

```bash
npm run check && npm run build && grep -c "__PRECACHE__\|__BUILD__" dist/sw.js
```
Expected: build OK y `0` (el `grep -c` imprime 0 si no quedan marcadores). Comprobar también `head -c 300 dist/sw.js`: debe mostrar un `BUILD='…'` real y una lista de URLs.

```bash
npm run preview -- --port 4324
```
(en segundo plano) y luego:

```bash
PANELLAB_URL=http://127.0.0.1:4324/ node qa/verify-pwa.cjs
```
Expected: `PASS verify-pwa: manifest, iconos, service worker y arranque sin conexión`. Detener `preview` al terminar.

- [ ] **Step 9: Checkpoint**

```bash
npm run verify:data && npm run verify:routes
```
Expected: pasan (los archivos nuevos de `public/` no afectan al modelo). `qa/verify-vercel.mjs` compara contra el sitio publicado y quedará desactualizado hasta que el usuario despliegue: **no ejecutarlo ni desplegar** (`AGENTS.md`).

---

### Task 9: Barrido de regresión, documentación y cierre

**Files:**
- Modify (si hace falta): `qa/verify-*.cjs` que asuman el layout móvil viejo
- Create: `MODO_MOVIL_PWA.md`

- [ ] **Step 1: Ejecutar todo el barrido**

```bash
npm run check && npm run build && npm run verify:data && npm run verify:wiring && npm run verify:learning && npm run verify:simulation && node qa/verify-sheet.mjs && npm run verify:ui && npm run verify:practice && npm run verify:interface && npm run verify:reading && npm run verify:cade && npm run verify:canvas && npm run verify:learning-ui && npm run verify:simulation-ui && npm run verify:routes && npm run verify:diagram-layout && npm run verify:diagram-simple && npm run verify:cable-color && node qa/verify-mobile.cjs && npm run perf:mobile
```
Expected: todo `PASS`. Anotar cada fallo.

- [ ] **Step 2: Clasificar fallos**

Para cada `verify:*` que falle:
1. Si falla en un viewport **de escritorio** (> 900 px de ancho y alto > 600): es una regresión; corregirla en el código (no en la prueba).
2. Si falla en un viewport **compacto** porque busca elementos del layout viejo (`.workspace-navigation`, `.searchbox-wrap` fuera del menú, `.diagram-pane` en `position:fixed`, etc.): actualizar la prueba para usar los equivalentes compactos (`.compact-bar`, `.practice-menu>summary` + buscador, `.bottom-sheet .diagram-pane`), manteniendo la intención original de la prueba. Registrar cada cambio en `MODO_MOVIL_PWA.md`.
3. Si no se puede decidir, detenerse y consultar al usuario.

- [ ] **Step 3: Medición final**

```bash
npm run perf:mobile > qa/perf-after.txt 2>&1; cat qa/perf-baseline.txt qa/perf-after.txt
```
Incluir ambas tablas (appRenders, p95, max, longTasks) en el resumen final.

- [ ] **Step 4: Capturas comparativas**

Con el navegador integrado capturar 390×844 y 844×390 (diagrama abierto, `half`) y guardarlas en `qa/movil/` (`vertical-half.png`, `vertical-full.png`, `horizontal.png`, `menu.png`). Comparar con las capturas del usuario: el header debe ocupar una fila y el banco debe verse completo.

- [ ] **Step 5: Escribir `MODO_MOVIL_PWA.md`**

Contenido: qué cambió (header mínimo, hoja, columna, rendimiento, PWA), cómo instalar (iPhone: Safari → Compartir → «Añadir a pantalla de inicio»; Android: menú ⋮ → «Instalar app»), cómo actualizar la caché (se renueva sola en cada build/deploy), la lista de pruebas con sus resultados, los `qa/verify-*.cjs` modificados y por qué, y **pendiente**: probar la instalación real en el iPhone y desplegar (el usuario debe pedirlo; `AGENTS.md` lo restringe).

- [ ] **Step 6: Limpieza**

Detener el servidor de desarrollo. Confirmar que `qa/` no contiene archivos temporales nuevos salvo los listados. No borrar `../_backup-pre-movil` (lo decide el usuario).

- [ ] **Step 7: Resumen final al usuario**

Archivos modificados/creados, pruebas ejecutadas con resultado, números antes/después de rendimiento, lo no verificado (instalación PWA real en iPhone, rendimiento en dispositivo físico) y lo pendiente (despliegue).

---

## Autorrevisión contra el spec

| Requisito del spec | Tarea |
|---|---|
| §1 Detección `useCompactLayout` + clases | Task 2 |
| §2 Header mínimo y menú `⋯` (buscador, módulo, opciones) | Task 3 |
| §3 Hoja inferior con 3 snaps, asa, teclado, «Ampliar» | Tasks 1, 4 |
| §3 Herramientas/zoom/inspector sobre la hoja | Task 6 |
| §4 Horizontal con columna lateral | Task 5 |
| §5 `mobile.css` al final, selectores `.is-compact` | Tasks 2–6 |
| §6 PWA: manifest, iconos, meta iOS, SW sellado, vercel headers, safe areas | Task 8 (+ safe areas en Task 2/3) |
| §7 Rendimiento: filtros en gesto, gestos sin React, `setPointer` rAF, animaciones, carga, medición | Tasks 0, 7 |
| §8 Verificación: check/build, `verify:*`, `verify-mobile`, `perf-mobile`, navegador | Tasks 3–9 |
| Riesgo `viewBox` desincronizado | Task 7 pasos 2 y 5 |

Notas de coherencia de nombres usados entre tareas: `SheetSnap`/`nearestSnap`/`stepSnap`/`tapSnap`/`snapHeights`/`HALF_RATIO` (Task 1 → Task 4); `useCompactLayout()` → `{compact,portrait}` (Task 2 → 3, 4); `SearchBox`/`TerminalMatch`/`CablesMenu`/`CompactBar` (Task 3); `BottomSheet` props `snap,onSnap,open,draggable` (Task 4); `useSvgNavigation` devuelve `{show,commit}` (Task 7); atributos `data-sheet`, `data-gesture` y variables `--bar-total`, `--stage-left`, `--stage-bottom`, `--sheet-closed|half|full|visible|hidden|w` (Task 2 → 3–7).
