import {ArrowLeftRight} from 'lucide-react';
import {terminalLabel} from '../data/lessons';
export function LessonConnectionCard({from,to}:{from:string;to:string}){
 const end=(id:string)=>{const [device,...port]=terminalLabel(id).split(' · ');return <div className="lesson-connection-end"><span>{device}</span><strong>{port.join(' · ')}</strong></div>};
 return <div className="lesson-connection" aria-label={`${terminalLabel(from)} con ${terminalLabel(to)}`}>{end(from)}<ArrowLeftRight size={19} aria-hidden="true"/>{end(to)}</div>;
}
