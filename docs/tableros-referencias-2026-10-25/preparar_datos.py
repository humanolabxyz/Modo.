from pathlib import Path
import json, csv, fitz

ROOT=Path(__file__).resolve().parent
sources=json.loads((ROOT/'fuentes.json').read_text(encoding='utf-8'))
by_id={s['id']:s for s in sources}

def excerpt(source,page,rect,name):
 doc=fitz.open(ROOT/by_id[source]['path']);p=doc[page-1]
 target=ROOT/'paginas'/f'{name}.png'
 p.get_pixmap(matrix=fitz.Matrix(1.8,1.8),clip=fitz.Rect(rect)).save(target)
 return str(target.relative_to(ROOT)).replace('\\','/')

cards=[]
def card(id,title,source,kind,image,observe,implement,limit,page=None):
 cards.append(dict(id=id,title=title,source=source,kind=kind,image=image,observe=observe,implement=implement,limit=limit,pdf_page=page,visual_review='Inspeccionada en esta sesion; foto o fragmento identificado, no imagen generada.'))

card('V01','Interior de un gabinete de automatización','F01','Fotografía industrial','imagenes/F01-eiffage.jpg',
 'Fuente, módulos, bornes, rieles y canaletas visibles; conductores identificados.',
 'Placa editable con componentes, etiquetas y extremos de cada hilo seleccionables.',
 'La foto no demuestra el circuito completo ni autoriza deducir el destino de un hilo oculto.')
card('V02','CCM instalado: conjunto de columnas','F03','Fotografía de caso industrial','imagenes/F03-boral.jpg',
 'Puertas, mandos y divisiones por unidades. Caso Boral, Charlton, Australia.',
 'Vista general por columnas y acceso a la unidad seleccionada.',
 'Es una referencia internacional; no es una fotografía de una faena de Tarapacá.')
card('V03','Estructura de un conjunto de distribución','F04','Visual de fabricante','imagenes/F04-rittal.jpg',
 'Compartimentos, barras y unidades en una presentación del sistema VX25 Ri4Power.',
 'Capas de gabinete, zonas funcionales y envolventes, separadas del circuito.',
 'No convertir esta imagen comercial en un plano de fabricación ni en una clasificación IP universal.')
card('V04','Espacio de entrada y tendido de cables','F05','Visual de fabricante','imagenes/F05-cables.jpg',
 'Cámara lateral dedicada a la llegada y organización de cables.',
 'Zona de entrada, sujeción, recorrido y llegada a bornes externos.',
 'La capacidad y las dimensiones deben venir del producto concreto y del proyecto.')
card('V05','Placa de montaje y fijaciones','M06','Fragmento visual de catálogo',excerpt('M06',6,(0,80,595,770),'V05-placa'),
 'La envolvente y la placa son piezas diferentes; la referencia muestra sus fijaciones.',
 'Montar primero la placa y sus soportes, antes de poblarla de equipos.',
 'La disposición pertenece a VX SE; no extender sus detalles a todos los gabinetes.',6)
card('V06','Unidades de motor fijas y extraíbles','M01','Fotografías en manual',excerpt('M01',67,(65,325,570,485),'V06-unidades'),
 'Dos construcciones de unidad de motor del CENTERLINE 2500.',
 'Familias de unidad y relación entre mando frontal, conexiones y módulo.',
 'La representación no es un procedimiento para retirar unidades energizadas.',67)
card('V07','Montaje de un variador dentro del gabinete','M02','Diagrama dimensional',excerpt('M02',118,(45,80,550,495),'V07-variador-montaje'),
 'Posición de montaje y espacios que el manual distingue por talla.',
 'Huella física y zonas de reserva tomadas de la ficha del variador elegido.',
 'Las cotas corresponden a tallas concretas; no usarlas como regla para cualquier variador.',118)
card('V08','Separación entre bornes de control y potencia','M02','Esquema técnico, fragmento',excerpt('M02',160,(150,120,545,370),'V08-bornes-control'),
 'El bloque de control diferencia entradas, salidas, alimentación y funciones.',
 'Puertos con función y tipo de señal; esquema enlazado con el componente.',
 'Un fragmento no sustituye el esquema completo, la revisión del manual ni la arquitectura de seguridad.',160)
card('V09','Instalación de una CPU en riel DIN','M04','Ilustración de montaje',excerpt('M04',32,(100,75,520,285),'V09-cpu-riel'),
 'El enganche y el clip representan estados mecánicos distintos.',
 'Secuencia de colocación y fijación, con validación de soporte compatible.',
 'La ilustración es del S7-1200 G2; los accesorios y pasos dependen del modelo.',32)
