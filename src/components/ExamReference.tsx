import {EXAM_CONNECTORS,EXAM_CONTROL_NETS} from '../data/examReference';
export function ExamReference({onLocate}:{onLocate:(id:string)=>void}){
 return <details className="teacher-material exam-reference"><summary>Prueba · partida directa · conectores</summary><div className="teacher-material-body">
  <h3>Del esquema de la prueba al borne</h3>
  <p>Referencia: captura que compartiste. Identifica primero el dispositivo y después el borne. Los números repetidos en dispositivos distintos no forman una conexión.</p>
  <div className="connector-bank-links confirmed-connector-strip" aria-label="Bornes confirmados de protección y auxiliar"><strong>Protección: 95 / 96 · Auxiliar KM1: 71 / 72</strong>{['95','96','71','72'].map(t=><button key={t} onClick={()=>onLocate(`CONTACTOR_TERMICO:${t}`)}>Ver {t} · módulo KM1 con térmico</button>)}</div>
  <a href="/materiales/prueba-partida-directa.png" target="_blank" rel="noreferrer" className="outline-full">Ampliar captura de la prueba</a>
  <p className="teacher-scope">La captura y PERFECTO difieren en los nombres de los pilotos y en las derivaciones hacia F:97 y KM1:11. Esta ficha registra la captura; no reemplaza silenciosamente el archivo PERFECTO.</p>
  <div className="connector-reference-table"><table><caption>Bornes visibles y correspondencia física disponible</caption><thead><tr><th>Esquema y función</th><th>Banco</th></tr></thead><tbody>{EXAM_CONNECTORS.map(row=><tr key={row.reference}><td><strong>{row.reference}</strong><span>{row.meaning}</span></td><td>{row.panel.length?<div className="connector-bank-links">{row.panel.map(id=><button key={id} onClick={()=>onLocate(id)}>Ver {id}</button>)}</div>:<b className="connector-pending">Por confirmar</b>}<p>{row.note}</p></td></tr>)}</tbody></table></div>
  <details className="exam-networks"><summary>Seguir las siete redes de mando de la captura</summary>{EXAM_CONTROL_NETS.map(net=><section key={net.title}><h4>{net.title}</h4><p className="exam-port-chain">{net.ports.join(' ↔ ')}</p><p>{net.why}</p></section>)}<p>Una red puede requerir varios cables o puentes. Los pares de un contacto y A1–A2 quedan separados por el dispositivo, aunque sus números estén cerca en la imagen.</p></details>
  <p>Confirmaste KM1 como el contactor con térmico y KM2 como el contactor solo. La actividad del profesor añade KM3 para estrella–triángulo; su módulo físico sigue pendiente. La captura de la prueba usa únicamente KM1.</p>
 </div></details>;
}
