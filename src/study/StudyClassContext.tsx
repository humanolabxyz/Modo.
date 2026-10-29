import {useEffect} from 'react';
import {ArrowLeft,ArrowRight,ChevronRight} from 'lucide-react';
import {classOutlines,type ClassMaterial} from './classCatalog';
import {courses} from './courseCatalog';
import '../styles/lesson-focus.css';

export function studyClasses(courseId:string){
  const outline=classOutlines[courseId];
  return [...(outline?.units.flatMap(u=>u.materials)||[]),...(outline?.unassigned||[])].filter(m=>m.topicIds?.length||m.toolLessonId||m.tempLessonId||m.detLessonId||m.academicLessonId||m.machineActivity||m.mathReview);
}
export function studyClassUrl(courseId:string,material:ClassMaterial){
  const unit=classOutlines[courseId]?.units.find(u=>u.materials.some(m=>m.id===material.id));
  const params=new URLSearchParams({curso:courseId,clase:material.id});
  if(unit)params.set('unidad',unit.id);
  const module=unit?.modules?.find(m=>m.materialIds.includes(material.id));if(module)params.set('modulo',module.id);
  return `/estudio?${params}`;
}
export function StudyClassContext({courseId,classId}:{courseId:string;classId:string}){
  const course=courses.find(c=>c.id===courseId),allMaterials=studyClasses(courseId),material=allMaterials.find(m=>m.id===classId);
  const unit=classOutlines[courseId]?.units.find(u=>u.materials.some(m=>m.id===classId));
  const module=unit?.modules?.find(m=>m.materialIds.includes(classId));
  const materials=module?module.materialIds.map(id=>allMaterials.find(m=>m.id===id)).filter((m):m is ClassMaterial=>!!m):allMaterials,index=materials.findIndex(m=>m.id===classId);
  useEffect(()=>{if(material)try{localStorage.setItem('modo:study:last-class:v1',JSON.stringify({courseId,classId}));}catch{/* Navigation remains usable without storage. */}},[courseId,classId,material]);
  if(!course||!material)return null;
  const outlineUrl=`/estudio?curso=${courseId}${unit?`&unidad=${unit.id}`:''}${module?`&modulo=${module.id}`:''}`;
  return <nav className="study-class-context" aria-label="Navegación de la clase">
    <div className="study-context-path"><a href="/estudio">Estudio</a><ChevronRight size={13}/><a href={outlineUrl}>{course.title}</a><ChevronRight size={13}/>{unit&&<><span>{unit.title}</span><ChevronRight size={13}/></>}{module&&<><a href={outlineUrl}>{module.title}</a><ChevronRight size={13}/></>}<span aria-current="page">{material.title}</span></div>
    <div className="study-context-controls"><a className="study-context-back" href={outlineUrl}><ArrowLeft size={15}/>Volver al ramo</a><details className="study-context-switch"><summary>Cambiar actividad</summary><label>Cambiar de clase<select aria-label="Cambiar de clase" value={classId} onChange={e=>{const next=materials.find(m=>m.id===e.target.value);if(next)location.assign(studyClassUrl(courseId,next));}}>{materials.map((m,i)=><option value={m.id} key={m.id}>{String(i+1).padStart(2,'0')} · {m.title}</option>)}</select></label></details><div className="study-context-paging"><span>{index+1} / {materials.length}</span>{index>0?<a href={studyClassUrl(courseId,materials[index-1])} aria-label="Clase anterior"><ArrowLeft size={17}/></a>:null}{index<materials.length-1?<a href={studyClassUrl(courseId,materials[index+1])} aria-label="Clase siguiente"><ArrowRight size={17}/></a>:null}</div></div>
  </nav>;
}