card('V10','Frente de CPU y puntos de diagnóstico','M04','Ilustración identificada',excerpt('M04',19,(120,112,340,390),'V10-cpu-frente'),
 'Puertos, indicadores y conexiones identificados en la CPU.',
 'Indicadores seleccionables y vínculo con estado, diagnóstico y mapa de E/S.',
 'No atribuir colores o patrones de LED de este modelo a todos los PLC.',19)
card('V11','Del instrumento de campo al lazo de señal','M07','Diagrama de instrumento',excerpt('M07',78,(145,100,555,350),'V11-instrumento'),
 'Compartimento de bornes del transmisor y lazo externo de alimentación/señal.',
 'Conexión entre campo, bornes del tablero y entrada analógica.',
 'El PDF descargado está en alemán, Rev BF 02/2024; referencia específica del 3051 HART.',78)
card('V12','Instalación de campo alrededor del equipo','F02','Fotografía de instalación','imagenes/F02-eiffage-galeria.jpg',
 'Equipo de proceso, cableado exterior y dispositivos locales; el tablero forma parte de un sistema.',
 'Una vista de campo conectada al gabinete, con cables y dispositivos identificados.',
 'No identificar la máquina ni su filosofía de control más allá de lo documentado por la fuente.')

workflow=[
 ('01','Definir el encargo','Función del equipo, modos, alarmas, ambiente y documentos de referencia.','Entrega: requisitos y lista de señales.'),
 ('02','Preparar el gabinete','Envolvente, placa, entradas de cables y disposición antes del montaje.','Entrega: plano de implantación del caso.'),
 ('03','Montar componentes','Rieles, canaletas, equipos, bornes y elementos de puerta.','Entrega: montaje mecánico coherente con las fichas.'),
 ('04','Cablear e identificar','Unir los bornes indicados y registrar hilos, destinos y terminaciones.','Entrega: lista de conexiones y etiquetas.'),
 ('05','Verificar el conjunto','Comparar con planos y registrar las verificaciones virtuales previstas.','Entrega: lista de comprobaciones con evidencia.'),
 ('06','Instalar en campo','Representar fijación, entradas, protección de masas y equipos externos.','Entrega: correspondencia gabinete-campo.'),
 ('07','Comprobar la función','Recorrer modos, señales y respuesta ante una condición de fallo.','Entrega: registro de pruebas del escenario.'),
 ('08','Mantener y diagnosticar','Observar, formular una hipótesis, comprobar, corregir y repetir la prueba.','Entrega: causa encontrada y resultado posterior.'),
]

# Hypotheses and simulator behavior are proposed teaching cases, not a repair
# authorization or a claim that the current app already implements them.
faults=[]
def fault(id,family,symptom,cause,verify,correction,pass_rule,refs,pages=None,kind='propuesta_didactica'):
 faults.append(dict(id=id,family=family,symptom=symptom,hypothesis=cause,virtual_check=verify,simulated_correction=correction,acceptance=pass_rule,sources=refs,source_pages=pages or {},evidence_kind=kind))
