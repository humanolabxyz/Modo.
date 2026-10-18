import {LESSONS,type Lesson} from './lessons';
import {teachingForStep} from './lessonTeaching';
import {cableNodes} from './wiring';
import type {BananaCable} from './practice';
import type {LessonAssessment,LessonAnswer} from './assessmentState';
export const connectionKey=(from:string,to:string)=>[from,to].sort().join('|');
export function answerFor(assessment:LessonAssessment,wire:BananaCable):LessonAnswer|undefined{
 return assessment.answers.find(a=>a.wireId===wire.id&&connectionKey(a.from,a.to)===connectionKey(wire.from.terminalId,wire.to.terminalId));
}
export function questionFor(lesson:Lesson,wire:BananaCable):string{
 const step=lesson.steps.find(s=>connectionKey(s.from,s.to)===connectionKey(wire.from.terminalId,wire.to.terminalId));
 return step?teachingForStep(step,lesson.schematic).question:'Explica qué función pretendes conseguir con esta unión, de qué estados de los componentes depende y qué cambiaría si la retiraras. Justifica su lugar en el circuito.';
}
/** Compare cable-only nets, rather than wire count or installation order. Device internals are never unioned. */
export function assessLesson(assessment:LessonAssessment,wires:BananaCable[]){
 const lesson=LESSONS[assessment.lessonId];
 const reference=lesson.pairs.map(([from,to],i)=>({id:String(i),from:{terminalId:from},to:{terminalId:to},color:'#145650',layer:i}));
 const expected=[...cableNodes(reference).values()],actual=[...cableNodes(wires).values()];
 const expectedFor=(id:string)=>expected.find(ids=>ids.includes(id));
 const verdicts=wires.map(w=>{
  const a=expectedFor(w.from.terminalId),b=expectedFor(w.to.terminalId),net=actual.find(ids=>ids.includes(w.from.terminalId))!;
  return {wire:w,status:!a||!b?'unmapped' as const:a!==b||net.some(id=>!a.includes(id))?'incompatible' as const:'compatible' as const};
 });
 const missing=lesson.steps.filter(s=>{const net=actual.find(ids=>ids.includes(s.from)),ref=expectedFor(s.from)!;return !net||!net.includes(s.to)||net.some(id=>!ref.includes(id))});
 const answered=wires.filter(w=>answerFor(assessment,w)?.text.trim()).length;
 return {lesson,verdicts,missing,answered,unanswered:wires.length-answered,complete:missing.length===0&&verdicts.every(v=>v.status==='compatible')};
}
