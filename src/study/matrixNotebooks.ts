export type MatrixNotebookContent = {
  problem: string;
  matrices: {name:string; rows:number[][]; columns:string[]; labels:string[]}[];
  ideas: {title:string; text:string}[];
  worked: {title:string; text:string}[];
  questions: {prompt:string; hint:string; response:string}[];
};

/** Complementary examples, using exactly the data of the existing GeoGebra lessons. */
export const matrixNotebooks: Record<string, MatrixNotebookContent> = {
  'matrices-operaciones': {
    problem:'Dos equipos cuentan piezas de tipo 1 y tipo 2 durante dos turnos. A registra el primer turno y B el segundo. ¿Cómo organizarías los datos y calcularías la producción total de cada equipo y tipo de pieza?',
    matrices:[
      {name:'A · primer turno',rows:[[2,1],[3,4]],columns:['Tipo 1','Tipo 2'],labels:['Equipo 1','Equipo 2']},
      {name:'B · segundo turno',rows:[[1,3],[2,0]],columns:['Tipo 1','Tipo 2'],labels:['Equipo 1','Equipo 2']},
    ],
    ideas:[
      {title:'1. Lee la tabla antes de operar',text:'Una fila se lee de izquierda a derecha y una columna de arriba abajo. En A, el 3 está en la fila 2, columna 1: el equipo 2 produjo 3 piezas de tipo 1. Escribimos a₂₁ = 3; el primer índice siempre indica la fila.'},
      {title:'2. Decide qué operación responde al problema',text:'Ambas matrices tienen 2 filas y 2 columnas: su dimensión es 2 × 2. Para reunir los dos turnos usamos A + B y sumamos las posiciones correspondientes. Las filas y columnas deben representar los mismos equipos y tipos en el mismo orden.'},
      {title:'3. Distingue duplicar de transponer',text:'2A duplica cada cantidad. Aᵀ intercambia filas y columnas: cambia cómo organizas los mismos datos. Después de transponer, las filas representan tipos de pieza y las columnas equipos. Transponer no duplica la producción.'},
    ],
    worked:[
      {title:'Identifica lo que te piden',text:'Buscamos el total de piezas por equipo y tipo al reunir dos turnos. Por eso calculamos S = A + B, no A × B.'},
      {title:'Calcula cada posición',text:'s₁₁ = 2 + 1 = 3; s₁₂ = 1 + 3 = 4; s₂₁ = 3 + 2 = 5; s₂₂ = 4 + 0 = 4. Resultado: primera fila (3, 4), segunda fila (5, 4).'},
      {title:'Interpreta el resultado',text:'El 5 de la fila 2, columna 1 significa que el equipo 2 produjo 5 piezas de tipo 1 entre ambos turnos. No basta con escribir 5: responde qué cuenta y a quién corresponde.'},
      {title:'Contrasta otras operaciones',text:'D = 2A tiene filas (4, 2) y (6, 8). T = Aᵀ tiene filas (2, 3) y (1, 4). En GeoGebra usarás llaves para las filas: A={{2,1},{3,4}}. Las llaves son una forma de ingresar la tabla, no una operación adicional.'},
    ],
    questions:[
      {prompt:'¿Qué significa a₂₁ y cuánto vale en el primer turno?',hint:'Ubica primero la fila 2 y luego la columna 1.',response:'a₂₁ = 3: el equipo 2 produjo 3 piezas de tipo 1 en el primer turno.'},
      {prompt:'¿Cuántas piezas de tipo 2 produjo el equipo 1 entre ambos turnos? Explica la operación.',hint:'Busca la fila del equipo 1 y la columna del tipo 2 en A y B.',response:'1 + 3 = 4 piezas. Es la entrada s₁₂ de S = A + B.'},
      {prompt:'¿Por qué 2A y Aᵀ no representan lo mismo?',hint:'Compara qué ocurre con los valores y qué ocurre con sus posiciones.',response:'2A duplica las cantidades; Aᵀ conserva las cantidades e intercambia el papel de filas y columnas.'},
      {prompt:'Si otro registro tiene 3 equipos y 2 tipos de pieza, ¿puedes sumarlo directamente con A? Justifica.',hint:'Compara las dimensiones y las categorías de ambos registros.',response:'No. Tendría dimensión 3 × 2 y A es 2 × 2; faltaría una fila correspondiente en A. Primero habría que organizar registros compatibles.'},
    ],
  },
  'matrices-producto': {
    problem:'Un sistema transforma una columna de entrada v=(x,y). La etapa A entrega (x+2y,y) y la etapa B entrega (2x,3x+y). ¿Da igual aplicar primero B y después A que hacerlo al revés?',
    matrices:[
      {name:'A · primera transformación',rows:[[1,2],[0,1]],columns:['x','y'],labels:['Salida 1','Salida 2']},
      {name:'B · segunda transformación',rows:[[2,0],[3,1]],columns:['x','y'],labels:['Salida 1','Salida 2']},
    ],
    ideas:[
      {title:'1. Revisa las dimensiones',text:'Se puede multiplicar una matriz de m × n por otra de n × p. Deben coincidir las dimensiones interiores; el resultado tendrá dimensión m × p. Aquí ambas son 2 × 2 y existen AB y BA.'},
      {title:'2. Multiplica una fila por una columna',text:'Para la entrada de fila 1, columna 1 de AB toma la fila (1,2) de A y la columna (2,3) de B: 1×2 + 2×3 = 8. No multipliques casillas de la misma posición: eso no es el producto matricial.'},
      {title:'3. Lee el orden de las transformaciones',text:'Con vectores columna, ABv = A(Bv): actúa B primero y A después. En BAv ocurre lo contrario. Cambiar el orden puede cambiar el resultado, aunque ambos productos estén definidos.'},
    ],
    worked:[
      {title:'Construye la primera fila de AB',text:'p₁₁ = 1×2 + 2×3 = 8. p₁₂ = 1×0 + 2×1 = 2. La primera fila del resultado es (8,2).'},
      {title:'Completa AB',text:'p₂₁ = 0×2 + 1×3 = 3. p₂₂ = 0×0 + 1×1 = 1. Así, AB tiene filas (8,2) y (3,1).'},
      {title:'Invierte los factores',text:'En BA, la primera fila es (2×1+0×0, 2×2+0×1) = (2,4). La segunda es (3×1+1×0, 3×2+1×1) = (3,7). BA tiene filas (2,4) y (3,7).'},
      {title:'Responde al problema con una entrada',text:'Para v=(1,0), Bv=(2,3) y A(Bv)=(8,3). En cambio Av=(1,0) y B(Av)=(2,3). Las salidas difieren: el orden sí importa. GeoGebra permite contrastarlo con P=A*B y Q=B*A.'},
    ],
    questions:[
      {prompt:'¿Cómo obtienes la entrada de fila 1, columna 2 de AB?',hint:'Usa la fila 1 de A y la columna 2 de B.',response:'1×0 + 2×1 = 2. Se combinan una fila y una columna, no casillas correspondientes.'},
      {prompt:'Para una entrada v=(1,0), ¿qué salida produce AB y qué salida produce BA?',hint:'Multiplica cada matriz resultado por la columna (1,0).',response:'ABv=(8,3), mientras que BAv=(2,3). La misma entrada produce salidas diferentes.'},
      {prompt:'En ABv, ¿qué etapa actúa primero? Explica por qué importa.',hint:'Escribe ABv como A(Bv).',response:'B actúa primero. A recibe la salida de B; al invertir el orden cambia lo que recibe cada etapa.'},
      {prompt:'Si C es 2 × 3 y D es 3 × 1, ¿existen CD y DC? ¿Qué dimensión tendría CD?',hint:'Compara columnas del primer factor con filas del segundo en cada orden.',response:'CD existe y es 2 × 1: coinciden las dimensiones interiores 3. DC no existe porque 1 no coincide con 2.'},
    ],
  },
  'matrices-sistemas': {
    problem:'Una máquina fabrica dos tipos de pieza. Cada pieza X usa 2 minutos en la estación 1 y 1 minuto en la estación 2. Cada pieza Y usa 1 minuto en la estación 1 y 3 minutos en la estación 2. Ambas estaciones trabajaron 5 minutos. ¿Cuántas piezas de cada tipo se fabricaron?',
    matrices:[
      {name:'A · minutos por pieza',rows:[[2,1],[1,3]],columns:['Pieza X','Pieza Y'],labels:['Estación 1','Estación 2']},
      {name:'b · minutos totales',rows:[[5],[5]],columns:['Minutos'],labels:['Estación 1','Estación 2']},
    ],
    ideas:[
      {title:'1. Define las incógnitas y plantea ecuaciones',text:'x e y son cantidades de piezas, no minutos. La estación 1 da 2x+y=5; la estación 2 da x+3y=5. Cada ecuación representa una condición que debe cumplirse al mismo tiempo.'},
      {title:'2. Organiza A·X=b',text:'A reúne los coeficientes; X es la columna de incógnitas (x,y); b es la columna de minutos totales. A es 2 × 2 y X es 2 × 1, por eso AX es una columna de dos resultados, uno por estación.'},
      {title:'3. Decide si puedes usar la inversa',text:'Para una matriz 2 × 2 con filas (a,b) y (c,d), det(A)=ad−bc. Aquí 2×3−1×1=5. Como no es cero, A tiene inversa y existe una solución única. Si el determinante fuera cero, no podrías usar este método; tendrías que analizar si hay ninguna o infinitas soluciones.'},
    ],
    worked:[
      {title:'Representa las condiciones',text:'Escribe A con filas (2,1) y (1,3), y b con filas (5) y (5). No pongas los totales dentro de A: forman la columna b.'},
      {title:'Calcula la inversa',text:'Para 2 × 2, A⁻¹ = (1/det(A)) por la matriz de filas (d,−b) y (−c,a). Aquí queda (1/5) por las filas (3,−1) y (−1,2): filas (0,6; −0,2) y (−0,2; 0,4).'},
      {title:'Obtén e interpreta X',text:'x = 0,6×5 − 0,2×5 = 2; y = −0,2×5 + 0,4×5 = 1. Se fabricaron 2 piezas X y 1 pieza Y. En GeoGebra: N=Invert(A) y X=N*b. No se divide b entre A.'},
      {title:'Verifica ambas condiciones',text:'Estación 1: 2×2+1=5 minutos. Estación 2: 2+3×1=5 minutos. En GeoGebra R=A*X debe coincidir con b. La respuesta satisface las dos condiciones y da cantidades enteras no negativas.'},
    ],
    questions:[
      {prompt:'¿Qué representan x e y y cómo obtienes las dos ecuaciones?',hint:'Relaciona el tiempo por pieza con el tiempo total de cada estación.',response:'x e y cuentan piezas X e Y. Las condiciones son 2x+y=5 y x+3y=5 minutos.'},
      {prompt:'¿Por qué se puede usar la inversa de A en este problema?',hint:'Calcula el determinante antes de invertir.',response:'det(A)=2×3−1×1=5, distinto de cero. A es invertible y el sistema tiene solución única.'},
      {prompt:'¿Cómo compruebas que x=2 e y=1 responde al problema, además de obtenerlo en pantalla?',hint:'Sustituye en las dos ecuaciones e incluye las unidades.',response:'La estación 1 usa 2×2+1=5 minutos y la estación 2 usa 2+3×1=5 minutos. Las cantidades son 2 piezas X y 1 pieza Y.'},
      {prompt:'Si A tuviera filas (2,1) y (4,2), ¿bastaría saber que det(A)=0 para decir que no hay solución?',hint:'Compara los sistemas con totales (5,10) y con totales (5,5).',response:'No. Con (5,10), la segunda ecuación duplica la primera y hay infinitas soluciones reales. Con (5,5), las condiciones se contradicen y no hay solución. En ninguno de los dos casos existe la inversa.'},
    ],
  },
};
