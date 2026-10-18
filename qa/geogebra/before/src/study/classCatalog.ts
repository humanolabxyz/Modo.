import { lessons } from "./model";

export type ClassMaterial = {
  id: string;
  title: string;
  kind: "class" | "exercise" | "guide";
  pdfUrl?: string;
  topicIds?: string[];
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
};
