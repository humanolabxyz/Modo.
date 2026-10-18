import {BookOpen,ArrowRight} from 'lucide-react';
import type {ManualStep} from '../data/practice';
import {teachingForStep} from '../data/lessonTeaching';
import '../styles/lesson-understanding.css';
export function LessonUnderstanding({step,schematic,open,onToggle,onNext}:{step:ManualStep;schematic:'simple'|'inversion';open:boolean;onToggle:(open:boolean)=>void;onNext:()=>void}){
 const teaching=teachingForStep(step,schematic);
 return <details className="lesson-understanding" open={open} onToggle={e=>onToggle(e.currentTarget.open)}>
  <summary><BookOpen size={16} aria-hidden="true"/>Comprender este paso</summary>
  <div className="lesson-understanding-body">
   <section><h4>Qué hace cada componente</h4>{teaching.components.map(c=><p key={c.name}><b>{c.name}</b><br/>{c.role}</p>)}</section>
   <section><h4>Por qué conectamos este cable</h4><p>{teaching.why}</p></section>
   <section><h4>Qué ocurre en el circuito</h4><p>{teaching.behavior}</p></section>
   <section><h4>Si faltara esta conexión</h4><p>{teaching.without}</p><small>Considera que no hay otra unión equivalente que mantenga esa misma red.</small></section>
   <p className="lesson-think"><b>Piensa antes de seguir</b><br/>{teaching.question}</p>
   <small>Con este repaso abierto, la lección espera a que avances. Puedes leer todos los pasos sin instalar cables.</small>
   <button type="button" className="lesson-secondary" onClick={onNext}>Leer siguiente paso <ArrowRight size={15}/></button>
  </div>
 </details>;
}
