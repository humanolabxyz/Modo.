import {LESSON_IDS,type LessonId} from './lessonIds';
export type LessonAnswer={wireId:string;from:string;to:string;text:string};
export type LessonAssessment={version:1;id:string;lessonId:LessonId;answers:LessonAnswer[];reflection:string;submitted:boolean};
export const newAssessment=(lessonId:LessonAssessment['lessonId']):LessonAssessment=>({version:1,id:crypto.randomUUID(),lessonId,answers:[],reflection:'',submitted:false});
/** Optional metadata keeps existing v2 panel files readable. Never interpret submitted text as a grade. */
export function readAssessment(raw:unknown,known:(id:string)=>boolean):LessonAssessment{
 const a=raw as LessonAssessment;
 if(!a||a.version!==1||typeof a.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(a.id)||!LESSON_IDS.includes(a.lessonId)||typeof a.submitted!=='boolean'||typeof a.reflection!=='string'||a.reflection.length>6000||!Array.isArray(a.answers)||a.answers.length>500)throw new Error('La evaluación de la lección no es válida.');
 const ids=new Set<string>();
 const answers=a.answers.map(r=>{
  if(!r||typeof r.wireId!=='string'||r.wireId.length>100||ids.has(r.wireId)||typeof r.from!=='string'||typeof r.to!=='string'||!known(r.from)||!known(r.to)||r.from===r.to||typeof r.text!=='string'||r.text.length>3000)throw new Error('Una respuesta de la lección no es válida.');
  ids.add(r.wireId);return {wireId:r.wireId,from:r.from,to:r.to,text:r.text};
 });
 return {version:1,id:a.id,lessonId:a.lessonId,submitted:a.submitted,reflection:a.reflection,answers};
}
