import {teachingUnits} from './lessonTeachings';
import {TeachingReader} from './TeachingReader';
export function ToolTeaching({topic,courseId,source,onPractice,example,onExample}:{topic:'temperature'|'proximity'|'affine'|'quadratic'|'logarithm';courseId:string;source:string;onPractice:()=>void;example:boolean;onExample:()=>void}){
 return <div className="tool-teaching"><TeachingReader key={String(example)} unit={teachingUnits[topic]} courseId={courseId} example={example} onExample={onExample} onPractice={onPractice} sourceUrl={source} pages="material y guía de la clase"/></div>;
}