fault('D01','Mando','El circuito no responde.','Falta la alimentación de control o el retorno definido.','Seguir el esquema y consultar el medidor virtual.','Restablecer la conexión correcta del caso.','La alimentación y el retorno son coherentes.',['M05'])
fault('D02','Mando','El contactor vibra o actúa de forma inestable.','Tensión de bobina inadecuada o contacto de mando inestable.','Comparar la bobina seleccionada y la señal virtual.','Corregir la causa representada; revisar el estado del componente.','El mando permanece estable.',['Q03'])
fault('D03','Mando','El motor se detiene al soltar marcha.','El contacto auxiliar de retención del ejercicio no cierra la ruta prevista.','Revisar la red virtual y la referencia del auxiliar.','Corregir el conexionado o asociación del auxiliar.','Marcha se mantiene; paro la desactiva.',['M05'])
fault('D04','Mando','Aparecen órdenes incompatibles.','Falta el enclavamiento previsto en el caso de inversión.','Consultar estados y condiciones de ambas órdenes.','Completar la lógica o conexión definida en el esquema.','No pueden activarse ambos sentidos.',['M05'])
fault('D05','Protección','Una protección ha disparado.','La carga o la condición de fallo del ejercicio excede lo permitido.','Ver la causa simulada y el ajuste documentado.','Eliminar la causa antes del rearme previsto.','La prueba se repite sin mantener el fallo.',['M01','M05'],{'M01':[85,86]})
fault('D06','Variador','El variador está disponible, sin orden de marcha.','La autoridad de mando o un permiso no coincide con el encargo.','Ver canal activo y señales del caso.','Seleccionar el mando válido y satisfacer el permiso.','La orden llega por el canal definido.',['M03'],{'M03':[238,239]})
fault('D07','Variador','La velocidad no sigue la consigna esperada.','Referencia o tipo de señal configurados para otro origen.','Comparar referencia activa y señal virtual.','Corregir la configuración del escenario.','La respuesta sigue la referencia elegida.',['M03'])
fault('D08','Variador','Código OHF en el perfil ATV600.','Sobretemperatura; ventilación o carga ambiental incompatibles.','Consultar estado térmico y condiciones de montaje.','Corregir el problema representado y respetar las condiciones de recuperación.','No se acepta un reset con la causa presente.',['M03','Q01'],{'M03':[672]},'codigo_fabricante_y_escenario_propuesto')
fault('D09','Variador','Código USF en el perfil ATV600.','Condición de subtensión detectada.','Comparar alimentación virtual y configuración del perfil.','Restaurar la alimentación adecuada del caso.','Desaparece la condición de subtensión.',['M03','Q02'],{'M03':[687]},'codigo_fabricante_y_escenario_propuesto')
fault('D10','Variador','Código OCF en el perfil ATV600.','Sobrecorriente; revisar datos, carga y mecanismo del caso.','Relacionar historial, datos de motor y carga.','Eliminar la causa; aplicar el tipo de recuperación del manual.','El arranque posterior cumple las condiciones.',['M03'],{'M03':[672]},'codigo_fabricante_y_escenario_propuesto')
fault('D11','PLC','El PLC no ejecuta la secuencia.','CPU en STOP o diagnóstico activo.','Consultar estado y diagnóstico del perfil seleccionado.','Resolver el diagnóstico o estado definido por el ejercicio.','La secuencia se ejecuta bajo las condiciones previstas.',['M04'],{'M04':[245,246]})
fault('D12','PLC','La entrada cambia en campo, pero no en el programa.','Origen, borne o asignación de E/S diferentes.','Seguir la señal del dispositivo al mapa de E/S.','Corregir conexión o asignación del caso.','La variable representa la señal correspondiente.',['M04'],{'M04':[38,39]})
fault('D13','HMI','La pantalla muestra datos congelados o desconexión.','Enlace lógico o destino no disponible en el caso.','Ver estado del enlace y variable de origen.','Restablecer configuración/conexión compatible.','Datos actuales y pérdida de enlace diferenciados.',['M04'])
fault('D14','Instrumentación','La lectura es plausible, pero está escalada mal.','Rango o tipo de entrada no coincide con la señal.','Comparar señal virtual y escala definida.','Ajustar el rango coherente del ejercicio.','La magnitud sigue la escala documentada.',['M07'],{'M07':[17,18]})
fault('D15','Instrumentación','El lazo presenta una lectura anormal.','Conductor abierto, polaridad o alimentación del lazo incorrectos.','Inspeccionar el lazo y su diagnóstico virtual.','Reponer la conexión definida; verificar señal y diagnóstico.','Fallo de lazo y cero de proceso se distinguen.',['M07'],{'M07':[78,95]})
fault('D16','Montaje','No se supera la comprobación de protección de masas.','Una masa del montaje queda sin la conexión prevista.','Consultar el esquema de protección y continuidad virtual.','Completar la unión definida en el proyecto.','El montaje tiene evidencia de la comprobación.',['M05'],{'M05':[18]})

support=[
 {'id':'Q01','title':'Schneider: diagnóstico OHF','url':'https://www.se.com/sg/en/faqs/FA311478/'},
 {'id':'Q02','title':'Schneider: subtensión USF en ATV630','url':'https://www.se.com/us/en/faqs/FA317653/'},
 {'id':'Q03','title':'Schneider: causas de vibración de contactor','url':'https://www.se.com/us/en/faqs/FA120094/'},
]
payload={'date':'2026-10-25','status':'investigacion_y_propuesta_no_implementada','visuals':cards,'workflow':workflow,'faults':faults,'support_sources':support}
(ROOT/'investigacion.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
with(ROOT/'matriz-fallas.csv').open('w',encoding='utf-8-sig',newline='')as f:
 fields=['id','family','symptom','hypothesis','virtual_check','simulated_correction','acceptance','sources','evidence_kind']
 writer=csv.DictWriter(f,fieldnames=fields,delimiter=';');writer.writeheader()
 for item in faults:writer.writerow({k:(', '.join(item[k])if k=='sources'else item[k])for k in fields})
print(f'{len(cards)} referencias seleccionadas; {len(faults)} fallas; {len(workflow)} etapas.')
