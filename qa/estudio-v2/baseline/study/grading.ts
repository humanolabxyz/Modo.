import alt from "./content/preguntas_alternativas_32.json";
import dev from "./content/preguntas_desarrollo_12.json";
export const answerBank = alt.questions;
export const developmentBank = dev.questions;
export function gradeAlternative(id: string, answer: string) {
  const q = answerBank.find((q) => q.id === id);
  return !!q && answer === String(q.correct_index);
}
