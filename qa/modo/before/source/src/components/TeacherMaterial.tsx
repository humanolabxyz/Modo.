import {useState} from 'react';
const FIGURES=[
 {id:'circuito-fuerza',name:'Fuerza',caption:'Figura 4 · Circuito de fuerza · página 5',page:5},
 {id:'circuito-mando',name:'Mando',caption:'Figura 5 · Circuito de control · página 6',page:6},
 {id:'bornes-estrella',name:'Bornes en estrella',caption:'Figura 2 · Punto común en estrella · página 2',page:2},
 {id:'bornes-triangulo',name:'Bornes en triángulo',caption:'Figura 3 · Conexión en triángulo · página 3',page:3},
];
/** Study reference extracted from the supplied PDF; it never assigns physical nodes. */
export function TeacherMaterial(){
 const [figure,setFigure]=useState(FIGURES[0]);
 return <details className="teacher-material"><summary>Materia del profesor · Unidad 2</summary><div className="teacher-material-body">
  <h3>Partida manual estrella–triángulo</h3>
  <p>Actividad 1 · ARCM02 · Otoño 2025. Estudia fuerza, mando, protección y señalización en CADe SIMU.</p>
  <p className="teacher-scope">Esta actividad usa KM1, KM2 y KM3. Es una referencia distinta de PERFECTO: sus conexiones no se asignan automáticamente al banco.</p>
  <div className="teacher-figures" role="group" aria-label="Esquemas de la materia">{FIGURES.map(f=><button key={f.id} aria-pressed={figure.id===f.id} onClick={()=>setFigure(f)}>{f.name}</button>)}</div>
  <figure><a href={`/materiales/actividad-1-u2.pdf#page=${figure.page}`} target="_blank" rel="noreferrer" aria-label={`Ampliar ${figure.name} en el PDF del profesor`}><img src={`/materiales/${figure.id}.png`} alt={figure.caption} loading="lazy" decoding="async"/></a><figcaption>{figure.caption} · pulsa el esquema para abrir el PDF.</figcaption></figure>
  <details><summary>Cómo explicar la secuencia</summary><ol>
   <li><strong>Detenido:</strong> contactores de fuerza abiertos; el piloto rojo indica reposo.</li>
   <li><strong>Partida en estrella:</strong> SB2 activa KM1 y KM3; se enciende el piloto verde de estrella.</li>
   <li><strong>Cambio a triángulo:</strong> SB3 desactiva KM3 y activa KM2; KM1 permanece y cambia el piloto de funcionamiento.</li>
   <li><strong>Sobrecarga:</strong> el relé térmico detiene el motor; el esquema señala falla en amarillo y motor detenido en rojo.</li>
   <li><strong>Reinicio del térmico:</strong> vuelve a la condición de reposo indicada en la guía.</li>
  </ol><p>Secuencia descrita en las páginas 6–16 del PDF. Aquí se consulta como material de estudio; PanelLab no simula su energización.</p></details>
  <details><summary>Qué practicar para la evaluación</summary><ul><li>Distinguir protección de control y maniobra.</li><li>Leer fuerza y mando por separado, siguiendo referencias y bornes.</li><li>Explicar qué cambia entre estrella y triángulo.</li><li>Explicar la parada, la falla por sobrecarga y el retorno a reposo.</li></ul><p>La actividad pide elaborar y revisar ambos esquemas en CADe SIMU. Su entrega y la eventual explicación en video dependen de las indicaciones del docente.</p></details>
  <a className="outline-full" href="/materiales/actividad-1-u2.pdf" target="_blank" rel="noreferrer">Abrir material completo · 17 páginas</a>
 </div></details>;
}
