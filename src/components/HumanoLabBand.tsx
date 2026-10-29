import {useEffect, useRef, useState} from 'react';
import {RotateCcw, Volume2, VolumeX} from 'lucide-react';
import '../styles/humanolab-band.css';
/** Franja final de la portada: oculta hasta que la persona baja el scroll; se abre como un acordeón y reproduce, con su sonido,
 *  el cierre animado de Humano Lab (marca de los videos de modo.). Se queda abierta en el último cuadro. */
export function HumanoLabBand(){
  const band=useRef<HTMLElement>(null), video=useRef<HTMLVideoElement>(null), loop=useRef<HTMLVideoElement>(null);
  const [open,setOpen]=useState(false), [muted,setMuted]=useState(false), [ended,setEnded]=useState(false), [introDone,setIntroDone]=useState(false);
  useEffect(()=>{
    if(open)return;
    const atEnd=()=>window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4;
    const openNow=()=>setOpen(true);
    const onWheel=(e:WheelEvent)=>{if(e.deltaY>0&&atEnd())openNow()};
    const onScroll=()=>{if(window.scrollY>2&&atEnd())openNow()};
    const onKey=(e:KeyboardEvent)=>{if(['ArrowDown','PageDown','End',' '].includes(e.key)&&atEnd()&&!(e.target as Element)?.closest?.('input,textarea,select,button,a,summary'))openNow()};
    let startY=0;
    const onTouchStart=(e:TouchEvent)=>{startY=e.touches[0].clientY};
    const onTouchMove=(e:TouchEvent)=>{if(startY-e.touches[0].clientY>28&&atEnd())openNow()};
    window.addEventListener('wheel',onWheel,{passive:true});window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('keydown',onKey);
    window.addEventListener('touchstart',onTouchStart,{passive:true});window.addEventListener('touchmove',onTouchMove,{passive:true});
    return()=>{window.removeEventListener('wheel',onWheel);window.removeEventListener('scroll',onScroll);window.removeEventListener('keydown',onKey);window.removeEventListener('touchstart',onTouchStart);window.removeEventListener('touchmove',onTouchMove);};
  },[open]);
  const play=()=>{
    const v=video.current;if(!v)return;setEnded(false);setIntroDone(false);loop.current?.pause();if(loop.current)loop.current.currentTime=0;v.currentTime=0;v.muted=false;setMuted(false);
    // Los navegadores pueden bloquear el sonido sin un toque previo: en ese caso arranca en silencio y se ofrece activarlo.
    v.play().catch(()=>{v.muted=true;setMuted(true);v.play().catch(()=>{})});
  };
  useEffect(()=>{
    if(!open)return;
    const reduce=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t=window.setTimeout(()=>{band.current?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'end'});if(reduce)setEnded(true);else play();},reduce?0:350);
    return()=>window.clearTimeout(t);
  },[open]);
  const toggleSound=()=>{const v=video.current;if(!v)return;v.muted=!v.muted;setMuted(v.muted);};
  return <section ref={band} className={`humanolab-band${open?' is-open':''}`} aria-label="Humano Lab" aria-hidden={!open}>
    <div className="humanolab-band-inner">
      <video ref={loop} className="humanolab-band-loop" muted loop playsInline preload={open?'auto':'none'} src="/brand/humanolab-loop.mp4" aria-hidden="true"/>
      <video ref={video} playsInline preload={open?'auto':'none'} poster="/brand/humanolab-cierre.jpg" aria-label="Animación de Humano Lab" src="/brand/humanolab-cierre.mp4" className={introDone?'is-done':''} onEnded={()=>{setIntroDone(true);loop.current?.play().catch(()=>{})}}/>
      <div className="humanolab-band-tools">
        <button type="button" onClick={toggleSound} aria-label={muted?'Activar sonido':'Silenciar'} title={muted?'Activar sonido':'Silenciar'}>{muted?<VolumeX size={15}/>:<Volume2 size={15}/>}</button>
        {(ended||introDone)&&<button type="button" onClick={play} aria-label="Ver la animación" title="Ver la animación"><RotateCcw size={15}/></button>}
      </div>
      <a className="humanolab-band-url" href="https://humanolab.cl" target="_blank" rel="noopener noreferrer" aria-label="Humano Lab: humanolab.cl" tabIndex={open?0:-1}>humanolab.cl</a>
    </div>
  </section>;
}
