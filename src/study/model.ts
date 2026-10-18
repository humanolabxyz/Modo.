import lessonData from "./content/lecciones.json";
import bank from "./content/preguntas-publicas.json";
import caseData from "./content/casos_interactivos_7.json";

export const lessons = lessonData.lessons;
export const alternatives = bank.alternatives;
export const developments = bank.developments;
export const cases = caseData.cases;
export const STORAGE_KEY = "panellab:estudio:v1";
export type Screen = "lesson" | "practice" | "exam" | "progress" | "calc";
export type Draft = Record<string, string>;
export type Attempt = {
  id: string;
  topic: string;
  item: string;
  correct: boolean;
  at: string;
};
export type Exam = {
  id: string;
  alternatives: string[];
  developments: string[];
  answers: Record<string, string>;
  index: number;
  stage: "ongoing" | "review" | "submitted";
  started: string;
  submitted?: string;
  self: Record<string, boolean>;
};
export type Progress = {
  started?: boolean;
  attempted?: boolean;
  reviewed?: boolean;
  activity?: boolean;
  correct: string[];
};
export type StudyState = {
  schemaVersion: 1;
  lesson: string;
  screen: Screen;
  examId?: string;
  progress: Record<string, Progress>;
  drafts: Record<string, Draft>;
  practiceAnswers: Record<string, string>;
  attempts: Attempt[];
  exams: Exam[];
};
export const themeFor = (id: string) =>
  id === "objetivos-fallas" ? "fallas" : id;
export const topicFor = (theme: string) =>
  theme === "fallas" ? "objetivos-fallas" : theme;
export const freshState = (): StudyState => ({
  schemaVersion: 1,
  lesson: lessons[0].id,
  screen: "lesson",
  progress: {},
  drafts: {},
  practiceAnswers: {},
  attempts: [],
  exams: [],
});
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown): v is Record<string, string> =>
  obj(v) &&
  Object.values(v).every((x) => typeof x === "string" && x.length <= 20000);
