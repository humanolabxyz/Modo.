import type {CoilMode} from './model';
/** Símbolos de escalera: contacto NA/NC y bobina o bloque, dibujados en vez de escritos con guiones. */
export function ContactSymbol({negated}:{negated:boolean}){return <svg className="lab-ladder-symbol" viewBox="0 0 64 28" aria-hidden="true"><path d="M0 14H22M42 14H64M22 4V24M42 4V24"/>{negated?<path d="M17 23L47 5"/>:null}</svg>;}
export function CoilSymbol({mode}:{mode:CoilMode}){
  if(['ton','tof','ctu'].includes(mode))return <svg className="lab-ladder-symbol coil" viewBox="0 0 64 28" aria-hidden="true"><path d="M0 14H10M54 14H64"/><rect x="10" y="3" width="44" height="22" rx="3"/><text x="32" y="18" textAnchor="middle">{mode.toUpperCase()}</text></svg>;
  return <svg className="lab-ladder-symbol coil" viewBox="0 0 64 28" aria-hidden="true"><path d="M0 14H16M48 14H64M22 3Q12 14 22 25M42 3Q52 14 42 25"/>{mode!=='coil'?<text x="32" y="19" textAnchor="middle">{mode==='set'?'S':'R'}</text>:null}</svg>;
}
