import {useState} from 'react';
import {ArrowRight,Cable,ClipboardCheck,Cpu,GraduationCap,PanelTop,Play,Plus,UserRound} from 'lucide-react';
import {CABINET_PROFILES,programmed,slotsFor,type CabinetCheck} from './cabinet';
import type {Board,Cabinet,CabinetStep} from './model';
import '../../styles/cabinet-guidance.css';

function Purpose(){
 const [role,setRole]=useState<'student'|'teacher'>('student');
 return <><div className="cab-role-picker" aria-label="Cómo usarás el taller"><button aria-pressed={role==='student'} onClick={()=>setRole('student')}><UserRound size={16}/>Voy a estudiar</button><button aria-pressed={role==='teacher'} onClick={()=>setRole('teacher')}><GraduationCap size={17}/>Voy a enseñar</button></div>
 <div className="cab-purpose" role="region" aria-label={role==='student'?'Qué aprenderás':'Qué puedes enseñar'}><h3>{role==='student'?'Aprende a montar y hacer funcionar un tablero':'Prepara una práctica que puedas revisar'}</h3><p>{role==='student'?'Recibes un gabinete, sus equipos y el encargo de controlar una bomba. Tú distribuyes, conectas y pruebas la maniobra.':'El estudiante arma un tablero, explica sus conexiones y demuestra su funcionamiento. Puedes revisar el montaje, el programa y las pruebas en el mismo proyecto.'}</p><p className="cab-result"><ClipboardCheck size={18}/>{role==='student'?'Al terminar: una bomba que responde a Marcha y Paro, un proyecto guardado y un informe de lo que comprobaste.':'Para revisar: archivo de proyecto, lista de conexiones, resultados de pruebas y bitácora de correcciones.'}</p></div>
 <div className="cab-learning-route" aria-label="Recorrido de aprendizaje"><div><PanelTop size={23}/><b>1. Montar</b><span>Distribuye los equipos en el espacio asignado.</span></div><ArrowRight size={16}/><div><Cable size={23}/><b>2. Conectar</b><span>Une los bornes siguiendo el encargo.</span></div><ArrowRight size={16}/><div><Play size={23}/><b>3. Probar</b><span>Acciona, observa y corrige una falla.</span></div></div></>;
}

const PROFILE_ORDER:Cabinet['scenario'][]=['pump-plc','pump-direct','pump-relay'];
const PROFILE_COPY:Record<Cabinet['scenario'],{tag?:string;text:string;button:string}>={
 'pump-plc':{tag:'LO HABITUAL EN PLANTA',text:'En una planta, el PLC recibe las señales de pulsadores, sensores y protecciones, y ordena a los contactores. Conecta sus entradas y salidas y escribe la lógica en Ladder o ST.',button:'Comenzar con PLC'},
 'pump-direct':{tag:'BASE · POTENCIA CON CONTACTORES',text:'Comprende marcha, paro y retención con contactores, sin programar. Es la parte de potencia que después comanda el PLC.',button:'Comenzar mando cableado'},
 'pump-relay':{text:'Practica una maniobra con un controlador lógico compacto y su programa.',button:'Comenzar con relé programable'},
};
export function CabinetStart({disabled,onStart}:{disabled:boolean;onStart:(profile:Cabinet['scenario'])=>void}){
 return <section className="cab-welcome cab-start" aria-label="Taller de tableros de control"><span className="cab-eyebrow"><PanelTop size={16}/>TALLER DE TABLEROS DE CONTROL</span><h2>¿Cómo quieres controlar la bomba?</h2><p className="cab-start-intro">Monta los equipos, conecta los bornes y comprueba Marcha y Paro.</p><div className="cab-profile-list">{PROFILE_ORDER.map(id=>{const profile=CABINET_PROFILES.find(p=>p.id===id)!,copy=PROFILE_COPY[id];return <div key={id} className={id==='pump-plc'?'cab-recommended':''}><strong>{id==='pump-plc'?'PLC industrial':profile.name}</strong><p>{id==='pump-plc'?'Cablea las entradas y salidas y programa en Ladder o ST.':id==='pump-direct'?'Practica marcha y retención con contactores, sin programar.':'Controla la maniobra con un relé lógico compacto.'}</p><button className="cab-primary" disabled={disabled} onClick={()=>onStart(id)}><Plus size={16}/>{copy.button}</button></div>;})}</div><small>Se crea un proyecto nuevo. Tu trabajo anterior se conserva en este navegador.</small><details className="cab-start-more"><summary>Qué aprenderás · estudiar o enseñar</summary><Purpose/></details></section>;
}

