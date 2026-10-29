import {useMemo,useRef,type ReactNode} from 'react';

/** Editor de texto estructurado con números de línea y color por tipo de símbolo.
 *  El <textarea> sigue siendo el control real (teclado, selección, lectores de pantalla); la capa coloreada solo se ve detrás. */
const TOKEN=/(\/\/[^\n]*|\(\*[\s\S]*?(?:\*\)|$))|\b(IF|THEN|ELSE|ELSIF|END_IF|AND|OR|XOR|NOT|MOD|TRUE|FALSE)\b|\b([IQM]\d+\.[0-7]|AI\d+|AQ\d+|MW\d+|[TC]\d+)\b|(\d+(?:\.\d+)?)|(:=|<=|>=|<>|[=<>+\-*/])/gi;
function highlight(source:string):ReactNode[]{
 const out:ReactNode[]=[];let last=0,key=0;
 for(const m of source.matchAll(TOKEN)){
  const at=m.index??0;if(at>last)out.push(source.slice(last,at));
  const kind=m[1]?'c':m[2]?'k':m[3]?'a':m[4]?'n':'o';
  out.push(<span key={key++} className={`st-${kind}`}>{m[0]}</span>);last=at+m[0].length;
 }
 if(last<source.length)out.push(source.slice(last));
 return out;
}
export function StEditor({id,label,value,disabled,onChange,minLines=12}:{id?:string;label?:string;value:string;disabled?:boolean;onChange:(value:string)=>void;minLines?:number}){
 const layer=useRef<HTMLPreElement>(null),gutter=useRef<HTMLDivElement>(null);
 const lines=useMemo(()=>Math.max(minLines,value.split('\n').length),[value,minLines]);
 const colored=useMemo(()=>highlight(value),[value]);
 const sync=(e:{currentTarget:HTMLTextAreaElement})=>{const t=e.currentTarget;if(layer.current){layer.current.scrollTop=t.scrollTop;layer.current.scrollLeft=t.scrollLeft;}if(gutter.current)gutter.current.scrollTop=t.scrollTop;};
 return <div className={`st-editor ${disabled?'is-disabled':''}`}>
  <div className="st-gutter" ref={gutter} aria-hidden="true">{Array.from({length:lines},(_,i)=><span key={i}>{i+1}</span>)}</div>
  <div className="st-stack">
   <pre className="st-layer" ref={layer} aria-hidden="true">{colored}{'\n'}</pre>
   <textarea id={id} aria-label={label} className="st-input" wrap="off" spellCheck={false} disabled={disabled} value={value} onScroll={sync} onChange={e=>onChange(e.target.value)}/>
  </div>
 </div>;
}
