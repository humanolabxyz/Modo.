# Licencias, autoría y procedencia (Etapa 6)

## Regla aplicada

Solo entra a `public/` un modelo cuya licencia **consta por escrito dentro de su propio paquete**. Que un archivo se haya descargado gratis no se toma como permiso de uso comercial ni de redistribución. Lo que no tiene licencia verificable queda fuera hasta que se aclare.

## Registro por fuente

| Fuente | Autor | Licencia | Evidencia | Estado | Redistribución del original |
|---|---|---|---|---|---|
| `drive-download-…194644Z-1-001` · LowPoly Models (cultivos y plantas, 102 modelos) | Quaternius | CC0 1.0 Universal | `License.txt` del paquete (texto: «CC0 1.0 Universal (CC0 1.0) Public Domain Dedication», enlace a creativecommons.org/publicdomain/zero/1.0/) | **Usado** (palmas, cítricos, cactus, tomate) | Sin restricción por la licencia. El kit **no** se copia al repositorio ni al despliegue. |
| `drive-download-…194737Z-1-001` · LowPoly Models (granja, 13 modelos) | Quaternius | CC0 1.0 Universal | Ídem | **Usado** (granero, molino, cerca) | Ídem |
| `drive-download-…194800Z-1-001` · Ultimate Platformer Pack (63 modelos) | Quaternius | CC0 1.0 Universal | Ídem | **Usado parcialmente** (rocas y arbustos, con paleta lisa; texturas pintadas no incorporadas) | Ídem |
| `drive-download-…194858Z-1-001` · Farm Animals Pack (7 animales) | Quaternius | CC0 1.0 Universal | `License.txt` (indica además «Farm Animals Pack was created by Quaternius» como crédito opcional) | No usado (sin entidad de ganadería) | Ídem |
| `Ground037_2K-JPG/` | Desconocido | **Desconocida** | Sin `License.txt`, sin URL, sin créditos. El nombre sigue el patrón de ambientCG (que publica en CC0), pero eso es una suposición | **No usado, no copiado** | No se debe redistribuir hasta confirmar |
| `model (2).glb` … `model (6).glb` | Desconocido | **Desconocida** | Cabecera `generator: 3dassets.dev ingest`; sin licencia ni autor; son escenas completas | **No usados, no copiados** | No se deben redistribuir hasta confirmar |

## Lo que no se pudo verificar

- Los paquetes llegaron como descargas de Google Drive (`drive-download-…`). **No se comprobó contra la página original del autor** que el `License.txt` corresponda a la versión publicada hoy; la licencia verificada es la declarada dentro de cada paquete.
- El plan de consolidación (decisión D7) dejaba Quaternius fuera de `public/` hasta resolver «las condiciones de distribución» y pedía reevaluarlo en la Etapa 6 con CC0 primero. Los `License.txt` declaran CC0 sin condiciones, y con ese fundamento se integraron 18 modelos. **Si prefieres confirmar la licencia en la página de Quaternius antes de publicar, basta no desplegar: el interruptor `?modelos=off` y el respaldo procedural mantienen el simulador funcionando sin ningún modelo.**
- CC0 no exige atribución; se acredita de todos modos en `public/agro/models/CREDITOS.txt` (generado por `tools/agro-assets/report.mjs`).

## Modificaciones hechas a los originales (siempre sobre copias)

| Operación | Qué se hizo | Dónde |
|---|---|---|
| Conversión | `.blend` → `.glb` con Blender 4.4 en modo sin interfaz, 185 de 185 correctos | `public/agro/_galeria/` (local, ignorado por Git y por Vercel) |
| Simplificación | Colapso de aristas al 45–75 % de triángulos en 6 modelos pesados (tomate 3 y 4, palma, cítrico, cactus) | `public/agro/models/` |
| Color | Paleta lisa en rocas y arbustos (la textura pintada del paquete no se incorpora); atenuación de saturación en granero, molino y cerca | `library.ts` (campos `palette` / `tone`) |
| Normalización | Escala, giro y pivote al cargar, sin tocar el archivo | `models/normalize.ts` |
| Fusión | Una malla por material al cargar (menos llamadas de dibujo) | `models/loader.ts` |

## Archivos que viajan con la aplicación

18 GLB (781 KB) y `CREDITOS.txt` en `public/agro/models/`. La galería de candidatos (13 MB, 185 GLB) **no se publica**: `public/agro/_galeria/` está en `.gitignore` y `.vercelignore`, y se regenera con `tools/agro-assets/`.
