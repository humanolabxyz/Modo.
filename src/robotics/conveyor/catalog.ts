import type {ComponentDefinition} from '../catalog/types.ts';
import {CONVEYOR_ID} from './constants.ts';
export const conveyorDefinition: ComponentDefinition = {
  id:CONVEYOR_ID,name:'Cinta transportadora · célula educativa',category:'actuator',
  dimensions:[.16,.08,.72],dimensionsSource:'approximate',massKg:1.2,
  pins:[],anchors:[],scalable:false,model:'procedural',
  props:[
    {id:'speedMps',label:'Velocidad de cinta (m/s)',type:'number',min:.02,max:.12,default:.08},
    {id:'jammed',label:'Falla: cinta atascada',type:'boolean',default:false},
    {id:'sensorFault',label:'Falla: sensor no detecta',type:'boolean',default:false},
  ],
  summary:'Banda de 720 mm, rodillos, sensor de presencia y lectura RGB didácticos. Transporte y clasificación coordinados con el E6; control por secuencia, sin conexión eléctrica ni hardware real.',
  keywords:['cinta','transportadora','banda','linea','clasificacion','color','sensor','produccion'],
};
