import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ChevronDown,Link as LinkIcon} from 'lucide-react';
import {type ClassMaterial,type CourseOutlineData,type LearningModule} from './classCatalog';
import {studyClassUrl} from './StudyClassContext';
import '../styles/course-classroom.css';

export function CourseClassroom({courseId,title,outline,rows,children}:{courseId:string;title:string;outline:CourseOutlineData;rows:(materials:ClassMaterial[])=>ReactNode;children?:ReactNode}){
  const root=useRef<HTMLDivElement>(null);
  const [indexOpen,setIndexOpen]=useState(false);
  const [collapsed,setCollapsed]=useState(true);
  function reveal(unitId:string,moduleId?:string,scroll=true){
    const unit=root.current?.querySelector<HTMLDetailsElement>(`[id="${unitId}"]`);
    if(!unit)return;
    unit.open=true;
    const target=moduleId?root.current?.querySelector<HTMLDetailsElement>(`[id="${moduleId}"]`):unit;
    if(target){
      let parent:HTMLElement|null=target;
      while(parent&&parent!==root.current){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
      if(scroll){target.querySelector<HTMLElement>('summary')?.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});}
    }
  }
  useEffect(()=>{
    const sync=()=>{const params=new URLSearchParams(location.search);const unit=params.get('unidad');if(unit)reveal(unit,params.get('modulo')||undefined);};
    const container=root.current;
    const syncExpanded=()=>setCollapsed(!container?.querySelector('.course-classroom-content details[open]'));
    container?.addEventListener('toggle',syncExpanded,true);
    const frame=requestAnimationFrame(sync);window.addEventListener('popstate',sync);return()=>{cancelAnimationFrame(frame);window.removeEventListener('popstate',sync);container?.removeEventListener('toggle',syncExpanded,true);};
  },[courseId]);
  function jump(unit:string,module?:string){
    const url=new URL(location.href);url.searchParams.set('unidad',unit);url.searchParams.delete('modulo');if(module)url.searchParams.set('modulo',module);
    history.replaceState(null,'',url);setIndexOpen(false);reveal(unit,module);
  }
  function toggleAll(){
    root.current?.querySelectorAll<HTMLDetailsElement>('.course-classroom-content details').forEach(item=>{item.open=collapsed;});setCollapsed(!collapsed);
  }
  function moduleView(module:LearningModule,materials:ClassMaterial[]){
    return <details className="course-module" id={module.id} key={module.id}>
      <summary><ChevronDown size={16} aria-hidden="true"/><span>{module.title}</span></summary>
      {rows(module.materialIds.map(id=>materials.find(m=>m.id===id)).filter((m):m is ClassMaterial=>!!m))}
      {module.resources?.map(resource=><a className="course-resource" key={resource.href} href={resource.href} target="_blank" rel="noreferrer"><LinkIcon size={20} aria-hidden="true"/><span>{resource.title}</span><small>↗</small></a>)}
      {module.pending&&<p className="course-pending">{module.pending}</p>}
    </details>;
  }
  return <div className="course-classroom" ref={root}>
    <aside className="course-index">
      <button className="course-index-toggle" aria-expanded={indexOpen} aria-controls="course-index-tree" onClick={()=>setIndexOpen(!indexOpen)}>Índice del curso<ChevronDown size={17}/></button>
      <nav id="course-index-tree" className={indexOpen?'is-open':''} aria-label="Índice del curso">
        <strong className="course-index-title">{title}</strong>
        {outline.units.map(unit=><details key={unit.id}><summary>{unit.title}</summary>
          <a href={`#${unit.id}`} onClick={e=>{e.preventDefault();jump(unit.id);}}>Ver unidad</a>
          {unit.modules?unit.modules.map(module=><details key={module.id}>
            <summary>{module.title}</summary>
            <a href={`#${module.id}`} onClick={e=>{e.preventDefault();jump(unit.id,module.id);}}>Ver {module.title.toLocaleLowerCase('es')}</a>
            {module.materialIds.map(id=>unit.materials.find(m=>m.id===id)).filter((m):m is ClassMaterial=>!!m).map(material=><a href={studyClassUrl(courseId,material)} key={material.id}>{material.title}</a>)}
            {module.resources?.map(resource=><a key={resource.href} href={resource.href} target="_blank" rel="noreferrer">{resource.title} ↗</a>)}
          </details>):unit.materials.map(material=><a href={material.pdfUrl&&!material.topicIds&&!material.academicLessonId&&!material.machineActivity&&!material.toolLessonId&&!material.tempLessonId&&!material.detLessonId&&!material.mathReview?material.pdfUrl:studyClassUrl(courseId,material)} key={material.id}>{material.title}</a>)}
        </details>)}
      </nav>
    </aside>
    <div className="course-classroom-content">
      <div className="course-program-heading"><h2>Contenido del curso</h2><button onClick={toggleAll}>{collapsed?'Expandir todo':'Colapsar todo'}</button></div>
      <section aria-label="Unidades del ramo">
        {outline.units.map(unit=><details className="course-unit" id={unit.id} key={unit.id}>
          <summary><ChevronDown size={18} aria-hidden="true"/><span>{unit.title}</span></summary>
          {unit.modules?<>
            {unit.modules.filter(m=>m.origin==='classroom').map(module=>moduleView(module,unit.materials))}
            {unit.modules.some(m=>m.origin==='support')&&<details className="course-support"><summary>Apoyo para estudiar esta unidad</summary>{unit.modules.filter(m=>m.origin==='support').map(module=>moduleView(module,unit.materials))}</details>}
          </>:unit.materials.length?rows(unit.materials):<p className="course-pending">Material de esta unidad pendiente de incorporar.</p>}
        </details>)}
      </section>
      {!!outline.unassigned.length&&<section className="course-unit"><h2>Material de clase disponible</h2>{rows(outline.unassigned)}</section>}
      {!outline.units.length&&!outline.unassigned.length&&<p className="course-pending">Todavía falta incorporar el material de este ramo.</p>}
      {children}
    </div>
  </div>;
}
