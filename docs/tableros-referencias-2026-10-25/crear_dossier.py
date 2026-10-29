"""Author the research atlas. Run with the bundled ReportLab Python runtime."""
from pathlib import Path
import json, math
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent.parent
OUT=REPO/'output'/'pdf'/'Investigacion_tableros_modo_2026-10-25.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
DATA=json.loads((ROOT/'investigacion.json').read_text(encoding='utf-8'))
SOURCES=json.loads((ROOT/'fuentes.json').read_text(encoding='utf-8'))
BY={s['id']:s for s in SOURCES}
pdfmetrics.registerFont(TTFont('Segoe',r'C:\Windows\Fonts\segoeui.ttf'))
pdfmetrics.registerFont(TTFont('SegoeBold',r'C:\Windows\Fonts\segoeuib.ttf'))
pdfmetrics.registerFontFamily('Segoe',normal='Segoe',bold='SegoeBold',italic='Segoe',boldItalic='SegoeBold')
W,H=landscape(A4)
INK=colors.HexColor('#132C36'); MUTED=colors.HexColor('#526771')
TEAL=colors.HexColor('#087E83'); PALE=colors.HexColor('#E8F3F1')
BG=colors.HexColor('#F7F8F5'); LINE=colors.HexColor('#D7E0DE')
ORANGE=colors.HexColor('#A65429')
C=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
C.setTitle('Tableros de control - investigación visual y técnica para modo.')
C.setAuthor('modo. / investigación de fuentes públicas')
PAGES=[]; BOUNDS=[]

def para(txt,x,top,width,size=11,leading=None,color=INK,bold=False,maxh=None):
 style=ParagraphStyle('p',fontName='SegoeBold' if bold else 'Segoe',fontSize=size,leading=leading or size*1.3,textColor=color,spaceAfter=0)
 p=Paragraph(txt,style);_,height=p.wrap(width,1000)
 if maxh is not None and height>maxh+.1:raise ValueError(f'Overflow page {len(PAGES)} at {top}: {height}>{maxh}: {txt[:70]}')
 if top<H-33 and top+height>H-36:raise ValueError(f'Footer overlap: {txt[:70]}')
 p.drawOn(C,x,H-top-height)
 BOUNDS.append(dict(page=len(PAGES),x=x,top=top,w=width,h=height,text=txt))
 return height

def box(x,top,w,h,fill=colors.white,stroke=LINE,r=8):
 C.setFillColor(fill);C.setStrokeColor(stroke)
 C.roundRect(x,H-top-h,w,h,r,fill=1,stroke=1)

def pic(path,x,top,w,h):
 im=ImageReader(str(ROOT/path));iw,ih=im.getSize();scale=min(w/iw,h/ih)
 dw,dh=iw*scale,ih*scale
 C.drawImage(im,x+(w-dw)/2,H-top-(h+dh)/2,dw,dh,mask='auto')

def page(title,section,subtitle=''):
 if PAGES:C.showPage()
 PAGES.append(title)
 C.setFillColor(BG);C.rect(0,0,W,H,fill=1,stroke=0)
 para('modo.  /  TALLER DE TABLEROS',36,20,500,9,bold=True,color=TEAL)
 para(section.upper(),W-270,20,234,9,color=MUTED)
 para(title,36,49,W-72,27,bold=True,maxh=73)
 if subtitle:para(subtitle,36,92,W-72,10.5,color=MUTED,maxh=30)
 C.setStrokeColor(LINE);C.line(36,33,W-36,33)
 para('Investigación y propuesta didáctica  |  25 octubre 2026',36,H-26,650,8,color=MUTED)
 para(f'{len(PAGES):02d}',W-66,H-27,30,9,bold=True,color=TEAL)

def link(label,url,x,top,w=600,size=9):
 safe_url=escape(url,{'"':'&quot;'})
 return para(f'<link href="{safe_url}" color="#087E83"><u>{escape(label)}</u></link>',x,top,w,size)

