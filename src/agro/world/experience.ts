import type {ExperienceMode} from '../model/types.ts';
/** Solo cambia las reglas de la partida: geometría, reloj y motores compartidos. */
export type ExperiencePolicy=Readonly<{
 id:ExperienceMode;label:string;description:string;
 inventory:boolean;chargeCosts:boolean;constructionTime:boolean;guidedChecks:boolean;
}>;
const policy=(p:ExperiencePolicy)=>Object.freeze(p);
export const EXPERIENCE_POLICIES:Readonly<Record<ExperienceMode,ExperiencePolicy>>=Object.freeze({
 learning:policy({id:'learning',label:'Aprendizaje',description:'Construcción inmediata y pistas para revisar tu finca.',inventory:false,chargeCosts:false,constructionTime:false,guidedChecks:true}),
 free:policy({id:'free',label:'Construcción libre',description:'Piezas disponibles al instante, sin costos ni tiempos de obra.',inventory:false,chargeCosts:false,constructionTime:false,guidedChecks:false}),
 real:policy({id:'real',label:'Entorno real',description:'Inventario, compras, plazos de entrega y montaje del escenario.',inventory:true,chargeCosts:true,constructionTime:true,guidedChecks:false}),
});
export const experiencePolicy=(mode:ExperienceMode):ExperiencePolicy=>EXPERIENCE_POLICIES[mode];
