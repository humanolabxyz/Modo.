/** RTU training subset: bytes, CRC16, function 05 and read holding registers 03. No vendor project emulation. */
export function crc16(bytes:readonly number[]){let crc=0xffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc&1)?(crc>>>1)^0xa001:crc>>>1;}return crc&0xffff;}
export const frame=(data:number[])=>{const crc=crc16(data);return [...data,crc&255,crc>>>8];};
export const hex=(bytes:readonly number[])=>bytes.map(n=>n.toString(16).padStart(2,'0').toUpperCase()).join(' ');
export function validFrame(bytes:readonly number[]){return bytes.length>=4&&bytes.every(n=>Number.isInteger(n)&&n>=0&&n<=255)&&crc16(bytes.slice(0,-2))===(bytes.at(-2)!|(bytes.at(-1)!<<8));}
export type SerialSetup={clientBaud:number;serverBaud:number;destination:number;server:number;clientParity:string;serverParity:string;clientStop:number;serverStop:number;wired:boolean};
export function transaction(setup:SerialSetup,request:number[],coil:boolean,allowedAddress=0){
 const result=(reason:string,response:number[]=[] ,next=coil)=>({ok:!!response.length&&response[1]<128,reason,response,coil:next});
 if(!setup.wired)return result('Sin camino eléctrico válido: revisar continuidad y aislamiento.');
 if(setup.clientBaud!==setup.serverBaud||setup.clientParity!==setup.serverParity||setup.clientStop!==setup.serverStop)return result('Timeout: formato serie incompatible (velocidad, paridad o bits de parada).');
 if(!validFrame(request))return result('Trama descartada: CRC16 incorrecto; la salida conserva su estado.');
 if(request[0]!==setup.server||request[0]!==setup.destination||request[0]===0)return result('Timeout: el destinatario no responde a esa dirección unicast.');
 if(request.length!==8)return result('Longitud de trama no admitida.');
 const fn=request[1],address=(request[2]<<8)|request[3],data=(request[4]<<8)|request[5];
 if(address!==allowedAddress)return result('Excepción 02: dirección de dato no disponible.',frame([request[0],fn|128,2]));
 if(fn===5){if(data!==0&&data!==0xff00)return result('Excepción 03: valor de bobina inválido.',frame([request[0],0x85,3]));return result('Respuesta válida: escritura de bobina confirmada.',request.slice(),data===0xff00);}
 if(fn===3&&data!==1)return result('Excepción 03: este banco admite un registro por lectura.',frame([request[0],0x83,3]));
 if(fn===3&&data===1)return result('Respuesta válida: registro de estado leído.',frame([request[0],3,2,0,coil?1:0]));
 return result('Excepción 01: función no implementada en este banco.',frame([request[0],fn|128,1]));
}