def block(label,txt,x,top,w,size=11):
 h=para(label,x,top,w,size,bold=True,color=TEAL)
 return top+h+5+para(txt,x,top+h+5,w,size)

# 01 - Cover.
page('Cómo se construye un tablero', 'Atlas visual y técnico',
     'Base de investigación para integrar montaje, funcionamiento y diagnóstico en el laboratorio existente.')
para('De la imagen al ejercicio',36,139,740,18,bold=True)
para('12 referencias visuales seleccionadas · 7 documentos técnicos · 16 casos de fallas propuestos',36,169,755,12,color=TEAL)
for i,(id,caption) in enumerate([('F01','Interior y conexionado'),('F03','CCM y unidades de motor'),('F04','Gabinete y compartimentos')]):
 x=36+i*259
 box(x,207,247,239)
 pic(BY[id]['path'],x+8,217,231,192)
 para(caption,x+12,418,224,10,bold=True)
 para(id,x+205,420,30,8,color=MUTED)
para('Objetivo: que la persona comprenda el encargo, arme, conecte, pruebe una función y explique una falla.',36,468,765,13,bold=True)
para('Fotografías industriales, visuales de fabricante y figuras de manual están diferenciados. Son referencias internacionales; no prueban la instalación de estas marcas en Tarapacá. El simulador propuesto no equivale a una verificación física.',36,511,765,10,color=MUTED,maxh=39)

