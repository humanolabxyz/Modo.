export function StudyActivityProgress({value,total,reviewed}:{value:number;total:number;reviewed:boolean}){
 return <div className="study-activity-progress"><span>{value}/{total} actividades comprobadas{reviewed?' · concepto revisado':''}</span><progress aria-label="Avance de la actividad" value={value} max={total}/><small>Guardado en este navegador</small></div>;
}
