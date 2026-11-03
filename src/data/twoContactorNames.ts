/** Nombres de la lección «Estrella-triángulo · 2 contactores»: los del banco. KT1 es el temporizador neumático (contactor principal y cabezal de retardo), KM1 el módulo «Contactor + relé térmico»
 *  (hace el triángulo) y KM2 el «Contactor trifásico» (hace la estrella). La guía del profesor usa KM1, KM2 y KM3 en otro orden; esta lección conserva los rótulos del banco. */
export type LabelScope='dosContactores';
export const TWO_CONTACTOR_MODULE_NAMES:Record<string,string>={};
/** Bornes del módulo temporizador que pertenecen al cabezal de retardo (KT1) y no al contactor principal (KM1). */
export const TIMER_HEAD_TERMINALS=['55','56','67','68'];
/** Alcance de los nombres según el id de una lección, un perfil de mediciones o un esquema. */
export const labelScopeFor=(id?:string|null):LabelScope|undefined=>id&&/dosContactores|twoContactors/i.test(id)?'dosContactores':undefined;
/** Nombre de un módulo en esta lección, o `undefined` si conserva el del banco. Los bornes 55–56 y 67–68 del temporizador son KT1. */
export function twoContactorModuleName(module:string,terminal=''):string|undefined{
 return TWO_CONTACTOR_MODULE_NAMES[module];
}