# 02-07 - Visual atlas.
for start in range(0,12,2):
 page('Referencias para construir la escena','Atlas '+str(start//2+1)+' / 6',
      'Cada imagen se vincula con una decisión de aprendizaje y declara qué no permite concluir.')
 for j,v in enumerate(DATA['visuals'][start:start+2]):
  x=36+j*391; w=379
  box(x,132,w,417)
  para(v['id']+'  '+escape(v['title']),x+13,144,w-26,13,bold=True,maxh=36)
  s=BY[v['source']]
  label=v['kind']+'  |  '+v['source']+(f" · pág. PDF {v['pdf_page']}" if v['pdf_page'] else '')
  para(escape(label),x+13,181,w-26,8.5,color=TEAL,maxh=12)
  pic(v['image'],x+12,200,w-24,173)
  y=383
  for label,key in [('Observar','observe'),('Llevar a modo.','implement'),('Límite','limit')]:
   h=para('<b>'+label+':</b> '+escape(v[key]),x+13,y,w-26,9.4,leading=12,maxh=48)
   y+=h+6
  link('Fuente original',s.get('page',s['url']),x+13,530,160,8)

# 08 - How it works, original teaching diagram.
page('Cómo funciona: energía, órdenes y señales','Modelo de lectura',
     'Esquema conceptual original para enseñar relaciones. No es un plano de cableado.')
rows=[(144,'POTENCIA',ORANGE,[('Entrada','Alimentación y seccionamiento'),('Maniobra','Protección y accionamiento'),('Carga','Motor o equipo de proceso')]),
      (269,'CONTROL',TEAL,[('Señal y orden','Pulsador, sensor o consigna'),('Decisión','Relés o PLC según el caso'),('Actuación','Contactor o permiso al variador')])]
for y,label,col,items in rows:
 para(label,36,y,730,10,bold=True,color=col)
 for i,(title,desc) in enumerate(items):
  x=36+i*265
  box(x,y+25,239,77,fill=colors.white)
  para(title,x+13,y+36,213,13,bold=True)
  para(desc,x+13,y+62,213,10,maxh=28)
  if i<2:
   C.setStrokeColor(col);C.setLineWidth(1.5)
   C.line(x+241,H-y-63,x+262,H-y-63)
   C.line(x+256,H-y-59,x+262,H-y-63);C.line(x+256,H-y-67,x+262,H-y-63)
block('REALIMENTACIÓN','Estados, magnitudes y fallas permiten comprobar si la orden produjo el resultado. La HMI presenta información y órdenes según la arquitectura del ejercicio.',36,405,365,11)
block('PROTECCIÓN Y ENVOLVENTE','Protección de masas, resguardos, compatibilidad y ambiente condicionan el conjunto. Una función de seguridad requiere su propia arquitectura y validación.',432,405,365,11)
para('Referencias: M01 (unidades de motor), M02-M03 (variador), M04 (PLC), M05 (conjunto). La topología mostrada es una síntesis didáctica, no una prescripción de montaje.',36,522,770,9,color=MUTED)

# 09 - Families and regional context, proposal vs verified evidence.
page('Qué familias conviene representar','Aplicación al aprendizaje',
     'Clasificación funcional propuesta. Un gabinete real puede combinar varias de estas funciones.')
families=[
 ('Mando de motor','Pulsadores, contactores y protección; permite aprender orden, retención y enclavamiento.'),
 ('CCM','Agrupación de unidades de motor; vista por columna, unidad y circuito. Referencias V02 y V06.'),
 ('Variador','Orden de marcha, consigna y diagnóstico, con montaje específico del equipo. V07-V08.'),
 ('PLC / HMI','Entradas, secuencia, salidas y supervisión; seguir una señal completa. V09-V10.'),
 ('Instrumentación','Convertir una variable de proceso en una señal interpretable. V11.'),
 ('Distribución y servicios','Organización del conjunto, entradas, alimentación y protección. V03-V05.'),
]
for i,(title,txt) in enumerate(families):
 x=36+(i%2)*391;y=137+(i//2)*102
 box(x,y,379,91)
 para(title,x+13,y+10,353,12,bold=True,color=TEAL)
 para(txt,x+13,y+33,353,10.2,maxh=43)
box(36,457,770,83,fill=PALE)
para('Para Tarapacá: comenzar por bombeo auxiliar',49,468,740,13,bold=True)
para('QB documenta procesos mineros y servicios de agua; Collahuasi, transporte y tratamiento; SQM, operaciones de yodo y nitratos. Sirven como contexto para encargos de bombeo, correas e instrumentación. No acreditan un modelo de tablero ni su frecuencia de demanda. Fuentes R01-R03, pág. 18.',49,491,740,10,maxh=40)

# 10 - Fabrication/site installation.
page('Del encargo a la entrega','Montaje e instalación',
     'Montar el gabinete en taller e instalarlo en campo son etapas diferentes del mismo proyecto.')
for i,(num,title,desc,evidence) in enumerate(DATA['workflow']):
 x=36+(i%2)*391;y=135+(i//2)*100
 box(x,y,379,89)
 para(num,x+12,y+10,28,15,bold=True,color=TEAL)
 para(title,x+48,y+11,318,12,bold=True)
 para(desc,x+48,y+33,318,9.3,maxh=28)
 para(evidence,x+48,y+63,318,8.6,color=MUTED,maxh=22)

# 11 - Diagnosis and maintenance.
page('Cómo enseñar diagnóstico y reparación','Método del ejercicio',
     'La corrección debe responder a una causa demostrada y terminar en una prueba repetible.')
steps=[('1. Observar','Registrar el síntoma, modo de operación e historial; distinguir orden, señal y resultado.'),
       ('2. Formular','Elegir una hipótesis y anticipar qué evidencia la confirmaría o descartaría.'),
       ('3. Comprobar','Seguir el esquema y consultar estados o instrumentos virtuales; registrar el dato.'),
       ('4. Corregir','Modificar la conexión, configuración o componente que explica la falla del caso.'),
       ('5. Repetir','Volver a las condiciones iniciales, probar la función y documentar el resultado.')]
for i,(t,desc) in enumerate(steps):
 y=136+i*71
 box(36,y,468,62)
 para(t,49,y+9,150,11.5,bold=True,color=TEAL)
 para(desc,191,y+9,300,10,maxh=43)
box(524,136,282,346,fill=PALE)
para('La evidencia de mantenimiento',540,152,250,15,bold=True)
para('El registro debe conservar fecha, condición observada, comprobación, intervención y resultado. La periodicidad real depende del equipo, uso y ambiente; no se inventa un intervalo universal.<br/><br/>En campo, la intervención corresponde a personal competente y al procedimiento de aislamiento aplicable. Los instrumentos de este taller son virtuales.<br/><br/>No premiar un rearme reiterado, puentear protecciones o subir umbrales para ocultar la falla.',540,202,250,11,maxh=250)
para('Base: M01, pág. 85-88; M02, mantenimiento; M05, anexo 2.3. Los pasos y la evaluación son una propuesta educativa.',36,510,770,9.5,color=MUTED)

# 12-15 - Four cases per page.
for start in range(0,16,4):
 page('Fallas que se pueden convertir en ejercicios','Diagnóstico '+str(start//4+1)+' / 4',
      'Causas posibles para un escenario definido; el síntoma por sí solo no demuestra cuál ocurrió.')
 for j,f in enumerate(DATA['faults'][start:start+4]):
  x=36+(j%2)*391;y=134+(j//2)*206; w=379
  box(x,y,w,195)
  para(f['id']+'  /  '+f['family'],x+12,y+10,w-24,9,bold=True,color=TEAL)
  h=para(escape(f['symptom']),x+12,y+28,w-24,12,bold=True,maxh=33)
  ty=y+31+h
  for label,key in [('Hipótesis','hypothesis'),('Comprobar','virtual_check'),('Corregir','simulated_correction'),('Aceptar','acceptance')]:
   h=para('<b>'+label+':</b> '+escape(f[key]),x+12,ty,w-24,9,leading=11.4,maxh=35)
   ty+=h+4
  refs=[]
  for sid in f['sources']:
   pp=f['source_pages'].get(sid,[])
   refs.append(sid+(' p. '+','.join(map(str,pp)) if pp else ''))
  para('Base: '+escape('; '.join(refs))+' · escenario propuesto',x+12,y+179,w-24,7.5,color=MUTED,maxh=12)

# 16 - Implementation brief.
page('Cómo incorporarlo a modo.','Propuesta de implementación',
     'Ampliar el laboratorio existente, conservar sus proyectos e integrar el trabajo sin conexión.')
columns=[(36,'Escena y documentos',[
 ('Vistas coordinadas','Placa, puerta, esquema y campo. Seleccionar un equipo debe localizar sus bornes y señales.'),
 ('Datos de montaje','Dimensiones, soporte, fijación y zonas de reserva provienen del perfil elegido.'),
 ('Conexionado','Separar extremos eléctricos y recorrido físico. Añadir ID de hilo, etiqueta, borne y terminación.'),
 ('Expediente','Lista de materiales y conexiones, mapa de E/S y registro de pruebas del ejercicio.')]),
 (432,'Aprendizaje y rendimiento',[
 ('Primera experiencia','Una bomba auxiliar; después dos bombas con alternancia, PLC/HMI y variante con variador.'),
 ('Evaluación visible','Comprobar montaje, conexión y comportamiento por separado; explicar qué no está modelado.'),
 ('Representación ligera','2D/SVG; mover la cámara no debe recalcular el circuito. Usar reglas cuando cambien datos.'),
 ('Viaje sin conexión','Recursos propios y casos locales. Preparación explícita del paquete; probar reapertura y exportación offline.')])]
for x,title,items in columns:
 para(title,x,138,365,16,bold=True,color=TEAL)
 y=176
 for t,desc in items:
  h=para(t,x,y,365,11,bold=True)
  h2=para(desc,x,y+h+4,365,10.5,maxh=43)
  y+=h+h2+18
box(36,484,770,60,fill=PALE)
para('Criterio de salida de la primera entrega',49,494,740,11,bold=True)
para('Un encargo completo: entender, montar, cablear, detectar una falla y exportar evidencia. Validar fluidez en móvil y escritorio con el mismo caso, sin declarar mejoras de rendimiento antes de medirlas.',49,514,740,10,maxh=27)

# 17 - Manual source registry.
page('Documentos técnicos verificados','Índice de fuentes',
     'Páginas indicadas = posición en el PDF local. Consultar siempre el equipo, edición e idioma correspondientes.')
short_titles={'M01':'Rockwell - CENTERLINE 2500','M02':'Schneider - instalación ATV630/650','M03':'Schneider - programación ATV600','M04':'Siemens - S7-1200 G2','M05':'SEC - RIC N.º 02: tableros','M06':'Rittal - gabinete VX SE y accesorios','M07':'Emerson - Rosemount 3051 HART'}
pages={'M01':'12, 67, 85-88','M02':'118, 160, 233, 236-238','M03':'235, 238-239, 672, 687','M04':'19, 32, 38-39, 245-246','M05':'18 (anexo 2.3)','M06':'6 y accesorios','M07':'17-18, 78, 95'}
for i,sid in enumerate(short_titles):
 s=BY[sid];y=133+i*55
 box(36,y,770,49)
 para(sid+'  '+short_titles[sid],48,y+7,390,10.5,bold=True)
 para(escape(s['edition_verified'])+' | '+s['language'].upper(),48,y+26,425,8.4,color=MUTED)
 para('Páginas: '+pages[sid],490,y+7,302,9)
 link('Documento oficial',s.get('page',s['url']),490,y+26,302,8.4)
para('M07: el enlace contiene “en”, pero el archivo recibido está en alemán, Rev BF de febrero de 2024. No se le atribuye otra revisión. Los archivos guardados tienen tamaño y SHA-256 en fuentes.json.',36,525,770,8.5,color=MUTED,maxh=23)

# 18 - Web imagery and regional context.
page('Imágenes, contexto y alcance','Fuentes y uso',
     'Documentación pública consultada el 25/10/2026. Fotografías y figuras conservan los derechos de sus titulares.')
web=[
 ('F01, F02, F06','Eiffage Énergie Systèmes - cableado e instalación industrial',BY['F01']['page']),
 ('F03','Rockwell - caso de CCM Boral, Charlton, Australia',BY['F03']['page']),
 ('F04, F05','Rittal - sistema VX25 Ri4Power; visuales comerciales',BY['F04']['page']),
 ('Q01-Q03','Schneider - OHF, USF y vibración de contactores (enlaces en JSON)',DATA['support_sources'][0]['url']),
 ('R01','Teck - procesos y servicios de Quebrada Blanca','https://www.teck.com/operations/chile/operations/quebrada-blanca/quebrada-blanca'),
 ('R02','Collahuasi - inventario GEI 2019; referencia histórica de procesos','https://www.collahuasi.cl/wp-content/uploads/2020/10/collahuasi-inventario-de-gei-2019.pdf'),
 ('R03','SQM Yodo Nutrición Vegetal - presencia / Nueva Victoria','https://sqm-ynv.com/sqmeninfografias/presencia.html'),
]
for i,(id,title,url) in enumerate(web):
 y=139+i*40
 para(id,36,y,92,9.5,bold=True,color=TEAL)
 link(title,url,136,y,670,10)
box(36,437,770,105,fill=PALE)
para('Qué queda pendiente antes de publicar el taller',49,448,740,13,bold=True)
para('Obtener material autorizado de un tablero local y validar un caso con un docente o profesional. Confirmar fichas y esquemas por referencia antes de fijar bornes, cotas o parámetros. Crear ilustraciones propias para la aplicación o gestionar la licencia de las imágenes.<br/><br/>Este dossier prepara la implementación; no modifica el simulador, no certifica un conjunto y no acredita marcas o modelos usados por una faena específica.',49,474,740,10,maxh=62)

C.save()
(ROOT/'qa'/'layout.json').write_text(json.dumps({'pages':PAGES,'text_bounds':BOUNDS,'output':str(OUT)},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{OUT}\n{len(PAGES)} páginas. {OUT.stat().st_size:,} bytes. Sin desbordes de texto en las cajas controladas.')