export function CabinetHelp(){return <section className="cab-start cab-help-content"><Purpose/><h4>Cómo orientarte en la mesa</h4><dl><div><dt>Placa</dt><dd>Interior del gabinete: aquí colocas rieles, canaletas y equipos.</dd></div><div><dt>Puerta</dt><dd>Pulsadores y piloto: los accionas cuando la simulación está activa.</dd></div><div><dt>Campo</dt><dd>Alimentación, motor y permiso de proceso conectados al tablero.</dd></div></dl><p><b>Para operar:</b> pulsa Simular proyecto en la barra superior y después Marcha o Paro sobre los objetos. Detén para editar.</p><p><b>Para consultar la actividad:</b> usa el selector de etapa. Arrastra la cabecera para mover la ventana y la esquina inferior para ajustar su tamaño. Puedes cerrarla y reabrirla desde Actividad.</p><small>Es una simulación educativa. El informe registra comprobaciones virtuales.</small></section>;}

export const GOALS:Record<CabinetStep,{title:string;action:string;result:string}>={
 brief:{title:'Entiende qué debe hacer la bomba',action:'Lee el encargo y responde la pregunta de comprobación.',result:'Sabrás qué orden inicia la marcha y qué condiciones la detienen.'},
 mount:{title:'Arma el interior del gabinete',action:'Prepara los soportes y coloca los equipos. Puedes usar la posición sugerida o distribuirlos tú.',result:'Los equipos deben quedar dentro del área, sobre rieles y sin invadir canaletas.'},
 wire:{title:'Conecta el circuito',action:'Elige un hilo de la lista y localiza sus dos bornes. También puedes tocar los bornes directamente.',result:'Cada conexión debe tener extremos, identificación y recorrido correctos.'},
 program:{title:'Define la lógica del controlador',action:'Carga una guía o escribe el programa. Sigue las entradas y la salida Q0.0.',result:'La salida debe mantener la marcha y respetar paro, térmico y permiso de proceso.'},
 verify:{title:'Encuentra lo que falta por corregir',action:'Revisa cada comprobación pendiente y vuelve a Montar, Cablear o Programar según corresponda.',result:'Todas las comprobaciones deben estar satisfechas antes de la prueba funcional.'},
 test:{title:'Demuestra que el tablero funciona',action:'Ejecuta la prueba funcional. Después inicia la simulación y usa los mandos del tablero.',result:'Comprueba marcha, retención, paro y respuesta a los permisos.'},
 diagnose:{title:'Encuentra y corrige una falla',action:'Elige un reto, observa su síntoma y obtén evidencia antes de corregir.',result:'Cierra el diagnóstico solo cuando la corrección supere la prueba posterior.'},
};
export function CabinetStepGoal({board,step,checks}:{board:Board;step:CabinetStep;checks:CabinetCheck[]}){
 const goal=GOALS[step],count=checks.filter(c=>c.pass).length;
 return <aside className="cab-step-goal" aria-label="Tu tarea en esta etapa"><span>QUÉ HACER AHORA</span><h3>{goal.title}</h3><p>{goal.action}</p><small><b>Resultado esperado:</b> {goal.result}</small><div>{step==='mount'?`${slotsFor(board).length} equipos del encargo`:step==='program'?programmed(board)?'Programa y cableado del mismo proyecto':'Este encargo utiliza mando cableado':`${count} de ${checks.length} comprobaciones satisfechas`}</div><button onClick={()=>document.querySelector('.cab-guide-window .cab-lesson')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}>Ver actividad de esta etapa <ArrowRight size={15}/></button></aside>;
}
