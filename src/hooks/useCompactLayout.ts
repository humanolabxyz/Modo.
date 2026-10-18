import {useLayoutEffect,useState} from 'react';
export type LayoutMode={compact:boolean;portrait:boolean};
export const COMPACT_QUERY='(max-width:900px), (max-height:600px) and (max-width:1000px)';
export const PORTRAIT_QUERY='(orientation:portrait)';
const read=(query:string):LayoutMode=>({compact:matchMedia(query).matches,portrait:matchMedia(PORTRAIT_QUERY).matches});
export function useCompactLayout(query=COMPACT_QUERY):LayoutMode{
 const [mode,setMode]=useState<LayoutMode>({compact:false,portrait:false});
 useLayoutEffect(()=>{
  const queries=[matchMedia(query),matchMedia(PORTRAIT_QUERY)];
  const update=()=>setMode(prev=>{const next=read(query);return prev.compact===next.compact&&prev.portrait===next.portrait?prev:next});
  update();queries.forEach(q=>q.addEventListener('change',update));
  return ()=>queries.forEach(q=>q.removeEventListener('change',update));
 },[query]);
 return mode;
}
