import type {ComponentDefinition} from './types.ts';
/** Metres, +Z forward. These practice shapes are shared by rendering and convex collision. */
export type CombatHull = {vertices: number[]; massFraction: number};
const prism = (width: number, yz: [number, number][], x = 0, massFraction = 1): CombatHull => ({vertices: [-1, 1].flatMap(sign => yz.flatMap(([y, z]) => [x + sign * width / 2, y, z])), massFraction});
const box = (w: number, h: number, d: number, at: [number, number, number], fraction: number) => prism(w, [[at[1]-h/2,at[2]-d/2],[at[1]+h/2,at[2]-d/2],[at[1]+h/2,at[2]+d/2],[at[1]-h/2,at[2]+d/2]], at[0], fraction);
const shapes: Record<string, CombatHull[]> = {
  'sumo-wedge': [prism(.18, [[-.02,-.0375],[.02,-.0375],[-.018,.0375],[-.02,.0375]])],
  'sumo-scoop': [
    prism(.20, [[-.0225,-.035],[-.0145,-.035],[-.0195,.055],[-.0225,.055]],0,.40),
    box(.20,.045,.003,[0,0,-.0335],.22),
    prism(.003,[[-.0225,-.035],[.0225,-.035],[-.01,.055],[-.0225,.055]],-.0985,.15),
    prism(.003,[[-.0225,-.035],[.0225,-.035],[-.01,.055],[-.0225,.055]],.0985,.15),
    box(.012,.004,.020,[-.05,.0175,-.045],.04),
    box(.012,.004,.020,[.05,.0175,-.045],.04),
  ],
  'sumo-bumper': [box(.20,.065,.018,[0,0,0],1)],
};
export const combatHulls = (id: string): readonly CombatHull[] | undefined => shapes[id];
export const COMBAT_COLORS: Record<string, string> = {'sumo-wedge':'#aab6c4','sumo-scoop':'#df9a37','sumo-bumper':'#356f9d'};
export const COMBAT_DEFINITIONS: ComponentDefinition[] = [
  {id:'sumo-wedge',name:'Cuña de sumo',dimensions:[.18,.04,.075],massKg:.065,mountY:.02,summary:'Rampa fija de perfil bajo para entrar bajo el rival y empujarlo. Modelo didáctico de 180 × 40 × 75 mm.',keywords:['cuña','pala','sumo','rampa','empujar','combate','blade']},
  {id:'sumo-scoop',name:'Pala empujadora',dimensions:[.20,.045,.11],massKg:.10,mountY:.0175,summary:'Pala fija con base inclinada, respaldo, laterales y pestañas de montaje. Modelo didáctico de 200 × 45 × 110 mm; sin mecanismo de elevación.',keywords:['pala','cuchara','bulldozer','empujar','sumo','combate','scoop']},
  {id:'sumo-bumper',name:'Defensa frontal ancha',dimensions:[.20,.065,.018],massKg:.09,mountY:.0075,summary:'Escudo fijo vertical para empujar y proteger el frente. Modelo didáctico de 200 × 65 × 18 mm.',keywords:['defensa','escudo','parachoques','empujar','sumo','combate']},
].map(d => ({...d, dimensions:d.dimensions as [number,number,number], category:'structure',dimensionsSource:'approximate',pins:[],anchors:[{id:'back',label:'Fijación posterior',position:[0,d.mountY,-d.dimensions[2]/2],normal:[0,0,-1],tag:'combat-mount',accepts:[]}],scalable:false,model:'procedural'}));
