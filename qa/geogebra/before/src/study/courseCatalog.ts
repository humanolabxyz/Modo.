// Referencia contrastada visualmente con la página 3 del PDF consultado el
// 17/10/2026. Aunque su URL termina en 2026, el documento vigente dice 2027.
// Los nombres de la malla no implican que existan lecciones de esos ramos.
export const curriculumSource = {
  year: 2027,
  url: "https://digital.inacap.cl/pdf_mallas/TECNOLOGIA-APLICADA/AUTOMATIZACION-Y-ROBOTICA/AUTOMATIZACION-Y-ROBOTICA-AR-ARO-2-IR-IRA-2-2026.pdf",
};
export const availableCourseId = "s2-2";
// Ramos y códigos visibles en la captura del aula del usuario (17/10/2026).
// No se importan los porcentajes académicos del sistema externo.
export const enrolledCourses = [
  { id: "s2-1", code: "AREA02" },
  { id: "s2-4", code: "ARRI02" },
  { id: "s2-2", code: "ARCM02" },
  { id: "s2-6", code: "ATAN01" },
  { id: "s2-5", code: "MTFM01" },
  { id: "s2-3", code: "ARII02" },
];
export const semesters = [
  ["Introducción a la Automatización y Robótica", "Electricidad Aplicada a la Automatización", "Seguridad y Riesgos Industriales", "Fundamentos del Mantenimiento para la Automatización", "Resolución de Problemas en Álgebra", "Formación Ciudadana"],
  ["Electrónica Aplicada a la Automatización", "Control de Máquinas Eléctricas Rotativas", "Instrumentación Industrial", "Redes Industriales", "Funciones y Matrices", "Administración"],
  ["Sistemas de Control", "Automatización Industrial", "Control de Sistemas Electroneumáticos", "Mantenimiento Eléctrico-Instrumentista", "Programación Orientada a Industrias Digitales", "Inglés Inicial"],
  ["Robótica Industrial", "Sistemas IOT", "Proyecto Integrado", "Electivo de Tendencias del Sector Productivo y de Servicios I", "Electivo de Tendencias del Sector Productivo y de Servicios II", "Creación de Empresas"],
  ["Programación Avanzada de Controladores", "Algoritmos y Programación Avanzada", "Gestión de Personas", "Física Mecánica", "Cálculo Diferencial", "Inglés Habilitante"],
  ["Inteligencia Artificial", "Termodinámica y Mecánica de Fluidos", "Integración de Redes Industriales", "Finanzas", "Cálculo Integral", "Inglés Intermedio"],
  ["Robótica Móvil", "Integración de Sistemas Industriales Robotizados", "Sistema de Control Avanzado", "Electivo de Tendencias del Sector Productivo y de Servicios III", "Formulación y Gestión de Proyectos", "Innovación en Productos y Servicios"],
  ["Plataformas SCADA", "Sistemas de Control Distribuido", "Proyecto de Título Profesional", "Electivo de Tendencias del Sector Productivo y de Servicios IV", "Electivo de Tendencias del Sector Productivo y de Servicios V", "Oportunidades en Negocios Innovadores"],
];
export const courses = semesters.flatMap((names, semester) => names.map((title, index) => ({
  id: `s${semester + 1}-${index + 1}`, title, semester: semester + 1,
  available: `s${semester + 1}-${index + 1}` === availableCourseId,
})));
export const normalizeSearch = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
