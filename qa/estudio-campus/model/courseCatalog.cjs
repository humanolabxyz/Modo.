"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/study/courseCatalog.ts
var courseCatalog_exports = {};
__export(courseCatalog_exports, {
  availableCourseId: () => availableCourseId,
  courses: () => courses,
  curriculumSource: () => curriculumSource,
  enrolledCourses: () => enrolledCourses,
  normalizeSearch: () => normalizeSearch,
  semesters: () => semesters
});
module.exports = __toCommonJS(courseCatalog_exports);
var curriculumSource = {
  year: 2027,
  url: "https://digital.inacap.cl/pdf_mallas/TECNOLOGIA-APLICADA/AUTOMATIZACION-Y-ROBOTICA/AUTOMATIZACION-Y-ROBOTICA-AR-ARO-2-IR-IRA-2-2026.pdf"
};
var availableCourseId = "s2-2";
var enrolledCourses = [
  { id: "s2-1", code: "AREA02" },
  { id: "s2-4", code: "ARRI02" },
  { id: "s2-2", code: "ARCM02" },
  { id: "s2-6", code: "ATAN01" },
  { id: "s2-5", code: "MTFM01" },
  { id: "s2-3", code: "ARII02" }
];
var semesters = [
  ["Introducci\xF3n a la Automatizaci\xF3n y Rob\xF3tica", "Electricidad Aplicada a la Automatizaci\xF3n", "Seguridad y Riesgos Industriales", "Fundamentos del Mantenimiento para la Automatizaci\xF3n", "Resoluci\xF3n de Problemas en \xC1lgebra", "Formaci\xF3n Ciudadana"],
  ["Electr\xF3nica Aplicada a la Automatizaci\xF3n", "Control de M\xE1quinas El\xE9ctricas Rotativas", "Instrumentaci\xF3n Industrial", "Redes Industriales", "Funciones y Matrices", "Administraci\xF3n"],
  ["Sistemas de Control", "Automatizaci\xF3n Industrial", "Control de Sistemas Electroneum\xE1ticos", "Mantenimiento El\xE9ctrico-Instrumentista", "Programaci\xF3n Orientada a Industrias Digitales", "Ingl\xE9s Inicial"],
  ["Rob\xF3tica Industrial", "Sistemas IOT", "Proyecto Integrado", "Electivo de Tendencias del Sector Productivo y de Servicios I", "Electivo de Tendencias del Sector Productivo y de Servicios II", "Creaci\xF3n de Empresas"],
  ["Programaci\xF3n Avanzada de Controladores", "Algoritmos y Programaci\xF3n Avanzada", "Gesti\xF3n de Personas", "F\xEDsica Mec\xE1nica", "C\xE1lculo Diferencial", "Ingl\xE9s Habilitante"],
  ["Inteligencia Artificial", "Termodin\xE1mica y Mec\xE1nica de Fluidos", "Integraci\xF3n de Redes Industriales", "Finanzas", "C\xE1lculo Integral", "Ingl\xE9s Intermedio"],
  ["Rob\xF3tica M\xF3vil", "Integraci\xF3n de Sistemas Industriales Robotizados", "Sistema de Control Avanzado", "Electivo de Tendencias del Sector Productivo y de Servicios III", "Formulaci\xF3n y Gesti\xF3n de Proyectos", "Innovaci\xF3n en Productos y Servicios"],
  ["Plataformas SCADA", "Sistemas de Control Distribuido", "Proyecto de T\xEDtulo Profesional", "Electivo de Tendencias del Sector Productivo y de Servicios IV", "Electivo de Tendencias del Sector Productivo y de Servicios V", "Oportunidades en Negocios Innovadores"]
];
var courses = semesters.flatMap((names, semester) => names.map((title, index) => ({
  id: `s${semester + 1}-${index + 1}`,
  title,
  semester: semester + 1,
  available: [`${availableCourseId}`, "s2-5", "s2-3"].includes(`s${semester + 1}-${index + 1}`)
})));
var normalizeSearch = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  availableCourseId,
  courses,
  curriculumSource,
  enrolledCourses,
  normalizeSearch,
  semesters
});
