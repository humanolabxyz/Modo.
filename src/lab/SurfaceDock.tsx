import {Redo2,Undo2} from 'lucide-react';
import type {DockItem} from './CanvasControls';
import type {Laboratory} from './useLaboratory';
/** Deshacer y rehacer, comunes a todas las barras flotantes de las superficies de trabajo (Esquemas, PLC, HMI y Procesos).
 *  Los atajos Ctrl+Z / Ctrl+Y los escucha LaboratoryApp para estas herramientas; la protoboard tiene los suyos. */
export const historyDock=(lab:Laboratory):DockItem[]=>[
  {id:'undo',label:'Deshacer',shortcut:'Ctrl+Z',icon:<Undo2 size={20}/>,disabled:!lab.canUndo||lab.running,onClick:lab.undo},
  {id:'redo',label:'Rehacer',shortcut:'Ctrl+Y',icon:<Redo2 size={20}/>,disabled:!lab.canRedo||lab.running,onClick:lab.redo},
];
