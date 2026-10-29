import { lessons } from "./model";
import {geoLessons} from '../learning/geogebraLessons';
import {temperatureLessons} from '../learning/temperatureLessons';
import {detectorLessons} from '../learning/detectorLessons';
import {REVIEW_ID,REVIEW_MATERIAL} from '../learning/temperatureReview';
import {academicLessons} from './academicContent';
import academicSources from './content/academic-sources.json';

export type ClassMaterial = {
  id: string;
  title: string;
  kind: "class" | "exercise" | "guide";
  pdfUrl?: string;
  topicIds?: string[];
  toolLessonId?: string;
  tempLessonId?: string;
  detLessonId?: string;
  academicLessonId?: string;
  mathReview?: 'all'|'exp'|'bacteria'|'elimination';
};
export type LearningUnit = { id: string; title: string; materials: ClassMaterial[] };
export type CourseOutlineData = { units: LearningUnit[]; unassigned: ClassMaterial[] };
const academic=(courseId:string,unitId:string):ClassMaterial[]=>academicLessons.filter(l=>l.courseId===courseId&&l.unitId===unitId).map(l=>({id:l.id,title:l.title,kind:l.sourceId==='F34'||l.sourceId==='F07'||l.sourceId==='F10'||l.sourceId==='F11'||l.sourceId==='F12'?'guide':'class',pdfUrl:academicSources.find(s=>s.id===l.sourceId)?.url,academicLessonId:l.id}));
const original=(id:string,title?:string):ClassMaterial=>{const s=academicSources.find(s=>s.id===id)!;return {id:`fuente-${id}`,title:title||s.title,kind:'guide',pdfUrl:s.url};};

// Una fuente por clase. Los ocho temas existentes pertenecen a este mismo PDF;
// no equivalen a ocho clases del aula ni confirman su número de unidad.
export const protectionClass: ClassMaterial = {
  id: "protecciones-docente-2026-10-07",
  title: "Protecciones eléctricas",
  kind: "class",
  pdfUrl: "/estudio/profesor.pdf",
  topicIds: lessons.map(lesson => lesson.id),
};

// Solo se transcribe lo visible en la captura del usuario. Las unidades 2 y 3
// estaban cerradas: se desconoce su lista de clases. No se copian los «Hecho».
export const classOutlines: Record<string, CourseOutlineData> = {
  "s2-1": {
    units: [
      {
        id: "area02-u1",
        title: "Unidad 1: Principios de Electrónica y Electrónica Analógica",
        materials: [
          ...academic('s2-1','area02-u1'),
          { id: "area02-u1-ejercicio-1", title: "Ejercicio 1", kind: "exercise" },
        ],
      },
      { id: "area02-u2", title: "Unidad 2: Fundamentos de Electrónica Digital", materials: [] },
      { id: "area02-u3", title: "Unidad 3: Introducción a Electrónica de Potencia", materials: [] },
    ],
    unassigned: [],
  },
  "s2-2": { units: [
    {id:'cm-u1',title:'Unidad 1: Fundamentos de máquinas eléctricas rotativas',materials:[...academic('s2-2','cm-u1'),original('F18','Temario de Evaluación 1'),original('F16','Rúbrica del informe · EVA1'),original('F15','Resolución de prueba · contiene pauta en revisión')]},
    {id:'cm-u2',title:'Unidad 2: Control electromecánico',materials:[...academic('s2-2','cm-u2'),protectionClass]},
    {id:'cm-u3',title:'Unidad 3: Control electrónico de motores CA',materials:[]},
  ], unassigned: [] },
  // Unidades según la captura del aula. Tienen lección G01, G02 y G03; las conferencias y demás guías siguen pendientes.
  "s2-3": {units:[
    {id:'ii-u1',title:'Unidad 1: Clasificación y características de la instrumentación',materials:academic('s2-3','ii-u1')},
    {id:'ii-u2',title:'Unidad 2: Medición y actuación discreta y analógica',materials:[...academic('s2-3','ii-u2'),...detectorLessons.map(l=>({id:l.materialId,title:l.title,kind:'guide' as const,pdfUrl:l.source,detLessonId:l.id})),...temperatureLessons.map(l=>({id:l.materialId,title:l.title,kind:'guide' as const,pdfUrl:l.source,tempLessonId:l.id})),{id:REVIEW_MATERIAL,title:'Temperatura · Repaso de la guía G03',kind:'guide' as const,tempLessonId:REVIEW_ID}]},
    {id:'ii-u3',title:'Unidad 3: Interpretación de instrumentación y control',materials:[]},
  ],unassigned:[]},
  "s2-5": {units:[
    {id:'mtfm01-u1',title:'Unidad 1: Funciones polinómicas',materials:[...geoLessons.filter(l=>l.unit===1).map(l=>({id:l.materialId,title:l.title,kind:'guide' as const,pdfUrl:l.source,toolLessonId:l.id})),...academic('s2-5','mtfm01-u1')]},
    {id:'mtfm01-u2',title:'Unidad 2: Funciones exponenciales y logarítmicas',materials:[{id:'mtfm01-repaso-u2',title:'Repaso para la prueba del lunes 19',kind:'guide',mathReview:'all'}, {id:'mtfm01-exponenciales',title:'Actividad tecnológica 1 · Funciones exponenciales',kind:'guide',pdfUrl:'/estudio/fuentes/F37.pdf',mathReview:'exp'}, {id:'mtfm01-bacterias',title:'Modelación 1 · Crecimiento de bacterias',kind:'class',pdfUrl:'/estudio/fuentes/F38.pdf',mathReview:'bacteria'}, {id:'mtfm01-eliminacion',title:'ARPA 1 · Eliminación de fármacos',kind:'exercise',pdfUrl:'/estudio/fuentes/F39.pdf',mathReview:'elimination'},...geoLessons.filter(l=>l.unit===2).map(l=>({id:l.materialId,title:l.title,kind:'guide' as const,pdfUrl:l.source,toolLessonId:l.id})),...academic('s2-5','mtfm01-u2')]},
    {id:'mtfm01-u3',title:'Unidad 3: Funciones trigonométricas',materials:[]},
    {id:'mtfm01-u4',title:'Unidad 4: Sucesiones, vectores y matrices',materials:geoLessons.filter(l=>l.unit===4).map(l=>({id:l.materialId,title:l.title,kind:'exercise' as const,toolLessonId:l.id}))},
  ],unassigned:[]},
  's2-4':{units:[
    {id:'ri-u1',title:'Unidad 1: Fundamentos de redes industriales',materials:[...academic('s2-4','ri-u1'),original('F35','Resumen teórico · apoyo de la clase')]},
    {id:'ri-u2',title:'Unidad 2: Medios y protocolos basados en Ethernet',materials:[]},
    {id:'ri-u3',title:'Unidad 3: Implementación de redes',materials:[]},
  ],unassigned:[]},
};
