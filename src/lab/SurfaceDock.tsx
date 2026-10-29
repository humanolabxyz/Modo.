import {Redo2,Undo2,MousePointer2,Hand} from 'lucide-react';
import type {DockItem} from './CanvasControls';
import type {Laboratory} from './useLaboratory';
/** Deshacer y rehacer, comunes a todas las barras flotantes de las superficies de trabajo (Esquemas, PLC, HMI y Procesos).
 *  Los atajos Ctrl+Z / Ctrl+Y los escucha LaboratoryApp para estas herramientas; la protoboard tiene los suyos. */
export const historyDock=(lab:Laboratory):DockItem[]=>[
  {id:'undo',label:'Deshacer',shortcut:'Ctrl+Z',icon:<Undo2 size={20}/>,disabled:!lab.canUndo||lab.running,onClick:lab.undo},
  {id:'redo',label:'Rehacer',shortcut:'Ctrl+Y',icon:<Redo2 size={20}/>,disabled:!lab.canRedo||lab.running,onClick:lab.redo},
];

/** La selección y la mano tienen el mismo significado en cada pizarra. */
export const navigationDock=(pan:boolean,setPan:(pan:boolean)=>void):DockItem[]=>[
 {id:'select',label:'Seleccionar y mover',icon:<MousePointer2 size={20}/>,pressed:!pan,onClick:()=>setPan(false)},
 {id:'pan',label:'Desplazar pizarra',icon:<Hand size={20}/>,pressed:pan,onClick:()=>setPan(true)},
 'separator',
];
