import type {Ficha} from './physics';
/** Fichas de los equipos del banco de detectores. Hay fichas genéricas por tipo de equipo y una ficha por cada modelo de la guía G02
 *  (CR30-15DN, CR30-15DP, XS118BLPAL2 y BR100-DDT-P) con datos del fabricante y fuentes enlazadas. Lo que no se encontró en una fuente
 *  aparece en «pendiente»: no se inventan datos. Los listados de distribuidores no sustituyen la ficha oficial. */
export type SheetId='psu'|'inductive'|'capacitive'|'photo'|'target'|'plc'|'dmm'|'CR30-15DN'|'CR30-15DP'|'XS118BLPAL2'|'BR100-DDT-P';
export type Datasheet={id:SheetId;title:string;kind:string;look:string;rows:[string,string][];bench:string[];pending:string[];sources:{label:string;url:string}[];/** Datos que «Usar los datos de la ficha citada» copia a la ficha del estudiante. */fill?:Ficha};
export const SHEET_NOTE='Fichas por tipo de equipo y de los cuatro modelos de la guía G02, con datos de fabricantes y normas. Lo que no se encontró está marcado pendiente. Confirma siempre con la ficha oficial y con los equipos de tu sala.';
const AUTONICS_CR={label:'Autonics · catálogo de la serie CR (CR18-8 y CR30-15), PDF',url:'https://static.chipdip.ru/lib/112/DOC038112902.pdf'};
const SCHNEIDER={label:'Telemecanique Sensors · XS118BLPAL2, página del producto',url:'https://www.telemecaniquesensors.com/in/en/product/reference/XS118BLPAL2'};
const SCHNEIDER_PDF={label:'Telemecanique Sensors · XS118BLPAL2, hoja de datos (PDF)',url:'https://downloads.telemecaniquesensors.com/dam/datasheets/en/XS118BLPAL2_EN.pdf'};
const DELTA={label:'Delta · hoja de instrucciones DVP-SS2 (PDF)',url:'https://deltaacdrives.com/Accessories/Delta-DVP-SS2-Series-Standard-Slim-PLC-Instruction-Sheet.pdf'};
const PENDING_BR=['Colores y cantidad exacta de hilos: un distribuidor indica cable de 4 hilos con un hilo de control (Light ON / Dark ON), pero ninguna fuente consultada da su código de colores. Consulta el manual de Autonics.','Ficha oficial de Autonics: los datos de abajo vienen de listados de distribuidores y no se pudieron contrastar con ella. Radwell lista el modelo como descontinuado.'];
export const DATASHEETS:Datasheet[]=[
  {id:'CR30-15DN',title:'CR30-15DN (G02)',kind:'Autonics · detector capacitivo M30 · salida NPN normalmente abierta',
    look:'Cilindro roscado M30 de latón niquelado, con dos tuercas, cara sensible de plástico (PBT) y LED rojo de operación. Cable negro de 3 hilos y 2 m: marrón (+V), azul (0 V) y negro (salida).',
    rows:[['Tipo','Capacitivo (la «C» del código). Aunque la guía lo trata entre los detectores de proximidad, no es inductivo: puede detectar materiales no metálicos.'],['Código','CR · cilíndrico · C capacitivo · 30 mm de cabeza · 15 mm de distancia · D 12–24 V DC · N salida NPN normalmente abierta'],['Distancia de detección','15 mm con el objeto estándar de hierro de 50 × 50 × 1 mm; distancia de ajuste de 0 a 10,5 mm; histéresis máx. 20 % de la distancia'],['Alimentación','12–24 V DC (rango 10–30 V DC); consumo máx. 15 mA'],['Salida','NPN colector abierto, hasta 200 mA; tensión residual máx. 1,5 V. Carga entre marrón y negro.'],['Hilos','Marrón +V · azul 0 V · negro salida (cable de Ø5 mm, 3 hilos, 2 m)'],['Protecciones','Contra inversión de polaridad y sobretensiones; protección IP65'],['Ajuste','Potenciómetro de sensibilidad (15 ± 3 vueltas); se ajusta con el objeto en su posición.']],
    bench:['El banco lo simula como detector capacitivo de 3 hilos, NPN, con alcance de 15 mm: detecta metal y plástico dentro del alcance.','Usa la tarjeta «Fichas» para copiar estos datos a tu ficha con un botón.','No modela histéresis, ajuste de sensibilidad ni la tensión residual.'],
    pending:['Capacitancia y material mínimo detectable: el catálogo solo da el objeto estándar de hierro; el alcance con plástico depende del material y no se modela.'],
    sources:[AUTONICS_CR,{label:'Farnell · CR30-15DP (listado)',url:'https://export.farnell.com/autonics/cr30-15dp/capacitive-proximity-sensor/dp/1736834'}],
    fill:{brand:'Autonics',wires:'3',principle:'capacitive',output:'npn',supply:'12–24 V DC (10–30 V)',range:'15'}},
  {id:'CR30-15DP',title:'CR30-15DP (G02)',kind:'Autonics · detector capacitivo M30 · salida PNP normalmente abierta',
    look:'Igual que el CR30-15DN: cilindro roscado M30 de latón niquelado con dos tuercas, cara de plástico y LED rojo; cable de 3 hilos y 2 m con marrón (+V), azul (0 V) y negro (salida).',
    rows:[['Tipo','Capacitivo, como el CR30-15DN (no es inductivo). Solo cambia la salida.'],['Código','…D 12–24 V DC · P salida PNP normalmente abierta'],['Distancia de detección','15 mm con el objeto estándar de hierro de 50 × 50 × 1 mm; histéresis máx. 20 %'],['Alimentación','12–24 V DC (10–30 V DC); consumo máx. 15 mA'],['Salida','PNP colector abierto, hasta 200 mA. Carga entre negro y azul.'],['Hilos','Marrón +V · azul 0 V · negro salida (Ø5 mm, 3 hilos, 2 m)'],['Protecciones','Contra inversión de polaridad y sobretensiones; protección IP65']],
    bench:['Simulado como capacitivo PNP de 15 mm. Con un PLC de entrada sink/source, la entrada debe ser compatible con salida PNP.','Usa la tarjeta «Fichas» para copiar estos datos a tu ficha.'],
    pending:['Los mismos pendientes del CR30-15DN.'],
    sources:[AUTONICS_CR,{label:'Farnell · CR30-15DP (listado)',url:'https://export.farnell.com/autonics/cr30-15dp/capacitive-proximity-sensor/dp/1736834'}],
    fill:{brand:'Autonics',wires:'3',principle:'capacitive',output:'pnp',supply:'12–24 V DC (10–30 V)',range:'15'}},
  {id:'XS118BLPAL2',title:'XS118BLPAL2 (G02)',kind:'Telemecanique Sensors · detector inductivo M18 · salida PNP normalmente abierta',
    look:'Cilindro roscado M18 × 1 de latón niquelado, de 53 mm de largo, con cara frontal de PBT enrasable, un LED amarillo de estado y cable de PVC de 2 m con 3 hilos: marrón (BN), azul (BU) y negro (BK).',
    rows:[['Tipo','Inductivo, serie XS1 de uso general. Detecta metales.'],['Distancia nominal Sn','5 mm; zona de trabajo 0…4 mm; diferencial 1…15 % de Sr; objeto de acero de 18 × 18 × 1 mm'],['Alimentación','12…24 V DC con protección contra inversión (límites 10…36 V DC); consumo ≤ 10 mA sin carga'],['Salida','1 NO · PNP · ≤ 200 mA con protección contra sobrecarga y cortocircuito; caída de tensión < 2 V'],['Hilos','BN marrón · BU azul · BK negro (esquema PNP de la ficha); cable 3 × 0,14 mm²'],['Frecuencia','≤ 1200 Hz'],['Protección','IP67 (IEC 60529); montaje enrasable'],['Indicador','1 LED amarillo: estado de la salida']],
    bench:['Simulado como inductivo PNP de 5 mm: detecta solo metal dentro del alcance.','Los hilos del dibujo siguen esta ficha.','No modela la zona de trabajo 0…4 mm ni la caída de tensión.'],
    pending:['La ficha da el esquema como imagen: confirma en el PDF qué hilo va a qué función en tu montaje.'],
    sources:[SCHNEIDER,SCHNEIDER_PDF],
    fill:{brand:'Telemecanique Sensors',wires:'3',principle:'inductive',output:'pnp',supply:'12…24 V DC (10…36 V)',range:'5'}},
  {id:'BR100-DDT-P',title:'BR100-DDT-P (G02)',kind:'Autonics · detector fotoeléctrico de reflexión difusa · salida PNP',
    look:'Cilindro roscado de Ø18 mm de latón niquelado con una lente en la cara frontal, indicador luminoso y ajuste externo de sensibilidad; cable de 2 m.',
    rows:[['Tipo','Fotoeléctrico de reflexión difusa: emite luz y detecta la que devuelve el objeto, opaco o translúcido.'],['Distancia de detección','100 mm'],['Fuente de luz','LED infrarrojo de 940 nm'],['Alimentación','12–24 V DC ±10 %; consumo máx. 45 mA'],['Salida','PNP colector abierto, hasta 200 mA y 30 V DC; protección contra inversión de polaridad y cortocircuito de la salida'],['Respuesta','máx. 1 ms'],['Modo','Light ON / Dark ON conmutable por un hilo de control; ajuste externo de sensibilidad'],['Protección','IP66; cuerpo de latón niquelado']],
    bench:['Simulado como fotoeléctrico PNP de 100 mm, con la ficha que copies: detecta metal y plástico dentro del alcance. Se ignora el hilo de control: queda el modo normal de detección.','Los hilos del dibujo se muestran grises: su color está pendiente.'],
    pending:PENDING_BR,
    sources:[{label:'Remtron · BR100-DDT-P (distribuidor)',url:'https://shop.remtron.com.au/products/BR100-DDT-P'},{label:'Radwell · BR100-DDT-P (distribuidor)',url:'https://www.radwell.com/Buy/AUTONICS/AUTONICS/BR100-DDT-P'},{label:'TEquipment · Autonics BR100-DDT (listado de la serie)',url:'https://www.tequipment.net/Autonics/BR100-DDT/Photoelectric-/-Proximity-/-Fiber-Optic-Sensors/'}],
    fill:{brand:'Autonics',wires:'4',principle:'photo',output:'pnp',supply:'12–24 V DC ±10 %',range:'100'}},
  {id:'inductive',title:'Detector inductivo genérico',kind:'Detector de proximidad · salida todo/nada',
    look:'Cilindro roscado de metal (tamaños habituales M12, M18 y M30) con una cara sensible de plástico, un LED de estado y un cable de 3 hilos (o conector M12): marrón +V, azul 0 V y negro salida.',
    rows:[['Principio','Una bobina genera un campo electromagnético que se amortigua por corrientes inducidas cuando se acerca un metal.'],['Qué detecta','Solo metales. Los ferrosos tienen mayor alcance; los no ferrosos (aluminio, cobre, latón) lo reducen por un factor de reducción que depende del material.'],['Alcance nominal','Se mide con un objeto estándar de acero (EN 60947-5-2); el alcance asegurado es aprox. 0 a 81 % del nominal.'],['Salida','PNP (conecta la salida a +V) o NPN (la conecta a 0 V); normalmente abierta (NO) o cerrada (NC).'],['Hilos','Marrón +V · azul 0 V · negro salida, como en las fichas del CR30 y del XS118.']],
    bench:['Alcance del modelo genérico: 10 mm. Solo detecta metal; no usa factores de reducción.','Sin histéresis, tolerancias, tensión residual ni límite de corriente.','Solo salida normalmente abierta y 3 hilos.'],
    pending:['Factores de reducción: las fuentes dan rangos distintos según la aleación, por eso el banco no los modela.'],
    sources:[{label:'Omron · principios de los sensores de proximidad',url:'https://www.ia.omron.com/support/guide/41/principles.html'},{label:'Balluff · el material del objeto sí importa',url:'https://www.balluff.com/en-us/blog/inductive-proximity-sensor-targets-material-does-matter'},{label:'Boxic24 · inductivo y capacitivo',url:'https://boxic24.com/english/ratgeber/inductive-capacitive-proximity-sensor'},SCHNEIDER_PDF]},
  {id:'capacitive',title:'Detector capacitivo genérico',kind:'Detector de proximidad · salida todo/nada',
    look:'Cilindro roscado igual al inductivo, pero con un potenciómetro de sensibilidad (por ejemplo en la cara trasera o lateral) y un LED de estado. Los modelos de Autonics de la guía son de plástico y latón M18 o M30.',
    rows:[['Principio','Un electrodo genera un campo eléctrico; un objeto que entra en él cambia la capacitancia y se activa la salida.'],['Qué detecta','Metales y también no metales: plástico, vidrio, madera, líquidos y sólidos a granel.'],['Ajuste','Tiene sensibilidad regulable: con el objeto en su posición se gira el potenciómetro hasta que cambie la salida (Autonics CR30: 15 ± 3 vueltas).'],['Salida','PNP o NPN, normalmente abierta o cerrada, igual que el inductivo.']],
    bench:['Alcance del modelo genérico: 10 mm. Detecta metal y plástico por igual.','No modela la sensibilidad según el material ni su ajuste.'],
    pending:['Alcance con materiales de baja constante dieléctrica: depende del modelo y no se modela.'],
    sources:[{label:'Boxic24 · inductivo y capacitivo',url:'https://boxic24.com/english/ratgeber/inductive-capacitive-proximity-sensor'},{label:'Omron · principios de los sensores de proximidad',url:'https://www.ia.omron.com/support/guide/41/principles.html'},AUTONICS_CR]},
  {id:'photo',title:'Detector fotoeléctrico genérico',kind:'Sensor óptico · salida todo/nada',
    look:'Cilindro roscado de metal o plástico con una lente en la cara frontal y un LED de estado; el modelo de reflexión difusa lleva emisor y receptor en la misma cara.',
    rows:[['Principio','Emite luz (a menudo infrarroja) y detecta la que devuelve el objeto (difusa) o la que no llega (barrera).'],['Qué detecta','Objetos opacos o translúcidos, metálicos o no, dentro de su distancia; el color y el brillo de la superficie afectan el alcance.'],['Ejemplo','Autonics BR100: reflexión difusa, 100 mm, LED infrarrojo de 940 nm, respuesta ≤ 1 ms.'],['Salida','PNP o NPN; Light ON (activa al detectar) o Dark ON.']],
    bench:['Modelo genérico de reflexión difusa de 100 mm: detecta metal y plástico dentro del alcance.','No modela color, brillo ni luz ambiental.'],
    pending:['Alcance según el color y la reflectividad del objeto: depende del modelo y no se modela.'],
    sources:[{label:'Remtron · BR100-DDT-P (distribuidor)',url:'https://shop.remtron.com.au/products/BR100-DDT-P'},{label:'Omron · guía de sensores',url:'https://www.ia.omron.com/support/guide/41/introduction.html'}]},
  {id:'target',title:'Objeto de prueba',kind:'Metal (acero) o no metálico (plástico)',
    look:'Una placa de acero y un bloque de plástico que se acercan al frente del detector. Los fabricantes miden con una placa estándar plana.',
    rows:[['Objeto estándar','Autonics CR30: hierro de 50 × 50 × 1 mm · Telemecanique XS118: acero de 18 × 18 × 1 mm · norma EN 60947-5-2: acero estándar'],['Material','Del material y del tamaño depende el alcance real: un objeto pequeño o no ferroso se detecta a menor distancia.']],
    bench:['La distancia se mide desde la cara del detector. Dentro del alcance (borde incluido) el objeto se detecta si el principio lo permite.','El plástico solo lo detectan el capacitivo y el fotoeléctrico.'],
    pending:['El tamaño del objeto del banco no se modela: se supone al menos el del objeto estándar.'],
    sources:[AUTONICS_CR,SCHNEIDER_PDF,{label:'Boxic24 · inductivo y capacitivo',url:'https://boxic24.com/english/ratgeber/inductive-capacitive-proximity-sensor'}]},
  {id:'psu',title:'Fuente de alimentación',kind:'Fuente de corriente continua de laboratorio',
    look:'Caja de banco con pantallas de tensión y corriente, perillas de ajuste, interruptor de encendido y bornes tipo banana: rojo (+), negro (−) y uno de tierra.',
    rows:[['Función en las guías','Alimenta el detector con 24 V (G01 y G02).'],['Ejemplo de fuente','RS PRO RS3005D: 0–30 V, 0–5 A, 150 W; funciona en tensión constante y corriente constante'],['Tensión del detector','Los detectores de las fichas operan con 12–24 V DC (CR30: 10–30 V; XS118: límites 10…36 V).'],['Conexión','+ al hilo marrón (+V) del detector y − al azul (0 V).']],
    bench:['Tensión fija de 24 V; solo se enciende o se apaga.','No modela el límite de corriente ni el ruido.'],
    pending:['Marca, modelo y color de los bornes de la fuente de tu sala: la guía no los indica.'],
    sources:[{label:'RS PRO · RS3005D, fuente de banco 0–30 V / 0–5 A',url:'https://uk.rs-online.com/web/p/bench-power-supplies/1757368'}]},
  {id:'plc',title:'PLC Delta · entrada digital',kind:'Maqueta PLC Delta (serie DVP)',
    look:'Caja de plástico clara con regletas de tornillo arriba y abajo: arriba el común S/S y las entradas X0, X1…; abajo las salidas Y y la alimentación; luces de entrada, POWER, RUN y ERROR en el frente.',
    rows:[['Entradas','DVP-SS2: X0 a X3 hasta 20 kHz, tipo DC sink o source con un solo común S/S'],['Nivel','24 V DC (−15 % a +20 %), unos 5 mA por entrada; impedancia 4,7 kΩ; pasa a ON sobre 15 V DC y a OFF bajo 5 V DC'],['Modos','SINK y SOURCE según la conexión del común S/S; las figuras 5 y 6 de la hoja de instrucciones muestran el cableado de cada modo.'],['Alimentación','24 V DC (20,4 a 28,8 V) en los modelos de alimentación continua; fuente 24 V / 500 mA para sensores en algunos modelos']],
    bench:['Entrada genérica con los datos de la hoja DVP-SS2: 4,7 kΩ entre X0 y S/S, ON sobre 15 V.','Con un detector PNP el común va a 0 V; con un NPN va a +24 V. El banco no distingue «sink» de «source»: solo comprueba la tensión entre X0 y S/S.'],
    pending:['Modelo exacto de la maqueta del laboratorio y sus bornes: la guía solo dice «maqueta PLC Delta».','Qué conexión de S/S corresponde a SINK y a SOURCE: se lee en las figuras 5 y 6 de la hoja, que no se pudieron interpretar como texto.'],
    sources:[DELTA]},
  {id:'dmm',title:'Multímetro digital',kind:'Instrumento de medida',
    look:'Instrumento de mano con pantalla, selector giratorio y conectores: COM (punta negra) y V (punta roja).',
    rows:[['Función en las guías','Tensión continua (V) en la salida del detector, entre el hilo de salida y +V o 0 V.'],['Impedancia de entrada','Valor habitual en tensión continua: unos 10 MΩ (el banco usa 10 MΩ). Confirma el de tu multímetro en su manual.'],['Con un NPN','Medir entre OUT y 0 V marca 0 V siempre; los 24 V aparecen entre +V y OUT.'],['Polaridad','Punta roja en el punto más positivo: invertir las puntas invierte el signo.']],
    bench:['El multímetro mide la tensión entre sus dos puntas resolviendo todo el montaje, incluida su propia carga.','Tus mediciones reales tendrán menos cifras: regístralas en la pestaña «En clase».'],
    pending:['Modelo y resolución del multímetro de tu sala.'],
    sources:[]},
];
export const sheetById=(id:SheetId)=>DATASHEETS.find(s=>s.id===id)!;
export const MODEL_SHEETS:SheetId[]=['CR30-15DN','CR30-15DP','XS118BLPAL2','BR100-DDT-P'];
/** Color de cada hilo del detector según las fichas. null = pendiente de ficha. */
export const WIRE_COLORS:Record<'plus'|'minus'|'out',string>={plus:'#7a4a2b',minus:'#2f6fd1',out:'#1d252a'};
