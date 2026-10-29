import type {LearningModule} from './classCatalog';

/** Order and module labels transcribed from the user's INACAP screenshot F28.
 * Support groups are explicitly distinct from the numbered classroom modules. */
export const mathCourseModules:Record<string,LearningModule[]>={
  'mtfm01-u1':[
    {id:'mtfm01-u1-m1',title:'Módulo 1',summary:'Consumo de energía · Funciones de grados 0 y 1 · Servicio eléctrico',origin:'classroom',materialIds:['mt-energia','mt-energia-extension','mtfm01-lineales','mt-servicio']},
    {id:'mtfm01-u1-m2',title:'Módulo 2',summary:'Lanzamiento de una piedra · Funciones de grado 2 · Sueño dorado',origin:'classroom',materialIds:['mt-piedra','mt-piedra-extension','mtfm01-cuadraticas','mt-sueno']},
    {id:'mtfm01-u1-m3',title:'Módulo 3',summary:'Desabastecimiento',origin:'classroom',materialIds:['mt-stock']},
    {id:'mtfm01-u1-formativas',title:'Actividades formativas',summary:'Los cinco recursos de la Unidad 1',origin:'classroom',materialIds:[],resources:[
      {title:'Actividad Formativa N°1',href:'https://www.geogebra.org/m/QQDHQvNH'},
      {title:'Actividad Formativa N°2',href:'https://www.geogebra.org/m/BfUw2CSU'},
      {title:'Actividad Formativa N°3',href:'https://www.geogebra.org/m/MztWSeeH'},
      {title:'Actividad Formativa N°4',href:'https://www.geogebra.org/m/qxb2nWSA'},
      {title:'Actividad Formativa N°5',href:'https://www.geogebra.org/m/hkAFJD3D'},
    ]},
    {id:'mtfm01-u1-evaluacion',title:'Evaluación sumativa 1',summary:'Funciones polinómicas',origin:'classroom',materialIds:[],pending:'La evaluación aparece en tu aula, pero todavía no se dispone de su enunciado completo.'},
  ],
  'mtfm01-u2':[
    {id:'mtfm01-u2-m1',title:'Módulo 1',summary:'Eliminación de fármacos · Funciones exponenciales · Crecimiento de bacterias',origin:'classroom',materialIds:['mtfm01-eliminacion','mtfm01-exponenciales','mtfm01-bacterias']},
    {id:'mtfm01-u2-m2',title:'Módulo 2',summary:'Funciones logarítmicas · Seguidores en Instagram',origin:'classroom',materialIds:['mtfm01-logaritmicas','mt-instagram']},
    {id:'mtfm01-u2-formativas',title:'Actividades formativas',summary:'Población · Estroncio · Ahorro · Altura de una planta',origin:'classroom',materialIds:['mtfm01-problema-poblacion','mtfm01-problema-estroncio','mtfm01-problema-ahorro','mtfm01-problema-planta']},
    {id:'mtfm01-u2-repaso',title:'Repaso de la prueba · Unidad 2',summary:'Las cuatro actividades formativas y las fórmulas de apoyo',origin:'support',materialIds:['mtfm01-repaso-u2']},
  ],
  'mtfm01-u3':[1,2,3].map(n=>({id:`mtfm01-u3-m${n}`,title:`Módulo ${n}`,summary:'Material pendiente',origin:'classroom' as const,materialIds:[],pending:'Este módulo aparece en la captura de tu aula. Su contenido todavía no está disponible en el proyecto.'})),
  'mtfm01-u4':[
    {id:'mtfm01-u4-abpro',title:'Proyecto ABPro',summary:'Proyecto de la Unidad 4',origin:'classroom',materialIds:[],pending:'El Proyecto ABPro aparece en tu aula. Falta incorporar su documento e instrucciones.'},
    {id:'mtfm01-u4-practicas',title:'Prácticas complementarias de matrices',summary:'Datos y operaciones · Producto · Sistemas',origin:'support',materialIds:['mtfm01-matrices-operaciones','mtfm01-matrices-producto','mtfm01-matrices-sistemas']},
  ],
};
