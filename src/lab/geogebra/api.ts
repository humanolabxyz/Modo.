import type {GeoCheck} from '../../learning/geogebraLessons';
export type GeoGebraAPI={evalCommand:(command:string)=>boolean;exists:(name:string)=>boolean;isDefined:(name:string)=>boolean;getValue:(name:string)=>number;getValueString:(name:string,localized?:boolean)=>string;getObjectType:(name:string)=>string;getAllObjectNames:()=>string[];getXML:()=>string;setXML:(xml:string)=>void;getBase64:(callback:(value:string)=>void)=>void;setBase64:(value:string,callback?:()=>void)=>void;deleteObject:(name:string)=>void;setVisible:(name:string,visible:boolean)=>void;setAuxiliary:(name:string,auxiliary:boolean)=>void;setSize:(width:number,height:number)=>void;setPerspective:(perspective:string)=>void;setCoordSystem:(xmin:number,xmax:number,ymin:number,ymax:number)=>void;showToolBar:(show:boolean)=>void;showAlgebraInput:(show:boolean)=>void;registerClientListener:(fn:()=>void)=>void;unregisterClientListener:(fn:()=>void)=>void;registerAddListener:(fn:()=>void)=>void;unregisterAddListener:(fn:()=>void)=>void;registerUpdateListener:(fn:()=>void)=>void;unregisterUpdateListener:(fn:()=>void)=>void;registerRemoveListener:(fn:()=>void)=>void;unregisterRemoveListener:(fn:()=>void)=>void;registerClearListener:(fn:()=>void)=>void;unregisterClearListener:(fn:()=>void)=>void;remove:()=>void};
type Constructor=new (parameters:Record<string,unknown>,html5?:boolean)=>{inject:(element:HTMLElement)=>void;setHTML5Codebase:(url:string,offline?:boolean)=>void};
declare global {interface Window {GGBApplet?:Constructor}}
const loading=new WeakMap<Document,Promise<Constructor>>();
export function loadGeoGebra(target:Window):Promise<Constructor>{
  if(target.GGBApplet)return Promise.resolve(target.GGBApplet);
  const pending=loading.get(target.document);if(pending)return pending;
  const promise=new Promise<Constructor>((resolve,reject)=>{
    const script=target.document.createElement('script');script.src='/vendor/geogebra/deployggb.js';script.async=true;
    const timeout=window.setTimeout(()=>fail(),25000);
    const fail=()=>{clearTimeout(timeout);script.remove();loading.delete(target.document);reject(new Error('No se pudo cargar la copia local de GeoGebra. Abre «Sin conexión» y comprueba la preparación del viaje.'));};
    script.onerror=fail;script.onload=()=>{clearTimeout(timeout);if(target.GGBApplet)resolve(target.GGBApplet);else fail();};target.document.head.appendChild(script);
  });loading.set(target.document,promise);return promise;
}
/** Solo evalúa condiciones definidas en el catálogo local. No inserta respuestas. */
export function verifyGeoStep(api:GeoGebraAPI,check:GeoCheck):boolean {
  if(check.objects.some(name=>!api.exists(name)||!api.isDefined(name)))return false;
  let name=`modoCheck${Date.now()}`;while(api.exists(name))name+='a';
  try {if(!api.evalCommand(`${name}=(${check.expression})`))return false;return api.getObjectType(name)==='boolean'&&api.isDefined(name)&&api.getValue(name)===1;}
  finally {if(api.exists(name))api.deleteObject(name);}
}

/** View commands do not create objects and evalCommand may return false after applying them. */
export function executeGeoCommand(api:GeoGebraAPI,command:string):boolean{
  const zoom=command.trim().match(/^ZoomIn\(\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*\)$/i);
  if(zoom){const [xmin,ymin,xmax,ymax]=zoom.slice(1).map(Number);if(![xmin,ymin,xmax,ymax].every(Number.isFinite)||xmin>=xmax||ymin>=ymax)return false;api.setCoordSystem(xmin,xmax,ymin,ymax);return true;}
  return api.evalCommand(command);
}
