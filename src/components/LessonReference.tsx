import {useState} from 'react';
import {Minus,Plus,Focus} from 'lucide-react';
import {LESSON_SCHEMATICS} from '../data/lessonSchematics';
import {CadeShape,CadeSheetFrame} from './CadeSheet';
import type {Lesson} from '../data/lessons';
/** A plain reference: no component explanations, step highlighting or bank mappings during assessment. */
export function LessonReference({schematic}:{schematic:Lesson['schematic']}){
 const cade=LESSON_SCHEMATICS[schematic],view=cade.drawing.views!.all,[zoom,setZoom]=useState(1);
 return <section className="assessment-reference" aria-label="Esquema de referencia sin pistas">
  <div className="lesson-reference-tools"><button type="button" className="lesson-secondary" aria-label="Alejar referencia" onClick={()=>setZoom(z=>Math.max(1,z-.5))}><Minus size={16}/></button><span>{Math.round(zoom*100)}%</span><button type="button" className="lesson-secondary" aria-label="Acercar referencia" onClick={()=>setZoom(z=>Math.min(5,z+.5))}><Plus size={16}/></button><button type="button" className="lesson-secondary" aria-label="Ajustar referencia" onClick={()=>setZoom(1)}><Focus size={16}/></button></div>
  <p>{schematic==='estrellaManual'||schematic==='estrellaTimer'?'Diagrama original del cambio manual. La secuencia y los componentes de cada variante se explican en sus pasos.':'Referencia del circuito. Amplía para leer sus rótulos; no se muestran los pasos ni correspondencias con el banco.'}</p>
  <div className="lesson-reference-scroll"><svg role="img" aria-label="Esquema eléctrico de la prueba" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{width:`${zoom*100}%`}}>
   {cade.drawing.frame&&<CadeSheetFrame frame={cade.drawing.frame}/>}
   {cade.WIRES.map(w=><line key={w.id} x1={w.x} y1={w.y} x2={w.x2} y2={w.y2} stroke={w.color??'#44505a'} strokeWidth={.55} strokeDasharray={w.dashed?'1.6 1.1':undefined}/>)}
   {cade.JUNCTIONS.map((j,i)=><circle key={`j${i}`} cx={j.x} cy={j.y} r={.85} fill="#44505a"/>)}
   {cade.SYMBOLS.map(o=>o.shape?<g key={o.id} color="#3c4650"><CadeShape o={o}/></g>:null)}
  </svg></div>
 </section>;
}
