import type {LabProject,Tag} from './model';

export const hasCabinetPLC=(project:LabProject)=>!!project.equipment?.cabinet&&project.equipment.cabinet.scenario!=='pump-direct';
const CABINET_SIGNALS:Record<string,string>={
  'I0.0':'Marcha · S1',
  'I0.1':'Paro disponible · S0',
  'I0.2':'Disparo térmico · F1',
  'I0.3':'Permiso de proceso · B1',
  'Q0.0':'Orden de contactor · K1',
};
// Corrige las etiquetas heredadas del ejemplo de tanque sin cambiar direcciones,
// valores ni programas guardados. Los nombres personalizados se conservan.
const DEFAULT_NAMES:Record<string,string[]>={
  'I0.0':['Marcha'],'I0.1':['Paro pulsado'],'I0.2':['Nivel bajo'],
  'I0.3':['Nivel alto'],'Q0.0':['Bomba / marcha'],
};
export function plcTags(project:LabProject):Tag[]{
  if(!hasCabinetPLC(project))return project.plc.tags;
  return project.plc.tags.map(tag=>CABINET_SIGNALS[tag.address]&&DEFAULT_NAMES[tag.address]?.includes(tag.name)
    ?{...tag,name:CABINET_SIGNALS[tag.address]}:tag);
}
export const plcProgramEmpty=(project:LabProject)=>project.plc.language==='ladder'
  ?project.plc.rungs.length===0:!project.plc.source.trim();