export function readState(raw: unknown): StudyState {
  if (
    !obj(raw) ||
    raw.schemaVersion !== 1 ||
    !lessons.some((l) => l.id === raw.lesson) ||
    !["lesson", "practice", "exam", "progress", "calc"].includes(String(raw.screen)) ||
    !obj(raw.progress) ||
    !obj(raw.drafts) ||
    !strings(raw.practiceAnswers) ||
    !Array.isArray(raw.attempts) ||
    !Array.isArray(raw.exams)
  )
    throw Error("Formato de progreso incompatible.");
  for (const [key, p] of Object.entries(raw.progress))
    if (
      !lessons.some((l) => l.id === key) ||
      !obj(p) ||
      !Array.isArray(p.correct) ||
      !p.correct.every((id) =>
        alternatives.some((q) => q.id === id && q.theme === themeFor(key)),
      ) ||
      ["started", "attempted", "reviewed", "activity"].some(
        (k) => p[k] !== undefined && typeof p[k] !== "boolean",
      )
    )
      throw Error("Progreso de tema inválido.");
  const enums: Record<string, string[]> = {
    curve: ["B", "C", "D"],
    mechanism: ["Térmico", "Magnético"],
    part: ["palanca", "bornes", "etiqueta"],
    fault: ["Sobrecarga", "Cortocircuito"],
    effect: ["arco", "calor", "fuerza"],
    purpose: ["conductores", "semiconductores"],
    plate: ["50 A", "700 V CA/CC", "200 kA"],
    system: ["CA", "CC"],
    range: ["4–6", "6–10"],
  };
  for (const [topic, d] of Object.entries(raw.drafts)) {
    if (!lessons.some((l) => l.id === topic) || !strings(d))
      throw Error("Actividad guardada inválida.");
    for (const [k, v] of Object.entries(d))
      if (
        enums[k] &&
        !(k === "plate" && topic === "guardamotor") &&
        !enums[k].includes(v)
      )
        throw Error("Selector de actividad inválido.");
    if (
      d.scenario &&
      !(
        topic === "objetivos-fallas"
          ? ["normal", "sobrecarga", "corto"]
          : ["transitorio", "fuga"]
      ).includes(d.scenario)
    )
      throw Error("Escenario inválido.");
  }
  for (const [id, value] of Object.entries(raw.practiceAnswers))
    if (
      !alternatives.some((q) => q.id === id) ||
      !["0", "1", "2", "3"].includes(value)
    )
      throw Error("Respuesta de práctica inválida.");
  for (const a of raw.attempts)
    if (
      !obj(a) ||
      typeof a.id !== "string" ||
      typeof a.item !== "string" ||
      !lessons.some((l) => l.id === a.topic) ||
      typeof a.correct !== "boolean" ||
      typeof a.at !== "string"
    )
      throw Error("Intento inválido.");
  for (const e of raw.exams) {
    if (
      !obj(e) ||
      typeof e.id !== "string" ||
      typeof e.started !== "string" ||
      !Array.isArray(e.alternatives) ||
      e.alternatives.length !== 8 ||
      new Set(e.alternatives).size !== 8 ||
      !e.alternatives.every((id) => alternatives.some((q) => q.id === id)) ||
      !Array.isArray(e.developments) ||
      e.developments.length !== 3 ||
      new Set(e.developments).size !== 3 ||
      !e.developments.every((id) => developments.some((q) => q.id === id)) ||
      !strings(e.answers) ||
      !Number.isInteger(e.index) ||
      Number(e.index) < 0 ||
      Number(e.index) > 10 ||
      !["ongoing", "review", "submitted"].includes(String(e.stage)) ||
      !obj(e.self) ||
      !Object.values(e.self).every((v) => typeof v === "boolean") ||
      (e.stage === "submitted" && typeof e.submitted !== "string")
    )
      throw Error("Simulacro guardado inválido.");
    for (const [id, value] of Object.entries(e.answers)) {
      const q = alternatives.find((q) => q.id === id);
      if (
        q
          ? !e.alternatives.includes(id) ||
            !["0", "1", "2", "3"].includes(value)
          : !e.developments.includes(id)
      )
        throw Error("Respuesta inválida.");
    }
  }
  if (
    raw.examId !== undefined &&
    (typeof raw.examId !== "string" ||
      !raw.exams.some((e) => e.id === raw.examId))
  )
    throw Error("Simulacro seleccionado inválido.");
  return raw as unknown as StudyState;
}
export function numberValue(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
export function coordination(load: number, protection: number, cable: number) {
  return load <= protection && protection <= cable;
}
export function cableCapacity(table: number, t: number, g: number) {
  return table * t * g;
}
export function motorCurrent(kw: number, v: number, eta: number, pf: number) {
  return (kw * 1000) / (Math.sqrt(3) * v * eta * pf);
}
export const fmt = (n: number) =>
  n.toLocaleString("es-CL", { maximumFractionDigits: 2 });
export function newExam(previous?: Exam, random = Math.random): Exam {
  const pick = <T extends { id: string }>(all: T[], exclude: string[] = []) => {
    const pool = all.filter((q) => !exclude.includes(q.id));
    const candidates = pool.length ? pool : all;
    return candidates[Math.floor(random() * candidates.length)].id;
  };
  const alt = lessons.map((l) =>
    pick(
      alternatives.filter((q) => q.theme === themeFor(l.id)),
      previous?.alternatives,
    ),
  );
  const pool = developments.filter(
    (q) => !previous?.developments.includes(q.id),
  );
  const shuffled = [...pool]; // Fisher–Yates: unbiased choice without repeated IDs.
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    id: crypto.randomUUID(),
    alternatives: alt,
    developments: shuffled.slice(0, 3).map((q) => q.id),
    answers: {},
    index: 0,
    stage: "ongoing",
    started: new Date().toISOString(),
    self: {},
  };
}
export function lessonStatus(p?: Progress) {
  if (p?.reviewed && p.activity && p.correct.length >= 4) return "Dominada";
  if (p?.attempted || p?.correct.length || p?.activity)
    return "Práctica intentada";
  if (p?.reviewed) return "Revisada";
  if (p?.started) return "Estudiando";
  return "Por estudiar";
}
