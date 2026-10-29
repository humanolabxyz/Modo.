// Estado del programa de una placa y qué se puede hacer con él (con o sin conexión).
import {sha256} from '../sha256.ts';
import type {Firmware} from '../../project/types.ts';

export type FirmwareStatus = 'none' | 'fresh' | 'stale' | 'imported';
export const hashSource = sha256;

type Artifact = NonNullable<Firmware['artifact']>;
/** Estado de un artefacto frente al código que se ve en el editor. */
export function artifactStatus(art: Artifact | undefined, currentHash: string): FirmwareStatus {
  if (!art) return 'none';
  if (art.origin === 'hex-import') return 'imported'; // el .hex importado manda: el texto del editor no se usa
  return art.sourceHash === currentHash ? 'fresh' : 'stale';
}
export const firmwareStatus = (fw: Firmware | undefined, currentHash: string): FirmwareStatus => artifactStatus(fw?.artifact, currentHash);

/** ¿Se puede ejecutar? Con `stale` no: el estudiante vería correr un programa que no es el que tiene escrito. */
export const canRun = (status: FirmwareStatus) => status === 'fresh' || status === 'imported';

export type Advice = {canCompile: boolean; run: 'run' | 'recompile' | 'compile'; message: string};
/** Texto para el estudiante según haya o no servicio de compilación. */
export function advice(status: FirmwareStatus, compilerAvailable: boolean): Advice {
  if (status === 'imported') return {canCompile: compilerAvailable, run: 'run', message: 'Se ejecuta el programa importado (.hex). El texto del editor no se usa hasta que compiles.'};
  if (status === 'fresh') return {canCompile: compilerAvailable, run: 'run', message: compilerAvailable ? 'Compilado: coincide con el código del editor.' : 'Sin conexión con el compilador: se ejecuta el programa ya compilado, que coincide con tu código.'};
  const need = status === 'stale' ? 'recompile' : 'compile';
  const first = status === 'stale' ? 'El código cambió desde la última compilación: hay que recompilar.' : 'Todavía no hay un programa compilado.';
  return {canCompile: compilerAvailable, run: need, message: compilerAvailable ? first : `${first} No hay servicio de compilación: importa un .hex del Arduino IDE (Programa → Exportar binario compilado).`};
}
