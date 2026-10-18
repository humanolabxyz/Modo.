/** Cable topology and user-reviewed study material. No device behavior is inferred. */
export type TerminalId = string; // Existing stable MODULE:TERMINAL keys, including S2:3.
export type Point = {x:number;y:number};
export type BananaEndpoint = {terminalId:TerminalId;stackOffset?:Point;connectorId?:string};
export type BananaCable = {
 id:string;from:BananaEndpoint;to:BananaEndpoint;color:string;
 route?:{fromOffset?:Point;toOffset?:Point;sag?:number};layer:number;
};
export type ConnectorSpecification = {
 id:string;stackable:boolean|'unverified';capacity:number|null;
}; // null = unknown physical capacity, never an arbitrary software limit.
export type AssistanceLevel = 1|2|3;
export type DiagramSegment = {id:string;path:string;componentIds:string[];terminalIds:TerminalId[]};
export type ExerciseStep = {
 id:string;segmentIds:string[];componentIds:string[];terminalIds:TerminalId[];
 acceptedConnections:Array<{from:TerminalId;to:TerminalId}>;explanation:string;
};
export type ReviewedExercise = {
 id:string;title:string;diagramAsset:string;review:'pending'|'teacher_verified';
 segments:DiagramSegment[];steps:ExerciseStep[];
};
export const BANANA_COLOR='#145650';
export const CONNECTOR_PENDING:ConnectorSpecification={id:'laboratorio-pendiente',stackable:'unverified',capacity:null};
export type StudyMode='explore'|'free'|'identify'|'guided';
export type DiagramRegion={x:number;y:number;w:number;h:number}; // 0..1000 normalized image coordinates.
export type DiagramReference={id:string;name:string;src:string;origin:'class_photo'|'user_image'};
export type ManualStep={id:string;title:string;from:TerminalId;to:TerminalId;region:DiagramRegion;path?:Point[];explanation:string;review:'user_reviewed'};
export type PracticeArchive={wires:BananaCable[];steps:ManualStep[];bindings:Record<string,string>};
export type PracticeDocument={version:2;title:string;wires:BananaCable[];diagram:DiagramReference|null;steps:ManualStep[];mode:StudyMode;stepIndex:number;learning?:import('./learning').LearningState;archive?:PracticeArchive};
export const CLASS_DIAGRAMS:DiagramReference[]=[1,2,3].map(n=>({id:`clase-${n}`,name:`Fotografía de clase ${n} · referencia sin validar`,src:`/diagrams/clase-${n}.jpg`,origin:'class_photo'}));
export const emptyPractice=():PracticeDocument=>({version:2,title:'Mi práctica INACAP',wires:[],diagram:CLASS_DIAGRAMS[0],steps:[],mode:'free',stepIndex:0});
export const IDENTIFICATION_STEPS=[
 {terminalId:'CONTACTOR_TERMICO:95',title:'Encuentra el borne 95',explanation:'La foto muestra 95 junto a 96 en el módulo con relé térmico. En el panel se representa gris NC según tu aclaración: normalmente cerrado en reposo.'},
 {terminalId:'CONTACTOR_TERMICO:96',title:'Encuentra su pareja: 96',explanation:'96 está a la derecha de 95 en la misma franja. Reconocer la pareja no equivale a unirla con un cable.'},
 {terminalId:'CONTACTOR_TERMICO:97',title:'Localiza el borne 97',explanation:'97 inicia la última fila azul de la columna derecha del módulo térmico; 98 está a su derecha.'},
 {terminalId:'CONTACTOR_TRIFASICO:A1',title:'Distingue A1 en el contactor trifásico',explanation:'A1 aparece en crema bajo A2. El ID del módulo evita confundirlo con la bobina de otro dispositivo.'},
 {terminalId:'BOTONERAS:S3:3',title:'Busca el borne 3 del pulsador derecho',explanation:'En el pulsador derecho, la columna crema 3–4 queda a la izquierda de la columna roja 1–2.'},
 {terminalId:'TEMPORIZADOR_1:55',title:'Reconoce 55 en el temporizador 1',explanation:'55 y 56 son el par negro a la izquierda del mecanismo. El tipo de retardo no está confirmado.'},
 {terminalId:'TEMPORIZADOR_1:68',title:'Reconoce 68 en el temporizador',explanation:'68 es el borne derecho del par azul 67–68 del único temporizador.'},
 {terminalId:'BORNERA_MOTOR:U2',title:'Encuentra U2 en el motor',explanation:'La fila inferior es W2, U2, V2: U2 es azul y ocupa la posición central.'},
 {terminalId:'FUENTE:TP',title:'Distingue tierra de protección',explanation:'TP es verde en el extremo inferior derecho de la fuente. N y TP no se unen por presunción.'}
];
