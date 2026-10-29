import {BookOpen,Eye,PenLine,Check} from 'lucide-react';

export type StudyView='understand'|'example'|'practice'|'check';
const stages=[
  {id:'understand',label:'Entender',Icon:BookOpen},
  {id:'example',label:'Ver un ejemplo',Icon:Eye},
  {id:'practice',label:'Practicar',Icon:PenLine},
  {id:'check',label:'Comprobar',Icon:Check},
] as const;

/** One learning navigation for lessons, reviews and guided laboratory activities. */
export function StudySequence({value,onChange,withCheck=false,className='',label='Recorrido de estudio'}:{
  value:StudyView;onChange:(view:StudyView)=>void;withCheck?:boolean;className?:string;label?:string;
}){
  return <nav className={`study-sequence ${className}`} aria-label={label}>
    {stages.filter(s=>withCheck||s.id!=='check').map(({id,label,Icon},index)=><button type="button" key={id} aria-label={label} aria-current={value===id?'step':undefined} aria-pressed={value===id} onClick={()=>onChange(id)}><span>{String(index+1).padStart(2,'0')}</span><Icon size={16} aria-hidden="true"/>{label}</button>)}
  </nav>;
}
