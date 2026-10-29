import {ArrowLeftRight} from 'lucide-react';
import {terminalLabel} from '../data/lessons';
export function LessonConnectionCard({from,to,labelFor=terminalLabel}:{from:string;to:string;labelFor?:(id:string)=>string}){
 const end=(id:string)=>{const [device,...port]=labelFor(id).split(' · ');return <div className="lesson-connection-end"><span>{device}</span><strong>{port.join(' · ')}</strong></div>};
 return <div className="lesson-connection" aria-label={`${labelFor(from)} con ${labelFor(to)}`}>{end(from)}<ArrowLeftRight size={19} aria-hidden="true"/>{end(to)}</div>;
}
