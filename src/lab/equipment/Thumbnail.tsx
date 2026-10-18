import {EquipmentBody} from './Art';
import {defaults,definition,dimensions,type Kind,type Part} from './model';
/** Miniatures use the actual adapted component, including linked multi-pole levers. */
export function EquipmentThumbnail({kind}:{kind:Kind}){
 const d=dimensions(kind),part:Part={id:'thumbnail-'+kind,kind,tag:definition(kind).prefix,x:0,y:0,closed:true,params:defaults(kind)};
 return <svg className="eq-thumbnail" data-equipment-icon={kind} viewBox={`-4 0 ${d.w+8} ${d.h+4}`} width="38" height="42" aria-hidden="true"><EquipmentBody part={part} compact/></svg>;
}
