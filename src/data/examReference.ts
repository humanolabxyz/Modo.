/** Read from the supplied exam photograph. Separate from PERFECTO and the Y/Δ activity. */
export const EXAM_CONNECTORS=[
 {reference:'F · 95 / 96',meaning:'Contacto de protección en el mando',panel:['CONTACTOR_TERMICO:95','CONTACTOR_TERMICO:96'],note:'Etiquetas del térmico presentes en el banco.'},
 {reference:'F · 97 / 98',meaning:'Contacto de señalización de falla',panel:['CONTACTOR_TERMICO:97','CONTACTOR_TERMICO:98'],note:'Etiquetas del térmico presentes en el banco.'},
 {reference:'SB1 · 11 / 12',meaning:'Pulsador de parada',panel:[],note:'La captura usa 11–12; el panel usa 1–2 y 3–4. Falta confirmar el contacto físico.'},
 {reference:'SB2 · 13 / 14',meaning:'Pulsador de marcha',panel:['BOTONERAS:S3:3','BOTONERAS:S3:4'],note:'SB2 confirmado por ti: verde derecho (S3). 13–14 del esquema se muestran como 3–4 del panel; contacto NA por convención, por confirmar.'},
 {reference:'KM1 · A1 / A2',meaning:'Extremos de la bobina',panel:['CONTACTOR_TERMICO:A1','CONTACTOR_TERMICO:A2'],note:'KM1 confirmado por ti: contactor con relé térmico. Etiquetas A1 y A2 coincidentes.'},
 {reference:'KM1 · 13 / 14',meaning:'Auxiliar de mantenimiento en paralelo con marcha',panel:['CONTACTOR_TERMICO:13','CONTACTOR_TERMICO:14'],note:'KM1 confirmado por ti: contactor con relé térmico. Etiquetas 13 y 14 coincidentes.'},
 {reference:'KM1 · 11 / 12 → 71 / 72',meaning:'Auxiliar para el piloto de motor detenido',panel:['CONTACTOR_TERMICO:71','CONTACTOR_TERMICO:72'],note:'Correspondencia confirmada por ti: 11 es 71 y 12 es 72. El contacto no se sustituye por un cable.'},
 {reference:'KM1 · 1–2 / 3–4 / 5–6',meaning:'Tres polos de fuerza',panel:[],note:'El panel rotula L1/L2/L3 y T1/T2/T3. Traducción pendiente de revisión del módulo.'},
 {reference:'F · 1–2 / 3–4 / 5–6',meaning:'Protección térmica en fuerza',panel:[],note:'No añadir bornes ni puentes internos que el banco no haya confirmado.'},
 {reference:'H1 · X1 / X2',meaning:'Piloto rojo · motor detenido',panel:[],note:'En PERFECTO esta función está rotulada H3. Retorno físico del piloto sin verificar.'},
 {reference:'H2 · X1 / X2',meaning:'Piloto verde · motor funcionando',panel:[],note:'En PERFECTO esta función está rotulada H1. Retorno físico del piloto sin verificar.'},
 {reference:'H3 · X1 / X2',meaning:'Piloto amarillo · falla',panel:[],note:'En PERFECTO esta función está rotulada H2. Retorno físico del piloto sin verificar.'},
 {reference:'M1 · U1 / V1 / W1',meaning:'Bornes superiores del motor',panel:['BORNERA_MOTOR:U1','BORNERA_MOTOR:V1','BORNERA_MOTOR:W1'],note:'Correspondencia por etiqueta con la bornera del banco.'},
 {reference:'M1 · W2 / U2 / V2',meaning:'Punto común mostrado en la captura',panel:['BORNERA_MOTOR:W2','BORNERA_MOTOR:U2','BORNERA_MOTOR:V2'],note:'La captura muestra estrella: tres bornes en una misma red; dos puentes bastan.'},
 {reference:'PE y retorno del mando',meaning:'Protección del motor y retorno de bobina/pilotos',panel:[],note:'Son redes distintas. Falta confirmar PE/TP y el retorno del banco, sin deducirlo por color.'},
];
export const EXAM_CONTROL_NETS=[
 {title:'Salida del disyuntor de mando',ports:['QR:2','F:95','F:97','KM1:11'],why:'Tres derivaciones alimentadas desde la salida del disyuntor en esta captura.'},
 {title:'Salida de protección hacia parada',ports:['F:96','SB1:11'],why:'La línea acaba en la entrada de parada; no puentea el contacto 95–96.'},
 {title:'Salida de parada y ramas en paralelo',ports:['SB1:12','SB2:13','KM1:13'],why:'Marcha y mantenimiento comparten el punto de entrada.'},
 {title:'Salida de marcha y entrada de bobina',ports:['SB2:14','KM1:14','KM1:A1','H2:X1'],why:'La bobina y el piloto de funcionamiento toman esta misma red.'},
 {title:'Piloto de motor detenido',ports:['KM1:12','H1:X1'],why:'Lee el contacto auxiliar KM1:11–12 sin reemplazarlo por un cable.'},
 {title:'Piloto de falla',ports:['F:98','H3:X1'],why:'Lee la salida del contacto de señalización del térmico.'},
 {title:'Retorno común de mando',ports:['KM1:A2','H1:X2','H2:X2','H3:X2'],why:'Todos llegan a la barra inferior de retorno; la identificación física de ese retorno debe revisarse.'},
];
