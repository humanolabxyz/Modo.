import {panelElectrical} from './panelElectrical';
import {relayIds,type RelayState,type SimulationInput} from './simulation';
import type {BananaCable} from './practice';
/** Tensión real sobre cada bobina y piloto, para las fallas que bajan la tensión sin abrir el circuito (falso contacto, contacto sucio, secundario bajo).
 *  El modelo lógico decide por topología; con una de estas fallas se le pide además que la tensión alcance para cerrar. */
export function controlVoltages(wires:BananaCable[],input:SimulationInput,relays:RelayState,timed:readonly string[]){
 const net=panelElectrical(wires,input,relays,timed);
 return {
  relay:Object.fromEntries(relayIds().map(id=>[id,net.voltage(`${id}:A1`,`${id}:A2`)])) as Record<string,number|null>,
  pilot:[1,2,3,4].map(n=>net.voltage(`BOTONERAS:PILOTO_${n}`,'BOTONERAS:N'))
 };
}
