import { lessons } from "./model";
import {geoLessons} from '../learning/geogebraLessons';
import {temperatureLessons} from '../learning/temperatureLessons';
import {detectorLessons} from '../learning/detectorLessons';
import {REVIEW_ID,REVIEW_MATERIAL} from '../learning/temperatureReview';

export type ClassMaterial = {
  id: string;
  title: string;
  kind: "class" | "exercise" | "guide";
  pdfUrl?: string;
  topicIds?: string[];
  toolLessonId?: string;
  tempLessonId?: string;
  detLessonId?: string;
};
export type LearningUnit = { id: string; title: string; materials: ClassMaterial[] };
export type CourseOutlineData = { units: LearningUnit[]; unassigned: ClassMaterial[] };

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
          ...Array.from({ length: 5 }, (_, index): ClassMaterial => ({ id: `area02-u1-clase-${index + 1}`, title: `Clase ${index + 1}`, kind: "class" })),
          { id: "area02-u1-ejercicio-1", title: "Ejercicio 1", kind: "exercise" },
          { id: "area02-u1-guia-1", title: "Guía 1", kind: "guide" },
        ],
      },
      { id: "area02-u2", title: "Unidad 2: Fundamentos de Electrónica Digital", materials: [] },
      { id: "area02-u3", title: "Unidad 3: Introducción a Electrónica de Potencia", materials: [] },
    ],
    unassigned: [],
  },
  "s2-2": { units: [], unassigned: [protectionClass] },
  // Unidades según la captura del aula. Tienen lección G01, G02 y G03; las conferencias y demás guías siguen pendientes.
  "s2-3": {units:[
    {id:'ii-u1',title:'Unidad 1: Clasificación y características de la instrumentación',materials:[]},
    {id:'ii-u2',title:'Unidad 2: Medición y actuación discreta y analógica',materials:[...detectorLessons.map(l=>({id:l.materialId,title:l.title,kind:'guide' as const,pdfUrl:l.source,detLessonId:l.id})),...temperatureLessons.map(l=>({id:l.materialId,title:l.title,kind:'guide' as const,pdfUrl:l.source,tempLessonId:l.id})),{id:REVIEW_MATERIAL,title:'Temperatura · Repaso de la guía G03',kind:'guide' as const,tempLessonId:REVIEW_ID}]},
    {id:'ii-u3',title:'Unidad 3: Interpretación de instrumentación y control',materials:[]},
  ],unassigned:[]},
  "s2-5": {units:[
    {id:'mtfm01-u1',title:'Unidad 1: Funciones polinómicas',materials:geoLessons.filter(l=>l.unit===1).map(l=>({id:l.materialId,title:l.title,kind:'guide',pdfUrl:l.source,toolLessonId:l.id}))},
    {id:'mtfm01-u2',title:'Unidad 2: Funciones exponenciales y logarítmicas',materials:geoLessons.filter(l=>l.unit===2).map(l=>({id:l.materialId,title:l.title,kind:'guide',pdfUrl:l.source,toolLessonId:l.id}))},
    {id:'mtfm01-u3',title:'Unidad 3: Funciones trigonométricas',materials:[]},
    {id:'mtfm01-u4',title:'Unidad 4: Sucesiones, vectores y matrices',materials:[]},
  ],unassigned:[]},
};
